import { normalizeCardSchema, type CardOutputFormat, type CardSchema } from "./card-schema.ts";

export const SESSION_SCHEMA_VERSION = 1 as const;
const BULK_EDITABLE_CARD_FIELDS = [
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
] as const;

export type SaveMode = "confirm" | "auto" | "duplicate" | "combined";
export type CompletionMode = "ask" | "apply" | "duplicate";

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
  | "interrupted"
  /** Transform: the source came back as several characters and waits for the user's decision. */
  | "awaiting-split"
  /** Transform: the source was split; its characters live on as child items. Terminal. */
  | "split"
  /** Transform: a phase result held as input for the next phase. Terminal for its phase. */
  | "staged";

export type MultiCharacterMode = "split" | "merge";
export type TransformOutputMode = "structured" | "document";

export interface TransformPhaseConfig {
  schema: CardSchema;
  format: CardOutputFormat;
}

/** Transform task settings (presetId "transform"). The schema is snapshotted at dispatch so a run
 *  never changes when the user edits the schema library later. */
export interface TransformConfig extends TransformPhaseConfig {
  /** structured = the model answers schema-shaped JSON and Marinara renders the format (default);
   *  document = the model writes each target field's document text itself (legacy method). */
  outputMode: TransformOutputMode;
  multiCharacter: MultiCharacterMode;
  /** Ask the connection for provider-enforced JSON when it supports it. */
  structuredOutput: boolean;
  phase2?: {
    enabled: boolean;
    instruction: string;
    allowSplits: boolean;
    /** Absent = same schema and format as phase 1. */
    override?: TransformPhaseConfig;
  };
}

export interface BulkSessionConfig {
  mode: "individual" | "batched";
  batchSize: number;
  connectionId: string | null;
  presetId: "standard" | "strict" | "rebalance" | "xml-simple" | "xml-complex" | "custom" | "transform";
  customTemplate?: string;
  /** Required when presetId is "transform". */
  transform?: TransformConfig;
  globalInstruction: string;
  behaviorCharacterId: string | null;
  globalLorebookIds: string[];
  rebalance: boolean;
  providerRetries: number;
  refusalRetries: number;
  concurrency: number;
  saveMode: SaveMode;
  /** Outcome policy applied only after the runner has fully drained. */
  completionMode?: CompletionMode;
  duplicatePrefix?: string;
  duplicateSuffix?: string;
  duplicateRemovePrefix?: string;
  duplicateRemoveSuffix?: string;
  /** Target name for the single card produced by combined save mode (required when saveMode is "combined"). */
  combinedCardName?: string;
}

export interface CardFieldUpdate {
  field: string;
  oldText: string;
  newText: string;
  reason: string;
}

/** One character produced by a transform call. `fields` holds the rendered card field text. */
export interface CharacterResult {
  name: string;
  fields: Record<string, string>;
  /** Structured data as answered (structured mode only); kept for phase 2 and review. */
  data?: unknown;
  issues?: string[];
}

/** Where a result came from. Split children share splitGroupId (the split item's id). */
export interface ItemLineage {
  originCharacterId: string;
  originName: string;
  splitGroupId?: string;
  splitIndex?: number;
  splitCount?: number;
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
  /** Hint for the runs panel: auto-save-mode items land in awaiting-review with this flag so the
   *  panel auto-drives the verdict flow on first sight (held-back items surface as needs-review). */
  autoApply?: boolean;
  /** Correlation state between planning and apply-result (the ops the client is executing).
   *  Persisted and exposed to session polling so unreported completion work can resume. */
  pendingOps?: unknown[];
  /** Transform fields. phase absent = 1. */
  phase?: 1 | 2;
  parentItemId?: string;
  /** Set by "Retry as one card": the model is told to keep the card as one character. */
  forceSingle?: boolean;
  characters?: CharacterResult[];
  splitReason?: string;
  lineage?: ItemLineage;
  /** Phase 2 input: the phase 1 result text the model reprocesses. */
  previousOutput?: string;
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
  /** Set by the session-level combine action (combined save mode): the created host character id. */
  combinedCardId?: string;
}

