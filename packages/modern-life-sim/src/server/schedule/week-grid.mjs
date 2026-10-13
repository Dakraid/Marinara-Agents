// 7x24 week grid painting, span merging and span lookup by time
import { clockFromMinutes } from "../time/clock.mjs";

var clampHour = (value) => Math.max(0, Math.min(24, Math.round(Number(value) || 0)));
var wrapWeekday = (day) => ((Math.trunc(day) % 7) + 7) % 7;
var emptyWeekGrid = () =>
  Array.from(
    {
      length: 7,
    },
    () =>
      Array.from(
        {
          length: 24,
        },
        () => null,
      ),
  );
function hourCellsForSpan(weekday, fromHour, toHour) {
  let startHour = clampHour(fromHour) % 24,
    hours = (((clampHour(toHour) - startHour) % 24) + 24) % 24 || 24;
  return Array.from(
    {
      length: hours,
    },
    (unused, offset) => ({
      d: (wrapWeekday(weekday) + Math.floor((startHour + offset) / 24)) % 7,
      h: (startHour + offset) % 24,
    }),
  );
}
function paintWeekGrid(grid, weekday, fromHour, toHour, place, doing = "", sleep = false) {
  for (let { d: day, h: hour } of hourCellsForSpan(weekday, fromHour, toHour)) {
    grid[day][hour] = {
      place: String(place ?? ""),
      doing: String(doing ?? ""),
      ...(sleep === true
        ? {
            sleep: true,
          }
        : {}),
    };
  }
  return grid;
}
function daySpansFromGrid(grid, day) {
  let spans = [],
    current = null;
  for (let hour = 0; hour < 24; hour++) {
    let cell = grid[day][hour],
      key = cell ? `${cell.place}|${cell.doing}|${cell.sleep ? 1 : 0}` : null;
    if (current && key === current.key) {
      current.to = hour + 1;
      continue;
    }
    if (current) {
      spans.push(current);
    }
    current = key
      ? {
          key: key,
          from: hour,
          to: hour + 1,
          place: cell.place,
          doing: cell.doing,
          sleep: !!cell.sleep,
        }
      : null;
  }
  if (current) {
    spans.push(current);
  }
  return spans;
}
function spanContinuesFromPreviousDay(grid, day) {
  let previous = daySpansFromGrid(grid, (day + 6) % 7).at(-1),
    first = daySpansFromGrid(grid, day)[0];
  return !!(
    previous &&
    first &&
    previous.to === 24 &&
    previous.from !== 0 &&
    first.from === 0 &&
    first.to !== 24 &&
    first.key === previous.key
  );
}
function mergedDaySpans(grid, day) {
  let spans = daySpansFromGrid(grid, day);
  if (spanContinuesFromPreviousDay(grid, day)) {
    spans.shift();
  }
  let last = spans.at(-1);
  if (last && last.to === 24 && last.from !== 0) {
    let next = daySpansFromGrid(grid, (day + 1) % 7)[0];
    if (next && next.from === 0 && next.to !== 24 && next.key === last.key) {
      last.to = next.to;
      last.wraps = true;
    }
  }
  return spans;
}
var LEGACY_WEEK_SLOTS = [
  {
    key: "morning",
    label: "Morning",
    from: 6,
    to: 12,
  },
  {
    key: "afternoon",
    label: "Afternoon",
    from: 12,
    to: 18,
  },
  {
    key: "evening",
    label: "Evening",
    from: 18,
    to: 24,
  },
  {
    key: "night",
    label: "Night",
    from: 0,
    to: 6,
  },
];
function makeWeekSpan({ from = 0, to = 24, place = "", doing = "", source = "user", sleep = false } = {}) {
  return {
    from: clampHour(from),
    to: clampHour(to),
    place: String(place || ""),
    doing: String(doing || ""),
    source: source,
    ...(sleep === true
      ? {
          sleep: true,
        }
      : {}),
  };
}
function spanCoversHour(span, hour) {
  let hourOfDay = clampHour(hour) % 24;
  return span.from === span.to
    ? true
    : span.from < span.to
      ? hourOfDay >= span.from && hourOfDay < span.to
      : hourOfDay >= span.from || hourOfDay < span.to;
}
function weekSpanAt(week, minutes) {
  let clock = clockFromMinutes(minutes),
    spans = week[clock.weekdayIndex] ?? [],
    span = spans.find((item) => item.from <= item.to && spanCoversHour(item, clock.hour));
  if (span) {
    return span;
  }
  let overnight = spans.find((item) => item.from > item.to && clock.hour >= item.from);
  return (
    overnight ||
    ((week[(clock.weekdayIndex + 6) % 7] ?? []).find((item) => item.from > item.to && clock.hour < item.to) ?? null)
  );
}

export { LEGACY_WEEK_SLOTS, emptyWeekGrid, hourCellsForSpan, makeWeekSpan, mergedDaySpans, paintWeekGrid, weekSpanAt };
