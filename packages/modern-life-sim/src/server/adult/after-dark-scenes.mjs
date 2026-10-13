// After dark: cast-on-cast scenes written in background, watching, peeking, joining or being seen
import { formatDateTime } from "../time/clock.mjs";
import { JOBS_BY_PLACE } from "../jobs/job-catalog.mjs";
import { defineEvent } from "../events/event-registry.mjs";
import { addToEventCast } from "../events/event-cast.mjs";
import { adjustBondAxis, bondSummary } from "../relationships/bonds.mjs";
import { splitTextIntoChunks } from "../scenes/text-helpers.mjs";
import { CLAIM_PHRASES } from "../scenes/free-acts.mjs";
import { SECOND_PERSON_RULE } from "../scenes/scene-config.mjs";
import {
  HERE_NOW_LINE,
  createScene,
  describeScenePerson,
  formatSceneLog,
  normalizePicture,
  picturePromptRule,
  settingBlock,
} from "../scenes/scene-engine.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { FACT_ACT_PHRASES } from "../network/town-facts.mjs";
import { settingNoteFor } from "../cast/read-card.mjs";
import { PLACE_ACTIVITIES, registerModulePlace } from "../town/town-layout.mjs";
import { BACKGROUND_SUBJECTS } from "../images/backgrounds.mjs";
import { addMemory, memoriesInBudget } from "../people/people-sheet.mjs";
import { rememberPair } from "../relationships/pair-memories.mjs";
import { isAtActiveParty } from "../parties/party.mjs";
import { ROMANTIC_ACTS } from "../romance/romantic-acts.mjs";
import { NEGATIVE_ASKS, isPartner, settledPair } from "../romance/jealousy.mjs";
import { dressedNow } from "../cast/outfits.mjs";
import { HONEYMOONS } from "../romance/wedding.mjs";
import { registerMilestone } from "../milestones/milestone-availability.mjs";
import { seenOrTold } from "../relationships/cast-meets.mjs";
import { CLAIM_ACTS } from "../scenes/free-talk.mjs";
import {
  advanceTime,
  beginScene,
  bondOf,
  characterOf,
  goToPlace,
  hasMet2,
  isNpc,
  keyImageFor,
  keyImagesOn,
  logNote,
  nameFor,
  sharesYourDoor,
} from "../game.mjs";
import {
  BEAT_PHASE_LABELS,
  CLUB_DANCE_MILESTONE,
  CLUB_JOBS,
  CLUB_PLACE,
  CLUB_SHOW_ACTIVITY,
  CLUB_TALK_CHOICES,
  CLUB_TALK_MILESTONE,
  HOTEL_PLACE,
  INTIMATE_BEAT_COUNT,
  INTIMATE_LEADUP_TURNS_MAX,
  PRIVATE_DANCE_TURNS,
  beatPhaseOf,
  explicitPassagePlan,
  pictureBeatsFor,
} from "./tuning.mjs";
import { timeOfDayPhrase } from "./consent.mjs";
import { INTIMACY_WAY_AXES, INTIMACY_WAY_LABELS } from "./intimacy-ways.mjs";
import { INTIMATE_BACKDROPS } from "./spots.mjs";
import {
  AFTER_DARK_SETUPS,
  CAUGHT_PEEKING_TRUST,
  CLUB_DANCE_FURTHER_RULE,
  CLUB_DANCE_ONLY_RULE,
  CLUB_DANCE_PASSAGES,
  DARK_REMEMBER_MAX,
  DARK_SEGMENT_RANGE,
  PASSAGE_WORDS_RULE,
  PEEK_LEADUP_PASSAGES,
  PEEK_MAX_EXTRA_PASSAGES,
  PEEK_MINUTES,
  PEEK_SEEN_EXTRA_PASSAGES,
  SEGMENT_LENGTH_RULE,
  bothMarkedAdult,
  cheatedPartnersOf,
  clubDarkHereNow,
  darkBackdrop,
  darkEntryById,
  darkEntryValid,
  darkPeekBlockedWhy,
  darkPlaceName,
  darkState,
  darkWhereLower,
  darkWherePrompt,
  isStrayPair,
  livesWithYou,
  neitherDarkBlocked,
  plainNameOf,
} from "./after-dark.mjs";
import { INTIMATE_MILESTONE_DEF, consentFor } from "./intimate-milestone.mjs";
import { intimacyWaysFor } from "./cast-intimacy.mjs";
import { unlockAdultBackdrop } from "./backdrops.mjs";
import { CLUB_TALK_HANDLERS, CLUB_VISIT_FACT } from "./club-jealousy.mjs";
import { PRIVATE_DANCE_FACT, PRIVATE_DANCE_HANDLERS } from "./club-dance.mjs";
import { AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE, INTIMATE_MILESTONE } from "./milestone-ids.mjs";

var afterDarkHttpError = (statusCode, message) =>
  Object.assign(new Error(message), {
    statusCode: statusCode,
  });
var isAfterDarkNpc = (state, characterId) => isNpc(state, characterId);
var afterDarkClubNote = (entry) =>
  entry.kind === "club" ? (entry.further ? CLUB_DANCE_FURTHER_RULE : CLUB_DANCE_ONLY_RULE) : null;
var isClubDanceOnly = (entry) => entry.kind === "club" && !entry.further;
var afterDarkDisplayName = (state, characterId) =>
  nameFor(
    state,
    characterOf(state, characterId) ?? {
      id: characterId,
      name: "someone",
    },
  );
