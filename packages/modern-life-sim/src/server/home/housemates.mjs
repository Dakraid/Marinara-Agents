// Living together: housemate rooms, moving in/out, room rent, groceries, housemate moments
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { nextFreeUnit } from "../housing/residences.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { bondTier, bondTierName, breakUpBond } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { milestoneSceneMinutes } from "../relationships/milestone-steps.mjs";
import { addToPiles, itemDef } from "../items/inventory.mjs";
import { isPileSpoiled, takeOneFromPile } from "../inventory/piles-and-cooking.mjs";
import { earnMoney, homeKindOf, normalizeHomeKind } from "../money/wallet.mjs";
import { addMemory } from "../people/people-sheet.mjs";
import { cookedForParty } from "../parties/house-party.mjs";
import { hasOwnHome, leaveTheirHome } from "./residence.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { coupleOf } from "../romance/jealousy.mjs";
import { workingHome } from "../cast/working-now.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import {
  bondOf,
  characterOf,
  hasMet2,
  livingWithYou,
  logNote,
  nameFor,
  sharesYourDoor,
  traitsOf,
  whereOpts,
} from "../game.mjs";

function addHomeMemory(state, characterId, memoryText) {
  let character = characterOf(state, characterId);
  if (character) {
    addMemory(character, {
      at: state.minutes,
      text: memoryText(state.persona?.name || "the player"),
      from: "home",
    });
  }
}
var MINUTES_PER_DAY2 = 1440;
var MATE_FROM_TIER = 3;
var MATE_FAMILY_TIER = 2;
var MATE_STAYS_TIER = 2;
var MATE_AGAIN_DAYS = 10;
var MATE_AFTER_EX_DAYS = 30;
var MATE_ASK_CHANCE_BY_SETTLED = [0.05, 0.025, 0.01, 0];
var DEFAULT_SETTLED_LEVEL = 1;
var MATE_OUT_COST = {
  good: -3,
  bad: -8,
};
var MATE_IN_GAIN = 3;
var roomsInHome = (homeKind) => homeKindOf(homeKind).rooms ?? 1;
function housematesOf(state) {
  if (!hasOwnHome(state)) {
    return [];
  }
  let partnerIds = livingWithYou(state).map((entry) => entry.characterId);
  return state.characters.filter(
    (character) => !character.away && !partnerIds.includes(character.id) && sharesYourDoor(state, character),
  );
}
var roomsTakenBy = (mateCount, partnerCount) => mateCount + Math.max(0, partnerCount - 1);
var roomsLeftAtHome = (state) =>
  hasOwnHome(state)
    ? roomsInHome(state.wallet.home) - roomsTakenBy(housematesOf(state).length, livingWithYou(state).length)
    : 0;
