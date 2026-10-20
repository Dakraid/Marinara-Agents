/**
 * Transform task for Card Editor bulk runs (presetId "transform"): rebuild each card into a
 * schema, with one source allowed to come back as several characters.
 *
 * Every call — single or batched — uses one envelope keyed by the opaque item id:
 *   {"results":[{"sourceId","characters":[{"name","fields"}],"splitReason"}]}
 * Item ids (not character ids) key the envelope because split children and phase 2 items share
 * their source card's character id. In structured mode `fields` is schema-shaped data that
 * Marinara renders into the chosen format; in document mode (the legacy method) the model writes
 * each target field's document text itself.
 */
import {
  joinCharacterFields,
  promptSkeleton,
  renderCharacterFields,
  schemaTargets,
  transformResponseJsonSchema,
  validateSchemaData,
  type CardOutputFormat,
} from "../../../../shared/src/features/agents/card-editor/card-schema.ts";
import type {
  CardFieldUpdate,
  CharacterResult,
  SessionItem,
  TransformConfig,
  TransformPhaseConfig,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { escapeXml } from "../../../../shared/src/features/agents/card-editor/text.ts";
import { buildCharacterBlock, buildLorebookBlocks, type CharacterLike, type LorebookLike } from "./context.ts";
import { extractJsonObject } from "./parse.ts";

const FORMAT_LABEL: Record<CardOutputFormat, string> = { markdown: "Markdown", xml: "XML", json: "JSON" };
const MAX_CHARACTERS_PER_SOURCE = 12;
const MAX_FIELD_CHARS = 100_000;

export const SINGLE_CARD_RULE =
  "Treat this card as exactly ONE character card. If it mentions several people, keep them all within a single characters entry.";

export interface TransformTarget {
  /** Opaque item id: the prompt id attribute and the envelope sourceId. */
  sourceId: string;
  card: CharacterLike;
  userNote?: string;
  behaviorCharacter?: CharacterLike | null;
  forceSingle?: boolean;
  /** Phase 2: the previous phase's result text; replaces the card fields in the prompt. */
  previousOutput?: string;
}

export interface AssembleTransformInput {
  transform: TransformConfig;
  phase: 1 | 2;
  globalInstruction: string;
  targets: readonly TransformTarget[];
  lorebooks: readonly LorebookLike[];
  behaviorCharacter?: CharacterLike | null;
}

/** May a result with several characters become a split (vs. staying on one card)? */
export function splitsAllowed(transform: TransformConfig, phase: 1 | 2): boolean {
  if (transform.multiCharacter !== "split") return false;
  return phase === 1 || transform.phase2?.allowSplits === true;
}

export function phaseSettings(transform: TransformConfig, phase: 1 | 2): TransformPhaseConfig {
  return phase === 2 && transform.phase2?.override ? transform.phase2.override : transform;
}

function multiCharacterRule(transform: TransformConfig, phase: 1 | 2): string {
  if (splitsAllowed(transform, phase)) {
    return (
      "- If a card clearly describes several distinct characters (separate names, roles, and histories), return one " +
      "characters entry per character and give a one-sentence splitReason. Otherwise return exactly one entry and set " +
      "splitReason to null. Never split one character into facets and never invent characters the card does not describe."
    );
  }
  if (transform.multiCharacter === "merge" && phase === 1) {
    return (
      "- If a card describes several distinct characters, return one characters entry per character; they stay " +
      "together on the same card. Otherwise return exactly one entry. Always set splitReason to null."
    );
  }
  return "- Return exactly one characters entry per card and set splitReason to null.";
}

function fieldsRule(transform: TransformConfig, settings: TransformPhaseConfig): string {
  if (transform.outputMode === "structured") {
    return '- "fields" is a JSON object shaped exactly like <target_schema>: fill every key and replace each hint with content (an empty string when the card gives nothing for it).';
  }
  const targets = schemaTargets(settings.schema);
  const mapping = targets
    .map((target) => {
      const keys = settings.schema.root.children
        .filter((child) => (child.target ?? "description") === target)
        .map((child) => child.key);
      return `${target} ← ${keys.join(", ")}`;
    })
    .join("; ");
  return (
    `- "fields" maps each card field to its complete ${FORMAT_LABEL[settings.format]} document following <target_schema>: ` +
    `${mapping}. Each value is the whole document for that field, never a fragment or a markdown fence.`
  );
}

export function assembleTransformPrompt(input: AssembleTransformInput): { system: string; user: string } {
  const { transform, phase } = input;
  const settings = phaseSettings(transform, phase);
  const intro =
    phase === 2
      ? "You are the Card Editor. Refine each provided character from its previous transformation result in <previous_output> following the instruction, and return it in the target schema below."
      : "You are the Card Editor. Transform each provided character card into the target schema below, drawing content from ALL of the card's fields.";
  const contract = [
    "Transformation contract:",
    "- Preserve every relevant fact, instruction, example, greeting, and note. Do not invent facts the source does not support unless the instruction asks for new material.",
    "- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.",
    '- "name" is the character\'s own name as the source gives it.',
    multiCharacterRule(transform, phase),
    fieldsRule(transform, settings),
  ].join("\n");
  const response =
    'Response format: return a strict JSON object {"results":[{"sourceId":"<id>","characters":[{"name":"…","fields":{…}}],"splitReason":null}]} ' +
    'with exactly one results entry per provided card, using the exact id from its <character id="…"> tag. Output JSON only — no prose, no markdown fences.';
  const skeletonFormat = transform.outputMode === "structured" ? "json-data" : settings.format;
  const systemParts = [
    intro,
    contract,
    response,
    `<target_schema format="${transform.outputMode === "structured" ? "json" : settings.format}">\n${promptSkeleton(settings.schema, skeletonFormat)}\n</target_schema>`,
  ];
  const instruction = (phase === 2 ? (transform.phase2?.instruction ?? "") : input.globalInstruction).trim();
  if (instruction) systemParts.push(`<global_instruction>\n${escapeXml(instruction)}\n</global_instruction>`);
  const lorebooks = buildLorebookBlocks(input.lorebooks);
  if (lorebooks) systemParts.push(lorebooks);

  const blocks = input.targets.map((target) => {
    const behaviorCharacter =
      (target.behaviorCharacter === undefined ? input.behaviorCharacter : target.behaviorCharacter) ?? null;
    let block: string;
    if (target.previousOutput !== undefined) {
      const name = typeof target.card.name === "string" ? target.card.name : "";
      const lines = [
        `<character id="${escapeXml(target.sourceId)}" name="${escapeXml(name)}">`,
        // Raw on purpose: escaping would hand the model entity soup instead of its own document.
        `<previous_output format="${phaseSettings(transform, 1).format}">\n${target.previousOutput}\n</previous_output>`,
      ];
      const note = target.userNote?.trim();
      if (note) lines.push(`<user_note>${escapeXml(note)}</user_note>`);
      lines.push("</character>");
      block = lines.join("\n");
    } else {
      block = buildCharacterBlock(target.card, {
        id: target.sourceId,
        ...(target.userNote === undefined ? {} : { note: target.userNote }),
        behaviorCharacter,
      });
    }
    return target.forceSingle
      ? `${block}\n<single_card_rule for="${escapeXml(target.sourceId)}">${SINGLE_CARD_RULE}</single_card_rule>`
      : block;
  });
  const user = input.targets.length > 1 ? ["<cards>", ...blocks, "</cards>"].join("\n") : blocks.join("\n");
  return { system: systemParts.join("\n\n"), user };
}

export function transformStructuredRequest(transform: TransformConfig, phase: 1 | 2) {
  if (!transform.structuredOutput) return undefined;
  return {
    name: "card_editor_results",
    schema: transformResponseJsonSchema(phaseSettings(transform, phase).schema, transform.outputMode),
    strict: true,
  };
}

// ── Parsing ──────────────────────────────────────────────────────────────────────────────────

export interface TransformSourceResult {
  characters: CharacterResult[];
  splitReason?: string;
}

export interface TransformParseOutcome {
  ok: boolean;
  /** Keyed by sourceId; absent = the model skipped that card (re-run individually). */
  results: Map<string, TransformSourceResult>;
  dropped: string[];
  parseError?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function capField(text: string): string {
  return text.length <= MAX_FIELD_CHARS ? text : text.slice(0, MAX_FIELD_CHARS);
}

function parseCharacter(
  raw: unknown,
  fallbackName: string,
  transform: TransformConfig,
  settings: TransformPhaseConfig,
): CharacterResult | string {
  const record = asRecord(raw);
  if (!record) return "character entry must be an object";
  const name = typeof record.name === "string" && record.name.trim() ? record.name.trim().slice(0, 300) : fallbackName;
  const fields = asRecord(record.fields);
  if (!fields) return "character entry needs a fields object";
  if (transform.outputMode === "document") {
    const targets = new Set<string>(schemaTargets(settings.schema));
    const texts: Record<string, string> = {};
    for (const [field, value] of Object.entries(fields)) {
      if (targets.has(field) && typeof value === "string" && value.trim()) texts[field] = capField(value.trim());
    }
    if (Object.keys(texts).length === 0) return "document fields were empty";
    return { name, fields: texts };
  }
  const rendered = renderCharacterFields(settings.schema, name, fields, settings.format);
  const issues = validateSchemaData(settings.schema, fields);
  return {
    name,
    fields: Object.fromEntries(Object.entries(rendered).map(([field, text]) => [field, capField(text)])),
    data: fields,
    ...(issues.length > 0 ? { issues } : {}),
  };
}

export function parseTransformResponse(
  raw: string,
  targets: readonly { sourceId: string; name: string }[],
  transform: TransformConfig,
  phase: 1 | 2,
): TransformParseOutcome {
  const settings = phaseSettings(transform, phase);
  const results = new Map<string, TransformSourceResult>();
  const dropped: string[] = [];
  const parsed = extractJsonObject(raw);
  if (!parsed) return { ok: false, results, dropped, parseError: "response did not contain a parseable JSON object" };
  let entries: unknown[];
  if (Array.isArray(parsed.results)) entries = parsed.results;
  // A single-card call answered without the envelope is still unambiguous.
  else if (targets.length === 1 && Array.isArray(parsed.characters))
    entries = [{ ...parsed, sourceId: targets[0]!.sourceId }];
  else return { ok: false, results, dropped, parseError: 'response did not contain a "results" array' };

  const byId = new Map(targets.map((target) => [target.sourceId, target]));
  for (const entry of entries) {
    const record = asRecord(entry);
    const sourceId =
      typeof record?.sourceId === "string" ? record.sourceId : targets.length === 1 ? targets[0]!.sourceId : "";
    const target = byId.get(sourceId);
    if (!record || !target) {
      dropped.push(`unknown sourceId ${String(record?.sourceId ?? "")}`);
      continue;
    }
    if (results.has(sourceId)) {
      dropped.push(`duplicate result for ${sourceId}`);
      continue;
    }
    const rawCharacters = Array.isArray(record.characters) ? record.characters.slice(0, MAX_CHARACTERS_PER_SOURCE) : [];
    const characters: CharacterResult[] = [];
    for (const rawCharacter of rawCharacters) {
      const character = parseCharacter(rawCharacter, target.name, transform, settings);
      if (typeof character === "string") dropped.push(`${sourceId}: ${character}`);
      else characters.push(character);
    }
    if (characters.length === 0) {
      dropped.push(`${sourceId}: no usable characters`);
      continue;
    }
    const splitReason =
      typeof record.splitReason === "string" && record.splitReason.trim()
        ? record.splitReason.trim().slice(0, 1_000)
        : undefined;
    results.set(sourceId, { characters, ...(splitReason ? { splitReason } : {}) });
  }
  if (results.size === 0) return { ok: false, results, dropped, parseError: "response carried no usable results" };
  return { ok: true, results, dropped };
}

// ── Settling results ─────────────────────────────────────────────────────────────────────────

const FIELD_TEXT_FIELDS = [
  "description",
  "personality",
  "scenario",
  "first_mes",
  "mes_example",
  "creator_notes",
  "system_prompt",
  "post_history_instructions",
  "backstory",
  "appearance",
] as const;

/**
 * Card writes for a settled transform item. In-place results touch only the schema's target
 * fields. A split child becomes a NEW card (duplicated from the source), so every other text
 * field that still carries the source's group content is cleared on the copy — the original card
 * keeps everything.
 */
export function transformUpdates(
  item: Pick<SessionItem, "snapshots" | "lineage">,
  characters: readonly CharacterResult[],
  settings: TransformPhaseConfig,
  label: string,
): CardFieldUpdate[] {
  const fields = joinCharacterFields(
    characters.map((character) => character.fields),
    settings.format,
  );
  const reason = `${label}: ${settings.schema.name} schema as ${FORMAT_LABEL[settings.format]}`;
  const updates: CardFieldUpdate[] = Object.entries(fields)
    .filter(([field, newText]) => newText !== (item.snapshots[field] ?? ""))
    .map(([field, newText]) => ({ field, oldText: item.snapshots[field] ?? "", newText, reason }));
  if (item.lineage?.splitGroupId) {
    for (const field of FIELD_TEXT_FIELDS) {
      if (fields[field] === undefined && (item.snapshots[field] ?? "") !== "") {
        updates.push({
          field,
          oldText: item.snapshots[field]!,
          newText: "",
          reason: "Cleared on the split copy; the source card keeps it.",
        });
      }
    }
  }
  return updates;
}

/** Phase 2 input text: the phase 1 field documents, labelled when there is more than one. */
export function previousOutputText(characters: readonly CharacterResult[], format: CardOutputFormat): string {
  const fields = joinCharacterFields(
    characters.map((character) => character.fields),
    format,
  );
  const entries = Object.entries(fields);
  if (entries.length === 1) return entries[0]![1];
  return entries.map(([field, text]) => `[${field}]\n${text}`).join("\n\n");
}
