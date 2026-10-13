// Character memories (budget, summary folding, editing) and the contacts list / character sheet views
import { clockFromMinutes, formatAgoStamp, formatCalendarDate } from "../time/clock.mjs";
import { normalizeAttraction } from "../orientation/orientation.mjs";
import { LIKE_LABELS, effectiveTraits, notableTraitWords, relationshipProfile } from "../traits/traits.mjs";
import {
  BOND_AXES,
  BOND_TIER_THRESHOLDS,
  RELATIONSHIP_STATUS_LABELS,
  bondKind,
  bondSummary,
  bondTier,
  bondTierName,
  hasActiveTrustCap,
  isActiveRival,
  isFormerRival,
  isRomanceFrozen,
} from "../relationships/bonds.mjs";
import { tierEventQueueFor } from "../relationships/tier-steps.mjs";
import { kinOrRivalBadge } from "../relationships/kin.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";

var BOND_AXIS_LABELS = {
  friendship: "Friendship",
  romance: "Romance",
  trust: "Trust",
};
var WEEKDAY_SHORT_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var MEMORIES_KEPT_MAX = 300;
var MEMORY_TEXT_MAX = 600;
var MEMORY_SUMMARY_MAX = 1500;
var DEFAULT_MEMORY_BUDGET = 8e3;
var MEMORY_BUDGET_MIN = 500;
var MEMORY_BUDGET_MAX = 64e3;
var MEMORY_FOLD_MIN = 3;
var estimateTokens = (text) => Math.ceil(String(text ?? "").length / 4);
var memoryBudgetOf = (world) => world?.memoryBudget ?? DEFAULT_MEMORY_BUDGET;
function setMemoryBudget(world, value) {
  let budget = Math.round(Number(value));
  return Number.isFinite(budget)
    ? ((world.memoryBudget = Math.max(MEMORY_BUDGET_MIN, Math.min(MEMORY_BUDGET_MAX, budget))), null)
    : "That is not a number.";
}
var isKeptMemory = (memory) => memory.pinned || memory.from === "summary";
var memoryIdCounter = 0;
var newMemoryId = () => `m${Date.now().toString(36)}${(memoryIdCounter++).toString(36)}`;
function ensureMemoryIds(person) {
  for (let memory of person.memories ?? []) {
    memory.id ??= newMemoryId();
  }
  return person.memories ?? [];
}
function trimMemories(memories) {
  let kept = memories.filter(isKeptMemory),
    recent = memories.filter((memory) => !isKeptMemory(memory)).slice(-Math.max(0, MEMORIES_KEPT_MAX - kept.length)),
    keep = new Set([...kept, ...recent]);
  return memories.filter((memory) => keep.has(memory));
}
function addMemory(person, { at: at, text: text, from: from }) {
  person.memories = trimMemories([
    ...(person.memories ?? []),
    {
      id: newMemoryId(),
      at: at,
      text: text,
      from: from,
    },
  ]);
  return person.memories;
}
function memoriesInBudget(person) {
  let memories = (person.memories ?? []).filter((memory) => memory?.text),
    kept = memories.filter(isKeptMemory),
    budget = memoryBudgetOf(person) - kept.reduce((sum, memory) => sum + estimateTokens(memory.text), 0),
    included = new Set();
  for (let memory of memories.filter((candidate) => !isKeptMemory(candidate)).reverse()) {
    if (estimateTokens(memory.text) > budget) {
      break;
    }
    included.add(memory);
    budget -= estimateTokens(memory.text);
  }
  let chosen = memories.filter((memory) => isKeptMemory(memory) || included.has(memory));
  return [
    ...chosen.filter((memory) => memory.from === "summary"),
    ...chosen.filter((memory) => memory.from !== "summary"),
  ];
}
function memoriesOverBudget(person) {
  let inBudget = new Set(memoriesInBudget(person));
  return (person.memories ?? []).filter((memory) => memory?.text && !inBudget.has(memory));
}
function memorySummaryMessages(
  person,
  summary,
  older,
  { language = "English", player = "the player", pair = "" } = {},
) {
  return [
    {
      role: "system",
      content: [
        "Task: memory-summary",
        ...(pair
          ? [
              `You keep what ${pair} remember of each other in a modern life sim. Some older memories no longer fit; fold them, together with the summary so far, into ONE summary.`,
              "Write it as what happened between the two of them: what they did together, how it went, and how things stand between them. Keep what matters; drop repetition. Only what both of them know: leave out what one of them only thought or felt.",
            ]
          : [
              `You keep ${person.name}'s memory of ${player} in a modern life sim. Some older memories no longer fit; fold them, together with the summary so far, into ONE summary.`,
              `Write it from ${person.name}'s side, as what they remember: how they met, what ${player} did and said, how it made them feel, and anything that keeps coming back. Keep what matters; drop repetition.`,
              "It is an impression of the player \u2014 never a plan, a promise or an appointment to keep.",
            ]),
        `At most ${MEMORY_SUMMARY_MAX} characters. Write it in ${language}.`,
        'Answer with JSON only, exactly: {"summary":"\u2026"}',
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        summary
          ? `THE SUMMARY SO FAR:
${summary.text}`
          : "THE SUMMARY SO FAR: (none yet)",
        "",
        "THE OLDER MEMORIES TO FOLD IN, oldest first:",
        ...older.map((memory) => `- ${memory.text}`),
      ].join(`
`),
    },
  ];
}
async function foldOldMemories(host, person, options = {}) {
  let older = memoriesOverBudget(person).filter((memory) => memory.from !== "summary" && !memory.by);
  if (older.length < MEMORY_FOLD_MIN) {
    return false;
  }
  let previousSummary = (person.memories ?? []).find((memory) => memory.from === "summary") ?? null,
    { json: json } = await host.askJson(memorySummaryMessages(person, previousSummary, older, options), {
      maxTokens: 900,
      task: "memory-summary",
      about: options.pair || person.name,
    }),
    summaryText =
      typeof json?.summary == "string" ? json.summary.replace(/\s+/g, " ").trim().slice(0, MEMORY_SUMMARY_MAX) : "";
  if (!summaryText) {
    throw new Error("The model wrote no summary.");
  }
  let folded = new Set([...older, previousSummary].filter(Boolean)),
    summary = {
      id: newMemoryId(),
      from: "summary",
      text: summaryText,
      at: older.at(-1)?.at ?? previousSummary?.at ?? 0,
      covers: (previousSummary?.covers ?? 0) + older.length,
    };
  person.memories = [summary, ...(person.memories ?? []).filter((memory) => !folded.has(memory))];
  return true;
}
function editMemory(person, { action: action, memory: memoryId, text = "" }, { at = 0 } = {}) {
  ensureMemoryIds(person);
  let cleanText = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MEMORY_TEXT_MAX);
  if (action === "add") {
    return cleanText
      ? ((person.memories = trimMemories([
          ...(person.memories ?? []),
          {
            id: newMemoryId(),
            at: at,
            text: cleanText,
            from: "hand",
          },
        ])),
        null)
      : "Write something first.";
  }
  let memory = (person.memories ?? []).find((candidate) => candidate.id === memoryId);
  if (!memory) {
    return "That memory is not there any more.";
  }
  if (action === "edit") {
    if (!cleanText) {
      return "A memory cannot be empty: delete it instead.";
    }
    memory.text = cleanText;
    memory.edited = true;
  } else if (action === "pin") {
    if (memory.from !== "summary") {
      memory.pinned = true;
    }
  } else if (action === "unpin") {
    delete memory.pinned;
  } else if (action === "delete") {
    person.memories = person.memories.filter((candidate) => candidate !== memory);
  } else {
    return "That is not something you can do with a memory.";
  }
  return null;
}
function scheduleBlockHours(weekday, block) {
  let hours = (block.to - block.from + 24) % 24 || 24;
  return Array.from(
    {
      length: hours,
    },
    (unused, offset) => [(weekday + Math.floor((block.from + offset) / 24)) % 7, (block.from + offset) % 24],
  );
}
function seenWeekBlocks(schedule, seen = {}, { showAll = false } = {}) {
  return (schedule.week ?? []).map((blocks, weekday) =>
    blocks.filter(
      (block) =>
        showAll ||
        seen[`${weekday}:${block.from}`] ||
        scheduleBlockHours(weekday, block).some(([day, hour]) => seen[`${day}:${hour}`]),
    ),
  );
}
var bondContextFor = (world, nameOf) => ({
  otherPartners: Object.values(world.bonds ?? {}),
  names: Object.fromEntries((world.characters ?? []).map((person) => [person.id, nameOf(person)])),
});
function contactsList(world, { here = [], nameOf = (person) => person.name, metOf = () => true } = {}) {
  let hereIds = new Set(here.map((person) => person.id)),
    today = clockFromMinutes(world.minutes).dayIndex;
  return world.characters
    .map((person) => {
      let bond = world.bonds[person.id],
        met = metOf(person.id),
        friendshipTier = bondTier(bond, "friendship"),
        romanceTier = bondTier(bond, "romance"),
        summary = bond ? bondSummary(bond) : null,
        lastSeen = bond?.lastSeen ?? null,
        lastSeenDay = lastSeen === null ? null : clockFromMinutes(lastSeen).dayIndex,
        seenText = met
          ? hereIds.has(person.id)
            ? "Here, right now"
            : lastSeenDay === null
              ? ""
              : lastSeenDay === today
                ? "Seen today"
                : lastSeenDay === today - 1
                  ? "Seen yesterday"
                  : `Last seen ${WEEKDAY_SHORT_NAMES[clockFromMinutes(lastSeen).weekdayIndex]}`
          : "You have not met";
      return {
        id: person.id,
        name: nameOf(person),
        met: met,
        gender: person.gender ?? null,
        into: normalizeAttraction(person.into),
        ...characterPortrait(person, world),
        away: !!person.away,
        group: person.away ? "away" : met ? (friendshipTier >= 2 || romanceTier >= 2 ? "close" : "met") : "unmet",
        sub: person.away
          ? "Moved away"
          : met
            ? [bondKind(bond) === "couple" ? `\u2665 ${summary.status.name}` : summary?.friendship.name, seenText]
                .filter(Boolean)
                .join(" \xB7 ")
            : seenText,
        event: !person.away && met && !!tierEventQueueFor(bond, world.minutes, bondContextFor(world, nameOf)).next,
        drifting: !person.away && met && !!summary?.drifting,
        weight: (bond?.friendship ?? 0) + (bond?.romance ?? 0) + (bond?.trust ?? 0),
      };
    })
    .sort(
      (left, right) =>
        ["close", "met", "unmet", "away"].indexOf(left.group) -
          ["close", "met", "unmet", "away"].indexOf(right.group) || right.weight - left.weight,
    );
}
function characterBlurb(text) {
  let clean = String(text ?? "")
      .replace(/\s+/g, " ")
      .trim(),
    sentenceEnd = clean.search(/[.!?](\s|$)/),
    firstSentence = sentenceEnd > 20 ? clean.slice(0, sentenceEnd + 1) : clean;
  return firstSentence.length > 200 ? `${firstSentence.slice(0, 199).trimEnd()}\u2026` : firstSentence;
}
function knownAboutCharacter(bond, mode = "found") {
  let trustTier = bondTier(bond, "trust"),
    profile = relationshipProfile(bond),
    showLikes = mode === "always" || (mode === "found" && trustTier >= 2),
    likesWith = (marks) =>
      Object.entries(profile.likes)
        .filter(([, mark]) => marks.includes(mark))
        .map(([like]) => LIKE_LABELS[like] ?? like),
    traits = notableTraitWords(effectiveTraits(bond)),
    seen = bond.traitsSeen ?? {},
    full = mode === "always" || (mode === "found" && trustTier >= 2),
    shownTraits = full ? traits : mode === "found" ? traits.filter((trait) => seen[trait.key]) : null;
  return {
    full: full,
    traits: shownTraits,
    traitsHidden: shownTraits ? traits.length - shownTraits.length : 0,
    traitsHint:
      mode === "hidden"
        ? "Hidden, as you chose for this life"
        : "You find out as you see it, and all of it once they are Trusting",
    likes: showLikes ? likesWith(["++", "+"]) : null,
    dislikes: showLikes ? likesWith(["-", "--"]) : null,
    likesHint:
      mode === "hidden"
        ? "Hidden, as you chose for this life"
        : "Once they are Trusting, you see what they like and what they don't",
  };
}
var knownTraitWord = (bond, keys) => bond?.traits?.find((trait) => keys.includes(trait.key))?.word ?? "";
function bondAxisView(bond, axis, queue, { at = 0, dateOf = null } = {}) {
  let summary = bondSummary(bond)[axis],
    nextTier = bondTier(bond, axis) + 1,
    tierEvent = queue.list.find((candidate) => candidate.axis === axis),
    frozen = axis === "romance" && isRomanceFrozen(bond),
    next =
      nextTier < BOND_TIER_THRESHOLDS.length
        ? `Next: ${bondTierName(bond, axis, nextTier)}, then a scene with them`
        : "As far as it goes.";
  if (tierEvent?.status === "ready") {
    next = `The moment is here: ${tierEvent.step} \xB7 find them to play it`;
  } else if (tierEvent?.status === "needs" && tierEvent.needs?.why) {
    next = tierEvent.needs.why;
  } else if (tierEvent?.status === "needs" && !tierEvent.needs?.off) {
    next = `First, ${BOND_AXIS_LABELS[tierEvent.needs.axis]} has to reach ${tierEvent.needs.name}`;
  } else if (tierEvent?.status === "later") {
    next = `Not yet \xB7 the moment comes back in ${tierEvent.daysLeft} day${tierEvent.daysLeft === 1 ? "" : "s"}`;
  }
  if (axis === "trust" && !tierEvent && hasActiveTrustCap(bond, at) && Number.isFinite(bond.trustCapUntil)) {
    next = `You kept it light \xB7 until ${dateOf ? dateOf(bond.trustCapUntil) : ""}`;
  }
  if (frozen) {
    next = bond.justFriends ? "Just friends: no romance" : "Romance is not on the table with them";
  }
  return {
    axis: axis,
    value: summary.value,
    name: summary.name,
    mark: nextTier < BOND_TIER_THRESHOLDS.length ? BOND_TIER_THRESHOLDS[nextTier] : null,
    next: next,
    frozen: frozen,
    event: tierEvent?.status ?? null,
  };
}
function characterSheet(
  world,
  characterId,
  {
    nameOf = (candidate) => candidate.name,
    metOf = () => true,
    whereNow = null,
    isHere = false,
    placeName = (placeId) => placeId,
    rules = {},
    told = false,
  } = {},
) {
  let person = world.characters.find((candidate) => candidate.id === characterId),
    bond = world.bonds[characterId];
  if (!person || !bond) {
    return null;
  }
  if (!metOf(characterId)) {
    return {
      id: characterId,
      name: nameOf(person),
      met: false,
      ...characterPortrait(person, world),
    };
  }
  let queue = tierEventQueueFor(bond, world.minutes, bondContextFor(world, nameOf)),
    dateLabel = (day) =>
      formatCalendarDate(day, {
        from: world.startedAt,
      }).replace(/ · Year \d+$/, ""),
    couple = bondKind(bond) === "couple",
    seenHours = world.seenSchedule?.[characterId] ?? {},
    showSchedules = rules.showSchedules ?? "found",
    clock = clockFromMinutes(world.minutes),
    showWhere =
      whereNow && (isHere || told || showSchedules === "always" || seenHours[`${clock.weekdayIndex}:${clock.hour}`]);
  ensureMemoryIds(person);
  return {
    id: characterId,
    name: person.name,
    met: true,
    ...characterPortrait(person, world),
    line: characterBlurb(person.description),
    now: showWhere
      ? {
          place: placeName(whereNow.place),
          doing: whereNow.doing ?? "",
        }
      : null,
    tags: [
      bond.kin
        ? kinOrRivalBadge({
            kin: bond.kin,
            gender: person.gender,
          })
        : bond.justFriends
          ? "Just friends"
          : isRomanceFrozen(bond)
            ? bond.notInto && bond.cardRomance !== false
              ? "Not into you"
              : "Not open to romance"
            : "Open to romance",
      ...(isActiveRival(bond)
        ? [
            kinOrRivalBadge({
              rival: true,
            }),
          ]
        : isFormerRival(bond)
          ? [
              kinOrRivalBadge({
                rivalWas: true,
              }),
            ]
          : []),
      ...(bond.status === "single" && (bond.kin || (isRomanceFrozen(bond) && !bond.justFriends))
        ? []
        : [RELATIONSHIP_STATUS_LABELS[bond.status]]),
      `${(person.memories ?? []).length} memor${(person.memories ?? []).length === 1 ? "y" : "ies"}`,
    ],
    bonds: BOND_AXES.map((axis) =>
      bondAxisView(bond, axis, queue, {
        at: world.minutes,
        dateOf: dateLabel,
      }),
    ),
    canJustFriends: !couple && (!!bond.justFriends || !isRomanceFrozen(bond)),
    justFriends: !!bond.justFriends,
    known: knownAboutCharacter(bond, rules.showArchetypes ?? "found"),
    week:
      showSchedules === "hidden" && !told
        ? null
        : seenWeekBlocks(person, seenHours, {
            showAll: told || showSchedules === "always",
          }).map((dayBlocks) =>
            dayBlocks.map((block) => ({
              from: block.from,
              to: block.to,
              place: block.place === "home" ? "Home" : placeName(block.place),
              doing: block.doing ?? "",
              ...(block.sleep
                ? {
                    sleep: true,
                  }
                : {}),
            })),
          ),
    memories: (() => {
      let inBudget = new Set(memoriesInBudget(person)),
        rows = (person.memories ?? [])
          .map((memory) => ({
            id: memory.id,
            text: memory.text,
            pinned: !!memory.pinned,
            edited: !!memory.edited,
            from: memory.from ?? "",
            covers: memory.covers ?? 0,
            read: inBudget.has(memory),
            tokens: estimateTokens(memory.text),
            when: Number.isFinite(memory.at) ? formatAgoStamp(memory.at, world.minutes) : "",
          }))
          .reverse();
      return [...rows.filter((row) => row.from === "summary"), ...rows.filter((row) => row.from !== "summary")];
    })(),
    memoryBudget: {
      used: memoriesInBudget(person).reduce((sum, memory) => sum + estimateTokens(memory.text), 0),
      budget: memoryBudgetOf(person),
      min: MEMORY_BUDGET_MIN,
      max: MEMORY_BUDGET_MAX,
    },
  };
}

export {
  MEMORY_BUDGET_MAX,
  MEMORY_BUDGET_MIN,
  addMemory,
  characterSheet,
  contactsList,
  editMemory,
  ensureMemoryIds,
  estimateTokens,
  foldOldMemories,
  knownAboutCharacter,
  knownTraitWord,
  memoriesInBudget,
  memoryBudgetOf,
  seenWeekBlocks,
  setMemoryBudget,
};
