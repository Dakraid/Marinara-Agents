import type { DexEntry, PokedexGender, PokedexVault } from "./schema.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function genderLabel(gender: PokedexGender): string {
  if (gender === "male") return "Male ♂";
  if (gender === "female") return "Female ♀";
  return "Futanari ⚥";
}

function genderSymbol(gender: PokedexGender): string {
  if (gender === "male") return "♂";
  if (gender === "female") return "♀";
  return "⚥";
}

function glyphRating(rating: number, filled: string, empty: string): string {
  const bounded = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.trunc(rating))) : 0;
  return filled.repeat(bounded) + empty.repeat(5 - bounded);
}

function displayNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

export function renderPokedexScanCard(entry: DexEntry): string {
  const dexNumber = Math.max(1, Math.min(1025, Math.trunc(entry.dexNumber)));
  const artworkNumber = String(dexNumber).padStart(3, "0");
  const affection = glyphRating(entry.affection.rating, "❤️", "💔");
  const heat = glyphRating(entry.heat.rating, "🔥", "△");
  const stars = glyphRating(entry.starRating, "★", "☆");
  return `<div style="width:100%;box-sizing:border-box;border:2px solid #232328;border-radius:8px;padding:8px;text-align:center;font-family:Consolas,monaco,monospace;color:#fff;background-color:#111114;background-image:url(https://files.catbox.moe/xu0jxk.png);background-size:cover;background-position:center;">
  <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${artworkNumber}.png" alt="${escapeHtml(entry.species)}" style="display:block;width:50%;height:auto;margin:0 auto;">
  <div style="font-size:20px;font-weight:bold;color:#fff;">${escapeHtml(entry.name)} #${dexNumber}</div>
  <pre style="margin:8px 0;white-space:pre-wrap;text-align:left;font:inherit;line-height:1.35;">### GENERAL ###
Category: "${escapeHtml(entry.category)}"
Gender: "${genderLabel(entry.gender)}"
Archetype: "${escapeHtml(entry.archetype)}"
Speech: "${escapeHtml(entry.speech)}"
Height: ${displayNumber(entry.heightM)} m
Weight: ${displayNumber(entry.weightKg)} kg

### SEXUAL ###
Knowledge: "${escapeHtml(entry.sexualKnowledge)}"
Details: "${escapeHtml(entry.anatomicalDetails)}"
Evolution: "${escapeHtml(entry.evolutionRequirement)}"</pre>
  <div style="margin:8px 0;text-align:left;color:#e0115f;line-height:1.4;">
    <div>Affection: ${affection} (${escapeHtml(entry.affection.state)})</div>
    <div>↳ ${escapeHtml(entry.affection.cause)}</div>
    <div>Heat: ${heat} (${escapeHtml(entry.heat.state)})</div>
    <div>↳ ${escapeHtml(entry.heat.advice)}</div>
  </div>
  <hr style="border:0;border-top:1px solid #232328;margin:8px 0;">
  <div style="font-style:italic;">“${escapeHtml(entry.trainerReview)}”</div>
  <div style="margin-top:6px;font-weight:bold;">${stars} (${entry.verdict.toUpperCase()})</div>
</div>`;
}

export function buildPokedexTrackerContext(vault: PokedexVault): string {
  const entryFor = (key: string) => vault.dex[key];
  const haremLines = vault.harem.flatMap((member) => {
    const entry = entryFor(member.key);
    if (!entry) return [];
    return [
      `- ${entry.name} #${entry.dexNumber} | ${genderSymbol(entry.gender)}`,
      `  Relationship: ${member.relationshipStatus}`,
      `  Affection: ${glyphRating(entry.affection.rating, "❤️", "💔")} (${entry.affection.state})`,
      `  Last interaction: ${member.lastInteraction}`,
      `  Status/location: ${member.currentStatus}`,
    ];
  });
  const pregnancyLines = vault.pregnancies.flatMap((pregnancy) => {
    const entry = entryFor(pregnancy.key);
    if (!entry) return [];
    return [
      `- ${entry.name}: ${pregnancy.eggsExpected} egg${pregnancy.eggsExpected === 1 ? "" : "s"} expected; bred ${pregnancy.bredAt}; sire: ${pregnancy.sire}`,
    ];
  });
  const encounterLines = vault.recentEncounters.flatMap((encounter) => {
    const entry = entryFor(encounter.key);
    if (!entry) return [];
    return [`- ${entry.name} #${entry.dexNumber}: ${encounter.outcome} at ${encounter.at}`];
  });
  return [
    "ACTIVE HAREM",
    ...(haremLines.length > 0 ? haremLines : ["*No active harem members*"]),
    "",
    "PREGNANCY STATUS",
    ...(pregnancyLines.length > 0 ? pregnancyLines : ["*No current pregnancies*"]),
    "",
    "RECENT ENCOUNTERS",
    ...(encounterLines.length > 0 ? encounterLines : ["*No recent encounters*"]),
  ].join("\n");
}
