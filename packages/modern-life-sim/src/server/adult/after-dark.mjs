// After Dark: NPC-pair intimate events (home, party, meets, club), peeking, phone app view and club nights
import { clockFromMinutes, formatAgoStamp, formatClockTime } from "../time/clock.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { isJobSpan } from "../jobs/job-week.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { isAttractedToGender } from "../orientation/orientation.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import { backgroundSubjectOfPlace, residenceBackgroundSubject } from "../images/backgrounds.mjs";
import { ownPartyBlocksReason, partyGuestsInScene } from "../parties/party.mjs";
import { genderOf, likeEachOther } from "../romance/romanceability.mjs";
import { agreedFor, coupleOf, isPartner, settledPair } from "../romance/jealousy.mjs";
import { lunchNow } from "../jobs/office.mjs";
import { CRUSH_AT, FAITHFUL_LOW, seenOrTold } from "../relationships/cast-meets.mjs";
import { driftsToday } from "../cast/schedule-drift.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  isNpc,
  lookNow,
  nameFor,
  sceneBusyReason,
  traitsOf,
  whereOpts,
  whoIsHere,
} from "../game.mjs";
import { CLUB_DANCE_MILESTONE, CLUB_PLACE } from "./tuning.mjs";
import { PUBLIC_SPOTS, daringAllowsSpot, placeWithArticle2 } from "./spots.mjs";
import { adultMarkOf, getAlongForGroup, getAlongOrStrangers } from "./intimate-milestone.mjs";
import { adultShutTo } from "./intimacy-outcomes.mjs";
import { intimacyWaysFor } from "./cast-intimacy.mjs";
import { noteClubVisit } from "./club-jealousy.mjs";
import {
  availableClubDancers,
  clubRegularsEnabled,
  clubRegularsList,
  findClubNpc,
  isHiddenClubNpc,
} from "./club-dance.mjs";
import { AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE, INTIMATE_MILESTONE } from "./milestone-ids.mjs";

var SEGMENT_CHAR_MAX = 380;
var DANCE_SEGMENT_RANGE = [4, 7];
var PASSAGE_WORD_MAX = 400;
var PASSAGE_WORDS_RULE = `The whole passage, all its segments together, is at most ${PASSAGE_WORD_MAX} words.`;
var SEGMENT_LENGTH_RULE = `Each segment is at most ${SEGMENT_CHAR_MAX} characters: one to three sentences; a longer moment is more segments, never a longer one.`;
var LITERAL_IMAGE_RULE =
  "Image models are literal: what the prompt does not name, they do not draw. Name plainly everything in view \u2014 each intimate body part that shows, bare, and what they are doing with it \u2014 in the words this style uses (its tags or its prose); never soften it or leave it implied.";
var AFTER_DARK_BASE_CHANCE = {
  couple: 0.5,
  romance: 0.25,
};
var AFTER_DARK_INITIATIVE_STEP = 0.03;
var AFTER_DARK_CHANCE_BOUNDS = [0.05, 0.85];
var HOME_COUPLE_DARK_CHANCE = 0.25;
var HOME_PAIR_DARK_CHANCE = 0.1;
var HOME_DARK_HOUR = 23;
var PARTY_SLIP_CHANCE = 0.15;
var PARTY_SLIP_MINUTES = 60;
var AFTER_DARK_PER_DAY = 2;
var DARK_CUT_FRESH_HOURS = 3;
var AFTER_DARK_MINUTES = 60;
var PEEK_LEADUP_PASSAGES = 2;
var PEEK_MAX_EXTRA_PASSAGES = 10;
var PEEK_SEEN_EXTRA_PASSAGES = 8;
var PEEK_MINUTES = 60;
var CAUGHT_PEEKING_TRUST = -3;
var DARK_SEGMENT_RANGE = [16, 30];
var DARK_REMEMBER_MAX = 600;
var SPOT_CHANCE_BY_DARING = {
  bold: 0.75,
  either: 0.35,
  cautious: 0,
};
var DARK_NOTICE_CHANCE = 0.15;
var COINCIDE_DARK_FACTOR = 0.5;
var AFTER_DARK_SETUPS = {
  cast: "They met up today, and it went on from there to one of their places.",
  stray:
    "They met up today, away from anyone who knows them, and it went on from there to one of their places. It is a secret.",
  home: "They live together; it is night, at home.",
  crush:
    "They live under the same roof and have been drawn to each other for a while, without being a couple; it is night, at home.",
  party: "They slipped away from a party, to a room of the house.",
  coincide: "They ran into each other today without planning it, and one thing led to another.",
  club: "One of them works at the Scarlet Club, a strip club, as a dancer; the other is a customer who asked them for a private dance, in its VIP room.",
};
var CLUB_DARK_CHANCE = 0.25;
var CLUB_DANCE_PASSAGES = 6;
var CLUB_DANCE_ONLY_RULE = "It stays a dance, as the club's rules go: it never turns into sex.";
var CLUB_DANCE_FURTHER_RULE =
  "It starts as a private dance, and goes further than the club's rules allow: both of them want it.";
var CLUB_REGULAR_SEXES = ["female", "female", "male", "male"];
var CLUB_REGULAR_ID_PREFIX = "npc-regular-";
var CLUB_NIGHT_CHANCE = {
  bold: 2 / 7,
  loose: 1 / 7,
};
var CLUB_NIGHT_HOURS = [22, 25];
function afterDarkChance(kind, initiatives = []) {
  let base = kind === "couple" ? AFTER_DARK_BASE_CHANCE.couple : AFTER_DARK_BASE_CHANCE.romance,
    avgInitiative = initiatives.length ? initiatives.reduce((sum, dial) => sum + dial, 0) / initiatives.length : 5;
  return Math.max(
    AFTER_DARK_CHANCE_BOUNDS[0],
    Math.min(AFTER_DARK_CHANCE_BOUNDS[1], base + (avgInitiative - 5) * AFTER_DARK_INITIATIVE_STEP),
  );
}
var DARK_DAY_MINUTES = 1440;
var darkState = (adult) =>
  (adult.dark ??= {
    list: [],
    n: 0,
    days: {},
    cut: null,
    cutDay: null,
  });
