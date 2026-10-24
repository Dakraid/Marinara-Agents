import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const engineRoot = process.env.MARINARA_ENGINE_ROOT;
if (!engineRoot) throw new Error("Set MARINARA_ENGINE_ROOT to a compatible Engine checkout");
const appVersion = JSON.parse(readFileSync(resolve(engineRoot, "package.json"), "utf8")).version;
const packageRoot = resolve(process.cwd(), "packages/gacha-forge");

// ponytail: use the contributed bundle's actual damage helper until its source is imported.
function affinityRules(file: string, map: string, normalize: string, damage: string, next: string) {
  const source = readFileSync(resolve(packageRoot, file), "utf8");
  const mapStart = source.indexOf(`var ${map}={`);
  const mapEnd = source.indexOf("},", mapStart) + 1;
  const normalizeStart = source.indexOf(`function ${normalize}(`);
  const normalizeEnd = source.indexOf("function ", normalizeStart + 9);
  const damageStart = source.indexOf(`function ${damage}(`);
  const damageEnd = source.indexOf(`function ${next}(`, damageStart);
  expect(Math.min(mapStart, normalizeStart, damageStart)).toBeGreaterThan(0);
  return vm.runInNewContext(
    `${source.slice(mapStart, mapEnd)};${source.slice(normalizeStart, normalizeEnd)}${source.slice(damageStart, damageEnd)};${damage}`,
  ) as (from: string, to: string) => { mult: number; label: string };
}
const clientRules = affinityRules("client.js", "ao", "Wr", "lt", "Qp");
const serverRules = affinityRules("server.mjs", "pc", "Ws", "br", "_o");
const affinities = ["fire", "water", "wind", "earth", "light", "dark"];
const expectedEdges = affinities.flatMap((from) =>
  affinities.flatMap((to) => {
    expect(clientRules(from, to)).toEqual(serverRules(from, to));
    return clientRules(from, to).label === "STRONG" ? [`${from}:${to}`] : [];
  }),
);
const background = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="800"><rect width="960" height="800" fill="#33435b"/><rect width="960" height="96" fill="#e8bd66"/><text x="480" y="62" text-anchor="middle" font-size="40">TOP HEAD MARKER</text></svg>')}`;
const portrait = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#83597d"/><circle cx="100" cy="70" r="40" fill="#eed8b2"/></svg>')}`;
const run = {
  runId: "home-affinities-proof",
  name: "Home presentation proof",
  scenario: "Synthetic home layout.",
  protagonist: { name: "Mari" },
  hasStandardBanner: true,
  progress: {},
  decor: { bg: { name: "Top-framed fixture", url: background }, unit: { id: "arden", name: "Arden", portrait } },
  audio: { tts: false, generate: false, muted: true },
};

