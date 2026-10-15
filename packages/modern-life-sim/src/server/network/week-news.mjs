// Weekly social-network LLM pass, applying changes and the weekly news view
import { formatCalendarDate } from "../time/clock.mjs";
import {
  cleanPairText,
  GROWING_PAIR_KINDS,
  isLeadPair,
  npcPairKey,
  PAIR_CHANGE_LINE_MAX_CHARS,
  pairKindForCloseness,
  pairWordFor,
} from "./npc-pairs.mjs";
import { addFactKnowledge, describeTownFact, npcPairsOf, personKnowsFact, townFactById } from "./town-facts.mjs";

var TELLING_PAIR_KINDS = ["friends", "close", "family", "couple"];
var MAX_WEEKLY_TELLS = 30;
function possibleWeeklyTells(state, week = state.weekDone) {
  if (!week) {
    return [];
  }
  let tells = [];
  for (let [personId, known] of Object.entries(state.knows ?? {})) {
    for (let entry of [...known].reverse()) {
      let fact = townFactById(state, entry.fact);
      if (fact) {
        for (let pair of npcPairsOf(state, personId)) {
          if (!(
            !TELLING_PAIR_KINDS.includes(pair.kind) ||
            !week.hours?.[npcPairKey(personId, pair.other)] ||
            personKnowsFact(state, pair.other, fact.id)
          )) {
            tells.push({
              from: personId,
              to: pair.other,
              fact: fact.id,
              how: entry.how,
            });
          }
        }
      }
    }
  }
  return tells
    .sort((left, right) => (townFactById(state, right.fact)?.at ?? 0) - (townFactById(state, left.fact)?.at ?? 0))
    .slice(0, MAX_WEEKLY_TELLS);
}
var BETWEEN_CHANGE_CLOSENESS = {
  closer: 6,
  cooler: -4,
  argued: -8,
};
var MAX_BETWEEN_CHANGES = 6;
var MAX_CROSSED_PATH_PAIRS = 20;
function crossedPathsThisWeek(state, week = state.weekDone) {
  let pairs = Object.entries(week?.hours ?? {})
    .filter(([pairKey]) => state.pairs?.[pairKey])
    .sort((left, right) => right[1] - left[1])
    .map(([pairKey, hours]) => {
      let pair = state.pairs[pairKey],
        atHome = (week.where?.[pairKey]?.home ?? 0) > 0,
        where = atHome
          ? "home"
          : (Object.entries(week.where?.[pairKey] ?? {}).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null);
      return {
        a: pair.a,
        b: pair.b,
        kind: pair.kind,
        detail: pair.detail,
        hours: hours,
        where: where,
        romance: Math.round(pair.romance ?? 0),
        ...(atHome
          ? {
              home: true,
            }
          : {}),
      };
    });
  return [...pairs.filter((pair) => !pair.home).slice(0, MAX_CROSSED_PATH_PAIRS), ...pairs.filter((pair) => pair.home)];
}
function networkWeekPrompt({
  people = [],
  pairs = [],
  tells = [],
  language = "English",
  setting = "",
  couples = false,
} = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: network-week",
        "A week just ended in a small town of a life sim. You decide what happened between some of its people, from closed lists. The code has already worked out who met whom; you do not invent anything else.",
        "1. `told`: from the numbered list CAN TELL, the numbers of the ones that really happened this week: somebody passing on something about the player to someone close. Pick true to who each teller is: a discreet or loyal person may keep it, a talker passes it on. Any number, none is fine.",
        `2. \`between\`: at most 6 changes between pairs from CROSSED PATHS, only where something plausibly happened: \`change\` is exactly one of closer, cooler, argued${couples ? ", together (only a pair marked \xABcould get together\xBB: they start seeing each other), split (only a couple: they break up)" : ""}, and \`line\` is one short sentence saying what happened between the two (no names, the screen shows them; nothing about the player).`,
        `Write each line in ${language}.`,
        'Answer with JSON only, exactly: {"told":[1,3],"between":[{"a":"<id>","b":"<id>","change":"closer","line":"\u2026"}]}',
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        setting
          ? `THE SETTING:
${setting}`
          : "",
        "PEOPLE:",
        ...people.map((person) => `- ${person.id}: ${person.name} \u2014 ${person.type}`),
        "",
        "CROSSED PATHS (pair \xB7 what they are \xB7 hours together \xB7 where most):",
        ...(pairs.length
          ? pairs.map(
              (pair) =>
                `- ${pair.a} & ${pair.b} \xB7 ${isLeadPair(pair) ? `${pair.a} is ${pair.b}'s ${pairWordFor(pair, pair.b)}` : (pair.detail ?? pair.kind)} \xB7 ${pair.hours} h \xB7 ${pair.home ? "at home (they live together)" : (pair.where ?? "around town")}${couples && pair.canTogether ? " \xB7 could get together" : ""}`,
            )
          : ["- nobody"]),
        "",
        "CAN TELL:",
        ...(tells.length
          ? tells.map((tell, index) => `${index + 1}. ${tell.fromName} could tell ${tell.toName}: ${tell.text}`)
          : ["- nothing"]),
      ].filter((line) => line !== null).join(`
`),
    },
  ];
}
function parseNetworkWeek(raw, { tells = [], pairs = [] } = {}) {
  let told = [
      ...new Set(
        (Array.isArray(raw?.told) ? raw.told : [])
          .map(Number)
          .filter((num) => Number.isInteger(num) && num >= 1 && num <= tells.length),
      ),
    ],
    between = [];
  for (let entry of Array.isArray(raw?.between) ? raw.between : []) {
    let change = String(entry?.change ?? "")
        .trim()
        .toLowerCase(),
      pair = pairs.find((candidate) => npcPairKey(candidate.a, candidate.b) === npcPairKey(entry?.a, entry?.b));
    if (
      !(
        !pair ||
        between.some((existing) => npcPairKey(existing.a, existing.b) === npcPairKey(pair.a, pair.b)) ||
        !(
          BETWEEN_CHANGE_CLOSENESS[change] ||
          (change === "together" && pair.canTogether) ||
          (change === "split" && pair.kind === "couple")
        )
      ) &&
      (between.push({
        a: pair.a,
        b: pair.b,
        change: change,
        line: cleanPairText(entry?.line, PAIR_CHANGE_LINE_MAX_CHARS),
      }),
      between.length >= MAX_BETWEEN_CHANGES)
    ) {
      break;
    }
  }
  return {
    told: told,
    between: between,
  };
}
function applyNetworkWeek(
  state,
  result = {
    told: [],
    between: [],
  },
  { tells = possibleWeeklyTells(state), secretOf = () => false, learnYou: learnsAboutYou = () => false } = {},
) {
  let week = state.weekDone;
  if (!week) {
    return null;
  }
  let between = [];
  for (let item of week.items) {
    between.push({
      a: item.a,
      b: item.b,
      tag: item.kind === "met" ? "MET" : item.kind === "rivals" ? "RIVALS" : "CLOSER",
      code: item.kind,
      place: item.place,
    });
  }
  for (let change of result.between) {
    let pair = state.pairs[npcPairKey(change.a, change.b)];
    if (pair) {
      if (change.change === "together") {
        if (
          (Object.assign(pair, {
            kind: "couple",
            detail: null,
            since: week.ended,
            secret: !!secretOf(pair),
          }),
          pair.secret)
        ) {
          continue;
        }
      } else if (change.change === "split") {
        Object.assign(pair, {
          kind: "ex",
          romance: Math.round((pair.romance ?? 0) / 2),
          secret: false,
        });
      } else {
        pair.close = Math.max(0, Math.min(100, pair.close + BETWEEN_CHANGE_CLOSENESS[change.change]));
        if (GROWING_PAIR_KINDS.includes(pair.kind)) {
          pair.kind = pairKindForCloseness(pair.close);
        }
      }
      between.push({
        a: change.a,
        b: change.b,
        tag: change.change.toUpperCase(),
        line: change.line,
      });
    }
  }
  let you = [];
  for (let factId of week.facts) {
    let fact = townFactById(state, factId);
    for (let [personId, known] of Object.entries(state.knows)) {
      if (known.find((entry) => entry.fact === factId && entry.how === "seen") && fact) {
        you.push({
          who: personId,
          how: "seen",
          fact: factId,
        });
      }
    }
  }
  let yours = [...(week.yours ?? [])];
  for (let tellNumber of result.told) {
    let tell = tells[tellNumber - 1];
    if (tell?.to === "you") {
      if (learnsAboutYou(tell, week.ended)) {
        yours.push({
          a: tell.a,
          b: tell.b,
          how: "heard",
          from: tell.from,
        });
      }
      continue;
    }
    if (
      tell &&
      addFactKnowledge(state, tell.to, {
        fact: tell.fact,
        how: "heard",
        from: tell.from,
        at: week.ended,
      })
    ) {
      you.push({
        who: tell.to,
        how: "heard",
        from: tell.from,
        fact: tell.fact,
      });
    }
  }
  let news = {
    week: week.index,
    ended: week.ended,
    between: between,
    you: you,
    yours: yours,
    seen: false,
  };
  state.news.push(news);
  state.weekDone = null;
  return news;
}
var PLAYER_PAIR_MET_TAGS = {
  good: ["MET", "It went well."],
  none: ["MET", "Polite, and that was all."],
  tense: ["TENSION", "It didn't go well."],
  rivals: ["RIVALS", "They can't stand each other."],
  love: ["IN LOVE", "More than friends now."],
};
var PLAYER_PAIR_MOOD_TAGS = {
  good: ["GET ALONG", "They get along now."],
  none: ["COOLER", "Things cooled down between them."],
  tense: ["TENSION", "Things got tense between them."],
  rivals: ["RIVALS", "They can't stand each other any more."],
  love: ["IN LOVE", "More than friends now."],
};
function describePlayerPairNews(item, personOf, placeName) {
  let [tag, text] = (item.how === "met" ? PLAYER_PAIR_MET_TAGS : PLAYER_PAIR_MOOD_TAGS)[item.mood] ?? ["MET", ""],
    placePhrase = item.place ? atPlacePhrase(item.place, placeName) : "";
  return {
    a: personOf(item.a),
    b: personOf(item.b),
    tag: tag,
    text:
      item.how === "met"
        ? `Met on their own${placePhrase ? ` ${placePhrase}` : ""}. ${text}`
        : `${text}${placePhrase ? ` ${placePhrase[0].toUpperCase()}${placePhrase.slice(1)}.` : ""}`,
  };
}
var atPlacePhrase = (place, placeName) => (place === "home" ? "at home" : `at the ${placeName(place)}`);
var NEWS_TAG_WEIGHTS = {
  TOGETHER: 9,
  SPLIT: 9,
  "IN LOVE": 8,
  ARGUED: 7,
  RIVALS: 7,
  TENSION: 6,
  "DEFENDED YOU": 6,
  COOLER: 5,
  SAW: 5,
  HEARD: 4,
  CLOSER: 4,
  "GET ALONG": 3,
  MET: 1,
};
var factPlaceLabel = (fact, placeName) =>
  !fact.place || (fact.act === "party" && fact.place === "home") ? "" : placeName(fact.place);
