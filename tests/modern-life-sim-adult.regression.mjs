// Adult module: one confirmation (no "I'm an adult" gate) and per-cast disposition/kinks.
// Run: node tests/modern-life-sim-adult.regression.mjs
import assert from "node:assert/strict";
import "../packages/modern-life-sim/src/server/adult/module.mjs";
import { moduleById, setModuleOptions } from "../packages/modern-life-sim/src/server/modules/module-registry.mjs";
import { cleanAdultSettings } from "../packages/modern-life-sim/src/server/adult/settings.mjs";
import {
  cleanIntimacyDisposition,
  cleanIntimacyKinks,
} from "../packages/modern-life-sim/src/server/adult/intimacy-ways.mjs";
import {
  applyAdultCardRead,
  intimacyDispositionFor,
  intimacyKinksFor,
  intimacyWaysPrompt,
} from "../packages/modern-life-sim/src/server/adult/cast-intimacy.mjs";
import { setAdultCharacterOption } from "../packages/modern-life-sim/src/server/adult/sleep-together.mjs";

const adultModule = moduleById("adult");
assert.ok(adultModule, "the adult module is registered");

// Enabling implies adult: no youAdult option and no gate.
assert.ok(!adultModule.catalog.options.some((option) => option.key === "youAdult"), "no I'm-an-adult option");
assert.ok(!adultModule.catalog.options.some((option) => option.required), "no required option left");
assert.ok(adultModule.catalog.confirm, "the one confirmation says what it means");
const created = cleanAdultSettings({ on: true, detail: "explicit" });
assert.ok(created, "creation with the module on is not dropped");
assert.equal(created.youAdult, true);
assert.equal(cleanAdultSettings({ on: false }), null);

const life = { id: "t", characters: [], modules: {} };
const switched = setModuleOptions(life, "adult", { on: true });
assert.ok(switched.ok, switched.reason);
assert.equal(life.modules.adult.on, true);
assert.equal(life.modules.adult.youAdult, true, "switching it on in a life is the confirmation");
assert.equal(setModuleOptions(life, "adult", { on: false }).ok, false, "once on, it stays on");

// Old save: module on, never ticked "I'm an adult".
const migrated = adultModule.migrate({ on: true, youAdult: false, afterDark: true, cast: {} }, { characters: [] });
assert.equal(migrated.youAdult, true, "an old on-but-unconfirmed life becomes active");
assert.equal(migrated.clubDancers, true);
assert.equal(migrated.clubRegulars, true);

// Validation.
assert.equal(cleanIntimacyDisposition(" Dominant "), "dominant");
assert.equal(cleanIntimacyDisposition("boss"), "");
assert.equal(cleanIntimacyDisposition(undefined), "");
const kinks = cleanIntimacyKinks([
  "rope",
  "Rope",
  " ",
  7,
  { text: "x" },
  "a".repeat(80),
  ...Array(40)
    .fill(0)
    .map((_, i) => `k${i}`),
]);
assert.deepEqual(kinks.slice(0, 2), ["rope", "a".repeat(60)]);
assert.equal(kinks.length, 24);

// Editing, card reads and precedence.
const state = { id: "s", characters: [{ id: "c1", name: "Ann", gender: "female" }], bonds: {}, rules: {} };
const adult = { on: true, youAdult: true, cast: {}, bonds: {} };
assert.deepEqual(intimacyKinksFor(adult, "c1"), [], "old saves: no kinks");
assert.equal(intimacyDispositionFor(adult, "c1"), "", "old saves: disposition unset");
applyAdultCardRead(state, adult, "c1", { adult: "yes", intimacy_disposition: "submissive", intimacy_kinks: ["lace"] });
assert.equal(intimacyDispositionFor(adult, "c1"), "submissive");
assert.deepEqual(intimacyKinksFor(adult, "c1"), ["lace"]);
assert.equal(setAdultCharacterOption(state, adult, "c1", "disposition", "boss").ok, false);
assert.equal(setAdultCharacterOption(state, adult, "c1", "kinks", "rope").ok, false);
assert.ok(setAdultCharacterOption(state, adult, "c1", "disposition", "dominant").ok);
assert.ok(setAdultCharacterOption(state, adult, "c1", "kinks", ["rope", "blindfolds"]).ok);
applyAdultCardRead(state, adult, "c1", { adult: "yes", intimacy_disposition: "switch", intimacy_kinks: ["feet"] });
assert.equal(intimacyDispositionFor(adult, "c1"), "dominant", "the player's pick wins over the card");
assert.deepEqual(intimacyKinksFor(adult, "c1"), ["rope", "blindfolds"], "the player's kinks win over the card");
assert.ok(setAdultCharacterOption(state, adult, "c1", "disposition", "").ok);
assert.equal(intimacyDispositionFor(adult, "c1"), "", "unset by hand stays unset");
setAdultCharacterOption(state, adult, "c1", "disposition", "dominant");

// The intimate guidance carries them.
const guidance = intimacyWaysPrompt(state, adult, "c1");
assert.match(guidance, /dominant/);
assert.match(guidance, /rope · blindfolds/);
state.characters.push({ id: "c2", name: "Bea", gender: "female" });
adult.cast.c2 = { disposition: "submissive", kinks: ["praise"] };
const group = intimacyWaysPrompt(state, adult, "c1", ["c2"]);
assert.match(group, /c2: submissive/);
assert.match(group, /c2: praise/);

console.log("modern-life-sim adult regression: ok");
