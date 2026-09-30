# ARCH — Agent Parameters / Editor Agents / CYOA Button

Companion to the SPEC artifact (2026-09-30_14-50). This is the implementation blueprint. Two repos: Marinara-Agents (packages) and Marinara-Engine (runtime + client). Engine work ships as `TASK-1.md`…`TASK-6.md` at `/home/netrve/Source/Marinara-Engine/` root — full contents in §3; the Coordinator materializes them first, then executes them (feature branches in both repos).

## 1. Parameter architecture (connection-wins with package fallback)

**Existing machinery (do not rebuild):** `generationParametersSchema` (Engine `packages/shared/src/schemas/prompt.schema.ts:96-146`) — temperature, topP, topK, minP, maxTokens, maxContext, frequencyPenalty, presencePenalty, reasoningEffort, verbosity, serviceTier, assistantPrefill, customThinkingTags, customParameters, managedCustomParameters, enabledParameters (per-key send map), stopSequences, etc. Stored per connection in `connections.defaultParameters` (db/schema/connections.ts:70). Per-agent sparse overlay `settings.generationParameters` (AgentEditor UI → `applyAgentGenerationParameterOverrides`, agent-generation-parameters.ts:34-109 → agent-resolution.ts:544-548 → `agentRequestParameters`, agent-executor.ts:576-634). Pipeline agents are ALREADY fully parameterized; the deficit is call sites outside the pipeline.

**The fix pattern (apply everywhere):** when resolving request options, an EXPLICITLY-STORED connection/agent param wins; the call-site literal becomes the fallback:
```
temperature: explicitStored?.temperature ?? LITERAL_FALLBACK
```
"Explicitly stored" = present in the raw stored JSON (before schema defaults fill 1.0) or enabled via `enabledParameters`. Implementation: add a helper near `resolveStoredChatOptions` (services/generation/generation-parameters.ts:53-88), e.g. `resolveSamplingWithFallback(stored, { temperature, topP, ... })`, that distinguishes explicit-vs-default (parse raw stored parameters; treat key presence as explicit).

