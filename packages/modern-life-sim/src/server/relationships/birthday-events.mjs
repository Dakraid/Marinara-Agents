// Birthdays: knowing, greeting, presents, your birthday morning and party window
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { adjustBondAxis, bondTier } from "./bonds.mjs";
import {
  daysUntilBirthday,
  formatBirthday,
  formatDaysUntil,
  isBirthdayOnDay,
  isBirthdayToday,
  knowsBirthdayOf,
  yearIndexAt,
} from "./birthdays.mjs";
import { BAG_SLOTS, BAG_STACK_MAX, ITEM_CATALOG } from "../items/catalog.mjs";
import { addToPiles } from "../items/inventory.mjs";
import { npcPairsOf } from "../network/town-facts.mjs";
import { MAX_PLANS, canInviteToOuting } from "../outings/outing-rules.mjs";
import { dateTastesFor } from "../outings/date-tastes.mjs";
import { OUTING_PLACES, availableOutingPlaces } from "../outings/outing-places.mjs";
import { activePlans, busyWhy, hoursFor, outingAbout, planWith, yourBusy } from "../plans/plans.mjs";
import { partyAhead, yourPartyOn } from "../parties/house-party.mjs";
import { planTheirParty } from "../parties/party.mjs";
import { hasOwnHome } from "../home/residence.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { hurtBond, isPartner } from "../romance/jealousy.mjs";
import { ANNIVERSARY_EFFECTS } from "../romance/wedding-morning.mjs";
import { bondOf, castInTown, characterOf, hasMet2, logNote, nameFor } from "../game.mjs";

var BDAY_KNOWN_FROM = 2;
var BDAY_CARES_FROM = 3;
var BDAY_SLIP = {
  days: 7,
  chance: 0.5,
};
var BDAY_TOLD_DAYS = 7;
var BDAY_GREET = {
  friendship: 1,
};
var BDAY_GIFT_TIMES = 2;
var BDAY_FORGOT = {
  friendship: -3,
  trust: -2,
};
var BDAY_INVITE_DAYS = 3;
var BDAY_INVITE = {
  yes: {
    friendship: 2,
  },
  no: {
    friendship: -1,
  },
};
var BDAY_PARTY_GUESTS = 3;
var PARTY_PLACES = ["bar", "restaurant", "cafe"];
var PARTY_FROM_HOUR = 19;
var YOUR_DAY_KNOWN_FROM = 2;
var YOUR_DAY_GIFT_FROM = 3;
var SURPRISE_FROM_HOUR = 20;
var BDAY_SURPRISE = {
  yes: {
    romance: 3,
  },
  no: {
    romance: -1,
  },
};
var PARTY_PLAN_DAYS = 7;
var PARTY_AROUND = 3;
var BDAY_NETWORK_KINDS = ["friends", "close", "family", "couple"];
var birthdayOf = (state, characterId) => characterOf(state, characterId)?.birthday ?? null;
var knowsBirthday = (state, characterId) => knowsBirthdayOf(state, characterId);
var caresAboutBirthday = (state, characterId) =>
  isPartner(state, characterId) || bondTier(bondOf(state, characterId), "friendship") >= BDAY_CARES_FROM;
var birthdaySaid = (state, characterId, at = state.minutes) =>
  bondOf(state, characterId)?.bday?.said === yearIndexAt(at);
