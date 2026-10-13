// Outing kinds, limits, penalties and invite eligibility
import { effectiveTraits } from "../traits/traits.mjs";
import { bondKind, bondTier, bondTierName, hasMet } from "../relationships/bonds.mjs";

var OUTING_KINDS = {
  hang: {
    name: "Hang out",
    axis: "friendship",
    from: 1,
    action: "time",
  },
  date: {
    name: "Date",
    axis: "romance",
    from: 1,
    action: "date",
  },
  wedding: {
    name: "Wedding",
    axis: "romance",
    from: 0,
    action: "date",
  },
  honeymoon: {
    name: "Honeymoon",
    axis: "romance",
    from: 0,
    action: "date",
  },
};
var INVITABLE_OUTING_KINDS = ["hang", "date"];
var MAX_PLANS = 3;
var INVITE_MINUTES = 5;
var PLAN_DAYS_AHEAD = 7;
var OUTING_LATENESS = {
  ok: 15,
  leaves: 45,
  mood: -15,
};
var OUTING_LIMITS = {
  minutes: 150,
  goodbye: 15,
  exchanges: 16,
  talk: 4,
  early: 4,
};
var CANCEL_PLAN_PENALTIES = {
  early: {
    trust: -1,
  },
  sameDay: {
    trust: -3,
  },
  sameDayDate: {
    romance: -2,
  },
  eachOther: -1,
};
var INVITE_NO_COOLDOWN_HOURS = 2;
var canInviteToOuting = (bond, kind) => {
  let outing = OUTING_KINDS[kind];
  return !outing || !bond || !hasMet(bond)
    ? {
        ok: false,
        why: "Introduce yourself first",
      }
    : kind === "date" && (bond.romanceable === false || bond.justFriends)
      ? {
          ok: false,
          why: "Not open to that with you",
        }
      : kind === "date" && bond.status === "ex"
        ? {
            ok: false,
            why: "You broke up",
          }
        : bondTier(bond, outing.axis) < outing.from
          ? {
              ok: false,
              why:
                kind === "date"
                  ? "Not until Romance reaches Curious"
                  : `Not until you are ${bondTierName(bond, "friendship", outing.from)}`,
            }
          : effectiveTraits(bond).dials.open <= 2 && bondTier(bond, "friendship") < 2
            ? {
                ok: false,
                why: `Not until you are ${bondKind(bond) ? bondTierName(bond, "friendship", 2) : "Friends"}: they take their time`,
              }
            : {
                ok: true,
                why: "",
              };
};

export {
  CANCEL_PLAN_PENALTIES,
  INVITABLE_OUTING_KINDS,
  INVITE_MINUTES,
  INVITE_NO_COOLDOWN_HOURS,
  MAX_PLANS,
  OUTING_KINDS,
  OUTING_LATENESS,
  OUTING_LIMITS,
  PLAN_DAYS_AHEAD,
  canInviteToOuting,
};
