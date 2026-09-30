/**
 * Drama phase 3 (`docs/DRAMA.md`, persona audit): the player's own page as a partner. A couple with
 * the player starts together, the clock never breaks it up, the player is never "the jealous one",
 * a persona's text is never read as a card (no orientation misfit, no card couple on its own), and a
 * couple with the player gets no shared page.
 */
import assert from "node:assert/strict";
import { slurp2Source } from "./slurp2-source";
import {
  slurpAdvanceCouples,
  slurpCoupleMisfitOf,
  slurpSetUpCouple,
  type SlurpCouple,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/projects/slp-creator-couples.ts";
import type { SlurpTieCreator } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/projects/slp-creator-ties.ts";

const T0 = Date.parse("2026-10-01T00:00:00.000Z");
const DAY = 86_400_000;
const creator = (id: string, text: string, extra: Partial<SlurpTieCreator> = {}): SlurpTieCreator => ({
  id,
  name: id[0]!.toUpperCase() + id.slice(1),
  text,
  tags: ["fitness"],
  automatic: true,
  followers: 1000,
  gender: "female",
  ...extra,
});

async function main() {
  const mia = creator("mia", "Straight fitness coach. Flirty and romantic.");
  const me = creator("me", "Dating Mia. Straight guy who loves the gym.", { automatic: false, gender: null });
  const jake = creator("jake", "Straight gym bro.", { gender: "male" });

  // A persona has no gender: a card's orientation is not a misfit for the player's page.
  assert.equal(slurpCoupleMisfitOf(mia, me), null);
  assert.equal(slurpCoupleMisfitOf(mia, creator("lena", "Straight.", { gender: "female" }))?.misfit, "orientation");
  // A persona's text is not a card: "never dates" on it colors nothing.
  assert.equal(slurpCoupleMisfitOf(mia, { ...me, text: "Never dates anyone." }), null);

  // Set up with the player: together from the start.
  const set = slurpSetUpCouple([], mia, me, { at: new Date(T0), id: "c1" });
  assert.ok(Array.isArray(set));
  const couple = (set as SlurpCouple[])[0]!;
  assert.deepEqual([couple.stage, couple.forced, couple.togetherAt !== null], ["together", undefined, true]);

  // 120 days on the clock, with collabs that would make anyone jealous: never split, never rocky, dates
  // keep coming, and a jealous moment is never the player's.
  let couples: SlurpCouple[] = set as SlurpCouple[];
  let counter = 0;
  for (let step = 0; step < 120 * 4; step += 1) {
    couples = slurpAdvanceCouples(couples, {
      creators: [mia, me, jake],
      at: new Date(T0 + step * 6 * 3_600_000),
      activity: 1,
      storylines: [],
      rivals: new Set(),
      collabbedWith: new Map(
        step % 40 < 8
          ? [
              ["mia", "jake"],
              ["jake", "mia"],
            ]
          : [],
      ),
      newId: () => `n-${++counter}`,
    });
    const ours = couples.find((entry) => entry.id === "c1")!;
    assert.ok(ours.stage === "together", `day ${step / 4}: ${ours.stage}`);
    assert.ok(!ours.moments.some((moment) => moment.fromId === "me"), "the player is never the jealous one");
  }
  const ours = couples.find((entry) => entry.id === "c1")!;
  // Only the last ten moments are kept: the newest date is from the last days, and there are several.
  const dates = ours.moments.filter((moment) => moment.kind === "date");
  assert.ok(dates.length >= 3, `dates keep coming (${dates.length})`);
  assert.ok(T0 + 120 * DAY - Date.parse(dates.at(-1)!.at) < 10 * DAY, "the last date is recent");

  // A persona that names a Creator does not make a couple on its own; the relation is set by the player.
  const alone = slurpAdvanceCouples([], {
    creators: [mia, me],
    at: new Date(T0 + DAY),
    activity: 0,
    storylines: [],
    rivals: new Set(),
    collabbedWith: new Map(),
    newId: () => "x",
  });
  assert.equal(alone.length, 0);

  // No shared page with the player in it; spice partners treat the player's page as the player.
  const service = slurp2Source(
    new URL(
      "../packages/slurp2/src/engine/packages/server/src/slp/features/projects/slp-creator-couples-service.ts",
      import.meta.url,
    ),
  );
  assert.match(service, /account\.kind === "persona" && account\.sourceKind === "persona"\)\) return "notOpen"/u);
  const spice = slurp2Source(
    new URL(
      "../packages/slurp2/src/engine/packages/server/src/slp/data/creators/slp-spice-storage.ts",
      import.meta.url,
    ),
  );
  assert.ok(
    spice.indexOf('account?.kind === "persona"') < spice.indexOf("selectSlurpExplicitLevel(guidance, partnerId)"),
  );

  console.log("slurp2 player partner regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
