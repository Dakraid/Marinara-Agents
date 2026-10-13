// Core life-sim game state: create game, time advance, presence, gifts, talk/interact, activities, travel, scenes, tier steps, key images, rules/settings, cast edits
import {
  clockFromMinutes,
  clockMinutesFromDate,
  daysBetween,
  formatCalendarDate,
  formatClockTime,
  formatHourLabel,
} from "./time/clock.mjs";
import {
  WORK_FROM_HOME_PLACE,
  charactersAtPlace,
  markScheduleSeen,
  seededRandom,
  whereaboutsOf,
} from "./schedule/whereabouts.mjs";
import { jobHolders } from "./jobs/town-jobs.mjs";
import { residenceForHomeKind, validResidencePlace } from "./housing/residence-units.mjs";
import { assignResidences, buildResidenceDirectory, nextFreeUnit } from "./housing/residences.mjs";
import {
  advanceEventBeat,
  currentBeatOptions,
  currentEventBeat,
  isEventRun,
  nextEventBeat,
} from "./events/event-run.mjs";
import { addToEventCast, eventCast } from "./events/event-cast.mjs";
import { addSkillXp, skillLevels, startingSkillXp } from "./skills/skill-levels.mjs";
import { SKILL_PERKS } from "./skills/skill-perks.mjs";
import {
  isAttractedToGender,
  normalizeAttraction,
  normalizeGender,
  notIntoReason,
} from "./orientation/orientation.mjs";
import {
  TRAIT_FLAGS,
  archetypeDefaultTraits,
  effectiveTraits,
  normalizeTraits,
  relationshipProfile,
} from "./traits/traits.mjs";
import {
  BOND_ACTIONS,
  BOND_AXES,
  adjustBondAxis,
  applyBondAction,
  bondKind,
  bondSummary,
  bondTier,
  checkDrift,
  conflictingPartner,
  createBond,
  hasMet,
  isActiveRival,
  markTraitsSeen,
  postponeTierEvent,
  rejectionChance,
  setRelationshipStatus,
  settleTierEvent,
  tierNameForKind,
  updateBoredom,
} from "./relationships/bonds.mjs";
import { INITIATIVE_ASK_CHANCES, MILESTONES, MILESTONE_COUPLE_STATUSES } from "./relationships/milestones.mjs";
import { milestoneSceneMinutes, npcInitiativeAskFor } from "./relationships/milestone-steps.mjs";
import { normalizeBirthday, rollBirthday } from "./relationships/birthdays.mjs";
import { judgeSceneReads, tierEventDefFor, tierRetryAt, tierStepMoment } from "./relationships/tier-steps.mjs";
import { canAffordFavour, tierSceneMinutes } from "./relationships/favours.mjs";
import { kinWordFor } from "./relationships/kin.mjs";
import { MAX_REMEMBER_OTHERS, SCENE_KINDS } from "./scenes/scene-config.mjs";
import { applyStartingRelation, normalizeStartingRelation } from "./relationships/starting-relations.mjs";
import { createScene, endScene, enterDecidePhase } from "./scenes/scene-engine.mjs";
import { CLOTHES_STORES } from "./items/catalog.mjs";
import { WELL_FED_HUNGER_SLOWDOWN } from "./items/cooking.mjs";
import {
  ageThingsAndDeliver,
  borrowLibraryBook,
  createStartingThings,
  isGiftable,
  itemDef,
  returnExpiredLoans,
} from "./items/inventory.mjs";
import { buildClothesRack } from "./shop/store-catalog.mjs";
import { takeOneFromPile } from "./inventory/piles-and-cooking.mjs";
import { parseNpcPairsFromCards, tickSocialNetworkHours } from "./network/npc-pairs.mjs";
import { npcPairsOf, recordTownFact } from "./network/town-facts.mjs";
import { dateTasteVerdict, dateTastesFor, recordDateTasteFound, visibleDateTastes } from "./outings/date-tastes.mjs";
import {
  GIFT_GIVE_MINUTES,
  GIFT_RESULT_EFFECTS,
  adjustDishVerdict,
  giftTasteVerdict,
  homeCookedDishLine,
  knownGiftVerdict,
  recordGiftGiven,
  visibleGiftTastes,
} from "./gifts/gift-tastes.mjs";
import { THEIR_THING_ACTIVITIES, stayOverBlockedReason } from "./visits/home-visits.mjs";
import { REASONING_EFFORT_LEVELS, normalizeLanguageName, normalizeReasoningEffort } from "./llm/model-client.mjs";
import { cleanTownNameForPrompt } from "./cast/read-card.mjs";
import { characterPortrait, setFaceCrop } from "./characters/portrait-face.mjs";
import { OFFICE_POSITIONS } from "./jobs/office-rules.mjs";
import {
  INTERVIEW_MINUTES,
  LATE_FROM_HOUR,
  LUNCH_BREAK_MESSAGE,
  activeJobWarnings,
  canApplyForOfficeJob,
  canStartShift,
  createOfficeJob,
  isOfficeWorkday,
  missedOfficeShift,
  officeJobStarted,
  officePayOf,
  officePositionById,
  shortDayLabel,
} from "./jobs/office-job.mjs";
import {
  STARTING_SAVINGS,
  createWallet,
  daysUntilRent,
  homeKindOf,
  housingCostOf,
  normalizeHomeKind,
  openBills,
  spendMoney,
  totalOwed,
} from "./money/wallet.mjs";
import {
  HUNGER_DRAIN_PER_HOUR,
  NEEDS_MAX,
  checkEnergyFor,
  createNeeds,
  drainNeeds,
  maxEnergyFor,
  needsStatus,
  refillNeeds,
  sleepNeeds,
} from "./needs/needs.mjs";
import { isHallPlace, isStreetPlace, storesInside } from "./town/places.mjs";
import {
  buildTown,
  closesTooSoonWhy,
  districtOfPlace,
  isLuxuryPlace,
  isPlaceOpen,
  isResidencePlace,
  minutesUntilPlaceCloses,
  placeActivitiesFor,
  routeBetweenPlaces,
  townDistricts,
  townPlace,
} from "./town/town-layout.mjs";
import { addAlbumEntry, albumEntryById, albumEntryView, albumView } from "./album/album.mjs";
import { cleanFigure } from "./characters/figure.mjs";
import { dayOrNightAt } from "./images/time-of-day.mjs";
import {
  backgroundSubjectOfPlace,
  cleanPictureModes,
  pictureModeOf,
  residenceBackgroundSubject,
} from "./images/backgrounds.mjs";
import {
  addMemory,
  characterSheet,
  contactsList,
  editMemory,
  memoriesInBudget,
  setMemoryBudget,
} from "./people/people-sheet.mjs";
import { playerSheet } from "./player/player-sheet.mjs";
import { cleanSleepMinutes } from "./sleep/sleep-options.mjs";
import { calendarMonthView, editCalendarNote } from "./calendar/calendar-view.mjs";
import {
  activeModules,
  collectModuleHook,
  firstModuleHook,
  isModuleNpc,
  moduleExtraName,
  moduleKeepsOut,
  moduleState,
  moduleToggleBusyReason,
  runModuleHook,
} from "./modules/module-registry.mjs";
import { lendFor, passPlea, pleaLeftInScene } from "./money/pleas-and-loans.mjs";
import { designerSeen, richFirst } from "./social/rich-impressions.mjs";
import { dropByDaily, guestHere, guestOver } from "./social/guest-visits.mjs";
import { pairSheet, rememberPair } from "./relationships/pair-memories.mjs";
import { appointments, dreamTick, outingAbout, planView, plansTick, theirOuting } from "./plans/plans.mjs";
import { faintOuting, plansTodayNotice } from "./outings/outing.mjs";
import { birthdayGift, birthdayInviteAbout, birthdaySheet, birthdayTick } from "./relationships/birthday-events.mjs";
import {
  describeTheirPartyPlan,
  endOwnParty,
  homePartyBlocksReason,
  isPartyGuestActive,
  leaveTheirPartyIfAny,
  ownPartyBlocksReason,
  partyGuestMoodWords,
  partyGuestsHere,
  rollTheirPartyInvite,
  sayGoodbyeFirstReason,
  sleepoverMorningEvent,
  tickParties,
} from "./parties/party.mjs";
import {
  buildPerksView,
  friendCircleTastes,
  friendCoversHospital,
  holdDebtsWhileAway,
  introductionsHere,
  markFriendTreatUsed,
  newPerksAtTier,
  priceWithFriendPerks,
  rollFoodDoorVisit,
  tellsTheirWeek,
  tickDebts,
} from "./relationships/friend-perks.mjs";
import {
  expireMateMoments,
  housematesOf,
  rollMateInAsk,
  rollMateMoment,
  tickHousemateFridge,
  tickHousemates,
} from "./home/housemates.mjs";
import {
  ROUGH_BED_QUALITY,
  addHospitalBill,
  evictionView,
  hasOwnHome,
  homeDailyTick,
  lodgingKindOf,
  payRentDay,
  rentShareOf,
  runDueEviction,
  streetSpotOf,
} from "./home/residence.mjs";
import {
  bedQualityOf,
  isClothesRuleOn,
  personaPicture,
  wearingItem,
  wearingText,
} from "./home/furniture-and-wardrobe.mjs";
import { homeActivityDetails, readBook, seasonNow, studyActivityDetails } from "./things/things-actions.mjs";
import { networkEnv } from "./cast/network-env.mjs";
import { rivalsForYou } from "./relationships/rivals.mjs";
import { sawIt, takenBy } from "./social/witnesses.mjs";
import { knownName, networkSheet } from "./relationships/network-sheet.mjs";
import { APPROACH_STAYS, approachDue, knobsOf } from "./romance/romantic-acts.mjs";
import { genderOf, intoTick, intoView, learnInto, pictureSexOf, setOrientation } from "./romance/romanceability.mjs";
import {
  agreedFor,
  heardOf,
  hereView,
  isPartner,
  learnedFact,
  otherIn,
  standingWords,
  withWhom,
} from "./romance/jealousy.mjs";
import { THREE_CALLS, partnersAsk, partnersMeetHere, partnersThreeHere } from "./romance/multiple-partners.mjs";
import { workingLook, workingNow } from "./cast/working-now.mjs";
import { setJob, workOf } from "./cast/cast-jobs.mjs";
import { seasonsOf } from "./cast/outfits.mjs";
import { OWN_FIRST, approaching, ownAbout, ownDue, ownNow, ownOfTheDay } from "./bonds/own-moments.mjs";
import { doorState, isAsleep, sleepEndsAt, sleepState, upAtHomeUntil, visitOver } from "./visits/staying-over.mjs";
import {
  castBoss,
  firedFact,
  lunchActivities,
  lunchBack,
  lunchNow,
  lunchOver,
  lunchWhy,
  sceneJobView,
  startShift,
} from "./jobs/office.mjs";
import { PROPOSAL_HOW, ringsInBag } from "./romance/proposal.mjs";
import { weddingDayTick, weddingStartsNow } from "./romance/wedding.mjs";
import { anniversaryKept, anniversaryTick, ringVisits } from "./romance/marriage-events.mjs";
import { friendOpinion } from "./relationships/friend-opinion.mjs";
import { extremesDaily, extremesTick, iceWhy, moneyHelpDaily } from "./relationships/extremes.mjs";
import {
  hasBang,
  milestoneCtx,
  milestoneEventsFor,
  milestoneFor,
  milestoneHandlers,
  milestoneWhyNot,
  specialActions,
  talkWhy,
  theirConfession,
  whyWords,
} from "./milestones/milestone-availability.mjs";
import { milestoneView, talkOtherOf } from "./milestones/milestone-settle.mjs";
import { FAITHFUL_LOW, deniesIt, meetsTick, planMeets, seenWith } from "./relationships/cast-meets.mjs";
import { favourWay, walkInView } from "./scenes/walk-ins.mjs";
import { clothesKnownOf } from "./shop/store-counter.mjs";
import { goingBy, pickUpWayTo, seeWheels, travelVerb } from "./travel/vehicles-rides.mjs";

var UNKNOWN_NAME = "???";
var SHOW_RULE_MODES = ["hidden", "found", "always"];
function createGame({
  name: gameName = "A new life",
  persona = {
    id: "persona",
    name: "You",
  },
  startAt = {
    year: 1,
    season: "Autumn",
    day: 1,
    hour: 7,
    minute: 0,
  },
  home = "apartment",
  savings = "normal",
  startingSkills = {
    fitness: 1,
    charm: 2,
    knowledge: 0,
  },
  characters = [],
  townOptions = {},
  rules = {},
  settings = {},
  pictures = {},
  scenario = "",
  townName = "",
  seed = "seed",
  roommate = null,
  housemates = [],
  pairs = [],
  employed = false,
  birthday = null,
  gender = null,
} = {}) {
  let startMinutes = clockMinutesFromDate(startAt),
    isStartingPartner = (characterId) => {
      let card = characters.find((candidate) => candidate.id === characterId);
      return (
        normalizeStartingRelation(card?.knows) === "couple" &&
        card.romanceable !== false &&
        isAttractedToGender(normalizeAttraction(card.into), normalizeGender(gender))
      );
    },
    wanted = [
      ...new Set([
        ...(Array.isArray(housemates) ? housemates : []),
        ...(roommate && home === "shared" ? [roommate] : []),
      ]),
    ].filter((characterId) => characters.some((card) => card.id === characterId)),
    housemateIds = wanted.slice(0, (homeKindOf(home).rooms ?? 1) + (wanted.some(isStartingPartner) ? 1 : 0)),
    couples = {
      n: 0,
      max: rules.multipleRelationships ? 1 / 0 : 1,
    },
    residences = assignResidences({
      home: home,
      housemates: housemateIds,
      cast: characters.map((card) => ({
        id: card.id,
        livesIn: card.livesIn ?? card.residence?.place,
      })),
    }),
    cast = characters.map((card) => ({
      ...card,
      residence: card.residence ?? residences.byId[card.id],
      birthday: normalizeBirthday(card.birthday) ?? rollBirthday(seed, card.id),
      gender: normalizeGender(card.gender) ?? normalizeGender(card.figure?.sex),
      into: normalizeAttraction(card.into),
    })),
    playerGender = normalizeGender(gender);
  return {
    name: gameName,
    persona: persona,
    gender: playerGender,
    birthday: normalizeBirthday(birthday, "you") ?? rollBirthday(seed, "you"),
    scenario: String(scenario ?? "").slice(0, 600),
    townName: cleanTownNameForPrompt(townName),
    seed: seed,
    minutes: startMinutes,
    startedAt: startMinutes,
    town: buildTown({
      ...townOptions,
      homeAt: residenceForHomeKind(home),
    }),
    pictures: cleanPictureModes(pictures),
    residence: residences.player,
    at: "home",
    needs: createNeeds(),
    wallet: {
      ...createWallet({
        cash: STARTING_SAVINGS[savings] ?? STARTING_SAVINGS.normal,
        home: home,
      }),
      flatmate: null,
    },
    skills: startingSkillXp(startingSkills),
    job: createOfficeJob({
      at: startMinutes,
      employed: employed,
    }),
    wearing: "casual",
    things: createStartingThings(normalizeHomeKind(home), homeKindOf(home).slots),
    firstDay: true,
    notes: [],
    plans: [],
    outing: null,
    characters: cast,
    bonds: Object.fromEntries(
      cast.map((card) => [
        card.id,
        initialBondForCharacter(card, {
          at: startMinutes,
          withYou: housemateIds.includes(card.id),
          you: playerGender,
          couples: couples,
        }),
      ]),
    ),
    seenSchedule: Object.fromEntries(characters.map((card) => [card.id, {}])),
    settings: {
      connection: settings.connection ?? null,
      effort: normalizeReasoningEffort(settings.effort),
      language: normalizeLanguageName(settings.language),
    },
    pairs: parseNpcPairsFromCards(pairs, {
      ids: cast.map((card) => card.id),
      couples: rules.castCouples === true,
      at: startMinutes,
      canCouple: (firstId, secondId) => {
        let [first, second] = [cast.find((card) => card.id === firstId), cast.find((card) => card.id === secondId)];
        return isAttractedToGender(first?.into, second?.gender) && isAttractedToGender(second?.into, first?.gender);
      },
    }),
    rules: {
      hunger: true,
      jealousy: true,
      drifting: true,
      multipleRelationships: false,
      keyImages: false,
      castCouples: false,
      partnersStray: false,
      workOutfits: false,
      seasonOutfits: false,
      npcs: false,
      ...Object.fromEntries(Object.entries(rules ?? {}).filter(([key]) => key !== "rent" && key !== "jobs")),
      showArchetypes: SHOW_RULE_MODES.includes(rules.showArchetypes) ? rules.showArchetypes : "hidden",
      showSchedules: SHOW_RULE_MODES.includes(rules.showSchedules) ? rules.showSchedules : "hidden",
    },
    log: [],
  };
}
function initialBondForCharacter(card, { at: at, withYou = false, you = null, couples = null }) {
  let notInto = !isAttractedToGender(card.into, you),
    bond = createBond(card.id, {
      main: card.archetype?.main,
      second: card.archetype?.second,
      traits: card.traits ?? null,
      romanceable: card.romanceable !== false && !notInto,
      at: at,
    });
  if (
    ((bond.cardRomance = card.romanceable !== false), (bond.notInto = notInto), card.knows === undefined && !withYou)
  ) {
    bond.met = card.met !== false;
    return bond;
  }
  let relation = normalizeStartingRelation(card.knows);
  if (relation === "couple" && (!bond.romanceable || (couples && couples.max <= couples.n))) {
    relation = "close";
  }
  if (relation === "couple" && couples) {
    couples.n += 1;
  }
  bond.met = false;
  if (withYou && ["no", "friendly", "friend"].includes(relation)) {
    applyStartingRelation(bond, "close", {
      at: at,
    });
  } else if (relation !== "no") {
    applyStartingRelation(bond, relation, {
      at: at,
      kin: card.kin,
    });
  }
  if (withYou && bond.status === "partners") {
    setRelationshipStatus(bond, "living", {
      at: at,
    });
  }
  return bond;
}
var hasMet2 = (game, characterId) => hasMet(game.bonds[characterId]);
var nameFor = (game, character) => (hasMet2(game, character.id) ? character.name : UNKNOWN_NAME);
var logNote = (game, text, kind = "info") => (
  game.log.push({
    at: game.minutes,
    kind: kind,
    text: text,
  }),
  game.log.length > 300 && game.log.shift(),
  text
);
var skillLevelsOf = (game) => skillLevels(game.skills);
var bondOf = (game, characterId) => game.bonds[characterId] ?? null;
var characterOf = (game, characterId) =>
  game.characters.find((character) => character.id === characterId) ??
  (characterId && npcsOn(game) ? (firstModuleHook(game, "extraOf", characterId) ?? null) : null);
