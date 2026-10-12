import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { slpMessageDetailsSchema } from "../../../../../shared/src/slp/slp-message-details.js";
import type { SlpMessagesContext } from "./slp-messages-context.js";
import type { SlpMessageDeepDetailsResponse } from "../../../../../shared/src/slp/slp-deep-details.js";
import { getSlurpMessageDeepDetails } from "../../data/messages/slp-message-deep-details-storage.js";
import { personaQuerySchema } from "../../modules/messages/slp-messages-schemas.js";
import { SLURP_SUPPORT_ACCOUNT_ID } from "../../../../../shared/src/slp/slp-support.js";

export async function slpMessageDetailsRoutes(app: FastifyInstance, messaging: SlpMessagesContext) {
  const { messages, slurp, requireViewer, ownsCreator, seatIn } = messaging;
  app.patch("/messages/threads/:threadId/details", async (req, reply) => {
    const parsed = slpMessageDetailsSchema.extend({ personaId: z.string().trim().min(1) }).safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { threadId } = req.params as { threadId: string };
    const { personaId, ...patch } = parsed.data;
    const viewer = await requireViewer(personaId);
    if (!viewer) return reply.code(404).send({ error: "Slurp persona not found" });
    const thread = await messages.getThreadById(threadId);
    // Slurp Support's threads are the player's from every persona (`slp-support.ts`).
    const viewerSide = thread?.viewerAccountId === viewer.id || thread?.viewerAccountId === SLURP_SUPPORT_ACCOUNT_ID;
    if (!thread || (!viewerSide && !(await ownsCreator(viewer.id, thread.creatorAccountId))))
      return reply.code(404).send({ error: "Thread not found" });
    await messages.setThreadDetails(threadId, patch);
    await messages.saveDetailsOverrides(threadId, patch);
    if (patch.creatorState) await slurp.setCreatorDetails(thread.creatorAccountId, patch.creatorState);
    return { saved: true };
  });

  /**
   * Everything behind one generated Creator reply, for the Message menu's Deep details: the recorded
   * prompt, the model, its raw answer and the chat facts the reply was built from.
   *
   * The record holds the full prompt, source card and private notes included. Only a persona with a
   * seat in the thread reads it, and it never rides along with the message itself.
   */
  app.get("/slurp/messages/:messageId/deep-details", async (req, reply) => {
    const parsed = personaQuerySchema.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { messageId } = req.params as { messageId: string };
    const viewer = await requireViewer(parsed.data.personaId);
    if (!viewer) return reply.code(404).send({ error: "Slurp persona not found" });
    const message = await messages.getMessageById(messageId);
    const thread = message ? await messages.getThreadById(message.threadId) : null;
    if (!message || message.role !== "creator" || !thread || !(await seatIn(viewer.id, thread)))
      return reply.code(404).send({ error: "Message not found" });
    const creator = await slurp.getNoodlerAccountById(thread.creatorAccountId);
    if (!creator) return reply.code(404).send({ error: "Message not found" });
    const kept = await getSlurpMessageDeepDetails(app.db, message.id);
    const response: SlpMessageDeepDetailsResponse = {
      message: { id: message.id, content: message.content, createdAt: message.createdAt },
      creator: { id: creator.id, displayName: creator.displayName, handle: creator.handle },
      // A record is only ever read through the thread it was written in.
      details: kept?.threadId === thread.id ? kept.record : null,
    };
    return response;
  });
}
