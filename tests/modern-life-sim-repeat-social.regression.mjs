// Modern Life Sim: Chat, Flirt, Open up and gifts repeat the same day; a repeat counts for half.
// Run: node tests/modern-life-sim-repeat-social.regression.mjs
import assert from "node:assert/strict";
import "../packages/modern-life-sim/src/server/index.mjs";
import { createGame, giftInfo, giveGift, interactWith } from "../packages/modern-life-sim/src/server/game.mjs";

const game = createGame({
  characters: [{ id: "c1", name: "Cee", gender: "female" }],
  startAt: { year: 1, season: "Autumn", day: 1, hour: 13, minute: 0 },
});
// A home visit keeps them in the room whatever their schedule says.
const visit = () =>
  (game.visit = {
    characterId: "c1",
    stage: "inside",
    invite: { yes: true },
    at: game.minutes,
    since: game.minutes,
    did: [],
  });

const gains = [];
for (let i = 0; i < 3; i++) {
  visit();
  const out = interactWith(game, "c1", "quickChat");
  assert.equal(out.ok, true, `chat #${i + 1} the same day: ${out.reason}`);
  gains.push(out.applied.friendship);
}
assert.ok(gains[1] < gains[0], "a repeat chat the same day counts for less");
assert.equal(game.bonds.c1.todayActions.time, 3);

game.things.bag.push({ item: "flowers", n: 2 });
for (let i = 0; i < 2; i++) {
  visit();
  assert.equal(giftInfo(game, "c1").ok, true, `gift #${i + 1} the same day is offered`);
  const out = giveGift(game, "c1", { index: game.things.bag.findIndex((pile) => pile.item === "flowers") });
  assert.equal(out.ok, true, `gift #${i + 1} the same day: ${out.reason}`);
}

console.log("modern-life-sim repeat social: ok");
