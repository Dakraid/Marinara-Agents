// Jealousy, couples, lies, confrontations, scene bystanders
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { TRAIT_BEHAVIOURS, relationshipProfile } from "../traits/traits.mjs";
import { bondTier, hasMet, isFormerRival, markTraitsSeen, trustCushion } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { kinWordFor } from "../relationships/kin.mjs";
import { ITEM_CATALOG } from "../items/catalog.mjs";
import { npcPairBetween, npcPairKey, PAIR_ROMANCE_COUPLE_THRESHOLD, pairWordFor } from "../network/npc-pairs.mjs";
import { FACT_ACT_PHRASES, personKnowsFact } from "../network/town-facts.mjs";
import { applyNetworkWeek, crossedPathsThisWeek, possibleWeeklyTells } from "../network/week-news.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { sumModuleHook } from "../modules/module-registry.mjs";
import { envied } from "../social/rich-impressions.mjs";
import { defenderAgainst, keepsSecretFor } from "../relationships/friend-perks.mjs";
import { witnesses } from "../social/witnesses.mjs";
import { knownName } from "../relationships/network-sheet.mjs";
import { approachDue, knobsOf, romanticAct } from "./romantic-acts.mjs";
import { likeEachOther } from "./romanceability.mjs";
import { agreedPair, partnersAbout } from "./multiple-partners.mjs";
import { proposeAbout } from "./proposal.mjs";
import { opinionAbout, youMaySee } from "../relationships/friend-opinion.mjs";
import { bondOf, castInTown, characterOf, hasMet2, npcNameAside, traitsOf } from "../game.mjs";

