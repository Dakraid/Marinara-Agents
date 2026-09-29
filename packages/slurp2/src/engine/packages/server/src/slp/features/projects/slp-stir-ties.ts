/**
 * The tie levers of Stir (W): collabs, rivalries and couples as actions. Each runs the same pure rule
 * its Studio button ran (`slp-creator-ties-routes.ts`); `preview` runs that rule on a copy and writes
 * nothing, so the card can say who, what, the fit note from the cards, or why it cannot happen.
 *
 * Work can be refused in character (a suggested collab waits for the partner's answer unless the
 * player says "make it happen"); love and drama always happen, and the cards colour how (I, W).
 */
import type { DB } from "../../../db/connection.js";
import { newId } from "../../../utils/id-generator.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import { mutateSlurpCreatorTies, readSlurpCreatorTiesDocument } from "../../data/projects/slp-creator-ties-storage.js";
import {
  slurpCollabOpen,
  slurpCoolRivalry,
  slurpPushCollab,
  slurpRivalryActive,
  slurpStartRivalry,
  type SlurpCreatorTies,
  type SlurpTieError,
} from "../../modules/projects/slp-creator-ties.js";
import {
  slurpCoupleActive,
  slurpSetUpCouple,
  slurpSteerCouple,
  type SlurpCouple,
  type SlurpCoupleError,
} from "../../modules/projects/slp-creator-couples.js";
import {
  slurpPreviewTieLever,
  slurpSuggestCollabPlay,
  type SlurpStirTieWorld,
  type SlurpTieLever,
  type SlurpTiePreview,
} from "../../modules/projects/slp-stir-tie-preview.js";
import { loadSlurpTieCreators } from "./slp-creator-ties-service.js";
import { closeSlurpCouplePage, closeSlurpCouplePages, openSlurpCouplePage } from "./slp-creator-couples-service.js";
import type { SlpActionParsed, SlpStirWorld } from "../../../../../shared/src/slp/slp-actions.js";

export { isSlurpTieLever } from "../../modules/projects/slp-stir-tie-preview.js";

/** What one Undo does for a tie play: remove what it added, or put one couple back as it was. */
export type SlurpTieUndo =
  | { kind: "removeCollab"; id: string }
  | { kind: "removeRivalry"; id: string }
  | { kind: "removeCouple"; id: string }
  | { kind: "restoreCouple"; couple: SlurpCouple };

type Failure = { ok: false; status: 400 | 404 | 409; error: string };
type Done = { ok: true; value: Record<string, unknown>; undo: SlurpTieUndo | null };

/** The world's words for why a tie play cannot happen (the same as the Studio routes). */
const WHY: Record<SlurpTieError | SlurpCoupleError | "notFound", [400 | 404 | 409, string]> = {
  notFound: [404, "That one is gone."],
  notOpen: [409, "That does not fit where they are right now."],
  sameCreator: [400, "Pick two different Creators."],
  same: [400, "Pick two different Creators."],
  noHost: [400, "Pick at least one Creator Slurp posts for."],
  busy: [409, "They are already in the middle of something like that."],
  taken: [409, "One of them is already with someone."],
  notInto: [409, "Neither romance nor dating is something they are looking for."],
  noDating: [409, "One of them does not date, and would not start for this."],
  orientation: [409, "They are not each other's type."],
  pageOpen: [409, "Their shared page is already open."],
};
const fail = (code: keyof typeof WHY): Failure => ({ ok: false, status: WHY[code][0], error: WHY[code][1] });

type World = SlurpStirTieWorld;

async function readWorld(db: DB): Promise<World> {
  const [creators, accounts, document] = await Promise.all([
    loadSlurpTieCreators(db),
    createSlurpStorage(db).listNoodlerAccounts(),
    readSlurpCreatorTiesDocument(db),
  ]);
  return {
    creators,
    avatars: new Map(
      accounts.map((account: { id: string; avatarUrl?: string | null }) => [account.id, account.avatarUrl ?? null]),
    ),
    ties: document.ties,
    couples: document.couples,
  };
}

/** What a tie play would do, on the world as it is now. Reads only. */
export async function previewSlurpTieLever(
  db: DB,
  name: SlurpTieLever,
  input: unknown,
  at = new Date(),
): Promise<SlurpTiePreview> {
  return slurpPreviewTieLever(await readWorld(db), name, input, at);
}

