/**
 * Brand deals: the ads already in Slurp's ad pool come to Creators as paid partnership offers.
 *
 * Pure and deterministic. A Creator Slurp posts for answers in character, from their card: a brand
 * that fits their niche is a yes, one that clashes with who they are (or a card that says they never
 * do ads) is a no, with a reason of their own. A yes becomes a sponsored post in their voice on an
 * ordinary slot (no extra model call), and the fee reaches their earnings when it goes up. An offer
 * to a page the player runs waits for the player in Studio; a yes pays at once.
 *
 * The spice slice may later tag offers by heat; the ad's own `contentRating` under the ads ceiling
 * is the only gate here.
 */
import { SLURP_DRAMATIC, SLURP_NEVER_PATTERN } from "../feed/slp-life-moments.js";
import { DAY_MS, clampText, hash } from "../projects/slp-project.js";
import {
  SLURP_TIES_ADVANCE_MS,
  SLURP_TIE_PLAN_STALE_DAYS,
  slurpCreatorInterests,
  type SlurpTieCreator,
} from "../projects/slp-creator-ties.js";

const HOUR_MS = 60 * 60 * 1000;
const ANSWER_AFTER_MS = 2 * HOUR_MS;
const PLAYER_ANSWER_DAYS = 3;
const MAX_OPEN_OFFERS = 4;
/** The same brand does not come back to the same Creator for a while. */
const BRAND_REST_DAYS = 30;
/** A refusal is worth a post for a few days, then it is old news. */
const REFUSAL_NEWS_DAYS = 3;
const KEEP_FINISHED = 40;

/** One ad from the pool, as far as a deal needs it. */
export type SlurpDealAd = {
  id: string;
  brand: string;
  product: string;
  copy: string;
  categories: readonly string[];
  contextTags: readonly string[];
};

export type SlurpBrandDealStatus = "offered" | "accepted" | "planned" | "done" | "declined";
export type SlurpDealDecline = "offBrand" | "noAds" | "notNow" | "noAnswer" | "player";

export type SlurpBrandDeal = {
  id: string;
  adId: string;
  brand: string;
  product: string;
  copy: string;
  creatorId: string;
  fee: number;
  status: SlurpBrandDealStatus;
  decline: SlurpDealDecline | null;
  offeredAt: string;
  answeredAt: string | null;
  plannedAt: string | null;
  postId: string | null;
  /** The fee reached their earnings. */
  paidAt: string | null;
  /** They already posted about turning it down. */
  toldFans: boolean;
};

/** What a brand pays: a small Creator gets a small deal. Grows on a square root of the followers. */
export function slurpBrandDealFee(followers: number): number {
  const reach = Math.max(0, Number.isFinite(followers) ? followers : 0);
  return Math.min(600, Math.max(25, Math.round(25 + Math.sqrt(reach) * 1.5)));
}

const AD_TOPIC =
  /\b(ads?|adverts?|sponsor\w*|brands?|brand deals?|sell-?outs?|selling out|promo\w*|partnerships?|werbung)\b/iu;
/** Personality that turns deals down more often: they would rather stay "real". */
const PICKY = /\b(indie|authentic|anti-?capitalis\w*|punk|rebel\w*|underground|diy|minimalis\w*|principled)\b/iu;

const never = (text: string) =>
  text.split(/(?<=[.!?])\s+|\n+/u).filter((sentence) => SLURP_NEVER_PATTERN.test(sentence));

/** How well an ad fits a Creator: shared words between the ad's categories/tags and their niche. */
export function slurpDealFit(ad: SlurpDealAd, creator: Pick<SlurpTieCreator, "text" | "tags">): number {
  const wanted = [...ad.categories, ...ad.contextTags].map((word) => word.toLocaleLowerCase());
  const have = new Set([...creator.tags.map((tag) => tag.toLocaleLowerCase()), ...slurpCreatorInterests(creator)]);
  const text = creator.text.toLocaleLowerCase();
  return wanted.filter((word) => have.has(word) || (word.length >= 4 && text.includes(word))).length;
}

/** The Creator's own answer to an offer, from their card. */
export function slurpDealAnswer(
  deal: Pick<SlurpBrandDeal, "id" | "brand" | "product">,
  ad: SlurpDealAd,
  creator: SlurpTieCreator,
): { accept: boolean; decline: SlurpDealDecline | null } {
  const lines = never(creator.text);
  if (lines.some((line) => AD_TOPIC.test(line))) return { accept: false, decline: "noAds" };
  const words = [ad.brand, ad.product, ...ad.categories]
    .map((word) => word.toLocaleLowerCase())
    .filter((word) => word.length >= 3);
  if (lines.some((line) => words.some((word) => line.toLocaleLowerCase().includes(word))))
    return { accept: false, decline: "offBrand" };
  const fit = slurpDealFit(ad, creator);
  if (fit === 0) return { accept: false, decline: "offBrand" };
  // Even a good fit is sometimes a "not right now"; picky personalities say it more often.
  const odds = PICKY.test(creator.text) ? 3 : 6;
  return hash(`${deal.id}:answer`) % odds === 0
    ? { accept: false, decline: "notNow" }
    : { accept: true, decline: null };
}

