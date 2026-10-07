/**
 * Client side of the two-phase apply (routes.ts Decision 2, ARCH §4): the verdict route plans,
 * this module executes the ops over engine REST (character PATCH / duplicate) and reports per-op
 * outcomes back to the apply-result route. Shared by the verdict queue's manual approve and the
 * panel's auto-apply driver, so both paths write identically (SPEC F4: versionSource "agent").
 */
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
// ".ts" specifiers: the panel regression runs this module under plain Node type-stripping.
import {
  createHostCharacter,
  duplicateHostCharacter,
  getHostCharacterCard,
  getSession,
  isVerdictPlan,
  parseHostCharacterName,
  patchHostCharacter,
  planSessionDuplicateApplied,
  submitSessionCombine,
  submitSessionItemApplyResult,
  submitSessionItemVerdict,
  type ApplyOperation,
  type ApplyOpResult,
  type HostCardFields,
} from "./api.ts";

/** backstory/appearance live under data.extensions (engine merge keeps sibling extension keys). */
export function buildFieldPatchData(field: string, newText: string): Record<string, unknown> {
  return field === "backstory" || field === "appearance" ? { extensions: { [field]: newText } } : { [field]: newText };
}

/** currentFields for the verdict's staleness plan: every bulk-editable field except name. */
export function currentFieldsFromCard(fields: HostCardFields): Record<string, string> {
  const { name: _name, ...rest } = fields;
  return rest;
}

function errorText(error: unknown): string {
  return (error instanceof Error ? error.message : String(error ?? "")) || "unknown error";
}

const ENGINE_COPY_SUFFIX = " (Copy)";

async function executeOp(item: SessionItem, op: ApplyOperation, label: string): Promise<Omit<ApplyOpResult, "index">> {
  // The route never plans hold ops in an "apply" response (holds force needs-confirmation first);
  // treat one as a no-op rather than failing the whole item if the contract ever drifts.
  if (op.op === "hold") return { ok: true };
  // Combined mode collects each card's produced XML client-side; no per-item write happens.
  if (op.op === "collectForCombine") return { ok: true };
  if (op.op === "patchField") {
    await patchHostCharacter(op.characterId, buildFieldPatchData(op.field, op.newText), {
      versionSource: op.versionSource,
      versionReason: op.versionReason,
    });
    return { ok: true };
  }
  // duplicateThenPatch: copy the CURRENT card, rename (prefix wins over suffix), patch the copy.
  const copy = await duplicateHostCharacter(op.characterId);
  const copyId = typeof copy?.id === "string" && copy.id ? copy.id : "";
  if (!copyId) throw new Error("The duplicate call returned no card id.");
  const copyName = parseHostCharacterName(copy);
  const baseName = copyName.endsWith(ENGINE_COPY_SUFFIX)
    ? copyName.slice(0, -ENGINE_COPY_SUFFIX.length)
    : copyName || item.characterName;
  const data: Record<string, unknown> = {
    name: op.namePrefix !== undefined ? `${op.namePrefix}${baseName}` : `${baseName}${op.nameSuffix}`,
  };
  const extensionFields: Record<string, string> = {};
  for (const [field, value] of Object.entries(op.fields)) {
    if (field === "backstory" || field === "appearance") extensionFields[field] = value;
    else data[field] = value;
  }
  if (Object.keys(extensionFields).length > 0) data.extensions = extensionFields;
  await patchHostCharacter(copyId, data, {
    versionSource: "agent",
    versionReason: `Card Editor bulk: ${label}`,
  });
  return { ok: true, resultCardId: copyId };
}

/** Execute every planned op sequentially; each op's outcome is captured, never thrown away. */
export async function executeApplyOps(
  item: SessionItem,
  ops: readonly ApplyOperation[],
  options: { label: string },
): Promise<ApplyOpResult[]> {
  const results: ApplyOpResult[] = [];
  for (const [index, op] of ops.entries()) {
    try {
      results.push({ index, ...(await executeOp(item, op, options.label)) });
    } catch (error) {
      results.push({ index, ok: false, error: errorText(error) });
    }
  }
  return results;
}

