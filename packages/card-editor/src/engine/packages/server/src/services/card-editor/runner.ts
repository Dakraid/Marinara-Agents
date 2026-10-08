/**
 * Session runner for Card Editor bulk runs (ARCH §4, SPEC F3.3–F3.5/F5). One in-process runner per
 * session, kept in a module registry keyed by session id; runners never throw into routes — every
 * failure is recorded on the affected items/batches.
 *
 * Dispatch: individual mode queues one single-card call per item (worker pool of `concurrency`);
 * batched mode queues calls of ≤ batchSize cards. A call is batched iff it carries more than one
 * card — prompt assembly and response parsing both derive the contract from that count (lockstep).
 * Context overflow on a batched call marks the batch "split" and re-enqueues two halves (⌈n/2⌉),
 * recursing to single-card calls; an overflowing single-card call fails the item as provider.
 *
 * Success routing is uniform (coordinator decision): succeeded is transient — items with validated
 * updates land in awaiting-review for every save mode; saveMode "auto" adds an `autoApply` hint the
 * panel uses to auto-drive the verdict flow. Items with zero updates auto-approve to applied (no-op,
 * ARCH §5). The two-phase apply itself is owned by the verdict/apply-result routes.
 *
 * Cancel aborts in-flight calls (AbortController per call) and marks queued/running items canceled,
 * keeping partial results. Deactivation aborts without status writes; the next activation marks
 * stranded active sessions interrupted (server-entry).
 */
import {
  advanceItemStatus,
  type BulkSession,
  type BulkSessionBatch,
  type CardFieldUpdate,
  type ItemStatus,
  type SessionItem,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { planApply } from "./apply.ts";
import type { CharacterLike } from "./context.ts";
import { parseBatchResponse, parseSingleResponse } from "./parse.ts";
import { assemblePrompt, type PromptTarget } from "./prompts.ts";
import {
  callLlm,
  detectRefusal,
  LlmCallError,
  REFUSAL_REMINDER,
  STRICT_JSON_REMINDER,
  type LlmResolverHost,
} from "./llm.ts";
import type { SessionPromptMaterial, SessionStore } from "./session-store.ts";

export interface RunnerLogger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(error: unknown, message: string, ...args: unknown[]): void;
}

export interface RunnerDeps {
  store: SessionStore;
  languageModels: LlmResolverHost;
  logger: RunnerLogger;
}

/** Route-mappable failure: statusCode is surfaced as the HTTP status by routes. */
export class SessionActionError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "SessionActionError";
    this.statusCode = statusCode;
  }
}

interface RunnerTask {
  /** Present for batched-mode calls (including overflow halves, which may hold one item). */
  batchId?: string;
  itemIds: string[];
  /** edit-retry: dispatch exactly this prompt as a single-card call. */
  promptOverride?: { system: string; user: string };
}

interface SessionRunner {
  sessionId: string;
  deps: RunnerDeps;
  queue: RunnerTask[];
  active: number;
  controllers: Set<AbortController>;
  canceled: boolean;
  pumping: boolean;
}

const runners = new Map<string, SessionRunner>();

const FAILED_STATUS_BY_KIND = {
  provider: "failed-provider",
  refusal: "failed-refusal",
  parse: "failed-parse",
} as const satisfies Record<string, ItemStatus>;

type FailureKind = keyof typeof FAILED_STATUS_BY_KIND;

const MESSAGE_CAP = 2_000;
const RAW_OUTPUT_CAP = 100_000;
const RENDERED_PROMPT_CAP = 1_000_000;

function capText(text: string, cap: number): string {
  return text.length <= cap ? text : `${text.slice(0, cap)}…[truncated]`;
}

function errorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : String(error ?? "")) || "unknown provider error";
}

/** Splits a batch's items into halves of ⌈n/2⌉ and n−⌈n/2⌉ (ARCH §4 overflow recovery). Callers
 *  never split a single item: a one-card context overflow fails instead of recursing forever. */
export function splitItemIds(itemIds: readonly string[]): [string[], string[]] {
  const half = Math.ceil(itemIds.length / 2);
  return [itemIds.slice(0, half), itemIds.slice(half)];
}

