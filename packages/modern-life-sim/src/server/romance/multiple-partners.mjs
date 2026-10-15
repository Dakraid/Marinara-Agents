// Multiple partners: meetings, moods, three-way scenes, her-or-me
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { adjustBondAxis, applyBondAction, bondTier } from "../relationships/bonds.mjs";
import {
  INITIATIVE_ASK_CHANCES,
  MILESTONE_COUPLE_STATUSES,
  PARTNER_PAIR_MILESTONES,
} from "../relationships/milestones.mjs";
import { ensureSocialNetwork, npcPairBetween, npcPairKey, pairBothWords } from "../network/npc-pairs.mjs";
import { introduceNpcPair } from "../network/town-facts.mjs";
import { MAX_PLANS, OUTING_KINDS } from "../outings/outing-rules.mjs";
import { dateTastesFor } from "../outings/date-tastes.mjs";
import { OUTING_PLACES, availableOutingPlaces, outingPlaceHome } from "../outings/outing-places.mjs";
import { skillRollChance } from "../outings/outing-scoring.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { isHallPlace, isStreetPlace } from "../town/places.mjs";
import { isResidencePlace, townPlace } from "../town/town-layout.mjs";
import {
  AT_YOURS_SHARE,
  activePlans,
  busyForPlans,
  createGroupPlan,
  hoursFor,
  planWith,
  yourBusy,
} from "../plans/plans.mjs";
import { breakUpWith } from "../home/housemates.mjs";
import { approachDue, knobsOf } from "./romantic-acts.mjs";
import { hurtBond } from "./jealousy.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  isCharacterHere,
  nameFor,
  npcNameAside,
  sharesYourDoor,
  skillLevelsOf,
  traitsOf,
} from "../game.mjs";

var PARTNERS_DAY_MINUTES = 1440;
var TENSE_AT = 25;
var RIVALS_AT = 60;
var GOOD_CLOSE_AT = 35;
var leanOf = (state, characterId) => TRAIT_BEHAVIOURS.lean(traitsOf(state, characterId));
var givesUltimatum = (state, characterId) => TRAIT_BEHAVIOURS.ultimatum(traitsOf(state, characterId));
var ULTIMATUM_CALM_DAYS = 14;
var MEET_ASK_AGAIN_DAYS = 7;
var GROUP_MAX = 3;
var THREE_EVERY_DAYS = 7;
var THREE_CALLS = PARTNER_PAIR_MILESTONES;
var AFTER_EXCHANGES = 2;
var THREE_EFFECTS = {
  tease: {
    play: {
      friendship: 1,
      close: 2,
    },
    won: {
      friendship: 3,
      close: 5,
    },
  },
  compete: {
    pick: {
      friendship: 2,
      otherTrust: -3,
      tension: 10,
    },
    won: {
      friendship: 1,
      tension: -10,
    },
    lost: {
      trust: -2,
    },
  },
  argue: {
    pick: {
      trust: 2,
      otherTrust: -4,
      tension: 10,
    },
    won: {
      tension: -20,
    },
    lost: {
      trust: -1,
      tension: 10,
    },
  },
  plan: {
    no: {
      friendship: -1,
    },
  },
};
var openToSee = (state, characterId, otherId) => {
  let openYou = bondOf(state, characterId)?.open?.you;
  return !!openYou && (otherId in openYou || "*" in openYou);
};
var isCountedPartner = (state, characterId) => {
  let bond = bondOf(state, characterId),
    character = characterOf(state, characterId);
  return (
    !!bond &&
    !!character &&
    !character.away &&
    hasMet2(state, characterId) &&
    MILESTONE_COUPLE_STATUSES.includes(bond.status)
  );
};
function agreedPair(state, first, second) {
  return !state.rules?.multipleRelationships || first === second
    ? false
    : isCountedPartner(state, first) &&
        isCountedPartner(state, second) &&
        openToSee(state, first, second) &&
        openToSee(state, second, first);
}
function yourGroup(state) {
  let partnerIds = castInTown(state)
    .map((character) => character.id)
    .filter((id) => isCountedPartner(state, id));
  return partnerIds.filter((id) => partnerIds.some((otherId) => agreedPair(state, id, otherId)));
}
var otherPartnersOf = (state, characterId) =>
  yourGroup(state).filter((otherId) => otherId !== characterId && agreedPair(state, characterId, otherId));
