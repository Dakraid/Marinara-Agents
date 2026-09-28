import type { DB } from "../../../db/connection.js";
import { logger } from "../../../lib/logger.js";
import { slpStoryPollTally } from "../../../../../shared/src/slp/slp-post-purpose.js";
import { readSlpPollFromMetadata } from "../../../../../shared/src/slp/slp-polls.js";
import type { SlpCreatorSteering } from "../../../../../shared/src/slp/slp-creator-steering.js";
import {
  listSlurpPollVotes,
  listSlurpPurposeComments,
  listSlurpPurposePosts,
  markSlurpPollAnswered,
  type SlurpPurposeRow,
} from "../../data/feed/slp-purpose-storage.js";
import { openSlurpCampaign, type SlurpCampaignStage } from "../../data/feed/slp-campaign-storage.js";
import { SLURP_TEASE_CAMPAIGN_TEMPLATE } from "../../modules/feed/slp-campaign.js";
import type { SlurpCanonAnchors } from "../../modules/feed/slp-post-beat.js";
import {
  slurpPollAnswerDue,
  slurpPollWinner,
  slurpStoryCandidates,
  slurpStoryPoll,
  slurpStoryPurpose,
  type SlurpStoryPurposePlan,
} from "../../modules/feed/slp-post-purpose.js";

/**
 * The read side of post purposes (3b) for the planner. Every function is best effort: a purpose
 * that cannot be read is an ordinary post, never a failed one.
 */

/** The teased drops still to come: a tease campaign whose tease is out and whose drop is planned. */
export function slurpPendingDrops(stages: readonly SlurpCampaignStage[]): { campaignId: string; dropAt: string }[] {
  return stages
    .filter((stage) => stage.kind === "set" && stage.status === "planned")
    .filter((stage) =>
      stages.some(
        (other) =>
          other.campaignId === stage.campaignId &&
          other.kind === "teaser" &&
          other.position < stage.position &&
          other.status === "completed",
      ),
    )
    .map((stage) => ({ campaignId: stage.campaignId, dropAt: stage.dueAt }));
}

/**
 * The tease this slot's campaign stage belongs to (a tease stage, or a drop that was teased): the
 * campaign, when its drop is due, and the tease or drop post once it is up.
 */
export async function slurpCampaignPurposeFacts(
  db: DB,
  creatorAccountId: string,
  stage: SlurpCampaignStage,
  stages: readonly SlurpCampaignStage[],
): Promise<{
  tease?: { campaignId: string; dropAt?: string | null; postId?: string | null };
  drop?: { teasePostId: string | null; title: string | null };
  spiceKind?: string | null;
}> {
  const posts = await listSlurpPurposePosts(db, creatorAccountId).catch(() => [] as SlurpPurposeRow[]);
  const inCampaign = posts.filter((post) => post.purpose?.campaignId === stage.campaignId);
  if (stage.kind === "teaser") {
    const set = stages.find((other) => other.campaignId === stage.campaignId && other.kind === "set");
    const drop = inCampaign.find((post) => post.purpose?.kind === "drop");
    return {
      tease: {
        campaignId: stage.campaignId,
        dropAt: set?.status === "planned" && set.position > stage.position ? set.dueAt : null,
        postId: set?.postId ?? drop?.id ?? null,
      },
    };
  }
  if (stage.kind !== "set") return {};
  const tease = inCampaign.find((post) => post.purpose?.kind === "tease");
  const spice = tease?.metadata.slurpSpice;
  return {
    drop: { teasePostId: tease?.id ?? null, title: tease ? tease.title || tease.content.slice(0, 80) : null },
    spiceKind:
      spice && typeof spice === "object" && typeof (spice as { kind?: unknown }).kind === "string"
        ? (spice as { kind: string }).kind
        : null,
  };
}

/**
 * A free tease promises a drop: it joins a tease whose drop is still to come, or opens a campaign of
 * its own with the drop as the next locked post a few hours after the tease goes up.
 */
