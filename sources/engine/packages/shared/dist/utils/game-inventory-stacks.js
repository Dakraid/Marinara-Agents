/**
 * Game Mode's inventory as stacks.
 *
 * The inventory is a list of stacks, and two stacks may hold the same item: a player can split 300
 * apples into 200 and 100, and both stay apart until the player merges them again. So every stack
 * has an id, and everything that points at ONE stack (the inventory screen) uses it.
 *
 * Every stack is also some ITEM, and every stack of an item agrees on which (`gameInventoryItemId`).
 * A stack keeps the item's own name, the name it was made with, and a rename only gives it a
 * `nickname` to be shown by instead. So identity, merging, totals and fights never follow what the
 * player calls a stack. What names an item (the Game Master's `[inventory: ...]` tag, a fight
 * spending one) finds it by its own name or by any nickname a stack of it has.
 *
 * A stack can also be one of the game's ruleset's items (`item`, "<catalog>/<entry>"), which is then
 * its identity, whatever it is called. A plain item's id is worked out from its own name, so a plain
 * stack stores none. What a ruleset says about its items (which names are its items, how many one
 * stack holds, whether anything else may be added) reaches the changes as `GameInventoryItemRules`.
 *
 * Every stack is in somebody's bag. `holder` names the party member who carries it, as their card
 * names them; a stack without one is the player's own, which is every stack saved before there were
 * bags. The whole list is the shared view, so a bag is simply the stacks with one holder.
 *
 * Every function is pure and returns the same array when nothing changed, so a caller can tell a
 * refused change from an accepted one by reference.
 */
import { normalizeCharacterLookupName } from "./character-lookup-name.js";
/** The longest holder name kept, as long as any name a card may have. */
export const GAME_INVENTORY_HOLDER_MAX_LENGTH = 80;
/** The longest item name or nickname kept. */
export const GAME_INVENTORY_NAME_MAX_LENGTH = 120;
/** The most one stack may hold. Far past any real pile, and small enough to stay an exact integer
 *  through every sum a screen or a prompt makes of it. */
export const GAME_INVENTORY_MAX_QUANTITY = 999_999;
/** What a stack's `item` looks like: a catalog id and one of its entries' ids, `invented:` and the id
 *  of an item the Game Master invented, or `coin:` and the id of one of the ruleset's coins. No catalog
 *  id has a colon, so none can share an id with another, nor with a plain item's `plain:` one. */
export const GAME_INVENTORY_ITEM_REF_PATTERN = /^(?:(?:[a-z][a-z0-9_]{0,39}\/|invented:)[a-z0-9]+(?:-[a-z0-9]+)*|coin:[a-z][a-z0-9_]{0,39})$/;
/** A stack of one of the ruleset's coins is held as this `item`: coins are stacks, so a purse is the
 *  coins in one bag. */
export const GAME_INVENTORY_COIN_PREFIX = "coin:";
/** The `item` of a coin, by its unit's id. */
export function gameInventoryCoinRef(unit) {
    return `${GAME_INVENTORY_COIN_PREFIX}${unit}`;
}
/** The longest `item` kept: the longest catalog id, a slash and the longest entry id. */
const GAME_INVENTORY_ITEM_REF_MAX_LENGTH = 121;
/** The most new stacks one change may start, so a small stack size can never flood a bag. */
export const GAME_INVENTORY_MAX_NEW_STACKS = 50;
/** The one spelling two names are compared by: trimmed, single-spaced, any case. */
export function gameInventoryNameKey(name) {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
}
function cleanName(name) {
    return name.trim().replace(/\s+/g, " ");
}
/** The name a stack is shown by: its nickname, or the item's own name when it has none. */
export function gameInventoryStackLabel(stack) {
    return stack.nickname ?? stack.name;
}
/** A short, stable fingerprint of a name, for ids that cannot be spelled out (FNV-1a). */
function fingerprint(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(36);
}
/**
 * The id of the item a name makes: `plain:` and the name in lowercase letters and digits of any
 * script, joined by dashes, so "Rope", "rope" and "ROPE!" are one item and "Меч" keeps its letters.
 * A name with no letter or digit (an emoji, "???") gets a fingerprint instead, and a very long one
 * keeps its start and a fingerprint of the whole, so two names never share an id by being cut short.
 */
export function gameInventoryPlainItemId(name) {
    // Accents come off Latin, Greek and Cyrillic letters only ("Épée" is "epee"); in other scripts a mark
    // is part of the letter (a Japanese dakuten, a Devanagari vowel sign), so it stays.
    const key = gameInventoryNameKey(name)
        .normalize("NFKD")
        .replace(/([\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}])\p{M}+/gu, "$1")
        .normalize("NFC");
    // A sign in front of a number is part of the name, so "Sword +1" and "Sword -1" stay two items; a
    // dash right after a letter or digit is only a hyphen. Every other mark between words is a dash.
    const dashed = key
        .replace(/(\+)(?=\p{N})|(?<![\p{L}\p{N}\p{M}])([-\u2212])(?=\p{N})|[^\p{L}\p{N}\p{M}]/gu, (_, plus, minus) => plus ? "-+" : minus ? "-\u2212" : "-")
        .replace(/-+/g, "-");
    // Leading and trailing dashes are trimmed by walking in from each end, not by an anchored pattern,
    // which could backtrack over a long run of dashes in a name the player typed.
    let start = 0;
    let end = dashed.length;
    while (start < end && dashed[start] === "-")
        start += 1;
    while (end > start && dashed[end - 1] === "-")
        end -= 1;
    const spelled = [...dashed.slice(start, end)];
    if (spelled.length === 0)
        return `plain:~${fingerprint(key)}`;
    if (spelled.length > 40)
        return `plain:${spelled.slice(0, 32).join("")}-${fingerprint(key)}`;
    return `plain:${spelled.join("")}`;
}
/** Which item a stack is: the ruleset item it names, or the plain item its own name makes. Every
 *  stack of an item agrees, whatever its nickname. */
