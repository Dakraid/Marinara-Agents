import type { DB } from "../../../db/connection.js";
import { addSlurpCreatorNudge, patchSlurpCreatorSteering } from "../../data/creators/slp-steering-storage.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import { generateAndApplyCreatorPost, resolveSlurpAutomaticPostAccess } from "../feed/slp-feed-contract.js";
import { listSlurpBrandCatalog, slurpBrandDealLever } from "../projects/slp-projects-contract.js";
import { drawSlurpBrandPicture } from "../ads/slp-ads-contract.js";
import {
  isSlpActionName,
  slpActionCatalog,
  SLP_ACTIONS,
  type SlpActionName,
  type SlpActionParsed,
} from "../../../../../shared/src/slp/slp-actions.js";
import {
  drawSlpAssistPicture,
  keepSlpAssistPicture,
  runSlpAssistText,
  undoSlpAssistPicture,
  useSlpAssistPicture,
  type SlpAssistOutcome,
} from "./slp-assist-service.js";

const POST_FAILURE: Record<string, string> = {
  busy: "A post for this Creator is already being written.",
  connection_required: "Select a Slurp generation connection first.",
  connection_not_found: "Slurp generation connection not found.",
  disabled: "This Creator does not post on their own.",
  noodler_account_not_found: "Creator not found.",
};

async function creatorExists(db: DB, accountId: string) {
  return Boolean(await createSlurpStorage(db).getNoodlerAccountById(accountId));
}

/** The action layer as an in-process service: the catalog, and one validated run. */
export function slpActionService(db: DB) {
  return { list: slpActionCatalog, run: (name: string, input: unknown) => runSlpAction(db, name, input) };
}

/**
 * The action layer: one named, validated entry point for everything a helper may do for the player.
 * The app's AI assist and any outside caller (the `slurp2:actions` service) come through here, so an
 * action behaves the same whoever asks. Input is untrusted: it is parsed against the shared schema
 * before anything runs.
 */
export async function runSlpAction(db: DB, name: string, raw: unknown): Promise<SlpAssistOutcome<unknown>> {
  if (!isSlpActionName(name)) return { ok: false, status: 404, error: `Slurp has no action called "${name}".` };
  const parsed = SLP_ACTIONS[name].schema.safeParse(raw ?? {});
  if (!parsed.success) return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  return dispatch(db, name, parsed.data);
}

async function dispatch(db: DB, name: SlpActionName, input: unknown): Promise<SlpAssistOutcome<unknown>> {
  switch (name) {
    case "write-text":
      return runSlpAssistText(db, { ...(input as SlpActionParsed<"write-text">), mode: "write" });
    case "improve-text":
      return runSlpAssistText(db, { ...(input as SlpActionParsed<"improve-text">), mode: "improve" });
    case "draw-picture":
      return drawSlpAssistPicture(db, input as SlpActionParsed<"draw-picture">);
    case "use-picture":
      return useSlpAssistPicture(db, input as SlpActionParsed<"use-picture">);
    case "undo-picture":
      return undoSlpAssistPicture(db, input as SlpActionParsed<"undo-picture">);
    case "keep-picture":
      return keepSlpAssistPicture(db, input as SlpActionParsed<"keep-picture">);
    case "steer-creator": {
      const { accountId, ...patch } = input as SlpActionParsed<"steer-creator">;
      if (!(await creatorExists(db, accountId))) return { ok: false, status: 404, error: "Creator not found." };
      return { ok: true, value: { steering: await patchSlurpCreatorSteering(db, accountId, patch) } };
    }
    case "list-creators":
      return {
        ok: true,
        value: {
          creators: (await createSlurpStorage(db).listNoodlerAccounts()).map(
            (account: { id: string; displayName: string; handle: string }) => ({
              id: account.id,
              name: account.displayName,
              handle: account.handle,
            }),
          ),
        },
      };
    case "add-idea": {
      const { accountId, ...idea } = input as SlpActionParsed<"add-idea">;
      if (!(await creatorExists(db, accountId))) return { ok: false, status: 404, error: "Creator not found." };
      const steering = await addSlurpCreatorNudge(db, accountId, idea);
      return steering
        ? { ok: true, value: { steering } }
        : { ok: false, status: 409, error: "That is plenty of ideas for now. Let one go out first." };
    }
    case "list-brands":
      return { ok: true, value: await listSlurpBrandCatalog(db) };
    case "offer-brand-deal": {
      const { preview: dryRun, ...lever } = input as SlpActionParsed<"offer-brand-deal">;
      const outcome = await slurpBrandDealLever(db, lever, !dryRun);
      if (outcome.preview.error === "notFound") return { ok: false, status: 404, error: outcome.preview.summary };
      // A preview answers with why not; a run that cannot happen is a conflict.
      if (!dryRun && !outcome.dealId)
        return { ok: false, status: 409, error: outcome.preview.summary || "The deal could not be offered." };
      return { ok: true, value: outcome };
    }
    case "draw-brand-picture":
      return drawSlurpBrandPicture(db, input as SlpActionParsed<"draw-brand-picture">);
    case "write-post": {
      const { accountId, idea, story } = input as SlpActionParsed<"write-post">;
      if (!(await creatorExists(db, accountId))) return { ok: false, status: 404, error: "Creator not found." };
      // The idea joins the queue first, so the post takes it the way a Run-now takes the oldest idea.
      if (idea && !(await addSlurpCreatorNudge(db, accountId, { text: idea, story })))
        return { ok: false, status: 409, error: "That is plenty of ideas for now. Let one go out first." };
      const result = await generateAndApplyCreatorPost(db, {
        mode: "noodler",
        targetAccountId: accountId,
        access: await resolveSlurpAutomaticPostAccess(createSlurpStorage(db), accountId),
      });
      return result.status === "generated"
        ? { ok: true, value: { post: result.post } }
        : {
            ok: false,
            status: result.status === "noodler_account_not_found" ? 404 : 409,
            error: POST_FAILURE[result.status] ?? "The post could not be written.",
          };
    }
  }
}
