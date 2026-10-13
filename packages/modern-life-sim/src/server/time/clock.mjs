// Game clock: minutes to calendar/season/weekday, formatting and day math
var WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var SEASON_NAMES = ["Spring", "Summer", "Autumn", "Winter"];
function seasonIndexOf(season) {
  if (Number.isInteger(season) && season >= 0 && season < 4) {
    return season;
  }
  let index = SEASON_NAMES.findIndex(
    (seasonName) =>
      seasonName.toLowerCase() ===
      String(season ?? "")
        .trim()
        .toLowerCase(),
  );
  return index >= 0 ? index : 0;
}
var SEASON_BY_MONTH = [3, 3, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3];
var DAY_SLOTS = [
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
var truncOr = (value, fallback = 0) => (Number.isFinite(value) ? Math.trunc(value) : fallback);
function clockMinutesFromDate({ year = 1, season: season, month: month, day = 1, hour = 0, minute = 0 } = {}) {
  let seasonIndex =
      season !== undefined
        ? seasonIndexOf(season)
        : month !== undefined
          ? SEASON_BY_MONTH[Math.max(1, Math.min(12, truncOr(month, 1))) - 1]
          : 0,
    dayOfSeason = Math.max(1, Math.min(30, truncOr(day, 1)));
  return (
    ((Math.max(1, truncOr(year, 1)) - 1) * 120 + seasonIndex * 30 + (dayOfSeason - 1)) * 1440 +
    truncOr(hour) * 60 +
    truncOr(minute)
  );
}
function clockFromMinutes(totalMinutes, { from = 0 } = {}) {
  let minutes = Math.max(0, truncOr(totalMinutes)),
    dayIndex = Math.floor(minutes / 1440),
    minuteOfDay = minutes - dayIndex * 1440,
    startDay = Math.floor(Math.max(0, truncOr(from)) / 1440 / 30) * 30,
    year = Math.max(1, Math.floor((dayIndex - startDay) / 120) + 1),
    dayOfYear = dayIndex % 120,
    seasonIndex = Math.floor(dayOfYear / 30),
    day = (dayOfYear % 30) + 1,
    hour = Math.floor(minuteOfDay / 60),
    minute = minuteOfDay % 60;
  return {
    minutes: minutes,
    dayIndex: dayIndex,
    year: year,
    seasonIndex: seasonIndex,
    seasonKey: Math.floor(dayIndex / 30),
    day: day,
    hour: hour,
    minute: minute,
    minuteOfDay: minuteOfDay,
    weekday: WEEKDAY_NAMES[dayIndex % 7],
    weekdayIndex: dayIndex % 7,
    isWeekend: dayIndex % 7 >= 5,
    season: SEASON_NAMES[seasonIndex],
    slot: daySlotForHour(hour),
  };
}
function daySlotForHour(hour) {
  let hourOfDay = ((truncOr(hour) % 24) + 24) % 24;
  return (DAY_SLOTS.find((slot) => hourOfDay >= slot.from && hourOfDay < slot.to) ?? DAY_SLOTS[3]).key;
}
var formatHourLabel = (hour) => `${String(((hour % 24) + 24) % 24).padStart(2, "0")}:00`;
function formatClockTime(minutes, { ampm = false } = {}) {
  let { hour: hour, minute: minute } = clockFromMinutes(minutes),
    minuteText = String(minute).padStart(2, "0");
  if (!ampm) {
    return `${String(hour).padStart(2, "0")}:${minuteText}`;
  }
  let suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 === 0 ? 12 : hour % 12}:${minuteText} ${suffix}`;
}
function formatCalendarDate(minutes, { from = 0 } = {}) {
  let clock = clockFromMinutes(minutes, {
    from: from,
  });
  return `${clock.weekday} ${clock.day} ${clock.season} \xB7 Year ${clock.year}`;
}
function formatDateTime(minutes) {
  let clock = clockFromMinutes(minutes);
  return `${clock.weekday} ${clock.day} ${clock.season}, ${formatClockTime(minutes)}`;
}
function formatAgoStamp(then, now) {
  let days = clockFromMinutes(now).dayIndex - clockFromMinutes(then).dayIndex,
    ago = days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  return `${formatDateTime(then)} \xB7 ${ago}`;
}
function formatUntilStamp(then, now) {
  let days = clockFromMinutes(then).dayIndex - clockFromMinutes(now).dayIndex,
    until = days <= 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return `${formatDateTime(then)} \xB7 ${until}`;
}
function daysBetween(from, to) {
  return clockFromMinutes(to).dayIndex - clockFromMinutes(from).dayIndex;
}
function isSameDay(first, second) {
  return clockFromMinutes(first).dayIndex === clockFromMinutes(second).dayIndex;
}

export {
  SEASON_NAMES,
  WEEKDAY_NAMES,
  clockFromMinutes,
  clockMinutesFromDate,
  daysBetween,
  formatAgoStamp,
  formatCalendarDate,
  formatClockTime,
  formatDateTime,
  formatHourLabel,
  formatUntilStamp,
  isSameDay,
};
