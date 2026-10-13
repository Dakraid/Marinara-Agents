import assert from "node:assert/strict";
import {
  SLP_CREATOR_SUBSCRIPTION_COST,
  SLP_CREATOR_UNLOCK_COST,
  slpCreatorUnlockPriceFromMetadata,
  slpCreatorUnlockPriceMetadata,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/economy/slp-prices";
import { slurp2Source } from "./slurp2-source";

// Prices became real in the coin economy, but only when the player turns it on. Until 1.0.12 the
// old wallet gated access unconditionally, so an imported, restored, or hand-edited wallet could
// silently break access. That is why every debit is gated behind `walletEnabled`, and
// must stay that way: an install that never opted in behaves exactly as it always has.

assert.equal(SLP_CREATOR_UNLOCK_COST, 1);
assert.equal(SLP_CREATOR_SUBSCRIPTION_COST, 5);

// Stored on the post, so an explicit price survives refreshes and beats the shipped default.
assert.deepEqual(slpCreatorUnlockPriceMetadata(), { noodlerUnlockPrice: 1 });
assert.deepEqual(slpCreatorUnlockPriceMetadata(7), { noodlerUnlockPrice: 7 });
assert.equal(slpCreatorUnlockPriceFromMetadata({ noodlerUnlockPrice: 7 }), 7);
assert.equal(slpCreatorUnlockPriceFromMetadata({ noodlerUnlockPrice: 0 }), 0);

// Posts written before the field existed read the default, so no backfill pass is needed.
assert.equal(slpCreatorUnlockPriceFromMetadata({}), SLP_CREATOR_UNLOCK_COST);
assert.equal(slpCreatorUnlockPriceFromMetadata(null), SLP_CREATOR_UNLOCK_COST);
assert.equal(slpCreatorUnlockPriceFromMetadata(undefined), SLP_CREATOR_UNLOCK_COST);
// Hand-edited or imported junk must not produce NaN prices or negative ones.
for (const junk of [
  { noodlerUnlockPrice: "3" },
  { noodlerUnlockPrice: -1 },
  { noodlerUnlockPrice: 1.5 },
  { noodlerUnlockPrice: null },
]) {
  assert.equal(slpCreatorUnlockPriceFromMetadata(junk), SLP_CREATOR_UNLOCK_COST);
}

const storage = slurp2Source("packages/slurp2/src/engine/packages/server/src/services/storage/slurp.storage.ts");
const fanInteraction = storage.slice(
  storage.indexOf("async createNoodlerFanInteraction("),
  storage.indexOf("async deleteNoodlerInteraction("),
);
assert.match(fanInteraction, /postRow\.access !== "public" && postRow\.access !== "locked"/u);

// Confirmed with the maintainer: the fictional economy now ships ON by default. The gates below
// are what keep it safe, not the default — every price lookup, balance read, and debit still
// checks `settings.walletEnabled` first. The gates were rewritten from `if` blocks to inline
// ternaries, so these assert the guard is present rather than the shape it is written in.
assert.match(storage, /walletEnabled: true/u, "the shipped default for the fictional economy");
for (const gate of [
  /const basePrice = settings\.walletEnabled \? await this\.getCreatorSubscriptionPrice/u,
  /const existingWallet = settings\.walletEnabled \? await getWalletNow/u,
]) {
  assert.match(storage, gate, "a funds check must never run unless the economy is switched on");
}
assert.match(storage, /const charged = settings\.walletEnabled/u, "debits happen only when enabled");
assert.match(storage, /if \(settings\.walletEnabled\) await writeWallet/u, "balances persist only when enabled");
// The old unconditional gate read the raw settings blob. It must not come back in any form.
assert.doesNotMatch(storage, /wallet\.coins < (?:NOODLER|SLP_CREATOR)_(UNLOCK|SUBSCRIPTION)_COST/u);
assert.doesNotMatch(storage, /wallet: \{ coins: viewer\.settings\.wallet\.coins - /u);

// Subscribing still follows the Creator; that is unrelated to price and must survive.
const subscribe = storage.slice(storage.indexOf("async subscribe("), storage.indexOf("async unsubscribe("));
assert.ok(subscribe.length > 0);
assert.match(subscribe, /followingAccountIds\.includes\(creatorAccountId\)/u);

const routes = slurp2Source("packages/slurp2/src/engine/packages/server/src/routes/slurp.routes.ts");
// A locked post withholds its metadata, so the price has to travel as its own field.
assert.match(routes, /metadata: locked \? null : post\.metadata,/u);
assert.match(routes, /unlockPrice: locked \? slpCreatorUnlockPriceFromMetadata\(post\.metadata\) : null,/u);
// A creator with its own weekly price shows that price; the constant is only the fallback.
assert.match(
  routes,
  /subscriptionPrice: context\.subscriptionPrices\[account\.id\] \?\? SLP_CREATOR_SUBSCRIPTION_COST,/u,
);
// An unaffordable unlock is a different answer from a missing one, so the client can offer a
// top-up instead of an error. The storage layer, not the route, decides whether to charge.
const unlockRoute = routes.slice(routes.indexOf('"/slurp/posts/:id/unlock"'));
assert.match(unlockRoute.slice(0, 2000), /reply\.code\(402\)\.send\(\{ error: "Not enough coins"/u);

const card = slurp2Source("packages/slurp2/src/engine/packages/client/src/components/slurp/SlurpCreatorPostCard.tsx");
const enLocale = JSON.parse(
  slurp2Source("packages/slurp2/src/engine/packages/client/src/localization/locales/en.json"),
) as Record<string, string>;

// Both actions show a price, and the hint says plainly what it does and does not cost.
assert.match(card, /<SlpCreatorFictionalPrice amount=\{slpCreatorUnlockPriceOf\(post\)\} \/>/u);
assert.match(card, /<SlpCreatorFictionalPrice[\s\S]*?amount=\{subscriptionPrice\}[\s\S]*?\/>/u);
assert.match(card, /title=\{localizeUi\("ui\.noodle\.unlocksheet\.priceHint"\)\}/u);
assert.match(enLocale["ui.noodle.unlocksheet.price"], /\{\{amount\}\}/u);
// The in-universe copy pass (31cdf2442) names the fictional SlurpCoin wallet instead of explaining
// that no money is charged; SlurpCoin is the only currency, so no real money is ever involved.
assert.match(enLocale["ui.noodle.unlocksheet.priceHint"], /SlurpCoin wallet/u);

// No wallet balance is surfaced anywhere in the viewer UI. Comments may discuss the wallet;
// what must not exist is code that reads or renders one.
assert.doesNotMatch(card, /wallet\.coins|walletCoins|settings\.wallet/u);

console.log("NoodleR fictional-price regressions passed.");