var afterDarkOn = (adult) => !!adult?.on && !!adult?.youAdult && !!adult?.afterDark;
var darkEntryById = (adult, entryId) => darkState(adult).list.find((entry) => entry.id === entryId) ?? null;
var darkNameFor = (state, characterId) =>
  nameFor(
    state,
    characterOf(state, characterId) ?? {
      id: characterId,
      name: "someone",
    },
  );
var plainNameOf = (state, characterId) => characterOf(state, characterId)?.name ?? "someone";
var livesWithYou = (state, characterId) => {
  let residence = characterOf(state, characterId)?.residence;
  return (
    !!residence &&
    !!state.residence &&
    residence.place === state.residence.place &&
    residence.unit === state.residence.unit
  );
};
var initiativeDialOf = (state, characterId) => traitsOf(state, characterId)?.dials?.initiative ?? 5;
var lowerFirstChar = (text) => `${text[0].toLowerCase()}${text.slice(1)}`;
var DARING_ORDER = ["cautious", "either", "bold"];
function rollPublicSpotDark(state, adult, firstId, secondId, spotId, seedKey) {
  let spot = PUBLIC_SPOTS[spotId];
  if (!spot || (state.town?.off ?? []).includes(spotId)) {
    return false;
  }
  let daring = [firstId, secondId]
    .map((characterId) => intimacyWaysFor(state, adult, characterId).daring)
    .sort((left, right) => DARING_ORDER.indexOf(left) - DARING_ORDER.indexOf(right))[0];
  return daringAllowsSpot(daring, spot.base)
    ? seededRandom(state.seed, seedKey, "after-dark-spot") < (SPOT_CHANCE_BY_DARING[daring] ?? 0)
    : false;
}
function pickDarkHome(state, firstId, secondId, seedKey) {
  let candidates = [firstId, secondId].filter((characterId) => characterOf(state, characterId)?.residence?.place);
  return candidates.length
    ? candidates[Math.floor(seededRandom(state.seed, seedKey, "after-dark-home") * candidates.length)]
    : null;
}
function bothMarkedAdult(state, adult, entry) {
  return [entry.a, entry.b].every(
    (characterId) =>
      !!findClubNpc(adult, characterId) ||
      (!!characterOf(state, characterId) && adultMarkOf(adult, characterId) === "yes"),
  );
}
var neitherDarkBlocked = (state, adult, entry) =>
  ![entry.a, entry.b].some((characterId) => isHiddenClubNpc(state, adult, characterId));
function darkMeetStillOn(state, entry) {
  let meet = entry.meet?.id ? (state.meets ?? []).find((candidate) => candidate.id === entry.meet.id) : null;
  return meet
    ? meet.off
      ? false
      : meet.to <= state.minutes
        ? true
        : (npcPairBetween(state, meet.a, meet.b)?.keepAway ?? 0) > state.minutes
          ? false
          : meet.kind === "stray"
            ? !!state.rules?.partnersStray
            : meet.kind === "cast"
              ? !!state.rules?.castCouples
              : true
    : true;
}
function darkEntryValid(state, adult, entry) {
  return ["due", "ready"].includes(entry.status)
    ? bothMarkedAdult(state, adult, entry)
    : !afterDarkOn(adult) ||
        !bothMarkedAdult(state, adult, entry) ||
        [entry.a, entry.b].some(
          (characterId) => isHiddenClubNpc(state, adult, characterId) || characterOf(state, characterId)?.away,
        ) ||
        !darkMeetStillOn(state, entry)
      ? false
      : entry.kind === "club"
        ? freeToStray(state, entry.a, entry.b) &&
          freeToStray(state, entry.b, entry.a) &&
          partnerAllowsStray(state, entry.b, entry.a) &&
          (!entry.further || partnerAllowsStray(state, entry.a, entry.b)) &&
          getAlongOrStrangers(state, entry.a, entry.b)
        : ["home", "party", "coincide"].includes(entry.kind)
          ? castPairEligibleForDark(state, adult, entry.a, entry.b) && pairHasSpark(state, entry.a, entry.b)
          : bothFreeAndUnclaimed(state, entry.a, entry.b) && castPairEligibleForDark(state, adult, entry.a, entry.b);
}
function darkPeekBlockedWhy(state, adult, entry) {
  return sceneBusyReason?.(state)
    ? "You are in the middle of a scene"
    : !entry.meet || entry.place === state.at
      ? ""
      : (
          ownPartyBlocksReason(state) ||
          (lunchNow(state) ? "You're on your lunch break" : "") ||
          adultShutTo(state, adult, entry.place) ||
          ""
        ).replace(/\.$/, "");
}
function castPairEligibleForDark(state, adult, firstId, secondId) {
  if (!afterDarkOn(adult) || !firstId || !secondId || firstId === secondId) {
    return false;
  }
  let first = characterOf(state, firstId),
    second = characterOf(state, secondId);
  return !first ||
    !second ||
    first.away ||
    second.away ||
    isNpc(state, firstId) ||
    isNpc(state, secondId) ||
    adultMarkOf(adult, firstId) !== "yes" ||
    adultMarkOf(adult, secondId) !== "yes" ||
    (bondOf(state, firstId)?.kin && bondOf(state, secondId)?.kin) ||
    [first, second].some((character) => (character.castRomance ?? character.romanceable) === false)
    ? false
    : likeEachOther(state, firstId, secondId) && getAlongForGroup(state, firstId, secondId);
}
var freeToStray = (state, characterId, otherId) =>
  !isPartner(state, characterId) ||
  agreedFor(state, characterId, otherId) ||
  (!!state.rules?.partnersStray && (traitsOf(state, characterId)?.dials?.faithful ?? 5) <= FAITHFUL_LOW);
