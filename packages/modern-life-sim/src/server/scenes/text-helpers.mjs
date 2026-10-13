// Player appearance line, persona header and sentence-aware text splitting/truncation
function describePlayerAppearance(player = {}, outfit = "") {
  let appearance = String(player?.appearance ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return [player?.name ?? "", appearance ? `Looks: ${appearance}` : "", outfit ? `Wearing: ${outfit}.` : ""]
    .filter(Boolean)
    .join(" \u2014 ");
}
var PLAYER_PERSONA_HEADER =
  "THE PLAYER, as anyone can see them (of their life, past and secrets they know only what their memories and what they know of the player say below; nothing else)";
function splitTextIntoChunks(text, maxChars) {
  let normalized = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= maxChars) {
    return normalized ? [normalized] : [];
  }
  let sentences = [],
    cursor = 0;
  for (let match of normalized.matchAll(/[.!?…]+["'”’»)\]]*(?:\s+|$)|[。！？]+["'”’»)\]」』]*\s*/g)) {
    let end = match.index + match[0].length;
    if (end > cursor) {
      sentences.push(normalized.slice(cursor, end));
    }
    cursor = end;
  }
  if (cursor < normalized.length) {
    sentences.push(normalized.slice(cursor));
  }
  let chunks = [],
    current = "",
    appendPiece = (piece) => {
      for (
        current
          ? (current + piece).length <= maxChars
            ? (current += piece)
            : (chunks.push(current.trim()), (current = piece))
          : (current = piece);
        current.length > maxChars;
      ) {
        let spaceIndex = current.lastIndexOf(" ", maxChars),
          cutAt = spaceIndex > maxChars / 3 ? spaceIndex : maxChars;
        chunks.push(current.slice(0, cutAt).trim());
        current = current.slice(cutAt).trimStart();
      }
    };
  for (let sentence of sentences) {
    appendPiece(sentence);
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }
  return chunks.filter(Boolean);
}
function truncateAtSentence(text, maxChars) {
  let normalized = String(text ?? "")
    .trim()
    .replace(/^["“”«»'‘’]+|["“”«»'‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  let head = normalized.slice(0, maxChars),
    sentenceEnd = Math.max(
      head.lastIndexOf(". "),
      head.lastIndexOf("! "),
      head.lastIndexOf("? "),
      head.lastIndexOf("\u2026 "),
      head.lastIndexOf("\u3002"),
    );
  if (sentenceEnd > maxChars / 3) {
    return head.slice(0, sentenceEnd + 1).trim();
  }
  let spaceIndex = head.slice(0, maxChars - 1).lastIndexOf(" ");
  return `${(spaceIndex > maxChars / 3 ? head.slice(0, spaceIndex) : head.slice(0, maxChars - 1)).trimEnd().replace(/[,;:—–-]+$/, "")}\u2026`;
}

export { PLAYER_PERSONA_HEADER, describePlayerAppearance, splitTextIntoChunks, truncateAtSentence };
