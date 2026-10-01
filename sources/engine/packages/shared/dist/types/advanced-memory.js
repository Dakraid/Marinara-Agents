import { z } from "zod";
/** Distinguishes explicit scene participants from legacy visibility-based assignments. */
export const ADVANCED_MEMORY_SCENE_AUDIENCE = { id: "scene-audience", revision: "participants-v1" };
export const advancedMemorySettingsSchema = z.object({
    enabled: z.boolean().default(false),
    maxContextTokens: z.number().int().min(1024).max(10_000_000).default(65_000),
    summaryBudgetTokens: z.number().int().min(64).max(131_072).default(4096),
    helperConnectionId: z.string().nullable().default(null),
    decisionEnabled: z.boolean().default(false),
    decisionConnectionId: z.string().nullable().default(null),
    initialProcessingModel: z.enum(["main", "helper"]).default("helper"),
    /** Cadence and recent-message window for standalone post-generation scene checks. */
    sceneCheckInterval: z.number().int().min(1).max(100).default(5),
    retrieveMaxScenes: z.number().int().min(0).max(50).default(3),
    retrieveMinMessages: z.number().int().min(0).max(50).default(3),
    retrieveMaxMessages: z.number().int().min(0).max(50).default(10),
    narratorCharacterId: z.string().nullable().default(null),
    /** A null value explicitly confirms knowledge from the beginning. Missing means unconfirmed. */
    knowledgeStarts: z.record(z.string().nullable()).default({}),
    knowledgeConfirmed: z.boolean().default(false),
});
export const DEFAULT_ADVANCED_MEMORY_SETTINGS = advancedMemorySettingsSchema.parse({});
export function normalizeAdvancedMemorySettings(value) {
    const parsed = advancedMemorySettingsSchema.safeParse(value ?? {});
    return parsed.success ? parsed.data : { ...DEFAULT_ADVANCED_MEMORY_SETTINGS, knowledgeStarts: {} };
}
/** Compact, saved evidence from actual memory decisions, never a new preview call. */
export const advancedMemoryDecisionDiagnosticsSchema = z.object({
    createdAt: z.string(),
    model: z.string().nullable(),
    sourceEndMessageId: z.string().nullable(),
    fallback: z.boolean(),
    threshold: z.number().min(0).max(1),
    omittedCount: z.number().int().nonnegative(),
    results: z
        .array(z.object({
        id: z.string(),
        kind: z.enum(["scene", "excerpt", "message", "scene_end"]),
        text: z.string().max(160),
        score: z.number().min(0).max(1).optional(),
        binary: z.boolean().optional(),
        selected: z.boolean(),
    }))
        .max(128),
});
//# sourceMappingURL=advanced-memory.js.map