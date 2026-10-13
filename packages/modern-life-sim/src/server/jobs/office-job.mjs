// Office job state: shifts, lateness, warnings, firing, reviews, promotions, days off, overtime, quitting
import { WEEKDAY_NAMES, clockFromMinutes, daysBetween, formatHourLabel } from "../time/clock.mjs";
import { skillLevels } from "../skills/skill-levels.mjs";
import {
  DAYS_OFF_PER_SEASON,
  OFFICE_POSITIONS,
  OFFICE_SHIFT,
  OFFICE_WORKDAYS,
  OVERTIME_PER_WEEK,
  PERFORMANCE_GAIN_DECAY_PER_RANK,
  REVIEW_DAYS_OF_SEASON,
  REVIEW_MIN_DAYS_EMPLOYED,
  START_PERFORMANCE,
  WARNINGS_TO_FIRE,
  WARNING_MEMORY_DAYS,
} from "./office-rules.mjs";

var LATE_FROM_HOUR = OFFICE_SHIFT.from + 1;
var LATES_TO_WARN = 3;
var INTERVIEW_MINUTES = 20;
var REAPPLY_WAIT_DAYS = 3;
var FIRED_WAIT_DAYS = 14;
var OVERTIME = {
  minutes: 180,
  rate: 1.5,
  energy: 20,
  hunger: 10,
};
var LUNCH_BREAK = {
  from: 12,
  to: 13,
};
var LUNCH_GRACE_MINUTES = 10;
var LUNCH_SKIP_PERFORMANCE = 1;
var LUNCH_BREAK_MESSAGE = `You're on your lunch break: back at your desk at ${formatHourLabel(LUNCH_BREAK.to)}.`;
var LUNCH_REST_ENERGY = 4;
var VENDING_ITEMS = [
  {
    id: "vending-sandwich",
    name: "A sandwich from the machine",
    minutes: 10,
    costs: 6,
    food: {
      hunger: 30,
    },
  },
  {
    id: "vending-coffee",
    name: "Coffee from the machine",
    minutes: 5,
    costs: 3,
    food: {
      hunger: 5,
      energy: 5,
    },
  },
];
var shortDayLabel = (day) => `${WEEKDAY_NAMES[day % 7].toUpperCase()} ${(day % 30) + 1}`;
var nextWorkdayAfter = (day) => {
  let nextDay = day + 1;
  for (; !OFFICE_WORKDAYS.includes(nextDay % 7);) {
    nextDay++;
  }
  return nextDay;
};
function createOfficeJob({ at = 0, position = "intern", employed = true } = {}) {
  return {
    employed: employed,
    position: position,
    performance: START_PERFORMANCE,
    warnings: [],
    startedAt: at,
    shiftsWorked: 0,
    worked: [],
    lastShiftDay: null,
    daysOff: [],
    overtime: [],
    perfPerPosition: true,
    lastReview: null,
    startsOn: null,
    lates: [],
    refusedUntil: null,
    firedUntil: null,
    notice: null,
  };
}
var officeJobStarted = (job, day) => !!job?.employed && (job.startsOn ?? 0) <= day;
var officePositionById = (positionId) =>
  OFFICE_POSITIONS.find((position) => position.id === positionId) ?? OFFICE_POSITIONS[0];
var officePayOf = (job) => officePositionById(job.position).pay;
var performanceGainFactor = (positionId) =>
  PERFORMANCE_GAIN_DECAY_PER_RANK ** (officePositionById(positionId).rank - 1);
var nextOfficePosition = (positionId) =>
  OFFICE_POSITIONS.find((position) => position.rank === officePositionById(positionId).rank + 1) ?? null;
