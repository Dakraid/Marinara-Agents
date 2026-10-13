// Ring-viewing asks and wedding anniversaries (reminders, missed, kept)
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { adjustBondAxis, bondTier, hasMet } from "../relationships/bonds.mjs";
import { INITIATIVE_ASK_CHANCES } from "../relationships/milestones.mjs";
import { personKnowsFact } from "../network/town-facts.mjs";
import { approachDue, knobsOf } from "./romantic-acts.mjs";
import { hurtBond } from "./jealousy.mjs";
import { weddingOf } from "./proposal.mjs";
import { ANNIVERSARY_EFFECTS } from "./wedding-morning.mjs";
import { bondOf, characterOf, logNote, nameFor } from "../game.mjs";

var RING_FRIEND_TIER = 2;
var RING_VISIT = {
  show: 3,
  modest: 1,
};
function ringVisits(game, events) {
  let wedding = weddingOf(game);
  if (!wedding) {
    return;
  }
  let engagedFact = (game.facts ?? []).findLast((fact) => fact.act === "engaged" && fact.with === wedding.characterId);
  if (engagedFact) {
    wedding.ringSeen ??= {};
    for (let bond of Object.values(game.bonds)) {
      let charId = bond.characterId;
      if (
        !(
          charId === wedding.characterId ||
          wedding.ringSeen[charId] ||
          bond.asks ||
          !hasMet(bond) ||
          bondTier(bond, "friendship") < RING_FRIEND_TIER
        ) &&
        !(!personKnowsFact(game, charId, engagedFact.id) || characterOf(game, charId)?.away) &&
        !(
          seededRandom(game.seed, charId, String(events), "ring") >=
          (INITIATIVE_ASK_CHANCES[knobsOf(bond).initiative ?? 1] ?? 0)
        )
      ) {
        wedding.ringSeen[charId] = true;
        bond.asks = {
          id: "see-ring",
          at: game.minutes,
          due: approachDue(bond, game.minutes),
        };
        return;
      }
    }
  }
}
var marriedTo = (game, charId) => bondOf(game, charId)?.status === "married";
var isMarriedToAnyone = (game) => Object.values(game.bonds ?? {}).some((bond) => bond.status === "married");
function anniversaryTick(game, events) {
  let day = clockFromMinutes(game.minutes).dayIndex;
  for (let wedding of game.weddings ?? []) {
    let bond = bondOf(game, wedding.characterId);
    if (!bond || bond.status !== "married") {
      wedding.annivDue = null;
      continue;
    }
    let charName = nameFor(game, characterOf(game, wedding.characterId));
    if (
      (Number.isFinite(wedding.annivDue) &&
        day > wedding.annivDue &&
        (wedding.annivKept ||
          (hurtBond(bond, ANNIVERSARY_EFFECTS.missed),
          events.push({
            id: "anniversary-missed",
            characterId: wedding.characterId,
            text: `You forgot your anniversary with ${charName}.`,
          }),
          logNote(game, `Forgot the anniversary with ${charName}`, "social")),
        (wedding.annivDue = null)),
      day > wedding.day && (day - wedding.day) % 120 === 0)
    ) {
      wedding.annivDue = day;
      wedding.annivKept = false;
      let years = (day - wedding.day) / 120;
      events.push({
        id: "anniversary",
        characterId: wedding.characterId,
        text: `Today is your anniversary with ${charName}${years > 1 ? ` (${years} years)` : ""}: go out together, or give them something.`,
      });
    }
  }
}
function anniversaryKept(game, charId, events = []) {
  let day = clockFromMinutes(game.minutes).dayIndex,
    wedding = (game.weddings ?? []).find((w) => w.characterId === charId && w.annivDue === day && !w.annivKept);
  if (!wedding || !marriedTo(game, charId)) {
    return false;
  }
  wedding.annivKept = true;
  let bond = bondOf(game, charId);
  for (let [axis, gain] of Object.entries(ANNIVERSARY_EFFECTS.kept)) {
    adjustBondAxis(bond, axis, gain, {
      at: game.minutes,
    });
  }
  let charName = nameFor(game, characterOf(game, charId));
  events.push({
    id: "anniversary-kept",
    characterId: charId,
    text: `Your anniversary with ${charName}: remembered (+${ANNIVERSARY_EFFECTS.kept.romance} Romance).`,
  });
  logNote(game, `The anniversary with ${charName}`, "social");
  return true;
}

export { RING_FRIEND_TIER, RING_VISIT, anniversaryKept, anniversaryTick, isMarriedToAnyone, marriedTo, ringVisits };
