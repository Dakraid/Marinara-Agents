// World hooks the cast simulation uses, and neighbour pairs
import { whereaboutsOf } from "../schedule/whereabouts.mjs";
import { relationshipProfile } from "../traits/traits.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import { learnYou, romanceBetween } from "../romance/jealousy.mjs";
import { partnersTogether } from "../romance/multiple-partners.mjs";
import { characterOf, whereOpts } from "../game.mjs";

var networkEnv = (state) => ({
  where: (character, minutes) => whereaboutsOf(character, minutes, whereOpts(state)),
  public: (placeId, minutes) => {
    let place = townPlace(state.town, placeId);
    return !!place && placeId !== "home" && !place.residence && !place.hall && isPlaceOpen(place, minutes);
  },
  speed: (character) =>
    relationshipProfile(
      state.bonds?.[character.id] ?? {
        archetype: character.archetype,
      },
    ).knobs.friendshipSpeed ?? 1,
  romance: (first, second, pair) => romanceBetween(state, first, second, pair),
  playerAt: () => (state.visit ? null : state.at),
  sawCouple: (couple, placeId, at) => {
    if (
      couple.secret &&
      learnYou(state, couple.a, couple.b, {
        how: "seen",
        place: placeId,
        at: at,
      })
    ) {
      (state.week.yours ??= []).push({
        a: couple.a,
        b: couple.b,
        how: "seen",
        place: placeId,
      });
    }
  },
  partners: (week, first, second, placeId, at, weight) =>
    partnersTogether(state, week, first, second, placeId, at, weight),
  neighbours: () => neighboursOf(state),
  door: (character, span) => {
    let residence = character.residence,
      doorKey = residence?.place && residence.unit != null ? `${residence.place}|${residence.unit}` : null;
    if (!doorKey || !span?.host) {
      return doorKey;
    }
    if (
      state.sleepover?.ids?.includes(character.id) ||
      (state.party?.guests?.[character.id]?.asleep && !state.party.guests[character.id].gone)
    ) {
      return null;
    }
    let hostResidence = span.host === "you" ? state.residence : characterOf(state, span.host)?.residence;
    return hostResidence?.place && `${hostResidence.place}|${hostResidence.unit}` === doorKey ? doorKey : null;
  },
});
function neighboursOf(state) {
  let residents = (state.characters ?? []).filter((character) => !character.away && character.residence?.place),
    pairs = [];
  for (let i = 0; i < residents.length; i++) {
    for (let j = i + 1; j < residents.length; j++) {
      if (residents[i].residence.place === residents[j].residence.place) {
        pairs.push([residents[i], residents[j], residents[i].residence.place]);
      }
    }
  }
  return pairs;
}

export { neighboursOf, networkEnv };
