// Picture sizes, background subjects, picture modes and background keys
import { TOWN_DISTRICTS, TOWN_PLACES, isStreetPlace } from "../town/places.mjs";
import { districtOfPlace, townDistricts } from "../town/town-layout.mjs";
import { LIGHT_TIMES } from "./time-of-day.mjs";

var BACKGROUND_SIZES = {
  "16:9": {
    width: 1344,
    height: 768,
  },
  "3:2": {
    width: 1216,
    height: 832,
  },
  "1:1": {
    width: 1024,
    height: 1024,
  },
};
var DEFAULT_BACKGROUND_SIZE = "16:9";
var IMAGE_SIZE_LIMITS = {
  min: 64,
  max: 4096,
  pixels: 16e6,
};
var isValidImageSize = ({ width: width, height: height } = {}) =>
  [width, height].every(
    (side) => Number.isInteger(side) && side >= IMAGE_SIZE_LIMITS.min && side <= IMAGE_SIZE_LIMITS.max,
  ) && width * height <= IMAGE_SIZE_LIMITS.pixels;
function parseBackgroundSize(raw) {
  if (typeof raw == "string") {
    return Object.hasOwn(BACKGROUND_SIZES, raw)
      ? {
          ...BACKGROUND_SIZES[raw],
        }
      : null;
  }
  let size = {
    width: Number(raw?.width),
    height: Number(raw?.height),
  };
  return isValidImageSize(size) ? size : null;
}
var backgroundSizeOr = (raw) =>
  parseBackgroundSize(raw) ?? {
    ...BACKGROUND_SIZES[DEFAULT_BACKGROUND_SIZE],
  };
var backgroundSizeOf = (world) => backgroundSizeOr(world?.pictureSize);
var PORTRAIT_SIZES = {
  "2:3": {
    width: 832,
    height: 1216,
  },
  "3:4": {
    width: 896,
    height: 1152,
  },
  "9:16": {
    width: 768,
    height: 1344,
  },
};
var DEFAULT_PORTRAIT_SIZE = "2:3";
function parsePortraitSize(raw) {
  if (typeof raw == "string") {
    return Object.hasOwn(PORTRAIT_SIZES, raw)
      ? {
          ...PORTRAIT_SIZES[raw],
        }
      : null;
  }
  let size = {
    width: Number(raw?.width),
    height: Number(raw?.height),
  };
  return isValidImageSize(size) ? size : null;
}
var portraitSizeOr = (raw) =>
  parsePortraitSize(raw) ?? {
    ...PORTRAIT_SIZES[DEFAULT_PORTRAIT_SIZE],
  };
