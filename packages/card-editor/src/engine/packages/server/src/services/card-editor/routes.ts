/**
 * HTTP routes for Card Editor bulk sessions (ARCH §2/§4, SPEC F3/F5), registered under
 * /api/card-editor by server-entry. All errors answer a JSON `{ error: string }` envelope (the
 * typed client's errorMessage() reads `error` first) with 400/404/409 as appropriate.
 *
 * Two coordinator decisions shape the payload contract:
 * 1. The capability host has no character/lorebook access, so POST /sessions carries ALL prompt
 *    material (target cards, lorebooks, behavior character); the server validates, captures
 *    per-field snapshots via normalizeCardPromptText, and never fetches engine data.
 * 2. Card writes are client-side over engine REST. The verdict route only plans (planApply) and
 *    answers { status: "needs-confirmation", holds } or { status: "apply", ops } with the ops
 *    stashed on the item as pendingOps; the client executes the ops and reports per-op outcomes
 *    to the apply-result route, which confirms or fails the item. Pending ops are serialized so a
 *    completed-session poll can resume completion enforcement after a panel remount.
 */
import type { FastifyPluginAsync, FastifyReply } from "fastify";
import {
  advanceItemStatus,
  newSession,
  normalizeSessionConfig,
  SchemaError,
  type BulkSession,
  type SessionItem,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { normalizeCardPromptText } from "../../../../shared/src/features/agents/card-editor/text.ts";
import { planApply, planDuplicateApplied, type ApplyOperation } from "./apply.ts";
import type { CharacterLike, LorebookLike } from "./context.ts";
import { cancelSessionRun, retryItemRun, startRunner, type RunnerDeps, type RunnerLogger } from "./runner.ts";
import type { SessionPromptMaterial, SessionStore } from "./session-store.ts";

export interface CardEditorRouteDeps extends RunnerDeps {
  store: SessionStore;
  logger: RunnerLogger;
}

/** The snapshot covers every bulk-editable field so the verdict staleness check compares exactly
 *  the text the model saw (SPEC F1). Mirrors the schema's bulk-editable field list. */
const SNAPSHOT_FIELDS = [
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

const CARD_FIELDS = ["name", ...SNAPSHOT_FIELDS] as const;

const MAX_CONTENT_CHARS = 100_000;
const MAX_PROMPT_CHARS = 500_000;
const MAX_TARGETS = 500;
const MAX_LOREBOOKS = 50;
const MAX_LOREBOOK_ENTRIES = 500;
const MAX_INCLUDE_FIELDS = 100;

function badRequest(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}
function notFound(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 404 });
}
function conflict(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 409 });
}

function sourceRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw badRequest("A JSON request body is required.");
  }
  return value as Record<string, unknown>;
}

function cappedString(value: unknown, field: string, max: number, { optional = false } = {}): string {
  if (value === undefined || value === null) {
    if (optional) return "";
    throw badRequest(`${field} is required.`);
  }
  if (typeof value !== "string") throw badRequest(`${field} must be a string.`);
  if (value.length > max) throw badRequest(`${field} must be at most ${max} characters.`);
  return value;
}

interface TargetPayload {
  characterId: string;
  characterName?: string;
  note?: string;
  behaviorOverride?: string | null;
  behaviorOverrideCard?: CharacterLike;
  card: CharacterLike;
}

const BEHAVIOR_CARD_FIELDS = [
  "name",
  "description",
  "personality",
  "backstory",
  "appearance",
  "system_prompt",
] as const;

/** Style-card fields validated exactly like the session-level behavior character. */
function parseBehaviorCardFields(value: unknown, fieldPrefix: string): CharacterLike {
  const source = sourceRecord(value);
  const character: CharacterLike = {};
  for (const field of BEHAVIOR_CARD_FIELDS) {
    character[field] = cappedString(source[field], `${fieldPrefix}.${field}`, MAX_CONTENT_CHARS, { optional: true });
  }
  return character;
}

