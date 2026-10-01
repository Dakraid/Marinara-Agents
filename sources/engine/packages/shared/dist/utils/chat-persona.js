/**
 * Resolve only the Persona explicitly selected for a chat.
 * Legacy global active flags never supply a chat identity.
 */
export function resolveChatPersonaCandidate(personas, chatPersonaId, _legacyChatMode) {
    return (chatPersonaId ? personas.find((persona) => persona.id === chatPersonaId) : null) ?? null;
}
//# sourceMappingURL=chat-persona.js.map