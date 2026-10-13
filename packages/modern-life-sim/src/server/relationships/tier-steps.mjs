// Tier-step event definitions, per-axis moment copy, blockers, queue and retry timing
import { clockFromMinutes } from "../time/clock.mjs";
import { defineEvent } from "../events/event-registry.mjs";
import { relationshipProfile } from "../traits/traits.mjs";
import { BOND_AXES, bondKind, bondTier, conflictingPartner, tierForValue, tierNameForKind } from "./bonds.mjs";

var TIER_STEP_EVENT = defineEvent({
  id: "tier-step",
  family: "bond",
  label: "Something's changed",
  beats: [
    {
      type: "turns",
      min: 1,
      max: 8,
    },
    {
      type: "choice",
      options: ["step", "wait"],
    },
    {
      type: "result",
    },
  ],
});
var TIER_MOMENT_EVENT = defineEvent({
  id: "tier-moment",
  family: "bond",
  label: "Something's changed",
  beats: [
    {
      type: "turns",
      min: 1,
      max: 8,
    },
    {
      type: "moment",
      keyImage: true,
    },
    {
      type: "choice",
      options: ["step", "wait"],
    },
    {
      type: "result",
      keyImage: "accepted",
    },
  ],
});
var TIER_CONFESS_EVENT = defineEvent({
  id: "tier-confess",
  family: "bond",
  label: "Something's changed",
  beats: [
    {
      type: "turns",
      min: 1,
      max: 8,
    },
    {
      type: "choice",
      options: ["step", "wait"],
    },
    {
      type: "result",
      keyImage: "accepted",
    },
  ],
});
var tierEventDefFor = (axis, tier) =>
  axis === "romance" && tier >= 3
    ? TIER_MOMENT_EVENT
    : axis === "romance" && tier === 2
      ? TIER_CONFESS_EVENT
      : TIER_STEP_EVENT;
