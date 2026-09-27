/** Fix phase 1b (user decisions on fix phase 1 "Needs the user"): behaviour checks per decision. */
import assert from "node:assert/strict";
import {
  slpCanAffordGamble,
  slpGambleUnlockPrice,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-post-offers.ts";
import { slurp2Source } from "./slurp2-source.ts";

const root = "packages/slurp2/src/engine/packages";
const readSlurp2Source = (side: "client" | "server" | "shared", path: string) =>
  slurp2Source(`${root}/${side}/src/slp/${path}`);

// R1-091: the gamble is blocked when the balance cannot pay the losing side (3x); no wallet = no block.
assert.equal(slpGambleUnlockPrice(25, false), 75);
assert.equal(slpCanAffordGamble(74, 25), false, "one coin short cannot bet");
assert.equal(slpCanAffordGamble(75, 25), true, "exactly 3x can bet");
assert.equal(slpCanAffordGamble(null, 25), true, "SlurpCoins off: nothing to check");
const walletRoutes = readSlurp2Source("server", "features/economy/slp-wallet-routes.ts");
const gamble = walletRoutes.slice(walletRoutes.indexOf('"/slurp/posts/:id/gamble-unlock"'));
assert.ok(
  gamble.indexOf("slpCanAffordGamble(wallet.coins, basePrice)") < gamble.indexOf("randomInt(2)"),
  "the server checks the balance before it rolls",
);
const card = readSlurp2Source("client", "modules/post/SlpLockedPostCard.tsx");
assert.match(card, /disabled=\{unlockPending \|\| transaction !== null \|\| gambleBlocked\}/u);
assert.match(card, /ui\.slurp\.unlocksheet\.gambleNeedsCoins/u, "the reason is on the button");

console.log("slurp2 fix phase 1b: ok");
