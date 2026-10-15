// Residence and money: rent day, eviction, belongings held, couch surfing, buying/selling/moving homes, bills
import { clockFromMinutes, formatCalendarDate, formatClockTime } from "../time/clock.mjs";
import { townJobById } from "../jobs/town-jobs.mjs";
import { describeWorkFromHomeHours } from "../jobs/job-week.mjs";
import { RESIDENCE_PLACES, isHousePlace } from "../housing/residence-places.mjs";
import { nextFreeUnit } from "../housing/residences.mjs";
import { bondTier, hasMet, isActiveRival } from "../relationships/bonds.mjs";
import { kinOrRivalRelationNote } from "../relationships/kin.mjs";
import { itemDef } from "../items/inventory.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { outingPlaceHome } from "../outings/outing-places.mjs";
import { HOME_KINDS, HOME_RESALE_SHARE, mortgageQuoteFor } from "./home-kinds.mjs";
import {
  HOSPITAL_BILL_DUE_DAYS,
  LATE_PAYMENT_FEE,
  addBill,
  chargeRent,
  earnMoney,
  escalateOverdueHospitalBills,
  homeKindOf,
  housingCostOf,
  housingShareDue,
  normalizeHomeKind,
  openBills,
  payBill,
  payMortgageInstallment,
  rentIsDue,
  rentSeasonKey,
  spendMoney,
  totalOwed,
} from "../money/wallet.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { homePartyBlocksReason, ownPartyBlocksReason } from "../parties/party.mjs";
import { amountOwedTo, friendCoversRent, payBackFriend, recordDebt } from "../relationships/friend-perks.mjs";
import {
  addHomeMemory,
  collectHousemateRent,
  emptyFridgeWords,
  housematesOf,
  housematesPayTotal,
  moveOutToOwnPlace,
  roomsInHome,
  roomsTakenBy,
} from "./housemates.mjs";
import { bondOf, characterOf, livingWithYou, logNote, nameFor, sceneBusyReason, sharesYourDoor } from "../game.mjs";

var MINUTES_IN_DAY = 1440;
var HOME_ACTS = ["couch", "bills", "homes", "plea", "lent"];
var COUCH_NIGHTS = 7;
var COUCH_FROM_TIER = 3;
var COUCH_BED_QUALITY = 0.6;
var ROUGH_BED_QUALITY = 0.35;
var STREET_SPOT_PLACE = "park";
var PARTNER_COVER_TRUST_PENALTY = -3;
var shortDateWords = (state, at) =>
  formatCalendarDate(at, {
    from: state.startedAt,
  }).replace(/ · Year \d+$/, "");
var lodgingKindOf = (state) => state.lodging?.kind ?? "home";
var hasOwnHome = (state) => !state.lodging && !!state.residence;
function rentSharersOf(state) {
  if (!hasOwnHome(state)) {
    return 0;
  }
  let partnerIds = livingWithYou(state).map((entry) => entry.characterId),
    mateCount = state.characters.filter(
      (character) => !character.away && !partnerIds.includes(character.id) && sharesYourDoor(state, character),
    ).length;
  return partnerIds.length + mateCount + (state.wallet.flatmate === "anon" ? 1 : 0);
}
var rentShareOf = (state) =>
  hasOwnHome(state)
    ? housingShareDue(state.wallet, {
        sharedWith: rentSharersOf(state),
      })
    : 0;
var streetSpotOf = (state) =>
  townPlace(state.town, STREET_SPOT_PLACE) ? STREET_SPOT_PLACE : (state.town.places[0]?.id ?? "home");
function setResidence(state, residence) {
  state.residence = residence
    ? {
        place: residence.place,
        unit: residence.unit,
      }
    : null;
  if (residence) {
    state.town.homeAt = residence.place;
  }
}
function leaveHomeLocation(state) {
  if (state.at === "home") {
    state.at = streetSpotOf(state);
    state.visit = null;
  }
}
function holdBelongings(state, holder) {
  let things = state.things;
  if (!things || state.held) {
    return;
  }
  restoreOwnKitchen(state);
  let wearing = state.wearing;
  state.held = {
    by: holder,
    at: state.minutes,
    fridge: things.fridge ?? [],
    shelf: things.shelf ?? [],
    closet: (things.closet ?? []).filter((itemId) => itemId !== wearing),
    home: things.home ?? {},
    orders: things.orders ?? [],
  };
  state.things = {
    ...things,
    fridge: [],
    shelf: [],
    closet: wearing ? [wearing] : [],
    home: {},
    orders: [],
  };
}
var canReleaseBelongings = (state) =>
  !!state.held &&
  (state.held.by === "bank"
    ? true
    : state.held.by === "landlord"
      ? !totalOwed(state.wallet, "rent")
      : !amountOwedTo(state, state.held.by));