interface BulkSessionTarget {
  characterId: string;
  characterName?: string;
  note?: string;
  behaviorOverride?: string | null;
}

type ValidatedCardFieldUpdate = CardFieldUpdate & { characterId: string };

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaError";
  }
}

const ITEM_STATUSES = new Set<ItemStatus>([
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
  "awaiting-split",
  "split",
  "staged",
]);
const FAILED_ITEM_STATUSES = new Set<ItemStatus>(["failed-provider", "failed-refusal", "failed-parse"]);
const IN_PROGRESS_ITEM_STATUSES = new Set<ItemStatus>(["queued", "running"]);
const EDITABLE_FIELDS = new Set<string>(BULK_EDITABLE_CARD_FIELDS);
const TRANSITIONS: Readonly<Partial<Record<ItemStatus, readonly ItemStatus[]>>> = {
  queued: ["running"],
  running: ["succeeded", "failed-provider", "failed-refusal", "failed-parse"],
  succeeded: ["awaiting-review", "applied", "needs-review", "duplicated", "awaiting-split", "staged"],
  // Split review: accept → split (children carry on), retry as one → running, skip → rejected.
  "awaiting-split": ["split", "running", "rejected"],
  // Verdict queue resolves held-back auto-approve items (DESIGN §3): force applies, else reject.
  // needs-review is reachable from awaiting-review when the verdict plans hold ops (stale fields);
  // duplicated is the duplicate-mode approve outcome from awaiting-review.
  "awaiting-review": ["applied", "rejected", "needs-review", "duplicated"],
  "needs-review": ["applied", "rejected"],
  // Two-phase apply: the verdict moves the item to applied/duplicated with pendingOps stashed;
  // a failed client-side write report (apply-result) demotes it to failed-provider for retry.
  applied: ["failed-provider"],
  duplicated: ["failed-provider"],
  "failed-provider": ["running"],
  "failed-refusal": ["running"],
  "failed-parse": ["running"],
};

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function enumValue<T extends string>(value: unknown, fallback: T, allowed: readonly T[], field: string): T {
  if (value === undefined) return fallback;
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  throw new SchemaError(`${field} is invalid`);
}

function stringValue(value: unknown, fallback: string, field: string): string {
  if (value === undefined) return fallback;
  if (typeof value === "string") return value;
  throw new SchemaError(`${field} must be a string`);
}

/** Optional affix/name field: absent stays absent; present values must be non-blank and short. */
function optionalAffix(value: unknown, field: string, preserve: boolean): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new SchemaError(`${field} must be a string`);
  if (value.length > 300) throw new SchemaError(`${field} must be at most 300 characters`);
  const normalized = preserve ? value : value.trim();
  if (!normalized.trim()) throw new SchemaError(`${field} must not be blank`);
  return normalized;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  throw new SchemaError(`${field} must be a string or null`);
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number, field: string): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new SchemaError(`${field} must be a finite number`);
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

const OUTPUT_FORMATS = ["markdown", "xml", "json"] as const;

function normalizePhaseConfig(value: unknown, field: string): TransformPhaseConfig {
  const source = sourceRecord(value);
  if (!source) throw new SchemaError(`${field} must be an object`);
  let schema: CardSchema;
  try {
    schema = normalizeCardSchema(source.schema);
  } catch (error) {
    throw new SchemaError(`${field}.schema: ${error instanceof Error ? error.message : String(error)}`);
  }
  return { schema, format: enumValue(source.format, "xml", OUTPUT_FORMATS, `${field}.format`) };
}

