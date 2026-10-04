import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageRoot = new URL("../packages/card-editor/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", packageRoot), "utf8"));
const agents = JSON.parse(await readFile(new URL("agents.json", packageRoot), "utf8"));
const editor = agents.find((agent) => agent.id === "card-editor");

assert.equal(manifest.schemaVersion, 2);
assert.deepEqual(manifest.capabilityApi, { major: 1, minor: 66 });
assert.equal(manifest.builtAgainst.engineVersion, "2.4.6");
assert.equal(manifest.id, "card-editor");
assert.equal(manifest.version, "1.0.0");
assert.deepEqual(manifest.kind, ["agent"]);
assert.deepEqual(manifest.entrypoints, {
  agents: "agents.json",
  server: "server.mjs",
  client: "client.js",
});
assert.deepEqual(manifest.engine, { min: "2.4.6", maxExclusive: "4.0.0" });
assert.deepEqual(manifest.permissions, ["agent-runtime", "chat-read", "prompt-context", "routes", "storage", "ui"]);
assert.equal(manifest.contributions, undefined);
assert.equal(manifest.restartRequired, true);

assert.ok(editor, "Card Editor definition must exist");
assert.equal(editor.name, "Card Editor");
assert.equal(editor.phase, "post_processing");
assert.equal(editor.enabledByDefault, false);
assert.equal(editor.category, "writer");
assert.deepEqual(editor.defaultTools, ["search_lorebook"]);
assert.equal(editor.runInterval, 8);
assert.deepEqual(editor.defaultSettings, {
  resultType: "character_card_update",
  runInterval: 0,
  contextSources: {
    chatHistory: true,
    characters: true,
    persona: false,
    activatedLorebookEntries: true,
    chatSummary: false,
    authorNotes: false,
    trackerData: false,
    recalledMemories: false,
    previousOutput: false,
  },
});

const prompt = editor.defaultPromptTemplate;
assert.match(prompt, /<directive>/u);
assert.match(prompt, /target character card in <character_cards>/iu);
assert.match(prompt, /<activated_lorebook_context>/u);
assert.match(prompt, /<existing_entries>/u);
assert.match(prompt, /search_lorebook/u);
assert.match(prompt, /exact characterId/u);
assert.match(prompt, /exact oldText copied verbatim from <character_cards>/u);
assert.match(prompt, /Keep newText surgical and preserve the field's voice/u);
assert.match(prompt, /These edits require user approval\. False positives are worse than missed changes\./u);
assert.match(prompt, /"updates"/u);
assert.match(prompt, /"action": "update"/u);
assert.doesNotMatch(prompt, /"action": "(?:create|delete)"/u);
for (const chatOnlyReference of [
  "<chat_summary>",
  "<decisions>",
  "<recent_messages>",
  "<assistant_response>",
  "recent roleplay",
]) {
  assert.equal(
    prompt.toLowerCase().includes(chatOnlyReference),
    false,
    `Card Editor prompt must not rely on chat-only section ${chatOnlyReference}`,
  );
}

process.stdout.write("Card Editor routing regression passed.\n");
