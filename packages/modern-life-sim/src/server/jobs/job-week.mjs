// Job choice resolution, applying jobs to weeks and the week-work LLM prompt
import { emptyWeekGrid, hourCellsForSpan, paintWeekGrid } from "../schedule/week-grid.mjs";
import { WORK_FROM_HOME_PLACE } from "../schedule/whereabouts.mjs";
import { gridToSpans, spansToGrid } from "../schedule/week-conversion.mjs";
import { JOBS_BY_PLACE, JOB_AWAY_PLACE, WEEKDAY_INDICES } from "./job-catalog.mjs";
import { JOB_WEEKDAY_LABELS, formatShift, townJobs } from "./town-jobs.mjs";

var JOB_TITLE_MAX = 40;
var cleanJobTitle = (title) =>
  String(title ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, JOB_TITLE_MAX);
var jobChoiceId = (job) => job?.id ?? (job?.out ? "out" : job?.home ? "home" : null);
function resolveJobChoice(choice, town, { free = null } = {}) {
  let id = String(choice?.id ?? choice ?? "").trim();
  if (id === "out") {
    return {
      out: true,
    };
  }
  if (id === "home") {
    return {
      home: true,
      title: cleanJobTitle(choice?.title),
    };
  }
  let job = (free ?? townJobs(town)).find((job2) => job2.id === id);
  return job
    ? {
        id: job.id,
        place: job.place,
        title: job.title,
      }
    : null;
}
var clipOutfitText = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
var isWorkCell = (cell) =>
  !!cell &&
  (cell.place === JOB_AWAY_PLACE ||
    cell.place === WORK_FROM_HOME_PLACE ||
    (!!JOBS_BY_PLACE[cell.place] &&
      (cell.work === true ||
        (JOBS_BY_PLACE[cell.place] ?? []).some(
          (job) => job.title.toLowerCase() === String(cell.doing ?? "").toLowerCase(),
        ))));
