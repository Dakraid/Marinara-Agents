// Bond gains after an intimate night, getting caught in risky spots, fines and venue bans
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { BOND_AXES, applyBondAction } from "../relationships/bonds.mjs";
import { PAIR_CLOSENESS_THRESHOLDS, npcPairBetween } from "../network/npc-pairs.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { WARNINGS_TO_FIRE } from "../jobs/office-rules.mjs";
import { addJobWarning } from "../jobs/office-job.mjs";
import { addBill } from "../money/wallet.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { hasOwnHome, lodgingKindOf, streetSpotOf } from "../home/residence.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { learnedFact } from "../romance/jealousy.mjs";
import { firedFact } from "../jobs/office.mjs";
import { travelFor } from "../travel/vehicles-rides.mjs";
import { advanceTime, bondOf, characterOf, isNpc, logNote, skillLevelsOf, traitsOf } from "../game.mjs";
import { CLUB_PLACE, HOTEL_PLACE } from "./tuning.mjs";
import { intimacyGains, timeTogetherLabel } from "./consent.mjs";
import { LIKED_SOMETHING_GAINS, WAYS_FIT_GAINS } from "./intimacy-ways.mjs";
import { BOLD_SPOT_GAINS, PARTY_PAIR_CLOSE_GAIN, SPOT_BAN_DAYS, SPOT_FINE, placeWithArticle2 } from "./spots.mjs";
import {
  INTIMATE_DAY_MINUTES,
  adultMarkOf,
  adultNameFor,
  intimateBondOf,
  lowerFirstLetter,
  othersInScene,
} from "./intimate-milestone.mjs";
import { applyIntimacyLeans, intimacyWaysFor } from "./cast-intimacy.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";

var INTIMATE_PICTURE_PART_NOTES = {
  start: "It is just starting.",
  rise: "It is well under way.",
  peak: "It is the moment itself.",
  after: "It is right after.",
  one: "",
};
var intimateEachFor = (scene, characterId) =>
  scene.adult?.each?.[characterId] ??
  (characterId === scene.characterId
    ? {
        liked: !!scene.adult?.liked,
        leans: scene.adult?.leans ?? [],
      }
    : {
        liked: false,
        leans: [],
      });
function applyIntimacyBondGains(state, adult, scene, characterId) {
  let bond = bondOf(state, characterId),
    intimateBond = intimateBondOf(adult, characterId),
    first = !intimateBond.times,
    gains = intimacyGains({
      times: intimateBond.times,
      lastAt: intimateBond.last,
      traits: traitsOf(state, characterId),
      at: state.minutes,
    }),
    before = {
      friendship: bond.friendship,
      romance: bond.romance,
      trust: bond.trust,
    },
    adultTurn = scene.adult ?? {},
    each = intimateEachFor(scene, characterId);
  if (each.liked) {
    for (let [axis, gain] of Object.entries(LIKED_SOMETHING_GAINS)) {
      gains[axis] = (gains[axis] ?? 0) + gain;
    }
  }
  if ((adultTurn.chosen ?? 0) > 0 && (adultTurn.fits ?? 0) * 2 > adultTurn.chosen) {
    for (let [axis, gain] of Object.entries(WAYS_FIT_GAINS)) {
      gains[axis] = (gains[axis] ?? 0) + gain;
    }
  }
  let thrill = scene.about?.spot === "spot" && intimacyWaysFor(state, adult, characterId).daring === "bold";
  if (thrill) {
    for (let [axis, gain] of Object.entries(BOLD_SPOT_GAINS)) {
      gains[axis] = (gains[axis] ?? 0) + gain;
    }
  }
  if (Object.keys(gains).length) {
    applyBondAction(
      bond,
      {
        action: "date",
        ...gains,
      },
      {
        at: state.minutes,
        charm: skillLevelsOf(state).charm,
        note: timeTogetherLabel(state.minutes).toLowerCase(),
        today: false,
      },
    );
  }
  applyIntimacyLeans(state, adult, characterId, each.leans ?? []);
  Object.assign(intimateBond, {
    times: intimateBond.times + 1,
    first: intimateBond.first ?? state.minutes,
    last: state.minutes,
    lastDay: clockFromMinutes(state.minutes).dayIndex,
  });
  if (bond.asks?.id === INTIMATE_MILESTONE) {
    bond.asks = null;
  }
  if (bond.asksAfter?.id === INTIMATE_MILESTONE) {
    bond.asksAfter = null;
  }
  let moved = Object.fromEntries(BOND_AXES.map((axis) => [axis, Math.round((bond[axis] - before[axis]) * 10) / 10]));
  return {
    first: first,
    moved: moved,
    thrill: thrill,
  };
}
var GROUP_CLOSENESS_KINDS = ["acquaintances", "friends", "close"];
var formatBondMoveTag = (moved) =>
  BOND_AXES.filter((axis) => moved[axis])
    .map((axis) => `${moved[axis] > 0 ? "+" : "\u2212"}${Math.abs(moved[axis])} ${axis.toUpperCase()}`)
    .join(" \xB7 ");
