// Friendship perk tiers plus perk-driven help: loans and debts, food at the door, treats/discounts, introductions, keys
import { clockFromMinutes, formatCalendarDate, formatClockTime } from "../time/clock.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { TRAIT_BEHAVIOURS, effectiveTraits } from "../traits/traits.mjs";
import { applyBondAction, bondKind, bondTier, bondTierName, markTraitsSeen } from "./bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "./milestones.mjs";
import { itemDef } from "../items/inventory.mjs";
import { isPileSpoiled } from "../inventory/piles-and-cooking.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { npcPairsOf } from "../network/town-facts.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { earnMoney, housingShareDue, rentSeasonKey, spendMoney } from "../money/wallet.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import { leaveTheirPartyIfAny, ownPartyBlocksReason, sayGoodbyeFirstReason } from "../parties/party.mjs";
import { objectOf, pronounOf } from "../romance/romanceability.mjs";
import { workHomeUntil, workingHome, workingNow } from "../cast/working-now.mjs";
import { atDoorOf, isAsleep } from "../visits/staying-over.mjs";
import { discountOf } from "../shop/store-counter.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  isCharacterHere,
  logNote,
  nameFor,
  sceneBusyReason,
  sharesYourDoor,
  whereOpts,
} from "../game.mjs";

var PERK_MINUTES_PER_DAY = 1440;
var LOAN_DAYS = 14;
var LOAN_OVERDUE_TRUST_PENALTY = -5;
var LOAN_MAX = 700;
var HOSPITAL_BILL_FRIEND_SHARE = 0.4;
var TREAT_EVERY_DAYS = 7;
var FOOD_DOOR_HUNGER = 20;
var FOOD_DOOR_GIVES = 40;
var perkArchetypeOf = (bond) => effectiveTraits(bond);
var possessivePronounOf = (state, characterId) =>
  ({
    She: "her",
    He: "his",
  })[pronounOf(state, characterId)] ?? "their";
var perkFriendshipOf = (bond) => bondTier(bond, "friendship");
var isRomanticPartnerBond = (bond) => MILESTONE_COUPLE_STATUSES.includes(bond?.status);
var PARTNER_PERK_TIER = 2;
var perkTierOf = (bond) =>
  isRomanticPartnerBond(bond) ? Math.max(perkFriendshipOf(bond), PARTNER_PERK_TIER) : perkFriendshipOf(bond);
