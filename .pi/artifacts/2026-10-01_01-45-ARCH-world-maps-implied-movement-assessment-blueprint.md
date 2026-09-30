# ARCH — World Maps implied-movement assessment blueprint

Companion to SPEC `2026-10-01_01-44-SPEC-world-maps-implied-movement-assessment.md`. Two repos: **Marinara-Agents** (package `hierarchical-maps`, this repo) and **Marinara-Engine** (runtime; fork at `~/Source/Marinara-Engine`, customized branch). Follows the same two-repo pattern as the editor-agents blueprint (ARCH 2026-09-30_14-51).

## 1. Turn flow (new step in bold)

```mermaid
sequenceDiagram
    participant U as User
    participant E as Engine generate.routes
    participant M as Chat model
    participant P as Package: movement-assessment (new)
    participant S as Package: state-resolution/storage

    U->>E: message
    E->>M: generate (pre-gen prompt incl. spatial context, directive rules UNCHANGED)
    M-->>E: reply (+ optional [spatial_move]/[spatial_discover])
    E->>E: extractAssistantSpatialDirective (stream filter hides commands)
    alt directive detected (explicit move/discover)
        E->>S: materializeAssistantSpatialState(directive)
        Note over E,P: assessment NOT called (T3)
    else no directive
        E->>P: assessAssistantMovement(chatId, userText, replyText, messageId, swipeIndex, flags)
        P->>P: resolve state in chat lock; guards T1–T7; build assessment prompt
        P->>P: chatComplete on agent connection → strict JSON
        P->>P: validate (known+reachable | discover per toggle | else no-op)
        P->>S: materialize (directive-equivalent, assessedTravel, persistTravel, "assessment:" commandId)
    end
    E-->>U: SSE spatial_transition_committed (+ assessed, fromLocationId, routeLocationIds)
```

## 2. Cross-repo contract (the seam — pin this first)

**New capability service key** registered by the package, consumed by the engine through the existing `getCapabilityService` registry (same pattern as `hierarchical-maps:state-resolution`):

```ts
// key: "hierarchical-maps:movement-assessment"
interface MovementAssessmentService {
  assessAssistantMovement(input: {
    chatId: string;
    messageId: string;          // just-saved assistant message
    swipeIndex: number;
    regenerate: boolean;
    continuation: boolean;
    userMessageText: string;    // engine-trimmed (≤4000 chars)
    assistantMessageText: string; // cleaned reply (≤8000 chars, commands stripped)
  }): Promise<{
    applied: boolean;
    destinationId?: string;
    fromLocationId?: string;
    routeLocationIds?: string[];
    discovered?: boolean;
    commandId?: string;
    definitionRevision?: number;
  }>;
}
```

Engine-side guard list T1–T5/T7 lives at the engine call site; the package re-checks state authoritatively inside the chat lock and owns T6 (settings). The package returns `applied: false` on every refusal path — the engine treats null service (old package), `applied: false`, or a thrown error identically: continue without failing the turn.

**SSE addition (additive, backward compatible):** `spatial_transition_committed.data` gains `assessed?: true`, `fromLocationId?: string`, `routeLocationIds?: string[]`.

**Shared type additions (engine `packages/shared/src/types/spatial-context.ts`, mirrored into vendored `sources/engine/packages/shared`):**

```ts
export interface SpatialAssessedTravel { fromLocationId: string; routeLocationIds: string[]; }
export interface SpatialContextSnapshot { /* …existing… */ travel?: SpatialAssessedTravel | null; }
export interface CapabilitySpatialSnapshotWrite { /* …existing… */ travel?: SpatialAssessedTravel | null; }
```

`SpatialTravelMode` is unchanged — persisted assessed travel maps onto the existing `ResolvedSpatialTravel` with `mode: "travel_now"`, `remainingLocationIds: []`, `complete: true` when rendered into the next prompt.

