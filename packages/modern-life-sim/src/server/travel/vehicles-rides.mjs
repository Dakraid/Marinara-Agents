// Vehicles, travel times, giving NPCs rides and pick-ups
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { adjustBondAxis } from "../relationships/bonds.mjs";
import { endScene } from "../scenes/scene-engine.mjs";
import { ITEM_CATALOG } from "../items/catalog.mjs";
import { markFactSeenBy, personKnowsFact, recordTownFact } from "../network/town-facts.mjs";
import { OUTING_PLACES } from "../outings/outing-places.mjs";
import { LUNCH_BREAK_MESSAGE } from "../jobs/office-job.mjs";
import { earnMoney } from "../money/wallet.mjs";
import { DISTRICT_HOP_MINUTES, isStreetPlace } from "../town/places.mjs";
import { isPlaceOpen, routeBetweenPlaces, townPlace, travelMinutesBetween } from "../town/town-layout.mjs";
import { firstModuleHook, moduleKeepsOut } from "../modules/module-registry.mjs";
import { designerSeen } from "../social/rich-impressions.mjs";
import { guestOver } from "../social/guest-visits.mjs";
import { leaveTheirPartyIfAny, ownPartyBlocksReason, sayGoodbyeFirstReason } from "../parties/party.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { learnedFact } from "../romance/jealousy.mjs";
import { lunchNow } from "../jobs/office.mjs";
import {
  advanceTime,
  bondOf,
  characterOf,
  comingToYou,
  fireArrivedHook,
  logNote,
  nameFor,
  sceneBusyReason,
} from "../game.mjs";

var RIDE_GIVEN = 3;
var RIDE_REFUSED = -1;
var RIDE_STAYS = 60;
var PICKUP_MOOD = 4;
var PICKUP_WINDOW_MINUTES = 180;
var WHEELS_ACTS = ["buy", "sell", "ride", "pick-up", "offer-ride"];
var vehiclesOf = (game) => (game.things?.vehicles ?? []).filter((itemId) => ITEM_CATALOG[itemId]?.kind === "vehicle");
function vehicleOf(game) {
  return vehiclesOf(game).sort((a, b) => ITEM_CATALOG[a].hop - ITEM_CATALOG[b].hop)[0] ?? null;
}
var hopOf = (game) => (vehicleOf(game) ? ITEM_CATALOG[vehicleOf(game)].hop : DISTRICT_HOP_MINUTES);
var travelFor = (game, from, to) =>
  travelMinutesBetween(game.town, from, to, {
    hop: hopOf(game),
  });
var goingBy = (game) => vehicleOf(game) ?? "";
var travelVerb = (game) =>
  ({
    car: "Drove",
    motorbike: "Rode",
  })[goingBy(game)] ?? "Walked";