// ─── Storage shape ──────────────────────────────────────────────────────────────────────────────

const STATUSES: readonly SlurpBrandDealStatus[] = ["offered", "accepted", "planned", "done", "declined"];
const DECLINES: readonly SlurpDealDecline[] = ["offBrand", "noAds", "notNow", "noAnswer", "player"];
const date = (value: unknown) => (typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null);

export function readSlurpBrandDeals(raw: unknown): SlurpBrandDeal[] {
  return (Array.isArray(raw) ? raw : []).flatMap((entry): SlurpBrandDeal[] => {
    const item = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : null;
    const id = clampText(item?.id, 64);
    const creatorId = clampText(item?.creatorId, 128);
    const brand = clampText(item?.brand, 80);
    const offeredAt = date(item?.offeredAt);
    if (!item || !id || !creatorId || !brand || !offeredAt) return [];
    return [
      {
        id,
        adId: clampText(item.adId, 120),
        brand,
        product: clampText(item.product, 120),
        copy: clampText(item.copy, 600),
        creatorId,
        fee: typeof item.fee === "number" && Number.isInteger(item.fee) && item.fee > 0 ? item.fee : 25,
        status: STATUSES.includes(item.status as SlurpBrandDealStatus)
          ? (item.status as SlurpBrandDealStatus)
          : "offered",
        decline: DECLINES.includes(item.decline as SlurpDealDecline) ? (item.decline as SlurpDealDecline) : null,
        offeredAt,
        answeredAt: date(item.answeredAt),
        plannedAt: date(item.plannedAt),
        postId: clampText(item.postId, 128) || null,
        paidAt: date(item.paidAt),
        toldFans: item.toldFans === true,
      },
    ];
  });
}

export const slurpDealOpen = (deal: SlurpBrandDeal) =>
  deal.status === "offered" || deal.status === "accepted" || deal.status === "planned";

function trim(deals: SlurpBrandDeal[]): SlurpBrandDeal[] {
  const finished = deals
    .filter((deal) => !slurpDealOpen(deal))
    .sort((left, right) => (right.answeredAt ?? right.offeredAt).localeCompare(left.answeredAt ?? left.offeredAt))
    .slice(0, KEEP_FINISHED);
  return [...deals.filter(slurpDealOpen), ...finished];
}

// ─── The world clock ────────────────────────────────────────────────────────────────────────────

export type SlurpDealsInput = {
  creators: readonly SlurpTieCreator[];
  /** Active ads under the ads ceiling. */
  ads: readonly SlurpDealAd[];
  at: Date;
  activity: number;
  /** When the ties were last looked at; deals move on the same clock. */
  lastLook: string | null;
  newId: () => string;
};

/**
 * One look at the deals: due answers, stale plans freed, expired offers, and now and then a new
 * offer to the Creator the pool fits best.
 */
