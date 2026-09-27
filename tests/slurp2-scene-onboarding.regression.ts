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
  slpSceneProgress,
  slpScenePatchHeadline,
  slpSceneSuggestions,
  slpSceneTranscript,
} from "../packages/slurp2/src/engine/packages/client/src/slp/features/onboarding/slp-scene-draft.ts";
import {
  buildSlpSceneTurnMessages,
  readSlpSceneTurn,
  sanitizeSlpScenePatch,
  slpSceneWritesHost,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/onboarding/slp-scene-prompt.ts";
import { slpSceneThreadMessages } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/onboarding/slp-scene-thread.ts";
import {
  SLP_SITE_WELCOME_OPTIONS,
  slpSiteWelcomeLead,
  slpSiteWelcomeNext,
  slpSiteWelcomeSetting,
} from "../packages/slurp2/src/engine/packages/client/src/slp/features/onboarding/slp-site-welcome.ts";
import {
  SLP_SCENE_ACTIONS,
  SLP_SCENE_MOMENTS,
  slpSceneKeepRequestSchema,
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
assert.deepEqual(step.chip?.fields, ["bio", "tags"], "an unchanged value is not a change");
assert.deepEqual(step.chip?.before, { bio: "", tags: [] });
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

// 12. Slice 4: in the creator seat the player's words are a whisper to the helper: never a line, never quoted.
const seatItems = [
  { id: "a", kind: "line" as const, speaker: "host" as const, text: "Welcome, babe." },
  { id: "w", kind: "whisper" as const, text: "make her go bolder" },
  { id: "b", kind: "line" as const, speaker: "newcomer" as const, text: "hi" },
];
assert.deepEqual(
  slpSceneTranscript(seatItems).map((line) => line.text),
  ["Welcome, babe.", "hi"],
  "a whisper never goes back as a line",
);
const [seatSystem, seatUser] = buildSlpSceneTurnMessages({
  request: {
    preset: "seat",
    moment: "name",
    action: { kind: "say", text: "make her go bolder" },
    transcript: slpSceneTranscript(seatItems),
    draft: {},
    locked: [],
    direction: "",
    disclosureMode: "hinted",
  },
  newcomerCanon: "",
  helper: {
    displayName: "Mia Rose",
    handle: "miarose",
    bio: "Pole dance and pink hair.",
    stagePersonality: "Loud and kind.",
  },
  allowedTags: [],
});
assert.match(seatSystem.content, /Mia Rose is an established Slurp Creator/u);
assert.match(
  seatSystem.content,
  /The player whispers a steer to Mia Rose: "make her go bolder"\. Mia Rose acts on it in their own words; never quote the whisper\./u,
);
assert.match(seatSystem.content, /Write one short line for the host \(Mia Rose\)/u);
assert.match(seatUser.content, /# Mia Rose \(@miarose\)\nPole dance and pink hair\./u);
assert.match(seatUser.content, /Mia Rose: Welcome, babe\./u);

// 13. Slice 5: the kept chat. Newcomer lines are the Creator's; host lines are the player's, named
// when the player did not say them as themselves; oldest first, ending before now.
const now = new Date("2026-09-27T12:00:00.000Z");
const kept = slpSceneThreadMessages({
  preset: "support",
  hostName: "Slurp Support",
  lines: [
    { speaker: "newcomer", text: "hi" },
    { speaker: "host", text: "Name?" },
    { speaker: "newcomer", text: "Velvet" },
  ],
  now,
});
assert.deepEqual(
  kept.map((message) => [message.role, message.metadata.sceneSpeaker ?? null]),
  [
    ["creator", null],
    ["viewer", "Slurp Support"],
    ["creator", null],
  ],
);
assert.ok(
  kept.every((message, i) => i === 0 || message.createdAt > kept[i - 1].createdAt),
  "oldest first",
);
assert.equal(kept.at(-1)!.createdAt, now.toISOString(), "the last line is at now, so the inbox preview moves to it");
assert.equal(
  slpSceneThreadMessages({
    preset: "friend",
    hostName: "You",
    lines: [
      { speaker: "host", text: "omg" },
      { speaker: "newcomer", text: "hi" },
    ],
    now,
  })[0].metadata.sceneSpeaker,
  undefined,
  "the friend is the player: no name above their own words",
);
assert.equal(
  slpSceneThreadMessages({
    preset: "seat",
    hostName: "Mira Vale",
    lines: [
      { speaker: "host", text: "hey" },
      { speaker: "newcomer", text: "hi" },
    ],
    now,
  })[0].metadata.sceneSpeaker,
  "Mira Vale",
);
assert.ok(
  slpSceneKeepRequestSchema.safeParse({ preset: "friend", creatorAccountId: "c", viewerPersonaId: "p", lines: [] })
    .success === false,
  "nothing to keep, nothing sent",
);

// 14. Slice 5: the player's own join (roles swapped). Support asks in order; answers map to settings.
assert.equal(slpSiteWelcomeNext({}), "who");
assert.equal(slpSiteWelcomeNext({ who: "watch", pace: "lively" }), "pictures");
assert.equal(slpSiteWelcomeNext({ who: "run", pace: "manual", pictures: "no", nights: "yes", names: "open" }), null);
assert.equal(slpSiteWelcomeLead({ who: "watch" }), "feed", "a watcher goes to the feed");
assert.equal(slpSiteWelcomeLead({ who: "both" }), "signup");
assert.equal(slpSiteWelcomeLead({}), "signup", "nothing answered: sign someone up (the old tour's end)");
assert.deepEqual(slpSiteWelcomeSetting("pace", "veryActive"), { kind: "pace", value: "veryActive" });
assert.deepEqual(slpSiteWelcomeSetting("pictures", "yes"), { kind: "pictures", value: true });
assert.deepEqual(slpSiteWelcomeSetting("nights", "no"), { kind: "nights", value: false });
assert.deepEqual(slpSiteWelcomeSetting("names", "open"), { kind: "names", value: "open" });
assert.equal(slpSiteWelcomeSetting("who", "watch"), null);
for (const [question, options] of Object.entries(SLP_SITE_WELCOME_OPTIONS)) {
  assert.ok(options.length >= 2, `${question} offers a real choice`);
}

// 15. Review fixes.
// Undo never removes a newer patch, even one that set the same value again.
{
  let undoState = slpSceneInitialState();
  undoState = applySlpScenePatch(undoState, { bio: "x" }, "A").state;
  undoState = applySlpScenePatch(undoState, { bio: "y" }, "B").state;
  undoState = applySlpScenePatch(undoState, { bio: "x" }, "C").state;
  undoState = undoSlpSceneChip(undoState, "A");
  assert.equal(undoState.draft.bio, "x", "C still owns the bio");
  undoState = undoSlpSceneChip(undoState, "C");
  assert.equal(undoState.draft.bio, "y", "undoing C goes back to B");
}
// The kept chat ends on the Creator's last word, and its last line is at now (the inbox preview).
{
  const trimmed = slpSceneThreadMessages({
    preset: "support",
    hostName: "Slurp Support",
    lines: [
      { speaker: "newcomer", text: "hi" },
      { speaker: "host", text: "Name?" },
      { speaker: "newcomer", text: "Velvet" },
      { speaker: "host", text: "Stamped." },
      { speaker: "host", text: "Welcome." },
    ],
    now,
  });
  assert.deepEqual(
    trimmed.map((message) => message.content),
    ["hi", "Name?", "Velvet"],
  );
  assert.equal(trimmed.at(-1)!.createdAt, now.toISOString());
  assert.deepEqual(
    slpSceneThreadMessages({ preset: "friend", hostName: "", lines: [{ speaker: "host", text: "hey" }], now }),
    [],
    "only host lines: nothing to keep",
  );
}
// A protected line is cut after the rename, so it always fits the next turn's schema.
{
  const shortName = { displayName: "Al", handle: "al", sourceIdentifiers: ["Al"] };
  const longLine = readSlpSceneTurn(
    { lines: [{ speaker: "newcomer", text: Array.from({ length: 400 }, () => "Al").join(" ") }] },
    { locked: [], allowedTags: [], disclosureMode: "hinted", publicIdentity: shortName, writesHost: false },
  );
  assert.ok(longLine && longLine.lines[0].text.length <= 1200, "protected text still fits 1200");
  assert.ok(
    slpSceneTurnRequestSchema.safeParse({
      preset: "friend",
      sourceAccountId: "a",
      disclosureMode: "hinted",
      moment: "bio",
      action: { kind: "continue" },
      transcript: longLine!.lines,
    }).success,
  );
}

// Onboarding pass 2: page progress in the player's words, "Name set: …" notes, the lit-up first reply.
{
  const empty = slpSceneInitialState().draft;
  const none = slpSceneProgress(empty);
  assert.deepEqual([none.done, none.total, none.ready], [0, 6, false]);
  const named = { ...empty, displayName: "Velvet Moth", handle: "velvetmoth" };
  assert.equal(slpSceneProgress({ ...named, handle: "" }).parts[0]!.done, false, "a name needs its handle too");
  const ready = { ...named, gender: "female" as const, tags: ["art", "music", "fashion"] };
  const mid = slpSceneProgress(ready);
  assert.deepEqual([mid.done, mid.ready], [2, true], "name + tags: ready to go live, 2 of 6");
  assert.equal(mid.ready, slpSceneMissing(ready).length === 0, "ready is the rule Finish checks");
  assert.equal(slpSceneProgress({ ...ready, tags: ["art"] }).ready, false);
  assert.equal(
    slpSceneProgress(ready, true).parts.find((part) => part.id === "look")!.done,
    true,
    "a photo counts as the look",
  );
  assert.equal(slpSceneProgress({ ...ready, spice: "flirty" }).parts.at(-1)!.done, true);

  assert.deepEqual(slpScenePatchHeadline(["displayName", "handle"], { displayName: " Velvet Moth ", handle: "vm" }), {
    field: "displayName",
    value: "Velvet Moth",
  });
  assert.deepEqual(slpScenePatchHeadline(["handle"], { handle: "vm" }), { field: "handle", value: "vm" });
  assert.equal(
    slpScenePatchHeadline(["bio", "tags"], { bio: "x", tags: ["a"] }),
    null,
    "several fields: listed, not quoted",
  );
  assert.equal(slpScenePatchHeadline(["bio"], { bio: "x".repeat(41) }), null, "long values are not quoted");
  assert.equal(slpScenePatchHeadline(["gender"], { gender: "female" }), null, "enum values need their label");

  assert.equal(slpSceneSuggestions("support", "look")[0], "askLook");
  assert.equal(slpSceneSuggestions("support", "review")[0], "stamp");
  assert.equal(slpSceneSuggestions("friend", "name")[0], "suggestName");
  assert.equal(slpSceneSuggestions("seat", "name")[0], "bolder");
  assert.equal(slpSceneSuggestions("friend", "shoot")[0], "lookTogether");
  for (const preset of ["support", "friend", "seat"] as const)
    for (const moment of SLP_SCENE_MOMENTS[preset]) {
      const list = slpSceneSuggestions(preset, moment);
      assert.deepEqual(
        [...list].sort(),
        [...SLP_SCENE_ACTIONS[preset]].sort(),
        `${preset}/${moment}: same set, reordered`,
      );
    }
}

console.log("slurp2-scene-onboarding: ok");
