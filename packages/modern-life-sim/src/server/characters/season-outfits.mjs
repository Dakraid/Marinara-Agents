// Per-season outfits and sprites for characters, plus the LLM call that writes them
import { SEASON_NAMES, clockFromMinutes } from "../time/clock.mjs";

var SEASON_KEYS_LOWER = SEASON_NAMES.map((season) => season.toLowerCase());
var SEASON_OUTFIT_MAX = 300;
var SPRITE_FRAME_MODES = ["framed", "cut"];
var normalizeSpriteFrame = (frame) => (frame === "cut" ? "cut" : "framed");
var cleanSeasonOutfitText = (text) =>
  String(text ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["“”«»]+|["“”«»]+$/g, "")
    .slice(0, SEASON_OUTFIT_MAX)
    .trim();
function parseFourSeasonOutfits(raw) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let outfits = Array.isArray(raw)
    ? raw.slice(0, 4).map(cleanSeasonOutfitText)
    : SEASON_KEYS_LOWER.map((seasonKey) => cleanSeasonOutfitText(raw[seasonKey]));
  return outfits.length === 4 && outfits.every(Boolean) ? outfits : null;
}
var currentSeasonIndex = (world) => clockFromMinutes(world?.minutes ?? 0).seasonIndex;
var seasonOutfitsEnabled = (world) => !!world?.rules?.seasonOutfits;
var seasonLookUrl = (world, look) =>
  look?.url ? (normalizeSpriteFrame(world?.frame) === "cut" && look.clean?.url ? look.clean.url : look.url) : null;
