import { createHash } from "node:crypto";
import type { AgentContext, AgentResult } from "@marinara-engine/shared";
import { renderPokedexScanCard } from "../../../../shared/src/features/agents/pokedex/card-html.js";
import {
  normalizePokedexEncounter,
  normalizePokedexKey,
  normalizePokedexPregnancyEvent,
  normalizePokedexScan,
  normalizePokedexUpdate,
  type DexEntry,
  type PokedexEncounterInput,
  type PokedexPregnancyEvent,
  type PokedexScan,
  type PokedexUpdate,
} from "../../../../shared/src/features/agents/pokedex/schema.js";
import { getPokedexRuntime } from "./package-runtime.js";
import { readPokedexVault, updatePokedexVault } from "./vault.js";

type AgentConfig = {
  id: string;
  type: string;
  name: string;
  connectionId: string | null;
  settings: Record<string, unknown>;
};

type PokedexDelta = {
  newScans: PokedexScan[];
  updates: PokedexUpdate[];
  haremJoins: string[];
  haremLeaves: string[];
  pregnancyEvents: PokedexPregnancyEvent[];
  encounters: PokedexEncounterInput[];
};

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function requiredArray(source: Record<string, unknown>, key: string): unknown[] {
  const value = source[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`Pokédex agent field ${key} must be an array.`);
  return value;
}

function parseDelta(value: unknown): PokedexDelta {
  let candidate = value;
  let source = sourceRecord(candidate);
  if (source && !Object.hasOwn(source, "newScans")) {
    const encoded = typeof source.text === "string" ? source.text : typeof source.raw === "string" ? source.raw : null;
    if (encoded) {
      candidate = getPokedexRuntime().json.parseJsonish(encoded);
      source = sourceRecord(candidate);
    }
  }
  if (!source) throw new Error("Pokédex agent returned an invalid JSON delta.");
  return {
    newScans: requiredArray(source, "newScans").flatMap((value) => normalizePokedexScan(value) ?? []),
    updates: requiredArray(source, "updates").flatMap((value) => normalizePokedexUpdate(value) ?? []),
    haremJoins: requiredArray(source, "haremJoins").flatMap((value) => {
      const key = normalizePokedexKey(value);
      return key ? [key] : [];
    }),
    haremLeaves: requiredArray(source, "haremLeaves").flatMap((value) => {
      const key = normalizePokedexKey(value);
      return key ? [key] : [];
    }),
    pregnancyEvents: requiredArray(source, "pregnancyEvents").flatMap(
      (value) => normalizePokedexPregnancyEvent(value) ?? [],
    ),
    encounters: requiredArray(source, "encounters").flatMap((value) => normalizePokedexEncounter(value) ?? []),
  };
}

function sourceMessageId(context: AgentContext): string {
  const matchingAssistant = [...context.recentMessages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        typeof message.id === "string" &&
        message.id.length > 0 &&
        context.mainResponse !== null &&
        message.content === context.mainResponse,
    );
  if (matchingAssistant?.id) return matchingAssistant.id.slice(0, 200);
  const latestMessageId = [...context.recentMessages]
    .reverse()
    .find((message) => typeof message.id === "string" && message.id.length > 0)?.id;
  if (latestMessageId) return latestMessageId.slice(0, 200);
  return `response:${createHash("sha256")
    .update(`${context.chatId}\0${context.mainResponse ?? ""}`)
    .digest("hex")}`;
}

function noEditResult(result: AgentResult): AgentResult {
  return { ...result, data: { editNeeded: false, appendText: "", changes: [] } };
}

