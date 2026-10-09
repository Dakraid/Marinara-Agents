# SCOUT-REPORT: Puppeteer narrator flow — engine evidence

Repo: `/home/netrve/Source/Marinara-Engine`, branch `customized` (HEAD `8a4224269`, merge of upstream/staging). Puppeteer feature introduced in commits `dc71c19e0` (types), `3b32cad9d` (server loop), `2cb2fd3b7` (drawer UI + SSE status). Investigated by Scout agent (read-only); persisted by Coordinator.

### 1. Meta Section

**Architecture.** pnpm workspace: `packages/client` (React/Vite), `packages/server` (Fastify), `packages/shared` (types + zod schemas). Generation is one long-lived SSE request: client `useGenerate().generate()` POSTs `/generate` and consumes `for await` SSE events (`packages/client/src/hooks/use-generate.ts:1861-1872`). All chat generation lives in a single 14,749-line route file `packages/server/src/routes/generate.routes.ts`; the Puppeteer group-mode loop is extracted into `packages/server/src/routes/generate/puppeteer-loop.ts` (deps-injected) with prompt/parse helpers in `packages/server/src/services/generation/puppeteer-prompt.ts`.

**Core finding on the reported bugs.** "Puppeteer narrator" = `groupChatMode: "puppeteer"` (roleplay-only). Narration and character replies are generated **server-side inside a single `/generate` request**; there is **no client-side chaining and no second request**. The only mechanism that makes characters respond after a narrator message is the director model's JSON `actions` array. Narration itself is never streamed (no `token` events) and no `typing` SSE event is ever emitted in the puppeteer branch — the client's indicator falls back to showing the *first chat character* as "Thinking…". Narrator rows render with a **delete-only** option set; swipe/regenerate UI is structurally absent from the narrator render branch, and server-side regeneration of a Default-Puppeteer narrator row (null `characterId`) hard-errors.

**Patterns.** SSE event names are untyped strings handled by a client-side `switch` (no `puppeteer_step`/`group_turn` in `packages/shared`); route keeps full closures; loop module is pure/injected ("regression-importable" per its header, but has **zero tests**). Narrator rows map to `system` role when read into prompt history.

**Gotchas.**
- `onNarrationSaved` never sets `firstSavedMsg`/`lastSavedMsg`/`currentIterationSavedMsg` (only `onCharacterReply` does) → narration-only turns never emit `assistant_message_ready` (requires an assistant row) → client holds streaming/composer state until the whole request (incl. post-agents) finishes.
- Regen/impersonate/`forCharacterId` bypass the puppeteer loop entirely.
- `regenGroupChatIndividual` errors on narrator rows without `characterId` ("Regenerated message is missing character").
- Invalid director `characterId`s are dropped with a *debug-level* log only.

**Task recommendations (factual gaps, no design).** (1) Chaining is entirely `actions`-driven; any fix for "characters don't respond" lives in `puppeteer-loop.ts` / the direction contract or in surfacing dropped-action/yield causes over SSE. (2) Indicator gaps live in: no `typing` event, no narration token stream, `streamingCharacterId` null during planning, `StreamingIndicator`'s `chatCharIds[0]` fallback, and narrator-only turns never reaching `assistant_message_ready`. (3) Narrator options require: new per-role branches in `ChatMessage.tsx` narrator render block + a regen path that doesn't require `characterId`. Files that must not be edited in parallel: `generate.routes.ts` (single file, all branches) and `ChatMessage.tsx` (both role branches + narrator branch share one component).

**Tool hints.** `pnpm` workspace. Typecheck/build per package; server has no puppeteer tests (`find packages e2e -name "*puppeteer*"` → only `src` + `dist` artifacts). Debug log tag `[puppeteer]` (visible with debugMode). Live loop behavior logs `steps/narrations/replies/yielded/aborted` at `generate.routes.ts:11014-11020`.

**Omitted.** `ConversationMessage*` internals (puppeteer is roleplay-only; conversation narrator rendering barely differs), game-mode narrator paths (`game.routes.ts`), multiplayer room narrator, `assembler.ts` internals beyond the `puppeteerPromptText` hook — none are on the reported bug paths.

