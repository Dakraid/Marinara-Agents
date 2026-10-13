// Scene state, prompt builders (open/turn/result/goodbye/faint/moment) and LLM runners
import { jobPromptLine } from "../jobs/town-jobs.mjs";
import { residencePromptLine } from "../housing/residences.mjs";
import { eventById } from "../events/event-registry.mjs";
import { advanceEventBeat, currentEventBeat, isEventRun, nextEventBeat } from "../events/event-run.mjs";
import { eventCast, startEventRun } from "../events/event-cast.mjs";
import { orientationPromptLines } from "../orientation/orientation.mjs";
import { BOND_AXES, applyBondAction } from "../relationships/bonds.mjs";
import { PLAYER_PERSONA_HEADER, splitTextIntoChunks, truncateAtSentence } from "./text-helpers.mjs";
import { tierStepMoment, tierStepSizeGuard } from "../relationships/tier-steps.mjs";
import { describeFavourCost, listFavourKindsPrompt, normalizeFavour } from "../relationships/favours.mjs";
import {
  FREE_ACT_DESCRIPTIONS,
  didJsonShapeFor,
  freeActsContextBlock,
  freeActsPromptBlock,
  normalizeDidActs,
  normalizeMoneyAsk,
  normalizeRideAsk,
} from "./free-acts.mjs";
import { toPlayerNote } from "../relationships/kin.mjs";
import {
  MOMENT_NOT_YET_RULE,
  NAME_THE_STEP_RULE,
  NO_PLANS_RULE,
  NO_PLAYER_ACTIONS_RULE,
  NO_RUMORS_RULE,
  SCENE_KINDS,
  SCENE_LINE_MAX_CHARS,
  SCENE_READS,
  SCENE_READ_EFFECTS,
  STEP_LINE_MAX_CHARS,
  SUGGESTIONS_RULE,
  SUGGESTION_MAX_CHARS,
  normalizeRemember,
  normalizeRememberEach,
  pickRememberOthers,
  rememberEachJsonShape,
  rememberEachMaxTokens,
  rememberEachRule,
  rememberSpecFor,
  rememberTooBlock,
} from "./scene-config.mjs";

function createScene({
  kind = "intro",
  characterId: characterId,
  place: place,
  at: at,
  leavesAt = null,
  leaveReason = "leaves",
  axis = null,
  tier = null,
  couple = false,
  event: eventId = null,
}) {
  let spec = SCENE_KINDS[kind],
    eventDef = eventId ? eventById(eventId) : null;
  return {
    kind: kind,
    characterId: characterId,
    cast: [characterId],
    joined: [],
    place: place,
    startedAt: at,
    axis: axis,
    tier: tier,
    couple: couple,
    phase: "talk",
    step: "",
    favour: null,
    verdict: null,
    leavesAt: leavesAt,
    leaveReason: leaveReason,
    exchange: 0,
    max: spec.exchanges,
    log: [],
    batch: [],
    suggestions: [],
    reads: [],
    totals: {
      friendship: 0,
      romance: 0,
      trust: 0,
    },
    lastApplied: null,
    lastLimits: {},
    limits: {},
    nameKnown: kind !== "intro",
    done: false,
    endedBy: null,
    remember: "",
    ...(eventDef ? startEventRun(eventDef) : {}),
  };
}
function checkSceneLines(reply) {
  let badIndex = (Array.isArray(reply?.lines) ? reply.lines.slice(0, 6) : []).findIndex(
    (line) => typeof line?.text != "string" || !line.text.trim(),
  );
  return badIndex < 0 ? "" : `line ${badIndex + 1} of "lines" has no text`;
}
function parseSceneLines(rawLines, castIds = []) {
  let castSet = new Set(castIds),
    lines = (Array.isArray(rawLines) ? rawLines.slice(0, 6) : [])
      .flatMap((line) => {
        let who = String(line?.who ?? ""),
          base = {
            who: who === "narration" ? "narration" : "them",
            ...(castSet.has(who)
              ? {
                  by: who,
                }
              : {}),
          };
        return splitTextIntoChunks(typeof line?.text == "string" ? line.text : "", SCENE_LINE_MAX_CHARS).map(
          (chunk) => ({
            ...base,
            text: chunk,
          }),
        );
      })
      .filter((line) => line.text);
  if (!lines.length) {
    throw new Error("The model did not write the scene.");
  }
  return lines;
}
function parseSceneSuggestions(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((suggestion) =>
      typeof suggestion == "string"
        ? suggestion
            .trim()
            .replace(/^["“”«»]+|["“”«»]+$/g, "")
            .trim()
            .slice(0, SUGGESTION_MAX_CHARS)
        : "",
    )
    .filter(Boolean)
    .slice(0, 3);
}
var normalizeSceneRead = (read) =>
  SCENE_READS.includes(
    String(read ?? "")
      .trim()
      .toLowerCase(),
  )
    ? String(read).trim().toLowerCase()
    : "awkward";
function isLastSceneExchange(scene, now) {
  let spec = SCENE_KINDS[scene.kind] ?? SCENE_KINDS.intro;
  return scene.exchange + 1 >= scene.max
    ? true
    : scene.leavesAt !== null && scene.leavesAt !== undefined && now + spec.minutesPerExchange >= scene.leavesAt;
}
var partyLine = (text) => (text ? `THE PARTY: ${text}` : "");
function describeScenePerson(person, { tone = "", doing = "", known = false } = {}) {
  return [
    known ? `Name: ${person.name}` : `Name: ${person.name} (the player does not know it yet)`,
    person.description ? `Who they are: ${person.description}` : "",
    orientationPromptLines(person),
    residencePromptLine(person.home),
    jobPromptLine(person.work),
    toPlayerNote(person.toYou),
    person.appearance ? `How they look: ${person.appearance}` : "",
    tone ? `How they come across: ${tone}` : "",
    doing ? `What they are doing right now: ${doing}` : "",
  ].filter(Boolean).join(`
`);
}
var otherMemoriesBlock = (others = []) =>
  others.length
    ? `What they remember with other people \u2014 theirs; the player may know none of it. True to who they are and to who the player is to them, they decide what they would tell and what they keep to themselves:
${others.map(
  (other) => `With ${other.name}:
${other.memories.map((memory) => `- (${memory.when}) ${memory.text}`).join(`
`)}`,
).join(`
`)}`
    : "";
