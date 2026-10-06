import assert from "node:assert/strict";

import {
  SchemaError,
  advanceItemStatus,
  migrateSessionDocument,
  newItem,
  newSession,
  normalizeSessionConfig,
  recomputeStats,
  validateCardFieldUpdate,
} from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/schema.ts";
import {
  escapeXml,
  normalizeCardPromptText,
} from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/text.ts";
import {
  buildBehaviorCharacterBlock,
  buildCharacterBlock,
  buildLorebookBlocks,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/context.ts";
import {
  PRESETS,
  assemblePrompt,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/prompts.ts";
import {
  parseBatchResponse,
  parseSingleResponse,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/parse.ts";
import {
  planApply,
  planDuplicateApplied,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/apply.ts";
import {
  REFUSAL_REMINDER,
  STRICT_JSON_REMINDER,
  backoffDelayMs,
  classifyProviderError,
  detectRefusal,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/llm.ts";
import { splitItemIds } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/runner.ts";
import { buildCombinedCardBlocks } from "../packages/card-editor/src/engine/packages/client/src/features/card-editor/apply-ops.ts";

const defaults = normalizeSessionConfig({});
assert.deepEqual(defaults, {
  mode: "individual",
  batchSize: 4,
  connectionId: null,
  presetId: "standard",
  globalInstruction: "",
  behaviorCharacterId: null,
  globalLorebookIds: [],
  rebalance: false,
  providerRetries: 2,
  refusalRetries: 3,
  concurrency: 1,
  saveMode: "confirm",
  duplicateSuffix: " (Edited)",
});
assert.deepEqual(
  normalizeSessionConfig({
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
    duplicatePrefix: "October ",
  }),
  {
    mode: "batched",
    batchSize: 16,
    connectionId: "connection-1",
    presetId: "custom",
    customTemplate: "Custom prompt",
    globalInstruction: "Polish these cards",
    behaviorCharacterId: "style-1",
    globalLorebookIds: ["lore-1"],
    rebalance: true,
    providerRetries: 0,
    refusalRetries: 5,
    concurrency: 4,
    saveMode: "duplicate",
    duplicateSuffix: " copy",
    duplicatePrefix: "October ",
  },
);
assert.deepEqual(normalizeSessionConfig({ saveMode: "combined", combinedCardName: "  October Cast  " }), {
  ...defaults,
  saveMode: "combined",
  combinedCardName: "October Cast",
});
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
  { rebalance: "yes" },
  { duplicateSuffix: "x".repeat(301) },
  { duplicatePrefix: "   " },
  { duplicatePrefix: "x".repeat(301) },
  { combinedCardName: "   " },
  { combinedCardName: "x".repeat(301) },
]) {
  assert.throws(() => normalizeSessionConfig(garbage), SchemaError);
}

const statuses = [
  "queued",
  "running",
  "succeeded",
  "awaiting-review",
  "applied",
  "duplicated",
  "needs-review",
  "rejected",
  "failed-provider",
  "failed-refusal",
  "failed-parse",
  "canceled",
  "interrupted",
];
const graph = new Map([
  ["queued", ["running"]],
  ["running", ["succeeded", "failed-provider", "failed-refusal", "failed-parse"]],
  ["succeeded", ["awaiting-review", "applied", "needs-review", "duplicated"]],
  // Verdict route (two-phase apply): holds demote to needs-review; duplicate-mode approve lands on
  // duplicated; a failed client-side apply-result demotes applied/duplicated back to failed-provider.
  ["awaiting-review", ["applied", "rejected", "needs-review", "duplicated"]],
  ["needs-review", ["applied", "rejected"]],
  ["applied", ["failed-provider"]],
  ["duplicated", ["failed-provider"]],
  ["failed-provider", ["running"]],
  ["failed-refusal", ["running"]],
  ["failed-parse", ["running"]],
]);
for (const from of statuses) {
  for (const to of statuses) {
    const legal = from !== to && (to === "canceled" || to === "interrupted" || graph.get(from)?.includes(to));
    const item = { ...newItem("character-1", "Character One"), status: from };
    if (legal) {
      const advanced = advanceItemStatus(item, to);
      assert.equal(advanced.status, to, `${from} → ${to} should be legal`);
      assert.equal(item.status, from, "status transitions must not mutate the source item");
    } else {
      assert.throws(
        () => advanceItemStatus(item, to),
        (error) => error instanceof SchemaError,
        `${from} → ${to} should be illegal`,
      );
    }
  }
}

const statsSession = {
  ...newSession("Stats", defaults, []),
  items: statuses.map((status, index) => ({ ...newItem(`character-${index}`), status })),
  stats: { total: 999, done: 999, failed: 999 },
};
const withStats = recomputeStats(statsSession);
assert.deepEqual(withStats.stats, { total: statuses.length, done: statuses.length - 2, failed: 3 });
assert.deepEqual(statsSession.stats, { total: 999, done: 999, failed: 999 });

const baseUpdate = {
  characterId: "character-1",
  field: "description",
  oldText: "Old",
  newText: "New",
  reason: "Clearer",
};
const bulkEditableFields = [
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
];
for (const field of bulkEditableFields) {
  const result = validateCardFieldUpdate({ ...baseUpdate, field }, ["character-1"], { rebalance: false });
  assert.equal(result.ok, true, `${field} should be bulk-editable`);
}
for (const field of ["aboutMe", "name", "avatar", "data.extensions.secret"]) {
  const result = validateCardFieldUpdate({ ...baseUpdate, field }, ["character-1"], { rebalance: false });
  assert.equal(result.ok, false, `${field} must not be bulk-editable`);
}
assert.equal(validateCardFieldUpdate({ ...baseUpdate, newText: "" }, ["character-1"], { rebalance: false }).ok, false);
assert.equal(validateCardFieldUpdate({ ...baseUpdate, newText: "" }, ["character-1"], { rebalance: true }).ok, true);
for (const key of ["oldText", "newText"]) {
  assert.equal(
    validateCardFieldUpdate({ ...baseUpdate, [key]: "x".repeat(100_001) }, ["character-1"], {
      rebalance: false,
    }).ok,
    false,
  );
}
assert.equal(validateCardFieldUpdate(baseUpdate, ["character-2"], { rebalance: false }).ok, false);
assert.equal(
  validateCardFieldUpdate({ ...baseUpdate, oldText: null }, ["character-1"], { rebalance: false }).ok,
  false,
);
assert.equal(validateCardFieldUpdate({ ...baseUpdate, reason: null }, ["character-1"], { rebalance: false }).ok, false);
assert.equal(validateCardFieldUpdate(null, ["character-1"], { rebalance: false }).ok, false);
assert.equal(validateCardFieldUpdate(baseUpdate, [{ characterId: "character-1" }], { rebalance: false }).ok, true);

const session = newSession("Bulk edit", defaults, [
  { characterId: "character-1", characterName: "Character One", note: "Keep the voice" },
]);
assert.equal(session.schemaVersion, 1);
assert.equal(session.items.length, 1);
assert.deepEqual(session.items[0].snapshots, {});
assert.equal(migrateSessionDocument(session), session);
for (const garbage of [null, {}, { schemaVersion: 2 }, { ...session, items: null }, { ...session, config: null }]) {
  assert.equal(migrateSessionDocument(garbage), null);
}

const fidelityText = `  A & <tag> 'quote' "double" {{char}} {{user}} {{// remove me}} tail  `;
assert.equal(normalizeCardPromptText(fidelityText), `A & <tag> 'quote' "double" {{char}} {{user}}  tail`);
assert.equal(normalizeCardPromptText(null), "");
assert.equal(escapeXml(`&<>"' {{char}} {{user}}`), "&amp;&lt;&gt;&quot;&apos; {{char}} {{user}}");
const fidelityCard = {
  id: "character<&",
  name: `A & "B"`,
  description: fidelityText,
  personality: "  steady  ",
  scenario: "",
  first_mes: "Hello",
  mes_example: "Example",
  creator_notes: "Notes",
  system_prompt: "System",
  post_history_instructions: "After",
  backstory: "History",
  appearance: "Look",
};
const characterBlock = buildCharacterBlock(fidelityCard, { id: fidelityCard.id });
assert.match(characterBlock, /^<character id="character&lt;&amp;" name="A &amp; &quot;B&quot;">/);
assert.ok(characterBlock.includes("{{char}} {{user}}"), "ordinary macros must remain literal");
assert.ok(!characterBlock.includes("remove me"), "macro comments must be removed");
assert.ok(characterBlock.includes("A &amp; &lt;tag&gt; &apos;quote&apos; &quot;double&quot;"));

const behaviorWithoutSystem = buildBehaviorCharacterBlock({
  name: "Guide",
  description: "Measured",
  personality: "Patient",
  backstory: "Old",
  appearance: "Silver",
  system_prompt: " {{// no system after normalization}} ",
});
assert.ok(behaviorWithoutSystem.includes("Name: Guide"));
assert.ok(behaviorWithoutSystem.includes("guides HOW cards are written"));
assert.ok(!behaviorWithoutSystem.includes("System:"));
const behaviorWithSystem = buildBehaviorCharacterBlock({
  name: "Guide",
  description: "Measured",
  personality: "Patient",
  backstory: "Old",
  appearance: "Silver",
  system_prompt: "Be exact",
});
assert.ok(behaviorWithSystem.includes("System: Be exact"));

// Byte-parity with the engine's buildBehaviorCharacterBlock (SPEC AC3): the engine regression
// card-editor-behavior-character.regression.ts pins this exact output for the pre-normalized
// fixture; the package must produce the same bytes from the raw stored card fields (snake_case,
// un-normalized). The expectation is constructed independently, mirroring the engine regression.
const ENGINE_BEHAVIOR_INSTRUCTION =
  "Adopt this character's behavior, judgment, and writing style when editing — it guides HOW cards are written; the directive and user notes govern WHAT changes.";
const behaviorFixture = {
  name: `Seraphina "Sage" & Co`,
  description: `  Calm, precise & kind — with <tags> and 'quotes'  `,
  personality: `  Wry 'mentor' energy  `,
  backstory: `  Raised by "scholars" & travelers  `,
  appearance: `  Wears <silver>  `,
  system_prompt: `  Always speak plainly & kindly  `,
};
const normalizedFixture = {
  name: behaviorFixture.name,
  description: normalizeCardPromptText(behaviorFixture.description),
  personality: normalizeCardPromptText(behaviorFixture.personality),
  backstory: normalizeCardPromptText(behaviorFixture.backstory),
  appearance: normalizeCardPromptText(behaviorFixture.appearance),
  systemPrompt: normalizeCardPromptText(behaviorFixture.system_prompt),
};
assert.deepEqual(
  buildBehaviorCharacterBlock(behaviorFixture),
  [
    "<behavior_character>",
    `Name: ${escapeXml(normalizedFixture.name)}`,
    `Description: ${escapeXml(normalizedFixture.description)}`,
    `Personality: ${escapeXml(normalizedFixture.personality)}`,
    `Backstory: ${escapeXml(normalizedFixture.backstory)}`,
    `Appearance: ${escapeXml(normalizedFixture.appearance)}`,
    `System: ${escapeXml(normalizedFixture.systemPrompt)}`,
    "</behavior_character>",
    ENGINE_BEHAVIOR_INSTRUCTION,
  ].join("\n"),
  "package behavior block must be byte-identical to the engine's pinned format",
);
assert.equal(buildBehaviorCharacterBlock({}), "", "empty behavior character must produce no block");
assert.equal(
  buildBehaviorCharacterBlock({ name: "   ", description: "" }),
  "",
  "whitespace-only fields must produce no block",
);

const perEntryLore = buildLorebookBlocks([
  {
    name: `Book & "One"`,
    entries: [
      { name: "Disabled", content: "hidden", enabled: false },
      { name: "Long", content: "x".repeat(4_500), enabled: true },
      { name: "Second", content: "second", enabled: true },
    ],
  },
]);
assert.ok(perEntryLore.includes('<lorebook name="Book &amp; &quot;One&quot;">'));
assert.ok(perEntryLore.includes("[…truncated]"));
assert.ok(!perEntryLore.includes("hidden"));
const longLore = buildLorebookBlocks([
  {
    name: "Large",
    entries: Array.from({ length: 10 }, (_, index) => ({
      name: `Entry ${index}`,
      content: String(index).repeat(4_500),
      enabled: true,
    })),
  },
]);
const longLoreBodies = [...longLore.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/g)].map((match) => match[1]);
assert.ok(
  longLoreBodies.every((body) => body.length <= 4_000),
  "each lorebook entry must be capped",
);
assert.ok(
  longLoreBodies.reduce((total, body) => total + body.length, 0) <= 24_000,
  "lorebook entry content must respect the total cap",
);
assert.deepEqual(
  longLoreBodies.map((body) => body[0]),
  ["0", "1", "2", "3", "4", "5"],
  "lorebook truncation must preserve stable input order",
);

assert.deepEqual(
  PRESETS.map(({ id, label }) => ({ id, label })),
  [
    { id: "standard", label: "Standard rewrite" },
    { id: "strict", label: "Strict surgical" },
    { id: "rebalance", label: "Field rebalancing" },
    { id: "xml-simple", label: "XML · Simple" },
    { id: "xml-complex", label: "XML · Complex" },
  ],
);
const assembled = assemblePrompt({
  preset: "standard",
  globalInstruction: "Global first",
  targets: [
    { characterId: "opaque-1", card: fidelityCard, userNote: "Per-card second", behaviorCharacter: fidelityCard },
    { characterId: "opaque-2", card: { ...fidelityCard, name: "Second" } },
  ],
  lorebooks: [{ name: "Reference", entries: [{ name: "Fact", content: "Canon", enabled: true }] }],
  rebalance: true,
});
assert.ok(assembled.system.includes("strict JSON object keyed by each exact character id"));
assert.ok(assembled.system.includes("Global first"));
assert.ok(assembled.system.includes("<lorebook"));
assert.ok(assembled.user.includes('<character id="opaque-1"'));
assert.ok(assembled.user.includes("<user_note>Per-card second</user_note>"));
assert.ok(assembled.user.includes("<behavior_character>"));
assert.ok(assembled.user.indexOf("Per-card second") < assembled.user.indexOf("Description = general identity"));
assert.ok(assembled.user.includes('<character_ref id="opaque-1" name="A &amp; &quot;B&quot;" />'));
const assembledSingle = assemblePrompt({
  preset: "strict",
  globalInstruction: "",
  targets: [{ characterId: "opaque-1", card: fidelityCard }],
  lorebooks: [],
  rebalance: false,
});
assert.ok(assembledSingle.system.includes('{"updates"'));
assert.ok(!assembledSingle.system.includes("keyed by each exact character id"));

// A session-level behavior character is inherited by targets without an override; an explicit
// null override suppresses the block for that card (SPEC F2.2: None = no block).
const assembledInherited = assemblePrompt({
  preset: "standard",
  globalInstruction: "",
  targets: [
    { characterId: "inherit-1", card: fidelityCard },
    { characterId: "none-1", card: fidelityCard, behaviorCharacter: null },
  ],
  lorebooks: [],
  behaviorCharacter: { name: "Session Guide", description: "Calm" },
  rebalance: false,
});
assert.equal(assembledInherited.user.match(/<behavior_character>/g)?.length, 1);
assert.ok(
  assembledInherited.user.indexOf('<character id="inherit-1"') <
    assembledInherited.user.indexOf("<behavior_character>"),
);
assert.ok(
  assembledInherited.user.indexOf("<behavior_character>") < assembledInherited.user.indexOf('<character id="none-1"'),
  "the explicit-None target must not receive the session behavior block",
);

// Custom preset: the user's template replaces the base; the mode's response contract is still appended.
const assembledCustom = assemblePrompt({
  preset: "custom",
  customTemplate: "My custom editing contract.",
  globalInstruction: "",
  targets: [{ characterId: "opaque-1", card: fidelityCard }],
  lorebooks: [],
  rebalance: false,
});
assert.ok(assembledCustom.system.startsWith("My custom editing contract."));
assert.ok(assembledCustom.system.includes('{"updates"'));
assert.throws(
  () =>
    assemblePrompt({
      preset: "custom",
      globalInstruction: "",
      targets: [{ characterId: "opaque-1", card: fidelityCard }],
      lorebooks: [],
      rebalance: false,
    }),
  SchemaError,
  "custom preset without a template is a config error",
);

const validDescriptionUpdate = {
  field: "description",
  oldText: "Old",
  newText: "New",
  reason: "Clearer",
};
const parsedBatch = parseBatchResponse(
  `preface\n\`\`\`json\n${JSON.stringify({
    "character-1": {
      updates: [
        validDescriptionUpdate,
        { ...validDescriptionUpdate, field: "name" },
        { ...validDescriptionUpdate, newText: 7 },
      ],
    },
    "unknown-character": { updates: [validDescriptionUpdate] },
  })}\n\`\`\`\nafter`,
  ["character-1"],
  { rebalance: false },
);
assert.equal(parsedBatch.ok, true);
assert.deepEqual(parsedBatch.results.get("character-1"), [validDescriptionUpdate]);
assert.equal(parsedBatch.dropped.length, 3);
assert.ok(parsedBatch.dropped.some((drop) => drop.characterId === "unknown-character"));
assert.ok(parsedBatch.dropped.some((drop) => drop.field === "name"));
assert.equal(parsedBatch.results.get("character-1")?.[0]?.characterId, undefined);

// Malformed per-character entries drop with a reason and stay out of results so the runner
// re-runs those cards individually; a wholly unparseable response is a parse error.
const malformedBatch = parseBatchResponse(
  JSON.stringify({
    "character-1": { updates: [validDescriptionUpdate] },
    "character-2": { updates: "not-an-array" },
    "character-3": "garbage",
  }),
  ["character-1", "character-2", "character-3"],
  { rebalance: false },
);
assert.equal(malformedBatch.ok, true);
assert.deepEqual(malformedBatch.results.get("character-1"), [validDescriptionUpdate]);
assert.equal(malformedBatch.results.has("character-2"), false);
assert.equal(malformedBatch.results.has("character-3"), false);
assert.equal(malformedBatch.dropped.length, 2);
const unparseableBatch = parseBatchResponse("total garbage, no braces", ["character-1"], { rebalance: false });
assert.equal(unparseableBatch.ok, false);
assert.ok(unparseableBatch.parseError);
assert.equal(unparseableBatch.results.size, 0);
// A character the model answered with an empty updates array is a valid no-op success (edge matrix).
const noOpBatch = parseBatchResponse(JSON.stringify({ "character-1": { updates: [] } }), ["character-1"], {
  rebalance: false,
});
assert.equal(noOpBatch.ok, true);
assert.deepEqual(noOpBatch.results.get("character-1"), []);
assert.deepEqual(noOpBatch.dropped, []);

const parsedSingle = parseSingleResponse(JSON.stringify({ updates: [validDescriptionUpdate] }), "character-1", {
  rebalance: false,
});
assert.equal(parsedSingle.ok, true);
assert.deepEqual(parsedSingle.results.get("character-1"), [validDescriptionUpdate]);
assert.equal(parseSingleResponse("not json", "character-1", { rebalance: false }).ok, false);
const emptyUpdate = { ...validDescriptionUpdate, field: "backstory", newText: "" };
assert.equal(
  parseSingleResponse(JSON.stringify({ updates: [emptyUpdate] }), "character-1", { rebalance: false }).results.get(
    "character-1",
  )?.length,
  0,
);
assert.deepEqual(
  parseSingleResponse(JSON.stringify({ updates: [emptyUpdate] }), "character-1", { rebalance: true }).results.get(
    "character-1",
  ),
  [emptyUpdate],
);

// SessionItem is the frozen schema shape: label lives on the session, duplicateSuffix on the
// session config, so both reach planApply through opts — never through the item.
const applyItem = {
  ...newItem("character-1", "Character One"),
  snapshots: { description: "Old", personality: "Original" },
  updates: [
    validDescriptionUpdate,
    { field: "personality", oldText: "Original", newText: "Changed", reason: "Sharper" },
  ],
};
const applyOptions = { label: "October cleanup", duplicateSuffix: " (Edited)" };
assert.deepEqual(
  planApply(
    applyItem,
    { description: " Old ", personality: "Edited elsewhere" },
    {
      force: false,
      saveMode: "confirm",
      ...applyOptions,
    },
  ),
  [
    {
      op: "patchField",
      characterId: "character-1",
      field: "description",
      newText: "New",
      versionSource: "agent",
      versionReason: "Card Editor bulk: October cleanup",
    },
    { op: "hold", characterId: "character-1", field: "personality", reason: "field changed since dispatch" },
  ],
);
assert.deepEqual(
  planApply(
    applyItem,
    { description: "Old", personality: "Edited elsewhere" },
    {
      force: true,
      includeFields: ["personality"],
      saveMode: "auto",
      ...applyOptions,
    },
  ),
  [
    {
      op: "patchField",
      characterId: "character-1",
      field: "personality",
      newText: "Changed",
      versionSource: "agent",
      versionReason: "Card Editor bulk: October cleanup",
    },
  ],
);
assert.deepEqual(planApply(applyItem, {}, { force: false, saveMode: "duplicate", ...applyOptions }), [
  {
    op: "duplicateThenPatch",
    characterId: "character-1",
    fields: { description: "New", personality: "Changed" },
    nameSuffix: " (Edited)",
  },
]);
assert.deepEqual(
  planApply(
    applyItem,
    {},
    {
      force: false,
      saveMode: "duplicate",
      duplicatePrefix: "October ",
      ...applyOptions,
    },
  ),
  [
    {
      op: "duplicateThenPatch",
      characterId: "character-1",
      fields: { description: "New", personality: "Changed" },
      namePrefix: "October ",
    },
  ],
  "a non-empty prefix wins over the legacy suffix",
);
assert.deepEqual(
  planApply(
    applyItem,
    {},
    {
      force: false,
      saveMode: "combined",
      combinedCardName: "October Cast",
      ...applyOptions,
    },
  ),
  [
    {
      op: "collectForCombine",
      characterId: "character-1",
      fields: { description: "New", personality: "Changed" },
    },
  ],
);
assert.throws(
  () => planApply(applyItem, {}, { force: false, saveMode: "combined", ...applyOptions }),
  SchemaError,
  "combined planning requires the combined card name",
);
assert.deepEqual(
  planApply(
    applyItem,
    { description: "Old", personality: "Original" },
    {
      force: false,
      includeFields: [],
      saveMode: "confirm",
      ...applyOptions,
    },
  ),
  [],
);
// Macro comments and surrounding whitespace are prompt-normalization artifacts, not user edits:
// the current field normalizes back to the snapshot, so the row is fresh (SPEC F1 false-positive fix).
assert.deepEqual(
  planApply(
    applyItem,
    { description: "  Old {{// tidy}} ", personality: "Original" },
    {
      force: false,
      includeFields: ["description"],
      saveMode: "auto",
      ...applyOptions,
    },
  ),
  [
    {
      op: "patchField",
      characterId: "character-1",
      field: "description",
      newText: "New",
      versionSource: "agent",
      versionReason: "Card Editor bulk: October cleanup",
    },
  ],
);
// Duplicate mode copies the current card, so includeFields filters the copy's patch and stale checks never apply.
assert.deepEqual(
  planApply(
    applyItem,
    { description: "Changed elsewhere" },
    {
      force: false,
      includeFields: ["personality"],
      saveMode: "duplicate",
      ...applyOptions,
    },
  ),
  [
    {
      op: "duplicateThenPatch",
      characterId: "character-1",
      fields: { personality: "Changed" },
      nameSuffix: " (Edited)",
    },
  ],
);
assert.deepEqual(
  planApply({ ...newItem("character-9", "Quiet") }, {}, { force: false, saveMode: "confirm", ...applyOptions }),
  [],
  "an item without updates produces no operations",
);

// ---------------------------------------------------------------------------
// llm.ts — provider error classification (ARCH §4)

const httpError = (status, message = "Request failed") =>
  Object.assign(new Error(message), { status, name: "LLMHttpError" });
assert.equal(classifyProviderError(httpError(400, "Request failed (400): context_length_exceeded")), "overflow");
assert.equal(classifyProviderError(httpError(400, "This model's maximum context length is 4096 tokens")), "overflow");
assert.equal(classifyProviderError(httpError(400, "too many tokens in prompt")), "overflow");
assert.equal(
  classifyProviderError(httpError(400, "MAXIMUM CONTEXT reached")),
  "overflow",
  "matching is case-insensitive",
);
assert.equal(classifyProviderError(Object.assign(new Error("bad"), { code: "CONTEXT_LENGTH_EXCEEDED" })), "overflow");
assert.equal(classifyProviderError(httpError(400, "Invalid request body")), "fatal", "plain 400 is not overflow");
assert.equal(classifyProviderError(httpError(401)), "fatal");
assert.equal(classifyProviderError(httpError(403)), "fatal");
assert.equal(classifyProviderError(httpError(404)), "fatal");
assert.equal(classifyProviderError(httpError(429)), "retryable-provider");
assert.equal(classifyProviderError(httpError(500)), "retryable-provider");
assert.equal(classifyProviderError(httpError(503)), "retryable-provider");
assert.equal(classifyProviderError(Object.assign(new Error("x"), { statusCode: 502 })), "retryable-provider");
assert.equal(classifyProviderError(new TypeError("fetch failed")), "retryable-provider", "network error");
assert.equal(classifyProviderError(new DOMException("The operation timed out", "TimeoutError")), "retryable-provider");
assert.equal(classifyProviderError("weird string failure"), "retryable-provider");

// detectRefusal: no parseable updates AND (short OR marker); parseable updates always win.
assert.equal(detectRefusal("Sure.", false), true, "short non-committal output");
assert.equal(detectRefusal("Sure.", true), false, "parseable updates override shortness");
assert.equal(detectRefusal(`{"updates":[]}`, true), false, "a valid no-op is never a refusal");
for (const marker of [
  "I can't do that",
  "I cannot comply",
  "As an AI language model",
  "I'm sorry, but",
  "I won't help",
]) {
  const long = `${marker}. ${"padding ".repeat(80)}`;
  assert.ok(long.length >= 400);
  assert.equal(detectRefusal(long, false), true, `marker: ${marker}`);
  assert.equal(detectRefusal(long.toUpperCase(), false), true, "markers are case-insensitive");
}
assert.equal(
  detectRefusal(`This has an AI flavor. ${"padding ".repeat(80)}`, false),
  false,
  "word-bounded: 'has an AI'",
);
assert.equal(detectRefusal(`I cant help. ${"padding ".repeat(80)}`, false), false, "word-bounded: 'cant'");
assert.equal(detectRefusal(`Long prose without any marker. ${"padding ".repeat(80)}`, false), false);
assert.ok(
  REFUSAL_REMINDER.length > 20 && STRICT_JSON_REMINDER.length > 20 && REFUSAL_REMINDER !== STRICT_JSON_REMINDER,
);

// backoffDelayMs: 1s·2^n with ±25% jitter, capped at 30s.
assert.equal(
  backoffDelayMs(0, () => 0),
  750,
);
assert.equal(
  backoffDelayMs(0, () => 1),
  1250,
);
assert.equal(
  backoffDelayMs(1, () => 0),
  1500,
);
assert.equal(
  backoffDelayMs(2, () => 0),
  3000,
);
assert.equal(
  backoffDelayMs(3, () => 0),
  6000,
);
assert.equal(
  backoffDelayMs(4, () => 0),
  12000,
);
assert.equal(
  backoffDelayMs(5, () => 0),
  22500,
  "base caps at 30s before jitter",
);
assert.equal(
  backoffDelayMs(5, () => 1),
  30000,
  "total caps at 30s",
);
assert.equal(
  backoffDelayMs(99, () => 0.5),
  30000,
);
for (let index = 0; index < 7; index += 1) {
  const value = backoffDelayMs(index, () => Math.random());
  assert.ok(value >= 750 && value <= 30_000, `delay in range for retry ${index}`);
}

// splitItemIds: ⌈n/2⌉ first half; the overflow recursion floors at single-card calls.
assert.deepEqual(splitItemIds(["a", "b", "c", "d", "e"]), [
  ["a", "b", "c"],
  ["d", "e"],
]);
assert.deepEqual(splitItemIds(["a", "b", "c", "d"]), [
  ["a", "b"],
  ["c", "d"],
]);
assert.deepEqual(splitItemIds(["a", "b"]), [["a"], ["b"]]);
assert.deepEqual(splitItemIds(["a"]), [["a"], []], "a single card never splits further");
// Recursion trace for a 7-card batch: 7 → 4+3 → 2+2 / 2+1 → singles.
const trace = [7];
let sizes = [7];
while (sizes.some((size) => size > 1)) {
  sizes = sizes
    .flatMap((size) =>
      splitItemIds(Array.from({ length: size }, (_, index) => `${size}:${index}`)).map((half) => half.length),
    )
    .filter((size) => size > 0);
  trace.push(...sizes);
}
assert.deepEqual(trace, [7, 4, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]);

// migrateSessionDocument tolerates the runner's additive item fields (autoApply hint, pendingOps stash).
const hintSession = newSession("Hints", defaults, [{ characterId: "character-1", characterName: "One" }]);
const hinted = {
  ...hintSession,
  items: hintSession.items.map((item) => ({
    ...item,
    autoApply: true,
    pendingOps: [{ op: "patchField", characterId: "character-1", field: "description", newText: "x" }],
  })),
};
assert.equal(migrateSessionDocument(hinted), hinted, "autoApply/pendingOps must round-trip");
const badHinted = {
  ...hintSession,
  items: hintSession.items.map((item) => ({ ...item, autoApply: "yes" })),
};
assert.equal(migrateSessionDocument(badHinted), null, "a non-boolean autoApply is rejected");
const badOps = {
  ...hintSession,
  items: hintSession.items.map((item) => ({ ...item, pendingOps: "not-an-array" })),
};
assert.equal(migrateSessionDocument(badOps), null, "a non-array pendingOps is rejected");

// ── combined save mode ──
assert.throws(
  () => normalizeSessionConfig({ saveMode: "combined" }),
  SchemaError,
  "combined save mode requires a combinedCardName",
);
assert.equal(normalizeSessionConfig({ saveMode: "combined", combinedCardName: "October Cast" }).saveMode, "combined");

// buildCombinedCardBlocks: collected (applied) items in session order; empty/missing blocks skip.
const combineItem = (status, description) => ({
  ...newItem(`character-${Math.random().toString(36).slice(2, 8)}`, "Name"),
  status,
  ...(description === null ? {} : { updates: [{ ...validDescriptionUpdate, newText: description }] }),
});
assert.deepEqual(
  buildCombinedCardBlocks([
    combineItem("applied", "<card>one</card>"),
    combineItem("awaiting-review", "<card>two</card>"),
    combineItem("applied", "<card>three</card>"),
    combineItem("applied", null),
    combineItem("applied", "   "),
  ]),
  ["<card>one</card>", "<card>three</card>"],
  "only applied items with non-blank description blocks contribute, in session order",
);

// ── planDuplicateApplied (SPEC 2026-10-06 P1): one duplicateThenPatch per applied item with ──
// ── updates and no result card; everything else self-excludes ──
const dupAppliedSession = newSession("October cleanup", { saveMode: "confirm" }, [
  { characterId: "character-1", characterName: "Character One" },
  { characterId: "character-2", characterName: "Character Two" },
  { characterId: "character-3", characterName: "Character Three" },
  { characterId: "character-4", characterName: "Character Four" },
  { characterId: "character-5", characterName: "Character Five" },
]);
dupAppliedSession.items[0] = { ...dupAppliedSession.items[0], status: "applied", updates: [validDescriptionUpdate] };
// Applied but already has a result card (post-combine or previously duplicated) — self-excludes.
dupAppliedSession.items[1] = {
  ...dupAppliedSession.items[1],
  status: "applied",
  updates: [validDescriptionUpdate],
  resultCardId: "combined-1",
};
dupAppliedSession.items[2] = { ...dupAppliedSession.items[2], status: "applied" };
dupAppliedSession.items[3] = {
  ...dupAppliedSession.items[3],
  status: "duplicated",
  updates: [validDescriptionUpdate],
  resultCardId: "clone-3",
};
dupAppliedSession.items[4] = {
  ...dupAppliedSession.items[4],
  status: "awaiting-review",
  updates: [validDescriptionUpdate],
};
assert.deepEqual(planDuplicateApplied(dupAppliedSession), [
  {
    itemId: dupAppliedSession.items[0].itemId,
    ops: [
      {
        op: "duplicateThenPatch",
        characterId: "character-1",
        fields: { description: "New" },
        nameSuffix: " (Edited)",
      },
    ],
  },
]);
// The session's duplicate prefix config wins over the suffix, same as verdict-route planning.
const dupAppliedPrefixSession = newSession("October cleanup", { saveMode: "confirm", duplicatePrefix: "October " }, [
  { characterId: "character-1", characterName: "Character One" },
]);
dupAppliedPrefixSession.items[0] = {
  ...dupAppliedPrefixSession.items[0],
  status: "applied",
  updates: [validDescriptionUpdate],
};
assert.deepEqual(planDuplicateApplied(dupAppliedPrefixSession), [
  {
    itemId: dupAppliedPrefixSession.items[0].itemId,
    ops: [
      {
        op: "duplicateThenPatch",
        characterId: "character-1",
        fields: { description: "New" },
        namePrefix: "October ",
      },
    ],
  },
]);
// No eligible items → no plans (the route answers { plans: [] }, not an error).
assert.deepEqual(planDuplicateApplied(newSession("Empty", { saveMode: "confirm" }, [])), []);
assert.deepEqual(
  planDuplicateApplied({ ...dupAppliedSession, items: [dupAppliedSession.items[1], dupAppliedSession.items[2]] }),
  [],
);

process.stdout.write("Card Editor bulk services regression passed.\n");
