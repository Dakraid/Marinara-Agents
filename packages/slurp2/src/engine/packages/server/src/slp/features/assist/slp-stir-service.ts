/**
 * Stir (W): plans, plays and the Stir tab, over the one action layer.
 *
 * - `planSlpStir`: plain words → one model call (the AI budget's "Plans" row) → steps, each checked
 *   against the action schemas and previewed. Nothing runs.
 * - `playSlpStir`: runs exactly the steps the player saw, in order, and keeps them in the plays ledger
 *   with what one Undo needs. Plays are free (a sandbox); only an action that calls the AI costs a call.
 * - `undoSlpStirPlay`, `readSlpStirView`.
 */
import type { DB } from "../../../db/connection.js";
import { resolveBaseUrl } from "../../../services/generation/connection-base-url.js";
import { createLLMProvider } from "../../../services/llm/provider-registry.js";
import { createConnectionsStorage } from "../../../services/storage/connections.storage.js";
import { newId } from "../../../utils/id-generator.js";
import { resolveSlurpTextConnection } from "../../base/identity/slp-connection.js";
import { claimSlurpModelBudget, slurpModelWorkerAllows } from "../../base/model/slp-model-worker.js";
import { slpWithProviderRetry } from "../../base/model/slp-provider-retry.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import { readSlurpCreatorSteering } from "../../data/creators/slp-steering-storage.js";
import { mutateSlurpStirPlays, readSlurpStirPlays } from "../../data/assist/slp-stir-plays-storage.js";
import { readSlurpCreatorTiesDocument } from "../../data/projects/slp-creator-ties-storage.js";
import { slurpDealOwesPost } from "../../modules/economy/slp-brand-deals.js";
import { buildSlpStirPlanMessages, readSlpStirPlanAnswer } from "../../modules/assist/slp-stir-plan.js";
import { slpStirLive, slpStirSuggestions } from "../../modules/assist/slp-stir-live.js";
import { slpRunStirSteps, slpSortStirSteps } from "../../modules/assist/slp-stir-play.js";
import { slurpRunsItself } from "../projects/slp-projects-contract.js";
import { previewSlpAction } from "./slp-action-preview.js";
import { runSlpActionWithUndo } from "./slp-action-runner.js";
import { readSlpStirWorld, undoSlpAction, type SlpActionUndo } from "./slp-stir-levers.js";
import type { SlpAssistOutcome } from "./slp-assist-service.js";
import type {
  SlpActionPreview,
  SlpStirOrigin,
  SlpStirPlan,
  SlpStirPlay,
  SlpStirStep,
  SlpStirView,
} from "../../../../../shared/src/slp/slp-stir.js";

type Account = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string | null;
  kind: string;
  sourceKind?: string | null;
};

/**
 * Preview a list of steps (a plan, a card, a Support proposal). A step the layer does not know, or
 * with input its schema refuses, comes back in `cant` in plain words, never as a silent drop.
 */
export async function previewSlpStirSteps(
  db: DB,
  steps: readonly SlpStirStep[],
): Promise<{ cards: SlpActionPreview[]; cant: string[] }> {
  const { plays, cant } = slpSortStirSteps(steps);
  const cards: SlpActionPreview[] = [];
  for (const play of plays) {
    const preview = await previewSlpAction(db, play.action, play.input);
    if (preview.ok) cards.push(preview.value);
    else cant.push(preview.error);
  }
  return { cards, cant };
}

/** Plain words → a previewed plan. One model call on the "Plans" row; nothing in the world changes. */
export async function planSlpStir(
  db: DB,
  request: { text: string; creatorId?: string; postId?: string },
): Promise<SlpAssistOutcome<SlpStirPlan>> {
  const storage = createSlurpStorage(db);
  const settings = await storage.getSettings();
  if (!slurpModelWorkerAllows(settings.modelBudget, "present"))
    return { ok: false, status: 409, error: "Plans need your AI connection. The cards still work." };
  const connection = await resolveSlurpTextConnection(
    createConnectionsStorage(db),
    settings.modelBudget.connectionId ?? settings.generationConnectionId,
  );
  if (!connection) return { ok: false, status: 409, error: "Select a text generation connection first." };
  const accounts = (await storage.listNoodlerAccounts()) as Account[];
  const about = request.creatorId ? accounts.find((account) => account.id === request.creatorId) : null;
  const post = request.postId ? await storage.getPostById(request.postId) : null;
  const world = await readSlpStirWorld(db);
  if (!(await claimSlurpModelBudget(db, settings.modelBudget, "plan")))
    return { ok: false, status: 429, error: "Today's AI budget for plans is used up. The cards still work." };
  const provider = slpWithProviderRetry(
    createLLMProvider(
      connection.provider,
      resolveBaseUrl(connection),
      connection.apiKey,
      connection.maxContext,
      connection.openrouterProvider,
      connection.maxTokensOverride,
      connection.claudeFastMode === "true",
      connection.treatAsLocalEndpoint === "true",
      connection.defaultParameters,
    ),
  );
  const result = await provider.chatComplete(
    buildSlpStirPlanMessages({
      text: request.text,
      creators: accounts.map((account) => ({
        id: account.id,
        name: account.displayName,
        handle: account.handle,
        automatic: slurpRunsItself(account),
      })),
      world,
      about: about ? { id: about.id, name: about.displayName } : null,
      post: post ? { id: post.id, caption: String((post as { content?: unknown }).content ?? "") } : null,
    }),
    // Reasoning headroom, like the writing help: a plan is short, the thinking may not be.
    { model: connection.model, temperature: 0.3, maxTokens: 3072 },
  );
  const answer = readSlpStirPlanAnswer(result.content);
  if (!answer) return { ok: false, status: 502, error: "That plan came back garbled. Try again, or play a card." };
  const { cards, cant } = await previewSlpStirSteps(db, answer.steps);
  return { ok: true, value: { cards, question: answer.question, cant: [...answer.cant, ...cant] } };
}

