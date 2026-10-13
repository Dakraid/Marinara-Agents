// Relationship chart, per-character network sheet, news feed
import { formatCalendarDate } from "../time/clock.mjs";
import { BOND_TIER_NAMES, RELATIONSHIP_STATUS_LABELS, bondTier, bondTierName } from "./bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "./milestones.mjs";
import { PAIR_CLOSENESS_THRESHOLDS, ensureSocialNetwork, npcPairKey } from "../network/npc-pairs.mjs";
import { gossipLinesForPerson, knownFactsAboutPlayer, npcPairsOf } from "../network/town-facts.mjs";
import { NEWS_TAG_WEIGHTS, buildWeeklyNewsView } from "../network/week-news.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { personaPicture } from "../home/furniture-and-wardrobe.mjs";
import { romanticAct } from "../romance/romantic-acts.mjs";
import { isPartner } from "../romance/jealousy.mjs";
import { partnersSheet } from "../romance/multiple-partners.mjs";
import { bondOf, characterOf, hasMet2, nameFor, npcNameAside } from "../game.mjs";

var knownName = (state, characterId) =>
  hasMet2(state, characterId)
    ? nameFor(
        state,
        characterOf(state, characterId) ?? {
          id: characterId,
          name: npcNameAside(state, characterId),
        },
      )
    : "???";
var knownPlaceName = (state, placeId) =>
  placeId === "home" ? "Home" : (townPlace(state.town, placeId)?.name ?? placeId);
function knownKind(state, pair) {
  if (pair.kind !== "couple" || !pair.secret) {
    return pair.kind;
  }
  let pairKey = npcPairKey(pair.a, pair.b);
  return (state.youKnow ?? []).some((known) => npcPairKey(known.a, known.b) === pairKey)
    ? "couple"
    : pair.close >= PAIR_CLOSENESS_THRESHOLDS.close
      ? "close"
      : pair.close >= PAIR_CLOSENESS_THRESHOLDS.friends
        ? "friends"
        : "acquaintances";
}
function relationChart(state) {
  ensureSocialNetwork(state);
  let people = (state.characters ?? [])
      .filter((character) => !character.away && hasMet2(state, character.id))
      .map((character) => {
        let bond = bondOf(state, character.id),
          friendshipTier = bondTier(bond, "friendship"),
          romanceTier = bondTier(bond, "romance"),
          together = isPartner(state, character.id);
        return {
          id: character.id,
          name: knownName(state, character.id),
          ...characterPortrait(character, state),
          friendship: friendshipTier,
          friendshipName: bondTierName(bond, "friendship", friendshipTier),
          romance: romanceTier,
          romanceName: romanceTier ? BOND_TIER_NAMES.romance[romanceTier] : "",
          status: bond?.status && bond.status !== "single" ? RELATIONSHIP_STATUS_LABELS[bond.status] : "",
          together: together,
          likesYou: !together && bond?.status !== "ex" && romanceTier >= 2,
        };
      }),
    metIds = new Set(people.map((person) => person.id)),
    links = Object.values(state.pairs ?? {})
      .filter((pair) => metIds.has(pair.a) && metIds.has(pair.b))
      .map((pair) => ({
        a: pair.a,
        b: pair.b,
        kind: knownKind(state, pair),
        detail: pair.detail ?? null,
        close: Math.round(pair.close ?? 0),
      }));
  return {
    you: {
      name: state.persona?.name ?? "You",
      avatar: personaPicture(state),
    },
    people: people,
    links: links,
  };
}
function networkSheet(state, characterId) {
  ensureSocialNetwork(state);
  let pairs = npcPairsOf(state, characterId).filter(
      (pair) => characterOf(state, pair.other) && !characterOf(state, pair.other).away,
    ),
    metPairs = pairs.filter((pair) => hasMet2(state, pair.other));
  return {
    people: metPairs.map((pair) => ({
      id: pair.other,
      name: knownName(state, pair.other),
      ...characterPortrait(characterOf(state, pair.other), state),
      kind: knownKind(state, pair),
      detail: pair.detail,
      close: Math.round(pair.close),
      note: pair.note,
      from: pair.from,
      place: pair.place ? knownPlaceName(state, pair.place) : "",
      ...(pair.place === "home"
        ? {
            home: true,
          }
        : {}),
    })),
    peopleHidden: pairs.length - metPairs.length,
    knowsYou: knownFactsAboutPlayer(state, characterId, {
      nameOf: (id) => knownName(state, id),
      placeName: (placeId) => knownPlaceName(state, placeId),
    }).map(({ at: at, ...fact }) => fact),
    open: openAgreementsView(state, characterId),
    partners: partnersSheetIfMulti(state, characterId),
  };
}
var partnersSheetIfMulti = (state, characterId) =>
  state.rules?.multipleRelationships ? partnersSheet(state, characterId) : null;
