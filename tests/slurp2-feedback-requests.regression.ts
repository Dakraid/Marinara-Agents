/** October 2026 Discord requests (packages/slurp2/docs/FEEDBACK-2026-10.md, R1-R11). */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { slurpCommissionBrief } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/world/slp-world-copy.ts";
import { SLURP_COMMISSION_ASKS } from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-world.ts";

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