var npcsOn = (game) => game?.rules?.npcs !== false;
var isNpc = (game, characterId) =>
  !!characterId &&
  characterId !== "you" &&
  !(game?.characters ?? []).some((character) => character.id === characterId) &&
  isModuleNpc(game, characterId);
var npcNameAside = (game, characterId) => moduleExtraName(game, characterId) || "someone";
function traitsOf(game, characterId) {
  let bond = game.bonds?.[characterId];
  return bond ? effectiveTraits(bond) : archetypeDefaultTraits(characterOf(game, characterId)?.archetype);
}
var bondProfileFor = (game, characterId) =>
  relationshipProfile(
    game.bonds?.[characterId] ?? {
      archetype: characterOf(game, characterId)?.archetype,
    },
  );
var castInTown = (game) => game.characters.filter((character) => !character.away);
function hudView(game) {
  let clock = clockFromMinutes(game.minutes),
    skills = skillLevelsOf(game);
  return {
    time: formatClockTime(game.minutes),
    date: formatCalendarDate(game.minutes, {
      from: game.startedAt,
    }),
    clock: clock,
    place: townPlace(game.town, game.at),
    cash: game.wallet.cash,
    owes: {
      rent: totalOwed(game.wallet, "rent"),
      mortgage: totalOwed(game.wallet, "mortgage"),
      home: totalOwed(game.wallet, "upkeep") + totalOwed(game.wallet, "parking") + totalOwed(game.wallet, "fine"),
      hospital: totalOwed(game.wallet, "hospital"),
      collections: openBills(game.wallet).some((bill) => bill.collections),
      loans: (game.debts ?? []).reduce((sum, debt) => sum + Math.max(0, debt.amount), 0),
    },
    lodging: lodgingView(game),
    evict: evictionView(game),
    rentIn: daysUntilRent(game.wallet, game.minutes),
    rent: rentShareOf(game),
    rentKind: housingCostOf(game.wallet).kind,
    needs: needsStatus(game.needs, {
      fitness: skills.fitness,
    }),
    wellFed: (game.wellFedUntil ?? 0) > game.minutes ? formatClockTime(game.wellFedUntil) : null,
    skills: skills,
    job: game.job.employed
      ? {
          position: officePositionById(game.job.position).name,
          pay: officePayOf(game.job),
          performance: game.job.performance,
          warnings: activeJobWarnings(game.job, game.minutes).length,
          startsOn: officeJobStarted(game.job, clock.dayIndex) ? null : shortDayLabel(game.job.startsOn),
        }
      : null,
  };
}
function applyFirstImpressions(game, events) {
  let bonus = SKILL_PERKS.firstImpression(skillLevelsOf(game).charm ?? 0);
  for (let bond of Object.values(game.bonds)) {
    if (bond.impressed || !hasMet(bond)) {
      continue;
    }
    bond.impressed = true;
    let richBonus = richFirst(game, bond.characterId);
    if (
      (richBonus &&
        (adjustBondAxis(bond, "friendship", richBonus, {
          at: game.minutes,
        }),
        events.push({
          id: "impression",
          characterId: bond.characterId,
          text: `${nameFor(game, characterOf(game, bond.characterId))} ${richBonus > 0 ? "was impressed by your clothes" : "found your clothes a bit much"}: ${richBonus > 0 ? "+" : ""}${richBonus} Friendship.`,
        })),
      !bonus)
    ) {
      continue;
    }
    let gained = applyBondAction(
      bond,
      {
        action: "time",
        friendship: bonus,
      },
      {
        at: game.minutes,
        today: false,
        share: "event",
        note: "first impression",
      },
    ).applied.friendship;
    if (gained > 0) {
      events.push({
        id: "impression",
        characterId: bond.characterId,
        text: `Good first impression: +${Math.round(gained)} Friendship with ${nameFor(game, characterOf(game, bond.characterId))}.`,
      });
    }
  }
}
var livingWithYou = (game) =>
  Object.values(game.bonds).filter((bond) => ["living", "engaged", "married"].includes(bond.status));
function lodgingView(game) {
  let lodging = game.lodging;
  return lodging
    ? lodging.kind === "couch"
      ? {
          kind: "couch",
          name: nameFor(game, characterOf(game, lodging.with)),
          nights: Math.max(0, Math.ceil((lodging.until - game.minutes) / 1440)),
        }
      : {
          kind: "street",
        }
    : {
        kind: "home",
      };
}
function advanceTime(game, minutes, { asleep = false, bedQuality = 0.7, walking = false } = {}) {
  if (minutes <= 0) {
    return {
      events: [],
    };
  }
  let place = townPlace(game.town, game.at),
    wasOpen = isPlaceOpen(place, game.minutes),
    skills = skillLevelsOf(game),
    before = clockFromMinutes(game.minutes);
  game.needs = asleep
    ? sleepNeeds(game.needs, minutes, {
        bedQuality: bedQuality,
        fitness: skills.fitness,
      })
    : drainNeeds(game.needs, minutes, {
        fitness: skills.fitness,
      });
  let fedMinutes = asleep ? 0 : Math.max(0, Math.min(minutes, (game.wellFedUntil ?? 0) - game.minutes));
  if (fedMinutes > 0) {
    game.needs = {
      ...game.needs,
      hunger: Math.min(
        NEEDS_MAX,
        game.needs.hunger + (fedMinutes / 60) * HUNGER_DRAIN_PER_HOUR * (1 - WELL_FED_HUNGER_SLOWDOWN),
      ),
    };
  }
  if (game.rules?.hunger === false) {
    game.needs = {
      ...game.needs,
      hunger: NEEDS_MAX,
    };
  }
  let startMinutes = game.minutes;
  game.minutes += minutes;
  let after = clockFromMinutes(game.minutes),
    events = [];
  tickSocialNetworkHours(game, startMinutes, game.minutes, networkEnv(game));
  let delivered = ageThingsAndDeliver(game.things, startMinutes, game.minutes);
  if (
    (returnExpiredLoans(game.things) &&
      events.push({
        id: "book-back",
        text: `Your library book went back to the ${townPlace(game.town, "library")?.name ?? "Library"}.`,
      }),
    delivered.length)
  ) {
    let names = delivered.map((pile) => itemDef(game.things, pile.item)?.name ?? pile.item).join(", ");
    events.push({
      id: "delivery",
      items: delivered.map((pile) => pile.item),
      text: `Your order arrived at home: ${names}.`,
    });
    logNote(game, `Delivered: ${names}`, "things");
  }
  for (let day = before.dayIndex; day < after.dayIndex; day++) {
    let dayEnd = (day + 1) * 24 * 60 - 1;
    if (game.job.employed && isOfficeWorkday(dayEnd, game.job) && game.job.lastShiftDay !== day) {
      let missed = missedOfficeShift(game.job, dayEnd);
      events.push({
        id: "missed-shift",
        ...missed,
        text: missed.fired ? "You were fired." : "You missed a day at work.",
      });
      logNote(game, missed.fired ? "Fired from the office." : "Missed a day at work.", "job");
      if (missed.fired) {
        firedFact(game);
        game.shiftNow = null;
      }
    }
  }
  if (
    (payRentDay(game, events),
    runDueEviction(game, events),
    after.dayIndex > before.dayIndex && homeDailyTick(game, events),
    after.dayIndex > before.dayIndex && weddingDayTick(game, events),
    after.dayIndex > before.dayIndex && anniversaryTick(game, events),
    after.dayIndex > before.dayIndex && birthdayTick(game, events),
    after.dayIndex > before.dayIndex && intoTick(game, events),
    plansTick(game, events),
    after.dayIndex > before.dayIndex && dreamTick(game, events),
    hasOwnHome(game))
  ) {
    for (let character of castInTown(game)) {
      if (sharesYourDoor(game, character) && game.bonds[character.id]) {
        Object.assign(game.bonds[character.id], {
          lastSeen: game.minutes,
          driftOwed: false,
        });
      }
    }
  }
  if (game.rules.drifting) {
    for (let bond of Object.values(game.bonds)) {
      if (characterOf(game, bond.characterId)?.away) {
        continue;
      }
      let drift = checkDrift(bond, game.minutes);
      if (drift.owed && !bond.driftReported) {
        bond.driftReported = true;
        events.push({
          id: "drifting",
          characterId: bond.characterId,
          days: drift.days,
          text: `${characterOf(game, bond.characterId)?.name ?? bond.characterId} has not seen you in ${drift.days} days.`,
        });
      }
      if (!drift.owed) {
        bond.driftReported = false;
      }
    }
  }
  for (let bond of Object.values(game.bonds)) {
    if (!(!hasMet(bond) || characterOf(game, bond.characterId)?.away)) {
      if (updateBoredom(bond, game.minutes)?.started) {
        events.push({
          id: "bored",
          characterId: bond.characterId,
          text: `${characterOf(game, bond.characterId)?.name ?? "They"} is getting bored.`,
        });
      }
    }
  }
  if (
    (after.dayIndex > before.dayIndex && tickDebts(game, events),
    after.dayIndex > before.dayIndex && rivalsForYou(game, after.dayIndex),
    after.dayIndex > before.dayIndex && ringVisits(game, after.dayIndex),
    applyFirstImpressions(game, events),
    after.dayIndex > before.dayIndex)
  ) {
    for (let bond of Object.values(game.bonds)) {
      if (characterOf(game, bond.characterId)?.away) {
        continue;
      }
      let ownAsk = ownDue(game, bond, {
          daily: true,
        }),
        askId = OWN_FIRST.includes(ownAsk)
          ? ownAsk
          : npcInitiativeAskFor(
              bond,
              milestoneCtx(game, bond.characterId),
              seededRandom(game.seed, bond.characterId, String(after.dayIndex), "asks"),
            );
      if (
        !(!askId && theirConfession(game, bond, after.dayIndex)) &&
        !(!askId && friendOpinion(game, bond, after.dayIndex))
      ) {
        if (askId) {
          bond.asks = {
            id: askId,
            at: game.minutes,
            due: approachDue(bond, game.minutes),
          };
        } else if (!bond.asks) {
          let strayPair =
              game.rules?.partnersStray &&
              isPartner(game, bond.characterId) &&
              traitsOf(game, bond.characterId).dials.faithful > FAITHFUL_LOW
                ? npcPairsOf(game, bond.characterId).find(
                    (pair) =>
                      (pair.romance ?? 0) >= 40 &&
                      pair.kind !== "couple" &&
                      !agreedFor(game, bond.characterId, pair.other),
                  )
                : null,
            initiative = knobsOf(bond).initiative ?? 1;
          if (
            strayPair &&
            seededRandom(game.seed, bond.characterId, String(after.dayIndex), "open") <
              (INITIATIVE_ASK_CHANCES[initiative] ?? 0)
          ) {
            bond.asks = {
              id: "open-them",
              with: strayPair.other,
              at: game.minutes,
              due: approachDue(bond, game.minutes),
            };
          }
        }
        if (!bond.asks) {
          partnersAsk(game, bond, after.dayIndex);
        }
        if (!bond.asks) {
          theirOuting(game, bond, after.dayIndex);
          if (bond.asks) {
            bond.asks.due = approachDue(bond, game.minutes);
          }
        }
      }
    }
    ownOfTheDay(game, after.dayIndex);
    planMeets(game, after.dayIndex);
    extremesDaily(game, after.dayIndex);
    moneyHelpDaily(game);
    dropByDaily(game, after.dayIndex);
    tickHousemates(game, events);
    tickHousemateFridge(game, events);
    expireMateMoments(game);
    rollMateInAsk(game, after.dayIndex);
    rollMateMoment(game, after.dayIndex);
    rollTheirPartyInvite(game, after.dayIndex);
    runModuleHook(game, "dayTick", after.dayIndex, events);
  }
  if (
    !walking &&
    place &&
    game.at === place.id &&
    game.at !== "home" &&
    !place.residence &&
    wasOpen &&
    !isPlaceOpen(place, game.minutes)
  ) {
    let closedAt = `${String(place.close % 24).padStart(2, "0")}:00`;
    events.push({
      id: "closed",
      place: place.id,
      text: `${place.name} closed at ${closedAt}.`,
    });
    logNote(game, `${place.name} closed at ${closedAt}; you had to leave.`, "move");
  }
  let visitEnd = visitOver(game);
  if (visitEnd) {
    events.push(visitEnd);
  }
  let guestEnd = guestOver(game);
  if (
    (guestEnd && events.push(guestEnd),
    events.push(
      ...tickParties(game, {
        asleep: asleep,
      }),
    ),
    !asleep)
  ) {
    let morning = sleepoverMorningEvent(game);
    if (morning) {
      events.push(morning);
    }
  }
  let lunchEnd = lunchOver(game);
  if (lunchEnd) {
    events.push(lunchEnd);
  }
  if (!asleep) {
    events.push(...collapseIfSpent(game));
  }
  if (events.some((ev) => ev.id === "fainted" || (ev.id === "missed-shift" && ev.fired))) {
    game.badDayAt = game.minutes;
  }
  if (!asleep) {
    ownNow(game);
  }
  meetsTick(game);
  extremesTick(game);
  runModuleHook(
    game,
    "tick",
    {
      from: startMinutes,
      to: game.minutes,
      asleep: asleep,
      walking: walking,
    },
    events,
  );
  if (!walking) {
    events.push(
      ...comingToYou(game, {
        asleep: asleep || hasFaintedEvent(events),
      }),
    );
  }
  return {
    events: events,
  };
}
function comingToYou(game, { asleep = false } = {}) {
  if (game.approach && (game.approach.place !== game.at || game.minutes - game.approach.at > APPROACH_STAYS)) {
    game.approach = null;
  }
  if (!asleep) {
    partnersMeetHere(game);
  }
  if (!asleep) {
    partnersThreeHere(game);
  }
  let introductions = asleep ? [] : introductionsHere(game);
  if (game.foodDoor && (game.at !== "home" || game.minutes - game.foodDoor.at > APPROACH_STAYS)) {
    game.foodDoor = null;
  }
  if (!asleep) {
    rollFoodDoorVisit(game);
  }
  let approach = asleep ? null : approaching(game),
    weddingEvents = [];
  return !asleep && weddingStartsNow(game, weddingEvents)
    ? [...introductions, ...weddingEvents]
    : approach
      ? [...introductions, approach]
      : introductions;
}
var COLLAPSE_RULES = {
  minutes: 480,
  bill: 150,
  energyShare: 0.5,
  hunger: 50,
};
function collapseIfSpent(game) {
  if (game.collapsing || game.needs.energy > 0) {
    return [];
  }
  game.collapsing = true;
  game.shiftNow = null;
  try {
    let placeName = game.at === "home" ? "home" : (townPlace(game.town, game.at)?.name ?? ""),
      faintedAt = game.minutes;
    game.outCold = {
      from: faintedAt,
      to: faintedAt + COLLAPSE_RULES.minutes,
    };
    recordTownFact(game, "fainted", {
      place: game.at,
      witnesses: sawIt(game),
    });
    let memo = faintMemoFor(game, faintedAt);
    if (memo) {
      game.faintMemo = memo;
    }
    let scene = game.scene && !game.scene.done ? game.scene : null;
    if (scene) {
      endScene(scene, bondOf(game, scene.characterId), {
        endedBy: "fainted",
      });
      scene.batch = [];
      scene.remember = "";
      delete scene.each;
    }
    let outing = game.outing && game.outing.phase !== "summary" ? game.outing : null;
    faintOuting(game);
    let leftEvents = [
        game.party?.host === "you"
          ? endOwnParty(game, {
              away: true,
            }).event
          : leaveTheirPartyIfAny(game),
      ].filter(Boolean),
      guestLeft = guestOver(game, {
        left: true,
      });
    if (guestLeft) {
      leftEvents.push({
        ...guestLeft,
        text: `${nameFor(
          game,
          characterOf(game, guestLeft.characterId) ?? {
            id: guestLeft.characterId,
            name: "They",
          },
        )} went home.`,
      });
    }
    game.visit = null;
    game.moment = null;
    if (townPlace(game.town, "hospital")) {
      game.at = "hospital";
    }
    let { events: events } = advanceTime(game, COLLAPSE_RULES.minutes, {
      asleep: true,
      bedQuality: 0.4,
    });
    events.unshift(...leftEvents);
    let skills = skillLevelsOf(game);
    game.needs = {
      energy: Math.round(maxEnergyFor(skills.fitness) * COLLAPSE_RULES.energyShare),
      hunger: Math.max(game.needs.hunger, COLLAPSE_RULES.hunger),
    };
    let helper = friendCoversHospital(game, COLLAPSE_RULES.bill),
      owed = COLLAPSE_RULES.bill - (helper?.paid ?? 0),
      due = addHospitalBill(game, owed)?.due ?? null,
      bill = {
        bill: COLLAPSE_RULES.bill,
        paid: 0,
        owed: owed,
        due:
          due === null
            ? ""
            : formatCalendarDate(due, {
                from: game.startedAt,
              }).replace(/ · Year \d+$/, ""),
        ...(helper
          ? {
              helper: helper,
            }
          : {}),
      },
      text = `You collapsed${placeName ? ` ${placeName === "home" ? "at home" : `at the ${placeName}`}` : ""} and woke up in the hospital. Bill: $${bill.bill}${helper ? ` \u2014 ${helper.name} came and paid $${helper.paid} of it (you owe it back)` : ""}${owed ? ` \u2014 $${owed} to pay in BILLS by ${bill.due}` : ""}.`;
    logNote(game, text, "health");
    let faintEvent = {
      id: "fainted",
      text: text,
      bill: bill,
      place: placeName,
      at: faintedAt,
      woke: game.minutes,
    };
    if (scene) {
      scene.faint = {
        ...faintEvent,
        events: events,
      };
    }
    if (outing?.summary) {
      outing.summary.faint = {
        ...faintEvent,
        events: events,
      };
    }
    return [faintEvent, ...events];
  } finally {
    game.collapsing = false;
  }
}
function faintMemoFor(game, at = game.minutes) {
  let scene = game.scene;
  if (scene && !scene.done && !scene.watching && scene.log?.length) {
    return {
      kind: "scene",
      at: at,
      place: game.at,
      visit: game.visit ?? null,
    };
  }
  let outing = game.outing;
  return outing && outing.phase !== "summary" && outing.log?.length
    ? {
        kind: "outing",
        at: at,
        place: game.at,
      }
    : null;
}
var QUICK_PER_DAY = 1;
var QUICK_ACTION_TODAY_KEYS = {
  quickChat: "time",
  flirt: "flirt",
  openUp: "deep",
};
var TODAY_KEY_TO_DONE_KEY = {
  time: "chat",
  flirt: "flirt",
  deep: "open",
};
var QUICK_ACTION_MISS_AXIS = {
  quickChat: "friendship",
  flirt: "romance",
  openUp: "trust",
};
var OPEN_UP_FROM_TIER = 1;
function quickActionsDoneToday(game, characterId) {
  let bond = game.bonds[characterId],
    todayActions =
      bond?.lastGainDay !== null &&
      bond?.lastGainDay !== undefined &&
      clockFromMinutes(bond.lastGainDay).dayIndex === clockFromMinutes(game.minutes).dayIndex
        ? (bond.todayActions ?? {})
        : {};
  return {
    chat: todayActions.time ?? 0,
    flirt: todayActions.flirt ?? 0,
    open: todayActions.deep ?? 0,
  };
}
var publicPlaceIds = (game) =>
  game.town.places
    .filter((place) => !place.residence && !place.hall && (!place.inside || place.id === "food-court"))
    .map((place) => place.id);
