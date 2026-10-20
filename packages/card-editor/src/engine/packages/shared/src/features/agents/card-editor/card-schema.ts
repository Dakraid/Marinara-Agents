/**
 * Card schemas for the Card Editor "transform" task: one tree drives the prompt skeleton for every
 * output format (Markdown, XML, JSON), the JSON Schema sent as provider structured output, soft
 * validation of the model's data, and rendering that data into card field text.
 *
 * The canonical text form is the XML template users already know from the XML card forms:
 * `<!-- hint -->` above an element, attribute values as pipe-separated vocabularies (empty =
 * freeform, a trailing `etc.` = open vocabulary), and three reserved attributes — `max` (length
 * cap), `target` (card field, top-level elements only) and `repeat="true"` (list of entries).
 * No engine imports and no DOM: the module runs in the browser client and under plain Node.
 */

export const CARD_SCHEMA_FIELDS = [
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
export type CardSchemaField = (typeof CARD_SCHEMA_FIELDS)[number];

export type CardOutputFormat = "markdown" | "xml" | "json";

export interface SchemaAttribute {
  name: string;
  /** Allowed values; [] = freeform. */
  values: string[];
  /** True when the vocabulary ends in "etc." — values are suggestions, not an enum. */
  open?: boolean;
}

export interface SchemaNode {
  key: string;
  hint?: string;
  attributes: SchemaAttribute[];
  maxLength?: number;
  /** Card field this top-level node renders into; default description. */
  target?: CardSchemaField;
  repeat?: boolean;
  children: SchemaNode[];
}

export interface CardSchema {
  id: string;
  name: string;
  builtIn?: boolean;
  root: SchemaNode;
}

export interface SchemaTextError {
  line: number;
  message: string;
}

const KEY_PATTERN = /^[A-Za-z_][\w.-]{0,63}$/;
const MAX_NODES = 200;
const MAX_DEPTH = 8;
const NAME_PLACEHOLDER = "character-name";

// ── Built-in schemas (verbatim forms from the Engine's "Process characters" flow) ─────────────

const SIMPLE_TEXT = `<character-name>
    <summary></summary>
    <description></description>
    <personality></personality>
    <backstory></backstory>
    <appearance></appearance>
    <scenario></scenario>
</character-name>`;

const COMPLEX_TEXT = `<!-- all freeform text unless attributed; attributed elements use the values given, only one unless stated otherwise -->
<character-name>
<!-- Name + Short Summary of character -->
<summary name="" aliases="" species="anthro | feral + species" gender="" age="" role=""></summary>
<!-- body, face, height, build, fur, feathers, markings, clothes, etc. -->
<appearance></appearance>
<physiology>
    <!-- What type of genitals, what kind it is, and finally one or descriptors combined as needed describing form, feature, and feel -->
    <genitals sex="penis|vagina|cloaca" kind="human | canine | equine | avian | reptilian | etc." description="normal | slit | knotted | prehensile | ribbed | barbed | innie | outie | etc."></genitals>
    <!-- Hormonal rhythm and any quirks. -->
    <fertility cycle="menstrual | heat-lunar | induced-ovulation | always | never" fertility="fertile | infertile | contraception"></fertility>
    <!-- Milk production or nursing traits. -->
    <lactation capability="self-lactating | induced | none"></lactation>
</physiology>
<!-- voice, mannerisms, dialogue style -->
<style></style>
<!-- personality, character -->
<personality></personality>
<!-- kinks, turn-ons, sexual habits and preferences -->
<sexuality orientation="" role=""></sexuality>
<!-- backstory, significant life events -->
<history></history>
</character-name>`;

function builtIn(id: string, name: string, text: string): CardSchema {
  const parsed = parseSchemaText(text);
  if (!parsed.ok) throw new Error(`built-in schema ${id} is invalid: ${parsed.errors[0]?.message}`);
  return { id, name, builtIn: true, root: parsed.root };
}

export const BUILT_IN_SCHEMAS: readonly CardSchema[] = [
  builtIn("simple", "Simple", SIMPLE_TEXT),
  builtIn("complex", "Complex", COMPLEX_TEXT),
];

// ── Text form ────────────────────────────────────────────────────────────────────────────────

function parseVocabulary(raw: string): { values: string[]; open: boolean } {
  const values = raw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
  const open = values.length > 0 && /^etc\.?$/i.test(values[values.length - 1]!);
  return { values: open ? values.slice(0, -1) : values, open };
}

/** DOM-free template parser. Errors carry 1-based line numbers. */
export function parseSchemaText(
  text: string,
): { ok: true; root: SchemaNode } | { ok: false; errors: SchemaTextError[] } {
  const errors: SchemaTextError[] = [];
  const lineAt = (index: number) => text.slice(0, index).split("\n").length;
  const stack: SchemaNode[] = [];
  const roots: SchemaNode[] = [];
  let pendingHint: string | undefined;
  let rootHint: string | undefined;
  let nodeCount = 0;
  const tokenPattern =
    /<!--([\s\S]*?)-->|<\/\s*([^\s>]+)\s*>|<([^\s/>!]+)((?:\s+[^\s=>]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(text))) {
    const line = lineAt(match.index);
    const [, comment, closing, opening, attrText, selfClosing, textChunk] = match;
    if (comment !== undefined) {
      const hint = comment.trim();
      if (stack.length === 0 && roots.length === 0) rootHint = hint;
      else pendingHint = hint;
      continue;
    }
    if (textChunk !== undefined) {
      const chunk = textChunk.trim();
      if (!chunk) continue;
      const parent = stack[stack.length - 1];
      if (!parent) errors.push({ line, message: "Text outside the root element." });
      else if (!parent.hint) parent.hint = chunk;
      continue;
    }
    if (closing !== undefined) {
      const open = stack.pop();
      if (!open) errors.push({ line, message: `Closing </${closing}> has no opening tag.` });
      else if (open.key !== closing) errors.push({ line, message: `Expected </${open.key}> but found </${closing}>.` });
      continue;
    }
    if (opening === undefined) {
      errors.push({ line, message: "Unreadable markup." });
      continue;
    }
    if (!KEY_PATTERN.test(opening)) errors.push({ line, message: `"${opening}" is not a valid element name.` });
    if (stack.length >= MAX_DEPTH) errors.push({ line, message: `Nesting deeper than ${MAX_DEPTH} levels.` });
    if (++nodeCount > MAX_NODES) {
      errors.push({ line, message: `More than ${MAX_NODES} elements.` });
      break;
    }
    const node: SchemaNode = { key: opening, attributes: [], children: [] };
    if (pendingHint) node.hint = pendingHint;
    pendingHint = undefined;
    for (const attr of (attrText ?? "").matchAll(/([^\s=]+)\s*=\s*"([^"]*)"/g)) {
      const [, name, value] = attr as unknown as [string, string, string];
      if (name === "max") {
        const max = Number(value);
        if (!Number.isInteger(max) || max <= 0)
          errors.push({ line, message: `max on <${opening}> must be a positive whole number.` });
        else node.maxLength = max;
      } else if (name === "target") {
        if (!(CARD_SCHEMA_FIELDS as readonly string[]).includes(value)) {
          errors.push({ line, message: `target="${value}" is not a card field.` });
        } else node.target = value as CardSchemaField;
      } else if (name === "repeat") {
        node.repeat = value === "true";
      } else {
        if (!KEY_PATTERN.test(name)) errors.push({ line, message: `"${name}" is not a valid attribute name.` });
        if (node.attributes.some((existing) => existing.name === name)) {
          errors.push({ line, message: `Attribute "${name}" appears twice on <${opening}>.` });
        }
        const { values, open } = parseVocabulary(value);
        node.attributes.push({ name, values, ...(open ? { open: true } : {}) });
      }
    }
    if (node.attributes.some((attribute) => attribute.name === "text")) {
      errors.push({ line, message: `"text" is reserved for element text; rename the attribute on <${node.key}>.` });
    }
    const parent = stack[stack.length - 1];
    if (parent) {
      if (parent.children.some((sibling) => sibling.key === node.key)) {
        errors.push({ line, message: `<${node.key}> appears twice under <${parent.key}>.` });
      }
      parent.children.push(node);
    } else {
      roots.push(node);
    }
    if (!selfClosing) stack.push(node);
  }
  for (const open of stack) errors.push({ line: lineAt(text.length), message: `<${open.key}> is never closed.` });
  if (roots.length !== 1 && errors.length === 0) {
    errors.push({
      line: 1,
      message: roots.length === 0 ? "The schema needs one root element." : "Only one root element is allowed.",
    });
  }
  const root = roots[0];
  if (root) {
    if (rootHint && !root.hint) root.hint = rootHint;
    for (const child of root.children) checkTargets(child, true, errors);
    if (root.children.length === 0 && errors.length === 0)
      errors.push({ line: 1, message: "The root needs at least one element." });
  }
  if (errors.length > 0 || !root) return { ok: false, errors };
  return { ok: true, root };
}

