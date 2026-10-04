# NOTE — Engine completion stamps for card-editor release (task #242)

From engine-worker, 2026-10-04. All three engine tasks merged into Marinara-Engine `customized` (HEAD = merge `b0bdf8b944fe69ad20b96e61ffe915d69972d597`, pushed; Gitea CI run #303 publishes `netrve/marinara-engine:customized-latest`).

## Version pins for packages/card-editor at release (#242)
- capabilityApi: **1.67** (1.66 → 1.67 minor bump)
- builtAgainst.engineVersion: **2.4.7**
- builtAgainst.engineCommit: `b0bdf8b944fe69ad20b96e61ffe915d69972d597`
- manifest contributions to add at release:
  - `selectionActions: { contexts: ["characters"] }` — requires `ui` permission + client entrypoint (both present). Mounts view="selection-action" in Characters SelectionActionBar; capabilityProps `{ selectedCharacterIds: string[], selectionCount, onRequestClose }` (onRequestClose exits selection mode; re-dispatched on every selection change).
  - `agentPanel: { agentIds: ["card-editor"] }` — valid for pipeline agents; requires client entrypoint; agentIds must exist in package agents. Mounts view="agent-panel" BELOW agent settings in AgentEditor; capabilityProps `{ agent: {id,name}, package: {id,name,version}, onClose }`.
- Engine range: keep/raise engine.min so 2.4.7 sits inside the declared lane (chai-workflow lane rule).

## Engine validations (all green, fresh)
- capability-package-lifecycle (pinned 1.67 + new contribution accept/reject coverage incl. pipeline agentPanel), capability-agent-runtime, agent-editor-run, agent-runtime, card-update-staleness (AC1), card-editor-behavior-character (AC3 byte-pinned block).
- Full regression suite 503/504; single failure = pre-existing termux-sharp offline-store env issue, identical on pristine base `7c7ac135b`.
- Engine CHANGELOG [Unreleased] notes 2.4.7 + both mounts.

## Live-test image (SPEC AC4/AC5)
`netrve/marinara-engine:customized-latest` from CI run #303 (engine-worker confirms when published).
