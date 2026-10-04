# SCOUT-REPORT: Marinara-Engine extension surfaces for Card Editor bulk/behavior features

## 1. Selection action bar
`packages/client/src/components/ui/SelectionActionBar.tsx` renders `mari-selection-action-bar`; only extension point is engine-internal `extraAction?: ReactNode`. `CharactersPanel.tsx:1799-1825` passes inline buttons (move-to-folder, bulk tags). **No package-facing extension point exists** — a package-contributed button requires an engine change (manifest contribution + render of a `CapabilityElement` into `extraAction` with `selectedCharacterIds`).

## 2. Capability package runtime (full packages)
- Manifest: `packages/shared/src/schemas/capability-package.schema.ts` — permissions enum incl. `agent-runtime, chat-read, chat-write, conversation-actions, mari-actions, network, prompt-context, routes, storage, tools, ui, achievements`; slots incl. `chat-settings, roleplay-tracker, tracker-panel, conversation-toolbar, conversation-surface, home-browser-tab, home-widget, spatial-workspace, chat-runtime, game-world-map, game-surface`; `contributions.agentDetail.agentIds`.
- Server host (`capability-module-runtime.service.ts:98-111` frozen `CapabilityRuntimeHost`): `embeddings/resolveEmbeddings`, `getAgentConfig()` ({connectionId, settings}), `languageModels` (`CapabilityLanguageModelHost`), `logger`, `achievements`, `persistence` (chat/message/game records, `documents`, spatial, `withChatLock`, `transaction` — **no generic job store**), `resources`; `registerPrivilegedRoutes(plugin, {prefix})`, `registerService("agent-runtime:<type>", {prepareContext, finalizeResult})`, `registerPromptContext`, `registerMariActions` (300s deadline).
- **Programmatic LLM**: `capability-language-model.service.ts` — `languageModels.resolve(connectionId?)` / `resolveForRequest` → resolved model with `chatComplete(messages, {signal, temperature, ...})`; connection resolution request→agent config→default; `AGENT_CALL_TIMEOUT_MS` total deadline; agent generation-parameter overrides applied. **Per-call connectionId override EXISTS via `resolve(connectionId)`.**
- Client: served hash-verified at `/api/capability-packages/:id/client`; must `customElements.define("marinara-capability-<id>")`; `CapabilityElement.tsx` views: `surface|setup|setup-apply|settings|toolbar|detail|workspace|runtime|world-map|browser|widget|tracker`; props via `node.capabilityProps` + `marinara-capability-props` event (props include packageId, localization, and host-supplied context e.g. `ChatSettingsDrawer` view=settings passes chatId/agent/connections; `FeatureAgentDetailHost` view=detail passes package/agent/chat info + onClose/onManagePackage).
- `agentDetail` validation (`package-manager.service.ts:1567-1575`): contributed agent must have `execution: "feature" | "host"` — **pipeline agents (card-editor today) are rejected**; `FeatureAgentDetailHost` REPLACES the detail view when contribution present (not "panel below settings") — a below-settings panel for a pipeline agent needs a new engine contribution.

## 3. Batching/retry precedents
- `executeAgentBatch` (`agent-executor.ts:1383`): groups agents by request signature, ONE LLM call with `<agent_task id=…>` XML blocks (`buildBatchSystemPrompt` L1695), parses JSON map keyed by agent name, falls back to individual calls for unparseable agents (concurrency-capped).
- Invalid-JSON retry ONCE with strict-JSON reminder (`:938-980`). **No provider-error retry/backoff, no refusal detection, no overflow-driven batch shrinking** (only per-call `fitMessagesToContext`).
- `agent_runs` table (`db/schema/agents.ts:22-35`) = chat/message-scoped result cache, not a job store.
- Bulk-combine does NOT exist on `customized` branch (reference-only pattern).

## 4. GM narrator (character as behavior prompt)
`GameSetupWizard.tsx` gmMode `standalone|character` + gmCharacterId → `game.routes.ts:6708-6724` builds card summary string (Name/Description/Personality/Backstory/Appearance) → `gm-prompts.ts:612-629` wraps in `<role>` "You are the following character, acting as an excellent Game Master… Adopt their personality, speech patterns, biases, and quirks"; second site L1729; per-turn `game-gm-prompt-runtime.ts:185-193`. **No generic reusable service**; this is the template to generalize. `editorRunSchema.referenceCharacterIds` exists (`agents.routes.ts:76`) but card-editor forces `[targetId]` (L414).

## 5. Connections + prompt presets
- Per-run connectionId on editor-run EXISTS (`agents.routes.ts:74`; resolution request → agent config → default; `NON_LANGUAGE_CONNECTION_PROVIDERS` filter). Client pickers: `CardEditorProposalPanel.tsx:151-170`, `GameSetupWizard.tsx:356-359,690`, LTM `MemorySettings.tsx:1140-1160` (`GET /api/connections`, filter out image/video providers).
- Engine PromptPreset = chat-scoped prompt assembly (`shared/src/types/prompt.ts:62-99`, `chats.promptPresetId`) — **agents/editor runs never select one**; agent prompt templates come from agent `promptTemplate`/`promptTemplates` config (illustrator pattern: `agents.json` promptTemplates[] ids, localized).

## 6. Card model, revisions, duplicates
- `EDITABLE_CHARACTER_CARD_FIELDS` = description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, backstory, appearance, aboutMe (`shared/src/types/agent.ts:930-944`); client helpers `character-card-fields.ts` (get/set incl. extensions mapping, `bumpCharacterVersion`).
- Revisions: auto snapshot on content change (`characters.storage.ts:575-626`), REST `GET /:id/versions`, restore, rename.
- Duplicate: `POST /characters/:id/duplicate` → `storage.duplicateCharacter` (`:845-874`, name + " (Copy)", fresh id).
- Approval: in-chat `CharacterCardUpdateModal` (approve/edit/regenerate/reject, stale guard) and chat-less `CardEditorProposalPanel`; both apply via character PATCH with `versionSource:"agent"`.

## 7. Engine gap list for the planned features
1. Selection-action package contribution (schema + CharactersPanel/SelectionActionBar render + props incl. selectedCharacterIds).
2. Bulk dispatch: none exists (no queue, no cancel beyond socket-close abort, no SSE for standalone runs) — package-side runner using capability host is viable: `languageModels.resolve(connectionId)` + privileged routes + `persistence.documents` as run store; REST polling for progress.
3. Run manager panel: no job store; mount via new below-settings contribution for pipeline agents (agentDetail unsuitable — replaces view + feature/host-only).
4. Behavior character: generalize GM pattern; add to editor-run schema + prompt + panel picker.
5. Per-run connectionId ✅; prompt-preset-per-run: interpret as agent `promptTemplates[]` selection (package-owned) — no engine change needed for package-dispatched runs; editor-run template selection optional.
6. Infra: no background queue service; package must own run lifecycle + interruption recovery (mark interrupted on activate, offer rerun).
