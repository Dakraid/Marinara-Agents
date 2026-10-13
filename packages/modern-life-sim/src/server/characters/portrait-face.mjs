// Character portrait URL and face-crop (x, y, zoom) cleaning and setting
import { currentSeasonSpriteUrl } from "./season-outfits.mjs";

var DEFAULT_FACE_CROP = {
  x: 50,
  y: 24,
  zoom: 2,
};
var FACE_ZOOM_RANGE = {
  min: 1,
  max: 4,
};
var clampNumberOr = (value, min, max, fallback) => {
  let number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};
function cleanFaceCrop(crop) {
  return !crop || typeof crop != "object"
    ? {
        ...DEFAULT_FACE_CROP,
      }
    : {
        x: Math.round(clampNumberOr(crop.x, 0, 100, DEFAULT_FACE_CROP.x) * 10) / 10,
        y: Math.round(clampNumberOr(crop.y, 0, 100, DEFAULT_FACE_CROP.y) * 10) / 10,
        zoom:
          Math.round(clampNumberOr(crop.zoom, FACE_ZOOM_RANGE.min, FACE_ZOOM_RANGE.max, DEFAULT_FACE_CROP.zoom) * 100) /
          100,
      };
}
function characterPortrait(person, world = null) {
  return {
    avatar: (world ? currentSeasonSpriteUrl(world, person) : null) || person?.avatar || null,
    face: cleanFaceCrop(person?.face),
  };
}
function setFaceCrop(person, crop, world = null) {
  return person
    ? !person.avatar && !(world && currentSeasonSpriteUrl(world, person))
      ? "They have no picture yet."
      : ((person.face = cleanFaceCrop(crop)), "")
    : "They are not in this life.";
}

export { characterPortrait, setFaceCrop };
