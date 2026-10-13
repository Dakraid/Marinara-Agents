// Day or night lighting by game hour
import { clockFromMinutes } from "../time/clock.mjs";

var NIGHT_FROM_HOUR = 19;
var NIGHT_UNTIL_HOUR = 6;
var dayOrNightAt = (minutes) => {
  let { hour: hour } = clockFromMinutes(minutes);
  return hour >= NIGHT_FROM_HOUR || hour < NIGHT_UNTIL_HOUR ? "night" : "day";
};
var LIGHT_TIMES = ["day", "night"];

export { LIGHT_TIMES, dayOrNightAt };
