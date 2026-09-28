/**
 * 7c messages review fixes (REVIEW-MSG M-002 …). The rules run on real inputs; a few wiring checks
 * at the end keep the guards on the paths that use them (the storage layer needs the Engine DB).
 */
import assert from "node:assert/strict";
import {
  newSlurpCouple,
  slurpCloseCouplePage,
  slurpClosedCouplePageIds,
  slurpIsCouplePage,
  slurpOpenCouplePage,
  SLURP_COUPLE_PAGE_SOURCE,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/projects/slp-creator-couples.ts";
import {
  slurpCommissionDeliveryDelayMs,
  slurpUnscheduledCommissionDeliveries,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-messaging.ts";
import { slurpAssistChatContext } from "../packages/slurp2/src/engine/packages/client/src/slp/features/messages/slp-assist-chat-context.ts";
import { buildSlpAssistTextMessages } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/assist/slp-assist-prompt.ts";
import { slurp2Source } from "./slurp2-source.ts";

const root = new URL("../packages/slurp2/src/engine/packages/", import.meta.url);
const server = (path: string) => slurp2Source(new URL(`server/src/slp/${path}`, root));
const client = (path: string) => slurp2Source(new URL(`client/src/slp/${path}`, root));
const T0 = Date.parse("2026-09-28T08:00:00.000Z");
const at = (days: number) => new Date(T0 + days * 86_400_000);

// M-002 / M-003. A shared couple page is not a person, and a closed one takes nothing new.
{
  assert.equal(slurpIsCouplePage({ sourceEntityId: `${SLURP_COUPLE_PAGE_SOURCE}c1` }), true);
  assert.equal(slurpIsCouplePage({ sourceEntityId: "character-42" }), false);
  assert.equal(slurpIsCouplePage({ sourceEntityId: null }), false);
  assert.equal(slurpIsCouplePage({}), false);

  const together = newSlurpCouple("c1", "mira", "kai", "player", at(0).toISOString(), "together");
  const open = slurpOpenCouplePage(together, "page-mk", at(1));
  const other = slurpOpenCouplePage(
    newSlurpCouple("c2", "zoe", "sam", "world", at(0).toISOString(), "together"),
    "page-zs",
    at(1),
  );
  assert.deepEqual([...slurpClosedCouplePageIds([open, other])], [], "open pages are not closed");
  const closed = slurpCloseCouplePage(open, at(5));
  assert.deepEqual([...slurpClosedCouplePageIds([closed, other])], ["page-mk"]);
  // "Open a page" reopens the same page: it takes subscribers again.
  const reopened = slurpOpenCouplePage(closed, "page-mk", at(9));
  assert.deepEqual([...slurpClosedCouplePageIds([reopened, other])], []);
  assert.deepEqual([...slurpClosedCouplePageIds([together])], [], "a couple with no page has none");
}

// M-002 wiring: every chat into a couple page stops in openThread (send, tip, share, commission,
// AI fan opener all open through it); the new-chat list and payment thanks leave the page out;
// a closed page refuses tips, subscriptions and unlocks; the profile's Message asks which partner.
{
  const base = server("data/messages/slp-messages-storage-base.ts");
  assert.match(base, /if \(slurpIsCouplePage\(creator\)\) return \{ status: "closed", reason: "couple_page" \};/u);
  const send = server("features/messages/slp-messages-send-routes.ts");
  assert.equal(send.match(/slurpClosedThreadText\((opened|sent)\)/gu)?.length, 3, "send, tip and share explain it");
  assert.match(
    server("features/messages/slp-messages-thread-routes.ts"),
    /filter\(\(profile\) => !couplePages\.has\(profile\.id\)\)/u,
  );
  assert.match(server("features/economy/slp-payment-reaction.ts"), /slurpIsCouplePage\(creator\)\) return;/u);
  const wallet = server("features/economy/slp-wallet-routes.ts");
  assert.equal(wallet.match(/if \(await closedPage\([^)]*\)\) return reply\.code\(409\)/gu)?.length, 4);
  assert.match(
    client("app/screens/SlpScreenProfile.tsx"),
    /couplePage \? \{ \.\.\.model, onOpenMessages: \(\) => setCoupleWriteOpen\(true\) \}/u,
  );
  assert.match(client("features/projects/SlpCouples.tsx"), /export function SlpCouplePageWriteSheet/u);
}

