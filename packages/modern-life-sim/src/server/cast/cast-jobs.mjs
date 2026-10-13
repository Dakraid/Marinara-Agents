// Cast job board, job assignment and work outfits
import { jobHolders, openTownJobs, townJobById, townJobs } from "../jobs/town-jobs.mjs";
import {
  applyJobToWeek,
  applyWorkCellsToWeek,
  clipOutfitText,
  describeWorkFromHomeHours,
  jobChoiceId,
  likeliestJobForCells,
  resolveJobChoice,
} from "../jobs/job-week.mjs";
import { RESIDENCE_UPGRADE } from "../housing/residence-units.mjs";
import { nextFreeUnit } from "../housing/residences.mjs";
import { seasonLookUrl } from "../characters/season-outfits.mjs";
import { activeModules, firstModuleHook } from "../modules/module-registry.mjs";
import { workingHome, workingNow } from "./working-now.mjs";
import { workSpritesOn } from "./outfits.mjs";
import { characterOf, nameFor, sharesYourDoor } from "../game.mjs";

function jobsView(state) {
  let holders = jobHolders(state.characters);
  return {
    list: townJobs(state.town).map((job) => {
      let held = (holders[job.id] ?? []).map((holderId) => ({
        id: holderId,
        name: nameFor(state, characterOf(state, holderId)),
      }));
      return {
        id: job.id,
        place: job.place,
        placeName: job.placeName,
        title: job.title,
        shift: job.shift,
        clothes: job.clothes,
        pay: job.pay,
        ...(job.boss
          ? {
              boss: true,
            }
          : {}),
        holders: held,
        // Only a boss job is ever full: everyone else can share a job.
        holder: job.boss ? (held[0] ?? null) : null,
      };
    }),
    who: Object.fromEntries(state.characters.map((character) => [character.id, jobChoiceId(character.job) ?? ""])),
    titles: Object.fromEntries(
      state.characters
        .filter((character) => character.job?.home)
        .map((character) => [character.id, character.job.title ?? ""]),
    ),
    no: jobBlocks(state),
  };
}
function jobBlocks(state) {
  if (!activeModules(state).length) {
    return {};
  }
  let blocks = {};
  for (let character of state.characters) {
    for (let job of townJobs(state.town)) {
      let why = jobWhy(state, character.id, job);
      if (why) {
        (blocks[character.id] ??= {})[job.id] = why;
      }
    }
  }
  return blocks;
}
function workOf(state, characterId) {
  let character = characterOf(state, characterId),
    job = character?.job && typeof character.job == "object" ? character.job : null;
  if (!job) {
    return null;
  }
  if (job.out) {
    return {
      out: true,
      outfit: character.workOutfit ?? "",
    };
  }
  if (job.home) {
    return {
      home: true,
      title: job.title ?? "",
      shift: describeWorkFromHomeHours(character.week),
      now: workingHome(state, character),
    };
  }
  let townJob = townJobById(state.town, job.id),
    title = job.title || townJob?.title || "",
    place = townJob?.placeName || job.place || "";
  return !title || !place
    ? null
    : {
        id: job.id,
        title: title,
        place: place,
        shift: townJob?.shift ?? "",
        outfit: character.workOutfit ?? "",
        sprite: character.workLook?.url
          ? {
              url: seasonLookUrl(state, character.workLook),
              ...(character.workLook.own
                ? {
                    own: true,
                  }
                : {}),
            }
          : character.workLook?.error
            ? {
                error: character.workLook.error,
              }
            : null,
        now: workingNow(state, character),
        sprites: workSpritesOn(state),
        rule: !!state.rules?.workOutfits,
        asked: !!character.workAsked,
      };
}
function setJob(state, characterId, jobId, { title = "" } = {}) {
  let character = characterOf(state, characterId);
  if (!character) {
    return {
      ok: false,
      reason: "They are not in this life.",
    };
  }
  let choiceId = String(jobId ?? "").trim(),
    job =
      !choiceId || choiceId === "none"
        ? null
        : resolveJobChoice(
            {
              id: choiceId,
              title: title,
            },
            state.town,
            {
              free: openTownJobs(state.town, state.characters, {
                except: characterId,
              }),
            },
          );
  if (choiceId && choiceId !== "none" && !job) {
    return {
      ok: false,
      reason: "That job is not free in this town.",
    };
  }
  let why = jobWhy(state, characterId, job);
  if (why) {
    return {
      ok: false,
      reason: why,
    };
  }
  let townJob = job?.id ? townJobById(state.town, job.id) : null,
    changed = jobChoiceId(character.job) !== jobChoiceId(job),
    wasBoss = !!(character.job?.id && townJobById(state.town, character.job.id)?.boss);
  character.job = job;
  character.week = applyJobToWeek(character.week, townJob ?? job);
  let moved =
    wasBoss !== !!townJob?.boss &&
    !character.residence?.withYou &&
    !sharesYourDoor(state, character) &&
    !(character.rich && !townJob?.boss)
      ? moveForBossJob(state, character, !!townJob?.boss)
      : null;
  if (changed) {
    character.workOutfit = job && !job.home ? (townJob?.clothes ?? character.workOutfit ?? "") : "";
    if (!character.workLook?.own) {
      character.workLook = null;
    }
  }
  return {
    ok: true,
    repaint: changed && !!townJob && !!character.workOutfit && !character.workLook?.own,
    ...(moved
      ? {
          moved: moved,
        }
      : {}),
  };
}
var jobWhy = (state, characterId, job) =>
  job?.id
    ? String(
        firstModuleHook(state, "jobWhy", characterId, {
          id: job.id,
          place: job.place,
          title: job.title,
        }) ?? "",
      )
    : "";
