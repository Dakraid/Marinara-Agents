// Intimate milestone: consent inputs, private/public spots, going somewhere together, group joins and the milestone definition
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { addToEventCast, eventCast } from "../events/event-cast.mjs";
import { bondTier } from "../relationships/bonds.mjs";
import { endScene } from "../scenes/scene-engine.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { canAfford, spendMoney } from "../money/wallet.mjs";
import { isPlaceOpen, routeBetweenPlaces, townPlace } from "../town/town-layout.mjs";
import { guestOver } from "../social/guest-visits.mjs";
import { isAtActiveParty, leaveTheirPartyIfAny, ownPartyBlocksReason } from "../parties/party.mjs";
import { hasOwnHome, streetSpotOf } from "../home/residence.mjs";
import { likesYou } from "../romance/romanceability.mjs";
import { TENSE_AT } from "../romance/multiple-partners.mjs";
import { workingHome, workingNow } from "../cast/working-now.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { lunchWhy } from "../jobs/office.mjs";
import { HONEYMOON_DAYS } from "../romance/wedding-morning.mjs";
import { goingBy, travelFor } from "../travel/vehicles-rides.mjs";
import {
  advanceTime,
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  isCharacterHere,
  logNote,
  nameFor,
  sharesYourDoor,
  traitsOf,
  whereabouts,
  whoIsHere,
} from "../game.mjs";
import {
  HOTEL_PLACE,
  HOTEL_ROOM_MINUTES,
  HOTEL_ROOM_PRICE,
  INTIMATE_MINUTES,
  OVERHEARD_CHANCE,
  PARTY_OVERHEARD_CHANCE,
  PARTY_OVERHEARD_MAX,
} from "./tuning.mjs";
import { intimacyConsent, intimacyGains, isCarNightHour, turnedDownHurt } from "./consent.mjs";
import { cleanAdultAnswer } from "./intimacy-ways.mjs";
import {
  PUBLIC_SPOTS,
  daringAllowsSpot,
  pairTensionBelow,
  placeWithArticle2,
  spotCatchChance,
  spotRiskLabel,
  tripBackdropId,
} from "./spots.mjs";
import {
  activeSpecialNight,
  adultSleepTogetherAvailability,
  intimacyConsentWithSpecial,
  privateSpotsForGroup,
  stayTheNightOptions,
} from "./sleep-together.mjs";
import { adultShutTo } from "./intimacy-outcomes.mjs";
import { intimacyWaysFor } from "./cast-intimacy.mjs";
import { unlockAdultBackdrop, unlockCornerBackdrop } from "./backdrops.mjs";
import { partySlipAwayCandidates } from "./party-slip-away.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";

var INTIMATE_DAY_MINUTES = 1440;
var adultState = (state) => state.modules?.adult ?? null;
var intimateBondOf = (adult, characterId) =>
  (adult.bonds[characterId] ??= {
    times: 0,
    first: null,
    last: null,
    lastDay: null,
    retry: 0,
    rolled: null,
  });
var adultNameFor = (state, characterId) =>
  nameFor(
    state,
    characterOf(state, characterId) ?? {
      id: characterId,
      name: "them",
    },
  );
function adultMarkOf(adult, characterId) {
  let castEntry = adult?.cast?.[characterId];
  return typeof castEntry?.mark == "boolean" ? (castEntry.mark ? "yes" : "no") : cleanAdultAnswer(castEntry?.adult);
}
function consentInputs(state, characterId) {
  let adult = adultState(state),
    bond = bondOf(state, characterId),
    intimateBond = adult?.bonds?.[characterId] ?? {};
  return {
    adult: adultMarkOf(adult, characterId),
    youAdult: !!adult?.youAdult,
    romanceable: bond?.romanceable !== false,
    justFriends: !!bond?.justFriends,
    likesYou: likesYou(state, characterId),
    status: bond?.status ?? "single",
    firstKiss: !!bond?.milestones?.firstKiss,
    romanceTier: bond ? bondTier(bond, "romance") : 0,
    traits: traitsOf(state, characterId),
    retryUntil: intimateBond.retry ?? 0,
    lastDay: intimateBond.lastDay ?? null,
    today: clockFromMinutes(state.minutes).dayIndex,
    at: state.minutes,
  };
}
var consentFor = (state, characterId) => intimacyConsent(consentInputs(state, characterId));
function privateSpotHere(state, characterId) {
  return state.visit?.stage === "inside" && state.visit.characterId === characterId
    ? "theirs"
    : state.visit
      ? null
      : state.at === "home" && isCharacterHere(state, characterId)
        ? "yours"
        : state.at === "karaoke" && onKaraokeDate(state, characterId)
          ? "karaoke"
          : state.at === HOTEL_PLACE.id &&
              isCharacterHere(state, characterId) &&
              (adultState(state)?.room ?? 0) > state.minutes
            ? "hotel"
            : null;
}
function onKaraokeDate(state, characterId) {
  let outing = state.outing;
  if (outing?.characterId === characterId && outing.kind === "date" && outing.place === "karaoke") {
    return true;
  }
  let dateGo = adultState(state)?.dateGo;
  return dateGo?.id === characterId && dateGo.place === "karaoke" && dateGo.until >= state.minutes;
}
var intimateSpotNow = (state, characterId) =>
  isAtActiveParty(state) ? (isCharacterHere(state, characterId) ? "party" : null) : privateSpotHere(state, characterId);