function betweenThemBlock({ bond = null, memories = [], knows = [], ahead = [], pairs = [] } = {}) {
  return [
    bond
      ? `Friendship: ${bond.friendship ?? "\u2014"} \xB7 Romance: ${bond.romance ?? "\u2014"} \xB7 Trust: ${bond.trust ?? "\u2014"}`
      : "",
    bond?.what ?? "",
    memories.length
      ? `What they remember about the player, oldest first:
${memories.map((memory) => (typeof memory == "string" ? `- ${memory}` : `- (${memory.when}) ${memory.text}`)).join(`
`)}
These are impressions. If one mentions a plan or a promise, that is what was said back then: only the plans below are agreed, and none of them has happened yet; anything else was loose talk, never hold it against the player. Never quote them back word for word: a phrase repeated scene after scene becomes a tic.`
      : "",
    plansAheadBlock(ahead),
    townKnowledgeBlock(knows),
    otherMemoriesBlock(pairs),
  ].filter(Boolean).join(`
`);
}
function nowAndMemoriesBlock({ now = "", memories = [], ahead = [], player = "the player" } = {}) {
  return [
    now
      ? `
NOW: ${now}`
      : "",
    memories.length
      ? `
WHAT THEY REMEMBER OF ${player.toUpperCase()}, oldest first:
${memories.map((memory) => (typeof memory == "string" ? `- ${memory}` : `- (${memory.when}) ${memory.text}`)).join(`
`)}`
      : "",
    ahead.length
      ? `
${plansAheadBlock(ahead)}`
      : "",
  ].filter(Boolean).join(`
`);
}
var plansAheadBlock = (plans = []) =>
  plans.length
    ? `Plans they have with the player, still to come \u2014 none of it has happened yet, so nobody talks about it as done:
${plans.map((plan) => `- ${plan}`).join(`
`)}`
    : "";
var heardAboutPlayerBlock = (knows = []) =>
  knows.length
    ? `
They have never met the player, but ${townKnowledgeBlock(knows)[0].toLowerCase()}${townKnowledgeBlock(knows).slice(1)}`
    : "";
var townKnowledgeBlock = (knows = []) =>
  knows.length
    ? `What they know about the player from around town, newest first:
${knows.map((fact) => `- ${fact}`).join(`
`)}
They may bring it up if it fits who they are, or keep it to themselves. What they only heard may be wrong.`
    : "";
var HERE_NOW_LINE = "They are here now, whatever they remember of last time.";
var unansweredMoneyAskNote = (ask, { maybe = false, of = "scene" } = {}) =>
  ask
    ? ` In this ${of} they asked the player for $${ask.amount}${ask.what ? ` (${ask.what})` : ""}${maybe ? ", and are still waiting: if the player's answer does not answer it either, what they remember includes that the player left it unanswered." : " and the player never answered: what they remember includes that."}`
    : "";
var settingBlock = (setting) =>
  setting
    ? `THE SETTING:
${setting}`
    : "";
var LEAVE_REASON_PHRASES = {
  closes: "the place closes then",
  lunch: "then the player's lunch break is over",
  sleep: "then they go to bed",
  work: "then they start work",
};
function staysUntilLine({ leaves = "", leaveReason = "leaves" } = {}) {
  return leaves
    ? `THEY CAN STAY UNTIL: ${leaves} (${LEAVE_REASON_PHRASES[leaveReason] ?? "then they have somewhere to be"})`
    : "";
}
var endReasonFromLeave = (scene) =>
  ({
    closes: "closed",
    lunch: "lunch",
    sleep: "sleep",
    work: "work",
  })[scene.leaveReason] ?? "left";
var formatSceneLog = (scene) =>
  scene.log.map((entry) =>
    entry.who === "you"
      ? `PLAYER: ${entry.text}`
      : entry.who === "narration"
        ? `(${entry.text})`
        : entry.by
          ? `${entry.by}: ${entry.text}`
          : `THEM: ${entry.text}`,
  ).join(`
`);
var NPC_STRANGER_NOTE =
  "This person works where the player is and is not someone the player knows: they know the player only from what they remember below, and if there is nothing, this is the first time they meet \u2014 they know nothing of the player's life or of anyone in it.";
var acquaintanceLine = ({ npc = false, memories = [] } = {}) =>
  npc && !memories.length ? "They have never met before." : "They know each other.";
var othersInSceneBlock = (others = []) =>
  others.length
    ? `
ALSO IN THE SCENE (each may speak, true to who they are; their lines have their id in \`who\`):
${others.map(
  (other) =>
    `- ${other.id}: ${other.name}${other.role ? `, ${other.role}` : ""}${other.description ? ` (${other.description.slice(0, 160)})` : ""}`,
).join(`
`)}`
    : "";
var othersWhoRule = (others = []) =>
  others.length
    ? ` Someone else in the scene speaking: \`who\` is their id (${others.map((other) => `"${other.id}"`).join(", ")}).`
    : "";
var moduleSnippets = (ctx, slot) => (ctx.modules ?? []).map((module) => module?.[slot]).filter(Boolean);
var sceneSpeakerIds = (ctx = {}) =>
  [...(ctx.others ?? []).map((other) => other.id), ctx.walkIn?.kind === "quieter" ? null : ctx.walkIn?.id].filter(
    Boolean,
  );