var namesKnown = (state, ids = []) => ids.map((id) => knownName(state, id));
var openAgreementsView = (state, characterId) => {
  let open = bondOf(state, characterId)?.open,
    rowsFor = (side) =>
      Object.entries(open?.[side] ?? {}).map(([id, since]) => ({
        id: id,
        name: id === "*" ? "Anyone" : knownName(state, id),
        since: formatCalendarDate(since, {
          from: state.startedAt,
        }).replace(/ · Year \d+$/, ""),
      })),
    yours = rowsFor("you"),
    theirs = rowsFor("them");
  return yours.length || theirs.length
    ? {
        you: yours,
        them: theirs,
      }
    : null;
};
function knownForModel(state, characterId) {
  let bond = bondOf(state, characterId),
    romantic =
      !!bond &&
      (MILESTONE_COUPLE_STATUSES.includes(bond.status) ||
        (bond.romanceable !== false && !bond.justFriends && bondTier(bond, "romance") >= 2)),
    talkedSince = (fact) => !!fact.with && (bond?.talked?.[fact.with] ?? -1) >= fact.at;
  return gossipLinesForPerson(state, characterId, {
    nameOf: (id) => characterOf(state, id)?.name ?? npcNameAside(state, id),
    placeName: (placeId) => knownPlaceName(state, placeId),
    skip: (fact) =>
      romantic && romanticAct(state, fact.act) && !!fact.with && fact.with !== characterId && !talkedSince(fact),
    talked: talkedSince,
  });
}
function newsOf(state) {
  ensureSocialNetwork(state);
  let namers = {
    nameOf: (id) => knownName(state, id),
    placeName: (placeId) => knownPlaceName(state, placeId),
    metOf: (id) => hasMet2(state, id),
  };
  return [...state.news].reverse().map((week) => {
    let view = buildWeeklyNewsView(state, week, namers),
      between = view.between.filter((story) => story.a.met && story.b.met),
      weightOf = (story) => NEWS_TAG_WEIGHTS[story.tag] ?? 2,
      stories = [...between.filter((first) => first.tag !== "MET"), ...view.yours].sort(
        (first, second) => weightOf(second) - weightOf(first),
      ),
      caresAbout = (id) => {
        let bond = bondOf(state, id);
        return (
          !!bond &&
          (["dating", "partners", "living", "engaged", "married"].includes(bond.status) ||
            bondTier(bond, "romance") >= 2)
        );
      },
      about = view.front.about.map((story) =>
        romanticAct(state, story.act)
          ? {
              ...story,
              seen: story.seen.map((person) => ({
                ...person,
                cares: caresAbout(person.id),
              })),
              heard: story.heard.map((person) => ({
                ...person,
                cares: caresAbout(person.id),
              })),
            }
          : story,
      );
    return {
      ...view,
      between: between,
      front: {
        ...view.front,
        about: about,
        stories: stories,
      },
    };
  });
}
function markNewsSeen(state, week) {
  for (let entry of state.news ?? []) {
    if (week === undefined || entry.week === Number(week)) {
      entry.seen = true;
    }
  }
  return {
    ok: true,
  };
}

export { knownForModel, knownKind, knownName, markNewsSeen, namesKnown, networkSheet, newsOf, relationChart };
