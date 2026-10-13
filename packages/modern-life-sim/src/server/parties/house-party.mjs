// House parties: constants, rooms, food, planning, guest answers and arrivals
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { bondSummary, bondTier, isActiveRival } from "../relationships/bonds.mjs";
import { formatBirthday } from "../relationships/birthdays.mjs";
import { FRIDGE_SPOIL_SLOWDOWN } from "../items/catalog.mjs";
import { DISH_FRESH_DAYS } from "../items/cooking.mjs";
import { isPileSpoiled } from "../inventory/piles-and-cooking.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { HOME_KINDS } from "../home/home-kinds.mjs";
import { earnMoney, spendMoney } from "../money/wallet.mjs";
import { busyWhy, partyBusy, yourBusy } from "../plans/plans.mjs";
import { birthdayPartyDays, birthdayPartyWhy, yourBirthdayYear } from "../relationships/birthday-events.mjs";
import { buildPartyView, isPartyGuestActive, theirHomePartiesPending } from "./party.mjs";
import { hasOwnHome } from "../home/residence.mjs";
import { homeHasFurniture, richLookOf } from "../home/furniture-and-wardrobe.mjs";
import { isPartner } from "../romance/jealousy.mjs";
import {
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  logNote,
  nameFor,
  sceneBusyReason,
  sharesYourDoor,
  traitsOf,
} from "../game.mjs";

var PARTY_DAY_MINUTES = 1440;
var PARTY_MINUTES = 180;
var PARTY_MOVE = 30;
var PARTY_FROM_TIER = 1;
var PARTY_AHEAD_DAYS = 7;
var PARTY_HOURS = [12, 23];
var PARTY_LATEST = 30;
var PARTY_SOFA = 0.3;
var PARTY_UP_LATE = 120;
var PARTY_UP_MOOD = 5;
var PARTY_EVERY_DAYS = 7;
var PARTY_EARLY = 30;
var PARTY_LATE = 60;
var PARTY_YES = [0, 0.55, 0.7, 0.85, 0.92];
var PARTY_YES_PARTNER = 0.95;
var PARTY_START = {
  meter: 30,
  room: 4,
  hill: 5,
  mood: 1,
};
var PARTY_DECAY = {
  meter: 4,
  mood: 1,
};
var PARTY_LEAVE_MOOD = -3;
var PARTY_GREAT = 70;
var PARTY_GOOD = 40;
var PARTY_AFTER = [
  {
    from: 5,
    friendship: 3,
  },
  {
    from: 2,
    friendship: 2,
  },
  {
    from: 0,
    friendship: 1,
  },
  {
    from: -1 / 0,
    friendship: -1,
  },
];
var PARTY_FOOD = {
  snacks: {
    name: "Snacks from the supermarket",
    perGuest: 8,
    quality: 1,
  },
  catering: {
    name: "Catering",
    perGuest: 25,
    quality: 3,
  },
  cooked: {
    name: "I'll cook",
    perGuest: 0,
  },
  none: {
    name: "No food",
    perGuest: 0,
    quality: 0,
  },
};
var DISH_QUALITY_SCORE = {
  burnt: 0,
  fine: 2,
  great: 3,
};
var PARTY_ROOMS = {
  living: {
    name: "Living room",
    icon: "\u{1F6CB}\uFE0F",
    act: {
      key: "music",
      name: "Put some music on",
      minutes: 15,
      meter: 8,
      mood: 2,
      all: 1,
      words: "put some music on and dance to it",
      with: {
        action: "novelty",
        amount: 2,
      },
    },
  },
  kitchen: {
    name: "Kitchen",
    icon: "\u{1F373}",
    act: {
      key: "serve",
      name: "Serve the food",
      minutes: 15,
      once: true,
      food: true,
      everyone: true,
      words: "bring out the food the player is serving, and everyone digs in",
    },
  },
  garden: {
    name: "Garden",
    icon: "\u{1F333}",
    needs: "garden",
    act: {
      key: "lights",
      name: "Light up the garden",
      minutes: 10,
      meter: 5,
      mood: 2,
      words: "light up the garden and sit out under the lights",
      with: {
        action: "deep",
        amount: 2,
      },
    },
  },
  pool: {
    name: "Pool",
    icon: "\u{1F3CA}",
    needs: "pool",
    act: {
      key: "swim",
      name: "Jump in the pool",
      minutes: 30,
      meter: 12,
      mood: 3,
      words: "jump in the pool",
      with: {
        action: "time",
        amount: 2,
      },
    },
  },
  bar: {
    name: "Bar",
    icon: "\u{1F378}",
    needs: "bar",
    act: {
      key: "drinks",
      name: "Mix some drinks",
      minutes: 15,
      meter: 8,
      mood: 2,
      words: "mix some drinks at the bar and have one together",
      with: {
        action: "time",
        amount: 2,
      },
    },
  },
  console: {
    name: "Console",
    icon: "\u{1F3AE}",
    needs: "console",
    act: {
      key: "game",
      name: "Start a game",
      minutes: 30,
      meter: 7,
      mood: 3,
      words: "play a game on the console",
      with: {
        action: "challenge",
        amount: 2,
      },
    },
  },
};
var PARTY_EAT = {
  key: "eat",
  name: "Grab something to eat",
  minutes: 15,
  meter: 1,
  eat: 35,
  words: "grab something to eat from what is on the table",
  with: {
    action: "time",
    amount: 1,
  },
};
var PARTY_LOG_MAX = 24;
var PARTY_MINGLE = {
  minutes: 5,
  mood: 1,
};
var partyById = (state, partyId) => (state.parties ?? []).find((party) => party.id === partyId) ?? null;
var partyAhead = (state) =>
  (state.parties ?? []).find((party) => party.host === "you" && party.status === "set") ?? null;
