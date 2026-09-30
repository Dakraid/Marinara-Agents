# SPEC — Agent Advanced Parameters, Editor Agents, CYOA Button

Date: 2026-09-29. Requester: maintainer (verbatim ask: "update all agents to support advanced parameters for their connections and override any hard-coded temperatures inside requests, i.e. for the world map agent or illustrator agent. Add a button for the CYOA agent to generate anew. Based on the card evolution agent, create a new agent focused on rewriting existing cards, the same for lorebooks and the lorebook keeper. First is Card Editor Agent and second Lorebook Editor Agent. Card Editor can consume existing lorebooks and Lorebook Editor can consume existing cards as reference material.").

Spans TWO repos: **Marinara-Agents** (package definitions, this repo) and **Marinara-Engine** (agent runtime, routes, client). Engine work is delivered as `TASK-#.md` files at the Engine source root (user directive), one per Engine task below. Feature branches in both repos; no GitHub issue/PR ceremony (standing preference); local validation + docker image delivery define done.

## Decisions (user-confirmed via interview)

1. **Parameter semantics**: connection-wins with package fallback — `stored ?? packageLiteral`. User config always wins; untouched connections keep today's tuned defaults. Matches existing `slurp-sampling-options.ts` / `noodle-sampling-options.ts` pattern.
2. **Cleanup scope**: ALL agent/generation call sites. Exempt: connectivity probes ("Reply with OK", temp 0/top_p 1/max_tokens 1), local sidecar inference (temp 0/0.2 intentional), translation.service.ts.
3. **Editor trigger**: dedicated chat-less editor UI surface on the character card page and lorebook manager page (user explicitly chose the large option over chat-scoped retry).
4. **Context gates**: minimal diff — add `card-editor` / `lorebook-editor` to the existing type gates in `buildAgentExtras` (NOT a generic contextSections setting).
5. **CYOA**: a Re-Roll button already exists in `CyoaChoices.tsx` (commit 781dd18ef) — keep it, AND add a PERMANENT regenerate button in the `mari-message-actions` bar (user: "the button is not always available"). Polish/verify the existing one.
6. **gacha-forge**: ~23 hard-coded temps, source lives outside both repos — flagged for out-of-repo follow-up; change list below.
7. **Manual-only editors**: editor agents must never auto-run on cadence. Mechanism: `defaultSettings.runInterval: 0` + widen the manual-only check in `agent-cadence.ts` (currently illustrator-only) to the two new ids.

## Work items → tasks

### Marinara-Agents (this repo)

