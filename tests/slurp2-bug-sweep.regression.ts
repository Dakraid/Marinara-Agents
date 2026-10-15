import assert from "node:assert/strict";
import { slpCutAtBoundary } from "../packages/slurp2/src/engine/packages/server/src/slp/base/prompting/slp-prompt-safety";
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

console.log("slurp2 bug sweep regression: pass");
