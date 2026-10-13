// Rings, proposals and the night of the proposal
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { adjustBondAxis, setRelationshipStatus } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { canTakeMilestoneStep, milestoneSceneMinutes } from "../relationships/milestone-steps.mjs";
import { judgeSceneReads } from "../relationships/tier-steps.mjs";
import { endScene } from "../scenes/scene-engine.mjs";
import { ITEM_CATALOG } from "../items/catalog.mjs";
import { takeOneFromPile } from "../inventory/piles-and-cooking.mjs";
import { recordTownFact, tellFactTo } from "../network/town-facts.mjs";
import { MAX_PLANS } from "../outings/outing-rules.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { knownAboutCharacter } from "../people/people-sheet.mjs";
import { collectModuleHook, firstModuleHook } from "../modules/module-registry.mjs";
import { activePlans, busyWhy, createGroupPlan, hoursFor, planWith, yourBusy } from "../plans/plans.mjs";
import { objectOf } from "./romanceability.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  isCharacterHere,
  logNote,
  nameFor,
  rememberScene,
  traitsOf,
} from "../game.mjs";

var WEDDING_DAY_MINUTES = 1440;
var RING_WEIGHT = [0, 0.1, 0.25];
var PROPOSAL_HOW = {
  candles: {
    name: "A dinner, candles",
    about: "the big gesture: a dinner, candles, the words prepared",
  },
  ours: {
    name: "Somewhere that's yours",
    about: "something that is theirs and the player's: a place, a song, a memory of theirs together",
  },
  simple: {
    name: "Simple, at home",
    about: "simple and honest, just the two of them, no show",
  },
};
var PROPOSAL_HOW_WEIGHT = 0.08;
var PROPOSAL_BASE_CHANCE = {
  good: 0.7,
  bad: 0.3,
};
var ENGAGED_GAINS = {
  romance: 5,
  trust: 4,
};
var PROPOSAL_TURNED_DOWN = {
  trust: -2,
  days: 7,
};
var PROPOSAL_YOUR_NO = {
  hard: {
    trust: -8,
    romance: -6,
    days: 21,
  },
  light: {
    trust: -2,
    romance: -1,
    days: 30,
  },
  "": {
    trust: -4,
    romance: -3,
    days: 14,
  },
};
var TONIGHT_CHOICES = ["two", "tell", "out"];
var TONIGHT_TWO = {
  romance: 3,
};
var WEDDING_ACTS = ["ring", "how", "tonight", "date"];
function ringsInBag(state) {
  return (state.things?.bag ?? [])
    .map((pile, index) => ({
      p: pile,
      index: index,
      item: ITEM_CATALOG[pile.item],
    }))
    .filter((entry) => entry.item?.kind === "ring")
    .map((entry) => ({
      id: entry.p.item,
      index: entry.index,
      tier: entry.item.tier,
      name: entry.item.name,
      price: entry.item.price,
    }))
    .sort((first, second) => second.tier - first.tier);
}
function ringCare(state, characterId) {
  let traitCare = TRAIT_BEHAVIOURS.ringCare(traitsOf(state, characterId)),
    lovesJewelry = (characterOf(state, characterId)?.tastes?.loves ?? []).includes("jewelry");
  return Math.min(2, traitCare + (lovesJewelry ? 1 : 0));
}
function ringMove(state, characterId, tier) {
  let weight = RING_WEIGHT[ringCare(state, characterId)];
  return weight
    ? weight * (tier - 2)
    : tier === 3 && TRAIT_BEHAVIOURS.tooMuch(traitsOf(state, characterId))
      ? -0.05
      : 0;
}
function ringChip(state, characterId) {
  let care = ringCare(state, characterId),
    them = objectOf(state, characterId);
  return `${nameFor(state, characterOf(state, characterId))}: ${care === 2 ? `a ring matters a lot to ${them}` : care === 1 ? `a ring matters to ${them}` : `the ring is not what matters to ${them}`}`;
}
function ringChips(state) {
  let showMode = state.rules?.showArchetypes ?? "found";
  return castInTown(state)
    .filter(
      (character) =>
        hasMet2(state, character.id) &&
        MILESTONE_COUPLE_STATUSES.includes(bondOf(state, character.id)?.status) &&
        knownAboutCharacter(bondOf(state, character.id), showMode).full,
    )
    .map((character) => ({
      kind: "likes",
      text: ringChip(state, character.id),
    }));
}
var weddingOf = (state) => state.wedding ?? null;
function proposeWhy(state, characterId, ctx) {
  let bond = bondOf(state, characterId);
  if (!bond) {
    return "That person is not in this life.";
  }
  if (weddingOf(state)) {
    return "A wedding is already planned.";
  }
  let step = canTakeMilestoneStep(bond, "propose", ctx);
  return step.ok
    ? (bond.milestoneRetry?.propose ?? 0) > state.minutes
      ? "Not yet: give it a few days."
      : ringsInBag(state).length
        ? state.at === "home" &&
          (state.characters ?? []).some(
            (character) => character.id !== characterId && isCharacterHere(state, character.id),
          )
          ? "Not with somebody else home: when it's just the two of you."
          : ""
        : "You need a ring (Little Things)."
    : step.reason;
}
function proposeInfo(state, characterId, ctx) {
  if (proposeWhy(state, characterId, ctx)) {
    return null;
  }
  let ring = ringsInBag(state)[0],
    full = knownAboutCharacter(bondOf(state, characterId), state.rules?.showArchetypes ?? "found").full,
    liked = TRAIT_BEHAVIOURS.proposeLikes(traitsOf(state, characterId));
  return {
    ok: true,
    minutes: milestoneSceneMinutes("propose"),
    ring: {
      id: ring.id,
      name: ring.name,
      price: ring.price,
      care: full ? ringCare(state, characterId) : null,
    },
    how: Object.entries(PROPOSAL_HOW).map(([id, how]) => ({
      id: id,
      name: how.name,
      liked: full && liked === id,
    })),
  };
}
function proposalChance(state, scene) {
  let characterId = scene.characterId,
    chance = judgeSceneReads(scene.reads ?? []).accepted ? PROPOSAL_BASE_CHANCE.good : PROPOSAL_BASE_CHANCE.bad,
    ring = (scene.about?.ring && ITEM_CATALOG[scene.about.ring]) ?? null;
  if (ring) {
    chance += ringMove(state, characterId, ring.tier);
  }
  let how = scene.about?.how,
    traits = traitsOf(state, characterId);
  if (how && TRAIT_BEHAVIOURS.proposeLikes(traits) === how) {
    chance += PROPOSAL_HOW_WEIGHT;
  }
  if (how && TRAIT_BEHAVIOURS.proposeDislikes(traits) === how) {
    chance -= PROPOSAL_HOW_WEIGHT;
  }
  return Math.max(0.05, Math.min(0.95, chance));
}
var proposalYes = (state, scene) =>
  seededRandom(state.seed, scene.characterId, String(state.minutes), "propose") < proposalChance(state, scene);