function buildSceneOpenMessages(person, ctx = {}) {
  return ctx.kind === "tier" || ctx.kind === "milestone"
    ? buildTierSceneOpenMessages(person, ctx)
    : ctx.kind === "talk"
      ? buildTalkSceneOpenMessages(person, ctx)
      : buildIntroSceneOpenMessages(person, ctx);
}
function favourPlanRule(size) {
  return `At the end of this scene they will ask the player for a favour, done right after it. Pick \`favour.kind\` from exactly: ${listFavourKindsPrompt(size)} \u2014 whatever fits who they are and what they are doing \u2014 and write \`favour.what\`: one short line of what exactly, at most 110 characters, that fits what it costs (a loan is for exactly that amount).`;
}
function favourAskRule(favour, places, language) {
  let placeRule = places.length
    ? `\`favour.place\`: where it is done. "" when it is done right here, where they are. Only if what they ask for takes the two of them somewhere else, exactly one of: ${places.map((place) => `${place.id} (${place.name})`).join(", ")} \u2014 they both go there now, and in \`lines\` they call it by its name. Lending money has no place.`
    : '`favour.place` stays "": it is done right here, where they are; they do not ask the player to go anywhere else.';
  return [
    `The favour they ask for, now, in their own words. What they had in mind: ${favour.what} (it costs the player ${describeFavourCost(favour.cost)}). What counts is what they actually ask for in \`lines\`, the way the talk went: return it in \`favour\`.`,
    `\`favour.kind\` is exactly one of: ${listFavourKindsPrompt(favour.size)}; any amount or time they name is exactly what that kind costs.`,
    `\`favour.what\`: one short line of what exactly they asked for, at most 110 characters, in ${language}.`,
    placeRule,
  ].join(" ");
}
function buildTierSceneOpenMessages(person, ctx = {}) {
  let {
    place = "",
    time = "",
    language = "English",
    tone = "",
    doing = "",
    persona = "",
    setting = "",
    step = null,
  } = ctx;
  return [
    {
      role: "system",
      content: [
        "Task: scene-open",
        ctx.npc
          ? `You write a visual-novel scene in a modern life sim. ${NPC_STRANGER_NOTE}`
          : "You write a visual-novel scene in a modern life sim. The player and this person know each other, and something between them is about to change.",
        `THE MOMENT THIS SCENE BUILDS TOWARD: ${step?.text ?? "a step closer"}`,
        ctx.axis ? tierStepSizeGuard(ctx.axis, ctx.tier, ctx.couple) : null,
        !ctx.axis && step?.not ? `It must NOT turn into: ${step.not}` : null,
        ctx.kind === "milestone" ? NAME_THE_STEP_RULE : null,
        ctx.callNow
          ? "The player's call comes right after these lines, before any talk: show what is happening, and stop before anything is settled \u2014 nobody calms down, makes up, is looked after, goes in, leaves or decides anything yet, and nothing the player could choose happens, not even in passing. End on the moment that waits for the player."
          : "Open the scene naturally. Let the conversation move toward that moment over the next exchanges, but do not reach it yet, and never take it for the player.",
        "",
        step?.favour
          ? 'Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"suggestions":["\u2026","\u2026","\u2026"],"favour":{"kind":"\u2026","what":"\u2026"}}'
          : `Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"suggestions":["\u2026","\u2026","\u2026"]${
              ctx.labels
                ? `,"labels":{${Object.keys(ctx.labels)
                    .map((choice) => `"${choice}":"\u2026"`)
                    .join(",")}}`
                : ""
            }}`,
        ctx.labels
          ? `\`labels\`: the player's choices at the end of this scene, as their buttons will read, in ${language}, short (at most 50 characters), keeping any name as it is: ${Object.entries(
              ctx.labels,
            )
              .map(([choice, label]) => `${choice}: \xAB${label}\xBB`)
              .join(" \xB7 ")}.`
          : null,
        `\`lines\`: 2 to 4 short segments that set the moment and end with THEM saying something the player can answer. \`who\` is "them" for what they say, "narration" for a short line of what happens.${othersWhoRule(ctx.others)}`,
        SUGGESTIONS_RULE,
        step?.favour ? favourPlanRule(step.favour) : null,
        "Let how well they know the player show, and what they remember of them.",
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        "Keep it grounded and in character. No stage directions inside what they say.",
        ...moduleSnippets(ctx, "system"),
        `Write everything in ${language}.`,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 ${time}` : ""}`,
        HERE_NOW_LINE,
        partyLine(ctx.party),
        staysUntilLine(ctx),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          doing: doing,
          known: true,
        }),
        "",
        "BETWEEN THEM AND THE PLAYER:",
        betweenThemBlock(ctx) || acquaintanceLine(ctx),
        othersInSceneBlock(ctx.others),
        ctx.yourDay
          ? `
TODAY: ${ctx.yourDay}`
          : "",
        ...moduleSnippets(ctx, "user"),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
function buildIntroSceneOpenMessages(person, ctx = {}) {
  let {
    party = "",
    place = "",
    time = "",
    language = "English",
    tone = "",
    doing = "",
    persona = "",
    setting = "",
    knows = [],
  } = ctx;
  return [
    {
      role: "system",
      content: [
        "Task: scene-open",
        "You write a short visual-novel scene in a modern life sim. The player walks up to someone they have never met, to introduce themselves.",
        "",
        'Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"suggestions":["\u2026","\u2026","\u2026"]}',
        '`lines`: 2 to 4 short segments that set the moment and end with THEM saying something the player can answer. `who` is "them" for what they say, "narration" for a short line of what happens.',
        "They do NOT say their name yet, and narration never names them: describe them by how they look or what they are doing.",
        SUGGESTIONS_RULE,
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        "Keep it grounded and in character. No stage directions inside what they say.",
        ...moduleSnippets(ctx, "system"),
        `Write everything in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 ${time}` : ""}`,
        partyLine(party),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          doing: doing,
        }),
        heardAboutPlayerBlock(knows),
        ...moduleSnippets(ctx, "user"),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
function buildTalkSceneOpenMessages(person, ctx = {}) {
  let { place = "", time = "", language = "English", tone = "", doing = "", persona = "", setting = "" } = ctx;
  return [
    {
      role: "system",
      content: [
        "Task: scene-open",
        "You write a visual-novel scene in a modern life sim. The player and this person already know each other; the player sits down with them to talk for a while.",
        "",
        'Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"them","text":"\u2026"}],"suggestions":["\u2026","\u2026","\u2026"]}',
        '`lines`: 2 to 4 short segments that set the moment and end with THEM saying something the player can answer. `who` is "them" for what they say, "narration" for a short line of what happens.',
        "Let how well they know the player show, and what they remember of them: an acquaintance does not talk like a close friend.",
        SUGGESTIONS_RULE,
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        "Keep it grounded and in character. No stage directions inside what they say.",
        ...moduleSnippets(ctx, "system"),
        `Write everything in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 ${time}` : ""}`,
        HERE_NOW_LINE,
        partyLine(ctx.party),
        staysUntilLine(ctx),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          doing: doing,
          known: true,
        }),
        "",
        "BETWEEN THEM AND THE PLAYER:",
        betweenThemBlock(ctx) || acquaintanceLine(ctx),
        othersInSceneBlock(ctx.others ?? []),
        ctx.yourDay
          ? `
TODAY: ${ctx.yourDay}`
          : "",
        ...moduleSnippets(ctx, "user"),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
function buildSceneTurnMessages(person, scene, answer, ctx = {}) {
  let { place = "", language = "English", tone = "", persona = "", setting = "", leaveReason = "leaves" } = ctx,
    exchangeNo = scene.exchange + 1,
    isLast = ctx.last ?? exchangeNo >= scene.max,
    isTier = (scene.kind === "tier" || scene.kind === "milestone") && !scene.after,
    isTalk = scene.kind === "talk" || scene.kind === "tier" || scene.kind === "milestone" || scene.kind === "moment",
    partyMoment = scene.kind === "moment" ? scene.partyMoment : null,
    step = isTier ? (ctx.step ?? tierStepMoment(scene.axis, scene.tier, scene.couple)) : null,
    leavingEarly = isLast && exchangeNo < scene.max && !ctx.walkedIn,
    free = ctx.free ?? null,
    didShape = free ? `,${didJsonShapeFor(free)}` : "",
    pictureShape = free && ctx.picture ? ',"picture":{"prompt":""}' : "",
    plansBlock =
      ctx.plans && !isLast && !ctx.walkIn
        ? `
${ctx.plansBlock}`
        : "",
    planShape = plansBlock ? ',"plan":{}' : "",
    jsonShapeLine = (fields) => `Answer with JSON only, exactly: {${fields}${planShape}${didShape}${pictureShape}}`,
    rememberOthers =
      (isLast && !isTier) || free?.together?.length || free?.rideOpen ? pickRememberOthers(ctx.each) : [],
    lastNote = ctx.walkedIn
      ? "This is the last exchange: the talk ends here, because of what just happened (above)."
      : leavingEarly
        ? leaveReason === "closes"
          ? "This is the last exchange: the place is closing, so they wrap it up and the scene ends."
          : leaveReason === "lunch"
            ? "This is the last exchange: the player's lunch break is over, so they wrap it up and the scene ends."
            : leaveReason === "sleep"
              ? "This is the last exchange: it is time for them to go to bed, so they wrap it up and the scene ends."
              : leaveReason === "work"
                ? "This is the last exchange: it is time for them to start work, so they wrap it up and the scene ends."
                : "This is the last exchange: they have to go now, so they wrap it up and the scene ends."
        : "This is the last exchange of this talk: bring it to a natural pause and close it, true to who they are. Nothing makes them leave: they do NOT say they have to go, are late, are expected somewhere or are busy, and they make up no excuse. They stay where they are and go on with what they were doing; only this talk ends.";
  return [
    {
      role: "system",
      content: [
        "Task: scene-turn",
        isTier
          ? `You continue a visual-novel scene in a modern life sim: ${ctx.npc ? NPC_STRANGER_NOTE : "the player and this person know each other, and something between them is about to change."} THE MOMENT IT BUILDS TOWARD: ${step?.text ?? "a step closer"} ${scene.axis ? tierStepSizeGuard(scene.axis, scene.tier, scene.couple) : step?.not ? `It must NOT turn into: ${step.not}` : ""}`
          : partyMoment
            ? `You continue a short moment at a party in a modern life sim (THE PARTY, below): THE MOMENT: they ${partyMoment.words}. It is going on right now; the player and this person are in it${eventCast(scene).length > 1 ? ", with the others in the scene" : ""}.`
            : isTalk
              ? "You continue a visual-novel scene in a modern life sim: the player and this person, who already know each other, are sitting down to talk."
              : "You continue a short visual-novel scene in a modern life sim: the player is introducing themselves to someone they have just met.",
        scene.after?.what
          ? `What the player just decided, and what came of it: ${scene.after.what} Their reaction is already written; now the talk goes on after it, everyone here.`
          : null,
        ctx.walkedIn
          ? `What just happened: ${ctx.walkedIn} The player's answer below is that call; everyone here reacts to it, true to who they are.`
          : null,
        isTalk
          ? `This is exchange ${exchangeNo} of at most ${scene.max}.`
          : `This is exchange ${exchangeNo} of ${scene.max}.`,
        isTier && !isLast && scene.by !== "them" ? MOMENT_NOT_YET_RULE : null,
        isTier && !isLast && scene.favour
          ? `At the end of this scene they will ask the player for a favour: ${scene.favour.what}. Not yet: they do not ask for it in this answer, and the talk moves toward it \u2014 unless the player's answer offers their help or asks what they need right now: then they ask for exactly that.`
          : null,
        isTier && !isLast && scene.favour
          ? `Only if they ask for it in this answer: ${favourAskRule(scene.favour, ctx.favourPlaces ?? [], language)} Otherwise \`favour\` is {"kind":"","what":"","place":""}.`
          : null,
        scene.kind === "milestone" ? NAME_THE_STEP_RULE : null,
        "",
        `First, read the player's answer the way THIS person would take it: \`read\` is exactly one of ${SCENE_READS.join(", ")}.`,
        "Then write their reaction, true to that read and to who they are.",
        "",
        jsonShapeLine(
          isLast && isTier
            ? `"read":"\u2026","lines":[{"who":"them","text":"\u2026"}],"step":"\u2026"${scene.favour ? ',"favour":{"kind":"\u2026","what":"\u2026","place":""}' : ""}`
            : isLast
              ? `"read":"\u2026","lines":[{"who":"them","text":"\u2026"}],"remember":"\u2026"${rememberEachJsonShape(rememberOthers)}`
              : `"read":"\u2026","lines":[{"who":"them","text":"\u2026"}],"suggestions":["\u2026","\u2026","\u2026"]${free?.together?.length || free?.rideOpen ? `,"remember":""${rememberEachJsonShape(rememberOthers)}` : ""}${isTier && scene.favour ? ',"favour":{"kind":"","what":"","place":""}' : ""}`,
        ),
        `\`lines\`: 1 to 4 short segments; \`who\` is "them" or "narration".${othersWhoRule(ctx.others)}`,
        isTalk
          ? null
          : exchangeNo === 1
            ? "In this answer they tell the player their name. Until then, narration never names them."
            : "They have already said their name.",
        isLast && isTier
          ? [
              `This is the last exchange before the moment${leavingEarly ? " (they will have to go soon)" : ""}: bring it right up to it and end with it hanging. They do not take the step for the player; the player decides next.`,
              scene.favour ? favourAskRule(scene.favour, ctx.favourPlaces ?? [], language) : null,
              `\`step\` is how the player would take that step here: one short line written as the player, at most ${STEP_LINE_MAX_CHARS} characters, no bigger than the step itself.`,
            ]
              .filter(Boolean)
              .join(" ")
          : isLast
            ? `${lastNote} \`remember\` is what they will remember about the player from this scene: ${rememberSpecFor(scene.kind).size} from their side, at most ${rememberSpecFor(scene.kind).max} characters, calling the player by name if they know it. It is an impression of the player \u2014 what they said, did or seemed like \u2014 never a plan, a promise or an appointment.${unansweredMoneyAskNote(
                ctx.unanswered,
                {
                  maybe: true,
                },
              )}`
            : SUGGESTIONS_RULE,
        rememberEachRule(rememberOthers, rememberSpecFor(scene.kind)),
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        plansBlock
          ? `If THEY want to meet the player again, they may set it themselves, but only as one of these; \`plan\` is what they set (their own words in \`lines\`, never the player's):${plansBlock}`
          : null,
        free
          ? `
${freeActsPromptBlock(free, {
  name: person.name,
})}`
          : null,
        ctx.slip
          ? `
THEIR BIRTHDAY: ${ctx.slip}`
          : null,
        ctx.walkIn?.kind === "quieter"
          ? `
SOMEWHERE QUIETER: ${ctx.walkIn.why}
After the reaction to the player's answer, end \`lines\` with them asking it, in their own words: 1 or 2 more segments (up to 6 in all). Stop there: whether they go is the player's call, next.`
          : null,
        ctx.walkIn && ctx.walkIn.kind !== "quieter"
          ? `
SOMEONE WALKS OVER: ${ctx.walkIn.why}
After the reaction to the player's answer, end \`lines\` with ${ctx.walkIn.name} arriving: 1 or 2 more segments (up to 6 in all), the last one ${ctx.walkIn.name} saying something (\`who\` is "${ctx.walkIn.id}"). Stop there: whether ${ctx.walkIn.name} stays is the player's call, next.`
          : null,
        free && ctx.picture
          ? `
Only if the player's answer takes a step the game counts here (${Object.entries(free.outcomes)
              .filter(([, outcome]) => outcome.how === "yes" && outcome.step)
              .map(([act]) => FREE_ACT_DESCRIPTIONS[act])
              .join("; ")}, and they go along with it): ${picturePromptRule("that step, AS it happens", ctx.picture)}
Otherwise leave \`picture.prompt\` empty.`
          : null,
        ...moduleSnippets(ctx, "system"),
        `Write every line in ${language}. \`read\` stays one of the words above, in English.`,
        needsAnswerTranslation(ctx, language)
          ? `The player's answer was written by the game, in English: return it in \`you\` as it reads in ${language}, keeping its parentheses and \xAB\xBB.`
          : null,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${ctx.time ? ` \xB7 NOW: ${ctx.time}` : ""}`,
        isTalk ? HERE_NOW_LINE : "",
        partyLine(ctx.party),
        isTalk && !isLast ? staysUntilLine(ctx) : "",
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          known: isTalk || scene.nameKnown,
        }),
        isTalk
          ? `
BETWEEN THEM AND THE PLAYER:
` + (betweenThemBlock(ctx) || acquaintanceLine(ctx))
          : heardAboutPlayerBlock(ctx.knows),
        othersInSceneBlock(ctx.others),
        rememberTooBlock(rememberOthers),
        ctx.walkIn && ctx.walkIn.kind !== "quieter"
          ? `
WHO WALKS OVER (not in the scene yet):
- ${ctx.walkIn.id}: ${ctx.walkIn.name}${ctx.walkIn.description ? ` (${ctx.walkIn.description.slice(0, 160)})` : ""}`
          : "",
        free
          ? `
${freeActsContextBlock(free)}`
          : "",
        ...moduleSnippets(ctx, "user"),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
        "",
        `THE PLAYER ANSWERS: ${answer}`,
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
async function openScene(ai, scene, person, ctx = {}) {
  let { json: json } = await ai.askJson(buildSceneOpenMessages(person, ctx), {
      maxTokens: 900,
      task: "scene-open",
      about: person.name,
      check: checkSceneLines,
    }),
    lines = parseSceneLines(json?.lines, sceneSpeakerIds(ctx)),
    suggestions = parseSceneSuggestions(json?.suggestions);
  scene.batch = lines;
  scene.log.push(
    ...lines.map((line) => ({
      ...line,
      exchange: 0,
    })),
  );
  scene.suggestions = suggestions;
  if (scene.kind === "tier") {
    scene.favour = normalizeFavour(json?.favour, tierStepMoment(scene.axis, scene.tier, scene.couple)?.favour);
  }
  if (ctx.labels) {
    scene.labels = normalizeChoiceLabels(json?.labels, ctx.labels);
  }
  return scene;
}
function normalizeChoiceLabels(raw, defaults = {}) {
  let labels = {};
  for (let key of Object.keys(defaults)) {
    let label = truncateAtSentence(raw?.[key], 60);
    if (label) {
      labels[key] = label;
    }
  }
  return labels;
}
async function runSceneTurn(ai, scene, person, answer, ctx = {}) {
  let isLast = ctx.last ?? scene.exchange + 1 >= scene.max,
    free = ctx.free ?? null,
    rememberOthers =
      (isLast && !((scene.kind === "tier" || scene.kind === "milestone") && !scene.after)) ||
      free?.together?.length ||
      free?.rideOpen
        ? pickRememberOthers(ctx.each)
        : [],
    { json: json } = await ai.askJson(buildSceneTurnMessages(person, scene, answer, ctx), {
      maxTokens: rememberEachMaxTokens(900, rememberOthers),
      task: "scene-turn",
      about: person.name,
      check: checkSceneLines,
    }),
    lines = parseSceneLines(json?.lines, sceneSpeakerIds(ctx)),
    suggestions = parseSceneSuggestions(json?.suggestions);
  if (!isLast && !suggestions.length) {
    try {
      let reply = await ai.askJson(buildSuggestionsMessages(scene, answer, lines, ctx), {
        maxTokens: 300,
        task: "scene-suggestions",
        about: person.name,
      });
      suggestions = parseSceneSuggestions(reply.json?.suggestions);
    } catch (err) {
      if (err?.cancelled) {
        throw err;
      }
    }
  }
  return {
    read: normalizeSceneRead(json?.read),
    lines: lines,
    suggestions: suggestions,
    remember: normalizeRemember(json?.remember, rememberSpecFor(scene.kind).max),
    each: normalizeRememberEach(json?.remember_each, rememberOthers, rememberSpecFor(scene.kind).max),
    step:
      typeof json?.step == "string"
        ? json.step
            .trim()
            .replace(/^["“”«»]+|["“”«»]+$/g, "")
            .slice(0, STEP_LINE_MAX_CHARS)
        : "",
    favour:
      scene.kind === "tier" && scene.favour && (isLast || json?.favour?.what)
        ? normalizeFavour(json?.favour, scene.favour.size, {
            kept: scene.favour,
            places: ctx.favourPlaces ?? [],
          })
        : null,
    did: normalizeDidActs(json?.did, ctx.free ?? null),
    ask: ctx.free && !ctx.free.plea && !ctx.free.noAsks ? normalizeMoneyAsk(json?.ask, ctx.free.askers ?? []) : null,
    ride: ctx.free && !ctx.free.rideOpen && !ctx.free.noAsks ? normalizeRideAsk(json?.ride, ctx.free) : null,
    payBack: !!ctx.free?.payBack && json?.payBack === true,
    plan: ctx.plans && !isLast && !ctx.walkIn && json?.plan && typeof json.plan == "object" ? json.plan : null,
    picture: ctx.free && ctx.picture ? normalizePicture(json?.picture) : null,
    you: needsAnswerTranslation(ctx, ctx.language) && typeof json?.you == "string" ? json.you.trim().slice(0, 400) : "",
  };
}
var needsAnswerTranslation = (ctx, language = "English") =>
  !!ctx.byGame && !/^english$/i.test(String(language ?? "English").trim());
function applySceneTurn(scene, bond, answer, turn, { at = 0, charm = 0, last = false, hold = false } = {}) {
  let exchangeNo = scene.exchange + 1;
  scene.log.push({
    who: "you",
    text: turn.you || answer,
    exchange: exchangeNo,
  });
  let result = applyBondAction(
    bond,
    {
      ...SCENE_READ_EFFECTS[turn.read],
    },
    {
      at: at,
      charm: charm,
      today: false,
      share: SCENE_KINDS[scene.kind]?.share ?? null,
      scale: scene.gainScale ?? 1,
    },
  );
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round((scene.totals[axis] + (result.applied[axis] ?? 0)) * 10) / 10;
  }
  scene.reads.push(turn.read);
  scene.lastApplied = result.applied;
  scene.lastLimits = result.limits ?? {};
  scene.limits = {
    ...(scene.limits ?? {}),
    ...(result.limits ?? {}),
  };
  scene.exchange = exchangeNo;
  scene.nameKnown = true;
  scene.batch = turn.lines;
  scene.log.push(
    ...turn.lines.map((line) => ({
      ...line,
      exchange: exchangeNo,
    })),
  );
  let isOver = exchangeNo >= scene.max || last;
  if (((scene.suggestions = isOver ? [] : turn.suggestions), hold)) {
    if (turn.favour && scene.favour && isEventRun(scene) && currentEventBeat(scene)?.type === "turns") {
      scene.favour = turn.favour;
    }
    scene.suggestions = turn.suggestions;
    return result;
  }
  if (isOver && isEventRun(scene) && currentEventBeat(scene)?.type === "turns") {
    scene.step = turn.step || scene.step;
    if (turn.favour && scene.favour) {
      scene.favour = turn.favour;
    }
    if (nextEventBeat(scene)?.type === "moment") {
      advanceEventBeat(scene);
    } else {
      enterDecidePhase(scene, turn.step);
    }
    return result;
  }
  let endedBy = exchangeNo >= scene.max ? "done" : endReasonFromLeave(scene);
  if (isOver) {
    endScene(scene, bond, {
      endedBy: endedBy,
      remember: turn.remember,
      each: turn.each,
    });
  }
  return result;
}
function closeSceneEarly(scene, bond) {
  return scene.done || scene.phase === "decide"
    ? scene
    : isEventRun(scene) && currentEventBeat(scene)?.type === "turns"
      ? enterDecidePhase(scene)
      : endScene(scene, bond, {
          endedBy: "closed",
        });
}
function enterDecidePhase(scene, step = "") {
  for (
    ;
    isEventRun(scene) &&
    currentEventBeat(scene) &&
    currentEventBeat(scene).type !== "choice" &&
    advanceEventBeat(scene);
  ) {
    // Each test above advances one beat.
  }
  scene.phase = "decide";
  scene.suggestions = [];
  let stepText = step || (scene.stepFixed ? "" : scene.step);
  scene.step = stepText || tierStepMoment(scene.axis, scene.tier, scene.couple)?.title || "";
  scene.stepFixed = !stepText && !!scene.step;
  return scene;
}
function buildTierResultMessages(
  person,
  scene,
  {
    party = "",
    accepted: accepted,
    reads = [],
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
    picture = false,
    step = null,
    what = "",
    extra = null,
    others = [],
    modules = [],
    npc = false,
    taken = "",
    favourAt = "",
    unanswered = null,
    each = null,
  } = {},
) {
  let moment = step ?? tierStepMoment(scene.axis, scene.tier, scene.couple),
    rememberOthers = pickRememberOthers(each),
    favour = accepted ? scene.favour : null,
    favourHours = favour?.cost?.minutes ? Math.round(favour.cost.minutes / 60) : 0,
    outcomeRule =
      what ||
      (favour
        ? `The player said yes to the favour: ${favour.what} (${describeFavourCost(favour.cost)}). ${favourAt ? `It is done at ${favourAt}: the two of them have just gone there together (WHERE, below), and it happens there.` : "It is done right here, where they are."} Narrate it happening now${favourHours ? `, over about ${favourHours} hour${favourHours === 1 ? "" : "s"}` : ""}: 4 to 6 short segments, mostly narration, with a few lines of theirs; any amount named is exactly that. End when it is done, with how they take it.`
        : accepted
          ? "They say yes, in their own way: 2 to 4 short segments."
          : taken
            ? `They say no: they are with ${taken}, and they would not cheat on them. They say it in their own words, kindly, true to who they are: 2 to 4 short segments.`
            : `They say not yet, because this scene went badly (how the player's answers were taken: ${reads.join(", ") || "badly"}). They give that reason in their own words, true to who they are, and leave the door open: 2 to 4 short segments.`);
  return [
    {
      role: "system",
      content: [
        "Task: tier-result",
        "You write how a moment ends in a visual-novel scene in a modern life sim. The game has already decided the outcome; write it.",
        npc ? NPC_STRANGER_NOTE : null,
        `THE MOMENT: ${moment?.text ?? "a step closer"}`,
        scene.axis
          ? tierStepSizeGuard(scene.axis, scene.tier, scene.couple)
          : moment?.not
            ? `It must NOT turn into: ${moment.not}`
            : null,
        what ? null : `THE PLAYER TOOK IT: ${scene.step || moment?.title || "they took the step"}`,
        outcomeRule,
        `Answer with JSON only, exactly: {"lines":[{"who":"them","text":"\u2026"}],"remember":"\u2026"${rememberEachJsonShape(rememberOthers)}${extra ? `,"${extra.key}":${extra.shape ?? '"\u2026"'}` : ""}${picture ? ',"picture":{"prompt":"\u2026"}' : ""}}`,
        `\`lines\`: \`who\` is "them" or "narration".${othersWhoRule(others)}`,
        extra ? extra.ask : null,
        `\`remember\` is what they will remember about the player from this scene: ${rememberSpecFor(scene.kind).size} from their side, at most ${rememberSpecFor(scene.kind).max} characters, calling the player by name. It is an impression of the player \u2014 never a plan, a promise or an appointment.${unansweredMoneyAskNote(unanswered)}`,
        rememberEachRule(rememberOthers, rememberSpecFor(scene.kind)),
        picture
          ? picturePromptRule(
              "what happened, AS it happens, at its peak \u2014 never the instant before or after",
              picture,
            )
          : null,
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        ...moduleSnippets(
          {
            modules: modules,
          },
          "system",
        ),
        `Write every line in ${language}.`,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 NOW: ${time}` : ""}`,
        HERE_NOW_LINE,
        partyLine(party),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          known: true,
        }),
        "",
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
        othersInSceneBlock(others),
        rememberTooBlock(rememberOthers),
        ...moduleSnippets(
          {
            modules: modules,
          },
          "user",
        ),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
function buildGoodbyeMessages(
  person,
  scene,
  {
    party = "",
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
    others = [],
    modules = [],
    unanswered = null,
    each = null,
  } = {},
) {
  let metBefore = scene.kind !== "intro",
    rememberOthers = pickRememberOthers(each);
  return [
    {
      role: "system",
      content: [
        "Task: scene-goodbye",
        "You close a visual-novel scene in a modern life sim. The player says they should get going, cutting the conversation short.",
        npc ? NPC_STRANGER_NOTE : null,
        `Write their reaction: 1 or 2 short segments, true to who they are and to how the scene went. \`who\` is "them" or "narration".${othersWhoRule(others)}`,
        !metBefore && !scene.nameKnown ? "They have not said their name yet: they say it now, in passing." : null,
        `Answer with JSON only, exactly: {"lines":[{"who":"them","text":"\u2026"}],"remember":"\u2026"${rememberEachJsonShape(rememberOthers)}}`,
        `\`remember\` is what they will remember about the player from this scene: ${rememberSpecFor(scene.kind).size} from their side, at most ${rememberSpecFor(scene.kind).max} characters, calling the player by name if they know it. It is an impression of the player \u2014 never a plan, a promise or an appointment.${unansweredMoneyAskNote(unanswered)}`,
        rememberEachRule(rememberOthers, rememberSpecFor(scene.kind)),
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        ...moduleSnippets(
          {
            modules: modules,
          },
          "system",
        ),
        `Write every line in ${language}.`,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 NOW: ${time}` : ""}`,
        metBefore ? HERE_NOW_LINE : "",
        partyLine(party),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          known: metBefore || scene.nameKnown,
        }),
        metBefore
          ? `
BETWEEN THEM AND THE PLAYER:
` +
            (betweenThemBlock({
              bond: bond,
              memories: memories,
              knows: knows,
              ahead: ahead,
              pairs: pairs,
            }) ||
              acquaintanceLine({
                npc: npc,
                memories: memories,
              }))
          : "",
        othersInSceneBlock(others),
        rememberTooBlock(rememberOthers),
        ...moduleSnippets(
          {
            modules: modules,
          },
          "user",
        ),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
async function runSceneGoodbye(ai, scene, person, ctx = {}) {
  let rememberOthers = pickRememberOthers(ctx.each),
    { json: json } = await ai.askJson(buildGoodbyeMessages(person, scene, ctx), {
      maxTokens: rememberEachMaxTokens(700, rememberOthers),
      task: "scene-goodbye",
      about: person.name,
      check: checkSceneLines,
    });
  return {
    lines: parseSceneLines(json?.lines, sceneSpeakerIds(ctx)),
    remember: normalizeRemember(json?.remember, rememberSpecFor(scene.kind).max),
    each: normalizeRememberEach(json?.remember_each, rememberOthers, rememberSpecFor(scene.kind).max),
  };
}
function buildFaintMessages(
  person,
  scene,
  {
    party = "",
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
    others = [],
    modules = [],
    faint = "",
    doing = "",
    said = "",
    each = false,
  } = {},
) {
  let metBefore = scene.kind !== "intro",
    picked = pickRememberOthers(each),
    rememberOthers = each === true ? others : picked;
  return [
    {
      role: "system",
      content: [
        "Task: scene-faint",
        `A visual-novel scene in a modern life sim was cut short: in the middle of it, ${metBefore ? "the player" : "the player, someone they had just met,"} collapsed from exhaustion in front of them and was carried away.`,
        npc ? NPC_STRANGER_NOTE : null,
        faint ? `What the scene was: ${faint}` : null,
        doing ? `What the player was doing when it happened: ${doing}` : null,
        `Answer with JSON only, exactly: {"remember":"\u2026"${rememberEachJsonShape(rememberOthers)}}`,
        `\`remember\` is what they will remember about the player from this scene: ${rememberSpecFor(scene.kind).size} from their side, at most ${rememberSpecFor(scene.kind).max} characters, calling the player by name if they know it \u2014 what they were living through together, and the player collapsing in front of them. It is an impression of the player \u2014 never a plan, a promise or an appointment.`,
        each === true && rememberOthers.length
          ? "`remember_each` is the same for each of the others, from each one's own side."
          : rememberEachRule(picked, rememberSpecFor(scene.kind)),
        NO_PLAYER_ACTIONS_RULE,
        NO_RUMORS_RULE,
        ...moduleSnippets(
          {
            modules: modules,
          },
          "system",
        ),
        `Write it in ${language}.`,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 NOW: ${time}` : ""}`,
        metBefore ? HERE_NOW_LINE : "",
        partyLine(party),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          known: metBefore || scene.nameKnown,
        }),
        metBefore
          ? `
BETWEEN THEM AND THE PLAYER:
` +
            (betweenThemBlock({
              bond: bond,
              memories: memories,
              knows: knows,
              ahead: ahead,
              pairs: pairs,
            }) ||
              acquaintanceLine({
                npc: npc,
                memories: memories,
              }))
          : "",
        othersInSceneBlock(others),
        each === true ? "" : rememberTooBlock(picked),
        ...moduleSnippets(
          {
            modules: modules,
          },
          "user",
        ),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
        said ? `PLAYER: ${said}` : "",
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
async function runSceneFaint(ai, scene, person, ctx = {}) {
  let rememberOthers = ctx.each === true ? (ctx.others ?? []) : pickRememberOthers(ctx.each),
    { json: json } = await ai.askJson(buildFaintMessages(person, scene, ctx), {
      maxTokens: ctx.each === true ? 900 : rememberEachMaxTokens(500, rememberOthers),
      task: "scene-faint",
      about: person.name,
    });
  return {
    remember: normalizeRemember(json?.remember, rememberSpecFor(scene.kind).max),
    each: normalizeRememberEach(json?.remember_each, rememberOthers, rememberSpecFor(scene.kind).max),
  };
}
function buildSuggestionsMessages(scene, answer, lines, { language = "English" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: scene-suggestions",
        "In a visual-novel scene of a modern life sim, write three different things the player could say or do next, written as the player, short, each with a different attitude.",
        'Answer with JSON only, exactly: {"suggestions":["\u2026","\u2026","\u2026"]}',
        `Write them in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
        `PLAYER: ${answer}`,
        ...lines.map((line) => (line.who === "narration" ? `(${line.text})` : `THEM: ${line.text}`)),
      ].join(`
`),
    },
  ];
}
async function runTierResult(ai, scene, person, ctx = {}) {
  let rememberOthers = pickRememberOthers(ctx.each),
    { json: json } = await ai.askJson(buildTierResultMessages(person, scene, ctx), {
      maxTokens: rememberEachMaxTokens(1100, rememberOthers),
      task: "tier-result",
      about: person.name,
      check: checkSceneLines,
    }),
    extraField = ctx.extra
      ? {
          [ctx.extra.key]: ctx.extra.shape
            ? (json?.[ctx.extra.key] ?? null)
            : normalizeRemember(json?.[ctx.extra.key], ctx.extra.max ?? 240),
        }
      : {};
  return {
    lines: parseSceneLines(json?.lines, sceneSpeakerIds(ctx)),
    remember: normalizeRemember(json?.remember, rememberSpecFor(scene.kind).max),
    each: normalizeRememberEach(json?.remember_each, rememberOthers, rememberSpecFor(scene.kind).max),
    picture: ctx.picture ? normalizePicture(json?.picture) : null,
    ...extraField,
  };
}
var picturePromptRule = (subject, guide) =>
  [
    `\`picture.prompt\` is the prompt an image model will paint the illustration of ${subject} from, in English. You write it, following this:`,
    String(guide ?? ""),
  ].join(`
`);
function normalizePicture(raw) {
  let prompt = String(raw?.prompt ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);
  return prompt
    ? {
        prompt: prompt,
      }
    : null;
}
function buildEventMomentMessages(person, scene, ctx = {}) {
  let {
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
    step = null,
    picture = false,
    others = [],
    modules = [],
    npc = false,
  } = ctx;
  return [
    {
      role: "system",
      content: [
        "Task: event-moment",
        "You write the climax of a visual-novel scene in a modern life sim: narration only, no dialogue options, no input from the player.",
        npc ? NPC_STRANGER_NOTE : null,
        `THE MOMENT: ${step?.text ?? "a step closer"}`,
        scene.axis ? tierStepSizeGuard(scene.axis, scene.tier, scene.couple) : null,
        "Write 2 to 4 short paragraphs that bring the scene right up to that moment and stop there, hanging: the player decides next whether to take it. Mostly what this person does and how the air feels; a line of theirs is fine.",
        scene.by === "them" ? null : MOMENT_NOT_YET_RULE,
        picture
          ? 'Answer with JSON only, exactly: {"paragraphs":["\u2026","\u2026"],"picture":{"prompt":"\u2026"}}'
          : 'Answer with JSON only, exactly: {"paragraphs":["\u2026","\u2026"]}',
        picture ? picturePromptRule("this moment, the instant before the step", picture) : null,
        NO_PLAYER_ACTIONS_RULE,
        NO_PLANS_RULE,
        NO_RUMORS_RULE,
        ...moduleSnippets(
          {
            modules: modules,
          },
          "system",
        ),
        `Write the paragraphs in ${language}.`,
      ].filter((line) => line !== null).join(`
`),
    },
    {
      role: "user",
      content: [
        `WHERE: ${place}${time ? ` \xB7 NOW: ${time}` : ""}`,
        HERE_NOW_LINE,
        partyLine(ctx.party),
        settingBlock(setting),
        persona ? `${PLAYER_PERSONA_HEADER}: ${persona}` : "",
        "",
        "THE PERSON:",
        describeScenePerson(person, {
          tone: tone,
          known: true,
        }),
        "",
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
        othersInSceneBlock(others),
        ...moduleSnippets(
          {
            modules: modules,
          },
          "user",
        ),
        "",
        "THE SCENE SO FAR:",
        formatSceneLog(scene),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
async function runEventMoment(ai, scene, person, ctx = {}) {
  let { json: json } = await ai.askJson(buildEventMomentMessages(person, scene, ctx), {
      maxTokens: 1200,
      task: "event-moment",
      about: person.name,
    }),
    paragraphs = (Array.isArray(json?.paragraphs) ? json.paragraphs : [])
      .map((paragraph) => (typeof paragraph == "string" ? paragraph.replace(/\s+/g, " ").trim() : ""))
      .filter(Boolean)
      .slice(0, 5)
      .flatMap((paragraph) => splitTextIntoChunks(paragraph, SCENE_LINE_MAX_CHARS));
  if (!paragraphs.length) {
    throw new Error("The model did not write the moment.");
  }
  return {
    lines: paragraphs.map((chunk) => ({
      who: "narration",
      text: chunk,
    })),
    picture: ctx.picture ? normalizePicture(json?.picture) : null,
  };
}
function applyEventMoment(scene, moment) {
  scene.batch = moment.lines;
  scene.log.push(
    ...moment.lines.map((line) => ({
      ...line,
      exchange: scene.exchange,
    })),
  );
  scene.moment = {
    written: true,
  };
  enterDecidePhase(scene);
  return scene;
}
function endScene(scene, bond, { endedBy = "player", remember = "", each = null } = {}) {
  scene.done = true;
  scene.endedBy = endedBy;
  scene.nameKnown = true;
  scene.remember = remember || scene.remember;
  if (each && Object.keys(each).length) {
    scene.each = {
      ...(scene.each ?? {}),
      ...each,
    };
  }
  scene.suggestions = [];
  if (bond) {
    bond.met = true;
  }
  return scene;
}

export {
  HERE_NOW_LINE,
  acquaintanceLine,
  applyEventMoment,
  applySceneTurn,
  betweenThemBlock,
  checkSceneLines,
  closeSceneEarly,
  createScene,
  describeScenePerson,
  endReasonFromLeave,
  endScene,
  enterDecidePhase,
  formatSceneLog,
  isLastSceneExchange,
  normalizePicture,
  normalizeSceneRead,
  nowAndMemoriesBlock,
  openScene,
  parseSceneLines,
  picturePromptRule,
  plansAheadBlock,
  runEventMoment,
  runSceneFaint,
  runSceneGoodbye,
  runSceneTurn,
  runTierResult,
  settingBlock,
  unansweredMoneyAskNote,
};