var keepsOutCheckerFor = (game) => (characterId, placeId) => moduleKeepsOut(game, characterId, placeId);
function closingWhy(game, minutes) {
  let lunchReason = lunchWhy(game, minutes);
  if (lunchReason) {
    return lunchReason;
  }
  if (game.at === "home" || !minutes) {
    return "";
  }
  let place = townPlace(game.town, game.at);
  return place && minutes > minutesUntilPlaceCloses(place, game.minutes) ? closesTooSoonWhy(place) : "";
}
var LEAVING_HORIZON = 720;
function leavingAt(game, characterId) {
  let character = characterOf(game, characterId);
  if (!character) {
    return null;
  }
  if (game.at === "home" || game.visit?.characterId === characterId) {
    let homeUntil = upAtHomeUntil(game, characterId);
    return homeUntil.at === null
      ? {
          at: null,
          reason: "stays",
        }
      : {
          at: homeUntil.at,
          reason: ["sleep", "work"].includes(homeUntil.reason) ? homeUntil.reason : "leaves",
          ...(homeUntil.until
            ? {
                until: homeUntil.until,
              }
            : {}),
        };
  }
  let opts = {
      places: publicPlaceIds(game),
      seed: game.seed,
      homePlace: character.livesAt ?? null,
      openAt: openAtCheckerFor(game),
      keepsOut: keepsOutCheckerFor(game),
    },
    place = game.at === "home" ? null : townPlace(game.town, game.at),
    lunch = lunchNow(game);
  if (lunch) {
    return {
      at: lunch.to,
      reason: "lunch",
    };
  }
  let closesAt = place ? game.minutes + minutesUntilPlaceCloses(place, game.minutes) : 1 / 0,
    horizon = game.minutes + LEAVING_HORIZON,
    hour = (Math.floor(game.minutes / 60) + 1) * 60;
  for (; hour < horizon && whereaboutsOf(character, hour, opts).place === game.at;) {
    hour += 60;
  }
  return closesAt <= hour
    ? {
        at: closesAt,
        reason: "closes",
      }
    : hour >= horizon
      ? {
          at: null,
          reason: "stays",
        }
      : {
          at: hour,
          reason: "leaves",
        };
}
var workLeavingWhy = (leaving, capitalize = true) => {
  let text = leaving.until
    ? `working until ${formatClockTime(leaving.until)}`
    : `they start work at ${formatClockTime(leaving.at)}`;
  return capitalize ? text[0].toUpperCase() + text.slice(1) : text;
};
function canSitAndTalk(game, characterId, leaving) {
  let bond = game.bonds[characterId];
  return !bond || !hasMet(bond)
    ? {
        ok: false,
        why: "Introduce yourself first",
      }
    : bond.lastTalkDay === clockFromMinutes(game.minutes).dayIndex
      ? {
          ok: false,
          why: "You already talked today. Come back tomorrow",
        }
      : (leaving?.at === null || leaving?.at === undefined ? 1 / 0 : leaving.at - game.minutes) <
          SCENE_KINDS.talk.minutesPerExchange
        ? {
            ok: false,
            why:
              leaving.reason === "closes"
                ? "The place is about to close"
                : leaving.reason === "lunch"
                  ? "Your break is almost over"
                  : leaving.reason === "work"
                    ? workLeavingWhy(leaving)
                    : "They are about to leave",
          }
        : {
            ok: true,
            why: "",
          };
}
function tierEventTimeFit(game, characterId, leaving) {
  let nextEvent = hasMet2(game, characterId) ? milestoneEventsFor(game, characterId).next : null;
  if (!nextEvent) {
    return null;
  }
  let needed = tierSceneMinutes(nextEvent.axis, nextEvent.tier, {
    exchanges: SCENE_KINDS.tier.exchanges,
    perExchange: SCENE_KINDS.tier.minutesPerExchange,
  });
  if ((leaving.at === null ? 1 / 0 : leaving.at - game.minutes) >= needed) {
    return {
      ok: true,
      needs: needed,
      why: "",
    };
  }
  let time = formatClockTime(leaving.at);
  return {
    ok: false,
    needs: needed,
    why: `${leaving.reason === "closes" ? `Closes at ${time}` : leaving.reason === "work" ? workLeavingWhy(leaving) : `They leave at ${time}`} \xB7 it takes ${formatMinutesSpan(needed)}`,
  };
}
var formatMinutesSpan = (minutes) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ""}` : `${minutes} min`;
var gaveGiftToday = (game, characterId) =>
  game.bonds[characterId]?.lastGiftDay === clockFromMinutes(game.minutes).dayIndex;
function giftInfo(game, characterId) {
  let bond = game.bonds[characterId],
    character = characterOf(game, characterId),
    showMode = game.rules?.showArchetypes ?? "found",
    items = (game.things?.bag ?? [])
      .map((pile, index) => ({
        pile: pile,
        index: index,
        item: itemDef(game.things, pile.item),
      }))
      .filter(({ pile: pile }) => isGiftable(game.things, pile))
      .map(({ pile: pile, index: index, item: item }) => {
        let tag = item.tags?.[0] ?? null,
          verdict = bond && !hasMet(bond) ? null : knownGiftVerdict(character, bond, tag, showMode),
          dishVerdict = item.homemade ? bond?.dateFound?.food?.[item.homemade.taste] : null,
          known =
            verdict && item.homemade && dishVerdict
              ? adjustDishVerdict(verdict, {
                  ...item.homemade,
                  verdict: dishVerdict,
                })
              : verdict;
        return {
          index: index,
          id: pile.item,
          name: item.name,
          icon: item.icon,
          n: pile.n,
          tag: tag,
          known: known,
        };
      }),
    count = items.reduce((sum, entry) => sum + entry.n, 0),
    why =
      !bond || !hasMet(bond)
        ? "Introduce yourself first"
        : isAsleep(game, characterId)
          ? "They're asleep"
          : gaveGiftToday(game, characterId)
            ? "You gave them one today. Come back tomorrow"
            : count
              ? closingWhy(game, GIFT_GIVE_MINUTES)
              : "No gift in your backpack. The Supermarket and the Mall sell them";
  return {
    ok: !why,
    why: why,
    count: count,
    items: items,
    minutes: GIFT_GIVE_MINUTES,
  };
}
var homemadeGiftVerdict = (character, bond, item) =>
  item?.homemade
    ? {
        ...item.homemade,
        verdict: dateTasteVerdict(dateTastesFor(character, bond?.archetype), "food", item.homemade.taste),
      }
    : null;
function giftResultFor(character, bond, item) {
  let verdict = giftTasteVerdict(character?.tastes, item?.tags ?? []),
    homemade = homemadeGiftVerdict(character, bond, item);
  return homemade ? adjustDishVerdict(verdict, homemade) : verdict;
}
function handOverGift(game, bond, character, bagIndex, { at = game.minutes } = {}) {
  let pile = game.things.bag[bagIndex],
    item = pile ? itemDef(game.things, pile.item) : null;
  if (!item || !isGiftable(game.things, pile)) {
    return null;
  }
  let tag = item.tags?.[0] ?? null,
    homemade = homemadeGiftVerdict(character, bond, item),
    result = giftResultFor(character, bond, item);
  if (homemade?.taste) {
    recordDateTasteFound(bond, "food", homemade.taste, homemade.verdict);
  }
  let worth = GIFT_RESULT_EFFECTS[result],
    birthdayBoost = birthdayGift(game, character.id);
  takeOneFromPile(game.things, "bag", bagIndex);
  let out = applyBondAction(
    bond,
    {
      action: "gift",
      friendship: worth.friendship * birthdayBoost,
      ...(worth.romance
        ? {
            romance: worth.romance * birthdayBoost,
          }
        : {}),
    },
    {
      at: at,
      charm: skillLevelsOf(game).charm,
      note: `gift: ${item.name}${birthdayBoost > 1 ? " (their birthday)" : ""}`,
    },
  );
  bond.lastGiftDay = clockFromMinutes(at).dayIndex;
  recordGiftGiven(bond, {
    at: at,
    item: pile.item,
    name: item.name,
    icon: item.icon,
    tag: tag,
    result: result,
  });
  addSkillXp(game.skills, {
    charm: 2,
  });
  logNote(game, `Gave ${item.name} to ${character.name}`, "social");
  return {
    pile: pile,
    item: item,
    tag: tag,
    result: result,
    worth: worth,
    out: out,
    birthday: birthdayBoost > 1,
    home: homemade,
  };
}
function giveGift(game, characterId, { index: index } = {}) {
  if (game.scene && !game.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  let bond = bondOf(game, characterId),
    character = characterOf(game, characterId);
  if (!bond || !character) {
    return {
      ok: false,
      reason: "You do not know them.",
    };
  }
  let info = giftInfo(game, characterId);
  if (!info.ok) {
    return {
      ok: false,
      reason: `${info.why}.`,
    };
  }
  if (!isCharacterHere(game, characterId)) {
    return {
      ok: false,
      reason: "They are not here.",
    };
  }
  let bagIndex = Number(index),
    pile = game.things.bag[bagIndex],
    item = pile ? itemDef(game.things, pile.item) : null;
  if (!item || !isGiftable(game.things, pile)) {
    return {
      ok: false,
      reason: "That is not a gift you have with you.",
    };
  }
  let { events: events } = advanceTime(game, GIFT_GIVE_MINUTES);
  if (hasFaintedEvent(events)) {
    return {
      ok: true,
      fainted: true,
      result: null,
      stamp: "",
      good: false,
      tag: null,
      gift: {
        id: pile.item,
        name: item.name,
        icon: item.icon,
        line: "",
      },
      applied: {
        friendship: 0,
        romance: 0,
        trust: 0,
      },
      limits: {},
      minutes: GIFT_GIVE_MINUTES,
      events: events,
      bond: bondSummary(bond),
      seenBy: [],
    };
  }
  let {
    item: item2,
    tag: tag,
    result: result,
    worth: worth,
    out: out,
    home: homemade,
  } = handOverGift(game, bond, character, bagIndex);
  anniversaryKept(game, characterId, events);
  let { profile: profile, ...rest } = out,
    seenBy = recordTownFact(game, "gift", {
      with: characterId,
      place: game.at,
      witnesses: sawIt(game),
    });
  return {
    ok: true,
    ...rest,
    result: result,
    stamp: worth.stamp,
    good: worth.good,
    tag: tag,
    gift: {
      id: pile.item,
      name: item2.name,
      icon: item2.icon,
      line: homemade ? homeCookedDishLine(homemade, game.persona?.name || "the player") : (item2.line ?? ""),
    },
    minutes: GIFT_GIVE_MINUTES,
    events: events,
    bond: bondSummary(bond),
    seenBy: seenBy,
  };
}
function giftsSheetFor(game, characterId) {
  let bond = game.bonds[characterId],
    showMode = game.rules?.showArchetypes ?? "found",
    tastes = visibleGiftTastes(characterOf(game, characterId), bond, showMode);
  return {
    ...tastes,
    given: (bond?.gifts ?? [])
      .slice(-5)
      .reverse()
      .map((gift) => ({
        when: `${clockFromMinutes(gift.at).weekday} ${formatClockTime(gift.at)}`,
        name: gift.name,
        icon: gift.icon,
        result: gift.result,
        said: GIFT_RESULT_EFFECTS[gift.result]?.said ?? "",
      })),
    clothes: clothesKnownOf(game, characterId),
    hint: tastes.open
      ? ""
      : showMode === "hidden"
        ? "Each gift you give shows what they think of it"
        : "Each gift you give shows what they think of it. Once they are Trusting, you see the rest",
  };
}
function talkTimeFitFor(game, characterId) {
  let leaving = leavingAt(game, characterId),
    sit = canSitAndTalk(game, characterId, leaving),
    talkKind = SCENE_KINDS.talk,
    minutesLeft = leaving.at === null ? 1 / 0 : leaving.at - game.minutes;
  return {
    eventFit: tierEventTimeFit(game, characterId, leaving),
    quickWhy: closingWhy(game, Math.max(BOND_ACTIONS.quickChat.minutes, BOND_ACTIONS.flirt.minutes)),
    sit: {
      ...sit,
      leaves: leaving.at === null ? "" : formatClockTime(leaving.at),
      leaveReason: leaving.reason,
      upTo: Math.min(
        talkKind.exchanges * talkKind.minutesPerExchange,
        Math.floor(minutesLeft / talkKind.minutesPerExchange) * talkKind.minutesPerExchange,
      ),
    },
  };
}
var sharesYourDoor = (game, character) =>
  !!character.residence &&
  !!game.residence &&
  character.residence.place === game.residence.place &&
  character.residence.unit === game.residence.unit;
function whoIsHere(game) {
  if (game.visit?.party && game.party) {
    return partyGuestsHere(game).map((guestId) => {
      let character = characterOf(game, guestId);
      return {
        id: guestId,
        name: character.name,
        doing: partyGuestMoodWords(game, guestId),
        twist: null,
      };
    });
  }
  if (game.visit) {
    let character = characterOf(game, game.visit.characterId);
    return character
      ? [
          {
            id: character.id,
            name: character.name,
            doing: game.visit.stage === "door" ? "at the door" : "at home",
            twist: null,
          },
        ]
      : [];
  }
  if (isResidencePlace(game.at) || isHallPlace(game.at) || isStreetPlace(game.at)) {
    return [];
  }
  if (game.at !== "home" && !isPlaceOpen(townPlace(game.town, game.at), game.minutes)) {
    return [];
  }
  let here = charactersAtPlace(castInTown(game), game.at, game.minutes, whereOpts(game));
  if (game.at === "home") {
    here = here.filter((person) => sharesYourDoor(game, characterOf(game, person.id)));
  }
  if (game.at === "home" && !game.visit && (game.party?.host === "you" || game.party?.home)) {
    here = here.filter((person) => !game.party.guests[person.id] || game.party.guests[person.id].gone);
  }
  let guest = guestHere(game);
  if (guest && !here.some((person) => person.id === guest.characterId)) {
    let character = characterOf(game, guest.characterId);
    if (character) {
      here.push({
        id: character.id,
        name: character.name,
        doing: "over at your place",
        twist: null,
      });
    }
  }
  for (let guestId of partyGuestsHere(game)) {
    if (!here.some((person) => person.id === guestId)) {
      let character = characterOf(game, guestId);
      if (character) {
        here.push({
          id: character.id,
          name: character.name,
          doing: partyGuestMoodWords(game, guestId),
          twist: null,
        });
      }
    }
  }
  let approacher = game.approach ? characterOf(game, game.approach.characterId) : null;
  if (approacher && !approacher.away && !game.approach.door && !here.some((person) => person.id === approacher.id)) {
    here.push({
      id: approacher.id,
      name: approacher.name,
      doing: "came to find you",
      twist: null,
    });
  }
  return here;
}
var isCharacterHere = (game, characterId) => whoIsHere(game).some((person) => person.id === characterId);
function markSeenHere(game, here = whoIsHere(game)) {
  if (!game.visit) {
    for (let person of here) {
      markScheduleSeen(game.seenSchedule[person.id] ?? (game.seenSchedule[person.id] = {}), game.minutes);
    }
  }
}
function peopleHere(game) {
  let here = whoIsHere(game);
  markSeenHere(game, here);
  return here.map((person) => personHereView(game, person));
}
function personHereView(game, person) {
  let charm = skillLevelsOf(game).charm;
  return {
    events: hasMet2(game, person.id)
      ? milestoneEventsFor(game, person.id)
      : {
          list: [],
          next: null,
        },
    ...person,
    ...characterPortrait(characterOf(game, person.id), game),
    name: nameFor(game, person),
    met: hasMet2(game, person.id),
    bond: bondSummary(game.bonds[person.id]),
    done: quickActionsDoneToday(game, person.id),
    ...talkTimeFitFor(game, person.id),
    ...workingLook(game, person.id),
    perDay: QUICK_PER_DAY,
    step: stepWithRoom(game, person.id),
    special: markTightSpecialActions(game, person.id, specialActions(game, person.id)),
    with: withWhom(game, person.id),
    seenWith: seenWith(game, person.id),
    ice: iceWhy(game, person.id) || null,
    risk: {
      chat: rejectionChance(game.bonds[person.id], "quickChat", {
        charm: charm,
      }),
      flirt: rejectionChance(game.bonds[person.id], "flirt", {
        charm: charm,
      }),
      open: rejectionChance(game.bonds[person.id], "openUp", {
        charm: charm,
      }),
    },
    openUp: !!game.bonds[person.id] && bondTier(game.bonds[person.id], "friendship") >= OPEN_UP_FROM_TIER,
    gift: giftInfo(game, person.id),
    onlyInto: hasMet2(game, person.id) ? (intoView(game, person.id)?.notYou ?? null) : null,
    noFlirt: isNoFlirtBond(game.bonds[person.id]),
    ...sleepState(game, person.id),
  };
}
var whereOpts = (game) => ({
  places: publicPlaceIds(game),
  seed: game.seed,
  appointments: appointments(game),
  openAt: openAtCheckerFor(game),
  said: game.driftWords ?? null,
  keepsOut: keepsOutCheckerFor(game),
});
var openAtCheckerFor = (game) => (placeId, minutes) => isPlaceOpen(townPlace(game.town, placeId), minutes);
var isGuestAtYourPlace = (game, characterId) =>
  game.guest?.characterId === characterId ||
  ((game.party?.host === "you" || !!game.party?.home) &&
    !!game.party.guests?.[characterId] &&
    !game.party.guests[characterId].gone) ||
  !!game.sleepover?.ids?.includes(characterId);
function peopleAtPlaces(game) {
  let placeIds = game.town.places.map((place) => place.id),
    byPlace = {};
  for (let character of castInTown(game)) {
    let where = whereaboutsOf(character, game.minutes, whereOpts(game)),
      place = where.place === "home" ? null : townPlace(game.town, where.place),
      placeId =
        where.place === "home"
          ? isGuestAtYourPlace(game, character.id)
            ? game.residence?.place
            : character.residence?.place
          : (place?.inside ?? where.place);
    if (!placeId || !placeIds.includes(placeId) || (where.place !== "home" && !isPlaceOpen(place, game.minutes))) {
      continue;
    }
    let bang = hasBang(game, character.id);
    (byPlace[placeId] ??= []).push({
      id: character.id,
      name: nameFor(game, character),
      met: hasMet2(game, character.id),
      doing: where.doing,
      home: where.place === "home",
      bang: bang,
      ...characterPortrait(character, game),
    });
  }
  return byPlace;
}
function corridorView(game, placeId) {
  let place = townPlace(game.town, placeId);
  if (!place?.residence) {
    return null;
  }
  let inNow = castInTown(game)
      .filter((character) => character.residence?.place === placeId)
      .filter(
        (character) =>
          whereaboutsOf(character, game.minutes, whereOpts(game)).place === "home" &&
          !isGuestAtYourPlace(game, character.id),
      )
      .map((character) => character.id),
    characters = castInTown(game).map((character) => ({
      ...character,
      ...characterPortrait(character, game),
      name: nameFor(game, character),
      met: hasMet2(game, character.id),
      bang: hasBang(game, character.id),
    })),
    directory = buildResidenceDirectory(placeId, {
      player: game.residence,
      characters: characters,
      inNow: inNow,
      youAreIn: game.at === "home",
      name: place.name,
    });
  directory.floors = directory.floors.map((floor) => ({
    ...floor,
    doors: floor.doors.map((door) => doorState(game, door)),
  }));
  return directory;
}
function mallHallView(game) {
  let mall = townPlace(game.town, "mall");
  if (!mall) {
    return null;
  }
  let opts = whereOpts(game),
    stores = storesInside(game.town).map((store) => {
      let isOpen = isPlaceOpen(store, game.minutes),
        here = isOpen ? charactersAtPlace(castInTown(game), store.id, game.minutes, opts) : [];
      return {
        id: store.id,
        name: store.name,
        open: store.open,
        close: store.close,
        isOpen: isOpen,
        here: game.at === store.id,
        news: CLOTHES_STORES[store.id]
          ? buildClothesRack(game.things, store.id, {
              season: seasonNow(game),
            }).filter((rackItem) => rackItem.isNew).length
          : 0,
        people: here.map((person) => {
          let character = characterOf(game, person.id);
          return {
            id: person.id,
            name: nameFor(game, character),
            met: hasMet2(game, person.id),
            doing: person.doing,
            bang: hasBang(game, person.id),
            ...characterPortrait(character, game),
          };
        }),
      };
    });
  return {
    name: mall.name,
    isOpen: isPlaceOpen(mall, game.minutes),
    open: mall.open,
    close: mall.close,
    stores: stores,
  };
}
function contactsList2(game) {
  return contactsList(game, {
    here: peopleHere(game),
    nameOf: (character) => nameFor(game, character),
    metOf: (characterId) => hasMet2(game, characterId),
  });
}
function firstDayView(game) {
  if (game.firstDay !== true) {
    return null;
  }
  let homeKind = homeKindOf(game.wallet.home),
    districtId = districtOfPlace(game.town, game.residence?.place ?? homeKind.where),
    districtName = townDistricts(game.town).find((district) => district.id === districtId)?.name ?? "",
    sharing = [
      ...new Set([
        ...livingWithYou(game).map((entry) => entry.characterId),
        ...housematesOf(game).map((entry) => entry.id),
      ]),
    ].map((entry) => nameFor(game, characterOf(game, entry))),
    known = contactsList2(game)
      .filter((contact) => contact.met)
      .map((contact) => contact.name);
  return {
    town: game.townName ?? "",
    home: homeKind.id,
    district: districtName,
    sharing: sharing,
    cash: game.wallet.cash,
    rent: rentShareOf(game),
    rentIn: daysUntilRent(game.wallet, game.minutes),
    job: !game.job?.employed,
    known: known.slice(0, 3),
    knownMore: Math.max(0, known.length - 3),
  };
}
function markFirstDaySeen(game) {
  game.firstDay = false;
  return {
    ok: true,
  };
}
function youView(game) {
  let placeName = (placeId) => (placeId === "home" ? "Home" : (townPlace(game.town, placeId)?.name ?? placeId)),
    housemateNames = [
      ...livingWithYou(game).map((entry) => entry.characterId),
      ...housematesOf(game).map((entry) => entry.id),
    ].map((entry) => nameFor(game, characterOf(game, entry))),
    flatmate = hasOwnHome(game)
      ? housemateNames.length
        ? housemateNames.join(", ")
        : game.wallet.flatmate === "anon"
          ? "A flatmate who only splits the rent"
          : "Nobody"
      : "Nobody";
  return playerSheet(game, {
    levels: skillLevelsOf(game),
    placeName: placeName,
    contacts: contactsList2(game),
    flatmate: flatmate,
    persona: {
      name: game.persona?.name,
      avatar: personaPicture(game),
      description: game.persona?.description ?? "",
    },
    rent: rentShareOf(game),
    lodging: lodgingView(game),
  });
}
function characterSheet2(game, characterId) {
  let isHere = isCharacterHere(game, characterId);
  if (isHere && !game.visit) {
    markScheduleSeen(game.seenSchedule[characterId] ?? (game.seenSchedule[characterId] = {}), game.minutes);
  }
  let sheet = characterSheet(game, characterId, {
    nameOf: (character) => nameFor(game, character),
    metOf: (characterId2) => hasMet2(game, characterId2),
    whereNow: whereabouts(game, characterId),
    isHere: isHere,
    placeName: (placeId) =>
      placeId === "home"
        ? "Home"
        : placeId === WORK_FROM_HOME_PLACE
          ? "Working \xB7 home"
          : (townPlace(game.town, placeId)?.name ?? placeId),
    rules: game.rules ?? {},
    told: tellsTheirWeek(game, characterId),
  });
  if (
    (sheet?.met && (sheet.gifts = giftsSheetFor(game, characterId)),
    sheet?.met &&
      ((sheet.perks = buildPerksView(game, characterId)), (sheet.theirTastes = friendCircleTastes(game, characterId))),
    sheet?.met && Object.assign(sheet, networkSheet(game, characterId)),
    sheet?.met && (sheet.withOthers = pairSheet(game, characterId)),
    sheet?.met)
  ) {
    let figure = characterOf(game, characterId)?.figure ?? null;
    sheet.figure = figure
      ? {
          sex: genderOf(game, characterId) ?? figure.sex,
          body: figure.body,
          outfit: figure.outfit,
          from: figure.from,
        }
      : null;
    sheet.into = intoView(game, characterId);
    sheet.keyImages = keyImagesOn(game);
    sheet.work = workOf(game, characterId);
    sheet.seasons = seasonsOf(game, characterId);
    if (sheet.seasons) {
      sheet.cardAvatar = characterOf(game, characterId)?.avatar ?? null;
    }
    sheet.birthday = birthdaySheet(game, characterId);
    let dream = bondOf(game, characterId)?.dreamDate;
    sheet.dreamDate = dream?.text
      ? {
          text: dream.text,
          promised: !!dream.promised,
          done: !!dream.done,
          place: dream.place ? (townPlace(game.town, dream.place)?.name ?? dream.place) : "",
          time: dream.time ?? "",
          gift: dream.gift ?? "",
        }
      : null;
    sheet.plans = (game.plans ?? [])
      .filter((plan) => plan.characterId === characterId && (plan.status === "set" || plan.status === "on"))
      .map((plan) => planView(game, plan));
    sheet.dateTastes = visibleDateTastes(characterOf(game, characterId), bondOf(game, characterId), {
      open: (game.rules?.showArchetypes ?? "found") === "always",
    });
  }
  if (sheet?.now && isAsleep(game, characterId)) {
    sheet.now.asleep = formatClockTime(sleepEndsAt(game, characterOf(game, characterId)));
  }
  if (sheet?.met && activeModules(game).length) {
    sheet.modules = activeModules(game).flatMap((module) =>
      (module.sheet?.(game, moduleState(game, module.id), characterId) ?? []).map((entry) => ({
        ...entry,
        module: module.id,
      })),
    );
  }
  return sheet;
}
function editMemory2(game, characterId, edit) {
  let character = characterOf(game, characterId);
  if (!character || !hasMet2(game, characterId)) {
    return {
      ok: false,
      reason: "You have not met them.",
    };
  }
  let error = editMemory(character, edit, {
    at: game.minutes,
  });
  return error
    ? {
        ok: false,
        reason: error,
      }
    : {
        ok: true,
      };
}
function setMemoryBudget2(game, characterId, budget) {
  let character = characterOf(game, characterId);
  if (!character || !hasMet2(game, characterId)) {
    return {
      ok: false,
      reason: "You have not met them.",
    };
  }
  let error = setMemoryBudget(character, budget);
  return error
    ? {
        ok: false,
        reason: error,
      }
    : {
        ok: true,
      };
}
function setFace(game, characterId, crop) {
  if (!hasMet2(game, characterId)) {
    return {
      ok: false,
      reason: "You have not met them.",
    };
  }
  let error = setFaceCrop(characterOf(game, characterId), crop, game);
  return error
    ? {
        ok: false,
        reason: error,
      }
    : {
        ok: true,
      };
}
var isNoFlirtBond = (bond) => !!bond?.kin || !!bond?.justFriends;
function setJustFriends(game, characterId, on) {
  let bond = bondOf(game, characterId);
  return !bond || !hasMet2(game, characterId)
    ? {
        ok: false,
        reason: "You have not met them.",
      }
    : bond.romanceable
      ? MILESTONE_COUPLE_STATUSES.includes(bond.status)
        ? {
            ok: false,
            reason: "Not while you are together.",
          }
        : ((bond.justFriends = !!on),
          {
            ok: true,
          })
      : {
          ok: false,
          reason: "Romance is not on the table with them anyway.",
        };
}
function whereabouts(game, characterId) {
  if (characterOf(game, characterId)?.away) {
    return null;
  }
  let character = characterOf(game, characterId);
  return character ? whereaboutsOf(character, game.minutes, whereOpts(game)) : null;
}
function goToPlace(game, placeId) {
  if (ownPartyBlocksReason(game)) {
    return {
      ok: false,
      reason: ownPartyBlocksReason(game),
    };
  }
  if (sayGoodbyeFirstReason(game)) {
    return {
      ok: false,
      reason: sayGoodbyeFirstReason(game),
    };
  }
  let place = townPlace(game.town, placeId);
  if (!place) {
    return {
      ok: false,
      reason: "That place is not in this town.",
    };
  }
  if (placeId === game.at) {
    return {
      ok: false,
      reason: "You are already there.",
    };
  }
  let shutReason = firstModuleHook(game, "shutTo", placeId);
  if (shutReason) {
    return {
      ok: false,
      reason: shutReason,
    };
  }
  if (sceneBusyReason(game)) {
    return {
      ok: false,
      reason: sceneBusyReason(game),
    };
  }
  if (lunchNow(game)) {
    return {
      ok: false,
      reason: LUNCH_BREAK_MESSAGE,
    };
  }
  if (placeId === "home" && !game.residence) {
    return {
      ok: false,
      reason: "You have no home. Find one in HOMES on your phone.",
    };
  }
  game.shiftNow = null;
  let way = pickUpWayTo(game, placeId),
    minutes = way.minutes;
  if (minutes === null) {
    return {
      ok: false,
      reason: "You cannot get there from here.",
    };
  }
  let path = routeBetweenPlaces(game.town, game.at, placeId),
    fromPlace = game.at;
  game.visit = null;
  game.fitting = null;
  game.suits = null;
  game.rideDue = null;
  let guestLeft =
      fromPlace === "home"
        ? guestOver(game, {
            left: true,
          })
        : null,
    partyLeft = leaveTheirPartyIfAny(game),
    { events: events } = advanceTime(game, minutes, {
      walking: true,
    });
  if (
    (guestLeft && events.unshift(guestLeft),
    partyLeft && events.unshift(partyLeft),
    events.some((ev) => ev.id === "fainted"))
  ) {
    return {
      ok: true,
      minutes: minutes,
      place: townPlace(game.town, game.at),
      path: path,
      from: fromPlace,
      open: true,
      events: events,
      fainted: true,
    };
  }
  game.at = placeId;
  let pickedUp = way.plan ? characterOf(game, way.plan.characterId) : null;
  if (way.plan) {
    way.plan.pickedUp = true;
  }
  let seenBy = seeWheels(game);
  designerSeen(game, sawIt(game));
  events.push(...comingToYou(game));
  fireArrivedHook(game, placeId, events);
  logNote(
    game,
    `${travelVerb(game)} to ${place.name}${pickedUp ? `, picking ${pickedUp.name} up` : ""} (${minutes} min)`,
    "move",
  );
  return {
    ok: true,
    minutes: minutes,
    place: place,
    path: path,
    from: fromPlace,
    open: isPlaceOpen(place, game.minutes),
    events: events,
    by: goingBy(game),
    ...(pickedUp
      ? {
          picked: {
            id: pickedUp.id,
            name: nameFor(game, pickedUp),
          },
        }
      : {}),
    ...(seenBy.length
      ? {
          seenBy: seenBy,
        }
      : {}),
  };
}
function fireArrivedHook(game, placeId, events) {
  if (!(game.at !== placeId || game.outing || (game.scene && !game.scene.done))) {
    runModuleHook(
      game,
      "arrived",
      {
        place: placeId,
      },
      events,
    );
  }
}
function activitiesHere(game) {
  if (lunchNow(game) && game.at === "office") {
    return lunchActivities(game);
  }
  let skills = skillLevelsOf(game),
    isOpen = game.at === "home" || isPlaceOpen(townPlace(game.town, game.at), game.minutes);
  return [
    ...(lodgingKindOf(game) === "street" && game.at === streetSpotOf(game)
      ? [
          {
            id: ROUGH_SLEEP_ACTIVITY.id,
            name: ROUGH_SLEEP_ACTIVITY.name,
            sleep: true,
            pick: true,
            rough: true,
            minutes: 480,
            place: game.at,
            available: true,
            why: "",
          },
        ]
      : []),
    ...placeActivitiesFor(game.town, game.at, {
      minutes: game.minutes,
      skills: skills,
      cash: game.wallet.cash,
    }),
  ]
    .map((activity) => applyActivityDiscount(game, activity))
    .map((activity) =>
      activity.job && isOpen
        ? {
            ...activity,
            ...jobActivityState(game, activity),
          }
        : activity,
    )
    .map((activity) => homeActivityDetails(game, activity))
    .filter(Boolean)
    .map((activity) => studyActivityDetails(game, activity))
    .concat(collectModuleHook(game, "activities").flat());
}
var ROUGH_SLEEP_ACTIVITY = {
  id: "sleep-rough",
  name: "Sleep on the cardboard",
};
function applyActivityDiscount(game, activity) {
  if (!activity.costs) {
    return activity;
  }
  if (activity.dayPass && isLuxuryPlace(game.residence?.place) && !game.lodging) {
    return {
      ...activity,
      costs: 0,
      was: activity.costs,
      member: true,
      ...(!activity.available && /afford/.test(activity.why ?? "")
        ? {
            available: true,
            why: "",
          }
        : {}),
    };
  }
  let price = priceWithFriendPerks(game, activity.costs);
  if (price.costs === activity.costs) {
    return activity;
  }
  let affordable = game.wallet.cash >= price.costs;
  return {
    ...activity,
    costs: price.costs,
    was: price.was,
    ...(price.discount
      ? {
          discount: price.discount,
        }
      : {}),
    ...(price.treat
      ? {
          treat: price.treat,
        }
      : {}),
    ...(!activity.available && affordable && /afford/.test(activity.why ?? "")
      ? {
          available: true,
          why: "",
        }
      : {}),
  };
}
function jobActivityState(game, activity) {
  if (!game.job.employed) {
    let canApply = canApplyForOfficeJob(game.job, game.minutes),
      closing = closingWhy(game, INTERVIEW_MINUTES),
      boss = castBoss(game);
    return {
      id: "apply",
      name: "Apply for a job",
      job: false,
      apply: {
        with: boss && hasMet2(game, boss.id) ? boss.name : boss ? "the boss" : "the manager",
        position: OFFICE_POSITIONS[0].name,
        pay: OFFICE_POSITIONS[0].pay,
      },
      opens: "interview",
      minutes: INTERVIEW_MINUTES,
      available: canApply.ok && !closing,
      why: canApply.reason || closing,
    };
  }
  if (game.shiftNow?.day === clockFromMinutes(game.minutes).dayIndex) {
    return {
      name: "Back to your shift",
      available: true,
      why: "",
      late: false,
    };
  }
  let canStart = canStartShift(game.job, game.minutes);
  return {
    available: canStart.ok,
    why: canStart.reason,
    late: canStart.late,
    onTimeUntil: formatHourLabel(LATE_FROM_HOUR),
  };
}
var sceneBusyReason = (game) =>
  game.scene && !game.scene.done
    ? "You are in the middle of a scene."
    : game.outing
      ? `You are out with ${characterOf(game, game.outing.characterId)?.name ?? "someone"}.`
      : "";
var hasFaintedEvent = (events = []) => events.some((ev) => ev.id === "fainted");
var eventsCutShort = (events = []) => hasFaintedEvent(events) || events.some((ev) => ev.id === "wedding-day");
function doActivity(game, activityId, opts = {}) {
  if (sceneBusyReason(game)) {
    return {
      ok: false,
      reason: sceneBusyReason(game),
    };
  }
  let activity = activitiesHere(game).find((candidate) => candidate.id === activityId);
  if (!activity) {
    return {
      ok: false,
      reason: "That is not something you can do here.",
    };
  }
  if (activity.lunchBack) {
    return lunchBack(game);
  }
  if (activity.bookPick) {
    return readBook(game, activity.bookPick.list, activity.bookPick.index, {
      activity: activity,
    });
  }
  if (activity.opens) {
    return {
      ok: false,
      reason: "That opens a screen.",
    };
  }
  if (activity.route) {
    return {
      ok: false,
      reason: "That one starts on its own.",
    };
  }
  if (!activity.available) {
    return {
      ok: false,
      reason: activity.why,
    };
  }
  if (activity.job) {
    return startShift(game);
  }
  if (activity.sleep) {
    return sleepForMinutes(game, cleanSleepMinutes(opts.minutes) ?? activity.minutes);
  }
  let skills = skillLevelsOf(game),
    energyCheck = checkEnergyFor(game.needs, {
      energy: activity.energy ?? 0,
    });
  if (!energyCheck.ok) {
    return {
      ok: false,
      reason: energyCheck.reason,
    };
  }
  if (activity.costs && game.wallet.cash < activity.costs) {
    return {
      ok: false,
      reason: `You cannot afford it: $${activity.costs}`,
    };
  }
  if (activity.borrow) {
    let borrowed = borrowLibraryBook(game.things, game.minutes);
    if (!borrowed.ok) {
      return borrowed;
    }
  }
  if (activity.costs) {
    let payment = spendMoney(game.wallet, activity.costs, activity.name, game.minutes);
    if (!payment.ok) {
      return {
        ok: false,
        reason: payment.reason,
      };
    }
  }
  if (activity.treat) {
    markFriendTreatUsed(game, {
      treat: activity.treat,
    });
  }
  let { events: events } = advanceTime(game, activity.minutes);
  if (hasFaintedEvent(events)) {
    return {
      ok: true,
      activity: activity,
      minutes: activity.minutes,
      gains: {},
      levelled: [],
      needs: game.needs,
      events: events,
      fainted: true,
    };
  }
  game.needs = drainNeeds(game.needs, 0, {
    extraEnergy: activity.energy ?? 0,
    extraHunger: activity.hunger ?? 0,
    fitness: skills.fitness,
  });
  if (activity.restEnergy) {
    game.needs = refillNeeds(game.needs, {
      energy: activity.restEnergy,
      fitness: skills.fitness,
    });
  }
  if (activity.food) {
    game.needs = refillNeeds(game.needs, {
      ...activity.food,
      fitness: skills.fitness,
    });
  }
  events.push(...collapseIfSpent(game));
  let gains = activity.gives ?? {};
  if (gains.fitness && wearingItem(game)?.sport) {
    gains = {
      ...gains,
      fitness: Math.round(gains.fitness * 1.2 * 10) / 10,
    };
  }
  let levelled = addSkillXp(game.skills, gains);
  logNote(game, `${activity.name} (${activity.minutes} min)`, "activity");
  return {
    ok: true,
    activity: activity,
    minutes: activity.minutes,
    gains: gains,
    levelled: levelled,
    needs: game.needs,
    events: events,
  };
}
function sleepBlockedReason(game) {
  return ownPartyBlocksReason(game)
    ? ownPartyBlocksReason(game)
    : sayGoodbyeFirstReason(game)
      ? sayGoodbyeFirstReason(game)
      : homePartyBlocksReason(game)
        ? homePartyBlocksReason(game)
        : game.guest && game.at === "home"
          ? `${nameFor(game, characterOf(game, game.guest.characterId))} is still here: see them out first${
              stayOverBlockedReason(game.bonds[game.guest.characterId] ?? {}, {
                turnsIn: true,
              })
                ? ""
                : ", or stay the night together"
            }.`
          : "";
}
function sleepForMinutes(game, minutes) {
  if (sleepBlockedReason(game)) {
    return {
      ok: false,
      reason: sleepBlockedReason(game),
    };
  }
  let rough = lodgingKindOf(game) === "street" && game.at === streetSpotOf(game);
  if (game.at !== "home" && !rough) {
    return {
      ok: false,
      reason: "You can only sleep at home.",
    };
  }
  if (rough && !game.lodging.seen) {
    game.lodging.seen = true;
    recordTownFact(game, "rough", {
      place: game.at,
      witnesses: sawIt(game),
    });
  }
  let { events: events } = advanceTime(game, minutes, {
    asleep: true,
    bedQuality: rough ? ROUGH_BED_QUALITY : bedQualityOf(game),
  });
  events.push(...plansTodayNotice(game));
  let morning = sleepoverMorningEvent(game, {
    woke: true,
  });
  if (morning) {
    events.push(morning);
  }
  logNote(game, `Slept ${Math.round(minutes / 60)} h`, "sleep");
  return {
    ok: true,
    minutes: minutes,
    needs: game.needs,
    events: events,
    slept: true,
  };
}
function interactWith(game, characterId, action, { minutes = null, scale = 1, note = "" } = {}) {
  let bond = bondOf(game, characterId);
  if (!bond) {
    return {
      ok: false,
      reason: "You do not know them.",
    };
  }
  if (!hasMet(bond)) {
    return {
      ok: false,
      reason: "Introduce yourself first.",
    };
  }
  if (action === "flirt" && isNoFlirtBond(bond)) {
    return {
      ok: false,
      reason: bond.kin ? "They are family." : "You two agreed to stay friends.",
    };
  }
  let todayKey = QUICK_ACTION_TODAY_KEYS[action];
  if (todayKey) {
    if (action === "openUp" && bondTier(bond, "friendship") < OPEN_UP_FROM_TIER) {
      return {
        ok: false,
        reason: "Get to know them first.",
      };
    }
    let iceReason = iceWhy(game, characterId);
    if (iceReason) {
      return {
        ok: false,
        reason: iceReason,
      };
    }
    if (quickActionsDoneToday(game, characterId)[TODAY_KEY_TO_DONE_KEY[todayKey]] >= QUICK_PER_DAY) {
      return {
        ok: false,
        reason: "You already did that with them today. Try again tomorrow.",
      };
    }
    let closing = closingWhy(game, BOND_ACTIONS[action].minutes);
    if (closing) {
      return {
        ok: false,
        reason: closing,
      };
    }
  }
  if (game.scene && !game.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  if (!isCharacterHere(game, characterId)) {
    return {
      ok: false,
      reason: "They are not here.",
    };
  }
  if (isAsleep(game, characterId)) {
    return {
      ok: false,
      reason: "They are asleep. Wake them up first.",
    };
  }
  let actionDef = typeof action == "string" ? BOND_ACTIONS[action] : action,
    spent = minutes ?? actionDef?.minutes ?? 0,
    skills = skillLevelsOf(game),
    rejection = todayKey
      ? rejectionChance(bond, action, {
          charm: skills.charm,
        })
      : {
          chance: 0,
        },
    missed =
      rejection.chance > 0 && seededRandom(game.seed, characterId, String(game.minutes), action) < rejection.chance,
    { events: events } = spent
      ? advanceTime(game, spent)
      : {
          events: [],
        };
  if (hasFaintedEvent(events)) {
    return {
      ok: true,
      fainted: true,
      applied: {
        friendship: 0,
        romance: 0,
        trust: 0,
      },
      notes: [],
      limits: {},
      missed: false,
      minutes: spent,
      events: events,
      bond: bondSummary(bond),
      seenBy: [],
      interruptBy: null,
      interruptFor: null,
    };
  }
  let notInto = action === "flirt" && bond.notInto && !isPartner(game, characterId);
  if (notInto) {
    learnInto(game, characterId, "flirt");
    events.push({
      id: "not-into",
      characterId: characterId,
      text: `${characterOf(game, characterId)?.name ?? "They"} ${notIntoReason(normalizeGender(game.gender))}: the flirt goes nowhere.`,
    });
  }
  let takenWith = action === "flirt" && !notInto && !isPartner(game, characterId) ? takenBy(game, characterId) : null;
  if (takenWith) {
    markTraitsSeen(bond, "faithful");
  }
  if (missed && action === "openUp") {
    markTraitsSeen(
      bond,
      ...TRAIT_FLAGS.filter(
        (flag) => ["reserved", "proud", "shy"].includes(flag) && traitsOf(game, characterId).flags.includes(flag),
      ),
    );
  }
  if (takenWith) {
    events.push({
      id: "taken",
      characterId: characterId,
      text: `${characterOf(game, characterId)?.name ?? "They"} is with ${takenWith.name}: the flirt goes nowhere.`,
    });
  }
  let bondAction =
      notInto || takenWith
        ? {
            action: "time",
            friendship: 0.5,
          }
        : missed
          ? {
              action: actionDef.action,
              [QUICK_ACTION_MISS_AXIS[action]]: -1,
            }
          : action,
    result = applyBondAction(bond, bondAction, {
      at: game.minutes,
      charm: skills.charm,
      scale: scale,
      note: note,
    });
  addSkillXp(game.skills, {
    charm: spent >= 60 ? 5 : 2,
  });
  logNote(game, `${action} with ${characterOf(game, characterId)?.name ?? npcNameAside(game, characterId)}`, "social");
  let seenBy =
      action === "flirt"
        ? recordTownFact(game, "flirt", {
            with: characterId,
            place: game.at,
            witnesses: sawIt(game),
          })
        : [],
    interruptBy =
      (seenBy.length ? learnedFact(game, seenBy, game.facts.at(-1).id, "seen") : []).sort(
        (first, second) => (bondOf(game, second).jealous?.weight ?? 0) - (bondOf(game, first).jealous?.weight ?? 0),
      )[0] ?? null;
  if (interruptBy) {
    bondOf(game, interruptBy).asks.due = game.minutes;
  }
  return {
    ok: true,
    ...result,
    missed: missed,
    minutes: spent,
    events: events,
    bond: bondSummary(bond),
    seenBy: seenBy,
    interruptBy: interruptBy,
    interruptFor: interruptBy ? bondOf(game, interruptBy).asks.id : null,
  };
}
function sceneContext(game, characterId) {
  let bond = bondOf(game, characterId),
    character = characterOf(game, characterId);
  if (!bond || !character) {
    return null;
  }
  let summary = bondSummary(bond);
  return {
    place: game.visit
      ? `${characterOf(game, game.visit.characterId)?.name ?? ""}'s home${game.visit.stage === "door" ? ", at the door" : ""}`
      : (townPlace(game.town, game.at)?.name ?? ""),
    time: formatClockTime(game.minutes),
    date: formatCalendarDate(game.minutes, {
      from: game.startedAt,
    }),
    character: {
      name: character.name,
      description: character.description ?? "",
      appearance: character.appearance ?? "",
      gender: character.gender ?? null,
      into: character.into ?? null,
    },
    tone: summary.archetype.tone,
    bond: {
      friendship: summary.friendship.name,
      romance: summary.romance.name,
      trust: summary.trust.name,
      status: summary.status.name,
      what: standingWords(game, characterId),
    },
    owed: summary.owed,
    drifting: summary.drifting,
    daysSinceSeen: daysBetween(bond.lastSeen, game.minutes),
    memories: memoriesInBudget(character),
  };
}
function canStartScene(game, characterId, kind = "intro", { milestone = null } = {}) {
  if (!SCENE_KINDS[kind]) {
    return {
      ok: false,
      reason: "There is no scene like that.",
    };
  }
  if (game.scene && !game.scene.done) {
    return {
      ok: false,
      reason: "You are already in a scene.",
    };
  }
  if (game.outing && game.outing.phase !== "summary" && !game.outing.night) {
    return {
      ok: false,
      reason: sceneBusyReason(game),
    };
  }
  let bond = bondOf(game, characterId);
  if (!bond) {
    return {
      ok: false,
      reason: "That person is not in this life.",
    };
  }
  if (kind === "intro" && hasMet(bond)) {
    return {
      ok: false,
      reason: "You have already met.",
    };
  }
  if (kind !== "intro" && !hasMet(bond)) {
    return {
      ok: false,
      reason: "Introduce yourself first.",
    };
  }
  let glowing =
      kind === "milestone" && bond.outingGlow?.milestone === milestone && bond.outingGlow.until >= game.minutes,
    partyStep =
      kind === "milestone" &&
      (milestone === "party-arrive" || milestone === "party-goodbye") &&
      bond.asks?.id === milestone &&
      game.party?.host === characterId &&
      isPartyGuestActive(game.party.guests[characterId]);
  if (!glowing && !partyStep && !isCharacterHere(game, characterId)) {
    return {
      ok: false,
      reason: "They are not here.",
    };
  }
  if (!glowing && !partyStep && isAsleep(game, characterId)) {
    return {
      ok: false,
      reason: "They are asleep. Wake them up first.",
    };
  }
  if (game.visit?.stage === "door" && kind !== "intro") {
    return {
      ok: false,
      reason: "Not on the doorstep: only a quick word there.",
    };
  }
  if (kind === "talk") {
    let fit = canSitAndTalk(game, characterId, leavingAt(game, characterId));
    if (!fit.ok) {
      return {
        ok: false,
        reason: `${fit.why}.`,
      };
    }
  }
  if (kind === "milestone") {
    let whyNot = milestoneWhyNot(game, characterId, milestone);
    if (whyNot) {
      return {
        ok: false,
        reason: whyNot,
      };
    }
    if (game.approach?.characterId === characterId || glowing) {
      return {
        ok: true,
      };
    }
    let shortfall = milestoneTimeShortfall(game, characterId, milestone);
    if (shortfall) {
      return {
        ok: false,
        reason: `Not enough time for all of it: ${shortfall.leaving.reason === "work" ? workLeavingWhy(shortfall.leaving, false) : `${shortfall.leaving.reason === "closes" ? "it closes" : "they leave"} at ${formatClockTime(shortfall.leaving.at)}`}, and it takes ${formatMinutesSpan(shortfall.needs)}.`,
      };
    }
  }
  if (kind === "tier") {
    if (!milestoneEventsFor(game, characterId).next) {
      return {
        ok: false,
        reason: "There is nothing waiting between you right now.",
      };
    }
    let fit = tierEventTimeFit(game, characterId, leavingAt(game, characterId));
    if (fit && !fit.ok) {
      return {
        ok: false,
        reason: `Not enough time for all of it: ${fit.why}.`,
      };
    }
  }
  return {
    ok: true,
  };
}
function milestoneTimeShortfall(game, characterId, milestone) {
  if (milestone === "party-arrive" || milestone === "party-goodbye") {
    return null;
  }
  let glow = bondOf(game, characterId)?.outingGlow;
  if (game.approach?.characterId === characterId || (glow?.milestone === milestone && glow.until >= game.minutes)) {
    return null;
  }
  let needed = milestoneSceneMinutes(milestone),
    leaving = leavingAt(game, characterId);
  return leaving.at !== null && leaving.at - game.minutes < needed
    ? {
        needs: needed,
        leaving: leaving,
      }
    : null;
}
function milestoneTimeWhy(game, characterId, milestone) {
  let shortfall = milestoneTimeShortfall(game, characterId, milestone);
  if (!shortfall) {
    return "";
  }
  let time = formatClockTime(shortfall.leaving.at);
  return `${shortfall.leaving.reason === "closes" ? `Closes at ${time}` : shortfall.leaving.reason === "work" ? workLeavingWhy(shortfall.leaving) : `They leave at ${time}`} \xB7 it takes ${formatMinutesSpan(shortfall.needs)}`;
}
function stepWithRoom(game, characterId) {
  let step = milestoneFor(game, characterId);
  if (!step?.asks) {
    return null;
  }
  let room = milestoneTimeWhy(game, characterId, step.id);
  return room
    ? {
        ...step,
        room: room,
      }
    : step;
}
var SPECIAL_ACTION_MILESTONES = {
  breakUp: "break-up",
  confront: "confront",
  talkOther: "talk-other",
  propose: "propose",
  talkItOut: "talk",
  reconcile: "reconcile",
  marryAsk: "marry-ask",
  openAsk: "open-ask",
  mateIn: "mate-in",
  mateOut: "mate-out",
};
function markTightSpecialActions(game, characterId, actions) {
  for (let [actionKey, milestone] of [...Object.entries(SPECIAL_ACTION_MILESTONES), ["step", actions.step?.id]]) {
    if (!actions[actionKey] || actions[actionKey].ok === false) {
      continue;
    }
    let timeWhy = milestoneTimeWhy(game, characterId, milestone);
    if (timeWhy) {
      actions[actionKey] = {
        ...actions[actionKey],
        ok: false,
        tight: true,
        why: `Not enough time \xB7 ${timeWhy}`,
      };
    }
  }
  for (let [moduleKey, moduleAction] of Object.entries(actions.modules ?? {})) {
    if (moduleAction?.start?.kind !== "milestone" || moduleAction.ok === false) {
      continue;
    }
    let timeWhy = milestoneTimeWhy(game, characterId, moduleAction.start.id ?? moduleKey);
    if (timeWhy) {
      actions.modules[moduleKey] = {
        ...moduleAction,
        ok: false,
        tight: true,
        why: `Not enough time \xB7 ${timeWhy}`,
      };
    }
  }
  return actions;
}
function beginScene(game, characterId, kind = "intro", { milestone = null, with: withId = null, how = null } = {}) {
  let leaving = kind === "talk" || kind === "tier" || kind === "milestone" ? leavingAt(game, characterId) : null,
    nextEvent = kind === "tier" ? milestoneEventsFor(game, characterId).next : null;
  if (
    ((game.scene = createScene({
      kind: kind,
      characterId: characterId,
      place: game.at,
      at: game.minutes,
      leavesAt: leaving?.at ?? null,
      leaveReason: leaving?.reason ?? "leaves",
      axis: nextEvent?.axis ?? null,
      tier: nextEvent?.tier ?? null,
      couple: kind === "tier" && (bondKind(bondOf(game, characterId)) || false),
      event:
        kind === "tier"
          ? tierEventDefFor(nextEvent?.axis, nextEvent?.tier).id
          : kind === "milestone"
            ? milestone
            : null,
    })),
    kind === "milestone")
  ) {
    game.scene.milestone = milestone;
    game.scene.by =
      bondOf(game, characterId).asks?.id === milestone && !bondOf(game, characterId).asks.mine ? "them" : "you";
    let approached = game.approach?.characterId === characterId;
    if (
      (approached && (game.scene.approached = game.approach.opened ? "door" : "place"),
      (milestone === "open-ask" || milestone === "marry-ask") &&
        withId &&
        characterOf(game, withId) &&
        (game.scene.about = {
          with: withId,
          ask: true,
        }),
      milestone === "friend-opinion" &&
        (game.scene.about = {
          ...(bondOf(game, characterId).asks?.about ?? {}),
        }),
      milestone === "talk" &&
        (game.scene.about = {
          talk: true,
          why: talkWhy(game, characterId),
        }),
      ["ice-over", "missed-you", "where-were-you", "reconcile"].includes(milestone) &&
        (game.scene.about = {
          plain: true,
          text: whyWords(game, characterId, milestone),
        }),
      milestone === "confront" && heardOf(game, characterId))
    ) {
      let heard = heardOf(game, characterId);
      game.scene.about = {
        with: otherIn(heard, characterId),
        confront: true,
        how: heard.how,
        from: heard.from ?? null,
        ...(heard.sure
          ? {
              sure: true,
            }
          : {}),
        denies: !heard.sure && deniesIt(game, characterId, heard.how),
        lied: !!bondOf(game, characterId).denied?.found,
      };
    }
    if ((milestone === "tells-you" || milestone === "hit-on") && bondOf(game, characterId).asks?.about) {
      game.scene.about = {
        ...bondOf(game, characterId).asks.about,
        [milestone === "hit-on" ? "hitOn" : "tells"]: true,
      };
    }
    if (milestone === "who-was-that" && bondOf(game, characterId).asks?.about) {
      game.scene.about = {
        ...bondOf(game, characterId).asks.about,
        who: true,
      };
    }
    if (milestone === "mate-moment" && bondOf(game, characterId).asks?.about) {
      game.scene.about = {
        ...bondOf(game, characterId).asks.about,
      };
    }
    if ((milestone === "drop-by" || milestone.startsWith("party-")) && bondOf(game, characterId).asks?.about) {
      game.scene.about = {
        ...bondOf(game, characterId).asks.about,
      };
    }
    let guestId = milestone.startsWith("party-") ? game.scene.about?.with : null;
    if (
      (guestId &&
        game.party?.guests[guestId] &&
        isPartyGuestActive(game.party.guests[guestId]) &&
        ((game.party.guests[guestId].room = game.party.room),
        addToEventCast(game.scene, guestId, {
          at: game.minutes,
          why: "there",
        })),
      milestone === "party-invite" && bondOf(game, characterId).asks?.party)
    ) {
      let theirParty = bondOf(game, characterId).asks.party;
      game.scene.about = {
        party: true,
        plan: theirParty,
        text: describeTheirPartyPlan(game, theirParty),
        when: `${clockFromMinutes(theirParty.at).weekday} ${clockFromMinutes(theirParty.at).day} \xB7 ${formatClockTime(theirParty.at)} \xB7 ${theirParty.home ? "at home" : "at their place"}`,
      };
    }
    if (
      (milestone === "move-in" &&
        hasOwnHome(game) &&
        sharesYourDoor(game, characterOf(game, characterId)) &&
        (game.scene.about = {
          plain: true,
          text: "They already live with the player, as housemates: this is about living together as a couple now, in the home they already share. Nobody moves house.",
        }),
      (milestone === "surprise" || milestone === "money-help") &&
        bondOf(game, characterId).asks?.about &&
        (game.scene.about = {
          ...bondOf(game, characterId).asks.about,
          [milestone === "surprise" ? "gift" : "money"]: true,
        }),
      milestone === "talk-other" && talkOtherOf(game, characterId))
    ) {
      let other = talkOtherOf(game, characterId);
      game.scene.about = {
        with: other.partner,
        how: other.how,
        from: other.from,
        other: true,
      };
    }
    if (
      (milestone === "open-them" &&
        bondOf(game, characterId).asks?.with &&
        (game.scene.about = {
          with: bondOf(game, characterId).asks.with,
          theirAsk: true,
        }),
      MILESTONES[milestone]?.own && (game.scene.about = ownAbout(game, bondOf(game, characterId), milestone)),
      milestone === "birthday-surprise" && bondOf(game, characterId).asks?.plan)
    ) {
      let outing = {
        ...bondOf(game, characterId).asks.plan,
        characterId: characterId,
      };
      game.scene.about = {
        outing: outing,
        birthday: true,
        text: `${outingAbout(game, outing)} It is the player's birthday today: they planned this to celebrate it.`,
      };
    }
    if (milestone === "birthday-invite" && bondOf(game, characterId).asks?.plan) {
      let outing = {
        ...bondOf(game, characterId).asks.plan,
        characterId: characterId,
      };
      game.scene.about = {
        outing: outing,
        birthday: true,
        text: birthdayInviteAbout(game, outing),
      };
    }
    if (milestone === "ask-you-out" && bondOf(game, characterId).asks?.plan) {
      let outing = {
        ...bondOf(game, characterId).asks.plan,
        characterId: characterId,
      };
      game.scene.about = {
        outing: outing,
        text: outingAbout(game, outing),
      };
    }
    let glow = bondOf(game, characterId).outingGlow;
    if (
      (glow &&
        glow.milestone === milestone &&
        glow.until >= game.minutes &&
        (glow.good && game.scene.reads.push("warm"), (bondOf(game, characterId).outingGlow = null)),
      milestone === "stay-away" && bondOf(game, characterId).stayAway)
    ) {
      let stayAway = (game.scene.about = {
        ...bondOf(game, characterId).stayAway,
        stayAway: true,
      });
      if (stayAway.with && isCharacterHere(game, stayAway.with)) {
        addToEventCast(game.scene, stayAway.with, {
          at: game.minutes,
          why: "there",
        });
      }
    }
    if (["partners-meet", "meet-ask", "her-or-me"].includes(milestone)) {
      let asks = bondOf(game, characterId).asks;
      if (milestone === "partners-meet") {
        let partnerIds = (asks?.id === milestone ? (asks.with ?? []) : []).filter((personId) =>
          isCharacterHere(game, personId),
        );
        game.scene.about = {
          partners: partnerIds,
        };
        for (let personId of partnerIds) {
          addToEventCast(game.scene, personId, {
            at: game.minutes,
            why: "there",
          });
        }
      } else if (asks?.id === milestone && asks.with) {
        game.scene.about = {
          with: asks.with,
        };
      }
    }
    if (
      (milestone === "propose" &&
        game.scene.by === "you" &&
        (game.scene.about = {
          how: PROPOSAL_HOW[how] ? how : null,
          ring: ringsInBag(game)[0]?.id ?? null,
        }),
      THREE_CALLS.includes(milestone))
    ) {
      let asks = bondOf(game, characterId).asks,
        thirdId = asks?.id === milestone ? asks.with?.[0] : null;
      game.scene.about = {
        with: thirdId,
        ...(asks?.plan
          ? {
              plan: asks.plan,
            }
          : {}),
      };
      if (thirdId && isCharacterHere(game, thirdId)) {
        addToEventCast(game.scene, thirdId, {
          at: game.minutes,
          why: "there",
        });
      }
    }
    if (milestone === "jealous" && bondOf(game, characterId).jealous) {
      let jealous = (game.scene.about = {
        ...bondOf(game, characterId).jealous,
      });
      if (jealous.with && isCharacterHere(game, jealous.with)) {
        addToEventCast(game.scene, jealous.with, {
          at: game.minutes,
          why: "there",
        });
      }
    }
    let begun = milestoneHandlers(milestone)?.begin?.(game, game.scene, {
      with: withId,
      how: how,
    });
    if (begun?.events?.length) {
      game.scene.begunEvents = begun.events;
    }
    if (approached && game.approach?.characterId === characterId) {
      game.approach = null;
    }
  }
  if (SCENE_KINDS[kind]?.oncePerDay) {
    bondOf(game, characterId).lastTalkDay = clockFromMinutes(game.minutes).dayIndex;
  }
  markBondBase(game);
  return game.scene;
}
function endSceneEarly(game, reply = null, { pleaSeen = true } = {}) {
  let scene = game.scene;
  return !scene || scene.done
    ? {
        ok: false,
        reason: "There is no scene running.",
      }
    : scene.phase === "tonight"
      ? {
          ok: false,
          reason: "Make your call first.",
        }
      : isEventRun(scene) && !scene.after
        ? currentEventBeat(scene)?.type !== "turns"
          ? {
              ok: false,
              reason: "Make your call first.",
            }
          : (pleaSeen && passPlea(game, "scene", scene.characterId),
            nextEventBeat(scene)?.type === "moment" ? advanceEventBeat(scene) : enterDecidePhase(scene),
            {
              ok: true,
              scene: scene,
            })
        : (reply?.lines?.length &&
            ((scene.batch = reply.lines),
            scene.log.push(
              ...reply.lines.map((line) => ({
                ...line,
                exchange: scene.exchange,
              })),
            ),
            (scene.goodbye = true)),
          pleaLeftInScene(game, {
            end: pleaSeen,
          }),
          endScene(scene, bondOf(game, scene.characterId), {
            endedBy: "player",
            remember: reply?.remember ?? "",
            each: reply?.each ?? null,
          }),
          rememberScene(game, scene),
          {
            ok: true,
            scene: scene,
          });
}
var sceneCallOpen = (scene, option) => !!scene && !scene.done && currentBeatOptions(scene).includes(option);
function canTakeStep(game) {
  let scene = game.scene;
  if (!sceneCallOpen(scene, "step")) {
    return {
      ok: false,
      reason: "There is no call to make.",
    };
  }
  let afford = canAffordFavour(scene.favour, {
    energy: game.needs.energy,
    cash: game.wallet.cash,
  });
  if (!afford.ok) {
    return {
      ok: false,
      reason: afford.why,
    };
  }
  let shortfall = stepEnergyShortfall(game, scene);
  return shortfall
    ? {
        ok: false,
        reason: shortfall,
      }
    : {
        ok: true,
      };
}
function stepEnergyShortfall(game, scene) {
  let favour = scene.favour;
  if ((!favour?.cost?.minutes && !favour?.cost?.energy) || game.untired) {
    return "";
  }
  let wayMinutes = favourWay(game, scene)?.minutes ?? 0,
    energyNeeded =
      100 -
      drainNeeds(
        {
          ...game.needs,
          energy: 100,
        },
        wayMinutes + (favour.cost.minutes ?? 0),
        {
          extraEnergy: favour.cost.energy ?? 0,
          fitness: skillLevelsOf(game).fitness,
        },
      ).energy;
  return game.needs.energy > energyNeeded
    ? ""
    : `Not enough energy: it takes ${Math.ceil(energyNeeded)}${wayMinutes ? " with the way there" : ""}, you have ${Math.floor(game.needs.energy)}`;
}
function putOffTierEvent(game, { lines = [], remember = "", each = null } = {}) {
  let scene = game.scene;
  if (!sceneCallOpen(scene, "wait")) {
    return {
      ok: false,
      reason: "There is no call to make.",
    };
  }
  let bond = bondOf(game, scene.characterId);
  postponeTierEvent(
    bond,
    scene.axis,
    tierRetryAt(bond, game.minutes, {
      byPlayer: true,
    }),
  );
  scene.verdict = {
    ...judgeSceneReads(scene.reads),
    accepted: false,
  };
  advanceEventBeat(scene);
  scene.batch = lines;
  scene.log.push(
    ...lines.map((line) => ({
      ...line,
      exchange: scene.exchange + 1,
    })),
  );
  endScene(scene, bond, {
    endedBy: "wait",
    remember: remember,
    each: each,
  });
  rememberScene(game, scene);
  return {
    ok: true,
    scene: scene,
  };
}
var stepVerdict = (game) => {
  let verdict = judgeSceneReads(game.scene?.reads ?? []),
    scene = game.scene,
    takenWith =
      verdict.accepted &&
      scene?.kind === "tier" &&
      scene.axis === "romance" &&
      bondOf(game, scene.characterId)?.status === "single"
        ? takenBy(game, scene.characterId)
        : null;
  return takenWith
    ? {
        ...verdict,
        accepted: false,
        taken: takenWith.name,
      }
    : verdict;
};
function settleTierEvent2(game, { accepted: accepted, taken = "", lines = [], remember = "", each = null }) {
  let scene = game.scene,
    bond = bondOf(game, scene.characterId),
    before = {
      friendship: bond.friendship,
      romance: bond.romance,
      trust: bond.trust,
    },
    events = [];
  if (accepted) {
    let favour = scene.favour;
    if (
      (favour?.cost?.minutes && (events = advanceTime(game, favour.cost.minutes).events),
      favour?.cost?.energy &&
        (game.needs = drainNeeds(game.needs, 0, {
          extraEnergy: favour.cost.energy,
          extraHunger: 0,
          fitness: skillLevelsOf(game).fitness,
        })),
      (events = [...events, ...collapseIfSpent(game)]),
      hasFaintedEvent(events))
    ) {
      if (game.faintMemo?.kind === "scene" && favour?.what) {
        game.faintMemo.doing = `the favour they had asked the player for: ${favour.what}`;
      }
      return {
        ok: true,
        events: events,
        fainted: true,
      };
    }
    if (favour?.cost?.cash) {
      lendFor(game, scene.characterId, favour.cost.cash, favour.what);
    }
    settleTierEvent(bond, scene.axis);
    if (
      scene.axis === "romance" &&
      scene.tier === 2 &&
      bond.status === "single" &&
      !conflictingPartner(bond, Object.values(game.bonds))
    ) {
      setRelationshipStatus(bond, "dating", {
        at: game.minutes,
      });
      events.push({
        id: "dating",
        characterId: bond.characterId,
        text: `You and ${characterOf(game, bond.characterId)?.name ?? "them"} are dating now.`,
      });
      scene.seenBy = recordTownFact(game, "confess", {
        with: bond.characterId,
        place: game.at,
        witnesses: sawIt(game, bond.characterId),
      });
      learnedFact(game, scene.seenBy, game.facts.at(-1).id, "seen");
      recordTownFact(game, "dating", {
        with: bond.characterId,
        place: game.at,
      });
    }
  } else {
    postponeTierEvent(bond, scene.axis, tierRetryAt(bond, game.minutes));
    if (scene.axis === "romance") {
      applyBondAction(
        bond,
        {
          action: "flirt",
          romance: -1,
        },
        {
          at: game.minutes,
          today: false,
          share: "event",
        },
      );
    }
  }
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round((scene.totals[axis] + bond[axis] - before[axis]) * 10) / 10;
  }
  scene.verdict = {
    ...judgeSceneReads(scene.reads),
    accepted: accepted,
    ...(!accepted && taken
      ? {
          taken: taken,
        }
      : {}),
  };
  advanceEventBeat(scene);
  scene.batch = lines;
  scene.log.push(
    ...lines.map((line) => ({
      ...line,
      exchange: scene.exchange + 1,
    })),
  );
  if (accepted && scene.favourWent) {
    scene.did = {
      exchange: scene.exchange,
      logAt: scene.log.length,
      tags: [
        {
          text: `\u2192 ${scene.favourWent.name} \xB7 ${scene.favourWent.minutes} min`,
          step: true,
        },
      ],
    };
  }
  endScene(scene, bond, {
    endedBy: accepted ? "accepted" : "refused",
    remember: remember,
    each: each,
  });
  rememberScene(game, scene);
  logNote(
    game,
    `${tierStepMoment(scene.axis, scene.tier, scene.couple)?.title ?? "A step"} with ${characterOf(game, scene.characterId)?.name ?? "someone"}: ${accepted ? "yes" : "not yet"}`,
    "social",
  );
  return {
    ok: true,
    events: events,
  };
}
function rememberScene(game, scene, { at = game.minutes } = {}) {
  let character = characterOf(game, scene.characterId);
  if (character && scene.remember) {
    addMemory(character, {
      at: at,
      text: scene.remember,
      from: scene.kind,
    });
    for (let personId of eventCast(scene)) {
      if (personId !== scene.characterId) {
        rememberPair(game, scene.characterId, personId, {
          text: scene.remember,
          from: scene.kind,
          by: scene.characterId,
          at: at,
        });
      }
    }
  }
  if (!scene.each) {
    return;
  }
  let cast = eventCast(scene),
    toKeep = Object.entries(scene.each)
      .filter(
        ([personId, text]) =>
          text &&
          personId !== scene.characterId &&
          cast.includes(personId) &&
          characterOf(game, personId) &&
          !characterOf(game, personId).npc,
      )
      .filter(([personId]) => !(scene.eachKept ?? []).includes(personId))
      .slice(0, Math.max(0, MAX_REMEMBER_OTHERS - (scene.eachKept ?? []).length));
  for (let [personId, text] of toKeep) {
    addMemory(characterOf(game, personId), {
      at: at,
      text: text,
      from: scene.kind,
    });
  }
  delete scene.each;
  scene.eachKept = [...new Set([...(scene.eachKept ?? []), ...toKeep.map(([personId]) => personId)])];
}
var FRIENDSHIP_TIER_PLAYER_WORDS = [
  "an acquaintance of the player's",
  "on friendly terms with the player",
  "a friend of the player's",
  "a close friend of the player's",
  "the player's best friend",
];
function toPlayerWords(game, characterId) {
  let bond = bondOf(game, characterId);
  if (bond.kin) {
    return `the player's ${kinWordFor(bond.kin, characterOf(game, characterId)?.gender ?? null) || "relative"}: family`;
  }
  let statusWords = {
    married: "the player's spouse",
    engaged: "engaged to the player",
    living: "the player's partner; they live together",
    partners: "the player's partner",
    dating: "dating the player",
    ex: "the player's ex",
  }[bond.status];
  return (
    statusWords ||
    (isActiveRival(bond)
      ? "the player's rival"
      : (FRIENDSHIP_TIER_PLAYER_WORDS[bondTier(bond, "friendship")] ?? FRIENDSHIP_TIER_PLAYER_WORDS[0]))
  );
}
function rememberersOf(game, ids = []) {
  return [...new Set(ids)]
    .map((personId) => characterOf(game, personId))
    .filter((character) => character && !character.npc && bondOf(game, character.id) && hasMet2(game, character.id))
    .sort((first, second) => bondOf(game, second.id).friendship - bondOf(game, first.id).friendship)
    .slice(0, MAX_REMEMBER_OTHERS)
    .map((character) => ({
      id: character.id,
      name: character.name,
      what: toPlayerWords(game, character.id),
    }));
}
function sceneProgress(game, scene) {
  if (scene.done) {
    return 1;
  }
  let perExchange = (SCENE_KINDS[scene.kind] ?? SCENE_KINDS.intro).minutesPerExchange,
    span = Math.min(scene.leavesAt ?? 1 / 0, scene.startedAt + scene.max * perExchange) - scene.startedAt;
  return span > 0 ? Math.max(0, Math.min(1, (game.minutes - scene.startedAt) / span)) : 1;
}
var pictureViews = (game, ids) =>
  ids
    .map((pictureId) => albumEntryById(game, pictureId))
    .filter(Boolean)
    .map((entry) => ({
      id: entry.id,
      beat: entry.beat,
      status: entry.status,
      url: albumEntryView(entry).url,
    }));
