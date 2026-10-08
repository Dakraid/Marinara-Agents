/**
 * Card-prompt text utilities shared by the Card Editor package (server services today, client
 * staleness checks later). `normalizeCardPromptText` mirrors the engine's cardPromptText
 * (strip `{{// …}}` macro comments, then trim) so dispatch snapshots compare equal to the exact
 * text the model saw; `escapeXml` is the engine's five-entity set, `&` first.
 * No engine imports — the package boundary (privateEngineImports: []) forbids them.
 */
export function normalizeCardPromptText(raw: unknown): string {
  return typeof raw === "string" ? stripMacroComments(raw).trim() : "";
}

function stripMacroComments(template: string): string {
  let result = "";
  let cursor = 0;
  while (cursor < template.length) {
    const start = template.indexOf("{{//", cursor);
    if (start < 0) break;
    const firstClose = template.indexOf("}}", start + 4);
    if (firstClose < 0) break;
    result += template.slice(cursor, start);
    cursor = firstClose + 2;
  }
  return result + template.slice(cursor);
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Replaces the entity forms models commonly emit instead of the real character — &lt; &gt; &quot;
 *  &apos; &amp;, plus decimal/hex numeric references — so applied and duplicated cards never land
 *  with escaped text. &amp; decodes LAST so "&amp;lt;" becomes "&lt;" (the literal text), never "<". */
const NUMERIC_ENTITY_PATTERN = /&#(?:(x|X)([0-9a-fA-F]+)|([0-9]+));/g;
const NAMED_ENTITIES: ReadonlyArray<readonly [RegExp, string]> = [
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&quot;/g, '"'],
  [/&apos;/g, "'"],
  [/&nbsp;/g, "\u00a0"],
];

export function decodeXmlEntities(value: string): string {
  const numeric = value.replace(NUMERIC_ENTITY_PATTERN, (match, hexFlag: string, hex: string, decimal: string) => {
    const codePoint = hexFlag ? Number.parseInt(hex, 16) : Number(decimal);
    if (!Number.isInteger(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) return match;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return match; // lone surrogates and other invalid code points stay verbatim
    }
  });
  let out = numeric;
  for (const [pattern, replacement] of NAMED_ENTITIES) out = out.replace(pattern, replacement);
  return out.replace(/&amp;/g, "&");
}
