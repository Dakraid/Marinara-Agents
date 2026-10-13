// Month calendar: per-day events (shifts, rent, plans, parties, birthdays) and player notes
import { WEEKDAY_NAMES, clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { isBirthdayOnDay, knowsBirthdayOf } from "../relationships/birthdays.mjs";
import { itemDef } from "../items/inventory.mjs";
import { OUTING_KINDS } from "../outings/outing-rules.mjs";
import {
  OFFICE_SHIFT,
  OFFICE_WORKDAYS,
  REVIEW_DAYS_OF_SEASON,
  REVIEW_MIN_DAYS_EMPLOYED,
} from "../jobs/office-rules.mjs";

var CALENDAR_DAY_MINUTES = 1440;
var CALENDAR_NOTE_MAX_CHARS = 80;
var CALENDAR_NOTES_MAX = 300;
var CALENDAR_MONTHS_BACK = 1;
var CALENDAR_MONTHS_AHEAD = 2;
var calendarHourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;
function calendarEventsForDay(world, day, { rent = 0 } = {}) {
  let now = clockFromMinutes(world.minutes),
    firstDay = clockFromMinutes(world.startedAt ?? world.minutes).dayIndex,
    events = [],
    notes = (world.notes ?? [])
      .filter((note) => note.day === day)
      .map((note) => ({
        kind: "note",
        hour: note.hour ?? null,
        what: note.text,
        sub: "your note",
        id: note.id,
      }));
  if (day < firstDay) {
    return notes;
  }
  let dayOfSeason = (day % 30) + 1,
    past = day < now.dayIndex,
    job = world.job;
  if (job?.employed && OFFICE_WORKDAYS.includes(day % 7) && (job.startsOn ?? 0) <= day) {
    let dayOff = (job.daysOff ?? []).includes(day),
      worked = (job.worked ?? []).includes(day),
      missed = (job.warnings ?? []).some((warning) => warning.day === day && warning.reason === "Missed a day");
    events.push(
      dayOff
        ? {
            kind: "off",
            hour: null,
            what: "Day off",
            sub: "you asked for it",
          }
        : {
            kind: "shift",
            hour: OFFICE_SHIFT.from,
            what: `Shift \xB7 ${calendarHourLabel(OFFICE_SHIFT.from)}\u2013${calendarHourLabel(OFFICE_SHIFT.to)}`,
            sub: worked ? "worked" : missed ? "missed" : past ? "" : "at the Office",
            state: worked ? "done" : missed ? "missed" : "",
          },
    );
  }
  if (world.wallet && dayOfSeason === world.wallet.rentDay) {
    events.push({
      kind: "rent",
      hour: 0,
      what: `Rent \xB7 $${rent}`,
      sub: past ? "" : "taken from your cash at midnight",
    });
  }
  let startDay = clockFromMinutes(job?.startedAt ?? 0).dayIndex;
  if (job?.employed && REVIEW_DAYS_OF_SEASON.includes(dayOfSeason) && day - startDay >= REVIEW_MIN_DAYS_EMPLOYED) {
    events.push({
      kind: "review",
      hour: OFFICE_SHIFT.to,
      what: "Review",
      sub: "your boss looks at your work at your first shift from this day",
    });
  }
  for (let order of world.things?.orders ?? []) {
    if (Math.floor(order.at / CALENDAR_DAY_MINUTES) !== day) {
      continue;
    }
    let itemName = itemDef(world.things, order.item)?.name ?? order.item;
    events.push({
      kind: "delivery",
      hour: Math.floor((order.at % CALENDAR_DAY_MINUTES) / 60),
      what: `Delivery \xB7 ${itemName}${order.n > 1 ? ` \xD7${order.n}` : ""}`,
      sub: "arrives at your home",
    });
  }
  let planStatusText = {
    kept: "you went",
    missed: "you missed it",
    cancelled: "cancelled",
    dropped: "they cancelled",
    ruined: "it went wrong",
    cut: "cut short",
    on: "now",
  };
  for (let plan of world.plans ?? []) {
    if (Math.floor(plan.at / CALENDAR_DAY_MINUTES) !== day) {
      continue;
    }
    let withNames = [plan.characterId, ...(plan.with ?? [])]
        .map((characterId) => world.characters?.find((person) => person.id === characterId)?.name ?? "?")
        .join(" & "),
      placeName =
        plan.place === "home"
          ? "your place"
          : plan.place === "their"
            ? `${world.characters?.find((person) => person.id === plan.characterId)?.name ?? "?"}'s place`
            : (world.town?.places?.find((place) => place.id === plan.place)?.name ?? plan.place);
    events.push({
      kind: plan.kind,
      hour: Math.floor((plan.at % CALENDAR_DAY_MINUTES) / 60),
      what: `${plan.birthday ? (plan.birthday.of === "you" ? "Your birthday party" : "Birthday party") : (OUTING_KINDS[plan.kind]?.name ?? "Plan")} \xB7 ${withNames} \xB7 ${placeName}`,
      sub:
        planStatusText[plan.status] ?? (plan.by === "them" ? "they invited \xB7 they pay" : "you invited \xB7 you pay"),
      state: ["missed", "cancelled", "dropped", "ruined"].includes(plan.status)
        ? "missed"
        : plan.status === "kept"
          ? "done"
          : "",
    });
  }
  let partyStatusText = {
    on: "now",
    done: "it happened",
    missed: "you missed it",
    off: "nobody came",
    slept: "you slept through it",
  };
  for (let party of world.parties ?? []) {
    if (
      Math.floor(party.at / CALENDAR_DAY_MINUTES) !== day ||
      (party.host !== "you" && party.you !== "yes" && !party.home) ||
      (party.you === "no" && party.status === "off")
    ) {
      continue;
    }
    let hostName =
      party.host === "you" ? "" : (world.characters?.find((person) => person.id === party.host)?.name ?? "?");
    events.push({
      kind: "party",
      hour: Math.floor((party.at % CALENDAR_DAY_MINUTES) / 60),
      what: `${party.birthday ? (party.host === "you" ? "Your birthday party" : "Birthday party") : "Party"} \xB7 ${hostName ? (party.home ? `${hostName}'s, at home` : `${hostName}'s place`) : `your place \xB7 ${party.guests.length} coming`}`,
      sub:
        party.you === "no" && party.status === "set"
          ? "you said no \xB7 join in if you like"
          : (partyStatusText[party.status] ?? (party.host === "you" || party.home ? "at home" : "go to their door")),
      state: ["missed", "slept"].includes(party.status) ? "missed" : party.status === "done" ? "done" : "",
    });
  }
  let nameOf = (characterId) => world.characters?.find((person) => person.id === characterId)?.name ?? "?";
  if (world.wedding?.day === day) {
    events.push({
      kind: "wedding",
      hour: 8,
      what: `Your wedding \xB7 ${nameOf(world.wedding.characterId)}`,
      sub: "it starts on its own, if everything is ready",
    });
  }
  for (let wedding of world.weddings ?? []) {
    if (wedding.day === day) {
      events.push({
        kind: "wedding",
        hour: 8,
        what: `Your wedding \xB7 ${nameOf(wedding.characterId)}`,
        sub: "married",
        state: "done",
      });
    } else if (day > wedding.day && (day - wedding.day) % 120 === 0) {
      events.push({
        kind: "anniversary",
        hour: null,
        what: `Anniversary \xB7 ${nameOf(wedding.characterId)}`,
        sub: "go out together, or give them something",
      });
    }
  }
  if (isBirthdayOnDay(world.birthday, day)) {
    events.push({
      kind: "birthday",
      hour: null,
      what: "Your birthday",
      sub: "whoever knows it says it",
    });
  }
  for (let person of world.characters ?? []) {
    if (
      !person.away &&
      isBirthdayOnDay(person.birthday, day) &&
      world.bonds?.[person.id]?.met !== false &&
      knowsBirthdayOf(world, person.id)
    ) {
      events.push({
        kind: "birthday",
        hour: null,
        what: `${person.name}'s birthday`,
        sub: "a present counts double",
      });
    }
  }
  if (dayOfSeason === 1) {
    events.push({
      kind: "news",
      hour: null,
      what: "New this season",
      sub: "the Supermarket and the Mall",
    });
  }
  return [...events, ...notes].sort((left, right) => (left.hour ?? -1) - (right.hour ?? -1));
}
function calendarMonthView(world, monthOffset = 0, { rent = 0 } = {}) {
  let now = clockFromMinutes(world.minutes),
    firstDay = clockFromMinutes(world.startedAt ?? world.minutes).dayIndex,
    monthStart = now.dayIndex - (now.day - 1),
    monthsBack = Math.max(
      0,
      Math.min(
        CALENDAR_MONTHS_BACK,
        Math.round((monthStart - (firstDay - (clockFromMinutes(firstDay * CALENDAR_DAY_MINUTES).day - 1))) / 30),
      ),
    ),
    offset = Math.max(-monthsBack, Math.min(CALENDAR_MONTHS_AHEAD, Math.trunc(Number(monthOffset) || 0))) || 0,
    firstShown = monthStart + offset * 30,
    shownClock = clockFromMinutes(firstShown * CALENDAR_DAY_MINUTES, {
      from: world.startedAt,
    }),
    days = [];
  for (let i = 0; i < 30; i++) {
    let day = firstShown + i,
      events = calendarEventsForDay(world, day, {
        rent: rent,
      });
    days.push({
      d: day,
      n: i + 1,
      weekday: WEEKDAY_NAMES[day % 7],
      today: day === now.dayIndex,
      past: day < now.dayIndex,
      before: day < firstDay,
      events: events,
    });
  }
  return {
    offset: offset,
    canBack: offset > -monthsBack,
    canAhead: offset < CALENDAR_MONTHS_AHEAD,
    season: shownClock.season,
    year: shownClock.year,
    lead: firstShown % 7,
    today: now.dayIndex,
    now: formatClockTime(world.minutes),
    days: days,
  };
}
function editCalendarNote(world, { action: action, day: day, hour = null, text = "", id: noteId = null } = {}) {
  if (((world.notes ??= []), action === "delete")) {
    let countBefore = world.notes.length;
    world.notes = world.notes.filter((note2) => note2.id !== noteId);
    return countBefore === world.notes.length
      ? {
          ok: false,
          reason: "That note is not there anymore.",
        }
      : {
          ok: true,
        };
  }
  if (action !== "add") {
    return {
      ok: false,
      reason: "That is not something you can do with a note.",
    };
  }
  let cleanText = String(text ?? "")
    // eslint-disable-next-line no-control-regex -- strips control characters
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CALENDAR_NOTE_MAX_CHARS);
  if (!cleanText) {
    return {
      ok: false,
      reason: "Write something first.",
    };
  }
  let dayIndex = Math.trunc(Number(day));
  if (!Number.isFinite(dayIndex) || dayIndex < 0) {
    return {
      ok: false,
      reason: "That day is not on the calendar.",
    };
  }
  let noteHour = hour === null || hour === "" || hour === undefined ? null : Math.trunc(Number(hour));
  if (noteHour !== null && !(noteHour >= 0 && noteHour < 24)) {
    return {
      ok: false,
      reason: "That is not an hour.",
    };
  }
  if (world.notes.length >= CALENDAR_NOTES_MAX) {
    return {
      ok: false,
      reason: `That is ${CALENDAR_NOTES_MAX} notes already. Delete some first.`,
    };
  }
  let note = {
    id: `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    day: dayIndex,
    hour: noteHour,
    text: cleanText,
  };
  world.notes.push(note);
  return {
    ok: true,
    note: note,
  };
}

export { calendarMonthView, editCalendarNote };
