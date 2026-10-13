// Free-talk plan building and applying acts, claims, gifts, loans and milestone jumps
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { isEventRun } from "../events/event-run.mjs";
import { addToEventCast, eventCast, startEventRun } from "../events/event-cast.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import {
  RELATIONSHIP_STATUS_LABELS,
  STATUS_STEPS,
  applyBondAction,
  bondTier,
  conflictingPartner,
  hasMet,
  setRelationshipStatus,
  settleTierEvent,
} from "../relationships/bonds.mjs";
import { MILESTONES, MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { canReconcileWithEx, canTakeMilestoneStep } from "../relationships/milestone-steps.mjs";
import { judgeSceneReads, tierRetryAt, tierStepMoment } from "../relationships/tier-steps.mjs";
import { FAVOUR_KINDS } from "../relationships/favours.mjs";
import {
  CLAIM_DESCRIPTIONS,
  MILESTONE_BANNER_LABELS,
  decideFreeActOutcomes,
  eventStepCoversAct,
} from "./free-acts.mjs";
import { endScene, enterDecidePhase } from "./scene-engine.mjs";
import { itemDef } from "../items/inventory.mjs";
import { isPileSpoiled } from "../inventory/piles-and-cooking.mjs";
import { npcPairBetween, npcPairKey } from "../network/npc-pairs.mjs";
import { introduceNpcPair, personKnowsFact, recordTownFact, tellFactTo } from "../network/town-facts.mjs";
import { OUTING_KINDS } from "../outings/outing-rules.mjs";
import { spendMoney } from "../money/wallet.mjs";
import { activeModules, collectModuleHook, firstModuleHook, runModuleHook } from "../modules/module-registry.mjs";
import { answerPlea, askBack, canAskBack, hostOf, lentTo, lentView } from "../money/pleas-and-loans.mjs";
import { cleanScenePlan, outingAbout, planPlaceName, scenePlans, scenePlansBlock } from "../plans/plans.mjs";
import { birthdayPartyWhy, birthdayState, greetBirthday, learnBirthday } from "../relationships/birthday-events.mjs";
import { PARTY_FROM_TIER, housePartyWhy } from "../parties/house-party.mjs";
import { partyActsWithGuest } from "../parties/party.mjs";
import {
  amountOwedTo,
  askForIntroduction,
  borrowFromFriend,
  debtWith,
  hasFriendPerk,
  introducablePeopleOf,
  loanOfferFrom,
  settleDebtTo,
} from "../relationships/friend-perks.mjs";
import { richLookOf } from "../home/furniture-and-wardrobe.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { knownName } from "../relationships/network-sheet.mjs";
import {
  coupleOf,
  forgivenessOf,
  hurtBond,
  learnYou,
  learnedFact,
  otherIn,
  settledPair,
} from "../romance/jealousy.mjs";
import { workingNow } from "../cast/working-now.mjs";
import { togetherActivities } from "../visits/staying-over.mjs";
import { castBoss } from "../jobs/office.mjs";
import { proposeWhy, ringsInBag } from "../romance/proposal.mjs";
import { canSeeOther, milestoneCtx, milestoneEventsFor } from "../milestones/milestone-availability.mjs";
import { answerRide, goingBy, rideChoices, rideView } from "../travel/vehicles-rides.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  gaveGiftToday,
  giftInfo,
  giftResultFor,
  handOverGift,
  hasMet2,
  isNoFlirtBond,
  keyImageFor,
  keyImagesOn,
  nameFor,
  peopleHere,
  rememberScene,
  traitsOf,
} from "../game.mjs";

var FALSE_CLAIM = {
  friendship: -1,
  trust: -2,
};
var stepMilestoneOf = (scene) =>
  isEventRun(scene)
    ? (scene.milestone ??
      (scene.kind === "tier" && scene.axis === "romance" && scene.tier === 2 ? "tier-confess" : null))
    : null;
