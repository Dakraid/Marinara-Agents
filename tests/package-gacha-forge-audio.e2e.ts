import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "node:http";

const engineRoot = process.env.MARINARA_ENGINE_ROOT;
if (!engineRoot) throw new Error("Set MARINARA_ENGINE_ROOT to a compatible Engine checkout");
const appVersion = JSON.parse(readFileSync(resolve(engineRoot, "package.json"), "utf8")).version;
const portrait = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#83597d"/><circle cx="100" cy="90" r="45" fill="#eed8b2"/><path d="M35 300V190Q100 125 165 190V300Z" fill="#353d60"/></svg>')}`;
const baseRun = {
  runId: "audio-ui-proof",
  name: "Audio proof",
  scenario: "Synthetic garden audio.",
  connectionId: "fixture-model",
  hasStandardBanner: true,
  protagonist: { name: "Mari" },
  story: { preforge: "off", choices: true },
  progress: {},
  decor: { unit: { id: "arden", name: "Arden", portrait } },
  audio: {
    tts: false,
    generate: false,
    muted: false,
    musicVolume: 0.5,
    dialogueVolume: 1,
    sfxVolume: 0.5,
    autoplayPauseSeconds: 3,
    audioConnectionId: "",
  },
};
const scene = {
  ok: true,
  musicMood: "sad",
  places: [],
  choices: [],
  cast: [
    { name: "Arden", art: portrait, prota: false, characterId: "engine-arden" },
    { name: "Generated", art: portrait, prota: false, characterId: null },
  ],
  segments: [
    { speaker: "Arden", text: "ASSIGNED_FIRST" },
    { speaker: "Generated", text: "UNASSIGNED_SECOND" },
    { speaker: "Arden", text: "THOUGHT_THIRD", thought: true },
    { speaker: "", text: "NARRATION_FOURTH" },
    { speaker: "Arden", text: "ASSIGNED_LAST" },
  ],
};