/** SPEC F5.3: sessions that were active when the server stopped are marked interrupted on the next
 *  activation (queued/running items interrupted with them); partial results are kept. */
export function interruptActiveSession(session: BulkSession): BulkSession {
  if (session.status !== "active") return session;
  return {
    ...session,
    status: "interrupted",
    items: session.items.map((item) =>
      item.status === "queued" || item.status === "running" ? advanceItemStatus(item, "interrupted") : item,
    ),
    batches: session.batches.map((batch) =>
      batch.status === "pending" || batch.status === "running" ? { ...batch, status: "failed" as const } : batch,
    ),
  };
}

/** SPEC F5.2: cancel aborts in-flight work; queued/running items cancel, everything already
 *  settled (awaiting-review, failed, applied, …) is kept as the session's partial results. */
export function cancelSessionInPlace(session: BulkSession): BulkSession {
  if (session.status !== "active") return session;
  return {
    ...session,
    status: "canceled",
    items: session.items.map((item) =>
      item.status === "queued" || item.status === "running" ? advanceItemStatus(item, "canceled") : item,
    ),
    batches: session.batches.map((batch) =>
      batch.status === "pending" || batch.status === "running" ? { ...batch, status: "failed" as const } : batch,
    ),
  };
}

function newBatch(itemIds: string[]): BulkSessionBatch {
  return { id: globalThis.crypto.randomUUID(), itemIds, status: "pending", attempts: 0 };
}

/** Rebuilds the prompt card from the dispatch snapshots. Snapshots are normalizeCardPromptText
 *  output and normalization is idempotent, so the re-rendered block is byte-identical. */
function cardFromItem(item: SessionItem): CharacterLike {
  return { name: item.characterName, ...item.snapshots };
}

function resolveBehaviorCharacter(
  item: SessionItem,
  allItems: readonly SessionItem[],
  material: SessionPromptMaterial,
  logger: RunnerLogger,
): CharacterLike | null | undefined {
  if (item.behaviorOverride === undefined) return undefined; // inherit the session-level character
  if (item.behaviorOverride === null) return null; // explicit None for this card
  // A materialized override card (any library character) wins over the reference form.
  const overrideCard = material.behaviorOverrideCards?.[item.characterId];
  if (overrideCard) return overrideCard;
  const source = allItems.find((candidate) => candidate.characterId === item.behaviorOverride);
  if (!source) {
    // POST /sessions rejects unresolvable overrides; this is the corrupt-storage fallback.
    logger.warn("Card Editor behavior override does not resolve to a session target; skipping the block", {
      characterId: item.characterId,
      behaviorOverride: item.behaviorOverride,
    });
    return null;
  }
  return cardFromItem(source);
}

function succeedItem(item: SessionItem, updates: CardFieldUpdate[], config: BulkSession["config"]) {
  // queued is unreachable through the dispatch path but legal to absorb defensively.
  const running = item.status === "queued" ? advanceItemStatus(item, "running") : item;
  let next: SessionItem = advanceItemStatus({ ...running, updates }, "succeeded");
  if (updates.length === 0) {
    // Auto-approved no-op (ARCH §5): nothing to review, nothing to write.
    return { ...advanceItemStatus(next, "applied"), appliedAt: new Date().toISOString() };
  }
  next = advanceItemStatus(next, "awaiting-review");
  // Legacy auto-save is immediate; completion enforcement must wait until every call drains.
  if (config.saveMode === "auto" && (config.completionMode ?? "ask") === "ask") return { ...next, autoApply: true };
  if (next.autoApply !== undefined) {
    const { autoApply: _dropped, ...rest } = next;
    return rest;
  }
  return next;
}