var bothFreeAndUnclaimed = (state, firstId, secondId) =>
  freeToStray(state, firstId, secondId) &&
  freeToStray(state, secondId, firstId) &&
  partnerAllowsStray(state, firstId, secondId) &&
  partnerAllowsStray(state, secondId, firstId);
var isStrayPair = (state, entry) =>
  [
    [entry.a, entry.b],
    [entry.b, entry.a],
  ].some(([characterId, otherId]) => isPartner(state, characterId) && agreedFor(state, characterId, otherId));
function pairHasSpark(state, firstId, secondId) {
  let pair = npcPairBetween(state, firstId, secondId);
  return (
    !!pair &&
    (pair.kind === "couple" || (pair.romance ?? 0) >= CRUSH_AT) &&
    bothFreeAndUnclaimed(state, firstId, secondId)
  );
}
function partnerAllowsStray(state, characterId, otherId) {
  let couple = coupleOf(state, characterId);
  return !couple || couple.a === otherId || couple.b === otherId
    ? true
    : !!state.rules?.partnersStray && (traitsOf(state, characterId)?.dials?.faithful ?? 5) <= FAITHFUL_LOW;
}
function cheatedPartnersOf(state, firstId, secondId) {
  return [
    [firstId, secondId],
    [secondId, firstId],
  ]
    .map(([characterId, otherId]) => {
      let couple = coupleOf(state, characterId),
        partnerId = couple ? (couple.a === characterId ? couple.b : couple.a) : null;
      return partnerId && partnerId !== otherId
        ? {
            id: characterId,
            partner: partnerId,
          }
        : null;
    })
    .filter(Boolean);
}
function addDarkEntry(
  state,
  adult,
  {
    a: firstId,
    b: secondId,
    kind: kind,
    at: at,
    until = null,
    home: home,
    place: place,
    meet = null,
    spot = null,
    further = null,
  },
) {
  let dark = darkState(adult),
    dayIndex = clockFromMinutes(at).dayIndex,
    active = dark.list.filter((entry2) => entry2.status !== "gone" || entry2.kind === "club");
  if (
    active.filter((entry2) => clockFromMinutes(entry2.at).dayIndex === dayIndex).length >= AFTER_DARK_PER_DAY ||
    active.some(
      (entry2) =>
        [entry2.a, entry2.b].some((characterId) => characterId === firstId || characterId === secondId) &&
        Math.abs(entry2.at - at) < 180,
    )
  ) {
    return null;
  }
  let entry = {
    id: `d${++dark.n}`,
    a: firstId,
    b: secondId,
    kind: kind,
    at: at,
    until: until ?? at + AFTER_DARK_MINUTES,
    home: home,
    place: place,
    meet: meet,
    status: "set",
    lines: [],
    remember: {},
    picture: null,
    watched: false,
    spied: false,
    ...(spot
      ? {
          spot: spot,
        }
      : {}),
    ...(further === null
      ? {}
      : {
          further: further,
        }),
  };
  dark.list.push(entry);
  return entry;
}
function rollCastMeetDark(state, adult, meet) {
  if (!castPairEligibleForDark(state, adult, meet.a, meet.b) || !bothFreeAndUnclaimed(state, meet.a, meet.b)) {
    return;
  }
  let meetRef = {
      place: meet.place,
      id: meet.id,
    },
    pair = npcPairBetween(state, meet.a, meet.b),
    chance = afterDarkChance(
      meet.kind === "cast" && pair?.kind === "couple" ? "couple" : "romance",
      [meet.a, meet.b].map((characterId) => initiativeDialOf(state, characterId)),
    );
  if (seededRandom(state.seed, meet.id, "after-dark") >= chance) {
    return;
  }
  if (rollPublicSpotDark(state, adult, meet.a, meet.b, meet.place, meet.id)) {
    addDarkEntry(state, adult, {
      a: meet.a,
      b: meet.b,
      kind: meet.kind,
      at: meet.from + 60,
      home: null,
      place: meet.place,
      spot: meet.place,
      meet: meetRef,
    });
    return;
  }
  let homeId = pickDarkHome(state, meet.a, meet.b, meet.id);
  if (homeId) {
    addDarkEntry(state, adult, {
      a: meet.a,
      b: meet.b,
      kind: meet.kind,
      at: meet.to - 30,
      home: homeId,
      place: characterOf(state, homeId).residence.place,
      meet: meetRef,
    });
  }
}
function rollCoincideDark(state, adult, dayIndex, drifts = driftsToday(state)) {
  let whereOptions = whereOpts(state);
  for (let drift of drifts) {
    let fromMinute = dayIndex * DARK_DAY_MINUTES + drift.from * 60,
      toMinute = dayIndex * DARK_DAY_MINUTES + (drift.to > drift.from ? drift.to : drift.to + 24) * 60;
    for (let character of castInTown(state)) {
      if (
        character.id === drift.characterId ||
        !castPairEligibleForDark(state, adult, drift.characterId, character.id) ||
        !pairHasSpark(state, drift.characterId, character.id) ||
        (state.meets ?? []).some(
          (meet) =>
            meet.day === dayIndex &&
            [meet.a, meet.b].includes(character.id) &&
            [meet.a, meet.b].includes(drift.characterId),
        )
      ) {
        continue;
      }
      let meetMinute = null;
      for (let minute = fromMinute; minute + 60 <= toMinute; minute += 60) {
        let where = whereaboutsOf(character, minute, whereOptions);
        if (where.place === drift.place && !where.sleep) {
          meetMinute = minute;
          break;
        }
      }
      if (meetMinute === null) {
        continue;
      }
      let pair = npcPairBetween(state, drift.characterId, character.id),
        chance =
          afterDarkChance(
            pair?.kind === "couple" ? "couple" : "romance",
            [drift.characterId, character.id].map((characterId) => initiativeDialOf(state, characterId)),
          ) * COINCIDE_DARK_FACTOR,
        seedKey = `${drift.key}|${character.id}`;
      if (seededRandom(state.seed, seedKey, "after-dark-coincide") >= chance) {
        continue;
      }
      if (rollPublicSpotDark(state, adult, drift.characterId, character.id, drift.place, seedKey)) {
        addDarkEntry(state, adult, {
          a: drift.characterId,
          b: character.id,
          kind: "coincide",
          at: meetMinute + 60,
          home: null,
          place: drift.place,
          spot: drift.place,
          meet: {
            place: drift.place,
          },
        });
        continue;
      }
      let homeId = pickDarkHome(state, drift.characterId, character.id, seedKey),
        at = Math.min(meetMinute + 120, toMinute) - 30;
      if (
        homeId &&
        [drift.characterId, character.id].every((characterId) =>
          freeForDarkAt(state, adult, characterId, at, {
            awake: true,
          }),
        )
      ) {
        addDarkEntry(state, adult, {
          a: drift.characterId,
          b: character.id,
          kind: "coincide",
          at: at,
          home: homeId,
          place: characterOf(state, homeId).residence.place,
          meet: {
            place: drift.place,
          },
        });
      }
    }
  }
}
function freeForDarkAt(state, adult, characterId, minute, { awake = false } = {}) {
  let character = characterOf(state, characterId),
    where = character ? whereaboutsOf(character, minute, whereOpts(state)) : null;
  return !where ||
    where.place === JOB_AWAY_PLACE ||
    isJobSpan(character, where) ||
    where.working ||
    (awake && where.sleep)
    ? false
    : !(adult.clubNights?.list ?? []).some(
        (night) => night.id === characterId && night.from <= minute && minute < night.to,
      );
}
var inYourSceneNow = (state, entry) =>
  !state.scene?.about?.dark && partyGuestsInScene(state).some((guestId) => guestId === entry.a || guestId === entry.b);
