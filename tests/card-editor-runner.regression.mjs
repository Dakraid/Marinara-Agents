/**
 * Card Editor runner/routes regression (#238). Drives the session runner, routes, and server entry
 * against an in-memory capability document store and a scripted fake language-model host — no
 * network, no engine. Runs under plain Node type-stripping, so every import into the package tree
 * keeps its explicit ".ts" specifier.
 */
import assert from "node:assert/strict";

import {
  newSession,
  normalizeSessionConfig,
} from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/schema.ts";
import {
  REFUSAL_REMINDER,
  STRICT_JSON_REMINDER,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/llm.ts";
import {
  cancelSessionRun,
  retryItemRun,
  runnerRegistrySize,
  startRunner,
  stopAllRunners,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/runner.ts";
import { createCardEditorRoutes } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/routes.ts";
import { createSessionStore } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/session-store.ts";
import {
  activate,
  selfCheck,
} from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/server-entry.ts";

// ---------------------------------------------------------------------------
// Fakes

function createFakeDocuments() {
  const docs = new Map();
  return {
    docs,
    async list(packageId, kind) {
      return [...docs.values()].filter((doc) => doc.packageId === packageId && doc.kind === kind);
    },
    async getById(packageId, id) {
      const doc = docs.get(id);
      return doc && doc.packageId === packageId ? doc : null;
    },
    async create(input) {
      if (docs.has(input.id)) {
        const error = new Error("unique constraint");
        error.code = "FILE_UNIQUE_CONSTRAINT";
        error.table = "capability_documents";
        error.keys = ["id"];
        throw error;
      }
      const record = { ...input, revision: 1 };
      docs.set(input.id, record);
      return record;
    },
    async update(input) {
      const doc = docs.get(input.id);
      if (!doc || doc.packageId !== input.packageId || doc.revision !== input.expectedRevision) return null;
      const record = {
        ...doc,
        name: input.name,
        description: input.description,
        data: input.data,
        revision: doc.revision + 1,
        updatedAt: input.updatedAt,
      };
      docs.set(input.id, record);
      return record;
    },
    async remove(packageId, id, expectedRevision) {
      const doc = docs.get(id);
      if (!doc || doc.packageId !== packageId || doc.revision !== expectedRevision) return false;
      docs.delete(id);
      return true;
    },
  };
}

function createFakeLanguageModels(answer) {
  const calls = [];
  return {
    calls,
    async resolve(connectionId) {
      return {
        name: "FakeConnection",
        model: "fake-model",
        connectionId: connectionId ?? null,
        async chatComplete(messages, options) {
          const call = { system: messages[0].content, user: messages[1].content };
          calls.push(call);
          const behavior = await answer(call, calls.length);
          if (behavior.hang) {
            await new Promise((_, reject) => {
              options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
            });
          }
          if (behavior.error) throw behavior.error;
          return { content: behavior.content, finishReason: "stop" };
        },
      };
    },
  };
}

function createLogger() {
  const entries = { info: [], warn: [], error: [] };
  return {
    entries,
    debug() {},
    info(message, ...args) {
      entries.info.push({ message, args });
    },
    warn(message, ...args) {
      entries.warn.push({ message, args });
    },
    error(error, message, ...args) {
      entries.error.push({ error, message, args });
    },
    debugOverride() {},
  };
}

const EMPTY_MATERIAL = { version: 1, lorebooks: [], behaviorCharacter: null };

function makeSession(configOverrides, count, options = {}) {
  const config = normalizeSessionConfig({ providerRetries: 0, refusalRetries: 0, ...configOverrides });
  const targets = Array.from({ length: count }, (_, index) => ({
    characterId: `char-${index}`,
    characterName: `Character ${index}`,
  }));
  const session = newSession(options.label ?? "Test run", config, targets);
  return {
    ...session,
    items: session.items.map((item, index) => ({
      ...item,
      snapshots: options.snapshots?.(item, index) ?? { description: `Old desc ${index}` },
    })),
  };
}

function makeTarget(index, overrides = {}) {
  return {
    characterId: `char-${index}`,
    characterName: `Character ${index}`,
    card: { name: `Character ${index}`, description: `Old desc ${index}` },
    ...overrides,
  };
}

const updatesJson = (entries) =>
  JSON.stringify({
    updates: entries.map(([field, newText]) => ({ field, oldText: "", newText, reason: "test" })),
  });
const singleUpdate = (text) => updatesJson([["description", text]]);
const batchJson = (byCharacterId) =>
  JSON.stringify(
    Object.fromEntries(Object.entries(byCharacterId).map(([characterId, updates]) => [characterId, { updates }])),
  );

async function waitFor(predicate, label, timeoutMs = 15_000) {
  const start = Date.now();
  for (;;) {
    const value = await predicate();
    if (value) return value;
    if (Date.now() - start > timeoutMs) throw new Error(`Timed out waiting for: ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function settledSession(store, id) {
  return waitFor(async () => {
    const session = await store.getSession(id);
    return session && session.status !== "active" ? session : null;
  }, `session ${id} to settle`);
}

async function createRouteHarness(deps) {
  const handlers = new Map();
  const app = {
    get: (path, handler) => handlers.set(`GET ${path}`, handler),
    post: (path, handler) => handlers.set(`POST ${path}`, handler),
    delete: (path, handler) => handlers.set(`DELETE ${path}`, handler),
    patch: (path, handler) => handlers.set(`PATCH ${path}`, handler),
    put: (path, handler) => handlers.set(`PUT ${path}`, handler),
  };
  await createCardEditorRoutes(deps)(app, {});
  return async function invoke(method, path, { params = {}, body, query = {} } = {}) {
    const handler = handlers.get(`${method} ${path}`);
    assert.ok(handler, `route ${method} ${path} must be registered`);
    const reply = {
      statusCode: 200,
      payload: undefined,
      status(code) {
        this.statusCode = code;
        return this;
      },
      send(payload) {
        this.payload = payload;
        return this;
      },
    };
    const result = await handler({ params, body, query }, reply);
    return { status: reply.statusCode, body: result === reply || result === undefined ? reply.payload : result };
  };
}

function createDeps(documents, languageModels) {
  const logger = createLogger();
  const store = createSessionStore(documents);
  return { deps: { store, languageModels, logger }, store, logger };
}

async function createSessionViaRoute(invoke, body) {
  const response = await invoke("POST", "/sessions", { body });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  return response.body;
}

// ---------------------------------------------------------------------------
// Runner orchestration

async function testIndividualMode() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((call) => ({
    content: call.user.includes('name="Character 0"') ? singleUpdate("New desc 0") : singleUpdate("New desc 1"),
  }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", concurrency: 2 }, 2);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "completed");
  assert.deepEqual(settled.stats, { total: 2, done: 2, failed: 0 });
  assert.deepEqual(settled.batches, [], "individual mode records no batches");
  for (const [index, item] of settled.items.entries()) {
    assert.equal(item.status, "awaiting-review");
    assert.equal(item.updates.length, 1);
    assert.equal(item.updates[0].newText, `New desc ${index}`);
    assert.equal(item.autoApply, undefined, "confirm mode sets no autoApply hint");
  }
  assert.equal(languageModels.calls.length, 2, "individual mode = one call per card");
  assert.ok(
    languageModels.calls.every((call) => !call.user.includes("<bulk_edit>")),
    "single-card contract",
  );
}

async function testAutoSaveModeHint() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("Auto") }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", saveMode: "auto" }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.equal(settled.items[0].autoApply, true, "auto save mode marks items for panel auto-approval");
}

async function testSettingsPumpCap() {
  stopAllRunners();
  // The panel's max-parallel-agents setting narrows a session's own concurrency on every pump
  // cycle: concurrency 4 + settings cap 1 must run strictly one dispatch at a time.
  const documents = createFakeDocuments();
  const store = createSessionStore(documents);
  await store.saveSettings({ version: 1, maxParallelAgents: 1, disableAutoVerdicts: false });
  let inFlight = 0;
  let peak = 0;
  const languageModels = {
    async resolve() {
      return {
        name: "FakeConnection",
        model: "fake-model",
        connectionId: null,
        async chatComplete() {
          inFlight += 1;
          peak = Math.max(peak, inFlight);
          await new Promise((resolve) => setTimeout(resolve, 20));
          inFlight -= 1;
          return { content: singleUpdate("Capped"), finishReason: "stop" };
        },
      };
    },
  };
  const deps = { store, languageModels, logger: createLogger() };
  const session = makeSession({ mode: "individual", concurrency: 4 }, 4);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "completed");
  assert.equal(settled.stats.done, 4);
  assert.equal(peak, 1, "the settings cap (1) overrides session concurrency (4)");
}

async function testCompletionEnforcementDispatch() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("Enforced") }));
  const { deps, store } = createDeps(documents, languageModels);

  const duplicate = makeSession(
    { mode: "individual", saveMode: "confirm", completionMode: "duplicate", duplicatePrefix: "Edited " },
    1,
  );
  await store.createSession(duplicate, EMPTY_MATERIAL);
  startRunner(deps, duplicate.id);
  const duplicated = await settledSession(store, duplicate.id);
  assert.equal(duplicated.items[0].status, "duplicated", "queue drain plans duplicate enforcement");
  assert.deepEqual(duplicated.items[0].pendingOps, [
    {
      op: "duplicateThenPatch",
      characterId: "char-0",
      fields: { description: "Enforced" },
      namePrefix: "Edited ",
    },
  ]);

  const apply = makeSession({ mode: "individual", saveMode: "duplicate", completionMode: "apply" }, 1);
  await store.createSession(apply, EMPTY_MATERIAL);
  startRunner(deps, apply.id);
  const awaitingFields = await settledSession(store, apply.id);
  assert.equal(
    awaitingFields.items[0].status,
    "awaiting-review",
    "in-place enforcement waits for client-supplied current fields",
  );
  assert.equal(awaitingFields.items[0].pendingOps, undefined);
  const invoke = await createRouteHarness(deps);
  const stale = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: apply.id, itemId: awaitingFields.items[0].itemId },
    body: { verdict: "approve", currentFields: { description: "Changed mid-run" } },
  });
  assert.equal(stale.status, 200);
  assert.equal(stale.body.status, "needs-confirmation");
  const held = await store.getSession(apply.id);
  assert.equal(held.items[0].status, "needs-review", "stale apply enforcement plans no write");
  assert.equal(held.items[0].pendingOps, undefined);
}

async function testNoOpAutoApproves() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: updatesJson([]) }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual" }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  const item = settled.items[0];
  assert.equal(item.status, "applied", "empty updates auto-approve (ARCH §5)");
  assert.deepEqual(item.updates, []);
  assert.ok(item.appliedAt, "appliedAt is stamped");
}

async function testBatchedMode() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((call) => {
    if (call.user.includes("<bulk_edit>")) {
      if (call.user.includes("char-2")) {
        return {
          content: batchJson({ "char-2": [{ field: "description", oldText: "", newText: "New 2", reason: "t" }] }),
        };
      }
      return {
        content: batchJson({
          "char-0": [{ field: "description", oldText: "", newText: "New 0", reason: "t" }],
          "char-1": [],
        }),
      };
    }
    return { content: singleUpdate("unexpected single call") };
  });
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "batched", batchSize: 2 }, 3);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "completed");
  assert.equal(languageModels.calls.length, 2, "3 cards at batch size 2 = 2 calls");
  assert.equal(settled.batches.length, 2);
  assert.ok(settled.batches.every((batch) => batch.status === "done" && batch.attempts === 1));
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.equal(settled.items[0].updates[0].newText, "New 0");
  assert.equal(settled.items[0].batchId, settled.batches[0].id);
  assert.equal(settled.items[1].status, "applied", "a batched empty-updates entry is a no-op");
  assert.equal(settled.items[2].status, "awaiting-review");
  assert.equal(settled.items[2].batchId, settled.batches[1].id);
  assert.ok(languageModels.calls[1].user.includes('"char-2"'), "the second batch carries the remainder");
}

async function testBatchMissingEntryFallsBackToIndividual() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((call) => {
    if (call.user.includes("<bulk_edit>")) {
      // The model answers for char-0 only; char-1's entry is missing.
      return {
        content: batchJson({ "char-0": [{ field: "description", oldText: "", newText: "New 0", reason: "t" }] }),
      };
    }
    return { content: singleUpdate("New 1 solo") };
  });
  const { deps, store, logger } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "batched", batchSize: 2 }, 2);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "completed");
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.equal(settled.items[1].status, "awaiting-review");
  assert.equal(settled.items[1].updates[0].newText, "New 1 solo", "missing entry re-ran individually");
  assert.equal(settled.batches[0].status, "done", "the batch call completed; the fallback is per-item");
  assert.equal(languageModels.calls.length, 2);
  assert.ok(!languageModels.calls[1].user.includes("<bulk_edit>"), "the fallback is a single-card call");
  assert.ok(
    logger.entries.warn.some((entry) => entry.message.includes("skipped cards")),
    "the fallback is marked via the log",
  );
}

async function testOverflowSplitRecursion() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((call) => {
    if (call.user.includes("<bulk_edit>")) {
      return { error: Object.assign(new Error("Request failed (400): context_length_exceeded"), { status: 400 }) };
    }
    return { content: singleUpdate("After split") };
  });
  const { deps, store, logger } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "batched", batchSize: 2 }, 2);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "completed");
  assert.equal(settled.batches[0].status, "split");
  const halves = settled.batches.slice(1);
  assert.equal(halves.length, 2);
  assert.deepEqual(
    halves.map((batch) => batch.itemIds.length),
    [1, 1],
    "the batch halved to single-card calls",
  );
  assert.ok(halves.every((batch) => batch.status === "done"));
  assert.ok(settled.items.every((item) => item.status === "awaiting-review"));
  assert.equal(languageModels.calls.length, 3, "one overflowing batch call + two single-card calls");
  assert.ok(logger.entries.info.some((entry) => entry.message.includes("split after a context overflow")));
}

async function testSingleCardOverflowFailsProvider() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({
    error: Object.assign(new Error("maximum context length exceeded"), { status: 400 }),
  }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual" }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  const item = settled.items[0];
  assert.equal(item.status, "failed-provider", "a single-card overflow cannot split further");
  assert.equal(item.failure.kind, "provider");
  assert.ok(item.failure.message.includes("context overflow"));
  assert.equal(item.failure.attempts, 1, "overflow is never retried");
}

async function testProviderRetryExhaustion() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({
    error: Object.assign(new Error("Request failed (503)"), { status: 503 }),
  }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", providerRetries: 1 }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  const item = settled.items[0];
  assert.equal(item.status, "failed-provider");
  assert.equal(item.failure.attempts, 2, "one initial call + one retry");
  assert.equal(languageModels.calls.length, 2);
}

async function testFatalProviderErrorIsNotRetried() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({
    error: Object.assign(new Error("Request failed (401): invalid key"), { status: 401 }),
  }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", providerRetries: 3 }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.items[0].status, "failed-provider");
  assert.equal(languageModels.calls.length, 1, "401 is fatal: no retries");
}

async function testRefusalRetryThenSuccess() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((_call, index) =>
    index === 1 ? { content: "I'm sorry, I can't help with that." } : { content: singleUpdate("Recovered") },
  );
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", refusalRetries: 2 }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.equal(languageModels.calls.length, 2);
  assert.ok(
    languageModels.calls[1].user.endsWith(REFUSAL_REMINDER),
    "the refusal retry appends the terse reminder to the user message",
  );
}

async function testRefusalExhaustion() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: "I'm sorry, I can't help with that." }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", refusalRetries: 1 }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  const item = settled.items[0];
  assert.equal(item.status, "failed-refusal");
  assert.equal(item.failure.kind, "refusal");
  assert.equal(item.failure.attempts, 2);
  assert.equal(item.failure.rawOutput, "I'm sorry, I can't help with that.");
  assert.ok(item.failure.renderedPrompt.system.includes("Card Editor"));
  assert.ok(item.failure.renderedPrompt.user.includes("<character"), "the rendered prompt is retained for edit-retry");
  assert.ok(item.failure.renderedPrompt.user.includes(REFUSAL_REMINDER), "the exact last prompt is retained");
}

async function testInvalidJsonReminderThenSuccess() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((_call, index) =>
    index === 1
      ? { content: `Prose without intent. ${"lorem ipsum ".repeat(60)}` }
      : { content: singleUpdate("Parsed") },
  );
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual" }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.equal(languageModels.calls.length, 2);
  assert.ok(languageModels.calls[1].user.endsWith(STRICT_JSON_REMINDER), "exactly one strict-JSON reminder retry");
}

async function testInvalidJsonTwiceFailsParse() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({
    content: `Still not JSON. ${"lorem ipsum ".repeat(60)}`,
  }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual" }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const settled = await settledSession(store, session.id);
  const item = settled.items[0];
  assert.equal(item.status, "failed-parse");
  assert.equal(item.failure.kind, "parse");
  assert.ok(item.failure.rawOutput.startsWith("Still not JSON."));
  assert.ok(item.failure.renderedPrompt.user.includes(STRICT_JSON_REMINDER));
  assert.equal(languageModels.calls.length, 2, "one reminder retry, then failed-parse");
}

async function testCancelAbortsInFlight() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ hang: true }));
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", concurrency: 1 }, 2);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  await waitFor(() => languageModels.calls.length >= 1, "the first call to be in flight");
  const canceled = await cancelSessionRun(deps, session.id);
  assert.equal(canceled.status, "canceled");
  assert.ok(
    canceled.items.every((item) => item.status === "canceled"),
    "queued/running items cancel",
  );
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "canceled");
  assert.deepEqual(settled.stats, { total: 2, done: 2, failed: 0 }, "canceled items count as done, not failed");
  await assert.rejects(
    () => retryItemRun(deps, session.id, settled.items[0].itemId),
    (error) => error.statusCode === 409,
    "a canceled session refuses retries",
  );
}

async function testRetryItem() {
  stopAllRunners();
  const documents = createFakeDocuments();
  let fail = true;
  const languageModels = createFakeLanguageModels(() =>
    fail
      ? { error: Object.assign(new Error("Request failed (500)"), { status: 500 }) }
      : { content: singleUpdate("Retried") },
  );
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual", providerRetries: 0 }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const failed = await settledSession(store, session.id);
  assert.equal(failed.items[0].status, "failed-provider");
  fail = false;
  const running = await retryItemRun(deps, session.id, failed.items[0].itemId);
  assert.equal(running.status, "active", "a retry reactivates a completed session");
  assert.equal(running.items[0].status, "running");
  assert.equal(running.items[0].failure, undefined, "the failure record clears on retry");
  const settled = await settledSession(store, session.id);
  assert.equal(settled.status, "completed");
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.equal(settled.items[0].updates[0].newText, "Retried");
}

async function testEditRetryUsesVerbatimPrompt() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((_call, index) =>
    index <= 2 ? { content: `garbage ${"x".repeat(500)}` } : { content: singleUpdate("Edited retry") },
  );
  const { deps, store } = createDeps(documents, languageModels);
  const session = makeSession({ mode: "individual" }, 1);
  await store.createSession(session, EMPTY_MATERIAL);
  startRunner(deps, session.id);
  const failed = await settledSession(store, session.id);
  assert.equal(failed.items[0].status, "failed-parse");
  await retryItemRun(deps, session.id, failed.items[0].itemId, { system: "Edited system", user: "Edited user" });
  const settled = await settledSession(store, session.id);
  assert.equal(settled.items[0].status, "awaiting-review");
  const retryCall = languageModels.calls[2];
  assert.equal(retryCall.system, "Edited system", "edit-retry dispatches the exact edited prompt");
  assert.equal(retryCall.user, "Edited user");
}

async function testBehaviorOverrideCardMaterial() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("Styled") }));
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  // DESIGN §2: a per-target style override picks ANY library character, so the card material
  // ships with the dispatch; "style-outside" is deliberately NOT a session target.
  const created = await createSessionViaRoute(invoke, {
    targets: [
      makeTarget(0, {
        behaviorOverride: "style-outside",
        behaviorOverrideCard: { name: "Style Bot", personality: "Meticulous" },
      }),
      makeTarget(1),
    ],
    config: normalizeSessionConfig({ mode: "individual", providerRetries: 0, concurrency: 2 }),
  });
  const settled = await settledSession(store, created.id);
  assert.equal(settled.status, "completed");
  const styledCall = languageModels.calls.find((call) => call.user.includes('name="Character 0"'));
  assert.ok(styledCall, "a call ran for the override target");
  assert.ok(styledCall.user.includes("<behavior_character>"), "the materialized override injects the block");
  assert.ok(styledCall.user.includes("Name: Style Bot"));
  assert.ok(styledCall.user.includes("Personality: Meticulous"));
  const plainCall = languageModels.calls.find((call) => call.user.includes('name="Character 1"'));
  assert.ok(plainCall, "a call ran for the plain target");
  assert.ok(!plainCall.user.includes("<behavior_character>"), "targets without an override get no block");
  const material = await store.getSessionMaterial(created.id);
  assert.equal(
    material.behaviorOverrideCards["char-0"].name,
    "Style Bot",
    "the override card persists in the prompt material for retries",
  );
}

async function testBehaviorOverrideReferenceStillResolves() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("Styled") }));
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  // Backward compat: the reference-by-target-id form (no card material) still resolves.
  const created = await createSessionViaRoute(invoke, {
    targets: [makeTarget(0, { behaviorOverride: "char-1" }), makeTarget(1)],
    config: normalizeSessionConfig({ mode: "individual", providerRetries: 0, concurrency: 2 }),
  });
  const settled = await settledSession(store, created.id);
  assert.equal(settled.status, "completed");
  const styledCall = languageModels.calls.find((call) => call.user.includes('name="Character 0"'));
  assert.ok(styledCall.user.includes("<behavior_character>"), "the reference form still injects the block");
  assert.ok(styledCall.user.includes("Name: Character 1"));
  const material = await store.getSessionMaterial(created.id);
  assert.equal(material.behaviorOverrideCards, undefined, "reference-only dispatches store no card map");
}

// ---------------------------------------------------------------------------
// Routes

async function testRouteValidation() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("x") }));
  const { deps } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);

  const health = await invoke("GET", "/health");
  assert.deepEqual(health.body, { ok: true });

  for (const [label, mutate] of [
    ["no targets", (body) => ({ ...body, targets: [] })],
    ["duplicate characterIds", (body) => ({ ...body, targets: [body.targets[0], { ...body.targets[0] }] })],
    [
      "custom preset without template",
      (body) => ({ ...body, config: { ...body.config, presetId: "custom", customTemplate: "  " } }),
    ],
    [
      "behaviorOverride referencing an unknown character",
      (body) => ({ ...body, targets: [{ ...body.targets[0], behaviorOverride: "ghost" }] }),
    ],
    [
      "behaviorOverrideCard with an oversized field",
      (body) => ({
        ...body,
        targets: [
          {
            ...body.targets[0],
            behaviorOverride: "style-outside",
            behaviorOverrideCard: { name: "Style Bot", description: "x".repeat(100_001) },
          },
        ],
      }),
    ],
    [
      "behaviorOverride referencing itself",
      (body) => ({ ...body, targets: [{ ...body.targets[0], behaviorOverride: body.targets[0].characterId }] }),
    ],
    [
      "oversized card field",
      (body) => ({
        ...body,
        targets: [{ ...body.targets[0], card: { ...body.targets[0].card, description: "x".repeat(100_001) } }],
      }),
    ],
  ]) {
    const base = { targets: [makeTarget(0), makeTarget(1)], config: normalizeSessionConfig({ providerRetries: 0 }) };
    const response = await invoke("POST", "/sessions", { body: mutate(base) });
    assert.equal(response.status, 400, label);
    assert.equal(typeof response.body.error, "string", `${label}: JSON error envelope`);
  }
  const missing = await invoke("GET", "/sessions/:id", { params: { id: "nope" } });
  assert.equal(missing.status, 404);
  assert.equal(typeof missing.body.error, "string");
}

async function testSessionLifecycleRoutes() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((call) => ({
    content: call.user.includes('name="Character 0"') ? singleUpdate("New desc 0") : singleUpdate("New desc 1"),
  }));
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);

  const created = await createSessionViaRoute(invoke, {
    label: "Route run",
    targets: [makeTarget(0), makeTarget(1)],
    config: normalizeSessionConfig({ mode: "individual", providerRetries: 0, concurrency: 2 }),
    lorebooks: [{ id: "book-1", name: "Reference", entries: [{ name: "Fact", content: "Canon", enabled: true }] }],
  });
  assert.equal(created.label, "Route run");
  assert.equal(created.items.length, 2);
  assert.equal(created.items[0].snapshots.description, "Old desc 0", "snapshots captured at dispatch");
  assert.equal(created.items[0].pendingOps, undefined);

  const settled = await settledSession(store, created.id);
  assert.equal(settled.status, "completed");

  const index = await invoke("GET", "/sessions");
  assert.equal(index.status, 200);
  assert.equal(index.body.length, 1);
  assert.deepEqual(
    Object.keys(index.body[0]).sort(),
    ["completionMode", "createdAt", "enforcementPendingCount", "id", "label", "pendingApplyCount", "stats", "status"],
    "the index projects session metadata plus completion-enforcement polling counts",
  );

  const detail = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(detail.body.items[0].status, "awaiting-review");
  assert.equal(detail.body.items[0].pendingOps, undefined, "pendingOps never serialize");

  // verdict: reject char-1
  const rejected = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: detail.body.items[1].itemId },
    body: { verdict: "reject" },
  });
  assert.equal(rejected.status, 200);
  assert.equal(rejected.body.items[1].status, "rejected", "reject returns the session");

  // verdict: approve char-0 with a genuinely fresh field
  const approve = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: detail.body.items[0].itemId },
    body: { verdict: "approve", currentFields: { description: "Old desc 0" } },
  });
  assert.equal(approve.status, 200);
  assert.equal(approve.body.status, "apply");
  assert.equal(approve.body.ops.length, 1);
  assert.deepEqual(approve.body.ops[0], {
    op: "patchField",
    characterId: "char-0",
    field: "description",
    newText: "New desc 0",
    versionSource: "agent",
    versionReason: "Card Editor bulk: Route run",
  });

  const afterApprove = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(afterApprove.body.items[0].status, "applied", "the verdict moves the item to applied");
  assert.equal(afterApprove.body.items[0].pendingOps.length, 1, "polling exposes unreported pendingOps");

  const confirm = await invoke("POST", "/sessions/:id/items/:itemId/apply-result", {
    params: { id: created.id, itemId: detail.body.items[0].itemId },
    body: { results: [{ index: 0, ok: true }] },
  });
  assert.equal(confirm.status, 200);
  assert.equal(confirm.body.items[0].status, "applied");
  assert.ok(confirm.body.items[0].appliedAt, "apply-result confirms and stamps appliedAt");

  const replayed = await invoke("POST", "/sessions/:id/items/:itemId/apply-result", {
    params: { id: created.id, itemId: detail.body.items[0].itemId },
    body: { results: [{ index: 0, ok: true }] },
  });
  assert.equal(replayed.status, 409, "a second apply-result has no pending apply");

  const rejectedVerdict = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: detail.body.items[1].itemId },
    body: { verdict: "approve", currentFields: {} },
  });
  assert.equal(rejectedVerdict.status, 409, "verdicts are only valid from awaiting-review/needs-review");

  const deleted = await invoke("DELETE", "/sessions/:id", { params: { id: created.id } });
  assert.equal(deleted.status, 204);
  const gone = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(gone.status, 404);
}

async function testVerdictHoldsAndForce() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("New desc 0") }));
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  const created = await createSessionViaRoute(invoke, {
    targets: [makeTarget(0)],
    config: normalizeSessionConfig({ providerRetries: 0 }),
  });
  await settledSession(store, created.id);

  const missingFields = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { verdict: "approve" },
  });
  assert.equal(missingFields.status, 400, "confirm-mode approve requires currentFields");

  const stale = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { verdict: "approve", currentFields: { description: "Changed since dispatch" } },
  });
  assert.equal(stale.status, 200);
  assert.equal(stale.body.status, "needs-confirmation");
  assert.deepEqual(stale.body.holds, [
    { op: "hold", characterId: "char-0", field: "description", reason: "field changed since dispatch" },
  ]);
  let detail = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(detail.body.items[0].status, "needs-review", "holds demote the item to needs-review");

  const forced = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { verdict: "approve", force: true, currentFields: { description: "Changed since dispatch" } },
  });
  assert.equal(forced.status, 200);
  assert.equal(forced.body.status, "apply", "force applies stale fields anyway");
  assert.equal(forced.body.ops[0].op, "patchField");
  detail = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(detail.body.items[0].status, "applied");

  const failedApply = await invoke("POST", "/sessions/:id/items/:itemId/apply-result", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { results: [{ index: 0, ok: false, error: "PATCH 404: card gone" }] },
  });
  assert.equal(failedApply.status, 200);
  const failedItem = failedApply.body.items[0];
  assert.equal(failedItem.status, "failed-provider", "a client-side write failure demotes to failed-provider");
  assert.equal(failedItem.failure.kind, "provider");
  assert.equal(failedItem.failure.message, "PATCH 404: card gone");
  assert.equal(failedItem.updates.length, 1, "updates survive for retry/review");
  assert.equal(failedItem.pendingOps, undefined, "pendingOps are consumed");
}

async function testDuplicateModeVerdict() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ content: singleUpdate("Copy text") }));
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  const created = await createSessionViaRoute(invoke, {
    targets: [makeTarget(0)],
    config: normalizeSessionConfig({ providerRetries: 0, saveMode: "duplicate", duplicateSuffix: " (Edited)" }),
  });
  await settledSession(store, created.id);

  const approve = await invoke("POST", "/sessions/:id/items/:itemId/verdict", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { verdict: "approve" },
  });
  assert.equal(approve.status, 200);
  assert.equal(approve.body.status, "apply");
  assert.deepEqual(approve.body.ops, [
    {
      op: "duplicateThenPatch",
      characterId: "char-0",
      fields: { description: "Copy text" },
      nameSuffix: " (Edited)",
    },
  ]);
  const detail = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(detail.body.items[0].status, "duplicated");

  const confirm = await invoke("POST", "/sessions/:id/items/:itemId/apply-result", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { results: [{ index: 0, ok: true, resultCardId: "char-copy-1" }] },
  });
  assert.equal(confirm.body.items[0].status, "duplicated");
  assert.equal(confirm.body.items[0].resultCardId, "char-copy-1", "the duplicate's new card id is recorded");
}

async function testRerunRoute() {
  stopAllRunners();
  const documents = createFakeDocuments();
  let hang = false;
  const languageModels = createFakeLanguageModels(() =>
    hang ? { hang: true } : { content: singleUpdate("Rerun result") },
  );
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  const created = await createSessionViaRoute(invoke, {
    label: "Original run",
    targets: [makeTarget(0), makeTarget(1)],
    config: normalizeSessionConfig({ mode: "individual", providerRetries: 0, completionMode: "ask" }),
  });
  const original = await settledSession(store, created.id);
  const originalSnapshot = structuredClone(original);

  const rerun = await invoke("POST", "/sessions/:id/rerun", { params: { id: original.id } });
  assert.equal(rerun.status, 200, JSON.stringify(rerun.body));
  assert.notEqual(rerun.body.id, original.id, "run again creates a new session");
  assert.equal(rerun.body.label, "Original run (rerun)");
  assert.deepEqual(rerun.body.config, original.config, "the config is cloned exactly");
  assert.deepEqual(
    rerun.body.items.map((item) => item.characterId),
    ["char-0", "char-1"],
    "targets preserve first-seen order",
  );
  assert.ok(
    rerun.body.items.every((item) => item.status === "queued"),
    "new items begin queued",
  );
  await settledSession(store, rerun.body.id);
  assert.deepEqual(await store.getSession(original.id), originalSnapshot, "the original session stays untouched");

  hang = true;
  const active = await createSessionViaRoute(invoke, {
    label: "Active run",
    targets: [makeTarget(2)],
    config: normalizeSessionConfig({ mode: "individual", providerRetries: 0 }),
  });
  await waitFor(() => languageModels.calls.some((call) => call.user.includes("char-2")), "active rerun guard fixture");
  const guarded = await invoke("POST", "/sessions/:id/rerun", { params: { id: active.id } });
  assert.equal(guarded.status, 409, "active sessions cannot run again");
  await cancelSessionRun(deps, active.id);
  hang = false;
  const canceledRerun = await invoke("POST", "/sessions/:id/rerun", { params: { id: active.id } });
  assert.equal(canceledRerun.status, 200, "canceled sessions can run again");
  await settledSession(store, canceledRerun.body.id);
}

async function testDeleteActiveSession() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ hang: true }));
  const { deps } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  const created = await createSessionViaRoute(invoke, {
    targets: [makeTarget(0)],
    config: normalizeSessionConfig({ providerRetries: 0 }),
  });
  await waitFor(() => languageModels.calls.length >= 1, "the call to be in flight");
  const refused = await invoke("DELETE", "/sessions/:id", { params: { id: created.id } });
  assert.equal(refused.status, 409, "an active session refuses deletion");
  const forced = await invoke("DELETE", "/sessions/:id", { params: { id: created.id }, query: { force: "true" } });
  assert.equal(forced.status, 204, "?force cancels then deletes");
  const gone = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  assert.equal(gone.status, 404);
}

async function testEditRetryRoute() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels((_call, index) =>
    index <= 2 ? { content: `garbage ${"x".repeat(500)}` } : { content: singleUpdate("Fixed") },
  );
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  const created = await createSessionViaRoute(invoke, {
    targets: [makeTarget(0)],
    config: normalizeSessionConfig({ providerRetries: 0 }),
  });
  const failed = await settledSession(store, created.id);
  assert.equal(failed.items[0].status, "failed-parse");

  const invalid = await invoke("POST", "/sessions/:id/items/:itemId/edit-retry", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { system: "ok", user: 42 },
  });
  assert.equal(invalid.status, 400);

  const retry = await invoke("POST", "/sessions/:id/items/:itemId/edit-retry", {
    params: { id: created.id, itemId: created.items[0].itemId },
    body: { system: "Edited system", user: "Edited user" },
  });
  assert.equal(retry.status, 200);
  assert.equal(retry.body.items[0].status, "running");
  const settled = await settledSession(store, created.id);
  assert.equal(settled.items[0].status, "awaiting-review");
  assert.deepEqual([languageModels.calls[2].system, languageModels.calls[2].user], ["Edited system", "Edited user"]);
}

async function testCancelQueuedItemRoute() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ hang: true }));
  const { deps, store } = createDeps(documents, languageModels);
  const invoke = await createRouteHarness(deps);
  const created = await createSessionViaRoute(invoke, {
    targets: [makeTarget(0), makeTarget(1)],
    config: normalizeSessionConfig({ mode: "individual", providerRetries: 0, concurrency: 1 }),
  });
  await waitFor(() => languageModels.calls.length >= 1, "the first call to be in flight");
  const detail = await invoke("GET", "/sessions/:id", { params: { id: created.id } });
  const running = detail.body.items.find((item) => item.status === "running");
  const queued = detail.body.items.find((item) => item.status === "queued");
  assert.ok(running && queued, "concurrency 1: one running, one queued");
  const wrongState = await invoke("POST", "/sessions/:id/items/:itemId/cancel", {
    params: { id: created.id, itemId: running.itemId },
  });
  assert.equal(wrongState.status, 409, "only queued items cancel individually");
  const canceled = await invoke("POST", "/sessions/:id/items/:itemId/cancel", {
    params: { id: created.id, itemId: queued.itemId },
  });
  assert.equal(canceled.status, 200);
  assert.equal(
    canceled.body.items.find((item) => item.itemId === queued.itemId).status,
    "canceled",
    "the queued item flips to canceled",
  );
  assert.equal(
    canceled.body.items.find((item) => item.itemId === running.itemId).status,
    "running",
    "the in-flight item keeps running (session-level cancel owns it)",
  );
  await cancelSessionRun(deps, created.id);
  const settled = await settledSession(store, created.id);
  assert.equal(settled.status, "canceled");
}

// ---------------------------------------------------------------------------
// Activation smoke (mirrors the catalog's registration expectations)

async function testActivationLifecycle() {
  stopAllRunners();
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() => ({ hang: true }));
  const logger = createLogger();

  // A session stranded mid-run by a server restart.
  const stranded = newSession("Stranded", normalizeSessionConfig({}), [{ characterId: "char-x", characterName: "X" }]);
  const now = new Date().toISOString();
  await documents.create({
    id: stranded.id,
    packageId: "card-editor",
    kind: "bulk-session",
    name: stranded.label,
    description: "Card Editor bulk session",
    data: stranded,
    createdAt: now,
    updatedAt: now,
  });

  const routes = new Map();
  const api = {
    runtime: { persistence: { documents }, languageModels, logger },
    async registerPrivilegedRoutes(plugin, options) {
      assert.equal(options.prefix, "/api/card-editor");
      const app = {
        get: (path, handler) => routes.set(`GET ${path}`, handler),
        post: (path, handler) => routes.set(`POST ${path}`, handler),
        delete: (path, handler) => routes.set(`DELETE ${path}`, handler),
        patch: (path, handler) => routes.set(`PATCH ${path}`, handler),
        put: (path, handler) => routes.set(`PUT ${path}`, handler),
      };
      await plugin(app, {});
      return () => routes.clear();
    },
  };
  const cleanup = await activate({ api });
  assert.equal(typeof cleanup, "function");

  // SPEC F5.3: the stranded session was marked interrupted on activation.
  const store = createSessionStore(documents);
  const after = await store.getSession(stranded.id);
  assert.equal(after.status, "interrupted");
  assert.equal(after.items[0].status, "interrupted");
  assert.ok(routes.has("POST /sessions") && routes.has("DELETE /sessions/:id"), "routes registered");

  await selfCheck();
  await cleanup();
  assert.equal(routes.size, 0, "cleanup releases the routes");
  assert.equal(runnerRegistrySize(), 0, "cleanup clears the runner registry");
  await assert.rejects(selfCheck, /did not initialize/);
}

// ---------------------------------------------------------------------------

const tests = [
  ["individual mode", testIndividualMode],
  ["auto save mode autoApply hint", testAutoSaveModeHint],
  ["settings pump cap", testSettingsPumpCap],
  ["completion enforcement dispatch", testCompletionEnforcementDispatch],
  ["no-op auto-approve", testNoOpAutoApproves],
  ["batched mode", testBatchedMode],
  ["batch missing entry fallback", testBatchMissingEntryFallsBackToIndividual],
  ["overflow split recursion", testOverflowSplitRecursion],
  ["single-card overflow failure", testSingleCardOverflowFailsProvider],
  ["provider retry exhaustion", testProviderRetryExhaustion],
  ["fatal provider error", testFatalProviderErrorIsNotRetried],
  ["refusal retry", testRefusalRetryThenSuccess],
  ["refusal exhaustion", testRefusalExhaustion],
  ["invalid JSON reminder", testInvalidJsonReminderThenSuccess],
  ["invalid JSON twice", testInvalidJsonTwiceFailsParse],
  ["cancel aborts in-flight", testCancelAbortsInFlight],
  ["retry item", testRetryItem],
  ["edit-retry verbatim prompt", testEditRetryUsesVerbatimPrompt],
  ["behaviorOverrideCard material", testBehaviorOverrideCardMaterial],
  ["behaviorOverride reference form", testBehaviorOverrideReferenceStillResolves],
  ["route validation", testRouteValidation],
  ["session lifecycle routes", testSessionLifecycleRoutes],
  ["verdict holds and force", testVerdictHoldsAndForce],
  ["duplicate-mode verdict", testDuplicateModeVerdict],
  ["rerun route", testRerunRoute],
  ["delete active session", testDeleteActiveSession],
  ["edit-retry route", testEditRetryRoute],
  ["cancel queued item route", testCancelQueuedItemRoute],
  ["activation lifecycle", testActivationLifecycle],
];

for (const [name, test] of tests) {
  await test();
  process.stdout.write(`  ok ${name}\n`);
}
stopAllRunners();
process.stdout.write("Card Editor runner regression passed.\n");
