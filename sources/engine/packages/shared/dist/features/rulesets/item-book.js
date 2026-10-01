// ──────────────────────────────────────────────
// Game Mode rulesets: the items a game's inventory can hold
//
// A ruleset lists its items in catalogs that hold items. The inventory reads them through one book:
// which name is which item (a label, in any case), how many of one a stack holds, and what the
// screen and the Game Master are shown about it. The server builds the book from the catalogs it
// loads and the browser from the ones it fetches, so both read an item the same way.
// ──────────────────────────────────────────────
import { RULESET_ITEM_CHARGES_MAX, rulesetItemIssues, } from "../../schemas/ruleset.schema.js";
import { normalizeCharacterLookupName } from "../../utils/character-lookup-name.js";
import { gameInventoryBagKey, gameInventoryCoinRef, gameInventoryNameKey, } from "../../utils/game-inventory-stacks.js";
import { inventRulesetItem, rulesetInventedItemId, rulesetInventedItemRef, rulesetInventedItemText, rulesetDefenseLabel, rulesetProposalParts, RULESET_INVENTED_ITEMS_MAX, } from "./invented-items.js";
import { catalogEntryHiddenByLayers, rulesetLayeredCurrencies } from "./layers.js";
import { defaultRulesetSheetBuild, evaluateRulesetSheet, resolveRulesetValueRef, } from "./sheet-math.js";
/** A fight effect's own words, for the Game Master, by effect id. The ones about the holder's own
 *  checks, saves and attacks are said as leans on those instead. */
const FIGHT_EFFECT_TEXT = {
    "attacks-against-advantage": "attacks against them have advantage",
    "attacks-against-disadvantage": "attacks against them have disadvantage",
    "attacks-against-adjacent-advantage": "attacks against them from next to them have advantage",
    "attacks-against-far-disadvantage": "attacks against them from afar have disadvantage",
    "attacks-from-adjacent-critical": "a hit on them from next to them is critical",
    "cannot-act": "cannot act",
    "cannot-react": "cannot react",
    "speed-zero": "cannot move",
    "resist-all": "takes half of every harm",
};
/** The item stats a weapon's attack reads (`{ "stat": id }` anywhere in it). */
export function rulesetItemAttackStats(attack) {
    const reads = [
        attack.toHit.abilities,
        attack.toHit.skill,
        attack.toHit.bonus,
        attack.toHit.target,
        attack.damage.dice,
        attack.damage.abilities,
        attack.damage.bonus,
        attack.damage.type,
        attack.reach,
        attack.range?.normal,
        attack.range?.long,
        attack.versatile?.dice,
        attack.clip?.max,
        attack.floor,
    ];
    const ids = reads.flatMap((value) => value && typeof value === "object" && !Array.isArray(value) && "stat" in value ? [value.stat] : []);
    return [...new Set(ids)];
}
/** A sum as the item facts write one: the first part as it is, then each with its sign. Nothing is
 *  0. */
