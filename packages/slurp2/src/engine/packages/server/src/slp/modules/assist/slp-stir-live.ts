// Stir's "In play" strip and "Suggested" cards, the pure half (W): what is going on in the world right
// now, and up to three plays that fit it. Code only, no AI call (concept slice 7).
import type { SlpStirLive, SlpStirSuggestion } from "../../../../../shared/src/slp/slp-stir.js";

type Person = { id: string; name: string; avatarUrl: string | null };

export type SlpStirLiveInput = {
  at: Date;
  creators: (Person & { automatic: boolean; lastPostAt: string | null; pace: string; ideas: number })[];
  couples: { id: string; aId: string; bId: string; stage: string; stageAt: string }[];
  collabs: { id: string; hostId: string; partnerId: string; status: string; dropAt?: string | null }[];
  rivalries: { id: string; fromId: string; toId: string; stage: string }[];
  events: { id: string; name: string; running: boolean; endsAt: string | null }[];
  /** Brand deals the player's own page took and still owes a post for. */
  owed: { id: string; creatorId: string; brand: string }[];
  /** No play in the ledger yet: the first-visit card offers one to start with. */
  firstVisit: boolean;
};

const DAY_MS = 86_400_000;
const QUIET_DAYS = 4;
const SPARKS_DAYS = 3;

/** Everything live, love first (what players come back for), then work, drama, the world, and pace. */
export function slpStirLive(input: SlpStirLiveInput): SlpStirLive[] {
  const byId = new Map(input.creators.map((creator) => [creator.id, creator]));
  const who = (...ids: string[]) =>
    ids.flatMap((id) => {
      const found = byId.get(id);
      return found ? [{ id: found.id, name: found.name, avatarUrl: found.avatarUrl }] : [];
    });
  return [
    ...input.events
      .filter((event) => event.running)
      .map((event) => ({
        id: `event:${event.id}`,
        kind: "event" as const,
        who: [],
        state: "running",
        label: event.name,
        until: event.endsAt,
      })),
    ...input.couples
      .filter((couple) => couple.stage !== "split")
      .map((couple) => ({
        id: `couple:${couple.id}`,
        kind: "couple" as const,
        who: who(couple.aId, couple.bId),
        state: couple.stage,
        label: null,
        until: null,
      })),
    ...input.collabs.map((collab) => ({
      id: `collab:${collab.id}`,
      kind: "collab" as const,
      who: who(collab.hostId, collab.partnerId),
      state: collab.status,
      label: null,
      until: collab.dropAt ?? null,
    })),
    ...input.rivalries.map((rivalry) => ({
      id: `rivalry:${rivalry.id}`,
      kind: "rivalry" as const,
      who: who(rivalry.fromId, rivalry.toId),
      state: rivalry.stage,
      label: null,
      until: null,
    })),
    ...input.creators
      .filter((creator) => creator.pace === "break" || creator.pace === "very_busy")
      .map((creator) => ({
        id: `pace:${creator.id}`,
        kind: "break" as const,
        who: who(creator.id),
        state: creator.pace,
        label: null,
        until: null,
      })),
    ...input.creators
      .filter((creator) => creator.ideas > 0)
      .map((creator) => ({
        id: `ideas:${creator.id}`,
        kind: "ideas" as const,
        who: who(creator.id),
        state: "queued",
        label: String(creator.ideas),
        until: null,
      })),
  ].filter((entry) => entry.kind === "event" || entry.who.length > 0);
}

/**
 * Up to three plays that fit what is going on: a couple stuck at flirting, a rough patch, an owed #ad
 * post, a Creator gone quiet, an event to start, and on the first visit one pair to set up. Each
 * comes with a ready step where one is clear; a quiet Creator opens the idea card instead (the idea
 * is the player's).
 */
export function slpStirSuggestions(input: SlpStirLiveInput): SlpStirSuggestion[] {
  const byId = new Map(input.creators.map((creator) => [creator.id, creator]));
  const who = (...ids: string[]) =>
    ids.flatMap((id) => {
      const found = byId.get(id);
      return found ? [{ id: found.id, name: found.name, avatarUrl: found.avatarUrl }] : [];
    });
  const age = (iso: string | null) => (iso ? (input.at.getTime() - Date.parse(iso)) / DAY_MS : Infinity);
  const out: SlpStirSuggestion[] = [];
  const rocky = input.couples.find((couple) => couple.stage === "rocky");
  if (rocky)
    out.push({
      id: `rocky:${rocky.id}`,
      kind: "rocky",
      who: who(rocky.aId, rocky.bId),
      label: null,
      step: { action: "steer-couple", input: { coupleId: rocky.id, steer: "patchUp" } },
    });
  const sparks = input.couples.find((couple) => couple.stage === "sparks" && age(couple.stageAt) >= SPARKS_DAYS);
  if (sparks)
    out.push({
      id: `sparks:${sparks.id}`,
      kind: "sparks",
      who: who(sparks.aId, sparks.bId),
      label: null,
      step: { action: "steer-couple", input: { coupleId: sparks.id, steer: "date" } },
    });
  const owed = input.owed[0];
  if (owed)
    out.push({ id: `owed:${owed.id}`, kind: "owedAd", who: who(owed.creatorId), label: owed.brand, step: null });
  const feud = input.rivalries.find((rivalry) => rivalry.stage === "feud");
  if (feud)
    out.push({
      id: `cooling:${feud.id}`,
      kind: "cooling",
      who: who(feud.fromId, feud.toId),
      label: null,
      step: { action: "cool-rivalry", input: { rivalryId: feud.id } },
    });
  const quiet = input.creators
    .filter((creator) => creator.automatic && creator.pace !== "break" && age(creator.lastPostAt) >= QUIET_DAYS)
    .sort((left, right) => age(right.lastPostAt) - age(left.lastPostAt))[0];
  if (quiet)
    out.push({
      id: `quiet:${quiet.id}`,
      kind: "quiet",
      who: who(quiet.id),
      label: Number.isFinite(age(quiet.lastPostAt)) ? String(Math.floor(age(quiet.lastPostAt))) : null,
      step: null,
    });
  // One event a day, the same all day (not a new pick on every visit).
  const idle = input.events.filter((event) => !event.running);
  const day = Math.floor(input.at.getTime() / DAY_MS);
  const event = idle.length ? idle[day % idle.length] : null;
  if (event)
    out.push({
      id: `event:${event.id}`,
      kind: "event",
      who: [],
      label: event.name,
      step: { action: "start-event", input: { eventId: event.id } },
    });
  if (input.firstVisit && input.couples.every((couple) => couple.stage === "split")) {
    const [a, b] = input.creators.filter((creator) => creator.automatic);
    if (a && b)
      out.unshift({
        id: `first:${a.id}:${b.id}`,
        kind: "firstPlay",
        who: who(a.id, b.id),
        label: null,
        step: { action: "set-up-couple", input: { aId: a.id, bId: b.id } },
      });
  }
  return out.slice(0, 3);
}
