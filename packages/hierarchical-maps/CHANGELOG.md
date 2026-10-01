## 1.5.0 — 2026-10-01

- New Movement Assessment: after each turn the agent runs its own focused assessment on its configured connection, detects completed implied location changes (narrated arrivals, phrasing like “we bed down at the inn”), moves the pin, and records the route as prior-arrival context for the next turn. Explicit directives and game-mode tracker guidance stay authoritative.
- Three new chat settings, all on by default: Assess implied movement, Discover unknown destinations, Remember travel route.
- Deterministic validation guards every assessed move: known destinations must be active and reachable (narrated intermediate stops honored when valid), discovery reuses directive-path semantics.

## 1.4.3 — 2026-09-20

- Child-location maps now use the same square canvas in the editor and runtime, keeping square artwork aligned with the 100×100 coordinate grid. The background picker includes image size guidance.
