import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { splitSlurpReplyBurst } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-messaging";

// Plane sweep (4c): one section per Plane issue fixed on this branch. Source pins where the module
// imports the Engine logger or database, behaviour checks where the module is pure.
const pkg = (path: string) =>
  readFileSync(join(import.meta.dirname, "..", "packages/slurp2/src/engine/packages", path), "utf8");
const en = JSON.parse(pkg("client/src/slp/locales/en.json")) as Record<string, string>;

// ── Plane 130: "Messages per reply" is an upper limit, and its top value applies ──
assert.match(en["ui.slurp.settings.messaging.bubbleLimit"] ?? "", /^Up to /u, "the label names a maximum");
assert.match(en["ui.slurp.settings.messaging.bubbleLimitDetail"] ?? "", /can use fewer/u);
const messageOperation = pkg("server/src/slp/features/messages/slp-message-operation.ts");
assert.doesNotMatch(
  messageOperation,
  /energy >= 70 \? 3 : 2/u,
  "a fixed 3 made the stepper's 4 a value that never applied",
);
const longReply = Array.from({ length: 8 }, (_, index) => `This is sentence number ${index + 1} of the reply.`).join(
  " ",
);
assert.equal(splitSlurpReplyBurst(longReply, true, 4).length, 4, "a limit of 4 can send four messages");
assert.equal(splitSlurpReplyBurst(longReply, true, 1).length <= 2, true);
