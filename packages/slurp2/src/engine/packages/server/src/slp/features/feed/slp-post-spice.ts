/**
 * The spicy side of one post, read and decided in one place: what makes it spicy in this Creator's
 * own way (the kind of spicy post, a partner, now and then the player's taste), the level it goes
 * to after access and intent, and the picture's moment and company for a locked one (the caller's
 * variation is replaced by the one returned here). Rules live in
 * `modules/creators/slp-spice.ts`.
 */
import type { DB } from "../../../db/connection.js";
import { logger } from "../../../lib/logger.js";
import type { SlpAccount, SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";
import { resolveSlurpSpiceCreator } from "../../data/creators/slp-flavour-source.js";
import { slurpSpicyCollabNames } from "../../data/creators/slp-spice-storage.js";
import { slurpSpiceAngle } from "../../modules/creators/slp-spice.js";
import { slurpPostSexualLevel, type SlurpExplicitLevel } from "../../modules/feed/slp-post-guidance.js";
import type { SlurpPostVariation } from "../../modules/feed/slp-post-variation.js";
import type { SlurpBeat } from "../../modules/feed/slp-post-beat.js";
import type { SlurpCreatorCollab } from "../../modules/projects/slp-project.js";

/** What earlier spicy posts of this Creator were, newest first, from what each post stored. */
function recentSpice(posts: readonly { metadata?: unknown }[]) {
  return posts.flatMap((post) => {
    const stored = (post.metadata as Record<string, unknown> | undefined)?.slurpSpice as
      { kind?: unknown; taste?: unknown } | undefined;
    return typeof stored?.kind === "string"
      ? [{ kind: stored.kind, taste: typeof stored.taste === "string" ? stored.taste : null }]
      : [];
  });
}

export async function planSlurpPostSpice(
  db: DB,
  input: {
    account: Pick<SlpAccount, "id"> & { settings: { strategy?: unknown } };
    source: Pick<SlpAccount, "kind" | "entityId"> | null;
    disclosureMode: SlpIdentityDisclosure;
    access: "public" | "locked";
    intent: string | undefined;
    teaser: boolean;
    /** The player's own direction decides the post; no spicy angle on top of it. */
    directed: boolean;
    /** This post's planned level and the Creator's ceiling, both under the Slurp-wide limit. */
    explicitLevel: SlurpExplicitLevel;
    dialLevel: SlurpExplicitLevel;
    collabs: readonly SlurpCreatorCollab[];
    recentPosts: readonly { metadata?: unknown }[];
    sequence: number;
    variation: SlurpPostVariation | null;
    beat: SlurpBeat | null;
  },
) {
  const spiceRead = await resolveSlurpSpiceCreator(db, input).catch((error: unknown) => {
    logger.warn(error, "[slurp] Could not read the Creator's spice; the post goes without it");
    return null;
  });
  const postLevel = slurpPostSexualLevel({ level: input.explicitLevel, access: input.access, intent: input.intent });
  const locked = input.access === "locked";
  const angle =
    spiceRead && !input.directed
      ? slurpSpiceAngle({
          level: postLevel,
          ceiling: input.dialLevel,
          access: input.access,
          teaser: input.teaser,
          creator: spiceRead.creator,
          spice: spiceRead.spice.spice,
          collabs:
            postLevel === "explicit" && locked
              ? await slurpSpicyCollabNames(db, input.collabs, input.account.id).catch(() => [])
              : [],
          recent: recentSpice(input.recentPosts),
          sequence: input.sequence,
        })
      : null;
  // A locked spicy post's picture shows its own moment, and a partner scene its partner.
  const variation =
    angle && locked && input.variation
      ? {
          ...input.variation,
          moment: angle.moment,
          ...(angle.partner ? { company: angle.partner.company, companyCanHoldCamera: false } : {}),
        }
      : input.variation;
  // A named partner is in the cast, so the claim check does not call them invented.
  const partner = angle?.partner?.name;
  const beat = input.beat && partner ? { ...input.beat, cast: [...input.beat.cast, partner] } : input.beat;
  // Stored on the post: unlocks, likes and tips on it teach Slurp the player's taste.
  const metadata = angle ? { slurpSpice: { kind: angle.kind, ...(angle.taste ? { taste: angle.taste } : {}) } } : {};
  return { spice: spiceRead?.spice ?? null, postLevel, angle, variation, beat, metadata };
}
