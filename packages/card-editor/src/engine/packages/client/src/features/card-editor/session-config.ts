// Runtime import: keep the ".ts" specifier — the UI regressions run this module under plain
// Node type-stripping, which does not remap ".js" specifiers. esbuild and tsc both accept ".ts".
import {
  normalizeSessionConfig,
  type BulkSessionConfig,
  type CompletionMode,
  type SaveMode,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import type { BehaviorSelection } from "./BehaviorCharacterSelect";
import type { PromptPresetId } from "./presets";
import type { TransformDraft } from "./TransformSettings";

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

export const BULK_DRAFT_STORAGE_KEY = "cardEditor.bulkDraft";
export const BULK_PRESETS_STORAGE_KEY = "cardEditor.bulkPresets";

/** The dialog's raw form values, unlike BulkSessionConfig, keep blank and in-progress inputs. */
export interface BulkFormState {
  mode: BulkSessionConfig["mode"];
  batchSize: number;
  connectionId: string | null;
  presetId: PromptPresetId;
  customTemplate: string;
  globalInstruction: string;
  behavior: BehaviorSelection;
  globalLorebookIds: string[];
  rebalance: boolean;
  providerRetries: number;
  refusalRetries: number;
  concurrency: number;
  completionMode: CompletionMode;
  saveMode: SaveMode;
  duplicatePrefix: string;
  duplicateSuffix: string;
  duplicateRemovePrefix: string;
  duplicateRemoveSuffix: string;
  combinedCardName: string;
  transformDraft: TransformDraft;
}

export interface BulkTargetDraft {
  note: string;
  style: BehaviorSelection;
}

/** Unsent dialog work, auto-saved on every edit so a stray close never loses it. */
export interface BulkDraft {
  form: BulkFormState;
  targets: Record<string, BulkTargetDraft>;
}

export interface BulkPreset {
  name: string;
  form: BulkFormState;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function behaviorSelection(value: unknown, fallback: BehaviorSelection): BehaviorSelection {
  const source = record(value);
  if (source?.kind === "inherit" || source?.kind === "none") return { kind: source.kind };
  if (source?.kind === "character" && typeof source.id === "string" && typeof source.name === "string") {
    return {
      kind: "character",
      id: source.id,
      name: source.name,
      avatarPath: typeof source.avatarPath === "string" ? source.avatarPath : null,
    };
  }
  return fallback;
}

/** Keep each stored value only when it has the default's shape, so older or corrupt entries degrade per field. */
function pickLike<T extends object>(defaults: T, value: unknown): T {
  const source = record(value);
  if (!source) return defaults;
  const result = { ...defaults } as Record<string, unknown>;
  for (const [key, fallback] of Object.entries(defaults)) {
    const candidate = source[key];
    if (candidate === undefined) continue;
    if (Array.isArray(fallback)) {
      if (Array.isArray(candidate) && candidate.every((item) => typeof item === "string")) result[key] = candidate;
    } else if (fallback === null) {
      if (candidate === null || typeof candidate === "string") result[key] = candidate;
    } else if (typeof candidate === typeof fallback && (typeof fallback !== "object" || record(candidate))) {
      result[key] = typeof fallback === "object" ? pickLike(fallback, candidate) : candidate;
    }
  }
  return result as T;
}

export function sanitizeBulkForm(value: unknown, defaults: BulkFormState): BulkFormState {
  return { ...pickLike(defaults, value), behavior: behaviorSelection(record(value)?.behavior, defaults.behavior) };
}

function readJson(storage: Pick<Storage, "getItem"> | undefined, key: string): unknown {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Pick<Storage, "setItem"> | undefined, key: string, value: unknown): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode) or full; drafts and presets are best-effort.
  }
}

export function loadBulkDraft(
  storage: Pick<Storage, "getItem"> | undefined,
  defaults: BulkFormState,
): BulkDraft | null {
  const source = record(readJson(storage, BULK_DRAFT_STORAGE_KEY));
  if (!source) return null;
  const targets: Record<string, BulkTargetDraft> = {};
  for (const [id, entry] of Object.entries(record(source.targets) ?? {})) {
    const target = record(entry);
    if (!target) continue;
    targets[id] = {
      note: typeof target.note === "string" ? target.note : "",
      style: behaviorSelection(target.style, { kind: "inherit" }),
    };
  }
  return { form: sanitizeBulkForm(source.form, defaults), targets };
}

export function storeBulkDraft(draft: BulkDraft, storage: Pick<Storage, "setItem"> | undefined): void {
  writeJson(storage, BULK_DRAFT_STORAGE_KEY, draft);
}

export function clearBulkDraft(storage: Pick<Storage, "removeItem"> | undefined): void {
  try {
    storage?.removeItem(BULK_DRAFT_STORAGE_KEY);
  } catch {
    // Best-effort, like storing.
  }
}

export function loadBulkPresets(storage: Pick<Storage, "getItem"> | undefined, defaults: BulkFormState): BulkPreset[] {
  const source = readJson(storage, BULK_PRESETS_STORAGE_KEY);
  if (!Array.isArray(source)) return [];
  return source.flatMap((entry) => {
    const preset = record(entry);
    return typeof preset?.name === "string" && preset.name.trim()
      ? [{ name: preset.name, form: sanitizeBulkForm(preset.form, defaults) }]
      : [];
  });
}

/** Save under a name; an existing preset with the same name is replaced. Returns the new list. */
export function saveBulkPreset(
  presets: BulkPreset[],
  preset: BulkPreset,
  storage: Pick<Storage, "setItem"> | undefined,
) {
  const next = [...presets.filter((entry) => entry.name !== preset.name), preset].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  writeJson(storage, BULK_PRESETS_STORAGE_KEY, next);
  return next;
}

export function deleteBulkPreset(presets: BulkPreset[], name: string, storage: Pick<Storage, "setItem"> | undefined) {
  const next = presets.filter((entry) => entry.name !== name);
  writeJson(storage, BULK_PRESETS_STORAGE_KEY, next);
  return next;
}

/** Live footer estimate: batched calls (ceil(targets / batchSize)) vs one call per card. */
export function estimateBulkCalls(targetCount: number, batchSize: number): { batched: number; individual: number } {
  const targets = Number.isFinite(targetCount) ? Math.max(0, Math.trunc(targetCount)) : 0;
  const size = Number.isFinite(batchSize) ? Math.max(1, Math.min(16, Math.trunc(batchSize))) : 4;
  return { batched: targets === 0 ? 0 : Math.ceil(targets / size), individual: targets };
}
