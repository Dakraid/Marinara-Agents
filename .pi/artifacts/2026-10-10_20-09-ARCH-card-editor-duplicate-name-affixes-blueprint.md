# ARCH — Card Editor duplicate-name affixes blueprint

Companion: SPEC 2026-10-10_20-08 (locked decisions, formula, ACs); DESIGN.md bible §2. All work is package-side (`packages/card-editor`); **no engine task**.

## 1. Data flow

```mermaid
flowchart LR
  subgraph Dialog[BulkDispatchDialog.tsx]
    P[prefix box\nprefill/stored seed] --> CFG
    S[suffix box\nseed: stored ?? \" \(Edited\)\"] --> CFG
    RP[remove prefix box] --> CFG
    RS[remove suffix box] --> CFG
    CFG[normalizeBulkSessionConfig] -->|POST /sessions| STORE[(session.config)]
    P & S & RP & RS -.-> PREV[live preview\ncomputeDuplicateName\(first target name\)]
  end
  STORE --> V[routes.ts verdict] & Q[runner.ts queue-drain] & PA[apply.ts planDuplicateApplied]
  V & Q & PA --> PL[apply.ts planApply\nduplicate branch]
  PL -->|duplicateThenPatch\nnamePrefix? nameSuffix?\nstripNamePrefix? stripNameSuffix?| EX[apply-ops.ts executeOp]
  EX -->|base = copy name − \" \(Copy\)\"| N[computeDuplicateName\ntext.ts]
  N -->|PATCH name + fields| HOST[(engine characters)]
```

## 2. Shared helper (`shared/.../card-editor/text.ts`)

```ts
export interface DuplicateNameAffixes {
  prefix?: string; suffix?: string; removePrefix?: string; removeSuffix?: string;
}
export function computeDuplicateName(baseName: string, affixes: DuplicateNameAffixes): string
```

Implementation contract (SPEC §2): strip removePrefix/removeSuffix case-insensitively, once each, via `toLowerCase()` edge comparison with character-count splice from the original string; `trim()` the result; empty → pre-strip base; return `(prefix ?? "") + stripped + (suffix ?? "")`. Empty/blank affix strings are treated as absent (defense in depth — schema already rejects blanks).

## 3. File-by-file deltas

### T1 — shared + server + apply (Worker-Backend)
- `shared/.../card-editor/schema.ts`
  - `BulkSessionConfig`: `duplicateSuffix` → `duplicateSuffix?: string` (drop the `" (Edited)"` injection in `normalizeSessionConfig`); add `duplicateRemovePrefix?: string`, `duplicateRemoveSuffix?: string`. Comment updates (no more "wins over").
  - `normalizeSessionConfig`: all four via `optionalAffix(src.X, "X", true)`, conditional spreads.
  - `isStoredConfig`: add undefined-safe comparisons for all four affixes.
- `shared/.../card-editor/text.ts`: add `computeDuplicateName` (above).
- `server/.../card-editor/apply.ts`
  - `PlanApplyOptions`: `duplicateSuffix` optional; add `duplicatePrefix?` (already), `duplicateRemovePrefix?`, `duplicateRemoveSuffix?`.
  - `ApplyOperation.duplicateThenPatch`: replace `nameSuffix: string; namePrefix?` with `namePrefix?/nameSuffix?/stripNamePrefix?/stripNameSuffix?` (all optional, verbatim).
  - `planApply` duplicate branch: emit all four affixes present in options; delete the prefix-wins selection.
  - `planDuplicateApplied`: forward `duplicateRemovePrefix`/`duplicateRemoveSuffix` from `session.config` (duplicateSuffix spread becomes conditional).
