// Cast pairs turn rivals over the player
import { seededRandom } from "../schedule/whereabouts.mjs";
import { hasMet } from "./bonds.mjs";
import { romanticAct } from "../romance/romantic-acts.mjs";
import { isPartner } from "../romance/jealousy.mjs";
import { bondOf } from "../game.mjs";

var RIVALS_ROMANCE_MIN = 35;
var RIVALS_CHANCE = 0.15;
function rivalsForYou(state, day) {
  let heardFlirt = (knowerId, targetId) =>
    (state.knows?.[knowerId] ?? []).some((known) => {
      let fact = (state.facts ?? []).find((candidate) => candidate.id === known.fact);
      return !!fact && romanticAct(state, fact.act) && fact.with === targetId;
    });
  for (let pair of Object.values(state.pairs ?? {})) {
    if (!["acquaintances", "friends"].includes(pair.kind)) {
      continue;
    }
    let firstBond = bondOf(state, pair.a),
      secondBond = bondOf(state, pair.b);
    if (!(
      !firstBond ||
      !secondBond ||
      !hasMet(firstBond) ||
      !hasMet(secondBond) ||
      firstBond.romance < RIVALS_ROMANCE_MIN ||
      secondBond.romance < RIVALS_ROMANCE_MIN ||
      (isPartner(state, pair.a) && isPartner(state, pair.b)) ||
      (!heardFlirt(pair.a, pair.b) && !heardFlirt(pair.b, pair.a)) ||
      seededRandom(state.seed, pair.a, pair.b, String(day), "rivals") >= RIVALS_CHANCE
    )) {
      pair.kind = "rivals";
      pair.detail = "both have feelings for the player";
      state.week.items.push({
        kind: "rivals",
        a: pair.a,
        b: pair.b,
        at: state.minutes,
      });
    }
  }
}

export { RIVALS_CHANCE, rivalsForYou };
