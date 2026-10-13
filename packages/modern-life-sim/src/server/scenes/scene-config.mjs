// Scene kinds, read effects, shared prompt rules and remember/remember_each helpers
var SCENE_READ_EFFECTS = {
  warm: {
    action: "time",
    friendship: 2,
    trust: 0.5,
  },
  funny: {
    action: "novelty",
    friendship: 2,
  },
  curious: {
    action: "deep",
    friendship: 1,
    trust: 2,
  },
  flirty: {
    action: "flirt",
    romance: 2,
  },
  awkward: {
    action: "time",
  },
  cold: {
    action: "space",
    friendship: -1,
  },
  rude: {
    action: "reliable",
    friendship: -3,
    trust: -2,
  },
};
var SCENE_READS = Object.keys(SCENE_READ_EFFECTS);
var SCENE_KINDS = {
  intro: {
    label: "Introduce yourself",
    exchanges: 3,
    minutesPerExchange: 5,
    remember: {
      max: 240,
      size: "one or two complete sentences",
    },
  },
  talk: {
    label: "Sit down and talk",
    exchanges: 8,
    minutesPerExchange: 5,
    oncePerDay: true,
    remember: {
      max: 420,
      size: "two or three complete sentences",
    },
  },
  tier: {
    label: "Something's changed",
    exchanges: 8,
    minutesPerExchange: 5,
    share: "event",
    remember: {
      max: 420,
      size: "two or three complete sentences",
    },
  },
  milestone: {
    label: "A big step",
    exchanges: 6,
    minutesPerExchange: 5,
    share: "event",
    remember: {
      max: 480,
      size: "two or three complete sentences",
    },
  },
  moment: {
    label: "A moment",
    exchanges: 2,
    minutesPerExchange: 5,
    remember: {
      max: 240,
      size: "one or two complete sentences",
    },
  },
};
var STEP_LINE_MAX_CHARS = 90;
var SECOND_PERSON_RULE =
  "In the narration the player is \xAByou\xBB, in the second person of the language you write in; never \xABthe player\xBB or a translation of it \u2014 that is only what these instructions call them.";
var NO_PLAYER_ACTIONS_RULE = `Never write what the player says, does or thinks: only this person, and short narration of what happens. Nobody else is in the scene unless they are given here: nobody from their life walks in, answers a door or joins, even if their description mentions them. ${SECOND_PERSON_RULE}`;
var MOMENT_NOT_YET_RULE =
  "The moment itself does NOT happen in this exchange, not even in passing: nobody takes that step yet (no number swapped, nothing said or done that IS the step). It only happens if the player decides to at the end, and the player may let it be. If the player's answer takes that step or asks for it right now, they react to it in the moment, as they would (glad, surprised, shy), and do NOT refuse it, stall or make excuses: the player confirms it next.";
var SUGGESTIONS_KNOWLEDGE_RULE =
  "The suggestions come only from what the player knows: what was said and done in this scene, what the player and this person have lived together (what they remember of the player), and what anyone could see. Everything in their description (who they are) is hidden from the player: their hobbies and what they do (that they sew, draw, train\u2026), their job, their past, their family and the people in their life, what they heard. The player can only bring one of those up once this person has said it in this scene. Never from what only this person knows.";
var SUGGESTIONS_RULE = `\`suggestions\`: three different things the player could say or do next, written as the player, short, each with a different attitude. ${SUGGESTIONS_KNOWLEDGE_RULE}`;
var NO_RUMORS_RULE =
  "What they know of the player's life is only what is given here: what they remember of the player, and what they saw or heard, when it is listed. They never make up a rumor or gossip about the player, or someone the player was seen with.";
var NO_PLANS_RULE =
  "Nobody fixes a day, a time or a place to meet again here, and nobody promises to show up somewhere: a plan is only made the way the game allows it (THE OUTINGS THE GAME CAN KEEP, when given). Otherwise they can hope to run into the player again, loosely.";
var NAME_THE_STEP_RULE =
  "When the step itself comes up, it is named for what it is, in plain words (going out, being together, moving in, marrying): no euphemisms like \xABthe real thing\xBB or \xABthat thing\xBB.";
var SCENE_LINE_MAX_CHARS = 420;
var SUGGESTION_MAX_CHARS = 180;
var REMEMBER_DEFAULT_MAX_CHARS = 240;
var rememberSpecFor = (kind) =>
  SCENE_KINDS[kind]?.remember ?? {
    max: REMEMBER_DEFAULT_MAX_CHARS,
    size: "one or two complete sentences",
  };
var MAX_REMEMBER_OTHERS = 3;
var REMEMBER_EACH_TOKENS_PER_PERSON = 200;
var REMEMBER_EACH_TOKENS_CAP = 1900;
var pickRememberOthers = (others) =>
  Array.isArray(others) ? others.filter((other) => other?.id && other?.name).slice(0, MAX_REMEMBER_OTHERS) : [];
var rememberEachJsonShape = (others) =>
  others.length ? `,"remember_each":{${others.map((other) => `"${other.id}":"\u2026"`).join(",")}}` : "";
var rememberEachRule = (others, { size: size, max: max }, what = "scene") =>
  others.length
    ? `\`remember_each\` is the same for each of the others under THEY REMEMBER IT TOO, from each one's own side: what that person will remember about the player from this ${what}, ${size}, at most ${max} characters, calling the player by name. An impression of the player \u2014 never a plan, a promise or an appointment.`
    : null;
var rememberTooBlock = (others) =>
  others.length
    ? `
THEY REMEMBER IT TOO (each of them already knows the player):
${others.map((other) => `- ${other.id}: ${other.name}, ${other.what}`).join(`
`)}`
    : "";
var rememberEachMaxTokens = (base, others) =>
  others.length
    ? Math.max(base, Math.min(base + REMEMBER_EACH_TOKENS_PER_PERSON * others.length, REMEMBER_EACH_TOKENS_CAP))
    : base;
var normalizeRememberEach = (raw, others, maxChars = REMEMBER_DEFAULT_MAX_CHARS) =>
  Object.fromEntries(
    others.map((entry) => [entry.id, normalizeRemember(raw?.[entry.id], maxChars)]).filter(([, entry]) => entry),
  );
function normalizeRemember(text, maxChars = REMEMBER_DEFAULT_MAX_CHARS) {
  if (typeof text != "string") {
    return "";
  }
  let normalized = text
    .trim()
    .replace(/^["“”«»]+|["“”«»]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  let head = normalized.slice(0, maxChars),
    sentenceEnd = Math.max(
      head.lastIndexOf(". "),
      head.lastIndexOf("! "),
      head.lastIndexOf("? "),
      head.lastIndexOf("\u2026 "),
    );
  return sentenceEnd > maxChars / 3
    ? head.slice(0, sentenceEnd + 1)
    : `${head.slice(0, head.lastIndexOf(" ")).replace(/[,;:—–-]+$/, "")}\u2026`;
}

export {
  MAX_REMEMBER_OTHERS,
  MOMENT_NOT_YET_RULE,
  NAME_THE_STEP_RULE,
  NO_PLANS_RULE,
  NO_PLAYER_ACTIONS_RULE,
  NO_RUMORS_RULE,
  SCENE_KINDS,
  SCENE_LINE_MAX_CHARS,
  SCENE_READS,
  SCENE_READ_EFFECTS,
  SECOND_PERSON_RULE,
  STEP_LINE_MAX_CHARS,
  SUGGESTIONS_KNOWLEDGE_RULE,
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
};