var BASIC_FURNITURE_FALLBACK = {
  bed: "futon",
  kitchen: "hot-plate",
  sofa: "old-sofa",
  bath: "shower",
};
function storeLuxuryFurniture(state) {
  let things = state.things;
  if (!things?.home) {
    return;
  }
  let onHill = !!homeKindOf(state.wallet.home).luxury && !state.lodging;
  if (((things.stored ??= {}), (things.offHill = !onHill), onHill)) {
    for (let [slot, itemId] of Object.entries(things.stored)) {
      if (slot in things.home) {
        things.home[slot] = itemId;
        delete things.stored[slot];
      }
    }
  } else {
    for (let [slot, itemId] of Object.entries(things.home)) {
      if (itemId && itemDef(things, itemId)?.luxury) {
        things.stored[slot] = itemId;
        things.home[slot] = BASIC_FURNITURE_FALLBACK[slot] ?? null;
      }
    }
  }
}
function restoreOwnKitchen(state) {
  let things = state.things;
  if (!(!things?.home || !itemDef(things, things.home.kitchen)?.luxury)) {
    things.home.kitchen = things.ownKitchen ?? BASIC_FURNITURE_FALLBACK.kitchen;
    delete things.ownKitchen;
  }
}
function releaseBelongings(state) {
  let held = state.held;
  if (!held || !state.things) {
    return false;
  }
  let things = state.things;
  things.fridge = [...(things.fridge ?? []), ...held.fridge];
  things.shelf = [...(things.shelf ?? []), ...held.shelf];
  things.closet = [...new Set([...(things.closet ?? []), ...held.closet])];
  let slots = homeKindOf(state.wallet.home).slots;
  things.home = Object.fromEntries(
    [...new Set([...Object.keys(held.home ?? {}), ...Object.keys(things.home ?? {}), ...slots])].map((slot) => [
      slot,
      held.home?.[slot] ?? things.home?.[slot] ?? null,
    ]),
  );
  storeLuxuryFurniture(state);
  things.orders = [...(things.orders ?? []), ...held.orders];
  state.held = null;
  return true;
}
function residenceWords(state, character) {
  let residence = character?.residence;
  if (!residence?.place || character.away) {
    return "";
  }
  let streetName = townPlace(state.town, residence.place)?.name ?? "",
    homeText =
      residence.place === "mansions"
        ? `a mansion${streetName ? ` on ${streetName}` : ""}`
        : residence.place === "tower"
          ? `a luxury flat${streetName ? ` in ${streetName}` : ""}`
          : isHousePlace(residence.place)
            ? `a house${streetName ? ` on ${streetName}` : ""}`
            : `a flat${streetName ? ` in ${streetName}` : ""}`,
    housemateNames = state.characters
      .filter(
        (other) =>
          other.id !== character.id &&
          !other.away &&
          other.residence?.place === residence.place &&
          other.residence?.unit === residence.unit,
      )
      .map((other) => other.name),
    livesWith = [...(sharesYourDoor(state, character) ? ["the player"] : []), ...housemateNames],
    couchText =
      state.lodging?.kind === "couch" && state.lodging.with === character.id
        ? "; the player is sleeping on their couch for a few nights"
        : "",
    fridgeText = sharesYourDoor(state, character) ? emptyFridgeWords(state) : "";
  return `${homeText}${livesWith.length ? `, with ${livesWith.join(" and ")}` : ""}${couchText}${fridgeText}`;
}
function jobWords(state, character) {
  let job = character?.job;
  if (job?.home && !character.away) {
    let hoursText = describeWorkFromHomeHours(character.week);
    return `${job.title ? `${job.title}, from home` : "works from home"}${hoursText ? `, ${hoursText}` : ""}`;
  }
  if (!job?.id || character.away) {
    return "";
  }
  let townJob = townJobById(state.town, job.id);
  return `${job.title} at ${townJob?.placeName ?? job.place}${townJob?.shift ? `, ${townJob.shift}` : ""}`;
}
var withHomeAndWork = (state, character) =>
  character && {
    ...character,
    toYou: kinOrRivalRelationNote({
      kin: state.bonds?.[character.id]?.kin,
      rival: isActiveRival(state.bonds?.[character.id]),
      gender: character.gender,
      romance: !!state.rules?.familyRomance,
    }),
    home: residenceWords(state, character),
    work: jobWords(state, character),
  };
function demoteLivingPartners(state) {
  for (let partner of livingWithYou(state)) {
    partner.status = "partners";
    partner.statusSince = state.minutes;
    let character = characterOf(state, partner.characterId);
    if (character?.residence) {
      character.residence = {
        place: character.residence.place,
        unit: character.residence.unit,
      };
    }
  }
}
function couchFriends(state) {
  let usedCouches = state.couchUsed ?? [];
  return state.characters
    .filter((character) => {
      let bond = bondOf(state, character.id);
      return !bond ||
        !hasMet(bond) ||
        character.away ||
        !character.residence ||
        usedCouches.includes(character.id) ||
        bondTier(bond, "friendship") < COUCH_FROM_TIER ||
        bond.status === "ex" ||
        (state.debts ?? []).some((debt) => debt.characterId === character.id && debt.amount > 0 && debt.overdue)
        ? false
        : !(state.residence && sharesYourDoor(state, character));
    })
    .sort((first, second) => bondOf(state, second.id).friendship - bondOf(state, first.id).friendship);
}
var residentsOfPlace = (state, placeId) =>
  placeId
    ? state.characters
        .filter((character) => !character.away && character.residence?.place === placeId)
        .map((character) => character.id)
    : [];
function evictPlayer(state, reason, { by: by, why: why }) {
  for (let bond of Object.values(state.bonds ?? {})) {
    if (["drop-by", "mate-in", "mate-moment"].includes(bond.asks?.id)) {
      bond.asks = null;
    }
  }
  state.guest = null;
  state.sleepover = null;
  state.wallet.carKept = null;
  if (why === "mortgage") {
    state.wallet.mortgage = null;
    state.wallet.bills = (state.wallet.bills ?? []).filter((bill) => bill.kind !== "mortgage");
  }
  recordTownFact(state, "evicted", {
    place: state.residence?.place ?? null,
    what: why,
    witnesses: residentsOfPlace(state, state.residence?.place),
  });
  for (let mate of housematesOf(state)) {
    moveOutToOwnPlace(state, mate.id);
    addHomeMemory(
      state,
      mate.id,
      (playerName) => `${playerName} lost the place we shared, and I went back to a place of my own.`,
    );
  }
  holdBelongings(state, by);
  demoteLivingPartners(state);
  setResidence(state, null);
  state.wallet.flatmate = null;
  state.lodging = {
    kind: "street",
    since: state.minutes,
  };
  leaveHomeLocation(state);
  let couchFriend = couchFriends(state)[0] ?? null,
    couchOffer = couchFriend
      ? {
          characterId: couchFriend.id,
          name: nameFor(state, couchFriend),
          nights: COUCH_NIGHTS,
        }
      : null,
    holderName =
      by === "bank" ? "the bank" : by === "landlord" ? "the landlord" : nameFor(state, characterOf(state, by)),
    owed = by === "bank" ? 0 : by === "landlord" ? totalOwed(state.wallet, "rent") : amountOwedTo(state, by);
  logNote(
    state,
    why === "partner"
      ? `Moved out: ${holderName} kept your things`
      : why === "mortgage"
        ? "The bank took your home"
        : `Evicted: the landlord kept your things ($${owed} owed)`,
    "money",
  );
  reason.push({
    id: "evicted",
    why: why,
    by: by,
    holder: holderName,
    owed: owed,
    offer: couchOffer,
    text:
      why === "partner"
        ? `You had to move out. ${holderName} keeps your things until you pay back the $${owed}.`
        : why === "mortgage"
          ? "The bank took your home for the payments you missed, and what you had paid with it. Your things wait for your next keys."
          : `Evicted. The landlord keeps your things${owed ? ` until you pay the $${owed} you owe` : ""}.`,
  });
}
var STREET_PARKING_FEE = 250;
var hasGarage = (state) =>
  !state.lodging && !!state.residence && homeKindOf(state.wallet.home).slots.includes("garage");
