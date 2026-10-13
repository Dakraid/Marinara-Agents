// Modern Life Sim: sexes (woman, man, futanari) and attraction as a list.
// Run: node tests/modern-life-sim-sex.regression.mjs
import assert from "node:assert/strict";
import "../packages/modern-life-sim/src/server/index.mjs";
import {
  attractionBadge,
  attractionSaid,
  isAttractedToGender,
  normalizeAttraction,
  normalizeGender,
} from "../packages/modern-life-sim/src/server/orientation/orientation.mjs";
import {
  objectOf,
  pictureSexOf,
  pronounOf,
  setOrientation,
  setYourGender,
  settleOrientation,
  syncRomance,
} from "../packages/modern-life-sim/src/server/romance/romanceability.mjs";
import { migrateLife } from "../packages/modern-life-sim/src/server/saves/life-save.mjs";
import { cleanFigure } from "../packages/modern-life-sim/src/server/characters/figure.mjs";

// Sex normalization
assert.equal(normalizeGender("Woman"), "female");
assert.equal(normalizeGender("male"), "male");
assert.equal(normalizeGender("futa"), "futanari");
assert.equal(normalizeGender(" Futanari "), "futanari");
assert.equal(normalizeGender("other"), null);
assert.equal(cleanFigure({ sex: "futanari", body: "tall" }).sex, "futanari");

// Attraction: legacy single values, lists, and the unsaid default
assert.deepEqual(normalizeAttraction("women"), ["women"]);
assert.deepEqual(normalizeAttraction("men"), ["men"]);
assert.deepEqual(normalizeAttraction("both"), ["women", "men"]);
assert.deepEqual(normalizeAttraction(["futanari", "women", "nope"]), ["women", "futanari"]);
assert.deepEqual(normalizeAttraction("men, futa"), ["men", "futanari"]);
assert.deepEqual(normalizeAttraction("unsaid"), ["women", "men", "futanari"]);
assert.equal(attractionSaid("unsaid"), false);
assert.equal(attractionSaid(["men"]), true);
assert.equal(attractionBadge(["women", "men", "futanari"]), "");
assert.equal(attractionBadge("both"), "Only into women and men");

// Who is into whom
assert.equal(isAttractedToGender("both", "female"), true);
assert.equal(isAttractedToGender("both", "futanari"), false);
assert.equal(isAttractedToGender(["futanari"], "futanari"), true);
assert.equal(isAttractedToGender(["futanari"], "female"), false);
assert.equal(isAttractedToGender("women", "male"), false);
assert.equal(isAttractedToGender(["men"], null), true);
assert.equal(isAttractedToGender(undefined, "futanari"), true);

// Save migration turns old single values into lists and leaves unknown ones alone
const old = migrateLife({
  characters: [{ id: "a", into: "both" }, { id: "b", into: "men" }, { id: "c" }],
  bonds: {},
});
assert.deepEqual(old.characters[0].into, ["women", "men"]);
assert.deepEqual(old.characters[1].into, ["men"]);
assert.equal(old.characters[2].into, undefined);

// Pronouns and romance sync
const state = {
  gender: "male",
  minutes: 0,
  rules: { npcs: false },
  characters: [
    { id: "ana", gender: "futanari", into: ["women", "futanari"] },
    { id: "bo", gender: "male", into: "both" },
    { id: "cy", figure: { sex: "futa" } },
  ],
  bonds: { ana: { characterId: "ana" }, bo: { characterId: "bo" }, cy: { characterId: "cy" } },
};
assert.equal(pronounOf(state, "ana"), "She");
assert.equal(objectOf(state, "ana"), "her");
assert.equal(pronounOf(state, "bo"), "He");
assert.equal(pronounOf(state, "cy"), "She");
syncRomance(state, "ana");
syncRomance(state, "bo");
assert.equal(state.bonds.ana.notInto, true);
assert.equal(state.bonds.bo.romanceable, true);
assert.deepEqual(setYourGender(state, "futa"), { ok: true, gender: "futanari" });
assert.equal(state.bonds.ana.romanceable, true);
assert.equal(state.bonds.bo.notInto, true);
assert.equal(setYourGender(state, "robot").reason, "A woman, a man or futanari.");
assert.equal(setOrientation(state, "bo", { into: ["men", "futanari"] }).ok, true);
assert.deepEqual(state.characters[1].into, ["men", "futanari"]);
assert.equal(state.bonds.bo.romanceable, true);
// A partner who would not be into you keeps being into you
state.characters[1].into = ["men"];
state.bonds.bo.status = "dating";
settleOrientation(state, ["bo"]);
assert.deepEqual(state.characters[1].into, ["men", "futanari"]);

// Pictures show futanari only with the Adult module on
assert.equal(pictureSexOf({ modules: {} }, "futanari"), "female");
assert.equal(pictureSexOf({ modules: { adult: { on: true } } }, "futanari"), "futanari");
assert.equal(pictureSexOf({ modules: {} }, "male"), "male");

console.log("modern-life-sim sex regression: ok");