function currentSeasonLook(world, person) {
  if (!seasonOutfitsEnabled(world) || !person || person.away) {
    return null;
  }
  let seasonIndex = currentSeasonIndex(world);
  for (let candidateSeason of [seasonIndex, (seasonIndex + 3) % 4]) {
    let url = seasonLookUrl(world, person.seasonLooks?.[candidateSeason]);
    if (url) {
      return {
        season: candidateSeason,
        url: url,
      };
    }
  }
  return null;
}
var currentSeasonSpriteUrl = (world, person) => currentSeasonLook(world, person)?.url ?? null;
function setSeasonOutfitByHand(person, seasonValue, outfitText) {
  if (!person) {
    return {
      ok: false,
      reason: "They are not in this life.",
    };
  }
  let season = Number(seasonValue);
  if (!Number.isInteger(season) || season < 0 || season > 3) {
    return {
      ok: false,
      reason: "There is no such season.",
    };
  }
  let outfit = cleanSeasonOutfitText(outfitText);
  return outfit
    ? person.seasonOutfits
      ? ((person.seasonOutfits[season] = outfit),
        (person.seasonFrom = {
          ...(person.seasonFrom ?? {}),
          [season]: "hand",
        }),
        (person.seasonLooks = {
          ...(person.seasonLooks ?? {}),
        }),
        person.seasonLooks[season]?.own || delete person.seasonLooks[season],
        {
          ok: true,
          season: season,
        })
      : {
          ok: false,
          reason: "Their season outfits are not written yet.",
        }
    : {
        ok: false,
        reason: "Say what they wear.",
      };
}
function storeSeasonSprite(
  person,
  season,
  { url = null, ref = null, clean = null, error = "", own = false } = {},
  at = 0,
) {
  if (person) {
    if (
      ((person.seasonLooks = {
        ...(person.seasonLooks ?? {}),
      }),
      !own && person.seasonLooks[season]?.own)
    ) {
      person.seasonAsked = (person.seasonAsked ?? []).filter((askedSeason) => askedSeason !== season);
      if (!person.seasonAsked.length) {
        delete person.seasonAsked;
      }
      return;
    }
    person.seasonLooks[season] = url
      ? {
          url: url,
          ref: ref,
          at: at,
          ...(own
            ? {
                own: true,
              }
            : {}),
          ...(clean?.url
            ? {
                clean: clean,
              }
            : {}),
        }
      : {
          error: String(error).slice(0, 200),
        };
    person.seasonAsked = (person.seasonAsked ?? []).filter((askedSeason) => askedSeason !== season);
    if (!person.seasonAsked.length) {
      delete person.seasonAsked;
    }
  }
}
function requestSeasonSpriteRedo(person, seasonValue) {
  if (!person?.seasonOutfits) {
    return {
      ok: false,
      reason: "Their season outfits are not written yet.",
    };
  }
  let season = Number(seasonValue);
  return !Number.isInteger(season) || season < 0 || season > 3
    ? {
        ok: false,
        reason: "There is no such season.",
      }
    : ((person.seasonLooks = {
        ...(person.seasonLooks ?? {}),
      }),
      delete person.seasonLooks[season],
      (person.seasonAsked = [...new Set([...(person.seasonAsked ?? []), season])]),
      {
        ok: true,
        season: season,
      });
}
function storeSeasonSpriteCutout(look, { url = null, ref = null } = {}) {
  if (look?.url) {
    if (url) {
      look.clean = {
        url: url,
        ref: ref,
      };
      delete look.cleanFailed;
    } else {
      look.cleanFailed = true;
    }
  }
}
function seasonOutfitsView(world, person, { on: spritesOn = false } = {}) {
  if (!seasonOutfitsEnabled(world) || !person) {
    return null;
  }
  let nowSeason = currentSeasonIndex(world),
    asked = new Set(person.seasonAsked ?? []);
  return {
    now: nowSeason,
    sprites: spritesOn,
    written: !!person.seasonOutfits,
    list: SEASON_NAMES.map((seasonName, index) => {
      let look = person.seasonLooks?.[index];
      return {
        season: seasonName,
        now: index === nowSeason,
        outfit: person.seasonOutfits?.[index] ?? "",
        by: person.seasonFrom?.[index] === "hand" ? "hand" : "model",
        sprite: look?.url
          ? {
              url: seasonLookUrl(world, look),
              ...(look.own
                ? {
                    own: true,
                  }
                : {}),
            }
          : look?.error
            ? {
                error: look.error,
              }
            : null,
        asked: asked.has(index),
      };
    }),
  };
}
function seasonOutfitsMessages({ name: personName = "", figure = null, description = "", job = "" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: season-outfits",
        "You dress a person for the four seasons of the year in the town they live in: what they wear out and about on an ordinary day, NOT at work.",
        "Start from the clothes they wear in their card (their style: colours, cut, the accessories they are never without) and from who they are (personality, story, taste). Each season is their own version of that style, for the weather: spring mild, summer hot, autumn cool, winter cold.",
        "Clothes and accessories ONLY: no body, face or hair, no pose, no place, no personality words, no art style.",
        "In English, one line each, concrete and visual, at most 35 words.",
        'Answer with JSON only, exactly: {"spring":"\u2026","summer":"\u2026","autumn":"\u2026","winter":"\u2026"}',
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        personName ? `NAME: ${personName}` : "",
        figure?.outfit ? `WEARS IN THEIR CARD: ${figure.outfit}` : "",
        figure?.body ? `BODY (for fit only, do not describe it): ${figure.body}` : "",
        description ? `WHO THEY ARE: ${String(description).slice(0, 1500)}` : "",
        job ? `THEIR JOB (they wear other clothes at work): ${job}` : "",
      ].filter(Boolean).join(`
`),
    },
  ];
}
async function writeSeasonOutfits(host, person) {
  let { json: json } = await host.askJson(seasonOutfitsMessages(person), {
      maxTokens: 500,
      task: "season-outfits",
      about: person.name ?? "",
    }),
    outfits = parseFourSeasonOutfits(json);
  if (!outfits) {
    throw new Error("The model did not write the four seasons.");
  }
  return outfits;
}

export {
  SPRITE_FRAME_MODES,
  currentSeasonIndex,
  currentSeasonLook,
  currentSeasonSpriteUrl,
  normalizeSpriteFrame,
  parseFourSeasonOutfits,
  requestSeasonSpriteRedo,
  seasonLookUrl,
  seasonOutfitsEnabled,
  seasonOutfitsView,
  setSeasonOutfitByHand,
  storeSeasonSprite,
  storeSeasonSpriteCutout,
  writeSeasonOutfits,
};