var AFTER_DARK_SEGMENT_MAX = 420;
var afterDarkFades = (adult, entry) => (typeof entry.fade == "boolean" ? entry.fade : adult.detail === "fade");
var afterDarkPartnerOfPlayer = (state, entry) => {
  let partnerId = [entry.a, entry.b].find((characterId) => isPartner(state, characterId));
  return partnerId
    ? {
        partner: partnerId,
        other: partnerId === entry.a ? entry.b : entry.a,
      }
    : null;
};
function afterDarkCheatingPartner(state, entry) {
  let partnership = afterDarkPartnerOfPlayer(state, entry);
  return !partnership ||
    settledPair(state, partnership.partner, partnership.other) ||
    (isClubDanceOnly(entry) && partnership.partner === entry.a)
    ? null
    : partnership;
}
function afterDarkWaysPrompt(state, adult, characterIds) {
  let castIds = characterIds.filter((id) => !isAfterDarkNpc(state, id));
  if (!castIds.length) {
    return "";
  }
  let waysLine = (id) => {
      let ways = intimacyWaysFor(state, adult, id);
      return INTIMACY_WAY_AXES.map(
        (axis) => `${axis} ${ways[axis]} (${INTIMACY_WAY_LABELS[axis][ways[axis]].toLowerCase()})`,
      ).join(" \xB7 ");
    },
    likes = castIds.flatMap((id) => (adult.cast[id]?.likes ?? []).map((like) => `${id}: ${like.text}`)),
    limits = castIds.flatMap((id) =>
      (adult.cast[id]?.limits ?? []).filter((limit) => limit.stage !== "open").map((limit) => `${id}: ${limit.text}`),
    );
  return [
    `HOW EACH ONE IS IN THIS (by id): ${castIds.map((id) => `${id}: ${waysLine(id)}`).join(" \u2014 ")}. Let it lean to how each one is.`,
    likes.length ? `WHAT EACH ONE LIKES (id: what): ${likes.join(" \xB7 ")}.` : "",
    limits.length ? `THEIR LIMITS (id: what): ${limits.join(" \xB7 ")}. None of these happens between them.` : "",
  ].filter(Boolean).join(`
`);
}
function afterDarkBetweenThem(state, firstId, secondId, { club = false } = {}) {
  let pair = npcPairBetween(state, firstId, secondId),
    memories = pair ? memoriesInBudget(pair).map((memory) => `- ${memory.text}`) : [];
  return [
    pair
      ? `They are ${pair.kind === "couple" ? "a couple" : pair.kind}${pair.note ? ` (${pair.note})` : ""}.`
      : club
        ? "They do not know each other: a dancer and a customer."
        : "They know each other.",
    memories.length
      ? `What they remember of each other, oldest first:
${memories.join(`
`)}`
      : "",
  ].filter(Boolean).join(`
`);
}
function afterDarkTwoOfThem(state, firstId, secondId) {
  let describe = (characterId) => {
    let character = characterOf(state, characterId),
      person = isAfterDarkNpc(state, characterId) ? character : dressedNow(state, character);
    return `- ${characterId}: ${person.name}
${describeScenePerson(person, {
  tone: bondOf(state, characterId) ? bondSummary(bondOf(state, characterId)).archetype.tone : "",
  known: true,
})}`;
  };
  return `THE TWO OF THEM (by id):
${describe(firstId)}
${describe(secondId)}`;
}
function afterDarkSecretsPrompt(state, entry, { peek = false } = {}) {
  let partnership = afterDarkPartnerOfPlayer(state, entry),
    lines = [];
  if (partnership) {
    let partnerName = plainNameOf(state, partnership.partner),
      otherName = plainNameOf(state, partnership.other);
    lines.push(
      isStrayPair(state, entry)
        ? `${partnerName} is in a relationship with the player, who agreed that ${partnerName} can see other people: this is no secret from the player.`
        : entry.kind === "party"
          ? `${partnerName} is in a relationship with the player, who is at the party and saw ${partnerName} slip off with ${otherName}, but not what happens in the room.`
          : `${partnerName} is in a relationship with the player, who does not know about this.`,
    );
  }
  for (let cheated of cheatedPartnersOf(state, entry.a, entry.b)) {
    lines.push(
      `${plainNameOf(state, cheated.id)} is in a relationship with ${plainNameOf(state, cheated.partner)}, who does not know about this.`,
    );
  }
  if (entry.you === "home") {
    lines.push(
      peek
        ? "The player lives there too; they think the player is in another room, and keep quiet so the player does not hear."
        : "The player lives there too and is home, in another room: they keep quiet so the player does not hear.",
    );
  } else if (entry.you === "asleep") {
    lines.push("The player lives there too and is asleep in another room: they keep quiet.");
  } else if (entry.you === "out") {
    lines.push("The player lives there too, but is out.");
  }
  return lines.join(`
`);
}
function afterDarkPictureStretches(adult, entry) {
  let stretches = afterDarkFades(adult, entry)
      ? [INTIMATE_BEAT_COUNT - 1]
      : pictureBeatsFor(INTIMATE_BEAT_COUNT, adult.pictures),
    seenStretch = seenPictureStretch(entry),
    seenShots = entry.seenShots ?? [],
    seenAll = !seenShots.length || seenShots.some((shot) => !shot.part),
    seenParts = new Set(seenShots.map((shot) => (shot.part === "one" ? "peak" : shot.part)));
  return stretches.filter(
    (stretch) => stretch > seenStretch || !(seenAll || seenParts.has(beatPhaseOf(stretch, INTIMATE_BEAT_COUNT))),
  );
}
var afterDarkPictureLabel = (phase) =>
  BEAT_PHASE_LABELS[phase] ? `After dark \xB7 ${BEAT_PHASE_LABELS[phase]}` : "After dark";
