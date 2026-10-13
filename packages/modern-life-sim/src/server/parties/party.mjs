// Hosting and attending parties: rooms, acts, guests, events, neighbour complaints, endings, sleepovers and party scene context
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { adjustBondAxis, applyBondAction, bondTier, hasMet, isRomanceFrozen } from "../relationships/bonds.mjs";
import { createScene } from "../scenes/scene-engine.mjs";
import { isPileSpoiled } from "../inventory/piles-and-cooking.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { introduceNpcPair, npcPairsOf, recordTownFact } from "../network/town-facts.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { addBill, earnMoney } from "../money/wallet.mjs";
import { refillNeeds } from "../needs/needs.mjs";
import { addMemory } from "../people/people-sheet.mjs";
import { activeModules, moduleState, runModuleHook } from "../modules/module-registry.mjs";
import { richTake } from "../social/rich-impressions.mjs";
import { GUEST_NIGHT_FROM, startGuest } from "../social/guest-visits.mjs";
import { rememberPair } from "../relationships/pair-memories.mjs";
import { busyWhy, weddingNow, yourBusy } from "../plans/plans.mjs";
import { markSaid, partyPresents } from "../relationships/birthday-events.mjs";
import {
  PARTY_AFTER,
  PARTY_DAY_MINUTES,
  PARTY_DECAY,
  PARTY_EARLY,
  PARTY_EAT,
  PARTY_FOOD,
  PARTY_GOOD,
  PARTY_GREAT,
  PARTY_LATE,
  PARTY_LEAVE_MOOD,
  PARTY_LOG_MAX,
  PARTY_MINGLE,
  PARTY_MINUTES,
  PARTY_MOVE,
  PARTY_ROOMS,
  PARTY_SOFA,
  PARTY_START,
  PARTY_UP_LATE,
  PARTY_UP_MOOD,
  addHousematesToParty,
  callOffParty,
  cookedDishesForParty,
  partyAhead,
  partyById,
  partyMax,
  partyRooms,
  ringPartyDoorbell,
  stillOnPartyTerms,
  yourPartyOn,
} from "./house-party.mjs";
import { hasOwnHome } from "../home/residence.mjs";
import { richLookOf } from "../home/furniture-and-wardrobe.mjs";
import { cookingHandOf, theirDish } from "../things/things-actions.mjs";
import { takenBy } from "../social/witnesses.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { isPartner, learnYou, romanceBetween } from "../romance/jealousy.mjs";
import { milestoneHandlers } from "../milestones/milestone-availability.mjs";
import {
  advanceTime,
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  logNote,
  nameFor,
  sceneBusyReason,
  sharesYourDoor,
  skillLevelsOf,
  traitsOf,
} from "../game.mjs";
import { PARTY_EVENT_MILESTONES } from "./party-milestone-ids.mjs";

function letPartyGuestsIn(state) {
  let party = state.party;
  if (!party?.door?.length) {
    return {
      ok: false,
      reason: "Nobody is at the door.",
    };
  }
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  let arrivals = party.door;
  party.door = [];
  party.room = "living";
  let rich = !!richLookOf(state)?.home;
  for (let id of arrivals) {
    party.guests[id] = {
      room: "living",
      mood: PARTY_START.mood + (isPartner(state, id) ? 1 : 0) + (rich ? richTake(state, id) : 0),
      since: state.minutes,
    };
  }
  let names = arrivals.map((id) => nameFor(state, characterOf(state, id))),
    isFirst = !party.firstIn;
  if (((party.firstIn = true), isFirst)) {
    let bond = bondOf(state, arrivals[0]);
    if (bond && !bond.asks) {
      bond.asks = {
        id: "party-first",
        at: state.minutes,
        due: state.minutes,
        about: {
          party: true,
          kind: "first",
          text: `${names[0]} is the first to arrive at the player's party, a little early: the house is still quiet, just the two of them before the others come.`,
        },
      };
      return {
        ok: true,
        names: names,
        approach: {
          id: "approach",
          characterId: arrivals[0],
          milestone: "party-first",
          name: names[0],
          door: false,
        },
      };
    }
  }
  state.moment = {
    kind: "party-arrive",
    characterId: arrivals[0],
    with: names.slice(1),
    at: state.minutes,
  };
  let from = state.minutes,
    { events: events } = advanceTime(state, 2);
  return {
    ok: true,
    names: names,
    arrived: {
      characterId: arrivals[0],
      names: names,
      from: from,
      minutes: 2,
    },
    events: events,
  };
}
function waitForNextPartyGuest(state) {
  let party = state.party;
  if (!isAtActiveParty(state)) {
    return {
      ok: false,
      reason: "There is no party on here.",
    };
  }
  let next = party?.queue?.[0];
  if (!next || party.door.length) {
    return {
      ok: false,
      reason: "Nobody else is on their way.",
    };
  }
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  let wait = Math.max(1, next.at - state.minutes),
    { events: events } = advanceTime(state, wait);
  return {
    ok: true,
    minutes: wait,
    events: events,
  };
}
function settleFirstPartyGuestScene(state, scene, bond) {
  bond.asks = null;
  if (state.party) {
    state.party.meter = clampPartyMeter(state.party.meter + 3);
    if (state.party.guests[bond.characterId]) {
      state.party.guests[bond.characterId].mood += 1;
    }
  }
  scene.outcome = {
    headline: "The party begins.",
  };
  return [];
}
var isPartyGuestActive = (guest) => !!guest && !guest.gone && !guest.asleep && !guest.aside;
var partyGuestsInRoom = (party, room) =>
  Object.entries(party.guests)
    .filter(([, guest]) => guest.room === room && isPartyGuestActive(guest))
    .map(([id]) => id);
var clampPartyMeter = (value) => Math.max(0, Math.min(100, Math.round(value)));
function buildPartyView(state) {
  let party = state.party;
  if (!party) {
    return null;
  }
  let partyGuestView = (id) => {
      let character = characterOf(state, id),
        guest = party.guests[id];
      return {
        id: id,
        name: nameFor(state, character),
        mood: guest.mood,
        ...characterPortrait(character, state),
      };
    },
    partyDoorView = (id) => {
      let character = characterOf(state, id);
      return {
        id: id,
        name: nameFor(state, character),
        ...characterPortrait(character, state),
      };
    },
    actView = (act, roomId) => ({
      key: act.key,
      name: act.name,
      minutes: act.minutes,
      everyone: !!act.everyone,
      ...partyActAvailability(state, roomId, act),
    }),
    rooms = party.rooms.map((roomId) => {
      let room = PARTY_ROOMS[roomId];
      return {
        id: roomId,
        name: room.name,
        icon: room.icon,
        here: party.room === roomId,
        people: partyGuestsInRoom(party, roomId).map(partyGuestView),
        acts: partyActsInRoom(party, roomId)
          .filter((act) => !(act.once && party.done[act.key] && act.everyone && act !== roomActForParty(party, roomId)))
          .map((act) => actView(act, roomId)),
      };
    }),
    here = partyGuestsInRoom(party, party.room),
    withName = (entry) => ({
      ...entry,
      name: nameFor(
        state,
        characterOf(state, entry.id) ?? {
          id: entry.id,
          name: "Someone",
        },
      ),
      ...characterPortrait(characterOf(state, entry.id) ?? {}, state),
    }),
    mods = (party.leaving || party.arrived === false ? [] : modulePartyActs(state)).map((act) => ({
      key: act.key,
      name: act.label,
      note: act.note ?? "",
      module: true,
      who: (act.who ?? [])
        .filter((entry) => here.includes(entry.id))
        .map((entry) => ({
          ...withName(entry),
          ok: entry.ok !== false,
          why: entry.why ?? "",
          also: (entry.also ?? [])
            .filter((alsoEntry) => here.includes(alsoEntry.id))
            .map((alsoEntry) => ({
              ...withName(alsoEntry),
              ok: alsoEntry.ok !== false,
              why: alsoEntry.why ?? "",
              not: alsoEntry.not ?? [],
            })),
          not: entry.not ?? [],
        })),
    })),
    pairs = [];
  for (let first = 0; first < here.length; first++) {
    for (let second = first + 1; second < here.length; second++) {
      if (!npcPairBetween(state, here[first], here[second])) {
        pairs.push([partyGuestView(here[first]), partyGuestView(here[second])]);
      }
    }
  }
  let elsewhere = Object.keys(party.guests)
      .filter((id) => isPartyGuestActive(party.guests[id]) && party.guests[id].room !== party.room)
      .map(partyGuestView),
    asleep = Object.keys(party.guests)
      .filter((id) => !party.guests[id].gone && party.guests[id].asleep)
      .map(partyGuestView),
    aside = Object.entries(party.guests)
      .filter(([, guest]) => !guest.gone && guest.aside)
      .map(([id, guest]) => ({
        ...partyGuestView(id),
        words: guest.aside.words ?? "",
      }));
  return {
    host: party.host,
    hostName: party.host === "you" ? "" : nameFor(state, characterOf(state, party.host)),
    ...(party.home
      ? {
          home: true,
        }
      : {}),
    since: party.since,
    until: formatClockTime(party.until),
    meter: party.meter,
    room: party.room,
    rooms: rooms,
    pairs: pairs,
    elsewhere: elsewhere,
    how: party.meter >= PARTY_GREAT ? "great" : party.meter >= PARTY_GOOD ? "good" : "flat",
    left: party.left.map((id) => nameFor(state, characterOf(state, id))),
    birthday: !!party.birthday,
    count: Object.values(party.guests).filter((guest) => !guest.gone).length,
    asleep: asleep,
    aside: aside,
    mods: mods,
    fare: party.fare?.name ?? "",
    door0:
      party.host !== "you" &&
      party.arrived === false &&
      bondOf(state, party.host)?.asks?.id === "party-arrive" &&
      isPartyGuestActive(party.guests[party.host])
        ? {
            characterId: party.host,
            milestone: "party-arrive",
            name: nameFor(state, characterOf(state, party.host)),
          }
        : null,
    bye:
      party.host !== "you" &&
      party.leaving &&
      !party.leaving.done &&
      bondOf(state, party.host)?.asks?.id === "party-goodbye" &&
      isPartyGuestActive(party.guests[party.host])
        ? {
            characterId: party.host,
            milestone: "party-goodbye",
            name: nameFor(state, characterOf(state, party.host)),
          }
        : null,
    leaving: !!party.leaving,
    neighbour:
      party.neighbour && !party.neighbour.answer
        ? {
            fine: NEIGHBOUR_NOISE_FINE[state.residence?.place ?? "apartments"] ?? 150,
            down: NEIGHBOUR_TURN_DOWN_METER,
          }
        : null,
    door: (party.door ?? []).map(partyDoorView),
    next: party.queue?.[0] ? formatClockTime(party.queue[0].at) : "",
    coming: (party.queue ?? []).reduce((sum, arrival) => sum + arrival.ids.length, 0) + (party.door ?? []).length,
  };
}
var roomActForParty = (party, roomId) =>
  party.host === "you" ? PARTY_ROOMS[roomId].act : PARTY_GUEST_ROOM_ACTS[roomId];
var PARTY_CAKE_ACT = {
  key: "cake",
  name: "The cake",
  minutes: 15,
  once: true,
  meter: 10,
  mood: 2,
  all: 2,
  everyone: true,
  words: "bring out the birthday cake for the player: the candles, a wish, and everyone singing",
};
var PARTY_PRESENTS_ACT = {
  key: "presents",
  name: "Open your presents",
  minutes: 15,
  once: true,
  meter: 6,
  mood: 1,
  all: 1,
  everyone: true,
  words: "watch the player open the presents they brought",
};
var birthdayActsForParty = (party) =>
  party.host === "you" ? [PARTY_CAKE_ACT, PARTY_PRESENTS_ACT] : [PARTY_SING_ACT, PARTY_TOAST_ACT];
var partyActsInRoom = (party, roomId) =>
  [
    roomActForParty(party, roomId),
    ...(roomId === "living" && party.birthday ? birthdayActsForParty(party) : []),
    PARTY_EAT,
  ].filter(Boolean);
function partyActAvailability(state, roomId, act = roomActForParty(state.party, roomId)) {
  let party = state.party;
  return party.leaving
    ? {
        ok: false,
        why: "You are saying goodbye",
      }
    : party.arrived === false
      ? {
          ok: false,
          why: "Go in first",
        }
      : party.room !== roomId
        ? {
            ok: false,
            why: "Go there first",
          }
        : act.once && party.done[act.key]
          ? {
              ok: false,
              why: "Done",
            }
          : party.done[act.key] && state.minutes - party.done[act.key] < 60
            ? {
                ok: false,
                why: `Again from ${formatClockTime(party.done[act.key] + 60)}`,
              }
            : act.food && party.food === "none"
              ? {
                  ok: false,
                  why: "No food",
                }
              : act.food && party.food === "cooked" && !party.done[act.key] && !cookedDishesForParty(state).n
                ? {
                    ok: false,
                    why: "Nothing cooked in your fridge",
                  }
                : act.eat && party.host === "you" && (party.food === "none" || !party.done.serve)
                  ? {
                      ok: false,
                      why: party.food === "none" ? "No food" : "Serve the food first",
                    }
                  : {
                      ok: true,
                      why: "",
                    };
}
function partyActsWithGuest(state, characterId) {
  let party = state.party;
  return !party ||
    !isAtActiveParty(state) ||
    !isPartyGuestActive(party.guests[characterId]) ||
    party.guests[characterId].room !== party.room ||
    party.leaving
    ? []
    : partyActsInRoom(party, party.room)
        .filter((act) => !act.everyone)
        .map((act) => ({
          key: `party:${act.key}`,
          name: act.name,
          ...((availability) => ({
            available: availability.ok,
            why: availability.why,
          }))(partyActAvailability(state, party.room, act)),
        }));
}
function isPartyActRomantic(state, characterId) {
  if (isPartner(state, characterId)) {
    return true;
  }
  let bond = bondOf(state, characterId);
  return !bond || bond.kin || bond.justFriends || bond.romanceable === false || isRomanceFrozen(bond)
    ? false
    : bondTier(bond, "romance") >= 1 && !takenBy(state, characterId);
}
function modulePartyActs(state) {
  let party = state.party,
    here = partyGuestsInRoom(party, party.room),
    cleanWho = (list) => (Array.isArray(list) ? list.filter((entry) => entry && typeof entry.id == "string") : []);
  return activeModules(state)
    .flatMap((module) => {
      let acts = module.partyActs?.(state, moduleState(state, module.id), {
        room: party.room,
        here: [...here],
      });
      return Array.isArray(acts) ? acts.map((act) => [module, act]) : [];
    })
    .filter(([, act]) => act && typeof act.id == "string" && typeof act.label == "string" && Array.isArray(act.who))
    .map(([module, act]) => ({
      ...act,
      who: cleanWho(act.who).map((entry) => ({
        ...entry,
        also: cleanWho(entry.also).map((alsoEntry) => ({
          ...alsoEntry,
          not: Array.isArray(alsoEntry.not) ? alsoEntry.not : [],
        })),
        not: Array.isArray(entry.not) ? entry.not : [],
      })),
      module: module.id,
      key: `mod:${module.id}:${act.id}`,
    }));
}
var isAtActiveParty = (state) =>
  !!state.party &&
  (state.party.host === "you" || state.party.home
    ? state.at === "home" && !state.visit
    : state.visit?.party === state.party.id);
