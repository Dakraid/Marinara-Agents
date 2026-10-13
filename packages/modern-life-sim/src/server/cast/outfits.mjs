// Work/season sprites, cut-outs, frame and picture sizes
import {
  SPRITE_FRAME_MODES,
  currentSeasonIndex,
  currentSeasonLook,
  normalizeSpriteFrame,
  requestSeasonSpriteRedo,
  seasonOutfitsEnabled,
  seasonOutfitsView,
  setSeasonOutfitByHand,
  storeSeasonSprite,
  storeSeasonSpriteCutout,
} from "../characters/season-outfits.mjs";
import { IMAGE_SIZE_LIMITS, parseBackgroundSize, parsePortraitSize } from "../images/backgrounds.mjs";
import { withHomeAndWork } from "../home/residence.mjs";
import { workingNow } from "./working-now.mjs";
import { characterOf, imageChoice } from "../game.mjs";

var workSpritesOn = (state) => !!state.rules?.workOutfits && !!imageChoice(state).connectionId;
var workSpritesToPaint = (state) =>
  workSpritesOn(state)
    ? state.characters
        .filter(
          (character) =>
            character.job?.id &&
            character.workOutfit &&
            !character.workLook?.url &&
            !character.workLook?.error &&
            !character.away,
        )
        .map((character) => character.id)
    : [];
var seasonSpritesOn = (state) => seasonOutfitsEnabled(state) && !!imageChoice(state).connectionId;
var seasonsToWrite = (state) =>
  seasonOutfitsEnabled(state)
    ? state.characters
        .filter((character) => !character.away && !character.seasonOutfits)
        .map((character) => character.id)
    : [];
function seasonSpritesToPaint(state, { manual = false } = {}) {
  if (!seasonSpritesOn(state)) {
    return [];
  }
  let seasonIndex = currentSeasonIndex(state),
    due = [];
  for (let character of state.characters) {
    if (character.away || !character.seasonOutfits) {
      continue;
    }
    let asked = new Set(character.seasonAsked ?? []);
    for (let season = 0; season < 4; season += 1) {
      let look = character.seasonLooks?.[season];
      if (!(look?.url || look?.error)) {
        if (asked.has(season) || (season === seasonIndex && !manual)) {
          due.push({
            id: character.id,
            season: season,
          });
        }
      }
    }
  }
  return due;
}
var seasonsOf = (state, characterId) =>
  seasonOutfitsView(state, characterOf(state, characterId), {
    on: seasonSpritesOn(state),
  });
function setSeasonOutfit(state, characterId, season, text) {
  let character = characterOf(state, characterId),
    result = setSeasonOutfitByHand(character, season, text);
  if (result.ok && result.season === currentSeasonIndex(state) && seasonSpritesOn(state)) {
    requestSeasonSpriteRedo(character, result.season);
  }
  return result;
}
function redoSeasonPicture(state, characterId, season) {
  return seasonSpritesOn(state)
    ? requestSeasonSpriteRedo(characterOf(state, characterId), season)
    : {
        ok: false,
        reason: "Switch on \xABSeason outfits\xBB in RULES first (it needs an image connection).",
      };
}
var keepSeasonPicture = (state, characterId, season, sprite) =>
  storeSeasonSprite(characterOf(state, characterId), season, sprite, state.minutes);
function cutOutsDue(state) {
  if (normalizeSpriteFrame(state.frame) !== "cut") {
    return [];
  }
  let due = [];
  for (let character of state.characters) {
    if (!character.away) {
      if (character.workLook?.url && !character.workLook.clean && !character.workLook.cleanFailed) {
        due.push({
          id: character.id,
          what: "work",
        });
      }
      for (let [season, look] of Object.entries(character.seasonLooks ?? {})) {
        if (look?.url && !look.clean && !look.cleanFailed) {
          due.push({
            id: character.id,
            what: Number(season),
          });
        }
      }
    }
  }
  return due;
}
function keepCutOut(state, characterId, which, cutout) {
  let character = characterOf(state, characterId);
  storeSeasonSpriteCutout(which === "work" ? character?.workLook : character?.seasonLooks?.[which], cutout ?? {});
}
function dressedNow(state, character) {
  if (!character) {
    return character;
  }
  character = withHomeAndWork(state, character);
  let look = currentSeasonLook(state, character),
    outfit = look ? character.seasonOutfits?.[look.season] : null,
    wearing =
      character.workOutfit && workingNow(state, character)
        ? `At work right now (${character.job.title}), wearing: ${character.workOutfit}.`
        : outfit
          ? `Wearing today: ${outfit}.`
          : null;
  if (!wearing) {
    return character;
  }
  let body = character.figure?.body || character.appearance || "";
  return {
    ...character,
    appearance: [body, wearing].filter(Boolean).join(`
`),
  };
}
function setFrame(state, frame) {
  return SPRITE_FRAME_MODES.includes(frame)
    ? ((state.frame = frame),
      {
        ok: true,
        frame: frame,
      })
    : {
        ok: false,
        reason: "There is no such way to stand.",
      };
}
function setPictureSize(state, input) {
  let size = parseBackgroundSize(input);
  return size
    ? ((state.pictureSize = size),
      {
        ok: true,
        size: size,
      })
    : {
        ok: false,
        reason: `Width and height go from ${IMAGE_SIZE_LIMITS.min} to ${IMAGE_SIZE_LIMITS.max}, and 16 million pixels at most.`,
      };
}
function setPortraitSize(state, input) {
  let size = parsePortraitSize(input);
  return size
    ? ((state.portraitSize = size),
      {
        ok: true,
        size: size,
      })
    : {
        ok: false,
        reason: `Width and height go from ${IMAGE_SIZE_LIMITS.min} to ${IMAGE_SIZE_LIMITS.max}, and 16 million pixels at most.`,
      };
}

export {
  cutOutsDue,
  dressedNow,
  keepCutOut,
  keepSeasonPicture,
  redoSeasonPicture,
  seasonSpritesOn,
  seasonSpritesToPaint,
  seasonsOf,
  seasonsToWrite,
  setFrame,
  setPictureSize,
  setPortraitSize,
  setSeasonOutfit,
  workSpritesOn,
  workSpritesToPaint,
};