function buildWeeklyNewsView(state, news, { nameOf: nameOf, placeName: placeName, metOf: metOf }) {
  let personView = (id) => ({
      id: id,
      name: metOf(id) ? nameOf(id) : "???",
      met: metOf(id),
    }),
    defaultLines = {
      met: (item) => `Met${item.place ? ` ${atPlacePhrase(item.place, placeName)}` : ""}.`,
      friends: (item) => `Became friends${item.place ? `, ${atPlacePhrase(item.place, placeName)}` : ""}.`,
      close: () => "Grew close.",
    },
    weekStart = Math.max(news.ended - 10080, Math.floor((state.startedAt ?? 0) / 1440) * 24 * 60),
    aboutByFact = new Map();
  for (let entry of news.you) {
    let fact = townFactById(state, entry.fact);
    if (!fact) {
      continue;
    }
    let about = aboutByFact.get(entry.fact) ?? {
      fact: entry.fact,
      act: fact.act,
      what: describeTownFact(state, fact, (id) => (metOf(id) ? nameOf(id) : "someone")),
      place: factPlaceLabel(fact, placeName),
      home: fact.place === "home",
      seen: [],
      heard: [],
    };
    about[entry.how === "seen" ? "seen" : "heard"].push({
      ...personView(entry.who),
      ...(entry.how === "heard" && entry.from
        ? {
            from: metOf(entry.from) ? nameOf(entry.from) : "someone",
          }
        : {}),
    });
    aboutByFact.set(entry.fact, about);
  }
  let metPairs = news.between.filter((item) => item.tag === "MET" && metOf(item.a) && metOf(item.b)),
    byPlace = new Map();
  for (let item of metPairs) {
    let place = item.place ?? "",
      people = byPlace.get(place) ?? [];
    for (let id of [item.a, item.b]) {
      if (!people.some((person) => person.id === id)) {
        people.push(personView(id));
      }
    }
    byPlace.set(place, people);
  }
  let front = {
    about: [...aboutByFact.values()].sort(
      (left, right) => right.seen.length + right.heard.length - (left.seen.length + left.heard.length),
    ),
    met: {
      pairs: metPairs.length,
      people: [
        ...new Map(metPairs.flatMap((item) => [item.a, item.b]).map((item) => [item, personView(item)])).values(),
      ],
      places: [...byPlace.entries()].map(([place, people]) => ({
        place: place ? placeName(place) : "",
        ...(place === "home"
          ? {
              home: true,
            }
          : {}),
        people: people,
      })),
    },
  };
  return {
    week: news.week,
    title: `WEEK OF ${formatCalendarDate(Math.max(0, weekStart), {
      from: state.startedAt,
    }).toUpperCase()}`,
    seen: news.seen,
    front: front,
    between: news.between.map((item) => ({
      a: personView(item.a),
      b: personView(item.b),
      tag: item.tag,
      text: item.line || defaultLines[item.code]?.(item) || "",
    })),
    yours: (news.yours ?? []).map((item) =>
      item.how === "defended"
        ? {
            a: personView(item.a),
            b: personView(item.b),
            tag: "DEFENDED YOU",
            text: `${metOf(item.b) ? nameOf(item.b) : "Someone"} heard something about you. ${metOf(item.a) ? nameOf(item.a) : "Someone"} took your side: it hurt less.`,
          }
        : item.how === "met" || item.how === "mood"
          ? describePlayerPairNews(item, personView, placeName)
          : {
              a: personView(item.a),
              b: personView(item.b),
              tag: item.how === "seen" ? "SAW" : "HEARD",
              text:
                item.how === "seen"
                  ? `You saw them together${item.place ? ` ${atPlacePhrase(item.place, placeName)}` : ""}.`
                  : `${metOf(item.from) ? nameOf(item.from) : "Someone"} told you they are seeing each other.`,
            },
    ),
    you: news.you.map((entry) => {
      let fact = townFactById(state, entry.fact),
        what = fact ? describeTownFact(state, fact, (id) => (metOf(id) ? nameOf(id) : "someone")) : "";
      return {
        a: personView(entry.who),
        tag: entry.how === "seen" ? "SAW" : "HEARD",
        text:
          entry.how === "seen"
            ? `Saw ${what}${fact && factPlaceLabel(fact, placeName) ? ` ${atPlacePhrase(fact.place, placeName)}` : ""}.`
            : `Heard from ${metOf(entry.from) ? nameOf(entry.from) : "someone"} about ${what}.`,
      };
    }),
  };
}

export {
  NEWS_TAG_WEIGHTS,
  applyNetworkWeek,
  buildWeeklyNewsView,
  crossedPathsThisWeek,
  networkWeekPrompt,
  parseNetworkWeek,
  possibleWeeklyTells,
};
