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

console.log("slurp2 7c fixes regression passed");