function failItem(
  item: SessionItem,
  kind: FailureKind,
  message: string,
  attempts: number,
  detail?: { rawOutput?: string; renderedPrompt?: { system: string; user: string } },
): SessionItem {
  const running = item.status === "queued" ? advanceItemStatus(item, "running") : item;
  const failed = advanceItemStatus(running, FAILED_STATUS_BY_KIND[kind]);
  return {
    ...failed,
    failure: {
      kind,
      message: capText(message, MESSAGE_CAP),
      ...(detail?.rawOutput === undefined ? {} : { rawOutput: capText(detail.rawOutput, RAW_OUTPUT_CAP) }),
      ...(detail?.renderedPrompt === undefined
        ? {}
        : {
            renderedPrompt: {
              system: capText(detail.renderedPrompt.system, RENDERED_PROMPT_CAP),
              user: capText(detail.renderedPrompt.user, RENDERED_PROMPT_CAP),
            },
          }),
      attempts,
    },
  };
}

function mapItems(
  session: BulkSession,
  itemIds: readonly string[],
  mutate: (item: SessionItem) => SessionItem,
): SessionItem[] {
  const ids = new Set(itemIds);
  return session.items.map((item) => (ids.has(item.itemId) ? mutate(item) : item));
}

function mapBatch(
  session: BulkSession,
  batchId: string | undefined,
  from: BulkSessionBatch["status"],
  to: BulkSessionBatch["status"],
): BulkSessionBatch[] {
  if (!batchId) return session.batches;
  return session.batches.map((batch) =>
    batch.id === batchId && batch.status === from ? { ...batch, status: to } : batch,
  );
}

function getOrCreateRunner(deps: RunnerDeps, sessionId: string): SessionRunner {
  const existing = runners.get(sessionId);
  if (existing) return existing;
  const runner: SessionRunner = {
    sessionId,
    deps,
    queue: [],
    active: 0,
    controllers: new Set(),
    canceled: false,
    pumping: false,
  };
  runners.set(sessionId, runner);
  return runner;
}

function enqueue(runner: SessionRunner, tasks: readonly RunnerTask[]): void {
  if (runner.canceled) return;
  runner.queue.push(...tasks);
  void pump(runner);
}

async function pump(runner: SessionRunner): Promise<void> {
  if (runner.pumping) return;
  runner.pumping = true;
  try {
    if (!runner.canceled && runner.queue.length > 0) {
      const session = await runner.deps.store.getSession(runner.sessionId);
      if (!session || session.status !== "active") {
        runner.queue = [];
      } else {
        // The panel's max-parallel-agents setting caps the session's own concurrency on top of
        // the schema ceiling; a settings read per pump cycle is the same cost as the session read.
        const settings = await runner.deps.store.getSettings();
        const parallelCap = Math.min(
          session.config.concurrency,
          settings.maxParallelAgents ?? session.config.concurrency,
        );
        while (!runner.canceled && runner.queue.length > 0 && runner.active < parallelCap) {
          const task = runner.queue.shift()!;
          runner.active += 1;
          void runTask(runner, task)
            .catch((error: unknown) => runner.deps.logger.error(error, "Card Editor dispatch task failed unexpectedly"))
            .finally(() => {
              runner.active -= 1;
              void pump(runner);
            });
        }
      }
    }
  } catch (error) {
    runner.deps.logger.error(error, "Card Editor pump failed");
  } finally {
    runner.pumping = false;
  }
  if (runner.canceled) return;
  if (runner.queue.length > 0) {
    // Missed-wakeup guard: an enqueue landed while this pump was between check and exit. With
    // active > 0 the finishing tasks re-pump, so only the idle pool needs the nudge.
    if (runner.active === 0) void pump(runner);
    return;
  }
  if (runner.active === 0) await finishIfDrained(runner);
}

export type CompletionCurrentFields = Readonly<Record<string, Record<string, string>>>;

/**
 * Plans the queue-drain policy for successful outcomes only. Duplicate enforcement is fully
 * server-planable because it copies the current card and never staleness-blocks. In-place apply
 * requires current host fields, which the package server cannot read; without them the item stays
 * awaiting-review until the polling client supplies those fields through the verdict route. The
 * same function is exported for the route regression to pin fresh/stale planning behavior.
 */
