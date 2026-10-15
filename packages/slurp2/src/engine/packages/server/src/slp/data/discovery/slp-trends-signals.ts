/**
 * What happened to one Creator's latest posts, for the trend detector: likes, replies, the player's own
 * likes, unlocks and tips. Read-only. A failed read means no trend from this Creator, never a failed tick.
 */
import type { DB } from "../../../db/connection.js";
import { inArray } from "../../../db/file-query.js";
import { slpPostUnlocks } from "../../../db/schema/slurp.js";
import { logger } from "../../../lib/logger.js";
import type { SlurpTrendPost } from "../../modules/discovery/slp-trends.js";
import { createSlurpStorage } from "../slp-storage.js";

const POSTS = 10;

export async function readSlurpTrendPosts(
  db: DB,
  accountId: string,
  playerIds: ReadonlySet<string>,
): Promise<SlurpTrendPost[]> {
  try {
    const storage = createSlurpStorage(db);
    const posts = (await storage.listNoodlerPostsByAccount(accountId, POSTS)).filter((post) => post.access !== "draft");
    if (!posts.length) return [];
    const ids = posts.map((post) => post.id);
    const [interactions, unlocks, earnings] = await Promise.all([
      storage.listNoodlerInteractions(ids),
      db.select().from(slpPostUnlocks).where(inArray(slpPostUnlocks.postId, ids)),
      storage.getEarnings(accountId),
    ]);
    const tipTimes = earnings.ledger.filter((entry) => entry.kind === "tip").map((entry) => Date.parse(entry.at));
    return posts.map((post, index) => {
      // A tip is not tied to a post: it counts for the post that was newest when it came in.
      const from = Date.parse(post.createdAt);
      const until = index > 0 ? Date.parse(posts[index - 1]!.createdAt) : Number.POSITIVE_INFINITY;
      const mine = interactions.filter((entry) => entry.postId === post.id);
      const likes = mine.filter((entry) => entry.type === "like");
      const spice = (post.metadata as Record<string, unknown> | null | undefined)?.slurpSpice;
      return {
        id: post.id,
        createdAt: post.createdAt,
        access: post.access,
        title: post.title,
        likes: likes.length,
        replies: mine.filter((entry) => entry.type === "reply" && entry.actorAccountId !== accountId).length,
        playerLikes: likes.filter((entry) => entry.actorAccountId !== accountId && playerIds.has(entry.actorAccountId))
          .length,
        unlocks: unlocks.filter((row) => String((row as { postId: string }).postId) === post.id).length,
        tips: tipTimes.filter((time) => time >= from && time < until).length,
        spicy: Boolean(spice && typeof spice === "object"),
      };
    });
  } catch (error) {
    logger.warn(error, "[slurp] Could not read a Creator's posts for trends");
    return [];
  }
}