export type ApproveItemOutcome =
  | { kind: "applied"; session: BulkSession }
  | { kind: "needs-confirmation"; holds: ApplyOperation[] }
  | { kind: "apply-failed"; session: BulkSession; message: string }
  | { kind: "report-failed"; message: string }
  | { kind: "failed"; message: string };

/**
 * Full approve flow: fetch the card's current fields (in-place modes), ask the verdict route to
 * plan, execute the planned ops, report the outcomes. needs-confirmation = stale holds waiting on
 * the inline "Apply anyway" decision; apply-failed = the server demoted the item to
 * failed-provider with the client's write error (retry re-dispatches from the item row).
 */
export async function approveSessionItem(
  session: BulkSession,
  item: SessionItem,
  options: { force: boolean },
): Promise<ApproveItemOutcome> {
  try {
    const completionMode = session.status === "completed" ? (session.config.completionMode ?? "ask") : "ask";
    const writelessMode =
      completionMode === "duplicate" ||
      (completionMode === "ask" && (session.config.saveMode === "duplicate" || session.config.saveMode === "combined"));
    const currentFields = writelessMode
      ? undefined
      : currentFieldsFromCard((await getHostCharacterCard(item.characterId)).fields);
    const response = await submitSessionItemVerdict(session.id, item.itemId, {
      verdict: "approve",
      ...(options.force ? { force: true } : {}),
      ...(currentFields === undefined ? {} : { currentFields }),
    });
    if (!isVerdictPlan(response)) return { kind: "failed", message: "The verdict route answered an unexpected shape." };
    if (response.status === "needs-confirmation") return { kind: "needs-confirmation", holds: response.holds };
    const results = await executeApplyOps(item, response.ops, { label: session.label });
    let settled: BulkSession;
    try {
      settled = await submitSessionItemApplyResult(session.id, item.itemId, results);
    } catch (error) {
      // The writes already happened (or partially happened) but the confirmation never landed:
      // the item still holds pendingOps server-side, so a panel reload re-reads the true state.
      return { kind: "report-failed", message: errorText(error) };
    }
    const firstFailure = results.find((result) => !result.ok);
    if (firstFailure) {
      const after = settled.items.find((candidate) => candidate.itemId === item.itemId);
      return {
        kind: "apply-failed",
        session: settled,
        message: after?.failure?.message ?? firstFailure.error ?? "A card write failed.",
      };
    }
    return { kind: "applied", session: settled };
  } catch (error) {
    return { kind: "failed", message: errorText(error) };
  }
}

export interface CompletionEnforcementOutcome {
  session: BulkSession;
  failedCount: number;
  messages: string[];
}

/**
 * Resumes every unreported completion-enforcement plan exposed by session polling. Apply mode first
 * sends current host fields through the normal verdict planner, so genuinely stale cards become
 * needs-review without an operation. Duplicate plans are already stashed by the queue-drain hook.
 */
export async function executeCompletionEnforcement(
  session: BulkSession,
  onProgress?: (done: number, total: number) => void,
): Promise<CompletionEnforcementOutcome> {
  if (session.status !== "completed") return { session, failedCount: 0, messages: [] };
  const completionMode = session.config.completionMode ?? "ask";
  const candidates = session.items.filter(
    (item) => Array.isArray(item.pendingOps) || (completionMode === "apply" && item.status === "awaiting-review"),
  );
  let current = session;
  let failedCount = 0;
  const messages: string[] = [];
  onProgress?.(0, candidates.length);
  for (const [index, sourceItem] of candidates.entries()) {
    const item = current.items.find((candidate) => candidate.itemId === sourceItem.itemId) ?? sourceItem;
    try {
      if (Array.isArray(item.pendingOps)) {
        const results = await executeApplyOps(item, item.pendingOps as ApplyOperation[], { label: current.label });
        current = await submitSessionItemApplyResult(current.id, item.itemId, results);
        if (results.some((result) => !result.ok)) failedCount += 1;
      } else {
        const outcome = await approveSessionItem(current, item, { force: false });
        if (outcome.kind === "applied" || outcome.kind === "apply-failed") {
          current = outcome.session;
          if (outcome.kind === "apply-failed") {
            failedCount += 1;
            messages.push(outcome.message);
          }
        } else if (outcome.kind === "needs-confirmation") {
          current = await getSession(current.id);
        } else {
          failedCount += 1;
          messages.push(outcome.message);
        }
      }
    } catch (error) {
      failedCount += 1;
      messages.push(errorText(error));
    }
    onProgress?.(index + 1, candidates.length);
  }
  return { session: current, failedCount, messages };
}