function factSum(parts) {
    const kept = parts.filter((part) => part !== "" && part !== 0);
    if (kept.length === 0)
        return "0";
    return kept
        .map((part, index) => {
        if (typeof part === "string")
            return index === 0 ? part : `+ ${part}`;
        if (index === 0)
            return String(part);
        return part < 0 ? `- ${-part}` : `+ ${part}`;
    })
        .join(" ");
}
/** An item's use as facts, each number read off the item's stat where it says so. */
function rulesetItemUseFacts(definition, item, use) {
    const labelOf = (words, id) => words.find((word) => word.id === id)?.label ?? id;
    const read = (value) => {
        if (value === null || typeof value !== "object" || Array.isArray(value))
            return value;
        const stat = value.stat;
        return typeof stat === "string" ? item.stats?.[stat] : undefined;
    };
    const number = (value) => {
        const found = read(value);
        return typeof found === "number" && Number.isFinite(found) ? found : undefined;
    };
    const amount = (value) => value ? factSum([value.dice ?? "", value.flat ?? 0]) : "";
    const attackFact = use.toHit
        ? rulesetItemAttackFacts(definition, item, { budget: "", toHit: use.toHit, damage: {} })
        : undefined;
    const difficulty = number(use.saveDifficulty);
    const gateDifficulty = use.gate ? rulesetItemGateDifficulty(item, use.gate) : undefined;
    const held = item.charges ? number(item.charges.max) : undefined;
    // As a fight reads it: a stat's number held to the most a written count may be.
    const max = held === undefined ? undefined : Math.min(RULESET_ITEM_CHARGES_MAX, Math.trunc(held));
    const dealt = amount(use.amount);
    const temporary = amount(use.temporary);
    return {
        ...(!use.free && use.budget ? { budget: labelOf(definition.combat?.economy.budgets ?? [], use.budget) } : {}),
        kind: use.kind,
        ...(dealt ? { amount: dealt } : {}),
        ...(use.damageType ? { type: use.damageType } : {}),
        ...(use.attackRoll && attackFact
            ? {
                toHit: attackFact.toHit + (attackFact.proficiency ? " + proficiency" : ""),
                ...(attackFact.target !== undefined ? { target: attackFact.target } : {}),
            }
            : {}),
        ...(use.save
            ? {
                save: {
                    save: labelOf(definition.sheet.saves, use.save.save),
                    ...(difficulty !== undefined ? { difficulty } : {}),
                    onSuccess: use.save.onSuccess,
                },
            }
            : {}),
        ...(use.applies?.length
            ? { applies: use.applies.map((entry) => labelOf(definition.sheet.live.conditions, entry.condition)) }
            : {}),
        ...(temporary ? { temporary } : {}),
        ...(use.range !== undefined ? { range: use.range } : {}),
        ...(use.area ? { area: { shape: use.area.shape, size: use.area.size } } : {}),
        ...((use.range !== undefined || use.area) && definition.combat?.distance?.label
            ? { unit: definition.combat.distance.label }
            : {}),
        ...(use.consumes ? { consumes: true } : {}),
        ...(use.charges !== undefined && max !== undefined
            ? {
                charges: {
                    cost: use.charges,
                    max,
                    ...(item.charges?.recharge
                        ? {
                            recharge: {
                                rests: item.charges.recharge.rests.map((rest) => labelOf(definition.rests, rest)),
                                amount: item.charges.recharge.amount === "max" ? "max" : amount(item.charges.recharge.amount),
                            },
                        }
                        : {}),
                    ...(item.charges?.breaksOn ? { breaksOn: { ...item.charges.breaksOn } } : {}),
                },
            }
            : {}),
        ...(use.restore
            ? {
                restore: {
                    pool: labelOf(definition.sheet.live.pools, use.restore.pool),
                    amount: amount(use.restore.amount),
                },
            }
            : {}),
        ...(use.gate
            ? {
                gate: {
                    check: rulesetItemGateLabel(definition, use.gate),
                    ...(gateDifficulty !== undefined ? { difficulty: gateDifficulty } : {}),
                    ...(use.gate.unless
                        ? {
                            unless: {
                                ...rulesetValueRefLabel(definition, use.gate.unless.value),
                                atLeast: use.gate.unless.atLeast,
                            },
                        }
                        : {}),
                },
            }
            : {}),
    };
}
/** A weapon's attack as facts, each value read off the item's stat where it says so. */
function rulesetItemAttackFacts(definition, item, attack) {
    const stats = new Map((definition.items?.stats ?? []).map((stat) => [stat.id, stat]));
    const labelOf = (words, id) => words.find((word) => word.id === id)?.label ?? id;
    const read = (value) => {
        if (value === null || typeof value !== "object" || Array.isArray(value))
            return value;
        const stat = value.stat;
        return typeof stat === "string" ? item.stats?.[stat] : undefined;
    };
    const statLabel = (value) => {
        const stat = value && typeof value === "object" && !Array.isArray(value) ? value.stat : undefined;
        const read = stat !== undefined ? item.stats?.[stat] : value;
        if (typeof read !== "string" || !read)
            return undefined;
        const declared = stat !== undefined ? stats.get(stat) : undefined;
        return declared ? (statText(declared, read) ?? read) : read;
    };
    const abilities = (value) => {
        const ids = Array.isArray(value) ? value : typeof read(value) === "string" ? [read(value)] : [];
        return ids.map((id) => labelOf(definition.sheet.abilities, id)).join("/");
    };
    const number = (value) => {
        const found = read(value);
        return typeof found === "number" && Number.isFinite(found) ? found : 0;
    };
    const dice = (value) => {
        const found = read(value);
        return typeof found === "string" ? found : "";
    };
    const skill = read(attack.toHit.skill);
    const target = read(attack.toHit.target);
    const type = statLabel(attack.damage.type);
    const reach = number(attack.reach);
    const normal = attack.range ? number(attack.range.normal) : 0;
    const long = attack.range?.long !== undefined ? number(attack.range.long) : 0;
    const versatile = attack.versatile ? dice(attack.versatile.dice) : "";
    const unit = definition.combat?.distance?.label;
    const budgets = definition.combat?.economy.budgets ?? [];
    const clipMax = attack.clip ? number(attack.clip.max) : 0;
    const floor = attack.floor !== undefined ? number(attack.floor) : 0;
    return {
        budget: labelOf(budgets, attack.budget),
        toHit: factSum([
            abilities(attack.toHit.abilities),
            typeof skill === "string" ? labelOf(definition.sheet.skills, skill) : "",
            number(attack.toHit.bonus),
        ]),
        ...(attack.toHit.proficiency ? { proficiency: true } : {}),
        ...(typeof target === "number" ? { target } : {}),
        damage: factSum([dice(attack.damage.dice), abilities(attack.damage.abilities), number(attack.damage.bonus)]),
        ...(type ? { type } : {}),
        ...(reach > 0 ? { reach } : {}),
        ...(normal > 0 ? { range: { normal, ...(long > normal ? { long } : {}) } } : {}),
        ...((reach > 0 || normal > 0) && unit ? { unit } : {}),
        ...(versatile ? { versatile } : {}),
        ...(attack.ammo
            ? {
                ammo: {
                    what: labelOf(definition.items?.tags ?? [], attack.ammo.tag),
                    per: attack.ammo.perAttack ?? 1,
                    ...(attack.ammo.recover ? { recover: attack.ammo.recover } : {}),
                },
            }
            : {}),
        ...(attack.clip && clipMax >= 1 ? { clip: { max: clipMax, reload: labelOf(budgets, attack.clip.reload) } } : {}),
        ...(attack.modes?.length
            ? {
                modes: attack.modes.map((mode) => ({
                    label: mode.label,
                    ...(mode.ammo !== undefined ? { ammo: mode.ammo } : {}),
                    ...(mode.toHit !== undefined ? { toHit: mode.toHit } : {}),
                    ...(mode.target !== undefined ? { target: mode.target } : {}),
                    ...(mode.targets !== undefined ? { targets: mode.targets } : {}),
                })),
            }
            : {}),
        ...(attack.offHand && definition.combat?.offHand
            ? { offHand: { budget: labelOf(budgets, definition.combat.offHand.budget) } }
            : {}),
        ...(floor >= 1 ? { floor } : {}),
        ...(attack.onHit?.length
            ? {
                onHit: attack.onHit.map((entry) => ({
                    condition: labelOf(definition.sheet.live.conditions, entry.condition),
                    atLeast: entry.atLeast,
                    ...(entry.rounds !== undefined ? { rounds: entry.rounds } : {}),
                })),
            }
            : {}),
    };
}
/** A gate's difficulty as a fight and the Use button read it: written, or the item's own stat, a
 *  whole number from 1 to 100. Undefined when it names a stat the item does not give. */
