// Running an outing: agenda of moments, talk, meals and bill, interrupts, goodbye, finish and view
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { charactersAtPlace, seededRandom } from "../schedule/whereabouts.mjs";
import { addSkillXp } from "../skills/skill-levels.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import {
  BOND_AXES,
  applyBondAction,
  bondSummary,
  bondTier,
  markTraitsSeen,
  recordNovelty,
} from "../relationships/bonds.mjs";
import { MILESTONES } from "../relationships/milestones.mjs";
import { nextMilestoneStepFor } from "../relationships/milestone-steps.mjs";
import { SCENE_READS } from "../scenes/scene-config.mjs";
import { CLOTHES_STYLES } from "../items/catalog.mjs";
import { cookDishIntoFridge, dishItemFor } from "../items/cooking.mjs";
import { isGiftable, itemDef } from "../items/inventory.mjs";
import { isPileSpoiled } from "../inventory/piles-and-cooking.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { personKnowsFact, recordTownFact } from "../network/town-facts.mjs";
import { OUTING_KINDS, OUTING_LATENESS, OUTING_LIMITS } from "./outing-rules.mjs";
import { DATE_TASTE_STAMPS, dateTastesFor, recordDateTasteFound } from "./date-tastes.mjs";
import { OUTING_PLACES, momentOptionsFor, outingPlaceHome } from "./outing-places.mjs";
import {
  BILL_PAY_CHOICES,
  COOK_QUALITY_MOOD,
  COOK_QUALITY_WORDS,
  OUTING_GOODBYE_OPTIONS,
  OUTING_LEAVE_MOOD,
  OUTING_START_MOOD,
  clampOutingMood,
  outingArrivalMood,
  outingBondGains,
  outingMoodBand,
  readMoodDelta,
  scoreOutingMomentChoice,
  settleOutingBill,
  skillRollChance,
} from "./outing-scoring.mjs";
import {
  GUEST_BIRTHDAY_MOMENTS,
  HONEYMOON_DAY_MINUTES,
  HONEYMOON_DESTINATIONS,
  OWN_BIRTHDAY_MOMENTS,
  WEDDING_OUTING,
  momentBlockedReason,
  planOutingMoments,
} from "./outing-schedule.mjs";
import { MEAL_PROPOSAL_KINDS, personalityProfileOf } from "./outing-prompts.mjs";
import { GIFT_RESULT_EFFECTS, giftTasteVerdict, recordGiftGiven } from "../gifts/gift-tastes.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { spendMoney } from "../money/wallet.mjs";
import { refillNeeds } from "../needs/needs.mjs";
import { minutesUntilPlaceCloses, townPlace } from "../town/town-layout.mjs";
import { addMemory } from "../people/people-sheet.mjs";
import { collectModuleHook, firstModuleHook, runModuleHook } from "../modules/module-registry.mjs";
import { passPlea, pleaLeftInOuting, pleaOpenIn } from "../money/pleas-and-loans.mjs";
import { richArrival } from "../social/rich-impressions.mjs";
import { rememberPair } from "../relationships/pair-memories.mjs";
import {
  activePlans,
  atPlanMeetingPlace,
  bestPresent,
  kindNameOf,
  outingStartBlocker,
  planPlaceName,
  timesAt,
} from "../plans/plans.mjs";
import { markSaid, partyPresents } from "../relationships/birthday-events.mjs";
import { markFriendTreatUsed, meetThroughFriend, priceWithFriendPerks } from "../relationships/friend-perks.mjs";
import { hasOwnHome } from "../home/residence.mjs";
import { furnitureLevel, homeHasFurniture, wearingItem } from "../home/furniture-and-wardrobe.mjs";
import {
  cookingHandOf,
  eatDish,
  packTheirDish,
  planCookFor,
  recipesAvailable,
  serveCookedDish,
  theirDish,
} from "../things/things-actions.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { knownName } from "../relationships/network-sheet.mjs";
import { hereView, hurtBond, isPartner, learnedFact } from "../romance/jealousy.mjs";
import {
  PARTNER_MOOD_LABEL,
  agreedPair,
  meetPair,
  otherPartnersOf,
  partnerMoodOf,
} from "../romance/multiple-partners.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { proposeWhy } from "../romance/proposal.mjs";
import {
  WEDDING_MINUTES,
  WEDDING_REQUIRED,
  incidentGuest,
  incidentWords,
  leftEarly,
  settleWedding,
  weddingIncident,
} from "../romance/wedding.mjs";
import { HONEYMOON_DAYS } from "../romance/wedding-morning.mjs";
import { nextTripDay, settleHoneymoon, tripResumes } from "../romance/honeymoon.mjs";
import { anniversaryKept } from "../romance/marriage-events.mjs";
import { milestoneCtx, milestoneWhyNot } from "../milestones/milestone-availability.mjs";
import { PICKUP_MOOD, goingBy, travelFor } from "../travel/vehicles-rides.mjs";
import { applyFree, freePlan } from "../scenes/free-talk.mjs";
import {
  advanceTime,
  bondOf,
  castBonds,
  castInTown,
  characterOf,
  handOverGift,
  hasMet2,
  keyImageFor,
  logNote,
  nameFor,
  pictureViews,
  rememberersOf,
  sharesYourDoor,
  skillLevelsOf,
  traitsOf,
  whereOpts,
} from "../game.mjs";

var outingSpecOf = (outing) => {
  let spec =
    outing.kind === "wedding"
      ? WEDDING_OUTING
      : outing.kind === "honeymoon"
        ? HONEYMOON_DESTINATIONS[outing.trip]
        : OUTING_PLACES[outing.place];
  return outing.birthday && spec
    ? {
        ...spec,
        moments: [
          ...(outing.birthday.of === "you" ? OWN_BIRTHDAY_MOMENTS : GUEST_BIRTHDAY_MOMENTS),
          ...spec.moments.filter(
            (moment) => !(moment.pay && (isTheirBirthdayOuting(outing) || isYourBirthdayTheyHost(outing))),
          ),
        ],
      }
    : spec;
};
var isTheirBirthdayOuting = (outing) => !!outing.birthday?.of && outing.birthday.of !== "you";
var isYourBirthdayTheyHost = (outing) => outing.birthday?.of === "you" && outing.by === "them";
var outingMomentById = (outing, momentId) =>
  outingSpecOf(outing)?.moments.find((moment) => moment.id === momentId) ?? null;
var outingOptionSeed = (state, outing) =>
  seededRandom(state.seed, outing.place, String(clockFromMinutes(outing.startedAt).dayIndex), "options");
