import type { CapabilityDocumentRecord } from "@marinara-engine/shared";
import {
  emptyPokedexVault,
  normalizePokedexEggsExpected,
  normalizePokedexEncounterOutcome,
  normalizePokedexKey,
  normalizePokedexScan,
  normalizePokedexSettings,
  normalizePokedexString,
  type DexEntry,
  type PokedexEncounter,
  type PokedexHaremMember,
  type PokedexPregnancy,
  type PokedexVault,
} from "../../../../shared/src/features/agents/pokedex/schema.js";
import { getPokedexRuntime } from "./package-runtime.js";

const PACKAGE_ID = "pokedex";
const DOCUMENT_KIND = "chat-vault";

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function storedTimestamp(value: unknown, fallback: string): string {
  return normalizePokedexString(value, 160) || fallback;
}

function normalizeDexEntry(value: unknown): DexEntry | null {
  const source = sourceRecord(value);
  const scan = normalizePokedexScan(value);
  if (!source || !scan) return null;
  const key = normalizePokedexKey(source.key) || normalizePokedexKey(scan.species);
  const sourceMessageId = normalizePokedexString(source.sourceMessageId, 200);
  if (!key || !sourceMessageId) return null;
  const now = new Date().toISOString();
  return {
    ...scan,
    key,
    firstMetAt: storedTimestamp(source.firstMetAt, now),
    sourceMessageId,
  };
}

function normalizeHaremMember(value: unknown, dex: Record<string, DexEntry>): PokedexHaremMember | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const key = normalizePokedexKey(source.key);
  const relationshipStatus = normalizePokedexString(source.relationshipStatus, 160);
  const lastInteraction = normalizePokedexString(source.lastInteraction, 300);
  const currentStatus = normalizePokedexString(source.currentStatus, 200);
  if (!key || !dex[key] || !relationshipStatus || !lastInteraction || !currentStatus) return null;
  return {
    key,
    relationshipStatus,
    lastInteraction,
    currentStatus,
    joinedAt: storedTimestamp(source.joinedAt, new Date().toISOString()),
  };
}

function normalizePregnancy(value: unknown, dex: Record<string, DexEntry>): PokedexPregnancy | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const key = normalizePokedexKey(source.key);
  const sire = normalizePokedexString(source.sire, 120);
  const sourceMessageId = normalizePokedexString(source.sourceMessageId, 200);
  if (!key || !dex[key] || !sire || !sourceMessageId) return null;
  return {
    key,
    eggsExpected: normalizePokedexEggsExpected(source.eggsExpected),
    sire,
    bredAt: storedTimestamp(source.bredAt, new Date().toISOString()),
    sourceMessageId,
  };
}

function normalizeEncounter(value: unknown, dex: Record<string, DexEntry>): PokedexEncounter | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const key = normalizePokedexKey(source.key);
  const outcome = normalizePokedexEncounterOutcome(source.outcome);
  const sourceMessageId = normalizePokedexString(source.sourceMessageId, 200);
  if (!key || !dex[key] || !outcome || !sourceMessageId) return null;
  return {
    key,
    outcome,
    at: storedTimestamp(source.at, new Date().toISOString()),
    sourceMessageId,
  };
}

export function normalizePokedexVault(value: unknown): PokedexVault {
  const source = sourceRecord(value) ?? {};
  const settings = normalizePokedexSettings(source.settings);
  const dexEntries = sourceRecord(source.dex)
    ? Object.values(source.dex as Record<string, unknown>).flatMap((entry) => normalizeDexEntry(entry) ?? [])
    : [];
  const dex = Object.fromEntries(dexEntries.map((entry) => [entry.key, entry]));
  const seenHarem = new Set<string>();
  const harem = Array.isArray(source.harem)
    ? source.harem.flatMap((value) => {
        const member = normalizeHaremMember(value, dex);
        if (!member || seenHarem.has(member.key)) return [];
        seenHarem.add(member.key);
        return [member];
      })
    : [];
  const seenPregnancies = new Set<string>();
  const pregnancies = Array.isArray(source.pregnancies)
    ? source.pregnancies.flatMap((value) => {
        const pregnancy = normalizePregnancy(value, dex);
        if (!pregnancy || seenPregnancies.has(pregnancy.key)) return [];
        seenPregnancies.add(pregnancy.key);
        return [pregnancy];
      })
    : [];
  const recentEncounters = (
    Array.isArray(source.recentEncounters)
      ? source.recentEncounters.flatMap((value) => normalizeEncounter(value, dex) ?? [])
      : []
  ).slice(-settings.maxRecentEncounters);
  const latestSource = sourceRecord(source.latestScan);
  const latestKeys = Array.isArray(latestSource?.keys)
    ? [
        ...new Set(
          latestSource.keys
            .map((key) => normalizePokedexKey(key))
            .filter((key): key is string => Boolean(key && dex[key])),
        ),
      ]
    : [];
  return {
    ...emptyPokedexVault(),
    dex,
    harem,
    pregnancies,
    recentEncounters,
    latestScan:
      latestSource && latestKeys.length > 0
        ? {
            keys: latestKeys,
            at: storedTimestamp(latestSource.at, new Date().toISOString()),
          }
        : null,
    settings,
  };
}

function vaultDocumentId(chatId: string): string {
  return `chat:${chatId}`;
}

function isVaultCreateConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const conflict = error as { code?: unknown; table?: unknown; keys?: unknown };
  return (
    conflict.code === "FILE_UNIQUE_CONSTRAINT" &&
    conflict.table === "capability_documents" &&
    Array.isArray(conflict.keys) &&
    conflict.keys.length === 1 &&
    conflict.keys[0] === "id"
  );
}

async function findDocument(chatId: string): Promise<CapabilityDocumentRecord | null> {
  return getPokedexRuntime().persistence.documents.getById(PACKAGE_ID, vaultDocumentId(chatId));
}

export async function readPokedexVault(chatId: string): Promise<PokedexVault> {
  const document = await findDocument(chatId);
  return normalizePokedexVault(document?.data);
}

export async function updatePokedexVault(
  chatId: string,
  update: (current: PokedexVault) => PokedexVault | Promise<PokedexVault>,
): Promise<PokedexVault> {
  const runtime = getPokedexRuntime();
  let lastCreateError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const document = await findDocument(chatId);
    const current = normalizePokedexVault(document?.data);
    const next = normalizePokedexVault(await update(current));
    const now = new Date().toISOString();
    if (!document) {
      try {
        await runtime.persistence.documents.create({
          id: vaultDocumentId(chatId),
          packageId: PACKAGE_ID,
          kind: DOCUMENT_KIND,
          name: chatId,
          description: "Per-chat Pokédex vault",
          data: next,
          createdAt: now,
          updatedAt: now,
        });
        return next;
      } catch (error) {
        lastCreateError = error;
        if (!isVaultCreateConflict(error)) throw error;
        continue;
      }
    }
    const saved = await runtime.persistence.documents.update({
      id: document.id,
      packageId: PACKAGE_ID,
      expectedRevision: document.revision,
      name: chatId,
      description: document.description,
      data: next,
      updatedAt: now,
    });
    if (saved) return next;
  }
  if (lastCreateError instanceof Error) throw lastCreateError;
  throw new Error("Pokédex vault changed while it was being saved. Try again.");
}