var ownPartyBlocksReason = (state) =>
  state.party?.host === "you" && isAtActiveParty(state) ? "Your party is on: call it a night first." : "";
var homePartyBlocksReason = (state) =>
  state.party?.home && isAtActiveParty(state)
    ? `${nameFor(state, characterOf(state, state.party.host))}'s party is on at home: call it a night first.`
    : "";
var leaveTheirPartyIfAny = (state) => (state.party && state.party.host !== "you" ? leaveTheirParty(state) : null);
function moveToPartyRoom(state, roomId) {
  let party = state.party;
  if (!isAtActiveParty(state)) {
    return {
      ok: false,
      reason: "There is no party on here.",
    };
  }
  if (!party.rooms.includes(roomId)) {
    return {
      ok: false,
      reason: "There's no room like that here.",
    };
  }
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (party.arrived === false) {
    return {
      ok: false,
      reason: "Go in first.",
    };
  }
  if (party.leaving) {
    return {
      ok: false,
      reason: "You are saying goodbye.",
    };
  }
  party.room = roomId;
  party.moment = null;
  let { events: events } = advanceTime(state, 1);
  return {
    ok: true,
    events: events,
  };
}
function doPartyAct(state, actKey, { with: withId = null, also: alsoIds = [] } = {}) {
  let party = state.party;
  if (!isAtActiveParty(state)) {
    return {
      ok: false,
      reason: "There is no party on here.",
    };
  }
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (party.leaving) {
    return {
      ok: false,
      reason: "You are saying goodbye.",
    };
  }
  if (party.arrived === false) {
    return {
      ok: false,
      reason: "Go in first.",
    };
  }
  let roomId = party.room,
    here = partyGuestsInRoom(party, roomId);
  if (String(actKey).startsWith("mod:")) {
    return doModulePartyAct(state, actKey, withId, alsoIds);
  }
  let act = partyActsInRoom(party, roomId).find((candidate) => candidate.key === actKey);
  if (!act) {
    return {
      ok: false,
      reason: "That is not something to do here.",
    };
  }
  let availability = partyActAvailability(state, roomId, act);
  if (!availability.ok) {
    return {
      ok: false,
      reason: `${availability.why}.`,
    };
  }
  let partner = act.everyone ? null : withId || null;
  if (partner && !here.includes(partner)) {
    return {
      ok: false,
      reason: "They are not in this room.",
    };
  }
  let meterGain = act.meter ?? 0,
    moodHere = act.mood ?? 0,
    moodAll = act.all ?? 0,
    said = "";
  if (act.food) {
    ({ meter: meterGain, mood: moodHere, all: moodAll, said: said } = servePartyFood(state));
  }
  party.done[act.key] = state.minutes;
  party.lively[roomId] = state.minutes;
  party.meter = clampPartyMeter(party.meter + meterGain);
  for (let [guestId, guest] of Object.entries(party.guests)) {
    if (isPartyGuestActive(guest)) {
      guest.mood += guest.room === roomId ? moodHere : moodAll;
    }
  }
  let presents = act.key === "presents" ? collectBirthdayPresents(state) : [],
    hostGuest = party.host !== "you" ? party.guests[party.host] : null;
  if (hostGuest && isPartyGuestActive(hostGuest)) {
    hostGuest.mood += act.host ?? 1;
  }
  if (act.rest) {
    state.needs.energy = Math.min(state.needs.energy + act.rest, 100);
  }
  if (party.host !== "you" && (act.key === "sing" || act.key === "toast")) {
    markSaid(state, party.host, "party");
  }
  let chips = [];
  if (act.eat) {
    let hungerBefore = state.needs.hunger;
    state.needs = refillNeeds(state.needs, {
      hunger: act.eat,
      fitness: skillLevelsOf(state).fitness,
    });
    let gained = Math.round(state.needs.hunger - hungerBefore);
    if (gained > 0) {
      chips.push({
        text: `+${gained} HUNGER`,
      });
    }
  }
  let met = false,
    lands = "";
  if (partner) {
    let bond = bondOf(state, partner),
      character = characterOf(state, partner);
    if (bond && !hasMet(bond)) {
      bond.met = true;
      bond.metAt = state.minutes;
      met = true;
      chips.push({
        text: `YOU MET ${nameFor(state, character).toUpperCase()}`,
        step: true,
      });
      logNote(state, `You met ${character?.name ?? "someone"} at a party`, "social");
    }
    let axis = isPartyActRomantic(state, partner) ? "romance" : "friendship",
      applied =
        (bond
          ? applyBondAction(
              bond,
              {
                action: act.with?.action ?? "time",
                [axis]: act.with?.amount ?? 2,
              },
              {
                at: state.minutes,
                note: `${act.name} at a party`,
              },
            )
          : null
        )?.applied?.[axis] ?? 0;
    if (applied) {
      chips.push({
        text: `${nameFor(state, character).toUpperCase()} ${applied > 0 ? "+" : "\u2212"}${Math.abs(Math.round(applied * 10) / 10)} ${axis.toUpperCase()}`,
        ...(applied < 0
          ? {
              bad: true,
            }
          : {}),
      });
    }
    lands =
      applied < 0
        ? "it is not their kind of thing: they go along with it, but it falls a little flat for them"
        : "they enjoy it, in their own way";
    if (applied >= 0 && party.guests[partner]) {
      party.guests[partner].mood += 1;
    }
  }
  logNote(
    state,
    `${act.name}${partner ? ` with ${characterOf(state, partner)?.name ?? "someone"}` : ""} at ${party.host === "you" ? "your" : `${nameFor(state, characterOf(state, party.host))}'s`} party`,
    "social",
  );
  let castOrder = [...here].sort((idA, idB) => (idB === party.host) - (idA === party.host)),
    cast = partner ? [partner] : act.everyone ? castOrder.slice(0, 4) : [],
    withName = partner ? nameFor(state, characterOf(state, partner)) : "",
    headline = partner
      ? `${act.name} with ${withName}.`
      : act.everyone
        ? `${act.name}, with everyone here.`
        : `${act.name}, on your own.`,
    title = partyMomentTitle(act.key, {
      who: withName,
      everyone: !!act.everyone,
    });
  if (meterGain) {
    chips.push({
      text: `THE PARTY ${meterGain > 0 ? "+" : "\u2212"}${Math.abs(meterGain)}`,
      ...(meterGain < 0
        ? {
            bad: true,
          }
        : {}),
    });
  }
  for (let present of presents) {
    chips.push({
      text: `\u{1F381} ${String(present.who ?? "").toUpperCase()} \xB7 ${String(present.item?.name ?? "").toUpperCase()}`,
    });
  }
  if (said) {
    chips.push({
      text: said.replace(/\.$/, "").toUpperCase(),
    });
  }
  return {
    ...recordPartyMoment(
      state,
      {
        key: act.key,
        name: act.name,
        title: title,
        words: act.words ?? act.name.toLowerCase(),
        with: partner,
        everyone: !!act.everyone,
        cast: cast,
        chips: chips,
        met: met,
        lands: lands,
        headline: headline,
      },
      act.minutes,
    ),
    meter: meterGain,
    said: said,
    presents: presents,
  };
}
function doModulePartyAct(state, actKey, withId, alsoIds) {
  let party = state.party,
    [, moduleId, actId] = String(actKey).split(":"),
    act = modulePartyActs(state).find((candidate) => candidate.module === moduleId && candidate.id === actId);
  if (!act) {
    return {
      ok: false,
      reason: "That is not something to do here.",
    };
  }
  let here = partyGuestsInRoom(party, party.room),
    whoEntry = (act.who ?? []).find((entry) => entry.id === withId && here.includes(entry.id));
  if (!whoEntry) {
    return {
      ok: false,
      reason: "Pick who with.",
    };
  }
  if (whoEntry.ok === false) {
    return {
      ok: false,
      reason: whoEntry.why || "Not now.",
    };
  }
  let alsoList = [...new Set((Array.isArray(alsoIds) ? alsoIds : []).map(String))].filter((id) => id !== withId),
    alsoEntries = alsoList.map((id) =>
      (whoEntry.also ?? []).find((entry) => entry.id === id && here.includes(entry.id)),
    );
  if (alsoEntries.some((entry) => !entry || entry.ok === false)) {
    return {
      ok: false,
      reason: "Not everyone you picked can come along.",
    };
  }
  let together = [withId, ...alsoList];
  if (
    [whoEntry, ...alsoEntries].some((entry) => (entry.not ?? []).some((id) => together.includes(id) && id !== entry.id))
  ) {
    return {
      ok: false,
      reason: "Not everyone you picked can be together.",
    };
  }
  let chosen =
    activeModules(state)
      .find((module) => module.id === moduleId)
      ?.partyActChosen?.(state, moduleState(state, moduleId), {
        id: actId,
        with: withId,
        also: alsoList,
        room: party.room,
      }) ?? null;
  return !chosen?.milestone || !milestoneHandlers(chosen.milestone)
    ? {
        ok: false,
        reason: "Not now.",
      }
    : {
        ok: true,
        name: act.label,
        minutes: 0,
        events: [],
        scene: {
          characterId: withId,
          milestone: chosen.milestone,
          how: chosen.how ?? "party",
          with: alsoList,
          about: chosen.about ?? null,
        },
      };
}
function servePartyFood(state) {
  let party = state.party,
    guestCount = Object.values(party.guests).filter(isPartyGuestActive).length,
    quality = PARTY_FOOD[party.food]?.quality ?? 0,
    share = 1;
  if (party.food === "cooked") {
    let cooked = cookedDishesForParty(state);
    quality = cooked.quality;
    let needed = Math.min(cooked.n, guestCount + 1);
    share = Math.min(1, cooked.n / (guestCount + 1));
    let remaining = needed,
      dishes = state.things.fridge
        .filter((pile) => String(pile.item).startsWith("dish-") && !isPileSpoiled(pile))
        .sort((pileA, pileB) => (pileA.left ?? 1 / 0) - (pileB.left ?? 1 / 0));
    for (let pile of dishes) {
      let take = Math.min(remaining, pile.n);
      if (((pile.n -= take), (remaining -= take), !remaining)) {
        break;
      }
    }
    state.things.fridge = state.things.fridge.filter((pile) => pile.n > 0);
  }
  let short = share < 1;
  party.fare = {
    kind: party.food,
    name: party.food === "cooked" ? "What you cooked" : (PARTY_FOOD[party.food]?.name ?? "Something to eat"),
  };
  return {
    meter: Math.round(quality * 5 * share) - (short ? 5 : 0),
    mood: Math.round(quality * share),
    all: Math.round(quality * share),
    said: short
      ? "Not enough food for everyone."
      : quality >= 3
        ? "The food is a hit."
        : quality >= 2
          ? "Everyone digs in."
          : "Something to nibble on.",
  };
}
function bringPartyGuestOver(state, characterId) {
  let party = state.party,
    guest = party?.guests[characterId];
  if (!isAtActiveParty(state) || !isPartyGuestActive(guest)) {
    return {
      ok: false,
      reason: "They are not at your party.",
    };
  }
  if (party.arrived === false) {
    return {
      ok: false,
      reason: "Go in first.",
    };
  }
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (guest.room === party.room) {
    return {
      ok: false,
      reason: "They are right here.",
    };
  }
  let fromRoom = PARTY_ROOMS[guest.room]?.name.toLowerCase() ?? "another room";
  guest.room = party.room;
  if (!guest.brought) {
    guest.mood += PARTY_MINGLE.mood;
    guest.brought = true;
  }
  let guestName = nameFor(state, characterOf(state, characterId));
  return recordPartyMoment(
    state,
    {
      key: "bring",
      name: "Bring someone over",
      title: partyMomentTitle("bring", {
        who: guestName,
      }),
      words: `go and get ${characterOf(state, characterId)?.name ?? "them"} from the ${fromRoom} and bring them over`,
      with: characterId,
      cast: [characterId],
      headline: `You brought ${guestName} over.`,
      chips: [],
    },
    PARTY_MINGLE.minutes,
  );
}
function introducePartyGuests(state, idA, idB) {
  let party = state.party,
    guestA = party?.guests[idA],
    guestB = party?.guests[idB];
  if (
    !isAtActiveParty(state) ||
    !isPartyGuestActive(guestA) ||
    !isPartyGuestActive(guestB) ||
    guestA.room !== party.room ||
    guestB.room !== party.room
  ) {
    return {
      ok: false,
      reason: "They are not both here.",
    };
  }
  if (party.arrived === false) {
    return {
      ok: false,
      reason: "Go in first.",
    };
  }
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (
    !introduceNpcPair(state, idA, idB, {
      place: state.at,
    })
  ) {
    return {
      ok: false,
      reason: "They already know each other.",
    };
  }
  guestA.mood += PARTY_MINGLE.mood;
  guestB.mood += PARTY_MINGLE.mood;
  party.meter = clampPartyMeter(party.meter + 2);
  party.mingled = (party.mingled ?? 0) + 1;
  let [nameA, nameB] = [idA, idB].map((id) => nameFor(state, characterOf(state, id))),
    [plainA, plainB] = [idA, idB].map((id) => characterOf(state, id)?.name ?? "someone");
  return recordPartyMoment(
    state,
    {
      key: "introduce",
      name: "Introduce",
      title: partyMomentTitle("introduce", {
        who: nameA,
        other: nameB,
      }),
      words: `introduce ${plainA} and ${plainB}, who had never met, and they get talking`,
      pair: [idA, idB],
      cast: [idA, idB],
      headline: `${nameA} and ${nameB} know each other now.`,
      chips: [
        {
          text: `${nameA.toUpperCase()} & ${nameB.toUpperCase()} MET`,
          step: true,
        },
      ],
    },
    PARTY_MINGLE.minutes,
  );
}
var PARTY_MOMENT_TITLES = {
  music: ["Music with {who}", "Music on"],
  serve: ["", "Serving the food"],
  lights: ["Under the lights with {who}", "Under the garden lights"],
  swim: ["In the pool with {who}", "In the pool"],
  drinks: ["Drinks with {who}", "Mixing drinks"],
  game: ["A game with {who}", "A game"],
  dance: ["Dancing with {who}", "Dancing on your own"],
  help: ["In the kitchen with {who}", "Helping in the kitchen"],
  air: ["Out in the garden with {who}", "Some fresh air"],
  drink: ["A drink with {who}", "A drink on your own"],
  eat: ["Eating with {who}", "Eating on your own"],
  cake: ["", "The cake"],
  presents: ["", "Your presents"],
  sing: ["", "Singing happy birthday"],
  toast: ["", "A toast to them"],
  introduce: ["{who} meets {other}", ""],
  bring: ["Bringing {who} over", ""],
};
function partyMomentTitle(key, { who = "", other = "" } = {}) {
  let [withWho, alone] = PARTY_MOMENT_TITLES[key] ?? ["", ""];
  return ((who && withWho) || alone || withWho).replace("{who}", who).replace("{other}", other);
}
function recordPartyMoment(state, moment, minutes) {
  let party = state.party;
  party.log = [
    ...(party.log ?? []),
    {
      at: state.minutes,
      key: moment.key,
      name: moment.name,
      words: moment.words,
      with: moment.with ?? null,
      pair: moment.pair ?? null,
      everyone: !!moment.everyone,
      room: party.room,
    },
  ].slice(-PARTY_LOG_MAX);
  party.moment = {
    with: null,
    everyone: false,
    met: false,
    lands: "",
    ...moment,
    room: party.room,
    at: state.minutes,
    lines: null,
  };
  party.hold = true;
  let { events: events } = advanceTime(state, minutes);
  if (state.party) {
    state.party.hold = false;
  }
  return {
    ok: true,
    name: moment.name,
    minutes: minutes,
    events: events,
    moment: state.party?.moment ?? null,
  };
}
function buildPartyMomentScene(state) {
  let party = state.party,
    moment = party?.moment;
  if (!moment) {
    return null;
  }
  let cast = (moment.cast ?? []).filter((id) => characterOf(state, id)).slice(0, 4),
    lead = cast[0] ?? null,
    scene = createScene({
      kind: "moment",
      characterId: lead,
      place: state.at,
      at: moment.at,
    });
  scene.cast = cast;
  let lines = (moment.lines ?? []).map((line) =>
    line.who === "narration"
      ? {
          who: "narration",
          text: line.text,
        }
      : line.who === lead
        ? {
            who: "them",
            text: line.text,
          }
        : {
            who: "them",
            by: line.who,
            text: line.text,
          },
  );
  scene.batch = lines;
  scene.log = lines.map((line) => ({
    ...line,
    exchange: 0,
  }));
  scene.did = {
    exchange: 0,
    logAt: scene.log.length,
    tags: moment.chips ?? [],
  };
  scene.partyMoment = {
    name: moment.title || moment.name,
    words: moment.words,
    with: moment.with ?? null,
    everyone: !!moment.everyone,
    headline: moment.headline ?? moment.name,
    chips: moment.chips ?? [],
  };
  scene.placeName = PARTY_ROOMS[moment.room]?.name ?? "";
  scene.suggestions = moment.suggestions ?? [];
  if (!lead || !lines.length) {
    scene.done = true;
    scene.endedBy = "moment";
  }
  state.scene = scene;
  party.moment = null;
  return scene;
}
function collectBirthdayPresents(state) {
  return partyPresents(
    state,
    Object.keys(state.party.guests).filter((guestId) => isPartyGuestActive(state.party.guests[guestId])),
  );
}
var wasHospitalizedDuringParty = (state, party, lateWindow) =>
  !!state.collapsing ||
  (!!state.outCold && state.outCold.from <= party.at + lateWindow && state.outCold.to >= party.at - PARTY_EARLY);