function chargeStreetParking(state, events) {
  if (
    !(state.things?.vehicles ?? []).includes("car") ||
    hasGarage(state) ||
    (state.wallet.carKept &&
      state.residence &&
      state.wallet.carKept === `${state.residence.place}:${state.residence.unit}`)
  ) {
    return;
  }
  if (state.wallet.cash >= STREET_PARKING_FEE) {
    spendMoney(state.wallet, STREET_PARKING_FEE, "Street parking", state.minutes);
    events.push({
      id: "parking",
      text: `Street parking for your car: $${STREET_PARKING_FEE} this season.`,
    });
    return;
  }
  let bill = addBill(state.wallet, {
    kind: "parking",
    amount: Math.round(STREET_PARKING_FEE * (1 + LATE_PAYMENT_FEE)),
    label: "Street parking",
    at: state.minutes,
  });
  Object.assign(bill, {
    name: "The city",
    dueWords: "When you can",
  });
  events.push({
    id: "parking",
    text: `You could not pay your car's street parking: $${bill.amount} in BILLS.`,
  });
}
var EVICTION_HOUR = 8;
var residenceDoorKey = (state) => (state.residence ? `${state.residence.place}:${state.residence.unit}` : "");
var evictionAmountOwed = (state, by) =>
  by === "landlord"
    ? totalOwed(state.wallet, "rent")
    : by === "bank"
      ? totalOwed(state.wallet, "mortgage")
      : amountOwedTo(state, by);
function warnEviction(state, events, { by: by, why: why, paidThrough: paidThrough }) {
  if (
    ((state.evicting = {
      by: by,
      why: why,
      at: clockFromMinutes(state.minutes).dayIndex * MINUTES_IN_DAY + EVICTION_HOUR * 60,
      door: residenceDoorKey(state),
      paidThrough: paidThrough,
    }),
    runDueEviction(state, events))
  ) {
    return;
  }
  let owed = evictionAmountOwed(state, by),
    whoName = by === "landlord" ? "the landlord" : by === "bank" ? "the bank" : nameFor(state, characterOf(state, by)),
    consequence =
      why === "partner" ? "you have to move out" : why === "mortgage" ? "the bank takes your home" : "you're evicted",
    deadline = formatClockTime(state.evicting.at);
  logNote(state, `Out at ${deadline} unless you pay $${owed}`, "money");
  events.push({
    id: "evict-warning",
    why: why,
    by: by,
    who: whoName,
    owed: owed,
    at: deadline,
    text: `You still owe ${whoName} $${owed}. Pay all of it in BILLS by ${deadline}, or ${consequence}.`,
  });
}
var isSameEvictionDoor = (state, eviction) => !!state.residence && residenceDoorKey(state) === eviction.door;
var isEvictionPending = (state, eviction = state.evicting) =>
  !!eviction && isSameEvictionDoor(state, eviction) && evictionAmountOwed(state, eviction.by) > 0;
function stopEvictionIfPaid(state) {
  let eviction = state.evicting;
  return !eviction || isEvictionPending(state, eviction)
    ? false
    : (isSameEvictionDoor(state, eviction) &&
        eviction.paidThrough !== undefined &&
        (state.wallet.rentPaidThrough = eviction.paidThrough),
      (state.evicting = null),
      true);
}
var evictionView = (state) =>
  isEvictionPending(state)
    ? {
        owed: evictionAmountOwed(state, state.evicting.by),
        by: formatClockTime(state.evicting.at),
        why: state.evicting.why,
      }
    : null;
var isBusyAtHome = (state) =>
  !!state.guest ||
  !!state.party ||
  (!!state.outing && outingPlaceHome(state.outing.place) === "yours") ||
  (state.at === "home" && !!state.scene && !state.scene.done);
