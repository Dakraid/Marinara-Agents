// Plans with the cast: create, invite, busy checks, counters, their own invites, plan strip
import { clockFromMinutes, formatClockTime, formatHourLabel, formatUntilStamp } from "../time/clock.mjs";
import { weekSpanAt } from "../schedule/week-grid.mjs";
import { WORK_FROM_HOME_PLACE, seededRandom } from "../schedule/whereabouts.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { isJobSpan } from "../jobs/job-week.mjs";
import { adjustBondAxis, applyBondAction, bondTier, markTraitsSeen } from "../relationships/bonds.mjs";
import { INITIATIVE_ASK_CHANCES, MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { isGiftable, itemDef } from "../items/inventory.mjs";
import { npcPairsOf } from "../network/town-facts.mjs";
import {
  CANCEL_PLAN_PENALTIES,
  INVITABLE_OUTING_KINDS,
  INVITE_MINUTES,
  INVITE_NO_COOLDOWN_HOURS,
  MAX_PLANS,
  OUTING_KINDS,
  OUTING_LATENESS,
  OUTING_LIMITS,
  PLAN_DAYS_AHEAD,
  canInviteToOuting,
} from "../outings/outing-rules.mjs";
import { dateTastesFor } from "../outings/date-tastes.mjs";
import { OUTING_PLACES, OUTING_PLACE_IDS, availableOutingPlaces, outingPlaceHome } from "../outings/outing-places.mjs";
import { decideInviteAnswer } from "../outings/outing-scoring.mjs";
import { outingPlaceVerdict, personalityProfileOf } from "../outings/outing-prompts.mjs";
import { giftTasteVerdict } from "../gifts/gift-tastes.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { OFFICE_SHIFT, OFFICE_WORKDAYS } from "../jobs/office-rules.mjs";
import { isPlaceOpen, minutesUntilPlaceCloses, townPlace } from "../town/town-layout.mjs";
import { seenWeekBlocks } from "../people/people-sheet.mjs";
import { collectModuleHook, firstModuleHook } from "../modules/module-registry.mjs";
import { guestSpans } from "../social/guest-visits.mjs";
import { PARTY_MINUTES } from "../parties/house-party.mjs";
import { ownPartyBlocksReason, partyScheduleSpans, partyStripItems, sayGoodbyeFirstReason } from "../parties/party.mjs";
import { tellsTheirWeek } from "../relationships/friend-perks.mjs";
import { hasOwnHome } from "../home/residence.mjs";
import { cookingHandOf } from "../things/things-actions.mjs";
import { coupleOf, hurtBond, isPartner } from "../romance/jealousy.mjs";
import { GROUP_MAX, groupChoices, joinsGroup, otherPartnersOf } from "../romance/multiple-partners.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { HONEYMOONS } from "../romance/wedding.mjs";
import { HONEYMOON_DAYS } from "../romance/wedding-morning.mjs";
import { meetSpans } from "../relationships/cast-meets.mjs";
import { PICKUP_MOOD, canPickUp, goingBy, pickUpView, rideSpans } from "../travel/vehicles-rides.mjs";
import {
  advanceTime,
  bondOf,
  characterOf,
  eventsCutShort,
  hasFaintedEvent,
  hasMet2,
  isCharacterHere,
  logNote,
  nameFor,
  sceneBusyReason,
  sharesYourDoor,
  traitsOf,
} from "../game.mjs";

var PLAN_DAY_MINUTES = 1440;
var PLANS_KEEP_MAX = 60;
var activePlans = (state) => (state.plans ?? []).filter((plan) => plan.status === "set" || plan.status === "on");
var planWith = (state, characterId) =>
  activePlans(state).find((plan) => plan.characterId === characterId || (plan.with ?? []).includes(characterId)) ??
  null;
function planPlaceName(state, plan) {
  return plan.kind === "honeymoon"
    ? (HONEYMOONS[plan.trip]?.name ?? "The trip")
    : plan.kind === "wedding"
      ? plan.place === "hall"
        ? "The Grand Hall"
        : `The ${townPlace(state.town, plan.place)?.name ?? plan.place}`
      : plan.place === "home"
        ? "Your place"
        : plan.place === "their"
          ? `${nameFor(
              state,
              characterOf(state, plan.characterId) ?? {
                id: "",
                name: "Their",
              },
            )}'s place`
          : plan.place === "restaurant" && !townPlace(state.town, "restaurant")
            ? "Restaurant"
            : (townPlace(state.town, plan.place)?.name ?? plan.place);
}
var planWhenLabel = (minutes) => {
  let clock = clockFromMinutes(minutes);
  return `${clock.weekday} ${clock.day} \xB7 ${formatClockTime(minutes)}`;
};
function planView(state, plan) {
  let character = characterOf(state, plan.characterId);
  return {
    id: plan.id,
    characterId: plan.characterId,
    name: character ? nameFor(state, character) : "?",
    ...characterPortrait(character, state),
    kind: plan.kind,
    kindName: kindNameOf(state, plan),
    place: plan.place,
    placeName: planPlaceName(state, plan),
    at: plan.at,
    day: clockFromMinutes(plan.at).dayIndex,
    hour: clockFromMinutes(plan.at).hour,
    time: formatClockTime(plan.at),
    when: planWhenLabel(plan.at),
    by: plan.by,
    status: plan.status,
    with: (plan.with ?? []).map((withId) => ({
      id: withId,
      name: nameFor(
        state,
        characterOf(state, withId) ?? {
          id: withId,
          name: "?",
        },
      ),
    })),
    pickUp: !!plan.pickUp,
  };
}
var plansAhead = (state, characterId) =>
  (state.plans ?? [])
    .filter(
      (plan) => plan.status === "set" && (plan.characterId === characterId || (plan.with ?? []).includes(characterId)),
    )
    .sort((planA, planB) => planA.at - planB.at)
    .map(
      (plan) =>
        `${planKindWords(state, plan, characterId)} at ${planPlaceName(state, plan)}, ${formatUntilStamp(plan.at, state.minutes)} (${plan.by === "you" ? "the player asked" : "they asked the player"})`,
    );
function planKindWords(state, plan, characterId) {
  let nameOfId = (id) => characterOf(state, id)?.name ?? "someone",
    kindName = OUTING_KINDS[plan.kind].name,
    label = plan.birthday
      ? plan.birthday.of === "you"
        ? plan.by === "you"
          ? "The player's birthday party"
          : `${kindName} for the player's birthday`
        : `${nameOfId(plan.birthday.of)}'s birthday party`
      : kindName,
    others = [plan.characterId, ...(plan.with ?? [])].filter((id) => id && id !== characterId).map(nameOfId);
  return others.length ? `${label}, with ${others.join(", ")}` : label;
}
var kindNameOf = (state, plan) =>
  plan.birthday
    ? plan.birthday.of === "you"
      ? plan.by === "you"
        ? "Your birthday party"
        : "Your birthday"
      : `${nameFor(
          state,
          characterOf(state, plan.birthday.of) ?? {
            id: "",
            name: "Their",
          },
        )}'s birthday`
    : OUTING_KINDS[plan.kind].name;
function bestPresent(state, character) {
  let rank = {
    loved: 0,
    liked: 1,
    fine: 2,
    disliked: 3,
  };
  return (
    (state.things?.bag ?? [])
      .map((pile, index) => ({
        pile: pile,
        index: index,
        item: itemDef(state.things, pile.item),
      }))
      .filter((entry) => isGiftable(state.things, entry.pile))
      .map((entry) => ({
        index: entry.index,
        name: entry.item.name,
        result: giftTasteVerdict(character?.tastes, entry.item.tags ?? []),
      }))
      .sort((entryA, entryB) => (rank[entryA.result] ?? 2) - (rank[entryB.result] ?? 2))[0] ?? null
  );
}
var plansView = (state) =>
  activePlans(state)
    .sort((planA, planB) => planA.at - planB.at)
    .map((plan) => planView(state, plan));
function appointments(state) {
  let spans = rideSpans(state);
  for (let plan of activePlans(state)) {
    if (outingPlaceHome(plan.place) === "yours") {
      continue;
    }
    let atTheirs = outingPlaceHome(plan.place) === "theirs";
    for (let characterId of [plan.characterId, ...(plan.with ?? [])]) {
      (spans[characterId] ??= []).push({
        from: plan.at - 10,
        to: plan.at + OUTING_LATENESS.leaves + OUTING_LIMITS.minutes + OUTING_LIMITS.goodbye,
        place: atTheirs ? "home" : plan.place,
        ...(atTheirs
          ? {
              host: plan.characterId,
            }
          : {}),
        doing: "meeting someone",
      });
    }
  }
  for (let [characterId, list] of Object.entries({
    ...guestSpans(state),
    ...partyScheduleSpans(state),
  })) {
    (spans[characterId] ??= []).push(...list);
  }
  for (let [characterId, list] of Object.entries(meetSpans(state))) {
    (spans[characterId] ??= []).push(...list);
  }
  for (let hookSpans of collectModuleHook(state, "spans")) {
    for (let [characterId, list] of Object.entries(hookSpans ?? {})) {
      if (Array.isArray(list)) {
        (spans[characterId] ??= []).push(...list);
      }
    }
  }
  return spans;
}
function createPlan(state, { characterId: characterId, kind: kind, place: place, at: at, by: by, pickUp = false }) {
  state.plans ??= [];
  let plan = {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    characterId: characterId,
    kind: kind,
    place: place,
    at: at,
    by: by,
    made: state.minutes,
    status: "set",
    ...(pickUp
      ? {
          pickUp: true,
        }
      : {}),
  };
  state.plans.push(plan);
  if (state.plans.length > PLANS_KEEP_MAX) {
    state.plans = state.plans.filter(
      (entry, index) => entry.status === "set" || entry.status === "on" || index >= state.plans.length - PLANS_KEEP_MAX,
    );
  }
  logNote(
    state,
    `${OUTING_KINDS[kind].name} with ${characterOf(state, characterId)?.name ?? "someone"} \xB7 ${planWhenLabel(at)}`,
    "social",
  );
  return plan;
}
function createGroupPlan(state, { with: withIds = [], ...options }) {
  let plan = createPlan(state, options);
  if (withIds.length) {
    plan.with = [...withIds];
  }
  return plan;
}
var placeShutForPlans = (state, place) => !outingPlaceHome(place) && !!firstModuleHook(state, "shutTo", place);
function hoursFor(state, place, dayIndex) {
  let hours = [],
    spot = outingPlaceHome(place)
      ? {
          open: 0,
          close: 24,
          always: true,
        }
      : townPlace(state.town, place);
  if (!spot || placeShutForPlans(state, place)) {
    return hours;
  }
  for (let hour = 8; hour <= 22; hour++) {
    let at = dayIndex * PLAN_DAY_MINUTES + hour * 60;
    if (!(
      at < state.minutes + 30 ||
      (!spot.always && (!isPlaceOpen(spot, at) || minutesUntilPlaceCloses(spot, at) < 60))
    )) {
      hours.push(hour);
    }
  }
  return hours;
}
function busyWhy(state, character, at) {
  if (!character || character.away) {
    return "Away";
  }
  let span = weekSpanAt(character.week ?? [], at);
  return span
    ? span.sleep
      ? "Asleep"
      : span.place === JOB_AWAY_PLACE
        ? "Away"
        : isJobSpan(character, span) || span.place === WORK_FROM_HOME_PLACE
          ? "Works"
          : ""
    : "";
}
function partyBusy(state, characterId, at) {
  let party = (state.parties ?? []).find(
    (candidate) =>
      ["set", "on"].includes(candidate.status) &&
      at >= candidate.at - 60 &&
      at < (candidate.ends ?? candidate.at + PARTY_MINUTES) &&
      (candidate.host === "you" || !characterOf(state, candidate.host)?.away) &&
      (candidate.host === characterId ||
        (Array.isArray(candidate.guests) ? candidate.guests : Object.keys(candidate.guests ?? {})).includes(
          characterId,
        )),
  );
  return party
    ? party.host === characterId
      ? "Their party"
      : party.host === "you"
        ? "Your party"
        : `${nameFor(state, characterOf(state, party.host))}'s party`
    : "";
}
function partyThen(state, plan) {
  for (let characterId of [plan?.characterId, ...(plan?.with ?? [])]) {
    let busy = characterId ? partyBusy(state, characterId, plan.at) : "";
    if (busy) {
      return busy === "Their party"
        ? `${nameFor(state, characterOf(state, characterId))}'s party`
        : busy === "Your party"
          ? "your party"
          : busy;
    }
  }
  return "";
}
var busyForPlans = (state, character, at) =>
  busyWhy(state, character, at) || (character ? partyBusy(state, character.id, at) : "");
function yourBusy(state, at, { except: exceptId = null, shift = true } = {}) {
  let clock = clockFromMinutes(at),
    wedding = state.wedding,
    daysSinceWedding = Number.isFinite(wedding?.day) ? clock.dayIndex - wedding.day : -1;
  if (daysSinceWedding === 0) {
    return "Your wedding";
  }
  if (daysSinceWedding > 0 && wedding.honeymoon && daysSinceWedding <= HONEYMOON_DAYS) {
    return "Your honeymoon";
  }
  if (
    shift &&
    state.job?.employed &&
    OFFICE_WORKDAYS.includes(clock.weekdayIndex) &&
    !(state.job.daysOff ?? []).includes(clock.dayIndex) &&
    clock.hour >= OFFICE_SHIFT.from &&
    clock.hour < OFFICE_SHIFT.to &&
    (state.job.startsOn ?? 0) <= clock.dayIndex
  ) {
    return "Your shift";
  }
  let plan = activePlans(state).find((other) => other.id !== exceptId && Math.abs(other.at - at) < 150);
  if (plan) {
    return `${OUTING_KINDS[plan.kind].name} with ${nameFor(state, characterOf(state, plan.characterId))}`;
  }
  let party = (state.parties ?? []).find(
    (other) =>
      other.id !== exceptId &&
      ["set", "on"].includes(other.status) &&
      (other.host === "you" || other.you === "yes") &&
      at >= other.at - 60 &&
      at < (other.ends ?? other.at + PARTY_MINUTES),
  );
  return party
    ? party.host === "you"
      ? "Your party"
      : `${nameFor(state, characterOf(state, party.host))}'s party`
    : "";
}
function nextFreePlanSlot(state, character, place, after) {
  let startDay = clockFromMinutes(after).dayIndex;
  for (let day of [startDay, startDay + 1]) {
    if (day - clockFromMinutes(state.minutes).dayIndex > PLAN_DAYS_AHEAD) {
      break;
    }
    for (let hour of hoursFor(state, place, day)) {
      let at = day * PLAN_DAY_MINUTES + hour * 60;
      if (!(at <= after && day === startDay) && !busyForPlans(state, character, at) && !yourBusy(state, at)) {
        return at;
      }
    }
  }
  return null;
}
var timesAt = (state, characterId, place) =>
  (state.plans ?? []).filter(
    (plan) => plan.characterId === characterId && plan.place === place && plan.status === "kept",
  ).length;
function inviteWhy(state, characterId) {
  let bond = bondOf(state, characterId);
  if (activePlans(state).length >= MAX_PLANS) {
    return `You already have ${MAX_PLANS} plans`;
  }
  let check = canInviteToOuting(bond, "hang");
  return !check.ok && !canInviteToOuting(bond, "date").ok ? check.why : "";
}
function inviteInfo(state, characterId) {
  let bond = bondOf(state, characterId),
    character = characterOf(state, characterId);
  if (!bond || !character || !hasMet2(state, characterId)) {
    return {
      ok: false,
      why: "Introduce yourself first",
    };
  }
  let canByKind = Object.fromEntries(INVITABLE_OUTING_KINDS.map((kind) => [kind, canInviteToOuting(bond, kind)])),
    plan = planWith(state, characterId),
    why = plan
      ? `You have a plan with ${nameFor(state, character)}: ${planWhenLabel(plan.at)}`
      : inviteWhy(state, characterId),
    today = clockFromMinutes(state.minutes).dayIndex,
    seenBlocks = seenWeekBlocks(character, state.seenSchedule?.[characterId] ?? {}, {
      showAll: state.rules?.showSchedules === "always" || tellsTheirWeek(state, characterId),
    }),
    days = Array.from(
      {
        length: PLAN_DAYS_AHEAD,
      },
      (slot, offset) => {
        let dayIndex = today + offset,
          clock = clockFromMinutes(dayIndex * PLAN_DAY_MINUTES),
          theirs = {},
          yours = {};
        for (let hour = 8; hour <= 22; hour++) {
          let at = dayIndex * PLAN_DAY_MINUTES + hour * 60,
            span = weekSpanAt(character.week ?? [], at),
            busy = busyWhy(state, character, at);
          if (busy && span && (seenBlocks[clock.weekdayIndex] ?? []).includes(span)) {
            theirs[hour] = busy;
          } else if (!busy && partyBusy(state, characterId, at)) {
            theirs[hour] = partyBusy(state, characterId, at);
          }
          let yourBusyHere = yourBusy(state, at);
          if (yourBusyHere) {
            yours[hour] = yourBusyHere;
          }
        }
        return {
          k: offset,
          d: dayIndex,
          label: offset === 0 ? "TODAY" : clock.weekday.toUpperCase(),
          n: clock.day,
          theirs: theirs,
          yours: yours,
        };
      },
    ),
    outingVerdicts = bond.dateFound?.outings ?? {},
    sharesDoor = sharesYourDoor(state, character),
    places = OUTING_PLACE_IDS.filter((placeId) =>
      outingPlaceHome(placeId)
        ? !(sharesDoor && outingPlaceHome(placeId) === "theirs") &&
          (outingPlaceHome(placeId) !== "yours" || hasOwnHome(state))
        : townPlace(state.town, placeId) && !placeShutForPlans(state, placeId),
    ).map((placeId) => {
      let placeDef = OUTING_PLACES[placeId],
        home = outingPlaceHome(placeId),
        townSpot = home ? null : townPlace(state.town, placeId),
        visits = timesAt(state, characterId, placeId),
        tags = [];
      if (outingVerdicts[placeDef.outing] === "liked") {
        tags.push(["THEY LIKE IT", "good"]);
      }
      if (outingVerdicts[placeDef.outing] === "disliked") {
        tags.push(["NOT THEIR THING", "bad"]);
      }
      if (visits) {
        tags.push(visits === 1 ? ["BEEN ONCE", ""] : [`${visits} TIMES \xB7 LESS EACH TIME`, "meh"]);
      }
      if (placeId === "restaurant") {
        tags.push([`RESERVATION \xB7 ~$${placeDef.price * 2} FOR TWO`, ""]);
      } else if (placeDef.price) {
        tags.push([`~$${placeDef.price * 2} FOR TWO`, ""]);
      }
      if (placeId === "home") {
        tags.push([
          [state.things?.home?.kitchen ? "KITCHEN" : "NO KITCHEN", state.things?.home?.tv ? "TV" : "NO TV"].join(
            " \xB7 ",
          ),
          "",
        ]);
      }
      if (placeId === "their" && cookingHandOf(state, characterId)) {
        tags.push([cookingHandOf(state, characterId) === 3 ? "LOVES TO COOK" : "COOKS FOR YOU", "good"]);
      }
      return {
        id: placeId,
        name: home
          ? planPlaceName(state, {
              place: placeId,
              characterId: characterId,
            })
          : townSpot.name,
        open: townSpot?.open ?? 0,
        close: townSpot?.close ?? 24,
        hangOnly: placeDef.only === "hang",
        tags: tags,
        hours: days.map((day) => hoursFor(state, placeId, day.d)),
      };
    }),
    pickUpPlaces = places.filter((place) => canPickUp(state, characterId, place.id)).map((place) => place.id);
  return {
    ok: !why,
    why: why,
    kinds: canByKind,
    places: places,
    days: days,
    plans: activePlans(state).length,
    max: MAX_PLANS,
    mine: plan ? planView(state, plan) : null,
    minutes: INVITE_MINUTES,
    pickUp: pickUpPlaces.length
      ? {
          places: pickUpPlaces,
          by: goingBy(state),
          mood: PICKUP_MOOD,
        }
      : null,
    group: groupChoices(state, characterId),
    groupMax: GROUP_MAX,
  };
}
function groupInviteAnswers(state, hostId, invitedIds, at) {
  let nameOfId = (id) =>
    nameFor(
      state,
      characterOf(state, id) ?? {
        id: id,
        name: "them",
      },
    );
  return invitedIds.map((invitedId) => {
    let busy = busyForPlans(state, characterOf(state, invitedId), at);
    if (busy) {
      return {
        id: invitedId,
        yes: false,
        why: busy,
      };
    }
    let joins = joinsGroup(
      state,
      invitedId,
      [hostId, ...invitedIds.filter((otherId) => otherId !== invitedId)],
      String(at),
    );
    return {
      id: invitedId,
      yes: joins.yes,
      why: joins.yes
        ? ""
        : joins.why === "rivals"
          ? `Not with ${nameOfId(joins.with)} there`
          : `Not with ${nameOfId(joins.with)}, not yet`,
    };
  });
}
var groupAnswersView = (state, answers) =>
  answers.map((answer) => ({
    id: answer.id,
    name: nameFor(
      state,
      characterOf(state, answer.id) ?? {
        id: answer.id,
        name: "?",
      },
    ),
    ...characterPortrait(characterOf(state, answer.id), state),
    answer: answer.yes ? "yes" : "no",
    why: answer.why,
  }));
function checkInviteRequest(state, characterId, { kind: kind, place: place, day: day, hour: hour }) {
  let info = inviteInfo(state, characterId);
  if (!info.ok) {
    return {
      ok: false,
      reason: `${info.why}.`,
    };
  }
  if (!OUTING_KINDS[kind] || !info.kinds[kind].ok) {
    return {
      ok: false,
      reason: `${info.kinds[kind]?.why ?? "Not that"}.`,
    };
  }
  let placeOption = info.places.find((option) => option.id === place);
  if (!placeOption || (kind === "date" && placeOption.hangOnly)) {
    return {
      ok: false,
      reason: "Not a place for that.",
    };
  }
  let dayIndex = info.days.findIndex((dayOption) => dayOption.d === Number(day));
  return dayIndex < 0 || !placeOption.hours[dayIndex].includes(Number(hour))
    ? {
        ok: false,
        reason: "Not an hour that works there.",
      }
    : {
        ok: true,
        at: Number(day) * PLAN_DAY_MINUTES + Number(hour) * 60,
      };
}
function invitePlan(state, characterId, request = {}) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (!isCharacterHere(state, characterId)) {
    return {
      ok: false,
      reason: "They are not here.",
    };
  }
  if (isAsleep(state, characterId)) {
    return {
      ok: false,
      reason: "They are asleep.",
    };
  }
  let check = checkInviteRequest(state, characterId, request);
  if (!check.ok) {
    return check;
  }
  let bond = bondOf(state, characterId),
    character = characterOf(state, characterId),
    { kind: kind, place: place } = request,
    pickUp = request.pickUp === true && canPickUp(state, characterId, place),
    withIds = [...new Set((Array.isArray(request.with) ? request.with : []).map(String))]
      .filter((id) => otherPartnersOf(state, characterId).includes(id))
      .slice(0, GROUP_MAX - 1),
    { events: events } = advanceTime(state, INVITE_MINUTES);
  if (eventsCutShort(events)) {
    return {
      ok: true,
      fainted: hasFaintedEvent(events),
      cut: true,
      answer: null,
      why: "",
      events: events,
      kind: kind,
      place: place,
      placeName: planPlaceName(state, {
        place: place,
        characterId: characterId,
      }),
      at: check.at,
      when: planWhenLabel(check.at),
      counter: null,
      plan: null,
      yours: "",
      group: [],
    };
  }
  let busy = busyForPlans(state, character, check.at),
    couple = coupleOf(state, characterId),
    decision = decideInviteAnswer({
      bond: bond,
      profile: personalityProfileOf(bond),
      kind: kind,
      placeTaste: outingPlaceVerdict(character, bond, place),
      busy: busy,
      counterAt: busy ? nextFreePlanSlot(state, character, place, check.at) : null,
      roll: seededRandom(
        state.seed,
        characterId,
        String(clockFromMinutes(state.minutes).dayIndex),
        place,
        String(check.at),
        kind,
        "invite",
      ),
      blockedUntil: bond.inviteNo ?? 0,
      at: state.minutes,
      couple: couple ? (characterOf(state, couple.a === characterId ? couple.b : couple.a)?.name ?? "someone") : null,
    });
  state.inviteCounter = null;
  let plan = null,
    groupAnswers = decision.answer === "yes" ? groupInviteAnswers(state, characterId, withIds, check.at) : [];
  if (decision.answer === "yes") {
    plan = createGroupPlan(state, {
      characterId: characterId,
      kind: kind,
      place: place,
      at: check.at,
      by: "you",
      pickUp: pickUp,
      with: groupAnswers.filter((answer) => answer.yes).map((answer) => answer.id),
    });
  } else if (decision.answer === "no" && kind === "date") {
    state.badDayAt = state.minutes;
  } else if (decision.answer === "counter") {
    state.inviteCounter = {
      characterId: characterId,
      kind: kind,
      place: place,
      at: decision.at,
      until: state.minutes + 30,
      with: withIds,
      pickUp: pickUp,
    };
  } else if (!busy) {
    bond.inviteNo = state.minutes + INVITE_NO_COOLDOWN_HOURS * PLAN_DAY_MINUTES;
  }
  return {
    ok: true,
    answer: decision.answer,
    why: decision.why ?? "",
    events: events,
    kind: kind,
    place: place,
    placeName: planPlaceName(state, {
      place: place,
      characterId: characterId,
    }),
    at: check.at,
    when: planWhenLabel(check.at),
    counter:
      decision.answer === "counter"
        ? {
            at: decision.at,
            when: planWhenLabel(decision.at),
            time: formatClockTime(decision.at),
          }
        : null,
    plan: plan ? planView(state, plan) : null,
    yours:
      yourBusy(state, plan?.at ?? check.at, {
        except: plan?.id,
      }) || "",
    group: groupAnswersView(state, groupAnswers),
  };
}
function answerCounter(state, characterId, accept) {
  let counter = state.inviteCounter;
  if (!counter || counter.characterId !== characterId || state.minutes > counter.until) {
    return {
      ok: false,
      reason: "There is nothing to answer.",
    };
  }
  if (((state.inviteCounter = null), !accept)) {
    return {
      ok: true,
      plan: null,
    };
  }
  if (activePlans(state).length >= MAX_PLANS) {
    return {
      ok: false,
      reason: `${MAX_PLANS} plans already.`,
    };
  }
  let groupAnswers = groupInviteAnswers(state, characterId, counter.with ?? [], counter.at),
    plan = createGroupPlan(state, {
      characterId: characterId,
      kind: counter.kind,
      place: counter.place,
      at: counter.at,
      by: "you",
      pickUp: !!counter.pickUp,
      with: groupAnswers.filter((answer) => answer.yes).map((answer) => answer.id),
    });
  return {
    ok: true,
    plan: planView(state, plan),
    yours:
      yourBusy(state, plan.at, {
        except: plan.id,
      }) || "",
    group: groupAnswersView(state, groupAnswers),
  };
}
function cancelPlan(state, planId, { free = false } = {}) {
  let plan = (state.plans ?? []).find((candidate) => candidate.id === planId && candidate.status === "set");
  if (!plan) {
    return {
      ok: false,
      reason: "That plan is not on.",
    };
  }
  let bond = bondOf(state, plan.characterId),
    sameDay = clockFromMinutes(plan.at).dayIndex === clockFromMinutes(state.minutes).dayIndex,
    penalty = free
      ? {}
      : sameDay
        ? {
            ...CANCEL_PLAN_PENALTIES.sameDay,
            ...(plan.kind === "date" ? CANCEL_PLAN_PENALTIES.sameDayDate : {}),
          }
        : CANCEL_PLAN_PENALTIES.early;
  if (bond) {
    hurtBond(bond, penalty);
  }
  let others = free ? [] : (plan.with ?? []).filter((otherId) => bondOf(state, otherId));
  for (let otherId of others) {
    adjustBondAxis(bondOf(state, otherId), "friendship", CANCEL_PLAN_PENALTIES.eachOther, {
      at: state.minutes,
    });
  }
  plan.status = "cancelled";
  plan.cancelledAt = state.minutes;
  let withName = characterOf(state, plan.characterId)?.name ?? "them";
  logNote(state, `Cancelled: ${OUTING_KINDS[plan.kind].name} with ${withName}`, "social");
  let parts = [
    Object.entries(penalty)
      .map(([axis, amount]) => `${amount} ${axis[0].toUpperCase()}${axis.slice(1)}`)
      .join(", "),
    others.length
      ? `${CANCEL_PLAN_PENALTIES.eachOther} Friendship with ${others.map((otherId) => nameFor(state, characterOf(state, otherId))).join(", ")}`
      : "",
  ].filter(Boolean);
  return {
    ok: true,
    cost: penalty,
    text: parts.length ? `Cancelled \xB7 ${parts.join(" \xB7 ")}` : `Cancelled \xB7 ${withName} understands`,
  };
}
function plansTick(state, events) {
  for (let plan of activePlans(state)) {
    if (plan.status !== "set") {
      continue;
    }
    let character = characterOf(state, plan.characterId),
      bond = bondOf(state, plan.characterId),
      who = character?.name ?? "Someone";
    if (!character || !bond || character.away) {
      plan.status = "dropped";
      events.push({
        id: "plan-dropped",
        characterId: plan.characterId,
        text: `${who} cancelled: they moved away.`,
      });
      continue;
    }
    if (plan.kind === "date" && (bond.status === "ex" || bond.justFriends || bond.romanceable === false)) {
      plan.status = "dropped";
      events.push({
        id: "plan-dropped",
        characterId: plan.characterId,
        text: `${who} cancelled the date.`,
      });
      continue;
    }
    if (outingPlaceHome(plan.place) === "yours" && !hasOwnHome(state)) {
      plan.status = "dropped";
      events.push({
        id: "plan-dropped",
        characterId: plan.characterId,
        text: `No ${OUTING_KINDS[plan.kind].name.toLowerCase()} with ${who} at yours: you have no home now.`,
      });
      continue;
    }
    let placeId = outingPlaceHome(plan.place) ? null : plan.place;
    if (placeId ? firstModuleHook(state, "shutTo", placeId) : null) {
      plan.status = "dropped";
      events.push({
        id: "plan-dropped",
        characterId: plan.characterId,
        text: `No ${OUTING_KINDS[plan.kind].name.toLowerCase()} with ${who} at ${planPlaceName(state, plan)}: you can't go in there now. ${who} knows.`,
      });
      continue;
    }
    if (state.minutes <= plan.at + OUTING_LATENESS.leaves) {
      continue;
    }
    let wedding = weddingNow(state);
    if (wedding) {
      plan.status = "dropped";
      events.push({
        id: "plan-dropped",
        characterId: plan.characterId,
        text: `No ${OUTING_KINDS[plan.kind].name.toLowerCase()} with ${who}: it fell on ${wedding}.`,
      });
      continue;
    }
    plan.status = "missed";
    let result = applyBondAction(bond, "missedPlan", {
      at: state.minutes,
      today: false,
      note: "missed a plan",
      scale: bond.stakes ? 2 : 1,
      unforgiven: !!personalityProfileOf(bond).rules?.missedPlanUnforgiven,
    });
    if (plan.kind === "date" && personalityProfileOf(bond).rules?.missedDateUnforgiven) {
      hurtBond(bond, {
        trust: -8,
        romance: -5,
      });
    }
    events.push({
      id: "plan-missed",
      characterId: plan.characterId,
      text: `You missed your ${OUTING_KINDS[plan.kind].name.toLowerCase()} with ${who}.`,
      applied: result.applied,
    });
    logNote(state, `Missed: ${OUTING_KINDS[plan.kind].name} with ${who}`, "social");
  }
  if (state.inviteCounter && state.minutes > state.inviteCounter.until) {
    state.inviteCounter = null;
  }
}
function weddingNow(state) {
  if (state.outing?.kind === "honeymoon") {
    return "your honeymoon";
  }
  let lastWedding = (state.weddings ?? []).at(-1);
  return state.outing?.kind === "wedding" ||
    (state.afterWedding && lastWedding && clockFromMinutes(state.minutes).dayIndex - lastWedding.day <= 1)
    ? "your wedding"
    : "";
}
function dreamTick(state, events) {
  for (let bond of Object.values(state.bonds ?? {})) {
    let dream = bond.dreamDate;
    if (!(!dream?.promised || dream.done || dream.charged || state.minutes - (dream.at ?? 0) < 30 * PLAN_DAY_MINUTES)) {
      dream.charged = state.minutes;
      hurtBond(bond, {
        romance: -5,
        trust: -3,
      });
      events.push({
        id: "dream-broken",
        characterId: bond.characterId,
        text: `${characterOf(state, bond.characterId)?.name ?? "They"} stopped waiting for the date you promised.`,
      });
    }
  }
}
var ASK_OUT_CHANCE_SCALE = 0.4;
var ASK_OUT_AGAIN_DAYS = 4;
function theirOuting(state, bond, dayIndex) {
  if (
    bond.asks ||
    !hasMet2(state, bond.characterId) ||
    planWith(state, bond.characterId) ||
    activePlans(state).length >= MAX_PLANS ||
    (bond.askedOutAt ?? -1 / 0) > state.minutes - ASK_OUT_AGAIN_DAYS * PLAN_DAY_MINUTES
  ) {
    return;
  }
  let character = characterOf(state, bond.characterId);
  if (!character || character.away) {
    return;
  }
  let kind =
    canInviteToOuting(bond, "date").ok && bondTier(bond, "romance") >= 2
      ? "date"
      : canInviteToOuting(bond, "hang").ok && bondTier(bond, "friendship") >= 2
        ? "hang"
        : null;
  if (!kind) {
    return;
  }
  let initiative = personalityProfileOf(bond).knobs.initiative ?? 1;
  if (
    seededRandom(state.seed, bond.characterId, String(dayIndex), "ask-you-out") >=
    (INITIATIVE_ASK_CHANCES[initiative] ?? 0) * ASK_OUT_CHANCE_SCALE
  ) {
    return;
  }
  let tastes = dateTastesFor(character, bond.archetype),
    sharesDoor = sharesYourDoor(state, character),
    places = availableOutingPlaces(state.town, kind).filter(
      (placeId) => outingPlaceHome(placeId) !== "yours" && !(sharesDoor && outingPlaceHome(placeId) === "theirs"),
    ),
    liked = places.filter((placeId) => OUTING_PLACES[placeId].outing === tastes.outings.likes),
    atYours =
      comesOver(state, bond) &&
      seededRandom(state.seed, bond.characterId, String(dayIndex), "at-yours") < AT_YOURS_SHARE,
    options = atYours
      ? ["home"]
      : liked.length
        ? liked
        : places.filter((placeId) => OUTING_PLACES[placeId].outing !== tastes.outings.dislikes),
    freeSpirit = traitsOf(state, bond.characterId).flags.includes("freeSpirit"),
    beenTo = freeSpirit
      ? (state.plans ?? []).filter((plan) => plan.characterId === bond.characterId).map((plan) => plan.place)
      : [],
    fresh = options.filter((placeId) => !beenTo.includes(placeId)),
    pool = fresh.length ? fresh : options,
    place = pool[Math.floor(seededRandom(state.seed, bond.characterId, String(dayIndex), "where") * pool.length)];
  if (!place) {
    return;
  }
  let friendId =
    kind === "hang" && !atYours && traitsOf(state, bond.characterId).dials.open >= 8
      ? friendToBringAlong(state, bond.characterId)
      : null;
  for (let offset = freeSpirit ? 0 : 1; offset <= (freeSpirit ? 1 : 3); offset++) {
    let day = dayIndex + offset,
      hour =
        hoursFor(state, place, day)
          .filter((hourOption) => hourOption >= 15 && day * PLAN_DAY_MINUTES + hourOption * 60 >= state.minutes + 90)
          .find(
            (hourOption) =>
              !busyForPlans(state, character, day * PLAN_DAY_MINUTES + hourOption * 60) &&
              (!friendId ||
                !busyForPlans(state, characterOf(state, friendId), day * PLAN_DAY_MINUTES + hourOption * 60)) &&
              !yourBusy(state, day * PLAN_DAY_MINUTES + hourOption * 60, {
                shift: false,
              }),
          ) ?? null;
    if (hour !== null) {
      bond.asks = {
        id: "ask-you-out",
        at: state.minutes,
        plan: {
          kind: kind,
          place: place,
          at: day * PLAN_DAY_MINUTES + hour * 60,
          ...(friendId
            ? {
                with: [friendId],
                friendOf: true,
              }
            : {}),
          ...(freeSpirit
            ? {
                spur: true,
              }
            : {}),
        },
      };
      if (freeSpirit) {
        markTraitsSeen(bond, "freeSpirit");
      }
      bond.askedOutAt = state.minutes;
      return;
    }
  }
}
var AT_YOURS_SHARE = 0.3;
var comesOver = (state, bond) =>
  !!state.residence &&
  !state.lodging &&
  !!bond &&
  !sharesYourDoor(state, characterOf(state, bond.characterId) ?? {}) &&
  (MILESTONE_COUPLE_STATUSES.includes(bond.status) || bondTier(bond, "friendship") >= 3);