var roomForPartner = (state) => hasOwnHome(state) && (livingWithYou(state).length === 0 || roomsLeftAtHome(state) >= 1);
function livesAlone(state, characterId) {
  let character = characterOf(state, characterId),
    residence = character?.residence;
  return !residence || sharesYourDoor(state, character)
    ? false
    : !state.characters.some(
        (other) =>
          other.id !== characterId &&
          !other.away &&
          other.residence?.place === residence.place &&
          other.residence?.unit === residence.unit,
      );
}
var settledLevelOf = (character) => (Number.isFinite(character?.settled) ? character.settled : DEFAULT_SETTLED_LEVEL);
var mateTierFor = (bond) => (bond.kin ? MATE_FAMILY_TIER : MATE_FROM_TIER);
function mateInGreyedOut(state, characterId) {
  let character = characterOf(state, characterId),
    bond = bondOf(state, characterId),
    reason = mateInBlockReason(state, characterId);
  return !reason ||
    !character ||
    character.away ||
    !bond ||
    !hasMet2(state, characterId) ||
    !hasOwnHome(state) ||
    sharesYourDoor(state, character) ||
    MILESTONE_COUPLE_STATUSES.includes(bond.status) ||
    bondTier(bond, "friendship") < mateTierFor(bond) - 1
    ? null
    : {
        ok: false,
        why: reason,
      };
}
function mateInBlockReason(state, characterId) {
  let character = characterOf(state, characterId),
    bond = bondOf(state, characterId);
  if (!character || character.away || !bond || !hasMet2(state, characterId)) {
    return "You have not met.";
  }
  if (!hasOwnHome(state)) {
    return "You have no home.";
  }
  if (sharesYourDoor(state, character)) {
    return "You live together.";
  }
  let hostChar = livingAtTheirPlace(state);
  return hostChar
    ? `It's ${nameFor(state, hostChar)}'s place: not yours to offer.`
    : MILESTONE_COUPLE_STATUSES.includes(bond.status)
      ? "You're together: moving in is a step of your relationship."
      : bond.status === "ex" && (bond.brokeUp?.at ?? -1 / 0) > state.minutes - MATE_AFTER_EX_DAYS * MINUTES_PER_DAY2
        ? "You broke up not long ago."
        : bondTier(bond, "friendship") < mateTierFor(bond)
          ? bond.kin
            ? "You need to be closer first."
            : `Your friendship has to reach ${bondTierName(bond, "friendship", mateTierFor(bond))}.`
          : livesAlone(state, characterId)
            ? roomsLeftAtHome(state) < 1
              ? "There is no room left at yours."
              : (bond.milestoneRetry?.["mate-in"] ?? 0) > state.minutes
                ? bond.mateNoBy === "you"
                  ? "You told them no not long ago."
                  : "They said no not long ago."
                : ""
            : "They live with someone.";
}
function livingAtTheirPlace(state) {
  if (!hasOwnHome(state)) {
    return null;
  }
  for (let entry of livingWithYou(state)) {
    let character = characterOf(state, entry.characterId);
    if (character && sharesYourDoor(state, character) && !character.residence?.withYou) {
      return character;
    }
  }
  return null;
}
var agreesToMoveIn = (state, bond, yes) => yes && settledLevelOf(characterOf(state, bond.characterId)) < 3;
function breakUpWith(state, bond, { at = state.minutes, how = "" } = {}, events = []) {
  breakUpBond(bond, {
    at: at,
    how: how,
  });
  let character = characterOf(state, bond.characterId),
    partyGuest = state.party?.guests?.[bond.characterId];
  if (
    (partyGuest &&
      !partyGuest.gone &&
      state.party.host !== bond.characterId &&
      ((partyGuest.gone = state.minutes), state.party.left?.push(bond.characterId)),
    !character || character.away || !hasOwnHome(state) || !sharesYourDoor(state, character))
  ) {
    return events;
  }
  let exName = nameFor(state, character);
  if (character.residence?.withYou) {
    moveOutToOwnPlace(state, character.id);
    addHomeMemory(
      state,
      character.id,
      (playerName) => `${playerName} and I broke up, and I moved out of the place we shared.`,
    );
    logNote(state, `${exName} moved out`, "move");
    events.push({
      id: "moved-out",
      characterId: character.id,
      who: "them",
      text: `${exName} moved out.`,
    });
  } else {
    addHomeMemory(
      state,
      character.id,
      (playerName) => `${playerName} and I broke up, and ${playerName} moved out of my place.`,
    );
    events.push(leaveTheirHome(state, character.id));
  }
  return events;
}
function moveInWithYou(state, characterId) {
  let character = characterOf(state, characterId);
  return !character || !hasOwnHome(state)
    ? false
    : ((character.residence = {
        place: state.residence.place,
        unit: state.residence.unit,
        withYou: true,
        from: character.residence?.withYou
          ? (character.residence.from ?? "apartments")
          : (character.residence?.place ?? "apartments"),
      }),
      true);
}
function moveOutToOwnPlace(state, characterId) {
  let character = characterOf(state, characterId);
  if (!character) {
    return false;
  }
  let bond = bondOf(state, characterId);
  if (bond) {
    bond.mateReached = false;
  }
  let placeId =
      character.residence?.from ??
      (character.residence?.place === state.residence?.place ? character.residence.place : "apartments"),
    takenUnits = [
      ...state.characters
        .filter((other) => other.id !== characterId && other.residence?.place === placeId)
        .map((other) => other.residence.unit),
      ...(state.residence?.place === placeId ? [state.residence.unit] : []),
    ];
  character.residence = {
    place: placeId,
    unit: nextFreeUnit(placeId, takenUnits),
  };
  return true;
}
function mateAskWeight(state, characterId) {
  let traits = traitsOf(state, characterId);
  return !traits ||
    traits.flags.includes("reserved") ||
    traits.flags.includes("freeSpirit") ||
    traits.dials.initiative < 3
    ? 0
    : 0.5 + (traits.dials.open + traits.dials.attention + traits.dials.caring) / 30;
}
function rollMateInAsk(state, day) {
  if (!(roomsLeftAtHome(state) < 1 || Object.values(state.bonds ?? {}).some((bond) => bond.asks?.id === "mate-in"))) {
    for (let [characterId, bond] of Object.entries(state.bonds ?? {})) {
      if (bond.asks || mateInBlockReason(state, characterId)) {
        continue;
      }
      let chance =
        (MATE_ASK_CHANCE_BY_SETTLED[settledLevelOf(characterOf(state, characterId))] ?? 0) *
        mateAskWeight(state, characterId);
      if (!(!chance || seededRandom(state.seed, characterId, String(day), "mate-in") >= chance)) {
        bond.asks = {
          id: "mate-in",
          at: state.minutes,
          due: approachDue(bond, state.minutes),
        };
        return;
      }
    }
  }
}
var PARTNER_TOGETHER_DAYS = 30;
var PARTNER_TOGETHER_CHANCE = 0.05;
function tickHousemates(state, events) {
  let today = String(Math.floor(state.minutes / MINUTES_PER_DAY2)),
    sceneCast = state.scene && !state.scene.done ? eventCast(state.scene) : [];
  for (let mate of housematesOf(state)) {
    let bond = bondOf(state, mate.id);
    if (bond?.kin || sceneCast.includes(mate.id)) {
      continue;
    }
    let mateName = nameFor(state, mate),
      friendshipTier = bond ? bondTier(bond, "friendship") : 0;
    if (
      (bond && friendshipTier >= MATE_STAYS_TIER && (bond.mateReached = true),
      bond?.mateReached && friendshipTier < MATE_STAYS_TIER)
    ) {
      moveOutToOwnPlace(state, mate.id);
      addHomeMemory(
        state,
        mate.id,
        (playerName) => `I moved out of ${playerName}'s place: things between us weren't the same any more.`,
      );
      logNote(state, `${mateName} moved out`, "move");
      events.push({
        id: "mate-left",
        characterId: mate.id,
        name: mateName,
        why: "friendship",
        text: `${mateName} moved out: things between you weren't the same.`,
      });
      continue;
    }
    let couple = coupleOf(state, mate.id),
      partner = couple && !couple.secret ? characterOf(state, couple.a === mate.id ? couple.b : couple.a) : null;
    if (!(
      !partner ||
      partner.away ||
      !livesAlone(state, partner.id) ||
      state.minutes - (couple.since ?? state.minutes) < PARTNER_TOGETHER_DAYS * MINUTES_PER_DAY2 ||
      seededRandom(state.seed, mate.id, today, "together") >= PARTNER_TOGETHER_CHANCE
    )) {
      mate.residence = {
        place: partner.residence.place,
        unit: partner.residence.unit,
      };
      if (bond) {
        bond.mateReached = false;
      }
      addHomeMemory(
        state,
        mate.id,
        (playerName) => `I moved out of ${playerName}'s place to live with ${partner.name}.`,
      );
      logNote(state, `${mateName} moved in with ${nameFor(state, partner)}`, "move");
      events.push({
        id: "mate-left",
        characterId: mate.id,
        name: mateName,
        why: "partner",
        with: nameFor(state, partner),
        text: `${mateName} moved in with ${nameFor(state, partner)}.`,
      });
    }
  }
}
var ROOM_RENT_SHARE = 0.1;
var roomPayFor = (homeKind) => Math.round(homeKindOf(homeKind).rent * ROOM_RENT_SHARE);
var ownsCurrentHome = (state) => {
  let wallet = state.wallet,
    homeKind = normalizeHomeKind(wallet.home);
  return wallet.owns === homeKind || wallet.mortgage?.kind === homeKind;
};
var housematesPayTotal = (state) =>
  hasOwnHome(state) && ownsCurrentHome(state) ? roomPayFor(state.wallet.home) * housematesOf(state).length : 0;
