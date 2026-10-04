/**
 * LLM transport for Card Editor bulk runs (ARCH §4 retry policy, SPEC F3.5). Pure-testable
 * classification/detection core plus a thin executor over the capability language-model host.
 *
 * Error classes:
 * - "overflow" — the provider says the prompt exceeded its context window (message/code patterns,
 *   including HTTP 400 bodies that carry them). The runner recovers by splitting the batch;
 *   retrying the same payload is pointless, so overflow is never retried here.
 * - "fatal" — auth/config failures (401/403) and other non-overflow 4xx: retrying cannot help.
 * - "retryable-provider" — everything else: network errors, timeouts, 429, 5xx.
 *
 * Refusal and invalid-JSON handling is policy, so the reminder TEXTS live here but the runner
 * drives those loops: a refusal retry appends REFUSAL_REMINDER to the user message; an invalid
 * JSON response gets exactly one STRICT_JSON_REMINDER retry before the item counts as failed-parse.
 */
import { setTimeout as delay } from "node:timers/promises";

export type ProviderErrorClass = "retryable-provider" | "overflow" | "fatal";

export interface LlmAttemptLogEntry {
  /** 1-based attempt that just failed. */
  attempt: number;
  classification: ProviderErrorClass;
  message: string;
  /** Delay before the next attempt; null when this failure is final (thrown). */
  retryDelayMs: number | null;
}

export interface LlmCallMessages {
  system: string;
  user: string;
}

export interface LlmCallResult {
  output: string;
  model: string;
  connectionName: string;
  /** Total provider attempts made (initial call + provider retries). */
  attempts: number;
}

/** Structural subset of the capability language-model host the executor needs. Declared locally
 *  so the module stays importable under plain-Node type stripping without engine type resolution. */
export interface LlmResolverHost {
  resolve(connectionId?: string | null): Promise<{
    name: string;
    model: string;
    chatComplete(
      messages: readonly { role: "system" | "user"; content: string }[],
      options?: { signal?: AbortSignal },
    ): Promise<{ content: string | null }>;
  }>;
}

export class LlmCallError extends Error {
  readonly classification: ProviderErrorClass;
  readonly attempts: number;
  constructor(message: string, classification: ProviderErrorClass, attempts: number, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "LlmCallError";
    this.classification = classification;
    this.attempts = attempts;
  }
}

// Context-overflow fingerprints across providers (ARCH §4): OpenAI-style codes
// ("context_length_exceeded"), Anthropic/llama.cpp phrasings, and generic "too many tokens".
const OVERFLOW_PATTERNS = [/context[\s_-]*length/iu, /maximum\s+context/iu, /too\s+many\s+tokens/iu];

function errorText(error: unknown): { message: string; code: string } {
  const record = error !== null && typeof error === "object" ? (error as Record<string, unknown>) : null;
  const message = error instanceof Error ? error.message : String(error ?? "");
  return { message, code: typeof record?.code === "string" ? record.code : "" };
}

function httpStatus(error: unknown): number | undefined {
  const record = error !== null && typeof error === "object" ? (error as Record<string, unknown>) : null;
  for (const key of ["status", "statusCode"] as const) {
    const value = record?.[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

export function classifyProviderError(error: unknown): ProviderErrorClass {
  const { message, code } = errorText(error);
  const text = `${message} ${code}`;
  // Overflow wins over status: a 400 carrying a context-length message must split, not fail.
  if (OVERFLOW_PATTERNS.some((pattern) => pattern.test(text))) return "overflow";
  const status = httpStatus(error);
  if (status === 401 || status === 403) return "fatal";
  if (status === 429 || (status !== undefined && status >= 500 && status < 600)) return "retryable-provider";
  if (status !== undefined && status >= 400 && status < 500) return "fatal";
  // No status at all: network failure, DNS, timeout, aborted-by-timeout. Transient until proven otherwise.
  return "retryable-provider";
}

// Word-bounded so "has an AI flavor" or "cant" never trip the detector; case-insensitive.
const REFUSAL_MARKERS = [/\bI can't\b/iu, /\bI cannot\b/iu, /\bas an AI\b/iu, /\bI'm sorry\b/iu, /\bI won't\b/iu];
const REFUSAL_SHORT_OUTPUT_CHARS = 400;

/** A refusal is an answer that carries no parseable updates AND is either suspiciously short
 *  (non-committal) or contains a refusal marker. A valid `{"updates":[]}` no-op response parses,
 *  so it is never a refusal. */
export function detectRefusal(raw: string, hasParseableUpdates: boolean): boolean {
  if (hasParseableUpdates) return false;
  if (raw.trim().length < REFUSAL_SHORT_OUTPUT_CHARS) return true;
  return REFUSAL_MARKERS.some((marker) => marker.test(raw));
}

export const REFUSAL_REMINDER =
  "\n\nReminder: respond with the requested JSON edits only. If no change is justified, return the empty updates " +
  "result from the response format; never refuse and never answer with prose.";
export const STRICT_JSON_REMINDER =
  "\n\nReminder: your previous reply was not valid JSON. Respond with ONLY the strict JSON object from the response " +
  "format above — no prose, no markdown fences.";

/** Exponential backoff: 1s·2^n with ±25% jitter, capped at 30s. `rand` is injectable for tests. */
export function backoffDelayMs(retryIndex: number, rand: () => number = Math.random): number {
  const base = Math.min(30_000, 1_000 * 2 ** Math.max(0, Math.trunc(retryIndex)));
  return Math.min(30_000, Math.round(base * (0.75 + rand() * 0.5)));
}

function abortError(): Error {
  return new DOMException("The Card Editor LLM call was aborted.", "AbortError");
}

/** Resolves the connection (undefined = agent default chain) and completes one system+user call,
 *  retrying retryable-provider failures up to `providerRetries` times with backoff. Overflow and
 *  fatal classifications throw immediately as LlmCallError; cancellation propagates the abort. */
export async function callLlm(
  languageModels: LlmResolverHost,
  connectionId: string | null,
  messages: LlmCallMessages,
  options: {
    signal?: AbortSignal;
    providerRetries: number;
    attemptLog?: (entry: LlmAttemptLogEntry) => void;
  },
): Promise<LlmCallResult> {
  const maxRetries = Math.max(0, Math.trunc(options.providerRetries));
  const chatMessages = [
    { role: "system" as const, content: messages.system },
    { role: "user" as const, content: messages.user },
  ];
  let attempts = 0;
  for (;;) {
    if (options.signal?.aborted) throw abortError();
    try {
      attempts += 1;
      const resolved = await languageModels.resolve(connectionId ?? undefined);
      const completion = await resolved.chatComplete(
        chatMessages,
        options.signal ? { signal: options.signal } : undefined,
      );
      return {
        output: completion.content ?? "",
        model: resolved.model,
        connectionName: resolved.name,
        attempts,
      };
    } catch (error) {
      if (options.signal?.aborted) throw error;
      const classification = classifyProviderError(error);
      const { message } = errorText(error);
      const retriesLeft = classification === "retryable-provider" && attempts <= maxRetries;
      const delayMs = retriesLeft ? backoffDelayMs(attempts - 1) : null;
      options.attemptLog?.({ attempt: attempts, classification, message, retryDelayMs: delayMs });
      if (delayMs === null) throw new LlmCallError(message, classification, attempts, { cause: error });
      // node:timers/promises delay rejects with an AbortError when the signal fires mid-wait.
      await delay(delayMs, undefined, { signal: options.signal });
    }
  }
}