export function gameInventoryItemId(stack) {
    return stack.item ?? gameInventoryPlainItemId(stack.name);
}
/** The most one stack of an item holds: what its ruleset says, within the inventory's own bound. */
function stackLimit(item, rules) {
    return Math.min(GAME_INVENTORY_MAX_QUANTITY, rules?.itemOf(item)?.stack ?? GAME_INVENTORY_MAX_QUANTITY);
}
/** Loads are sums of weights that may be fractions (a quarter-pound dart), so they are compared to a
 *  character's limits with this much slack. */
const LOAD_SLACK = 1e-9;
/** What one of a stack's item weighs under the rules: nothing for a plain item. */
function weightOf(stack, rules) {
    return stack.item ? (rules?.itemOf(stack.item)?.weight ?? 0) : 0;
}
/** What one bag weighs: every stack in it, its weight times how many. */
export function gameInventoryLoad(stacks, holder, rules) {
    const bag = { holder };
    return stacks.reduce((load, stack) => load + (inBag(stack, bag) ? weightOf(stack, rules) * stack.quantity : 0), 0);
}
/** Whether `weight` more would take this bag's bearer past the most they can carry. */
function pastLimit(stacks, holder, weight, rules) {
    if (weight <= 0)
        return false;
    const limit = rules?.bearer?.(holder).limit;
    return limit !== undefined && gameInventoryLoad(stacks, holder, rules) + weight > limit + LOAD_SLACK;
}
/** Whether a stack is a bound cursed item the player cannot part with. */
function keptByCurse(stack, rules) {
    return (rules?.actor === "player" &&
        stack.bound === true &&
        stack.item !== undefined &&
        rules.itemOf(stack.item)?.binds?.cursed === true);
}
/** A holder as it is kept: cleaned, and absent for nobody in particular. */
export function cleanGameInventoryHolder(holder) {
    if (typeof holder !== "string")
        return undefined;
    const cleaned = cleanName(holder).slice(0, GAME_INVENTORY_HOLDER_MAX_LENGTH);
    // A name with no letter or digit in it keys to nothing, which cannot be told apart from the
    // player's own bag, so it is the player's.
    return cleaned && normalizeCharacterLookupName(cleaned) ? cleaned : undefined;
}
/** The key two bags are compared by, matched the way a `who=` is: case and accents aside. The
 *  player's own bag is the empty key. */
export function gameInventoryBagKey(holder) {
    return holder ? normalizeCharacterLookupName(holder) : "";
}
function inBag(stack, bag) {
    return gameInventoryBagKey(stack.holder) === gameInventoryBagKey(bag.holder);
}
function withHolder(stack, holder) {
    const { holder: _dropped, ...rest } = stack;
    return (holder ? { ...rest, holder } : rest);
}
/** A stack as it is kept: the nickname only when it is not the item's own name. */
function makeStack(stack) {
    const { id, name, nickname, item, quantity, holder, equipped, bound, loaded, charges } = stack;
    const named = nickname && gameInventoryNameKey(nickname) !== gameInventoryNameKey(name) ? { nickname } : {};
    return {
        id,
        name,
        ...named,
        ...(item ? { item } : {}),
        quantity,
        ...(holder ? { holder } : {}),
        ...(equipped ? { equipped: true } : {}),
        ...(bound ? { bound: true } : {}),
        ...(loaded !== undefined && quantity === 1 ? { loaded } : {}),
        ...(charges !== undefined && quantity === 1 ? { charges } : {}),
    };
}
/** Whether a stack is worn or bound: one item, kept apart from the rest of its kind. */
export function gameInventoryStackWorn(stack) {
    return stack.equipped === true || stack.bound === true;
}
/** A stack as it is once it leaves the one who wore it: neither worn nor bound. */
function unworn(stack) {
    const { equipped: _equipped, bound: _bound, ...rest } = stack;
    return rest;
}
function readItemRef(raw) {
    return typeof raw === "string" &&
        raw.length <= GAME_INVENTORY_ITEM_REF_MAX_LENGTH &&
        GAME_INVENTORY_ITEM_REF_PATTERN.test(raw)
        ? raw
        : undefined;
}
function clampQuantity(quantity) {
    return Math.max(0, Math.min(GAME_INVENTORY_MAX_QUANTITY, Math.floor(quantity)));
}
function slug(name) {
    const dashed = gameInventoryNameKey(name).replace(/[^a-z0-9]+/g, "-");
    // Leading and trailing dashes are trimmed by walking in from each end, not by an anchored pattern,
    // which could backtrack over a long run of dashes in a name the player typed.
    let start = 0;
    let end = dashed.length;
    while (start < end && dashed[start] === "-")
        start += 1;
    while (end > start && dashed[end - 1] === "-")
        end -= 1;
    return dashed.slice(start, Math.min(end, start + 40)) || "item";
}
/** A fresh id no stack in `stacks` has. */
export function newGameInventoryStackId(stacks) {
    const taken = new Set(stacks.map((stack) => stack.id));
    for (;;) {
        const id = `st-${Math.random().toString(36).slice(2, 10)}`;
        if (!taken.has(id))
            return id;
    }
}
/**
 * Stacks as they are stored, read tolerantly. An entry with no name is dropped, and a quantity that
 * is missing, broken or below one reads as one, as it always has. A nickname that is the item's own
 * name again, in any case, is dropped.
 *
 * An entry saved before stacks had ids gets one here, worked out from its name and how many entries
 * of that name came before it. The same saved list therefore reads with the same ids every time,
 * which keeps a selection on screen across a reload, and the id is stored with the next change.
 */