function checkTargets(node: SchemaNode, topLevel: boolean, errors: SchemaTextError[]): void {
  if (!topLevel && node.target)
    errors.push({ line: 1, message: `target is only allowed on top-level elements (<${node.key}>).` });
  for (const child of node.children) checkTargets(child, false, errors);
}

function attrSource(node: SchemaNode, withMeta: boolean): string {
  const attrs = node.attributes.map(
    (attribute) => ` ${attribute.name}="${[...attribute.values, ...(attribute.open ? ["etc."] : [])].join(" | ")}"`,
  );
  if (withMeta) {
    if (node.maxLength) attrs.push(` max="${node.maxLength}"`);
    if (node.target) attrs.push(` target="${node.target}"`);
    if (node.repeat) attrs.push(` repeat="true"`);
  }
  return attrs.join("");
}

function xmlTemplate(node: SchemaNode, depth: number, withMeta: boolean, rootKey?: string): string {
  const pad = "  ".repeat(depth);
  const key = depth === 0 && rootKey ? rootKey : node.key;
  const hint = node.hint ? `${pad}<!-- ${node.hint} -->\n` : "";
  if (node.children.length === 0) return `${hint}${pad}<${key}${attrSource(node, withMeta)}></${key}>\n`;
  const inner = node.children.map((child) => xmlTemplate(child, depth + 1, withMeta)).join("");
  return `${hint}${pad}<${key}${attrSource(node, withMeta)}>\n${inner}${pad}</${key}>\n`;
}