export function planCompletionEnforcement(
  session: BulkSession,
  currentFieldsByCharacterId: CompletionCurrentFields = {},
): BulkSession {
  const completionMode = session.config.completionMode ?? "ask";
  if (completionMode === "ask") return session;
  return {
    ...session,
    items: session.items.map((sourceItem) => {
      // A succeeded item is only possible in a hand-built/corrupt fixture; normal dispatch moves
      // it immediately to awaiting-review. No rejected/canceled/failed outcome is ever considered.
      const item = sourceItem.status === "succeeded" ? advanceItemStatus(sourceItem, "awaiting-review") : sourceItem;
      if (item.status !== "awaiting-review") return sourceItem;
      const currentFields = currentFieldsByCharacterId[item.characterId];
      if (completionMode === "apply" && currentFields === undefined) return item;
      const ops = planApply(item, currentFields ?? {}, {
        force: false,
        saveMode: completionMode === "duplicate" ? "duplicate" : "auto",
        label: session.label,
        duplicateSuffix: session.config.duplicateSuffix,
        ...(session.config.duplicatePrefix === undefined ? {} : { duplicatePrefix: session.config.duplicatePrefix }),
      });
      if (ops.some((op) => op.op === "hold")) return advanceItemStatus(item, "needs-review");
      return {
        ...advanceItemStatus(item, completionMode === "duplicate" ? "duplicated" : "applied"),
        pendingOps: ops,
      };
    }),
  };
}

async function finishIfDrained(runner: SessionRunner): Promise<void> {
  try {
    await runner.deps.store.updateSession(runner.sessionId, (session) => {
      if (session.status !== "active") return session;
      if (session.items.some((item) => item.status === "queued" || item.status === "running")) return session;
      if (session.batches.some((batch) => batch.status === "pending" || batch.status === "running")) return session;
      return planCompletionEnforcement({ ...session, status: "completed" as const });
    });
  } catch (error) {
    runner.deps.logger.error(error, "Card Editor session completion could not be recorded");
  }
}

async function persistFailure(
  runner: SessionRunner,
  task: RunnerTask,
  kind: FailureKind,
  message: string,
  attempts: number,
  detail?: { rawOutput?: string; renderedPrompt?: { system: string; user: string } },
): Promise<void> {
  await runner.deps.store.updateSession(runner.sessionId, (session) => ({
    ...session,
    items: mapItems(session, task.itemIds, (item) =>
      item.status === "running" ? failItem(item, kind, message, attempts, detail) : item,
    ),
    batches: mapBatch(session, task.batchId, "running", "failed"),
  }));
}

async function persistSuccess(
  runner: SessionRunner,
  task: RunnerTask,
  updatesByItemId: ReadonlyMap<string, CardFieldUpdate[]>,
): Promise<void> {
  await runner.deps.store.updateSession(runner.sessionId, (session) => ({
    ...session,
    items: mapItems(session, [...updatesByItemId.keys()], (item) =>
      item.status === "running" || item.status === "queued"
        ? succeedItem(item, updatesByItemId.get(item.itemId) ?? [], session.config)
        : item,
    ),
    batches: mapBatch(session, task.batchId, "running", "done"),
  }));
}

async function splitBatchCall(
  runner: SessionRunner,
  task: RunnerTask,
  items: readonly SessionItem[],
  attempts: number,
): Promise<void> {
  const halves = splitItemIds(items.map((item) => item.itemId)).filter((ids) => ids.length > 0);
  const batches = halves.map(newBatch);
  runner.deps.logger.info("Card Editor batch split after a context overflow", {
    sessionId: runner.sessionId,
    batchId: task.batchId,
    items: items.length,
    attempts,
  });
  await runner.deps.store.updateSession(runner.sessionId, (session) => ({
    ...session,
    items: mapItems(
      session,
      items.map((item) => item.itemId),
      (item) => {
        const half = batches.find((batch) => batch.itemIds.includes(item.itemId));
        return half && (item.status === "running" || item.status === "queued") ? { ...item, batchId: half.id } : item;
      },
    ),
    batches: [...mapBatch(session, task.batchId, "running", "split"), ...batches],
  }));
  enqueue(
    runner,
    batches.map((batch) => ({ batchId: batch.id, itemIds: batch.itemIds })),
  );
}

/** Per-call policy loop (SPEC F3.5): provider retries live in callLlm; refusals re-run with a terse
 *  reminder up to refusalRetries; an unparseable response gets one strict-JSON reminder retry, then
 *  fails single-card calls as failed-parse or fans a batch out into individual re-runs. */