function lookNow(game, character) {
  let workAvatar = character ? workingLook(game, character.id).avatar : null;
  return {
    ...characterPortrait(character, game),
    ...(workAvatar
      ? {
          avatar: workAvatar,
        }
      : {}),
  };
}
function castBonds(game, scene, ids = []) {
  return [...new Set(ids)]
    .filter((personId) => game.bonds?.[personId] && characterOf(game, personId))
    .map((personId) => {
      let bond = game.bonds[personId],
        summary = bondSummary(bond),
        base = scene?.bondBase?.[personId];
      return {
        id: personId,
        name: nameFor(game, characterOf(game, personId)),
        bond: {
          friendship: summary.friendship,
          romance: summary.romance,
          trust: summary.trust,
        },
        totals: base
          ? Object.fromEntries(
              BOND_AXES.map((axis) => [axis, Math.round((bond[axis] - (base[axis] ?? bond[axis])) * 10) / 10]),
            )
          : {},
      };
    });
}
function markBondBase(game) {
  let snapshot = (holder, ids) => {
    for (let personId of ids) {
      let bond = game.bonds?.[personId];
      if (!(!bond || holder.bondBase?.[personId])) {
        (holder.bondBase ??= {})[personId] = {
          friendship: bond.friendship,
          romance: bond.romance,
          trust: bond.trust,
        };
      }
    }
  };
  if (game.scene && !game.scene.done) {
    snapshot(game.scene, eventCast(game.scene).slice(1));
  }
  let outing = game.outing;
  if (outing) {
    snapshot(outing, [
      ...(outing.group ?? []),
      ...(outing.interrupt?.id && outing.interrupt.phase !== "lines" ? [outing.interrupt.id] : []),
    ]);
  }
}
function tierCallOptions(game, scene) {
  let tierName = tierNameForKind(scene.couple, scene.axis, scene.tier) ?? "",
    canStep = canTakeStep(game),
    stepLabel = scene.favour ? (scene.favour.fixed ? scene.favour.what : "") : scene.stepFixed ? scene.step : "";
  return [
    {
      id: "step",
      ...(stepLabel
        ? {
            label: stepLabel,
          }
        : {}),
      note: scene.favour
        ? `Take the step to ${tierName} \xB7 you do the favour right after this`
        : `Take the step to ${tierName} \xB7 unless the talk went badly`,
      ...(canStep.ok
        ? {}
        : {
            why: `You can't right now: ${canStep.reason}`,
          }),
    },
    {
      id: "wait",
      label: scene.favour ? "Not today" : "Let it be, for now",
      note: "Nothing lost \xB7 you can try again tomorrow",
    },
  ];
}
function sceneView(game) {
  let scene = game.scene;
  if (!scene) {
    return null;
  }
  let character = characterOf(game, scene.characterId);
  return {
    kind: scene.kind,
    label: scene.partyMoment
      ? scene.partyMoment.name
      : scene.after === "wedding"
        ? "The morning after"
        : scene.milestone === "friend-opinion"
          ? `${character ? nameFor(game, character) : "Someone"} has something to say`
          : scene.milestone === "talk" && scene.by === "you"
            ? "Talk it out"
            : scene.kind === "milestone" && MILESTONES[scene.milestone]?.special
              ? MILESTONES[scene.milestone].def.label
              : (SCENE_KINDS[scene.kind]?.label ?? scene.kind),
    characterId: scene.characterId,
    cast: eventCast(scene),
    pictures: pictureViews(game, scene.pictures ?? []).map((picture) => ({
      ...picture,
      from: scene.pictureFrom?.[picture.id] ?? null,
    })),
    moment: !!scene.moment,
    event: scene.event ?? null,
    beat: isEventRun(scene)
      ? {
          at: scene.beat,
          type: currentEventBeat(scene)?.type ?? null,
          of: scene.beats.length,
          next: nextEventBeat(scene)?.type ?? null,
        }
      : null,
    name: scene.nameKnown && character ? character.name : UNKNOWN_NAME,
    ...lookNow(game, character),
    looks: Object.fromEntries(
      eventCast(scene)
        .slice(1)
        .map((personId) => [
          personId,
          {
            ...lookNow(game, characterOf(game, personId)),
            name: nameFor(
              game,
              characterOf(game, personId) ?? {
                id: personId,
                name: "",
              },
            ),
          },
        ]),
    ),
    place: scene.placeName ?? townPlace(game.town, scene.place)?.name ?? "",
    exchange: scene.exchange,
    max: scene.max,
    batch: scene.batch,
    log: scene.log,
    suggestions: scene.suggestions,
    reads: scene.reads,
    lastRead: scene.reads.at(-1) ?? null,
    did: scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length ? scene.did.tags : [],
    job: sceneJobView(game),
    together: scene.together ?? null,
    partyMoment: scene.partyMoment ?? null,
    others: castBonds(game, scene, eventCast(scene).slice(1)),
    partyPlan: scene.partyPlan ?? null,
    ride: scene.ride ?? null,
    stay: !!scene.stay,
    next: scene.next ?? null,
    walk: scene.walk ?? null,
    walkIn: walkInView(game, scene),
    wentAfter: scene.walkIn?.choice === "go" ? (characterOf(game, scene.walkIn.id)?.name ?? null) : null,
    wentWith: scene.endedBy === "went-with" ? (characterOf(game, scene.walkIn?.id)?.name ?? null) : null,
    lastApplied: scene.lastApplied,
    lastLimits: scene.lastLimits ?? {},
    limits: scene.limits ?? {},
    totals: scene.totals,
    unanswered: scene.unanswered ?? null,
    minutes: (scene.faint?.at ?? game.minutes) - scene.startedAt,
    leaves: scene.leavesAt === null || scene.leavesAt === undefined ? "" : formatClockTime(scene.leavesAt),
    leaveReason: scene.leaveReason ?? "leaves",
    minutesLeft:
      scene.leavesAt === null || scene.leavesAt === undefined ? null : Math.max(0, scene.leavesAt - game.minutes),
    progress: sceneProgress(game, scene),
    done: scene.done,
    endedBy: scene.endedBy,
    goodbye: !!scene.goodbye,
    remember: scene.remember,
    faint: scene.faint ?? null,
    bond: game.bonds[scene.characterId] ? bondSummary(game.bonds[scene.characterId]) : null,
    npc: character?.npc
      ? {
          about: character.about ?? "",
          remembers: memoriesInBudget(character).at(-1)?.text ?? "",
        }
      : null,
    watching: scene.watching ?? null,
    remembers: scene.remembers ?? null,
    kept: scene.kept ?? null,
    milestone: scene.kind === "milestone" ? milestoneView(game, scene) : null,
    here: hereView(game, scene),
    seenBy: (scene.seenBy ?? []).map((personId) => knownName(game, personId)),
    tier:
      scene.kind === "tier"
        ? {
            axis: scene.axis,
            to: scene.tier,
            fromName: tierNameForKind(scene.couple, scene.axis, scene.tier - 1) ?? "",
            toName: tierNameForKind(scene.couple, scene.axis, scene.tier) ?? "",
            phase: scene.phase,
            step: scene.step || tierStepMoment(scene.axis, scene.tier, scene.couple)?.title || "",
            title: tierStepMoment(scene.axis, scene.tier, scene.couple)?.title ?? "",
            favour: scene.favour,
            favourAt: scene.favour && !scene.done ? favourWay(game, scene) : null,
            favourWent: scene.favourWent ?? null,
            canStep: scene.phase === "decide" && !scene.done ? canTakeStep(game) : null,
            call: scene.phase === "decide" && !scene.done ? tierCallOptions(game, scene) : null,
            detected:
              scene.detected && !scene.done
                ? {
                    act: scene.detected.act,
                  }
                : null,
            verdict: scene.verdict,
            retryDays:
              scene.done && scene.endedBy !== "accepted"
                ? (milestoneEventsFor(game, scene.characterId).list.find((tierEvent) => tierEvent.axis === scene.axis)
                    ?.daysLeft ?? 0)
                : 0,
            perks:
              scene.axis === "friendship" && scene.done && scene.endedBy === "accepted"
                ? newPerksAtTier(game, scene.characterId, scene.tier)
                : [],
          }
        : null,
  };
}
function calendarView(game, offset = 0) {
  return calendarMonthView(game, offset, {
    rent: rentShareOf(game),
  });
}
var editCalendarNote2 = (game, edit) => editCalendarNote(game, edit);
function imageChoice(game) {
  let images = game.settings?.images ?? {};
  return images.connectionId
    ? {
        connectionId: images.connectionId,
        styleProfileId: images.styleProfileId ?? null,
      }
    : {
        connectionId: game.look?.connectionId || null,
        styleProfileId: game.look?.styleProfileId || null,
      };
}
var keyImagesOn = (game) => !!game.rules?.keyImages && !!imageChoice(game).connectionId;
var keyImageAside = (game, entry) =>
  !!entry &&
  (entry.cast ?? []).some((personId) => personId !== "you" && !characterOf(game, personId) && isNpc(game, personId));
