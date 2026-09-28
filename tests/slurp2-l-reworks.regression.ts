import assert from "node:assert/strict";
import { join } from "node:path";
import {
  SLURP_ADULT_LEVELS,
  SLURP_CREATOR_STATE_DEFAULT,
  SLURP_THREAD_POSTURES,
  SLURP_THREAD_STATE_DEFAULT,
  nextSlurpAdultLevel,
  slurpAdultRiseBlock,
  slurpCreatorStateCanUseMedia,
  slurpCreatorStateMediaBlock,
  type SlurpCreatorState,
  type SlurpThreadState,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/creators/slp-creator-state.ts";
import { slurpDmPictureVerdict } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/world/slp-stance.ts";
import { slurp2Source } from "./slurp2-source.ts";

// L (larger reworks from review 1).
const pkg = join(import.meta.dirname, "..", "packages/slurp2/src/engine/packages");
const read = (path: string) => slurp2Source(join(pkg, path));

// ── R1-012: the Details verdicts are the server's own rules ──
{
  // The rise blocker agrees with the rule it explains, over a grid of states.
  const values = [0, 19, 20, 35, 36, 39, 40, 41, 45, 60, 80, 100];
  let checked = 0;
  for (const adultLevel of SLURP_ADULT_LEVELS)
    for (const posture of SLURP_THREAD_POSTURES)
      for (const sexualComfort of values)
        for (const threadDesire of values)
          for (const respect of [30, 40])
            for (const resentment of [40, 41]) {
              const state = {
                ...SLURP_THREAD_STATE_DEFAULT,
                adultLevel,
                posture,
                sexualComfort,
                threadDesire,
                respect,
                resentment,
                updatedAt: "",
              } as SlurpThreadState;
              const block = slurpAdultRiseBlock(state);
              const from = SLURP_ADULT_LEVELS.indexOf(adultLevel);
              const to = SLURP_ADULT_LEVELS.indexOf(nextSlurpAdultLevel(state));
              if (block === null) assert.equal(to, from + 1, `${JSON.stringify(state)} should rise`);
              else if (block === "falling") assert.equal(to, from - 1, `${JSON.stringify(state)} should fall`);
              else assert.equal(to, from, `${JSON.stringify(state)} held by ${block}`);
              checked += 1;
            }
  assert.ok(checked > 1000);
  const base = { ...SLURP_THREAD_STATE_DEFAULT, updatedAt: "" } as SlurpThreadState;
  assert.equal(slurpAdultRiseBlock({ ...base, respect: 30, sexualComfort: 50 }), "respect");
  assert.equal(
    slurpAdultRiseBlock({ ...base, adultLevel: "explicit", sexualComfort: 90, threadDesire: 90, respect: 90 }),
    "top",
  );

  // The picture state block is the same gate the reply uses.
  for (const energy of [10, 25, 60])
    for (const arousal of [0, 36])
      for (const posture of SLURP_THREAD_POSTURES)
        for (const sexualComfort of [30, 36])
          for (const respect of [30, 36]) {
            const creator = { ...SLURP_CREATOR_STATE_DEFAULT, energy, arousal, updatedAt: "" } as SlurpCreatorState;
            const thread = { ...base, posture, sexualComfort, respect } as SlurpThreadState;
            assert.equal(
              slurpCreatorStateMediaBlock(creator, thread) === null,
              slurpCreatorStateCanUseMedia(creator, thread),
            );
          }

  // The verdict follows the reply's order and never reports a mode it would not send.
  const warm = { latitude: "normal" as const, canSendImage: true, imageMode: "friendly" as const };
  const verdict = (over: Partial<Parameters<typeof slurpDmPictureVerdict>[0]>) =>
    slurpDmPictureVerdict({ stance: warm, support: false, imagesEnabled: true, stateBlock: null, ...over });
  assert.deepEqual(verdict({}), { mode: "friendly", blockedBy: null });
  assert.deepEqual(verdict({ support: true, imagesEnabled: false }), { mode: "none", blockedBy: "support" });
  assert.deepEqual(verdict({ imagesEnabled: false }), { mode: "none", blockedBy: "images_off" });
  assert.deepEqual(verdict({ stance: { ...warm, canSendImage: false, imageMode: "none" } }), {
    mode: "none",
    blockedBy: "stance",
  });
  assert.deepEqual(verdict({ stance: { ...warm, latitude: "cool_off" } }), { mode: "none", blockedBy: "cooling_off" });
  assert.deepEqual(verdict({ stateBlock: "energy" }), { mode: "none", blockedBy: "energy" });
  assert.deepEqual(verdict({ stance: { ...warm, imageMode: "hostile" } }), { mode: "hostile", blockedBy: null });

  // Wiring: the route sends them, the client stops re-deriving.
  const threadRoutes = read("server/src/slp/features/messages/slp-messages-thread-routes.ts");
  assert.match(threadRoutes, /resolveSlurpThreadStance\(app\.db/u);
  assert.match(threadRoutes, /pictures: slurpDmPictureVerdict\(/u);
  assert.match(threadRoutes, /escalation: \{ blockedBy: slurpAdultRiseBlock\(thread\.threadState\) \}/u);
  assert.doesNotMatch(threadRoutes, /thread\.mood <= -40/u);
  const insights = read("client/src/slp/features/messages/SlpMessageInsights.tsx");
  assert.doesNotMatch(insights, /threadState\.posture === "rejecting" \|\| threadState\.posture === "defensive"/u);
  assert.doesNotMatch(insights, /\? "She is not comfortable enough with this fan yet\."/u);
  assert.match(insights, /relationship\.escalation\?\.blockedBy/u);
  assert.match(insights, /relationship\.pictures \?\?/u);
  // The prompt builder reads the same stance helper.
  assert.match(
    read("server/src/slp/features/messages/slp-message-generation-service.ts"),
    /const stance = await resolveSlurpThreadStance\(input\.db/u,
  );
}

// ── R1-011: Prompt details builds from the reply's inputs ──
{
  const promptRoute = read("server/src/slp/features/messages/slp-messages-creator-routes.ts");
  const operation = read("server/src/slp/features/messages/slp-message-operation.ts");
  for (const source of [promptRoute, operation]) {
    assert.match(source, /resolveSlurpReplyViewer\(/u);
    assert.match(source, /resolveSlurpReplyAvailability\(/u);
  }
  assert.match(promptRoute, /settings\.modelBudget\.connectionId \?\? settings\.generationConnectionId/u);
  assert.match(promptRoute, /threadId: thread\.id,/u);
  assert.match(promptRoute, /strikes: activeSlurpStrikes\(thread\.strikes, thread\.lastStrikeAt\)/u);
  assert.match(promptRoute, /details\.dayVibe !== undefined \? details\.dayVibe/u);
  assert.doesNotMatch(promptRoute, /const fan = await slurp\.getViewer/u);
}

console.log("slurp2-l-reworks: ok");
