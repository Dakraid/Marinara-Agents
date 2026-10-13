// Honeymoon trip after the wedding: start, trip days, night choices, faint resume, settlement
import { clockFromMinutes } from "../time/clock.mjs";
import { adjustBondAxis } from "../relationships/bonds.mjs";
import { clampOutingMood } from "../outings/outing-scoring.mjs";
import { firstModuleHook } from "../modules/module-registry.mjs";
import { openOuting, settleOuting } from "../outings/outing.mjs";
import { WEDDING_DAY_MINUTES } from "./proposal.mjs";
import { HONEYMOONS } from "./wedding.mjs";
import {
  HONEYMOON_DAYS,
  HONEYMOON_GAIN,
  TRIP_GOOD,
  TRIP_HOUR,
  TRIP_LANDS,
  TRIP_START,
  sleepUntilHour,
  takeWeddingDayOff,
} from "./wedding-morning.mjs";
import { advanceTime, bondOf, characterOf, logNote, nameFor } from "../game.mjs";

function honeymoonStarts(game, events = [], { fainted = false } = {}) {
  let after = game.afterWedding;
  if (
    ((game.afterWedding = null),
    !after?.honeymoon || !HONEYMOONS[after.honeymoon] || game.outing || !bondOf(game, after.characterId))
  ) {
    return false;
  }
  let day = clockFromMinutes(game.minutes).dayIndex;
  for (let i = 0; i < HONEYMOON_DAYS; i++) {
    takeWeddingDayOff(game, day + i);
  }
  let night = (game.weddings ?? []).findLast((wedding) => wedding.characterId === after.characterId)?.night ?? 0;
  game.visit = null;
  game.outing = {
    planId: null,
    characterId: after.characterId,
    kind: "honeymoon",
    place: "trip",
    trip: after.honeymoon,
    by: "you",
    startedAt: game.minutes,
    late: 0,
    used: 0,
    mood: clampOutingMood(TRIP_START + (night >= 62 ? TRIP_GOOD : 0)),
    phase: "talk",
    arrive: {
      words: [],
    },
    done: [],
    moment: null,
    result: null,
    reads: [],
    log: [],
    batch: [],
    found: [],
    paid: true,
    spent: 0,
    covered: 0,
    interrupt: null,
    interrupted: true,
    leaving: false,
    dream: false,
    bye: null,
    summary: null,
    cast: [after.characterId],
    tripDay: 1,
    ...(fainted
      ? {
          afterFaint: true,
        }
      : {}),
  };
  openOuting(game);
  let landsAt = day * WEDDING_DAY_MINUTES + TRIP_LANDS * 60;
  if (landsAt > game.minutes) {
    events.push(...advanceTime(game, landsAt - game.minutes).events);
  }
  if (game.outing) {
    game.outing.startedAt = game.minutes;
  }
  events.push({
    id: "honeymoon",
    characterId: after.characterId,
    text: `Your honeymoon: ${HONEYMOONS[after.honeymoon].name.toLowerCase()}, three days.`,
  });
  logNote(
    game,
    `Honeymoon with ${nameFor(game, characterOf(game, after.characterId))}: ${HONEYMOONS[after.honeymoon].name}`,
    "social",
  );
  return true;
}
function nextTripDay(game) {
  let outing = game.outing;
  if (outing?.kind !== "honeymoon" || outing.done.length < outing.tripDay || outing.tripDay >= HONEYMOON_DAYS) {
    return [];
  }
  let events = sleepUntilHour(game, TRIP_HOUR);
  outing.tripDay += 1;
  return events;
}
function outingNight(game, optionId) {
  let outing = game.outing;
  if (outing?.kind !== "honeymoon" || !outing.night) {
    return {
      ok: false,
      reason: "There is nothing to choose.",
    };
  }
  if (game.scene && !game.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (!outing.night.options.some((option) => option.id === optionId)) {
    return {
      ok: false,
      reason: "Pick one.",
    };
  }
  let hooked = firstModuleHook(game, "tripNightChosen", outing, optionId);
  return hooked
    ? {
        ok: true,
        milestone: hooked.milestone,
        how: hooked.how ?? null,
        characterId: outing.characterId,
      }
    : {
        ok: true,
        events: tripNightOver(game),
      };
}
function tripNightOver(game) {
  let outing = game.outing;
  return outing?.night ? ((outing.night = null), outing.phase === "summary" ? [] : nextTripDay(game)) : [];
}
function tripResumes(game) {
  let outing = game.outing;
  if (outing?.kind !== "honeymoon" || !outing.summary?.fainted) {
    return false;
  }
  let day = clockFromMinutes(game.minutes).dayIndex;
  for (let i = 0; i <= HONEYMOON_DAYS - (outing.tripDay ?? 1); i++) {
    takeWeddingDayOff(game, day + i);
  }
  Object.assign(outing, {
    phase: "talk",
    summary: null,
    moment: null,
    result: null,
    night: null,
    keyShown: null,
    batch: [],
    suggestions: [],
    afterFaint: true,
    faintDay: outing.tripDay ?? 1,
  });
  settleOuting(game);
  return true;
}
function settleHoneymoon(game) {
  let outing = game.outing,
    bond = bondOf(game, outing.characterId),
    goodTrip = outing.mood >= 62;
  for (let [axis, gain] of Object.entries(goodTrip ? HONEYMOON_GAIN.good : HONEYMOON_GAIN.else)) {
    adjustBondAxis(bond, axis, gain, {
      at: game.minutes,
    });
  }
  let wedding = (game.weddings ?? []).findLast((w) => w.characterId === outing.characterId);
  if (wedding) {
    wedding.trip = outing.mood;
  }
  return {
    honeymoon: true,
    home: true,
  };
}

export { honeymoonStarts, nextTripDay, outingNight, settleHoneymoon, tripNightOver, tripResumes };
