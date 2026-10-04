/**
 * Dependency-free line diff for the verdict queue's collapsed-context previews (DESIGN §3).
 * LCS over lines with common prefix/suffix trimming; fields too large for a full matrix fall
 * back to a whole-block replace (truthful, just coarser). No package deps allowed.
 */

export type DiffLineKind = "same" | "add" | "del";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

export interface DiffHunk {
  /** Unchanged lines collapsed before this hunk (rendered as "⋯ N unchanged lines ⋯"). */
  hiddenBefore: number;
  lines: DiffLine[];
}

/** Beyond this many cells the DP matrix is not worth its memory; the middle becomes one block. */
const MATRIX_CELL_CAP = 1_000_000;

function toLines(text: string): string[] {
  return text.split("\n");
}

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = toLines(oldText);
  const b = toLines(newText);
  if (oldText === newText) return a.map((text) => ({ kind: "same" as const, text }));

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);

  const result: DiffLine[] = a.slice(0, start).map((text) => ({ kind: "same" as const, text }));
  if (midA.length * midB.length <= MATRIX_CELL_CAP) {
    // dp[i][j] = LCS length of midA[i..] and midB[j..], filled bottom-up.
    const dp: Uint32Array[] = Array.from({ length: midA.length + 1 }, () => new Uint32Array(midB.length + 1));
    for (let i = midA.length - 1; i >= 0; i -= 1) {
      for (let j = midB.length - 1; j >= 0; j -= 1) {
        dp[i]![j] = midA[i] === midB[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
      }
    }
    let i = 0;
    let j = 0;
    while (i < midA.length && j < midB.length) {
      if (midA[i] === midB[j]) {
        result.push({ kind: "same", text: midA[i]! });
        i += 1;
        j += 1;
      } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
        result.push({ kind: "del", text: midA[i]! });
        i += 1;
      } else {
        result.push({ kind: "add", text: midB[j]! });
        j += 1;
      }
    }
    while (i < midA.length) result.push({ kind: "del", text: midA[i++]! });
    while (j < midB.length) result.push({ kind: "add", text: midB[j++]! });
  } else {
    for (const text of midA) result.push({ kind: "del", text });
    for (const text of midB) result.push({ kind: "add", text });
  }
  for (const text of a.slice(endA)) result.push({ kind: "same", text });
  return result;
}

/** Collapse runs of unchanged lines longer than ±context into hunk gaps (DESIGN §3 markers). */
export function buildHunks(diff: readonly DiffLine[], context = 3): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  let current: DiffLine[] = [];
  let hidden = 0;
  const flush = () => {
    if (current.length === 0) return;
    if (current.some((line) => line.kind !== "same")) hunks.push({ hiddenBefore: hidden, lines: current });
    current = [];
    hidden = 0;
  };

  let i = 0;
  while (i < diff.length) {
    if (diff[i]!.kind !== "same") {
      current.push(diff[i]!);
      i += 1;
      continue;
    }
    let j = i;
    while (j < diff.length && diff[j]!.kind === "same") j += 1;
    const run = j - i;
    const changesBefore = current.length > 0;
    const changesAfter = j < diff.length;
    if (!changesBefore && !changesAfter) break; // no changes at all
    if (!changesBefore) {
      hidden = Math.max(0, run - context);
      current.push(...diff.slice(Math.max(i, j - context), j));
    } else if (!changesAfter) {
      current.push(...diff.slice(i, Math.min(j, i + context)));
    } else if (run > context * 2) {
      current.push(...diff.slice(i, i + context));
      flush();
      hidden = run - context * 2;
      current.push(...diff.slice(j - context, j));
    } else {
      current.push(...diff.slice(i, j));
    }
    i = j;
  }
  flush();
  return hunks;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

/**
 * +words/−words for a field change as a word multiset diff (the engine's
 * countCardFieldWordChanges semantics): words appearing more often in newText than oldText are
 * added, the leftover oldText multiplicity is removed. Prose reads as small honest numbers — a
 * one-word edit in a long line reports 1, not the whole line.
 */
export function countWordChanges(oldText: string, newText: string): { added: number; removed: number } {
  const oldCounts = new Map<string, number>();
  for (const word of oldText.trim().split(/\s+/u).filter(Boolean)) {
    oldCounts.set(word, (oldCounts.get(word) ?? 0) + 1);
  }
  let added = 0;
  for (const word of newText.trim().split(/\s+/u).filter(Boolean)) {
    const count = oldCounts.get(word) ?? 0;
    if (count === 0) added += 1;
    else if (count === 1) oldCounts.delete(word);
    else oldCounts.set(word, count - 1);
  }
  return { added, removed: [...oldCounts.values()].reduce((total, count) => total + count, 0) };
}
