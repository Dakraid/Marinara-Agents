// Gender, orientation, romanceability and pronouns
import { seededRandom } from "../schedule/whereabouts.mjs";
import {
  ORIENTATION_REVEAL_FRIENDSHIP_TIER,
  SEX_GROUPS,
  attractionBadge,
  attractionLabel,
  isAttractedToGender,
  narrowAttraction,
  normalizeAttraction,
  normalizeGender,
} from "../orientation/orientation.mjs";
import { bondTier } from "../relationships/bonds.mjs";
import { npcPairsOf } from "../network/town-facts.mjs";
import { isPartner } from "./jealousy.mjs";
import { bondOf, castInTown, characterOf, hasMet2, nameFor } from "../game.mjs";
import { isModuleOn } from "../modules/module-registry.mjs";
import { kinBarsRomance } from "../relationships/kin.mjs";

var sexOf = (state, characterId) =>
  normalizeGender(characterOf(state, characterId)?.gender) ??
  normalizeGender(characterOf(state, characterId)?.figure?.sex) ??
  "other";
var genderOf = (state, characterId) =>
  characterId === "you" ? normalizeGender(state.gender) : normalizeGender(sexOf(state, characterId));
var likesYou = (state, characterId) =>
  isAttractedToGender(characterOf(state, characterId)?.into, normalizeGender(state.gender));
var likeEachOther = (state, firstId, secondId) =>
  isAttractedToGender(characterOf(state, firstId)?.into, genderOf(state, secondId)) &&
  isAttractedToGender(characterOf(state, secondId)?.into, genderOf(state, firstId));
function syncRomance(state, characterId) {
  let bond = bondOf(state, characterId),
    character = characterOf(state, characterId);
  if (!(!bond || !character)) {
    bond.cardRomance = character.romanceable !== false;
    bond.notInto = !likesYou(state, characterId);
    bond.romanceable = bond.cardRomance && !bond.notInto && !kinBarsRomance(state, bond);
  }
}
function settleOrientation(state, ids = state.characters.map((id) => id.id)) {
  for (let id of ids) {
    let character = characterOf(state, id),
      bond = bondOf(state, id);
    if (!(!character || !bond)) {
      if (!likesYou(state, id) && (isPartner(state, id) || bondTier(bond, "romance") >= 1)) {
        character.into = [
          ...new Set([...normalizeAttraction(character.into), SEX_GROUPS[normalizeGender(state.gender)]]),
        ].filter(Boolean);
      }
      syncRomance(state, id);
    }
  }
}
function setYourGender(state, gender) {
  let normalized = normalizeGender(gender);
  return normalized
    ? ((state.gender = normalized),
      settleOrientation(state),
      {
        ok: true,
        gender: normalized,
      })
    : {
        ok: false,
        reason: "A woman, a man or futanari.",
      };
}
function setOrientation(state, characterId, { gender: gender, into: into } = {}) {
  let character = characterOf(state, characterId);
  if (!character) {
    return {
      ok: false,
      reason: "That person is not in this life.",
    };
  }
  let normalized = gender === undefined ? character.gender : normalizeGender(gender);
  return normalized
    ? ((character.gender = normalized),
      into !== undefined && (character.into = normalizeAttraction(into)),
      syncRomance(state, characterId),
      {
        ok: true,
        name: character.name,
      })
    : {
        ok: false,
        reason: "A woman, a man or futanari.",
      };
}
var intoKnown = (state, characterId) =>
  !!bondOf(state, characterId)?.intoKnown ||
  (hasMet2(state, characterId) &&
    bondTier(bondOf(state, characterId), "friendship") >= ORIENTATION_REVEAL_FRIENDSHIP_TIER);
function learnInto(state, characterId, how = "said") {
  let bond = bondOf(state, characterId);
  return !bond || bond.intoKnown
    ? false
    : ((bond.intoKnown = {
        how: how,
        at: state.minutes,
      }),
      true);
}
function intoView(state, characterId) {
  let character = characterOf(state, characterId);
  if (!character) {
    return null;
  }
  let known = intoKnown(state, characterId),
    attraction = normalizeAttraction(character.into);
  return {
    known: known,
    name: known ? attractionLabel(attraction) : null,
    notYou: known && bondOf(state, characterId)?.notInto ? attractionBadge(attraction) || "Not into you" : null,
  };
}
function intoTick(state, events) {
  for (let character of castInTown(state).filter(
    (character2) =>
      hasMet2(state, character2.id) && !intoKnown(state, character2.id) && narrowAttraction(character2.into),
  )) {
    let confidant = npcPairsOf(state, character.id).find(
      (pair) =>
        ["close", "family", "friends"].includes(pair.kind) &&
        hasMet2(state, pair.other) &&
        !characterOf(state, pair.other)?.away &&
        bondTier(bondOf(state, pair.other), "friendship") >= ORIENTATION_REVEAL_FRIENDSHIP_TIER,
    );
    if (!(!confidant || seededRandom(state.seed, character.id, String(state.minutes), "into-told") > 0.25)) {
      learnInto(state, character.id, "told");
      events.push({
        id: "into-heard",
        characterId: character.id,
        from: confidant.other,
        text: `${nameFor(state, characterOf(state, confidant.other))} mentioned that ${character.name} is only into ${normalizeAttraction(character.into)[0]}.`,
      });
      return;
    }
  }
}
var pronounOf = (state, characterId) =>
  ({
    female: "She",
    male: "He",
    futanari: "She",
  })[sexOf(state, characterId)] ?? "They";
// Pictures show futanari only with the Adult module on; otherwise they are drawn as women
var pictureSexOf = (state, sex) => (sex === "futanari" && !isModuleOn(state, "adult") ? "female" : sex);
var objectOf = (state, characterId) =>
  ({
    female: "her",
    male: "him",
    futanari: "her",
  })[sexOf(state, characterId)] ?? "them";

export {
  genderOf,
  intoKnown,
  intoTick,
  intoView,
  learnInto,
  likeEachOther,
  likesYou,
  objectOf,
  pictureSexOf,
  pronounOf,
  setOrientation,
  setYourGender,
  settleOrientation,
  syncRomance,
};