var isOfficeWorkday = (minutes, job) => {
  let clock = clockFromMinutes(minutes);
  return (
    OFFICE_WORKDAYS.includes(clock.weekdayIndex) &&
    !job.daysOff.some((dayOff) => dayOff === clock.dayIndex) &&
    officeJobStarted(job, clock.dayIndex)
  );
};
function canStartShift(job, minutes) {
  if (!job.employed) {
    return {
      ok: false,
      reason: "You do not work here.",
    };
  }
  let clock = clockFromMinutes(minutes);
  return officeJobStarted(job, clock.dayIndex)
    ? isOfficeWorkday(minutes, job)
      ? job.lastShiftDay === clock.dayIndex
        ? {
            ok: false,
            reason: "You already did today's shift.",
          }
        : clock.hour < OFFICE_SHIFT.from - 1
          ? {
              ok: false,
              reason: `Too early: the shift starts at ${formatHourLabel(OFFICE_SHIFT.from)}.`,
            }
          : clock.hour >= OFFICE_SHIFT.to - 1
            ? {
                ok: false,
                reason: "Too late to start the shift.",
              }
            : {
                ok: true,
                reason: "",
                late: clock.hour >= LATE_FROM_HOUR,
              }
      : {
          ok: false,
          reason: job.daysOff.includes(clock.dayIndex) ? "Your day off." : "Not a workday.",
        }
    : {
        ok: false,
        reason: `You start on ${shortDayLabel(job.startsOn)}.`,
      };
}
function workOfficeShift(
  job,
  {
    minutes = 0,
    skills = {},
    needs = {
      energy: 100,
      hunger: 100,
    },
    wearingSuit = true,
    moments = [],
  } = {},
) {
  let check = canStartShift(job, minutes);
  if (!check.ok) {
    return {
      ok: false,
      reason: check.reason,
    };
  }
  let clock = clockFromMinutes(minutes),
    levels = skillLevels(skills),
    delta = check.late ? -5 : 4;
  delta += wearingSuit ? 2 : -4;
  delta += needs.energy > 50 ? 3 : needs.energy < 25 ? -4 : 0;
  delta += needs.hunger >= 30 ? 1 : -3;
  delta += Math.min(3, (levels.knowledge + levels.charm) / 4);
  for (let moment of moments) {
    delta += Math.max(-4, Math.min(4, Number(moment) || 0));
  }
  if (delta > 0) {
    delta *= performanceGainFactor(job.position);
  }
  job.performance = Math.max(0, Math.min(100, Math.round((job.performance + delta) * 10) / 10));
  job.shiftsWorked += 1;
  job.lastShiftDay = clock.dayIndex;
  job.worked = [...(job.worked ?? []), clock.dayIndex].slice(-120);
  let pay = officePayOf(job),
    events = [],
    warned = false,
    fired = false;
  if (check.late) {
    if (((job.lates = [...(job.lates ?? []), clock.dayIndex]), job.lates.length >= LATES_TO_WARN)) {
      job.lates = [];
      let warning = addJobWarning(job, minutes, "Late three times");
      warned = true;
      fired = warning.fired;
    }
    events.push({
      id: "late",
      text: warned
        ? "You arrived late: the third time. A warning."
        : `You arrived late (${job.lates.length} of ${LATES_TO_WARN}).`,
    });
  }
  return {
    ok: true,
    pay: pay,
    performance: job.performance,
    delta: Math.round(delta * 10) / 10,
    late: check.late,
    warned: warned,
    fired: fired,
    events: events,
    xp: {
      knowledge: 10,
      charm: 5,
    },
  };
}
function addJobWarning(job, minutes, reason) {
  let clock = clockFromMinutes(minutes);
  job.warnings.push({
    at: minutes,
    day: clock.dayIndex,
    reason: reason,
  });
  let warningCount = activeJobWarnings(job, minutes).length,
    fired = warningCount >= WARNINGS_TO_FIRE;
  if (fired) {
    fireFromOfficeJob(job, clock.dayIndex);
  }
  job.notice = fired
    ? {
        kind: "fired",
        day: clock.dayIndex,
        reason: reason,
        until: job.firedUntil,
      }
    : {
        kind: reason === "Missed a day" ? "missed" : "lates",
        day: clock.dayIndex,
        reason: reason,
        warnings: warningCount,
      };
  return {
    warnings: warningCount,
    fired: fired,
  };
}
function fireFromOfficeJob(job, day) {
  job.employed = false;
  job.position = "intern";
  job.performance = START_PERFORMANCE;
  job.lates = [];
  job.firedUntil = day + FIRED_WAIT_DAYS;
}
function missedOfficeShift(job, minutes) {
  if (!job.employed || !officeJobStarted(job, clockFromMinutes(minutes).dayIndex)) {
    return {
      ok: false,
    };
  }
  job.performance = Math.max(0, job.performance - 12);
  let warning = addJobWarning(job, minutes, "Missed a day");
  return {
    ok: true,
    warned: true,
    warnings: warning.warnings,
    fired: warning.fired,
  };
}
var activeJobWarnings = (job, minutes) => {
  let lastAt = Math.max(-1 / 0, ...job.warnings.map((warning) => warning.at));
  return Number.isFinite(lastAt) && daysBetween(lastAt, minutes) < WARNING_MEMORY_DAYS ? job.warnings : [];
};
function reviewHalfOf(day) {
  let season = Math.floor(day / 30),
    half = (day % 30) + 1 >= REVIEW_DAYS_OF_SEASON[1] ? 1 : 0;
  return {
    key: `${season}-${half}`,
    from: season * 30 + REVIEW_DAYS_OF_SEASON[half] - 1,
  };
}
var reviewHalfDone = (job, half) =>
  job.lastReviewHalf === half.key ||
  (job.lastReview !== null && job.lastReview !== undefined && reviewHalfOf(job.lastReview).key === half.key);
