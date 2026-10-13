// Date taste axes, archetype defaults, parsing and discovery
var DATE_TASTE_OPTIONS = {
  food: ["sweet", "savory", "spicy", "healthy", "comfort", "fancy"],
  films: ["romance", "action", "horror", "comedy", "drama", "animation"],
  music: ["pop", "rock", "ballads", "hip-hop", "indie", "oldies"],
  outings: ["quiet", "lively", "active", "games", "nature", "fancy"],
};
var DATE_TASTE_AXES = Object.keys(DATE_TASTE_OPTIONS);
var DATE_TASTE_STAMPS = {
  food: "FOOD",
  films: "FILMS",
  music: "MUSIC",
  outings: "OUTINGS",
};
var DATE_TASTE_HINTS = {
  food: "what they like to eat and drink",
  films: "the films (and stories) they like",
  music: "the music they like",
  outings:
    "the kind of outing they like: quiet (a caf\xE9, a film), lively (a bar, karaoke, crowds), active (sport), games (an arcade), nature (a park), fancy (a nice restaurant)",
};
var ARCHETYPE_DATE_TASTES = {
  slowBurn: {
    food: ["comfort", "spicy"],
    films: ["drama", "horror"],
    music: ["ballads", "hip-hop"],
    outings: ["quiet", "lively"],
  },
  freeSpirit: {
    food: ["spicy", "fancy"],
    films: ["animation", "drama"],
    music: ["indie", "pop"],
    outings: ["nature", "fancy"],
  },
  flirt: {
    food: ["sweet", "healthy"],
    films: ["comedy", "drama"],
    music: ["pop", "oldies"],
    outings: ["lively", "quiet"],
  },
  guarded: {
    food: ["savory", "sweet"],
    films: ["action", "romance"],
    music: ["rock", "pop"],
    outings: ["quiet", "lively"],
  },
  devoted: {
    food: ["comfort", "spicy"],
    films: ["romance", "horror"],
    music: ["ballads", "hip-hop"],
    outings: ["quiet", "games"],
  },
  caretaker: {
    food: ["comfort", "spicy"],
    films: ["animation", "horror"],
    music: ["oldies", "rock"],
    outings: ["nature", "lively"],
  },
  rival: {
    food: ["spicy", "sweet"],
    films: ["action", "romance"],
    music: ["rock", "ballads"],
    outings: ["active", "quiet"],
  },
  shy: {
    food: ["sweet", "spicy"],
    films: ["animation", "horror"],
    music: ["indie", "hip-hop"],
    outings: ["quiet", "lively"],
  },
  prickly: {
    food: ["savory", "sweet"],
    films: ["horror", "romance"],
    music: ["rock", "pop"],
    outings: ["games", "fancy"],
  },
  romantic: {
    food: ["fancy", "healthy"],
    films: ["romance", "horror"],
    music: ["ballads", "rock"],
    outings: ["fancy", "games"],
  },
  grounded: {
    food: ["comfort", "fancy"],
    films: ["drama", "animation"],
    music: ["oldies", "hip-hop"],
    outings: ["nature", "lively"],
  },
  possessive: {
    food: ["fancy", "healthy"],
    films: ["romance", "comedy"],
    music: ["ballads", "indie"],
    outings: ["quiet", "lively"],
  },
};
var DATE_TASTES_JSON_SHAPE =
  ' "dates":{"food":{"likes":"<food>","dislikes":"<food>"},"films":{"likes":"<film>","dislikes":"<film>"},"music":{"likes":"<music>","dislikes":"<music>"},"outings":{"likes":"<outing>","dislikes":"<outing>"}},';
var DATE_TASTES_PROMPT_RULE = `\`dates\` is what they like and dislike when going out, one of each, two different words, each from its closed list only, taken from what the card says or implies: ${DATE_TASTE_AXES.map((axis) => `\`${axis}\` (${DATE_TASTE_HINTS[axis]}): ${DATE_TASTE_OPTIONS[axis].join(", ")}`).join("; ")}.`;
function parseDateTastes(raw) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let tastes = {};
  for (let axis of DATE_TASTE_AXES) {
    let pick = (value) => {
        let word = String(value ?? "")
          .trim()
          .toLowerCase();
        return DATE_TASTE_OPTIONS[axis].includes(word) ? word : null;
      },
      likes = pick(raw[axis]?.likes),
      dislikes = pick(raw[axis]?.dislikes);
    if (likes && dislikes && likes !== dislikes) {
      tastes[axis] = {
        likes: likes,
        dislikes: dislikes,
      };
    }
  }
  return Object.keys(tastes).length ? tastes : null;
}
function dateTastesFor(bond, archetype = bond?.archetype ?? {}) {
  let stored = bond?.dateTastes ?? {},
    defaults = ARCHETYPE_DATE_TASTES[archetype?.main] ?? ARCHETYPE_DATE_TASTES.grounded;
  return Object.fromEntries(
    DATE_TASTE_AXES.map((axis) => [
      axis,
      stored[axis] ?? {
        likes: defaults[axis][0],
        dislikes: defaults[axis][1],
      },
    ]),
  );
}
var dateTasteVerdict = (tastes, axis, value) =>
  tastes?.[axis]
    ? tastes[axis].likes === value
      ? "liked"
      : tastes[axis].dislikes === value
        ? "disliked"
        : "fine"
    : "fine";
function recordDateTasteFound(bond, axis, value, verdict) {
  if (!(!DATE_TASTE_AXES.includes(axis) && axis !== "clothes")) {
    bond.dateFound = {
      ...(bond.dateFound ?? {}),
      [axis]: {
        ...(bond.dateFound?.[axis] ?? {}),
        [value]: verdict,
      },
    };
  }
}
function visibleDateTastes(character, bond, { open: showAll = false } = {}) {
  let tastes = dateTastesFor(character, bond?.archetype),
    found = bond?.dateFound ?? {};
  return Object.fromEntries(
    DATE_TASTE_AXES.map((axis) => [
      axis,
      {
        likes: showAll || found[axis]?.[tastes[axis].likes] ? tastes[axis].likes : null,
        dislikes: showAll || found[axis]?.[tastes[axis].dislikes] ? tastes[axis].dislikes : null,
      },
    ]),
  );
}

export {
  DATE_TASTES_JSON_SHAPE,
  DATE_TASTES_PROMPT_RULE,
  DATE_TASTE_STAMPS,
  dateTasteVerdict,
  dateTastesFor,
  parseDateTastes,
  recordDateTasteFound,
  visibleDateTastes,
};
