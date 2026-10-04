## 1.1.0 — 2026-10-04 [highlight]

- Bulk dispatch from the character selection bar: pick any set of characters and edit them in one session, with batched multi-card XML calls, automatic batch splitting on context overflow, and provider-error and refusal retries.
- Runs panel on the agent page: watch active sessions, browse history, review proposed edits in a verdict queue, and edit & retry failed requests from the exact rendered prompt.
- Behavior character: give editor runs and bulk sessions a style card whose <behavior_character> block shapes how edits are written.
- Staleness snapshots with always-apply UX: results remember the exact text the model saw, genuinely changed fields are flagged instead of blocking apply, and you choose to apply anyway or skip (Engine 2.4.7+).
- Requires Marinara Engine 2.4.7 (Capability API 1.67).
- Graduated to a full feature package with its own server runtime, client interface, and session storage.

## 1.0.0 — 2026-09-30
- Added directive-driven character-card rewriting with lorebook references and approval-ready field updates.
