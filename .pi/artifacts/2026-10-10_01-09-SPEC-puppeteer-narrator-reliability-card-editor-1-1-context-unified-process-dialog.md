# SPEC — Puppeteer narrator reliability + indicators + narrator options; Card Editor 1:1 context + unified process dialog

Approval: user work order 2026-10-10 + interview decisions same date (all six questions answered; decisions embedded below as D1–D6).
Evidence: SCOUT-REPORT 2026-10-10_01-01 (puppeteer) + 2026-10-10_01-02 (card editor), both with file:line citations.
Scope: Marinara-Engine `customized` (items 1–3, engine halves of 4–5) + Marinara-Agents `packages/card-editor` 1.7.0 (package halves of 4–5).

## 1. Work items → decisions

| # | Item | Decision |
|---|---|---|
| 1 | Puppeteer narrator doesn't trigger character responses | **D1: Corrective re-ask + fallback auto-direct.** Every user turn ends with ≥1 character response unless the director explicitly yields (`yieldToUser: true`). |
| 2 | No processing indication for narrator/character | Server `typing`/phase SSE in the puppeteer branch; client indicator shows director/narrator identity instead of falling back to chat character #1. |
| 3 | Narrator message missing assistant options | **D2: All mechanically applicable** — swipe bar + regenerate (narrator re-run as new swipe), copy, translate, explicit edit, message marks, branch, clone scene, TTS. Skip peek prompt, generation replay, thinking, Prose Guardian toggle, conversation-start (no stored data; new storage explicitly declined). |
| 4 | Card Editor context = exactly the operated character | **D3: Keep Batched mode as opt-in** (power surface, default stays individual; "Process characters" keeps `mode:"individual"` hardcoded). **D4: In-chat scheduled card-editor agent scopes `<character_cards>` to characters in the run window** (messages since previous successful run; first run → last 20 messages). lorebook-editor / card-evolution-auditor unchanged. |
| 5 | Reuse Bulk Card Editor modal for "Process characters with Card Editor" | **D5: Prefill the XML transform.** Chat entry opens the package Bulk dialog preloaded with chat characters + XML prefill; engine dialog + `process*` i18n deleted. |
| 6 | Delivery | **D6:** card-editor 1.7.0 (minor) with full agents gates; engine lands on `customized` and CI/CD builds the image automatically on push (no manual docker task). No live-verification task (declined); acceptance = repo gates + regressions. |

## 2. Functional requirements — Engine (Marinara-Engine `customized`)

### F1 — Puppeteer chain guarantee (server, `puppeteer-loop.ts` + `puppeteer-prompt.ts`)
F1.1 **Actions validation with corrective re-ask.** After parsing a direction, validate each action: `characterId` must be an active non-director participant. If a step parses but yields **zero valid actions while `narration` is present and `yieldToUser !== true`**, or any actions were dropped as invalid, issue ONE corrective re-ask whose user message embeds the concrete reasons (unknown/non-participant characterIds listed verbatim, empty-actions reminder, contract lines). The re-ask result replaces the direction for that step. The existing parse-fail re-ask (`PUPPETEER_REASK_INSTRUCTION`) is unchanged; corrective re-ask composes with it (parse-fail re-ask first, then action validation; only one corrective re-ask per step).
F1.2 **End-of-turn auto-direct guarantee.** Track `repliesProduced` for the request. When the loop ends (explicit yield, cap, or parse-fail ×2) with `repliesProduced === 0` and eligible non-director participants exist **and the turn did not end via explicit `yieldToUser: true`**, auto-direct exactly one character: deterministic rotation (per-request counter over `puppeteerParticipants`, starting after the last directed character if any attempted), generating its reply via `deps.generateForCharacter(id, messagesWithNudge, isFinal=true)` where `messagesWithNudge` appends a system line: the director yielded the choice; respond naturally to the latest narration. Explicit-yield turns never auto-direct.
F1.3 **SSE visibility.** New `puppeteer_step` phases: `"correcting"` (corrective re-ask issued), `"auto-direct"` (fallback fired, carries `characterId`). Existing `planning`/`directing` unchanged. Payload stays untyped-in-shared (matches现状) — no schema change.
F1.4 **Loop regressions (new file, engine `scripts/regressions/puppeteer-loop.regression.ts`).** The loop is regression-importable (pure deps). Cases: (a) normal actions flow produces replies; (b) invalid characterIds → corrective re-ask carries reasons; (c) zero actions + narration + no yield → corrective re-ask then auto-direct when still zero; (d) explicit `yieldToUser:true` → no auto-direct ever; (e) parse-fail ×2 → turn ends, auto-direct fires once (not explicit yield); (f) cap reached with replies > 0 → no auto-direct; (g) rotation determinism across two consecutive turns. Use injected fake planning/generate functions; no network.

