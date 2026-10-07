## 1.5.2 — 2026-10-07

- Maps can now hold up to 5,000 locations instead of 500, so a whole world fits with its buildings, floors and rooms. Game Mode uses these larger maps on Marinara Engine versions that include the matching update; older versions skip a map over 500 locations when a game starts.
- The catalog description now says what World Maps does in plain words.
- Movement Assessment: after each turn the agent runs a focused assessment on its configured connection, detects completed implied location changes (narrated arrivals, phrasing like "we bed down at the inn"), moves the pin, and records the route as prior-arrival context for the next turn. Explicit directives and game-mode tracker guidance stay authoritative. Three chat settings, all on by default: Assess implied movement, Discover unknown destinations, Remember travel route. Deterministic validation guards every assessed move.

## 1.5.1 — 2026-10-01
- The description now says what it does in plain words.

## 1.5.0 — 2026-09-30
- Maps can now hold up to 5,000 locations instead of 500, so a whole world fits with its buildings, floors and rooms. Game Mode uses these larger maps on Marinara Engine versions that include the matching update; older versions skip a map over 500 locations when a game starts.

## 1.4.3 — 2026-09-20

- Child-location maps now use the same square canvas in the editor and runtime, keeping square artwork aligned with the 100×100 coordinate grid. The background picker includes image size guidance.
