// Stir's tie levers (W), the pure half: what a collab, rivalry or couple play would do, worked out on a
// snapshot of the world (the preview writes nothing), and the "make it happen" collab rule. No I/O;
// `features/projects/slp-stir-ties.ts` reads the world, runs the plays and undoes them.
import {
  slurpCollabFit,
  slurpCoolRivalry,
  slurpPushCollab,
  slurpRivalryFits,
  slurpStartRivalry,
  slurpSuggestCollab,
  type SlurpCreatorTies,
  type SlurpTieCreator,
  type SlurpTieError,
} from "./slp-creator-ties.js";
import {
  slurpCoupleMisfitOf,
  slurpCouplePageOpenable,
  slurpSetUpCouple,
  slurpSteerCouple,
  type SlurpCouple,
  type SlurpCoupleForced,
} from "./slp-creator-couples.js";
import type { SlpActionParsed } from "../../../../../shared/src/slp/slp-actions.js";
import type { SlpActionPreview, SlpStirNote } from "../../../../../shared/src/slp/slp-stir.js";

export const SLURP_TIE_LEVERS = [
  "suggest-collab",
  "push-collab",
  "start-rivalry",
  "cool-rivalry",
  "set-up-couple",
  "steer-couple",
  "couple-page",
] as const;
export type SlurpTieLever = (typeof SLURP_TIE_LEVERS)[number];
export const isSlurpTieLever = (name: string): name is SlurpTieLever =>
  (SLURP_TIE_LEVERS as readonly string[]).includes(name);

/** The world a tie play is worked out on: the Creators as the tie rules see them, and the ties. */
export type SlurpStirTieWorld = {
  creators: readonly SlurpTieCreator[];
  avatars: ReadonlyMap<string, string | null>;
  ties: SlurpCreatorTies;
  couples: readonly SlurpCouple[];
};

/** A forced couple's card note, in the words the couple lines use (I): taken → complicated, and so on. */
const FORCED_NOTE: Record<SlurpCoupleForced["misfit"], SlpStirNote["kind"]> = {
  taken: "complicated",
  notInto: "reluctant",
  noDating: "awkward",
  orientation: "awkward",
};

export type SlurpTiePreview = Pick<SlpActionPreview, "who" | "detail" | "when" | "notes" | "error" | "summary">;

const person = (world: SlurpStirTieWorld, id: string) => {
  const creator = world.creators.find((entry) => entry.id === id);
  return creator ? { id, name: creator.name, avatarUrl: world.avatars.get(id) ?? null } : null;
};
const people = (world: SlurpStirTieWorld, ids: string[]) =>
  ids.flatMap((id) => {
    const found = person(world, id);
    return found ? [found] : [];
  });
const nameOf = (world: SlurpStirTieWorld, id: string) => world.creators.find((entry) => entry.id === id)?.name ?? "";