var yourPartyOn = (state, dayIndex) =>
  (state.parties ?? []).find(
    (party) =>
      party.host === "you" &&
      ["set", "on"].includes(party.status) &&
      Math.floor(party.at / PARTY_DAY_MINUTES) === dayIndex,
  ) ?? null;
function callOffParty(state, party) {
  party.status = "off";
  if (state.bdayParty?.partyId === party.id) {
    state.bdayParty = null;
  }
}
var partyRooms = (state) =>
  Object.keys(PARTY_ROOMS).filter(
    (roomId) => !PARTY_ROOMS[roomId].needs || homeHasFurniture(state, PARTY_ROOMS[roomId].needs),
  );
var partyMax = (state) => HOME_KINDS[state.wallet?.home]?.guests ?? HOME_KINDS.apartment.guests;
function cookedDishesForParty(state, { by = null } = {}) {
  let keeps = (pile) =>
      !isPileSpoiled(pile) &&
      (by === null || pile.left === null || pile.left > (by - state.minutes) / FRIDGE_SPOIL_SLOWDOWN),
    dishes = (state.things?.fridge ?? []).filter((pile) => String(pile.item).startsWith("dish-") && keeps(pile)),
    count = dishes.reduce((sum, pile) => sum + pile.n, 0),
    quality = count
      ? dishes.reduce(
          (sum, pile) => sum + pile.n * (DISH_QUALITY_SCORE[state.things.known?.[pile.item]?.homemade?.quality] ?? 2),
          0,
        ) / count
      : 0;
  return {
    n: count,
    quality: Math.round(quality * 10) / 10,
  };
}
function cookedForParty(state) {
  let party =
    state.party?.host === "you" && state.party.food === "cooked" && !state.party.done?.serve ? state.party : null;
  if (party) {
    return Object.values(party.guests).filter(isPartyGuestActive).length + 1;
  }
  let ahead = partyAhead(state);
  return ahead?.food === "cooked" ? ahead.guests.length + 1 : 0;
}
function housePartyWhy(state) {
  if (!state.residence || state.lodging) {
    return "You need a home of your own";
  }
  if (partyAhead(state) || state.party?.host === "you") {
    return "Your party is planned";
  }
  let last = (state.parties ?? [])
    .filter((party) => party.host === "you" && !party.birthday && party.status !== "off")
    .at(-1);
  return last && last.at > state.minutes - PARTY_EVERY_DAYS * PARTY_DAY_MINUTES
    ? `Your next one, from ${clockFromMinutes(last.at + PARTY_EVERY_DAYS * PARTY_DAY_MINUTES).weekday} ${clockFromMinutes(last.at + PARTY_EVERY_DAYS * PARTY_DAY_MINUTES).day}`
    : "";
}
function partyInfo(state, { birthday = null } = {}) {
  let usualWhy = housePartyWhy(state),
    birthdayWhy = birthdayPartyWhy(state),
    offer = {
      usual: usualWhy,
      birthday: birthdayWhy
        ? null
        : {
            label: formatBirthday(state.birthday),
          },
    },
    isBirthday = birthday === null ? !birthdayWhy : birthday === true,
    why = isBirthday ? birthdayWhy : usualWhy;
  if (why) {
    return {
      ok: false,
      why: why,
      birthday: isBirthday,
      offer: offer,
    };
  }
  let today = clockFromMinutes(state.minutes).dayIndex,
    earliestHour = Math.floor((state.minutes - today * PARTY_DAY_MINUTES) / 60) + 1,
    days = (
      isBirthday
        ? birthdayPartyDays(state)
        : Array.from(
            {
              length: PARTY_AHEAD_DAYS,
            },
            (unused, offset) => today + 1 + offset,
          ).map((day) => ({
            d: day,
            label: clockFromMinutes(day * PARTY_DAY_MINUTES)
              .weekday.slice(0, 3)
              .toUpperCase(),
            n: clockFromMinutes(day * PARTY_DAY_MINUTES).day,
          }))
    )
      .map((day) => ({
        ...day,
        from: day.d === today ? Math.max(PARTY_HOURS[0], earliestHour) : PARTY_HOURS[0],
      }))
      .filter((day) => day.from <= PARTY_HOURS[1]);
  if (!days.length) {
    return {
      ok: false,
      why: "Too late for today",
      birthday: isBirthday,
      offer: offer,
    };
  }
  let hours = Array.from(
      {
        length: PARTY_HOURS[1] - PARTY_HOURS[0] + 1,
      },
      (unused, offset) => PARTY_HOURS[0] + offset,
    ),
    until = Array.from(
      {
        length: PARTY_LATEST - PARTY_HOURS[0],
      },
      (unused, offset) => PARTY_HOURS[0] + 1 + offset,
    ),
    people = castInTown(state)
      .filter(
        (character) =>
          hasMet2(state, character.id) &&
          !sharesYourDoor(state, character) &&
          bondTier(bondOf(state, character.id), "friendship") >= PARTY_FROM_TIER,
      )
      .map((character) => ({
        id: character.id,
        name: nameFor(state, character),
        ...characterPortrait(character, state),
        tier: bondSummary(bondOf(state, character.id)).friendship.name,
      })),
    food = Object.entries(PARTY_FOOD).map(([id, def]) => ({
      id: id,
      name: def.name,
      perGuest: def.perGuest,
      ok: true,
      ...(id === "cooked"
        ? {
            keepsDays: DISH_FRESH_DAYS * FRIDGE_SPOIL_SLOWDOWN,
          }
        : {}),
    }));
  return {
    ok: true,
    birthday: isBirthday,
    offer: offer,
    days: days,
    hours: hours,
    until: until,
    people: people,
    max: partyMax(state),
    food: food,
    rooms: partyRooms(state).map((roomId) => PARTY_ROOMS[roomId].name),
    cash: state.wallet.cash,
  };
}
function partyGuestAnswer(state, characterId, at) {
  let character = characterOf(state, characterId),
    busy = busyWhy(state, character, at);
  if (busy) {
    return {
      yes: false,
      why: busy === "Works" ? "Works then" : busy === "Asleep" ? "Asleep by then" : "Away",
    };
  }
  let partyClash = partyBusy(state, characterId, at);
  if (partyClash && partyClash !== "Your party") {
    return {
      yes: false,
      why: partyClash === "Their party" ? "Their own party then" : `At ${partyClash}`,
    };
  }
  let traits = traitsOf(state, characterId),
    chance =
      (isPartner(state, characterId)
        ? PARTY_YES_PARTNER
        : (PARTY_YES[bondTier(bondOf(state, characterId), "friendship")] ?? 0.5)) +
      ((traits.dials.open ?? 5) - 5) * 0.03 -
      (traits.flags.includes("shy") ? 0.15 : 0),
    yes = seededRandom(state.seed, characterId, String(at), "party") < chance;
  return {
    yes: yes,
    why: yes ? "" : traits.flags.includes("shy") ? "Not one for parties" : "Can't make it",
  };
}
function planParty(
  state,
  { day: day, hour: hour, until = null, with: withIds = [], food = "snacks", birthday = false } = {},
) {
  let info = partyInfo(state, {
    birthday: birthday === true,
  });
  if (!info.ok) {
    return {
      ok: false,
      reason: `${info.why}.`,
    };
  }
  let dayOption = info.days.find((option) => option.d === Number(day));
  if (!dayOption || !info.hours.includes(Number(hour)) || Number(hour) < dayOption.from) {
    return {
      ok: false,
      reason: "Pick a day and an hour.",
    };
  }
  let endHour = until === null ? Number(hour) + PARTY_MINUTES / 60 : Number(until);
  if (!Number.isInteger(endHour) || endHour <= Number(hour) || endHour > PARTY_LATEST) {
    return {
      ok: false,
      reason: "Pick when it ends: an hour after it starts at least, up to 06:00.",
    };
  }
  let foodOption = info.food.find((option) => option.id === food);
  if (!foodOption?.ok) {
    return {
      ok: false,
      reason: foodOption ? `${foodOption.why}.` : "Pick the food.",
    };
  }
  let asked = [...new Set((Array.isArray(withIds) ? withIds : []).map(String))]
    .filter((id) => info.people.some((person) => person.id === id))
    .slice(0, info.max);
  if (!asked.length) {
    return {
      ok: false,
      reason: "Invite someone.",
    };
  }
  let at = Number(day) * PARTY_DAY_MINUTES + Number(hour) * 60,
    busy = "";
  for (let slot = Number(hour); slot < endHour && !busy; slot++) {
    busy = yourBusy(state, Number(day) * PARTY_DAY_MINUTES + slot * 60);
  }
  if (busy) {
    return {
      ok: false,
      reason: `You are busy then: ${/^Your /.test(busy) ? busy.toLowerCase() : busy}.`,
    };
  }
  let clash = theirHomePartiesPending(state).find(
    (other) => other.at < Number(day) * PARTY_DAY_MINUTES + endHour * 60 && other.at + PARTY_MINUTES > at,
  );
  if (clash) {
    return {
      ok: false,
      reason: `${nameFor(state, characterOf(state, clash.host))}'s party is at home then.`,
    };
  }
  let answers = asked.map((id) => ({
      id: id,
      name: nameFor(state, characterOf(state, id)),
      ...partyGuestAnswer(state, id, at),
    })),
    guests = answers.filter((answer) => answer.yes).map((answer) => answer.id);
  if (!guests.length) {
    return {
      ok: true,
      party: null,
      answers: answers,
    };
  }
  let foodCost = PARTY_FOOD[food].perGuest * guests.length;
  if (foodCost) {
    let paid = spendMoney(
      state.wallet,
      foodCost,
      `Party food \xB7 ${PARTY_FOOD[food].name.toLowerCase()}`,
      state.minutes,
    );
    if (!paid.ok) {
      return {
        ok: false,
        reason: paid.reason,
      };
    }
  }
  state.parties ??= [];
  let party = {
    id: `party${state.minutes.toString(36)}${state.parties.length}`,
    host: "you",
    at: at,
    ends: Number(day) * PARTY_DAY_MINUTES + endHour * 60,
    guests: guests,
    asked: asked,
    food: food,
    status: "set",
    made: state.minutes,
    ...(info.birthday
      ? {
          birthday: {
            of: "you",
          },
        }
      : {}),
  };
  state.parties.push(party);
  if (state.parties.length > 20) {
    state.parties.splice(0, state.parties.length - 20);
  }
  if (info.birthday) {
    state.bdayParty = {
      year: yourBirthdayYear(state),
      partyId: party.id,
    };
  }
  for (let [characterId, bond] of Object.entries(state.bonds ?? {})) {
    if (!(
      bond?.asks?.id !== "birthday-surprise" ||
      Math.floor((bond.asks.plan?.at ?? -1) / PARTY_DAY_MINUTES) !== Number(day)
    )) {
      bond.asks = null;
      if (state.approach?.characterId === characterId && state.approach.milestone === "birthday-surprise") {
        state.approach = null;
      }
    }
  }
  logNote(
    state,
    `Planned ${info.birthday ? "your birthday party" : "a party"} \xB7 ${clockFromMinutes(at).weekday} ${formatClockTime(at)} \xB7 ${guests.length} coming`,
    "social",
  );
  return {
    ok: true,
    party: partyPlanView(state, party),
    answers: answers,
    paid: foodCost,
  };
}
function partyPlanView(state, party = partyAhead(state)) {
  if (!party) {
    return null;
  }
  let clock = clockFromMinutes(party.at),
    now = state.minutes;
  return {
    id: party.id,
    when: `${clock.weekday} ${clock.day} \xB7 ${formatClockTime(party.at)}${party.ends ? `\u2013${formatClockTime(party.ends)}` : ""}`,
    at: party.at,
    coming: party.guests.map((id) =>
      nameFor(
        state,
        characterOf(state, id) ?? {
          id: id,
          name: "?",
        },
      ),
    ),
    food: PARTY_FOOD[party.food]?.name ?? "",
    startable: now >= party.at - PARTY_EARLY && now <= party.at + PARTY_LATE,
    birthday: !!party.birthday,
    ...(party.food === "cooked"
      ? {
          cooking: {
            need: party.guests.length + 1,
            ready: cookedDishesForParty(state, {
              by: party.at,
            }).n,
          },
        }
      : {}),
    cancel: party.guests.length,
  };
}
function startParty(state) {
  let party = partyAhead(state);
  if (!party) {
    return {
      ok: false,
      reason: "There is no party to start.",
    };
  }
  if (!hasOwnHome(state)) {
    return {
      ok: false,
      reason: "You need a home of your own.",
    };
  }
  if (state.at !== "home" || state.visit) {
    return {
      ok: false,
      reason: "Your party is at home.",
    };
  }
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (state.party) {
    return {
      ok: false,
      reason: "There's already a party going on at home.",
    };
  }
  if (state.minutes < party.at - PARTY_EARLY) {
    return {
      ok: false,
      reason: `It starts at ${formatClockTime(party.at)}.`,
    };
  }
  let coming = party.guests
    .filter((id) => {
      let character = characterOf(state, id);
      return character && !character.away && stillOnPartyTerms(state, id, party.made);
    })
    .slice(0, partyMax(state));
  if (!coming.length) {
    callOffParty(state, party);
    let refund = (PARTY_FOOD[party.food]?.perGuest ?? 0) * party.guests.length;
    if (refund) {
      earnMoney(state.wallet, refund, "Party food, cancelled", state.minutes);
    }
    return {
      ok: false,
      reason: `Nobody could come in the end.${refund ? ` The food was refunded ($${refund}).` : ""}`,
    };
  }
  let rooms = partyRooms(state),
    rich = !!richLookOf(state)?.home,
    startAt = Math.max(state.minutes, party.at),
    housemates = coming.filter((id) => sharesYourDoor(state, characterOf(state, id)));
  party.status = "on";
  state.party = {
    id: party.id,
    host: "you",
    since: state.minutes,
    until: party.ends ?? startAt + PARTY_MINUTES,
    room: "living",
    rooms: rooms,
    meter: PARTY_START.meter + PARTY_START.room * Math.max(0, rooms.length - 2) + (rich ? PARTY_START.hill : 0),
    guests: {},
    queue: scheduleGuestArrivals(
      state,
      coming.filter((id) => id !== state.guest?.characterId && !housemates.includes(id)),
      startAt,
    ),
    door: [],
    left: [],
    done: {},
    lastMove: startAt,
    lively: {
      living: startAt,
    },
    food: party.food,
    ...(party.birthday
      ? {
          birthday: party.birthday,
        }
      : {}),
  };
  if (state.guest) {
    state.party.guests[state.guest.characterId] = {
      room: "living",
      mood: PARTY_START.mood + 1,
      since: state.minutes,
    };
    state.party.firstIn = true;
    state.guest = null;
  }
  for (let id of housemates) {
    state.party.guests[id] = {
      room: "living",
      mood: PARTY_START.mood + 1,
      since: state.minutes,
    };
  }
  addHousematesToParty(state);
  logNote(state, `Your party \xB7 ${coming.length} coming`, "social");
  return {
    ok: true,
    party: buildPartyView(state),
  };
}
function addHousematesToParty(state) {
  let party = state.party;
  if (party?.host === "you") {
    for (let character of castInTown(state)) {
      if (!(
        party.guests[character.id] ||
        !hasMet2(state, character.id) ||
        !sharesYourDoor(state, character) ||
        busyWhy(state, character, state.minutes)
      )) {
        party.guests[character.id] = {
          room: "living",
          mood: PARTY_START.mood + 1,
          since: state.minutes,
          mate: true,
        };
      }
    }
  }
}
function stillOnPartyTerms(state, characterId, since = -1 / 0) {
  let bond = bondOf(state, characterId);
  return bond
    ? isPartner(state, characterId) ||
        (bondTier(bond, "friendship") >= PARTY_FROM_TIER &&
          !isActiveRival(bond) &&
          !((bond.brokeUp?.at ?? -1 / 0) > since))
    : false;
}
var PARTY_ARRIVE = 60;
function scheduleGuestArrivals(state, ids, startAt) {
  if (!ids.length) {
    return [];
  }
  let shuffled = [...ids].sort(
      (idA, idB) =>
        seededRandom(state.seed, idA, String(startAt), "arrive") -
        seededRandom(state.seed, idB, String(startAt), "arrive"),
    ),
    groups = [[shuffled[0]]];
  for (let index = 1; index < shuffled.length; index++) {
    let paired =
      index + 1 < shuffled.length && seededRandom(state.seed, shuffled[index], String(startAt), "pair") < 0.4;
    groups.push(paired ? [shuffled[index], shuffled[++index]] : [shuffled[index]]);
  }
  return groups.map((group, index) => ({
    ids: group,
    at:
      startAt +
      5 +
      Math.round((index / Math.max(1, groups.length - 1)) * (PARTY_ARRIVE - 5)) -
      (index ? Math.floor(seededRandom(state.seed, group[0], String(startAt), "late") * 5) : 0),
  }));
}
function ringPartyDoorbell(state) {
  let party = state.party;
  if (!party?.queue?.length) {
    return null;
  }
  let due = party.queue.filter((arrival) => arrival.at <= state.minutes);
  if (!due.length) {
    return null;
  }
  party.queue = party.queue.filter((arrival) => arrival.at > state.minutes);
  let ids = due.flatMap((arrival) => arrival.ids);
  party.door.push(...ids);
  return {
    id: "party-bell",
    text: `The doorbell: ${ids.map((id) => nameFor(state, characterOf(state, id))).join(" and ")}.`,
  };
}

export {
  PARTY_AFTER,
  PARTY_AHEAD_DAYS,
  PARTY_ARRIVE,
  PARTY_DAY_MINUTES,
  PARTY_DECAY,
  PARTY_EARLY,
  PARTY_EAT,
  PARTY_EVERY_DAYS,
  PARTY_FOOD,
  PARTY_FROM_TIER,
  PARTY_GOOD,
  PARTY_GREAT,
  PARTY_HOURS,
  PARTY_LATE,
  PARTY_LATEST,
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
  PARTY_YES,
  PARTY_YES_PARTNER,
  addHousematesToParty,
  callOffParty,
  cookedDishesForParty,
  cookedForParty,
  housePartyWhy,
  partyAhead,
  partyById,
  partyInfo,
  partyMax,
  partyPlanView,
  partyRooms,
  planParty,
  ringPartyDoorbell,
  startParty,
  stillOnPartyTerms,
  yourPartyOn,
};
