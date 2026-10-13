import assert from "node:assert/strict";
import { settingNoteFor } from "../packages/modern-life-sim/src/server/cast/read-card.mjs";
import {
  listWorldLorebooks,
  loadWorldLore,
  worldLoreFromBook,
} from "../packages/modern-life-sim/src/server/cast/world-lore.mjs";

const book = {
  id: "lb1",
  data: { name: "Harbor Town" },
  entries: [
    { name: "Docks", content: "Fishing boats leave at dawn.", enabled: true },
    { name: "Off", content: "Should not appear.", enabled: false },
    { name: "Empty", content: "   ", enabled: true },
    { name: "Mayor", content: "Mayor Quill runs the town.", enabled: true },
  ],
};

const lore = worldLoreFromBook(book);
assert.deepEqual(lore, {
  lorebookId: "lb1",
  name: "Harbor Town",
  text: "Docks\nFishing boats leave at dawn.\n\nMayor\nMayor Quill runs the town.",
});

// The cap keeps whole entries: the second one would overflow, so only the first stays.
assert.equal(worldLoreFromBook(book, 40).text, "Docks\nFishing boats leave at dawn.");
// A single oversized first entry is cut to the cap rather than dropped.
assert.equal(worldLoreFromBook(book, 10).text, "Docks\nFish");
assert.equal(worldLoreFromBook({ id: "x", data: {}, entries: [] }), null);
assert.equal(worldLoreFromBook(null), null);

const runtime = {
  resources: {
    listLorebooks: async (ids) => (ids ? (ids.includes("lb1") ? [book] : []) : [book]),
  },
};
assert.deepEqual(await listWorldLorebooks(runtime), [{ id: "lb1", name: "Harbor Town", entries: 2 }]);
assert.deepEqual(await loadWorldLore(runtime, "lb1"), lore);
assert.equal(await loadWorldLore(runtime, "nope"), null);
assert.equal(await loadWorldLore(runtime, ""), null);
// Older Engines without runtime.resources hide the feature.
assert.equal(await listWorldLorebooks({}), null);
assert.equal(await loadWorldLore({}, "lb1"), null);

const plain = settingNoteFor({ townName: "Bayside", scenario: "Coastal Maine." });
assert.ok(!plain.includes("WORLD LORE"));
assert.equal(settingNoteFor({ townName: "Bayside", scenario: "Coastal Maine.", worldLore: null }), plain);
const withLore = settingNoteFor({ townName: "Bayside", scenario: "Coastal Maine.", worldLore: lore });
assert.ok(
  withLore.includes(
    "WORLD LORE (from the player's lorebook Harbor Town):\nDocks\nFishing boats leave at dawn.\n\nMayor\nMayor Quill runs the town.",
  ),
);
assert.ok(withLore.startsWith("The town is called Bayside."));

console.log("modern-life-sim world lore regression: ok");
