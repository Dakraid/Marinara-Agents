// Sleep, waking, knocking, home visits, doing things together, staying the night
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { weekSpanAt } from "../schedule/week-grid.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { addSkillXp } from "../skills/skill-levels.mjs";
import { COOKING_XP_BY_QUALITY } from "../skills/skill-perks.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import {
  applyBondAction,
  bondKind,
  bondSummary,
  bondTier,
  bondTierName,
  hasMet,
  markTraitsSeen,
  recordNovelty,
} from "../relationships/bonds.mjs";
import { cookDishIntoFridge } from "../items/cooking.mjs";
import { listRecipesForKitchen } from "../inventory/piles-and-cooking.mjs";
import { dateTasteVerdict, dateTastesFor } from "../outings/date-tastes.mjs";
import {
  KNOCK_FRIENDSHIP_TIER,
  KNOCK_MINUTES,
  STAY_OVER_ACTIVITY,
  WAKE_UP_MINUTES,
  WOKEN_GRACE_MINUTES,
  buildHomeActivities,
  decideDoorInvite,
  stayOverBlockedReason,
  theirThingFor,
  wakeReactionFor,
  wakeRiskHint,
} from "./home-visits.mjs";
import { SLEEP_ENERGY_PER_HOUR, checkEnergyFor, refillNeeds } from "../needs/needs.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { knownAboutCharacter, knownTraitWord } from "../people/people-sheet.mjs";
import { cleanSleepMinutes, sleepOptions } from "../sleep/sleep-options.mjs";
import { firstModuleHook } from "../modules/module-registry.mjs";
import { GUEST_NIGHT_FROM, guestDid, guestOver } from "../social/guest-visits.mjs";
import { plansTodayNotice } from "../outings/outing.mjs";
import {
  leaveTheirPartyIfAny,
  ownPartyBlocksReason,
  partyGuestUntil,
  partyGuestsHere,
  sayGoodbyeFirstReason,
} from "../parties/party.mjs";
import { hasFriendPerk, perkTierOf, tellsTheirWeek } from "../relationships/friend-perks.mjs";
import { ROUGH_BED_QUALITY, lodgingKindOf, streetSpotOf } from "../home/residence.mjs";
import { bedQualityOf, furnitureLevel, homeHasFurniture } from "../home/furniture-and-wardrobe.mjs";
import { cookingHandOf, eatDish, planCookFor, serveCookedDish, theirDish } from "../things/things-actions.mjs";
import { pronounOf } from "../romance/romanceability.mjs";
import { workHomeUntil, workingHome } from "../cast/working-now.mjs";
import { travelFor } from "../travel/vehicles-rides.mjs";
import {
  LEAVING_HORIZON,
  advanceTime,
  characterOf,
  eventsCutShort,
  hasFaintedEvent,
  hasMet2,
  isCharacterHere,
  logNote,
  npcNameAside,
  peopleHere,
  sceneBusyReason,
  sharesYourDoor,
  skillLevelsOf,
  sleepBlockedReason,
  traitsOf,
  whereOpts,
} from "../game.mjs";

var ensureSleepBook = (state) =>
  (state.sleep ??= {
    up: {},
    woken: {},
  });