function learnBirthday(state, characterId, how, from = null) {
  let bond = bondOf(state, characterId);
  return !bond || knowsBirthday(state, characterId)
    ? false
    : ((bond.bday = {
        ...(bond.bday ?? {}),
        known: true,
        how: how,
        from: from,
        at: state.minutes,
      }),
      true);
}
function markSaid(state, characterId, how) {
  let bond = bondOf(state, characterId);
  if (bond) {
    bond.bday = {
      ...(bond.bday ?? {}),
      said: yearIndexAt(state.minutes),
      saidHow: how,
    };
  }
}
function birthdayTick(state, events) {
  let today = clockFromMinutes(state.minutes).dayIndex;
  yourBirthdayMorning(state, events);
  let cast = castInTown(state).filter((character) => character.birthday && hasMet2(state, character.id));
  for (let character of cast) {
    let bond = bondOf(state, character.id);
    if (
      (bondTier(bond, "friendship") >= BDAY_KNOWN_FROM && learnBirthday(state, character.id, "friend"),
      !knowsBirthday(state, character.id) && daysUntilBirthday(character.birthday, state.minutes) <= BDAY_TOLD_DAYS)
    ) {
      let teller = npcPairsOf(state, character.id).find(
        (pair) =>
          BDAY_NETWORK_KINDS.includes(pair.kind) &&
          hasMet2(state, pair.other) &&
          !characterOf(state, pair.other)?.away &&
          bondTier(bondOf(state, pair.other), "friendship") >= BDAY_KNOWN_FROM,
      );
      if (teller && learnBirthday(state, character.id, "told", teller.other)) {
        let daysLeft = daysUntilBirthday(character.birthday, state.minutes);
        events.push({
          id: "birthday-heard",
          characterId: character.id,
          from: teller.other,
          text: `${nameFor(state, characterOf(state, teller.other))} mentioned ${character.name}'s birthday: ${formatBirthday(character.birthday)}, ${formatDaysUntil(daysLeft)}.`,
        });
      }
    }
    if (
      isBirthdayOnDay(character.birthday, today - 1) &&
      knowsBirthday(state, character.id) &&
      caresAboutBirthday(state, character.id) &&
      !birthdaySaid(state, character.id, state.minutes - 1440)
    ) {
      let partner = isPartner(state, character.id);
      hurtBond(bond, partner ? ANNIVERSARY_EFFECTS.missed : BDAY_FORGOT);
      events.push({
        id: "birthday-missed",
        characterId: character.id,
        name: nameFor(state, character),
        partner: partner,
        cost: partner ? ANNIVERSARY_EFFECTS.missed : BDAY_FORGOT,
        text: `${character.name}'s birthday went by without a word from you.`,
      });
      logNote(state, `Forgot ${character.name}'s birthday`, "social");
    }
    birthdayInvite(state, character);
    if (isBirthdayToday(character.birthday, state.minutes) && knowsBirthday(state, character.id)) {
      events.push({
        id: "birthday-today",
        characterId: character.id,
        name: nameFor(state, character),
        label: formatBirthday(character.birthday),
        text: `Today is ${character.name}'s birthday: a present counts double.`,
      });
    }
  }
}
var knowsYourBirthday = (state, characterId) =>
  hasMet2(state, characterId) &&
  (isPartner(state, characterId) || bondTier(bondOf(state, characterId), "friendship") >= YOUR_DAY_KNOWN_FROM);
var givesYourBirthdayPresent = (state, characterId) =>
  isPartner(state, characterId) || bondTier(bondOf(state, characterId), "friendship") >= YOUR_DAY_GIFT_FROM;
