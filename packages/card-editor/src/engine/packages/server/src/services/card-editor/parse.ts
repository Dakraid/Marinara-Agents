/**
 * Response parsing for Card Editor bulk runs (ARCH §4, SPEC §4). Tolerates prose around the JSON
 * payload and ``` fences; validates every update through the frozen schema rules (editable
 * fields, length caps, session-target membership, rebalance-only empty newText). Validated
 * updates are stored per character without their characterId (the item shape carries it).
 *
 * Presence in `results` means the model answered for that character (possibly with a valid empty
 * updates array — a no-op success); missing targets are absent so the runner can re-run them
 * individually. Anything unrecognized is dropped with a reason, never thrown.
 */
import {
  validateCardFieldUpdate,
  type CardFieldUpdate,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";

export interface DroppedUpdate {
  characterId?: string;
  field?: string;
  reason: string;
}

export interface ParseOutcome {
  ok: boolean;
  results: Map<string, CardFieldUpdate[]>;
  dropped: DroppedUpdate[];
  parseError?: string;
}

type SessionTargets = readonly (string | { characterId: string })[];

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const candidates = [trimmed, trimmed.replace(/```[a-zA-Z0-9]*[ \t]*\n?/g, "").trim()];
  for (const candidate of candidates) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) continue;
    try {
      const parsed = sourceRecord(JSON.parse(candidate.slice(start, end + 1)));
      if (parsed) return parsed;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

/** Validates one entry's updates array. Returns null (entry absent from results) when the entry
 *  is not a usable object with an updates array; otherwise the validated updates, possibly []. */
function collectUpdates(
  entry: unknown,
  characterId: string,
  sessionTargets: SessionTargets,
  options: { rebalance: boolean },
  dropped: DroppedUpdate[],
): CardFieldUpdate[] | null {
  const record = sourceRecord(entry);
  if (!record || !Array.isArray(record.updates)) {
    dropped.push({ characterId, reason: "entry must be an object with an updates array" });
    return null;
  }
  const updates: CardFieldUpdate[] = [];
  for (const raw of record.updates) {
    const source = sourceRecord(raw);
    if (!source) {
      dropped.push({ characterId, reason: "update must be an object" });
      continue;
    }
    // The batch key routes the update; a characterId inside the update object is ignored.
    const verdict = validateCardFieldUpdate({ ...source, characterId }, sessionTargets, options);
    if (!verdict.ok) {
      dropped.push({
        characterId,
        ...(typeof source.field === "string" ? { field: source.field } : {}),
        reason: verdict.reason,
      });
      continue;
    }
    const { characterId: _routed, ...update } = verdict.update;
    updates.push(update);
  }
  return updates;
}

export function parseBatchResponse(
  raw: string,
  sessionTargets: SessionTargets,
  options: { rebalance: boolean },
): ParseOutcome {
  const dropped: DroppedUpdate[] = [];
  const results = new Map<string, CardFieldUpdate[]>();
  const parsed = extractJsonObject(raw);
  if (!parsed) {
    return { ok: false, results, dropped, parseError: "response did not contain a parseable JSON object" };
  }
  const targetIds = new Set(sessionTargets.map((target) => (typeof target === "string" ? target : target.characterId)));
  for (const [characterId, entry] of Object.entries(parsed)) {
    if (!targetIds.has(characterId)) {
      // Unknown keys are ignored and reported once; the model invented or mistyped a target.
      dropped.push({ characterId, reason: "characterId is not a session target" });
      continue;
    }
    const updates = collectUpdates(entry, characterId, sessionTargets, options, dropped);
    if (updates) results.set(characterId, updates);
  }
  return { ok: true, results, dropped };
}

export function parseSingleResponse(raw: string, characterId: string, options: { rebalance: boolean }): ParseOutcome {
  const dropped: DroppedUpdate[] = [];
  const results = new Map<string, CardFieldUpdate[]>();
  const parsed = extractJsonObject(raw);
  if (!parsed) {
    return { ok: false, results, dropped, parseError: "response did not contain a parseable JSON object" };
  }
  const updates = collectUpdates(parsed, characterId, [characterId], options, dropped);
  if (updates === null) {
    return { ok: false, results, dropped, parseError: 'response did not contain an "updates" array' };
  }
  results.set(characterId, updates);
  return { ok: true, results, dropped };
}
