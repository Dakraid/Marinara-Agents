import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { newId } from "../../../utils/id-generator.js";
import type { SlpRouteDeps } from "../viewer/slp-viewer-contract.js";
import { mutateSlurpCreatorTies, readSlurpCreatorTiesDocument } from "../../data/projects/slp-creator-ties-storage.js";
import {
  slurpBlockCollab,
  slurpCollabOpen,
  slurpCoolRivalry,
  slurpDeclineCollab,
  slurpPushCollab,
  slurpRivalryActive,
  slurpSuggestCollab,
  slurpUnblockPair,
  type SlurpCreatorTies,
  type SlurpTieError,
} from "../../modules/projects/slp-creator-ties.js";
import { slurpAnswerDeal, slurpDealOpen, slurpDealReceipt } from "../../modules/economy/slp-brand-deals.js";
import { loadSlurpTieCreators, slurpRunsItself } from "./slp-creator-ties-service.js";

const RECENT = 8;
const ERRORS: Record<SlurpTieError | "notFound" | "notOpen", [number, string]> = {
  notFound: [404, "That request is gone."],
  notOpen: [409, "That one is already settled."],
  sameCreator: [400, "Pick two different Creators."],
  noHost: [400, "Pick at least one Creator Slurp posts for, so someone can write the joint post."],
  busy: [409, "Those two are already talking about a collab."],
};

/**
 * Collabs, rivalries and brand deals in Studio: see what is going on between Creators, push a
 * request through, block a pair, suggest a pairing, cool a rivalry down, and answer brand offers for
 * the pages the player runs.
 */
