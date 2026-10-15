// Modern Life Sim: romance in the family rule, infidelity without a forced break-up, the Adult toggle in SETTINGS · CAST.
// Run: node tests/modern-life-sim-family-romance.regression.mjs
import assert from "node:assert/strict";
import "../packages/modern-life-sim/src/server/index.mjs";
import { moduleById } from "../packages/modern-life-sim/src/server/modules/module-registry.mjs";
import { familyPairBarsRomance, kinBarsRomance } from "../packages/modern-life-sim/src/server/relationships/kin.mjs";
import { syncRomance } from "../packages/modern-life-sim/src/server/romance/romanceability.mjs";
import { jealousOutcome } from "../packages/modern-life-sim/src/server/romance/jealousy.mjs";
import { isNoFlirtBond } from "../packages/modern-life-sim/src/server/game.mjs";

// Family bars romance only while the rule is off.
const kin = { kin: "siblings" };
assert.equal(kinBarsRomance({ rules: {} }, kin), true);
assert.equal(kinBarsRomance({ rules: { familyRomance: true } }, kin), false);
assert.equal(kinBarsRomance({ rules: {} }, {}), false);
assert.equal(familyPairBarsRomance({ rules: {} }, { kind: "family" }), true);
assert.equal(familyPairBarsRomance({ rules: { familyRomance: true } }, { kind: "family" }), false);
assert.equal(isNoFlirtBond(kin, { rules: {} }), true);
assert.equal(isNoFlirtBond(kin, { rules: { familyRomance: true } }), false);
assert.equal(isNoFlirtBond({ ...kin, justFriends: true }, { rules: { familyRomance: true } }), true);

// Romanceability follows the rule.
const state = {
  gender: "female",
  rules: {},
  characters: [{ id: "sis", name: "Sis", gender: "male", into: ["women"] }],
  bonds: { sis: { characterId: "sis", kin: "siblings", romanceable: false } },
};
syncRomance(state, "sis");
assert.equal(state.bonds.sis.romanceable, false);
state.rules.familyRomance = true;
syncRomance(state, "sis");
assert.equal(state.bonds.sis.romanceable, true, "a sibling is open to romance under the rule");

// Infidelity found out: no outcome ends the relationship; the easygoing ones let it go on.
const cheatScene = { characterId: "p", about: { cheat: true, with: "o" } };
const DIALS = { open: 5, smitten: 5, attention: 5, temper: 5, romantic: 5, faithful: 5 };
const partnerState = (jealousy, forgiveness) => ({
  rules: {},
  characters: [{ id: "p" }, { id: "o" }],
  bonds: {
    p: {
      characterId: "p",
      status: "dating",
      traits: { from: "own", dials: { ...DIALS, jealousy, forgiveness }, flags: [], likes: {} },
    },
  },
});
for (const choice of ["apologize", "explain", "deny"]) {
  for (const believed of [true, false]) {
    const outcome = jealousOutcome(partnerState(10, 0), cheatScene, choice, believed);
    assert.equal("ends" in outcome, false, `${choice}: never a forced break-up`);
    assert.equal(outcome.opens, false, "a jealous, unforgiving partner stays, hurt");
  }
}
const opened = jealousOutcome(partnerState(0, 0), cheatScene, "apologize", true);
assert.equal(opened.opens, true, "someone who isn't the jealous kind lets it go on");
assert.equal(opened.headline, "They can live with it.");
assert.equal(
  jealousOutcome(partnerState(5, 10), cheatScene, "explain", false).opens,
  true,
  "or someone very forgiving",
);
assert.equal(jealousOutcome(partnerState(0, 0), cheatScene, "deny", false).opens, false, "not when they lied about it");

// The Adult toggle shows for every cast member, options only once they are an adult.
const adultModule = moduleById("adult");
const life = {
  id: "t",
  rules: {},
  characters: [{ id: "c1", name: "Ann", gender: "female" }],
  bonds: { c1: { characterId: "c1" } },
  modules: {},
};
const adult = { on: true, youAdult: true, cast: {}, bonds: {} };
let row = adultModule.view(life, adult).people.c1;
assert.equal(row.toggle.key, "adult");
assert.equal(row.toggle.on, false);
assert.equal(row.sections, undefined, "no options before they are an adult");
assert.ok(adultModule.setCharacter(life, adult, "c1", "adult", true).ok);
row = adultModule.view(life, adult).people.c1;
assert.equal(row.toggle.on, true);
assert.ok(row.sections.length, "the options follow the toggle");

console.log("modern-life-sim family romance regression: ok");