function tickParties(state, { asleep: opts = false } = {}) {
  let events = [];
  for (let party of state.parties ?? []) {
    if (!(party.host !== "you" || party.status !== "set")) {
      if (!hasOwnHome(state)) {
        callOffParty(state, party);
        let refund = (PARTY_FOOD[party.food]?.perGuest ?? 0) * party.guests.length;
        if (refund) {
          earnMoney(state.wallet, refund, "Party food, cancelled", state.minutes);
        }
        events.push({
          id: "party-off",
          text: `Your party is off: you have no home now.${refund ? ` The food was refunded ($${refund}).` : ""}`,
        });
        continue;
      }
      if (!(state.minutes <= party.at + PARTY_LATE)) {
        if (weddingNow(state)) {
          callOffParty(state, party);
          events.push({
            id: "party-off",
            text: `Your party is off: it fell on ${weddingNow(state)}.`,
          });
          continue;
        }
        if (wasHospitalizedDuringParty(state, party, PARTY_LATE)) {
          callOffParty(state, party);
          for (let guestId of party.guests) {
            let guestChar = characterOf(state, guestId);
            if (guestChar) {
              addMemory(guestChar, {
                at: state.minutes,
                text: `${state.persona?.name || "The player"} collapsed and ended up in the hospital the night of their party, so it never happened.`,
                from: "party",
              });
            }
          }
          let refund = (PARTY_FOOD[party.food]?.perGuest ?? 0) * party.guests.length;
          if (refund) {
            earnMoney(state.wallet, refund, "Party food, cancelled", state.minutes);
          }
          events.push({
            id: "party-off",
            text: `Your party is off: you were in the hospital. Your guests know, and nobody holds it against you.${refund ? ` The food was refunded ($${refund}).` : ""}`,
          });
          continue;
        }
        party.status = "missed";
        for (let guestId of party.guests) {
          let bond = bondOf(state, guestId);
          if (bond) {
            adjustBondAxis(bond, "friendship", -2, {
              at: state.minutes,
            });
          }
        }
        events.push({
          id: "party-missed",
          text:
            state.at === "home" && !state.visit
              ? "You never started your party: your guests went home disappointed."
              : "Your party never happened: your guests came to a closed door.",
        });
      }
    }
  }
  for (let party of acceptedTheirParties(state)) {
    if (state.party?.id === party.id) {
      continue;
    }
    let hostChar = characterOf(state, party.host),
      hostName = hostChar ? nameFor(state, hostChar) : "Their";
    if (!hostChar || hostChar.away) {
      party.status = "off";
      events.push({
        id: "party-off",
        characterId: party.host,
        text: `${hostName}'s party is off: they moved away.`,
      });
      continue;
    }
    if (party.home && !(hasOwnHome(state) && sharesYourDoor(state, hostChar))) {
      party.status = "off";
      events.push({
        id: "party-off",
        characterId: party.host,
        text: `${hostName}'s party at home is off: you don't live together any more.`,
      });
      continue;
    }
    if (
      party.home &&
      !state.party &&
      state.minutes >= party.at &&
      state.minutes <= party.at + THEIR_PARTY_LATE_MINUTES &&
      isRestingAtOwnHome(state)
    ) {
      events.push(...startTheirHomeParty(state, party));
      continue;
    }
    if (state.minutes <= party.at + THEIR_PARTY_LATE_MINUTES) {
      continue;
    }
    if (weddingNow(state)) {
      party.status = "off";
      events.push({
        id: "party-off",
        characterId: party.host,
        text: `No party at ${nameFor(state, characterOf(state, party.host))}'s: it fell on ${weddingNow(state)}.`,
      });
      continue;
    }
    if (wasHospitalizedDuringParty(state, party, THEIR_PARTY_LATE_MINUTES)) {
      party.status = "off";
      addMemory(hostChar, {
        at: state.minutes,
        text: `${state.persona?.name || "The player"} collapsed and ended up in the hospital, and missed my party.`,
        from: "party",
      });
      events.push({
        id: "party-off",
        characterId: party.host,
        text: `You missed ${hostName}'s party: you were in the hospital, and they know it.`,
      });
      continue;
    }
    if (party.home && opts && state.at === "home") {
      Object.assign(party, {
        status: "slept",
        told: true,
      });
      let bond2 = bondOf(state, party.host);
      if (bond2) {
        adjustBondAxis(bond2, "friendship", THEIR_HOME_PARTY_SLEPT_PENALTY.friendship, {
          at: state.minutes,
        });
      }
      addMemory(hostChar, {
        at: state.minutes,
        text: `${state.persona?.name || "The player"} slept through my party at home; we had it without them.`,
        from: "party",
      });
      events.push({
        id: "party-slept",
        characterId: party.host,
        text: `You slept through ${hostName}'s party at home: they had it without you.${state.minutes < party.at + PARTY_MINUTES ? " It's still going, if you want to join in." : ""}`,
      });
      continue;
    }
    if (party.home && state.minutes < party.at + PARTY_MINUTES) {
      party.status = "late";
      continue;
    }
    party.status = "missed";
    let bond = bondOf(state, party.host);
    if (bond) {
      applyBondAction(
        bond,
        {
          action: "reliable",
          ...THEIR_PARTY_MISSED_PENALTY,
        },
        {
          at: state.minutes,
          today: false,
          share: "event",
          note: "missed their party",
        },
      );
    }
    events.push({
      id: "party-missed",
      characterId: party.host,
      text: `You never showed up at ${nameFor(state, characterOf(state, party.host))}'s party.`,
    });
  }
  for (let party of theirHomePartiesPending(state)) {
    if (state.party?.id === party.id) {
      continue;
    }
    let hostChar = characterOf(state, party.host);
    if (!hostChar || hostChar.away || !(hasOwnHome(state) && sharesYourDoor(state, hostChar))) {
      party.status = "off";
    } else if (state.minutes >= party.at + PARTY_MINUTES && party.status === "late") {
      if (weddingNow(state) || wasHospitalizedDuringParty(state, party, PARTY_MINUTES)) {
        party.status = "off";
        continue;
      }
      party.status = "missed";
      let bond = bondOf(state, party.host);
      if (bond) {
        applyBondAction(
          bond,
          {
            action: "reliable",
            ...THEIR_PARTY_MISSED_PENALTY,
          },
          {
            at: state.minutes,
            today: false,
            share: "event",
            note: "missed their party",
          },
        );
      }
      events.push({
        id: "party-missed",
        characterId: party.host,
        text: `You never came home for ${nameFor(state, hostChar)}'s party.`,
      });
    } else if (state.minutes >= party.at + PARTY_MINUTES) {
      party.status = "done";
    } else if (state.minutes >= party.at && !party.told && isRestingAtOwnHome(state) && !state.party) {
      party.told = true;
      events.push({
        id: "party-on",
        characterId: party.host,
        text: `${nameFor(state, hostChar)}'s ${party.birthday ? "birthday party" : "party"} is on at home. Join in whenever you like.`,
      });
    }
  }
  let activeParty = state.party;
  if (!activeParty) {
    return events;
  }
  if (activeParty.host === "you" && !isAtActiveParty(state)) {
    events.push(
      endOwnParty(state, {
        away: true,
      }).event,
    );
    return events;
  }
  if (activeParty.home && !isAtActiveParty(state)) {
    events.push(leaveTheirParty(state));
    return events;
  }
  let doorbellEvent = ringPartyDoorbell(state);
  for (doorbellEvent && events.push(doorbellEvent); state.minutes - activeParty.lastMove >= PARTY_MOVE;) {
    activeParty.lastMove += PARTY_MOVE;
    addHousematesToParty(state);
    if (Object.keys(activeParty.guests).length) {
      activeParty.meter = clampPartyMeter(activeParty.meter - PARTY_DECAY.meter);
    }
    let inScene = partyGuestsInScene(state),
      hostBusy =
        activeParty.host !== "you" &&
        (activeParty.arrived === false || (activeParty.leaving && !activeParty.leaving.done));
    for (let [guestId, guest] of Object.entries(activeParty.guests)) {
      if (!isPartyGuestActive(guest) || inScene.includes(guestId) || (hostBusy && guestId === activeParty.host)) {
        continue;
      }
      let isHost = guestId === activeParty.host;
      if (
        (activeParty.lastMove - (activeParty.lively[guest.room] ?? activeParty.since) >= 60 &&
          !isHost &&
          (guest.mood -= PARTY_DECAY.mood),
        seededRandom(state.seed, guestId, String(activeParty.lastMove), "room") < 0.5 &&
          (guest.room =
            activeParty.rooms[
              Math.floor(
                seededRandom(state.seed, guestId, String(activeParty.lastMove), "which") * activeParty.rooms.length,
              )
            ]),
        isHost || guest.stays)
      ) {
        continue;
      }
      if (guest.mood <= PARTY_LEAVE_MOOD) {
        guest.gone = activeParty.lastMove;
        activeParty.left.push(guestId);
        events.push({
          id: "party-left",
          characterId: guestId,
          text: `${nameFor(state, characterOf(state, guestId))} ${guest.mate ? "went off to their room early" : "went home early"}.`,
        });
        continue;
      }
      let busyReason = busyWhy(state, characterOf(state, guestId), activeParty.lastMove);
      if (busyReason === "Asleep") {
        guest.sleepy ??= activeParty.lastMove;
      }
      let sleepyNow =
        busyReason === "Asleep" && (guest.mood < PARTY_UP_MOOD || activeParty.lastMove - guest.sleepy >= PARTY_UP_LATE);
      if (
        sleepyNow &&
        activeParty.host === "you" &&
        guest.mood >= 2 &&
        seededRandom(state.seed, guestId, String(activeParty.lastMove), "sofa") < PARTY_SOFA
      ) {
        Object.assign(guest, {
          asleep: activeParty.lastMove,
          room: "living",
        });
        events.push({
          id: "party-sofa",
          characterId: guestId,
          text: `${nameFor(state, characterOf(state, guestId))} fell asleep on the sofa.`,
        });
        continue;
      }
      if (sleepyNow || busyReason === "Works" || busyReason === "Away") {
        guest.gone = activeParty.lastMove;
        guest.tired = true;
        let livesHere =
          sharesYourDoor(state, characterOf(state, guestId)) && (activeParty.host === "you" || activeParty.home);
        events.push({
          id: "party-left",
          characterId: guestId,
          text: `${nameFor(state, characterOf(state, guestId))} ${busyReason === "Works" ? "had to go to work" : busyReason === "Away" ? "had to leave town" : livesHere ? "went to bed" : "went home to bed"}.`,
        });
      }
    }
    if ((runModuleHook(state, "partyTick", activeParty, events), activeParty.host !== "you")) {
      if (
        (busyWhy(state, characterOf(state, activeParty.host), activeParty.lastMove) === "Asleep" &&
          (activeParty.guests[activeParty.host]?.mood ?? 0) < PARTY_UP_MOOD &&
          ((activeParty.until = Math.min(activeParty.until, activeParty.lastMove)), (activeParty.hostBed = true)),
        activeParty.lastMove + PARTY_MOVE < activeParty.until)
      ) {
        let partyEvent2 = rollTheirPartyEvent(state);
        if (partyEvent2) {
          events.push(partyEvent2);
        }
      }
      if (activeParty.home && activeParty.lastMove + PARTY_MOVE < activeParty.until) {
        let neighbourEvent2 = tickPartyNeighbour(state);
        if (neighbourEvent2) {
          events.push(neighbourEvent2);
        }
      }
      continue;
    }
    if (activeParty.lastMove + PARTY_MOVE >= activeParty.until) {
      continue;
    }
    let partyEvent = rollOwnPartyEvent(state);
    if (partyEvent) {
      events.push(partyEvent);
    }
    let neighbourEvent = tickPartyNeighbour(state);
    if (neighbourEvent) {
      events.push(neighbourEvent);
    }
  }
  if (
    activeParty.host !== "you" &&
    activeParty.leaving &&
    !activeParty.leaving.done &&
    state.minutes - activeParty.leaving.at > PARTY_GOODBYE_WAIT_MINUTES &&
    !(state.scene && !state.scene.done)
  ) {
    events.push(leaveTheirParty(state));
    return events;
  }
  let everyoneGone =
    !(activeParty.queue ?? []).length &&
    !(activeParty.door ?? []).length &&
    Object.values(activeParty.guests).every((guest) => guest.gone || guest.asleep);
  if (state.minutes >= activeParty.until || everyoneGone) {
    activeParty.ending ??= everyoneGone ? "nobody" : activeParty.hostBed ? "bed" : "over";
  }
  let endEvents = duePartyEndEvents(state);
  if (endEvents.some((ev) => ev.milestone === "party-goodbye")) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].id === "approach" && isPartyAskMilestone(events[i].milestone)) {
        events.splice(i, 1);
      }
    }
  }
  events.push(...endEvents);
  return events;
}
var PARTY_GOODBYE_WAIT_MINUTES = 90;
function duePartyEndEvents(state, { closedWith: opts = null } = {}) {
  let party = state.party;
  return !party || party.hold || (state.scene && (!state.scene.done || state.scene.kind === "moment"))
    ? []
    : party.host !== "you" && party.leaving
      ? party.leaving.done
        ? [leaveTheirParty(state)]
        : []
      : party.ending
        ? party.host === "you"
          ? [endOwnParty(state).event]
          : party.home
            ? [leaveTheirParty(state)]
            : opts && opts === party.host && party.ending !== "bed" && isPartyGuestActive(party.guests[party.host])
              ? [
                  leaveTheirParty(state, {
                    stay: true,
                  }),
                ]
              : startTheirPartyGoodbye(state, party.ending)
        : [];
}
function startTheirPartyGoodbye(state, why = "you") {
  let party = state.party,
    hostId = party.host,
    bond = bondOf(state, hostId),
    hostGuest = party.guests[hostId];
  if (
    (clearPartyAsks(state, party, {
      except: hostId,
    }),
    !bond || !isPartyGuestActive(hostGuest) || (bond.asks && !isPartyAskMilestone(bond.asks.id)))
  ) {
    return [leaveTheirParty(state)];
  }
  let hostDisplayName = nameFor(state, characterOf(state, hostId)),
    hostName = characterOf(state, hostId)?.name ?? "They",
    opening =
      why === "bed"
        ? `${hostName}'s party is winding down: ${hostName} is off to bed, and sees the player to the door.`
        : why === "you"
          ? `The player is leaving ${hostName}'s party, and ${hostName} sees them to the door.`
          : `It is late and ${hostName}'s party is over; ${hostName} sees the player to the door.`;
  bond.asks = {
    id: "party-goodbye",
    at: state.minutes,
    due: state.minutes,
    about: {
      party: true,
      kind: "goodbye",
      why: why,
      text: `${opening} ${describePartyEvening(state, party)}`,
    },
  };
  party.leaving = {
    at: state.minutes,
    why: why,
    done: false,
  };
  hostGuest.room = party.room;
  return [
    {
      id: "approach",
      characterId: hostId,
      milestone: "party-goodbye",
      name: hostDisplayName,
      door: false,
    },
  ];
}
function describePartyEvening(state, party) {
  let summary =
      party.meter >= PARTY_GREAT
        ? "It was a great party"
        : party.meter >= PARTY_GOOD
          ? "It was a good night"
          : "The party never really took off",
    sharedMoments = (party.log ?? [])
      .filter((entry) => entry.with || entry.everyone)
      .slice(-4)
      .map(
        (entry) =>
          `${entry.words}${entry.with ? ` with ${characterOf(state, entry.with)?.name ?? "someone"}` : entry.everyone ? " with everyone" : ""}`,
      ),
    stayedMinutes = state.minutes - party.since;
  return `${summary}.${sharedMoments.length ? ` The player was part of it: ${sharedMoments.join("; ")}.` : ""}${stayedMinutes < 60 ? " The player only stayed a little while." : ""}`;
}
function settlePartyDoorScene(state, scene, bond) {
  let party = state.party;
  bond.asks = null;
  if (scene.milestone === "party-arrive") {
    if (party) {
      party.arrived = true;
      if (party.guests[bond.characterId]) {
        party.guests[bond.characterId].mood += 1;
      }
    }
    scene.outcome = {
      headline: "You're in.",
    };
  } else {
    if (party?.leaving) {
      party.leaving.done = true;
    }
    scene.outcome = {
      headline: "You said goodbye.",
    };
  }
  return [];
}
function answerPartyDoorQuietly(state, characterId, milestone) {
  let party = state.party,
    bond = bondOf(state, characterId);
  return !party || !bond || bond.asks?.id !== milestone || !["party-arrive", "party-goodbye"].includes(milestone)
    ? {
        ok: false,
        reason: "Not now.",
      }
    : (state.scene?.done && (state.scene = null),
      settlePartyDoorScene(
        state,
        {
          milestone: milestone,
        },
        bond,
      ),
      {
        ok: true,
        events: duePartyEndEvents(state),
      });
}
var sayGoodbyeFirstReason = (state) =>
  state.party && state.party.host !== "you" && !state.party.home && isAtActiveParty(state)
    ? `Say goodbye to ${nameFor(state, characterOf(state, state.party.host))} first.`
    : "";