/** Reject needs no card material: the route flips the item and returns the session. */
export async function rejectSessionItem(
  session: BulkSession,
  item: SessionItem,
): Promise<{ kind: "rejected"; session: BulkSession } | { kind: "failed"; message: string }> {
  try {
    const response = await submitSessionItemVerdict(session.id, item.itemId, { verdict: "reject" });
    if (isVerdictPlan(response)) return { kind: "failed", message: "The verdict route answered an unexpected shape." };
    return { kind: "rejected", session: response };
  } catch (error) {
    return { kind: "failed", message: errorText(error) };
  }
}

/** Pure: the collected per-item XML blocks (description updates) in session target order. */
export function buildCombinedCardBlocks(items: readonly SessionItem[]): string[] {
  return items
    .filter((item) => item.status === "applied")
    .map((item) => (item.updates ?? []).find((update) => update.field === "description")?.newText ?? "")
    .filter((block) => block.trim().length > 0);
}

/** Combined-mode finisher: create the ONE card from the collected blocks, then record it.
 *  Partial combines (not every item collected) require the caller's explicit confirm — the route
 *  enforces it too (409 without confirmPartial). */
export async function combineCollectedSession(
  session: BulkSession,
  options: { confirmPartial?: boolean } = {},
): Promise<{ kind: "combined"; session: BulkSession } | { kind: "failed"; message: string }> {
  try {
    const collected = session.items.filter((item) => item.status === "applied");
    const blocks = buildCombinedCardBlocks(session.items);
    if (collected.length === 0 || blocks.length === 0) {
      return { kind: "failed", message: "No collected cards to combine yet." };
    }
    const name = session.config.combinedCardName?.trim() || session.label;
    const created = await createHostCharacter({ name, description: blocks.join("\n\n") });
    const resultCardId = typeof created?.id === "string" && created.id ? created.id : "";
    if (!resultCardId) throw new Error("The create call returned no card id.");
    const updated = await submitSessionCombine(session.id, {
      itemIds: collected.map((item) => item.itemId),
      resultCardId,
      ...(options.confirmPartial ? { confirmPartial: true } : {}),
    });
    return { kind: "combined", session: updated };
  } catch (error) {
    return { kind: "failed", message: errorText(error) };
  }
}

/**
 * Post-hoc duplication flow (SPEC 2026-10-06 P1): the duplicate-applied route plans one
 * duplicateThenPatch per eligible applied item; each item is then executed and reported exactly
 * like a verdict approve. Partial failures demote only their items to failed-provider (retryable
 * from the item row); successful items keep their clones — no rollback.
 */
export async function duplicateAppliedSessionItems(
  session: BulkSession,
): Promise<{ session: BulkSession; failedCount: number }> {
  const { plans } = await planSessionDuplicateApplied(session.id);
  let current = session;
  let failedCount = 0;
  for (const plan of plans) {
    const item = session.items.find((candidate) => candidate.itemId === plan.itemId);
    if (!item) continue;
    const results = await executeApplyOps(item, plan.ops, { label: session.label });
    current = await submitSessionItemApplyResult(session.id, plan.itemId, results);
    if (results.some((result) => !result.ok)) failedCount += 1;
  }
  return { session: current, failedCount };
}
