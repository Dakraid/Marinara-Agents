// Module place registration, place activities, town building, opening hours, routes and travel time
import { clockFromMinutes } from "../time/clock.mjs";
import {
  DISTRICT_HOP_MINUTES,
  DISTRICT_LINKS,
  HOME_PLACE,
  PLACE_ENTER_MINUTES,
  STORE_ENTER_MINUTES,
  STREET_PLACE_PREFIX,
  TOWN_DISTRICTS,
  TOWN_PLACES,
  isPlaceInsideAnother,
  isStreetPlace,
} from "./places.mjs";

var DISTRICT_OF_PLACE = Object.fromEntries(
  TOWN_DISTRICTS.flatMap((district) => district.places.map((placeId) => [placeId, district.id])),
);
function registerModulePlace(place, districtId) {
  if (!place?.id || !place.module) {
    throw new Error("A module's place needs an id and its module.");
  }
  if (TOWN_PLACES.some((place2) => place2.id === place.id)) {
    throw new Error(`The place ${place.id} is defined twice.`);
  }
  let district = TOWN_DISTRICTS.find((candidate) => candidate.id === districtId);
  if (!district) {
    throw new Error(`There is no district ${districtId}.`);
  }
  TOWN_PLACES.push({
    ...place,
  });
  district.places.push(place.id);
  DISTRICT_OF_PLACE[place.id] = district.id;
}
var directPlaceActivities = (placeId) => (PLACE_ACTIVITIES[placeId] ?? []).filter((activity) => !activity.opens);
var PLACE_ACTIVITIES = {
  home: [
    {
      id: "sleep",
      name: "Sleep",
      sleep: true,
      minutes: 480,
      pick: true,
    },
    {
      id: "read",
      name: "Read a book",
      minutes: 60,
      energy: 5,
      gives: {
        knowledge: 12,
      },
      book: true,
    },
    {
      id: "rest",
      name: "Rest on the sofa",
      minutes: 60,
      restEnergy: 10,
    },
    {
      id: "desk-study",
      name: "Study at the desk",
      minutes: 60,
      energy: 8,
      gives: {
        knowledge: 12,
      },
      desk: true,
    },
    {
      id: "bath",
      name: "Take a shower",
      minutes: 15,
      slot: "bath",
    },
    {
      id: "console",
      name: "Play video games",
      minutes: 60,
      slot: "console",
    },
    {
      id: "garden",
      name: "Sit in the garden",
      minutes: 30,
      slot: "garden",
    },
    {
      id: "garage",
      name: "Fix things in the garage",
      minutes: 60,
      energy: 6,
      slot: "garage",
    },
    {
      id: "home-gym",
      name: "Work out at home",
      minutes: 60,
      energy: 15,
      hunger: 8,
      slot: "gym",
    },
    {
      id: "bar",
      name: "A drink at your bar",
      minutes: 30,
      slot: "bar",
    },
    {
      id: "pool",
      name: "Swim in your pool",
      minutes: 45,
      energy: 6,
      hunger: 6,
      slot: "pool",
    },
  ],
  gym: [
    {
      id: "workout",
      name: "Work out",
      minutes: 120,
      energy: 25,
      hunger: 10,
      costs: 15,
      gives: {
        fitness: 25,
      },
    },
    {
      id: "yoga",
      name: "Yoga class",
      minutes: 60,
      energy: 10,
      costs: 15,
      gives: {
        fitness: 12,
        charm: 4,
      },
    },
    {
      id: "shake",
      name: "Protein shake",
      minutes: 15,
      costs: 6,
      food: {
        hunger: 20,
        energy: 5,
      },
    },
    {
      id: "trainer",
      name: "Personal trainer session",
      minutes: 60,
      energy: 20,
      costs: 40,
      gives: {
        fitness: 40,
      },
      needs: {
        fitness: 3,
      },
    },
  ],
  cafe: [
    {
      id: "coffee",
      name: "Coffee and something",
      minutes: 30,
      costs: 8,
      food: {
        hunger: 20,
        energy: 5,
      },
    },
    {
      id: "work-laptop",
      name: "Sit with the laptop",
      minutes: 90,
      energy: 8,
      costs: 5,
      gives: {
        knowledge: 15,
      },
    },
  ],
  park: [
    {
      id: "run",
      name: "Go for a run",
      minutes: 60,
      energy: 15,
      hunger: 8,
      gives: {
        fitness: 12,
      },
      upTo: {
        fitness: 3,
      },
    },
    {
      id: "walk",
      name: "Walk around",
      minutes: 30,
      energy: 3,
      gives: {
        charm: 2,
      },
      upTo: {
        charm: 3,
      },
    },
  ],
  library: [
    {
      id: "study",
      name: "Study",
      minutes: 120,
      energy: 12,
      costs: 8,
      gives: {
        knowledge: 25,
      },
    },
    {
      id: "borrow",
      name: "Borrow a book",
      minutes: 15,
      costs: 5,
      borrow: true,
    },
  ],
  office: [
    {
      id: "shift",
      name: "Work your shift",
      job: true,
      minutes: 360,
    },
  ],
  hospital: [
    {
      id: "cafeteria",
      name: "Hospital cafeteria",
      minutes: 30,
      costs: 7,
      food: {
        hunger: 30,
      },
    },
    {
      id: "waiting-room",
      name: "Rest in the waiting room",
      minutes: 60,
      restEnergy: 8,
    },
  ],
  market: [
    {
      id: "shop",
      name: "Shop for food and gifts",
      opens: "shop",
      minutes: 0,
    },
  ],
  bar: [
    {
      id: "drink",
      name: "Have a drink",
      minutes: 60,
      costs: 12,
      energy: 5,
      food: {
        hunger: 10,
      },
      gives: {
        charm: 4,
      },
    },
  ],
  restaurant: [
    {
      id: "meal",
      name: "A proper meal",
      minutes: 60,
      costs: 30,
      food: {
        hunger: 70,
        energy: 5,
      },
    },
    {
      id: "dessert",
      name: "Dessert and coffee",
      minutes: 30,
      costs: 12,
      food: {
        hunger: 20,
        energy: 5,
      },
    },
  ],
  "store-casual": [
    {
      id: "rack",
      name: "Try on clothes",
      opens: "rack",
      minutes: 0,
    },
  ],
  crest: [
    {
      id: "swim",
      name: "Swim laps in the pool",
      minutes: 60,
      energy: 12,
      hunger: 8,
      costs: 40,
      dayPass: true,
      gives: {
        fitness: 15,
      },
    },
    {
      id: "club-gym",
      name: "Train at the club gym",
      minutes: 90,
      energy: 20,
      hunger: 10,
      costs: 40,
      dayPass: true,
      gives: {
        fitness: 25,
      },
    },
    {
      id: "terrace",
      name: "A drink on the terrace",
      minutes: 45,
      costs: 40,
      dayPass: true,
      restEnergy: 4,
      gives: {
        charm: 6,
      },
    },
  ],
  boutique: [
    {
      id: "rack",
      name: "Try on clothes",
      opens: "rack",
      minutes: 0,
    },
  ],
  furniture: [
    {
      id: "shop",
      name: "Look at the furniture",
      opens: "shop",
      minutes: 0,
    },
  ],
  "gift-shop": [
    {
      id: "shop",
      name: "Shop for gifts",
      opens: "shop",
      minutes: 0,
    },
  ],
  "food-court": [
    {
      id: "ramen",
      name: "Ramen bowl",
      minutes: 30,
      costs: 9,
      food: {
        hunger: 45,
      },
    },
    {
      id: "burger",
      name: "Burger and fries",
      minutes: 20,
      costs: 8,
      food: {
        hunger: 40,
      },
    },
    {
      id: "crepe",
      name: "Cr\xEApe",
      minutes: 10,
      costs: 5,
      food: {
        hunger: 15,
        energy: 3,
      },
    },
  ],
  cinema: [
    {
      id: "movie",
      name: "Watch a movie",
      minutes: 120,
      costs: 12,
      restEnergy: 6,
      gives: {
        charm: 3,
      },
    },
  ],
  arcade: [
    {
      id: "arcade",
      name: "Play at the arcade",
      minutes: 60,
      costs: 8,
      energy: 4,
      gives: {
        fitness: 3,
      },
    },
  ],
  karaoke: [
    {
      id: "sing",
      name: "Sing a few songs",
      minutes: 60,
      costs: 10,
      energy: 6,
      gives: {
        charm: 6,
      },
    },
  ],
  university: [
    {
      id: "lecture",
      name: "Sit in on a lecture",
      minutes: 180,
      energy: 12,
      gives: {
        knowledge: 30,
      },
      upTo: {
        knowledge: 3,
      },
    },
    {
      id: "campus",
      name: "Hang around the campus",
      minutes: 30,
      energy: 3,
      gives: {
        charm: 3,
      },
      upTo: {
        charm: 3,
      },
    },
  ],
};
var TOWN_RENAME_MAX = 32;
function cleanPlaceRenames(renames = {}) {
  let clean = {};
  for (let place of TOWN_PLACES) {
    let rename =
      typeof renames?.[place.id] == "string"
        ? renames[place.id].replace(/\s+/g, " ").trim().slice(0, TOWN_RENAME_MAX)
        : "";
    if (rename && rename !== place.name) {
      clean[place.id] = rename;
    }
  }
  return clean;
}
function buildTown({
  off = [],
  renamed = {},
  homeAt = "apartments",
  districtNames = {},
  modules = [],
  hidden = [],
} = {}) {
  let offSet = new Set(
    off.filter(
      (placeId) => !TOWN_PLACES.find((place) => place.id === placeId)?.locked && !isPlaceInsideAnother(placeId),
    ),
  );
  renamed = cleanPlaceRenames(renamed);
  return {
    off: [...offSet],
    renamed: {
      ...renamed,
    },
    homeAt: RESIDENCE_PLACE_IDS.includes(homeAt) ? homeAt : "apartments",
    districtNames: cleanDistrictRenames(districtNames),
    places: TOWN_PLACES.filter(
      (place) =>
        (!place.module || (modules.includes(place.module) && !hidden.includes(place.id))) &&
        !offSet.has(place.id) &&
        !offSet.has(place.inside),
    ).map((place) => ({
      ...place,
      name: renamed[place.id] ?? place.name,
    })),
  };
}
var RESIDENCE_PLACE_IDS = TOWN_PLACES.filter((place) => place.residence).map((place) => place.id);
var isLuxuryPlace = (placeId) => !!TOWN_PLACES.find((place) => place.id === placeId)?.luxury;
var outerPlaceId = (town, placeId) =>
  placeId === HOME_PLACE.id
    ? (town.homeAt ?? "apartments")
    : (TOWN_PLACES.find((place) => place.id === placeId)?.inside ?? placeId);
