// Moment mood scoring, arrival, bill, mood bands, bond gains, invite answers
import { bondTier } from "../relationships/bonds.mjs";
import { OUTING_KINDS, OUTING_LATENESS, canInviteToOuting } from "./outing-rules.mjs";
import { dateTasteVerdict } from "./date-tastes.mjs";
import { OUTING_PLACES } from "./outing-places.mjs";

var READ_MOOD_DELTAS = {
  warm: 4,
  funny: 5,
  curious: 4,
  flirty: 5,
  awkward: -2,
  cold: -6,
  rude: -12,
};
var TASTE_VERDICT_MOOD = {
  liked: 12,
  fine: 2,
  disliked: -8,
  loved: 14,
};
var COOK_QUALITY_MOOD = {
  burnt: -6,
  fine: 0,
  great: 6,
};
var COOK_QUALITY_WORDS = {
  burnt: "It came out a little burnt, and it shows.",
  fine: "It came out fine.",
  great: "It came out delicious.",
};
var ROLL_RESULT_MOOD = {
  won: 7,
  lost: -5,
};
var LIKE_LEVEL_MOOD = {
  "--": -6,
  "-": -3,
  0: 0,
  "+": 3,
  "++": 6,
};
var skillRollChance = (skill, level = 0) => (skill === "luck" ? 0.5 : Math.min(0.85, 0.4 + 0.07 * Math.max(0, level)));
function scoreOutingMomentChoice({
  moment: moment,
  option: option,
  kind = "date",
  profile = {},
  tastes = {},
  clothes = null,
  giftResult = null,
  levels = {},
  roll = 0.5,
}) {
  let mood = 0,
    result = {
      found: null,
      won: null,
      words: [],
    },
    likeMood = (action) => LIKE_LEVEL_MOOD[profile.likes?.[action] ?? "0"] ?? 0;
  if (moment.taste === "gift") {
    let verdict = giftResult ?? "fine";
    mood += TASTE_VERDICT_MOOD[verdict] ?? 2;
    result.verdict = verdict;
    result.words.push(
      verdict === "loved"
        ? "They LOVE it: exactly their kind of thing."
        : verdict === "liked"
          ? "They like it: a pleasant surprise."
          : verdict === "disliked"
            ? "It is not their kind of thing at all; they take it in character."
            : "It is fine: nothing special, but the gesture counts.",
    );
  } else if (moment.taste === "clothes") {
    let verdict = clothes
      ? clothes.likes === option.value
        ? "liked"
        : clothes.dislikes === option.value
          ? "disliked"
          : "fine"
      : "fine";
    mood += TASTE_VERDICT_MOOD[verdict];
    result.verdict = verdict;
    result.found = {
      kind: "clothes",
      value: option.value,
      verdict: verdict,
    };
    result.words.push(
      verdict === "liked"
        ? "It is exactly their style: they love it."
        : verdict === "disliked"
          ? "It is not their style at all, and they say so in their own way."
          : "It is alright on them, nothing special.",
    );
  } else if (moment.taste) {
    let verdict = dateTasteVerdict(tastes, moment.taste, option.value);
    mood += TASTE_VERDICT_MOOD[verdict];
    result.verdict = verdict;
    result.found = {
      kind: moment.taste,
      value: option.value,
      verdict: verdict,
    };
    result.words.push(
      verdict === "liked"
        ? `They love ${option.value} (${moment.taste}): delighted, as openly as they ever are.`
        : verdict === "disliked"
          ? `They do not like ${option.value} (${moment.taste}): they go along with it, in character, but it shows.`
          : `${option.value} (${moment.taste}) is fine by them: nothing special.`,
    );
  }
  if (option.roll) {
    let level = option.roll === "luck" ? 0 : (levels[option.roll] ?? 0);
    result.won = roll < skillRollChance(option.roll, level);
    mood += result.won ? ROLL_RESULT_MOOD.won : ROLL_RESULT_MOOD.lost;
    result.words.push(
      result.won ? "It works: the player pulls it off." : "It does not come off: the player fumbles it, a little.",
    );
  }
  if (option.read) {
    let delta = READ_MOOD_DELTAS[option.read] ?? 0;
    mood += result.won === false ? 0 : option.read === "flirty" && kind === "hang" ? 1 : delta;
    mood += likeMood(option.action ?? READ_TO_LIKE_ACTION[option.read]);
  }
  if (option.letWin) {
    if (profile.rules?.hatesBeingLetWin) {
      mood -= 10;
      result.words.push("They notice the player let them win, and they hate it.");
    } else {
      result.words.push("The player lets them win; they may or may not notice.");
    }
  }
  if (kind === "date" && moment.only === "date") {
    mood += 2;
  }
  result.mood = Math.round(mood);
  return result;
}
var READ_TO_LIKE_ACTION = {
  warm: "time",
  funny: "novelty",
  curious: "deep",
  flirty: "flirt",
  awkward: "time",
  cold: "space",
  rude: "reliable",
};
var readMoodDelta = (read, kind = "date", profile = {}) =>
  (read === "flirty" && kind === "hang" ? 1 : (READ_MOOD_DELTAS[read] ?? 0)) +
  (LIKE_LEVEL_MOOD[profile.likes?.[READ_TO_LIKE_ACTION[read]] ?? "0"] ?? 0);
