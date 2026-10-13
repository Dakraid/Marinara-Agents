// Built-in routine templates and store assignment for generated weeks
import { emptyWeekGrid, paintWeekGrid } from "./week-grid.mjs";
import { WORK_FROM_HOME_PLACE, hashToUnit } from "./whereabouts.mjs";
import { gridToSpans, paintSleep, spansToGrid } from "./week-conversion.mjs";

var ROUTINE_AWAY_PLACE = "away";
var ROUTINE_TEMPLATES = [
  {
    id: "default",
    name: "Out and about",
    why: "Out in the morning, busy in the afternoon, home at night.",
    fill(grid, offset = 0) {
      let mornings = ["gym", "cafe", "library", "park"],
        afternoons = ["office", "cafe", "mall", "market"];
      for (let day = 0; day < 7; day++) {
        let weekend = day >= 5;
        paintWeekGrid(grid, day, 8, 12, mornings[(offset + day) % mornings.length]);
        paintWeekGrid(grid, day, 12, 18, weekend ? "mall" : afternoons[offset % afternoons.length]);
        paintWeekGrid(grid, day, 18, 22, weekend && day === 5 ? "bar" : "home");
        paintSleep(grid, day, 22, 8);
      }
    },
  },
  {
    id: "office",
    name: "Office job",
    why: "Works nine to six on weekdays, errands after work, quiet weekends.",
    fill(grid) {
      for (let day = 0; day < 5; day++) {
        paintWeekGrid(grid, day, 8, 9, "home");
        paintWeekGrid(grid, day, 9, 18, ROUTINE_AWAY_PLACE, "works");
        paintWeekGrid(grid, day, 18, 19, "market");
        paintWeekGrid(grid, day, 19, 23, "home");
        paintSleep(grid, day, 23, day === 4 ? 9 : 8);
      }
      paintWeekGrid(grid, 5, 9, 11, "home");
      paintWeekGrid(grid, 5, 11, 15, "mall");
      paintWeekGrid(grid, 5, 15, 23, "home");
      paintSleep(grid, 5, 23, 9);
      paintWeekGrid(grid, 6, 9, 12, "home");
      paintWeekGrid(grid, 6, 12, 15, "park");
      paintWeekGrid(grid, 6, 15, 23, "home");
      paintSleep(grid, 6, 23, 8);
    },
  },
  {
    id: "student",
    name: "Student",
    why: "Classes in the morning, a part-time job in the afternoon, Friday out.",
    fill(grid) {
      for (let day = 0; day < 5; day++) {
        paintWeekGrid(grid, day, 8, 9, "home");
        paintWeekGrid(grid, day, 9, 14, "university", "classes");
        paintWeekGrid(grid, day, 14, 19, ROUTINE_AWAY_PLACE, "works");
        if (day === 4) {
          paintWeekGrid(grid, day, 19, 21, "home");
          paintWeekGrid(grid, day, 21, 2, "bar");
          paintSleep(grid, 5, 2, 9);
        } else {
          paintWeekGrid(grid, day, 19, 23, "home");
          paintSleep(grid, day, 23, 8);
        }
      }
      paintWeekGrid(grid, 5, 9, 11, "home");
      paintWeekGrid(grid, 5, 11, 16, "park");
      paintWeekGrid(grid, 5, 16, 23, "home");
      paintSleep(grid, 5, 23, 9);
      paintWeekGrid(grid, 6, 9, 15, "home");
      paintWeekGrid(grid, 6, 15, 19, "library", "studies");
      paintWeekGrid(grid, 6, 19, 22, "home");
      paintSleep(grid, 6, 22, 8);
    },
  },
  {
    id: "nights",
    name: "Works nights",
    why: "Works all night, asleep while the town is awake.",
    fill(grid) {
      for (let day = 0; day < 7; day++) {
        paintWeekGrid(grid, day, 6, 7, "home");
        paintSleep(grid, day, 7, 15);
        paintWeekGrid(grid, day, 15, 16, "home");
        paintWeekGrid(grid, day, 16, 18, "gym");
        paintWeekGrid(grid, day, 18, 22, "home");
        if (day === 6) {
          paintSleep(grid, day, 22, 6);
        } else {
          paintWeekGrid(grid, day, 22, 6, ROUTINE_AWAY_PLACE, "works");
        }
      }
    },
  },
  {
    id: "homebody",
    name: "Homebody",
    why: "Almost always home; the shops on Wednesday and Saturday.",
    fill(grid) {
      for (let day = 0; day < 7; day++) {
        paintWeekGrid(grid, day, 7, 23, "home");
        paintSleep(grid, day, 23, 7);
        if (day === 2) {
          paintWeekGrid(grid, day, 17, 19, "market");
        }
        if (day === 5) {
          paintWeekGrid(grid, day, 15, 19, "mall");
        }
      }
    },
  },
];
var ROUTINE_TEMPLATE_IDS = ROUTINE_TEMPLATES.map((template) => template.id);
var routineTemplateById = (id) => ROUTINE_TEMPLATES.find((template) => template.id === id) ?? ROUTINE_TEMPLATES[0];
var isStoreOpenAt = (store, hour) =>
  store.close > store.open ? hour >= store.open && hour < store.close : hour >= store.open || hour < store.close;