var HEARD_SITS_DAYS = [1, 3];
var togetherAt = (bond) => bond?.togetherSince ?? bond?.statusSince ?? 0;
function staleJealous(state) {
  for (let bond of Object.values(state.bonds ?? {})) {
    let jealousy = bond.jealous;
    if (!jealousy || !MILESTONE_COUPLE_STATUSES.includes(bond.status)) {
      continue;
    }
    let fact = (state.facts ?? []).find((candidate) => candidate.id === jealousy.fact);
    if (!(!fact || fact.at >= togetherAt(bond))) {
      bond.jealous = null;
      if (
        bond.asks?.id === "jealous" &&
        !(state.scene && !state.scene.done && state.scene.characterId === bond.characterId)
      ) {
        bond.asks = null;
      }
    }
  }
}
var PARTNER_STATUS_ACTS = ["dating", "partners", "living", "engaged", "married"];
function settleAgreements(state) {
  if (!state.rules?.multipleRelationships) {
    return;
  }
  let partnerBonds = Object.values(state.bonds ?? {}).filter(
    (bond) => MILESTONE_COUPLE_STATUSES.includes(bond.status) && characterOf(state, bond.characterId),
  );
  if (partnerBonds.length < 2) {
    return;
  }
  let factById = (factId) => (state.facts ?? []).find((fact) => fact.id === factId);
  for (let bond of partnerBonds) {
    let steppedAt = bond.stepAt ?? togetherAt(bond);
    for (let otherBond of partnerBonds) {
      if (
        otherBond === bond ||
        bond.openAgreement ||
        (bond.open?.you && (otherBond.characterId in bond.open.you || "*" in bond.open.you)) ||
        bond.jealous?.with === otherBond.characterId ||
        (bond.lies ?? []).some((lie) => factById(lie.fact)?.with === otherBond.characterId)
      ) {
        continue;
      }
      if (
        (state.knows?.[bond.characterId] ?? []).some((known) => {
          let fact = factById(known.fact);
          return (
            fact &&
            fact.with === otherBond.characterId &&
            PARTNER_STATUS_ACTS.includes(fact.act) &&
            fact.at >= (otherBond.togetherSince ?? -1 / 0) &&
            (known.at ?? fact.at) <= steppedAt
          );
        })
      ) {
        bond.open = {
          ...(bond.open ?? {}),
          you: {
            ...(bond.open?.you ?? {}),
            [otherBond.characterId]: steppedAt,
          },
        };
      }
    }
  }
}
function feelJealous(state, characterId, factId, how, from = null) {
  if (!state.rules?.jealousy) {
    return null;
  }
  let bond = bondOf(state, characterId),
    fact = (state.facts ?? []).find((candidate) => candidate.id === factId);
  if (
    !bond ||
    !hasMet(bond) ||
    !fact ||
    !romanticAct(state, fact.act) ||
    !fact.with ||
    fact.with === characterId ||
    youMaySee(state, characterId, fact.with)
  ) {
    return null;
  }
  let together = MILESTONE_COUPLE_STATUSES.includes(bond.status);
  if (
    (together && fact.at < togetherAt(bond)) ||
    !(together || (bond.romanceable !== false && !bond.justFriends && bondTier(bond, "romance") >= 2))
  ) {
    return null;
  }
  let jealousyKnob = knobsOf(bond).jealousy ?? 1,
    cheated = together;
  if (!cheated && jealousyKnob < (together ? 1 : 2)) {
    markTraitsSeen(bond, "jealousy");
    return null;
  }
  let weight =
    (cheated ? 10 : 0) +
    (how === "seen" ? 2 : 1) +
    jealousyKnob +
    (bond.caughtLying?.with === fact.with ? 5 : 0) +
    sumModuleHook(state, "factWeight", fact);
  if (bond.jealous && bond.jealous.weight >= weight) {
    return null;
  }
  let lied = bond.caughtLying?.with === fact.with;
  bond.jealous = {
    fact: fact.id,
    act: fact.act,
    with: fact.with,
    how: how,
    from: from,
    cheat: cheated,
    weight: weight,
    lied: lied,
    at: state.minutes,
  };
  markTraitsSeen(bond, "jealousy");
  let delayMinutes =
    how === "seen"
      ? 0
      : Math.round(
          (HEARD_SITS_DAYS[0] +
            seededRandom(state.seed, characterId, fact.id, "sits") * (HEARD_SITS_DAYS[1] - HEARD_SITS_DAYS[0])) *
            24 *
            60,
        );
  raiseAsk(state, bond, {
    id: "jealous",
    at: state.minutes,
    due: approachDue(bond, state.minutes + delayMinutes, {
      seen: how === "seen",
    }),
  });
  return bond.jealous;
}
function raiseAsk(state, bond, ask) {
  let scene = state.scene;
  if (scene && !scene.done && scene.characterId === bond.characterId && bond.asks && scene.milestone === bond.asks.id) {
    bond.asksAfter = ask;
    return;
  }
  if (bond.asks && bond.asks.id !== ask.id) {
    bond.asksAfter ??= bond.asks;
  }
  bond.asks = ask;
}
var ROMANCE_SPEED_FACTOR = [0.5, 0.8, 1.1, 1.4];
var isPartner = (state, characterId) => MILESTONE_COUPLE_STATUSES.includes(state.bonds?.[characterId]?.status);
var agreedFor = (state, characterId, otherId) =>
  !!(
    state.bonds?.[characterId]?.open?.them &&
    (otherId in state.bonds[characterId].open.them || "*" in state.bonds[characterId].open.them)
  );
var coupleOf = (state, characterId) =>
  Object.values(state.pairs ?? {}).find(
    (pair) => pair.kind === "couple" && (pair.a === characterId || pair.b === characterId),
  ) ?? null;
