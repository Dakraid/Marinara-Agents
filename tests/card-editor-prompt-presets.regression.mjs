import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { normalizeSessionConfig } from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/schema.ts";
import { PROMPT_PRESET_TEMPLATES } from "../packages/card-editor/src/engine/packages/client/src/features/card-editor/presets.ts";
import { PRESETS } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/prompts.ts";

// The three bulk prompt presets have exactly one source of truth: the server
// prompts module (prompts.ts PRESETS). The agents.json promptTemplates[] entries
// (localized into the package metadata catalog) and the dialog's Custom prefill
// bodies (presets.ts) are byte-identical copies, pinned here so the surfaces can
// never drift. The single-run pipeline prompt is a different prompt and stays
// untouched: presets are bulk-dispatch variants, so no defaultPromptTemplateId
// override may reroute pipeline runs onto them.

const packageRoot = new URL("../packages/card-editor/", import.meta.url);
const agents = JSON.parse(readFileSync(new URL("agents.json", packageRoot), "utf8"));
const editor = agents.find((agent) => agent.id === "card-editor");
const metadataCatalog = JSON.parse(readFileSync(new URL("locales/en.json", packageRoot), "utf8"));
const uiCatalog = JSON.parse(
  readFileSync(
    new URL(
      "../packages/card-editor/src/engine/packages/client/src/features/card-editor/locales/en.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

assert.ok(editor, "Card Editor definition must exist");
assert.deepEqual(
  PRESETS.map((preset) => preset.id),
  ["standard", "strict", "rebalance"],
  "server PRESETS are the preset source of truth",
);

// ── 1. agents.json promptTemplates[] match PRESETS byte-for-byte ──
const templates = editor.promptTemplates;
assert.ok(Array.isArray(templates), "agents.json must declare promptTemplates[]");
assert.deepEqual(
  templates.map((template) => template.id),
  PRESETS.map((preset) => preset.id),
  "agents.json promptTemplates[] must mirror the server presets",
);
for (const [index, preset] of PRESETS.entries()) {
  const template = templates[index];
  assert.equal(template.name, preset.label, `${preset.id} name must be the preset label`);
  assert.equal(
    template.promptTemplate,
    preset.template,
    `agents.json ${preset.id} body must match prompts.ts PRESETS byte-for-byte`,
  );
  assert.ok(template.description?.trim(), `${preset.id} needs a metadata description`);
}

// ── 2. The single-run pipeline prompt is unchanged and remains the default ──
assert.match(editor.defaultPromptTemplate, /<directive>/u);
assert.match(editor.defaultPromptTemplate, /"action": "update"/u);
assert.equal(
  editor.defaultSettings.defaultPromptTemplateId,
  undefined,
  "pipeline runs must keep the base prompt; presets are bulk-dispatch variants",
);

// ── 3. Bulk dispatch defaults to the standard preset ──
assert.equal(normalizeSessionConfig({}).presetId, "standard", "bulk sessions default to the standard preset");

// ── 4. Dialog Custom prefill bodies (presets.ts) match PRESETS byte-for-byte ──
assert.deepEqual(
  Object.keys(PROMPT_PRESET_TEMPLATES),
  PRESETS.map((preset) => preset.id),
  "presets.ts must carry exactly the server preset ids",
);
for (const preset of PRESETS) {
  assert.equal(
    PROMPT_PRESET_TEMPLATES[preset.id],
    preset.template,
    `presets.ts ${preset.id} body must match prompts.ts PRESETS byte-for-byte`,
  );
}

// ── 5. Display names stay in sync across both locale catalogs ──
const dialogNameById = {
  standard: uiCatalog["cardEditor.dialog.model.presetStandard"],
  strict: uiCatalog["cardEditor.dialog.model.presetStrict"],
  rebalance: uiCatalog["cardEditor.dialog.model.presetRebalance"],
};
const localizedTemplates = metadataCatalog.agents?.["card-editor"]?.promptTemplates ?? {};
for (const preset of PRESETS) {
  assert.equal(
    dialogNameById[preset.id],
    preset.label,
    `dialog display name for ${preset.id} must be the preset label`,
  );
  assert.equal(
    localizedTemplates[preset.id]?.name,
    preset.label,
    `metadata catalog name for ${preset.id} must be the preset label`,
  );
  assert.ok(
    localizedTemplates[preset.id]?.description?.trim(),
    `metadata catalog needs a description for ${preset.id}`,
  );
}

process.stdout.write("Card Editor prompt presets regression passed.\n");
