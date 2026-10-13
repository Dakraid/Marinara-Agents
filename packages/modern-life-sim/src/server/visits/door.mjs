// Someone at the player's door
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { refillNeeds } from "../needs/needs.mjs";
import { answerFoodDoor, foodDoorView } from "../relationships/friend-perks.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { NEGATIVE_ASKS, hurtBond } from "../romance/jealousy.mjs";
import { milestoneFor } from "../milestones/milestone-availability.mjs";
import { bondOf, characterOf, logNote, nameFor, skillLevelsOf, traitsOf } from "../game.mjs";

function doorView(state) {
  if (state.foodDoor) {
    return foodDoorView(state);
  }
  let approach = state.approach;
  if (!approach?.door) {
    return null;
  }
  let character = characterOf(state, approach.characterId);
  if (!character) {
    return null;
  }
  let says =
    milestoneFor(state, character.id)?.says ??
    (["jealous", "talk", "stay-away"].includes(approach.milestone) ? "WANTS TO TALK" : "WANTS TO ASK YOU SOMETHING");
  return {
    characterId: character.id,
    name: nameFor(state, character),
    milestone: approach.milestone,
    says: says,
    unit: state.residence?.unit ?? "",
  };
}
function answerDoor(state, open) {
  if (state.foodDoor) {
    return answerFoodDoor(state, open, {
      eat: (hunger) => {
        state.needs = refillNeeds(state.needs, {
          hunger: hunger,
          fitness: skillLevelsOf(state).fitness,
        });
      },
    });
  }
  let approach = state.approach;
  if (!approach?.door) {
    return {
      ok: false,
      reason: "Nobody is at your door.",
    };
  }
  let character = characterOf(state, approach.characterId),
    name = character ? nameFor(state, character) : "They";
  if (open) {
    approach.door = false;
    approach.opened = true;
    return {
      ok: true,
      came: {
        characterId: approach.characterId,
        milestone: approach.milestone,
        name: name,
      },
    };
  }
  let bond = bondOf(state, approach.characterId);
  if (bond?.asks?.id === "drop-by") {
    bond.asks = null;
  } else if (bond?.asks) {
    bond.asks.due = approachDue(bond, state.minutes);
    if ([...NEGATIVE_ASKS, "a-jealous-scene"].includes(bond.asks.id)) {
      hurtBond(bond, {
        trust: TRAIT_BEHAVIOURS.takesItHard(traitsOf(state, approach.characterId)) ? -3 : -1,
      });
    }
  }
  state.approach = null;
  logNote(state, `Did not open the door to ${name}`, "social");
  return {
    ok: true,
    said: `You don't open. ${name} leaves.`,
  };
}

export { answerDoor, doorView };
