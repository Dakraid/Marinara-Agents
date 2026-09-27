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

// ── Plane 220 (+ 221): "Refresh now" works with the scheduled audience switched off ──
const fanOperation = pkg("server/src/slp/features/audience/slp-fan-activity-operation.ts");
const runBody = fanOperation.slice(fanOperation.indexOf("export async function runCreatorFanActivity("));
assert.match(
  runBody,
  /const settings = fanActivitySettingsFor\(await noodle\.getSettings\(\), input\.mode === "manual"\);/u,
  "a manual run reads the switch as on",
);
assert.ok(
  runBody.indexOf("fanActivitySettingsFor(") < runBody.indexOf('return { status: "disabled"'),
  "the disabled early return sees the manual settings",
);
assert.match(fanOperation, /return manual \? \{ \.\.\.settings, fanActivityEnabled: true \} : settings;/u);
assert.match(fanOperation, /const effective = fanActivitySettingsFor\(settings, manual\);/u);
assert.match(fanOperation, /resolveCreatorFanActivityPolicy\(effective, creator\)\.enabled/u);
assert.match(fanOperation, /id: activity\.id,\s+manual,/u, "the storage write knows the run was manual");
assert.match(
  pkg("server/src/slp/data/feed/slp-feed-interaction-storage-3.ts"),
  /if \(\(!settings\.fanActivityEnabled && !input\.manual\) \|\| override\?\.enabled === false\) return null;/u,
  "a Creator switched off on their own page stays off, even for a manual run",
);
assert.doesNotMatch(
  pkg("client/src/slp/features/audience/SlpAudiencePanel.tsx"),
  /disabled=\{refreshFans\.isPending \|\| !settings\.fanActivityEnabled\}/u,
  "Refresh now is not greyed out by the schedule switch",
);
assert.match(en["ui.slurp.settings.audience.enabledDetail"] ?? "", /Refresh now still/u);

// ── Plane 236: the Creator Overview names the storyline that is running, not only a count ──
const overview = pkg("client/src/slp/features/creators/settings/SlpCreatorOverviewSection.tsx");
assert.match(overview, /const runningProjects = projects\.filter\(\(project\) => project\.status === "active"\);/u);
assert.match(overview, /runningProjects\.map\(\(project\) => \(\s*<p key=\{project\.id\}[^>]*>\s*\{project\.title\}/u);
