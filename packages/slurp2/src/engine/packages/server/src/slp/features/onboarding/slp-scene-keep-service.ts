/**
 * Keep the sign-up chat as the new Creator's first DM thread with the player's persona.
 *
 * The Creator opens the thread (no request fee), and only an empty thread takes the transcript, so
 * pressing twice or keeping a chat for an older Creator never scrambles a real conversation.
 */
import type { SlpSceneKeepRequest } from "../../../../../shared/src/slp/slp-scene.js";
import type { DB } from "../../../db/connection.js";
import { createSlurpMessagesStorage, createSlurpStorage } from "../../data/slp-storage.js";
import { slpSceneThreadMessages } from "../../modules/onboarding/slp-scene-thread.js";

export async function keepSlpSceneTranscript(
  db: DB,
  request: SlpSceneKeepRequest,
): Promise<{ status: "kept"; threadId: string } | { status: "missing" | "skipped" }> {
  const creator = await createSlurpStorage(db).getNoodlerAccountById(request.creatorAccountId);
  if (!creator) return { status: "missing" };
  const messages = createSlurpMessagesStorage(db);
  // A persona's own Creator has no DM thread with that persona; openThread says not_found.
  const opened = await messages.openThread(request.viewerPersonaId, creator.id, "creator", "waive");
  if (opened.status !== "ok") return { status: "skipped" };
  if ((await messages.listMessages(opened.thread.id, 1)).length > 0) return { status: "skipped" };
  const kept = slpSceneThreadMessages({ ...request, now: new Date() });
  if (!kept.length) return { status: "skipped" };
  for (const message of kept) {
    await messages.appendMessage(opened.thread.id, {
      senderAccountId: message.role === "creator" ? creator.id : request.viewerPersonaId,
      ...message,
    });
  }
  return { status: "kept", threadId: opened.thread.id };
}
