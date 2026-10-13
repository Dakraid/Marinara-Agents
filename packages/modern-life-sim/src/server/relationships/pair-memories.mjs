// Shared memories between two cast members: remember, view, edit
import { formatAgoStamp } from "../time/clock.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { introduceNpcPair } from "../network/town-facts.mjs";
import {
  MEMORY_BUDGET_MAX,
  MEMORY_BUDGET_MIN,
  addMemory,
  editMemory,
  ensureMemoryIds,
  estimateTokens,
  memoriesInBudget,
  memoryBudgetOf,
  setMemoryBudget,
} from "../people/people-sheet.mjs";
import { characterOf, hasMet2, nameFor } from "../game.mjs";

var PAIR_BUDGET_DEFAULT = 1500;
function ensurePairOf(state, idA, idB, { make = true } = {}) {
  if (!idA || !idB || idA === idB) {
    return null;
  }
  let pair = npcPairBetween(state, idA, idB);
  return pair || !make
    ? pair
    : (introduceNpcPair(state, idA, idB, {
        place: state.at ?? null,
      }),
      npcPairBetween(state, idA, idB));
}
function rememberPair(state, idA, idB, { text: text, from = "", by = null, at = state.minutes } = {}) {
  let cleanText = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (
    !cleanText ||
    !characterOf(state, idA) ||
    !characterOf(state, idB) ||
    characterOf(state, idA).npc ||
    characterOf(state, idB).npc
  ) {
    return false;
  }
  let pair = ensurePairOf(state, idA, idB);
  return pair
    ? ((pair.memoryBudget ??= PAIR_BUDGET_DEFAULT),
      addMemory(pair, {
        at: at,
        text: cleanText,
        from: from,
      }),
      by && (pair.memories.at(-1).by = by),
      true)
    : false;
}
var memoryVisibleTo = (memory, characterId) => !memory.by || memory.by === characterId;
function pairMemoriesFor(state, characterId) {
  let result = [];
  for (let pair of Object.values(state.pairs ?? {})) {
    if (pair.a !== characterId && pair.b !== characterId) {
      continue;
    }
    let other = characterOf(state, pair.a === characterId ? pair.b : pair.a);
    if (!other) {
      continue;
    }
    let memories = memoriesInBudget({
      memoryBudget: pair.memoryBudget,
      memories: (pair.memories ?? []).filter((memory) => memoryVisibleTo(memory, characterId)),
    }).map((memory) => ({
      text: memory.text,
      when:
        memory.from === "summary"
          ? "earlier on, summed up"
          : Number.isFinite(memory.at)
            ? formatAgoStamp(memory.at, state.minutes)
            : "some time ago",
    }));
    if (memories.length) {
      result.push({
        name: other.name,
        memories: memories,
      });
    }
  }
  return result;
}
function pairSheet(state, characterId) {
  let rows = [];
  for (let pair of Object.values(state.pairs ?? {})) {
    if ((pair.a !== characterId && pair.b !== characterId) || !(pair.memories ?? []).length) {
      continue;
    }
    let otherId = pair.a === characterId ? pair.b : pair.a,
      other = characterOf(state, otherId);
    if (!other || !hasMet2(state, otherId)) {
      continue;
    }
    ensureMemoryIds(pair);
    let inBudget = new Set(memoriesInBudget(pair)),
      memories = pair.memories
        .map((memory) => ({
          id: memory.id,
          text: memory.text,
          pinned: !!memory.pinned,
          edited: !!memory.edited,
          from: memory.from ?? "",
          covers: memory.covers ?? 0,
          read: inBudget.has(memory),
          tokens: estimateTokens(memory.text),
          by: memory.by
            ? nameFor(
                state,
                characterOf(state, memory.by) ?? {
                  id: memory.by,
                  name: "",
                },
              )
            : "",
          when: Number.isFinite(memory.at) ? formatAgoStamp(memory.at, state.minutes) : "",
        }))
        .reverse();
    rows.push({
      id: otherId,
      name: nameFor(state, other),
      memories: [
        ...memories.filter((memory) => memory.from === "summary"),
        ...memories.filter((memory) => memory.from !== "summary"),
      ],
      memoryBudget: {
        used: memoriesInBudget(pair).reduce((sum, memory) => sum + estimateTokens(memory.text), 0),
        budget: memoryBudgetOf(pair),
        min: MEMORY_BUDGET_MIN,
        max: MEMORY_BUDGET_MAX,
      },
      last: Math.max(...pair.memories.map((memory) => memory.at ?? 0)),
    });
  }
  return rows.sort((rowA, rowB) => rowB.last - rowA.last).map(({ last: rowA, ...rowB }) => rowB);
}
function editPairMemory(state, idA, idB, request) {
  if (!hasMet2(state, idA) || !hasMet2(state, idB)) {
    return {
      ok: false,
      reason: "You have not met them.",
    };
  }
  let pair = ensurePairOf(state, idA, idB, {
    make: false,
  });
  if (!pair) {
    return {
      ok: false,
      reason: "They have no memories together.",
    };
  }
  if (((pair.memoryBudget ??= PAIR_BUDGET_DEFAULT), request?.action === "budget")) {
    let budgetError = setMemoryBudget(pair, request.tokens);
    return budgetError
      ? {
          ok: false,
          reason: budgetError,
        }
      : {
          ok: true,
        };
  }
  let editError = editMemory(pair, request ?? {}, {
    at: state.minutes,
  });
  return editError
    ? {
        ok: false,
        reason: editError,
      }
    : {
        ok: true,
      };
}
var pairsOf = (state, characterId) =>
  Object.values(state.pairs ?? {}).filter(
    (pair) => (pair.a === characterId || pair.b === characterId) && (pair.memories ?? []).length,
  );

export { PAIR_BUDGET_DEFAULT, editPairMemory, pairMemoriesFor, pairSheet, pairsOf, rememberPair };
