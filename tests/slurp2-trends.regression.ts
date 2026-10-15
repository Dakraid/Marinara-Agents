import assert from "node:assert/strict";
import {
  readSlurpTrends,
  slurpAddAdopter,
  slurpPickTrendJoin,
  slurpTrendBlocked,
  slurpTrendLabel,
  slurpTrendMayStart,
  slurpTrendOrigin,
  slurpTrendRole,
  slurpTrendStage,
  type SlurpTrend,
  type SlurpTrendPost,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/discovery/slp-trends.ts";
import type { SlurpTieCreator } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/projects/slp-creator-ties.ts";

const HOUR = 3_600_000;
const t0 = new Date("2026-10-15T12:00:00Z");
const ago = (hours: number) => new Date(t0.getTime() - hours * HOUR).toISOString();
const at = (hours: number) => new Date(t0.getTime() + hours * HOUR);

// Stage follows age alone.
const trend: SlurpTrend = {
  id: "t1", label: "Mirror selfies", source: "creator", starterId: "s", originPostId: "p", line: null,
  spicy: false, startedAt: t0.toISOString(), adopters: [],
};
assert.deepEqual([0, 35, 36, 71, 72, 119, 120].map((h) => slurpTrendStage(trend, at(h))), [
  "rising", "rising", "peak", "peak", "tired", "tired", "dead",
]);

// Only a public, fresh, clearly bigger post takes off; player likes, unlocks and tips weigh most.
const post = (over: Partial<SlurpTrendPost>): SlurpTrendPost => ({
  id: "x", createdAt: ago(5), access: "public", title: "Rooftop sunrise coffee run!", likes: 2, replies: 0,
  playerLikes: 0, unlocks: 0, tips: 0, spicy: false, ...over,
});
const quiet = [1, 2, 3].map((n) => post({ id: `q${n}`, createdAt: ago(60 + n), likes: 3 }));
assert.equal(slurpTrendOrigin([post({ likes: 10 }), ...quiet], t0), null, "ten likes is not taking off");
assert.equal(slurpTrendOrigin([post({ likes: 40 }), ...quiet], t0)?.id, "x");
assert.equal(slurpTrendOrigin([post({ playerLikes: 2, unlocks: 3, tips: 1 }), ...quiet], t0)?.id, "x", "30 by the weights");
assert.equal(slurpTrendOrigin([post({ likes: 40, access: "locked" }), ...quiet], t0), null, "a locked post never starts one");
assert.equal(slurpTrendOrigin([post({ likes: 40, createdAt: ago(80) }), ...quiet], t0), null, "too old");
assert.equal(slurpTrendOrigin([post({ likes: 40 })], t0), null, "no history");
assert.equal(slurpTrendLabel("“Rooftop sunrise coffee run for everyone here!”"), "Rooftop sunrise coffee run for everyone");

// Roles are stable and roughly the mix, and some Creators never join.
const ids = Array.from({ length: 1000 }, (_, n) => `c${n}`);
const mix: Record<string, number> = {};
for (const id of ids) mix[slurpTrendRole(id)] = (mix[slurpTrendRole(id)] ?? 0) + 1;
assert.equal(slurpTrendRole("c7"), slurpTrendRole("c7"));
assert.ok(mix.ignores! > 120 && mix.ignores! < 280 && mix.trendsetter! > 40 && mix.trendsetter! < 130, JSON.stringify(mix));

const creator = (id: string, text = "", tags: string[] = []): SlurpTieCreator =>
  ({ id, name: id, text, tags, automatic: true, followers: 100 }) as SlurpTieCreator;
const crowd = ids.map((id) => creator(id));
const byId = new Map([...crowd, creator("s", "", ["art"])].map((entry) => [entry.id, entry]));
const joins = (when: Date, tiedIds = new Set<string>()) =>
  crowd.filter((entry) =>
    slurpPickTrendJoin({
      creator: entry, sequence: 1, trends: [trend], at: when, automaticCount: 100, creators: byId, tiedIds, avoid: [],
    }),
  );
// A day-old trend: only the daily cap (15 of 100) can join, and never an "ignores" Creator.
const rising = joins(at(20));
assert.ok(rising.length > 0 && rising.every((entry) => slurpTrendRole(entry.id) !== "ignores"));
assert.equal(joins(at(130)).length, 0, "a dead trend is joined by nobody");
// Repeatable: same slot, same answer.
assert.deepEqual(joins(at(40)).map((e) => e.id), joins(at(40)).map((e) => e.id));

// Caps: the daily limit and the peak share stop joining.
const crowded: SlurpTrend = {
  ...trend, adopters: Array.from({ length: 15 }, (_, n) => ({ id: `a${n}`, at: ago(1), role: "follower" as const, postId: null })),
};
assert.equal(
  crowd.filter((entry) =>
    slurpPickTrendJoin({ creator: entry, sequence: 1, trends: [crowded], at: t0, automaticCount: 100, creators: byId, tiedIds: new Set(), avoid: [] }),
  ).length,
  0,
  "15 joined in the last day is the daily limit for 100 Creators",
);

// Hard noes: the player's avoid list and a card that refuses it both skip.
assert.equal(slurpTrendBlocked("", ["selfies"], "Mirror selfies"), true);
assert.equal(slurpTrendBlocked("She never posts mirror selfies.", [], "Mirror selfies"), true);
assert.equal(slurpTrendBlocked("She loves mirror selfies.", [], "Mirror selfies"), false);

// Start rules and repairs.
assert.equal(slurpTrendMayStart([trend], "mirror selfies", t0), false, "same label");
assert.equal(slurpTrendMayStart([trend, { ...trend, id: "b", label: "B" }, { ...trend, id: "c", label: "C" }], "D", t0), false, "three live");
assert.equal(readSlurpTrends([{ id: "", label: "x" }, null, { ...trend, line: "No slot", adopters: [{ id: "" }] }]).length, 1);
assert.equal(slurpAddAdopter(slurpAddAdopter([trend], "t1", { id: "z", at: ago(1), role: "early", postId: null }), "t1", { id: "z", at: ago(0), role: "early", postId: null })[0]!.adopters.length, 1);
console.log("slurp2 trends: ok");