/** Canonical text form; parseSchemaText(serializeSchemaText(root)) round-trips. */
export function serializeSchemaText(root: SchemaNode): string {
  return xmlTemplate(root, 0, true).trimEnd();
}

// ── Trust boundary ───────────────────────────────────────────────────────────────────────────

/** Validates an untrusted schema (request body, stored document) by round-tripping its text form,
 *  which re-applies every parser rule (names, depth, node cap, targets). */
export function normalizeCardSchema(input: unknown): CardSchema {
  const source =
    input !== null && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;
  if (!source) throw new Error("schema must be an object");
  if (typeof source.id !== "string" || !source.id.trim() || source.id.length > 160)
    throw new Error("schema.id is required");
  if (typeof source.name !== "string" || !source.name.trim() || source.name.length > 120)
    throw new Error("schema.name is required");
  const text = typeof source.text === "string" ? source.text : serializeSchemaText(nodeFromUnknown(source.root, 0));
  if (text.length > 50_000) throw new Error("schema text must be at most 50000 characters");
  const parsed = parseSchemaText(text);
  if (!parsed.ok) throw new Error(`schema is invalid: line ${parsed.errors[0]!.line}: ${parsed.errors[0]!.message}`);
  return {
    id: source.id.trim(),
    name: source.name.trim(),
    ...(source.builtIn === true ? { builtIn: true } : {}),
    root: parsed.root,
  };
}

