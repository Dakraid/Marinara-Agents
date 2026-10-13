// Random work moments during a shift: options, rolls, outcomes and skill xp
import { SKILL_PERKS } from "../skills/skill-perks.mjs";

var WORK_MOMENT_ROLL_BELOW = 0.3;
var WORK_MOMENTS = {
  urgent: {
    title: "AN URGENT REQUEST",
    who: null,
    options: [
      {
        id: "right",
        label: "DO IT RIGHT",
        roll: "knowledge",
        win: {
          performance: 3,
        },
        lose: {
          performance: -2,
        },
      },
      {
        id: "rush",
        label: "GET IT OFF YOUR PLATE",
        performance: -1,
      },
    ],
  },
  help: {
    title: "A COWORKER ASKS FOR HELP",
    who: "coworker",
    options: [
      {
        id: "help",
        label: "HELP",
        performance: -2,
        friendship: 3,
      },
      {
        id: "no",
        label: "KEEP AT YOURS",
        performance: 1,
        friendship: -1,
      },
      {
        id: "trick",
        label: "SHOW THEM THE TRICK",
        charm: 6,
        friendship: 3,
      },
    ],
  },
  stay: {
    title: "THE BOSS WANTS YOU TO STAY",
    who: "boss",
    options: [
      {
        id: "stay",
        label: "STAY",
        overtime: true,
        friendship: 1,
      },
      {
        id: "no",
        label: "SAY NO",
        performance: -1,
      },
      {
        id: "nicely",
        label: "SAY NO, NICELY",
        charm: 6,
      },
    ],
  },
  blame: {
    title: "YOU GET THE BLAME",
    who: "coworker",
    options: [
      {
        id: "take",
        label: "TAKE IT",
        performance: -2,
        friendship: 2,
      },
      {
        id: "point",
        label: "SAY WHO DID IT",
        performance: 1,
        friendship: -3,
      },
      {
        id: "later",
        label: "TALK IT OUT LATER",
        roll: "charm",
        sureFrom: 6,
        win: {
          performance: 1,
          friendship: 1,
        },
        lose: {
          performance: -1,
        },
      },
    ],
  },
  coffee: {
    title: "COFFEE WITH SOMEONE",
    who: "cast",
    options: [
      {
        id: "coffee",
        label: "HAVE A COFFEE",
        friendship: 2,
      },
      {
        id: "no",
        label: "BACK TO WORK",
        performance: 1,
      },
      {
        id: "word",
        label: "A COFFEE, AND A WORD FOR YOU",
        charm: 6,
        friendship: 2,
        performance: 1,
      },
    ],
  },
  client: {
    title: "A CLIENT COMPLAINS",
    who: null,
    options: [
      {
        id: "calm",
        label: "CALM THEM DOWN",
        roll: "charm",
        win: {
          performance: 3,
        },
        lose: {
          performance: -2,
        },
      },
      {
        id: "pass",
        label: "PASS IT ON",
        performance: -1,
      },
    ],
  },
};
var workMomentWinChance = (skill, levels = {}, option = null) =>
  option?.sureFrom && (levels[skill] ?? 0) >= option.sureFrom ? 1 : Math.min(0.9, 0.35 + 0.1 * (levels[skill] ?? 0));
var workMomentOptions = (momentId, levels = {}) =>
  (WORK_MOMENTS[momentId]?.options ?? []).filter(
    (option) => !option.charm || SKILL_PERKS.moreAtWork(levels.charm ?? 0),
  );
var workMomentExpectedPerformance = (option, levels) =>
  option.roll
    ? workMomentWinChance(option.roll, levels, option) * (option.win.performance ?? 0) +
      (1 - workMomentWinChance(option.roll, levels, option)) * (option.lose.performance ?? 0)
    : (option.performance ?? 0);
function bestWorkMomentOption(momentId, levels = {}) {
  return SKILL_PERKS.seesBestOption(levels.knowledge ?? 0)
    ? (workMomentOptions(momentId, levels).reduce(
        (best, option) =>
          !best || workMomentExpectedPerformance(option, levels) > workMomentExpectedPerformance(best, levels)
            ? option
            : best,
        null,
      )?.id ?? null)
    : null;
}
var WORK_MOMENT_WINDOWS = [
  [605, 710],
  [760, 870],
];
function rollWorkMoments(rolls, { cast = {}, overtime = true } = {}) {
  let moments = [];
  for (let i2 = 0; i2 < 2; i2++) {
    if ((rolls[i2 * 3] ?? 1) >= WORK_MOMENT_ROLL_BELOW) {
      continue;
    }
    let candidates = Object.entries(WORK_MOMENTS).filter(
      ([id, moment2]) =>
        !moments.some((picked) => picked.id === id) &&
        (moment2.who !== "cast" || (cast.anyone ?? []).length) &&
        (id !== "stay" || overtime),
    );
    if (!candidates.length) {
      continue;
    }
    let [momentId, moment] = candidates[Math.floor((rolls[i2 * 3 + 1] ?? 0) * candidates.length)],
      people =
        moment.who === "coworker"
          ? (cast.coworkers ?? [])
          : moment.who === "cast"
            ? (cast.anyone ?? [])
            : moment.who === "boss" && cast.boss
              ? [cast.boss]
              : [],
      withWho = people.length ? people[Math.floor((rolls[i2 * 3 + 2] ?? 0) * people.length)] : null,
      [windowFrom, windowTo] = WORK_MOMENT_WINDOWS[i2];
    moments.push({
      id: momentId,
      with: withWho,
      at: windowFrom + Math.floor((rolls[i2 * 3 + 2] ?? 0) * (windowTo - windowFrom)),
    });
  }
  return moments;
}
function resolveWorkMoment(momentId, optionId, { levels = {}, roll = 0 } = {}) {
  let moment = WORK_MOMENTS[momentId],
    options = workMomentOptions(momentId, levels),
    option = options.find((candidate) => candidate.id === optionId) ?? options.at(-1);
  if (!option) {
    return null;
  }
  let won = option.roll ? roll < workMomentWinChance(option.roll, levels, option) : null,
    outcome = option.roll ? (won ? option.win : option.lose) : option;
  return {
    option: option.id,
    label: option.label,
    won: won,
    skill: won ? option.roll : null,
    performance: Math.max(-4, Math.min(4, outcome.performance ?? 0)),
    friendship: outcome.friendship ?? 0,
    overtime: !!option.overtime,
  };
}
var WORK_MOMENT_SKILL_XP = 8;
function workMomentSkillXp(moments = []) {
  let xp = {};
  for (let moment of moments) {
    if (moment?.skill && moment.skill !== "luck") {
      xp[moment.skill] = (xp[moment.skill] ?? 0) + WORK_MOMENT_SKILL_XP;
    }
  }
  return xp;
}

export {
  WORK_MOMENTS,
  WORK_MOMENT_WINDOWS,
  bestWorkMomentOption,
  resolveWorkMoment,
  rollWorkMoments,
  workMomentOptions,
  workMomentSkillXp,
  workMomentWinChance,
};
