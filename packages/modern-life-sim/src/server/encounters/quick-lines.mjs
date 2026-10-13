// Quick chat/flirt/open-up line bank generation and selection
import { jobPromptLine } from "../jobs/town-jobs.mjs";
import { residencePromptLine } from "../housing/residences.mjs";
import { orientationPromptLines } from "../orientation/orientation.mjs";
import { RELATIONSHIP_STATUS_LABELS, bondTier, currentBondTierName, isActiveRival } from "../relationships/bonds.mjs";
import { truncateAtSentence } from "../scenes/text-helpers.mjs";
import { toPlayerNote } from "../relationships/kin.mjs";

var QUICK_LINE_TOPICS = {
  chat: {
    kind: "quickChat",
    axis: "friendship",
    label: "Chat",
  },
  flirt: {
    kind: "flirt",
    axis: "romance",
    label: "Flirt",
  },
  open: {
    kind: "openUp",
    axis: "trust",
    label: "Open up",
  },
};
var quickLineTopicForKind = (kind) =>
  Object.keys(QUICK_LINE_TOPICS).find((topic) => QUICK_LINE_TOPICS[topic].kind === kind) ?? null;
var QUICK_LINE_COUNTS = {
  good: 5,
  bad: 3,
};
var QUICK_LINE_MAX_CHARS = 200;
var QUICK_LINE_PROMPT_MAX_CHARS = 140;
var quickLineBankKey = (bond) =>
  `${bondTier(bond, "friendship")}.${bondTier(bond, "romance")}.${bondTier(bond, "trust")}.${bond.status}${bond.justFriends ? ".friends" : ""}${bond.romanceable === false ? ".closed" : ""}${isActiveRival(bond) ? ".rival" : ""}`;