function finishIntimateNight(state, adult, scene) {
  let characterId = scene.characterId,
    others = othersInScene(scene),
    everyone = [characterId, ...others],
    gainsById = Object.fromEntries(everyone.map((id) => [id, applyIntimacyBondGains(state, adult, scene, id)]));
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round((scene.totals[axis] + gainsById[characterId].moved[axis]) * 10) / 10;
  }
  let sawIds = scene.about?.spot === "hotel" ? sawIt(state, characterId).filter((id) => !everyone.includes(id)) : [],
    heardIds = (scene.about?.heard ?? []).filter((id) => !everyone.includes(id) && !sawIds.includes(id)),
    witnessIds = [...sawIds, ...heardIds];
  for (let id of everyone) {
    recordTownFact(state, INTIMATE_MILESTONE, {
      with: id,
      place: state.at,
      witnesses: witnessIds,
    });
    if (witnessIds.length) {
      learnedFact(state, witnessIds, state.facts.at(-1).id, "seen");
    }
  }
  let heardAnswers = heardIds.map((id) => ({
    id: id,
    tag: "HEARD YOU",
    why: scene.about?.spot === "party" ? "At the party, just outside" : "Home, in another room",
    bad: true,
  }));
  if (state.visit?.characterId === characterId) {
    state.visit.staying = false;
  }
  let hour = clockFromMinutes(state.minutes).hour,
    dayPart = hour >= 6 && hour < 12 ? "the morning" : hour >= 12 && hour < 18 ? "the afternoon" : "the night",
    names = everyone.map((id) => adultNameFor(state, id));
  logNote(state, `Spent ${dayPart} with ${names.join(", ")}`, "social");
  let atSpot = scene.about?.spot === "spot";
  if (!others.length) {
    let answers = [
      ...(atSpot && gainsById[characterId].thrill
        ? [
            {
              id: characterId,
              tag: formatBondMoveTag(gainsById[characterId].moved),
              why: "The thrill \xB7 they are bold",
            },
          ]
        : []),
      ...heardAnswers,
    ];
    if (answers.length) {
      scene.outcome = {
        ...(scene.outcome ?? {}),
        answers: answers,
      };
    }
    return {
      headline: atSpot ? "Nobody found out." : `You spent ${dayPart} together.`,
      stamp: gainsById[characterId].first ? "THE FIRST TIME" : null,
    };
  }
  let pairs = [];
  for (let i = 0; i < everyone.length; i++) {
    for (let j = i + 1; j < everyone.length; j++) {
      let pair = npcPairBetween(state, everyone[i], everyone[j]);
      if (!pair) {
        continue;
      }
      pair.close = Math.min(100, (pair.close ?? 0) + PARTY_PAIR_CLOSE_GAIN);
      let kind = GROUP_CLOSENESS_KINDS.findLast((kind2) => pair.close >= PAIR_CLOSENESS_THRESHOLDS[kind2]);
      if (
        GROUP_CLOSENESS_KINDS.includes(pair.kind) &&
        GROUP_CLOSENESS_KINDS.indexOf(kind) > GROUP_CLOSENESS_KINDS.indexOf(pair.kind)
      ) {
        pair.kind = kind;
      }
      pairs.push({
        a: everyone[i],
        b: everyone[j],
        mood: "good",
        label: "GET ALONG \xB7 CLOSER",
      });
    }
  }
  scene.outcome = {
    ...(scene.outcome ?? {}),
    pairs: pairs,
    answers: [
      ...everyone.map((id) => ({
        id: id,
        tag: formatBondMoveTag(gainsById[id].moved) || "TOGETHER",
        why: [gainsById[id].first ? "The first time" : "", gainsById[id].thrill ? "The thrill" : ""]
          .filter(Boolean)
          .join(" \xB7 "),
      })),
      ...heardAnswers,
    ],
  };
  return {
    headline: `${atSpot ? "Nobody found out. " : ""}You spent ${dayPart} together: ${names.slice(0, -1).join(", ")} and ${names.at(-1)}, and you.`,
    stamp: null,
  };
}
function finishCaughtIntimacy(state, adult, scene) {
  let characterId = scene.characterId,
    cast = eventCast(scene),
    corner = scene.about.corner,
    place = townPlace(state.town, corner.place),
    placeName = placeWithArticle2(place.id, place.name),
    dayIndex = clockFromMinutes(state.minutes).dayIndex;
  for (let id of cast) {
    intimateBondOf(adult, id).lastDay = dayIndex;
    let bond = bondOf(state, id);
    if (bond?.asks?.id === INTIMATE_MILESTONE) {
      bond.asks = null;
    }
    if (bond?.asksAfter?.id === INTIMATE_MILESTONE) {
      bond.asksAfter = null;
    }
  }
  let witnessIds = sawIt(state, characterId).filter((id) => !cast.includes(id));
  for (let id of cast) {
    recordTownFact(state, INTIMATE_MILESTONE, {
      with: id,
      place: place.id,
      witnesses: witnessIds,
    });
    if (witnessIds.length) {
      learnedFact(state, witnessIds, state.facts.at(-1).id, "seen");
    }
  }
  let answers = [],
    atWork = place.id === "office" && !!state.job?.employed;
  if (atWork) {
    let notice = state.job.notice,
      warning = addJobWarning(state.job, state.minutes, `Caught with someone on ${lowerFirstLetter(corner.name)}`);
    if (warning.fired) {
      firedFact(state);
      state.shiftNow = null;
    } else {
      state.job.notice = notice;
    }
    answers.push({
      id: characterId,
      tag: warning.fired ? "FIRED" : `A WARNING AT WORK \xB7 ${warning.warnings} OF ${WARNINGS_TO_FIRE}`,
      why: "It is where you work",
      bad: true,
    });
  } else if (!isOwnStreetPlace(state, place.id)) {
    adult.bans = {
      ...(adult.bans ?? {}),
      [place.id]: state.minutes + SPOT_BAN_DAYS * INTIMATE_DAY_MINUTES,
    };
    answers.push({
      id: characterId,
      tag: `NOT WELCOME AT ${placeName.toUpperCase()} FOR ${SPOT_BAN_DAYS} DAYS`,
      why: "Thrown out",
      bad: true,
    });
  }
  let bill = addBill(state.wallet, {
    kind: "fine",
    amount: SPOT_FINE,
    label: `${place.name} \xB7 a fine`,
    at: state.minutes,
    due: null,
  });
  Object.assign(bill, {
    name: place.name,
    dueWords: "",
  });
  answers.push({
    id: characterId,
    tag: `\u2212$${SPOT_FINE} \xB7 TO BILLS`,
    why: "A fine",
    bad: true,
  });
  for (let id of cast) {
    if (characterOf(state, id)?.job?.place === place.id) {
      answers.push({
        id: id,
        tag: "A WARNING AT WORK",
        why: `It is where ${adultNameFor(state, id)} works`,
        bad: true,
      });
    }
  }
  scene.outcome = {
    ...(scene.outcome ?? {}),
    answers: answers,
  };
  if (state.visit?.characterId === characterId) {
    state.visit.staying = false;
  }
  logNote(state, `Found with ${cast.map((id) => adultNameFor(state, id)).join(", ")} at ${placeName}`, "social");
  let events = [];
  if (!atWork && !isOwnStreetPlace(state, place.id)) {
    if (
      (Object.assign(state, {
        fitting: null,
        suits: null,
        rideDue: null,
      }),
      place.inside)
    ) {
      state.at = place.inside;
    } else {
      let destination = hasOwnHome(state) ? "home" : lodgingKindOf(state) === "street" ? streetSpotOf(state) : "park",
        minutes = destination === state.at ? 0 : travelFor(state, state.at, destination);
      events = minutes
        ? advanceTime(state, minutes, {
            walking: true,
          }).events
        : [];
      if (!events.some((ev) => ev.id === "fainted")) {
        state.at = destination === "home" && !hasOwnHome(state) ? streetSpotOf(state) : destination;
      }
    }
  }
  return {
    headline: atWork ? "Somebody found you." : `Somebody found you: you had to leave ${placeName}.`,
    stamp: "CAUGHT",
    events: events,
  };
}
var isOwnStreetPlace = (state, placeId) => lodgingKindOf(state) === "street" && placeId === streetSpotOf(state);
function adultKeepsOut(state, adult, placeId, characterId) {
  return state.town?.places?.find((place) => place.id === placeId)?.module !== "adult" || isNpc(state, characterId)
    ? false
    : adultMarkOf(adult, characterId) !== "yes";
}
function adultShutTo(state, adult, placeId) {
  if (!adult.youAdult && (placeId === HOTEL_PLACE.id || placeId === CLUB_PLACE.id)) {
    return "It's for adults only.";
  }
  if (isOwnStreetPlace(state, placeId)) {
    return;
  }
  let bannedUntil = adult.bans?.[placeId] ?? 0;
  if (bannedUntil <= state.minutes) {
    return;
  }
  let place = townPlace(state.town, placeId);
  return `You're not welcome at ${placeWithArticle2(placeId, place?.name ?? "there")} until ${WEEKDAY_FULL_NAMES[clockFromMinutes(bannedUntil).weekday] ?? clockFromMinutes(bannedUntil).weekday} at ${formatClockTime(bannedUntil)}.`;
}
var WEEKDAY_FULL_NAMES = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export { INTIMATE_PICTURE_PART_NOTES, adultKeepsOut, adultShutTo, finishCaughtIntimacy, finishIntimateNight };
