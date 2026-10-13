// Morning after the wedding and honeymoon constants
import { clockFromMinutes } from "../time/clock.mjs";
import { refillNeeds } from "../needs/needs.mjs";
import { WEDDING_DAY_MINUTES } from "./proposal.mjs";
import { HONEYMOONS } from "./wedding.mjs";
import { honeymoonStarts } from "./honeymoon.mjs";
import { advanceTime, beginScene, bondOf, characterOf, skillLevelsOf } from "../game.mjs";

var MORNING_HOUR = 9;
var MORNING_EXCHANGES = 3;
var HONEYMOON_DAYS = 3;
var FLIGHT_HOUR = 14;
var TRIP_LANDS = 16;
var TRIP_HOUR = 10;
var TRIP_START = 60;
var TRIP_GOOD = 8;
var HONEYMOON_GAIN = {
  good: {
    romance: 5,
    trust: 3,
  },
  else: {
    romance: 2,
  },
};
var ANNIVERSARY_EFFECTS = {
  kept: {
    romance: 4,
    trust: 2,
  },
  missed: {
    romance: -4,
    trust: -4,
  },
};
function takeWeddingDayOff(game, day) {
  if (game.job?.employed && !game.job.daysOff?.includes(day)) {
    (game.job.daysOff ??= []).push(day);
  }
}
function sleepUntilHour(game, hour) {
  let startMinutes = game.minutes,
    targetMinutes = clockFromMinutes(startMinutes).dayIndex * WEDDING_DAY_MINUTES + hour * 60;
  if (targetMinutes <= startMinutes) {
    targetMinutes += WEDDING_DAY_MINUTES;
  }
  let { events: events } = advanceTime(game, targetMinutes - startMinutes, {
    asleep: true,
    bedQuality: 1,
  });
  game.needs = refillNeeds(game.needs, {
    hunger: 100,
    energy: 100,
    fitness: skillLevelsOf(game).fitness ?? 0,
  });
  return events;
}
function weddingMorning(game) {
  let after = game.afterWedding;
  if (!after || game.outing || (game.scene && !game.scene.done) || !bondOf(game, after.characterId)) {
    return {
      ok: false,
      reason: "Not now.",
    };
  }
  let spouseHome = hasOwnHome2(game) ? null : (characterOf(game, after.characterId)?.residence ?? null);
  if (!hasOwnHome2(game) && !spouseHome) {
    return {
      ok: false,
      reason: "No home to wake up in.",
      quiet: true,
    };
  }
  let result = morningAfter(game);
  if (spouseHome) {
    game.at = spouseHome.place;
    game.visit = {
      characterId: after.characterId,
      stage: "inside",
      invite: {
        yes: true,
      },
      at: game.minutes,
      since: game.minutes,
    };
    after.theirs = true;
  }
  beginScene(game, after.characterId, "talk");
  Object.assign(game.scene, {
    after: "wedding",
    leavesAt: null,
    max: MORNING_EXCHANGES,
  });
  return {
    ok: true,
    events: result,
  };
}
var hasOwnHome2 = (game) => !!game.residence && !game.lodging;
function morningAfter(game) {
  takeWeddingDayOff(game, clockFromMinutes(game.minutes).dayIndex + 1);
  let events = sleepUntilHour(game, MORNING_HOUR);
  if (game.residence && !game.lodging) {
    game.at = "home";
  }
  game.visit = null;
  return events;
}
function weddingMorningQuiet(game) {
  if (!game.afterWedding || game.outing || (game.scene && !game.scene.done)) {
    return [];
  }
  let result = morningAfter(game);
  honeymoonStarts(game, result);
  return result;
}
function morningWords(game) {
  let honeymoon = HONEYMOONS[game.afterWedding?.honeymoon];
  return `it is the morning after their wedding: they wake up ${game.afterWedding?.theirs ? "at their place, together" : "at home together"}, married now, with the party still everywhere (clothes on the floor, confetti)${honeymoon ? `; this afternoon they fly out on their honeymoon: ${honeymoon.name.toLowerCase()}` : ""}`;
}
function morningTags(game) {
  let honeymoon = HONEYMOONS[game.afterWedding?.honeymoon];
  return [
    {
      text: "MARRIED \xB7 DAY 1",
      step: true,
    },
    ...(honeymoon
      ? [
          {
            text: `${honeymoon.name.toUpperCase()} \xB7 YOUR FLIGHT AT ${String(FLIGHT_HOUR).padStart(2, "0")}:00`,
          },
        ]
      : []),
  ];
}

export {
  ANNIVERSARY_EFFECTS,
  FLIGHT_HOUR,
  HONEYMOON_DAYS,
  HONEYMOON_GAIN,
  MORNING_EXCHANGES,
  MORNING_HOUR,
  TRIP_GOOD,
  TRIP_HOUR,
  TRIP_LANDS,
  TRIP_START,
  morningTags,
  morningWords,
  sleepUntilHour,
  takeWeddingDayOff,
  weddingMorning,
  weddingMorningQuiet,
};
