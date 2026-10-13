// Modern Life Sim: shared town jobs, household wages and basic income.
// Run: node tests/modern-life-sim-jobs-money.regression.mjs
import assert from "node:assert/strict";
import { setJob } from "../packages/modern-life-sim/src/server/cast/cast-jobs.mjs";
import { jobHolders, openTownJobs } from "../packages/modern-life-sim/src/server/jobs/town-jobs.mjs";
import { createWallet } from "../packages/modern-life-sim/src/server/money/wallet.mjs";
import {
  householdView,
  payBasicIncome,
  payHouseholdDay,
} from "../packages/modern-life-sim/src/server/money/household.mjs";
import { cleanRulesIn, setRules } from "../packages/modern-life-sim/src/server/game.mjs";

const DAY = 1440;
const person = (id, extra = {}) => ({ id, name: id.toUpperCase(), week: null, job: null, ...extra });
const lifeWith = (characters, extra = {}) => ({
  minutes: 0,
  town: {
    places: [
      { id: "cafe", name: "Cafe" },
      { id: "office", name: "Office" },
    ],
  },
  characters,
  bonds: Object.fromEntries(characters.map((c) => [c.id, { characterId: c.id, met: true, status: "friends" }])),
  rules: {},
  wallet: createWallet({ cash: 0 }),
  residence: { place: "apartments", unit: "2B" },
  log: [],
  ...extra,
});

// A. Non-boss jobs are shared; the boss job keeps one holder.
{
  const life = lifeWith([person("ann"), person("bo"), person("cy")]);
  assert.equal(setJob(life, "ann", "barista-am").ok, true);
  assert.equal(setJob(life, "bo", "barista-am").ok, true, "a second barista on the same shift");
  assert.deepEqual(jobHolders(life.characters)["barista-am"], ["ann", "bo"]);
  assert.equal(setJob(life, "ann", "boss").ok, true);
  const taken = setJob(life, "cy", "boss");
  assert.equal(taken.ok, false, "a place has only one boss");
  assert.equal(taken.reason, "That job is not free in this town.");
  assert.equal(setJob(life, "ann", "boss").ok, true, "the boss can keep their own job");
  const open = openTownJobs(life.town, life.characters).map((job) => job.id);
  assert.ok(open.includes("barista-am") && !open.includes("boss"));
  assert.ok(!openTownJobs(life.town, [], { taken: ["boss"] }).some((job) => job.id === "boss"));
  assert.ok(openTownJobs(life.town, [], { taken: ["barista-am"] }).some((job) => job.id === "barista-am"));
}

// B. A cohabiting worker's pay lands in the player's wallet once per worked day.
{
  const mate = person("dee", {
    job: { id: "barista-am", place: "cafe", title: "Barista" },
    residence: { place: "apartments", unit: "2B" },
  });
  const neighbour = person("eli", {
    job: { id: "barista-am", place: "cafe", title: "Barista" },
    residence: { place: "apartments", unit: "3C" },
  });
  const life = lifeWith([mate, neighbour]);
  // Day 0 is a Monday (barista-am works Mon-Fri), day 5 a Saturday.
  assert.equal(payHouseholdDay(life, 0), 60);
  assert.equal(payHouseholdDay(life, 0), 0, "never twice for the same day");
  assert.equal(life.wallet.cash, 60);
  assert.equal(life.wallet.ledger.at(-1).label, "DEE's pay");
  assert.equal(payHouseholdDay(life, 5), 0, "no pay on a day off");
  assert.deepEqual(
    householdView(life).list.map((m) => [m.characterId, m.days]),
    [["dee", 5]],
  );
  assert.equal(householdView(life).week, 300);
  // A partner living with you counts too, wherever their own door is.
  life.bonds.eli.status = "living";
  assert.equal(payHouseholdDay(life, 7), 120);
}

// C. Basic income: once per season, from the next season after it is switched on.
{
  const life = lifeWith([], { minutes: 3 * DAY });
  assert.deepEqual(cleanRulesIn({ ubi: "250.7" }), { ubi: 250 });
  assert.equal(cleanRulesIn({ ubi: 5e6 }).ubi, 100000);
  assert.equal(payBasicIncome(life), 0, "off by default (old saves)");
  setRules(life, { ubi: 500 });
  assert.equal(life.rules.ubi, 500);
  assert.equal(payBasicIncome(life), 0, "not in the season it is switched on");
  life.minutes = 30 * DAY + 60;
  assert.equal(payBasicIncome(life), 500);
  assert.equal(payBasicIncome(life), 0, "never twice in a season");
  assert.equal(life.wallet.ledger.at(-1).label, "Basic income");
  life.minutes = 60 * DAY;
  assert.equal(payBasicIncome(life), 500);
  assert.equal(life.wallet.cash, 1000);
}

console.log("modern-life-sim jobs/money regression: ok");