/** One tie play, for real. Answers what the Undo needs to take it back. */
export async function runSlurpTieLever(
  db: DB,
  name: SlurpTieLever,
  input: unknown,
  at = new Date(),
): Promise<Done | Failure> {
  const creators = await loadSlurpTieCreators(db, at);
  const find = (id: string) => creators.find((entry) => entry.id === id);
  const onTies = async (
    change: (ties: SlurpCreatorTies) => SlurpCreatorTies | SlurpTieError,
  ): Promise<SlurpCreatorTies | SlurpTieError | null> =>
    mutateSlurpCreatorTies<SlurpCreatorTies | SlurpTieError>(db, (document) => {
      const next = change(document.ties);
      return typeof next === "string"
        ? { document, result: next }
        : { document: { ...document, ties: next }, result: next };
    });
  const onCouples = async (
    change: (couples: SlurpCouple[]) => SlurpCouple[] | SlurpCoupleError,
  ): Promise<SlurpCouple[] | SlurpCoupleError | null> =>
    mutateSlurpCreatorTies<SlurpCouple[] | SlurpCoupleError>(db, (document) => {
      const next = change(document.couples);
      return typeof next === "string"
        ? { document, result: next }
        : { document: { ...document, couples: next }, result: next };
    });

  switch (name) {
    case "suggest-collab": {
      const { aId, bId, happen } = input as SlpActionParsed<"suggest-collab">;
      const a = find(aId);
      const b = find(bId);
      if (!a || !b) return fail("notFound");
      const id = newId();
      const next = await onTies((ties) => slurpSuggestCollabPlay(ties, a, b, { at, id, happen }));
      if (!next || typeof next === "string") return fail(next ?? "notFound");
      return { ok: true, value: { collabId: id }, undo: { kind: "removeCollab", id } };
    }
    case "push-collab": {
      const { collabId } = input as SlpActionParsed<"push-collab">;
      const next = await onTies((ties) => slurpPushCollab(ties, collabId, at));
      if (!next || typeof next === "string") return fail(next ?? "notFound");
      return { ok: true, value: { collabId }, undo: null };
    }
    case "start-rivalry": {
      const { fromId, toId, cause } = input as SlpActionParsed<"start-rivalry">;
      const from = find(fromId);
      const to = find(toId);
      if (!from || !to) return fail("notFound");
      const id = newId();
      const next = await onTies((ties) => slurpStartRivalry(ties, from, to, { at, id, cause }));
      if (!next || typeof next === "string") return fail(next ?? "notFound");
      return { ok: true, value: { rivalryId: id }, undo: { kind: "removeRivalry", id } };
    }
    case "cool-rivalry": {
      const { rivalryId } = input as SlpActionParsed<"cool-rivalry">;
      const next = await onTies((ties) => slurpCoolRivalry(ties, rivalryId, at));
      if (!next || typeof next === "string") return fail(next ?? "notFound");
      return { ok: true, value: { rivalryId }, undo: null };
    }
    case "set-up-couple": {
      const { aId, bId } = input as SlpActionParsed<"set-up-couple">;
      const a = find(aId);
      const b = find(bId);
      if (!a || !b) return fail("notFound");
      const id = newId();
      const next = await onCouples((couples) => slurpSetUpCouple(couples, a, b, { at, id }));
      if (!next || typeof next === "string") return fail(next ?? "notFound");
      return { ok: true, value: { coupleId: id }, undo: { kind: "removeCouple", id } };
    }
    case "steer-couple": {
      const { coupleId, steer } = input as SlpActionParsed<"steer-couple">;
      const before = (await readSlurpCreatorTiesDocument(db)).couples;
      const previous = before.find((entry) => entry.id === coupleId);
      const next = await onCouples((couples) => slurpSteerCouple(couples, coupleId, steer, { at, creators }));
      if (!next || typeof next === "string") return fail(next ?? "notFound");
      // A breakup closes their shared page too (the Studio route did the same); that is not undone.
      if (steer === "breakUp") await closeSlurpCouplePages(db, before, next);
      const pageWasOpen = Boolean(previous?.page && !previous.page.closedAt);
      return {
        ok: true,
        value: { coupleId },
        undo: previous && !(steer === "breakUp" && pageWasOpen) ? { kind: "restoreCouple", couple: previous } : null,
      };
    }
    case "couple-page": {
      const { coupleId, open } = input as SlpActionParsed<"couple-page">;
      const outcome = open ? await openSlurpCouplePage(db, coupleId) : await closeSlurpCouplePage(db, coupleId);
      if (typeof outcome === "string") return fail(outcome);
      return { ok: true, value: { coupleId, accountId: outcome.page?.accountId ?? null }, undo: null };
    }
  }
}

/** Take one tie play back. Missing entries are fine: the world may have moved on. */
export async function undoSlurpTieLever(db: DB, undo: SlurpTieUndo): Promise<void> {
  await mutateSlurpCreatorTies(db, (document) => {
    const { ties, couples } = document;
    if (undo.kind === "removeCollab")
      return {
        document: { ...document, ties: { ...ties, collabs: ties.collabs.filter((entry) => entry.id !== undo.id) } },
        result: true,
      };
    if (undo.kind === "removeRivalry")
      return {
        document: { ...document, ties: { ...ties, rivalries: ties.rivalries.filter((entry) => entry.id !== undo.id) } },
        result: true,
      };
    if (undo.kind === "removeCouple")
      return { document: { ...document, couples: couples.filter((entry) => entry.id !== undo.id) }, result: true };
    return {
      document: { ...document, couples: couples.map((entry) => (entry.id === undo.couple.id ? undo.couple : entry)) },
      result: true,
    };
  });
}

/** The ids and names the world levers take (`list-world`, the Stir tab). */
export async function readSlurpStirTies(db: DB): Promise<Pick<SlpStirWorld, "couples" | "collabs" | "rivalries">> {
  const { ties, couples } = await readSlurpCreatorTiesDocument(db);
  return {
    couples: couples
      .filter(slurpCoupleActive)
      .map((couple) => ({
        id: couple.id,
        aId: couple.aId,
        bId: couple.bId,
        stage: couple.stage,
        page: couple.page ? (couple.page.closedAt ? ("closed" as const) : ("open" as const)) : null,
      }))
      .concat(
        couples
          .filter((couple) => !slurpCoupleActive(couple))
          .slice(-6)
          .map((couple) => ({ id: couple.id, aId: couple.aId, bId: couple.bId, stage: couple.stage, page: null })),
      ),
    collabs: ties.collabs
      .filter(slurpCollabOpen)
      .map((collab) => ({ id: collab.id, hostId: collab.hostId, partnerId: collab.partnerId, status: collab.status })),
    rivalries: ties.rivalries
      .filter(slurpRivalryActive)
      .map((rivalry) => ({ id: rivalry.id, fromId: rivalry.fromId, toId: rivalry.toId, stage: rivalry.stage })),
  };
}
