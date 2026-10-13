var WORLD_LORE_MAX = 12e3;
var enabledEntries = (book) =>
  (Array.isArray(book?.entries) ? book.entries : []).filter(
    (entry) => entry && entry.enabled !== false && String(entry.content ?? "").trim(),
  );
var bookName = (book) => String(book?.data?.name ?? "").trim() || "Untitled lorebook";
function worldLoreFromBook(book, max = WORLD_LORE_MAX) {
  if (!book?.id) {
    return null;
  }
  let text = "";
  for (let entry of enabledEntries(book)) {
    let block = [String(entry.name ?? "").trim(), String(entry.content).trim()].filter(Boolean).join(`
`),
      next = text
        ? `${text}

${block}`
        : block;
    if (next.length > max) {
      // Whole entries only; a single oversized first entry is cut rather than dropping the book.
      text ||= block.slice(0, max);
      break;
    }
    text = next;
  }
  return text
    ? {
        lorebookId: book.id,
        name: bookName(book),
        text: text,
      }
    : null;
}
var hasLorebooks = (runtime) => typeof runtime?.resources?.listLorebooks == "function";
async function listWorldLorebooks(runtime) {
  if (!hasLorebooks(runtime)) {
    return null;
  }
  let books = await runtime.resources.listLorebooks().catch(() => []);
  return books
    .map((book) => ({
      id: book.id,
      name: bookName(book),
      entries: enabledEntries(book).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
async function loadWorldLore(runtime, lorebookId) {
  let id = String(lorebookId ?? "").trim();
  if (!id || !hasLorebooks(runtime)) {
    return null;
  }
  let [book] = await runtime.resources.listLorebooks([id]).catch(() => []);
  return worldLoreFromBook(book);
}
var worldLoreNote = (lore) =>
  lore?.text
    ? `WORLD LORE (from the player's lorebook ${lore.name}):
${lore.text}`
    : "";
export { WORLD_LORE_MAX, listWorldLorebooks, loadWorldLore, worldLoreFromBook, worldLoreNote };
