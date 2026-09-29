/**
 * The plays ledger (Stir, W): what the player made happen, newest first, with what one Undo needs.
 * One app setting, capped: it is a short memory for "In play", the Undo toast and Pulse, not history.
 */
import type { DB } from "../../../db/connection.js";
import { createAppSettingsStorage } from "../../../services/storage/app-settings.storage.js";
import type { SlpStirPlay } from "../../../../../shared/src/slp/slp-stir.js";

export const SLURP_STIR_PLAYS_KEY = "slurp2.stir-plays";
const KEEP = 40;

/** A stored play: the public record plus the Undo data, which never leaves the server. */
export type SlurpStoredStirPlay = SlpStirPlay & { undo: unknown[] };

// ponytail: an in-process queue, like the ties document; plays are one tap at a time.
let queue: Promise<unknown> = Promise.resolve();

export async function readSlurpStirPlays(db: DB): Promise<SlurpStoredStirPlay[]> {
  const raw = await createAppSettingsStorage(db).get(SLURP_STIR_PLAYS_KEY);
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry): entry is SlurpStoredStirPlay =>
            Boolean(entry) && typeof entry === "object" && typeof (entry as { id?: unknown }).id === "string",
        )
      : [];
  } catch {
    return [];
  }
}

/** Read, change, write, one at a time. */
export function mutateSlurpStirPlays<T>(
  db: DB,
  change: (plays: SlurpStoredStirPlay[]) => { plays: SlurpStoredStirPlay[]; result: T },
): Promise<T> {
  const run = queue.then(async () => {
    const next = change(await readSlurpStirPlays(db));
    await createAppSettingsStorage(db).set(SLURP_STIR_PLAYS_KEY, JSON.stringify(next.plays.slice(0, KEEP)));
    return next.result;
  });
  queue = run.catch(() => undefined);
  return run;
}
