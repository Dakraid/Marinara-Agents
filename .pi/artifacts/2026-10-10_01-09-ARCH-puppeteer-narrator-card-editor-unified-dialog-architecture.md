# ARCH — Puppeteer narrator reliability + Card Editor unified dialog implementation blueprint

Companions: SPEC 2026-10-10_01-09; SCOUT-REPORTs 2026-10-10_01-01 (puppeteer evidence) + 2026-10-10_01-02 (card editor evidence); DESIGN.md bible (updated §2/§7).

## 0. Ownership & sequencing

- **Marinara-Engine `customized`** (engine worker): E1 loop guarantee, E2 indicators, E3 narrator options, E4 agent-context scoping, E5 entry rewrite + dialog deletion, E6 gates/push.
- **Marinara-Agents `customized`, `packages/card-editor` 1.7.0** (agents worker): A1 dialog surface + prefill, A2 release gates.
- Independent except: **E5 must ship after A2** (1.7.0 published+installed; the one-click XML flow depends on the package dialog's prefill support). E1–E4, A1–A2 parallelize freely.
- Do not edit in parallel within one repo: engine `generate.routes.ts` touches E1/E2/E3 (single file, single worker pass); package `BulkDispatchDialog.tsx`/`schema.ts`/`locales` belong to A1 only, and `client.js` rebuilds only in A2.

## 1. E1 — Puppeteer chain guarantee

`packages/server/src/routes/generate/puppeteer-loop.ts` (pure, deps-injected — keep it that way):

```
for step in 1..PUPPETEER_MAX_STEPS:
  direction = parse(planningCall(step))            // existing; parse-fail re-ask unchanged (L126-136)
  valid, dropped = partition(direction.actions, isParticipant)   // NEW: split instead of silent drop
  if dropped.length > 0 or (valid.length === 0 and direction.narration and direction.yieldToUser !== true):
      emit puppeteer_step {phase:"correcting", reasons}          // NEW
      direction2 = parse(planningCall(correctiveUserMsg(reasons)))   // ONE re-ask; PUPPETEER_REASK-style instruction in puppeteer-prompt.ts
      merge: narration ||= direction2.narration; valid,dropped = re-validate(direction2.actions)
  save narration (existing) → emit puppeteer_step {phase:"narrating"} (optional, cheap)
  for action of valid: emit directing + group_turn + generateForCharacter (existing L214-236); repliesProduced++
  if yieldToUser or atCap: break                                  // existing L191-195
  if !narration and valid.length===0: yield-break                 // existing L248-267 (still true after corrective merge)
// end of loop:
if repliesProduced === 0 and !explicitYield and participants.length > 0:
  target = participants[(turnCounter++) % participants.length]    // per-request counter; start after last attempted
  emit puppeteer_step {phase:"auto-direct", characterId: target}  // NEW
  generateForCharacter(target, messages + SYSTEM_NUDGE, isFinal=true); repliesProduced++
```

- `SYSTEM_NUDGE` (puppeteer-prompt.ts): "The director did not choose a speaker. Respond naturally to the latest narration in character." — system message appended to that character's message list only.
- Corrective user message lists dropped characterIds verbatim + the JSON contract lines (export `buildCorrectiveInstruction(reasons: string[]): string` from `puppeteer-prompt.ts`).
- `explicitYield` = the break happened via `yieldToUser === true` on the final merged direction (not cap, not parse-fail, not empty-step yield).
- `turnCounter` seeds from a per-request counter persisted on... simplest: derive from `summary`/deps closure per request; determinism across turns = rotate by (number of puppeteer requests for this chat % participants) — worker picks the closure-local honest option; regression pins whatever is chosen.

`puppeteer-prompt.ts`: + `buildCorrectiveInstruction`; JSON_CONTRACT_LINES unchanged (contract already demands actions; we only punish violations).

New `scripts/regressions/puppeteer-loop.regression.ts`: import the loop with fake deps (planning fn scripted per case, generateForCharacter recorder, sendSseEvent collector); assert SPEC F1.4 cases a–g. Env like other engine regressions.

## 2. E2 — Indicators

Server (`generate.routes.ts` puppeteer branch only):
- Add a `sendTyping(label)` helper mirroring the individual loop's L11117 emission; call at: branch start ("Director"), each planning/correcting step ("Director"), narration saved ("Narrator"), each directing/auto-direct (character name). Keep `sendProgress("generating")` at start; add label-bearing progress only if trivially available.

Client:
- `chat.store.ts`: no new state (reuse `typingCharacterName`, `streamingCharacterId`, `generationPhase`).
- `use-generate.ts` `puppeteer_step` case (L2440-2446): switch on `phase`: `planning`/`correcting` → `setStreamingCharacterId(null)` + `setTypingCharacterName(directorName ?? "Director")`; `auto-direct` → `setStreamingCharacterId(step.characterId)`; `directing` unchanged (group_turn L2436 handles it). `typing` case already applies the label (L3105-3113).
- `ChatRoleplaySurface.tsx` `StreamingIndicator` (L357-445): when `groupChatMode === "puppeteer"` and `streamingCharacterId == null`: render narrator-styled placeholder — amber accent chip (reuse `ui.chat.chatmessage.narrator` label or director name), sub-label `chat.message.thinking`. Drop the `chatCharIds[0]` fallback **only** for puppeteer mode (other modes keep existing behavior). VN surface (L2070) shares the component — inherits the fix.
- i18n: reuse existing keys; add `ui.chat.puppeteer.director` ("Director") + `ui.chat.puppeteer.planning` ("Planning…") if a distinct string is needed.

## 3. E3 — Narrator options

Client `ChatMessage.tsx` narrator roleplay branch (L3664-3762):
- Build the same options row as the assistant branch (L4099-4236) restricted to: `SwipeJumpControl` (gate: `hasSwipes || canCreateNextSwipe` — L2359 already permits narrator), Copy, Translate, Edit, MessageMarkIndicators + MessageMarksAction, Branch, Clone scene, TTS (`roleplayTtsControls`), Regenerate (plain; no guided). Wire `onRegenerate`/`onBranch`/`onClone` props — the component already receives them; the narrator branch just never rendered them.
- Dice rows (existing dice-content branch L3735-3741): keep regen + swipes hidden; new options still fine.
- Conversation-mode narrator rows: untouched.

Server `generate.routes.ts` regen gate (L11288-11302):
- `regenMsg.role === "narrator"`: if the chat's `groupChatMode === "puppeteer"` and row is not a dice row → narration regen path: build the planning message list over history preceding `regenMsg` (reuse the puppeteer planning-call helper with `stream:false`), take the produced narration text, save as new swipe (`activeSwipeIndex` advance; swipes are role-agnostic in storage), `message_saved` emit; **keep `role:"narrator"` and original `characterId`**. If dice row or non-puppeteer chat → error string (client hides the button anyway).
- Character-director narrator rows: same path (fixes today's convert-to-assistant bug at L11299-11302).

## 4. E4 — In-chat card-editor agent context scoping

`packages/server/src/services/agents/agent-executor.ts` (block at L3209-3235):
- Precompute `windowCharacterIds`: for `agentTypes.includes("card-editor")` (and NOT lorebook-editor/card-evolution-auditor-only runs), derive the run window — messages since the previous successful card-editor run for this chat (scheduler watermark if exposed to the executor; else `createdAt > lastRunAt`; worker verifies which primitive exists — the scheduler's run-state store is the preferred source) else last 20 messages. Collect unique assistant `characterId`s in window order.
- Card-editor branch emits `<character_cards>` over `context.characters.filter(c => windowCharacterIds.has(c.id))`. Empty set → omit block AND force `resultType` payload empty-skip (run completes as no-op, info log).
- Other two agent types: unchanged block over all `context.characters`.
- New regression `scripts/regressions/card-editor-run-window.regression.ts`: synthetic chat, 10 old + 3 new messages (2 distinct speakers), assert block contains exactly the window speakers; first-run fallback last-20; empty-window no-op.

## 5. E5 — Unified process entry (engine)

- `ChatSettingsDrawer.tsx`: Process button handler → `openOverlay` with `dispatch:{characterIds: chatCharIds, prefill:{presetId:"xml-simple", globalInstruction: buildXmlTransformGlobalInstruction("simple",""), saveMode:"auto", duplicatePrefix:`${chatName} `, combinedCardName:`${chatName} — Cast`, label:`Process: ${chatName}`}}` (same window event the engine dialog already used at CardEditorProcessDialog.tsx:146-151, minus the POST). Button + gating unchanged.
- Delete `CardEditorProcessDialog.tsx` + mount (:10302-10307) + `process*` i18n keys (engine en.json:5525-5549). Keep `lib/card-xml-transform.ts` (prefill instruction source).
- Engine `pnpm check` + CHANGELOG `[Unreleased]` entry.

## 6. A1/A2 — Package dialog + release (Marinara-Agents)

A1 (`src/engine/packages/...`):
- `schema.ts`: no change (combined + duplicatePrefix already typed; `SaveMode` unchanged).
- `BulkDispatchDialog.tsx` Saving section (:629-657): add `combined` radio + `combinedCardName` input (visible when selected; default from prefill or `${label} — Cast`); duplicate radio expands `duplicatePrefix` input (placeholder `<chat> `, help text: replaces default suffix); `auto` label → "In-place — auto-approve (latest revision)"; when settings `disableAutoVerdicts` → auto disabled + hint (settings already fetched for parallelCap).
- Overlay prefill: `OverlayWorkspace.tsx` payload type + pass-through `prefill` to `BulkDispatchDialog`; dialog accepts optional `prefill` prop applied as initial values for `{presetId, globalInstruction, saveMode, duplicatePrefix, combinedCardName, label}` overriding stored-config defaults for those fields only.
- `locales/en.json` + `localization.ts`: new keys (`cardEditor.saving.combined`, `.combinedName`, `.duplicatePrefix`, `.autoRevisionLabel`, `.reviewRequiredHint`); sync via `sync-package-locales.mjs`.
- No runner/routes/apply changes (combined + prefix already implemented server-side).

A2 (release):
- `manifest.json` 1.6.1 → 1.7.0; `CHANGELOG.md` new entry (≤1000 chars); `node scripts/build-feature-packages.mjs card-editor` (rebuild + hash re-pin); full agents gate (SPEC AC7 order); targeted `tests/card-editor-*.regression.mjs` (dialog-ui + bulk + runner + prompt-presets + routing must stay green — batched assertions unchanged per D3).

## 7. Risk & edge matrix

| Risk | Mitigation |
|---|---|
| Corrective re-ask doubles planning latency on bad directors | One re-ask max per step; re-ask result merged, not looped |
| Auto-direct picks a character with nothing to say | Nudge frames it as "respond naturally"; rotation avoids always-same pick; explicit yield opt-out preserved |
| Narrator swipe regen context drift | Regenerate strictly over history preceding the row (same slice swipes use) |
| E4 watermark primitive absent | Fallback lastRunAt/last-20; regression pins chosen semantics |
| E5 before package 1.7.0 installed | Ordering constraint E5-after-A2; old package ignores `prefill` (unknown keys) — worst case: dialog opens without prefill, no crash |
| `generate.routes.ts` merge conflicts with future upstream | Keep puppeteer deltas localized to the branch + loop module; E1 logic lives in `puppeteer-loop.ts` |
| Rebuild drift (manifest hashes) | A2 owns the single rebuild; no parallel edits to package sources |

## 8. Validation summary

- Engine: `pnpm check`; new `puppeteer-loop.regression.ts` + `card-editor-run-window.regression.ts`; existing `card-editor-behavior-character.regression.ts` parity pin; push `customized` (CI/CD image, D6).
- Agents: SPEC AC7 chain; package 1.7.0 rebuilt; push `customized`.
