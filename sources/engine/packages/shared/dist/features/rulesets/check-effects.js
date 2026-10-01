import { parseRulesetCombatDice } from "../ruleset-combat/dice.js";
import { evaluateRulesetSheetLive, readRulesetLive } from "./live-state.js";
import { resolveRulesetValueRef, rulesetCheckAdjust, rulesetCheckModifier, } from "./sheet-math.js";
/**
 * Everything that changes this character's checks outside a fight. A condition counts while it is
 * active on the sheet (a gate on who applied it has nobody to measure outside a fight, so it counts),
 * a level while the track or derived value it reads has reached it, an item's `worn` effect while it
 * is worn and its `carried` one while it is only carried, and a worn item's requirement's `otherwise`
 * while the wearer falls short of it. One item applies each of these once, however many stacks of it
 * there are. Derived values and requirements are read off the sheet worked out with the same live
 * state and items.
 */
export function rulesetCheckSources(definition, build, stored, items) {
    const sources = [];
    const combat = definition.combat;
    let evaluated;
    const sheet = () => (evaluated ??= evaluateRulesetSheetLive(definition, build, stored, items));
    if (combat?.conditions?.length || combat?.levels?.length) {
        const live = readRulesetLive(definition, build, stored);
        const active = new Map(live.conditions.filter((entry) => entry.active).map((entry) => [entry.id, entry.label]));
        for (const entry of combat.conditions ?? []) {
            const label = active.get(entry.condition);
            if (label !== undefined)
                sources.push({ ...entry, name: label });
        }
        for (const level of combat.levels ?? []) {
            const value = level.derived !== undefined
                ? (sheet().derived[level.derived] ?? 0)
                : (live.tracks.find((track) => track.id === level.track)?.value ?? 0);
            if (value < level.at)
                continue;
            const label = level.derived !== undefined
                ? (definition.sheet.derived.find((entry) => entry.id === level.derived)?.label ?? level.derived)
                : (definition.sheet.live.tracks.find((track) => track.id === level.track)?.label ?? level.track);
            sources.push({ ...level, name: `${label} ${level.at}` });
        }
    }
    return [...sources, ...rulesetItemSources(definition, build, items, sheet)];
}
/**
 * What a character's items do, each named for the stack: a worn item's `worn` effect and any other
 * item's `carried` one, and a worn item's requirement's `otherwise` while the wearer falls short of it.
 * One item applies each of these once, however many stacks of it there are. `sheet` is the sheet
 * worked out with the same live state and items, read only for a requirement. A check outside a fight
 * and a fight both read items through this.
 */
export function rulesetItemSources(definition, build, items, sheet) {
    const sources = [];
    const seen = new Set();
    for (const held of items ?? []) {
        const name = held.name ?? held.item.category;
        const effect = held.worn ? held.item.worn : held.item.carried;
        if (effect && !seen.has(effect)) {
            seen.add(effect);
            sources.push({ ...effect, name });
        }
        // What the wearer falls short of, while it is worn.
        if (!held.worn || !held.item.requires || seen.has(held.item.requires))
            continue;
        seen.add(held.item.requires);
        for (const requirement of held.item.requires) {
            if (resolveRulesetValueRef(definition, build, requirement.value, sheet()) >= requirement.atLeast)
                continue;
            sources.push({ ...requirement.otherwise, name });
        }
    }
    return sources;
}
/**
 * What changes this check or save. A check reads the check effects and the modifiers to checks, a save
 * the save effects, the modifiers to saves and the saves failed. Something narrowed to some skills
 * changes only a check on one of them (a modifier's own `skills` first, else its source's), and
 * something narrowed to some saves only those saves; a check the ruleset cannot name reads only what
 * is narrowed to nothing.
 */
