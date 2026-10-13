// Office job: interview, shifts, lunch, overtime, notices, career view
import { clockFromMinutes, formatClockTime, formatHourLabel } from "../time/clock.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { isJobSpan } from "./job-week.mjs";
import { addSkillXp } from "../skills/skill-levels.mjs";
import { SKILL_PERKS } from "../skills/skill-perks.mjs";
import { applyBondAction, bondTier, hasMet } from "../relationships/bonds.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import {
  OFFICE_HOURS_LABEL,
  OFFICE_POSITIONS,
  OFFICE_SHIFT,
  OFFICE_WORKDAYS,
  WARNINGS_TO_FIRE,
} from "./office-rules.mjs";
import {
  INTERVIEW_MINUTES,
  LATES_TO_WARN,
  LATE_FROM_HOUR,
  LUNCH_BREAK,
  LUNCH_GRACE_MINUTES,
  LUNCH_REST_ENERGY,
  LUNCH_SKIP_PERFORMANCE,
  OVERTIME,
  REAPPLY_WAIT_DAYS,
  VENDING_ITEMS,
  activeJobWarnings,
  canApplyForOfficeJob,
  canStartShift,
  canWorkOvertime,
  concludePromotionReview,
  daysOffAllowance,
  isOfficeWorkday,
  nextOfficePosition,
  nextReviewDay,
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
} from "./office-job.mjs";
import {
  INTERVIEW_QUESTIONS,
  INTERVIEW_STYLES,
  hireForOfficeJob,
  interviewAnswerChance,
  refuseJobApplication,
} from "./interview.mjs";
import {
  WORK_MOMENTS,
  WORK_MOMENT_WINDOWS,
  bestWorkMomentOption,
  resolveWorkMoment,
  rollWorkMoments,
  workMomentOptions,
  workMomentSkillXp,
  workMomentWinChance,
} from "./work-moments.mjs";
import { earnMoney } from "../money/wallet.mjs";
import { drainNeeds } from "../needs/needs.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { wearingItem } from "../home/furniture-and-wardrobe.mjs";
import { DAY_MINUTES } from "../bonds/own-moments.mjs";
import { travelFor } from "../travel/vehicles-rides.mjs";
import {
  activitiesHere,
  advanceTime,
  bondOf,
  characterOf,
  closingWhy,
  collapseIfSpent,
  hasFaintedEvent,
  hasMet2,
  logNote,
  sceneBusyReason,
  skillLevelsOf,
  whereOpts,
} from "../game.mjs";

