import { z } from "zod";

/**
 * A Creator's Page: the stack of blocks under the profile header that says who they are.
 *
 * The page stores only choices and words: a theme id, the block order, and the text of the blocks
 * the Creator writes. Everything that can be looked up (pictures, prices, facts, people, the latest
 * poll) is filled in by code when the page renders, so a page never claims a price that drifted or a
 * picture that was deleted. An AI Creator composes the same spec a player edits by hand.
 *
 * Shared because the server stores and repairs it (including a model's answer) and the client
 * renders and edits it.
 */

export const SLP_CREATOR_PAGE_THEMES = ["slurp", "candle", "peach", "sketch", "mono", "ocean"] as const;
export type SlpCreatorPageTheme = (typeof SLP_CREATOR_PAGE_THEMES)[number];

export const SLP_CREATOR_PAGE_BLOCK_KINDS = [
  "quote",
  "now",
  "collage",
  "list",
  "thisOrThat",
  "qa",
  "facts",
  "menu",
  "people",
  "poll",
] as const;
export type SlpCreatorPageBlockKind = (typeof SLP_CREATOR_PAGE_BLOCK_KINDS)[number];

export const SLP_CREATOR_PAGE_COLLAGE_LAYOUTS = ["bento", "mood", "polaroid", "film"] as const;
export type SlpCreatorPageCollageLayout = (typeof SLP_CREATOR_PAGE_COLLAGE_LAYOUTS)[number];

export const SLP_CREATOR_PAGE_LIMITS = {
  blocks: 10,
  title: 40,
  quote: 160,
  now: 100,
  listItems: 6,
  listItem: 90,
  pairs: 5,
  pairSide: 24,
  qaItems: 4,
  question: 120,
  answer: 240,
  collagePosts: 6,
} as const;

/** A "Now" line older than this is stale news and is not shown. */
export const SLP_CREATOR_PAGE_NOW_MAX_AGE_MS = 10 * 24 * 60 * 60_000;

const L = SLP_CREATOR_PAGE_LIMITS;
const text = (max: number) => z.string().trim().min(1).max(max);
const title = z.string().trim().max(L.title).default("");
const id = z.string().trim().min(1).max(64);

const quoteBlock = z.object({ id, kind: z.literal("quote"), text: text(L.quote) }).strict();
const nowBlock = z.object({ id, kind: z.literal("now"), text: text(L.now), at: z.string().datetime() }).strict();
const collageBlock = z
  .object({
    id,
    kind: z.literal("collage"),
    title,
    layout: z.enum(SLP_CREATOR_PAGE_COLLAGE_LAYOUTS),
    /** Posts chosen by hand, in order. Empty: code picks the best recent pictures every time the page renders. */
    postIds: z.array(id).max(L.collagePosts).default([]),
  })
  .strict();
const listBlock = z
  .object({
    id,
    kind: z.literal("list"),
    title,
    style: z.enum(["bullets", "numbered"]).default("bullets"),
    items: z.array(text(L.listItem)).min(1).max(L.listItems),
  })
  .strict();
const thisOrThatBlock = z
  .object({
    id,
    kind: z.literal("thisOrThat"),
    title,
    pairs: z
      .array(z.object({ left: text(L.pairSide), right: text(L.pairSide), pick: z.enum(["left", "right"]) }).strict())
      .min(1)
      .max(L.pairs),
  })
  .strict();
const qaBlock = z
  .object({
    id,
    kind: z.literal("qa"),
    title,
    items: z
      .array(z.object({ question: text(L.question), answer: text(L.answer) }).strict())
      .min(1)
      .max(L.qaItems),
  })
  .strict();
/** Blocks whose content code fills in. They store only a title. */
const computedBlock = <K extends "facts" | "menu" | "people" | "poll">(kind: K) =>
  z.object({ id, kind: z.literal(kind), title }).strict();

export const slpCreatorPageBlockSchema = z.discriminatedUnion("kind", [
  quoteBlock,
  nowBlock,
  collageBlock,
  listBlock,
  thisOrThatBlock,
  qaBlock,
  computedBlock("facts"),
  computedBlock("menu"),
  computedBlock("people"),
  computedBlock("poll"),
]);
export type SlpCreatorPageBlock = z.infer<typeof slpCreatorPageBlockSchema>;

