/**
 * The Support desk's part of the world clock (docs/SUPPORT-DESK.md). For every Creator: suspicion
 * fades, the risk of being caught is rolled, challenges and the contract are counted, the leave
 * countdown runs, and a Creator may write in with a ticket. Slurp's notices go out (milestones,
 * results), and AI Support writes to the Creators the player runs.
 *
 * Free tier: nothing here calls the model. A Creator's line starts as a template and is rewritten in
 * their voice when the player is here (`slp-pending-text-service.ts`, kind "desk").
 */
import type { DB } from "../../../../db/connection.js";
import { logger } from "../../../../lib/logger.js";
import { newId } from "../../../../utils/id-generator.js";
import { createSlurpStorage } from "../../../data/slp-storage.js";
import { createSlurpPopulationStorage } from "../../../data/audience/slp-audience-storage-funnel.js";
import { updateSlurpSupportDesk } from "../../../data/creators/slp-support-desk-storage.js";
import { countSlurpDeskPublished } from "../../../data/creators/slp-support-desk-counts.js";
import { appendSlurpDeskLine } from "../../../data/messages/slp-support-desk-thread.js";
import { enqueueSlurpPendingText } from "../../world/slp-world-contract.js";
import { slurpDeskOfferSummary } from "../../../modules/messages/slp-support-desk-talk.js";
import { isSlurpViewerActorAccount } from "../../../modules/settings/slp-settings.js";
import {
  SLP_DESK_STAY_AT,
  slpDeskAdjust,
  slpDeskAttitudeFor,
  slpDeskGrantPerk,
  slpDeskPerkLine,
  slpDeskSeed,
  slpDeskTick,
  type SlpDeskTickEvent,
  type SlpDeskTicketTopic,
  type SlpSupportDesk,
} from "../../../../../../shared/src/slp/slp-support-desk.js";

const DAY_MS = 86_400_000;
const MILESTONES = [100, 500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000];

/** What a Creator writes in about, before it is rewritten in their voice. */
const TICKET_LINES: Record<SlpDeskTicketTopic, { topic: string; line: string }> = {
  views: { topic: "Views dropped", line: "Hi Slurp Support. My views dropped a lot lately. Did something change?" },
  fan: { topic: "A fan is too much", line: "Hi Slurp Support. There is a fan who is getting to be a lot. What can I do?" },
  badge: { topic: "Wants a badge", line: "Hi Slurp Support. How do I get verified on Slurp?" },
  collab: { topic: "Wants a collab", line: "Hi Slurp Support. Can Slurp help me find someone to collab with?" },
  money: { topic: "Earnings", line: "Hi Slurp Support. My earnings are lower than I expected. Can you look at it?" },
  burnout: { topic: "Tired", line: "Hi Slurp Support. Honestly, I am tired. Is there any way to take it easier?" },
};

async function creatorLine(db: DB, creatorAccountId: string, content: string, metadata: Record<string, unknown>) {
  const id = `desk:${newId()}`;
  const line = await appendSlurpDeskLine(db, creatorAccountId, { as: "creator", id, content, metadata });
  if (line) await enqueueSlurpPendingText(db, { kind: "desk", subjectId: line.id, creatorAccountId });
  return line;
}

const notice = (db: DB, creatorAccountId: string, content: string, metadata: Record<string, unknown> = {}) =>
  appendSlurpDeskLine(db, creatorAccountId, { as: "notice", content, metadata });