var otherIn = (pair, characterId) => (pair.a === characterId ? pair.b : pair.a);
function romanceBetween(state, first, second, pair) {
  let refusesRomance = (character) => (character.castRomance ?? character.romanceable) === false;
  if (
    !state.rules?.castCouples ||
    pair.kind === "family" ||
    refusesRomance(first) ||
    refusesRomance(second) ||
    (state.bonds?.[first.id]?.kin && state.bonds?.[second.id]?.kin) ||
    !likeEachOther(state, first.id, second.id)
  ) {
    return 0;
  }
  let factor = 1;
  for (let [member, other] of [
    [first, second],
    [second, first],
  ]) {
    let couple = coupleOf(state, member.id);
    if (couple && npcPairKey(couple.a, couple.b) !== npcPairKey(first.id, second.id)) {
      return 0;
    }
    if (
      ((factor *=
        ROMANCE_SPEED_FACTOR[
          relationshipProfile(
            state.bonds?.[member.id] ?? {
              archetype: member.archetype,
            },
          ).knobs.romanceSpeed ?? 1
        ] ?? 1),
      isPartner(state, member.id) && !agreedFor(state, member.id, other.id) && !agreedPair(state, member.id, other.id))
    ) {
      if (!state.rules.partnersStray) {
        return 0;
      }
      let bond = state.bonds[member.id];
      factor *= TRAIT_BEHAVIOURS.stray(traitsOf(state, member.id)) * (bond.trust < 30 || bond.driftOwed ? 1.5 : 1);
    }
  }
  return factor;
}
function defendedFactor(state, characterId) {
  let defender = defenderAgainst(state, characterId);
  return defender
    ? ((state.week.yours ??= []).push({
        a: defender,
        b: characterId,
        how: "defended",
      }),
      0.5)
    : 1;
}
var cheatingPair = (state, pair) =>
  !agreedPair(state, pair.a, pair.b) &&
  ((isPartner(state, pair.a) && !agreedFor(state, pair.a, pair.b)) ||
    (isPartner(state, pair.b) && !agreedFor(state, pair.b, pair.a)));
var crossedPaths = (state) =>
  crossedPathsThisWeek(state).map((crossing) => {
    let pair = npcPairBetween(state, crossing.a, crossing.b),
      isSingle = (characterId) => !coupleOf(state, characterId),
      canTogether =
        !!state.rules?.castCouples &&
        pair.kind !== "couple" &&
        (pair.romance ?? 0) >= PAIR_ROMANCE_COUPLE_THRESHOLD &&
        isSingle(crossing.a) &&
        isSingle(crossing.b) &&
        romanceBetween(state, characterOf(state, crossing.a) ?? {}, characterOf(state, crossing.b) ?? {}, pair) > 0;
    return {
      ...crossing,
      canTogether: canTogether,
    };
  });
function learnYou(state, first, second, { how: how, from = null, place = null, at = state.minutes, sure = false }) {
  state.youKnow ??= [];
  let pairKey = npcPairKey(first, second),
    existing = state.youKnow.find((known) => npcPairKey(known.a, known.b) === pairKey && !known.confronted);
  return existing
    ? (how === "seen" &&
        existing.how !== "seen" &&
        Object.assign(existing, {
          how: how,
          place: place,
          at: at,
        }),
      sure && (existing.sure = true),
      false)
    : (state.youKnow.push({
        a: first,
        b: second,
        how: how,
        from: from,
        place: place,
        at: at,
        confronted: false,
        ...(sure
          ? {
              sure: true,
            }
          : {}),
      }),
      true);
}
function secretCoupleTips(state) {
  let weekDone = state.weekDone;
  if (!weekDone) {
    return [];
  }
  let tips = [];
  for (let pair of Object.values(state.pairs ?? {})) {
    if (!(
      pair.kind !== "couple" ||
      !pair.secret ||
      (state.youKnow ?? []).some(
        (known) => npcPairKey(known.a, known.b) === npcPairKey(pair.a, pair.b) && !known.confronted,
      )
    )) {
      for (let character of castInTown(state)) {
        if (!(
          character.id === pair.a ||
          character.id === pair.b ||
          !hasMet2(state, character.id) ||
          bondTier(bondOf(state, character.id), "friendship") < 2 ||
          (!weekDone.hours?.[npcPairKey(character.id, pair.a)] && !weekDone.hours?.[npcPairKey(character.id, pair.b)])
        )) {
          tips.push({
            from: character.id,
            to: "you",
            a: pair.a,
            b: pair.b,
          });
        }
      }
    }
  }
  return tips.slice(0, 10);
}
var tellsFor = (state) => [
  ...possibleWeeklyTells(state).filter((tell) => !keepsSecretFor(state, tell.from)),
  ...secretCoupleTips(state),
];
var heardOf = (state, characterId) =>
  (state.youKnow ?? []).find(
    (known) =>
      !known.confronted &&
      (known.a === characterId || known.b === characterId) &&
      isPartner(state, characterId) &&
      !agreedFor(state, characterId, otherIn(known, characterId)),
  ) ?? null;
