/**
 * The world levers of Stir (W) that are not ties: start an event now, move a storyline's chapter,
 * wake the fans, a Creator's spice level, and `list-world`. Each runs the code its old button ran
 * (Backstage "Start now", the chapter controls, Pulse "Run audience", the steering card's spice);
 * nothing new happens in the world. Also the one Undo for every reversible action.
 */
import type { DB } from "../../../db/connection.js";
import { logger } from "../../../lib/logger.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import { getSlurpPostGuidance, updateSlurpPostGuidance } from "../../data/settings/slp-post-guidance-storage.js";
import {
  patchSlurpCreatorSteering,
  readSlurpCreatorSteering,
  removeSlurpCreatorNudge,
} from "../../data/creators/slp-steering-storage.js";
import { slpUndoPatch } from "../../modules/assist/slp-stir-play.js";
import { slurpModelWorkerAllows } from "../../base/model/slp-model-worker.js";
import { readSlurpStirTies, undoSlurpTieLever, type SlurpTieUndo } from "../projects/slp-projects-contract.js";
import { runCreatorFanActivity } from "../audience/slp-audience-contract.js";
import { SLP_SPICE_TO_EXPLICIT } from "../../../../../shared/src/slp/slp-spice.js";
import type { SlurpPostGuidanceEntry } from "../../modules/feed/slp-post-guidance.js";
import type { SlpActionParsed, SlpStirWorld } from "../../../../../shared/src/slp/slp-actions.js";
import type { SlpCreatorSteering } from "../../../../../shared/src/slp/slp-creator-steering.js";
import type { SlpAssistOutcome } from "./slp-assist-service.js";

/** What one Undo takes back. Kept in the plays ledger; never sent to the app. */
type SteeringPatch = Partial<Omit<SlpCreatorSteering, "nudges" | "support">>;

/**
 * What one Undo takes back. Kept in the plays ledger; never sent to the app. `set` is what the play
 * wrote, so the Undo leaves a later change alone (entries from before 0.3.1 lack it).
 */
export type SlpActionUndo =
  | { kind: "tie"; undo: SlurpTieUndo }
  | { kind: "steering"; accountId: string; patch: SteeringPatch; set?: SteeringPatch }
  | { kind: "idea"; accountId: string; ideaId: string }
  | { kind: "occurrence"; id: string }
  | { kind: "spice"; accountId: string; level: SlurpPostGuidanceEntry["level"]; set?: SlurpPostGuidanceEntry["level"] }
  | {
      kind: "storyline";
      accountId: string;
      projectId: string;
      move: SlpActionParsed<"steer-storyline">["move"];
      before: { chapters: string[]; chapter: number };
      after: { chapters: string[]; chapter: number };
    };

type LeverDone<T> = { ok: true; value: T; undo: SlpActionUndo | null };

const running = (occurrence: { status: string; endsAt: string }, at: Date) =>
  occurrence.status === "active" && occurrence.endsAt > at.toISOString();

/** The ids and names every world lever takes. Reads only. */
export async function readSlpStirWorld(db: DB, at = new Date()): Promise<SlpStirWorld> {
  const storage = createSlurpStorage(db);
  const [ties, settings, occurrences, accounts] = await Promise.all([
    readSlurpStirTies(db),
    storage.getSettings(),
    storage.listStoryOccurrences(),
    storage.listNoodlerAccounts(),
  ]);
  const live = new Set(
    occurrences
      .filter((occurrence: { status: string; endsAt: string }) => running(occurrence, at))
      .map((occurrence: { blueprintId: string }) => occurrence.blueprintId),
  );
  const storylines = (
    await Promise.all(
      accounts.map(async (account: { id: string }) =>
        (await storage.listProjects(account.id))
          .filter(
            (project: { status: string; chapters: string[] }) =>
              (project.status === "active" || project.status === "paused") && project.chapters.length > 0,
          )
          .map((project: { id: string; title: string; chapters: string[]; chapter: number; held?: boolean }) => ({
            accountId: account.id,
            projectId: project.id,
            title: project.title,
            chapter: project.chapters[project.chapter] ?? "",
            held: project.held === true,
          })),
      ),
    )
  ).flat();
  return {
    ...ties,
    events: settings.platformEvents
      .filter((event: { enabled: boolean }) => event.enabled)
      .map((event: { id: string; name: string }) => ({ id: event.id, name: event.name, running: live.has(event.id) })),
    storylines,
  };
}

/** Start an event now: the same start as Backstage's old "Start now" (every Creator it fits joins). */
export async function runSlpStartEvent(
  db: DB,
  input: SlpActionParsed<"start-event">,
): Promise<SlpAssistOutcome<{ occurrenceId: string }> | LeverDone<{ occurrenceId: string }>> {
  const storage = createSlurpStorage(db);
  const at = new Date();
  // A second start while it runs would double what it gives (a double tap, two tabs).
  if (
    (await storage.listStoryOccurrences()).some(
      (occurrence: { blueprintId: string; status: string; endsAt: string }) =>
        occurrence.blueprintId === input.eventId && running(occurrence, at),
    )
  )
    return { ok: false, status: 409, error: "That event is already on." };
  const occurrence = await storage.startStoryEvent(input.eventId, at);
  if (!occurrence) return { ok: false, status: 404, error: "Event not found." };
  return { ok: true, value: { occurrenceId: occurrence.id }, undo: { kind: "occurrence", id: occurrence.id } };
}