export const pokedexAgentRuntime = {
  async prepareContext({ context }: { agent: AgentConfig; context: AgentContext }) {
    if (context.chatMode !== "roleplay") return null;
    const vault = await readPokedexVault(context.chatId);
    const haremKeys = new Set(vault.harem.map((member) => member.key));
    return {
      knownDex: Object.values(vault.dex)
        .slice(-1025)
        .map((entry) => ({
          key: entry.key,
          species: entry.species,
          name: entry.name,
          gender: entry.gender,
          inHarem: haremKeys.has(entry.key),
        })),
      harem: vault.harem.slice(-100).map((member) => {
        const entry = vault.dex[member.key];
        return {
          key: member.key,
          name: entry?.name ?? member.key,
          dexNumber: entry?.dexNumber,
          relationshipStatus: member.relationshipStatus,
          lastInteraction: member.lastInteraction,
          currentStatus: member.currentStatus,
          affection: entry?.affection,
        };
      }),
      pregnancies: vault.pregnancies.slice(-100).map((pregnancy) => ({
        key: pregnancy.key,
        name: vault.dex[pregnancy.key]?.name ?? pregnancy.key,
        eggsExpected: pregnancy.eggsExpected,
        sire: pregnancy.sire,
        bredAt: pregnancy.bredAt,
      })),
      recentEncounters: vault.recentEncounters.slice(-25).map((encounter) => ({
        key: encounter.key,
        name: vault.dex[encounter.key]?.name ?? encounter.key,
        outcome: encounter.outcome,
        at: encounter.at,
      })),
      settings: vault.settings,
    };
  },

  async finalizeResult({
    context,
    result,
  }: {
    agent: AgentConfig;
    context: AgentContext;
    preparedContext: unknown;
    result: AgentResult;
  }): Promise<AgentResult> {
    if (!result.success || context.chatMode !== "roleplay") return result.success ? noEditResult(result) : result;

    let delta: PokedexDelta;
    try {
      delta = parseDelta(result.data);
    } catch (error) {
      return {
        ...noEditResult(result),
        success: false,
        error: error instanceof Error ? error.message : "Pokédex agent returned an invalid JSON delta.",
      };
    }

    const now = new Date().toISOString();
    const messageId = sourceMessageId(context);
    let appliedScans: DexEntry[] = [];
    const saved = await updatePokedexVault(context.chatId, (current) => {
      const dex = { ...current.dex };
      const nextAppliedScans: DexEntry[] = [];
      if (current.settings.autoScan) {
        for (const scan of delta.newScans) {
          const key = normalizePokedexKey(scan.species);
          if (!key || dex[key]) continue;
          const entry: DexEntry = {
            ...scan,
            key,
            firstMetAt: now,
            sourceMessageId: messageId,
          };
          dex[key] = entry;
          nextAppliedScans.push(entry);
        }
      }

      let harem = current.harem.map((member) => ({ ...member }));
      const updatesByKey = new Map<string, PokedexUpdate>();
      for (const update of delta.updates) {
        const entry = dex[update.key];
        if (!entry) continue;
        updatesByKey.set(update.key, { ...updatesByKey.get(update.key), ...update });
        dex[update.key] = {
          ...entry,
          ...(update.affection ? { affection: update.affection } : {}),
          ...(update.heat ? { heat: update.heat } : {}),
        };
        harem = harem.map((member) =>
          member.key === update.key
            ? {
                ...member,
                ...(update.relationshipStatus ? { relationshipStatus: update.relationshipStatus } : {}),
                ...(update.lastInteraction ? { lastInteraction: update.lastInteraction } : {}),
                ...(update.currentStatus ? { currentStatus: update.currentStatus } : {}),
              }
            : member,
        );
      }

      const haremKeys = new Set(harem.map((member) => member.key));
      for (const key of delta.haremJoins) {
        if (!dex[key] || haremKeys.has(key)) continue;
        const update = updatesByKey.get(key);
        harem.push({
          key,
          relationshipStatus: update?.relationshipStatus ?? "Harem member",
          lastInteraction: update?.lastInteraction ?? "Joined the trainer's harem.",
          currentStatus: update?.currentStatus ?? "Active",
          joinedAt: now,
        });
        haremKeys.add(key);
      }
      const leaveKeys = new Set(delta.haremLeaves);
      harem = harem.filter((member) => !leaveKeys.has(member.key));

      let pregnancies = current.pregnancies.map((pregnancy) => ({ ...pregnancy }));
      const pregnancyMessageSeen = pregnancies.some((pregnancy) => pregnancy.sourceMessageId === messageId);
      if (!pregnancyMessageSeen) {
        for (const event of delta.pregnancyEvents) {
          if (!dex[event.key]) continue;
          if (event.type === "laid") {
            pregnancies = pregnancies.filter((pregnancy) => pregnancy.key !== event.key);
            continue;
          }
          if (pregnancies.some((pregnancy) => pregnancy.key === event.key)) continue;
          pregnancies.push({
            key: event.key,
            eggsExpected: event.eggsExpected ?? 1,
            sire: event.sire ?? "Unknown",
            bredAt: now,
            sourceMessageId: messageId,
          });
        }
      }

      let recentEncounters = [...current.recentEncounters];
      const encounterMessageSeen = recentEncounters.some((encounter) => encounter.sourceMessageId === messageId);
      if (!encounterMessageSeen) {
        recentEncounters.push(
          ...delta.encounters.flatMap((encounter) =>
            dex[encounter.key] ? [{ ...encounter, at: now, sourceMessageId: messageId }] : [],
          ),
        );
      }
      recentEncounters = recentEncounters.slice(-current.settings.maxRecentEncounters);
      appliedScans = nextAppliedScans;
      return {
        ...current,
        dex,
        harem,
        pregnancies,
        recentEncounters,
        latestScan:
          nextAppliedScans.length > 0
            ? { keys: nextAppliedScans.map((entry) => entry.key), at: now }
            : current.latestScan,
      };
    });

    if (appliedScans.length > 0 && saved.settings.renderScanCards) {
      return {
        ...result,
        type: "text_rewrite",
        data: {
          editNeeded: true,
          appendText: `\n${appliedScans.map(renderPokedexScanCard).join("\n")}`,
          changes: appliedScans.map((entry) => ({ description: `Scanned ${entry.name} #${entry.dexNumber}` })),
        },
      };
    }
    return noEditResult(result);
  },
};