var employedLongEnoughForReview = (job, half) =>
  half.from - clockFromMinutes(job.startedAt ?? 0).dayIndex >= REVIEW_MIN_DAYS_EMPLOYED;
function nextReviewDay(job, day) {
  let half = reviewHalfOf(day);
  if (!reviewHalfDone(job, half) && employedLongEnoughForReview(job, half)) {
    return {
      day: Math.max(day, half.from),
      pending: true,
    };
  }
  let day2 = half.from + 1;
  for (let i = 0; i < 400; i++, day2++) {
    let half2 = reviewHalfOf(day2);
    if (half2.key !== half.key && half2.from === day2 && employedLongEnoughForReview(job, half2)) {
      return {
        day: day2,
        pending: false,
      };
    }
  }
  return null;
}
var BOSS_FRIENDSHIP_PERFORMANCE_DISCOUNT = 10;
function promotionReview(job, minutes, skills, { boss = 0 } = {}) {
  if (!job.employed) {
    return null;
  }
  let clock = clockFromMinutes(minutes),
    half = reviewHalfOf(clock.dayIndex);
  if (reviewHalfDone(job, half) || !employedLongEnoughForReview(job, half)) {
    return null;
  }
  let next = nextOfficePosition(job.position);
  if (!next) {
    return {
      day: clock.dayIndex,
      next: null,
      qualifies: false,
      missing: ["You are at the top."],
    };
  }
  let levels = skillLevels(skills),
    missing = [];
  for (let [need, needed] of Object.entries(next.needs)) {
    if (need === "performance") {
      let performanceNeeded = Math.max(0, needed - boss * BOSS_FRIENDSHIP_PERFORMANCE_DISCOUNT);
      if (job.performance < performanceNeeded) {
        missing.push(`performance ${job.performance} of ${performanceNeeded}`);
      }
    } else if ((levels[need] ?? 0) < needed) {
      missing.push(`${need[0].toUpperCase()}${need.slice(1)} ${levels[need] ?? 0} of ${needed}`);
    }
  }
  return {
    day: clock.dayIndex,
    next: next,
    qualifies: missing.length === 0,
    missing: missing,
  };
}
function concludePromotionReview(job, minutes, { accepted = true } = {}) {
  let clock = clockFromMinutes(minutes);
  if (((job.lastReview = clock.dayIndex), (job.lastReviewHalf = reviewHalfOf(clock.dayIndex).key), !accepted)) {
    return {
      promoted: false,
      position: officePositionById(job.position),
    };
  }
  let next = nextOfficePosition(job.position);
  return next
    ? ((job.position = next.id),
      (job.performance = START_PERFORMANCE),
      {
        promoted: true,
        position: next,
      })
    : {
        promoted: false,
        position: officePositionById(job.position),
      };
}
function daysOffAllowance(job, day, { bossFriendshipTier = 0 } = {}) {
  let max = DAYS_OFF_PER_SEASON + (bossFriendshipTier >= 3 ? 1 : 0),
    used = (job.daysOff ?? []).filter((dayOff) => Math.floor(dayOff / 30) === Math.floor(day / 30)).length;
  return {
    max: max,
    left: Math.max(0, max - used),
  };
}
function requestDayOff(job, minutes, day, { bossFriendshipTier = 0 } = {}) {
  let clock = clockFromMinutes(minutes);
  if (day <= clock.dayIndex) {
    return {
      ok: false,
      reason: "You have to ask the day before.",
    };
  }
  if (job.daysOff.includes(day)) {
    return {
      ok: false,
      reason: "That day is already off.",
    };
  }
  let { max: max, left: left } = daysOffAllowance(job, day, {
    bossFriendshipTier: bossFriendshipTier,
  });
  return left
    ? (job.daysOff.push(day),
      {
        ok: true,
        day: day,
        left: left - 1,
      })
    : {
        ok: false,
        reason: `No more days off this season (${max}).`,
      };
}
function overtimeLeftThisWeek(job, minutes) {
  let week = Math.floor(clockFromMinutes(minutes).dayIndex / 7);
  return Math.max(0, OVERTIME_PER_WEEK - (job.overtime ?? []).filter((day) => Math.floor(day / 7) === week).length);
}
var overtimePay = (job) =>
  Math.round((officePayOf(job) / (OFFICE_SHIFT.minutes / 60)) * (OVERTIME.minutes / 60) * OVERTIME.rate);
