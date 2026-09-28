/**
 * What a couple's story means for a Creator's next post: a beat, like a collab or a rivalry.
 *
 * Pure and deterministic. The beat says what happens (a date, the hard launch, a fight, the
 * breakup); the flavour brief makes the Creator tell it their own way in the same post call. Big
 * news (launch, anniversary, breakup, reunion, a shared page opening or closing) takes the next
 * ordinary slot; small moments only now and then, and each Creator posts a moment once.
 */
import { hash } from "../projects/slp-project.js";
import {
  SLURP_COUPLE_MOMENT_DAYS,
  slurpCoupleOther,
  type SlurpCouple,
  type SlurpCoupleMoment,
  type SlurpCoupleMomentKind,
} from "../projects/slp-creator-couples.js";
import type { SlurpTieStamp } from "../projects/slp-tie-stamp.js";
import type { SlurpBeat } from "./slp-post-beat.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const BIG: readonly SlurpCoupleMomentKind[] = ["launch", "anniversary", "breakup", "reunion", "pageOpen", "pageClose"];
/** Made together: on both pages, or on their shared page when it is open. */
const JOINT: readonly SlurpCoupleMomentKind[] = ["launch", "anniversary", "reunion"];
const PAGE_ONLY: readonly SlurpCoupleMomentKind[] = ["pageOpen", "pageClose"];
/** What goes up on a shared page on an ordinary day, like real couple accounts post. */
const PAGE_IDEAS = [
  "a morning side by side, before either of you is a person",
  "the grocery run you two always argue in",
  "a question round: fans ask, you both answer",
  "who is the messier one, settled once and for all",
  "the other one's worst habit, lovingly exposed",
  "a throwback to how you two met",
  "a lazy Sunday that did not leave the couch",
  "one of you trying the other's hobby, badly",
  "getting ready for a night out, together",
  "a small fight about something tiny, made up on camera",
  "the one thing you both agree on, and the ten you do not",
  "a recipe one of you swears by and the other doubts",
] as const;

function momentLine(moment: SlurpCoupleMoment, partner: string, couple: SlurpCouple, other: string | null): string {
  const dating = couple.stage === "dating" || couple.stage === "sparks";
  switch (moment.kind) {
    case "flirt":
      return `You and ${partner} have been flirting in each other's comments, and people are starting to notice. Hint at it your way, without saying anything official.`;
    case "date":
      return dating
        ? `You went on a date with ${partner}: ${moment.detail}. Share a bit of it your way; it is not official yet, so keep it a little coy.`
        : `A date with ${partner}: ${moment.detail}. Share it your way.`;
    case "launch":
      return `You and ${partner} are official now. Tell your fans your way: a proud hard launch, a shy one, or a joke.`;
    case "anniversary":
      return `${moment.detail[0]!.toUpperCase()}${moment.detail.slice(1)} with ${partner} today. Mark it your way.`;
    case "jealous":
      return other
        ? `${partner} made a collab with ${other}, and it got to you more than you want to admit. Let a bit of it show, your way, without airing everything.`
        : `Something with ${partner} is bugging you: ${moment.detail}. Let a bit of it show, your way, without airing everything.`;
    case "fight":
      return `You and ${partner} had a fight about ${moment.detail}. You are not over it yet. Say as much or as little as you would.`;
    case "makeup":
      return `You and ${partner} talked it out after the fight. Things are good again; show it your way.`;
    case "breakup":
      return `You and ${partner} broke up. Tell your fans your way: sad, relieved, messy or graceful, whatever is true for you.`;
    case "reunion":
      return `You and ${partner} are back together. Tell your fans your way.`;
    case "pageOpen":
      return `You and ${partner} just opened a page together. This is its first post: say hi to everyone as a couple, your way.`;
    case "pageClose":
      return `This is the last post on the page you shared with ${partner}. Say goodbye to the fans who followed you both, kindly and your way.`;
  }
}

/**
 * The couple beat for this Creator's ordinary slot, or null. Newest untold moment first; while a
 * shared page is open, about one ordinary slot in four goes to that page.
 */
export function slurpCoupleBeat(input: {
  creatorId: string;
  sequence: number;
  couples: readonly SlurpCouple[];
  /** Public names by account id (Creators and shared pages). */
  names: ReadonlyMap<string, string>;
  at: Date;
}): (SlurpBeat & { tie: SlurpTieStamp }) | null {
  const { creatorId, names, at } = input;
  for (const couple of input.couples) {
    const partnerId = slurpCoupleOther(couple, creatorId);
    const partner = partnerId ? names.get(partnerId) : undefined;
    if (!partnerId || !partner) continue;
    const page = couple.page;
    const pageOpen = Boolean(page && !page.closedAt);
    const fresh = couple.moments
      .filter((moment) => at.getTime() - Date.parse(moment.at) < SLURP_COUPLE_MOMENT_DAYS * DAY_MS)
      .filter((moment) => !couple.told.includes(`${creatorId}:${moment.id}`))
      // Jealousy is theirs to post, not the one it is about.
      .filter((moment) => !moment.fromId || moment.fromId === creatorId)
      .filter((moment) => !PAGE_ONLY.includes(moment.kind) || page)
      .reverse();
    const moment = fresh.find(
      (entry) => BIG.includes(entry.kind) || hash(`${entry.id}:${creatorId}:${input.sequence}`) % 2 === 0,
    );
    if (moment) {
      const joint =
        JOINT.includes(moment.kind) ||
        (moment.kind === "date" &&
          couple.stage !== "sparks" &&
          couple.stage !== "dating" &&
          hash(`${moment.id}:joint`) % 2 === 0);
      const onPage = page && (PAGE_ONLY.includes(moment.kind) || (joint && pageOpen));
      const other = moment.withId ? (names.get(moment.withId) ?? null) : null;
      const where = onPage
        ? ` It goes up on ${names.get(page.accountId) ?? "your shared page"}, the page you two share, not your own.`
        : joint
          ? " You made it together: it goes up on both your pages and you tag each other."
          : "";
      return {
        type: moment.kind === "fight" || moment.kind === "jealous" ? "opinion" : "relationship_moment",
        anchorKind: "couple",
        anchor: partner,
        line: `${momentLine(moment, partner, couple, other)}${where}`,
        cast: other ? [partner, other] : [partner],
        place: null,
        tie: {
          kind: "couple",
          id: couple.id,
          partnerId,
          moment: moment.kind,
          momentId: moment.id,
          ...(onPage ? { pageId: page.accountId, hostId: creatorId } : joint ? { joint: true } : {}),
        },
      };
    }
    if (pageOpen && hash(`${couple.id}:${creatorId}:${input.sequence}:page`) % 4 === 0) {
      // A different idea each time: a turn picks from the ideas by the page's own post count.
      const turn = hash(`${couple.id}:${creatorId}`) + input.sequence;
      const idea = PAGE_IDEAS[turn % PAGE_IDEAS.length]!;
      return {
        type: "relationship_moment",
        anchorKind: "couple",
        anchor: partner,
        line: `You post on ${names.get(page!.accountId) ?? "the page you share with " + partner}, the page you and ${partner} share: ${idea}. Your way; it goes up there, not on your own page.`,
        cast: [partner],
        place: null,
        tie: { kind: "couple", id: couple.id, partnerId, pageId: page!.accountId, hostId: creatorId },
      };
    }
  }
  return null;
}
