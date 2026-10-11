import assert from "node:assert/strict";
import { join } from "node:path";
import { slurp2Source } from "./slurp2-source";

// "Create posts now" once reported a full batch while the feed showed one post fewer: a Story slot
// sends the post to the Stories row, and a Creator busy with another run was skipped at once.
const root = join(import.meta.dirname, "..", "packages/slurp2/src/engine/packages");
const read = (path: string) => slurp2Source(join(root, path));

const operation = read("server/src/services/slurp/slurp-post.operation.ts");
const targeted = operation.slice(operation.indexOf("export async function refreshTargetedCreatorsNow"));
assert.match(targeted, /\{ allowStory: false, playerAsked: true \}/u, "manual refresh must not produce Stories");
assert.match(
  targeted,
  /while \(result\.status === "busy" && Date\.now\(\) - startedAt < MANUAL_REFRESH_BUSY_WAIT_MS\)/u,
);

const generation = read("server/src/services/slurp/slurp-generation.service.ts");
assert.match(generation, /input\.allowStory !== false && variation\?\.story === true/u);

// The names toast moved off the Backstage monolith's split and into the hook that owns the
// mutation (the state layer, not a component); read it directly rather than through the
// SlurpSettings.tsx component key, which tests/slurp2-client-hooks.regression.ts relies on
// excluding from the state-layer hook inventory.
const refreshHooks = read("client/src/slp/features/creators/slp-creator-refresh-hooks.ts");
assert.match(refreshHooks, /description: names\(\(status\) => status === "skipped"\)/u);

console.log("slurp2 manual refresh regression passed");
