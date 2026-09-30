# NOTE — Follow-ups handed to maintainer (2026-09-30 session)

## 1. gacha-forge parameter cleanup (OUT OF REPO — action needed in gacha-forge source repo)
`packages/gacha-forge/server.mjs` (generated bundle, minified, ~lines 197-217) contains ~23 hard-coded temperatures — `.9`×8, `.8`×6, `.85`×2, `.5`, `.4`×4, `.95`, `.3` — each with per-call `maxTokens`, across scenario/banner/unit/card/CG/narration/image-prompt generation. Apply the same connection-wins-with-package-fallback merge in the gacha-forge SOURCE repo (pattern: `resolveSamplingWithFallback(stored, { temperature: <literal>, ... })` or the local equivalent; connection's explicitly-stored params win, literals become fallbacks), then rebuild the bundle via `scripts/build-gacha-forge-package.mjs` in Marinara-Agents. beholder + pixelforge verified clean (no LLM calls in-bundle).

## 2. Placeholder cover art — USER must supply final art
- `artwork/agent-covers/card-editor.png` — currently a copy of card-evolution-auditor.png
- `artwork/agent-covers/lorebook-editor.png` — currently a copy of lorebook-keeper.png
Both are real 512×512 PNGs so catalog validation passes, but they are placeholders. After replacing the PNGs, rebuild the two packages (`node scripts/build-agent-catalog.mjs card-editor` / `lorebook-editor`) so hashes/sizes refresh.

## 3. Live manual verification pending (needs the docker image)
- Real LLM run of Card Editor + Lorebook Editor via the new editor surfaces (UI verified with stubbed responses; route returns 400 until packages are installed).
- CYOA permanent regenerate button on an older assistant message (silent swipe-extra update is intended behavior, documented in code comments).

## 4. Environment quirk (not a code issue)
`~/.bun/bin/prettier` is a broken shim that makes `npm run check` report phantom format warnings when node_modules is absent. With the repo-pinned toolchain (`npm ci` → prettier 3.9.6 / eslint 10.10.0) the gate is clean (0 errors). `.ts` regression tests in Marinara-Agents need `./node_modules/.bin/tsx`, not bare `node`.
