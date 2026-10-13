// Skill perks and the player sheet view: skills, needs, money, work, life
import { clockFromMinutes, formatClockTime, formatDateTime } from "../time/clock.mjs";
import { SKILL_NAMES, skillLevelInfo } from "../skills/skill-levels.mjs";
import { RELATIONSHIP_STATUS_LABELS, bondSummary, bondTier } from "../relationships/bonds.mjs";
import { daysUntilBirthday, formatBirthday, formatDaysUntil } from "../relationships/birthdays.mjs";
import {
  OFFICE_HOURS_LABEL,
  OFFICE_POSITIONS,
  REVIEW_DAYS_OF_SEASON,
  WARNINGS_TO_FIRE,
} from "../jobs/office-rules.mjs";
import { activeJobWarnings, nextOfficePosition, officePayOf, officePositionById } from "../jobs/office-job.mjs";
import { daysUntilRent, homeKindOf, totalOwed } from "../money/wallet.mjs";
import { needsStatus } from "../needs/needs.mjs";

var SKILL_PERKS2 = {
  fitness: {
    every: "+3 max energy, and walking tires you less",
    at: {
      3: "the personal trainer at the gym",
      5: "You win a Rival's challenges more often",
      7: "overtime without being wrecked",
    },
  },
  charm: {
    every: "+5% to every social moment, and Chat and Flirt go wrong less often",
    at: {
      2: "flirting stops going wrong from clumsiness",
      4: "first impressions start warmer",
      6: "a better option in work moments with people",
    },
  },
  knowledge: {
    every: "lets you move up at the Office",
    at: {
      3: "you see which option pays off in work moments",
      5: "reading pays double",
    },
  },
  cooking: {
    every: "your dishes burn less and turn out delicious more often",
    at: {
      1: "pancakes",
      2: "fried rice and pasta with cheese",
      3: "vegetable soup",
      4: "chicken stir-fry",
      5: "grilled fish",
      6: "chicken curry",
      7: "lasagna",
      8: "fruit tart",
      9: "a roast chicken dinner",
    },
  },
};
var personaBlurb = (text) => {
  let clean = String(text ?? "")
      .replace(/\s+/g, " ")
      .trim(),
    sentenceEnd = clean.search(/[.!?](\s|$)/),
    firstSentence = sentenceEnd > 20 ? clean.slice(0, sentenceEnd + 1) : clean;
  return firstSentence.length > 220 ? `${firstSentence.slice(0, 219).trimEnd()}\u2026` : firstSentence;
};
function nextReviewLabel(minutes) {
  let now = clockFromMinutes(minutes);
  for (let dayOffset = 0; dayOffset < 40; dayOffset++) {
    let clock = clockFromMinutes(minutes + dayOffset * 24 * 60);
    if (REVIEW_DAYS_OF_SEASON.includes(clock.day) && (dayOffset > 0 || now.hour < 17)) {
      return `${clock.day} ${clock.season}`;
    }
  }
  return "";
}
function playerSheet(
  world,
  {
    levels: levels,
    placeName: placeName,
    contacts: contacts,
    flatmate: flatmate,
    persona: persona,
    rent = 0,
    lodging = {
      kind: "home",
    },
  },
) {
  let skillLevelsNow = levels,
    needs = needsStatus(world.needs, {
      fitness: skillLevelsNow.fitness,
    }),
    skills = SKILL_NAMES.map((skill) => {
      let info = skillLevelInfo(world.skills[skill] ?? 0),
        nextPerk =
          Object.entries(SKILL_PERKS2[skill].at)
            .map(([level, perk]) => [Number(level), perk])
            .find(([level]) => level > info.level) ?? null;
      return {
        id: skill,
        level: info.level,
        into: Math.round(info.intoLevel),
        forNext: info.needsForNext,
        progress: info.progress,
        every: SKILL_PERKS2[skill].every,
        next: nextPerk
          ? {
              level: nextPerk[0],
              what: nextPerk[1],
            }
          : null,
      };
    }),
    homeKind = homeKindOf(world.wallet.home),
    rentIn = daysUntilRent(world.wallet, world.minutes),
    ledger = (world.wallet.ledger ?? [])
      .slice()
      .reverse()
      .map((entry) => ({
        when: `${["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][clockFromMinutes(entry.at).weekdayIndex]} ${formatClockTime(
          entry.at,
          {
            ampm: false,
          },
        )}`,
        label: entry.label,
        amount: entry.amount,
      })),
    job = world.job,
    position = officePositionById(job.position),
    nextPosition = nextOfficePosition(job.position),
    warningCount = activeJobWarnings(job, world.minutes).length,
    met = contacts.filter((contact) => contact.met),
    partnerBond = Object.values(world.bonds).find(
      (bond) => bond.status && bond.status !== "single" && bond.status !== "ex",
    ),
    closest = met
      .slice()
      .sort((left, right) => right.weight - left.weight)
      .slice(0, 3),
    dayNumber =
      clockFromMinutes(world.minutes).dayIndex - clockFromMinutes(world.startedAt ?? world.minutes).dayIndex + 1;
  return {
    name: persona?.name || "You",
    avatar: persona?.avatar ?? null,
    line: personaBlurb(persona?.description),
    day: dayNumber,
    town: world.townName || "",
    now: {
      place: placeName(world.at),
      time: formatClockTime(world.minutes),
      moment: formatDateTime(world.minutes),
    },
    skills: skills,
    needs: {
      energy: Math.round(needs.energy),
      energyMax: needs.energyMax,
      hunger: Math.round(needs.hunger),
      energyState:
        needs.energy <= 0 ? "Collapsed" : needs.energyCritical ? "Exhausted" : needs.energyLow ? "Tired" : "Fine",
      hungerState: needs.hunger <= 0 || needs.hungerCritical ? "Starving" : needs.hungerLow ? "Hungry" : "Fine",
      energyLow: needs.energyLow,
      hungerLow: needs.hungerLow,
    },
    money: {
      cash: world.wallet.cash,
      owedRent: totalOwed(world.wallet, "rent"),
      owedHospital: totalOwed(world.wallet, "hospital"),
      loans: (world.debts ?? []).reduce((sum, debt) => sum + Math.max(0, debt.amount), 0),
      rent: rent,
      rentIn: rentIn,
      rentDay: world.wallet.rentDay,
      lodging: lodging,
      home:
        lodging.kind === "street" ? "No home" : lodging.kind === "couch" ? `${lodging.name}'s couch` : homeKind.name,
      door: world.residence ? `${placeName(world.residence.place)}, ${world.residence.unit}` : "",
      flatmate: flatmate,
      ledger: ledger,
      birthday: world.birthday
        ? `${formatBirthday(world.birthday)} \xB7 ${formatDaysUntil(daysUntilBirthday(world.birthday, world.minutes))}`
        : "",
    },
    work: job.employed
      ? {
          position: position.name,
          pay: officePayOf(job),
          hours: OFFICE_HOURS_LABEL,
          performance: Math.round(job.performance),
          warnings: warningCount,
          warningsMax: WARNINGS_TO_FIRE,
          review: nextReviewLabel(world.minutes),
          next: nextPosition
            ? {
                name: nextPosition.name,
                needs: Object.entries(nextPosition.needs).map(
                  ([need, needed]) =>
                    `${need === "performance" ? "Performance" : need[0].toUpperCase() + need.slice(1)} ${needed}`,
                ),
              }
            : null,
          ladder: OFFICE_POSITIONS.map((position2) => ({
            name: position2.name,
            on: position2.id === job.position,
            next: nextPosition?.id === position2.id,
          })),
        }
      : null,
    life: {
      met: met.length,
      total: contacts.length,
      scenes: world.stats?.scenes ?? 0,
      status: partnerBond
        ? `${RELATIONSHIP_STATUS_LABELS[partnerBond.status]} \xB7 ${contacts.find((contact) => contact.id === partnerBond.characterId)?.name ?? ""}`
        : "Single",
      closest: closest.map((contact) => {
        let bond = world.bonds[contact.id],
          summary = bondSummary(bond);
        return {
          id: contact.id,
          name: contact.name,
          avatar: contact.avatar,
          face: contact.face,
          sub: `${summary.friendship.name} \xB7 ${summary.trust.name}`,
          heart: bondTier(bond, "romance") >= 2,
          event: contact.event,
        };
      }),
    },
  };
}

export { SKILL_PERKS2, playerSheet };