function canWorkOvertime(job, minutes) {
  let clock = clockFromMinutes(minutes);
  return job.employed
    ? job.lastShiftDay !== clock.dayIndex
      ? {
          ok: false,
          reason: "Overtime comes after a shift.",
        }
      : (job.overtime ?? []).includes(clock.dayIndex)
        ? {
            ok: false,
            reason: "You already stayed late today.",
          }
        : overtimeLeftThisWeek(job, minutes)
          ? {
              ok: true,
              reason: "",
            }
          : {
              ok: false,
              reason: "You already stayed late twice this week.",
            }
    : {
        ok: false,
        reason: "You do not work here.",
      };
}
function workOvertime(job, minutes) {
  let check = canWorkOvertime(job, minutes);
  return check.ok
    ? (job.overtime.push(clockFromMinutes(minutes).dayIndex),
      (job.performance = Math.min(100, job.performance + 1)),
      {
        ok: true,
        pay: overtimePay(job),
        minutes: OVERTIME.minutes,
        energy: OVERTIME.energy,
        performance: job.performance,
      })
    : check;
}
function quitOfficeJob(job) {
  job.employed = false;
  job.position = "intern";
  job.performance = START_PERFORMANCE;
  job.lates = [];
  job.notice = null;
  return {
    ok: true,
  };
}
function canApplyForOfficeJob(job, minutes) {
  let day = clockFromMinutes(minutes).dayIndex;
  return job.employed
    ? {
        ok: false,
        reason: "You already work here.",
      }
    : job.firedUntil !== null && job.firedUntil !== undefined && day < job.firedUntil
      ? {
          ok: false,
          reason: `The Office will see you again on ${shortDayLabel(job.firedUntil)}.`,
          until: job.firedUntil,
        }
      : job.refusedUntil !== null && job.refusedUntil !== undefined && day < job.refusedUntil
        ? {
            ok: false,
            reason: `You can try again on ${shortDayLabel(job.refusedUntil)}.`,
            until: job.refusedUntil,
          }
        : {
            ok: true,
            reason: "",
          };
}

export {
  FIRED_WAIT_DAYS,
  INTERVIEW_MINUTES,
  LATES_TO_WARN,
  LATE_FROM_HOUR,
  LUNCH_BREAK,
  LUNCH_BREAK_MESSAGE,
  LUNCH_GRACE_MINUTES,
  LUNCH_REST_ENERGY,
  LUNCH_SKIP_PERFORMANCE,
  OVERTIME,
  REAPPLY_WAIT_DAYS,
  VENDING_ITEMS,
  activeJobWarnings,
  addJobWarning,
  canApplyForOfficeJob,
  canStartShift,
  canWorkOvertime,
  concludePromotionReview,
  createOfficeJob,
  daysOffAllowance,
  isOfficeWorkday,
  missedOfficeShift,
  nextOfficePosition,
  nextReviewDay,
  nextWorkdayAfter,
  officeJobStarted,
  officePayOf,
  officePositionById,
  overtimeLeftThisWeek,
  overtimePay,
  promotionReview,
  quitOfficeJob,
  requestDayOff,
  shortDayLabel,
  workOfficeShift,
  workOvertime,
};
