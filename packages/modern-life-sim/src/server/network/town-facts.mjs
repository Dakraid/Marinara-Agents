// Facts about the player, who knows them, gossip prompt lines
import { formatCalendarDate, formatClockTime } from "../time/clock.mjs";
import { ensureSocialNetwork, npcPairKey } from "./npc-pairs.mjs";

var FACT_ACT_PHRASES = {
  flirt: (otherName) => `flirting with ${otherName}`,
  gift: (otherName) => `giving ${otherName} a gift`,
  confess: (otherName) => `telling ${otherName} you like them`,
  kiss: (otherName) => `kissing ${otherName}`,
  dating: (otherName) => `dating ${otherName}`,
  partners: (otherName) => `together with ${otherName}`,
  living: (otherName) => `living with ${otherName}`,
  engaged: (otherName) => `engaged to ${otherName}`,
  married: (otherName) => `married to ${otherName}`,
  breakup: (otherName) => `breaking up with ${otherName}`,
  date: (otherName) => `out on a date with ${otherName}`,
  fainted: () => "fainting",
  fired: () => "getting fired",
  promoted: () => "getting promoted at work",
  hired: () => "getting a job at the office",
  evicted: (otherName, fact) =>
    fact?.what === "partner" ? "having to move out with nowhere to go" : "getting evicted",
  rough: () => "sleeping rough in the park",
  moved: (otherName, fact) =>
    `moving to ${
      {
        house: "a house on the street",
        luxury: "a luxury flat in the tower on the hill",
        mansion: "a mansion on the hill",
      }[fact?.what] ?? "an apartment in the building"
    }`,
  party: (otherName, fact) =>
    `throwing a party at home${fact?.what === "great" ? " (a great one)" : fact?.what === "flat" ? " (it fell flat)" : ""}`,
  "party-guest": (otherName) => `at ${otherName}'s party`,
  designer: (otherName, fact) =>
    `going around in designer clothes${fact?.what ? ` (${String(fact.what).toLowerCase()})` : ""}`,
  interested: (otherName) => `being interested in ${otherName}`,
  wheels: (otherName, fact) => `arriving on ${fact?.what === "car" ? "a car" : "a motorbike"}`,
  rumor: (otherName, fact, nameOf) =>
    `saying ${otherName} and ${fact?.about ? nameOf(fact.about) : "someone"} ${RUMOR_WHAT_PHRASES[fact?.what] ?? "are seeing each other"}`,
};
var RUMOR_WHAT_PHRASES = {
  dating: "are seeing each other",
  kissed: "kissed",
  flirting: "are flirting",
  "broke-up": "broke up",
};
var MAX_STORED_FACTS = 400;
var MAX_KNOWN_FACTS_PER_PERSON = 60;
function recordTownFact(
  state,
  act,
  {
    with: withId = null,
    place = null,
    at = state.minutes,
    witnesses: witnessList = [],
    about = null,
    what = null,
    hearer = null,
  } = {},
) {
  if (!FACT_ACT_PHRASES[act]) {
    return [];
  }
  ensureSocialNetwork(state);
  let factId = `f${(state.factCount = (state.factCount ?? 0) + 1)}`,
    fact = {
      id: factId,
      act: act,
      with: withId,
      place: place,
      at: at,
      ...(about
        ? {
            about: about,
          }
        : {}),
      ...(what
        ? {
            what: what,
          }
        : {}),
    };
  state.facts.push(fact);
  if (state.facts.length > MAX_STORED_FACTS) {
    state.facts.splice(0, state.facts.length - MAX_STORED_FACTS);
  }
  if (hearer) {
    addFactKnowledge(state, hearer, {
      fact: factId,
      how: "there",
      at: at,
    });
  } else if (withId) {
    addFactKnowledge(state, withId, {
      fact: factId,
      how: "there",
      at: at,
    });
  }
  let witnessIds = witnessList.filter((witness) => witness !== withId);
  for (let witness of witnessIds) {
    addFactKnowledge(state, witness, {
      fact: factId,
      how: "seen",
      at: at,
    });
  }
  state.week.facts.push(factId);
  return witnessIds;
}
function addFactKnowledge(state, personId, entry) {
  let known = (state.knows[personId] ??= []);
  return known.some((existing) => existing.fact === entry.fact)
    ? false
    : (known.push(entry),
      known.length > MAX_KNOWN_FACTS_PER_PERSON && known.splice(0, known.length - MAX_KNOWN_FACTS_PER_PERSON),
      true);
}
var personKnowsFact = (state, personId, factId) =>
  (state.knows?.[personId] ?? []).some((entry) => entry.fact === factId);
var markFactSeenBy = (state, personId, factId, { at = state.minutes } = {}) => (
  ensureSocialNetwork(state),
  addFactKnowledge(state, personId, {
    fact: factId,
    how: "seen",
    at: at,
  })
);
var tellFactTo = (state, personId, factId, { from = "you", at = state.minutes } = {}) =>
  addFactKnowledge(state, personId, {
    fact: factId,
    how: "heard",
    from: from,
    at: at,
  });