export function rulesetItemGateDifficulty(item, gate) {
    const written = gate.difficulty;
    const found = typeof written === "number" ? written : item.stats?.[written.stat];
    return typeof found === "number" && Number.isFinite(found)
        ? Math.min(100, Math.max(1, Math.trunc(found)))
        : undefined;
}
/** What one bag's coins are worth, family by family, in each family's smallest coin, for the Game
 *  Master: "Coin worth 432 bits". Empty when the bag holds no coins. */
export function rulesetPurseText(book, stacks, holder) {
    const bag = gameInventoryBagKey(holder);
    const families = new Map();
    for (const coin of book.coins) {
        const family = coin.coin.family;
        const known = families.get(family) ?? { label: coin.facts.category, worth: 0, smallest: coin.name };
        if (coin.coin.value === 1)
            known.smallest = coin.name;
        known.worth +=
            coin.coin.value *
                stacks
                    .filter((stack) => stack.item === coin.item && gameInventoryBagKey(stack.holder) === bag)
                    .reduce((sum, stack) => sum + stack.quantity, 0);
        families.set(family, known);
    }
    return [...families.values()]
        .filter((family) => family.worth > 0)
        .map((family) => `${family.label} worth ${family.worth} ${family.smallest}`)
        .join(", ");
}
/** What a use's gate rolls, in the ruleset's own words: a skill's or an ability's label, or the value
 *  off the sheet it reads ("Wits modifier"). */
export function rulesetItemGateLabel(definition, gate) {
    const { check } = gate;
    if ("skill" in check)
        return definition.sheet.skills.find((entry) => entry.id === check.skill)?.label ?? check.skill;
    if ("ability" in check) {
        return definition.sheet.abilities.find((entry) => entry.id === check.ability)?.label ?? check.ability;
    }
    const { what, of } = rulesetValueRefLabel(definition, check.value);
    return of === "modifier" ? `${what} modifier` : what;
}
/** A value off the sheet by the ruleset's own label: an ability, a skill, a derived value. An ability's
 *  modifier (named directly or by a field) says so with `of`, a list's column is named with its list
 *  ("Weight (Gear)"), and a count of items names what it counts. An id stands in for a missing label. */