export function normalizeTransformConfig(value: unknown): TransformConfig {
  const source = sourceRecord(value);
  if (!source) throw new SchemaError("transform settings are required for the transform task");
  const phase = normalizePhaseConfig(source, "transform");
  let phase2: TransformConfig["phase2"];
  if (source.phase2 !== undefined) {
    const raw = sourceRecord(source.phase2);
    if (!raw) throw new SchemaError("transform.phase2 must be an object");
    if (raw.enabled !== undefined && typeof raw.enabled !== "boolean")
      throw new SchemaError("transform.phase2.enabled must be a boolean");
    if (raw.allowSplits !== undefined && typeof raw.allowSplits !== "boolean") {
      throw new SchemaError("transform.phase2.allowSplits must be a boolean");
    }
    phase2 = {
      enabled: raw.enabled === true,
      instruction: stringValue(raw.instruction, "", "transform.phase2.instruction"),
      allowSplits: raw.allowSplits === true,
      ...(raw.override === undefined || raw.override === null
        ? {}
        : { override: normalizePhaseConfig(raw.override, "transform.phase2.override") }),
    };
  }
  if (source.structuredOutput !== undefined && typeof source.structuredOutput !== "boolean") {
    throw new SchemaError("transform.structuredOutput must be a boolean");
  }
  return {
    ...phase,
    outputMode: enumValue(source.outputMode, "structured", ["structured", "document"], "transform.outputMode"),
    multiCharacter: enumValue(source.multiCharacter, "split", ["split", "merge"], "transform.multiCharacter"),
    structuredOutput: source.structuredOutput !== false,
    ...(phase2 === undefined ? {} : { phase2 }),
  };
}

export function normalizeSessionConfig(input: unknown): BulkSessionConfig {
  const source = sourceRecord(input);
  if (!source) throw new SchemaError("session config must be an object");
  if (source.globalLorebookIds !== undefined && !Array.isArray(source.globalLorebookIds)) {
    throw new SchemaError("globalLorebookIds must be an array of strings");
  }
  const globalLorebookIds = source.globalLorebookIds ?? [];
  if (!(globalLorebookIds as unknown[]).every((id) => typeof id === "string")) {
    throw new SchemaError("globalLorebookIds must be an array of strings");
  }
  if (source.rebalance !== undefined && typeof source.rebalance !== "boolean") {
    throw new SchemaError("rebalance must be a boolean");
  }
  if (source.customTemplate !== undefined && typeof source.customTemplate !== "string") {
    throw new SchemaError("customTemplate must be a string");
  }
  const duplicatePrefix = optionalAffix(source.duplicatePrefix, "duplicatePrefix", true);
  const duplicateSuffix = optionalAffix(source.duplicateSuffix, "duplicateSuffix", true);
  const duplicateRemovePrefix = optionalAffix(source.duplicateRemovePrefix, "duplicateRemovePrefix", true);
  const duplicateRemoveSuffix = optionalAffix(source.duplicateRemoveSuffix, "duplicateRemoveSuffix", true);
  const combinedCardName = optionalAffix(source.combinedCardName, "combinedCardName", false);
  const saveMode = enumValue(source.saveMode, "confirm", ["confirm", "auto", "duplicate", "combined"], "saveMode");
  if (saveMode === "combined" && combinedCardName === undefined) {
    throw new SchemaError("combinedCardName is required when saveMode is combined");
  }
  const presetId = enumValue(
    source.presetId,
    "standard",
    ["standard", "strict", "rebalance", "xml-simple", "xml-complex", "custom", "transform"],
    "presetId",
  );
  const transform = presetId === "transform" ? normalizeTransformConfig(source.transform) : undefined;

  return {
    mode: enumValue(source.mode, "individual", ["individual", "batched"], "mode"),
    batchSize: boundedInteger(source.batchSize, 4, 1, 16, "batchSize"),
    connectionId: nullableString(source.connectionId, "connectionId"),
    presetId,
    ...(source.customTemplate === undefined ? {} : { customTemplate: source.customTemplate }),
    ...(transform === undefined ? {} : { transform }),
    globalInstruction: stringValue(source.globalInstruction, "", "globalInstruction"),
    behaviorCharacterId: nullableString(source.behaviorCharacterId, "behaviorCharacterId"),
    globalLorebookIds: [...(globalLorebookIds as string[])],
    rebalance: source.rebalance ?? false,
    providerRetries: boundedInteger(source.providerRetries, 2, 0, 5, "providerRetries"),
    refusalRetries: boundedInteger(source.refusalRetries, 3, 0, 5, "refusalRetries"),
    concurrency: boundedInteger(source.concurrency, 1, 1, 16, "concurrency"),
    saveMode,
    completionMode: enumValue(source.completionMode, "ask", ["ask", "apply", "duplicate"], "completionMode"),
    ...(duplicatePrefix === undefined ? {} : { duplicatePrefix }),
    ...(duplicateSuffix === undefined ? {} : { duplicateSuffix }),
    ...(duplicateRemovePrefix === undefined ? {} : { duplicateRemovePrefix }),
    ...(duplicateRemoveSuffix === undefined ? {} : { duplicateRemoveSuffix }),
    ...(combinedCardName === undefined ? {} : { combinedCardName }),
  };
}

