// Skill XP curve, levels and starting skill points
var SKILL_NAMES = ["fitness", "charm", "knowledge", "cooking"];
function skillXpForLevel(level) {
  let clamped = Math.min(10, Math.max(0, Math.trunc(level)));
  return ((clamped * (clamped + 1)) / 2) * 50;
}
function skillLevelInfo(xp) {
  let total = Math.max(0, xp),
    level = 0;
  for (; level < 10 && total >= skillXpForLevel(level + 1);) {
    level++;
  }
  let floor = skillXpForLevel(level),
    next = level >= 10 ? null : skillXpForLevel(level + 1);
  return {
    level: level,
    xp: total,
    intoLevel: total - floor,
    needsForNext: next === null ? 0 : next - floor,
    progress: next === null ? 1 : (total - floor) / (next - floor),
  };
}
// The recommended starting budget; a player may go past it, up to the top level in every skill.
var STARTING_SKILL_POINTS = 5;
var STARTING_SKILL_MAX = 10;
function validateStartingSkills(skills) {
  if (skills == null) {
    return;
  }
  if (typeof skills != "object") {
    return false;
  }
  let valid = {};
  for (let skill of SKILL_NAMES) {
    let level = skills[skill] ?? 0;
    if (!Number.isInteger(level) || level < 0 || level > STARTING_SKILL_MAX) {
      return false;
    }
    valid[skill] = level;
  }
  return valid;
}
function startingSkillXp(levels = {}) {
  let xp = {};
  for (let skill of SKILL_NAMES) {
    xp[skill] = skillXpForLevel(levels[skill] ?? 0);
  }
  return xp;
}
function addSkillXp(skills, gains = {}) {
  let levelUps = [];
  for (let [skill, amount] of Object.entries(gains)) {
    if (!SKILL_NAMES.includes(skill) || !(amount > 0)) {
      continue;
    }
    let before = skillLevelInfo(skills[skill] ?? 0).level;
    skills[skill] = Math.min(skillXpForLevel(10), (skills[skill] ?? 0) + amount);
    let after = skillLevelInfo(skills[skill]).level;
    if (after > before) {
      levelUps.push({
        skill: skill,
        from: before,
        to: after,
      });
    }
  }
  return levelUps;
}
function skillLevels(skills) {
  let levels = {};
  for (let skill of SKILL_NAMES) {
    levels[skill] = skillLevelInfo(skills[skill] ?? 0).level;
  }
  return levels;
}

export {
  SKILL_NAMES,
  STARTING_SKILL_MAX,
  STARTING_SKILL_POINTS,
  addSkillXp,
  skillLevelInfo,
  skillLevels,
  startingSkillXp,
  validateStartingSkills,
};
