/**
 * Save-mode decision logic for Card Editor bulk runs (ARCH §4 Apply, SPEC F4). Pure planning:
 * given a session item and the card's current fields, decide which writes the caller must execute
 * over the engine REST API (the package host has no character API). No fetch, no storage.
 *
 * Staleness compares the dispatch snapshot against the current field after the same
 * normalization the prompt used, so XML-escaping/macro/trim artifacts can no longer masquerade
 * as user edits (SPEC F1). Stale fields are held unless the caller confirmed with force — auto
 * mode never blindly overwrites a genuinely changed card (F4.2).
 */
import type {
  CardFieldUpdate,
  SaveMode,
  SessionItem,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { SchemaError } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { normalizeCardPromptText } from "../../../../shared/src/features/agents/card-editor/text.ts";

export type ApplyOperation =
  | {
      op: "patchField";
      characterId: string;
      field: string;
      newText: string;
      versionSource: "agent";
      versionReason: string;
    }
  | { op: "hold"; characterId: string; field: string; reason: string }
  | {
      op: "duplicateThenPatch";
      characterId: string;
      fields: Record<string, string>;
      nameSuffix: string;
      namePrefix?: string;
    }
  | { op: "collectForCombine"; characterId: string; fields: Record<string, string> };

export interface PlanApplyOptions {
  /** force=true applies stale fields anyway (the verdict queue's "Apply anyway" confirm). */
  force: boolean;
  /** Restrict to these fields; undefined = all updates. */
  includeFields?: readonly string[];
  saveMode: SaveMode;
  /** Session label, used for the revision reason on every write. */
  label: string;
  duplicateSuffix: string;
  /** Non-empty prefix wins over duplicateSuffix in duplicate-mode naming. */
  duplicatePrefix?: string;
  /** Required when saveMode is "combined" (the single output card's name). */
  combinedCardName?: string;
}

function isStale(item: Pick<SessionItem, "snapshots">, currentCardFields: Record<string, string>, field: string) {
  return normalizeCardPromptText(currentCardFields[field]) !== (item.snapshots[field] ?? "");
}

export function planApply(
  item: Pick<SessionItem, "characterId" | "snapshots" | "updates">,
  currentCardFields: Record<string, string>,
  options: PlanApplyOptions,
): ApplyOperation[] {
  const updates = (item.updates ?? []).filter(
    (update: CardFieldUpdate) => options.includeFields === undefined || options.includeFields.includes(update.field),
  );
  if (updates.length === 0) return [];

  // Duplicate mode copies the CURRENT card, so staleness does not apply; the original is untouched.
  // Combined mode collects each card's produced XML (no per-item write); the session-level combine
  // action later creates ONE new card from the collected blocks.
  if (options.saveMode === "duplicate" || options.saveMode === "combined") {
    const fields: Record<string, string> = {};
    for (const update of updates) fields[update.field] = update.newText;
    if (options.saveMode === "combined") {
      if (!options.combinedCardName?.trim()) {
        throw new SchemaError("combinedCardName is required when saveMode is combined");
      }
      return [{ op: "collectForCombine", characterId: item.characterId, fields }];
    }
    const prefix = options.duplicatePrefix?.trim() ? options.duplicatePrefix : undefined;
    return [
      {
        op: "duplicateThenPatch",
        characterId: item.characterId,
        fields,
        ...(prefix === undefined ? { nameSuffix: options.duplicateSuffix } : { namePrefix: prefix }),
      },
    ];
  }

  const versionReason = `Card Editor bulk: ${options.label}`;
  const operations: ApplyOperation[] = [];
  for (const update of updates) {
    if (!isStale(item, currentCardFields, update.field) || options.force) {
      operations.push({
        op: "patchField",
        characterId: item.characterId,
        field: update.field,
        newText: update.newText,
        versionSource: "agent",
        versionReason,
      });
    } else {
      operations.push({
        op: "hold",
        characterId: item.characterId,
        field: update.field,
        reason: "field changed since dispatch",
      });
    }
  }
  return operations;
}
