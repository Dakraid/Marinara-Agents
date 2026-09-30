/**
 * Drama's two app settings (`docs/DRAMA.md`): the imported library of situations and dramas, and the
 * running state (what runs, who plays whom, what is queued). Each change goes through one queue.
 */
import type { DB } from "../../../db/connection.js";
import { createAppSettingsStorage } from "../../../services/storage/app-settings.storage.js";
import {
  readSlpDramaLibrary,
  SLP_DRAMA_LIBRARY_KEY,
  type SlpDramaLibrary,
} from "../../modules/world/events/slp-drama-library.js";

const parse = (raw: string | null | undefined): unknown => {
  try {
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
};

export async function readSlurpDramaLibrary(db: DB): Promise<SlpDramaLibrary> {
  return readSlpDramaLibrary(parse(await createAppSettingsStorage(db).get(SLP_DRAMA_LIBRARY_KEY)));
}

export async function writeSlurpDramaLibrary(db: DB, library: SlpDramaLibrary): Promise<void> {
  await createAppSettingsStorage(db).set(SLP_DRAMA_LIBRARY_KEY, JSON.stringify(library));
}
