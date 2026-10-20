/**
 * Card Editor transform regression: schema model (text form, rendering, JSON Schema), the transform
 * envelope, split review (accept / retry as one), merge mode, batching with splits, Phase 2 and the
 * structured-output pass-through. Drives the real runner against an in-memory document store and a
 * scripted language model. Runs under plain Node type-stripping (".ts" import specifiers).
 */
import assert from "node:assert/strict";

import {
  BUILT_IN_SCHEMAS,
  parseSchemaText,
  promptSkeleton,
  renderCharacterFields,
  serializeSchemaText,
  transformResponseJsonSchema,
  validateSchemaData,
} from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/card-schema.ts";
import {
  newSession,
  normalizeSessionConfig,
} from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/schema.ts";
import { planApply } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/apply.ts";
import {
  decideSplitRun,
  startPhase2Run,
  startRunner,
  stopAllRunners,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/runner.ts";
import { createSessionStore } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/session-store.ts";
import { SINGLE_CARD_RULE } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/transform.ts";

const [SIMPLE, COMPLEX] = BUILT_IN_SCHEMAS;

// ── 1. Schema model ──────────────────────────────────────────────────────────────────────────
{
  for (const schema of BUILT_IN_SCHEMAS) {
    const again = parseSchemaText(serializeSchemaText(schema.root));
    assert.ok(again.ok, `${schema.id} text form re-parses`);
    assert.deepEqual(again.root, schema.root, `${schema.id} text form round-trips`);
  }
  const genitals = COMPLEX.root.children.find((node) => node.key === "physiology").children[0];
  assert.deepEqual(
    genitals.attributes.find((a) => a.name === "kind"),
    {
      name: "kind",
      values: ["human", "canine", "equine", "avian", "reptilian"],
      open: true,
    },
  );
  assert.match(COMPLEX.root.hint, /all freeform text/, "a comment before the root becomes the root hint");

  const broken = parseSchemaText("<a>\n  <b></c>\n</a>");
  assert.equal(broken.ok, false);
  assert.equal(broken.errors[0].line, 2, "errors carry the line number");
  assert.equal(parseSchemaText('<a><b target="nope"></b></a>').ok, false, "unknown target field is rejected");
  assert.equal(parseSchemaText('<a><b><c target="personality"></c></b></a>').ok, false, "target only on top level");

  const targeted = parseSchemaText(
    '<character-name><summary max="20"></summary><mood target="personality"></mood><tags target="scenario" kind="a | b"></tags></character-name>',
  );
  assert.ok(targeted.ok);
  const schema = { id: "t", name: "T", root: targeted.root };
  const fields = renderCharacterFields(
    schema,
    "Mara Voss",
    { summary: "Fiddler.", mood: "Blunt", tags: { kind: "a", text: "x" } },
    "xml",
  );
  assert.equal(fields.description, "<mara-voss>\n  <summary>Fiddler.</summary>\n</mara-voss>");
  assert.equal(fields.personality, "Blunt", "a lone plain leaf lands as raw text in its target");
  assert.equal(fields.scenario, '<mara-voss>\n  <tags kind="a">x</tags>\n</mara-voss>');
  assert.match(
    renderCharacterFields(schema, "Mara", { summary: "S" }, "markdown").description,
    /^# Mara\n\n## Summary\nS$/,
  );
  assert.deepEqual(JSON.parse(renderCharacterFields(schema, "Mara", { summary: "S" }, "json").description), {
    name: "Mara",
    summary: "S",
  });
  assert.deepEqual(validateSchemaData(schema, { summary: "x".repeat(25), mood: "", tags: { kind: "c", text: "" } }), [
    "character-name.summary: 25 of 20 characters",
    'character-name.tags@kind: "c" is not one of a, b',
  ]);
  assert.match(promptSkeleton(SIMPLE, "xml"), /Replace the <character-name> root tag/);

  // Strict structured output: every object closes and requires all of its keys.
  const strictOk = (node) => {
    if (node?.type === "object" && node.properties) {
      assert.equal(node.additionalProperties, false);
      assert.deepEqual([...node.required].sort(), Object.keys(node.properties).sort());
      Object.values(node.properties).forEach(strictOk);
    }
    if (node?.items) strictOk(node.items);
  };
  strictOk(transformResponseJsonSchema(COMPLEX, "structured"));
  strictOk(transformResponseJsonSchema(COMPLEX, "document"));
}

// ── Harness ──────────────────────────────────────────────────────────────────────────────────

function createDocuments() {
  const docs = new Map();
  return {
    async list(packageId, kind) {
      return [...docs.values()].filter((doc) => doc.packageId === packageId && doc.kind === kind);
    },
    async getById(packageId, id) {
      const doc = docs.get(id);
      return doc && doc.packageId === packageId ? doc : null;
    },
    async create(input) {
      const record = { ...input, revision: 1 };
      docs.set(input.id, record);
      return record;
    },
    async update(input) {
      const doc = docs.get(input.id);
      if (!doc || doc.revision !== input.expectedRevision) return null;
      const record = { ...doc, ...input, revision: doc.revision + 1 };
      docs.set(input.id, record);
      return record;
    },
    async remove(_packageId, id) {
      return docs.delete(id);
    },
  };
}

const logger = {
  info() {},
  warn() {},
  error(error) {
    throw error;
  },
};

/** Answers every card as one character, except cards whose name is in `multi` (→ 4 characters). */
function scriptedModel({ multi = new Set(), tier } = {}) {
  const calls = [];
  return {
    calls,
    async resolve() {
      return {
        name: "Fake",
        model: "fake",
        ...(tier ? { structuredOutput: tier } : {}),
        async chatComplete(messages, options) {
          const system = messages[0].content;
          const user = messages[1].content;
          calls.push({ system, user, options });
          const ids = [...user.matchAll(/<character id="([^"]+)" name="([^"]*)">/g)];
          const results = ids.map(([, sourceId, name]) => {
            const single = user.includes(`<single_card_rule for="${sourceId}">`);
            const count = multi.has(name) && !single ? 4 : 1;
            return {
              sourceId,
              characters: Array.from({ length: count }, (_, index) => ({
                name: count > 1 ? `${name} member ${index + 1}` : name,
                fields: {
                  summary: `${name} summary ${index + 1}`,
                  description: "d",
                  personality: "p",
                  backstory: "b",
                  appearance: "a",
                  scenario: "s",
                },
              })),
              splitReason: count > 1 ? "Four band members." : null,
            };
          });
          return { content: JSON.stringify({ results }) };
        },
      };
    },
  };
}

async function waitSettled(store, id) {
  const start = Date.now();
  for (;;) {
    const session = await store.getSession(id);
    if (session && session.status !== "active") return session;
    if (Date.now() - start > 15_000) throw new Error("session did not settle");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

async function run(
  transform,
  { count = 30, multi = ["Character 12"], batchSize = 5, tier, saveMode = "confirm" } = {},
) {
  const store = createSessionStore(createDocuments());
  const languageModels = scriptedModel({ multi: new Set(multi), tier });
  const deps = { store, languageModels, logger };
  const config = normalizeSessionConfig({
    presetId: "transform",
    mode: "batched",
    batchSize,
    concurrency: 3,
    providerRetries: 0,
    refusalRetries: 0,
    saveMode,
    transform: { schema: { ...SIMPLE, builtIn: false }, format: "xml", ...transform },
  });
  const targets = Array.from({ length: count }, (_, index) => ({
    characterId: `char-${index}`,
    characterName: `Character ${index}`,
  }));
  const session = newSession("Harbor", config, targets);
  const seeded = {
    ...session,
    items: session.items.map((item, index) => ({
      ...item,
      snapshots: { description: `Old ${index}`, first_mes: `Hello ${index}` },
    })),
  };
  await store.createSession(seeded, { version: 1, lorebooks: [], behaviorCharacter: null });
  startRunner(deps, seeded.id);
  return { deps, store, languageModels, settled: await waitSettled(store, seeded.id), id: seeded.id };
}

const results = (session) => session.items.filter((item) => !["split", "staged", "rejected"].includes(item.status));

// ── 2. Split mode: 30 sources in batches of 5, one source describes four characters ─────────
{
  const { deps, store, languageModels, settled, id } = await run({});
  assert.equal(languageModels.calls.length, 6, "30 cards in batches of 5 = 6 calls");
  const waiting = settled.items.filter((item) => item.status === "awaiting-split");
  assert.equal(waiting.length, 1, "only the multi-character source waits; its batch-mates continue");
  assert.equal(waiting[0].characters.length, 4);
  assert.equal(waiting[0].splitReason, "Four band members.");
  assert.equal(settled.items.filter((item) => item.status === "awaiting-review").length, 29);

  const accepted = await decideSplitRun(deps, id, waiting[0].itemId, "accept", ["Mara Voss"]);
  assert.equal(results(accepted).length, 33, "30 in → 33 out (29 + 4)");
  const children = accepted.items.filter((item) => item.parentItemId === waiting[0].itemId);
  assert.deepEqual(
    children.map((child) => child.characterName),
    ["Mara Voss", "Character 12 member 2", "Character 12 member 3", "Character 12 member 4"],
  );
  assert.ok(
    children.every((child) => child.lineage.splitGroupId === waiting[0].itemId && child.lineage.splitCount === 4),
  );
  assert.equal(
    accepted.items.indexOf(children[0]),
    accepted.items.findIndex((item) => item.itemId === waiting[0].itemId) + 1,
    "children follow their source",
  );

  // A split child writes a NEW card even in an in-place save mode; the source stays untouched.
  const [op] = planApply(
    children[0],
    { description: "Old 12", first_mes: "Hello 12" },
    { force: false, saveMode: "confirm", label: "Harbor" },
  );
  assert.equal(op.op, "duplicateThenPatch");
  assert.equal(op.name, "Mara Voss");
  assert.equal(op.extensions.cardEditor.splitGroupId, waiting[0].itemId);
  assert.equal(op.fields.first_mes, "", "the copy drops the source's group greeting");
  assert.match(op.fields.description, /^<mara-voss>/);
  const inPlace = planApply(
    accepted.items[0],
    { description: "Old 0", first_mes: "Hello 0" },
    { force: false, saveMode: "confirm", label: "Harbor" },
  );
  assert.deepEqual(
    inPlace.map((entry) => [entry.op, entry.field]),
    [["patchField", "description"]],
    "unsplit cards patch only target fields",
  );
  assert.ok(await store.getSession(id));
}

// ── 3. Retry as one card ─────────────────────────────────────────────────────────────────────
{
  const { deps, store, languageModels, settled, id } = await run({}, { count: 6, multi: ["Character 3"] });
  const waiting = settled.items.find((item) => item.status === "awaiting-split");
  await decideSplitRun(deps, id, waiting.itemId, "retry-single");
  const after = await waitSettled(store, id);
  const lastCall = languageModels.calls.at(-1);
  assert.ok(lastCall.user.includes(SINGLE_CARD_RULE), "the retry tells the model to keep one card");
  assert.equal((lastCall.user.match(/<character id=/g) ?? []).length, 1, "only the rejected source re-runs");
  const retried = after.items.find((item) => item.itemId === waiting.itemId);
  assert.equal(retried.status, "awaiting-review");
  assert.equal(retried.forceSingle, true);
  assert.equal(results(after).length, 6, "6 in → 6 out");
}

// ── 4. Merge mode keeps several characters on one card ──────────────────────────────────────
{
  const { settled } = await run({ multiCharacter: "merge" }, { count: 5, multi: ["Character 1"] });
  assert.equal(results(settled).length, 5);
  const merged = settled.items[1];
  assert.equal(merged.status, "awaiting-review");
  assert.equal(merged.characters.length, 4);
  const description = merged.updates.find((update) => update.field === "description").newText;
  assert.equal((description.match(/<character-1-member-\d>/g) ?? []).length, 4, "all four documents land on the card");
}

// ── 5. Phase 2 refines all 33 results, previous output passed raw ──────────────────────────
{
  const { deps, store, languageModels, settled, id } = await run({
    phase2: { enabled: true, instruction: "Tighten.", allowSplits: false },
  });
  assert.equal(
    settled.items.filter((item) => item.status === "staged").length,
    29,
    "phase 1 results are held, not reviewed",
  );
  await assert.rejects(() => startPhase2Run(deps, id), /Decide every proposed split/);
  const waiting = settled.items.find((item) => item.status === "awaiting-split");
  await decideSplitRun(deps, id, waiting.itemId, "accept");
  const callsBefore = languageModels.calls.length;
  await startPhase2Run(deps, id);
  const done = await waitSettled(store, id);
  const phase2 = done.items.filter((item) => item.phase === 2);
  assert.equal(phase2.length, 33, "phase 2 takes every phase 1 result");
  assert.equal(languageModels.calls.length - callsBefore, 7, "33 inputs in batches of 5 = 7 calls");
  assert.ok(phase2.every((item) => item.status === "awaiting-review"));
  const phase2Call = languageModels.calls[callsBefore];
  assert.ok(
    phase2Call.user.includes('<previous_output format="xml">\n<character-0>'),
    "previous output is raw XML, not escaped",
  );
  assert.ok(phase2Call.system.includes("Tighten."));
  assert.equal(
    phase2.filter((item) => item.lineage.splitGroupId === waiting.itemId).length,
    4,
    "lineage survives into phase 2",
  );
}

// ── 6. Structured output pass-through and fallback ──────────────────────────────────────────
{
  const on = await run({}, { count: 2, multi: [], tier: "json_schema" });
  const structured = on.languageModels.calls[0].options.structured;
  assert.equal(structured.name, "card_editor_results");
  assert.equal(structured.schema.properties.results.type, "array");
  const none = await run({}, { count: 2, multi: [], tier: "none" });
  assert.equal(
    none.languageModels.calls[0].options?.structured,
    undefined,
    "a connection without support gets the prompt path",
  );
  const off = await run({ structuredOutput: false }, { count: 2, multi: [], tier: "json_schema" });
  assert.equal(
    off.languageModels.calls[0].options?.structured,
    undefined,
    "the agent switch off means the prompt path",
  );
  const doc = await run({ outputMode: "document" }, { count: 1, multi: [] });
  assert.match(doc.languageModels.calls[0].system, /maps each card field to its complete XML document/);
}

stopAllRunners();
process.stdout.write("Card Editor transform regression passed.\n");