var portraitSizeOf = (world) => portraitSizeOr(world?.portraitSize);
var BACKGROUND_SUBJECTS = {
  town: {
    name: "The town \xB7 map",
    tags: "cityscape, town panorama, aerial view, rooftops, streets, skyline, wide shot",
    prose: "a wide panorama of a whole small town seen from above, rooftops, streets and the skyline",
  },
  cafe: {
    name: "Caf\xE9",
    tags: "cafe interior, coffee shop, wooden tables, counter, espresso machine, pastries display",
    prose: "the inside of a cosy neighbourhood caf\xE9, wooden tables, a counter with an espresso machine",
  },
  gym: {
    name: "Gym",
    tags: "gym interior, fitness center, weight rack, treadmills, mirrors, rubber floor",
    prose: "the inside of a modern gym, weight racks, treadmills and mirrors",
  },
  office: {
    name: "Office",
    tags: "office interior, open-plan office, desks, computer monitors, cubicles, windows",
    prose: "an open-plan office floor with desks, monitors and big windows",
  },
  market: {
    name: "Supermarket",
    tags: "supermarket interior, grocery store aisles, shelves, products, fluorescent lights",
    prose: "the aisles of a supermarket, shelves full of groceries",
  },
  park: {
    name: "Park",
    tags: "park, city park, trees, grass, walking path, benches, pond",
    prose: "a city park with trees, a walking path, benches and a small pond",
  },
  bar: {
    name: "Bar",
    tags: "bar interior, pub, bar counter, bottles, stools, dim lighting, neon sign",
    prose: "the inside of a small bar, a counter lined with bottles and stools",
  },
  library: {
    name: "Library",
    tags: "library interior, bookshelves, reading tables, lamps",
    prose: "a public library, tall bookshelves and reading tables with lamps",
  },
  restaurant: {
    name: "Restaurant",
    tags: "restaurant interior, dining room, tables with white tablecloths, candles, wine glasses, warm lighting",
    prose: "the dining room of a nice restaurant, tables with white tablecloths, candles and warm lights",
  },
  university: {
    name: "University",
    tags: "university campus, campus courtyard, academic buildings, students' benches",
    prose: "a university campus courtyard in front of the academic buildings",
  },
  mall: {
    name: "Mall",
    tags: "shopping mall interior, shop fronts, escalators, atrium, glass roof",
    prose: "the inside of a shopping mall, shop fronts, escalators and a glass roof",
  },
  hall: {
    name: "Grand Hall",
    tags: "grand hall interior, wedding venue, chandeliers, long banquet tables with white linen, flowers, a dance floor, elegant",
    prose: "a grand hall set for a wedding, chandeliers, long tables with white linen and flowers, and a dance floor",
  },
  police: {
    name: "Police Station",
    tags: "police station interior, front desk, bulletin board, waiting chairs, officers' desks, fluorescent lights",
    prose: "the inside of a small-town police station, the front desk, a bulletin board and the officers' desks behind",
  },
  hospital: {
    name: "Hospital",
    tags: "hospital interior, hospital corridor, waiting room, reception desk, clean white walls",
    prose: "the inside of a hospital, a corridor and waiting room by the reception desk",
  },
  apartments: {
    name: "Building hallway",
    tags: "apartment building hallway, corridor, doors, numbered doors, ceiling lights",
    prose: "the hallway of an apartment building, a row of numbered doors",
  },
  houses: {
    name: "Street of houses",
    tags: "residential street, suburban houses, front yards, sidewalk, street lamps",
    prose: "a quiet residential street of houses with front yards and street lamps",
  },
  "home-studio": {
    name: "Your studio",
    tags: "small studio apartment interior, bed, desk, kitchenette, window, lived-in",
    prose: "a small lived-in studio apartment, a bed, a desk and a kitchenette",
  },
  "home-shared": {
    name: "Your shared flat",
    tags: "shared apartment interior, living room, sofa, kitchen, lived-in",
    prose: "the living room of a shared flat, a sofa and an open kitchen",
  },
  "home-house": {
    name: "Your house",
    tags: "house interior, living room, sofa, fireplace, stairs, lived-in",
    prose: "the living room of a small family house, a sofa and stairs",
  },
  tower: {
    name: "Skyline Tower \xB7 lobby",
    indoor: true,
    tags: "luxury residential tower lobby, marble floor, concierge desk, elevators, tall windows, modern",
    prose: "the marble lobby of a luxury residential tower, a concierge desk, elevators and tall windows",
  },
  mansions: {
    name: "Crestview Drive",
    tags: "street of mansions, gated villas, manicured lawns, hedges, palm trees, wealthy neighbourhood",
    prose: "a quiet street of gated mansions with manicured lawns and tall hedges",
  },
  crest: {
    name: "The Crest Club",
    tags: "private members club, outdoor swimming pool, loungers, terrace bar, glass building, upscale",
    prose: "a private members' club: an outdoor pool with loungers and a terrace bar by a glass building",
  },
  boutique: {
    name: "Maison Blanc",
    indoor: true,
    tags: "luxury fashion boutique interior, designer clothes on minimal racks, marble, soft lighting, velvet fitting room, champagne",
    prose:
      "the inside of a luxury fashion boutique, designer clothes on minimal racks, marble floors and a velvet fitting room",
  },
  "home-luxury": {
    name: "Your luxury flat",
    tags: "luxury penthouse apartment interior, floor-to-ceiling windows, city view, designer furniture, open living room",
    prose: "a luxury penthouse flat with floor-to-ceiling windows over the city and designer furniture",
  },
  "home-mansion": {
    name: "Your mansion",
    tags: "mansion interior, grand living room, double-height ceiling, chandelier, sweeping staircase, elegant",
    prose: "the grand living room of a mansion, a double-height ceiling, a chandelier and a sweeping staircase",
  },
  "store-casual": {
    name: "Urban Threads",
    indoor: true,
    tags: "large clothing store interior, sections of casual wear, sportswear, suits and designer fashion, racks, mannequins, fitting rooms",
    prose:
      "the inside of a large clothes store with its sections: casual racks, sportswear, suits on mannequins and a designer corner, and fitting rooms",
  },
  furniture: {
    name: "Casa Home",
    indoor: true,
    tags: "home store interior, furniture showroom, sofas, beds, lamps, kitchen appliances display, stoves",
    prose:
      "a home store: a furniture showroom with sofas, beds and lamps arranged like rooms, and a corner of kitchen appliances",
  },
  "gift-shop": {
    name: "Little Things",
    indoor: true,
    tags: "gift shop interior, shelves of books, records, plush toys, jewelry display, cozy",
    prose: "a cosy gift shop, shelves of books, records, plush toys and a small jewelry case",
  },
  "food-court": {
    name: "Food court",
    indoor: true,
    tags: "mall food court, food stalls, tables and chairs, menu boards, indoor",
    prose: "a shopping mall food court, food stalls with menu boards and rows of tables",
  },
  cinema: {
    name: "Cinema 6",
    indoor: true,
    tags: "cinema lobby, movie theater, posters, popcorn counter, carpet, dim lighting",
    prose: "a cinema lobby with movie posters, a popcorn counter and dim lights",
  },
  arcade: {
    name: "Pixel Arcade",
    indoor: true,
    tags: "game arcade interior, arcade machines, neon lights, claw machines, rhythm games",
    prose: "a game arcade full of arcade cabinets, claw machines and neon lights",
  },
  karaoke: {
    name: "Echo Karaoke",
    indoor: true,
    tags: "karaoke room interior, private room, sofa, screen, microphones, colorful lights",
    prose: "a private karaoke room, a sofa facing a big screen, microphones and colourful lights",
  },
};
for (let district of TOWN_DISTRICTS) {
  BACKGROUND_SUBJECTS[`district-${district.id}`] = {
    name: `${district.name} \xB7 district`,
    tags: `city street, ${district.about.replace(/^(a|an|the) /, "")}, buildings, sidewalk, wide shot`,
    prose: `a street in ${district.about}`,
  };
}
var districtBackgroundSubject = (districtId) => `district-${districtId}`;
var PICTURE_KINDS = ["backgrounds", "clothes", "work", "seasons", "keys"];
var cleanPictureModes = (modes = {}) =>
  Object.fromEntries(PICTURE_KINDS.map((kind) => [kind, modes?.[kind] === "auto" ? "auto" : "manual"]));
