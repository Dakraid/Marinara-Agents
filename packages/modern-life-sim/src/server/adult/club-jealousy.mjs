// Scarlet Club visits being seen and the partner's jealousy talk scene
import { BOND_AXES, adjustBondAxis } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { approachDue, knobsOf } from "../romance/romantic-acts.mjs";
import { hurtBond, learnedFact } from "../romance/jealousy.mjs";
import { bondOf, castInTown } from "../game.mjs";
import {
  CLUB_PLACE,
  CLUB_TALK_CHOICES,
  CLUB_TALK_MILESTONE,
  CLUB_TALK_TRUST_COSTS,
  CLUB_TOGETHER_BY_DARING,
} from "./tuning.mjs";
import { adultNameFor, adultState } from "./intimate-milestone.mjs";
import { intimacyWaysFor } from "./cast-intimacy.mjs";

var CLUB_VISIT_FACT = "club";
function noteClubVisit(state, adult, notes = []) {
  if (!adult.youAdult) {
    return;
  }
  if (state.at !== CLUB_PLACE.id || state.visit) {
    if (adult.clubAt) {
      adult.clubAt = null;
    }
    return;
  }
  if (adult.clubAt) {
    return;
  }
  adult.clubAt = state.minutes;
  let witnessIds = sawIt(state);
  if (
    (recordTownFact(state, CLUB_VISIT_FACT, {
      place: CLUB_PLACE.id,
      witnesses: witnessIds,
    }),
    !witnessIds.length)
  ) {
    return;
  }
  learnedFact(state, witnessIds, state.facts.at(-1).id, "seen");
  let names = witnessIds.map((id) => adultNameFor(state, id));
  notes.push({
    id: "club-seen",
    text: `${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]} saw you here.`,
  });
  queueClubJealousyTalks(state, adult);
}
var clubJealousyLevel = (state, characterId) => Math.min(2, knobsOf(bondOf(state, characterId)).jealousy ?? 1);
function queueClubJealousyTalks(state, adult) {
  let clubFactIds = new Set((state.facts ?? []).filter((fact) => fact.act === CLUB_VISIT_FACT).map((fact) => fact.id));
  if (clubFactIds.size) {
    for (let character of castInTown(state)) {
      let bond = bondOf(state, character.id);
      if (!bond || !MILESTONE_COUPLE_STATUSES.includes(bond.status)) {
        continue;
      }
      let talked = (adult.clubTalked ??= {})[character.id] ?? [],
        atClubThen = (factId) => {
          let factAt = (state.facts ?? []).find((fact) => fact.id === factId)?.at ?? -1;
          return (adult.clubNights?.list ?? []).some(
            (night) => night.id === character.id && night.from <= factAt && factAt < night.to,
          );
        },
        known = (state.knows?.[character.id] ?? []).filter(
          (knowledge2) =>
            clubFactIds.has(knowledge2.fact) &&
            !talked.includes(knowledge2.fact) &&
            knowledge2.at >= (bond.statusSince ?? 0) &&
            !atClubThen(knowledge2.fact),
        );
      if (
        !known.length ||
        bond.asks ||
        ((adult.clubTalked[character.id] = [...talked, ...known.map((knowledge2) => knowledge2.fact)].slice(-20)),
        clubJealousyLevel(state, character.id) < 1 || !state.rules?.jealousy) ||
        character.job?.place === CLUB_PLACE.id
      ) {
        continue;
      }
      let knowledge = known.find((knowledge2) => knowledge2.how === "seen") ?? known[0];
      bond.asks = {
        id: CLUB_TALK_MILESTONE,
        at: state.minutes,
        due: approachDue(bond, state.minutes, {
          seen: knowledge.how === "seen",
        }),
        about: {
          how: knowledge.how === "seen" ? "seen" : "heard",
          from: knowledge.from ?? null,
        },
      };
    }
  }
}
function clubTalkBondChange(state, adult, characterId, choice) {
  return choice === "together"
    ? {
        ...(CLUB_TOGETHER_BY_DARING[intimacyWaysFor(state, adult, characterId).daring] ?? {}),
      }
    : {
        ...(CLUB_TALK_TRUST_COSTS[choice]?.[clubJealousyLevel(state, characterId)] ?? {}),
      };
}
var bondChangeChips = (change) =>
  Object.entries(change).map(([axis, amount]) => ({
    text: `${amount > 0 ? "+" : ""}${amount} ${axis.toUpperCase()}`,
    ...(amount < 0
      ? {
          bad: true,
        }
      : {}),
  }));