function runDueEviction(state, events) {
  let eviction = state.evicting;
  if (!eviction || stopEvictionIfPaid(state) || state.minutes < eviction.at || isBusyAtHome(state)) {
    return false;
  }
  if (((state.evicting = null), eviction.why === "partner")) {
    let partner = characterOf(state, eviction.by),
      partnerName = partner ? nameFor(state, partner) : "Your partner";
    events.push({
      id: "moved-out",
      characterId: eviction.by,
      name: partnerName,
      owed: amountOwedTo(state, eviction.by),
      text: `${partnerName} can't cover your rent again: you don't live together any more.`,
    });
  }
  evictPlayer(state, events, {
    by: eviction.by,
    why: eviction.why,
  });
  return true;
}
function payRentDay(state, events) {
  let wallet = state.wallet;
  if (!rentIsDue(wallet, state.minutes)) {
    return;
  }
  if ((chargeStreetParking(state, events), !hasOwnHome(state))) {
    wallet.rentPaidThrough = rentSeasonKey(state.minutes);
    return;
  }
  let paidThroughBefore = wallet.rentPaidThrough;
  if (totalOwed(wallet, "rent") > 0) {
    wallet.rentPaidThrough = rentSeasonKey(state.minutes);
    warnEviction(state, events, {
      by: "landlord",
      why: "rent",
      paidThrough: paidThroughBefore,
    });
    return;
  }
  if (totalOwed(wallet, "mortgage") > 0) {
    wallet.rentPaidThrough = rentSeasonKey(state.minutes);
    warnEviction(state, events, {
      by: "bank",
      why: "mortgage",
      paidThrough: paidThroughBefore,
    });
    return;
  }
  let share = rentShareOf(state),
    partners = livingWithYou(state);
  if (partners.length && wallet.cash < share) {
    let coverer = partners.sort((first, second) => second.trust - first.trust)[0],
      covererChar = characterOf(state, coverer.characterId),
      covererName = nameFor(state, covererChar);
    if (
      (state.debts ?? []).some((debt) => debt.characterId === covererChar.id && debt.for === "rent" && debt.amount > 0)
    ) {
      if (ownsHomeOrMortgage(state)) {
        sendPartnerHome(state, coverer);
        events.push({
          id: "moved-out",
          characterId: covererChar.id,
          name: covererName,
          owed: amountOwedTo(state, covererChar.id),
          text: `${covererName} can't keep covering for you and moves out: you don't live together any more.`,
        });
      } else {
        wallet.rentPaidThrough = rentSeasonKey(state.minutes);
        warnEviction(state, events, {
          by: covererChar.id,
          why: "partner",
          paidThrough: paidThroughBefore,
        });
        return;
      }
    } else {
      let costKind = housingCostOf(wallet).kind,
        costWord2 =
          {
            rent: "rent",
            mortgage: "mortgage payment",
            upkeep: "home's bills",
          }[costKind] ?? "rent";
      wallet.rentPaidThrough = rentSeasonKey(state.minutes);
      if (costKind === "mortgage") {
        payMortgageInstallment(wallet);
      }
      recordDebt(state, covererChar.id, share, "rent");
      coverer.trust = Math.max(0, coverer.trust + PARTNER_COVER_TRUST_PENALTY);
      wallet.ledger.push({
        at: state.minutes,
        amount: 0,
        label: `${costWord2[0].toUpperCase()}${costWord2.slice(1)} (your part, $${share}) paid by ${covererName}`,
        balance: wallet.cash,
      });
      logNote(state, `${covererName} covered your part of the ${costWord2} ($${share})`, "money");
      events.push({
        id: "partner-covered",
        characterId: covererChar.id,
        name: covererName,
        amount: share,
        trust: PARTNER_COVER_TRUST_PENALTY,
        kind: costKind,
        text: `${covererName} covered your part of the ${costWord2} ($${share}). You owe it back.`,
      });
      return;
    }
  }
  let friendHelp = friendCoversRent(state, {
    sharedWith: rentSharersOf(state),
  });
  if (friendHelp) {
    events.push(friendHelp);
  }
  let charge = chargeRent(wallet, state.minutes, {
    sharedWith: rentSharersOf(state),
  });
  if (!charge) {
    return;
  }
  let costWord =
    {
      rent: "rent",
      mortgage: "mortgage payment",
      upkeep: "home costs",
    }[charge.kind] ?? "rent";
  if (charge.kind !== "rent") {
    collectHousemateRent(state, events);
  }
  let payee =
    {
      rent: "the landlord",
      mortgage: "the bank",
      upkeep: "your home's bills",
    }[charge.kind] ?? "the landlord";
  events.push({
    id: "rent",
    ...charge,
    nextDay: wallet.rentDay,
    text: charge.paid
      ? `${costWord[0].toUpperCase()}${costWord.slice(1)} paid: $${charge.amount}.${charge.paidOff ? " That was the last one: your home is yours." : ""}`
      : `You could not pay the ${costWord} ($${charge.amount}): you owe ${payee} $${charge.owed}. Pay it in BILLS${charge.kind === "upkeep" ? "" : " before the next one"}.`,
  });
  logNote(
    state,
    charge.paid
      ? `${costWord[0].toUpperCase()}${costWord.slice(1)} paid: $${charge.amount}${charge.paidOff ? " (the last one)" : ""}`
      : `${costWord[0].toUpperCase()}${costWord.slice(1)} missed: $${charge.owed} owed`,
    "money",
  );
  if (wallet.flatmate === "anon") {
    wallet.flatmate = null;
    events.push({
      id: "flatmate-left",
      text: "Your flatmate paid their last share and moved out: from the next rent on, it is all yours.",
    });
    logNote(state, "Your flatmate moved out", "move");
  }
}
function startCouchSurfing(state, characterId) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (lodgingKindOf(state) !== "street") {
    return {
      ok: false,
      reason: "You have a place to sleep.",
    };
  }
  let friend = couchFriends(state).find((character) => character.id === characterId);
  if (!friend) {
    return {
      ok: false,
      reason: "They can't take you in.",
    };
  }
  state.lodging = {
    kind: "couch",
    with: friend.id,
    since: state.minutes,
    until: state.minutes + COUCH_NIGHTS * MINUTES_IN_DAY,
  };
  state.couchUsed = [...(state.couchUsed ?? []), friend.id];
  setResidence(state, friend.residence);
  let friendName = nameFor(state, friend);
  logNote(state, `Staying on ${friendName}'s couch`, "move");
  return {
    ok: true,
    name: friendName,
    nights: COUCH_NIGHTS,
    until: shortDateWords(state, state.lodging.until),
  };
}
function tickCouchStay(state, events) {
  let lodging = state.lodging;
  if (lodging?.kind !== "couch") {
    return;
  }
  let host = characterOf(state, lodging.with),
    bond = bondOf(state, lodging.with),
    nightsOver = state.minutes >= lodging.until,
    askedToLeave =
      !host || host.away || !bond || bondTier(bond, "friendship") < COUCH_FROM_TIER || bond.status === "ex";
  if (!nightsOver && !askedToLeave) {
    return;
  }
  let hostName = host ? nameFor(state, host) : "They";
  setResidence(state, null);
  state.lodging = {
    kind: "street",
    since: state.minutes,
  };
  leaveHomeLocation(state);
  logNote(state, nightsOver ? `${hostName}'s couch: the nights are over` : `${hostName} asked you to leave`, "move");
  events.push({
    id: "couch-over",
    characterId: lodging.with,
    name: hostName,
    why: nightsOver ? "nights" : "asked",
    text: nightsOver ? `Your nights on ${hostName}'s couch are over.` : `${hostName} asked you to leave.`,
  });
}
var partnerComesAlong = (state, partner) =>
  bondTier(partner, "trust") >= 2 &&
  !(state.debts ?? []).some((debt) => debt.characterId === partner.characterId && debt.overdue && debt.amount > 0);