var quickLineOutcome = (topic, deltas = {}, crossed = {}) => {
  let axis = QUICK_LINE_TOPICS[topic]?.axis;
  return (deltas[axis] ?? 0) > 0 || (crossed[axis] && (deltas[axis] ?? 0) >= 0) ? "good" : "bad";
};
function quickLineBankStale(entry, topic, bond, outcome, language = "") {
  let bank = entry.bank?.[topic];
  return (
    !bank || bank.key !== quickLineBankKey(bond) || !bank[outcome]?.length || !!(language && bank.lang !== language)
  );
}
function takeQuickLine(entry, topic, outcome) {
  let lines = entry.bank?.[topic]?.[outcome];
  return lines?.length ? lines.shift() : null;
}
var QUICK_LINE_SITUATIONS = {
  chat: {
    ask: "The player stops them for a quick chat, a few minutes at most.",
    good: "it went well: they are glad to see the player, as warm as this relationship allows.",
    bad: "it fell flat: they are busy, distracted or just not in the mood, still in character.",
  },
  open: {
    ask: "The player opens up to them: tells them something of their own they do not tell just anyone. The line never says what it was.",
    good: "they take it in and it brings them closer: touched, reassuring, or answering in kind, as far as this relationship allows.",
    bad: "it is too soon or too much for them: they get uneasy, deflect or change the subject, still in character.",
  },
  flirt: {
    ask: "The player flirts with them, lightly.",
    good: "they enjoy it and play along, as far as this relationship allows.",
    bad: "it does not land: they deflect, tease it away, or are put off \u2014 whatever fits them and this relationship.",
  },
};
var quickLineBondLabels = (bond) => ({
  friendship: currentBondTierName(bond, "friendship"),
  romance: currentBondTierName(bond, "romance"),
  trust: currentBondTierName(bond, "trust"),
  status: RELATIONSHIP_STATUS_LABELS[bond.status] ?? "Single",
});
function buildQuickLinesPrompt(character, bond, topic, { language = "English", tone = "", setting = "" } = {}) {
  let situation = QUICK_LINE_SITUATIONS[topic],
    labels = quickLineBondLabels(bond),
    about = [
      `Name: ${character.name}`,
      character.description ? `Who they are: ${character.description}` : "",
      orientationPromptLines(character),
      residencePromptLine(character.home),
      jobPromptLine(character.work),
      toPlayerNote(character.toYou),
      tone ? `How they come across: ${tone}` : "",
    ].filter(Boolean).join(`
`),
    standing = [
      `Friendship: ${labels.friendship ?? "Acquaintance"}`,
      `Romance: ${labels.romance ?? "\u2014"}${bond.romanceable === false || bond.justFriends ? " (romance with the player is off the table for them)" : ""}`,
      `Trust: ${labels.trust ?? "Wary"}`,
      `Relationship: ${labels.status ?? "Single"}`,
    ].join(`
`);
  return [
    {
      role: "system",
      content: [
        "Task: quick-lines",
        "You write the short lines a character says when the player runs into them in a modern life sim.",
        `Situation: ${situation.ask}`,
        "",
        'Answer with JSON only, exactly: {"good":["\u2026"],"bad":["\u2026"]}',
        `\`good\`: ${QUICK_LINE_COUNTS.good} different lines for when ${situation.good}`,
        `\`bad\`: ${QUICK_LINE_COUNTS.bad} different lines for when ${situation.bad}`,
        `Each line is only what THEY say to the player: first person, one or two short sentences, at most ${QUICK_LINE_PROMPT_MAX_CHARS} characters, no narration, no stage directions, no quotation marks.`,
        "Never name a particular spot in town, a time of day or the weather: the same line has to work wherever and whenever they run into the player. The town itself and the setting they live in are fine.",
        "They may be at work or not, anywhere: never talk as if they were at their job or doing something tied to a place (a counter, a desk, a till, a class, serving the player). Who they are, yes; where they are, no.",
        "Never set a day or a time to meet, and never ask the player to promise to show up somewhere: the game cannot keep appointments.",
        "Match how well they know the player: an acquaintance does not talk like a best friend.",
        `Write every line in ${language}.`,
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
      }THE CHARACTER:
${about}

WHERE THEY STAND WITH THE PLAYER:
${standing}`,
    },
  ];
}
var clampQuickLine = (line) => (typeof line == "string" ? truncateAtSentence(line, QUICK_LINE_MAX_CHARS) : "");
function parseQuickLines(json) {
  let pick = (list, max) => (Array.isArray(list) ? list.map(clampQuickLine).filter(Boolean).slice(0, max) : []),
    good = pick(json?.good, QUICK_LINE_COUNTS.good + 2),
    bad = pick(json?.bad, QUICK_LINE_COUNTS.bad + 2);
  if (!good.length || !bad.length) {
    throw new Error("The model did not write the lines that were asked for.");
  }
  return {
    good: good,
    bad: bad,
  };
}
async function refillQuickLineBank(model, character, bond, topic, context = {}) {
  let { json: json } = await model.askJson(buildQuickLinesPrompt(character, bond, topic, context), {
      maxTokens: 700,
      task: "quick-lines",
      about: character.name,
    }),
    lines = parseQuickLines(json);
  character.bank = {
    ...(character.bank ?? {}),
    [topic]: {
      key: quickLineBankKey(bond),
      ...(context.language
        ? {
            lang: context.language,
          }
        : {}),
      ...lines,
    },
  };
  return character.bank[topic];
}
async function quickEncounterLine({
  model: model,
  character: character,
  bond: bond,
  topic: topic,
  applied: applied,
  limits = {},
  context = {},
}) {
  let outcome = quickLineOutcome(topic, applied, limits),
    problem = "";
  if (quickLineBankStale(character, topic, bond, outcome, context.language)) {
    try {
      await refillQuickLineBank(model, character, bond, topic, context);
    } catch (err) {
      problem = String(err.message || err);
    }
  }
  return {
    outcome: outcome,
    line: takeQuickLine(character, topic, outcome),
    problem: problem,
  };
}

export { quickEncounterLine, quickLineTopicForKind };