function introduceNpcPair(state, idA, idB, { place = null, at = state.minutes } = {}) {
  ensureSocialNetwork(state);
  let pairKey = npcPairKey(idA, idB);
  return state.pairs[pairKey]
    ? false
    : (delete state.near[pairKey],
      (state.pairs[pairKey] = {
        a: idA,
        b: idB,
        kind: "acquaintances",
        detail: null,
        note: "",
        close: 5,
        from: "you",
        since: at,
        place: place,
      }),
      state.week.items.push({
        kind: "met",
        a: idA,
        b: idB,
        place: place,
        at: at,
      }),
      true);
}
var townFactById = (state, factId) => (state.facts ?? []).find((fact) => fact.id === factId) ?? null;
function describeTownFact(state, fact, nameOf) {
  let withName = fact.with ? nameOf(fact.with) : "";
  return `you ${FACT_ACT_PHRASES[fact.act]?.(withName, fact, nameOf) ?? fact.act}`;
}
function knownFactsAboutPlayer(state, personId, { nameOf: nameOf, placeName: placeName }) {
  return (state.knows?.[personId] ?? [])
    .map((entry) => {
      let fact = townFactById(state, entry.fact);
      if (!fact || fact.with === personId) {
        return null;
      }
      let text = describeTownFact(state, fact, nameOf);
      return {
        how: entry.how,
        what: text[0].toUpperCase() + text.slice(1),
        where: fact.place ? placeName(fact.place) : "",
        from: entry.from === "you" ? "you" : entry.from ? nameOf(entry.from) : "",
        fromYou: entry.from === "you",
        when: `${formatCalendarDate(fact.at, {
          from: state.startedAt,
        }).replace(/ · Year \d+$/, "")}${entry.how === "heard" ? "" : ` \xB7 ${formatClockTime(fact.at)}`}`,
        at: fact.at,
        fact: fact.id,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.at - left.at);
}
var RECENT_FACT_DAYS = 30;
var TOGETHER_BOND_STATUSES = ["dating", "partners", "living", "engaged", "married"];
function gossipLinesForPerson(
  state,
  personId,
  { nameOf: nameOf, placeName: placeName, skip = () => false, talked = () => false },
) {
  let bond = state.bonds?.[personId] ?? null,
    togetherSince = TOGETHER_BOND_STATUSES.includes(bond?.status)
      ? (bond.togetherSince ?? bond.statusSince ?? null)
      : null,
    factsById = new Map((state.facts ?? []).map((fact) => [fact.id, fact])),
    isRelevant = (entry) => {
      let fact = factsById.get(entry.fact);
      return fact
        ? fact.at >= state.minutes - RECENT_FACT_DAYS * 24 * 60 ||
          (fact.act === "rumor" && (fact.with === personId || fact.about === personId)) ||
          (bond?.caughtLying?.with && fact.with === bond.caughtLying.with)
          ? true
          : togetherSince !== null && fact.at >= togetherSince
        : false;
    },
    keptFactIds = new Set(
      (state.knows?.[personId] ?? [])
        .filter((entry) => isRelevant(entry) && !(factsById.get(entry.fact) && skip(factsById.get(entry.fact))))
        .map((entry) => entry.fact),
    );
  return knownFactsAboutPlayer(state, personId, {
    nameOf: nameOf,
    placeName: placeName,
  })
    .filter((line) => keptFactIds.has(line.fact))
    .slice(0, 12)
    .map((line) => {
      let suffix =
        (togetherSince !== null && line.at < togetherSince ? ", before the two of you were together" : "") +
        (factsById.get(line.fact) && talked(factsById.get(line.fact))
          ? ", and the two of them already talked it through: it is settled"
          : "");
      return line.how === "there"
        ? `${line.what} (they were there, ${line.when}${suffix})`
        : line.how === "seen"
          ? `${line.what}${line.where ? ` at ${line.where}` : ""} (they saw it, ${line.when}${suffix})`
          : line.fromYou
            ? `${line.what} (the player told them so${suffix})`
            : `${line.what} (they heard it from ${line.from}${suffix})`;
    });
}
var gossipPromptBlock = (lines = [], subject = "the player") =>
  lines.length
    ? `
WHAT THEY KNOW ABOUT ${subject.toUpperCase()} FROM AROUND TOWN, newest first:
${lines.map((line) => `- ${line}`).join(`
`)}
They may bring it up if it fits who they are, or keep it to themselves. What they only heard may be wrong.`
    : "";
function npcPairsOf(state, personId) {
  return Object.values(state.pairs ?? {})
    .filter((pair) => pair.a === personId || pair.b === personId)
    .map((pair) => ({
      ...pair,
      other: pair.a === personId ? pair.b : pair.a,
    }))
    .sort((left, right) => right.close - left.close);
}

export {
  FACT_ACT_PHRASES,
  RECENT_FACT_DAYS,
  addFactKnowledge,
  describeTownFact,
  gossipLinesForPerson,
  gossipPromptBlock,
  introduceNpcPair,
  knownFactsAboutPlayer,
  markFactSeenBy,
  npcPairsOf,
  personKnowsFact,
  recordTownFact,
  tellFactTo,
  townFactById,
};
