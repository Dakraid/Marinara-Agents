/**
 * Slurp's action layer: the named things a helper can do for the player ("improve text", "draw a
 * picture", "steer a Creator", "add an idea", "write a post"). The app's AI assist buttons call these,
 * and so can anything outside the app that the Engine lets reach Slurp (Professor Mari, through the
 * `mari-actions:slurp2` service on Engines with Capability API 1.50).
 *
 * Every action has a name, a one-line summary in plain words, a description of each input, and a zod
 * schema. The server validates every call against the schema here before it runs; the client uses the
 * same schema and types, so both sides agree on one contract. See docs/architecture/README.md
 * ("Action layer").
 */
import { z } from "zod";
import { SLP_STEERING_MOODS, SLP_STEERING_PACES, SLP_STEERING_TEXT_MAX } from "./slp-creator-steering.js";

/**
 * The text fields the assist can write or improve, with what the model is told the field is, who
 * speaks in it, and how long it may be. `creator` = written as the Creator (their brief is used);
 * `player` = the player writes it themself; `about` = notes about the Creator (third person).
 */
export const SLP_ASSIST_FIELDS = {
  bio: { what: "their profile bio on their Slurp page", voice: "creator", max: 500 },
  caption: { what: "the caption of a feed post", voice: "creator", max: 2000 },
  story: { what: "the one short line on a Story picture", voice: "creator", max: 280 },
  reply: { what: "their next direct message in a chat", voice: "creator", max: 1000 },
  voice: {
    what: "how they talk on their page (their stage voice), for the people writing as them",
    voice: "about",
    max: 1000,
  },
  facts: { what: "a few plain facts about them for their page (looks, wardrobe, places)", voice: "about", max: 1000 },
  life: {
    what: "what is going on in their life right now, one short line",
    voice: "about",
    max: SLP_STEERING_TEXT_MAX,
  },
  focus: {
    what: "what they are into or working on lately, one short line",
    voice: "about",
    max: SLP_STEERING_TEXT_MAX,
  },
  idea: { what: "an idea for one of their next posts, one short line", voice: "about", max: 160 },
  chapter: { what: "what happens next in their storyline, one short line", voice: "about", max: 160 },
  brief: { what: "a commission brief: what the fan asks the Creator to make for them", voice: "player", max: 1000 },
  dm: { what: "the fan's direct message to the Creator", voice: "player", max: 1000 },
  support: { what: "Slurp Support's direct message to a Creator", voice: "staff", max: 1000 },
} as const satisfies Record<string, { what: string; voice: "creator" | "player" | "about" | "staff"; max: number }>;
export type SlpAssistField = keyof typeof SLP_ASSIST_FIELDS;
export const SLP_ASSIST_FIELD_NAMES = Object.keys(SLP_ASSIST_FIELDS) as [SlpAssistField, ...SlpAssistField[]];

export const SLP_ASSIST_NOTE_MAX = 400;
export const SLP_ASSIST_REQUEST_MAX = 600;
/** What a drawn picture is for; it sets the size and the framing. */
export const SLP_PICTURE_TARGETS = ["avatar", "cover", "post", "story"] as const;
export type SlpPictureTarget = (typeof SLP_PICTURE_TARGETS)[number];

const accountId = z.string().trim().min(1).max(200);
const note = z.string().trim().max(SLP_ASSIST_NOTE_MAX).optional();
/** Nearby text that helps (the post a Story links to, the fan type's name); never written back. */
const context = z.string().trim().max(2000).optional();

const textInput = z
  .object({ field: z.enum(SLP_ASSIST_FIELD_NAMES), accountId: accountId.optional(), note, context })
  .strict();