function receivePresent(state, characterId, salt = "") {
  let giftIds = Object.entries(ITEM_CATALOG)
      .filter(([, entry]) => entry.gift)
      .map(([id]) => id),
    itemId =
      giftIds[
        Math.floor(
          seededRandom(state.seed, characterId, String(yearIndexAt(state.minutes)), "present", salt) * giftIds.length,
        )
      ],
    def = ITEM_CATALOG[itemId],
    freshFor = def.fresh ? def.fresh * 24 * 60 : null,
    overflow = addToPiles(state.things.bag, itemId, 1, freshFor, {
      max: BAG_STACK_MAX,
      slots: BAG_SLOTS,
    });
  if (overflow) {
    addToPiles(state.things.shelf ?? (state.things.shelf = []), itemId, 1, freshFor, {
      max: BAG_STACK_MAX,
    });
  }
  return {
    id: itemId,
    name: def.name,
    icon: def.icon,
    home: !!overflow,
  };
}
function yourBirthdayMorning(state, events) {
  let year = yearIndexAt(state.minutes);
  if (!isBirthdayToday(state.birthday, state.minutes) || state.bdayMorning === year) {
    return;
  }
  state.bdayMorning = year;
  let rows = [];
  for (let character of castInTown(state).filter((person) => knowsYourBirthday(state, person.id))) {
    let present =
      givesYourBirthdayPresent(state, character.id) && !bdayPresentGiven(state, year, character.id)
        ? receivePresent(state, character.id)
        : null;
    if (present) {
      markBdayPresentGiven(state, year, character.id);
    }
    rows.push({
      characterId: character.id,
      name: nameFor(state, character),
      gift: present,
      message: !present,
    });
  }
  let partner = castInTown(state).find(
      (character) =>
        isPartner(state, character.id) && !bondOf(state, character.id).asks && !planWith(state, character.id),
    ),
    plan = partner ? surprisePlan(state, partner) : null;
  if (plan) {
    bondOf(state, partner.id).asks = {
      id: "birthday-surprise",
      at: state.minutes,
      due: state.minutes,
      plan: plan,
    };
  }
  logNote(state, "Your birthday", "social");
  events.push({
    id: "your-birthday",
    label: formatBirthday(state.birthday),
    rows: rows,
    surprise: plan
      ? {
          characterId: partner.id,
          name: nameFor(state, partner),
        }
      : null,
    party: !birthdayPartyWhy(state),
    text: rows.length ? `Happy birthday: ${rows.map((row) => row.name).join(", ")} remembered.` : "It's your birthday.",
  });
}
function surprisePlan(state, partner) {
  let today = clockFromMinutes(state.minutes).dayIndex;
  if (yourPartyOn(state, today)) {
    return null;
  }
  let bond = bondOf(state, partner.id),
    kind = canInviteToOuting(bond, "date").ok ? "date" : "hang",
    tastes = dateTastesFor(partner, bond.archetype),
    places = availableOutingPlaces(state.town, kind).filter((placeId) => !OUTING_PLACES[placeId].home),
    liked = places.filter((placeId) => OUTING_PLACES[placeId]?.outing === tastes.outings.likes);
  for (let placeId of [...liked, ...places.filter((other) => !liked.includes(other))]) {
    let hour = hoursFor(state, placeId, today).find(
      (candidateHour) =>
        candidateHour >= SURPRISE_FROM_HOUR &&
        !busyWhy(state, partner, today * 24 * 60 + candidateHour * 60) &&
        !yourBusy(state, today * 24 * 60 + candidateHour * 60),
    );
    if (hour !== undefined) {
      return {
        kind: kind,
        place: placeId,
        at: today * 24 * 60 + hour * 60,
        birthday: {
          of: "you",
        },
      };
    }
  }
  return null;
}
function yourDayWords(state, characterId) {
  if (!isBirthdayToday(state.birthday, state.minutes) || !knowsYourBirthday(state, characterId)) {
    return "";
  }
  let bond = bondOf(state, characterId);
  return bond.bday?.greetedYou === yearIndexAt(state.minutes)
    ? ""
    : ((bond.bday = {
        ...(bond.bday ?? {}),
        greetedYou: yearIndexAt(state.minutes),
      }),
      `Today is the player's birthday, and ${characterOf(state, characterId)?.name ?? "they"} knows it: somewhere in these first lines they wish the player a happy birthday, true to who they are.`);
}
function yourBirthdayYear(state) {
  let daysLeft = daysUntilBirthday(state.birthday, state.minutes);
  return daysLeft === null ? null : yearIndexAt(state.minutes + daysLeft * 24 * 60);
}
function birthdayPartyWhy(state) {
  let daysLeft = daysUntilBirthday(state.birthday, state.minutes);
  return daysLeft === null || daysLeft > PARTY_PLAN_DAYS
    ? "Your birthday is not close"
    : hasOwnHome(state)
      ? yourBirthdayPartyInWindow(state)
        ? "Your birthday party is planned"
        : partyAhead(state) || state.party?.host === "you"
          ? "Your party is planned"
          : ""
      : "You need a home of your own";
}
function yourBirthdayPartyInWindow(state) {
  let bdayParty = state.bdayParty;
  if (!bdayParty) {
    return false;
  }
  let booked = bdayParty.partyId
    ? (state.parties ?? []).find((party) => party.id === bdayParty.partyId)
    : bdayParty.planId
      ? (state.plans ?? []).find((plan) => plan.id === bdayParty.planId)
      : null;
  if (!Number.isFinite(booked?.at)) {
    return bdayParty.year === yourBirthdayYear(state);
  }
  let birthdayDay = clockFromMinutes(state.minutes).dayIndex + daysUntilBirthday(state.birthday, state.minutes);
  return Math.abs(Math.floor(booked.at / 1440) - birthdayDay) <= PARTY_AROUND;
}
function birthdayPartyDays(state) {
  let today = clockFromMinutes(state.minutes).dayIndex,
    birthdayDay = today + daysUntilBirthday(state.birthday, state.minutes),
    days = [];
  for (let day = Math.max(today, birthdayDay - PARTY_AROUND); day <= birthdayDay + PARTY_AROUND; day++) {
    days.push({
      d: day,
      label: clockFromMinutes(day * 24 * 60)
        .weekday.slice(0, 3)
        .toUpperCase(),
      n: clockFromMinutes(day * 24 * 60).day,
      yours: day === birthdayDay,
    });
  }
  return days;
}
function partyPresents(state, ids) {
  let year = state.bdayParty?.year ?? yourBirthdayYear(state);
  return ids
    .filter((id) => !bdayPresentGiven(state, year, id))
    .map(
      (id) => (
        markBdayPresentGiven(state, year, id),
        {
          characterId: id,
          who: nameFor(state, characterOf(state, id)),
          item: receivePresent(state, id, "party"),
        }
      ),
    );
}
var bdayPresentGiven = (state, year, characterId) =>
  state.bdayGave?.year === year && state.bdayGave.ids.includes(characterId);
