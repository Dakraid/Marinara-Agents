# SPEC — World Maps: implied-movement assessment

Date: 2026-09-30. Requester: maintainer. Verbatim ask: "Expand the world map agent to assess whether the last message implied a change of location and if so where and how they went to based on the world map."

## Problem

World Maps (`hierarchical-maps`) only moves the location pin for (a) explicit owner UI transitions, (b) main-model `[spatial_move]`/`[spatial_discover]` directives — authorized only for direct, present-tense/imperative, user-led movement ("your own narration alone never authorizes either command"), and (c) game-mode tracker `location` guidance (exact-name match). Movement that is merely *implied* by the finished turn (narrated arrival by the model: "They descended the stairs into the moonlit courtyard"; indirect user phrasing: "we bed down at the inn") never moves the pin, and assistant-side moves record no route ("how they went").

## Approved decisions (interview 2026-09-30)

1. **Assessor: dedicated agent-side LLM call.** The World Maps agent runs its own focused assessment call after each turn on its configured connection. The main-model directive policy stays unchanged.
2. **Travel persistence is a toggle, default ON.** Persisted: travel facts written onto the spatial snapshot. Off: route is ephemeral (SSE event + next-turn prompt only — see AC-7).
3. **Discovery from assessment is a toggle, default ON.** On: unknown-but-significant implied destinations may be discovered. Off: no-op, pin stays.
4. **Settings UI: sibling switches** (approved via design deck) — a "Movement Assessment" group of three equal switches in the existing World Maps chat-settings section.

## Behavioral contract

### Assessment trigger (engine, inline post-save, before stream close)

Run the assessment for each generated assistant message (including regenerates and continuations) only when ALL hold:

- T1. hierarchical maps enabled for the chat (`isHierarchicalMapsEnabledForChat`); chat mode is `roleplay` or `game`.
- T2. `!shouldSuppressAssistantSpatialMutation(input)`.
- T3. No assistant spatial directive was detected this turn (`extractAssistantSpatialDirective(fullResponse).directive === null`). Explicit directives remain the authoritative path and are never double-applied.
- T4. Game mode only: the world-state tracker `location` guidance did NOT already apply a spatial transition this turn (engine tracks whether `guidedSpatialSnapshot` moved the pin).
- T5. Resolved spatial state has `definition.enabled === true` and `currentLocationId !== null`.
- T6. Agent setting `assessImpliedMovement !== false` (default true).
- T7. A language-model connection resolves for the package agent (`getPackageAgentConnectionId("hierarchical-maps")` → `languageModels.resolve`). Unresolvable → skip silently (debug log only).

Trigger failures are silent no-ops. Assessment errors, timeouts (20 s), and malformed/empty responses NEVER fail or alter the turn: warn log + no-op.

### Assessment call (package service `hierarchical-maps:movement-assessment`)

Input (engine-supplied): last user message text (bounded 4,000 chars) and the cleaned generated reply text (bounded 8,000 chars, spatial commands already stripped). Package builds the map context authoritatively inside the chat lock: current breadcrumb, one-hop destinations, known active locations (id + breadcrumb path, cap 50 — mirrors projection limits).

Prompt asks for strict JSON only:

```json
{
  "changed": true,
  "destinationId": "loc_exact_id",
  "viaLocationIds": ["loc_a", "loc_b"],
  "discover": { "name": "…", "relation": "enter|link", "direction": "outgoing|incoming|both", "description": "…" },
  "rationale": "…"
}
```

Assessment policy embedded in the prompt (mirrors and extends the existing directive rules):
- Only completed movement of the focal party — narrated arrival or implied user arrival ("we bed down at the inn").
- NOT: mentions, plans/intentions, NPC-only movement, imagined/flashback/dreamed places, failed or unfinished travel, transient scenes (hallways, vehicles, temporary camps).
- Known destination → exact `destinationId` from the supplied index. `viaLocationIds` = narrated intermediate stops, if any.
- Unknown significant, durable, revisitable place → `discover` block (only offered when the discovery toggle is on; otherwise such cases must return `changed: false`).
- Nothing applicable → `{ "changed": false }`.

Call options: `chatComplete(messages, { temperature: 0.2, maxTokens: 300, debugMode: isDebugAgentsEnabled() })` — package fallbacks only; explicitly stored connection parameters win (capability-host precedence). JSON parsing via the `json.parseJsonish` host with one repair round, mirroring the existing map-template parse/repair pattern.

### Deterministic validation and application (package, chat-lock transaction)

1. `changed !== true` → no-op.
2. Known destination (`destinationId` present): must exist, be active, and a route from `currentLocationId` must exist (`resolveSpatialRoute`). `viaLocationIds` validated as a consecutive one-hop walk from current → destination; invalid/incomplete → replaced by the computed BFS route. No route at all → no-op + debug log.
3. Unknown destination (`discover` present): allowed only when `assessmentDiscovery !== false`; reuses the exact `discoverLocation` semantics of the directive path (name-match resolution: unique reachable match → move instead of create; ambiguous → refuse; `link` requires `direction`; location-count caps apply). Toggle off → no-op.
4. Apply through the same snapshot/materialize machinery as assistant directives. `transitionCommandId` prefix `assessment:{messageId}:{swipeIndex}` distinguishes the provenance; regenerate/continuation anchor semantics are unchanged (`replaceAtAnchor`; `beforeMessageId` for regenerate).
5. The assessment NEVER runs when an explicit directive exists (T3) and NEVER overrides a tracker-guidance move (T4) or a queued owner transition (T2).

