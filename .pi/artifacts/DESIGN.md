<!-- Last updated: 2026-10-09 23:10:14 UTC -->
<!-- Last updated: 2026-10-04 15:45:16 UTC -->
<!-- Last updated: 2026-10-04 17:45 UTC -->
<!-- Last updated: 2026-10-10 01:10 UTC (card-editor 1.7.0: unified process entry + combined saving; see SPEC/ARCH 2026-10-10_01-09) -->
# DESIGN — Card Editor UX contract (+ Lorebook Editor surface, CYOA button)

Card Editor sections reflect the user-approved Design Deck of 2026-10-04
(deck export: `~/.pi/deck-snapshots/deck-Marinara-Agents-customized-2026-10-04-174252-submitted/export.html`).
All Card Editor surfaces follow engine chrome (existing modal/panel primitives, diff patterns); package-owned UI uses the capability element pattern with engine-supplied class hooks.

## 1. Card Editor — proposal review (per-card run, both engine surfaces)

`CardEditorProposalPanel.tsx` (chat-less, from "Run Card Editor") and `CharacterCardUpdateModal.tsx` (in-chat) share ONE interaction model — "Single Apply with inline stale confirmation":

- Every row shows: field name, change summary (+words/−words), reason, old→new diff, include checkbox (default on), **Apply** button that is **never disabled**.
- Staleness is computed from per-field run snapshots: a row is stale only if the card genuinely changed since the run (no more false "card changed" from XML-escaping/macro/trim artifacts — see ARCH for the snapshot mechanism).
- Fresh row: Apply applies immediately (whole-field replacement with newText via character PATCH, revision snapshot `versionSource:"agent"`).
- Stale row: Apply expands an inline strip inside the row — "This card changed since the run. Applying replaces the field." with **[Apply anyway]** / **[Skip]**. No separate force button; force is the confirm step. The in-chat modal's old append-on-override behavior is removed — replace semantics everywhere.
- Header: **[Apply selected (n)]** — if any selected row is stale, one summary confirmation ("2 of 5 cards changed since their runs — apply anyway? [Apply anyway] [Skip stale]") precedes the write; otherwise applies immediately.
- Empty oldText + empty field = fresh insert (unchanged rule). Legacy results without snapshots fall back to the old substring check — stale rows then always get the inline confirmation path.
- After apply: rows flip to "applied · revision saved"; failures show the PATCH error inline with retry.
- Run configuration (panel only, above proposals): directive textarea, collapsed reference-lorebook multi-picker (default: character-linked), connection override select, **Behavior character picker** (§4).

## 2. Card Editor — bulk dispatch (package UI, entry from selection action bar + chat settings drawer)

Entries: dedicated **"Card Editor"** button in `mari-selection-action-bar` (renders only when the package is installed; enabled with ≥1 selected character), and the engine chat **"Process characters with Card Editor"** button (Group-Chat section of ChatSettingsDrawer; package installed + >1 chat character). Both open the **same sectioned dialog**; the chat entry preloads all chat members plus the XML-transform prefill (§7). Opens the **single sectioned dialog**:

- **Targets · N characters** — one row per card: avatar, name, per-card note input ("focus on backstory…"), per-card **style override** select (`— use session style —` / `<character>` / `None`). Remove-target × per row.
- **Model** — connection select (default: agent default; language connections only) + prompt preset select: `Standard rewrite` / `Strict surgical` / `Field rebalancing` / `Simple XML cast` / `Complex XML cast` / `Custom…` (Custom expands a template textarea prefilled with the selected preset).
- **Instructions & references** — global instruction textarea; **Behavior character** (session-level select, default None); global lorebooks multi-select (applied to every card).
- **Processing** — mode radio: `One agent per card` / `Batched — XML, N cards per call` (batched stays opt-in; default individual — every standard run is one character in, one character out); batch size input (default 4, range 1–16); provider retries (default 2, 0–5); refusal retries (default 3, 0–5); concurrency (default = effective parallel cap, 1–parallelCap; "parallel agents"); **Rebalance field content** checkbox (split into Description / Personality / Backstory / Appearance / Scenario). Caption: "On context overflow the failed batch is split and re-dispatched automatically until single-card calls remain."
- **Saving** — radio: `In-place — confirm each card` / `In-place — auto-approve (saves each character's latest revision)` / `Duplicate — apply to copies` / `Combined — create one new card`. Duplicate expands an optional **name prefix** input (default suffix " (Edited)" when empty; prefix replaces it). Combined requires a **combined card name** (default `<chat> — Cast` from the chat entry). Captions: in-place always writes a new revision; auto-approve holds back cards that genuinely changed mid-run for review; combined concatenates each character's generated XML document into ONE new card's description (no per-card writes). When the require-review setting (`disableAutoVerdicts`) is on, the auto-approve radio is disabled with a hint (server coerces to confirm).
- Footer: live estimate ("Batched ×4 → 3 calls · individual → 12 calls") + **[Dispatch]**. Dispatch creates a session; dialog closes; a toast links to the runs panel.
- Last-used configuration is remembered per user (except targets/notes) and pre-filled next time; chat-entry prefill overrides the remembered values for its fields on that open only.