export function rulesetValueRefLabel(definition, ref) {
    const sheet = definition.sheet;
    const find = (entries, id) => entries?.find((entry) => entry.id === id)?.label ?? id;
    if (ref.const !== undefined)
        return { what: String(ref.const) };
    if (ref.abilityScore !== undefined)
        return { what: find(sheet.abilities, ref.abilityScore) };
    if (ref.abilityMod !== undefined)
        return { what: find(sheet.abilities, ref.abilityMod), of: "modifier" };
    if (ref.abilityModFromField !== undefined)
        return { what: find(sheet.fields, ref.abilityModFromField), of: "modifier" };
    if (ref.derived !== undefined)
        return { what: find(sheet.derived, ref.derived) };
    if (ref.field !== undefined)
        return { what: find(sheet.fields, ref.field) };
    if (ref.skillMod !== undefined)
        return { what: find(sheet.skills, ref.skillMod) };
    if (ref.saveMod !== undefined)
        return { what: find(sheet.saves, ref.saveMod) };
    if (ref.liveTrack !== undefined)
        return { what: find(sheet.live.tracks, ref.liveTrack) };
    if (ref.livePool !== undefined)
        return { what: find(sheet.live.pools, ref.livePool) };
    if (ref.listSum) {
        const list = sheet.lists.find((entry) => entry.id === ref.listSum.list);
        return { what: `${find(list?.columns, ref.listSum.column)} (${list?.label ?? ref.listSum.list})` };
    }
    const items = definition.items;
    const stat = ref.itemStat;
    if (stat.stat !== undefined)
        return { what: find(items?.stats, stat.stat) };
    const kinds = [
        stat.tag !== undefined ? find(items?.tags, stat.tag) : undefined,
        stat.category !== undefined ? find(items?.categories, stat.category) : undefined,
        stat.slot !== undefined ? find(items?.slots, stat.slot) : undefined,
    ];
    return { what: kinds.filter(Boolean).join(" "), of: "items" };
}
/** A requirement's value as the Game Master reads it: "Sinew", "Sinew modifier", "Heavy items". */
function requirementValueText(need) {
    if (need.of === "modifier")
        return `${need.what} modifier`;
    if (need.of === "items")
        return need.what ? `${need.what} items` : "items";
    return need.what;
}
/** One worn or carried effect as facts: each lean, each number and each set of saves it fails. */
export function rulesetItemEffectFacts(definition, effect) {
    const skillLabel = (id) => definition.sheet.skills.find((skill) => skill.id === id)?.label ?? id;
    const saveLabel = (id) => definition.sheet.saves.find((save) => save.id === id)?.label ?? id;
    const names = (to, ids) => (ids ?? []).map(to === "checks" ? skillLabel : saveLabel);
    const facts = [];
    // The ruleset's own word for defense where it names one ("Guard"); a defense written as a number
    // has no name, and reads as "defense".
    const defense = rulesetDefenseLabel(definition) ?? "";
    for (const one of effect.effects ?? []) {
        const own = /^own-(checks|saves|attacks)-(advantage|disadvantage)$/.exec(one);
        if (!own) {
            facts.push({ to: "effect", names: [], change: { effect: one } });
            continue;
        }
        const to = own[1];
        const mode = own[2];
        const narrowed = to === "attacks" ? [] : names(to, to === "checks" ? effect.skills : effect.saves);
        facts.push({ to, names: narrowed, change: { mode } });
    }
    for (const modifier of effect.modifiers ?? []) {
        const to = modifier.to;
        const narrowed = to === "checks" || to === "saves"
            ? names(to, to === "checks" ? (modifier.skills ?? effect.skills) : (modifier.saves ?? effect.saves))
            : to === "defense" && defense
                ? [defense]
                : [];
        const dice = modifier.dice ? `${modifier.minus ? "-" : "+"}${modifier.dice}` : "";
        const flat = modifier.flat ? `${modifier.flat > 0 ? "+" : ""}${modifier.flat}` : "";
        if (dice || flat)
            facts.push({ to, names: narrowed, change: { value: `${dice}${flat}` } });
        if (modifier.times)
            facts.push({ to: "speed", names: [], change: { times: modifier.times } });
        if (modifier.mode)
            facts.push({ to, names: narrowed, change: { mode: modifier.mode } });
    }
    if (effect.failsSaves?.length) {
        facts.push({ to: "saves", names: names("saves", effect.failsSaves), change: { fails: true } });
    }
    for (const [id, change] of Object.entries(effect.abilities ?? {})) {
        const label = definition.sheet.abilities.find((ability) => ability.id === id)?.label ?? id;
        facts.push({
            to: "ability",
            names: [label],
            change: "set" in change ? { atLeast: change.set } : { value: `${change.add > 0 ? "+" : ""}${change.add}` },
        });
    }
    for (const hide of ["resist", "vulnerable", "immune"]) {
        if (effect[hide]?.length)
            facts.push({ to: "harm", names: [...effect[hide]], change: { hide } });
    }
    if (effect.conditionImmunities?.length) {
        const label = (id) => definition.sheet.live.conditions.find((entry) => entry.id === id)?.label ?? id;
        facts.push({ to: "conditions", names: effect.conditionImmunities.map(label), change: { hide: "immune" } });
    }
    return facts;
}
/** One effect fact in plain words, as the Game Master reads it: "-1 on checks (Sneak)", "+1 Brawn". */
export function rulesetItemEffectText(fact) {
    const change = fact.change;
    const list = fact.names.join(", ");
    if ("effect" in change)
        return FIGHT_EFFECT_TEXT[change.effect] ?? change.effect;
    if ("hide" in change) {
        return change.hide === "resist"
            ? `resists ${list}`
            : change.hide === "vulnerable"
                ? `vulnerable to ${list}`
                : `immune to ${list}`;
    }
    if ("times" in change)
        return change.times === 0.5 ? "half speed" : "double speed";
    if (fact.to === "defense" || fact.to === "speed") {
        return `${"value" in change ? change.value : ""} ${fact.to === "speed" ? "speed" : list || "defense"}`;
    }
    if (fact.to === "ability") {
        const ability = fact.names.join(", ");
        return "atLeast" in fact.change
            ? `${ability} at least ${fact.change.atLeast}`
            : `${"value" in fact.change ? fact.change.value : ""} ${ability}`;
    }
    const which = `${fact.to}${fact.names.length ? ` (${fact.names.join(", ")})` : ""}`;
    if ("fails" in change)
        return `fails ${which}`;
    return `${"mode" in change ? change.mode : "value" in change ? change.value : ""} on ${which}`;
}
function itemPrice(definition, cost, layerOptions) {
    const family = definition.items?.currencies?.find((each) => each.units.some((unit) => unit.id === cost.unit));
    const named = family?.units.find((unit) => unit.id === cost.unit);
    if (!family || !named)
        return cost;
    const left = rulesetLayeredCurrencies(definition, layerOptions).find((each) => each.id === family.id);
    if (!left)
        return undefined;
    if (left.units.some((unit) => unit.id === named.id))
        return { amount: cost.amount, unit: named.label };
    // The family's smallest coin, worth 1, is always left, so some coin pays the worth exactly.
    const worth = cost.amount * named.value;
    const unit = [...left.units].sort((a, b) => b.value - a.value).find((each) => worth % each.value === 0);
    return { amount: worth / unit.value, unit: unit.label };
}
function statText(stat, value) {
    if (stat.type === "boolean")
        return undefined;
    if (stat.type === "enum")
        return stat.valueLabels?.[String(value)] ?? String(value);
    return String(value);
}
/** An item's labels and stats, read against the ruleset's `items` block. A price named in a coin the
 *  game's layers took out is said at the same worth in the largest coin left that pays it exactly, and
 *  an item whose whole family of coins is gone has no price. */
