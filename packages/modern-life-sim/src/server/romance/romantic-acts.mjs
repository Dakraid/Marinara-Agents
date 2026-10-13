// Romantic acts, archetype knobs, approach timing
import { relationshipProfile } from "../traits/traits.mjs";
import { activeModules, milestoneOfInactiveModule } from "../modules/module-registry.mjs";

var ROMANTIC_ACTS = ["flirt", "confess", "kiss", "dating", "partners", "living", "date"];
var ALWAYS_ROMANTIC_ACTS = [...ROMANTIC_ACTS];
var romanticAct = (state, act) =>
  ALWAYS_ROMANTIC_ACTS.includes(act) ||
  (ROMANTIC_ACTS.includes(act) && activeModules(state).length > 0 && !milestoneOfInactiveModule(state, act));
var INITIATIVE_APPROACH_HOURS = [36, 20, 8, 4];
var APPROACH_STAYS = 60;
var knobsOf = (bond) => relationshipProfile(bond).knobs;
var approachDue = (bond, from, { seen = false } = {}) =>
  from + Math.round((INITIATIVE_APPROACH_HOURS[knobsOf(bond).initiative ?? 1] ?? 20) * 60 * (seen ? 0.5 : 1));

export { APPROACH_STAYS, ROMANTIC_ACTS, approachDue, knobsOf, romanticAct };