function nodeFromUnknown(value: unknown, depth: number): SchemaNode {
  const source =
    value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  if (!source || typeof source.key !== "string" || depth > MAX_DEPTH) throw new Error("schema.root is invalid");
  const attributes = Array.isArray(source.attributes) ? source.attributes : [];
  const children = Array.isArray(source.children) ? source.children : [];
  return {
    key: source.key,
    ...(typeof source.hint === "string" && source.hint ? { hint: source.hint.replace(/--/g, "–") } : {}),
    attributes: attributes.map((raw) => {
      const attr = raw as Record<string, unknown>;
      if (typeof attr?.name !== "string") throw new Error("schema attribute is invalid");
      const values = Array.isArray(attr.values) ? attr.values.filter((v): v is string => typeof v === "string") : [];
      return {
        name: attr.name,
        values: values.map((v) => v.replace(/[|"]/g, "")),
        ...(attr.open === true ? { open: true } : {}),
      };
    }),
    ...(typeof source.maxLength === "number" ? { maxLength: source.maxLength } : {}),
    ...(typeof source.target === "string" ? { target: source.target as CardSchemaField } : {}),
    ...(source.repeat === true ? { repeat: true } : {}),
    children: children.map((child) => nodeFromUnknown(child, depth + 1)),
  };
}

// ── Prompt skeletons ─────────────────────────────────────────────────────────────────────────

export function schemaTargets(schema: CardSchema): CardSchemaField[] {
  return [...new Set(schema.root.children.map((child) => child.target ?? "description"))];
}

function lengthRules(node: SchemaNode, out: string[]): string[] {
  if (node.maxLength) out.push(`Text for ${node.key} must not exceed ${node.maxLength} characters.`);
  for (const child of node.children) lengthRules(child, out);
  return out;
}

function jsonSkeleton(node: SchemaNode): unknown {
  const shape: Record<string, unknown> = {};
  for (const attribute of node.attributes) {
    shape[attribute.name] = attribute.values.length
      ? `${attribute.values.join(" | ")}${attribute.open ? " | …" : ""}`
      : "";
  }
  let value: unknown;
  if (node.children.length === 0) {
    if (node.attributes.length === 0) value = node.hint ?? "";
    else value = { ...shape, text: node.hint ?? "" };
  } else {
    for (const child of node.children) shape[child.key] = jsonSkeleton(child);
    value = shape;
  }
  return node.repeat ? [value] : value;
}

function markdownSkeleton(node: SchemaNode, depth: number): string {
  if (depth === 0) {
    const body = node.children.map((child) => markdownSkeleton(child, 1)).join("\n");
    return `# {{character name}}\n${node.hint ? `<!-- ${node.hint} -->\n` : ""}\n${body}`.trimEnd();
  }
  const lines = [
    `${"#".repeat(Math.min(depth + 1, 6))} ${headingFor(node.key)}${node.repeat ? " (one block per entry)" : ""}`,
  ];
  if (node.hint) lines.push(`<!-- ${node.hint} -->`);
  for (const attribute of node.attributes) {
    lines.push(
      `- **${attribute.name}:** ${attribute.values.length ? attribute.values.join(" | ") + (attribute.open ? " | …" : "") : "…"}`,
    );
  }
  if (node.children.length === 0) lines.push("…");
  const children = node.children.map((child) => markdownSkeleton(child, depth + 1));
  return [lines.join("\n"), ...children].join("\n\n");
}

/** The template shown to the model. Structured mode always shows the JSON shape (the model answers
 *  JSON and Marinara renders the chosen format); document mode shows the target format itself. */
export function promptSkeleton(schema: CardSchema, format: CardOutputFormat | "json-data"): string {
  const rules = lengthRules(schema.root, []);
  let body: string;
  if (format === "json-data" || format === "json") body = JSON.stringify(jsonSkeleton(schema.root), null, 2);
  else if (format === "markdown") body = markdownSkeleton(schema.root, 0);
  else body = xmlTemplate(schema.root, 0, false).trimEnd();
  const notes = [
    "Attribute values list the allowed vocabulary; pick one unless stated otherwise. An empty value or a trailing … means freeform.",
    ...(format === "xml" ? [`Replace the <${schema.root.key}> root tag with the character's name in kebab-case.`] : []),
    ...rules,
  ];
  return `${body}\n\n${notes.join("\n")}`;
}

// ── JSON Schema (provider structured output) ────────────────────────────────────────────────

function nodeJsonSchema(node: SchemaNode): Record<string, unknown> {
  const describe = node.hint ? { description: node.hint } : {};
  let schema: Record<string, unknown>;
  if (node.children.length === 0 && node.attributes.length === 0) {
    schema = { type: "string", ...describe, ...(node.maxLength ? { maxLength: node.maxLength } : {}) };
  } else {
    const properties: Record<string, unknown> = {};
    for (const attribute of node.attributes) {
      properties[attribute.name] =
        attribute.values.length && !attribute.open
          ? { type: "string", enum: attribute.values }
          : {
              type: "string",
              ...(attribute.values.length ? { description: `e.g. ${attribute.values.join(", ")}` } : {}),
            };
    }
    if (node.children.length === 0) {
      properties.text = { type: "string", ...(node.maxLength ? { maxLength: node.maxLength } : {}) };
    }
    for (const child of node.children) properties[child.key] = nodeJsonSchema(child);
    schema = {
      type: "object",
      ...describe,
      properties,
      required: Object.keys(properties),
      additionalProperties: false,
    };
  }
  return node.repeat ? { type: "array", items: schema } : schema;
}

/** Strict-compatible envelope: every object closes additionalProperties and requires all keys.
 *  Structured mode shapes `fields` like the schema; document mode maps each target field to text. */
export function transformResponseJsonSchema(
  schema: CardSchema,
  outputMode: "structured" | "document",
): Record<string, unknown> {
  const targets = schemaTargets(schema);
  const fields =
    outputMode === "document"
      ? {
          type: "object",
          properties: Object.fromEntries(targets.map((target) => [target, { type: "string" }])),
          required: targets,
          additionalProperties: false,
        }
      : nodeJsonSchema({ ...schema.root, repeat: false });
  return {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sourceId: { type: "string" },
            characters: {
              type: "array",
              items: {
                type: "object",
                properties: { name: { type: "string" }, fields },
                required: ["name", "fields"],
                additionalProperties: false,
              },
            },
            splitReason: { type: ["string", "null"] },
          },
          required: ["sourceId", "characters", "splitReason"],
          additionalProperties: false,
        },
      },
    },
    required: ["results"],
    additionalProperties: false,
  };
}

