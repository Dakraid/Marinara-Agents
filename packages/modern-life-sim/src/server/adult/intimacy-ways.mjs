// Intimacy ways/likes/limits: options, archetype defaults, cleaning, limit thawing and card-reading prompt rules
import { ADULT_ANSWERS } from "./tuning.mjs";

var cleanAdultAnswer = (answer) => (ADULT_ANSWERS.includes(answer) ? answer : "unsaid");
var INTIMACY_WAY_OPTIONS = {
  initiative: ["them", "either", "you"],
  pace: ["slow", "either", "direct"],
  tone: ["tender", "either", "playful"],
  confidence: ["shy", "either", "sure"],
  daring: ["cautious", "either", "bold"],
};
var INTIMACY_WAY_AXES = Object.keys(INTIMACY_WAY_OPTIONS);
var INTIMACY_WAY_LABELS = {
  initiative: {
    them: "Likes to lead",
    either: "Either way",
    you: "Likes you to lead",
  },
  pace: {
    slow: "Takes it slow",
    either: "Either way",
    direct: "Straight to it",
  },
  tone: {
    tender: "Tender",
    either: "Either way",
    playful: "Playful",
  },
  confidence: {
    shy: "Shy",
    either: "In between",
    sure: "Sure of themselves",
  },
  daring: {
    cautious: "Cautious",
    either: "Either way",
    bold: "Bold",
  },
};
var INTIMACY_WAYS_BY_ARCHETYPE = {
  flirt: ["them", "direct", "playful", "sure", "bold"],
  freeSpirit: ["either", "direct", "playful", "sure", "bold"],
  possessive: ["them", "direct", "tender", "sure", "either"],
  romantic: ["either", "slow", "tender", "either", "either"],
  devoted: ["either", "slow", "tender", "either", "cautious"],
  shy: ["you", "slow", "tender", "shy", "cautious"],
  slowBurn: ["you", "slow", "either", "shy", "cautious"],
  guarded: ["you", "slow", "either", "shy", "cautious"],
  prickly: ["them", "either", "playful", "either", "either"],
  rival: ["them", "direct", "playful", "sure", "bold"],
  caretaker: ["either", "slow", "tender", "either", "cautious"],
  grounded: ["either", "either", "either", "either", "either"],
};
var INTIMACY_LIKES_MAX = 3;
var INTIMACY_LIMITS_MAX = 3;
var INTIMACY_TEXT_MAX = 60;
var LIMIT_STAGES = ["no", "not yet", "open"];
var LIMIT_STAGE_LABELS = {
  no: "No",
  "not yet": "Not yet",
  open: "Open to it",
};
var LIMIT_THAW_AT = {
  "not yet": 3,
  no: 4,
};
var GENTLE_LIMIT_FROM = 2;
var LIMIT_OPEN_NEAR_COUNT = 3;
var LIMIT_PUSH_COST = {
  trust: -2,
};
var LIKED_SOMETHING_GAINS = {
  romance: 2,
};
var WAYS_FIT_GAINS = {
  romance: 1,
};
var LEAN_NIGHTS_TO_SHIFT = 3;
function daringFromTraits(traits) {
  let hasFlag = (flag) => traits.flags.includes(flag);
  return traits.dials.faithful <= 3 || traits.dials.temper >= 8
    ? "bold"
    : hasFlag("shy") ||
        hasFlag("reserved") ||
        traits.dials.smitten <= 1 ||
        traits.dials.faithful >= 10 ||
        traits.dials.caring >= 9
      ? "cautious"
      : "either";
}
function resolveIntimacyWays(input, archetype = "grounded", traits = null) {
  let defaults = INTIMACY_WAYS_BY_ARCHETYPE[archetype] ?? INTIMACY_WAYS_BY_ARCHETYPE.grounded,
    fallback = (axis, index) => (axis === "daring" && traits ? daringFromTraits(traits) : defaults[index]);
  return Object.fromEntries(
    INTIMACY_WAY_AXES.map((axis, index) => {
      let value = String(input?.[axis] ?? "")
        .trim()
        .toLowerCase();
      return [axis, INTIMACY_WAY_OPTIONS[axis].includes(value) ? value : fallback(axis, index)];
    }),
  );
}
var cleanIntimacyWays = (input) =>
  Object.fromEntries(
    INTIMACY_WAY_AXES.map((axis) => [
      axis,
      String(input?.[axis] ?? "")
        .trim()
        .toLowerCase(),
    ]).filter(([axis, value]) => INTIMACY_WAY_OPTIONS[axis].includes(value)),
  );
