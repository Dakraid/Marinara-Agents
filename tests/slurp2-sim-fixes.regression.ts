/**
 * Task G: fixes from the 7-day text simulation (`SIM-REPORT.md`, findings F1–F14).
 * One block per fix; each reproduces the simulated failure with the real module.
 */
import assert from "node:assert/strict";
import { slurpPickCreatorForSlot } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/feed/slp-posting-interval.ts";

// --- F1 slot fairness: every Creator holds a slot ahead, so the wait used to clamp to 0 for all of
// them and the id tie-break gave the lowest id every spare slot (Diane 50 of 93 posts in the sim).
{
  const HOUR = 3_600_000;
  const ids = ["-XXAdiane", "-tX3vaelith", "juniper", "kodiak", "marcus", "miku", "raven", "elsie"];
  const start = Date.parse("2026-09-29T00:00:00Z");
  // Each Creator already holds one slot within the next 24 h, like the reserve after day 1.
  const activity = new Map(ids.map((id, index) => [id, start + (index + 1) * 3 * HOUR]));
  const counts = new Map(ids.map((id) => [id, 0]));
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // 16 slots a day for 7 days, each laid down 24 h ahead of the poll that creates it.
  for (let slot = 0; slot < 16 * 7; slot += 1) {
    const at = start + slot * 1.5 * HOUR;
    const picked = slurpPickCreatorForSlot(
      ids.map((id) => ({ id })),
      (candidate) => activity.get(candidate.id)!,
      () => 1,
      at,
      random,
    )!;
    activity.set(picked.id, at + 24 * HOUR);
    counts.set(picked.id, counts.get(picked.id)! + 1);
  }
  const spread = [...counts.values()];
  assert.ok(Math.max(...spread) - Math.min(...spread) <= 1, `slots rotate fairly: ${JSON.stringify([...counts])}`);

  // Pace still matters with future slots: the busier Creator gets the slot over an equal one.
  const at = start;
  const pick = slurpPickCreatorForSlot(
    [
      { id: "a", pace: 1 },
      { id: "b", pace: 2 },
    ],
    () => at + 6 * HOUR,
    (candidate) => candidate.pace,
    at,
  );
  assert.equal(pick?.id, "b", "a busier Creator wins a tie on held future slots");

  // Real ties are not broken by id: both sides win with some random draw.
  const winners = new Set(
    [0, 0.99].map(
      (value) =>
        slurpPickCreatorForSlot(
          [{ id: "a" }, { id: "b" }],
          () => 0,
          () => 1,
          at,
          () => value,
        )?.id,
    ),
  );
  assert.deepEqual([...winners].sort(), ["a", "b"], "never-posted ties go to either Creator");
}

console.log("slurp2-sim-fixes regression passed");