function collectHousemateRent(state, events) {
  let total = housematesPayTotal(state);
  if (!total) {
    return;
  }
  let names = housematesOf(state).map((mate) => nameFor(state, mate));
  earnMoney(state.wallet, total, "Your housemates, for their rooms", state.minutes);
  logNote(state, `${names.join(" and ")} paid you for their rooms: $${total}`, "money");
  events.push({
    id: "mates-paid",
    amount: total,
    text: `${names.join(" and ")} paid you for ${names.length > 1 ? "their rooms" : "their room"}: $${total}.`,
  });
}
var HOUSEMATE_GROCERIES = [
  ["eggs", 6],
  ["rice", 4],
  ["vegetables", 2],
  ["pasta", 2],
  ["fruit", 2],
];
var GROCERIES_EVERY_DAYS = 7;
var FRIDGE_EMPTY_DAYS = 3;
var isHousemateEdible = (things, pile) => {
  let def = itemDef(things, pile.item);
  return !!def?.eat && (!def.gift || !!def.homemade) && !isPileSpoiled(pile);
};
var isHomemadeFood = (things, pile) => !!itemDef(things, pile.item)?.homemade;
function tickHousemateFridge(state, events) {
  let mates = housematesOf(state),
    things = state.things;
  if (!mates.length || !things?.fridge) {
    state.fridgeEmptySince = null;
    return;
  }
  let hungryCount = 0,
    homemadeLeft =
      things.fridge
        .filter((pile) => isHousemateEdible(things, pile) && isHomemadeFood(things, pile))
        .reduce((pile, sum) => pile + sum.n, 0) - cookedForParty(state);
  for (let mate of mates) {
    let pileIndex = things.fridge
      .map((pile, index) => [pile, index])
      .filter(([pile]) => isHousemateEdible(things, pile) && (!isHomemadeFood(things, pile) || homemadeLeft > 0))
      .sort(([first], [second]) => (first.left ?? 1 / 0) - (second.left ?? 1 / 0))[0]?.[1];
    if (pileIndex === undefined) {
      hungryCount += 1;
      continue;
    }
    if (isHomemadeFood(things, things.fridge[pileIndex])) {
      homemadeLeft -= 1;
    }
    takeOneFromPile(things, "fridge", pileIndex);
  }
  if (
    ((state.fridgeEmptySince = hungryCount ? (state.fridgeEmptySince ?? state.minutes) : null),
    state.minutes - (state.groceriesAt ?? -1 / 0) < GROCERIES_EVERY_DAYS * MINUTES_PER_DAY2)
  ) {
    return;
  }
  let shopper =
    mates[
      Math.floor(
        seededRandom(state.seed, "groceries", String(Math.floor(state.minutes / MINUTES_PER_DAY2))) * mates.length,
      )
    ];
  for (let [itemId, count] of HOUSEMATE_GROCERIES) {
    let def = itemDef(things, itemId);
    if (def) {
      addToPiles(things.fridge, itemId, count, def.fresh ? def.fresh * MINUTES_PER_DAY2 : null);
    }
  }
  state.groceriesAt = state.minutes;
  state.fridgeEmptySince = null;
  logNote(state, `${nameFor(state, shopper)} brought groceries`, "info");
  events.push({
    id: "groceries",
    characterId: shopper.id,
    text: `${nameFor(state, shopper)} brought groceries: they're in the fridge.`,
  });
}
var emptyFridgeWords = (state) =>
  state.fridgeEmptySince !== null &&
  state.fridgeEmptySince !== undefined &&
  state.minutes - state.fridgeEmptySince >= FRIDGE_EMPTY_DAYS * MINUTES_PER_DAY2
    ? "; there has been nothing to eat in the fridge at home for days"
    : "";
