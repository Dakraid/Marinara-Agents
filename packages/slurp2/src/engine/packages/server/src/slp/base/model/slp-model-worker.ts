import type { DB } from "../../../db/connection.js";
import { createAppSettingsStorage } from "../../../services/storage/app-settings.storage.js";
import {
  readSlurpModelBudgetLedger,
  SLURP_UPKEEP_JOB_KINDS,
  spendSlurpModelBudget,
  type SlurpModelBudget,
  type SlurpModelBudgetLedger,
  type SlurpModelJobKind,
} from "../../../../../shared/src/slp/slp-model-budget.js";

export * from "../../../../../shared/src/slp/slp-model-budget.js";

const LEDGER_KEY = "slurp2.model-budget-ledger";
let claimQueue: Promise<unknown> = Promise.resolve();

/** Reserve one call before it starts. Serialized in-process and persisted across restarts. */
export function claimSlurpModelBudget(
  db: DB,
  budget: SlurpModelBudget,
  kind: SlurpModelJobKind,
  at = new Date(),
): Promise<boolean> {
  let allowed = false;
  const run = claimQueue.then(async () => {
    const store = createAppSettingsStorage(db);
    const current = readSlurpModelBudgetLedger(await store.get(LEDGER_KEY), at);
    // Upkeep kinds follow the day's pace; a player's request never does (fix phase 1b, R1-106).
    const next = spendSlurpModelBudget(budget, current, kind, SLURP_UPKEEP_JOB_KINDS.has(kind) ? at : undefined);
    if (!next) return;
    await store.set(LEDGER_KEY, JSON.stringify(next));
    allowed = true;
  });
  claimQueue = run.catch(() => undefined);
  return run.then(() => allowed);
}

/**
 * For world work of a kind a player can also ask for (written audience replies, storylines the world
 * starts): whether the world's share is still inside the day's pace. Checked before the claim.
 */
export async function slurpModelBudgetPaceOpen(
  db: DB,
  budget: SlurpModelBudget,
  kind: SlurpModelJobKind,
  at = new Date(),
): Promise<boolean> {
  return spendSlurpModelBudget(budget, await getSlurpModelBudgetLedger(db, at), kind, at) !== null;
}

export async function getSlurpModelBudgetLedger(db: DB, at = new Date()): Promise<SlurpModelBudgetLedger> {
  return readSlurpModelBudgetLedger(await createAppSettingsStorage(db).get(LEDGER_KEY), at);
}