- `server/.../card-editor/routes.ts` (:537 area) and `server/.../card-editor/runner.ts` (:337 area): conditional spreads for the three now-optional fields (`duplicateSuffix`, `duplicateRemovePrefix`, `duplicateRemoveSuffix`) alongside the existing `duplicatePrefix` spread.
- `client/.../card-editor/apply-ops.ts` `executeOp`: build `data.name = computeDuplicateName(baseName, {prefix: op.namePrefix, suffix: op.nameSuffix, removePrefix: op.stripNamePrefix, removeSuffix: op.stripNameSuffix})` (conditional spreads; `baseName` logic unchanged). Update the stale comment ("prefix wins over suffix").
- Tests: `tests/card-editor-bulk.regression.mjs` (AC1/AC2/AC3/AC5 — rewrite prefix-wins fixtures :83-102, :607, :921, :951, :1065; add `computeDuplicateName` suite; schema rejection/round-trip cases), `tests/card-editor-runner.regression.mjs` (:305 fixture expectations).

### T2 — dialog UI + locales + release (Worker-Frontend)
- `client/.../card-editor/BulkDispatchDialog.tsx`
  - State: add `duplicateSuffix` (seed `storedConfig?.duplicateSuffix ?? " (Edited)"`), `duplicateRemovePrefix`, `duplicateRemoveSuffix` (seeds `storedConfig?.X ?? ""`); prefix seed unchanged (`prefill?.duplicatePrefix ?? storedConfig?.duplicatePrefix ?? ""` — chat name stays a mere suggestion).
  - Saving section (duplicate branch, current :610-624): replace the single prefix label with the approved stacked layout — `Name prefix` input, `Name suffix` input, dashed-caption divider `Remove from name`, `Remove prefix` input, `Remove suffix` input, then the live preview line `Copy name: <computeDuplicateName(targets[0]?.name ?? fallback, …)>`. Reuse `ce-label`/`ce-field` classes; the divider is a `<small>`-style caption with a top dashed border (minimal CSS addition in the package's style block if no existing class fits).
  - Dispatch config assembly (:289 area): conditional spreads for all four affixes, each gated on `.trim()` non-empty (verbatim values preserved).
- `client/.../card-editor/locales/en.json`: replace `duplicatePrefixHint` wording; add `duplicateSuffix`, `duplicateSuffixPlaceholder`, `duplicateRemoveGroup`, `duplicateRemovePrefix`, `duplicateRemovePrefixPlaceholder`, `duplicateRemoveSuffix`, `duplicateRemoveSuffixPlaceholder`, `duplicateNamePreview` (`"Copy name: {{name}}"`). Sync the built package catalog (`packages/card-editor/locales/en.json`) via the repo's locale-sync step.
- Tests: `tests/card-editor-dialog-ui.regression.mjs` (:313-314, :328 — replace prefix-fallback assertions with the four-field order/seed/omit assertions, AC4); verify `tests/card-editor-panel-ui.regression.mjs` (:720 fixture) still passes.
- Release plumbing: `packages/card-editor/manifest.json` 1.7.0 → 1.7.1, `CHANGELOG.md` entry, `catalog/notes.json` + `catalog/v3/notes.json` entry, rebuild package bundles per repo convention (`scripts/build-feature-packages.mjs` card-editor lane).

## 4. Contracts frozen for parallel work

Field names are final: `duplicatePrefix`, `duplicateSuffix`, `duplicateRemovePrefix`, `duplicateRemoveSuffix` (config); `namePrefix`, `nameSuffix`, `stripNamePrefix`, `stripNameSuffix` (op). T1 owns shared/server/apply-ops + bulk/runner regressions; T2 owns dialog/locales/dialog-ui regression + release files. File sets are disjoint; T2 codes against §2/SPEC §2 without waiting on T1.

## 5. Validation (fresh runs, per task)

`node tests/card-editor-bulk.regression.mjs` · `node tests/card-editor-runner.regression.mjs` · `node tests/card-editor-dialog-ui.regression.mjs` · `node tests/card-editor-panel-ui.regression.mjs` · `npm run lint` · `npm run format:check` (T2 additionally: package rebuild + locale sync commands per AGENTS.md release section).
