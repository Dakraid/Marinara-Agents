// Sleep-together availability, special actions, free acts, special nights (engagement/wedding/honeymoon) and stay-the-night
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { isEventRun } from "../events/event-run.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { INITIATIVE_ASK_CHANCES } from "../relationships/milestones.mjs";
import { removeAlbumEntries } from "../album/album.mjs";
import { isAtActiveParty } from "../parties/party.mjs";
import { knobsOf } from "../romance/romantic-acts.mjs";
import { hurtBond } from "../romance/jealousy.mjs";
import { workHomeUntil, workingHome, workingNow } from "../cast/working-now.mjs";
import { dropRefusedJobs } from "../cast/cast-jobs.mjs";
import { bedtimeOf, isAsleep, sleepEndsAt } from "../visits/staying-over.mjs";
import { HONEYMOON_DAYS } from "../romance/wedding-morning.mjs";
import { setOrientation } from "../romance/romanceability.mjs";
import { bondOf, castInTown, characterOf, hasMet2, isCharacterHere, logNote } from "../game.mjs";
import {
  CLUB_DANCE_MILESTONE,
  HOTEL_PLACE,
  INTIMACY_REFUSAL_COSTS,
  INTIMATE_MINUTES,
  STAY_OVER_SPOTS,
  STAY_TONIGHT_WINDOW,
} from "./tuning.mjs";
import {
  INTIMATE_SPECIAL_MINUTES,
  intimacyConsent,
  isStayNightHour,
  timeOfDayPhrase,
  timeTogetherLabel,
} from "./consent.mjs";
import {
  INTIMACY_WAY_OPTIONS,
  LIMIT_STAGES,
  cleanAdultAnswer,
  cleanIntimacyDisposition,
  cleanIntimacyKinks,
} from "./intimacy-ways.mjs";
import { GROUP_INTIMACY_CHANCE, onPairCooldown } from "./spots.mjs";
import {
  ALREADY_TOGETHER_TODAY,
  INTIMATE_DAY_MINUTES,
  PRIVATE_SPOT_LABELS,
  adultMarkOf,
  adultNameFor,
  adultState,
  consentFor,
  consentInputs,
  goTogetherTo,
  groupCandidates,
  groupHereNow,
  intimateBondOf,
  intimateSpotNow,
  livesWithPlayer,
  lowerFirstLetter,
  markArrivedTogether,
  othersInScene,
  placesToGoTogether,
  privateSpotHere,
  publicSpotHere,
  unwillingForSpot,
} from "./intimate-milestone.mjs";
import { pruneStaleAdultAsks } from "./cast-intimacy.mjs";
import { unlockCornerBackdrop } from "./backdrops.mjs";
import { noteClubVisit } from "./club-jealousy.mjs";
import { AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE, INTIMATE_MILESTONE } from "./milestone-ids.mjs";

