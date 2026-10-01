// ──────────────────────────────────────────────
// Agent System Types
// ──────────────────────────────────────────────
import { BUILT_IN_AGENT_MANIFESTS, replaceBuiltInAgentManifestRegistry } from "../features/agents/agent-registry.js";
const AGENT_PHASE_VALUES = new Set(["pre_generation", "parallel", "post_processing"]);
export function normalizeAgentPhaseValue(value, fallback = "post_processing") {
    return typeof value === "string" && AGENT_PHASE_VALUES.has(value) ? value : fallback;
}
export function normalizeAgentPhaseForType(_agentType, configuredPhase, fallback = "post_processing") {
    // Keep the historical helper name for call-site compatibility, but do not
    // coerce built-ins by type. If the agent editor lets a user choose a phase,
    // that valid phase must survive storage, UI hydration, and runtime resolution.
    return normalizeAgentPhaseValue(configuredPhase, fallback);
}
/** Ordered vocabulary of result types that agents can produce. */
export const AGENT_RESULT_TYPE_VALUES = [
    "game_state_update",
    "text_rewrite",
    "sprite_change",
    "echo_message",
    "quest_update",
    "image_prompt",
    "context_injection",
    "continuity_check",
    "director_event",
    "lorebook_update",
    "character_card_update",
    "character_card_create",
    "background_change",
    "character_tracker_update",
    "persona_stats_update",
    "custom_tracker_update",
    "inventory_tracker_update",
    "spotify_control",
    "youtube_control",
    "local_music_control",
    "haptic_command",
    "cyoa_choices",
    "secret_plot",
    "game_master_narration",
    "party_action",
    "game_map_update",
    "game_state_transition",
    "prompt_patch",
    "character_activity_update",
    "frontend_theme_update",
    "about_me_update",
    "memory_nag",
];
export const DEFAULT_AGENT_AUTHOR = "Pasta Devs";
export const DEFAULT_AGENT_PROMPT_TEMPLATE_ID = "default";
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
export function parseAgentSettingsRecord(value) {
    if (!value)
        return {};
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return isRecord(parsed) ? parsed : {};
        }
        catch {
            return {};
        }
    }
    return isRecord(value) ? value : {};
}
export const AGENT_CONFIG_DELETED_SETTING_KEY = "deletedFromLibrary";
export function isAgentConfigDeleted(settings) {
    return parseAgentSettingsRecord(settings)[AGENT_CONFIG_DELETED_SETTING_KEY] === true;
}
export function markAgentConfigDeletedSettings(settings) {
    return {
        ...parseAgentSettingsRecord(settings),
        [AGENT_CONFIG_DELETED_SETTING_KEY]: true,
    };
}
function normalizePromptTemplateId(value, fallback) {
    const raw = typeof value === "string" ? value.trim() : "";
    const normalized = raw
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return normalized || fallback;
}
function normalizePromptTemplateName(value, fallback) {
    const raw = typeof value === "string" ? value.trim() : "";
    return raw || fallback;
}
function getUniquePromptTemplateId(id, usedIds) {
    let candidate = id;
    let attempt = 2;
    while (usedIds.has(candidate) || candidate === DEFAULT_AGENT_PROMPT_TEMPLATE_ID) {
        candidate = `${id}-${attempt}`;
        attempt++;
    }
    usedIds.add(candidate);
    return candidate;
}
export function normalizeAgentPromptTemplateOptions(value) {
    const entries = Array.isArray(value)
        ? value
        : isRecord(value)
            ? Object.entries(value).map(([id, entry]) => (isRecord(entry) ? { ...entry, id } : entry))
            : [];
    const usedIds = new Set();
    const options = [];
    for (const [index, entry] of entries.entries()) {
        if (!isRecord(entry))
            continue;
        const promptTemplate = typeof entry.promptTemplate === "string"
            ? entry.promptTemplate
            : typeof entry.prompt === "string"
                ? entry.prompt
                : "";
        if (!promptTemplate.trim())
            continue;
        const name = normalizePromptTemplateName(entry.name ?? entry.label, `Option ${index + 1}`);
        const id = getUniquePromptTemplateId(normalizePromptTemplateId(entry.id, `option-${index + 1}`), usedIds);
        const description = typeof entry.description === "string" ? entry.description.trim() : "";
        options.push({
            id,
            name,
            promptTemplate,
            ...(description ? { description } : {}),
        });
    }
    return options;
}
export function getAgentPromptTemplateOptions(input) {
    const settings = parseAgentSettingsRecord(input.settings);
    const basePromptTemplate = input.promptTemplate?.trim() ? input.promptTemplate : (input.fallbackPromptTemplate ?? "");
    const defaultName = normalizePromptTemplateName(settings.defaultPromptTemplateName, "Default");
    const defaultDescription = typeof settings.defaultPromptTemplateDescription === "string"
        ? settings.defaultPromptTemplateDescription.trim()
        : "";
    return [
        {
            id: DEFAULT_AGENT_PROMPT_TEMPLATE_ID,
            name: defaultName,
            promptTemplate: basePromptTemplate,
            ...(defaultDescription ? { description: defaultDescription } : {}),
        },
        ...normalizeAgentPromptTemplateOptions(settings.promptTemplates),
    ];
}
export function resolveDefaultAgentPromptTemplateId(settingsValue) {
    const settings = parseAgentSettingsRecord(settingsValue);
    const configuredId = normalizePromptTemplateId(settings.defaultPromptTemplateId, DEFAULT_AGENT_PROMPT_TEMPLATE_ID);
    if (configuredId === DEFAULT_AGENT_PROMPT_TEMPLATE_ID)
        return configuredId;
    return normalizeAgentPromptTemplateOptions(settings.promptTemplates).some((option) => option.id === configuredId)
        ? configuredId
        : DEFAULT_AGENT_PROMPT_TEMPLATE_ID;
}
export function normalizeAgentPromptTemplateSelectionMap(value) {
    if (!isRecord(value))
        return {};
    const selections = {};
    for (const [agentType, promptTemplateId] of Object.entries(value)) {
        if (typeof promptTemplateId !== "string")
            continue;
        const cleanedType = agentType.trim();
        const cleanedId = normalizePromptTemplateId(promptTemplateId, "");
        if (!cleanedType || !cleanedId)
            continue;
        selections[cleanedType] = cleanedId;
    }
    return selections;
}
export function resolveAgentPromptTemplate(input) {
    const explicitSelectedId = normalizePromptTemplateId(input.selectedPromptTemplateId, "");
    const selectedId = explicitSelectedId || resolveDefaultAgentPromptTemplateId(input.settings);
    if (selectedId === DEFAULT_AGENT_PROMPT_TEMPLATE_ID) {
        return input.promptTemplate?.trim() ? input.promptTemplate : (input.fallbackPromptTemplate ?? "");
    }
    const option = getAgentPromptTemplateOptions(input).find((entry) => entry.id === selectedId);
    return (option?.promptTemplate ??
        (input.promptTemplate?.trim() ? input.promptTemplate : (input.fallbackPromptTemplate ?? "")));
}
/** Built-in agent type identifiers. */
export const BUILT_IN_AGENT_IDS = {
    WORLD_STATE: "world-state",
    PROSE_GUARDIAN: "prose-guardian",
    CONTINUITY: "continuity",
    EXPRESSION: "expression",
    ECHO_CHAMBER: "echo-chamber",
    DIRECTOR: "director",
    QUEST: "quest",
    ILLUSTRATOR: "illustrator",
    LOREBOOK_KEEPER: "lorebook-keeper",
    CARD_EVOLUTION_AUDITOR: "card-evolution-auditor",
    COMBAT: "combat",
    BACKGROUND: "background",
    CHARACTER_TRACKER: "character-tracker",
    PERSONA_STATS: "persona-stats",
    HTML: "html",
    SPOTIFY: "spotify",
    KNOWLEDGE_RETRIEVAL: "knowledge-retrieval",
    KNOWLEDGE_ROUTER: "knowledge-router",
    CUSTOM_TRACKER: "custom-tracker",
    HAPTIC: "haptic",
    CYOA: "cyoa",
};
export const RETIRED_BUILT_IN_AGENT_IDS = [
    "conversation-about-me",
    "prompt-reviewer",
    "response-orchestrator",
    "schedule-planner",
    "chat-summary",
    "autonomous-messenger",
    "youtube",
    "secret-plot-driver",
];
const RETIRED_BUILT_IN_AGENT_ID_SET = new Set(RETIRED_BUILT_IN_AGENT_IDS);
export function isRetiredBuiltInAgentId(agentId) {
    return RETIRED_BUILT_IN_AGENT_ID_SET.has(agentId);
}
function toBuiltInAgentMeta(agent) {
    return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        author: agent.author ?? DEFAULT_AGENT_AUTHOR,
        phase: normalizeAgentPhaseForType(agent.id, agent.phase),
        enabledByDefault: agent.enabledByDefault,
        ...(agent.defaultInjectAsSection !== undefined ? { defaultInjectAsSection: agent.defaultInjectAsSection } : {}),
        category: agent.category,
        ...(agent.libraryHidden !== undefined ? { libraryHidden: agent.libraryHidden } : {}),
        ...(agent.runtimeDisabled !== undefined ? { runtimeDisabled: agent.runtimeDisabled } : {}),
        ...(agent.modeAllowlist !== undefined ? { modeAllowlist: [...agent.modeAllowlist] } : {}),
        ...(agent.promptTemplates !== undefined ? { promptTemplates: [...agent.promptTemplates] } : {}),
        ...(agent.execution !== undefined ? { execution: agent.execution } : {}),
    };
}
export const BUILT_IN_AGENTS = [];
export const DEFAULT_AGENT_CONTEXT_SIZE = 5;
export const DEFAULT_AGENT_MAX_TOKENS = 4096;
export const MIN_AGENT_MAX_TOKENS = 128;
export const MAX_AGENT_MAX_TOKENS = 32768;
export const CUSTOM_AGENT_CAPABILITY_IDS = [
    "create_characters",
    "create_lorebooks",
    "edit_lorebooks",
    "edit_messages",
    "edit_trackers",
    "change_frontend_styling",
    "change_backgrounds",
    "change_sprites",
    "control_media",
    "control_haptics",
    "edit_about_me",
    "trigger_image_generation",
    "access_vectors",
    "edit_main_prompt",
    "manage_chat_characters",
];
export const CUSTOM_AGENT_CONTEXT_SOURCE_IDS = [
    "chatHistory",
    "characters",
    "persona",
    "activatedLorebookEntries",
    "chatSummary",
    "authorNotes",
    "trackerData",
    "recalledMemories",
    "previousOutput",
];
export const DEFAULT_CUSTOM_AGENT_CONTEXT_SOURCES = {
    chatHistory: true,
    characters: false,
    persona: false,
    activatedLorebookEntries: false,
    chatSummary: false,
    authorNotes: false,
    trackerData: false,
    recalledMemories: false,
    previousOutput: false,
};
export function normalizeCustomAgentContextSources(settings) {
    const stored = parseAgentSettingsRecord(settings).contextSources;
    if (!isRecord(stored))
        return { ...DEFAULT_CUSTOM_AGENT_CONTEXT_SOURCES };
    const normalized = { ...DEFAULT_CUSTOM_AGENT_CONTEXT_SOURCES };
    for (const source of CUSTOM_AGENT_CONTEXT_SOURCE_IDS) {
        if (typeof stored[source] === "boolean")
            normalized[source] = stored[source];
    }
    return normalized;
}
/** Built-in agents retain their existing context unless the user explicitly configures sources. */
export function getAgentContextSources(config) {
    const settings = parseAgentSettingsRecord(config.settings);
    if (config.isCustomAgent || isRecord(settings.contextSources))
        return normalizeCustomAgentContextSources(settings);
    return {
        chatHistory: true,
        characters: true,
        persona: true,
        activatedLorebookEntries: true,
        chatSummary: true,
        authorNotes: true,
        trackerData: true,
        recalledMemories: true,
        previousOutput: false,
    };
}
export const CUSTOM_AGENT_IMPORT_SOURCE_SETTING = "customAgentImportSource";
export const CUSTOM_AGENT_PERMISSIONS_EXPLICIT_SETTING = "customAgentPermissionsExplicit";
export function createImportedAgentType(sourceType) {
    const slug = sourceType
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "agent";
    const suffix = globalThis.crypto && "randomUUID" in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `custom-import-${slug}-${suffix}`;
}
const CUSTOM_AGENT_CAPABILITY_SET = new Set(CUSTOM_AGENT_CAPABILITY_IDS);
const CUSTOM_AGENT_RESULT_CAPABILITY = {
    character_card_create: "create_characters",
    text_rewrite: "edit_messages",
    lorebook_update: "edit_lorebooks",
    character_tracker_update: "edit_trackers",
    persona_stats_update: "edit_trackers",
    custom_tracker_update: "edit_trackers",
    inventory_tracker_update: "edit_trackers",
    quest_update: "edit_trackers",
    game_state_update: "edit_trackers",
    image_prompt: "trigger_image_generation",
    prompt_patch: "edit_main_prompt",
    character_activity_update: "manage_chat_characters",
    frontend_theme_update: "change_frontend_styling",
    background_change: "change_backgrounds",
    sprite_change: "change_sprites",
    spotify_control: "control_media",
    youtube_control: "control_media",
    local_music_control: "control_media",
    haptic_command: "control_haptics",
    about_me_update: "edit_about_me",
    cyoa_choices: "edit_messages",
    echo_message: "edit_messages",
};
function normalizeCapabilityMap(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return {};
    const output = {};
    for (const [key, enabled] of Object.entries(value)) {
        if (!CUSTOM_AGENT_CAPABILITY_SET.has(key) || enabled !== true)
            continue;
        output[key] = true;
    }
    return output;
}
export function normalizeCustomAgentCapabilities(settings) {
    const capabilities = normalizeCapabilityMap(settings?.customCapabilities ?? settings?.capabilities);
    const enabledToolsValue = settings?.enabledTools;
    const enabledTools = Array.isArray(enabledToolsValue) ? enabledToolsValue : [];
    const resultType = typeof settings?.resultType === "string" ? settings.resultType : null;
    if (settings?.[CUSTOM_AGENT_PERMISSIONS_EXPLICIT_SETTING] !== true &&
        (settings?.lorebookWriteEnabled === true || enabledTools.includes("save_lorebook_entry"))) {
        capabilities.edit_lorebooks = true;
    }
    if (settings?.[CUSTOM_AGENT_PERMISSIONS_EXPLICIT_SETTING] !== true &&
        resultType &&
        Object.prototype.hasOwnProperty.call(CUSTOM_AGENT_RESULT_CAPABILITY, resultType)) {
        const capability = CUSTOM_AGENT_RESULT_CAPABILITY[resultType];
        if (capability)
            capabilities[capability] = true;
    }
    return capabilities;
}
export function customAgentHasCapability(settings, capability) {
    return normalizeCustomAgentCapabilities(settings)[capability] === true;
}
export function getCustomAgentResultCapability(resultType) {
    return CUSTOM_AGENT_RESULT_CAPABILITY[resultType] ?? null;
}
export function isExternallyImportedAgent(type, settings) {
    const parsed = parseAgentSettingsRecord(settings);
    const source = parsed[CUSTOM_AGENT_IMPORT_SOURCE_SETTING];
    if (source === "file" || source === "folder" || source === "repository")
        return true;
    if (parsed.customAgentRepositorySource && typeof parsed.customAgentRepositorySource === "object")
        return true;
    // Repository-backed Agents predate explicit provenance and retain a stable
    // repo-* identity. File/folder imports always persist provenance now, so a
    // locally authored Agent whose slug happens to begin with "import" must not
    // be disabled as an external import.
    return typeof type === "string" && type.startsWith("repo-");
}
export function getDefaultBuiltInAgentSettings(agentType) {
    const builtIn = BUILT_IN_AGENT_MANIFESTS.find((agent) => agent.id === agentType);
    const settings = {
        maxTokens: DEFAULT_AGENT_MAX_TOKENS,
        ...(builtIn?.defaultSettings ?? {}),
    };
    if (builtIn) {
        settings.author = builtIn.author ?? DEFAULT_AGENT_AUTHOR;
    }
    if (builtIn?.promptTemplates?.length) {
        settings.promptTemplates = [...builtIn.promptTemplates];
    }
    if (builtIn?.defaultInjectAsSection) {
        settings.injectAsSection = true;
    }
    if (builtIn?.runInterval !== undefined) {
        settings.runInterval = builtIn.runInterval;
    }
    return settings;
}
const OBSOLETE_BUILT_IN_PROMPT_TEMPLATE_IDS = {
    illustrator: new Set(["illustration", "sketch"]),
};
const ADDITIONAL_BUILT_IN_PROMPT_TEMPLATE_COLLECTION_KEYS = {
    storyboard: [
        "illustrationTemplates",
        "videoTemplates",
        "animationRefinementTemplates",
        "roleplayEpisodeTemplates",
        "roleplayStyleTemplates",
        "roleplayAnimationTemplates",
        "roleplayOutputTemplates",
    ],
};
const RETIRED_BUILT_IN_AGENT_TOOLS = {
    expression: new Set(["set_expression"]),
};
export function normalizeBuiltInAgentEnabledTools(agentType, value) {
    if (!Array.isArray(value))
        return null;
    const enabledTools = value.filter((tool) => typeof tool === "string");
    const retiredTools = RETIRED_BUILT_IN_AGENT_TOOLS[agentType];
    return retiredTools ? enabledTools.filter((tool) => !retiredTools.has(tool)) : enabledTools;
}
function mergeBuiltInPromptTemplateCollection(defaultValue, savedValue, obsoleteIds = new Set()) {
    const defaultOptions = normalizeAgentPromptTemplateOptions(defaultValue);
    const savedOptions = normalizeAgentPromptTemplateOptions(savedValue);
    const savedOptionsById = new Map(savedOptions.filter((entry) => !obsoleteIds.has(entry.id)).map((entry) => [entry.id, entry]));
    const usedIds = new Set();
    const mergedDefaultOptions = defaultOptions.map((defaultOption) => {
        usedIds.add(defaultOption.id);
        const savedOption = savedOptionsById.get(defaultOption.id);
        return savedOption ? { ...defaultOption, ...savedOption } : defaultOption;
    });
    const customOptions = savedOptions.filter((entry) => {
        if (obsoleteIds.has(entry.id) || usedIds.has(entry.id))
            return false;
        usedIds.add(entry.id);
        return true;
    });
    return [...mergedDefaultOptions, ...customOptions];
}
export function mergeBuiltInAgentSettings(agentType, settings) {
    const parsed = parseAgentSettingsRecord(settings);
    const normalizedEnabledTools = normalizeBuiltInAgentEnabledTools(agentType, parsed.enabledTools);
    const normalizedSettings = normalizedEnabledTools === null ? parsed : { ...parsed, enabledTools: normalizedEnabledTools };
    const builtIn = BUILT_IN_AGENT_MANIFESTS.find((agent) => agent.id === agentType);
    if (!builtIn)
        return normalizedSettings;
    const defaults = getDefaultBuiltInAgentSettings(agentType);
    const merged = {
        ...defaults,
        ...normalizedSettings,
    };
    const promptTemplateCollectionKeys = [
        "promptTemplates",
        ...(ADDITIONAL_BUILT_IN_PROMPT_TEMPLATE_COLLECTION_KEYS[agentType] ?? []),
    ];
    for (const key of promptTemplateCollectionKeys) {
        const obsoleteIds = key === "promptTemplates" ? (OBSOLETE_BUILT_IN_PROMPT_TEMPLATE_IDS[agentType] ?? new Set()) : undefined;
        const promptTemplates = mergeBuiltInPromptTemplateCollection(defaults[key], normalizedSettings[key], obsoleteIds);
        if (promptTemplates.length) {
            merged[key] = promptTemplates;
        }
        else {
            delete merged[key];
        }
    }
    return merged;
}
/** Recommended default tools for each built-in agent type. */
export const DEFAULT_AGENT_TOOLS = {};
export function replaceBuiltInAgentDefinitions(manifests) {
    replaceBuiltInAgentManifestRegistry(manifests);
    BUILT_IN_AGENTS.splice(0, BUILT_IN_AGENTS.length, ...manifests.map(toBuiltInAgentMeta));
    for (const key of Object.keys(DEFAULT_AGENT_TOOLS))
        delete DEFAULT_AGENT_TOOLS[key];
    for (const agent of manifests) {
        DEFAULT_AGENT_TOOLS[agent.id] = normalizeBuiltInAgentEnabledTools(agent.id, agent.defaultTools ?? []) ?? [];
    }
}
/**
 * Single proposed edit to a character card field.
 *
 * Unlike LorebookUpdateResult, these edits are NEVER applied automatically —
 * the server emits them as an agent_result SSE event and the client shows
 * a confirmation modal. Character cards are more sensitive than lorebook
 * entries because they define the character's identity.
 */
export const EDITABLE_CHARACTER_CARD_FIELDS = [
    "description",
    "personality",
    "scenario",
    "first_mes",
    "mes_example",
    "creator_notes",
    "system_prompt",
    "post_history_instructions",
    "backstory",
    "appearance",
    "aboutMe",
];
//# sourceMappingURL=agent.js.map