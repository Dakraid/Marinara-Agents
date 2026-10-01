import { estimateTextTokens } from "./token-estimator.js";
const CARD_TEXT_FIELDS = [
    "name",
    "description",
    "personality",
    "scenario",
    "first_mes",
    "mes_example",
    "creator_notes",
    "system_prompt",
    "post_history_instructions",
];
function asString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function collectString(value, output) {
    const text = asString(value);
    if (text)
        output.push(text);
}
function collectStringArray(value, output) {
    if (!Array.isArray(value))
        return;
    for (const item of value)
        collectString(item, output);
}
function collectDepthPrompt(value, output) {
    const depthPrompt = asRecord(value);
    collectString(depthPrompt.prompt, output);
}
function collectCharacterBookEntry(entry, output) {
    collectString(entry.name, output);
    collectString(entry.comment, output);
    collectString(entry.content, output);
    collectStringArray(entry.keys, output);
    collectStringArray(entry.secondary_keys, output);
}
function collectCharacterBook(value, output) {
    const book = asRecord(value);
    collectString(book.name, output);
    collectString(book.description, output);
    if (!Array.isArray(book.entries))
        return;
    for (const entry of book.entries) {
        collectCharacterBookEntry(asRecord(entry), output);
    }
}
/** Estimate all prompt-bearing text stored in a character card. */
export function estimateCharacterCardTokens(data) {
    const textParts = [];
    for (const field of CARD_TEXT_FIELDS) {
        collectString(data[field], textParts);
    }
    collectStringArray(data.alternate_greetings, textParts);
    const extensions = asRecord(data.extensions);
    collectString(extensions.backstory, textParts);
    collectString(extensions.appearance, textParts);
    collectString(extensions.world, textParts);
    collectDepthPrompt(extensions.depth_prompt, textParts);
    collectCharacterBook(data.character_book, textParts);
    return estimateTextTokens(textParts.join("\n"));
}
//# sourceMappingURL=character-token-estimator.js.map