// Trait dials/flags, archetype trait defaults, derived behaviours, labels and LLM trait prompts
import { ARCHETYPES, LIKE_ACTIONS, blendArchetypes } from "../relationships/archetypes.mjs";

var TRAIT_DIALS = [
  "open",
  "smitten",
  "jealousy",
  "forgiveness",
  "attention",
  "initiative",
  "temper",
  "romantic",
  "caring",
  "faithful",
];
var TRAIT_FLAGS = ["reserved", "shy", "proud", "freeSpirit", "practical"];
var TRAIT_DIAL_MAX = 10;
var TRAIT_DIAL_DEFAULT = 5;
var DIAL_TO_KNOB_STOPS = [0, 3, 7, 10];
var LIKE_STEPS = ["--", "-", "0", "+", "++"];
function interpolateDialStops(stops, dial) {
  let value = Math.max(0, Math.min(TRAIT_DIAL_MAX, Number(dial) || 0));
  for (let i = 1; i < DIAL_TO_KNOB_STOPS.length; i++) {
    if (value <= DIAL_TO_KNOB_STOPS[i]) {
      let fraction = (value - DIAL_TO_KNOB_STOPS[i - 1]) / (DIAL_TO_KNOB_STOPS[i] - DIAL_TO_KNOB_STOPS[i - 1]);
      return stops[i - 1] + (stops[i] - stops[i - 1]) * fraction;
    }
  }
  return stops[stops.length - 1];
}
var knobFromDial = (dial) => interpolateDialStops([0, 1, 2, 3], dial);
var ARCHETYPE_TRAITS = {
  slowBurn: {
    dials: {
      open: 5,
      smitten: 0,
      jealousy: 3,
      forgiveness: 10,
      attention: 0,
      initiative: 7,
      temper: 4,
      romantic: 5,
      caring: 5,
      faithful: 6,
    },
    flags: [],
  },
  flirt: {
    dials: {
      open: 8,
      smitten: 10,
      jealousy: 3,
      forgiveness: 7,
      attention: 10,
      initiative: 10,
      temper: 1,
      romantic: 6,
      caring: 5,
      faithful: 2,
    },
    flags: [],
  },
  guarded: {
    dials: {
      open: 2,
      smitten: 3,
      jealousy: 7,
      forgiveness: 0,
      attention: 3,
      initiative: 0,
      temper: 6,
      romantic: 2,
      caring: 2,
      faithful: 8,
    },
    flags: ["reserved"],
  },
  devoted: {
    dials: {
      open: 7,
      smitten: 7,
      jealousy: 10,
      forgiveness: 2,
      attention: 7,
      initiative: 7,
      temper: 1,
      romantic: 8,
      caring: 7,
      faithful: 10,
    },
    flags: [],
  },
  freeSpirit: {
    dials: {
      open: 8,
      smitten: 7,
      jealousy: 0,
      forgiveness: 10,
      attention: 0,
      initiative: 3,
      temper: 1,
      romantic: 2,
      caring: 4,
      faithful: 2,
    },
    flags: ["freeSpirit"],
  },
  caretaker: {
    dials: {
      open: 9,
      smitten: 3,
      jealousy: 3,
      forgiveness: 10,
      attention: 3,
      initiative: 3,
      temper: 1,
      romantic: 2,
      caring: 10,
      faithful: 6,
    },
    flags: [],
  },
  rival: {
    dials: {
      open: 5,
      smitten: 3,
      jealousy: 3,
      forgiveness: 7,
      attention: 3,
      initiative: 3,
      temper: 9,
      romantic: 5,
      caring: 4,
      faithful: 5,
    },
    flags: [],
  },
  shy: {
    dials: {
      open: 3,
      smitten: 0,
      jealousy: 3,
      forgiveness: 10,
      attention: 3,
      initiative: 3,
      temper: 4,
      romantic: 5,
      caring: 3,
      faithful: 8,
    },
    flags: ["shy"],
  },
  prickly: {
    dials: {
      open: 3,
      smitten: 3,
      jealousy: 7,
      forgiveness: 3,
      attention: 7,
      initiative: 0,
      temper: 6,
      romantic: 4,
      caring: 3,
      faithful: 6,
    },
    flags: ["proud"],
  },
  romantic: {
    dials: {
      open: 7,
      smitten: 10,
      jealousy: 7,
      forgiveness: 3,
      attention: 7,
      initiative: 7,
      temper: 1,
      romantic: 10,
      caring: 6,
      faithful: 7,
    },
    flags: [],
  },
  grounded: {
    dials: {
      open: 5,
      smitten: 7,
      jealousy: 0,
      forgiveness: 7,
      attention: 0,
      initiative: 3,
      temper: 4,
      romantic: 2,
      caring: 6,
      faithful: 6,
    },
    flags: ["practical"],
  },
  possessive: {
    dials: {
      open: 5,
      smitten: 10,
      jealousy: 10,
      forgiveness: 0,
      attention: 9,
      initiative: 10,
      temper: 4,
      romantic: 6,
      caring: 4,
      faithful: 9,
    },
    flags: [],
  },
};
var clampTraitDial = (value) =>
  Number.isFinite(Number(value))
    ? Math.max(0, Math.min(TRAIT_DIAL_MAX, Math.round(Number(value))))
    : TRAIT_DIAL_DEFAULT;