function applyJobToWeek(week, job, { home = "home" } = {}) {
  let grid = Array.isArray(week) ? spansToGrid(week) : emptyWeekGrid(),
    replacement = job?.out
      ? {
          place: JOB_AWAY_PLACE,
          doing: "works",
        }
      : job?.home
        ? {
            place: WORK_FROM_HOME_PLACE,
            doing: "",
          }
        : {
            place: home,
            doing: "",
          },
    found = false;
  for (let row of grid) {
    for (let cell of row) {
      if (isWorkCell(cell)) {
        found = true;
        Object.assign(cell, replacement);
        delete cell.work;
        delete cell.sleep;
      }
    }
  }
  if (job?.home && !found) {
    for (let day of WEEKDAY_INDICES) {
      for (let hour = 9; hour < 17; hour++) {
        if (!grid[day][hour]?.sleep) {
          paintWeekGrid(grid, day, hour, hour + 1, WORK_FROM_HOME_PLACE);
        }
      }
    }
  }
  if (job?.days) {
    for (let day of job.days) {
      paintWeekGrid(grid, day, job.from, job.to, job.place, job.title.toLowerCase());
    }
  }
  return gridToSpans(grid, {
    source: "model",
  });
}
function applyWorkCellsToWeek(week, cells = [], { job = null, home = "home", fromHome = false } = {}) {
  if (!cells.length && !job) {
    return week;
  }
  let grid = Array.isArray(week) ? spansToGrid(week) : emptyWeekGrid();
  for (let { d: day, h: hour } of cells) {
    grid[day][hour] = job
      ? {
          place: home,
          doing: "",
        }
      : fromHome
        ? {
            place: WORK_FROM_HOME_PLACE,
            doing: "",
          }
        : {
            place: JOB_AWAY_PLACE,
            doing: "works",
          };
  }
  let spans = gridToSpans(grid, {
    source: "model",
  });
  return job
    ? applyJobToWeek(spans, job, {
        home: home,
      })
    : spans;
}
function likeliestJobForCells(cells = [], jobs = []) {
  let counts = {};
  for (let { place: place } of cells) {
    counts[place] = (counts[place] ?? 0) + 1;
  }
  for (let place of Object.keys(counts).sort((placeA, placeB) => counts[placeB] - counts[placeA])) {
    let job = jobs.find((job2) => job2.place === place);
    if (job) {
      return job;
    }
  }
  return null;
}
function unlabeledWeekBlocks(character) {
  let blocks = [];
  (character?.week ?? []).forEach((daySpans, day) =>
    (daySpans ?? []).forEach((span) => {
      if (!(
        span.sleep ||
        span.place === JOB_AWAY_PLACE ||
        span.place === WORK_FROM_HOME_PLACE ||
        span.place === "home" ||
        isJobSpan(character, span)
      )) {
        blocks.push({
          key: String(blocks.length),
          d: day,
          span: span,
        });
      }
    }),
  );
  return blocks;
}
function buildWeekWorkPrompt(character, blocks, { placeName = (id) => id } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: week-work",
        "In a modern life sim, this is part of a character's week. Say which of these blocks are hours they are WORKING (any job at all: a shift, serving in a store, working somewhere). Being somewhere as a customer, studying, training, shopping or going out is not work.",
        'Answer with JSON only, exactly: {"work":["<key>", \u2026]} \u2014 the keys of the blocks that are work; an empty list when none is.',
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        `THE CHARACTER: ${character.name}
${String(character.description ?? "").slice(0, 800)}`,
        "",
        "THE BLOCKS (key: day, hours, place, what they do there):",
        ...blocks.map(
          (block) =>
            `${block.key}: ${JOB_WEEKDAY_LABELS[block.d]} ${String(block.span.from).padStart(2, "0")}\u2013${String(block.span.to).padStart(2, "0")} \xB7 ${placeName(block.span.place)} \xB7 ${block.span.doing || "\u2014"}`,
        ),
      ].join(`
`),
    },
  ];
}
function workCellsFromAnswer(answer, blocks) {
  let workKeys = new Set((Array.isArray(answer?.work) ? answer.work : []).map((key) => String(key).trim()));
  if (!Array.isArray(answer?.work)) {
    throw new Error("The model did not answer which blocks are work.");
  }
  return blocks
    .filter((block) => workKeys.has(block.key))
    .flatMap((block) =>
      hourCellsForSpan(block.d, block.span.from, block.span.to).map(({ d: day, h: hour }) => ({
        d: day,
        h: hour,
        place: block.span.place,
      })),
    );
}
function describeWorkFromHomeHours(week) {
  let byHours = new Map();
  (week ?? []).forEach((daySpans, day) =>
    (daySpans ?? [])
      .filter((span) => span?.place === WORK_FROM_HOME_PLACE)
      .forEach((span) => {
        let hoursKey = `${span.from}|${span.to}`;
        byHours.set(hoursKey, [...(byHours.get(hoursKey) ?? []), day]);
      }),
  );
  return [...byHours]
    .map(([hoursKey, days]) => {
      let [from, to] = hoursKey.split("|").map(Number);
      return formatShift({
        days: days,
        from: from,
        to: to,
      });
    })
    .join(" \xB7 ");
}
var isJobSpan = (character, span) =>
  !!character?.job?.id &&
  !!span &&
  span.place === character.job.place &&
  String(span.doing ?? "").toLowerCase() === String(character.job.title ?? "").toLowerCase();

export {
  applyJobToWeek,
  applyWorkCellsToWeek,
  buildWeekWorkPrompt,
  cleanJobTitle,
  clipOutfitText,
  describeWorkFromHomeHours,
  isJobSpan,
  jobChoiceId,
  likeliestJobForCells,
  resolveJobChoice,
  unlabeledWeekBlocks,
  workCellsFromAnswer,
};
