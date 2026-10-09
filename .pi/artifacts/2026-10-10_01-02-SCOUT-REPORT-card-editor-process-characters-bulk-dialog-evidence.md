# SCOUT-REPORT — Card Editor process-characters + bulk dialog evidence

Repos: **Marinara-Agents** `/home/netrve/Source/Marinara-Agents` (branch `customized`, HEAD `1138f318`) and **Marinara-Engine** `/home/netrve/Source/Marinara-Engine` (branch `customized`, HEAD `8a4224269`, package.json version **2.5.0**). Package: `card-editor` **1.6.1**. Read-only investigation by Scout agent; persisted by Coordinator.

## 1. Meta Section

### Architecture
- Marinara-Agents hosts ~46 feature packages under `packages/`. Card Editor's engine-shaped source of truth is `packages/card-editor/src/engine/packages/{client,server,shared}` — built by `scripts/build-feature-packages.mjs` (`cardEditorSourceRoot` :102, `cardEditorOwnedSourcePaths` :104-106, feature def :537-560; `serverImport` = `packages/server/src/services/card-editor/server-entry.ts` :548, `clientImport` = `packages/client/src/features/card-editor/client-entry.tsx` :550). Built outputs `client.js`/`server.mjs`/`agents.json` are sha256-pinned in `manifest.json` `files[]` — **verified current today** (recomputed hashes match exactly; no rebuild drift).
- **Marinara-Engine does NOT track** `packages/server/src/services/card-editor` or `packages/client/src/features/card-editor` — not in HEAD and never in history. Engine tracks only: `packages/client/src/components/chat/CardEditorProcessDialog.tsx`, `CardEditorQuickAssign` + `packages/client/src/lib/card-editor-quick-assign.ts`, `packages/client/src/lib/card-xml-transform.ts`, ChatSettingsDrawer wiring, `scripts/regressions/card-editor-behavior-character.regression.ts`, `scripts/regressions/card-editor-quick-assign.regression.ts`, and its own `.pi/artifacts/*card-editor*`. The card-editor tree is package-owned, same lane as long-term-memory/memory-nag/pokedex. The byte-identity contracts that DO exist are **parity contracts**, not file copies:
  - Prompt blocks "byte-identical to the engine's" — `context.ts:8-12` (character block), `context.ts:44-48` + `86-101` (behavior block) vs engine `agent-executor.ts:3209-3235` + `buildBehaviorCharacterBlock`; pinned engine-side by `scripts/regressions/card-editor-behavior-character.regression.ts:24` (`INSTRUCTION_LINE`).
  - Preset templates: `presets.ts:8-14` — `PROMPT_PRESET_TEMPLATES` are byte-identical copies of server `prompts.ts` `PRESETS`, pinned by `tests/card-editor-prompt-presets.regression.mjs`, plus matching `agents.json` `promptTemplates[]`.
  - `manifest.json` `builtAgainst.engineCommit` = `74a2cf9767f5e2428fdb8eaab03380b49abc7c2e` (engine 2026-10-06) — the historical vendoring pin.