var pictureModeOf = (world, kind) => (world?.pictures?.[kind] === "auto" ? "auto" : "manual");
var homeBackgroundSubject = (homeKind) =>
  ({
    house: "home-house",
    shared: "home-shared",
    luxury: "home-luxury",
    mansion: "home-mansion",
  })[homeKind] ?? "home-studio";
var residenceBackgroundSubject = (residencePlace, homeKind) =>
  ({
    houses: "home-house",
    tower: "home-luxury",
    mansions: "home-mansion",
  })[residencePlace] ??
  (["house", "luxury", "mansion"].includes(homeKind) ? "home-studio" : homeBackgroundSubject(homeKind));
var backgroundKey = (subject, time) => `${subject}|${time}`;
var backgroundKeyFor = (subject, time) => backgroundKey(subject, BACKGROUND_SUBJECTS[subject]?.indoor ? "day" : time);
var parseBackgroundKey = (key) => {
  let [subject, time] = String(key).split("|");
  return {
    subject: subject,
    time: time,
  };
};
function backgroundSubjectOfPlace(placeId, homeKind) {
  return placeId === "home"
    ? homeBackgroundSubject(homeKind)
    : isStreetPlace(placeId)
      ? districtBackgroundSubject(districtOfPlace(null, placeId))
      : BACKGROUND_SUBJECTS[placeId]
        ? placeId
        : null;
}
function neededBackgroundKeys(world, extraSubjects = []) {
  let placeIds = new Set((world.town?.places ?? TOWN_PLACES).map((place) => place.id)),
    subjects = [
      "town",
      ...townDistricts(
        world.town ?? {
          places: TOWN_PLACES,
        },
      ).map((district) => districtBackgroundSubject(district.id)),
      ...TOWN_PLACES.filter((place) => placeIds.has(place.id) && BACKGROUND_SUBJECTS[place.id]).map(
        (place) => place.id,
      ),
      homeBackgroundSubject(world.wallet?.home),
      ...new Set(
        (world.characters ?? [])
          .filter((person) => !person.away && person.residence?.place)
          .map((person) => residenceBackgroundSubject(person.residence.place, world.wallet?.home)),
      ),
      ...extraSubjects.filter((subject) => BACKGROUND_SUBJECTS[subject]),
    ];
  return [...new Set(subjects)].flatMap((subject) =>
    BACKGROUND_SUBJECTS[subject]?.indoor
      ? [backgroundKey(subject, "day")]
      : LIGHT_TIMES.map((time) => backgroundKey(subject, time)),
  );
}

export {
  BACKGROUND_SUBJECTS,
  IMAGE_SIZE_LIMITS,
  PICTURE_KINDS,
  backgroundKeyFor,
  backgroundSizeOf,
  backgroundSizeOr,
  backgroundSubjectOfPlace,
  cleanPictureModes,
  districtBackgroundSubject,
  neededBackgroundKeys,
  parseBackgroundKey,
  parseBackgroundSize,
  parsePortraitSize,
  pictureModeOf,
  portraitSizeOf,
  portraitSizeOr,
  residenceBackgroundSubject,
};
