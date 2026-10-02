# SPEC — Pokédex Scanner & Tracker (package `pokedex`)

## Goal
A Roleplay feature package that scans Pokémon on first encounter (generating a full Pokédex entry rendered as an in-chat card, matching the user-supplied template/screenshot) and tracks the trainer's active harem, pregnancies, and recent encounters — as a separate agent with package-rendered UI, following the hierarchical-maps / memory-nag feature-package pattern.

## Visual contract (user-approved)
- Scan card: exact structure/style of the user template — dark card, `background-image:url(https://files.catbox.moe/xu0jxk.png)`, consolas, centered, official artwork `https://assets.pokemon.com/assets/cms2/img/pokedex/full/{NNN}.png` (zero-padded 3 digits), sections `### GENERAL ###` (Category, Gender ♂/♀/⚥, Archetype = unique dere combination, Speech, Height m, Weight kg), `### SEXUAL ###` (Knowledge 5-10 words, Details 10-20 words anatomical, Evolution requirement 2-7 words), Ruby block (Affection ❤️/💔 rating + state + cause; Heat 🔥 rating + state + advice), hr, 5-20 word pervy comic trainer review, ★ rating + (SMASH/PASS).
- Tracker: ACTIVE HAREM (per member: name #dex | gender symbol, relationship, affection, last interaction, status/location), PREGNANCY STATUS (eggs expected, time since breeding, laying expected, sire; or *No current pregnancies*), RECENT ENCOUNTERS (met whether joined or not).

## Behavior
1. **Scan** — When the latest assistant message has a Pokémon physically appear / be directly interacted with for the first time (not mere mention; never humans), the agent generates the full entry. One entry per species per chat (v1 ceiling).
2. **Card in chat** — The package appends the rendered scan card HTML to the assistant message (no LLM regurgitation; programmatic append via engine seam E1 — see ARCH). On engines without E1 the card is absent but state/panel still work.
3. **Update** — Affection (0-5 + state + cause), heat (0-5 + state + advice), relationship status, last interaction, status/location update only when the narrative changes them. Absolute values (idempotent across swipes/retries).
4. **Harem & pregnancy** — Track joins/leaves only on clear story events; breeding starts a pregnancy (eggs expected, sire, bred-at); laying resolves it. Pregnancy/encounter events are idempotent per source message id.
5. **Tracker context injection** — Every roleplay turn while the agent is active, compact harem/pregnancy/recent-encounter state is injected into the main prompt (registerPromptContext), satisfying "always include".
6. **Tracker panel UI** — Live tracker + browsable Pokédex collection in the `tracker-panel` slot; toolbar button in `roleplay-tracker` slot; settings section in `chat-settings` slot.

## Settings (vault-backed, per chat)
- `autoScan` (default true), `injectTrackerContext` (default true), `renderScanCards` (default true), `maxRecentEncounters` (default 10, clamp 3-25).

## Non-goals
- No battles/stats/levels, no multi-individual-per-species (v1), no main-model template emission (package renders), no Conversation/Game modes, no localization beyond en catalog structure, no editing of generated entry fields in v1 UI except delete-entry / resolve-pregnancy / remove-harem-member corrections.

## Acceptance criteria
- New Pokémon in a reply → one LLM call → entry stored → card appended to that message (with E1) and visible in collection.
- Repeat mention of known species → no new card; state updates only.
- Harem join/leave, breeding, laying reflected in panel + injected context next turn.
- Swipe/regenerate does not duplicate entries, cards, pregnancies, or encounters.
- `npm run check`, `node scripts/build-feature-packages.mjs pokedex`, `node scripts/validate-catalog.mjs`, `node scripts/validate-package-locales.mjs`, `node scripts/test-catalog-lanes.mjs`, `node scripts/tests/catalog-release-notes.regression.mjs` all pass.