export function normalizeGameInventoryStacks(raw) {
    if (!Array.isArray(raw))
        return [];
    const entries = raw.flatMap((entry) => {
        if (!entry || typeof entry !== "object")
            return [];
        const source = entry;
        const name = typeof source.name === "string" ? cleanName(source.name) : "";
        if (!name)
            return [];
        const parsed = typeof source.quantity === "number" ? source.quantity : Number.parseInt(String(source.quantity ?? ""), 10);
        const quantity = Number.isFinite(parsed) && parsed > 0 ? Math.min(GAME_INVENTORY_MAX_QUANTITY, Math.floor(parsed)) : 1;
        const stored = typeof source.id === "string" ? source.id.trim() : "";
        const nickname = typeof source.nickname === "string"
            ? cleanName(source.nickname).slice(0, GAME_INVENTORY_NAME_MAX_LENGTH) || undefined
            : undefined;
        return [
            {
                name,
                nickname,
                item: readItemRef(source.item),
                // Worn and bound are one item each, so a stack saved with more is read as a plain stack.
                equipped: source.equipped === true && quantity === 1,
                bound: source.bound === true && quantity === 1,
                loaded: typeof source.loaded === "number" && Number.isInteger(source.loaded) && source.loaded >= 0
                    ? Math.min(GAME_INVENTORY_MAX_QUANTITY, source.loaded)
                    : undefined,
                charges: typeof source.charges === "number" && Number.isInteger(source.charges) && source.charges >= 0
                    ? Math.min(GAME_INVENTORY_MAX_QUANTITY, source.charges)
                    : undefined,
                quantity,
                stored,
                holder: cleanGameInventoryHolder(source.holder),
            },
        ];
    });
    // Every stored id is reserved before any is worked out, so an entry saved without one can never
    // take the id of a stack saved after it. A stored id that repeats is kept by its first holder only.
    const used = new Set();
    const keeps = entries.map((entry) => {
        if (!entry.stored || used.has(entry.stored))
            return false;
        used.add(entry.stored);
        return true;
    });
    const seenByName = new Map();
    return entries.map((entry, index) => {
        const key = gameInventoryNameKey(entry.name);
        const occurrence = seenByName.get(key) ?? 0;
        seenByName.set(key, occurrence + 1);
        const { stored, ...kept } = entry;
        if (keeps[index])
            return makeStack({ ...kept, id: stored });
        let id = `st-${slug(entry.name)}-${occurrence}`;
        while (used.has(id))
            id = `${id}-x`;
        used.add(id);
        return makeStack({ ...kept, id });
    });
}
/** The items among `stacks` whose own name a name is, spelling aside: a plain item and a ruleset item
 *  may both be called it. */
export function gameInventoryItemsOwnNamed(stacks, name) {
    const own = gameInventoryPlainItemId(name);
    return new Set(stacks.filter((stack) => gameInventoryPlainItemId(stack.name) === own).map((stack) => gameInventoryItemId(stack)));
}
/**
 * The items a name means among `stacks`: the items whose own name it is, when a stack of one is
 * there; otherwise every item a stack of which is nicknamed that, ignoring case; otherwise the plain
 * item the name would make. So an item's own name always wins over another item's nickname.
 */
function itemsNamed(stacks, name) {
    if (!gameInventoryNameKey(name))
        return new Set();
    const own = gameInventoryPlainItemId(name);
    const ownNamed = gameInventoryItemsOwnNamed(stacks, name);
    if (ownNamed.size > 0)
        return ownNamed;
    const key = gameInventoryNameKey(name);
    const nicknamed = stacks.filter((stack) => stack.nickname && gameInventoryNameKey(stack.nickname) === key);
    return new Set(nicknamed.length > 0 ? nicknamed.map(gameInventoryItemId) : [own]);
}
/**
 * The items a name means, read against one bag's stacks when `from` is given (as a take or a give by
 * name reads it). Settled before a change, so what the change did can be counted afterwards by item,
 * even once the stacks the name was found on are gone.
 */
export function gameInventoryItemsNamed(stacks, name, from) {
    return itemsNamed(from ? stacks.filter((stack) => inBag(stack, from)) : stacks, name);
}
/** How many stacks of these items hold, across every bag or in one bag's. */
export function gameInventoryCountItems(stacks, items, from) {
    return stacks.reduce((total, stack) => total + (items.has(gameInventoryItemId(stack)) && (!from || inBag(stack, from)) ? stack.quantity : 0), 0);
}
/** One line per item: every stack of an item added together, in the order the items first appear,
 *  shown by the first stack's name. What the Game Master and a fight read, since a split is the
 *  player's own arrangement. */
export function gameInventoryTotals(stacks, 
/** What a stack's item holds of its charges, for an item that holds any. */
chargesOf) {
    const totals = new Map();
    for (const stack of stacks) {
        const item = gameInventoryItemId(stack);
        const line = totals.get(item) ??
            totals
                .set(item, {
                name: gameInventoryStackLabel(stack),
                quantity: 0,
                ...(stack.nickname ? { ownName: stack.name } : {}),
                ...(stack.item ? { item: stack.item } : {}),
            })
                .get(item);
        line.quantity += stack.quantity;
        if (stack.equipped)
            line.equipped = (line.equipped ?? 0) + stack.quantity;
        if (stack.bound)
            line.bound = (line.bound ?? 0) + stack.quantity;
        const charges = chargesOf?.(stack);
        if (charges)
            line.charges = [...(line.charges ?? []), charges];
    }
    return [...totals.values()];
}
/**
 * The lines a fight lists: `gameInventoryTotals`, each under a name no other line has, since a fight
 * tells items apart by name. A nickname that another line also goes by is shown with the item's own
 * name, such as "Potion (Cord)" beside a real "Potion", and a name still taken after that gets a
 * number. `ownName` stays what a spend is taken by.
 */
export function gameInventoryFightLines(stacks) {
    const totals = gameInventoryTotals(stacks);
    const uses = new Map();
    for (const line of totals) {
        const key = gameInventoryNameKey(line.name);
        uses.set(key, (uses.get(key) ?? 0) + 1);
    }
    const taken = new Set();
    return totals.map((line) => {
        const base = line.ownName && (uses.get(gameInventoryNameKey(line.name)) ?? 0) > 1
            ? `${line.name} (${line.ownName})`
            : line.name;
        let name = base;
        for (let n = 2; taken.has(gameInventoryNameKey(name)); n += 1)
            name = `${base} ${n}`;
        taken.add(gameInventoryNameKey(name));
        // A line listed under anything but the item's own name says what that own name is, which is what
        // a spend is taken by.
        const ownName = line.ownName ?? (name === line.name ? undefined : line.name);
        return { ...line, name, ...(ownName ? { ownName } : {}), shown: line.name };
    });
}
/**
 * A fight's item effects, each under the name of the line it belongs to. Every line first takes the
 * effect named by its item's own name, since a line's listed name may be one another item really
 * goes by (a cord nicknamed "Potion" is listed as "Potion (Cord)" beside an item called that). A
 * line with none then takes one named as it is listed or shown, unless another line took that effect
 * by its own name. Effects no line takes are kept as they are.
 */
