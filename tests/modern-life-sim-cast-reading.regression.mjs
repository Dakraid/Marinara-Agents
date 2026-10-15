// Modern Life Sim: card reading steer, one-way cast relations, futanari with both, Student and Police jobs.
// Run: node tests/modern-life-sim-cast-reading.regression.mjs
import assert from "node:assert/strict";
import "../packages/modern-life-sim/src/server/index.mjs";
import { readCharacterCard } from "../packages/modern-life-sim/src/server/cast/read-card.mjs";
import {
  pairBothWords,
  pairWordFor,
  parseCardRelations,
  parseNpcPairsFromCards,
} from "../packages/modern-life-sim/src/server/network/npc-pairs.mjs";
import { withFutanari } from "../packages/modern-life-sim/src/server/orientation/orientation.mjs";
import { JOBS_BY_PLACE } from "../packages/modern-life-sim/src/server/jobs/job-catalog.mjs";
import { TOWN_DISTRICTS, TOWN_PLACES } from "../packages/modern-life-sim/src/server/town/places.mjs";
import { buildTown } from "../packages/modern-life-sim/src/server/town/town-layout.mjs";
import { openTownJobs } from "../packages/modern-life-sim/src/server/jobs/town-jobs.mjs";

// One-way relations: the follower's side flips so `a` is always the lead.
const ids = ["ana", "ben", "cat"];
const read = parseCardRelations(
  [
    { id: "ben", kind: "student", note: "her pupil" },
    { id: "cat", kind: "family", detail: "adopted-child" },
  ],
  { ids, self: "ana" },
);
assert.deepEqual(
  read.map(({ id, kind, detail, flip }) => ({ id, kind, detail, flip: !!flip })),
  [
    { id: "ben", kind: "teacher", detail: null, flip: true },
    { id: "cat", kind: "family", detail: "adoptive-parent", flip: true },
  ],
);
const pairs = parseNpcPairsFromCards(
  [
    { a: "ana", b: "ben", kind: "student" },
    { a: "ana", b: "cat", kind: "owner" },
  ],
  { ids },
);
const taught = pairs["ana|ben"];
assert.equal(taught.a, "ben", "the teacher leads the pair");
assert.equal(taught.kind, "teacher");
assert.equal("flip" in taught, false);
assert.equal(taught.close, 40);
assert.equal(pairWordFor(taught, "ana"), "teacher", "to Ana, Ben is her teacher");
assert.equal(pairWordFor(taught, "ben"), "student");
assert.equal(pairBothWords(pairs["ana|cat"]), "owner and property");
assert.equal(pairWordFor({ a: "x", b: "y", kind: "family", detail: "siblings" }, "x"), "siblings");

// Into women and men also means futanari
assert.deepEqual(withFutanari(["women", "men"]), ["women", "men", "futanari"]);
assert.deepEqual(withFutanari(["women"]), ["women"]);

// Student (paid) and Police officer jobs; the Police Station is a Downtown workplace
const town = buildTown();
const jobs = openTownJobs(town, []);
assert.ok(JOBS_BY_PLACE.university.some((job) => job.id === "student" && job.pay > 0));
assert.ok(jobs.some((job) => job.id === "police-day"));
assert.ok(TOWN_PLACES.some((place) => place.id === "police"));
assert.ok(TOWN_DISTRICTS.find((district) => district.id === "downtown").places.includes("police"));

// The read sends the player's steer and flags a one-holder job so parallel reads can drop a clash
let sent = null;
const llm = {
  async askJson(messages) {
    sent = messages;
    return {
      model: "test",
      json: {
        main: "guarded",
        job: "boss",
        into: ["women", "men"],
        knows: "no",
        weekday: [{ from: 0, to: 24, place: "home", doing: "", sleep: true }],
        saturday: [{ from: 0, to: 24, place: "home", doing: "", sleep: true }],
        sunday: [{ from: 0, to: 24, place: "home", doing: "", sleep: true }],
      },
    };
  },
};
const proposal = await readCharacterCard(
  llm,
  { id: "ana", name: "Ana", description: "A manager." },
  { jobs, steer: "Everyone is an adult.", others: [{ id: "ben", name: "Ben" }] },
);
assert.match(sent[1].content, /THE PLAYER'S NOTES ON READING THE CARDS[^\n]*\nEveryone is an adult\./);
assert.match(sent[0].content, /student, ward, property/);
assert.match(sent[0].content, /child, adopted-child/);
assert.equal(proposal.job.id, "boss");
assert.equal(proposal.job.boss, true);
assert.deepEqual(proposal.into, ["women", "men", "futanari"]);

console.log("modern-life-sim cast reading: OK");