var isPartyAskMilestone = (milestone) =>
  PARTY_EVENT_MILESTONES.includes(milestone) ||
  PARTY_DOOR_MILESTONES.includes(milestone) ||
  milestone === "party-first";
var PARTY_DOOR_MILESTONES = ["party-arrive", "party-goodbye"];
function endOwnParty(state, { away: opts = false } = {}) {
  let party = state.party;
  if (!party) {
    return {
      ok: false,
      reason: "There is no party on.",
    };
  }
  if (party.host !== "you") {
    if (state.scene && !state.scene.done) {
      return {
        ok: false,
        reason: "You are in the middle of a scene.",
      };
    }
    if (party.home) {
      let leaveEvent = leaveTheirParty(state);
      return {
        ok: true,
        event: leaveEvent,
        events: [leaveEvent],
      };
    }
    if (party.leaving) {
      if (bondOf(state, party.host)?.asks?.id === "party-goodbye" && isPartyGuestActive(party.guests[party.host])) {
        let goodbyeEvent = {
          id: "approach",
          characterId: party.host,
          milestone: "party-goodbye",
          name: nameFor(state, characterOf(state, party.host)),
          door: false,
        };
        return {
          ok: true,
          event: goodbyeEvent,
          events: [goodbyeEvent],
        };
      }
      let leaveEvent = leaveTheirParty(state);
      return {
        ok: true,
        event: leaveEvent,
        events: [leaveEvent],
      };
    }
    let goodbyeEvents = startTheirPartyGoodbye(state, "you");
    return {
      ok: true,
      event: goodbyeEvents[0] ?? null,
      events: goodbyeEvents,
    };
  }
  clearPartyAsks(state, party);
  let noiseFine =
      party.neighbour && !party.neighbour.fined && party.neighbour.answer !== "down" ? fineForPartyNoise(state) : null,
    stayedLong = (guest) => (guest.gone ?? state.minutes) - guest.since >= 60,
    witnessIds = Object.entries(party.guests)
      .filter(([id, guest]) => stayedLong(guest) && hasMet2(state, id))
      .map(([id]) => id),
    rows = Object.entries(party.guests)
      .filter(([id]) => hasMet2(state, id))
      .map(([id, guest]) => {
        let friendshipGain = stayedLong(guest) ? PARTY_AFTER.find((band) => guest.mood >= band.from).friendship : 0,
          bond = bondOf(state, id);
        if (bond && friendshipGain) {
          adjustBondAxis(bond, "friendship", friendshipGain, {
            at: state.minutes,
          });
        }
        return {
          characterId: id,
          name: nameFor(state, characterOf(state, id)),
          friendship: friendshipGain,
          mood: guest.mood,
          early: !!guest.gone && !guest.tired,
          bed: !!guest.tired,
          sofa: !!guest.asleep && !guest.gone,
        };
      }),
    metPairs = [];
  for (let i = 0; i < witnessIds.length; i++) {
    for (let j = i + 1; j < witnessIds.length; j++) {
      if (
        introduceNpcPair(state, witnessIds[i], witnessIds[j], {
          place: "home",
        })
      ) {
        metPairs.push([witnessIds[i], witnessIds[j]].map((id) => nameFor(state, characterOf(state, id))));
      }
    }
  }
  let seenBy = recordTownFact(state, "party", {
      place: "home",
      what: party.meter >= PARTY_GREAT ? "great" : party.meter >= PARTY_GOOD ? "good" : "flat",
      witnesses: witnessIds,
    }),
    hostPossessive = `${state.persona?.name || "the player"}'s`,
    verdict =
      party.meter >= PARTY_GREAT ? "a great night" : party.meter >= PARTY_GOOD ? "a good night" : "it fell flat";
  for (let i = 0; i < witnessIds.length; i++) {
    for (let j = i + 1; j < witnessIds.length; j++) {
      rememberPair(state, witnessIds[i], witnessIds[j], {
        text: `Both at ${hostPossessive} party: ${verdict}.`,
        from: "party",
      });
    }
  }
  let plannedParty = partyById(state, party.id);
  if (plannedParty) {
    plannedParty.status = "done";
  }
  let atHome = !opts && isAtActiveParty(state) && !!state.residence && !state.lodging,
    stayers = atHome
      ? Object.entries(party.guests)
          .filter(([, guest]) => guest.stays && !guest.gone)
          .map(([id]) => id)
      : [],
    partnerId = stayers.find((id) => isPartner(state, id)),
    sleepoverIds = atHome
      ? [
          ...new Set([
            ...stayers.filter((id) => id !== partnerId),
            ...Object.entries(party.guests)
              .filter(([, guest]) => guest.asleep && !guest.gone)
              .map(([id]) => id),
          ]),
        ]
      : [],
    sofaNames = sleepoverIds.map((id) => nameFor(state, characterOf(state, id)));
  if (sleepoverIds.length) {
    state.sleepover = {
      ids: sleepoverIds,
      from: state.minutes,
    };
  }
  for (let i = 0; i < sleepoverIds.length; i++) {
    for (let j = i + 1; j < sleepoverIds.length; j++) {
      rememberPair(state, sleepoverIds[i], sleepoverIds[j], {
        text: `Stayed the night at ${hostPossessive} after the party, both of them.`,
        from: "party",
      });
    }
  }
  let howItWent =
      party.meter >= PARTY_GREAT ? "A great party" : party.meter >= PARTY_GOOD ? "A good night" : "It fell flat",
    summary = {
      how: howItWent,
      meter: party.meter,
      rows: rows,
      met: metPairs,
      minutes: state.minutes - party.since,
      from: party.since,
      birthday: !!party.birthday,
      seenBy: seenBy,
      ...(noiseFine
        ? {
            fine: noiseFine.amount,
            fineBy: noiseFine.name,
          }
        : {}),
    },
    memo = buildPartyMemo(state, party);
  state.partyMemo = memo;
  state.party = null;
  state.partyOver = {
    ...summary,
    sofa: sofaNames,
    remember: memo
      ? {
          pending: true,
        }
      : null,
  };
  let clock = clockFromMinutes(state.minutes),
    nextMorning =
      (clock.hour < 12 ? clock.dayIndex - 1 : clock.dayIndex) * PARTY_DAY_MINUTES + GUEST_NIGHT_FROM * 60 + 60;
  if (partnerId) {
    let guestStay = startGuest(state, partnerId, {
      why: "party",
    });
    if (guestStay) {
      guestStay.until = Math.max(guestStay.until, state.minutes + 60, nextMorning);
    }
  }
  logNote(state, `Your party is over \xB7 ${howItWent.toLowerCase()}`, "social");
  return {
    ok: true,
    summary: summary,
    event: {
      id: "party-over",
      summary: summary,
      text: "",
    },
  };
}
var THEIR_PARTY_INVITE_CHANCE = 0.12;
var THEIR_PARTY_EVERY_DAYS = 14;
var THEIR_PARTY_MIN_OPENNESS = 8;
var THEIR_PARTY_START_HOUR = 20;
var THEIR_PARTY_LATE_MINUTES = 120;
var THEIR_PARTY_MISSED_PENALTY = {
  friendship: -3,
};
var THEIR_HOME_PARTY_SLEPT_PENALTY = {
  friendship: -1,
};
var THEIR_PARTY_AFTER_GAINS = {
  host: 2,
  birthday: 2,
  others: 1,
  helped: 2,
};
var PARTY_ROOMS_BY_RESIDENCE = {
  apartments: ["living", "kitchen"],
  houses: ["living", "kitchen", "garden"],
  tower: ["living", "kitchen", "bar"],
  mansions: ["living", "kitchen", "garden", "pool", "bar"],
};
var PARTY_GUESTS_BY_RESIDENCE = {
  apartments: 4,
  houses: 8,
  tower: 8,
  mansions: 15,
};
var PARTY_GUEST_ROOM_ACTS = {
  living: {
    key: "dance",
    name: "Dance",
    minutes: 15,
    meter: 6,
    mood: 2,
    all: 1,
    words: "dance",
    with: {
      action: "novelty",
      amount: 2,
    },
  },
  kitchen: {
    key: "help",
    name: "Help out in the kitchen",
    minutes: 15,
    meter: 3,
    host: 3,
    words: "help out in the kitchen with the food and the drinks",
    with: {
      action: "care",
      amount: 2,
    },
  },
  garden: {
    key: "air",
    name: "Get some air",
    minutes: 10,
    meter: 2,
    mood: 1,
    rest: 5,
    words: "step out into the garden for some fresh air",
    with: {
      action: "deep",
      amount: 2,
    },
  },
  pool: {
    key: "swim",
    name: "Jump in the pool",
    minutes: 30,
    meter: 8,
    mood: 3,
    words: "jump in the pool",
    with: {
      action: "time",
      amount: 2,
    },
  },
  bar: {
    key: "drink",
    name: "Get a drink",
    minutes: 10,
    meter: 3,
    mood: 1,
    words: "get a drink at the bar and have it together",
    with: {
      action: "time",
      amount: 2,
    },
  },
  console: {
    key: "game",
    name: "Join the game",
    minutes: 30,
    meter: 4,
    mood: 2,
    words: "join the game on the console",
    with: {
      action: "challenge",
      amount: 2,
    },
  },
};
var PARTY_SING_ACT = {
  key: "sing",
  name: "Sing happy birthday",
  minutes: 10,
  once: true,
  meter: 10,
  mood: 1,
  all: 1,
  host: 3,
  everyone: true,
  words: "sing happy birthday to the one whose birthday it is",
};
var PARTY_TOAST_ACT = {
  key: "toast",
  name: "A toast to them",
  minutes: 10,
  once: true,
  meter: 6,
  mood: 1,
  all: 1,
  host: 2,
  everyone: true,
  words: "raise a toast to the one whose birthday it is",
};
var ALL_PARTY_ACT_KEYS = [
  ...new Set([
    ...Object.values(PARTY_ROOMS).map((room) => room.act.key),
    ...Object.values(PARTY_GUEST_ROOM_ACTS).map((act) => act.key),
    "cake",
    "presents",
    PARTY_SING_ACT.key,
    PARTY_TOAST_ACT.key,
    PARTY_EAT.key,
  ]),
];
function theirPartyFare(state, character, residenceKind) {
  if (cookingHandOf(state, character) >= 2) {
    let dish = theirDish(state, character, {
      salt: "party",
    });
    if (dish) {
      return {
        kind: "homemade",
        name: `${dish.recipe.name}, homemade`,
      };
    }
  }
  return ["mansions", "tower"].includes(residenceKind)
    ? {
        kind: "catering",
        name: "Catering",
      }
    : {
        kind: "snacks",
        name: "Snacks and drinks",
      };
}
function planTheirParty(state, host, day) {
  let residenceKind = host.residence?.place;
  if (!residenceKind || host.away || yourPartyOn(state, day)) {
    return null;
  }
  let startAt = day * PARTY_DAY_MINUTES + THEIR_PARTY_START_HOUR * 60;
  if (busyWhy(state, host, startAt)) {
    return null;
  }
  let atHome = hasOwnHome(state) && sharesYourDoor(state, host),
    guestIds = npcPairsOf(state, host.id)
      .filter(
        (pair) =>
          ["friends", "close", "family", "couple"].includes(pair.kind) &&
          characterOf(state, pair.other) &&
          !characterOf(state, pair.other).away &&
          !busyWhy(state, characterOf(state, pair.other), startAt),
      )
      .map((pair) => pair.other)
      .slice(0, (atHome ? partyMax(state) : (PARTY_GUESTS_BY_RESIDENCE[residenceKind] ?? 4)) - 1);
  return {
    host: host.id,
    at: startAt,
    guests: guestIds,
    place: residenceKind,
    kind: "hang",
    placeId: "their",
    characterId: host.id,
    ...(atHome
      ? {
          home: true,
        }
      : {}),
  };
}
function rollTheirPartyInvite(state, day) {
  if (state.theirPartyDay !== day) {
    for (let character of castInTown(state)) {
      let bond = bondOf(state, character.id);
      if (
        !(
          !bond ||
          bond.asks ||
          !hasMet2(state, character.id) ||
          bondTier(bond, "friendship") < 2 ||
          !character.residence
        ) &&
        !((traitsOf(state, character.id).dials.open ?? 5) < THEIR_PARTY_MIN_OPENNESS) &&
        !(state.parties ?? []).some(
          (party) =>
            party.host === character.id && party.at > state.minutes - THEIR_PARTY_EVERY_DAYS * PARTY_DAY_MINUTES,
        ) &&
        !((bond.partyAskedAt ?? -1 / 0) > state.minutes - THEIR_PARTY_EVERY_DAYS * PARTY_DAY_MINUTES) &&
        !(seededRandom(state.seed, character.id, String(day), "their-party") >= THEIR_PARTY_INVITE_CHANCE)
      ) {
        for (let day2 = day + 2; day2 <= day + 5; day2++) {
          let plan = planTheirParty(state, character, day2);
          if (plan) {
            bond.asks = {
              id: "party-invite",
              at: state.minutes,
              due: approachDue(bond, state.minutes),
              party: plan,
            };
            state.theirPartyDay = day;
            return;
          }
        }
      }
    }
  }
}
function answerTheirPartyInvite(state, bond, plan, accepted, { birthday: opts = null } = {}) {
  if (((bond.partyAskedAt = state.minutes), !plan)) {
    return null;
  }
  let partyId = `party${plan.host}${plan.at.toString(36)}`,
    declined =
      !accepted ||
      yourBusy(state, plan.at, {
        except: partyId,
      });
  if (
    (declined &&
      !(
        plan.at + PARTY_MINUTES > state.minutes &&
        (!plan.home || !yourPartyOn(state, Math.floor(plan.at / PARTY_DAY_MINUTES)))
      )) ||
    (!declined && plan.at + THEIR_PARTY_LATE_MINUTES < state.minutes)
  ) {
    return null;
  }
  state.parties ??= [];
  let party = {
    id: partyId,
    host: plan.host,
    at: plan.at,
    guests: plan.guests ?? [],
    place: plan.place,
    you: declined ? "no" : "yes",
    status: "set",
    made: state.minutes,
    ...(plan.home
      ? {
          home: true,
        }
      : {}),
    ...(opts
      ? {
          birthday: opts,
        }
      : {}),
  };
  state.parties = state.parties.filter((entry) => entry.id !== party.id);
  state.parties.push(party);
  if (state.parties.length > 20) {
    state.parties.splice(0, state.parties.length - 20);
  }
  return declined ? null : party;
}
function describeTheirPartyPlan(state, party) {
  let host = characterOf(state, party.host),
    guestNames = (party.guests ?? []).map((guestId) => characterOf(state, guestId)?.name).filter(Boolean),
    clock = clockFromMinutes(party.at);
  return `THE PARTY: ${party.home ? `at the home ${host?.name ?? "they"} shares with the player` : host ? `at ${host.name}'s place` : "at their place"}, ${clock.weekday} ${clock.day} at ${formatClockTime(party.at)}${guestNames.length ? `; ${guestNames.join(", ")} will be there too` : ""}. It is a real plan.`;
}
var acceptedTheirParties = (state) =>
  (state.parties ?? []).filter((party) => party.host !== "you" && party.you === "yes" && party.status === "set");
