/**
 * Collabs, rivalries and brand deals on the world clock, and what they mean for the next post.
 *
 * No model calls: the world decides requests, answers, offers and rivalry stages by code (see the
 * rules in `slp-creator-ties.ts` and `slp-brand-deals.ts`), and the posts ride ordinary slots.
 */
import type { DB } from "../../../db/connection.js";
import { logger } from "../../../lib/logger.js";
import { newId } from "../../../utils/id-generator.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import { createSlurpPopulationStorage } from "../../data/audience/slp-audience-storage-funnel.js";
import { readSlurpCreatorFitText } from "../../data/creators/slp-flavour-source.js";
import { mutateSlurpCreatorTies, readSlurpCreatorTiesDocument } from "../../data/projects/slp-creator-ties-storage.js";
import { slurpCreatorReach } from "../../../../../shared/src/slp/slp-reach.js";
import { slurpPlatformScaleMultiplier, slurpWorldActivityMultiplier } from "../../modules/audience/slp-scale.js";
import {
  slurpAdvanceCreatorTies,
  slurpAgreeCollabInDm,
  slurpCollabPostIdsFor,
  slurpPlanCollab,
  slurpSettleCollab,
  slurpTellRivalry,
  type SlurpTieCreator,
} from "../../modules/projects/slp-creator-ties.js";
import { readSlurpTieStamp } from "../../modules/projects/slp-tie-stamp.js";
import {
  slurpAdvanceBrandDeals,
  slurpDealReceipt,
  slurpPlanDeal,
  slurpSettleDeal,
  slurpToldFansAboutDeal,
  type SlurpDealAd,
} from "../../modules/economy/slp-brand-deals.js";
import { slurpTieBeat } from "../../modules/feed/slp-tie-beats.js";
import type { SlurpBeat } from "../../modules/feed/slp-post-beat.js";
import type { SlurpContentIntent } from "../../../../../shared/src/slp/slp-content-axes.js";
import { createGarnishAds, garnishRatingAllowed } from "../ads/slp-ads-contract.js";

type Storage = ReturnType<typeof createSlurpStorage>;
type Account = Awaited<ReturnType<Storage["listNoodlerAccounts"]>>[number];

/** A page the player runs itself: Slurp never writes its posts. */
export const slurpRunsItself = (account: { kind: string; sourceKind?: string | null }) =>
  !(account.kind === "persona" && account.sourceKind === "persona");

/** Every Creator as the tie rules see them: fit text from the card, tags, reach. */
export async function loadSlurpTieCreators(db: DB, at = new Date()): Promise<SlurpTieCreator[]> {
  const storage = createSlurpStorage(db);
  const [accounts, settings] = await Promise.all([storage.listNoodlerAccounts(), storage.getSettings()]);
  const followers = await createSlurpPopulationStorage(db).countFollowersForCreators(
    accounts.map((account) => account.id),
  );
  const scale = slurpPlatformScaleMultiplier(settings.platformScale);
  return Promise.all(
    accounts.map(async (account: Account) => ({
      id: account.id,
      name: account.displayName,
      text: await readSlurpCreatorFitText(db, { account, source: await storage.resolveAccountSource(account) }),
      tags: account.settings.profile.tags ?? [],
      automatic: slurpRunsItself(account),
      followers: slurpCreatorReach(
        { accountId: account.id, createdAt: account.createdAt, realFollowers: followers.get(account.id) ?? 0, scale },
        at,
        settings.simulationTuning.reach,
      ),
    })),
  );
}

/**
 * Settle what went up, then (every few hours) let the world answer, offer, and start or move ties.
 * Settling runs every tick, so a joint post reaches the partner's page within one tick.
 */
export async function advanceSlurpCreatorTies(db: DB, at = new Date()): Promise<void> {
  await settleSlurpTiePosts(db, at);
  const { ties } = await readSlurpCreatorTiesDocument(db);
  if (ties.advancedAt && at.getTime() - Date.parse(ties.advancedAt) < 6 * 60 * 60 * 1000) return;
  const storage = createSlurpStorage(db);
  const settings = await storage.getSettings();
  const creators = await loadSlurpTieCreators(db, at);
  const ads: SlurpDealAd[] = settings.inlineAdsEnabled
    ? (await createGarnishAds(db).pool.listActive("slurp"))
        .filter(
          (ad) => ad.kind === "inline" && garnishRatingAllowed(ad.contentRating, settings.inlineAdsContentCeiling),
        )
        .map((ad) => ({
          id: ad.id,
          brand: ad.brand,
          product: ad.product,
          copy: ad.copy,
          categories: ad.categories,
          contextTags: ad.contextTags,
        }))
    : [];
  const activity = slurpWorldActivityMultiplier(settings.worldActivity);
  const paired = settings.creatorCollabs.map((collab) => collab.creatorIds);
  await mutateSlurpCreatorTies(db, (document) => ({
    document: {
      ties: slurpAdvanceCreatorTies(document.ties, { creators, at, activity, paired, newId }),
      deals: slurpAdvanceBrandDeals(document.deals, {
        creators,
        ads,
        at,
        activity,
        lastLook: document.ties.advancedAt,
        newId,
      }),
    },
    result: null,
  }));
}