export function slurpAdvanceBrandDeals(deals: SlurpBrandDeal[], input: SlurpDealsInput): SlurpBrandDeal[] {
  const { at } = input;
  if (input.lastLook && at.getTime() - Date.parse(input.lastLook) < SLURP_TIES_ADVANCE_MS) return deals;
  const stamp = at.toISOString();
  const byId = new Map(input.creators.map((creator) => [creator.id, creator]));
  const adById = new Map(input.ads.map((ad) => [ad.id, ad]));
  const days = (from: string) => (at.getTime() - Date.parse(from)) / DAY_MS;

  let next = deals.map((deal): SlurpBrandDeal => {
    const creator = byId.get(deal.creatorId);
    if (slurpDealOpen(deal) && !creator) return { ...deal, status: "declined", decline: "noAnswer", answeredAt: stamp };
    if (deal.status === "planned" && deal.plannedAt && days(deal.plannedAt) >= SLURP_TIE_PLAN_STALE_DAYS)
      return { ...deal, status: "accepted", plannedAt: null };
    if (deal.status !== "offered" || !creator) return deal;
    if (!creator.automatic)
      return days(deal.offeredAt) >= PLAYER_ANSWER_DAYS
        ? { ...deal, status: "declined", decline: "noAnswer", answeredAt: stamp }
        : deal;
    if (at.getTime() - Date.parse(deal.offeredAt) < ANSWER_AFTER_MS) return deal;
    const ad = adById.get(deal.adId) ?? {
      id: deal.adId,
      brand: deal.brand,
      product: deal.product,
      copy: deal.copy,
      categories: [],
      contextTags: [],
    };
    const answer = slurpDealAnswer(deal, ad, creator);
    return answer.accept
      ? { ...deal, status: "accepted", answeredAt: stamp }
      : { ...deal, status: "declined", decline: answer.decline, answeredAt: stamp, toldFans: false };
  });

  const window = Math.floor(at.getTime() / SLURP_TIES_ADVANCE_MS);
  const roll = hash(`${window}:deal`) % 100;
  if (next.filter(slurpDealOpen).length < MAX_OPEN_OFFERS && roll < Math.round(25 * Math.max(0, input.activity))) {
    const busy = new Set(next.filter(slurpDealOpen).map((deal) => deal.creatorId));
    const offered = (creatorId: string, adId: string) =>
      next.some((deal) => deal.creatorId === creatorId && deal.adId === adId && days(deal.offeredAt) < BRAND_REST_DAYS);
    // Brands go where they fit. A brand with no fit anywhere makes no offer.
    const options = input.creators
      .filter((creator) => !busy.has(creator.id))
      .flatMap((creator) =>
        input.ads
          .filter((ad) => !offered(creator.id, ad.id))
          .map((ad) => ({ creator, ad, fit: slurpDealFit(ad, creator) })),
      )
      .filter((option) => option.fit > 0)
      .sort(
        (left, right) =>
          right.fit - left.fit ||
          hash(`${window}:${left.creator.id}:${left.ad.id}`) - hash(`${window}:${right.creator.id}:${right.ad.id}`),
      );
    const pick = options[0];
    if (pick)
      next = [
        ...next,
        {
          id: input.newId(),
          adId: pick.ad.id,
          brand: pick.ad.brand,
          product: pick.ad.product,
          copy: pick.ad.copy,
          creatorId: pick.creator.id,
          fee: slurpBrandDealFee(pick.creator.followers),
          status: "offered",
          decline: null,
          offeredAt: stamp,
          answeredAt: null,
          plannedAt: null,
          postId: null,
          paidAt: null,
          toldFans: false,
        },
      ];
  }
  return trim(next);
}

/** Whether a refusal is fresh enough to talk about, and whether this Creator would. */
export function slurpRefusalWorthAPost(
  deal: SlurpBrandDeal,
  creator: Pick<SlurpTieCreator, "text">,
  at: Date,
): boolean {
  if (deal.status !== "declined" || deal.toldFans || !deal.answeredAt) return false;
  if (deal.decline === "noAnswer" || deal.decline === "player") return false;
  if ((at.getTime() - Date.parse(deal.answeredAt)) / DAY_MS > REFUSAL_NEWS_DAYS) return false;
  return SLURP_DRAMATIC.test(creator.text) || PICKY.test(creator.text) || hash(`${deal.id}:tell`) % 3 === 0;
}

// ─── The player's answer (pages the player runs) and posts ──────────────────────────────────────

export function slurpAnswerDeal(
  deals: SlurpBrandDeal[],
  id: string,
  accept: boolean,
  at: Date,
): SlurpBrandDeal[] | "notFound" | "notOpen" {
  const deal = deals.find((entry) => entry.id === id);
  if (!deal) return "notFound";
  if (deal.status !== "offered") return "notOpen";
  const stamp = at.toISOString();
  // ponytail: a page the player runs is paid on "yes"; Slurp does not write that page's posts, so
  // the sponsored post is the player's to make. Track an owed post if players ask for it.
  return deals.map((entry) =>
    entry.id !== id
      ? entry
      : accept
        ? { ...entry, status: "done" as const, answeredAt: stamp, paidAt: stamp }
        : { ...entry, status: "declined" as const, decline: "player" as const, answeredAt: stamp, toldFans: true },
  );
}

export function slurpPlanDeal(deals: SlurpBrandDeal[], id: string, at: Date): SlurpBrandDeal[] {
  return deals.map((deal) =>
    deal.id === id ? { ...deal, status: "planned" as const, plannedAt: at.toISOString() } : deal,
  );
}

export function slurpToldFansAboutDeal(deals: SlurpBrandDeal[], id: string): SlurpBrandDeal[] {
  return deals.map((deal) => (deal.id === id ? { ...deal, toldFans: true } : deal));
}

/** The sponsored post went up: the deal is done, and the fee is owed now (paid once, by receipt id). */
export function slurpSettleDeal(
  deals: SlurpBrandDeal[],
  id: string,
  post: { id: string; createdAt: string },
  at: Date,
) {
  return deals.map((deal) =>
    deal.id === id && !deal.postId
      ? { ...deal, status: "done" as const, postId: post.id, paidAt: at.toISOString() }
      : deal,
  );
}

/** The receipt id a deal's fee is paid under, so a repeated settle never pays twice. */
export const slurpDealReceipt = (dealId: string) => `sponsor:${dealId}`;
