// Bond axes, tiers, statuses, gain application, drift, boredom and summaries
import { DRIFT_DAYS_BY_KNOB, LIKE_LEVEL_MULTIPLIERS, SPEED_KNOB_MULTIPLIERS } from "./archetypes.mjs";
import { daysBetween, isSameDay } from "../time/clock.mjs";
import { SKILL_PERKS } from "../skills/skill-perks.mjs";
import { ORIENTATION_REVEAL_FRIENDSHIP_TIER } from "../orientation/orientation.mjs";
import {
  TRAIT_BEHAVIOURS,
  archetypeDefaultTraits,
  effectiveTraits,
  normalizeTraits,
  relationshipProfile,
} from "../traits/traits.mjs";

var BOND_AXES = ["friendship", "romance", "trust"];
var BOND_TIER_THRESHOLDS = [0, 15, 35, 60, 85];
var BOND_TIER_NAMES = {
  friendship: ["Acquaintance", "Friendly", "Friend", "Close friend", "Best friend"],
  romance: ["\u2014", "Curious", "Attracted", "Smitten", "In love"],
  trust: ["Wary", "Cautious", "Trusting", "Confides in you", "Unshakable"],
};
var COUPLE_FRIENDSHIP_TIER_NAMES = ["Still new", "Easy together", "Comfortable", "A good team", "Favourite person"];
var FAMILY_FRIENDSHIP_TIER_NAMES = ["Distant", "In touch", "Close again", "There for each other", "Closest family"];
var RELATIONSHIP_STATUS_LABELS = {
  single: "Single",
  dating: "Dating",
  partners: "Partners",
  living: "Living together",
  engaged: "Engaged",
  married: "Married",
  ex: "Ex",
};
var COUPLE_STATUSES = ["dating", "partners", "living", "engaged", "married"];
var bondKind = (bond) => (COUPLE_STATUSES.includes(bond?.status) ? "couple" : bond?.kin ? "family" : "");
function tierNameForKind(kind, axis, tier) {
  return axis === "friendship" && (kind === "couple" || kind === true)
    ? COUPLE_FRIENDSHIP_TIER_NAMES[tier]
    : axis === "friendship" && kind === "family"
      ? FAMILY_FRIENDSHIP_TIER_NAMES[tier]
      : BOND_TIER_NAMES[axis]?.[tier];
}
var bondTierName = (bond, axis, tier) => tierNameForKind(bondKind(bond), axis, tier);
var STATUS_STEPS = {
  dating: {
    from: "single",
    romance: 35,
    trust: 15,
    days: 0,
  },
  partners: {
    from: "dating",
    romance: 60,
    trust: 35,
    days: 14,
  },
  living: {
    from: "partners",
    romance: 60,
    trust: 60,
    days: 0,
    needsRoom: true,
  },
  engaged: {
    from: "living",
    romance: 85,
    trust: 60,
    days: 0,
  },
  married: {
    from: "engaged",
    romance: 85,
    trust: 85,
    days: 30,
  },
};
var BOND_ACTIONS = {
  quickChat: {
    action: "time",
    friendship: 2,
    minutes: 10,
  },
  flirt: {
    action: "flirt",
    romance: 3,
    minutes: 10,
  },
  openUp: {
    action: "deep",
    trust: 3,
    minutes: 10,
  },
  keptPlan: {
    action: "reliable",
    trust: 4,
  },
  missedPlan: {
    action: "reliable",
    trust: -8,
    romance: -5,
  },
};
var DAILY_GAIN_CAP = 10;
var tierForValue = (value) => {
  let tier = 0;
  for (let i = 0; i < BOND_TIER_THRESHOLDS.length; i++) {
    if (value >= BOND_TIER_THRESHOLDS[i]) {
      tier = i;
    }
  }
  return tier;
};
var tierNameForValue = (axis, value) => BOND_TIER_NAMES[axis][tierForValue(value)];
function bondTier(bond, axis) {
  let owed = bond?.tierEventOwed?.[axis];
  return owed != null ? owed - 1 : tierForValue(bond?.[axis] ?? 0);
}
var currentBondTierName = (bond, axis) => bondTierName(bond, axis, bondTier(bond, axis));
var isActiveRival = (bond) => !!bond?.rival && !bond.rivalWas && bondTier(bond, "friendship") < 2;
var isFormerRival = (bond) => !!bond?.rivalWas || (!!bond?.rival && bondTier(bond, "friendship") >= 2);
var TRUST_CAP_DAYS = 30;
var hasActiveTrustCap = (bond, now = 0) => Number.isFinite(bond?.trustCap) && (bond.trustCapUntil ?? 1 / 0) > now;
function createBond(
  characterId,
  { main = "grounded", second = null, traits = null, romanceable = true, at = 0, met = true } = {},
) {
  return {
    characterId: characterId,
    met: met,
    archetype: {
      main: main,
      second: second,
    },
    traits: traits
      ? normalizeTraits(traits)
      : archetypeDefaultTraits({
          main: main,
          second: second,
        }),
    friendship: 0,
    romance: 0,
    trust: 0,
    tierEventOwed: {
      friendship: null,
      romance: null,
      trust: null,
    },
    tierEventQueue: [],
    tierEventRetry: {},
    justFriends: false,
    romanceable: romanceable,
    status: "single",
    statusSince: at,
    openAgreement: false,
    metAt: at,
    lastSeen: at,
    driftOwed: false,
    todayGains: {
      friendship: 0,
      romance: 0,
      trust: 0,
    },
    todaySceneGains: {
      friendship: 0,
      romance: 0,
      trust: 0,
    },
    todayActions: {},
    lastGainDay: null,
    history: [],
  };
}
function romanceFriendshipGate(bond, profile) {
  let need = profile.knobs.romanceNeedsFriendship;
  if (need === 0) {
    return 1;
  }
  let threshold = [0, 15, 35, 60][need],
    base = profile.rules.romanceLeansOnTrust ? bond.trust : bond.friendship;
  return Math.max(0.2, Math.min(1, base / threshold));
}
var likeMultiplierFor = (profile, bond, action) => {
  let step = profile.likes[action] ?? "0";
  if (
    action === "deep" &&
    profile.rules.deepNeedsTrustTier &&
    bondTier(bond, "trust") < profile.rules.deepNeedsTrustTier
  ) {
    step = "0";
  }
  if (
    action === "flirt" &&
    profile.rules.flirtSafeFromFriendshipTier &&
    bondTier(bond, "friendship") >= profile.rules.flirtSafeFromFriendshipTier
  ) {
    step = "+";
  }
  return LIKE_LEVEL_MULTIPLIERS[step] ?? 1;
};
function trustCushion(bond) {
  let profile = relationshipProfile(bond),
    trustTier = bondTier(bond, "trust");
  return 1 - (trustTier / 4) * (profile.rules.doubleTrustCushion && trustTier >= 3 ? 0.6 : 0.3);
}
function applyBondAction(
  bond,
  actionKey,
  { at = 0, charm = 0, scale = 1, note = "", today = true, share = null, unforgiven = false } = {},
) {
  let action = typeof actionKey == "string" ? BOND_ACTIONS[actionKey] : actionKey;
  if (!action) {
    return {
      applied: {},
      notes: ["unknown action"],
      owed: [],
    };
  }
  let profile = relationshipProfile(bond),
    notes = [],
    applied = {
      friendship: 0,
      romance: 0,
      trust: 0,
    },
    limits = {};
  if (bond.lastGainDay === null || !isSameDay(bond.lastGainDay, at)) {
    bond.todayGains = {
      friendship: 0,
      romance: 0,
      trust: 0,
    };
    bond.todaySceneGains = {
      friendship: 0,
      romance: 0,
      trust: 0,
    };
    bond.todayEventGains = {
      friendship: 0,
      romance: 0,
      trust: 0,
    };
    bond.todayActions = {};
    bond.lastGainDay = at;
  }
  bond.todaySceneGains ??= {
    friendship: 0,
    romance: 0,
    trust: 0,
  };
  bond.todayEventGains ??= {
    friendship: 0,
    romance: 0,
    trust: 0,
  };
  let gains = share === "event" ? bond.todayEventGains : today ? bond.todayGains : bond.todaySceneGains,
    repeats = today ? (bond.todayActions[action.action] ?? 0) : 0,
    repeatFactor = repeats > 0 ? 0.5 : 1,
    likeMultiplier = likeMultiplierFor(profile, bond, action.action),
    charmMultiplier = SKILL_PERKS.socialMultiplier(charm);
  for (let axis of BOND_AXES) {
    let base = action[axis];
    if (!base) {
      continue;
    }
    let delta = base * scale * SPEED_KNOB_MULTIPLIERS[profile.knobs[`${axis}Speed`]] * repeatFactor;
    if (base > 0) {
      if (((delta *= likeMultiplier * charmMultiplier), axis === "romance")) {
        if (bond.justFriends) {
          notes.push("romance is frozen: just friends");
          continue;
        }
        if ((bond.romanceFrozenUntil ?? 0) > at) {
          notes.push("romance is frozen for now");
          continue;
        }
        if (!bond.romanceable) {
          notes.push("not romanceable");
          continue;
        }
        delta *= romanceFriendshipGate(bond, profile);
      }
    } else {
      delta *= trustCushion(bond) * (1 - (unforgiven ? 0 : profile.knobs.forgiveness) * 0.15);
    }
    if (delta > 0) {
      let room = Math.max(0, DAILY_GAIN_CAP - gains[axis]);
      if (delta > room) {
        notes.push(`daily cap on ${axis}`);
        delta = room;
        limits[axis] = "daily";
      }
      gains[axis] += delta;
    }
    let before = bond[axis],
      after = Math.max(0, Math.min(100, before + delta)),
      trustCapped =
        axis === "trust" && delta > 0 && hasActiveTrustCap(bond, at) && after > Math.max(before, bond.trustCap),
      target = trustCapped ? Math.max(before, bond.trustCap) : after,
      capped = capAtOwedTier(bond, axis, before, target);
    if (capped.owedTier !== null) {
      notes.push(`${axis} is waiting for its tier event`);
    }
    if (trustCapped) {
      limits[axis] = "light";
    } else if (capped.value < target) {
      limits[axis] = "tier";
    }
    bond[axis] = roundTenth(capped.value);
    applied[axis] = roundTenth(bond[axis] - before);
  }
  if (today) {
    bond.todayActions[action.action] = repeats + 1;
  }
  if (action.action === "novelty") {
    recordNovelty(bond, at);
  }
  bond.lastSeen = at;
  bond.driftOwed = false;
  if (["where-were-you", "missed-you", "a-jealous-scene"].includes(bond.asks?.id)) {
    bond.asks = null;
  }
  if (note) {
    bond.history.push({
      at: at,
      note: note,
      applied: applied,
    });
  }
  if (bond.history.length > 50) {
    bond.history.shift();
  }
  return {
    applied: applied,
    notes: notes,
    limits: limits,
    owed: owedTierEvents(bond),
    profile: profile,
  };
}
var REJECTION_CHANCE_BY_TIER = [0.25, 0.15, 0.07, 0.03, 0.02];
var SLOW_OPENER_REJECTION_CHANCE = [0.3, 0.3, 0.15, 0.04, 0.02];
var MAX_REJECTION_CHANCE = 0.6;
function rejectionChance(bond, actionKey, { charm = 0 } = {}) {
  if (!bond || !["quickChat", "flirt", "openUp"].includes(actionKey)) {
    return {
      chance: 0,
      why: "",
    };
  }
  let profile = relationshipProfile(bond),
    friendshipTier = bondTier(bond, "friendship"),
    chance,
    why = "";
  if (actionKey === "quickChat") {
    chance = REJECTION_CHANCE_BY_TIER[Math.min(friendshipTier, REJECTION_CHANCE_BY_TIER.length - 1)];
    if (friendshipTier < 2) {
      why = "you barely know each other";
    }
  } else if (actionKey === "openUp") {
    let slowOpener = TRAIT_BEHAVIOURS.opensSlowly(effectiveTraits(bond));
    chance = (slowOpener ? SLOW_OPENER_REJECTION_CHANCE : REJECTION_CHANCE_BY_TIER)[Math.min(friendshipTier, 4)];
    why =
      slowOpener && friendshipTier < 3
        ? "it's too soon for them"
        : friendshipTier < 2
          ? "you barely know each other"
          : "";
  } else {
    let gate = romanceFriendshipGate(bond, profile);
    chance = 0.06 + (0.5 * (1 - gate)) / 0.8;
    if (friendshipTier === 0) {
      chance += 0.1;
    }
    let safeTier = profile.rules.flirtSafeFromFriendshipTier;
    if ((safeTier && friendshipTier >= safeTier && (chance *= 0.5), SKILL_PERKS.flirtIsSafe(charm) && gate >= 1)) {
      return {
        chance: 0,
        why: "",
      };
    }
    why =
      gate < 0.6
        ? profile.rules.romanceLeansOnTrust
          ? "they want more trust first"
          : "they want more friendship first"
        : friendshipTier === 0
          ? "you barely know each other"
          : "";
  }
  chance *= Math.max(0.4, 1 - charm * 0.06);
  chance = Math.min(MAX_REJECTION_CHANCE, Math.max(0.01, chance));
  return {
    chance: Math.round(chance * 100) / 100,
    why: why,
  };
}
function capAtOwedTier(bond, axis, before, after) {
  if (after <= before) {
    return {
      value: after,
      owedTier: null,
    };
  }
  let owed = bond.tierEventOwed[axis];
  if (owed !== null) {
    return {
      value: Math.min(after, BOND_TIER_THRESHOLDS[owed]),
      owedTier: owed,
    };
  }
  let fromTier = tierForValue(before),
    toTier = tierForValue(after),
    nextTier = axis === "romance" && bond.status === "ex" && fromTier + 1 === 2 ? 3 : fromTier + 1;
  if (toTier < nextTier) {
    return {
      value: after,
      owedTier: bond.tierEventOwed[axis],
    };
  }
  let capValue = BOND_TIER_THRESHOLDS[nextTier];
  bond.tierEventOwed[axis] = nextTier;
  bond.tierEventQueue = [...(bond.tierEventQueue ?? []).filter((axisKey) => axisKey !== axis), axis];
  return {
    value: capValue,
    owedTier: nextTier,
  };
}
var roundTenth = (value) => Math.round(value * 10) / 10;
function markTraitsSeen(bond, ...keys) {
  if (bond) {
    bond.traitsSeen = {
      ...(bond.traitsSeen ?? {}),
      ...Object.fromEntries(keys.filter(Boolean).map((key) => [key, true])),
    };
  }
}
function adjustBondAxis(bond, axis, delta, { at = 0 } = {}) {
  let before = bond[axis] ?? 0,
    clamped = Math.max(0, Math.min(100, before + delta)),
    target =
      axis === "trust" && delta > 0 && hasActiveTrustCap(bond, at) && clamped > Math.max(before, bond.trustCap)
        ? Math.max(before, bond.trustCap)
        : clamped;
  bond[axis] = roundTenth(capAtOwedTier(bond, axis, before, target).value);
  if (delta > 0) {
    bond.lastSeen = at;
  }
  return roundTenth(bond[axis] - before);
}
function owedTierEvents(bond) {
  return BOND_AXES.filter((axis) => bond.tierEventOwed[axis] !== null).map((axis) => ({
    axis: axis,
    tier: bond.tierEventOwed[axis],
    name: bondTierName(bond, axis, bond.tierEventOwed[axis]),
  }));
}
function settleTierEvent(bond, axis) {
  let tier = bond.tierEventOwed[axis];
  return tier === null
    ? {
        ok: false,
        reason: "There is nothing waiting between you right now.",
      }
    : ((bond.tierEventOwed[axis] = null),
      (bond[axis] = Math.max(bond[axis], BOND_TIER_THRESHOLDS[tier]) + 1),
      (bond.tierEventQueue = (bond.tierEventQueue ?? []).filter((axisKey) => axisKey !== axis)),
      bond.tierEventRetry && delete bond.tierEventRetry[axis],
      axis === "friendship" && tier >= 2 && bond.rival && (bond.rivalWas = true),
      {
        ok: true,
        accepted: true,
        tier: tier,
        value: bond[axis],
      });
}
function postponeTierEvent(bond, axis, retryAt) {
  return bond.tierEventOwed?.[axis] === null || bond.tierEventOwed?.[axis] === undefined
    ? {
        ok: false,
        reason: "There is nothing waiting between you right now.",
      }
    : ((bond.tierEventRetry = {
        ...(bond.tierEventRetry ?? {}),
        [axis]: retryAt,
      }),
      {
        ok: true,
        retryAt: retryAt,
      });
}
var BOREDOM_RULES = {
  days: 7,
  perDay: 1,
};
function recordNovelty(bond, at) {
  bond.lastNovelty = at;
  bond.bored = null;
}
function updateBoredom(bond, at) {
  if (!relationshipProfile(bond).rules.boredWithoutNovelty) {
    return null;
  }
  if (bond.lastNovelty === undefined || bond.lastNovelty === null) {
    bond.lastNovelty = at;
    return null;
  }
  if (!bond.bored && bondTier(bond, "romance") < 1) {
    return null;
  }
  let days = Math.floor((at - bond.lastNovelty) / 1440);
  if (days < BOREDOM_RULES.days) {
    return null;
  }
  let started = !bond.bored;
  if (started) {
    markTraitsSeen(bond, "attention");
  }
  if (started) {
    bond.bored = {
      floor: BOND_TIER_THRESHOLDS[Math.max(0, tierForValue(bond.romance) - 1)],
      paid: BOREDOM_RULES.days - 1,
    };
  }
  let owedDays = days - bond.bored.paid;
  if (owedDays > 0) {
    bond.romance = Math.max(bond.bored.floor, bond.romance - owedDays * BOREDOM_RULES.perDay);
    bond.bored.paid = days;
  }
  return started
    ? {
        started: true,
        days: days,
      }
    : null;
}
function driftLimitDays(bond) {
  let days = DRIFT_DAYS_BY_KNOB[relationshipProfile(bond).knobs.drifting];
  return COUPLE_STATUSES.includes(bond.status)
    ? days
    : bondTier(bond, "friendship") >= 2 || bondTier(bond, "romance") >= 1
      ? days * FRIEND_DRIFT_FACTOR
      : null;
}
var FRIEND_DRIFT_FACTOR = 2;
function checkDrift(bond, at) {
  let limit = driftLimitDays(bond),
    days = daysBetween(bond.lastSeen, at);
  return limit === null
    ? {
        owed: bond.driftOwed,
        days: days,
        limit: limit,
      }
    : days >= limit && !bond.driftOwed
      ? ((bond.driftOwed = true),
        markTraitsSeen(bond, "attention"),
        {
          owed: true,
          days: days,
          limit: limit,
        })
      : {
          owed: bond.driftOwed,
          days: days,
          limit: limit,
        };
}
function resolveDrift(bond, { repaired = true, at = 0 } = {}) {
  if (!bond.driftOwed) {
    return {
      ok: false,
      reason: "They are not drifting.",
    };
  }
  if (((bond.driftOwed = false), (bond.lastSeen = at), repaired)) {
    return {
      ok: true,
      lostTier: false,
    };
  }
  let friendshipTier = bondTier(bond, "friendship"),
    cushion = trustCushion(bond);
  bond.friendship =
    friendshipTier > 0
      ? Math.max(BOND_TIER_THRESHOLDS[friendshipTier - 1], bond.friendship - 12 * cushion)
      : Math.max(0, bond.friendship - 6 * cushion);
  bond.trust = Math.max(0, bond.trust - 5 * cushion);
  if (bond.romance > 0) {
    bond.romance = Math.max(0, bond.romance - 3 * cushion);
  }
  return {
    ok: true,
    lostTier: friendshipTier > 0,
    friendship: bond.friendship,
  };
}
function canTakeStatusStep(bond, step, { at = 0, roomAtHome = true, otherPartners = [], names = {} } = {}) {
  let rule = STATUS_STEPS[step];
  if (!rule) {
    return {
      ok: false,
      reason: "That is not a step.",
    };
  }
  if (bond.status !== rule.from) {
    return {
      ok: false,
      reason: `That comes after ${RELATIONSHIP_STATUS_LABELS[rule.from]}.`,
    };
  }
  if (!bond.romanceable) {
    return {
      ok: false,
      reason: "They are not open to that with you.",
    };
  }
  if (bond.justFriends) {
    return {
      ok: false,
      reason: "You two agreed to stay friends.",
    };
  }
  if (bond.romance < rule.romance) {
    return {
      ok: false,
      reason: `The romance has to reach ${tierNameForValue("romance", rule.romance)}.`,
    };
  }
  if (bond.trust < rule.trust) {
    return {
      ok: false,
      reason: `Their trust has to reach ${tierNameForValue("trust", rule.trust)}.`,
    };
  }
  if (rule.days && daysBetween(bond.statusSince, at) < rule.days) {
    return {
      ok: false,
      reason: `It is too soon: ${rule.days - daysBetween(bond.statusSince, at)} more days.`,
    };
  }
  if (rule.needsRoom && !roomAtHome) {
    return {
      ok: false,
      reason: "There is no room for two where you live.",
    };
  }
  let conflict = conflictingPartner(bond, otherPartners);
  return conflict
    ? {
        ok: false,
        reason: `You are with someone else and they have not agreed to that (${names[conflict.characterId] ?? conflict.characterId}).`,
      }
    : {
        ok: true,
        reason: "",
      };
}
function conflictingPartner(bond, partners = []) {
  let allows = (partner) =>
    partner.openAgreement || (!!partner.open?.you && (bond.characterId in partner.open.you || "*" in partner.open.you));
  return (
    partners.find(
      (partner) =>
        partner.characterId !== bond.characterId && COUPLE_STATUSES.includes(partner.status) && !allows(partner),
    ) ?? null
  );
}
function setRelationshipStatus(bond, nextStatus, { at = 0 } = {}) {
  if (COUPLE_STATUSES.includes(nextStatus) && !COUPLE_STATUSES.includes(bond.status)) {
    bond.togetherSince = at;
  }
  if (COUPLE_STATUSES.includes(nextStatus)) {
    bond.justFriends = false;
  }
  if (nextStatus === "partners") {
    delete bond.trustCap;
    delete bond.trustCapUntil;
  }
  if (nextStatus === "dating" && (bond.tierEventOwed?.romance ?? 3) <= 2) {
    settleTierEvent(bond, "romance");
  }
  bond.status = nextStatus;
  bond.statusSince = at;
  bond.stepAt = at;
  return {
    status: bond.status,
    name: RELATIONSHIP_STATUS_LABELS[bond.status],
  };
}
function breakUpBond(bond, { at = 0, how = "" } = {}) {
  bond.status = "ex";
  bond.statusSince = at;
  bond.brokeUp = {
    at: at,
    how: how,
  };
  bond.open = null;
  bond.openAgreement = false;
  if (bond.asks?.id === "jealous") {
    bond.jealous = null;
  }
  bond.asks = null;
  bond.asksAfter = null;
  delete bond.trustCap;
  delete bond.trustCapUntil;
  delete bond.partnersHold;
  if (bond.tierEventOwed?.romance === 2) {
    settleTierEvent(bond, "romance");
  }
  bond.romance = Math.max(0, bond.romance - 20);
  bond.trust = Math.max(0, bond.trust - 20);
  return {
    status: bond.status,
  };
}
function archetypeToneFor(bond, profile) {
  let hideUntilTier = profile.rules.hidesRomanceUntilTier,
    romanceTier = bondTier(bond, "romance");
  return !hideUntilTier || romanceTier < 1 || romanceTier >= hideUntilTier
    ? profile.tone
    : `${profile.tone} Whatever they feel for the player, they do not let it show yet: dry, offhand, and they deny it if pushed.`;
}
var hasMet = (bond) => bond?.met !== false;
function isRomanceFrozen(bond) {
  if (bond.justFriends) {
    return true;
  }
  if (bond.romanceable !== false) {
    return false;
  }
  let orientationKnown =
    !!bond.intoKnown || (hasMet(bond) && bondTier(bond, "friendship") >= ORIENTATION_REVEAL_FRIENDSHIP_TIER);
  return !(bond.notInto && bond.cardRomance !== false && !orientationKnown);
}
function bondSummary(bond) {
  let profile = relationshipProfile(bond);
  return {
    characterId: bond.characterId,
    friendship: {
      value: bond.friendship,
      tier: bondTier(bond, "friendship"),
      name: currentBondTierName(bond, "friendship"),
    },
    romance: {
      value: bond.romance,
      tier: bondTier(bond, "romance"),
      name: currentBondTierName(bond, "romance"),
      frozen: isRomanceFrozen(bond),
    },
    trust: {
      value: bond.trust,
      tier: bondTier(bond, "trust"),
      name: currentBondTierName(bond, "trust"),
    },
    status: {
      id: bond.status,
      name: RELATIONSHIP_STATUS_LABELS[bond.status],
      openAgreement: bond.openAgreement,
    },
    met: hasMet(bond),
    owed: owedTierEvents(bond),
    drifting: bond.driftOwed,
    archetype: {
      main: profile.main,
      second: profile.second,
      name: profile.name,
      tone: archetypeToneFor(bond, profile),
    },
  };
}

export {
  BOND_ACTIONS,
  BOND_AXES,
  BOND_TIER_NAMES,
  BOND_TIER_THRESHOLDS,
  COUPLE_FRIENDSHIP_TIER_NAMES,
  FAMILY_FRIENDSHIP_TIER_NAMES,
  FRIEND_DRIFT_FACTOR,
  RELATIONSHIP_STATUS_LABELS,
  STATUS_STEPS,
  TRUST_CAP_DAYS,
  adjustBondAxis,
  applyBondAction,
  bondKind,
  bondSummary,
  bondTier,
  bondTierName,
  breakUpBond,
  canTakeStatusStep,
  checkDrift,
  conflictingPartner,
  createBond,
  currentBondTierName,
  driftLimitDays,
  hasActiveTrustCap,
  hasMet,
  isActiveRival,
  isFormerRival,
  isRomanceFrozen,
  markTraitsSeen,
  postponeTierEvent,
  recordNovelty,
  rejectionChance,
  resolveDrift,
  setRelationshipStatus,
  settleTierEvent,
  tierForValue,
  tierNameForKind,
  trustCushion,
  updateBoredom,
};
