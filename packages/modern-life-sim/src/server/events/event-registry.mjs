// Event definition validation and registry
var EVENT_BEAT_TYPES = ["turns", "moment", "choice", "result"];
var EVENT_REGISTRY = new Map();
function defineEvent(definition) {
  if (!definition?.id || typeof definition.id != "string") {
    throw new Error("An event needs an id.");
  }
  if (EVENT_REGISTRY.has(definition.id)) {
    throw new Error(`The event ${definition.id} is defined twice.`);
  }
  if (!Array.isArray(definition.beats) || !definition.beats.length) {
    throw new Error(`The event ${definition.id} has no beats.`);
  }
  for (let beat of definition.beats) {
    if (!EVENT_BEAT_TYPES.includes(beat?.type)) {
      throw new Error(`The event ${definition.id} has a beat of no known type.`);
    }
    if (beat.type === "turns" && !(beat.min >= 0 && beat.max >= Math.max(1, beat.min))) {
      throw new Error(`The event ${definition.id} has turns without a sensible min and max.`);
    }
    if (beat.type === "choice" && !(Array.isArray(beat.options) && beat.options.length)) {
      throw new Error(`The event ${definition.id} has a choice with no options.`);
    }
  }
  let frozen = Object.freeze({
    family: "event",
    label: definition.id,
    ...definition,
    beats: Object.freeze(
      definition.beats.map((beat) =>
        Object.freeze({
          ...beat,
        }),
      ),
    ),
  });
  EVENT_REGISTRY.set(definition.id, frozen);
  return frozen;
}
var eventById = (id) => EVENT_REGISTRY.get(id) ?? null;

export { defineEvent, eventById };