export function rulesetItemFacts(definition, item, layerOptions) {
    const block = definition.items;
    const labelOf = (words, id) => words?.find((word) => word.id === id)?.label ?? id;
    const stats = (block?.stats ?? []).flatMap((stat) => {
        const value = item.stats?.[stat.id];
        if (value === undefined || value === false || value === "")
            return [];
        const text = statText(stat, value);
        return [
            { id: stat.id, label: stat.label, ...(text !== undefined ? { text } : {}), promptVisible: stat.promptVisible },
        ];
    });
    const cost = item.cost ? itemPrice(definition, item.cost, layerOptions) : undefined;
    const worn = item.worn ? rulesetItemEffectFacts(definition, item.worn) : [];
    const carried = item.carried ? rulesetItemEffectFacts(definition, item.carried) : [];
    const requires = (item.requires ?? []).map((requirement) => ({
        ...rulesetValueRefLabel(definition, requirement.value),
        atLeast: requirement.atLeast,
        otherwise: rulesetItemEffectFacts(definition, requirement.otherwise),
    }));
    return {
        category: labelOf(block?.categories, item.category),
        ...(item.rarity ? { rarity: labelOf(block?.rarities, item.rarity) } : {}),
        tags: (item.tags ?? []).map((tag) => labelOf(block?.tags, tag)),
        stats,
        ...(cost ? { cost } : {}),
        ...(worn.length ? { worn } : {}),
        ...(carried.length ? { carried } : {}),
        ...(requires.length ? { requires } : {}),
        ...(item.attack ? { attack: rulesetItemAttackFacts(definition, item, item.attack) } : {}),
        ...(item.use ? { use: rulesetItemUseFacts(definition, item, item.use) } : {}),
    };
}
/**
 * The book for a game: its ruleset's item catalogs, with the entries each has (`entries` by catalog
 * id; a catalog that could not be read is simply absent). `layerOptions` are the game's pinned layer
 * choices, which may take entries out. `plain` is whether something that is not one of these items
 * may be added: the ruleset's `freeform` for the player, and its `native` for the Game Master.
 * `invented` are the items the Game Master has invented in this game (read with
 * `readRulesetInventedItems`); the Game Master's book (`actor: "game-master"`) can invent more.
 */
