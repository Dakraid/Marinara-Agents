// Birthday normalization, rolling, formatting and countdown helpers
import { SEASON_NAMES, clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { MILESTONE_COUPLE_STATUSES } from "./milestones.mjs";

var BIRTHDAY_SOURCES = ["card", "rolled", "you"];
function normalizeBirthday(raw, source = null) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let season =
      typeof raw.season == "string"
        ? SEASON_NAMES.findIndex((seasonName) => seasonName.toLowerCase() === raw.season.trim().toLowerCase())
        : Math.round(Number(raw.season)),
    day = Math.round(Number(raw.day));
  if (!Number.isInteger(season) || season < 0 || season > 3 || !Number.isInteger(day) || day < 1 || day > 30) {
    return null;
  }
  let from = source ?? (BIRTHDAY_SOURCES.includes(raw.from) ? raw.from : "rolled");
  return {
    season: season,
    day: day,
    from: from,
  };
}
var rollBirthday = (seed, salt) => {
  let dayRoll = Math.floor(seededRandom(seed, salt, "birthday") * 120);
  return {
    season: Math.floor(dayRoll / 30),
    day: (dayRoll % 30) + 1,
    from: "rolled",
  };
};
var formatBirthday = (birthday) => (birthday ? `${SEASON_NAMES[birthday.season]} ${birthday.day}` : "");
var birthdayDayOfYear = (birthday) => birthday.season * 30 + birthday.day - 1;
function daysUntilBirthday(birthday, minutes) {
  if (!birthday) {
    return null;
  }
  let dayOfYear = clockFromMinutes(minutes).dayIndex % 120;
  return (birthdayDayOfYear(birthday) - dayOfYear + 120) % 120;
}
var isBirthdayToday = (birthday, minutes) => !!birthday && daysUntilBirthday(birthday, minutes) === 0;
var yearIndexAt = (minutes) => Math.floor(clockFromMinutes(minutes).dayIndex / 120);
var isBirthdayOnDay = (birthday, dayIndex) => !!birthday && dayIndex % 120 === birthdayDayOfYear(birthday);
var knowsBirthdayOf = (npcState, characterId) => {
  let bond = npcState.bonds?.[characterId];
  return !!bond && (MILESTONE_COUPLE_STATUSES.includes(bond.status) || !!bond.bday?.known);
};
var formatDaysUntil = (days) => (days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`);

export {
  daysUntilBirthday,
  formatBirthday,
  formatDaysUntil,
  isBirthdayOnDay,
  isBirthdayToday,
  knowsBirthdayOf,
  normalizeBirthday,
  rollBirthday,
  yearIndexAt,
};
