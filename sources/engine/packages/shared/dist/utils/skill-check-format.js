export function getSkillCheckOutcomeLabel(result) {
    if (result.criticalSuccess)
        return "Critical success";
    if (result.criticalFailure)
        return "Critical failure";
    return result.success ? "Success" : "Failure";
}
export function getSkillCheckOutcomeKey(result) {
    if (result.criticalSuccess)
        return "critical_success";
    if (result.criticalFailure)
        return "critical_failure";
    return result.success ? "success" : "failure";
}
/**
 * Whether the dice literally sum to the total, so a "a + b + c = total"
 * breakdown is a true statement.
 *
 * False for advantage/disadvantage (only one die counts) and for pool systems
 * that count successes rather than add pips. Callers must not render an
 * addition unless this holds — the alternative is a card that asserts
 * arithmetic nobody performed. Deliberately checks the numbers instead of
 * asking which rules system is in play, so systems the engine has never heard
 * of still display honestly.
 */
export function skillCheckDiceSumToTotal(result) {
    return (result.resolution === "sum" && result.rolls.reduce((sum, roll) => sum + roll, 0) + result.modifier === result.total);
}
export function formatSkillCheckResultSummary(result) {
    const modifier = result.modifier === 0 ? "" : ` ${result.modifier > 0 ? "+" : ""}${result.modifier}`;
    const rollMode = result.rollMode !== "normal" ? ` (${result.rollMode})` : "";
    // Only claim the dice add up to the total when they actually do; otherwise
    // report the total on its own so the GM reads back what the player saw.
    const arithmetic = skillCheckDiceSumToTotal(result)
        ? `[${result.rolls.join(", ")}]${modifier}${rollMode} = ${result.total}`
        : `[${result.rolls.join(", ")}]${result.resolution === "successes" ? "" : modifier}${rollMode} → ${result.total}${result.resolution === "successes" ? ` ${result.total === 1 ? "success" : "successes"}` : ""}`;
    // A complication is alongside the outcome, never instead of it, so the outcome is still said first.
    const complication = result.complication ? " Something went wrong on the side." : "";
    return `${result.skill} check (DC ${result.dc}): ${arithmetic}. ${getSkillCheckOutcomeLabel(result)}.${complication}`;
}
function serializeSkillCheckAttribute(value) {
    return value.replace(/["\r\n]/g, "'").trim();
}
/** A name in `from=`: no brackets, which would end the tag, and no semicolons, which part the names. */
function fromName(name) {
    return serializeSkillCheckAttribute(name.replace(/[[\];]/g, " ").replace(/\s+/g, " "));
}
function serializeSkillCheckExtras(extras) {
    if (!extras)
        return "";
    const parts = [];
    if (extras.threshold != null && Number.isFinite(extras.threshold))
        parts.push(`threshold="${extras.threshold}"`);
    if (extras.pool)
        parts.push(`pool="${serializeSkillCheckAttribute(extras.pool)}"`);
    if (extras.who)
        parts.push(`who="${serializeSkillCheckAttribute(extras.who)}"`);
    // Appended after everything a tag has always carried, so no shipped call site changes its bytes.
    if (extras.with)
        parts.push(`with="${serializeSkillCheckAttribute(extras.with)}"`);
    if (extras.bonus != null && Number.isFinite(extras.bonus)) {
        parts.push(`bonus="${extras.bonus > 0 ? "+" : ""}${extras.bonus}"`);
    }
    if (extras.spend)
        parts.push(`spend="${serializeSkillCheckAttribute(extras.spend)}"`);
    if (extras.auto != null && Number.isFinite(extras.auto) && extras.auto > 0)
        parts.push(`auto="${extras.auto}"`);
    if (extras.use)
        parts.push(`use="${serializeSkillCheckAttribute(extras.use)}"`);
    if (extras.rerolled != null && Number.isFinite(extras.rerolled) && extras.rerolled > 0) {
        parts.push(`rerolled="${extras.rerolled}"`);
    }
    if (extras.penalty != null && Number.isFinite(extras.penalty) && extras.penalty < 0) {
        parts.push(`penalty="${extras.penalty}"`);
    }
    if (extras.difficulty)
        parts.push(`difficulty="${serializeSkillCheckAttribute(extras.difficulty)}"`);
    if (extras.explode != null && Number.isFinite(extras.explode))
        parts.push(`explode="${extras.explode}"`);
    if (extras.double != null && Number.isFinite(extras.double))
        parts.push(`double="${extras.double}"`);
    if (extras.complication)
        parts.push(`complication="true"`);
    if (extras.adjust != null && Number.isFinite(extras.adjust) && extras.adjust !== 0) {
        parts.push(`adjust="${extras.adjust > 0 ? "+" : ""}${extras.adjust}"`);
    }
    if (extras.reroll)
        parts.push(`reroll="${serializeSkillCheckAttribute(extras.reroll)}"`);
    if (extras.reason)
        parts.push(`reason="${extras.reason}"`);
    if (extras.effects != null && Number.isFinite(extras.effects) && extras.effects !== 0) {
        parts.push(`effects="${extras.effects > 0 ? "+" : ""}${extras.effects}"`);
    }
    const from = (extras.from ?? []).map(fromName).filter(Boolean);
    if (from.length > 0)
        parts.push(`from="${from.join("; ")}"`);
    if (extras.automatic)
        parts.push(`automatic="true"`);
    return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}
export function serializeSparseSkillCheckTag(request, extras) {
    const parts = [`[skill_check: skill="${serializeSkillCheckAttribute(request.skill)}"`];
    if (request.dc != null && Number.isFinite(request.dc))
        parts.push(`dc="${request.dc}"`);
    if (request.preRolledD20 != null)
        parts.push(`rolls="${request.preRolledD20}"`);
    if (request.advantage && !request.disadvantage)
        parts.push(`mode="advantage"`);
    else if (request.disadvantage && !request.advantage)
        parts.push(`mode="disadvantage"`);
    if (request.declaredDice)
        parts.push(`dice="${serializeSkillCheckAttribute(request.declaredDice)}"`);
    if (request.declaredResolution)
        parts.push(`resolution="${serializeSkillCheckAttribute(request.declaredResolution)}"`);
    return `${parts.join(" ")}${serializeSkillCheckExtras(extras)}]`;
}
export function serializeResolvedSkillCheckTag(result, extras) {
    // A result that carries its own `who` or per-die threshold writes them without the caller
    // repeating itself. An explicit extra still wins: a caller that passes one is the path that
    // measured it, and the legacy pool path has always passed its own.
    const merged = {
        ...(result.threshold != null ? { threshold: result.threshold } : {}),
        ...(result.who ? { who: result.who } : {}),
        ...(result.withAbility ? { with: result.withAbility } : {}),
        ...(result.bonusDice ? { bonus: result.bonusDice } : {}),
        ...(result.spent ? { spend: `${result.spent.pool}:${result.spent.amount}` } : {}),
        ...(result.autoSuccesses ? { auto: result.autoSuccesses } : {}),
        ...(result.used ? { use: result.used } : {}),
        ...(result.rerolled ? { rerolled: result.rerolled } : {}),
        ...(result.penalty != null ? { penalty: result.penalty } : {}),
        ...(result.explodeFrom != null ? { explode: result.explodeFrom } : {}),
        ...(result.doubleFrom != null ? { double: result.doubleFrom } : {}),
        ...(result.complication ? { complication: true } : {}),
        ...(result.adjust ? { adjust: result.adjust } : {}),
        ...(result.reroll ? { reroll: result.reroll } : {}),
        ...(result.effects ? { effects: result.effects } : {}),
        ...(result.from?.length ? { from: result.from } : {}),
        ...(result.automatic ? { automatic: true } : {}),
        // An extra a caller left undefined is absent, not an instruction to erase what the result says.
        ...Object.fromEntries(Object.entries(extras ?? {}).filter(([, value]) => value !== undefined)),
    };
    return `${[
        `[skill_check: skill="${serializeSkillCheckAttribute(result.skill)}"`,
        `dc="${result.dc}"`,
        `rolls="${result.rolls.join("|")}"`,
        `used="${result.usedRoll}"`,
        `modifier="${result.modifier}"`,
        `total="${result.total}"`,
        `result="${getSkillCheckOutcomeKey(result)}"`,
        `mode="${result.rollMode}"`,
        `resolution="${result.resolution}"`,
        `dice="${serializeSkillCheckAttribute(result.dice ?? "1d20")}"`,
    ].join(" ")}${serializeSkillCheckExtras(merged)}]`;
}
//# sourceMappingURL=skill-check-format.js.map