var helpPerkTier = (bond) => TRAIT_BEHAVIOURS.helpTier(perkArchetypeOf(bond));
var FRIEND_PERKS = [
  {
    id: "invite",
    tier: 1,
    text: (object, pronoun, possessive, romanticKind) =>
      romanticKind ? `Invite ${object} out` : `Invite ${object} out, as friends`,
  },
  {
    id: "discount",
    tier: 2,
    text: (object, pronoun) => `\u221210% wherever ${pronoun} ${conjugateForPronoun(pronoun, "works")}`,
  },
  {
    id: "week",
    tier: 2,
    text: (object, pronoun, possessive) =>
      `${capitalizeFirst(possessive)} whole week, on ${possessive} sheet (${pronoun} ${conjugateForPronoun(pronoun, "tells")} you)`,
  },
  {
    id: "introduce",
    tier: 2,
    text: (object, pronoun) => `${capitalizeFirst(pronoun)} can introduce you to people`,
  },
  {
    id: "knock",
    tier: 2,
    text: (object, pronoun, possessive) => `Knock on ${possessive} door`,
  },
  {
    id: "help",
    tier: 3,
    text: () => "Help when you need it: rent, food, the hospital (a loan)",
  },
  {
    id: "tastes",
    tier: 3,
    text: (object, pronoun, possessive) => `What the people close to ${object} like as gifts`,
  },
  {
    id: "treat",
    tier: 4,
    text: (object, pronoun) => `Sometimes ${pronoun} ${conjugateForPronoun(pronoun, "treats")} you`,
  },
  {
    id: "key",
    tier: 4,
    text: (object, pronoun, possessive) => `The key to ${possessive} place`,
  },
  {
    id: "side",
    tier: 4,
    text: (object, pronoun) => `${capitalizeFirst(pronoun)} ${conjugateForPronoun(pronoun, "takes")} your side`,
  },
];
var capitalizeFirst = (text) => text[0].toUpperCase() + text.slice(1);
var conjugateForPronoun = (pronoun, verb) => (pronoun === "they" ? verb.replace(/s$/, "") : verb);
var perkRequiredTier = (perk, bond) => (perk.id === "help" ? helpPerkTier(bond) : perk.tier);
function hasFriendPerk(state, characterId, perkId) {
  let bond = bondOf(state, characterId);
  if (!bond || !hasMet2(state, characterId) || characterOf(state, characterId)?.away) {
    return false;
  }
  let perk = FRIEND_PERKS.find((entry) => entry.id === perkId);
  return perk
    ? perkId === "help" && isRomanticPartnerBond(bond)
      ? true
      : perkTierOf(bond) >= perkRequiredTier(perk, bond)
    : false;
}
var perkTextArgs = (state, characterId) => [
  objectOf(state, characterId),
  pronounOf(state, characterId).toLowerCase(),
  possessivePronounOf(state, characterId),
  bondKind(bondOf(state, characterId)),
];
function buildPerksView(state, characterId) {
  let bond = bondOf(state, characterId);
  if (!bond || !hasMet2(state, characterId)) {
    return null;
  }
  let textArgs = perkTextArgs(state, characterId),
    friendshipTier = perkFriendshipOf(bond),
    perkTier = perkTierOf(bond);
  return {
    tier: bondTierName(bond, "friendship", friendshipTier),
    tiers: [1, 2, 3, 4].map((tier) => ({
      name: bondTierName(bond, "friendship", tier).toUpperCase(),
      reached: perkTier >= tier,
      perks: FRIEND_PERKS.filter((perk) => perkRequiredTier(perk, bond) === tier).map((perk) => perk.text(...textArgs)),
    })),
    partnerHelps: isRomanticPartnerBond(bond) && friendshipTier < helpPerkTier(bond),
    debt: debtSummaryWith(state, characterId),
  };
}
function newPerksAtTier(state, characterId, tier) {
  let bond = bondOf(state, characterId);
  if (!bond) {
    return [];
  }
  let textArgs = perkTextArgs(state, characterId);
  return FRIEND_PERKS.filter((perk) => perkRequiredTier(perk, bond) === tier).map((perk) => perk.text(...textArgs));
}
var openDebtsTo = (state, characterId) =>
  (state.debts ?? []).filter((debt) => debt.characterId === characterId && debt.amount > 0);