export function gameInventoryFightEffects(lines, effects) {
    const byName = (name) => name ? effects.find((effect) => gameInventoryNameKey(effect.name) === gameInventoryNameKey(name)) : undefined;
    const given = new Map();
    for (const line of lines) {
        const effect = byName(line.ownName ?? line.shown);
        if (effect)
            given.set(line.name, effect);
    }
    const claimed = new Set(given.values());
    for (const line of lines) {
        if (given.has(line.name))
            continue;
        const effect = [line.name, line.shown].map(byName).find((found) => found && !claimed.has(found));
        if (effect)
            given.set(line.name, effect);
    }
    const used = new Set(given.values());
    return [
        ...lines.flatMap((line) => {
            const effect = given.get(line.name);
            return effect ? [effect.name === line.name ? effect : { ...effect, name: line.name }] : [];
        }),
        ...effects.filter((effect) => !used.has(effect)),
    ];
}
/** Each bag's own totals, the player's first and then in the order a holder first appears. Only bags
 *  that hold something are listed. */
export function gameInventoryBags(stacks, chargesOf) {
    const bags = new Map([["", { stacks: [] }]]);
    for (const stack of stacks) {
        const key = gameInventoryBagKey(stack.holder);
        const bag = bags.get(key) ?? { ...(stack.holder ? { holder: stack.holder } : {}), stacks: [] };
        bag.stacks.push(stack);
        bags.set(key, bag);
    }
    return [...bags.values()]
        .filter((bag) => bag.stacks.length > 0)
        .map((bag) => ({
        ...(bag.holder ? { holder: bag.holder } : {}),
        items: gameInventoryTotals(bag.stacks, chargesOf),
    }));
}
/** How many of an item there are, across all its stacks, or in one bag's. */
export function gameInventoryCount(stacks, name, from) {
    const scope = from ? stacks.filter((stack) => inBag(stack, from)) : stacks;
    const items = itemsNamed(scope, name);
    return scope.reduce((total, stack) => total + (items.has(gameInventoryItemId(stack)) ? stack.quantity : 0), 0);
}
/**
 * `amount` of the item `like` is into one bag: onto the bag's stacks of that item in order, each up to
 * `limit` (never onto a worn or bound one, which stays one item), then as new stacks of at most
 * `limit` at the end, called what the bag's first stack of it is called (or what `like` is). So nothing added is ever lost, and one change never starts more than
 * `GAME_INVENTORY_MAX_NEW_STACKS` stacks: past that it is refused (null). `id` is the stack it went
 * onto first.
 */
function addLike(stacks, like, amount, holder, makeId, limit = GAME_INVENTORY_MAX_QUANTITY) {
    const item = gameInventoryItemId(like);
    const bag = { holder };
    let left = amount;
    let id;
    let first;
    const next = stacks.map((stack) => {
        if (gameInventoryItemId(stack) !== item || !inBag(stack, bag))
            return stack;
        first ??= stack;
        if (gameInventoryStackWorn(stack))
            return stack;
        const topUp = Math.min(Math.max(0, limit - stack.quantity), left);
        if (topUp < 1)
            return stack;
        left -= topUp;
        id ??= stack.id;
        return { ...stack, quantity: stack.quantity + topUp };
    });
    if (left > 0 && Math.ceil(left / limit) > GAME_INVENTORY_MAX_NEW_STACKS)
        return null;
    const named = first ?? like;
    const fresh = [];
    while (left > 0) {
        const quantity = Math.min(left, limit);
        left -= quantity;
        fresh.push(makeStack({ id: makeId(), name: named.name, nickname: named.nickname, item: like.item, quantity, holder }));
    }
    return { stacks: fresh.length > 0 ? [...next, ...fresh] : next, id: id ?? fresh[0]?.id ?? first.id };
}
/**
 * The item a name adds into one bag (the player's when `holder` is absent). The name finds a held
 * item as every name does, the bag's own first, and otherwise the ruleset's item of that name. A
 * ruleset item also wins over a plain item that only has its name as its own. A name that finds
 * neither is a new plain item, unless the rules refuse plain items (undefined).
 */
export function gameInventoryAddedItem(stacks, name, holder, rules) {
    const cleaned = cleanName(name).slice(0, GAME_INVENTORY_NAME_MAX_LENGTH);
    if (!cleaned)
        return undefined;
    const bag = { holder: cleanGameInventoryHolder(holder) };
    const items = itemsNamed(stacks, cleaned);
    const typed = rules?.itemNamed(cleaned);
    const plainOwn = gameInventoryPlainItemId(cleaned);
    const held = (stack) => items.has(gameInventoryItemId(stack)) && !(typed && gameInventoryItemId(stack) === plainOwn);
    const known = stacks.find((stack) => held(stack) && inBag(stack, bag)) ?? stacks.find(held);
    if (known)
        return { name: known.name, ...(known.item ? { item: known.item } : {}) };
    if (typed)
        return { name: typed.name, item: typed.item };
    return rules?.plain === "refuse" ? undefined : { name: cleaned };
}
/**
 * Adding by name into one bag (the player's when `holder` is absent): the item
 * `gameInventoryAddedItem` finds, onto the bag's stacks of it, or as a new stack at the end called by
 * the item's own name. One addition is at most one stack's worth of the inventory's bound, and a
 * count past that, one that is not a number, a name the rules refuse, or an addition that would start
 * too many stacks is refused and changes nothing. `id` is the stack it went onto.
 */
export function addToGameInventoryNamed(stacks, name, count, newId, holder, rules) {
    if (!Number.isFinite(count))
        return null;
    const amount = Math.floor(count);
    if (amount < 1 || amount > GAME_INVENTORY_MAX_QUANTITY)
        return null;
    const like = gameInventoryAddedItem(stacks, name, holder, rules);
    if (!like)
        return null;
    const makeId = newId ?? (() => newGameInventoryStackId(stacks));
    const bag = cleanGameInventoryHolder(holder);
    return addLike(stacks, like, amount, bag, makeId, stackLimit(gameInventoryItemId(like), rules));
}
/** One of the ruleset's items added by its id, as `addToGameInventoryNamed` adds by name: refused
 *  when the rules do not offer it (they do not have it, or a layer hides it). */