**Capability host root fix (world map agent):** `capability-language-model.service.ts:96-114` currently does `overrides?.temperature ?? options.temperature ?? parameters.temperature` — any package-passed literal silently beats the connection. Change to: `overrides?.temperature ?? explicitConnection?.temperature ?? options.temperature ?? parameters.temperature` (same for topP/topK/minP/penalties/reasoningEffort/verbosity/serviceTier). This single change makes hierarchical-maps (0/0.55/0.55), memory-nag (0.2 + reasoningEffort none), and every future capability package connection-wins WITHOUT package edits; package literals remain documented fallbacks. Package-side edits (#190) are then limited to the vendored-provider packages (noodle/slurp/slurp2 no-merge sites).

**Caveats:** Anthropic clamps temperature to [0,1]; o-series/GPT-5 strip samplers (providers already handle); `suppressModelParameters` overrides everything when true; silent param retry (temperature-retry.ts) stays as-is.

## 2. Editor agents (packages) + gates (Engine)

**card-editor / lorebook-editor** are prompt-only packages (shape: manifest.json + agents.json + locales). Both: `phase: post_processing`, `enabledByDefault: false`, `defaultSettings.runInterval: 0` (manual-only), `defaultSettings.resultType` (`character_card_update` / `lorebook_update`), `defaultTools: ["search_lorebook"]`. Result JSON contracts identical to card-evolution-auditor / lorebook-keeper so existing appliers + approval flows apply unchanged.

**Engine gates to widen (agent-executor.ts `buildAgentExtras`):** `<character_cards>` (:3018, today `agentTypes.includes("card-evolution-auditor")`) → add both editor ids; `<existing_entries>` (:3244) + `<writable_lorebooks>` (:3255, today `"lorebook-keeper"`) → add both editor ids. Rationale: Card Editor consumes lorebooks (`<existing_entries>` + `activatedLorebookEntries` config + `search_lorebook`); Lorebook Editor consumes cards (`<character_cards>` + `contextSources.characters` → `<lore><characters>` block :2886-2925). Also widen `agent-cadence.ts` `runInterval===0` manual-only check (illustrator-only today) to both editor ids.

**Directive delivery:** the editor-run UI collects a free-text user directive. Route puts it in `context.memory._directive`; add a small block in `buildAgentExtras` emitting `<directive>...</directive>` when present (no existing macro covers it). Prompt templates reference `<directive>`.

## 3. Engine TASK files (write verbatim to Engine root, then execute)

### TASK-1.md — Connection-wins parameter cleanup
Scope + full inventory per SPEC §inventory. Steps: (1) add `resolveSamplingWithFallback` helper (explicit-stored-wins) in generation-parameters.ts + unit regression; (2) flip capability-language-model.service.ts precedence (host fix); (3) sweep the 25+ call sites (illustrator ×2, game.routes ×10, conversation-calls ×3, call-summary, schedule, auto-summary, selfie, captioning, agents.routes rewrite, custom-assets, gallery ×2, bulk-tags ×2, scene ×2, turn-game-bot ×3, professor-mari, DJ Mari, smart selector, image-generation fallback) replacing literals with `explicitStored ?? literal`; (4) EXEMPT: probes, sidecar, translation (leave untouched); (5) agent-executor DEFAULT_AGENT_TEMPERATURE 0.7 + beholder 0 stay (true fallbacks). Gate: `node ./scripts/run-regressions.mjs` green + targeted grep shows no remaining un-merged literals in scope.

### TASK-2.md — Widen context gates for editor agents
agent-executor.ts:3018/:3244/:3255 add `card-editor`,`lorebook-editor`; agent-cadence.ts runInterval-0 check add both ids; add `<directive>` block in buildAgentExtras from `context.memory._directive`. Gate: regression suite + manual verify sections appear for editor agent runs.

### TASK-3.md — POST /api/agents/editor-run (blocked by TASK-2)
New route in `packages/server/src/routes/agents.routes.ts` (prefix `/api/agents`). Body: `{ agentType: "card-editor"|"lorebook-editor", characterId?, lorebookId?, entryIds?, referenceLorebookIds?, referenceCharacterIds?, connectionId?, directive? }`. Flow: allowlist agentType (400 otherwise; 400 with "install package" if not in BUILT_IN_AGENTS); load config via `agentsStore.getByType`/`ensureBuiltinConfig` (agents.storage.ts:124/:156) so settings.generationParameters + promptTemplate overlays apply; load target via characters/lorebooks storage (404); resolve connection: override → config.connectionId → `getDefaultForAgents()` — NO chat fallback, 409 if none; build ResolvedAgent (agent-pipeline.ts:29 shape); synthetic AgentContext: `chatId:""`, `chatMode:"roleplay"`, `recentMessages:[]`, `mainResponse: directive ?? null`, `characters:[target card (rich fields per shared/types/agent.ts:396-417)]` (+ referenceCharacterIds for lorebook-editor), `memory:{ _existingLorebookEntries, _writableLorebooks, _directive }` (from referenceLorebookIds / character-linked books / target book), socket-scoped AbortController (NEVER request.signal — Node 24 pitfall); `await executeAgent(config, context, provider, model)` (agent-executor.ts:793); respond plain JSON `{ success, resultType, data, error?, model, connectionName, durationMs }`. Guards: per-target concurrency Map (mirror activeAgentRuns), entry-count cap 50 (413). Why reuse executeAgent: owns template rendering, message building, JSON parsing, retries, result contract — a from-scratch runner duplicates ~800 lines and drifts.

### TASK-4.md — Card Editor UI (blocked by TASK-3)
`CharacterEditor.tsx` (:303; character = `useUIStore(s=>s.characterDetailId)`; mounted AppShell.tsx:907): "Run Card Editor" header button → modal/panel with directive textarea + collapsed reference-lorebook multi-picker (default: character-linked books) + connection override select (default: agent default). On run → POST editor-run → new `components/characters/CardEditorProposalPanel.tsx`: per-edit rows (field name, reason, old/new diff) with accept/reject checkboxes; "Apply selected" → existing character PATCH (use-characters.ts); versions endpoints give undo. Apply-time guard: re-validate each `oldText` against current field value; refuse stale edits with "card changed since run". Local useState only.

### TASK-5.md — Lorebook Editor UI (blocked by TASK-3)
`LorebookEditor.tsx` (:416; mounted AppShell.tsx:910): "Run Lorebook Editor" header button + scope toggle: whole book (default) | selected entries (reuse bulk-selection from LorebookBulkEditPanel/LorebookEntryRow → entryIds). Directive input + optional reference-character picker (default none). New `components/lorebooks/LorebookEditorProposalPanel.tsx`: create/update/delete rows with content diff; apply updates via entries bulk PATCH (use-lorebooks.ts:362), creates/deletes via single-entry endpoints. Same stale-content re-validation + local state.

### TASK-6.md — Permanent CYOA regenerate button
`ConversationMessageActions.tsx` is presentational (props :29-62). Add optional props `onRegenerateCyoa`, `cyoaRegeneratePending`; place a Dices-icon `MsgAction` ("Regenerate choices") immediately after the RefreshCw regenerate action (:121-128); Loader2 spinner while pending; disabled while chat streaming. Consumers `ConversationMessage.tsx` / `ConversationMessageGrouped.tsx` compute gating: `!isUser` && cyoa in chat's EFFECTIVE agent set (non-empty chat agents list must contain cyoa; empty list = global set, shared/types/chat.ts:326) && roleplay mode. Works on ANY assistant message: pass `forMessageId: message.id` — retry route scopes + persists choices to that message's extra (retry-agents-route.ts:3437-3439). New hook `packages/client/src/hooks/use-cyoa-reroll.ts`: `useCyoaReroll(chatId, messageId?)` wrapping `retryAgents(chatId, ["cyoa"], { forMessageId })` (use-generate.ts:3618; honors busy-guard :3624) + pending state. Refactor `CyoaChoices.handleReroll` (:211-224) to `useCyoaReroll(chatId)` (no forMessageId = live re-roll). KEEP BOTH buttons: actions-bar = "regenerate choices for THIS message"; choice-bar = "re-roll CURRENT live choices". Known behavior: regenerating an older message updates its swipe extra silently (live bar hydrates only from last assistant message, CyoaChoices.tsx:84-93) — intended; note in code comment. Verify `forMessageId` + cyoa passes route validation.

## 4. Sequencing

- Parallel track A (this repo): #190 (param cleanup) ∥ #191/#192 (packages) — independent of each other; catalog rebuild serialized at the end of each.
- Parallel track B (Engine): TASK-1 ∥ TASK-6 (independent); TASK-2 → TASK-3 → TASK-4/TASK-5 chain.
- Cross-repo: #191/#192 behaviorally depend on TASK-2 (sections) and TASK-3 (trigger); authoring can proceed immediately, live verification after TASK-3.
- Final: #200 cross-repo validation + docker image (`netrve/marinara-engine:customized`) rebuild+push.

## 5. Risks
1. Prompt drift: editor prompts must not reference chat-only sections — covered by package regression tests + editor-run dry-run.
2. Gate widening lets editor agents receive the sections in normal chat runs too — acceptable; cadence-disabled via runInterval 0.
3. No chat connection fallback → 409 when no default-for-agents connection; UI deep-links to connection settings.
4. Whole-book lorebook runs can exceed context → 50-entry cap (413).
5. Stale proposals: apply re-validates oldText/content against current values.
6. Capability-host precedence flip changes behavior for ALL capability packages when a connection explicitly sets params — intended (that's the feature); defaults unchanged otherwise.
7. `packagedAgentDefinitionSchema` is `.strict()` — all new knobs inside `defaultSettings` only.