function adultSleepTogetherAvailability(state, adult, characterId, { place: checkPlace = true } = {}) {
  if (!adult?.on || !adult.youAdult || !hasMet2(state, characterId)) {
    return {
      show: false,
      why: "",
    };
  }
  let consent = intimacyConsentWithSpecial(state, characterId);
  if (consent.how !== "yes") {
    return consent.why === "not again today"
      ? {
          show: true,
          why: ALREADY_TOGETHER_TODAY,
        }
      : {
          show: false,
          why: "",
        };
  }
  if (activeSpecialNight(state, adult, characterId)) {
    return {
      show: true,
      why: "",
    };
  }
  if (workingHome(state, characterId)) {
    return {
      show: true,
      why: `Not now: they're working until ${formatClockTime(workHomeUntil(state, characterId))}`,
    };
  }
  if (!checkPlace || intimateSpotNow(state, characterId) || placesToGoTogether(state, characterId).length) {
    return {
      show: true,
      why: "",
    };
  }
  let character = characterOf(state, characterId);
  return character && workingNow(state, character)
    ? {
        show: true,
        why: "They're at work",
      }
    : state.shiftNow && state.at === "office"
      ? {
          show: true,
          why: "You're at work",
        }
      : {
          show: true,
          why: "Nowhere private to go right now",
        };
}
function adultSpecialActions(state, adult, characterId) {
  if (isAtActiveParty(state)) {
    return {};
  }
  if (isCharacterHere(state, characterId) && isAsleep(state, characterId)) {
    return {};
  }
  let availability = adultSleepTogetherAvailability(state, adult, characterId);
  if (!availability.show) {
    return {};
  }
  let action = {
    group: "US",
    label: "Sleep together",
    minutes: INTIMATE_MINUTES,
    start: {
      kind: "milestone",
      id: INTIMATE_MILESTONE,
    },
  };
  if (availability.why) {
    return {
      [INTIMATE_MILESTONE]: {
        ...action,
        ok: false,
        why: availability.why,
        desc: "",
      },
    };
  }
  let privateSpot = privateSpotHere(state, characterId),
    theyAsked = bondOf(state, characterId)?.asks?.id === INTIMATE_MILESTONE && !bondOf(state, characterId).asks.mine,
    whereOptions = privateSpot
      ? theyAsked
        ? [
            {
              id: privateSpot,
              name: PRIVATE_SPOT_LABELS[privateSpot],
              note: "right here",
            },
          ]
        : []
      : placesToGoTogether(state, characterId),
    who = groupCandidates(state, characterId).map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      note: candidate.note,
      not: candidate.not,
    })),
    moreNote = who.length ? ", or with more" : "";
  return {
    [INTIMATE_MILESTONE]: {
      ...action,
      desc: privateSpot
        ? `${PRIVATE_SPOT_LABELS[privateSpot]} \xB7 just the two of you${moreNote}`
        : `Somewhere private: pick ${who.length ? "who and " : ""}where next`,
      where: whereOptions.map((option) => ({
        id: option.id,
        name: option.name,
        note: option.note,
        ...(option.refuse?.length
          ? {
              refuse: option.refuse,
            }
          : {}),
      })),
      ...(who.length
        ? {
            who: who,
          }
        : {}),
    },
  };
}
function adultSheetAdultToggle(state, adult, characterId) {
  if (!adult.youAdult) {
    return [];
  }
  let castEntry = adult.cast[characterId] ?? {},
    cardAnswer = castEntry.adult === undefined ? null : cleanAdultAnswer(castEntry.adult),
    isAdult = adultMarkOf(adult, characterId) === "yes",
    why =
      typeof castEntry.mark == "boolean"
        ? castEntry.mark
          ? "You marked them as an adult."
          : "You marked them as not an adult."
        : cardAnswer === "yes"
          ? "Their card says they are an adult."
          : cardAnswer === "no"
            ? "Their card says they are not an adult."
            : cardAnswer === "unsaid"
              ? "Their card doesn't say how old they are."
              : "Their card has not been read yet.",
    ask =
      !isAdult && cardAnswer === "no" && castEntry.mark !== false
        ? {
            title: "Their card says they are not an adult",
            why: "Mark them as an adult only if their card was read wrong.",
            yes: "MARK AS ADULT",
          }
        : null;
  return [
    {
      key: "adult",
      on: isAdult,
      title: "Adult",
      why: why,
      ...(ask
        ? {
            ask: ask,
          }
        : {}),
    },
  ];
}
var ADULT_INTIMATE_EVENTS = [INTIMATE_MILESTONE, CLUB_DANCE_MILESTONE, AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE];
var dropAdultFactsForCharacter = (state, characterId) =>
  removeAlbumEntries(
    state,
    (entry) => ADULT_INTIMATE_EVENTS.includes(entry.event) && (entry.cast ?? []).includes(characterId),
  );