var theirHomePartiesPending = (state) =>
  (state.parties ?? []).filter(
    (party) =>
      party.home &&
      party.host !== "you" &&
      (party.you === "no" ? party.status === "set" : ["slept", "late"].includes(party.status)),
  );
var theirHomePartyJoinDeadline = (party) =>
  party.you === "yes" && party.status === "set" ? party.at + THEIR_PARTY_LATE_MINUTES : party.at + PARTY_MINUTES - 1;
function partyStripItems(state) {
  let today = clockFromMinutes(state.minutes).dayIndex,
    acceptedItems = acceptedTheirParties(state)
      .filter((party) => clockFromMinutes(party.at).dayIndex === today)
      .map((party) => {
        let host = characterOf(state, party.host),
          isHere = party.home
            ? isRestingAtOwnHome(state)
            : !!host?.residence &&
              state.at === host.residence.place &&
              (!state.visit || (state.visit.characterId === party.host && !state.visit.party)),
          inWindow =
            state.minutes >= (party.home ? party.at : party.at - PARTY_EARLY) &&
            state.minutes <= party.at + THEIR_PARTY_LATE_MINUTES;
        return {
          party: true,
          id: party.id,
          name: nameFor(state, host),
          placeName: party.home ? "Home" : `${nameFor(state, host)}'s place`,
          time: formatClockTime(party.at),
          at: party.at,
          birthday: !!party.birthday,
          ...(party.home
            ? {
                home: true,
              }
            : {}),
          here: isHere,
          canStart: isHere && inWindow,
          canWait:
            isHere &&
            !inWindow &&
            state.minutes < party.at &&
            minutesUntilTheirPartyDoor(state, party) <= PARTY_WAIT_MAX_MINUTES,
          big: inWindow || party.at - state.minutes <= 120,
        };
      }),
    homeItems = theirHomePartiesPending(state)
      .filter(
        (party) =>
          state.party?.id !== party.id &&
          state.minutes >= party.at &&
          state.minutes <= theirHomePartyJoinDeadline(party) &&
          isRestingAtOwnHome(state) &&
          !state.party &&
          stillOnPartyTerms(state, party.host, party.made),
      )
      .map((party) => ({
        party: true,
        id: party.id,
        name: nameFor(state, characterOf(state, party.host)),
        placeName: "Home",
        time: formatClockTime(party.at),
        at: party.at,
        birthday: !!party.birthday,
        home: true,
        here: true,
        canStart: true,
        canWait: false,
        big: true,
      })),
    ownParty = partyAhead(state),
    ownItems =
      ownParty && clockFromMinutes(ownParty.at).dayIndex === today && !(state.at === "home" && !state.visit)
        ? [
            {
              party: true,
              yours: true,
              id: ownParty.id,
              name: "",
              placeName: "Your place",
              time: formatClockTime(ownParty.at),
              at: ownParty.at,
              birthday: !!ownParty.birthday,
              here: false,
              canStart: false,
              big: ownParty.at - state.minutes <= 180,
            },
          ]
        : [];
  return [...acceptedItems, ...homeItems, ...ownItems];
}
var PARTY_WAIT_MAX_MINUTES = 180;
var minutesUntilTheirPartyDoor = (state, party) => (party.home ? party.at : party.at - PARTY_EARLY) - state.minutes;
function waitForTheirParty(state, partyId) {
  let party = acceptedTheirParties(state).find((entry) => entry.id === partyId),
    host = party && characterOf(state, party.host);
  if (!party) {
    return {
      ok: false,
      reason: "Go to their door first.",
    };
  }
  if (
    party.home
      ? !isRestingAtOwnHome(state)
      : state.at !== host?.residence?.place ||
        (state.visit && (state.visit.characterId !== party.host || state.visit.party))
  ) {
    return {
      ok: false,
      reason: party.home ? "It's at home." : "Go to their door first.",
    };
  }
  let waitMinutes = minutesUntilTheirPartyDoor(state, party);
  if (waitMinutes <= 0 || waitMinutes > PARTY_WAIT_MAX_MINUTES) {
    return {
      ok: false,
      reason: "Nothing to wait for.",
    };
  }
  let { events: events } = advanceTime(state, waitMinutes);
  return {
    ok: true,
    minutes: waitMinutes,
    events: events,
  };
}
function joinTheirParty(state, partyId) {
  let party =
    acceptedTheirParties(state).find((entry) => entry.id === partyId) ??
    theirHomePartiesPending(state).find((entry) => entry.id === partyId);
  if (!party) {
    return {
      ok: false,
      reason: "There is no party for you there.",
    };
  }
  let host = characterOf(state, party.host);
  if (ownPartyBlocksReason(state)) {
    return {
      ok: false,
      reason: ownPartyBlocksReason(state),
    };
  }
  if (party.home) {
    if (sceneBusyReason(state)) {
      return {
        ok: false,
        reason: sceneBusyReason(state),
      };
    }
    if (!isRestingAtOwnHome(state)) {
      return {
        ok: false,
        reason: "It's at home.",
      };
    }
    if (state.minutes < party.at || state.minutes > theirHomePartyJoinDeadline(party)) {
      return {
        ok: false,
        reason: state.minutes < party.at ? `It starts at ${formatClockTime(party.at)}.` : "It's over.",
      };
    }
    if (state.party) {
      return {
        ok: false,
        reason: "There's a party on already.",
      };
    }
    let events = startTheirHomeParty(state, party);
    return {
      ok: !!state.party,
      ...(state.party
        ? {}
        : {
            reason: events[0]?.text ?? "Not now.",
          }),
      events: events,
    };
  }
  let inVisit = state.visit?.characterId === party.host && !state.visit.party && state.visit.stage !== "door";
  if (!host?.residence || state.at !== host.residence.place || (state.visit && !inVisit)) {
    return {
      ok: false,
      reason: "Go to their door first.",
    };
  }
  if (state.minutes < party.at - PARTY_EARLY || state.minutes > party.at + THEIR_PARTY_LATE_MINUTES) {
    return {
      ok: false,
      reason: `It starts at ${formatClockTime(party.at)}.`,
    };
  }
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (!stillOnPartyTerms(state, party.host, party.made)) {
    party.status = "off";
    return {
      ok: false,
      reason: `Things changed between you and ${nameFor(state, host)}: their invitation no longer stands.`,
    };
  }
  let guestIds = [
    party.host,
    ...party.guests.filter((guestId) => {
      let guestChar = characterOf(state, guestId);
      return guestChar && !guestChar.away && !busyWhy(state, guestChar, state.minutes);
    }),
  ];
  party.status = "on";
  state.visit = {
    characterId: party.host,
    stage: "inside",
    invite: {
      yes: true,
    },
    at: state.minutes,
    since: state.minutes,
    did: [],
    party: party.id,
  };
  let rooms = PARTY_ROOMS_BY_RESIDENCE[host.residence.place] ?? PARTY_ROOMS_BY_RESIDENCE.apartments,
    startAt = party.at <= state.minutes ? party.at : state.minutes;
  state.party = {
    id: party.id,
    host: party.host,
    since: state.minutes,
    until: startAt + PARTY_MINUTES,
    room: "living",
    rooms: rooms,
    meter: PARTY_START.meter + 10,
    guests: Object.fromEntries(
      guestIds.map((guestId) => [
        guestId,
        {
          room: "living",
          mood: PARTY_START.mood + 1,
          since: state.minutes,
        },
      ]),
    ),
    left: [],
    done: {},
    lastMove: state.minutes,
    lively: {
      living: state.minutes,
    },
    food: "theirs",
    fare: theirPartyFare(state, party.host, host.residence.place),
    ...(party.birthday
      ? {
          birthday: party.birthday,
        }
      : {}),
  };
  logNote(state, `Went to ${nameFor(state, host)}'s party`, "social");
  let bond = bondOf(state, party.host),
    lateMinutes = Math.max(0, state.minutes - party.at);
  return inVisit
    ? ((state.party.arrived = true),
      {
        ok: true,
      })
    : bond && !bond.asks
      ? ((bond.asks = {
          id: "party-arrive",
          at: state.minutes,
          due: state.minutes,
          about: {
            party: true,
            kind: "arrive",
            late: lateMinutes,
            text: `The player arrives at ${host.name}'s party${party.birthday ? ` (${host.name}'s birthday)` : ""} and ${host.name} opens the door, the music and the voices of the others behind them.${lateMinutes >= PARTY_LATE_NOTICED_MINUTES ? ` The player is ${lateMinutes} minutes late, and ${host.name} notices, in their own way.` : ""}`,
          },
        }),
        (state.party.arrived = false),
        {
          ok: true,
          approach: {
            id: "approach",
            characterId: party.host,
            milestone: "party-arrive",
            name: nameFor(state, host),
            door: false,
          },
        })
      : ((state.party.arrived = true),
        {
          ok: true,
        });
}
var PARTY_LATE_NOTICED_MINUTES = 30;
var isRestingAtOwnHome = (state) =>
  hasOwnHome(state) && state.at === "home" && !state.visit && !state.outing && !(state.scene && !state.scene.done);
function startTheirHomeParty(state, party) {
  let host = characterOf(state, party.host),
    joiningLate = party.you === "no" || party.status === "slept" || party.status === "late";
  if (!stillOnPartyTerms(state, party.host, party.made)) {
    if (!joiningLate) {
      party.status = "off";
    }
    return [
      {
        id: "party-off",
        characterId: party.host,
        text: `${nameFor(state, host)}'s party at home goes on without you.`,
      },
    ];
  }
  let isFree = (guestId) => {
      let guestChar = characterOf(state, guestId);
      return guestChar && !guestChar.away && !busyWhy(state, guestChar, state.minutes);
    },
    housemates = castInTown(state)
      .filter(
        (character) =>
          character.id !== party.host &&
          hasMet2(state, character.id) &&
          sharesYourDoor(state, character) &&
          !busyWhy(state, character, state.minutes),
      )
      .map((character) => character.id),
    guestIds = [
      ...new Set([
        party.host,
        ...party.guests.filter(isFree),
        ...housemates,
        ...(state.guest ? [state.guest.characterId] : []),
      ]),
    ];
  party.status = "on";
  let now = state.minutes;
  state.party = {
    id: party.id,
    host: party.host,
    home: true,
    since: now,
    until: (joiningLate ? party.at : Math.max(party.at, now)) + PARTY_MINUTES,
    room: "living",
    rooms: partyRooms(state),
    meter: PARTY_START.meter + 10,
    guests: Object.fromEntries(
      guestIds.map((guestId) => [
        guestId,
        {
          room: "living",
          mood: PARTY_START.mood + 1,
          since: now,
          ...(housemates.includes(guestId)
            ? {
                mate: true,
              }
            : {}),
        },
      ]),
    ),
    left: [],
    done: {},
    lastMove: now,
    lively: {
      living: now,
    },
    food: "theirs",
    fare: theirPartyFare(state, party.host, state.residence.place),
    arrived: true,
    ...(party.birthday
      ? {
          birthday: party.birthday,
        }
      : {}),
  };
  state.guest = null;
  let hostName = nameFor(state, host);
  logNote(state, `${hostName}'s party at home`, "social");
  return [
    {
      id: "party-start",
      characterId: party.host,
      home: true,
      text: joiningLate
        ? `You join ${hostName}'s ${party.birthday ? "birthday party" : "party"} at home.`
        : `${hostName}'s ${party.birthday ? "birthday party" : "party"} starts at home: their guests are here.`,
    },
  ];
}
function leaveTheirParty(state, { stay: opts = false } = {}) {
  let party = state.party;
  clearPartyAsks(state, party);
  let noiseFine =
      party.home && party.neighbour && !party.neighbour.fined && party.neighbour.answer !== "down"
        ? fineForPartyNoise(state)
        : null,
    hostId = party.host,
    stayedLong = state.minutes - party.since >= 60,
    rows = [],
    bond = bondOf(state, hostId),
    helped = stayedLong && (party.log ?? []).length + (party.mingled ?? 0) >= 2 && party.meter >= PARTY_GOOD,
    hostGain = stayedLong
      ? THEIR_PARTY_AFTER_GAINS.host +
        (party.birthday ? THEIR_PARTY_AFTER_GAINS.birthday : 0) +
        (helped ? THEIR_PARTY_AFTER_GAINS.helped : 0)
      : 0;
  if (bond && hostGain) {
    adjustBondAxis(bond, "friendship", hostGain, {
      at: state.minutes,
    });
  }
  if (party.birthday) {
    markSaid(state, hostId, "party");
  }
  let hostName = nameFor(state, characterOf(state, hostId));
  rows.push({
    characterId: hostId,
    name: hostName,
    friendship: hostGain,
    host: true,
    helped: helped,
    early: !stayedLong,
  });
  for (let [guestId, guest] of Object.entries(party.guests)) {
    if (!(!stayedLong || guestId === hostId || guest.gone || guest.mood < 2 || !hasMet2(state, guestId))) {
      adjustBondAxis(bondOf(state, guestId), "friendship", THEIR_PARTY_AFTER_GAINS.others, {
        at: state.minutes,
      });
      rows.push({
        characterId: guestId,
        name: nameFor(state, characterOf(state, guestId)),
        friendship: THEIR_PARTY_AFTER_GAINS.others,
      });
    }
  }
  let newlyMet = Object.keys(party.guests)
      .filter((id) => id !== hostId && hasMet2(state, id) && (bondOf(state, id)?.metAt ?? -1 / 0) >= party.since)
      .map((id) => nameFor(state, characterOf(state, id))),
    witnessIds = Object.entries(party.guests)
      .filter(([id, guest]) => id !== hostId && (guest.gone ?? state.minutes) - guest.since >= 60)
      .map(([id]) => id),
    seenBy = recordTownFact(state, "party-guest", {
      with: hostId,
      place: state.at,
      witnesses: witnessIds,
    }),
    verdict =
      party.meter >= PARTY_GREAT ? "a great night" : party.meter >= PARTY_GOOD ? "a good night" : "it fell flat",
    hostName2 = characterOf(state, hostId)?.name ?? "someone";
  for (let i = 0; i < witnessIds.length; i++) {
    for (let j = i + 1; j < witnessIds.length; j++) {
      rememberPair(state, witnessIds[i], witnessIds[j], {
        text: `Both at ${hostName2}'s party: ${verdict}.`,
        from: "party",
      });
    }
  }
  let howItWent =
      party.meter >= PARTY_GREAT ? "A great party" : party.meter >= PARTY_GOOD ? "A good night" : "It fell flat",
    memo = buildPartyMemo(state, party);
  state.partyMemo = memo;
  let plannedParty = partyById(state, party.id);
  if (plannedParty) {
    plannedParty.status = "done";
  }
  state.partyOver = {
    theirs: true,
    ...(party.home
      ? {
          home: true,
        }
      : {}),
    hostName: hostName,
    how: howItWent,
    meter: party.meter,
    rows: rows,
    met: newlyMet.map((metName) => [metName]),
    minutes: state.minutes - party.since,
    from: party.since,
    birthday: !!party.birthday,
    seenBy: seenBy,
    remember: memo
      ? {
          pending: true,
        }
      : null,
    stay: opts,
    ...(noiseFine
      ? {
          fine: noiseFine.amount,
          fineBy: noiseFine.name,
        }
      : {}),
  };
  state.party = null;
  state.visit =
    opts && !party.home
      ? {
          characterId: hostId,
          stage: "inside",
          invite: {
            yes: true,
          },
          at: state.minutes,
          since: state.minutes,
          did: [],
        }
      : null;
  let logText = `You left ${hostName}'s party${
    rows.some((row) => row.friendship)
      ? `: ${rows
          .filter((row) => row.friendship)
          .map((row) => `+${row.friendship} Friendship with ${row.name}`)
          .join(", ")}`
      : ""
  }.`;
  logNote(state, logText, "social");
  return {
    id: "party-over",
    theirs: true,
    stay: opts,
    ...(party.home
      ? {
          home: true,
        }
      : {}),
    text: "",
  };
}
function buildPartyMemo(state, party) {
  let sceneCast = state.faintMemo?.kind === "scene" && state.scene ? eventCast(state.scene) : [],
    ids = [
      ...new Set([
        ...(party.host !== "you" ? [party.host] : []),
        ...(party.log ?? []).map((entry) => entry.with).filter(Boolean),
      ]),
    ].filter((id) => characterOf(state, id) && hasMet2(state, id) && !sceneCast.includes(id));
  if (!ids.length) {
    return null;
  }
  let nameOf = (id) => characterOf(state, id)?.name ?? "someone";
  return {
    pending: true,
    ids: ids,
    at: state.minutes,
    host: party.host,
    fainted: !!state.collapsing,
    whose:
      party.host === "you"
        ? "the player's party, at the player's home"
        : party.home
          ? `${nameOf(party.host)}'s party, at the home ${nameOf(party.host)} shares with the player`
          : `${nameOf(party.host)}'s party, at ${nameOf(party.host)}'s home, the player a guest`,
    how: describePartyEvening(state, party),
    log: (party.log ?? []).slice(-12).map((entry) => ({
      with: entry.with,
      text: `${entry.words}${entry.with ? ` with ${nameOf(entry.with)}` : entry.everyone ? " with everyone in the room" : " on their own"}`,
    })),
  };
}
function keepPartyMemories(state, memories) {
  let memo = state.partyMemo,
    over = state.partyOver;
  if (!memo) {
    return over?.remember?.pending ? (over.remember = null) : (over?.remember ?? null);
  }
  state.partyMemo = null;
  let rows = [];
  for (let id of memories ? memo.ids : []) {
    let text = memories[id],
      character = characterOf(state, id);
    if (!(!text || !character)) {
      addMemory(character, {
        at: memo.at,
        text: text,
        from: "party",
      });
      rows.push({
        id: id,
        name: nameFor(state, character),
        text: text,
      });
    }
  }
  let result = rows.length
    ? {
        rows: rows,
      }
    : null;
  if (over?.remember?.pending) {
    over.remember = result;
  }
  return result;
}
var PARTY_EVENT_CHANCE = 0.3;
var PARTY_EVENTS_MAX = 2;
var PARTY_EVENT_OUTCOMES = {
  crush: {
    cheer: {
      romance: 12,
      meter: 3,
    },
    tease: {
      romance: 6,
      meter: 5,
    },
  },
  fight: {
    calm: {
      meter: -3,
      mood: 1,
    },
    side: {
      meter: -6,
      mood: 2,
      other: -3,
    },
    out: {
      meter: -8,
    },
  },
  stay: {
    yes: {
      friendship: 2,
    },
    no: {
      mood: -1,
    },
  },
  crasher: {
    welcome: {
      meter: 4,
      mood: 1,
    },
    out: {
      mood: -3,
    },
  },
  "their-crush": {
    cheer: {
      romance: 12,
      meter: 3,
    },
    tease: {
      romance: 6,
      meter: 4,
    },
    leave: {},
  },
  "their-fight": {
    calm: {
      meter: 3,
      mood: 1,
    },
    side: {
      mood: 2,
      other: -3,
    },
    leave: {
      meter: -3,
    },
  },
  drunk: {
    care: {
      meter: 2,
      friendship: 2,
    },
    leave: {},
  },
  toast: {
    glass: {
      meter: 4,
      host: 1,
    },
    words: {
      meter: 6,
      host: 2,
      friendship: 1,
    },
  },
};
var NEIGHBOUR_COMPLAINT_HOUR = 23;
var NEIGHBOUR_COMPLAINT_CHANCE = {
  apartments: 0.8,
  tower: 0.3,
  houses: 0.05,
  mansions: 0.05,
};
var NEIGHBOUR_NOISE_FINE = {
  apartments: 150,
  tower: 300,
  houses: 100,
  mansions: 100,
};
var NEIGHBOUR_TURN_DOWN_METER = 10;
var THEIR_PARTY_EVENT_MILESTONES = {
  "their-crush": "party-hit-off",
  "their-fight": "party-row",
  drunk: "party-drunk",
  toast: "party-toast",
};
var PARTY_DRUNK_MIN_MOOD = 3;
var isPartyGuestPresent = (party, guestId) => isPartyGuestActive(party.guests[guestId]);
var isLateNightHour = (minutes, fromHour) => {
  let hour = clockFromMinutes(minutes).hour;
  return hour >= fromHour || hour < 6;
};
function ownPartyEventCandidates(state) {
  let party = state.party,
    present = Object.keys(party.guests).filter((id) => isPartyGuestPresent(party, id)),
    candidates = [];
  for (let i2 = 0; i2 < present.length; i2++) {
    for (let j = i2 + 1; j < present.length; j++) {
      let [first, second] = [present[i2], present[j]],
        pair = npcPairBetween(state, first, second);
      if (pair && ["rivals", "ex"].includes(pair.kind)) {
        candidates.push({
          kind: "fight",
          a: first,
          b: second,
        });
      } else if (
        pair?.kind !== "couple" &&
        pair?.kind !== "family" &&
        !isPartner(state, first) &&
        !isPartner(state, second) &&
        romanceBetween(
          state,
          characterOf(state, first) ?? {},
          characterOf(state, second) ?? {},
          pair ?? {
            kind: "acquaintances",
          },
        ) > 0
      ) {
        candidates.push({
          kind: "crush",
          a: first,
          b: second,
        });
      }
    }
  }
  if (isLateNightHour(state.minutes, 22) || state.minutes >= party.until - 60) {
    for (let id of present) {
      if (party.guests[id].mood >= 4 && (isPartner(state, id) || bondTier(bondOf(state, id), "friendship") >= 3)) {
        candidates.push({
          kind: "stay",
          a: id,
        });
      }
    }
  }
  for (let id of present) {
    let expected = [...(party.door ?? []), ...(party.queue ?? []).flatMap((group) => group.ids)],
      alreadyAsked = partyById(state, party.id)?.asked ?? [],
      friendPair = npcPairsOf(state, id).find(
        (pair) =>
          ["friends", "close"].includes(pair.kind) &&
          !party.guests[pair.other] &&
          !expected.includes(pair.other) &&
          !alreadyAsked.includes(pair.other) &&
          characterOf(state, pair.other) &&
          !characterOf(state, pair.other).away &&
          !sharesYourDoor(state, characterOf(state, pair.other)) &&
          !busyWhy(state, characterOf(state, pair.other), state.minutes),
      );
    if (
      friendPair &&
      Object.values(party.guests).filter((guest) => !guest.mate).length + expected.length < partyMax(state)
    ) {
      candidates.push({
        kind: "crasher",
        a: id,
        b: friendPair.other,
      });
    }
  }
  return candidates.filter((candidate) => !(party.events ?? []).some((ev) => ev.kind === candidate.kind));
}
function rollOwnPartyEvent(state) {
  let party = state.party;
  if (
    (party.events ?? []).length >= PARTY_EVENTS_MAX ||
    (state.scene && !state.scene.done) ||
    seededRandom(state.seed, party.id, String(party.lastMove), "event") >= PARTY_EVENT_CHANCE
  ) {
    return null;
  }
  let candidates = ownPartyEventCandidates(state);
  if (!candidates.length) {
    return null;
  }
  let pick =
      candidates[Math.floor(seededRandom(state.seed, party.id, String(party.lastMove), "which") * candidates.length)],
    askerId = pick.a,
    bond = bondOf(state, askerId);
  if (!bond || bond.asks) {
    return null;
  }
  let nameOf = (id) => characterOf(state, id)?.name ?? "someone",
    prompts = {
      crush: () =>
        `At the player's party, ${nameOf(askerId)} has been getting on really well with ${nameOf(pick.b)}; the two of them come over to the player together, a little giddy, and it shows they like each other.`,
      fight: () =>
        `At the player's party, ${nameOf(askerId)} and ${nameOf(pick.b)} (${npcPairBetween(state, askerId, pick.b)?.kind === "ex" ? "exes" : "who cannot stand each other"}) are arguing right in front of the player, loudly enough for everyone to notice; both are here and both speak.`,
      stay: () =>
        `The player's party is winding down and ${nameOf(askerId)} has had a great time; they ask whether they could stay the night instead of going home.`,
      crasher: () =>
        `${nameOf(askerId)} brought ${nameOf(pick.b)}, a friend of theirs the player did not invite, to the party, and comes to tell the player, a little sheepish.`,
    };
  bond.asks = {
    id: `party-${pick.kind}`,
    at: state.minutes,
    due: state.minutes,
    about: {
      party: true,
      kind: pick.kind,
      with: pick.b ?? null,
      text: prompts[pick.kind](),
    },
  };
  party.guests[askerId].room = party.room;
  if (pick.kind === "crasher") {
    party.guests[pick.b] = {
      room: party.room,
      mood: 0,
      since: state.minutes,
      crasher: true,
    };
  }
  (party.events ??= []).push({
    kind: pick.kind,
    a: askerId,
    b: pick.b ?? null,
    at: state.minutes,
  });
  return {
    id: "approach",
    characterId: askerId,
    milestone: `party-${pick.kind}`,
    name: nameOf(askerId),
    door: false,
  };
}
function rollTheirPartyEvent(state) {
  let party = state.party;
  if (
    party.arrived === false ||
    party.leaving ||
    (party.events ?? []).length >= PARTY_EVENTS_MAX ||
    (state.scene && !state.scene.done) ||
    seededRandom(state.seed, party.id, String(party.lastMove), "their-event") >= PARTY_EVENT_CHANCE
  ) {
    return null;
  }
  let present = Object.keys(party.guests).filter((id) => isPartyGuestPresent(party, id)),
    candidates = [];
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      let [first, second] = [present[i], present[j]],
        pair = npcPairBetween(state, first, second);
      if (pair && ["rivals", "ex"].includes(pair.kind)) {
        candidates.push({
          kind: "their-fight",
          a: first,
          b: second,
        });
      } else if (
        pair?.kind !== "couple" &&
        pair?.kind !== "family" &&
        !isPartner(state, first) &&
        !isPartner(state, second) &&
        romanceBetween(
          state,
          characterOf(state, first) ?? {},
          characterOf(state, second) ?? {},
          pair ?? {
            kind: "acquaintances",
          },
        ) > 0
      ) {
        candidates.push({
          kind: "their-crush",
          a: first,
          b: second,
        });
      }
    }
  }
  let stayedLong = state.minutes - party.since >= 60;
  if (stayedLong) {
    for (let id of present) {
      if (id !== party.host && party.guests[id].mood >= PARTY_DRUNK_MIN_MOOD) {
        candidates.push({
          kind: "drunk",
          a: id,
        });
      }
    }
  }
  if (stayedLong && !party.birthday && present.includes(party.host)) {
    candidates.push({
      kind: "toast",
      a: party.host,
    });
  }
  let fresh = candidates.filter((candidate) => !(party.events ?? []).some((ev) => ev.kind === candidate.kind));
  if (!fresh.length) {
    return null;
  }
  let pick =
      fresh[Math.floor(seededRandom(state.seed, party.id, String(party.lastMove), "their-which") * fresh.length)],
    askerId = pick.a,
    bond = bondOf(state, askerId);
  if (!bond || bond.asks || !hasMet2(state, askerId)) {
    return null;
  }
  let nameOf = (id) => characterOf(state, id)?.name ?? "someone",
    whereText = party.home
      ? `${nameOf(party.host)}'s party, at the home they share with the player`
      : `${nameOf(party.host)}'s party, where the player is a guest`,
    prompts = {
      "their-crush": () =>
        `At ${whereText}, ${nameOf(askerId)} has been getting on really well with ${nameOf(pick.b)}; the two of them come over to the player together, a little giddy, and it shows they like each other.`,
      "their-fight": () =>
        `At ${whereText}, ${nameOf(askerId)} and ${nameOf(pick.b)} (${npcPairBetween(state, askerId, pick.b)?.kind === "ex" ? "exes" : "who cannot stand each other"}) are arguing right in front of the player, loudly enough for everyone to notice; both are here and both speak.`,
      drunk: () =>
        `At ${whereText}, ${nameOf(askerId)} has had one drink too many and comes over to the player, chatty and a little unsteady.`,
      toast: () =>
        `At their own party, ${nameOf(askerId)} is about to raise a toast to everyone who came, and comes over to the player first, glass in hand, to have the player by their side for it.`,
    },
    milestone = THEIR_PARTY_EVENT_MILESTONES[pick.kind];
  bond.asks = {
    id: milestone,
    at: state.minutes,
    due: state.minutes,
    about: {
      party: true,
      kind: pick.kind,
      with: pick.b ?? null,
      text: prompts[pick.kind](),
    },
  };
  party.guests[askerId].room = party.room;
  (party.events ??= []).push({
    kind: pick.kind,
    a: askerId,
    b: pick.b ?? null,
    at: state.minutes,
  });
  return {
    id: "approach",
    characterId: askerId,
    milestone: milestone,
    name: nameFor(state, characterOf(state, askerId)),
    door: false,
  };
}
function settlePartyEventAsk(state, scene, bond, choice) {
  let party = state.party,
    kind = scene.about?.kind,
    otherId = scene.about?.with ?? null,
    outcome = PARTY_EVENT_OUTCOMES[kind]?.[choice] ?? {},
    events = [];
  if (party) {
    party.meter = clampPartyMeter(party.meter + (outcome.meter ?? 0));
    if (isPartyGuestPresent(party, bond.characterId)) {
      party.guests[bond.characterId].mood += outcome.mood ?? 0;
    }
  }
  let nameOf = (id) => nameFor(state, characterOf(state, id));
  if (kind === "crush" && otherId) {
    let pair =
      npcPairBetween(state, bond.characterId, otherId) ??
      (introduceNpcPair(state, bond.characterId, otherId, {
        place: "home",
      }),
      npcPairBetween(state, bond.characterId, otherId));
    if (pair) {
      pair.romance = Math.min(100, (pair.romance ?? 0) + (outcome.romance ?? 0));
    }
    state.week?.items?.push({
      kind: "flirt",
      a: bond.characterId,
      b: otherId,
      place: "home",
      at: state.minutes,
    });
    for (let [watcherId, seenId] of [
      [bond.characterId, otherId],
      [otherId, bond.characterId],
    ]) {
      if (isPartner(state, watcherId)) {
        learnYou(state, watcherId, seenId, {
          how: "seen",
          place: "home",
        });
      }
    }
    scene.outcome = {
      headline: `${nameOf(bond.characterId)} and ${nameOf(otherId)} hit it off.`,
    };
  } else if (kind === "fight") {
    if (choice === "out" && otherId && party?.guests[otherId]) {
      party.guests[otherId].gone = state.minutes;
      party.left.push(otherId);
      events.push({
        id: "party-left",
        characterId: otherId,
        text: `${nameOf(otherId)} left.`,
      });
    }
    if (choice === "side" && otherId && party?.guests[otherId]) {
      party.guests[otherId].mood += outcome.other ?? 0;
    }
    scene.outcome = {
      headline:
        choice === "calm"
          ? "You calmed things down."
          : choice === "side"
            ? `You took ${nameOf(bond.characterId)}'s side.`
            : `${nameOf(otherId)} had to go.`,
    };
  } else if (kind === "stay") {
    if (choice === "yes") {
      adjustBondAxis(bond, "friendship", outcome.friendship ?? 0, {
        at: state.minutes,
      });
      if (party?.guests[bond.characterId]) {
        party.guests[bond.characterId].stays = true;
      }
    }
    scene.outcome = {
      headline: choice === "yes" ? `${nameOf(bond.characterId)} stays the night.` : "Not tonight.",
    };
  } else if (kind === "crasher" && otherId) {
    if (choice === "out" && party?.guests[otherId]) {
      party.guests[otherId].gone = state.minutes;
      party.left.push(otherId);
    }
    let friendName = hasMet2(state, otherId) ? nameOf(otherId) : "Their friend";
    scene.outcome = {
      headline: choice === "welcome" ? `${friendName} joins the party.` : `${friendName} had to go.`,
    };
  } else if (kind === "their-crush" && otherId) {
    if (choice !== "leave") {
      let pair =
        npcPairBetween(state, bond.characterId, otherId) ??
        (introduceNpcPair(state, bond.characterId, otherId, {
          place: state.at,
        }),
        npcPairBetween(state, bond.characterId, otherId));
      if (pair) {
        pair.romance = Math.min(100, (pair.romance ?? 0) + (outcome.romance ?? 0));
      }
      state.week?.items?.push({
        kind: "flirt",
        a: bond.characterId,
        b: otherId,
        place: state.at,
        at: state.minutes,
      });
    }
    for (let [watcherId, seenId] of [
      [bond.characterId, otherId],
      [otherId, bond.characterId],
    ]) {
      if (isPartner(state, watcherId)) {
        learnYou(state, watcherId, seenId, {
          how: "seen",
          place: state.at,
        });
      }
    }
    scene.outcome = {
      headline:
        choice === "leave" ? "You left them to it." : `${nameOf(bond.characterId)} and ${nameOf(otherId)} hit it off.`,
    };
  } else if (kind === "their-fight") {
    if (choice === "side" && otherId && party?.guests[otherId]) {
      party.guests[otherId].mood += outcome.other ?? 0;
    }
    scene.outcome = {
      headline:
        choice === "calm"
          ? "You calmed things down."
          : choice === "side"
            ? `You took ${nameOf(bond.characterId)}'s side.`
            : "You stayed out of it.",
    };
  } else if (kind === "drunk") {
    if (choice === "care") {
      applyBondAction(
        bond,
        {
          action: "care",
          friendship: outcome.friendship ?? 0,
        },
        {
          at: state.minutes,
          note: "Looked after them at a party",
        },
      );
    }
    scene.outcome = {
      headline: choice === "care" ? `You looked after ${nameOf(bond.characterId)}.` : "You let it be.",
    };
  } else if (kind === "toast") {
    if (party?.guests[bond.characterId]) {
      party.guests[bond.characterId].mood += outcome.host ?? 0;
    }
    if (outcome.friendship) {
      adjustBondAxis(bond, "friendship", outcome.friendship, {
        at: state.minutes,
      });
    }
    scene.outcome = {
      headline: choice === "words" ? "You said a few words." : "You raised your glass.",
    };
  }
  bond.asks = null;
  return events;
}
function tickPartyNeighbour(state) {
  let party = state.party,
    residenceKind = state.residence?.place ?? "apartments";
  if (party.neighbour === undefined && isLateNightHour(state.minutes, NEIGHBOUR_COMPLAINT_HOUR)) {
    party.neighbour =
      seededRandom(state.seed, party.id, "neighbour") < (NEIGHBOUR_COMPLAINT_CHANCE[residenceKind] ?? 0)
        ? {
            at: state.minutes,
            answer: null,
          }
        : null;
    return party.neighbour
      ? {
          id: "party-neighbour",
          text: "A neighbour is at your door about the noise.",
        }
      : null;
  }
  let neighbour = party.neighbour;
  if (
    neighbour &&
    !neighbour.fined &&
    neighbour.answer !== "down" &&
    state.minutes >= (neighbour.answeredAt ?? neighbour.at) + PARTY_MOVE
  ) {
    let fine = fineForPartyNoise(state);
    return {
      id: "party-fine",
      text: `${noiseComplainerName(state)} fined you $${fine.amount} for the noise. It's in BILLS.`,
    };
  }
  return null;
}
function fineForPartyNoise(state) {
  let residenceKind = state.residence?.place ?? "apartments";
  state.party.neighbour.fined = true;
  let bill = addBill(state.wallet, {
    kind: "fine",
    amount: NEIGHBOUR_NOISE_FINE[residenceKind] ?? 150,
    label: "Noise complaint",
    at: state.minutes,
  });
  Object.assign(bill, {
    name: noiseComplainerName(state),
    dueWords: "When you can",
  });
  return bill;
}
var noiseComplainerName = (state) =>
  ({
    tower: "Skyline Tower",
    apartments: "The building",
  })[state.residence?.place ?? "apartments"] ?? "The neighbours' association";