function outingRunIn(state, outing) {
  if (
    outingPlaceHome(outing.place) ||
    !["date", "hang"].includes(outing.kind) ||
    (outing.kind === "hang" && bondTier(bondOf(state, outing.characterId), "romance") < 2)
  ) {
    return null;
  }
  let present = charactersAtPlace(
    castInTown(state).filter(
      (character) => character.id !== outing.characterId && !(outing.group ?? []).includes(character.id),
    ),
    outing.place,
    state.minutes,
    whereOpts(state),
  );
  for (let character of present) {
    let bond = bondOf(state, character.id);
    if (
      !(!bond || !hasMet2(state, character.id) || isAsleep(state, character.id)) &&
      !(bond.open?.you && (outing.characterId in bond.open.you || "*" in bond.open.you)) &&
      isPartner(state, character.id)
    ) {
      return {
        id: character.id,
        kind: "partner",
      };
    }
  }
  if (outing.kind !== "date") {
    return null;
  }
  for (let character of present) {
    let bond = bondOf(state, character.id);
    if (
      bond &&
      hasMet2(state, character.id) &&
      !bond.justFriends &&
      bond.romanceable !== false &&
      bondTier(bond, "romance") >= 2 &&
      !isPartner(state, character.id)
    ) {
      return {
        id: character.id,
        kind: "admirer",
      };
    }
  }
  return null;
}
function heardTheyAreTogether(state, characterId, otherId) {
  return (state.facts ?? []).some(
    (fact) =>
      ["dating", "partners", "living"].includes(fact.act) &&
      fact.with === otherId &&
      personKnowsFact(state, characterId, fact.id),
  );
}
function beginOuting(state, planId) {
  let plan = activePlans(state).find((candidate) => candidate.id === planId && candidate.status === "set");
  if (!plan) {
    return {
      ok: false,
      reason: "That plan is not on.",
    };
  }
  let blocker = outingStartBlocker(state, plan);
  if (blocker) {
    return {
      ok: false,
      reason: blocker,
    };
  }
  if (!atPlanMeetingPlace(state, plan)) {
    return {
      ok: false,
      reason: "You are not where you agreed to meet.",
    };
  }
  if (state.guest && outingPlaceHome(plan.place) === "yours") {
    state.guest = null;
  }
  let lateBy = state.minutes - plan.at;
  if (lateBy < 0) {
    return {
      ok: false,
      reason: `They come at ${formatClockTime(plan.at)}.`,
    };
  }
  if (lateBy > OUTING_LATENESS.leaves) {
    return {
      ok: false,
      reason: "They already left.",
    };
  }
  let character = characterOf(state, plan.characterId),
    bond = bondOf(state, plan.characterId),
    wearing = wearingItem(state)?.style ?? null,
    arrival = outingArrivalMood({
      place: plan.place,
      wearing: CLOTHES_STYLES.includes(wearing) ? wearing : null,
      clothes: character?.clothesTaste ?? null,
      late: lateBy,
    }),
    rich = richArrival(state, plan.characterId, {
      atYours: outingPlaceHome(plan.place) === "yours",
    });
  if (rich.mood || rich.words.length) {
    arrival.mood += rich.mood;
    arrival.words = [...(arrival.words ?? []), ...rich.words];
  }
  if (plan.pickedUp) {
    arrival.mood += PICKUP_MOOD;
    arrival.words = [
      ...(arrival.words ?? []),
      `The player picked them up ${goingBy(state) === "car" ? "by car" : "on a motorbike"}: they came together.`,
    ];
  }
  plan.status = "on";
  state.outing = {
    planId: plan.id,
    characterId: plan.characterId,
    kind: plan.kind,
    place: plan.place,
    by: plan.by,
    startedAt: state.minutes,
    late: lateBy,
    used: 0,
    mood: clampOutingMood(OUTING_START_MOOD + arrival.mood),
    phase: "arrive",
    arrive: {
      words: arrival.words,
      liked: arrival.liked,
      fits: arrival.fits,
    },
    done: [],
    moment: null,
    result: null,
    reads: [],
    log: [],
    batch: [],
    found: [],
    paid: false,
    spent: 0,
    covered: 0,
    interrupt: null,
    interrupted: false,
    leaving: false,
    dream: false,
    bye: null,
    summary: null,
    cast: [plan.characterId],
    ...(plan.birthday
      ? {
          birthday: {
            ...plan.birthday,
          },
        }
      : {}),
    ...(plan.friendOf
      ? {
          friendOf: true,
        }
      : {}),
    bondStart: (({ friendship: friendship, romance: romance, trust: trust } = {}) => ({
      friendship: friendship,
      romance: romance,
      trust: trust,
    }))(bondOf(state, plan.characterId) ?? {}),
  };
  let partnersOnly = !plan.birthday && !plan.friendOf,
    group = (plan.with ?? []).filter(
      (id) =>
        characterOf(state, id) &&
        !characterOf(state, id).away &&
        !isAsleep(state, id) &&
        (!partnersOnly || otherPartnersOf(state, plan.characterId).includes(id)),
    );
  if (group.length) {
    Object.assign(state.outing, {
      group: group,
      moods: Object.fromEntries(group.map((id) => [id, state.outing.mood])),
      cast: [plan.characterId, ...group],
    });
  }
  for (let id of group) {
    meetThroughFriend(state, id, plan.characterId);
  }
  if (
    (arrival.liked !== "fine" &&
      character?.clothesTaste &&
      recordDateTasteFound(bond, "clothes", wearing, arrival.liked),
    plan.kind === "date" && !outingPlaceHome(plan.place))
  ) {
    let seenBy = recordTownFact(state, "date", {
      with: plan.characterId,
      place: state.at,
      witnesses: sawIt(state, plan.characterId),
    });
    learnedFact(state, seenBy, state.facts.at(-1).id, "seen");
    state.outing.seenBy = seenBy;
  }
  planOuting(state);
  logNote(state, `Out with ${character?.name ?? "someone"}: ${OUTING_KINDS[plan.kind].name}`, "social");
  return {
    ok: true,
    outing: state.outing,
  };
}
function setOutingLines(state, lines, { phase = null } = {}) {
  let outing = state.outing;
  if (outing) {
    outing.batch = lines;
    outing.log.push(
      ...lines.map((line) => ({
        ...line,
      })),
    );
    if (outing.log.length > 60) {
      outing.log = outing.log.slice(-60);
    }
    if (phase) {
      outing.phase = phase;
    }
  }
}
function outingAmenities(state) {
  let things = state.things ?? {};
  return {
    food: (things.bag ?? []).some(
      (pile) => itemDef(things, pile.item)?.kind === "food" && itemDef(things, pile.item)?.eat && !isPileSpoiled(pile),
    ),
    kitchen: !!things.home?.kitchen,
    tv: !!things.home?.tv,
    ...Object.fromEntries(
      ["pool", "garden", "bar", "console", "gym"].map((furniture) => [furniture, homeHasFurniture(state, furniture)]),
    ),
    cinema: furnitureLevel(state, "tv") >= 2,
    cooks:
      !!state.outing &&
      cookingHandOf(state, state.outing.characterId) > 0 &&
      (outingPlaceHome(state.outing.place) !== "yours" ||
        !!theirDish(state, state.outing.characterId, {
          atYours: true,
        })),
    gift: (things.bag ?? []).some((pile) => isGiftable(things, pile)),
    cake: !!state.wedding?.details?.cake,
    photos: !!state.wedding?.details?.photos,
  };
}
function outingMinutesLeft(state, outing) {
  if (outing.kind === "wedding") {
    return Math.max(0, WEDDING_MINUTES - outing.used);
  }
  if (outing.kind === "honeymoon") {
    return HONEYMOON_DAY_MINUTES;
  }
  let spot = outingPlaceHome(outing.place) ? null : townPlace(state.town, outing.place),
    untilClose = spot ? minutesUntilPlaceCloses(spot, state.minutes) - OUTING_LIMITS.goodbye : 1 / 0;
  return Math.max(0, Math.min(OUTING_LIMITS.minutes - outing.used, untilClose));
}
function planOuting(state, { under = false } = {}) {
  let outing = state.outing;
  if (!outing) {
    return;
  }
  let spec = outingSpecOf(outing),
    ceremony = outing.kind === "wedding" || outing.kind === "honeymoon",
    ordered = outingFixedOrder(outing);
  if (
    ((outing.max = outing.kind === "honeymoon" ? HONEYMOON_DAYS * 3 : OUTING_LIMITS.exchanges),
    (outing.agenda = planOutingMoments(spec.moments, {
      kind: outing.kind,
      has: outingAmenities(state),
      hour: clockFromMinutes(state.minutes).hour,
      seed: outingOptionSeed(state, outing),
      exchanges: outing.max,
      ordered: ordered,
      fromStart: ceremony,
      budget: ceremony ? 1 / 0 : OUTING_LIMITS.minutes - outing.max * OUTING_LIMITS.talk,
    })),
    (outing.exchange = 0),
    (outing.suggestions = []),
    (outing.skipped = []),
    !under && !ceremony)
  ) {
    let distinct = new Set(
      outing.agenda.filter((entry) => !outingMomentById(outing, entry.id)?.pay).map((entry) => entry.id),
    ).size;
    outing.interruptAfter =
      1 +
      Math.floor(
        seededRandom(
          state.seed,
          outing.characterId,
          outing.place,
          String(clockFromMinutes(outing.startedAt ?? state.minutes).dayIndex),
          "walks-in",
        ) * Math.max(1, distinct),
      );
  }
}
var outingFixedOrder = (outing) =>
  outing.kind === "wedding" || outing.kind === "honeymoon"
    ? outingSpecOf(outing).moments.map((moment) => moment.id)
    : outing.birthday
      ? (outing.birthday.of === "you" ? OWN_BIRTHDAY_MOMENTS : GUEST_BIRTHDAY_MOMENTS).map((moment) => moment.id)
      : [];
var momentBlockedReason2 = (state, moment) => {
  let outing = state.outing;
  return momentBlockedReason(moment, {
    kind: outing.kind,
    done: outing.done,
    hour: clockFromMinutes(state.minutes).hour,
    left: momentMinutesLeft(state, outing, moment),
    has: outingAmenities(state),
    day: outing.tripDay ?? 1,
  });
};
var momentChoiceOf = (state, moment) => ({
  id: moment.id,
  name: momentName(state, moment),
});
function outingPlayable(state) {
  let outing = state.outing;
  if (!outing || !["date", "hang"].includes(outing.kind)) {
    return [];
  }
  let fixed = outingFixedOrder(outing),
    moments = (OUTING_PLACES[outing.place]?.moments ?? []).filter(
      (moment) => !moment.pay && !moment.meal && !moment.dish && !moment.words && !fixed.includes(moment.id),
    ),
    allowed = (moment) => !momentBlockedReason2(state, moment),
    neverAllowed = (moment) =>
      !!momentBlockedReason(moment, {
        kind: outing.kind,
        done: [],
        hour: clockFromMinutes(state.minutes).hour,
        left: 1 / 0,
        has: outingAmenities(state),
        day: outing.tripDay ?? 1,
      }),
    followsOk = (moment) => {
      let before = moment.follows ? moments.find((candidate) => candidate.id === moment.follows) : null;
      return !before || outing.done.includes(before.id) || neverAllowed(before);
    };
  return moments
    .filter((moment) => allowed(moment) && followsOk(moment))
    .map((moment) => momentChoiceOf(state, moment));
}
function nextMomentAlternatives(state, next) {
  let outing = state.outing;
  if (!next || !["date", "hang"].includes(outing.kind)) {
    return [];
  }
  let fixed = outingFixedOrder(outing),
    upcoming = (outing.agenda ?? [])
      .filter((entry) => !outing.done.includes(entry.id) && !(outing.skipped ?? []).includes(entry.id))
      .map((entry) => outingMomentById(outing, entry.id))
      .filter((moment) => moment && !moment.pay && !fixed.includes(moment.id)),
    open = upcoming.filter(
      (moment) => !momentBlockedReason2(state, moment) && !upcoming.some((other) => other.id === moment.follows),
    );
  return next.key && upcoming.reduce((sum, moment) => sum + (moment.minutes ?? 5), 0) > outingMinutesLeft(state, outing)
    ? []
    : open.length > 1 && open.includes(next)
      ? open.map((moment) => momentChoiceOf(state, moment))
      : [];
}
function swapNextOutingMoment(state, preview, momentId) {
  let outing = state.outing;
  if (!momentId || !(preview.choices ?? []).some((choice) => choice.id === momentId) || outingWindingDown(state)) {
    return;
  }
  let next = nextOutingMoment(state, {
    peek: true,
  });
  if (!next || next.id === momentId || !nextMomentAlternatives(state, next).some((choice) => choice.id === momentId)) {
    return;
  }
  let entryOf = (id) => outing.agenda.find((entry) => entry.id === id),
    [nextEntry, pickedEntry] = [entryOf(next.id), entryOf(momentId)];
  [nextEntry.id, pickedEntry.id] = [pickedEntry.id, nextEntry.id];
  let pending = (entry) => !outing.done.includes(entry.id) && !(outing.skipped ?? []).includes(entry.id);
  for (let pass = outing.agenda.length; pass > 0; pass--) {
    let misplaced = outing.agenda.find(
      (entry, index) =>
        pending(entry) &&
        outing.agenda.some(
          (later, laterIndex) =>
            laterIndex > index && pending(later) && later.id === outingMomentById(outing, entry.id)?.follows,
        ),
    );
    if (!misplaced) {
      break;
    }
    let before = outing.agenda.find((entry) => entry.id === outingMomentById(outing, misplaced.id).follows);
    [misplaced.id, before.id] = [before.id, misplaced.id];
  }
}
function pullMomentForward(state, preview, momentId) {
  let outing = state.outing;
  if (
    !momentId ||
    !(preview.playable ?? []).some((choice) => choice.id === momentId) ||
    outingWindingDown(state) ||
    !outingPlayable(state).some((choice) => choice.id === momentId)
  ) {
    return null;
  }
  let exchange = outing.exchange;
  for (let entry of outing.agenda ?? []) {
    if (!(entry.id === momentId || outing.done.includes(entry.id) || (outing.skipped ?? []).includes(entry.id))) {
      if (entry.at <= exchange) {
        entry.at = exchange + 1;
      }
      exchange = entry.at;
    }
  }
  return momentId;
}
function openOuting(state) {
  planOuting(state);
  settleOuting(state);
}
function nextOutingMoment(state, { peek = false } = {}) {
  let outing = state.outing;
  for (let entry of outing.agenda ?? []) {
    if (entry.at > outing.exchange || outing.done.includes(entry.id) || (outing.skipped ?? []).includes(entry.id)) {
      continue;
    }
    let moment = outingMomentById(outing, entry.id);
    if (
      !(moment
        ? momentBlockedReason(moment, {
            kind: outing.kind,
            done: outing.done,
            hour: clockFromMinutes(state.minutes).hour,
            left: momentMinutesLeft(state, outing, moment),
            has: outingAmenities(state),
            day: outing.tripDay ?? 1,
          })
        : "gone")
    ) {
      return moment;
    }
    if (!peek) {
      (outing.skipped ??= []).push(entry.id);
    }
  }
  return null;
}
function pendingBillMoment(state) {
  let outing = state.outing,
    entry = (outing.agenda ?? []).find(
      (candidate) => outingMomentById(outing, candidate.id)?.pay && !outing.done.includes(candidate.id),
    );
  return entry ? outingMomentById(outing, entry.id) : null;
}
var outingWindingDown = (state) => {
  let outing = state.outing;
  return ceremonyMomentsLeft(outing)
    ? false
    : !!(
        outing.ruined ||
        outing.leaving ||
        outing.closing ||
        outing.ending ||
        outing.exchange >= outing.max ||
        outingMinutesLeft(state, outing) < 5
      );
};
var ceremonyMomentsLeft = (outing) =>
  isWeddingOrHoneymoon(outing) &&
  (outing.agenda ?? []).some(
    (entry) =>
      (outing.kind !== "wedding" || WEDDING_REQUIRED.includes(entry.id)) &&
      !outing.done.includes(entry.id) &&
      !(outing.skipped ?? []).includes(entry.id),
  );