var upUntil = (state, characterId) => state.sleep?.up?.[characterId] ?? 0;
function isAsleep(state, characterId) {
  let character = characterOf(state, characterId);
  if (!character || character.away) {
    return false;
  }
  let whereabouts2 = whereaboutsOf(character, state.minutes, whereOpts(state));
  return whereabouts2.place === "home" && whereabouts2.sleep === true && upUntil(state, characterId) <= state.minutes;
}
function sleepEndsAt(state, character, minutes = state.minutes) {
  let hourMark = (Math.floor(minutes / 60) + 1) * 60,
    limit = minutes + 1440;
  for (; hourMark < limit && whereaboutsOf(character, hourMark, whereOpts(state)).sleep;) {
    hourMark += 60;
  }
  return hourMark;
}
function upAtHomeUntil(state, characterId) {
  let character = characterOf(state, characterId);
  if (!character) {
    return {
      at: state.minutes,
      reason: "leaves",
    };
  }
  if (state.guest?.characterId === characterId) {
    return {
      at: state.guest.until,
      reason: "leaves",
    };
  }
  if (partyGuestUntil(state, characterId) !== null) {
    return {
      at: partyGuestUntil(state, characterId),
      reason: "leaves",
    };
  }
  let opts = whereOpts(state);
  if (workingHome(state, character, state.minutes, opts)) {
    return {
      at: state.minutes,
      reason: "work",
      until: workHomeUntil(state, character),
    };
  }
  let whereabouts2 = whereaboutsOf(character, state.minutes, opts),
    hourMark = (Math.floor(state.minutes / 60) + 1) * 60;
  if (whereabouts2.place === "home" && whereabouts2.sleep) {
    let upAt = upUntil(state, characterId);
    if (upAt > state.minutes && whereaboutsOf(character, upAt, opts).sleep) {
      return {
        at: upAt,
        reason: "sleep",
      };
    }
    hourMark = Math.max(hourMark, sleepEndsAt(state, character));
  }
  let horizon = state.minutes + LEAVING_HORIZON;
  for (; hourMark < horizon; hourMark += 60) {
    let whereabouts3 = whereaboutsOf(character, hourMark, opts);
    if (workingHome(state, character, hourMark, opts)) {
      return {
        at: hourMark,
        reason: "work",
      };
    }
    if (whereabouts3.place !== "home") {
      return {
        at: hourMark,
        reason: "leaves",
      };
    }
    if (whereabouts3.sleep) {
      return {
        at: hourMark,
        reason: "sleep",
      };
    }
  }
  return {
    at: null,
    reason: "stays",
  };
}
var wokenToday = (state, characterId) => {
  let woken = state.sleep?.woken?.[characterId];
  return woken && woken.day === clockFromMinutes(state.minutes).dayIndex ? woken.n : 0;
};
function wakeOutcome(state, characterId) {
  let bond = state.bonds[characterId],
    hour = clockFromMinutes(state.minutes).hour,
    timesToday = wokenToday(state, characterId),
    outcome = wakeReactionFor({
      temper: TRAIT_BEHAVIOURS.wakeTemper(traitsOf(state, characterId)),
      hour: hour,
      timesToday: timesToday,
    }),
    temperWord = bond
      ? knownTraitWord(knownAboutCharacter(bond, state.rules?.showArchetypes ?? "found"), ["temper"])
      : "";
  return {
    outcome: outcome,
    why: wakeRiskHint({
      word: temperWord,
      hour: hour,
      timesToday: timesToday,
    }),
  };
}
function sleepState(state, characterId) {
  let character = characterOf(state, characterId);
  if (!character) {
    return {};
  }
  if (isAsleep(state, characterId)) {
    let { outcome: outcome, why: why } = wakeOutcome(state, characterId);
    return {
      asleep: {
        until: formatClockTime(sleepEndsAt(state, character)),
        wake: {
          hint: outcome.hint,
          why: why,
          minutes: WAKE_UP_MINUTES,
        },
      },
    };
  }
  let whereabouts2 = whereaboutsOf(character, state.minutes, whereOpts(state)),
    upAt = upUntil(state, characterId);
  return whereabouts2.place === "home" && whereabouts2.sleep && upAt > state.minutes
    ? {
        woken: {
          back: formatClockTime(upAt),
        },
      }
    : {};
}
function wakeNow(state, characterId, outcome, { door = false } = {}) {
  let sleepBook = ensureSleepBook(state);
  sleepBook.woken[characterId] = {
    day: clockFromMinutes(state.minutes).dayIndex,
    n: wokenToday(state, characterId) + 1,
  };
  let { events: events } = advanceTime(state, WAKE_UP_MINUTES);
  if (eventsCutShort(events)) {
    return {
      events: events,
      applied: {
        friendship: 0,
        romance: 0,
        trust: 0,
      },
      fainted: true,
    };
  }
  sleepBook.up[characterId] = state.minutes + WOKEN_GRACE_MINUTES;
  let bond = state.bonds[characterId],
    gains = Object.fromEntries(
      ["friendship", "trust"].filter((axis) => outcome[axis]).map((axis) => [axis, outcome[axis]]),
    ),
    result = Object.keys(gains).length
      ? applyBondAction(
          bond,
          {
            action: "woken",
            ...gains,
          },
          {
            at: state.minutes,
            note: `woken: ${outcome.key}`,
            today: false,
          },
        )
      : {
          applied: {
            friendship: 0,
            romance: 0,
            trust: 0,
          },
        };
  state.moment = {
    kind: door ? "door" : "wake",
    characterId: characterId,
    outcome: outcome.key,
    door: door,
    at: state.minutes,
  };
  markTraitsSeen(state.bonds[characterId], "temper");
  return {
    events: events,
    applied: result.applied,
  };
}
function wakeUp(state, characterId) {
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
  if (!isAsleep(state, characterId)) {
    return {
      ok: false,
      reason: "They are not asleep.",
    };
  }
  let { outcome: outcome } = wakeOutcome(state, characterId),
    { events: events, applied: applied } = wakeNow(state, characterId, outcome);
  logNote(state, `Woke ${characterOf(state, characterId)?.name ?? npcNameAside(state, characterId)} up`, "social");
  return {
    ok: true,
    outcome: outcome.key,
    name: outcome.name,
    applied: applied,
    minutes: WAKE_UP_MINUTES,
    events: events,
    bond: bondSummary(state.bonds[characterId]),
  };
}
function scheduleKnown(state, character) {
  let mode = state.rules?.showSchedules ?? "found";
  if (mode === "always" || tellsTheirWeek(state, character.id)) {
    return true;
  }
  if (mode === "hidden") {
    return false;
  }
  let span = weekSpanAt(character.week ?? [], state.minutes),
    clock = clockFromMinutes(state.minutes),
    seen = state.seenSchedule?.[character.id] ?? {};
  return !!span && (seen[`${clock.weekdayIndex}:${span.from}`] || seen[`${(clock.weekdayIndex + 6) % 7}:${span.from}`]);
}
function knockAllowed(state, character) {
  let bond = state.bonds[character.id];
  if (!bond || !hasMet(bond)) {
    return {
      ok: false,
      why: "",
    };
  }
  let tier = bondTier(bond, "friendship");
  return perkTierOf(bond) < KNOCK_FRIENDSHIP_TIER
    ? {
        ok: false,
        why: `once you are ${bondKind(bond) === "family" ? "closer" : "friends"} (you are ${bondTierName(bond, "friendship", tier)} now)`,
      }
    : {
        ok: true,
        why: "",
      };
}
function doorState(state, door) {
  if (door.stranger) {
    return door;
  }
  let asleep = door.inNow.filter((id) => id !== "you" && isAsleep(state, id)),
    knownAsleep = asleep.filter((id) => scheduleKnown(state, characterOf(state, id))),
    result = {
      ...door,
      asleep: knownAsleep,
      quiet: asleep.filter((id) => !knownAsleep.includes(id)),
    };
  if (!door.mine) {
    let resident = characterOf(state, door.residents[0]?.id),
      awake = door.inNow.filter((id) => !asleep.includes(id)),
      workingUntil =
        resident && awake.includes(resident.id) && workingHome(state, resident)
          ? formatClockTime(workHomeUntil(state, resident))
          : "";
    if (resident) {
      result.knock = {
        ...knockAllowed(state, resident),
        character: resident.id,
        wakes: door.inNow.length > 0 && !awake.length && knownAsleep.length > 0,
        key: hasFriendPerk(state, resident.id, "key") && awake.includes(resident.id),
        ...(workingUntil
          ? {
              working: workingUntil,
            }
          : {}),
      };
    }
  }
  return result;
}
var atDoorOf = (state, place) =>
  state.at === place ||
  (state.at === "home" && state.residence?.place === place) ||
  (!!state.visit && !state.visit.party && characterOf(state, state.visit.characterId)?.residence?.place === place);