## 3. Engine changes (Marinara-Engine)

| File | Change |
|---|---|
| `packages/shared/src/types/spatial-context.ts` | `SpatialAssessedTravel`, `travel?` on snapshot + write type |
| `packages/shared/src/schemas/spatial-context.schema.ts` | optional `travel` field (strict shape: fromLocationId + routeLocationIds[]) |
| `packages/server/src/db/schema/spatial-context.ts` | additive nullable `travel` text column (JSON) on `spatial_context_snapshots` — existing rows read as null |
| `packages/server/src/services/capability-packages/capability-persistence.service.ts` (+ file-backed-store) | pass `travel` through getByAnchor/listByAnchors/replaceAtAnchor/getByCommand/getBootstrap |
| `packages/server/src/services/spatial-context/movement-assessment.ts` (NEW) | thin facade: `assessAssistantMovement(input, chatMetadata)` → null when maps disabled/service absent (mirrors `projection.ts` facade shape) |
| `packages/server/src/routes/generate.routes.ts` | trigger wiring — see §3.1 |

### 3.1 generate.routes.ts wiring

At each of the existing assistant-materialize call sites (verb-anchored path ≈ :9554 and saved-message path ≈ :9974), when `assistantSpatialDirective === null` (T3) and T1/T2/T5 hold: build `{ userMessageText, assistantMessageText }` (user text via the same lookup as `findLastUserMessageIdBefore(chatId, messageId)` already used at :11664; reply = cleaned full response), call the facade, and on `applied: true` send the extended `spatial_transition_committed` SSE. Game-mode guided path (:11723): only run assessment when the guided snapshot did NOT move the pin this turn (T4) — track with a local boolean. Regenerate/continuation flags pass through. Whole call wrapped: never throw into the generation path; timeout 20 s (AbortController), warn-log failures.

Engine tests: extend the engine spatial regression set — (a) assessed move applied when no directive, (b) directive present → no assessment, (c) suppressed input → no assessment, (d) game guided move → no assessment, (e) travel field survives storage round-trip, (f) service absent (package without the key) → no-op, no crash.

## 4. Package changes (Marinara-Agents, `packages/hierarchical-maps`)

### 4.1 Vendored shared sync (prerequisite to server work)
Update `sources/engine/packages/shared` reference surface from the merged engine change via `scripts/sync-reference-surface.mjs`; `node scripts/tests/vendored-engine.regression.mjs` must stay green.

### 4.2 Server (`src/engine/packages/server/src`)
- **`services/spatial-context/movement-assessment.ts` (NEW)** — owns the whole assessment: settings read (`getPackageAgentSettings("hierarchical-maps")`), connection resolve (`getPackageAgentConnectionId` → `getPackageLanguageModels().resolve`), prompt build (system policy text + bounded map context via `resolveSpatialBreadcrumb`/`resolveSpatialDestinations`/known-locations index), `chatComplete` call (temperature 0.2, maxTokens 300 fallbacks), JSON parse with one repair round (`json.parseJsonish`, pattern of `parseSpatialMapJsonWithRepair`), deterministic validation (`resolveSpatialRoute`, one-hop walk check for `viaLocationIds`), application.
- **`services/spatial-context/state-resolution.ts`** — extend `materializeAssistantSpatialState` input: `assessedTravel?: SpatialAssessedTravel | null`, `persistTravel?: boolean`, `commandIdPrefix?: "assistant" | "assessment"`; write `travel` onto the snapshot when transition applied and persist enabled. Export the existing `discoverLocation` logic (or a shared helper) for reuse by the assessment — do not duplicate.
- **`services/storage/spatial-context.storage.ts`** — include `travel` in `snapshotWrite`/reads (field may be absent on old-engine rows → normalize to null).
- **service registration** — add `registerService("hierarchical-maps:movement-assessment", …)` next to the existing four keys at activation.
- **`maps-shared/src/runtime-prompt.ts`** — when the resolved snapshot carries `travel`, render prior-arrival context into the turn prompt: route names (`resolveSpatialBreadcrumb`-style names per id) WITHOUT the `movement_this_turn` suppression sentence (see SPEC §travel facts). Owner `acceptedTravel` rendering unchanged.
- **`agents.json`** — `defaultSettings: { assessImpliedMovement: true, assessmentDiscovery: true, assessmentPersistTravel: true }`.

