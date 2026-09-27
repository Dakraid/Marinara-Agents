import { z } from "zod";

export const SLURP_MODEL_JOB_KINDS = [
  "dm_reply",
  "rewrite",
  "thread",
  "brief",
  "bank_grow",
  "arc",
  "schedule",
  "fan_type_voice",
  "continuity",
] as const;
export type SlurpModelJobKind = (typeof SLURP_MODEL_JOB_KINDS)[number];
export type SlurpModelWorkerContext = "present" | "background";

const jobPolicy = (priority: number, maxPerDay: number) =>
  z
    .object({
      enabled: z.boolean().default(true),
      priority: z.number().int().min(1).max(10).default(priority),
      maxPerDay: z.number().int().min(0).max(500).default(maxPerDay),
    })
    .default({ enabled: true, priority, maxPerDay });

export const slurpModelBudgetSchema = z
  .object({
    mode: z.enum(["off", "present", "background"]).default("present"),
    connectionId: z.string().trim().min(1).nullable().default(null),
    callsPerHour: z.number().int().min(0).max(100).default(4),
    callsPerDay: z.number().int().min(0).max(500).default(20),
    jobs: z
      .object({
        dm_reply: jobPolicy(1, 40),
        rewrite: jobPolicy(2, 12),
        // 8 = the default "Runs per day", so the shipped audience is not capped below itself (R1-104).
        thread: jobPolicy(3, 8),
        brief: jobPolicy(4, 6),
        bank_grow: jobPolicy(5, 2),
        arc: jobPolicy(6, 2),
        schedule: jobPolicy(6, 2),
        fan_type_voice: jobPolicy(7, 10),
        // Reads new message batches for Creator statements. Lowest priority: nothing waits on it.
        continuity: jobPolicy(8, 12),
      })
      .default({}),
  })
  .default({});

export type SlurpModelBudget = z.infer<typeof slurpModelBudgetSchema>;

export type SlurpModelBudgetLedger = {
  hour: string;
  day: string;
  callsThisHour: number;
  callsToday: number;
  byKindToday: Partial<Record<SlurpModelJobKind, number>>;
};

const hourKey = (at: Date) => at.toISOString().slice(0, 13);
const dayKey = (at: Date) => at.toISOString().slice(0, 10);

export function readSlurpModelBudgetLedger(raw: string | null | undefined, at = new Date()): SlurpModelBudgetLedger {
  let parsed: Partial<SlurpModelBudgetLedger> = {};
  try {
    parsed = raw ? (JSON.parse(raw) as Partial<SlurpModelBudgetLedger>) : {};
  } catch {
    parsed = {};
  }
  // A hand-edited or corrupt counter must read as zero, never as NaN that passes every limit.
  const count = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const sameDay = parsed.day === dayKey(at);
  const sameHour = sameDay && parsed.hour === hourKey(at);
  return {
    hour: hourKey(at),
    day: dayKey(at),
    callsThisHour: sameHour ? count(parsed.callsThisHour) : 0,
    callsToday: sameDay ? count(parsed.callsToday) : 0,
    byKindToday:
      sameDay && parsed.byKindToday && typeof parsed.byKindToday === "object"
        ? (Object.fromEntries(
            Object.entries(parsed.byKindToday).map(([kind, value]) => [kind, count(value)]),
          ) as SlurpModelBudgetLedger["byKindToday"])
        : {},
  };
}

export function slurpModelWorkerAllows(budget: SlurpModelBudget, context: SlurpModelWorkerContext): boolean {
  return budget.mode !== "off" && (context === "present" || budget.mode === "background");
}

/**
 * A quarter of every cap is held back for replies to the player. Priority only ordered the queue,
 * so background continuity and rewrites could spend the whole day and a player's message waited
 * until midnight UTC for an answer.
 */
export function slurpModelBudgetCap(cap: number, kind: SlurpModelJobKind): number {
  return kind === "dm_reply" ? cap : cap - Math.floor(cap / 4);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Pure world upkeep: always paced over the day (nothing the player pressed waits on these). */
export const SLURP_UPKEEP_JOB_KINDS: ReadonlySet<SlurpModelJobKind> = new Set([
  "rewrite",
  "brief",
  "bank_grow",
  "continuity",
]);

/**
 * How much of a daily cap world upkeep may have used by `at` (user, fix phase 1b): the day's calls are
 * spread evenly over the whole (UTC ledger) day, so the budget is reached by the evening instead of
 * being spent in the first hour and then leaving the world quiet until midnight. One hour of headroom
 * lets the first call of the day through; allowance a quiet morning did not use carries over.
 */
export function slurpModelBudgetPacedCap(cap: number, at: Date): number {
  const dayStart = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate());
  const elapsed = Math.min(1, (at.getTime() - dayStart) / DAY_MS);
  return Math.min(cap, Math.ceil(cap * elapsed + cap / 24));
}

export function spendSlurpModelBudget(
  budget: SlurpModelBudget,
  ledger: SlurpModelBudgetLedger,
  kind: SlurpModelJobKind,
  /** Set for world upkeep (see `SLURP_UPKEEP_JOB_KINDS`, written audience replies, background storylines). */
  pacedAt?: Date,
): SlurpModelBudgetLedger | null {
  const policy = budget.jobs[kind];
  const kindCalls = ledger.byKindToday[kind] ?? 0;
  const dayCap = slurpModelBudgetCap(budget.callsPerDay, kind);
  if (
    !policy.enabled ||
    slurpModelBudgetCap(budget.callsPerHour, kind) <= ledger.callsThisHour ||
    dayCap <= ledger.callsToday ||
    policy.maxPerDay <= kindCalls ||
    (pacedAt &&
      (slurpModelBudgetPacedCap(dayCap, pacedAt) <= ledger.callsToday ||
        slurpModelBudgetPacedCap(policy.maxPerDay, pacedAt) <= kindCalls))
  )
    return null;
  return {
    ...ledger,
    callsThisHour: ledger.callsThisHour + 1,
    callsToday: ledger.callsToday + 1,
    byKindToday: { ...ledger.byKindToday, [kind]: kindCalls + 1 },
  };
}

/** When a temporary cap opens again. `null` means the job is disabled until settings change. */
export function slurpModelBudgetRetryAt(
  budget: SlurpModelBudget,
  ledger: SlurpModelBudgetLedger,
  kind: SlurpModelJobKind,
  at = new Date(),
): string | null {
  const policy = budget.jobs[kind];
  if (!policy.enabled || budget.callsPerHour === 0 || budget.callsPerDay === 0 || policy.maxPerDay === 0) return null;
  if (
    ledger.callsToday >= slurpModelBudgetCap(budget.callsPerDay, kind) ||
    (ledger.byKindToday[kind] ?? 0) >= policy.maxPerDay
  ) {
    return new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1)).toISOString();
  }
  if (ledger.callsThisHour >= slurpModelBudgetCap(budget.callsPerHour, kind)) {
    return new Date(
      Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate(), at.getUTCHours() + 1),
    ).toISOString();
  }
  // Another in-process claim may have won between the read and reservation. Retry soon without
  // treating ordinary budget contention as a provider failure.
  return new Date(at.getTime() + 60_000).toISOString();
}
