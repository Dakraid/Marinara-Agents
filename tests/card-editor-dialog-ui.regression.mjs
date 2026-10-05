import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { normalizeSessionConfig } from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/schema.ts";
import {
  BULK_CONFIG_STORAGE_KEY,
  estimateBulkCalls,
  loadStoredBulkConfig,
  normalizeBulkSessionConfig,
  storeBulkConfig,
} from "../packages/card-editor/src/engine/packages/client/src/features/card-editor/session-config.ts";

const featureRoot = new URL(
  "../packages/card-editor/src/engine/packages/client/src/features/card-editor/",
  import.meta.url,
);
const read = (name) => readFileSync(new URL(name, featureRoot), "utf8");

const clientEntry = read("client-entry.tsx");
const dialog = read("BulkDispatchDialog.tsx");
const dialogControls = read("dialog-controls.tsx");
const dialogTargets = read("DialogTargets.tsx");
const behaviorSelect = read("BehaviorCharacterSelect.tsx");
const api = read("api.ts");
const styles = read("styles.ts");
const presets = read("presets.ts");
const catalog = JSON.parse(read("locales/en.json"));
const builtClient = readFileSync(new URL("../packages/card-editor/client.js", import.meta.url), "utf8");
const componentSources = {
  "client-entry.tsx": clientEntry,
  "BulkDispatchDialog.tsx": dialog,
  "dialog-controls.tsx": dialogControls,
  "DialogTargets.tsx": dialogTargets,
  "BehaviorCharacterSelect.tsx": behaviorSelect,
};