function answerNeighbourComplaint(state, answer) {
  let neighbour = state.party?.neighbour;
  return !neighbour || neighbour.answer
    ? {
        ok: false,
        reason: "Nobody is complaining.",
      }
    : ((neighbour.answer = answer === "keep" ? "keep" : "down"),
      (neighbour.answeredAt = state.minutes),
      neighbour.answer === "down" &&
        (state.party.meter = clampPartyMeter(state.party.meter - NEIGHBOUR_TURN_DOWN_METER)),
      {
        ok: true,
      });
}
function clearPartyAsks(state, party, { except: opts = null } = {}) {
  for (let guestId of Object.keys(party.guests)) {
    if (guestId === opts) {
      continue;
    }
    let bond = bondOf(state, guestId);
    if (bond?.asks && isPartyAskMilestone(bond.asks.id)) {
      bond.asks = null;
    }
    if (state.approach?.characterId === guestId) {
      state.approach = null;
    }
  }
}
var PARTY_CANCEL_PENALTY = {
  friendship: -1,
};
function cancelOwnParty(state) {
  let party = partyAhead(state);
  if (!party) {
    return {
      ok: false,
      reason: "There is no party to cancel.",
    };
  }
  callOffParty(state, party);
  for (let guestId of party.guests) {
    let bond = bondOf(state, guestId);
    if (bond) {
      adjustBondAxis(bond, "friendship", PARTY_CANCEL_PENALTY.friendship, {
        at: state.minutes,
      });
    }
  }
  logNote(state, "Cancelled your party", "social");
  return {
    ok: true,
    said: "You called your party off and let everyone know.",
  };
}
var SLEEPOVER_MAX_HOURS = 12;
function sleepoverMorningEvent(state, { woke: opts = false } = {}) {
  let sleepover = state.sleepover;
  if (sleepover && state.minutes - sleepover.from > SLEEPOVER_MAX_HOURS * 60) {
    state.sleepover = null;
    return null;
  }
  if (!sleepover || state.at !== "home" || state.visit) {
    return null;
  }
  let clock = clockFromMinutes(state.minutes);
  if (!opts && !(clock.hour >= 8 && state.minutes - sleepover.from >= 240)) {
    return null;
  }
  state.sleepover = null;
  let guestIds = sleepover.ids.filter((id) => characterOf(state, id));
  if (!guestIds.length) {
    return null;
  }
  for (let id of guestIds) {
    let bond = bondOf(state, id);
    if (bond) {
      adjustBondAxis(bond, "friendship", 1, {
        at: state.minutes,
      });
    }
  }
  let names = guestIds.map((id) => nameFor(state, characterOf(state, id)));
  if (!state.moment || state.moment.at < state.minutes - 30) {
    state.moment = {
      kind: "sleepover",
      characterId: guestIds[0],
      with: names.slice(1),
      at: state.minutes,
    };
  }
  return {
    id: "sleepover-morning",
    characterId: guestIds[0],
    names: names,
    from: state.minutes,
    line: state.moment?.kind === "sleepover",
    text: "",
  };
}
function partyGuestsHere(state) {
  let party = state.party;
  return party ? (isAtActiveParty(state) ? partyGuestsInRoom(party, party.room) : []) : [];
}
function partyGuestMoodWords(state, guestId) {
  let mood = state.party?.guests[guestId]?.mood ?? 0;
  return mood >= 5 ? "having a great time" : mood >= 2 ? "having fun" : mood >= 0 ? "doing fine" : "bored";
}
var partyGuestUntil = (state, guestId) =>
  state.party?.guests[guestId] && !state.party.guests[guestId].gone ? state.party.until : null;