function seenPictureStretch(entry) {
  if (!entry.seenPassage) {
    return 0;
  }
  let lead = afterDarkLeadPassages(entry),
    span = afterDarkPassageCount(entry) - lead;
  return span > 0 ? Math.floor((Math.max(0, entry.seenPassage - lead) * INTIMATE_BEAT_COUNT) / span) : 0;
}
function afterDarkPicturesInstructions(stretches, pictureRule, { seen = false, dance = false, fade = false } = {}) {
  let stretchList = stretches.map((stretch) => `${stretch} (${beatPhaseOf(stretch, INTIMATE_BEAT_COUNT)})`).join(", "),
    arcNote = dance
      ? `From its first move to the song's end, the private dance goes through ${INTIMATE_BEAT_COUNT} stretches, one after another: it starts, it builds, stretch ${INTIMATE_BEAT_COUNT - 1} is the dance at its most intense, stretch ${INTIMATE_BEAT_COUNT} is the after \u2014 it stays a dance.`
      : fade
        ? `From where they start getting intimate to the after, the scene goes through ${INTIMATE_BEAT_COUNT} stretches, one after another: it starts, it builds, stretch ${INTIMATE_BEAT_COUNT - 1} is the moment itself, stretch ${INTIMATE_BEAT_COUNT} is the after.`
        : `From where they start getting intimate to the after, the scene goes through ${INTIMATE_BEAT_COUNT} stretches, one after another: stretch 1, it begins; 2 to ${INTIMATE_BEAT_COUNT - 2}, the act itself, more intense each time; stretch ${INTIMATE_BEAT_COUNT - 1}, the climax; stretch ${INTIMATE_BEAT_COUNT}, the after.`;
  return [
    `\`pictures\`: the illustrations of this scene, one for each of these stretches: ${stretchList}. ${arcNote}`,
    `For each: \`stretch\` is its number; \`at\` is the number of the segment of \`lines\` (from 1${seen ? ", counting only the segments you write now" : ""}) where that stretch begins; \`prompt\` is the prompt an image model will paint that stretch from, AS it happens, with only the two of them, in English. You write each prompt following this:`,
    String(pictureRule ?? ""),
  ].join(`
`);
}
var AFTER_DARK_SPOT_ORIGINS = {
  cast: "They met up today, and it went on from there, right where they were.",
  stray:
    "They met up today, away from anyone who knows them, and it went on from there, right where they were. It is a secret.",
};
function afterDarkOrigin(state, entry) {
  if (entry.kind === "home" && npcPairBetween(state, entry.a, entry.b)?.kind !== "couple") {
    return AFTER_DARK_SETUPS.crush;
  }
  let kind = entry.kind === "stray" && isStrayPair(state, entry) ? "cast" : entry.kind;
  return (entry.spot && AFTER_DARK_SPOT_ORIGINS[kind]) || (AFTER_DARK_SETUPS[kind] ?? AFTER_DARK_SETUPS.cast);
}
function buildAfterDarkScenePrompt(state, adult, entry, { picture = false, seen = "" } = {}) {
  let [firstId, secondId] = [entry.a, entry.b],
    fade = afterDarkFades(adult, entry),
    stretches = picture ? afterDarkPictureStretches(adult, entry) : [],
    replyShape = `{"lines":[{"who":"narration","text":"\u2026"},{"who":"${firstId}","text":"\u2026"},{"who":"${secondId}","text":"\u2026"}],"remember":{"${firstId}":"\u2026","${secondId}":"\u2026"}${stretches.length ? `,"pictures":[${stretches.map((stretch) => `{"stretch":${stretch},"at":\u2026,"prompt":"\u2026"}`).join(",")}]` : ""}}`;
  return [
    {
      role: "system",
      content: [
        "Task: after-dark-scene",
        entry.you
          ? "You write a whole scene of a visual-novel life sim, in the third person: two people, alone, when the player is not in the room. The player is not in the scene and never learns of it."
          : "You write a whole scene of a visual-novel life sim, in the third person: two people, alone, when the player is not there. The player is not in it, is never mentioned and never learns of it.",
        "Both of them are adults, they want this, and nothing happens that either of them does not want.",
        afterDarkClubNote(entry),
        seen && entry.seenLines?.length
          ? "THE SCENE SO FAR is already written and stays exactly as it is, word for word. Write only what comes after it: go on from the very point where it stops, to the end and the after \u2014 never tell again what it already tells."
          : seen
            ? "It began as THE SCENE SO FAR says: keep that as it is, and write the whole scene from the start with it in."
            : isClubDanceOnly(entry)
              ? "From the start: the private dance, from its first move to the song's end \u2014 slow and close at first, building, at its most intense, then over \u2014 and the after, a few lines true to who they are."
              : fade
                ? "From the start: how they end up alone together, what they talk about, what leads to it; then the moment itself; and the after, a few lines true to who they are."
                : "From the start: how they end up alone together, what they talk about, what leads to it; then it begins, and the act itself, in full, more intense as it goes, to the climax; and the after, a few lines true to who they are.",
        fade
          ? "This life fades out: build up to the moment itself, fade out as it begins, and pick up a little later, in the after. Nothing explicit."
          : "This life writes all of it in full: as explicit as the scene calls for, true to who they are, in prose.",
        `Answer with JSON only, exactly: ${replyShape}`,
        `\`lines\`: ${seen && entry.seenLines?.length ? `only what is left, as many segments as it needs, from 3 to ${DARK_SEGMENT_RANGE[1]}` : `${DARK_SEGMENT_RANGE[0]} to ${DARK_SEGMENT_RANGE[1]} segments`}, mostly narration, with what they say; \`who\` is "narration", or the id of whoever speaks.`,
        SEGMENT_LENGTH_RULE,
        `\`remember\`: what each of them keeps of it, from their own side, in detail \u2014 what they did together and how it was for them. At most ${DARK_REMEMBER_MAX} characters each, by id.`,
        stretches.length
          ? afterDarkPicturesInstructions(stretches, picture, {
              seen: !!(seen && entry.seenLines?.length),
              dance: isClubDanceOnly(entry),
              fade: fade,
            })
          : null,
        `Write every line in ${state.settings?.language ?? "English"}.`,
      ].filter((part) => part !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${darkWherePrompt(state, entry)} \xB7 WHEN: ${formatDateTime(entry.at)}`,
        `HOW IT CAME ABOUT: ${afterDarkOrigin(state, entry)}`,
        settingBlock(settingNoteFor(state)),
        "",
        afterDarkTwoOfThem(state, firstId, secondId),
        "",
        "BETWEEN THEM:",
        afterDarkBetweenThem(state, firstId, secondId, {
          club: entry.kind === "club",
        }),
        afterDarkSecretsPrompt(state, entry),
        "",
        afterDarkWaysPrompt(state, adult, [firstId, secondId]),
        seen
          ? `
THE SCENE SO FAR:
${seen}`
          : "",
      ].filter((part) => part !== "").join(`
`),
    },
  ];
}
function checkAfterDarkReply(reply) {
  let lines = Array.isArray(reply?.lines) ? reply.lines : [];
  if (!lines.length) {
    return '"lines" is empty';
  }
  let badIndex = lines.findIndex((line) => typeof line?.text != "string" || !line.text.trim());
  return badIndex < 0 ? "" : `line ${badIndex + 1} of "lines" has no text`;
}
function parseAfterDarkLines(rawLines, speakerIds, max = DARK_SEGMENT_RANGE[1], starts = null) {
  let lines = [];
  for (let raw of Array.isArray(rawLines) ? rawLines.slice(0, max) : []) {
    starts?.push(lines.length);
    let speaker = String(raw?.who ?? "").trim();
    for (let chunk of splitTextIntoChunks(raw?.text, AFTER_DARK_SEGMENT_MAX)) {
      lines.push(
        speakerIds.includes(speaker)
          ? {
              who: "them",
              by: speaker,
              text: chunk,
            }
          : {
              who: "narration",
              text: chunk,
            },
      );
    }
  }
  return lines;
}
var clampAfterDarkMemory = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, DARK_REMEMBER_MAX);
function parseAfterDarkMemories(raw, ids) {
  return Object.fromEntries(ids.map((id) => [id, clampAfterDarkMemory(raw?.[id])]).filter(([, id]) => id));
}
async function writeAfterDarkScene(model, state, adult, entry, { picture = false, seen = "" } = {}) {
  let ids = [entry.a, entry.b],
    stretches = picture ? afterDarkPictureStretches(adult, entry) : [],
    { json: json } = await model.askJson(
      buildAfterDarkScenePrompt(state, adult, entry, {
        picture: picture,
        seen: seen,
      }),
      {
        maxTokens: stretches.length ? 8e3 : 6e3,
        task: "after-dark-scene",
        about: ids.map((id) => plainNameOf(state, id)).join(" & "),
        check: checkAfterDarkReply,
      },
    ),
    starts = [],
    lines = parseAfterDarkLines(json?.lines, ids, DARK_SEGMENT_RANGE[1], starts);
  if (!lines.length) {
    throw Object.assign(afterDarkHttpError(502, "Nothing came back."), {
      model: true,
    });
  }
  let seenCount = seen && entry.seenLines?.length ? entry.seenLines.length : 0;
  return {
    lines: lines,
    remember: parseAfterDarkMemories(json?.remember, ids),
    shots: placeAfterDarkShots(json?.pictures, stretches, starts, lines.length, seenCount),
  };
}
function placeAfterDarkShots(rawPictures, stretches = [], starts = [], lineCount = 0, offset = 0) {
  let pictures = Array.isArray(rawPictures) ? rawPictures : [],
    shots = [];
  for (let stretch of [...stretches].sort((left, right) => left - right)) {
    let raw = pictures.find((item) => Number(item?.stretch) === stretch),
      picture = normalizePicture(raw);
    if (!picture) {
      continue;
    }
    let atSegment = Number.isInteger(Number(raw.at)) ? Number(raw.at) : NaN,
      startLine = atSegment >= 1 && atSegment <= starts.length ? starts[atSegment - 1] : NaN,
      evenAt = Math.floor(((lineCount + offset) * (stretch - 1)) / INTIMATE_BEAT_COUNT) - offset,
      minAt = shots.length ? shots.at(-1).at + 1 : -offset,
      at = Math.min(
        Math.max(evenAt < 0 || Number.isNaN(startLine) ? evenAt : startLine, minAt),
        Math.max(0, lineCount - 1),
      );
    shots.push({
      stretch: stretch,
      part: beatPhaseOf(stretch, INTIMATE_BEAT_COUNT),
      at: at,
      picture: picture,
    });
  }
  return shots;
}
function storeAfterDarkScene(life, entry, written) {
  let seenLines = entry.seenLines ?? [];
  delete entry.seenLines;
  let shots = (written.shots ?? []).map((shot) => ({
    ...shot,
    at: shot.at + seenLines.length,
  }));
  Object.assign(entry, {
    lines: [...seenLines, ...written.lines],
    shots: shots,
    shotIds: entry.seenShots ?? entry.shotIds ?? [],
    picture: written.picture ?? entry.picture ?? null,
    status: "ready",
  });
  delete entry.seenShots;
  for (let [who, other] of [
    [entry.a, entry.b],
    [entry.b, entry.a],
  ]) {
    let memoryText = written.remember?.[who];
    if (memoryText) {
      if (((entry.remember[who] = memoryText), isAfterDarkNpc(life, who) || isAfterDarkNpc(life, other))) {
        let character = isAfterDarkNpc(life, who) ? characterOf(life, who) : null;
        if (character) {
          addMemory(character, {
            at: entry.at,
            text: memoryText,
            from: "after-dark",
          });
        }
      } else {
        rememberPair(life, who, other, {
          text: memoryText,
          from: "after-dark",
          by: who,
          at: entry.at,
        });
      }
    }
  }
}
function rememberPeekProgress(entry, scene) {
  Object.assign(entry, {
    seen: peekLogTranscript(scene),
    seenLines: scene.log.map(({ exchange: exchange, ...line }) => line),
    seenShots: scene.peek?.shots ?? [],
    seenPassage: scene.peek?.passage ?? 0,
  });
}
function clearPeekProgress(entry) {
  for (let key of ["seen", "seenLines", "seenShots", "seenPassage"]) {
    delete entry[key];
  }
}
function afterDarkBriefScene(life, entry, milestone) {
  let scene = createScene({
    kind: "milestone",
    characterId: entry.a,
    place: entry.place,
    at: life.minutes,
    event: milestone,
  });
  addToEventCast(scene, entry.b, {
    at: life.minutes,
    why: "there",
  });
  Object.assign(scene, {
    milestone: milestone,
    watching: {
      title: "",
      line: "",
    },
    about: {
      whole: true,
      dance: isClubDanceOnly(entry),
      fade: afterDarkFades(life.modules?.adult ?? {}, entry),
    },
  });
  return scene;
}
var WRITING_AFTER_DARK_LIVES = new Set();
var AFTER_DARK_INFLIGHT = new Map();
var afterDarkJobKey = (life, entry) => `${life.id}|${entry.id}`;
function trackAfterDarkJob(key, run) {
  let promise = run().finally(() => AFTER_DARK_INFLIGHT.delete(key));
  AFTER_DARK_INFLIGHT.set(key, promise);
  return promise;
}
var raceWithAbort = (promise, signal) =>
  signal
    ? Promise.race([
        promise,
        new Promise((resolve, reject) => {
          if (signal.aborted) {
            reject(
              Object.assign(new Error("Cancelled."), {
                cancelled: true,
              }),
            );
          }
          signal.addEventListener?.(
            "abort",
            () =>
              reject(
                Object.assign(new Error("Cancelled."), {
                  cancelled: true,
                }),
              ),
            {
              once: true,
            },
          );
        }),
      ])
    : promise;
async function prewriteAfterDarkScenes(host, life) {
  let adult = life.modules?.adult;
  if (!adult?.on || !adult.youAdult || !adult.afterDark || !adult.dark || WRITING_AFTER_DARK_LIVES.has(life.id)) {
    return;
  }
  let dueEntries = darkState(adult).list.filter(
    (entry) =>
      entry.status === "due" &&
      (entry.tries ?? 0) < 3 &&
      darkEntryValid(life, adult, entry) &&
      neitherDarkBlocked(life, adult, entry),
  );
  if (dueEntries.length) {
    WRITING_AFTER_DARK_LIVES.add(life.id);
    try {
      for (let entry of dueEntries) {
        if (!host.onScreen(life.id)) {
          break;
        }
        if (AFTER_DARK_INFLIGHT.has(afterDarkJobKey(life, entry))) {
          continue;
        }
        let written;
        try {
          written = await trackAfterDarkJob(afterDarkJobKey(life, entry), async () => {
            let picture = keyImagesOn(life)
              ? await host.briefFor(life, afterDarkBriefScene(life, entry, AFTER_DARK_MILESTONE))
              : false;
            return writeAfterDarkScene(host.modelFor(life), life, adult, entry, {
              picture: picture,
              seen: entry.seen ?? "",
            });
          });
        } catch (err) {
          if (err?.cancelled) {
            throw err;
          }
          await host.withLife(life.id, (draft) => {
            let stored = darkEntryById(draft.modules?.adult ?? {}, entry.id);
            if (stored) {
              stored.tries = (stored.tries ?? 0) + 1;
            }
          });
          continue;
        }
        await host.withLife(life.id, (draft) => {
          let stored = draft.modules?.adult ? darkEntryById(draft.modules.adult, entry.id) : null;
          if (
            stored &&
            stored.status === "due" &&
            darkEntryValid(draft, draft.modules.adult, stored) &&
            neitherDarkBlocked(draft, draft.modules.adult, stored)
          ) {
            storeAfterDarkScene(draft, stored, written);
          }
        });
      }
    } finally {
      WRITING_AFTER_DARK_LIVES.delete(life.id);
    }
  }
}
function assertNoSceneOpen(life) {
  if (life.scene) {
    throw afterDarkHttpError(
      400,
      life.scene.done ? "Finish what's on screen first." : "You are in the middle of a scene.",
    );
  }
}
async function watchAfterDarkNow(host, life, adult, entryId) {
  let entry = darkEntryById(adult, String(entryId ?? ""));
  if (
    !entry ||
    entry.kind !== "club" ||
    !clubDarkHereNow(life, entry) ||
    !darkEntryValid(life, adult, entry) ||
    darkPeekBlockedWhy(life, adult, entry)
  ) {
    throw afterDarkHttpError(400, "They are not there any more.");
  }
  assertNoSceneOpen(life);
  entry.status = "due";
  return watchAfterDark(host, life, adult, entry.id);
}
async function watchAfterDark(host, life, adult, entryId) {
  let entry = darkEntryById(adult, String(entryId ?? ""));
  if (
    !entry ||
    !["due", "ready"].includes(entry.status) ||
    !darkEntryValid(life, adult, entry) ||
    !neitherDarkBlocked(life, adult, entry)
  ) {
    throw afterDarkHttpError(400, "That is not there to watch.");
  }
  if ((assertNoSceneOpen(life), entry.status !== "ready")) {
    let jobKey = afterDarkJobKey(life, entry),
      written = await host.withModel(life.id, "It could not be written", async (signal) => {
        if (AFTER_DARK_INFLIGHT.has(jobKey)) {
          try {
            return await raceWithAbort(AFTER_DARK_INFLIGHT.get(jobKey), signal);
          } catch (err) {
            if (err?.cancelled || signal?.aborted) {
              throw err;
            }
          }
        }
        return trackAfterDarkJob(jobKey, async () => {
          let picture = keyImagesOn(life)
            ? await host.briefFor(life, afterDarkBriefScene(life, entry, AFTER_DARK_MILESTONE), signal)
            : false;
          return writeAfterDarkScene(host.sceneModel(life, signal), life, adult, entry, {
            picture: picture,
            seen: entry.seen ?? "",
          });
        });
      });
    storeAfterDarkScene(life, entry, written);
  }
  let scene = createScene({
    kind: "milestone",
    characterId: entry.a,
    place: entry.place,
    at: life.minutes,
    event: AFTER_DARK_MILESTONE,
  });
  addToEventCast(scene, entry.b, {
    at: life.minutes,
    why: "there",
  });
  let title = `${afterDarkDisplayName(life, entry.a)} & ${afterDarkDisplayName(life, entry.b)}`;
  Object.assign(scene, {
    milestone: AFTER_DARK_MILESTONE,
    by: "them",
    nameKnown: true,
    leavesAt: null,
    max: 0,
    phase: "result",
    choice: "yes",
    batch: entry.lines,
    log: entry.lines.map((line) => ({
      ...line,
      exchange: 1,
    })),
    done: true,
    endedBy: "accepted",
    remember: "",
    verdict: {
      accepted: true,
      headline: "It stays between them.",
      stamp: null,
    },
    watching: {
      title: title,
      line: `${afterDarkDisplayName(life, entry.a)} and ${afterDarkDisplayName(life, entry.b)}, ${entry.kind === "home" && !entry.spot ? "at home" : darkWhereLower(life, entry)}.`,
    },
    placeName: darkPlaceName(life, entry),
    remembers: [entry.a, entry.b]
      .filter((id) => entry.remember?.[id])
      .map((id) => ({
        id: id,
        name: afterDarkDisplayName(life, id),
        text: entry.remember[id],
      })),
    kept: {
      title: "YOU CAN WATCH IT AGAIN",
      line: "In AFTER DARK, on your phone",
    },
    about: {
      dark: entry.id,
      look: darkBackdrop(life, entry),
    },
  });
  unlockAdultBackdrop(adult, scene.about.look);
  life.scene = scene;
  entry.watched = true;
  if (darkState(adult).cut === entry.id) {
    darkState(adult).cut = null;
  }
  let shotAt = Math.floor(entry.lines.length * 0.6);
  if (entry.pictureId && !entry.shotIds?.length) {
    entry.shotIds = [
      {
        id: entry.pictureId,
        at: shotAt,
      },
    ];
  }
  if (entry.picture && !entry.pictureId && !entry.shots?.length) {
    entry.shots = [
      {
        stretch: INTIMATE_BEAT_COUNT - 1,
        part: "peak",
        at: shotAt,
        picture: entry.picture,
      },
    ];
  }
  let queued = [],
    leftover = [];
  for (let shot of entry.shots ?? []) {
    let imageId = keyImageFor(life, scene, {
      beat: "passage",
      picture: shot.picture,
      label: afterDarkPictureLabel(shot.part),
      place: scene.placeName,
    });
    if (imageId) {
      queued.push({
        id: imageId,
        at: shot.at,
      });
    } else {
      leftover.push(shot);
    }
  }
  if (queued.length) {
    entry.shotIds = [...(entry.shotIds ?? []), ...queued];
    if (!entry.pictureId) {
      entry.pictureId = queued[0].id;
    }
  }
  if (entry.shots) {
    entry.shots = leftover;
  }
  let shotIds = [...(entry.shotIds ?? [])].sort((a, b) => a.at - b.at);
  scene.pictures = shotIds.map((shot) => shot.id);
  scene.pictureFrom = Object.fromEntries(shotIds.map((shot) => [shot.id, shot.at]));
  for (let shot of queued) {
    await host.queueKey(life, shot.id);
  }
  return {
    watching: entry.id,
  };
}
var AFTER_DARK_DEFAULT_PASSAGES = PEEK_LEADUP_PASSAGES + PEEK_MAX_EXTRA_PASSAGES;
var afterDarkPassageCount = (entry) =>
  entry.of ??
  (isClubDanceOnly(entry)
    ? entry.fade
      ? 1
      : CLUB_DANCE_PASSAGES
    : entry.fade
      ? PEEK_LEADUP_PASSAGES + 1
      : entry.seenPassage || entry.status === "peek"
        ? PEEK_LEADUP_PASSAGES + PEEK_SEEN_EXTRA_PASSAGES
        : AFTER_DARK_DEFAULT_PASSAGES);
var afterDarkLeadPassages = (entry) => (isClubDanceOnly(entry) ? 0 : PEEK_LEADUP_PASSAGES);
var PEEK_DANCE_PART_NOTES = {
  start: "The dance starts: slow, close, building.",
  rise: "The dance goes on, closer and bolder, still building.",
  peak: "The dance at its most intense.",
  after: "The song is over: this is the after.",
};
var PEEK_INTIMATE_PART_NOTES = {
  start:
    "This passage: it begins \u2014 closeness, kisses, touching, clothes coming off. By its end they are into it; the next passage is already the act itself.",
  rise: "This passage: the act itself, already under way, in full \u2014 more intense than the passage before. It never goes back to the beginning or to undressing; the climax comes later.",
  peak: "This passage: the climax, in full. The after comes in the next passage.",
  after: "It is over: this is the after.",
};
function buildAfterDarkPeekPrompt(life, adult, entry, scene, { n: passage, picture = false } = {}) {
  let [idA, idB] = [entry.a, entry.b],
    total = afterDarkPassageCount(entry),
    lead = afterDarkLeadPassages(entry),
    isLast = passage >= total,
    fades = afterDarkFades(adult, entry),
    plan = isClubDanceOnly(entry)
      ? ""
      : explicitPassagePlan(total - lead, {
          lead: lead,
        }),
    passageNote = isClubDanceOnly(entry)
      ? `This is passage ${passage} of ${total} of the private dance. ${PEEK_DANCE_PART_NOTES[beatPhaseOf(passage, total)] ?? ""}`
      : passage <= lead
        ? `This is passage ${passage} of ${total}${plan ? `. ${plan} This one` : ""}: ${entry.kind === "club" ? "the private dance, before it goes further" : "what leads to it"}. ${passage === 1 ? (entry.kind === "club" ? "It is just starting." : "They are just getting there, alone \u2014 or so they think.") : "It is about to start; it does not go further yet."}`
        : `This is passage ${passage} of ${total}. ${plan ? `${plan} ` : ""}${PEEK_INTIMATE_PART_NOTES[beatPhaseOf(passage - lead, total - lead)] ?? ""}`,
    shape = `{"lines":[{"who":"narration","text":"\u2026"},{"who":"${idA}","text":"\u2026"}]${isLast ? `,"remember":{"${idA}":"\u2026","${idB}":"\u2026"}` : ""}${picture ? ',"picture":{"prompt":"\u2026"}' : ""}}`;
  return [
    {
      role: "system",
      content: [
        "Task: after-dark-peek",
        "You write one long passage of a scene in a visual-novel life sim: two people who think they are alone. The player is there, where they cannot be seen, and watches; they never notice.",
        "Both of them are adults, they want this, and nothing happens that either of them does not want.",
        afterDarkClubNote(entry),
        fades
          ? "This life fades out: build up to the moment itself, fade out as it begins, and pick up a little later, in the after. Nothing explicit."
          : "This life writes all of it in full: as explicit as the scene calls for, true to who they are, in prose.",
        passageNote,
        `Write what the player sees and hears from where they are. ${SECOND_PERSON_RULE} The player only watches: never write what the player says or does beyond that.`,
        isLast
          ? `This is the last passage: the after, a few lines of the two of them, true to who they are. \`remember\` is what each of them keeps of it, from their own side, in detail \u2014 they never knew anyone was watching. At most ${DARK_REMEMBER_MAX} characters each, by id.`
          : "End it at a point where the player could still slip away.",
        `Answer with JSON only, exactly: ${shape}`,
        '`lines`: 6 to 12 segments, mostly narration, with what they say; `who` is "narration", or the id of whoever speaks.',
        SEGMENT_LENGTH_RULE,
        PASSAGE_WORDS_RULE,
        picture
          ? picturePromptRule("the peak of this passage, AS it happens, with only the two of them", picture)
          : null,
        `Write every line in ${life.settings?.language ?? "English"}.`,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${darkWherePrompt(life, entry)} \xB7 NOW: ${formatDateTime(life.minutes)}`,
        HERE_NOW_LINE,
        `HOW IT CAME ABOUT: ${afterDarkOrigin(life, entry)}`,
        settingBlock(settingNoteFor(life)),
        "",
        afterDarkTwoOfThem(life, idA, idB),
        "",
        "BETWEEN THEM:",
        afterDarkBetweenThem(life, idA, idB, {
          club: entry.kind === "club",
        }),
        afterDarkSecretsPrompt(life, entry, {
          peek: true,
        }),
        "",
        afterDarkWaysPrompt(life, adult, [idA, idB]),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene) || "(nothing yet)",
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
async function startAfterDarkPeek(host, life, adult, entryId) {
  let events = [],
    entry = darkEntryById(adult, String(entryId ?? ""));
  if (
    !entry ||
    !(entry.status === "here" || clubDarkHereNow(life, entry)) ||
    life.minutes >= entry.until ||
    !darkEntryValid(life, adult, entry)
  ) {
    throw afterDarkHttpError(400, "They are not there any more.");
  }
  let blockedWhy = darkPeekBlockedWhy(life, adult, entry);
  if (blockedWhy) {
    throw afterDarkHttpError(400, `${blockedWhy}.`);
  }
  if ((assertNoSceneOpen(life), isAtActiveParty(life) && life.party.leaving)) {
    throw afterDarkHttpError(400, "You are saying goodbye.");
  }
  let where = entry.home && (entry.home === "you" || livesWithYou(life, entry.home)) ? "home" : entry.place;
  if (entry.meet && life.at === entry.meet.place && where !== life.at) {
    let move = goToPlace(life, where);
    if (!move.ok) {
      throw afterDarkHttpError(400, move.reason);
    }
    if (move.fainted) {
      return {
        fainted: true,
        events: move.events ?? [],
      };
    }
    if (((events = move.events ?? []), life.scene || life.outing || life.at !== where)) {
      return {
        events: events,
      };
    }
    logNote(life, `Followed ${afterDarkDisplayName(life, entry.a)} and ${afterDarkDisplayName(life, entry.b)}`, "move");
  }
  entry.fade = adult.detail === "fade";
  entry.of = afterDarkPassageCount(entry);
  let scene = createScene({
    kind: "milestone",
    characterId: entry.a,
    place: life.at,
    at: life.minutes,
    event: AFTER_DARK_PEEK_MILESTONE,
  });
  addToEventCast(scene, entry.b, {
    at: life.minutes,
    why: "there",
  });
  Object.assign(scene, {
    milestone: AFTER_DARK_PEEK_MILESTONE,
    by: "you",
    nameKnown: true,
    leavesAt: null,
    max: afterDarkPassageCount(entry),
    exchange: 0,
    phase: "decide",
    watching: {
      title: `${afterDarkDisplayName(life, entry.a)} & ${afterDarkDisplayName(life, entry.b)}`,
      line: `${afterDarkDisplayName(life, entry.a)} and ${afterDarkDisplayName(life, entry.b)}. They haven't seen you.`,
    },
    placeName: darkPlaceName(life, entry),
    about: {
      dark: entry.id,
      look: entry.spot ? darkBackdrop(life, entry) : null,
      dance: isClubDanceOnly(entry),
      fade: entry.fade,
    },
    peek: {
      passage: 0,
    },
  });
  if (scene.about.look) {
    unlockAdultBackdrop(adult, scene.about.look);
  }
  life.scene = scene;
  entry.status = "peek";
  entry.spied = true;
  let result = await continueAfterDarkPeek(host, life, adult, entry);
  return {
    peeking: entry.id,
    ...(result?.fainted
      ? {
          fainted: true,
        }
      : {}),
    events: [...(events ?? []), ...(result?.events ?? [])],
  };
}
var peekLogTranscript = (scene) =>
  scene.log
    .filter((line) => line.who === "narration" || line.by)
    .map((line) => (line.by ? `${line.by}: ${line.text}` : `(${line.text})`)).join(`
`);
async function continueAfterDarkPeek(host, life, adult, entry) {
  let scene = life.scene;
  if (!darkEntryValid(life, adult, entry)) {
    if (bothMarkedAdult(life, adult, entry)) {
      Object.assign(entry, {
        status: "due",
        watched: false,
      });
    } else {
      entry.status = "gone";
      clearPeekProgress(entry);
    }
    scene.batch = [];
    endAfterDarkPeek(life, scene, "You look away.", entry);
    return {
      passage: scene.peek.passage,
      done: true,
    };
  }
  let passage = scene.peek.passage + 1,
    total = afterDarkPassageCount(entry),
    lead = afterDarkLeadPassages(entry),
    wantsPicture =
      keyImagesOn(life) && passage > lead && pictureBeatsFor(total - lead, adult.pictures).includes(passage - lead),
    pair = [entry.a, entry.b],
    reply = await host.withModel(life.id, "It could not be written", async (signal) => {
      let picture = wantsPicture ? await host.briefFor(life, scene, signal) : false,
        { json: json } = await host.sceneModel(life, signal).askJson(
          buildAfterDarkPeekPrompt(life, adult, entry, scene, {
            n: passage,
            picture: picture,
          }),
          {
            maxTokens: 2200,
            task: "after-dark-peek",
            about: pair.map((id) => plainNameOf(life, id)).join(" & "),
            check: checkAfterDarkReply,
          },
        );
      return {
        lines: parseAfterDarkLines(json?.lines, pair, 12),
        remember: parseAfterDarkMemories(json?.remember, pair),
        picture: picture ? normalizePicture(json?.picture) : null,
      };
    });
  if (!reply.lines.length) {
    throw Object.assign(afterDarkHttpError(502, "Nothing came back."), {
      model: true,
    });
  }
  let { events: events } = advanceTime(life, Math.round(PEEK_MINUTES / total), {
    walking: true,
  });
  if (events.some((ev) => ev.id === "fainted")) {
    rememberPeekProgress(entry, scene);
    Object.assign(entry, {
      status: "due",
      watched: false,
    });
    scene.batch = [];
    return {
      passage: passage,
      fainted: true,
      events: events,
    };
  }
  scene.exchange = passage;
  scene.batch = reply.lines;
  let lineIndex = scene.log.length;
  scene.log.push(
    ...reply.lines.map((line) => ({
      ...line,
      exchange: passage,
    })),
  );
  scene.peek.passage = passage;
  if (afterDarkCheatingPartner(life, entry)) {
    seenOrTold(life, entry.a, entry.b, {
      how: "seen",
      place: life.at,
      ...(passage > lead && !isClubDanceOnly(entry)
        ? {
            sure: true,
          }
        : {}),
    });
  }
  let part = passage > lead ? beatPhaseOf(passage - lead, total - lead) : null,
    imageId = keyImageFor(life, scene, {
      beat: "passage",
      picture: reply.picture,
      label: afterDarkPictureLabel(part),
      place: scene.placeName,
    });
  if (
    (imageId &&
      ((scene.peek.shots = [
        ...(scene.peek.shots ?? []),
        {
          id: imageId,
          at: lineIndex,
          ...(part
            ? {
                part: part,
              }
            : {}),
        },
      ]),
      await host.queueKey(life, imageId)),
    rememberPeekProgress(entry, scene),
    passage < total)
  ) {
    scene.phase = "decide";
    return {
      passage: passage,
      events: events,
    };
  }
  let shots = scene.peek.shots ?? [];
  clearPeekProgress(entry);
  entry.seenShots = shots;
  storeAfterDarkScene(life, entry, {
    lines: scene.log.map(({ exchange: exchange, ...line }) => line),
    remember: reply.remember,
    picture: null,
  });
  entry.watched = true;
  endAfterDarkPeek(life, scene, "They never knew you were there.", entry);
  return {
    passage: passage,
    done: true,
    events: events,
  };
}
function endAfterDarkPeek(life, scene, headline, entry) {
  Object.assign(scene, {
    phase: "result",
    done: true,
    endedBy: "accepted",
    choice: "yes",
    remember: "",
    verdict: {
      accepted: true,
      headline: headline,
      stamp: null,
    },
    remembers: [entry.a, entry.b]
      .filter((id) => entry.remember?.[id])
      .map((id) => ({
        id: id,
        name: afterDarkDisplayName(life, id),
        text: entry.remember[id],
      })),
    kept:
      entry.status === "ready"
        ? {
            title: "YOU CAN WATCH IT AGAIN",
            line: "In AFTER DARK, on your phone",
          }
        : null,
  });
}
function joinAfterDarkWhyNot(life, entry) {
  if ([entry.a, entry.b].some((id) => isAfterDarkNpc(life, id))) {
    return "Not with someone you don't know";
  }
  if (!life.rules?.multipleRelationships) {
    return "Not in this life: it takes multiple relationships";
  }
  if (!joinAfterDarkSpot(life, entry)) {
    return "Not here";
  }
  let unwilling = [entry.a, entry.b].find((id) => consentFor(life, id).how !== "yes");
  return unwilling ? `${afterDarkDisplayName(life, unwilling)} wouldn't want you there` : "";
}
function joinAfterDarkSpot(life, entry) {
  if (entry.spot || entry.kind === "club") {
    return null;
  }
  if (entry.kind === "party" && isAtActiveParty(life)) {
    return {
      spot: "party",
      lead: entry.a,
      ...(life.visit
        ? {
            keep: true,
          }
        : {}),
    };
  }
  let pair = [entry.a, entry.b];
  if (life.at === "home" && !life.visit) {
    return {
      spot: "yours",
      lead: entry.a,
    };
  }
  let visit = life.visit;
  if (visit?.stage === "inside" && pair.includes(visit.characterId)) {
    return {
      spot: "theirs",
      lead: visit.characterId,
      keep: true,
    };
  }
  let homeChar = pair.includes(entry.home) ? characterOf(life, entry.home) : null;
  return !visit && homeChar?.residence?.place === life.at
    ? sharesYourDoor(life, homeChar)
      ? {
          spot: "yours",
          lead: entry.a,
          inside: true,
        }
      : {
          spot: "theirs",
          lead: entry.home,
        }
    : null;
}
async function decideAfterDarkPeek(host, life, adult, choice, { sceneDecide: sceneDecide, noLines = false }) {
  let scene = life.scene,
    entry = darkEntryById(adult, scene.about?.dark);
  if (!entry) {
    throw afterDarkHttpError(400, "That is over.");
  }
  if ((choice === "watch" && noLines && (choice = "away"), choice === "watch")) {
    return continueAfterDarkPeek(host, life, adult, entry);
  }
  if (choice === "away") {
    rememberPeekProgress(entry, scene);
    Object.assign(entry, {
      status: "due",
      watched: false,
    });
    scene.batch = [];
    endAfterDarkPeek(life, scene, "You slipped away.", entry);
    return {
      decided: "away",
      done: true,
    };
  }
  if (choice === "join") {
    let whyNot = joinAfterDarkWhyNot(life, entry);
    if (whyNot) {
      throw afterDarkHttpError(400, `${whyNot}.`);
    }
    Object.assign(entry, {
      status: "ready",
      lines: scene.log.map(({ exchange: exchange, ...line }) => line),
      watched: true,
      shotIds: scene.peek.shots ?? [],
    });
    clearPeekProgress(entry);
    life.scene = null;
    let { spot: spot, lead: lead, keep: keep, inside: inside } = joinAfterDarkSpot(life, entry);
    if (inside) {
      life.at = "home";
    }
    if (keep) {
      life.visit.staying = true;
    } else if (spot === "theirs") {
      life.visit = {
        characterId: lead,
        stage: "inside",
        invite: {
          yes: true,
        },
        at: life.minutes,
        since: life.minutes,
        did: [],
        staying: true,
      };
    }
    let scene2 = createScene({
      kind: "milestone",
      characterId: lead,
      place: life.at,
      at: life.minutes,
      event: INTIMATE_MILESTONE,
    });
    Object.assign(scene2, {
      milestone: INTIMATE_MILESTONE,
      by: "you",
      nameKnown: true,
      leavesAt: null,
      phase: "decide",
      about: {
        spot: spot,
        first: false,
      },
    });
    addToEventCast(scene2, lead === entry.a ? entry.b : entry.a, {
      at: life.minutes,
      why: "there",
    });
    scene2.about.joined = true;
    life.scene = scene2;
    return {
      ...((await sceneDecide(host, life, adult, "yes", {
        noLines: noLines,
      })) ?? {}),
      decided: "join",
    };
  }
  if (choice === "seen") {
    if (letThemSeeWhyNot(life, entry)) {
      throw afterDarkHttpError(400, `${letThemSeeWhyNot(life, entry)}.`);
    }
    Object.assign(entry, {
      status: "ready",
      lines: scene.log.map(({ exchange: exchange, ...line }) => line),
      watched: true,
      shotIds: scene.peek.shots ?? [],
    });
    clearPeekProgress(entry);
    for (let id of [entry.a, entry.b]) {
      let bond = bondOf(life, id);
      if (bond) {
        adjustBondAxis(bond, "trust", CAUGHT_PEEKING_TRUST, {
          at: life.minutes,
        });
      }
    }
    let cheating = afterDarkCheatingPartner(life, entry);
    if (((life.scene = null), cheating)) {
      seenOrTold(life, entry.a, entry.b, {
        how: "seen",
        place: life.at,
        sure: !isClubDanceOnly(entry) && scene.peek.passage > afterDarkLeadPassages(entry),
      });
      beginScene(life, cheating.partner, "milestone", {
        milestone: "confront",
      });
    } else {
      let partnerId = afterDarkPartnerOfPlayer(life, entry)?.partner ?? (hasMet2(life, entry.a) ? entry.a : entry.b),
        otherId = partnerId === entry.a ? entry.b : entry.a;
      beginScene(life, partnerId, "talk");
      if (!isAfterDarkNpc(life, otherId)) {
        addToEventCast(life.scene, otherId, {
          at: life.minutes,
          why: "there",
        });
      }
      life.scene.darkSeen = {
        a: entry.a,
        b: entry.b,
      };
    }
    life.scene.nameKnown = true;
    if (noLines) {
      life.scene.batch = [];
    } else {
      await host.openScene(life, life.scene);
    }
    return {
      decided: "seen",
    };
  }
  throw afterDarkHttpError(400, "Keep watching, slip away, join them or let them see you.");
}
function afterDarkSeenSceneBlocks(life, scene) {
  let darkSeen = scene?.darkSeen;
  return darkSeen
    ? {
        system: `A moment ago, ${plainNameOf(life, darkSeen.a)} and ${plainNameOf(life, darkSeen.b)} found out the player had been watching them, in secret, while they were being intimate. This talk is about that, true to who each of them is: how they take it is theirs.`,
        user: "",
      }
    : null;
}
var letThemSeeWhyNot = (life, entry) =>
  entry && ![entry.a, entry.b].some((id) => !isAfterDarkNpc(life, id) && hasMet2(life, id))
    ? "You don't know them yet"
    : "";