var amountOwedTo = (state, characterId) => openDebtsTo(state, characterId).reduce((sum, debt) => sum + debt.amount, 0);
var hasOverdueDebtTo = (state, characterId) => openDebtsTo(state, characterId).some((debt) => debt.overdue);
function debtSummaryWith(state, characterId) {
  let debts = openDebtsTo(state, characterId);
  if (!debts.length) {
    return null;
  }
  let earliestDue = Math.min(...debts.map((debt) => debt.due));
  return {
    amount: amountOwedTo(state, characterId),
    due: formatCalendarDate(earliestDue, {
      from: state.startedAt,
    }).replace(/ · Year \d+$/, ""),
    overdue: debts.some((debt) => debt.overdue),
    for: debts.map((debt) => debt.for),
  };
}
function recordDebt(state, characterId, amount, reason) {
  state.debts ??= [];
  state.debts.push({
    characterId: characterId,
    amount: amount,
    for: reason,
    at: state.minutes,
    due: state.minutes + LOAN_DAYS * PERK_MINUTES_PER_DAY,
    overdue: false,
  });
}
var debtWith = (state, characterId) => debtSummaryWith(state, characterId);
function loanOfferFrom(state, characterId) {
  if (bondOf(state, characterId)?.status === "ex") {
    return {
      max: 0,
      why: "ex",
    };
  }
  if (!hasFriendPerk(state, characterId, "help")) {
    return {
      max: 0,
      why: "far",
    };
  }
  if (hasOverdueDebtTo(state, characterId)) {
    return {
      max: 0,
      why: "overdue",
    };
  }
  let room = Math.max(0, LOAN_MAX - amountOwedTo(state, characterId));
  return room > 0
    ? {
        max: room,
        days: LOAN_DAYS,
      }
    : {
        max: 0,
        why: "full",
      };
}
function borrowFromFriend(state, characterId, amount) {
  let lenderName = nameFor(state, characterOf(state, characterId));
  earnMoney(state.wallet, amount, `Lent by ${lenderName}`, state.minutes);
  recordDebt(state, characterId, amount, "a loan");
  logNote(state, `${lenderName} lent you $${amount}`, "money");
  return {
    amount: amount,
    due: formatCalendarDate(state.minutes + LOAN_DAYS * PERK_MINUTES_PER_DAY, {
      from: state.startedAt,
    }).replace(/ · Year \d+$/, ""),
  };
}
function payBackFriend(state, characterId, maxAmount = 1 / 0) {
  let owed = amountOwedTo(state, characterId);
  if (!owed) {
    return {
      ok: false,
      reason: "You owe them nothing.",
    };
  }
  let payAmount = Math.min(owed, Math.floor(maxAmount), state.wallet.cash);
  if (payAmount <= 0) {
    return {
      ok: false,
      reason: "You have no money to pay it back.",
    };
  }
  let payment = spendMoney(
    state.wallet,
    payAmount,
    `Paid back ${nameFor(state, characterOf(state, characterId))}`,
    state.minutes,
  );
  if (!payment.ok) {
    return {
      ok: false,
      reason: payment.reason,
    };
  }
  let remaining = payAmount;
  for (let debt of openDebtsTo(state, characterId).sort((first, second) => first.due - second.due)) {
    let portion = Math.min(remaining, debt.amount);
    if (((debt.amount -= portion), (remaining -= portion), !remaining)) {
      break;
    }
  }
  state.debts = (state.debts ?? []).filter((debt) => debt.amount > 0);
  logNote(state, `Paid back $${payAmount} to ${nameFor(state, characterOf(state, characterId))}`, "money");
  return {
    ok: true,
    paid: payAmount,
    left: amountOwedTo(state, characterId),
  };
}
function settleDebtTo(state, characterId, amount) {
  let remaining = Math.max(0, Math.floor(amount)),
    owedBefore = amountOwedTo(state, characterId);
  for (let debt of openDebtsTo(state, characterId).sort((first, second) => first.due - second.due)) {
    let portion = Math.min(remaining, debt.amount);
    if (((debt.amount -= portion), (remaining -= portion), !remaining)) {
      break;
    }
  }
  state.debts = (state.debts ?? []).filter((debt) => debt.amount > 0);
  return owedBefore - amountOwedTo(state, characterId);
}
function holdDebtsWhileAway(state, characterId, hold) {
  for (let debt of state.debts ?? []) {
    if (!(debt.characterId !== characterId || debt.amount <= 0)) {
      if (hold) {
        debt.heldSince ??= state.minutes;
      } else if (debt.heldSince !== undefined) {
        debt.due += state.minutes - debt.heldSince;
        delete debt.heldSince;
      }
    }
  }
}
function tickDebts(state, events) {
  for (let debt of state.debts ?? []) {
    if (debt.amount <= 0) {
      continue;
    }
    if (characterOf(state, debt.characterId)?.away) {
      debt.heldSince ??= state.minutes;
      continue;
    }
    if (
      (debt.heldSince !== undefined && holdDebtsWhileAway(state, debt.characterId, false),
      debt.overdue || state.minutes < debt.due)
    ) {
      continue;
    }
    debt.overdue = true;
    let bond = bondOf(state, debt.characterId);
    if (bond) {
      bond.trust = Math.max(0, bond.trust + LOAN_OVERDUE_TRUST_PENALTY);
    }
    let lenderName = nameFor(
      state,
      characterOf(state, debt.characterId) ?? {
        id: debt.characterId,
        name: "Someone",
      },
    );
    events.push({
      id: "debt-overdue",
      characterId: debt.characterId,
      text: `You did not pay ${lenderName} back the $${debt.amount} in time.`,
    });
  }
}
var loanRoomLeft = (state, characterId) => Math.max(0, LOAN_MAX - amountOwedTo(state, characterId));
function bestFriendLender(state) {
  let lenders = castInTown(state).filter(
      (character) =>
        hasFriendPerk(state, character.id, "help") &&
        bondOf(state, character.id)?.status !== "ex" &&
        !hasOverdueDebtTo(state, character.id) &&
        loanRoomLeft(state, character.id) > 0,
    ),
    lenderScore = (character) => {
      let bond = bondOf(state, character.id);
      return (isRomanticPartnerBond(bond) ? 1e3 : 0) + bond.friendship;
    };
  return lenders.sort((first, second) => lenderScore(second) - lenderScore(first))[0] ?? null;
}
function friendCoversRent(state, { sharedWith: opts = 0 } = {}) {
  let wallet = state.wallet;
  if (clockFromMinutes(state.minutes).day < wallet.rentDay || wallet.rentPaidThrough === rentSeasonKey(state.minutes)) {
    return null;
  }
  let shortfall =
    housingShareDue(wallet, {
      sharedWith: opts,
    }) - wallet.cash;
  if (shortfall <= 0) {
    return null;
  }
  let lender = bestFriendLender(state);
  if (!lender) {
    return null;
  }
  let covered = Math.min(shortfall, loanRoomLeft(state, lender.id));
  wallet.cash += covered;
  wallet.ledger.push({
    at: state.minutes,
    amount: covered,
    label: `Lent by ${lender.name}`,
    balance: wallet.cash,
  });
  recordDebt(state, lender.id, covered, "rent");
  let lenderName = nameFor(state, lender);
  logNote(state, `${lenderName} covered $${covered} of the rent (a loan)`, "money");
  let stillShort = shortfall - covered;
  return {
    id: "helped",
    kind: "rent",
    characterId: lender.id,
    name: lenderName,
    amount: covered,
    short: stillShort,
    text: `${lenderName} covered $${covered} of the rent${stillShort ? `, but you are still $${stillShort} short` : ""}. You owe ${objectOf(state, lender.id)} $${covered}.`,
  };
}
function friendCoversHospital(state, bill) {
  let lender = bestFriendLender(state);
  if (!lender) {
    return null;
  }
  let covered = Math.min(Math.round(bill * HOSPITAL_BILL_FRIEND_SHARE), loanRoomLeft(state, lender.id));
  recordDebt(state, lender.id, covered, "hospital");
  return {
    characterId: lender.id,
    name: nameFor(state, lender),
    paid: covered,
  };
}
var hasFoodToEat = (state) =>
  [...(state.things?.fridge ?? []), ...(state.things?.bag ?? [])].some(
    (pile) =>
      pile.n > 0 &&
      itemDef(state.things, pile.item)?.kind === "food" &&
      itemDef(state.things, pile.item)?.eat &&
      !isPileSpoiled(pile),
  );
