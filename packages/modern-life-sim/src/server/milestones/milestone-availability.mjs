// Milestone registry, offered steps, special actions, their-confess, stale-ask pruning and why-not reasons
import { seededRandom } from "../schedule/whereabouts.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { STATUS_STEPS, bondTier, canTakeStatusStep, hasMet, markTraitsSeen } from "../relationships/bonds.mjs";
import { eligibleSpecialEvents } from "../relationships/special-events.mjs";
import {
  INITIATIVE_ASK_CHANCES,
  MILESTONES,
  MILESTONE_COUPLE_STATUSES,
  PARTNER_PAIR_MILESTONES,
  TALK_TRUST_FLOOR,
  milestoneById,
} from "../relationships/milestones.mjs";
import {
  canReconcileWithEx,
  canTakeMilestoneStep,
  canTalkItOutWithProud,
  milestoneSceneMinutes,
  nextMilestoneStepFor,
} from "../relationships/milestone-steps.mjs";
import { tierEventQueueFor } from "../relationships/tier-steps.mjs";
import { ITEM_CATALOG } from "../items/catalog.mjs";
import { INVITE_MINUTES, MAX_PLANS, canInviteToOuting } from "../outings/outing-rules.mjs";
import { activeModules, mergeModuleHook, milestoneOfInactiveModule } from "../modules/module-registry.mjs";
import { canAskBack, lentTo, lentView } from "../money/pleas-and-loans.mjs";
import { dropsBy } from "../social/guest-visits.mjs";
import { activePlans, inviteWhy, planView, planWith } from "../plans/plans.mjs";
import { THEIR_PARTY_LATE_MINUTES, isPartyAskMilestone } from "../parties/party.mjs";
import { amountOwedTo, hasFriendPerk, introducablePeopleOf } from "../relationships/friend-perks.mjs";
import {
  MATE_MOMENTS,
  homeSpecialActions,
  housematesOf,
  isMateMomentThere,
  mateInBlockReason,
  mateMomentWaits,
  roomForPartner,
} from "../home/housemates.mjs";
import { COUCH_NIGHTS, couchFriends, hasOwnHome } from "../home/residence.mjs";
import { knownName } from "../relationships/network-sheet.mjs";
import { approachDue, knobsOf } from "../romance/romantic-acts.mjs";
import { agreedFor, coupleOf, heardOf, isPartner, otherIn, settledPair } from "../romance/jealousy.mjs";
import { agreedPair, partnersAway, unmetPairs } from "../romance/multiple-partners.mjs";
import { DAY_MINUTES, ownOpen } from "../bonds/own-moments.mjs";
import { proposeInfo, proposeWhy, weddingOf } from "../romance/proposal.mjs";
import { youMaySee } from "../relationships/friend-opinion.mjs";
import { confessesSooner } from "../relationships/extremes.mjs";
import { talkOtherOf } from "./milestone-settle.mjs";
import { suitsAsk } from "../shop/store-counter.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  livingWithYou,
  nameFor,
  sharesYourDoor,
  traitsOf,
} from "../game.mjs";
import { kinBarsRomance } from "../relationships/kin.mjs";

var itemNameOf = (itemId) => ITEM_CATALOG[itemId]?.name ?? "";
var TRIANGLE_MILESTONES = ["partners-meet", "meet-ask", "her-or-me", ...PARTNER_PAIR_MILESTONES];
var SPECIAL_MILESTONE_HANDLERS = {};
function registerMilestone(id, def, handlers = {}) {
  if (MILESTONES[id]) {
    throw new Error(`The milestone ${id} is defined twice.`);
  }
  MILESTONES[id] = {
    by: "both",
    special: true,
    ...def,
  };
  SPECIAL_MILESTONE_HANDLERS[id] = handlers;
}
var milestoneHandlers = (id) => SPECIAL_MILESTONE_HANDLERS[id] ?? null;
var partnersCtx = (game) => ({
  otherPartners: Object.values(game.bonds ?? {}),
  names: Object.fromEntries((game.characters ?? []).map((character) => [character.id, nameFor(game, character)])),
});
var milestoneEventsFor = (game, charId) => tierEventQueueFor(game.bonds?.[charId], game.minutes, partnersCtx(game));
var hasBang = (game, charId) =>
  hasMet2(game, charId) && (!!milestoneEventsFor(game, charId).next || hasReadyAsk(game, charId));
