// In-game guide categories, articles and game-value placeholders
import { DRIFT_DAYS_BY_KNOB } from "../relationships/archetypes.mjs";
import { STARTING_SKILL_MAX, STARTING_SKILL_POINTS } from "../skills/skill-levels.mjs";
import { SKILL_PERK_LEVELS } from "../skills/skill-perks.mjs";
import {
  BOND_TIER_NAMES,
  BOND_TIER_THRESHOLDS,
  COUPLE_FRIENDSHIP_TIER_NAMES,
  FAMILY_FRIENDSHIP_TIER_NAMES,
  FRIEND_DRIFT_FACTOR,
  RELATIONSHIP_STATUS_LABELS,
  STATUS_STEPS,
} from "../relationships/bonds.mjs";
import { RECONCILE_RULES, TALK_TRUST_FLOOR } from "../relationships/milestones.mjs";
import { SCENE_KINDS } from "../scenes/scene-config.mjs";
import {
  BAG_SLOTS,
  EVENING_DELIVERY_HOUR,
  FRIDGE_SPOIL_SLOWDOWN,
  ITEM_CATALOG,
  ONLINE_DELIVERY_HOUR,
} from "../items/catalog.mjs";
import { DISH_QUALITIES, RECIPES, WELL_FED_HOURS, WELL_FED_HUNGER_SLOWDOWN } from "../items/cooking.mjs";
import { LIBRARY_LOAN_DAYS } from "../items/inventory.mjs";
import { RECENT_FACT_DAYS } from "../network/town-facts.mjs";
import {
  INVITE_NO_COOLDOWN_HOURS,
  MAX_PLANS,
  OUTING_KINDS,
  OUTING_LATENESS,
  OUTING_LIMITS,
  PLAN_DAYS_AHEAD,
} from "../outings/outing-rules.mjs";
import { KNOCK_FRIENDSHIP_TIER } from "../visits/home-visits.mjs";
import {
  DAYS_OFF_PER_SEASON,
  OFFICE_HOURS_LABEL,
  OFFICE_POSITIONS,
  OFFICE_SHIFT,
  OVERTIME_PER_WEEK,
  PROMOTION_PERFORMANCE_NEEDED,
  REVIEW_DAYS_OF_SEASON,
  WARNINGS_TO_FIRE,
  WARNING_MEMORY_DAYS,
} from "../jobs/office-rules.mjs";
import {
  FIRED_WAIT_DAYS,
  LATES_TO_WARN,
  LATE_FROM_HOUR,
  LUNCH_BREAK,
  OVERTIME,
  REAPPLY_WAIT_DAYS,
} from "../jobs/office-job.mjs";
import { HOME_KINDS, HOME_RESALE_SHARE, MORTGAGE_TERMS } from "../home/home-kinds.mjs";
import {
  COLLECTIONS_WAGE_SHARE,
  HOSPITAL_BILL_DUE_DAYS,
  HOSPITAL_OVERDUE_FEE,
  LATE_PAYMENT_FEE,
  STARTING_SAVINGS,
} from "../money/wallet.mjs";
import {
  ENERGY_DRAIN_PER_HOUR,
  HUNGER_DRAIN_PER_HOUR,
  NEEDS_MAX,
  SLEEP_ENERGY_PER_HOUR,
  maxEnergyFor,
} from "../needs/needs.mjs";
import { DISTRICT_HOP_MINUTES, PLACE_ENTER_MINUTES, TOWN_DISTRICTS } from "../town/places.mjs";
import { PLACE_ACTIVITIES } from "../town/town-layout.mjs";
import { SLEEP_MAX_MINUTES, SLEEP_MIN_MINUTES } from "../sleep/sleep-options.mjs";
import { LENT_WAIT_DAYS } from "../money/pleas-and-loans.mjs";
import { DROP_HOURS, GUEST_NIGHT_FROM } from "../social/guest-visits.mjs";
import { BDAY_GIFT_TIMES, PARTY_AROUND, PARTY_PLAN_DAYS } from "../relationships/birthday-events.mjs";
import {
  PARTY_AHEAD_DAYS,
  PARTY_ARRIVE,
  PARTY_EVERY_DAYS,
  PARTY_FOOD,
  PARTY_FROM_TIER,
} from "../parties/house-party.mjs";
import { LOAN_DAYS, LOAN_MAX } from "../relationships/friend-perks.mjs";
import { GROCERIES_EVERY_DAYS, MATE_FROM_TIER, MATE_STAYS_TIER, ROOM_RENT_SHARE } from "../home/housemates.mjs";
import { EVICTION_HOUR, STREET_PARKING_FEE } from "../home/residence.mjs";
import { SEEN_CHANCE } from "../social/witnesses.mjs";
import { GUESTS_MAX, WEDDING_VENUES } from "../romance/wedding.mjs";
import { HONEYMOON_DAYS } from "../romance/wedding-morning.mjs";
import { CLERK_DISCOUNT } from "../shop/store-counter.mjs";
import { COLLAPSE_RULES, MAX_IN_TOWN, QUICK_PER_DAY } from "../game.mjs";
import { MAX_SETUP_PRESETS } from "../setup/setup-presets.mjs";

var GUIDE_CATEGORIES = [
  {
    id: "start",
    name: "Getting started",
  },
  {
    id: "day",
    name: "Your day",
  },
  {
    id: "town",
    name: "Around town",
  },
  {
    id: "home",
    name: "At home",
  },
  {
    id: "money",
    name: "Money",
  },
  {
    id: "work",
    name: "Work",
  },
  {
    id: "skills",
    name: "Skills",
  },
  {
    id: "people",
    name: "People",
  },
  {
    id: "talk",
    name: "Talking",
  },
  {
    id: "out",
    name: "Going out",
  },
  {
    id: "love",
    name: "Love",
  },
  {
    id: "look",
    name: "Pictures and settings",
  },
];
var guideTermMarker = (term) => `\u27E6${term}\u27E7`;
var findActivityById = (id) =>
  Object.values(PLACE_ACTIVITIES)
    .flat()
    .find((activity) => activity.id === id);
var formatPercent = (fraction) => `${Math.round(fraction * 100)}%`;
var minutesToHoursText = (minutes) => `${minutes / 60}`;
var formatHourOfDay = (hour) => `${String(hour).padStart(2, "0")}:00`;
var ordinalSuffix = (n) =>
  `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
var formatDollars = (amount) => `$${amount.toLocaleString("en-US")}`;
var withIndefiniteArticle = (word) => `${/^[AEIOU]/i.test(word) ? "an" : "a"} ${guideTermMarker(word)}`;
var joinWithAnd = (words) => `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
var timesInWords = (count) => (count === 1 ? "once" : count === 2 ? "twice" : `${count} times`);
var describeTierLadder = (axis) => {
  let steps = BOND_TIER_NAMES[axis]
    .slice(1)
    .map((tierName, index) => `${guideTermMarker(tierName)} at ${BOND_TIER_THRESHOLDS[index + 1]}`);
  return `${axis === "romance" ? "nothing" : guideTermMarker(BOND_TIER_NAMES[axis][0])}, then ${joinWithAnd(steps)}`;
};
var tierLabelMarker = (axis, tier) => guideTermMarker(BOND_TIER_NAMES[axis][tier]);
var guideLookupEntry = (step) => STATUS_STEPS[step];
var romanceTierMarkerFor = (threshold) =>
  guideTermMarker(BOND_TIER_NAMES.romance[BOND_TIER_THRESHOLDS.indexOf(threshold)]);
