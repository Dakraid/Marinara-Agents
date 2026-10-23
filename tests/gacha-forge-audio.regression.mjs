// Exercise audio behavior with deterministic host boundaries; no provider is contacted.
import assert from "node:assert/strict";
import { normalizeForgeAudio } from "../packages/gacha-forge/src/audio-settings.mjs";
import { forgeAudioEnglish, forgeAudioFields } from "../packages/gacha-forge/src/audio-en.mjs";
import {
  ForgeAudioController,
  forgeExplicitVoice,
  forgeMusicContextKey,
  loadForgeAudioConnections,
  saveForgeAudioSources,
} from "../packages/gacha-forge/src/audio-client.mjs";
import { createForgeVoiceLine, forgeVoiceCharacter } from "../packages/gacha-forge/src/audio-story.mjs";

const before = {
  normalizeForgeAudio: globalThis.normalizeForgeAudio,
  forgeAudioEnglish: globalThis.forgeAudioEnglish,
  forgeAudioFields: globalThis.forgeAudioFields,
  Ze: globalThis.Ze,
  fetch: globalThis.fetch,
  Option: globalThis.Option,
};
globalThis.normalizeForgeAudio = normalizeForgeAudio;
globalThis.forgeAudioEnglish = forgeAudioEnglish;
globalThis.forgeAudioFields = forgeAudioFields;
const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
let cases = 0;
async function test(name, callback) {
  await callback();
  process.stdout.write(`ok ${++cases} - ${name}\n`);
}

