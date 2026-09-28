/**
 * What collabs, brand deals and rivalries mean for a Creator's next post: a beat, like a life moment.
 *
 * Pure and deterministic. The beat says what happens; the flavour brief makes the Creator tell it
 * their own way in the same post call (no extra AI call). A collab or a sponsored post is a
 * commitment and takes the next ordinary slot; rivalry posts and "I turned a brand down" posts are
 * occasional, like real people who do not post about a spat every time.
 */
import type { SlurpContentIntent } from "../../../../../shared/src/slp/slp-content-axes.js";
import { hash } from "../projects/slp-project.js";
import { slurpRivalryActive, type SlurpCreatorTies, type SlurpRivalry } from "../projects/slp-creator-ties.js";
import type { SlurpTieStamp } from "../projects/slp-tie-stamp.js";
import { slurpRefusalWorthAPost, type SlurpBrandDeal } from "../economy/slp-brand-deals.js";
import type { SlurpCouple } from "../projects/slp-creator-couples.js";
import { slurpCoupleBeat } from "./slp-couple-beats.js";
import type { SlurpBeat } from "./slp-post-beat.js";

/** The collab partner's own post about it comes within this many days of the joint post, or not at all. */
export const SLURP_COLLAB_ECHO_DAYS = 3;

/** A beat from a tie, and what it claims once planned. */
export type SlurpTieBeat = { beat: SlurpBeat & { tie: SlurpTieStamp } };

const REFUSAL_REASON: Record<string, string> = {
  offBrand: "it is just not you",
  noAds: "you do not do ads",
  notNow: "it did not feel right at the moment",
};

function rivalLine(rivalry: SlurpRivalry, selfId: string, rival: string): string {
  const started = rivalry.fromId === selfId;
  if (rivalry.stage === "shade")
    return started
      ? `${rival} ${rivalry.cause}. You post a vague subtweet about it: you do not name ${rival}, but people who follow you both will know.`
      : `You have noticed ${rival} throwing shade your way lately. You hint at it without naming them.`;
  if (rivalry.stage === "feud")
    return started
      ? `Your feud with ${rival} is out in the open now: it started when ${rival} ${rivalry.cause}. Answer it your way: clap back, rise above it, or laugh it off.`
      : `Your feud with ${rival} is out in the open now: they started it and called you out in public. Answer it your way: clap back, rise above it, or laugh it off.`;
  return `Things with ${rival} have cooled down. Let it go your way: a gracious word, a shrug, or just moving on.`;
}

/**
 * The tie beat for this Creator's ordinary slot, or null. Order: a collab they host, a sponsored post
 * they said yes to, a couple moment, then now and then a rivalry post or a word about a brand they
 * turned down.
 * Never on a teaser slot.
 */