function friendToBringAlong(state, characterId) {
  let friends = npcPairsOf(state, characterId).filter(
    (pair) =>
      ["friends", "close"].includes(pair.kind) &&
      characterOf(state, pair.other) &&
      !characterOf(state, pair.other).away &&
      !isPartner(state, pair.other) &&
      !planWith(state, pair.other) &&
      bondOf(state, pair.other)?.status !== "ex" &&
      !bondOf(state, pair.other)?.kin,
  );
  return (friends.find((pair) => !hasMet2(state, pair.other)) ?? friends[0])?.other ?? null;
}
function outingAbout(state, plan) {
  let names = (plan.with ?? []).map((id) => characterOf(state, id)?.name ?? "a friend");
  return [
    `THE PLAN: ${OUTING_KINDS[plan.kind].name.toLowerCase()} (${plan.kind === "date" ? "romantic" : "as friends"}) at ${plan.place === "home" ? "the player's place" : planPlaceName(state, plan)}, ${planWhenLabel(plan.at)}. It is a real place, open then.`,
    plan.spur ? "It is a spur-of-the-moment plan: they want to go now, or tomorrow at the latest." : "",
    names.length && plan.friendOf
      ? `They are bringing ${names.join(" and ")}, a friend of theirs, along${(plan.with ?? []).some((id) => !hasMet2(state, id)) ? ": they want the player to meet their people" : ""}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}
function planStillFits(state, plan, { theirs = true } = {}) {
  return !plan ||
    activePlans(state).length >= MAX_PLANS ||
    planWith(state, plan.characterId) ||
    yourBusy(state, plan.at, {
      shift: false,
    }) ||
    (theirs && partyThen(state, plan))
    ? false
    : plan.at > state.minutes + 30 &&
        hoursFor(state, plan.place, clockFromMinutes(plan.at).dayIndex).includes(clockFromMinutes(plan.at).hour);
}
function askPlanVerdict(state, ask) {
  let outing = ask?.about?.outing,
    bond = bondOf(state, ask?.characterId),
    character = characterOf(state, ask?.characterId);
  if (
    !outing ||
    !bond ||
    !character ||
    !planStillFits(
      state,
      {
        ...outing,
        characterId: character.id,
      },
      {
        theirs: false,
      },
    )
  ) {
    return {
      answer: "no",
      why: "It doesn't fit",
    };
  }
  let busy = busyForPlans(state, character, outing.at),
    couple = coupleOf(state, character.id);
  return decideInviteAnswer({
    bond: bond,
    profile: personalityProfileOf(bond),
    kind: outing.kind,
    placeTaste: outingPlaceVerdict(character, bond, outing.place),
    busy: busy,
    counterAt: busy ? nextFreePlanSlot(state, character, outing.place, outing.at) : null,
    roll: seededRandom(
      state.seed,
      character.id,
      String(clockFromMinutes(state.minutes).dayIndex),
      outing.place,
      String(outing.at),
      outing.kind,
      "invite",
    ),
    blockedUntil: bond.inviteNo ?? 0,
    at: state.minutes,
    couple: couple ? (characterOf(state, couple.a === character.id ? couple.b : couple.a)?.name ?? "someone") : null,
  });
}
function takeTheirPlan(state, characterId, plan, { by = "them" } = {}) {
  if (
    !planStillFits(state, {
      ...plan,
      characterId: characterId,
    })
  ) {
    return null;
  }
  let created = createGroupPlan(state, {
    characterId: characterId,
    kind: plan.kind,
    place: plan.place,
    at: plan.at,
    by: by,
    with: (plan.with ?? []).filter((id) => characterOf(state, id) && !planWith(state, id)),
  });
  if (plan.friendOf && created.with?.length) {
    created.friendOf = true;
  }
  return created;
}
function scenePlans(state, characterId) {
  let bond = bondOf(state, characterId);
  if (!bond || !hasMet2(state, characterId) || planWith(state, characterId) || activePlans(state).length >= MAX_PLANS) {
    return null;
  }
  let kinds = INVITABLE_OUTING_KINDS.filter((kind) => canInviteToOuting(bond, kind).ok);
  if (!kinds.length) {
    return null;
  }
  let today = clockFromMinutes(state.minutes).dayIndex,
    days = Array.from(
      {
        length: PLAN_DAYS_AHEAD,
      },
      (unused, offset) => ({
        key: `d${offset}`,
        d: today + offset,
        label:
          offset === 0
            ? "today"
            : offset === 1
              ? "tomorrow"
              : `${clockFromMinutes((today + offset) * PLAN_DAY_MINUTES).weekday} ${clockFromMinutes((today + offset) * PLAN_DAY_MINUTES).day}`,
      }),
    ),
    places = availableOutingPlaces(state.town, kinds.includes("date") ? "date" : "hang")
      .filter(
        (placeId) =>
          (!outingPlaceHome(placeId) && !placeShutForPlans(state, placeId)) ||
          (outingPlaceHome(placeId) === "yours" && comesOver(state, bond)),
      )
      .map((placeId) => ({
        id: placeId,
        name: planPlaceName(state, {
          place: placeId,
          characterId: characterId,
        }),
        hangOnly: OUTING_PLACES[placeId].only === "hang",
        hours: townPlace(state.town, placeId)
          ? `${formatHourLabel(townPlace(state.town, placeId).open)}\u2013${formatHourLabel(townPlace(state.town, placeId).close)}`
          : "",
      }));
  return {
    kinds: kinds,
    days: days,
    places: places,
    taken: blockedPlanHours(state, characterId, days),
  };
}
function theirConflictAt(state, characterId, at) {
  let theirName = nameFor(state, characterOf(state, characterId)),
    party = partyBusy(state, characterId, at);
  if (party === "Their party") {
    return `${theirName}'s party`;
  }
  if (party && party !== "Your party") {
    return party;
  }
  let yours = yourBusy(state, at, {
    shift: false,
  });
  return yours
    ? /^Your /.test(yours)
      ? `the player's ${yours.slice(5).toLowerCase()}`
      : / party$/.test(yours)
        ? "a party"
        : "a plan"
    : "";
}
function blockedPlanHours(state, characterId, days) {
  let blocks = [];
  for (let day of days) {
    for (let hour = 8; hour <= 22; hour++) {
      let conflict = theirConflictAt(state, characterId, day.d * PLAN_DAY_MINUTES + hour * 60),
        lastBlock = blocks.at(-1);
      if (conflict) {
        if (lastBlock && lastBlock.key === day.key && lastBlock.why === conflict && lastBlock.to === hour) {
          lastBlock.to = hour + 1;
        } else {
          blocks.push({
            key: day.key,
            label: day.label,
            from: hour,
            to: hour + 1,
            why: conflict,
          });
        }
      }
    }
  }
  return blocks;
}
function cleanScenePlan(state, characterId, raw, options) {
  if (!options || !raw || typeof raw != "object") {
    return null;
  }
  let kind = String(raw.kind ?? "")
      .trim()
      .toLowerCase(),
    place = String(raw.place ?? "").trim(),
    day = options.days.find((dayOption) => dayOption.key === String(raw.day ?? "").trim()),
    hour = Math.trunc(Number(raw.hour));
  return !options.kinds.includes(kind) ||
    !day ||
    !options.places.some((placeOption) => placeOption.id === place && !(kind === "date" && placeOption.hangOnly)) ||
    !hoursFor(state, place, day.d).includes(hour) ||
    theirConflictAt(state, characterId, day.d * PLAN_DAY_MINUTES + hour * 60)
    ? null
    : {
        kind: kind,
        place: place,
        at: day.d * PLAN_DAY_MINUTES + hour * 60,
        characterId: characterId,
      };
}
function scenePlansBlock(options, { who = "they", field = "plan" } = {}) {
  return options
    ? [
        `THE OUTINGS THE GAME CAN KEEP: a ${options.kinds.map((kind) => (kind === "date" ? "date" : "hang out")).join(" or a ")}, at one of these places, at an hour it is open (an hour before it closes at the latest), between 08:00 and 22:00:`,
        options.places
          .map(
            (place) =>
              `${place.id} (${place.name}${place.hours ? `, ${place.hours}` : ""}${place.hangOnly ? ", as friends only" : ""})`,
          )
          .join(" \xB7 "),
        `Days: ${options.days.map((day) => `${day.key} (${day.label})`).join(" \xB7 ")}.`,
        (options.taken ?? []).length
          ? `Already taken, never at these hours: ${options.taken.map((block) => `${block.key} ${formatHourLabel(block.from)}\u2013${formatHourLabel(block.to)} (${block.why})`).join(" \xB7 ")}.`
          : "",
        `If ${who} set one of these, fill \`${field}\`: {"kind":"${options.kinds.join("|")}","place":"<id>","day":"<d0\u2026d6>","hour":<8\u201322>}; otherwise leave it {}. Nothing else can be fixed: no other place, day or hour.`,
      ].filter(Boolean).join(`
`)
    : "";
}
function atPlanMeetingPlace(state, plan) {
  if (outingPlaceHome(plan.place) === "yours") {
    return state.at === "home" && !state.visit;
  }
  if (outingPlaceHome(plan.place) === "theirs") {
    let character = characterOf(state, plan.characterId);
    return character && sharesYourDoor(state, character)
      ? state.at === "home" && !state.visit
      : state.visit
        ? state.visit.characterId === plan.characterId
        : !!character?.residence && state.at === character.residence.place;
  }
  return state.at === plan.place && !state.visit;
}
function outingStartBlocker(state, plan) {
  if (sceneBusyReason(state) || state.outing) {
    return sceneBusyReason(state) || "You are already out.";
  }
  let blocker = ownPartyBlocksReason(state) || sayGoodbyeFirstReason(state);
  return (
    blocker ||
    (state.guest &&
    outingPlaceHome(plan.place) === "yours" &&
    ![plan.characterId, ...(plan.with ?? [])].includes(state.guest.characterId)
      ? `${nameFor(state, characterOf(state, state.guest.characterId))} is still here: see them out first.`
      : "")
  );
}
var PLAN_SOON_MINUTES = 60;
function planStrip(state) {
  let today = clockFromMinutes(state.minutes).dayIndex,
    items = [];
  for (let plan of activePlans(state)) {
    if (plan.status !== "set" || clockFromMinutes(plan.at).dayIndex !== today) {
      continue;
    }
    let here = atPlanMeetingPlace(state, plan),
      lateBy = state.minutes - plan.at,
      planState = lateBy > OUTING_LATENESS.ok ? "late" : lateBy >= 0 ? "ready" : "upcoming";
    items.push({
      ...planView(state, plan),
      here: here,
      state: planState,
      late: Math.max(0, lateBy),
      pickUpBy: here ? null : pickUpView(state, plan),
      onTimeUntil: formatClockTime(plan.at + OUTING_LATENESS.ok),
      leavesAt: formatClockTime(plan.at + OUTING_LATENESS.leaves),
      canStart: here && lateBy >= 0 && !outingStartBlocker(state, plan),
      canWait: here && lateBy < 0 && plan.at - state.minutes <= 120 && !outingStartBlocker(state, plan),
    });
    let item = items.at(-1),
      leaveAt = plan.at - (item.pickUpBy?.minutes ?? 0);
    item.big =
      item.canStart || item.canWait || planState !== "upcoming" || leaveAt - state.minutes <= PLAN_SOON_MINUTES;
  }
  items.push(...partyStripItems(state));
  return items.sort((itemA, itemB) => itemA.at - itemB.at);
}
function waitForPlan(state, planId) {
  let plan = activePlans(state).find((candidate) => candidate.id === planId && candidate.status === "set");
  if (!plan || !atPlanMeetingPlace(state, plan)) {
    return {
      ok: false,
      reason: "That plan is not here.",
    };
  }
  let blocker = outingStartBlocker(state, plan);
  if (blocker) {
    return {
      ok: false,
      reason: blocker,
    };
  }
  let wait = plan.at - state.minutes;
  if (wait <= 0 || wait > 120) {
    return {
      ok: false,
      reason: "Nothing to wait for.",
    };
  }
  let { events: events } = advanceTime(state, wait);
  return {
    ok: true,
    minutes: wait,
    events: events,
  };
}

export {
  AT_YOURS_SHARE,
  PLAN_SOON_MINUTES,
  activePlans,
  answerCounter,
  appointments,
  askPlanVerdict,
  atPlanMeetingPlace,
  bestPresent,
  busyForPlans,
  busyWhy,
  cancelPlan,
  cleanScenePlan,
  comesOver,
  createGroupPlan,
  dreamTick,
  hoursFor,
  inviteInfo,
  invitePlan,
  inviteWhy,
  kindNameOf,
  outingAbout,
  outingStartBlocker,
  partyBusy,
  partyThen,
  planPlaceName,
  planStillFits,
  planStrip,
  planView,
  planWith,
  plansAhead,
  plansTick,
  plansView,
  scenePlans,
  scenePlansBlock,
  takeTheirPlan,
  theirOuting,
  timesAt,
  waitForPlan,
  weddingNow,
  yourBusy,
};
