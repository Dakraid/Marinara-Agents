import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// A Creator knows what is in her own locked posts, and the DM prompt carries matching lorebook entries
// the way posts do. Source-reading: the services import the host Engine, which this lane does not load.
const root = join(fileURLToPath(new URL("..", import.meta.url)), "packages/slurp2/src/engine/packages/server/src/slp");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const dm = read("features/messages/slp-message-generation-service.ts");

// A: the locked body reaches the prompt; the unlock state stays beside it.
assert.doesNotMatch(dm, /contents not repeated here/u);
assert.match(dm, /content: protect\(post\.content\),/u);
assert.match(
  dm,
  /access: post\.access,\s+\.\.\.\(post\.access === "locked" \? \{ fanAlreadyUnlocked: Boolean\(post\.unlockedByFan\) \} : \{\}\)/u,
);

// B: lore is scanned from the recent chat, shown in the prompt (so in the Deep details messages), and gated by the setting.
assert.match(
  dm,
  /resolveSlurpLoreContext\(input\.db, \{\s+settings,\s+texts: input\.history\.slice\(-HISTORY_TURNS\)/u,
);
assert.match(dm, /worldLore: protect\(input\.loreContext\)/u);
assert.match(dm, /^\s+loreContext,$/mu);
const lore = read("data/host/slp-lore-context.ts");
assert.match(lore, /settings\.enableLorebookContext\s+\? await processLorebooks/u);
assert.match(lore, /\.catch\(\(error: unknown\) => \{[^}]*return "";/u, "a failed scan never fails the message");
assert.match(
  read("features/feed/slp-generation-service.ts"),
  /resolveSlurpLoreContext\(db, \{/u,
  "posts share the helper",
);
console.log("slurp2 message lore + locked posts: ok");