export function addGameInventoryRulesetItem(stacks, item, count, newId, holder, rules) {
    const known = rules?.offers(item) ? rules.itemOf(item) : undefined;
    if (!known || !Number.isFinite(count))
        return null;
    const amount = Math.floor(count);
    if (amount < 1 || amount > GAME_INVENTORY_MAX_QUANTITY)
        return null;
    const makeId = newId ?? (() => newGameInventoryStackId(stacks));
    const like = { name: known.name, item: known.item };
    return addLike(stacks, like, amount, cleanGameInventoryHolder(holder), makeId, stackLimit(item, rules));
}
/** `addToGameInventoryNamed`, for a caller that only needs the stacks. */
export function addToGameInventory(stacks, name, count, newId, holder, rules) {
    return addToGameInventoryNamed(stacks, name, count, newId, holder, rules)?.stacks ?? stacks;
}
/** The stacks a name finds, in the order they are taken or given from: with `from`, only that bag's
 *  (and the name is read against that bag); without, the player's own bag first and then the rest of
 *  the party's, top to bottom, and in each bag what nobody wears before what is worn or bound. */
function stacksNamed(stacks, name, from) {
    const items = itemsNamed(from ? stacks.filter((stack) => inBag(stack, from)) : stacks, name);
    return stacks
        .map((stack, index) => ({ stack, index }))
        .filter(({ stack }) => items.has(gameInventoryItemId(stack)) && (!from || inBag(stack, from)))
        .sort((a, b) => (from ? 0 : Number(Boolean(a.stack.holder)) - Number(Boolean(b.stack.holder))) ||
        Number(gameInventoryStackWorn(a.stack)) - Number(gameInventoryStackWorn(b.stack)) ||
        a.index - b.index);
}
/**
 * Taking by name: from the stacks of the item it finds, in `stacksNamed` order, until `count` is met,
 * removing each one it empties. Asking for more than there is takes all of it; `taken` says how many
 * really went.
 */
export function takeFromGameInventory(stacks, name, count, from, 
/** With the player's rules, a bound cursed item is never taken: the curse keeps it. */
rules, 
/** Only from stacks the item may be used from, as a fight uses it (`gameInventoryUsableStack`). */
worn = false) {
    // Not held to one stack's bound: the stacks of an item together may hold more than one stack can.
    let left = Number.isFinite(count) ? Math.floor(count) : 0;
    if (!gameInventoryNameKey(name) || left < 1)
        return { stacks, taken: 0 };
    const takeAt = new Map();
    let taken = 0;
    for (const { stack, index } of stacksNamed(stacks, name, from)) {
        if (left < 1)
            break;
        if (keptByCurse(stack, rules) || (worn && !gameInventoryUsableStack(stack, rules)))
            continue;
        const take = Math.min(left, stack.quantity);
        left -= take;
        taken += take;
        takeAt.set(index, take);
    }
    if (taken === 0)
        return { stacks, taken: 0 };
    const next = stacks.flatMap((stack, index) => {
        const take = takeAt.get(index) ?? 0;
        if (take === 0)
            return [stack];
        return stack.quantity - take > 0 ? [{ ...stack, quantity: stack.quantity - take }] : [];
    });
    return { stacks: next, taken };
}
/**
 * Some or all of one stack handed to another party member (`to` absent for the player): taken off
 * that stack and added to their bag onto their stacks of the same item, or as new stacks called what
 * this one is called. Giving to the bag it is already in, or a count that is not from 1 to the
 * stack's size, changes nothing. `id` is the stack that received it, so a screen can follow it.
 */
export function giveGameInventoryStack(stacks, id, to, count, newId, rules) {
    const source = stacks.find((stack) => stack.id === id);
    if (!source)
        return null;
    const amount = count === undefined ? source.quantity : count;
    if (!Number.isInteger(amount) || amount < 1 || amount > source.quantity)
        return null;
    const receiver = { holder: cleanGameInventoryHolder(to) };
    if (inBag(source, receiver))
        return { stacks, id };
    // A cursed item stays with whoever it is bound to, and nobody is handed more than they can carry.
    if (keptByCurse(source, rules) || pastLimit(stacks, receiver.holder, weightOf(source, rules) * amount, rules)) {
        return null;
    }
    const makeId = newId ?? (() => newGameInventoryStackId(stacks));
    const item = gameInventoryItemId(source);
    const rest = amount === source.quantity
        ? stacks.filter((stack) => stack.id !== id)
        : stacks.map((stack) => (stack.id === id ? { ...stack, quantity: stack.quantity - amount } : stack));
    const existing = rest.find((stack) => gameInventoryItemId(stack) === item && inBag(stack, receiver));
    // A whole stack given to somebody with none of it keeps its id, so a selection follows it. Whoever
    // receives it is not wearing it and has not bound it.
    if (!existing && amount === source.quantity) {
        const index = stacks.findIndex((stack) => stack.id === id);
        return {
            stacks: stacks.map((stack, i) => (i === index ? withHolder(unworn(stack), receiver.holder) : stack)),
            id,
        };
    }
    return addLike(rest, source, amount, receiver.holder, makeId, stackLimit(item, rules));
}
/**
 * Giving by name: `count` of the item a name finds, out of one bag (the player's when `from` is
 * absent) and into another's (`to`), stack by stack in the bag's order, each as
 * `giveGameInventoryStack` hands it over, so nicknames travel with the stacks they are on. Giving
 * into the same bag, or when the bag holds none, changes nothing. `given` says how many went.
 */
