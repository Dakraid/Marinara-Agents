/**
 * Prompt presets and assembly for Card Editor bulk runs (ARCH §4, SPEC F3.2/F3.3/F3.7).
 * One preset template per dispatch plus directive blocks appended in a fixed order:
 * base template → global instruction (system) → per-card <user_note> (user) → rebalance (user).
 *
 * A call is batched iff it carries more than one target; the response contract switches with it
 * (keyed JSON object vs single {"updates":…}), and parse.ts must be used to match. The runner
 * derives both from targets.length, keeping prompt and parser in lockstep.
 */
import { SchemaError } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { escapeXml } from "../../../../shared/src/features/agents/card-editor/text.ts";
import { buildCharacterBlock, buildLorebookBlocks, type CharacterLike, type LorebookLike } from "./context.ts";

export interface PromptPreset {
  id: "standard" | "strict" | "rebalance";
  label: string;
  template: string;
}

/** SPEC F3.7 field-splitting directive. Baked into the rebalance preset and appended to the user
 *  message when the rebalance toggle is on (empty newText is valid only under this directive). */
const REBALANCE_DIRECTIVE =
  "Rebalance field content across each card. Description = general identity and role. Personality = concise traits, " +
  "temperament, and behavior patterns. Backstory = history, origin, and formative events. Appearance = physical " +
  "detail. Scenario = default setting. Move content between fields to match these meanings while preserving every " +
  "fact. A source field may legitimately be emptied; an empty newText is allowed only under this directive.";

const EDITING_CONTRACT = [
  "Editing contract:",
  "- Editable fields: description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, " +
    "post_history_instructions, backstory, appearance. Never edit the card's name; never propose any other field.",
  '- Each update is {"field","oldText","newText","reason"}: field is one of the editable fields; oldText is the ' +
    'field\'s exact current text copied verbatim from the provided character context ("" when the field is empty); ' +
    "newText is the complete replacement text for the whole field, never a fragment, diff, or patch; reason is one " +
    "short sentence explaining the change.",
  "- Preserve {{char}} and {{user}} macros exactly; never resolve or rename them.",
  "- Propose only changes that serve the instruction. False positives are worse than missed changes.",
].join("\n");

const STANDARD_INTRO =
  "You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving " +
  "each card's voice, facts, and intent.";

const STRICT_ADDENDUM =
  "Work surgically: make the smallest whole-field rewrite that satisfies the instruction, change as few fields " +
  "as possible, and leave every untouched field out of the response.";

export const PRESETS: readonly PromptPreset[] = [
  { id: "standard", label: "Standard rewrite", template: `${STANDARD_INTRO}\n\n${EDITING_CONTRACT}` },
  {
    id: "strict",
    label: "Strict surgical",
    template: `${STANDARD_INTRO}\n\n${EDITING_CONTRACT}\n\n${STRICT_ADDENDUM}`,
  },
  {
    id: "rebalance",
    label: "Field rebalancing",
    template: `${STANDARD_INTRO}\n\n${EDITING_CONTRACT}\n\n${REBALANCE_DIRECTIVE}`,
  },
];

const BATCHED_RESPONSE_CONTRACT =
  "Response format: return a strict JSON object keyed by each exact character id listed in <legend>, e.g. " +
  '{"<characterId>":{"updates":[{"field":"description","oldText":"…","newText":"…","reason":"…"}]}}. Copy the id ' +
  'strings exactly as given. Give a character with no changes {"updates":[]} or omit it. Output JSON only — no ' +
  "prose, no markdown fences.";

const SINGLE_RESPONSE_CONTRACT =
  'Response format: return a strict JSON object {"updates":[{"field":"description","oldText":"…","newText":"…",' +
  '"reason":"…"}]} for the provided character. Return {"updates":[]} when nothing should change. Output JSON ' +
  "only — no prose, no markdown fences.";

export interface PromptTarget {
  /** Opaque token used in the prompt, the legend, and the response JSON keys. */
  characterId: string;
  card: CharacterLike;
  userNote?: string;
  /** undefined = inherit the session-level behavior character; null = none for this card. */
  behaviorCharacter?: CharacterLike | null;
}

export interface AssemblePromptInput {
  preset: "standard" | "strict" | "rebalance" | "custom";
  customTemplate?: string;
  globalInstruction: string;
  targets: readonly PromptTarget[];
  lorebooks: readonly LorebookLike[];
  behaviorCharacter?: CharacterLike | null;
  rebalance: boolean;
}

function resolveTemplate(input: AssemblePromptInput): string {
  if (input.preset === "custom") {
    const custom = typeof input.customTemplate === "string" ? input.customTemplate.trim() : "";
    if (!custom) throw new SchemaError('presetId "custom" requires a non-empty customTemplate');
    return custom;
  }
  const preset = PRESETS.find((entry) => entry.id === input.preset);
  if (!preset) throw new SchemaError(`unknown prompt preset: ${input.preset}`);
  return preset.template;
}

export function assemblePrompt(input: AssemblePromptInput): { system: string; user: string } {
  const batched = input.targets.length > 1;
  const systemParts = [resolveTemplate(input), batched ? BATCHED_RESPONSE_CONTRACT : SINGLE_RESPONSE_CONTRACT];
  const instruction = input.globalInstruction.trim();
  if (instruction) systemParts.push(`<global_instruction>\n${escapeXml(instruction)}\n</global_instruction>`);
  const lorebooks = buildLorebookBlocks(input.lorebooks);
  if (lorebooks) systemParts.push(lorebooks);

  const characterBlocks = input.targets.map((target) =>
    buildCharacterBlock(target.card, {
      id: target.characterId,
      ...(target.userNote === undefined ? {} : { note: target.userNote }),
      behaviorCharacter:
        (target.behaviorCharacter === undefined ? input.behaviorCharacter : target.behaviorCharacter) ?? null,
    }),
  );

  const userParts: string[] = [];
  if (batched) {
    const legend = input.targets.map(
      (target) =>
        `<character_ref id="${escapeXml(target.characterId)}" name="${escapeXml(
          typeof target.card.name === "string" ? target.card.name : "",
        )}" />`,
    );
    userParts.push(["<bulk_edit>", ...characterBlocks, "<legend>", ...legend, "</legend>", "</bulk_edit>"].join("\n"));
  } else {
    userParts.push(...characterBlocks);
  }
  if (input.rebalance) userParts.push(`<rebalance_fields>\n${REBALANCE_DIRECTIVE}\n</rebalance_fields>`);

  return { system: systemParts.join("\n\n"), user: userParts.join("\n\n") };
}
