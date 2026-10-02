# NOTE — Pokédex agent JSON envelope: `"text":""` required

Found while verifying the server worker's output against the engine executor (2026-10-02).

## Finding
`agent-executor.ts` (`parseAgentResponse`): for any agent with `defaultSettings.resultType: "context_injection"` **and** `jsonContextOutput: true`, the parsed JSON object MUST contain a string `text` field, otherwise the executor drops the whole parse into the fallback `{ raw, parseError: true }` shape. All other JSON fields are preserved verbatim in `result.data`.

## Consequence for `pokedex`
- The scanner's output contract is the ARCH delta JSON **plus** `"text": ""` (always empty). Empty text is never injected: injections are only collected from pre-generation results (`agent-pipeline.ts` runPreGenerationAgents), and empty strings are dropped even there. Post-processing `context_injection` results are consumed only by capability hooks, SSE, and run persistence.
- `finalizeResult`'s `parseDelta` already handles both shapes: it reads `newScans` et al. directly when present, and falls back to `parseJsonish(data.text ?? data.raw)` otherwise.
- Prompt template in `scripts/build-feature-packages.mjs` updated to emit `"text":""` and to say the agent never injects prompt text directly (tracker context injection is the prompt-context contributor's job).

## Contract cross-check (engine teammate confirmed 2026-10-02)
- E1 lands as capabilityApi **1.66**; `data.appendText` non-empty string, `editNeeded:false` suppresses, `changes` optional; applied after the rewrite loop settles, append-only, one combined `text_rewrite` SSE. Manual retry-agents route does NOT apply appends in E1 (graceful degradation covers: state applies, no card).
- `customAgentCanApplyResult(..., "edit_messages")` passes for installed package agents (they join BUILT_IN_AGENTS via `refreshCapabilityAgentRegistry`).
- `engine-boundary.json` stays at capabilityApi 1.14 / engine 2.4.4 until E1's completion response arrives with the lane commit hash; then bump capabilityApi→1.66, builtAgainst, and feature `minEngineVersion` together.

## Template fidelity fixes applied to `card-html.ts`
Gender line renders the word + symbol (`Female ♀`) per template; SEXUAL block label is `Evolution:`; Height/Weight render unquoted (`Height: 0.6 m`). Tracker-context harem lines keep the bare gender symbol per the tracker template.