### Travel facts ("how they went")

- Applied moves record `travel = { fromLocationId, routeLocationIds }` where the route covers every hop from origin to destination (narrated-validated path or computed BFS route; for discoveries: the single enter/link hop).
- `assessmentPersistTravel !== false` (default true): travel is persisted as an additive field on the spatial snapshot and surfaced on the next turn's prompt as prior-arrival context ("arrived from X via Y > Z last turn"). This rendering MUST NOT include the "Movement is already canonical for this turn. Do not emit another location change" suppression — that stays exclusive to same-turn owner `acceptedTravel`; a suppression there would wrongly block legitimate new user-led moves in the following turn.
- Toggle off: snapshot stays travel-free; the route still rides the SSE event and log line (ephemeral).
- SSE `spatial_transition_committed` gains additive fields: `fromLocationId`, `routeLocationIds`, `assessed: true` (existing clients ignore unknown fields).

### Settings

Agent `defaultSettings` (inside `defaultSettings` only — `packagedAgentDefinitionSchema` is strict): `assessImpliedMovement: true`, `assessmentDiscovery: true`, `assessmentPersistTravel: true`. UI: approved sibling-switches group in `SpatialContextSettingsSection`, persisted through the existing `/spatial-context/agent-configuration` PATCH route, localized en + ko.

## Non-goals

- Changing the explicit directive policy (`userLedTransitionInstruction`) — untouched.
- NPC/multi-party location tracking; imagined-place filtering beyond the assessment prompt rules.
- Narrative transport-mode inference ("by boat") beyond map topology — "how" = route through the map.
- Async/background assessment; batch retro-scan of existing chats.
- Client visualization of routes (no client rendering change; breadcrumb already refreshes on the SSE event).
- XYZ coordinate spaces (`XYZ-SPATIAL-LOCATIONS-PLAN.md` — separate future plan).

## Acceptance criteria

- AC-1: Narrated implied arrival (no directive) → pin moves to the validated destination; snapshot carries `assessment:`-prefixed commandId; SSE event fires with `assessed: true` + route.
- AC-2: Turn with an explicit `[spatial_move]` directive → assessment call NOT made (provider fixture call count proves it).
- AC-3: Narrated arrival at an unknown significant place with discovery on → location created (enter or link per narrated topology); off → pin stays, no definition mutation.
- AC-4: Known-but-unreachable implied destination → no-op, pin stays.
- AC-5: Invalid `viaLocationIds` → computed BFS route used; valid narrated path → recorded verbatim.
- AC-6: Persist toggle on → next-turn prompt contains prior-arrival route context and NO "Do not emit another location change" line; toggle off → snapshot has no travel, SSE still carries route.
- AC-7: Malformed JSON / provider error / timeout → turn unaffected, warn logged, no partial snapshot write.
- AC-8: Regenerate of an assessed-move message re-runs assessment on the new swipe and replaces the anchor snapshot; no duplicate commandIds.
- AC-9: Master toggle off → no assessment provider call (fixture call count proves it).
- AC-10: Game mode: tracker guidance already moved the pin this turn → assessment skipped.
- AC-11: Three settings switches render per the approved deck design, persist via the agent-configuration route, and survive reload.

## Validation

Package repo (Marinara-Agents):
- `npm run check`
- `npx tsx --tsconfig tests/tsconfig.regressions.json tests/hierarchical-maps-lifecycle.regression.ts` (extended with the AC-1…AC-10 fixtures; needs MARINARA_ENGINE_ROOT pointing at the updated engine worktree)
- `node scripts/build-feature-packages.mjs` (rebuild; honors hierarchical-maps boundary)
- `node scripts/test-catalog-lanes.mjs && node scripts/validate-package-locales.mjs && node scripts/validate-package-locale-keys.mjs && node scripts/validate-catalog.mjs && node scripts/tests/catalog-release-notes.regression.mjs`
- `node tests/world-maps-ui-contract.regression.mjs`

Engine repo (Marinara-Engine):
- `node ./scripts/run-regressions.mjs` (existing gate) + new/extended spatial regressions for trigger wiring (T2/T3/T4 skip conditions, assessed move application, travel persistence pass-through).
- Rebuild + push `netrve/marinara-engine:customized` docker image for live verification by the user.

## Versioning

- Package `hierarchical-maps`: 1.4.3 → **1.5.0** (feature), CHANGELOG entry required (build rejects without it).
- `engine.min` stays 2.4.2: the new capability service key is simply never invoked on older engines, and the additive snapshot field reads as absent — full backward compatibility; assessment is inert there.
- Engine fork: minor version bump per engine repo convention; vendored reference surface in this repo re-synced after the engine change merges.
