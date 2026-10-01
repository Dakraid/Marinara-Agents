// ──────────────────────────────────────────────
// Lorebook bulk editor: pure edit logic
// Shared by the bulk-edit route (which applies it) and the editor UI (range
// selection, payload building). Kept free of storage so it is easy to test.
// ──────────────────────────────────────────────
import { z } from "zod";
export const LOREBOOK_BULK_MAX_ENTRIES = 5000;
export const LOREBOOK_BULK_MAX_KEYS = 200;
const bulkKeyListSchema = z.array(z.string().max(500)).max(LOREBOOK_BULK_MAX_KEYS).default([]);
/** Plain field changes applied identically to every selected entry. */
export const lorebookBulkSetSchema = z
    .object({
    enabled: z.boolean(),
    constant: z.boolean(),
    probability: z.number().min(0).max(100).nullable(),
    order: z.number().int(),
    depth: z.number().int().min(0),
    folderId: z.string().nullable(),
    tag: z.string().max(200),
})
    .partial();
export const lorebookBulkEditSchema = z
    .object({
    entryIds: z.array(z.string().min(1)).min(1).max(LOREBOOK_BULK_MAX_ENTRIES),
    set: lorebookBulkSetSchema.default({}),
    /** Which key list the add/remove operations touch. */
    keyField: z.enum(["keys", "secondaryKeys"]).default("keys"),
    addKeys: bulkKeyListSchema,
    removeKeys: bulkKeyListSchema,
})
    .refine((edit) => hasLorebookBulkEditChanges(edit), { message: "Choose at least one change to apply" });
export const lorebookBulkDeleteSchema = z.object({
    entryIds: z.array(z.string().min(1)).min(1).max(LOREBOOK_BULK_MAX_ENTRIES),
});
/** Trim, drop blanks, and dedupe case-insensitively (first spelling wins). */
export function normalizeLorebookBulkKeys(keys) {
    const seen = new Set();
    const result = [];
    for (const raw of keys ?? []) {
        const key = raw.trim();
        if (!key)
            continue;
        const folded = key.toLocaleLowerCase();
        if (seen.has(folded))
            continue;
        seen.add(folded);
        result.push(key);
    }
    return result;
}
/** Split comma or newline separated text from an input box into keys. */
export function parseLorebookBulkKeyText(text) {
    return normalizeLorebookBulkKeys(text.split(/[,\n]/));
}
export function hasLorebookBulkEditChanges(edit) {
    if (edit.set && Object.values(edit.set).some((value) => value !== undefined))
        return true;
    return normalizeLorebookBulkKeys(edit.addKeys).length > 0 || normalizeLorebookBulkKeys(edit.removeKeys).length > 0;
}
/**
 * Apply key removals then additions to one key list. Matching is
 * case-insensitive and ignores surrounding whitespace, so removing "Queen"
 * also removes " queen". Returns null when nothing would change.
 */
export function applyLorebookBulkKeyChanges(current, addKeys, removeKeys) {
    const remove = new Set(normalizeLorebookBulkKeys(removeKeys).map((key) => key.toLocaleLowerCase()));
    const next = current.filter((key) => !remove.has(key.trim().toLocaleLowerCase()));
    const present = new Set(next.map((key) => key.trim().toLocaleLowerCase()));
    for (const key of normalizeLorebookBulkKeys(addKeys)) {
        const folded = key.toLocaleLowerCase();
        if (present.has(folded))
            continue;
        present.add(folded);
        next.push(key);
    }
    if (next.length === current.length && next.every((key, index) => key === current[index]))
        return null;
    return next;
}
/** Per-entry key patches for the entries whose chosen key list changes. */
export function planLorebookBulkKeyPatches(entries, edit) {
    const field = edit.keyField ?? "keys";
    const patches = [];
    for (const entry of entries) {
        const next = applyLorebookBulkKeyChanges(entry[field], edit.addKeys, edit.removeKeys);
        if (next)
            patches.push({ id: entry.id, [field]: next });
    }
    return patches;
}
/**
 * Shift-click range selection over the entries in display order. Every id
 * between the anchor and the target (inclusive) takes the target's new state.
 * Without a usable anchor it behaves like a plain toggle of the target.
 */
export function selectLorebookEntryRange(orderedIds, current, anchorId, targetId) {
    const next = new Set(current);
    const select = !current.has(targetId);
    const targetIndex = orderedIds.indexOf(targetId);
    const anchorIndex = anchorId ? orderedIds.indexOf(anchorId) : -1;
    if (targetIndex < 0 || anchorIndex < 0) {
        if (select)
            next.add(targetId);
        else
            next.delete(targetId);
        return next;
    }
    const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
    for (let index = start; index <= end; index += 1) {
        const id = orderedIds[index];
        if (select)
            next.add(id);
        else
            next.delete(id);
    }
    return next;
}
//# sourceMappingURL=lorebook-bulk-edit.js.map