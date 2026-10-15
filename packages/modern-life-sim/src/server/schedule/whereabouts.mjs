// Seeded hash random and where-is-a-character resolution with schedule twists
import { clockFromMinutes } from "../time/clock.mjs";
import { weekSpanAt } from "./week-grid.mjs";

function hashToUnit(...parts) {
  let hash = 2166136261;
  for (let char of parts.join("|")) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  return ((hash >>> 0) % 1e3) / 1e3;
}
var seededRandom = (...parts) => hashToUnit(...parts);
var SCHEDULE_TWIST_CHANCE = 0.12;
var SCHEDULE_TWISTS = [
  {
    id: "running-late",
    label: "running late",
    late: true,
  },
  {
    id: "somewhere-else",
    label: "dropped by, for a change",
    move: true,
  },
  {
    id: "called-in",
    label: "covering a shift",
    work: true,
  },
  {
    id: "under-the-weather",
    label: "at home, not feeling well",
    home: true,
  },
  {
    id: "out-with-friends",
    label: "out with friends",
    move: true,
    social: true,
  },
];
var driftDoingKey = (characterId, dayIndex, fromHour) => `${characterId}|${dayIndex}|${fromHour}`;
function pickUsualDoingAt(character, place, roll) {
  if (place === character.job?.place) {
    return "";
  }
  let doings = [
    ...new Set(
      (character.week ?? [])
        .flat()
        .filter((span) => span?.place === place && span.doing && !span.sleep)
        .map((span) => span.doing),
    ),
  ];
  return doings.length ? doings[Math.floor(roll * doings.length)] : "";
}
var WORK_FROM_HOME_PLACE = "workhome";
var resolveWorkFromHome = (where) =>
  where.place === WORK_FROM_HOME_PLACE
    ? {
        ...where,
        place: "home",
        working: true,
        doing: "works from home",
      }
    : where;
var SOCIAL_PLACES = ["cafe", "bar", "park", "restaurant", "mall", "food-court", "cinema", "arcade", "karaoke"];
var WORKPLACE_ONLY_PLACES = ["office", "hospital", "police"];
function whereaboutsOf(character, minutes, options = {}) {
  let where = computeWhereabouts(character, minutes, options);
  return where.place && options.keepsOut?.(where.place, character.id)
    ? {
        place: options.homePlace ?? character.livesAt ?? "home",
        doing: "",
        twist: null,
        known: true,
      }
    : where;
}
function computeWhereabouts(
  character,
  minutes,
  {
    places = [],
    seed = "",
    homePlace = null,
    appointments: appointmentsById = null,
    openAt = null,
    said = null,
    keepsOut = null,
  } = {},
) {
  let appointment = appointmentsById?.[character.id]?.find((entry) => minutes >= entry.from && minutes < entry.to);
  if (appointment) {
    return {
      place: appointment.place,
      doing: appointment.doing,
      twist: null,
      known: true,
      ...(appointment.host
        ? {
            host: appointment.host,
          }
        : {}),
    };
  }
  let clock = clockFromMinutes(minutes),
    span = weekSpanAt(character.week ?? [], minutes);
  if (!span || !span.place) {
    return {
      place: null,
      doing: "",
      twist: null,
      known: false,
    };
  }
  let spanDay = span.from > clock.hour ? clock.dayIndex - 1 : clock.dayIndex;
  if (hashToUnit(seed, character.id, String(spanDay), String(span.from)) >= SCHEDULE_TWIST_CHANCE) {
    return resolveWorkFromHome({
      place: span.place,
      doing: span.doing,
      twist: null,
      known: true,
      sleep: span.sleep === true,
    });
  }
  if (span.sleep === true) {
    return {
      place: span.place,
      doing: span.doing,
      twist: null,
      known: true,
      sleep: true,
    };
  }
  let twist =
      SCHEDULE_TWISTS[
        Math.floor(hashToUnit(seed, character.id, String(spanDay), String(span.from), "which") * SCHEDULE_TWISTS.length)
      ],
    spanStart = spanDay * 1440 + span.from * 60,
    spanHours = (span.to - span.from + 24) % 24 || 24,
    isOpen = (place) =>
      !openAt ||
      Array.from(
        {
          length: Math.ceil(spanHours),
        },
        (unused, hourOffset) => spanStart + hourOffset * 60,
      ).every((minute) => openAt(place, minute));
  if (twist.home) {
    let home = homePlace ?? character.livesAt ?? "home";
    return home
      ? {
          place: home,
          doing: twist.label,
          twist: twist.id,
          known: true,
        }
      : {
          place: null,
          doing: twist.label,
          twist: twist.id,
          known: true,
        };
  }
  if (twist.work) {
    let workPlace = character.job?.place && !character.job.out ? character.job.place : null;
    return workPlace && workPlace !== span.place && isOpen(workPlace)
      ? {
          place: workPlace,
          doing: twist.label,
          twist: twist.id,
          known: true,
        }
      : resolveWorkFromHome({
          place: span.place,
          doing: span.doing,
          twist: null,
          known: true,
        });
  }
  if (twist.move && places.length) {
    let candidates = places.filter(
        (place2) =>
          place2 !== span.place &&
          !WORKPLACE_ONLY_PLACES.includes(place2) &&
          (!twist.social || SOCIAL_PLACES.includes(place2)) &&
          isOpen(place2) &&
          !keepsOut?.(place2, character.id),
      ),
      place =
        candidates[
          Math.floor(hashToUnit(seed, character.id, String(spanDay), String(span.from), "where") * candidates.length)
        ],
      saidDoing = said?.[driftDoingKey(character.id, spanDay, span.from)],
      doing = place
        ? saidDoing ||
          pickUsualDoingAt(
            character,
            place,
            hashToUnit(seed, character.id, String(spanDay), String(span.from), "doing"),
          ) ||
          (twist.social ? twist.label : "")
        : "";
    return place
      ? {
          place: place,
          doing: doing,
          twist: twist.id,
          known: true,
          drift: true,
        }
      : resolveWorkFromHome({
          place: span.place,
          doing: span.doing,
          twist: null,
          known: true,
        });
  }
  return ((clock.hour - span.from + 24) % 24) * 60 + clock.minute < 60
    ? span.place === WORK_FROM_HOME_PLACE
      ? {
          place: "home",
          doing: "",
          twist: twist.id,
          known: true,
        }
      : {
          place: null,
          doing: twist.label,
          twist: twist.id,
          known: true,
        }
    : resolveWorkFromHome({
        place: span.place,
        doing: span.doing,
        twist: twist.id,
        known: true,
      });
}
function charactersAtPlace(characters, place, minutes, options = {}) {
  return characters
    .map((character) => ({
      character: character,
      at: whereaboutsOf(character, minutes, {
        ...options,
        homePlace: character.livesAt ?? options.homePlace ?? null,
      }),
    }))
    .filter((entry) => entry.at.place === place)
    .map((entry) => ({
      id: entry.character.id,
      name: entry.character.name,
      doing: entry.at.doing,
      twist: entry.at.twist,
    }));
}
var markScheduleSeen = (seen, minutes, span = null) => {
  let clock = clockFromMinutes(minutes),
    key = span ? `${clock.weekdayIndex}:${span.from}` : `${clock.weekdayIndex}:${clock.hour}`;
  seen[key] = true;
  return seen;
};

export {
  WORK_FROM_HOME_PLACE,
  charactersAtPlace,
  driftDoingKey,
  hashToUnit,
  markScheduleSeen,
  seededRandom,
  whereaboutsOf,
};
