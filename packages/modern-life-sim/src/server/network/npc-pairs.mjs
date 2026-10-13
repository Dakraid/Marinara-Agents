// NPC-to-NPC relationship pairs from cards and hourly closeness growth
import { clockFromMinutes } from "../time/clock.mjs";

var NPC_PAIR_KINDS = ["acquaintances", "friends", "close", "family", "couple", "ex", "rivals"];
var FAMILY_PAIR_DETAILS = ["siblings", "parent", "cousins", "relatives"];
var ROMANTIC_PAIR_KINDS = ["couple", "ex"];
var GROWING_PAIR_KINDS = ["acquaintances", "friends", "close"];
var PAIR_CLOSENESS_THRESHOLDS = {
  acquaintances: 0,
  friends: 35,
  close: 70,
};
var STARTING_CLOSENESS_BY_PAIR_KIND = {
  acquaintances: 15,
  friends: 45,
  close: 75,
  family: 60,
  couple: 80,
  ex: 20,
  rivals: 15,
};
var PAIR_NOTE_MAX_CHARS = 120;
var PAIR_CHANGE_LINE_MAX_CHARS = 200;
var npcPairKey = (idA, idB) => [String(idA), String(idB)].sort().join("|");
var npcPairBetween = (network, idA, idB) => network.pairs?.[npcPairKey(idA, idB)] ?? null;
var cleanPairText = (text, maxChars) =>
  String(text ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars)
    .trim();
function parsePairRelation(raw, { couples: allowCouples = false } = {}) {
  let kind = String(raw?.kind ?? "")
    .trim()
    .toLowerCase();
  if (!NPC_PAIR_KINDS.includes(kind)) {
    return null;
  }
  if (!allowCouples && kind === "couple") {
    kind = "close";
  }
  if (!allowCouples && kind === "ex") {
    kind = "acquaintances";
  }
  let detail =
    kind === "family"
      ? FAMILY_PAIR_DETAILS.includes(
          String(raw?.detail ?? "")
            .trim()
            .toLowerCase(),
        )
        ? String(raw.detail).trim().toLowerCase()
        : "relatives"
      : null;
  return {
    kind: kind,
    detail: detail,
    note: cleanPairText(raw?.note, PAIR_NOTE_MAX_CHARS),
  };
}
function parseCardRelations(relations, { ids = [], self: selfId = "", couples: allowCouples = false } = {}) {
  let result = [];
  for (let entry of Array.isArray(relations) ? relations : []) {
    let id = String(entry?.id ?? "").trim();
    if (!ids.includes(id) || id === selfId || result.some((existing) => existing.id === id)) {
      continue;
    }
    let relation = parsePairRelation(entry, {
      couples: allowCouples,
    });
    if (relation) {
      result.push({
        id: id,
        ...relation,
      });
    }
  }
  return result;
}
function parseNpcPairsFromCards(
  cards,
  { ids = [], couples: allowCouples = false, at = 0, canCouple = () => true } = {},
) {
  let pairs = {};
  for (let entry of Array.isArray(cards) ? cards : []) {
    let idA = String(entry?.a ?? ""),
      idB = String(entry?.b ?? "");
    if (!ids.includes(idA) || !ids.includes(idB) || idA === idB) {
      continue;
    }
    let relation = parsePairRelation(entry, {
      couples: allowCouples,
    });
    if (relation) {
      if (!(relation.kind === "couple" && !canCouple(idA, idB))) {
        pairs[npcPairKey(idA, idB)] = {
          a: idA,
          b: idB,
          ...relation,
          close: STARTING_CLOSENESS_BY_PAIR_KIND[relation.kind],
          from: entry.from === "hand" ? "hand" : "card",
          since: at,
        };
      }
    }
  }
  return pairs;
}
var pairKindForCloseness = (closeness) =>
  closeness >= PAIR_CLOSENESS_THRESHOLDS.close
    ? "close"
    : closeness >= PAIR_CLOSENESS_THRESHOLDS.friends
      ? "friends"
      : "acquaintances";
