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
  BulkSession,
  CardFieldUpdate,
  SaveMode,
  SessionItem,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { SchemaError } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { normalizeCardPromptText, decodeXmlEntities } from "../../../../shared/src/features/agents/card-editor/text.ts";

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
      namePrefix?: string;
      nameSuffix?: string;
      stripNamePrefix?: string;
      stripNameSuffix?: string;
      /** Split children: the copy's base name (affixes still apply) and its lineage stamp. */
      name?: string;
      extensions?: Record<string, unknown>;
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
  duplicatePrefix?: string;
  duplicateSuffix?: string;
  duplicateRemovePrefix?: string;
  duplicateRemoveSuffix?: string;
  /** Required when saveMode is "combined" (the single output card's name). */
  combinedCardName?: string;
}

/**
 * Post-hoc duplication for applied items (SPEC 2026-10-06 P1): confirm/auto save modes and
 * combined-collected items edited the original card in place, so no clone exists for the
 * quick-assign flow. Plans one duplicateThenPatch op per applied item that has updates and no
 * result card yet, named per the session's duplicate affix config. Items that already carry a
 * resultCardId (duplicated, or post-combine collected items) self-exclude.
 */
export function planDuplicateApplied(session: BulkSession): Array<{ itemId: string; ops: ApplyOperation[] }> {
  const plans: Array<{ itemId: string; ops: ApplyOperation[] }> = [];
  for (const item of session.items) {
    if (item.status !== "applied" || item.resultCardId !== undefined || (item.updates ?? []).length === 0) continue;
    const ops = planApply(
      item,
      {},
      {
        force: true,
        saveMode: "duplicate",
        label: session.label,
        ...(session.config.duplicatePrefix === undefined ? {} : { duplicatePrefix: session.config.duplicatePrefix }),
        ...(session.config.duplicateSuffix === undefined ? {} : { duplicateSuffix: session.config.duplicateSuffix }),
        ...(session.config.duplicateRemovePrefix === undefined
          ? {}
          : { duplicateRemovePrefix: session.config.duplicateRemovePrefix }),
        ...(session.config.duplicateRemoveSuffix === undefined
          ? {}
          : { duplicateRemoveSuffix: session.config.duplicateRemoveSuffix }),
      },
    );
    if (ops.length > 0) plans.push({ itemId: item.itemId, ops });
  }
  return plans;
}

function isStale(item: Pick<SessionItem, "snapshots">, currentCardFields: Record<string, string>, field: string) {
  return normalizeCardPromptText(currentCardFields[field]) !== (item.snapshots[field] ?? "");
}

/** Lineage stamp written to a split child's data.extensions.cardEditor. */
export function lineageExtension(item: Pick<SessionItem, "lineage">, label: string): Record<string, unknown> {
  return { cardEditor: { ...item.lineage, session: label } };
}

export function planApply(
  item: Pick<SessionItem, "characterId" | "snapshots" | "updates"> &
    Partial<Pick<SessionItem, "characterName" | "lineage">>,
  currentCardFields: Record<string, string>,
  options: PlanApplyOptions,
): ApplyOperation[] {
  const updates = (item.updates ?? []).filter(
    (update: CardFieldUpdate) => options.includeFields === undefined || options.includeFields.includes(update.field),
  );
  if (updates.length === 0) return [];

  // A split child is always a NEW card copied from its source, in every save mode except
  // combined: the source card stays untouched even when the run edits cards in place.
  if (item.lineage?.splitGroupId && options.saveMode !== "combined") {
    const fields: Record<string, string> = {};
    for (const update of updates) fields[update.field] = decodeXmlEntities(update.newText);
    const affixes = options.saveMode === "duplicate";
    return [
      {
        op: "duplicateThenPatch",
        characterId: item.characterId,
        fields,
        ...(item.characterName ? { name: item.characterName } : {}),
        extensions: lineageExtension(item, options.label),
        ...(affixes && options.duplicatePrefix !== undefined ? { namePrefix: options.duplicatePrefix } : {}),
        ...(affixes && options.duplicateSuffix !== undefined ? { nameSuffix: options.duplicateSuffix } : {}),
      },
    ];
  }

  // Duplicate mode copies the CURRENT card, so staleness does not apply; the original is untouched.
  // Combined mode collects each card's produced XML (no per-item write); the session-level combine
  // action later creates ONE new card from the collected blocks.
  if (options.saveMode === "duplicate" || options.saveMode === "combined") {
    const fields: Record<string, string> = {};
    for (const update of updates) fields[update.field] = decodeXmlEntities(update.newText);
    if (options.saveMode === "combined") {
      if (!options.combinedCardName?.trim()) {
        throw new SchemaError("combinedCardName is required when saveMode is combined");
      }
      return [{ op: "collectForCombine", characterId: item.characterId, fields }];
    }
    return [
      {
        op: "duplicateThenPatch",
        characterId: item.characterId,
        fields,
        ...(options.duplicatePrefix === undefined ? {} : { namePrefix: options.duplicatePrefix }),
        ...(options.duplicateSuffix === undefined ? {} : { nameSuffix: options.duplicateSuffix }),
        ...(options.duplicateRemovePrefix === undefined ? {} : { stripNamePrefix: options.duplicateRemovePrefix }),
        ...(options.duplicateRemoveSuffix === undefined ? {} : { stripNameSuffix: options.duplicateRemoveSuffix }),
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
        newText: decodeXmlEntities(update.newText),
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