function setAdultCharacterOption(state, adult, characterId, key, value) {
  if (!characterOf(state, characterId)) {
    return {
      ok: false,
      reason: "There is nothing like that to change.",
    };
  }
  let castEntry = (adult.cast[characterId] ??= {});
  if (key === "adult") {
    castEntry.mark = value === true;
    delete castEntry.marked;
    pruneStaleAdultAsks(state);
    if (!castEntry.mark) {
      dropRefusedJobs(state, [characterId]);
    }
    if (!castEntry.mark) {
      dropAdultFactsForCharacter(state, characterId);
    }
    return {
      ok: true,
    };
  }
  if (key === "disposition") {
    let disposition = cleanIntimacyDisposition(value);
    if (value && !disposition) {
      return {
        ok: false,
        reason: "Dominant, submissive, switch, or unset.",
      };
    }
    castEntry.disposition = disposition;
    return {
      ok: true,
    };
  }
  if (key === "kinks") {
    if (!Array.isArray(value)) {
      return {
        ok: false,
        reason: "A list of kinks.",
      };
    }
    castEntry.kinks = cleanIntimacyKinks(value);
    castEntry.kinksOwn = true;
    return {
      ok: true,
    };
  }
  if (key === "into") {
    return setOrientation(state, characterId, {
      into: value,
    });
  }
  let [kind, subKey] = String(key).split(".");
  if (kind === "way" && INTIMACY_WAY_OPTIONS[subKey]?.includes(value)) {
    castEntry.ways = {
      ...(castEntry.ways ?? {}),
      [subKey]: value,
    };
    castEntry.waysV = 2;
    return {
      ok: true,
    };
  }
  if (kind === "like" && value === null && (castEntry.likes ?? []).some((like) => like.key === subKey)) {
    castEntry.likes = castEntry.likes.filter((like) => like.key !== subKey);
    return {
      ok: true,
    };
  }
  let limit = (castEntry.limits ?? []).find((limit2) => limit2.key === subKey);
  return kind === "limit" && limit && LIMIT_STAGES.includes(value)
    ? ((limit.stage = value),
      (limit.own = true),
      value !== "open" && (limit.near = 0),
      {
        ok: true,
      })
    : {
        ok: false,
        reason: "There is nothing like that to change.",
      };
}
var INTIMACY_REFUSAL_TAKES = {
  soft: "they stop it gently, and say why in their own way",
  no: "they stop it, clearly",
  here: "not here: they say so in their own way, and nothing more happens",
};
function adultFreeActs(state, adult, scene) {
  if (!adult.youAdult || scene.kind === "intro" || !hasMet2(state, scene.characterId)) {
    return null;
  }
  if (scene.milestone === INTIMATE_MILESTONE) {
    return {
      acts: {},
      claims: ["slept"],
    };
  }
  let characterId = scene.characterId,
    consent = consentFor(state, characterId),
    says = "asks to go to bed with them, or starts getting intimate",
    outcome;
  if (isEventRun(scene)) {
    outcome = {
      says: says,
      how: "soft",
      why: "not in this moment",
      take: INTIMACY_REFUSAL_TAKES.soft,
    };
  } else if (workingHome(state, characterId)) {
    outcome = {
      says: says,
      how: "soft",
      why: "they're working",
      take: INTIMACY_REFUSAL_TAKES.soft,
    };
  } else if (consent.how !== "yes") {
    outcome = {
      says: says,
      how: consent.how,
      why: consent.why,
      take: INTIMACY_REFUSAL_TAKES[consent.how],
      cost: consent.why === "not again today" ? null : consent.how,
    };
  } else if (!intimateSpotNow(state, characterId) && !privateSpotsForGroup(state, [characterId]).length) {
    outcome = {
      says: says,
      how: "soft",
      why: "not here",
      take: INTIMACY_REFUSAL_TAKES.here,
    };
  } else {
    outcome = {
      says: says,
      how: "confirm",
      why: "",
      take: "",
    };
  }
  let acts = {
      [INTIMATE_MILESTONE]: outcome,
    },
    others = eventCast(scene).filter((id) => id !== characterId);
  if (others.length) {
    let groupAct = {
        says: "asks everyone in the scene to go to bed together, all of them, or starts getting intimate with more than one of them",
      },
      groupOk =
        state.rules?.multipleRelationships &&
        others.every((id) => groupHereNow(state, characterId).includes(id)) &&
        (!!intimateSpotNow(state, characterId) || privateSpotsForGroup(state, [characterId, ...others]).length > 0);
    acts[INTIMATE_ALL_ACT] =
      outcome.how !== "confirm"
        ? {
            ...groupAct,
            how: "soft",
            why: outcome.why || "not here",
            take: outcome.take || INTIMACY_REFUSAL_TAKES.soft,
          }
        : groupOk
          ? {
              ...groupAct,
              how: "confirm",
              why: "",
              take: "",
            }
          : {
              ...groupAct,
              how: "soft",
              why: "not all of them",
              take: "not all of them: they say so in their own way, and nothing more happens",
            };
  }
  return {
    acts: acts,
    claims: ["slept"],
  };
}
var INTIMATE_ALL_ACT = "intimate-all";
function adultFreeJump(state, adult, plan, parsed, scene) {
  let characterId = scene.characterId;
  if (parsed.acts.includes(INTIMATE_ALL_ACT) && plan.outcomes[INTIMATE_ALL_ACT]?.how === "confirm") {
    let group = eventCast(scene).filter((id) => id !== characterId);
    return {
      milestone: INTIMATE_MILESTONE,
      about: {
        ...(intimateSpotNow(state, characterId)
          ? {
              spot: intimateSpotNow(state, characterId),
            }
          : {
              spot: null,
              pick: true,
            }),
        first: !intimateBondOf(adult, characterId).times,
        group: group,
      },
      act: "Sleep together, all of you",
    };
  }
  return !parsed.acts.includes(INTIMATE_MILESTONE) || plan.outcomes[INTIMATE_MILESTONE]?.how !== "confirm"
    ? null
    : {
        milestone: INTIMATE_MILESTONE,
        about: {
          ...(intimateSpotNow(state, characterId)
            ? {
                spot: intimateSpotNow(state, characterId),
              }
            : {
                spot: null,
                pick: true,
              }),
          first: !intimateBondOf(adult, characterId).times,
        },
        act: "Sleep together",
      };
}
function privateSpotsForGroup(state, characterIds) {
  let spotHere = publicSpotHere(state, characterIds);
  return placesToGoTogether(state, characterIds[0]).filter(
    (option) => option.id !== "spot" || (spotHere && !unwillingForSpot(state, characterIds, spotHere.chance).length),
  );
}
function applyChosenIntimateSpot(state, scene, option) {
  if (option.id === "spot") {
    scene.about = {
      ...scene.about,
      spot: "spot",
      corner: publicSpotHere(state, eventCast(scene)),
      pick: false,
    };
    unlockCornerBackdrop(adultState(state), scene.about.corner);
    logNote(
      state,
      `With ${adultNameFor(state, scene.characterId)}: ${lowerFirstLetter(scene.about.corner.name)}`,
      "move",
    );
    return;
  }
  let travel = goTogetherTo(state, scene, scene.characterId, option);
  if (!travel.fainted) {
    scene.about = {
      ...scene.about,
      spot: option.id,
      pick: false,
    };
    markArrivedTogether(scene);
  }
  return travel;
}
function adultFreeApply(state, adult, turn, parsed) {
  if (
    (!turn.jumped &&
      parsed.acts.includes(INTIMATE_ALL_ACT) &&
      turn.plan.more?.acts?.[INTIMATE_ALL_ACT]?.why === "not all of them" &&
      turn.tags.push({
        text: "\u2715 NOT ALL OF THEM",
        bad: true,
      }),
    !parsed.acts.includes(INTIMATE_MILESTONE) || turn.jumped)
  ) {
    return;
  }
  let outcome = turn.plan.more?.acts?.[INTIMATE_MILESTONE];
  if (!outcome || outcome.how === "confirm") {
    return;
  }
  let cost = outcome.cost ? INTIMACY_REFUSAL_COSTS[outcome.cost] : null;
  if (cost) {
    let { days: days, ...hurt } = cost;
    hurtBond(turn.bond, hurt);
    intimateBondOf(adult, turn.id).retry = state.minutes + days * INTIMATE_DAY_MINUTES;
  }
  turn.tags.push({
    text:
      outcome.why === "not here" ? "\u2715 NOT HERE" : outcome.how === "no" ? "\u2715 TURNED DOWN" : "\u2715 NOT YET",
    bad: true,
  });
}
function adultTickInitiativeAsks(state, adult, { asleep: asleep, walking = false }, notes = []) {
  if (
    (pruneStaleAdultAsks(state),
    !adult.youAdult ||
      (asleep || noteClubVisit(state, adult, notes), asleep || (state.scene && !state.scene.done)) ||
      walking ||
      state.outing ||
      (isAtActiveParty(state) && state.party.leaving))
  ) {
    return;
  }
  let dayIndex = clockFromMinutes(state.minutes).dayIndex;
  for (let character of castInTown(state)) {
    let characterId = character.id,
      bond = bondOf(state, characterId);
    if (
      !bond ||
      bond.asks ||
      !hasMet2(state, characterId) ||
      !intimateSpotNow(state, characterId) ||
      isAsleep(state, characterId) ||
      workingHome(state, character)
    ) {
      continue;
    }
    let intimateBond = intimateBondOf(adult, characterId);
    if (
      intimateBond.rolled === dayIndex ||
      ((intimateBond.rolled = dayIndex), consentFor(state, characterId).how !== "yes")
    ) {
      continue;
    }
    let initiative = knobsOf(bond).initiative ?? 1;
    if (
      onPairCooldown(intimateBond.lastDay, dayIndex, initiative) ||
      seededRandom(state.seed, characterId, String(dayIndex), "adult") >= (INITIATIVE_ASK_CHANCES[initiative] ?? 0)
    ) {
      continue;
    }
    let groupIds =
      seededRandom(state.seed, characterId, String(dayIndex), "adult-group") < GROUP_INTIMACY_CHANCE
        ? groupHereNow(state, characterId)
        : [];
    bond.asks = {
      id: INTIMATE_MILESTONE,
      at: state.minutes,
      due: state.minutes,
      ...(groupIds.length
        ? {
            with: groupIds,
          }
        : {}),
    };
  }
}
function adultStayWhy(state, adult, scene, { turnsIn: turnsIn }) {
  if (
    intimacyConsent({
      ...consentInputs(state, scene.characterId),
      lastDay: null,
    }).how === "yes"
  ) {
    return {
      why: turnsIn ? "" : "Only when they turn in for the night",
    };
  }
}
var activeSpecialNight = (state, adult, characterId) =>
  adult?.special?.id === characterId && adult.special.until >= state.minutes ? adult.special : null;
