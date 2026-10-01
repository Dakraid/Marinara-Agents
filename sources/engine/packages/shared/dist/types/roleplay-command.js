export const ROLEPLAY_COMMAND_KEYS = [
    "illustrate",
    "document",
    "sound",
    "music",
    "notes",
    "memory",
    "roll",
    "combat",
    "dm",
    "interrupt",
    "whisper",
];
/** Read current records, or reconstruct editable context from older message extras. */
export function getRoleplayCommandActivity(extra) {
    if (Array.isArray(extra.roleplayCommandActivity)) {
        return extra.roleplayCommandActivity.filter((item) => item &&
            typeof item.raw === "string" &&
            item.command &&
            [...ROLEPLAY_COMMAND_KEYS, "dismiss_notes", "dismiss_memory"].includes(item.command.type));
    }
    const activity = [];
    if (Array.isArray(extra.roleplayPrivateCommands)) {
        for (const command of extra.roleplayPrivateCommands) {
            if (command && ["notes", "dismiss_notes", "memory", "dismiss_memory"].includes(command.type))
                activity.push({ command, raw: JSON.stringify(command) });
        }
    }
    if (Array.isArray(extra.roleplayDocuments)) {
        for (const document of extra.roleplayDocuments) {
            if (document && typeof document.title === "string" && typeof document.content === "string") {
                const command = {
                    type: "document",
                    documentType: document.type,
                    title: document.title,
                    content: document.content,
                };
                activity.push({ command, raw: JSON.stringify(command) });
            }
        }
    }
    return activity;
}
export function getRoleplayPrivateCommands(extra) {
    return getRoleplayCommandActivity(extra).flatMap(({ command, deleted, error }) => {
        if (error)
            return [];
        if (command.type === "notes")
            return [deleted ? { type: "dismiss_notes" } : command];
        if (command.type === "memory")
            return [deleted ? { type: "dismiss_memory", id: command.id } : command];
        return command.type === "dismiss_notes" || command.type === "dismiss_memory" ? [command] : [];
    });
}
export function getRoleplayDocuments(extra) {
    return getRoleplayCommandActivity(extra).flatMap(({ command, deleted, error }) => !deleted &&
        !error &&
        command.type === "document" &&
        typeof command.title === "string" &&
        typeof command.content === "string"
        ? [{ type: command.documentType, title: command.title, content: command.content }]
        : []);
}
export function getRoleplayWhispers(extra) {
    return getRoleplayCommandActivity(extra).flatMap((activity, index) => {
        const { command, whisperRecipient: recipient } = activity;
        return !activity.deleted &&
            !activity.error &&
            command.type === "whisper" &&
            typeof command.character === "string" &&
            typeof command.text === "string" &&
            command.text.length > 0 &&
            command.text.length <= 16_000 &&
            recipient &&
            typeof recipient.id === "string" &&
            recipient.id.length > 0 &&
            (recipient.kind === "character" || recipient.kind === "persona")
            ? [{ activity, index, command, recipient }]
            : [];
    });
}
/** Keep an inline result near its original text after edits; ambiguous anchors fall back to the end. */
export function getRoleplayCommandContentOffset(text, item) {
    const expected = item.contentOffset;
    const anchor = item.contentAnchor;
    if (typeof expected === "number" &&
        Number.isSafeInteger(expected) &&
        expected >= 0 &&
        typeof anchor === "string" &&
        anchor.length > 0) {
        const currentAnchor = expected === 0 ? text.slice(0, anchor.length) : text.slice(Math.max(0, expected - anchor.length), expected);
        if (expected <= text.length && currentAnchor === anchor)
            return expected;
        if (text.indexOf(anchor) >= 0 && text.indexOf(anchor) === text.lastIndexOf(anchor))
            return text.indexOf(anchor) + (expected === 0 ? 0 : anchor.length);
    }
    return text.length;
}
export function roleplayCommandsEnabled(metadata) {
    // Preserve an existing explicit DM opt-in. New chats have no enabled commands.
    return (metadata.roleplayCommandsEnabled === true ||
        (metadata.roleplayCommandsEnabled === undefined && metadata.roleplayDmCommandsEnabled === true));
}
export function isRoleplayCommandEnabled(metadata, key) {
    if (!roleplayCommandsEnabled(metadata))
        return false;
    const toggles = metadata.roleplayCommandToggles;
    if (toggles && typeof toggles === "object" && !Array.isArray(toggles)) {
        const value = toggles[key];
        if (typeof value === "boolean")
            return value;
    }
    return key === "dm" && metadata.roleplayDmCommandsEnabled === true;
}
/** A narrator-only command needs an unambiguous, current participant as its caller. */
export function isRoleplayCommandAllowed(metadata, key, characterId) {
    if (!isRoleplayCommandEnabled(metadata, key))
        return false;
    if ((key === "roll" && metadata.roleplayRollAudience === "narrator") ||
        (key === "combat" && metadata.roleplayCombatAudience === "narrator") ||
        (key === "document" && metadata.roleplayDocumentAudience === "narrator") ||
        (key === "whisper" && metadata.roleplayWhisperAudience === "narrator")) {
        if (!characterId || characterId !== metadata.roleplayCommandNarratorId)
            return false;
    }
    if (key === "music" && metadata.enableAgents !== true)
        return false;
    if (key === "illustrate" || key === "combat" || key === "music") {
        return (Array.isArray(metadata.activeAgentIds) &&
            metadata.activeAgentIds.includes(key === "illustrate" ? "illustrator" : key === "music" ? "spotify" : "combat"));
    }
    return true;
}
//# sourceMappingURL=roleplay-command.js.map