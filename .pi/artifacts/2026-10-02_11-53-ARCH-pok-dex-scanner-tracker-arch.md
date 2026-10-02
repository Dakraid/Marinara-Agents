# ARCH — Pokédex Scanner & Tracker (package `pokedex`)

Feature package in the memory-nag mold: package-owned source under `packages/pokedex/src/engine/`, built by `scripts/build-feature-packages.mjs`, registered in `INCOMPLETE_PACKAGE_IDS` until ready.

## Engine seams used (all existing except E1)
- `agents.json`: one agent, id `pokedex` (= package id, required for `agent-runtime:pokedex` hooks), phase `post_processing`, `execution: "pipeline"`, category `tracker`, modeAllowlist `["roleplay"]`, `defaultSettings.resultType: "context_injection"` + `jsonContextOutput: true`, `contextSize: 8`, `maxTokens: 4096`, `temperature: 0.7`, contextSources chatHistory-only (memory-nag pattern).
- Server entry `activate({api})`: `registerPrivilegedRoutes(routes, {prefix: "/api/pokedex"})`, `registerService("agent-runtime:pokedex", runtime)`, `registerPromptContext(contributePokedexContext)`.
- Storage: `runtime.persistence.documents` — packageId `pokedex`, kind `chat-vault`, id `chat:<chatId>`.
- Slots (capabilityApi ≥ 1.14): `chat-settings`, `roleplay-tracker`, `tracker-panel`. Client entry = custom element `marinara-capability-pokedex` with `view` settings/toolbar/tracker (memory-nag client-entry pattern).

## E1 — engine change (handed to teammate `engine`)
Pipeline agents already get `prepareContext`/`finalizeResult` hooks (generate.routes.ts ≈6311/11618), but the engine never applies a `text_rewrite`-typed result coming back from a pipeline agent. E1: **after the post-generation rewrite loop settles, for each successful finalized capability-agent result whose type is `text_rewrite` and whose data carries a string `appendText`, append it to the saved assistant message (`chats.updateMessageContent(messageId, finalContent + appendText)`) and emit the `text_rewrite` SSE with the new full text.** Append (not replace) semantics compose with html/prose-guardian rewrite agents and with multiple packages. Without E1 the package degrades gracefully (no in-chat card; state + panel fine). Engine teammate also advises the capabilityApi minor + engine version to declare in `engine-boundary.json`/manifest.

## Agent I/O contract
`prepareContext` → `<agent_runtime_context>` JSON: `{ knownDex: [{key, species, name, gender, inHarem}], harem: [...], pregnancies: [...], recentEncounters: [...], settings }` (compact, capped).

LLM returns JSON only (all arrays may be empty):
```json
{
  "newScans": [{ "species", "dexNumber", "name?", "category", "gender": "male|female|futanari", "archetype", "speech", "heightM", "weightKg", "sexualKnowledge", "anatomicalDetails", "evolutionRequirement", "affection": {"rating":0-5,"state","cause"}, "heat": {"rating":0-5,"state","advice"}, "trainerReview", "starRating":0-5, "verdict":"smash|pass" }],
  "updates": [{ "key", "affection"?, "heat"?, "relationshipStatus"?, "lastInteraction"?, "currentStatus?" }],
  "haremJoins": ["key"], "haremLeaves": ["key"],
  "pregnancyEvents": [{ "type":"bred|laid", "key", "eggsExpected"?, "sire"? }],
  "encounters": [{ "key", "outcome":"met|joined|left|battled|fled" }]
}
```
`finalizeResult`: normalize+clamp every field (strings capped, ratings 0-5 int, gender/verdict enums, dexNumber int 1-1025); reject newScans for keys already in dex; reject updates for unknown keys; dedupe pregnancy/encounter events by `(messageId)` recorded on the record; apply atomically via `updatePokedexVault`; when `newScans.length>0` and `settings.renderScanCards`, return `{...result, type:"text_rewrite", data:{ editNeeded:true, appendText: renderedCards, changes:[{description:"Scanned X #N"}] }}`, else `{...result, data:{ editNeeded:false, appendText:"", changes:[] }}`. Records `latestScan` in vault for the panel badge.