function livesWithPlayer(state, characterId) {
  let character = characterOf(state, characterId);
  return !!character && (!!character.residence?.withYou || sharesYourDoor(state, character));
}
var PRIVATE_SPOT_LABELS = {
  yours: "At your place",
  theirs: "At their place",
  karaoke: "In the karaoke room",
  hotel: "In your room at the hotel",
  car: "In your car",
  work: "Where they work, closed",
  trip: "In your room on the trip",
  party: "A room at the party",
};
var PRIVATE_SPOT_PROMPTS = {
  yours: "at the player's home, the two of them alone",
  theirs: "at their home, the two of them alone",
  karaoke: "in a closed karaoke room, the two of them alone",
  hotel: "in a hotel room they took",
  car: "in the player's car, parked somewhere quiet at night",
  work: "where they work, after hours, nobody else there",
  trip: "in their room on their honeymoon, the two of them alone",
  party: "in a room of the house, away from the party going on outside",
};
function spotPromptFor(scene) {
  let corner = scene.about?.spot === "spot" ? scene.about.corner : null,
    prompt = corner
      ? `${lowerFirstLetter(corner.name)}, at ${placeWithArticle2(corner.place, corner.placeName)}: a public place, where someone could walk in on them at any moment`
      : (PRIVATE_SPOT_PROMPTS[scene.about?.spot] ?? "");
  return othersInScene(scene).length ? prompt.replace("the two of them alone", "just them") : prompt;
}
var lowerFirstLetter = (text) => `${text[0].toLowerCase()}${text.slice(1)}`;
function publicSpotHere(state, excludeIds = []) {
  if (state.visit) {
    return null;
  }
  let spot = PUBLIC_SPOTS[state.at],
    place = spot ? townPlace(state.town, state.at) : null;
  if (!place || !isPlaceOpen(place, state.minutes)) {
    return null;
  }
  let hour = clockFromMinutes(state.minutes).hour,
    closesIn = place.open === 0 && place.close === 24 ? 24 : (((place.close - hour) % 24) + 24) % 24 || 24,
    people = whoIsHere(state).filter((person) => !excludeIds.includes(person.id) && !isAsleep(state, person.id)).length;
  return {
    place: place.id,
    placeName: place.name,
    name: spot.name,
    chance: spotCatchChance(spot, {
      people: people,
      hour: hour,
      closesIn: closesIn,
    }),
  };
}
var unwillingForSpot = (state, characterIds, chance) =>
  characterIds.filter(
    (characterId) => !daringAllowsSpot(intimacyWaysFor(state, adultState(state), characterId).daring, chance),
  );