test("Home shows the real element matchups between Letters and the portrait with top-framed artwork", async ({
  page,
}, testInfo) => {
  const activeRun = { ...structuredClone(run), hudStyle: "vanguard" };
  const mobile = testInfo.project.name.includes("mobile");
  const viewports = mobile
    ? [{ width: 874, height: 402 }]
    : [
        { width: 1440, height: 900 },
        { width: 800, height: 900 },
      ];
  await page.setViewportSize(viewports[0]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/app-settings/ui", (route) =>
    route.fulfill({ json: route.request().method() === "GET" ? { value: null } : { success: true } }),
  );
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
  }, appVersion);
  await page.route("**/api/gacha-forge/state", (route) =>
    route.fulfill({
      json: { runs: [activeRun], activeRunId: activeRun.runId, activeRun, guidesSeen: ["welcome", "home", "chat"] },
    }),
  );
  await page.route("**/api/gacha-forge/continuity", (route) => route.fulfill({ json: { ok: true, chapters: [] } }));
  await page.route("**/api/gacha-forge/preforge", (route) =>
    route.fulfill({ json: { ok: true, preforge: { mode: "off", locked: false, canAuto: false } } }),
  );
  await page.goto("/");
  await page.getByRole("tab", { name: "Open Gacha Forge" }).click();
  const forge = page.locator("marinara-capability-gacha-forge");
  await expect.poll(() => forge.evaluate((node) => (node as any)._boot)).toBe("ready");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const theme of ["vanguard", "bloom"]) {
      activeRun.hudStyle = theme;
      await forge.evaluate((node, theme) => {
        const game = node as any;
        game._clearBeat();
        game._bannerReady = true;
        game._artReady = true;
        game._planEscaped = true;
        game._hudView = "home";
        game._run = { ...game._run, hudStyle: theme };
        game._renderBrowser();
      }, theme);
      await expect(forge.locator(".gf-arena")).toHaveAttribute("data-style", theme);
      const guide = forge.locator(".gf-home-affinities");
      await expect(guide).toBeVisible();
      await expect(guide).toHaveAccessibleName(/Element matchups/u);
      const edges = await guide
        .locator("[data-forge-advantage-from]")
        .evaluateAll((elements) =>
          elements.map(
            (element) =>
              `${element.getAttribute("data-forge-advantage-from")}:${element.getAttribute("data-forge-advantage-to")}`,
          ),
        );
      expect(edges.sort()).toEqual(expectedEdges.toSorted());
      await expect(guide.locator("[data-forge-affinity]")).toHaveCount(6);
      await expect(guide.locator("desc")).toContainText("0.75×");
      for (const fullscreen of [false, true]) {
        if (fullscreen) await forge.locator(".gf-fs-bar").click();
        await forge.locator(".gf-stage").evaluate(async (stage) => {
          await Promise.all(
            stage
              .getAnimations({ subtree: true })
              .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
              .map((animation) => animation.finished.catch(() => {})),
          );
        });
        await expect(forge.locator(".gf-arena")).toHaveAttribute("data-style", theme);
        const layout = await forge.evaluate(async (node) => {
          const root = node.shadowRoot!;
          const box = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();
          const stage = box(".gf-stage"),
            letters = box(".hm-chat"),
            guide = box(".gf-home-affinities"),
            portrait = box(".hm-plate"),
            hud = box(".gf-bar"),
            bg = root.querySelector<HTMLImageElement>(".hm-bg")!;
          await bg.decode();
          const image = bg.getBoundingClientRect();
          const style = getComputedStyle(bg);
          const scale = Math.max(image.width / bg.naturalWidth, image.height / bg.naturalHeight);
          return {
            belowLetters: guide.top >= letters.bottom - 1,
            abovePortrait: guide.bottom <= portrait.top + 1,
            guideFits: guide.left >= stage.left - 1 && guide.right <= stage.right + 1,
            portraitHeight: portrait.height,
            portraitRatio: portrait.width / portrait.height,
            artworkBelowHud: image.top >= hud.bottom - 1,
            objectPosition: style.objectPosition,
            topMarkerWouldBeCroppedAtPreviousPosition: (bg.naturalHeight * scale - image.height) * 0.42 > 1,
            fullscreen: (node as any).capabilityProps.browserFullscreen.active,
          };
        });
        expect(layout.belowLetters).toBe(true);
        expect(layout.abovePortrait).toBe(true);
        expect(layout.guideFits).toBe(true);
        expect(layout.portraitHeight).toBeGreaterThan(44);
        expect(layout.portraitRatio).toBeCloseTo(2 / 3, 2);
        expect(layout.artworkBelowHud).toBe(true);
        expect(layout.objectPosition).toMatch(/^50% 0(?:px|%)$/u);
        // The original wide fixtures must prove the old crop. A tall, narrow viewport
        // may cover by height instead; top alignment and portrait ratio still apply.
        if (viewport.width > viewport.height) expect(layout.topMarkerWouldBeCroppedAtPreviousPosition).toBe(true);
        expect(layout.fullscreen).toBe(fullscreen);
        await page.screenshot({
          path: testInfo.outputPath(`home-${viewport.width}-${theme}-${fullscreen ? "full" : "window"}.png`),
        });
        await expect(forge.locator(".gf-arena")).toHaveAttribute("data-style", theme);
        if (fullscreen) await forge.locator(".gf-fs-bar").click();
      }
    }
  }
});
