// Intimacy consent rules, gains, turned-down hurt, and time-of-day helpers
import { TRAIT_BEHAVIOURS, archetypeDefaultTraits } from "../traits/traits.mjs";
import {
  CAR_NIGHT_HOURS,
  CASUAL_INTIMACY_MIN_ROMANCE_TIER,
  CLINGY_COOLDOWN_DAYS,
  DEFAULT_TURNED_DOWN_HURT,
  FIRST_TIME_GAINS,
  REPEAT_INTIMACY_GAINS,
  ROMANTIC_REPEAT_GAINS,
  STAY_NIGHT_HOURS,
  TURNED_DOWN_HURT,
  isAttentionSeeker,
  isRomanticType,
  shrugsOffCommitment,
  wantsCommitmentFirst,
} from "./tuning.mjs";

var INTIMATE_SPECIAL_MINUTES = 240;
var CONSENT_DAY_MINUTES = 1440;
var TOGETHER_STATUSES = ["dating", "partners", "living", "engaged", "married"];
function intimacyConsent(state) {
  if (!state.youAdult) {
    return {
      how: "no",
      why: "the player has not said they are an adult",
    };
  }
  if (state.adult !== "yes") {
    return {
      how: "no",
      why: state.adult === "no" ? "they are not an adult" : "their card does not say they are an adult",
    };
  }
  if (state.romanceable === false || state.justFriends) {
    return {
      how: "no",
      why: "they are not open to that with the player",
    };
  }
  if (state.likesYou === false) {
    return {
      how: "no",
      why: "they are not into the player that way",
    };
  }
  if ((state.retryUntil ?? 0) > (state.at ?? 0)) {
    return {
      how: "no",
      why: "they already said no to it, days ago, and have not changed their mind",
    };
  }
  if (state.lastDay === state.today) {
    return {
      how: "soft",
      why: "not again today",
    };
  }
  if (TOGETHER_STATUSES.includes(state.status)) {
    return state.status === "dating" && !state.firstKiss
      ? {
          how: "soft",
          why: "not yet: they have not even kissed",
        }
      : {
          how: "yes",
          why: "",
        };
  }
  let traits = state.traits ?? archetypeDefaultTraits({});
  return wantsCommitmentFirst(traits)
    ? {
        how: state.romanceTier >= 1 ? "soft" : "no",
        why: "not without being together",
      }
    : state.romanceTier >= CASUAL_INTIMACY_MIN_ROMANCE_TIER && shrugsOffCommitment(traits)
      ? {
          how: "yes",
          why: "",
        }
      : state.romanceTier >= 1
        ? {
            how: "soft",
            why: "not yet",
          }
        : {
            how: "no",
            why: "they do not feel that way about the player",
          };
}
function intimacyGains({ times = 0, lastAt = null, traits = null, at = 0 } = {}) {
  if (!times) {
    return {
      ...FIRST_TIME_GAINS,
    };
  }
  let effective = traits ?? archetypeDefaultTraits({});
  return isAttentionSeeker(effective) && lastAt !== null && at - lastAt < CLINGY_COOLDOWN_DAYS * CONSENT_DAY_MINUTES
    ? {}
    : {
        ...(isRomanticType(effective) ? ROMANTIC_REPEAT_GAINS : REPEAT_INTIMACY_GAINS),
      };
}
var turnedDownHurt = (traits) =>
  TURNED_DOWN_HURT[TRAIT_BEHAVIOURS.hurtByNo(traits ?? archetypeDefaultTraits({}))] ?? DEFAULT_TURNED_DOWN_HURT;
function isCarNightHour(minutes) {
  let hour = Math.floor((((minutes % CONSENT_DAY_MINUTES) + CONSENT_DAY_MINUTES) % CONSENT_DAY_MINUTES) / 60);
  return hour >= CAR_NIGHT_HOURS.from || hour < CAR_NIGHT_HOURS.to;
}
function timeOfDayPhrase(minutes) {
  if (minutes == null) {
    return "Time alone";
  }
  let hour = Math.floor((((minutes % 1440) + 1440) % 1440) / 60);
  return hour >= 5 && hour < 12
    ? "A morning"
    : hour >= 12 && hour < 18
      ? "An afternoon"
      : hour >= 18 && hour < 21
        ? "An evening"
        : "A night";
}
var timeTogetherLabel = (minutes) => (minutes == null ? "Time together" : `${timeOfDayPhrase(minutes)} together`);
function isStayNightHour(minutes) {
  let hour = Math.floor((((minutes % CONSENT_DAY_MINUTES) + CONSENT_DAY_MINUTES) % CONSENT_DAY_MINUTES) / 60);
  return hour >= STAY_NIGHT_HOURS.from || hour < STAY_NIGHT_HOURS.to;
}

export {
  INTIMATE_SPECIAL_MINUTES,
  intimacyConsent,
  intimacyGains,
  isCarNightHour,
  isStayNightHour,
  timeOfDayPhrase,
  timeTogetherLabel,
  turnedDownHurt,
};
