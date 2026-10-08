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
};

export function itemStatusLabelKey(status: ItemStatus): string {
  return ITEM_STATUS_KEY[status] ?? "cardEditor.panel.status.unknown";
}

/** Chip tone drives the style modifier: queued/running live, review amber, applied green, … */
export type StatusTone = "live" | "review" | "ok" | "danger" | "muted";

export function itemStatusTone(status: ItemStatus): StatusTone {
  if (status === "queued" || status === "running" || status === "succeeded") return "live";
  if (status === "awaiting-review" || status === "needs-review") return "review";
  if (status === "applied" || status === "duplicated") return "ok";
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
