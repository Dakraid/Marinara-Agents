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
import {
  SLURP_PARTNER_TEXT_PACE,
  slurpPartnerText,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-partner-texts.ts";
import {
  describeSlurpRapport,
  emptySlurpRapportFacts,
  scoreSlurpRapport,
  SLURP_PARTNER_RAPPORT,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-rapport.ts";

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

  // She texts like a partner: a few times a day together, less when dating, rarely after a fight, never
  // while something is pending or inside the gap; time-of-day reasons; the same hour decides once.
  {
    const day = (stage: "together" | "dating" | "rocky" | "sparks") => {
      let last: number | null = null;
      let texts = 0;
      for (let slot = 0; slot < 24 * 14; slot += 1) {
        const reason = slurpPartnerText({
          pairKey: "mia|me",
          stage,
          hour: slot % 24,
          hoursSinceLast: last === null ? null : slot - last,
          busy: false,
          slot,
        });
        if (reason) {
          texts += 1;
          last = slot;
        }
      }
      return texts / 14;
    };
    const together = day("together");
    assert.ok(together >= 1.5 && together <= 4.8, `together: ${together.toFixed(1)} texts a day`);
    assert.ok(day("dating") < together && day("rocky") < day("dating"), "less when dating, least after a fight");
    assert.equal(
      slurpPartnerText({ pairKey: "a", stage: "together", hour: 9, hoursSinceLast: 1, busy: false, slot: 1 }),
      null,
    );
    assert.equal(
      slurpPartnerText({ pairKey: "a", stage: "together", hour: 9, hoursSinceLast: null, busy: true, slot: 1 }),
      null,
    );
    const morning = Array.from({ length: 400 }, (_, slot) =>
      slurpPartnerText({ pairKey: "x", stage: "together", hour: 8, hoursSinceLast: null, busy: false, slot }),
    ).filter(Boolean);
    assert.ok(
      morning.length > 0 && morning.every((reason) => /morning|slept|dream|woke/iu.test(reason!)),
      "morning texts are morning texts",
    );
    assert.ok(
      morning.every((reason) => !/\b(she|her|him|his)\b/iu.test(reason!)),
      "no gender assumed",
    );
    assert.equal(SLURP_PARTNER_TEXT_PACE.together.gapHours, 5);
  }

  // A partner starts close: the head start lifts a brand-new thread to "your partner", not a fan tier.
  {
    const fresh = scoreSlurpRapport(emptySlurpRapportFacts());
    const partner = scoreSlurpRapport(emptySlurpRapportFacts(), undefined, { partner: "partner" });
    const crush = scoreSlurpRapport(emptySlurpRapportFacts(), undefined, { partner: "crush" });
    assert.equal(partner.score - fresh.score, SLURP_PARTNER_RAPPORT);
    assert.ok(crush.score > fresh.score && crush.score < partner.score);
    assert.match(describeSlurpRapport(partner, "Me"), /^Your history with Me: your partner \(/u);
    assert.match(describeSlurpRapport(crush, "Me"), /your crush/u);
    const base = slurp2Source(
      new URL(
        "../packages/slurp2/src/engine/packages/server/src/slp/data/messages/slp-messages-storage-base.ts",
        import.meta.url,
      ),
    );
    assert.match(base, /readSlurpPlayerCouple\(db, creatorAccountId, page\.id\)/u);
    const scheduler = slurp2Source(
      new URL(
        "../packages/slurp2/src/engine/packages/server/src/slp/features/world/slp-world-scheduler-service.ts",
        import.meta.url,
      ),
    );
    assert.match(scheduler, /textSlurpPartners\(app\.db\)/u);
  }

  console.log("slurp2 player partner regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
