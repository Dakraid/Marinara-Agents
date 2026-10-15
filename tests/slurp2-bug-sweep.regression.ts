import assert from "node:assert/strict";
import { slpCutAtBoundary } from "../packages/slurp2/src/engine/packages/server/src/slp/base/prompting/slp-prompt-safety";
import { slurpCommissionPriceRange, slurpCommissionQuote } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/economy/slp-creator-pricing";
import { slurpCoupleFit, slurpCoupleKin } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/projects/slp-couple-fit";
import { slurpSetUpCouple } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/projects/slp-creator-couples";
import { slurp2Source } from "./slurp2-source.ts";

const server = (path: string) => slurp2Source(`packages/slurp2/src/engine/packages/server/src/slp/${path}`);

// Slurp 0.3.43 bug sweep.

// ── Long DMs are not cut mid-word (#101) ──
assert.match(server("features/messages/slp-message-generation-service.ts"), /SLURP_MESSAGE_CONTENT_MAX_LENGTH = 2400;/u);
assert.match(server("features/feed/slp-public-identity.ts"), /return slpCutAtBoundary\(protectedValue, maxLength\);/u);
const reply = `${"I loved the shoot today. ".repeat(40)}Can I ask you a QUESTION about it`;
const cut = slpCutAtBoundary(reply, 1000);
assert.ok(cut.length <= 1000);
assert.match(cut, /today\.$/u, "ends on a sentence");
assert.equal(slpCutAtBoundary("short", 10), "short");
assert.equal(slpCutAtBoundary("one two three four", 12), "one two", "a word boundary when no sentence end");
assert.equal(slpCutAtBoundary("abcdefghijklmnop", 5), "abcde", "a hard cut only without spaces");
assert.equal(slpCutAtBoundary("one two three", 7), "one two", "a cut right before a space keeps the word");

// ── A commission price named in chat matches the quote (#45) ──
const pricing = { commissionBase: 40, commissionMin: 10, commissionMax: 400 };
assert.deepEqual(slurpCommissionPriceRange(pricing), { usual: 40, from: 10, upTo: 400 });
assert.deepEqual(slurpCommissionPriceRange({ commissionBase: 500, commissionMin: 90, commissionMax: 60 }), { usual: 60, from: 60, upTo: 60 });
for (const brief of ["a quick sketch", "a detailed full-body scene of the two of us together, a set of three"]) {
  const quote = slurpCommissionQuote(brief, pricing);
  const range = slurpCommissionPriceRange(pricing);
  assert.ok(quote >= range.from && quote <= range.upTo, "every quote is inside the range the DM names");
}
const dm = server("features/messages/slp-message-generation-service.ts");
assert.match(dm, /commissionPrices: supportDesk\s*\? undefined/u);
assert.match(dm, /\.\.\.\(input\.commissionPrices \? \{ commissionPrices: input\.commissionPrices \} : \{\}\)/u);

// ── Cancel ends a subscription to a removed Creator at once (#28) ──
assert.match(
  server("data/economy/slp-economy-storage-1.ts"),
  /const gone = current && !\(await this\.getNoodlerAccountById\(creatorAccountId, \{ includeHidden: true \}\)\);\s*if \(!expire && !gone && current/u,
);

// ── Fans react to what a picture shows, not to its art style (#38) ──
const pictures = server("base/media/slp-post-image-context.ts");
assert.match(pictures, /never to art style/u);
assert.equal(pictures.match(/\$\{PICTURE_SEEN\}/gu)?.length, 3, "prompt, saved caption and new caption all carry it");

// ── Family is never a couple (#43) ──
const tie = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  text: "",
  tags: [],
  automatic: true,
  followers: 0,
  romance: { off: false, only: [] },
  ...extra,
});
const mom = tie("m", "Ruth Vale", { cardPeople: [{ name: "Juniper", relation: "daughter" }] });
const kid = tie("d", "Juniper Vale");
assert.ok(slurpCoupleKin(mom, kid) && slurpCoupleKin(kid, mom), "a card person with a family relation");
assert.equal(slurpCoupleFit(mom, kid).misfit, "family");
assert.ok(slurpCoupleKin(tie("a", "Ava", { text: "Ava's older sister Juniper runs a bakery." }), kid), "a card sentence");
assert.ok(!slurpCoupleKin(tie("a", "Ava", { text: "Ava loves Juniper's posts." }), kid));
assert.ok(!slurpCoupleKin(tie("a", "Ava", { text: "Ava steps out with Juniper for the grand opening." }), kid));
assert.ok(slurpCoupleKin(tie("a", "Ava", { text: "Juniper is Ava's stepsister." }), kid));
assert.ok(!slurpCoupleKin(tie("a", "Ava", { cardPeople: [{ name: "Juniper", relation: "girlfriend" }] }), kid));
const at = new Date("2026-10-15T12:00:00Z");
assert.equal(slurpSetUpCouple([], mom, kid, { at, id: "c1" }), "family", "the player cannot force it either");
assert.match(server("features/projects/slp-stir-ties.ts"), /family: \[409, /u);

// ── A page the player runs can be set polyamorous (#68) ──
const sheet = slurp2Source("packages/slurp2/src/engine/packages/client/src/slp/features/stir/SlpStirCreatorSheet.tsx");
assert.match(sheet, /!creator\.automatic && !creator\.couplePage && \(\s*<SlpCreatorSteeringCard creatorId=\{creator\.id\} name=\{creator\.name\} relationshipOnly \/>/u);
assert.match(
  slurp2Source("packages/slurp2/src/engine/packages/client/src/slp/features/creators/SlpCreatorSteeringCard.tsx"),
  /if \(relationshipOnly\)\s*return relationships \?/u,
);

console.log("slurp2 bug sweep regression: pass");