## 3. Card Editor — runs management + review (package UI on the agent config page)

Mounts as a panel **below the existing agent settings** (Agents → Card Editor; engine contribution `agentPanel`, not `agentDetail`). Two levels:

**Sessions list** (top of panel): active sessions with label, mode chip, progress bar (items done/total), live status line ("Running batch 2 of 3 · 1 retry after provider 503"), **[Cancel]**; below, session history rows — click to open. Panel polls while visible (2s active, pause when hidden); manual refresh always available.

**Session detail**: item table — card, status chip (`queued` `running` `succeeded` `needs review` `applied` `duplicated` `failed · provider` `failed · refusal` `failed · parse` `canceled` `interrupted`), result summary, actions (`open card`, `review`, `rerun`, `edit & retry`, `cancel` for queued). Session-level: Cancel all, Rerun all failed, Delete session.

**Review = verdict queue (triage flow)** for confirm-mode sessions (and held-back auto-approve items):
- One card at a time, centered: name, summary chips (fields touched, +words/−words, field word counts), stacked **field hunk previews** — collapsed-context unified diffs (±3 lines, "⋯ N unchanged lines ⋯" markers, old struck red / new green), capped ~8 lines per field, "show all hunks + full field →" per field. Collapsed mini-rows for additional fields ("▸ personality — +18/−4 words").
- Footer: **[Reject]** / **[Approve]** with keyboard hints (R / A), ←/→ navigation; progress dots across the session colored by verdict.
- "Approve all remaining without review" link (skipped = undecided, stays in session).
- Stale cards surface the §1 inline confirmation inside the queue ("changed since run — [Apply anyway] [Skip]").
- Duplicate-mode sessions show result rows with a link to the created copy instead of the queue.

**Edit & retry** (failed · provider / refusal / parse): dialog showing the exact rendered prompt (system + user, editable textareas) + retry button; re-dispatches that single item with the edited prompt.

## 4. Behavior character (character card as style prompt)

- Picker = search-select over the character library, `None` default, short hint text. Present in: per-card run panel (single picker; last choice remembered in localStorage) and bulk dialog (session-level select + per-target overrides, §2). Config-page panel shows an injection preview block.
- Injected block (engine editor-run path AND package bulk path, identical format):
  `<behavior_character>` with Name/Description/Personality/Backstory/Appearance (+ System when present), followed by the instruction: adopt this character's behavior, judgment and writing style when editing — it guides HOW cards are written; directive and user notes govern WHAT changes.

## 5. Lorebook Editor surface (unchanged, 2026-09-30)

Entry "Run Lorebook Editor" in `LorebookEditor.tsx`; scope toggle whole book | selected entries; directive + reference-character picker + connection override; `LorebookEditorProposalPanel` create/update/delete rows with diffs; same inline-confirmation apply model as §1.

## 6. CYOA permanent button (unchanged, 2026-09-30)

`ConversationMessageActions` optional `onRegenerateCyoa`; Dices-icon action after regenerate; gating in message components; `use-cyoa-reroll` via `retryAgents(chatId, ["cyoa"], { forMessageId })`.

## 7. Unified "Process characters with Card Editor" entry (2026-10-10)

- The engine's own modal (`CardEditorProcessDialog.tsx`) is **deleted**. The chat-settings button dispatches the package overlay (`marinara:capability-overlay`) with `dispatch.characterIds` = all chat members and a **prefill**: preset `xml-simple`, XML-transform global instruction, saveMode `auto` (latest revision), duplicate prefix `<chat> `, combined card name `<chat> — Cast`, label `Process: <chat>`. Everything remains editable inside the dialog; one-click behavior preserved for users who accept the defaults.
- Context contract (all bulk paths): each run receives exactly the character(s) it operates on — individual mode = strictly one card per call; the in-chat scheduled card-editor agent receives only run-window characters (messages since its previous successful run, else last 20).

## Style

Engine surfaces: match existing editor/action-bar components and modal/panel primitives; no new dependencies. Package surfaces: React inside the capability custom element, engine class hooks from `capabilityProps`, dark theme tokens, localization via package locale catalogs (`cardEditor.*` keys, `{{var}}` interpolation); all user-visible strings localized (en baseline).