/** Carry out what one tick decided for one Creator. */
async function applyEvents(
  db: DB,
  creator: { id: string; displayName: string },
  events: SlpDeskTickEvent[],
  desk: SlpSupportDesk,
  settings: Awaited<ReturnType<ReturnType<typeof createSlurpStorage>["getSettings"]>>["supportDesk"],
  at: Date,
): Promise<SlpSupportDesk> {
  const storage = createSlurpStorage(db);
  let next = desk;
  const name = creator.displayName;
  for (const event of events) {
    switch (event.kind) {
      case "caught": {
        next = {
          ...next,
          ticket: { id: newId(), kind: "caught", topic: "Caught Slurp playing them", status: "open", openedBy: "creator", openedAt: at.toISOString(), resolvedAt: null, rating: null },
        };
        await creatorLine(db, creator.id, "Slurp Support, I know what you did. That was not okay.", { deskTicket: "caught" });
        break;
      }
      case "leave-warning": {
        next = {
          ...next,
          ticket: { id: newId(), kind: "leaving", topic: "Thinking about leaving Slurp", status: "open", openedBy: "creator", openedAt: at.toISOString(), resolvedAt: null, rating: null },
        };
        await creatorLine(db, creator.id, "I am thinking about leaving Slurp. Give me one reason to stay.", { deskTicket: "leaving" });
        break;
      }
      case "won-back":
        await notice(db, creator.id, `Slurp: ${name} decided to stay on Slurp.`);
        break;
      case "left": {
        const account = await storage.getNoodlerAccountById(creator.id);
        const wasPosting = account?.settings.scheduler.autoPosting?.enabled === true;
        if (wasPosting) await storage.bulkUpdateCreatorProfiles([creator.id], { autoPosting: false });
        next = { ...next, pausedAutoPosting: wasPosting };
        await notice(db, creator.id, `Slurp: ${name} left Slurp.`, { deskLeft: true });
        break;
      }
      case "challenge-won": {
        next = slpDeskGrantPerk(next, event.challenge.reward, settings, at);
        if (event.challenge.reward.kind === "coins")
          await storage.creditSponsorFee(creator.id, event.challenge.reward.coins ?? 0, "Slurp challenge", `desk:challenge:${event.challenge.id}`);
        if (settings.noticeResults)
          await notice(db, creator.id, `Slurp: ${name} won the challenge. ${slpDeskPerkLine(event.challenge.reward).replace(/^Got/u, "Reward:")}.`);
        break;
      }
      case "challenge-failed":
        next = slpDeskAdjust(next, { trust: -2, text: "Failed a Slurp challenge" }, settings, at);
        if (settings.noticeResults) await notice(db, creator.id, `Slurp: ${name} did not finish the challenge in time.`);
        break;
      case "contract-kept":
        if (event.contract.weeklyBonus > 0)
          await storage.creditSponsorFee(creator.id, event.contract.weeklyBonus, "Slurp contract", `desk:contract:${event.contract.id}:${event.contract.weekStart}`);
        if (settings.noticeResults)
          await notice(db, creator.id, `Slurp: ${name} kept the contract this week (${event.contract.weeklyBonus} coins).`);
        break;
      case "contract-broken":
        if (settings.noticeResults) await notice(db, creator.id, `Slurp: ${name} missed the contract this week. No bonus.`);
        break;
      case "contract-ended":
        if (settings.noticeResults) await notice(db, creator.id, `Slurp: ${name}'s contract has ended.`);
        break;
      case "ticket": {
        const { topic, line } = TICKET_LINES[event.topic];
        next = {
          ...next,
          ticket: { id: newId(), kind: "help", topic, status: "open", openedBy: "creator", openedAt: at.toISOString(), resolvedAt: null, rating: null },
        };
        await creatorLine(db, creator.id, line, { deskTicket: event.topic });
        break;
      }
    }
  }
  return next;
}

/** Slurp's milestone notice, once per step. */
async function milestoneNotice(db: DB, creator: { id: string; displayName: string }, desk: SlpSupportDesk, followers: number) {
  const reached = MILESTONES.filter((step) => followers >= step).at(-1);
  if (!reached || desk.noticed.includes(`milestone:${reached}`)) return desk;
  await notice(db, creator.id, `Slurp: ${creator.displayName} reached ${reached.toLocaleString("en")} followers.`, { deskMilestone: reached });
  return { ...desk, noticed: [...desk.noticed, `milestone:${reached}`].slice(-40) };
}

/**
 * AI Support writes to a Creator the player runs: now and then an offer (a challenge with a reward),
 * which the player answers as that Creator. With "games" on, now and then a quiet throttle.
 */
