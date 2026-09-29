/**
 * Pulse + E (user, 2026-09-28). E: automatic Creators answer about one in four AI fans; follow-ups
 * are promises that wait, retry and arrive late with a sorry instead of being dropped. The rules run
 * on real inputs; wiring checks keep them on the paths that use them (storage needs the Engine DB).
 */
import assert from "node:assert/strict";
import {
  SLURP_AI_FAN_ANSWER_ONE_IN,
  slurpAnswersAiFan,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-messaging.ts";
import {
  formatFollowUpContext,
  isFollowUpLate,
  slurpFollowUpExpires,
  slurpFollowUpRetryAt,
  type ScheduledFollowUp,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-follow-up.ts";
import { slurp2Source } from "./slurp2-source.ts";

const root = new URL("../packages/slurp2/src/engine/packages/", import.meta.url);
const server = (path: string) => slurp2Source(new URL(`server/src/slp/${path}`, root));

// E1. About one AI fan in four is answered, the same one on every retry, text messages only.
{
  const ids = Array.from({ length: 4000 }, (_, index) => `msg-${index}`);
  const answered = ids.filter((id) => slurpAnswersAiFan({ id, kind: "text" })).length;
  assert.equal(SLURP_AI_FAN_ANSWER_ONE_IN, 4);
  assert.ok(answered > 850 && answered < 1150, `about 1 in 4 answered (${answered} of 4000)`);
  const picked = ids.find((id) => slurpAnswersAiFan({ id, kind: "text" }))!;
  assert.equal(slurpAnswersAiFan({ id: picked, kind: "text" }), true, "a retry gets the same answer");
  for (const kind of ["tip", "commission_brief", "post_preview", "ppv"])
    assert.equal(slurpAnswersAiFan({ id: picked, kind }), false, `${kind} has its own path`);

  const operation = server("features/messages/slp-message-operation.ts");
  assert.match(
    operation,
    /const aiFanTrigger =\s+!personaViewer && !support && !input\.operatorDraft && input\.background && creator/u,
    "only the unattended scheduler answers an AI fan",
  );
  assert.match(operation, /\(input\.operatorDraft \|\| aiFan\) && creator\s+\? await resolveAudienceFanAccount/u);
  assert.match(operation, /!support &&\s+\/\/[^\n]+\n\s+!aiFan &&/u, "an AI fan gets words, never a picture");
  assert.match(operation, /if \(stored && aiFan\) await dropSlurpPendingText\(db, input\.triggerMessageId\)/u);
  // Inside the AI budget: an unattended answer is never a player send, so it claims the budget.
  assert.match(operation, /playerSend: input\.background !== true/u);
  // The rest keep expiring after five days (7c M-009, unchanged).
  assert.match(server("features/messages/slp-stuck-messages-service.ts"), /slurpExpiredRequestIds\(/u);
  // AI fans' commissions stay text-only.
  assert.match(
    server("features/messages/slp-stuck-messages-service.ts"),
    /scheduleCommissionDelivery\(repair\.id, \{ deliverAt: repair\.deliverAt, mediaPath: null \}\)/u,
  );
}

// E2. Follow-ups are promises: a wait never ends one; only an old opener nobody asked for ends.
{
  const promised = "2026-09-25T22:35:00.000Z";
  const fiveDaysOn = new Date("2026-09-30T22:35:00.000Z");
  for (const type of ["reminder", "promise_delivery", "task_update", "check_in", "recurring"])
    assert.equal(slurpFollowUpExpires({ type, createdAt: promised }, fiveDaysOn), false, `${type} waits`);
  assert.equal(slurpFollowUpExpires({ type: "opener", createdAt: promised }, fiveDaysOn), true, "old opener ends");
  assert.equal(
    slurpFollowUpExpires({ type: "opener", createdAt: promised }, new Date("2026-09-26T10:00:00.000Z")),
    false,
    "a fresh opener waits",
  );

  // Late: more than two hours past the first due time.
  const due = "2026-09-28T20:00:00.000Z";
  assert.equal(isFollowUpLate(due, new Date("2026-09-28T21:30:00.000Z")), false, "a short wait is on time");
  assert.equal(isFollowUpLate(due, new Date("2026-09-29T07:00:00.000Z")), true, "the next morning is late");
  assert.equal(isFollowUpLate(undefined, new Date()), false, "no date, no guess");

  // Retry after a failure: 15 minutes at first, half the lateness later, never over 12 hours.
  const now = new Date("2026-09-28T20:00:00.000Z");
  const wait = (firstDueAt: string | undefined, at: Date) => (Date.parse(slurpFollowUpRetryAt(firstDueAt, at)) - at.getTime()) / 60_000;
  assert.equal(wait(due, now), 15);
  assert.equal(wait(due, new Date("2026-09-29T02:00:00.000Z")), 180, "six hours late → three hours");
  assert.equal(wait(due, new Date("2026-10-05T20:00:00.000Z")), 720, "a week late → the 12 hour cap");
  assert.equal(wait(undefined, now), 15);

  // The late line is in the Creator's own voice; an on-time promise and an opener get none.
  const followUp: ScheduledFollowUp = {
    id: "f1",
    scheduledAt: due,
    type: "promise_delivery",
    reason: "the gym pic she promised",
    context: "",
  };
  assert.match(formatFollowUpContext(followUp, "a pic after the gym", true), /You are late with this\. Open with a short, casual sorry/u);
  assert.doesNotMatch(formatFollowUpContext(followUp, "a pic after the gym", false), /late/u);
  assert.doesNotMatch(formatFollowUpContext({ ...followUp, type: "opener" }, undefined, true), /late/u);

  const storage = server("data/messages/slp-messages-storage-follow-ups.ts");
  assert.match(storage, /firstDueAt: followUp\.scheduledAt,\s+status: "pending"/u, "the first due time is kept");
  assert.match(storage, /firstDueAt: row\.firstDueAt \?\? row\.scheduledAt/u, "old rows use their due time");
  assert.match(
    storage,
    /status: opener \? "failed" : "pending",\s+scheduledAt: opener[\s\S]{0,120}slurpFollowUpRetryAt\(/u,
    "a failed promise goes back to the queue later",
  );
  assert.doesNotMatch(storage, /failedBefore \? "failed"/u, "no more give-up after two failures");
  const scheduler = server("features/messages/slp-follow-up-scheduler-service.ts");
  assert.match(scheduler, /isFollowUpLate\(followUp\.firstDueAt \?\? followUp\.scheduledAt\)/u);
  // Dropped only when the thread is gone or closed (and the Creator's own "writes first" switch).
  assert.match(scheduler, /if \(!thread \|\| thread\.state !== "active"\) \{\s+await messages\.cancelScheduledFollowUp/u);
  assert.match(
    slurp2Source(new URL("server/src/db/schema/slurp.ts", root)),
    /firstDueAt: text\("first_due_at"\),/u,
  );
}

console.log("slurp2 pulse + E regression passed");
