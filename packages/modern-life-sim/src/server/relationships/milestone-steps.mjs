// Milestone step gating (reconcile, propose, partners), NPC initiative asks and step copy/durations
import { relationshipProfile } from "../traits/traits.mjs";
import { BOND_TIER_NAMES, STATUS_STEPS, bondTier, canTakeStatusStep, conflictingPartner, hasMet } from "./bonds.mjs";
import {
  INITIATIVE_ASK_CHANCES,
  MILESTONES,
  MILESTONE_COUPLE_STATUSES,
  MILESTONE_IDS,
  RECONCILE_MINUTES_PER_DAY,
  RECONCILE_RULES,
  TALK_TRUST_FLOOR,
} from "./milestones.mjs";

function canReconcileWithEx(bond, at = 0, { otherPartners = [], names = {} } = {}) {
  if (bond.status !== "ex") {
    return {
      ok: false,
      reason: "Only with an ex.",
    };
  }
  let conflict = conflictingPartner(bond, otherPartners);
  if (conflict) {
    return {
      ok: false,
      reason: `You are with someone else and they have not agreed to that (${names[conflict.characterId] ?? conflict.characterId}).`,
    };
  }
  if (bond.justFriends || bond.romanceable === false) {
    return {
      ok: false,
      reason: "They are not open to that with you.",
    };
  }
  let brokeUp = bond.brokeUp ?? {
    at: bond.statusSince ?? 0,
    how: "",
  };
  if (at - brokeUp.at < RECONCILE_RULES.days * RECONCILE_MINUTES_PER_DAY) {
    return {
      ok: false,
      reason: "It is too soon since it ended.",
    };
  }
  let trustNeeded =
    (brokeUp.how === "cheated" ? RECONCILE_RULES.trustBetrayed : RECONCILE_RULES.trust) -
    (relationshipProfile(bond).dials.forgiveness >= 8 ? 1 : 0);
  return bondTier(bond, "trust") < trustNeeded
    ? {
        ok: false,
        reason: `Their trust has to come back to ${BOND_TIER_NAMES.trust[trustNeeded]}${brokeUp.how === "cheated" ? " (it ended over a betrayal)" : ""}.`,
      }
    : bondTier(bond, "romance") < RECONCILE_RULES.romance
      ? {
          ok: false,
          reason: `The romance has to come back to ${BOND_TIER_NAMES.romance[RECONCILE_RULES.romance]}.`,
        }
      : (bond.milestoneRetry?.reconcile ?? 0) > at
        ? {
            ok: false,
            reason: "They said not now: give it a few days.",
          }
        : {
            ok: true,
            reason: "",
          };
}
var ORDERED_MILESTONE_STEP_IDS = MILESTONE_IDS.filter(
  (id) => !MILESTONES[id].special && !MILESTONES[id].retired && !MILESTONES[id].later,
).sort((left, right) => MILESTONES[left].order - MILESTONES[right].order);
function canTakeMilestoneStep(bond, stepId, options = {}) {
  let milestone = MILESTONES[stepId];
  if (!milestone || milestone.special || milestone.retired || milestone.later) {
    return {
      ok: false,
      reason: "That is not a step.",
    };
  }
  if (milestone.flag) {
    return bond.milestones?.[milestone.flag]
      ? {
          ok: false,
          reason: "That already happened.",
        }
      : MILESTONE_COUPLE_STATUSES.includes(bond.status)
        ? bond.justFriends || !bond.romanceable
          ? {
              ok: false,
              reason: "They are not open to that with you.",
            }
          : {
              ok: true,
              reason: "",
            }
        : {
            ok: false,
            reason: "Once you are dating.",
          };
  }
  if (milestone.from === "ex") {
    return canReconcileWithEx(bond, options.at ?? 0, options);
  }
  if (stepId === "partners" && (bond.partnersHold ?? 0) > (options.at ?? 0)) {
    return {
      ok: false,
      reason: "They asked to keep it open, their way: give it time.",
    };
  }
  if (stepId === "propose" && options.wedding) {
    return {
      ok: false,
      reason: "A wedding is already planned.",
    };
  }
  if (stepId === "propose") {
    let blocker = otherPartnerBlockingMarriage(bond, options.otherPartners ?? []);
    if (blocker) {
      return {
        ok: false,
        reason: `${options.names?.[blocker.characterId] ?? "Your other partner"} has not agreed to you marrying ${options.names?.[bond.characterId] ?? "them"}: ask them first.`,
      };
    }
  }
  return milestone.where && !options.already && !options.roomYours && !options.roomTheirs
    ? {
        ok: false,
        reason: "Neither home has room for two.",
      }
    : canTakeStatusStep(bond, milestone.to, {
        at: options.at ?? 0,
        roomAtHome: true,
        otherPartners: options.otherPartners ?? [],
        names: options.names ?? {},
      });
}
var otherPartnerBlockingMarriage = (bond, partners = []) =>
  partners.find(
    (partner) =>
      partner.characterId !== bond.characterId &&
      MILESTONE_COUPLE_STATUSES.includes(partner.status) &&
      !(partner.open?.marry && bond.characterId in partner.open.marry),
  ) ?? null;
