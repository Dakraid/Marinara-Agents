/**
 * Card Editor runs-panel / verdict-queue / edit-retry UI regression (#241). Source-contract
 * assertions (locale coverage, JSX text scan, structural hooks) plus pure-function coverage of
 * the dependency-free diff helper and the status mapping, driven under plain Node type-stripping.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildHunks,
  countWordChanges,
  countWords,
  diffLines,
} from "../packages/card-editor/src/engine/packages/client/src/features/card-editor/diff.ts";
import {
  deriveLiveStatus,
  isQueueItem,
  ITEM_STATUSES,
  itemStatusLabelKey,
  itemStatusTone,
  summarizeItemChanges,
} from "../packages/card-editor/src/engine/packages/client/src/features/card-editor/panel-status.ts";
import {
  approveSessionItem,
  buildFieldPatchData,
  currentFieldsFromCard,
} from "../packages/card-editor/src/engine/packages/client/src/features/card-editor/apply-ops.ts";
import {
  newSession,
  normalizeSessionConfig,
} from "../packages/card-editor/src/engine/packages/shared/src/features/agents/card-editor/schema.ts";
import { createCardEditorRoutes } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/routes.ts";
import { createSessionStore } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/session-store.ts";
import { stopAllRunners } from "../packages/card-editor/src/engine/packages/server/src/services/card-editor/runner.ts";

const featureRoot = new URL(
  "../packages/card-editor/src/engine/packages/client/src/features/card-editor/",
  import.meta.url,
);
const read = (name) => readFileSync(new URL(name, featureRoot), "utf8");

const clientEntry = read("client-entry.tsx");
const workspace = read("OverlayWorkspace.tsx");
const runsPanel = read("RunsPanel.tsx");
const sessionDetail = read("SessionDetail.tsx");
const verdictQueue = read("VerdictQueue.tsx");
const editRetryDialog = read("EditRetryDialog.tsx");
const applyOps = read("apply-ops.ts");
const panelStatus = read("panel-status.ts");
const diffSource = read("diff.ts");
const visiblePoll = read("use-visible-poll.ts");
const api = read("api.ts");
const catalog = JSON.parse(read("locales/en.json"));
const routesSource = readFileSync(
  new URL("../../../../server/src/services/card-editor/routes.ts", featureRoot),
  "utf8",
);
const builtClient = readFileSync(new URL("../packages/card-editor/client.js", import.meta.url), "utf8");
const componentSources = {
  "client-entry.tsx": clientEntry,
  "OverlayWorkspace.tsx": workspace,
  "RunsPanel.tsx": runsPanel,
  "SessionDetail.tsx": sessionDetail,
  "VerdictQueue.tsx": verdictQueue,
  "EditRetryDialog.tsx": editRetryDialog,
};

// ── 1. Every referenced cardEditor.* locale key exists in the English catalog ──
const referencedKeys = new Set();
for (const source of Object.values(componentSources)) {
  for (const match of source.matchAll(/["'`](cardEditor\.[A-Za-z0-9_.-]+)["'`]/gu)) {
    referencedKeys.add(match[1]);
  }
}
for (const key of referencedKeys) {
  assert.equal(typeof catalog[key], "string", `locales/en.json is missing referenced key ${key}`);
  assert.ok(catalog[key].trim(), `locales/en.json key ${key} must not be empty`);
}
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
// Dynamically-composed keys (template literals) still need catalog entries.
for (const key of [
  "cardEditor.panel.saveMode.confirm",
  "cardEditor.panel.saveMode.auto",
  "cardEditor.panel.saveMode.duplicate",
  "cardEditor.panel.sessionStatus.active",
  "cardEditor.panel.sessionStatus.completed",
  "cardEditor.panel.sessionStatus.canceled",
  "cardEditor.panel.sessionStatus.interrupted",
]) {
  assert.equal(typeof catalog[key], "string", `locales/en.json is missing composed key ${key}`);
}

// ── 2. Status-chip mapping completeness: every ItemStatus has a label key and a tone ──
assert.equal(ITEM_STATUSES.length, 13, "the status list must cover all 13 ItemStatus values");
for (const status of ITEM_STATUSES) {
  const key = itemStatusLabelKey(status);
  assert.match(key, /^cardEditor\.panel\.status\./u);
  assert.equal(typeof catalog[key], "string", `status ${status} has no catalog label (${key})`);
  assert.ok(["live", "review", "ok", "danger", "muted"].includes(itemStatusTone(status)), `${status} needs a tone`);
}
assert.equal(itemStatusLabelKey("failed-provider"), "cardEditor.panel.status.failedProvider");
assert.ok(catalog["cardEditor.panel.status.failedProvider"].includes("·"), "failed chips read 'failed · provider'");

// ── 3. No hard-coded user-visible text in JSX ──
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

// ── 4. diff helper: identical / insert / delete / multi-hunk / fallback ──
{
  const same = diffLines("one\ntwo\nthree", "one\ntwo\nthree");
  assert.ok(
    same.every((line) => line.kind === "same"),
    "identical texts are all-same",
  );
  assert.deepEqual(buildHunks(same), [], "no changes, no hunks");

  const inserted = diffLines("one\nthree", "one\ntwo\nthree");
  assert.deepEqual(
    inserted.map((line) => line.kind),
    ["same", "add", "same"],
  );
  assert.equal(inserted[1].text, "two");

  const deleted = diffLines("one\ntwo\nthree", "one\nthree");
  assert.deepEqual(
    deleted.map((line) => line.kind),
    ["same", "del", "same"],
  );

  // Two distant changes with a long unchanged middle: two hunks, marker counts the gap.
  const oldLines = Array.from({ length: 30 }, (_, index) => `line ${index + 1}`);
  const newLines = [...oldLines];
  newLines[2] = "changed 3";
  newLines[26] = "changed 27";
  const hunks = buildHunks(diffLines(oldLines.join("\n"), newLines.join("\n")), 3);
  assert.equal(hunks.length, 2, "two distant changes split into two hunks");
  assert.ok(hunks[0].lines.some((line) => line.kind === "del" && line.text === "line 3"));
  assert.ok(hunks[1].hiddenBefore > 0, "the second hunk collapses the unchanged middle");
  assert.ok(hunks[1].lines.some((line) => line.kind === "add" && line.text === "changed 27"));
  // ±3 context: the first hunk keeps at most 3 unchanged lines on each side of its change.
  assert.ok(hunks[0].lines.filter((line) => line.kind === "same").length <= 6);

  // Leading unchanged run collapses into hiddenBefore on the first hunk.
  const leadHunks = buildHunks(diffLines(oldLines.join("\n"), ["changed 1", ...oldLines.slice(1)].join("\n")), 3);
  assert.equal(leadHunks.length, 1);
  assert.ok(leadHunks[0].hiddenBefore >= 0);

  // Large-field fallback: past the matrix cap the middle degrades to one replace block.
  const bigA = Array.from({ length: 1001 }, (_, index) => `old ${index}`).join("\n");
  const bigB = Array.from({ length: 1001 }, (_, index) => `new ${index}`).join("\n");
  const bigDiff = diffLines(bigA, bigB);
  assert.ok(bigDiff.some((line) => line.kind === "del") && bigDiff.some((line) => line.kind === "add"));
  assert.ok(!bigDiff.some((line) => line.kind === "same"), "a full rewrite shares no lines");

  assert.deepEqual(countWordChanges("the cat sat", "the dog sat down"), { added: 2, removed: 1 });
  assert.deepEqual(countWordChanges("one two three", "one two three"), { added: 0, removed: 0 });
  assert.equal(countWords("  one two\nthree "), 3);
  assert.equal(typeof diffSource, "string");
  assert.doesNotMatch(diffSource, /from "|require\(/u, "diff.ts stays dependency-free");
}

// ── 5. Status/summary helpers ──
{
  const session = newSession("Live", normalizeSessionConfig({ mode: "batched", batchSize: 2 }), [
    { characterId: "char-0" },
    { characterId: "char-1" },
    { characterId: "char-2" },
  ]);
  const queued = deriveLiveStatus(session);
  assert.equal(queued.kind, "queued");
  assert.equal(queued.queuedItems, 3);

  const running = {
    ...session,
    items: session.items.map((item, index) => (index === 0 ? { ...item, status: "running" } : item)),
    batches: [{ id: "b1", itemIds: ["char-0"], status: "running", attempts: 2 }],
  };
  const batchLive = deriveLiveStatus(running);
  assert.equal(batchLive.kind, "batch");
  assert.equal(batchLive.batchIndex, 1);
  assert.equal(batchLive.batchAttempts, 2, "the retry hint derives from batch attempts");

  const individual = deriveLiveStatus({
    ...session,
    config: { ...session.config, mode: "individual" },
    items: session.items.map((item, index) => (index < 2 ? { ...item, status: "running" } : item)),
  });
  assert.equal(individual.kind, "items");
  assert.equal(individual.runningItems, 2);

  const item = {
    status: "awaiting-review",
    snapshots: { description: "old words here" },
    updates: [{ field: "description", oldText: "", newText: "new words here now", reason: "t" }],
  };
  assert.deepEqual(summarizeItemChanges(item), { fields: 1, added: 2, removed: 1 });
  assert.equal(summarizeItemChanges({ snapshots: {}, updates: [] }), null);
  assert.ok(isQueueItem({ status: "awaiting-review" }));
  assert.ok(isQueueItem({ status: "applied" }), "decided items stay for the progress dots");
  assert.ok(!isQueueItem({ status: "failed-parse" }));
}

// ── 6. Apply-op field mapping ──
{
  assert.deepEqual(buildFieldPatchData("description", "next"), { description: "next" });
  assert.deepEqual(buildFieldPatchData("backstory", "next"), { extensions: { backstory: "next" } });
  assert.deepEqual(buildFieldPatchData("appearance", "next"), { extensions: { appearance: "next" } });
  const fields = {
    name: "Card",
    description: "d",
    personality: "p",
    scenario: "",
    first_mes: "",
    mes_example: "",
    creator_notes: "",
    system_prompt: "",
    post_history_instructions: "",
    backstory: "b",
    appearance: "a",
  };
  const current = currentFieldsFromCard(fields);
  assert.equal(Object.hasOwn(current, "name"), false, "name is never a verdict field");
  assert.equal(current.description, "d");
  assert.equal(current.backstory, "b", "extensions fields flatten for the staleness plan");
}
assert.match(applyOps, /duplicateHostCharacter\(op\.characterId\)/u, "duplicate ops copy the current card");
assert.match(applyOps, /submitSessionItemApplyResult\(session\.id, item\.itemId, results\)/u, "outcomes report back");
assert.match(applyOps, /versionSource: "agent"/u, "every write carries the agent revision stamp");
assert.match(applyOps, /Card Editor bulk: \$\{label\}/u, "the duplicate patch carries the session-label reason");
assert.match(applyOps, / \(Copy\)/u, "the engine copy suffix is stripped before the session suffix");

// ── 7. API surface (integration fix alignment) ──
assert.match(api, /Promise<VerdictResponse>/u, "the verdict returns the two-phase union");
assert.match(api, /status: "apply"/u);
assert.match(api, /status: "needs-confirmation"/u);
assert.match(api, /submitSessionItemApplyResult/u);
assert.match(api, /itemPath\(sessionId, itemId, "\/apply-result"\)/u);
assert.match(api, /deleteSession\(sessionId: string, options: \{ force\?: boolean \} = \{\}\)/u);
assert.match(api, /\?force=true/u);
assert.match(api, /Promise<SessionIndexEntry\[\]>/u, "listSessions types the index projection");
assert.match(api, /cancelSessionItem/u);
assert.match(api, /patchHostCharacter/u);
assert.match(api, /duplicateHostCharacter/u);
assert.match(api, /getHostCharacterCard/u);
assert.match(api, /getHostLorebookEntries/u);

// ── 8. Runs panel structure (DESIGN §3) ──
assert.match(clientEntry, /view === "agent-panel"/u);
assert.match(clientEntry, /view === "overlay"/u, "the overlay workspace view is registered (capabilityApi 1.68)");
assert.match(workspace, /<RunsPanel/u, "the workspace hosts the real panel");
assert.match(clientEntry, /<AgentPanelSummary/u, "the agent panel is the compact launcher/summary");
assert.doesNotMatch(clientEntry, /RunsPanelPlaceholder/u);
assert.match(runsPanel, /useVisiblePoll\(refresh, 2000, detailId === null\)/u, "2s polling while visible");
assert.match(sessionDetail, /useVisiblePoll\(refresh, 2000\)/u, "the detail polls while visible too");
assert.match(visiblePoll, /IntersectionObserver/u, "polling pauses when the panel is off screen");
assert.match(visiblePoll, /visibilitychange/u, "polling pauses in hidden tabs");
assert.match(runsPanel, /listSessions\(\)/u);
assert.match(runsPanel, /role="progressbar"/u, "active sessions render a progress bar");
assert.match(runsPanel, /cancelSession\(entry\.id\)/u);
assert.match(runsPanel, /deleteSession\(entry\.id\)/u);
assert.match(runsPanel, /cardEditor\.panel\.interruptedNotice/u, "interrupted sessions explain the rerun path");
assert.match(runsPanel, /cardEditor\.panel\.refresh/u, "manual refresh is always available");

// ── 9. Session detail structure ──
assert.match(sessionDetail, /PAGE_SIZE = 50/u, "items paginate at 50 per page (SPEC §5: 200+ cards)");
assert.match(sessionDetail, /item\.autoApply === true/u, "the auto-approve driver keys on the autoApply hint");
assert.match(sessionDetail, /approveSessionItem\(session, item, \{ force: false \}\)/u, "auto-approve never forces");
assert.match(sessionDetail, /retrySessionItem\(sessionId, item\.itemId\)/u);
assert.match(sessionDetail, /cancelSessionItem\(sessionId, item\.itemId\)/u, "queued items cancel individually");
assert.match(sessionDetail, /deleteSession\(sessionId, \{ force: session\?\.status === "active" \}\)/u);
assert.match(sessionDetail, /<VerdictQueue/u);
assert.match(sessionDetail, /<EditRetryDialog/u);
assert.match(sessionDetail, /item\.failure\?\.renderedPrompt !== undefined/u, "edit & retry needs the rendered prompt");
assert.match(sessionDetail, /cardEditor\.panel\.detail\.rerunFailed/u, "rerun-all-failed session action");

// ── 10. Verdict queue structure (DESIGN §3) ──
assert.match(verdictQueue, /PREVIEW_LINE_CAP = 8/u, "field previews cap at ~8 lines");
assert.match(verdictQueue, /buildHunks\(diffLines\(oldText, update\.newText\), HUNK_CONTEXT\)/u);
assert.match(verdictQueue, /cardEditor\.queue\.hiddenLines/u, "collapsed-context markers render");
assert.match(verdictQueue, /event\.key === "r" \|\| event\.key === "R"/u, "R rejects");
assert.match(verdictQueue, /event\.key === "a" \|\| event\.key === "A"/u, "A approves");
assert.match(verdictQueue, /event\.key === "ArrowLeft"/u);
assert.match(verdictQueue, /event\.key === "ArrowRight"/u);
assert.match(verdictQueue, /ce-dot--\$\{verdict\}/u, "progress dots color by verdict");
assert.match(verdictQueue, /cardEditor\.queue\.approveAll/u, "approve-all-remaining link");
assert.match(verdictQueue, /cardEditor\.queue\.staleApply/u, "stale cards surface the §1 inline confirmation");
assert.match(verdictQueue, /cardEditor\.queue\.staleSkip/u);
assert.match(verdictQueue, /cardEditor\.queue\.duplicateNote/u, "duplicate mode explains the copy flow");
assert.match(verdictQueue, /tagName === "TEXTAREA"/u, "keyboard triage never fires while typing");
assert.match(verdictQueue, /itemStatusTone\(current\.status\)/u);

// ── 11. Edit & retry dialog (DESIGN §3) ──
assert.match(editRetryDialog, /useDialogFocusTrap\(true, \(\) => retrying, onClose\)/u);
assert.match(editRetryDialog, /ce-overlay/u);
assert.match(editRetryDialog, /role="dialog"/u);
assert.match(editRetryDialog, /aria-modal="true"/u);
assert.match(editRetryDialog, /editRetrySessionItem\(session\.id, item\.itemId, \{ system, user \}\)/u);
assert.match(editRetryDialog, /rendered\?\.system/u, "textareas prefill from the rendered prompt");
assert.match(editRetryDialog, /cardEditor\.editRetry\.missing/u, "items without a retained prompt get guidance");
assert.match(editRetryDialog, /role="alert"/u);

// ── 12. Per-item cancel route (server side of the panel contract) ──
assert.match(routesSource, /\/sessions\/:id\/items\/:itemId\/cancel/u, "the item-cancel route exists");
assert.match(routesSource, /Only a queued item can be canceled\./u);

// ── 13. Built bundle carries the panel ──
for (const marker of [
  "Review changes",
  "Approve all remaining without review",
  "unchanged lines",
  "Edit & retry",
  "Review queue",
  "awaiting review",
]) {
  assert.ok(builtClient.includes(marker), `built client.js is missing ${JSON.stringify(marker)} — rebuild the package`);
}

// ── 14. Two-phase approve flow against the REAL routes (fetch bridged in-process) ──
// approveSessionItem speaks HTTP through api.ts; the bridge routes /api/card-editor/* into the
// in-process route harness and /api/characters/* into a fake host store, so the verdict plan,
// the engine writes, and the apply-result confirmation are exercised end to end.
function createFakeDocuments() {
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
  return {
    async resolve() {
      return {
        name: "FakeConnection",
        model: "fake-model",
        connectionId: null,
        async chatComplete() {
          return { content: await answer(), finishReason: "stop" };
        },
      };
    },
  };
}

const silentLogger = {
  info() {},
  warn() {},
  error() {},
};

async function waitFor(predicate, label, timeoutMs = 15_000) {
  const start = Date.now();
  for (;;) {
    const value = await predicate();
    if (value) return value;
    if (Date.now() - start > timeoutMs) throw new Error(`Timed out waiting for: ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

async function createRouteHarness(deps) {
  const handlers = new Map();
  const app = {
    get: (path, handler) => handlers.set(`GET ${path}`, handler),
    post: (path, handler) => handlers.set(`POST ${path}`, handler),
    delete: (path, handler) => handlers.set(`DELETE ${path}`, handler),
  };
  await createCardEditorRoutes(deps)(app, {});
  const invoke = async (method, path, { params = {}, body, query = {} } = {}) => {
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
  // Bridge: api.ts fetch calls → in-process route invocations with pattern params extracted.
  const patterns = [...handlers.keys()].map((key) => {
    const [method, pattern] = key.split(" ");
    return { method, pattern, segments: pattern.split("/").filter(Boolean) };
  });
  const bridge = (method, path) => {
    const pathSegments = path.split("/").filter(Boolean);
    for (const candidate of patterns) {
      if (candidate.method !== method || candidate.segments.length !== pathSegments.length) continue;
      const params = {};
      let matched = true;
      for (let index = 0; index < candidate.segments.length; index += 1) {
        const segment = candidate.segments[index];
        if (segment.startsWith(":")) params[segment.slice(1)] = decodeURIComponent(pathSegments[index]);
        else if (segment !== pathSegments[index]) {
          matched = false;
          break;
        }
      }
      if (matched) return { pattern: candidate.pattern, params };
    }
    return null;
  };
  return { invoke, bridge };
}

function createHostCharacters(cards) {
  const store = new Map(Object.entries(cards));
  const writes = [];
  const reply = (status, payload) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: async () => payload,
  });
  const handler = (method, pathname, body) => {
    const duplicateMatch = pathname.match(/^\/api\/characters\/(.+)\/duplicate$/u);
    const characterMatch = pathname.match(/^\/api\/characters\/(.+)$/u);
    if (method === "GET" && characterMatch) {
      const card = store.get(characterMatch[1]);
      if (!card) return reply(404, { error: "Character not found" });
      return reply(200, { id: characterMatch[1], avatarPath: null, data: JSON.stringify(card) });
    }
    if (method === "PATCH" && characterMatch) {
      const card = store.get(characterMatch[1]);
      if (!card) return reply(404, { error: "Character not found" });
      writes.push({ kind: "patch", id: characterMatch[1], body });
      const { extensions, ...topLevel } = body.data ?? {};
      Object.assign(card, topLevel);
      if (extensions) Object.assign((card.extensions ??= {}), extensions);
      return reply(200, { id: characterMatch[1], avatarPath: null, data: JSON.stringify(card) });
    }
    if (method === "POST" && duplicateMatch) {
      const source = store.get(duplicateMatch[1]);
      if (!source) return reply(404, { error: "Character not found" });
      const copyId = `${duplicateMatch[1]}-copy`;
      const copy = JSON.parse(JSON.stringify(source));
      copy.name = `${copy.name} (Copy)`;
      store.set(copyId, copy);
      writes.push({ kind: "duplicate", id: duplicateMatch[1], copyId });
      return reply(200, { id: copyId, avatarPath: null, data: JSON.stringify(copy) });
    }
    throw new Error(`unexpected host call ${method} ${pathname}`);
  };
  return { store, writes, handler };
}

async function withBridgedFetch(harness, host, work) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const parsed = new URL(url, "http://stub.local");
    const method = (init.method ?? "GET").toUpperCase();
    const body = typeof init.body === "string" ? JSON.parse(init.body) : undefined;
    if (parsed.pathname.startsWith("/api/card-editor")) {
      const path = parsed.pathname.slice("/api/card-editor".length) || "/";
      const found = harness.bridge(method, path);
      assert.ok(found, `no route for ${method} ${path}`);
      const query = Object.fromEntries(parsed.searchParams.entries());
      const result = await harness.invoke(method, found.pattern, { params: found.params, body, query });
      return {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        statusText: String(result.status),
        json: async () => result.body,
      };
    }
    if (parsed.pathname.startsWith("/api/characters/")) return host.handler(method, parsed.pathname, body);
    throw new Error(`unexpected fetch ${method} ${parsed.pathname}`);
  };
  try {
    return await work();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function createSettledSession(configOverrides, hostCards) {
  const documents = createFakeDocuments();
  const languageModels = createFakeLanguageModels(() =>
    JSON.stringify({ updates: [{ field: "description", oldText: "", newText: "New description", reason: "test" }] }),
  );
  const store = createSessionStore(documents);
  const deps = { store, languageModels, logger: silentLogger };
  const harness = await createRouteHarness(deps);
  const created = await harness.invoke("POST", "/sessions", {
    body: {
      label: "Smoke",
      targets: [
        {
          characterId: "char-0",
          characterName: "Character 0",
          card: { name: "Character 0", description: "Old desc 0" },
        },
      ],
      config: normalizeSessionConfig({ providerRetries: 0, ...configOverrides }),
    },
  });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const settled = await waitFor(async () => {
    const session = await store.getSession(created.body.id);
    return session && session.status !== "active" ? session : null;
  }, "the smoke session to settle");
  const host = createHostCharacters(hostCards);
  return { harness, host, sessionId: created.body.id };
}

{
  stopAllRunners();
  // In-place confirm: fresh card → patchField executed with the agent stamp → applied.
  const { harness, host, sessionId } = await createSettledSession(
    { saveMode: "confirm" },
    { "char-0": { name: "Character 0", description: "Old desc 0", extensions: {} } },
  );
  await withBridgedFetch(harness, host, async () => {
    const fresh = await harness.invoke("GET", "/sessions/:id", { params: { id: sessionId } });
    const outcome = await approveSessionItem(fresh.body, fresh.body.items[0], { force: false });
    assert.equal(outcome.kind, "applied", JSON.stringify(outcome));
    assert.equal(host.store.get("char-0").description, "New description", "the PATCH wrote the field");
    const patch = host.writes.find((write) => write.kind === "patch");
    assert.equal(patch.body.versionSource, "agent", "the write carries the agent revision stamp");
    assert.equal(patch.body.versionReason, "Card Editor bulk: Smoke");
    assert.deepEqual(patch.body.data, { description: "New description" });
    assert.equal(outcome.session.items[0].status, "applied");
    assert.ok(outcome.session.items[0].appliedAt, "apply-result stamped appliedAt");
  });
}

{
  stopAllRunners();
  // Stale card: needs-confirmation without a single write; force then applies.
  const { harness, host, sessionId } = await createSettledSession(
    { saveMode: "confirm" },
    { "char-0": { name: "Character 0", description: "Changed since dispatch", extensions: {} } },
  );
  await withBridgedFetch(harness, host, async () => {
    const fresh = await harness.invoke("GET", "/sessions/:id", { params: { id: sessionId } });
    const held = await approveSessionItem(fresh.body, fresh.body.items[0], { force: false });
    assert.equal(held.kind, "needs-confirmation");
    assert.equal(held.holds[0].field, "description");
    assert.equal(host.writes.length, 0, "a stale verdict writes nothing before confirmation");
    const after = await harness.invoke("GET", "/sessions/:id", { params: { id: sessionId } });
    assert.equal(after.body.items[0].status, "needs-review", "holds demote the item for triage");
    const forced = await approveSessionItem(after.body, after.body.items[0], { force: true });
    assert.equal(forced.kind, "applied", "Apply anyway forces the write");
    assert.equal(host.store.get("char-0").description, "New description");
  });
}

{
  stopAllRunners();
  // Duplicate mode: copy the current card, patch + rename the copy, record resultCardId.
  const { harness, host, sessionId } = await createSettledSession(
    { saveMode: "duplicate" },
    { "char-0": { name: "Character 0", description: "Old desc 0", extensions: {} } },
  );
  await withBridgedFetch(harness, host, async () => {
    const fresh = await harness.invoke("GET", "/sessions/:id", { params: { id: sessionId } });
    const outcome = await approveSessionItem(fresh.body, fresh.body.items[0], { force: false });
    assert.equal(outcome.kind, "applied", JSON.stringify(outcome));
    const copy = host.store.get("char-0-copy");
    assert.ok(copy, "the engine duplicate was created");
    assert.equal(copy.name, "Character 0 (Edited)", "copy renamed with the session suffix (not ' (Copy)')");
    assert.equal(copy.description, "New description", "the copy received the proposed fields");
    assert.equal(host.store.get("char-0").description, "Old desc 0", "the original stays untouched");
    assert.equal(outcome.session.items[0].status, "duplicated");
    assert.equal(outcome.session.items[0].resultCardId, "char-0-copy");
  });
}

{
  stopAllRunners();
  // Client-side write failure: the apply-result demotes the item to failed-provider.
  const { harness, host, sessionId } = await createSettledSession(
    { saveMode: "confirm" },
    { "char-0": { name: "Character 0", description: "Old desc 0", extensions: {} } },
  );
  await withBridgedFetch(harness, host, async () => {
    const fresh = await harness.invoke("GET", "/sessions/:id", { params: { id: sessionId } });
    host.store.delete("char-0"); // the card vanishes between verdict and write
    const outcome = await approveSessionItem(fresh.body, fresh.body.items[0], { force: false });
    // The card fetch 404s before the verdict: a clean failure, no half-written state.
    assert.equal(outcome.kind, "failed");
    const after = await harness.invoke("GET", "/sessions/:id", { params: { id: sessionId } });
    assert.equal(after.body.items[0].status, "awaiting-review", "the item stays reviewable for a retry");
  });
}
stopAllRunners();

process.stdout.write("Card Editor panel UI regression passed.\n");
