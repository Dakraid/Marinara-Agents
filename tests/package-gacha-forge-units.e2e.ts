import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const engineRoot = process.env.MARINARA_ENGINE_ROOT;
if (!engineRoot) throw new Error("Set MARINARA_ENGINE_ROOT to a compatible Engine checkout");
const appVersion = JSON.parse(readFileSync(resolve(engineRoot, "package.json"), "utf8")).version;
const portrait = "https://forge.test/unit-portrait.png";
const unit = {
  id: "presentation-unit",
  kind: "character",
  name: "Arden",
  rarity: 5,
  role: "Warrior",
  affinity: "Fire",
  portrait,
  level: 1,
  stats: { hp: 50, atk: 50, def: 40, spd: 50 },
  skills: [],
  story: "A synthetic unit for browser proof.",
};

test("Units keep portraits loaded and center controls, with an affinity card badge", async ({ page }, testInfo) => {
  await page.setViewportSize(
    testInfo.project.name.includes("mobile") ? { width: 874, height: 402 } : { width: 2400, height: 1080 },
  );
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
  await page.route(portrait, (route) =>
    route.fulfill({
      contentType: "image/png",
      headers: { "cache-control": "public, max-age=31536000, immutable" },
      body: readFileSync(new URL("../artwork/agent-covers/gacha-forge.png", import.meta.url)),
    }),
  );
  await page.route("**/api/gacha-forge/state", (route) =>
    route.fulfill({ json: { runs: [], guidesSeen: ["welcome"] } }),
  );
  await page.route("**/api/gacha-forge/unit", (route) =>
    route.fulfill({ json: { ok: true, unit, level: 1, bond: 0, favorite: false, gear: { slots: [], totals: {} } } }),
  );
  await page.route("**/api/gacha-forge/unit/favorite", (route) => route.fulfill({ json: { ok: true } }));
  await page.goto("/");
  await page.getByRole("tab", { name: "Open Gacha Forge" }).click();
  const forge = page.locator("marinara-capability-gacha-forge");
  await expect(forge.locator("textarea").first()).toBeVisible();
  await forge.evaluate((node, unit) => {
    const game = node as any;
    game._boot = "ready";
    game._guidesSeen = new Set(["welcome", "home", "roster", "unit", "unit:stats", "unit:story"]);
    game._welcomeBegun = true;
    game._run = { runId: "unit-proof", name: "Unit proof", scenario: "Synthetic UI proof", progress: {} };
    game._bannerReady = true;
    game._artReady = true;
    game._hudView = "roster";
    game._rosterUnitId = null;
    game._roster = [unit];
    game._rosterState = "ready";
    game._rosterRev += 1;
    game._renderBrowser();
  }, unit);
  const card = forge.locator(`[data-unit="${unit.id}"]`);
  await expect(card).toBeVisible();
  await card.locator("img").evaluate((image) => (image as HTMLImageElement).decode());
  await card.click();
  const photo = forge.locator(".cp-photo");
  await expect(photo).toBeVisible();
  await photo.evaluate((image) => (image as HTMLImageElement).decode());
  await expect(forge.locator("[data-guide-modal]")).toHaveCount(0);
  await forge.evaluate((node) => {
    const sample = { frames: 0, blankFrames: 0, running: true };
    (window as any).unitPortraitSample = sample;
    const frame = () => {
      // Transitions copy the portrait into nested shadow roots. Sample those too.
      const images: HTMLImageElement[] = [];
      const collect = (root: ShadowRoot | Element) => {
        images.push(...root.querySelectorAll<HTMLImageElement>(".cp-photo"));
        for (const element of root.querySelectorAll("*")) if (element.shadowRoot) collect(element.shadowRoot);
      };
      collect(node.shadowRoot!);
      const visible = images.filter((image) => {
        const box = image.getBoundingClientRect();
        return (
          box.width > 0 &&
          box.height > 0 &&
          box.bottom > 0 &&
          box.top < innerHeight &&
          box.right > 0 &&
          box.left < innerWidth &&
          getComputedStyle(image).visibility !== "hidden"
        );
      });
      if (visible.length) {
        sample.frames += 1;
        if (visible.every((image) => !image.complete || image.naturalWidth === 0)) sample.blankFrames += 1;
      }
      if (sample.running) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  const favorite = forge.locator(
    '.gf-stage > .gf-view > .root > [data-screen="unit"] > .cp-body > .cp-id > .cp-id-top > [data-fav]',
  );
  for (const on of [true, false, true]) {
    await favorite.click();
    await expect(favorite).toHaveAttribute("aria-pressed", String(on));
  }
  for (const tab of ["Story", "Stats"]) await forge.getByRole("tab", { name: tab, exact: true }).click();
  const help = forge.locator(
    '.gf-stage > .gf-view > .root > [data-screen="unit"] > .cp-body > .cp-main > .cp-tabs > [data-unit-help]',
  );
  await help.click();
  await expect(forge.locator("[data-unit-help-modal]")).toBeVisible();
  await forge.locator("[data-unit-help-modal]").getByRole("button", { name: "Close", exact: true }).click();
  await expect(forge.locator("[data-unit-help-modal]")).toHaveCount(0);
  await page.waitForTimeout(150);
  const samples = await page.evaluate(() => {
    const sample = (window as any).unitPortraitSample;
    sample.running = false;
    return sample;
  });
  await testInfo.attach("portrait-frames.json", { body: JSON.stringify(samples), contentType: "application/json" });
  expect(samples.frames).toBeGreaterThan(0);
  expect(samples.blankFrames, "loaded portraits do not blank during favorite, tab or help updates").toBe(0);
  await expect(photo).toHaveAttribute("loading", "eager");
  await expect(photo).toHaveAttribute("decoding", "sync");
  for (const button of [favorite, help]) {
    const offset = await button.evaluate((button) => {
      const box = button.getBoundingClientRect();
      const icon = button.querySelector("svg")!.getBoundingClientRect();
      return {
        x: Math.abs(box.x + box.width / 2 - icon.x - icon.width / 2),
        y: Math.abs(box.y + box.height / 2 - icon.y - icon.height / 2),
      };
    });
    expect(offset.x).toBeLessThanOrEqual(0.5);
    expect(offset.y).toBeLessThanOrEqual(0.5);
  }
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath(`unit-controls-${testInfo.project.name}.png`),
  });
  await forge.getByRole("button", { name: "◀ Units", exact: true }).click();
  const badge = card.getByRole("img", { name: "Fire", exact: true });
  await expect(badge).toBeVisible();
  const position = await badge.evaluate((badge) => {
    const art = badge.closest(".u-art")!.getBoundingClientRect();
    const icon = badge.getBoundingClientRect();
    return { right: art.right - icon.right, top: icon.top - art.top };
  });
  expect(position.right).toBeGreaterThanOrEqual(0);
  expect(position.right).toBeLessThan(15);
  expect(position.top).toBeGreaterThanOrEqual(0);
  expect(position.top).toBeLessThan(15);
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath(`unit-affinity-${testInfo.project.name}.png`),
  });
});
