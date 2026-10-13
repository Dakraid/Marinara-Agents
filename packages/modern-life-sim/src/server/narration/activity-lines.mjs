// LLM-written activity narration line bank: draw, refill, parse, merge
import { TOWN_PLACES } from "../town/places.mjs";
import { PLACE_ACTIVITIES, directPlaceActivities } from "../town/town-layout.mjs";

var ACTIVITY_LINES_PER_REQUEST = {
  fine: 4,
  worn: 2,
};
var ACTIVITY_LINES_BANK_CAP = {
  fine: 40,
  worn: 20,
};
var ACTIVITY_LINES_REFILL_THRESHOLD = 1;
var ACTIVITY_LINE_MAX_LENGTH = 240;
var ACTIVITY_LINE_MOODS = ["fine", "worn"];
function placeForActivityId(activityId) {
  return (
    Object.keys(PLACE_ACTIVITIES).find((placeId) =>
      PLACE_ACTIVITIES[placeId].some((activity) => activity.id === activityId),
    ) ?? null
  );
}
var normalizeLinesLanguageKey = (language) =>
  String(language || "English")
    .trim()
    .toLowerCase()
    .slice(0, 40) || "english";
var emptyLinesBank = (language = "English") => ({
  language: language,
  lines: {},
  help: {},
});
function fnv1aHash(text) {
  let hash = 2166136261;
  for (let ch of String(text)) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function unusedActivityLineIndexes(bank, used = {}, activityId, mood, seed = "") {
  let lines = bank?.lines?.[activityId]?.[mood] ?? [],
    usedSet = new Set(used?.[activityId]?.[mood] ?? []);
  return lines
    .map((line, index) => index)
    .filter((index) => !usedSet.has(index))
    .sort((a, b) => fnv1aHash(`${seed}|${activityId}|${mood}|${a}`) - fnv1aHash(`${seed}|${activityId}|${mood}|${b}`));
}
var countUnusedActivityLines = (bank, used, activityId, seed = "") =>
  ACTIVITY_LINE_MOODS.reduce(
    (total, mood) => total + unusedActivityLineIndexes(bank, used, activityId, mood, seed).length,
    0,
  );
function drawActivityLine(bank, life, activityId, worn = false) {
  let lines = bank?.lines?.[activityId];
  if (!lines) {
    return null;
  }
  life.toldUsed ??= {};
  let moods = worn ? ["worn", "fine"] : ["fine", "worn"];
  for (let mood of moods) {
    let unused = unusedActivityLineIndexes(bank, life.toldUsed, activityId, mood, life.seed);
    if (
      (!unused.length &&
        (lines[mood]?.length ?? 0) >= ACTIVITY_LINES_BANK_CAP[mood] &&
        ((life.toldUsed[activityId] = {
          ...(life.toldUsed[activityId] ?? {}),
          [mood]: [],
        }),
        (unused = unusedActivityLineIndexes(bank, life.toldUsed, activityId, mood, life.seed))),
      !unused.length)
    ) {
      continue;
    }
    let index = unused[0],
      usedFor = (life.toldUsed[activityId] ??= {});
    (usedFor[mood] ??= []).push(index);
    return lines[mood][index];
  }
  return null;
}
function activityLinesNeedRefill(bank, life, activityId) {
  let lines = bank?.lines?.[activityId];
  return lines
    ? !ACTIVITY_LINE_MOODS.every((mood) => (lines[mood]?.length ?? 0) >= ACTIVITY_LINES_BANK_CAP[mood]) &&
        countUnusedActivityLines(bank, life.toldUsed, activityId, life.seed) <= ACTIVITY_LINES_REFILL_THRESHOLD
    : true;
}
function placesMissingActivityLines(bank, places = []) {
  return places.filter(
    (place) =>
      directPlaceActivities(place).length &&
      directPlaceActivities(place).some((activity) => !bank?.lines?.[activity.id]),
  );
}
function activityIdsToWriteFor(bank, activityId) {
  let place = placeForActivityId(activityId);
  if (!place) {
    return [];
  }
  let missing = directPlaceActivities(place)
    .map((id) => id.id)
    .filter((id) => !bank?.lines?.[id]);
  return missing.length ? (missing.includes(activityId) ? missing : [...missing, activityId]) : [activityId];
}
var formatActivityDuration = (minutes) =>
  minutes >= 60 ? `${Math.round((minutes / 60) * 10) / 10} h` : `${minutes} min`;
function buildActivityLinesMessages(place, ids, { language = "English", existing = {} } = {}) {
  let list = directPlaceActivities(place)
      .filter((activity) => ids.includes(activity.id))
      .map(
        (activity) =>
          `- ${activity.id}: ${activity.name}${activity.minutes ? ` (${formatActivityDuration(activity.minutes)})` : ""}`,
      ).join(`
`),
    placeLabel =
      place === "home"
        ? "the player's own home"
        : `a ${(TOWN_PLACES.find((place2) => place2.id === place)?.name ?? place).toLowerCase()}`,
    existingLines = ids.flatMap((id) =>
      [...(existing[id]?.fine ?? []), ...(existing[id]?.worn ?? [])].slice(-24).map((line) => `- ${id}: ${line}`),
    ).join(`
`);
  return [
    {
      role: "system",
      content: [
        "Task: activity-lines",
        "You write the one line of narration shown after the player does something in a modern life sim: what it was like.",
        "",
        'Answer with JSON only, one entry for every id listed, exactly: {"<id>":{"fine":["\u2026"],"worn":["\u2026"]}}',
        `\`fine\`: ${ACTIVITY_LINES_PER_REQUEST.fine} different lines for when the player finishes it in decent shape.`,
        `\`worn\`: ${ACTIVITY_LINES_PER_REQUEST.worn} different lines for when the player finishes it worn out or hungry.`,
        'Each line: second person ("you"), one or two short sentences about doing it. No quotation marks, no numbers, no stats, no rewards.',
        'These lines are shared by many different games: never give the place or the town a name (say "the gym", "the caf\xE9", "your flat"), never name or single out anybody the player might know (strangers in passing are fine, without names), and never say the time of day, the weather or the season.',
        existingLines ? "Never repeat or closely paraphrase a line that already exists (listed below)." : "",
        `Write every line in ${language}.`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: `THE PLACE: ${placeLabel}

WHAT THE PLAYER CAN DO THERE:
${list}${
        existingLines
          ? `

LINES THAT ALREADY EXIST:
${existingLines}`
          : ""
      }`,
    },
  ];
}
function cleanNarrationLine(text) {
  if (typeof text != "string") {
    return "";
  }
  let line = text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["“”«»'‘’]+|["“”«»'‘’]+$/g, "")
    .trim();
  if (line.length > ACTIVITY_LINE_MAX_LENGTH) {
    line = `${line.slice(0, ACTIVITY_LINE_MAX_LENGTH - 1).trimEnd()}\u2026`;
  }
  return line;
}
function parseActivityLines(json, ids) {
  let pick = (list, max) => (Array.isArray(list) ? list.map(cleanNarrationLine).filter(Boolean).slice(0, max) : []),
    lines = {};
  for (let id of ids) {
    let fine = pick(json?.[id]?.fine, ACTIVITY_LINES_PER_REQUEST.fine + 2),
      worn = pick(json?.[id]?.worn, ACTIVITY_LINES_PER_REQUEST.worn + 2);
    if (fine.length || worn.length) {
      lines[id] = {
        fine: fine,
        worn: worn,
      };
    }
  }
  if (!Object.keys(lines).length) {
    throw new Error("The model did not write the lines that were asked for.");
  }
  return lines;
}
async function requestActivityLines(model, place, ids, options = {}) {
  let { json: json } = await model.askJson(buildActivityLinesMessages(place, ids, options), {
    maxTokens: 1600,
    task: "activity-lines",
    about: place,
  });
  return parseActivityLines(json, ids);
}
function mergeActivityLinesIntoBank(bank, lines) {
  bank.lines ??= {};
  for (let [id, moods] of Object.entries(lines)) {
    let entry = (bank.lines[id] ??= {
      fine: [],
      worn: [],
    });
    for (let mood of ACTIVITY_LINE_MOODS) {
      entry[mood] ??= [];
      for (let line of moods[mood] ?? []) {
        if (entry[mood].length >= ACTIVITY_LINES_BANK_CAP[mood]) {
          break;
        }
        if (!entry[mood].includes(line)) {
          entry[mood].push(line);
        }
      }
    }
  }
  return bank;
}

export {
  activityIdsToWriteFor,
  activityLinesNeedRefill,
  cleanNarrationLine,
  countUnusedActivityLines,
  drawActivityLine,
  emptyLinesBank,
  fnv1aHash,
  mergeActivityLinesIntoBank,
  normalizeLinesLanguageKey,
  placeForActivityId,
  placesMissingActivityLines,
  requestActivityLines,
};
