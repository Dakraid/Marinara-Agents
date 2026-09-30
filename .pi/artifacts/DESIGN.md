<!-- Last updated: 2026-09-30 13:04:02 UTC -->
# DESIGN — Editor agent UI surfaces + CYOA button (Engine client)

Scope: `packages/client` in Marinara-Engine. Companion to ARCH (2026-09-30_14-51). All UI is local-state only (useState), no new stores.

## 1. Card Editor surface (TASK-4)
- Entry: "Run Card Editor" button in `CharacterEditor.tsx` header (:303). Character id from `useUIStore(s => s.characterDetailId)`.
- Run modal/panel fields: directive textarea; collapsed reference-lorebook multi-picker (default: character-linked lorebooks); connection override select (default: agent default-for-agents connection).
- `CardEditorProposalPanel.tsx` (new, `components/characters/`): per-edit rows — field name, reason, old→new diff, accept checkbox (default on). "Apply selected" → existing character PATCH (`use-characters.ts`). Stale guard: re-check `oldText` against current values at apply; refuse stale rows.
- Error UX: 409 → deep-link connection settings; 400 → "install the Card Editor package" hint.

## 2. Lorebook Editor surface (TASK-5)
- Entry: "Run Lorebook Editor" button in `LorebookEditor.tsx` header (:416) + scope toggle: whole book (default) | selected entries (reuse bulk-selection from `LorebookBulkEditPanel`/`LorebookEntryRow` → entryIds).
- Run panel fields: directive textarea; optional reference-character multi-picker (default none); connection override select.
- `LorebookEditorProposalPanel.tsx` (new, `components/lorebooks/`): create/update/delete rows with content diff + accept checkboxes. Apply: updates via entries bulk PATCH (`use-lorebooks.ts:362`); creates/deletes via single-entry endpoints. Same stale guard. 413 → "select fewer entries".

## 3. CYOA permanent button (TASK-6)
- `ConversationMessageActions.tsx`: new optional props `onRegenerateCyoa`, `cyoaRegeneratePending`; Dices-icon MsgAction ("Regenerate choices") right after the RefreshCw regenerate block (:121-128); Loader2 spinner while pending; disabled while streaming.
- Gating (computed in `ConversationMessage.tsx`/`ConversationMessageGrouped.tsx`): assistant message + cyoa in chat's effective agent set + roleplay mode.
- Hook `use-cyoa-reroll.ts`: `useCyoaReroll(chatId, messageId?)` → `retryAgents(chatId, ["cyoa"], { forMessageId })`; also used by `CyoaChoices.handleReroll` (no messageId = live re-roll).

## Style
Match existing editor/action-bar components: same MsgAction button styling, same modal/panel primitives already used in CharacterEditor/LorebookEditor, existing diff rendering patterns from pending card-update approval components. No new dependencies.
