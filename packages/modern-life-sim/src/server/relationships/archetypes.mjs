// Romance archetype catalog, like/speed multipliers and archetype blending
var LIKE_ACTIONS = [
  "flirt",
  "compliment",
  "gift",
  "time",
  "deep",
  "care",
  "challenge",
  "novelty",
  "date",
  "reliable",
  "space",
];
var LIKE_LEVEL_MULTIPLIERS = {
  "++": 2,
  "+": 1.5,
  0: 1,
  "-": 0.5,
  "--": -1,
};
var SPEED_KNOB_MULTIPLIERS = [0.5, 0.75, 1, 1.5];
var DRIFT_DAYS_BY_KNOB = [21, 14, 10, 6];
var fillArchetypeLikes = (likes) => {
  let filled = {};
  for (let action of LIKE_ACTIONS) {
    filled[action] = likes[action] ?? "0";
  }
  return filled;
};
var ARCHETYPES = {
  slowBurn: {
    id: "slowBurn",
    name: "Slow Burn",
    knobs: {
      romanceNeedsFriendship: 3,
      friendshipSpeed: 1,
      romanceSpeed: 1,
      trustSpeed: 2,
      jealousy: 1,
      forgiveness: 3,
      drifting: 0,
      initiative: 2,
    },
    likes: fillArchetypeLikes({
      flirt: "-",
      time: "++",
      deep: "+",
      care: "+",
      date: "+",
      reliable: "+",
      space: "+",
    }),
    tone: "Warm, steady and unhurried. Treats you as a friend first and does not read flirting as serious until the friendship is deep. Shows affection through routine and small consistencies rather than words. Rarely dramatic; when feelings arrive they come late and all at once.",
    secondTone: "Takes their time with feelings and trusts what is built slowly.",
    event: {
      id: "late-realization",
      name: "Late realization",
    },
  },
  flirt: {
    id: "flirt",
    name: "Flirt",
    knobs: {
      romanceNeedsFriendship: 0,
      friendshipSpeed: 2,
      romanceSpeed: 3,
      trustSpeed: 1,
      jealousy: 1,
      forgiveness: 2,
      drifting: 3,
      initiative: 3,
    },
    likes: fillArchetypeLikes({
      flirt: "++",
      compliment: "++",
      gift: "+",
      deep: "-",
      challenge: "+",
      novelty: "+",
      date: "+",
    }),
    tone: "Playful, teasing and openly flirtatious from the start. Enjoys attention and banter, deflects heavy topics with a joke. Gets bored by routine and says so. Under the charm there is a question they rarely ask out loud: whether anyone takes them seriously.",
    secondTone: "Flirts easily and fills silences with teasing.",
    event: {
      id: "is-this-real",
      name: "Is this for real?",
    },
    rules: {
      boredWithoutNovelty: true,
    },
  },
  guarded: {
    id: "guarded",
    name: "Guarded",
    knobs: {
      romanceNeedsFriendship: 2,
      friendshipSpeed: 1,
      romanceSpeed: 1,
      trustSpeed: 0,
      jealousy: 2,
      forgiveness: 0,
      drifting: 1,
      initiative: 0,
    },
    likes: fillArchetypeLikes({
      flirt: "--",
      compliment: "-",
      gift: "-",
      deep: "+",
      care: "+",
      date: "-",
      reliable: "+",
      space: "++",
    }),
    tone: "Polite but closed. Answers questions with questions, changes the subject when it gets personal, and notices everything. Pushing makes them retreat; patience makes them talk. Once they trust someone they are fiercely loyal and surprisingly soft.",
    secondTone: "Keeps something back and does not share easily.",
    event: {
      id: "opening-up",
      name: "Opening up",
    },
    rules: {
      deepNeedsTrustTier: 2,
      doubleTrustCushion: true,
    },
  },
  devoted: {
    id: "devoted",
    name: "Devoted",
    knobs: {
      romanceNeedsFriendship: 1,
      friendshipSpeed: 2,
      romanceSpeed: 2,
      trustSpeed: 3,
      jealousy: 3,
      forgiveness: 1,
      drifting: 2,
      initiative: 2,
    },
    likes: fillArchetypeLikes({
      flirt: "+",
      compliment: "+",
      gift: "+",
      time: "++",
      deep: "+",
      care: "+",
      date: "+",
      reliable: "++",
      space: "-",
    }),
    tone: "Earnest, attentive and all-in. Remembers what you said weeks ago and shows up when it matters. Expects the same in return and is openly hurt when plans are broken. Loyalty is their love language; betrayal is the one thing they cannot let go.",
    secondTone: "Remembers the small things and expects you to keep your word.",
    event: {
      id: "pledge",
      name: "A pledge of loyalty",
    },
    rules: {
      missedPlanUnforgiven: true,
      betrayalUnforgiven: true,
    },
  },
  freeSpirit: {
    id: "freeSpirit",
    name: "Free Spirit",
    knobs: {
      romanceNeedsFriendship: 1,
      friendshipSpeed: 2,
      romanceSpeed: 2,
      trustSpeed: 1,
      jealousy: 0,
      forgiveness: 3,
      drifting: 0,
      initiative: 1,
    },
    likes: fillArchetypeLikes({
      flirt: "+",
      challenge: "+",
      novelty: "++",
      date: "-",
      space: "++",
    }),
    tone: "Easygoing, curious and hard to pin down. Always suggesting somewhere new, bored by schedules and rules. Warm without being possessive; goes quiet when things get too serious or too fixed. Freedom is non-negotiable, for them and for you.",
    secondTone: "Restless and happiest when a plan changes at the last minute.",
    event: {
      id: "dont-cage-me",
      name: "Do not cage me",
    },
  },
  caretaker: {
    id: "caretaker",
    name: "Caretaker",
    knobs: {
      romanceNeedsFriendship: 2,
      friendshipSpeed: 3,
      romanceSpeed: 1,
      trustSpeed: 2,
      jealousy: 1,
      forgiveness: 3,
      drifting: 1,
      initiative: 1,
    },
    likes: fillArchetypeLikes({
      compliment: "+",
      gift: "+",
      time: "+",
      deep: "+",
      care: "++",
      challenge: "-",
      reliable: "+",
    }),
    tone: "Kind, observant and quietly practical. Notices when you are tired or skipping meals and does something about it. Opens up most when they get to help, and when you let them see you struggle. Rarely asks for anything for themselves.",
    secondTone: "Looks after people without being asked.",
    event: {
      id: "looking-after-you",
      name: "Looking after you",
    },
  },
  rival: {
    id: "rival",
    name: "Rival",
    knobs: {
      romanceNeedsFriendship: 2,
      friendshipSpeed: 2,
      romanceSpeed: 1,
      trustSpeed: 1,
      jealousy: 1,
      forgiveness: 2,
      drifting: 1,
      initiative: 1,
    },
    likes: fillArchetypeLikes({
      compliment: "-",
      gift: "-",
      deep: "+",
      challenge: "++",
      novelty: "+",
      reliable: "+",
      space: "+",
    }),
    tone: "Competitive, direct and teasing. Respect comes before affection: they like people who can keep up. Hates being coddled or let win. Compliments land badly; a good match or an honest jab lands well. Affection shows up as provocation.",
    secondTone: "Turns things into a contest.",
    event: {
      id: "the-contest",
      name: "The contest",
    },
    rules: {
      hatesBeingLetWin: true,
    },
  },
  shy: {
    id: "shy",
    name: "Shy",
    knobs: {
      romanceNeedsFriendship: 3,
      friendshipSpeed: 1,
      romanceSpeed: 2,
      trustSpeed: 2,
      jealousy: 1,
      forgiveness: 3,
      drifting: 1,
      initiative: 1,
    },
    likes: fillArchetypeLikes({
      flirt: "--",
      compliment: "-",
      gift: "+",
      time: "+",
      deep: "++",
      care: "+",
      challenge: "-",
      novelty: "-",
      reliable: "+",
      space: "+",
    }),
    tone: "Soft-spoken and easily flustered. Short answers at first, long ones once comfortable. Direct flirting early on makes them freeze; a patient conversation makes them glow. Expresses more in small gestures than in words.",
    secondTone: "Gets flustered and goes quiet under attention.",
    event: {
      id: "working-up-to-it",
      name: "Working up to it",
    },
    rules: {
      jealousyWithdraws: true,
      flirtSafeFromFriendshipTier: 2,
    },
  },
  prickly: {
    id: "prickly",
    name: "Prickly",
    knobs: {
      romanceNeedsFriendship: 2,
      friendshipSpeed: 1,
      romanceSpeed: 2,
      trustSpeed: 1,
      jealousy: 2,
      forgiveness: 1,
      drifting: 2,
      initiative: 0,
    },
    likes: fillArchetypeLikes({
      flirt: "-",
      compliment: "--",
      gift: "+",
      challenge: "+",
      date: "-",
      reliable: "+",
      space: "+",
    }),
    tone: "Sharp-tongued and defensive. Denies caring while clearly caring. Hates being complimented in public or fussed over, but notices when you remember something about them. Jealousy comes out as sarcasm. Warmth slips out by accident and is immediately denied.",
    secondTone: "Hides warmth behind a sharp remark.",
    event: {
      id: "not-that-i-like-you",
      name: "Not that I like you",
    },
    rules: {
      hidesRomanceUntilTier: 3,
    },
  },
  romantic: {
    id: "romantic",
    name: "Romantic",
    knobs: {
      romanceNeedsFriendship: 1,
      friendshipSpeed: 2,
      romanceSpeed: 3,
      trustSpeed: 2,
      jealousy: 2,
      forgiveness: 1,
      drifting: 2,
      initiative: 2,
    },
    likes: fillArchetypeLikes({
      flirt: "+",
      compliment: "+",
      gift: "++",
      time: "+",
      deep: "+",
      novelty: "+",
      date: "++",
      reliable: "+",
      space: "-",
    }),
    tone: "Idealistic and expressive. Loves gestures, dates, anniversaries and anything that feels like a story. Says how they feel. Disappointment hits hard when reality does not match the picture in their head, especially a missed date.",
    secondTone: "Loves a grand gesture and remembers dates.",
    event: {
      id: "the-dream-date",
      name: "The dream date",
    },
    rules: {
      missedDateUnforgiven: true,
    },
  },
  grounded: {
    id: "grounded",
    name: "Grounded",
    knobs: {
      romanceNeedsFriendship: 1,
      friendshipSpeed: 1,
      romanceSpeed: 1,
      trustSpeed: 2,
      jealousy: 0,
      forgiveness: 2,
      drifting: 0,
      initiative: 1,
    },
    likes: fillArchetypeLikes({
      flirt: "-",
      compliment: "-",
      time: "+",
      deep: "+",
      care: "+",
      reliable: "++",
    }),
    tone: "Calm, practical and honest to a fault. Dislikes games and mixed signals; prefers plain words. Not easily impressed by gifts or charm, but consistency wins them over. Thinks about the long term and says so.",
    secondTone: "Plain-spoken and allergic to mind games.",
    event: {
      id: "about-the-future",
      name: "About the future",
    },
    rules: {
      romanceLeansOnTrust: true,
    },
  },
  possessive: {
    id: "possessive",
    name: "Possessive",
    knobs: {
      romanceNeedsFriendship: 0,
      friendshipSpeed: 2,
      romanceSpeed: 3,
      trustSpeed: 1,
      jealousy: 3,
      forgiveness: 0,
      drifting: 3,
      initiative: 3,
    },
    likes: fillArchetypeLikes({
      flirt: "+",
      compliment: "+",
      gift: "+",
      time: "++",
      novelty: "-",
      date: "+",
      reliable: "+",
      space: "--",
    }),
    tone: "Intense, affectionate and demanding of attention. Falls fast and wants to be the priority. Clingy and openly jealous, sulks or confronts when ignored. Never violent or threatening: the intensity is emotional, not dangerous.",
    secondTone: "Wants to be your priority and notices who else you see.",
    event: {
      id: "a-jealous-scene",
      name: "A jealous scene",
    },
  },
};
var ARCHETYPE_IDS = Object.keys(ARCHETYPES);
var archetypeById = (id) => ARCHETYPES[id] ?? null;
function blendArchetypes(mainId, secondId = null) {
  let main = archetypeById(mainId) ?? ARCHETYPES.grounded,
    second = secondId && secondId !== mainId ? archetypeById(secondId) : null,
    likes = {
      ...main.likes,
    };
  if (second) {
    for (let action of LIKE_ACTIONS) {
      if (main.likes[action] === "0" && second.likes[action] !== "0") {
        likes[action] = second.likes[action];
      }
    }
  }
  return {
    main: main.id,
    second: second?.id ?? null,
    name: second ? `${main.name} \xB7 ${second.name}` : main.name,
    knobs: {
      ...main.knobs,
    },
    rules: {
      ...(main.rules ?? {}),
    },
    likes: likes,
    tone: second ? `${main.tone} ${second.secondTone}` : main.tone,
    events: second ? [main.event, second.event] : [main.event],
  };
}

export {
  ARCHETYPES,
  ARCHETYPE_IDS,
  DRIFT_DAYS_BY_KNOB,
  LIKE_ACTIONS,
  LIKE_LEVEL_MULTIPLIERS,
  SPEED_KNOB_MULTIPLIERS,
  blendArchetypes,
};
