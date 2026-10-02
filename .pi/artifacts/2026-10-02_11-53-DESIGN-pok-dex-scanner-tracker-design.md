# DESIGN — Pokédex Scanner & Tracker (package `pokedex`)

## Approved visual source
The user-supplied template + screenshot (`Screenshot_20261002_112604.png`, Braixen card) are the approved look. Implement them 1:1; do not restyle.

## In-chat scan card
- Container: full width, 8px radius, 2px border `#232328`, centered, consolas, 8px padding, `background-image:url(https://files.catbox.moe/xu0jxk.png)`.
- Artwork: official art `…/pokedex/full/{NNN}.png`, width 50%, alt = species name.
- Title: bold 20px white — `{NAME} #{NUMBER}`.
- Sections as pre-like blocks: `### GENERAL ###` / `### SEXUAL ###` (labels and quoted values per template), then the Ruby-styled Affection/Heat block (❤️/💔 and 🔥 glyph ratings with state in parens, `↳` sub-lines for cause/advice), `<hr>`, italic-style quoted 5-20 word trainer review, ★ rating + `(SMASH)`/`(PASS)`.
- All model text HTML-escaped; only package-generated markup.

## Tracker panel (engine chrome style)
- Follow memory-nag panel conventions: `mari-chrome-*` controls, scoped `.pd-` styles, dark theme.
- Three sections mirroring the template: **ACTIVE HAREM** (tree-style rows: relationship / affection hearts / last interaction / status), **PREGNANCY STATUS** (per pregnancy: eggs, time since breeding, laying expected, sire; empty state *No current pregnancies*), **RECENT ENCOUNTERS** (species, outcome, when).
- Below: **Pokédex collection** — responsive card grid; each card mirrors the in-chat card (same data, React twin). Correction actions behind a confirm: remove from harem, mark laid, delete entry.
- Toolbar button (roleplay-tracker slot): `Pokédex` label + scanned-count badge; brief highlight pulse when `latestScan` changes.

## States & accessibility
- Loading / empty (no scans yet → friendly empty state) / error (retry button, memory-nag error boundary pattern).
- All interactive elements keyboard-focusable with visible focus; buttons have aria-labels; panel sections use headings; respects engine localization catalog (en shipped, structure ready for more).

## Settings (chat-settings slot)
Four controls: Auto-scan new Pokémon (default on), Inject tracker context (default on), Render scan cards in chat (default on), Recent encounters kept (number 3-25, default 10).
