import { z } from "zod";
export const semanticSummaryRetrievalSettingsSchema = z.object({
    semanticSummaryRecentCount: z.number().int().min(0).max(20).default(2),
    semanticSummaryOlderCount: z.number().int().min(0).max(20).default(3),
    semanticSummaryMinSimilarity: z.number().min(0).max(1).default(0.15),
});
export const DEFAULT_SEMANTIC_SUMMARY_RETRIEVAL_SETTINGS = semanticSummaryRetrievalSettingsSchema.parse({});
export function normalizeSemanticSummaryRetrievalSettings(value) {
    const result = semanticSummaryRetrievalSettingsSchema.safeParse(value ?? {});
    return result.success ? result.data : { ...DEFAULT_SEMANTIC_SUMMARY_RETRIEVAL_SETTINGS };
}
//# sourceMappingURL=semantic-summary-retrieval.js.map