function freeTalkState(game, scene) {
  let characterId = scene.characterId,
    bond = bondOf(game, characterId),
    ctx = milestoneCtx(game, characterId),
    confessStatus =
      milestoneEventsFor(game, characterId).list.find(
        (milestoneEvent) => milestoneEvent.axis === "romance" && milestoneEvent.tier === 2,
      )?.status ?? null,
    romanceOwed = bond.tierEventOwed?.romance,
    partnersStep = canTakeMilestoneStep(bond, "partners", ctx),
    moveInStep = canTakeMilestoneStep(bond, "move-in", ctx),
    couple = coupleOf(game, characterId);
  return {
    at: game.minutes,
    status: bond.status,
    event: isEventRun(scene),
    romanceTier: bondTier(bond, "romance"),
    friendshipTier: bondTier(bond, "friendship"),
    justFriends: !!bond.justFriends,
    romanceable: bond.romanceable !== false,
    kin: !!bond.kin,
    couple: couple
      ? {
          id: otherIn(couple, characterId),
          name: characterOf(game, otherIn(couple, characterId))?.name ?? "someone",
        }
      : null,
    stray: TRAIT_BEHAVIOURS.stray(traitsOf(game, characterId)),
    going: judgeSceneReads(scene.reads ?? []).accepted,
    blocked: bond.freeNo ?? {},
    reconcile: bond.status === "ex" ? canReconcileWithEx(bond, game.minutes, ctx) : null,
    datingWhy:
      bond.status === "single" && conflictingPartner(bond, ctx.otherPartners)
        ? `the player is with ${characterOf(game, conflictingPartner(bond, ctx.otherPartners).characterId)?.name ?? "someone"}, who has not agreed to it`
        : "",
    confession:
      confessStatus === "ready" ||
      (bond.status === "single" &&
        romanceOwed == null &&
        bond.romance >= STATUS_STEPS.dating.romance &&
        bond.trust >= STATUS_STEPS.dating.trust)
        ? "ready"
        : confessStatus,
    firstKiss: !!bond.milestones?.firstKiss,
    firstKissOk: canTakeMilestoneStep(bond, "first-kiss", ctx).ok,
    partnersOk: partnersStep.ok,
    partnersWhy: partnersStep.reason,
    moveInOk: moveInStep.ok,
    moveInWhy: moveInStep.reason,
    multiple: !!game.rules?.multipleRelationships,
    stepAhead: isEventRun(scene) && scene.by !== "them" && scene.phase === "talk" && !scene.after,
    stepOf: stepMilestoneOf(scene),
    ultimatum:
      (scene?.milestone === "her-or-me" ||
        (["partners-compete", "partners-argue"].includes(scene?.milestone) && !scene?.after)) &&
      !scene.done,
    propose: {
      ok: !proposeWhy(game, characterId, ctx),
      why: proposeWhy(game, characterId, ctx),
    },
    introduce: hasFriendPerk(game, characterId, "introduce") && introducablePeopleOf(game, characterId).length > 0,
    invite: isEventRun(scene)
      ? null
      : scenePlans(game, characterId)
        ? {
            ok: true,
          }
        : {
            ok: false,
            why: "not now",
          },
    party: isEventRun(scene)
      ? null
      : housePartyWhy(game) && birthdayPartyWhy(game)
        ? {
            ok: false,
            why: housePartyWhy(game).toLowerCase(),
          }
        : bondTier(bond, "friendship") < PARTY_FROM_TIER
          ? {
              ok: false,
              why: "they do not know the player well enough yet",
            }
          : {
              ok: true,
            },
    birthday: birthdayState(game, characterId),
    lent: lentTo(game, characterId)
      ? {
          amount: lentTo(game, characterId),
          can: canAskBack(game, characterId),
          from: lentView(game).find((entry) => entry.characterId === characterId)?.from ?? "",
          for: lentView(game).find((entry) => entry.characterId === characterId)?.for ?? "",
        }
      : null,
    outing: scene.event === "outing",
    loan: loanOfferFrom(game, characterId),
    debt: debtWith(game, characterId),
  };
}
function freePlan(game, scene = game.scene) {
  if (!scene || scene.done) {
    return null;
  }
  let characterId = scene.characterId,
    bond = bondOf(game, characterId),
    character = characterOf(game, characterId);
  if (!bond || !character) {
    return null;
  }
  let talkState = freeTalkState(game, scene),
    outcomes = decideFreeActOutcomes(talkState),
    moduleActs = activeModules(game).length ? moduleFreeActs(game, scene) : null;
  if (moduleActs) {
    for (let [actKey, act] of Object.entries(moduleActs.acts)) {
      outcomes[actKey] = {
        how: act.how,
        ...(act.why
          ? {
              why: act.why,
            }
          : {}),
      };
    }
  }
  let cast = eventCast(scene),
    here = peopleHere(game)
      .filter((person) => !cast.includes(person.id) && hasMet2(game, person.id))
      .map((person) => ({
        id: person.id,
        name: characterOf(game, person.id)?.name ?? person.name,
      })),
    closeness = (personId) => {
      let otherBond = bondOf(game, personId) ?? {};
      return (otherBond.friendship ?? 0) + (otherBond.romance ?? 0) + (otherBond.trust ?? 0);
    },
    rank = (person) =>
      (cast.includes(person.id) || here.some((other) => other.id === person.id) ? 1e3 : 0) + closeness(person.id),
    people = [
      {
        id: characterId,
        name: character.name,
        self: true,
      },
      ...castInTown(game)
        .filter((person) => person.id !== characterId && hasMet2(game, person.id))
        .sort((first, second) => rank(second) - rank(first))
        .slice(0, 24)
        .map((person) => ({
          id: person.id,
          name: person.name,
        })),
    ],
    items =
      !hasMet(bond) || gaveGiftToday(game, characterId)
        ? []
        : giftInfo(game, characterId)
            .items.filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index)
            .slice(0, 10)
            .map((item) => ({
              key: item.id,
              name: item.name,
              index: item.index,
              result: giftResultFor(character, bond, itemDef(game.things, item.id)),
            })),
    together = talkState.event
      ? []
      : game.party
        ? partyActsWithGuest(game, characterId)
        : (togetherActivities(game).find((activity) => activity.characterId === characterId)?.items ?? []).map(
            (activity) => ({
              key: activity.key,
              name: activity.name,
              available: activity.available,
              why: activity.why,
            }),
          ),
    outings = talkState.event ? null : scenePlans(game, characterId);
  return {
    outcomes: outcomes,
    people: people,
    here: here,
    items: items,
    together: together,
    ...(moduleActs
      ? {
          more: moduleActs,
        }
      : {}),
    outings: outings,
    outingsBlock: outings
      ? scenePlansBlock(outings, {
          who: "the player",
          field: "outing",
        })
      : "",
    caught: caughtFacts(game, characterId, moduleActs),
    cash: Math.max(0, Math.floor(game.wallet?.cash ?? 0)),
    plea:
      hostOf(game.plea) === characterId
        ? {
            kind: game.plea.kind,
            what: game.plea.what,
            amount: game.plea.amount,
            ...(game.plea.characterId !== characterId
              ? {
                  name: nameFor(game, characterOf(game, game.plea.characterId)),
                }
              : {}),
          }
        : null,
    askers: eventCast(scene)
      .filter((personId) => personId !== characterId && characterOf(game, personId) && bondOf(game, personId))
      .map((personId) => ({
        id: personId,
        name: nameFor(game, characterOf(game, personId)),
      })),
    between:
      talkState.lent || talkState.debt
        ? {
            lent: talkState.lent,
            debt: talkState.debt,
          }
        : null,
    payBack:
      !!talkState.lent?.can &&
      scene === game.scene &&
      scene.kind === "talk" &&
      !talkState.event &&
      !game.plea &&
      !game.ride,
    asksEasily: traitsOf(game, characterId).dials.caring <= 2,
    rich: !!richLookOf(game),
    rideOpen: scene === game.scene && game.ride?.characterId === characterId ? rideView(game) : null,
    rides: scene === game.scene && !game.plea && !talkState.event ? rideChoices(game, characterId) : [],
    vehicle: goingBy(game),
    confront: MILESTONE_COUPLE_STATUSES.includes(bond.status) && !talkState.event,
    boss:
      castBoss(game)?.id === characterId
        ? {
            employed: !!game.job?.employed,
            atWork: game.at === "office" && !game.visit && workingNow(game, character),
            asks: game.job?.employed ? ["day-off", "quit"] : ["apply"],
          }
        : null,
    pictureSteps: keyImagesOn(game) && Object.values(outcomes).some((outcome) => outcome.how === "yes" && outcome.step),
  };
}
function moduleFreeActs(game, scene) {
  let acts = {},
    claims = [];
  for (let hookResult of collectModuleHook(game, "freeActs", scene)) {
    Object.assign(acts, hookResult.acts ?? {});
    claims.push(...(hookResult.claims ?? []));
  }
  return Object.keys(acts).length || claims.length
    ? {
        acts: acts,
        claims: claims,
      }
    : null;
}
function caughtFacts(game, characterId, moduleActs = null) {
  let caught = [];
  for (let [claimKind, acts] of Object.entries(CLAIM_ACTS)) {
    if (!(!CLAIM_DESCRIPTIONS[claimKind] && !moduleActs?.claims?.includes(claimKind))) {
      for (let fact of game.facts ?? []) {
        if (!(
          !acts.includes(fact.act) ||
          !fact.with ||
          fact.with === characterId ||
          !personKnowsFact(game, characterId, fact.id) ||
          caught.some((entry) => entry.what === claimKind && entry.with === fact.with)
        )) {
          caught.push({
            what: claimKind,
            with: fact.with,
            name: characterOf(game, fact.with)?.name ?? "someone",
          });
        }
      }
    }
  }
  return caught.slice(0, 6);
}
var claimSides = (claim, characterId) =>
  claim.who === "you"
    ? {
        you: true,
        other: claim.with,
      }
    : claim.with === "you"
      ? {
          you: true,
          other: claim.who,
        }
      : claim.who === characterId
        ? {
            them: true,
            other: claim.with,
          }
        : claim.with === characterId
          ? {
              them: true,
              other: claim.who,
            }
          : {
              a: claim.who,
              b: claim.with,
            };