var MATE_MOMENTS = {
  cooked: {
    hours: [18, 22],
    says: "COOKED FOR YOU",
    text: "They cooked dinner at the home they share with the player and made enough for two: it is on the table when this starts.",
    calls: {
      eat: {
        label: "Eat together",
        said: "You ate together.",
        friendship: 2,
        eats: true,
      },
      later: {
        label: "Save it for later",
        note: "A portion in your fridge",
        said: "A portion for later, in your fridge.",
        friendship: 1,
        keeps: true,
      },
    },
  },
  mess: {
    hours: [16, 23],
    says: "LEFT A MESS",
    text: "They left the kitchen of the home they share with the player a real mess (dishes piled up, something spilt), and the player just found it, with them right there.",
    calls: {
      together: {
        label: "Clean it up together",
        said: "You cleaned it up together.",
        friendship: 1,
      },
      telloff: {
        label: "Tell them to clean it",
        said: "They cleaned it up, a little sulky.",
        friendship: -1,
      },
    },
  },
  music: {
    hours: [22, 2],
    says: "IS STILL UP",
    text: "It is late and they have music on loud at the home they share with the player, in a good mood, when the player would rather rest.",
    calls: {
      join: {
        label: "Join them for a bit",
        said: "You stayed up with them a while.",
        friendship: 2,
        energy: -10,
      },
      down: {
        label: "Ask them to turn it down",
        said: "They turned it down.",
        friendship: -1,
      },
    },
  },
  night: {
    hours: [0, 3],
    says: "CAN'T SLEEP EITHER",
    text: "In the middle of the night, the player and they run into each other in the kitchen of the home they share: neither can sleep.",
    calls: {
      talk: {
        label: "Stay up and talk",
        said: "You talked until late.",
        friendship: 3,
        energy: -10,
      },
      bed: {
        label: "Go back to bed",
        said: "Back to bed.",
      },
    },
  },
  borrow: {
    hours: [8, 22],
    says: "WANTS TO ASK YOU SOMETHING",
    text: "They ask the player to lend them something of theirs for a day (a jacket, a charger, a book): something small, from around the house.",
    calls: {
      lend: {
        label: "Lend it",
        said: "You lent it to them.",
        friendship: 2,
      },
      no: {
        label: "Not this time",
        said: "Not this time.",
        friendship: -1,
      },
    },
  },
};
var MATE_MOMENT_CHANCE = 0.3;
var MATE_MOMENT_AGAIN_DAYS = 2;
var isHourInRange = (hour, [fromHour, toHour]) =>
  fromHour <= toHour ? hour >= fromHour && hour < toHour : hour >= fromHour || hour < toHour;
