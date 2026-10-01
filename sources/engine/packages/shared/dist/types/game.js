export const GAME_SPATIAL_MAP_DRAFT_PRESET_TARGETS = {
    small: 8,
    medium: 16,
    large: 28,
};
/** Keep the exact target authoritative while preserving the matching draft-size bucket. */
export function resolveGameSpatialMapDraftOptions(size, targetLocationCount) {
    const target = targetLocationCount ?? GAME_SPATIAL_MAP_DRAFT_PRESET_TARGETS[size ?? "medium"];
    return {
        size: target <= 8 ? "small" : target <= 16 ? "medium" : "large",
        targetLocationCount: target,
    };
}
/** Resolve the setup-time Illustrator prompt choice into the root chat-metadata value used at runtime. */
export function resolveGameImageDynamicPromptEnabled(config) {
    return config.enableSpriteGeneration === true && config.gameImageDynamicPromptEnabled === true;
}
/** Retain the new prompt choice when an older/imported setup omits it; other undefined fields still clear as before. */
export function mergeGameSetupConfigPreservingDynamicPrompt(stored, submitted) {
    const merged = { ...stored, ...submitted };
    if (submitted.gameImageDynamicPromptEnabled === undefined) {
        merged.gameImageDynamicPromptEnabled = stored.gameImageDynamicPromptEnabled;
    }
    return merged;
}
//# sourceMappingURL=game.js.map