var hasReadyAsk = (game, charId) => {
  let asks = game.bonds[charId]?.asks;
  return (
    !!asks &&
    (asks.id !== "mate-moment" ||
      (isMateMomentThere(game, asks, characterOf(game, charId)) && !game.guest && !game.party))
  );
};
function roomFor(game, charId) {
  let character = characterOf(game, charId),
    sameHome = (a, b) => a && b && a.place === b.place && a.unit === b.unit,
    othersAt = (home2) =>
      game.characters.filter((other) => other.id !== charId && !other.away && sameHome(other.residence, home2)),
    partnerRoom = roomForPartner(game),
    home = character?.residence,
    housemates = [
      ...housematesOf(game),
      ...livingWithYou(game).map((mate) => characterOf(game, mate.characterId)),
    ].filter((mate) => mate && mate.id !== charId),
    theirOwnHouse =
      home?.place === "houses" && !sameHome(home, game.residence) && !othersAt(home).length && !housemates.length,
    mateNames = housemates.map((mate) => nameFor(game, mate));
  return {
    roomYours: partnerRoom,
    roomTheirs: theirOwnHouse,
    theirsWhy: mateNames.length
      ? `${mateNames.length > 1 ? `${mateNames.slice(0, -1).join(", ")} and ${mateNames.at(-1)} live` : `${mateNames[0]} lives`} with you`
      : "",
    already: !!character && hasOwnHome(game) && sharesYourDoor(game, character),
  };
}
var milestoneCtx = (game, charId) => ({
  at: game.minutes,
  otherPartners: Object.values(game.bonds),
  names: Object.fromEntries(game.characters.map((character) => [character.id, nameFor(game, character)])),
  ...roomFor(game, charId),
  wedding: !!game.wedding,
});
function milestoneFor(game, charId) {
  let bond = bondOf(game, charId);
  return !bond ||
    !hasMet2(game, charId) ||
    (bond.asks?.id === "drop-by" && game.approach?.characterId !== charId) ||
    (bond.asks?.id === "mate-moment" && mateMomentWaits(game, bond.asks, characterOf(game, charId)))
    ? null
    : bond.asks && MILESTONES[bond.asks.id]?.says
      ? {
          asks: true,
          id: bond.asks.id,
          minutes: milestoneSceneMinutes(bond.asks.id),
          says: MILESTONES[bond.asks.id].says,
        }
      : bond.asks
        ? {
            asks: true,
            id: bond.asks.id,
            minutes: milestoneSceneMinutes(bond.asks.id),
            ...(MILESTONES[bond.asks.id]?.own
              ? {
                  says: bond.asks.id === "the-contest" ? "CHALLENGES YOU" : "WANTS TO TALK",
                }
              : ["friend-opinion", "tells-you", "hit-on", "open-offer", "surprise", "money-help"].includes(bond.asks.id)
                ? {
                    says: "HAS SOMETHING TO SAY",
                  }
                : ["who-was-that", "ice-over", "missed-you"].includes(bond.asks.id)
                  ? {
                      says: "WANTS TO TALK",
                    }
                  : bond.asks.id === "drop-by"
                    ? {
                        says: "DROPPED BY",
                      }
                    : bond.asks.id === "mate-moment"
                      ? {
                          says: MATE_MOMENTS[bond.asks.about?.kind]?.says ?? "WANTS TO TALK",
                        }
                      : bond.asks.id === "party-invite"
                        ? {
                            says: "INVITES YOU",
                          }
                        : bond.asks.id === "birthday-invite"
                          ? {
                              says: "INVITES YOU",
                            }
                          : bond.asks.id === "birthday-surprise"
                            ? {
                                says: "HAS PLANS FOR YOU",
                              }
                            : {}),
          }
        : nextStepOffer(game, charId);
}
function nextStepOffer(game, charId) {
  let step = nextStepFor(game, charId);
  return step?.ok
    ? {
        id: step.id,
        title: step.title,
        minutes: step.minutes,
      }
    : null;
}
function nextStepFor(game, charId) {
  let bond = bondOf(game, charId);
  if (!bond || !hasMet2(game, charId)) {
    return null;
  }
  let step = nextMilestoneStepFor(bond, milestoneCtx(game, charId));
  if (
    !step ||
    MILESTONES[step.id].by === "them" ||
    MILESTONES[step.id].menu === "special" ||
    (step.id === "partners" &&
      eligibleSpecialEvents(traitsOf(game, bond.characterId)).includes("dont-cage-me") &&
      ownOpen(bond, "dont-cage-me", game.minutes))
  ) {
    return null;
  }
  let alreadyLiving = step.id === "move-in" && roomFor(game, charId).already;
  return {
    id: step.id,
    title: alreadyLiving
      ? `Live with ${nameFor(game, characterOf(game, charId))} as a couple`
      : MILESTONES[step.id].title(nameFor(game, characterOf(game, charId))),
    minutes: milestoneSceneMinutes(step.id),
    ok: step.ok,
    reason: step.reason,
    ...(alreadyLiving
      ? {
          already: true,
        }
      : {}),
  };
}
function blockedSpecialActions(game, charId, specials) {
  let bond = bondOf(game, charId),
    blocked = {},
    step = milestoneFor(game, charId)?.asks ? null : nextStepFor(game, charId);
  if (step) {
    blocked.step = {
      id: step.id,
      title: step.title,
      minutes: step.minutes,
      ok: step.ok,
      ...(step.already
        ? {
            already: true,
          }
        : {}),
      ...(step.ok
        ? {}
        : {
            why: step.reason,
          }),
    };
  }
  if (!specials.propose && bond.status === "living") {
    blocked.propose = {
      ok: false,
      why: proposeWhy(game, charId, milestoneCtx(game, charId)) || "Not now.",
    };
  }
  if (!specials.reconcile && bond.status === "ex" && !bond.justFriends && bond.romanceable !== false) {
    blocked.reconcile = {
      ok: false,
      why: canReconcileWithEx(bond, game.minutes, partnersCtx(game)).reason,
    };
  }
  if (!specials.invite && !planWith(game, charId)) {
    blocked.invite = {
      ok: false,
      why: inviteWhy(game, charId),
    };
  }
  return blocked;
}
var canSeeOther = (game, charId) => {
  let bond = bondOf(game, charId);
  return !!bond && !kinBarsRomance(game, bond) && !bond.justFriends && bond.romanceable !== false;
};
function specialActions(game, charId) {
  let bond = bondOf(game, charId),
    coupled = !!bond && MILESTONE_COUPLE_STATUSES.includes(bond.status),
    suits = suitsAsk(game, charId);
  if (!hasMet2(game, charId)) {
    return {
      breakUp: {
        ok: false,
        why: "You have not met",
        minutes: milestoneSceneMinutes("break-up"),
      },
      ...(suits
        ? {
            suits: suits,
          }
        : {}),
    };
  }
  let actions = {
    ...(suits
      ? {
          suits: suits,
        }
      : {}),
    breakUp: {
      ok: coupled,
      why: coupled ? "" : "You are not together",
      minutes: milestoneSceneMinutes("break-up"),
    },
    ...(coupled && heardOf(game, charId)
      ? {
          confront: {
            ok: true,
            minutes: milestoneSceneMinutes("confront"),
            with: {
              id: otherIn(heardOf(game, charId), charId),
              name: knownName(game, otherIn(heardOf(game, charId), charId)),
            },
            how: heardOf(game, charId).how,
            from: heardOf(game, charId).from ? knownName(game, heardOf(game, charId).from) : "",
          },
        }
      : {}),
    ...(talkOtherOf(game, charId)
      ? {
          talkOther: {
            ok: true,
            minutes: milestoneSceneMinutes("talk-other"),
            partner: {
              id: talkOtherOf(game, charId).partner,
              name: knownName(game, talkOtherOf(game, charId).partner),
            },
            how: talkOtherOf(game, charId).how,
            from: talkOtherOf(game, charId).from ? knownName(game, talkOtherOf(game, charId).from) : "",
          },
        }
      : {}),
    ...(coupled && proposeInfo(game, charId, milestoneCtx(game, charId))
      ? {
          propose: proposeInfo(game, charId, milestoneCtx(game, charId)),
        }
      : {}),
    ...(canTalkItOutWithProud(bond) && !bond.asks
      ? {
          talkItOut: {
            ok: true,
            minutes: milestoneSceneMinutes("talk"),
          },
        }
      : {}),
    ...(canReconcileWithEx(bond ?? {}, game.minutes, partnersCtx(game)).ok
      ? {
          reconcile: {
            ok: true,
            minutes: milestoneSceneMinutes("reconcile"),
          },
        }
      : {}),
    ...(bond &&
    !planWith(game, charId) &&
    activePlans(game).length < MAX_PLANS &&
    (canInviteToOuting(bond, "hang").ok || canInviteToOuting(bond, "date").ok)
      ? {
          invite: {
            ok: true,
            minutes: INVITE_MINUTES,
            date: canInviteToOuting(bond, "date").ok,
          },
        }
      : {}),
    ...(planWith(game, charId)?.status === "set"
      ? {
          plan: planView(game, planWith(game, charId)),
        }
      : {}),
    ...(hasFriendPerk(game, charId, "introduce") && introducablePeopleOf(game, charId).length
      ? {
          introduce: {
            ok: true,
            minutes: 5,
            who: introducablePeopleOf(game, charId),
          },
        }
      : {}),
    ...(amountOwedTo(game, charId)
      ? {
          payBack: {
            amount: amountOwedTo(game, charId),
            cash: game.wallet.cash,
          },
        }
      : {}),
    ...(lentTo(game, charId)
      ? {
          askBack: {
            amount: lentTo(game, charId),
            can: canAskBack(game, charId),
            from: lentView(game).find((loan) => loan.characterId === charId)?.from ?? "",
          },
        }
      : {}),
    ...(game.lodging?.kind === "street" && couchFriends(game).some((friend) => friend.id === charId)
      ? {
          couch: {
            ok: true,
            nights: COUCH_NIGHTS,
          },
        }
      : {}),
    ...(game.rules?.multipleRelationships && coupled && marryAskCandidates(game, charId).length
      ? {
          marryAsk: {
            ok: true,
            minutes: milestoneSceneMinutes("marry-ask"),
            who: marryAskCandidates(game, charId),
          },
        }
      : {}),
    ...(game.rules?.multipleRelationships && coupled && !bond.openAgreement && !("*" in (bond.open?.you ?? {}))
      ? {
          openAsk: {
            ok: true,
            minutes: milestoneSceneMinutes("open-ask"),
            who: castInTown(game)
              .filter(
                (other) =>
                  other.id !== charId &&
                  hasMet2(game, other.id) &&
                  !(bond.open?.you && other.id in bond.open.you) &&
                  canSeeOther(game, other.id),
              )
              .map((other) => ({
                id: other.id,
                name: nameFor(game, other),
              })),
          },
        }
      : {}),
    ...homeSpecialActions(game, charId),
    ...(activeModules(game).length
      ? {
          modules: mergeModuleHook(game, "specials", charId),
        }
      : {}),
  };
  return {
    ...actions,
    ...blockedSpecialActions(game, charId, actions),
  };
}
var FAST_COUPLE_DAYS = 7;
function talkWhy(game, charId) {
  let bond = bondOf(game, charId);
  if (!bond) {
    return "";
  }
  let daysApart = Math.floor((game.minutes - (bond.lastSeen ?? game.minutes)) / DAY_MINUTES);
  return bond.driftOwed
    ? `They have hardly seen the player in ${daysApart} days, and they feel left aside.`
    : game.minutes - (bond.statusSince ?? 0) < FAST_COUPLE_DAYS * DAY_MINUTES
      ? "They got together fast, before they really trusted each other, and it shows: they are not sure the player takes them seriously."
      : "Their trust in the player has worn thin: small things, piling up, nothing they can point to as one big thing.";
}
function whyWords(game, charId, kind) {
  let bond = bondOf(game, charId);
  if (!bond) {
    return "";
  }
  let daysSince = (since) => Math.max(0, Math.floor((game.minutes - (since ?? game.minutes)) / DAY_MINUTES));
  if (kind === "ice-over") {
    return "Why: their trust in the player fell sharply a few days ago, because of something the player did or said with them; what it was is only what they remember of the player (above), and if nothing there says it, they keep it vague: they were hurt, and kept away.";
  }
  if (kind === "missed-you" || kind === "where-were-you") {
    return `Why: they have not seen the player in ${daysSince(bond.lastSeen)} days.`;
  }
  if (kind === "reconcile") {
    let brokeUp = bond.brokeUp ?? {};
    return `Why: they broke up ${daysSince(brokeUp.at)} days ago${brokeUp.how === "cheated" ? ", over a betrayal or a lie that came out" : ""}; what went wrong is only what they remember of it (above).`;
  }
  return "";
}
function datingWhy(game, charId) {
  if (!charId) {
    return "Not now.";
  }
  let why = {
    ...charId,
    romance: Math.max(charId.romance, STATUS_STEPS.dating.romance),
    trust: Math.max(charId.trust, STATUS_STEPS.dating.trust),
  };
  return canTakeStatusStep(why, "dating", milestoneCtx(game, charId.characterId)).reason;
}
var CONFESS_NO = {
  hard: {
    romance: -6,
    trust: -3,
    days: 10,
  },
  light: {
    romance: -2,
    trust: 0,
    days: 5,
  },
  "": {
    romance: -4,
    trust: -1,
    days: 7,
  },
};
var CONFESS_RETRY_DAY_MINUTES = 1440;
function theirConfession(game, bond, events) {
  if (
    bond.asks ||
    bond.status !== "single" ||
    !hasMet(bond) ||
    bond.justFriends ||
    bond.romanceable === false ||
    TRAIT_BEHAVIOURS.confessesOwnWay(traitsOf(game, bond.characterId))
  ) {
    return false;
  }
  let sooner = confessesSooner(game, bond.characterId);
  return (!sooner &&
    milestoneEventsFor(game, bond.characterId).list.find((ev) => ev.axis === "romance" && ev.tier === 2)?.status !==
      "ready") ||
    (sooner && bondTier(bond, "romance") < 1) ||
    (bond.milestoneRetry?.["their-confess"] ?? 0) > game.minutes ||
    coupleOf(game, bond.characterId) ||
    !canTakeStatusStep(
      sooner
        ? {
            ...bond,
            romance: Math.max(bond.romance, STATUS_STEPS.dating.romance),
            trust: Math.max(bond.trust, STATUS_STEPS.dating.trust),
          }
        : bond,
      "dating",
      milestoneCtx(game, bond.characterId),
    ).ok ||
    seededRandom(game.seed, bond.characterId, String(events), "confess") >=
      (INITIATIVE_ASK_CHANCES[knobsOf(bond).initiative ?? 1] ?? 0) * (sooner ? 2 : 1)
    ? false
    : ((bond.asks = {
        id: "their-confess",
        at: game.minutes,
        due: approachDue(bond, game.minutes),
      }),
      sooner && markTraitsSeen(bond, "smitten"),
      true);
}
var OWN_STAGE = {
  "not-that-i-like-you": (game, bond) => bond.status === "single",
  "about-the-future": (game, bond) => ["dating", "partners"].includes(bond.status),
  "the-dream-date": (game, bond) => bond.status !== "ex",
  "late-realization": (game, bond) => bond.status === "single" && !datingWhy(game, bond),
  "working-up-to-it": (game, bond) => bond.status === "single" && !datingWhy(game, bond),
  "is-this-real": (game, bond) => bond.status === "dating",
  "dont-cage-me": (game, bond) => bond.status === "dating",
};
var PARTNER_ONLY_ASKS = ["break-up", "surprise", "who-was-that", "hit-on", "open-them", "open-offer"];
function askGone(game, bond) {
  let ask = bond?.asks;
  if (!ask) {
    return false;
  }
  let askId = ask.id,
    milestone = MILESTONES[askId],
    coupled = MILESTONE_COUPLE_STATUSES.includes(bond.status),
    plan = ask.plan ?? ask.party;
  if (
    (Number.isFinite(plan?.at) && plan.at + (ask.party ? THEIR_PARTY_LATE_MINUTES : 0) < game.minutes) ||
    (Number.isFinite(ask.until) && ask.until <= game.minutes) ||
    (isPartyAskMilestone(askId) && !game.party) ||
    (PLANNED_OUTING_ASKS.includes(askId) && plannedAskGone(game, bond, askId, ask.plan)) ||
    specialAskWhyNot(game, bond.characterId, askId)
  ) {
    return true;
  }
  if (milestone && !milestone.special && (milestone.to || milestone.flag)) {
    return !canTakeMilestoneStep(bond, askId, milestoneCtx(game, bond.characterId)).ok;
  }
  if (askId === "talk") {
    return !(coupled && (bond.trust < TALK_TRUST_FLOOR || bond.driftOwed));
  }
  if (askId === "their-confess") {
    return (
      !!coupleOf(game, bond.characterId) ||
      !canTakeStatusStep(
        {
          ...bond,
          romance: 100,
          trust: 100,
        },
        "dating",
        milestoneCtx(game, bond.characterId),
      ).ok
    );
  }
  if (askId === "confront") {
    return !coupled || !heardOf(game, bond.characterId);
  }
  if (askId === "talk-other") {
    return !talkOtherOf(game, bond.characterId);
  }
  if (askId === "tells-you") {
    let about = ask.about ?? {},
      partnerId = isPartner(game, about.a) ? about.a : about.b;
    return !isPartner(game, partnerId) || settledPair(game, partnerId, partnerId === about.a ? about.b : about.a);
  }
  if (askId === "open-them" && ask.with && agreedFor(game, bond.characterId, ask.with)) {
    return true;
  }
  if (PARTNER_ONLY_ASKS.includes(askId)) {
    return !coupled || (askId === "open-offer" && !game.rules?.multipleRelationships);
  }
  if (askId === "jealous") {
    return !bond.jealous || (bond.brokeUp?.at ?? -1 / 0) >= (bond.jealous.at ?? 1 / 0);
  }
  if (askId === "friend-opinion") {
    return (
      isPartner(game, bond.characterId) ||
      !isPartner(game, ask.about?.partner) ||
      (ask.about?.topic === "wrong" && youMaySee(game, ask.about.partner, ask.about.with))
    );
  }
  if (askId === "see-ring") {
    return !weddingOf(game);
  }
  if (askId === "mate-in") {
    return !!mateInBlockReason(game, bond.characterId);
  }
  if (askId === "drop-by") {
    return !dropsBy(game, bond);
  }
  if (askId in OWN_STAGE) {
    return !OWN_STAGE[askId](game, bond);
  }
  if (askId === "looking-after-you") {
    return !(
      game.needs.energy <= 15 ||
      game.needs.hunger <= 15 ||
      (game.badDayAt ?? -1 / 0) > game.minutes - DAY_MINUTES
    );
  }
  if (TRIANGLE_MILESTONES.includes(askId)) {
    let withIds = [ask.with ?? []].flat();
    return !withIds.length || withIds.some((otherId) => !agreedPair(game, bond.characterId, otherId))
      ? true
      : (askId === "partners-meet" || askId === "meet-ask") && !unmetPairs(game, [bond.characterId, ...withIds]).length;
  }
  return false;
}
var PLANNED_OUTING_ASKS = ["ask-you-out", "birthday-invite", "birthday-surprise"];
function plannedAskGone(game, bond, milestoneId, outing) {
  return outing
    ? planWith(game, bond.characterId) ||
      activePlans(game).length >= MAX_PLANS ||
      !canInviteToOuting(bond, outing.kind).ok
      ? true
      : milestoneId === "birthday-surprise" && !isPartner(game, bond.characterId)
    : false;
}
function specialAskWhyNot(game, charId, milestoneId) {
  let handler = SPECIAL_MILESTONE_HANDLERS[milestoneId];
  return handler
    ? handler.askWhyNot
      ? (handler.askWhyNot(game, charId) ?? "")
      : MILESTONES[milestoneId]?.by !== "them"
        ? (handler.whyNot?.(game, charId) ?? "")
        : ""
    : "";
}
function dropGoneAsk(game, bond) {
  return askGone(game, bond) ? (bond.asks.id === "jealous" && (bond.jealous = null), (bond.asks = null), true) : false;
}
function staleAsks(game) {
  let sceneCharId = game.scene && !game.scene.done ? game.scene.characterId : null;
  for (let bond of Object.values(game.bonds ?? {})) {
    if (bond.characterId !== sceneCharId) {
      dropGoneAsk(game, bond);
      if (!bond.asks && bond.asksAfter) {
        bond.asks = bond.asksAfter;
        bond.asksAfter = null;
        dropGoneAsk(game, bond);
      }
    }
  }
  if (game.approach && bondOf(game, game.approach.characterId)?.asks?.id !== game.approach.milestone) {
    game.approach = null;
  }
}
function marryAskCandidates(game, charId) {
  let bond = bondOf(game, charId),
    openTo = (otherId) =>
      bond.openAgreement || (!!bond.open?.you && (otherId in bond.open.you || "*" in bond.open.you));
  return Object.values(game.bonds)
    .filter(
      (character) =>
        character.characterId !== charId &&
        character.status === "living" &&
        openTo(character.characterId) &&
        !(bond.open?.marry && character.characterId in bond.open.marry),
    )
    .map((character) => ({
      id: character.characterId,
      name: nameFor(game, characterOf(game, character.characterId)),
    }));
}
function milestoneWhyNot(game, charId, milestoneId) {
  let milestone = milestoneById(milestoneId),
    bond = bondOf(game, charId);
  if (!milestone || !bond) {
    return "There is no step like that.";
  }
  if (milestoneOfInactiveModule(game, milestoneId)) {
    return "Not now.";
  }
  if (bond.asks?.id === milestoneId && specialAskWhyNot(game, charId, milestoneId)) {
    return specialAskWhyNot(game, charId, milestoneId);
  }
  if (
    (bond.asks?.id === milestoneId && askGone(game, bond)) ||
    (milestoneId === "drop-by" &&
      bond.asks?.id === milestoneId &&
      !(game.approach?.characterId === charId && game.approach.opened)) ||
    (milestoneId === "mate-moment" &&
      bond.asks?.id === milestoneId &&
      mateMomentWaits(game, bond.asks, characterOf(game, charId)))
  ) {
    return "Not now.";
  }
  if (bond.asks?.id === milestoneId && partnersAway(game, bond.asks)) {
    return `Not until ${nameFor(game, characterOf(game, partnersAway(game, bond.asks)))} is here too.`;
  }
  if (bond.asks?.id === milestoneId) {
    return "";
  }
  if (SPECIAL_MILESTONE_HANDLERS[milestoneId]) {
    return SPECIAL_MILESTONE_HANDLERS[milestoneId].whyNot?.(game, charId) ?? "";
  }
  if (milestoneId === "break-up") {
    return MILESTONE_COUPLE_STATUSES.includes(bond.status) ? "" : "You are not together.";
  }
  if (milestoneId === "confront") {
    return MILESTONE_COUPLE_STATUSES.includes(bond.status) && heardOf(game, charId)
      ? ""
      : "There is nothing to bring up.";
  }
  if (milestoneId === "talk-other") {
    return talkOtherOf(game, charId) ? "" : "There is nothing to talk about.";
  }
  if (milestoneId === "talk") {
    return canTalkItOutWithProud(bond) ? "" : "There is nothing to talk out.";
  }
  if (milestoneId === "mate-in") {
    return mateInBlockReason(game, charId);
  }
  if (milestoneId === "mate-out") {
    return housematesOf(game).some((mate) => mate.id === charId) ? "" : "You do not live together.";
  }
  if (milestoneId === "open-ask") {
    return game.rules?.multipleRelationships
      ? MILESTONE_COUPLE_STATUSES.includes(bond.status)
        ? bond.openAgreement || "*" in (bond.open?.you ?? {})
          ? "You already agreed you can see anyone."
          : ""
        : "You are not together."
      : "Switch on \xABMultiple relationships\xBB in RULES first.";
  }
  if (milestoneId === "marry-ask") {
    return game.rules?.multipleRelationships
      ? MILESTONE_COUPLE_STATUSES.includes(bond.status)
        ? ""
        : "You are not together."
      : "Switch on \xABMultiple relationships\xBB in RULES first.";
  }
  if (milestone.by === "them") {
    return "That is theirs to bring up.";
  }
  if (milestoneId === "reconcile") {
    return canReconcileWithEx(bond, game.minutes, partnersCtx(game)).reason;
  }
  if (milestoneId === "propose") {
    return proposeWhy(game, charId, milestoneCtx(game, charId));
  }
  let offer = milestoneFor(game, charId)?.asks ? null : nextStepOffer(game, charId);
  return !offer || offer.id !== milestoneId
    ? canTakeMilestoneStep(bond, milestoneId, milestoneCtx(game, charId)).reason || "Not now."
    : "";
}

export {
  CONFESS_NO,
  CONFESS_RETRY_DAY_MINUTES,
  OWN_STAGE,
  PLANNED_OUTING_ASKS,
  SPECIAL_MILESTONE_HANDLERS,
  TRIANGLE_MILESTONES,
  askGone,
  canSeeOther,
  datingWhy,
  dropGoneAsk,
  hasBang,
  itemNameOf,
  milestoneCtx,
  milestoneEventsFor,
  milestoneFor,
  milestoneHandlers,
  milestoneWhyNot,
  partnersCtx,
  plannedAskGone,
  registerMilestone,
  roomFor,
  specialActions,
  staleAsks,
  talkWhy,
  theirConfession,
  whyWords,
};
