/**
 * Step 1, Stir follows through — a collab a play started says how it is going, from its record only:
 * - waiting, agreed, coming up, up (opens the joint post), turned down (with the reason), blocked;
 * - a removed post or a collab Slurp no longer keeps says so instead of linking nowhere;
 * - "Make it happen" is offered only while the request is still waiting;
 * - Undo is hidden once the joint post is on its way or up (a post is not taken back), but a play with
 *   other steps keeps it;
 * - a play that made no collab, failed, or was taken back shows no progress.
 */
import assert from "node:assert/strict";
import { slpStirPlayCollab } from "../packages/slurp2/src/engine/packages/client/src/slp/features/stir/slp-stir-screen-model.ts";
import type {
  SlpStirPlay,
  SlpStirPlayedCollab,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-stir.ts";

const play = (fields: Partial<SlpStirPlay> = {}): SlpStirPlay => ({
  id: "p1",
  at: "2026-10-11T12:00:00Z",
  origin: "deck",
  steps: [
    { action: "suggest-collab", input: { aId: "mira", bId: "kai" }, ok: true, error: null, ref: { collabId: "c1" } },
  ],
  undoable: true,
  undone: false,
  ...fields,
});

const collab = (fields: Partial<SlpStirPlayedCollab> = {}): SlpStirPlayedCollab => ({
  id: "c1",
  hostId: "mira",
  partnerId: "kai",
  idea: "a cook-off",
  status: "asked",
  decline: null,
  dropAt: null,
  postId: null,
  ...fields,
});

// Waiting: the one move is "Make it happen" on this request, and Undo still works.
const waiting = slpStirPlayCollab(play(), [collab()]);
assert.equal(waiting?.label, "ui.slurp.ties.collab.waiting");
assert.deepEqual(waiting?.lever, { action: "push-collab", pick: "c1" });
assert.equal(waiting?.undoable, true);

// Agreed: no push any more, Undo still works.
const agreed = slpStirPlayCollab(play(), [collab({ status: "agreed", dropAt: "2026-10-12T12:00:00Z" })]);
assert.equal(agreed?.label, "ui.slurp.ties.collab.agreed");
assert.equal(agreed?.lever, null);
assert.equal(agreed?.undoable, true);

// Coming up: the post is being made, so Undo is gone (the server refuses it too).
const planned = slpStirPlayCollab(play(), [collab({ status: "planned" })]);
assert.equal(planned?.label, "ui.slurp.ties.collab.planned");
assert.equal(planned?.undoable, false);

// Up: the row opens the joint post on the host's page.
const posted = slpStirPlayCollab(play(), [collab({ status: "posted", postId: "post-9" })]);
assert.equal(posted?.label, "ui.slurp.ties.collab.posted");
assert.deepEqual(posted?.target, { accountId: "mira", postId: "post-9" });
assert.equal(posted?.undoable, false, "a published post is not taken back");

// Up, but the post was deleted since: say so, open the host, not a dead post.
const removedPost = slpStirPlayCollab(play(), [collab({ status: "posted", postId: null })]);
assert.equal(removedPost?.label, "ui.slurp.stir.follow.postGone");
assert.deepEqual(removedPost?.target, { accountId: "mira", postId: null });

// Turned down: the Creator's reason; no answer when none was recorded.
assert.equal(
  slpStirPlayCollab(play(), [collab({ status: "declined", decline: "busy" })])?.label,
  "ui.slurp.ties.decline.busy",
);
assert.equal(
  slpStirPlayCollab(play(), [collab({ status: "declined", decline: null })])?.label,
  "ui.slurp.ties.decline.noAnswer",
);
assert.equal(slpStirPlayCollab(play(), [collab({ status: "blocked" })])?.label, "ui.slurp.ties.collab.blocked");

// Removed from the ties (pruned, or the Creator is gone): no link, no Undo that would fail.
const gone = slpStirPlayCollab(play(), []);
assert.equal(gone?.label, "ui.slurp.stir.follow.gone");
assert.equal(gone?.target, null);
assert.equal(gone?.undoable, false);

// "Make it happen" from Recent plays: the push play follows the same collab through its input.
const pushed = slpStirPlayCollab(
  play({ steps: [{ action: "push-collab", input: { collabId: "c1" }, ok: true, error: null }] }),
  [collab({ status: "agreed" })],
);
assert.equal(pushed?.label, "ui.slurp.ties.collab.agreed");

// Another step in the same play may still be worth taking back.
const twoSteps = play({
  steps: [...play().steps, { action: "steer-creator", input: { accountId: "kai" }, ok: true, error: null }],
});
assert.equal(slpStirPlayCollab(twoSteps, [collab({ status: "posted", postId: "post-9" })])?.undoable, true);

// No progress at all: a play that made no collab, a failed suggestion, a play taken back.
assert.equal(
  slpStirPlayCollab(play({ steps: [{ action: "start-event", input: { eventId: "e" }, ok: true, error: null }] }), []),
  null,
);
assert.equal(
  slpStirPlayCollab(
    play({ steps: [{ action: "suggest-collab", input: { aId: "mira", bId: "kai" }, ok: false, error: "busy" }] }),
    [],
  ),
  null,
);
assert.equal(slpStirPlayCollab(play({ undone: true }), [collab()]), null);
// An older Engine view without `playedCollabs` reads as "no longer kept", never as a fake state.
assert.equal(slpStirPlayCollab(play())?.label, "ui.slurp.stir.follow.gone");

console.log("slurp2-stir-follow-through: ok");