function partyScheduleSpans(state) {
  let party = state.party,
    spans = {};
  if (state.sleepover) {
    for (let id of state.sleepover.ids) {
      spans[id] = [
        {
          from: state.sleepover.from,
          to: state.sleepover.from + SLEEPOVER_MAX_HOURS * 60,
          place: "home",
          host: "you",
          doing: "asleep at the player's place after the party",
        },
      ];
    }
  }
  if (!party) {
    return spans;
  }
  let guestIds = [
      ...Object.entries(party.guests)
        .filter(([, guest]) => !guest.gone)
        .map(([id]) => id),
      ...(party.door ?? []),
      ...(party.queue ?? []).flatMap((group) => group.ids),
    ],
    doing =
      party.host === "you"
        ? "at the player's party"
        : party.home
          ? `at ${characterOf(state, party.host)?.name ?? "someone"}'s party, at the player's home`
          : `at ${nameFor(state, characterOf(state, party.host))}'s party`;
  for (let id of guestIds) {
    spans[id] = [
      {
        from: party.since,
        to: party.until,
        place: "home",
        host: party.home ? "you" : party.host,
        doing: doing,
      },
    ];
  }
  return spans;
}
function partyWhereaboutsWords(state, characterId) {
  let party = state.party;
  if (!party?.guests[characterId]) {
    return "";
  }
  let roomNames = partyGuestsInRoom(party, party.room)
      .filter((id) => id !== characterId)
      .map((id) => characterOf(state, id)?.name)
      .filter(Boolean),
    partyWord = party.birthday ? "birthday party" : "party",
    hostName = characterOf(state, party.host)?.name ?? "someone";
  return `they are ${party.host === "you" ? `at the player's ${partyWord} at the player's home` : party.home ? (party.host === characterId ? `at their own ${partyWord}, at the home they share with the player` : `at ${hostName}'s ${partyWord}, at the home ${hostName} shares with the player`) : party.host === characterId ? `at their own ${partyWord}, at their home, and the player is a guest` : `at ${hostName}'s ${partyWord} at their home, where the player is a guest too`}, in the ${PARTY_ROOMS[party.room].name.toLowerCase()}${roomNames.length ? `, with ${roomNames.join(", ")} around` : ""}`;
}
function partyGuestsInScene(state) {
  let scene = state.scene,
    moment = state.party?.hold ? state.party.moment : null,
    momentCast = moment ? [...(moment.cast ?? []), ...(moment.with ? [moment.with] : []), ...(moment.pair ?? [])] : [];
  return [...(scene && (!scene.done || scene.kind === "moment") ? eventCast(scene) : []), ...momentCast];
}
function partyGuestsAround(state, scene = state.scene) {
  let party = state.party;
  if (!party || !isAtActiveParty(state)) {
    return [];
  }
  let sceneCast = scene && !scene.done ? eventCast(scene) : [];
  return partyGuestsInRoom(party, party.room).filter((id) => !sceneCast.includes(id));
}
var PARTY_ROOM_AMBIENCE = {
  living: "music playing, people dancing",
  kitchen: "people around the food and drinks",
  garden: "out in the garden, the music softer",
  pool: "by the pool, people in the water",
  bar: "at the bar, drinks being poured",
  console: "a game on the screen, people cheering",
};
function partySceneLine(state, scene = state.scene) {
  let party = state.party;
  if (!party || !scene || !isAtActiveParty(state)) {
    return "";
  }
  let aroundNames = partyGuestsAround(state, scene)
      .map((id) => characterOf(state, id)?.name)
      .filter(Boolean),
    hostName = party.host === "you" ? null : (characterOf(state, party.host)?.name ?? "someone"),
    partyWord = party.birthday ? "birthday party" : "party",
    whereText =
      party.host === "you"
        ? `the player's ${partyWord}, at the player's home`
        : party.home
          ? scene.characterId === party.host
            ? `their own ${partyWord}, at the home they share with the player`
            : `${hostName}'s ${partyWord}, at the home ${hostName} shares with the player`
          : scene.characterId === party.host
            ? `their own ${partyWord}, at their home; the player is a guest`
            : `${hostName}'s ${partyWord}, at ${hostName}'s home; the player is a guest`;
  if (PARTY_DOOR_MILESTONES.includes(scene.milestone)) {
    return `${whereText}; at the front door, the music and the others behind them.`;
  }
  let othersText = aroundNames.length
    ? `${aroundNames.slice(0, 8).join(", ")}${aroundNames.length > 8 ? ` and ${aroundNames.length - 8} more` : ""} around, not in this talk`
    : "nobody else in the room right now";
  return `${whereText}; in the ${PARTY_ROOMS[party.room]?.name.toLowerCase() ?? "living room"}, ${PARTY_ROOM_AMBIENCE[party.room] ?? "music playing"}; ${othersText}.`;
}
var dismissPartyOver = (state) => (
  (state.partyOver = null),
  {
    ok: true,
  }
);

