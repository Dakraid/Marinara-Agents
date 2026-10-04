# SPEC — Card Editor: apply reliability, behavior character, bulk operations

Approval: user work order 2026-10-04 + Design Deck selections 2026-10-04 (see DESIGN.md §1–§4 and deck export). Companion: ARCH 2026-10-04 (Card Editor bulk + engine deltas), SCOUT-REPORT artifacts same date.

## 1. Goal & users
1. Make proposed Card Editor changes appliable again: eliminate false "card changed since run" blocks (root cause proven: oldText reflects XML-escaped/macro-resolved/trimmed prompt context, compare target is the raw stored field) and give the user an always-available override ("user choice matters more").
2. Let a run adopt a pre-existing character card as behavior/style prompt (GM-Narrator analog), e.g. a "Character Generator" card.
3. Bulk Card Editor: run on 1..N selected characters from the character selection action bar, with per-dispatch configuration, batching with structured multi-character calls, automatic overflow recovery, retries, editable failed requests, and full run management on the agent config page.

Users: the instance owner (single user, power user). Success = all acceptance criteria below pass with fresh validation commands.

## 2. Non-goals (v1)
- Behavior character for the in-chat scheduled post_processing runs (only explicit editor runs: per-card panel + bulk dispatch).
- Blending multiple behavior characters (one per card max).
- "Prompt preset" ≠ engine chat PromptPreset system; presets are the agent's prompt template variants (+ custom template per dispatch).
- No new engine background-job/SSE infrastructure (package-owned runner with REST polling).
- No changes to Lorebook Editor result flow beyond shared staleness mechanics if touched by the shared helper.
- About Me stays out of bulk editing targets and out of `<character_cards>` context (unchanged).

## 3. Functional requirements

### F1 — Staleness correctness + always-apply (engine)
F1.1 `character_card_update` results (both paths: chat-less `POST /api/agents/editor-run`, in-chat agent results) carry per-field snapshots of the exact text the model saw (`cardPromptText(field)` after comment-strip/trim; in-chat: after macro resolution) keyed by `characterId`+field.
F1.2 A row is stale iff `cardPromptText(currentFieldValue)` ≠ snapshot (legacy results without snapshots: fall back to `current.includes(oldText)`).
F1.3 Apply is never disabled. Fresh rows apply immediately; stale rows apply via inline confirmation (Apply anyway / Skip); [Apply selected] with stale rows shows one summary confirmation then applies (skip-stale option). Semantics: whole-field replacement with `newText`, standard character PATCH, automatic revision snapshot (`versionSource:"agent"`). The in-chat modal's append-on-override is removed.
F1.4 In-chat context build no longer mutates `charInfo` in place for card-edit agents (copies only), so snapshots and prompt text are faithful.
F1.5 Regression: a run over a card whose fields contain `&`, `<`, `'`, `"`, `{{char}}`, `{{user}}`, `{{// comment}}`, and leading/trailing whitespace produces a result whose rows are all fresh and appliable; a genuinely-edited field is stale; force path (inline confirm) writes the field.

### F2 — Behavior character (engine + package)
F2.1 Per-card run panel gains a Behavior character picker (search-select, None default, localStorage persistence of last choice); `editor-run` accepts `behaviorCharacterId`; server injects the `<behavior_character>` block (DESIGN §4 format: name, description, personality, backstory, appearance, + system_prompt when present; GM-mode field assembly as template) into the agent system prompt.
F2.2 Bulk dispatch supports a session-level behavior character plus per-target overrides (None = no block for that card).
F2.3 The block is prompt data only: it never overrides the directive contract; the agent prompt states the HOW/WHAT split.

### F3 — Bulk dispatch (package)
F3.1 Selection action bar button "Card Editor" (package installed, ≥1 character selected) opens the bulk dialog preloaded with selected characters.
F3.2 Dialog sections per DESIGN §2: Targets (per-card note + style override), Model (connection, preset: Standard/Strict/Rebalancing/Custom), Instructions (global instruction, behavior character, global lorebooks), Processing (mode, batch size 1–16 default 4, provider retries 0–5 default 2, refusal retries 0–5 default 3, concurrency 1–4 default 1, rebalance toggle), Saving (in-place confirm / in-place auto / duplicate). Live call-count estimate. Last-used config remembered.
F3.3 Dispatch modes:
- individual — one LLM call per card (bounded by concurrency);
- batched — one call per batch of ≤N cards with structured request (XML `<character>` blocks incl. per-card notes/style blocks) and response contract JSON `{ "<characterId>": { "updates": [ {field, oldText, newText, reason} ] } }`; unparseable/missing per-card entries fall back to individual re-runs of just those cards.
F3.4 Context overflow: a call failing with a context-length error is split (halve the batch; recurse to minimum 1) and both halves re-dispatched — "dynamically reduce batch size for that call and dispatch an additional agent for the left items".
F3.5 Retries: provider errors (network/5xx/429/timeout) retried up to providerRetries with backoff; refusals (detector: no parseable updates + refusal markers/short non-committal output) retried up to refusalRetries; exhaustion marks the item failed with the raw output and rendered prompt retained. Invalid JSON retried once with a strict-JSON reminder before counting as parse failure.
F3.6 Editable failed request: "edit & retry" opens the exact rendered prompt (system+user) for editing; re-dispatch uses the edited prompt as a single-card call.
F3.7 Rebalance option adds the field-splitting directive (Description = general identity; Personality = concise traits/temperament/behavior patterns; Backstory = history/origin/formative events; Appearance = physical detail; Scenario = default setting) — moves content between fields, preserving facts; may empty a source field (empty newText allowed only in rebalance mode).

