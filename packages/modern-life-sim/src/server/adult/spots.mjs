// Pair tension, public spots with catch chances, ask moods and intimate scene backdrops
import { turnedDownHurt } from "./consent.mjs";
import { familyPairBarsRomance } from "../relationships/kin.mjs";

var NO_SPARK_PAIR_KINDS = ["rivals", "ex", "family"];
var PARTY_PAIR_CLOSE_GAIN = 6;
var PAIR_COOLDOWN_DAYS = [3, 3, 2, 1];
var onPairCooldown = (lastDay, today, tier) =>
  lastDay != null && today - lastDay <= (PAIR_COOLDOWN_DAYS[tier] ?? PAIR_COOLDOWN_DAYS[1]);
var GROUP_INTIMACY_CHANCE = 0.5;
// Family only blocks a spark while the familyRomance rule is off.
function pairTensionBelow(state, pair, threshold) {
  return !pair ||
    (NO_SPARK_PAIR_KINDS.includes(pair.kind) && (pair.kind !== "family" || familyPairBarsRomance(state, pair)))
    ? false
    : (pair.yours?.tension ?? 0) < threshold;
}
var PUBLIC_SPOTS = {
  cafe: {
    name: "The bathroom",
    base: 0.02,
    look: "spot-bathroom",
  },
  gym: {
    name: "The showers",
    base: 0.03,
    look: "spot-showers",
  },
  office: {
    name: "The rooftop",
    base: 0.01,
    look: "spot-rooftop",
  },
  market: {
    name: "The staff bathroom",
    base: 0.02,
    look: "spot-bathroom",
  },
  park: {
    name: "Behind the trees",
    base: 0.02,
  },
  bar: {
    name: "The back alley",
    base: 0.02,
    look: "spot-alley",
  },
  library: {
    name: "Between the back shelves",
    base: 0.02,
  },
  university: {
    name: "An empty classroom",
    base: 0.01,
    look: "spot-classroom",
  },
  restaurant: {
    name: "The bathroom",
    base: 0.02,
    look: "spot-bathroom",
  },
  hospital: {
    name: "An empty room",
    base: 0.02,
    look: "spot-room",
  },
  "store-casual": {
    name: "The fitting room",
    base: 0.03,
    proper: true,
    look: "spot-fitting-room",
  },
  furniture: {
    name: "A display bedroom",
    base: 0.03,
    proper: true,
  },
  club: {
    name: "The VIP room",
    base: 0.08,
    look: "spot-vip",
  },
  "food-court": {
    name: "The bathroom",
    base: 0.02,
    look: "spot-bathroom",
  },
  cinema: {
    name: "The projection room",
    base: 0.01,
    proper: true,
    look: "spot-projection",
  },
  arcade: {
    name: "The photo booth",
    base: 0.03,
    proper: true,
    look: "spot-photo-booth",
  },
};
var SPOT_CHANCE_PER_PERSON = 0.01;
var SPOT_BUSY_HOURS = [
  [12, 14],
  [17, 20],
];
var SPOT_BUSY_FACTOR = 1.5;
var SPOT_QUIET_FACTOR = 0.5;
var SPOT_RISKY_FROM = 0.04;
var SPOT_BAN_DAYS = 3;
var SPOT_FINE = 100;
var BOLD_SPOT_GAINS = {
  romance: 2,
};
function spotCatchChance(spot, { people = 0, hour = 12, closesIn = 24 } = {}) {
  if (!spot) {
    return 0;
  }
  let chance = spot.base + SPOT_CHANCE_PER_PERSON * Math.max(0, people);
  if (SPOT_BUSY_HOURS.some(([busyFrom, busyTo]) => hour >= busyFrom && hour < busyTo)) {
    chance *= SPOT_BUSY_FACTOR;
  } else if (hour >= 22 || hour < 6 || closesIn <= 1) {
    chance *= SPOT_QUIET_FACTOR;
  }
  return Math.round(chance * 1e3) / 1e3;
}
var spotRiskLabel = (chance) => (chance >= SPOT_RISKY_FROM ? "risky" : "a little risky");
var daringAllowsSpot = (daring, spotBase) => daring === "bold" || (daring === "either" && spotBase < SPOT_RISKY_FROM);
var placeWithArticle2 = (spotId, label) => (PUBLIC_SPOTS[spotId]?.proper ? label : `the ${label}`);
var ASK_MOOD_MIN = 80;
var ASK_MOOD_HIGH = 90;
var ASK_MOOD_BOOST = 1.5;
var halvedTurnDownHurt = (hurt) => {
  let { days: days, ...rest } = turnedDownHurt(hurt);
  return {
    ...Object.fromEntries(
      Object.entries(rest)
        .map(([key, value]) => [key, Math.trunc(value / 2)])
        .filter(([, value]) => value),
    ),
    days: Math.ceil(days / 2),
  };
};
var INTIMATE_BACKDROPS = {
  "spot-bathroom": {
    name: "A bathroom",
    indoor: true,
    tags: "public restroom interior, clean bathroom, row of sinks, long mirror, tiled walls, stall doors, soft lighting",
    prose: "a clean public restroom, a row of sinks under a long mirror, tiled walls and stall doors",
  },
  "spot-showers": {
    name: "Gym \xB7 the showers",
    indoor: true,
    tags: "gym locker room, tiled shower area, shower heads, benches, lockers, steam",
    prose: "the showers of a gym's locker room, tiled, with benches and a row of lockers",
  },
  "spot-rooftop": {
    name: "Office \xB7 the rooftop",
    tags: "office building rooftop, railing, air conditioning units, city skyline, open sky",
    prose: "the rooftop of an office building, a railing, air conditioning units and the city skyline",
  },
  "spot-alley": {
    name: "Bar \xB7 the back alley",
    tags: "back alley, narrow alley behind a bar, brick walls, back door, wall lamp, crates",
    prose: "the narrow back alley behind a bar, brick walls, a back door under a wall lamp",
  },
  "spot-classroom": {
    name: "University \xB7 an empty classroom",
    indoor: true,
    tags: "empty classroom, lecture room, rows of desks, whiteboard, tall windows",
    prose: "an empty university classroom, rows of desks facing a whiteboard and tall windows",
  },
  "spot-room": {
    name: "Hospital \xB7 an empty room",
    indoor: true,
    tags: "empty hospital room, hospital bed, privacy curtain, bedside monitor, window blinds",
    prose: "an empty hospital room, a bed with a privacy curtain, a bedside monitor and a window with blinds",
  },
  "spot-fitting-room": {
    name: "Urban Threads \xB7 the fitting room",
    indoor: true,
    tags: "fitting room interior, changing booth, curtain, full-length mirror, hooks, small stool",
    prose: "a fitting room of a clothes store, a curtain, a full-length mirror, hooks and a small stool",
  },
  "spot-projection": {
    name: "Cinema 6 \xB7 the projection room",
    indoor: true,
    tags: "cinema projection room, film projector, small window to the theater, film reels, dim light",
    prose: "a cinema's projection room, a projector at a small window over the theater and film reels, in dim light",
  },
  "spot-photo-booth": {
    name: "Pixel Arcade \xB7 the photo booth",
    indoor: true,
    tags: "photo booth interior, small booth, bench, curtain, camera screen, colorful lights",
    prose: "the inside of a small photo booth, a bench, a curtain and a camera screen with colourful lights",
  },
  "spot-vip": {
    name: "Scarlet Club \xB7 the VIP room",
    indoor: true,
    tags: "private VIP lounge, velvet sofa, red and purple neon light, low table, curtain, dim",
    prose: "a small private VIP lounge, a velvet sofa under red and purple neon, a low table and a heavy curtain",
  },
  "trip-beach": {
    name: "The beach \xB7 your room",
    indoor: true,
    tags: "beach resort hotel room, large bed, open balcony doors, sea view, sheer curtains, warm lamps, evening",
    prose:
      "a beach resort's hotel room in the evening, a large bed, balcony doors open onto the sea and sheer curtains",
  },
  "trip-mountains": {
    name: "The mountains \xB7 your room",
    indoor: true,
    tags: "mountain lodge bedroom, wooden walls, large bed, fireplace, window with snowy peaks, warm light, evening",
    prose:
      "a mountain lodge's bedroom in the evening, wooden walls, a large bed by the fireplace and snowy peaks in the window",
  },
  "trip-city": {
    name: "The city \xB7 your room",
    indoor: true,
    tags: "luxury hotel suite, large bed, floor-to-ceiling windows, city skyline at night, soft lamps",
    prose: "a luxury hotel suite at night, a large bed and floor-to-ceiling windows onto the city skyline",
  },
};
var tripBackdropId = (tripKind) => (INTIMATE_BACKDROPS[`trip-${tripKind}`] ? `trip-${tripKind}` : null);

export {
  ASK_MOOD_BOOST,
  ASK_MOOD_HIGH,
  ASK_MOOD_MIN,
  BOLD_SPOT_GAINS,
  GROUP_INTIMACY_CHANCE,
  INTIMATE_BACKDROPS,
  PARTY_PAIR_CLOSE_GAIN,
  PUBLIC_SPOTS,
  SPOT_BAN_DAYS,
  SPOT_FINE,
  daringAllowsSpot,
  halvedTurnDownHurt,
  onPairCooldown,
  pairTensionBelow,
  placeWithArticle2,
  spotCatchChance,
  spotRiskLabel,
  tripBackdropId,
};