function rollFoodDoorVisit(state) {
  if (
    state.at !== "home" ||
    state.visit ||
    state.approach ||
    state.foodDoor ||
    (state.scene && !state.scene.done) ||
    state.outing
  ) {
    return false;
  }
  let today = clockFromMinutes(state.minutes).dayIndex;
  if (state.foodDay === today) {
    return false;
  }
  let bringer = castInTown(state)
    .filter(
      (character) =>
        hasFriendPerk(state, character.id, "help") &&
        !isAsleep(state, character.id) &&
        !workingNow(state, character) &&
        !workingHome(state, character),
    )
    .sort(
      (first, second) =>
        TRAIT_BEHAVIOURS.bringsFood(perkArchetypeOf(bondOf(state, second.id))) -
          TRAIT_BEHAVIOURS.bringsFood(perkArchetypeOf(bondOf(state, first.id))) ||
        bondOf(state, second.id).friendship - bondOf(state, first.id).friendship,
    )[0];
  if (!bringer) {
    return false;
  }
  let hungerThreshold = TRAIT_BEHAVIOURS.bringsFood(perkArchetypeOf(bondOf(state, bringer.id)))
    ? FOOD_DOOR_HUNGER + 10
    : FOOD_DOOR_HUNGER;
  return state.needs.hunger > hungerThreshold || hasFoodToEat(state)
    ? false
    : ((state.foodDay = today),
      (state.foodDoor = {
        characterId: bringer.id,
        at: state.minutes,
      }),
      markTraitsSeen(bondOf(state, bringer.id), "caring"),
      true);
}
function foodDoorView(state) {
  let foodDoor = state.foodDoor,
    character = foodDoor ? characterOf(state, foodDoor.characterId) : null;
  return character
    ? {
        characterId: character.id,
        name: nameFor(state, character),
        food: true,
        says: "BROUGHT YOU SOMETHING TO EAT",
        line: foodDoor.line ?? null,
        unit: state.residence?.unit ?? "",
      }
    : null;
}
function answerFoodDoor(state, comeIn, { eat: opts }) {
  let foodDoor = state.foodDoor;
  if (!foodDoor) {
    return null;
  }
  state.foodDoor = null;
  let character = characterOf(state, foodDoor.characterId),
    friendName = nameFor(state, character);
  opts(FOOD_DOOR_GIVES);
  return comeIn
    ? (applyBondAction(
        bondOf(state, character.id),
        {
          action: "time",
          friendship: 2,
        },
        {
          at: state.minutes,
          today: false,
          share: "event",
          note: "brought you food",
        },
      ),
      {
        ok: true,
        food: true,
        said: `${friendName} came in with food. You ate together.`,
      })
    : {
        ok: true,
        food: true,
        said: `${friendName} left it at the door. You ate.`,
      };
}
var coworkersOnShiftAt = (state, placeId = state.at, exceptId = null) =>
  isPlaceOpen(townPlace(state.town, placeId), state.minutes)
    ? state.characters.filter(
        (character) =>
          !character.away &&
          character.id !== exceptId &&
          character.job?.place === placeId &&
          workingNow(state, character),
      )
    : [];
