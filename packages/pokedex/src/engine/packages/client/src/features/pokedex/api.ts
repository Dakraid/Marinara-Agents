import type { PokedexSettings, PokedexVault } from "./types";

const API_ROOT = "/api/pokedex";
const CSRF_HEADER = "x-marinara-csrf";
const CSRF_HEADER_VALUE = "1";
const ADMIN_SECRET_STORAGE_KEY = "marinara_admin_secret";

/**
 * Mirrors the Engine's own api-client: the saved admin secret is sent on every request, whatever
 * the page protocol. Every Pokédex route sits behind the Engine's privileged gate, so a remote
 * client on plain HTTP (LAN or Termux reached by IP) would otherwise fail with "Invalid or missing
 * X-Admin-Secret header" even though the secret is saved.
 */
function adminHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const secret = window.localStorage.getItem(ADMIN_SECRET_STORAGE_KEY)?.trim();
    return secret ? { "X-Admin-Secret": secret } : {};
  } catch {
    return {};
  }
}

export async function pokedexRequest<TResponse, TBody = unknown>(
  path: string,
  method = "GET",
  body?: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  const headers = new Headers(adminHeaders());
  if (method !== "GET") headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers,
    signal,
    cache: "no-store",
    credentials: "same-origin",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: unknown; message?: unknown } | null;
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : typeof payload?.message === "string"
          ? payload.message
          : response.statusText;
    throw new Error(message || "Pokédex request failed");
  }
  return response.json() as Promise<TResponse>;
}

function chatPath(chatId: string, suffix: string): string {
  return `/chats/${encodeURIComponent(chatId)}${suffix}`;
}

/** GET /chats/:chatId/state → full vault. */
export function fetchPokedexState(chatId: string, signal?: AbortSignal): Promise<PokedexVault> {
  return pokedexRequest<PokedexVault>(chatPath(chatId, "/state"), "GET", undefined, signal);
}

/** PATCH /chats/:chatId/settings → updated vault (memory-nag mutation convention). */
export function patchPokedexSettings(chatId: string, settings: PokedexSettings): Promise<PokedexVault> {
  return pokedexRequest<PokedexVault>(chatPath(chatId, "/settings"), "PATCH", settings);
}

/** DELETE /chats/:chatId/dex/:key → updated vault. Also cascades harem/pregnancy/encounter rows. */
export function deletePokedexEntry(chatId: string, key: string): Promise<PokedexVault> {
  return pokedexRequest<PokedexVault>(chatPath(chatId, `/dex/${encodeURIComponent(key)}`), "DELETE");
}

/** POST /chats/:chatId/harem/:key/remove → updated vault. */
export function removePokedexHaremMember(chatId: string, key: string): Promise<PokedexVault> {
  return pokedexRequest<PokedexVault>(chatPath(chatId, `/harem/${encodeURIComponent(key)}/remove`), "POST");
}

/** POST /chats/:chatId/pregnancies/:key/resolve → updated vault. */
export function resolvePokedexPregnancy(chatId: string, key: string): Promise<PokedexVault> {
  return pokedexRequest<PokedexVault>(chatPath(chatId, `/pregnancies/${encodeURIComponent(key)}/resolve`), "POST");
}
