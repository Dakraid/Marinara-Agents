// Daily NPC schedule drifts and their generated words
import { clockFromMinutes } from "../time/clock.mjs";
import { driftDoingKey, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { bondSummary } from "../relationships/bonds.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { bondOf, castInTown, whereOpts } from "../game.mjs";

var DRIFT_DAYS_KEPT = 2;
function driftsToday(game) {
  let today = clockFromMinutes(game.minutes).dayIndex,
    dayStart = today * 1440,
    opts = whereOpts(game),
    drifts = [];
  for (let character of castInTown(game)) {
    for (let slot of (character.week ?? [])[today % 7] ?? []) {
      if (!slot?.place || slot.sleep) {
        continue;
      }
      let where = whereaboutsOf(character, dayStart + slot.from * 60, {
        ...opts,
        said: null,
      });
      if (!(!where.drift || !where.place)) {
        drifts.push({
          key: driftDoingKey(character.id, today, slot.from),
          characterId: character.id,
          place: where.place,
          from: slot.from,
          to: slot.to,
          friends: where.twist === "out-with-friends",
        });
      }
    }
  }
  return drifts;
}
function driftDue(game) {
  let today = clockFromMinutes(game.minutes).dayIndex;
  if (game.driftTried === today) {
    return null;
  }
  let pending = driftsToday(game).filter((drift) => !game.driftWords?.[drift.key]);
  return pending.length
    ? {
        day: today,
        list: pending,
      }
    : null;
}
function setDriftWords(game, day, words = {}) {
  game.driftTried = day;
  let kept = Object.entries(game.driftWords ?? {}).filter(([key]) => Number(key.split("|")[1]) > day - DRIFT_DAYS_KEPT);
  game.driftWords = Object.fromEntries([
    ...kept,
    ...Object.entries(words).filter(([, text]) => typeof text == "string" && text),
  ]);
}
function driftPeople(game, drifts) {
  return drifts.map((drift) => {
    let character = game.characters.find((candidate) => candidate.id === drift.characterId);
    return {
      key: drift.key,
      name: character?.name ?? "someone",
      description: (character?.description ?? "").slice(0, 240),
      tone: bondSummary(bondOf(game, drift.characterId)).archetype.tone,
      place: townPlace(game.town, drift.place)?.name ?? drift.place,
      from: drift.from,
      to: drift.to,
      friends: drift.friends,
    };
  });
}

export { DRIFT_DAYS_KEPT, driftDue, driftPeople, driftsToday, setDriftWords };