var castBoss = (state) => state.characters.find((character) => character.job?.id === "boss" && !character.away) ?? null;
function officeCastAt(state, at = Math.floor(state.minutes / DAY_MINUTES) * DAY_MINUTES + 660) {
  let here = state.characters.filter(
      (character) =>
        !character.away &&
        character.job?.place === "office" &&
        hasMet2(state, character.id) &&
        isJobSpan(character, whereaboutsOf(character, Math.max(at, state.minutes), whereOpts(state))),
    ),
    boss = castBoss(state);
  return {
    boss: boss && here.includes(boss) ? boss.id : null,
    coworkers: here.filter((character) => character !== boss).map((character) => character.id),
    anyone: here.map((character) => character.id),
  };
}
var nameOrSomeone = (state, characterId) => characterOf(state, characterId)?.name ?? "someone";
var playerNameOrDefault = (state) => state.persona?.name || "the player";
function firedFact(state) {
  let witnesses2 = state.characters
    .filter((character) => !character.away && character.job?.place === "office")
    .map((character) => character.id);
  recordTownFact(state, "fired", {
    place: "office",
    witnesses: witnesses2,
  });
}
var WORK_MOMENT_TEXT = {
  urgent: "A request lands marked URGENT in three places. It needs to be right, and it needs to be now.",
  help: "A coworker from the next desk wheels over, a spreadsheet open and a look of quiet panic.",
  stay: "The manager stops at your desk. \xABCan you stay a few hours tonight? We're behind.\xBB",
  blame: "A report went out with the wrong numbers, and somehow your name is on it. You know whose it really was.",
  coffee: "Someone holds up two coffees and nods toward the break room.",
  client: "A client on the phone, loud enough for the whole row to hear. They want someone to blame.",
};
function workMomentPrompt(state, moment) {
  let name = nameOrSomeone(state, moment.with),
    playerName = playerNameOrDefault(state);
  return (
    {
      help: `At work at the Office, ${name}, a coworker, is stuck and asks ${playerName} for help. The line is what ${name} says as they ask.`,
      stay: `At the Office, ${name}, the boss, asks ${playerName} to stay three hours late tonight because they are behind. The line is how ${name} asks.`,
      blame: `At the Office a report went out wrong. It was ${name}'s mistake, but ${playerName} is getting the blame. The line is what ${name} says to ${playerName}, quietly, right then.`,
      coffee: `At the Office, ${name} offers ${playerName} a coffee in the break room. The line is what ${name} says.`,
    }[moment.id] ?? ""
  );
}
function setJobTalk(state, key, characterId, text) {
  state.jobTalk = {
    ...(state.jobTalk ?? {}),
    [key]: {
      characterId: characterId,
      text: text,
      at: state.minutes,
    },
  };
}
var BOSS_LINES = {
  hired: (position) => `\xABNine sharp, ${position}. Don't make me regret it.\xBB`,
  refused: () => "\xABNot this time. Come back in a few days.\xBB",
  promoted: (position) => `\xABYou've earned it. ${position}, starting now.\xBB`,
  "not-yet": () => "\xABNot yet. Work on it, and we'll talk again.\xBB",
  missed: () => "\xABWhere were you yesterday? Don't let it happen again.\xBB",
  lates: () => "\xABThat's the third time you've come in late. Consider this a warning.\xBB",
  fired: () => "\xABI can't keep covering for you. Clear your desk.\xBB",
};
function interviewView(state) {
  let dayIndex = clockFromMinutes(state.minutes).dayIndex,
    question =
      INTERVIEW_QUESTIONS[
        Math.floor(seededRandom(state.seed, "interview", String(dayIndex), "q") * INTERVIEW_QUESTIONS.length)
      ],
    levels = skillLevelsOf(state),
    boss = castBoss(state),
    apply = activitiesHere(state).find((activity) => activity.id === "apply");
  return {
    question: question.q,
    answers: INTERVIEW_STYLES.map((style) => ({
      tone: style.id,
      label: style.label,
      said: question.a[style.id],
      chance: Math.round(interviewAnswerChance(style.id, levels) * 100),
      why: style.skill
        ? `${style.skill[0].toUpperCase()}${style.skill.slice(1)} ${levels[style.skill] ?? 0}`
        : "the same for anyone",
    })),
    boss: boss
      ? {
          id: boss.id,
          name: hasMet2(state, boss.id) ? boss.name : "???",
          met: hasMet2(state, boss.id),
        }
      : null,
    time: formatClockTime(state.minutes),
    available: !!apply?.available,
    why: apply?.why ?? "Apply at the Office.",
    canApply: canApplyForOfficeJob(state.job, state.minutes),
  };
}
function applyJob(state, tone, { inScene = false } = {}) {
  if (!inScene && sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  let apply = activitiesHere(state).find((activity) => activity.id === "apply");
  if (!apply) {
    return {
      ok: false,
      reason: "Apply at the Office.",
    };
  }
  if (!apply.available && !(inScene && canApplyForOfficeJob(state.job, state.minutes).ok)) {
    return {
      ok: false,
      reason: apply.why,
    };
  }
  if (!INTERVIEW_STYLES.find((style) => style.id === tone)) {
    return {
      ok: false,
      reason: "Pick an answer.",
    };
  }
  let view = interviewView(state),
    said = view.answers.find((answer) => answer.tone === tone).said,
    chance = interviewAnswerChance(tone, skillLevelsOf(state)),
    hired = seededRandom(state.seed, "interview", String(state.minutes), tone) < chance,
    { events: events } = inScene
      ? {
          events: [],
        }
      : advanceTime(state, INTERVIEW_MINUTES);
  if (hasFaintedEvent(events)) {
    return {
      ok: true,
      fainted: true,
      hired: false,
      startsOn: null,
      until: null,
      chance: Math.round(chance * 100),
      boss: null,
      met: false,
      line: null,
      writing: false,
      minutes: INTERVIEW_MINUTES,
      events: events,
    };
  }
  let boss = castBoss(state),
    firstMeet = false;
  if (boss) {
    let bond = bondOf(state, boss.id);
    firstMeet = !!bond && !hasMet(bond);
    if (bond) {
      bond.met = true;
      applyBondAction(
        bond,
        {
          action: "time",
          friendship: hired ? 3 : 1,
        },
        {
          at: state.minutes,
          today: false,
        },
      );
    }
  }
  if (hired) {
    hireForOfficeJob(state.job, state.minutes);
  } else {
    refuseJobApplication(state.job, state.minutes);
    state.badDayAt = state.minutes;
  }
  if (hired) {
    recordTownFact(state, "hired", {
      with: boss?.id ?? null,
      place: "office",
      witnesses: state.characters
        .filter((character) => !character.away && character.job?.place === "office")
        .map((character) => character.id),
    });
  }
  let startsOn = hired ? shortDayLabel(state.job.startsOn) : null,
    until = hired ? null : shortDayLabel(state.job.refusedUntil);
  logNote(
    state,
    hired ? `Hired at the Office: Intern from ${startsOn}` : "An interview at the Office: not this time",
    "job",
  );
  if (boss && !inScene) {
    setJobTalk(
      state,
      "interview",
      boss.id,
      `${playerNameOrDefault(state)} just had a job interview at the Office with ${boss.name}, the boss${firstMeet ? " (it is the first time they meet)" : ""}. ${boss.name} asked \xAB${view.question}\xBB and ${playerNameOrDefault(state)} answered \xAB${said}\xBB. ${hired ? `${boss.name} decided to hire ${playerNameOrDefault(state)} as an intern, starting on ${startsOn}.` : `${boss.name} decided not to hire ${playerNameOrDefault(state)} this time; they can try again in ${REAPPLY_WAIT_DAYS} days.`} The line is what ${boss.name} says to close the interview.`,
    );
  }
  return {
    ok: true,
    hired: hired,
    startsOn: startsOn,
    until: until,
    chance: Math.round(chance * 100),
    boss: boss
      ? {
          id: boss.id,
          name: boss.name,
        }
      : null,
    met: firstMeet,
    line: boss ? null : hired ? BOSS_LINES.hired(startsOn) : BOSS_LINES.refused(),
    writing: !!boss,
    minutes: INTERVIEW_MINUTES,
    events: events,
    position: OFFICE_POSITIONS[0].name,
    pay: OFFICE_POSITIONS[0].pay,
    shift: OFFICE_HOURS_LABEL,
    from: formatHourLabel(OFFICE_SHIFT.from),
  };
}
var lunchNow = (state) =>
  state.shiftNow?.stage === "lunch" &&
  state.shiftNow.lunch &&
  state.at === "office" &&
  state.minutes < state.shiftNow.lunch.to
    ? state.shiftNow.lunch
    : null;
var lunchPassed = (shift, minutes) => shift?.stage === "lunch" && !!shift.lunch && minutes >= shift.lunch.to;
function lunchToday(minutes) {
  let dayStart = Math.floor(minutes / DAY_MINUTES) * DAY_MINUTES,
    from = dayStart + LUNCH_BREAK.from * 60;
  return minutes < from
    ? {
        from: from,
        to: dayStart + LUNCH_BREAK.to * 60,
      }
    : null;
}
var isMorningMoment = (moment) => moment.at < LUNCH_BREAK.from * 60;
function startShift(state) {
  let dayIndex = clockFromMinutes(state.minutes).dayIndex;
  if (state.shiftNow?.day === dayIndex) {
    return {
      ok: true,
      shift: shiftView(state),
    };
  }
  let check = canStartShift(state.job, state.minutes);
  if (!check.ok) {
    return check;
  }
  let rolls = Array.from(
      {
        length: 6,
      },
      (unused, index) => seededRandom(state.seed, "shift", String(dayIndex), `m${index}`),
    ),
    moments = rollWorkMoments(rolls, {
      cast: officeCastAt(state),
      overtime: overtimeLeftThisWeek(state.job, state.minutes) > 0,
    }),
    lunch = lunchToday(state.minutes);
  return !moments.length && !lunch
    ? finishShift(state)
    : ((state.shiftNow = {
        day: dayIndex,
        at: state.minutes,
        late: !!check.late,
        moments: moments.map((moment) => ({
          ...moment,
          line: moment.with ? null : WORK_MOMENT_TEXT[moment.id],
          ...(moment.with
            ? {}
            : {
                fixed: true,
              }),
        })),
        lunch: lunch,
        stage: lunch ? "morning" : "afternoon",
        choices: {},
      }),
      lunch && !moments.some(isMorningMoment)
        ? startLunch(state)
        : {
            ok: true,
            shift: shiftView(state),
          });
}
var momentResult = (state, shift, index, choices) =>
  resolveWorkMoment(shift.moments[index].id, choices[index] ?? choices[String(index)], {
    levels: skillLevelsOf(state),
    roll: seededRandom(state.seed, "shift", String(shift.day), `r${index}`),
  });
function momentEvent(state, moment, result, bondTotals) {
  let withName = moment.with ? nameOrSomeone(state, moment.with) : "";
  if (moment.with && result.friendship) {
    let bond = bondOf(state, moment.with);
    if (bond) {
      let result2 = applyBondAction(
        bond,
        {
          action: "time",
          friendship: result.friendship,
        },
        {
          at: state.minutes,
          today: false,
        },
      );
      if (result2.applied?.friendship) {
        bondTotals[`friendship \xB7 ${withName}`] =
          (bondTotals[`friendship \xB7 ${withName}`] ?? 0) + result2.applied.friendship;
      }
    }
  }
  let performanceText = result.performance
      ? `${result.performance > 0 ? "+" : "\u2212"}${Math.abs(result.performance)} performance`
      : "",
    friendshipText =
      moment.with && result.friendship
        ? `${result.friendship > 0 ? "+" : "\u2212"}${Math.abs(result.friendship)} with ${withName}`
        : "";
  return {
    id: "work-moment",
    text: `${WORK_MOMENTS[moment.id].title[0]}${WORK_MOMENTS[moment.id].title.slice(1).toLowerCase()}: ${result.label.toLowerCase()}${result.won === true ? " \u2014 it worked" : result.won === false ? " \u2014 it did not work" : ""}.${performanceText || friendshipText ? ` ${[performanceText, friendshipText].filter(Boolean).join(", ")}.` : ""}`,
  };
}
function startLunch(state, { choices = {} } = {}) {
  let shift = state.shiftNow;
  if (!shift?.lunch || shift.stage !== "morning") {
    return {
      ok: false,
      reason: "It is not lunchtime.",
    };
  }
  if (state.at !== "office") {
    return {
      ok: false,
      reason: "That shift is over.",
    };
  }
  shift.choices = {
    ...(shift.choices ?? {}),
    ...choices,
  };
  let bondTotals = {},
    told = [];
  shift.moments.forEach((moment, index) => {
    if (isMorningMoment(moment)) {
      let result = momentResult(state, shift, index, shift.choices);
      told.push({
        i: index,
        o: result,
        e: momentEvent(state, moment, result, bondTotals),
      });
    }
  });
  shift.told = Object.fromEntries(told.map((entry) => [entry.i, entry.o]));
  let from = state.minutes,
    waitMinutes = Math.max(0, shift.lunch.from - state.minutes),
    { events: events } = waitMinutes
      ? advanceTime(state, waitMinutes)
      : {
          events: [],
        },
    events2 = [...told.map((entry) => entry.e), ...events];
  return state.shiftNow !== shift
    ? {
        ok: true,
        from: from,
        minutes: waitMinutes,
        events: events2,
        shift: null,
      }
    : state.minutes >= shift.lunch.to
      ? ((shift.stage = "afternoon"),
        {
          ok: true,
          from: from,
          minutes: waitMinutes,
          events: events2,
          bond: bondTotals,
          over: true,
          shift: shiftView(state),
        })
      : ((shift.stage = "lunch"),
        logNote(state, "Lunch break at the Office", "job"),
        {
          ok: true,
          from: from,
          minutes: waitMinutes,
          events: events2,
          bond: bondTotals,
          shift: shiftView(state),
        });
}
function lunchActivities(state) {
  let lunch = lunchNow(state);
  if (!lunch) {
    return [];
  }
  let left = Math.max(0, lunch.to - state.minutes),
    endsAt = formatClockTime(lunch.to),
    backBy = lunch.from + LUNCH_GRACE_MINUTES;
  return [
    ...VENDING_ITEMS.map((item) => ({
      ...item,
      available: state.wallet.cash >= item.costs && item.minutes <= left,
      why:
        state.wallet.cash < item.costs
          ? `You cannot afford it: $${item.costs}.`
          : item.minutes > left
            ? `Your break ends at ${endsAt}.`
            : "",
    })),
    {
      id: "lunch-bag",
      name: "Eat from your backpack",
      opens: "bag",
      minutes: 0,
      available: true,
      why: "",
    },
    {
      id: "lunch-rest",
      name: "Take the break",
      minutes: left,
      restEnergy: LUNCH_REST_ENERGY,
      available: left > 0,
      why: "",
    },
    {
      id: "lunch-back",
      name: "Back to work",
      opens: "back",
      lunchBack: true,
      minutes: 0,
      gives: {
        performance: LUNCH_SKIP_PERFORMANCE,
      },
      available: state.minutes <= backBy,
      why: `After ${formatClockTime(backBy)} you take the whole hour`,
    },
  ];
}
function lunchBack(state) {
  let lunch = lunchNow(state);
  if (!lunch) {
    return {
      ok: false,
      reason: "You are not on your lunch break.",
    };
  }
  if (state.minutes > lunch.from + LUNCH_GRACE_MINUTES) {
    return {
      ok: false,
      reason: `You take the whole hour now: back at your desk at ${formatClockTime(lunch.to)}.`,
    };
  }
  let shift = state.shiftNow;
  shift.stage = "afternoon";
  shift.skipped = true;
  logNote(state, "Skipped the lunch break", "job");
  let from = state.minutes,
    { events: events } = advanceTime(state, Math.max(0, lunch.to - state.minutes));
  return {
    ok: true,
    events: events,
    backToWork: {
      from: from,
      minutes: state.minutes - from,
      skipped: true,
    },
  };
}
function lunchOver(state) {
  let lunch = state.shiftNow?.stage === "lunch" && state.at === "office" ? state.shiftNow.lunch : null;
  return !lunch || state.minutes < lunch.to
    ? null
    : ((state.shiftNow.stage = "afternoon"),
      {
        id: "lunch-over",
        text: "",
        backToWork: {
          from: lunch.from,
          minutes: state.minutes - lunch.from,
          skipped: false,
        },
      });
}
function lunchWhy(state, extraMinutes = 0) {
  let lunch = lunchNow(state);
  return lunch && state.minutes + extraMinutes > lunch.to
    ? `Your lunch break ends at ${formatClockTime(lunch.to)}.`
    : "";
}
var overtimeEnergy = (levels) => Math.round(OVERTIME.energy * SKILL_PERKS.overtimeEase(levels.fitness ?? 0));
function shiftView(state) {
  let shift = state.shiftNow;
  if (!shift) {
    return null;
  }
  let stage = lunchPassed(shift, state.minutes) ? "afternoon" : (shift.stage ?? "afternoon"),
    showsMoment = (moment) =>
      !shift.lunch ||
      (stage === "morning" ? isMorningMoment(moment) : stage === "afternoon" ? !isMorningMoment(moment) : false),
    levels = skillLevelsOf(state),
    startAt = shift.at ?? state.minutes,
    [windowFrom, windowTo] = [WORK_MOMENT_WINDOWS[0][0], WORK_MOMENT_WINDOWS[1][1]],
    clockAt = (moment) =>
      startAt + 20 + Math.round(((moment.at - windowFrom) / (windowTo - windowFrom)) * (OFFICE_SHIFT.minutes - 40));
  return {
    from: formatClockTime(startAt),
    moments: shift.moments
      .map((moment, index) => {
        let definition = WORK_MOMENTS[moment.id],
          coworker = moment.with ? characterOf(state, moment.with) : null,
          chipsFor = (option) => {
            let fixedResult = option.roll ? null : option,
              chips = [];
            if (option.roll) {
              chips.push({
                text: `${option.roll[0].toUpperCase()}${option.roll.slice(1)} \xB7 ${Math.round(workMomentWinChance(option.roll, levels, option) * 100)}%`,
                good: true,
              });
            }
            if (option.roll && option.win.performance) {
              chips.push({
                text: `${option.win.performance > 0 ? "+" : "\u2212"}${Math.abs(option.win.performance)} / ${option.lose.performance > 0 ? "+" : "\u2212"}${Math.abs(option.lose.performance)} Performance`,
                good: true,
              });
            }
            if (fixedResult?.performance) {
              chips.push({
                text: `${fixedResult.performance > 0 ? "+" : "\u2212"}${Math.abs(fixedResult.performance)} Performance`,
                good: fixedResult.performance > 0,
              });
            }
            let friendship = fixedResult?.friendship ?? option.win?.friendship ?? 0;
            if (friendship && coworker) {
              chips.push({
                text: `${friendship > 0 ? "+" : "\u2212"}${Math.abs(friendship)} Friendship \xB7 ${coworker.name}`,
                good: friendship > 0,
              });
            }
            if (option.overtime) {
              chips.push({
                text: `3 h more \xB7 +$${overtimePay(state.job)} \xB7 \u2212${overtimeEnergy(levels)} Energy`,
                good: true,
              });
            }
            return chips;
          };
        return {
          index: index,
          id: moment.id,
          title: definition.title,
          at: formatClockTime(clockAt(moment)),
          with: coworker
            ? {
                id: coworker.id,
                name: coworker.name,
                role: coworker.id === castBoss(state)?.id ? "YOUR BOSS" : "COWORKER",
              }
            : null,
          line: moment.line,
          writing: !!coworker && moment.line === null,
          ...(moment.fixed && moment.line
            ? {
                fixed: true,
              }
            : {}),
          options: workMomentOptions(moment.id, levels).map((option) => ({
            id: option.id,
            label: option.label,
            chips: chipsFor(option),
            ...(option.charm
              ? {
                  level: `CHARM ${option.charm}`,
                }
              : {}),
            ...(bestWorkMomentOption(moment.id, levels) === option.id
              ? {
                  best: "KNOWLEDGE 3",
                }
              : {}),
          })),
        };
      })
      .filter((view) => showsMoment(shift.moments[view.index])),
    stage: stage,
    lunch: shift.lunch
      ? {
          until: formatClockTime(shift.lunch.to),
          left: Math.max(0, shift.lunch.to - state.minutes),
          backUntil: formatClockTime(shift.lunch.from + LUNCH_GRACE_MINUTES),
          canBack: stage === "lunch" && state.minutes <= shift.lunch.from + LUNCH_GRACE_MINUTES,
        }
      : null,
  };
}
function shiftMomentTalk(state, index) {
  let moment = state.shiftNow?.moments?.[index];
  return !moment?.with || moment.line !== null
    ? null
    : {
        characterId: moment.with,
        text: workMomentPrompt(state, moment),
      };
}
function setMomentLine(state, index, line) {
  let moment = state.shiftNow?.moments?.[index];
  if (moment) {
    moment.line =
      line ||
      (moment.with
        ? `${nameOrSomeone(state, moment.with)}: ${WORK_MOMENT_TEXT[moment.id]}`
        : WORK_MOMENT_TEXT[moment.id]);
    if (line) {
      delete moment.fixed;
    } else {
      moment.fixed = true;
    }
  }
}
function finishShift(state, { choices = {} } = {}) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  let shift = state.shiftNow,
    dayIndex = clockFromMinutes(state.minutes).dayIndex;
  if (shift && (shift.day !== dayIndex || state.at !== "office")) {
    state.shiftNow = null;
    return {
      ok: false,
      reason: "That shift is over.",
    };
  }
  if (shift?.lunch && shift.stage !== "afternoon" && !lunchPassed(shift, state.minutes)) {
    return {
      ok: false,
      reason:
        shift.stage === "lunch"
          ? `Your lunch break ends at ${formatClockTime(shift.lunch.to)}.`
          : "The morning is not over yet.",
    };
  }
  let allChoices = {
      ...(shift?.choices ?? {}),
      ...choices,
    },
    results = (shift?.moments ?? []).map((moment, index) => ({
      m: moment,
      i: index,
      o: shift.told?.[index] ?? momentResult(state, shift, index, allChoices),
    }));
  state.shiftNow = null;
  let worked = workShift(state, {
    moments: [...results.map((entry) => entry.o.performance), ...(shift?.skipped ? [LUNCH_SKIP_PERFORMANCE] : [])],
    at: shift?.at,
    until: shift ? shift.at + OFFICE_SHIFT.minutes : null,
    xp: workMomentSkillXp(results.map((entry) => entry.o)),
  });
  if (!worked.ok) {
    return worked;
  }
  let events = worked.events,
    bondTotals = {};
  for (let { m: moment, i: index, o: result } of results) {
    if (!shift.told?.[index]) {
      events.push(momentEvent(state, moment, result, bondTotals));
    }
  }
  let minutes = worked.minutes;
  if (results.some((entry) => entry.o.overtime)) {
    let overtime = overtimeView(state),
      overtimeResult = overtime.ok ? doOvertime(state) : overtime;
    if (overtimeResult.ok) {
      minutes += overtimeResult.minutes;
      events.push(...overtimeResult.events);
    } else {
      events.push({
        id: "overtime-no",
        text: `You said you would stay, but ${overtimeResult.why?.toLowerCase() ?? "you could not"}`,
      });
    }
  }
  let review = null;
  if (worked.review) {
    let was = officePositionById(state.job.position),
      concluded = concludePromotionReview(state.job, state.minutes, {
        accepted: worked.review.qualifies,
      });
    if (concluded.promoted) {
      recordTownFact(state, "promoted", {
        place: "office",
        witnesses: state.characters
          .filter((character) => !character.away && character.job?.place === "office")
          .map((character) => character.id),
      });
    }
    let next = nextOfficePosition(state.job.position);
    review = {
      promoted: concluded.promoted,
      position: officePositionById(state.job.position).name,
      pay: officePayOf(state.job),
      was: {
        name: was.name,
        pay: was.pay,
      },
      missing: worked.review.missing ?? [],
      next: next
        ? {
            name: next.name,
            needs: needsText(next.needs),
          }
        : null,
      day: shortDayLabel(
        nextReviewDay(state.job, clockFromMinutes(state.minutes).dayIndex)?.day ??
          clockFromMinutes(state.minutes).dayIndex,
      ),
    };
    let boss = castBoss(state);
    if (boss && hasMet2(state, boss.id)) {
      setJobTalk(
        state,
        "review",
        boss.id,
        `${playerNameOrDefault(state)} had a review at the Office with ${boss.name}, the boss. ${concluded.promoted ? `${playerNameOrDefault(state)} is promoted from ${was.name} to ${review.position}.` : `${playerNameOrDefault(state)} is not promoted yet; what is missing: ${review.missing.join(", ")}.`} The line is what ${boss.name} tells ${playerNameOrDefault(state)}.`,
      );
    } else {
      review.line = concluded.promoted ? BOSS_LINES.promoted(review.position) : BOSS_LINES["not-yet"]();
    }
    review.boss =
      boss && hasMet2(state, boss.id)
        ? {
            id: boss.id,
            name: boss.name,
          }
        : null;
    review.writing = !!review.boss;
  }
  let speakerId = shiftSpeaker(state, results),
    speaker = null;
  if (speakerId) {
    let character = characterOf(state, speakerId);
    speaker = {
      id: character.id,
      name: character.name,
      role: character.id === castBoss(state)?.id ? "YOUR BOSS" : "COWORKER",
    };
    let summary = [
      worked.late ? `${playerNameOrDefault(state)} came in late` : `${playerNameOrDefault(state)} was on time`,
      worked.delta >= 2 ? "it was a good day" : worked.delta < 0 ? "it was a bad day" : "it was an ordinary day",
      ...results.map(
        (entry) =>
          `${WORK_MOMENTS[entry.m.id].title.toLowerCase()}: ${playerNameOrDefault(state)} chose \xAB${entry.o.label.toLowerCase()}\xBB${entry.m.with ? ` (with ${nameOrSomeone(state, entry.m.with)})` : ""}`,
      ),
    ].join("; ");
    setJobTalk(
      state,
      "comment",
      character.id,
      `${playerNameOrDefault(state)} just finished a shift at the Office as ${officePositionById(state.job.position).name.toLowerCase()} (${summary}). ${character.name} is ${speaker.role === "YOUR BOSS" ? `${playerNameOrDefault(state)}'s boss` : `${playerNameOrDefault(state)}'s coworker`}. The line is what ${character.name} says to ${playerNameOrDefault(state)} as the shift ends.`,
    );
  }
  return {
    ...worked,
    minutes: minutes,
    events: events,
    bond: bondTotals,
    speaker: speaker,
    review: review,
    overtime: overtimeView(state),
  };
}
function shiftSpeaker(state, results) {
  let present = (character) =>
      !!character &&
      !character.away &&
      hasMet2(state, character.id) &&
      isJobSpan(character, whereaboutsOf(character, state.minutes - 1, whereOpts(state))),
    boss = castBoss(state);
  if (present(boss)) {
    return boss.id;
  }
  let speakerId = results.map((id) => id.m.with).find((id) => id && present(characterOf(state, id)));
  return (
    speakerId ||
    (state.characters.find((character) => character.job?.place === "office" && present(character))?.id ?? null)
  );
}
var needsText = (needs) =>
  Object.entries(needs)
    .map(
      ([key, amount]) =>
        `${key === "performance" ? "performance" : `${key[0].toUpperCase()}${key.slice(1)}`} ${amount}`,
    )
    .join(" \xB7 ");