function sellVehicle(game, itemId) {
  let def = ITEM_CATALOG[itemId];
  if (def?.kind !== "vehicle" || !vehiclesOf(game).includes(itemId)) {
    return {
      ok: false,
      reason: "You do not have that.",
    };
  }
  let refund = Math.round(def.price / 2);
  game.things.vehicles = game.things.vehicles.filter((id) => id !== itemId);
  earnMoney(game.wallet, refund, `Sold your ${def.name.toLowerCase()}`, game.minutes);
  logNote(game, `Sold your ${def.name.toLowerCase()} ($${refund})`, "money");
  return {
    ok: true,
    name: def.name,
    price: refund,
  };
}
function seeWheels(game) {
  let vehicle = vehicleOf(game);
  if (!vehicle) {
    return [];
  }
  let viewers = sawIt(game).filter((id) => !knownWheels(game, id).includes(vehicle));
  if (!viewers.length) {
    return [];
  }
  let fact = (game.facts ?? []).find((f) => f.act === "wheels" && f.what === vehicle),
    newViewers = viewers;
  if (!fact) {
    newViewers = recordTownFact(game, "wheels", {
      place: game.at,
      witnesses: viewers,
      what: vehicle,
    });
    fact = game.facts.at(-1);
  } else {
    for (let viewer of viewers) {
      markFactSeenBy(game, viewer, fact.id);
    }
    if (!game.week.facts.includes(fact.id)) {
      game.week.facts.push(fact.id);
    }
  }
  learnedFact(game, newViewers, fact.id, "seen");
  return newViewers;
}
function knownWheels(game, charId) {
  let known = (game.facts ?? [])
    .filter((fact) => fact.act === "wheels" && personKnowsFact(game, charId, fact.id))
    .map((fact) => fact.what);
  return vehiclesOf(game).filter((id) => known.includes(id));
}
function wheelsSeen(game, charId) {
  let known = knownWheels(game, charId).sort((a, b) => ITEM_CATALOG[a].hop - ITEM_CATALOG[b].hop);
  return known.length ? `Gets around by ${ITEM_CATALOG[known[0]].name.toLowerCase()}` : "";
}
function rideChoices(game, charId) {
  if (!knownWheels(game, charId).length || game.ride || game.scene?.rideAsked) {
    return [];
  }
  if (ownPartyBlocksReason(game) || sayGoodbyeFirstReason(game) || lunchNow(game)) {
    return [];
  }
  let home = characterOf(game, charId)?.residence?.place ?? null;
  return (game.town.places ?? [])
    .filter(
      (place) =>
        place.id !== game.at &&
        place.id !== "home" &&
        !isStreetPlace(place.id) &&
        (place.id === home || (!place.residence && !place.hall && isPlaceOpen(place, game.minutes))),
    )
    .filter((place) => !firstModuleHook(game, "shutTo", place.id) && !moduleKeepsOut(game, place.id, charId))
    .map((place) => ({
      id: place.id,
      name: place.id === home ? `${place.name} (their home)` : place.name,
      minutes: travelFor(game, game.at, place.id),
    }))
    .filter((place) => place.minutes !== null);
}
function openRide(game, charId, placeId) {
  if (!game.scene || game.scene.done || game.plea) {
    return null;
  }
  let choice = rideChoices(game, charId).find((c) => c.id === placeId);
  return choice
    ? ((game.scene.rideAsked = true),
      (game.ride = {
        characterId: charId,
        place: choice.id,
        at: game.minutes,
      }),
      logNote(
        game,
        `${nameFor(game, characterOf(game, charId))} asked you for a ride to ${townPlace(game.town, choice.id)?.name ?? choice.name}`,
        "social",
      ),
      game.ride)
    : null;
}
function staleRide(game) {
  if (game.ride && !(game.scene && !game.scene.done && game.scene.characterId === game.ride.characterId)) {
    game.ride = null;
  }
  if (game.rideDue && game.minutes > game.rideDue.at + RIDE_STAYS) {
    game.rideDue = null;
  }
}
function rideView(game) {
  let ride = game.ride;
  if (!ride) {
    return null;
  }
  let place = townPlace(game.town, ride.place),
    character = characterOf(game, ride.characterId),
    charName = nameFor(game, character),
    minutes = travelFor(game, game.at, ride.place) ?? 0,
    by = goingBy(game);
  return {
    characterId: ride.characterId,
    name: charName,
    place: ride.place,
    placeName: place?.name ?? ride.place,
    home: character?.residence?.place === ride.place,
    minutes: minutes,
    by: by,
    head: [
      {
        id: "head",
        label: `${charName} asks you for a ride \xB7 to ${place?.name ?? ride.place}${character?.residence?.place === ride.place ? " \xB7 home" : ""}`,
      },
    ],
    options: [
      {
        id: "drive",
        label: "Take them there",
        note: `You both head there now \xB7 ${minutes} min ${by === "car" ? "by car" : "on your motorbike"}`,
      },
      {
        id: "no",
        label: "Not now",
        note: "\u22121 Friendship",
      },
    ],
  };
}
function answerRide(game, answer, { words = false } = {}) {
  let ride = game.ride;
  if (!ride) {
    return {
      ok: false,
      reason: "Nobody asked you for a ride.",
    };
  }
  let bond = bondOf(game, ride.characterId),
    view = rideView(game);
  if (((game.ride = null), answer !== "drive")) {
    adjustBondAxis(bond, "friendship", RIDE_REFUSED, {
      at: game.minutes,
    });
    let chips = [
      {
        text: `NOT NOW \xB7 ${RIDE_REFUSED} FRIENDSHIP`,
        bad: true,
      },
    ];
    if (!words && game.scene && !game.scene.done) {
      game.scene.rideNo = chips;
    }
    return {
      ok: true,
      answer: "no",
      tags: chips,
    };
  }
  adjustBondAxis(bond, "friendship", RIDE_GIVEN, {
    at: game.minutes,
  });
  game.rideDue = {
    characterId: ride.characterId,
    place: ride.place,
    at: game.minutes,
  };
  if (game.scene && !game.scene.done) {
    game.scene.ride = {
      place: ride.place,
      name: view.placeName,
      characterId: ride.characterId,
    };
    if (!words) {
      endScene(game.scene, bond, {
        endedBy: "ride",
      });
    }
  }
  return {
    ok: true,
    answer: "drive",
    tags: [
      {
        text: `\u25B8 ${view.by === "car" ? "DRIVE" : "RIDE"} ${view.name.toUpperCase()} TO ${view.placeName.toUpperCase()}`,
        step: true,
      },
      {
        text: `+${RIDE_GIVEN} FRIENDSHIP`,
        step: true,
      },
    ],
  };
}
function rideNoTags(game, scene = game.scene) {
  let rideNo = scene?.rideNo;
  if (!rideNo) {
    return;
  }
  delete scene.rideNo;
  let tags = scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length ? scene.did.tags : [];
  scene.did = {
    exchange: scene.exchange,
    logAt: scene.log.length,
    tags: [...rideNo, ...tags],
  };
}
function rideGo(game) {
  let due = game.rideDue;
  if (!due) {
    return {
      ok: false,
      reason: "There is no ride to give.",
    };
  }
  if (game.scene) {
    return {
      ok: false,
      reason: "Finish the scene first.",
    };
  }
  if (sceneBusyReason(game)) {
    return {
      ok: false,
      reason: sceneBusyReason(game),
    };
  }
  if (ownPartyBlocksReason(game)) {
    return {
      ok: false,
      reason: ownPartyBlocksReason(game),
    };
  }
  if (sayGoodbyeFirstReason(game)) {
    return {
      ok: false,
      reason: sayGoodbyeFirstReason(game),
    };
  }
  if (lunchNow(game)) {
    return {
      ok: false,
      reason: LUNCH_BREAK_MESSAGE,
    };
  }
  let shut = firstModuleHook(game, "shutTo", due.place);
  if (shut) {
    return {
      ok: false,
      reason: shut,
    };
  }
  let place = townPlace(game.town, due.place),
    minutes = travelFor(game, game.at, due.place);
  if (!place || minutes === null) {
    game.rideDue = null;
    return {
      ok: false,
      reason: "You cannot get there from here.",
    };
  }
  game.shiftNow = null;
  let route = routeBetweenPlaces(game.town, game.at, due.place),
    from = game.at;
  game.rideDue = null;
  game.visit = null;
  game.fitting = null;
  game.suits = null;
  let guestEvent =
      from === "home"
        ? guestOver(game, {
            left: true,
          })
        : null,
    leftParty = leaveTheirPartyIfAny(game),
    { events: events } = advanceTime(game, minutes, {
      walking: true,
    });
  if (
    (guestEvent && events.unshift(guestEvent),
    leftParty && events.unshift(leftParty),
    events.some((ev) => ev.id === "fainted"))
  ) {
    return {
      ok: true,
      minutes: minutes,
      place: townPlace(game.town, game.at),
      path: route,
      from: from,
      open: true,
      events: events,
      fainted: true,
    };
  }
  game.at = due.place;
  let character = characterOf(game, due.characterId),
    dest = character?.residence?.place === due.place ? "home" : due.place;
  game.rides = [
    ...(game.rides ?? []).filter((ride) => ride.to > game.minutes),
    {
      characterId: due.characterId,
      place: dest,
      from: game.minutes,
      to: game.minutes + RIDE_STAYS,
    },
  ];
  logNote(game, `${travelVerb(game)} ${character?.name ?? "someone"} to ${place.name} (${minutes} min)`, "move");
  seeWheels(game);
  designerSeen(game, sawIt(game));
  events.push(...comingToYou(game));
  fireArrivedHook(game, due.place, events);
  return {
    ok: true,
    minutes: minutes,
    place: place,
    path: route,
    from: from,
    open: isPlaceOpen(place, game.minutes),
    events: events,
    with: {
      id: due.characterId,
      name: nameFor(game, character),
    },
    by: goingBy(game),
  };
}
function rideSpans(game) {
  let spansById = {};
  for (let ride of game.rides ?? []) {
    if (ride.to > game.minutes) {
      (spansById[ride.characterId] ??= []).push({
        from: ride.from,
        to: ride.to,
        place: ride.place,
        doing: "just got here",
      });
    }
  }
  return spansById;
}
function canPickUp(game, characterId, place) {
  let homePlace = characterOf(game, characterId)?.residence?.place ?? null;
  return !!vehicleOf(game) && !!homePlace && !OUTING_PLACES[place]?.home && place !== homePlace;
}
function pickUpPlanAt(game, place) {
  let today = clockFromMinutes(game.minutes).dayIndex;
  return (
    (game.plans ?? []).find(
      (plan) =>
        plan.status === "set" &&
        plan.pickUp &&
        !plan.pickedUp &&
        plan.place === place &&
        clockFromMinutes(plan.at).dayIndex === today &&
        plan.at - game.minutes <= PICKUP_WINDOW_MINUTES,
    ) ?? null
  );
}
function pickUpWayTo(game, destination) {
  let directMinutes = travelFor(game, game.at, destination),
    plan = directMinutes === null || !vehicleOf(game) ? null : pickUpPlanAt(game, destination),
    pickUpPlace = plan ? characterOf(game, plan.characterId)?.residence?.place : null;
  if (!plan || !pickUpPlace) {
    return {
      minutes: directMinutes,
      plan: null,
    };
  }
  let toPickUpMinutes = travelFor(game, game.at, pickUpPlace),
    onwardMinutes = travelFor(game, pickUpPlace, destination);
  return toPickUpMinutes === null || onwardMinutes === null
    ? {
        minutes: directMinutes,
        plan: null,
      }
    : {
        minutes: toPickUpMinutes + onwardMinutes,
        plan: plan,
      };
}
function pickUpView(game, plan) {
  if (!plan.pickUp || plan.pickedUp || !vehicleOf(game)) {
    return null;
  }
  let pickUpPlace = characterOf(game, plan.characterId)?.residence?.place,
    toPickUpMinutes = pickUpPlace ? travelFor(game, game.at, pickUpPlace) : null,
    onwardMinutes = pickUpPlace ? travelFor(game, pickUpPlace, plan.place) : null;
  return toPickUpMinutes === null || onwardMinutes === null
    ? null
    : {
        leaveBy: formatClockTime(plan.at - toPickUpMinutes - onwardMinutes),
        minutes: toPickUpMinutes + onwardMinutes,
      };
}

export {
  PICKUP_MOOD,
  RIDE_GIVEN,
  RIDE_REFUSED,
  RIDE_STAYS,
  WHEELS_ACTS,
  answerRide,
  canPickUp,
  goingBy,
  hopOf,
  knownWheels,
  openRide,
  pickUpView,
  pickUpWayTo,
  rideChoices,
  rideGo,
  rideNoTags,
  rideSpans,
  rideView,
  seeWheels,
  sellVehicle,
  staleRide,
  travelFor,
  travelVerb,
  vehicleOf,
  vehiclesOf,
  wheelsSeen,
};
