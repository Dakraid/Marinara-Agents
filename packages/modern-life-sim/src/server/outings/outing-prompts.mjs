// Outing LLM prompts (invite, arrive, talk, moment, interrupt, goodbye) and parsers
import { jobPromptLine } from "../jobs/town-jobs.mjs";
import { residencePromptLine } from "../housing/residences.mjs";
import { orientationPromptLines } from "../orientation/orientation.mjs";
import { relationshipProfile } from "../traits/traits.mjs";
import { PLAYER_PERSONA_HEADER, splitTextIntoChunks, truncateAtSentence } from "../scenes/text-helpers.mjs";
import { toPlayerNote } from "../relationships/kin.mjs";
import {
  NO_RUMORS_RULE,
  SECOND_PERSON_RULE,
  SUGGESTIONS_KNOWLEDGE_RULE,
  normalizeRememberEach,
  pickRememberOthers,
  rememberEachJsonShape,
  rememberEachMaxTokens,
  rememberEachRule,
  rememberSpecFor,
  rememberTooBlock,
} from "../scenes/scene-config.mjs";
import { HERE_NOW_LINE, picturePromptRule, plansAheadBlock, unansweredMoneyAskNote } from "../scenes/scene-engine.mjs";
import { dateTasteVerdict, dateTastesFor } from "./date-tastes.mjs";
import { OUTING_PLACES } from "./outing-places.mjs";

var OUTING_NARRATION_RULE = `Never write what the player says, does or thinks: only this person, and short narration of what happens. Nobody else is in it unless they are given here. ${SECOND_PERSON_RULE}`;
var outingPersonCardBlock = (person, tone) => `Name: ${person.name}
${String(person.description ?? "").slice(0, 1400)}${
  orientationPromptLines(person)
    ? `
${orientationPromptLines(person)}`
    : ""
}${
  person.home
    ? `
${residencePromptLine(person.home)}`
    : ""
}${
  person.work
    ? `
${jobPromptLine(person.work)}`
    : ""
}${
  person.toYou
    ? `
${toPlayerNote(person.toYou)}`
    : ""
}${
  person.appearance
    ? `
How they look: ${String(person.appearance).slice(0, 500)}`
    : ""
}${
  tone
    ? `
How they come across: ${tone}`
    : ""
}`;
var outingBondSummary = (bond) =>
  bond
    ? `Friendship: ${bond.friendship} \xB7 Romance: ${bond.romance} \xB7 Trust: ${bond.trust}${
        bond.what
          ? `
${bond.what}`
          : bond.status
            ? ` \xB7 ${bond.status}`
            : ""
      }`
    : "";
var outingMemoriesBlock = (memories = []) =>
  memories.length
    ? `WHAT THEY REMEMBER OF THE PLAYER, oldest first:
${memories.map((memory) => (typeof memory == "string" ? `- ${memory}` : `- (${memory.when}) ${memory.text}`)).join(`
`)}`
    : "";
var outingKindPhrase = (kind) =>
  kind === "wedding"
    ? "their wedding day: the player and them are getting married today, their guests with them"
    : kind === "honeymoon"
      ? "their honeymoon: the player and them, just married, on a trip together, just the two of them"
      : kind === "date"
        ? "a date: romantic"
        : "a hang out: as friends";
var parseOutingLines = (raw, speakerIds = [], maxLines = 4) =>
  (Array.isArray(raw) ? raw : []).slice(0, maxLines + speakerIds.length).flatMap((line) =>
    splitTextIntoChunks(truncateAtSentence(line?.text, 4e3), 420).map((chunk) => ({
      who: line?.who === "narration" ? "narration" : "them",
      ...(speakerIds.includes(String(line?.who ?? ""))
        ? {
            by: String(line.who),
          }
        : {}),
      text: chunk,
    })),
  );