var isWeddingOrHoneymoon = (outing) => outing.kind === "wedding" || outing.kind === "honeymoon";
var momentMinutesLeft = (state, outing, moment) =>
  moment.pay || (isWeddingOrHoneymoon(outing) && (outing.kind !== "wedding" || WEDDING_REQUIRED.includes(moment.id)))
    ? 1 / 0
    : outingMinutesLeft(state, outing);
function settleOuting(state) {
  let outing = state.outing;
  if (!outing || outing.phase === "summary" || outing.phase === "interrupt") {
    return;
  }
  if (((outing.moment = null), outingWindingDown(state))) {
    let bill = outing.ruined ? null : pendingBillMoment(state);
    if (bill) {
      outing.moment = bill.id;
      outing.phase = "moment";
      outing.ending = true;
      return;
    }
    outing.phase = "goodbye";
    return;
  }
  let next = nextOutingMoment(state);
  if (next) {
    outing.moment = next.id;
    outing.phase = "moment";
    return;
  }
  outing.phase = "talk";
}
function outingNext(state, options = {}) {
  if (!state.outing) {
    return {
      lead: "",
      last: false,
    };
  }
  let { lead: lead, last: last, coming: coming } = previewOutingNext(state, options);
  return {
    lead: lead,
    last: last,
    coming: coming,
  };
}
function previewOutingNext(state, { talk = false, done = null } = {}) {
  let outing = state.outing,
    saved = {
      exchange: outing.exchange,
      done: outing.done,
      used: outing.used,
    },
    savedMinutes = state.minutes,
    spend = talk ? OUTING_LIMITS.talk : done ? (outingMomentById(outing, done)?.minutes ?? 0) : 0;
  outing.exchange += talk ? 1 : 0;
  outing.used = (outing.used ?? 0) + spend;
  state.minutes += spend;
  if (done) {
    outing.done = [...outing.done, done];
  }
  let windingDown = outingWindingDown(state),
    next = windingDown
      ? outing.ruined
        ? null
        : pendingBillMoment(state)
      : nextOutingMoment(state, {
          peek: true,
        }),
    coming = (outing.agenda ?? [])
      .filter((entry) => !outing.done.includes(entry.id) && !(outing.skipped ?? []).includes(entry.id))
      .map((entry) => outingMomentById(outing, entry.id)?.name)
      .filter(Boolean),
    choices = windingDown ? [] : nextMomentAlternatives(state, next),
    playable = windingDown || !talk || pleaOpenIn(state, "outing", outing.characterId) ? [] : outingPlayable(state);
  Object.assign(outing, saved);
  state.minutes = savedMinutes;
  return {
    lead: next ? `\xAB${next.name}\xBB` : "",
    last: windingDown && !next,
    coming: windingDown ? (next ? [next.name] : []) : coming,
    choices: choices,
    usual: choices.length ? next.id : "",
    playable: playable,
  };
}
function prepareTalk(state, { text = "" } = {}) {
  let outing = state.outing;
  if (!outing || outing.phase !== "talk") {
    return {
      ok: false,
      reason: "Not now.",
    };
  }
  if (!text) {
    return {
      ok: false,
      reason: "Say something.",
    };
  }
  let scene = outingSceneOf(state),
    free = freePlan(state, scene);
  if (free) {
    free.boss = null;
  }
  let preview = previewOutingNext(state, {
    talk: true,
  });
  preview.coming = [...new Set([...preview.coming, ...preview.playable.map((choice) => choice.name)])];
  return {
    ok: true,
    text: text,
    free: free,
    scene: scene,
    ...preview,
  };
}
function applyTalk(state, prepared, reply = {}) {
  let outing = state.outing,
    bond = bondOf(state, outing.characterId);
  outing.keyShown = null;
  let { events: events } = advanceTime(state, OUTING_LIMITS.talk);
  if (!state.outing || outing.phase === "summary") {
    outing.log.push({
      who: "you",
      text: prepared.text,
    });
    return {
      events: events,
    };
  }
  outing.used += OUTING_LIMITS.talk;
  outing.exchange += 1;
  let read = SCENE_READS.includes(reply.read) ? reply.read : reply.silent ? null : "awkward";
  if (read) {
    outing.reads.push(read);
  }
  let delta = read ? readMoodDelta(read, outing.kind, personalityProfileOf(bond)) : 0;
  outing.mood = clampOutingMood(outing.mood + delta);
  outing.log.push({
    who: "you",
    text: reply.you || prepared.text,
  });
  let chips = [];
  if (prepared.free && reply.did) {
    let freeResult = applyFree(state, prepared.free, reply.did, {}, prepared.scene);
    events.push(...freeResult.events);
    chips.push(...freeResult.tags);
    if (reply.did.give) {
      checkDreamDate(state, outing, itemDef(state.things, reply.did.give)?.tags ?? []);
    }
  }
  chips.push({
    text: `HOW IT'S GOING ${delta >= 0 ? "+" : ""}${delta}`,
    bad: delta < 0,
    mood: true,
  });
  outing.result = {
    chips: chips,
    moment: "",
    read: read,
  };
  outing.suggestions = reply.suggestions ?? [];
  if (reply.lines?.length) {
    setOutingLines(state, reply.lines);
  }
  if (outing.mood < OUTING_LEAVE_MOOD && !isWeddingOrHoneymoon(outing)) {
    outing.leaving = true;
  }
  if (
    !isWeddingOrHoneymoon(outing) &&
    (outingMinutesLeft(state, outing) < 5 || events.some((tick) => tick.id === "closed"))
  ) {
    outing.closing = true;
  }
  let meal = !outing.leaving && !outing.closing ? mealMoment(state, reply.meal) : null;
  if (meal) {
    outing.moment = meal;
    outing.phase = "moment";
    return {
      events: events,
      chips: chips,
    };
  }
  let pulled = pullMomentForward(state, prepared, reply.moment);
  return pulled
    ? ((outing.moment = pulled),
      (outing.phase = "moment"),
      {
        events: events,
        chips: chips,
      })
    : (swapNextOutingMoment(state, prepared, reply.next),
      settleOuting(state),
      {
        events: events,
        chips: chips,
      });
}
function mealMoment(state, proposal) {
  let outing = state.outing;
  if (!outing || !MEAL_PROPOSAL_KINDS.includes(proposal) || !outingPlaceHome(outing.place)) {
    return null;
  }
  let theyCook = cookingHandOf(state, outing.characterId) > 0,
    candidates =
      outingPlaceHome(outing.place) === "yours"
        ? proposal === "them"
          ? theyCook
            ? ["served"]
            : []
          : ["cook"]
        : proposal === "them"
          ? theyCook
            ? ["served"]
            : ["cook"]
          : ["cook"];
  if (["cook", "served"].some((momentId) => outing.done.includes(momentId))) {
    return null;
  }
  let amenities = {
      ...outingAmenities(state),
      ...(candidates[0] === "cook" && outingPlaceHome(outing.place) === "theirs"
        ? {
            cooks: false,
          }
        : {}),
    },
    pick =
      candidates.find((momentId) => {
        let moment = outingMomentById(outing, momentId);
        return (
          moment &&
          !momentBlockedReason(moment, {
            kind: outing.kind,
            done: outing.done,
            hour: clockFromMinutes(state.minutes).hour,
            left: outingMinutesLeft(state, outing),
            has: amenities,
            day: outing.tripDay ?? 1,
          })
        );
      }) ?? null;
  if (pick && outingPlaceHome(outing.place) === "yours") {
    outing.cookWith = proposal === "together";
  }
  return pick;
}
var mealOpen = (state) =>
  !!state.outing &&
  !!outingPlaceHome(state.outing.place) &&
  !["cook", "served"].some((momentId) => state.outing.done.includes(momentId));
function pickMoment(state, momentId) {
  let outing = state.outing;
  if (!outing || !["arrive", "talk", "moment"].includes(outing.phase)) {
    return {
      ok: false,
      reason: "Not now.",
    };
  }
  let moment = outingMomentById(outing, momentId);
  if (!moment) {
    return {
      ok: false,
      reason: "That is not something to do here.",
    };
  }
  let blocked = momentBlockedReason(moment, {
    kind: outing.kind,
    done: outing.done,
    hour: clockFromMinutes(state.minutes).hour,
    left: momentMinutesLeft(state, outing, moment),
    has: outingAmenities(state),
    day: outing.tripDay ?? 1,
  });
  return blocked
    ? {
        ok: false,
        reason: `${blocked}.`,
      }
    : ((outing.moment = momentId),
      (outing.phase = "moment"),
      {
        ok: true,
        events: [],
      });
}
function plansTodayNotice(state) {
  let today = clockFromMinutes(state.minutes).dayIndex,
    plans = (state.plans ?? []).filter((plan) => plan.status === "set" && Math.floor(plan.at / 1440) === today);
  return plans.length
    ? [
        {
          id: "plans-today",
          text: `Today: ${plans.map((plan) => `${OUTING_KINDS[plan.kind].name.toLowerCase()} with ${nameFor(state, characterOf(state, plan.characterId))} at ${formatClockTime(plan.at)}, ${planPlaceName(state, plan)}`).join("; ")}.`,
        },
      ]
    : [];
}
function outingDeal(state, outing) {
  let price = outingSpecOf(outing).price;
  return !price || outingPlaceHome(outing.place)
    ? {
        costs: price,
      }
    : priceWithFriendPerks(state, price, {
        place: outing.place,
        except: outing.characterId,
      });
}
function billPaymentOptions(
  outing,
  price,
  deal = {
    costs: price,
  },
) {
  if (deal.treat) {
    return [
      {
        id: "treat",
        label: `${deal.treat.name} treats you \xB7 on the house`,
        said: `Let ${deal.treat.name} treat you`,
      },
    ];
  }
  let each = deal.costs,
    total = each * 2,
    discountNote = deal.discount ? ` \xB7 \u2212${deal.discount.off}% ${deal.discount.name}` : "";
  return outing.by === "you"
    ? [
        {
          id: "you",
          label: `I've got it \xB7 $${total}${discountNote}`,
          said: "I've got it",
        },
        {
          id: "split",
          label: `Let's split it \xB7 $${each} each${discountNote}`,
          said: "Let's split it",
        },
        {
          id: "them",
          label: "Let them pay",
          said: "Let them pay",
        },
      ]
    : [
        {
          id: "them",
          label: "Let them get it",
          said: "Let them get it",
        },
        {
          id: "split",
          label: `Split it \xB7 $${each} each${discountNote}`,
          said: "Split it",
        },
        {
          id: "you",
          label: `Pay for both \xB7 $${total}${discountNote}`,
          said: "Pay for both",
        },
      ];
}
var mealOfTheHour = (state) => (clockFromMinutes(state.minutes).hour < 17 ? "lunch" : "dinner");
var momentName = (state, moment) =>
  mealOfTheHour(state) === "lunch"
    ? moment.name.replace(/dinner/i, (word) => (word[0] === "D" ? "Lunch" : "lunch"))
    : moment.name;
