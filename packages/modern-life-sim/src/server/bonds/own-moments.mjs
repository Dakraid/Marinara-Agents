// Character-initiated personal moments and approaches
import { clockFromMinutes, daysBetween } from "../time/clock.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { isJobSpan } from "../jobs/job-week.mjs";
import { addSkillXp } from "../skills/skill-levels.mjs";
import { SKILL_PERKS } from "../skills/skill-perks.mjs";
import { TRAIT_NOTABLE_BOUNDS } from "../traits/traits.mjs";
import {
  BOND_TIER_THRESHOLDS,
  STATUS_STEPS,
  TRUST_CAP_DAYS,
  applyBondAction,
  bondTier,
  hasMet,
  markTraitsSeen,
  postponeTierEvent,
  setRelationshipStatus,
  settleTierEvent,
} from "../relationships/bonds.mjs";
import {
  CONTEST_VENUES,
  DREAM_DATE_PLACES,
  SPECIAL_EVENT_REPEAT_DAYS,
  contestWinChance,
  parseDreamDate,
} from "../relationships/special-event-catalog.mjs";
import { PARTNERS_HOLD_DAYS, eligibleSpecialEvents, specialEventOutcome } from "../relationships/special-events.mjs";
import { MILESTONES, MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { canTakeMilestoneStep } from "../relationships/milestone-steps.mjs";
import { judgeSceneReads, tierRetryAt } from "../relationships/tier-steps.mjs";
import { GIFT_TAGS } from "../shop/new-arrivals.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { refillNeeds } from "../needs/needs.mjs";
import { isHallPlace, isStreetPlace } from "../town/places.mjs";
import { isPlaceOpen, isResidencePlace, townPlace } from "../town/town-layout.mjs";
import { moduleKeepsOut } from "../modules/module-registry.mjs";
import { ringsOnly } from "../social/guest-visits.mjs";
import { mateMomentWaits } from "../home/housemates.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { approachDue, knobsOf } from "../romance/romantic-acts.mjs";
import { hurtBond, learnedFact } from "../romance/jealousy.mjs";
import { partnersAway } from "../romance/multiple-partners.mjs";
import { workingHome } from "../cast/working-now.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { datingWhy, dropGoneAsk, milestoneCtx, milestoneEventsFor } from "../milestones/milestone-availability.mjs";
import {
  bondOf,
  characterOf,
  isCharacterHere,
  nameFor,
  sharesYourDoor,
  skillLevelsOf,
  traitsOf,
  whereOpts,
} from "../game.mjs";

var OWN_DAY_CHANCE = 0.25;
function ownOfTheDay(state, dayIndex) {
  if (state.ownDay === dayIndex || seededRandom(state.seed, "own-day", String(dayIndex), "any") >= OWN_DAY_CHANCE) {
    return;
  }
  let candidates = Object.values(state.bonds)
    .filter((bond) => !characterOf(state, bond.characterId)?.away)
    .map((bond) => ({
      b: bond,
      id: ownDue(state, bond, {
        daily: true,
      }),
    }))
    .filter((entry) => entry.id && !OWN_FIRST.includes(entry.id));
  if (!candidates.length) {
    return;
  }
  let weights = candidates.map((entry) => 1 + (knobsOf(entry.b).initiative ?? 1)),
    roll =
      seededRandom(state.seed, "own-day", String(dayIndex), "who") * weights.reduce((sum, weight) => sum + weight, 0),
    chosen = candidates.find((entry, index) => (roll -= weights[index]) < 0) ?? candidates.at(-1);
  chosen.b.asks = {
    id: chosen.id,
    at: state.minutes,
    due: approachDue(chosen.b, state.minutes),
  };
  state.ownDay = dayIndex;
}
var OWN_FIRST = ["dont-cage-me", "a-jealous-scene"];
var DAY_MINUTES = 1440;
function ownOpen(bond, eventId, now) {
  let entry = bond.own?.[eventId];
  return entry ? (entry.done !== undefined && !MILESTONES[eventId]?.again ? false : (entry.again ?? 0) <= now) : true;
}
function ownDue(state, bond, { daily = false } = {}) {
  if (!bond || !hasMet(bond) || bond.asks) {
    return null;
  }
  let now = state.minutes,
    friendshipTier = bondTier(bond, "friendship"),
    romanceTier = bondTier(bond, "romance"),
    trustTier = bondTier(bond, "trust"),
    together = MILESTONE_COUPLE_STATUSES.includes(bond.status),
    romanceable = bond.romanceable !== false && !bond.justFriends;
  for (let eventId of eligibleSpecialEvents(traitsOf(state, bond.characterId))) {
    if (!ownOpen(bond, eventId, now)) {
      continue;
    }
    if (
      {
        "late-realization":
          daily &&
          romanceable &&
          bond.status === "single" &&
          friendshipTier >= 3 &&
          bond.romance >= BOND_TIER_THRESHOLDS[1] &&
          bond.tierEventOwed?.romance !== 2 &&
          !datingWhy(state, bond),
        "is-this-real":
          daily &&
          bond.status === "dating" &&
          romanceTier >= 3 &&
          canTakeMilestoneStep(bond, "partners", milestoneCtx(state, bond.characterId)).ok,
        "opening-up": daily && trustTier >= 3,
        pledge: daily && trustTier >= 3 && friendshipTier >= 3,
        "dont-cage-me":
          daily &&
          bond.status === "dating" &&
          canTakeMilestoneStep(bond, "partners", milestoneCtx(state, bond.characterId)).ok,
        "working-up-to-it":
          daily &&
          romanceable &&
          bond.status === "single" &&
          milestoneEventsFor(state, bond.characterId).list.some(
            (event) => event.axis === "romance" && event.tier === 2 && event.status === "ready",
          ),
        "not-that-i-like-you": daily && romanceable && romanceTier >= 2 && bond.status === "single",
        "the-dream-date": daily && romanceable && romanceTier >= 3 && bond.status !== "ex",
        "about-the-future": daily && trustTier >= 3 && romanceTier >= 2 && ["dating", "partners"].includes(bond.status),
        "a-jealous-scene":
          daily && !!state.rules?.jealousy && bond.driftOwed && bond.status !== "ex" && (together || romanceTier >= 1),
        "looking-after-you":
          !daily &&
          friendshipTier >= 2 &&
          (state.needs.energy <= 15 || state.needs.hunger <= 15 || (state.badDayAt ?? -1 / 0) > now - DAY_MINUTES),
        "the-contest":
          !daily &&
          friendshipTier >= 2 &&
          !!CONTEST_VENUES[state.at] &&
          !state.visit &&
          isCharacterHere(state, bond.characterId),
      }[eventId]
    ) {
      return eventId;
    }
  }
  return null;
}
function ownNow(state) {
  if (
    (dropContestAway(state),
    (state.scene && !state.scene.done) || state.approach || state.ownDay === clockFromMinutes(state.minutes).dayIndex)
  ) {
    return;
  }
  let dayKey = String(clockFromMinutes(state.minutes).dayIndex);
  for (let bond of Object.values(state.bonds)) {
    if (characterOf(state, bond.characterId)?.away) {
      continue;
    }
    let eventId = ownDue(state, bond);
    if (
      eventId &&
      !(
        eventId === "the-contest" &&
        seededRandom(state.seed, bond.characterId, `${dayKey}:${state.at}`, "contest") >= 0.5
      )
    ) {
      bond.asks = {
        id: eventId,
        at: state.minutes,
        due: state.minutes + (eventId === "the-contest" ? 0 : 60),
        ...(eventId === "the-contest"
          ? {
              place: state.at,
            }
          : {}),
      };
      state.ownDay = clockFromMinutes(state.minutes).dayIndex;
      return;
    }
  }
}
function dropContestAway(state) {
  let sceneCharacterId = state.scene && !state.scene.done ? state.scene.characterId : null;
  for (let bond of Object.values(state.bonds ?? {})) {
    if (bond.asks?.id === "the-contest" && bond.asks.place !== state.at && bond.characterId !== sceneCharacterId) {
      bond.asks = null;
    }
  }
}
function ownAbout(state, bond, eventId) {
  if (eventId === "the-contest") {
    let venue = CONTEST_VENUES[state.at] ?? CONTEST_VENUES.gym;
    return {
      own: true,
      skill: venue.skill,
      text: `The contest: ${venue.what}.`,
    };
  }
  return eventId === "looking-after-you"
    ? {
        own: true,
        text: `Why they came: ${state.needs.energy <= 15 ? "the player is exhausted" : state.needs.hunger <= 15 ? "the player has not been eating" : "the player has had a bad day"}.`,
      }
    : eventId === "a-jealous-scene"
      ? {
          own: true,
          text: `The player has not seen them in ${daysBetween(bond.lastSeen, state.minutes)} days.`,
        }
      : eventId === "the-dream-date"
        ? {
            own: true,
            text: `The places of the town it could be at: ${DREAM_DATE_PLACES.map(
              (place) => townPlace(state.town, place)?.name,
            )
              .filter(Boolean)
              .join(", ")}.`,
          }
        : {
            own: true,
            text: "",
          };
}
function ownVerdict(state, scene, choice) {
  let bond = bondOf(state, scene.characterId),
    skill = scene.about?.skill,
    level = skill ? (skillLevelsOf(state)[skill] ?? 0) : 0,
    winChance = Math.min(0.95, contestWinChance(level) + (skill === "fitness" ? SKILL_PERKS.challengeBonus(level) : 0)),
    won = choice === "real" && seededRandom(state.seed, scene.characterId, String(scene.startedAt), "won") < winChance;
  return specialEventOutcome(scene.milestone, choice, {
    good: judgeSceneReads(scene.reads).accepted,
    trustTier: bondTier(bond, "trust"),
    won: won,
  });
}
var OWN_TRAIT_FOR = {
  "late-realization": "smitten",
  "is-this-real": "attention",
  "opening-up": "reserved",
  pledge: "faithful",
  "dont-cage-me": "freeSpirit",
  "looking-after-you": "caring",
  "the-contest": "temper",
  "working-up-to-it": "shy",
  "not-that-i-like-you": "proud",
  "the-dream-date": "romantic",
  "about-the-future": "practical",
  "a-jealous-scene": "jealousy",
};
function settleOwn(state, scene, bond, choice, input = {}) {
  let outcome = scene.ownOut ?? ownVerdict(state, scene, choice),
    now = state.minutes,
    events = [],
    character = characterOf(state, bond.characterId);
  if (outcome.gains) {
    applyBondAction(bond, outcome.gains, {
      at: now,
      charm: skillLevelsOf(state).charm,
      today: false,
      share: "event",
      note: scene.milestone,
    });
  }
  if (outcome.costs) {
    hurtBond(bond, outcome.costs);
  }
  let effects = outcome.effects ?? [];
  markTraitsSeen(bond, OWN_TRAIT_FOR[scene.milestone]);
  if (effects.includes("freezeRomance")) {
    bond.romanceFrozenUntil = now + 14 * DAY_MINUTES;
  }
  if (effects.includes("stakes")) {
    bond.stakes = true;
  }
  let stamp = outcome.stamp ?? null;
  if (
    effects.includes("partners") &&
    bond.status === "dating" &&
    canTakeMilestoneStep(bond, "partners", milestoneCtx(state, bond.characterId)).ok
  ) {
    setRelationshipStatus(bond, "partners", {
      at: now,
    });
    recordTownFact(state, "partners", {
      with: bond.characterId,
      place: state.at,
    });
    events.push({
      id: "partners",
      characterId: bond.characterId,
      text: `You and ${character?.name ?? "them"} are partners now.`,
    });
    stamp = "Partners";
  }
  if (effects.includes("trustCap")) {
    bond.trustCap = BOND_TIER_THRESHOLDS[3] - 1;
    bond.trustCapUntil = now + TRUST_CAP_DAYS * DAY_MINUTES;
  }
  if (effects.includes("openBoth") && state.rules?.multipleRelationships) {
    bond.open = {
      you: {
        ...(bond.open?.you ?? {}),
        "*": now,
      },
      them: {
        ...(bond.open?.them ?? {}),
        "*": now,
      },
    };
  }
  if (effects.includes("partnersWait")) {
    bond.milestoneRetry = {
      ...(bond.milestoneRetry ?? {}),
      partners: now + 21 * DAY_MINUTES,
    };
  }
  if (effects.includes("partnersHold")) {
    bond.partnersHold = now + PARTNERS_HOLD_DAYS * DAY_MINUTES;
  }
  if (effects.includes("care")) {
    state.needs = refillNeeds(state.needs, {
      hunger: 35,
      energy: 15,
      fitness: skillLevelsOf(state).fitness,
    });
  }
  if (effects.includes("xp") && scene.about?.skill) {
    addSkillXp(state.skills, {
      [scene.about.skill]: 3,
    });
  }
  if (effects.includes("putOffConfession") && bond.tierEventOwed?.romance === 2) {
    postponeTierEvent(bond, "romance", tierRetryAt(bond, now));
  }
  if (effects.includes("driftClear")) {
    bond.driftOwed = false;
    bond.lastSeen = now;
  }
  if (effects.includes("dating") && bond.status === "single" && !datingWhy(state, bond)) {
    bond.romance = Math.max(bond.romance, STATUS_STEPS.dating.romance);
    if ((bond.tierEventOwed?.romance ?? 3) <= 2) {
      settleTierEvent(bond, "romance");
    }
    setRelationshipStatus(bond, "dating", {
      at: now,
    });
    scene.seenBy = recordTownFact(state, "confess", {
      with: bond.characterId,
      place: state.at,
      witnesses: sawIt(state, bond.characterId),
    });
    learnedFact(state, scene.seenBy, state.facts.at(-1).id, "seen");
    recordTownFact(state, "dating", {
      with: bond.characterId,
      place: state.at,
    });
    events.push({
      id: "dating",
      characterId: bond.characterId,
      text: `You and ${character?.name ?? "them"} are dating now.`,
    });
  } else if (effects.includes("dating")) {
    stamp = null;
  }
  let noDream = false;
  if (scene.milestone === "the-dream-date") {
    let dream = parseDreamDate(input.dream, {
      tags: GIFT_TAGS ?? [],
    });
    if (dream) {
      bond.dreamDate = {
        ...dream,
        at: now,
        promised: choice === "promise",
      };
    }
    noDream = !dream;
  }
  let again = effects.includes("again") || MILESTONES[scene.milestone]?.again || noDream;
  bond.own = {
    ...(bond.own ?? {}),
    [scene.milestone]: again
      ? {
          again: now + SPECIAL_EVENT_REPEAT_DAYS * DAY_MINUTES,
          ...(effects.includes("again") || noDream
            ? {}
            : {
                done: now,
              }),
        }
      : {
          done: now,
        },
  };
  scene.outcome = {
    headline: outcome.headline,
    stamp: stamp,
  };
  return events;
}
function approaching(state) {
  if (
    (dropContestAway(state),
    (state.scene && !state.scene.done) ||
      state.approach ||
      state.visit ||
      state.outing ||
      (state.at !== "home" &&
        (isResidencePlace(state.at) ||
          isHallPlace(state.at) ||
          isStreetPlace(state.at) ||
          !isPlaceOpen(townPlace(state.town, state.at), state.minutes))))
  ) {
    return null;
  }
  for (let bond of Object.values(state.bonds)) {
    let ask = bond.asks;
    if (
      !ask ||
      dropGoneAsk(state, bond) ||
      ringsOnly(state, ask) ||
      mateMomentWaits(state, ask, characterOf(state, bond.characterId)) ||
      state.party?.guests?.[bond.characterId] ||
      state.guest?.characterId === bond.characterId ||
      partnersAway(state, ask) ||
      ((ask.due ??= approachDue(bond, ask.at ?? state.minutes)), state.minutes < ask.due)
    ) {
      continue;
    }
    let character = characterOf(state, bond.characterId);
    if (
      !character ||
      character.away ||
      isAsleep(state, character.id) ||
      moduleKeepsOut(state, state.at, character.id)
    ) {
      continue;
    }
    let opts = whereOpts(state),
      whereabouts2 = whereaboutsOf(character, state.minutes, opts);
    if (
      !whereabouts2.place ||
      whereabouts2.sleep ||
      whereabouts2.place === "office" ||
      whereabouts2.place === "hospital" ||
      whereabouts2.place === JOB_AWAY_PLACE ||
      isJobSpan(character, whereabouts2) ||
      workingHome(state, character, state.minutes, opts)
    ) {
      continue;
    }
    let atDoor = state.at === "home" && !sharesYourDoor(state, character);
    state.approach = {
      characterId: character.id,
      milestone: ask.id,
      at: state.minutes,
      place: state.at,
      ...(atDoor
        ? {
            door: true,
          }
        : {}),
    };
    if (!ask.mine && traitsOf(state, character.id).dials.initiative >= TRAIT_NOTABLE_BOUNDS.high) {
      markTraitsSeen(bond, "initiative");
    }
    return {
      id: "approach",
      characterId: character.id,
      milestone: ask.id,
      name: nameFor(state, character),
      door: atDoor,
    };
  }
  return null;
}

export { DAY_MINUTES, OWN_FIRST, approaching, ownAbout, ownDue, ownNow, ownOfTheDay, ownOpen, ownVerdict, settleOwn };
