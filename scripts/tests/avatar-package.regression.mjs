import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AVATAR_PACKAGE_IDS, assertAvatarPackageContract } from "../avatar-package-checks.mjs";

// Each rejection is pinned to its message, so a check that silently stopped covering a case fails here.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const shipped = {};
for (const id of AVATAR_PACKAGE_IDS) {
  const root = join(repoRoot, "packages", id);
  const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
  const agents = JSON.parse(await readFile(join(root, manifest.entrypoints.agents), "utf8"));
  assert.equal(assertAvatarPackageContract(manifest, agents), true, `${id} as committed`);
  shipped[id] = { manifest, agents };
}

// Other packages are not avatar packages.
assert.equal(assertAvatarPackageContract({ id: "expression", schemaVersion: 1 }, []), false);

function mutated(id, change) {
  const copy = structuredClone(shipped[id]);
  change(copy.manifest, copy.agents[0]);
  return () => assertAvatarPackageContract(copy.manifest, copy.agents);
}
const template = (agent, templateId) =>
  agent.defaultSettings.avatarGenerationTemplates.find((entry) => entry.id === templateId);

assert.throws(
  mutated("3d-avatars", (manifest) => (manifest.capabilityApi = { major: 1, minor: 72 })),
  /must declare schemaVersion 2 and Capability API 1\.73 or newer/,
);
assert.throws(
  mutated("2d-avatars", (_manifest, agent) => (agent.execution = "pipeline")),
  /must define its agent with execution "host"/,
);
assert.throws(
  mutated("3d-avatars", (_manifest, agent) => (agent.defaultPromptTemplate = "Describe the avatar.")),
  /defaultPromptTemplate must be empty/,
);
assert.throws(
  mutated("2d-avatars", (_manifest, agent) => agent.defaultSettings.avatarGenerationTemplates.pop()),
  /must ship exactly the avatarGenerationTemplates/,
);
assert.throws(
  mutated("2d-avatars", (_manifest, agent) => {
    template(agent, "avatar-pngtuber-mouth-open").promptTemplate += " Size: ${imageWidth}.";
  }),
  /avatar-pngtuber-mouth-open uses undeclared variables: imageWidth/,
);
assert.throws(
  mutated("2d-avatars", (_manifest, agent) => {
    const layout = template(agent, "avatar-mesh-rig-layout");
    layout.promptTemplate = layout.promptTemplate.replaceAll("${layoutSchema}", "the schema");
  }),
  /avatar-mesh-rig-layout must include \$\{layoutSchema\}/,
);
assert.throws(
  mutated("3d-avatars", (_manifest, agent) => (agent.defaultSettings = { avatarGenerationTemplates: [] })),
  /ships no generation prompts/,
);

console.log("Avatar package contract regression passed.");
