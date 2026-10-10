# SPEC — Card Editor bulk: duplicate-name affixes (append + remove prefix/suffix)

Package: `packages/card-editor` (Marinara-Agents). **No Marinara-Engine work required** — duplicate naming is computed entirely package-side (`apply.ts` plans, `apply-ops.ts` renames); the engine only provides the raw duplicate endpoint. The deleted engine modal (1.7.0) means no engine UI exists to change.

Companion: ARCH 2026-10-10 duplicate-affix blueprint; DESIGN.md bible §2 (Saving).

## 1. Goal

Duplicate save mode (`saveMode:"duplicate"`, `completionMode:"duplicate"`, and the post-hoc "Duplicate applied cards" flow) gains four independent, optional name affixes. The dispatch dialog shows four text fields in this exact order: **Append Prefix, Append Suffix, Remove Prefix, Remove Suffix** (appending group ordered above the remove group — user mandate).

## 2. Naming formula (authoritative)

Given the engine duplicate's raw copy name:

1. `base` = copy name with the engine suffix `" (Copy)"` removed (existing behavior, unchanged, case-sensitive).
2. Strip: if `duplicateRemovePrefix` is non-empty and `base` starts with it **case-insensitively**, remove that many characters **once**. Same for `duplicateRemoveSuffix` at the end (case-insensitive, once).
3. Trim surrounding whitespace of the stripped result. If the result is empty, fall back to the pre-strip `base` (never produce a blank card name).
4. Final name = `(duplicatePrefix ?? "") + stripped + (duplicateSuffix ?? "")`. **Both append affixes apply simultaneously** — the legacy "prefix wins over suffix" rule is deleted.

Case-insensitivity applies to strip matching only; the removed characters come from the original string (original casing of the remainder is preserved).

## 3. User decisions (locked 2026-10-10, interview)

- **Both apply**: prefix + name + suffix when both boxes are filled.
- **Suffix box pre-filled with `" (Edited)"`** (fresh dialog seed; remembered config overrides). Consequence accepted by user: chat "Process characters" prefill (`duplicatePrefix: "<chat> "`) now yields `"<chat> Name (Edited)"` unless the user clears the suffix box. Clearing the suffix box = no suffix (blank boxes are omitted from the dispatch config).
- **Strip matching is case-insensitive**; strip once; trim after; empty-result → keep original base name.

## 4. Schema changes (`shared/.../card-editor/schema.ts`)

- `BulkSessionConfig.duplicateSuffix`: becomes **optional** (`duplicateSuffix?: string`); `normalizeSessionConfig` no longer injects the `" (Edited)"` default. Absent = no suffix. Legacy stored sessions are unaffected (their configs already carry the materialized `" (Edited)"`).
- New optional fields: `duplicateRemovePrefix?: string`, `duplicateRemoveSuffix?: string`. All four affixes validate via the existing `optionalAffix(value, field, preserve=true)`: string, ≤300 chars, non-blank when present, whitespace preserved verbatim (leading/trailing spaces are meaningful in names).
- `isStoredConfig`: add exact comparisons for `duplicatePrefix`, `duplicateSuffix`, `duplicateRemovePrefix`, `duplicateRemoveSuffix` (undefined-safe) so stored sessions with affixes round-trip.

## 5. Functional surface

- **F1** Dispatch dialog (`BulkDispatchDialog.tsx`): duplicate radio expands the approved stacked layout — `Name prefix`, `Name suffix` (pre-filled `" (Edited)"` per §3), dashed-caption divider `Remove from name`, `Remove prefix`, `Remove suffix`, plus a live preview line `Copy name: <computed>` using the first target's name as the sample base. All values stay editable; blank boxes are omitted from the submitted config (schema rejects blank strings).
- **F2** Planning (`apply.ts` `planApply` duplicate branch, `planDuplicateApplied`): op gains `namePrefix?`, `nameSuffix?`, `stripNamePrefix?`, `stripNameSuffix?` — all four carried independently; prefix no longer suppresses suffix.
- **F3** Execution (`apply-ops.ts` `executeOp` duplicateThenPatch): computes the final name per §2 via a new pure helper `computeDuplicateName(baseName, affixes)` in shared `text.ts`.
- **F4** Pass-through: verdict route (`routes.ts`), completion queue-drain (`runner.ts`), and `planDuplicateApplied` all forward the four config fields into `planApply` options.
- **F5** Remembered config (`session-config.ts` / `storeBulkConfig`) persists the new fields automatically once they are schema members.

## 6. Non-goals

- No engine changes of any kind (no endpoint, prefill, or dialog work).
- Overlay prefill (`OverlayWorkspace.parseDispatchPrefill`) is unchanged — engine sends `duplicatePrefix` only; the new fields are not prefillable this iteration.
- No change to combined save mode naming, in-place modes, or the `" (Copy)"` strip.
- No repeated stripping, no regex/wildcard stripping, no mid-name removal.

## 7. Acceptance criteria

- **AC1** `computeDuplicateName` pure tests: prefix+suffix both apply; prefix-only; suffix-only; neither (name = stripped base); remove prefix/suffix case-insensitive (`"old - Maria"` + removePrefix `"OLD - "` → `"Maria"`); strip once only (`"xx xx Name"` + removePrefix `"xx "` → `"xx Name"`); post-strip trim; empty-after-strip falls back to base; remove affixes combine with append affixes.
- **AC2** `normalizeSessionConfig`: accepts/round-trips all four affixes verbatim; rejects blank and >300-char values; absent `duplicateSuffix` stays absent (no injected default); `isStoredConfig` parity for affix-carrying configs.
- **AC3** `planApply` duplicate mode emits one `duplicateThenPatch` op carrying exactly the affixes present in config; `planDuplicateApplied` forwards them.
- **AC4** Dialog source assertions: four fields present in the mandated order (prefix, suffix, then remove group), suffix seeded `" (Edited)"`, blank boxes omitted from dispatch config, live preview present. Legacy assertions `duplicatePrefix.trim()`-fallback / prefix-wins are removed.
- **AC5** Backward compat: a stored session created before this change (config `{duplicateSuffix:" (Edited)"}` or `{duplicatePrefix:"October ", duplicateSuffix:" (Edited)"}`) still migrates and plans with both affixes applied per §2.
- **AC6** Fresh validation runs green: `node tests/card-editor-bulk.regression.mjs`, `node tests/card-editor-runner.regression.mjs`, `node tests/card-editor-dialog-ui.regression.mjs`, `node tests/card-editor-panel-ui.regression.mjs`, `npm run lint`, `npm run format:check`.
- **AC7** Locales: all new user-visible strings exist in the package `en.json` source catalog; obsolete `duplicatePrefixHint` text (prefix-wins wording) replaced.

## 8. Error & edge matrix

| Case | Behavior |
|---|---|
| All four boxes blank | Copy name = original base name (no affixes); allowed. |
| Strip empties the name | Pre-strip base kept; append affixes still apply around it. |
| Remove affix not present in name | No-op; name unchanged by that affix. |
| Affix of only whitespace | Schema rejects (blank); dialog omits blank boxes before submit. |
| Case differs between affix and name edge | Strips anyway (case-insensitive), preserving the remainder's original casing. |
| Chat prefill `<chat> ` + default suffix | `"<chat> Name (Edited)"` — accepted decision §3. |
