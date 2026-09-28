/**
 * A collab is WORK (U, user): the host announces it first ("collab with @kai drops Friday"), the
 * joint post goes up on its drop day with both pages tagged, it splits as agreed, and it brings fans
 * across from one page to the other. A couple is LIFE and has none of this (`slp-couple-beats.ts`).
 *
 * Pure and deterministic, no model call. The beats (`slp-tie-beats.ts`) and the ties service use it.
 */
import { hash } from "./slp-project.js";
import type { SlurpCollab, SlurpCreatorTies } from "./slp-creator-ties.js";

/** Interests read from a card, so "a baker" and "loves sourdough" land in the same niche. */
export const SLURP_COLLAB_INTERESTS: readonly { id: string; words: RegExp; ideas: readonly string[] }[] = [
  {
    id: "fitness",
    words:
      /\b(gym|work ?outs?|training|fitness|lift(s|ing)?|runn(ing|er)|yoga|pilates|climb\w*|boxing|sports?|athlet\w*|cardio|bouldering|Sport)\b/iu,
    ideas: [
      "a workout together, one of you pushing the other",
      "a joint training day with a challenge at the end",
      "teaching each other one move you are best at",
    ],
  },
  {
    id: "style",
    words:
      /\b(fashion\w*|style|stylish|outfits?|wardrobe|model(ing|s)?|lingerie|shopping|thrift\w*|streetwear|vintage|Mode)\b/iu,
    ideas: [
      "a styling swap: each of you dresses the other",
      "a thrift run with a budget and a winner",
      "matching looks for one shared shoot",
    ],
  },
  {
    id: "food",
    // Not coffee or "bakery": nearly every card drinks coffee, and "lives above a bakery" is a place. Both
    // made a climbing coach a flour brand's pick in the 7b-c measure.
    words:
      /\b(cook\w*|bak(e|es|er|ing)|chef|kitchen|recipes?|food\w*|Küche|kochen|backen|Backstube|Bäcker\w*|Brot)\b/iu,
    ideas: [
      "a cooking night, one dish each",
      "one recipe, made both your ways",
      "a market run and whatever you cook from it",
    ],
  },
  {
    id: "art",
    words: /\b(art|artist|paint\w*|draw\w*|sketch\w*|illustrat\w*|tattoo\w*|ink|design\w*|craft\w*)\b/iu,
    ideas: [
      "one piece made together, half each",
      "drawing each other, no peeking",
      "a small art swap: one piece each, traded",
    ],
  },
  {
    id: "music",
    words: /\b(music\w*|sing(s|er|ers|ing)?|songs?|band|guitar|piano|dj|producer|rapper|concerts?|vinyl)\b/iu,
    ideas: [
      "a little jam session, recorded",
      "a cover of one song you both love",
      "swapping playlists and reacting to each other's",
    ],
  },
  {
    id: "games",
    words: /\b(gam(e|es|er|ing)|stream\w*|twitch|console|esports?|cosplay\w*|anime|manga)\b/iu,
    ideas: [
      "a game night on stream, with some trash talk",
      "a co-op run with one rule each",
      "a costume or cosplay swap for one evening",
    ],
  },
  {
    id: "beauty",
    words: /\b(make-?up|beauty|skin ?care|nails|hair\w*|salon|glam)\b/iu,
    ideas: ["a get-ready-together session", "doing each other's look", "a skincare swap and honest reviews"],
  },
  {
    id: "outdoors",
    words: /\b(hik(e|es|ing)|travel\w*|trips?|beach|surf\w*|camping|nature|mountains?|road ?trip|sailing)\b/iu,
    ideas: [
      "a day out together somewhere new",
      "a sunrise trip neither of you wants to get up for",
      "a picnic spot one of you swears by",
    ],
  },
  {
    id: "night",
    words: /\b(party\w*|clubs?|clubbing|bars?|cocktails?|nightlife|rave\w*|bartend\w*)\b/iu,
    ideas: [
      "a night out together, the before and the after",
      "one bar each, the other judges",
      "a pre-party at one place, the party at the other",
    ],
  },
  {
    id: "books",
    words: /\b(books?|read(s|ing|er)?|writ(e|er|ing)|poet\w*|librar\w*|novels?)\b/iu,
    ideas: [
      "a swap of favourite books, and a reading date",
      "a tiny book club of two",
      "reading each other's comfort book",
    ],
  },
];

/** Of the partner's fans, about this share come across after a collab; capped per collab. */
export const SLURP_CROSSOVER_SHARE = 0.08;
export const SLURP_CROSSOVER_MAX = 30;

/** When an announced collab drops: tomorrow or the day after, in the evening (6, 7 or 8 pm, host time). */
export function slurpCollabDropAt(id: string, at: Date): string {
  const roll = hash(`${id}:drop`);
  const drop = new Date(at);
  drop.setDate(drop.getDate() + 1 + (roll % 2));
  drop.setHours(18 + (roll % 3), 0, 0, 0);
  return drop.toISOString();
}

/**
 * What an agreed collab asks of its host now: announce it, post it (its drop is due), or wait. A
 * collab agreed before announcements existed announces first too; one already planned or up is done.
 */
export function slurpCollabStep(collab: SlurpCollab, at: Date): "announce" | "post" | "wait" {
  if (collab.status !== "agreed") return "wait";
  if (!collab.announcedAt) return "announce";
  return !collab.dropAt || Date.parse(collab.dropAt) <= at.getTime() ? "post" : "wait";
}

/** The host's slot took the announcement: the joint post waits for its drop day. */
export function slurpAnnounceCollab(ties: SlurpCreatorTies, id: string, at: Date): SlurpCreatorTies {
  return {
    ...ties,
    collabs: ties.collabs.map((collab) =>
      collab.id === id && !collab.announcedAt
        ? { ...collab, announcedAt: at.toISOString(), dropAt: slurpCollabDropAt(id, at) }
        : collab,
    ),
  };
}

/** The drop day in plain words, from the announcement's point of view: "tomorrow", "on Friday". */
export function slurpCollabDropDay(dropAt: string, at: Date): string {
  const drop = new Date(dropAt);
  const day = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((day(drop) - day(at)) / 86_400_000);
  if (days <= 0) return "tonight";
  if (days === 1) return "tomorrow";
  return `on ${drop.toLocaleDateString("en-US", { weekday: "long" })}`;
}

/**
 * Fans who come across after a collab: of the other page's followers and subscribers who do not
 * follow this one yet, about one in twelve (subscribers first: they care most), at most 30. Picked
 * by a seed, so a repeated settle picks the same people.
 */
export function slurpCollabCrossover(
  fans: readonly { memberId: string; stage: string }[],
  alreadyHere: ReadonlySet<string>,
  seed: string,
): string[] {
  const rank = (stage: string) => (["subscriber", "regular", "whale"].includes(stage) ? 0 : 1);
  const eligible = fans.filter(
    (fan) => ["follower", "subscriber", "regular", "whale"].includes(fan.stage) && !alreadyHere.has(fan.memberId),
  );
  const count = Math.min(SLURP_CROSSOVER_MAX, Math.round(eligible.length * SLURP_CROSSOVER_SHARE));
  return [...eligible]
    .sort(
      (left, right) =>
        rank(left.stage) - rank(right.stage) || hash(`${seed}:${left.memberId}`) - hash(`${seed}:${right.memberId}`),
    )
    .slice(0, count)
    .map((fan) => fan.memberId);
}
