// Seasonal new-arrival items: LLM prompt and parser, gift tags
import { clockFromMinutes } from "../time/clock.mjs";

var NEW_ARRIVAL_KIND_DEFAULTS = {
  snack: {
    sold: "market",
    kind: "food",
    icon: "\u{1F950}",
    eat: {
      hunger: 20,
    },
    fresh: 1,
    minutes: 5,
    price: 4,
  },
  meal: {
    sold: "market",
    kind: "food",
    icon: "\u{1F961}",
    eat: {
      hunger: 40,
    },
    fresh: 2,
    minutes: 15,
    price: 9,
  },
  boost: {
    sold: "market",
    kind: "food",
    icon: "\u2615",
    eat: {
      hunger: 10,
      energy: 8,
    },
    fresh: 3,
    minutes: 5,
    price: 5,
  },
  gift: {
    sold: "market",
    kind: "gift",
    icon: "\u{1F381}",
    fresh: null,
    price: 22,
    gift: true,
  },
  casual: {
    store: "store-casual",
    kind: "clothes",
    icon: "\u{1F455}",
    style: "casual",
    price: 60,
  },
  smart: {
    store: "store-casual",
    kind: "clothes",
    icon: "\u2728",
    style: "smart",
    price: 140,
  },
  sport: {
    store: "store-casual",
    kind: "clothes",
    icon: "\u{1F3BD}",
    style: "sport",
    sport: true,
    price: 60,
  },
  formal: {
    store: "store-casual",
    kind: "clothes",
    icon: "\u{1F935}",
    style: "formal",
    formal: true,
    price: 170,
  },
};
var GIFT_TAGS = [
  "sweets",
  "flowers",
  "sporty",
  "books",
  "tech",
  "fashion",
  "music",
  "art",
  "cooking",
  "cute",
  "games",
  "outdoors",
  "tea-coffee",
  "jewelry",
];
var NEW_ARRIVAL_KINDS = ["snack", "meal", "boost", "gift", "casual", "smart", "sport", "formal"];
var NEW_ARRIVAL_OUTFIT_KINDS = ["casual", "smart", "sport", "formal"];
var seasonKeyAt = (minutes) => clockFromMinutes(minutes).seasonKey;
var WEARER_BY_GENDER = {
  male: "man",
  female: "woman",
  futanari: "futanari",
};
var OUTFIT_WEARER_RULES = {
  man: "The outfits are for the player to wear, and the player is a man: menswear only, no dresses, skirts, blouses or heels.",
  woman: "The outfits are for the player to wear, and the player is a woman: womenswear.",
  "": "The outfits are for the player to wear, whoever they are: keep them unisex.",
};
function newArrivalsPrompt({ season = "", setting = "", wearer = "" } = {}) {
  return [
    {
      role: "system",
      content: [
        "You write the NEW ARRIVALS of this season in the shops of a small modern town in a life-sim game. They stay on sale the whole season.",
        setting ? `THE SETTING: ${setting}` : "",
        season
          ? `The season: ${season}. Everything fits it: what people eat, give and wear in ${season.toLowerCase()}.`
          : "",
        `One item for each of these kinds, in this order: ${NEW_ARRIVAL_KINDS.join(", ")}.`,
        "snack/meal/boost are food from the supermarket (boost = a drink that perks you up); gift is a small present; casual/smart/sport/formal are WHOLE OUTFITS sold in the Mall's clothes stores (smart = a fashion boutique, formal = suits and evening wear).",
        `For the gift, pick ONE tag from this list: ${GIFT_TAGS.join(", ")}.`,
        'Names in ENGLISH, 2 to 4 words, seasonal and specific ("Autumn melon bread", "Chestnut tea set"). The line: at most 12 words, in English, what it is like. No prices, no numbers, no brand names, no people.',
        'Each outfit also has a `look`: the whole outfit as it is worn, in English, 10 to 25 words, top to shoes ("a rust corduroy jacket over a cream knit sweater, dark jeans and brown boots"). Clothes only: no body, no person, no colours of skin or hair.',
        OUTFIT_WEARER_RULES[wearer] ?? OUTFIT_WEARER_RULES[""],
        "Make them different from what these shops sell all year.",
        'Answer with JSON only: {"items":[{"kind":"snack","name":"...","line":"..."}, ..., {"kind":"gift","name":"...","line":"...","tag":"sweets"}, ..., {"kind":"casual","name":"...","line":"...","look":"..."}, ...]}',
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: "This season's new arrivals.",
    },
  ];
}
function parseNewArrivals(json, seasonIndex, wearer = "") {
  let raw = Array.isArray(json?.items) ? json.items : [],
    items = [],
    clean = (value, maxChars) =>
      String(value ?? "")
        // eslint-disable-next-line no-control-regex -- strips control characters
        .replace(/[\u0000-\u001f]/g, " ")
        .trim()
        .slice(0, maxChars);
  for (let kind of NEW_ARRIVAL_KINDS) {
    let entry = raw.find((candidate) => candidate?.kind === kind && !items.some((item) => item.newKind === kind)),
      itemName = clean(entry?.name, 40);
    if (!itemName) {
      continue;
    }
    let defaults = NEW_ARRIVAL_KIND_DEFAULTS[kind],
      tag = kind === "gift" && GIFT_TAGS.includes(entry?.tag) ? entry.tag : kind === "gift" ? "cute" : null,
      line = clean(entry?.line, 90),
      look = NEW_ARRIVAL_OUTFIT_KINDS.includes(kind)
        ? clean(entry?.look, 200) || [itemName, line].filter(Boolean).join(": ")
        : "";
    items.push({
      id: `new-s${seasonIndex}${wearer ? wearer[0] : ""}-${kind}`,
      newKind: kind,
      name: itemName,
      line: line,
      ...defaults,
      ...(tag
        ? {
            tags: [tag],
          }
        : {}),
      ...(look
        ? {
            text: look,
          }
        : {}),
    });
  }
  return {
    season: seasonIndex,
    wearer: wearer,
    items: items,
  };
}

export { GIFT_TAGS, WEARER_BY_GENDER, newArrivalsPrompt, parseNewArrivals, seasonKeyAt };