### F2 — Processing indicators (server + client)
F2.1 **Server `typing` events in the puppeteer branch** (`generate.routes.ts` puppeteer branch, mirroring the individual loop's L11117 emission): planning/correcting → `typing` label "Director"; narration save → "Narrator"; directing/auto-direct → the target character's name. Also `sendProgress` with phase-appropriate labels (reuse "Generating…" baseline plus specific labels where cheap).
F2.2 **Client indicator identity.** `ChatRoleplaySurface.tsx` `StreamingIndicator`: remove the `chatCharIds[0]` fallback for puppeteer-mode chats. When `streamingCharacterId` is null during an active puppeteer stream, render a narrator-styled placeholder (amber accent, label = director name when `puppeteerCharacterId` set, else "Narrator", sub-label "Planning…"). `use-generate.ts`: on `puppeteer_step` phases `planning`/`correcting` → `setTypingCharacterName("Director")` (or director name if known client-side) and `setStreamingCharacterId(null)`; on `auto-direct` → `setStreamingCharacterId(step.characterId)`; narration `message_saved` → indicator returns to "Narrator" until next phase/request end. `group_turn` handling unchanged (already sets `streamingCharacterId`).
F2.3 Narration-only turns: indicator clears when the request completes (existing `finally`); no change to `assistant_message_ready` semantics (out of scope, non-goal).

### F3 — Narrator message options (client + server regen path)
F3.1 **Client `ChatMessage.tsx` narrator branch (roleplay)** gains, reusing the exact assistant-branch components and i18n keys: `SwipeJumpControl` (rendered when `hasSwipes` or `canCreateNextSwipe`), Copy, Translate, explicit Edit button (same handler as double-click quick-edit), `MessageMarkIndicators` + `MessageMarksAction`, Branch-from-here, Clone-scene-from-here, TTS controls (narrator is already TTS-autoplay capable), Regenerate. Keep: delete, hide-from-AI, multi-select, dice/storyboard rendering. Conversation-mode narrator rows keep today's surface (puppeteer is roleplay-only — non-goal).
F3.2 **Regenerate/swipes for narrator rows (server).** `generate.routes.ts` regen gate: when `regenMsg.role === "narrator"`: allow (no "missing character" error); regenerate a **narration-only director planning call** over the history preceding that message (existing planning-call helper, `stream:false`), save as a **new swipe** on the narrator message (swipe mechanics are role-agnostic in storage). Preserve `role:"narrator"` and the original `characterId` (director id) — a character-director narrator row must NOT be converted to an assistant message (current behavior at L11299-11302 is a bug under this spec). Dice narrator rows (dice content marker) keep regen hidden client-side. Non-puppeteer chats: narrator rows exist only from dice — regen stays hidden; server still guards (if chat mode ≠ puppeteer and row is dice → error/ignore).
F3.3 **Guided regenerate excluded** for narrator rows (declined with D2); plain regenerate only.

### F4 — In-chat card-editor agent context scoping (`agent-executor.ts`)
F4.1 For in-chat agent runs with `agentType === "card-editor"`, build `<character_cards>` from the **run window** only: messages added since the previous successful card-editor run for that chat; first run (or no watermark) → the last 20 messages. Characters = unique `characterId`s of assistant messages in the window (deduped, stable order). User persona/director not included (unchanged semantics — only character cards).
F4.2 Empty window (no assistant-character messages) → skip the `<character_cards>` block AND skip proposing updates (the agent cannot edit what it cannot see; run completes as no-op rather than hallucinating targets). Log at info.
F4.3 Watermark source: the agent scheduler's existing per-chat run bookkeeping if it tracks a message watermark/lastRunAt; else filter messages by `createdAt > lastRunAt`. Worker verifies the available primitive and picks the honest one; spec fixes the semantics, not the storage detail.
F4.4 `<behavior_character>`, `<existing_entries>`, `<writable_lorebooks>`, chat history, lorebook context: unchanged. lorebook-editor + card-evolution-auditor keep the all-characters block.
F4.5 Regression: new engine regression asserting the window scoping with a synthetic chat (10 old messages + 3 new: only new-window characters appear in the block; first-run fallback = last 20).

### F5 — Unified "Process characters with Card Editor" entry
F5.1 **Package dialog gains** (`BulkDispatchDialog.tsx` Saving section): fourth radio `Combined — create one new card` (requires `combinedCardName`, validation per `schema.ts:253-255`); `duplicate` gains a name-prefix input (placeholder `<chat> `, help: prefix replaces the default " (Edited)" suffix — server `apply.ts` prefix-wins semantics); `auto` radio label clarifies "saves each character's latest revision". `disableAutoVerdicts` setting → auto radio disabled with hint (parity with the old engine dialog; server coercion already exists).
F5.2 **Overlay prefill.** `OverlayWorkspace` payload `dispatch` gains optional `prefill`: `{ presetId, globalInstruction, saveMode, duplicatePrefix, combinedCardName, label }`. When present, those fields' initial values are overridden by prefill (user can still edit everything; remembered config continues to apply to fields not in prefill). No server change — prefill only shapes the dialog's initial state before `createSession`.
F5.3 **Engine entry rewrite.** `ChatSettingsDrawer` "Process characters with Card Editor" button dispatches `marinara:capability-overlay` `{packageId:"card-editor", action:"open", payload:{dispatch:{characterIds: chatCharIds, prefill:{presetId:"xml-simple", globalInstruction: buildXmlTransformGlobalInstruction("simple", ""), saveMode:"auto", duplicatePrefix: `${chatName} `, combinedCardName: `${chatName} — Cast`, label:`Process: ${chatName}`}}}}`. Button gating unchanged (`cardEditorAvailable`). Delete `CardEditorProcessDialog.tsx`, its mount, and the `process*` i18n keys (keep `card-xml-transform.ts` — now used by the drawer handler to build the prefill instruction). Ordering: ships only after card-editor 1.7.0 is published+installed (old package ignores unknown `prefill` keys harmlessly, but the XML one-click flow depends on 1.7.0's dialog).
F5.4 Batched mode stays opt-in in the dialog (D3); no runner/schema/parse changes for batching.

## 3. Non-goals
- No narration token streaming (narration arrives via `message_saved`; unchanged).
- No `assistant_message_ready` for narrator-only turns; no SSE payload typing in `packages/shared`.
- No peek-prompt / generation-replay / thinking / Prose-Guardian / conversation-start for narrator rows (D2).
- No global swipe-nav rework in `ChatArea` (per-row swipe bar on narrator rows only).
- No batched-mode removal or behavior change (D3); no RP-flow mode change (individual hardcoded).
- No manual docker build/push (CI/CD on push to `customized`, D6).
- About Me untouched; no lorebook writes; no engine-secrets exposure (unchanged).

## 4. Data & trust
- Director narration/actions are model output: characterIds validated against active participants before any generation (existing gate + F1.1 corrective path); auto-direct target always a verified participant.
- Prefill strings are engine-built UI defaults, untrusted prompt data once they become `globalInstruction` (existing caps: ≤100k chars; routes.ts:66-71). `combinedCardName`/`duplicatePrefix` validated by existing schema.
- F4 scoping reduces prompt data exposure (fewer character cards in scheduled runs); no new trust surface.

## 5. Compatibility
- Engine `customized`: version bump; no capabilityApi change (overlay payload is package-owned; no new engine API). Existing chats unaffected; narrator swipes use existing generic swipe storage.
- Package card-editor 1.7.0 (minor): additive dialog surface; `engine.min`/lane unchanged from 1.6.1 (no new engine dependency; F5.3 engine change degrades gracefully — old package ignores `prefill`). Manifest hashes rebuilt via `scripts/build-feature-packages.mjs card-editor`; CHANGELOG entry required.
- Stored sessions (incl. legacy batched) fully runnable (no schema change).

## 6. Acceptance criteria
- AC1 F1.4 loop regression green (7 cases), cited output; manual matrix: invalid-id direction → corrective re-ask observed in logs; silent-drop path gone.
- AC2 Auto-direct: simulated zero-action turn (fake director) → one deterministic participant reply; explicit yield → none; rotation differs across consecutive turns.
- AC3 Indicators: in a ≥3-char puppeteer chat, planning shows Director/Narrator placeholder (not character #1); directing shows the target character before first token; narration arrival visible; request end clears state.
- AC4 Narrator row shows swipe bar + regenerate/copy/translate/edit/marks/branch/clone/TTS; regenerate produces a new narrator swipe preserving role+director characterId; dice rows keep delete-only regen-less surface.
- AC5 F4 regression green; in-chat card-editor run with 100-char chat receives only run-window characters in `<character_cards>` (first run: last-20 window).
- AC6 Agents: chat entry opens Bulk dialog preloaded with all chat members + XML prefill (xml-simple, instruction, `${chatName} — Cast`, `${chatName} ` prefix, saveMode auto); combined dispatch produces one new card via existing finisher; duplicate prefix honored; batched still available; engine `CardEditorProcessDialog.tsx` + `process*` keys gone.
- AC7 Gates: engine `pnpm check` + new regressions + existing `card-editor-behavior-character.regression.ts` green (cited). Agents full gate green: `npm run check` → `test-catalog-lanes` → `validate-package-locales` → `validate-catalog` → `catalog-release-notes.regression` → `build-feature-packages.mjs card-editor` (1.7.0 + CHANGELOG) → `typecheck-packages.mjs card-editor` → all `tests/card-editor-*.regression.mjs`.
- AC8 Engine pushed to `customized` (CI/CD image follows); agents pushed to `customized`.
