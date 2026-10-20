/**
 * Pure status/summary mapping for the runs panel and verdict queue (DESIGN §3). Kept free of
 * React and fetch so the UI regression can drive every branch under plain Node type-stripping.
 */
import type {
  BulkSession,
  ItemStatus,
  SessionItem,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { countWordChanges } from "./diff.ts";
import { decodeXmlEntities } from "../../../../shared/src/features/agents/card-editor/text.ts";

/** Every ItemStatus, in display order — the regression asserts the label map covers all of them. */
export const ITEM_STATUSES: readonly ItemStatus[] = [
  "queued",
  "running",
  "succeeded",
  "awaiting-review",
  "needs-review",
  "applied",
  "duplicated",
  "rejected",
  "failed-provider",
  "failed-refusal",
  "failed-parse",
  "canceled",
  "interrupted",
  "awaiting-split",
  "split",
  "staged",
];

export const SESSION_STATUSES: readonly BulkSession["status"][] = ["active", "completed", "canceled", "interrupted"];

const ITEM_STATUS_KEY: Record<ItemStatus, string> = {
  queued: "cardEditor.panel.status.queued",
  running: "cardEditor.panel.status.running",
  succeeded: "cardEditor.panel.status.succeeded",
  "awaiting-review": "cardEditor.panel.status.awaitingReview",
  "needs-review": "cardEditor.panel.status.needsReview",
  applied: "cardEditor.panel.status.applied",
  duplicated: "cardEditor.panel.status.duplicated",
  rejected: "cardEditor.panel.status.rejected",
  "failed-provider": "cardEditor.panel.status.failedProvider",
  "failed-refusal": "cardEditor.panel.status.failedRefusal",
  "failed-parse": "cardEditor.panel.status.failedParse",
  canceled: "cardEditor.panel.status.canceled",
  interrupted: "cardEditor.panel.status.interrupted",
  "awaiting-split": "cardEditor.panel.status.awaitingSplit",
  split: "cardEditor.panel.status.split",
  staged: "cardEditor.panel.status.staged",
};

export function itemStatusLabelKey(status: ItemStatus): string {
  return ITEM_STATUS_KEY[status] ?? "cardEditor.panel.status.unknown";
}

/** Chip tone drives the style modifier: queued/running live, review amber, applied green, … */
export type StatusTone = "live" | "review" | "ok" | "danger" | "muted";

export function itemStatusTone(status: ItemStatus): StatusTone {
  if (status === "queued" || status === "running" || status === "succeeded") return "live";
  if (status === "awaiting-review" || status === "needs-review" || status === "awaiting-split") return "review";
  if (status === "applied" || status === "duplicated" || status === "split" || status === "staged") return "ok";
  if (status === "rejected" || status === "canceled" || status === "interrupted") return "muted";
  return "danger"; // failed-*
}

export const REVIEWABLE_STATUSES: readonly ItemStatus[] = ["awaiting-review", "needs-review"];
export const FAILED_STATUSES: readonly ItemStatus[] = ["failed-provider", "failed-refusal", "failed-parse"];

export function isReviewable(item: Pick<SessionItem, "status">): boolean {
  return REVIEWABLE_STATUSES.includes(item.status);
}

export function isFailed(item: Pick<SessionItem, "status">): boolean {
  return FAILED_STATUSES.includes(item.status);
}

/** Queue membership: undecided items plus the decided ones the progress dots report on. */
export function isQueueItem(item: Pick<SessionItem, "status">): boolean {
  return isReviewable(item) || item.status === "applied" || item.status === "duplicated" || item.status === "rejected";
}

export interface ItemChangeSummary {
  fields: number;
  added: number;
  removed: number;
}

/** Per-field +words/−words against the dispatch snapshot (the text the model actually saw). */
export function summarizeItemChanges(item: Pick<SessionItem, "updates" | "snapshots">): ItemChangeSummary | null {
  const updates = item.updates ?? [];
  if (updates.length === 0) return null;
  let added = 0;
  let removed = 0;
  for (const update of updates) {
    // Word chips match the queue's decoded previews (SPEC F4): snapshots are real card text,
    // the quoted fallback and the proposed text decode for display only.
    const counts = countWordChanges(
      item.snapshots[update.field] ?? decodeXmlEntities(update.oldText),
      decodeXmlEntities(update.newText),
    );
    added += counts.added;
    removed += counts.removed;
  }
  return { fields: updates.length, added, removed };
}

export interface LiveStatus {
  kind: "batch" | "items" | "queued" | "done";
  runningItems: number;
  queuedItems: number;
  batchIndex: number;
  batchCount: number;
  batchAttempts: number;
}

/** The sessions-list live status line ("Running batch 2 of 3 · attempt 2" / "Editing 2 of 12"). */
export function deriveLiveStatus(session: BulkSession): LiveStatus {
  const runningItems = session.items.filter((item) => item.status === "running").length;
  const queuedItems = session.items.filter((item) => item.status === "queued").length;
  const liveBatches = session.batches.filter((batch) => batch.status !== "split");
  const runningBatchIndex = liveBatches.findIndex((batch) => batch.status === "running");
  const runningBatch = runningBatchIndex >= 0 ? liveBatches[runningBatchIndex]! : null;
  if (session.config.mode === "batched" && runningBatch) {
    return {
      kind: "batch",
      runningItems,
      queuedItems,
      batchIndex: runningBatchIndex + 1,
      batchCount: liveBatches.length,
      batchAttempts: runningBatch.attempts,
    };
  }
  if (runningItems > 0) {
    return { kind: "items", runningItems, queuedItems, batchIndex: 0, batchCount: 0, batchAttempts: 0 };
  }
  if (queuedItems > 0) {
    return { kind: "queued", runningItems, queuedItems, batchIndex: 0, batchCount: 0, batchAttempts: 0 };
  }
  return { kind: "done", runningItems, queuedItems, batchIndex: 0, batchCount: 0, batchAttempts: 0 };
}

export interface TransformCounts {
  /** Source cards the run started with. */
  sources: number;
  /** Cards the latest phase yields: split sources count as their children. */
  results: number;
  splitsPending: number;
  splitsAccepted: number;
  phase: 1 | 2;
  /** Phase 2 is configured, every split is decided, phase 1 settled and phase 2 not started. */
  phase2Ready: boolean;
}

/** Run totals for transform sessions ("30 → 33"), always derived from items and their lineage. */
export function transformCounts(session: BulkSession): TransformCounts {
  const phase: 1 | 2 = session.items.some((item) => item.phase === 2) ? 2 : 1;
  const inPhase = session.items.filter((item) => (item.phase ?? 1) === phase);
  const sources = session.items.filter((item) => (item.phase ?? 1) === 1 && item.parentItemId === undefined).length;
  const splitsPending = inPhase.filter((item) => item.status === "awaiting-split").length;
  return {
    sources,
    results: inPhase
      .filter((item) => item.status !== "split" && item.status !== "rejected" && item.status !== "canceled")
      .reduce((total, item) => total + (item.status === "awaiting-split" ? (item.characters?.length ?? 1) : 1), 0),
    splitsPending,
    splitsAccepted: inPhase.filter((item) => item.status === "split").length,
    phase,
    phase2Ready:
      session.config.transform?.phase2?.enabled === true &&
      phase === 1 &&
      session.status !== "active" &&
      splitsPending === 0 &&
      session.items.some((item) => item.status === "staged"),
  };
}

/** Child rows render under their split source. */
export function isSplitChild(
  item: Pick<SessionItem, "lineage" | "parentItemId" | "phase">,
  all: readonly SessionItem[],
): boolean {
  if (!item.parentItemId || !item.lineage?.splitGroupId) return false;
  const parent = all.find((candidate) => candidate.itemId === item.parentItemId);
  return parent?.status === "split";
}