// ── 1. Every referenced cardEditor.* locale key exists in the English catalog ──
const referencedKeys = new Set();
for (const source of Object.values(componentSources)) {
  for (const match of source.matchAll(/["'`](cardEditor\.[A-Za-z0-9_.-]+)["'`]/gu)) {
    referencedKeys.add(match[1]);
  }
}
assert.ok(referencedKeys.size > 20, "the dialog should reference a full locale catalog");
for (const key of referencedKeys) {
  assert.equal(typeof catalog[key], "string", `locales/en.json is missing referenced key ${key}`);
  assert.ok(catalog[key].trim(), `locales/en.json key ${key} must not be empty`);
}
// Interpolation variables referenced in code must exist in the catalog string and vice versa.
for (const source of Object.values(componentSources)) {
  for (const match of source.matchAll(/t\("(cardEditor\.[A-Za-z0-9_.-]+)", \{([^}]*)\}\)/gu)) {
    const key = match[1];
    const message = catalog[key];
    assert.equal(typeof message, "string", `missing interpolated key ${key}`);
    const declared = new Set([...message.matchAll(/\{\{([A-Za-z0-9_]+)\}\}/gu)].map((token) => token[1]));
    const passed = new Set([...match[2].matchAll(/([A-Za-z0-9_]+):/gu)].map((variable) => variable[1]));
    for (const variable of passed) {
      assert.ok(declared.has(variable), `${key} does not declare {{${variable}}} in the catalog`);
    }
    for (const variable of declared) {
      assert.ok(passed.has(variable), `${key} declares {{${variable}}} but the call site never passes it`);
    }
  }
}

// ── 2. No hard-coded user-visible text in JSX (beyond aria/role defaults) ──
const ts = await import("typescript");
for (const [name, source] of Object.entries(componentSources)) {
  const ast = ts.default.createSourceFile(
    name,
    source,
    ts.default.ScriptTarget.Latest,
    true,
    ts.default.ScriptKind.TSX,
  );
  const visit = (node) => {
    if (ts.default.isJsxText(node)) {
      const text = node.getText(ast).trim();
      assert.equal(
        /[A-Za-z]/u.test(text),
        false,
        `${name} contains hard-coded user-visible JSX text: ${JSON.stringify(text)}`,
      );
    }
    node.forEachChild(visit);
  };
  visit(ast);
}

// ── 3. session-config re-exports the shared schema's normalizer (mirror deleted) ──
assert.equal(
  normalizeBulkSessionConfig,
  normalizeSessionConfig,
  "session-config.ts must re-export the shared normalizeSessionConfig through the client import path",
);
const sessionConfigSource = read("session-config.ts");
assert.doesNotMatch(
  sessionConfigSource,
  /node:crypto/u,
  "the client config path must stay free of node-only imports (browser bundle)",
);
const sharedSchemaSource = readFileSync(
  new URL("../../../../shared/src/features/agents/card-editor/schema.ts", featureRoot),
  "utf8",
);
assert.doesNotMatch(sharedSchemaSource, /node:crypto/u, "the shared schema must stay browser-safe");
assert.match(sharedSchemaSource, /globalThis\.crypto\.randomUUID\(\)/u, "ids come from globalThis.crypto");
const validConfigs = [
  {},
  {
    mode: "batched",
    batchSize: 99.8,
    connectionId: "connection-1",
    presetId: "custom",
    customTemplate: "Custom prompt",
    globalInstruction: "Polish these cards",
    behaviorCharacterId: "style-1",
    globalLorebookIds: ["lore-1"],
    rebalance: true,
    providerRetries: -2,
    refusalRetries: 12,
    concurrency: 8,
    saveMode: "duplicate",
    duplicateSuffix: " copy",
  },
  { mode: "individual", batchSize: 0, connectionId: null, presetId: "strict" },
  { saveMode: "auto", globalLorebookIds: [], behaviorCharacterId: null },
];
for (const input of validConfigs) {
  assert.deepEqual(
    normalizeBulkSessionConfig(input),
    normalizeSessionConfig(input),
    `client config path drifted from the shared schema for ${JSON.stringify(input)}`,
  );
}
for (const garbage of [
  null,
  [],
  "config",
  { mode: "parallel" },
  { presetId: "unknown" },
  { saveMode: "overwrite" },
  { batchSize: "4" },
  { concurrency: Number.NaN },
  { connectionId: 4 },
  { globalLorebookIds: ["valid", 3] },
  { globalLorebookIds: "lore-1" },
  { rebalance: "yes" },
  { customTemplate: 42 },
]) {
  assert.throws(() => normalizeBulkSessionConfig(garbage), undefined, `config must reject ${JSON.stringify(garbage)}`);
  assert.throws(() => normalizeSessionConfig(garbage), undefined, `schema must reject ${JSON.stringify(garbage)}`);
}

// ── 4. Last-used config persistence: round-trip, corrupt entries ignored ──
assert.equal(BULK_CONFIG_STORAGE_KEY, "cardEditor.bulkConfig");
const memory = new Map();
const storage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, value),
};
const remembered = normalizeBulkSessionConfig({
  mode: "batched",
  batchSize: 8,
  connectionId: "connection-9",
  presetId: "custom",
  customTemplate: "template body",
  globalInstruction: "Keep the voice",
  behaviorCharacterId: "style-3",
  globalLorebookIds: ["lore-2"],
  rebalance: true,
  providerRetries: 1,
  refusalRetries: 0,
  concurrency: 3,
  saveMode: "duplicate",
});
storeBulkConfig(remembered, storage);
assert.deepEqual(loadStoredBulkConfig(storage), remembered);
memory.set(BULK_CONFIG_STORAGE_KEY, "{not json");
assert.equal(loadStoredBulkConfig(storage), null, "corrupt JSON must be ignored");
memory.set(BULK_CONFIG_STORAGE_KEY, JSON.stringify({ mode: "sideways" }));
assert.equal(loadStoredBulkConfig(storage), null, "invalid configs must be ignored");
memory.set(BULK_CONFIG_STORAGE_KEY, JSON.stringify({ batchSize: 99, mode: "batched" }));
assert.equal(loadStoredBulkConfig(storage)?.batchSize, 16, "stored values are clamped on read");
assert.equal(loadStoredBulkConfig(undefined), null, "storage may be unavailable");

// ── 5. Live estimate math: ceil(N / batchSize) vs N ──
assert.deepEqual(estimateBulkCalls(12, 4), { batched: 3, individual: 12 });
assert.deepEqual(estimateBulkCalls(10, 4), { batched: 3, individual: 10 });
assert.deepEqual(estimateBulkCalls(1, 16), { batched: 1, individual: 1 });
assert.deepEqual(estimateBulkCalls(0, 4), { batched: 0, individual: 0 });
assert.deepEqual(estimateBulkCalls(5, 99), { batched: 1, individual: 5 }, "batch size clamps to 16");
assert.deepEqual(estimateBulkCalls(-3, 4), { batched: 0, individual: 0 });

