import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageRoot = new URL("../packages/lorebook-editor/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", packageRoot), "utf8"));
const agents = JSON.parse(await readFile(new URL("agents.json", packageRoot), "utf8"));
const editor = agents.find((agent) => agent.id === "lorebook-editor");

assert.equal(manifest.id, "lorebook-editor");
assert.equal(manifest.version, "1.0.1");
assert.deepEqual(manifest.kind, ["agent"]);
assert.deepEqual(manifest.entrypoints, { agents: "agents.json" });
assert.deepEqual(manifest.engine, { min: "2.3.0", maxExclusive: "4.0.0" });
assert.deepEqual(manifest.permissions, ["agent-runtime", "chat-read", "prompt-context", "storage", "ui"]);
assert.equal(manifest.restartRequired, false);

assert.ok(editor, "Lorebook Editor definition must exist");
assert.equal(editor.name, "Lorebook Editor");
assert.equal(editor.phase, "post_processing");
assert.equal(editor.enabledByDefault, false);
assert.equal(editor.category, "misc");
assert.deepEqual(editor.defaultTools, ["search_lorebook"]);
assert.equal(editor.runInterval, 8);
assert.deepEqual(editor.defaultSettings, {
  resultType: "lorebook_update",
  runInterval: 0,
  contextSources: {
    chatHistory: true,
    characters: true,
    persona: false,
    activatedLorebookEntries: false,
    chatSummary: false,
    authorNotes: false,
    trackerData: false,
    recalledMemories: false,
    previousOutput: false,
  },
});

const prompt = editor.defaultPromptTemplate;
assert.match(prompt, /<directive>/u);
assert.match(prompt, /<writable_lorebooks> contains exactly the target lorebook/iu);
assert.match(prompt, /<existing_entries> contains its entries/iu);
assert.match(prompt, /exact listed name/iu);
assert.match(prompt, /never (?:modify|touch) locked entries/iu);
assert.match(prompt, /<character_cards>/u);
assert.match(prompt, /<lore><characters>/u);
assert.match(prompt, /search_lorebook/u);
assert.match(prompt, /"updates"/u);
assert.match(prompt, /"action": "create\|update\|delete"/u);
assert.match(prompt, /"targetLorebook"/u);
assert.match(prompt, /"bookDescription"/u);
for (const field of ["entryName", "description", "content", "newFacts", "keys", "tag", "order", "reason"]) {
  assert.match(prompt, new RegExp(`"${field}"`, "u"));
}
assert.match(prompt, /fill only empty or missing descriptions/iu);
assert.match(prompt, /never rewrite an existing non-empty description/iu);

const backfillTemplate = editor.promptTemplates?.find((template) => template.id === "backfill-descriptions");
assert.ok(backfillTemplate, "Lorebook Editor must provide the backfill-descriptions preset");
assert.equal(backfillTemplate.name, "Backfill descriptions");
assert.match(backfillTemplate.promptTemplate, /descriptions only .* description is empty or missing/iu);
assert.match(backfillTemplate.promptTemplate, /"bookDescription"/u);
assert.match(backfillTemplate.promptTemplate, /"description"/u);
assert.match(backfillTemplate.promptTemplate, /never rewrite.*non-empty description/iu);

for (const chatOnlyReference of [
  "<chat_summary>",
  "<decisions>",
  "<recent_messages>",
  "<assistant_response>",
  "latest assistant response",
  "recent roleplay",
]) {
  assert.equal(
    prompt.toLowerCase().includes(chatOnlyReference),
    false,
    `Lorebook Editor prompt must not rely on chat-only section ${chatOnlyReference}`,
  );
}

process.stdout.write("Lorebook Editor routing regression passed.\n");