var TIER_STEP_MOMENTS = {
  friendship: {
    1: {
      title: "Swap numbers",
      text: "From someone they run into to someone they text: swapping numbers.",
      not: "calling each other friends, sharing anything personal or heavy, making plans",
      couple: {
        title: "Something just yours",
        text: "Something that is only theirs appears: a nickname, an inside joke, a little habit they keep repeating.",
        not: 'talking about feelings or about "us", plans, a kiss, asking each other for anything',
      },
      family: {
        title: "Keep in touch",
        text: "They start really writing to each other, as family: not only on birthdays.",
        not: "anything personal or heavy, plans, anything romantic",
      },
    },
    2: {
      title: "Say you're friends",
      text: "Saying plainly that they are friends now.",
      not: 'deep confessions, secrets, "best friend", an emotional speech',
      couple: {
        title: "Comfortable together",
        text: "The first time they are at ease together without making an effort: a bad day, looking a mess, doing nothing at all together, and it is fine.",
        not: "a secret or their past, declarations, moving in",
      },
      family: {
        title: "Time together, like before",
        text: "Spending time together just because, the way they did before.",
        not: "secrets, deep confessions, anything romantic",
      },
    },
    3: {
      title: "Tell them something personal",
      text: "Telling them something personal that the player does not tell everyone.",
      not: "calling each other best friends, anything romantic",
      couple: {
        title: "A good team",
        text: "They do something together (fixing, organizing, beating some small thing) and realize they work well as a team.",
        not: "a favour that costs something, promises, the future, a relationship milestone",
      },
      family: {
        title: "Something only family knows",
        text: "Something personal comes up that only family knows, and they share it.",
        not: "calling each other the closest, anything romantic",
      },
    },
    4: {
      title: `"You're my best friend"`,
      text: "Telling them they are the player's best friend, with no hedging.",
      not: "anything romantic, unless the two of them already are",
      couple: {
        title: '"My favourite person"',
        text: "Telling them that, beyond love, they are the person the player most likes spending time with.",
        not: '"I love you", a proposal, "you can count on me" as a pact, secrets',
      },
      family: {
        title: '"The closest family I have"',
        text: "Telling them that of all the family, they are the one the player feels closest to.",
        not: "anything romantic, promises about the future",
      },
    },
  },
  romance: {
    1: {
      title: "Show you like them",
      text: "A first sign of attraction: a look that lingers, or a compliment that lands differently from a friendly one \u2014 small and easy to deny.",
      not: 'talking about feelings, confessing, asking them out, talk of a date or of "us", a kiss',
    },
    2: {
      title: "Tell them you like them",
      text: "Telling them the player likes them, and asking if they want to start dating.",
      not: 'a kiss (that is a step of its own), "I love you", being a couple for good',
    },
    3: {
      title: "Say you're falling for them",
      text: "Telling them the player is falling for them.",
      not: 'a kiss (that is a step of its own), asking them out, "I love you", deciding they are a couple for good',
    },
    4: {
      title: 'Say "I love you"',
      text: 'Saying "I love you".',
      not: "proposals, moving in, promises about the future",
    },
  },
  trust: {
    1: {
      title: "Keep a small thing between you",
      text: "They let slip something minor, and the player keeps it between them.",
      not: "a real secret, their past, anything heavy, a favour",
      couple: {
        text: "They let slip something minor, and the player keeps it between them: a small sign that they can rely on each other, beyond the attraction.",
        not: "a real secret, their past, a favour, a romantic milestone",
      },
    },
    2: {
      title: "Do them a real favour",
      text: "They ask the player for a real favour, done right after this scene.",
      favour: "small",
      not: "secrets about their past, a favour bigger than what is asked",
      couple: {
        text: "They ask the player for a real favour, done right after this scene \u2014 the kind you ask someone you are starting to count on.",
        not: "secrets about their past, a romantic milestone, a favour bigger than what is asked",
      },
    },
    3: {
      title: "Hear their secret",
      text: "They tell the player their history or a secret; the player promises it stays with them.",
      not: "asking for something that costs the player, romance",
      couple: {
        text: "They tell the player their history or a secret they have kept even from people they were close to; the player promises it stays with them.",
        not: "a love confession, proposals, asking for something that costs the player",
      },
    },
    4: {
      title: "Stand by them",
      text: "They need the player to stand by them in a way that costs something, right after this scene.",
      favour: "big",
      not: "romance, unless the two of them already are",
      couple: {
        text: "They need the player to stand by them in a way that costs something, right after this scene, the way you stand by the person you are with.",
        not: "proposals, moving in, promises about the future",
      },
    },
  },
};
function tierStepMoment(axis, tier, context = "") {
  let moment = TIER_STEP_MOMENTS[axis]?.[tier];
  if (!moment) {
    return null;
  }
  let contextKey = context === true ? "couple" : context;
  return contextKey && axis !== "romance" && moment[contextKey]
    ? {
        ...moment,
        ...moment[contextKey],
        [contextKey]: true,
      }
    : moment;
}
var TIER_STEP_CONTEXT_NOTES = {
  couple:
    " The two of them are together as a couple; this moment is about how they are with each other day to day, or the trust between them \u2014 not about love.",
  family: " They are family; this moment is about being family, never anything romantic.",
};
function tierStepSizeGuard(axis, tier, context = "") {
  let moment = tierStepMoment(axis, tier, context);
  if (!moment) {
    return "";
  }
  let contextKey = context === true ? "couple" : context;
  return (
    `Keep the moment exactly this size \u2014 step ${tier} of 4 on ${axis}: small steps stay small. It must NOT turn into: ${moment.not}.` +
    (contextKey && axis !== "romance" ? (TIER_STEP_CONTEXT_NOTES[contextKey] ?? "") : "")
  );
}
var ROMANCE_FRIENDSHIP_THRESHOLDS = [0, 15, 35, 60];
function tierStepBlocker(bond, axis, tier, options = {}) {
  let profile = relationshipProfile(bond);
  if (axis === "friendship") {
    return bondTier(bond, "trust") >= tier - 1
      ? null
      : {
          axis: "trust",
          tier: tier - 1,
        };
  }
  if (axis === "trust") {
    return bondTier(bond, "friendship") >= tier - 1
      ? null
      : {
          axis: "friendship",
          tier: tier - 1,
        };
  }
  if (!bond.romanceable || bond.justFriends) {
    return {
      off: true,
    };
  }
  if (bond.status === "ex" && tier >= 3) {
    return {
      why: "Once you are back together",
    };
  }
  let leansOnTrust = !!profile.rules.romanceLeansOnTrust,
    threshold = ROMANCE_FRIENDSHIP_THRESHOLDS[profile.knobs.romanceNeedsFriendship] ?? 0,
    gateAxis = leansOnTrust ? "trust" : "friendship";
  if (bondTier(bond, gateAxis) < tierForValue(threshold)) {
    return {
      axis: gateAxis,
      tier: tierForValue(threshold),
    };
  }
  if (tier >= 3 && bondTier(bond, "trust") < tier - 2) {
    return {
      axis: "trust",
      tier: tier - 2,
    };
  }
  if (tier === 2 && bondTier(bond, "trust") < 1) {
    return {
      axis: "trust",
      tier: 1,
    };
  }
  let rival = tier === 2 && bond.status === "single" ? conflictingPartner(bond, options.otherPartners ?? []) : null;
  return rival
    ? {
        why: `Not until ${options.names?.[rival.characterId] ?? "your partner"} agrees to you seeing someone else`,
      }
    : null;
}
function tierEventQueueFor(bond, now = 0, options = {}) {
  if (!bond) {
    return {
      list: [],
      next: null,
    };
  }
  let axes = [...(bond.tierEventQueue ?? []), ...BOND_AXES].filter((axis, index, list) => list.indexOf(axis) === index),
    kind = bondKind(bond),
    entries = axes
      .filter((axis) => bond.tierEventOwed?.[axis] !== null && bond.tierEventOwed?.[axis] !== undefined)
      .map((axis) => {
        let tier = bond.tierEventOwed[axis],
          blocker = tierStepBlocker(bond, axis, tier, options),
          retryAt = bond.tierEventRetry?.[axis] ?? null,
          waiting = retryAt !== null && now < retryAt;
        return {
          axis: axis,
          tier: tier,
          from: tierNameForKind(kind, axis, tier - 1),
          to: tierNameForKind(kind, axis, tier),
          step: tierStepMoment(axis, tier, kind)?.title ?? "",
          status: blocker ? "needs" : waiting ? "later" : "ready",
          needs: blocker?.off
            ? {
                off: true,
              }
            : blocker?.why
              ? {
                  why: blocker.why,
                }
              : blocker
                ? {
                    ...blocker,
                    name: tierNameForKind(kind, blocker.axis, blocker.tier),
                  }
                : null,
          retryAt: waiting ? retryAt : null,
          daysLeft: waiting ? Math.max(1, clockFromMinutes(retryAt).dayIndex - clockFromMinutes(now).dayIndex) : 0,
        };
      });
  return {
    list: entries,
    next: entries.find((entry) => entry.status === "ready") ?? null,
  };
}
var GOOD_SCENE_READS = new Set(["warm", "funny", "curious", "flirty"]);
var BAD_SCENE_READS = new Set(["cold", "rude"]);
function judgeSceneReads(reads = []) {
  let goodCount = reads.filter((read) => GOOD_SCENE_READS.has(read)).length,
    badCount = reads.filter((read) => BAD_SCENE_READS.has(read)).length;
  return {
    accepted: !(badCount > 0 && badCount >= goodCount),
    good: goodCount,
    bad: badCount,
  };
}
function tierRetryAt(bond, now, { byPlayer = false } = {}) {
  let dayIndex = clockFromMinutes(now).dayIndex;
  if (byPlayer) {
    return (dayIndex + 1) * 24 * 60;
  }
  let forgiveness = relationshipProfile(bond).knobs.forgiveness ?? 1,
    waitDays = forgiveness >= 3 ? 1 : forgiveness >= 1 ? 2 : 3;
  return (dayIndex + waitDays) * 24 * 60;
}

export {
  TIER_STEP_EVENT,
  TIER_STEP_MOMENTS,
  judgeSceneReads,
  tierEventDefFor,
  tierEventQueueFor,
  tierRetryAt,
  tierStepMoment,
  tierStepSizeGuard,
};