var albumOf = (game, characterId = null) =>
  albumView(game, {
    characterId: characterId,
    hide: (entry) => keyImageAside(game, entry),
    nameOf: (personId) =>
      personId === "you"
        ? (game.persona?.name ?? "You")
        : nameFor(
            game,
            characterOf(game, personId) ?? {
              id: personId,
              name: npcNameAside(game, personId),
            },
          ),
  }).map((entry) => ({
    ...entry,
    when: `${formatCalendarDate(entry.at, {
      from: game.startedAt,
    })} \xB7 ${formatClockTime(entry.at)}`,
  }));
var pictureSubject = (game) =>
  firstModuleHook(game, "backdropHere") ??
  (game.visit?.stage === "inside"
    ? residenceBackgroundSubject(characterOf(game, game.visit.characterId)?.residence?.place, game.wallet?.home)
    : backgroundSubjectOfPlace(game.at, game.wallet?.home));
function keyImageFor(game, scene, { beat: beat, picture: picture, label: label, place = null }) {
  if (!keyImagesOn(game) || !picture || scene.endedBy === "fainted") {
    return null;
  }
  let subject = pictureSubject(game),
    entryId = addAlbumEntry(game, {
      event: scene.event,
      beat: beat,
      label: label,
      cast: eventCast(scene),
      at: game.minutes,
      place: place ?? (game.at === "home" ? "Home" : (townPlace(game.town, game.at)?.name ?? game.at)),
      subject: subject,
      time: dayOrNightAt(game.minutes),
      picture: picture,
      status: pictureModeOf(game, "keys") === "auto" ? "queued" : "manual",
      noYou: !!scene.watching,
    });
  scene.pictures = [...(scene.pictures ?? []), entryId];
  return entryId;
}
function figuresOf(game, ids, { you = true } = {}) {
  let personaFigure = game.personaFigure ?? null,
    yourFigure = isClothesRuleOn(game)
      ? {
          sex: personaFigure?.sex ?? "other",
          body: game.clothes.appearance || personaFigure?.body || "",
          outfit: wearingText(game) || personaFigure?.outfit || "",
        }
      : personaFigure,
    figures = ids.map((personId) => {
      let character = characterOf(game, personId),
        figure = character?.figure ?? null;
      return figure && character.workOutfit && workingNow(game, character)
        ? {
            ...figure,
            outfit: character.workOutfit,
          }
        : figure;
    });
  return (you ? [yourFigure, ...figures] : figures).map((figure) =>
    figure?.sex ? { ...figure, sex: pictureSexOf(game, figure.sex) } : figure,
  );
}
function picturePeople(game, ids, { you = true } = {}) {
  let figures = figuresOf(game, ids, {
    you: you,
  });
  return [...(you ? ["you"] : []), ...ids].map((personId, index) => {
    let figure = figures[index],
      character = personId === "you" ? null : characterOf(game, personId);
    return {
      name: personId === "you" ? game.persona?.name || "the player" : (character?.name ?? npcNameAside(game, personId)),
      sex: pictureSexOf(game, genderOf(game, personId) ?? figure?.sex ?? "other"),
      body: figure?.body || (personId === "you" ? "" : (character?.appearance ?? "")),
      outfit: figure?.outfit ?? "",
    };
  });
}
function setFigure(game, characterId, input) {
  let character = characterOf(game, characterId);
  if (!character || !hasMet2(game, characterId)) {
    return {
      ok: false,
      reason: "You have not met them.",
    };
  }
  let figure = cleanFigure(input, {
    from: "hand",
  });
  return figure.body
    ? ((character.figure = figure),
      normalizeGender(figure.sex) &&
        setOrientation(game, characterId, {
          gender: figure.sex,
        }),
      {
        ok: true,
        figure: figure,
      })
    : {
        ok: false,
        reason: "Describe their body first.",
      };
}
var MAX_IN_TOWN = 30;
var BOOLEAN_RULE_KEYS = [
  "hunger",
  "jealousy",
  "drifting",
  "multipleRelationships",
  "keyImages",
  "castCouples",
  "partnersStray",
  "workOutfits",
  "seasonOutfits",
  "npcs",
];
function cleanRulesIn(input = {}) {
  let rules = {};
  if (!input || typeof input != "object") {
    return rules;
  }
  for (let key of [...BOOLEAN_RULE_KEYS, "clothes"]) {
    if (typeof input[key] == "boolean") {
      rules[key] = input[key];
    }
  }
  for (let key of ["showArchetypes", "showSchedules"]) {
    if (SHOW_RULE_MODES.includes(input[key])) {
      rules[key] = input[key];
    }
  }
  return rules;
}
function setRules(game, input = {}) {
  if (input.npcs === false && npcsOn(game) && moduleToggleBusyReason(game)) {
    return {
      ok: false,
      reason: moduleToggleBusyReason(game),
      rules: game.rules,
    };
  }
  let rules = {
    ...game.rules,
  };
  for (let key of BOOLEAN_RULE_KEYS) {
    if (typeof input[key] == "boolean") {
      rules[key] = input[key];
    }
  }
  if (rules.keyImages && !imageChoice(game).connectionId) {
    rules.keyImages = false;
  }
  if (rules.workOutfits && !imageChoice(game).connectionId) {
    rules.workOutfits = false;
  }
  if (rules.seasonOutfits && !imageChoice(game).connectionId) {
    rules.seasonOutfits = false;
  }
  for (let key of ["showArchetypes", "showSchedules"]) {
    if (SHOW_RULE_MODES.includes(input[key])) {
      rules[key] = input[key];
    }
  }
  game.rules = rules;
  return {
    ok: true,
    rules: rules,
  };
}
function setLifeSettings(game, input = {}, { efforts = REASONING_EFFORT_LEVELS } = {}) {
  let settings = {
      ...game.settings,
    },
    clip = (value, max = 80) =>
      String(value ?? "")
        .trim()
        .slice(0, max);
  if (
    (input.connection !== undefined && (settings.connection = clip(input.connection) || null),
    input.effort !== undefined && efforts.includes(input.effort) && (settings.effort = input.effort),
    input.language !== undefined && (settings.language = normalizeLanguageName(input.language)),
    input.imageConnection !== undefined || input.imageStyle !== undefined)
  ) {
    let images = {
      ...(settings.images ?? {}),
    };
    if (input.imageConnection !== undefined) {
      images.connectionId = clip(input.imageConnection) || null;
    }
    if (input.imageStyle !== undefined) {
      images.styleProfileId = clip(input.imageStyle) || null;
    }
    settings.images = images;
  }
  game.settings = settings;
  return {
    ok: true,
    settings: settings,
  };
}
function refreshFromCard(game, characterId, card) {
  let character = characterOf(game, characterId);
  if (!character) {
    return {
      ok: false,
      reason: "They are not in this life.",
    };
  }
  if (!card) {
    return {
      ok: false,
      reason: "Their character card is no longer in the engine.",
    };
  }
  let description = card.description || card.personality || "",
    appearance = card.appearance || "",
    changed = [],
    cardName = cleanCharacterName(card.name);
  if (cardName && cardName !== (character.cardName ?? character.name)) {
    character.name = cardName;
    changed.push("name");
  }
  if (cardName) {
    character.cardName = cardName;
  }
  if (description && description !== character.description) {
    character.description = description;
    changed.push("description");
  }
  if (appearance && appearance !== character.appearance) {
    character.appearance = appearance;
    delete character.figure;
    changed.push("appearance");
  }
  if (changed.length) {
    logNote(game, `${character.name}: updated from their card`, "bond");
  }
  return {
    ok: true,
    name: character.name,
    changed: changed,
  };
}
var CHARACTER_NAME_MAX = 60;
var cleanCharacterName = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CHARACTER_NAME_MAX);
function renameCharacter(game, characterId, newName) {
  let character = characterOf(game, characterId);
  if (!character) {
    return {
      ok: false,
      reason: "They are not in this life.",
    };
  }
  let cleanName = cleanCharacterName(newName);
  if (!cleanName) {
    return {
      ok: false,
      reason: "Write their name.",
    };
  }
  let oldName = character.name;
  character.cardName ??= oldName;
  character.name = cleanName;
  if (cleanName !== oldName) {
    logNote(game, `${oldName} is now ${cleanName}`, "bond");
  }
  return {
    ok: true,
    name: cleanName,
    was: oldName,
  };
}
function setTraits(game, characterId, traits, { tone = null, byYou = false, thing = null } = {}) {
  let bond = game.bonds?.[characterId],
    character = characterOf(game, characterId);
  if (!bond || !character) {
    return {
      ok: false,
      reason: "They are not in this life.",
    };
  }
  let normalized = normalizeTraits({
    ...traits,
    tone: tone ?? traitsOf(game, characterId).tone,
    from: "own",
  });
  bond.traits = normalized;
  character.traits = normalized;
  if (byYou) {
    character.traitsBy = "you";
  }
  if (THEIR_THING_ACTIVITIES[thing]) {
    character.theirThing = thing;
    character.thingBy = "you";
  }
  return {
    ok: true,
    name: character.name,
  };
}
function setReadTraits(game, characterId, read) {
  let bond = game.bonds?.[characterId],
    character = characterOf(game, characterId);
  return !bond || !character || !read?.traits
    ? {
        ok: false,
        reason: "They are not in this life.",
      }
    : (read.thing && character.thingBy !== "you" && (character.theirThing = read.thing),
      character.traitsBy === "you"
        ? {
            ok: true,
            name: character.name,
            kept: true,
          }
        : ((character.archetype = {
            main: read.main,
            second: read.second ?? null,
          }),
          (bond.archetype = {
            ...character.archetype,
          }),
          setTraits(game, characterId, read.traits, {
            tone: read.traits.tone,
          })));
}
function setAway(game, characterId, away) {
  let character = characterOf(game, characterId);
  if (!character) {
    return {
      ok: false,
      reason: "They are not in this life.",
    };
  }
  if (!away && castInTown(game).length >= MAX_IN_TOWN) {
    return {
      ok: false,
      reason: `The town is full (${MAX_IN_TOWN}).`,
    };
  }
  if (away && game.scene && !game.scene.done && game.scene.characterId === characterId) {
    return {
      ok: false,
      reason: "You are in the middle of a scene with them.",
    };
  }
  if (((character.away = !!away), holdDebtsWhileAway(game, characterId, !!away), away)) {
    if (game.party && game.party.host === characterId) {
      leaveTheirPartyIfAny(game);
    }
    if (game.bonds?.[characterId]) {
      game.bonds[characterId].asks = null;
    }
    for (let key of ["guest", "visit", "approach", "moment"]) {
      if (game[key]?.characterId === characterId) {
        game[key] = null;
      }
    }
  }
  if (
    !away &&
    character.job?.id &&
    jobHolders(game.characters.filter((other) => other.id !== characterId))[character.job.id]
  ) {
    setJob(game, characterId, "out");
  }
  logNote(game, `${character.name} ${away ? "moved away" : "came back to town"}`, "bond");
  return {
    ok: true,
    name: character.name,
  };
}
function addCast(game, cards = []) {
  let fresh = cards.filter((card) => card?.id && !characterOf(game, card.id));
  if (castInTown(game).length + fresh.length > MAX_IN_TOWN) {
    return {
      ok: false,
      reason: `The town has room for ${MAX_IN_TOWN - castInTown(game).length} more.`,
    };
  }
  let at = game.minutes;
  for (let card of fresh) {
    let place = validResidencePlace(card.livesIn) ?? "apartments",
      takenUnits = [
        ...game.characters
          .filter((character2) => character2.residence?.place === place)
          .map((character2) => character2.residence.unit),
        ...(game.residence?.place === place ? [game.residence.unit] : []),
      ],
      character = {
        ...card,
        birthday: normalizeBirthday(card.birthday) ?? rollBirthday(game.seed, card.id),
        residence: {
          place: place,
          unit: nextFreeUnit(place, takenUnits),
        },
        gender: normalizeGender(card.gender) ?? normalizeGender(card.figure?.sex),
        into: normalizeAttraction(card.into),
      };
    game.characters.push(character);
    game.bonds[card.id] = initialBondForCharacter(character, {
      at: at,
      you: normalizeGender(game.gender),
    });
    game.seenSchedule[card.id] ??= {};
    logNote(game, `${card.name} moved to town`, "bond");
  }
  return {
    ok: true,
    added: fresh.map((card) => card.name),
  };
}

