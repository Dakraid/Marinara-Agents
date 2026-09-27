/** Role-play Creator sign-up (overnight plan item 7): draft patches, locks, undo, and the server's answer cleanup. */
import assert from "node:assert/strict";
import {
  applySlpScenePatch,
  editSlpSceneField,
  slpSceneInitialState,
  slpSceneLimitsText,
  slpSceneMissing,
  slpSceneRedraftPatch,
  slpSceneShootGuidance,
  slpSceneStageProfile,
  toggleSlpSceneLock,
  undoSlpSceneChip,
} from "../packages/slurp2/src/engine/packages/client/src/slp/features/onboarding/slp-scene-draft.ts";
import {
  slpSceneGuidance,
  slpSceneTranscript,
} from "../packages/slurp2/src/engine/packages/client/src/slp/features/onboarding/slp-scene-draft.ts";
import {
  buildSlpSceneTurnMessages,
  readSlpSceneTurn,
  sanitizeSlpScenePatch,
  slpSceneWritesHost,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/onboarding/slp-scene-prompt.ts";
import {
  SLP_SCENE_ACTIONS,
  SLP_SCENE_MOMENTS,
  slpSceneTurnRequestSchema,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-scene.ts";

// 1. A patch changes only unlocked fields that really change, and becomes one chip.
let state = slpSceneInitialState({ displayName: "Mira" });
let step = applySlpScenePatch(
  state,
  { displayName: "Mira", bio: "Hi, I'm new.", tags: ["art", "music", "fashion"] },
  "c1",
);
assert.ok(step.chip);
assert.deepEqual(step.chip.fields, ["bio", "tags"], "an unchanged value is not a change");
assert.deepEqual(step.chip.before, { bio: "", tags: [] });
state = step.state;
assert.equal(state.draft.bio, "Hi, I'm new.");
assert.equal(applySlpScenePatch(state, { bio: "Hi, I'm new." }, "c-none").chip, null, "no change, no chip");

// 2. A hand edit sets the value and locks it; a later patch cannot overwrite it.
state = editSlpSceneField(state, "bio", "My own words.");
assert.deepEqual(state.locked, ["bio"]);
step = applySlpScenePatch(state, { bio: "Model words.", handle: "mira_m" }, "c2");
assert.equal(step.state.draft.bio, "My own words.", "locked field kept");
assert.equal(step.state.draft.handle, "mira_m");
assert.deepEqual(step.chip?.fields, ["handle"]);
state = step.state;

// 3. Unlocking lets patches in again.
state = toggleSlpSceneLock(state, "bio");
assert.deepEqual(state.locked, []);
state = applySlpScenePatch(state, { bio: "Model words." }, "c3").state;
assert.equal(state.draft.bio, "Model words.");

// 4. Undo restores a chip's fields, but only those nothing changed since.
state = applySlpScenePatch(state, { displayName: "Mira Vale", wardrobe: "Oversized hoodies" }, "c4").state;
state = applySlpScenePatch(state, { wardrobe: "Silk slips" }, "c5").state;
state = undoSlpSceneChip(state, "c4");
assert.equal(state.draft.displayName, "Mira", "untouched field goes back");
assert.equal(state.draft.wardrobe, "Silk slips", "a later patch is never thrown away by an older undo");
assert.equal(state.chips.find((chip) => chip.id === "c4")?.undone, true);
assert.equal(undoSlpSceneChip(state, "c4"), state, "a chip undoes once");
state = undoSlpSceneChip(state, "c5");
assert.equal(state.draft.wardrobe, "Oversized hoodies", "undo walks back to that chip's own before");
// A locked field is never undone either.
state = applySlpScenePatch(state, { locations: "Rooftop" }, "c6").state;
state = toggleSlpSceneLock(state, "locations");
state = undoSlpSceneChip(state, "c6");
assert.equal(state.draft.locations, "Rooftop");

// 5. What the page still needs, and what it saves.
assert.deepEqual(slpSceneMissing(slpSceneInitialState().draft), ["displayName", "handle", "gender", "tags"]);
assert.deepEqual(slpSceneMissing({ ...state.draft, gender: "female" }), []);
const profile = slpSceneStageProfile({ ...state.draft, handle: "@mira_m ", gender: "female" }, "hinted");
assert.equal(profile.handle, "mira_m");
assert.equal(profile.disclosureMode, "hinted");
assert.equal("spice" in profile || "turnOns" in profile, false, "limits never go on the page itself");
assert.equal(slpSceneLimitsText(state.draft), "", "nothing said, no strategy line");
assert.equal(
  slpSceneLimitsText({ ...state.draft, spice: "suggestive", turnOns: "lingerie", hardNoes: "face" }),
  "How far the page goes: suggestive.\nHappy to show: lingerie\nHard noes: face",
);
assert.deepEqual(slpSceneRedraftPatch({ displayName: " X ", bio: "", gender: null, tags: [] }), { displayName: "X" });

// 6. Server cleanup: known fields, limits, tag list, gender words, locks, and the linked identity.
const identity = { displayName: "Anna Berg", handle: "annaberg", sourceIdentifiers: ["Anna"] };
const ctx = {
  locked: ["bio" as const],
  allowedTags: ["art", "music", "fashion", "cosplay"],
  disclosureMode: "hinted" as const,
  publicIdentity: identity,
};
assert.deepEqual(
  sanitizeSlpScenePatch(
    {
      displayName: "Anna Berg",
      handle: "@velvet moth",
      bio: "locked, ignored",
      stagePersonality: "Anna posts late at night.",
      gender: "woman",
      tags: ["art", "crypto", "Music"],
      spice: "Explicit",
      hacker: "x",
    },
    ctx,
  ),
  {
    handle: "velvet_moth",
    stagePersonality: "you-know-who posts late at night.",
    gender: "female",
    tags: ["art", "music"],
    spice: "explicit",
  },
  "the real name is dropped as a stage name and rewritten in prose",
);
assert.deepEqual(
  sanitizeSlpScenePatch(
    { displayName: "Other", handle: "other", bio: "x".repeat(900) },
    { ...ctx, locked: [], disclosureMode: "open" },
  ),
  { bio: "x".repeat(500) },
  "an open page keeps its public name and handle; long text is cut to the limit",
);
assert.deepEqual(sanitizeSlpScenePatch("nope", ctx), {});

// 7. Lines: only the speakers this exchange may write, the newcomer must answer, at most six.
assert.equal(slpSceneWritesHost("support", { kind: "say", text: "Name?" }), false, "the player's words are theirs");
assert.equal(slpSceneWritesHost("support", { kind: "suggest", id: "askName" }), true);
assert.equal(slpSceneWritesHost("seat", { kind: "say", text: "go bolder" }), true, "in the seat the helper talks");
const turn = readSlpSceneTurn(
  {
    lines: [
      { speaker: "host", text: "Name please." },
      { speaker: "newcomer", text: "Anna. I mean, Velvet." },
      { speaker: "narrator", text: "x" },
    ],
    patch: { displayName: "Velvet" },
    momentDone: true,
  },
  { ...ctx, writesHost: false },
);
assert.deepEqual(turn, {
  lines: [{ speaker: "newcomer", text: "you-know-who. I mean, Velvet." }],
  patch: { displayName: "Velvet" },
  momentDone: true,
});
assert.equal(readSlpSceneTurn({ lines: [{ speaker: "host", text: "hi" }] }, { ...ctx, writesHost: true }), null);
const many = readSlpSceneTurn(
  { lines: Array.from({ length: 10 }, (_, i) => ({ speaker: "newcomer", text: `line ${i}` })) },
  { ...ctx, writesHost: false },
);
assert.equal(many?.lines.length, 6);

// 8. The prompt: locked and open-identity fields are off limits, the direction is private.
const [system, user] = buildSlpSceneTurnMessages({
  request: {
    preset: "support",
    moment: "name",
    action: { kind: "say", text: "What should we call you?" },
    transcript: [{ speaker: "host", text: "What should we call you?" }],
    draft: { bio: "hi" },
    locked: ["bio"],
    direction: "keep it casual",
    disclosureMode: "open",
  },
  newcomerCanon: "Name: Anna",
  openIdentity: { displayName: "Anna Berg", handle: "annaberg" },
  allowedTags: ["art"],
});
assert.match(system.content, /Never set these fields, they are fixed: bio, displayName, handle\./u);
assert.match(system.content, /never mention it: "keep it casual"/u);
assert.match(system.content, /for the newcomer only/u);
assert.doesNotMatch(system.content, /\bdisplayName \(stage name\)/u);
assert.match(user.content, /Slurp Support \(the player\): What should we call you\?/u);

// 9. The request schema: the seat needs its helper; every preset's moments and actions are known.
assert.equal(
  slpSceneTurnRequestSchema.safeParse({
    preset: "seat",
    sourceAccountId: "a",
    disclosureMode: "open",
    moment: "name",
    action: { kind: "open" },
  }).success,
  false,
);
for (const [preset, moments] of Object.entries(SLP_SCENE_MOMENTS)) {
  const parsed = slpSceneTurnRequestSchema.safeParse({
    preset,
    sourceAccountId: "a",
    helperCreatorId: "h",
    disclosureMode: "hinted",
    moment: moments[0],
    action: { kind: "suggest", id: SLP_SCENE_ACTIONS[preset as keyof typeof SLP_SCENE_ACTIONS][0] },
  });
  assert.ok(parsed.success, preset);
}

// 10. Slice 2: a suggested action and "Let it play" write the host line too; the direction stays out of the chat.
for (const [preset, ids] of Object.entries(SLP_SCENE_ACTIONS)) {
  for (const id of ids) {
    const [prompt] = buildSlpSceneTurnMessages({
      request: {
        preset: preset as keyof typeof SLP_SCENE_ACTIONS,
        moment: SLP_SCENE_MOMENTS[preset as keyof typeof SLP_SCENE_MOMENTS][0],
        action: { kind: "suggest", id: id as never },
        transcript: [],
        draft: {},
        locked: [],
        direction: "",
        disclosureMode: "hinted",
      },
      newcomerCanon: "",
      helper: preset === "seat" ? { displayName: "Mia", handle: "mia", bio: "", stagePersonality: "" } : null,
      allowedTags: [],
    });
    assert.match(prompt.content, /Next, write the host doing this: \S/u, `${preset}/${id} has a brief`);
    assert.match(prompt.content, /Write one short line for the host/u, `${preset}/${id} writes the host`);
  }
}
const [autoPrompt] = buildSlpSceneTurnMessages({
  request: {
    preset: "friend",
    moment: "bio",
    action: { kind: "continue" },
    transcript: [],
    draft: {},
    locked: [],
    direction: "",
    disclosureMode: "hinted",
  },
  newcomerCanon: "",
  allowedTags: [],
});
assert.match(autoPrompt.content, /move on by itself for one exchange/u);
assert.doesNotMatch(autoPrompt.content, /direction for the whole scene/u, "no direction, no direction line");
const guidanceItems = [
  ...Array.from({ length: 60 }, (_, i) => ({
    id: `l${i}`,
    kind: "line" as const,
    speaker: "newcomer" as const,
    text: `line ${i} ${"x".repeat(60)}`,
  })),
  { id: "p", kind: "patch" as const, chipId: "c", fields: ["bio" as const], redraft: false },
];
const guidance = slpSceneGuidance(guidanceItems, "Slurp Support", "keep it casual");
assert.ok(guidance.length <= 2000, "the redraft guidance fits the draft route");
assert.match(guidance, /Direction: keep it casual/u);
assert.match(guidance, /line 59 /u, "the newest lines win the space");
assert.doesNotMatch(guidance, /line 0 /u);
assert.equal(slpSceneTranscript(guidanceItems).length, 40, "a turn sends the last 40 lines");

// 11. Slice 3: the photo shoot asks the image pipeline for the chosen outfit and place.
assert.equal(
  slpSceneShootGuidance("avatar", " red slip dress ", "rooftop at dusk"),
  "The first profile photo from their first photo shoot. Outfit: red slip dress. Place: rooftop at dusk.",
);
assert.match(slpSceneShootGuidance("banner", "", "neon diner"), /^The cover photo[^]*Place: neon diner\.$/u);
assert.doesNotMatch(slpSceneShootGuidance("banner", "", "neon diner"), /Outfit/u, "an empty outfit is left out");
assert.ok(
  slpSceneShootGuidance("avatar", "x".repeat(3000), "y".repeat(3000)).length < 2000,
  "fits the artwork guidance limit",
);

console.log("slurp2-scene-onboarding: ok");
