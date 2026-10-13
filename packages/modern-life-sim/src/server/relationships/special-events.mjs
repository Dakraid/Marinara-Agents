// Special event eligibility, option labels, milestone defs and outcomes
import { defineEvent } from "../events/event-registry.mjs";
import { TRUST_CAP_DAYS } from "./bonds.mjs";
import { SPECIAL_EVENTS, SPECIAL_EVENT_IDS } from "./special-event-catalog.mjs";

var eligibleSpecialEvents = (traits) =>
  traits?.dials
    ? SPECIAL_EVENT_IDS.filter((eventId) => !SPECIAL_EVENTS[eventId].later && SPECIAL_EVENTS[eventId].needs(traits))
    : [];
var SPECIAL_OPTION_LABELS = {
  open: "Give it a chance",
  time: "Ask for time",
  friends: "Stay friends",
  commit: "Take it seriously",
  light: "Keep it light",
  support: "Support them",
  advise: "Give advice",
  listen: "Just listen",
  pact: "Make the pact",
  downplay: "Play it down",
  "their-way": "Keep it open, their way",
  exclusive: "Ask for just the two of you",
  let: "Let them",
  fine: "Say you're fine",
  real: "Play for real",
  "let-win": "Let them win",
  help: "Help them say it",
  first: "Say it first",
  pretend: "Pretend not to get it",
  call: "Call it out",
  along: "Play along",
  promise: "Promise it",
  serious: "Something serious",
  slow: "Take it slow",
  see: "See where it goes",
  reassure: "Reassure them",
  limit: "Set a limit",
  ignore: "Brush it off",
};
var SPECIAL_OPTION_NOTES = {
  light: `Their trust stops at Trusting for ${TRUST_CAP_DAYS} days, or until you're partners`,
  "their-way": "You can both see other people, and being partners waits a while",
};
var SPECIAL_STEP_OPTIONS = {
  "late-realization": ["open"],
  "working-up-to-it": ["help", "first"],
};
var PARTNERS_HOLD_DAYS = 21;
function specialEventMilestones(buildBeats) {
  return Object.fromEntries(
    SPECIAL_EVENT_IDS.map((eventId) => {
      let special = SPECIAL_EVENTS[eventId],
        title = special.name;
      return [
        eventId,
        {
          by: "them",
          special: true,
          own: special.trait,
          again: !!special.again,
          title: () => title,
          theirs: special.theirs,
          not: "",
          def: defineEvent({
            id: eventId,
            family: "own",
            label: title,
            beats: buildBeats({
              turns: 4,
              options: special.options,
              resultImage: special.image ? "accepted" : false,
            }),
          }),
        },
      ];
    }),
  );
}
var segmentsInstruction = (what) => `${what}: 2 to 4 short segments.`;
function specialEventOutcome(eventId, choice, context = {}) {
  let good = context.good !== false;
  switch (eventId) {
    case "late-realization":
      return choice === "open"
        ? {
            accepted: true,
            gains: {
              action: "date",
              romance: 6,
            },
            effects: ["dating"],
            headline: "Dating.",
            stamp: "Dating",
            what: segmentsInstruction(
              "The player wants to give it a chance: from now on they are dating. How they take it, relieved, true to who they are",
            ),
          }
        : choice === "time"
          ? {
              accepted: false,
              effects: ["again"],
              headline: "Not yet. They'll wait.",
              what: segmentsInstruction("The player asks for time. They take it as they would, and say they will wait"),
            }
          : {
              accepted: false,
              gains: {
                action: "time",
                friendship: 5,
              },
              effects: ["freezeRomance"],
              headline: "Friends, then.",
              what: segmentsInstruction("The player would rather stay friends. They accept it, true to who they are"),
            };
    case "is-this-real":
      return choice === "commit"
        ? {
            accepted: true,
            gains: {
              action: "reliable",
              trust: 6,
            },
            effects: ["stakes", "partners"],
            headline: "It's real.",
            what: segmentsInstruction(
              "The player takes it seriously: from now on they are partners, a couple, not just dating. How they take that, true to who they are: from now on it matters to them that the player keeps their word",
            ),
          }
        : {
            accepted: false,
            gains: {
              action: "flirt",
              romance: 2,
            },
            effects: ["trustCap"],
            headline: "Keep it light.",
            what: segmentsInstruction(
              "The player keeps it light. They laugh along, true to who they are; something stays unsaid",
            ),
          };
    case "opening-up": {
      let action =
        {
          support: "care",
          advise: "deep",
          listen: "space",
        }[choice] ?? "deep";
      return {
        accepted: good,
        gains: {
          action: action,
          trust: good ? 5 : 2,
          friendship: good ? 2 : 1,
        },
        headline: good ? "They let you in." : "They close up again.",
        what: segmentsInstruction(
          `The player ${
            {
              support: "supports them",
              advise: "gives them advice",
              listen: "just listens, quietly",
            }[choice] ?? "listens"
          }. ${good ? "It reaches them" : "It does not quite reach them, and they close up a little"}`,
        ),
      };
    }
    case "pledge":
      return choice === "pact"
        ? {
            accepted: true,
            gains: {
              action: "reliable",
              friendship: 4,
              trust: 4,
              romance: 2,
            },
            effects: ["stakes"],
            headline: "A pledge made.",
            what: segmentsInstruction(
              "The player makes the pact with them. How they take it: from now on, letting them down will hurt twice as much",
            ),
          }
        : {
            accepted: false,
            costs: {
              trust: -2,
            },
            headline: "You played it down.",
            what: segmentsInstruction("The player plays it down. They take it as they would, a little hurt"),
          };
    case "dont-cage-me":
      return choice === "their-way"
        ? {
            accepted: true,
            effects: ["openBoth", "partnersHold"],
            headline: "Open, their way.",
            what: segmentsInstruction(
              "The player agrees to keep it open, their way: no jealousy, no demands, on either side. How they take it",
            ),
          }
        : good && context.trustTier >= 2
          ? {
              accepted: true,
              headline: "Just the two of you.",
              what: segmentsInstruction(
                "The player asks for just the two of them. They agree, true to who they are, though it costs them something",
              ),
            }
          : {
              accepted: false,
              costs: {
                romance: -2,
              },
              effects: ["partnersWait"],
              headline: "Not like that.",
              what: segmentsInstruction(
                "The player asks for just the two of them. They say no, and give their reason in their own words; they are still seeing each other",
              ),
            };
    case "looking-after-you":
      return choice === "let"
        ? {
            accepted: true,
            gains: {
              action: "care",
              trust: 3,
              friendship: 3,
            },
            effects: ["care"],
            headline: "You let them look after you.",
            what: segmentsInstruction(
              "The player lets them look after them: they feed them, or make them rest. How it goes",
            ),
          }
        : {
            accepted: false,
            costs: {
              friendship: -1,
            },
            headline: "You say you're fine.",
            what: segmentsInstruction("The player says they are fine. They let it go, still worried"),
          };
    case "the-contest":
      return choice === "real"
        ? {
            accepted: !!context.won,
            gains: {
              action: "challenge",
              friendship: context.won ? 5 : 3,
            },
            effects: ["xp"],
            headline: context.won ? "You won." : "They won.",
            what: segmentsInstruction(
              context.won
                ? "The player played for real and WON. How they take losing, true to who they are"
                : "The player played for real and LOST. How they take winning, true to who they are",
            ),
          }
        : {
            accepted: false,
            costs: {
              friendship: -3,
              trust: -1,
            },
            headline: "They noticed.",
            what: segmentsInstruction(
              "The player let them win on purpose, and they noticed. They react, true to who they are",
            ),
          };
    case "working-up-to-it":
      return choice === "help"
        ? {
            accepted: true,
            gains: {
              action: "date",
              romance: 3,
            },
            effects: ["dating"],
            headline: "Dating.",
            stamp: "Dating",
            what: segmentsInstruction(
              "The player helps them get the words out: they finally say it, and from now on they are dating",
            ),
          }
        : choice === "first"
          ? {
              accepted: true,
              gains: {
                action: "date",
                romance: 3,
              },
              effects: ["dating"],
              headline: "Dating.",
              stamp: "Dating",
              what: segmentsInstruction("The player says it first: from now on they are dating. How they take it"),
            }
          : {
              accepted: false,
              costs: {
                romance: -4,
              },
              gains: {
                action: "time",
                friendship: 3,
              },
              effects: ["putOffConfession"],
              headline: "You let it pass.",
              what: segmentsInstruction(
                "The player pretends not to understand. They let it go, relieved and a little hurt",
              ),
            };
    case "not-that-i-like-you":
      return choice === "call"
        ? context.trustTier >= 2
          ? {
              accepted: true,
              gains: {
                action: "flirt",
                romance: 5,
              },
              headline: "They admit it. Sort of.",
              what: segmentsInstruction("The player calls it out, and they admit it, in their own sharp way"),
            }
          : {
              accepted: false,
              costs: {
                romance: -2,
                friendship: -1,
              },
              headline: "They shut it down.",
              what: segmentsInstruction("The player calls it out, and they shut down, denying it harder"),
            }
        : {
            accepted: false,
            gains: {
              action: "time",
              friendship: 2,
              romance: 1,
            },
            headline: "You play along.",
            what: segmentsInstruction("The player plays along and lets them keep denying it. How they take that"),
          };
    case "the-dream-date":
      return choice === "promise"
        ? {
            accepted: true,
            gains: {
              action: "date",
              romance: 2,
            },
            headline: "Their dream date.",
            what: segmentsInstruction(
              "The player promises that one day it will happen (no day is set). How they take it",
            ),
          }
        : {
            accepted: true,
            gains: {
              action: "time",
              romance: 1,
            },
            headline: "Their dream date.",
            what: segmentsInstruction("The player just listens, and lets them dream out loud. How it ends"),
          };
    case "about-the-future":
      return choice === "serious"
        ? {
            accepted: true,
            gains: {
              action: "reliable",
              trust: 5,
              romance: 3,
            },
            headline: "You want the same.",
            what: segmentsInstruction(
              "The player says they want something serious. It is what they want too. How they say it",
            ),
          }
        : choice === "slow"
          ? {
              accepted: true,
              gains: {
                action: "reliable",
                trust: 3,
              },
              headline: "One step at a time.",
              what: segmentsInstruction(
                "The player says they want to take it slow. They can live with that, and say so plainly",
              ),
            }
          : {
              accepted: false,
              costs: {
                romance: -4,
              },
              gains: {
                action: "reliable",
                trust: 1,
              },
              effects: ["partnersWait"],
              headline: "Not what they want.",
              what: segmentsInstruction(
                "The player would rather see where it goes. That is not what they want, and they say so plainly, with their reason",
              ),
            };
    case "a-jealous-scene":
      return choice === "reassure"
        ? {
            accepted: good,
            gains: good
              ? {
                  action: "time",
                  trust: 4,
                  romance: 2,
                }
              : {
                  action: "time",
                  trust: 1,
                },
            effects: ["driftClear"],
            headline: good ? "They feel better." : "It does not quite land.",
            what: segmentsInstruction(
              good
                ? "The player reassures them, and it reaches them"
                : "The player reassures them, but they are not convinced yet",
            ),
          }
        : choice === "limit"
          ? context.trustTier >= 2
            ? {
                accepted: true,
                gains: {
                  action: "space",
                  friendship: 2,
                },
                effects: ["driftClear"],
                headline: "They respect it.",
                what: segmentsInstruction("The player sets a limit. They respect it, true to who they are"),
              }
            : {
                accepted: false,
                costs: {
                  friendship: -3,
                  romance: -2,
                },
                effects: ["driftClear"],
                headline: "They close up.",
                what: segmentsInstruction("The player sets a limit. They take it badly and close up"),
              }
          : {
              accepted: false,
              costs: {
                trust: -6,
                romance: -4,
              },
              effects: ["driftClear"],
              headline: "It hurt.",
              what: segmentsInstruction("The player brushes it off. It hurts them, and they say so"),
            };
    default:
      return {
        accepted: false,
        headline: "",
        what: segmentsInstruction("It ends"),
      };
  }
}

export {
  PARTNERS_HOLD_DAYS,
  SPECIAL_OPTION_LABELS,
  SPECIAL_OPTION_NOTES,
  SPECIAL_STEP_OPTIONS,
  eligibleSpecialEvents,
  specialEventMilestones,
  specialEventOutcome,
};