var normalizeLikeStep = (step) => (LIKE_STEPS.includes(step) ? step : "0");
function normalizeTraits(traits = {}) {
  return {
    dials: Object.fromEntries(TRAIT_DIALS.map((dial) => [dial, clampTraitDial(traits?.dials?.[dial])])),
    flags: TRAIT_FLAGS.filter((flag) => (traits?.flags ?? []).includes(flag)),
    likes: Object.fromEntries(LIKE_ACTIONS.map((action) => [action, normalizeLikeStep(traits?.likes?.[action])])),
    tone: String(traits?.tone ?? "")
      .trim()
      .slice(0, 600),
    from: typeof traits?.from == "string" ? traits.from.slice(0, 60) : "own",
  };
}
var archetypeTraitsKey = (archetype = {}) => `${archetype?.main ?? "grounded"}|${archetype?.second ?? ""}`;
function archetypeDefaultTraits(archetype = {}) {
  let main = ARCHETYPES[archetype?.main] ? archetype.main : "grounded",
    second = ARCHETYPES[archetype?.second] && archetype.second !== main ? archetype.second : null,
    blend = blendArchetypes(main, second),
    mainTraits = ARCHETYPE_TRAITS[main],
    flags = [...new Set([...mainTraits.flags, ...(second ? ARCHETYPE_TRAITS[second].flags : [])])];
  return {
    ...normalizeTraits({
      dials: mainTraits.dials,
      flags: flags,
      likes: blend.likes,
      tone: blend.tone,
    }),
    from: archetypeTraitsKey(archetype),
  };
}
var hasTraitFlag = (traits, flag) => !!traits?.flags?.includes(flag);
function effectiveTraits(character) {
  let traits = character?.traits;
  return traits && (traits.from === "own" || traits.from === archetypeTraitsKey(character?.archetype))
    ? traits
    : archetypeDefaultTraits(character?.archetype);
}
function relationshipProfile(character) {
  let traits = effectiveTraits(character),
    dials = traits.dials,
    knob = (dial) => Math.round(knobFromDial(dial)),
    hasFlag = (flag) => traits.flags.includes(flag),
    archetype = traits.from && traits.from !== "own" ? ARCHETYPES[traits.from.split("|")[0]] : null,
    rules = archetype
      ? {
          ...(archetype.rules ?? {}),
        }
      : {
          ...(dials.attention >= 10
            ? {
                boredWithoutNovelty: true,
              }
            : {}),
          ...(hasFlag("reserved")
            ? {
                deepNeedsTrustTier: 2,
                doubleTrustCushion: true,
              }
            : {}),
          ...(dials.forgiveness <= 2
            ? {
                missedPlanUnforgiven: true,
                betrayalUnforgiven: true,
              }
            : {}),
          ...(dials.temper >= 8
            ? {
                hatesBeingLetWin: true,
              }
            : {}),
          ...(hasFlag("shy")
            ? {
                jealousyWithdraws: true,
                flirtSafeFromFriendshipTier: 2,
              }
            : {}),
          ...(hasFlag("proud")
            ? {
                hidesRomanceUntilTier: 3,
              }
            : {}),
          ...(dials.romantic >= 8
            ? {
                missedDateUnforgiven: true,
              }
            : {}),
          ...(hasFlag("practical")
            ? {
                romanceLeansOnTrust: true,
              }
            : {}),
        };
  return {
    knobs: archetype
      ? {
          ...archetype.knobs,
        }
      : {
          romanceNeedsFriendship: knob(TRAIT_DIAL_MAX - dials.smitten),
          friendshipSpeed: knob(dials.open),
          romanceSpeed: knob(dials.smitten),
          trustSpeed: knob(dials.open),
          jealousy: knob(dials.jealousy),
          forgiveness: knob(dials.forgiveness),
          drifting: knob(dials.attention),
          initiative: knob(dials.initiative),
        },
    dials: dials,
    flags: traits.flags,
    rules: rules,
    likes: traits.likes,
    tone:
      traits.tone ||
      (traits.from === "own"
        ? describeTraitsTone(traits)
        : blendArchetypes(character?.archetype?.main ?? "grounded", character?.archetype?.second ?? null).tone),
    main: character?.archetype?.main ?? "grounded",
    second: character?.archetype?.second ?? null,
    name: blendArchetypes(character?.archetype?.main ?? "grounded", character?.archetype?.second ?? null).name,
  };
}
var interpolatePoints = (points, x) => {
  let sorted = [...points].sort((left, right) => left[0] - right[0]);
  if (x <= sorted[0][0]) {
    return sorted[0][1];
  }
  for (let i = 1; i < sorted.length; i++) {
    if (x <= sorted[i][0]) {
      return (
        sorted[i - 1][1] +
        (sorted[i][1] - sorted[i - 1][1]) * ((x - sorted[i - 1][0]) / (sorted[i][0] - sorted[i - 1][0]))
      );
    }
  }
  return sorted[sorted.length - 1][1];
};
var TRAIT_BEHAVIOURS = {
  wakeTemper: (traits) => (traits.dials.temper < 3 ? 0 : traits.dials.temper < 5 ? 1 : 2),
  warmAtHome: (traits) => traits.dials.open >= 7,
  keepsHome: (traits) => ["reserved", "shy", "proud"].find((flag) => traits.flags.includes(flag)) ?? null,
  payStyle: (traits) => ({
    proud: traits.flags.includes("proud") || traits.flags.includes("reserved") || traits.dials.temper >= 8,
    oldSchool: traits.dials.romantic >= 8,
    neverMinds: traits.dials.caring >= 7 && traits.dials.romantic >= 8,
    hatesSplit: traits.dials.attention >= 10,
    likesSplit: traits.flags.includes("freeSpirit") || traits.flags.includes("practical"),
  }),
  leavesOnShock: (traits) => traits.dials.jealousy >= 7 && traits.dials.romantic >= 6,
  shrugs: (traits) => traits.dials.faithful <= 3,
  endsItThere: (traits) => traits.dials.faithful >= 10,
  ringCare: (traits) => (traits.dials.romantic >= 6 ? 2 : traits.dials.romantic >= 4 ? 1 : 0),
  tooMuch: (traits) => traits.flags.includes("freeSpirit") || traits.flags.includes("practical"),
  proposeLikes: (traits) =>
    ["shy", "reserved", "proud", "practical"].some((flag) => traits.flags.includes(flag))
      ? "simple"
      : traits.dials.caring >= 7 || traits.dials.smitten <= 1 || (traits.dials.open >= 8 && traits.dials.romantic <= 2)
        ? "ours"
        : "candles",
  proposeDislikes: (traits) =>
    ["shy", "reserved", "proud"].some((flag) => traits.flags.includes(flag)) ? "candles" : null,
  hurtByNo: (traits) =>
    traits.dials.forgiveness <= 3 && traits.dials.romantic >= 6 ? "hard" : traits.dials.faithful <= 3 ? "light" : "",
  weddingShare: (traits) =>
    traits.dials.caring >= 7 ? 0.6 : traits.dials.romantic >= 9 || traits.dials.attention >= 10 ? 0.3 : 0.5,
  stray: (traits) =>
    interpolatePoints(
      [
        [0, 1.4],
        [2, 1.2],
        [5, 0.7],
        [6, 0.5],
        [7, 0.4],
        [8, 0.3],
        [9, 0.2],
        [10, 0],
      ],
      traits.dials.faithful,
    ),
  tellsOnYou: (traits) =>
    traits.flags.includes("practical")
      ? 1
      : interpolatePoints(
          [
            [2, 0],
            [5, 0.5],
            [6, 0.5],
            [7, 0.6],
            [8, 0.75],
            [10, 1],
          ],
          traits.dials.faithful,
        ) *
        (traits.flags.includes("shy") ? 0.25 : traits.flags.includes("reserved") ? 0.4 : 1) *
        (traits.dials.jealousy >= 10 && traits.dials.forgiveness <= 1 ? 0.7 : 1),
  possessive: (traits) => traits.dials.jealousy >= 10 && traits.dials.forgiveness <= 1,
  lean: (traits) => {
    if (traits.flags.includes("freeSpirit")) {
      return -2;
    }
    let jealousy = traits.dials.jealousy,
      base =
        jealousy >= 10 || (jealousy >= 6 && (traits.flags.includes("reserved") || traits.flags.includes("proud")))
          ? 1
          : jealousy <= 3 && (traits.dials.open >= 8 || traits.flags.includes("practical"))
            ? -1
            : 0;
    return Math.max(
      -2,
      Math.min(2, base + (TRAIT_BEHAVIOURS.possessive(traits) ? 1 : 0) + (traits.dials.temper >= 8 ? 2 : 0)),
    );
  },
  ultimatum: (traits) => traits.dials.jealousy >= 10 && !traits.flags.includes("freeSpirit"),
  neverUltimatum: (traits) => traits.flags.includes("freeSpirit"),
  introChance: (traits) =>
    traits.flags.includes("shy") || traits.dials.open <= 2 ? 0.1 : traits.dials.open >= 8 ? 0.6 : 0.3,
  helpTier: (traits) =>
    traits.dials.caring >= 9 ? 2 : traits.flags.includes("reserved") || traits.flags.includes("shy") ? 4 : 3,
  bringsFood: (traits) => traits.dials.caring >= 9,
  opensSlowly: (traits) => ["reserved", "proud", "shy"].some((flag) => traits.flags.includes(flag)),
  takesItHard: (traits) => traits.dials.jealousy >= 10,
  takesItBadly: (traits) => traits.dials.jealousy >= 7 && traits.dials.romantic >= 6,
  confessesOwnWay: (traits) => traits.flags.includes("shy") || traits.dials.smitten <= 1,
};
var TRAIT_DIAL_LABELS = {
  open: {
    name: "Opens up",
    low: "Slow to warm up",
    high: "Opens up quickly",
  },
  smitten: {
    name: "Falls in love",
    low: "Slow to fall in love",
    high: "Falls in love easily",
  },
  jealousy: {
    name: "Jealousy",
    low: "Never jealous",
    high: "Gets jealous easily",
  },
  forgiveness: {
    name: "Forgiveness",
    low: "Holds a grudge",
    high: "Forgives easily",
  },
  attention: {
    name: "Needs attention",
    low: "Fine on their own",
    high: "Needs a lot of attention",
  },
  initiative: {
    name: "Initiative",
    low: "Lets you make the first move",
    high: "Makes the first move",
  },
  temper: {
    name: "Temper",
    low: "Easygoing",
    high: "Quick-tempered",
  },
  romantic: {
    name: "Romantic",
    low: "Not one for grand gestures",
    high: "A hopeless romantic",
  },
  caring: {
    name: "Caring",
    low: "Not the caring type",
    high: "Takes care of everyone",
  },
  faithful: {
    name: "Faithful",
    low: "Has a wandering eye",
    high: "Completely faithful",
  },
};
var TRAIT_FLAG_LABELS = {
  reserved: "Reserved",
  shy: "Shy",
  proud: "Proud",
  freeSpirit: "Free spirit",
  practical: "Practical",
};
var TRAIT_NOTABLE_BOUNDS = {
  low: 2,
  high: 8,
};
function notableTraitWords(traits) {
  return [
    ...TRAIT_DIALS.flatMap((dial) => {
      let value = traits?.dials?.[dial] ?? TRAIT_DIAL_DEFAULT;
      return value <= TRAIT_NOTABLE_BOUNDS.low
        ? [
            {
              key: dial,
              word: TRAIT_DIAL_LABELS[dial].low,
            },
          ]
        : value >= TRAIT_NOTABLE_BOUNDS.high
          ? [
              {
                key: dial,
                word: TRAIT_DIAL_LABELS[dial].high,
              },
            ]
          : [];
    }),
    ...TRAIT_FLAGS.filter((flag) => traits?.flags?.includes(flag)).map((flag) => ({
      key: flag,
      word: TRAIT_FLAG_LABELS[flag],
    })),
  ];
}
function describeTraitsTone(traits) {
  let words = [
    ...TRAIT_DIALS.flatMap((dial) => {
      let value = traits?.dials?.[dial] ?? TRAIT_DIAL_DEFAULT;
      return value <= TRAIT_NOTABLE_BOUNDS.low + 1
        ? [TRAIT_DIAL_LABELS[dial].low]
        : value >= TRAIT_NOTABLE_BOUNDS.high - 1
          ? [TRAIT_DIAL_LABELS[dial].high]
          : [];
    }),
    ...TRAIT_FLAGS.filter((flag) => traits?.flags?.includes(flag)).map((flag) => TRAIT_FLAG_LABELS[flag]),
  ];
  return words.length
    ? `${words
        .map((word) => word.toLowerCase())
        .join(", ")
        .replace(/^./, (letter) => letter.toUpperCase())}.`
    : "Even-keeled: nothing about them leans far one way.";
}
var LIKE_LABELS = {
  flirt: "Flirting",
  compliment: "Compliments",
  gift: "Gifts",
  time: "Spending time together",
  deep: "Deep talks",
  care: "Being looked after",
  challenge: "A challenge",
  novelty: "Something new",
  date: "Dates",
  reliable: "Keeping your word",
  space: "Being given space",
};
var TRAIT_DIAL_PROMPT_ENDS = {
  open: ["takes long to trust anyone or let them in", "makes friends and trusts quickly, shares their world"],
  smitten: ["romance only grows out of a long friendship", "falls for someone quickly"],
  jealousy: ["never jealous", "reacts to anything they see"],
  forgiveness: ["holds on to every hurt", "hurts pass quickly, forgives easily"],
  attention: ["fine without seeing you for a long time", "misses you soon and gets bored without something new"],
  initiative: ["waits for the other one to act", "comes looking for you, makes the first move"],
  temper: ["calm, nothing gets to them", "flares up easily, competitive"],
  romantic: ["gestures mean little to them", "gestures and romance matter a lot"],
  caring: ["looks after themselves", "takes care of others, generous"],
  faithful: ["looks elsewhere even when with someone", "never looks at anyone else when with someone"],
};
var TRAIT_FLAG_PROMPT_HINTS = {
  reserved: "keeps things to themselves until they trust you",
  shy: "shy: would rather not have an audience, does not come to confess",
  proud: "hides their feelings, hates being paid for",
  freeSpirit: "does not want to be tied down, never gives ultimatums",
  practical: "down to earth: romance leans on trust, happy to split the bill",
};
var archetypeTraitsSummary = (archetypeId) =>
  TRAIT_DIALS.map((dial) => `${dial} ${ARCHETYPE_TRAITS[archetypeId]?.dials?.[dial] ?? TRAIT_DIAL_DEFAULT}`).join(
    ", ",
  ) + (ARCHETYPE_TRAITS[archetypeId]?.flags?.length ? `; ${ARCHETYPE_TRAITS[archetypeId].flags.join(", ")}` : "");
