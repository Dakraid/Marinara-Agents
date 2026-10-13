// The avatar agents (Marinara-Engine#7537) are thin packages: the Engine owns their storage, import,
// renderers, setup, director, classifier, and generation, and reads only their agent definitions. This
// pins what the Engine's contract (Marinara-Engine packages/shared/src/types/avatars.ts, Capability API
// 1.73) needs from them. Every mismatch fails quietly in the Engine: an unknown ${name} stays in the
// prompt as raw text, a missing template id leaves its generation button with no prompt, and a pipeline
// agent would add a model call to every turn.

export const AVATAR_PACKAGE_IDS = Object.freeze(["2d-avatars", "3d-avatars"]);

// Package-owned copies of the Engine's AVATAR_PROMPT_TEMPLATE_SETTINGS_KEY and
// AVATAR_PROMPT_TEMPLATE_VARIABLES: the vendored Engine snapshot predates them and is frozen.
export const AVATAR_PROMPT_TEMPLATE_SETTINGS_KEY = "avatarGenerationTemplates";
export const AVATAR_PROMPT_TEMPLATE_VARIABLES = Object.freeze({
  "avatar-pngtuber-eyes-closed": Object.freeze(["characterName", "appearance", "expression"]),
  "avatar-pngtuber-mouth-open": Object.freeze(["characterName", "appearance", "expression"]),
  "avatar-mesh-rig-layout": Object.freeze(["characterName", "appearance", "imageWidth", "imageHeight", "layoutSchema"]),
});

// The Engine's renderTemplate() placeholder syntax (services/prompt-overrides/template.ts).
const TEMPLATE_VARIABLE_PATTERN = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/** Returns false for any other package; throws when an avatar package breaks the contract. */
export function assertAvatarPackageContract(manifest, agentDefinitions) {
  const id = manifest?.id;
  if (!AVATAR_PACKAGE_IDS.includes(id)) return false;
  const api = manifest.capabilityApi;
  if (manifest.schemaVersion !== 2 || api?.major !== 1 || !(api.minor >= 73)) {
    throw new Error(`${id} must declare schemaVersion 2 and Capability API 1.73 or newer`);
  }
  const agent = Array.isArray(agentDefinitions) ? agentDefinitions.find((entry) => entry?.id === id) : undefined;
  if (agent?.execution !== "host") {
    throw new Error(`${id} must define its agent with execution "host" so the Engine runs it`);
  }
  if (agent.defaultPromptTemplate !== "") {
    throw new Error(`${id} makes no per-turn model call, so its defaultPromptTemplate must be empty`);
  }
  const templates = agent.defaultSettings?.[AVATAR_PROMPT_TEMPLATE_SETTINGS_KEY];
  if (id === "3d-avatars") {
    if (templates !== undefined) throw new Error(`${id} ships no generation prompts`);
    return true;
  }
  const expectedIds = Object.keys(AVATAR_PROMPT_TEMPLATE_VARIABLES).sort();
  const actualIds = Array.isArray(templates) ? templates.map((template) => template?.id).sort() : [];
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`${id} must ship exactly the ${AVATAR_PROMPT_TEMPLATE_SETTINGS_KEY}: ${expectedIds.join(", ")}`);
  }
  for (const template of templates) {
    const declared = AVATAR_PROMPT_TEMPLATE_VARIABLES[template.id];
    if (typeof template.name !== "string" || !template.name.trim()) {
      throw new Error(`${id} template ${template.id} needs a name`);
    }
    if (typeof template.promptTemplate !== "string" || !template.promptTemplate.trim()) {
      throw new Error(`${id} template ${template.id} needs prompt text`);
    }
    const used = [...template.promptTemplate.matchAll(TEMPLATE_VARIABLE_PATTERN)].map((match) => match[1]);
    const unknown = [...new Set(used.filter((name) => !declared.includes(name)))];
    if (unknown.length > 0) {
      throw new Error(`${id} template ${template.id} uses undeclared variables: ${unknown.join(", ")}`);
    }
    // The Engine fills the layout JSON shape here; without it the vision model cannot answer in that shape.
    if (template.id === "avatar-mesh-rig-layout" && !used.includes("layoutSchema")) {
      throw new Error(`${id} template ${template.id} must include \${layoutSchema}`);
    }
  }
  return true;
}