function assignStoresToWeek(week, { stores = [], seed = "", who = "" } = {}) {
  if (!stores.length || !Array.isArray(week)) {
    return week;
  }
  let storeIds = new Set(stores.map((store) => store.id)),
    pickStore = (span, day, salt) => {
      let openStores = stores.filter((store) => isStoreOpenAt(store, span.from)),
        daytimeStores = openStores.length ? openStores : stores.filter((store) => isStoreOpenAt(store, 12)),
        pool = daytimeStores.length ? daytimeStores : stores;
      return pool[Math.floor(hashToUnit(seed, who, String(day), String(span.from), salt) * pool.length)];
    },
    copy = week.map((daySpans) =>
      (daySpans ?? []).map((span) => ({
        ...span,
      })),
    ),
    storeVisits = [];
  copy.forEach((daySpans, day) =>
    daySpans.forEach((span) => {
      if (span.place === "mall") {
        let store = pickStore(span, day, "mall");
        span.place = store.id;
        span.doing = store.doing ?? "";
      }
      if (storeIds.has(span.place)) {
        storeVisits.push({
          span: span,
          d: day,
        });
      }
    }),
  );
  if (storeVisits.length >= 3 && new Set(storeVisits.map((visit) => visit.span.place)).size === 1) {
    storeVisits.forEach(({ span: span, d: day }, index) => {
      if (!(index % 2)) {
        return;
      }
      let store = pickStore(span, day, "vary");
      if (store.id !== span.place) {
        span.place = store.id;
        span.doing = store.doing ?? "";
      }
    });
  }
  return copy;
}
var weekVisitsMall = (week) => (week ?? []).some((daySpans) => (daySpans ?? []).some((span) => span.place === "mall"));
function buildRoutineWeek(templateId, offset = 0, { places = [], home = "home", stores = [] } = {}) {
  let grid = emptyWeekGrid();
  routineTemplateById(templateId).fill(grid, offset);
  for (let row of grid) {
    for (let cell of row) {
      if (cell?.place === "home") {
        cell.place = home;
      }
    }
  }
  let spans = assignStoresToWeek(
      gridToSpans(grid, {
        source: "auto",
      }),
      {
        stores: stores,
        seed: templateId,
        who: String(offset),
      },
    ),
    allowed = places.length ? new Set(places) : null,
    allowedGrid = spansToGrid(spans);
  for (let row of allowedGrid) {
    for (let cell of row) {
      if (
        cell &&
        allowed &&
        cell.place !== home &&
        cell.place !== ROUTINE_AWAY_PLACE &&
        cell.place !== WORK_FROM_HOME_PLACE &&
        !allowed.has(cell.place)
      ) {
        cell.place = home;
        cell.doing = "";
        delete cell.sleep;
      }
    }
  }
  return gridToSpans(allowedGrid, {
    source: "auto",
  });
}

export { ROUTINE_TEMPLATES, ROUTINE_TEMPLATE_IDS, assignStoresToWeek, buildRoutineWeek, weekVisitsMall };
