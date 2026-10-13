// LLM prompts and parsers that cast a character card: archetypes, traits, tone, week, job, home
import { ARCHETYPES, ARCHETYPE_IDS } from "../relationships/archetypes.mjs";
import { assignStoresToWeek } from "../schedule/routines.mjs";
import { weekFromModelAnswer, workCellsFromModelWeek } from "../schedule/model-week.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { placeForJobId } from "../jobs/town-jobs.mjs";
import { worldLoreNote } from "./world-lore.mjs";
import {
  applyJobToWeek,
  applyWorkCellsToWeek,
  cleanJobTitle,
  clipOutfitText,
  likeliestJobForCells,
  resolveJobChoice,
} from "../jobs/job-week.mjs";
import { RESIDENCE_UPGRADE, validResidencePlace } from "../housing/residence-units.mjs";
import {
  ORIENTATION_GENDER_RULE,
  ORIENTATION_INTO_RULE,
  attractionSaid,
  normalizeAttraction,
  normalizeGender,
} from "../orientation/orientation.mjs";
import {
  TRAITS_JSON_SHAPE,
  TRAITS_PROMPT_RULES,
  TRAIT_DIALS,
  archetypeTraitsSummary,
  notableTraitWords,
  traitsFromModelAnswer,
} from "../traits/traits.mjs";
import { normalizeBirthday } from "../relationships/birthdays.mjs";
import { normalizeKinKind } from "../relationships/kin.mjs";
import { normalizeStartingRelation } from "../relationships/starting-relations.mjs";
import { FAMILY_PAIR_DETAILS, NPC_PAIR_KINDS, ROMANTIC_PAIR_KINDS, parseCardRelations } from "../network/npc-pairs.mjs";
import { parseDateTastes } from "../outings/date-tastes.mjs";
import { TASTES_JSON_SHAPE, TASTES_PROMPT_RULES, parseClothesTaste, parseGiftTastes } from "../gifts/gift-tastes.mjs";
import { ARCHETYPE_THEIR_THING, THEIR_THING_ACTIVITIES } from "../visits/home-visits.mjs";
import { DEFAULT_LANGUAGE } from "../llm/model-client.mjs";

var ARCHETYPE_PROMPT_LINES = ARCHETYPE_IDS.map(
  (id) => `- ${id}: ${ARCHETYPES[id].name}. ${ARCHETYPES[id].tone.split(". ")[0]}. (${archetypeTraitsSummary(id)})`,
).join(`
`);
var homeThingPromptLines = () =>
  Object.entries(THEIR_THING_ACTIVITIES).map(([key, activity]) => `- ${key}: ${activity.name}`).join(`
`);
var TOWN_NAME_PROMPT_MAX = 40;
var SCENARIO_NOTES_MAX = 600;
var cleanTownNameForPrompt = (raw) =>
  String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TOWN_NAME_PROMPT_MAX);
var MONEY_SCALE_NOTE =
  "Money here is US dollars ($), on the game's scale: a coffee is about $8, a meal $30, clothes $45 to $75, an intern's shift pays $60, a town job pays $55 to $240 a shift, the rent is $650 a month; someone who lives with the player puts their pay into the household money. Any price or sum anyone mentions is in dollars, on that scale; never another currency.";