var intimacyConsentWithSpecial = (state, characterId) =>
  intimacyConsent({
    ...consentInputs(state, characterId),
    ...(activeSpecialNight(state, adultState(state), characterId)
      ? {
          lastDay: null,
        }
      : {}),
  });
function startSpecialNight(state, adult, characterId, details) {
  adult.special = {
    id: characterId,
    ...details,
    until: state.minutes + INTIMATE_SPECIAL_MINUTES,
  };
  let bond = bondOf(state, characterId);
  if (bond) {
    bond.outingGlow = {
      milestone: INTIMATE_MILESTONE,
      until: state.minutes + INTIMATE_SPECIAL_MINUTES,
      good: false,
    };
  }
}
function specialNightSpot(state, characterId) {
  if (isAtActiveParty(state)) {
    return intimateSpotNow(state, characterId) === "party"
      ? {
          id: "party",
          name: PRIVATE_SPOT_LABELS.party,
          note: "right here",
        }
      : null;
  }
  let privateSpot = privateSpotHere(state, characterId);
  return privateSpot
    ? {
        id: privateSpot,
        name: PRIVATE_SPOT_LABELS[privateSpot],
        note: "right here",
      }
    : (placesToGoTogether(state, characterId, {
        big: true,
      }).find((option) => STAY_OVER_SPOTS.includes(option.id)) ?? null);
}
var canHaveSpecialNight = (state, characterId) =>
  hasMet2(state, characterId) &&
  intimacyConsent({
    ...consentInputs(state, characterId),
    lastDay: null,
  }).how === "yes";