var cutShort = (events) => (hasFaintedEvent(events) ? "fainted" : eventsCutShort(events) ? "wedding" : "");
function knockOnDoor(state, characterId) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  if (ownPartyBlocksReason(state)) {
    return {
      ok: false,
      reason: ownPartyBlocksReason(state),
    };
  }
  if (sayGoodbyeFirstReason(state)) {
    return {
      ok: false,
      reason: sayGoodbyeFirstReason(state),
    };
  }
  let character = characterOf(state, characterId);
  if (!character || character.away || !character.residence) {
    return {
      ok: false,
      reason: "They do not live here.",
    };
  }
  let place = character.residence.place;
  if (!atDoorOf(state, place)) {
    return {
      ok: false,
      reason: "You are not at their door.",
    };
  }
  if (sharesYourDoor(state, character)) {
    return {
      ok: false,
      reason: "That is your own door.",
    };
  }
  let allowed = knockAllowed(state, character);
  if (!allowed.ok) {
    return {
      ok: false,
      reason: allowed.why ? `You can knock ${allowed.why}.` : "You do not know them well enough.",
    };
  }
  let goodbye = leaveTheirPartyIfAny(state),
    withGoodbye = (events2) => (goodbye ? [goodbye, ...events2] : events2);
  state.visit = null;
  state.at = place;
  let home = whereaboutsOf(character, state.minutes, whereOpts(state)).place === "home";
  if ((logNote(state, `Knocked on ${character.name}'s door`, "social"), !home)) {
    let { events: events2 } = advanceTime(state, KNOCK_MINUTES);
    return {
      ok: true,
      answer: cutShort(events2) || "out",
      events: withGoodbye(events2),
    };
  }
  let wake = null,
    applied = null,
    events;
  if (isAsleep(state, characterId)) {
    let { outcome: outcome } = wakeOutcome(state, characterId);
    if (seededRandom(state.seed, characterId, String(state.minutes), "knock") >= outcome.opens) {
      ensureSleepBook(state).woken[characterId] = {
        day: clockFromMinutes(state.minutes).dayIndex,
        n: wokenToday(state, characterId) + 1,
      };
      let { events: events2 } = advanceTime(state, WAKE_UP_MINUTES);
      return {
        ok: true,
        answer: cutShort(events2) || "no-answer",
        events: withGoodbye(events2),
      };
    }
    ({ events: events, applied: applied } = wakeNow(state, characterId, outcome, {
      door: true,
    }));
    wake = outcome;
  } else {
    ({ events: events } = advanceTime(state, KNOCK_MINUTES));
  }
  if (((events = withGoodbye(events)), eventsCutShort(events))) {
    return {
      ok: true,
      answer: cutShort(events),
      events: events,
    };
  }
  let upAt = upAtHomeUntil(state, characterId),
    bond = state.bonds[characterId],
    invite = decideDoorInvite({
      bond: bond,
      traits: traitsOf(state, characterId),
      word: knownTraitWord(knownAboutCharacter(bond, state.rules?.showArchetypes ?? "found"), [
        "open",
        "reserved",
        "shy",
        "proud",
      ]),
      minutesLeft: upAt.at === null ? 1 / 0 : upAt.at - state.minutes,
      leaveReason: upAt.reason,
      leavesAt: upAt.at === null ? "" : formatClockTime(upAt.at),
      workingUntil: upAt.until ? formatClockTime(upAt.until) : "",
      wokeBadly: !!wake && wake.key !== "fine",
      roll: seededRandom(state.seed, characterId, String(clockFromMinutes(state.minutes).dayIndex), "invite"),
    });
  if (invite.home) {
    markTraitsSeen(bond, "open", invite.yes ? null : TRAIT_BEHAVIOURS.keepsHome(traitsOf(state, characterId)));
  }
  state.visit = {
    characterId: characterId,
    stage: "door",
    invite: invite,
    at: state.minutes,
  };
  state.moment = {
    kind: "door",
    characterId: characterId,
    outcome: wake?.key ?? null,
    invite: invite,
    at: state.minutes,
  };
  return {
    ok: true,
    answer: "door",
    woke: wake
      ? {
          key: wake.key,
          name: wake.name,
        }
      : null,
    applied: applied,
    invite: invite,
    events: events,
  };
}
function enterVisit(state) {
  let visit = state.visit;
  return visit?.stage !== "door"
    ? {
        ok: false,
        reason: "You are not at anybody's door.",
      }
    : visit.invite?.yes
      ? visitOver(state)
        ? {
            ok: false,
            reason: "They are not at home any more.",
          }
        : workingHome(state, visit.characterId)
          ? {
              ok: false,
              reason: `Working until ${formatClockTime(workHomeUntil(state, visit.characterId))}.`,
            }
          : ((visit.stage = "inside"),
            (visit.since = state.minutes),
            (visit.did = []),
            logNote(state, `Went into ${characterOf(state, visit.characterId)?.name ?? ""}'s home`, "move"),
            {
              ok: true,
            })
      : {
          ok: false,
          reason: "They have not asked you in.",
        };
}
function visitGoodbye(state, visit, why) {
  if (visit?.stage !== "inside") {
    return null;
  }
  let character = characterOf(state, visit.characterId),
    since = visit.since ?? visit.at ?? state.minutes;
  state.moment = {
    kind: "goodbye",
    characterId: visit.characterId,
    why: why,
    since: since,
    did: visit.did ?? [],
    at: state.minutes,
  };
  return {
    characterId: visit.characterId,
    name: character?.name ?? "",
    why: why,
    from: since,
    minutes: state.minutes - since,
    did: visit.did ?? [],
  };
}
function leaveVisit(state) {
  if (!state.visit) {
    return {
      ok: false,
      reason: "You are not at anybody's door.",
    };
  }
  if (state.visit.party && state.party) {
    return {
      ok: false,
      reason: sayGoodbyeFirstReason(state) || "Say goodbye first.",
    };
  }
  let goodbye = visitGoodbye(state, state.visit, "you");
  state.visit = null;
  return {
    ok: true,
    goodbye: goodbye,
  };
}
function visitOver(state, { goodbye: withGoodbye = true } = {}) {
  let visit = state.visit;
  if (
    !visit ||
    visit.staying === "night" ||
    (visit.staying && state.scene?.characterId === visit.characterId) ||
    (visit.party && state.party?.id === visit.party)
  ) {
    return null;
  }
  let character = characterOf(state, visit.characterId),
    whereabouts2 = character && !character.away ? whereaboutsOf(character, state.minutes, whereOpts(state)) : null,
    working = visit.stage === "inside" && workingHome(state, character);
  if (whereabouts2?.place === "home" && !working && !isAsleep(state, visit.characterId)) {
    return null;
  }
  let why = working ? "work" : whereabouts2?.place === "home" ? "bed" : "out",
    goodbye = withGoodbye ? visitGoodbye(state, visit, why) : null;
  state.visit = null;
  let name = character?.name ?? "They";
  return {
    id: "visit-over",
    characterId: visit.characterId,
    goodbye: goodbye,
    text: goodbye
      ? ""
      : why === "bed"
        ? `${name} is off to bed. You are back in the corridor.`
        : why === "work"
          ? `${name} has to work now, and walks you to the door.`
          : `${name} has to head out, and walks you to the door.`,
  };
}
function visitView(state) {
  let visit = state.visit;
  if (!visit) {
    return null;
  }
  let character = characterOf(state, visit.characterId),
    upAt = upAtHomeUntil(state, visit.characterId),
    doorWords = {
      houses: "House",
      mansions: "Mansion",
      tower: "Flat",
      apartments: "Apartment",
    };
  return {
    characterId: visit.characterId,
    name: character?.name ?? "",
    stage: visit.stage,
    invite: visit.invite
      ? {
          ...visit.invite,
          fixed: true,
        }
      : null,
    place: character?.residence?.place ?? null,
    unit: character?.residence?.unit ?? "",
    house: character?.residence?.place === "houses",
    door: doorWords[character?.residence?.place] ?? "Apartment",
    until: upAt.at === null ? "" : formatClockTime(upAt.at),
    reason: upAt.reason,
  };
}
function cookWhy(state) {
  let recipes = listRecipesForKitchen(state.things, {
    kitchen: furnitureLevel(state, "kitchen"),
    atHome: true,
    level: skillLevelsOf(state).cooking ?? 0,
  });
  return recipes.some((recipe) => recipe.available) ? "" : (recipes[0]?.why ?? "Nothing to cook");
}
function togetherActivities(state) {
  let inside = state.visit?.stage === "inside";
  return (
    inside
      ? [state.visit.characterId]
      : state.at === "home" && !state.visit && !state.party
        ? peopleHere(state)
            .map((person) => person.id)
            .filter((id) => !partyGuestsHere(state).includes(id))
        : []
  )
    .filter((id) => hasMet2(state, id) && !isAsleep(state, id))
    .map((characterId) => {
      let bond = state.bonds[characterId],
        name = characterOf(state, characterId)?.name ?? "",
        upAt = upAtHomeUntil(state, characterId),
        cookMinutes = inside
          ? null
          : Math.min(
              ...listRecipesForKitchen(state.things, {
                kitchen: furnitureLevel(state, "kitchen"),
                atHome: true,
                level: skillLevelsOf(state).cooking ?? 0,
              })
                .filter((recipe) => recipe.available)
                .map((recipe) => recipe.minutes),
            ),
        items = buildHomeActivities(bond, theirThingFor(characterOf(state, characterId), bond), {
          cookMinutes: Number.isFinite(cookMinutes) ? cookMinutes : null,
          minutesLeft: upAt.at === null ? 1 / 0 : upAt.at - state.minutes,
          busy: upAt.until ? `Working until ${formatClockTime(upAt.until)}` : "",
          cook: inside ? "" : cookWhy(state),
          whose: inside ? `${name}'s` : "your",
          cooks:
            cookingHandOf(state, characterId) > 0 &&
            [
              [12, 14],
              [19, 22],
            ].some(
              ([from, to]) => clockFromMinutes(state.minutes).hour >= from && clockFromMinutes(state.minutes).hour < to,
            ) &&
            (inside ||
              !!theirDish(state, characterId, {
                atYours: true,
              })),
          homeSlots: inside
            ? []
            : ["pool", "garden", "bar", "console", "gym"].filter((slot) => homeHasFurniture(state, slot)),
        }),
        guest = !inside && state.guest?.characterId === characterId,
        stayWhy = (turnsIn) =>
          firstModuleHook(state, "stayWhy", bond, {
            turnsIn: turnsIn,
          })?.why ??
          stayOverBlockedReason(bond, {
            turnsIn: turnsIn,
          }),
        nightTime =
          clockFromMinutes(state.minutes).hour >= GUEST_NIGHT_FROM || clockFromMinutes(state.minutes).hour < 4,
        stayBlocked = inside
          ? stayWhy(upAt.reason === "sleep")
          : guest
            ? stayWhy(true) || (nightTime ? "" : `From ${GUEST_NIGHT_FROM}:00`)
            : null,
        foods = Object.entries(bond?.dateFound?.food ?? {}),
        working = workingHome(state, characterId);
      return {
        characterId: characterId,
        name: name,
        until: working
          ? formatClockTime(workHomeUntil(state, characterId))
          : upAt.at === null
            ? ""
            : formatClockTime(upAt.at),
        reason: working ? "working" : upAt.reason,
        items: items,
        kitchen: inside
          ? null
          : {
              left: upAt.at === null ? null : upAt.at - state.minutes,
              likes: foods.filter(([, verdict]) => verdict === "liked").map(([verdict]) => verdict),
              dislikes: foods.filter(([, verdict]) => verdict === "disliked").map(([verdict]) => verdict),
            },
        stay:
          inside ||
          (guest &&
            (nightTime ||
              state.guest.until > clockFromMinutes(state.minutes).dayIndex * 24 * 60 + GUEST_NIGHT_FROM * 60))
            ? {
                ok: !stayBlocked,
                why: stayBlocked,
                until:
                  upAt.reason === "sleep"
                    ? formatClockTime(sleepEndsAt(state, characterOf(state, characterId), upAt.at))
                    : "",
              }
            : null,
        guest: guest,
      };
    });
}
function doTogether(state, characterId, key, { recipe = null } = {}) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  let together = togetherActivities(state).find((entry) => entry.characterId === characterId);
  if (!together) {
    return {
      ok: false,
      reason: "They are not here to do it with you.",
    };
  }
  let item = together.items.find((item2) => item2.key === key);
  if (!item) {
    return {
      ok: false,
      reason: "That is not something to do together.",
    };
  }
  if (!item.available) {
    return {
      ok: false,
      reason: `${item.why}.`,
    };
  }
  let skills = skillLevelsOf(state),
    energyCheck = checkEnergyFor(state.needs, {
      energy: 0,
    });
  if (!energyCheck.ok) {
    return {
      ok: false,
      reason: energyCheck.reason,
    };
  }
  let home = state.visit ? "theirs" : sharesYourDoor(state, characterOf(state, characterId)) ? "shared" : "yours",
    bond = state.bonds[characterId],
    character = characterOf(state, characterId),
    foodTastes = dateTastesFor(character, bond.archetype).food,
    cookPlan = null,
    dish = null;
  if (item.kitchen) {
    let upAt = upAtHomeUntil(state, characterId);
    if (
      ((cookPlan = planCookFor(state, recipe, {
        minutesLeft: upAt.at === null ? 1 / 0 : upAt.at - state.minutes,
      })),
      !cookPlan.ok)
    ) {
      return {
        ok: false,
        reason: cookPlan.reason === "No such recipe." ? "Pick what to cook." : cookPlan.reason,
      };
    }
    dish = {
      name: cookPlan.recipe.name,
      icon: cookPlan.recipe.icon,
      quality: cookPlan.quality,
      taste: cookPlan.recipe.taste,
      by: "both",
    };
  } else if (item.food) {
    let cooked = theirDish(state, characterId, {
      likes: foodTastes?.likes,
      dislikes: foodTastes?.dislikes,
      salt: String(state.minutes),
      atYours: !state.visit,
    });
    if (!cooked) {
      return {
        ok: false,
        reason: "Nothing in your kitchen to cook with.",
      };
    }
    dish = {
      name: cooked.recipe.name,
      icon: cooked.recipe.icon,
      quality: cooked.quality,
      taste: cooked.recipe.taste,
      by: key === "cook" ? "both" : "them",
      made: cooked,
    };
  }
  if (dish) {
    dish.verdict = dateTasteVerdict(dateTastesFor(character, bond.archetype), "food", dish.taste);
  }
  let minutes = cookPlan ? cookPlan.recipe.minutes : item.minutes,
    from = state.minutes;
  if (state.visit) {
    state.visit.did = [...(state.visit.did ?? []), item.name];
  }
  guestDid(state, characterId, item.name);
  let { events: events } = advanceTime(state, minutes);
  if (eventsCutShort(events)) {
    return {
      ok: true,
      item: item,
      minutes: minutes,
      from: from,
      applied: {
        friendship: 0,
        romance: 0,
        trust: 0,
      },
      limits: {},
      gains: {},
      levelled: [],
      events: events,
      bond: bondSummary(bond),
      cut: true,
    };
  }
  if (cookPlan) {
    cookPlan.take();
  } else {
    dish?.made?.take?.();
  }
  if (item.rest) {
    state.needs = refillNeeds(state.needs, {
      energy: item.rest,
      fitness: skills.fitness,
    });
  }
  let served = null;
  if (cookPlan) {
    served = serveCookedDish(state, cookPlan.recipe, cookPlan.quality);
  } else if (dish) {
    eatDish(state, dish.made.dish);
    if (!state.visit && dish.made.recipe.portions > 2) {
      cookDishIntoFridge(state.things, dish.made.recipe, dish.made.quality, dish.made.recipe.portions - 2);
    }
  }
  let tasteBonus = dish
      ? (dish.verdict === "liked" ? 2 : dish.verdict === "disliked" ? -1 : 0) +
        (dish.quality === "great" ? 1 : dish.quality === "burnt" ? -1 : 0)
      : 0,
    bondGains = {
      ...item.bonds,
      ...(tasteBonus
        ? {
            friendship: Math.max(0, (item.bonds.friendship ?? 0) + tasteBonus),
          }
        : {}),
    },
    result = applyBondAction(
      bond,
      {
        action: item.action,
        ...bondGains,
      },
      {
        at: state.minutes,
        charm: skills.charm,
        note: item.name,
        today: false,
      },
    );
  if (!(bond.doneTogether ?? []).includes(key)) {
    bond.doneTogether = [...(bond.doneTogether ?? []), key];
    recordNovelty(bond, state.minutes);
  }
  let skillGains = {
      ...item.skills,
      ...(dish && !cookPlan && key === "cook"
        ? {
            cooking: 4,
          }
        : {}),
    },
    levelled = [...(served?.levelled ?? []), ...addSkillXp(state.skills, skillGains)],
    { made: made, ...dish2 } = dish ?? {};
  state.moment = {
    kind: "together",
    characterId: characterId,
    key: key,
    name: item.name,
    minutes: minutes,
    home: home,
    at: state.minutes,
    ...(dish
      ? {
          dish: dish2,
        }
      : {}),
  };
  logNote(state, `${item.name} with ${together.name} (${minutes} min)`, "social");
  return {
    ok: true,
    item: item,
    minutes: minutes,
    from: from,
    applied: result.applied,
    limits: result.limits ?? {},
    gains: {
      ...skillGains,
      ...(cookPlan
        ? {
            cooking: COOKING_XP_BY_QUALITY[cookPlan.quality],
          }
        : {}),
    },
    levelled: levelled,
    events: events,
    bond: bondSummary(bond),
    ...(dish
      ? {
          dish: {
            ...dish2,
            kept: served?.kept ?? 0,
          },
        }
      : {}),
  };
}
function stayCheck(state, characterId) {
  if (sceneBusyReason(state)) {
    return {
      ok: false,
      reason: sceneBusyReason(state),
    };
  }
  let here = firstModuleHook(state, "stayHere", characterId);
  if (here) {
    let host2 = characterOf(state, characterId),
      yours = state.guest?.characterId === characterId,
      blocked = yours ? ownPartyBlocksReason(state) : sleepBlockedReason(state);
    return blocked
      ? {
          ok: false,
          reason: blocked,
        }
      : {
          ok: true,
          host: host2,
          until: sleepEndsAt(state, host2, bedtimeOf(state, host2)),
          here: here,
          ...(yours
            ? {
                yours: true,
              }
            : {}),
        };
  }
  let together = togetherActivities(state).find((entry) => entry.characterId === characterId);
  if (!together?.stay) {
    return {
      ok: false,
      reason: "You are not at their place.",
    };
  }
  if (!together.stay.ok) {
    return {
      ok: false,
      reason: `${together.stay.why}.`,
    };
  }
  let host = characterOf(state, characterId);
  return together.guest
    ? {
        ok: true,
        host: host,
        until: sleepEndsAt(state, host, bedtimeOf(state, host)),
        yours: true,
      }
    : {
        ok: true,
        host: host,
        until: sleepEndsAt(state, host, upAtHomeUntil(state, characterId).at),
      };
}
function bedtimeOf(state, character) {
  let opts = whereOpts(state);
  for (let minute = state.minutes; minute < state.minutes + 720; minute += 60) {
    if (whereaboutsOf(character, minute, opts).sleep) {
      return minute;
    }
  }
  return state.minutes;
}
function sleepChoice(state, { characterId = null } = {}) {
  let until = null,
    stay = null,
    rough = !characterId && lodgingKindOf(state) === "street" && state.at === streetSpotOf(state);
  if (characterId) {
    let check = stayCheck(state, characterId);
    if (!check.ok) {
      return check;
    }
    until = check.until;
    stay = {
      id: check.host.id,
      name: check.host.name,
      pronoun: pronounOf(state, check.host.id),
      romance: STAY_OVER_ACTIVITY.romance,
      trust: STAY_OVER_ACTIVITY.trust,
    };
  } else {
    if (state.scene && !state.scene.done) {
      return {
        ok: false,
        reason: "You are in the middle of a scene.",
      };
    }
    if (sleepBlockedReason(state)) {
      return {
        ok: false,
        reason: sleepBlockedReason(state),
      };
    }
    if (state.at !== "home" && !rough) {
      return {
        ok: false,
        reason: "You can only sleep at home.",
      };
    }
  }
  let bedQuality = rough ? ROUGH_BED_QUALITY : bedQualityOf(state),
    walk = travelFor(state, state.at, "office") ?? 0;
  return {
    ok: true,
    ...sleepOptions({
      now: state.minutes,
      needs: state.needs,
      bedQuality: bedQuality,
      fitness: skillLevelsOf(state).fitness,
      job: state.job,
      walk: walk,
      until: until,
      hunger: state.rules?.hunger !== false,
    }),
    walk: walk,
    rate: Math.round(SLEEP_ENERGY_PER_HOUR * bedQuality),
    stay: stay,
  };
}
function stayNight(state, characterId, { minutes: wanted = null } = {}) {
  let check = stayCheck(state, characterId);
  if (!check.ok) {
    return check;
  }
  let host = check.host,
    sleepMinutes =
      wanted === null || Number(wanted) === check.until - state.minutes
        ? check.until - state.minutes
        : (cleanSleepMinutes(wanted) ?? check.until - state.minutes),
    from = state.minutes;
  if (state.visit) {
    state.visit.staying = "night";
  }
  if (check.yours && state.guest) {
    Object.assign(state.guest, {
      staying: true,
      until: from + sleepMinutes,
    });
  }
  let events;
  try {
    ({ events: events } = advanceTime(state, sleepMinutes, {
      asleep: true,
      bedQuality: bedQualityOf(state),
    }));
  } finally {
    if (state.visit) {
      state.visit.staying = false;
    }
    if (state.guest) {
      state.guest.staying = false;
    }
  }
  let over = state.visit
    ? visitOver(state, {
        goodbye: false,
      })
    : state.guest
      ? guestOver(state, {
          goodbye: false,
        })
      : null;
  if (over) {
    events.push(over);
  }
  events.push(...plansTodayNotice(state));
  let bond = state.bonds[characterId];
  if (check.yours && state.at !== "home") {
    logNote(state, `${host.name}'s night at yours was cut short`, "sleep");
    return {
      ok: true,
      minutes: sleepMinutes,
      from: from,
      applied: {
        friendship: 0,
        romance: 0,
        trust: 0,
      },
      events: events,
      slept: true,
      needs: state.needs,
      bond: bondSummary(bond),
      place: townPlace(state.town, state.at)?.name ?? null,
    };
  }
  let result = applyBondAction(
    bond,
    {
      action: STAY_OVER_ACTIVITY.action,
      romance: STAY_OVER_ACTIVITY.romance,
      trust: STAY_OVER_ACTIVITY.trust,
    },
    {
      at: state.minutes,
      charm: skillLevelsOf(state).charm,
      note: "stayed the night",
      today: false,
    },
  );
  state.moment = {
    kind: "stay",
    characterId: characterId,
    at: state.minutes,
    ...(check.here?.words
      ? {
          where: check.here.words,
        }
      : check.yours
        ? {
            where: "at the player's home",
          }
        : {}),
  };
  logNote(
    state,
    `${check.here?.place ? `Stayed the night with ${host.name} \xB7 ${check.here.place}` : check.yours ? `${host.name} stayed the night at yours` : `Stayed the night at ${host.name}'s`} (${Math.round(sleepMinutes / 60)} h)`,
    "sleep",
  );
  return {
    ok: true,
    minutes: sleepMinutes,
    from: from,
    applied: result.applied,
    events: events,
    slept: true,
    needs: state.needs,
    bond: bondSummary(bond),
    place: check.here?.place ?? (check.yours ? "Home" : null),
  };
}

export {
  atDoorOf,
  bedtimeOf,
  doTogether,
  doorState,
  enterVisit,
  isAsleep,
  knockOnDoor,
  leaveVisit,
  sleepChoice,
  sleepEndsAt,
  sleepState,
  stayNight,
  togetherActivities,
  upAtHomeUntil,
  visitOver,
  visitView,
  wakeUp,
};