function moveHouseholdPlan(state, stayIds = []) {
  let partners = hasOwnHome(state) ? livingWithYou(state) : [],
    mates = housematesOf(state),
    coming = {
      partners: partners.filter((partner) => partnerComesAlong(state, partner)),
      mates: mates.filter((mate) => !stayIds.includes(mate.id)),
    };
  return {
    ...coming,
    staying: {
      partners: partners.filter((partner) => !coming.partners.includes(partner)),
      mates: mates.filter((mate) => stayIds.includes(mate.id)),
    },
    rooms: roomsTakenBy(coming.mates.length, coming.partners.length),
    sharers: coming.partners.length + coming.mates.length,
  };
}
function homesView(state, { stay: opts = [] } = {}) {
  let wallet = state.wallet,
    lodgingKind = lodgingKindOf(state),
    currentKind = hasOwnHome(state) ? normalizeHomeKind(wallet.home) : null,
    arrears = homeArrearsTotal(state),
    partnerRows = hasOwnHome(state)
      ? livingWithYou(state).map((partner) => ({
          id: partner.characterId,
          name: nameFor(state, characterOf(state, partner.characterId)),
          comes: partnerComesAlong(state, partner),
        }))
      : [],
    couch =
      state.lodging?.kind === "couch"
        ? {
            name: nameFor(state, characterOf(state, state.lodging.with)),
            until: shortDateWords(state, state.lodging.until),
          }
        : null,
    saleValue = homeSaleValue(state),
    ownsCurrent = currentKind && (wallet.owns === currentKind || wallet.mortgage?.kind === currentKind),
    plan = moveHouseholdPlan(state, opts),
    mateRows = housematesOf(state).map((mate) => ({
      id: mate.id,
      name: nameFor(state, mate),
      comes: !opts.includes(mate.id),
    })),
    listings = Object.values(HOME_KINDS).map((kind) => {
      let firstRent = Math.round(kind.rent / (1 + plan.sharers)),
        total = arrears + firstRent,
        isCurrent = currentKind === kind.id,
        mortgage = mortgageQuoteFor(kind.id),
        funds = wallet.cash + (isCurrent ? 0 : saleValue),
        fits = isCurrent || plan.rooms <= roomsInHome(kind.id),
        whyNot = (cost) =>
          isCurrent && ownsCurrent
            ? "It's yours"
            : fits
              ? funds >= cost
                ? ""
                : `You need $${cost - funds} more`
              : "Not everyone coming fits";
      return {
        id: kind.id,
        name: kind.name,
        rent: kind.rent,
        where: kind.where,
        now: isCurrent,
        first: firstRent,
        owed: arrears,
        total: total,
        price: kind.price,
        upkeep: kind.upkeep,
        guests: kind.guests,
        slots: kind.slots,
        luxury: !!kind.luxury,
        mortgage: mortgage,
        share: isCurrent ? rentShareOf(state) : null,
        paid: isCurrent ? housematesPayTotal(state) : 0,
        rooms: roomsInHome(kind.id),
        taken: isCurrent ? roomsTakenBy(mateRows.length, partnerRows.length) : plan.rooms,
        fits: fits,
        partners: partnerRows.map((partner) => ({
          name: partner.name,
          comes: partner.comes,
        })),
        can: !isCurrent && funds >= total && plan.rooms <= roomsInHome(kind.id),
        why: isCurrent
          ? ""
          : plan.rooms > roomsInHome(kind.id)
            ? roomLimitWords(roomsInHome(kind.id))
            : funds >= total
              ? ""
              : `You need $${total - funds} more`,
        buy: {
          cash: {
            total: arrears + kind.price,
            why: whyNot(arrears + kind.price),
          },
          mortgage: {
            total: arrears + mortgage.down,
            why: whyNot(arrears + mortgage.down),
          },
        },
        street:
          !isCurrent && (state.things?.vehicles ?? []).includes("car") && !kind.slots.includes("garage")
            ? STREET_PARKING_FEE
            : 0,
      };
    });
  return {
    lodging: lodgingKind,
    couch: couch,
    cash: wallet.cash,
    owed: arrears,
    rentDay: wallet.rentDay,
    flatmate: wallet.flatmate === "anon",
    mates: mateRows,
    stay: opts.filter((id) => mateRows.some((mate) => mate.id === id)),
    held: state.held
      ? {
          by:
            state.held.by === "bank"
              ? "The bank"
              : state.held.by === "landlord"
                ? "The landlord"
                : nameFor(state, characterOf(state, state.held.by)),
          free: canReleaseBelongings(state),
        }
      : null,
    listings: listings,
    owns: currentKind && wallet.owns === currentKind ? currentKind : null,
    mortgage:
      currentKind && wallet.mortgage?.kind === currentKind
        ? {
            ...wallet.mortgage,
          }
        : null,
    sale: homeSaleValue(state),
  };
}
function moveHome(state, homeKind, { buy = null, stay = [] } = {}) {
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (state.outing) {
    return {
      ok: false,
      reason: "You are out with someone.",
    };
  }
  if (ownPartyBlocksReason(state) || homePartyBlocksReason(state)) {
    return {
      ok: false,
      reason: ownPartyBlocksReason(state) || homePartyBlocksReason(state),
    };
  }
  if (!(homeKind in HOME_KINDS)) {
    return {
      ok: false,
      reason: "There is no home like that.",
    };
  }
  if (buy && !["cash", "mortgage"].includes(buy)) {
    return {
      ok: false,
      reason: "Buy it outright or with a mortgage.",
    };
  }
  let wallet = state.wallet;
  if (hasOwnHome(state) && normalizeHomeKind(wallet.home) === homeKind) {
    return buy
      ? buyCurrentHome(state, homeKind, buy)
      : {
          ok: false,
          reason: "You live in one already.",
        };
  }
  let kind = HOME_KINDS[homeKind],
    plan = moveHouseholdPlan(state, Array.isArray(stay) ? stay : []),
    comingPartners = plan.partners,
    stayingPartners = plan.staying.partners;
  if (plan.rooms > roomsInHome(homeKind)) {
    return {
      ok: false,
      reason: `${roomLimitWords(roomsInHome(homeKind))}.`,
    };
  }
  let firstRent = Math.round(kind.rent / (1 + plan.sharers)),
    arrears = homeArrearsTotal(state),
    upfront = buy === "cash" ? kind.price : buy === "mortgage" ? mortgageQuoteFor(homeKind).down : firstRent,
    saleValue = homeSaleValue(state);
  if (wallet.cash + saleValue < arrears + upfront) {
    return {
      ok: false,
      reason: `You need $${arrears + upfront - wallet.cash - saleValue} more.`,
    };
  }
  let sold = sellCurrentHome(state);
  for (let bill of [...openBills(wallet, "rent"), ...openBills(wallet, "parking"), ...openBills(wallet, "mortgage")]) {
    payBill(wallet, bill.id, bill.amount, state.minutes);
  }
  wallet.carKept = null;
  state.guest = null;
  state.sleepover = null;
  state.evicting = null;
  if (buy) {
    payForHome(state, homeKind, buy);
  } else {
    spendMoney(wallet, firstRent, `First rent \xB7 ${kind.name}`, state.minutes);
  }
  wallet.rentPaidThrough = rentSeasonKey(state.minutes);
  for (let partner of stayingPartners) {
    partner.status = "partners";
    partner.statusSince = state.minutes;
    let character = characterOf(state, partner.characterId);
    if (character?.residence) {
      character.residence = {
        place: character.residence.place,
        unit: character.residence.unit,
      };
    }
  }
  let takenUnits = [
      ...state.characters
        .filter((character) => character.residence?.place === kind.where)
        .map((character) => character.residence.unit),
      ...(state.residence?.place === kind.where ? [state.residence.unit] : []),
    ],
    newResidence = {
      place: kind.where,
      unit: nextFreeUnit(kind.where, takenUnits),
    },
    witnessIds = [
      ...new Set([...residentsOfPlace(state, state.residence?.place), ...residentsOfPlace(state, kind.where)]),
    ].filter((id) => !comingPartners.some((partner) => partner.characterId === id));
  recordTownFact(state, "moved", {
    place: kind.where,
    what: homeKind,
    witnesses: witnessIds,
  });
  setResidence(state, newResidence);
  for (let partner of comingPartners) {
    let character = characterOf(state, partner.characterId);
    if (character) {
      character.residence = {
        ...newResidence,
        withYou: true,
      };
    }
  }
  for (let mate of plan.mates) {
    mate.residence = {
      ...newResidence,
      withYou: true,
      from: mate.residence?.from ?? "apartments",
    };
  }
  for (let mate of plan.staying.mates) {
    mate.residence = {
      place: mate.residence.place,
      unit: mate.residence.unit,
    };
  }
  let kindName = kind.name.toLowerCase();
  for (let partner of comingPartners) {
    addHomeMemory(
      state,
      partner.characterId,
      (playerName) => `We moved together, ${playerName} and I, to a new ${kindName}.`,
    );
  }
  for (let mate of plan.mates) {
    addHomeMemory(
      state,
      mate.id,
      (playerName) => `I moved with ${playerName} to their new ${kindName}: we still live together.`,
    );
  }
  for (let partner of stayingPartners) {
    addHomeMemory(
      state,
      partner.characterId,
      (playerName) =>
        `${playerName} moved out to a ${kindName} and I stayed where we lived: we don't live together any more.`,
    );
  }
  for (let mate of plan.staying.mates) {
    addHomeMemory(
      state,
      mate.id,
      (playerName) =>
        `${playerName} moved out to a ${kindName} and I stayed in the old place: we don't live together any more.`,
    );
  }
  wallet.home = homeKind;
  wallet.flatmate = null;
  restoreOwnKitchen(state);
  for (let slot of kind.slots) {
    if (state.things?.home && !(slot in state.things.home)) {
      state.things.home[slot] = slot === "bath" ? "shower" : null;
    }
  }
  storeLuxuryFurniture(state);
  let previousLodging = state.lodging?.kind ?? null;
  state.lodging = null;
  state.couchUsed = [];
  let released = canReleaseBelongings(state) && releaseBelongings(state),
    partnerNames = (partners) => partners.map((partner) => nameFor(state, characterOf(state, partner.characterId)));
  logNote(state, `Moved into ${kind.name.toLowerCase()} ${newResidence.unit}${buy ? " (bought)" : ""}`, "move");
  let mateNames = (mates) => mates.map((mate) => nameFor(state, mate));
  return {
    ok: true,
    home: kind.name,
    door: newResidence.unit,
    paid: arrears + upfront,
    owed: arrears,
    first: buy ? 0 : firstRent,
    back: released,
    was: previousLodging,
    came: [...partnerNames(comingPartners), ...mateNames(plan.mates)],
    stayed: [...partnerNames(stayingPartners), ...mateNames(plan.staying.mates)],
    ...(buy
      ? {
          bought: buy,
          cost: upfront,
        }
      : {}),
    ...(sold
      ? {
          sold: sold,
        }
      : {}),
  };
}
var homeArrearsTotal = (state) =>
  totalOwed(state.wallet, "rent") +
  totalOwed(state.wallet, "parking") +
  (ownsHomeOrMortgage(state) ? 0 : totalOwed(state.wallet, "mortgage"));
