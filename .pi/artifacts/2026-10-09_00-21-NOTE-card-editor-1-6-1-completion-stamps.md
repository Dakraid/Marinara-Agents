# NOTE — Card Editor 1.6.1 completion stamps (tasks #267–#271)

From coordinator, 2026-10-09. SPEC: `2026-10-09_00-04-SPEC-card-editor-1-6-1-rp-chat-parallelism-bulk-settings-entity-decode-in-views.md`.

## Marinara-Agents (commit `17005c4e`, pushed to `customized` → github.com/Dakraid/Marinara-Agents)
- **F1** `routes.ts`: POST `/sessions` fills omitted `config.concurrency` with `min(16, settings.maxParallelAgents ?? 4)` after `normalizeSessionConfig`, before coercion/storage; explicit values + re-run configs untouched. `coerceConfigForSettings` now takes settings as a param (single settings read per create).
- **F2** `BulkDispatchDialog.tsx`: no remembered concurrency → field initializes to `parallelCap` once connections settle (`concurrencyInitializedFromCap` ref guard); remembered values keep clamp-down-only.
- **F4** `VerdictQueue.buildFieldPreviews` + `panel-status.summarizeItemChanges`: display-only `decodeXmlEntities` on `newText` and `oldText` fallback; snapshots raw; write path unchanged.
- Bonus root fix: `api.ts` now re-exports `BulkSettings` (pre-existing 1.6.0 typecheck break; `typecheck-packages.mjs card-editor` green).
- Release: manifest + builder table + CHANGELOG at **1.6.1**; historical `artifacts/card-editor-1.6.0.zip` restored byte-identical after the failed intermediate build re-stamped it.
- Gates green (fresh): `npm run check`, `test-catalog-lanes`, `validate-package-locales`, `validate-catalog`, `catalog-release-notes.regression`, all 6 `tests/card-editor-*.regression.mjs` (routing pin → 1.6.1).
- Regression pins added: A1 fill semantics (panel-ui route harness), F2/F4 source contracts (dialog-ui/panel-ui), F4 decode counts incl. raw-snapshot counter-case.

## Marinara-Engine (commit `a2d7ac8cc`, pushed to `customized` → scm.netrve.net Gitea; CI publishes `netrve/marinara-engine:customized-latest`)
- **F3** `CardEditorProcessDialog.tsx`: "Parallel agents" number field (1–16, clamped, touched-ref prefill from `GET /card-editor/settings` → `maxParallelAgents ?? 4` via useQuery, `api.get` path parity with the sessions POST); sends `config.concurrency`; Revision radio selected-but-`disabled` + hint under `disableAutoVerdicts` (server auto→confirm coercion stays authoritative).
- Locale keys: `ui.chat.chatsettingsdrawer.processParallelAgents{,Hint}`, `processOutputRevisionDisabled`; CHANGELOG `[Unreleased]` entry.
- Verified by coordinator (fresh): `pnpm --filter @marinara-engine/client lint` (eslint + tsc client lanes) exit 0, `pnpm localization:check` exit 0, diff review vs SPEC F3.

## Live verification left to the user (per convention)
- RP Chat "Process characters with Card Editor" dialog: parallel field prefills from panel settings; Revision disabled with hint when require-review is on; dispatch runs at chosen concurrency.
- Queue previews/chips show decoded `&gt;`/`&amp;`/`&#x3C;` text while applied writes stay byte-identical to before.