try {
  await test("audio connection lists accept stored flags and preserve missing or quarantined IDs on failure", async () => {
    globalThis.Option = class {
      constructor(text, value) {
        Object.assign(this, { text, value, disabled: false });
      }
    };
    const rows = [
      { id: "stored", provider: "audio_generation", audioMusic: "true", profileImportReviewRequired: "false" },
      { id: "boolean", provider: "audio_generation", audioSoundEffects: true },
      { id: "quarantined", provider: "audio_generation", audioMusic: "true", profileImportReviewRequired: "true" },
      { id: "quarantined-bool", provider: "audio_generation", audioMusic: true, profileImportReviewRequired: true },
      { id: "off", provider: "audio_generation", audioMusic: "false", audioSoundEffects: false },
      { id: "speech", provider: "audio", audioMusic: true },
    ];
    for (const selected of ["", "stored", "boolean", "missing", "quarantined", "quarantined-bool"]) {
      const select = {
        dataset: {},
        options: [],
        replaceChildren(...options) {
          this.options = options;
        },
        add(option) {
          this.options.push(option);
        },
      };
      const response = deferred();
      globalThis.Ze = () => response.promise;
      const loaded = loadForgeAudioConnections(
        { querySelector: () => select },
        { "audio.audioConnectionId": selected },
      );
      assert.equal(select.value, selected, "restored setup form can read the explicit ID before HTTP completes");
      assert.equal(select.disabled, true);
      response.resolve({ ok: true, json: async () => rows });
      await loaded;
      assert.deepEqual(
        select.options.filter((option) => !option.disabled).map((option) => option.value),
        ["", "stored", "boolean"],
      );
      assert.equal(select.value, selected);
      assert.equal(
        select.options.find((option) => option.value === selected)?.disabled,
        !["", "stored", "boolean"].includes(selected),
      );
      assert.equal(select.disabled, false);
    }
    const select = {
      dataset: {},
      options: [],
      replaceChildren(...options) {
        this.options = options;
      },
      add(option) {
        this.options.push(option);
      },
    };
    globalThis.Ze = () => Promise.reject(new Error("offline"));
    await loadForgeAudioConnections({ querySelector: () => select }, { "audio.audioConnectionId": "missing" });
    assert.equal(select.value, "missing");
    assert.equal(select.options.find((option) => option.value === "missing").disabled, true);
    assert.equal(select.options[0].text, forgeAudioEnglish["audio.connectionsFailed"]);
  });

  await test("world audio defaults are opt-in and zero volumes survive normalization", () => {
    const defaults = normalizeForgeAudio();
    assert.equal(defaults.tts, false);
    assert.equal(defaults.generate, false);
    assert.equal(defaults.autoplayPauseSeconds, 3);
    const value = normalizeForgeAudio({
      tts: true,
      generate: "true",
      musicVolume: 0,
      dialogueVolume: "0",
      sfxVolume: -5,
      autoplayPauseSeconds: 900,
      credentials: "not persisted",
    });
    assert.equal(value.musicVolume, 0);
    assert.equal(value.dialogueVolume, 0);
    assert.equal(value.sfxVolume, 0);
    assert.equal(value.generate, false);
    assert.equal(value.autoplayPauseSeconds, 30);
    assert.equal("credentials" in value, false);
    assert.equal(normalizeForgeAudio({ musicVolume: NaN }).musicVolume, 0.5);
  });

  await test("explicit voices use the chosen profile and exact ID, never name or default fallback", () => {
    const config = {
      enabled: true,
      connectionId: "current",
      voice: "default",
      voiceAssignments: [{ characterId: "a", voice: "wrong-source" }],
      connectionProfiles: {
        current: { voiceAssignments: [{ characterId: "a", characterName: "Old Name", voice: "assigned" }] },
      },
    };
    assert.equal(forgeExplicitVoice(config, "a"), "assigned");
    assert.equal(forgeExplicitVoice(config, "Old Name"), null);
    assert.equal(forgeExplicitVoice(config, "unknown"), null);
    assert.equal(
      forgeExplicitVoice({ ...config, connectionProfiles: {} }, "a"),
      null,
      "a missing selected profile must not borrow legacy voice assignments",
    );
    assert.equal(
      forgeExplicitVoice({ ...config, enabled: false }, "a"),
      "assigned",
      "an explicit connection is independent of the legacy enabled switch",
    );
    assert.equal(
      forgeExplicitVoice(
        { enabled: false, connectionId: "", voiceAssignments: [{ characterId: "a", voice: "legacy" }] },
        "a",
      ),
      null,
    );
    assert.equal(
      forgeExplicitVoice(
        { enabled: true, connectionId: "", voiceAssignments: [{ characterId: "a", voice: "legacy" }] },
        "a",
      ),
      "legacy",
    );
    assert.equal(
      forgeExplicitVoice(
        {
          voiceAssignments: [
            { characterId: "a", voice: "one" },
            { characterId: "a", voice: "two" },
          ],
        },
        "a",
      ),
      null,
    );
    const cast = [
      { name: "Arden", characterId: "a" },
      { name: "Arden", characterId: "b" },
    ];
    assert.equal(
      forgeVoiceCharacter(cast, "Arden", () => cast[0]),
      null,
    );
    assert.equal(forgeVoiceCharacter([{ name: "月", characterId: "c" }], "月", () => null)?.characterId, "c");
  });

  await test("revealed text waits for playback completion and stale/skip voices cannot advance a later line", async () => {
    let ready = 0;
    const calls = [];
    const audio = {
      speak(_segment, _character, signal) {
        const own = deferred();
        calls.push({ ...own, signal });
        return own.promise;
      },
    };
    const line = createForgeVoiceLine(audio, () => {
      ready += 1;
    });
    line.start({ text: "first" }, {});
    await tick();
    line.reveal();
    assert.equal(line.ready(), false, "text completion alone must not advance");
    calls[0].resolve();
    await tick();
    assert.equal(line.ready(), true);
    assert.equal(ready, 1);
    line.start({ text: "old" }, {});
    await tick();
    line.start({ text: "new" }, {});
    await tick();
    assert.equal(calls[1].signal.aborted, true);
    line.reveal();
    calls[1].resolve();
    await tick();
    assert.equal(line.ready(), false, "old completion cannot release new text");
    calls[2].resolve();
    await tick();
    assert.equal(ready, 2);
    line.start({ text: "skipped" }, {}, true);
    line.reveal();
    await tick();
    assert.equal(calls.length, 3, "Skip never starts another synthesis");
    line.dispose();
    assert.equal(line.ready(), false);
  });

  const fixture = () => {
    const events = [];
    const player = Object.fromEntries(
      ["unlock", "playMusic", "stopMusic", "playSfx", "setVolumes", "setMuted", "dispose"].map((method) => [
        method,
        (...args) => events.push([method, ...args]),
      ]),
    );
    const host = {
      _run: { runId: "audio-world", scenario: "A synthetic garden.", audio: {} },
      _root: {
        addEventListener() {},
        removeEventListener() {},
        querySelector() {
          return null;
        },
      },
      capabilityProps: {},
    };
    const voices = [];
    const services = {
      audio: {
        createPlayer: () => player,
        getAssetManifest: async () => ({ assets: {} }),
        selectDefaultMusic: (cue) => `stock:${cue}`,
      },
      tts: { ttsService: { getActiveId: () => null, speakSequence: async (...args) => voices.push(args) } },
    };
    const controller = new ForgeAudioController(host, services);
    controller.notice = (message) => events.push(["notice", message]);
    return { host, controller, events, voices };
  };

  await test("stock audio needs no generation and volume changes do not restart tracks", async () => {
    globalThis.Ze = () => {
      throw new Error("No HTTP expected for stock audio");
    };
    const { controller, events } = fixture();
    await controller.cue("home");
    controller.configure({ musicVolume: 0.17, sfxVolume: 0 });
    await controller.cue("home");
    assert.equal(events.filter(([event]) => event === "playMusic").length, 1);
    assert.deepEqual(events.filter(([event]) => event === "setVolumes").at(-1)[1], { music: 0.17, sfx: 0 });
    await controller.effect("click");
    assert.equal(
      events.some(([event]) => event === "playSfx"),
      false,
    );
    controller.dispose();
    controller.dispose();
    assert.equal(events.filter(([event]) => event === "dispose").length, 1);
  });

  await test("generated cues dedupe, reuse and return to stock when disabled", async () => {
    const requests = [];
    globalThis.Ze = async (path, options) => {
      const body = JSON.parse(options.body);
      requests.push({ path, ...body });
      return {
        ok: true,
        json: async () => ({ tag: `${body.kind}:package:one`, path: `${body.kind}/package/one.mp3` }),
      };
    };
    const { controller, events } = fixture();
    controller.configure({ generate: true, audioConnectionId: "dedicated" });
    await Promise.all([controller.cue("boss"), controller.cue("boss")]);
    await controller.cue("boss");
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0].context, {
      scope: "gacha-forge",
      key: forgeMusicContextKey("audio-world", "dedicated", "boss"),
      lengthMs: 60000,
    });
    assert.equal(requests[0].audioConnectionId, "dedicated");
    assert.equal(events.filter(([event]) => event === "playMusic").length, 2, "stock then generated");
    await controller.effect("hit");
    await tick();
    await controller.effect("hit");
    assert.equal(events.filter(([event]) => event === "playSfx").at(-1)[1], "sfx:package:one");
    controller.configure({ ...controller.settings, generate: false });
    await controller.cue("boss");
    assert.equal(events.filter(([event]) => event === "playMusic").at(-1)[1], "stock:boss");
    await controller.effect("hit");
    assert.equal(events.filter(([event]) => event === "playSfx").at(-1)[1], "sfx:combat:spell-hit");
    controller.dispose();
  });

  await test("generation errors leave stock music playing and do not retry a cue on every render", async () => {
    let requests = 0;
    globalThis.Ze = async () => {
      requests += 1;
      return { ok: false, status: 503 };
    };
    const { controller, events } = fixture();
    controller.configure({ generate: true, audioConnectionId: "unavailable" });
    await controller.cue("home");
    await controller.cue("home");
    assert.equal(requests, 1);
    assert.deepEqual(
      events.filter(([event]) => event === "playMusic").map(([, tag]) => tag),
      ["stock:home"],
    );
    assert.equal(events.filter(([event]) => event === "notice").at(-1)[1], "audio.generationFailed");
    assert.equal(controller.generated.size, 0);
    controller.dispose();
  });

  await test("complete provider prompts are bounded and sound effects never use a music context", async () => {
    const requests = [];
    globalThis.Ze = async (_path, options) => {
      const body = JSON.parse(options.body);
      requests.push(body);
      return { ok: true, json: async () => ({ tag: `${body.kind}:fixture`, path: `${body.kind}/fixture.mp3` }) };
    };
    const { host, controller } = fixture();
    host._run.scenario = "W".repeat(4000);
    controller.runId = "_world-with-a-valid-NanoID-prefix";
    controller.configure({ generate: true, audioConnectionId: "dedicated" });
    await controller.generate("music", "boss");
    await controller.generate("sfx", "critical");
    assert.equal("context" in requests[1], false, "the real generic route rejects contexts on sound effects");
    assert.ok(requests[0].prompt.length <= 1000, "the entire music style must fit SunoAPI's bound");
    assert.ok(requests[1].prompt.length <= 500, "the entire sound-effects prompt must fit SunoAPI's bound");
    assert.match(requests[0].context.key, /^[a-z0-9][a-z0-9_-]{0,159}$/);
    assert.notEqual(forgeMusicContextKey("_world", "A", "boss"), forgeMusicContextKey("_world", "a", "boss"));
    assert.notEqual(forgeMusicContextKey("_world", "a", "boss"), forgeMusicContextKey("-world", "a", "boss"));
    assert.match(forgeMusicContextKey("W".repeat(200), "C".repeat(200), "happy"), /^world-[a-f0-9]+-happy$/);
    controller.dispose();
  });

  await test("current connection capabilities limit generation and disabling it aborts an in-flight request", async () => {
    const requests = [];
    globalThis.Ze = async (path, options) => {
      if (path === "/api/audio/config")
        return {
          ok: true,
          json: async () => ({ configured: true, connectionId: "current-music", music: true, soundEffects: false }),
        };
      requests.push({ ...JSON.parse(options.body), signal: options.signal });
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")), {
          once: true,
        });
      });
    };
    const { controller, events } = fixture();
    controller.configure({ generate: true });
    await controller.effect("click");
    await tick();
    assert.equal(requests.length, 0, "music-only connections do not generate sound effects");
    const pending = controller.cue("home");
    await tick();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].audioConnectionId, "current-music");
    assert.equal(requests[0].signal.aborted, false);
    controller.configure({ generate: false });
    await pending;
    assert.equal(requests[0].signal.aborted, true);
    assert.equal(controller.generated.size, 0);
    assert.deepEqual(
      events.filter(([event]) => event === "playMusic").map(([, tag]) => tag),
      ["stock:home"],
    );
    assert.equal(
      events.some(([event]) => event === "notice"),
      false,
      "cancellation is not a provider failure",
    );
    controller.dispose();
  });

  await test("unvoiced and thought lines are silent; assigned dialogue forwards the exact speech connection", async () => {
    let reads = 0;
    globalThis.Ze = async () => {
      reads += 1;
      return {
        ok: true,
        json: async () => ({
          enabled: true,
          connectionId: "speech-source",
          connectionProfiles: {
            "speech-source": { voiceAssignments: [{ characterId: "engine-char", voice: "voice-a" }] },
          },
        }),
      };
    };
    const { controller, voices } = fixture();
    controller.configure({ tts: true });
    await controller.speak({ speaker: "Arden", text: "no card" }, {}, new AbortController().signal);
    await controller.speak(
      { speaker: "Arden", text: "thought", thought: true },
      { characterId: "engine-char" },
      new AbortController().signal,
    );
    await controller.speak(
      { speaker: "", text: "narration" },
      { characterId: "engine-char" },
      new AbortController().signal,
    );
    assert.equal(reads, 0);
    await controller.speak(
      { speaker: "Arden", text: "assigned line" },
      { characterId: "engine-char" },
      new AbortController().signal,
    );
    assert.equal(voices.length, 1);
    assert.equal(voices[0][0][0].voice, "voice-a");
    assert.equal(voices[0][0][0].characterId, "engine-char");
    assert.equal(voices[0][2].audioConnectionId, "speech-source");
    controller.dispose();
    const reopened = fixture();
    reopened.controller.configure({ tts: true });
    await reopened.controller.speak(
      { speaker: "Arden", text: "reopened world" },
      { characterId: "engine-char" },
      new AbortController().signal,
    );
    assert.notEqual(voices[0][1], reopened.voices[0][1], "returning to the same world gets a new playback ID");
    reopened.controller.dispose();
  });

  await test("queued audio writes preserve other fields and never follow the player into another world", async () => {
    const pause = deferred();
    let writes = 0;
    const host = {
      _run: { runId: "first", audio: normalizeForgeAudio({ musicVolume: 0 }) },
      async _setSourcesNow(sources) {
        writes += 1;
        if (writes === 1) await pause.promise;
        this._run.audio = sources.audio;
      },
    };
    // The real queue's completion UI work is irrelevant here; stub the same host method used by it.
    host._root = {
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener() {},
      removeEventListener() {},
    };
    host._forgeAudio = { runId: "first", configure() {}, cue() {}, dispose() {} };
    const first = saveForgeAudioSources(host, { audio: { muted: true } });
    const second = saveForgeAudioSources(host, { audio: { tts: true } });
    await tick();
    pause.resolve();
    await Promise.all([first, second]);
    assert.equal(host._run.audio.musicVolume, 0);
    assert.equal(host._run.audio.muted, true);
    assert.equal(host._run.audio.tts, true);
    const old = saveForgeAudioSources(host, { audio: { musicVolume: 1 } });
    host._run = { runId: "second", audio: normalizeForgeAudio() };
    await old;
    assert.equal(writes, 2);
    assert.equal(host._run.audio.musicVolume, 0.5);
  });

  await test("shipped server persists audio, preserves card identity and saves generated music mood", async () => {
    const docs = new Map();
    const routes = new Map();
    const prompts = [];
    const seed = (id, kind, data) => {
      docs.set(id, {
        id,
        kind,
        packageId: "gacha-forge",
        name: id,
        description: "fixture",
        revision: 1,
        data: structuredClone(data),
      });
    };
    const runId = "audio-route-proof";
    const run = {
      runId,
      name: "Audio",
      scenario: "A fictional garden.",
      connectionId: "fixture-model",
      protagonist: { name: "Mari" },
      story: { choices: false },
      images: { connectionId: "" },
    };
    seed("index", "index", { runs: [run], activeRunId: runId });
    seed(`${runId}:session`, "session", { progress: {} });
    seed(`${runId}:chapter:1`, "chapter-plan", {
      chapter: 1,
      nodes: [0, 1].map((index) => ({
        index: index + 1,
        type: "story",
        title: "Garden",
        guide: "Meet Arden.",
        goal: "Continue.",
      })),
    });
    seed(`${runId}:beat:1:0`, "beat", {
      chapter: 1,
      storyIndex: 0,
      musicMood: "sad",
      segments: [{ speaker: "Arden", text: "A stored line." }],
      places: [],
    });
    seed(`${runId}:unit:arden`, "unit", {
      kind: "character",
      name: "Arden",
      cardId: "engine-arden",
      identitySex: "female",
    });
    seed(`${runId}:unit:generated`, "unit", { kind: "character", name: "Generated", identitySex: "female" });
    globalThis.fetch = async (input) => {
      assert.equal(new URL(input).pathname, "/api/connections");
      return {
        ok: true,
        json: async () => [{ id: "fixture-model", provider: "fixture", model: "fixture", maxContext: 128000 }],
      };
    };
    const { activate } = await import(`../packages/gacha-forge/server.mjs?audio=${Date.now()}`);
    const clone = (value) => structuredClone(value);
    const documents = {
      getById: async (_package, id) => clone(docs.get(id) || null),
      list: async (_package, kind) => clone([...docs.values()].filter((doc) => !kind || doc.kind === kind)),
      create: async (doc) => {
        const stored = { ...clone(doc), revision: 1 };
        assert.equal(docs.has(doc.id), false);
        docs.set(doc.id, stored);
        return clone(stored);
      },
      update: async (doc) => {
        const old = docs.get(doc.id);
        if (old?.revision !== doc.expectedRevision) return null;
        const stored = { ...old, ...clone(doc), revision: old.revision + 1 };
        delete stored.expectedRevision;
        docs.set(doc.id, stored);
        return clone(stored);
      },
      remove: async (_package, id) => docs.delete(id),
    };
    await activate({
      package: { id: "gacha-forge", version: "fixture" },
      api: {
        runtime: {
          persistence: { documents },
          logger: { info() {}, warn() {}, error() {}, debug() {} },
          json: { parseJsonish: JSON.parse },
          languageModels: {
            async resolveForRequest() {
              return {
                model: "fixture",
                async chatComplete(messages) {
                  prompts.push(messages);
                  return {
                    content: JSON.stringify({
                      musicMood: "tense",
                      places: [],
                      segments: [{ speaker: "Arden", text: "A generated line." }],
                    }),
                    finishReason: "stop",
                  };
                },
              };
            },
          },
        },
        async registerPrivilegedRoutes(register) {
          await register({
            get(path, handler) {
              routes.set(`GET ${path}`, handler);
            },
            post(path, handler) {
              routes.set(`POST ${path}`, handler);
            },
          });
        },
      },
    });
    const post = (path, body) => {
      assert.ok(routes.has(`POST ${path}`));
      return routes.get(`POST ${path}`)({ body });
    };
    const created = await post("/run", {
      scenario: "A second fictional world.",
      connectionId: "fixture-model",
      protagonist: { name: "Mari" },
      images: { connectionId: "" },
      storyNow: false,
      audio: { tts: true, musicVolume: 0, autoplayPauseSeconds: 4.5 },
    });
    assert.equal(created.ok, true, JSON.stringify(created));
    assert.ok(created.run.audio, "The shipped create route must persist audio settings");
    assert.equal(created.run.audio.tts, true);
    assert.equal(created.run.audio.musicVolume, 0);
    assert.equal(created.run.audio.generate, false);
    assert.equal(created.run.audio.autoplayPauseSeconds, 4.5);
    const saved = await post("/run/sources", {
      runId: created.run.runId,
      sources: { audio: { muted: true, generate: true, audioConnectionId: "dedicated" } },
    });
    assert.equal(saved.ok, true);
    assert.equal(saved.run.audio.musicVolume, 0);
    assert.equal(saved.run.audio.tts, true);
    assert.equal(saved.run.audio.muted, true);
    assert.equal(saved.run.audio.audioConnectionId, "dedicated");
    const cached = await post("/beat", { runId, chapter: 1, storyIndex: 0 });
    assert.equal(cached.ok, true, JSON.stringify(cached));
    assert.equal(cached.musicMood, "sad");
    assert.equal(cached.cast.find((character) => character.name === "Arden").characterId, "engine-arden");
    assert.equal(cached.cast.find((character) => character.name === "Generated").characterId, null);
    const generated = await post("/beat", { runId, chapter: 1, storyIndex: 1 });
    assert.equal(generated.ok, true, JSON.stringify(generated));
    assert.equal(generated.musicMood, "tense");
    assert.equal(docs.get(`${runId}:beat:1:1`).data.musicMood, "tense");
    assert.match(prompts.flatMap((messages) => messages.map((message) => message.content)).join("\n"), /musicMood/u);
  });
} finally {
  for (const [key, value] of Object.entries(before)) {
    if (value === undefined) delete globalThis[key];
    else globalThis[key] = value;
  }
}
process.stdout.write(`${cases} Gacha Forge audio regression cases passed.\n`);