function inviteAnswerPrompt(
  person,
  {
    player = "the player",
    kind: kind,
    place = "",
    when = "",
    answer: answer,
    why = "",
    counter = "",
    language = "English",
    tone = "",
    setting = "",
    bond = null,
    memories = [],
    also = [],
  },
) {
  let decided =
    answer === "yes"
      ? "They say yes."
      : answer === "counter"
        ? `They want to go, but they cannot then (${why}); they suggest ${counter} instead.`
        : `They say no (${why}), in their own way, true to who they are.`;
  return [
    {
      role: "system",
      content: [
        "Task: invite-answer",
        `In a modern life sim, ${player} asks ${person.name} out: ${outingKindPhrase(kind)}, at ${place}, ${when}. The game has already decided the answer. ${decided}`,
        also.length
          ? `It is a group outing: ${player} also asked ${also.map((partner) => `${partner.name} (${partner.answer === "yes" ? "coming" : "not coming"})`).join(" and ")}, ${player}'s other partners; everyone agreed to it. They may react to that too.`
          : "",
        'Answer with JSON only, exactly: {"line":"\u2026"}',
        "`line`: what they say, one or two short sentences, first person. No narration, no stage directions, no quotation marks.",
        "Match how well they know the player. Keep it non-explicit.",
        NO_RUMORS_RULE,
        `Write it in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        setting
          ? `THE SETTING:
${setting}
`
          : "",
        `THE PERSON:
${outingPersonCardBlock(person, tone)}`,
        `
BETWEEN THEM: ${outingBondSummary(bond)}`,
        outingMemoriesBlock(memories),
      ].filter(Boolean).join(`
`),
    },
  ];
}
function parseInviteAnswer(raw) {
  let line = truncateAtSentence(raw?.line, 300);
  if (!line) {
    throw new Error("The model did not write their answer.");
  }
  return line;
}
function outingContextBlock(
  person,
  {
    player: player,
    kind: kind,
    place: place,
    time: time,
    setting: setting,
    tone: tone,
    bond: bond,
    memories: memories,
    ahead = [],
    log = [],
    mood = "",
    others = [],
    birthday = "",
    friendOf = false,
  },
) {
  return [
    `WHERE: ${place}${time ? ` \xB7 NOW: ${time}` : ""} \xB7 ${outingKindPhrase(kind)}`,
    HERE_NOW_LINE,
    birthday ? `THE OCCASION: ${birthday}` : "",
    setting
      ? `THE SETTING:
${setting}`
      : "",
    `${PLAYER_PERSONA_HEADER}: ${player}`,
    "",
    "THE PERSON:",
    outingPersonCardBlock(person, tone),
    "",
    `BETWEEN THEM AND THE PLAYER: ${outingBondSummary(bond)}`,
    outingMemoriesBlock(memories),
    plansAheadBlock(ahead),
    mood ? `HOW THE OUTING IS GOING SO FAR: ${mood}` : "",
    others.length
      ? `
${kind === "wedding" ? "THE GUESTS (people the player invited to the wedding; each may speak" : birthday ? "ALSO AT THE PARTY (people close to the one whose birthday it is; each may speak" : friendOf ? "ALSO ON THE OUTING (a friend of theirs they brought along, for the player to meet; each may speak" : "ALSO ON THE OUTING (the player's other partners, each agreed to the others; each may speak"}, their lines have their id in \`who\`):
${others.map(
  (other) =>
    `- ${other.id}: ${other.name}${other.tone ? ` \u2014 ${other.tone}` : ""}${other.with ? ` \xB7 with ${person.name}: ${other.with}` : ""}`,
).join(`
`)}`
      : "",
    log.length
      ? `
THE OUTING SO FAR:
${log.map((entry) =>
  entry.who === "you"
    ? `PLAYER: ${entry.text}`
    : entry.who === "narration"
      ? `(${entry.text})`
      : entry.by
        ? `${entry.by}: ${entry.text}`
        : `THEM: ${entry.text}`,
).join(`
`)}`
      : "",
  ].filter((line) => line !== "").join(`
`);
}
var outingLeadOrWrapRule = (ctx) =>
  ctx.lead
    ? `Close the lines with a short narration that brings on what happens next at the place: ${ctx.choices?.length ? "the one you put in `next`" : ctx.lead}. Only bring it on \u2014 it is played right after, by the player's call.`
    : ctx.last
      ? `The outing is coming to its end (the time is up, or the place is closing): they start to wrap it up. Nobody leaves yet and nothing of how they say goodbye happens \u2014 no kiss, no hug, nobody sets off walking home: the player makes that call next.${ctx.asks ? ` ${ctx.asks}` : ""}`
      : "";
var outingComingMomentsRule = (ctx) =>
  ctx.coming?.length
    ? `Still to come at the place, each played later by the player's call: ${ctx.coming.map((momentLabel) => `\xAB${momentLabel}\xBB`).join(", ")}. Nobody does any of it in these lines \u2014 nobody picks it, orders it, pays or starts it yet; talking about it is fine.`
    : "";
var momentIdList = (moments, usualId = "") =>
  moments
    .map((moment) => `${moment.id} (${moment.name}${moment.id === usualId ? ", the usual one" : ""})`)
    .join(" \xB7 ");
var outingNextMomentRule = (ctx) =>
  ctx.lead && ctx.choices?.length
    ? `\`next\`: what happens next at the place \u2014 the one the talk leads to, exactly one id of: ${momentIdList(ctx.choices, ctx.usual)}.`
    : "";
var outingPlayerMomentRule = (ctx) =>
  ctx.playable?.length
    ? `\`moment\`: only when THE PLAYER DOES proposes or starts one of these things of the place, now: its id \u2014 ${momentIdList(ctx.playable)}. Anything else, "". It says only what the player proposed: it is played right after, by the player's call, so the lines only react to the idea and bring on nothing else (whatever else was about to come waits).`
    : "";
var outingStayAtPlaceRule = (ctx) =>
  ["date", "hang"].includes(ctx.kind) && ctx.place
    ? `The outing is here, at ${ctx.place}, until its goodbye: nobody leaves for somewhere else in these lines.`
    : ["wedding", "honeymoon"].includes(ctx.kind)
      ? "However it is going, it goes on to its end: nobody walks out or cuts it short; a bad mood shows only in how they are and what they say."
      : "";
var pickOutingMomentId = (raw, moments = []) => {
  let id = String(raw ?? "").trim();
  return moments.some((moment) => moment.id === id) ? id : null;
};
var outingWantsSuggestions = (ctx) => !ctx.lead && !ctx.last;
var outingSuggestionsRule = (ctx) =>
  outingWantsSuggestions(ctx)
    ? `\`suggestions\`: three different things the player could say or do next, written as the player, short (at most 60 characters), each with a different attitude. ${SUGGESTIONS_KNOWLEDGE_RULE}`
    : "";
var outingSuggestionsShape = (ctx) =>
  outingWantsSuggestions(ctx) ? ',"suggestions":["\u2026","\u2026","\u2026"]' : "";
var outingOtherSpeakersRule = (ctx) =>
  ctx.others?.length
    ? ` Someone else on the outing speaking: \`who\` is their id (${ctx.others.map((other) => `"${other.id}"`).join(", ")}).`
    : "";
var outingContentRule = (ctx) =>
  ctx?.content
    ? `Keep it grounded and in character. ${ctx.content}`
    : "Keep it grounded, in character and non-explicit.";
function outingArrivePrompt(person, ctx) {
  return [
    {
      role: "system",
      content: [
        "Task: outing-arrive",
        `You write the start of an outing in a modern life sim: ${person.name} and the player meet at ${ctx.place}, as they agreed. What happens is already decided: ${ctx.words.join(" ")}`,
        `Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}]${outingSuggestionsShape(ctx)}}`,
        `\`lines\`: 1 to 3 short segments: they see the player arrive and react. \`who\` is "them" for what they say, "narration" for a short line of what happens.${outingOtherSpeakersRule(ctx)}`,
        outingLeadOrWrapRule(ctx),
        outingComingMomentsRule(ctx),
        outingStayAtPlaceRule(ctx),
        outingSuggestionsRule(ctx),
        OUTING_NARRATION_RULE,
        NO_RUMORS_RULE,
        outingContentRule(ctx),
        `Write every line in ${ctx.language}.`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: outingContextBlock(person, ctx),
    },
  ];
}
var MEAL_PROPOSAL_KINDS = ["you", "them", "together"];
var mealProposalRule = (person) =>
  `\`meal\`: only when THE PLAYER DOES proposes cooking or eating here, now: "you" when the player says they will cook, "them" when the player asks ${person.name} to cook (or takes up their offer), "together" when the player proposes cooking together. Anything else, null. It says only what the player proposed; whether and how it happens is decided after, so the lines only react to the idea.`;
var parseMealProposal = (raw) =>
  MEAL_PROPOSAL_KINDS.includes(
    String(raw ?? "")
      .trim()
      .toLowerCase(),
  )
    ? String(raw).trim().toLowerCase()
    : null;
function outingTalkPrompt(person, ctx) {
  let free = ctx.free ?? null,
    translateYou = !!ctx.byGame && !/^english$/i.test(String(ctx.language ?? "English").trim());
  return [
    {
      role: "system",
      content: [
        "Task: outing-talk",
        `You continue an outing in a modern life sim, as a visual-novel scene: ${person.name} and the player at ${ctx.place}, ${outingKindPhrase(ctx.kind)}. It is going ${ctx.mood || "fine"}. The player says or does something (THE PLAYER DOES).`,
        `First, read what the player does the way THIS person would take it: \`read\` is exactly one of ${ctx.reads.join(", ")}. Then write their reaction, true to that read, and let the talk go on.`,
        `Answer with JSON only, exactly: {"read":"\u2026","lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}]${outingSuggestionsShape(ctx)}${outingNextMomentRule(ctx) ? ',"next":"\u2026"' : ""}${ctx.meal ? ',"meal":null' : ""}${outingPlayerMomentRule(ctx) ? ',"moment":""' : ""}${free ? `,${ctx.didShape}` : ctx.askShape ? `,${ctx.askShape}` : ""}${translateYou ? ',"you":"\u2026"' : ""}}`,
        `\`lines\`: 1 to 3 short segments. \`who\` is "them" for what they say, "narration" for a short line of what happens.${outingOtherSpeakersRule(ctx)}`,
        outingLeadOrWrapRule(ctx),
        outingNextMomentRule(ctx),
        outingComingMomentsRule(ctx),
        outingStayAtPlaceRule(ctx),
        outingSuggestionsRule(ctx),
        OUTING_NARRATION_RULE,
        NO_RUMORS_RULE,
        `They never set a new day, time or place to meet here. ${outingContentRule(ctx)}`,
        ctx.meal ? mealProposalRule(person) : "",
        outingPlayerMomentRule(ctx),
        free
          ? `
${ctx.freeBlock}`
          : ctx.askLine
            ? `
${ctx.askLine}`
            : "",
        `Write every line in ${ctx.language}. \`read\` stays one of the words above, in English.`,
        translateYou
          ? `What the player does was written by the game, in English: return it in \`you\` as it reads in ${ctx.language}, keeping its parentheses and \xAB\xBB.`
          : "",
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: [
        outingContextBlock(person, ctx),
        free
          ? `
${ctx.freeFacts}`
          : "",
        `
THE PLAYER DOES: ${ctx.text}`,
      ].filter(Boolean).join(`
`),
    },
  ];
}
function outingMomentPrompt(person, ctx) {
  let free = ctx.free ?? null;
  return [
    {
      role: "system",
      content: [
        "Task: outing-moment",
        `You write one moment of an outing in a modern life sim: ${person.name} and the player at ${ctx.place}. THE MOMENT: ${ctx.moment}.`,
        ctx.choice ? `The player chose: ${ctx.choice}.` : "The player does what THE PLAYER DOES says.",
        ctx.words?.length ? `How it lands, already decided: ${ctx.words.join(" ")}` : "",
        ctx.text
          ? `First, read what the player does the way THIS person would take it: \`read\` is exactly one of ${ctx.reads.join(", ")}. Then write their reaction, true to that read.`
          : "",
        `Answer with JSON only, exactly: {${ctx.text ? '"read":"\u2026",' : ""}"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}]${outingSuggestionsShape(ctx)}${outingNextMomentRule(ctx) ? ',"next":"\u2026"' : ""}${free ? `,${ctx.didShape}` : ctx.askShape ? `,${ctx.askShape}` : ""}${ctx.picture ? ',"picture":{"prompt":"\u2026"}' : ""}}`,
        ctx.picture
          ? picturePromptRule(
              "this moment, the two of them, at its peak \u2014 never the instant before or after",
              ctx.picture,
            )
          : "",
        `\`lines\`: 1 to 3 short segments of the moment and their reaction. \`who\` is "them" or "narration".${outingOtherSpeakersRule(ctx)}`,
        outingLeadOrWrapRule(ctx),
        outingNextMomentRule(ctx),
        outingComingMomentsRule(ctx),
        outingStayAtPlaceRule(ctx),
        outingSuggestionsRule(ctx),
        OUTING_NARRATION_RULE,
        NO_RUMORS_RULE,
        `They never set a new day, time or place to meet here. ${outingContentRule(ctx)}`,
        free
          ? `
${ctx.freeBlock}`
          : ctx.askLine
            ? `
${ctx.askLine}`
            : "",
        `Write every line in ${ctx.language}.${ctx.text ? " `read` stays one of the words above, in English." : ""}`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: [
        outingContextBlock(person, ctx),
        free
          ? `
${ctx.freeFacts}`
          : "",
        ctx.text
          ? `
THE PLAYER DOES: ${ctx.text}`
          : "",
      ].filter(Boolean).join(`
`),
    },
  ];
}
function outingInterruptPrompt(person, intruder, ctx) {
  return [
    {
      role: "system",
      content: [
        "Task: outing-interrupt",
        `You write an interruption in an outing of a modern life sim: the player is out with ${person.name} (${outingKindPhrase(ctx.kind)}) at ${ctx.place}, and ${intruder.name} is there and sees them.`,
        `What it is, already decided: ${ctx.words.join(" ")}`,
        `Answer with JSON only, exactly: {"lines":[{"who":"${intruder.id}","text":"\u2026"},{"who":"${person.id}","text":"\u2026"}]}`,
        `\`lines\`: 2 to 4 short segments; \`who\` is "${intruder.id}" for what ${intruder.name} says, "${person.id}" for what ${person.name} says, or "narration".`,
        "Stop before the player reacts: nobody leaves, storms off or makes up yet, and nothing between them is settled. The player makes the call next.",
        OUTING_NARRATION_RULE,
        "Keep it grounded, in character and non-explicit.",
        `Write every line in ${ctx.language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        `${person.id} \xB7 ${outingPersonCardBlock(person, ctx.dateTone)}`,
        `
${intruder.id} \xB7 ${outingPersonCardBlock(intruder, ctx.otherTone)}`,
        ctx.setting
          ? `
THE SETTING:
${ctx.setting}`
          : "",
      ].join(`
`),
    },
  ];
}
function parseInterruptLines(raw, speakerIds) {
  let lines = (Array.isArray(raw?.lines) ? raw.lines : [])
    .slice(0, 5)
    .map((line) => {
      let who = String(line?.who ?? "");
      return splitTextIntoChunks(truncateAtSentence(line?.text, 4e3), 420).map((chunk) => ({
        who: speakerIds.includes(who) ? who : "narration",
        text: chunk,
      }));
    })
    .flat();
  if (!lines.length) {
    throw new Error("The model did not write the interruption.");
  }
  return lines;
}
var OUTING_REMEMBER_MAX_CHARS = 700;
var talkMemoryBudget = () => rememberSpecFor("talk");
function outingGoodbyePrompt(person, ctx) {
  let others = pickRememberOthers(ctx.each);
  return [
    {
      role: "system",
      content: [
        "Task: outing-goodbye",
        `You write the end of an outing in a modern life sim: ${person.name} and the player at ${ctx.place}. ${ctx.what}`,
        `Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"remember":"\u2026"${rememberEachJsonShape(others)}}`,
        `\`lines\`: 2 to 4 short segments of the goodbye. \`who\` is "them" or "narration".${outingOtherSpeakersRule(ctx)}`,
        `\`remember\` is what they will remember of this outing: three to five complete sentences from their side, at most ${OUTING_REMEMBER_MAX_CHARS} characters, calling the player by name, with what happened in it. An impression \u2014 never a new plan or a promise.${unansweredMoneyAskNote(
          ctx.unanswered,
          {
            of: "outing",
          },
        )}`,
        rememberEachRule(others, talkMemoryBudget(), "outing"),
        OUTING_NARRATION_RULE,
        NO_RUMORS_RULE,
        outingContentRule(ctx),
        `Write every line in ${ctx.language}.`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: `${outingContextBlock(person, ctx)}${rememberTooBlock(others)}`,
    },
  ];
}
var outingGoodbyeMaxTokens = (ctx, baseTokens = 1100) =>
  rememberEachMaxTokens(baseTokens, pickRememberOthers(ctx?.each));
var parseOutingRememberEach = (raw, ctx) =>
  normalizeRememberEach(raw?.remember_each, pickRememberOthers(ctx?.each), talkMemoryBudget().max);
function outingFaintPrompt(person, ctx) {
  return [
    {
      role: "system",
      content: [
        "Task: outing-faint",
        `An outing in a modern life sim was cut short: ${person.name} and the player at ${ctx.place}, and in the middle of it the player collapsed from exhaustion in front of them and was carried away.`,
        'Answer with JSON only, exactly: {"remember":"\u2026"}',
        `\`remember\` is what they will remember of this outing: three to five complete sentences from their side, at most ${OUTING_REMEMBER_MAX_CHARS} characters, calling the player by name, with what happened in it and the player collapsing in front of them. An impression \u2014 never a new plan or a promise.`,
        NO_RUMORS_RULE,
        outingContentRule(ctx),
        `Write it in ${ctx.language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: outingContextBlock(person, ctx),
    },
  ];
}
function outingFarewellPrompt(person, ctx) {
  return [
    {
      role: "system",
      content: [
        "Task: outing-farewell",
        `You write the goodbye of an outing in a modern life sim: ${person.name} and the player at ${ctx.place}; the player says they should get going, and it went ${ctx.mood || "fine"}. Write how the goodbye starts: they are about to part.`,
        'Answer with JSON only, exactly: {"lines":[{"who":"them","text":"\u2026"}]}',
        `\`lines\`: 1 to 3 short segments. \`who\` is "them" or "narration".${outingOtherSpeakersRule(ctx)}`,
        "Nobody leaves yet and nothing is decided: the player makes the call at the end (a kiss, walking them home, a hug\u2026). So none of those happens in these lines, not even in passing: nobody kisses, hugs goodbye or sets off walking home yet.",
        ctx.asks || "",
        OUTING_NARRATION_RULE,
        NO_RUMORS_RULE,
        outingContentRule(ctx),
        `Write every line in ${ctx.language}.`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: outingContextBlock(person, ctx),
    },
  ];
}
var parseSuggestionList = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .map((item) => truncateAtSentence(item, 60))
    .filter(Boolean)
    .slice(0, 3);
var parseOutingLinesOrThrow = (raw, speakerIds = []) => {
  let lines = parseOutingLines(raw?.lines, speakerIds);
  if (!lines.length) {
    throw new Error("The model did not write it.");
  }
  return lines;
};
var outingPlaceVerdict = (character, bond, placeId) =>
  dateTasteVerdict(dateTastesFor(character, bond?.archetype), "outings", OUTING_PLACES[placeId]?.outing);
var personalityProfileOf = (character) => relationshipProfile(character);

export {
  MEAL_PROPOSAL_KINDS,
  OUTING_REMEMBER_MAX_CHARS,
  inviteAnswerPrompt,
  outingArrivePrompt,
  outingFaintPrompt,
  outingFarewellPrompt,
  outingGoodbyeMaxTokens,
  outingGoodbyePrompt,
  outingInterruptPrompt,
  outingMomentPrompt,
  outingPlaceVerdict,
  outingTalkPrompt,
  parseInterruptLines,
  parseInviteAnswer,
  parseMealProposal,
  parseOutingLinesOrThrow,
  parseOutingRememberEach,
  parseSuggestionList,
  personalityProfileOf,
  pickOutingMomentId,
};
