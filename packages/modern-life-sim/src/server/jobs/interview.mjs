// Job interview questions, answer styles, hiring and refusal
import { clockFromMinutes } from "../time/clock.mjs";
import { REAPPLY_WAIT_DAYS, createOfficeJob, nextWorkdayAfter } from "./office-job.mjs";

var INTERVIEW_QUESTIONS = [
  {
    q: "So. Why here, and why now?",
    a: {
      confident: "Because I'll be the best hire you make this year.",
      prepared: "I read up on what you do here. I know where I'd fit.",
      honest: "I need the work, and I'll show up every day.",
    },
  },
  {
    q: "What would the people who know you say you're bad at?",
    a: {
      confident: "Sitting still. Give me something to do and it gets done.",
      prepared: "Saying no. I've been working on it \u2014 I keep a list now.",
      honest: "Mornings. But I set three alarms.",
    },
  },
  {
    q: "Tell me about a time something went wrong.",
    a: {
      confident: "It went wrong, I fixed it, and nobody noticed. That's the job.",
      prepared: "A deadline slipped. I split the work up, and we made the next one.",
      honest: "More times than I'd like. I learned to ask for help sooner.",
    },
  },
  {
    q: "Where do you see yourself in a year?",
    a: {
      confident: "At a desk closer to yours.",
      prepared: "Knowing this place well enough to be trusted with more.",
      honest: "Still here, if you'll have me. Paying my rent on time.",
    },
  },
  {
    q: "Why should I pick you over the others?",
    a: {
      confident: "Because they're not me.",
      prepared: "I've done my homework. I won't need hand-holding for long.",
      honest: "I can't promise I'm the best. I can promise I'll try hardest.",
    },
  },
];
var INTERVIEW_STYLES = [
  {
    id: "confident",
    label: "CONFIDENT",
    skill: "charm",
  },
  {
    id: "prepared",
    label: "PREPARED",
    skill: "knowledge",
  },
  {
    id: "honest",
    label: "HONEST",
    skill: null,
  },
];
function interviewAnswerChance(styleId, levels = {}) {
  let style = INTERVIEW_STYLES.find((candidate) => candidate.id === styleId);
  return style ? (style.skill ? Math.min(0.9, 0.4 + 0.08 * (levels[style.skill] ?? 0)) : 0.5) : 0;
}
function hireForOfficeJob(job, minutes) {
  let day = clockFromMinutes(minutes).dayIndex;
  Object.assign(
    job,
    createOfficeJob({
      at: minutes,
    }),
    {
      startsOn: nextWorkdayAfter(day),
      worked: job.worked ?? [],
      warnings: [],
    },
  );
  return {
    ok: true,
    startsOn: job.startsOn,
  };
}
function refuseJobApplication(job, minutes) {
  job.refusedUntil = clockFromMinutes(minutes).dayIndex + REAPPLY_WAIT_DAYS;
  return {
    ok: true,
    until: job.refusedUntil,
  };
}

export { INTERVIEW_QUESTIONS, INTERVIEW_STYLES, hireForOfficeJob, interviewAnswerChance, refuseJobApplication };
