# AGENTS.md

This file is a thin maintainer note for contributors using coding agents. Canonical workflow and validation guidance lives in `CONTRIBUTING.md`.

## Agent Workflow Overlay

- Follow `.github/agents/chai-workflow.md` as the repository's additive AI-agent workflow overlay for proof discipline, issue ownership, feature sizing, PR gates, and risky package work.
- The overlay does not replace this file, `CONTRIBUTING.md`, package manifests, or the maintainer's latest request.

## Ponytail Implementation Discipline

- Apply [Ponytail](https://github.com/DietrichGebert/ponytail) as an additive minimalism overlay after understanding the task and tracing the affected flow. It never overrides repository rules, validation requirements, or the maintainer's latest request.
- Before adding code, stop at the first option that works: skip unnecessary work, reuse an existing helper or pattern, use the standard library, use a native platform capability, use an already-installed dependency, choose a clear inline solution, then write the minimum new code.
- Prefer shared root-cause fixes after checking every caller, deletion over addition, boring over clever, and the fewest files. Avoid speculative abstractions, dependencies, and boilerplate.
- Never trade away trust-boundary validation, data-loss prevention, security, accessibility, real-hardware calibration, or explicitly requested behavior.
- Non-trivial logic must leave behind the smallest runnable regression proof. Trivial one-line and instruction-only changes do not need a dedicated test.
- Mark a deliberate shortcut with a `ponytail:` comment that names its known ceiling and the upgrade path.

## Preferred Workflow

- Start from `staging` and open an issue before implementation.
- Open a draft PR when issue work begins so ownership is visible, then mark it ready only after validation and self-review are complete.
- Run `npm run check` for the maintained-source Prettier and ESLint gates.
- Run `node scripts/test-catalog-lanes.mjs`, `node scripts/validate-package-locales.mjs`, `node scripts/validate-catalog.mjs`, and `node scripts/tests/catalog-release-notes.regression.mjs` as the baseline validation commands.
- A minor or major package version bump needs a `packages/<id>/CHANGELOG.md` entry for the new version; the build rejects one without it. See `CONTRIBUTING.md` § Release notes.
- Rebuild the affected package and catalog entry whenever source payloads, manifests, Engine snapshots, or generated bundles change.
- Treat each manifest's `engine.min` / `engine.maxExclusive` range as the catalog-lane source of truth. The builders route packages into `catalog/v*/catalog.json`; do not hand-place or copy entries between lanes.

## Upstream merge

- Fetch and merge `Pasta-Devs/main` directly; never merge stale local `main`, `origin/main`, or `staging` branches.
- Resolve generated outputs (`catalog/**`, `artifacts/*.zip`, and `packages/*/{client.js,server.mjs}`) to one side only, then rebuild from merged sources. Never hand-merge generated files. Take upstream-owned package conflicts from theirs; retain fork comment-only source patches and rebake them.
- For vendored Engine sources, use ours as the base, fold in upstream semantic swaps, and remove imports orphaned by the merge. Manually union build/validation scripts and `README.md`; keep upstream `.github/**`; accumulate historical ZIPs rather than deleting them.
- An ours-side catalog can hide newer upstream entries, as happened with Beholder and Gacha Forge. Regenerate each affected upstream package and restore any temporarily relaxed validator byte-for-byte afterward.
- For a same-version collision, union both feature lines and publish above upstream's latest version; World Maps became `1.5.2`. The newest `CHANGELOG.md` entry must match that version.
- Builders require `zip`. If the system binary is absent, the recovered Info-ZIP is `/tmp/marinara-merge-recovery/bin/zip`; prepend `/tmp/marinara-merge-recovery/bin` to `PATH`.
- After merging, inspect manifest versions, confirm catalog totals (`42 = 25 agents + 17 features` for the 2026-10-07 merge), and require `grep -c "duplicate-applied" packages/card-editor/client.js` to return more than zero.
- Upstream packages may require newer shared Engine exports. World Maps lifecycle tests expect Engine 2.5.0's `CODEX_IMAGE_MODEL`; syncing the Engine fork is separate work, so those regressions may legitimately fail against an older fork.

## Rebuild & validation shortcuts

See [Building Packages](CONTRIBUTING.md#building-packages), [Release notes](CONTRIBUTING.md#release-notes), and [Validation](CONTRIBUTING.md#validation) for the canonical workflow and rationale.

- Agent-only package versions come from `packages/<id>/manifest.json`. Run `node scripts/build-agent-catalog.mjs <id>` to regenerate manifest hashes/bytes, the canonical `en` locale, catalog lanes, and release-note sidecars.
- Feature package versions come from their definitions in `scripts/build-feature-packages.mjs`. Run `node scripts/build-feature-packages.mjs <id>`. Re-stamp `packages/card-editor/engine-boundary.json` only when its Engine commit moved; never rebuild Card Editor or Pokédex merely to refresh them during a merge.
- Run the full gate in order: `npm run check` → `node scripts/test-catalog-lanes.mjs` → `node scripts/validate-package-locales.mjs` → `node scripts/validate-catalog.mjs` → `node scripts/tests/catalog-release-notes.regression.mjs` → affected `tests/*.regression.mjs`. Run `.mjs` tests with `node`; run `.ts` tests with `pnpm exec tsx --tsconfig tests/tsconfig.regressions.json tests/<name>.ts`.
- A package's newest `CHANGELOG.md` entry must equal its published version or the builder rejects it; keep at most 20 entries and 1,000 characters per entry. Routing regressions pin `manifest.version` and, for Card Editor, `builtAgainst`; update those pins only for intentional version or Engine-boundary moves.
- Bundle-escaped text is what regression markers must match, not the source: the built `client.js` escapes non-ASCII (an em dash becomes `\u2014`), so pin marker strings with the escaped form. Prefer ASCII-only markers where possible.
- A feature-package release touches three version pins together: the package `manifest.json`, the version map inside `scripts/build-feature-packages.mjs`, and the version asserted in the package's routing regression. The builder gate only checks the first — the other two are caught by the regression, so run it before declaring a release done.

## Repository-Specific Cautions

- Keep edits non-destructive and preserve unrelated work in dirty worktrees.
- Treat `packages/**/client.js`, `packages/**/server.mjs`, `artifacts/*.zip`, `catalog/catalog.json`, `catalog/v*/catalog.json`, file hashes, checksums, and catalog sizes as generated outputs. Change their source or build scripts, then rebuild them; do not hand-edit generated bundles, catalogs, or hashes.
- Every downloadable package must be listed in the README's official catalog, have a compatible manifest, and pass archive/hash validation.
- About Me is a core Conversation feature and must never be published as an Agent package.
- Keep compatibility metadata aligned with the current minimum Marinara Engine version.
- Changes to package permissions, archive handling, install/update behavior, executable client/server code, or Engine snapshots are security-sensitive and require explicit validation notes.

## AI-Generated Pull Requests

- Never auto-check validation or test-plan checkboxes. They are a human verification list, not proof.
- Explain why the package or repository change is needed, not only which files changed.
- Link the issue, target `staging`, leave drafts unreviewed by CodeRabbit until they are marked ready, and address actionable review feedback before merge.
- Required checks and CodeRabbit must complete before every `staging` merge. PRs from active Pasta-Devs organization members and owners do not require another human approval; outside and first-time contributors require an approving review from `SpicyMarinara`. Organization members with repository merge permission may merge internal PRs after those gates pass.
- Only `SpicyMarinara` may promote this repository's `staging` branch into `main`.
