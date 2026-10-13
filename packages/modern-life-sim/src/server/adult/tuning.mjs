// Adult module constants: card adult field, detail levels, passage/picture pacing, gains, hotel and Scarlet Club data
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";

var ADULT_ANSWERS = ["yes", "no", "unsaid"];
var ADULT_CARD_RULE =
  "`adult`: whether they are an adult (18 or older), from the card: `yes` when the card makes it clear (an age of 18 or more, a job or a life only an adult has, being a parent, a university student\u2026), `no` when it says or clearly shows they are under 18, `unsaid` when it does not make it clear. When in doubt, `unsaid`.";
var INTIMACY_DETAIL_LEVELS = ["explicit", "fade"];
var DEFAULT_INTIMACY_DETAIL = "explicit";
var CASUAL_INTIMACY_MIN_ROMANCE_TIER = 3;
var shrugsOffCommitment = (traits) => TRAIT_BEHAVIOURS.shrugs(traits);
var wantsCommitmentFirst = (traits) => TRAIT_BEHAVIOURS.confessesOwnWay(traits) || traits.dials.faithful >= 10;
var INTIMATE_PASSAGES_BY_DETAIL = {
  explicit: 10,
  fade: 1,
};
var PICTURE_FREQUENCIES = ["one", "few", "every"];
var DEFAULT_PICTURE_FREQUENCY = "one";
var INTIMATE_BEAT_COUNT = 6;
var BEAT_PHASE_LABELS = {
  start: "It begins",
  rise: "It builds",
  peak: "The moment",
  after: "Afterwards",
};
function pictureBeatsFor(beats, frequency = DEFAULT_PICTURE_FREQUENCY) {
  if (beats <= 1) {
    return [1];
  }
  let all = Array.from(
    {
      length: beats,
    },
    (slot, index) => index + 1,
  );
  if (frequency === "every") {
    return all;
  }
  let peak = beats - 1;
  if (frequency !== "few") {
    return [peak];
  }
  let middleOf = (phase) => {
    let inPhase = all.filter((beat) => beatPhaseOf(beat, beats) === phase);
    return inPhase[Math.floor((inPhase.length - 1) / 2)];
  };
  return [...new Set([middleOf("start"), middleOf("rise"), peak, beats].filter(Boolean))].sort(
    (first, second) => first - second,
  );
}
var INTIMATE_LEADUP_TURNS_MAX = 2;
function beatPhaseOf(beat, beats) {
  return beats <= 1 ? "one" : beat >= beats ? "after" : beat === beats - 1 ? "peak" : beat <= 1 ? "start" : "rise";
}
function explicitPassagePlan(passages, { lead = 0, steer = false } = {}) {
  if (passages < 4) {
    return "";
  }
  let at = (index) => index + lead,
    leadText = lead ? `${lead === 1 ? "1" : lead === 2 ? "1 and 2" : `1 to ${lead}`}, what leads to it; ` : "",
    actRange = passages - 2 > 2 ? `${at(2)} to ${at(passages - 2)}` : `${at(2)}`;
  return `The whole scene, in ${passages + lead} passages: ${leadText}${at(1)}, it begins \u2014 kisses, touching, clothes coming off; ${actRange}, the act itself, in full, more intense with each passage${steer ? ", going the way the player chooses" : ""}; ${at(passages - 1)}, the climax; ${at(passages)}, the after.`;
}
var STAY_IN_PLACE_RULE =
  "It happens right where they are now (WHERE THEY ARE NOW): nobody suggests going anywhere else, and it stays on them and this moment \u2014 no other topics, nothing else they saw or heard.";