var CLAIM_ACTS = {
  dating: ["dating", "partners", "living"],
  kissed: ["kiss"],
  flirting: ["flirt", "kiss"],
  "broke-up": ["breakup"],
};
function claimHoldsForYou(game, claimKind, otherId, characterId) {
  let factId =
      (game.facts ?? [])
        .filter(
          (fact) =>
            CLAIM_ACTS[claimKind].includes(fact.act) &&
            fact.with &&
            fact.with !== characterId &&
            (!otherId || fact.with === otherId),
        )
        .at(-1)?.id ?? null,
    bonds = otherId
      ? [bondOf(game, otherId)].filter(Boolean)
      : Object.values(game.bonds).filter((bond) => bond.characterId !== characterId);
  return {
    holds:
      claimKind === "dating"
        ? bonds.some((bond) => MILESTONE_COUPLE_STATUSES.includes(bond.status))
        : claimKind === "broke-up"
          ? bonds.some((bond) => bond.status === "ex")
          : claimKind === "kissed"
            ? !!factId || bonds.some((bond) => bond.milestones?.firstKiss)
            : !!factId,
    fact: factId,
  };
}
function claimHoldsForPair(game, claimKind, firstId, secondId) {
  let pair = firstId && secondId ? npcPairBetween(game, firstId, secondId) : null;
  return pair
    ? claimKind === "dating"
      ? pair.kind === "couple"
      : claimKind === "broke-up"
        ? pair.kind === "ex"
        : pair.kind === "couple" || (pair.romance ?? 0) >= 30
    : false;
}
function detectJump(game, plan, reads, scene = game.scene) {
  let characterId = scene?.characterId,
    bond = bondOf(game, characterId);
  if (!plan || !reads || !bond) {
    return null;
  }
  let nameOf = (personId) => characterOf(game, personId)?.name ?? "them",
    moduleJump = plan.more ? firstModuleHook(game, "freeJump", plan, reads, scene) : undefined;
  if (moduleJump) {
    return moduleJump;
  }
  for (let act of reads.acts) {
    if (plan.outcomes[act]?.how === "confirm") {
      if (act === "break-up") {
        return {
          milestone: "break-up",
          about: null,
          act: "Break up",
        };
      }
      if ((act === "take-step" || eventStepCoversAct(stepMilestoneOf(scene), act)) && isEventRun(scene)) {
        return {
          milestone: scene.milestone ?? "step",
          about: scene.about ?? null,
          act: stepTitle(game, scene),
          same: true,
        };
      }
      if (act === "choose" && scene.milestone === "her-or-me") {
        return {
          milestone: "her-or-me",
          about: scene.about,
          act: "Her or me",
          same: true,
        };
      }
      if (act === "choose" && ["partners-compete", "partners-argue"].includes(scene.milestone) && !scene.after) {
        return {
          milestone: scene.milestone,
          about: scene.about,
          act: scene.milestone === "partners-argue" ? "Whose side" : "Who you go to",
          same: true,
        };
      }
      if ((act === "ask-out" || act === "partners") && bond.status === "ex") {
        return {
          milestone: "reconcile",
          about: null,
          act: "Try again",
        };
      }
      if (act === "move-in") {
        return {
          milestone: "move-in",
          about: null,
          act: "Move in together",
        };
      }
      if (act === "propose") {
        return {
          milestone: "propose",
          about: {
            ring: ringsInBag(game)[0]?.id ?? null,
            how: null,
          },
          act: "Propose",
        };
      }
      if (act === "invite") {
        let outing = cleanScenePlan(game, characterId, reads.outing, plan.outings);
        if (outing) {
          let label = `${OUTING_KINDS[outing.kind].name} \xB7 ${planPlaceName(game, outing)} \xB7 ${clockFromMinutes(outing.at).weekday} ${clockFromMinutes(outing.at).day} ${formatClockTime(outing.at)}`;
          return {
            milestone: "ask-plan",
            about: {
              outing: outing,
              text: outingAbout(game, outing),
              label: `Ask: ${label}`,
            },
            act: `Invite them out \xB7 ${label}`,
          };
        }
      }
      if (
        act === "ask-open" &&
        reads.open &&
        reads.open !== characterId &&
        hasMet2(game, reads.open) &&
        canSeeOther(game, reads.open) &&
        !(bond.open?.you && reads.open in bond.open.you)
      ) {
        return {
          milestone: "open-ask",
          about: {
            with: reads.open,
            ask: true,
          },
          act: `See ${nameOf(reads.open)}`,
        };
      }
    }
  }
  if (!plan.confront) {
    return null;
  }
  for (let claim of reads.told) {
    let sides = claimSides(claim, characterId);
    if (
      !sides.them ||
      claim.not ||
      !sides.other ||
      sides.other === "you" ||
      !claimHoldsForPair(game, claim.what, characterId, sides.other) ||
      settledPair(game, characterId, sides.other)
    ) {
      continue;
    }
    let known = (game.youKnow ?? []).find(
      (entry) => !entry.confronted && npcPairKey(entry.a, entry.b) === npcPairKey(characterId, sides.other),
    );
    return {
      milestone: "confront",
      about: {
        with: sides.other,
        confront: true,
        how: known?.how ?? "guessed",
        from: known?.from ?? null,
      },
      act: `Confront ${nameOf(characterId)}`,
      guessed: !known,
    };
  }
  return null;
}
var freeHolds = (game, plan, reads) => !!detectJump(game, plan, reads);
function theirPlanJump(game, outing, outings) {
  let scene = game.scene;
  if (!scene || scene.done || isEventRun(scene)) {
    return false;
  }
  let outing2 = cleanScenePlan(game, scene.characterId, outing, outings);
  if (!outing2) {
    return false;
  }
  let def = MILESTONES["their-plan"].def;
  Object.assign(scene, {
    kind: "milestone",
    milestone: "their-plan",
    by: "them",
    about: {
      outing: outing2,
      text: outingAbout(game, outing2),
    },
    step: "",
    ...startEventRun(def),
  });
  enterDecidePhase(scene);
  return true;
}
function stepTitle(game, scene) {
  return scene.kind === "tier"
    ? (tierStepMoment(scene.axis, scene.tier, scene.couple)?.title ?? "The moment")
    : (MILESTONES[scene.milestone]?.title(characterOf(game, scene.characterId)?.name ?? "") ?? "The moment");
}
function jumpToMilestone(
  game,
  scene,
  milestoneId,
  about,
  { act: act, over: over, endedBy: endedBy, remember: remember, each = null, same = false },
) {
  if (same) {
    scene.detected = {
      id: milestoneId,
      act: act,
      same: true,
      prev: {
        phase: scene.phase,
        beat: scene.beat,
        over: over,
        suggestions: scene.suggestions,
      },
    };
    enterDecidePhase(scene);
    return;
  }
  let def = MILESTONES[milestoneId].def;
  scene.detected = {
    id: milestoneId,
    act: act,
    prev: {
      kind: scene.kind,
      max: scene.max,
      over: over,
      endedBy: endedBy,
      remember: remember,
      each: each,
      suggestions: scene.suggestions,
    },
  };
  Object.assign(scene, {
    kind: "milestone",
    milestone: milestoneId,
    by: "you",
    about: about,
    step: "",
    ...startEventRun(def),
  });
  enterDecidePhase(scene);
}
function undoDetected(game) {
  let scene = game.scene,
    detected = scene?.detected;
  if (!detected || scene.done || scene.phase !== "decide") {
    return {
      ok: false,
      reason: "There is nothing to take back.",
    };
  }
  let prev = detected.prev;
  if (detected.same) {
    Object.assign(
      scene,
      prev.over
        ? {
            detected: null,
          }
        : {
            phase: prev.phase ?? "talk",
            beat: prev.beat,
            suggestions: prev.suggestions ?? [],
            detected: null,
            undone: (scene.undone ?? 0) + 1,
          },
    );
    return {
      ok: true,
      scene: scene,
    };
  }
  for (let key of ["milestone", "by", "about", "event", "beats", "beat", "step"]) {
    delete scene[key];
  }
  Object.assign(scene, {
    kind: prev.kind,
    max: prev.max,
    phase: "talk",
    suggestions: prev.suggestions ?? [],
    detected: null,
    undone: (scene.undone ?? 0) + 1,
  });
  if (prev.over) {
    endScene(scene, bondOf(game, scene.characterId), {
      endedBy: prev.endedBy,
      remember: prev.remember,
      each: prev.each ?? null,
    });
    rememberScene(game, scene);
  }
  return {
    ok: true,
    scene: scene,
  };
}
function applyFreeActs(ctx, acts) {
  let { plan: plan, bond: bond, character: character, id: characterId, at: at, tags: tags, events: events } = ctx;
  for (let act of acts) {
    let outcome = plan.outcomes[act];
    if (!(!outcome || plan.more?.acts?.[act]) && !outcome.free) {
      if (act === "ask-birthday") {
        if (outcome.how === "yes" && learnBirthday(ctx.game, characterId, "asked")) {
          tags.push({
            text: `\u{1F382} ${(character?.name ?? "their").toUpperCase()}'S BIRTHDAY \xB7 ${outcome.date.toUpperCase()}`,
            step: true,
          });
        }
        continue;
      }
      if (act === "happy-birthday") {
        if (outcome.how === "yes") {
          tags.push(...(greetBirthday(ctx.game, characterId, "words").tags ?? []));
        } else {
          tags.push({
            text: "NOT TODAY",
            bad: false,
          });
        }
        continue;
      }
      if (act === "ask-money-back") {
        let result = outcome.how === "yes" ? askBack(ctx.game, characterId) : null;
        tags.push(
          result?.paid
            ? {
                text: `PAID YOU BACK $${result.paid}`,
                step: true,
              }
            : outcome.how === "soft"
              ? {
                  text: "\u2715 NOT YET \xB7 A FEW MORE DAYS",
                  bad: true,
                }
              : {
                  text: "THEY OWE YOU NOTHING",
                  bad: true,
                },
        );
        continue;
      }
      if (act !== "ask-loan") {
        if (outcome.how === "yes") {
          if (act === "kiss") {
            ctx.fact("kiss");
            if (outcome.step === "first-kiss") {
              bond.milestones = {
                ...(bond.milestones ?? {}),
                firstKiss: at,
              };
              ctx.counted = "first-kiss";
            }
          } else if (act === "hands") {
            ctx.fact("flirt");
          } else if (act === "introduce-me") {
            let person = introducablePeopleOf(ctx.game, characterId).sort(
              (first, second) => second.here - first.here,
            )[0];
            if (person) {
              let intro = askForIntroduction(ctx.game, characterId, person.id);
              if (intro.ok) {
                events.push(...intro.events);
                tags.push({
                  text: intro.met
                    ? `\u25B8 YOU MET ${person.name.toUpperCase()}`
                    : `\u25B8 ${person.name.toUpperCase()}, WHEN YOU CROSS PATHS`,
                  step: true,
                });
              }
            }
          } else if (outcome.step === "dating") {
            if (bond.tierEventOwed?.romance === 2) {
              settleTierEvent(bond, "romance");
            }
            setRelationshipStatus(bond, "dating", {
              at: at,
            });
            ctx.fact("confess");
            recordTownFact(ctx.game, "dating", {
              with: characterId,
              place: ctx.game.at,
            });
            events.push({
              id: "dating",
              characterId: characterId,
              text: `You and ${character?.name ?? "them"} are dating now.`,
            });
            ctx.counted = "dating";
          } else if (outcome.step === "partners") {
            setRelationshipStatus(bond, "partners", {
              at: at,
            });
            recordTownFact(ctx.game, "partners", {
              with: characterId,
              place: ctx.game.at,
            });
            events.push({
              id: "partners",
              characterId: characterId,
              text: `You and ${character?.name ?? "them"} are partners now.`,
            });
            ctx.counted = "partners";
          }
        } else if (outcome.how === "soft") {
          if (["hands", "kiss", "ask-out", "partners"].includes(act)) {
            hurtBond(bond, {
              romance: -1,
            });
          }
          tags.push({
            text: act === "hug" || act === "hands" ? "\u2715 THEY PULLED AWAY" : "\u2715 NOT YET",
            bad: true,
          });
        } else if (outcome.how === "no") {
          hurtBond(bond, {
            friendship: -3,
            trust: -2,
            romance: -2,
          });
          bond.freeNo = {
            ...(bond.freeNo ?? {}),
            romance: tierRetryAt(bond, at),
          };
          if (coupleOf(ctx.game, characterId) && !isNoFlirtBond(bond)) {
            ctx.fact("flirt");
          }
          tags.push({
            text: "\u2715 TURNED DOWN",
            bad: true,
          });
        }
      }
    }
  }
}
function applyFreeClaims(ctx, claims) {
  let { game: game, plan: plan, bond: bond, character: character, id: characterId, at: at, tags: tags } = ctx;
  for (let claim of claims) {
    let sides = claimSides(claim, characterId);
    if (sides.you) {
      if (sides.other === characterId) {
        continue;
      }
      let check = claimHoldsForYou(game, claim.what, sides.other, characterId);
      if (!claim.not && check.holds && check.fact && !personKnowsFact(game, characterId, check.fact)) {
        tellFactTo(game, characterId, check.fact, {
          from: "you",
          at: at,
        });
        learnedFact(game, [characterId], check.fact, "heard", "you");
        tags.push({
          text: `${(character?.name ?? "THEY").toUpperCase()} KNOWS NOW`,
          bad: false,
        });
      } else if (claim.not && check.holds) {
        if (check.fact && personKnowsFact(game, characterId, check.fact)) {
          hurtBond(bond, {
            trust: -(
              [8, 6, 5, 4][
                forgivenessOf(bond, {
                  betrayal: true,
                })
              ] ?? 5
            ),
          });
          tags.push({
            text: "\u2715 THEY KNOW IT'S A LIE",
            bad: true,
          });
        } else {
          bond.lies = [
            ...(bond.lies ?? []),
            {
              fact: check.fact,
              at: at,
            },
          ].slice(-20);
          tags.push({
            text: "LIE",
            bad: true,
          });
        }
      }
    } else if (sides.them) {
      if (claim.not || !sides.other || sides.other === "you") {
        continue;
      }
      if (plan.confront && !claimHoldsForPair(game, claim.what, characterId, sides.other)) {
        hurtBond(bond, FALSE_CLAIM);
        tags.push({
          text: "\u2715 NOT TRUE",
          bad: true,
        });
      }
    } else if (!claim.not && sides.a !== "you" && sides.b && !claimHoldsForPair(game, claim.what, sides.a, sides.b)) {
      recordTownFact(game, "rumor", {
        with: sides.a,
        about: sides.b,
        what: claim.what,
        hearer: characterId,
        place: game.at,
      });
      tags.push({
        text: `LIE \xB7 ABOUT ${ctx.name(sides.a).toUpperCase()}`,
        bad: true,
      });
    }
  }
}
function applyFreeGiving(ctx, reply) {
  let {
    game: game,
    plan: plan,
    scene: scene,
    bond: bond,
    character: character,
    id: characterId,
    at: at,
    tags: tags,
  } = ctx;
  if (reply.give) {
    let item = plan.items.find((entry) => entry.key === reply.give),
      bagIndex = (game.things?.bag ?? []).findIndex((pile) => pile.item === reply.give && !isPileSpoiled(pile)),
      given =
        item && bagIndex >= 0 && character
          ? handOverGift(game, bond, character, bagIndex, {
              at: at,
            })
          : null;
    if (given) {
      ctx.fact("gift");
      tags.push({
        text: `\u{1F381} ${given.item.name.toUpperCase()} \xB7 ${given.worth.stamp}`,
        bad: !given.worth.good,
      });
    }
  }
  if (reply.money > 0 && reply.money <= (game.wallet?.cash ?? 0)) {
    spendMoney(game.wallet, reply.money, `Gave to ${character?.name ?? "someone"}`, at);
    let repaid = amountOwedTo(game, characterId) ? settleDebtTo(game, characterId, reply.money) : 0;
    if (repaid) {
      tags.push({
        text: `$${repaid} PAID BACK`,
        bad: false,
      });
    }
    if (reply.money > repaid) {
      applyBondAction(
        bond,
        {
          action: "reliable",
          friendship: 1,
          trust: reply.money - repaid >= FAVOUR_KINDS.lend.big.cash ? 2 : 1,
        },
        {
          at: at,
          note: "money",
        },
      );
      tags.push({
        text: `$${reply.money - repaid} GIVEN`,
        bad: false,
      });
    }
  }
  if (
    reply.introduce &&
    addToEventCast(scene, reply.introduce, {
      at: at,
      why: "introduced",
    })
  ) {
    introduceNpcPair(game, characterId, reply.introduce, {
      place: game.at,
      at: at,
    });
    tags.push({
      text: `WITH ${ctx.name(reply.introduce).toUpperCase()}`,
      bad: false,
    });
  }
}
var LOAN_REFUSALS = {
  moment: () => "\u2715 NOT NOW",
  overdue: (owed) => `\u2715 YOU OWE THEM $${owed} \xB7 PAST DUE`,
  full: (owed) => `\u2715 YOU ALREADY OWE THEM $${owed}`,
};
function applyLoanAsk(ctx, reply) {
  let { game: game, plan: plan, id: characterId, tags: tags } = ctx,
    outcome = plan.outcomes["ask-loan"];
  if (!reply.acts.includes("ask-loan") || !outcome) {
    return;
  }
  if (outcome.how !== "yes") {
    tags.push({
      text: (LOAN_REFUSALS[outcome.code] ?? (() => "\u2715 THEY WON'T LEND YOU MONEY"))(
        amountOwedTo(game, characterId),
      ),
      bad: true,
    });
    return;
  }
  if (!(reply.loan > 0)) {
    tags.push({
      text: "HOW MUCH?",
      bad: false,
    });
    return;
  }
  let loan = borrowFromFriend(game, characterId, Math.min(reply.loan, outcome.max));
  tags.push({
    text: `BORROWED $${loan.amount}${loan.amount !== reply.loan ? ` OF THE $${reply.loan}` : ""} \xB7 DUE ${loan.due.toUpperCase()}`,
    step: true,
  });
}
function theyPayBack(game, plan, scene = game.scene) {
  if (!plan?.payBack || !scene) {
    return null;
  }
  let result = askBack(game, scene.characterId);
  if (!result.ok || !result.paid) {
    return null;
  }
  let tag = {
      text: `PAID YOU BACK $${result.paid}`,
      step: true,
    },
    sameExchange = scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length;
  scene.did = {
    exchange: scene.exchange,
    logAt: scene.log.length,
    tags: [...(sameExchange ? scene.did.tags : []), tag],
  };
  return tag;
}
function applyFree(
  game,
  plan,
  reply,
  { picture = null, over = false, endedBy = "done", remember = "", each = null } = {},
  scene = game.scene,
) {
  if (!plan || !scene || !reply) {
    return {
      tags: [],
      events: [],
      pictureId: null,
    };
  }
  let characterId = scene.characterId,
    bond = bondOf(game, characterId),
    character = characterOf(game, characterId),
    at = game.minutes,
    jump = detectJump(game, plan, reply, scene);
  if (reply.job && plan.boss?.atWork && !jump && !over) {
    scene.jobAsk = {
      ask: reply.job,
      at: at,
    };
  }
  let ctx = {
      game: game,
      plan: plan,
      scene: scene,
      id: characterId,
      bond: bond,
      character: character,
      at: at,
      tags: [],
      events: [],
      seen: new Set(),
      hurt: new Set(),
      counted: null,
      name: (personId) => (personId === characterId ? character?.name : characterOf(game, personId)?.name) ?? "someone",
      fact: (act) => {
        let witnessIds = recordTownFact(game, act, {
          with: characterId,
          place: game.at,
          witnesses: sawIt(game, characterId),
        });
        for (let witness of witnessIds) {
          ctx.seen.add(witness);
        }
        for (let hurtId of learnedFact(game, witnessIds, game.facts.at(-1).id, "seen")) {
          ctx.hurt.add(hurtId);
        }
      },
    },
    { tags: tags, events: events, seen: seen, hurt: hurt } = ctx;
  if (
    (reply.plea?.answer === "pay" &&
      (reply = {
        ...reply,
        money: 0,
      }),
    applyFreeActs(ctx, reply.acts),
    applyFreeClaims(ctx, reply.told),
    applyFreeGiving(ctx, reply),
    applyLoanAsk(ctx, reply),
    plan.more &&
      runModuleHook(
        game,
        "freeApply",
        {
          ...ctx,
          jumped: !!jump,
        },
        reply,
      ),
    reply.plea && hostOf(game.plea) === characterId)
  ) {
    let pleaResult = answerPlea(game, reply.plea.answer, {
      amount: reply.plea.amount ?? null,
      words: true,
    });
    if (pleaResult.ok) {
      tags.push(...pleaResult.tags);
    }
  }
  if (reply.drive && game.ride?.characterId === characterId && !jump) {
    let rideResult = answerRide(game, reply.drive === "yes" ? "drive" : "no", {
      words: true,
    });
    if (rideResult.ok) {
      tags.push(...rideResult.tags);
    }
  }
  if (reply.acts.includes("party") && plan.outcomes.party?.how === "confirm" && !jump) {
    scene.partyPlan = {
      with: characterId,
    };
    tags.push({
      text: "\u25B8 A PARTY AT YOUR PLACE",
      bad: false,
      step: true,
    });
  }
  let together = reply.together ? plan.together?.find((activity) => activity.key === reply.together) : null;
  if (together && !jump) {
    if (together.available) {
      scene.together = {
        key: together.key,
        name: together.name,
      };
      tags.push({
        text: `\u25B8 ${together.name.toUpperCase()}`,
        bad: false,
        step: true,
      });
    } else {
      tags.push({
        text: "\u2715 NOT NOW",
        bad: true,
      });
    }
  }
  if (seen.size) {
    tags.push({
      text: `\u{1F441} ${[...seen].map((personId) => knownName(game, personId).toUpperCase()).join(", ")} SAW THAT`,
      bad: false,
      seen: true,
    });
  }
  for (let personId of hurt) {
    if (bondOf(game, personId)?.asks) {
      bondOf(game, personId).asks.due = at;
    }
  }
  let counted = ctx.counted;
  if (counted) {
    tags.unshift({
      text: `\u2605 ${MILESTONE_BANNER_LABELS[counted]}`,
      bad: false,
      step: true,
    });
  }
  scene.did = {
    exchange: scene.exchange,
    logAt: scene.log.length,
    tags: tags,
  };
  if (jump?.guessed) {
    learnYou(game, characterId, jump.about.with, {
      how: "guessed",
      at: at,
    });
  }
  if (jump) {
    jumpToMilestone(game, scene, jump.milestone, jump.about, {
      act: jump.act,
      over: over,
      endedBy: endedBy,
      remember: remember,
      each: each,
      same: !!jump.same,
    });
  } else if (scene.together && !scene.done) {
    endScene(scene, bond, {
      endedBy: "together",
      remember: remember,
      each: each,
    });
  } else if (scene.ride && !scene.done) {
    endScene(scene, bond, {
      endedBy: "ride",
      remember: remember,
      each: each,
    });
  }
  let pictureId =
    counted && picture
      ? keyImageFor(game, scene, {
          beat: "free",
          picture: picture,
          label: counted === "first-kiss" ? MILESTONES["first-kiss"].def.label : RELATIONSHIP_STATUS_LABELS[counted],
        })
      : null;
  return {
    tags: tags,
    events: events,
    pictureId: pictureId,
    jumped: !!jump,
  };
}

export { CLAIM_ACTS, applyFree, freeHolds, freePlan, theirPlanJump, theyPayBack, undoDetected };