var roomLimitWords = (count) =>
  `Room for ${count === 1 ? "one person" : `${count} people`} besides you: pick who stays`;
function homeSaleValue(state) {
  let wallet = state.wallet;
  if (!hasOwnHome(state)) {
    return 0;
  }
  let homeKind = normalizeHomeKind(wallet.home),
    resale = Math.round(HOME_KINDS[homeKind].price * HOME_RESALE_SHARE);
  return wallet.owns === homeKind
    ? Math.max(0, resale - homeBillsOwed(state))
    : wallet.mortgage?.kind === homeKind
      ? Math.max(0, resale - wallet.mortgage.left - homeBillsOwed(state))
      : 0;
}
function homeBillsOwed(state) {
  let wallet = state.wallet,
    installment = wallet.mortgage?.payment ?? 0;
  return (
    openBills(wallet, "upkeep").reduce((sum, bill) => sum + bill.amount, 0) +
    openBills(wallet, "mortgage").reduce((sum, bill) => sum + Math.max(0, bill.amount - installment), 0)
  );
}
var ownsHomeOrMortgage = (state) =>
  hasOwnHome(state) &&
  (state.wallet.owns === normalizeHomeKind(state.wallet.home) ||
    state.wallet.mortgage?.kind === normalizeHomeKind(state.wallet.home));