var PAIR_CLOSENESS_PER_HOUR = 0.5;
var NEIGHBOUR_CLOSENESS_FACTOR = 0.25;
var NEIGHBOUR_TICK_HOUR = 19;
var PAIR_DAILY_CLOSENESS_CAP = 4;
var PAIR_MEET_THRESHOLD_HOURS = 2;
var PLACE_CLOSENESS_FACTOR = {
  office: 2,
  university: 1.5,
  hospital: 0.5,
};
var SOCIAL_SPEED_FACTORS = [0.5, 0.8, 1.1, 1.4];
var ROMANCE_GROWING_PAIR_KINDS = ["friends", "close", "couple"];
var PAIR_ROMANCE_GAIN_FACTOR = 0.5;
var PAIR_ROMANCE_COUPLE_THRESHOLD = 50;
var networkWeekIndexAt = (minutes) => Math.floor(clockFromMinutes(minutes).dayIndex / 7);
var newNetworkWeek = (index) => ({
  index: index,
  hours: {},
  where: {},
  items: [],
  facts: [],
});
function ensureSocialNetwork(state) {
  state.pairs ??= {};
  state.near ??= {};
  state.facts ??= [];
  state.knows ??= {};
  state.news ??= [];
  state.week ??= newNetworkWeek(networkWeekIndexAt(state.minutes));
  return state;
}
function tickSocialNetworkHours(state, fromMinutes, toMinutes, hooks) {
  ensureSocialNetwork(state);
  let present = (state.characters ?? []).filter((character) => !character.away);
  for (let hour = Math.floor(fromMinutes / 60) + 1; hour * 60 <= toMinutes; hour++) {
    let hourMinutes = hour * 60,
      weekIndex = networkWeekIndexAt(hourMinutes);
    if (
      (weekIndex !== state.week.index &&
        ((state.weekDone = {
          ...state.week,
          ended: hourMinutes,
          tries: 0,
        }),
        (state.week = newNetworkWeek(weekIndex))),
      hour % 24 === NEIGHBOUR_TICK_HOUR && hooks.neighbours)
    ) {
      for (let [first, second, place] of hooks.neighbours()) {
        let pairKey = npcPairKey(first.id, second.id);
        if (!state.pairs[pairKey]) {
          state.near[pairKey] = (state.near[pairKey] ?? 0) + PAIR_CLOSENESS_PER_HOUR * NEIGHBOUR_CLOSENESS_FACTOR;
          if (!(state.near[pairKey] < PAIR_MEET_THRESHOLD_HOURS * PAIR_CLOSENESS_PER_HOUR)) {
            delete state.near[pairKey];
            state.pairs[pairKey] = {
              a: first.id,
              b: second.id,
              kind: "acquaintances",
              detail: "neighbours",
              note: "",
              close: 5,
              from: "neighbours",
              since: hourMinutes,
              place: place,
            };
            state.week.items.push({
              kind: "met",
              a: first.id,
              b: second.id,
              place: place,
              at: hourMinutes,
            });
          }
        }
      }
    }
    let byPlace = {},
      byDoor = {};
    for (let character of present) {
      let spot = hooks.where(character, hourMinutes);
      if (!(!spot?.place || spot.sleep)) {
        if (spot.place === "home") {
          let door = hooks.door?.(character, spot);
          if (door) {
            (byDoor[door] ??= []).push(character);
          }
          continue;
        }
        if (hooks.public(spot.place, hourMinutes)) {
          (byPlace[spot.place] ??= []).push(character);
        }
      }
    }
    for (let group of Object.values(byDoor)) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          spendHourTogetherAsPair(state, group[i], group[j], "home", hourMinutes, hooks);
        }
      }
    }
    for (let [place, group] of Object.entries(byPlace)) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          spendHourTogetherAsPair(state, group[i], group[j], place, hourMinutes, hooks);
          let pair = state.pairs[npcPairKey(group[i].id, group[j].id)];
          if (pair?.kind === "couple" && hooks.playerAt?.(hourMinutes) === place) {
            hooks.sawCouple?.(pair, place, hourMinutes);
          }
        }
      }
    }
  }
}
function spendHourTogetherAsPair(state, first, second, place, at, hooks) {
  let pairKey = npcPairKey(first.id, second.id),
    day = Math.floor(at / 1440);
  if (state.today?.day !== day) {
    state.today = {
      day: day,
      gained: {},
    };
  }
  let remaining = Math.max(0, PAIR_DAILY_CLOSENESS_CAP - (state.today.gained[pairKey] ?? 0)),
    gain = Math.min(
      remaining,
      PAIR_CLOSENESS_PER_HOUR *
        (PLACE_CLOSENESS_FACTOR[place] ?? 1) *
        (SOCIAL_SPEED_FACTORS[hooks.speed(first)] ?? 1) *
        (SOCIAL_SPEED_FACTORS[hooks.speed(second)] ?? 1),
    );
  state.today.gained[pairKey] = (state.today.gained[pairKey] ?? 0) + gain;
  state.week.hours[pairKey] = (state.week.hours[pairKey] ?? 0) + 1;
  let whereCounts = (state.week.where[pairKey] ??= {});
  whereCounts[place] = (whereCounts[place] ?? 0) + 1;
  let pair = state.pairs[pairKey];
  if (!pair) {
    if (
      ((state.near[pairKey] = (state.near[pairKey] ?? 0) + gain),
      state.near[pairKey] < PAIR_MEET_THRESHOLD_HOURS * PAIR_CLOSENESS_PER_HOUR)
    ) {
      return;
    }
    delete state.near[pairKey];
    pair = state.pairs[pairKey] = {
      a: first.id,
      b: second.id,
      kind: "acquaintances",
      detail: null,
      note: "",
      close: 5,
      from: "grew",
      since: at,
      place: place,
    };
    state.week.items.push({
      kind: "met",
      a: first.id,
      b: second.id,
      place: place,
      at: at,
    });
    hooks.partners?.(pair, first, second, place, at);
    return;
  }
  let previousKind = pair.kind;
  pair.close = Math.min(100, pair.close + gain);
  let romanceFactor = hooks.romance?.(first, second, pair) ?? 0;
  if (
    (romanceFactor > 0 &&
      ROMANCE_GROWING_PAIR_KINDS.includes(pair.kind) &&
      (pair.romance = Math.min(100, (pair.romance ?? 0) + gain * PAIR_ROMANCE_GAIN_FACTOR * romanceFactor)),
    GROWING_PAIR_KINDS.includes(previousKind))
  ) {
    let nextKind = pairKindForCloseness(pair.close);
    if (GROWING_PAIR_KINDS.indexOf(nextKind) > GROWING_PAIR_KINDS.indexOf(previousKind)) {
      pair.kind = nextKind;
      state.week.items.push({
        kind: nextKind,
        a: first.id,
        b: second.id,
        place: place,
        at: at,
      });
    }
  }
  hooks.partners?.(pair, first, second, place, at, gain);
}

export {
  FAMILY_PAIR_DETAILS,
  GROWING_PAIR_KINDS,
  NPC_PAIR_KINDS,
  PAIR_CHANGE_LINE_MAX_CHARS,
  PAIR_CLOSENESS_THRESHOLDS,
  PAIR_ROMANCE_COUPLE_THRESHOLD,
  ROMANTIC_PAIR_KINDS,
  cleanPairText,
  ensureSocialNetwork,
  npcPairBetween,
  npcPairKey,
  pairKindForCloseness,
  parseCardRelations,
  parseNpcPairsFromCards,
  tickSocialNetworkHours,
};