### P1 — where the per-run context/prompt is built (verified paths)
1. **Package runner (both dispatch UIs)**: `planDispatch` `runner.ts:637-659` — `mode:"individual"` queues ONE task per item (`{itemIds:[itemId]}`); `mode:"batched"` slices queued items into groups of `config.batchSize` (:645-659). `runTask` filters items to the task ids (:570-576) and calls `assemblePrompt` (:606-620) with `targets` = exactly that task's items. **Per-call card context = only the task's target(s). No chat history, no other characters, ever.**
2. **`assemblePrompt`** (`prompts.ts:118-275`): system = preset/custom template (:129-140; `PRESETS` :58-75) + response contract — `SINGLE_RESPONSE_CONTRACT` :85-88 vs `BATCHED_RESPONSE_CONTRACT` :77-82 when `targets.length > 1` (:119) — + `<global_instruction>` (:145-147) + lorebook blocks (:148-149; `buildLorebookBlocks` `context.ts:105-130`, caps 4 000/entry, 24 000 total `context.ts:84-85`). User = one `<character id=… name=…>` block per target (`buildCharacterBlock` `context.ts:56-83`, field order :50-61) with optional `<user_note>` (:74-76) and `<behavior_character>` (:77-79); batched adds `<bulk_edit>` + `<legend>` of `<character_ref>`s (:158-172); rebalance appends `<rebalance_fields>` (:173-174).
3. **Shared session material** (repeats in EVERY call of a session): `SessionPromptMaterial` = lorebooks + session behavior character + per-target `behaviorOverrideCards`, captured once at `POST /sessions` (`routes.ts:355-360`) **from the request body only** — the server never fetches engine data (routes.ts header Decision 1, :5-12). Consumed in `runTask` (:632-647); per-target override resolution `resolveBehaviorCharacter` (`runner.ts:160-181`).
4. **RP-chat "Process characters" path** (engine dialog): `CardEditorProcessDialog.tsx` submit (:118-153) fetches each CHECKED member's full character row (:121-125, GET `/characters/:id`), builds `targets` = checked members only (:126-130) and POSTs `/card-editor/sessions` (:136-152) with `mode:"individual"` **hardcoded** (:139), `presetId:"xml-simple"|"xml-complex"` (:141), `globalInstruction = buildXmlTransformGlobalInstruction(form, notes)` (:142; engine `card-xml-transform.ts:46-57`), `saveMode: revision→"auto" | "duplicate" | "combined"` (:143), `concurrency: parallelAgents` (:144; prefilled from `GET /card-editor/settings` `maxParallelAgents ?? 4`, :92-104). **Conclusion: every run in this flow receives exactly its own one character.** Members = ALL chat members pre-checked (:84; prop from `ChatSettingsDrawer.tsx:10305` = `puppeteerMemberRows` :1483-1496 over `chatCharIds` :1345-1348) — so N parallel runs happen (one char each), not one run with N chars.
5. The only package-side multi-character-per-call surface is **batched mode** (opt-in in BulkDispatchDialog; the RP dialog never sends it), plus the session-wide lorebook/behavior material above.
6. The genuine "ALL chat characters in one prompt" surface is **ENGINE-side in-chat**: `agents.json:4-32` registers the agent `phase:"post_processing"`, `defaultSettings.contextSources.characters:true`, `resultType:"character_card_update"`, `runInterval:0` (disabled by default). In-chat runs build `<character_cards>` from `context.characters` = **ALL chat characters, full fields** (`agent-executor.ts:3209-3235`, gated :3213-3218), plus `<behavior_character>` (:3240-3252), `<existing_entries>` (:3452-3484), `<writable_lorebooks>` (:3494-3515). The chat-less `POST /api/agents/editor-run` is single-character: `characterIds = [targetId]` (`agents.routes.ts:416`); behavior char :425-441.

