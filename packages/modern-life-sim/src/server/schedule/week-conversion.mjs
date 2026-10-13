// Convert between week span lists and hour grids, sleep painting
import { emptyWeekGrid, makeWeekSpan, mergedDaySpans, paintWeekGrid } from "./week-grid.mjs";

var paintSleep = (grid, weekday, fromHour, toHour, place = "home") =>
  paintWeekGrid(grid, weekday, fromHour, toHour, place, "", true);
function spansToGrid(spans) {
  let grid = emptyWeekGrid();
  (spans ?? []).forEach((daySpans, day) => {
    for (let span of daySpans ?? []) {
      paintWeekGrid(grid, day, span.from, span.to, span.place, span.doing, span.sleep === true);
    }
  });
  return grid;
}
function gridToSpans(grid, { source = "user" } = {}) {
  return grid.map((unused, day) =>
    mergedDaySpans(grid, day).map((span) =>
      makeWeekSpan({
        from: span.from,
        to: span.to,
        place: span.place,
        doing: span.doing,
        source: source,
        sleep: span.sleep,
      }),
    ),
  );
}

export { gridToSpans, paintSleep, spansToGrid };
