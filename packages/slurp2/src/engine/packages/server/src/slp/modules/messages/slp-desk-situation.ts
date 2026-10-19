/**
 * What a Creator's week looks like to the Support desk, so a ticket's topic comes from a real lever
 * (docs/SUPPORT-DESK.md): fewer likes on a fresh post (a Discover feature), a collab that fell
 * through (a suggested collab), and income that dried up (coins). Pure; the desk tick reads the data.
 */
import type { SlpDeskSituation } from "../../../../../shared/src/slp/slp-support-desk.js";

const DAY_MS = 86_400_000;

export type SlpDeskSituationInput = {
  creatorId: string;
  at: Date;
  /** Newest first, as the post storage lists them. */
  posts: readonly { createdAt: string; access: string; likeCount?: number | null }[];
  /** The earnings ledger: signed amounts, so payouts and reversals are skipped here. */
  ledger: readonly { kind: string; amount: number; at: string }[];
  collabs: readonly {
    hostId: string;
    partnerId: string;
    status: string;
    answeredAt: string | null;
    decline: string | null;
  }[];
};

export function slurpDeskSituation(input: SlpDeskSituationInput): SlpDeskSituation {
  const { creatorId, at } = input;
  const now = at.getTime();
  const age = (stamp: string) => now - Date.parse(stamp);

  // Likes stand in for views: the newest posts fall under half of what the older ones got.
  const posts = input.posts.filter((post) => post.access !== "draft");
  const fresh = posts.filter((post) => age(post.createdAt) < 3 * DAY_MS);
  const older = posts.filter((post) => age(post.createdAt) >= 3 * DAY_MS);
  const likes = (list: typeof posts) => list.reduce((sum, post) => sum + (post.likeCount ?? 0), 0) / list.length;
  const viewsDown = fresh.length > 0 && older.length >= 3 && likes(older) >= 5 && likes(fresh) < likes(older) / 2;

  // Income of the last week against the week before it.
  const income = (from: number, to: number) =>
    input.ledger
      .filter((entry) => entry.amount > 0 && entry.kind !== "payout" && entry.kind !== "reversal")
      .filter((entry) => age(entry.at) >= from * DAY_MS && age(entry.at) < to * DAY_MS)
      .reduce((sum, entry) => sum + entry.amount, 0);
  const before = income(7, 14);
  const moneyDown = before > 0 && income(0, 7) < before / 2;

  // A collab that fell through lately, and none open: they still want one.
  const mine = input.collabs.filter((collab) => collab.hostId === creatorId || collab.partnerId === creatorId);
  const hasCollabWish =
    !mine.some((collab) => ["asked", "agreed", "planned"].includes(collab.status)) &&
    mine.some(
      (collab) =>
        collab.status === "declined" &&
        (collab.decline === "busy" || collab.decline === "noAnswer") &&
        collab.answeredAt !== null &&
        age(collab.answeredAt) < 14 * DAY_MS,
    );
  return { viewsDown, hasCollabWish, moneyDown };
}