var cleanIntimacyText = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, INTIMACY_TEXT_MAX);
function cleanIntimacyLikes(input) {
  let likes = [];
  for (let entry of Array.isArray(input) ? input : []) {
    let text = cleanIntimacyText(typeof entry == "string" ? entry : entry?.text);
    if (
      text &&
      likes.length < INTIMACY_LIKES_MAX &&
      !likes.some((like) => like.text.toLowerCase() === text.toLowerCase())
    ) {
      likes.push({
        key: `g${likes.length + 1}`,
        text: text,
      });
    }
  }
  return likes;
}
function cleanIntimacyLimits(input) {
  let limits = [];
  for (let entry of Array.isArray(input) ? input : []) {
    let text = cleanIntimacyText(typeof entry == "string" ? entry : entry?.text),
      stage =
        String(entry?.stage ?? "")
          .trim()
          .toLowerCase() === "no"
          ? "no"
          : "not yet";
    if (
      text &&
      limits.length < INTIMACY_LIMITS_MAX &&
      !limits.some((limit) => limit.text.toLowerCase() === text.toLowerCase())
    ) {
      limits.push({
        key: `l${limits.length + 1}`,
        text: text,
        stage: stage,
        near: 0,
      });
    }
  }
  return limits;
}
function limitResponse(limit, trust) {
  return !limit || limit.stage === "open"
    ? null
    : limit.stage === "not yet" && trust >= GENTLE_LIMIT_FROM
      ? "gentle"
      : "stop";
}
function nudgeLimitOpen(limit, response) {
  return !limit || response !== "gentle" || limit.own
    ? {
        opened: false,
      }
    : ((limit.near = (limit.near ?? 0) + 1),
      limit.near >= LIMIT_OPEN_NEAR_COUNT
        ? ((limit.stage = "open"),
          {
            opened: true,
          })
        : {
            opened: false,
          });
}
function thawLimits(limits, trust) {
  let opened = [];
  for (let limit of limits ?? []) {
    if (!limit.own) {
      if (limit.stage === "not yet" && trust >= LIMIT_THAW_AT["not yet"]) {
        limit.stage = "open";
        opened.push(limit.key);
      } else if (limit.stage === "no" && trust >= LIMIT_THAW_AT.no) {
        limit.stage = "not yet";
        opened.push(limit.key);
      }
    }
  }
  return opened;
}
function parseWayChoice(input) {
  let [axis, value] = String(input ?? "")
    .trim()
    .toLowerCase()
    .split(":");
  return INTIMACY_WAY_OPTIONS[axis]?.includes(value)
    ? {
        axis: axis,
        value: value,
      }
    : null;
}
function leanWayToward(ways, axis, value) {
  let options = INTIMACY_WAY_OPTIONS[axis],
    current = options.indexOf(ways[axis]),
    target = options.indexOf(value);
  return current < 0 || target < 0 || current === target
    ? false
    : ((ways[axis] = options[current + Math.sign(target - current)]), true);
}
var INTIMACY_WAYS_SHAPE =
  '{"initiative":"them, either, you or unsaid","pace":"slow, either, direct or unsaid","tone":"tender, either, playful or unsaid","confidence":"shy, either, sure or unsaid","daring":"cautious, either, bold or unsaid"}';
var INTIMACY_WAYS_RULE =
  "`intimacy_ways`: how they are in bed, from the card, only where it says or clearly shows it (else `unsaid`): `initiative` (`them`: they like to lead \xB7 `you`: they like the player to lead), `pace` (`slow` or `direct`), `tone` (`tender` or `playful`), `confidence` (`shy` or `sure`), `daring` (`cautious`: only somewhere safe and private \xB7 `bold`: somewhere a little risky thrills them); `either` when it is in between.";
var INTIMACY_LIKES_RULE =
  "`intimacy_likes`: up to 3 things they like in sex, ONLY what the card says about sex, each in a few English words; an empty list when the card says nothing about it. Never invent them.";
var INTIMACY_LIMITS_RULE =
  '`intimacy_limits`: up to 3 of their limits in sex, ONLY what the card says about sex, each `{"text":"a few English words","stage":"no or not yet"}` (`no`: they would not; `not yet`: maybe some day); an empty list when the card says nothing about it. Never invent them.';

export {
  INTIMACY_LIKES_MAX,
  INTIMACY_LIKES_RULE,
  INTIMACY_LIMITS_MAX,
  INTIMACY_LIMITS_RULE,
  INTIMACY_WAYS_RULE,
  INTIMACY_WAYS_SHAPE,
  INTIMACY_WAY_AXES,
  INTIMACY_WAY_LABELS,
  INTIMACY_WAY_OPTIONS,
  LEAN_NIGHTS_TO_SHIFT,
  LIKED_SOMETHING_GAINS,
  LIMIT_PUSH_COST,
  LIMIT_STAGES,
  LIMIT_STAGE_LABELS,
  WAYS_FIT_GAINS,
  cleanAdultAnswer,
  cleanIntimacyLikes,
  cleanIntimacyLimits,
  cleanIntimacyWays,
  leanWayToward,
  limitResponse,
  nudgeLimitOpen,
  parseWayChoice,
  resolveIntimacyWays,
  thawLimits,
};