### 2. File Map

```
/home/netrve/Source/Marinara-Engine
├── packages
│   ├── client/src
│   │   ├── components/chat/ChatArea.tsx * +              (regen handler, swipe-nav, last-assistant filters)
│   │   ├── components/chat/ChatMessage.tsx * +           (per-role render branches + option sets)
│   │   ├── components/chat/ChatRoleplaySurface.tsx * +   (StreamingIndicator)
│   │   ├── components/chat/ChatSettingsDrawer.tsx * +    (mode selector, director/connection settings)
│   │   ├── components/chat/ConversationView.tsx           (typing label, convo mode)
│   │   ├── hooks/use-generate.ts * +                      (SSE client, all state transitions)
│   │   ├── lib/slash-commands.ts +                        (/guided aka /narrator, /roll)
│   │   ├── localization/locales/en.json +                 (narrator + puppeteer keys)
│   │   └── stores/chat.store.ts +                         (isStreaming, streamingCharacterId, typing…)
│   ├── server/src
│   │   ├── routes/generate.routes.ts * +                  (loop arming, puppeteer branch, regen gate)
│   │   └── routes/generate/
│   │       ├── generate-route-utils.ts +                  (resolveGroupGenerationMode)
│   │       ├── puppeteer-loop.ts * +                      (directed loop)
│   │       └── sse.ts                                     (SSE plumbing)
│   └── services/generation/puppeteer-prompt.ts * +        (contract, parser)
│     └── services/prompt/assembler.ts +                   (puppeteerPromptText marker)
│   └── shared/src
│       ├── schemas/{chat.schema.ts,prompt.schema.ts} +
│       └── types/chat.ts * +                              (MessageRole, GroupChatMode, Message)
```
`*` likely needs modification, `+` contents included in section 3.

### 3. Evidence (file:line)

**A. End-to-end flow**

Client trigger — `packages/client/src/hooks/use-generate.ts`:
- L1200 `export function useGenerate()`; L1239 `generate = useCallback(async (params …)`; params include `regenerateMessageId`/`continueMessageId`/`forCharacterId` (L1251-1253).
- L1326-1329 streaming only armed for the viewed chat: `if (isActiveChat()) { clearStreamBuffer(params.chatId); setStreaming(true, params.chatId); }`
- L1861 `for await (const event of api.streamEvents("/generate", { ...params, … }` — single request; **no code anywhere in client triggers a follow-up generation from a narrator message** (grep `role === "narrator"` in client: display/TTS-only hits: `ChatMessage.tsx:1912,2095`, `ChatArea.tsx:2850`, `tts-autoplay.ts:19`).