var TRAITS_JSON_SHAPE = ` "traits":{${TRAIT_DIALS.map((dial) => `"${dial}":0`).join(",")}},"flags":["<from the list>"],"tone":"<one line>",`;
var TRAITS_PROMPT_RULES = [
  "`traits`: who they are, each from 0 to 10. Start from the numbers of the archetype you picked as `main` (they are in the list) and change only what the card says otherwise; what it does not speak of stays as the archetype has it.",
  ...TRAIT_DIALS.map(
    (dial) => `- ${dial}: 0 ${TRAIT_DIAL_PROMPT_ENDS[dial][0]} \xB7 10 ${TRAIT_DIAL_PROMPT_ENDS[dial][1]}.`,
  ),
  `\`flags\`: those of these that are true of them (the archetype's, unless the card says otherwise): ${TRAIT_FLAGS.map((flag) => `${flag} (${TRAIT_FLAG_PROMPT_HINTS[flag]})`).join("; ")}. An empty list when none.`,
  "`tone`: one line in English, how they come across when you are with them: their manner and what they are like to be around, true to the card. Not a list of their traits.",
].join(`
`);
function traitsFromModelAnswer(answer, archetype) {
  let defaults = archetypeDefaultTraits(archetype),
    rawDials = answer?.traits && typeof answer.traits == "object" ? answer.traits : {},
    dials = Object.fromEntries(
      TRAIT_DIALS.map((dial) => [
        dial,
        Number.isFinite(Number(rawDials[dial])) && rawDials[dial] !== "" && rawDials[dial] !== null
          ? rawDials[dial]
          : defaults.dials[dial],
      ]),
    ),
    flags = Array.isArray(answer?.flags) ? answer.flags : defaults.flags,
    tone =
      String(answer?.tone ?? "")
        .replace(/\s+/g, " ")
        .trim() || defaults.tone;
  return normalizeTraits({
    dials: dials,
    flags: flags,
    likes: defaults.likes,
    tone: tone,
    from: "own",
  });
}
var traitsEditorSchema = () => ({
  dials: TRAIT_DIALS.map((dial) => ({
    key: dial,
    ...TRAIT_DIAL_LABELS[dial],
  })),
  flags: TRAIT_FLAGS.map((flag) => ({
    key: flag,
    name: TRAIT_FLAG_LABELS[flag],
  })),
  likes: LIKE_ACTIONS.map((action) => ({
    key: action,
    name: LIKE_LABELS[action] ?? action,
  })),
  max: TRAIT_DIAL_MAX,
  at: TRAIT_NOTABLE_BOUNDS,
  likeSteps: LIKE_STEPS,
});

export {
  LIKE_LABELS,
  TRAITS_JSON_SHAPE,
  TRAITS_PROMPT_RULES,
  TRAIT_BEHAVIOURS,
  TRAIT_DIALS,
  TRAIT_FLAGS,
  TRAIT_NOTABLE_BOUNDS,
  archetypeDefaultTraits,
  archetypeTraitsSummary,
  effectiveTraits,
  hasTraitFlag,
  normalizeTraits,
  notableTraitWords,
  relationshipProfile,
  traitsEditorSchema,
  traitsFromModelAnswer,
};
