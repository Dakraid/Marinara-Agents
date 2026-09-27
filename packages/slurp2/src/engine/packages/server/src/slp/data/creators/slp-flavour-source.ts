/**
 * Everything the flavour brief is compiled from, read for one request: the linked card as it is
 * now, the cached canon anchors, the Creator's own recent public lines, and the player's steering.
 *
 * Read-only. Nothing is written back to the card or stored as a flavour sheet: the brief is
 * compiled fresh each time, so a card edit shows up in the next post.
 */
import type { DB } from "../../../db/connection.js";
import { createAppSettingsStorage } from "../../../services/storage/app-settings.storage.js";
import { createCharactersStorage } from "../../../services/storage/characters.storage.js";
import { logger } from "../../../lib/logger.js";
import type { SlpAccount, SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";
import type { SlpCreatorSteering } from "../../../../../shared/src/slp/slp-creator-steering.js";
import { parseRecord } from "../../modules/creators/slp-public-support.js";
import {
  compileSlurpFlavourBrief,
  type SlurpFlavourCard,
  type SlurpFlavourUse,
} from "../../modules/creators/slp-creator-flavour.js";
import type { SlurpCanonAnchors } from "../../modules/feed/slp-post-beat.js";
import { readSlurpCreatorSteering } from "./slp-steering-storage.js";
import { createSlurpStorage } from "../slp-storage.js";

/** The beats planner's anchor cache, one entry per Creator. Written by `slp-post-beat-service.ts`. */
export const SLURP_CANON_ANCHORS_KEY = "slurp2.canon-anchors";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** The card fields the brief reads. A concealed Creator keeps the voice, not the googleable backstory. */
async function readFlavourCard(
  db: DB,
  source: Pick<SlpAccount, "kind" | "entityId"> | null,
  disclosureMode: SlpIdentityDisclosure,
): Promise<{ name: string; card: SlurpFlavourCard } | null> {
  if (!source) return null;
  const characters = createCharactersStorage(db);
  const open = disclosureMode === "open";
  if (source.kind === "character") {
    const row = await characters.getById(source.entityId);
    if (!row) return null;
    const data = parseRecord(row.data);
    const extensions = parseRecord(data.extensions);
    return {
      name: text(data.name),
      card: {
        description: text(data.description),
        personality: text(data.personality),
        backstory: open ? text(data.backstory) || text(extensions.backstory) : "",
        mes_example: text(data.mes_example),
        first_mes: text(data.first_mes),
        alternate_greetings: Array.isArray(data.alternate_greetings) ? data.alternate_greetings.map(text) : [],
      },
    };
  }
  if (source.kind === "persona") {
    const row = await characters.getPersona(source.entityId);
    if (!row) return null;
    return {
      name: text(row.name),
      card: {
        description: text(row.description),
        personality: text(row.personality),
        backstory: open ? text(row.backstory) : "",
      },
    };
  }
  return null;
}

async function readAnchors(db: DB, accountId: string): Promise<SlurpCanonAnchors | null> {
  try {
    const raw = await createAppSettingsStorage(db).get(SLURP_CANON_ANCHORS_KEY);
    const cache = parseRecord(typeof raw === "string" ? JSON.parse(raw) : raw);
    const entry = parseRecord(cache[accountId]);
    return (entry.anchors as SlurpCanonAnchors | undefined) ?? null;
  } catch {
    return null;
  }
}

/**
 * The brief for one request, unprotected (the caller applies identity protection like it does to
 * every other card value). Empty when nothing could be read: a missing brief never costs a post.
 */
export async function resolveSlurpCreatorFlavour(
  db: DB,
  input: {
    account: Pick<SlpAccount, "id" | "displayName">;
    source: Pick<SlpAccount, "kind" | "entityId"> | null;
    disclosureMode: SlpIdentityDisclosure;
    use: SlurpFlavourUse;
    sequence: number;
    /** Already loaded by the caller; read here when absent. */
    steering?: SlpCreatorSteering | null;
    /** Their own lines, newest first; their recent public captions when absent. */
    ownLines?: readonly string[];
  },
): Promise<string> {
  try {
    const card = await readFlavourCard(db, input.source, input.disclosureMode);
    const ownLines =
      input.ownLines ??
      (await createSlurpStorage(db).listNoodlerPostsByAccount(input.account.id, 8))
        .filter((post) => post.access !== "locked")
        .map((post) => post.content);
    return compileSlurpFlavourBrief(
      {
        accountId: input.account.id,
        name: card?.name || input.account.displayName,
        card: card?.card ?? {},
        anchors: await readAnchors(db, input.account.id),
        ownLines,
        steering: input.steering ?? (await readSlurpCreatorSteering(db, input.account.id)),
      },
      { use: input.use, sequence: input.sequence },
    ).text;
  } catch (error) {
    logger.warn(error, "[slurp] Could not compile the flavour brief; the prompt goes without it");
    return "";
  }
}

/**
 * What "does this fit them" is judged on, outside a post (an automatic storyline): the card as it
 * is now, the anchors, and the Creator's tags. Empty when nothing could be read, which fits only
 * the storylines that need nothing.
 */
export async function readSlurpCreatorFitText(
  db: DB,
  input: {
    account: Pick<SlpAccount, "id"> & { settings: { profile: { tags?: string[] } } };
    source: Pick<SlpAccount, "kind" | "entityId"> | null;
  },
): Promise<string> {
  try {
    const card = await readFlavourCard(db, input.source, "open");
    const anchors = await readAnchors(db, input.account.id);
    return [
      card?.card.description ?? "",
      card?.card.personality ?? "",
      card?.card.backstory ?? "",
      ...(anchors
        ? [
            ...anchors.people.map((person) => `${person.name} ${person.relation}`),
            ...anchors.places,
            ...anchors.work,
            ...anchors.habits,
          ]
        : []),
      ...(input.account.settings.profile.tags ?? []),
    ]
      .filter(Boolean)
      .join("\n");
  } catch (error) {
    logger.warn(error, "[slurp] Could not read the card for a storyline fit check");
    return "";
  }
}