var trustTierMarkerFor = (threshold) => guideTermMarker(BOND_TIER_NAMES.trust[BOND_TIER_THRESHOLDS.indexOf(threshold)]);
var GUIDE_ITEM_PRICES = Object.values(WEDDING_VENUES).map((venue) => venue.price);
var formatFractionWord = (fraction) => (fraction === 0.5 ? "half" : formatPercent(fraction));
var RECIPE_PORTION_COUNTS = RECIPES.map((recipe) => recipe.portions);
var CHEAPEST_SUIT_PRICE = Math.min(
  ...Object.values(ITEM_CATALOG)
    .filter((item) => item.formal && !item.wedding && !item.luxury && !item.season && item.store && item.price > 0)
    .map((item) => item.price),
);
var GUIDE_VALUES = {
  energyBase: NEEDS_MAX,
  energyPerFitness: maxEnergyFor(1) - maxEnergyFor(0),
  energyAwake: ENERGY_DRAIN_PER_HOUR,
  hungerAwake: HUNGER_DRAIN_PER_HOUR,
  sleepMin: minutesToHoursText(SLEEP_MIN_MINUTES),
  sleepMax: minutesToHoursText(SLEEP_MAX_MINUTES),
  sleepHouse: Math.round(SLEEP_ENERGY_PER_HOUR * HOME_KINDS.house.bedQuality),
  sleepApartment: Math.round(SLEEP_ENERGY_PER_HOUR * HOME_KINDS.apartment.bedQuality),
  collapseHours: minutesToHoursText(COLLAPSE_RULES.minutes),
  collapseBill: formatDollars(COLLAPSE_RULES.bill),
  daysPerSeason: 30,
  seasonsPerYear: 4,
  startSkillPoints: STARTING_SKILL_POINTS,
  startSkillCap: STARTING_SKILL_MAX,
  savingsTight: formatDollars(STARTING_SAVINGS.tight),
  savingsNormal: formatDollars(STARTING_SAVINGS.normal),
  savingsComfortable: formatDollars(STARTING_SAVINGS.comfortable),
  presetsMax: MAX_SETUP_PRESETS,
  districtNames: joinWithAnd(TOWN_DISTRICTS.map((district) => guideTermMarker(district.name))),
  districtCount: TOWN_DISTRICTS.length,
  insideMinutes: PLACE_ENTER_MINUTES,
  hopMinutes: DISTRICT_HOP_MINUTES,
  motoPrice: formatDollars(ITEM_CATALOG.motorbike.price),
  carPrice: formatDollars(ITEM_CATALOG.car.price),
  streetParking: formatDollars(STREET_PARKING_FEE),
  motoHop: ITEM_CATALOG.motorbike.hop,
  carHop: ITEM_CATALOG.car.hop,
  deliveryHour: formatHourOfDay(ONLINE_DELIVERY_HOUR),
  suitFrom: formatDollars(CHEAPEST_SUIT_PRICE),
  tonightHour: formatHourOfDay(EVENING_DELIVERY_HOUR),
  discountFriend: `${CLERK_DISCOUNT.friend}%`,
  discountPartner: `${CLERK_DISCOUNT.partner}%`,
  friendTier: tierLabelMarker("friendship", 2),
  bagSlots: BAG_SLOTS,
  fridgeKeeps: timesInWords(FRIDGE_SPOIL_SLOWDOWN),
  lendDays: LIBRARY_LOAN_DAYS,
  wellFedHours: WELL_FED_HOURS,
  wellFedPace: formatFractionWord(WELL_FED_HUNGER_SLOWDOWN),
  burntFill: formatFractionWord(DISH_QUALITIES.burnt.hunger),
  portionsMin: Math.min(...RECIPE_PORTION_COUNTS),
  portionsMax: Math.max(...RECIPE_PORTION_COUNTS),
  noodles: formatDollars(ITEM_CATALOG.noodles.price),
  bento: formatDollars(ITEM_CATALOG.bento.price),
  knockTier: tierLabelMarker("friendship", KNOCK_FRIENDSHIP_TIER),
  hospitalDays: HOSPITAL_BILL_DUE_DAYS,
  hospitalFee: formatPercent(HOSPITAL_OVERDUE_FEE),
  collections: formatPercent(COLLECTIONS_WAGE_SHARE),
  apartmentRent: formatDollars(HOME_KINDS.apartment.rent),
  houseRent: formatDollars(HOME_KINDS.house.rent),
  luxuryRent: formatDollars(HOME_KINDS.luxury.rent),
  mansionRent: formatDollars(HOME_KINDS.mansion.rent),
  apartmentPrice: formatDollars(HOME_KINDS.apartment.price),
  mansionPrice: formatDollars(HOME_KINDS.mansion.price),
  mortgageDown: formatPercent(MORTGAGE_TERMS.down),
  mortgageSeasons: MORTGAGE_TERMS.seasons,
  resale: formatPercent(HOME_RESALE_SHARE),
  rentFee: formatPercent(LATE_PAYMENT_FEE),
  evictHour: formatHourOfDay(EVICTION_HOUR),
  loanMax: formatDollars(LOAN_MAX),
  loanDays: LOAN_DAYS,
  lentWait: LENT_WAIT_DAYS,
  closeTier: tierLabelMarker("friendship", 3),
  dropFrom: `${DROP_HOURS[0]}:00`,
  dropTo: `${DROP_HOURS[1]}:00`,
  guestNight: `${GUEST_NIGHT_FROM}:00`,
  partyTier: tierLabelMarker("friendship", PARTY_FROM_TIER),
  partyAhead: PARTY_AHEAD_DAYS,
  partyEvery: PARTY_EVERY_DAYS,
  partyArrive: PARTY_ARRIVE,
  snacks: formatDollars(PARTY_FOOD.snacks.perGuest),
  catering: formatDollars(PARTY_FOOD.catering.perGuest),
  apartmentGuests: HOME_KINDS.apartment.guests,
  mansionGuests: HOME_KINDS.mansion.guests,
  mateTier: tierLabelMarker("friendship", MATE_FROM_TIER),
  mateStays: tierLabelMarker("friendship", MATE_STAYS_TIER),
  apartmentRooms: HOME_KINDS.apartment.rooms,
  houseRooms: HOME_KINDS.house.rooms,
  luxuryRooms: HOME_KINDS.luxury.rooms,
  mansionRooms: HOME_KINDS.mansion.rooms,
  roomShare: `${Math.round(ROOM_RENT_SHARE * 100)}%`,
  groceriesDays: GROCERIES_EVERY_DAYS,
  shiftText: OFFICE_HOURS_LABEL,
  shiftEnergy: OFFICE_SHIFT.energy,
  reviewDays: REVIEW_DAYS_OF_SEASON.map(ordinalSuffix).join(" and the "),
  warnings: WARNINGS_TO_FIRE,
  warningsFade: WARNING_MEMORY_DAYS,
  firstPay: formatDollars(OFFICE_POSITIONS[0].pay),
  topPay: formatDollars(OFFICE_POSITIONS[OFFICE_POSITIONS.length - 1].pay),
  firstJob: withIndefiniteArticle(OFFICE_POSITIONS[0].name),
  topJob: withIndefiniteArticle(OFFICE_POSITIONS[OFFICE_POSITIONS.length - 1].name),
  promoteAt: PROMOTION_PERFORMANCE_NEEDED,
  retryDays: REAPPLY_WAIT_DAYS,
  firedDays: FIRED_WAIT_DAYS,
  onTime: formatHourOfDay(LATE_FROM_HOUR),
  latesToWarn: LATES_TO_WARN,
  lunch: `${formatHourOfDay(LUNCH_BREAK.from)} to ${formatHourOfDay(LUNCH_BREAK.to)}`,
  overtimeHours: minutesToHoursText(OVERTIME.minutes),
  overtimeRate: `${OVERTIME.rate}\xD7`,
  overtimeWeek: timesInWords(OVERTIME_PER_WEEK),
  daysOff: DAYS_OFF_PER_SEASON,
  maxLevel: 10,
  perkFlirt: SKILL_PERK_LEVELS.flirtIsSafe,
  perkFirst: SKILL_PERK_LEVELS.firstImpression,
  perkWork: SKILL_PERK_LEVELS.moreAtWork,
  perkBest: SKILL_PERK_LEVELS.seesBestOption,
  perkRead: SKILL_PERK_LEVELS.readingDouble,
  perkChallenge: SKILL_PERK_LEVELS.challengeBonus,
  perkOvertime: SKILL_PERK_LEVELS.overtimeEase,
  freeUpTo: findActivityById("run").upTo.fitness,
  gym: formatDollars(findActivityById("workout").costs),
  library: formatDollars(findActivityById("study").costs),
  borrow: formatDollars(findActivityById("borrow").costs),
  quickPerDay: QUICK_PER_DAY === 1 ? "once" : `${QUICK_PER_DAY} times`,
  friendshipTiers: describeTierLadder("friendship"),
  coupleTiers: joinWithAnd(COUPLE_FRIENDSHIP_TIER_NAMES.map(guideTermMarker)),
  familyTiers: joinWithAnd(FAMILY_FRIENDSHIP_TIER_NAMES.slice(1).map(guideTermMarker)),
  romanceTiers: describeTierLadder("romance"),
  trustTiers: describeTierLadder("trust"),
  friendlyTier: tierLabelMarker("friendship", 1),
  bestTier: tierLabelMarker("friendship", 4),
  trustingTier: tierLabelMarker("trust", 2),
  bdayTimes: timesInWords(BDAY_GIFT_TIMES),
  partyAround: PARTY_AROUND,
  partyPlan: PARTY_PLAN_DAYS,
  seenSmall: formatPercent(SEEN_CHANCE.small),
  seenBig: formatPercent(SEEN_CHANCE.big),
  forgetsDays: RECENT_FACT_DAYS,
  talkExchanges: SCENE_KINDS.talk.exchanges,
  hangName: guideTermMarker(OUTING_KINDS.hang.name),
  dateName: guideTermMarker(OUTING_KINDS.date.name),
  curiousTier: tierLabelMarker("romance", 1),
  aheadDays: PLAN_DAYS_AHEAD,
  plansMax: MAX_PLANS,
  noAgain: INVITE_NO_COOLDOWN_HOURS,
  lateOk: OUTING_LATENESS.ok,
  lateLeaves: OUTING_LATENESS.leaves,
  outingHours: OUTING_LIMITS.minutes / 60 === 2.5 ? "two and a half" : minutesToHoursText(OUTING_LIMITS.minutes),
  datingRomance: romanceTierMarkerFor(guideLookupEntry("dating").romance),
  datingTrust: trustTierMarkerFor(guideLookupEntry("dating").trust),
  partnersRomance: romanceTierMarkerFor(guideLookupEntry("partners").romance),
  partnersTrust: trustTierMarkerFor(guideLookupEntry("partners").trust),
  partnersDays: guideLookupEntry("partners").days,
  livingTrust: trustTierMarkerFor(guideLookupEntry("living").trust),
  engagedRomance: romanceTierMarkerFor(guideLookupEntry("engaged").romance),
  marriedTrust: trustTierMarkerFor(guideLookupEntry("married").trust),
  marriedDays: guideLookupEntry("married").days,
  single: guideTermMarker(RELATIONSHIP_STATUS_LABELS.single),
  dating: guideTermMarker(RELATIONSHIP_STATUS_LABELS.dating),
  partners: guideTermMarker(RELATIONSHIP_STATUS_LABELS.partners),
  living: guideTermMarker(RELATIONSHIP_STATUS_LABELS.living),
  engaged: guideTermMarker(RELATIONSHIP_STATUS_LABELS.engaged),
  married: guideTermMarker(RELATIONSHIP_STATUS_LABELS.married),
  trustTooLow: TALK_TRUST_FLOOR,
  reconcileDays: RECONCILE_RULES.days,
  reconcileTrust: tierLabelMarker("trust", RECONCILE_RULES.trust),
  reconcileBetrayed: tierLabelMarker("trust", RECONCILE_RULES.trustBetrayed),
  reconcileRomance: tierLabelMarker("romance", RECONCILE_RULES.romance),
  driftMin: Math.min(...DRIFT_DAYS_BY_KNOB),
  driftMax: Math.max(...DRIFT_DAYS_BY_KNOB),
  friendDrift: timesInWords(FRIEND_DRIFT_FACTOR),
  guestsMax: GUESTS_MAX,
  honeymoonDays: HONEYMOON_DAYS,
  venueMin: formatDollars(Math.min(...GUIDE_ITEM_PRICES)),
  venueMax: formatDollars(Math.max(...GUIDE_ITEM_PRICES)),
  albumMax: 400,
  maxInTown: MAX_IN_TOWN,
};
var GUIDE_ARTICLES = [
  {
    id: "new-life",
    cat: "start",
    title: "Starting a new life",
    words: "create creation new game start cast preset draft",
    text: [
      "Pick \u27E6NEW LIFE\u27E7 on the title screen and go step by step: who you are, the world (your model, the town, the season), the people around you, your home, the rules and the pictures.",
      "Only a few things are a must: a name for the life, who you play, a model, and at least one person from your cards. Everything else has a sensible default, so you can jump to \u27E6START\u27E7 whenever you like.",
      "For each person, \u27E6To you\u27E7 says what they are to you when it starts: how well they know you, or your family (they're never romantic with you), your partner, your ex or your rival. Your partner has to be someone who could be.",
      "You get {startSkillPoints} points to share between \u27E6Fitness\u27E7, \u27E6Charm\u27E7 and \u27E6Knowledge\u27E7, at most {startSkillCap} in one. You also pick how much money you start with: {savingsTight}, {savingsNormal} or {savingsComfortable}.",
      "Your choices save as you go, so you can leave and come back. Like how you set a life up? Save it as a preset and start from it again (up to {presetsMax}).",
      "When you first arrive in town, a card on the map tells you where you stand: your home, your money, the job you still need and who you already know.",
    ],
    see: ["phone", "lives", "skills"],
  },
  {
    id: "phone",
    cat: "start",
    title: "Your phone",
    words: "apps profile contacts calendar badge",
    text: [
      "Almost everything besides walking around happens on your phone: \u27E6PROFILE\u27E7 with your needs, skills and money, \u27E6CONTACTS\u27E7 with everyone you know, \u27E6JOBS\u27E7, \u27E6CALENDAR\u27E7, \u27E6BILLS\u27E7, \u27E6HOMES\u27E7, \u27E6SHOP\u27E7, \u27E6NEWS\u27E7, \u27E6SETTINGS\u27E7 and this \u27E6GUIDE\u27E7.",
      "Some apps only show up when they matter: \u27E6WEDDING\u27E7 while a wedding is being planned, \u27E6GALLERY\u27E7 once there are pictures to keep.",
      "A number or a \xAB!\xBB on an app means something is waiting for you there.",
    ],
    see: ["new-life", "settings"],
  },
  {
    id: "lives",
    cat: "start",
    title: "Your lives",
    words: "save load continue delete duplicate rename",
    text: [
      "You can keep several lives at once. \u27E6CONTINUE\u27E7 opens the last one you played, and \u27E6LOAD LIFE\u27E7 shows them all.",
      "The \u22EF on each one lets you rename it, duplicate it, save how it was set up as a preset, or delete it. Deleting asks you to type its name, and it can't be undone.",
      "It's an alpha: a life from an older version may not load after an update. The game warns you when that happens.",
    ],
    see: ["new-life"],
  },
  {
    id: "energy",
    cat: "day",
    title: "Energy",
    words: "tired sleep rest exhausted",
    text: [
      "Almost everything you do costs some energy, and just being awake takes about {energyAwake} an hour. Sleep and rest give it back.",
      "Your top energy is {energyBase}, plus {energyPerFitness} for every level of [[skills|\u27E6Fitness\u27E7]]. If it ever hits zero, you [[collapse|collapse]].",
    ],
    see: ["sleep", "hunger", "collapse"],
  },
  {
    id: "hunger",
    cat: "day",
    title: "Hunger",
    words: "food eat fridge cook starving",
    text: [
      "You get hungrier by about {hungerAwake} an hour while you're awake, and more slowly while you sleep.",
      "Eat something from your fridge, [[cooking|cook at home]], or grab a bite at the caf\xE9. Going hungry for too long makes your [[energy|energy]] drain twice as fast.",
    ],
    see: ["energy", "cooking", "home"],
  },
  {
    id: "sleep",
    cat: "day",
    title: "Sleep",
    words: "bed night hours rest",
    text: [
      "You sleep at home, and you choose how long: anywhere from {sleepMin} to {sleepMax} hours. Got work in the morning after a late night? Sleep less and get there on time.",
      "A better bed gives more [[energy|energy]] back: about {sleepHouse} an hour in a house and {sleepApartment} in an apartment, and more with a better bed from the furniture store.",
    ],
    see: ["energy", "rent", "home"],
  },
  {
    id: "collapse",
    cat: "day",
    title: "Collapsing",
    words: "faint hospital passed out zero energy",
    text: [
      "When your [[energy|energy]] hits zero, you collapse right where you are, even in the middle of a conversation. You wake up in the hospital {collapseHours} hours later, fed and with half your energy back.",
      "The hospital bill is {collapseBill}. Nothing is taken from you on the spot: it goes to [[bills|\u27E6BILLS\u27E7]], and you have {hospitalDays} days to pay it. Sometimes someone close to you shows up and covers part of it, and you pay them back later.",
      "Whoever was with you remembers it: collapse in the middle of a talk or an outing, and it stays in their memories. A party that night, yours or theirs, is called off at no cost, and they know why. On your honeymoon, the trip goes on once you're out of the hospital, for the days that were left.",
    ],
    see: ["bills", "energy", "memories"],
  },
  {
    id: "time",
    cat: "day",
    title: "Days and seasons",
    words: "calendar season year week spring summer autumn winter notes",
    text: [
      "A season lasts {daysPerSeason} days and a year has {seasonsPerYear}: Spring, Summer, Autumn and Winter. Weeks run from Monday to Sunday.",
      "The \u27E6CALENDAR\u27E7 app shows a season at a time: your shifts, rent day, your plans, the birthdays you know, your wedding and anniversaries, and notes you write yourself.",
    ],
    see: ["plans", "birthdays"],
  },
  {
    id: "districts",
    cat: "town",
    title: "The town and its districts",
    words: "map walk travel district places open hours closed",
    text: [
      "The town has {districtCount} districts: {districtNames}. Going between places in the same district takes {insideMinutes} minutes, and each district you cross on foot adds {hopMinutes}.",
      "Every place keeps its own hours: the caf\xE9 opens early, the bar stays open late, and the park and the hospital never close. If there isn't enough time left before closing, the game tells you.",
    ],
    see: ["vehicles", "shops"],
  },
  {
    id: "vehicles",
    cat: "town",
    title: "Motorbike or car",
    words: "motorbike car drive ride vehicle travel",
    text: [
      "Buy a motorbike ({motoPrice}) or a car ({carPrice}) in the \u27E6SHOP\u27E7 app. Crossing a district then takes {motoHop} or {carHop} minutes instead of {hopMinutes}. It arrives the next morning at {deliveryHour}.",
      "You can sell it any time for half what you paid. People who see you arrive will notice it, and some may ask you for a ride (never with their last words in a talk, when you'd have no turn left to answer).",
      "A car needs a garage: a house, a mansion or Skyline Tower's parking. A motorbike goes anywhere. Move somewhere without one and your car stays on the street, for {streetParking} a season in \u27E6BILLS\u27E7.",
    ],
    see: ["districts"],
  },
  {
    id: "shops",
    cat: "town",
    title: "Shops and discounts",
    words: "store buy mall counter discount furniture clothes try on",
    text: [
      "Clothes are only sold at the clothes store in the Mall. The \u27E6SHOP\u27E7 app on your phone sells furniture and vehicles. Furniture from the Mall arrives that same evening at {tonightHour} (the next morning if you buy late); from the phone, the next morning.",
      "When someone you know is working the counter, they serve you, and people who like you give you a discount: {discountFriend} from {friendTier}, {discountPartner} if you're seeing each other. Try something on and whoever's there will tell you what they think; the clothes store's clerk can even tell you what suits you.",
    ],
    see: ["clothes", "vehicles"],
  },
  {
    id: "clothes",
    cat: "town",
    title: "What you wear",
    words: "clothes outfit suit sportswear style date",
    text: [
      "What you wear matters. A suit at the office makes a better shift, and going without one costs you. Sportswear helps your \u27E6Fitness\u27E7 training.",
      "On a date, wearing a style they like lifts their mood, and so does dressing right for the place.",
    ],
    see: ["shops", "job", "outing"],
  },
  {
    id: "home",
    cat: "home",
    title: "Your home",
    words: "fridge cook kitchen furniture bed desk sofa tv",
    text: [
      "Home is where you sleep, cook, study, rest and keep your things. Food in the fridge keeps {fridgeKeeps} as long, and [[cooking|cooking]] uses what's in it.",
      "Furniture makes a real difference: a better bed gives back more [[sleep|sleep]], a desk lets you study at home, a sofa helps you rest, and a better stove unlocks more recipes. Buy it at the Mall or from the \u27E6SHOP\u27E7 app. When you move, what you bought comes with you, your stove too; a chef's kitchen stays with the house, and luxury pieces wait in storage until you live on the hill again.",
    ],
    see: ["rent", "cooking", "backpack", "visits"],
  },
  {
    id: "cooking",
    cat: "home",
    title: "Cooking",
    words: "cook kitchen recipe dish portion burnt delicious well fed stove hot plate lunch food",
    text: [
      "Cook in the \u27E6KITCHEN\u27E7 at home. A recipe uses what's in your fridge, and your backpack if something's missing, and makes {portionsMin} to {portionsMax} portions that go in the fridge. Eat one right away, pack one to go, or give it to someone as a present. Like any food, they go bad after a while.",
      "How it turns out depends on your \u27E6Cooking\u27E7. Burnt, it fills you {burntFill} as much. Delicious, it gives more energy and keeps you \u27E6Well fed\u27E7 for {wellFedHours} hours, getting hungry {wellFedPace} as fast.",
      "Cooking takes time, but it fills you far more for the money than ready meals: instant noodles cost {noodles} and a bento {bento}. A \u27E6Hot plate\u27E7 only makes the simple dishes; a stove unlocks the rest.",
      "You can cook for someone, too: on a date or a hang out at your place, dinner is part of the evening. Every dish has its flavour, and they react to it by their taste and by how it came out. Some people cook for you at theirs: ask how they made it and you'll learn something.",
    ],
    see: ["hunger", "skills", "gifts"],
  },
  {
    id: "backpack",
    cat: "home",
    title: "The backpack",
    words: "bag carry items things slots",
    text: [
      "You carry what you need in your \u27E6BACKPACK\u27E7: up to {bagSlots} slots, and the same thing piles up in one slot. What doesn't fit when you buy it can be sent home.",
    ],
    see: ["home", "books"],
  },
  {
    id: "books",
    cat: "home",
    title: "Books",
    words: "read reading novel cookbook textbook library borrow knowledge cooking",
    text: [
      "Reading takes an hour and teaches \u27E6Knowledge\u27E7; a cookbook teaches \u27E6Cooking\u27E7 instead. Buy a novel, a cookbook or a textbook (each lasts a few reads), or borrow one at the library for {borrow}: you keep it {lendDays} days, and it goes back on its own.",
      "Read at home, or from your backpack anywhere. A book you've started can't be given as a present.",
    ],
    see: ["skills", "gifts"],
  },
  {
    id: "visits",
    cat: "home",
    title: "Visits",
    words: "knock door visit guest stay the night sleep over",
    text: [
      "From {knockTier}, or once you're seeing each other, you can knock on someone's door. Whether they let you in depends on how close you are and what they're up to: nobody lets you in right before they go out or go to bed. If they're asleep, you can wake them, and some take that better than others.",
      "Inside, you can do something together. Once you're dating, you can stay the night when they're going to bed. And people will come knocking on your door too.",
      "Close friends and partners sometimes drop by without warning, between {dropFrom} and {dropTo}, if you're home. Let them in and they stay a while: whatever your home has, you can do together, until they go or you see them out. Someone you're dating can stay the night from {guestNight}. They'll also ask to come over to yours.",
    ],
    see: ["home", "perks", "party"],
  },
  {
    id: "party",
    cat: "home",
    title: "Parties",
    words: "party guests invite food catering snacks rooms host music",
    text: [
      "Throw a party from \u27E6AT HOME\u27E7: pick a day (up to {partyAhead} days ahead), when it starts and when it ends (all night if you like), who you invite (from {partyTier}, as many as your home takes: {apartmentGuests} in an apartment, {mansionGuests} in a mansion) and the food: snacks at {snacks} a guest, catering at {catering}, or cook it yourself before the night. Each one says yes or no. One party every {partyEvery} days; your birthday party doesn't count. Whoever lives with you joins in on their own, from the start or once they're home, without taking a guest's place.",
      "On the night your home is its rooms: the living room and the kitchen, and the garden, pool, bar or console if you have them. Your guests move about; go from room to room, talk with whoever is there, put music on, serve the food, bring people over and introduce the ones who haven't met.",
      "Your guests ring the bell over the first {partyArrive} minutes: let them in. A room where nothing happens gets bored, and whoever has a bad time goes home early; as the night goes on they head home to bed, unless they're having a great time, and some doze off on your sofa. Afterwards, everyone takes home some friendship, or loses some, and the ones who met stay acquainted.",
      "Things happen: two guests hit it off, two who can't stand each other get into a fight, someone asks to stay the night, a friend brings someone you didn't invite. And late at night a neighbour may knock about the noise: keep going, and a fine lands in \u27E6BILLS\u27E7.",
      "Your friends throw parties too, at their place, and birthdays are parties at home now. Say yes and it's on your plans: on the night, go to their door and in. There you're a guest: dance, lend a hand in the kitchen, sing to them on their birthday. Saying yes and never showing up stings.",
      "When someone who lives with you throws one, it's at home and it's yours too: they organise it, and if you're home when it starts, you're in it; come back a little late and you can still \u27E6JOIN IN\u27E7. Nobody throws theirs on the night of yours, and you can't say yes to one that clashes with your plans. It goes ahead even if you're asleep, out or said no: at home, you can \u27E6JOIN IN\u27E7 while it lasts. Sleeping through it only stings a little; saying yes and never coming home for it stings like any missed party. A neighbour may still come about the noise, and the fine is yours: it's your home too.",
    ],
    see: ["visits", "home", "cooking"],
  },
  {
    id: "housemates",
    cat: "home",
    title: "Living with others",
    words: "housemate housemates flatmate roommate live together move in move out rooms share fridge",
    text: [
      "Friends can live with you, in any home, as many as it has rooms for: {apartmentRooms} in an apartment, {houseRooms} in a house, {luxuryRooms} in a luxury apartment, {mansionRooms} in a mansion. Your partner shares your room. You can start a life with them in \u27E6YOUR HOME\u27E7, and they start as close friends.",
      "From {mateTier}, if they live alone and you have a room free, ask them to move in from \u27E6SPECIAL ACTIONS\u27E7, into a home of yours, rented or bought (not your partner's). Some will ask you themselves. Someone whose life is very settled would rather stay where they are.",
      "The rent is split between all of you. In a home of yours, the bills are split too, and each one pays you {roomShare} of what the place would rent for, for their room.",
      "They're home in the evenings like anyone at home: talk, do things together. They eat from your fridge, what you cooked too, but not what you set aside for your party; and every {groceriesDays} days one of them brings groceries. Now and then something happens at home: dinner on the table, a mess in the kitchen, music at midnight.",
      "They go if you ask them to (it costs your friendship), if you stop being friends (under {mateStays}), or to live with a partner of theirs. Family who live with you stay unless you ask them to go, or you move without them. When you move, you pick in \u27E6HOMES\u27E7 who comes with you.",
    ],
    see: ["rent", "home", "visits"],
  },
  {
    id: "rent",
    cat: "money",
    title: "Rent and your home",
    words: "apartment house luxury mansion flatmate move evicted eviction homes couch",
    text: [
      "An apartment costs {apartmentRent} a season and a house {houseRent}; up on the hill, a luxury apartment {luxuryRent} and a mansion {mansionRent}. Rent is due once a season. Whoever lives with you splits it.",
      "Can't pay? It turns into a debt with your landlord, with {rentFee} on top. If you still owe when the next rent comes, you're told at midnight that you'll be evicted at {evictHour} (or once a date, a guest or a party at yours is over). Paying all you owe in \u27E6BILLS\u27E7 before then, or moving, stops it. Evicted, you sleep rough in the park until you pay it off, and your things wait with the landlord; whoever lived with you (not a partner) goes back to where they lived before. A {closeTier} may offer you their couch.",
      "You can move whenever you like from the \u27E6HOMES\u27E7 app on your phone.",
    ],
    see: ["buying", "bills", "sleep", "housemates"],
  },
  {
    id: "buying",
    cat: "money",
    title: "Buying a home",
    words: "buy own mortgage bank price down payment sell hill luxury mansion",
    text: [
      "In \u27E6HOMES\u27E7 you can buy instead of renting, from {apartmentPrice} for an apartment to {mansionPrice} for a mansion, even the one you live in. Once it's yours there's no rent, only its bills each season.",
      "Or take a mortgage: {mortgageDown} down and the rest in {mortgageSeasons} payments, one a season. Miss one and it's a debt with the bank; still owing when the next comes, and the bank takes the home.",
      "Moving out of a home you own, the bank buys it back for {resale} of its price, less what's left of its mortgage. Bigger homes have more room: a garden, a garage, a gym, a bar, even a pool.",
    ],
    see: ["rent", "home", "bills"],
  },
  {
    id: "bills",
    cat: "money",
    title: "BILLS",
    words: "debt pay owe loan landlord hospital collections",
    text: [
      "Nothing is ever taken out of your money on its own. Everything you owe is in the \u27E6BILLS\u27E7 app on your phone: your landlord, the hospital, friends who lent you money. You decide how much to pay, and when.",
      "The one exception: a hospital bill left unpaid past its {hospitalDays} days gets {hospitalFee} on top and goes to collections, and they take {collections} of every shift's pay until it's settled.",
    ],
    see: ["rent", "collapse", "loans"],
  },
  {
    id: "loans",
    cat: "money",
    title: "Borrowing and lending",
    words: "money loan lend borrow ask pay for plea",
    text: [
      "People may ask you for money in a scene, when it fits who they are: to pay for something, as a loan, or just because. Answer \u27E6PAY\u27E7 or \u27E6NOT NOW\u27E7, or say it in your own words. Paying makes them a little fonder of you; saying no, a little less. Nobody asks with their last words in a talk, or just as someone walks over: you'd have no turn left to answer.",
      "When you're short, ask a {closeTier} or your partner in your own words: they lend up to {loanMax}, less what you already owe them. Not an ex, and not while a loan of theirs is past its day. Pay it back in \u27E6BILLS\u27E7 within {loanDays} days, or it costs you some trust and they lend you nothing more until it's paid.",
      "They also step in with the rent or a hospital bill when you can't cover it, but never past {loanMax} in all with what you already owe them, and never an ex.",
      "Money you lent comes back when you ask for it, in their \u27E6SPECIAL ACTIONS\u27E7 or in your own words, from {lentWait} days after the last time you lent them some. If someone you owe, or who owes you, moves away, it all waits until they're back: nothing falls due meanwhile, and \u27E6BILLS\u27E7 says so.",
      "On an outing, whoever invited is expected to pay. You can offer to split or pay for both. At someone else's birthday in a place that charges, everyone pays their own; on your birthday, the plan your partner makes is their treat.",
    ],
    see: ["bills", "perks"],
  },
  {
    id: "suit",
    cat: "work",
    title: "Dressed for the office",
    words: "suit office clothes first day formal buy",
    text: [
      "A new life starts with everyday clothes only. For the office, buy a suit at the clothes store in the Mall (from {suitFrom}) before your first shift: going without one costs you at work.",
    ],
    see: ["clothes", "job", "shops"],
  },
  {
    id: "job",
    cat: "work",
    title: "Your job",
    words: "work office apply interview promotion fired pay salary jobs performance review",
    text: [
      "You start without a job. Open the \u27E6JOBS\u27E7 app on your phone to apply; there's an interview first. If they turn you down, you can try again in {retryDays} days.",
      "The office shift is {shiftText} and costs {shiftEnergy} energy. Pay goes from {firstPay} a shift as {firstJob} to {topPay} as {topJob}.",
      "Good shifts fill your performance: be on time, wear a suit, show up rested and fed. Reviews come on the {reviewDays} of each season: with your performance at {promoteAt} and the [[skills|skills]] the next position asks for, you're promoted.",
      "Get {warnings} warnings and you're let go, and the office won't see you again for {firedDays} days.",
    ],
    see: ["shift", "skills"],
  },
  {
    id: "shift",
    cat: "work",
    title: "A day at work",
    words: "shift late warning lunch overtime stay late day off moments",
    text: [
      "Arrive by {onTime} or you're late. Every {latesToWarn} lates is a warning, and missing a workday is one right away. Warnings go away after {warningsFade} days without a new one.",
      "Things come up during a shift: an urgent task, a coworker who needs a hand, a client who complains. How you handle them moves your performance. Lunch is {lunch}, inside the office.",
      "Want more? \u27E6STAY LATE\u27E7 right after a shift: {overtimeHours} more hours at {overtimeRate} the pay, up to {overtimeWeek} a week. You can also ask for up to {daysOff} days off a season, a day ahead.",
    ],
    see: ["job", "skill-perks"],
  },
  {
    id: "skills",
    cat: "skills",
    title: "Skills",
    words: "fitness charm knowledge cooking level gym library study read books train",
    text: [
      "There are four: \u27E6Fitness\u27E7, \u27E6Charm\u27E7, \u27E6Knowledge\u27E7 and \u27E6Cooking\u27E7, each from level 0 to {maxLevel}. Every level takes more practice than the last: level 2 takes twice the points of level 1.",
      "Free things only take you so far: running, walking, lectures and the campus get you up to level {freeUpTo}. Past that you need the gym ({gym}), studying at the library ({library}) or [[books|books]].",
      "\u27E6Fitness\u27E7 raises your top [[energy|energy]]. \u27E6Knowledge\u27E7 and \u27E6Charm\u27E7 are what promotions at [[job|work]] ask for. \u27E6Cooking\u27E7 goes up every time you [[cooking|cook]], even when it burns.",
    ],
    see: ["skill-perks", "energy", "job"],
  },
  {
    id: "skill-perks",
    cat: "skills",
    title: "What your skills unlock",
    words: "charm knowledge fitness cooking level bonus unlock recipes",
    text: [
      "\u27E6Charm\u27E7 {perkFlirt}: a flirt with someone who's ready never goes wrong. \u27E6Charm\u27E7 {perkFirst}: people you meet like you a little from the start. \u27E6Charm\u27E7 {perkWork}: one more way out of work moments with people.",
      "\u27E6Knowledge\u27E7 {perkBest}: the best choice in a work moment is marked. \u27E6Knowledge\u27E7 {perkRead}: books teach twice as much.",
      "\u27E6Fitness\u27E7 {perkChallenge}: an edge when a rival challenges you. \u27E6Fitness\u27E7 {perkOvertime}: \u27E6STAY LATE\u27E7 tires you less.",
      "\u27E6Cooking\u27E7: every level opens new [[cooking|recipes]], and your dishes burn less and turn out delicious more often.",
    ],
    see: ["skills", "shift"],
  },
  {
    id: "bonds",
    cat: "people",
    title: "Friendship, romance and trust",
    words: "bond bars tiers friend best friend love trust",
    text: [
      "You have three bars with everyone you know, each going from 0 to 100, and each has names along the way.",
      "Friendship starts at {friendshipTiers}. Romance starts at {romanceTiers}. Trust starts at {trustTiers}.",
      "With someone you're together with, friendship is how much you enjoy each other day to day, and its steps are named {coupleTiers}; if you break up, the friendship names come back. With family, it goes {familyTiers}.",
      "Some steps don't happen on their own: when a bar is ready, you'll need a moment with them, in a scene, before it can keep growing. Putting it off loses you nothing, and they still remember the talk. Some trust steps ask a real favour of you, and it may be somewhere else in town, even when you offer to help before they ask: \u27E6YOUR CALL\u27E7 says where.",
    ],
    see: ["quick", "perks", "steps", "personality"],
  },
  {
    id: "quick",
    cat: "people",
    title: "Chat, Flirt and Open up",
    words: "quick talk chat flirt open up",
    text: [
      "The quick options when you run into someone: \u27E6Chat\u27E7 builds friendship, \u27E6Flirt\u27E7 builds romance, and \u27E6Open up\u27E7 builds trust.",
      "You can do each one {quickPerDay} a day with each person. For more, [[talk|sit down and talk]].",
    ],
    see: ["bonds", "talk"],
  },
  {
    id: "personality",
    cat: "people",
    title: "Personality",
    words: "traits jealous shy proud faithful temper romantic",
    text: [
      "Everyone has their own mix: how open they are, how jealous, how forgiving, how quick-tempered, how romantic, how faithful, and more. It's read from their card, and you can change it in \u27E6SETTINGS\u27E7.",
      "You find it out as you get to know them. The strongest traits are the ones you notice: a very jealous partner asks who that was, someone proud won't be the first to apologize.",
    ],
    see: ["bonds", "jealousy"],
  },
  {
    id: "perks",
    cat: "people",
    title: "What friendship opens up",
    words: "perks friend close friend best friend discount key couch help loan treat",
    text: [
      "The closer you get, the more people do for you. From {friendlyTier}, you can invite them out. From {friendTier}: a discount where they work, seeing their week, meeting their friends, and knocking on their door. If you're seeing each other, you have all of that too, however close you are as friends.",
      "From {closeTier}: help when you're short on rent, food or a hospital bill, and they'll tell you what their friends like. From {bestTier}: they treat you now and then, give you a key to their place, and take your side.",
      "Very caring people help sooner; reserved or shy ones only once you're best friends.",
    ],
    see: ["bonds", "loans", "visits"],
  },
  {
    id: "cast-jobs",
    cat: "people",
    title: "Where people work",
    words: "job work shift out of town from home working knock door busy week",
    text: [
      "Everyone in town has a week of their own, and work is part of it. Someone with a job in town is at their workplace during their shift: you can find them there, and at a counter they serve you.",
      "Someone who works out of town is away those hours, so you won't run into them. Someone who works from home is home but busy: their door says \u27E6WORKING\u27E7, and a knock brings them to the door for a moment, but you come in once they're done; your key waits too. If they live with you, a quick chat is fine, and the rest comes after work.",
      "Plans and invitations never land on anyone's working hours.",
    ],
    see: ["visits", "shops", "invite"],
  },
  {
    id: "money-shows",
    cat: "people",
    title: "What your money says",
    words: "rich money designer clothes luxury mansion hill tower impressed envy show",
    text: [
      "A home on the hill and designer clothes show. The proud, and whoever likes things fancy, are impressed; the practical find it a bit much; most just notice. On a date it lifts or sours their mood, and a date at your place on the hill starts a little better for anyone. The first time someone meets you in designer clothes, it counts too.",
      "Word gets around: a rival, or someone very jealous, envies it and likes you a little less. And whoever asks you for money asks for more.",
      "People also see what you're wearing, your ring if you're married, and how you get about.",
    ],
    see: ["clothes", "rent", "loans", "network"],
  },
  {
    id: "gifts",
    cat: "people",
    title: "Gifts",
    words: "present gift likes dislikes loved",
    text: [
      "You can give each person one gift a day. Everyone has one kind of thing they love, two they like and two they can't stand. A gift they love is worth the most; one they dislike hurts.",
      "You'll see all of it once their trust reaches {trustingTier}; before that, you learn as you go. On their birthday, a gift counts {bdayTimes}.",
    ],
    see: ["birthdays", "shops"],
  },
  {
    id: "birthdays",
    cat: "people",
    title: "Birthdays",
    words: "birthday party present surprise",
    text: [
      "You learn someone's birthday from {friendTier}, or just by asking. On the day, wish them a happy birthday. Forgetting it hurts once you're close friends, and always with a partner. They may invite you to their party a few days before.",
      "For your own birthday, throw a party at home: from {partyPlan} days before until the day itself, \u27E6AT HOME\u27E7 \xB7 PARTY offers \xABYour birthday party\xBB, on your day or up to {partyAround} days either side (never before today). Your guests bring presents, one each (whoever gives you one on the morning of your birthday doesn't bring another to the party, and the other way round), and there's a cake. Without a home of your own there's no party, but whoever knows still wishes you a happy birthday. A partner might have a surprise for you.",
    ],
    see: ["gifts", "time"],
  },
  {
    id: "chart",
    cat: "people",
    title: "The relationship chart",
    words: "chart map web network relationships who knows who lines arrows",
    text: [
      "In \u27E6CONTACTS\u27E7, switch from \u27E6LIST\u27E7 to \u27E6CHART\u27E7 to see everyone at once: you in the middle and the people you've met around you, with the ones who matter most to you on the inner ring. Tap a face to open their sheet.",
      "Your line to each person shows what they are to you: red for your partner, pink for romance, and from grey to white the closer you are as friends. A pink arrow pointing at you means they have feelings for you. Between the others, the lines show what you know of them: together, family, close, friends, exes or rivals. Point at someone (or tap them on a phone) to light up everyone they know.",
      "You only see what you've found out: a couple kept from you still looks like friends until you see them together or someone tells you.",
    ],
    see: ["bonds", "network", "jealousy"],
  },
  {
    id: "network",
    cat: "people",
    title: "Who sees what, and NEWS",
    words: "gossip witness seen rumor news week",
    text: [
      "People notice what you do. Anyone in the same place might see you, and the bigger the place, the less likely: about {seenSmall} in a small place, {seenBig} in a big one. What they see, they may pass on, and it reaches the people it matters to.",
      "Someone who only heard about it waits a day or two before bringing it up. People forget most things after about {forgetsDays} days, but never lies or cheating.",
      "Every Monday, \u27E6NEWS\u27E7 tells you what got around about you, and what happened between everyone else.",
    ],
    see: ["jealousy", "who-here"],
  },
  {
    id: "talk",
    cat: "talk",
    title: "Sitting down to talk",
    words: "scene conversation talk your call auto skip log",
    text: [
      "\u27E6Sit down and talk\u27E7 for a real conversation, written by your model: up to {talkExchanges} exchanges, once a day with each person. It ends early if they have to go or the place is closing. After each of your lines, you see how they took it.",
      "When something needs your decision, it comes as \u27E6YOUR CALL\u27E7. Click anywhere on the scene for the next line. \u27E6AUTO\u27E7 moves their lines on by itself, \u27E6SKIP\u27E7 jumps to your turn, and \u27E6LOG\u27E7 shows everything said so far.",
    ],
    see: ["your-words", "who-here", "memories"],
  },
  {
    id: "your-words",
    cat: "talk",
    title: "Saying it your own way",
    words: "free text write type words taken as kiss break up",
    text: [
      "Anything you can do with a button, you can also just write: \xABI kiss her\xBB, \xABLet's break up\xBB, \xABHere, I got you this\xBB. The game reads what you meant and makes it happen for real.",
      "For big things it shows \u27E6TAKEN AS\u27E7 with what it understood, and \u27E6NOT WHAT I MEANT\u27E7 takes it back. Going too fast has a price: a clear no hurts, and they won't want anything romantic for a few days. With family it's only a no, and holding hands is just affection: they react to it, and nothing changes between you.",
    ],
    see: ["talk"],
  },
  {
    id: "who-here",
    cat: "talk",
    title: "Who else is here",
    words: "people around witnesses walk over interrupt",
    text: [
      "In a public place, the faces on the left are the others there with you. A red ring means they could make things awkward: your partner, someone with feelings for you, your date's partner, someone close to your partner.",
      "Now and then, one of them walks over in the middle of a conversation.",
    ],
    see: ["network", "jealousy"],
  },
  {
    id: "no-answer",
    cat: "talk",
    title: "When the model can't answer",
    words: "error failed model down try again go on without it cancel couldn't answer",
    text: [
      "Now and then the model doesn't answer. Where it matters you get \u27E6THEY COULDN'T ANSWER\u27E7: \u27E6TRY AGAIN\u27E7 asks once more, and \u27E6GO ON WITHOUT IT\u27E7 carries on without their words, after \u27E6YOUR CALL\u27E7, at a party, at the bill or at the end of an outing. What you chose still counts.",
      "At \u27E6END SCENE\u27E7, \u27E6TRY AGAIN\u27E7 asks for their goodbye and what they'll remember; \u27E6GO ON WITHOUT IT\u27E7 ends the talk without either.",
      "If it happens as a {hangName} or a {dateName} begins, the plan isn't lost: \u27E6TRY AGAIN\u27E7, or \u27E6CANCEL IT\u27E7 at no cost.",
    ],
    see: ["talk", "outing"],
  },
  {
    id: "memories",
    cat: "talk",
    title: "What they remember",
    words: "memory memories remember pin edit forget",
    text: [
      "Everyone keeps memories of your time together, and your model reads them before every scene. In their \u27E6MEMORIES\u27E7 tab you can edit, pin, delete or add them.",
      "Pinned ones always stay. When there are too many, the oldest are summed up so the newest still fit.",
    ],
    see: ["talk"],
  },
  {
    id: "invite",
    cat: "out",
    title: "Inviting someone out",
    words: "invite hang out date plan ask out yes no",
    text: [
      "Invite someone from their \u27E6SPECIAL ACTIONS\u27E7, under \u27E6PLANS\u27E7: a {hangName} from {friendlyTier}, a {dateName} once romance reaches {curiousTier}. Pick the place and the day, up to {aheadDays} days ahead, with up to {plansMax} plans waiting at once.",
      "The closer you are, the likelier a yes, and a place they like helps a lot. After a no, wait {noAgain} days before asking again.",
    ],
    see: ["outing", "plans"],
  },
  {
    id: "outing",
    cat: "out",
    title: "The outing",
    words: "date hang out mood late goodbye kiss dinner cook",
    text: [
      "Be on time: up to {lateOk} minutes late is fine, later sours the mood, and after {lateLeaves} minutes they're gone. An outing is one long scene of up to {outingHours} hours.",
      "Their mood moves with everything you do; if it drops too low, they leave. How you say goodbye depends on how it went: a hug, walking them home, or a kiss on a date.",
      "Going to the same place with the same person again and again gets less exciting each time.",
      "At your place or theirs around lunch or dinner time, there's a meal: you [[cooking|cook]] at yours, and at theirs, whoever loves to cook serves you. Say you'll cook, or ask them to, and it happens right then.",
    ],
    see: ["invite", "clothes", "plans"],
  },
  {
    id: "plans",
    cat: "out",
    title: "Keeping your word",
    words: "plans calendar cancel missed keep promise",
    text: [
      "Plans go on your \u27E6CALENDAR\u27E7. Keeping one builds trust; missing it costs trust and romance. Cancelling is better than not showing up, and cancelling early is better than on the day.",
      "Cancelling a group outing: whoever you planned it with takes it as usual, and each of the others is a little let down.",
    ],
    see: ["invite", "time"],
  },
  {
    id: "steps",
    cat: "love",
    title: "Dating, moving in, getting married",
    words: "date partner relationship move in engaged wedding marry",
    text: [
      "Each step needs your [[bonds|romance and trust]] far enough along, and then the right moment to ask.",
      "To go from {single} to {dating}, romance has to be at {datingRomance} and trust at {datingTrust}. To become {partners}, {partnersRomance} and {partnersTrust}, after dating for {partnersDays} days. {living} asks for trust at {livingTrust}, and room at your place.",
      "To get {engaged}, romance has to reach {engagedRomance}. To get {married}, trust has to be {marriedTrust} too, after {marriedDays} days engaged.",
      "They can ask you too, and they can say no.",
    ],
    see: ["bonds", "wedding", "personality"],
  },
  {
    id: "jealousy",
    cat: "love",
    title: "Jealousy and cheating",
    words: "jealous cheat cheating confront lie deny agreement open relationship",
    text: [
      "If a partner sees you flirting with someone else, or hears about it, they'll want to talk. You can deny it, apologize or explain, but a lie they find out later hurts far more.",
      "From {dating} on, seeing someone else without an agreement is cheating. While you're only dating it ends things only with someone who hardly forgives; from {partners} on, it can end it. Starting to date someone else asks your partner's agreement first, however it happens. Whoever says yes to you knowing you're with someone already is fine with them. You can ask a partner if it's all right to see someone else, from their \u27E6SPECIAL ACTIONS\u27E7 (never family, or someone who isn't into you or is only a friend). If they're the one seeing someone, you can \u27E6Confront\u27E7 them.",
    ],
    see: ["network", "breakups", "several"],
  },
  {
    id: "breakups",
    cat: "love",
    title: "Breaking up and getting back together",
    words: "break up ex reconcile we need to talk",
    text: [
      "A breakup is always a scene, and it costs a lot of romance and trust. If a partner's trust in you drops below {trustTooLow}, they'll come to you with \xABWe need to talk\xBB.",
      "Breaking up ends what you agreed about seeing other people, and if you lived together, one of you moves out: they leave yours, or you move to a flat of your own if you lived at theirs.",
      "An ex can be a partner again: give it {reconcileDays} days, bring trust back to {reconcileTrust} ({reconcileBetrayed} if you cheated) and romance to {reconcileRomance}. Falling for them again waits until you're back together.",
    ],
    see: ["jealousy", "drift"],
  },
  {
    id: "drift",
    cat: "love",
    title: "Drifting apart",
    words: "where have you been neglect abandon miss drifting",
    text: [
      "Leave someone alone too long and they'll ask \xABWhere have you been?\xBB: a partner after {driftMin} to {driftMax} days, depending on who they are, and friends after {friendDrift} as long. Spending time with them fixes it; if that talk goes badly, your friendship takes a step back. Living together counts as seeing each other: nobody you live with asks it.",
    ],
    see: ["bonds", "breakups"],
  },
  {
    id: "several",
    cat: "love",
    title: "More than one partner",
    words: "multiple partners polyamory open relationship agreement",
    text: [
      "With \u27E6Multiple relationships\u27E7 on in your rules, you can be with more than one person, each with their own agreement. Your partners meet, get along or don't, and may even compete for you.",
      "You can marry more than one of them, as long as every partner agrees.",
    ],
    see: ["jealousy", "wedding", "settings"],
  },
  {
    id: "wedding",
    cat: "love",
    title: "Proposing and the wedding",
    words: "ring propose engaged wedding honeymoon anniversary",
    text: [
      "Buy a ring at the Mall and propose once romance is at {engagedRomance}. A yes starts the planning in the \u27E6WEDDING\u27E7 app: the venue ({venueMin} to {venueMax}), the banquet, your outfit, the bands and the guests (up to {guestsMax}). Without the must-haves, the wedding moves to the next season.",
      "Then comes the day, the morning after and, if you booked one, a {honeymoonDays}-day honeymoon. The wedding always goes to the end, vows and first dance included, whatever the mood; the honeymoon lasts all its days. Don't forget your anniversary.",
    ],
    see: ["steps", "several"],
  },
  {
    id: "pictures",
    cat: "look",
    title: "Pictures",
    words:
      "images backgrounds outfits key moments gallery manual automatic frame cut out face size resolution portrait upload own picture file crop",
    text: [
      "The game can draw every place (by day and by night), your outfits, work clothes, everyone's outfit for each season, and key moments. Each of these is \u27E6MANUAL\u27E7 or \u27E6AUTOMATIC\u27E7, per life. On manual, a small icon marks what's missing and nothing is drawn until you ask; automatic draws new things by itself, using your image connection, which may cost money.",
      "Key moments are kept in the \u27E6GALLERY\u27E7 (up to {albumMax}). Don't like one? \u27E6REDO\u27E7 on the picture draws it again right there, and the scene goes on meanwhile; both stay in the gallery to pick from. People can stand in a picture frame or cut out, as you pick in \u27E6SETTINGS\u27E7. \u27E6ADJUST FACE\u27E7 on someone's sheet chooses which part of their picture is their face.",
      "You pick the size pictures are drawn at, in \u27E6SETTINGS\u27E7: \u27E6PICTURE SIZE\u27E7 for places and key moments, \u27E6PORTRAIT SIZE\u27E7 for pictures of one person. The screens are laid out for people at 832 \xD7 1216, so another size may look off. It counts from the next picture drawn.",
      "You can use a picture of your own for a place, for someone's season or work outfit, or for you in one of your outfits: the round button with an arrow on it. Drag it into place and zoom until the frame shows what you want. Yours stays until you tap \u27E6PAINT IT INSTEAD\u27E7. A PNG with a see-through background stands cut out just as it is.",
    ],
    see: ["settings"],
  },
  {
    id: "settings",
    cat: "look",
    title: "A life's settings",
    words:
      "settings rules cast model prompts motion edit traits add people reasoning thinking rename name card npcs staff regulars",
    text: [
      "Each life has its own \u27E6SETTINGS\u27E7: how the town and its pictures look, the cast (their job, gender, who they're into, their personality, and adding people, up to {maxInTown} in town), the rules (hunger, jealousy, drifting apart, infidelity, multiple relationships, what stays hidden\u2026), the model, and the image prompts.",
      "With \u27E6NPCs\u27E7 off, only your cast is around: people from outside it, like a club's staff, step aside and come back as they were when you turn it on again.",
      "To change someone's name in this life, tap \u27E6RENAME\u27E7 next to them in the cast. If you renamed them on their card, \u27E6UPDATE FROM THE CARD\u27E7 brings the new name too. Pictures already drawn keep the old one until you draw them again.",
      "\u27E6Reasoning\u27E7 is how much the model thinks before it answers. More thinking is slower; \u27E6none\u27E7 asks it not to think at all, if the model allows it.",
      "\u27E6MOTION\u27E7 turns the animations down or off.",
    ],
    see: ["pictures", "personality", "new-life"],
  },
];
var fillGuidePlaceholders = (text) =>
  text.replace(/\{(\w+)\}/g, (match, key) => {
    if (!(key in GUIDE_VALUES)) {
      throw new Error(`The guide asks for {${key}}, which the game does not know.`);
    }
    return String(GUIDE_VALUES[key]);
  });
var buildGuide = (modules = []) => ({
  categories: [...GUIDE_CATEGORIES, ...modules.flatMap((mod) => mod.categories ?? [])],
  articles: [
    ...GUIDE_ARTICLES.map((article) => ({
      ...article,
      text: article.text.map(fillGuidePlaceholders),
    })),
    ...modules.flatMap((mod) => mod.articles ?? []),
  ],
});

export { buildGuide };