## Vault schema (kind `chat-vault`)
```
{ version:1,
  dex: { [key]: DexEntry },           // key = species lowercase
  harem: [{ key, relationshipStatus, lastInteraction, currentStatus, joinedAt }],
  pregnancies: [{ key, eggsExpected, sire, bredAt, sourceMessageId }],
  recentEncounters: [{ key, outcome, at, sourceMessageId }],   // capped at settings.maxRecentEncounters
  latestScan: { keys:[], at } | null,
  settings: { autoScan, injectTrackerContext, renderScanCards, maxRecentEncounters } }
DexEntry = newScans row + { key, firstMetAt, sourceMessageId }
```

## Card HTML (shared renderer, server-side)
`renderPokedexScanCard(entry)` in shared: escapes ALL model strings, replicates the user template (inline styles, catbox background, artwork URL from zero-padded dexNumber, sections + ruby block + review + stars/verdict). Hearts/flames/stars rendered as filled/empty glyphs from ratings (❤️/💔, 🔥/△, ★/☆).

## Prompt-context contributor
Roleplay + agent active for chat (metadata.activeAgentIds includes `pokedex`) + `settings.injectTrackerContext` → `<context><pokedex_tracker>` block: harem one-liners (name #dex, relationship, affection state, status), pregnancies (name, eggs, sire, bred-at), recent encounters (last N). Plain lines, XML-escaped; honor `placedAgentTypes` (return bare text when engine places the section itself).

## Routes (`/api/pokedex`, privileged)
- `GET /chats/:chatId/state` → full vault (panel).
- `PATCH /chats/:chatId/settings` → normalize+merge settings.
- `DELETE /chats/:chatId/dex/:key` → remove entry (+ from harem/pregnancies/encounters).
- `POST /chats/:chatId/harem/:key/remove` → leave harem.
- `POST /chats/:chatId/pregnancies/:key/resolve` → mark laid.
All validate roleplay chat + inputs (memory-nag routes.ts pattern: 400/404 helpers, `withChatLock` around mutations).

## Client views
- `PokedexToolbar` (roleplay-tracker): button "Pokédex" + dex-count badge + latest-scan pulse; opens tracker panel.
- `PokedexTrackerPanel` (tracker-panel): ACTIVE HAREM / PREGNANCY STATUS / RECENT ENCOUNTERS sections + collection grid of `PokedexCard` (React twin of the template look). Correction actions (remove member, resolve pregnancy, delete entry) with confirm.
- `PokedexSettings` (chat-settings): four settings toggles/inputs.
- `api.ts` fetches routes; `localization.tsx` + `locales/en.json` UI catalog; `styles.ts` scoped `.pd-` classes + `mari-chrome-*` reuse.

## Build plumbing
- `scripts/build-feature-packages.mjs`: add `pokedexSourceRoot`/`pokedexOwnedSourcePaths`, feature entry (serverImport `packages/server/src/services/pokedex/server-entry.ts`, serverEntry, clientImport `packages/client/src/features/pokedex/client-entry.tsx`, engineBoundaryPath, capabilityApi 1.14 → bump when E1 lands, contributions slots + agentDetail), include `"pokedex"` in the memory-nag branch of `prepareFeatureBuildRoot`.
- Root: `packages/pokedex/{agents.json, engine-boundary.json, CHANGELOG.md (0.1.0), locales/en.json (via sync-package-locales)}`.
- `scripts/catalog-incomplete.mjs`: add to `INCOMPLETE_PACKAGE_IDS`; README "In development" table row.
- Validate: `npm run check` + build pokedex + full validation command set.