// ── Validation ───────────────────────────────────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nodeText(node: SchemaNode, value: unknown): string {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  return record && typeof record.text === "string" ? record.text : "";
}

/** Soft issues, never failures: missing elements, over-length text, values outside a closed vocabulary. */
export function validateSchemaData(schema: CardSchema, data: unknown): string[] {
  const issues: string[] = [];
  const visit = (node: SchemaNode, value: unknown, path: string) => {
    if (value === undefined || value === null) {
      issues.push(`${path}: missing`);
      return;
    }
    if (node.repeat) {
      if (!Array.isArray(value)) issues.push(`${path}: expected a list`);
      else value.forEach((entry, index) => visit({ ...node, repeat: false }, entry, `${path}[${index}]`));
      return;
    }
    if (node.children.length === 0 && node.attributes.length === 0) {
      if (typeof value !== "string") issues.push(`${path}: expected text`);
      else if (node.maxLength && value.length > node.maxLength)
        issues.push(`${path}: ${value.length} of ${node.maxLength} characters`);
      return;
    }
    const record = asRecord(value);
    if (!record) {
      issues.push(`${path}: expected an object`);
      return;
    }
    for (const attribute of node.attributes) {
      const attrValue = record[attribute.name];
      if (typeof attrValue !== "string") issues.push(`${path}@${attribute.name}: missing`);
      else if (attribute.values.length && !attribute.open && attrValue && !attribute.values.includes(attrValue)) {
        issues.push(`${path}@${attribute.name}: "${attrValue}" is not one of ${attribute.values.join(", ")}`);
      }
    }
    if (node.children.length === 0) {
      const text = nodeText(node, value);
      if (node.maxLength && text.length > node.maxLength)
        issues.push(`${path}: ${text.length} of ${node.maxLength} characters`);
    }
    for (const child of node.children) visit(child, record[child.key], `${path}.${child.key}`);
  };
  visit({ ...schema.root, repeat: false }, data, schema.root.key);
  return issues;
}

// ── Rendering (structured data → card field text) ───────────────────────────────────────────

export function kebabName(name: string): string {
  const kebab = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return /^[a-z_]/.test(kebab) ? kebab : `character${kebab ? `-${kebab}` : ""}`;
}

function headingFor(key: string): string {
  const words = key.replace(/[-_.]+/g, " ").trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : key;
}