/** Panel-owned bulk settings persisted by the package server (kind "settings").
 *  maxParallelAgents caps a run's concurrency on top of the connection limit (null = follow the
 *  connection); disableAutoVerdicts forces manual review — auto-approve and on-completion writes
 *  are coerced to confirm/ask at session creation. */
export interface BulkSettings {
  version: 1;
  maxParallelAgents: number | null;
  disableAutoVerdicts: boolean;
}

export const DEFAULT_BULK_SETTINGS: BulkSettings = { version: 1, maxParallelAgents: null, disableAutoVerdicts: false };

export function normalizeBulkSettings(input: unknown): BulkSettings {
  if (input === null || input === undefined) return { ...DEFAULT_BULK_SETTINGS };
  const source = sourceRecord(input);
  if (!source) throw new SchemaError("bulk settings must be an object");
  let maxParallelAgents: number | null = null;
  if (source.maxParallelAgents !== undefined && source.maxParallelAgents !== null) {
    const value = source.maxParallelAgents;
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 16) {
      throw new SchemaError("maxParallelAgents must be null or an integer between 1 and 16");
    }
    maxParallelAgents = value;
  }
  if (source.disableAutoVerdicts !== undefined && typeof source.disableAutoVerdicts !== "boolean") {
    throw new SchemaError("disableAutoVerdicts must be a boolean");
  }
  return {
    version: 1,
    maxParallelAgents,
    disableAutoVerdicts: source.disableAutoVerdicts === true,
  };
}

export function advanceItemStatus(item: SessionItem, next: ItemStatus): SessionItem {
  if (!ITEM_STATUSES.has(item.status) || !ITEM_STATUSES.has(next)) throw new SchemaError("item status is invalid");
  const allowed =
    item.status !== next &&
    (next === "canceled" || next === "interrupted" || TRANSITIONS[item.status]?.includes(next) === true);
  if (!allowed) throw new SchemaError(`illegal item status transition: ${item.status} → ${next}`);
  return { ...item, status: next };
}

export function recomputeStats(session: BulkSession): BulkSession {
  const stats = session.items.reduce<BulkSessionStats>(
    (value, item) => ({
      total: value.total + 1,
      done: value.done + (IN_PROGRESS_ITEM_STATUSES.has(item.status) ? 0 : 1),
      failed: value.failed + (FAILED_ITEM_STATUSES.has(item.status) ? 1 : 0),
    }),
    { total: 0, done: 0, failed: 0 },
  );
  return { ...session, stats };
}

// Node 22+ and every modern browser expose crypto.randomUUID on globalThis; keeping Node-only
// imports out of this module lets the browser client bundle it (session-config.ts re-exports
// normalizeSessionConfig from here — the client mirror is deleted).
function createId(): string {
  return globalThis.crypto.randomUUID();
}

export function newItem(
  characterId: string,
  characterName = characterId,
  target: Pick<BulkSessionTarget, "note" | "behaviorOverride"> = {},
): SessionItem {
  return {
    itemId: createId(),
    characterId,
    characterName,
    ...(target.note === undefined ? {} : { note: target.note }),
    ...(target.behaviorOverride === undefined ? {} : { behaviorOverride: target.behaviorOverride }),
    status: "queued",
    snapshots: {},
  };
}

