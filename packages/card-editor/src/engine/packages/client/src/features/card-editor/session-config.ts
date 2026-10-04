// Runtime import: keep the ".ts" specifier — the UI regressions run this module under plain
// Node type-stripping, which does not remap ".js" specifiers. esbuild and tsc both accept ".ts".
import {
  normalizeSessionConfig,
  type BulkSessionConfig,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";

export const BULK_CONFIG_STORAGE_KEY = "cardEditor.bulkConfig";

// The shared schema is browser-safe (ids come from globalThis.crypto, no Node-only imports), so
// the client re-exports the authoritative normalizer instead of keeping a behavioral mirror. The
// parity-lock regression now proves this import path resolves to the same function object.
export { normalizeSessionConfig as normalizeBulkSessionConfig };

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
    return normalizeSessionConfig(JSON.parse(raw));
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
