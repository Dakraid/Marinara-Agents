// How designer clothes and a luxury home impress or make the cast envious
import { adjustBondAxis, hasMet } from "../relationships/bonds.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { dateTastesFor } from "../outings/date-tastes.mjs";
import { isResidencePlace } from "../town/town-layout.mjs";
import { richLookOf, wearingItem } from "../home/furniture-and-wardrobe.mjs";
import { learnedFact } from "../romance/jealousy.mjs";
import { bondOf, characterOf, nameFor, traitsOf } from "../game.mjs";

var RICH_MOOD = 4;
var RICH_HOME = 2;
var RICH_FIRST = 3;
var RICH_ENVY = -3;
function richTake(life, characterId) {
  let traits = traitsOf(life, characterId);
  if (traits.flags.includes("practical")) {
    return -1;
  }
  if (traits.flags.includes("proud")) {
    return 1;
  }
  let person = characterOf(life, characterId);
  return dateTastesFor(person, bondOf(life, characterId)?.archetype).outings?.likes === "fancy" ? 1 : 0;
}
function envies(life, characterId) {
  return (
    bondOf(life, characterId)?.archetype?.main === "rival" || (traitsOf(life, characterId).dials.jealousy ?? 0) >= 8
  );
}
function richArrival(life, characterId, { atYours = false } = {}) {
  let look = richLookOf(life);
  if (!look) {
    return {
      mood: 0,
      words: [],
    };
  }
  let take = richTake(life, characterId),
    personName = nameFor(life, characterOf(life, characterId)),
    seen = [
      look.clothes ? `the player's designer clothes (${look.clothes})` : "",
      atYours && look.home ? `the player's home (${look.home})` : "",
    ].filter(Boolean);
  if (!seen.length) {
    return {
      mood: 0,
      words: [],
    };
  }
  let reaction =
    take > 0
      ? `${personName} is impressed, and it shows`
      : take < 0
        ? `${personName} finds it a bit much: showy is not their thing`
        : `${personName} notices; it does not change much for them`;
  return {
    mood: take * RICH_MOOD * seen.length + (atYours && look.home ? RICH_HOME : 0),
    words: [`${personName} takes in ${seen.join(" and ")}: ${reaction}.`],
    take: take,
  };
}
function richFirst(life, characterId) {
  return richLookOf(life)?.clothes ? richTake(life, characterId) * RICH_FIRST : 0;
}
function designerSeen(life, seenBy = []) {
  let item = wearingItem(life);
  if (!item?.luxury || !seenBy.length || isResidencePlace(life.at)) {
    return [];
  }
  if (((life.designerSeen ??= []), life.designerSeen.includes(life.wearing))) {
    return [];
  }
  life.designerSeen.push(life.wearing);
  let fact = recordTownFact(life, "designer", {
    place: life.at,
    what: item.name,
    witnesses: seenBy,
  });
  learnedFact(life, fact, life.facts.at(-1).id, "seen");
  return fact;
}
function envied(life, characterId, fact) {
  if (!fact || !(fact.act === "designer" || (fact.act === "moved" && ["luxury", "mansion"].includes(fact.what)))) {
    return false;
  }
  let bond = bondOf(life, characterId);
  return !bond || !hasMet(bond) || !envies(life, characterId) || ((bond.envied ??= []), bond.envied.includes(fact.id))
    ? false
    : (bond.envied.push(fact.id),
      adjustBondAxis(bond, "friendship", RICH_ENVY, {
        at: life.minutes,
      }),
      true);
}

export { RICH_ENVY, RICH_FIRST, RICH_HOME, RICH_MOOD, designerSeen, envied, envies, richArrival, richFirst, richTake };