var INTIMATE_MINUTES = 60;
var INTIMATE_ENERGY_COST = 15;
var FIRST_TIME_GAINS = {
  romance: 6,
  trust: 4,
};
var REPEAT_INTIMACY_GAINS = {
  romance: 1,
};
var ROMANTIC_REPEAT_GAINS = {
  romance: 2,
  trust: 1,
};
var isRomanticType = (traits) => traits.dials.romantic >= 8;
var CLINGY_COOLDOWN_DAYS = 3;
var isAttentionSeeker = (traits) => traits.dials.attention >= 10;
var INTIMACY_REFUSAL_COSTS = {
  soft: {
    romance: -1,
    days: 3,
  },
  no: {
    romance: -2,
    trust: -1,
    days: 7,
  },
};
var TURNED_DOWN_HURT = {
  hard: {
    romance: -6,
    trust: -3,
    days: 10,
  },
  light: {
    romance: -2,
    trust: 0,
    days: 5,
  },
};
var DEFAULT_TURNED_DOWN_HURT = {
  romance: -4,
  trust: -1,
  days: 7,
};
var INTIMATE_ACT_WEIGHT = 4;
var HOTEL_PLACE = {
  id: "hotel",
  name: "Midnight Inn",
  open: 0,
  close: 24,
  module: "adult",
  about: "a small hotel with rooms by the night, discreet, on the nightlife street",
};
var HOTEL_ROOM_PRICE = 80;
var CLUB_PLACE = {
  id: "club",
  name: "Scarlet Club",
  open: 21,
  close: 4,
  module: "adult",
  about: "a strip club on the nightlife street: a stage, dancers, drinks and a VIP room",
};
var CLUB_SHOW_ACTIVITY = {
  id: "club-show",
  name: "Watch the show",
  minutes: 60,
  costs: 25,
  energy: 5,
  gives: {
    charm: 2,
  },
};
var CLUB_TALK_MILESTONE = "club-talk";
var CLUB_TALK_CHOICES = ["just", "sorry", "together"];
var CLUB_TALK_TRUST_COSTS = {
  just: {
    1: {
      trust: -1,
    },
    2: {
      trust: -3,
    },
  },
  sorry: {
    1: {},
    2: {
      trust: -1,
    },
  },
};
var CLUB_TOGETHER_BY_DARING = {
  bold: {
    romance: 1,
  },
  either: {},
  cautious: {
    trust: -2,
  },
};
var CLUB_DANCE_MILESTONE = "club-dance";
var PRIVATE_DANCE_OFFER = {
  price: 60,
  minutes: 30,
};
var PRIVATE_DANCE_TURNS = 2;
var CLUB_PASSAGES_BY_DETAIL = {
  explicit: 6,
  fade: 1,
};
var CLUB_DANCER_SEXES = ["female", "female", "male", "male"];
var CLUB_NPC_ID_PREFIX = "npc-club-";
var CLUB_NPC_FIELD_LIMITS = {
  name: 30,
  body: 400,
  outfit: 160,
  trait: 140,
};
var CLUB_JOBS = [
  {
    id: "club-dancer-1",
    title: "Dancer",
    days: [2, 3, 4, 5, 6],
    from: 21,
    to: 4,
    clothes: "a stage outfit",
  },
  {
    id: "club-dancer-2",
    title: "Dancer",
    days: [4, 5, 6, 0, 1],
    from: 21,
    to: 4,
    clothes: "a stage outfit",
  },
  {
    id: "scarlet-bartender",
    title: "Bartender",
    days: [1, 2, 3, 4, 5],
    from: 21,
    to: 4,
    clothes: "a black shirt and a bar apron",
  },
  {
    id: "club-bouncer",
    title: "Bouncer",
    days: [2, 3, 4, 5, 6],
    from: 21,
    to: 4,
    clothes: "a black suit and an earpiece",
  },
];
var SHORT_LINE_MAX = 90;
var CLUB_JOB_TITLES = {
  dancer: "Dancer",
  bartender: "Bartender",
  bouncer: "Bouncer",
};
var PRIVATE_DANCE_GAINS = {
  first: {
    romance: 2,
  },
  again: {
    romance: 1,
  },
};
var CAR_NIGHT_HOURS = {
  from: 21,
  to: 5,
};
var STAY_NIGHT_HOURS = {
  from: 20,
  to: 5,
};
var STAY_OVER_SPOTS = ["yours", "theirs", "hotel"];
var HOTEL_ROOM_MINUTES = 840;
var STAY_TONIGHT_WINDOW = 30;
var OVERHEARD_CHANCE = {
  awake: 0.4,
  asleep: 0.1,
};
var PARTY_OVERHEARD_CHANCE = 0.1;
var PARTY_OVERHEARD_MAX = 2;
var ADULT_SLIP_ID = "adult-slip";

export {
  ADULT_ANSWERS,
  ADULT_CARD_RULE,
  ADULT_SLIP_ID,
  BEAT_PHASE_LABELS,
  CAR_NIGHT_HOURS,
  CASUAL_INTIMACY_MIN_ROMANCE_TIER,
  CLINGY_COOLDOWN_DAYS,
  CLUB_DANCER_SEXES,
  CLUB_DANCE_MILESTONE,
  CLUB_JOBS,
  CLUB_JOB_TITLES,
  CLUB_NPC_FIELD_LIMITS,
  CLUB_NPC_ID_PREFIX,
  CLUB_PASSAGES_BY_DETAIL,
  CLUB_PLACE,
  CLUB_SHOW_ACTIVITY,
  CLUB_TALK_CHOICES,
  CLUB_TALK_MILESTONE,
  CLUB_TALK_TRUST_COSTS,
  CLUB_TOGETHER_BY_DARING,
  DEFAULT_INTIMACY_DETAIL,
  DEFAULT_PICTURE_FREQUENCY,
  DEFAULT_TURNED_DOWN_HURT,
  FIRST_TIME_GAINS,
  HOTEL_PLACE,
  HOTEL_ROOM_MINUTES,
  HOTEL_ROOM_PRICE,
  INTIMACY_DETAIL_LEVELS,
  INTIMACY_REFUSAL_COSTS,
  INTIMATE_ACT_WEIGHT,
  INTIMATE_BEAT_COUNT,
  INTIMATE_ENERGY_COST,
  INTIMATE_LEADUP_TURNS_MAX,
  INTIMATE_MINUTES,
  INTIMATE_PASSAGES_BY_DETAIL,
  OVERHEARD_CHANCE,
  PARTY_OVERHEARD_CHANCE,
  PARTY_OVERHEARD_MAX,
  PICTURE_FREQUENCIES,
  PRIVATE_DANCE_GAINS,
  PRIVATE_DANCE_OFFER,
  PRIVATE_DANCE_TURNS,
  REPEAT_INTIMACY_GAINS,
  ROMANTIC_REPEAT_GAINS,
  SHORT_LINE_MAX,
  STAY_IN_PLACE_RULE,
  STAY_NIGHT_HOURS,
  STAY_OVER_SPOTS,
  STAY_TONIGHT_WINDOW,
  TURNED_DOWN_HURT,
  beatPhaseOf,
  explicitPassagePlan,
  isAttentionSeeker,
  isRomanticType,
  pictureBeatsFor,
  shrugsOffCommitment,
  wantsCommitmentFirst,
};
