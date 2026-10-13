// Skill perk thresholds and cooking XP
var SKILL_PERK_LEVELS = {
  flirtIsSafe: 2,
  firstImpression: 4,
  moreAtWork: 6,
  seesBestOption: 3,
  readingDouble: 5,
  challengeBonus: 5,
  overtimeEase: 7,
};
var SKILL_PERKS = {
  socialMultiplier: (level = 0) => 1 + Math.max(0, level) * 0.05,
  flirtIsSafe: (level = 0) => level >= SKILL_PERK_LEVELS.flirtIsSafe,
  firstImpression: (level = 0) => (level >= SKILL_PERK_LEVELS.firstImpression ? 5 : 0),
  moreAtWork: (level = 0) => level >= SKILL_PERK_LEVELS.moreAtWork,
  readingMultiplier: (level = 0) => (level >= SKILL_PERK_LEVELS.readingDouble ? 2 : 1),
  seesBestOption: (level = 0) => level >= SKILL_PERK_LEVELS.seesBestOption,
  challengeBonus: (level = 0) => (level >= SKILL_PERK_LEVELS.challengeBonus ? 0.15 : 0),
  overtimeEase: (level = 0) => (level >= SKILL_PERK_LEVELS.overtimeEase ? 0.5 : 1),
  burntChance: (level = 0) => Math.max(0, 0.3 - Math.max(0, level) * 0.03),
  greatChance: (level = 0) => Math.min(0.7, 0.1 + Math.max(0, level) * 0.06),
};
var COOKING_XP_BY_QUALITY = {
  burnt: 4,
  fine: 8,
  great: 8,
};

export { COOKING_XP_BY_QUALITY, SKILL_PERKS, SKILL_PERK_LEVELS };