export function newSession(
  label: string,
  config: BulkSessionConfig,
  targets: readonly BulkSessionTarget[],
): BulkSession {
  const items = targets.map((target) =>
    newItem(target.characterId, target.characterName ?? target.characterId, {
      ...(target.note === undefined ? {} : { note: target.note }),
      ...(target.behaviorOverride === undefined ? {} : { behaviorOverride: target.behaviorOverride }),
    }),
  );
  return {
    id: createId(),
    schemaVersion: SESSION_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    label,
    config: normalizeSessionConfig(config),
    items,
    batches: [],
    status: "active",
    stats: { total: items.length, done: 0, failed: 0 },
  };
}

export function validateCardFieldUpdate(
  update: unknown,
  sessionTargets: readonly (string | { characterId: string })[],
  options: { rebalance: boolean },
): { ok: true; update: ValidatedCardFieldUpdate } | { ok: false; reason: string } {
  const source = sourceRecord(update);
  if (!source) return { ok: false, reason: "update must be an object" };
  if (typeof source.characterId !== "string") return { ok: false, reason: "characterId must be a string" };
  const targetIds = new Set(sessionTargets.map((target) => (typeof target === "string" ? target : target.characterId)));
  if (!targetIds.has(source.characterId)) return { ok: false, reason: "characterId is not a session target" };
  if (typeof source.field !== "string" || !EDITABLE_FIELDS.has(source.field)) {
    return { ok: false, reason: "field is not bulk-editable" };
  }
  if (typeof source.oldText !== "string" || source.oldText.length > 100_000) {
    return { ok: false, reason: "oldText must be a string of at most 100000 characters" };
  }
  if (typeof source.newText !== "string" || source.newText.length > 100_000) {
    return { ok: false, reason: "newText must be a string of at most 100000 characters" };
  }
  if (source.newText.length === 0 && options.rebalance !== true) {
    return { ok: false, reason: "newText may be empty only when rebalancing" };
  }
  if (typeof source.reason !== "string") return { ok: false, reason: "reason must be a string" };
  return {
    ok: true,
    update: {
      characterId: source.characterId,
      field: source.field,
      oldText: source.oldText,
      newText: source.newText,
      reason: source.reason,
    },
  };
}

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function stringRecord(value: unknown): value is Record<string, string> {
  const source = sourceRecord(value);
  return source !== null && Object.values(source).every((entry) => typeof entry === "string");
}

function isCardFieldUpdate(value: unknown): value is CardFieldUpdate {
  const source = sourceRecord(value);
  return (
    source !== null &&
    typeof source.field === "string" &&
    typeof source.oldText === "string" &&
    typeof source.newText === "string" &&
    typeof source.reason === "string"
  );
}

function isCharacterResult(value: unknown): value is CharacterResult {
  const source = sourceRecord(value);
  return (
    source !== null &&
    typeof source.name === "string" &&
    stringRecord(source.fields) &&
    (source.issues === undefined || stringArray(source.issues))
  );
}

function isSessionItem(value: unknown): value is SessionItem {
  const source = sourceRecord(value);
  if (
    !source ||
    typeof source.itemId !== "string" ||
    typeof source.characterId !== "string" ||
    typeof source.characterName !== "string" ||
    typeof source.status !== "string" ||
    !ITEM_STATUSES.has(source.status as ItemStatus) ||
    !stringRecord(source.snapshots)
  ) {
    return false;
  }
  if (source.note !== undefined && typeof source.note !== "string") return false;
  if (
    source.behaviorOverride !== undefined &&
    source.behaviorOverride !== null &&
    typeof source.behaviorOverride !== "string"
  ) {
    return false;
  }
  if (source.updates !== undefined && (!Array.isArray(source.updates) || !source.updates.every(isCardFieldUpdate)))
    return false;
  if (source.failure !== undefined) {
    const failure = sourceRecord(source.failure);
    if (
      !failure ||
      (failure.kind !== "provider" && failure.kind !== "refusal" && failure.kind !== "parse") ||
      typeof failure.message !== "string" ||
      !Number.isInteger(failure.attempts) ||
      (failure.attempts as number) < 0 ||
      (failure.rawOutput !== undefined && typeof failure.rawOutput !== "string")
    ) {
      return false;
    }
    if (failure.renderedPrompt !== undefined) {
      const prompt = sourceRecord(failure.renderedPrompt);
      if (!prompt || typeof prompt.system !== "string" || typeof prompt.user !== "string") return false;
    }
  }
  if (source.autoApply !== undefined && typeof source.autoApply !== "boolean") return false;
  if (source.phase !== undefined && source.phase !== 1 && source.phase !== 2) return false;
  if (source.forceSingle !== undefined && typeof source.forceSingle !== "boolean") return false;
  if (
    source.characters !== undefined &&
    (!Array.isArray(source.characters) || !source.characters.every(isCharacterResult))
  ) {
    return false;
  }
  if (source.lineage !== undefined) {
    const lineage = sourceRecord(source.lineage);
    if (!lineage || typeof lineage.originCharacterId !== "string" || typeof lineage.originName !== "string")
      return false;
  }
  if (
    [source.parentItemId, source.splitReason, source.previousOutput].some(
      (entry) => entry !== undefined && typeof entry !== "string",
    )
  ) {
    return false;
  }
  if (source.pendingOps !== undefined && !Array.isArray(source.pendingOps)) return false;
  return [source.resultCardId, source.appliedAt, source.batchId].every(
    (entry) => entry === undefined || typeof entry === "string",
  );
}