var shareSameHome = (state, firstId, secondId) => {
  let firstResidence = characterOf(state, firstId)?.residence,
    secondResidence = characterOf(state, secondId)?.residence;
  return (
    !!firstResidence &&
    !!secondResidence &&
    firstResidence.place === secondResidence.place &&
    firstResidence.unit === secondResidence.unit
  );
};
function blockedByParty(state, entry) {
  let party = state.party;
  if (!party || entry.kind === "party") {
    return false;
  }
  if ([entry.a, entry.b].some((characterId) => party.guests?.[characterId] && !party.guests[characterId].gone)) {
    return true;
  }
  if (entry.spot) {
    return false;
  }
  let atYourPlace = party.host === "you" || !!party.home;
  return entry.kind === "home"
    ? atYourPlace
      ? livesWithYou(state, entry.a) || livesWithYou(state, entry.b)
      : [entry.a, entry.b].includes(party.host) || shareSameHome(state, party.host, entry.a)
    : atYourPlace
      ? entry.home === "you" || livesWithYou(state, entry.home)
      : entry.home === party.host;
}
var HOME_DARK_HOURS_TRY = [
  HOME_DARK_HOUR,
  HOME_DARK_HOUR - 1,
  HOME_DARK_HOUR - 2,
  HOME_DARK_HOUR + 1,
  HOME_DARK_HOUR - 3,
];
function rollHomeDark(state, adult) {
  if (adult.dark) {
    let dark = darkState(adult);
    dark.list = dark.list.filter((entry) => entry.status !== "gone");
    if (dark.cut && !darkEntryById(adult, dark.cut)) {
      dark.cut = null;
    }
  }
  if (!afterDarkOn(adult)) {
    return;
  }
  let dayIndex = clockFromMinutes(state.minutes).dayIndex;
  rollCoincideDark(state, adult, dayIndex);
  let pairs = Object.values(state.pairs ?? {}).sort(
    (left, right) => (right.kind === "couple") - (left.kind === "couple"),
  );
  for (let pair of pairs) {
    if (!castPairEligibleForDark(state, adult, pair.a, pair.b) || !pairHasSpark(state, pair.a, pair.b)) {
      continue;
    }
    let firstHome = characterOf(state, pair.a)?.residence,
      secondHome = characterOf(state, pair.b)?.residence;
    if (
      !firstHome ||
      !secondHome ||
      firstHome.place !== secondHome.place ||
      firstHome.unit !== secondHome.unit ||
      seededRandom(state.seed, pair.a, pair.b, String(dayIndex), "after-dark-home") >=
        (pair.kind === "couple" ? HOME_COUPLE_DARK_CHANCE : HOME_PAIR_DARK_CHANCE)
    ) {
      continue;
    }
    let at = HOME_DARK_HOURS_TRY.map((hour) => dayIndex * DARK_DAY_MINUTES + hour * 60).find((hour) =>
      [pair.a, pair.b].every((characterId) =>
        freeForDarkAt(state, adult, characterId, hour, {
          awake: true,
        }),
      ),
    );
    if (at !== undefined) {
      addDarkEntry(state, adult, {
        a: pair.a,
        b: pair.b,
        kind: "home",
        at: at,
        home: pair.a,
        place: firstHome.place,
      });
    }
  }
}
var PARTY_SLIP_CLOSE_GAIN = 4;
function partyTickDark(state, adult, party, notes = []) {
  let lastMove = party.lastMove;
  for (let guest of Object.values(party.guests ?? {})) {
    if (guest.aside?.dark && (guest.aside.until <= lastMove || !afterDarkOn(adult))) {
      delete guest.aside;
    }
  }
  if (!afterDarkOn(adult) || party.leaving || Object.values(party.guests ?? {}).some((guest) => guest.aside)) {
    return;
  }
  let inScene = partyGuestsInScene(state),
    guestIds = Object.entries(party.guests ?? {})
      .filter(
        ([guestId, guest]) =>
          guestId !== party.host &&
          !guest.gone &&
          !guest.asleep &&
          !inScene.includes(guestId) &&
          characterOf(state, guestId),
      )
      .map(([guestId]) => guestId),
    pairs = [];
  for (let i = 0; i < guestIds.length; i++) {
    for (let j = i + 1; j < guestIds.length; j++) {
      if (
        castPairEligibleForDark(state, adult, guestIds[i], guestIds[j]) &&
        pairHasSpark(state, guestIds[i], guestIds[j])
      ) {
        pairs.push([guestIds[i], guestIds[j]]);
      }
    }
  }
  for (let [firstId, secondId] of pairs) {
    if (seededRandom(state.seed, firstId, secondId, String(lastMove), "after-dark-party") >= PARTY_SLIP_CHANCE) {
      continue;
    }
    let entry = addDarkEntry(state, adult, {
      a: firstId,
      b: secondId,
      kind: "party",
      at: lastMove,
      until: lastMove + PARTY_SLIP_MINUTES,
      home: party.host,
      place: state.at,
    });
    if (!entry) {
      return;
    }
    for (let [guestId, otherId] of [
      [firstId, secondId],
      [secondId, firstId],
    ]) {
      party.guests[guestId].aside = {
        with: otherId,
        words: `off somewhere with ${darkNameFor(state, otherId)}`,
        until: entry.until,
        dark: entry.id,
      };
    }
    let pair = npcPairBetween(state, firstId, secondId);
    if (pair) {
      pair.close = Math.min(100, (pair.close ?? 0) + PARTY_SLIP_CLOSE_GAIN);
    }
    if (
      [
        [firstId, secondId],
        [secondId, firstId],
      ].some(([characterId, otherId]) => isPartner(state, characterId) && !settledPair(state, characterId, otherId))
    ) {
      seenOrTold(state, firstId, secondId, {
        how: "heard",
        place: state.at,
      });
    }
    notes.push({
      id: "after-dark-aside",
      text: `${darkNameFor(state, firstId)} and ${darkNameFor(state, secondId)} slipped off together.`,
    });
    return;
  }
}
var atOpenClub = (state) =>
  state.at === CLUB_PLACE.id && !state.visit && isPlaceOpen(townPlace(state.town, CLUB_PLACE.id), state.minutes);
