/** October 2026 Discord requests (packages/slurp2/docs/FEEDBACK-2026-10.md, R1-R11). */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { slurpCommissionBrief } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/world/slp-world-copy.ts";
import { SLURP_COMMISSION_ASKS } from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-world.ts";
import {
  slurpThreadSummaryMessages,
  slurpThreadTranscript,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-thread-export.ts";
import {
  slurpLastAnswer,
  slurpMessageEditable,
  slurpMessageRemovable,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-message-edit.ts";

const client = join(import.meta.dirname, "..", "packages/slurp2/src/engine/packages/client/src/slp");
const src = (path: string) => readFileSync(join(client, path), "utf8");

// ── R7: the player edits what the fan wants in a commission request ──
assert.ok(
  SLURP_COMMISSION_ASKS.some((ask) => slurpCommissionBrief("seed").includes(ask)),
  "built-in asks by default",
);
assert.match(slurpCommissionBrief("seed", ["Hi."], ["a tiny frog"]), /^Hi\. a tiny frog /u, "own asks win");
const server = join(client, "../../../server/src/slp");
assert.match(
  readFileSync(join(server, "features/world/slp-world-actions.ts"), "utf8"),
  /settings\.messagesCommissionOpeners,\s*settings\.messagesCommissionAsks,/u,
);

// A no-limit Collect sends the whole balance, so the route must not cap the amount.
assert.doesNotMatch(
  readFileSync(join(server, "features/economy/slp-wallet-routes.ts"), "utf8"),
  /payout[\s\S]{0,300}amount: z\.number\(\)\.int\(\)\.min\(1\)\.max\(/u,
);

// ── R11: tapping an ad showed nothing ──
// Every ad tap (the button, the picture, a wall tile) opens the ad sheet and still records the tap.
const ad = src("features/ads/SlpInlineAd.tsx");
assert.equal(ad.match(/<SlurpAdSheet promotion=\{promotion\} open=\{open\}/gu)?.length, 2, "list card and wall tile");
assert.match(ad, /const show = \(\) => \{\s*setOpen\(true\);\s*onAction\(\);/u);
assert.match(ad, /<SlpButton variant="secondary" onClick=\{show\}/u);
assert.match(ad, /<button\s+type="button"\s+onClick=\{show\}/u, "the picture opens it too");
assert.match(ad, /onClick=\{\(\) => \{\s*setOpen\(true\);\s*onAction\(\);\s*\}\}/u, "wall tile");
// The old "Opening … promotion" toast promised a page that did not exist.
assert.doesNotMatch(src("app/screens/SlpScreenHub.tsx"), /ui\.slurp\.ads\.opened/u);
for (const lang of ["en", "de", "ko", "pl"]) {
  const strings = JSON.parse(src(`locales/${lang}.json`)) as Record<string, string>;
  for (const feel of ["budget", "everyday", "premium"])
    assert.ok(strings[`ui.slurp.ads.price.${feel}`], `${lang} ${feel}`);
  assert.equal(strings["ui.slurp.ads.opened"], undefined, lang);
}

// ── R9: edit and delete DMs, and have the Creator write the last answer again ──
const msg = (id: string, role: "viewer" | "creator", kind = "text", price = 0) => ({ id, role, kind, price });
assert.equal(slurpMessageEditable(msg("a", "viewer"), "viewer"), true);
assert.equal(slurpMessageEditable(msg("a", "creator"), "viewer"), false, "only your own words");
assert.equal(slurpMessageEditable(msg("a", "creator"), "creator"), true, "the Creator's owner writes as them");
assert.equal(slurpMessageRemovable(msg("t", "viewer", "tip", 5)), false, "money stays");
assert.equal(slurpMessageRemovable(msg("p", "creator", "ppv", 20)), false);
assert.equal(slurpMessageRemovable(msg("q", "creator", "commission_quote")), false);
assert.equal(slurpMessageRemovable(msg("x", "creator")), true);
// A commission or scene record is a system line with no price: it still stays.
const system = (metadata: Record<string, unknown>) => ({ ...msg("s", "creator", "system"), metadata });
assert.equal(slurpMessageRemovable(system({ commissionId: "c1" })), false, "commission steps stay");
assert.equal(slurpMessageRemovable(system({ scene: { id: "x" } })), false, "scene cards stay");
assert.equal(slurpMessageRemovable(system({})), true);
assert.equal(slurpLastAnswer([msg("1", "viewer"), system({ commissionId: "c1" })]), null);
assert.deepEqual(slurpLastAnswer([msg("1", "viewer"), msg("2", "creator"), msg("3", "creator")]), ["2", "3"]);
assert.equal(slurpLastAnswer([msg("1", "viewer")]), null, "no answer yet");
assert.equal(slurpLastAnswer([msg("1", "creator")]), null, "nothing to answer");
assert.equal(slurpLastAnswer([msg("1", "viewer"), msg("2", "creator", "ppv", 9)]), null, "a paid answer stays");
const editRoutes = readFileSync(join(server, "features/messages/slp-message-edit-routes.ts"), "utf8");
assert.match(
  editRoutes,
  /hasPending\(threadId\)\)\s*return reply\.code\(409\)[\s\S]*?deleteSlurpMessages\(app\.db, threadId, answer\)[\s\S]*?force: true/u,
);
// Every write is locked while the thread is in a scene; the lock only wraps POST routes.
const lock = readFileSync(join(server, "features/messages/scenes/slp-roleplay-scene-lock.ts"), "utf8");
for (const path of [...editRoutes.matchAll(/app\.(\w+)\("([^"]+)"/gu)]) {
  assert.equal(path[1], "post", path[2]);
  assert.ok(lock.includes(`"${path[2]}"`), path[2]);
}
// Deleting removes only the claims of the deleted messages: another trigger's claim is what stops a
// second answer to it. Deleting the fan's newest line drops the answer owed to it.
const editStorage = readFileSync(join(server, "data/messages/slp-message-edit-storage.ts"), "utf8");
assert.match(
  editStorage,
  /delete\(slurpMessageClaims\)[\s\S]*?or\(inArray\(slurpMessageClaims\.triggerMessageId, gone\), inArray\(slurpMessageClaims\.replyMessageId, gone\)\)/u,
);
assert.doesNotMatch(
  editStorage,
  /delete\(slurpMessageClaims\)\.where\(eq\(slurpMessageClaims\.threadId, threadId\)\)/u,
);
assert.match(
  editStorage,
  /if \(owed && gone\.includes\(String\(owed\.id\)\)\)[\s\S]*?delete\(slurpReplyBubbles\)[\s\S]*?generationEpoch/u,
);
// "Write it again" that could not write leaves the answer owed, never a thread without one.
assert.match(editRoutes, /if \(outcome\.status !== "replied"\) await oweSlurpReplyAgain\(app\.db, threadId\);/u);

// ── R10: a DM thread as text, or a summary, to paste into a lorebook ──
const row = (role: "viewer" | "creator", content: string, extra: Record<string, unknown> = {}) => ({
  role,
  kind: "text",
  content,
  imageUrl: null,
  createdAt: "2026-10-06T12:34:56.000Z",
  senderSnapshot: {},
  ...extra,
});
const names = { viewer: "Gunter", creator: "Riley" };
assert.equal(
  slurpThreadTranscript(
    [
      row("viewer", "hey"),
      row("creator", "hi you", { senderSnapshot: { displayName: "Riley Vale" } }),
      row("creator", "", { kind: "ppv" }),
      row("creator", "  "),
    ],
    names,
  ),
  "[2026-10-06 12:34] Gunter: hey\n[2026-10-06 12:34] Riley Vale: hi you\n[2026-10-06 12:34] Riley: [locked picture]",
);
const summaryPrompt = slurpThreadSummaryMessages("x".repeat(200_000), names);
assert.ok(summaryPrompt[1]!.content.length <= 120_000, "the newest part of a long thread");
assert.match(summaryPrompt[0]!.content, /Gunter and Riley/u);
// Each side reads what it may see: the fan's copy goes through the same mask as the thread.
assert.match(
  readFileSync(join(server, "features/messages/slp-thread-export-routes.ts"), "utf8"),
  /side === "viewer" \? maskForViewer\(message\) : message/u,
);

// ── R8: a Creator answering a comment knows the commenter from DMs ──
const replies = readFileSync(join(server, "features/messages/slp-reply-generation-service.ts"), "utf8");
assert.match(
  replies,
  /return `\$\{line\}\$\{await describeCommenterDms\(db, creatorAccountId, viewerId, viewerName\)\}`;/u,
);
assert.match(
  replies,
  /dms\.getThread\(viewerId, creatorAccountId\)[\s\S]*?describeSlurpRapport\(await dms\.rapportFor/u,
);
assert.match(replies, /Do not quote private DMs in public/u);
// DM lines can name a protected identity, so the relationship line is redacted like the comment.
assert.match(replies, /relationship: protect\(input\.relationship \?\? "no history with this creator yet"\)/u);

console.log("slurp2 feedback requests regression passed");
