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
