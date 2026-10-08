# SPEC — Card Editor: RP Chat parallelism, bulk settings surface, entity decode in views

Date: 2026-10-08. Scope: `packages/card-editor` (Marinara-Agents, branch `customized`) + one engine dialog (Marinara-Engine, user-authorized this run). Ships as Card Editor **1.6.1**.

## Root causes (verified against source)

1. **Serial dispatch despite limit**: `normalizeSessionConfig` defaults `concurrency: 1` (schema.ts). `maxParallelAgents` only caps (`runner.ts` pump: `min(config.concurrency, settings.maxParallelAgents ?? …)`), never raises. The engine RP Chat dialog (`CardEditorProcessDialog.tsx`) POSTs `/card-editor/sessions` without `concurrency` → 1 → always serial. `BulkDispatchDialog` defaults the field to 1 as well.
2. **No bulk settings in RP Chat flow**: engine dialog has no parallelism control and no visibility of panel bulk settings (`maxParallelAgents`, `disableAutoVerdicts`).
3. **Entities in diff/result**: `decodeXmlEntities` (shared text.ts) runs only at write (`planApply`, `buildCombinedCardBlocks`). `VerdictQueue.buildFieldPreviews` (diff + Inspect result view) and `summarizeItemChanges` (word chips) render raw model output.

## Functional contract

### F1 — Omitted concurrency follows panel settings (server, root fix)
- POST `/sessions` (routes.ts): when the raw request body's `config` omits `concurrency`, fill it with `min(16, settings.maxParallelAgents ?? 4)` after `normalizeSessionConfig` and before `coerceConfigForSettings`/storage. Explicit values are untouched (clamp semantics unchanged).
- Fallback 4 = user decision, mirrors the dialog's established "previous ceiling".
- Re-run/run-again paths keep their stored explicit config; no change.

### F2 — Package dispatch dialog defaults to the effective cap
- `BulkDispatchDialog`: when no stored config carries `concurrency`, the field initializes to the live `parallelCap` (connection limit ∩ settings cap) once known. Remembered values keep clamp-down-only behavior. Field semantics otherwise unchanged.

### F3 — RP Chat dialog exposes bulk settings (engine repo)
- `CardEditorProcessDialog` gains a "Parallel agents" number field (1–16), prefilled from `GET /card-editor/settings` → `maxParallelAgents ?? 4`; sent as `config.concurrency`.
- When settings `disableAutoVerdicts` is true: the Revision (saveMode auto) radio is disabled with a hint (server already coerces auto→confirm; this makes it visible instead of silent).
- No connection picker, no retry fields — out of scope (XML transform flow keeps its fixed preset/mode).
- New en.json keys under `ui.chat.chatsettingsdrawer.*`; engine CHANGELOG `[Unreleased]` entry.
- Worker must read `packages/client/.instructions.md` before editing (engine rule).

### F4 — Entity decode for display (client, display-only)
- `VerdictQueue.buildFieldPreviews`: diff, word counts, and full-field preview use `decodeXmlEntities(update.newText)`; the `update.oldText` fallback is decoded too. Snapshots are real card text and stay as-is.
- `panel-status.summarizeItemChanges`: same decode so chips match the view.
- Write path unchanged. Decode stays single-shot at write — stored updates remain raw model output (double-decode of `&amp;lt;` would corrupt).

## Non-goals
- No connection-limit awareness server-side (package host can't see engine connections).
- No schema default change (`concurrency` default stays 1 for explicit-normalize callers; F1 handles omission at the route).
- No decode of stored sessions / no migration.
- No parallelism changes to batched-mode split/retry logic.

## Acceptance criteria
- A1: POST `/sessions` without `config.concurrency` + settings `maxParallelAgents: 5` → stored config `concurrency: 5`; with settings null → 4; with explicit `concurrency: 2` → 2 (pinned by regression).
- A2: Dispatch dialog with empty storage shows concurrency = effective cap; stored value still clamps down only.
- A3: RP Chat dialog sends chosen concurrency; Revision disabled with hint when require-review is on.
- A4: Update `newText` containing `&gt;`/`&amp;`/`&#x3C;` renders decoded in diff lines, full-field preview, and word chips; applied write output unchanged (existing apply tests still green).
- A5: Full gate green (below); package rebuilt at 1.6.1; pushed on `customized`.

## Validation
Targeted during work: `node tests/card-editor-runner.regression.mjs`, `node tests/card-editor-dialog-ui.regression.mjs`, `node tests/card-editor-panel-ui.regression.mjs` (repo runs `.mjs` via `node`; `.ts` via `pnpm exec tsx --tsconfig tests/tsconfig.regressions.json`).
Final gate (last commit only, then push): `npm run check` → `node scripts/test-catalog-lanes.mjs` → `node scripts/validate-package-locales.mjs` → `node scripts/validate-catalog.mjs` → `node scripts/tests/catalog-release-notes.regression.mjs` → `node scripts/build-agent-catalog.mjs card-editor` (after manifest 1.6.1 + CHANGELOG entry) → all `tests/card-editor-*.regression.mjs`.
Engine repo: `pnpm check` in ~/Source/Marinara-Engine.