function parseTarget(value: unknown, index: number): TargetPayload {
  const source = sourceRecord(value);
  const characterId = cappedString(source.characterId, `targets[${index}].characterId`, 160).trim();
  if (!characterId) throw badRequest(`targets[${index}].characterId is required.`);
  if (
    source.card === undefined ||
    source.card === null ||
    typeof source.card !== "object" ||
    Array.isArray(source.card)
  ) {
    throw badRequest(`targets[${index}].card is required.`);
  }
  const cardSource = source.card as Record<string, unknown>;
  const card: CharacterLike = {};
  for (const field of CARD_FIELDS) {
    card[field] = cappedString(cardSource[field], `targets[${index}].card.${field}`, MAX_CONTENT_CHARS, {
      optional: true,
    });
  }
  const target: TargetPayload = { characterId, card };
  if (source.characterName !== undefined) {
    target.characterName = cappedString(source.characterName, `targets[${index}].characterName`, 300);
  }
  if (source.note !== undefined) target.note = cappedString(source.note, `targets[${index}].note`, 10_000);
  if (source.behaviorOverride !== undefined && source.behaviorOverride !== null) {
    target.behaviorOverride = cappedString(source.behaviorOverride, `targets[${index}].behaviorOverride`, 160);
  } else if (source.behaviorOverride === null) {
    target.behaviorOverride = null;
  }
  if (source.behaviorOverrideCard !== undefined && source.behaviorOverrideCard !== null) {
    target.behaviorOverrideCard = parseBehaviorCardFields(
      source.behaviorOverrideCard,
      `targets[${index}].behaviorOverrideCard`,
    );
  }
  return target;
}

function parseLorebooks(value: unknown): LorebookLike[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_LOREBOOKS) {
    throw badRequest(`lorebooks must be an array of at most ${MAX_LOREBOOKS} books.`);
  }
  return value.map((entry, index) => {
    const source = sourceRecord(entry);
    const lorebook: LorebookLike = { name: cappedString(source.name, `lorebooks[${index}].name`, 300) };
    if (source.entries !== undefined) {
      if (!Array.isArray(source.entries) || source.entries.length > MAX_LOREBOOK_ENTRIES) {
        throw badRequest(`lorebooks[${index}].entries must be an array of at most ${MAX_LOREBOOK_ENTRIES} entries.`);
      }
      lorebook.entries = source.entries.map((rawEntry, entryIndex) => ({
        name: cappedString(sourceRecord(rawEntry).name, `lorebooks[${index}].entries[${entryIndex}].name`, 300, {
          optional: true,
        }),
        content: cappedString(
          sourceRecord(rawEntry).content,
          `lorebooks[${index}].entries[${entryIndex}].content`,
          MAX_CONTENT_CHARS,
          {
            optional: true,
          },
        ),
        enabled: sourceRecord(rawEntry).enabled !== false,
      }));
    }
    return lorebook;
  });
}

function parseBehaviorCharacter(value: unknown): CharacterLike | null {
  if (value === undefined || value === null) return null;
  return parseBehaviorCardFields(value, "behaviorCharacter");
}

function parseIncludeFields(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > MAX_INCLUDE_FIELDS) {
    throw badRequest(`includeFields must be an array of at most ${MAX_INCLUDE_FIELDS} field names.`);
  }
  return value.map((entry, index) => cappedString(entry, `includeFields[${index}]`, 160));
}

function parseCurrentFields(value: unknown): Record<string, string> | undefined {
  if (value === undefined) return undefined;
  const source = sourceRecord(value);
  const entries = Object.entries(source);
  if (entries.length > MAX_INCLUDE_FIELDS) throw badRequest("currentFields carries too many fields.");
  const fields: Record<string, string> = {};
  for (const [key, entry] of entries) {
    if (key.length > 160) throw badRequest("currentFields field names must be at most 160 characters.");
    fields[key] = cappedString(entry, `currentFields.${key}`, MAX_CONTENT_CHARS);
  }
  return fields;
}

