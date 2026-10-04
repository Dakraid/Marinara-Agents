import type {
  BulkSession,
  BulkSessionConfig,
  BulkSessionStats,
} from "../../../../shared/src/features/agents/card-editor/schema.js";

const API_BASE = "/api";
const CARD_EDITOR_BASE = "/card-editor";
const CSRF_HEADER = "x-marinara-csrf";
const CSRF_HEADER_VALUE = "1";
const ADMIN_SECRET_STORAGE_KEY = "marinara_admin_secret";

/** Card fields the dialog/panel ship to the server (mirrors the route's validated field set). */
export interface HostCardFields {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  backstory: string;
  appearance: string;
}

/** Style-override card material for one target (DESIGN §2: the override picks ANY library
 *  character, so the card's fields travel with the dispatch — the server never fetches). */
export interface BehaviorOverrideCardFields {
  name: string;
  description: string;
  personality: string;
  backstory: string;
  appearance: string;
  system_prompt: string;
}

export interface SessionTargetRequest {
  characterId: string;
  characterName?: string;
  note?: string;
  behaviorOverride?: string | null;
  behaviorOverrideCard?: BehaviorOverrideCardFields;
  card: Partial<HostCardFields>;
}

export interface CreateSessionRequest {
  targets: SessionTargetRequest[];
  config: BulkSessionConfig;
  label?: string;
  lorebooks?: SessionLorebookMaterial[];
  behaviorCharacter?: BehaviorOverrideCardFields | null;
}

export interface SessionLorebookMaterial {
  name: string;
  entries?: { name?: string; content?: string; enabled?: boolean }[];
}

export interface EditRetryRequest {
  system: string;
  user: string;
}

export interface ItemVerdictRequest {
  verdict: "approve" | "reject";
  force?: boolean;
  includeFields?: string[];
  currentFields?: Record<string, string>;
}

/** The apply ops the verdict route plans and the client executes over engine REST (ARCH §4). */
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
  | { op: "duplicateThenPatch"; characterId: string; fields: Record<string, string>; nameSuffix: string };

export interface VerdictApplyPlan {
  status: "apply";
  ops: ApplyOperation[];
}

export interface VerdictNeedsConfirmation {
  status: "needs-confirmation";
  holds: ApplyOperation[];
}

/** Reject answers the updated session; approve answers a two-phase plan (routes.ts Decision 2). */
export type VerdictResponse = BulkSession | VerdictApplyPlan | VerdictNeedsConfirmation;

export function isVerdictPlan(response: VerdictResponse): response is VerdictApplyPlan | VerdictNeedsConfirmation {
  const status = (response as { status?: unknown }).status;
  return status === "apply" || status === "needs-confirmation";
}

export interface ApplyOpResult {
  index: number;
  ok: boolean;
  error?: string;
  resultCardId?: string;
}

/** GET /sessions projects an index row (never the full session document). */
export interface SessionIndexEntry {
  id: string;
  label: string;
  status: BulkSession["status"];
  stats: BulkSessionStats;
  createdAt: string;
}

export class CardEditorApiError extends Error {
  status: number;
  payload?: unknown;

