import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * A provider that turns a request away for load: HTTP 429 or 529, or the words providers use for it.
 *
 * Pure on purpose, so the rule stays testable. The bundled providers throw plain errors whose
 * message carries the status ("… API error 429: …"), so the message is all there is to read.
 */
const SLP_RATE_LIMIT_PATTERN =
  /\berror (?:429|529)\b|rate.?limit|too many (?:concurrent )?requests|resource.?exhausted|overloaded/iu;

export function slpIsRateLimitError(error: unknown): boolean {
  return error instanceof Error && SLP_RATE_LIMIT_PATTERN.test(error.message);
}

/** DNS answers that often clear on their own: a phone between networks, a flaky or absent resolver (Termux). */
const SLP_TRANSIENT_DNS_CODES = ["EAI_AGAIN", "ENOTFOUND"] as const;
type SlpTransientDnsCode = (typeof SLP_TRANSIENT_DNS_CODES)[number];

/**
 * The DNS code behind a failed call, or null. The Engine's outbound-URL guard (`utils/security.ts`)
 * rejects with the `dns.lookup` error itself ("getaddrinfo EAI_AGAIN host"); a failed connect
 * surfaces as `fetch failed` with the code on its cause.
 */
export function slpTransientNetworkCode(error: unknown): SlpTransientDnsCode | null {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth += 1) {
    const candidate = current as { code?: unknown; message?: unknown; cause?: unknown };
    const code = SLP_TRANSIENT_DNS_CODES.find(
      (known) =>
        candidate.code === known ||
        (typeof candidate.message === "string" && candidate.message.includes(`getaddrinfo ${known}`)),
    );
    if (code) return code;
    current = candidate.cause;
  }
  return null;
}

/**
 * Run one model call, and wait out a rate limit or a DNS hiccup before sending it again.
 *
 * The Engine pauses and resumes a rate-limited request for chat, role-play and Noodle
 * (`withRateLimitAwareProvider`), keyed by connection. Slurp's bundled provider snapshot has no
 * such wrapper, so a busy free tier, a proxy or a flaky resolver failed Slurp's calls while every
 * other mode worked.
 *
 * ponytail: fixed backoff, no Retry-After and no per-connection pacing. Upgrade path: once the
 * pinned `sources/engine` snapshot carries `withRateLimitAwareProvider`, pass the connection id to
 * `createLLMProvider` in every Slurp call site and keep only the DNS part here.
 */
export async function slpRetryProviderCall<T>(
  run: () => Promise<T>,
  options: { delaysMs?: readonly number[]; sleep?: (ms: number) => Promise<void> } = {},
): Promise<T> {
  const delaysMs = options.delaysMs ?? [5_000, 15_000, 30_000];
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const delay = delaysMs[attempt];
      if (delay === undefined || !(slpIsRateLimitError(error) || slpTransientNetworkCode(error))) throw error;
      await sleep(delay);
    }
  }
}

/**
 * Look the writing connection's host up once before a batch, with the same retries.
 *
 * Every model call looks the host up again, so a resolver that is down fails each Creator of a bulk
 * add one by one. Checked once, the batch stops with one clear reason instead. Returns null when the
 * host resolves, is an IP address or localhost, or fails for a reason the call itself should report.
 */
export async function slpCheckProviderHost(
  baseUrl: string,
  options: {
    lookup?: (host: string) => Promise<unknown>;
    delaysMs?: readonly number[];
    sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<{ host: string; code: SlpTransientDnsCode } | null> {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return null;
  }
  // Subscription providers use pseudo URLs ("claude-agent-sdk://local"); only a web host is looked up.
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^\[|\]$/gu, "");
  if (!host || isIP(host) || host === "localhost") return null;
  const lookup = options.lookup ?? ((name: string) => dnsLookup(name, { all: true }));
  try {
    await slpRetryProviderCall(() => lookup(host), options);
    return null;
  } catch (error) {
    const code = slpTransientNetworkCode(error);
    return code ? { host, code } : null;
  }
}