function spotDescription(spot) {
  return spot
    ? spot.id === "spot"
      ? `${spot.name.replace(/^Here · /, "")}, right here`
      : spot.id === "karaoke"
        ? "a room of the karaoke, right here"
        : ({
            yours: "the player's place",
            theirs: "their place",
            hotel: `a room at the ${HOTEL_PLACE.name}`,
            car: "the player's car, parked somewhere quiet",
            work: `${spot.name.replace(/ · closed$/, "")}, where they work, closed at this hour`,
          }[spot.id] ?? spot.name)
    : "somewhere private";
}
function placesToGoTogether(state, characterId, { big = false } = {}) {
  let character = characterOf(state, characterId);
  if (!character) {
    return [];
  }
  let options = [],
    travelTo = (placeId) => travelFor(state, state.at, placeId) ?? null,
    spotHere = isCharacterHere(state, characterId) ? publicSpotHere(state, [characterId]) : null;
  if (spotHere) {
    let refusers = unwillingForSpot(
      state,
      [characterId, ...groupCandidates(state, characterId).map((characterId2) => characterId2.id)],
      spotHere.chance,
    ).map((characterId2) => ({
      id: characterId2,
      name: adultNameFor(state, characterId2),
    }));
    options.push({
      id: "spot",
      name: `Here \xB7 ${lowerFirstLetter(spotHere.name)}`,
      minutes: 0,
      risk: spotRiskLabel(spotHere.chance),
      refuse: refusers,
    });
  }
  let homeNote = (spotId) => othersHomeNote(state, othersHomeAt(state, spotId, characterId, [characterId])),
    evictedBy = (minutes) => !!state.evicting && state.evicting.at <= state.minutes + (minutes ?? 0);
  if (hasOwnHome(state) && !evictedBy(travelTo("home"))) {
    options.push({
      id: "yours",
      name: "Your place",
      minutes: travelTo("home"),
      home: homeNote("yours"),
    });
  }
  if (character.residence && !sharesYourDoor(state, character)) {
    options.push({
      id: "theirs",
      name: `${adultNameFor(state, characterId)}'s place`,
      minutes: travelTo(character.residence.place),
      home: homeNote("theirs"),
    });
  }
  let notShut = (placeId) => !adultShutTo(state, adultState(state) ?? {}, placeId);
  if (townPlace(state.town, HOTEL_PLACE.id) && state.wallet.cash >= HOTEL_ROOM_PRICE && notShut(HOTEL_PLACE.id)) {
    options.push({
      id: "hotel",
      name: HOTEL_PLACE.name,
      cost: HOTEL_ROOM_PRICE,
      minutes: travelTo(HOTEL_PLACE.id),
    });
  }
  if (goingBy(state) === "car" && isCarNightHour(state.minutes)) {
    options.push({
      id: "car",
      name: "Your car",
      minutes: 0,
    });
  }
  let workPlace = character.job?.place ? townPlace(state.town, character.job.place) : null;
  if (workPlace && !workPlace.residence && !isPlaceOpen(workPlace, state.minutes) && notShut(workPlace.id)) {
    options.push({
      id: "work",
      name: `${workPlace.name} \xB7 closed`,
      minutes: travelTo(workPlace.id),
    });
  }
  let partyBlocks = !!ownPartyBlocksReason(state),
    onShift = !!state.shiftNow && state.at === "office",
    lunchBlocks = !!lunchWhy(state, INTIMATE_MINUTES),
    theyWork = !big && (workingNow(state, character) || workingHome(state, character));
  return options
    .filter(
      (option) =>
        option.minutes !== null &&
        (!partyBlocks || !option.minutes) &&
        (!onShift || (option.id === "spot" && !lunchBlocks)) &&
        (!theyWork || option.id === "spot"),
    )
    .map(({ home: home, ...option }) => ({
      ...option,
      note:
        option.risk ??
        [
          option.cost ? `$${option.cost} \xB7 a room` : "",
          option.minutes ? `${option.minutes} min` : "right here",
          home ?? "",
        ]
          .filter(Boolean)
          .join(" \xB7 "),
    }));
}
function othersHomeAt(state, spotKind, characterId, excludeIds = []) {
  if (spotKind === "party") {
    let party2 = state.party;
    if (!party2) {
      return [];
    }
    let hostId = party2.host === "you" ? null : party2.host,
      others = othersHomeAt(
        state,
        hostId && !party2.home ? "theirs" : "yours",
        hostId && !party2.home ? hostId : characterId,
        excludeIds,
      );
    if (hostId && !excludeIds.includes(hostId) && !others.some((other) => other.id === hostId)) {
      others.push({
        id: hostId,
        asleep: isAsleep(state, hostId),
      });
    }
    return others;
  }
  let residence =
    spotKind === "theirs" ? characterOf(state, characterId)?.residence : spotKind === "yours" ? state.residence : null;
  if (!residence) {
    return [];
  }
  let homeIds = castInTown(state)
      .filter(
        (character) =>
          !excludeIds.includes(character.id) &&
          character.residence?.place === residence.place &&
          character.residence?.unit === residence.unit,
      )
      .filter((character) => whereabouts(state, character.id)?.place === "home")
      .map((character) => character.id),
    youAreThere =
      (spotKind === "yours" && state.at === "home" && !state.visit) ||
      (spotKind === "theirs" && state.visit?.characterId === characterId),
    hereIds = youAreThere
      ? whoIsHere(state)
          .map((person) => person.id)
          .filter((id) => !excludeIds.includes(id) && id !== characterId)
      : [],
    party =
      youAreThere &&
      state.party &&
      (spotKind === "yours"
        ? state.party.host === "you" || state.party.home
        : state.party.host === characterId && !state.party.home)
        ? state.party
        : null,
    guests = party
      ? Object.entries(party.guests ?? {}).filter(
          ([guestId, guest]) => guest && !guest.gone && !excludeIds.includes(guestId) && guestId !== characterId,
        )
      : [],
    asleepById = Object.fromEntries(guests.map(([guestId, guest]) => [guestId, !!guest.asleep])),
    sleepoverIds =
      spotKind === "yours" && youAreThere
        ? (state.sleepover?.ids ?? []).filter((id) => !excludeIds.includes(id) && id !== characterId)
        : [];
  for (let id of sleepoverIds) {
    asleepById[id] = true;
  }
  return [...new Set([...homeIds, ...hereIds, ...guests.map(([id]) => id), ...sleepoverIds])].map((id) => ({
    id: id,
    asleep: asleepById[id] ?? isAsleep(state, id),
  }));
}
function othersHomeNote(state, others) {
  if (!others.length) {
    return null;
  }
  let names = others.map((other) => adultNameFor(state, other.id));
  return `${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)} are` : `${names[0]} is`} home`;
}
function whoOverheard(state, scene) {
  let others = othersHomeAt(state, scene.about?.spot, scene.characterId, eventCast(scene)),
    atParty = scene.about?.spot === "party",
    heard = others
      .map((other) => ({
        id: other.id,
        r: seededRandom(state.seed, other.id, String(state.minutes), "heard"),
        p: other,
      }))
      .filter(
        (roll) =>
          roll.r <
          (roll.p.asleep ? OVERHEARD_CHANCE.asleep : atParty ? PARTY_OVERHEARD_CHANCE : OVERHEARD_CHANCE.awake),
      );
  return (atParty ? heard.sort((left, right) => left.r - right.r).slice(0, PARTY_OVERHEARD_MAX) : heard).map(
    (left) => left.id,
  );
}
function othersHomePrompt(state, scene) {
  let others = othersHomeAt(state, scene.about?.spot, scene.characterId, eventCast(scene));
  return others.length
    ? scene.about?.spot === "party"
      ? "THE PARTY GOES ON OUTSIDE: music and people just beyond the door; they try to keep quiet."
      : `SOMEONE ELSE IS HOME: ${others.map((other) => `${adultNameFor(state, other.id)} (${other.asleep ? "asleep" : "awake"})`).join(", ")}, who ${others.length > 1 ? "live" : "lives"} there too, in another room; they try to keep quiet.`
    : "";
}
function goTogetherTo(state, scene, characterId, option) {
  let fromPlace = state.at,
    events,
    character = characterOf(state, characterId),
    brokeMessage = `You don't have the $${HOTEL_ROOM_PRICE} for a room.`;
  if (option.id === "hotel" && !canAfford(state.wallet, HOTEL_ROOM_PRICE)) {
    throw Object.assign(new Error(brokeMessage), {
      statusCode: 400,
    });
  }
  let partyLeft = leaveTheirPartyIfAny(state);
  Object.assign(state, {
    fitting: null,
    suits: null,
    rideDue: null,
  });
  let cast = eventCast(scene),
    guestLeft =
      fromPlace === "home" && state.guest && !cast.includes(state.guest.characterId)
        ? guestOver(state, {
            left: true,
          })
        : null;
  if (
    (fromPlace === "home" && state.guest && cast.includes(state.guest.characterId) && (state.guest = null),
    option.minutes)
  ) {
    let { events: events2 } = advanceTime(state, option.minutes, {
      walking: true,
    });
    if (
      (events2.unshift(...[partyLeft, guestLeft].filter((ev) => ev && typeof ev == "object")),
      events2.some((ev) => ev.id === "fainted"))
    ) {
      return {
        fainted: true,
        events: events2,
      };
    }
    if (((events = events2), option.id === "yours" && !hasOwnHome(state))) {
      state.visit = null;
      state.at = streetSpotOf(state);
      endScene(scene, bondOf(state, characterId), {
        endedBy: "player",
      });
      scene.verdict = {
        accepted: false,
        headline: "Your home is gone.",
        stamp: null,
      };
      scene.batch = [];
      return {
        fainted: true,
        ended: true,
        events: events2,
      };
    }
  } else {
    events = [partyLeft, guestLeft].filter((ev) => ev && typeof ev == "object");
  }
  if (
    (option.id !== "theirs" && (state.visit = null),
    option.id === "yours" && (state.at = "home"),
    option.id === "theirs" &&
      ((state.at = character.residence.place),
      (state.visit = {
        characterId: characterId,
        stage: "inside",
        invite: {
          yes: true,
        },
        at: state.minutes,
        since: state.minutes,
        did: [],
        staying: true,
      })),
    option.id === "hotel")
  ) {
    if (!spendMoney(state.wallet, HOTEL_ROOM_PRICE, `${HOTEL_PLACE.name} \xB7 a room`, state.minutes).ok) {
      throw Object.assign(new Error(brokeMessage), {
        statusCode: 400,
      });
    }
    let adult = adultState(state);
    if (adult) {
      adult.room = state.minutes + HOTEL_ROOM_MINUTES;
    }
    state.at = HOTEL_PLACE.id;
  }
  if (
    (option.id === "work" && (state.at = character.job.place),
    (scene.place = state.at),
    logNote(state, `With ${adultNameFor(state, characterId)}: ${option.name}`, "move"),
    option.minutes)
  ) {
    let verb =
        {
          car: "Drove",
          motorbike: "Rode",
        }[goingBy(state)] ?? "Walked",
      placeName = state.at === "home" ? "Home" : (townPlace(state.town, state.at)?.name ?? option.name);
    scene.walk = {
      id: `${state.minutes}`,
      path: routeBetweenPlaces(state.town, fromPlace, state.at),
      from: fromPlace,
      place: state.at,
      said: `${verb} ${adultNameFor(state, characterId)} to ${placeName} \xB7 ${option.minutes} min`,
    };
  }
  return {
    fainted: false,
    events: events,
  };
}
function markArrivedTogether(scene) {
  scene.about = {
    ...scene.about,
    go: null,
    arrived: true,
  };
  Object.assign(scene, {
    phase: "talk",
    beat: 0,
    max: scene.exchange + 1,
    suggestions: [],
    step: "",
  });
}
var getAlongForGroup = (state, firstId, secondId) =>
  pairTensionBelow(state, npcPairBetween(state, firstId, secondId), TENSE_AT);
