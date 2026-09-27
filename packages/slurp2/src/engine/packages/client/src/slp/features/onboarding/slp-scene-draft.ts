/**
 * The live page draft of the role-play sign-up: patches, locks and undo.
 *
 * Every exchange may propose a patch. A patch never touches a field the player locked (editing a
 * field by hand locks it), every applied patch becomes a chip, and undoing a chip puts back only
 * the fields that still hold that chip's values, so a later patch or edit is never thrown away.
 *
 * Pure, so the rules run in tests.
 */
import {
  SLP_SCENE_ACTIONS,
  SLP_SCENE_FIELDS,
  SLP_SCENE_TRANSCRIPT_MAX,
  type SlpSceneActionId,
  type SlpSceneMoment,
  type SlpScenePreset,
  type SlpSceneLine,
  type SlpSceneDraft,
  type SlpSceneField,
  type SlpScenePatch,
} from "../../../../../shared/src/slp/slp-scene.js";
import type { SlpIdentityDisclosure } from "../../../../../shared/src/slp/slp-social.types.js";

export type SlpSceneChip = {
  id: string;
  fields: SlpSceneField[];
  before: SlpScenePatch;
  after: SlpScenePatch;
  undone: boolean;
};

export type SlpSceneDraftState = {
  draft: SlpSceneDraft;
  locked: SlpSceneField[];
  chips: SlpSceneChip[];
};

export const SLP_SCENE_EMPTY_DRAFT: SlpSceneDraft = {
  displayName: "",
  handle: "",
  bio: "",
  stagePersonality: "",
  appearance: "",
  wardrobe: "",
  locations: "",
  turnOns: "",
  hardNoes: "",
  gender: null,
  tags: [],
  spice: null,
};

/** A page needs these before it can be saved; the create route refuses it otherwise. */
export const SLP_SCENE_MIN_TAGS = 3;

const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

export function slpSceneInitialState(seed: SlpScenePatch = {}, locked: SlpSceneField[] = []): SlpSceneDraftState {
  return { draft: { ...SLP_SCENE_EMPTY_DRAFT, ...seed }, locked: [...new Set(locked)], chips: [] };
}

/** Apply a patch to the unlocked fields that it really changes. No change, no chip. */
export function applySlpScenePatch(
  state: SlpSceneDraftState,
  patch: SlpScenePatch,
  id: string,
): { state: SlpSceneDraftState; chip: SlpSceneChip | null } {
  const before: SlpScenePatch = {};
  const after: SlpScenePatch = {};
  const fields: SlpSceneField[] = [];
  for (const field of SLP_SCENE_FIELDS) {
    if (!(field in patch) || state.locked.includes(field)) continue;
    const value = patch[field];
    if (value === undefined || same(state.draft[field], value)) continue;
    fields.push(field);
    Object.assign(before, { [field]: state.draft[field] });
    Object.assign(after, { [field]: value });
  }
  if (!fields.length) return { state, chip: null };
  const chip: SlpSceneChip = { id, fields, before, after, undone: false };
  return {
    state: { ...state, draft: { ...state.draft, ...after }, chips: [...state.chips, chip] },
    chip,
  };
}

/** Put back what one chip changed, field by field, only where nothing changed it since. */
export function undoSlpSceneChip(state: SlpSceneDraftState, chipId: string): SlpSceneDraftState {
  const chip = state.chips.find((entry) => entry.id === chipId);
  if (!chip || chip.undone) return state;
  const restore: SlpScenePatch = {};
  for (const field of chip.fields) {
    // A newer live chip owns the field now, even when it set the same value again.
    const newest = [...state.chips].reverse().find((entry) => !entry.undone && entry.fields.includes(field));
    if (newest?.id !== chip.id) continue;
    if (state.locked.includes(field) || !same(state.draft[field], chip.after[field])) continue;
    Object.assign(restore, { [field]: chip.before[field] });
  }
  return {
    ...state,
    draft: { ...state.draft, ...restore },
    chips: state.chips.map((entry) => (entry.id === chipId ? { ...entry, undone: true } : entry)),
  };
}