async function runPolicyLoop(
  runner: SessionRunner,
  task: RunnerTask,
  items: readonly SessionItem[],
  config: BulkSession["config"],
  prompt: { system: string; user: string },
  controller: AbortController,
): Promise<void> {
  const { languageModels, logger } = runner.deps;
  const sessionId = runner.sessionId;
  const batched = items.length > 1;
  const characterIds = items.map((item) => item.characterId);
  let messages = { system: prompt.system, user: prompt.user };
  let refusalAttempts = 0;
  let refusalReminderAppended = false;
  let jsonReminderUsed = false;
  let totalAttempts = 0;

  for (;;) {
    if (runner.canceled || controller.signal.aborted) return;
    let output: string;
    try {
      const outcome = await callLlm(languageModels, config.connectionId, messages, {
        signal: controller.signal,
        providerRetries: config.providerRetries,
        attemptLog: (entry) =>
          logger.info("Card Editor provider call failed", {
            sessionId,
            batchId: task.batchId,
            attempt: entry.attempt,
            classification: entry.classification,
            retryDelayMs: entry.retryDelayMs,
            error: entry.message,
          }),
      });
      totalAttempts += outcome.attempts;
      output = outcome.output;
    } catch (error) {
      if (runner.canceled || controller.signal.aborted) return;
      if (error instanceof LlmCallError) totalAttempts += error.attempts;
      if (error instanceof LlmCallError && error.classification === "overflow" && batched) {
        await splitBatchCall(runner, task, items, totalAttempts);
        return;
      }
      const message =
        error instanceof LlmCallError && error.classification === "overflow"
          ? `context overflow on a single-card call: ${errorMessage(error)}`
          : errorMessage(error);
      await persistFailure(runner, task, "provider", message, totalAttempts);
      return;
    }

    const parsed = batched
      ? parseBatchResponse(output, characterIds, { rebalance: config.rebalance })
      : parseSingleResponse(output, characterIds[0]!, { rebalance: config.rebalance });

    if (detectRefusal(output, parsed.ok)) {
      if (refusalAttempts < config.refusalRetries) {
        refusalAttempts += 1;
        if (!refusalReminderAppended) {
          messages = { ...messages, user: messages.user + REFUSAL_REMINDER };
          refusalReminderAppended = true;
        }
        continue;
      }
      await persistFailure(runner, task, "refusal", "The model refused the edit request.", totalAttempts, {
        rawOutput: output,
        renderedPrompt: messages,
      });
      return;
    }

    if (!parsed.ok) {
      if (!jsonReminderUsed) {
        jsonReminderUsed = true;
        messages = { ...messages, user: messages.user + STRICT_JSON_REMINDER };
        continue;
      }
      if (!batched) {
        await persistFailure(
          runner,
          task,
          "parse",
          parsed.parseError ?? "The response did not contain parseable updates.",
          totalAttempts,
          { rawOutput: output, renderedPrompt: messages },
        );
        return;
      }
      // Batch-wide parse failure: the cards are not at fault, so each re-runs individually
      // (marked via the log, not failed — ARCH §4) where the single-card contract owns failures.
      logger.warn("Card Editor batch response stayed unparseable; re-running its cards individually", {
        sessionId,
        batchId: task.batchId,
      });
      await runner.deps.store.updateSession(sessionId, (session) => ({
        ...session,
        batches: mapBatch(session, task.batchId, "running", "failed"),
      }));
      enqueue(
        runner,
        items.map((item) => ({ itemIds: [item.itemId] })),
      );
      return;
    }

    if (!batched) {
      const item = items[0]!;
      await persistSuccess(runner, task, new Map([[item.itemId, parsed.results.get(item.characterId) ?? []]]));
      return;
    }

    const answered = new Map<string, CardFieldUpdate[]>();
    const missing: SessionItem[] = [];
    for (const item of items) {
      const updates = parsed.results.get(item.characterId);
      if (updates === undefined) missing.push(item);
      else answered.set(item.itemId, updates);
    }
    if (missing.length > 0) {
      logger.warn("Card Editor batch response skipped cards; re-running them individually", {
        sessionId,
        batchId: task.batchId,
        characterIds: missing.map((item) => item.characterId),
      });
    }
    // Missing cards stay running and take the single-card path; the batch call itself completed.
    await persistSuccess(runner, task, answered);
    enqueue(
      runner,
      missing.map((item) => ({ itemIds: [item.itemId] })),
    );
    return;
  }
}