var clubDarkHereNow = (state, entry) =>
  entry.kind === "club" &&
  ["set", "here"].includes(entry.status) &&
  state.minutes >= entry.at &&
  state.minutes < entry.until &&
  atOpenClub(state);
var clubDarkActive = (state, entry) =>
  entry.kind === "club" && entry.status !== "gone" && state.minutes >= entry.at && state.minutes < entry.until;
var isLeavingWalk = (state, walking) => walking && !(state.scene && !state.scene.done);
function youNoticeDark(state, entry, { leaving = false } = {}) {
  if (leaving || (state.scene && !state.scene.done)) {
    return false;
  }
  if (entry.kind === "club") {
    return atOpenClub(state);
  }
  if (entry.spot) {
    return (
      state.at === entry.spot &&
      !state.visit &&
      seededRandom(state.seed, entry.id, "after-dark-notice") < DARK_NOTICE_CHANCE
    );
  }
  if (entry.kind === "party") {
    return !!state.party;
  }
  if (entry.meet && state.at === entry.meet.place && !state.visit) {
    return true;
  }
  let visiting = state.visit?.stage === "inside" && [entry.a, entry.b, entry.home].includes(state.visit.characterId),
    atHome =
      state.at === "home" &&
      !state.visit &&
      (entry.kind === "home"
        ? livesWithYou(state, entry.a) || livesWithYou(state, entry.b)
        : !!entry.home && livesWithYou(state, entry.home));
  return visiting || (atHome && seededRandom(state.seed, entry.id, "after-dark-notice") < DARK_NOTICE_CHANCE);
}
function rollClubDarkOnce(state, adult) {
  if (
    adult.clubAt &&
    adult.clubDarkAt !== adult.clubAt &&
    atOpenClub(state) &&
    rollClubDark(state, adult) !== undefined
  ) {
    adult.clubDarkAt = adult.clubAt;
  }
}
function onArrivedDark(state, adult, arrival = {}, notes = []) {
  noteClubVisit(state, adult, notes);
  rollClubDarkOnce(state, adult);
}
function tickDarkEntries(state, adult, { asleep = false, walking = false } = {}) {
  if ((walking || rollClubDarkOnce(state, adult), !afterDarkOn(adult))) {
    for (let guest of Object.values(state.party?.guests ?? {})) {
      if (guest.aside?.dark) {
        delete guest.aside;
      }
    }
  }
  if (!adult.dark) {
    return;
  }
  let dark = darkState(adult),
    now = state.minutes,
    leaving = isLeavingWalk(state, walking);
  for (let entry of dark.list) {
    if (["set", "here", "due", "ready"].includes(entry.status) && !darkEntryValid(state, adult, entry)) {
      entry.status = "gone";
      continue;
    }
    if (
      (entry.kind === "club" &&
        ["set", "here"].includes(entry.status) &&
        state.scene &&
        !state.scene.done &&
        atOpenClub(state) &&
        now < entry.until &&
        (entry.until = Math.max(entry.until, now + AFTER_DARK_MINUTES)),
      entry.status === "peek" && state.scene?.about?.dark !== entry.id)
    ) {
      Object.assign(entry, {
        status: "due",
        watched: false,
      });
      continue;
    }
    if (entry.status === "set" && now >= entry.at) {
      if (!["party", "club"].includes(entry.kind) && (inYourSceneNow(state, entry) || blockedByParty(state, entry))) {
        entry.status = "gone";
        continue;
      }
      if (
        entry.kind === "home" &&
        ![entry.a, entry.b].every((characterId) => freeForDarkAt(state, adult, characterId, entry.at))
      ) {
        entry.status = "gone";
        continue;
      }
      if (
        ((livesWithYou(state, entry.home) || entry.home === "you") &&
          (entry.you = state.at === "home" && !state.visit && !leaving ? (asleep ? "asleep" : "home") : "out"),
        !asleep &&
          now < entry.until &&
          youNoticeDark(state, entry, {
            leaving: leaving,
          }))
      ) {
        entry.status = "here";
        continue;
      }
      if (entry.kind === "club") {
        if (atOpenClub(state) && now < entry.until) {
          continue;
        }
        entry.status = "gone";
        continue;
      }
      entry.status = "due";
      markDarkCut(state, adult, entry);
    } else if (entry.status === "here" && entry.kind === "club" && (now >= entry.until || !atOpenClub(state))) {
      entry.status = "gone";
    } else if (entry.status === "here" && now >= entry.until) {
      entry.status = "due";
    }
  }
  let cutEntry = dark.cut ? darkEntryById(adult, dark.cut) : null;
  if (
    dark.cut &&
    (!cutEntry || cutEntry.status === "gone" || cutEntry.watched || now - cutEntry.at > DARK_CUT_FRESH_HOURS * 60)
  ) {
    dark.cut = null;
  }
}
function markDarkCut(state, adult, entry) {
  let dark = darkState(adult),
    dayIndex = clockFromMinutes(state.minutes).dayIndex;
  if (!(dark.cutDay === dayIndex || state.minutes - entry.at > DARK_CUT_FRESH_HOURS * 60)) {
    dark.cut = entry.id;
    dark.cutDay = dayIndex;
  }
}
function putOffDark(state, adult, entryId) {
  let entry = darkEntryById(adult, entryId);
  return entry?.kind === "club"
    ? ((entry.told = true),
      {
        ok: true,
      })
    : (darkState(adult).cut === entryId && (darkState(adult).cut = null),
      {
        ok: true,
      });
}
function darkWhereLabel(state, entry) {
  return entry.spot
    ? `${PUBLIC_SPOTS[entry.spot].name}, at ${placeWithArticle2(entry.spot, townPlace(state.town, entry.spot)?.name ?? entry.spot)}`
    : entry.kind === "party"
      ? entry.home === "you"
        ? "At your party"
        : `At ${darkNameFor(state, entry.home)}'s party`
      : entry.home === "you" || livesWithYou(state, entry.home)
        ? "At your place"
        : entry.kind === "home"
          ? `At ${darkNameFor(state, entry.a)} and ${darkNameFor(state, entry.b)}'s place`
          : `At ${darkNameFor(state, entry.home)}'s place`;
}
function darkWherePrompt(state, entry) {
  return entry.spot
    ? `${lowerFirstChar(PUBLIC_SPOTS[entry.spot].name)} at ${placeWithArticle2(entry.spot, townPlace(state.town, entry.spot)?.name ?? entry.spot)}: a public place, where someone could walk in on them at any moment`
    : entry.kind === "party"
      ? entry.home === "you"
        ? `a room of ${state.persona?.name || "the player"}'s home, during a party`
        : livesWithYou(state, entry.home)
          ? `a room of the home ${plainNameOf(state, entry.home)} shares with the player, during ${plainNameOf(state, entry.home)}'s party`
          : `a room of ${plainNameOf(state, entry.home)}'s home, during a party`
      : entry.kind === "home"
        ? livesWithYou(state, entry.home)
          ? "the home they share with the player"
          : "their home"
        : entry.home && livesWithYou(state, entry.home)
          ? `the home ${plainNameOf(state, entry.home)} shares with the player`
          : `${plainNameOf(state, entry.home)}'s place`;
}
var darkWhereLower = (state, entry) => lowerFirstChar(darkWhereLabel(state, entry));
var darkPlaceName = (state, entry) =>
  entry.spot ? PUBLIC_SPOTS[entry.spot].name : darkWhereLabel(state, entry).replace(/^At /, "");