function settingNoteFor({ townName = "", scenario = "", worldLore = null } = {}) {
  let town = cleanTownNameForPrompt(townName),
    notes = String(scenario ?? "")
      .trim()
      .slice(0, SCENARIO_NOTES_MAX);
  return [
    town ? `The town is called ${town}.` : "",
    notes ? `The player's notes on the setting: ${notes}` : "",
    worldLoreNote(worldLore),
    MONEY_SCALE_NOTE,
  ].filter(Boolean).join(`
`);
}
function readCardMessages(
  card,
  { places = [], language = DEFAULT_LANGUAGE, setting = "", others = [], couples = false, jobs = [], fields = [] } = {},
) {
  let cardText = [
      card.name ? `Name: ${card.name}` : "",
      card.description ? `Description: ${card.description}` : "",
      card.personality ? `Personality: ${card.personality}` : "",
      card.scenario ? `Scenario: ${card.scenario}` : "",
      card.backstory ? `Backstory: ${card.backstory}` : "",
      card.tags?.length ? `Tags: ${card.tags.join(", ")}` : "",
    ].filter(Boolean).join(`
`),
    placeLines = places.map((place) =>
      place.id === "home"
        ? "- home: their own home (their flat or their house), always there"
        : `- ${place.id}: ${place.name}${place.about ? ` (${place.about})` : ""}${place.open === 0 && place.close === 24 ? ", always open" : `, open ${place.open}\u2013${place.close}`}`,
    ).join(`
`),
    hasStores = places.some((place) => place.inside),
    pairKinds = NPC_PAIR_KINDS.filter((kind) => couples || !ROMANTIC_PAIR_KINDS.includes(kind)),
    otherCast = others.filter((other) => other?.id && other.id !== card.id);
  return [
    {
      role: "system",
      content: [
        "Task: read-card",
        "You are casting a character card into a modern life sim. You do not write scenes here.",
        "Three tasks: say who they are (the archetypes closest to them from a closed list, and their traits), what presents they would like, and write the week this person lives.",
        "",
        "ARCHETYPES (each with its traits):",
        ARCHETYPE_PROMPT_LINES,
        "",
        "THEIR THING \xB7 what they would do with the player at home, one of:",
        homeThingPromptLines(),
        "",
        "THE TOWN \xB7 the only places anybody can be. Never invent one:",
        placeLines || "- home: Home, always open",
        ...(hasStores
          ? [
              "The Mall is not a place by itself, it is its stores: when they would go to the Mall, put them in the store that fits what they do there, and vary the stores across the week.",
            ]
          : []),
        "",
        "THE JOBS \xB7 the only jobs in this town they can take, each with its fixed shift and pay; several people can share the same job, but a place has only one boss:",
        ...(jobs.length
          ? jobs.map(
              (job) =>
                `- ${job.id}: ${job.title} at ${job.placeName} \xB7 ${job.shift} \xB7 $${job.pay} a shift \xB7 wears ${job.clothes}`,
            )
          : ["- none"]),
        "",
        "Answer with JSON only, exactly this shape:",
        '{"main":"<id>","second":"<id or empty>","romanceable":true|false,"castRomance":true|false,"why":"<one short line>",',
        TRAITS_JSON_SHAPE,
        ' "thing":"<id from THEIR THING>",',
        ' "note":"<one line about how they spend their week>",',
        ' "job":"<id from THE JOBS, out, home or none>","title":"<with home: what they do>","work_outfit":"<what they wear at work, or empty>",',
        ' "lives":"apartments, houses or unsaid","settled":0,"rich":false,',
        ' "birthday":{"season":"spring, summer, autumn, winter or unsaid","day":0},',
        ' "gender":"female, male or futanari","into":[one or more of "women", "men", "futanari"] or "unsaid",',
        ' "knows":"no, friendly, friend, close, family, couple, ex or rivals","kin":"siblings, parent, cousins or relatives",',
        ...fields.map((field) => ` "${field.key}":${field.shape},`),
        TASTES_JSON_SHAPE,
        ' "weekday":[{"from":9,"to":18,"place":"office","doing":"works","work":true},{"from":23,"to":7,"place":"home","doing":"","sleep":true}],',
        ' "saturday":[...],"sunday":[...],',
        ` "extras":[{"day":"fri","from":21,"to":2,"place":"bar","doing":"out with friends"}]${otherCast.length ? "," : "}"}`,
        ...(otherCast.length
          ? [
              ' "people":[{"id":"<id from THE REST OF THE CAST>","kind":"<kind>","detail":"<family only>","note":"<a few words>"}]}',
            ]
          : []),
        "",
        "`main` and `second` MUST be ids from the archetype list: the closest to them, and a second that adds to it, or empty. Never invent an id.",
        TRAITS_PROMPT_RULES,
        "`thing` is the id from THEIR THING that fits them best.",
        "`romanceable` is false when the card itself rules out romance with the player: a stated partner, a family tie to the player, or an age that makes it wrong.",
        "`castRomance` is false when the card rules out romance with anyone at all: a stated partner, or an age that makes it wrong. A family tie to the player alone does not.",
        "`knows` is whether the card says they ALREADY know the player, and what they are to them: `no` (they have never met), `friendly` (they have met, they know each other's name), `friend`, `close` (a close friend), `family` (the player's family: then `kin` says which, `siblings`, `parent`, `cousins` or `relatives`), `couple` (the player's partner), `ex` (the player's ex) or `rivals`. Only what the card says; when it says nothing, `no`.",
        "`lives`: only what the card itself says about their home: `apartments` (they live in a flat) or `houses` (a house, their family's house, their parents' place). When the card does not say where they live, `unsaid`: never guess here.",
        "`settled` is how settled their life is, a whole number 0 to 3, read from who they are (the code decides their home from it when the card does not say):",
        "- 0: a student, short of money, new in town, drifting, living out of a suitcase.",
        "- 1: young and on their own: a first job, independent, in the middle of things.",
        "- 2: established: a steady career or a senior post, around thirty or older, a long relationship, money enough.",
        "- 3: rooted: lives with family (parents, children, a partner), a family business in town, well off, pets or a garden, a quiet neighbourhood kind of person.",
        "`rich` is true only when the card itself says they are wealthy: rich, famous, an heir or heiress, a big name, old money, living in luxury. Otherwise false. (The rich live up on the hill, in a luxury flat or a mansion.)",
        "`birthday`: only when the card says their birthday (a season and a day, or a date you can place in a season: spring is March to May, summer June to August, autumn September to November, winter December to February; the day 1 to 30, the day of that month). When the card does not say it, `unsaid` and 0: never make one up.",
        ORIENTATION_GENDER_RULE,
        ORIENTATION_INTO_RULE,
        ...fields.map((field) => field.rule),
        "Examples: a department head in her thirties is 2 or 3; someone whose father owns a business in town and who still lives with the family is 3; a 22-year-old student is 0 or 1. About a third of this town lives in houses: do not put everybody at 0 or 1 out of habit.",
        TASTES_PROMPT_RULES,
        "`weekday` is one ordinary Monday-to-Friday; `saturday` and `sunday` are those two days.",
        "`from` and `to` are whole hours, 0 to 24. A block whose `to` is smaller than its `from` runs past midnight into the next morning: that is how a night out or a night's sleep is written.",
        "Cover the whole day, sleep included, and let the blocks touch: the end of one is the start of the next.",
        "`doing` is two or three words about what they are doing there, or empty.",
        "`sleep` is true on the block when they are asleep: at home, one a day (a night worker sleeps by day). Leave it out on every other block.",
        "`work` is true on EVERY block where they are working, whatever the job and wherever it is; leave it out on every other block (shopping, studying, training, going out are not work). The code alone decides where working hours go: the shift of their job, out of town, or their home. Never write a job into the week any other way.",
        "`extras` are up to four exceptions to the week above, each on one day (mon tue wed thu fri sat sun). Leave it empty when there are none.",
        "Write the week this card implies: a student is at the university, someone who works nights sleeps by day, a shut-in barely leaves home.",
        "`job`: the town needs its jobs filled, so give them one of THE JOBS whenever one could plausibly be theirs: the one their card gives them, or else the one closest to who they are, even when the card says another job (a bookworm, at the library; a cook, at the restaurant; someone sporty, at the gym). Its id. `home` when the card says they work from home, remotely, online or freelance; then `title` is what they do, a few words in English (freelance illustrator). `out` (they work out of town) only when none of THE JOBS could be theirs at all. `none` when they have no job (a student, retired, between jobs). Never invent an id.",
        "With a job from THE JOBS, its shift is theirs: write the rest of their week around it (the code paints the shift). With `out` or `home`, mark their working hours with `work` (the code puts them out of town, or at home).",
        "`work_outfit`, with a job or `out`: what they wear at work, one line in English for image prompts: their own version of the job's clothes, fitting who they are. Empty with `none` or `home`.",
        ...(otherCast.length
          ? [
              "`people` is who of THE REST OF THE CAST this person has a notable relation with, only when the card says it or clearly implies it (the same story, a named sister, an ex). Usually nobody: then an empty list.",
              `\`kind\` is exactly one of: ${pairKinds.join(", ")}. \`detail\` only for family, one of: ${FAMILY_PAIR_DETAILS.join(", ")}. \`note\` is a few words, in ${language}.`,
            ]
          : []),
        `\`why\`${otherCast.length ? ", `note` and each person's `note`" : " and `note`"} are prose: write them in ${language}. Everything else is ids, numbers and true/false.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: `${
        setting
          ? `THE SETTING:
${setting}

`
          : ""
      }THE CARD:
${cardText}${
        otherCast.length
          ? `

THE REST OF THE CAST:
${otherCast.map((other) => `- ${other.id}: ${other.name}`).join(`
`)}`
          : ""
      }`,
    },
  ];
}
function parseReadCardAnswer(
  answer,
  { places = [], seed = "", others = [], couples = false, jobs = [], fields = [] } = {},
) {
  let main = ARCHETYPE_IDS.includes(answer?.main) ? answer.main : null;
  if (!main) {
    throw new Error("The model picked an archetype that does not exist.");
  }
  let second = ARCHETYPE_IDS.includes(answer?.second) && answer.second !== main ? answer.second : null,
    week = null,
    weekProblem = "";
  try {
    let placeIds2 = places.map((place) => place.id ?? place);
    week = assignStoresToWeek(
      weekFromModelAnswer(answer, {
        places: [...placeIds2, "mall", JOB_AWAY_PLACE],
      }),
      {
        stores: places.filter((place) => place?.inside),
        seed: seed,
        who: "read",
      },
    );
  } catch (err) {
    weekProblem = String(err.message || err);
  }
  let jobId = String(answer?.job ?? "")
      .trim()
      .toLowerCase(),
    jobChoice =
      !jobId || jobId === "none"
        ? null
        : (resolveJobChoice(
            {
              id: jobId,
              title: answer?.title,
            },
            null,
            {
              free: jobs,
            },
          ) ?? placeForJobId(jobId, jobs)),
    job =
      !jobId || jobId === "none"
        ? null
        : jobChoice?.id
          ? {
              id: jobChoice.id,
              place: jobChoice.place,
              title: jobChoice.title,
            }
          : (jobChoice ?? {
              out: true,
            }),
    placeIds = places.map((place) => place.id ?? place),
    workCells = workCellsFromModelWeek(answer, {
      places: [...placeIds, "mall", JOB_AWAY_PLACE],
    });
  if ((!job || (job.out && jobId !== "out")) && workCells.length) {
    let worksHome = !job && workCells.filter((cell) => cell.place === "home").length * 2 >= workCells.length,
      likeliest = worksHome ? null : likeliestJobForCells(workCells, jobs);
    job = worksHome
      ? {
          home: true,
          title: cleanJobTitle(answer?.title),
        }
      : likeliest
        ? {
            id: likeliest.id,
            place: likeliest.place,
            title: likeliest.title,
          }
        : {
            out: true,
          };
  }
  let freeJob = job?.id ? jobs.find((candidate) => candidate.id === job.id) : null;
  if (week) {
    week = applyWorkCellsToWeek(week, workCells, {
      job: freeJob,
      fromHome: !!job?.home,
    });
  }
  if (week && job?.home) {
    week = applyJobToWeek(week, job);
  }
  return {
    main: main,
    second: second,
    traits: traitsFromModelAnswer(answer, {
      main: main,
      second: second,
    }),
    thing: THEIR_THING_ACTIVITIES[answer?.thing] ? answer.thing : ARCHETYPE_THEIR_THING[main],
    romanceable: answer?.romanceable !== false,
    castRomance: typeof answer?.castRomance == "boolean" ? answer.castRomance : answer?.romanceable !== false,
    why: String(answer?.why ?? "")
      .trim()
      .slice(0, 140),
    note: String(answer?.note ?? "")
      .trim()
      .slice(0, 180),
    ...residenceFromCardAnswer(answer, {
      boss: !!freeJob?.boss,
    }),
    birthday: normalizeBirthday(answer?.birthday, "card"),
    gender: normalizeGender(answer?.gender),
    into: normalizeAttraction(answer?.into),
    intoSaid: attractionSaid(answer?.into),
    knows: normalizeStartingRelation(answer?.knows),
    kin: normalizeStartingRelation(answer?.knows) === "family" ? (normalizeKinKind(answer?.kin) ?? "relatives") : null,
    tastes: parseGiftTastes(answer?.gifts),
    clothesTaste: parseClothesTaste(answer?.clothes),
    dateTastes: parseDateTastes(answer?.dates),
    week: week,
    weekProblem: weekProblem,
    people: parseCardRelations(answer?.people, {
      ids: others.map((other) => other?.id).filter(Boolean),
      self: seed,
      couples: couples,
    }),
    job: job,
    workOutfit: (job && !job.home && (clipOutfitText(answer?.work_outfit) || freeJob?.clothes)) || "",
    ...(fields.length
      ? {
          modules: fields.reduce(
            (acc, field) => ({
              ...acc,
              [field.module]: {
                ...(acc[field.module] ?? {}),
                [field.key]: field.clean(answer?.[field.key]),
              },
            }),
            {},
          ),
        }
      : {}),
  };
}
var SETTLED_HOUSE_FROM = 2;
function residenceFromCardAnswer(answer, { boss = false } = {}) {
  let saidPlace = validResidencePlace(answer?.lives),
    settledRaw = Math.round(Number(answer?.settled)),
    settled = Number.isFinite(settledRaw) ? Math.max(0, Math.min(3, settledRaw)) : 1,
    place = saidPlace ?? (settled >= SETTLED_HOUSE_FROM ? "houses" : "apartments"),
    rich = answer?.rich === true || boss;
  return {
    livesIn: rich ? RESIDENCE_UPGRADE[place] : place,
    settled: settled,
    livesBy: saidPlace || rich ? "card" : "guess",
    ...(answer?.rich === true
      ? {
          rich: true,
        }
      : {}),
  };
}
var cardTextBlock = (card) =>
  [
    card.name ? `Name: ${card.name}` : "",
    card.description ? `Description: ${card.description}` : "",
    card.personality ? `Personality: ${card.personality}` : "",
    card.scenario ? `Scenario: ${card.scenario}` : "",
    card.backstory ? `Backstory: ${card.backstory}` : "",
    card.tags?.length ? `Tags: ${card.tags.join(", ")}` : "",
  ].filter(Boolean).join(`
`);
function readTraitsMessages(card) {
  return [
    {
      role: "system",
      content: [
        "Task: read-traits",
        "You are reading who a character is, from their card, for a modern life sim. You do not write scenes here.",
        "",
        "ARCHETYPES (each with its traits):",
        ARCHETYPE_PROMPT_LINES,
        "",
        "THEIR THING \xB7 what they would do with the player at home, one of:",
        homeThingPromptLines(),
        "",
        "Answer with JSON only, exactly this shape:",
        `{"main":"<id>","second":"<id or empty>",${TRAITS_JSON_SHAPE} "thing":"<id from THEIR THING>"}`,
        "",
        "`main` and `second` MUST be ids from the archetype list: the closest to them, and a second that adds to it, or empty. Never invent an id.",
        TRAITS_PROMPT_RULES,
        "`thing` is the id from THEIR THING that fits them best.",
      ].join(`
`),
    },
    {
      role: "user",
      content: `THE CARD:
${cardTextBlock(card)}`,
    },
  ];
}
async function readCharacterTraits(llm, card) {
  let { json: json } = await llm.askJson(readTraitsMessages(card), {
      maxTokens: 500,
      task: "read-traits",
      about: card.name ?? "",
    }),
    main = ARCHETYPE_IDS.includes(json?.main) ? json.main : null;
  if (!main) {
    throw new Error("The model picked an archetype that does not exist.");
  }
  let second = ARCHETYPE_IDS.includes(json?.second) && json.second !== main ? json.second : null;
  return {
    main: main,
    second: second,
    traits: traitsFromModelAnswer(json, {
      main: main,
      second: second,
    }),
    thing: THEIR_THING_ACTIVITIES[json?.thing] ? json.thing : ARCHETYPE_THEIR_THING[main],
  };
}
function writeToneMessages(card, traits) {
  let traitWords = notableTraitWords(traits).map((trait) => trait.word);
  return [
    {
      role: "system",
      content: [
        "Task: write-tone",
        "Write one line in English: how this character comes across when you are with them, their manner and what they are like to be around, true to their card and to who they are now (below). Not a list of their traits.",
        'Answer with JSON only: {"tone":"<one line>"}',
      ].join(`
`),
    },
    {
      role: "user",
      content: `THE CARD:
${cardTextBlock(card)}

WHO THEY ARE NOW, from 0 to 10: ${TRAIT_DIALS.map((dial) => `${dial} ${traits.dials[dial]}`).join(", ")}${traits.flags.length ? `; ${traits.flags.join(", ")}` : ""}${
        traitWords.length
          ? `
In words: ${traitWords.join(", ")}.`
          : ""
      }`,
    },
  ];
}
async function writeCharacterTone(llm, card, traits) {
  let { json: json } = await llm.askJson(writeToneMessages(card, traits), {
      maxTokens: 300,
      task: "write-tone",
      about: card.name ?? "",
    }),
    tone = String(json?.tone ?? "")
      .replace(/\s+/g, " ")
      .trim();
  if (!tone) {
    throw new Error("The model did not write it.");
  }
  return tone.slice(0, 600);
}
async function readCharacterCard(
  llm,
  card,
  { places = [], language = DEFAULT_LANGUAGE, setting = "", others = [], couples = false, jobs = [], fields = [] } = {},
) {
  let { json: json, model: model } = await llm.askJson(
    readCardMessages(card, {
      places: places,
      language: language,
      setting: setting,
      others: others,
      couples: couples,
      jobs: jobs,
      fields: fields,
    }),
    {
      maxTokens: (others.length ? 1700 : 1500) + (fields.length ? 200 : 0),
      task: "read-card",
      about: card.name ?? "",
    },
  );
  return {
    ...parseReadCardAnswer(json, {
      places: places,
      seed: card.id ?? "",
      others: others,
      couples: couples,
      jobs: jobs,
      fields: fields,
    }),
    model: model,
  };
}

export { cleanTownNameForPrompt, readCharacterCard, readCharacterTraits, settingNoteFor, writeCharacterTone };
