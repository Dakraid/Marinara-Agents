// LLM prompt, validation and parsing for one intimate or dance passage
import { PLAYER_PERSONA_HEADER } from "../scenes/text-helpers.mjs";
import { NO_RUMORS_RULE, SECOND_PERSON_RULE, normalizeRemember } from "../scenes/scene-config.mjs";
import {
  HERE_NOW_LINE,
  acquaintanceLine,
  betweenThemBlock,
  describeScenePerson,
  formatSceneLog,
  normalizePicture,
  parseSceneLines,
  picturePromptRule,
  settingBlock,
} from "../scenes/scene-engine.mjs";
import { SHORT_LINE_MAX, STAY_IN_PLACE_RULE, beatPhaseOf, explicitPassagePlan } from "./tuning.mjs";
import { DANCE_SEGMENT_RANGE, PASSAGE_WORDS_RULE, SEGMENT_LENGTH_RULE } from "./after-dark.mjs";

var PASSAGE_OPTION_KEYS = ["a", "b", "c"];
var adultHttpError = (statusCode, message) =>
  Object.assign(new Error(message), {
    statusCode: statusCode,
  });
function truncatePassageOption(text) {
  if (text.length <= SHORT_LINE_MAX) {
    return text;
  }
  let cut = text.slice(0, SHORT_LINE_MAX - 1),
    lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > SHORT_LINE_MAX / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, "")}\u2026`;
}
function normalizePassageOptions(raw) {
  let options = [];
  for (let item of Array.isArray(raw) ? raw : []) {
    let rawKey = String(item?.key ?? "")
        .trim()
        .toLowerCase(),
      key = PASSAGE_OPTION_KEYS.includes(rawKey)
        ? rawKey
        : ["1", "2", "3"].includes(rawKey)
          ? PASSAGE_OPTION_KEYS[Number(rawKey) - 1]
          : rawKey
            ? null
            : PASSAGE_OPTION_KEYS.find((candidate) => !options.some((option) => option.key === candidate)),
      text = truncatePassageOption(
        String(item?.text ?? "")
          .replace(/\s+/g, " ")
          .trim(),
      );
    if (key && text && !options.some((option) => option.key === key)) {
      options.push({
        key: key,
        text: text,
      });
    }
  }
  return options.sort((left, right) => PASSAGE_OPTION_KEYS.indexOf(left.key) - PASSAGE_OPTION_KEYS.indexOf(right.key));
}
var INTIMATE_PASSAGE_PART_NOTES = {
  start:
    "This passage: it begins \u2014 they are already where it happens: closeness, kisses, touching, clothes coming off. By its end they are into it; the next passage is already the act itself.",
  rise: "This passage: the act itself, already under way, in full \u2014 more intense than the passage before. It never goes back to the beginning or to undressing; the climax comes later.",
  peak: "This passage: the climax, in full. The after comes in the next passage.",
  after: "It is over: this is the after.",
  one: "",
};
var DANCE_PASSAGE_PART_NOTES = {
  start:
    "It starts: the music, the first moves, the dancer close to the player and leading it. It builds; the dance is not at its best yet.",
  rise: "It builds: bolder, closer, more of the dance \u2014 still building, not at its best yet.",
  peak: "This is the best of the dance, in full, and it stays a dance. The end of the song comes in the next passage.",
  after: "The song is over: this is the after.",
  one: "",
};
var passagePartFor = beatPhaseOf;
function buildIntimatePassagePrompt(
  person,
  scene,
  {
    n: passageNo,
    of: passageCount,
    direction = "",
    detail = "explicit",
    language = "English",
    tone = "",
    persona = "",
    setting = "",
    place = "",
    time = "",
    memories = [],
    bond = null,
    knows = [],
    ahead = [],
    pairs = [],
    npc = false,
    spot = "",
    picture = false,
    ways = "",
    others = [],
    caught = false,
    dance = false,
  } = {},
) {
  let isLast = passageNo >= passageCount,
    rememberEachShape = others.length
      ? `,"remember_each":{${others.map((other) => `"${other.id}":"\u2026"`).join(",")}}`
      : "",
    tookShape = direction && !dance ? ',"took":{"touch":"","fits":false,"lean":""}' : "",
    fade = detail === "fade",
    replyShape = isLast
      ? `{"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"remember":"\u2026"${rememberEachShape}${tookShape}${picture ? ',"picture":{"prompt":"\u2026"}' : ""}}`
      : `{"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"options":[{"key":"a","text":"\u2026"},{"key":"b","text":"\u2026"},{"key":"c","text":"\u2026"}]${tookShape}${picture ? ',"picture":{"prompt":"\u2026"}' : ""}}`;
  return [
    {
      role: "system",
      content: [
        dance ? "Task: dance-passage" : "Task: intimate-passage",
        dance
          ? "You write one passage of a private dance at a strip club in a visual-novel life sim: the dancer dances for the player, in a private room, and leads it. Both of them are adults. It stays a dance, as the club's rules go: it never turns into sex."
          : others.length
            ? "You write one long passage of an intimate scene in a visual-novel life sim, with more than two people. All of them are adults, each of them wants this, they get along, and nothing happens that any of them does not want. Every one of them takes part."
            : "You write one long passage of an intimate scene in a visual-novel life sim. Both of them are adults, they want this, and nothing happens that either of them does not want.",
        caught
          ? null
          : dance
            ? fade
              ? "This life fades out: keep it suggestive, nothing explicit, and pick up at the end of the song."
              : "This life writes it in full: as explicit as the dance calls for, true to who they are, in prose."
            : fade
              ? "This life fades out: build up to the moment itself, fade out as it begins, and pick up a little later, in the after. Nothing explicit."
              : "This life writes all of it in full: as explicit as the scene calls for, true to who they are, in prose.",
        passageCount > 1
          ? `This is passage ${passageNo} of ${passageCount}. ${
              dance
                ? ""
                : `${explicitPassagePlan(passageCount, {
                    steer: true,
                  })} `
            }${(dance ? DANCE_PASSAGE_PART_NOTES : INTIMATE_PASSAGE_PART_NOTES)[passagePartFor(passageNo, passageCount)]}`
          : null,
        STAY_IN_PLACE_RULE,
        NO_RUMORS_RULE,
        direction ? `How the player chose to go on: ${direction}` : null,
        caught
          ? "Somebody who works there walks in on them before it goes far: it stops right there, they have to cover up and leave, embarrassed. Write it up to that moment, then the after: outside, a few lines true to who they are."
          : null,
        isLast
          ? `${caught ? "This is the last passage: it ends when they are found. " : `This is the last passage: ${passageCount > 1 ? "the after" : "bring it to its end, then the after"} \u2014 a few lines of ${others.length ? "all of them" : "the two of them"} right after, true to who they are. `}\`remember\` is what they will keep of it: one or two sentences from their side, at most 240 characters, calling the player by name.${others.length ? " `remember_each` is the same for each of the others, from each one's own side." : ""}`
          : `End it at an open point, where it could go more than one way. \`options\` are three different ways it could go on from exactly there, written as what the player does, short (at most ${SHORT_LINE_MAX} characters each), each different in mood; \`key\` is a, b and c.${dance ? "" : " All three stay within the act, where the plan has it now: none of them holds it off or goes back to the start."}`,
        `Answer with JSON only, exactly: ${replyShape}`,
        SEGMENT_LENGTH_RULE,
        PASSAGE_WORDS_RULE,
        `\`lines\`: ${dance ? `${DANCE_SEGMENT_RANGE[0]} to ${DANCE_SEGMENT_RANGE[1]}` : "6 to 12"} segments, mostly narration, with what they say; \`who\` is "them" or "narration"${others.length ? `, or the id of one of the others (${others.map((other) => `"${other.id}"`).join(", ")}) for what they say` : ""}. The narration may tell what the player does as they chose it; never what the player says or thinks. ${SECOND_PERSON_RULE}`,
        ways || null,
        picture ? picturePromptRule("the peak of this passage, AS it happens", picture) : null,
        `Write \`lines\`, \`options\` and \`remember\`${others.length ? " and `remember_each`" : ""} in ${language}.${tookShape ? " `took` stays in English: ids, axes and values exactly as given above." : ""}`,
      ].filter((part) => part !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 NOW: ${time}` : ""}`,
        HERE_NOW_LINE,
        spot ? `WHERE THEY ARE: ${spot}` : "",
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          known: true,
        }),
        "",
        others.length
          ? `ALSO IN IT (the others, by id):
${others.map(
  (other) => `- ${other.id}: ${other.name}${other.description ? ` (${other.description.slice(0, 160)})` : ""}`,
).join(`
`)}`
          : "",
        "BETWEEN THEM AND THE PLAYER:",
        betweenThemBlock({
          bond: bond,
          memories: memories,
          knows: knows,
          ahead: ahead,
          pairs: pairs,
        }) ||
          acquaintanceLine({
            npc: npc,
            memories: memories,
          }),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
      ].filter((part) => part !== "").join(`
`),
    },
  ];
}
function parsePassageLines(rawLines, otherIds = []) {
  let rows = Array.isArray(rawLines) ? rawLines.slice(0, MAX_PASSAGE_LINES) : [],
    lines = [];
  for (let i = 0; i < rows.length; i += 6) {
    try {
      lines.push(...parseSceneLines(rows.slice(i, i + 6), otherIds));
    } catch {
      // Best effort: nothing to do when this fails.
    }
  }
  return lines;
}
var MAX_PASSAGE_LINES = 12;
function checkIntimatePassageReply(reply, { options: needOptions = false } = {}) {
  let lines = Array.isArray(reply?.lines) ? reply.lines.slice(0, MAX_PASSAGE_LINES) : [];
  if (!lines.length) {
    return '"lines" is empty';
  }
  let badIndex = lines.findIndex((line) => typeof line?.text != "string" || !line.text.trim());
  return badIndex >= 0
    ? `line ${badIndex + 1} of "lines" has no text`
    : needOptions && !normalizePassageOptions(reply?.options).length
      ? '"options" has none of the three ways on, keyed a, b and c'
      : "";
}
async function writeIntimatePassage(model, scene, person, opts) {
  let wantOptions = opts.n < opts.of,
    attempt = 0,
    { json: json } = await model.askJson(buildIntimatePassagePrompt(person, scene, opts), {
      maxTokens: 2200,
      task: opts.dance ? "dance-passage" : "intimate-passage",
      about: person.name,
      check: (reply) =>
        checkIntimatePassageReply(reply, {
          options: wantOptions && attempt++ === 0,
        }),
    });
  return {
    lines: parsePassageLines(
      json?.lines,
      (opts.others ?? []).map((other) => other.id),
    ),
    remembers: Object.fromEntries(
      (opts.others ?? [])
        .map((value) => [value.id, normalizeRemember(json?.remember_each?.[value.id])])
        .filter(([, value]) => value),
    ),
    options: opts.n >= opts.of ? [] : normalizePassageOptions(json?.options),
    remember: normalizeRemember(json?.remember),
    picture: opts.picture ? normalizePicture(json?.picture) : null,
    took: opts.direction && !opts.dance && json?.took && typeof json.took == "object" ? json.took : null,
  };
}

export { adultHttpError, writeIntimatePassage };