/** What a tie play would do: the rule runs on the world it is given, and nothing is written. */
export function slurpPreviewTieLever(
  world: SlurpStirTieWorld,
  name: SlurpTieLever,
  input: unknown,
  at: Date,
): SlurpTiePreview {
  const { ties, couples } = world;
  const find = (id: string) => world.creators.find((entry) => entry.id === id);
  const result = (fields: Partial<SlurpTiePreview>): SlurpTiePreview => ({
    who: [],
    detail: {},
    when: "now",
    notes: [],
    error: null,
    summary: "",
    ...fields,
  });
  switch (name) {
    case "suggest-collab": {
      const { aId, bId, happen } = input as SlpActionParsed<"suggest-collab">;
      const a = find(aId);
      const b = find(bId);
      if (!a || !b) return result({ error: "notFound", summary: "One of these Creators does not exist." });
      const next = slurpSuggestCollab(ties, a, b, { at, id: "preview" });
      // The same judgement the answer uses (a suggestion gets no boost): the note is honest.
      const fit = slurpCollabFit(a, b);
      const asked = typeof next === "string" ? null : next.collabs.find((collab) => collab.id === "preview");
      const partner = asked ? nameOf(world, asked.partnerId) : b.name;
      const notes: SlpStirNote[] =
        happen || !asked || asked.status !== "asked" || fit.fits
          ? []
          : [{ kind: fit.decline === "noCollabs" ? "noCollabs" : "mayDecline", name: partner }];
      return result({
        who: people(world, [aId, bId]),
        detail: { idea: fit.idea, happen },
        when: happen || asked?.status === "agreed" ? "now" : "nextLook",
        notes,
        error: typeof next === "string" ? next : null,
        summary: `${a.name} and ${b.name} get a collab suggested (${fit.idea}).${happen ? " They agree now." : ` ${partner} answers in their own way.`}`,
      });
    }
    case "push-collab": {
      const { collabId } = input as SlpActionParsed<"push-collab">;
      const collab = ties.collabs.find((entry) => entry.id === collabId);
      const next = slurpPushCollab(ties, collabId, at);
      return result({
        who: collab ? people(world, [collab.hostId, collab.partnerId]) : [],
        detail: { idea: collab?.idea ?? null },
        error: typeof next === "string" ? next : null,
        summary: collab
          ? `${nameOf(world, collab.hostId)} and ${nameOf(world, collab.partnerId)} agree to the collab now.`
          : "",
      });
    }
    case "start-rivalry": {
      const { fromId, toId, cause } = input as SlpActionParsed<"start-rivalry">;
      const from = find(fromId);
      const to = find(toId);
      if (!from || !to) return result({ error: "notFound", summary: "One of these Creators does not exist." });
      const next = slurpStartRivalry(ties, from, to, { at, id: "preview", cause });
      const started = typeof next === "string" ? null : next.rivalries.find((entry) => entry.id === "preview");
      return result({
        who: people(world, [fromId, toId]),
        detail: { cause: started?.cause ?? cause ?? null },
        when: "nextPost",
        notes: slurpRivalryFits(from, to) ? [] : [{ kind: "notDramatic", name: from.name }],
        error: typeof next === "string" ? next : null,
        summary: `${from.name} starts throwing shade at ${to.name}.`,
      });
    }
    case "cool-rivalry": {
      const { rivalryId } = input as SlpActionParsed<"cool-rivalry">;
      const rivalry = ties.rivalries.find((entry) => entry.id === rivalryId);
      const next = slurpCoolRivalry(ties, rivalryId, at);
      return result({
        who: rivalry ? people(world, [rivalry.fromId, rivalry.toId]) : [],
        when: "nextPost",
        error: typeof next === "string" ? next : null,
        summary: rivalry ? `${nameOf(world, rivalry.fromId)} and ${nameOf(world, rivalry.toId)} calm it down.` : "",
      });
    }
    case "set-up-couple": {
      const { aId, bId } = input as SlpActionParsed<"set-up-couple">;
      const a = find(aId);
      const b = find(bId);
      if (!a || !b) return result({ error: "notFound", summary: "One of these Creators does not exist." });
      const next = slurpSetUpCouple(couples, a, b, { at, id: "preview" });
      const made = typeof next === "string" ? null : next.find((entry) => entry.id === "preview");
      const misfit = made?.forced ?? (typeof next === "string" ? null : slurpCoupleMisfitOf(a, b));
      return result({
        who: people(world, [aId, bId]),
        detail: { stage: made?.stage ?? null },
        when: "nextPost",
        notes: misfit ? [{ kind: FORCED_NOTE[misfit.misfit], name: nameOf(world, misfit.byId) }] : [],
        error: typeof next === "string" ? next : null,
        summary: `${a.name} and ${b.name} start to ${made?.stage === "together" ? "go public as a couple" : "flirt"}.`,
      });
    }
    case "steer-couple": {
      const { coupleId, steer } = input as SlpActionParsed<"steer-couple">;
      const couple = couples.find((entry) => entry.id === coupleId);
      const next = slurpSteerCouple(couples, coupleId, steer, { at, creators: world.creators });
      return result({
        who: couple ? people(world, [couple.aId, couple.bId]) : [],
        detail: { steer },
        when: "nextPost",
        error: typeof next === "string" ? next : null,
        summary: couple ? `${nameOf(world, couple.aId)} and ${nameOf(world, couple.bId)}: ${steer}.` : "",
      });
    }
    case "couple-page": {
      const { coupleId, open } = input as SlpActionParsed<"couple-page">;
      const couple = couples.find((entry) => entry.id === coupleId);
      const error = !couple
        ? "notFound"
        : open
          ? slurpCouplePageOpenable(couple)
            ? null
            : "notOpen"
          : couple.page && !couple.page.closedAt
            ? null
            : "notOpen";
      return result({
        who: couple ? people(world, [couple.aId, couple.bId]) : [],
        detail: { open },
        error,
        summary: couple
          ? `${nameOf(world, couple.aId)} and ${nameOf(world, couple.bId)} ${open ? "open" : "close"} their shared page.`
          : "",
      });
    }
  }
}

/**
 * A suggested collab, as a play: the partner answers in their own way at the next look (work can be
 * refused, W), unless the player said "make it happen", then the two agree now. A page the player
 * runs has agreed by suggesting it.
 */
export function slurpSuggestCollabPlay(
  ties: SlurpCreatorTies,
  a: SlurpTieCreator,
  b: SlurpTieCreator,
  input: { at: Date; id: string; happen: boolean },
): SlurpCreatorTies | SlurpTieError {
  const asked = slurpSuggestCollab(ties, a, b, input);
  if (typeof asked === "string" || !input.happen) return asked;
  const collab = asked.collabs.find((entry) => entry.id === input.id);
  return collab?.status === "asked" ? slurpPushCollab(asked, input.id, input.at) : asked;
}
