// Household income: the pay of the people who live with you, and the basic income rule
import { clockFromMinutes } from "../time/clock.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { townJobById } from "../jobs/town-jobs.mjs";
import { WORK_FROM_HOME_PLACE } from "../schedule/whereabouts.mjs";
import { earnMoney, rentSeasonKey } from "./wallet.mjs";
import { livingWithYou, nameFor, sharesYourDoor } from "../game.mjs";

var MINUTES_IN_DAY = 1440;
var UBI_MAX = 1e5;
var OUT_OF_TOWN_PAY = 80;
var HOME_WORK_PAY = 75;
var SKILLED_HOME_PAY = 140;
var BOSS_HOME_PAY = 200;
var BOSS_TITLE = /\b(ceo|owner|founder|director|executive|boss|head)\b/i;
var SKILLED_TITLE =
  /\b(doctor|surgeon|lawyer|attorney|engineer|developer|programmer|architect|professor|consultant|analyst|designer|manager|chef|scientist)\b/i;
function cleanUbi(value) {
  return Math.max(0, Math.min(UBI_MAX, Math.floor(Number(value) || 0)));
}
function householdOf(state) {
  if (state.lodging || !state.residence) {
    return [];
  }
  let partnerIds = livingWithYou(state).map((bond) => bond.characterId);
  return state.characters.filter(
    (character) => !character.away && (partnerIds.includes(character.id) || sharesYourDoor(state, character)),
  );
}
function shiftPayOf(state, character) {
  let job = character?.job;
  if (job?.id) {
    return townJobById(state.town, job.id)?.pay ?? 0;
  }
  if (job?.out) {
    return OUT_OF_TOWN_PAY;
  }
  if (job?.home) {
    let title = String(job.title ?? "");
    return BOSS_TITLE.test(title) ? BOSS_HOME_PAY : SKILLED_TITLE.test(title) ? SKILLED_HOME_PAY : HOME_WORK_PAY;
  }
  return 0;
}
function worksOnDay(state, character, dayIndex) {
  let weekday = clockFromMinutes(dayIndex * MINUTES_IN_DAY).weekdayIndex;
  if (character.job?.id) {
    return !!townJobById(state.town, character.job.id)?.days?.includes(weekday);
  }
  return (character.week?.[weekday] ?? []).some(
    (span) => span.place === JOB_AWAY_PLACE || span.place === WORK_FROM_HOME_PLACE,
  );
}
// Paid at the end of each day, once: the wallet remembers the last day it was paid for.
function payHouseholdDay(state, dayIndex) {
  let wallet = state.wallet;
  if ((wallet.householdPaidDay ?? -1) >= dayIndex) {
    return 0;
  }
  wallet.householdPaidDay = dayIndex;
  let total = 0;
  for (let character of householdOf(state)) {
    let pay = shiftPayOf(state, character);
    if (pay > 0 && worksOnDay(state, character, dayIndex)) {
      earnMoney(wallet, pay, `${nameFor(state, character)}'s pay`, (dayIndex + 1) * MINUTES_IN_DAY - 1);
      total += pay;
    }
  }
  return total;
}
// Day 1 of each season; the season it is switched on in has already been marked paid.
function payBasicIncome(state) {
  let amount = cleanUbi(state.rules?.ubi),
    season = rentSeasonKey(state.minutes);
  if (!amount || state.wallet.ubiPaidThrough === season) {
    return 0;
  }
  state.wallet.ubiPaidThrough = season;
  earnMoney(state.wallet, amount, "Basic income", state.minutes);
  return amount;
}
function householdView(state) {
  let members = householdOf(state)
    .map((character) => ({
      characterId: character.id,
      name: nameFor(state, character),
      title: character.job?.title || (character.job?.out ? "Works out of town" : ""),
      pay: shiftPayOf(state, character),
      days: [0, 1, 2, 3, 4, 5, 6].filter((day) => worksOnDay(state, character, day)).length,
    }))
    .filter((member) => member.pay > 0 && member.days > 0);
  return {
    list: members,
    week: members.reduce((sum, member) => sum + member.pay * member.days, 0),
    ubi: cleanUbi(state.rules?.ubi),
  };
}

export { UBI_MAX, cleanUbi, householdOf, householdView, payBasicIncome, payHouseholdDay, shiftPayOf, worksOnDay };