function ensurePair(state, first, second, place = null) {
  ensureSocialNetwork(state);
  if (!npcPairBetween(state, first, second)) {
    introduceNpcPair(state, first, second, {
      place: place,
      at: state.minutes,
    });
  }
  return npcPairBetween(state, first, second);
}
function partnerMoodOf(state, first, second) {
  let pair = npcPairBetween(state, first, second);
  if (!pair?.yours?.met) {
    return "unmet";
  }
  if (pair.kind === "couple") {
    return "love";
  }
  let tension = pair.yours.tension ?? 0;
  return tension >= RIVALS_AT
    ? "rivals"
    : tension >= TENSE_AT
      ? "tense"
      : pair.close >= GOOD_CLOSE_AT
        ? "good"
        : "none";
}
var PARTNER_MOOD_LABEL = {
  unmet: "NOT MET YET",
  none: "NOTHING YET",
  good: "GET ALONG",
  tense: "TENSION",
  rivals: "RIVALS",
  love: "IN LOVE",
};
var bringChance = (state) => skillRollChance("charm", skillLevelsOf(state).charm);
var calmChance = (state) => Math.max(0.1, skillRollChance("charm", skillLevelsOf(state).charm) - 0.15);
var partnersWon = (state, scene, action) =>
  action === "bring"
    ? seededRandom(state.seed, scene.characterId, String(state.minutes), "bring") < bringChance(state)
    : action === "calm"
      ? seededRandom(state.seed, scene.characterId, String(state.minutes), "calm") < calmChance(state)
      : null;
var herOrMeLeaves = givesUltimatum;
function meetPair(state, first, second, { how = "flow", won = null, place = null, seed = "" } = {}) {
  let pair = ensurePair(state, first, second, place),
    lean = leanOf(state, first) + leanOf(state, second);
  if (pair.kind === "rivals" || pair.kind === "ex") {
    lean += 3;
  }
  if (["friends", "close", "family", "couple"].includes(pair.kind)) {
    lean -= 1;
  }
  lean += Math.round(
    (seededRandom(state.seed, npcPairKey(first, second), String(state.minutes), "meet", seed) - 0.5) * 2,
  );
  if (how === "bring") {
    lean += won ? -2 : 1;
  }
  let tension = lean >= 3 ? 65 : lean >= 1 ? 35 : 0;
  pair.yours = {
    ...(pair.yours ?? {}),
    met: state.minutes,
    tension: tension,
  };
  if (tension === 0) {
    pair.close = Math.min(100, pair.close + (lean <= -1 ? 15 : 5));
  }
  return partnerMoodOf(state, first, second);
}
function unmetPairs(state, ids) {
  let pairs = [];
  for (let i2 = 0; i2 < ids.length; i2++) {
    for (let j = i2 + 1; j < ids.length; j++) {
      let [first, second] = [ids[i2], ids[j]],
        pair = npcPairBetween(state, first, second);
      if (agreedPair(state, first, second) && !pair?.yours?.met && !((pair?.yours?.shortUntil ?? 0) > state.minutes)) {
        pairs.push([first, second]);
      }
    }
  }
  return pairs;
}
function partnersMeetHere(state) {
  if (
    !state.rules?.multipleRelationships ||
    (state.scene && !state.scene.done) ||
    state.approach ||
    state.visit ||
    state.outing ||
    state.at === "home" ||
    isResidencePlace(state.at) ||
    isHallPlace(state.at) ||
    isStreetPlace(state.at)
  ) {
    return false;
  }
  let partnerIds = yourGroup(state).filter((id) => isCharacterHere(state, id) && !isAsleep(state, id)),
    pairs = unmetPairs(state, partnerIds);
  if (!pairs.length) {
    return false;
  }
  let involved = [...new Set(pairs.flat())],
    askerId = involved.find((id) => !bondOf(state, id).asks) ?? null;
  return askerId
    ? ((bondOf(state, askerId).asks = {
        id: "partners-meet",
        with: involved.filter((id) => id !== askerId),
        at: state.minutes,
        due: state.minutes,
      }),
      true)
    : false;
}
var partnersAway = (state, ask) =>
  ask?.id === "partners-meet" || THREE_CALLS.includes(ask?.id)
    ? ((ask.with ?? []).find((id) => !isCharacterHere(state, id) || isAsleep(state, id)) ?? null)
    : null;