**#190 Param cleanup (packages).** Connection-wins merge in package sources:
- `hierarchical-maps/src/engine/.../spatial-context.routes.ts:132` (temp 0, JSON repair — keep 0 as fallback literal, connection may override), `:1209` (0.55), `:1872` (0.55). NOTE: these ride the capability LLM host whose precedence is fixed Engine-side in TASK-1 (host-level fix makes the connection win for ALL capability packages); package-side change = document literals as fallbacks.
- `memory-nag/.../scanner.ts:291` (temp 0.2 + `reasoningEffort: "none"`) — same host-level fix applies.
- `noodle/.../noodle-image-prompt-rewrite.ts:98` (0.3, maxTokens 2048 — no merge today) → wrap with `noodleSamplingOptions`.
- `slurp/.../slurp-image-prompt-rewrite.ts:97` (same) → merge.
- `slurp2/.../slurp-image-prompt-rewrite.ts:97` (same) + `slurp2/.../slurp-conversation-schedule-generation.ts:87` (0.8 bare) → merge.
- Already-compliant merge-fallback sites (noodle ×3, slurp ×8, slurp2 ×12) need no change.
- Rebuild: `node scripts/build-feature-packages.mjs <ids>`, re-hash manifests, rebuild catalog; full validation (see #200).

**#191 Card Editor package (`card-editor`).** New prompt-only package, sibling of `card-evolution-auditor`:
- `agents.json`: id `card-editor`, name "Card Editor", phase `post_processing`, `enabledByDefault: false`, category `writer`, `defaultTools: ["search_lorebook"]`, `runInterval: 8` (top-level; cadence neutralized by settings runInterval 0), `defaultSettings: { resultType: "character_card_update", runInterval: 0, contextSources: { chatHistory: true, characters: true, persona: false, activatedLorebookEntries: true, chatSummary: false, authorNotes: false, trackerData: false, recalledMemories: false, previousOutput: false } }`.
- Prompt contract: rewrites the TARGET card (from `<character_cards>`) per the user's directive; uses `<activated_lorebook_context>` / `<existing_entries>` (gate widened in TASK-2) and `search_lorebook` as reference; returns the same `{"updates":[{action:"update",characterId,field,oldText,newText,reason}]}` JSON as card-evolution-auditor (approval flow + EDITABLE_CHARACTER_CARD_FIELDS unchanged); must NOT rely on chat-only sections (chat summary, decisions).
- Wiring: `manifest.json` (engine.min 2.3.0 default, kind ["agent"], entrypoints {agents}, permissions `["agent-runtime","chat-read","prompt-context","storage","ui"]`, restartRequired false); `documentationAnchors` entry in build-agent-catalog.mjs; `OFFICIAL_PACKAGE_GUIDANCE` entry in catalog-package-guidance.mjs; category pin in validate-catalog.mjs expectedCategories (`writer`); README Writer Agents row + count sentence 37→39; `artwork/agent-covers/card-editor.png` — PLACEHOLDER: copy of `card-evolution-auditor.png` (validate-catalog requires a real 512×512 PNG; user replaces art later); `tests/card-editor-*.regression.mjs` modeled on `tests/lorebook-keeper-routing.regression.mjs`; rebuild via `build-agent-catalog.mjs card-editor`.

**#192 Lorebook Editor package (`lorebook-editor`).** New prompt-only package, modeled on `lorebook-keeper`:
- `agents.json`: id `lorebook-editor`, name "Lorebook Editor", phase `post_processing`, `enabledByDefault: false`, category `misc` (like lorebook-keeper), `defaultTools: ["search_lorebook"]`, `defaultSettings: { resultType: "lorebook_update", runInterval: 0, contextSources: { chatHistory: true, characters: true, persona: false, activatedLorebookEntries: false, ... } }` (characters:true gives the `<lore><characters>` reference block; full `<character_cards>` gate also widened in TASK-2).
- Prompt contract: rewrites entries of the TARGET lorebook (`<writable_lorebooks>` = exactly the target book; `<existing_entries>` = its entries) per directive; keeps lorebook-keeper's `targetLorebook` routing so the Engine applier works unchanged; returns `{"updates":[{action:"create|update|delete",targetLorebook,entryName,content,newFacts,keys,tag,order,reason}]}`; never touches locked entries; must not rely on chat-only sections.
- Wiring: same checklist as #191 (guidance, docs anchor, category pin `misc`, README Misc Agents row + count, placeholder cover from `lorebook-keeper.png`, regression test, catalog rebuild).

### Marinara-Engine (TASK-#.md at Engine root; contents in ARCH artifact)

- **#193 TASK-1**: connection-wins parameter cleanup, all generation call sites (inventory below).
- **#194 TASK-2**: widen `buildAgentExtras` gates (`<character_cards>` :3018, `<existing_entries>` :3244, `<writable_lorebooks>` :3255 in agent-executor.ts) for both editor ids (each agent gets both reference kinds available); widen `agent-cadence.ts` manual-only (`runInterval 0`) check to both editor ids; ensure the editor `directive` reaches the prompt (add `<directive>` block in buildAgentExtras reading `context.memory._directive` if no existing macro).
- **#195 TASK-3** (blocked by TASK-2): `POST /api/agents/editor-run` chat-less route (design in ARCH).
- **#197 TASK-4** (blocked by TASK-3): Card Editor UI in `CharacterEditor.tsx` + `CardEditorProposalPanel`.
- **#198 TASK-5** (blocked by TASK-3): Lorebook Editor UI in `LorebookEditor.tsx` + scope toggle + `LorebookEditorProposalPanel`.
- **#199 TASK-6**: permanent CYOA regenerate button in `ConversationMessageActions.tsx` + `useCyoaReroll` hook + `CyoaChoices` refactor + gating (assistant msg, cyoa in effective agent set, roleplay mode, any assistant message via `forMessageId`).

**#200 Final validation**: Agents repo — `npm run check`, `node scripts/test-catalog-lanes.mjs`, `node scripts/validate-package-locales.mjs`, `node scripts/validate-catalog.mjs`, `node scripts/tests/catalog-release-notes.regression.mjs`, package regression tests. Engine repo — `node ./scripts/run-regressions.mjs` (FULL suite, per past CI-removal regressions), build, docker rebuild + push `netrve/marinara-engine:customized`.

## Hard-coded parameter inventory (authoritative, from scout reports)

### Engine — fix in TASK-1 (file:line | value | request)
- services/generation/illustrator-background-generation.ts:226 | 0.35 | illustrator background plan
- services/generation/illustrator-manual-prompt-generation.ts:271 | 0.55 | illustrator manual prompt rewrite
- routes/game.routes.ts:3207-3208 | 1/1 | gameGenOptions fallback (all Game helper calls)
- routes/game.routes.ts:4125 | 0.35 | Game Lorebook Keeper
- routes/game.routes.ts:7496 | 0.7 | session recap; :7689 | 0.45 | session conclusion; :8253 | 0.45 | conclusion regenerate; :8521 | 0.35 | campaign progression; :8912 | 0.45+1200 | character sheet; :9193 | 0.6+1200 | party recruit; :9571 | 0.6 | world map generate
- routes/generate.routes.ts:7129 | 0.2 | smart group response selector
- routes/agents.routes.ts:756 | 0.3 | agent-suite excerpt rewrite
- routes/conversation-custom-assets.ts:141 | 0.3+200 | asset candidate picker
- routes/conversation-calls.routes.ts:1364 | 0.75+1400 | turn extraction; :1667 | 0.7+1200 | selfie prompt; server.mjs bundle | 0.7 | nai image payload
- services/conversation/call-summary-routing.ts:85 | 0.2+4096 | call summary
- services/conversation/schedule.service.ts:387 | 0.55 (+reasoningEffort low) | routine summary (week schedule via getWeekScheduleTemperature)
- services/conversation/auto-summary.service.ts:317 | 0.3 | auto-summary
- services/generation/conversation-selfie-command-runtime.ts:232 | 0.7+8196 | selfie command
- services/generation/image-captioning-runtime.ts:281 | 0.2 | captioning
- routes/gallery.routes.ts:796 | 0.5+1200 | gallery prompt helper; :1323 | 0.7+8196 | scene-video prompt
- routes/characters.routes.ts:1134/:1225 | 0.35/0.5 | bulk-tags
- routes/scene.routes.ts:598/:1046 | 0.8/0.9 | scene scenario helpers
- services/turn-games/turn-game-bot-runner.service.ts:398/:577/:618 | 0.6/0.9/0.85 | turn-game bots
- services/professor-mari/workspace-agent.service.ts:3442 | 0.2 default | workspace agent (already uses connection defaultParameters when numeric — verify)
- services/spotify/dj-mari-playlist.service.ts:629 | 0.75 | DJ Mari
- services/image/image-generation.ts:3034 | 0.7 | image-gen chat-completions fallback
- services/capability-packages/capability-language-model.service.ts:96-114 | precedence `overrides?.temperature ?? options.temperature ?? parameters.temperature` — package-passed literal BEATS connection params; flip to connection-wins-with-package-fallback (THE world-map root fix)
- services/agents/agent-executor.ts:83,589-594 | DEFAULT_AGENT_TEMPERATURE 0.7 fallback; beholder hard 0 — acceptable defaults, keep (fallback only fires when neither connection nor agent overlay sets temperature)

### Engine — EXEMPT (deliberate)
- Connectivity probes (slurp/slurp2/noodle/conversation-calls bundles): temp 0, top_p 1, max_tokens 1.
- services/sidecar/*:432 0.2, sidecar-process:493 0, utility-sidecar.provider:88 0, decision backend:132 0 — local inference.
- services/translation.service.ts:195 0.3 — translation.
- hierarchical-maps repair call temp 0 — keep 0 as fallback literal (determinism), connection may override.

### Packages (this repo) — fix in #190 (listed above)

### gacha-forge — OUT-OF-REPO follow-up list
`packages/gacha-forge/server.mjs` (generated bundle, minified, lines ~197-217): ~23 hard-coded temps — `.9`×8, `.8`×6, `.85`×2, `.5`, `.4`×4, `.95`, `.3`, each with per-call `maxTokens`, across scenario/banner/unit/card/CG/narration/image-prompt generation. Apply the same connection-wins merge in the gacha-forge SOURCE repo, then rebuild the bundle via `scripts/build-gacha-forge-package.mjs`. beholder + pixelforge verified clean (no LLM calls in-bundle).

## Key facts the plan relies on
- Full advanced-parameter set already exists: `generationParametersSchema` (shared/schemas/prompt.schema.ts:96-146); per-agent UI in AgentEditor "Advanced Parameters" (writes sparse `settings.generationParameters`); connection column `defaultParameters`; agent pipeline resolves connection→overlay→fallback. The gap is ONLY hard-coded call-site literals + capability-host precedence.
- `packagedAgentDefinitionSchema` is `.strict()` — new per-agent knobs must ride inside free-form `defaultSettings`.
- Agent result types `character_card_update` / `lorebook_update` + approval flows are generic (PendingCardUpdate carries agentType string) — new agent ids reuse them unchanged.
- Manual-only precedent: `agent-cadence.ts` `runInterval === 0` → skip (illustrator-only today).
- Editor agents with no chat: prompts must not reference chat-only injected sections.
- New agents do NOT need Engine built-in fallback manifests (package registry supplies definitions at boot); editor-run route must 400 clearly if the agent type isn't registered (package not installed).
- Cover art is validation-gated (real PNG at artwork/agent-covers/<id>.png) — placeholders copied from sibling packages; USER must supply final art.

## Out of scope
- Generic `contextSections` setting (user chose minimal gates).
- Chat-scoped "run now" UX changes for the editors (covered by dedicated surface).
- gacha-forge bundle edits (source external).
- Translation/sidecar/probe parameter changes.