export function giveFromGameInventoryNamed(stacks, name, count, from, to, newId, rules) {
    let left = Number.isFinite(count) ? Math.floor(count) : 0;
    const receiver = { holder: cleanGameInventoryHolder(to) };
    if (left < 1 || gameInventoryBagKey(from.holder) === gameInventoryBagKey(receiver.holder)) {
        return { stacks, given: 0 };
    }
    let current = stacks;
    let given = 0;
    for (const { stack } of stacksNamed(stacks, name, from)) {
        if (left < 1)
            break;
        const amount = Math.min(left, stack.quantity);
        const next = giveGameInventoryStack(current, stack.id, receiver.holder, amount, newId, rules);
        if (!next)
            break;
        current = next.stacks;
        left -= amount;
        given += amount;
    }
    return given > 0 ? { stacks: current, given } : { stacks, given: 0 };
}
/** The whole-item counts a weight fits into, with the slack loads are compared with. */
function fits(room, weight) {
    return room === Infinity ? Infinity : Math.max(0, Math.floor(room / weight + LOAD_SLACK));
}
/**
 * How many of an item go into whose bag (section 4.7 of the ruleset items plan). An item that weighs
 * nothing, or a game whose ruleset does not say what anyone carries, goes where it is put: the bag
 * named, or the first of `among`. Into one bag, what would take its bearer past the most they can
 * carry is left behind. Into the shared view:
 *   1. all of it to the first who can carry it without becoming encumbered;
 *   2. otherwise split by the room each has left before becoming encumbered, most room first;
 *   3. what still does not fit, one at a time to whoever would then be least over;
 *   4. and what nobody can carry without passing their limit is left behind.
 */
