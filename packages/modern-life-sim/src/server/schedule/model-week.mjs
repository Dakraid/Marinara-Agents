// Parse LLM-written weeks, default sleep and legacy slot-week migration
import { LEGACY_WEEK_SLOTS, emptyWeekGrid, hourCellsForSpan, makeWeekSpan, paintWeekGrid } from "./week-grid.mjs";
import { gridToSpans, spansToGrid } from "./week-conversion.mjs";

var WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
function parseModelSpan(raw, places) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let place = String(raw.place ?? "").trim();
  if (!places.has(place)) {
    return null;
  }
  let from = Number(raw.from),
    to = Number(raw.to);
  return !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from > 23 || to < 0 || to > 24
    ? null
    : {
        from: from,
        to: to,
        place: place,
        doing: String(raw.doing ?? "")
          .trim()
          .slice(0, 40),
        sleep: raw.sleep === true,
        work: raw.work === true,
      };
}
function workCellsFromModelWeek(answer, { places = [] } = {}) {
  let placeSet = new Set(places.length ? places : ["home"]),
    cells = [],
    addWorkCells = (day, span) => {
      if (span?.work) {
        for (let { d: cellDay, h: hour } of hourCellsForSpan(day, span.from, span.to)) {
          cells.push({
            d: cellDay,
            h: hour,
            place: span.place,
          });
        }
      }
    },
    parseSpans = (list) =>
      Array.isArray(list)
        ? list
            .slice(0, 12)
            .map((item) => parseModelSpan(item, placeSet))
            .filter(Boolean)
        : [];
  for (let span of parseSpans(answer?.weekday)) {
    for (let day = 0; day < 5; day++) {
      addWorkCells(day, span);
    }
  }
  for (let span of parseSpans(answer?.saturday)) {
    addWorkCells(5, span);
  }
  for (let span of parseSpans(answer?.sunday)) {
    addWorkCells(6, span);
  }
  for (let extra of Array.isArray(answer?.extras) ? answer.extras.slice(0, 14) : []) {
    let day = WEEKDAY_KEYS.indexOf(
      String(extra?.day ?? "")
        .slice(0, 3)
        .toLowerCase(),
    );
    if (day >= 0) {
      addWorkCells(day, parseModelSpan(extra, placeSet));
    }
  }
  return cells;
}
function weekFromModelAnswer(answer, { places = [] } = {}) {
  let placeSet = new Set(places.length ? places : ["home"]),
    parseSpans = (list) =>
      Array.isArray(list)
        ? list
            .slice(0, 12)
            .map((item) => parseModelSpan(item, placeSet))
            .filter(Boolean)
        : [],
    weekdaySpans = parseSpans(answer?.weekday),
    saturdaySpans = parseSpans(answer?.saturday),
    sundaySpans = parseSpans(answer?.sunday);
  if (!weekdaySpans.length && !saturdaySpans.length && !sundaySpans.length) {
    throw new Error("The model did not write a week.");
  }
  let grid = emptyWeekGrid(),
    paint = (day, span) => paintWeekGrid(grid, day, span.from, span.to, span.place, span.doing, span.sleep);
  for (let day = 0; day < 5; day++) {
    for (let span of weekdaySpans) {
      paint(day, span);
    }
  }
  for (let span of saturdaySpans) {
    paint(5, span);
  }
  for (let span of sundaySpans) {
    paint(6, span);
  }
  for (let extra of Array.isArray(answer?.extras) ? answer.extras.slice(0, 14) : []) {
    let day = WEEKDAY_KEYS.indexOf(
        String(extra?.day ?? "")
          .slice(0, 3)
          .toLowerCase(),
      ),
      span = parseModelSpan(extra, placeSet);
    if (day >= 0 && span) {
      paint(day, span);
    }
  }
  let week = gridToSpans(grid, {
    source: "model",
  });
  return weekHasSleep(week) ? week : addDefaultSleep(week);
}
function weekFromHourGrid(rows, { places = [] } = {}) {
  if (!Array.isArray(rows) || rows.length !== 7) {
    return null;
  }
  let placeSet = new Set(places.length ? places : ["home"]),
    grid = emptyWeekGrid();
  rows.forEach((row, day) => {
    if (Array.isArray(row)) {
      row.slice(0, 24).forEach((cell, hour) => {
        let place = String(cell?.place ?? "").trim();
        if (placeSet.has(place)) {
          grid[day][hour] = {
            place: place,
            doing: String(cell?.doing ?? "")
              .trim()
              .slice(0, 40),
            ...(cell?.sleep === true
              ? {
                  sleep: true,
                }
              : {}),
          };
        }
      });
    }
  });
  return gridToSpans(grid);
}
function weekFromDaySpanLists(lists, { places = [] } = {}) {
  if (!Array.isArray(lists) || lists.length !== 7) {
    return null;
  }
  let placeSet = new Set(places.length ? places : ["home"]),
    grid = emptyWeekGrid();
  lists.forEach((list, day) => {
    for (let item of (Array.isArray(list) ? list : []).slice(0, 24)) {
      let span = parseModelSpan(item, placeSet);
      if (span) {
        paintWeekGrid(grid, day, span.from, span.to, span.place, span.doing, span.sleep);
      }
    }
  });
  return gridToSpans(grid);
}
var weekHasSleep = (week) => (week ?? []).some((daySpans) => (daySpans ?? []).some((span) => span.sleep === true));
function addDefaultSleep(week) {
  let grid = spansToGrid(week),
    cellAt = (hourIndex) => grid[((Math.floor(hourIndex / 24) % 7) + 7) % 7][((hourIndex % 24) + 24) % 24],
    isHomeAt = (hourIndex) => cellAt(hourIndex)?.place === "home";
  for (let day = 0; day < 7; day++) {
    let anchor = day * 24 + 3;
    if (!isHomeAt(anchor) || cellAt(anchor).sleep) {
      continue;
    }
    let start = anchor;
    for (; start > anchor - 4 && isHomeAt(start - 1);) {
      start--;
    }
    let end = anchor + 1;
    for (; end < anchor + 8 && isHomeAt(end);) {
      end++;
    }
    if (end === anchor + 8 && isHomeAt(end)) {
      end = anchor + 5;
    }
    for (let hourIndex = start; hourIndex < end; hourIndex++) {
      cellAt(hourIndex).sleep = true;
    }
  }
  return gridToSpans(grid, {
    source: (week ?? []).flat()[0]?.source ?? "auto",
  });
}
var isLegacySlotWeek = (week) =>
  Array.isArray(week) && week.length === 7 && week.every((day) => day && !Array.isArray(day) && typeof day == "object");
function migrateLegacySlotWeek(week) {
  return isLegacySlotWeek(week)
    ? week.map((day) => {
        let spans = [];
        for (let slot of LEGACY_WEEK_SLOTS) {
          let entry = day[slot.key];
          if (entry?.place) {
            spans.push(
              makeWeekSpan({
                from: slot.from,
                to: slot.to,
                place: entry.place,
                doing: entry.doing,
                source: entry.source ?? "auto",
              }),
            );
          }
        }
        return spans.sort((left, right) => left.from - right.from);
      })
    : week;
}

export {
  addDefaultSleep,
  isLegacySlotWeek,
  migrateLegacySlotWeek,
  weekFromDaySpanLists,
  weekFromHourGrid,
  weekFromModelAnswer,
  weekHasSleep,
  workCellsFromModelWeek,
};