async function openForge(
  page: Page,
  testInfo: TestInfo,
  options: { voice?: boolean; empty?: boolean; realGeneration?: string } = {},
) {
  const saved = structuredClone(baseRun);
  saved.audio.tts = options.voice === true;
  if (options.realGeneration) {
    saved.scenario = "W".repeat(4000);
    saved.audio.generate = true;
    saved.audio.audioConnectionId = options.realGeneration;
  }
  const speech: Record<string, unknown>[] = [];
  const generated: Record<string, any>[] = [];
  const writes: Record<string, any>[] = [];
  await page.setViewportSize(
    testInfo.project.name.includes("mobile") ? { width: 874, height: 402 } : { width: 1440, height: 900 },
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((version) => {
    localStorage.removeItem("marinara-active-chat-id");
    localStorage.setItem("marinara:whats-new:seen-version", version);
    localStorage.setItem(
      "marinara-engine-ui",
      JSON.stringify({
        state: { hasCompletedOnboarding: true, sidebarOpen: false, rightPanelOpen: false, appAccentPulseMode: false },
        version: 65,
      }),
    );
    // Controlled media only: the real host TTS service still fetches, queues, cancels and handles ended.
    // Native device playback/codec policy is deliberately outside this fixture.
    HTMLMediaElement.prototype.play = function () {
      return Promise.resolve();
    };
  }, appVersion);
  await page.route("**/api/app-settings/ui", (route) =>
    route.fulfill({ json: route.request().method() === "GET" ? { value: null } : { success: true } }),
  );
  if (!options.realGeneration)
    await page.route("**/api/connections", (route) =>
      route.fulfill({
        json: [
          { id: "fixture-model", name: "Text fixture", provider: "custom", model: "fixture" },
          {
            id: "music-fixture",
            name: "Audio fixture",
            provider: "audio_generation",
            audioMusic: true,
            audioSoundEffects: true,
          },
        ],
      }),
    );
  await page.route("**/api/tts/config", (route) =>
    route.fulfill({
      json: {
        enabled: false,
        connectionId: "speech-fixture",
        connectionProfiles: {
          "speech-fixture": { voiceAssignments: [{ characterId: "engine-arden", voice: "voice-arden" }] },
        },
      },
    }),
  );
  const wav = Buffer.alloc(44 + 16000);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(16000, 40);
  await page.route("**/api/tts/speak", async (route) => {
    speech.push(route.request().postDataJSON());
    await route.fulfill({ contentType: "audio/wav", body: wav });
  });
  if (!options.realGeneration)
    await page.route("**/api/audio/config", (route) =>
      route.fulfill({
        json: { configured: true, connectionId: "music-fixture", music: true, soundEffects: false, source: "custom" },
      }),
    );
  if (!options.realGeneration)
    await page.route("**/api/audio/generate", async (route) => {
      const body = route.request().postDataJSON();
      generated.push(body);
      await route.fulfill({
        json: {
          tag: `music:package:${body.context.key}`,
          path: `music/package/${body.context.key}.wav`,
          cached: false,
        },
      });
    });
  await page.route("**/api/game-assets/manifest", (route) =>
    route.fulfill({
      json: {
        scannedAt: "fixture",
        count: 1,
        assets: {
          "music:dialogue:slice_of_life:calm:fixture": {
            tag: "music:dialogue:slice_of_life:calm:fixture",
            category: "music",
            subcategory: "dialogue",
            name: "Fixture",
            path: "music/fixture.wav",
            ext: ".wav",
          },
        },
        byCategory: {},
      },
    }),
  );
  await page.route("**/api/game-assets/file/**", (route) => route.fulfill({ contentType: "audio/wav", body: wav }));
  await page.route("**/api/gacha-forge/state", (route) =>
    route.fulfill({
      json: options.empty
        ? { runs: [], guidesSeen: ["welcome"] }
        : {
            runs: [saved],
            activeRunId: saved.runId,
            activeRun: saved,
            guidesSeen: ["welcome", "home", "settings", "continuity", "beat", "chapter"],
          },
    }),
  );
  await page.route("**/api/gacha-forge/continuity", (route) => route.fulfill({ json: { ok: true, chapters: [] } }));
  await page.route("**/api/gacha-forge/preforge", (route) =>
    route.fulfill({ json: { ok: true, preforge: { mode: "off", locked: false, canAuto: false } } }),
  );
  await page.route("**/api/gacha-forge/beat", (route) => route.fulfill({ json: scene }));
  await page.route("**/api/gacha-forge/run/sources", async (route) => {
    const body = route.request().postDataJSON();
    writes.push(body.sources);
    Object.assign(saved, { ...body.sources, audio: { ...saved.audio, ...body.sources.audio } });
    await route.fulfill({ json: { ok: true, run: saved } });
  });
  await page.route("**/api/gacha-forge/setup/draft", (route) =>
    route.fulfill({
      json:
        route.request().method() === "GET"
          ? {
              ok: true,
              draft: {
                step: 4,
                furthest: 6,
                values: { scenario: "A synthetic world.", "audio.tts": false, "audio.generate": false },
              },
            }
          : { ok: true },
    }),
  );
  await page.goto("/");
  await page.getByRole("tab", { name: "Open Gacha Forge" }).click();
  const forge = page.locator("marinara-capability-gacha-forge");
  if (!options.empty) await showHome(forge);
  return { forge, saved, speech, generated, writes };
}

async function showHome(forge: Locator) {
  await expect.poll(() => forge.evaluate((node) => (node as any)._boot)).toBe("ready");
  await forge.evaluate((node) => {
    const game = node as any;
    game._clearBeat();
    game._bannerReady = true;
    game._artReady = true;
    game._planEscaped = true;
    game._hudView = "home";
    game._renderBrowser();
  });
  await expect(forge.getByRole("button", { name: "Game settings", exact: true })).toBeVisible();
}

async function seedScene(forge: Locator, theme = "aurora") {
  await forge.evaluate(
    (node, fixture) => {
      const game = node as any;
      game._clearBeat();
      game._boot = "ready";
      game._welcomeBegun = true;
      game._guidesSeen = new Set(["welcome", "home", "chapters", "chapter", "beat", "settings", "continuity"]);
      game._run.hudStyle = fixture.theme;
      game._bannerReady = true;
      game._artReady = true;
      game._artState = "idle";
      game._artBlocking = false;
      game._hudView = "chapter";
      game._planChapter = 1;
      game._chapterProgress = { normal: 0 };
      game._plan = { title: "Audio chapter", nodes: [{ index: 1, type: "story", title: "The garden", storyIndex: 0 }] };
      game._activeStoryNode = {
        chapter: 1,
        nodeIndex: 0,
        storyIndex: 0,
        title: "The garden",
        difficulty: "normal",
        replay: false,
      };
      game._beatState = "loading";
      game._beatRequested = false;
      game._renderBrowser();
    },
    { theme },
  );
  await expect(forge.locator("[data-vn]")).toBeVisible();
}

async function frameBottom(frame: Locator, artSelector: string) {
  await expect(frame).toBeVisible();
  await frame.evaluate(async (node) => {
    await Promise.all(
      node
        .closest(".gf-stage")!
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  return frame.evaluate((node, selector) => {
    const art = node.querySelector(selector)!;
    return {
      gap: node.getBoundingClientRect().bottom - art.getBoundingClientRect().bottom,
      edge: Number.parseFloat(getComputedStyle(node).getPropertyValue("--edge-w")),
      bottom: getComputedStyle(art).bottom,
      padding: getComputedStyle(node).paddingBottom,
    };
  }, artSelector);
}

test("Audio settings persist, mute is compact and portrait frames retain a bottom stroke", async ({
  page,
}, testInfo) => {
  const { forge, saved, generated } = await openForge(page, testInfo);
  expect(generated).toHaveLength(0);
  const settings = forge.getByRole("button", { name: "Game settings", exact: true });
  await settings.click();
  await forge.locator('[role="tab"][data-view="visual"]').click();
  for (const [field, value] of [
    ["musicVolume", "0.17"],
    ["dialogueVolume", "0"],
    ["sfxVolume", "0.31"],
    ["autoplayPauseSeconds", "4.5"],
  ]) {
    const input = forge.locator(`[data-input="audio.${field}"]`);
    await input.fill(value);
    await input.dispatchEvent("input");
    await input.dispatchEvent("change");
    await expect.poll(() => Number((saved.audio as any)[field])).toBe(Number(value));
  }
  await forge.locator('[role="tab"][data-view="sources"]').click();
  await expect(forge.getByRole("checkbox", { name: "Read character dialogue", exact: true })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await forge.getByRole("checkbox", { name: "Generate music and sound effects", exact: true }).click();
  await expect.poll(() => saved.audio.generate).toBe(true);
  await expect.poll(() => generated.filter((request) => request.kind === "music").length).toBe(1);
  await expect(forge.locator('[data-input="audio.audioConnectionId"]')).toContainText("Audio fixture");
  await forge.locator("[data-settings-back]").click();
  await forge.getByRole("button", { name: "Mute all audio", exact: true }).click();
  await expect(forge.getByRole("button", { name: "Unmute audio", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await forge.getByRole("button", { name: "Unmute audio", exact: true }).click();
  await expect(forge.getByRole("button", { name: "Mute all audio", exact: true })).toBeEnabled();
  expect(generated.filter((request) => request.kind === "music")).toHaveLength(1);
  await page.reload();
  await page.getByRole("tab", { name: "Open Gacha Forge" }).click();
  await showHome(forge);
  await expect.poll(() => forge.evaluate((node) => (node as any)._run?.audio.musicVolume)).toBe(0.17);
  for (const theme of ["aurora", "bloom", "signal", "ember", "vanguard"]) {
    await forge.evaluate((node, theme) => {
      const game = node as any;
      game._clearBeat();
      game._run.hudStyle = theme;
      game._hudView = "home";
      game._renderBrowser();
    }, theme);
    const home = await frameBottom(forge.locator(".hm-plate"), ".hm-art");
    expect(home.gap, `${theme} home ${JSON.stringify(home)}`).toBeGreaterThanOrEqual(home.edge - 0.1);
    await seedScene(forge, theme);
    const story = await frameBottom(forge.locator('.vn-plate[data-side="right"]'), ".vn-art");
    expect(story.gap, `${theme} story ${JSON.stringify(story)}`).toBeGreaterThanOrEqual(story.edge - 0.1);
    const mute = forge.locator(".vn-top > .gf-mute-chapter");
    const box = await mute.boundingBox();
    expect(box?.width).toBe(44);
    expect(box?.height).toBe(44);
    if (theme === "aurora") await page.screenshot({ path: testInfo.outputPath("audio-chapter.png") });
  }
  await showHome(forge);
  await forge.evaluate((node) => {
    const game = node as any;
    game._run.textScale = 1.75;
    game._settingsRev += 1;
    game._renderBrowser();
  });
  await settings.click();
  await forge.locator('[role="tab"][data-view="visual"]').click();
  for (const name of ["musicVolume", "dialogueVolume", "sfxVolume", "autoplayPauseSeconds"]) {
    const range = forge.locator(`[data-input="audio.${name}"]`);
    await range.scrollIntoViewIfNeeded();
    await expect(range).toBeVisible();
    expect(
      await range.evaluate((node) => {
        const box = node.getBoundingClientRect();
        const stage = node.closest(".gf-stage")!.getBoundingClientRect();
        return box.left >= stage.left && box.right <= stage.right;
      }),
      `${name} stays horizontally inside the stage at 175% text`,
    ).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("audio-mix-large-text.png") });
  await forge.evaluate((node) => {
    const game = node as any;
    game._clearBeat();
    game._run = null;
    game._activeRunId = null;
    game._creatingNew = false;
    game._boot = "ready";
    game._setupDraftAsked = false;
    game._renderKey = null;
    game._renderBrowser();
  });
  await expect(forge.getByRole("checkbox", { name: "Read character dialogue", exact: true })).toBeVisible();
  await expect(forge.getByRole("checkbox", { name: "Generate music and sound effects", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("audio-world-setup.png") });
});

test("Shipped audio requests pass the real Engine route and reuse a local provider's cached MP3", async ({
  page,
}, testInfo) => {
  const providerCalls: { path: string; body: Record<string, any> }[] = [];
  const provider = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    providerCalls.push({ path: request.url!, body: JSON.parse(body) });
    response.setHeader("content-type", "audio/mpeg");
    response.end(Buffer.from([0xff, 0xfb, 0x90, 0, 1]));
  });
  await new Promise<void>((resolve) => provider.listen(0, "127.0.0.1", resolve));
  const address = provider.address();
  if (!address || typeof address === "string") throw new Error("Missing local provider port");
  let connectionId = "";
  const outbound: { request: Record<string, any>; status: number; result: Record<string, any> }[] = [];
  const responses: Promise<void>[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith("/api/audio/generate"))
      responses.push(
        response.json().then((result) => {
          outbound.push({ request: response.request().postDataJSON(), status: response.status(), result });
        }),
      );
  });
  try {
    const created = await page.request.post("/api/connections", {
      data: {
        name: "Local Gacha MP3 fixture",
        provider: "audio_generation",
        audioGenerationSource: "custom",
        baseUrl: `http://127.0.0.1:${address.port}/v1`,
        model: "local-mp3",
        audioMusic: true,
        audioSoundEffects: true,
        audioMusicEndpoint: "music",
        audioSoundEffectsEndpoint: "sfx",
      },
    });
    expect(created.ok(), await created.text()).toBe(true);
    connectionId = (await created.json()).id;
    expect(connectionId).toBeTruthy();
    const rejected = await page.request.post("/api/audio/generate", {
      data: {
        kind: "sfx",
        prompt: "old package shape",
        audioConnectionId: connectionId,
        context: { scope: "gacha-forge", key: "negative-control" },
      },
    });
    expect(rejected.status(), "the actual route rejects the old sound-effects request shape").toBe(400);
    const { forge } = await openForge(page, testInfo, { realGeneration: connectionId });
    await expect.poll(() => providerCalls.filter((call) => call.path === "/v1/music").length).toBe(1);
    await forge.getByRole("button", { name: "Game settings", exact: true }).click();
    await expect.poll(() => providerCalls.filter((call) => call.path === "/v1/sfx").length).toBe(1);
    await expect.poll(() => outbound.length).toBe(2);
    expect(outbound.every((response) => response.status === 200)).toBe(true);
    expect(outbound.find((response) => response.request.kind === "sfx")!.request).not.toHaveProperty("context");
    for (const { path, body } of providerCalls)
      expect(body.prompt.length).toBeLessThanOrEqual(path.endsWith("music") ? 1000 : 500);
    const music = outbound.find((response) => response.request.kind === "music")!;
    const replay = await page.request.post("/api/audio/generate", { data: music.request });
    expect(replay.status(), await replay.text()).toBe(200);
    expect((await replay.json()).cached).toBe(true);
    expect(providerCalls).toHaveLength(2);
    expect(music.result.path).toMatch(/^music\/contexts\/gacha-forge\/world-/);
    await Promise.all(responses);
    await testInfo.attach("real-route-audio-proof.json", {
      body: JSON.stringify({ outbound, providerCalls }, null, 2),
      contentType: "application/json",
    });
  } finally {
    await page
      .getByRole("tab", { name: "Home", exact: true })
      .click()
      .catch(() => {});
    if (connectionId) await page.request.delete(`/api/connections/${connectionId}`);
    await new Promise<void>((resolve, reject) => provider.close((error) => (error ? reject(error) : resolve())));
  }
});

test("Autoplay waits three seconds after revealed text and voice end, and Skip cancels speech", async ({
  page,
}, testInfo) => {
  const { forge, speech } = await openForge(page, testInfo, { voice: true });
  const now = new Date();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await seedScene(forge);
  await expect.poll(() => speech.length).toBe(1);
  expect(speech[0].voice).toBe("voice-arden");
  expect(speech[0].audioConnectionId).toBe("speech-fixture");
  const state = () => page.evaluate(() => (globalThis as any).__MARINARA_HOST__.services.tts.ttsService.getState());
  await expect.poll(state).toBe("playing");
  await forge.locator("[data-auto]").click();
  await page.clock.runFor(3100);
  await expect(forge.locator("[data-text]")).toHaveText("ASSIGNED_FIRST");
  await page.evaluate(() => {
    const playback = (globalThis as any).__MARINARA_HOST__.services.tts.ttsService.getPlayback();
    (globalThis as any).__gachaOldPlayback = playback.element;
    playback.element.dispatchEvent(new Event("ended"));
  });
  await expect.poll(state).toBe("idle");
  await page.clock.runFor(2999);
  await expect(forge.locator("[data-text]")).toHaveText("ASSIGNED_FIRST");
  await page.clock.runFor(1);
  await expect(forge.locator("[data-count]")).toHaveText("02 / 05");
  await forge.locator("[data-auto]").click();
  await page.clock.runFor(1000);
  expect(speech).toHaveLength(1);
  await forge.locator("[data-box]").click();
  await page.clock.runFor(1000);
  await expect(forge.locator("[data-text]")).toHaveText("THOUGHT_THIRD");
  expect(speech).toHaveLength(1);
  await forge.locator("[data-box]").click();
  await page.clock.runFor(1000);
  await expect(forge.locator("[data-text]")).toHaveText("NARRATION_FOURTH");
  expect(speech).toHaveLength(1);
  await forge.locator("[data-box]").click();
  await expect.poll(() => speech.length).toBe(2);
  await expect.poll(state).toBe("playing");
  await forge.locator("[data-skip]").click();
  await expect.poll(state).toBe("idle");
  await page.clock.runFor(10000);
  expect(speech).toHaveLength(2);
  await forge.locator("[data-exit]").click();
  await page.evaluate(() => (globalThis as any).__gachaOldPlayback.dispatchEvent(new Event("ended")));
  await expect(forge.locator("[data-vn]")).toHaveCount(0);

  await page.route("**/api/gacha-forge/beat", (route) =>
    route.fulfill({
      json: {
        ...scene,
        segments: [
          { speaker: "", text: "BEFORE_CHOICE" },
          { speaker: "", text: "CHOOSE_A_PATH" },
          { speaker: "", text: "AFTER_CHOICE" },
        ],
        choices: [
          {
            id: "pause-choice",
            kind: "small",
            at: 1,
            options: [
              { id: "a", text: "I follow the path." },
              { id: "b", text: "I wait here." },
            ],
          },
        ],
      },
    }),
  );
  await seedScene(forge);
  await forge.locator("[data-auto]").click();
  await page.clock.runFor(4000);
  await expect(forge.locator("[data-forge-choices]")).toBeVisible();
  await expect(forge.locator("[data-auto]")).toBeDisabled();
  await page.clock.runFor(30_000);
  await expect(forge.locator("[data-forge-choices]")).toBeVisible();
  await expect(forge.locator("[data-count]")).toHaveText("02 / 03");
  await expect(forge.locator("[data-skip]")).toBeDisabled();
  expect(speech).toHaveLength(2);
});
