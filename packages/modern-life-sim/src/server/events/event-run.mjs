// Event run beat navigation and phases
var cloneEventBeats = (definition) =>
  definition.beats.map((beat) => ({
    ...beat,
    ...(beat.options
      ? {
          options: [...beat.options],
        }
      : {}),
  }));
var isEventRun = (run) => !!run?.event && Array.isArray(run.beats);
var currentEventBeat = (run) => run?.beats?.[run.beat ?? 0] ?? null;
var nextEventBeat = (run) => run?.beats?.[(run.beat ?? 0) + 1] ?? null;
var phaseForBeat = (beat) =>
  beat?.type === "choice" ? "decide" : beat?.type === "moment" ? "moment" : beat?.type === "result" ? "result" : "talk";
function advanceEventBeat(run) {
  return !isEventRun(run) || (run.beat ?? 0) + 1 >= run.beats.length
    ? null
    : ((run.beat = (run.beat ?? 0) + 1), (run.phase = phaseForBeat(currentEventBeat(run))), currentEventBeat(run));
}
var currentBeatOptions = (run) => (currentEventBeat(run)?.type === "choice" ? [...currentEventBeat(run).options] : []);

export {
  advanceEventBeat,
  cloneEventBeats,
  currentBeatOptions,
  currentEventBeat,
  isEventRun,
  nextEventBeat,
  phaseForBeat,
};