function districtOfPlace(town, placeId) {
  return isStreetPlace(placeId)
    ? String(placeId).slice(STREET_PLACE_PREFIX.length)
    : (DISTRICT_OF_PLACE[outerPlaceId(town ?? {}, placeId)] ?? null);
}
function cleanDistrictRenames(renames = {}) {
  let clean = {};
  for (let district of TOWN_DISTRICTS) {
    let rename =
      typeof renames?.[district.id] == "string"
        ? renames[district.id].replace(/\s+/g, " ").trim().slice(0, TOWN_RENAME_MAX)
        : "";
    if (rename && rename !== district.name) {
      clean[district.id] = rename;
    }
  }
  return clean;
}
function townDistricts(town) {
  let placeIds = new Set((town?.places ?? []).map((place) => place.id)),
    districtNames = town?.districtNames ?? {};
  return TOWN_DISTRICTS.map((district) => ({
    id: district.id,
    name: districtNames[district.id] ?? district.name,
    about: district.about,
    places: district.places.filter((placeId) => placeIds.has(placeId)),
  })).filter((district) => district.places.length);
}
function districtRoute(town, fromDistrict, toDistrict) {
  if (!fromDistrict || !toDistrict) {
    return null;
  }
  let districtIds = new Set(townDistricts(town).map((district) => district.id));
  if (!districtIds.has(fromDistrict) || !districtIds.has(toDistrict)) {
    return null;
  }
  if (fromDistrict === toDistrict) {
    return [fromDistrict];
  }
  let cameFrom = new Map([[fromDistrict, null]]),
    frontier = [fromDistrict];
  for (; frontier.length;) {
    let nextFrontier = [];
    for (let current of frontier) {
      for (let [linkA, linkB] of DISTRICT_LINKS) {
        let neighbour = linkA === current ? linkB : linkB === current ? linkA : null;
        if (!(!neighbour || !districtIds.has(neighbour) || cameFrom.has(neighbour))) {
          if ((cameFrom.set(neighbour, current), neighbour === toDistrict)) {
            let route = [toDistrict];
            for (let step = current; step !== null; step = cameFrom.get(step)) {
              route.unshift(step);
            }
            return route;
          }
          nextFrontier.push(neighbour);
        }
      }
    }
    frontier = nextFrontier;
  }
  return null;
}
function townPlace(town, placeId) {
  if (placeId === HOME_PLACE.id) {
    return {
      ...HOME_PLACE,
      inside: town.homeAt ?? "apartments",
    };
  }
  if (isStreetPlace(placeId)) {
    let district = townDistricts(town).find((candidate) => candidate.id === districtOfPlace(town, placeId));
    return district
      ? {
          id: placeId,
          name: district.name,
          open: 0,
          close: 24,
          always: true,
          street: true,
          district: district.id,
        }
      : null;
  }
  return town.places.find((place) => place.id === placeId) ?? null;
}
var everydayPlaces = (town) => [
  HOME_PLACE,
  ...town.places.filter((place) => !place.residence && !place.hall && !place.events && !place.module),
];
var isResidencePlace = (placeId) => TOWN_PLACES.some((place) => place.id === placeId && place.residence);
function isPlaceOpen(place, minutes) {
  if (!place || place.events) {
    return false;
  }
  let { hour: hour } = clockFromMinutes(minutes);
  return place.open === 0 && place.close === 24
    ? true
    : place.close > place.open
      ? hour >= place.open && hour < place.close
      : hour >= place.open || hour < place.close;
}
function minutesUntilPlaceCloses(place, minutes) {
  if (!place || place.always || (place.open === 0 && place.close === 24)) {
    return 1 / 0;
  }
  if (!isPlaceOpen(place, minutes)) {
    return 0;
  }
  let { hour: hour, minute: minute } = clockFromMinutes(minutes),
    nowMinutes = hour * 60 + minute,
    closeMinutes = place.close * 60;
  if (place.close <= place.open && hour >= place.open) {
    closeMinutes += 1440;
  }
  return closeMinutes - nowMinutes;
}
var closingHourLabel = (hour) => `${String(hour % 24).padStart(2, "0")}:00`;
var closesTooSoonWhy = (place) => `Closes at ${closingHourLabel(place.close)} \xB7 not enough time`;
function routeBetweenPlaces(town, fromPlace, toPlace) {
  return townPlace(town, toPlace)
    ? districtRoute(town, districtOfPlace(town, fromPlace), districtOfPlace(town, toPlace))
    : null;
}
function travelMinutesBetween(town, fromPlace, toPlace, { hop = DISTRICT_HOP_MINUTES } = {}) {
  let route = routeBetweenPlaces(town, fromPlace, toPlace);
  if (!route) {
    return null;
  }
  let enterMinutes = isPlaceInsideAnother(toPlace) && fromPlace !== toPlace ? STORE_ENTER_MINUTES : 0;
  if (outerPlaceId(town, fromPlace) === outerPlaceId(town, toPlace)) {
    return enterMinutes;
  }
  let placeEnterMinutes = isStreetPlace(toPlace) ? 0 : PLACE_ENTER_MINUTES;
  return (route.length - 1) * hop + placeEnterMinutes + enterMinutes;
}
function placeActivitiesFor(town, placeId, { minutes = 0, skills = {}, cash = 1 / 0 } = {}) {
  let place = townPlace(town, placeId);
  return place
    ? (PLACE_ACTIVITIES[placeId] ?? []).map((activity) => {
        let needs = activity.needs ?? {},
          missingNeed = Object.entries(needs).find(([skill, needed]) => (skills[skill] ?? 0) < needed),
          open = isPlaceOpen(place, minutes),
          fitsBeforeClose = (activity.minutes ?? 0) <= minutesUntilPlaceCloses(place, minutes),
          why = open
            ? fitsBeforeClose
              ? missingNeed
                ? `Needs ${missingNeed[0][0].toUpperCase()}${missingNeed[0].slice(1)} ${missingNeed[1]} \xB7 you have ${skills[missingNeed[0]] ?? 0}`
                : (activity.costs ?? 0) > cash
                  ? `You cannot afford it: $${activity.costs}`
                  : ""
              : closesTooSoonWhy(place)
            : `${place.name} is closed right now.`;
        return {
          ...activity,
          place: placeId,
          available: !why,
          why: why,
        };
      })
    : [];
}

export {
  PLACE_ACTIVITIES,
  buildTown,
  closesTooSoonWhy,
  directPlaceActivities,
  districtOfPlace,
  districtRoute,
  everydayPlaces,
  isLuxuryPlace,
  isPlaceOpen,
  isResidencePlace,
  minutesUntilPlaceCloses,
  placeActivitiesFor,
  registerModulePlace,
  routeBetweenPlaces,
  townDistricts,
  townPlace,
  travelMinutesBetween,
};
