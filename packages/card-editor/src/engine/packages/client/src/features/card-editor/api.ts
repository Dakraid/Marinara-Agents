import type { BulkSession, BulkSessionConfig } from "../../../../shared/src/features/agents/card-editor/schema.js";

const API_BASE = "/api";
const CARD_EDITOR_BASE = "/card-editor";
const CSRF_HEADER = "x-marinara-csrf";
const CSRF_HEADER_VALUE = "1";
const ADMIN_SECRET_STORAGE_KEY = "marinara_admin_secret";

export interface SessionTargetRequest {
  characterId: string;
  note?: string;
  behaviorOverride?: string | null;
}

export interface CreateSessionRequest {
  targets: SessionTargetRequest[];
  config: BulkSessionConfig;
}

export interface EditRetryRequest {
  system: string;
  user: string;
}

export interface ItemVerdictRequest {
  verdict: "approve" | "reject";
  force?: boolean;
  includeFields?: string[];
}

export class CardEditorApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "CardEditorApiError";
  }
}

function adminHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const secret = window.localStorage.getItem(ADMIN_SECRET_STORAGE_KEY)?.trim();
    return secret ? { "X-Admin-Secret": secret } : {};
  } catch {
    return {};
  }
}

function errorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return fallback;
  const envelope = payload as Record<string, unknown>;
  if (typeof envelope.error === "string" && envelope.error.trim()) return envelope.error.trim();
  if (envelope.error && typeof envelope.error === "object" && !Array.isArray(envelope.error)) {
    const message = (envelope.error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  if (typeof envelope.message === "string" && envelope.message.trim()) return envelope.message.trim();
  return fallback;
}

async function request<TResponse>(
  path: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<TResponse> {
  const headers = new Headers(adminHeaders());
  if (method !== "GET") headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}${CARD_EDITOR_BASE}${path}`, {
    method,
    headers,
    signal,
    cache: "no-store",
    credentials: "same-origin",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as unknown;
    throw new CardEditorApiError(response.status, errorMessage(payload, response.statusText), payload);
  }
  if (response.status === 204) return undefined as TResponse;
  return response.json() as Promise<TResponse>;
}

function sessionPath(sessionId: string, suffix = ""): string {
  return `/sessions/${encodeURIComponent(sessionId)}${suffix}`;
}

function itemPath(sessionId: string, itemId: string, suffix: string): string {
  return sessionPath(sessionId, `/items/${encodeURIComponent(itemId)}${suffix}`);
}

export function createSession(body: CreateSessionRequest): Promise<BulkSession> {
  return request<BulkSession>("/sessions", "POST", body);
}

export function listSessions(signal?: AbortSignal): Promise<BulkSession[]> {
  return request<BulkSession[]>("/sessions", "GET", undefined, signal);
}

export function getSession(sessionId: string, signal?: AbortSignal): Promise<BulkSession> {
  return request<BulkSession>(sessionPath(sessionId), "GET", undefined, signal);
}

export function cancelSession(sessionId: string): Promise<BulkSession> {
  return request<BulkSession>(sessionPath(sessionId, "/cancel"), "POST");
}

export function retrySessionItem(sessionId: string, itemId: string): Promise<BulkSession> {
  return request<BulkSession>(itemPath(sessionId, itemId, "/retry"), "POST");
}

export function editRetrySessionItem(sessionId: string, itemId: string, body: EditRetryRequest): Promise<BulkSession> {
  return request<BulkSession>(itemPath(sessionId, itemId, "/edit-retry"), "POST", body);
}

export function submitSessionItemVerdict(
  sessionId: string,
  itemId: string,
  body: ItemVerdictRequest,
): Promise<BulkSession> {
  return request<BulkSession>(itemPath(sessionId, itemId, "/verdict"), "POST", body);
}

export function deleteSession(sessionId: string): Promise<void> {
  return request<void>(sessionPath(sessionId), "DELETE");
}

/* ── Engine host routes (read-only; not package-scoped) ── */

export interface LanguageConnection {
  id: string;
  name: string;
  provider: string;
  model: string;
}

export interface CharacterCatalogEntry {
  id: string;
  name: string;
  avatarPath: string | null;
}

export interface CharacterCatalogPage {
  items: CharacterCatalogEntry[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** Raw characters table row: card fields live inside the JSON `data` payload. */
export interface HostCharacterRow {
  id: string;
  avatarPath: string | null;
  data: string;
}

export interface HostCharacterSummary {
  id: string;
  name: string;
  avatarPath: string | null;
}

export interface HostLorebook {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

async function hostRequest<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: new Headers(adminHeaders()),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as unknown;
    throw new CardEditorApiError(response.status, errorMessage(payload, response.statusText), payload);
  }
  return response.json() as Promise<TResponse>;
}

export function parseHostCharacterName(row: HostCharacterRow): string {
  try {
    const parsed: unknown = JSON.parse(row.data);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const name = (parsed as Record<string, unknown>).name;
      if (typeof name === "string" && name.trim()) return name;
    }
  } catch {
    // fall through to the caller's id fallback
  }
  return "";
}

/** Language-model connections only (image/video providers can never run an agent). */
export async function listLanguageConnections(signal?: AbortSignal): Promise<LanguageConnection[]> {
  const connections = await hostRequest<LanguageConnection[]>("/connections", signal);
  if (!Array.isArray(connections)) return [];
  return connections.filter(
    (connection) =>
      connection &&
      typeof connection.id === "string" &&
      typeof connection.name === "string" &&
      connection.provider !== "image_generation" &&
      connection.provider !== "video_generation",
  );
}

export async function getHostCharacter(characterId: string, signal?: AbortSignal): Promise<HostCharacterSummary> {
  const row = await hostRequest<HostCharacterRow>(`/characters/${encodeURIComponent(characterId)}`, signal);
  const id = typeof row?.id === "string" && row.id ? row.id : characterId;
  return {
    id,
    name: parseHostCharacterName(row) || id,
    avatarPath: typeof row?.avatarPath === "string" && row.avatarPath ? row.avatarPath : null,
  };
}

export function searchHostCharacters(
  options: { search?: string; limit?: number; offset?: number },
  signal?: AbortSignal,
): Promise<CharacterCatalogPage> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? 50),
    offset: String(options.offset ?? 0),
    sort: "name-asc",
  });
  const search = options.search?.trim();
  if (search) params.set("search", search);
  return hostRequest<CharacterCatalogPage>(`/characters/catalog?${params.toString()}`, signal);
}

export async function listHostLorebooks(signal?: AbortSignal): Promise<HostLorebook[]> {
  const lorebooks = await hostRequest<HostLorebook[]>("/lorebooks", signal);
  if (!Array.isArray(lorebooks)) return [];
  return lorebooks.filter(
    (lorebook): lorebook is HostLorebook =>
      Boolean(lorebook) && typeof lorebook.id === "string" && typeof lorebook.name === "string",
  );
}