/** A chapter move, the same as the chapter controls (open without Director mode). */
export async function runSlpSteerStoryline(
  db: DB,
  input: SlpActionParsed<"steer-storyline">,
): Promise<SlpAssistOutcome<{ projectId: string }> | LeverDone<{ projectId: string }>> {
  if ((input.move === "insert" || input.move === "label") && !input.text)
    return { ok: false, status: 400, error: "Say what the chapter is." };
  const storage = createSlurpStorage(db);
  const before = await storage.getProject(input.accountId, input.projectId);
  if (!before) return { ok: false, status: 404, error: "Storyline not found." };
  const project = await storage.directProject(input.accountId, input.projectId, input.move, input.text);
  if (!project) return { ok: false, status: 409, error: "That does not apply to this storyline right now." };
  return {
    ok: true,
    value: { projectId: input.projectId },
    undo: {
      kind: "storyline",
      accountId: input.accountId,
      projectId: input.projectId,
      move: input.move,
      before: { chapters: [...before.chapters], chapter: before.chapter },
      after: { chapters: [...project.chapters], chapter: project.chapter },
    },
  };
}

/**
 * Wake the fans: Pulse's old "Run audience". A long run, so it starts and the play answers at once
 * (B: long actions never lock the player); Pulse shows it running and what it did.
 */
export async function runSlpRunAudience(db: DB): Promise<SlpAssistOutcome<{ started: boolean }>> {
  const settings = await createSlurpStorage(db).getSettings();
  if (!slurpModelWorkerAllows(settings.modelBudget, "present"))
    return { ok: false, status: 409, error: "The AI budget is off. Turn it on under Audience → AI budget." };
  if (!settings.fanActivityEnabled)
    return { ok: false, status: 409, error: "Fan activity is off. Turn it on under Audience." };
  void runCreatorFanActivity({ db, mode: "manual" }).catch((error: unknown) =>
    logger.warn(error, "[slurp] Audience run from Stir failed"),
  );
  return { ok: true, value: { started: true } };
}

/** A Creator's own spice level (the steering card's control); null goes back to the default. */
export async function runSlpSetSpice(
  db: DB,
  input: SlpActionParsed<"set-spice">,
): Promise<SlpAssistOutcome<{ level: string | null }> | LeverDone<{ level: string | null }>> {
  if (!(await createSlurpStorage(db).getNoodlerAccountById(input.accountId)))
    return { ok: false, status: 404, error: "Creator not found." };
  const before = (await getSlurpPostGuidance(db)).creators[input.accountId]?.level ?? "";
  const level = input.level ? SLP_SPICE_TO_EXPLICIT[input.level] : "";
  await setSlpSpiceLevel(db, input.accountId, level);
  return {
    ok: true,
    value: { level: input.level },
    undo: { kind: "spice", accountId: input.accountId, level: before, set: level },
  };
}

async function setSlpSpiceLevel(db: DB, accountId: string, level: SlurpPostGuidanceEntry["level"]) {
  await updateSlurpPostGuidance(db, (current) => {
    const entry = current.creators[accountId] ?? { public: "", locked: "", menu: "", level: "" };
    return { ...current, creators: { ...current.creators, [accountId]: { ...entry, level } } };
  });
}

/**
 * Take one play step back. The world may have moved on: what is gone stays gone, and a step that
 * would undo a later change answers false and stays as it is.
 */
export async function undoSlpAction(db: DB, undo: SlpActionUndo): Promise<boolean> {
  switch (undo.kind) {
    case "tie":
      return undoSlurpTieLever(db, undo.undo);
    case "steering": {
      const current = await readSlurpCreatorSteering(db, undo.accountId);
      const patch = slpUndoPatch(current, undo.patch, undo.set);
      if (!Object.keys(patch).length) return false;
      await patchSlurpCreatorSteering(db, undo.accountId, patch, { keepSupportNote: true });
      return true;
    }
    case "idea": {
      // An idea that already went out as a post stays posted.
      const { nudges } = await readSlurpCreatorSteering(db, undo.accountId);
      if (!nudges.some((nudge) => nudge.id === undo.ideaId)) return false;
      await removeSlurpCreatorNudge(db, undo.accountId, undo.ideaId);
      return true;
    }
    case "occurrence":
      return createSlurpStorage(db).cancelStartedStoryEvent(undo.id);
    case "spice": {
      const current = (await getSlurpPostGuidance(db)).creators[undo.accountId]?.level ?? "";
      if (undo.set !== undefined && current !== undo.set) return false;
      await setSlpSpiceLevel(db, undo.accountId, undo.level);
      return true;
    }
    case "storyline": {
      const storage = createSlurpStorage(db);
      const current = await storage.getProject(undo.accountId, undo.projectId);
      if (!current) return false;
      if (undo.move === "hold" || undo.move === "release")
        return Boolean(
          await storage.directProject(undo.accountId, undo.projectId, undo.move === "hold" ? "release" : "hold"),
        );
      // Only while the storyline is where the move left it; a chapter that went out since stays.
      if (current.chapter !== undo.after.chapter || current.chapters.join("\n") !== undo.after.chapters.join("\n"))
        return false;
      return Boolean(
        await storage.updateProject(undo.accountId, undo.projectId, {
          chapters: undo.before.chapters,
          chapter: undo.before.chapter,
        }),
      );
    }
  }
}