function overtimeView(state) {
  let check = canWorkOvertime(state.job, state.minutes),
    closing = closingWhy(state, OVERTIME.minutes),
    energy = overtimeEnergy(skillLevelsOf(state)),
    tired = state.needs.energy < energy + 15 ? "You are too tired to stay late." : "";
  return {
    ok: check.ok && !closing && !tired,
    why: check.reason || closing || tired,
    pay: overtimePay(state.job),
    minutes: OVERTIME.minutes,
    energy: energy,
    left: overtimeLeftThisWeek(state.job, state.minutes),
  };
}
function doOvertime(state) {
  let result = workOvertime(state.job, state.minutes);
  if (!result.ok) {
    return result;
  }
  let levels = skillLevelsOf(state),
    { events: events } = advanceTime(state, result.minutes);
  state.needs = drainNeeds(state.needs, 0, {
    extraEnergy: overtimeEnergy(levels),
    extraHunger: OVERTIME.hunger,
    fitness: levels.fitness,
  });
  events.push(...collapseIfSpent(state));
  earnMoney(state.wallet, result.pay, "Overtime", state.minutes, {
    wage: true,
  });
  logNote(state, `Stayed late: $${result.pay}`, "job");
  return {
    ...result,
    events: events,
  };
}
function stayLate(state) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (state.at !== "office") {
    return {
      ok: false,
      reason: "You are not at the Office.",
    };
  }
  let view = overtimeView(state);
  if (!view.ok) {
    return {
      ok: false,
      reason: view.why,
    };
  }
  let result = doOvertime(state);
  return result.ok
    ? {
        ok: true,
        pay: result.pay,
        minutes: result.minutes,
        performance: result.performance,
        events: result.events,
        needs: state.needs,
        cash: state.wallet.cash,
      }
    : result;
}
function bossFriendTier(state) {
  let boss = castBoss(state);
  return boss && hasMet2(state, boss.id) ? Math.max(0, bondTier(bondOf(state, boss.id), "friendship")) : 0;
}
function askDayOff(state, dayInput, { fromScene = false } = {}) {
  if (!state.job.employed) {
    return {
      ok: false,
      reason: "You have no job.",
    };
  }
  if (!fromScene && sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  let day = Number(dayInput);
  if (!Number.isInteger(day) || !OFFICE_WORKDAYS.includes(day % 7) || !officeJobStarted(state.job, day)) {
    return {
      ok: false,
      reason: "That is not a workday.",
    };
  }
  let boss = castBoss(state),
    friendTier = bossFriendTier(state),
    result = requestDayOff(state.job, state.minutes, day, {
      bossFriendshipTier: friendTier,
    });
  if (result.ok) {
    logNote(state, `Day off on ${shortDayLabel(day)}`, "job");
  }
  return result.ok
    ? {
        ...result,
        label: shortDayLabel(day),
      }
    : result;
}
function quitJob(state, { fromScene = false } = {}) {
  return state.job.employed
    ? !fromScene && sceneBusyReason(state)
      ? {
          ok: false,
          reason: sceneBusyReason(state),
        }
      : (quitOfficeJob(state.job),
        (state.shiftNow = null),
        logNote(state, "Quit the Office", "job"),
        {
          ok: true,
        })
    : {
        ok: false,
        reason: "You have no job.",
      };
}
function dutyOf(state) {
  if (!state.job.employed) {
    return null;
  }
  let clock = clockFromMinutes(state.minutes);
  if (
    !isOfficeWorkday(state.minutes, state.job) ||
    state.job.lastShiftDay === clock.dayIndex ||
    clock.hour < OFFICE_SHIFT.from - 1 ||
    clock.hour >= OFFICE_SHIFT.to - 1
  ) {
    return null;
  }
  let late = clock.hour >= LATE_FROM_HOUR;
  return {
    late: late,
    from: formatHourLabel(OFFICE_SHIFT.from),
    until: late ? formatHourLabel(OFFICE_SHIFT.to - 2).replace(":00", ":59") : formatHourLabel(LATE_FROM_HOUR),
    lates: (state.job.lates ?? []).length,
    latesMax: LATES_TO_WARN,
    here: state.at === "office",
    minutes: state.at === "office" ? 0 : travelFor(state, state.at, "office"),
  };
}
function noticeOf(state) {
  let notice = state.job?.notice;
  if (!notice) {
    return null;
  }
  let boss = castBoss(state),
    met = boss && hasMet2(state, boss.id),
    warnings = activeJobWarnings(state.job, state.minutes).length;
  return {
    kind: notice.kind,
    warnings: warnings,
    warningsMax: WARNINGS_TO_FIRE,
    until: notice.until !== undefined && notice.until !== null ? shortDayLabel(notice.until) : null,
    boss: met
      ? {
          id: boss.id,
          name: boss.name,
        }
      : null,
    line: met ? null : BOSS_LINES[notice.kind](),
    writing: !!met,
  };
}
function seenNotice(state) {
  if (state.job) {
    state.job.notice = null;
  }
  return {
    ok: true,
  };
}
function jobTalkFor(state, key) {
  if (key === "notice") {
    let notice = state.job?.notice,
      boss = castBoss(state);
    if (!notice || !boss || !hasMet2(state, boss.id)) {
      return null;
    }
    let what = {
      missed: `${playerNameOrDefault(state)} missed a whole day at the Office. It is a warning (${activeJobWarnings(state.job, state.minutes).length} of ${WARNINGS_TO_FIRE}).`,
      lates: `${playerNameOrDefault(state)} came in late for the third time. It is a warning (${activeJobWarnings(state.job, state.minutes).length} of ${WARNINGS_TO_FIRE}).`,
      fired: `${playerNameOrDefault(state)} got the third warning and is fired from the Office.`,
    }[notice.kind];
    return {
      characterId: boss.id,
      text: `${what} ${boss.name} is the boss. The line is what ${boss.name} tells ${playerNameOrDefault(state)}.`,
    };
  }
  let talk = state.jobTalk?.[key];
  return talk
    ? {
        characterId: talk.characterId,
        text: talk.text,
      }
    : null;
}
function doneJobTalk(state, key) {
  if (state.jobTalk) {
    delete state.jobTalk[key];
  }
}
function jobsApp(state) {
  let clock = clockFromMinutes(state.minutes),
    levels = skillLevelsOf(state),
    job = state.job,
    boss = castBoss(state),
    bossView = boss
      ? {
          id: boss.id,
          name: hasMet2(state, boss.id) ? boss.name : "???",
          met: hasMet2(state, boss.id),
        }
      : null,
    office = townPlace(state.town, "office"),
    ladder = OFFICE_POSITIONS.map((position) => ({
      name: position.name,
      pay: position.pay,
      needs: needsText(position.needs),
      now: job.employed && position.id === job.position,
    })),
    canApply = canApplyForOfficeJob(job, state.minutes),
    posting = office
      ? {
          title: OFFICE_POSITIONS[0].name,
          place: office.name,
          pay: OFFICE_POSITIONS[0].pay,
          shift: OFFICE_HOURS_LABEL,
          onTimeUntil: formatHourLabel(LATE_FROM_HOUR),
          hours: `${formatHourLabel(office.open)}\u2013${formatHourLabel(office.close)}`,
          minutes: state.at === "office" ? 0 : travelFor(state, state.at, "office"),
          ladder: ladder,
          boss: bossView,
          look: {
            charm: levels.charm ?? 0,
            knowledge: levels.knowledge ?? 0,
          },
          apply: {
            ok: canApply.ok,
            why: canApply.reason,
          },
          yours: !!job.employed,
        }
      : null,
    mine = null;
  if (job.employed) {
    let position = officePositionById(job.position),
      next = nextOfficePosition(job.position),
      weekStart = clock.dayIndex - clock.weekdayIndex,
      week = OFFICE_WORKDAYS.map((weekday) => {
        let day = weekStart + weekday,
          dayState = officeJobStarted(job, day)
            ? (job.daysOff ?? []).includes(day)
              ? "off"
              : (job.worked ?? []).includes(day)
                ? (job.lates ?? []).includes(day) ||
                  (job.warnings ?? []).some((warning) => warning.day === day && warning.reason === "Late three times")
                  ? "late"
                  : "done"
                : (job.warnings ?? []).some((warning) => warning.day === day && warning.reason === "Missed a day")
                  ? "missed"
                  : day === clock.dayIndex
                    ? "today"
                    : ""
            : "";
        return {
          day: shortDayLabel(day).slice(0, 3),
          state: dayState,
        };
      }),
      review = nextReviewDay(job, clock.dayIndex),
      checks = next
        ? Object.entries(next.needs).map(([skill, needed]) => {
            let have = skill === "performance" ? Math.round(job.performance) : (levels[skill] ?? 0);
            return {
              text: `${skill === "performance" ? "Performance" : `${skill[0].toUpperCase()}${skill.slice(1)}`} ${have} of ${needed}`,
              ok: have >= needed,
            };
          })
        : [],
      friendTier = bossFriendTier(state),
      allowance = daysOffAllowance(job, clock.dayIndex, {
        bossFriendshipTier: friendTier,
      }),
      options = [];
    for (let day = clock.dayIndex + 1; options.length < 5 && day < clock.dayIndex + 15; day++) {
      if (OFFICE_WORKDAYS.includes(day % 7) && officeJobStarted(job, day) && !(job.daysOff ?? []).includes(day)) {
        options.push({
          day: day,
          label: shortDayLabel(day),
        });
      }
    }
    mine = {
      position: position.name,
      pay: officePayOf(job),
      shift: OFFICE_HOURS_LABEL,
      onTimeUntil: formatHourLabel(LATE_FROM_HOUR),
      since: shortDayLabel(job.startsOn ?? clockFromMinutes(job.startedAt ?? 0).dayIndex),
      startsOn: officeJobStarted(job, clock.dayIndex) ? null : shortDayLabel(job.startsOn),
      shifts: job.shiftsWorked ?? 0,
      performance: Math.round(job.performance),
      mark: next?.needs?.performance ?? null,
      warnings: activeJobWarnings(job, state.minutes).length,
      warningsMax: WARNINGS_TO_FIRE,
      lates: (job.lates ?? []).length,
      latesMax: LATES_TO_WARN,
      daysOffLeft: allowance.left,
      week: week,
      review:
        next && review
          ? {
              day: review.pending ? "YOUR NEXT SHIFT" : shortDayLabel(review.day),
              inDays: review.pending ? 0 : review.day - clock.dayIndex,
              pending: review.pending,
              next: {
                name: next.name,
                pay: next.pay,
              },
              checks: checks,
            }
          : null,
      ladder: ladder,
      boss: bossView,
      dayOff: {
        left: allowance.left,
        options: options,
      },
      overtimeLeft: overtimeLeftThisWeek(job, state.minutes),
    };
  }
  return {
    town: state.townName || "",
    employed: !!job.employed,
    posting: posting,
    mine: mine,
  };
}
function careerView(state) {
  return {
    employed: !!state.job?.employed,
    duty: dutyOf(state),
    notice: noticeOf(state),
    shift: shiftView(state),
  };
}
function bossLean(state) {
  let boss = castBoss(state),
    bond = boss && hasMet2(state, boss.id) ? bondOf(state, boss.id) : null;
  return bond
    ? bondTier(bond, "friendship") >= 2
      ? 1
      : clockFromMinutes(state.minutes).dayIndex - clockFromMinutes(state.job?.startedAt ?? state.minutes).dayIndex >=
            14 &&
          bond.friendship < 10 &&
          bond.trust < 10
        ? -1
        : 0
    : 0;
}
function workShift(
  state,
  { moments = [], wearingSuit = !!wearingItem(state)?.formal, at = null, until = null, xp = {} } = {},
) {
  let levels = skillLevelsOf(state),
    result = workOfficeShift(state.job, {
      minutes: at ?? state.minutes,
      skills: state.skills,
      needs: state.needs,
      wearingSuit: wearingSuit,
      moments: moments,
    });
  if (!result.ok) {
    return result;
  }
  let { events: events } = advanceTime(
    state,
    until !== null ? Math.max(0, until - state.minutes) : OFFICE_SHIFT.minutes,
  );
  state.needs = drainNeeds(state.needs, 0, {
    extraEnergy: OFFICE_SHIFT.energy,
    extraHunger: OFFICE_SHIFT.hunger,
    fitness: levels.fitness,
  });
  events.push(...collapseIfSpent(state));
  earnMoney(state.wallet, result.pay, `${officePositionById(state.job.position).name} shift`, state.minutes, {
    wage: true,
  });
  for (let [skill, amount] of Object.entries(xp)) {
    result.xp[skill] = (result.xp[skill] ?? 0) + amount;
  }
  let levelled = addSkillXp(state.skills, result.xp);
  logNote(state, `Worked a shift: $${result.pay}, performance ${result.performance}`, "job");
  if (result.fired) {
    firedFact(state);
    state.shiftNow = null;
  }
  let review = promotionReview(state.job, state.minutes, state.skills, {
    boss: bossLean(state),
  });
  return {
    ok: true,
    ...result,
    from: at ?? state.minutes - OFFICE_SHIFT.minutes,
    minutes: OFFICE_SHIFT.minutes,
    gains: result.xp,
    levelled: levelled,
    review: review,
    events: events,
    needs: state.needs,
    cash: state.wallet.cash,
  };
}
var JOB_ASK_ACT = {
  "day-off": "A DAY OFF",
  quit: "QUIT",
  apply: "ASK FOR THE JOB",
};
function sceneJobView(state) {
  let jobAsk = state.scene?.jobAsk;
  if (!jobAsk || state.scene.done) {
    return null;
  }
  let boss = castBoss(state),
    app = jobsApp(state);
  return {
    ask: jobAsk.ask,
    act: JOB_ASK_ACT[jobAsk.ask],
    boss: boss
      ? {
          id: boss.id,
          name: boss.name,
        }
      : null,
    ...(jobAsk.ask === "day-off"
      ? {
          dayOff: app.mine?.dayOff ?? null,
        }
      : {}),
    ...(jobAsk.ask === "quit"
      ? {
          position: app.mine?.position ?? "",
        }
      : {}),
    ...(jobAsk.ask === "apply"
      ? {
          interview: interviewView(state),
        }
      : {}),
  };
}
function sceneJob(state, { choice = "", day = null, tone = null } = {}) {
  let scene = state.scene,
    jobAsk = scene?.jobAsk;
  if (!jobAsk || scene.done) {
    return {
      ok: false,
      reason: "There is nothing to decide.",
    };
  }
  if (choice === "undo") {
    scene.jobAsk = null;
    scene.undone = (scene.undone ?? 0) + 1;
    return {
      ok: true,
      undone: true,
    };
  }
  let name = nameOrSomeone(state, scene.characterId),
    playerName = playerNameOrDefault(state),
    result,
    line;
  if (jobAsk.ask === "day-off") {
    if (
      ((result = askDayOff(state, day, {
        fromScene: true,
      })),
      !result.ok)
    ) {
      return result;
    }
    line = `${name} gives ${playerName} ${result.label} off.`;
  } else if (jobAsk.ask === "quit") {
    if (
      ((result = quitJob(state, {
        fromScene: true,
      })),
      !result.ok)
    ) {
      return result;
    }
    line = `${playerName} quits the Office, and ${name} takes it in.`;
  } else if (jobAsk.ask === "apply") {
    if (
      ((result = applyJob(state, tone, {
        inScene: true,
      })),
      !result.ok)
    ) {
      return result;
    }
    line = result.hired
      ? `${name} asks a question or two and decides to hire ${playerName} as an intern, starting on ${result.startsOn}.`
      : `${name} asks a question or two and decides not to hire ${playerName} this time.`;
  }
  scene.jobAsk = null;
  scene.log.push({
    who: "narration",
    text: line,
    exchange: scene.exchange,
    fixed: true,
  });
  return {
    ok: true,
    ask: jobAsk.ask,
    out: {
      ...result,
      line: null,
      writing: false,
    },
  };
}

export {
  applyJob,
  askDayOff,
  bossLean,
  careerView,
  castBoss,
  doneJobTalk,
  dutyOf,
  finishShift,
  firedFact,
  interviewView,
  jobTalkFor,
  jobsApp,
  lunchActivities,
  lunchBack,
  lunchNow,
  lunchOver,
  lunchWhy,
  noticeOf,
  quitJob,
  sceneJob,
  sceneJobView,
  seenNotice,
  setMomentLine,
  shiftMomentTalk,
  shiftView,
  startLunch,
  startShift,
  stayLate,
};