export function slurpTieBeat(input: {
  creatorId: string;
  creatorText: string;
  sequence: number;
  ties: SlurpCreatorTies;
  deals: readonly SlurpBrandDeal[];
  /** Couples (7b-couples): their moments come after a collab and a deal, before a rivalry. */
  couples?: readonly SlurpCouple[];
  /** Public names by account id. */
  names: ReadonlyMap<string, string>;
  intents: readonly SlurpContentIntent[];
  at: Date;
  /** Hook for the spice slice: the lowest heat a tie post may go (0-3). Unused until then. */
  heatFloor?: number;
}): SlurpTieBeat | null {
  const { creatorId, ties, names } = input;
  if (input.intents.every((intent) => intent === "teaser")) return null;
  const heat = input.heatFloor === undefined ? {} : { heatFloor: input.heatFloor };

  const collab = ties.collabs.find((entry) => entry.status === "agreed" && entry.hostId === creatorId);
  const partner = collab ? names.get(collab.partnerId) : undefined;
  if (collab && partner) {
    const split =
      collab.hostShare === 50
        ? "You split what it earns fifty-fifty."
        : `You agreed that ${collab.hostShare}% of what it earns is yours and ${100 - collab.hostShare}% goes to ${partner}.`;
    return {
      beat: {
        type: "social_moment",
        anchorKind: "collab",
        anchor: partner,
        line: `You and ${partner} make a collab post together today: ${collab.idea}. It goes up on both your pages and you tag each other. ${split}`,
        cast: [partner],
        place: null,
        ...heat,
        tie: { kind: "collab", id: collab.id, partnerId: collab.partnerId, hostShare: collab.hostShare },
      },
    };
  }

  // The partner posts their own side once, within a few days of the joint post (slice I pace).
  const posted = ties.collabs.find(
    (entry) =>
      entry.status === "posted" &&
      entry.partnerId === creatorId &&
      !entry.echoed &&
      entry.postedAt &&
      input.at.getTime() - Date.parse(entry.postedAt) < SLURP_COLLAB_ECHO_DAYS * 86_400_000,
  );
  const host = posted ? names.get(posted.hostId) : undefined;
  if (posted && host)
    return {
      beat: {
        type: "social_moment",
        anchorKind: "collab",
        anchor: host,
        line: `Your collab with ${host} is up on both your pages (${posted.idea}). Post your own side of it: a moment from behind the scenes, what you took from it, or a thank-you. Your own post, not a copy of the joint one.`,
        cast: [host],
        place: null,
        ...heat,
        tie: { kind: "collab", id: posted.id, partnerId: posted.hostId, echo: true },
      },
    };

  const deal = input.deals.find((entry) => entry.status === "accepted" && entry.creatorId === creatorId);
  if (deal) {
    const told = deal.copy ? ` What they told you about it: ${deal.copy.slice(0, 220)}` : "";
    return {
      beat: {
        type: "showcase",
        anchorKind: "sponsor",
        anchor: deal.brand,
        line: `A paid partnership: ${deal.brand} pays you to post about ${deal.product}. Work it into your own day, your way, and say it is an ad (#ad).${told}`,
        cast: [],
        place: null,
        ...heat,
        tie: { kind: "sponsor", id: deal.id, brand: deal.brand },
      },
    };
  }

  const couple = slurpCoupleBeat({ ...input, couples: input.couples ?? [] });
  if (couple) return { beat: { ...couple, ...heat } };

  // Occasional: about one ordinary slot in two while a rivalry is on (slice I pace).
  // One post per stage each: a spat is news, not a series.
  const rivalry = input.ties.rivalries.find(
    (entry) =>
      slurpRivalryActive(entry) &&
      (entry.fromId === creatorId || entry.toId === creatorId) &&
      !entry.told.includes(`${creatorId}:${entry.stage}`),
  );
  const rivalId = rivalry ? (rivalry.fromId === creatorId ? rivalry.toId : rivalry.fromId) : null;
  const rival = rivalId ? names.get(rivalId) : undefined;
  if (rivalry && rival && hash(`${rivalry.id}:${creatorId}:${input.sequence}`) % 2 === 0) {
    // The one who was shaded only notices it now and then; the one who started it posts it.
    const quietTarget =
      rivalry.stage === "shade" && rivalry.toId === creatorId && hash(`${rivalry.id}:notice`) % 2 === 1;
    if (!quietTarget)
      return {
        beat: {
          type: rivalry.stage === "cooling" ? "relationship_moment" : "opinion",
          anchorKind: "rival",
          anchor: rival,
          line: rivalLine(rivalry, creatorId, rival),
          cast: [rival],
          place: null,
          ...heat,
          tie: { kind: "rival", id: rivalry.id, partnerId: rivalId! },
        },
      };
  }

  const refused = input.deals.find(
    (entry) => entry.creatorId === creatorId && slurpRefusalWorthAPost(entry, { text: input.creatorText }, input.at),
  );
  if (refused && hash(`${refused.id}:${input.sequence}`) % 2 === 0)
    return {
      beat: {
        type: "opinion",
        anchorKind: "sponsor",
        anchor: refused.brand,
        line: `${refused.brand} offered you a paid post about ${refused.product} and you turned it down, because ${REFUSAL_REASON[refused.decline ?? "offBrand"] ?? REFUSAL_REASON.offBrand}. Say so your way.`,
        cast: [],
        place: null,
        ...heat,
        tie: { kind: "sponsor", id: refused.id, brand: refused.brand, declined: true },
      },
    };
  return null;
}