function darkBackdrop(state, entry) {
  return entry.spot
    ? (PUBLIC_SPOTS[entry.spot]?.look ?? backgroundSubjectOfPlace(entry.spot, state.wallet?.home))
    : entry.home === "you" || livesWithYou(state, entry.home)
      ? backgroundSubjectOfPlace("home", state.wallet?.home)
      : residenceBackgroundSubject(entry.place, state.wallet?.home);
}
var darkCastView = (state, characterId) => {
  let character = characterOf(state, characterId);
  return {
    id: characterId,
    name: darkNameFor(state, characterId),
    ...(character ? lookNow(state, character) : {}),
  };
};
function darkPhoneView(state, adult) {
  if (!afterDarkOn(adult)) {
    return {};
  }
  let dark = darkState(adult),
    isWatchable = (entry) =>
      ["due", "ready"].includes(entry.status) &&
      bothMarkedAdult(state, adult, entry) &&
      neitherDarkBlocked(state, adult, entry),
    rows = dark.list
      .filter(isWatchable)
      .slice()
      .reverse()
      .map((entry) => ({
        id: entry.id,
        cast: [darkCastView(state, entry.a), darkCastView(state, entry.b)],
        title: `${darkNameFor(state, entry.a)} and ${darkNameFor(state, entry.b)}`,
        line: `${formatAgoStamp(entry.at, state.minutes)} \xB7 ${darkWhereLower(state, entry)}`,
        fresh: !entry.watched,
        action: {
          route: "adult/dark",
          body: {
            id: entry.id,
          },
          label: entry.watched ? "WATCH AGAIN" : "WATCH \u25B8",
        },
      })),
    clubEntry = dark.list.find(
      (entry) =>
        entry.kind === "club" &&
        !entry.told &&
        clubDarkHereNow(state, entry) &&
        youNoticeDark(state, entry) &&
        darkEntryValid(state, adult, entry) &&
        !darkPeekBlockedWhy(state, adult, entry),
    ),
    cutEntry =
      !(atOpenClub(state) && dark.list.some((entry) => clubDarkActive(state, entry))) && dark.cut
        ? darkEntryById(adult, dark.cut)
        : null;
  return {
    app: {
      id: "adult",
      label: "AFTER DARK",
      icon: "\u{1F319}",
      colour: "#b0356b",
      badge: rows.filter((row) => row.fresh).length,
      title: "WHAT HAPPENED BETWEEN THEM",
      sub: "newest first",
      empty: "Nothing yet.",
      rows: rows,
    },
    cut:
      cutEntry && !cutEntry.watched && isWatchable(cutEntry)
        ? {
            id: cutEntry.id,
            kicker: "AFTER DARK",
            title: `${darkNameFor(state, cutEntry.a)} and ${darkNameFor(state, cutEntry.b)}`.toUpperCase(),
            cast: [darkCastView(state, cutEntry.a), darkCastView(state, cutEntry.b)],
            where: `${darkWhereLabel(state, cutEntry)}${cutEntry.spot ? " \xB7 " : ", "}${formatClockTime(cutEntry.at)}`,
            note: "It stays on your phone.",
            watch: {
              route: "adult/dark",
              body: {
                id: cutEntry.id,
              },
              label: "WATCH \u25B8",
            },
            later: {
              route: "adult/dark-later",
              body: {
                id: cutEntry.id,
              },
              label: "LATER",
            },
          }
        : clubEntry
          ? {
              id: clubEntry.id,
              here: true,
              kicker: "AFTER DARK",
              title: `${darkNameFor(state, clubEntry.a)} and ${darkNameFor(state, clubEntry.b)}`.toUpperCase(),
              cast: [darkCastView(state, clubEntry.a), darkCastView(state, clubEntry.b)],
              where: `${CLUB_PLACE.name} \xB7 the private room`,
              note: "",
              watch: {
                route: "adult/peek",
                body: {
                  id: clubEntry.id,
                },
                label: "SPY ON THEM \u25B8",
                hint: "You sneak in and watch. They might see you.",
              },
              third: {
                route: "adult/dark-now",
                body: {
                  id: clubEntry.id,
                },
                label: "WATCH IT \u25B8",
                hint: "Just the scene, told from outside. You're not in it.",
              },
              later: {
                route: "adult/dark-later",
                body: {
                  id: clubEntry.id,
                },
                label: "NOT NOW",
                hint: `You can still decide until ${formatClockTime(clubEntry.until)}.`,
              },
            }
          : null,
  };
}
function darkActivities(state, adult) {
  return !afterDarkOn(adult) || !adult.dark
    ? []
    : darkState(adult)
        .list.filter(
          (entry) =>
            ((entry.status === "here" && state.minutes < entry.until) || clubDarkHereNow(state, entry)) &&
            youNoticeDark(state, entry) &&
            darkEntryValid(state, adult, entry),
        )
        .flatMap((entry) => {
          let blockedWhy = darkPeekBlockedWhy(state, adult, entry),
            npcFlag = isNpc(state, entry.b)
              ? {
                  npc: true,
                }
              : {},
            peekActivity = {
              id: `${AFTER_DARK_PEEK_MILESTONE}:${entry.id}`,
              name: entry.meet
                ? `Follow ${darkNameFor(state, entry.a)} and ${darkNameFor(state, entry.b)}`
                : `Take a look \xB7 ${darkNameFor(state, entry.a)} and ${darkNameFor(state, entry.b)}`,
              minutes: PEEK_MINUTES,
              costs: 0,
              place: state.at,
              available: !blockedWhy,
              why: blockedWhy,
              route: "adult/peek",
              body: {
                id: entry.id,
              },
              ...npcFlag,
            };
          return entry.kind !== "club"
            ? [peekActivity]
            : [
                peekActivity,
                {
                  id: `${AFTER_DARK_MILESTONE}:${entry.id}`,
                  name: `Watch it \xB7 ${darkNameFor(state, entry.a)} and ${darkNameFor(state, entry.b)}`,
                  minutes: 0,
                  costs: 0,
                  place: state.at,
                  available: !blockedWhy,
                  why: blockedWhy,
                  route: "adult/dark-now",
                  body: {
                    id: entry.id,
                  },
                  ...npcFlag,
                },
              ];
        });
}
function clubCustomersHere(state, adult, dancer) {
  let dancerGender = genderOf(state, dancer.id);
  return whoIsHere(state)
    .map((person) => characterOf(state, person.id))
    .filter(
      (character) =>
        character &&
        !isNpc(state, character.id) &&
        character.id !== dancer.id &&
        character.job?.place !== CLUB_PLACE.id &&
        adultMarkOf(adult, character.id) === "yes" &&
        isAttractedToGender(character.into, dancerGender) &&
        !(state.scene && !state.scene.done && eventCast(state.scene).includes(character.id)) &&
        (character.castRomance ?? character.romanceable) !== false &&
        getAlongOrStrangers(state, dancer.id, character.id) &&
        freeToStray(state, character.id, dancer.id) &&
        freeToStray(state, dancer.id, character.id) &&
        partnerAllowsStray(state, character.id, dancer.id) &&
        partnerAllowsStray(state, dancer.id, character.id),
    );
}
function rollClubDark(state, adult) {
  if (!afterDarkOn(adult)) {
    return null;
  }
  if (!availableClubDancers(state, adult).some((dancer2) => !isNpc(state, dancer2.id))) {
    return;
  }
  if (seededRandom(state.seed, "club-dark", String(adult.clubAt ?? state.minutes)) >= CLUB_DARK_CHANCE) {
    return null;
  }
  let inScene =
      state.scene && !state.scene.done && [CLUB_DANCE_MILESTONE, INTIMATE_MILESTONE].includes(state.scene.milestone)
        ? eventCast(state.scene)
        : [],
    dancers = availableClubDancers(state, adult).filter(
      (dancer2) => !isNpc(state, dancer2.id) && !inScene.includes(dancer2.id) && freeToStray(state, dancer2.id, null),
    );
  if (!dancers.length) {
    return;
  }
  let dancer = dancers[Math.floor(seededRandom(state.seed, "club-dark-who", String(state.minutes)) * dancers.length)],
    dancerGender = genderOf(state, dancer.id),
    customersHere = clubCustomersHere(state, adult, dancer),
    customers = customersHere.length
      ? customersHere
      : clubRegularsEnabled(state, adult)
        ? clubRegularsList(adult).filter((regular) => isAttractedToGender(regular.into, dancerGender))
        : [];
  if (!customers.length) {
    return null;
  }
  let customer =
    customers[Math.floor(seededRandom(state.seed, "club-dark-customer", String(state.minutes)) * customers.length)];
  return addDarkEntry(state, adult, {
    a: dancer.id,
    b: customer.id,
    kind: "club",
    at: state.minutes,
    until: state.minutes + AFTER_DARK_MINUTES,
    home: null,
    place: CLUB_PLACE.id,
    spot: CLUB_PLACE.id,
    further: clubDarkGoesFurther(state, adult, dancer.id, customer),
  });
}
function clubDarkGoesFurther(state, adult, dancerId, customer) {
  if (
    (isPartner(state, dancerId) && !freeToStray(state, dancerId, customer.id)) ||
    intimacyWaysFor(state, adult, dancerId).daring !== "bold"
  ) {
    return false;
  }
  if (isNpc(state, customer.id)) {
    if (
      (traitsOf(state, dancerId)?.dials?.faithful ?? 5) > FAITHFUL_LOW ||
      !isAttractedToGender(characterOf(state, dancerId)?.into, customer.gender ?? genderOf(state, customer.id)) ||
      !partnerAllowsStray(state, dancerId, customer.id)
    ) {
      return false;
    }
  } else if (
    !castPairEligibleForDark(state, adult, dancerId, customer.id) ||
    !pairHasSpark(state, dancerId, customer.id) ||
    intimacyWaysFor(state, adult, customer.id).daring !== "bold"
  ) {
    return false;
  }
  return (
    seededRandom(state.seed, dancerId, customer.id, String(state.minutes), "club-further") < SPOT_CHANCE_BY_DARING.bold
  );
}
function rollClubNights(state, adult) {
  if (!afterDarkOn(adult) || (state.town?.off ?? []).includes(CLUB_PLACE.id)) {
    adult.clubNights = null;
    return;
  }
  let dayIndex = clockFromMinutes(state.minutes).dayIndex,
    [fromMinute, toMinute] = CLUB_NIGHT_HOURS.map((hour) => dayIndex * DARK_DAY_MINUTES + hour * 60),
    whereOptions = {
      ...whereOpts(state),
      appointments: null,
    },
    nights = [];
  for (let character of castInTown(state)) {
    if (
      isNpc(state, character.id) ||
      adultMarkOf(adult, character.id) !== "yes" ||
      character.job?.place === CLUB_PLACE.id
    ) {
      continue;
    }
    let unfaithful = (traitsOf(state, character.id)?.dials?.faithful ?? 5) <= FAITHFUL_LOW,
      chance =
        intimacyWaysFor(state, adult, character.id).daring === "bold"
          ? CLUB_NIGHT_CHANCE.bold
          : unfaithful
            ? CLUB_NIGHT_CHANCE.loose
            : 0;
    if (!chance || seededRandom(state.seed, character.id, String(dayIndex), "club-night") >= chance) {
      continue;
    }
    let free = true;
    for (let minute = fromMinute; minute < toMinute && free; minute += 60) {
      let where = whereaboutsOf(character, minute, whereOptions);
      if (where.place === JOB_AWAY_PLACE || isJobSpan(character, where) || where.working) {
        free = false;
      }
    }
    if (free) {
      nights.push({
        id: character.id,
        from: fromMinute,
        to: toMinute,
      });
    }
  }
  let kept = (adult.clubNights?.list ?? []).filter(
    (night) => night.to > state.minutes && !nights.some((fresh) => fresh.id === night.id),
  );
  adult.clubNights = {
    day: dayIndex,
    list: [...kept, ...nights],
  };
}
function clubNightSpans(state, adult) {
  if (!afterDarkOn(adult) || !adult.clubNights) {
    return {};
  }
  let spans = {};
  for (let night of adult.clubNights.list ?? []) {
    if (
      night.to > state.minutes - DARK_DAY_MINUTES &&
      (findClubNpc(adult, night.id) || adultMarkOf(adult, night.id) === "yes")
    ) {
      (spans[night.id] ??= []).push({
        from: night.from,
        to: night.to,
        place: CLUB_PLACE.id,
        doing: "a night out at the club",
      });
    }
  }
  return spans;
}

