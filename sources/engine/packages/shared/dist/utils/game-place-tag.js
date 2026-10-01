// ──────────────────────────────────────────────
// Place tag — `[place: name="Millbrook" size="town"]` (#6917)
//
// The Game Master says which place a scene is in and how big it is, on the ladder of places the
// ruleset's market declares. The Engine answers each tag in place, as it does an inventory tag, so the
// size is always one of the ladder's own. The place in force is the last one answered: in the messages
// the player sees, and then in the reply. A place with no size has no market (the road, the wilds).
// ──────────────────────────────────────────────
import { readGmTagAttributes } from "./skill-check-tag.js";
/** Longest body a place tag can carry. */
const MAX_PLACE_TAG_BODY = 400;
/** Longest place name kept. */
const MAX_PLACE_NAME_LENGTH = 120;
/** A fresh global, case-insensitive matcher over `[place: ...]` tags. */
export function createPlaceTagRegex() {
    return new RegExp(`\\[place:([^\\]]{0,${MAX_PLACE_TAG_BODY}})\\]`, "gi");
}
function clean(value) {
    const cleaned = value
        ?.trim()
        .replace(/^["']|["']$/g, "")
        .replace(/[\r\n"[\]]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_PLACE_NAME_LENGTH);
    return cleaned ? cleaned : undefined;
}
function readValues(body) {
    const values = new Map();
    for (const attribute of readGmTagAttributes(body)) {
        const key = attribute.key.trim().toLowerCase();
        if (key && !values.has(key))
            values.set(key, attribute.rawValue);
    }
    return values;
}
function serialize(place, answer) {
    const parts = [];
    if (place.name)
        parts.push(`name="${place.name}"`);
    if (place.size)
        parts.push(`size="${place.size}"`);
    parts.push(`result="${answer.result}"`);
    if (answer.result === "refused")
        parts.push(`reason="${answer.reason}"`);
    return `[place: ${parts.join(" ")}]`;
}
/**
 * Every place tag in a reply, answered in place: a size the ladder has becomes its id, a size it does
 * not have is refused (and changes nothing), and a tag naming neither a place nor a size is refused.
 * `place` is the last place the reply moved to, or undefined when it moved nowhere.
 */
export function applyGamePlaceTags(content, sizeOf) {
    let place;
    const next = content.replace(createPlaceTagRegex(), (_whole, body) => {
        const values = readValues(body);
        const name = clean(values.get("name"));
        const written = clean(values.get("size"));
        if (!name && !written)
            return serialize({}, { result: "refused", reason: "unreadable" });
        const size = written === undefined ? undefined : sizeOf(written);
        if (written !== undefined && !size) {
            return serialize({ ...(name ? { name } : {}), size: written }, { result: "refused", reason: "unknown-size" });
        }
        place = { ...(name ? { name } : {}), ...(size ? { size: size.id } : {}) };
        return serialize(place, { result: "ok" });
    });
    return { content: next, ...(place ? { place } : {}) };
}
/** The place in force after these texts, oldest first: the last place tag the Engine answered ok, or
 *  null when none was. */
export function lastGamePlace(texts) {
    for (let index = texts.length - 1; index >= 0; index--) {
        const found = [...(texts[index] ?? "").matchAll(createPlaceTagRegex())].reverse();
        for (const match of found) {
            const values = readValues(match[1] ?? "");
            if (clean(values.get("result"))?.toLowerCase() !== "ok")
                continue;
            const name = clean(values.get("name"));
            const size = clean(values.get("size"));
            return { ...(name ? { name } : {}), ...(size ? { size } : {}) };
        }
    }
    return null;
}
//# sourceMappingURL=game-place-tag.js.map