// Who is around to see the player, and flirt sightings
import { charactersAtPlace, seededRandom } from "../schedule/whereabouts.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { isHallPlace, isStreetPlace } from "../town/places.mjs";
import { isPlaceOpen, isResidencePlace, townPlace } from "../town/town-layout.mjs";
import { isAtActiveParty, partyGuestsAround } from "../parties/party.mjs";
import { knownName } from "../relationships/network-sheet.mjs";
import { coupleOf, learnedFact, otherIn } from "../romance/jealousy.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { bondOf, castInTown, characterOf, traitsOf, whereOpts } from "../game.mjs";

function takenBy(state, characterId) {
  let couple = coupleOf(state, characterId);
  return !couple || TRAIT_BEHAVIOURS.stray(traitsOf(state, characterId)) >= 1
    ? null
    : (characterOf(state, otherIn(couple, characterId)) ?? null);
}
function witnesses(state, exceptId = null) {
  if (state.party && isAtActiveParty(state)) {
    return partyGuestsAround(state).filter((id) => id !== exceptId);
  }
  if (
    state.visit ||
    state.at === "home" ||
    isResidencePlace(state.at) ||
    isHallPlace(state.at) ||
    isStreetPlace(state.at)
  ) {
    return [];
  }
  let place = townPlace(state.town, state.at);
  return !place || !isPlaceOpen(place, state.minutes)
    ? []
    : charactersAtPlace(castInTown(state), state.at, state.minutes, whereOpts(state))
        .map((character) => character.id)
        .filter((id) => id !== exceptId && !isAsleep(state, id));
}
var SEEN_CHANCE = {
  small: 0.5,
  medium: 0.3,
  big: 0.15,
  none: 0,
  party: 0.1,
};
var PLACE_SIZE = {
  cafe: "small",
  bar: "small",
  office: "small",
  library: "small",
  restaurant: "small",
  "store-casual": "small",
  furniture: "small",
  "gift-shop": "small",
  gym: "medium",
  market: "medium",
  arcade: "medium",
  cinema: "medium",
  hospital: "medium",
  police: "small",
  park: "big",
  university: "big",
  mall: "big",
  "food-court": "big",
  karaoke: "none",
};
var seenChance = (placeId) => SEEN_CHANCE[PLACE_SIZE[placeId] ?? "medium"];
function sawIt(state, exceptId = null) {
  let chance = state.party && isAtActiveParty(state) ? SEEN_CHANCE.party : seenChance(state.at),
    factSalt = String((state.facts ?? []).length);
  return witnesses(state, exceptId).filter(
    (id) => seededRandom(state.seed, "saw", String(state.minutes), factSalt, id) < chance,
  );
}
function flirtySeen(state, scene, tone) {
  if (!scene || tone !== "flirty" || scene.flirtSeen || !["talk", "intro"].includes(scene.kind)) {
    return null;
  }
  let bond = bondOf(state, scene.characterId);
  if (
    bond?.kin ||
    bond?.justFriends ||
    ((scene.flirtSeen = true),
    (scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length ? scene.did.tags : []).some(
      (tag) => tag.seen,
    ))
  ) {
    return null;
  }
  let seenBy = sawIt(state, scene.characterId),
    knowers = recordTownFact(state, "flirt", {
      with: scene.characterId,
      place: state.at,
      witnesses: seenBy,
    });
  for (let id of learnedFact(state, knowers, state.facts.at(-1).id, "seen")) {
    if (bondOf(state, id)?.asks) {
      bondOf(state, id).asks.due = state.minutes;
    }
  }
  return knowers.length
    ? {
        text: `\u{1F441} ${knowers.map((id) => knownName(state, id).toUpperCase()).join(", ")} SAW THAT`,
        bad: false,
        seen: true,
      }
    : null;
}

export { PLACE_SIZE, SEEN_CHANCE, flirtySeen, sawIt, seenChance, takenBy, witnesses };