function proposeAbout(state, scene) {
  if (scene.by === "them") {
    return "They propose to the player, with a ring they chose themselves.";
  }
  let how = PROPOSAL_HOW[scene.about?.how],
    ring = ITEM_CATALOG[scene.about?.ring];
  return `How the player asks: ${how ? how.about : "their own way"}${ring ? `. The ring: ${ring.name.toLowerCase()} \u2014 ${ring.line}` : ""}`;
}
function settlePropose({
  game: state,
  scene: scene,
  bond: bond,
  character: character,
  choice: choice,
  accepted: accepted,
  at: at,
  events: events,
}) {
  let name = nameFor(state, character),
    tags = [],
    adjust = (axis, amount) => {
      if (amount) {
        adjustBondAxis(bond, axis, amount, {
          at: at,
        });
        tags.push({
          text: `${amount > 0 ? "+" : "\u2212"}${Math.abs(amount)} ${axis.toUpperCase()}`,
          bad: amount < 0,
        });
      }
    };
  if (accepted) {
    if (
      (setRelationshipStatus(bond, "engaged", {
        at: at,
      }),
      recordTownFact(state, "engaged", {
        with: bond.characterId,
        place: state.at,
      }),
      scene.by === "you")
    ) {
      let ring = ringsInBag(state).find((entry) => entry.id === scene.about?.ring) ?? ringsInBag(state)[0];
      if (ring) {
        takeOneFromPile(state.things, "bag", ring.index);
      }
    }
    state.wedding = {
      characterId: bond.characterId,
      since: at,
      day: null,
    };
    tags.push({
      text: `${scene.by === "them" ? "YOU SAID YES" : `${name.toUpperCase()} SAID YES`} \xB7 ENGAGED`,
      step: true,
    });
    adjust("romance", ENGAGED_GAINS.romance);
    adjust("trust", ENGAGED_GAINS.trust);
    scene.outcome = {
      stamp: "ENGAGED",
      headline: scene.by === "them" ? `You said yes to ${name}.` : `${name} said yes.`,
      tags: tags,
      tonight: true,
    };
    events.push({
      id: "engaged",
      characterId: bond.characterId,
      text: `You and ${name} are engaged.`,
    });
    return;
  }
  if (scene.by === "you") {
    if (choice === "wait") {
      scene.outcome = {
        headline: "Not today.",
        tags: [
          {
            text: "THE RING STAYS IN YOUR POCKET",
          },
        ],
      };
      bond.milestoneRetry = {
        ...(bond.milestoneRetry ?? {}),
        propose: (clockFromMinutes(at).dayIndex + 1) * WEDDING_DAY_MINUTES,
      };
      return;
    }
    adjust("trust", PROPOSAL_TURNED_DOWN.trust);
    state.badDayAt = at;
    bond.milestoneRetry = {
      ...(bond.milestoneRetry ?? {}),
      propose: at + PROPOSAL_TURNED_DOWN.days * WEDDING_DAY_MINUTES,
    };
    tags.unshift({
      text: `NOT YET \xB7 YOU CAN ASK AGAIN IN ${PROPOSAL_TURNED_DOWN.days} DAYS`,
      bad: true,
    });
    tags.push({
      text: "THE RING STAYS WITH YOU",
    });
    scene.outcome = {
      stamp: "NOT YET",
      headline: `${name} said not yet.`,
      tags: tags,
    };
    return;
  }
  let cost = PROPOSAL_YOUR_NO[TRAIT_BEHAVIOURS.hurtByNo(traitsOf(state, bond.characterId))];
  adjust("trust", cost.trust);
  adjust("romance", cost.romance);
  bond.milestoneRetry = {
    ...(bond.milestoneRetry ?? {}),
    propose: at + cost.days * WEDDING_DAY_MINUTES,
  };
  tags.unshift({
    text: "YOU SAID NOT YET",
    bad: true,
  });
  scene.outcome = {
    stamp: "NOT YET",
    headline: `You told ${name} not yet.`,
    tags: tags,
  };
}
function toTonight(scene) {
  return !scene?.done ||
    scene.milestone !== "propose" ||
    !scene.outcome?.tonight ||
    scene.tonight ||
    scene.endedBy !== "done"
    ? false
    : ((scene.done = false), (scene.endedBy = null), (scene.phase = "tonight"), true);
}
function partOfDay(minutes) {
  let { hour: hour } = clockFromMinutes(minutes);
  return hour >= 5 && hour < 12
    ? "morning"
    : hour >= 12 && hour < 18
      ? "afternoon"
      : hour >= 18 && hour < 21
        ? "evening"
        : "night";
}
var DAY_PART_STAMP = {
  morning: "THIS MORNING",
  afternoon: "THIS AFTERNOON",
  evening: "THIS EVENING",
  night: "TONIGHT",
};
var tonightTitle = (state, scene) => (scene?.phase === "tonight" ? DAY_PART_STAMP[partOfDay(state.minutes)] : null);
function tonightView(state, scene) {
  if (scene?.phase !== "tonight") {
    return null;
  }
  let slot = celebrateSlot(state, scene.characterId);
  return [
    {
      id: "two",
      label: "Just the two of you",
      note: `Stay in: the ${partOfDay(state.minutes)} is yours`,
      chips: [
        {
          text: `+${TONIGHT_TWO.romance} ROMANCE`,
        },
        {
          text: "A MEMORY OF THE TWO OF YOU",
        },
      ],
    },
    {
      id: "tell",
      label: "Call everyone",
      note: "Their friends, yours: the news goes out now",
      chips: [
        {
          text: "EVERYONE YOU KNOW HEARS IT",
        },
      ],
    },
    {
      id: "out",
      label: "Go out and celebrate",
      note: slot.place ? `${slot.placeName} at ${formatClockTime(slot.at)}: a date of its own` : slot.why,
      ok: !!slot.place,
      chips: slot.place
        ? [
            {
              text: `A DATE \xB7 ${formatClockTime(slot.at)}`,
            },
          ]
        : [],
    },
    ...collectModuleHook(state, "tonight", scene).flat(),
  ];
}
function celebrateSlot(state, characterId) {
  let dayIndex = clockFromMinutes(state.minutes).dayIndex,
    character = characterOf(state, characterId);
  if (planWith(state, characterId)) {
    return {
      why: `You have a plan with ${nameFor(state, character)} already`,
    };
  }
  if (activePlans(state).length >= MAX_PLANS) {
    return {
      why: `${MAX_PLANS} plans already`,
    };
  }
  let anyOpen = false;
  for (let place of ["restaurant", "bar"]) {
    let hours = hoursFor(state, place, dayIndex);
    anyOpen ||= hours.length > 0;
    let freeHour = hours.find(
      (hour) =>
        !yourBusy(state, dayIndex * WEDDING_DAY_MINUTES + hour * 60) &&
        !busyWhy(state, character, dayIndex * WEDDING_DAY_MINUTES + hour * 60),
    );
    if (freeHour !== undefined) {
      return {
        place: place,
        at: dayIndex * WEDDING_DAY_MINUTES + freeHour * 60,
        placeName: townPlace(state.town, place)?.name ?? place,
      };
    }
  }
  return {
    why: anyOpen ? "No free hour left today" : "Nowhere open today",
  };
}
function proposeTonight(state, choice) {
  let scene = state.scene;
  if (scene?.phase !== "tonight") {
    return {
      ok: false,
      reason: "There is nothing to choose.",
    };
  }
  let moduleChoice = TONIGHT_CHOICES.includes(choice) ? null : firstModuleHook(state, "tonightChosen", scene, choice);
  if (!TONIGHT_CHOICES.includes(choice) && !moduleChoice) {
    return {
      ok: false,
      reason: "There is nothing to choose.",
    };
  }
  let bond = bondOf(state, scene.characterId),
    name = nameFor(state, characterOf(state, scene.characterId)),
    summary = "";
  if (
    (choice === "two" &&
      (adjustBondAxis(bond, "romance", TONIGHT_TWO.romance, {
        at: state.minutes,
      }),
      (summary = "you stayed in, just the two of you")),
    choice === "tell")
  ) {
    let fact = [...(state.facts ?? [])]
      .reverse()
      .find((candidate) => candidate.act === "engaged" && candidate.with === scene.characterId);
    if (fact) {
      for (let character of castInTown(state)) {
        if (character.id !== scene.characterId && hasMet2(state, character.id)) {
          tellFactTo(state, character.id, fact.id, {
            from: "you",
          });
        }
      }
    }
    summary = "you called everyone";
  }
  if (choice === "out") {
    let slot = celebrateSlot(state, scene.characterId);
    if (!slot.place) {
      return {
        ok: false,
        reason: `${slot.why}.`,
      };
    }
    createGroupPlan(state, {
      characterId: scene.characterId,
      kind: "date",
      place: slot.place,
      at: slot.at,
      by: "you",
      with: [],
    });
    summary = `you went out to celebrate at ${slot.placeName}`;
  }
  if (moduleChoice) {
    summary = moduleChoice.line;
    if (moduleChoice.next) {
      scene.next = moduleChoice.next;
    }
  }
  scene.tonight = choice;
  scene.phase = null;
  scene.outcome = {
    ...scene.outcome,
    headline: `${scene.outcome?.headline ?? `${name} said yes.`} \xB7 ${summary[0].toUpperCase()}${summary.slice(1)}.`,
  };
  scene.verdict = {
    ...(scene.verdict ?? {}),
    headline: scene.outcome.headline,
    stamp: "ENGAGED",
  };
  endScene(scene, bond, {
    endedBy: "accepted",
  });
  rememberScene(state, scene);
  logNote(state, `The ${partOfDay(state.minutes)} of the proposal: ${summary}`, "social");
  return {
    ok: true,
    choice: choice,
  };
}

export {
  ENGAGED_GAINS,
  PROPOSAL_BASE_CHANCE,
  PROPOSAL_HOW,
  PROPOSAL_HOW_WEIGHT,
  PROPOSAL_TURNED_DOWN,
  PROPOSAL_YOUR_NO,
  RING_WEIGHT,
  TONIGHT_CHOICES,
  WEDDING_ACTS,
  WEDDING_DAY_MINUTES,
  partOfDay,
  proposalChance,
  proposalYes,
  proposeAbout,
  proposeInfo,
  proposeTonight,
  proposeWhy,
  ringCare,
  ringChip,
  ringChips,
  ringMove,
  ringsInBag,
  settlePropose,
  toTonight,
  tonightTitle,
  tonightView,
  weddingOf,
};