var AFTER_DARK_PEEK_HANDLERS = {
  whyNot: () => "Only when you are right there.",
  options(life, scene) {
    let adult = life.modules?.adult,
      entry = adult ? darkEntryById(adult, scene.about?.dark) : null,
      joinWhyNot = entry ? joinAfterDarkWhyNot(life, entry) : "";
    return [
      {
        id: "watch",
        label: "Keep watching",
        ok: true,
        why: "",
        note: "",
      },
      {
        id: "away",
        label: "Slip away",
        ok: true,
        why: "",
        note: "Before they see you",
      },
      {
        id: "join",
        label: "Join them",
        ok: !joinWhyNot,
        why: joinWhyNot,
        note: "",
      },
      {
        id: "seen",
        label: "Let them see you",
        ok: !letThemSeeWhyNot(life, entry),
        why: letThemSeeWhyNot(life, entry),
        note: "",
      },
    ];
  },
  free: () => false,
  endable: () => true,
};
var AFTER_DARK_WATCH_HANDLERS = {
  whyNot: () => "Only from AFTER DARK.",
  options: () => [],
  free: () => false,
};
async function endAfterDarkPeekScene(host, life, adult) {
  let scene = life.scene;
  if (!(scene?.milestone !== AFTER_DARK_PEEK_MILESTONE || scene.done)) {
    return decideAfterDarkPeek(host, life, adult, "away", {
      sceneDecide: null,
    });
  }
}
registerMilestone(
  INTIMATE_MILESTONE,
  {
    by: "both",
    order: 90,
    adult: true,
    title: (who, scene) =>
      scene?.about?.special?.kind === "wedding"
        ? "Your wedding night"
        : scene?.about?.special?.kind === "honeymoon"
          ? `${HONEYMOONS[scene.about.special.trip]?.name ?? "The trip"} \xB7 night ${scene.about.special.day}`
          : `${timeOfDayPhrase(scene?.startedAt)} with ${who}`,
    mine: "In this scene the player and this person get intimate.",
    theirs: "In this scene they let the player know, in their own way, that they want the player \u2014 here, now.",
    not: "going further than kisses and touches before the player's call.",
    def: defineEvent({
      id: INTIMATE_MILESTONE,
      family: "adult",
      label: "Time together",
      beats: [
        {
          type: "turns",
          min: 1,
          max: INTIMATE_LEADUP_TURNS_MAX,
        },
        {
          type: "choice",
          options: ["yes", "wait"],
        },
        {
          type: "result",
          keyImage: false,
        },
      ],
    }),
  },
  INTIMATE_MILESTONE_DEF,
);
registerModulePlace(HOTEL_PLACE, "nightlife");
BACKGROUND_SUBJECTS[HOTEL_PLACE.id] = {
  name: HOTEL_PLACE.name,
  tags: "hotel lobby, small hotel, reception desk, warm dim lighting, neon sign outside",
  prose: "the small lobby of a discreet hotel on the nightlife street, a reception desk under warm, dim light",
};
registerModulePlace(CLUB_PLACE, "nightlife");
BACKGROUND_SUBJECTS[CLUB_PLACE.id] = {
  name: CLUB_PLACE.name,
  indoor: true,
  tags: "strip club interior, small stage with a pole, red neon lights, lounge chairs, bar counter, dim",
  prose: "the inside of a strip club, a small stage under red neon, lounge chairs and a bar counter in dim light",
};
PLACE_ACTIVITIES[CLUB_PLACE.id] = [
  {
    ...CLUB_SHOW_ACTIVITY,
  },
];
JOBS_BY_PLACE[CLUB_PLACE.id] = CLUB_JOBS.map((job) => ({
  ...job,
}));
FACT_ACT_PHRASES[PRIVATE_DANCE_FACT] = (who) => `getting a private dance from ${who}`;
ROMANTIC_ACTS.push(PRIVATE_DANCE_FACT);
registerMilestone(
  CLUB_TALK_MILESTONE,
  {
    by: "them",
    adult: true,
    says: "WANTS TO TALK",
    title: () => CLUB_PLACE.name,
    theirs: `They found out the player went to the ${CLUB_PLACE.name}, a strip club, and it bothers them: they bring it up, true to who they are. They do not settle it: the player answers, and makes the call at the end.`,
    not: "",
    def: defineEvent({
      id: CLUB_TALK_MILESTONE,
      family: "adult",
      label: CLUB_PLACE.name,
      beats: [
        {
          type: "turns",
          min: 2,
          max: 3,
        },
        {
          type: "choice",
          options: CLUB_TALK_CHOICES,
        },
        {
          type: "result",
          keyImage: false,
        },
      ],
    }),
  },
  CLUB_TALK_HANDLERS,
);
FACT_ACT_PHRASES[CLUB_VISIT_FACT] = () => `going to the ${CLUB_PLACE.name}, a strip club`;
NEGATIVE_ASKS.push(CLUB_TALK_MILESTONE);
registerMilestone(
  CLUB_DANCE_MILESTONE,
  {
    by: "you",
    adult: true,
    title: (who) => `A private dance \xB7 ${who}`,
    mine: "In this scene they dance for the player, in the club's private room.",
    not: "",
    def: defineEvent({
      id: CLUB_DANCE_MILESTONE,
      family: "adult",
      label: "A private dance",
      beats: [
        {
          type: "turns",
          min: 1,
          max: PRIVATE_DANCE_TURNS,
        },
        {
          type: "choice",
          options: ["yes", "wait"],
        },
        {
          type: "result",
          keyImage: false,
        },
      ],
    }),
  },
  PRIVATE_DANCE_HANDLERS,
);
registerMilestone(
  AFTER_DARK_MILESTONE,
  {
    by: "them",
    adult: true,
    title: () => "After dark",
    theirs: "Two people of the cast, alone; the player only watches.",
    not: "",
    def: defineEvent({
      id: AFTER_DARK_MILESTONE,
      family: "adult",
      label: "After dark",
      beats: [
        {
          type: "turns",
          min: 1,
          max: 1,
        },
        {
          type: "choice",
          options: ["yes", "wait"],
        },
        {
          type: "result",
          keyImage: false,
        },
      ],
    }),
  },
  AFTER_DARK_WATCH_HANDLERS,
);
registerMilestone(
  AFTER_DARK_PEEK_MILESTONE,
  {
    by: "you",
    adult: true,
    title: () => "After dark",
    mine: "Two people of the cast, alone; the player is there without them knowing.",
    not: "",
    def: defineEvent({
      id: AFTER_DARK_PEEK_MILESTONE,
      family: "adult",
      label: "After dark",
      beats: [
        {
          type: "turns",
          min: 1,
          max: 1,
        },
        {
          type: "choice",
          options: ["watch", "away", "join", "seen"],
        },
        {
          type: "result",
          keyImage: false,
        },
      ],
    }),
  },
  AFTER_DARK_PEEK_HANDLERS,
);
Object.assign(BACKGROUND_SUBJECTS, INTIMATE_BACKDROPS);
FACT_ACT_PHRASES[INTIMATE_MILESTONE] = (who) => `sleeping with ${who}`;
ROMANTIC_ACTS.push(INTIMATE_MILESTONE);
CLAIM_ACTS.slept = [INTIMATE_MILESTONE];
CLAIM_PHRASES.slept = (who) => `having slept with ${who}`;

export {
  afterDarkSeenSceneBlocks,
  decideAfterDarkPeek,
  endAfterDarkPeekScene,
  prewriteAfterDarkScenes,
  startAfterDarkPeek,
  watchAfterDark,
  watchAfterDarkNow,
};