export function rulesetItemBook(definition, entries, options = {}) {
    const carryStat = definition.items?.carry?.stat;
    const bookEntry = (ref, catalogId, entry) => {
        const weight = carryStat ? entry.item.stats?.[carryStat] : undefined;
        const facts = rulesetItemFacts(definition, entry.item, options.layerOptions);
        const charges = facts.use?.charges;
        return {
            item: ref,
            name: entry.label,
            ...(entry.item.stack !== undefined ? { stack: entry.item.stack } : {}),
            ...(typeof weight === "number" && weight > 0 ? { weight } : {}),
            ...(entry.item.slots && Object.keys(entry.item.slots).length > 0 ? { slots: entry.item.slots } : {}),
            ...(entry.item.binds ? { binds: { ...(entry.item.binds.cursed ? { cursed: true } : {}) } } : {}),
            ...(entry.item.service ? { service: true } : {}),
            ...(charges
                ? {
                    charges: {
                        cost: charges.cost,
                        max: charges.max,
                        ...(charges.breaksOn ? { breaksOn: charges.breaksOn } : {}),
                    },
                }
                : {}),
            catalogId,
            entry,
            ...(entry.summary ? { summary: entry.summary } : {}),
            facts,
        };
    };
    const all = new Map();
    const visible = [];
    const offered = new Set();
    const byName = new Map();
    for (const catalog of definition.catalogs ?? []) {
        if (catalog.holds !== "items")
            continue;
        for (const entry of entries[catalog.id] ?? []) {
            if (!entry.item)
                continue;
            const read = bookEntry(`${catalog.id}/${entry.id}`, catalog.id, { ...entry, item: entry.item });
            all.set(read.item, read);
            if (catalogEntryHiddenByLayers(definition, options.layerOptions, catalog.id, entry))
                continue;
            visible.push(read);
            offered.add(read.item);
            // Two items of one name: the first the ruleset lists is the one the name finds.
            const key = gameInventoryNameKey(entry.label);
            if (!byName.has(key))
                byName.set(key, read);
        }
    }
    // The items the Game Master invented, found by name after the ruleset's own. One name may have
    // several: each telling of a turn that proposed it made its own, and a switch back to an older
    // telling must still find the one it holds. A name finds the newest.
    const invented = new Map();
    const inventedByName = new Map();
    // What this book made, by id, with what the Game Master was told: the same reply read again (its
    // answers before the save, then its change after) finds the same item.
    const madeHere = new Map();
    const keep = (made) => {
        invented.set(made.id, made);
        const key = gameInventoryNameKey(made.name);
        inventedByName.set(key, [...(inventedByName.get(key) ?? []), made]);
        const ref = rulesetInventedItemRef(made.id);
        all.set(ref, {
            ...bookEntry(ref, "", {
                id: made.id,
                label: made.name,
                ...(made.summary ? { summary: made.summary } : {}),
                item: made.item,
            }),
            invented: { notes: made.notes ?? [] },
        });
        offered.add(ref);
    };
    for (const made of options.invented ?? []) {
        if (invented.size >= RULESET_INVENTED_ITEMS_MAX)
            break;
        if (!invented.has(made.id))
            keep(made);
    }
    // The ruleset's coins, a book entry each, so a stack of them weighs what its family says (one of
    // the carry stat for every `perWeight` of them), is placed by the carrying rule, and reads as itself.
    // They are no catalog's, so no picker list and no loot filter ever finds one among the items. A coin
    // a layer took out still reads as itself where it is held, and is otherwise never offered, paid,
    // earned or dropped.
    const coins = [];
    const families = new Map();
    const left = new Set(rulesetLayeredCurrencies(definition, options.layerOptions).flatMap((family) => family.units.map((unit) => unit.id)));
    for (const family of definition.items?.currencies ?? []) {
        const members = family.units
            .filter((unit) => left.has(unit.id))
            .map((unit) => ({ item: gameInventoryCoinRef(unit.id), name: unit.label, value: unit.value }))
            .sort((a, b) => b.value - a.value);
        for (const unit of family.units) {
            const read = {
                item: gameInventoryCoinRef(unit.id),
                name: unit.label,
                ...(family.perWeight ? { weight: 1 / family.perWeight } : {}),
                catalogId: "",
                entry: { id: unit.id, label: unit.label },
                facts: { category: family.label, tags: [], stats: [] },
                coin: { family: family.id, value: unit.value },
            };
            all.set(read.item, read);
            if (!left.has(unit.id))
                continue;
            offered.add(read.item);
            coins.push(read);
            families.set(read.item, members);
        }
    }
    /** The coin a name is: its id or label, one of it or many ("penny", "pennies"), any case. */
    const coinNamed = (name) => {
        const one = (text) => gameInventoryNameKey(text).replace(/ies$/, "y").replace(/s$/, "");
        const wanted = one(name);
        const found = coins.find((coin) => one(coin.entry.id) === wanted || one(coin.name) === wanted);
        return found
            ? { coin: { item: found.item, name: found.name, value: found.coin.value }, family: families.get(found.item) }
            : undefined;
    };
    const itemNamed = (name) => {
        const key = gameInventoryNameKey(name);
        const made = inventedByName.get(key)?.at(-1);
        const coin = coinNamed(name);
        return (byName.get(key) ?? (made ? all.get(rulesetInventedItemRef(made.id)) : coin ? all.get(coin.coin.item) : undefined));
    };
    /** The ruleset's own weapon of this category whose name shares the most words with `name` (a word
     *  counts where either holds the other, "crossbow" and "bow"), or the first of them. */
    const weaponLike = (category, name) => {
        const words = (text) => text
            .toLowerCase()
            .split(/[^\p{L}\p{N}]+/u)
            .filter((word) => word.length >= 3);
        const wanted = words(name);
        let best;
        let most = -1;
        for (const entry of visible) {
            if (entry.entry.item?.category !== category || !entry.entry.item.attack)
                continue;
            const shared = words(entry.name).filter((word) => wanted.some((each) => each.includes(word) || word.includes(each))).length;
            if (shared > most) {
                best = entry;
                most = shared;
            }
        }
        return best;
    };
    /** The proposal made again as a weapon like `weapon`: its attack, and the stats that attack reads
     *  which the proposal left out. Undefined when the item could not be worn with it. */
    const armedLike = (proposal, plain, weapon) => {
        const attack = weapon.entry.item.attack;
        const own = plain.item.stats ?? {};
        const theirs = weapon.entry.item.stats ?? {};
        const read = rulesetItemAttackStats(attack).filter((id) => own[id] === undefined && theirs[id] !== undefined);
        const stats = { ...Object.fromEntries(read.map((id) => [id, String(theirs[id])])), ...(proposal.stats ?? {}) };
        const made = read.length > 0 ? (inventRulesetItem(definition, { ...proposal, stats }, undefined) ?? plain) : plain;
        const item = { ...made.item, attack };
        return rulesetItemIssues(definition, item).length === 0 ? { ...made, item } : undefined;
    };
    const invent = (written, stacks) => {
        const proposal = rulesetProposalParts(definition, written);
        const text = rulesetInventedItemText(proposal);
        if (!text.name)
            return { refused: "unreadable" };
        const key = gameInventoryNameKey(text.name);
        const own = byName.get(key);
        if (own)
            return { item: own.item, notes: [`${own.name} is one of this ruleset's own items, so it is that item.`] };
        if (definition.items?.propose === false)
            return { refused: "no-invention" };
        // One of that name the game holds is that item: a proposal never changes it. So is one this
        // book made. Otherwise the proposal is an item of its own, even when an older one has the name
        // (another telling of the turn may still hold that one), and saving keeps only what is held.
        const named = inventedByName.get(key) ?? [];
        const held = named.find((made) => stacks.some((stack) => stack.item === rulesetInventedItemRef(made.id)));
        if (held)
            return { item: rulesetInventedItemRef(held.id), notes: [] };
        const again = named.find((made) => madeHere.has(made.id));
        if (again)
            return { item: rulesetInventedItemRef(again.id), notes: madeHere.get(again.id) };
        if (invented.size >= RULESET_INVENTED_ITEMS_MAX)
            return { refused: "too-many" };
        const likeText = proposal.like?.trim();
        const like = likeText ? (offered.has(likeText) ? all.get(likeText) : itemNamed(likeText)) : undefined;
        const plain = inventRulesetItem(definition, proposal, like?.entry.item);
        if (!plain || rulesetItemIssues(definition, plain.item).length > 0)
            return { refused: "unreadable" };
        const missed = likeText && !like ? [`No item "${likeText.slice(0, 60)}" to start from.`] : [];
        // A weapon proposed with nothing to start from fights as the ruleset's own weapon of its category
        // it is most like by name, or else the first: a small model describes the weapon and leaves
        // `like` out, and a weapon with no attack is never offered in a fight. The stats its attack reads
        // that the proposal left out come from that weapon, as `like` would bring them, and are held to
        // the rarity's caps with the rest. None of it applies to an item that could never be worn.
        const weapon = like || plain.item.attack ? undefined : weaponLike(plain.item.category, text.name);
        const armed = weapon ? armedLike(proposal, plain, weapon) : undefined;
        const made = armed ?? plain;
        const fights = armed ? [`It fights as ${weapon.name} does.`] : [];
        const notes = [...missed, ...made.notes, ...fights];
        const id = rulesetInventedItemId(text.name, (taken) => invented.has(taken));
        keep({ id, ...text, item: made.item, ...(notes.length ? { notes } : {}) });
        madeHere.set(id, [...missed, ...made.promptNotes, ...fights]);
        return { item: rulesetInventedItemRef(id), notes: madeHere.get(id) };
    };
    return {
        entries: visible,
        coins,
        ...(coins.length > 0 ? { coinNamed } : {}),
        itemOf: (item) => all.get(item),
        offers: (item) => offered.has(item),
        itemNamed,
        inventedItems: () => [...invented.values()],
        inventedChanged: () => madeHere.size > 0,
        ...(options.actor === "game-master" && definition.items ? { invent } : {}),
        plain: options.plain ?? "allow",
        ...(options.actor ? { actor: options.actor } : {}),
        ...(definition.items?.slots?.length
            ? { slots: definition.items.slots.map(({ id, label, count }) => ({ id, label, count })) }
            : {}),
        ...(definition.items?.carry || definition.items?.binding
            ? { bearer: rulesetItemBearers(definition, options.sheets) }
            : {}),
    };
}
/**
 * What each character carries and binds, read off their sheet: the ruleset's `carry` values and its
 * binding maximum, worked out once per character. These are read without live state (the ruleset is
 * checked for that at import), so a sheet's build is all they need.
 */
