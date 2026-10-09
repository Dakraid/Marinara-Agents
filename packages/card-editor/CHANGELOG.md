## 1.7.0 — 2026-10-10

- The bulk dispatch dialog now supports **Combined — create one new card**: each character's generated XML document is joined into a single new card's description (no per-card writes), with a required combined card name.
- Duplicate dispatches gain an optional **name prefix** that replaces the default " (Edited)" suffix, matching the engine's unified process flow.
- The auto-approve save mode is relabeled to make clear it saves each character's latest revision, and it is disabled with a visible hint whenever the bulk settings require review.
- The overlay dispatch accepts a **prefill** payload (preset, instruction, save mode, prefix, combined name, label) — the engine's "Process characters with Card Editor" entry opens this dialog fully configured, and every prefilled field stays editable.

## 1.6.1 — 2026-10-09

- Dispatches that omit a concurrency value now follow the panel's bulk settings (`maxParallelAgents`, default 4) instead of running serially — RP Chat "Process cards" runs parallelize like panel dispatches, while explicit values stay untouched.
- The bulk dispatch dialog starts the parallel-agents field at the effective cap (connection limit ∩ panel cap) when no previous value is remembered; remembered values still only clamp down.
- Review previews now decode HTML entities in diff lines, full-field views, and word-count chips, matching the already-decoded applied text.

## 1.6.0 — 2026-10-08

- New **Bulk settings** panel on the Runs page: cap how many agents a bulk run may drive at once (0 = follow the connection's limit, otherwise 1–16), and a **require review** toggle that disables auto-approve and auto-apply — every verdict becomes a confirmation and completion falls back to asking.
- Text applied from run results (verdict approvals, auto-apply, completion enforcement, and duplicated cards) now decodes HTML entities (`&lt;`, `&gt;`, `&quot;`, `&apos;`, `&amp;`, numeric forms) into their real symbols, so escaped model output no longer lands in card text.

## 1.5.0 — 2026-10-08

- Bulk runs can now process more cards in parallel: the concurrency control goes up to the selected connection's parallel job limit (up to 16) instead of the previous fixed cap of 4. With the default connection chain, the limit of the connection marked default for agents is used.
- Completed results stay inspectable: applied and duplicated cards in a session now offer an **Inspect** action that opens their full diff view — the same review surface used for pending confirmations, read-only.

## 1.4.0 — 2026-10-07

- Bulk runs can now enforce their successful outcomes when processing finishes: always apply in place, with cards edited mid-run held safely for review, or always duplicate using the session's configured name prefix or suffix.
- Completed and canceled sessions now offer **Run again**, creating a new queued session with the same configuration and targets while leaving the original run untouched.

## 1.3.0 — 2026-10-06 [quiet]

- Completed runs whose cards were edited in place (confirm/auto save modes) now offer a **Duplicate applied cards** action in the session detail: one click creates a renamed clone per applied card, following the session's duplicate prefix/suffix naming. Cloned items stay marked Applied and show their copy.
- Group Chat's **Replace characters with generated cast** (Engine) now also includes characters whose run items were only applied in place — they are the run's output, so the replacement no longer silently drops them; items duplicated afterwards yield their clone instead.
- Requires Marinara Engine 2.4.8 (Capability API 1.68).

## 1.2.2 — 2026-10-06 [quiet]

- Verdict review now always shows the full proposed field content below the colored diff when a field is expanded — no extra click needed. The expander button still reveals the complete colored diff and is relabeled "show all hunks →" accordingly.
- Requires Marinara Engine 2.4.8 (Capability API 1.68).

## 1.2.1 — 2026-10-06 [highlight]

- The overlay workspace is interactive again: clicks, scrolling, and the close button reach the dialog instead of passing through to the chat underneath. Backdrop-click dismissal in the bulk dispatch dialog works again too.
- The workspace sizes to its content (up to min(92dvh, 60rem)) instead of forcing a 92dvh-tall dialog, so few or no sessions no longer leave a large empty void; long session lists scroll inside the dialog.
- Tidier workspace panes: consistent rail and detail padding, with the rail divider spanning the full workspace height.
- Requires Marinara Engine 2.4.8 (Capability API 1.68).

## 1.2.0 — 2026-10-05 [highlight]

- The whole bulk flow now lives in an overlay workspace above the chat window (Capability API 1.68): session list, verdict review, diffs, and the dispatch dialog share one large two-pane surface instead of the cramped inline panel at the bottom of the agent settings.
- The sidebar selection action and the agent page open that workspace; engine controls can deep-link straight into a session or a prefilled dispatch through the `marinara:capability-overlay` event.
- The agent page keeps a compact status summary (active/past session counts) with an **Open Card Editor workspace** button.
- Requires Marinara Engine 2.4.8 (Capability API 1.68).

## 1.1.0 — 2026-10-04 [highlight]

- Bulk dispatch from the character selection bar: pick any set of characters and edit them in one session, with batched multi-card XML calls, automatic batch splitting on context overflow, and provider-error and refusal retries.
- Runs panel on the agent page: watch active sessions, browse history, review proposed edits in a verdict queue, and edit & retry failed requests from the exact rendered prompt.
- Behavior character: give editor runs and bulk sessions a style card whose <behavior_character> block shapes how edits are written.
- Staleness snapshots with always-apply UX: results remember the exact text the model saw, genuinely changed fields are flagged instead of blocking apply, and you choose to apply anyway or skip (Engine 2.4.7+).
- Requires Marinara Engine 2.4.7 (Capability API 1.67).
- Graduated to a full feature package with its own server runtime, client interface, and session storage.

## 1.0.0 — 2026-09-30

- Added directive-driven character-card rewriting with lorebook references and approval-ready field updates.