function markBdayPresentGiven(state, year, characterId) {
  if (state.bdayGave?.year !== year) {
    state.bdayGave = {
      year: year,
      ids: [],
    };
  }
  if (!state.bdayGave.ids.includes(characterId)) {
    state.bdayGave.ids.push(characterId);
  }
}
function birthdayInvite(state, character) {
  let bond = bondOf(state, character.id),
    daysLeft = daysUntilBirthday(character.birthday, state.minutes),
    year = yearIndexAt(state.minutes + daysLeft * 24 * 60);
  if (
    daysLeft < 1 ||
    daysLeft > BDAY_INVITE_DAYS ||
    bond.asks ||
    bond.bday?.invited === year ||
    !caresAboutBirthday(state, character.id) ||
    planWith(state, character.id) ||
    activePlans(state).length >= MAX_PLANS
  ) {
    return false;
  }
  let plan = partyPlan(state, character, clockFromMinutes(state.minutes).dayIndex + daysLeft);
  return plan
    ? ((bond.bday = {
        ...(bond.bday ?? {}),
        invited: year,
      }),
      learnBirthday(state, character.id, "invited"),
      (bond.asks = {
        id: "birthday-invite",
        at: state.minutes,
        due: approachDue(bond, state.minutes),
        plan: plan,
      }),
      true)
    : false;
}
function partyPlan(state, character, day) {
  let houseParty = planTheirParty(state, character, day);
  if (houseParty) {
    return {
      kind: "hang",
      place: houseParty.home ? "home" : "their",
      characterId: character.id,
      at: houseParty.at,
      with: houseParty.guests,
      house: true,
      ...(houseParty.home
        ? {
            home: true,
          }
        : {}),
      birthday: {
        of: character.id,
      },
    };
  }
  if (yourPartyOn(state, day)) {
    return null;
  }
  let slot = null;
  for (let placeId of PARTY_PLACES.filter((candidateId) =>
    state.town?.places?.some((spot) => spot.id === candidateId),
  )) {
    let hour = hoursFor(state, placeId, day).find(
      (candidateHour) =>
        candidateHour >= PARTY_FROM_HOUR && !busyWhy(state, character, day * 24 * 60 + candidateHour * 60),
    );
    if (hour !== undefined) {
      slot = {
        place: placeId,
        at: day * 24 * 60 + hour * 60,
      };
      break;
    }
  }
  if (!slot) {
    return null;
  }
  let guests = npcPairsOf(state, character.id)
    .filter(
      (pair) =>
        BDAY_NETWORK_KINDS.includes(pair.kind) &&
        hasMet2(state, pair.other) &&
        !characterOf(state, pair.other)?.away &&
        !busyWhy(state, characterOf(state, pair.other), slot.at) &&
        !planWith(state, pair.other),
    )
    .slice(0, BDAY_PARTY_GUESTS)
    .map((pair) => pair.other);
  return {
    kind: "hang",
    place: slot.place,
    at: slot.at,
    with: guests,
    birthday: {
      of: character.id,
    },
  };
}
function birthdayInviteAbout(state, plan) {
  let hostName = characterOf(state, plan.characterId)?.name ?? "They",
    names = (plan.with ?? []).map((id) => characterOf(state, id)?.name).filter(Boolean);
  return `${outingAbout(state, plan)} It is ${hostName}'s birthday party${names.length ? `; ${names.join(", ")} will be there too` : ""}.`;
}
function greetBirthday(state, characterId, how = "words") {
  let character = characterOf(state, characterId);
  return !character?.birthday || !isBirthdayToday(character.birthday, state.minutes)
    ? {
        ok: false,
        reason: "It is not their birthday.",
      }
    : (learnBirthday(state, characterId, "today"),
      birthdaySaid(state, characterId)
        ? {
            ok: true,
            again: true,
            tags: [],
          }
        : (adjustBondAxis(bondOf(state, characterId), "friendship", BDAY_GREET.friendship, {
            at: state.minutes,
          }),
          markSaid(state, characterId, how),
          logNote(state, `Wished ${character.name} a happy birthday`, "social"),
          {
            ok: true,
            tags: [
              {
                text: `\u{1F382} HAPPY BIRTHDAY \xB7 +${BDAY_GREET.friendship} FRIENDSHIP`,
                step: true,
              },
            ],
          }));
}
function birthdayMessage(state, characterId) {
  if (!hasMet2(state, characterId)) {
    return {
      ok: false,
      reason: "You have not met them.",
    };
  }
  if (!knowsBirthday(state, characterId)) {
    return {
      ok: false,
      reason: "You do not know their birthday.",
    };
  }
  let result = greetBirthday(state, characterId, "message");
  return result.ok
    ? {
        ...result,
        text: result.again
          ? "You already said it today."
          : `You sent ${characterOf(state, characterId).name} a happy birthday.`,
      }
    : result;
}
function birthdayGift(state, characterId) {
  let character = characterOf(state, characterId);
  return !character?.birthday || !isBirthdayToday(character.birthday, state.minutes)
    ? 1
    : (learnBirthday(state, characterId, "today"), markSaid(state, characterId, "gift"), BDAY_GIFT_TIMES);
}
function birthdaySlip(state, scene = state.scene) {
  if (!scene || scene.done) {
    return null;
  }
  if (scene.bdaySlip !== undefined) {
    return scene.bdaySlip || null;
  }
  let character = characterOf(state, scene.characterId),
    daysLeft = character?.birthday ? daysUntilBirthday(character.birthday, state.minutes) : null,
    slips =
      scene.kind !== "intro" &&
      daysLeft !== null &&
      daysLeft <= BDAY_SLIP.days &&
      !knowsBirthday(state, character.id) &&
      hasMet2(state, character.id) &&
      seededRandom(state.seed, character.id, "slip", String(scene.startedAt)) < BDAY_SLIP.chance;
  scene.bdaySlip = slips
    ? {
        label: formatBirthday(character.birthday),
        days: daysLeft,
        told: false,
      }
    : false;
  return scene.bdaySlip || null;
}
function birthdaySlipWords(state, scene = state.scene) {
  let slip = birthdaySlip(state, scene);
  if (!slip || slip.told) {
    return "";
  }
  let slipName = characterOf(state, scene.characterId)?.name ?? "They";
  return `${slipName}'s birthday is ${formatDaysUntil(slip.days)} (${slip.label}). Somewhere in this answer it comes up and ${slipName} mentions it, naturally and in passing, true to who they are: the day, and how they feel about it.`;
}
function birthdaySlipped(state, scene = state.scene) {
  let slip = scene?.bdaySlip;
  return !slip || slip.told
    ? null
    : ((slip.told = true),
      learnBirthday(state, scene.characterId, "slip"),
      {
        text: `\u{1F382} ${(characterOf(state, scene.characterId)?.name ?? "their").toUpperCase()}'S BIRTHDAY IS ${slip.label.toUpperCase()} \xB7 ${formatDaysUntil(slip.days).toUpperCase()}`,
        step: true,
      });
}
function birthdaySheet(state, characterId) {
  let character = characterOf(state, characterId);
  if (!character?.birthday) {
    return null;
  }
  if (!knowsBirthday(state, characterId)) {
    return {
      known: false,
    };
  }
  let daysLeft = daysUntilBirthday(character.birthday, state.minutes);
  return {
    known: true,
    label: formatBirthday(character.birthday),
    when: formatDaysUntil(daysLeft),
    today: daysLeft === 0,
    said: birthdaySaid(state, characterId),
    cares: caresAboutBirthday(state, characterId),
  };
}
var birthdayState = (state, characterId) => {
  let character = characterOf(state, characterId);
  return character?.birthday
    ? {
        label: formatBirthday(character.birthday),
        today: isBirthdayToday(character.birthday, state.minutes),
        said: birthdaySaid(state, characterId),
      }
    : null;
};
var BIRTHDAY_ACTS = ["happy-birthday", "ask-birthday", "message", "gift-double", "your-party", "your-presents"];