export function rulesetItemBearers(definition, sheets = {}) {
    const block = definition.items;
    const read = new Map();
    const buildOf = (holder) => {
        if (!holder)
            return sheets.player ?? defaultRulesetSheetBuild(definition);
        const key = normalizeCharacterLookupName(holder);
        return (sheets.members?.find((member) => normalizeCharacterLookupName(member.name) === key)?.build ??
            defaultRulesetSheetBuild(definition));
    };
    return (holder) => {
        const key = holder ? normalizeCharacterLookupName(holder) : "";
        const known = read.get(key);
        if (known)
            return known;
        const build = buildOf(holder);
        const evaluated = evaluateRulesetSheet(definition, build);
        const value = (ref) => ref ? resolveRulesetValueRef(definition, build, ref, evaluated) : undefined;
        const encumberedAbove = value(block?.carry?.encumberedAbove);
        const limit = value(block?.carry?.limit);
        const bindingMax = value(block?.binding?.max);
        const bearer = {
            ...(encumberedAbove !== undefined ? { encumberedAbove } : {}),
            ...(limit !== undefined ? { limit } : {}),
            ...(bindingMax !== undefined ? { bindingMax: Math.max(0, Math.floor(bindingMax)) } : {}),
        };
        read.set(key, bearer);
        return bearer;
    };
}
/**
 * The items one bag holds, as a sheet reads them (`itemStat`): each stack of one of the ruleset's
 * items in it, with whether it is worn. An item that takes slots is worn while equipped, one that
 * binds while bound, one that does both while both, and one that does neither never. A plain item is
 * none of the ruleset's and is left out. `holder` is as a stack has it, absent for the player.
 */
export function rulesetSheetItems(book, stacks, holder) {
    const bag = gameInventoryBagKey(holder);
    return stacks.flatMap((stack) => {
        if (!stack.item || gameInventoryBagKey(stack.holder) !== bag)
            return [];
        const item = book.itemOf(stack.item)?.entry.item;
        if (!item)
            return [];
        const takesSlots = Object.values(item.slots ?? {}).some((count) => count > 0);
        const binds = !!item.binds;
        const worn = (takesSlots || binds) && (!takesSlots || stack.equipped === true) && (!binds || stack.bound === true);
        return [
            {
                item,
                quantity: stack.quantity,
                worn,
                name: stack.name,
                stack: { id: stack.id, ref: stack.item, ...(stack.holder !== undefined ? { holder: stack.holder } : {}) },
                ...(stack.loaded !== undefined ? { loaded: stack.loaded } : {}),
                ...(stack.charges !== undefined ? { charges: stack.charges } : {}),
            },
        ];
    });
}
/** Each party card's items, as its sheet reads them: the card read for the player (the one named
 *  for who the chat plays as, else the first) reads the player's bag, and every other card its own,
 *  by its name, as the inventory keeps them. */
export function rulesetCardItems(book, stacks, cardNames, playerName) {
    const key = normalizeCharacterLookupName;
    const player = (playerName ? cardNames.find((name) => key(name) === key(playerName)) : undefined) ?? cardNames[0];
    return (cardName) => rulesetSheetItems(book, stacks, player !== undefined && key(cardName) === key(player) ? undefined : cardName);
}
/** The item catalogs a ruleset declares: the ones the book is built from. */
export function rulesetItemCatalogIds(definition) {
    return (definition.catalogs ?? []).filter((catalog) => catalog.holds === "items").map((catalog) => catalog.id);
}
/** An item's facts as one line for the Game Master: category, rarity and tags, then the stats the
 *  ruleset shows it, such as "Weapon, Common, Thrown; Damage 1d6, Reach close". */
export function rulesetItemPromptFacts(facts) {
    const kind = [facts.category, facts.rarity, ...facts.tags].filter(Boolean).join(", ");
    const stats = facts.stats
        .filter((stat) => stat.promptVisible)
        .map((stat) => (stat.text !== undefined ? `${stat.label} ${stat.text}` : stat.label))
        .join(", ");
    const effects = ["worn", "carried"].flatMap((when) => facts[when]?.length ? [`${when}: ${facts[when].map(rulesetItemEffectText).join(", ")}`] : []);
    const needs = (facts.requires ?? []).map((need) => `needs ${requirementValueText(need)} ${need.atLeast}, otherwise ${need.otherwise.map(rulesetItemEffectText).join(", ")}`);
    return [
        kind,
        stats,
        facts.cost ? `costs ${facts.cost.amount} ${facts.cost.unit}` : "",
        ...effects,
        ...needs,
        facts.attack ? rulesetItemAttackText(facts.attack) : "",
        facts.use ? rulesetItemUseText(facts.use) : "",
    ]
        .filter(Boolean)
        .join("; ");
}
/** A weapon's attack in the Game Master's words: "attack (Act): Brawn + 1 to hit, 1d6 + Brawn cut,
 *  reach 2 paces, range 10 to 20 paces, 1d8 with a hand free". */