async function supportToYourCreator(
  db: DB,
  creator: { id: string; displayName: string },
  desk: SlpSupportDesk,
  settings: Awaited<ReturnType<ReturnType<typeof createSlurpStorage>["getSettings"]>>["supportDesk"],
  elapsedMs: number,
  at: Date,
): Promise<SlpSupportDesk> {
  const chance = (perDay: number) => Math.random() < 1 - Math.pow(1 - perDay, elapsedMs / DAY_MS);
  let next = desk;
  if (chance(0.25) && !next.challenges.some((entry) => entry.status === "active")) {
    const input = {
      accountId: creator.id,
      metric: "stories" as const,
      count: 3,
      days: 7,
      reward: { perk: "feature" as const, days: 2 },
    };
    await appendSlurpDeskLine(db, creator.id, {
      as: "support",
      content: `Hi ${creator.displayName}! Slurp Support here. Post 3 Stories this week and we will feature you on Discover for 2 days. Deal?`,
      metadata: {
        deskOffer: { action: "set-challenge", input, summary: slurpDeskOfferSummary("set-challenge", input), status: "pending" },
      },
    });
  }
  if (settings.gamesWithYourCreators && settings.shadyMoves && chance(0.08) && !next.throttle) {
    next = { ...next, throttle: { until: new Date(at.getTime() + 2 * DAY_MS).toISOString(), factor: 0.6 } };
  }
  return next;
}

// ponytail: one pass per 30 minutes in-process; a stored "last desk pass" if several processes share a DB.
let lastPassMs = 0;
const PASS_MS = 30 * 60_000;

/**
 * One pass of the desk for every Creator, at most every half hour (the risk and the ticket chance
 * scale with the time since a Creator's last pass, so the pace does not change the odds). Each
 * Creator's pass runs inside that desk's own update, so a play at the same moment waits its turn.
 */
export async function advanceSlurpSupportDesk(db: DB, at = new Date()): Promise<void> {
  if (at.getTime() - lastPassMs < PASS_MS) return;
  lastPassMs = at.getTime();
  const storage = createSlurpStorage(db);
  const settings = (await storage.getSettings()).supportDesk;
  const accounts = (await storage.listNoodlerAccounts()).filter((account) => !isSlurpViewerActorAccount(account));
  const followers = await createSlurpPopulationStorage(db)
    .countFollowersForCreators(accounts.map((account) => account.id))
    .catch(() => new Map<string, number>());
  for (const account of accounts) {
    await updateSlurpSupportDesk(db, account.id, async (before) => {
      const yours = account.sourceKind === "persona";
      const elapsed = before.tickedAt ? Math.max(0, Math.min(7 * DAY_MS, at.getTime() - Date.parse(before.tickedAt))) : 0;
      let desk = before.seededAt ? before : slpDeskSeed(before, { signedUpBySupport: false, at });
      if (!desk.attitude) desk = { ...desk, attitude: slpDeskAttitudeFor(`${account.displayName} ${account.bio ?? ""}`, account.id) };
      // Won back after leaving: a perk (or a talk) lifted trust again.
      if (desk.pausedAt && desk.trust > SLP_DESK_STAY_AT) {
        if (desk.pausedAutoPosting) await storage.bulkUpdateCreatorProfiles([account.id], { autoPosting: true });
        desk = { ...desk, pausedAt: null, pausedAutoPosting: false };
        await notice(db, account.id, `Slurp: ${account.displayName} is back on Slurp.`);
      }
      const needsCounts = desk.challenges.some((entry) => entry.status === "active") || desk.contract?.status === "active";
      const ticked = slpDeskTick(desk, {
        at,
        // The player's own Creators never catch Slurp, leave or write tickets: the player is them.
        settings: yours
          ? { ...settings, tickets: "off", leaving: false, shadyMoves: settings.gamesWithYourCreators && settings.shadyMoves }
          : settings,
        counts: needsCounts ? await countSlurpDeskPublished(db, account.id) : { posts: 0, stories: 0 },
        rolls: [Math.random(), Math.random(), Math.random()],
      });
      desk = await applyEvents(db, account, ticked.events, ticked.desk, settings, at);
      if (settings.noticeMilestones) desk = await milestoneNotice(db, account, desk, followers.get(account.id) ?? 0);
      if (yours && settings.toYourCreators && elapsed > 0) desk = await supportToYourCreator(db, account, desk, settings, elapsed, at);
      return desk;
    }).catch((error: unknown) => logger.warn(error, "[slurp-desk] Tick failed for %s", account.id));
  }
}
