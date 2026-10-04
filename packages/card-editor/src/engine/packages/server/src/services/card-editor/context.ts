/**
 * Prompt context assembly for Card Editor bulk runs (ARCH §4). Pure string builders over plain
 * data — the package host exposes no character/lorebook store, so callers fetch records over the
 * engine REST API and pass the card fields through (backstory/appearance from the card's
 * extensions). Character blocks mirror the engine's <character_cards> assembly (field order,
 * normalize-then-escape, empty fields omitted); the behavior block is byte-identical to the
 * engine's buildBehaviorCharacterBlock (SPEC AC3: engine editor-run and package bulk prompts
 * must carry the identical block).
 *
 * Import specifiers keep their ".ts" extension: the bulk regression runs this module under plain
 * Node type-stripping, which does not remap ".js" specifiers. esbuild and tsc both accept ".ts".
 */
import { escapeXml, normalizeCardPromptText } from "../../../../shared/src/features/agents/card-editor/text.ts";

export interface CharacterLike {
  id?: string;
  name?: string;
  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  creator_notes?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  backstory?: string;
  appearance?: string;
}

export interface LorebookEntryLike {
  name?: string;
  content?: string;
  enabled?: boolean;
}

export interface LorebookLike {
  name?: string;
  entries?: LorebookEntryLike[];
}

/** Fixed instruction that follows every <behavior_character> block. Byte-identical to the
 *  engine's line in agent-executor — do not reword. */
const BEHAVIOR_INSTRUCTION =
  "Adopt this character's behavior, judgment, and writing style when editing — it guides HOW cards are written; the directive and user notes govern WHAT changes.";

// Field order mirrors the engine's <character_cards> assembly.
const CHARACTER_BLOCK_FIELDS = [
  "description",
  "personality",
  "scenario",
  "backstory",
  "appearance",
  "first_mes",
  "mes_example",
  "creator_notes",
  "system_prompt",
  "post_history_instructions",
] as const;

export interface CharacterBlockOptions {
  /** Opaque id token for the id attribute; defaults to card.id. */
  id?: string;
  /** Per-target note from the dispatch dialog; emitted as <user_note> after the fields. */
  note?: string;
  /** Style reference character; its block follows the note. null/undefined = no block. */
  behaviorCharacter?: CharacterLike | null;
}

export function buildCharacterBlock(card: CharacterLike, options: CharacterBlockOptions = {}): string {
  const id = options.id ?? card.id ?? "";
  const name = typeof card.name === "string" ? card.name : "";
  const lines = [`<character id="${escapeXml(id)}" name="${escapeXml(name)}">`];
  for (const field of CHARACTER_BLOCK_FIELDS) {
    const value = normalizeCardPromptText(card[field]);
    if (value) lines.push(`<${field}>${escapeXml(value)}</${field}>`);
  }
  // Notes are directives, not card content: trim them, but never strip {{// …}} comments.
  const note = typeof options.note === "string" ? options.note.trim() : "";
  if (note) lines.push(`<user_note>${escapeXml(note)}</user_note>`);
  const behavior = options.behaviorCharacter ? buildBehaviorCharacterBlock(options.behaviorCharacter) : "";
  if (behavior) lines.push(behavior);
  lines.push("</character>");
  return lines.join("\n");
}

/** Byte-identical to the engine's buildBehaviorCharacterBlock given the same stored card: the
 *  engine receives cardPromptText-normalized values from its caller, this package normalizes the
 *  raw fields itself (name stays raw, mirroring the engine's loadCharacterPromptInfo). */
export function buildBehaviorCharacterBlock(card: CharacterLike): string {
  const lines: string[] = [];
  const push = (label: string, value: string | undefined): void => {
    if (typeof value === "string" && value.trim().length > 0) lines.push(`${label}: ${escapeXml(value)}`);
  };
  push("Name", card.name);
  push("Description", normalizeCardPromptText(card.description));
  push("Personality", normalizeCardPromptText(card.personality));
  push("Backstory", normalizeCardPromptText(card.backstory));
  push("Appearance", normalizeCardPromptText(card.appearance));
  push("System", normalizeCardPromptText(card.system_prompt));
  if (lines.length === 0) return "";
  return ["<behavior_character>", ...lines, "</behavior_character>", BEHAVIOR_INSTRUCTION].join("\n");
}

export const LOREBOOK_ENTRY_CHAR_CAP = 4_000;
export const LOREBOOK_TOTAL_CHAR_CAP = 24_000;
const TRUNCATION_MARKER = "[…truncated]";

function capEntryText(text: string, cap: number): string {
  if (text.length <= cap) return text;
  return `${text.slice(0, Math.max(0, cap - TRUNCATION_MARKER.length))}${TRUNCATION_MARKER}`;
}

/** <lorebook name="…"> blocks over enabled entries, in stable input order. Caps apply to the raw
 *  entry text: 4 000 chars per entry (with marker), 24 000 chars total across all books. */
export function buildLorebookBlocks(books: readonly LorebookLike[]): string {
  const blocks: string[] = [];
  let budget = LOREBOOK_TOTAL_CHAR_CAP;
  for (const book of books) {
    if (budget <= TRUNCATION_MARKER.length) break;
    const entries: string[] = [];
    for (const entry of book.entries ?? []) {
      if (entry.enabled === false) continue;
      const content = typeof entry.content === "string" ? entry.content : "";
      if (!content) continue;
      if (budget <= TRUNCATION_MARKER.length) break;
      const capped = capEntryText(content, Math.min(LOREBOOK_ENTRY_CHAR_CAP, budget));
      budget -= capped.length;
      const name = typeof entry.name === "string" ? entry.name : "";
      entries.push(`<entry name="${escapeXml(name)}">${escapeXml(capped)}</entry>`);
    }
    if (entries.length > 0) {
      const name = typeof book.name === "string" ? book.name : "";
      blocks.push(`<lorebook name="${escapeXml(name)}">`, ...entries, "</lorebook>");
    }
  }
  return blocks.join("\n");
}