/** Clone the document envelope before returning it; pendingOps intentionally remain visible so
 *  polling clients can finish the two-phase completion policy and report its outcomes. */
function toPublicSession(session: BulkSession): BulkSession {
  return { ...session, items: session.items.map((item) => ({ ...item })) };
}

function toSessionIndex(session: BulkSession) {
  return {
    id: session.id,
    label: session.label,
    status: session.status,
    stats: session.stats,
    createdAt: session.createdAt,
    completionMode: session.config.completionMode ?? "ask",
    pendingApplyCount: session.items.filter((item) => Array.isArray(item.pendingOps)).length,
    enforcementPendingCount:
      session.status === "completed" && session.config.completionMode === "apply"
        ? session.items.filter((item) => item.status === "awaiting-review").length
        : 0,
  };
}

function findItem(session: BulkSession, itemId: string): SessionItem {
  const item = session.items.find((candidate) => candidate.itemId === itemId);
  if (!item) throw notFound("Card Editor session item not found.");
  return item;
}

function errorStatusCode(error: unknown): number {
  const code = (error as { statusCode?: unknown } | null)?.statusCode;
  return typeof code === "number" && Number.isInteger(code) && code >= 400 && code < 600 ? code : 500;
}

export function createCardEditorRoutes(deps: CardEditorRouteDeps): FastifyPluginAsync {
  const { store, logger } = deps;

  async function handle(reply: FastifyReply, work: () => Promise<unknown>): Promise<unknown> {
    try {
      return await work();
    } catch (error) {
      const status = errorStatusCode(error);
      if (status >= 500) logger.error(error, "Card Editor route failed");
      return reply.status(status).send({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  async function requireSession(id: unknown): Promise<BulkSession> {
    if (typeof id !== "string" || !id.trim() || id.length > 160) throw badRequest("A session id is required.");
    const session = await store.getSession(id);
    if (!session) throw notFound("Card Editor session not found.");
    return session;
  }

  const routes: FastifyPluginAsync = async (app) => {
    app.get("/health", async () => ({ ok: true }));

    app.post("/sessions", async (request, reply) =>
      handle(reply, async () => {
        const body = sourceRecord(request.body);
        if (!Array.isArray(body.targets) || body.targets.length < 1 || body.targets.length > MAX_TARGETS) {
          throw badRequest(`targets must be an array of 1..${MAX_TARGETS} entries.`);
        }
        const targets = body.targets.map(parseTarget);
        const seen = new Set<string>();
        for (const target of targets) {
          if (seen.has(target.characterId)) throw badRequest(`duplicate characterId in targets: ${target.characterId}`);
          seen.add(target.characterId);
        }
        for (const target of targets) {
          if (typeof target.behaviorOverride === "string") {
            // A materialized override card (any library character, DESIGN §2) needs no
            // reference resolution; the reference form must point at another session target.
            if (target.behaviorOverrideCard) continue;
            if (target.behaviorOverride === target.characterId || !seen.has(target.behaviorOverride)) {
              throw badRequest(
                `targets[].behaviorOverride must reference another target's characterId (unknown: ${target.behaviorOverride}).`,
              );
            }
          }
        }
        let config;
        try {
          config = normalizeSessionConfig(body.config ?? {});
        } catch (error) {
          if (error instanceof SchemaError) throw badRequest(error.message);
          throw error;
        }
        if (config.globalInstruction.length > MAX_CONTENT_CHARS) {
          throw badRequest(`config.globalInstruction must be at most ${MAX_CONTENT_CHARS} characters.`);
        }
        if (config.customTemplate !== undefined && config.customTemplate.length > MAX_CONTENT_CHARS) {
          throw badRequest(`config.customTemplate must be at most ${MAX_CONTENT_CHARS} characters.`);
        }
        // Mirror assemblePrompt's rule so a bad custom preset fails at dispatch time, not mid-run.
        if (config.presetId === "custom" && !(config.customTemplate ?? "").trim()) {
          throw badRequest('presetId "custom" requires a non-empty customTemplate.');
        }
        const behaviorOverrideCards = Object.fromEntries(
          targets
            .filter((target) => target.behaviorOverrideCard !== undefined)
            .map((target) => [target.characterId, target.behaviorOverrideCard!]),
        );
        const material: SessionPromptMaterial = {
          version: 1,
          lorebooks: parseLorebooks(body.lorebooks),
          behaviorCharacter: parseBehaviorCharacter(body.behaviorCharacter),
          ...(Object.keys(behaviorOverrideCards).length > 0 ? { behaviorOverrideCards } : {}),
        };
        const label =
          (body.label === undefined ? "" : cappedString(body.label, "label", 200).trim()) ||
          `Bulk edit · ${targets.length} card${targets.length === 1 ? "" : "s"}`;
        const session = newSession(
          label,
          config,
          targets.map((target) => ({
            characterId: target.characterId,
            characterName: target.characterName || target.card.name || target.characterId,
            ...(target.note === undefined ? {} : { note: target.note }),
            ...(target.behaviorOverride === undefined ? {} : { behaviorOverride: target.behaviorOverride }),
          })),
        );
        const withSnapshots: BulkSession = {
          ...session,
          items: session.items.map((item) => {
            const target = targets.find((candidate) => candidate.characterId === item.characterId)!;
            return {
              ...item,
              snapshots: Object.fromEntries(
                SNAPSHOT_FIELDS.map((field) => [field, normalizeCardPromptText(target.card[field])]),
              ),
            };
          }),
        };
        const created = await store.createSession(withSnapshots, material);
        startRunner(deps, created.id);
        return toPublicSession(created);
      }),
    );

    app.get("/sessions", async (_request, reply) =>
      handle(reply, async () => (await store.listSessions()).map(toSessionIndex)),
    );

    app.get("/sessions/:id", async (request, reply) =>
      handle(reply, async () => toPublicSession(await requireSession((request.params as { id?: unknown }).id))),
    );

    app.post("/sessions/:id/cancel", async (request, reply) =>
      handle(reply, async () => {
        const session = await requireSession((request.params as { id?: unknown }).id);
        if (session.status !== "active") return toPublicSession(session);
        return toPublicSession(await cancelSessionRun(deps, session.id));
      }),
    );

    app.post("/sessions/:id/rerun", async (request, reply) =>
      handle(reply, async () => {
        const source = await requireSession((request.params as { id?: unknown }).id);
        if (source.status !== "completed" && source.status !== "canceled") {
          throw conflict("Only a completed or canceled session can run again.");
        }
        const material = await store.getSessionMaterial(source.id);
        if (!material) throw conflict("The session's prompt material is missing and cannot be rerun.");
        const orderedItems = source.items.filter(
          (item, index, items) => items.findIndex((candidate) => candidate.characterId === item.characterId) === index,
        );
        const rerun = newSession(
          `${source.label} (rerun)`,
          source.config,
          orderedItems.map((item) => ({
            characterId: item.characterId,
            characterName: item.characterName,
            ...(item.note === undefined ? {} : { note: item.note }),
            ...(item.behaviorOverride === undefined ? {} : { behaviorOverride: item.behaviorOverride }),
          })),
        );
        const withSnapshots: BulkSession = {
          ...rerun,
          items: rerun.items.map((item) => ({
            ...item,
            snapshots: {
              ...(orderedItems.find((sourceItem) => sourceItem.characterId === item.characterId)?.snapshots ?? {}),
            },
          })),
        };
        const created = await store.createSession(withSnapshots, material);
        startRunner(deps, created.id);
        return toPublicSession(created);
      }),
    );

    app.post("/sessions/:id/items/:itemId/retry", async (request, reply) =>
      handle(reply, async () => {
        const params = request.params as { id?: unknown; itemId?: unknown };
        const session = await requireSession(params.id);
        if (typeof params.itemId !== "string" || !params.itemId) throw badRequest("An item id is required.");
        return toPublicSession(await retryItemRun(deps, session.id, params.itemId));
      }),
    );

    app.post("/sessions/:id/items/:itemId/cancel", async (request, reply) =>
      handle(reply, async () => {
        const params = request.params as { id?: unknown; itemId?: unknown };
        const session = await requireSession(params.id);
        if (typeof params.itemId !== "string" || !params.itemId) throw badRequest("An item id is required.");
        const item = findItem(session, params.itemId);
        if (item.status !== "queued") throw conflict("Only a queued item can be canceled.");
        // The runner absorbs canceled items on its own (pump skips non-queued tasks and the drain
        // check completes the session), so a plain status write is the whole cancel.
        const updated = await store.updateSession(session.id, (current) => ({
          ...current,
          items: current.items.map((candidate) =>
            candidate.itemId === item.itemId && candidate.status === "queued"
              ? advanceItemStatus(candidate, "canceled")
              : candidate,
          ),
        }));
        if (!updated) throw notFound("Card Editor session not found.");
        return toPublicSession(updated);
      }),
    );

    app.post("/sessions/:id/items/:itemId/edit-retry", async (request, reply) =>
      handle(reply, async () => {
        const params = request.params as { id?: unknown; itemId?: unknown };
        const session = await requireSession(params.id);
        if (typeof params.itemId !== "string" || !params.itemId) throw badRequest("An item id is required.");
        const body = sourceRecord(request.body);
        const prompt = {
          system: cappedString(body.system, "system", MAX_PROMPT_CHARS),
          user: cappedString(body.user, "user", MAX_PROMPT_CHARS),
        };
        return toPublicSession(await retryItemRun(deps, session.id, params.itemId, prompt));
      }),
    );

    app.post("/sessions/:id/items/:itemId/verdict", async (request, reply) =>
      handle(reply, async () => {
        const params = request.params as { id?: unknown; itemId?: unknown };
        const session = await requireSession(params.id);
        if (typeof params.itemId !== "string" || !params.itemId) throw badRequest("An item id is required.");
        const item = findItem(session, params.itemId);
        const reviewable = item.status === "awaiting-review" || item.status === "needs-review";
        if (!reviewable) {
          throw conflict("Only an item awaiting review can receive a verdict.");
        }
        const body = sourceRecord(request.body);
        if (body.verdict !== "approve" && body.verdict !== "reject") {
          throw badRequest('verdict must be "approve" or "reject".');
        }
        const reviewableItem = (candidate: SessionItem) =>
          candidate.itemId === item.itemId &&
          (candidate.status === "awaiting-review" || candidate.status === "needs-review");
        const transitioned = (updated: BulkSession, status: SessionItem["status"]) => {
          const after = updated.items.find((candidate) => candidate.itemId === item.itemId);
          if (!after || after.status !== status) throw conflict("The item's review state changed; retry the verdict.");
          return updated;
        };
        if (body.verdict === "reject") {
          const updated = await store.updateSession(session.id, (current) => ({
            ...current,
            items: current.items.map((candidate) =>
              reviewableItem(candidate) ? advanceItemStatus(candidate, "rejected") : candidate,
            ),
          }));
          if (!updated) throw notFound("Card Editor session not found.");
          return toPublicSession(transitioned(updated, "rejected"));
        }
        // approve: two-phase apply (Decision 2) — the route plans, the client executes the ops.
        // Completion enforcement is independent from the session's interactive save mode.
        const completionMode = session.status === "completed" ? (session.config.completionMode ?? "ask") : "ask";
        const saveMode =
          completionMode === "apply" ? "auto" : completionMode === "duplicate" ? "duplicate" : session.config.saveMode;
        const force = body.force === true;
        const includeFields = parseIncludeFields(body.includeFields);
        const currentFields = parseCurrentFields(body.currentFields);
        if (saveMode !== "duplicate" && saveMode !== "combined" && !currentFields) {
          throw badRequest("currentFields is required when approving an in-place save mode.");
        }
        const ops = planApply(item, currentFields ?? {}, {
          force,
          ...(includeFields === undefined ? {} : { includeFields }),
          saveMode,
          label: session.label,
          duplicateSuffix: session.config.duplicateSuffix,
          ...(session.config.duplicatePrefix === undefined ? {} : { duplicatePrefix: session.config.duplicatePrefix }),
          ...(session.config.combinedCardName === undefined
            ? {}
            : { combinedCardName: session.config.combinedCardName }),
        });
        const holds = ops.filter((op) => op.op === "hold");
        if (holds.length > 0 && !force) {
          const updated = await store.updateSession(session.id, (current) => ({
            ...current,
            items: current.items.map((candidate) =>
              reviewableItem(candidate) ? advanceItemStatus(candidate, "needs-review") : candidate,
            ),
          }));
          if (!updated) throw notFound("Card Editor session not found.");
          transitioned(updated, "needs-review");
          return { status: "needs-confirmation", holds };
        }
        const nextStatus = saveMode === "duplicate" ? "duplicated" : "applied";
        const updated = await store.updateSession(session.id, (current) => ({
          ...current,
          items: current.items.map((candidate) =>
            reviewableItem(candidate) ? { ...advanceItemStatus(candidate, nextStatus), pendingOps: ops } : candidate,
          ),
        }));
        if (!updated) throw notFound("Card Editor session not found.");
        transitioned(updated, nextStatus);
        return { status: "apply", ops };
      }),
    );

    app.post("/sessions/:id/duplicate-applied", async (request, reply) =>
      handle(reply, async () => {
        const session = await requireSession((request.params as { id?: unknown }).id);
        const plans = planDuplicateApplied(session);
        if (plans.length === 0) return { plans };
        // Same two-phase contract as the verdict route (Decision 2): the route plans and stashes
        // pendingOps; the client executes the ops and reports to apply-result.
        const wanted = new Map(plans.map((plan) => [plan.itemId, plan.ops]));
        const updated = await store.updateSession(session.id, (current) => ({
          ...current,
          items: current.items.map((candidate) => {
            const ops = wanted.get(candidate.itemId);
            return ops !== undefined && candidate.status === "applied" && candidate.resultCardId === undefined
              ? { ...candidate, pendingOps: ops }
              : candidate;
          }),
        }));
        if (!updated) throw notFound("Card Editor session not found.");
        return { plans };
      }),
    );

    app.post("/sessions/:id/items/:itemId/apply-result", async (request, reply) =>
      handle(reply, async () => {
        const params = request.params as { id?: unknown; itemId?: unknown };
        const session = await requireSession(params.id);
        if (typeof params.itemId !== "string" || !params.itemId) throw badRequest("An item id is required.");
        const item = findItem(session, params.itemId);
        const pendingOps = (item.pendingOps ?? []) as ApplyOperation[];
        if ((item.status !== "applied" && item.status !== "duplicated") || !Array.isArray(item.pendingOps)) {
          throw conflict("The item has no pending apply to confirm.");
        }
        const body = sourceRecord(request.body);
        if (!Array.isArray(body.results) || body.results.length !== pendingOps.length) {
          throw badRequest("results must report one entry per planned operation.");
        }
        const seenIndexes = new Set<number>();
        const results = body.results.map((value: unknown) => {
          const source = sourceRecord(value);
          const index = source.index;
          if (!Number.isInteger(index) || (index as number) < 0 || (index as number) >= pendingOps.length) {
            throw badRequest("results indexes must address the planned operations.");
          }
          if (seenIndexes.has(index as number)) throw badRequest("results contain a duplicate op index.");
          seenIndexes.add(index as number);
          if (typeof source.ok !== "boolean") throw badRequest("results must carry a boolean ok flag.");
          return {
            index: index as number,
            ok: source.ok,
            error:
              source.error === undefined ? undefined : cappedString(source.error, `results[${index}].error`, 2_000),
            resultCardId:
              source.resultCardId === undefined
                ? undefined
                : cappedString(source.resultCardId, `results[${index}].resultCardId`, 160),
          };
        });
        const failures = results.filter((result: { ok: boolean }) => !result.ok);
        const updated = await store.updateSession(session.id, (current) => ({
          ...current,
          items: current.items.map((candidate) => {
            if (candidate.itemId !== item.itemId) return candidate;
            if (candidate.status !== "applied" && candidate.status !== "duplicated") return candidate;
            const { pendingOps: _dropped, autoApply: _autoApply, ...rest } = candidate;
            if (failures.length === 0) {
              const resultCardId = results.find(
                (result: { resultCardId?: string }) => typeof result.resultCardId === "string",
              )?.resultCardId;
              return {
                ...rest,
                appliedAt: new Date().toISOString(),
                // resultCardId is stored for every status: duplicate-applied runs clone an
                // already-applied item (status stays "applied") and the clone is the result.
                ...(resultCardId ? { resultCardId } : {}),
              };
            }
            // A client-side write failed (Decision 2): keep updates + snapshots for retry/review.
            const failed = advanceItemStatus(rest, "failed-provider");
            return {
              ...failed,
              failure: {
                kind: "provider" as const,
                message: failures[0]!.error ?? "The client reported an apply failure.",
                attempts: 0,
              },
            };
          }),
        }));
        if (!updated) throw notFound("Card Editor session not found.");
        return toPublicSession(updated);
      }),
    );

    app.post("/sessions/:id/combine", async (request, reply) =>
      handle(reply, async () => {
        const params = request.params as { id?: unknown };
        const session = await requireSession(params.id);
        if (session.config.saveMode !== "combined") {
          throw badRequest("The combine action is only available for combined save-mode sessions.");
        }
        if (session.combinedCardId) throw conflict("This session already produced its combined card.");
        const body = sourceRecord(request.body);
        const resultCardId = cappedString(body.resultCardId, "resultCardId", 160);
        if (!resultCardId) throw badRequest("resultCardId is required.");
        if (!Array.isArray(body.itemIds) || body.itemIds.length === 0) {
          throw badRequest("itemIds must be a non-empty array of collected item ids.");
        }
        const seen = new Set<string>();
        const itemIds: string[] = [];
        for (const value of body.itemIds) {
          if (typeof value !== "string" || !value) throw badRequest("itemIds must be strings.");
          if (seen.has(value)) throw badRequest("itemIds contains a duplicate.");
          seen.add(value);
          itemIds.push(value);
        }
        const collected = new Set(
          session.items.filter((candidate) => candidate.status === "applied").map((candidate) => candidate.itemId),
        );
        for (const itemId of itemIds) {
          if (!collected.has(itemId)) {
            throw conflict("Only collected (approved) items can join the combined card.");
          }
        }
        // Combining a subset (some items failed or were rejected) is an explicit user decision.
        if (itemIds.length < session.items.length && body.confirmPartial !== true) {
          throw conflict("Not every item was collected; repeat with confirmPartial to combine the subset.");
        }
        const wanted = new Set(itemIds);
        const updated = await store.updateSession(session.id, (current) => ({
          ...current,
          combinedCardId: resultCardId,
          items: current.items.map((candidate) =>
            wanted.has(candidate.itemId)
              ? { ...candidate, resultCardId, appliedAt: candidate.appliedAt ?? new Date().toISOString() }
              : candidate,
          ),
        }));
        if (!updated) throw notFound("Card Editor session not found.");
        return toPublicSession(updated);
      }),
    );

    app.delete("/sessions/:id", async (request, reply) =>
      handle(reply, async () => {
        const session = await requireSession((request.params as { id?: unknown }).id);
        const query = (request.query ?? {}) as { force?: unknown };
        const force = query.force === "true" || query.force === "1";
        if (session.status === "active") {
          if (!force) throw conflict("The session is still active; cancel it first or repeat with ?force=true.");
          await cancelSessionRun(deps, session.id);
        }
        await store.deleteSession(session.id);
        return reply.status(204).send();
      }),
    );
  };
  return routes;
}