export function rulesetCheckEffects(sources, target) {
    const found = { modifiers: [], advantage: [], disadvantage: [], fails: [] };
    const lean = (side, from) => {
        if (!found[side].includes(from))
            found[side].push(from);
    };
    const save = target?.type === "save" ? target.id : undefined;
    const skill = target?.type === "skill" ? target.id : undefined;
    const about = (narrowed, id) => !narrowed || (id !== undefined && narrowed.includes(id));
    for (const source of sources) {
        const effects = source.effects ?? [];
        if (save !== undefined) {
            if (source.failsSaves?.includes(save) && !found.fails.includes(source.name))
                found.fails.push(source.name);
            if (about(source.saves, save)) {
                if (effects.includes("own-saves-advantage"))
                    lean("advantage", source.name);
                if (effects.includes("own-saves-disadvantage"))
                    lean("disadvantage", source.name);
            }
        }
        else if (about(source.skills, skill)) {
            if (effects.includes("own-checks-advantage"))
                lean("advantage", source.name);
            if (effects.includes("own-checks-disadvantage"))
                lean("disadvantage", source.name);
        }
        for (const modifier of source.modifiers ?? []) {
            const applies = save !== undefined
                ? modifier.to === "saves" && about(modifier.saves ?? source.saves, save)
                : modifier.to === "checks" && about(modifier.skills ?? source.skills, skill);
            if (!applies)
                continue;
            if (modifier.mode)
                lean(modifier.mode, source.name);
            if (modifier.flat !== undefined || modifier.dice !== undefined) {
                found.modifiers.push({ from: source.name, modifier });
            }
        }
    }
    return found;
}
/** How a check is thrown once its sources and the Game Master's `mode=` are counted together: any
 *  advantage and any disadvantage cancel out, whatever the number of each. */
export function rulesetCheckRollMode(asked, effects) {
    const advantage = !!asked.advantage || effects.advantage.length > 0;
    const disadvantage = !!asked.disadvantage || effects.disadvantage.length > 0;
    if (advantage === disadvantage)
        return "normal";
    return advantage ? "advantage" : "disadvantage";
}
/** The modifiers rolled: each one's flat part and its dice, with the dice thrown. */
export function rollRulesetCheckModifiers(modifiers, rollDie) {
    let total = 0;
    const rolls = [];
    for (const { modifier } of modifiers) {
        total += modifier.flat ?? 0;
        const dice = modifier.dice ? parseRulesetCombatDice(modifier.dice) : null;
        if (!dice)
            continue;
        let rolled = dice.flat;
        for (let i = 0; i < dice.count; i++) {
            const face = rollDie(dice.sides);
            rolls.push(face);
            rolled += face;
        }
        total += modifier.minus ? -rolled : rolled;
    }
    return { total, rolls };
}
/**
 * What a use's `gate` asks of one user: nothing when the value it names under `unless` is high
 * enough, and otherwise its check, read off their sheet worked out with their live state and items.
 * `difficulty` is the gate's own, already read off the item where it names a stat.
 */
export function rulesetItemGateCheck(definition, build, evaluated, gate, difficulty) {
    const { check, unless } = gate;
    if (unless && resolveRulesetValueRef(definition, build, unless.value, evaluated) >= unless.atLeast)
        return null;
    const skill = "skill" in check ? definition.sheet.skills.find((entry) => entry.id === check.skill) : undefined;
    const ability = "ability" in check ? definition.sheet.abilities.find((entry) => entry.id === check.ability) : undefined;
    const target = skill
        ? { type: "skill", id: skill.id, label: skill.label, ...(skill.ability ? { ability: skill.ability } : {}) }
        : ability
            ? { type: "ability", id: ability.id, label: ability.label }
            : null;
    const base = "value" in check
        ? resolveRulesetValueRef(definition, build, check.value, evaluated)
        : rulesetCheckModifier(evaluated, target);
    return {
        target,
        modifier: Math.trunc(base) + rulesetCheckAdjust(definition, build, evaluated, target),
        difficulty,
    };
}
//# sourceMappingURL=check-effects.js.map