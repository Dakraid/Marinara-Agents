// Friends voicing opinions about the player's partners: topic pick, prompts, options, outcomes
import { daysBetween } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { adjustBondAxis, bondTier, hasMet } from "./bonds.mjs";
import { INITIATIVE_ASK_CHANCES, MILESTONE_COUPLE_STATUSES } from "./milestones.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { tellFactTo } from "../network/town-facts.mjs";
import { approachDue, knobsOf } from "../romance/romantic-acts.mjs";
import { isPartner, learnedFact, togetherAt } from "../romance/jealousy.mjs";
import { bondOf, characterOf, isCharacterHere, nameFor, traitsOf } from "../game.mjs";

var OPINION_FROM = 2;
var AGAINST_PAIRS = ["ex", "rivals"];
var FOR_PAIRS = ["friends", "close", "family"];
var STEP_SOON = 7;
var STEP_LATE = 30;
var OPINION_STEPS = ["living", "engaged"];
var STEP_BEFORE_ACTS = {
  living: ["partners", "dating"],
  engaged: ["living", "partners"],
};
var OPINION_EFFECTS = {
  agree: {
    friend: 2,
  },
  defend: {
    friend: -1,
  },
  doubt: -1,
  warm: 1,
  heardTrust: 2,
  heard: 0.5,
};
var ROMANTIC_FACT_ACTS = ["flirt", "confess", "kiss", "dating", "partners", "living", "date"];
var partnerCharacterIds = (game) =>
  Object.values(game.bonds ?? {})
    .filter((bond) => MILESTONE_COUPLE_STATUSES.includes(bond.status))
    .map((bond) => bond.characterId);
var youMaySee = (game, charId, otherId) => {
  let bond = bondOf(game, charId),
    openYou = bond?.open?.you;
  return !!bond?.openAgreement || (!!openYou && (otherId in openYou || "*" in openYou));
};
var factsKnownBy = (game, charId) =>
  (game.knows?.[charId] ?? [])
    .map((known) => (game.facts ?? []).find((fact) => fact.id === known.fact))
    .filter(Boolean);