Server arming — `packages/server/src/routes/generate.routes.ts`:
- L7424-7450: `usesIndividualGroupGeneration = groupChatMode === "individual" || groupChatMode === "puppeteer"`; `puppeteerDirectorId` from `chatMeta.puppeteerCharacterId`; `usePuppeteerLoop = isGroupChat && groupChatMode === "puppeteer" && !input.regenerateMessageId && !input.impersonate && !input.forCharacterId` and `puppeteerParticipants.length >= (puppeteerDirectorId ? 2 : 3)` else warn+fallback to individual turns.
- L7452-7457 `useIndividualLoop = isGroupChat && usesIndividualGroupGeneration && !usePuppeteerLoop && !input.regenerateMessageId && !input.impersonate;` — regen always falls into the single/merged branch.
- L10831-10837 puppeteer branch start + `sendProgress("generating")` (the branch's only progress emit); L10916-10941 `runPlanningCall` uses `stream: false`.
- L10996-11013 `saveNarration: (content) => chats.createMessage({ chatId: input.chatId, role: "narrator", characterId: puppeteerDirectorId, content })`; `onNarrationSaved` pushes `message_saved` SSE + `allResponses`/`allResponseSegments` — but does NOT set `firstSavedMsg ??=`/`lastSavedMsg =`/`currentIterationSavedMsg =` (only `onCharacterReply` L10970-10995 does).
- L11388-11401 `sendAssistantMessageReady`: `if (!readyMessage || readyMessage.role !== "assistant") return;` → never fires on narration-only turns. Client counterpart `use-generate.ts:2746-2770` (`case "assistant_message_ready"`) is what releases Swipe/Continue/composer early (`setStreaming(false)`, `setAbortController(null)`…).
- Regen gate L11288-11296:
```ts
if (regenGroupChatIndividual) {
  if (regenMsg?.chatId !== input.chatId) { … error … }
  if (!regenMsg?.characterId) {
    sendSseEvent(reply, { type: "error", data: "Regenerated message is missing character" });
    return;
  }
  targetCharId = regenMsg?.characterId ?? null;  // character-director narrator rows regen AS that character
```
- Group-mode normalization `packages/server/src/routes/generate/generate-route-utils.ts:1232-1247`: `if (mode === "puppeteer" && chatMode !== "roleplay") return "individual";`

The loop — `packages/server/src/routes/generate/puppeteer-loop.ts`:
- L20 `export const PUPPETEER_MAX_STEPS = 8;`; L98 `sendSseEvent(deps.reply, { type: "puppeteer_step", data: { phase: "planning", step } });`
- L152-158 narration saved then pushed to planning context as `{ role: "system", contextKind: "history" }`.
- L158-170 non-participant actions dropped (`logger.debug` only).
- L191-195 `const atCap = step === PUPPETEER_MAX_STEPS; const stepEndsTurn = direction.yieldToUser === true || atCap;`
- L214-236 per directed reply: emits `puppeteer_step(directing)` then `group_turn { characterId, characterName, index }`, then `deps.generateForCharacter(action.characterId, messagesForCharacter, isFinalCall)`.
- L248-267 empty-step/yield breaks: `if (!direction.narration && validActions.length === 0) { … summary.yielded = true; break; }` (narration present + zero actions + no yield → loop re-plans, up to cap).
- Parse-fail-twice → yield: L126-136.
- Token streaming for character replies is inside `generateForCharacter` (route closure, L7604+) via `sendTokenTextChunked`/`emitTokenTextChunked` → `sendSseEvent(reply, { type: "token", data: chunk })` (L7049, L7061-7076). **Narration never passes through this.**

Chaining contract — `packages/server/src/services/generation/puppeteer-prompt.ts`:
- L48-59 `JSON_CONTRACT_LINES`, incl. `"yieldToUser": true | false`, *"An empty actions array with yieldToUser=true simply ends the turn"*, *"End every completed beat this way"* — i.e. the designed path can legitimately end a turn with narration and **zero** character replies.
- L141-180 `parsePuppeteerDirection` (fence/prose tolerant; shape-fail → null → one re-ask `PUPPETEER_REASK_INSTRUCTION` L128).
- Preset marker: `prompt.schema.ts:68-83` `markerTypeSchema` includes `"puppeteer"` (L81); route marks `presetHasPuppeteerMarker` at `generate.routes.ts:3388`; assembler hook `assembler.ts:195` + `536` (`puppeteerPromptText`).

**B. Message model + per-type options**

`packages/shared/src/types/chat.ts`:
- L93 `export type MessageRole = "user" | "assistant" | "system" | "narrator";`
- L26 `export type GroupChatMode = "merged" | "individual" | "puppeteer"`; L29 `normalizeGroupChatMode`; L402-409 metadata `groupChatMode` / `puppeteerCharacterId` / `puppeteerConnectionId`.
- L804-819 `Message` — `characterId: string | null` ("null for user messages / narration"), `activeSwipeIndex`, `swipeCount?`.
- `packages/shared/src/schemas/chat.schema.ts:9` role enum incl. narrator; L41-42/59 request fields; L65 `generationGuideSource: z.enum(["narrator","guide","game_start"])`.

Render — `packages/client/src/components/chat/ChatMessage.tsx`:
- L1910-1912 `isUser/isSystem/isNarrator`; narrator roleplay branch L3664-3762: amber `NARRATOR` header (L3718-3723, key `ui.chat.chatmessage.narrator`), multi-select checkbox (L3673-3699), **delete button only** (L3703-3717), hidden-from-AI collapse (L3726-3732), dice content (L3735-3741), storyboard media (L3751-3758), `onDoubleClick={handleRoleplayDoubleClick}` (L3679 → quick-edit L2241-2253, gated by `editMessageOnDoubleClick` setting; no role gate).

Assistant option set (roleplay branch, L4099-4236; conversation mirror L4526-4665):
| Option | Lines | i18n key (en.json) |
|---|---|---|
| SwipeJumpControl (swipe bar + next-swipe) | 4099-4108 | — |
| MessageMarkIndicators | 4110 | — |
| Copy | 4133-4136 | `lorebook.editor.batch.copy` |
| Translate | 4137-4147 | `ui.chat.chatmessage.translate`/`hideTranslation` |
| Edit | 4148-4152 | `ui.noodle.noodlepostcard.edit` |
| Prose Guardian version toggle | 4153-4171 | `…showRewrittenVersion`/`showOriginalBeforeRewrite` |
| Guided Regenerate | 4162 (def 4863-4881) | `ui.chat.chatmessage.regenerate`/`regenerateGuided` (5183) |
| MessageMarksAction | 4163 | — |
| ConversationStartAction | 4165-4173 | — |
| HideFromAIAction | 4174-4182 | — |
| Peek prompt | 4184-4190 (`isLastAssistantMessage && !isUser`) | `ui.chat.chatmessage.peekPrompt` (5181) |
| Generation replay | 4191-4197 | `ui.chat.chatmessage.storedGuidance` (5195) |
| Thinking | 4198-4209 | `chat.message.thoughts.view` |
| Branch | 4210-4216 | `ui.chat.chatmessage.branchFromHere` (5166) |
| Clone scene from here | 4217-4224 | `ui.chat.chatmessage.cloneFromHere` (5169) |
| Delete | 4225-4230 | `lorebook.editor.batch.delete` |
| roleplayTtsControls | 4235 | — |

Narrator-message option set: **delete only** (+ multi-select, setting-gated double-click edit, storyboard, lightbox). There is no `onContinue` per-message UI anywhere (continue exists only as `/continue` slash command, `slash-commands.ts:783-800`, which targets `latestAssistantMessageId`).
- L2359 `const canCreateNextSwipe = Boolean(onRegenerate && !isUser);` — narrator not excluded by role, but narrator branch never renders `SwipeJumpControl` (only L4099 and L4526 do); `hasSwipes` L3200-3201.
- `packages/client/src/components/chat/ChatArea.tsx:2415-2432` — `lastAssistantMessageId` and `latestAssistantMessageForSwipes` both filter `role === "assistant"` only; L2169-2226 `handleRegenerate` (any message id, but unreachable from narrator UI); L2459-2495 intuitive swipe nav bound to `latestAssistantMessageForSwipes`.
- Narrator → `system` in prompt history: `packages/server/src/routes/chats.routes.ts:3320,3996`; `conversation-history-runtime.ts:203,532-550`; loop comment `puppeteer-loop.ts:155-157`.

**C. Processing indicators**

State — `packages/client/src/stores/chat.store.ts`: `streamingCharacterId` L241, `typingCharacterName` L245, `generationPhase` L247; setters L657, L699-702, L707-708.

Client SSE handlers — `use-generate.ts`:
- L1328 `setStreaming(true, params.chatId)` (active chat only).
- L1964-2001 `case "token"` — first token clears typing/delayed/phase, sets Mari "thinking" pill.
- L2067-2083 `case "progress"` → `setGenerationPhase(label)` ("Generating…").
- L3105-3113 `case "typing"` → `setTypingCharacterName(typingLabel)`.
- L2365-2437 `case "group_turn"` → flush typewriter, reset buffer, `setStreamedMessageId(null)`, and L2436 `if (isActiveChat()) setStreamingCharacterId(turn.characterId);`
- L2440-2446 `case "puppeteer_step"`: `if (step.phase === "planning" && isActiveChat()) setStreamingCharacterId(null);`
- L2652-2744 `case "message_saved"`: assistant-only logic (queue completion, `setStreamedMessageId`, post-processing hold); narrator rows just `upsertPersistedMessages` (L2739-2740).

Server emissions — `generate.routes.ts`: `type:"typing"` is emitted **only** in the individual loop (L11117); grep confirms zero `typing`/`token` emissions in the puppeteer branch (L10831-11015); narration produces a single `message_saved` (L11004). `sendProgress("generating")` once at L10833.

Indicator UI — `packages/client/src/components/chat/ChatRoleplaySurface.tsx`:
- L357-445 `StreamingIndicator`: renders a **fake assistant** message with `characterId: streamingCharacterId ?? chatCharIds[0] ?? null` (L402) and `emptyLabel={t("chat.message.thinking")}` ("Thinking…", `en.json:530`); rendered at L1996-2009 (transcript, when `hasLiveStream && !inlineStreamingMessageId`) and L2070 (VN).
- Consequence during puppeteer planning/narration: `streamingCharacterId` is null → indicator shows the **first chat character** ("X … Thinking…"), never "Puppeteer/Narrator"; narration text appears all-at-once via `message_saved` while the placeholder still shows char[0]. No `typingCharacterName` is ever set in this mode. Conversation mode mirrors the same fallback (`ConversationView.tsx:435-447`).

**D. Swipes**

- Narrator rows: **no swipe UI** — the narrator render branch (`ChatMessage.tsx:3664-3762`) contains no `SwipeJumpControl`; swipe bars exist only in the assistant branches (L4099-4108 roleplay, L4526-4560 conversation). `canCreateNextSwipe` (L2359) would permit swipe-creation for narrator by role, but is unused there.
- Server: swipes are created by the regenerate-as-new-swipe path (`regenerateMessageId`), which bypasses the puppeteer loop (`generate.routes.ts:7431`) and errors for narrator rows lacking `characterId` (L11292-11296); a character-director narrator row regenerates as an ordinary **assistant** message of that character (L11299-11302 → single/merged `generateForCharacter` call L11332).
- Intuitive swipe navigation is restricted to the latest `assistant` (`ChatArea.tsx:2425-2432`).
- DB: `packages/server/src/db/schema/chats.ts:66` `active_swipe_index` (generic, not role-gated).

**E. Settings, schemas, i18n, tests**

- `ChatSettingsDrawer.tsx`: three-segment mode selector L6736-6806; puppeteer segment disabled under 3 active characters (L6779-6804, title key `ui.chat.chatsettingsdrawer.puppeteerNeedsThree`); puppeteer block L6829-6866 — `PuppeteerDirectorPicker` (L825-905, default row "Default Puppeteer") + `puppeteerConnectionId` select; metadata writes via `updateMeta.mutate({ id, puppeteerCharacterId | puppeteerConnectionId })`. (`narratorProvider` at L10135 is the FunctionCalling/game tool-connection label "Same as narrator", unrelated.)
- i18n (`packages/client/src/localization/locales/en.json`): puppeteer keys L5553-5562 (incl. L5557 description *"A director narrates between turns and triggers characters to act, then yields back to you…"*); narrator label `ui.chat.chatmessage.narrator` L5175; `chat.message.thinking` L530; regenerate/branch keys L5166-5195.
- Slash commands (`packages/client/src/lib/slash-commands.ts`): `/guided` aliases `["narrator","narrate","nar"]` L745-782 → `generationGuideSource: "narrator"` (guide-based steering, not puppeteer); `/roll` creates a narrator dice message L691-697.
- Shared schemas: `chat.schema.ts:9` (role), `prompt.schema.ts:68-83` (`"puppeteer"` marker type). SSE payloads (`puppeteer_step`, `group_turn`, `message_saved`, `typing`, `token`) are **not typed in `packages/shared`** — shapes exist only in the route and the client switch.
- Tests: **none** — `find packages e2e -name "*puppeteer*"` matches only `src` and `dist` build artifacts; no unit test for `parsePuppeteerDirection` despite its "regression-importable" doc header (`puppeteer-prompt.ts:2`).
- Minor: `saveNarration` is awaited without try/catch inside the loop (`puppeteer-loop.ts:152-157`); abort mid-loop keeps saved messages (header L8-9) and the next user send re-plans.
