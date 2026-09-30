# ARCH: Chat-less Editor Agent Runs + Permanent CYOA Regenerate

Scope: Marinara-Engine. Two features. Full plan with file:line citations below; this artifact is the durable copy of the response delivered 2026-09-30.

## Feature 1 — Chat-less editor surface (card-editor / lorebook-editor)

Decision: dedicated route `POST /api/agents/editor-run` in agents.routes.ts (mounted at /api/agents, routes/index.ts:107) that REUSES executeAgent (agent-executor.ts:793) with a synthetic AgentContext (shared/types/agent.ts:349) — not the retry route, not a from-scratch runner, not a hidden chat. Review UX: dedicated per-page proposal panels (not the chat-bound modals). Run buttons: CharacterEditor.tsx + LorebookEditor.tsx. Defaults: card-editor consumes character-linked lorebooks; lorebook-editor consumes no cards unless picked.

## Feature 2 — Permanent CYOA regenerate in message actions

New optional props on ConversationMessageActions (ConversationMessageActions.tsx:29-62), Dices button after the RefreshCw regenerate block (:121-128), shared hook useCyoaReroll used by both the new button and CyoaChoices.handleReroll (CyoaChoices.tsx:211-224). Any assistant message via forMessageId (retry-agents-route.ts:4401; use-generate.ts:3618, option forwarded ~:3690).

See chat response for the full file-by-file plan, request/response shapes, and risk list.