var getAlongOrStrangers = (state, firstId, secondId) => {
  let pair = npcPairBetween(state, firstId, secondId);
  return !pair || pairTensionBelow(state, pair, TENSE_AT);
};
var canJoinGroup = (state, characterId, otherId) =>
  otherId !== characterId &&
  hasMet2(state, otherId) &&
  consentFor(state, otherId).how === "yes" &&
  getAlongForGroup(state, characterId, otherId);
function groupCandidates(state, characterId) {
  if (!state.rules?.multipleRelationships) {
    return [];
  }
  let candidates = [];
  for (let character of castInTown(state)) {
    if (
      !canJoinGroup(state, characterId, character.id) ||
      isAsleep(state, character.id) ||
      workingHome(state, character) ||
      workingNow(state, character)
    ) {
      continue;
    }
    if (isCharacterHere(state, character.id)) {
      candidates.push({
        id: character.id,
        here: true,
        minutes: 0,
      });
      continue;
    }
    let where = whereabouts(state, character.id),
      fromPlace = where?.place === "home" ? character.residence?.place : where?.place,
      minutes = fromPlace ? travelFor(state, fromPlace, state.at) : null;
    if (minutes != null) {
      candidates.push({
        id: character.id,
        here: false,
        minutes: Math.max(5, minutes),
      });
    }
  }
  for (let candidate of candidates) {
    candidate.not = candidates
      .filter((other) => other.id !== candidate.id && !getAlongForGroup(state, candidate.id, other.id))
      .map((other) => other.id);
  }
  return candidates.map((candidate) => ({
    ...candidate,
    name: adultNameFor(state, candidate.id),
    note: candidate.here ? "here, right now" : `not here \xB7 you call them \xB7 about ${candidate.minutes} min`,
  }));
}
function groupHereNow(state, characterId) {
  let hereIds = [];
  for (let candidate of groupCandidates(state, characterId)) {
    if (candidate.here && hereIds.every((id) => getAlongForGroup(state, id, candidate.id))) {
      hereIds.push(candidate.id);
    }
  }
  return hereIds;
}
function callGroupIn(state, scene, picked) {
  let pickedIds = [
    ...new Set(
      (Array.isArray(picked) ? picked : String(picked ?? "").split(",")).map((id) => String(id).trim()).filter(Boolean),
    ),
  ];
  if (!pickedIds.length) {
    return [];
  }
  let candidates = groupCandidates(state, scene.characterId),
    chosen = pickedIds.map((id) => candidates.find((candidate) => candidate.id === id));
  if (chosen.some((candidate) => !candidate)) {
    throw Object.assign(new Error("Not everyone you picked can be in it."), {
      statusCode: 400,
    });
  }
  for (let candidate of chosen) {
    let clash = chosen.find((other) => candidate.not.includes(other.id));
    if (clash) {
      throw Object.assign(new Error(`${candidate.name} and ${clash.name} don't get along.`), {
        statusCode: 400,
      });
    }
  }
  let waitMinutes = Math.max(0, ...chosen.map((candidate) => candidate.minutes)),
    waited = [];
  if (waitMinutes) {
    let place = state.visit ? null : townPlace(state.town, state.at);
    if (
      place &&
      !place.residence &&
      isPlaceOpen(place, state.minutes) &&
      !isPlaceOpen(place, state.minutes + waitMinutes)
    ) {
      throw Object.assign(new Error(`They wouldn't get here before ${place.name} closes.`), {
        statusCode: 400,
      });
    }
    let lunchReason = lunchWhy(state, waitMinutes);
    if (lunchReason) {
      throw Object.assign(new Error(lunchReason), {
        statusCode: 400,
      });
    }
    let atBefore = state.at,
      visitBefore = state.visit,
      { events: events } = advanceTime(state, waitMinutes, {
        walking: true,
      });
    if (events.some((ev) => ev.id === "fainted")) {
      return Object.assign([], {
        fell: events,
      });
    }
    if (
      state.at !== atBefore ||
      state.visit !== visitBefore ||
      events.some((ev) => ["closed", "lunch-over"].includes(ev.id)) ||
      (atBefore === "home" && !hasOwnHome(state))
    ) {
      endScene(scene, bondOf(state, scene.characterId), {
        endedBy: "player",
      });
      scene.verdict = {
        accepted: false,
        headline: "The moment passed.",
        stamp: null,
      };
      scene.batch = [];
      return Object.assign([], {
        fell: events,
      });
    }
    logNote(
      state,
      `Called ${chosen
        .filter((candidate) => !candidate.here)
        .map((candidate) => candidate.name)
        .join(" and ")}: they came`,
      "social",
    );
    waited = events;
  }
  for (let candidate of chosen) {
    addToEventCast(scene, candidate.id, {
      at: state.minutes,
      why: candidate.here ? "there" : "called",
    });
  }
  return Object.defineProperty(
    chosen.map((candidate) => candidate.id),
    "waited",
    {
      value: waited,
      enumerable: false,
    },
  );
}
var othersInScene = (scene) => eventCast(scene).filter((id) => id !== scene.characterId);
var COMMITTED_STATUSES = ["partners", "living", "engaged", "married"];
function seedIntimateHistory(state, adult, { fromStart = false } = {}) {
  if (adult) {
    adult.bonds ??= {};
    for (let [characterId, bond] of Object.entries(state.bonds ?? {})) {
      if (
        !COMMITTED_STATUSES.includes(bond?.status) ||
        (fromStart && !((bond.togetherSince ?? bond.statusSince) <= (state.startedAt ?? 0)))
      ) {
        continue;
      }
      let intimateBond = intimateBondOf(adult, characterId);
      if (!intimateBond.times) {
        Object.assign(intimateBond, {
          times: 1,
          made: true,
        });
      }
    }
    adult.made = true;
  }
}
var INTIMATE_MILESTONE_DEF = {
  whyNot(state, characterId) {
    let adult = adultState(state);
    if (!adult?.on) {
      return "There is no step like that.";
    }
    if (
      (isAtActiveParty(state) && state.party.leaving) ||
      (isAtActiveParty(state) &&
        state.party.host !== characterId &&
        !(state.party.guests?.[characterId] && !state.party.guests[characterId].gone))
    ) {
      return "Not now.";
    }
    let availability = adultSleepTogetherAvailability(state, adult, characterId);
    return availability.show ? (availability.why ? `${availability.why}.` : "") : "Not now.";
  },
  begin(state, scene, { how = null, with: withIds = null } = {}) {
    let characterId = scene.characterId,
      adult = adultState(state),
      bond = bondOf(state, characterId);
    if (intimacyConsentWithSpecial(state, characterId).how !== "yes") {
      if (bond?.asks?.id === INTIMATE_MILESTONE) {
        bond.asks = null;
      }
      throw Object.assign(new Error("Not now."), {
        statusCode: 400,
      });
    }
    if (how && scene.by === "them") {
      scene.by = "you";
      if (bond?.asks?.id === INTIMATE_MILESTONE) {
        bond.asks = null;
      }
    }
    scene.leavesAt = null;
    scene.leaveReason = "leaves";
    let dateYes = adult.dateYes?.id === characterId && adult.dateYes.until >= state.minutes;
    if (adult.dateYes?.id === characterId) {
      adult.dateYes = null;
    }
    let dateGo = adult.dateGo?.id === characterId && adult.dateGo.until >= state.minutes,
      privateSpot = privateSpotHere(state, characterId);
    if (adult.dateGo?.id === characterId) {
      adult.dateGo = null;
    }
    let specialNight = activeSpecialNight(state, adult, characterId);
    if (specialNight) {
      adult.special = null;
      let specialAbout = {
        special: {
          kind: specialNight.kind,
          ...(specialNight.day
            ? {
                day: specialNight.day,
                trip: specialNight.trip,
              }
            : {}),
        },
        first: !intimateBondOf(adult, characterId).times,
        group: [],
      };
      if (specialNight.where === "trip") {
        unlockAdultBackdrop(adult, tripBackdropId(specialNight.trip));
        scene.about = {
          spot: "trip",
          ...specialAbout,
        };
        return;
      }
      if (specialNight.where === "party") {
        if (!isAtActiveParty(state)) {
          throw Object.assign(new Error("You can't get there right now."), {
            statusCode: 400,
          });
        }
        scene.about = {
          spot: "party",
          ...specialAbout,
          arrived: true,
        };
        scene.max = 1;
        return;
      }
      if (privateSpot === specialNight.where) {
        scene.about = {
          spot: specialNight.where,
          ...specialAbout,
        };
        return;
      }
      let option = placesToGoTogether(state, characterId, {
        big: true,
      }).find((option2) => option2.id === specialNight.where);
      if (!option) {
        throw Object.assign(new Error("You can't get there right now."), {
          statusCode: 400,
        });
      }
      let travel2 = goTogetherTo(state, scene, characterId, option);
      return travel2.fainted
        ? {
            events: travel2.events,
          }
        : ((scene.about = {
            spot: option.id,
            ...specialAbout,
            arrived: true,
          }),
          (scene.max = 1),
          {
            events: travel2.events,
          });
    }
    if (how === "party" && !isAtActiveParty(state)) {
      throw Object.assign(new Error("Not now."), {
        statusCode: 400,
      });
    }
    if (isAtActiveParty(state)) {
      let group2;
      if (how === "party") {
        let slipCandidate = partySlipAwayCandidates(state, adult, [
            characterId,
            ...(Array.isArray(withIds) ? withIds : []),
          ]).find((candidate) => candidate.id === characterId),
          withIds2 = Array.isArray(withIds) ? withIds : [];
        if (!slipCandidate?.ok || withIds2.some((id) => !(slipCandidate.also ?? []).some((extra) => extra.id === id))) {
          throw Object.assign(new Error("Not now."), {
            statusCode: 400,
          });
        }
        group2 = callGroupIn(state, scene, withIds2);
      } else {
        let asks2 = scene.by === "them" ? bond?.asks : null;
        group2 =
          asks2?.id === INTIMATE_MILESTONE && asks2.with?.length
            ? asks2.with
                .filter((id) => groupHereNow(state, characterId).includes(id))
                .filter((id) =>
                  addToEventCast(scene, id, {
                    at: state.minutes,
                    why: "there",
                  }),
                )
            : callGroupIn(state, scene, withIds);
      }
      if (scene.done) {
        return {
          events: group2.fell ?? [],
        };
      }
      scene.about = {
        spot: "party",
        first: !intimateBondOf(adult, characterId).times,
        group: [...group2],
        arrived: true,
      };
      scene.max = 1;
      return;
    }
    let asks = scene.by === "them" ? bond?.asks : null,
      group =
        asks?.id === INTIMATE_MILESTONE && asks.with?.length
          ? asks.with
              .filter((id) => groupHereNow(state, characterId).includes(id))
              .filter((id) =>
                addToEventCast(scene, id, {
                  at: state.minutes,
                  why: "there",
                }),
              )
          : callGroupIn(state, scene, withIds);
    if (scene.done) {
      return {
        events: group.fell ?? [],
      };
    }
    let groupIds = [...group],
      waited = group.waited ?? [],
      spotHere =
        privateSpotHere(state, characterId) ?? (privateSpot === "karaoke" && state.at === "karaoke" ? "karaoke" : null);
    if (spotHere && (!how || how === spotHere)) {
      if (spotHere === "theirs" && state.visit) {
        state.visit.staying = true;
      }
      scene.about = {
        spot: spotHere,
        first: !intimateBondOf(adult, characterId).times,
        group: groupIds,
        ...(dateYes
          ? {
              theirIdea: dateYes,
            }
          : {}),
      };
      return {
        events: waited,
      };
    }
    let options = placesToGoTogether(state, characterId),
      spotOption =
        how === "spot" && publicSpotHere(state, eventCast(scene))
          ? {
              id: "spot",
            }
          : null,
      pickedOption = how && how !== "spot" ? options.find((option) => option.id === how) : null;
    if (how && !spotOption && !pickedOption) {
      throw Object.assign(
        new Error(
          how === "hotel" && state.wallet.cash < HOTEL_ROOM_PRICE
            ? `You don't have the $${HOTEL_ROOM_PRICE} for a room anymore.`
            : "You can't go there together right now.",
        ),
        {
          statusCode: 400,
        },
      );
    }
    let target =
      spotOption ??
      pickedOption ??
      options.find((option) => option.id !== "spot") ??
      options.find((option) => option.id === "spot");
    if (!target) {
      throw Object.assign(new Error("There's nowhere you can go together right now."), {
        statusCode: 400,
      });
    }
    if (target.id === "spot") {
      let corner = publicSpotHere(state, eventCast(scene)),
        unwilling = corner ? unwillingForSpot(state, eventCast(scene), corner.chance) : eventCast(scene);
      if (unwilling.length) {
        throw Object.assign(
          new Error(`${unwilling.map((id) => adultNameFor(state, id)).join(" and ")} would rather not, here.`),
          {
            statusCode: 400,
          },
        );
      }
      scene.about = {
        spot: "spot",
        corner: corner,
        first: !intimateBondOf(adult, characterId).times,
        group: groupIds,
      };
      unlockCornerBackdrop(adult, corner);
      logNote(state, `With ${adultNameFor(state, characterId)}: ${lowerFirstLetter(corner.name)}`, "move");
      return {
        events: waited,
      };
    }
    if (!dateGo) {
      scene.about = {
        spot: null,
        go: target.id,
        first: !intimateBondOf(adult, characterId).times,
        group: groupIds,
        ...(dateYes
          ? {
              theirIdea: dateYes,
            }
          : {}),
      };
      scene.max = 1;
      return {
        events: waited,
      };
    }
    let travel = goTogetherTo(state, scene, characterId, target);
    return travel.fainted
      ? {
          events: [...waited, ...travel.events],
        }
      : ((scene.about = {
          spot: target.id,
          first: !intimateBondOf(adult, characterId).times,
          group: groupIds,
          ...(dateYes
            ? {
                theirIdea: dateYes,
              }
            : {}),
          arrived: true,
        }),
        (scene.max = 1),
        {
          events: [...waited, ...travel.events],
        });
  },
  options(state, scene) {
    let adultTurn = scene.adult;
    if (adultTurn?.night) {
      return stayTheNightOptions(state, scene);
    }
    if (adultTurn?.passage) {
      return adultTurn.options.map((option) => ({
        id: option.key,
        label: option.text,
        ok: true,
        why: "",
        note: "",
        written: true,
      }));
    }
    if (scene.about?.go) {
      let option = placesToGoTogether(state, scene.characterId).find((option2) => option2.id === scene.about.go),
        hurt = scene.by === "them" ? turnedDownHurt(traitsOf(state, scene.characterId)) : {},
        chips2 = ["romance", "trust"]
          .filter((key) => hurt[key])
          .map((key) => ({
            text: `${hurt[key]} ${key.toUpperCase()}`,
            bad: true,
          }));
      return [
        {
          id: "yes",
          label: "Let's go",
          ok: !!option,
          why: option ? "" : "You can't go there now",
          note: option ? `${option.name} \xB7 ${option.note}` : "",
        },
        {
          id: "wait",
          label: "Not now",
          ok: true,
          why: "",
          note: chips2.length ? "" : "Nothing lost",
          ...(chips2.length
            ? {
                chips: chips2,
              }
            : {}),
        },
      ];
    }
    if (scene.about?.pick) {
      return [
        ...privateSpotsForGroup(state, eventCast(scene)).map((spot) => ({
          id: `where:${spot.id}`,
          label: spot.name,
          ok: true,
          why: "",
          note: spot.note,
        })),
        {
          id: "wait",
          label: "Stop here",
          ok: true,
          why: "",
          note: "Nothing lost",
        },
      ];
    }
    let characterId = scene.characterId,
      adult = adultState(state),
      bond = bondOf(state, characterId),
      gains = intimacyGains({
        times: intimateBondOf(adult, characterId).times,
        lastAt: intimateBondOf(adult, characterId).last,
        traits: traitsOf(state, characterId),
        at: state.minutes,
      }),
      chips = [
        ...(intimateBondOf(adult, characterId).times
          ? []
          : [
              {
                text: "THE FIRST TIME",
              },
            ]),
        ...Object.entries(gains).map(([key, value]) => ({
          text: `+${value} ${key.toUpperCase()}`,
        })),
      ],
      special = scene.about?.special;
    if (special?.kind === "wedding" || special?.kind === "honeymoon") {
      return [
        {
          id: "yes",
          label: "A night together",
          ok: true,
          why: "",
          note: special.kind === "wedding" ? "Your wedding night" : `Night ${special.day} of ${HONEYMOON_DAYS}`,
          chips: chips,
        },
        {
          id: "wait",
          label: "Just sleep",
          ok: true,
          why: "",
          note: "Nothing lost",
        },
      ];
    }
    if (scene.by === "them") {
      let hurt = turnedDownHurt(traitsOf(state, characterId));
      return [
        {
          id: "yes",
          label: "Yes",
          ok: true,
          why: "",
          note: "",
          chips: chips,
        },
        {
          id: "wait",
          label: "Not now",
          ok: true,
          why: "",
          note: "",
          chips: ["romance", "trust"]
            .filter((key) => hurt[key])
            .map((key) => ({
              text: `${hurt[key]} ${key.toUpperCase()}`,
              bad: true,
            })),
        },
      ];
    }
    return [
      {
        id: "yes",
        label: "Go on",
        ok: true,
        why: "",
        note: "",
        chips: chips,
      },
      {
        id: "wait",
        label: "Stop here",
        ok: true,
        why: "",
        note: "Nothing lost",
      },
    ];
  },
  free: (state, scene) => !!scene.adult?.passage,
  endable: (state, scene) => !!scene.adult?.passage || !!scene.adult?.night,
};
var ALREADY_TOGETHER_TODAY = "You've already been together today";

export {
  ALREADY_TOGETHER_TODAY,
  INTIMATE_DAY_MINUTES,
  INTIMATE_MILESTONE_DEF,
  PRIVATE_SPOT_LABELS,
  adultMarkOf,
  adultNameFor,
  adultState,
  consentFor,
  consentInputs,
  getAlongForGroup,
  getAlongOrStrangers,
  goTogetherTo,
  groupCandidates,
  groupHereNow,
  intimateBondOf,
  intimateSpotNow,
  livesWithPlayer,
  lowerFirstLetter,
  markArrivedTogether,
  othersHomePrompt,
  othersInScene,
  placesToGoTogether,
  privateSpotHere,
  publicSpotHere,
  seedIntimateHistory,
  spotDescription,
  spotPromptFor,
  unwillingForSpot,
  whoOverheard,
};