async function runTask(runner: SessionRunner, task: RunnerTask): Promise<void> {
  const { store, logger } = runner.deps;
  const controller = new AbortController();
  runner.controllers.add(controller);
  try {
    const session = await store.getSession(runner.sessionId);
    if (!session || runner.canceled || session.status !== "active") return;
    const wanted = new Set(task.itemIds);
    const items = session.items.filter(
      (item) => wanted.has(item.itemId) && (item.status === "queued" || item.status === "running"),
    );
    if (items.length === 0) {
      // Nothing runnable (e.g. canceled between planning and dispatch): settle the batch record.
      await store.updateSession(runner.sessionId, (current) => ({
        ...current,
        batches: mapBatch(current, task.batchId, "running", "failed"),
      }));
      return;
    }
    const storedMaterial = await store.getSessionMaterial(runner.sessionId);
    if (!storedMaterial) {
      logger.warn("Card Editor prompt material is missing; dispatching without lorebooks or behavior character", {
        sessionId: runner.sessionId,
      });
    }
    const material: SessionPromptMaterial = storedMaterial ?? { version: 1, lorebooks: [], behaviorCharacter: null };

    await store.updateSession(runner.sessionId, (current) => ({
      ...current,
      items: mapItems(current, task.itemIds, (item) => {
        const withBatch = task.batchId && item.batchId !== task.batchId ? { ...item, batchId: task.batchId } : item;
        return withBatch.status === "queued" ? advanceItemStatus(withBatch, "running") : withBatch;
      }),
      batches: current.batches.map((batch) =>
        batch.id === task.batchId && batch.status === "pending"
          ? { ...batch, status: "running" as const, attempts: batch.attempts + 1 }
          : batch,
      ),
    }));

    const prompt =
      task.promptOverride ??
      assemblePrompt({
        preset: session.config.presetId,
        ...(session.config.customTemplate === undefined ? {} : { customTemplate: session.config.customTemplate }),
        globalInstruction: session.config.globalInstruction,
        targets: items.map((item): PromptTarget => ({
          characterId: item.characterId,
          card: cardFromItem(item),
          ...(item.note === undefined ? {} : { userNote: item.note }),
          behaviorCharacter: resolveBehaviorCharacter(item, session.items, material, logger),
        })),
        lorebooks: material.lorebooks,
        behaviorCharacter: material.behaviorCharacter,
        rebalance: session.config.rebalance,
      });

    await runPolicyLoop(runner, task, items, session.config, prompt, controller);
  } catch (error) {
    if (runner.canceled || controller.signal.aborted) return;
    logger.error(error, "Card Editor dispatch failed; marking its items as failed-provider");
    // Defensive net: the policy loop records its own failures; only unexpected throws land here
    // (e.g. a corrupt custom template surviving POST validation, or a store hiccup).
    await persistFailure(runner, task, "provider", errorMessage(error), 0).catch((writeError: unknown) =>
      logger.error(writeError, "Card Editor could not record a dispatch failure"),
    );
  } finally {
    runner.controllers.delete(controller);
  }
}

async function planDispatch(runner: SessionRunner): Promise<void> {
  const session = await runner.deps.store.getSession(runner.sessionId);
  if (!session || session.status !== "active") return;
  const queued = session.items.filter((item) => item.status === "queued");
  if (queued.length === 0) {
    await finishIfDrained(runner);
    return;
  }
  if (session.config.mode === "batched") {
    const groups: string[][] = [];
    for (let index = 0; index < queued.length; index += session.config.batchSize) {
      groups.push(queued.slice(index, index + session.config.batchSize).map((item) => item.itemId));
    }
    const batches = groups.map(newBatch);
    await runner.deps.store.updateSession(runner.sessionId, (current) => ({
      ...current,
      batches: [...current.batches, ...batches],
    }));
    enqueue(
      runner,
      batches.map((batch) => ({ batchId: batch.id, itemIds: batch.itemIds })),
    );
    return;
  }
  enqueue(
    runner,
    queued.map((item) => ({ itemIds: [item.itemId] })),
  );
}