export const SLP_ACTIONS = {
  "write-text": {
    summary: "Write a text field from scratch (a bio, a caption, a Story line, a steering note…).",
    inputs: {
      field: `One of: ${SLP_ASSIST_FIELD_NAMES.join(", ")}.`,
      accountId: "The Creator it is for (optional for the player's own texts).",
      note: "What the player wants it to say (optional).",
      context: "Nearby text that helps (optional).",
    },
    schema: textInput,
  },
  "improve-text": {
    summary: "Improve a text the player already wrote, keeping its meaning and language.",
    inputs: {
      field: `One of: ${SLP_ASSIST_FIELD_NAMES.join(", ")}.`,
      text: "The current text.",
      accountId: "The Creator it is for (optional).",
      note: "What should change (optional).",
      context: "Nearby text that helps (optional).",
    },
    schema: textInput.extend({ text: z.string().trim().min(1).max(4000) }).strict(),
  },
  "draw-picture": {
    summary:
      "Draw a picture of a Creator from what the player typed, their brief and their spice level. Returns it without saving it.",
    inputs: {
      accountId: "The Creator.",
      target: `One of: ${SLP_PICTURE_TARGETS.join(", ")}.`,
      request: "What the picture should show, in the player's words (optional for posts: the caption is used).",
      context: "The caption or Story line it goes with (optional).",
      options:
        "Optional switches: who they are (creatorDetails), their look (appearance), reference pictures (sourceReferences), profile framing (composition).",
    },
    schema: z
      .object({
        accountId,
        target: z.enum(SLP_PICTURE_TARGETS),
        request: z.string().trim().max(SLP_ASSIST_REQUEST_MAX).default(""),
        context,
        options: z
          .object({
            creatorDetails: z.boolean(),
            appearance: z.boolean(),
            sourceReferences: z.boolean(),
            composition: z.boolean(),
          })
          .partial()
          .strict()
          .optional(),
      })
      .strict(),
  },
  "use-picture": {
    summary: "Make a drawn picture the Creator's profile picture or cover. The old one is kept for Undo.",
    inputs: { accountId: "The Creator.", target: "avatar or cover.", image: "The picture as a data URL." },
    schema: z
      .object({
        accountId,
        target: z.enum(["avatar", "cover"]),
        image: z
          .string()
          .max(16_000_000)
          .regex(/^data:image\/(png|jpeg|webp);base64,/u),
      })
      .strict(),
  },
  "undo-picture": {
    summary: "Put back the profile picture or cover that was there before the last use-picture.",
    inputs: { accountId: "The Creator.", target: "avatar or cover." },
    schema: z.object({ accountId, target: z.enum(["avatar", "cover"]) }).strict(),
  },
  "keep-picture": {
    summary: "Keep the picture from the last use-picture: the old one is let go and Undo is no longer offered.",
    inputs: { accountId: "The Creator.", target: "avatar or cover." },
    schema: z.object({ accountId, target: z.enum(["avatar", "cover"]) }).strict(),
  },
  "steer-creator": {
    summary: "Change what is going on in a Creator's life: mood, life, focus, topics, how often they post.",
    inputs: {
      accountId: "The Creator.",
      mood: `One of: ${SLP_STEERING_MOODS.join(", ")}, or null for as usual.`,
      lifePhase: "What is going on in their life.",
      focus: "What they are into lately.",
      push: "Topics to bring up more.",
      avoid: "Topics to leave out.",
      pace: `One of: ${SLP_STEERING_PACES.join(", ")}.`,
    },
    schema: z
      .object({
        accountId,
        mood: z.enum(SLP_STEERING_MOODS).nullable().optional(),
        lifePhase: z.string().trim().max(SLP_STEERING_TEXT_MAX).optional(),
        focus: z.string().trim().max(SLP_STEERING_TEXT_MAX).optional(),
        push: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
        avoid: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
        pace: z.enum(SLP_STEERING_PACES).optional(),
      })
      .strict(),
  },
  "add-idea": {
    summary: "Give a Creator an idea for one of their next posts or Stories. They do it their way.",
    inputs: { accountId: "The Creator.", text: "The idea.", story: "True for a Story (optional)." },
    schema: z
      .object({ accountId, text: z.string().trim().min(1).max(160), story: z.boolean().default(false) })
      .strict(),
  },
  "list-creators": {
    summary:
      "List the Creators on Slurp: their id (every other action takes it as accountId), name and handle. Changes nothing.",
    inputs: {},
    schema: z.object({}).strict(),
  },
  "write-post": {
    summary: "Have a Creator write and post their next post now (it takes their oldest idea, or the one given).",
    inputs: { accountId: "The Creator.", idea: "An idea for this post (optional).", story: "True for a Story." },
    schema: z
      .object({ accountId, idea: z.string().trim().min(1).max(160).optional(), story: z.boolean().default(false) })
      .strict(),
  },
} as const;

export type SlpActionName = keyof typeof SLP_ACTIONS;
export const SLP_ACTION_NAMES = Object.keys(SLP_ACTIONS) as SlpActionName[];
export type SlpActionInput<N extends SlpActionName> = z.input<(typeof SLP_ACTIONS)[N]["schema"]>;
export type SlpActionParsed<N extends SlpActionName> = z.output<(typeof SLP_ACTIONS)[N]["schema"]>;

/** What each action answers with. Steering and posting answer with what their own routes answer. */
export type SlpActionResult = {
  "write-text": { text: string };
  "improve-text": { text: string };
  "draw-picture": { image: string; prompt: string };
  "use-picture": { url: string | null };
  "undo-picture": { url: string | null };
  "keep-picture": { kept: boolean };
  "steer-creator": unknown;
  "add-idea": unknown;
  "list-creators": { creators: { id: string; name: string; handle: string }[] };
  "write-post": unknown;
};

/** The catalog without the schemas: what a helper reads to know what it can ask Slurp to do. */
export function slpActionCatalog() {
  return SLP_ACTION_NAMES.map((name) => ({
    name,
    summary: SLP_ACTIONS[name].summary,
    inputs: SLP_ACTIONS[name].inputs,
  }));
}

/**
 * The service keys the action layer registers under. `slurp2:actions` always; `mari-actions:slurp2`
 * for Professor Mari only when this package's manifest holds the `mari-actions` permission, which
 * only an Engine with Capability API 1.50 accepts (the builder adds it once slurp2 declares 1.50).
 * An older Engine never sees the key, so Slurp loads the same there (J2).
 */
export function slpActionServiceKeys(permissions: readonly unknown[] | null | undefined): string[] {
  return ["slurp2:actions", ...(permissions?.includes("mari-actions") ? ["mari-actions:slurp2"] : [])];
}

export function isSlpActionName(value: string): value is SlpActionName {
  return Object.hasOwn(SLP_ACTIONS, value);
}