var settledPair = (state, first, second) =>
  agreedFor(state, first, second) ||
  (state.youKnow ?? []).some((known) => known.confronted && npcPairKey(known.a, known.b) === npcPairKey(first, second));
function standingWords(state, characterId) {
  let bond = bondOf(state, characterId);
  if (!bond) {
    return "";
  }
  let nameOf = (id) => characterOf(state, id)?.name ?? "someone",
    parts = [
      bond.kin
        ? `Family: the player's ${kinWordFor(bond.kin, characterOf(state, characterId)?.gender ?? null)}; nothing romantic, ever`
        : ({
            married: "Married: the player's spouse",
            engaged: "Engaged to the player",
            living: "Partners, living together",
            partners: "Partners: a couple",
            dating: "Dating: a couple, still new",
            ex: `Ex: they were together and broke up${bond.brokeUp?.how === "cheated" ? " over a betrayal" : ""}; they are not together now`,
          }[bond.status] ?? "Not a couple"),
    ];
  if (bond.justFriends && !bond.kin) {
    parts.push("Just friends: they agreed on it, nothing romantic between them");
  }
  if (isFormerRival(bond)) {
    parts.push("they used to be the player's rival; they do not compete any more");
  }
  let youOpen = Object.keys(bond.open?.you ?? {}),
    themOpen = Object.keys(bond.open?.them ?? {});
  if (bond.openAgreement || youOpen.length) {
    parts.push(
      `agreed: the player may see ${bond.openAgreement || youOpen.includes("*") ? "other people" : youOpen.map(nameOf).join(" and ")}`,
    );
  }
  if (themOpen.length) {
    parts.push(`agreed: they may see ${themOpen.includes("*") ? "other people" : themOpen.map(nameOf).join(" and ")}`);
  }
  return `What they are to the player: ${parts.join(" \xB7 ")}.`;
}
function withWhom(state, characterId) {
  let couple = coupleOf(state, characterId);
  if (!couple || couple.secret) {
    return null;
  }
  let partnerId = otherIn(couple, characterId);
  return hasMet2(state, characterId) && hasMet2(state, partnerId)
    ? {
        id: partnerId,
        name: knownName(state, partnerId),
      }
    : null;
}
function agreesToOpen(state, scene, accepted) {
  let bond = bondOf(state, scene.characterId),
    withId = scene.about?.with,
    pair = withId ? npcPairBetween(state, scene.characterId, withId) : null;
  if (!withId || ["rivals", "ex"].includes(pair?.kind)) {
    return false;
  }
  let jealousyKnob = knobsOf(bond).jealousy ?? 1;
  if (jealousyKnob >= 3) {
    return false;
  }
  let trustNeeded = [0, 50, 70][jealousyKnob];
  return accepted && bond.trust >= trustNeeded;
}
var MARRY_TRUST_MORE = 10;
function agreesToMarry(state, scene, accepted) {
  if (!agreesToOpen(state, scene, accepted)) {
    return false;
  }
  let bond = bondOf(state, scene.characterId);
  return bond.trust >= [0, 50, 70][knobsOf(bond).jealousy ?? 1] + MARRY_TRUST_MORE;
}
var learnedFact = (state, characterIds, factId, how, from = null) =>
  characterIds.filter((characterId) => {
    catchLie(state, characterId, factId);
    hurtByRumor(state, characterId, factId);
    let jealous = !!feelJealous(state, characterId, factId, how, from);
    envied(
      state,
      characterId,
      (state.facts ?? []).find((fact) => fact.id === factId),
    );
    return stayAwayFromPartner(state, characterId, factId, how, from) || jealous;
  });
