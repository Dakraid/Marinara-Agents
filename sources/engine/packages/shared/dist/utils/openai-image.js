export function isOpenAIGptImage25Model(model) {
    return /^gpt-image-2\.5-(?:flare|sunburst)(?:$|-)/i.test(model?.trim() ?? "");
}
export function isOpenAIGptImage2Model(model) {
    return /^gpt-image-2(?:$|-)/i.test(model?.trim() ?? "");
}
export function isOpenAIGptImageModel(model) {
    return isOpenAIGptImage25Model(model) || /^gpt-image-(?:1|1\.5|2)(?:$|-)/i.test(model?.trim() ?? "");
}
export function supportsOpenAIImageCustomSize(model) {
    return isOpenAIGptImage2Model(model) || isOpenAIGptImage25Model(model);
}
export function supportsOpenAITransparentBackground(model) {
    // GPT Image 2 lacks native alpha; 2.5 restores it for PNG/WebP output.
    return isOpenAIGptImage25Model(model) || /^gpt-image-(?:1|1\.5)(?:$|-)/i.test(model?.trim() ?? "");
}
export function resolveOpenAIImageQuality(value, model) {
    if (value === "low" || value === "medium" || value === "high")
        return value;
    // OpenRouter uses the same IDs with an OpenAI namespace.
    if ((value === "xhigh" || value === "max") && isOpenAIGptImage25Model(model?.trim().replace(/^openai\//i, "")))
        return value;
    return "auto";
}
//# sourceMappingURL=openai-image.js.map