function dropRefusedJobs(state, characterIds = [], notes = null) {
  let dropped = [];
  for (let character of state.characters.filter(
    (character2) => characterIds.includes(character2.id) && character2.job?.id,
  )) {
    let why = jobWhy(state, character.id, character.job);
    if (why) {
      notes?.push(`${character.name} has no job for now. ${why}`);
      character.job = null;
      character.week = applyJobToWeek(character.week, null);
      character.workOutfit = "";
      dropped.push(character.id);
    }
  }
  return dropped;
}
function moveForBossJob(state, character, upgrade) {
  let place = character.residence?.place;
  if (!place) {
    return null;
  }
  let target = upgrade ? RESIDENCE_UPGRADE[place] : HUMBLER_HOME[place];
  if (!target || target === place) {
    return null;
  }
  let taken = [
    ...state.characters
      .filter((character2) => character2.residence?.place === target)
      .map((character2) => character2.residence.unit),
    ...(state.residence?.place === target ? [state.residence.unit] : []),
  ];
  character.residence = {
    place: target,
    unit: nextFreeUnit(target, taken),
  };
  return {
    place: target,
    unit: character.residence.unit,
  };
}
var HUMBLER_HOME = {
  tower: "apartments",
  mansions: "houses",
};
function repairWork(state, characterId, cells = []) {
  let character = characterOf(state, characterId);
  if (!character) {
    return {
      ok: false,
    };
  }
  if (((character.workChecked = true), !cells.length)) {
    return {
      ok: true,
      changed: false,
    };
  }
  let job = character.job?.id ? townJobById(state.town, character.job.id) : null,
    took = false;
  if (!character.job?.id && !character.job?.out && !character.job?.home) {
    let job2 = likeliestJobForCells(
      cells,
      openTownJobs(state.town, state.characters, {
        except: characterId,
      }).filter((job3) => !jobWhy(state, characterId, job3)),
    );
    if (job2) {
      character.job = {
        id: job2.id,
        place: job2.place,
        title: job2.title,
      };
      character.workOutfit = character.workOutfit || job2.clothes || "";
      if (!character.workLook?.own) {
        character.workLook = null;
      }
      job = job2;
      took = true;
    } else {
      character.job = {
        out: true,
      };
    }
  }
  character.week = applyWorkCellsToWeek(character.week, cells, {
    job: job,
    fromHome: !!character.job?.home,
  });
  return {
    ok: true,
    changed: true,
    took: took,
    repaint: took && !!character.workOutfit,
  };
}
function setWorkOutfit(state, characterId, text) {
  let character = characterOf(state, characterId);
  if (!character?.job) {
    return {
      ok: false,
      reason: "They have no job.",
    };
  }
  if (character.job.home) {
    return {
      ok: false,
      reason: "They work from home, in their own clothes.",
    };
  }
  let outfit = clipOutfitText(text);
  return outfit
    ? ((character.workOutfit = outfit),
      character.workLook?.own || (character.workLook = null),
      {
        ok: true,
      })
    : {
        ok: false,
        reason: "Say what they wear.",
      };
}
function keepWorkPicture(state, characterId, { url = null, ref = null, clean = null, error = "", own = false } = {}) {
  let character = characterOf(state, characterId);
  if (character) {
    if (!own && character.workLook?.own) {
      delete character.workAsked;
      return;
    }
    character.workLook = url
      ? {
          url: url,
          ref: ref,
          at: state.minutes,
          ...(own
            ? {
                own: true,
              }
            : {}),
          ...(clean?.url
            ? {
                clean: clean,
              }
            : {}),
        }
      : {
          error: String(error).slice(0, 200),
        };
    delete character.workAsked;
  }
}

export { dropRefusedJobs, jobWhy, jobsView, keepWorkPicture, repairWork, setJob, setWorkOutfit, workOf };
