# Fork Deviations (Dakraid fork vs upstream)

This file lists every intentional difference between the fork branch `customized` and `upstream/staging` (Pasta-Devs/Marinara-Agents). Read it before resolving an upstream merge conflict: each entry says what the fork changed, where, what must survive a merge, and which tests pin it.

Keep it current: a branch that adds or changes a fork deviation updates its entry in the same change.

- Upstream remote: `upstream` = Pasta-Devs/Marinara-Agents; `origin` = Dakraid. The fork merges `upstream/staging`.
- Last merged upstream commit: `65ab592de` (#1647, 2026-10-24). That merge folded gacha-forge 1.11.0–1.13.0 into fork `10.3.0`, hierarchical-maps 1.7.0–1.7.1 into `10.2.0`, long-term-memory 1.4.87–1.4.90 into `10.4.0`, relationship-tracker 0.7.2 into `10.1.0` and slurp2 0.4.0 into `10.2.0`. The merge before it (`5bef5fa20`, #1598) folded gacha-forge 1.9.0–1.10.0 into fork `10.2.0`, long-term-memory 1.4.86 into `10.3.0`, hierarchical-maps 1.6.0 into `10.1.0`, and added blackjack 1.0.0 as `10.0.1`. The merge before it (`e79842733`, #1590) folded gacha-forge 1.8.15 into `10.1.0` and long-term-memory 1.4.85 into `10.2.0`. Earlier (`64bab6768`, #1581) folded conversation-calls 1.1.7, long-term-memory 1.4.84, noodle 1.5.9 and slurp2 0.3.53 into `10.1.0`.

To tell who owns a failing test: equal `git hash-object tests/<f>` and `git ls-tree upstream/staging -- tests/<f>` mean upstream owns it.

Marked _(inferred)_: read from code or history rather than stated in a commit or test.

---

## Merge checklist

1. `git fetch upstream`, merge `upstream/staging`. Never merge stale local `main`, `origin/main` or `staging`.
2. Generated files (`catalog/**`, `artifacts/*.zip`, `packages/*/{client.js,server.mjs}`): take one side, then rebuild from merged sources. Never hand-merge or hand-edit them. Accumulate ZIPs; never delete them.
3. Versions stay on 10.x everywhere: manifests, builder `version:`, `VERSION`, `SLURP2_VERSION`, the CHANGELOG top. Bump each upstream-changed package to `10.1.0`, fold upstream's notes into that entry, and update the routing-test pins.
4. Vendored Engine (`sources/engine/**`): ours as the base, apply upstream semantic swaps, drop orphaned imports, regenerate `scripts/vendored-engine-baseline.json`.
5. Re-check Dakraid URLs in every builder and validator hunk upstream touched.
6. Keep the fork hooks in `scripts/build-feature-packages.mjs`: Card Editor and Pokédex roots, entries and boundaries; the `agentsSource` branch; the `fromVendoredEngine` exclusions; World Maps `agent.defaultSettings` and the movement-assessment service registration.
7. Modern Life Sim: port upstream bundle changes into `src/` by hand, then rebuild. Never take upstream bundles.
8. Rebuild affected packages (`build-agent-catalog.mjs <id>`, `build-feature-packages.mjs <id>`, per-package builders). Do not rebuild Card Editor or Pokédex only to restamp them.
9. `validate-catalog` expects 44 = 27 agents + 17 features + 0 rulesets, adjusted for upstream's net additions.
10. `grep -c "duplicate-applied" packages/card-editor/client.js` returns more than 0.
11. Full gate, in order: `npm run check` → `node scripts/test-catalog-lanes.mjs` → `node scripts/validate-package-locales.mjs` → `node scripts/validate-catalog.mjs` → `node scripts/tests/catalog-release-notes.regression.mjs` → fork `tests/*.regression.*` (`.mjs` with node; `.ts` with `pnpm exec tsx --tsconfig tests/tsconfig.regressions.json`; Engine-booting lanes with plain `npx tsx` against a freshly built Engine-fork shared `dist`).

---

## 0. Global rules

### Versioning: the 10.x line

- **What/why:** since 2026-10-20 (`66ab2713c`) every package is renumbered to `10.0.1`, so fork packages stay above anything upstream publishes and Engine installs never "downgrade" to upstream.
- **Rule:** hotfix bump for each patch (`10.0.x` → `10.0.x+1`); minor bump for an upstream merge that changes the package (`10.0.x` → `10.1.0`); never below 10. When upstream bumps a package, keep the fork version and fold upstream's notes into the fork entry.
- **Version sources (must agree):** `packages/<id>/manifest.json` (agent-only packages, gacha-forge, relationship-tracker, modern-life-sim, ruleset-5e-2014); `version:` in `scripts/build-feature-packages.mjs` (noodle, slurp2, long-term-memory, memory-nag, card-editor, pokedex, hierarchical-maps, conversation-calls, the 6 turn games); `VERSION` in `scripts/build-{beholder,pixelforge,quartermaster}-package.mjs`; `SLURP2_VERSION` plus the top `SLURP2_RELEASES` entry in `packages/slurp2/.../onboarding/slp-release.ts`; the top `## <version>` of `packages/<id>/CHANGELOG.md` (builder-enforced, max 20 entries, 1,000 chars each).
- **Keep on conflict:** always the 10.x value. Never take upstream `1.x`/`0.x` lines in manifests, builder maps, `VERSION`, `SLURP2_VERSION` or the CHANGELOG top.
- **Fork-created CHANGELOGs** (add/add conflicts if upstream adds its own; union with the fork entry on top): background, card-evolution-auditor, chess, combat, continuity, cyoa, director, echo-chamber, eightball, expression, haptic, html, illustrator, knowledge-retrieval, knowledge-router, lorebook-keeper, persona-stats, poker, prose-guardian, quest, rock-paper-scissors, spotify, storyboard, tic-tac-toe, uno.
- **Current versions:** card-editor `10.0.8`; long-term-memory `10.4.0`; gacha-forge `10.3.0`; modern-life-sim `10.0.3`; hierarchical-maps and slurp2 `10.2.0`; conversation-calls, noodle and relationship-tracker `10.1.0`; all other packages (including blackjack) `10.0.1`.
- **New upstream packages** start at `10.0.1` with a fork CHANGELOG entry on top ("Includes upstream X"); set the version in the manifest and the builder entry.
- **Multi-package bumps:** each builder validates every catalog entry's CHANGELOG lead, so bumping several packages fails on the first builder. Bypass the version check in `scripts/catalog-release-notes.mjs` for the builds, restore it byte-for-byte, then rerun one builder to prove the check passes.

### Packages with fork changes beyond the version

| Package              | Fork version | Kind                                               |
| -------------------- | ------------ | -------------------------------------------------- |
| card-editor          | 10.0.8       | fork-only feature package                          |
| lorebook-editor      | 10.0.1       | fork-only agent-only package                       |
| pokedex              | 10.0.1       | fork-only feature package                          |
| modern-life-sim      | 10.0.3       | source recovered into `src/`; features 0.4.0–0.8.0 |
| hierarchical-maps    | 10.2.0       | Movement Assessment, ko locale, parallel artwork   |
| character-tracker    | 10.0.1       | prompt: scene scan                                 |
| lorebook-keeper      | 10.0.1       | prompt: description backfill                       |
| long-term-memory     | 10.4.0       | compact control sizing                             |
| noodle               | 10.1.0       | connection sampling in image-prompt rewrite        |
| slurp2               | 10.2.0       | connection sampling in image rewrite and schedules |
| memory-nag           | 10.0.1       | comment only                                       |
| relationship-tracker | 10.1.0       | phone strip tile hidden; phone window header       |

All other packages differ only by version, CHANGELOG and Dakraid links in builders.

### Repository links point to Dakraid

- **What/why:** the fork publishes its own catalog. Artifact, artwork, documentation and issue URLs point to `Dakraid/Marinara-Agents` and `Dakraid/Marinara-Engine`; otherwise Engine downloads upstream ZIPs that do not match fork hashes.
- **Files:** `scripts/build-agent-catalog.mjs`, `build-feature-packages.mjs`, `build-{beholder,gacha-forge,modern-life-sim,pixelforge,quartermaster,relationship-tracker}-package.mjs`, `build-ruleset-packages.mjs`, `catalog-artwork.mjs`, `scripts/validate-catalog.mjs` (`expectedArtifactUrl`), `scripts/test-owner-approval.mjs`, `schemas/package-{manifest,localization}.schema.json` (`$id`), `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `sources/engine/packages/server/src/utils/openrouter-attribution.ts`, `packages/slurp2/.../SlpStateKit.tsx` (`BUG_REPORT_URL`), noodle comment references. Generated: `catalog/**`.
- **Keep on conflict:** the Dakraid host in every URL; take upstream's surrounding logic, then re-apply the host. Change sources and rebuild; `2fc562c3b` reverted hand-edited bundles because hashes broke.
- **Pinned by:** `scripts/validate-catalog.mjs`, `scripts/test-owner-approval.mjs`.
- **Commits:** 539d358ad, e27c627c1, 2fc562c3b, 746ae6ea0.

### Catalog totals

- **What:** 44 = 27 agents + 17 features + 0 rulesets in `catalog/catalog.json`, `v2` and `v3` (upstream 41 = 26 + 15). Preview overlay: 3 staging-only packages (blackjack, modern-life-sim, ruleset-5e-2014).
- **Files:** totals in `scripts/validate-catalog.mjs`, `expectedCategories` (`card-editor` = writer), README intro counts.
- **Keep on conflict:** upstream's total + 3 (card-editor, pokedex, lorebook-editor).
- **Note:** a catalog artifact block must match the manifest version, or Engine returns 500 on `/api/capability-packages/catalog` (`746ae6ea0`). Builders need `zip` (fallback `/tmp/marinara-merge-recovery/bin` on `PATH`).

### Fork capability track

- **What/why:** fork-only Engine features use `forkCapabilityApi` (`{ major: 10, minor: 0 }`) in the manifest, separate from `capabilityApi`, which keeps upstream's meaning. `schemas/package-manifest.schema.json` allows the key; `scripts/build-feature-packages.mjs` emits a feature's `forkCapabilityApi`.
- **Keep on conflict:** never raise `capabilityApi` past upstream's numbers for a fork feature; declare `forkCapabilityApi` instead.

### Vendored Engine sources (`sources/engine/**`)

- **What/why:** mirrors the Engine fork's `packages/shared/dist` (155 files) plus 61 compat files; ESM markers `sources/package.json` and `sources/engine/packages/shared/package.json` (without them tsx CJS-transforms the dist and named imports break); synced `REQUEST_TIMEOUTS` and the spatial `travel` column; the `about-me-keeper` id renamed so the About Me marker never reaches a bundle.
- **Files:** `sources/engine/packages/shared/dist/**`, `sources/engine/packages/server/src/db/schema/spatial-context.ts`, `sources/package.json`, `sources/engine/packages/shared/package.json`, `scripts/vendored-engine-baseline.json`.
- **Keep on conflict:** ours as the base; regenerate the baseline with `MARINARA_ENGINE_ROOT=<engine fork> node scripts/validate-vendored-engine.mjs`, never union hashes by hand. Leave `sources/host-*-overlay/**` to upstream.
- **Pinned by:** `scripts/tests/vendored-engine.regression.mjs`, `tests/map-location-limit.regression.ts` (vendored `maxLocations` 5000), the lifecycle lanes.
- **Commits:** 082464cf0, 386ca9d79, 82ca87cb3, df8558970.

### Root, docs and tooling

- `AGENTS.md`: keep the fork sections ("Fork Workflow", "Upstream merge", "Rebuild & validation shortcuts"); union upstream edits elsewhere.
- `README.md`: Dakraid links, catalog counts, Card Editor / Pokédex / Lorebook Editor rows. Union by hand, then Prettier.
- `scripts/catalog-package-guidance.mjs` and `documentationAnchors` in `scripts/build-agent-catalog.mjs`: fork entries for card-editor, lorebook-editor, pokedex. Union.
- `artwork/agent-covers/{card-editor,lorebook-editor,pokedex}.png`, `artwork/sources/pokedex-imagegen.*`, `art-direction.json` entries: fork-only. Union.
- `.codegraph/.gitignore`, `.pi/**`: fork-only. Keep.
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`: came in via merge `5b819d477`, absent upstream (upstream uses `package-lock.json`). _(inferred)_ a stray pnpm artifact; keep until decided.
- `.github/**`, `package.json`, `eslint.config.mjs`: no fork deltas; take upstream.

---

## 1. card-editor (fork-only feature, 10.0.4)

- **What/why:** character-card rewrite agent grown into a feature package: bulk dispatch, session runner, verdict review, overlay workspace, duplicate-applied action, bulk settings, connection-limited concurrency, combined/duplicate save modes, Fix JSON dialog, schema transforms, splits and lineage, Phase 2, avatar studio, icon-only selection action (`iconOnly` prop). Declares `capabilityApi` 1.66 (upstream track) and `forkCapabilityApi` 10.0 (the Engine fork's own track for these features); upstream Engines refuse the manifest key. Engine ≥ 2.4.7.
- **Files:** `packages/card-editor/src/engine/packages/{client/src/features,server/src/services,shared/src/features/agents}/card-editor/**`, `agents.json`, `engine-boundary.json`, `locales/en.json`, `CHANGELOG.md`, `manifest.json`. Builder hooks in `scripts/build-feature-packages.mjs`: `cardEditorSourceRoot`, `cardEditorOwnedSourcePaths`, the `fromVendoredEngine` exclusions, the `features[]` entry, `cardEditorBoundary`, the generic `agentsSource` branch. Generated: `client.js`, `server.mjs`, zips, catalog entries.
- **Keep on conflict:** the package is ours; fold upstream builder changes around the hooks. Re-stamp `engine-boundary.json` only when the Engine-fork commit moved. `duplicate-applied` must be in `client.js`. Tests match escaped bundle text.
- **Pinned by:** `tests/card-editor-routing.regression.mjs` (version 10.0.4, capabilityApi 1.66, forkCapabilityApi 10.0, builtAgainst, contributions), `card-editor-{bulk,runner,transform,prompt-presets,dialog-ui,panel-ui}.regression.mjs`.
- **Commits:** 531720710 … 9222ee161 (about 35).

## 2. pokedex (fork-only feature, 10.0.1)

- **What/why:** Pokédex Scanner & Tracker, a post-processing pipeline agent with in-chat cards and a tracker-panel collection. Capability API 1.66, Engine ≥ 2.4.6. No `agentDetail` contribution (Engine rejects it for pipeline agents).
- **Files:** `packages/pokedex/src/engine/**`, `agents.json`, `engine-boundary.json`, `locales/en.json`, `manifest.json`, `CHANGELOG.md`; builder `features[]` entry, `pokedexSourceRoot`, `pokedexOwnedSourcePaths`, `pokedexBoundary`; artwork.
- **Keep on conflict:** all ours; `contributions: { slots: [...] }` only.
- **Pinned by:** only `validate-catalog` and `test-catalog-lanes`. No dedicated test; a merge can break it silently.
- **Commits:** ed25f5b56, 7ce6b948c, 6d17f12c3, 96cd43765, fc90a72d2, 4167c5176.

## 3. lorebook-editor (fork-only agent-only, 10.0.1)

- **What/why:** rewrites lorebook entries from a directive; "Backfill descriptions" preset fills empty descriptions only.
- **Files:** `packages/lorebook-editor/{agents.json,manifest.json,locales/en.json,CHANGELOG.md}`, `documentationAnchors`, guidance, README row, artwork.
- **Pinned by:** `tests/lorebook-editor-routing.regression.mjs`.
- **Commits:** 3953d8c9d, 45c276dba.

## 4. modern-life-sim (10.0.1; upstream 0.3.2)

- **What/why:** upstream ships only minified bundles. The fork recovered readable source into `src/` (verified against the 0.3.2 bundles) and builds with esbuild. Fork features 0.4.0–0.8.0: per-life sampling and prefill, Engine lorebook world lore, shared jobs and incomes, attraction options, Adult module, parallel card reads, repeatable social actions, parallel paint queue sized by Max Parallel Image Jobs.
- **Files:** `packages/modern-life-sim/src/{client,server}/**`, `scripts/build-modern-life-sim-package.mjs` (`bundle()` via esbuild), `README.md`, `manifest.json`, `CHANGELOG.md`. Generated: `client.js`, `server.mjs`, zips.
- **Keep on conflict:** `src/` is canonical. Take ours for bundles, port upstream behavior changes into `src/` by hand (diff the de-minified upstream bundle against 0.3.2), rebuild. Keep esbuild bundling.
- **Pinned by:** `tests/modern-life-sim-{adult,cast-reading,family-romance,jobs-money,repeat-social,sampling,sex,world-lore}.regression.mjs` (import from `src/`).
- **Commits:** ff8c77da9, 05b453962, c725a557f, e0b54df81, 02e8aa778, 34ca6a091, e132a9d76, 9bc6cfd23, d81ea0a6f, cf56f66fa, a9878e55e, 62cc21e86, 98bcde5e8, 63c5a27d4.

## 5. hierarchical-maps / World Maps (10.2.0; upstream 1.7.1)

- **What/why:** Movement Assessment (detects implied moves, moves the pin, stores the route as `<prior_arrival>`; settings `assessImpliedMovement`, `assessmentDiscovery`, `assessmentPersistTravel`, all on); Korean locale; parallel artwork fill sized by `connection.maxParallelJobs`. Depends on the Engine fork's `travel` column and `SpatialAssessedTravel` schema.
- **Files:** `.../spatial-context/movement-assessment.ts`, `state-resolution.ts` (`exposePriorArrival`), `.../storage/spatial-context.storage.ts`, `.../routes/spatial-context.routes.ts`, `maps-shared/src/runtime-prompt.ts`, `SpatialContextSettingsSection.tsx`, `SpatialMapWorkspace.tsx`, `use-spatial-resources.ts`, `package-utils.ts`, `localization.tsx`, `locales/{en,ko}.json`, `agents.json`; builder `agent.defaultSettings` and the `hierarchical-maps:movement-assessment` service registration; `sources/engine/.../spatial-context.ts`.
- **Keep on conflict:** ours for these hunks. `state-resolution.ts` keeps the fork's `materializeAssistantSpatialStateInTransaction` extraction; port upstream edits of the old inline transaction into it (upstream 1.6.0's `routed` multi-step move check sits beside `assessedDestination`). The fork's historic `artifacts/hierarchical-maps-1.6.0.zip` predates the 10.x renumber and collides with upstream's 1.6.0 artifact by name: keep ours. The CHANGELOG keeps the fork's own 1.6.0/1.5.2 history; upstream's same-numbered headings are folded into the fork top entry instead.
- **Pinned by:** `tests/hierarchical-maps-lifecycle.regression.ts` (plain `npx tsx`), `world-maps-ui-contract.regression.mjs`, `map-location-limit.regression.ts`, `map-canvas-geometry.regression.ts`, `shared-world-refresh.regression.ts`.
- **Commits:** 8d7134639, a6a85f1ce, 82ca87cb3, 4ab1daad9, 230fd7e35, 24a21b2b9, df8558970, 63c5a27d4, 153dd23e1, 5e8f6968c, af7cd9835.

## 6. character-tracker (10.0.1)

- **What/why:** the incremental prompt runs an explicit scene scan each run; departures go to `removed` with the exact tracked characterId; IDs are copied verbatim from `current_game_state` (Engine drops untracked IDs).
- **Files:** `packages/character-tracker/agents.json` (`defaultPromptTemplate`).
- **Keep on conflict:** the scene-scan block; re-apply upstream wording on top.
- **Pinned by:** `tests/inventory-tracker-contract.regression.mjs`.
- **Commit:** 50a92f814.

## 7. lorebook-keeper (10.0.1)

- **What/why:** optional `description`/`bookDescription` fill only empty descriptions (the Engine fork parser accepts them).
- **Files:** `packages/lorebook-keeper/agents.json`.
- **Pinned by:** `tests/lorebook-keeper-routing.regression.mjs`.
- **Commit:** 45c276dba.

## 8. long-term-memory (10.4.0)

- **What/why:** compact select uses fixed `h-9` (upstream: `min-h-9`); non-compact buttons get `minWidth: 2.75rem` (tap target). Upstream's `position: relative` in `compactInputStyle` and `revealFocusUnderStickyBar` are taken as-is.
- **Files:** `.../features/long-term-memory/shared-controls.tsx`.
- **Pinned by:** `tests/long-term-memory-lifecycle.regression.ts` (fork runner: browser and installation lanes in separate tsx processes; keep it). Upstream deleted this file in #1618 (its CI runs the lanes as separate jobs); the fork keeps it, so a modify/delete conflict resolves to ours.
- **Commit:** b1773ef3e (also deleted `tests/noodler-content-formats.regression.ts`; keep it deleted unless upstream revives it with new expectations).

## 9. noodle (10.1.0)

- **What/why:** the image-prompt rewrite honors stored connection sampling (`noodleSamplingOptions(resolveStoredChatOptions(...))`, `resolveStoredMaxTokens(…, 2048)`) instead of temperature 0.3; Dakraid issue links in comments.
- **Files:** `.../services/noodle/noodle-image-prompt-rewrite.ts`; comment-only: `noodle-image-prompt.ts`, `noodle-public-images.service.ts`, `prompt-overrides/registry/noodle.ts`.
- **Pinned by:** `tests/noodle-image-prompt-instructions.regression.ts`, `tests/noodle-public-only.regression.ts`.
- **Commits:** 7b167f6fa, c698ff2e2, efcd75ee7, 49da93f0c.

## 10. slurp2 (10.2.0)

- **What/why:** image-prompt rewrite and conversation-schedule generation honor stored connection sampling (`slpSamplingOptions(resolveStoredChatOptions(...))`); Dakraid bug-report URL; `SLURP2_VERSION` 10.1.0.
- **Files:** `.../slp/base/media/slp-image-prompt-rewrite.ts`, `.../slp/features/messages/slp-conversation-schedule-generation.ts`, `.../slp/modules/chrome/SlpStateKit.tsx`, `.../onboarding/slp-release.ts`.
- **Keep on conflict:** the sampling hunks; fold upstream release notes into a new fork top entry (next: `10.3.0`), never `0.3.x` at the top. In `SLURP2_RELEASES` the fork entry replaces upstream's entries (at most 3 bullets).
- **Known failure (pre-existing):** `slurp-phase1-durability`, `slurp2-reset-activity`, `slurp2-anchor-edits` and `slurp2-message-deep-details` copy Slurp source into the Engine fork, whose zod 4 does not apply nested `.default({})` values (`slp-tuning.ts` throws reading `curve`). They failed before the 2026-10-22 merge too.
- **Pinned by:** `tests/noodler-disclosure-contract.regression.ts`, `tests/noodler-fictional-prices.regression.ts`, `tests/noodler-generation-guidance-default.regression.ts` (fork-adapted copies; re-check against upstream's).
- **Commits:** 7b167f6fa, c698ff2e2, 7e59d1666, a3dc8fcdf.

## 11. memory-nag (10.0.1)

- Comment only in `.../services/memory-nag/scanner.ts`. Either side is fine. Commit 7b167f6fa.

## 12. conversation-calls (10.1.0)

- No source delta. `tests/conversation-calls-summary.regression.mjs` pins `10.1.0` and raises `unzip` `maxBuffer` to 64 MiB. Commit 339662d36.

## 13. gacha-forge (10.3.0)

- **What/why:** upstream ships pre-built bundles plus `bundle-patches.json` (hand edits since the last drop). The bundle's own version readout (`ds="1.8.15"`) and the newest client.js patch stay on the upstream release; only the manifest and CHANGELOG top move to 10.x.
- **Files:** `packages/gacha-forge/{manifest.json,CHANGELOG.md}`; bundles and `bundle-patches.json` are upstream's, take theirs.
- **Keep on conflict:** the 10.x manifest version and fork CHANGELOG entry on top, upstream entries below.
- **Pinned by:** `tests/gacha-forge-location-ids.regression.mjs` (fork-adapted: the readout and newest patch must equal the newest non-10.x CHANGELOG entry; the manifest must be 10.x and lead the CHANGELOG).

## 14. relationship-tracker (10.1.0; upstream 0.7.2)

- **What/why:** on phones the tracker-strip tile was a dead button (the strip has no drawer). `renderToolbar()` renders nothing when `mobileCompact` is true, and `hostProvidesHeader()` also matches `[data-mobile-tracker-window]`, the Engine fork's movable phone tracker window.
- **Files:** `packages/relationship-tracker/client.js` (hand-written source, not a bundle), `manifest.json`, `CHANGELOG.md`.
- **Keep on conflict:** the two hunks above; take upstream's other `client.js` and `*.mjs` changes.
- **Pinned by:** nothing dedicated. Commit 8c191d9cc.

---

## Fork-owned tests

- **New:** `card-editor-{bulk,dialog-ui,panel-ui,prompt-presets,routing,runner,transform}.regression.mjs`, `lorebook-editor-routing.regression.mjs`, `modern-life-sim-{adult,cast-reading,family-romance,jobs-money,repeat-social,sampling,sex,world-lore}.regression.mjs`.
- **Changed (keep ours, union upstream additions):** `conversation-calls-summary`, `gacha-forge-location-ids`, `hierarchical-maps-lifecycle`, `inventory-tracker-contract`, `long-term-memory-lifecycle`, `lorebook-keeper-routing`, `map-canvas-geometry`, `map-location-limit`, `noodle-image-prompt-instructions`, `noodle-public-only`, `noodler-disclosure-contract`, `noodler-fictional-prices`, `noodler-generation-guidance-default`, `shared-world-refresh`, `world-maps-ui-contract`.
- **Deleted:** `noodler-content-formats.regression.ts`.
- **Version pins to bump with manifests:** `card-editor-routing`; `lorebook-editor-routing`, `lorebook-keeper-routing` (10.0.1); `conversation-calls-summary` (10.1.0).