function momentOptions(state, outing, moment) {
  if (moment.pay) {
    return billPaymentOptions(outing, outingSpecOf(outing).price, outingDeal(state, outing));
  }
  if (moment.dish === "yours") {
    return canOrderInNow(state, outing)
      ? []
      : [
          {
            id: "order",
            label: `Order something in \xB7 $${ORDER_IN.perHead * (2 + (outing.group?.length ?? 0))}`,
          },
          {
            id: "skip",
            label: "Skip it and keep talking",
          },
        ];
  }
  let levels = skillLevelsOf(state);
  return momentOptionsFor(moment, outingOptionSeed(state, outing))
    .filter((option) => !option.only || option.only === outing.kind)
    .map((option) => ({
      id: option.id,
      label: moment.cost ? `${option.label} \xB7 $${moment.cost}` : option.label,
      roll: option.roll ?? null,
      chance: option.roll ? Math.round(skillRollChance(option.roll, levels[option.roll] ?? 0) * 100) : null,
    }));
}
function prepareMoment(state, { option = null, text = "" } = {}) {
  let outing = state.outing;
  if (!outing || outing.phase !== "moment" || !outing.moment) {
    return {
      ok: false,
      reason: "Not now.",
    };
  }
  let moment = outingMomentById(outing, outing.moment),
    bond = bondOf(state, outing.characterId),
    character = characterOf(state, outing.characterId),
    profile = personalityProfileOf(bond),
    words = [],
    landed = {
      mood: 0,
      words: [],
      found: null,
      won: null,
    },
    pay = null,
    gift = null,
    present = null,
    dish = null,
    chosen = null;
  if (text) {
    if (moment.pay) {
      return {
        ok: false,
        reason: "Pick how to pay.",
      };
    }
    if (moment.dish === "yours" && canOrderInNow(state, outing)) {
      return {
        ok: false,
        reason: "Pick what to cook.",
      };
    }
  } else if (moment.dish === "yours" && (option === "order" || option === "skip")) {
    if (canOrderInNow(state, outing)) {
      return {
        ok: false,
        reason: "Pick what to cook.",
      };
    }
    let orderCost = ORDER_IN.perHead * (2 + (outing.group?.length ?? 0));
    if (option === "order" && state.wallet.cash < orderCost) {
      return {
        ok: false,
        reason: `You need $${orderCost}.`,
      };
    }
    dish =
      option === "order"
        ? {
            order: orderCost,
          }
        : null;
    chosen = option === "order" ? "Order something in" : "Skip it";
    words.push(
      option === "order"
        ? "There is nothing to cook, so the player orders food in; it arrives and they eat it together, from the boxes."
        : `There is nothing to cook, and they skip ${mealOfTheHour(state)} and keep talking.`,
    );
  } else if (moment.dish === "yours") {
    let cookPlan = planCookFor(state, option, {
      minutesLeft: outingMinutesLeft(state, outing),
    });
    if (!cookPlan.ok) {
      return {
        ok: false,
        reason: cookPlan.reason,
      };
    }
    dish = {
      mine: true,
      recipe: cookPlan.recipe,
      quality: cookPlan.quality,
      take: cookPlan.take,
      eaters: 1 + (outing.group?.length ?? 0),
      with: !!outing.cookWith,
    };
    chosen = `Cook ${cookPlan.recipe.name.toLowerCase()}`;
    landed = scoreOutingMomentChoice({
      moment: {
        taste: "food",
      },
      option: {
        value: cookPlan.recipe.taste,
      },
      kind: outing.kind,
      profile: profile,
      tastes: dateTastesFor(character, bond.archetype),
      levels: skillLevelsOf(state),
    });
    landed.mood += COOK_QUALITY_MOOD[cookPlan.quality];
    let eaters = 1 + (outing.group?.length ?? 0);
    words.push(
      `The player ${outing.cookWith ? `and ${character.name} cook ${cookPlan.recipe.name.toLowerCase()} together` : `cooks ${cookPlan.recipe.name.toLowerCase()} for ${character.name}${eaters > 1 ? " and the others" : ""}`} (it takes ${cookPlan.recipe.minutes} minutes), and ${cookPlan.recipe.portions >= eaters + 1 ? "they eat it together" : `there is only enough for ${eaters > 1 ? "the guests" : character.name}`}. ${COOK_QUALITY_WORDS[cookPlan.quality]}`,
      "The lines start from the player bringing it to the table, just done, and go on to the first bites: it was not on the table before.",
    );
  } else if (moment.pay) {
    let deal = outingDeal(state, outing);
    if (deal.treat) {
      if (option !== "treat") {
        return {
          ok: false,
          reason: "Pick how to pay.",
        };
      }
      pay = {
        total: 0,
        you: 0,
        them: 0,
        short: false,
        mood: 0,
        trust: 0,
        treat: deal.treat,
      };
      chosen = billPaymentOptions(outing, outingSpecOf(outing).price, deal)[0].said;
      words.push(`${deal.treat.name}, who works here, treats them both: it is on the house.`);
    } else {
      if (!BILL_PAY_CHOICES.includes(option)) {
        return {
          ok: false,
          reason: "Pick how to pay.",
        };
      }
      pay = {
        ...settleOutingBill({
          price: deal.costs,
          by: outing.by,
          choice: option,
          cash: state.wallet.cash,
          kind: outing.kind,
          style: TRAIT_BEHAVIOURS.payStyle(traitsOf(state, outing.characterId)),
        }),
        discount: deal.discount ?? null,
      };
      markTraitsSeen(
        bond,
        ...["proud", "practical"].filter((flag) => traitsOf(state, outing.characterId).flags.includes(flag)),
      );
      chosen = billPaymentOptions(outing, outingSpecOf(outing).price, deal).find((choice) => choice.id === option).said;
      words.push(
        pay.short
          ? `The player cannot cover it: they pay $${pay.you} and ${character.name} covers the rest ($${pay.them}).`
          : pay.you === 0
            ? `${character.name} pays ($${pay.them}).`
            : pay.them === 0
              ? `The player pays for both ($${pay.you}).`
              : `They split it ($${pay.you} each).`,
      );
    }
    landed = {
      mood: pay.mood,
      words: [],
      found: null,
      won: null,
    };
  } else {
    let choice = momentOptionsFor(moment, outingOptionSeed(state, outing)).find(
      (candidate) => candidate.id === option && (!candidate.only || candidate.only === outing.kind),
    );
    if (!choice) {
      return {
        ok: false,
        reason: "That is not one of the options.",
      };
    }
    if (((chosen = choice.label), moment.taste === "gift")) {
      if (state.wallet.cash < (moment.cost ?? 0)) {
        return {
          ok: false,
          reason: `You need $${moment.cost}.`,
        };
      }
      gift = {
        tag: choice.value,
        result: giftTasteVerdict(character?.tastes, [choice.value]),
      };
    }
    if (moment.present) {
      let best = bestPresent(state, character);
      if (!best) {
        return {
          ok: false,
          reason: "No present in your backpack.",
        };
      }
      present = best;
      words.push(`The player gives ${character.name} a birthday present: ${best.name}.`);
    }
    if (
      ((landed = scoreOutingMomentChoice({
        moment: moment,
        option: choice,
        kind: outing.kind,
        profile: profile,
        tastes: dateTastesFor(character, bond.archetype),
        clothes: character?.clothesTaste ?? null,
        giftResult: gift?.result ?? null,
        levels: skillLevelsOf(state),
        roll: seededRandom(state.seed, outing.characterId, String(outing.startedAt), moment.id, choice.id),
      })),
      moment.meal && moment.taste === "food" && outingPlaceHome(outing.place) === "theirs")
    ) {
      let cooked = theirDish(state, outing.characterId, {
        likes: choice.value,
        salt: String(outing.startedAt),
      });
      dish = {
        mine: false,
        together: true,
        recipe: cooked.recipe,
        quality: cooked.quality,
        learn: true,
      };
      words.push(
        `They cook ${cooked.recipe.name.toLowerCase()} together in ${character.name}'s kitchen and eat it. ${COOK_QUALITY_WORDS[cooked.quality]}`,
      );
    }
    if (
      (moment.id === "movie" &&
        outingPlaceHome(outing.place) === "yours" &&
        outingAmenities(state).cinema &&
        ((landed.mood += 3),
        words.push("They watch it on the player's home cinema: a big screen, real sound, the lights down.")),
      moment.dish === "theirs")
    ) {
      let cooked = theirCookingFor(state, outing);
      if (!cooked) {
        return {
          ok: false,
          reason: "Nothing in your kitchen to cook with.",
        };
      }
      dish = {
        mine: false,
        recipe: cooked.recipe,
        quality: cooked.quality,
        learn: !!choice.learn,
        take: cooked.take ?? null,
        atYours: outingPlaceHome(outing.place) === "yours",
      };
      words.unshift(
        `${character.name} has cooked ${cooked.recipe.name.toLowerCase()} for the player (${cooked.recipe.taste}), and they eat it together. ${COOK_QUALITY_WORDS[cooked.quality]} The lines start from ${character.name} bringing it to the table, just done (it was still cooking until now), and go on to the first bites.`,
      );
    }
  }
  let scene = text ? outingSceneOf(state) : null,
    free = text ? freePlan(state, scene) : null;
  if ((free && (free.boss = null), outing.kind === "wedding" && moment.id === "morning")) {
    let bestName = outing.best ? characterOf(state, outing.best)?.name : null,
      atHome = hasOwnHome(state) ? " at home" : "";
    words.push(
      bestName
        ? `This morning ${character.name} is getting ready somewhere else. The player gets ready${atHome} with ${bestName} (id ${outing.best}), their closest friend at the wedding: the nerves, and a last word before the ceremony. ${bestName} speaks here, with that id in \`who\`; ${character.name} is not here yet.`
        : `This morning ${character.name} is getting ready somewhere else; the player gets ready alone${atHome}, with the nerves. ${character.name} is not here yet: narration only.`,
    );
  }
  return {
    ok: true,
    moment: moment,
    option: option,
    chosen: chosen,
    text: text,
    pay: pay,
    gift: gift,
    present: present,
    dish: dish,
    landed: landed,
    words: [...words, ...landed.words],
    free: free,
    scene: scene,
    ...previewOutingNext(state, {
      done: moment.id,
    }),
  };
}
function applyMealOutcome(state, dish, character) {
  let chips = [],
    qualityWord = {
      burnt: "A LITTLE BURNT",
      fine: "",
      great: "DELICIOUS",
    }[dish.quality];
  if (dish.order) {
    spendMoney(state.wallet, dish.order, "Food ordered in", state.minutes);
    state.needs = refillNeeds(state.needs, {
      hunger: ORDER_IN.hunger,
      fitness: skillLevelsOf(state).fitness,
    });
    chips.push({
      text: `\u{1F961} ORDERED IN \xB7 $${dish.order}`,
    });
    return chips;
  }
  if (dish.mine) {
    let served = serveCookedDish(state, dish.recipe, dish.quality, {
      eaters: dish.eaters ?? 1,
    });
    chips.push({
      text: `\u{1F373} ${dish.recipe.name.toUpperCase()}${qualityWord ? ` \xB7 ${qualityWord}` : ""}`,
      bad: dish.quality === "burnt",
      found: dish.quality === "great",
    });
    if (served.kept) {
      chips.push({
        text: `${served.kept} ${served.kept === 1 ? "PORTION" : "PORTIONS"} LEFT \xB7 IN YOUR FRIDGE`,
      });
    }
    for (let level of served.levelled ?? []) {
      chips.push({
        text: `COOKING ${level.to}!`,
        found: true,
      });
    }
    return chips;
  }
  let dishItem = dishItemFor(dish.recipe, dish.quality);
  if (
    (dish.take?.(),
    eatDish(state, dishItem),
    chips.push({
      text: `\u{1F37D} ${(character?.name ?? "They").toUpperCase()}'S ${dish.recipe.name.toUpperCase()}${qualityWord ? ` \xB7 ${qualityWord}` : ""}`,
      bad: dish.quality === "burnt",
      found: dish.quality === "great",
    }),
    dish.learn)
  ) {
    let levels = addSkillXp(state.skills, {
      cooking: COOKING_GAIN,
    });
    chips.push(
      {
        text: `COOKING +${COOKING_GAIN}`,
        found: true,
      },
      ...levels.map((level) => ({
        text: `COOKING ${level.to}!`,
        found: true,
      })),
    );
  }
  if (dish.atYours) {
    if (dish.recipe.portions > 2) {
      cookDishIntoFridge(state.things, dish.recipe, dish.quality, dish.recipe.portions - 2);
      chips.push({
        text: `${dish.recipe.portions - 2} LEFT \xB7 IN YOUR FRIDGE`,
      });
    }
  } else if (
    dish.recipe.portions > 2 &&
    dish.quality !== "burnt" &&
    seededRandom(state.seed, "take-home", character?.id ?? "", String(state.minutes)) < 0.5 &&
    packTheirDish(state, dish.recipe, dish.quality)
  ) {
    chips.push({
      text: "\u{1F961} THEY PACK YOU SOME \xB7 IN YOUR BACKPACK",
      found: true,
    });
  }
  return chips;
}
function theirCookingFor(state, outing) {
  let food = dateTastesFor(characterOf(state, outing.characterId), bondOf(state, outing.characterId)?.archetype).food;
  return theirDish(state, outing.characterId, {
    likes: food?.likes,
    dislikes: food?.dislikes,
    salt: String(outing.startedAt),
    atYours: outingPlaceHome(outing.place) === "yours",
  });
}
var canOrderInNow = (state, outing) =>
  recipesAvailable(state, true).some(
    (recipe) => recipe.available && recipe.minutes <= outingMinutesLeft(state, outing),
  );
