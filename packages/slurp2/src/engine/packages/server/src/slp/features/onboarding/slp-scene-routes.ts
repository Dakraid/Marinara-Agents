import type { FastifyInstance } from "fastify";
import { slpSceneTurnRequestSchema } from "../../../../../shared/src/slp/slp-scene.js";
import { logger } from "../../../lib/logger.js";
import { resolveSlurpTextConnection } from "../../base/identity/slp-connection.js";
import { getErrorMessage } from "../../modules/creators/slp-public-support.js";
import type { SlpRouteDeps } from "../viewer/slp-viewer-contract.js";
import { generateSlpSceneTurn } from "./slp-scene-turn-service.js";

/** The role-play Creator sign-up. */
export async function slpSceneRoutes(app: FastifyInstance, deps: SlpRouteDeps) {
  const { connections, noodle } = deps;
  app.post("/slurp/onboarding/scene/turn", async (req, reply) => {
    const parsed = slpSceneTurnRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const settings = await noodle.getSettings();
    const connection = await resolveSlurpTextConnection(
      connections,
      parsed.data.connectionId ?? settings.generationConnectionId,
    );
    if (!connection) return reply.code(404).send({ error: "Slurp generation connection not found" });
    try {
      return await generateSlpSceneTurn(app.db, { request: parsed.data, connection });
    } catch (error) {
      logger.error(error, "[slurp] Sign-up scene turn failed using %s", connection.model || connection.provider);
      return reply.code(500).send({ error: getErrorMessage(error) });
    }
  });
}
