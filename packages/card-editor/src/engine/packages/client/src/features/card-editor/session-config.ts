import type { BulkSessionConfig, SaveMode } from "../../../../shared/src/features/agents/card-editor/schema.js";

/**
 * SEAM — client mirror of the shared `normalizeSessionConfig`.
 *
 * The authoritative implementation lives in
 * packages/shared/src/features/agents/card-editor/schema.ts, which statically
 * imports node:crypto and therefore cannot be bundled into the browser client.
 * This copy must stay byte-for-byte behaviorally identical;
 * tests/card-editor-dialog-ui.regression.mjs locks the parity. The coordinator
 * can delete this mirror once the shared schema is browser-safe.
 */
export const BULK_CONFIG_STORAGE_KEY = "cardEditor.bulkConfig";

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function enumValue<T extends string>(value: unknown, fallback: T, allowed: readonly T[], field: string): T {
  if (value === undefined) return fallback;
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  throw new ConfigError(`${field} is invalid`);
}

function stringValue(value: unknown, fallback: string, field: string): string {
  if (value === undefined) return fallback;
  if (typeof value === "string") return value;
  throw new ConfigError(`${field} must be a string`);
}

function nullableString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  throw new ConfigError(`${field} must be a string or null`);
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number, field: string): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new ConfigError(`${field} must be a finite number`);
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function normalizeBulkSessionConfig(input: unknown): BulkSessionConfig {
  const source = sourceRecord(input);
  if (!source) throw new ConfigError("session config must be an object");
  if (source.globalLorebookIds !== undefined && !Array.isArray(source.globalLorebookIds)) {
    throw new ConfigError("globalLorebookIds must be an array of strings");
  }
  const globalLorebookIds = source.globalLorebookIds ?? [];
  if (!(globalLorebookIds as unknown[]).every((id) => typeof id === "string")) {
    throw new ConfigError("globalLorebookIds must be an array of strings");
  }
  if (source.rebalance !== undefined && typeof source.rebalance !== "boolean") {
    throw new ConfigError("rebalance must be a boolean");
  }
  if (source.customTemplate !== undefined && typeof source.customTemplate !== "string") {
    throw new ConfigError("customTemplate must be a string");
  }

  return {
    mode: enumValue(source.mode, "individual", ["individual", "batched"], "mode"),
    batchSize: boundedInteger(source.batchSize, 4, 1, 16, "batchSize"),
    connectionId: nullableString(source.connectionId, "connectionId"),
    presetId: enumValue(source.presetId, "standard", ["standard", "strict", "rebalance", "custom"], "presetId"),
    ...(source.customTemplate === undefined ? {} : { customTemplate: source.customTemplate }),
    globalInstruction: stringValue(source.globalInstruction, "", "globalInstruction"),
    behaviorCharacterId: nullableString(source.behaviorCharacterId, "behaviorCharacterId"),
    globalLorebookIds: [...(globalLorebookIds as string[])],
    rebalance: source.rebalance ?? false,
    providerRetries: boundedInteger(source.providerRetries, 2, 0, 5, "providerRetries"),
    refusalRetries: boundedInteger(source.refusalRetries, 3, 0, 5, "refusalRetries"),
    concurrency: boundedInteger(source.concurrency, 1, 1, 4, "concurrency"),
    saveMode: enumValue<SaveMode>(source.saveMode, "confirm", ["confirm", "auto", "duplicate"], "saveMode"),
    duplicateSuffix: stringValue(source.duplicateSuffix, " (Edited)", "duplicateSuffix"),
  };
}

/** Read the remembered per-user bulk config; corrupt or invalid entries are ignored. */
export function loadStoredBulkConfig(storage: Pick<Storage, "getItem"> | undefined): BulkSessionConfig | null {
  if (!storage) return null;
  let raw: string | null = null;
  try {
    raw = storage.getItem(BULK_CONFIG_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return normalizeBulkSessionConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Remember the last-used bulk config (targets and notes are never part of it). */
export function storeBulkConfig(config: BulkSessionConfig, storage: Pick<Storage, "setItem"> | undefined): void {
  if (!storage) return;
  try {
    storage.setItem(BULK_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage may be unavailable (private mode); remembering the config is best-effort.
  }
}

/** Live footer estimate: batched calls (ceil(targets / batchSize)) vs one call per card. */
export function estimateBulkCalls(targetCount: number, batchSize: number): { batched: number; individual: number } {
  const targets = Number.isFinite(targetCount) ? Math.max(0, Math.trunc(targetCount)) : 0;
  const size = Number.isFinite(batchSize) ? Math.max(1, Math.min(16, Math.trunc(batchSize))) : 4;
  return { batched: targets === 0 ? 0 : Math.ceil(targets / size), individual: targets };
}
