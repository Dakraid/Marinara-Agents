// Event cast membership and starting an event run
import { cloneEventBeats, phaseForBeat } from "./event-run.mjs";

var eventCast = (run) => (Array.isArray(run?.cast) ? run.cast : run?.characterId ? [run.characterId] : []);
function addToEventCast(run, characterId, { at = 0, why = "" } = {}) {
  return !characterId || eventCast(run).includes(characterId)
    ? false
    : ((run.cast = [...eventCast(run), characterId]),
      (run.joined = [
        ...(run.joined ?? []),
        {
          id: characterId,
          at: at,
          why: why,
          exchange: run.exchange ?? 0,
        },
      ]),
      true);
}
function startEventRun(definition) {
  let beats = cloneEventBeats(definition),
    turns = beats.find((beat) => beat.type === "turns");
  return {
    event: definition.id,
    beats: beats,
    beat: 0,
    phase: phaseForBeat(beats[0]),
    ...(turns
      ? {
          max: turns.max,
        }
      : {}),
  };
}

export { addToEventCast, eventCast, startEventRun };