/** A hand edit wins: it sets the value and locks the field against later patches. */
export function editSlpSceneField<F extends SlpSceneField>(
  state: SlpSceneDraftState,
  field: F,
  value: SlpSceneDraft[F],
): SlpSceneDraftState {
  return {
    ...state,
    draft: { ...state.draft, [field]: value },
    locked: state.locked.includes(field) ? state.locked : [...state.locked, field],
  };
}

export function toggleSlpSceneLock(state: SlpSceneDraftState, field: SlpSceneField): SlpSceneDraftState {
  return {
    ...state,
    locked: state.locked.includes(field) ? state.locked.filter((entry) => entry !== field) : [...state.locked, field],
  };
}

/** What the page still needs before it can be registered. Empty = ready. */
export function slpSceneMissing(draft: SlpSceneDraft): ("displayName" | "handle" | "gender" | "tags")[] {
  const missing: ("displayName" | "handle" | "gender" | "tags")[] = [];
  if (!draft.displayName.trim()) missing.push("displayName");
  if (!draft.handle.trim()) missing.push("handle");
  if (!draft.gender) missing.push("gender");
  if (draft.tags.length < SLP_SCENE_MIN_TAGS) missing.push("tags");
  return missing;
}

/** The page parts the player sees ticking off, in the order the chat usually reaches them. */
export const SLP_SCENE_PROGRESS = ["name", "look", "bio", "voice", "tags", "limits"] as const;
export type SlpSceneProgressPart = (typeof SLP_SCENE_PROGRESS)[number];

/**
 * How far the page is, in the player's words: which parts are done, and whether the page has
 * what it needs to go live (the same rule Finish checks).
 */
export function slpSceneProgress(draft: SlpSceneDraft, hasPhoto = false) {
  const done: Record<SlpSceneProgressPart, boolean> = {
    name: Boolean(draft.displayName.trim() && draft.handle.trim()),
    look: hasPhoto || Boolean(draft.appearance.trim()),
    bio: Boolean(draft.bio.trim()),
    voice: Boolean(draft.stagePersonality.trim()),
    tags: Boolean(draft.gender) && draft.tags.length >= SLP_SCENE_MIN_TAGS,
    limits: Boolean(draft.spice || draft.turnOns.trim() || draft.hardNoes.trim()),
  };
  const parts = SLP_SCENE_PROGRESS.map((id) => ({ id, done: done[id] }));
  return {
    parts,
    done: parts.filter((part) => part.done).length,
    total: parts.length,
    ready: slpSceneMissing(draft).length === 0,
  };
}

/**
 * The one field a change note names with the value the patch set ("Name set: Velvet Moth"), or null
 * when the note just lists the fields. The name wins; otherwise only a lone short value is quoted.
 */
export function slpScenePatchHeadline(
  fields: readonly SlpSceneField[],
  values: SlpScenePatch,
): { field: SlpSceneField; value: string } | null {
  const text = (field: SlpSceneField) => {
    const value = values[field];
    return typeof value === "string" ? value.trim() : "";
  };
  if (fields.includes("displayName") && text("displayName"))
    return { field: "displayName", value: text("displayName") };
  const field = fields.length === 1 ? fields[0] : undefined;
  if (!field || field === "gender" || field === "spice") return null;
  const value = text(field);
  return value && value.length <= 40 ? { field, value } : null;
}

/** The suggestion that fits each moment best; it goes first and is the highlighted one. */
const SLP_SCENE_MOMENT_LEAD: Partial<Record<SlpSceneMoment, readonly SlpSceneActionId[]>> = {
  name: ["askName", "suggestName", "bolder"],
  about: ["askAbout"],
  look: ["askLook"],
  voice: ["joke"],
  limits: ["tease", "joke"],
  review: ["stamp"],
  arrival: ["hypeUp"],
  shoot: ["lookTogether"],
  bio: ["hypeUp"],
  firstPost: ["hypeUp"],
};

/** The preset's suggestions for this moment, the best fit first; the row shows the first few. */
export function slpSceneSuggestions(preset: SlpScenePreset, moment: SlpSceneMoment): SlpSceneActionId[] {
  const all = SLP_SCENE_ACTIONS[preset] as readonly SlpSceneActionId[];
  const lead = all.find((id) => SLP_SCENE_MOMENT_LEAD[moment]?.includes(id));
  return lead ? [lead, ...all.filter((id) => id !== lead)] : [...all];
}