/**
 * Do it: run exactly these steps, in order, and keep the play. A step that fails does not stop the
 * others (each is its own beat); the answer says which ran. Undo is offered when anything that ran
 * can be taken back.
 */
export async function playSlpStir(
  db: DB,
  input: { steps: readonly SlpStirStep[]; origin: SlpStirOrigin },
  at = new Date(),
): Promise<{ play: SlpStirPlay; results: { ok: boolean; value: unknown; error: string | null }[] }> {
  const { steps, results, undo } = await slpRunStirSteps<SlpActionUndo>(input.steps, (action, stepInput) =>
    runSlpActionWithUndo(db, action, stepInput),
  );
  const play = {
    id: newId(),
    at: at.toISOString(),
    origin: input.origin,
    steps,
    undoable: undo.length > 0,
    undone: false,
    undo,
  };
  await mutateSlurpStirPlays(db, (plays) => ({ plays: [play, ...plays], result: null }));
  const { undo: _undo, ...visible } = play;
  return { play: visible, results };
}

/** One Undo for everything reversible in that play, newest step first. */
export async function undoSlpStirPlay(db: DB, id: string): Promise<SlpAssistOutcome<SlpStirPlay>> {
  const play = (await readSlurpStirPlays(db)).find((entry) => entry.id === id);
  if (!play) return { ok: false, status: 404, error: "That play is gone." };
  if (play.undone || !play.undoable) return { ok: false, status: 409, error: "That one cannot be taken back." };
  for (const entry of [...play.undo].reverse()) await undoSlpAction(db, entry as SlpActionUndo);
  const undone = await mutateSlurpStirPlays(db, (plays) => {
    const next = plays.map((entry) => (entry.id === id ? { ...entry, undone: true, undo: [] } : entry));
    return { plays: next, result: next.find((entry) => entry.id === id)! };
  });
  const { undo: _undo, ...visible } = undone;
  return { ok: true, value: visible };
}

/** Everything the Stir tab shows, in one read. `own` marks the pages this persona runs. */
export async function readSlpStirView(
  db: DB,
  own: (account: Account) => boolean,
  at = new Date(),
): Promise<SlpStirView> {
  const storage = createSlurpStorage(db);
  const [accounts, world, document, plays, occurrences] = await Promise.all([
    storage.listNoodlerAccounts() as Promise<Account[]>,
    readSlpStirWorld(db, at),
    readSlurpCreatorTiesDocument(db),
    readSlurpStirPlays(db),
    storage.listStoryOccurrences(),
  ]);
  const creators = await Promise.all(
    accounts.map(async (account) => {
      const automatic = slurpRunsItself(account);
      const [steering, latest] = await Promise.all([
        readSlurpCreatorSteering(db, account.id),
        automatic ? storage.getNoodlerLatestPublishedPost(account.id) : Promise.resolve(null),
      ]);
      return {
        id: account.id,
        name: account.displayName,
        handle: account.handle,
        avatarUrl: account.avatarUrl ?? null,
        automatic,
        own: own(account),
        lastPostAt: (latest as { createdAt?: string } | null)?.createdAt ?? null,
        pace: steering.pace,
        ideas: steering.nudges.length,
      };
    }),
  );
  const endsAt = new Map<string, string>(
    occurrences
      .filter(
        (occurrence: { status: string; endsAt: string }) =>
          occurrence.status === "active" && occurrence.endsAt > at.toISOString(),
      )
      .map((occurrence: { blueprintId: string; endsAt: string }) => [occurrence.blueprintId, occurrence.endsAt]),
  );
  const ownIds = new Set(creators.filter((creator) => creator.own).map((creator) => creator.id));
  const liveInput = {
    at,
    creators,
    couples: document.couples,
    collabs: document.ties.collabs.filter((collab) => world.collabs.some((open) => open.id === collab.id)),
    rivalries: world.rivalries,
    events: world.events.map((event) => ({ ...event, endsAt: endsAt.get(event.id) ?? null })),
    owed: document.deals
      .filter((deal) => ownIds.has(deal.creatorId) && slurpDealOwesPost(deal, at))
      .map((deal) => ({ id: deal.id, creatorId: deal.creatorId, brand: deal.brand })),
    firstVisit: plays.length === 0,
  };
  return {
    live: slpStirLive(liveInput),
    suggestions: slpStirSuggestions(liveInput),
    plays: plays.slice(0, 12).map(({ undo: _undo, ...play }) => play),
    creators: creators.map(({ lastPostAt: _last, pace: _pace, ideas: _ideas, ...creator }) => creator),
    events: world.events,
    couples: world.couples,
    collabs: world.collabs,
    rivalries: world.rivalries,
    storylines: world.storylines,
  };
}