const attrValue = (value: unknown) => String(value ?? "").replace(/"/g, "'");

function renderXml(node: SchemaNode, value: unknown, depth: number, tag: string): string {
  if (node.repeat && Array.isArray(value)) {
    return value.map((entry) => renderXml({ ...node, repeat: false }, entry, depth, tag)).join("");
  }
  const pad = "  ".repeat(depth);
  const record = asRecord(value);
  const attrs = node.attributes
    .map((attribute) => ` ${attribute.name}="${attrValue(record?.[attribute.name])}"`)
    .join("");
  if (node.children.length === 0) return `${pad}<${tag}${attrs}>${nodeText(node, value).trim()}</${tag}>\n`;
  const inner = node.children.map((child) => renderXml(child, record?.[child.key], depth + 1, child.key)).join("");
  return `${pad}<${tag}${attrs}>\n${inner}${pad}</${tag}>\n`;
}

function renderMarkdown(node: SchemaNode, value: unknown, depth: number): string {
  if (node.repeat && Array.isArray(value)) {
    return value.map((entry) => renderMarkdown({ ...node, repeat: false }, entry, depth)).join("\n\n");
  }
  const record = asRecord(value);
  const lines = [`${"#".repeat(Math.min(depth + 1, 6))} ${headingFor(node.key)}`];
  const facts = node.attributes
    .map((attribute) => [attribute.name, String(record?.[attribute.name] ?? "").trim()] as const)
    .filter(([, text]) => text);
  for (const [name, text] of facts) lines.push(`- **${headingFor(name)}:** ${text}`);
  if (node.children.length === 0) {
    const text = nodeText(node, value).trim();
    if (text) lines.push(facts.length ? `\n${text}` : text);
  }
  const children = node.children.map((child) => renderMarkdown(child, record?.[child.key], depth + 1)).filter(Boolean);
  return [lines.join("\n"), ...children].join("\n\n");
}

/**
 * Renders one character's structured data into card field text, grouped by each top-level
 * node's target. A target holding a single plain-text leaf (e.g. Simple's personality →
 * personality) receives that text as-is; every other group renders as a document in `format`.
 */
export function renderCharacterFields(
  schema: CardSchema,
  name: string,
  data: unknown,
  format: CardOutputFormat,
): Record<string, string> {
  const record = asRecord(data) ?? {};
  const groups = new Map<CardSchemaField, SchemaNode[]>();
  for (const child of schema.root.children) {
    const target = child.target ?? "description";
    groups.set(target, [...(groups.get(target) ?? []), child]);
  }
  const fields: Record<string, string> = {};
  for (const [target, nodes] of groups) {
    const only = nodes.length === 1 ? nodes[0]! : null;
    if (
      target !== "description" &&
      only &&
      !only.repeat &&
      only.children.length === 0 &&
      only.attributes.length === 0
    ) {
      fields[target] = nodeText(only, record[only.key]).trim();
      continue;
    }
    const groupRoot: SchemaNode = { ...schema.root, repeat: false, children: nodes };
    const subset = Object.fromEntries(nodes.map((node) => [node.key, record[node.key]]));
    for (const attribute of schema.root.attributes) subset[attribute.name] = record[attribute.name];
    if (format === "json") {
      fields[target] = JSON.stringify({ name, ...subset }, null, 2);
    } else if (format === "markdown") {
      const body = nodes.map((node) => renderMarkdown(node, record[node.key], 1)).filter(Boolean);
      fields[target] = [`# ${name}`, ...body].join("\n\n");
    } else {
      const rootTag = schema.root.key === NAME_PLACEHOLDER ? kebabName(name) : schema.root.key;
      fields[target] = renderXml(groupRoot, subset, 0, rootTag).trimEnd();
    }
  }
  return fields;
}

/** Several characters stored on ONE card ("keep on one card", or a split the user turned down):
 *  each field joins the per-character documents; JSON fields become one array. */
export function joinCharacterFields(
  perCharacter: readonly Record<string, string>[],
  format: CardOutputFormat,
): Record<string, string> {
  if (perCharacter.length === 1) return { ...perCharacter[0] };
  const fields: Record<string, string> = {};
  const keys = [...new Set(perCharacter.flatMap((entry) => Object.keys(entry)))];
  for (const key of keys) {
    const parts = perCharacter.map((entry) => entry[key] ?? "").filter((text) => text.trim());
    if (format === "json" && parts.every((part) => /^\s*[{[]/.test(part))) {
      try {
        fields[key] = JSON.stringify(
          parts.map((part) => JSON.parse(part)),
          null,
          2,
        );
        continue;
      } catch {
        // Hand-written JSON in document mode may not parse; fall through to plain joining.
      }
    }
    fields[key] = parts.join("\n\n");
  }
  return fields;
}