/** Starts (or replaces, after a restart-style re-activation) the runner for a session and kicks off
 *  dispatch planning. Fire-and-forget: failures land on the session's items, never on the caller. */
export function startRunner(deps: RunnerDeps, sessionId: string): void {
  const runner = getOrCreateRunner(deps, sessionId);
  runner.canceled = false;
  void planDispatch(runner).catch((error: unknown) => {
    deps.logger.error(error, "Card Editor dispatch planning failed");
    void deps.store
      .updateSession(sessionId, (session) => ({
        ...session,
        items: session.items.map((item) =>
          item.status === "queued" ? failItem(item, "provider", errorMessage(error), 0) : item,
        ),
      }))
      .catch((writeError: unknown) => deps.logger.error(writeError, "Card Editor could not record a planning failure"));
  });
}

/** SPEC F5.2: abort in-flight calls and mark queued/running items canceled, keeping partial
 *  results. Sessions that are not active are returned unchanged (nothing left to cancel). */
export async function cancelSessionRun(deps: RunnerDeps, sessionId: string): Promise<BulkSession> {
  const runner = runners.get(sessionId);
  if (runner) {
    runner.canceled = true;
    runner.queue = [];
    for (const controller of runner.controllers) controller.abort();
    runners.delete(sessionId);
  }
  const updated = await deps.store.updateSession(sessionId, (session) => cancelSessionInPlace(session));
  if (!updated) throw new SessionActionError("Card Editor session not found.", 404);
  return updated;
}

/** Re-dispatches one failed item. With a promptOverride (edit-retry, SPEC F3.6) the given prompt is
 *  dispatched verbatim as a single-card call; otherwise the original config and dispatch snapshots
 *  re-render the identical prompt. Returns the updated session for the route response. */
export async function retryItemRun(
  deps: RunnerDeps,
  sessionId: string,
  itemId: string,
  promptOverride?: { system: string; user: string },
): Promise<BulkSession> {
  if (promptOverride !== undefined && promptOverride !== null) {
    if (typeof promptOverride.system !== "string" || typeof promptOverride.user !== "string") {
      throw new SessionActionError("edit-retry requires system and user prompt strings.", 400);
    }
  }
  const updated = await deps.store.updateSession(sessionId, (session) => {
    if (session.status !== "active" && session.status !== "completed") {
      throw new SessionActionError("Only items of an active or completed session can be retried.", 409);
    }
    const item = session.items.find((candidate) => candidate.itemId === itemId);
    if (!item) throw new SessionActionError("Card Editor session item not found.", 404);
    if (item.status !== "failed-provider" && item.status !== "failed-refusal" && item.status !== "failed-parse") {
      throw new SessionActionError("Only failed items can be retried.", 409);
    }
    const running = advanceItemStatus(item, "running");
    const { failure: _failure, updates: _updates, pendingOps: _pendingOps, ...rest } = running;
    return {
      ...session,
      status: "active" as const,
      items: session.items.map((candidate) => (candidate.itemId === itemId ? rest : candidate)),
    };
  });
  if (!updated) throw new SessionActionError("Card Editor session not found.", 404);
  const runner = getOrCreateRunner(deps, sessionId);
  runner.canceled = false;
  enqueue(runner, [{ itemIds: [itemId], ...(promptOverride ? { promptOverride } : {}) }]);
  return updated;
}

/** Deactivation path (ARCH §5): abort every in-flight call without touching session state —
 *  sessions remain readable and the next activation marks stranded ones interrupted. */
export function stopAllRunners(): void {
  for (const runner of runners.values()) {
    runner.canceled = true;
    runner.queue = [];
    for (const controller of runner.controllers) controller.abort();
  }
  runners.clear();
}

export function runnerRegistrySize(): number {
  return runners.size;
}