### 4.3 Client (`src/engine/packages/client/src`) + locales
- `features/spatial-context/SpatialContextSettingsSection.tsx` — approved sibling-switches "Movement Assessment" group (three `role="switch"` rows matching the existing Enable World Maps styling): *Assess implied movement* / *Discover unknown destinations* / *Remember travel route*; read + persist via the existing `/spatial-context/agent-configuration` PATCH; optimistic state + error banner per section conventions.
- `locales/en.json`, `locales/ko.json` — labels/descriptions for the three switches + group heading.

### 4.4 Package regression tests (`tests/hierarchical-maps-lifecycle.regression.ts`)
Extend the fake provider fixture: route assessment calls by prompt signature; add fixture responses covering AC-1…AC-10 (valid move, valid narrated path, invalid via-ids → BFS fallback, unknown+discovery on/off, unreachable, malformed JSON, provider error, directive-present skip, master-toggle-off skip, guided-move skip). Assert snapshot contents (travel, `assessment:` commandId), SSE event payload, next-turn prompt (arrival context present, suppression sentence absent), and provider call counts.

## 5. Task split (dependency-aware)

| # | Task | Repo | Owns | Depends on |
|---|---|---|---|---|
| 1 | Engine travel plumbing (types, schema, persistence pass-through) + engine regressions | Engine | shared types/schemas, db schema, capability-persistence, file-backed-store | — |
| 2 | Vendored shared sync | Agents | `sources/engine/packages/shared/**` (generated) | 1 |
| 3 | Package assessment service + state-resolution/storage/prompt changes + agents.json settings + package regressions | Agents | package server src + maps-shared runtime-prompt + agents.json + tests | 2 |
| 4 | Engine facade + generate.routes wiring + engine regressions | Engine | services/spatial-context/movement-assessment.ts (new), routes/generate.routes.ts | 1, 3 (contract) |
| 5 | Package settings UI + locales | Agents | package client src + locales | 3 (settings keys) |
| 6 | Package release: 1.5.0, CHANGELOG, rebuild bundles, catalog/locale/README validations | Agents | manifest, CHANGELOG, bundles, catalog | 2, 3, 5 |
| 7 | Cross-repo validation: full lifecycle regression + engine docker rebuild/push | both | — | 1–6 |

Tasks 3 and 5 run in parallel (disjoint files); task 4 can start once the service contract (§2) is fixed — no file overlap with package work.

## 6. Risks

1. **Per-turn cost/latency** — one small chatComplete (≤300 tokens) inline before stream close; bounded by 20 s timeout + master toggle. Accepted by maintainer (interview).
2. **False-positive moves** — mitigated by conservative prompt policy (focal-party completed movement only) + deterministic validation (known+reachable / discovery semantics) + master toggle. Narration false moves remain possible; logged at debug with rationale for audit.
3. **BFS route ≠ narrative route** — narrated `viaLocationIds` honored when valid; fallback documented.
4. **Old engine + new package** — service key never called; travel field reads absent → null; inert. Old package + new engine → facade returns null. Both directions safe.
5. **Double-move race** — T2 (queued owner transition) + T3 (directive) + T4 (guided move) guards; package re-checks state inside the chat lock, so a concurrently committed move simply changes what "current" means; idempotent per anchor via replaceAtAnchor.
6. **Prompt bloat** — known-locations index capped at 50 (existing constant); inputs bounded (4k/8k chars); output capped at 300 tokens.
