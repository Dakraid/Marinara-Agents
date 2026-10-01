/** Join a continuation exactly as it will be stored, including the user's separator preference. */
export function appendContinuationMessageContent(existingContent, continuation, addNewline = true) {
    const existing = typeof existingContent === "string" ? existingContent : "";
    if (!existing)
        return continuation;
    if (!continuation)
        return existing;
    if (!addNewline)
        return `${existing}${continuation.replace(/^(?:\r?\n)+/, "")}`;
    return `${existing.trimEnd()}\n\n${continuation.trimStart()}`;
}
//# sourceMappingURL=message-continuation.js.map