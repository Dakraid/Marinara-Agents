// Modern Life Sim per-life sampling: validation/clamping and what the model client sends.
import assert from "node:assert/strict";
import {
  createModelClient,
  normalizeSampling,
  samplingRequestOptions,
  withPrefill,
} from "../packages/modern-life-sim/src/server/llm/model-client.mjs";
import { setLifeSettings } from "../packages/modern-life-sim/src/server/game.mjs";
import { validateStartingSkills } from "../packages/modern-life-sim/src/server/skills/skill-levels.mjs";

// Clamping, rounding, blank = unset, defaults dropped.
let { sampling, reason } = normalizeSampling({
  temperature: "3",
  topP: -1,
  topK: "12.6",
  minP: "",
  frequencyPenalty: -5,
  presencePenalty: "0.5",
  verbosity: "high",
  serviceTier: "",
  stop: "END, ###\nSTOP",
  customParameters: '{"seed": 7}',
  maxTokensScale: 9,
  bogus: 1,
});
assert.equal(reason, "");
assert.deepEqual(sampling, {
  temperature: 2,
  topP: 0,
  topK: 13,
  frequencyPenalty: -2,
  presencePenalty: 0.5,
  verbosity: "high",
  stop: ["END", "###", "STOP"],
  customParameters: { seed: 7 },
  maxTokensScale: 4,
});

// Partial patch merges; blank clears one key; scale 1 is the default and is dropped.
assert.deepEqual(
  normalizeSampling({ temperature: "", maxTokensScale: 1 }, { temperature: 1, maxTokensScale: 2 }).sampling,
  {},
);
assert.deepEqual(normalizeSampling(null, { temperature: 1 }).sampling, {});

// Clear reasons for bad input.
assert.match(normalizeSampling({ customParameters: "{nope" }).reason, /not valid JSON/);
assert.match(normalizeSampling({ customParameters: "[1]" }).reason, /JSON object/);
assert.match(normalizeSampling({ temperature: "hot" }).reason, /Temperature must be a number/);
assert.match(normalizeSampling({ verbosity: "loud" }).reason, /Verbosity/);
assert.match(normalizeSampling({ stop: Array(9).fill("x") }).reason, /at most 8/);
assert.match(normalizeSampling({ stop: "x".repeat(41) }).reason, /40 characters/);

// setLifeSettings: rejects without changing, merges on success, keeps old saves (no sampling) working.
let life = { settings: { connection: "c1", effort: "low", language: "English" } };
let bad = setLifeSettings(life, { sampling: { customParameters: "{" } });
assert.equal(bad.ok, false);
assert.equal(life.settings.sampling, undefined);
assert.ok(setLifeSettings(life, { sampling: { temperature: 0.7 } }).ok);
assert.ok(setLifeSettings(life, { sampling: { topK: 40 } }).ok);
assert.deepEqual(life.settings.sampling, { temperature: 0.7, topK: 40 });
assert.equal(life.settings.connection, "c1");

// Nothing set: nothing sent.
assert.deepEqual(samplingRequestOptions({}), {});
assert.deepEqual(samplingRequestOptions({ maxTokensScale: 2 }), {});

// Model client passes the set values with requestWins and scales maxTokens.
let seen = [];
let runtime = {
  languageModels: {
    resolveForRequest: async () => ({
      model: "m",
      connectionId: "c1",
      maxContext: 600, // tiny context: the cap falls back to the (scaled) minimum
      chatComplete: async (messages, options) => {
        seen.push(options);
        return { content: "hi", finishReason: "stop" };
      },
    }),
  },
};
let client = createModelClient({
  runtime,
  settings: { sampling: { temperature: 0.7, stop: ["END"], maxTokensScale: 2 } },
});
await client.ask([{ role: "user", content: "x" }], { maxTokens: 500 });
assert.equal(seen[0].temperature, 0.7);
assert.deepEqual(seen[0].stop, ["END"]);
assert.equal(seen[0].requestWins, true);
assert.equal(seen[0].maxTokensScale, undefined);
assert.equal(seen[0].maxTokens, 1000);

await createModelClient({ runtime, settings: {} }).ask([{ role: "user", content: "x" }], { maxTokens: 500 });
assert.equal(seen[1].maxTokens, 500);
assert.equal(seen[1].requestWins, undefined);
assert.equal(seen[1].temperature, undefined);

// Prefills: kept as text, blank clears, never sent as request options.
assert.deepEqual(
  normalizeSampling({ assistantPrefill: "Sure:", assistantReasoningPrefill: "Think" }, { assistantPrefill: "old" })
    .sampling,
  { assistantPrefill: "Sure:", assistantReasoningPrefill: "Think" },
);
assert.deepEqual(normalizeSampling({ assistantPrefill: " " }, { assistantPrefill: "old" }).sampling, {});
assert.match(normalizeSampling({ assistantPrefill: "x".repeat(4001) }).reason, /Assistant prefill/);
assert.deepEqual(samplingRequestOptions({ assistantPrefill: "Sure:" }), {});

// withPrefill: appended after a final user turn only; reasoning only for providers that take it.
let user = [{ role: "user", content: "x" }];
assert.equal(withPrefill(user, {}), user);
assert.equal(withPrefill([{ role: "assistant", content: "a" }], { assistantPrefill: "Sure:" }).length, 1);
assert.deepEqual(withPrefill(user, { assistantPrefill: "Sure: " }).at(-1), { role: "assistant", content: "Sure:" });
assert.equal(withPrefill(user, { assistantReasoningPrefill: "Think" }, "anthropic"), user);
assert.deepEqual(withPrefill(user, { assistantReasoningPrefill: "Think" }, "openrouter").at(-1), {
  role: "assistant",
  content: "",
  providerMetadata: { reasoning_content: "Think", partial: true },
});

let sent = [];
let prefillRuntime = {
  languageModels: {
    resolveForRequest: async () => ({
      model: "m",
      connectionId: "c1",
      chatComplete: async (messages) => {
        sent.push(messages);
        return { content: "hi", finishReason: "stop" };
      },
    }),
  },
};
await createModelClient({
  runtime: prefillRuntime,
  settings: { sampling: { assistantPrefill: "Sure:", assistantReasoningPrefill: "Think" } },
  providerOf: async (id) => (id === "c1" ? "openai" : ""),
}).ask([{ role: "user", content: "x" }]);
assert.deepEqual(sent[0].at(-1), {
  role: "assistant",
  content: "Sure:",
  providerMetadata: { reasoning_content: "Think", partial: true },
});

// Starting skills: 5 points is only a recommendation; every skill may go to the top level.
assert.deepEqual(validateStartingSkills({ fitness: 10, charm: 10, knowledge: 10, cooking: 10 }), {
  fitness: 10,
  charm: 10,
  knowledge: 10,
  cooking: 10,
});
assert.equal(validateStartingSkills({ fitness: 11 }), false);
assert.equal(validateStartingSkills({ fitness: 1.5 }), false);

console.log("modern-life-sim sampling regression: ok");