function priceWithFriendPerks(state, price, { place: opts = state.at, except: exceptId = null } = {}) {
  if (!price) {
    return {
      costs: price,
    };
  }
  let coworkers = coworkersOnShiftAt(state, opts, exceptId),
    treater = coworkers.find(
      (character) =>
        hasFriendPerk(state, character.id, "treat") &&
        (bondOf(state, character.id).treatAt ?? -1 / 0) <= state.minutes - TREAT_EVERY_DAYS * PERK_MINUTES_PER_DAY,
    );
  if (treater) {
    return {
      costs: 0,
      was: price,
      treat: {
        id: treater.id,
        name: nameFor(state, treater),
      },
    };
  }
  let bestDiscount = coworkers
    .map((character) => ({
      c: character,
      d: discountOf(state, character),
    }))
    .filter((entry) => entry.d.off)
    .sort((first, second) => second.d.off - first.d.off)[0];
  return bestDiscount
    ? {
        costs: Math.round(price * (1 - bestDiscount.d.off / 100)),
        was: price,
        discount: {
          off: bestDiscount.d.off,
          name: nameFor(state, bestDiscount.c),
        },
      }
    : {
        costs: price,
      };
}
function markFriendTreatUsed(state, priced) {
  if (priced?.treat) {
    bondOf(state, priced.treat.id).treatAt = state.minutes;
    logNote(state, `${priced.treat.name} treated you`, "money");
  }
}
function introducablePeopleOf(state, characterId) {
  return npcPairsOf(state, characterId)
    .filter(
      (pair) =>
        ["friends", "close", "family", "couple"].includes(pair.kind) &&
        characterOf(state, pair.other) &&
        !characterOf(state, pair.other).away &&
        !hasMet2(state, pair.other),
    )
    .map((pair) => ({
      id: pair.other,
      name: characterOf(state, pair.other).name,
      ...characterPortrait(characterOf(state, pair.other), state),
      rel: pair.detail ?? pair.kind,
      here: isCharacterHere(state, pair.other),
    }));
}
function meetThroughFriend(state, characterId, introducerId) {
  let bond = bondOf(state, characterId);
  if (!bond || hasMet2(state, characterId)) {
    return null;
  }
  bond.met = true;
  bond.metAt = state.minutes;
  let targetName = characterOf(state, characterId).name,
    introducerName = nameFor(state, characterOf(state, introducerId));
  logNote(state, `${introducerName} introduced you to ${targetName}`, "social");
  return {
    id: "introduced",
    characterId: characterId,
    by: introducerId,
    text: `${introducerName} introduced you to ${targetName}.`,
  };
}
function askForIntroduction(state, friendId, targetId) {
  if (!hasFriendPerk(state, friendId, "introduce")) {
    return {
      ok: false,
      reason: "You are not close enough for that.",
    };
  }
  if (!introducablePeopleOf(state, friendId).some((person) => person.id === targetId)) {
    return {
      ok: false,
      reason: "They cannot introduce you to them.",
    };
  }
  if (isCharacterHere(state, targetId)) {
    let introEvent = meetThroughFriend(state, targetId, friendId);
    return {
      ok: true,
      met: true,
      events: introEvent ? [introEvent] : [],
    };
  }
  state.introPending = {
    ...(state.introPending ?? {}),
    [targetId]: {
      by: friendId,
      at: state.minutes,
    },
  };
  let targetName = characterOf(state, targetId).name;
  return {
    ok: true,
    met: false,
    said: `${nameFor(state, characterOf(state, friendId))} will introduce you to ${targetName} when you cross paths.`,
    events: [],
  };
}
function introductionsHere(state) {
  if ((state.scene && !state.scene.done) || state.visit || state.outing) {
    return [];
  }
  let events = [];
  for (let [targetId, pending] of Object.entries(state.introPending ?? {})) {
    if (hasMet2(state, targetId)) {
      delete state.introPending[targetId];
      continue;
    }
    if (!isCharacterHere(state, targetId)) {
      continue;
    }
    let introEvent = meetThroughFriend(state, targetId, pending.by);
    if (introEvent) {
      events.push({
        ...introEvent,
        text: `You met ${characterOf(state, targetId).name}: ${nameFor(state, characterOf(state, pending.by))} had told them about you.`,
      });
    }
    delete state.introPending[targetId];
  }
  let today = String(clockFromMinutes(state.minutes).dayIndex);
  for (let friend of castInTown(state)) {
    if (
      !isCharacterHere(state, friend.id) ||
      !hasFriendPerk(state, friend.id, "introduce") ||
      isAsleep(state, friend.id)
    ) {
      continue;
    }
    let bond = bondOf(state, friend.id);
    if (bond.introDay === today) {
      continue;
    }
    let person = introducablePeopleOf(state, friend.id).find((entry) => entry.here);
    if (
      !person ||
      ((bond.introDay = today),
      seededRandom(state.seed, friend.id, today, "introduce") >= TRAIT_BEHAVIOURS.introChance(perkArchetypeOf(bond)))
    ) {
      continue;
    }
    let introEvent = meetThroughFriend(state, person.id, friend.id);
    if (introEvent) {
      events.push(introEvent);
      markTraitsSeen(bond, "open");
    }
  }
  return events;
}
function useFriendKey(state, characterId) {
  if (!hasFriendPerk(state, characterId, "key")) {
    return {
      ok: false,
      reason: "You do not have their key.",
    };
  }
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (ownPartyBlocksReason(state)) {
    return {
      ok: false,
      reason: ownPartyBlocksReason(state),
    };
  }
  if (sayGoodbyeFirstReason(state)) {
    return {
      ok: false,
      reason: sayGoodbyeFirstReason(state),
    };
  }
  let character = characterOf(state, characterId),
    placeId = character?.residence?.place;
  if (!placeId || !atDoorOf(state, placeId)) {
    return {
      ok: false,
      reason: "You are not at their door.",
    };
  }
  if (sharesYourDoor(state, character)) {
    return {
      ok: false,
      reason: "That is your own door.",
    };
  }
  if (whereaboutsOf(character, state.minutes, whereOpts(state)).place !== "home") {
    return {
      ok: false,
      reason: "Nobody is home.",
    };
  }
  if (isAsleep(state, characterId)) {
    return {
      ok: false,
      reason: "They are asleep.",
    };
  }
  if (workingHome(state, character)) {
    return {
      ok: false,
      reason: `Working until ${formatClockTime(workHomeUntil(state, character))}.`,
    };
  }
  let leaveEvent = leaveTheirPartyIfAny(state);
  state.visit = {
    characterId: characterId,
    stage: "inside",
    invite: {
      yes: true,
      why: "You have the key",
    },
    at: state.minutes,
    key: true,
  };
  state.at = character.residence.place;
  logNote(state, `Let yourself into ${nameFor(state, character)}'s place`, "move");
  return {
    ok: true,
    events: leaveEvent ? [leaveEvent] : [],
  };
}
function defenderAgainst(state, characterId) {
  for (let friend of castInTown(state)) {
    if (friend.id === characterId || !hasFriendPerk(state, friend.id, "side")) {
      continue;
    }
    let pair = npcPairBetween(state, friend.id, characterId);
    if (pair && ["friends", "close", "family", "couple"].includes(pair.kind)) {
      return friend.id;
    }
  }
  return null;
}
var keepsSecretFor = (state, characterId) => hasFriendPerk(state, characterId, "side");
function friendCircleTastes(state, characterId) {
  return hasFriendPerk(state, characterId, "tastes")
    ? npcPairsOf(state, characterId)
        .filter(
          (pair) =>
            ["friends", "close", "family", "couple"].includes(pair.kind) &&
            hasMet2(state, pair.other) &&
            characterOf(state, pair.other)?.tastes,
        )
        .slice(0, 6)
        .map((pair) => {
          let character = characterOf(state, pair.other);
          return {
            id: character.id,
            name: nameFor(state, character),
            ...characterPortrait(character, state),
            loves: character.tastes.loves ?? [],
            likes: character.tastes.likes ?? [],
          };
        })
    : null;
}
var tellsTheirWeek = (state, characterId) => hasFriendPerk(state, characterId, "week");

export {
  FOOD_DOOR_GIVES,
  FOOD_DOOR_HUNGER,
  FRIEND_PERKS,
  HOSPITAL_BILL_FRIEND_SHARE,
  LOAN_DAYS,
  LOAN_MAX,
  LOAN_OVERDUE_TRUST_PENALTY,
  PARTNER_PERK_TIER,
  TREAT_EVERY_DAYS,
  amountOwedTo,
  answerFoodDoor,
  askForIntroduction,
  borrowFromFriend,
  buildPerksView,
  debtWith,
  defenderAgainst,
  foodDoorView,
  friendCircleTastes,
  friendCoversHospital,
  friendCoversRent,
  hasFriendPerk,
  helpPerkTier,
  holdDebtsWhileAway,
  introducablePeopleOf,
  introductionsHere,
  keepsSecretFor,
  loanOfferFrom,
  markFriendTreatUsed,
  meetThroughFriend,
  newPerksAtTier,
  payBackFriend,
  perkTierOf,
  priceWithFriendPerks,
  recordDebt,
  rollFoodDoorVisit,
  settleDebtTo,
  tellsTheirWeek,
  tickDebts,
  useFriendKey,
};