function nextMilestoneStepFor(bond, options = {}) {
  for (let stepId of ORDERED_MILESTONE_STEP_IDS) {
    let milestone = MILESTONES[stepId];
    if (
      !(milestone.flag
        ? MILESTONE_COUPLE_STATUSES.includes(bond.status) && !bond.milestones?.[milestone.flag]
        : bond.status === (milestone.from ?? STATUS_STEPS[milestone.to]?.from))
    ) {
      continue;
    }
    let check = canTakeMilestoneStep(bond, stepId, options);
    if (check.ok || !milestone.flag) {
      return {
        id: stepId,
        ...check,
      };
    }
  }
  return null;
}
var isProudCharacter = (bond) => relationshipProfile(bond).flags.includes("proud");
var canTalkItOutWithProud = (bond) =>
  !!bond &&
  MILESTONE_COUPLE_STATUSES.includes(bond.status) &&
  (bond.trust < TALK_TRUST_FLOOR || !!bond.driftOwed) &&
  isProudCharacter(bond);
function npcInitiativeAskFor(bond, options = {}, roll = 1) {
  if (bond.asks || !hasMet(bond)) {
    return null;
  }
  if (MILESTONE_COUPLE_STATUSES.includes(bond.status) && (bond.trust < TALK_TRUST_FLOOR || bond.driftOwed)) {
    return isProudCharacter(bond) ? null : "talk";
  }
  if (bond.driftOwed && !MILESTONE_COUPLE_STATUSES.includes(bond.status)) {
    return "where-were-you";
  }
  let step = nextMilestoneStepFor(bond, options);
  if (!step?.ok || MILESTONES[step.id].by !== "both" || (bond.milestoneRetry?.[step.id] ?? 0) > (options.at ?? 0)) {
    return null;
  }
  let initiative = relationshipProfile(bond).knobs.initiative ?? 0;
  if (step.id === "reconcile" && relationshipProfile(bond).dials.forgiveness <= 2) {
    return null;
  }
  let multiplier = step.id === "reconcile" && relationshipProfile(bond).dials.forgiveness >= 8 ? 2 : 1;
  return roll < (INITIATIVE_ASK_CHANCES[initiative] ?? 0) * multiplier ? step.id : null;
}
function milestoneStepCopy(stepId, by = "you", characterName = "", extra = "") {
  let milestone = MILESTONES[stepId];
  return milestone
    ? {
        title: milestone.title(characterName),
        text: [by === "them" ? (milestone.theirs ?? milestone.mine) : (milestone.mine ?? milestone.theirs), extra]
          .filter(Boolean)
          .join(" "),
        not: milestone.not ?? "",
      }
    : null;
}
var milestoneSceneMinutes = (stepId, minutesPerTurn = 5) => {
  let beats = MILESTONES[stepId]?.def.beats ?? [];
  return (
    (beats.find((beat) => beat.type === "turns")?.max ?? 0) * minutesPerTurn +
    (beats.some((beat) => beat.type === "moment") ? minutesPerTurn : 0)
  );
};

export {
  canReconcileWithEx,
  canTakeMilestoneStep,
  canTalkItOutWithProud,
  milestoneSceneMinutes,
  milestoneStepCopy,
  nextMilestoneStepFor,
  npcInitiativeAskFor,
};