  // Explicit assignments (no parameter properties): the panel regression imports the API module
  // under plain Node type-stripping, which only supports erasable TypeScript syntax.
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "CardEditorApiError";
    this.status = status;
    this.payload = payload;
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

export function listSessions(signal?: AbortSignal): Promise<SessionIndexEntry[]> {
  return request<SessionIndexEntry[]>("/sessions", "GET", undefined, signal);
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

/** Queued items only (409 otherwise); running items cancel with the session-level cancel. */
export function cancelSessionItem(sessionId: string, itemId: string): Promise<BulkSession> {
  return request<BulkSession>(itemPath(sessionId, itemId, "/cancel"), "POST");
}

export function editRetrySessionItem(sessionId: string, itemId: string, body: EditRetryRequest): Promise<BulkSession> {
  return request<BulkSession>(itemPath(sessionId, itemId, "/edit-retry"), "POST", body);
}

export function submitSessionItemVerdict(
  sessionId: string,
  itemId: string,
  body: ItemVerdictRequest,
): Promise<VerdictResponse> {
  return request<VerdictResponse>(itemPath(sessionId, itemId, "/verdict"), "POST", body);
}

export function submitSessionItemApplyResult(
  sessionId: string,
  itemId: string,
  results: ApplyOpResult[],
): Promise<BulkSession> {
  return request<BulkSession>(itemPath(sessionId, itemId, "/apply-result"), "POST", { results });
}

/** Active sessions refuse deletion without force (409); force cancels the run first. */
export function deleteSession(sessionId: string, options: { force?: boolean } = {}): Promise<void> {
  const suffix = options.force ? "?force=true" : "";
  return request<void>(sessionPath(sessionId, suffix), "DELETE");
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

const HOST_CARD_FIELDS = [
  "description",
  "personality",
  "scenario",
  "first_mes",
  "mes_example",
  "creator_notes",
  "system_prompt",
  "post_history_instructions",
] as const;

function hostRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function hostString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseHostCharacterRow(row: HostCharacterRow, fallbackId: string): HostCharacterCard {
  const data = (() => {
    try {
      return hostRecord(JSON.parse(typeof row?.data === "string" ? row.data : "{}"));
    } catch {
      return {};
    }
  })();
  // backstory/appearance live under data.extensions (engine character-card-fields helper).
  const extensions = hostRecord(data.extensions);
  const fields: HostCardFields = {
    name: hostString(data.name),
    backstory: hostString(extensions.backstory),
    appearance: hostString(extensions.appearance),
    ...(Object.fromEntries(HOST_CARD_FIELDS.map((field) => [field, hostString(data[field])])) as Record<
      (typeof HOST_CARD_FIELDS)[number],
      string
    >),
  };
  const id = typeof row?.id === "string" && row.id ? row.id : fallbackId;
  return {
    id,
    name: fields.name.trim() || id,
    avatarPath: typeof row?.avatarPath === "string" && row.avatarPath ? row.avatarPath : null,
    fields,
  };
}

export interface HostCharacterCard {
  id: string;
  name: string;
  avatarPath: string | null;
  fields: HostCardFields;
}

/** The full editable card (the verdict flow's currentFields + the dispatch card material). */
export async function getHostCharacterCard(characterId: string, signal?: AbortSignal): Promise<HostCharacterCard> {
  const row = await hostRequest<HostCharacterRow>(`/characters/${encodeURIComponent(characterId)}`, signal);
  return parseHostCharacterRow(row, characterId);
}

/** Behavior-character material travels with the dispatch (the server never fetches engine data). */
export function behaviorCardMaterial(card: HostCharacterCard): BehaviorOverrideCardFields {
  const { fields } = card;
  return {
    name: fields.name,
    description: fields.description,
    personality: fields.personality,
    backstory: fields.backstory,
    appearance: fields.appearance,
    system_prompt: fields.system_prompt,
  };
}

export interface HostLorebookEntry {
  name: string;
  content: string;
  enabled: boolean;
}

/** Enabled flags arrive as "true"/"false" strings; map them to booleans for the session route. */
export async function getHostLorebookEntries(lorebookId: string, signal?: AbortSignal): Promise<HostLorebookEntry[]> {
  const entries = await hostRequest<unknown[]>(`/lorebooks/${encodeURIComponent(lorebookId)}/entries`, signal);
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => {
    const source = hostRecord(entry);
    return {
      name: hostString(source.name),
      content: hostString(source.content),
      enabled: source.enabled !== false && source.enabled !== "false",
    };
  });
}

async function hostWriteRequest<TResponse>(path: string, method: "PATCH" | "POST", body?: unknown): Promise<TResponse> {
  const headers = new Headers(adminHeaders());
  headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    cache: "no-store",
    credentials: "same-origin",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as unknown;
    throw new CardEditorApiError(response.status, errorMessage(payload, response.statusText), payload);
  }
  return response.json() as Promise<TResponse>;
}

/** Whole-field replacement write with the agent revision stamp (ARCH §4: automatic snapshot). */
export function patchHostCharacter(
  characterId: string,
  data: Record<string, unknown>,
  meta: { versionSource: "agent"; versionReason: string },
): Promise<HostCharacterRow> {
  return hostWriteRequest<HostCharacterRow>(`/characters/${encodeURIComponent(characterId)}`, "PATCH", {
    data,
    versionSource: meta.versionSource,
    versionReason: meta.versionReason,
  });
}

/** Engine copy of the CURRENT card (name + " (Copy)"); the caller renames and patches the copy. */
export function duplicateHostCharacter(characterId: string): Promise<HostCharacterRow> {
  return hostWriteRequest<HostCharacterRow>(`/characters/${encodeURIComponent(characterId)}/duplicate`, "POST");
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
