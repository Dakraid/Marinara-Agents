// ──────────────────────────────────────────────
// Regex Script Zod Schemas
// ──────────────────────────────────────────────
import { z } from "zod";
import { isPatternSafe } from "../utils/regex-safety.js";
export const regexPlacementSchema = z.enum(["ai_output", "user_input"]);
export const regexApplyModeSchema = z.enum(["prompt", "display", "both"]);
function hasValidRegexFlags(flags) {
    try {
        new RegExp("", flags);
        return true;
    }
    catch {
        return false;
    }
}
function validateDepthRange(data, ctx) {
    if (data.minDepth != null && data.maxDepth != null && data.minDepth > data.maxDepth) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxDepth"],
            message: "Maximum depth must be greater than or equal to minimum depth.",
        });
    }
}
const regexScriptShape = z.object({
    name: z.string().min(1).max(200),
    enabled: z.boolean().default(true),
    findRegex: z.string().min(1),
    replaceString: z.string().default(""),
    trimStrings: z.array(z.string()).default([]),
    placement: z.array(regexPlacementSchema).min(1),
    flags: z.string().default("gi").refine(hasValidRegexFlags, "Invalid or duplicated regex flags."),
    promptOnly: z.boolean().default(false),
    applyMode: regexApplyModeSchema.optional(),
    targetCharacterIds: z.array(z.string().min(1)).default([]),
    targetPromptPresetIds: z.array(z.string().min(1)).default([]),
    order: z.number().int().optional(),
    minDepth: z.number().int().nullable().default(null),
    maxDepth: z.number().int().nullable().default(null),
});
function validatePatternSafety(data, ctx) {
    if (data.findRegex !== undefined &&
        // Macros like {{char}}/{{user}} are resolved before the pattern is compiled
        // at apply-time; strip them here so the static check doesn't read the macro
        // braces as a malformed `{n,m}` quantifier and reject a legitimate pattern.
        !isPatternSafe(data.findRegex.replace(/\{\{[^}]*\}\}/g, "x"))) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["findRegex"],
            message: "Regex pattern is unsafe: it may cause catastrophic backtracking. Avoid nested quantifiers and overly long patterns.",
        });
    }
}
function validatePatternSyntax(data, ctx) {
    if (data.findRegex === undefined)
        return;
    try {
        new RegExp(data.findRegex.replace(/\{\{[^}]*\}\}/g, "x"), data.flags ?? "gi");
    }
    catch {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["findRegex"],
            message: "Invalid regex pattern.",
        });
    }
}
function validateImportedRegexScript(data, ctx) {
    validateDepthRange(data, ctx);
    validatePatternSyntax(data, ctx);
}
function validateEditableRegexScript(data, ctx) {
    validateDepthRange(data, ctx);
    validatePatternSafety(data, ctx);
}
export const createRegexScriptSchema = regexScriptShape.superRefine(validateEditableRegexScript);
export const importRegexScriptSchema = regexScriptShape.superRefine(validateImportedRegexScript);
export const updateRegexScriptSchema = regexScriptShape.partial().superRefine(validateEditableRegexScript);
export const reorderRegexScriptsSchema = z.object({
    scriptIds: z.array(z.string().min(1)),
});
//# sourceMappingURL=regex.schema.js.map