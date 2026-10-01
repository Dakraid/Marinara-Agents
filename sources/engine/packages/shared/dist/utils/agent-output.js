/** Private continuation context is never part of main-prompt or cross-agent output. */
export function publicAgentOutput(data) {
    if (!data || typeof data !== "object" || Array.isArray(data))
        return data;
    const { "agent-context": _context, agentContext: _alias, ...output } = data;
    return output;
}
export function previousAgentOutputText(data) {
    if (data == null)
        return "";
    const record = typeof data === "object" && !Array.isArray(data) ? data : null;
    const hasContext = record && (Object.hasOwn(record, "agent-context") || Object.hasOwn(record, "agentContext"));
    const value = hasContext
        ? ((Object.hasOwn(record, "agent-context") ? record["agent-context"] : record.agentContext) ?? "")
        : (record?.text ?? data);
    return typeof value === "string" ? value : JSON.stringify(value);
}
//# sourceMappingURL=agent-output.js.map