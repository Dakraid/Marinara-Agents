import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import {
  normalizePokedexKey,
  normalizePokedexSettings,
} from "../../../../shared/src/features/agents/pokedex/schema.js";
import { getPokedexRuntime } from "./package-runtime.js";
import { readPokedexVault, updatePokedexVault } from "./vault.js";

function requiredId(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > 160) {
    throw Object.assign(new Error(`${label} is required.`), { statusCode: 400 });
  }
  return value.trim();
}

function requiredKey(value: unknown): string {
  const key = normalizePokedexKey(value);
  if (!key) throw Object.assign(new Error("Pokédex key is required."), { statusCode: 400 });
  return key;
}

function requestBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw Object.assign(new Error("A JSON request body is required."), { statusCode: 400 });
  }
  return value as Record<string, unknown>;
}

function dexEntryNotFound(): Error & { statusCode: number } {
  return Object.assign(new Error("Pokédex entry not found."), { statusCode: 404 });
}

function haremMemberNotFound(): Error & { statusCode: number } {
  return Object.assign(new Error("Harem member not found."), { statusCode: 404 });
}

function pregnancyNotFound(): Error & { statusCode: number } {
  return Object.assign(new Error("Pregnancy not found."), { statusCode: 404 });
}

async function requireRoleplayChat(request: FastifyRequest) {
  const params = request.params as { chatId?: unknown };
  const chatId = requiredId(params.chatId, "Chat ID");
  const chat = await getPokedexRuntime().persistence.getChat(chatId);
  if (!chat || chat.mode !== "roleplay") {
    throw Object.assign(new Error("Pokédex is available only in Roleplay chats."), { statusCode: 400 });
  }
}

const roleplayOnly = { preHandler: requireRoleplayChat };

export const pokedexRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { chatId: string } }>("/chats/:chatId/state", roleplayOnly, async (request) => {
    return readPokedexVault(requiredId(request.params.chatId, "Chat ID"));
  });

  app.patch<{ Params: { chatId: string }; Body: unknown }>("/chats/:chatId/settings", roleplayOnly, async (request) => {
    const chatId = requiredId(request.params.chatId, "Chat ID");
    const body = requestBody(request.body);
    return getPokedexRuntime().persistence.withChatLock(chatId, () =>
      updatePokedexVault(chatId, (current) => ({
        ...current,
        settings: normalizePokedexSettings({ ...current.settings, ...body }),
      })),
    );
  });

  app.delete<{ Params: { chatId: string; key: string } }>("/chats/:chatId/dex/:key", roleplayOnly, async (request) => {
    const chatId = requiredId(request.params.chatId, "Chat ID");
    const key = requiredKey(request.params.key);
    return getPokedexRuntime().persistence.withChatLock(chatId, () =>
      updatePokedexVault(chatId, (current) => {
        if (!current.dex[key]) throw dexEntryNotFound();
        const dex = { ...current.dex };
        delete dex[key];
        const latestKeys = current.latestScan?.keys.filter((latestKey) => latestKey !== key) ?? [];
        return {
          ...current,
          dex,
          harem: current.harem.filter((member) => member.key !== key),
          pregnancies: current.pregnancies.filter((pregnancy) => pregnancy.key !== key),
          recentEncounters: current.recentEncounters.filter((encounter) => encounter.key !== key),
          latestScan: current.latestScan && latestKeys.length > 0 ? { ...current.latestScan, keys: latestKeys } : null,
        };
      }),
    );
  });

  app.post<{ Params: { chatId: string; key: string } }>(
    "/chats/:chatId/harem/:key/remove",
    roleplayOnly,
    async (request) => {
      const chatId = requiredId(request.params.chatId, "Chat ID");
      const key = requiredKey(request.params.key);
      return getPokedexRuntime().persistence.withChatLock(chatId, () =>
        updatePokedexVault(chatId, (current) => {
          if (!current.harem.some((member) => member.key === key)) throw haremMemberNotFound();
          return { ...current, harem: current.harem.filter((member) => member.key !== key) };
        }),
      );
    },
  );

  app.post<{ Params: { chatId: string; key: string } }>(
    "/chats/:chatId/pregnancies/:key/resolve",
    roleplayOnly,
    async (request) => {
      const chatId = requiredId(request.params.chatId, "Chat ID");
      const key = requiredKey(request.params.key);
      return getPokedexRuntime().persistence.withChatLock(chatId, () =>
        updatePokedexVault(chatId, (current) => {
          if (!current.pregnancies.some((pregnancy) => pregnancy.key === key)) throw pregnancyNotFound();
          return {
            ...current,
            pregnancies: current.pregnancies.filter((pregnancy) => pregnancy.key !== key),
          };
        }),
      );
    },
  );
};