/** Planned collabs and sponsored posts whose post went up: shown on both pages, fee paid. */
async function settleSlurpTiePosts(db: DB, at: Date): Promise<void> {
  const { ties, deals } = await readSlurpCreatorTiesDocument(db);
  const planned = [
    ...ties.collabs
      .filter((collab) => collab.status === "planned")
      .map((collab) => ({ id: collab.id, hostId: collab.hostId })),
    ...deals.filter((deal) => deal.status === "planned").map((deal) => ({ id: deal.id, hostId: deal.creatorId })),
  ];
  if (!planned.length) return;
  const storage = createSlurpStorage(db);
  const found = new Map<string, { id: string; createdAt: string }>();
  for (const hostId of new Set(planned.map((entry) => entry.hostId))) {
    for (const post of await storage.listNoodlerPostsByAccount(hostId, 12)) {
      const stamp = readSlurpTieStamp(post.metadata);
      if (stamp && !stamp.declined && !found.has(stamp.id)) found.set(stamp.id, post);
    }
  }
  if (!found.size) return;
  const paid = await mutateSlurpCreatorTies(db, (document) => {
    let next = document;
    const toPay: { creatorId: string; fee: number; brand: string; id: string }[] = [];
    for (const [tieId, post] of found) {
      const deal = next.deals.find((entry) => entry.id === tieId && entry.status === "planned");
      if (deal) toPay.push({ creatorId: deal.creatorId, fee: deal.fee, brand: deal.brand, id: deal.id });
      next = {
        ties: slurpSettleCollab(next.ties, tieId, post),
        deals: deal ? slurpSettleDeal(next.deals, tieId, post, at) : next.deals,
      };
    }
    return { document: next, result: toPay };
  });
  // The receipt id makes a repeated settle pay once.
  for (const fee of paid ?? [])
    await storage
      .creditSponsorFee(fee.creatorId, fee.fee, fee.brand, slurpDealReceipt(fee.id))
      .catch((error: unknown) => logger.warn(error, "[slurp-ties] Could not pay a sponsor fee"));
}

/**
 * This Creator's next ordinary post, when a collab, a deal or a rivalry takes it. The collab or deal
 * is marked planned so no second slot takes it. Any failure is a warning and an ordinary post.
 */
export async function planSlurpTieBeat(
  db: DB,
  input: {
    creatorId: string;
    creatorText: string;
    sequence: number;
    intents: readonly SlurpContentIntent[];
    at: Date;
    previewOnly?: boolean;
  },
): Promise<SlurpBeat | null> {
  try {
    const { ties, deals } = await readSlurpCreatorTiesDocument(db);
    const ids = new Set([
      ...ties.collabs.flatMap((collab) => [collab.hostId, collab.partnerId]),
      ...ties.rivalries.flatMap((rivalry) => [rivalry.fromId, rivalry.toId]),
    ]);
    if (!ids.has(input.creatorId) && !deals.some((deal) => deal.creatorId === input.creatorId)) return null;
    const storage = createSlurpStorage(db);
    const names = new Map<string, string>();
    for (const id of ids) {
      const account = await storage.getNoodlerAccountById(id);
      if (account) names.set(id, account.displayName);
    }
    const planned = slurpTieBeat({ ...input, ties, deals, names });
    if (!planned || input.previewOnly) return planned?.beat ?? null;
    const { tie } = planned.beat;
    await mutateSlurpCreatorTies(db, (document) => ({
      document: {
        ties:
          tie.kind === "collab"
            ? slurpPlanCollab(document.ties, tie.id, input.at)
            : tie.kind === "rival"
              ? slurpTellRivalry(document.ties, tie.id, input.creatorId)
              : document.ties,
        deals:
          tie.kind !== "sponsor"
            ? document.deals
            : tie.declined
              ? slurpToldFansAboutDeal(document.deals, tie.id)
              : slurpPlanDeal(document.deals, tie.id, input.at),
      },
      result: null,
    }));
    return planned.beat;
  } catch (error) {
    logger.warn(error, "[slurp-ties] Could not plan a collab, deal or rivalry post; this one is ordinary");
    return null;
  }
}

/** Joint posts that show on this Creator's page although the partner wrote them. */
export async function slurpCollabPostIdsForCreator(db: DB, creatorId: string): Promise<string[]> {
  return slurpCollabPostIdsFor((await readSlurpCreatorTiesDocument(db)).ties, creatorId);
}

/** Two pages agreed on a joint post in their own DM; the replying Creator hosts and writes it. */
export async function agreeSlurpCollabInDm(
  db: DB,
  input: { hostId: string; partnerId: string; idea: string; hostShare: number | null },
): Promise<void> {
  const creators = await loadSlurpTieCreators(db);
  const host = creators.find((creator) => creator.id === input.hostId);
  const partner = creators.find((creator) => creator.id === input.partnerId);
  if (!host?.automatic || !partner || host.id === partner.id) return;
  await mutateSlurpCreatorTies(db, (document) => ({
    document: {
      ...document,
      ties: slurpAgreeCollabInDm(document.ties, host, partner, {
        at: new Date(),
        id: newId(),
        idea: input.idea,
        hostShare: input.hostShare,
      }),
    },
    result: null,
  }));
}
