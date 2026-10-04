export type SaveMode = "confirm" | "auto" | "duplicate";

export type ItemStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "awaiting-review"
  | "applied"
  | "duplicated"
  | "needs-review"
  | "rejected"
  | "failed-provider"
  | "failed-refusal"
  | "failed-parse"
  | "canceled"
  | "interrupted";

export interface BulkSessionConfig {
  mode: "individual" | "batched";
  batchSize: number;
  connectionId: string | null;
  presetId: "standard" | "strict" | "rebalance" | "custom";
  customTemplate?: string;
  globalInstruction: string;
  behaviorCharacterId: string | null;
  globalLorebookIds: string[];
  rebalance: boolean;
  providerRetries: number;
  refusalRetries: number;
  concurrency: number;
  saveMode: SaveMode;
  duplicateSuffix: string;
}

export interface CardFieldUpdate {
  field: string;
  oldText: string;
  newText: string;
  reason: string;
}

export interface SessionItem {
  itemId: string;
  characterId: string;
  characterName: string;
  note?: string;
  behaviorOverride?: string | null;
  status: ItemStatus;
  snapshots: Record<string, string>;
  updates?: CardFieldUpdate[];
  failure?: {
    kind: "provider" | "refusal" | "parse";
    message: string;
    rawOutput?: string;
    renderedPrompt?: { system: string; user: string };
    attempts: number;
  };
  resultCardId?: string;
  appliedAt?: string;
  batchId?: string;
}

export interface BulkSessionBatch {
  id: string;
  itemIds: string[];
  status: "pending" | "running" | "split" | "done" | "failed";
  attempts: number;
}

export interface BulkSessionStats {
  total: number;
  done: number;
  failed: number;
}

export interface BulkSession {
  id: string;
  schemaVersion: 1;
  createdAt: string;
  label: string;
  config: BulkSessionConfig;
  items: SessionItem[];
  batches: BulkSessionBatch[];
  status: "active" | "completed" | "canceled" | "interrupted";
  stats: BulkSessionStats;
}