function canHaveMateMoment(state, mate, kind, day) {
  let [fromHour, toHour] = MATE_MOMENTS[kind].hours,
    hours =
      fromHour <= toHour
        ? Array.from(
            {
              length: toHour - fromHour,
            },
            (unused, offset) => fromHour + offset,
          )
        : [
            ...Array.from(
              {
                length: 24 - fromHour,
              },
              (unused, offset) => fromHour + offset,
            ),
            ...Array.from(
              {
                length: toHour,
              },
              (unused, offset) => 24 + offset,
            ),
          ],
    whereOptions = whereOpts(state);
  return hours.some((hour) => {
    let spot = whereaboutsOf(mate, day * MINUTES_PER_DAY2 + hour * 60, whereOptions);
    return spot.place === "home" && !spot.sleep;
  });
}
function rollMateMoment(state, day) {
  let mates = housematesOf(state);
  if (
    !mates.length ||
    (state.mateMomentAt ?? -1 / 0) > state.minutes - MATE_MOMENT_AGAIN_DAYS * MINUTES_PER_DAY2 ||
    seededRandom(state.seed, "mate-moment", String(day)) >= MATE_MOMENT_CHANCE
  ) {
    return;
  }
  let free = mates.filter((mate2) => !bondOf(state, mate2.id)?.asks);
  if (!free.length) {
    return;
  }
  let mate = free[Math.floor(seededRandom(state.seed, "mate-who", String(day)) * free.length)],
    kinds = Object.keys(MATE_MOMENTS).filter((kind2) => canHaveMateMoment(state, mate, kind2, day));
  if (!kinds.length) {
    return;
  }
  let kind = kinds[Math.floor(seededRandom(state.seed, "mate-what", mate.id, String(day)) * kinds.length)];
  bondOf(state, mate.id).asks = {
    id: "mate-moment",
    at: state.minutes,
    due: state.minutes,
    until: state.minutes + MINUTES_PER_DAY2,
    mate: true,
    about: {
      mate: true,
      kind: kind,
      text: MATE_MOMENTS[kind].text,
    },
  };
  state.mateMomentAt = state.minutes;
}
function isMateMomentThere(state, asks, mate) {
  let moment = MATE_MOMENTS[asks?.about?.kind];
  return !moment || !isHourInRange(clockFromMinutes(state.minutes).hour, moment.hours)
    ? false
    : !!mate &&
        sharesYourDoor(state, mate) &&
        !isAsleep(state, mate.id) &&
        whereaboutsOf(mate, state.minutes, whereOpts(state)).place === "home" &&
        !workingHome(state, mate);
}
function mateMomentWaits(state, asks, mate) {
  return asks?.mate
    ? state.at !== "home" || state.visit || state.guest || state.party
      ? true
      : !isMateMomentThere(state, asks, mate)
    : false;
}
function expireMateMoments(state) {
  for (let bond of Object.values(state.bonds ?? {})) {
    if (bond.asks?.id === "mate-moment" && bond.asks.until <= state.minutes) {
      bond.asks = null;
    }
  }
}
function homeSpecialActions(state, characterId) {
  if (!characterOf(state, characterId)) {
    return {};
  }
  let isMate = housematesOf(state).some((mate) => mate.id === characterId);
  return {
    ...(mateInBlockReason(state, characterId)
      ? {}
      : {
          mateIn: {
            ok: true,
            minutes: milestoneSceneMinutes("mate-in"),
            rooms: roomsLeftAtHome(state),
            pays: hasOwnHome(state) && ownsCurrentHome(state) ? roomPayFor(state.wallet.home) : 0,
          },
        }),
    ...(mateInGreyedOut(state, characterId)
      ? {
          mateIn: mateInGreyedOut(state, characterId),
        }
      : {}),
    ...(isMate
      ? {
          mateOut: {
            ok: true,
            minutes: milestoneSceneMinutes("mate-out"),
          },
        }
      : {}),
  };
}