export {
  BDAY_CARES_FROM,
  BDAY_FORGOT,
  BDAY_GIFT_TIMES,
  BDAY_GREET,
  BDAY_INVITE,
  BDAY_INVITE_DAYS,
  BDAY_KNOWN_FROM,
  BDAY_PARTY_GUESTS,
  BDAY_SLIP,
  BDAY_SURPRISE,
  BDAY_TOLD_DAYS,
  BIRTHDAY_ACTS,
  PARTY_AROUND,
  PARTY_FROM_HOUR,
  PARTY_PLACES,
  PARTY_PLAN_DAYS,
  SURPRISE_FROM_HOUR,
  YOUR_DAY_GIFT_FROM,
  YOUR_DAY_KNOWN_FROM,
  birthdayGift,
  birthdayInvite,
  birthdayInviteAbout,
  birthdayMessage,
  birthdayOf,
  birthdayPartyDays,
  birthdayPartyWhy,
  birthdaySaid,
  birthdaySheet,
  birthdaySlip,
  birthdaySlipWords,
  birthdaySlipped,
  birthdayState,
  birthdayTick,
  caresAboutBirthday,
  greetBirthday,
  knowsBirthday,
  knowsYourBirthday,
  learnBirthday,
  markSaid,
  partyPlan,
  partyPresents,
  receivePresent,
  surprisePlan,
  yourBirthdayMorning,
  yourBirthdayYear,
  yourDayWords,
};
