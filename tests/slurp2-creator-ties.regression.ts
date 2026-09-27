import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SLP_DEFAULT_STEERING,
  normalizeSlpCreatorSteering,
  type SlpCreatorSteering,
  type SlpSteeringSupportNote,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-creator-steering.ts";
import { SLURP_SUPPORT_ACCOUNT_ID } from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-support.ts";
import {
  applySlurpSupportTalk,
  slurpSupportUndoPatch,
  type SlurpSupportTalkStore,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-support.ts";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "packages/slurp2/src/engine/packages");
const read = (path: string) => readFileSync(join(root, path), "utf8");

async function main() {
  // 0. What a talk with Slurp Support changed shows in Creator tools, with Undo (7b-s user decision).
  {
    let steering: SlpCreatorSteering = { ...SLP_DEFAULT_STEERING, mood: "cozy", focus: "baking", push: ["gym"] };
    const notes: SlpSteeringSupportNote[] = [];
    const store: SlurpSupportTalkStore<null> = {
      recordThreadOutcome: async () => undefined,
      readSteering: async () => steering,
      patchSteering: async (_id, patch) => void (steering = { ...steering, ...patch }),
      addIdea: async () => "idea-7",
      noteChange: async (_id, note) => void notes.push(note),
      hasMemory: async () => false,
      addMemory: async () => undefined,
    };
    const talk = {
      thread: { id: "support-mira", viewerAccountId: SLURP_SUPPORT_ACCOUNT_ID, creatorAccountId: "mira" },
      trigger: { id: "s1", content: "Travel posts do well." },
      outcome: null,
      staff: { mood: "restless", focus: "travel", idea: "Airport outfit", more: "trips", less: "gym", takeaway: "" },
      supportName: "Slurp Support",
      at: new Date("2026-09-28T10:00:00Z"),
    };
    await applySlurpSupportTalk(store, talk);
    assert.equal(notes.length, 1, "one note per talk that changed something");
    const note = notes[0]!;
    assert.equal(note.focus, "travel");
    assert.equal(note.mood, "restless");
    assert.equal(note.idea, "Airport outfit");
    assert.equal(note.ideaId, "idea-7");
    assert.equal(note.memory, null, "no takeaway, no memory");
    assert.deepEqual(note.before, { mood: "cozy", focus: "baking", push: ["gym"], avoid: [] });
    // Undo puts every changed field back, and only those.
    const undo = slurpSupportUndoPatch(note);
    assert.deepEqual(undo, { mood: "cozy", focus: "baking", push: ["gym"], avoid: [] });
    assert.deepEqual(slurpSupportUndoPatch({ ...note, mood: null, more: "", less: "" }), { focus: "baking" });
    // A talk that changed nothing leaves no note.
    notes.length = 0;
    await applySlurpSupportTalk(store, { ...talk, staff: { mood: steering.mood, focus: steering.focus } });
    assert.equal(notes.length, 0);
    // The note survives storage; junk reads as no note.
    assert.deepEqual(normalizeSlpCreatorSteering({ support: note }).support, note);
    assert.equal(normalizeSlpCreatorSteering({ support: { focus: "x" } }).support, null);
    assert.equal(normalizeSlpCreatorSteering(null).support, null);
    // Wiring: the player's own change to a field replaces the note; Undo removes the idea and the memory.
    const storage = read("server/src/slp/data/creators/slp-steering-storage.ts");
    assert.match(storage, /support: options\.keepSupportNote \|\| !touchesNote \? current\.support : null/u);
    const routes = read("server/src/slp/features/creators/slp-steering-routes.ts");
    assert.match(routes, /"\/slurp\/accounts\/:id\/steering\/support-undo"/u);
    assert.match(routes, /removeSlurpCreatorNudge\(app\.db, id, note\.ideaId\)/u);
    assert.match(routes, /moveSlurpContinuityStatus\(app\.db, "fact", memory\.id, "retracted"\)/u);
    assert.match(
      read("server/src/slp/features/messages/slp-message-operation.ts"),
      /patchSlurpCreatorSteering\(db, creatorAccountId, patch, \{ keepSupportNote: true \}\)/u,
    );
    assert.match(read("client/src/slp/features/creators/SlpCreatorSteeringCard.tsx"), /<SupportNote/u);
  }

  console.log("slurp2 creator ties regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