// ── 6. Dialog structure contract (DESIGN §2) ──
assert.match(dialogTargets, /data-ce-section="targets"/u, "missing dialog section targets");
for (const section of ["model", "instructions", "processing", "saving"]) {
  assert.match(dialog, new RegExp(`data-ce-section="${section}"`, "u"), `missing dialog section ${section}`);
}
assert.match(dialog, /role="dialog"/u);
assert.match(dialog, /aria-modal="true"/u);
assert.match(dialog, /aria-label=\{t\("cardEditor\.dialog\.title"\)\}/u);
assert.match(dialogControls, /event\.key === "Escape"/u, "Esc must close the dialog");
assert.match(dialogControls, /event\.key !== "Tab"/u, "the dialog must trap Tab focus");
assert.match(dialogControls, /blockedRef\.current\(\)/u, "Esc stays blocked while a dispatch is in flight");
assert.match(dialogTargets, /data-ce-autofocus/u, "initial focus lands on the first control");
assert.match(dialog, /dispatching \|\| targets\.length === 0/u, "dispatch stays disabled without targets or in flight");
assert.match(dialog, /behaviorOverride: null/u, "per-target None style maps to behaviorOverride null");
assert.match(dialog, /behaviorOverride: target\.style\.id/u, "per-target character style maps to its id");
assert.match(
  dialog,
  /behaviorOverrideCard: behaviorCardMaterial\(/u,
  "per-target character style ships the override card's material (any library character)",
);
assert.match(dialog, /card: target\.card!/u, "dispatch carries the full target card material");
assert.match(dialog, /getHostCharacterCard\(id, controller\.signal\)/u, "target rows load the full card fields");
assert.match(dialog, /getHostLorebookEntries\(id\)/u, "global lorebooks ship their entries with the dispatch");
assert.match(
  dialog,
  /behaviorCharacter: behaviorCardMaterial\(sessionBehaviorCard\)/u,
  "the session-level behavior character ships its card material",
);
assert.match(dialog, /unloadableTargets/u, "cards that failed to load block the dispatch");
assert.match(dialog, /estimateBulkCalls\(targets\.length, batchSize\)/u, "footer estimate must stay live");
assert.match(dialog, /storeBulkConfig\(config/u, "last-used config persists after a successful dispatch");
assert.match(dialog, /loadStoredBulkConfig/u, "last-used config pre-fills the dialog");
assert.match(dialog, /role="alert"/u, "dispatch failures render an inline alert");
assert.match(dialog, /PROMPT_PRESET_TEMPLATES\[presetId\]/u, "Custom prefills from the selected preset body");
assert.match(dialog, /min=\{1\}[\s\S]*?max=\{16\}/u, "batch size range is 1–16");
assert.match(dialog, /cardEditor\.dialog\.processing\.overflowCaption/u, "overflow split caption is required");

// ── 7. Behavior character search-select contract ──
assert.match(behaviorSelect, /role="combobox"/u);
assert.match(behaviorSelect, /role="listbox"/u);
assert.match(behaviorSelect, /role="option"/u);
assert.match(behaviorSelect, /searchHostCharacters\(\{ search, limit: 50, offset: 0 \}\)/u);
assert.match(behaviorSelect, /event\.key === "ArrowDown"/u, "arrow keys must move through options");
assert.match(behaviorSelect, /event\.stopPropagation\(\)/u, "Esc inside the search must not close the dialog");

// ── 8. Host API contract ──
assert.match(api, /hostRequest<LanguageConnection\[\]>\("\/connections"/u);
assert.match(api, /connection\.provider !== "image_generation" &&\s*connection\.provider !== "video_generation"/u);
assert.match(api, /sort: "name-asc"/u);
assert.match(api, /`\/characters\/catalog\?\$\{params\.toString\(\)\}`/u);
assert.match(api, /`\/characters\/\$\{encodeURIComponent\(characterId\)\}`/u);
assert.match(api, /hostRequest<HostLorebook\[\]>\("\/lorebooks"/u);
assert.match(api, /request<BulkSession>\("\/sessions", "POST"/u, "dispatch posts to the session route");

// ── 9. Selection-action entry contract ──
assert.match(clientEntry, /view === "selection-action"/u);
assert.match(clientEntry, /const selectedCharacterIds = props\.selectedCharacterIds \?\? \[\]/u);
assert.match(clientEntry, /selectionCount \?\? selectedCharacterIds\.length/u);
assert.match(clientEntry, /selectionCount >= 1/u, "the button enables with at least one selected character");
assert.match(clientEntry, /disabled=\{!canDispatch\}/u);
assert.match(clientEntry, /cardEditor\.action\.open/u);
assert.match(
  clientEntry,
  /openCardEditorOverlay\(\{ dispatch: \{ characterIds: selectedCharacterIds \} \}\)/u,
  "the launcher opens the overlay workspace with the dispatch prefilled (capabilityApi 1.68)",
);
assert.match(
  clientEntry,
  /props\.onRequestClose\?\.\(\)/u,
  "launching the workspace exits the engine's characters selection mode",
);
assert.match(clientEntry, /<style>\{CARD_EDITOR_STYLES\}<\/style>/u, "scoped styles must be injected");

// ── 9b. Overlay workspace contract (capabilityApi 1.68) ──
const workspaceSource = read("OverlayWorkspace.tsx");
assert.match(workspaceSource, /OVERLAY_EVENT = "marinara:capability-overlay"/u);
assert.match(workspaceSource, /OVERLAY_PACKAGE_ID = "card-editor"/u, "the workspace only answers its own events");
assert.match(workspaceSource, /detail\.action === "close"/u);
assert.match(workspaceSource, /payload\?\.sessionId/u, "{sessionId} deep-links a session");
assert.match(
  workspaceSource,
  /payload\?\.dispatch\?\.characterIds/u,
  "{dispatch:{characterIds}} opens the dispatch prefilled",
);
assert.match(workspaceSource, /if \(!open\) return null/u, "the idle overlay renders nothing");
assert.match(workspaceSource, /role="dialog"/u);
assert.match(workspaceSource, /aria-modal="true"/u);
assert.match(workspaceSource, /event\.key === "Escape"/u, "Escape closes the workspace");
assert.match(workspaceSource, /<BulkDispatchDialog/u);
assert.match(workspaceSource, /setDetailId\(session\.id\)/u, "a dispatched session opens in the workspace");
assert.match(workspaceSource, /splitView/u, "the workspace uses the two-pane panel layout");
assert.match(read("RunsPanel.tsx"), /onDetailIdChange/u, "the panel detail selection is controllable by the workspace");
assert.match(styles, /\.ce-workspace-split/u);
assert.match(styles, /\.ce-dialog\.ce-workspace/u, "the workspace dialog has its own sizing");

// ── 10. Styling contract: scoped classes + engine chrome hooks ──
assert.match(styles, /marinara-capability-card-editor\[view="selection-action"\] \{\s*display: contents;\s*\}/u);
assert.match(styles, /\.ce-overlay \{\s*position: fixed;/u, "overlay stays inside the element's own DOM");
assert.match(styles, /--marinara-chat-chrome-panel-bg/u, "dark theme tokens come from the engine chrome");
assert.match(styles, /prefers-reduced-motion/u);
assert.doesNotMatch(styles, /[^-]pd-|[^-]mn-/u, "styles must use the ce- scope, not another package's");
for (const hook of ["mari-chrome-control", "mari-chrome-field"]) {
  assert.ok(clientEntry.includes(hook) || dialog.includes(hook), `engine chrome hook ${hook} must be used`);
}
assert.match(presets, /PROMPT_PRESET_TEMPLATES/u);
for (const preset of ["standard", "strict", "rebalance"]) {
  assert.match(presets, new RegExp(`${preset}: \``, "u"), `missing ${preset} preset template stub`);
}

// ── 11. Built bundle carries the dialog ──
for (const marker of [
  "Bulk Card Editor",
  "One agent per card",
  "XML, N cards per call",
  "use session style",
  "cardEditor.bulkConfig",
  "marinara-capability-card-editor",
]) {
  assert.ok(builtClient.includes(marker), `built client.js is missing ${JSON.stringify(marker)} — rebuild the package`);
}

process.stdout.write("Card Editor dialog UI regression passed.\n");