// M-005. Paid commissions of automatic Creators always get a delivery time; the two stuck prod rows
// (accepted by an AI fan days ago, no delivery time) are due at once on the next tick.
{
  const now = new Date("2026-09-28T04:00:00.000Z");
  const row = (id: string, over: Partial<Parameters<typeof slurpUnscheduledCommissionDeliveries>[0][number]> = {}) => ({
    id,
    creatorAccountId: "sadie",
    state: "accepted",
    deliverAt: null,
    price: 34,
    brief: "a cozy sketch of you reading",
    updatedAt: "2026-09-26T11:20:00.000Z",
    ...over,
  });
  const automatic = new Set(["sadie", "jennifer"]);
  const rows = [
    row("B-hoIi"),
    row("GVO--g", { creatorAccountId: "jennifer", price: 65, updatedAt: "2026-09-27T18:05:00.000Z" }),
    row("hand-run", { creatorAccountId: "persona-page" }),
    row("scheduled", { deliverAt: "2026-09-28T04:20:00.000Z" }),
    row("delivered", { state: "delivered" }),
    row("quoted", { state: "quoted" }),
    // Just accepted by the player: the accept route may still be drawing it.
    row("fresh", { updatedAt: "2026-09-28T03:55:00.000Z" }),
    // Accepted 20 minutes ago by an AI fan: due at the accept + the usual pacing, not at once.
    row("recent", { updatedAt: "2026-09-28T03:40:00.000Z", price: 200, brief: "x".repeat(600) }),
  ];
  const repairs = slurpUnscheduledCommissionDeliveries(rows, automatic, now);
  assert.deepEqual(
    repairs.map((entry) => entry.id),
    ["B-hoIi", "GVO--g", "recent"],
  );
  assert.equal(repairs[0]!.deliverAt, now.toISOString(), "an old paid commission is due at once");
  assert.equal(repairs[1]!.deliverAt, now.toISOString());
  const recentDue =
    Date.parse("2026-09-28T03:40:00.000Z") + slurpCommissionDeliveryDelayMs({ price: 200, briefLength: 600 });
  assert.equal(repairs[2]!.deliverAt, new Date(recentDue).toISOString(), "the usual pacing, counted from the accept");
  assert.ok(recentDue > now.getTime());
  // Once scheduled it is never listed again.
  assert.deepEqual(
    slurpUnscheduledCommissionDeliveries(
      rows.map((entry) => ({
        ...entry,
        deliverAt: repairs.find((r) => r.id === entry.id)?.deliverAt ?? entry.deliverAt,
      })),
      automatic,
      now,
    ),
    [],
  );
  const world = server("features/world/slp-world-operation.ts");
  assert.match(
    world,
    /slurpUnscheduledCommissionDeliveries\(\s*await messages\.listAcceptedCommissions\(\),\s*automatedCreatorIds,/u,
  );
  assert.match(world, /scheduleCommissionDelivery\(repair\.id, \{ deliverAt: repair\.deliverAt, mediaPath: null \}\)/u);
  assert.match(
    server("features/messages/commissions/slp-commission-delivery-service.ts"),
    /if \(mediaPath\) \{/u,
    "a text-only delivery skips the picture",
  );
}

// M-004. "Help me write" in a DM sees the chat, from the right seat, in the chat's language.
{
  const msg = (role: "viewer" | "creator", content: string, over: Record<string, unknown> = {}) => ({
    role,
    kind: "text" as const,
    content,
    price: 0,
    metadata: {} as Record<string, unknown>,
    ...over,
  });
  const german = [
    msg("viewer", "Hey Jennifer, dein letzter Post war der Wahnsinn"),
    msg("creator", "Danke dir!! Freut mich total 🥹"),
    msg("viewer", "[paid 30 coins for a commission]", { metadata: { paymentReaction: "commission" } }),
    msg("viewer", "Kannst du mir was Exklusives schicken?"),
  ];
  const persona = slurpAssistChatContext({
    messages: german,
    seat: "persona",
    creatorName: "Jennifer Kipsch",
    viewerName: "Gunter",
    supportName: "Slurp Support",
  });
  assert.equal(
    persona,
    [
      "You write as Gunter to Jennifer Kipsch, a Creator on Slurp.",
      "The chat so far (newest last). The newest line is your own and has no answer yet: write a follow-up, in the language of the chat.",
      "Gunter: Hey Jennifer, dein letzter Post war der Wahnsinn",
      "Jennifer Kipsch: Danke dir!! Freut mich total 🥹",
      "(Gunter paid 30 coins for a commission)",
      "Gunter: Kannst du mir was Exklusives schicken?",
    ].join("\n"),
  );
  const creator = slurpAssistChatContext({
    messages: german,
    seat: "creator",
    creatorName: "Jennifer Kipsch",
    viewerName: "Gunter",
    supportName: "Slurp Support",
  });
  assert.match(
    creator,
    /^You write as Jennifer Kipsch, a Creator on Slurp, to Gunter\.\nThe chat so far \(newest last\)\. Answer the newest line/u,
  );
  // Support: its own lines carry the Support name; the Creator's newest line is answered as staff.
  const support = slurpAssistChatContext({
    messages: [
      msg("viewer", "Hi Mira, quick check-in from the Slurp team.", {
        metadata: { sceneSpeaker: "Pia from Slurp", supportVoice: true },
      }),
      msg("creator", "oh hi! all good, a bit tired tbh"),
    ],
    seat: "support",
    creatorName: "Mira Vale",
    viewerName: null,
    supportName: "Pia from Slurp",
  });
  assert.match(support, /^You write as Pia from Slurp, Slurp's own staff, to Mira Vale/u);
  assert.match(support, /Pia from Slurp: Hi Mira[\s\S]*Mira Vale: oh hi![\s\S]*$/u);
  assert.match(support, /Answer the newest line/u);
  // Only the newest 8 lines, and under the assist's context limit however long the chat is.
  const long = Array.from({ length: 30 }, (_, i) => msg(i % 2 ? "creator" : "viewer", `line ${i} ${"x".repeat(400)}`));
  const clipped = slurpAssistChatContext({
    messages: long,
    seat: "persona",
    creatorName: "Mira",
    viewerName: "Lena",
    supportName: "Slurp Support",
  });
  assert.ok(clipped.length <= 2000, `context fits: ${clipped.length}`);
  assert.match(clipped, /line 29/u);
  assert.doesNotMatch(clipped, /line 21 /u);
  assert.match(
    slurpAssistChatContext({
      messages: [],
      seat: "persona",
      creatorName: "Mira",
      viewerName: null,
      supportName: "Slurp Support",
    }),
    /^You write to Mira, a Creator on Slurp\.\nNothing has been said yet/u,
  );
  // The prompt: the chat reaches the model, and Support is never written as a fan.
  const [system, user] = buildSlpAssistTextMessages({
    mode: "write",
    field: "support",
    context: support,
    name: "Mira Vale",
  });
  assert.match(system!.content, /Write it as Slurp Support, Slurp's own staff team, to Mira Vale/u);
  assert.doesNotMatch(system!.content, /as a fan would/u);
  assert.match(user!.content, /# Nearby\nYou write as Pia from Slurp/u);
  const [dmSystem, dmUser] = buildSlpAssistTextMessages({
    mode: "write",
    field: "dm",
    context: persona,
    name: "Jennifer Kipsch",
  });
  assert.match(dmSystem!.content, /Use the language of the chat/u);
  assert.match(dmUser!.content, /Kannst du mir was Exklusives schicken\?/u);
}

console.log("slurp2 7c fixes regression passed");