### F4 — Save modes (package)
F4.1 In-place confirm: results wait in session; verdict queue review (DESIGN §3); approve writes revisions.
F4.2 In-place auto: apply immediately on success; cards whose fields genuinely changed since dispatch (snapshot mismatch) are held as needs review (never blindly overwritten); apply failures mark the item failed with error.
F4.3 Duplicate: duplicate the current card, apply proposed fields to the copy, suffix " (Edited)"; original untouched; result links to the copy.
F4.4 All writes go through the character PATCH/duplicate storage APIs → automatic revision snapshots; no direct storage writes.

### F5 — Run management (package)
F5.1 Sessions panel below agent settings (Agents → Card Editor) per DESIGN §3: active sessions (progress, live status, cancel), session history, item table with statuses and actions (open card, review, rerun, edit & retry, cancel queued).
F5.2 Cancel aborts in-flight calls (provider signals) and marks queued/running items canceled; session completes with partial results.
F5.3 Server restart marks active sessions interrupted on package activation; rerun offers re-dispatch of unfinished items.
F5.4 Sessions persist in package storage (documents); user can delete sessions; no silent pruning.

## 4. Data & trust
- Card content, lorebook entries, user notes are untrusted prompt data; outputs are validated: updates limited to `EDITABLE_CHARACTER_CARD_FIELDS` minus aboutMe for bulk (description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, backstory, appearance), `newText`/`oldText` strings with sane length caps (≤ 100k chars), `characterId` must be a session target; anything else is dropped and logged, item → failed · parse.
- name is never edited (existing rule). No lorebook writes ever.
- Sessions store: config, items, snapshots, rendered prompts (failed items), outputs, statuses, timestamps, version (schema migration field).
- Package server never receives engine secrets; LLM access via capability host only (`languageModels.resolve(connectionId)`).

## 5. Performance
- Batched mode estimate honored: N cards / batch size = calls (plus overflow splits); individual mode = N calls at configured concurrency.
- No client-side polling while panel hidden; poll 2s when visible; no SSE requirement.
- LLM calls capped by AGENT_CALL_TIMEOUT_MS host policy; runner respects cancellation signals.

## 6. Compatibility & delivery
- Engine `customized` branch: new contributions `selectionActions` + `agentPanel`, snapshot fields, `behaviorCharacterId` — capabilityApi minor bump; engine version bump → published package declares that engine.min (per chai-workflow Package Change Lane). Upstream engines below that version never see the package (lane routing).
- Package `card-editor` 1.0.0 → 1.1.0 (minor: additive features) with CHANGELOG entry; graduation from agent-only to feature package (schemaVersion 2, restartRequired true).
- Engine image rebuilt + pushed as `netrve/marinara-engine:customized` after engine work; user live-verifies (live_testing convention).

## 7. Acceptance criteria
AC1 F1.5 regression passes (fresh `pnpm` regression run in Marinara-Engine; command + output cited in task).
AC2 Manual proof: run Card Editor on a card containing apostrophes & `{{char}}` → apply succeeds without stale block; edit a field mid-run → stale row + inline confirm applies on demand.
AC3 Behavior character: dispatch with a style card → engine editor-run prompt and package bulk prompt both contain the identical `<behavior_character>` block; none selected → absent.
AC4 Bulk e2e (user live test): 4-card batched dispatch (batch 4) with global instruction + lorebook + per-card notes + rebalance → 1 call, 4 results, revisions/duplicates per save mode; overflow repro (small max-context connection or oversized lorebook) splits the batch; provider error and refusal each retried then failed with editable retry; cancel mid-run works; session survives restart as interrupted with rerun.
AC5 Management panel shows the session lifecycle with correct statuses and actions.
AC6 Agents repo gates green: `npm run check`, `node scripts/build-feature-packages.mjs card-editor`, `node scripts/sync-package-locales.mjs`, `node scripts/typecheck-packages.mjs card-editor`, `node scripts/test-catalog-lanes.mjs`, `node scripts/validate-package-locales.mjs`, `node scripts/validate-catalog.mjs`, `node scripts/tests/catalog-release-notes.regression.mjs`, `git diff --check`.
AC7 Engine gates green: repo typecheck/build + agent regressions (editor-run, agent-runtime, new staleness regression) pass with cited output.