var ORDER_IN = {
  perHead: 15,
  hunger: 45,
};
function mealContextFor(state, outing) {
  let found = Object.entries(bondOf(state, outing.characterId)?.dateFound?.food ?? {});
  return {
    left: outingMinutesLeft(state, outing),
    meal: clockFromMinutes(state.minutes).hour < 17 ? "lunch" : "dinner",
    likes: found.filter(([, tag]) => tag === "liked").map(([tag]) => tag),
    dislikes: found.filter(([, tag]) => tag === "disliked").map(([tag]) => tag),
  };
}
var COOKING_GAIN = 4;
function outingSceneOf(state) {
  let outing = state.outing;
  return {
    characterId: outing.characterId,
    cast: [...(outing.cast ?? [outing.characterId])],
    reads: outing.reads,
    event: "outing",
    beats: [
      {
        type: "turns",
        min: 1,
        max: 4,
      },
    ],
    beat: 0,
    exchange: outing.exchange ?? 0,
    log: outing.log,
    done: false,
  };
}
function applyMoment(state, prepared, reply = {}) {
  let outing = state.outing,
    bond = bondOf(state, outing.characterId),
    character = characterOf(state, outing.characterId),
    moment = prepared.moment,
    minutes = prepared.dish?.mine ? prepared.dish.recipe.minutes : (moment.minutes ?? 5);
  outing.keyShown = null;
  let { events: events } = advanceTime(state, minutes);
  if (!state.outing || outing.phase === "summary") {
    outing.log.push(
      prepared.text
        ? {
            who: "you",
            text: prepared.text,
          }
        : {
            who: "you",
            text: prepared.chosen,
            fixed: true,
          },
    );
    return {
      events: events,
    };
  }
  if (prepared.dish?.mine) {
    prepared.dish.take();
  }
  outing.used += minutes;
  let mood = prepared.landed.mood,
    chips = [],
    read = null;
  if (prepared.text) {
    if (
      ((read = SCENE_READS.includes(reply.read) ? reply.read : reply.silent ? null : "awkward"),
      read && outing.reads.push(read),
      read && (mood += readMoodDelta(read, outing.kind, personalityProfileOf(bond))),
      outing.log.push({
        who: "you",
        text: prepared.text,
      }),
      prepared.free && reply.did)
    ) {
      let scene = prepared.scene,
        freeResult = applyFree(state, prepared.free, reply.did, {}, scene);
      events.push(...freeResult.events);
      for (let tag of freeResult.tags) {
        chips.push(tag);
      }
      if (reply.did.give) {
        checkDreamDate(state, outing, itemDef(state.things, reply.did.give)?.tags ?? []);
      }
    }
  } else {
    if (
      (outing.log.push({
        who: "you",
        text: prepared.chosen,
        fixed: true,
      }),
      prepared.landed.found &&
        (recordDateTasteFound(
          bond,
          prepared.landed.found.kind,
          prepared.landed.found.value,
          prepared.landed.found.verdict,
        ),
        prepared.landed.found.verdict !== "fine"))
    ) {
      let found = prepared.landed.found,
        stamp = found.kind === "clothes" ? "CLOTHES" : DATE_TASTE_STAMPS[found.kind];
      outing.found.push({
        kind: found.kind,
        value: found.value,
        verdict: found.verdict,
      });
      chips.push({
        text: `${found.verdict === "liked" ? "LIKES" : "DOESN'T LIKE"} ${found.value.toUpperCase()} \xB7 ${stamp}`,
        bad: found.verdict === "disliked",
        found: true,
      });
    }
    if (
      (prepared.landed.won !== null &&
        chips.push({
          text: prepared.landed.won ? "IT WORKS" : "IT DOESN'T COME OFF",
          bad: !prepared.landed.won,
        }),
      prepared.pay &&
        (prepared.pay.you &&
          spendMoney(
            state.wallet,
            prepared.pay.you,
            `${OUTING_KINDS[outing.kind].name} at ${planPlaceName(state, outing)}`,
            state.minutes,
          ),
        (outing.spent += prepared.pay.you),
        (outing.covered += prepared.pay.them),
        (outing.paid = true),
        prepared.pay.trust &&
          hurtBond(bond, {
            trust: prepared.pay.trust,
          }),
        prepared.pay.treat &&
          markFriendTreatUsed(state, {
            treat: prepared.pay.treat,
          }),
        chips.push({
          text: prepared.pay.treat
            ? `${prepared.pay.treat.name.toUpperCase()} TREATS YOU`
            : prepared.pay.short
              ? `SHORT OF MONEY \xB7 THEY COVER $${prepared.pay.them}`
              : prepared.pay.you
                ? `PAID $${prepared.pay.you}`
                : `THEY PAY $${prepared.pay.them}`,
          bad: prepared.pay.short,
        }),
        prepared.pay.discount &&
          chips.push({
            text: `\u2212${prepared.pay.discount.off}% \xB7 ${prepared.pay.discount.name.toUpperCase()} WORKS HERE`,
            found: true,
          })),
      moment.presents)
    ) {
      for (let present of partyPresents(state, [outing.characterId, ...(outing.group ?? [])])) {
        chips.push({
          text: `\u{1F381} FROM ${present.who.toUpperCase()} \xB7 ${present.item.name.toUpperCase()}${present.item.home ? " \xB7 ON YOUR SHELF" : ""}`,
          found: true,
        });
      }
    }
    if (prepared.present) {
      let handed = handOverGift(state, bond, character, prepared.present.index);
      if (handed) {
        chips.push(
          {
            text: `\u{1F381} ${handed.item.name.toUpperCase()} \xB7 ${handed.worth.stamp}`,
            bad: !handed.worth.good,
          },
          ...(handed.birthday
            ? [
                {
                  text: "\xD72 \xB7 THEIR BIRTHDAY",
                  found: true,
                },
              ]
            : []),
        );
      }
    }
    if (prepared.gift) {
      spendMoney(state.wallet, moment.cost ?? 0, `A gift for ${character.name}`, state.minutes);
      outing.spent += moment.cost ?? 0;
      let effects = GIFT_RESULT_EFFECTS[prepared.gift.result];
      applyBondAction(
        bond,
        {
          action: "gift",
          friendship: effects.friendship,
          ...(effects.romance && outing.kind === "date"
            ? {
                romance: effects.romance,
              }
            : {}),
        },
        {
          at: state.minutes,
          charm: skillLevelsOf(state).charm,
          today: false,
          note: "a gift on an outing",
        },
      );
      recordGiftGiven(bond, {
        at: state.minutes,
        item: `outing-${prepared.gift.tag}`,
        name: prepared.chosen,
        icon: "\u{1F381}",
        tag: prepared.gift.tag,
        result: prepared.gift.result,
      });
      chips.push({
        text: effects.stamp,
        bad: !effects.good,
      });
      checkDreamDate(state, outing, [prepared.gift.tag]);
    }
  }
  if (
    (moment.taste === "food" &&
      moment.meal &&
      !prepared.dish &&
      (state.needs = refillNeeds(state.needs, {
        hunger: 25,
        fitness: skillLevelsOf(state).fitness,
      })),
    prepared.dish && chips.push(...applyMealOutcome(state, prepared.dish, character)),
    (outing.mood = clampOutingMood(outing.mood + mood)),
    chips.push({
      text: `HOW IT'S GOING ${mood >= 0 ? "+" : ""}${mood}`,
      bad: mood < 0,
      mood: true,
    }),
    outing.group?.length && shiftGroupMoods(state, outing, mood, chips),
    outing.done.push(moment.id),
    (outing.moment = null),
    (outing.result = {
      chips: chips,
      moment: momentName(state, moment),
      read: read,
      ...(prepared.dish?.mine
        ? {
            dish: {
              name: prepared.dish.recipe.name,
              icon: prepared.dish.recipe.icon,
              quality: prepared.dish.quality,
            },
          }
        : {}),
    }),
    (outing.suggestions = reply.suggestions ?? []),
    reply.lines?.length && setOutingLines(state, reply.lines),
    outing.mood < OUTING_LEAVE_MOOD && !isWeddingOrHoneymoon(outing) && (outing.leaving = true),
    !isWeddingOrHoneymoon(outing) &&
      (outingMinutesLeft(state, outing) < 5 || events.some((tick) => tick.id === "closed")) &&
      (outing.closing = true),
    outing.kind === "honeymoon")
  ) {
    let nightOptions = firstModuleHook(state, "tripNight", outing);
    if (nightOptions?.length) {
      outing.night = {
        day: outing.tripDay,
        options: nightOptions,
      };
    } else {
      events.push(...nextTripDay(state));
    }
  }
  if ((swapNextOutingMoment(state, prepared, reply.next), outing.kind === "wedding")) {
    if ((moment.id === "morning" && (state.at = outing.place), !outing.interrupted && outing.done.includes("toast"))) {
      let guestId = incidentGuest(state, outing);
      if (guestId) {
        outing.interrupt = {
          id: guestId,
          kind: "guest",
          knew: true,
          lines: [],
          phase: "lines",
        };
      }
      outing.interrupted = true;
    }
  } else if (
    !outing.interrupted &&
    !outingWindingDown(state) &&
    outing.done.filter((momentId) => !outingMomentById(outing, momentId)?.pay).length >= (outing.interruptAfter ?? 1)
  ) {
    let runIn = outingRunIn(state, outing);
    if (runIn) {
      outing.interrupt = {
        ...runIn,
        knew: runIn.kind === "partner" ? heardTheyAreTogether(state, outing.characterId, runIn.id) : true,
        lines: [],
        phase: "lines",
      };
      outing.interrupted = true;
    }
  }
  addSkillXp(state.skills, {
    charm: 1,
  });
  if (outing.interrupt?.phase !== "lines") {
    settleOuting(state);
  }
  return {
    events: events,
    chips: chips,
  };
}
function shiftGroupMoods(state, outing, delta, chips) {
  let everyone = [outing.characterId, ...outing.group],
    upperName = (id) =>
      nameFor(
        state,
        characterOf(state, id) ?? {
          id: id,
          name: "?",
        },
      ).toUpperCase(),
    moodShift = {
      good: 1,
      love: 2,
      tense: -2,
      rivals: -4,
    };
  for (let memberId of outing.group) {
    let memberDelta =
      delta +
      everyone
        .filter((value) => value !== memberId)
        .reduce((value, otherId) => value + (moodShift[partnerMoodOf(state, memberId, otherId)] ?? 0), 0);
    outing.moods[memberId] = clampOutingMood((outing.moods[memberId] ?? OUTING_START_MOOD) + memberDelta);
    chips.push({
      text: `${upperName(memberId)} ${memberDelta >= 0 ? "+" : ""}${memberDelta}`,
      bad: memberDelta < 0,
      mood: true,
    });
  }
  for (let i = 0; i < everyone.length; i++) {
    for (let j = i + 1; j < everyone.length; j++) {
      let [idA, idB] = [everyone[i], everyone[j]];
      if (!agreedPair(state, idA, idB)) {
        continue;
      }
      let before = partnerMoodOf(state, idA, idB),
        after = before;
      if (before === "unmet") {
        after = meetPair(state, idA, idB, {
          how: "flow",
          place: outing.place,
          seed: "outing",
        });
      } else if (before !== "love") {
        let pair = npcPairBetween(state, idA, idB),
          tension = pair.yours.tension ?? 0;
        pair.yours.tension =
          before === "good" || before === "none"
            ? Math.max(0, tension - 3)
            : Math.min(100, tension + (delta < 0 ? 4 : 1));
        after = partnerMoodOf(state, idA, idB);
      }
      if (after !== before) {
        chips.push({
          text: `${upperName(idA)} & ${upperName(idB)} \xB7 ${PARTNER_MOOD_LABEL[after]}`,
          found: true,
          bad: after === "tense" || after === "rivals",
        });
      }
    }
  }
}
function checkDreamDate(state, outing, tags) {
  let dream = bondOf(state, outing.characterId)?.dreamDate;
  if (!dream || dream.done || outing.kind !== "date" || !tags.includes(dream.gift) || dream.place !== outing.place) {
    return;
  }
  let slot = clockFromMinutes(state.minutes).slot;
  if (
    dream.time === slot ||
    (dream.time === "night" && slot === "evening") ||
    (dream.time === "evening" && slot === "night")
  ) {
    outing.dream = true;
  }
}
function outingKeyImage(state, { picture: picture, label: label }) {
  let outing = state.outing;
  if (!outing || outing.summary?.fainted) {
    return null;
  }
  let scene = {
      event: outing.kind,
      characterId: outing.characterId,
      cast: [outing.characterId],
      pictures: [],
    },
    image = keyImageFor(state, scene, {
      beat: "moment",
      picture: picture,
      label: label,
      place: outing.kind === "honeymoon" ? planPlaceName(state, outing) : null,
    });
  if (image) {
    outing.pictures = [...(outing.pictures ?? []), image];
    outing.keyShown = image;
  }
  return image;
}
function interruptWords(state) {
  let outing = state.outing,
    interrupt = outing?.interrupt;
  if (!interrupt) {
    return null;
  }
  let other = characterOf(state, interrupt.id),
    date = characterOf(state, outing.characterId);
  if (interrupt.kind === "guest") {
    return {
      other: other,
      date: date,
      words: incidentWords(state, outing, interrupt.id),
    };
  }
  let words =
    interrupt.kind === "partner" && outing.kind === "hang"
      ? [
          `${other.name} is the player's partner and sees the player out with ${date.name}, who has feelings for the player. It is only a hang out, but it stings, true to who they are.`,
          interrupt.knew
            ? `${date.name} knew the player had a partner.`
            : `${date.name} did not know the player had a partner.`,
        ]
      : interrupt.kind === "partner"
        ? [
            `${other.name} is the player's partner, with no agreement to see anyone else: seeing the player on a date with ${date.name} is cheating, and they are hurt and angry.`,
            interrupt.knew
              ? `${date.name} knew the player had a partner.`
              : `${date.name} did not know the player had a partner: it is a shock.`,
          ]
        : [
            `${other.name} has feelings for the player and did not know about ${date.name}: they are hurt, and keep it short.`,
            `${date.name} notices something is off.`,
          ];
  return {
    other: other,
    date: date,
    words: words,
  };
}
function setInterruptLines(state, lines) {
  let interrupt = state.outing?.interrupt;
  if (interrupt) {
    interrupt.lines = lines;
    interrupt.phase = interrupt.kind === "partner" || interrupt.kind === "guest" ? "call" : "done";
    state.outing.cast = [...new Set([...(state.outing.cast ?? []), interrupt.id])];
    state.outing.log.push(
      ...lines.map((line) => ({
        who: line.who === state.outing.characterId ? "them" : "narration",
        text: line.who === interrupt.id ? `${characterOf(state, interrupt.id)?.name}: ${line.text}` : line.text,
      })),
    );
    state.outing.phase = "interrupt";
    if (interrupt.phase === "done") {
      state.outing.batch = [...(state.outing.batch ?? []), ...lines];
      state.outing.phase = "talk";
      settleOuting(state);
    }
  }
}
var INTERRUPT_CHOICES = ["go", "stay", "lie"];
var HANG_WEIGHT = 0.4;
function interruptChoice(state, choice) {
  let outing = state.outing,
    interrupt = outing?.interrupt;
  if (interrupt?.kind === "guest") {
    return weddingIncident(state, choice);
  }
  if (!interrupt || interrupt.kind !== "partner" || interrupt.phase !== "call" || !INTERRUPT_CHOICES.includes(choice)) {
    return {
      ok: false,
      reason: "There is no call to make.",
    };
  }
  let bond = bondOf(state, outing.characterId),
    otherBond = bondOf(state, interrupt.id);
  interrupt.choice = choice;
  interrupt.phase = "done";
  let words = [],
    traits = traitsOf(state, outing.characterId),
    weight = outing.kind === "hang" ? HANG_WEIGHT : 1,
    shrug = TRAIT_BEHAVIOURS.shrugs(traits) ? 0.5 : 1,
    dateName = characterOf(state, outing.characterId)?.name ?? "They";
  if (choice === "go") {
    hurtBond(bond, {
      romance: -6 * weight,
      trust: (interrupt.knew ? -4 : -12) * weight,
    });
    if (otherBond?.asks) {
      otherBond.asks.due = state.minutes;
    }
    outing.ruined = true;
    outing.phase = "goodbye";
    words.push(
      `The player leaves ${characterOf(state, outing.characterId)?.name} there and goes after ${characterOf(state, interrupt.id)?.name}.`,
    );
    return {
      ok: true,
      ends: true,
      words: words,
    };
  }
  let chips = [];
  if (choice === "stay") {
    if (!interrupt.knew) {
      hurtBond(bond, {
        trust: -8 * weight,
        ...(TRAIT_BEHAVIOURS.endsItThere(traits) && weight === 1
          ? {
              romance: -6,
            }
          : {}),
      });
    }
    outing.mood = clampOutingMood(outing.mood - (interrupt.knew ? 15 : 35) * weight * shrug);
    let walksOut = !interrupt.knew && weight === 1 && TRAIT_BEHAVIOURS.leavesOnShock(traits);
    if (walksOut) {
      outing.leaving = true;
      chips.push({
        text: `${dateName.toUpperCase()} WANTS TO GO`,
        bad: true,
      });
    }
    words.push(
      `${characterOf(state, interrupt.id)?.name} leaves. The player stays.`,
      interrupt.knew
        ? "It still hangs over them."
        : walksOut
          ? `They just found out the player has a partner: it is a shock, and ${dateName} is not staying.`
          : "They just found out the player has a partner: it is a shock.",
    );
  } else {
    if (!interrupt.knew) {
      hurtBond(bond, {
        trust: -5 * weight,
      });
    }
    outing.mood = clampOutingMood(outing.mood - 10 * weight * shrug);
    let dateFact = (state.facts ?? []).filter((fact) => fact.act === "date" && fact.with === outing.characterId).at(-1);
    if (otherBond) {
      otherBond.lies = [
        ...(otherBond.lies ?? []),
        {
          fact: dateFact?.id ?? null,
          at: state.minutes,
        },
      ].slice(-20);
    }
    let togetherFact = (state.facts ?? [])
      .filter(
        (fact) =>
          ["dating", "partners", "living", "engaged", "married"].includes(fact.act) && fact.with === interrupt.id,
      )
      .at(-1);
    if (togetherFact && !interrupt.knew) {
      bond.lies = [
        ...(bond.lies ?? []),
        {
          fact: togetherFact.id,
          at: state.minutes,
        },
      ].slice(-20);
    }
    words.push(
      `The player says it is not what it looks like: a lie, to both of them. ${characterOf(state, interrupt.id)?.name} leaves.`,
      "They do not believe it.",
    );
  }
  if (outing.mood < OUTING_LEAVE_MOOD) {
    outing.leaving = true;
  }
  outing.phase = "talk";
  outing.result = {
    chips: [
      {
        text:
          choice === "stay"
            ? `${characterOf(state, interrupt.id)?.name?.toUpperCase()} LEFT \xB7 THEIR JEALOUSY COMES LATER`
            : "A LIE \xB7 TO BOTH",
        bad: true,
      },
      ...chips,
    ],
    moment: "",
  };
  settleOuting(state);
  return {
    ok: true,
    ends: false,
    words: words,
  };
}
function goodbyeOptions(state) {
  let outing = state.outing;
  if (!outing) {
    return [];
  }
  let bond = bondOf(state, outing.characterId),
    options = [];
  if (outing.kind === "wedding") {
    return [
      {
        id: "night",
        label: "The last song \xB7 home together",
        ok: true,
        need: 0,
      },
    ];
  }
  if (outing.kind === "honeymoon") {
    return [
      {
        id: "home",
        label: "Fly home together",
        ok: true,
        need: 0,
      },
    ];
  }
  let hooked = collectModuleHook(state, "goodbye", outing).flat();
  if (hooked.some((option) => option.ask)) {
    return hooked;
  }
  options.push(...hooked);
  let step =
      outing.kind === "date" && !outing.ruined
        ? nextMilestoneStepFor(bond, milestoneCtx(state, outing.characterId))
        : null,
    milestone = step?.ok ? MILESTONES[step.id] : null;
  if (milestone && milestone.by === "both" && !milestone.menu && !milestoneWhyNot(state, outing.characterId, step.id)) {
    options.push({
      id: `milestone:${step.id}`,
      label: milestone.title(nameFor(state, characterOf(state, outing.characterId))),
      milestone: step.id,
      ok: true,
      need: 0,
    });
  }
  if (
    step?.ok &&
    step.id === "propose" &&
    !proposeWhy(state, outing.characterId, milestoneCtx(state, outing.characterId))
  ) {
    options.push({
      id: "milestone:propose",
      label: "Propose",
      milestone: "propose",
      ok: true,
      need: 0,
    });
  }
  let noWalk =
    sharesYourDoor(state, characterOf(state, outing.characterId) ?? {}) || outingPlaceHome(outing.place) === "theirs";
  for (let option of OUTING_GOODBYE_OPTIONS[outing.kind]) {
    if ((option.id === "kiss" && !bond.milestones?.firstKiss) || (option.id === "walk" && noWalk)) {
      continue;
    }
    let band = outingMoodBand(option.need)[1].toLowerCase();
    options.push({
      ...option,
      ok: outing.mood >= option.need,
      why: outing.mood >= option.need ? "" : `Only if it's going ${band === "good" ? "well" : band}`,
    });
  }
  return options;
}
function endOutingEarly(state) {
  let outing = state.outing;
  if (!outing || !["talk", "moment"].includes(outing.phase)) {
    return {
      ok: false,
      reason: "Not now.",
    };
  }
  if (outing.kind === "wedding" && !outing.done.includes("dance")) {
    return {
      ok: false,
      reason: "Not before the first dance.",
    };
  }
  if (outing.kind === "honeymoon" && outing.done.length < HONEYMOON_DAYS) {
    return {
      ok: false,
      reason: "Not before the last day.",
    };
  }
  if (outing.exchange < OUTING_LIMITS.early) {
    outing.mood = clampOutingMood(outing.mood - 10);
  }
  outing.early = true;
  outing.ending = true;
  if (outing.phase === "talk") {
    passPlea(state, "outing", outing.characterId);
  }
  let phase = outing.phase;
  settleOuting(state);
  return outing.phase === "moment"
    ? {
        ok: true,
        bill: phase !== "moment",
      }
    : {
        ok: true,
        farewell: ["date", "hang"].includes(outing.kind) && !outing.leaving && !outing.closing && !outing.ruined,
      };
}
function goodbyeWhat(state, choice) {
  let outing = state.outing,
    dateName = characterOf(state, outing.characterId)?.name ?? "them",
    band = outingMoodBand(outing.mood)[1].toLowerCase(),
    hooked = firstModuleHook(state, "goodbyeWords", choice);
  if (hooked) {
    return hooked;
  }
  if (outing.kind === "wedding") {
    return `The night ends (it went ${band}): the last song, the guests leave, and they go home together, married. 2 to 4 short segments.`;
  }
  if (outing.kind === "honeymoon") {
    return `The trip is over (it went ${band}): the last morning there, and the flight home together, married. 2 to 4 short segments.`;
  }
  if (outing.ruined) {
    return `It ends badly: the player just left ${dateName} there to go after their partner, who walked in on them. ${dateName} is left alone with it: 2 to 4 short segments.`;
  }
  if (choice === "left" || outing.leaving) {
    return `It went badly (${band}): ${dateName} ends it early and goes, true to who they are.`;
  }
  if (outing.closing && !choice) {
    return `The place is closing: they have to go. It went ${band}.`;
  }
  let line =
    {
      kiss: "The player kisses them goodnight.",
      walk: "The player walks them home.",
      hug: "They hug goodbye.",
      see: "They say see you soon and part.",
    }[choice] ?? "They say goodbye.";
  return `It went ${band}.${outing.closing ? " The place was closing, so they are out at the door." : ""} ${line}${outing.dream ? " It was their dream date, exactly as they had pictured it: the place, the hour, the little gift." : ""}${outing.milestone ? " Something is in the air: the moment is right for more (it comes next)." : ""}`;
}
function outingRememberers(state, outing = state.outing) {
  return rememberersOf(
    state,
    [...(outing?.group ?? []), ...(outing?.guests ?? [])].filter((id) => !leftEarly(outing, id)),
  );
}
function rememberOutingEach(state, outing, each = {}) {
  let present = new Set([...(outing.group ?? []), ...(outing.guests ?? [])].filter((id) => !leftEarly(outing, id))),
    entries = Object.entries(each ?? {}).filter(
      ([id, text]) => text && present.has(id) && characterOf(state, id) && !characterOf(state, id).npc,
    );
  for (let [id, text] of entries) {
    addMemory(characterOf(state, id), {
      at: state.minutes,
      text: text,
      from: "outing",
    });
  }
  return entries.map(([id]) => id);
}
function finishOuting(state, choice, { lines = [], remember = "", each = {} } = {}) {
  let outing = state.outing;
  if (!outing || outing.phase === "summary") {
    return {
      ok: false,
      reason: "There is no outing.",
    };
  }
  let bond = bondOf(state, outing.characterId),
    character = characterOf(state, outing.characterId),
    plan = (state.plans ?? []).find((candidate) => candidate.id === outing.planId),
    before = {
      friendship: bond.friendship,
      romance: bond.romance,
      trust: bond.trust,
    };
  if (outing.kind === "date") {
    markTraitsSeen(bond, "romantic");
  }
  let times = timesAt(state, outing.characterId, outing.place),
    events = [],
    { events: tickEvents } = advanceTime(state, OUTING_LIMITS.goodbye);
  if ((events.push(...tickEvents), outing.phase === "summary")) {
    return {
      ok: true,
      events: events,
      milestone: null,
    };
  }
  let plea = pleaLeftInOuting(state);
  if (
    (runModuleHook(state, "goodbyeChosen", choice, outing),
    (outing.used += OUTING_LIMITS.goodbye),
    outing.kind !== "wedding" && outing.kind !== "honeymoon" && anniversaryKept(state, outing.characterId, events),
    outing.birthday?.of && outing.birthday.of !== "you" && markSaid(state, outing.birthday.of, "party"),
    outing.kind === "wedding" || outing.kind === "honeymoon")
  ) {
    let settled = outing.kind === "wedding" ? settleWedding(state) : settleHoneymoon(state),
      ceremonyTotals = Object.fromEntries(
        BOND_AXES.map((axis) => [axis, Math.round((bond[axis] - before[axis]) * 10) / 10]),
      );
    if (remember) {
      addMemory(character, {
        at: state.minutes,
        text: remember,
        from: "outing",
      });
    }
    let ceremonyKept = rememberOutingEach(state, outing, each);
    outing.bye = choice;
    outing.summary = {
      totals: ceremonyTotals,
      limits: {},
      minutes: state.minutes - outing.startedAt,
      spent: 0,
      covered: 0,
      remember: remember,
      ruined: false,
      left: false,
      milestone: null,
      found: [],
      times: 1,
      ...(plea
        ? {
            unanswered: {
              amount: plea.amount,
            },
          }
        : {}),
      ...settled,
    };
    if (lines.length) {
      setOutingLines(state, lines);
    }
    outing.phase = "summary";
    logNote(
      state,
      `${outing.kind === "wedding" ? "Married to" : "Home from the honeymoon with"} ${character?.name ?? "someone"}: ${outingMoodBand(outing.mood)[1].toLowerCase()}`,
      "social",
    );
    return {
      ok: true,
      events: events,
      milestone: null,
      kept: ceremonyKept,
    };
  }
  let theirBirthday = isTheirBirthdayOuting(outing),
    yourBirthday = isYourBirthdayTheyHost(outing);
  if (!outing.paid && outingSpecOf(outing).price && (outing.by === "you" || theirBirthday || yourBirthday)) {
    let deal = outingDeal(state, outing);
    if (deal.treat) {
      markFriendTreatUsed(state, {
        treat: deal.treat,
      });
    }
    let bill = deal.treat
      ? {
          you: 0,
          them: 0,
          short: false,
          mood: 0,
        }
      : yourBirthday
        ? {
            you: 0,
            them: deal.costs * 2,
            short: false,
            mood: 0,
          }
        : theirBirthday
          ? {
              you: Math.min(deal.costs, state.wallet.cash),
              them: Math.max(0, deal.costs - state.wallet.cash),
              short: false,
              mood: 0,
            }
          : settleOutingBill({
              price: deal.costs,
              by: "you",
              choice: "you",
              cash: state.wallet.cash,
              kind: outing.kind,
              style: TRAIT_BEHAVIOURS.payStyle(traitsOf(state, outing.characterId)),
            });
    if (bill.you) {
      spendMoney(
        state.wallet,
        bill.you,
        `${OUTING_KINDS[outing.kind].name} at ${planPlaceName(state, outing)}`,
        state.minutes,
      );
    }
    outing.spent += bill.you;
    outing.covered += bill.them;
    outing.mood = clampOutingMood(outing.mood + (bill.short ? bill.mood : 0));
  }
  let mood = outing.mood + (outing.dream ? 15 : 0),
    limits = {};
  if (!outing.ruined) {
    Object.assign(
      limits,
      applyBondAction(
        bond,
        outingBondGains({
          kind: outing.kind,
          mood: mood,
          times: times,
        }),
        {
          at: state.minutes,
          charm: skillLevelsOf(state).charm,
          today: false,
          share: "event",
          note: OUTING_KINDS[outing.kind].name,
        },
      ).limits ?? {},
    );
    Object.assign(
      limits,
      applyBondAction(bond, "keptPlan", {
        at: state.minutes,
        today: false,
        share: "event",
      }).limits ?? {},
    );
    if (choice === "walk") {
      applyBondAction(
        bond,
        {
          action: outing.kind === "date" ? "date" : "time",
          ...(outing.kind === "date"
            ? {
                romance: 1,
              }
            : {
                friendship: 1,
              }),
        },
        {
          at: state.minutes,
          today: false,
          share: "event",
        },
      );
    }
    if (choice === "kiss") {
      outing.kissSeenBy = recordTownFact(state, "kiss", {
        with: outing.characterId,
        place: state.at,
        witnesses: sawIt(state, outing.characterId),
      });
    }
    if (outing.dream) {
      applyBondAction(
        bond,
        {
          action: "date",
          romance: 8,
          friendship: 3,
        },
        {
          at: state.minutes,
          today: false,
          share: "event",
        },
      );
      bond.dreamDate.done = state.minutes;
    }
    if (outing.kind === "date" || times === 0) {
      recordNovelty(bond, state.minutes);
    }
  }
  bond.lastSeen = state.minutes;
  for (let memberId of outing.group ?? []) {
    let memberBond = bondOf(state, memberId);
    if (!(!memberBond || outing.ruined)) {
      applyBondAction(
        memberBond,
        outingBondGains({
          kind: outing.kind,
          mood: outing.moods?.[memberId] ?? mood,
          times: times,
        }),
        {
          at: state.minutes,
          charm: skillLevelsOf(state).charm,
          today: false,
          share: "event",
          note: OUTING_KINDS[outing.kind].name,
        },
      );
      applyBondAction(memberBond, "keptPlan", {
        at: state.minutes,
        today: false,
        share: "event",
      });
      memberBond.lastSeen = state.minutes;
    }
  }
  addSkillXp(state.skills, {
    charm: 5,
  });
  if (plan) {
    plan.status = outing.ruined ? "ruined" : "kept";
  }
  if (remember) {
    addMemory(character, {
      at: state.minutes,
      text: remember,
      from: "outing",
    });
  }
  let kept = rememberOutingEach(state, outing, each);
  if (outing.group?.length) {
    let everyone = [outing.characterId, ...outing.group],
      sharedText = `Out together with ${state.persona?.name || "the player"}: ${OUTING_KINDS[outing.kind].name.toLowerCase()} at the ${planPlaceName(state, outing)}.`;
    for (let i = 0; i < everyone.length; i++) {
      for (let j = i + 1; j < everyone.length; j++) {
        rememberPair(state, everyone[i], everyone[j], {
          text: sharedText,
          from: "outing",
        });
      }
    }
    if (remember) {
      for (let memberId of outing.group) {
        rememberPair(state, outing.characterId, memberId, {
          text: remember,
          from: "outing",
          by: outing.characterId,
        });
      }
    }
  }
  let proposeNext =
      !String(choice ?? "").startsWith("milestone:") &&
      outing.kind === "date" &&
      !outing.ruined &&
      mood >= 62 &&
      bond.asks?.id === "propose"
        ? "propose"
        : null,
    [milestoneId, how = null] = String(choice ?? "").startsWith("milestone:")
      ? String(choice).slice(10).split("@")
      : [null],
    milestone = milestoneId ?? proposeNext;
  if (milestone) {
    bond.outingGlow = {
      until: state.minutes + 60,
      milestone: milestone,
      good: mood >= 62,
    };
  }
  let totals = Object.fromEntries(BOND_AXES.map((axis) => [axis, Math.round((bond[axis] - before[axis]) * 10) / 10]));
  if (
    ((outing.bye = choice),
    (outing.phase = "summary"),
    (outing.summary = {
      totals: totals,
      limits: limits,
      minutes: state.minutes - outing.startedAt,
      spent: outing.spent,
      covered: outing.covered,
      remember: remember,
      dream: outing.dream,
      ruined: !!outing.ruined,
      left: !!outing.leaving,
      milestone: milestone,
      how: how,
      found: outing.found,
      times: times + 1,
      ...(plea
        ? {
            unanswered: {
              amount: plea.amount,
            },
          }
        : {}),
      group: (outing.group ?? []).map((memberId) => ({
        id: memberId,
        name: nameFor(
          state,
          characterOf(state, memberId) ?? {
            id: memberId,
            name: "?",
          },
        ),
        mood: outingMoodBand(outing.moods?.[memberId] ?? mood)[1],
      })),
    }),
    lines.length && setOutingLines(state, lines),
    (outing.phase = "summary"),
    logNote(
      state,
      `${OUTING_KINDS[outing.kind].name} with ${character?.name ?? "someone"}: ${outingMoodBand(mood)[1].toLowerCase()}`,
      "social",
    ),
    choice === "walk" && !outing.ruined && !events.some((tick) => tick.id === "fainted"))
  ) {
    let walk = walkThemHome(state, character);
    if (walk) {
      events.push(...walk.events);
      outing.summary.walkedTo = walk.name;
    }
  }
  return {
    ok: true,
    events: events,
    milestone: milestone,
    kept: kept,
  };
}
function walkThemHome(state, character) {
  let placeId = character?.residence?.place ?? null,
    spot = placeId ? townPlace(state.town, placeId) : null;
  if (!spot || placeId === state.at) {
    return null;
  }
  let travel = travelFor(state, state.at, placeId);
  if (travel === null) {
    return null;
  }
  let { events: events } = advanceTime(state, travel, {
    walking: true,
  });
  return events.some((tick) => tick.id === "fainted")
    ? {
        events: events,
        name: null,
      }
    : ((state.at = placeId),
      logNote(state, `Walked ${character.name} home to ${spot.name} (${travel} min)`, "move"),
      {
        events: events,
        name: spot.name,
      });
}
function faintOuting(state) {
  let outing = state.outing;
  if (!outing || outing.phase === "summary") {
    return;
  }
  let plan = (state.plans ?? []).find((candidate) => candidate.id === outing.planId);
  if (plan) {
    plan.status = "cut";
  }
  if (outing.kind === "wedding" && state.wedding) {
    Object.assign(state.wedding, {
      day: null,
      startedDay: null,
      due: false,
    });
  }
  if (outing.birthday?.of && outing.birthday.of !== "you") {
    markSaid(state, outing.birthday.of, "party");
  }
  outing.phase = "summary";
  outing.summary = {
    totals: {
      friendship: 0,
      romance: 0,
      trust: 0,
    },
    minutes: state.minutes - outing.startedAt,
    spent: outing.spent,
    covered: outing.covered,
    remember: "",
    fainted: true,
    found: outing.found,
    times: 0,
  };
}
function keepFaintOuting(state, text, at) {
  let outing = state.outing,
    character = outing?.summary?.fainted ? characterOf(state, outing.characterId) : null;
  if (!character || !text) {
    return false;
  }
  outing.summary.remember = text;
  addMemory(character, {
    at: at,
    text: text,
    from: "outing",
  });
  for (let memberId of outing.group ?? []) {
    rememberPair(state, outing.characterId, memberId, {
      text: text,
      from: "outing",
      by: outing.characterId,
      at: at,
    });
  }
  return true;
}
function closeOuting(state) {
  if (!state.outing || state.outing.phase !== "summary") {
    return {
      ok: false,
      reason: "There is no outing to close.",
    };
  }
  let milestone = state.outing.summary?.milestone ?? null,
    how = state.outing.summary?.how ?? null,
    characterId = state.outing.characterId,
    fainted = !!state.outing.summary?.fainted;
  if (fainted && tripResumes(state)) {
    return {
      ok: true,
      milestone: null,
      how: null,
      characterId: characterId,
      after: null,
      resumed: true,
    };
  }
  if (!fainted && ["wedding", "honeymoon"].includes(state.outing.kind) && state.residence && !state.lodging) {
    state.at = "home";
  }
  let after = state.outing.kind === "wedding" && !fainted ? "wedding" : null;
  state.outing = null;
  return {
    ok: true,
    milestone: milestone,
    how: how,
    characterId: characterId,
    after: after,
  };
}
function outingView(state) {
  let outing = state.outing;
  if (!outing) {
    return null;
  }
  let character = characterOf(state, outing.characterId),
    isWedding = outing.kind === "wedding",
    isHoneymoon = outing.kind === "honeymoon",
    moment = outing.moment ? outingMomentById(outing, outing.moment) : null,
    [, moodName, moodKind] = outingMoodBand(outing.mood),
    interrupt = outing.interrupt;
  return {
    characterId: outing.characterId,
    name: character ? nameFor(state, character) : "?",
    ...characterPortrait(character, state),
    kind: outing.kind,
    kindName: kindNameOf(state, outing),
    place: outing.place,
    placeName: planPlaceName(state, outing),
    by: outing.by,
    yourBirthday: outing.birthday?.of === "you",
    phase: outing.phase,
    time: formatClockTime(state.minutes),
    used: outing.used,
    total: isWedding ? WEDDING_MINUTES : isHoneymoon ? HONEYMOON_DAYS * HONEYMOON_DAY_MINUTES : OUTING_LIMITS.minutes,
    ...(isWedding
      ? {
          meterName: "The night",
          noEnd: !outing.done.includes("dance"),
        }
      : {}),
    ...(isHoneymoon
      ? {
          meterName: "The trip",
          noEnd: outing.done.length < HONEYMOON_DAYS,
          trip: outing.trip,
          leftText: `Day ${outing.tripDay} of ${HONEYMOON_DAYS}`,
        }
      : {}),
    exchange: outing.exchange ?? 0,
    max: outing.max ?? OUTING_LIMITS.exchanges,
    minutesLeft: outingMinutesLeft(state, outing),
    suggestions: outing.suggestions ?? [],
    ending: !!outing.ending,
    mood: {
      value: outing.mood,
      name: moodName,
      kind: moodKind,
    },
    late: outing.late,
    ...(() => {
      let bond = bondOf(state, outing.characterId);
      if (!bond) {
        return {};
      }
      let summary = bondSummary(bond);
      return {
        bond: {
          friendship: summary.friendship,
          romance: summary.romance,
          trust: summary.trust,
        },
        totals: outing.bondStart
          ? Object.fromEntries(
              BOND_AXES.map((axis) => [
                axis,
                Math.round((bond[axis] - (outing.bondStart[axis] ?? bond[axis])) * 10) / 10,
              ]),
            )
          : null,
      };
    })(),
    read: outing.result?.read ?? null,
    batch: outing.batch,
    log: outing.log,
    moment: moment
      ? {
          id: moment.id,
          name: momentName(state, moment),
          minutes: moment.minutes,
          pay: !!moment.pay,
          options: momentOptions(state, outing, moment),
          ...(moment.dish === "yours" && canOrderInNow(state, outing)
            ? {
                cook: {
                  ...mealContextFor(state, outing),
                  together: !!outing.cookWith,
                },
              }
            : {}),
          ...(moment.dish === "theirs"
            ? {
                served: {
                  name: theirCookingFor(state, outing).recipe.name,
                  icon: theirCookingFor(state, outing).recipe.icon,
                },
              }
            : {}),
        }
      : null,
    result: outing.result,
    leaving: outing.leaving,
    closing: !!outing.closing,
    interrupt:
      interrupt && interrupt.phase !== "lines"
        ? {
            id: interrupt.id,
            kind: interrupt.kind,
            knew: interrupt.knew,
            phase: interrupt.phase,
            lines: interrupt.lines,
            name: nameFor(state, characterOf(state, interrupt.id)),
            ...characterPortrait(characterOf(state, interrupt.id), state),
          }
        : null,
    goodbye: outing.phase === "goodbye" ? goodbyeOptions(state) : null,
    night: outing.night?.options ?? null,
    pictures: outing.keyShown ? pictureViews(state, [outing.keyShown]) : [],
    summary: outing.summary?.guests
      ? {
          ...outing.summary,
          guests: outing.summary.guests.map((guest) => ({
            ...guest,
            ...characterPortrait(characterOf(state, guest.id), state),
          })),
        }
      : outing.summary,
    cash: state.wallet.cash,
    here: hereView(state, outing),
    seenBy: (outing.seenBy ?? []).map((id) => knownName(state, id)),
    kissSeenBy: (outing.kissSeenBy ?? []).map((id) => knownName(state, id)),
    others: castBonds(state, outing, [
      ...(outing.group ?? []),
      ...(interrupt?.id && interrupt.phase !== "lines" ? [interrupt.id] : []),
    ]),
    guests: (outing.guests ?? []).map((id) => ({
      id: id,
      name: nameFor(
        state,
        characterOf(state, id) ?? {
          id: id,
          name: "?",
        },
      ),
    })),
    group: (outing.group ?? []).map((id) => {
      let member = characterOf(state, id),
        mood = outing.moods?.[id] ?? outing.mood,
        [, memberMoodName, memberMoodKind] = outingMoodBand(mood);
      return {
        id: id,
        name: member ? nameFor(state, member) : "?",
        ...characterPortrait(member, state),
        mood: {
          value: mood,
          name: memberMoodName,
          kind: memberMoodKind,
        },
      };
    }),
  };
}

export {
  HANG_WEIGHT,
  INTERRUPT_CHOICES,
  ORDER_IN,
  applyMoment,
  applyTalk,
  beginOuting,
  closeOuting,
  endOutingEarly,
  faintOuting,
  finishOuting,
  goodbyeOptions,
  goodbyeWhat,
  interruptChoice,
  interruptWords,
  keepFaintOuting,
  mealMoment,
  mealOpen,
  momentName,
  momentOptions,
  openOuting,
  outingDeal,
  outingKeyImage,
  outingNext,
  outingPlayable,
  outingRememberers,
  outingView,
  pickMoment,
  planOuting,
  plansTodayNotice,
  prepareMoment,
  prepareTalk,
  setInterruptLines,
  setOutingLines,
  settleOuting,
};