export function placeGameInventoryAddition(stacks, like, amount, destination, rules) {
    // Each bag once, however often it is named: a bag asked twice would have its room counted twice.
    const seen = new Set();
    const candidates = ("among" in destination ? destination.among : [destination.holder])
        .map((holder) => cleanGameInventoryHolder(holder))
        .filter((holder) => {
        const key = gameInventoryBagKey(holder);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    const weight = weightOf(like, rules);
    if (candidates.length === 0)
        return { shares: [], left: amount };
    if (weight <= 0 || !rules?.bearer)
        return { shares: [{ holder: candidates[0], count: amount }], left: 0 };
    const bearers = candidates.map((holder) => {
        const bearer = rules.bearer(holder);
        const load = gameInventoryLoad(stacks, holder, rules);
        return {
            holder,
            free: fits((bearer.encumberedAbove ?? Infinity) - load, weight),
            most: fits((bearer.limit ?? Infinity) - load, weight),
            over: load - (bearer.encumberedAbove ?? Infinity),
            got: 0,
        };
    });
    if (!("among" in destination)) {
        const count = Math.min(amount, bearers[0].most);
        return { shares: count > 0 ? [{ holder: candidates[0], count }] : [], left: amount - count };
    }
    let left = amount;
    const whole = bearers.find((bearer) => Math.min(bearer.free, bearer.most) >= amount);
    if (whole) {
        whole.got = amount;
        left = 0;
    }
    else {
        for (const bearer of [...bearers].sort((a, b) => b.free - a.free)) {
            const take = Math.min(left, bearer.free, bearer.most);
            bearer.got += take;
            left -= take;
        }
        // Past everyone's ease: each one to whoever is then least over, while it stays within their limit.
        while (left > 0) {
            let best;
            let bestOver = Infinity;
            for (const bearer of bearers) {
                if (bearer.got >= bearer.most)
                    continue;
                const over = bearer.over + weight * (bearer.got + 1);
                if (over < bestOver) {
                    best = bearer;
                    bestOver = over;
                }
            }
            if (!best)
                break;
            best.got += 1;
            left -= 1;
        }
    }
    const shares = bearers.flatMap((bearer) => (bearer.got > 0 ? [{ holder: bearer.holder, count: bearer.got }] : []));
    return { shares, left };
}
/**
 * An addition put into one bag or the shared view (`placeGameInventoryAddition`), each share onto
 * that bag's stacks of the item as `addToGameInventoryNamed` adds. Null when a share would start too
 * many stacks; `shares` is empty when nobody could carry any of it, and `left` says what stayed behind.
 */
export function addGameInventoryPlaced(stacks, like, amount, destination, newId, rules) {
    const placed = placeGameInventoryAddition(stacks, like, amount, destination, rules);
    const makeId = newId ?? (() => newGameInventoryStackId(current));
    let current = stacks;
    const shares = [];
    for (const share of placed.shares) {
        const added = addLike(current, like, share.count, share.holder, makeId, stackLimit(gameInventoryItemId(like), rules));
        if (!added)
            return null;
        current = added.stacks;
        shares.push({ ...(share.holder ? { holder: share.holder } : {}), count: share.count, id: added.id });
    }
    return { stacks: current, shares, left: placed.left };
}
/** Which slots one bag's worn items take, by slot id. */
export function gameInventorySlotsUsed(stacks, holder, rules) {
    const used = {};
    const bag = { holder };
    for (const stack of stacks) {
        if (!stack.equipped || !inBag(stack, bag) || !stack.item)
            continue;
        for (const [slot, count] of Object.entries(rules?.itemOf(stack.item)?.slots ?? {})) {
            used[slot] = (used[slot] ?? 0) + count * stack.quantity;
        }
    }
    return used;
}
/** How many items one bag's bearer has bound. */
export function gameInventoryBoundCount(stacks, holder) {
    const bag = { holder };
    return stacks.reduce((total, stack) => total + (stack.bound && inBag(stack, bag) ? stack.quantity : 0), 0);
}
/** One character's load, bound items and slots in use (`holder` absent for the player). */
export function gameInventoryBearerStatus(stacks, holder, rules) {
    const bearer = rules?.bearer?.(holder) ?? {};
    const load = gameInventoryLoad(stacks, holder, rules);
    const used = gameInventorySlotsUsed(stacks, holder, rules);
    return {
        load,
        ...(bearer.encumberedAbove !== undefined ? { encumberedAbove: bearer.encumberedAbove } : {}),
        ...(bearer.limit !== undefined ? { limit: bearer.limit } : {}),
        encumbered: bearer.encumberedAbove !== undefined && load > bearer.encumberedAbove + LOAD_SLACK,
        bound: gameInventoryBoundCount(stacks, holder),
        ...(bearer.bindingMax !== undefined ? { bindingMax: bearer.bindingMax } : {}),
        slots: (rules?.slots ?? []).map((slot) => ({ ...slot, used: used[slot.id] ?? 0 })),
    };
}
/**
 * One stack put on, taken off, bound or unbound by whoever carries it. Only a ruleset item that takes
 * slots can be equipped, while its bearer has those slots free, and only one that binds can be bound,
 * while its bearer is under their binding maximum. One item of a larger stack is taken into a stack
 * of its own right after it, which is the stack returned. Taking off or unbinding what is not worn or
 * bound changes nothing. The player cannot take off or unbind a bound cursed item. Null when there
 * is no such stack.
 */
export function wearGameInventoryStack(stacks, id, wear, newId = () => newGameInventoryStackId(stacks), rules) {
    const index = stacks.findIndex((stack) => stack.id === id);
    if (index < 0)
        return null;
    const stack = stacks[index];
    const flag = wear === "equip" || wear === "unequip" ? "equipped" : "bound";
    if (wear === "unequip" || wear === "unbind") {
        if (!stack[flag])
            return { stacks, id };
        if (keptByCurse(stack, rules))
            return { refused: "cursed" };
        const { [flag]: _dropped, ...rest } = stack;
        return { stacks: stacks.map((each, i) => (i === index ? rest : each)), id };
    }
    if (stack[flag])
        return { stacks, id };
    const known = stack.item ? rules?.itemOf(stack.item) : undefined;
    if (flag === "equipped") {
        const takes = Object.entries(known?.slots ?? {}).filter(([, count]) => count > 0);
        if (takes.length === 0)
            return { refused: "not-wearable" };
        const used = gameInventorySlotsUsed(stacks, stack.holder, rules);
        for (const [slot, count] of takes) {
            const has = rules?.slots?.find((each) => each.id === slot)?.count ?? 0;
            if ((used[slot] ?? 0) + count > has)
                return { refused: "no-slot" };
        }
    }
    else {
        if (!known?.binds)
            return { refused: "not-bindable" };
        const max = rules?.bearer?.(stack.holder).bindingMax;
        if (max !== undefined && gameInventoryBoundCount(stacks, stack.holder) + 1 > max) {
            return { refused: "binding-full" };
        }
    }
    if (stack.quantity === 1) {
        return { stacks: stacks.map((each, i) => (i === index ? { ...each, [flag]: true } : each)), id };
    }
    const one = { ...stack, id: newId(), quantity: 1, [flag]: true };
    return {
        stacks: [...stacks.slice(0, index), { ...stack, quantity: stack.quantity - 1 }, one, ...stacks.slice(index + 1)],
        id: one.id,
    };
}
/** Why the player cannot hand this much of a stack to that bag: a bound cursed item stays, and nobody
 *  is given more than they can carry. */
export function gameInventoryGiveRefusal(stacks, stack, to, amount, rules) {
    if (keptByCurse(stack, rules))
        return "cursed";
    if (pastLimit(stacks, cleanGameInventoryHolder(to), weightOf(stack, rules) * amount, rules))
        return "too-heavy";
    return undefined;
}
/** Whether `amount` more of a stack's item would take its bearer past the most they can carry. */
export function gameInventoryOverloads(stacks, stack, amount, rules) {
    return pastLimit(stacks, stack.holder, weightOf(stack, rules) * amount, rules);
}
/** What a ruleset's item asks of a stack before it may be used: worn where it takes slots, bound
 *  where it binds. The one rule the Use button, the fight menu and a fight's spends all read. */
export function gameInventoryWearNeeds(item) {
    const takesSlots = Object.values(item.slots ?? {}).some((count) => count > 0);
    return { ...(takesSlots ? { equipped: true } : {}), ...(item.binds ? { bound: true } : {}) };
}
/** Whether a stack is worn and bound as `needs` asks. */
export function gameInventoryWearMet(stack, needs) {
    return (!needs?.equipped || stack.equipped === true) && (!needs?.bound || stack.bound === true);
}
/** Whether a stack may be used as its item asks (`gameInventoryWearNeeds`). A plain item, or one the
 *  rules do not know, always may. */
export function gameInventoryUsableStack(stack, rules) {
    const read = stack.item ? rules?.itemOf(stack.item) : undefined;
    return !read || gameInventoryWearMet(stack, gameInventoryWearNeeds(read));
}
/** Whether the player's own change would part them from this stack: a bound cursed item. */
export function gameInventoryKeptByCurse(stack, rules) {
    return keptByCurse(stack, rules);
}
/** Two stacks trading places, wherever they are in the list. */
export function swapGameInventoryStacks(stacks, firstId, secondId) {
    const first = stacks.findIndex((stack) => stack.id === firstId);
    const second = stacks.findIndex((stack) => stack.id === secondId);
    if (first < 0 || second < 0 || first === second)
        return stacks;
    const next = stacks.slice();
    [next[first], next[second]] = [next[second], next[first]];
    return next;
}
/**
 * One stack set to a count. Zero removes it. A count past what one stack of the item holds fills this
 * stack and puts the rest in new stacks right after it, like it, unless that would start too many
 * stacks, which changes nothing. A worn or bound stack holds one, so what is added beside it is
 * neither. The player cannot take a bound cursed item away. Nothing passes the inventory's bound.
 */
export function setGameInventoryStackQuantity(stacks, id, quantity, newId = () => newGameInventoryStackId(stacks), rules) {
    const index = stacks.findIndex((stack) => stack.id === id);
    if (index < 0 || !Number.isFinite(quantity))
        return stacks;
    const stack = stacks[index];
    const next = clampQuantity(quantity);
    if (next === stack.quantity)
        return stacks;
    if (next < stack.quantity && keptByCurse(stack, rules))
        return stacks;
    if (next === 0)
        return stacks.filter((_, i) => i !== index);
    const worn = gameInventoryStackWorn(stack);
    const limit = worn ? 1 : stackLimit(gameInventoryItemId(stack), rules);
    if (next <= limit)
        return stacks.map((each, i) => (i === index ? { ...each, quantity: next } : each));
    const beside = worn ? stackLimit(gameInventoryItemId(stack), rules) : limit;
    if (Math.ceil((next - limit) / beside) > GAME_INVENTORY_MAX_NEW_STACKS)
        return stacks;
    const rest = [];
    for (let left = next - limit; left > 0; left -= beside) {
        rest.push({ ...unworn(stack), id: newId(), quantity: Math.min(left, beside) });
    }
    return [...stacks.slice(0, index), { ...stack, quantity: limit }, ...rest, ...stacks.slice(index + 1)];
}
/**
 * Part of a stack moved into a new stack right after it, with the same item and nickname. The size
 * has to leave something behind and move something, so it is at least one and less than the stack;
 * anything else changes nothing. The total never changes.
 */
export function splitGameInventoryStack(stacks, id, size, newId = () => newGameInventoryStackId(stacks)) {
    const index = stacks.findIndex((stack) => stack.id === id);
    if (index < 0 || !Number.isInteger(size))
        return stacks;
    const stack = stacks[index];
    if (size < 1 || size >= stack.quantity)
        return stacks;
    return [
        ...stacks.slice(0, index),
        { ...stack, quantity: stack.quantity - size },
        { ...stack, id: newId(), quantity: size },
        ...stacks.slice(index + 1),
    ];
}
/** How many of one stack pouring into another would move: what the stack poured into has room for,
 *  and none when they cannot merge. */
function mergeAmount(from, into, rules) {
    if (from.id === into.id || gameInventoryItemId(from) !== gameInventoryItemId(into))
        return 0;
    // A worn or bound item is one item on its own.
    if (gameInventoryStackWorn(from) || gameInventoryStackWorn(into))
        return 0;
    return Math.max(0, Math.min(from.quantity, stackLimit(gameInventoryItemId(into), rules) - into.quantity));
}
/** Whether pouring one stack into another in somebody else's bag would hand them more than they can
 *  carry. Pouring within one bag moves nothing between bearers, so it never is. */
export function gameInventoryMergeOverloads(stacks, from, into, rules) {
    return (!inBag(from, into) && pastLimit(stacks, into.holder, weightOf(from, rules) * mergeAmount(from, into, rules), rules));
}
/** One stack poured into another of the same item, which keeps its place, its bag and its nickname,
 *  so pouring into a stack in somebody else's bag hands it over, and like a give never past what they
 *  can carry. Only as much as the stack it is poured into can hold moves, and the rest stays where it
 *  was; into a full stack nothing does. Two different items never merge, whatever they are called,
 *  and a stack never merges into itself. */
export function mergeGameInventoryStacks(stacks, fromId, intoId, rules) {
    const from = stacks.find((stack) => stack.id === fromId);
    const into = stacks.find((stack) => stack.id === intoId);
    if (!from || !into)
        return stacks;
    const moved = mergeAmount(from, into, rules);
    if (moved < 1 || gameInventoryMergeOverloads(stacks, from, into, rules))
        return stacks;
    return stacks.flatMap((stack) => {
        if (stack.id === intoId) {
            // Several now, and a loaded count or charges are one item's: each of them reads as full.
            const { loaded: _loaded, charges: _charges, ...rest } = stack;
            return [{ ...rest, quantity: stack.quantity + moved }];
        }
        if (stack.id !== fromId)
            return [stack];
        return moved < stack.quantity ? [{ ...stack, quantity: stack.quantity - moved }] : [];
    });
}
/**
 * One stack called something else: its nickname, which is all a rename changes. Renaming it back to
 * the item's own name, in any case, clears the nickname. A rename never changes which item it is and
 * never merges it into anything. An empty name is refused.
 */
export function renameGameInventoryStack(stacks, id, nextName) {
    const cleaned = cleanName(nextName).slice(0, GAME_INVENTORY_NAME_MAX_LENGTH);
    const source = stacks.find((stack) => stack.id === id);
    if (!source || !cleaned)
        return null;
    const renamed = makeStack({ ...source, nickname: cleaned });
    if (gameInventoryStackLabel(renamed) === gameInventoryStackLabel(source))
        return { stacks, id };
    return { stacks: stacks.map((stack) => (stack.id === id ? renamed : stack)), id };
}
/**
 * The inventory a new session starts with: every stack the last one ended with, ids, splits, bags and
 * nicknames kept, plus anything the detailed inventory on its last game state names that no stack
 * holds, which goes to the player. `rules` are the game's ruleset's items: what comes back that way is
 * stacked no higher than its item allows, and a name that is one of them comes back as that item.
 */
export function carryGameInventory(gameInventory, detailedInventory, rules) {
    let stacks = normalizeGameInventoryStacks(gameInventory);
    // Read against the stacks as saved, so two detailed entries of an item no stack holds both count.
    const saved = stacks;
    const held = new Set(saved.map(gameInventoryItemId));
    for (const raw of Array.isArray(detailedInventory) ? detailedInventory : []) {
        const [entry] = normalizeGameInventoryStacks([raw]);
        if (!entry)
            continue;
        const item = raw.item;
        // An entry that follows an item by id is held exactly when that item is; only one without an id
        // is judged by its name.
        if (typeof item === "string" ? held.has(item) : gameInventoryCount(saved, entry.name) > 0)
            continue;
        // A ruleset item comes back as that item, under the name its entry shows.
        // Only one the ruleset still has, when its items are known; any other goes back by its name.
        const ref = readItemRef(item);
        const typed = ref && (!rules || rules.itemOf(ref)) ? ref : undefined;
        if (typed) {
            const makeId = () => newGameInventoryStackId(stacks);
            stacks =
                addLike(stacks, { name: entry.name, item: typed }, entry.quantity, undefined, makeId, stackLimit(typed, rules))
                    ?.stacks ?? stacks;
            continue;
        }
        // An entry whose name is not its item's own (a nickname) comes back as that item, its own name
        // read off the id and the entry's name kept as the nickname, rather than as whatever that name
        // finds. Only an own name that makes that same id again is trusted: one cut short and
        // fingerprinted cannot be read back, and comes back by name.
        const own = typeof item === "string" && item.startsWith("plain:") ? item.slice("plain:".length).replace(/-/g, " ") : "";
        if (own && gameInventoryPlainItemId(own) === item && gameInventoryPlainItemId(entry.name) !== item) {
            const makeId = () => newGameInventoryStackId(stacks);
            stacks =
                addLike(stacks, { name: own, nickname: entry.name }, entry.quantity, undefined, makeId)?.stacks ?? stacks;
            continue;
        }
        stacks = addToGameInventory(stacks, entry.name, entry.quantity, undefined, undefined, rules);
    }
    return stacks;
}
//# sourceMappingURL=game-inventory-stacks.js.map