export {
  FRIDGE_EMPTY_DAYS,
  GROCERIES_EVERY_DAYS,
  HOUSEMATE_GROCERIES,
  MATE_AFTER_EX_DAYS,
  MATE_AGAIN_DAYS,
  MATE_ASK_CHANCE_BY_SETTLED,
  MATE_FAMILY_TIER,
  MATE_FROM_TIER,
  MATE_IN_GAIN,
  MATE_MOMENTS,
  MATE_MOMENT_AGAIN_DAYS,
  MATE_MOMENT_CHANCE,
  MATE_OUT_COST,
  MATE_STAYS_TIER,
  PARTNER_TOGETHER_CHANCE,
  PARTNER_TOGETHER_DAYS,
  ROOM_RENT_SHARE,
  addHomeMemory,
  agreesToMoveIn,
  breakUpWith,
  collectHousemateRent,
  emptyFridgeWords,
  expireMateMoments,
  homeSpecialActions,
  housematesOf,
  housematesPayTotal,
  isHourInRange,
  isMateMomentThere,
  livesAlone,
  livingAtTheirPlace,
  mateInBlockReason,
  mateInGreyedOut,
  mateMomentWaits,
  moveInWithYou,
  moveOutToOwnPlace,
  rollMateInAsk,
  rollMateMoment,
  roomForPartner,
  roomPayFor,
  roomsInHome,
  roomsLeftAtHome,
  roomsTakenBy,
  tickHousemateFridge,
  tickHousemates,
};
