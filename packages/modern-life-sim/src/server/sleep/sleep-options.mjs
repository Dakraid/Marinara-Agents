// Sleep duration options with wake time, energy, hunger and work-lateness preview
import { WEEKDAY_NAMES, formatClockTime } from "../time/clock.mjs";
import { OFFICE_SHIFT } from "../jobs/office-rules.mjs";
import { LATE_FROM_HOUR, isOfficeWorkday } from "../jobs/office-job.mjs";
import { maxEnergyFor, sleepNeeds } from "../needs/needs.mjs";

var SLEEP_MIN_MINUTES = 60;
var SLEEP_MAX_MINUTES = 720;
var SLEEP_STEP_MINUTES = 30;
var NIGHT_SLEEP_MINUTES = 480;
var SLEEP_HUNGRY_BELOW = 20;
function cleanSleepMinutes(raw) {
  let minutes = Number(raw);
  return Number.isFinite(minutes)
    ? Math.min(
        SLEEP_MAX_MINUTES,
        Math.max(SLEEP_MIN_MINUTES, Math.round(minutes / SLEEP_STEP_MINUTES) * SLEEP_STEP_MINUTES),
      )
    : null;
}
function wakeWorkStatus(job, { now: now, wake: wake, walk = 0 }) {
  if (!job?.employed) {
    return null;
  }
  let day = Math.floor(wake / 1440),
    dayStart = day * 1440;
  if (!isOfficeWorkday(dayStart + OFFICE_SHIFT.from * 60, job) || job.lastShiftDay === day) {
    return null;
  }
  let shiftStart = dayStart + OFFICE_SHIFT.from * 60,
    lateFrom = dayStart + LATE_FROM_HOUR * 60,
    lastStart = dayStart + (OFFICE_SHIFT.to - 1) * 60,
    arrival = wake + walk;
  return arrival <= shiftStart
    ? wake >= shiftStart - 240
      ? "early"
      : null
    : arrival < lateFrom
      ? "ontime"
      : arrival < lastStart
        ? "late"
        : now < lastStart
          ? "miss"
          : null;
}
function sleepOptions({
  now: now,
  needs: needs,
  bedQuality = 0.7,
  fitness = 0,
  job = null,
  walk = 0,
  until = null,
  hunger: showHunger = true,
}) {
  let maxEnergy = maxEnergyFor(fitness),
    options = [],
    untilMinutes = until !== null ? Math.min(SLEEP_MAX_MINUTES, Math.max(SLEEP_MIN_MINUTES, until - now)) : null,
    durations = [];
  for (let minutes = SLEEP_MIN_MINUTES; minutes <= SLEEP_MAX_MINUTES; minutes += SLEEP_STEP_MINUTES) {
    durations.push(minutes);
  }
  if (untilMinutes !== null && !durations.includes(untilMinutes)) {
    durations.push(untilMinutes);
  }
  for (let minutes of durations.sort((left, right) => left - right)) {
    let after = sleepNeeds(needs, minutes, {
        bedQuality: bedQuality,
        fitness: fitness,
      }),
      wakeAt = now + minutes,
      nextDay = Math.floor(wakeAt / 1440) !== Math.floor(now / 1440);
    options.push({
      minutes: minutes,
      wake: formatClockTime(wakeAt),
      day: nextDay ? WEEKDAY_NAMES[Math.floor(wakeAt / 1440) % 7].toUpperCase() : null,
      energy: Math.round(after.energy - needs.energy),
      full: after.energy >= maxEnergy,
      hunger: showHunger ? Math.round(needs.hunger - after.hunger) : 0,
      hungry: showHunger && after.hunger < SLEEP_HUNGRY_BELOW,
      work: wakeWorkStatus(job, {
        now: now,
        wake: wakeAt,
        walk: walk,
      }),
    });
  }
  let workPreset = options.filter((option) => option.work === "early").at(-1)?.minutes ?? null,
    fullPreset = options.find((option) => option.full)?.minutes ?? null,
    pick = untilMinutes ?? (workPreset !== null && workPreset < NIGHT_SLEEP_MINUTES ? workPreset : NIGHT_SLEEP_MINUTES);
  return {
    options: options,
    presets: {
      until: untilMinutes,
      work: workPreset,
      full: fullPreset,
      night: NIGHT_SLEEP_MINUTES,
      nap: SLEEP_MIN_MINUTES,
    },
    pick: pick,
  };
}

export { SLEEP_MAX_MINUTES, SLEEP_MIN_MINUTES, cleanSleepMinutes, sleepOptions };