var NEGATIVE_ASKS = ["jealous", "talk", "stay-away"];
function hurtByRumor(state, characterId, factId) {
  let fact = (state.facts ?? []).find((candidate) => candidate.id === factId);
  if (fact?.act !== "rumor" || (fact.with !== characterId && fact.about !== characterId)) {
    return false;
  }
  let bond = bondOf(state, characterId);
  if (!bond || !hasMet(bond)) {
    return false;
  }
  let hurt = [8, 6, 5, 4][knobsOf(bond).forgiveness ?? 2] ?? 5,
    defended = defendedFactor(state, characterId);
  hurtBond(bond, {
    friendship: -hurt * defended,
    trust: -hurt * defended,
  });
  return true;
}
var forgivenessOf = (bond, { betrayal = false } = {}) =>
  betrayal && relationshipProfile(bond).rules.betrayalUnforgiven ? 0 : (knobsOf(bond).forgiveness ?? 2);
var hurtBond = (bond, deltas) => {
  let cushion = trustCushion(bond);
  for (let [key, delta] of Object.entries(deltas)) {
    bond[key] = Math.max(0, (bond[key] ?? 0) + (delta < 0 ? delta * cushion * (bond.stakes ? 2 : 1) : delta));
  }
};
function catchLie(state, characterId, factId) {
  let bond = bondOf(state, characterId),
    fact = (state.facts ?? []).find((candidate) => candidate.id === factId);
  if (!bond?.lies?.length || !fact?.with || !romanticAct(state, fact.act)) {
    return false;
  }
  let lie = bond.lies.find(
    (entry) => (state.facts ?? []).find((candidate) => candidate.id === entry.fact)?.with === fact.with,
  );
  if (!lie) {
    return false;
  }
  bond.lies = bond.lies.filter((entry) => entry !== lie);
  let forgiveness = forgivenessOf(bond, {
    betrayal: true,
  });
  bond.trust = Math.max(0, bond.trust - ([12, 10, 8, 6][forgiveness] ?? 8));
  bond.romance = Math.max(0, bond.romance - 2);
  bond.caughtLying = {
    with: fact.with,
    at: state.minutes,
  };
  return true;
}
function stayAwayFromPartner(state, characterId, factId, how = "seen", from = null) {
  let fact = (state.facts ?? []).find((candidate) => candidate.id === factId);
  if (!fact?.with || !romanticAct(state, fact.act)) {
    return false;
  }
  let pair = npcPairBetween(state, characterId, fact.with);
  if (pair?.kind !== "couple") {
    return false;
  }
  let bond = bondOf(state, characterId),
    promised = bond?.promised?.with === fact.with,
    defended = defendedFactor(state, characterId);
  if (bond) {
    hurtBond(bond, {
      friendship: (promised ? -6 : -3) * defended,
      trust: (promised ? -6 : -2) * defended,
    });
  }
  pair.close = Math.max(0, pair.close - 6);
  return !bond || !hasMet(bond) || (bond.asks && NEGATIVE_ASKS.includes(bond.asks.id))
    ? false
    : ((bond.stayAway = {
        fact: fact.id,
        act: fact.act,
        with: fact.with,
        how: how,
        from: from,
        broken: promised,
        at: state.minutes,
      }),
      raiseAsk(state, bond, {
        id: "stay-away",
        with: fact.with,
        at: state.minutes,
        due: approachDue(bond, state.minutes, {
          seen: how === "seen",
        }),
      }),
      true);
}
function settleWeek(state, week, options = {}) {
  let result = applyNetworkWeek(state, week, {
    ...options,
    secretOf: (pair) => cheatingPair(state, pair),
    learnYou: (tell, at) =>
      learnYou(state, tell.a, tell.b, {
        how: "heard",
        from: tell.from,
        at: at,
      }),
  });
  for (let learned of result?.you ?? []) {
    if (learned.how === "heard") {
      learnedFact(state, [learned.who], learned.fact, "heard", learned.from);
    }
  }
  return result;
}
function jealousAbout(state, scene) {
  if (
    [
      "partners-meet",
      "meet-ask",
      "her-or-me",
      "partners-tease",
      "partners-compete",
      "partners-argue",
      "partners-plan",
    ].includes(scene?.milestone)
  ) {
    return partnersAbout(state, scene);
  }
  if (scene?.milestone === "propose") {
    return proposeAbout(state, scene);
  }
  if (scene?.milestone === "friend-opinion") {
    return opinionAbout(state, scene);
  }
  let about = scene?.about;
  if (!about) {
    return "";
  }
  let nameOf = (id) => characterOf(state, id)?.name ?? npcNameAside(state, id),
    toldPlayer = (from) =>
      from && characterOf(state, from) ? `${nameOf(from)} told the player` : "someone told the player",
    toldThem = (from) =>
      from === "you"
        ? "the player told them"
        : from && characterOf(state, from)
          ? `${nameOf(from)} told them`
          : "someone told them";
  if (about.ask) {
    let pair = npcPairBetween(state, scene.characterId, about.with);
    return `The person the player asks about: ${nameOf(about.with)}${pair ? ` (to them: ${pairWordFor(pair, scene.characterId)})` : ""}.`;
  }
  if (about.confront) {
    let pair = npcPairBetween(state, scene.characterId, about.with),
      stray =
        about.sure ||
        (state.meets ?? []).some(
          (meet) => meet.kind === "stray" && npcPairKey(meet.a, meet.b) === npcPairKey(scene.characterId, about.with),
        );
    return [
      `What the player found out: they and ${nameOf(about.with)} ${pair?.kind === "couple" || stray ? "are seeing each other" : "have grown close"} (${about.how === "seen" ? "the player saw them together" : about.how === "guessed" ? "the player worked it out, and just said it" : toldPlayer(about.from)}).${pair?.kind === "couple" || stray ? " It is true." : ""}`,
      about.denies
        ? "They deny it: the player did not see it with their own eyes. They lie, convincingly, true to who they are."
        : "",
      about.how === "seen" && stray ? "The player saw it: they cannot deny it." : "",
      about.lied ? "They denied it to the player once already: now the player knows it was a lie." : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (about.tells) {
    let partnerId = isPartner(state, about.a) ? about.a : about.b,
      clock = clockFromMinutes(about.at ?? state.minutes);
    return `What they saw: ${nameOf(partnerId)}, the player's partner, with ${nameOf(partnerId === about.a ? about.b : about.a)}, ${clock.weekday} at ${formatClockTime(about.at ?? state.minutes)}, at ${townPlace(state.town, about.place)?.name ?? "a place in town"}: flirting, very close. It is true.`;
  }
  if (about.dropBy) {
    return `Why they came: ${about.text}`;
  }
  if (about.talk) {
    return `Why: ${about.why} That is the whole of it. Nothing else happened: neither of them cheated, lied or did anything behind the other's back, unless it is told here or in what they know about the player.`;
  }
  if (about.mate) {
    return `What happens: ${about.text}`;
  }
  if (about.party) {
    return about.text;
  }
  if (about.gift) {
    return `The surprise they bring: ${ITEM_CATALOG[about.item]?.name?.toLowerCase() ?? "something small"}.`;
  }
  if (about.money) {
    return `The player is $${about.amount} short for the rent, due tomorrow; they offer that much, as a loan.`;
  }
  if (about.who) {
    return `Who they saw the player talking with: ${nameOf(about.with)}, at ${townPlace(state.town, about.place)?.name ?? "a place in town"}. Nothing romantic happened; they only saw them talking.`;
  }
  if (about.hitOn) {
    return `Who hit on them: ${nameOf(about.with)}, at ${townPlace(state.town, about.place)?.name ?? "a place in town"}. They turned ${nameOf(about.with)} down, and they are telling the player first.`;
  }
  if (about.other) {
    let knew = (state.facts ?? []).some(
      (fact2) =>
        ["dating", "partners", "living"].includes(fact2.act) &&
        fact2.with === about.with &&
        personKnowsFact(state, scene.characterId, fact2.id),
    );
    return `The player's partner: ${nameOf(about.with)}, whom they have been seeing (${about.how === "seen" ? "the player saw them together" : about.how === "guessed" ? "the player worked it out" : toldPlayer(about.from)}). ${knew ? `They knew ${nameOf(about.with)} is with the player.` : `They may not have known ${nameOf(about.with)} is with the player.`}`;
  }
  if (about.theirAsk) {
    return `The person they have feelings for: ${nameOf(about.with)}.`;
  }
  if (about.outing || about.own || about.plain) {
    return about.text ?? "";
  }
  if (about.stayAway) {
    let fact2 = (state.facts ?? []).find((candidate) => candidate.id === about.fact);
    return [
      `What they found out: ${fact2 ? `the player ${FACT_ACT_PHRASES[fact2.act]?.(nameOf(fact2.with)) ?? fact2.act}` : `the player going after ${nameOf(about.with)}`}, and ${nameOf(about.with)} is the person they are with (${about.how === "seen" ? "they saw it themselves" : toldThem(about.from)}).`,
      about.broken ? "The player had promised them to back off." : "",
      eventCast(scene).includes(about.with) ? `${nameOf(about.with)} is right there, in the scene.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (scene.milestone && scene.milestone !== "jealous") {
    return "";
  }
  let fact = (state.facts ?? []).find((candidate) => candidate.id === about.fact);
  return [
    `What they found out: ${fact ? `the player ${FACT_ACT_PHRASES[fact.act]?.(nameOf(fact.with)) ?? fact.act}${fact.place ? ` at ${townPlace(state.town, fact.place)?.name ?? fact.place}` : ""}` : "the player with someone else"} (${about.how === "seen" ? "they saw it themselves" : toldThem(about.from)}).`,
    fact &&
    MILESTONE_COUPLE_STATUSES.includes(bondOf(state, scene.characterId)?.status) &&
    fact.at < togetherAt(bondOf(state, scene.characterId))
      ? "It happened before the two of them were together: it is not cheating, it is the past."
      : about.cheat
        ? "They are together, with no agreement to see others: to them it is cheating."
        : "",
    about.lied ? "The player denied it to them once already: now they know it was a lie." : "",
    eventCast(scene).includes(about.with) ? `${nameOf(about.with)} is right there, in the scene.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
function jealousOutcome(state, scene, choice, believed) {
  let about = scene.about ?? {},
    forgiveness = forgivenessOf(bondOf(state, scene.characterId), {
      betrayal: !!about.cheat,
    }),
    lieBelieved = choice === "deny" && believed,
    trustDelta,
    romanceDelta;
  if (choice === "deny") {
    [trustDelta, romanceDelta] = lieBelieved ? [0, 0] : about.cheat ? [-10, -4] : [-6, -2];
  } else if (choice === "apologize") {
    [trustDelta, romanceDelta] = about.cheat ? [believed ? -4 : -6, -2] : [believed ? -1 : -2, 0];
  } else {
    [trustDelta, romanceDelta] = about.cheat ? [believed ? -3 : -7, -2] : [believed ? 0 : -3, -1];
  }
  let dating = bondOf(state, scene.characterId)?.status === "dating",
    ends = !!about.cheat && !lieBelieved && (forgiveness <= 1 || (forgiveness === 2 && !believed && !dating)),
    withdraws = !!relationshipProfile(bondOf(state, scene.characterId)).rules.jealousyWithdraws;
  return {
    trust: trustDelta,
    romance: withdraws ? 0 : romanceDelta,
    friendship: withdraws ? romanceDelta : 0,
    believed: lieBelieved,
    lie: choice === "deny",
    ends: ends,
  };
}
function hereRow(state, castIds = []) {
  let excluded = new Set(castIds.filter(Boolean)),
    leadId = castIds[0] ?? null,
    partnerIds = Object.keys(state.bonds ?? {}).filter((characterId) => isPartner(state, characterId));
  return witnesses(state)
    .filter((characterId) => !excluded.has(characterId))
    .map((characterId) => {
      let met = hasMet2(state, characterId),
        bond = bondOf(state, characterId),
        closePartner = partnerIds.find(
          (partnerId) =>
            partnerId !== characterId &&
            ["close", "family"].includes(npcPairBetween(state, characterId, partnerId)?.kind),
        ),
        why = met
          ? isPartner(state, characterId)
            ? "your partner"
            : bond && bondTier(bond, "romance") >= 2
              ? "likes you"
              : leadId && npcPairBetween(state, characterId, leadId)?.kind === "couple"
                ? `${knownName(state, leadId)}'s partner`
                : closePartner
                  ? `close to ${knownName(state, closePartner)}`
                  : ""
          : "";
      return {
        id: characterId,
        met: met,
        name: knownName(state, characterId),
        why: why,
      };
    });
}
var sceneCastIds = (scene) => [
  scene.characterId,
  ...(scene.cast ?? []),
  ...(scene.group ?? []).map((member) => member?.id ?? member),
  scene.interrupt?.id,
];
function hereScene(state) {
  if (state.outing && !state.outing.done) {
    return state.outing.kind === "honeymoon" ? null : state.outing;
  }
  let scene = state.scene;
  return scene && !scene.done ? scene : null;
}
function noteHere(state) {
  let scene = hereScene(state);
  if (!scene) {
    return;
  }
  let ids = hereRow(state, sceneCastIds(scene)).map((row) => row.id),
    previousIds = scene.here?.ids;
  if (!previousIds) {
    scene.here = {
      ids: ids,
      came: [],
      left: [],
      at: scene.exchange ?? 0,
    };
    return;
  }
  let came = ids.filter((id) => !previousIds.includes(id)),
    left = previousIds.filter((id) => !ids.includes(id));
  if (came.length || left.length) {
    scene.here = {
      ids: ids,
      came: came,
      left: left,
      at: scene.exchange ?? 0,
    };
  }
}
function hereView(state, scene = hereScene(state)) {
  if (!scene || scene !== hereScene(state)) {
    return null;
  }
  let people = hereRow(state, sceneCastIds(scene)),
    fresh = scene.here && scene.here.at === (scene.exchange ?? 0),
    rowFor = (id) =>
      people.find((row) => row.id === id) ?? {
        id: id,
        met: hasMet2(state, id),
        name: knownName(state, id),
        why: "",
      };
  return {
    people: people,
    came: fresh ? scene.here.came.map(rowFor) : [],
    left: fresh
      ? scene.here.left.map((id) => ({
          id: id,
          name: knownName(state, id),
          met: hasMet2(state, id),
        }))
      : [],
  };
}

export {
  HEARD_SITS_DAYS,
  MARRY_TRUST_MORE,
  NEGATIVE_ASKS,
  agreedFor,
  agreesToMarry,
  agreesToOpen,
  coupleOf,
  crossedPaths,
  feelJealous,
  forgivenessOf,
  heardOf,
  hereRow,
  hereView,
  hurtBond,
  isPartner,
  jealousAbout,
  jealousOutcome,
  learnYou,
  learnedFact,
  noteHere,
  otherIn,
  raiseAsk,
  romanceBetween,
  settleAgreements,
  settleWeek,
  settledPair,
  staleJealous,
  standingWords,
  tellsFor,
  togetherAt,
  withWhom,
};
