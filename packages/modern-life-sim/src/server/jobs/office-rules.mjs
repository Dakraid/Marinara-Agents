// Office shift, positions ladder, warnings and review constants
import { formatHourLabel } from "../time/clock.mjs";

var OFFICE_SHIFT = {
  from: 9,
  to: 15,
  minutes: 360,
  energy: 20,
  hunger: 15,
};
var OFFICE_WORKDAYS = [0, 1, 2, 3, 4];
var PROMOTION_PERFORMANCE_NEEDED = 90;
var PERFORMANCE_GAIN_DECAY_PER_RANK = 0.85;
var OFFICE_POSITIONS = [
  {
    rank: 1,
    id: "intern",
    name: "Intern",
    pay: 60,
    needs: {},
  },
  {
    rank: 2,
    id: "clerk",
    name: "Clerk",
    pay: 85,
    needs: {
      knowledge: 2,
      performance: PROMOTION_PERFORMANCE_NEEDED,
    },
  },
  {
    rank: 3,
    id: "senior",
    name: "Senior clerk",
    pay: 120,
    needs: {
      knowledge: 4,
      performance: PROMOTION_PERFORMANCE_NEEDED,
    },
  },
  {
    rank: 4,
    id: "lead",
    name: "Team lead",
    pay: 165,
    needs: {
      knowledge: 6,
      charm: 2,
      performance: PROMOTION_PERFORMANCE_NEEDED,
    },
  },
  {
    rank: 5,
    id: "manager",
    name: "Section manager",
    pay: 220,
    needs: {
      knowledge: 6,
      charm: 4,
      performance: PROMOTION_PERFORMANCE_NEEDED,
    },
  },
  {
    rank: 6,
    id: "head",
    name: "Department head",
    pay: 300,
    needs: {
      knowledge: 8,
      charm: 6,
      performance: PROMOTION_PERFORMANCE_NEEDED,
    },
  },
];
var WARNINGS_TO_FIRE = 3;
var WARNING_MEMORY_DAYS = 30;
var REVIEW_DAYS_OF_SEASON = [1, 15];
var DAYS_OFF_PER_SEASON = 2;
var REVIEW_MIN_DAYS_EMPLOYED = 7;
var START_PERFORMANCE = 0;
var OVERTIME_PER_WEEK = 2;
var OFFICE_HOURS_LABEL = `Mon\u2013Fri ${formatHourLabel(OFFICE_SHIFT.from)}\u2013${formatHourLabel(OFFICE_SHIFT.to)}`;

export {
  DAYS_OFF_PER_SEASON,
  OFFICE_HOURS_LABEL,
  OFFICE_POSITIONS,
  OFFICE_SHIFT,
  OFFICE_WORKDAYS,
  OVERTIME_PER_WEEK,
  PERFORMANCE_GAIN_DECAY_PER_RANK,
  PROMOTION_PERFORMANCE_NEEDED,
  REVIEW_DAYS_OF_SEASON,
  REVIEW_MIN_DAYS_EMPLOYED,
  START_PERFORMANCE,
  WARNINGS_TO_FIRE,
  WARNING_MEMORY_DAYS,
};