export async function openSlurpTease(
  db: DB,
  input: {
    creatorAccountId: string;
    opportunityId: string;
    stages: readonly SlurpCampaignStage[];
    at: Date;
    dueAt?: Date | null;
  },
): Promise<{ campaignId: string; dropAt: string } | null> {
  const waiting = input.stages.find((stage) => stage.kind === "set" && stage.status === "planned");
  if (waiting) return { campaignId: waiting.campaignId, dropAt: waiting.dueAt };
  try {
    const campaignId = await openSlurpCampaign(db, {
      creatorAccountId: input.creatorAccountId,
      opportunityId: input.opportunityId,
      at: input.at,
      dueAt: input.dueAt,
      template: SLURP_TEASE_CAMPAIGN_TEMPLATE,
    });
    const from = (input.dueAt ?? input.at).getTime();
    return { campaignId, dropAt: new Date(from + SLURP_TEASE_CAMPAIGN_TEMPLATE[1]!.delayMs).toISOString() };
  } catch (error) {
    logger.warn(error, "[slurp] Could not open a tease campaign; the tease stands on its own");
    return null;
  }
}

/**
 * The oldest Story poll whose answer is ready, with the option that won (real votes plus the small
 * seeded crowd the viewer shows). Claimed at once unless this is a preview, so two prepared posts
 * never answer the same poll; a retried slot finds it again through its stored beat.
 */
export async function takeSlurpPollAnswer(
  db: DB,
  creatorAccountId: string,
  input: { at: Date; previewOnly?: boolean },
): Promise<{ pollPostId: string; answer: string } | null> {
  try {
    const posts = await listSlurpPurposePosts(db, creatorAccountId);
    const due = posts
      .filter(
        (post) => post.purpose && slurpPollAnswerDue({ createdAt: post.createdAt, purpose: post.purpose }, input.at),
      )
      .at(-1);
    const poll = due ? readSlpPollFromMetadata(due.metadata) : null;
    if (!due || !poll) return null;
    const tally = slpStoryPollTally(
      { postId: due.id, createdAt: due.createdAt, optionCount: poll.options.length },
      await listSlurpPollVotes(db, due),
      input.at,
    );
    const answer = slurpPollWinner(
      poll.options.map((option) => option.label),
      tally,
      due.id,
    );
    if (!answer) return null;
    if (!input.previewOnly) await markSlurpPollAnswered(db, due, input.at);
    return { pollPostId: due.id, answer };
  } catch (error) {
    logger.warn(error, "[slurp] Could not read Story polls; this post is planned on its own");
    return null;
  }
}

/** The job for an automatic Story, from what is really going on for this Creator right now. */
export async function planSlurpStoryPurpose(
  db: DB,
  input: {
    creatorAccountId: string;
    sequence: number;
    stages: readonly SlurpCampaignStage[];
    anchors: SlurpCanonAnchors | null;
    steering: Pick<SlpCreatorSteering, "push" | "avoid"> | null;
    at: Date;
  },
): Promise<SlurpStoryPurposePlan | null> {
  try {
    const posts = await listSlurpPurposePosts(db, input.creatorAccountId);
    const recentFeed = posts.filter((post) => !post.story).slice(0, 6);
    const comments = await listSlurpPurposeComments(
      db,
      input.creatorAccountId,
      recentFeed.map((post) => post.id),
    );
    const candidates = slurpStoryCandidates({
      posts,
      comments,
      drops: slurpPendingDrops(input.stages),
      poll: slurpStoryPoll(input.creatorAccountId, input.sequence, input.anchors, input.steering),
      at: input.at,
    });
    return slurpStoryPurpose(input.creatorAccountId, input.sequence, candidates, input.at);
  } catch (error) {
    logger.warn(error, "[slurp] Could not plan a Story's purpose; it goes up as a moment");
    return null;
  }
}
