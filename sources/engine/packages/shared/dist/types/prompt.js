// ──────────────────────────────────────────────
// Prompt System Types
// ──────────────────────────────────────────────
export const MARINARA_UNIVERSAL_PRESET_NAME = "Marinara's Universal Preset";
export const MARINARA_UNIVERSAL_PRESET_AUTHOR = "Marinara";
export const MARINARA_UNIVERSAL_PRESET_SYSTEM_KEY = "marinara-universal-preset";
export function isStockMarinaraUniversalPreset(preset) {
    return preset.systemKey === MARINARA_UNIVERSAL_PRESET_SYSTEM_KEY;
}
export const GENERATION_PARAMETER_SEND_KEYS = [
    "temperature",
    "maxTokens",
    "topP",
    "topK",
    "frequencyPenalty",
    "presencePenalty",
    "reasoningEffort",
    "verbosity",
];
export const CUSTOM_GENERATION_PARAMETERS_SETTINGS_KEY = "custom-generation-parameters";
/** Well-known built-in marker identifiers (match ST). */
export const BUILTIN_MARKERS = {
    MAIN: "main",
    NSFW: "nsfw",
    JAILBREAK: "jailbreak",
    ENHANCE_DEFINITIONS: "enhanceDefinitions",
    CHAR_DESCRIPTION: "charDescription",
    CHAR_PERSONALITY: "charPersonality",
    SCENARIO: "scenario",
    PERSONA_DESCRIPTION: "personaDescription",
    DIALOGUE_EXAMPLES: "dialogueExamples",
    CHAT_HISTORY: "chatHistory",
    WORLD_INFO_BEFORE: "worldInfoBefore",
    WORLD_INFO_AFTER: "worldInfoAfter",
};
//# sourceMappingURL=prompt.js.map