### P2 — dialog mapping
- **Engine `CardEditorProcessDialog.tsx` option surface**: members checklist (all pre-checked), Card form simple/complex (+preview), Output radio — "Save as latest revision to each character" (default → saveMode `auto`; disabled+hint when `settings.disableAutoVerdicts`), "Duplicate each character" (name prefix default `${chatName} `), "Combine into one card" (combined name default `${chatName} — Cast`), Parallel agents 1–16 (prefilled from settings `maxParallelAgents ?? 4`, `clampParallelAgents` :40), Additional notes textarea (appended to globalInstruction). On success: POST, then `window.dispatchEvent(new CustomEvent("marinara:capability-overlay", { detail: { packageId: "card-editor", action: "open", payload: { sessionId } } }))` (:146-151) — opens the **PACKAGE's** overlay on the session detail. i18n: engine `en.json:5525-5549` (flat `ui.chat.chatsettingsdrawer.process*`). Entry: ChatSettingsDrawer Group-Chat section button (:6711-6730), gated `cardEditorAvailable` = `isCapabilityPackageAvailable(useInstalledCapabilityPackages(chatCharIds.length > 1), "card-editor")` (:1351-1352); sibling `CardEditorQuickAssign` (:6729).
- **Package `BulkDispatchDialog.tsx` surface today**: Targets — rows preloaded from selection at open (:76-105), per-card note + per-card style override, removable; Model — connection + preset standard/strict/rebalance/xml-simple/xml-complex/custom + customTemplate (:400-448); Instructions — globalInstruction, session behavior character, global lorebooks (:456-530); Processing — mode individual/batched (:546-568), batchSize 1-16, providerRetries 0-5, refusalRetries 0-5 (:569-589), concurrency 1-parallelCap (:590-597), rebalance toggle (:598-605), completionMode ask/apply/duplicate (:606-627); **Saving — confirm/auto/duplicate only, NO "combined"** (:629-657); footer live estimate (`estimateBulkCalls` `session-config.ts:34-47`) + dispatch (:276-305 materializes override cards, behavior card, lorebook entries client-side → `createSession`; the server never fetches engine data). parallelCap = connection `maxParallelJobs` ∩ settings.maxParallelAgents (:205-223); F2 init-at-cap when nothing remembered (:225-234).
- **Mounting / reuse path**: the overlay workspace is the host — `OverlayWorkspace.tsx` renders `BulkDispatchDialog` when opened with `dispatch.characterIds` (:98-109) via window event `marinara:capability-overlay` (payload `{sessionId?, dispatch?}` :14-17; handler :39-62). Selection action button: `client-entry.tsx:30-47`. **The engine dialog already dispatches the same overlay event with `{sessionId}` — switching it to `{dispatch:{characterIds}}` opens the package BulkDispatchDialog preloaded with the chat's characters; no new API needed.** There is no package-side "enumerate current chat characters" API; ids arrive via selection props or overlay payload.
- **"Combine into one" exact semantics**: config `saveMode:"combined"` + `combinedCardName` (required; `schema.ts:253-255`). Dispatch unchanged (each character edited individually; XML presets make each card's ONE update a complete XML document in `description`). `planApply` returns `collectForCombine` per item — no per-card write (`apply.ts:98-106`); client executes it as a no-op (`apply-ops.ts:57-58`). Finisher `combineCollectedSession` (`apply-ops.ts:213-234`): collects each **applied** item's `description` newText, entity-decodes, joins `"\n\n"` (`buildCombinedCardBlocks` :201-210), `createHostCharacter({name: combinedCardName||label, description: joined})`, then `POST /sessions/:id/combine` records `resultCardId`+itemIds (409 unless `confirmPartial`; `routes.ts:661-717`). UI: `SessionDetail.tsx:239-246`, `:273-275`. It is **ONE NEW card whose description concatenates every character's generated XML document — NOT a merge of edits into a single existing character**. Only the RP dialog exposes it today.
- **Save modes**: `SaveMode = "confirm" | "auto" | "duplicate" | "combined"` (`schema.ts:15`). RP "Save as latest revision" = `saveMode:"auto"` → `succeedItem` sets `autoApply` (`runner.ts:203-215`) → panel auto-drives verdict approve → `planApply` `patchField` ops with `versionSource:"agent"`, `versionReason:"Card Editor bulk: <label>"` (`apply.ts:117-124`), executed client-side `PATCH /api/characters/:id {data, versionSource, versionReason}` (`apply-ops.ts:60-67`) → engine revision snapshot. `confirm` = manual verdict queue. `duplicate` = `duplicateThenPatch` (engine copy " (Copy)", rename — prefix wins over suffix default " (Edited)"; `apply.ts:98-114`, `apply-ops.ts:69-95`). Settings `disableAutoVerdicts` coerces auto→confirm + completionMode→ask at every create/rerun (`routes.ts:306-316`). RP dialog sends no completionMode → "ask"; its duplicate sends `duplicatePrefix`.
- **Parallelism today**: schema default `concurrency:1` (`schema.ts:249`); F1 route fill `min(16, settings.maxParallelAgents ?? 4)` when body omits it (`routes.ts:342-352`, `configOmitsConcurrency` :228-232); pump caps to `min(config.concurrency, settings.maxParallelAgents ?? config.concurrency)` (`runner.ts:276-282`); panel Bulk settings UI `RunsPanel.tsx:37-94` (maxParallel 0→null, disableAuto) via `GET/PUT /card-editor/settings`; dialog cap + cap-default init (`BulkDispatchDialog.tsx:205-234`); RP dialog field prefilled from settings.

### Gotchas
- `.ts` import specifiers are REQUIRED in engine-shaped sources — regressions run under plain Node type-stripping (`context.ts:13-15`, `session-config.ts:1-3`, `apply-ops.ts:7`).
- Prompt/parser lockstep: "A call is batched iff it carries more than one target" (`prompts.ts:4-6`); change `parse.ts` together.
- The RP dialog POSTs through the ENGINE api client to the package's privileged route (`/api/card-editor/*`, prefix registered `server-entry.ts:37-39`); it never uses the package client bundle.
- Route caps: targets ≤ 500; field/globalInstruction ≤ 100 000 chars; lorebooks ≤ 50 books × 500 entries (`routes.ts:66-71`, :322-341).
- Overflow: batched call overflow splits ⌈n/2⌉ recursively to single cards; single-card overflow fails as provider (`runner.ts:371-404`, :452-459, `splitItemIds` :96-100).
- Edit-retry posts a verbatim prompt override as a single-card call (`runner.ts:723-749`, route :478-493).
- Engine HEAD (2.5.0) already merged upstream staging after `a2d7ac8cc` (the 1.6.1 dialog change); check the dialog file for upstream drift before editing.
- `manifest.json` hashes match built outputs today — any src change requires rebuild via `build-feature-packages.mjs` (rewrites manifest hashes).
- Bash-guard false positives occurred on read-only pipelines (reported: FP-#1); use `git -C` and the grep tool.

### Task recommendations (from Scout)
- **P1**: (a) If "one character in, one character out" is absolute, batched mode is the package-side violation surface — it lives in `runner.ts:645-659` (planning), `prompts.ts:77-82,119,158-172` (contract), `parse.ts` (parser) and both UIs' mode options; the RP flow is already compliant (individual hardcoded). (b) The engine in-chat post-processing agent is the only path passing ALL chat characters into one prompt (`agent-executor.ts:3209-3235`); scoping that to the operated character is an ENGINE change (or a package `defaultSettings.contextSources.characters` semantics change in `agents.json`).
- **P2**: Reuse path already exists end-to-end — engine dialog should stop POSTing and instead dispatch `marinara:capability-overlay` with `{dispatch:{characterIds}}`. Package gap for parity: expose `saveMode:"combined"` (+ combinedCardName field) in BulkDispatchDialog's saving section — server, apply planning, client execution, and SessionDetail UI already fully support it; optionally label auto as "latest revision". Do NOT edit `BulkDispatchDialog.tsx`/`schema.ts`/`locales` in parallel with anything that rebuilds `client.js` — regenerate outputs and manifest hashes afterwards.
- Files that belong together (package): `schema.ts` + `BulkDispatchDialog.tsx` + `locales/en.json` + `localization.ts`; engine: `CardEditorProcessDialog.tsx` + engine `en.json` keys + ChatSettingsDrawer trigger. Cross-repo parity pairs: `context.ts`/`prompts.ts` ↔ engine `agent-executor.ts` blocks + `card-editor-behavior-character.regression.ts`.

### Tool hints
- Agents repo: `npm run check`; `node scripts/build-feature-packages.mjs card-editor`; `node scripts/typecheck-packages.mjs card-editor`; `node scripts/sync-package-locales.mjs`; `node scripts/validate-package-locales.mjs`; `node scripts/validate-catalog.mjs`; `node scripts/test-catalog-lanes.mjs`; targeted: `node tests/card-editor-{bulk,dialog-ui,panel-ui,prompt-presets,routing,runner}.regression.mjs`.
- Engine repo: `pnpm check`; behavior parity regression `scripts/regressions/card-editor-behavior-character.regression.ts` (imports engine `agent-executor.js`; sets `DATA_DIR`/`MARINARA_LITE`/`NODE_ENV=test`/`LOG_LEVEL=silent`).

### Omitted
Full text of `llm.ts`/`parse.ts`/`session-store.ts`, `VerdictQueue.tsx`, `RunsPanel.tsx`, `SessionDetail.tsx`, `EditRetryDialog.tsx`, `DialogTargets.tsx`, `styles.ts`, `BehaviorCharacterSelect.tsx`, `agents.json` tail, engine `ChatSettingsDrawer.tsx` (11 417 lines — cited ranges only). Spot-cited via grep/read ranges.

## 2. File Map

```
/home/netrve/Source/Marinara-Agents
├── packages/card-editor
│   ├── manifest.json * +                  (1.6.1; sha256 pins verified current)
│   ├── agents.json +                      (post_processing agent; contextSources.characters:true)
│   ├── client.js / server.mjs             (built outputs, pinned, current)
│   ├── engine-boundary.json               (capabilityApi 1.68, builtAgainst 2.4.8 @74a2cf97)
│   ├── locales/en.json *                  (package UI strings)
│   ├── CHANGELOG.md                       (1.6.1 head)
│   └── src/engine/packages
│       ├── client/src/features/card-editor
│       │   ├── BulkDispatchDialog.tsx * + (P2 surface; no combined)
│       │   ├── OverlayWorkspace.tsx +     (overlay event + preloaded dispatch)
│       │   ├── client-entry.tsx +         (selection action / panel / overlay views)
│       │   ├── apply-ops.ts +             (op execution + combine finisher)
│       │   ├── api.ts +                   (all endpoints)
│       │   ├── session-config.ts +        (stored config + estimate)
│       │   ├── presets.ts +               (byte-identical preset copies)
│       │   └── DialogTargets/VerdictQueue/RunsPanel/SessionDetail/… (spot-cited)
│       ├── server/src/services/card-editor
│       │   ├── routes.ts * +  ├── runner.ts * +  ├── context.ts * +
│       │   ├── prompts.ts * +  ├── apply.ts * +  └── server-entry.ts +
│       └── shared/src/features/agents/card-editor
│           ├── schema.ts * +              └── text.ts
├── scripts/build-feature-packages.mjs * + (card-editor build def :102-106, :537-560)
├── tests/card-editor-*.regression.mjs     (6 files)
└── .pi/artifacts/2026-10-04_17-45-SPEC…, 2026-10-09_00-04-SPEC… (prior specs)

/home/netrve/Source/Marinara-Engine
├── packages/client/src
│   ├── components/chat/CardEditorProcessDialog.tsx * +  (P1+P2 engine dialog, 404 lines)
│   ├── components/chat/ChatSettingsDrawer.tsx +         (entry :6711-6730; mount :10302-10307; members :1483-1496)
│   ├── components/chat/CardEditorQuickAssign.tsx        (sibling quick-assign)
│   ├── components/characters/CardEditorProposalPanel.tsx (per-card panel → POST /agents/editor-run :238)
│   ├── lib/card-xml-transform.ts +                      (XML forms + instruction builder)
│   ├── lib/card-editor-quick-assign.ts
│   └── localization/locales/en.json +                   (process* keys :5525-5549)
├── packages/server/src
│   ├── routes/agents.routes.ts +                        (editor-run :328-470; single char :416)
│   └── services/agents/agent-executor.ts * +            (<character_cards> all-chat :3209-3235)
│   (NO services/card-editor, NO features/card-editor — not tracked, never were)
└── scripts/regressions/card-editor-behavior-character.regression.ts +   (parity pin)
```
`*` likely needs modification, `+` contents/ranges in section 3 of this report (see full ranges cited inline above).

## 3. Key code excerpts (exact ranges)

### Engine dialog — `packages/client/src/components/chat/CardEditorProcessDialog.tsx`
:83-92 (state): form simple/complex; output `"revision" | "duplicate" | "combined"`; prefix default `` `${chatName} ` ``; combinedName default `` `${chatName} — Cast` ``; notes; parallelAgents default 4.
:126-152 (submit): targets from checked members (full card payload via `toCardPayload`); POST `/card-editor/sessions` with `mode:"individual"` hardcoded, `presetId: xml-simple|xml-complex`, `globalInstruction: buildXmlTransformGlobalInstruction(form, notes)`, `saveMode: revision→"auto" | "duplicate" | "combined"`, `concurrency: parallelAgents`, optional `duplicatePrefix`/`combinedCardName`; then overlay event `{payload:{sessionId}}`.
:29-59 fields sent per card: `["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions"]` + name + `extensions.backstory/appearance`.

### Engine XML transform — `packages/client/src/lib/card-xml-transform.ts`
:46-57 `buildXmlTransformGlobalInstruction(form, extraNotes)` — "Transform the character card into the complete {Simple|Complex} XML character document below… Output only the XML document." + notes appended.

### Engine in-chat context — `packages/server/src/services/agents/agent-executor.ts`
:3209-3235 `<character_cards>` loop over ALL `context.characters` for agent types card-evolution-auditor | card-editor | lorebook-editor; :3240-3252 `<behavior_character>` for card-editor.

### Engine editor-run — `packages/server/src/routes/agents.routes.ts`
:416-419 `characterIds = input.agentType === "card-editor" ? [targetId] : uniqueIds(input.referenceCharacterIds ?? [])`.

### Engine drawer — `ChatSettingsDrawer.tsx`
:1345-1353 gating; :6711-6730 Process button + `CardEditorQuickAssign`; :1483-1496 `puppeteerMemberRows`; :10302-10307 mount `members={puppeteerMemberRows}`.

### Package runner — `runner.ts`
:276-282 pump cap `min(config.concurrency, settings.maxParallelAgents ?? config.concurrency)`; :606-620 `assemblePrompt` with task targets only; :637-659 `planDispatch` individual=one item per task, batched=groups of `batchSize`.

### Package prompts — `prompts.ts`
:77-88 contracts; :118-119 `const batched = input.targets.length > 1;`; :129-149 system assembly; :156-175 user assembly; :40-52 `xmlTransformTemplate` (ONE update per card, field "description", newText = complete XML document).

### Package routes — `routes.ts`
:342-352 concurrency fill; :306-316 `coerceConfigForSettings`; :355-360 material from body only; :498-507 verdict saveMode resolution; :661-717 `/sessions/:id/combine` (409 unless `confirmPartial`).

### Package apply — `apply.ts` / `apply-ops.ts`
:98-127 `collectForCombine` / `duplicateThenPatch` (prefix wins over suffix) / `patchField` `{versionSource:"agent", versionReason:"Card Editor bulk: <label>"}`; `apply-ops.ts:57-58` combine no-op per item; :201-210 `buildCombinedCardBlocks`; :213-234 `combineCollectedSession` → `createHostCharacter` + `submitSessionCombine`.

### Package dialog — `BulkDispatchDialog.tsx`
:47-64 state; :76-105 target load; :205-234 parallelCap + F2 init; :276-305 dispatch payload; :546-568 mode radio; :629-657 saving radios (no combined).

### Package schema — `schema.ts`
:15 `SaveMode`; :16 `CompletionMode`; :249 concurrency bounds; :253-255 combinedCardName required for combined; :262-283 `BulkSettings` + defaults.

### Package mount — `client-entry.tsx` + `OverlayWorkspace.tsx`
client-entry :30-47 selection action → `openCardEditorOverlay({dispatch:{characterIds}})`; OverlayWorkspace :11 `OVERLAY_EVENT`; :14-17 payload; :98-109 `<BulkDispatchDialog … characterIds={dispatchIds}>`.

### Package agents.json (head)
:2-32 agent `card-editor` — `phase:"post_processing"`, `enabledByDefault:false`, `runInterval:8`, `defaultSettings.resultType:"character_card_update"`, `defaultSettings.runInterval:0`, `contextSources:{chatHistory:true, characters:true, activatedLorebookEntries:true,…}`; `promptTemplates[]` = 5 presets byte-equal to `prompts.ts`.

### Engine i18n — engine `en.json:5525-5549`
`process*` keys incl. `processOutputCombined` ("Combine into one card"), `processOutputDuplicate`, `processOutputRevision` ("Save as latest revision to each character"), `processParallelAgents`(+`Hint`), `processDialogTitle` ("Process characters with Card Editor").