function adultTonightOptions(state, adult, scene) {
  if (scene?.milestone !== "propose" || !canHaveSpecialNight(state, scene.characterId)) {
    return [];
  }
  let spot = specialNightSpot(state, scene.characterId);
  return spot
    ? [
        {
          id: INTIMATE_MILESTONE,
          label: timeTogetherLabel(state.minutes),
          note: spot.note === "right here" ? spot.name : `${spot.name} \xB7 ${spot.note}`,
          chips: [],
        },
      ]
    : [];
}
function adultTonightChosen(state, adult, scene, choice) {
  if (choice !== INTIMATE_MILESTONE || !canHaveSpecialNight(state, scene.characterId)) {
    return null;
  }
  let spot = specialNightSpot(state, scene.characterId);
  return spot
    ? (startSpecialNight(state, adult, scene.characterId, {
        kind: "engaged",
        where: spot.id,
      }),
      {
        line: `the ${timeOfDayPhrase(state.minutes).split(" ")[1]} went on, the two of you`,
        next: {
          milestone: INTIMATE_MILESTONE,
          how: spot.id,
          label: timeTogetherLabel(state.minutes),
        },
      })
    : null;
}
function adultWeddingNight(state, adult, characterId) {
  if (!canHaveSpecialNight(state, characterId)) {
    return null;
  }
  let spot = specialNightSpot(state, characterId);
  return spot
    ? (startSpecialNight(state, adult, characterId, {
        kind: "wedding",
        where: spot.id,
      }),
      {
        milestone: INTIMATE_MILESTONE,
        how: spot.id,
      })
    : null;
}
function adultTripNightOptions(state, adult, scene) {
  return canHaveSpecialNight(state, scene.characterId)
    ? [
        {
          id: "yes",
          label: "A night together",
          note: `Night ${scene.tripDay} of ${HONEYMOON_DAYS}`,
        },
        {
          id: "wait",
          label: "Just sleep",
          note: "Nothing lost",
        },
      ]
    : null;
}
function adultTripNightChosen(state, adult, scene, choice) {
  return choice !== "yes" || !canHaveSpecialNight(state, scene.characterId)
    ? null
    : (startSpecialNight(state, adult, scene.characterId, {
        kind: "honeymoon",
        where: "trip",
        day: scene.tripDay,
        trip: scene.trip,
      }),
      {
        milestone: INTIMATE_MILESTONE,
        how: "trip",
      });
}
function canOfferStayTheNight(state, scene) {
  let spot = scene.about?.spot;
  return !STAY_OVER_SPOTS.includes(spot) || othersInScene(scene).length || !isStayNightHour(state.minutes)
    ? false
    : !["wedding", "honeymoon"].includes(scene.about?.special?.kind);
}
function stayTheNightOptions(state, scene) {
  let characterId = scene.characterId,
    character = characterOf(state, characterId),
    wakeAt = character ? sleepEndsAt(state, character, bedtimeOf(state, character)) : null,
    theirName = adultNameFor(state, characterId);
  return [
    {
      id: "stay",
      label: "Stay the night",
      ok: true,
      why: "",
      note: wakeAt === null ? "" : `Until ${theirName} gets up \xB7 ${formatClockTime(wakeAt)}`,
    },
    {
      id: "wait",
      label: "Say goodnight",
      ok: true,
      why: "",
      note:
        scene.about?.spot === "yours" && !livesWithPlayer(state, characterId)
          ? `${theirName} heads home`
          : "The night ends here",
    },
  ];
}
function stayTheNightWith(state, adult, scene) {
  scene.stay = true;
  adult.stayTonight = {
    id: scene.characterId,
    spot: scene.about?.spot,
    at: state.at,
    until: state.minutes + STAY_TONIGHT_WINDOW,
  };
}
function adultStayHere(state, adult, characterId) {
  let stay = adult.stayTonight;
  return stay?.id !== characterId || stay.until < state.minutes || stay.at !== state.at
    ? null
    : stay.spot === "yours"
      ? {
          place: "At home",
          words: "at the player's place",
        }
      : stay.spot === "hotel"
        ? {
            place: `At the ${HOTEL_PLACE.name}`,
            words: `in a room at the ${HOTEL_PLACE.name}`,
          }
        : {
            place: null,
            words: null,
          };
}

export {
  activeSpecialNight,
  adultFreeActs,
  adultFreeApply,
  adultFreeJump,
  adultSheetAdultToggle,
  adultSleepTogetherAvailability,
  adultSpecialActions,
  adultStayHere,
  adultStayWhy,
  adultTickInitiativeAsks,
  adultTonightChosen,
  adultTonightOptions,
  adultTripNightChosen,
  adultTripNightOptions,
  adultWeddingNight,
  applyChosenIntimateSpot,
  canOfferStayTheNight,
  dropAdultFactsForCharacter,
  intimacyConsentWithSpecial,
  privateSpotsForGroup,
  setAdultCharacterOption,
  stayTheNightOptions,
  stayTheNightWith,
};