export async function slpCreatorTiesRoutes(app: FastifyInstance, deps: SlpRouteDeps) {
  const { noodle, resolveViewerPersona, creatorBelongsToViewer } = deps;
  const personaSchema = z.object({ personaId: z.string().trim().min(1) });

  async function view(viewer: NonNullable<Awaited<ReturnType<typeof resolveViewerPersona>>>) {
    const [{ ties, deals }, accounts] = await Promise.all([
      readSlurpCreatorTiesDocument(app.db),
      noodle.listNoodlerAccounts(),
    ]);
    const newest = <T>(list: T[], at: (entry: T) => string) =>
      [...list].sort((left, right) => at(right).localeCompare(at(left))).slice(0, RECENT);
    return {
      creators: accounts.map((account) => ({
        id: account.id,
        name: account.displayName,
        handle: account.handle,
        avatarUrl: account.avatarUrl ?? null,
        own: creatorBelongsToViewer(account, viewer),
        automatic: slurpRunsItself(account),
      })),
      collabs: [
        ...ties.collabs.filter(slurpCollabOpen),
        ...newest(
          ties.collabs.filter((collab) => !slurpCollabOpen(collab)),
          (collab) => collab.answeredAt ?? collab.askedAt,
        ),
      ],
      rivalries: [
        ...ties.rivalries.filter(slurpRivalryActive),
        ...newest(
          ties.rivalries.filter((rivalry) => !slurpRivalryActive(rivalry)),
          (rivalry) => rivalry.stageAt,
        ),
      ],
      deals: [
        ...deals.filter(slurpDealOpen),
        ...newest(
          deals.filter((deal) => !slurpDealOpen(deal)),
          (deal) => deal.answeredAt ?? deal.offeredAt,
        ),
      ],
      blocked: ties.blocked,
    };
  }

  const viewerFrom = async (
    body: unknown,
    reply: { code: (code: number) => { send: (value: unknown) => unknown } },
  ) => {
    const parsed = personaSchema.safeParse(body);
    if (!parsed.success) {
      reply.code(400).send({ error: parsed.error.flatten() });
      return null;
    }
    const viewer = await resolveViewerPersona(parsed.data.personaId);
    if (!viewer) reply.code(404).send({ error: "Slurp persona not found" });
    return viewer;
  };

  /** One change to the ties, answered with the whole Studio view. */
  const change = async (
    req: { body: unknown; params: unknown },
    reply: Parameters<typeof viewerFrom>[1],
    run: (ties: SlurpCreatorTies, at: Date) => SlurpCreatorTies | SlurpTieError,
  ) => {
    const viewer = await viewerFrom(req.body, reply);
    if (!viewer) return;
    const outcome = await mutateSlurpCreatorTies(app.db, (document) => {
      const next = run(document.ties, new Date());
      return typeof next === "string"
        ? { document, result: next }
        : { document: { ...document, ties: next }, result: "ok" as const };
    });
    if (outcome && outcome !== "ok") return reply.code(ERRORS[outcome][0]).send({ error: ERRORS[outcome][1] });
    return view(viewer);
  };
  const id = (req: { params: unknown }) => (req.params as { id: string }).id;

  app.get("/slurp/ties", async (req, reply) => {
    const viewer = await viewerFrom(req.query, reply);
    return viewer ? view(viewer) : undefined;
  });

  app.post("/slurp/ties/collabs/:id/push", (req, reply) =>
    change(req, reply, (ties, at) => slurpPushCollab(ties, id(req), at)),
  );
  app.post("/slurp/ties/collabs/:id/decline", (req, reply) =>
    change(req, reply, (ties, at) => slurpDeclineCollab(ties, id(req), at)),
  );
  app.post("/slurp/ties/collabs/:id/block", (req, reply) =>
    change(req, reply, (ties, at) => slurpBlockCollab(ties, id(req), at)),
  );
  app.post("/slurp/ties/unblock", async (req, reply) => {
    const parsed = z
      .object({ key: z.string().trim().min(3).max(260) })
      .passthrough()
      .safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    return change(req, reply, (ties) => slurpUnblockPair(ties, parsed.data.key));
  });
  app.post("/slurp/ties/rivalries/:id/cool", (req, reply) =>
    change(req, reply, (ties, at) => slurpCoolRivalry(ties, id(req), at)),
  );

  app.post("/slurp/ties/collabs", async (req, reply) => {
    const parsed = z
      .object({ aId: z.string().trim().min(1), bId: z.string().trim().min(1) })
      .passthrough()
      .safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const creators = await loadSlurpTieCreators(app.db);
    const a = creators.find((creator) => creator.id === parsed.data.aId);
    const b = creators.find((creator) => creator.id === parsed.data.bId);
    if (!a || !b) return reply.code(404).send({ error: "Creator account not found" });
    return change(req, reply, (ties, at) => slurpSuggestCollab(ties, a, b, { at, id: newId() }));
  });

  /** A brand offer to a page the player runs: yes pays the fee now, no ends it. */
  app.post("/slurp/ties/deals/:id/answer", async (req, reply) => {
    const parsed = personaSchema.extend({ accept: z.boolean() }).safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const viewer = await resolveViewerPersona(parsed.data.personaId);
    if (!viewer) return reply.code(404).send({ error: "Slurp persona not found" });
    const deal = (await readSlurpCreatorTiesDocument(app.db)).deals.find((entry) => entry.id === id(req));
    const creator = deal ? await noodle.getNoodlerAccountById(deal.creatorId) : null;
    if (!deal || !creator) return reply.code(404).send({ error: ERRORS.notFound[1] });
    if (!creatorBelongsToViewer(creator, viewer))
      return reply.code(403).send({ error: "Only the Creator's own page can answer this offer." });
    const outcome = await mutateSlurpCreatorTies(app.db, (document) => {
      const next = slurpAnswerDeal(document.deals, deal.id, parsed.data.accept, new Date());
      return typeof next === "string"
        ? { document, result: next }
        : { document: { ...document, deals: next }, result: "ok" as const };
    });
    if (outcome && outcome !== "ok") return reply.code(ERRORS[outcome][0]).send({ error: ERRORS[outcome][1] });
    if (parsed.data.accept) await noodle.creditSponsorFee(creator.id, deal.fee, deal.brand, slurpDealReceipt(deal.id));
    return view(viewer);
  });
}
