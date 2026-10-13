// Favour kinds, costs, prompt text, normalization and affordability
import { TIER_STEP_MOMENTS } from "./tier-steps.mjs";

var FAVOUR_KINDS = {
  help: {
    label: "Help",
    hint: "carry, fix, study, move something",
    small: {
      minutes: 60,
      energy: 20,
    },
    big: {
      minutes: 180,
      energy: 40,
    },
  },
  cover: {
    label: "Cover",
    hint: "wait for something, take their place for a while",
    small: {
      minutes: 60,
      energy: 10,
    },
    big: {
      minutes: 180,
      energy: 25,
    },
  },
  lend: {
    label: "Lend",
    hint: "money they need",
    small: {
      cash: 60,
    },
    big: {
      cash: 250,
    },
  },
};
var FAVOUR_KIND_IDS = Object.keys(FAVOUR_KINDS);
function describeFavourCost(cost = {}) {
  if (cost.cash) {
    return `exactly $${cost.cash}, lent: they will pay it back`;
  }
  let hours = Math.round((cost.minutes ?? 0) / 60);
  return hours ? `about ${hours === 1 ? "an hour" : `${hours} hours`} of the player's time, and some effort` : "";
}
var maxFavourMinutes = (size) => Math.max(0, ...Object.values(FAVOUR_KINDS).map((kind) => kind[size]?.minutes ?? 0));
function tierSceneMinutes(axis, tier, { exchanges = 8, perExchange = 5 } = {}) {
  let favourSize = TIER_STEP_MOMENTS[axis]?.[tier]?.favour;
  return exchanges * perExchange + (favourSize ? maxFavourMinutes(favourSize) : 0);
}
var FAVOUR_WHAT_MAX_CHARS = 110;
var listFavourKindsPrompt = (size) =>
  Object.entries(FAVOUR_KINDS)
    .map(([kindId, kind]) => `${kindId} (${kind.hint}; it costs the player ${describeFavourCost(kind[size])})`)
    .join(", ");
function normalizeFavour(raw, size, { kept = null, places = [] } = {}) {
  if (!size) {
    return null;
  }
  let what =
      typeof raw?.what == "string"
        ? raw.what
            .trim()
            .replace(/^["“”«»]+|["“”«»]+$/g, "")
            .slice(0, FAVOUR_WHAT_MAX_CHARS)
        : "",
    keptKind = FAVOUR_KIND_IDS.includes(kept?.kind) ? kept.kind : null,
    kind = FAVOUR_KIND_IDS.includes(raw?.kind) && (what || !keptKind) ? raw.kind : (keptKind ?? "help"),
    placeRef = typeof raw?.place == "string" ? raw.place.trim() : "",
    placeId =
      placeRef && FAVOUR_KINDS[kind][size]?.minutes
        ? (places.find(
            (place) =>
              place.id === placeRef ||
              `${place.id} (${place.name})` === placeRef ||
              place.name.toLowerCase() === placeRef.toLowerCase(),
          )?.id ?? null)
        : null,
    finalWhat = what || kept?.what || "",
    fixed = !finalWhat || (!what && !!kept?.fixed);
  return {
    kind: kind,
    size: size,
    what: finalWhat || `${FAVOUR_KINDS[kind].label}: ${FAVOUR_KINDS[kind].hint}`,
    cost: {
      ...FAVOUR_KINDS[kind][size],
    },
    ...(placeId
      ? {
          place: placeId,
        }
      : {}),
    ...(fixed
      ? {
          fixed: true,
        }
      : {}),
  };
}
function canAffordFavour(favour, { energy = 0, cash = 0 } = {}) {
  return favour
    ? favour.cost.energy && energy < favour.cost.energy
      ? {
          ok: false,
          why: `Not enough energy: it takes ${favour.cost.energy}, you have ${Math.floor(energy)}`,
        }
      : favour.cost.cash && cash < favour.cost.cash
        ? {
            ok: false,
            why: `Not enough money: it takes $${favour.cost.cash}, you have $${Math.floor(cash)}`,
          }
        : {
            ok: true,
            why: "",
          }
    : {
        ok: true,
        why: "",
      };
}

export {
  FAVOUR_KINDS,
  canAffordFavour,
  describeFavourCost,
  listFavourKindsPrompt,
  maxFavourMinutes,
  normalizeFavour,
  tierSceneMinutes,
};