export const slpCreatorPageSchema = z
  .object({
    theme: z.enum(SLP_CREATOR_PAGE_THEMES),
    blocks: z.array(slpCreatorPageBlockSchema).max(L.blocks),
    /** Who made the current version: the Creator (a model call) or the player. */
    composedBy: z.enum(["creator", "player"]),
    updatedAt: z.string().datetime(),
  })
  .strict();
export type SlpCreatorPage = z.infer<typeof slpCreatorPageSchema>;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : value);

/**
 * Trim over-long text before validation, so a model that writes 130 characters where 120 fit loses
 * ten characters instead of the whole block. Empty lines, pairs and questions are dropped the same way:
 * a trailing newline in the editor must not cost the player their list.
 */
function clipBlock(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw, title: clip(raw.title, L.title) };
  if (raw.title === undefined) delete out.title;
  if (raw.kind === "quote") out.text = clip(raw.text, L.quote);
  if (raw.kind === "now") out.text = clip(raw.text, L.now);
  if (raw.kind === "list" && Array.isArray(raw.items))
    out.items = raw.items
      .map((item) => clip(item, L.listItem))
      .filter((item) => item !== "")
      .slice(0, L.listItems);
  if (raw.kind === "thisOrThat" && Array.isArray(raw.pairs))
    out.pairs = raw.pairs
      .map((pair) => {
        const p = record(pair) ?? {};
        return { ...p, left: clip(p.left, L.pairSide), right: clip(p.right, L.pairSide) };
      })
      // A half-filled pair is dropped, not the block: the rest of the player's pairs stay.
      .filter((pair) => pair.left !== "" && pair.right !== "")
      .slice(0, L.pairs);
  if (raw.kind === "qa" && Array.isArray(raw.items))
    out.items = raw.items
      .map((item) => {
        const q = record(item) ?? {};
        return { ...q, question: clip(q.question, L.question), answer: clip(q.answer, L.answer) };
      })
      .filter((item) => item.question !== "" && item.answer !== "")
      .slice(0, L.qaItems);
  if (raw.kind === "collage" && Array.isArray(raw.postIds))
    out.postIds = [...new Set(raw.postIds.filter((postId) => typeof postId === "string"))].slice(0, L.collagePosts);
  return out;
}

/**
 * Read a stored page, or a page a model wrote, block by block. A bad block is dropped and the rest
 * stay; an unknown theme falls back to Slurp pink. Duplicate block ids get a fresh one, so the editor
 * can key on them. Returns null only when nothing usable is left.
 */
export function normalizeSlpCreatorPage(
  value: unknown,
  fallback: { composedBy: SlpCreatorPage["composedBy"]; now: string } = {
    composedBy: "player",
    now: new Date().toISOString(),
  },
): SlpCreatorPage | null {
  const raw = record(value);
  if (!raw || !Array.isArray(raw.blocks)) return null;
  const seen = new Set<string>();
  const blocks: SlpCreatorPageBlock[] = [];
  for (const [index, entry] of raw.blocks.entries()) {
    if (blocks.length >= L.blocks) break;
    const block = record(entry);
    if (!block) continue;
    let blockId = typeof block.id === "string" && block.id.trim() ? block.id.trim().slice(0, 64) : `b${index + 1}`;
    while (seen.has(blockId)) blockId = `${blockId.slice(0, 56)}-${index + 1}`;
    const parsed = slpCreatorPageBlockSchema.safeParse(clipBlock({ ...block, id: blockId }));
    if (!parsed.success) continue;
    seen.add(blockId);
    blocks.push(parsed.data);
  }
  if (!blocks.length) return null;
  const theme = SLP_CREATOR_PAGE_THEMES.includes(raw.theme as SlpCreatorPageTheme)
    ? (raw.theme as SlpCreatorPageTheme)
    : "slurp";
  const composedBy = raw.composedBy === "creator" || raw.composedBy === "player" ? raw.composedBy : fallback.composedBy;
  const updatedAt =
    typeof raw.updatedAt === "string" && !Number.isNaN(Date.parse(raw.updatedAt))
      ? new Date(raw.updatedAt).toISOString()
      : fallback.now;
  return { theme, blocks, composedBy, updatedAt };
}

/** Whether a block has something to show at `now`. Stale "Now" lines hide instead of lying. */
export function slpCreatorPageBlockLive(block: SlpCreatorPageBlock, now: number): boolean {
  if (block.kind !== "now") return true;
  const at = Date.parse(block.at);
  return !Number.isNaN(at) && now - at <= SLP_CREATOR_PAGE_NOW_MAX_AGE_MS;
}