export {
  ALL_PARTY_ACT_KEYS,
  NEIGHBOUR_COMPLAINT_CHANCE,
  NEIGHBOUR_COMPLAINT_HOUR,
  NEIGHBOUR_NOISE_FINE,
  NEIGHBOUR_TURN_DOWN_METER,
  PARTY_CANCEL_PENALTY,
  PARTY_DOOR_MILESTONES,
  PARTY_DRUNK_MIN_MOOD,
  PARTY_EVENTS_MAX,
  PARTY_EVENT_CHANCE,
  PARTY_EVENT_OUTCOMES,
  PARTY_GOODBYE_WAIT_MINUTES,
  PARTY_GUESTS_BY_RESIDENCE,
  PARTY_GUEST_ROOM_ACTS,
  PARTY_LATE_NOTICED_MINUTES,
  PARTY_PRESENTS_ACT,
  PARTY_ROOMS_BY_RESIDENCE,
  PARTY_SING_ACT,
  PARTY_TOAST_ACT,
  PARTY_WAIT_MAX_MINUTES,
  THEIR_HOME_PARTY_SLEPT_PENALTY,
  THEIR_PARTY_AFTER_GAINS,
  THEIR_PARTY_EVENT_MILESTONES,
  THEIR_PARTY_EVERY_DAYS,
  THEIR_PARTY_INVITE_CHANCE,
  THEIR_PARTY_LATE_MINUTES,
  THEIR_PARTY_MIN_OPENNESS,
  THEIR_PARTY_MISSED_PENALTY,
  THEIR_PARTY_START_HOUR,
  answerNeighbourComplaint,
  answerPartyDoorQuietly,
  answerTheirPartyInvite,
  bringPartyGuestOver,
  buildPartyMomentScene,
  buildPartyView,
  cancelOwnParty,
  describeTheirPartyPlan,
  dismissPartyOver,
  doPartyAct,
  duePartyEndEvents,
  endOwnParty,
  homePartyBlocksReason,
  introducePartyGuests,
  isAtActiveParty,
  isPartyAskMilestone,
  isPartyGuestActive,
  joinTheirParty,
  keepPartyMemories,
  leaveTheirPartyIfAny,
  letPartyGuestsIn,
  moveToPartyRoom,
  ownPartyBlocksReason,
  partyActsWithGuest,
  partyGuestMoodWords,
  partyGuestUntil,
  partyGuestsAround,
  partyGuestsHere,
  partyGuestsInScene,
  partyMomentTitle,
  partySceneLine,
  partyScheduleSpans,
  partyStripItems,
  partyWhereaboutsWords,
  planTheirParty,
  rollOwnPartyEvent,
  rollTheirPartyEvent,
  rollTheirPartyInvite,
  sayGoodbyeFirstReason,
  settleFirstPartyGuestScene,
  settlePartyDoorScene,
  settlePartyEventAsk,
  sleepoverMorningEvent,
  theirHomePartiesPending,
  tickParties,
  waitForNextPartyGuest,
  waitForTheirParty,
};
