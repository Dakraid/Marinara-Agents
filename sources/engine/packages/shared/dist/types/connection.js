// ──────────────────────────────────────────────
// API Connection Types
// ──────────────────────────────────────────────
/**
 * `custom` is a System One server; `openai_compatible` is an ordinary chat model on a
 * server the user already runs (Ollama, LM Studio, llama.cpp), asked for one yes/no
 * token and read from its log-probabilities, the way the local slots are.
 */
export const DECISION_SOURCES = ["typesafe", "openrouter", "custom", "openai_compatible"];
export const DECISION_SOURCE_BASE_URLS = {
    typesafe: "https://api.typesafe.ai",
    openrouter: "https://openrouter.ai/api",
    custom: "",
    openai_compatible: "",
};
/** Sources whose base URL the user enters, rather than a fixed hosted one. */
export function decisionSourceTakesUrl(source) {
    return source === "custom" || source === "openai_compatible";
}
export function defaultDecisionStateTokens(source) {
    return decisionSourceTakesUrl(source) ? 3500 : 30000;
}
/** Audio backends an audio connection can target (the former TTS sources). */
export const AUDIO_GENERATION_SOURCES = ["openai", "elevenlabs", "pockettts", "xai"];
export const IMAGE_GENERATION_QUALITIES = ["auto", "low", "medium", "high", "xhigh", "max"];
//# sourceMappingURL=connection.js.map