/** The stage profile the create route takes. The limits go to the strategy, not the page. */
export function slpSceneStageProfile(draft: SlpSceneDraft, disclosureMode: SlpIdentityDisclosure) {
  return {
    displayName: draft.displayName.trim(),
    handle: draft.handle.trim().replace(/^@+/u, ""),
    bio: draft.bio.trim(),
    stagePersonality: draft.stagePersonality.trim(),
    appearance: draft.appearance.trim(),
    wardrobe: draft.wardrobe.trim(),
    locations: draft.locations.trim(),
    disclosureMode,
    gender: draft.gender,
    tags: draft.tags,
  };
}

/**
 * The limits moment as one strategy line, or "" when nothing was said.
 *
 * ponytail: the spice level rides in the free strategy text until Creators get a real per-Creator
 * level (overnight plan 7b); then write the level there and keep this line for the likes and noes.
 */
export function slpSceneLimitsText(draft: SlpSceneDraft): string {
  return [
    draft.spice ? `How far the page goes: ${draft.spice}.` : "",
    draft.turnOns.trim() ? `Happy to show: ${draft.turnOns.trim()}` : "",
    draft.hardNoes.trim() ? `Hard noes: ${draft.hardNoes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** A full redraft (the "Update page" button) as a patch: only the fields a stage draft carries. */
export function slpSceneRedraftPatch(result: {
  displayName?: string;
  handle?: string;
  bio?: string;
  stagePersonality?: string;
  appearance?: string;
  wardrobe?: string;
  locations?: string;
  gender?: "male" | "female" | "other" | null;
  tags?: string[];
}): SlpScenePatch {
  const patch: SlpScenePatch = {};
  for (const field of [
    "displayName",
    "handle",
    "bio",
    "stagePersonality",
    "appearance",
    "wardrobe",
    "locations",
  ] as const) {
    const value = result[field];
    if (typeof value === "string" && value.trim()) patch[field] = value.trim();
  }
  if (result.gender) patch.gender = result.gender;
  if (result.tags?.length) patch.tags = result.tags;
  return patch;
}

export type SlpSceneItem =
  | { id: string; kind: "line"; speaker: SlpSceneLine["speaker"]; text: string }
  | { id: string; kind: "patch"; chipId: string; fields: SlpSceneField[]; redraft: boolean }
  | { id: string; kind: "note"; text: string }
  /** The player's steer in the creator seat: shown to the player, never sent back as a line. */
  | { id: string; kind: "whisper"; text: string }
  | { id: string; kind: "photo"; photo: "avatar" | "banner"; imageUrl: string };

/** What the transcript sends back: the lines only, newest last, capped. */
export function slpSceneTranscript(items: readonly SlpSceneItem[], max = SLP_SCENE_TRANSCRIPT_MAX): SlpSceneLine[] {
  return items
    .flatMap((item) => (item.kind === "line" ? [{ speaker: item.speaker, text: item.text }] : []))
    .slice(-max);
}

/** The chat as guidance for a full redraft: newest lines first win the 2000 characters. */
export function slpSceneGuidance(items: readonly SlpSceneItem[], hostLabel: string, direction: string): string {
  const lines = slpSceneTranscript(items).map(
    (line) => `${line.speaker === "host" ? hostLabel : "Newcomer"}: ${line.text}`,
  );
  const head = [
    "Build the page from what the newcomer said in this sign-up chat. Keep their words and taste.",
    direction ? `Direction: ${direction}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const kept: string[] = [];
  let length = head.length;
  for (const line of lines.reverse()) {
    if (length + line.length + 1 > 1990) break;
    kept.unshift(line);
    length += line.length + 1;
  }
  return [head, ...kept].join("\n");
}

/** What the image pipeline is asked for at the first photo shoot. */
export function slpSceneShootGuidance(kind: "avatar" | "banner", outfit: string, place: string): string {
  return [
    kind === "avatar"
      ? "The first profile photo from their first photo shoot."
      : "The cover photo from the same first photo shoot, a wide shot of the place.",
    outfit.trim() ? `Outfit: ${outfit.trim().slice(0, 400)}.` : "",
    place.trim() ? `Place: ${place.trim().slice(0, 400)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
