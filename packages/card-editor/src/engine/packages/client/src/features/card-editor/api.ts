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
