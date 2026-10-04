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
  },
);
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
  ["awaiting-review", ["applied", "rejected"]],
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

process.stdout.write("Card Editor bulk schema regression passed.\n");
