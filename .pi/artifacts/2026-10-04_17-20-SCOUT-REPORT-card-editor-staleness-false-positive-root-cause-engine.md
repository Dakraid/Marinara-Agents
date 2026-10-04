# SCOUT-REPORT: `character_card_update` staleness false-positive (proven)

## Verdict
Staleness is a pure `current.includes(update.oldText)` substring test (no hashes/revisions/timestamps): `current` = raw stored field; `oldText` = LLM-quoted text echoing prompt context that was transformed by `cardPromptText` (`stripMacroComments().trim()`), in-chat macro substitution, and `escapeXml` (`& < > " '` → entities). Apostrophes alone (`&apos;`) guarantee mismatch. Chat-less panel has NO override path at all (Apply disabled when `applicableCount === 0`) — the reported block. In-chat modal has an "Override stale" append, not replace.

## Data flow (render → verify → apply)
- Chat-less: `POST /api/agents/editor-run` (`agents.routes.ts:324-542`, in-memory `activeEditorRuns` lock) → `CardEditorProposalPanel.tsx` (`isEditStale` L72, `liveStale` L172, `handleApply` L246, Apply disabled `:448-456`).
- In-chat: SSE agent result → `use-generate.ts:449-517 buildPendingCardUpdates` → `agent.store.pendingCardUpdates` → `CharacterCardUpdateModal.tsx` (`updateStates` L91-102, `handleApprove(overrideStale)` L126; override = `appendStaleCardReplacement` L21-26 appends newText to field end).
- Context emission: `agent-executor.ts:3040-3064` builds `<character_cards>` with `escapeXml` per field (L105-112); fields pre-normalized by `cardPromptText` (`card-text.ts:3-5` + `macro-engine.ts:265-277`); in-chat path additionally mutates `charInfo` in place with macro resolution (`generate.routes.ts:4290-4303`) before context build (L5208).
- `parseAgentResponse` (`agent-executor.ts:3566-3608`) passes `oldText` through untouched (no unescape/normalization/validation).
- Apply: `useUpdateCharacter` PATCH → `characters.storage.ts:575-626` merges, creates pre-apply version snapshot (`versionSource:"agent"`), auto character_version bump.

## Ruled out
React Query 5-min cache (both surfaces refetch), hashing/volatile-field issues (no hash exists), autosave races (apply is user-triggered).

## Secondary
- `aboutMe` editable/proposable but ABSENT from `<character_cards>` context → near-guaranteed stale proposals.
- Whole-field edits (prompt mandates full-field newText) + stored edge whitespace (trimmed in context) → guaranteed miss.
- card-editor prompt (`Marinara-Agents/packages/card-editor/agents.json`) demands "exact oldText copied verbatim from `<character_cards>`" — manufactures the mismatch.

## Fix surface (files+functions)
- `agent-executor.ts`: record per-field snapshots (`cardPromptText(raw field)` at context build) and attach to result payload for card-edit agents.
- `generate.routes.ts` L4290: operate on copies for card-edit agent contexts (stop in-place macro mutation).
- Shared compare helper; `CardEditorProposalPanel.isEditStale` + `CharacterCardUpdateModal.updateStates`: stale ⇔ `cardPromptText(current) !== snapshot` (fall back to substring for legacy results without snapshots).
- Force Apply: whole-field replace with newText via standard PATCH + version snapshot; panel gains parity with modal.
- Regression: `scripts/regressions/agent-editor-run.regression.ts` (+ `agent-runtime.regression.ts`) — add repro with `&`/apostrophes/macros/whitespace in fields.

## Key files
Engine: `packages/client/src/components/characters/CardEditorProposalPanel.tsx`, `packages/client/src/components/modals/CharacterCardUpdateModal.tsx`, `packages/client/src/hooks/use-characters.ts`, `packages/client/src/lib/character-card-fields.ts`, `packages/client/src/stores/agent.store.ts`, `packages/server/src/routes/agents.routes.ts`, `packages/server/src/routes/generate.routes.ts`, `packages/server/src/services/agents/agent-executor.ts`, `packages/server/src/services/generation/character-prompt-context.ts`, `packages/server/src/services/prompt/card-text.ts`, `packages/shared/src/utils/macro-engine.ts`, `packages/shared/src/types/agent.ts` (L946-965 CharacterCardFieldUpdate).