function partnersThreeHere(state) {
  if (
    !state.rules?.multipleRelationships ||
    (state.scene && !state.scene.done) ||
    state.approach ||
    state.visit ||
    state.outing ||
    state.at === "home" ||
    isResidencePlace(state.at) ||
    isHallPlace(state.at) ||
    isStreetPlace(state.at)
  ) {
    return false;
  }
  let partnerIds = yourGroup(state).filter(
    (id) => isCharacterHere(state, id) && !isAsleep(state, id) && !bondOf(state, id).asks,
  );
  for (let i2 = 0; i2 < partnerIds.length; i2++) {
    for (let j = i2 + 1; j < partnerIds.length; j++) {
      let [first, second] = [partnerIds[i2], partnerIds[j]];
      if (!agreedPair(state, first, second)) {
        continue;
      }
      let mood = partnerMoodOf(state, first, second);
      if (mood === "unmet" || mood === "rivals") {
        continue;
      }
      let pair = npcPairBetween(state, first, second);
      if ((pair.yours?.threeAt ?? -1 / 0) + THREE_EVERY_DAYS * PARTNERS_DAY_MINUTES > state.minutes) {
        continue;
      }
      let roll = seededRandom(
          state.seed,
          npcPairKey(first, second),
          String(clockFromMinutes(state.minutes).dayIndex),
          "three",
        ),
        leadId = leanOf(state, second) > leanOf(state, first) ? second : first,
        otherId = leadId === first ? second : first,
        milestone =
          mood === "tense"
            ? roll < 0.5
              ? "partners-compete"
              : "partners-argue"
            : roll < (mood === "love" ? 0.5 : 0.35)
              ? "partners-plan"
              : "partners-tease",
        plan = milestone === "partners-plan" ? proposeGroupPlan(state, leadId, [otherId]) : null;
      if (milestone === "partners-plan" && !plan) {
        milestone = "partners-tease";
      }
      pair.yours = {
        ...pair.yours,
        threeAt: state.minutes,
      };
      bondOf(state, leadId).asks = {
        id: milestone,
        with: [otherId],
        at: state.minutes,
        due: state.minutes,
        ...(plan
          ? {
              plan: plan,
            }
          : {}),
      };
      return true;
    }
  }
  return false;
}
function tagPartnerGain(state, characterId, axis, amount, gains) {
  if (!amount) {
    return;
  }
  adjustBondAxis(bondOf(state, characterId), axis, amount, {
    at: state.minutes,
  });
  (
    gains.find((gain) => gain.id === characterId) ??
    (gains[gains.length] = {
      id: characterId,
      tags: [],
    })
  ).tags.push(`${amount > 0 ? "+" : "\u2212"}${Math.abs(amount)} ${axis.toUpperCase()}`);
}
function nudgePair(state, first, second, { tension = 0, close = 0 } = {}) {
  let pair = npcPairBetween(state, first, second);
  if (pair) {
    pair.yours = {
      ...(pair.yours ?? {}),
      tension: Math.max(0, Math.min(100, (pair.yours?.tension ?? 0) + tension)),
    };
    if (close) {
      pair.close = Math.max(0, Math.min(100, (pair.close ?? 0) + close));
    }
  }
}
function settleThree({ game: state, scene: scene, choice: choice }) {
  let leadId = scene.characterId,
    otherId = scene.about?.with,
    nameOf = (id) => nameFor(state, characterOf(state, id)),
    gains = [],
    both = [leadId, otherId],
    picked = choice === "a" ? leadId : choice === "b" ? otherId : null,
    kind = scene.milestone.replace("partners-", ""),
    effects = THREE_EFFECTS[kind],
    won = null,
    text = "",
    title = "",
    moodBefore = partnerMoodOf(state, leadId, otherId);
  if (kind === "tease") {
    if (choice === "turn") {
      if (((won = partnersWon(state, scene, "bring")), won)) {
        for (let id of both) {
          tagPartnerGain(state, id, "friendship", effects.won.friendship, gains);
        }
        nudgePair(state, leadId, otherId, {
          close: effects.won.close,
        });
      }
      text = won ? "You turned it on them \u2014 and it landed." : "You tried. They laughed harder.";
    } else {
      for (let id of both) {
        tagPartnerGain(state, id, "friendship", effects.play.friendship, gains);
      }
      nudgePair(state, leadId, otherId, {
        close: effects.play.close,
      });
      text = "You laughed along.";
    }
    title = "TWO AGAINST ONE";
  } else if (kind === "compete" || kind === "argue") {
    if (picked) {
      let axis = kind === "compete" ? "friendship" : "trust";
      tagPartnerGain(state, picked, axis, effects.pick[axis], gains);
      tagPartnerGain(state, picked === leadId ? otherId : leadId, "trust", effects.pick.otherTrust, gains);
      nudgePair(state, leadId, otherId, {
        tension: effects.pick.tension,
      });
      text = kind === "compete" ? `You went to ${nameOf(picked)}.` : `You took ${nameOf(picked)}'s side.`;
    } else {
      if (((won = kind === "compete" ? partnersWon(state, scene, "bring") : partnersWon(state, scene, "calm")), won)) {
        if (effects.won.friendship) {
          for (let id of both) {
            tagPartnerGain(state, id, "friendship", effects.won.friendship, gains);
          }
        }
        nudgePair(state, leadId, otherId, {
          tension: effects.won.tension,
        });
      } else {
        for (let id of both) {
          tagPartnerGain(state, id, "trust", effects.lost.trust, gains);
        }
        if (effects.lost.tension) {
          nudgePair(state, leadId, otherId, {
            tension: effects.lost.tension,
          });
        }
      }
      text =
        kind === "compete"
          ? won
            ? "There was room for both."
            : "Nobody felt it was enough."
          : won
            ? "You calmed them down."
            : "It only got worse.";
    }
    title = kind === "compete" ? "BOTH WANT YOU" : "THEY ARGUED";
  } else if (kind === "plan") {
    let plan = scene.about?.plan;
    if (choice === "yes" && plan && !groupPlanFits(state, plan, both)) {
      text = "It doesn't fit any more.";
      for (let id of both) {
        gains[gains.length] = {
          id: id,
          tags: ["YES"],
        };
      }
    } else if (choice === "yes" && plan) {
      let created = createGroupPlan(state, {
          characterId: leadId,
          kind: plan.kind,
          place: plan.place,
          at: plan.at,
          by: "them",
          with: [otherId],
        }),
        clock = clockFromMinutes(plan.at);
      text = `On your calendar: ${OUTING_KINDS[plan.kind].name} \xB7 ${townPlace(state.town, plan.place)?.name ?? plan.place} \xB7 ${clock.weekday} ${clock.day} \xB7 ${formatClockTime(plan.at)}, the three of you.`;
      title = created ? "IT'S A PLAN" : "";
      for (let id of both) {
        gains[gains.length] = {
          id: id,
          tags: ["YES"],
        };
      }
    } else {
      for (let id of both) {
        tagPartnerGain(state, id, "friendship", effects.no.friendship, gains);
      }
      text = "Not this time.";
      title = "NOT THIS TIME";
    }
  }
  let moodAfter = partnerMoodOf(state, leadId, otherId),
    moodChange =
      moodAfter === moodBefore
        ? ""
        : ({
            good: "CLOSER",
            love: "CLOSER",
            tense: "TENSION UP",
            rivals: "RIVALS NOW",
            none: "TENSION DOWN",
          }[moodAfter] ?? ""),
    lines = [
      ...(won !== null
        ? [
            {
              text: `${won ? "IT LANDED" : "IT DIDN'T"} \xB7 CHARM`,
              step: won,
              bad: !won,
            },
          ]
        : []),
      ...gains.flatMap((gain) =>
        gain.tags.map((tag) => ({
          text: `${tag} \xB7 ${nameOf(gain.id).toUpperCase()}`,
          bad: tag.startsWith("\u2212"),
        })),
      ),
      ...(moodChange
        ? [
            {
              text: `${nameOf(leadId).toUpperCase()} & ${nameOf(otherId).toUpperCase()} \xB7 ${moodChange}`,
              bad: moodAfter === "tense" || moodAfter === "rivals",
            },
          ]
        : []),
    ];
  scene.outcome = {
    stamp: title,
    headline: text,
    pairs: [
      {
        a: leadId,
        b: otherId,
        mood: moodAfter,
      },
    ],
    answers: gains.map((gain) => ({
      id: gain.id,
      tag: gain.tags.join(" \xB7 "),
    })),
    tags: lines,
    won: won,
  };
}
var insideTheirHome = (state, character) => {
  let visitedHome = state.visit?.stage === "inside" ? characterOf(state, state.visit.characterId)?.residence : null;
  return (
    !!visitedHome?.place &&
    !!character.residence &&
    visitedHome.place === character.residence.place &&
    visitedHome.unit === character.residence.unit
  );
};
function partnersTogether(state, pair, first, second, place, minutes, hours = 1) {
  if (!agreedPair(state, first.id, second.id)) {
    return;
  }
  let yours = (state.week.yours ??= []),
    met = !!pair.yours?.met;
  if (met && !(hours > 0)) {
    return;
  }
  if (!met) {
    if (
      place === "home"
        ? (state.at === "home" && !state.visit && sharesYourDoor(state, first)) || insideTheirHome(state, first)
        : !state.visit && state.at === place
    ) {
      return;
    }
    let mood = meetPair(state, first.id, second.id, {
      how: "flow",
      place: place,
      seed: "alone",
    });
    yours.push({
      a: first.id,
      b: second.id,
      how: "met",
      place: place,
      mood: mood,
    });
    return;
  }
  let moodBefore = partnerMoodOf(state, first.id, second.id);
  if (moodBefore === "love") {
    return;
  }
  let tensionDelta = moodBefore === "tense" || moodBefore === "rivals" ? 1 : moodBefore === "good" ? -1 : 0;
  pair.yours.tension = Math.max(0, Math.min(100, (pair.yours.tension ?? 0) + tensionDelta));
  let moodAfter = partnerMoodOf(state, first.id, second.id);
  if (moodAfter !== moodBefore) {
    yours.push({
      a: first.id,
      b: second.id,
      how: "mood",
      place: place,
      mood: moodAfter,
    });
  }
}
function partnersAsk(state, bond, dayKey) {
  if (bond.asks || !isCountedPartner(state, bond.characterId)) {
    return;
  }
  let characterId = bond.characterId,
    retry = bond.milestoneRetry ?? {};
  for (let otherId of otherPartnersOf(state, characterId)) {
    if (partnerMoodOf(state, characterId, otherId) === "rivals" && (retry["her-or-me"] ?? 0) <= state.minutes) {
      let traits = traitsOf(state, characterId);
      if (
        (TRAIT_BEHAVIOURS.ultimatum(traits) ||
          (!TRAIT_BEHAVIOURS.neverUltimatum(traits) && bondTier(bond, "trust") <= 1)) &&
        seededRandom(state.seed, characterId, String(dayKey), "her-or-me") < 0.5
      ) {
        bond.asks = {
          id: "her-or-me",
          with: otherId,
          at: state.minutes,
          due: approachDue(bond, state.minutes),
        };
        return;
      }
    }
  }
  if ((retry["meet-ask"] ?? 0) > state.minutes) {
    return;
  }
  let unmetId = otherPartnersOf(state, characterId).find(
    (otherId) => partnerMoodOf(state, characterId, otherId) === "unmet",
  );
  if (!unmetId) {
    return;
  }
  let initiative = knobsOf(bond).initiative ?? 1;
  if (
    seededRandom(state.seed, characterId, String(dayKey), "meet-ask") <
    (INITIATIVE_ASK_CHANCES[initiative] ?? 0) * 0.5
  ) {
    bond.asks = {
      id: "meet-ask",
      with: unmetId,
      at: state.minutes,
      due: approachDue(bond, state.minutes),
    };
  }
}
function proposeGroupPlan(state, leadId, otherIds) {
  if (activePlans(state).length >= MAX_PLANS || [leadId, ...otherIds].some((id) => planWith(state, id))) {
    return null;
  }
  let character = characterOf(state, leadId),
    tastes = dateTastesFor(character, bondOf(state, leadId).archetype),
    places = availableOutingPlaces(state.town, "hang").filter((place2) => !outingPlaceHome(place2)),
    liked = places.filter((place2) => OUTING_PLACES[place2].outing === tastes.outings.likes),
    today = clockFromMinutes(state.minutes).dayIndex,
    choices =
      !!state.residence &&
      !state.lodging &&
      seededRandom(state.seed, leadId, String(today), "group-yours") < AT_YOURS_SHARE
        ? ["home"]
        : liked.length
          ? liked
          : places.filter((place2) => OUTING_PLACES[place2].outing !== tastes.outings.dislikes),
    place = choices[Math.floor(seededRandom(state.seed, leadId, String(today), "group-where") * choices.length)];
  if (!place) {
    return null;
  }
  for (let day = today + 1; day <= today + 4; day++) {
    for (let hour of hoursFor(state, place, day).filter((hour2) => hour2 >= 15)) {
      let at = day * PARTNERS_DAY_MINUTES + hour * 60;
      if (
        !yourBusy(state, at) &&
        ![leadId, ...otherIds].some((id) => busyForPlans(state, characterOf(state, id), at))
      ) {
        return {
          kind: "hang",
          place: place,
          at: at,
        };
      }
    }
  }
  return null;
}
function groupPlanFits(state, plan, ids) {
  return !plan || plan.at <= state.minutes + 30 || yourBusy(state, plan.at) || activePlans(state).length >= MAX_PLANS
    ? false
    : !ids.some((id) => !id || planWith(state, id) || busyForPlans(state, characterOf(state, id), plan.at));
}
function joinsGroup(state, characterId, otherIds, seed = "") {
  let moods = otherIds.map((otherId) => partnerMoodOf(state, characterId, otherId));
  if (moods.includes("rivals")) {
    return {
      yes: false,
      why: "rivals",
      with: otherIds[moods.indexOf("rivals")],
    };
  }
  let tenseIndex = moods.indexOf("tense");
  if (tenseIndex >= 0) {
    let jealousyKnob = knobsOf(bondOf(state, characterId)).jealousy ?? 1;
    if (seededRandom(state.seed, characterId, String(state.minutes), "group", seed) < 0.25 + 0.2 * jealousyKnob) {
      return {
        yes: false,
        why: "tense",
        with: otherIds[tenseIndex],
      };
    }
  }
  return {
    yes: true,
    why: "",
  };
}
function settlePartnersMeet({ game: state, scene: scene, choice: choice, at: at }) {
  let ids = [scene.characterId, ...(scene.cast ?? []).filter((id) => id !== scene.characterId)],
    pairs = unmetPairs(state, ids);
  if (choice === "short") {
    for (let [first, second] of pairs) {
      ensurePair(state, first, second, state.at).yours = {
        ...(npcPairBetween(state, first, second).yours ?? {}),
        shortUntil: at + PARTNERS_DAY_MINUTES,
      };
    }
    scene.outcome = {
      stamp: "HELLO, GOODBYE",
      headline: "They said hello. They will meet properly another day.",
    };
    return;
  }
  let chance = bringChance(state),
    won = partnersWon(state, scene, choice),
    results = pairs.map(([first, second]) => ({
      a: first,
      b: second,
      mood: meetPair(state, first, second, {
        how: choice === "bring" ? "bring" : "flow",
        won: won,
        place: state.at,
      }),
    }));
  scene.outcome = {
    stamp: "THEY MET",
    headline:
      choice === "bring"
        ? `${won ? "It went well" : "It didn't come off"} \xB7 Charm ${Math.round(chance * 100)}%`
        : "You let them find their own way.",
    pairs: results,
  };
}
function settleMeetAsk({ game: state, scene: scene, bond: bond, choice: choice, at: at }) {
  let otherId = scene.about?.with;
  if (choice !== "yes" || !otherId) {
    bond.milestoneRetry = {
      ...(bond.milestoneRetry ?? {}),
      "meet-ask": at + MEET_ASK_AGAIN_DAYS * PARTNERS_DAY_MINUTES,
    };
    if (TRAIT_BEHAVIOURS.possessive(traitsOf(state, bond.characterId))) {
      hurtBond(bond, {
        trust: -1,
      });
    }
    scene.outcome = {
      stamp: "NOT YET",
      headline: `${nameFor(state, characterOf(state, bond.characterId))} lets it go. For now.`,
    };
    return;
  }
  let characterId = bond.characterId,
    plan = proposeGroupPlan(state, characterId, [otherId]),
    joins = plan
      ? joinsGroup(state, otherId, [characterId], "meet-ask")
      : {
          yes: false,
          why: "busy",
        },
    nameOf = (id) => nameFor(state, characterOf(state, id));
  if (!plan || !joins.yes) {
    bond.milestoneRetry = {
      ...(bond.milestoneRetry ?? {}),
      "meet-ask": at + 3 * PARTNERS_DAY_MINUTES,
    };
    scene.outcome = {
      stamp: "NOT THIS TIME",
      headline: `${nameOf(otherId)} can't make it. ${nameOf(characterId)} will ask again.`,
      answers: [
        {
          id: characterId,
          tag: "ASKED",
        },
        {
          id: otherId,
          tag: "NO",
          why: plan ? (joins.why === "rivals" ? "Not with them" : "Not yet") : "No evening free for all of you",
        },
      ],
    };
    return;
  }
  let created = createGroupPlan(state, {
      characterId: characterId,
      kind: plan.kind,
      place: plan.place,
      at: plan.at,
      by: "them",
      with: [otherId],
    }),
    clock = clockFromMinutes(plan.at);
  scene.outcome = {
    stamp: "IT'S A PLAN",
    headline: `${nameOf(characterId)} picks: ${OUTING_KINDS[plan.kind].name} at ${created ? townPlaceName(state, plan.place) : ""}, ${clock.weekday} ${clock.day} at ${formatClockTime(plan.at)}, all of you.`,
    answers: [
      {
        id: characterId,
        tag: "ASKED",
      },
      {
        id: otherId,
        tag: "YES",
      },
    ],
  };
}
var townPlaceName = (state, placeId) => townPlace(state.town, placeId)?.name ?? placeId;
function settleHerOrMe({ game: state, scene: scene, bond: bond, choice: choice, at: at, events: events }) {
  let characterId = bond.characterId,
    otherId = scene.about?.with,
    nameOf = (id) => nameFor(state, characterOf(state, id)),
    breakUp = (id) => {
      let bond2 = bondOf(state, id);
      if (!(!bond2 || !MILESTONE_COUPLE_STATUSES.includes(bond2.status))) {
        events.push({
          id: "broke-up",
          characterId: id,
          text: `You and ${nameOf(id)} broke up.`,
        });
        breakUpWith(
          state,
          bond2,
          {
            at: at,
          },
          events,
        );
      }
    };
  if (choice === "her") {
    breakUp(otherId);
    applyBondAction(
      bond,
      {
        action: "reliable",
        trust: 3,
      },
      {
        at: at,
        today: false,
        share: "event",
      },
    );
    scene.outcome = {
      stamp: `YOU CHOSE ${nameOf(characterId).toUpperCase()}`,
      headline: `You and ${nameOf(otherId)} broke up.`,
    };
  } else if (choice === "other") {
    breakUp(characterId);
    scene.outcome = {
      stamp: `YOU CHOSE ${nameOf(otherId).toUpperCase()}`,
      headline: `${nameOf(characterId)} leaves. You and ${nameOf(characterId)} broke up.`,
      ends: true,
    };
  } else if (choice === "calm") {
    let chance = calmChance(state);
    if (partnersWon(state, scene, "calm")) {
      hurtBond(bond, {
        trust: -4,
      });
      bond.milestoneRetry = {
        ...(bond.milestoneRetry ?? {}),
        "her-or-me": at + ULTIMATUM_CALM_DAYS * PARTNERS_DAY_MINUTES,
      };
      scene.outcome = {
        stamp: "SHE STAYS",
        headline: `Charm ${Math.round(chance * 100)}%: ${nameOf(characterId)} lets it go, for now.`,
      };
    } else {
      breakUp(characterId);
      scene.outcome = {
        stamp: "SHE LEAVES",
        headline: `Charm ${Math.round(chance * 100)}%: it didn't work. You and ${nameOf(characterId)} broke up.`,
        ends: true,
      };
    }
  } else if (givesUltimatum(state, characterId)) {
    breakUp(characterId);
    scene.outcome = {
      stamp: "SHE LEAVES",
      headline: `${nameOf(characterId)} doesn't wait for an answer. You and ${nameOf(characterId)} broke up.`,
      ends: true,
    };
  } else {
    hurtBond(bond, {
      trust: -12,
    });
    bond.milestoneRetry = {
      ...(bond.milestoneRetry ?? {}),
      "her-or-me": at + ULTIMATUM_CALM_DAYS * PARTNERS_DAY_MINUTES,
    };
    scene.outcome = {
      stamp: "SHE STAYS",
      headline: `${nameOf(characterId)} stays. It cost a lot of trust.`,
    };
  }
}
function partnersChips(state, scene, choice) {
  let nameOf = (id) => nameFor(state, characterOf(state, id)).toUpperCase(),
    characterId = scene.characterId,
    otherId = scene.about?.with,
    ultimatum = givesUltimatum(state, characterId);
  return (
    {
      "partners-meet": {
        bring: [
          {
            text: `CHARM \xB7 ${Math.round(bringChance(state) * 100)}%`,
            roll: true,
          },
        ],
      },
      "meet-ask": {
        notyet: TRAIT_BEHAVIOURS.possessive(traitsOf(state, characterId))
          ? [
              {
                text: "TRUST \u22121",
                bad: true,
              },
            ]
          : [],
      },
      "partners-tease": {
        play: [
          {
            text: `+${THREE_EFFECTS.tease.play.friendship} FRIENDSHIP \xB7 EACH`,
          },
        ],
        turn: [
          {
            text: `CHARM \xB7 ${Math.round(bringChance(state) * 100)}%`,
            roll: true,
          },
          {
            text: `+${THREE_EFFECTS.tease.won.friendship} EACH`,
          },
          {
            text: "MISSED: NOTHING",
            bad: true,
          },
        ],
      },
      "partners-compete": {
        a: [
          {
            text: `+${THREE_EFFECTS.compete.pick.friendship} ${nameOf(characterId)}`,
          },
          {
            text: `TRUST ${THREE_EFFECTS.compete.pick.otherTrust} ${otherId ? nameOf(otherId) : ""}`,
            bad: true,
          },
          {
            text: "TENSION UP",
            bad: true,
          },
        ],
        b: otherId
          ? [
              {
                text: `+${THREE_EFFECTS.compete.pick.friendship} ${nameOf(otherId)}`,
              },
              {
                text: `TRUST ${THREE_EFFECTS.compete.pick.otherTrust} ${nameOf(characterId)}`,
                bad: true,
              },
              {
                text: "TENSION UP",
                bad: true,
              },
            ]
          : [],
        share: [
          {
            text: `CHARM \xB7 ${Math.round(bringChance(state) * 100)}%`,
            roll: true,
          },
          {
            text: `+${THREE_EFFECTS.compete.won.friendship} EACH \xB7 TENSION DOWN`,
          },
          {
            text: `MISSED: TRUST ${THREE_EFFECTS.compete.lost.trust} EACH`,
            bad: true,
          },
        ],
      },
      "partners-argue": {
        a: [
          {
            text: `TRUST +${THREE_EFFECTS.argue.pick.trust} ${nameOf(characterId)}`,
          },
          {
            text: `TRUST ${THREE_EFFECTS.argue.pick.otherTrust} ${otherId ? nameOf(otherId) : ""}`,
            bad: true,
          },
          {
            text: "TENSION UP",
            bad: true,
          },
        ],
        b: otherId
          ? [
              {
                text: `TRUST +${THREE_EFFECTS.argue.pick.trust} ${nameOf(otherId)}`,
              },
              {
                text: `TRUST ${THREE_EFFECTS.argue.pick.otherTrust} ${nameOf(characterId)}`,
                bad: true,
              },
              {
                text: "TENSION UP",
                bad: true,
              },
            ]
          : [],
        calm: [
          {
            text: `CHARM \xB7 ${Math.round(calmChance(state) * 100)}%`,
            roll: true,
          },
          {
            text: "TENSION DOWN A LOT",
          },
          {
            text: "MISSED: TENSION UP \xB7 TRUST \u22121 EACH",
            bad: true,
          },
        ],
      },
      "partners-plan": {
        yes: [
          {
            text: "GROUP OUTING",
          },
        ],
        wait: [
          {
            text: `FRIENDSHIP ${THREE_EFFECTS.plan.no.friendship} EACH`,
            bad: true,
          },
        ],
      },
      "her-or-me": {
        her: otherId
          ? [
              {
                text: `${nameOf(otherId)} \xB7 EX`,
                bad: true,
              },
            ]
          : [],
        other: [
          {
            text: `${nameOf(characterId)} \xB7 EX`,
            bad: true,
          },
        ],
        calm: [
          {
            text: `CHARM \xB7 ${Math.round(calmChance(state) * 100)}%`,
            roll: true,
          },
          {
            text: "TRUST \u22124",
          },
        ],
        refuse: [
          ultimatum
            ? {
                text: `${nameOf(characterId)} \xB7 EX`,
                bad: true,
              }
            : {
                text: "TRUST \u221212",
                bad: true,
              },
        ],
      },
    }[scene.milestone]?.[choice] ?? []
  );
}
function partnersNote(state, scene, choice) {
  let nameOf = (id) => nameFor(state, characterOf(state, id)),
    characterId = scene.characterId,
    otherId = scene.about?.with;
  return (
    {
      "partners-meet": {
        bring: "Well: they get closer. Badly: tension.",
        flow: "Who they are decides",
        short: "Nothing changes: they meet properly another day",
      },
      "meet-ask": {
        yes: `${nameOf(characterId)} picks when and where; ${otherId ? nameOf(otherId) : "the other one"} answers`,
        notyet: "They ask again in a week",
      },
      "partners-tease": {
        play: "Laugh with them",
        turn: "Your Charm against the two of them",
      },
      "partners-compete": {
        a: otherId ? `${nameOf(otherId)} notices` : "",
        b: `${nameOf(characterId)} notices`,
        share: "Your Charm, so nobody feels left out",
      },
      "partners-argue": {
        a: "",
        b: "",
        calm: "Your Charm",
      },
      "partners-plan": {
        yes: "On your calendar, the three of you",
        wait: "",
      },
      "her-or-me": {
        her: otherId ? `You break up with ${nameOf(otherId)}` : "",
        other: `${nameOf(characterId)} breaks up with you`,
        calm: "Well: she stays, and no ultimatum for two weeks. Badly: she leaves.",
        refuse: givesUltimatum(state, characterId) ? `${nameOf(characterId)} leaves` : "It costs a lot of trust",
      },
    }[scene.milestone]?.[choice] ?? ""
  );
}
function partnersAbout(state, scene) {
  let nameOf = (id) => characterOf(state, id)?.name ?? npcNameAside(state, id),
    pairNote = (first, second) => {
      let pair = npcPairBetween(state, first, second);
      return pair ? ` (to each other: ${pairBothWords(pair)})` : "";
    };
  if (scene.milestone === "partners-meet") {
    let ids = [scene.characterId, ...(scene.cast ?? []).filter((id) => id !== scene.characterId)];
    return ids.length < 2
      ? `The player's other partners are not here: only ${nameOf(ids[0])} is.`
      : `The player's partners in this scene, each of whom agreed that the player sees the others: ${ids.map(nameOf).join(", ")}. They meet today as the player's partners for the first time${ids.length === 2 ? pairNote(ids[0], ids[1]) : ""}. Everyone of them is here and speaks for themselves.`;
  }
  if (scene.milestone === "meet-ask") {
    return `The other partner they want to meet: ${nameOf(scene.about?.with)}${pairNote(scene.characterId, scene.about?.with)}. It is agreed that the player sees them both.`;
  }
  if (scene.milestone === "her-or-me") {
    return `The other partner: ${nameOf(scene.about?.with)}. Between the two of them it has gone bad: they cannot stand each other.`;
  }
  if (THREE_CALLS.includes(scene.milestone)) {
    let otherId = scene.about?.with,
      plan = scene.about?.plan,
      planLine = plan
        ? ` THE PLAN THEY PICKED: ${OUTING_KINDS[plan.kind].name} at ${townPlace(state.town, plan.place)?.name ?? plan.place}, ${clockFromMinutes(plan.at).weekday} ${clockFromMinutes(plan.at).day} at ${formatClockTime(plan.at)}.`
        : "";
    return `The player's partners in this scene: ${nameOf(scene.characterId)} and ${nameOf(otherId)}; each agreed that the player sees the other, and they already know each other as such${pairNote(scene.characterId, otherId)}. ${(scene.cast ?? []).includes(otherId) ? "Both are here and speak for themselves." : `${nameOf(otherId)} is not here.`}${planLine}`;
  }
  return "";
}
function partnersSheet(state, characterId) {
  return yourGroup(state).includes(characterId)
    ? otherPartnersOf(state, characterId)
        .map((otherId) => {
          let pair = npcPairBetween(state, characterId, otherId),
            mood = partnerMoodOf(state, characterId, otherId),
            character = characterOf(state, otherId);
          return {
            id: otherId,
            name: nameFor(state, character),
            ...characterPortrait(character, state),
            mood: mood,
            label: PARTNER_MOOD_LABEL[mood],
            since: pair?.yours?.met ? clockFromMinutes(pair.yours.met) : null,
          };
        })
        .map(({ since: since, ...entry }) => ({
          ...entry,
          line: since ? `Met on ${since.weekday} ${since.day}` : "They have not met yet",
        }))
    : null;
}
function groupChoices(state, characterId) {
  return otherPartnersOf(state, characterId).map((otherId) => {
    let character = characterOf(state, otherId),
      mood = partnerMoodOf(state, characterId, otherId);
    return {
      id: otherId,
      name: nameFor(state, character),
      ...characterPortrait(character, state),
      mood: mood,
      label: PARTNER_MOOD_LABEL[mood],
      here: isCharacterHere(state, otherId),
    };
  });
}

export {
  AFTER_EXCHANGES,
  GROUP_MAX,
  MEET_ASK_AGAIN_DAYS,
  PARTNER_MOOD_LABEL,
  TENSE_AT,
  THREE_CALLS,
  THREE_EFFECTS,
  THREE_EVERY_DAYS,
  ULTIMATUM_CALM_DAYS,
  agreedPair,
  bringChance,
  calmChance,
  groupChoices,
  groupPlanFits,
  herOrMeLeaves,
  joinsGroup,
  meetPair,
  otherPartnersOf,
  partnerMoodOf,
  partnersAbout,
  partnersAsk,
  partnersAway,
  partnersChips,
  partnersMeetHere,
  partnersNote,
  partnersSheet,
  partnersThreeHere,
  partnersTogether,
  partnersWon,
  proposeGroupPlan,
  settleHerOrMe,
  settleMeetAsk,
  settlePartnersMeet,
  settleThree,
  unmetPairs,
  yourGroup,
};
