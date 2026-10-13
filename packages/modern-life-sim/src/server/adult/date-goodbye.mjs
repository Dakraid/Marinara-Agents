// Ending a great date somewhere together: offered places, their ask and the not-tonight answer
import { seededRandom } from "../schedule/whereabouts.mjs";
import { INITIATIVE_ASK_CHANCES } from "../relationships/milestones.mjs";
import { outingDeal, outingNext } from "../outings/outing.mjs";
import { knobsOf } from "../romance/romantic-acts.mjs";
import { hurtBond } from "../romance/jealousy.mjs";
import { bondOf, traitsOf } from "../game.mjs";
import { HOTEL_ROOM_PRICE } from "./tuning.mjs";
import { ASK_MOOD_BOOST, ASK_MOOD_HIGH, ASK_MOOD_MIN, halvedTurnDownHurt } from "./spots.mjs";
import {
  INTIMATE_DAY_MINUTES,
  adultNameFor,
  consentFor,
  intimateBondOf,
  placesToGoTogether,
  privateSpotHere,
  spotDescription,
} from "./intimate-milestone.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";

var ADULT_NOT_TONIGHT_ID = "adult-not-tonight";
function dateEndPlacesOffered(state, outing, { asked = false } = {}) {
  if (
    !outing ||
    outing.kind !== "date" ||
    outing.ruined ||
    outing.leaving ||
    outing.closing ||
    outing.group?.length ||
    (outing.mood < ASK_MOOD_MIN && !asked) ||
    consentFor(state, outing.characterId).how !== "yes"
  ) {
    return null;
  }
  let places = dateEndPlaces(state, outing).filter(
    (place) => place.id !== "spot" || !place.refuse?.some((refuser) => refuser.id === outing.characterId),
  );
  return places.length ? places : null;
}
function dateEndPlaces(state, outing) {
  let characterId = outing.characterId,
    karaokeRoom =
      privateSpotHere(state, characterId) === "karaoke"
        ? [
            {
              id: "karaoke",
              name: "The karaoke room",
              minutes: 0,
              note: "right here",
            },
          ]
        : [],
    deal = !outing.paid && outing.by === "you" ? outingDeal(state, outing) : null,
    reserve = deal && !deal.treat ? 2 * (deal.costs ?? 0) : 0;
  return [
    ...karaokeRoom,
    ...placesToGoTogether(state, characterId).filter(
      (place) => place.id !== "hotel" || state.wallet.cash - reserve >= HOTEL_ROOM_PRICE,
    ),
  ];
}
function dateEndTheyAsk(state, adult, outing) {
  if (adult.dateAsk?.at === outing.startedAt) {
    return adult.dateAsk.yes;
  }
  if (
    !(outing.phase === "goodbye" || outing.ending || outing.exchange + 1 >= outing.max || outingNext(state).last) ||
    !dateEndPlacesOffered(state, outing)
  ) {
    return false;
  }
  let bond = bondOf(state, outing.characterId),
    chance = outing.dream
      ? 1
      : (INITIATIVE_ASK_CHANCES[knobsOf(bond).initiative ?? 1] ?? 0) *
        (outing.mood >= ASK_MOOD_HIGH ? ASK_MOOD_BOOST : 1),
    yes = seededRandom(state.seed, outing.characterId, String(outing.startedAt), "adult-date") < chance;
  adult.dateAsk = {
    at: outing.startedAt,
    yes: yes,
  };
  return yes;
}
function adultFarewellAsk(state, adult, characterId) {
  let outing = state.outing;
  return outing?.characterId !== characterId || !dateEndTheyAsk(state, adult, outing)
    ? null
    : "They also let the player know, in their own words, that they would like the player to come over with them; the player answers at the goodbye, so nobody goes anywhere yet.";
}
function adultGoodbyeOptions(state, adult, outing) {
  let places = dateEndPlacesOffered(state, outing, {
    asked: adult.dateAsk?.at === outing.startedAt && !!adult.dateAsk.yes,
  });
  if (!places) {
    return [];
  }
  let askTag = dateEndTheyAsk(state, adult, outing)
      ? `${adultNameFor(state, outing.characterId).toUpperCase()} ASKS YOU OVER`
      : null,
    placeOptions = places.map((place) => ({
      id: `milestone:${INTIMATE_MILESTONE}@${place.id}`,
      label: place.name,
      note: place.note,
      milestone: INTIMATE_MILESTONE,
      ok: true,
      need: 0,
      under: INTIMATE_MILESTONE,
      ...(askTag
        ? {
            ask: askTag,
          }
        : {}),
    }));
  if (!askTag) {
    return [
      {
        id: `open:${INTIMATE_MILESTONE}`,
        label: "Somewhere together",
        opens: INTIMATE_MILESTONE,
        ok: true,
        need: 0,
      },
      ...placeOptions,
    ];
  }
  let { days: days, ...hurt } = halvedTurnDownHurt(traitsOf(state, outing.characterId));
  return [
    ...placeOptions,
    {
      id: ADULT_NOT_TONIGHT_ID,
      label: "Not now",
      ok: true,
      need: 0,
      ask: askTag,
      chips: Object.entries(hurt).map(([axis, amount]) => ({
        text: `${amount} ${axis.toUpperCase()}`,
        bad: true,
      })),
    },
  ];
}
function adultGoodbyeWords(state, adult, choiceId) {
  let outing = state.outing;
  if (choiceId === ADULT_NOT_TONIGHT_ID) {
    return "The date went really well. They asked the player to come over, and the player says not now, gently. They take it true to who they are, and they say goodbye.";
  }
  let [prefix, placeId] = String(choiceId ?? "").split("@");
  if (prefix !== `milestone:${INTIMATE_MILESTONE}` || !outing) {
    return null;
  }
  let place = dateEndPlaces(state, outing).find((place2) => place2.id === placeId);
  return place?.id === "spot"
    ? "The date went really well, and it does not end here: they slip off together, right here. Nothing more happens in these lines; what comes next is a scene of its own. 2 to 4 short segments."
    : place?.id === "karaoke"
      ? "The date went really well, and it does not end here: they stay on in their karaoke room, the two of them alone. Nothing more happens in these lines; what comes next is a scene of its own. 2 to 4 short segments."
      : `The date went really well, and it does not end here: they leave together for ${spotDescription(place)}. Nothing more happens in these lines; what comes next is a scene of its own. 2 to 4 short segments.`;
}
function adultGoodbyeChosen(state, adult, choiceId, outing) {
  let characterId = outing.characterId,
    theyAsked = adult.dateAsk?.at === outing.startedAt && adult.dateAsk.yes;
  if (choiceId === ADULT_NOT_TONIGHT_ID && theyAsked) {
    let { days: days, ...hurt } = halvedTurnDownHurt(traitsOf(state, characterId));
    hurtBond(bondOf(state, characterId), hurt);
    intimateBondOf(adult, characterId).retry = state.minutes + days * INTIMATE_DAY_MINUTES;
  }
  if (theyAsked && String(choiceId).startsWith(`milestone:${INTIMATE_MILESTONE}@`)) {
    adult.dateYes = {
      id: characterId,
      until: state.minutes + 180,
    };
  }
  if (String(choiceId).startsWith(`milestone:${INTIMATE_MILESTONE}@`)) {
    adult.dateGo = {
      id: characterId,
      until: state.minutes + 180,
      place: outing.place,
    };
  }
}

export { adultFarewellAsk, adultGoodbyeChosen, adultGoodbyeOptions, adultGoodbyeWords };
