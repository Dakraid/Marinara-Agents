/**
 * Task G: fixes from the 7-day text simulation (`SIM-REPORT.md`, findings F1–F14).
 * One block per fix; each reproduces the simulated failure with the real module.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { slurpPickCreatorForSlot } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/feed/slp-posting-interval.ts";
import {
  slurpArtStyle,
  slurpStyledImagePrompt,
} from "../packages/slurp2/src/engine/packages/server/src/slp/base/media/slp-image-prompt.ts";
import {
  LEGACY_SLURP_DISCOVERY_TAG_SEED,
  SLURP_DISCOVERY_TAG_SEED,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/discovery/slp-discovery-profile.ts";

const root = new URL("../packages/slurp2/src/engine/packages/", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

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

// --- F5 art style kept: an anime, furry or dragon Creator is drawn, not photographed.
{
  const anime =
    "young woman drawn in bright 2000s shoujo anime style, cel-shaded, huge sparkly violet eyes, pastel-pink twin tails";
  const fox = "Juniper Vale is an anthro red fox woman, 26. Digitigrade legs, russet-orange fur, huge fluffy tail.";
  const dragon =
    "Vaelith is an anthro dragon: crimson scales, two swept-back ivory horns, leathery wings, a long tail.";
  const goth =
    "Raven Nyx is a 23-year-old human woman goth e-girl, pale skin, black lipstick, a dragon tattoo on her arm.";
  // The code-built part of a sim prompt, verbatim.
  const brief =
    "posing for the post, relaxed half-smile\nfull body, from front, self-timer photo from a nearby surface at chest height, hands free, fixed slightly wide framing, observational personal photograph, available light and unembellished framing, casual and unedited, taken on the first attempt\nThe only person in the photo.";
  assert.match(slurpArtStyle(anime)?.tag ?? "", /anime illustration/u);
  assert.match(slurpArtStyle(fox)?.tag ?? "", /anthro furry art/u);
  assert.match(slurpArtStyle(dragon)?.tag ?? "", /anthro furry art/u);
  assert.equal(slurpArtStyle(goth), null, "a human with a dragon tattoo is a photo-style Creator");
  assert.equal(slurpArtStyle(`${fox} Photorealistic.`), null, "a card that asks for photo realism keeps it");
  assert.match(slurpArtStyle(fox)?.negative ?? "", /fursuit/u);
  for (const look of [anime, fox, dragon]) {
    const styled = slurpStyledImagePrompt(`${look}\n${brief}`, look);
    assert.ok(styled.startsWith(slurpArtStyle(look)!.tag), `style leads: ${styled.slice(0, 60)}`);
    assert.doesNotMatch(
      styled,
      /\bphoto(?:graph)?s?\b|personal snapshot|available light|self-timer|unedited/iu,
      `no photo words for a drawn Creator: ${styled}`,
    );
    assert.match(styled, /full body, from front/u, "the framing survives");
    assert.match(styled, /The only person in the picture\./u);
  }
  assert.equal(slurpStyledImagePrompt(`${goth}\n${brief}`, goth), `${goth}\n${brief}`, "photo Creators unchanged");
  const service = read("server/src/slp/features/media/slp-images-service.ts");
  assert.match(service, /slurpStyledImagePrompt\(finalPromptLook, styleSource\)/u, "every picture path is styled");
  assert.match(service, /artStyle\?\.negative/u, "the negative prompt keeps photo and fursuit out");
}

// --- F13 discovery tags for non-human and drawn Creators; an untouched install gains them.
{
  const seed = SLURP_DISCOVERY_TAG_SEED.map((entry) => entry.tag);
  for (const tag of ["anime", "anthro", "furry", "scalie", "dragon", "monster"])
    assert.ok(seed.includes(tag), `${tag} is a default Discover tag`);
  assert.equal(LEGACY_SLURP_DISCOVERY_TAG_SEED.length, 22, "the legacy seed is the 0.2.78 list");
  assert.ok(!LEGACY_SLURP_DISCOVERY_TAG_SEED.some((entry) => entry.tag === "furry"));
  // The settings module needs the Engine host; its migration is checked as source.
  assert.match(
    read("server/src/slp/modules/settings/slp-settings.ts"),
    /JSON\.stringify\(rawRecord\.discoveryTags\) === JSON\.stringify\(LEGACY_SLURP_DISCOVERY_TAG_SEED\)\s*\? DEFAULT_SLURP_SETTINGS\.discoveryTags\s*: \(rawRecord\.discoveryTags \?\? DEFAULT_SLURP_SETTINGS\.discoveryTags\)/u,
    "only an untouched tag list gains the new group",
  );
  assert.match(read("client/src/slp/features/discovery/slp-discovery.ts"), /id: "look"/u);
}

console.log("slurp2-sim-fixes regression passed");