function outingArrivalMood({ place: place, wearing = null, clothes = null, late = 0 }) {
  let dress = OUTING_PLACES[place]?.dress ?? null,
    mood = 0,
    words = [],
    liked =
      !wearing || !clothes
        ? "fine"
        : clothes.likes === wearing
          ? "liked"
          : clothes.dislikes === wearing
            ? "disliked"
            : "fine";
  if (liked === "liked") {
    mood += 6;
    words.push("They like how the player is dressed: their kind of style.");
  }
  if (liked === "disliked") {
    mood -= 6;
    words.push("They do not like how the player is dressed: not their style.");
  }
  let fits =
    !dress || !wearing ? "fine" : dress.good.includes(wearing) ? "good" : dress.bad.includes(wearing) ? "bad" : "fine";
  if (fits === "good") {
    mood += 3;
  }
  if (fits === "bad") {
    mood -= 4;
    words.push("The player's clothes do not suit the place.");
  }
  if (late > OUTING_LATENESS.ok) {
    mood += OUTING_LATENESS.mood;
    words.push(`The player is ${late} minutes late: they were kept waiting, and it shows.`);
  } else {
    words.push("The player is on time.");
  }
  return {
    mood: mood,
    liked: liked,
    fits: fits,
    late: late,
    words: words,
  };
}
var BILL_PAY_CHOICES = ["you", "split", "them"];
function settleOutingBill({ price = 0, by: payer = "you", choice = "you", cash = 0, kind = "date", style: style }) {
  let total = price * 2,
    yourShare = choice === "you" ? total : choice === "split" ? price : 0,
    short = false;
  if (yourShare > cash) {
    short = true;
    yourShare = cash >= price && choice === "you" ? price : 0;
  }
  let rules = style,
    proud = rules.proud,
    oldSchool = rules.oldSchool && kind === "date",
    mood = 0,
    trust = 0;
  if (short) {
    mood -= rules.neverMinds ? 0 : oldSchool ? 10 : 6;
    if (payer === "you") {
      trust -= 1;
    }
  } else if (choice === "you") {
    mood += payer === "you" ? 3 : proud ? -3 : 2;
  } else if (choice === "split") {
    mood += oldSchool && payer === "you" ? -4 : rules.hatesSplit && payer === "you" ? -2 : rules.likesSplit ? 1 : 0;
  } else {
    mood += payer === "you" ? (oldSchool ? -10 : -6) : 2;
  }
  if (!short && choice === "them" && payer === "you") {
    trust -= 1;
  }
  return {
    total: total,
    you: Math.min(yourShare, cash),
    them: total - Math.min(yourShare, cash),
    short: short,
    mood: mood,
    trust: trust,
  };
}
var OUTING_MOOD_BANDS = [
  [20, "GOING BADLY", "bad"],
  [40, "AWKWARD", "meh"],
  [62, "FINE", ""],
  [80, "GOOD", "good"],
  [101, "GREAT", "great"],
];
var outingMoodBand = (mood) => OUTING_MOOD_BANDS.find(([limit]) => mood < limit) ?? OUTING_MOOD_BANDS.at(-1);
var OUTING_START_MOOD = 55;
var OUTING_LEAVE_MOOD = 20;
var clampOutingMood = (mood) => Math.max(0, Math.min(100, Math.round(mood)));
var OUTING_GOODBYE_OPTIONS = {
  date: [
    {
      id: "kiss",
      label: "Kiss them goodnight",
      need: 80,
    },
    {
      id: "walk",
      label: "Walk them home",
      need: 62,
    },
    {
      id: "hug",
      label: "A hug",
      need: 40,
    },
    {
      id: "see",
      label: "See you soon",
      need: 0,
    },
  ],
  hang: [
    {
      id: "walk",
      label: "Walk them home",
      need: 62,
    },
    {
      id: "hug",
      label: "A hug",
      need: 40,
    },
    {
      id: "see",
      label: "See you soon",
      need: 0,
    },
  ],
};
var REPEAT_OUTING_FALLOFF = [1, 0.6, 0.35, 0.2];
function outingBondGains({ kind: kind, mood: mood, times = 0 }) {
  let falloff = REPEAT_OUTING_FALLOFF[Math.min(times, REPEAT_OUTING_FALLOFF.length - 1)],
    excess = mood - 45,
    scale = (value) => Math.round((excess >= 0 ? value * falloff : value) * 10) / 10;
  return kind === "date"
    ? {
        action: "date",
        romance: scale(excess / 5),
        friendship: scale(Math.max(0, excess / 12) + 1),
        trust: scale(Math.max(0, excess / 25)),
      }
    : {
        action: "time",
        friendship: scale(excess / 5),
        trust: scale(Math.max(0, excess / 15) + 0.5),
      };
}
function decideInviteAnswer({
  bond: bond,
  profile = {},
  kind: kind,
  placeTaste = "fine",
  busy = "",
  counterAt = null,
  roll = 0.5,
  blockedUntil = 0,
  at = 0,
  couple = null,
}) {
  let check = canInviteToOuting(bond, kind);
  if (!check.ok) {
    return {
      answer: "no",
      why: check.why,
    };
  }
  if (blockedUntil > at) {
    return {
      answer: "no",
      why: "They said no to you not long ago",
    };
  }
  if (kind === "date" && couple) {
    return {
      answer: "no",
      why: `They're with ${couple}`,
    };
  }
  let axis = OUTING_KINDS[kind].axis,
    tier = bondTier(bond, axis),
    chance = kind === "date" ? [0, 0.45, 0.75, 0.92, 0.97][tier] : [0, 0.55, 0.82, 0.95, 0.98][tier];
  chance += 0.04 * bondTier(bond, "trust");
  chance += (LIKE_LEVEL_MOOD[profile.likes?.[OUTING_KINDS[kind].action] ?? "0"] ?? 0) / 40;
  chance += placeTaste === "liked" ? 0.15 : placeTaste === "disliked" ? -0.3 : 0;
  return roll >= Math.max(0.05, Math.min(0.98, chance))
    ? {
        answer: "no",
        why: placeTaste === "disliked" ? "Not their kind of plan" : "Not this time",
      }
    : busy
      ? counterAt === null
        ? {
            answer: "no",
            why: `${busy} then`,
          }
        : {
            answer: "counter",
            at: counterAt,
            why: busy,
          }
      : {
          answer: "yes",
        };
}

export {
  BILL_PAY_CHOICES,
  COOK_QUALITY_MOOD,
  COOK_QUALITY_WORDS,
  OUTING_GOODBYE_OPTIONS,
  OUTING_LEAVE_MOOD,
  OUTING_START_MOOD,
  clampOutingMood,
  decideInviteAnswer,
  outingArrivalMood,
  outingBondGains,
  outingMoodBand,
  readMoodDelta,
  scoreOutingMomentChoice,
  settleOutingBill,
  skillRollChance,
};