var CLUB_TALK_HANDLERS = {
  whyNot: () => "That is theirs to bring up.",
  begin(state, scene) {
    let about = bondOf(state, scene.characterId)?.asks?.about ?? {};
    scene.leavesAt = null;
    scene.about = {
      club: true,
      how: about.how ?? "heard",
      from: about.from ?? null,
    };
  },
  options(state, scene) {
    let adult = adultState(state),
      characterId = scene.characterId,
      labels = {
        just: "It was just a show",
        sorry: "Sorry",
        together: "Come with me next time",
      };
    return CLUB_TALK_CHOICES.map((choice) => ({
      id: choice,
      label: labels[choice],
      ok: true,
      why: "",
      note: "",
      chips: bondChangeChips(clubTalkBondChange(state, adult, characterId, choice)),
    }));
  },
};
function clubTalkSceneBlocks(state, scene) {
  let howLearned =
    scene.about?.how === "seen"
      ? "they saw the player there themselves"
      : scene.about?.from
        ? `${adultNameFor(state, scene.about.from)} told them`
        : "they heard about it";
  return {
    system: "",
    user: `WHAT THEY FOUND OUT: the player went to the ${CLUB_PLACE.name}, a strip club on the nightlife street (${howLearned}). It bothers them ${clubJealousyLevel(state, scene.characterId) >= 2 ? "a lot" : "a little"}, true to who they are.`,
  };
}
function resolveClubTalk(state, adult, scene, choice) {
  let characterId = scene.characterId,
    bond = bondOf(state, characterId),
    change = clubTalkBondChange(state, adult, characterId, choice),
    before = {
      friendship: bond.friendship,
      romance: bond.romance,
      trust: bond.trust,
    },
    losses = Object.fromEntries(Object.entries(change).filter(([, amount]) => amount < 0));
  if (Object.keys(losses).length) {
    hurtBond(bond, losses);
  }
  for (let [axis, amount] of Object.entries(change)) {
    if (amount > 0) {
      adjustBondAxis(bond, axis, amount, {
        at: state.minutes,
      });
    }
  }
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round(((scene.totals[axis] ?? 0) + bond[axis] - before[axis]) * 10) / 10;
  }
  if (bond.asks?.id === CLUB_TALK_MILESTONE) {
    bond.asks = null;
  }
  let stillBothered = clubJealousyLevel(state, characterId) >= 2,
    daring = intimacyWaysFor(state, adult, characterId).daring;
  return choice === "together"
    ? {
        headline:
          daring === "bold"
            ? "They like the idea."
            : daring === "cautious"
              ? "Not their thing."
              : "They'll think about it.",
        what: `The player suggests they come along next time. ${daring === "bold" ? "They like the idea" : daring === "cautious" ? "It is not their thing at all" : "They are not sure about it"}: they say so in their own way, 2 to 4 short segments.`,
      }
    : choice === "sorry"
      ? {
          headline: "They let it go.",
          what: "The player says sorry. They take it true to who they are, and let it go: 2 to 4 short segments.",
        }
      : {
          headline: stillBothered ? "It still bothers them." : "They let it go.",
          what: `The player says it was just a show. ${stillBothered ? "It still bothers them, and they say so" : "They let it go, a little annoyed"}: 2 to 4 short segments.`,
        };
}

export {
  CLUB_TALK_HANDLERS,
  CLUB_VISIT_FACT,
  clubTalkSceneBlocks,
  noteClubVisit,
  queueClubJealousyTalks,
  resolveClubTalk,
};