/** One of a weapon's modes for the Game Master: its label, and what it changes. */
function rulesetItemModeText(mode) {
    const signed = (value) => (value > 0 ? `+${value}` : String(value));
    const parts = [
        mode.ammo !== undefined ? `${mode.ammo} shots` : "",
        mode.toHit !== undefined ? `${signed(mode.toHit)} to hit` : "",
        mode.target !== undefined ? `target ${signed(mode.target)}` : "",
        mode.targets !== undefined ? `up to ${mode.targets} targets` : "",
    ].filter(Boolean);
    return parts.length ? `${mode.label} (${parts.join(", ")})` : mode.label;
}
/** An item's use for the Game Master: what it spends, what it does, and what using it costs of it. */
export function rulesetItemUseText(use) {
    return `use (${use.budget ?? "free"}): ${[
        ...rulesetItemUseDoes(use),
        use.consumes ? "used up" : "",
        use.charges ? `spends ${use.charges.cost} of ${use.charges.max} charges` : "",
        use.charges?.recharge
            ? `regains ${use.charges.recharge.amount === "max" ? "all" : use.charges.recharge.amount} on ${use.charges.recharge.rests.join(" or ")}`
            : "",
        use.charges?.breaksOn
            ? `breaks on ${rulesetBreakFaces(use.charges.breaksOn)} on a d${use.charges.breaksOn.die} when emptied`
            : "",
        use.gate ? rulesetItemGateText(use.gate) : "",
    ]
        .filter(Boolean)
        .join(", ")}`;
}
/** A gate for the Game Master: "needs a Lore check against 13 first, unless Caster level is 3 or more;
 *  failed, it is used up for nothing". */
export function rulesetItemGateText(gate) {
    const against = gate.difficulty !== undefined ? ` against ${gate.difficulty}` : "";
    const unless = gate.unless
        ? `, unless ${gate.unless.what}${gate.unless.of === "modifier" ? " modifier" : ""} is ${gate.unless.atLeast} or more`
        : "";
    return `needs a ${gate.check} check${against} first${unless}; failed, it is used up for nothing`;
}
/** What using an item does, as the Game Master's parts of it, leaving out what it spends. */
export function rulesetItemUseDoes(use) {
    const does = use.kind === "heal"
        ? use.amount
            ? `heals ${use.amount}`
            : "heals"
        : use.amount
            ? [use.amount, use.type].filter(Boolean).join(" ")
            : "";
    return [
        does,
        use.toHit ? `${use.toHit} to hit${use.target !== undefined ? ` at ${use.target}` : ""}` : "",
        use.save
            ? `${use.save.save}${use.save.difficulty !== undefined ? ` ${use.save.difficulty}` : ""} save${use.save.onSuccess === "half" ? " for half" : use.save.onSuccess === "negates" ? " negates it" : ""}`
            : "",
        ...(use.applies ?? []),
        use.temporary ? `${use.temporary} temporary` : "",
        use.restore ? `restores ${use.restore.amount} ${use.restore.pool}` : "",
        use.range !== undefined ? `range ${use.range}${use.unit ? ` ${use.unit}` : ""}` : "",
        use.area ? `${use.area.shape} ${use.area.size}${use.unit ? ` ${use.unit}` : ""}` : "",
    ].filter(Boolean);
}
export function rulesetItemAttackText(attack) {
    const unit = attack.unit ? ` ${attack.unit}` : "";
    const toHit = `${attack.toHit}${attack.proficiency ? " + proficiency" : ""} to hit${attack.target !== undefined ? ` at ${attack.target}` : ""}`;
    const range = attack.range
        ? `range ${attack.range.normal}${attack.range.long !== undefined ? ` to ${attack.range.long}` : ""}${unit}`
        : "";
    return `attack (${attack.budget}): ${[
        toHit,
        [attack.damage, attack.type].filter(Boolean).join(" "),
        attack.reach !== undefined ? `reach ${attack.reach}${unit}` : "",
        range,
        attack.versatile ? `${attack.versatile} with a hand free` : "",
        attack.ammo
            ? `ammunition ${attack.ammo.what} (${attack.ammo.per} an attack${attack.ammo.recover ? `, ${Math.round(attack.ammo.recover * 100)}% picked up after a won fight` : ""})`
            : "",
        attack.clip ? `holds ${attack.clip.max}, reload (${attack.clip.reload})` : "",
        attack.modes?.length ? `modes ${attack.modes.map(rulesetItemModeText).join(", ")}` : "",
        attack.offHand ? `off hand (${attack.offHand.budget})` : "",
        attack.floor !== undefined ? `at least ${attack.floor} on a hit before resistance` : "",
        ...(attack.onHit ?? []).map((entry) => `${entry.condition}${entry.rounds !== undefined ? ` for ${entry.rounds} rounds` : ""} when a hit deals ${entry.atLeast} or more`),
    ]
        .filter(Boolean)
        .join(", ")}`;
}
/** The faces an item breaks on when its last charge is spent: "a 1", or "1 to 3". */
export function rulesetBreakFaces(breaks) {
    return breaks.atMost === 1 ? "a 1" : `1 to ${breaks.atMost}`;
}
//# sourceMappingURL=item-book.js.map