export {
  AFTER_DARK_SETUPS,
  CAUGHT_PEEKING_TRUST,
  CLUB_DANCE_FURTHER_RULE,
  CLUB_DANCE_ONLY_RULE,
  CLUB_DANCE_PASSAGES,
  CLUB_REGULAR_ID_PREFIX,
  CLUB_REGULAR_SEXES,
  DANCE_SEGMENT_RANGE,
  DARK_REMEMBER_MAX,
  DARK_SEGMENT_RANGE,
  LITERAL_IMAGE_RULE,
  PASSAGE_WORDS_RULE,
  PEEK_LEADUP_PASSAGES,
  PEEK_MAX_EXTRA_PASSAGES,
  PEEK_MINUTES,
  PEEK_SEEN_EXTRA_PASSAGES,
  SEGMENT_LENGTH_RULE,
  bothMarkedAdult,
  cheatedPartnersOf,
  clubDarkActive,
  clubDarkHereNow,
  clubNightSpans,
  darkActivities,
  darkBackdrop,
  darkEntryById,
  darkEntryValid,
  darkPeekBlockedWhy,
  darkPhoneView,
  darkPlaceName,
  darkState,
  darkWhereLower,
  darkWherePrompt,
  isStrayPair,
  livesWithYou,
  neitherDarkBlocked,
  onArrivedDark,
  partyTickDark,
  plainNameOf,
  putOffDark,
  rollCastMeetDark,
  rollClubDarkOnce,
  rollClubNights,
  rollHomeDark,
  tickDarkEntries,
};