function isSessionBatch(value: unknown): value is BulkSessionBatch {
  const source = sourceRecord(value);
  return (
    source !== null &&
    typeof source.id === "string" &&
    stringArray(source.itemIds) &&
    (source.status === "pending" ||
      source.status === "running" ||
      source.status === "split" ||
      source.status === "done" ||
      source.status === "failed") &&
    Number.isInteger(source.attempts) &&
    (source.attempts as number) >= 0
  );
}

function isStoredConfig(value: unknown): value is BulkSessionConfig {
  const source = sourceRecord(value);
  if (!source) return false;
  try {
    const normalized = normalizeSessionConfig(value);
    return (
      source.mode === normalized.mode &&
      source.batchSize === normalized.batchSize &&
      source.connectionId === normalized.connectionId &&
      source.presetId === normalized.presetId &&
      source.customTemplate === normalized.customTemplate &&
      source.globalInstruction === normalized.globalInstruction &&
      source.behaviorCharacterId === normalized.behaviorCharacterId &&
      stringArray(source.globalLorebookIds) &&
      source.rebalance === normalized.rebalance &&
      source.providerRetries === normalized.providerRetries &&
      source.refusalRetries === normalized.refusalRetries &&
      source.concurrency === normalized.concurrency &&
      source.saveMode === normalized.saveMode &&
      (source.completionMode ?? "ask") === normalized.completionMode &&
      source.duplicatePrefix === normalized.duplicatePrefix &&
      source.duplicateSuffix === normalized.duplicateSuffix &&
      source.duplicateRemovePrefix === normalized.duplicateRemovePrefix &&
      source.duplicateRemoveSuffix === normalized.duplicateRemoveSuffix &&
      JSON.stringify(source.transform) === JSON.stringify(normalized.transform)
    );
  } catch {
    return false;
  }
}

export function migrateSessionDocument(doc: unknown): BulkSession | null {
  const source = sourceRecord(doc);
  if (
    !source ||
    source.schemaVersion !== SESSION_SCHEMA_VERSION ||
    typeof source.id !== "string" ||
    typeof source.createdAt !== "string" ||
    typeof source.label !== "string" ||
    !isStoredConfig(source.config) ||
    !Array.isArray(source.items) ||
    !source.items.every(isSessionItem) ||
    !Array.isArray(source.batches) ||
    !source.batches.every(isSessionBatch) ||
    (source.status !== "active" &&
      source.status !== "completed" &&
      source.status !== "canceled" &&
      source.status !== "interrupted")
  ) {
    return null;
  }
  const stats = sourceRecord(source.stats);
  if (
    !stats ||
    !Number.isInteger(stats.total) ||
    !Number.isInteger(stats.done) ||
    !Number.isInteger(stats.failed) ||
    (stats.total as number) < 0 ||
    (stats.done as number) < 0 ||
    (stats.failed as number) < 0
  ) {
    return null;
  }
  return doc as BulkSession;
}