function opinionTopic(game, charId) {
  let opinions = bondOf(game, charId)?.opinions ?? {},
    facts = factsKnownBy(game, charId),
    partnerIds = partnerCharacterIds(game).filter((id) => id !== charId);
  for (let partnerId of partnerIds) {
    let romanticFact = facts
      .filter(
        (fact) =>
          ROMANTIC_FACT_ACTS.includes(fact.act) &&
          fact.with &&
          fact.with !== partnerId &&
          fact.with !== charId &&
          !partnerIds.includes(fact.with) &&
          !youMaySee(game, partnerId, fact.with) &&
          fact.at >= togetherAt(bondOf(game, partnerId)),
      )
      .at(-1);
    if (romanticFact && !opinions[`wrong:${partnerId}:${romanticFact.with}`]) {
      return {
        topic: "wrong",
        partner: partnerId,
        with: romanticFact.with,
        fact: romanticFact.id,
        key: `wrong:${partnerId}:${romanticFact.with}`,
        stance: "against",
      };
    }
  }
  for (let partnerId of partnerIds) {
    if (
      opinions[`partner:${partnerId}`] ||
      !facts.some(
        (fact) => ["dating", "partners", "living", "engaged", "married"].includes(fact.act) && fact.with === partnerId,
      )
    ) {
      continue;
    }
    let pair = npcPairBetween(game, charId, partnerId),
      stance =
        pair && AGAINST_PAIRS.includes(pair.kind) ? "against" : pair && FOR_PAIRS.includes(pair.kind) ? "for" : null;
    if (stance) {
      return {
        topic: "partner",
        partner: partnerId,
        pair: pair.kind,
        key: `partner:${partnerId}`,
        stance: stance,
      };
    }
  }
  for (let partnerId of partnerIds) {
    let stepFact = facts.filter((fact) => OPINION_STEPS.includes(fact.act) && fact.with === partnerId).at(-1);
    if (!stepFact || opinions[`step:${partnerId}:${stepFact.act}`]) {
      continue;
    }
    let beforeFact = (game.facts ?? [])
      .filter(
        (fact) =>
          STEP_BEFORE_ACTS[stepFact.act].includes(fact.act) && fact.with === partnerId && fact.at <= stepFact.at,
      )
      .at(-1);
    if (!beforeFact) {
      continue;
    }
    let days = daysBetween(beforeFact.at, stepFact.at),
      stance = days < STEP_SOON ? "against" : days > STEP_LATE ? "for" : null;
    if (stance) {
      return {
        topic: "step",
        partner: partnerId,
        step: stepFact.act,
        days: days,
        key: `step:${partnerId}:${stepFact.act}`,
        stance: stance,
      };
    }
  }
  return null;
}
function friendOpinion(game, bond, events) {
  let charId = bond.characterId;
  if (
    bond.asks ||
    !hasMet(bond) ||
    isPartner(game, charId) ||
    bondTier(bond, "friendship") < OPINION_FROM ||
    characterOf(game, charId)?.away
  ) {
    return false;
  }
  let topic = opinionTopic(game, charId);
  return !topic ||
    seededRandom(game.seed, charId, String(events), "opinion") >=
      (INITIATIVE_ASK_CHANCES[knobsOf(bond).initiative ?? 1] ?? 0)
    ? false
    : ((bond.asks = {
        id: "friend-opinion",
        about: topic,
        at: game.minutes,
        due: approachDue(bond, game.minutes),
      }),
      true);
}
function opinionAbout(game, scene) {
  let about = scene.about ?? {},
    nameOfId = (charId) => characterOf(game, charId)?.name ?? "someone",
    friendName = nameOfId(scene.characterId),
    partnerName = nameOfId(about.partner);
  return about.topic === "wrong"
    ? `${friendName} knows the player is seeing ${nameOfId(about.with)} behind ${partnerName}'s back (${partnerName} is the player's partner and did not agree). ${friendName} tells the player what they think of it, true to who they are.`
    : about.topic === "partner"
      ? about.stance === "against"
        ? `${friendName} and ${partnerName} (the player's partner) ${about.pair === "ex" ? "used to be together" : "cannot stand each other"}. ${friendName} tells the player honestly what they think of ${partnerName}, and worries for the player.`
        : `${friendName} and ${partnerName} (the player's partner) get along well. ${friendName} tells the player how happy they are for them, true to who they are.`
      : about.topic === "step"
        ? about.stance === "against"
          ? `The player just ${about.step === "living" ? "moved in with" : "got engaged to"} ${partnerName}, only ${about.days} days after the step before. ${friendName} is happy for them and also thinks it is a bit fast, and says both.`
          : `The player just ${about.step === "living" ? "moved in with" : "got engaged to"} ${partnerName}, after a long time. ${friendName} thinks it is about time, and says so.`
        : "";
}
function opinionOptions(game, scene) {
  let about = scene.about ?? {},
    friendName = nameFor(game, characterOf(game, scene.characterId)).toUpperCase(),
    partnerName = nameFor(
      game,
      characterOf(game, about.partner) ?? {
        id: "",
        name: "them",
      },
    ),
    partnerUpper = partnerName.toUpperCase(),
    friendChips =
      bondTier(bondOf(game, scene.characterId), "friendship") >= 4
        ? []
        : [
            {
              text: `${friendName} ${OPINION_EFFECTS.defend.friend} FRIENDSHIP`,
              bad: true,
            },
          ],
    agreeChip = {
      text: `${friendName} +${OPINION_EFFECTS.agree.friend} FRIENDSHIP`,
    },
    labels =
      about.topic === "wrong"
        ? {
            agree: [
              "You're right",
              "No excuses",
              [
                agreeChip,
                {
                  text: "THEY KEEP IT TO THEMSELVES",
                },
              ],
            ],
            defend: [
              "It's complicated",
              `They may not keep it from ${partnerName}`,
              [
                ...friendChips,
                {
                  text: `THEY MAY TELL ${partnerUpper}`,
                  bad: true,
                },
              ],
            ],
          }
        : about.stance === "for"
          ? {
              agree: [
                "It means a lot",
                "Coming from them, it does",
                [
                  agreeChip,
                  {
                    text: `${partnerUpper} +${OPINION_EFFECTS.warm} ROMANCE`,
                  },
                ],
              ],
              defend: ["Play it cool", "\xABWe'll see\xBB", []],
            }
          : about.topic === "step"
            ? {
                agree: [
                  "Maybe it was fast",
                  "They have a point",
                  [
                    agreeChip,
                    {
                      text: `${partnerUpper} ${OPINION_EFFECTS.doubt} ROMANCE`,
                      bad: true,
                    },
                  ],
                ],
                defend: [
                  "It feels right",
                  `${partnerName} would like hearing that`,
                  [
                    ...friendChips,
                    {
                      text: `IF ${partnerUpper} HEARS \xB7 +${OPINION_EFFECTS.heardTrust} TRUST`,
                    },
                  ],
                ],
              }
            : {
                agree: [
                  "You might be right",
                  `A doubt about ${partnerName}`,
                  [
                    agreeChip,
                    {
                      text: `${partnerUpper} ${OPINION_EFFECTS.doubt} ROMANCE`,
                      bad: true,
                    },
                  ],
                ],
                defend: [
                  `Stand up for ${partnerName}`,
                  "They may not like hearing it",
                  [
                    ...friendChips,
                    {
                      text: `IF ${partnerUpper} HEARS \xB7 +${OPINION_EFFECTS.heardTrust} TRUST`,
                    },
                  ],
                ],
              };
  return ["agree", "defend"].map((id) => ({
    id: id,
    label: labels[id][0],
    note: labels[id][1],
    ok: true,
    why: "",
    chips: labels[id][2],
  }));
}
function settleOpinion({ game: game, scene: scene, bond: bond, choice: choice, at: at }) {
  let about = scene.about ?? {},
    partnerBond = bondOf(game, about.partner),
    friendName = nameFor(game, characterOf(game, scene.characterId)).toUpperCase(),
    partnerName = nameFor(
      game,
      characterOf(game, about.partner) ?? {
        id: "",
        name: "them",
      },
    ).toUpperCase(),
    chips = [];
  if (
    (about.key &&
      (bond.opinions = {
        ...(bond.opinions ?? {}),
        [about.key]: at,
      }),
    choice === "agree")
  ) {
    if (
      (adjustBondAxis(bond, "friendship", OPINION_EFFECTS.agree.friend, {
        at: at,
      }),
      chips.push(
        {
          text: about.stance === "for" ? "IT MEANT A LOT" : "YOU GAVE THEM A POINT",
          step: true,
        },
        {
          text: `${friendName} +${OPINION_EFFECTS.agree.friend} FRIENDSHIP`,
        },
      ),
      partnerBond && about.topic !== "wrong")
    ) {
      let effects = about.stance === "for" ? OPINION_EFFECTS.warm : OPINION_EFFECTS.doubt;
      adjustBondAxis(partnerBond, "romance", effects, {
        at: at,
      });
      chips.push({
        text: `${partnerName} ${effects > 0 ? "+" : ""}${effects} ROMANCE`,
        bad: effects < 0,
      });
    }
  } else {
    if (about.stance === "for") {
      chips.push({
        text: "YOU PLAYED IT COOL",
        step: true,
      });
    } else {
      chips.push({
        text: about.topic === "wrong" ? "IT'S COMPLICATED" : `YOU STOOD UP FOR ${partnerName}`,
        step: true,
      });
      if (bondTier(bond, "friendship") < 4) {
        adjustBondAxis(bond, "friendship", OPINION_EFFECTS.defend.friend, {
          at: at,
        });
        chips.push({
          text: `${friendName} ${OPINION_EFFECTS.defend.friend} FRIENDSHIP`,
          bad: true,
        });
      }
    }
    if (
      partnerBond &&
      about.topic !== "wrong" &&
      about.stance === "against" &&
      (isCharacterHere(game, about.partner) ||
        seededRandom(game.seed, scene.characterId, String(at), "heard") < OPINION_EFFECTS.heard)
    ) {
      adjustBondAxis(partnerBond, "trust", OPINION_EFFECTS.heardTrust, {
        at: at,
      });
      chips.push({
        text: `${partnerName} HEARD IT \xB7 +${OPINION_EFFECTS.heardTrust} TRUST`,
      });
    }
    if (
      about.topic === "wrong" &&
      about.fact &&
      seededRandom(game.seed, scene.characterId, String(at), "tells") <
        TRAIT_BEHAVIOURS.tellsOnYou(traitsOf(game, scene.characterId))
    ) {
      tellFactTo(game, about.partner, about.fact, {
        from: scene.characterId,
        at: at,
      });
      learnedFact(game, [about.partner], about.fact, "heard", scene.characterId);
    }
  }
  scene.outcome = {
    headline: chips[0]?.text ?? "",
    tags: chips,
  };
}
function opinionWhat(game, scene, choice) {
  let about = scene.about ?? {},
    partnerName = characterOf(game, about.partner)?.name ?? "their partner";
  return choice === "agree"
    ? about.stance === "for"
      ? "The player says it means a lot to them. They react, warm, and the talk goes on: 2 to 4 short segments."
      : about.topic === "wrong"
        ? "The player admits they are right, no excuses. They react, true to who they are, and the talk goes on: 2 to 4 short segments."
        : `The player admits they might have a point about ${partnerName}. They react, relieved, and the talk goes on: 2 to 4 short segments.`
    : about.stance === "for"
      ? "The player plays it cool. They take it in their stride, and the talk goes on: 2 to 4 short segments."
      : about.topic === "wrong"
        ? "The player says it is complicated. They are not convinced, and the talk goes on, a little tense: 2 to 4 short segments."
        : `The player stands up for ${partnerName}. They take it as they would, and the talk goes on: 2 to 4 short segments.`;
}

export {
  AGAINST_PAIRS,
  FOR_PAIRS,
  OPINION_EFFECTS,
  OPINION_FROM,
  OPINION_STEPS,
  STEP_LATE,
  STEP_SOON,
  friendOpinion,
  opinionAbout,
  opinionOptions,
  opinionTopic,
  opinionWhat,
  settleOpinion,
  youMaySee,
};