function sendPartnerHome(state, partner) {
  let character = characterOf(state, partner.characterId);
  if (((partner.status = "partners"), (partner.statusSince = state.minutes), !character)) {
    return;
  }
  let placeId = character.livesIn && RESIDENCE_PLACES.includes(character.livesIn) ? character.livesIn : "apartments",
    takenUnits = [
      ...state.characters.filter((other) => other.residence?.place === placeId).map((other) => other.residence.unit),
      ...(state.residence?.place === placeId ? [state.residence.unit] : []),
    ];
  character.residence = {
    place: placeId,
    unit: nextFreeUnit(placeId, takenUnits),
  };
}
function returnHomeFromLodging(state) {
  state.lodging = null;
  state.couchUsed = [];
  if (canReleaseBelongings(state)) {
    releaseBelongings(state);
  }
}
function leaveTheirHome(state, characterId) {
  let wallet = state.wallet,
    placeId = "apartments",
    housemates = state.characters.filter(
      (character) =>
        character.id !== characterId &&
        !character.away &&
        character.residence?.withYou &&
        sharesYourDoor(state, character),
    ),
    partners = housemates.filter((character) =>
      livingWithYou(state).some((partner) => partner.characterId === character.id),
    ),
    coming = [...partners, ...housemates.filter((character) => !partners.includes(character))].slice(
      0,
      roomsInHome("apartment") + (partners.length ? 1 : 0),
    );
  for (let character of housemates.filter((other) => !coming.includes(other))) {
    moveOutToOwnPlace(state, character.id);
    addHomeMemory(
      state,
      character.id,
      (playerName) =>
        `${playerName} had to leave the place we shared and there was no room for me in the new flat: I went back to a place of my own.`,
    );
  }
  let takenUnits = [
      ...state.characters
        .filter((character) => character.residence?.place === placeId && !coming.includes(character))
        .map((character) => character.residence.unit),
    ],
    newResidence = {
      place: placeId,
      unit: nextFreeUnit(placeId, takenUnits),
    },
    visitPlace = state.at === "home" && !state.visit ? state.residence?.place : null;
  setResidence(state, newResidence);
  state.guest = null;
  if (visitPlace) {
    state.at = visitPlace;
    state.visit = {
      characterId: characterId,
      stage: "inside",
      invite: {
        yes: true,
      },
      at: state.minutes,
      since: state.minutes,
    };
  }
  for (let character of coming) {
    character.residence = {
      ...newResidence,
      withYou: true,
      from: character.residence.from ?? "apartments",
    };
  }
  wallet.home = "apartment";
  wallet.flatmate = null;
  wallet.rentPaidThrough = rentSeasonKey(state.minutes);
  restoreOwnKitchen(state);
  for (let slot of homeKindOf("apartment").slots) {
    if (state.things?.home && !(slot in state.things.home)) {
      state.things.home[slot] = slot === "bath" ? "shower" : null;
    }
  }
  storeLuxuryFurniture(state);
  let hostName = nameFor(
    state,
    characterOf(state, characterId) ?? {
      id: characterId,
      name: "them",
    },
  );
  logNote(state, `Moved out of ${hostName}'s place, into apartment ${newResidence.unit}`, "move");
  return {
    id: "moved-out",
    characterId: characterId,
    who: "you",
    text: `You moved out of ${hostName}'s place: you live in a flat of your own now.`,
  };
}
function leaveOwnHome(state) {
  let sold = sellCurrentHome(state);
  state.wallet.carKept = null;
  restoreOwnKitchen(state);
  storeLuxuryFurniture(state);
  return sold;
}
function sellCurrentHome(state) {
  let wallet = state.wallet,
    homeKind = normalizeHomeKind(wallet.home);
  if (!hasOwnHome(state) || (wallet.owns !== homeKind && wallet.mortgage?.kind !== homeKind)) {
    return 0;
  }
  let saleValue = homeSaleValue(state);
  if (saleValue) {
    earnMoney(wallet, saleValue, `Sold your ${HOME_KINDS[homeKind].name.toLowerCase()}`, state.minutes);
  }
  wallet.bills = (wallet.bills ?? []).filter((bill) => bill.kind !== "upkeep" && bill.kind !== "mortgage");
  wallet.owns = null;
  wallet.mortgage = null;
  return saleValue;
}
function payForHome(state, homeKind, how) {
  let wallet = state.wallet,
    kind = HOME_KINDS[homeKind];
  if (how === "cash") {
    spendMoney(wallet, kind.price, `Bought \xB7 ${kind.name}`, state.minutes);
    wallet.owns = homeKind;
    wallet.mortgage = null;
  } else {
    let quote = mortgageQuoteFor(homeKind);
    spendMoney(wallet, quote.down, `Down payment \xB7 ${kind.name}`, state.minutes);
    wallet.owns = null;
    wallet.mortgage = {
      kind: homeKind,
      left: quote.total,
      payment: quote.payment,
      seasons: quote.seasons,
      paid: 0,
      since: state.minutes,
    };
  }
}
function buyCurrentHome(state, homeKind, how) {
  let wallet = state.wallet;
  if (wallet.owns === homeKind || wallet.mortgage?.kind === homeKind) {
    return {
      ok: false,
      reason: "It's yours already.",
    };
  }
  let kind = HOME_KINDS[homeKind],
    arrears = homeArrearsTotal(state),
    upfront = how === "cash" ? kind.price : mortgageQuoteFor(homeKind).down;
  if (wallet.cash < arrears + upfront) {
    return {
      ok: false,
      reason: `You need $${arrears + upfront - wallet.cash} more.`,
    };
  }
  for (let bill of [...openBills(wallet, "rent"), ...openBills(wallet, "parking")]) {
    payBill(wallet, bill.id, bill.amount, state.minutes);
  }
  state.evicting = null;
  payForHome(state, homeKind, how);
  wallet.rentPaidThrough = rentSeasonKey(state.minutes);
  logNote(state, `Bought your ${kind.name.toLowerCase()}`, "money");
  return {
    ok: true,
    home: kind.name,
    door: state.residence?.unit ?? "",
    paid: arrears + upfront,
    owed: arrears,
    first: 0,
    bought: how,
    cost: upfront,
    stayed: [],
    came: [],
    here: true,
  };
}
function billsView(state) {
  let wallet = state.wallet,
    rows = openBills(wallet).map((bill) => ({
      id: `bill:${bill.id}`,
      kind: bill.kind,
      name:
        bill.name ??
        {
          rent: "The landlord",
          mortgage: "The bank",
          upkeep: "Your home's bills",
        }[bill.kind] ??
        "The hospital",
      what: bill.label,
      amount: bill.amount,
      due:
        bill.dueWords ??
        (bill.kind === "rent"
          ? hasOwnHome(state)
            ? `${wallet.rentDay} of next season \xB7 then eviction`
            : ""
          : bill.kind === "mortgage"
            ? hasOwnHome(state)
              ? `${wallet.rentDay} of next season \xB7 then the bank takes your home`
              : ""
            : bill.kind === "upkeep"
              ? "When you can"
              : bill.collections
                ? "In collections: 25% of every shift"
                : `${shortDateWords(state, bill.due)} \xB7 then +20% and collections`),
      hard: bill.kind === "rent" || bill.kind === "mortgage" || bill.collections,
    })),
    lenderIds = [...new Set((state.debts ?? []).filter((debt) => debt.amount > 0).map((debt) => debt.characterId))];
  for (let lenderId of lenderIds) {
    let lender = characterOf(state, lenderId),
      debts = (state.debts ?? []).filter((debt) => debt.characterId === lenderId && debt.amount > 0),
      earliestDue = Math.min(...debts.map((debt) => debt.due)),
      overdue = debts.some((debt) => debt.overdue);
    rows.push({
      id: `loan:${lenderId}`,
      kind: "loan",
      characterId: lenderId,
      name: nameFor(
        state,
        lender ?? {
          id: lenderId,
          name: "Someone",
        },
      ),
      what: `Lent you money (${[...new Set(debts.map((debt) => debt.for))].join(", ")})`,
      amount: amountOwedTo(state, lenderId),
      due: overdue
        ? "Overdue \xB7 no more loans from them"
        : lender?.away
          ? "When they're back"
          : `${shortDateWords(state, earliestDue)} \xB7 then trust drops`,
      hard: overdue,
    });
  }
  return {
    cash: wallet.cash,
    total: rows.reduce((sum, row) => sum + row.amount, 0),
    list: rows,
  };
}
function payBillOrLoan(state, rowId, amount) {
  let [kind, id] = String(rowId ?? "").split(/:(.*)/s),
    result =
      kind === "loan"
        ? payBackFriend(state, id, amount)
        : kind === "bill"
          ? payBill(state.wallet, id, amount, state.minutes)
          : {
              ok: false,
              reason: "There is nothing owed there.",
            };
  if (!result.ok) {
    return result;
  }
  if (kind === "bill") {
    logNote(state, `Paid $${result.paid} \xB7 ${result.bill.label}`, "money");
  }
  if (result.paidOff) {
    logNote(state, "The last mortgage payment: your home is yours", "money");
  }
  let stopped = stopEvictionIfPaid(state);
  return {
    ok: true,
    paid: result.paid,
    left: result.left,
    ...(result.paidOff
      ? {
          paidOff: true,
        }
      : {}),
    ...(stopped
      ? {
          stopped: true,
        }
      : {}),
  };
}
function addHospitalBill(state, amount, label = "Hospital") {
  return amount <= 0
    ? null
    : addBill(state.wallet, {
        kind: "hospital",
        amount: amount,
        label: label,
        at: state.minutes,
        due: state.minutes + HOSPITAL_BILL_DUE_DAYS * MINUTES_IN_DAY,
      });
}
function sendBillsToCollections(state, events) {
  for (let bill of escalateOverdueHospitalBills(state.wallet, state.minutes)) {
    logNote(state, `Hospital bill overdue: $${bill.amount}, in collections`, "money");
    events.push({
      id: "collections",
      amount: bill.amount,
      text: `The hospital bill went to collections: $${bill.amount} (+20%). They take 25% of every shift until it is paid.`,
    });
  }
}
function homeDailyTick(state, events) {
  tickCouchStay(state, events);
  sendBillsToCollections(state, events);
}

export {
  COUCH_BED_QUALITY,
  COUCH_FROM_TIER,
  COUCH_NIGHTS,
  EVICTION_HOUR,
  HOME_ACTS,
  PARTNER_COVER_TRUST_PENALTY,
  ROUGH_BED_QUALITY,
  STREET_PARKING_FEE,
  STREET_SPOT_PLACE,
  addHospitalBill,
  billsView,
  couchFriends,
  evictionView,
  hasGarage,
  hasOwnHome,
  homeDailyTick,
  homeSaleValue,
  homesView,
  jobWords,
  leaveOwnHome,
  leaveTheirHome,
  lodgingKindOf,
  moveHome,
  payBillOrLoan,
  payRentDay,
  rentShareOf,
  rentSharersOf,
  residenceWords,
  returnHomeFromLodging,
  runDueEviction,
  sendBillsToCollections,
  startCouchSurfing,
  stopEvictionIfPaid,
  storeLuxuryFurniture,
  streetSpotOf,
  tickCouchStay,
  withHomeAndWork,
};