export {
  CHARACTER_NAME_MAX,
  COLLAPSE_RULES,
  LEAVING_HORIZON,
  MAX_IN_TOWN,
  OPEN_UP_FROM_TIER,
  QUICK_PER_DAY,
  ROUGH_SLEEP_ACTIVITY,
  SHOW_RULE_MODES,
  UNKNOWN_NAME,
  activitiesHere,
  addCast,
  advanceTime,
  albumOf,
  beginScene,
  bondOf,
  bondProfileFor,
  calendarView,
  canStartScene,
  canTakeStep,
  castBonds,
  castInTown,
  characterOf,
  characterSheet2,
  cleanCharacterName,
  cleanRulesIn,
  closingWhy,
  collapseIfSpent,
  comingToYou,
  contactsList2,
  corridorView,
  createGame,
  doActivity,
  editCalendarNote2,
  editMemory2,
  endSceneEarly,
  eventsCutShort,
  faintMemoFor,
  figuresOf,
  fireArrivedHook,
  firstDayView,
  gaveGiftToday,
  giftInfo,
  giftResultFor,
  giveGift,
  goToPlace,
  handOverGift,
  hasFaintedEvent,
  hasMet2,
  hudView,
  imageChoice,
  interactWith,
  isCharacterHere,
  isNoFlirtBond,
  isNpc,
  keyImageAside,
  keyImageFor,
  keyImagesOn,
  leavingAt,
  livingWithYou,
  logNote,
  lookNow,
  mallHallView,
  markBondBase,
  markFirstDaySeen,
  markSeenHere,
  nameFor,
  npcNameAside,
  npcsOn,
  peopleAtPlaces,
  peopleHere,
  picturePeople,
  pictureSubject,
  pictureViews,
  putOffTierEvent,
  refreshFromCard,
  rememberScene,
  rememberersOf,
  renameCharacter,
  sceneBusyReason,
  sceneCallOpen,
  sceneContext,
  sceneView,
  setAway,
  setFace,
  setFigure,
  setJustFriends,
  setLifeSettings,
  setMemoryBudget2,
  setReadTraits,
  setRules,
  setTraits,
  settleTierEvent2,
  sharesYourDoor,
  skillLevelsOf,
  sleepBlockedReason,
  stepVerdict,
  toPlayerWords,
  traitsOf,
  whereOpts,
  whereabouts,
  whoIsHere,
  youView,
};
