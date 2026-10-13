// Save-file layer: life ids, create/duplicate/rename, playtime, save migration and the full client life view
import { defineModuleExports } from "../runtime/esbuild-runtime.mjs";
import { clockFromMinutes, formatCalendarDate, formatClockTime } from "../time/clock.mjs";
import { assignStoresToWeek, weekVisitsMall } from "../schedule/routines.mjs";
import { addDefaultSleep, isLegacySlotWeek, migrateLegacySlotWeek, weekHasSleep } from "../schedule/model-week.mjs";
import { JOBS_BY_PLACE } from "../jobs/job-catalog.mjs";
import { openTownJobs, townJobById } from "../jobs/town-jobs.mjs";
import { applyJobToWeek, isJobSpan } from "../jobs/job-week.mjs";
import { RESIDENCE_PLACES } from "../housing/residence-places.mjs";
import { residenceForHomeKind } from "../housing/residence-units.mjs";
import { assignResidences } from "../housing/residences.mjs";
import { startEventRun } from "../events/event-cast.mjs";
import { archetypeDefaultTraits, normalizeTraits } from "../traits/traits.mjs";
import { TRUST_CAP_DAYS, bondSummary, bondTier, hasMet, settleTierEvent } from "../relationships/bonds.mjs";
import { normalizeBirthday, rollBirthday } from "../relationships/birthdays.mjs";
import { TIER_STEP_EVENT } from "../relationships/tier-steps.mjs";
import { BAG_SLOTS } from "../items/catalog.mjs";
import { createStartingThings } from "../items/inventory.mjs";
import { ensureSocialNetwork } from "../network/npc-pairs.mjs";
import { normalizeSpriteFrame } from "../characters/season-outfits.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { officePositionById } from "../jobs/office-job.mjs";
import { HOME_KINDS } from "../home/home-kinds.mjs";
import { HOSPITAL_BILL_DUE_DAYS, homeKindOf, normalizeHomeKind, rentSeasonKey } from "../money/wallet.mjs";
import { RETIRED_PLACE_REDIRECTS, TOWN_PLACES, storesInside } from "../town/places.mjs";
import { buildTown, districtOfPlace, districtRoute, isPlaceOpen, townDistricts } from "../town/town-layout.mjs";
import { backgroundSizeOr, cleanPictureModes, portraitSizeOr } from "../images/backgrounds.mjs";
import {
  activeModuleIds,
  hiddenModulePlaces,
  lifeHasModuleNpcs,
  moduleToggleBusyReason,
} from "../modules/module-registry.mjs";
import { lentView, pleaView } from "../money/pleas-and-loans.mjs";
import { guestView } from "../social/guest-visits.mjs";
import { planStrip, plansView } from "../plans/plans.mjs";
import { outingView, planOuting, settleOuting } from "../outings/outing.mjs";
import { partyPlanView } from "../parties/house-party.mjs";
import { buildPartyView } from "../parties/party.mjs";
import { billsView } from "../home/residence.mjs";
import { householdView } from "../money/household.mjs";
import { isClothesRuleOn, personaCutout, personaPicture, wearingItem } from "../home/furniture-and-wardrobe.mjs";
import { togetherActivities, visitView } from "../visits/staying-over.mjs";
import { weddingReady, weddingView } from "../romance/wedding.mjs";
import { counterView, fittingView } from "../shop/store-counter.mjs";
import { goingBy, hopOf, rideView, travelFor } from "../travel/vehicles-rides.mjs";
import {
  MAX_IN_TOWN,
  UNKNOWN_NAME,
  activitiesHere,
  characterOf,
  contactsList2,
  corridorView,
  createGame,
  firstDayView,
  hudView,
  imageChoice,
  keyImageAside,
  keyImagesOn,
  mallHallView,
  npcsOn,
  peopleAtPlaces,
  peopleHere,
  sceneView,
} from "../game.mjs";

var lifeSaveExports = {};
defineModuleExports(lifeSaveExports, {
  PLAYTIME_STEP_MAX: () => PLAYTIME_STEP_MAX,
  SAVE_VERSION: () => SAVE_VERSION,
  addPlaytime: () => addPlaytime,
  createLife: () => createLife,
  duplicate: () => duplicateLife,
  headlineBonds: () => headlineBonds,
  migrate: () => migrateLife,
  newId: () => newLifeId,
  rename: () => renameLife,
  summary: () => lifeSummary,
  touch: () => touchLife,
  view: () => lifeView,
});
var isPlaceOpenNow = (game, place) => isPlaceOpen(place, game.minutes);
var minutesToPlace = (game, placeId) => travelFor(game, game.at, placeId);
var SAVE_VERSION = 2;
function districtsView(game) {
  let here = districtOfPlace(game.town, game.at),
    districts = townDistricts(game.town),
    names = Object.fromEntries(districts.map((district) => [district.id, district.name]));
  return districts.map((district) => {
    let route = districtRoute(game.town, here, district.id);
    return {
      id: district.id,
      name: district.name,
      places: district.places,
      route: route,
      minutes: route ? (route.length - 1) * hopOf(game) : null,
      through: route && route.length > 2 ? names[route[1]] : null,
    };
  });
}
var slugifyLifeName = (lifeName) =>
  String(lifeName ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
function newLifeId(lifeName = "life") {
  return `${slugifyLifeName(lifeName) || "life"}-${Math.random().toString(36).slice(2, 8)}`;
}
function createLife(input = {}, { now = Date.now() } = {}) {
  return {
    ...createGame(input),
    id: input.id ?? newLifeId(input.name ?? "life"),
    saveVersion: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    playedMs: 0,
    lastScene: input.lastScene ?? null,
  };
}
function touchLife(life, { now = Date.now() } = {}) {
  life.updatedAt = now;
  return life;
}
var PLAYTIME_STEP_MAX = 180 * 1e3;
function addPlaytime(life, deltaMs) {
  let added = Math.max(0, Math.min(PLAYTIME_STEP_MAX, Math.round(Number(deltaMs) || 0)));
  life.playedMs = (Number(life.playedMs) || 0) + added;
  return added;
}
function headlineBonds(game, limit = 4) {
  return rankedBonds(game)
    .slice(0, limit)
    .map(({ bond: bond, view: view }) => ({
      id: bond.characterId,
      name: hasMet(bond) ? (characterOf(game, bond.characterId)?.name ?? bond.characterId) : UNKNOWN_NAME,
      status: view.status.id === "single" ? view.friendship.name : view.status.name,
      romance: view.romance.tier >= 2,
      drifting: view.drifting,
      met: hasMet(bond),
      ...characterPortrait(characterOf(game, bond.characterId), game),
    }));
}
function rankedBonds(game) {
  let statusRank = {
      married: 6,
      engaged: 5,
      living: 4,
      partners: 3,
      dating: 2,
      single: 0,
      ex: -1,
    },
    score = (bond) => (bond.friendship ?? 0) + (bond.romance ?? 0) + (bond.trust ?? 0);
  return Object.values(game.bonds ?? {})
    .filter((bond) => !characterOf(game, bond.characterId)?.away)
    .map((bond) => ({
      bond: bond,
      view: bondSummary(bond),
    }))
    .sort(
      (first, second) =>
        hasMet(second.bond) - hasMet(first.bond) ||
        (statusRank[second.view.status.id] ?? 0) - (statusRank[first.view.status.id] ?? 0) ||
        score(second.bond) - score(first.bond) ||
        (second.bond.lastSeen ?? 0) - (first.bond.lastSeen ?? 0),
    );
}
function lifeSummary(life) {
  let clock = clockFromMinutes(life.minutes, {
    from: life.startedAt,
  });
  return {
    id: life.id,
    name: life.name,
    persona: life.persona?.name ?? "",
    date: formatCalendarDate(life.minutes, {
      from: life.startedAt,
    }),
    time: formatClockTime(life.minutes),
    day: clock.day,
    season: clock.season,
    year: clock.year,
    cash: life.wallet?.cash ?? 0,
    job: life.job?.employed ? officePositionById(life.job.position).name : "Unemployed",
    place: life.at,
    lastScene: life.lastScene,
    bonds: headlineBonds(life),
    bondsTotal: rankedBonds(life).length,
    playedMs: life.playedMs ?? 0,
    updatedAt: life.updatedAt ?? 0,
    createdAt: life.createdAt ?? 0,
    duplicatedFrom: life.duplicatedFrom ?? null,
    cast: (life.characters ?? []).length,
  };
}
function duplicateLife(life, { now = Date.now(), name: newName = null } = {}) {
  let copy = structuredClone(life);
  copy.id = newLifeId(newName ?? `${life.name} copy`);
  copy.name = newName ?? `${life.name} (copy)`;
  copy.createdAt = now;
  copy.updatedAt = now;
  copy.duplicatedFrom = life.name;
  for (let entry of copy.album ?? []) {
    if (entry.status === "queued" || entry.status === "painting") {
      entry.status = "manual";
    }
  }
  return copy;
}
function renameLife(life, newName, { now = Date.now() } = {}) {
  let cleanName = String(newName ?? "")
    .trim()
    .slice(0, 60);
  return cleanName
    ? ((life.name = cleanName),
      (life.updatedAt = now),
      {
        ok: true,
        name: cleanName,
      })
    : {
        ok: false,
        reason: "A life needs a name.",
      };
}
function migrateBondsToV2(life) {
  let now = life.minutes ?? 0,
    startedAt = life.startedAt ?? 0,
    togetherStatuses = ["dating", "partners", "living", "engaged", "married"];
  for (let bond of Object.values(life.bonds ?? {})) {
    if (["partners", "living", "engaged", "married"].includes(bond.status)) {
      delete bond.trustCap;
      delete bond.trustCapUntil;
    } else if (Number.isFinite(bond.trustCap) && !Number.isFinite(bond.trustCapUntil)) {
      bond.trustCapUntil = now + TRUST_CAP_DAYS * 24 * 60;
    }
    if (
      ((togetherStatuses.includes(bond.status) && bond.togetherSince === startedAt) ||
        (bond.status === "ex" && bond.brokeUp?.at === startedAt)) &&
      !bond.milestones?.firstKiss
    ) {
      bond.milestones = {
        ...(bond.milestones ?? {}),
        firstKiss: startedAt,
      };
    }
    if (bond.rival && bondTier(bond, "friendship") >= 2) {
      bond.rivalWas = true;
    }
    if (bond.status === "ex" && bond.tierEventOwed?.romance === 2) {
      settleTierEvent(bond, "romance");
    }
    if (togetherStatuses.includes(bond.status)) {
      bond.justFriends = false;
    }
    if (bond.status === "ex") {
      bond.open = null;
      bond.openAgreement = false;
    }
  }
}
function migrateLife(life) {
  if (
    (life && typeof life == "object" && Array.isArray(life.characters) && ensureSocialNetwork(life),
    !life || typeof life != "object")
  ) {
    return null;
  }
  let version = life.saveVersion ?? 0;
  if (version > SAVE_VERSION) {
    return life;
  }
  if (life.rules && "jobs" in life.rules) {
    if (life.rules.jobs === false && life.job) {
      life.job = {
        ...life.job,
        employed: false,
      };
    }
    delete life.rules.jobs;
  }
  if (life.evicting && life.evicting.door === undefined && life.residence) {
    life.evicting.door = `${life.residence.place}:${life.residence.unit}`;
  }
  if (life.rules && "rent" in life.rules) {
    if (life.rules.rent === false && life.wallet) {
      life.wallet.rentPaidThrough = rentSeasonKey(life.minutes ?? 0);
    }
    delete life.rules.rent;
  }
  for (let character of life.characters ?? []) {
    if (isLegacySlotWeek(character.week)) {
      character.week = migrateLegacySlotWeek(character.week);
    }
  }
  for (let bond of Object.values(life.bonds ?? {})) {
    bond.traits =
      bond.traits?.from === "own"
        ? normalizeTraits(bond.traits)
        : archetypeDefaultTraits(
            bond.archetype ?? (life.characters ?? []).find((character) => character.id === bond.characterId)?.archetype,
          );
  }
  let homeAt = life.town?.homeAt ?? residenceForHomeKind(life.wallet?.home),
    moduleIds = activeModuleIds(life),
    hiddenPlaces = hiddenModulePlaces(life, TOWN_PLACES),
    town = buildTown({
      off: life.town?.off ?? [],
      renamed: life.town?.renamed ?? {},
      homeAt: homeAt,
      districtNames: life.town?.districtNames ?? {},
      modules: moduleIds,
      hidden: hiddenPlaces,
    }),
    placesKey = (places) => (places ?? []).map((place) => `${place.id}:${place.open}-${place.close}`).join(",");
  if (placesKey(life.town?.places) !== placesKey(town.places) || life.town?.homeAt !== homeAt) {
    life.town = town;
    if (RETIRED_PLACE_REDIRECTS[life.at]) {
      life.at = RETIRED_PLACE_REDIRECTS[life.at];
    }
    for (let character of life.characters ?? []) {
      for (let day of character.week ?? []) {
        for (let slot of day ?? []) {
          if (RETIRED_PLACE_REDIRECTS[slot.place]) {
            slot.place = RETIRED_PLACE_REDIRECTS[slot.place];
          }
        }
      }
      let jobModule = TOWN_PLACES.find((place) => place.id === character.job?.place)?.module;
      if (
        !(jobModule && (!moduleIds.includes(jobModule) || hiddenPlaces.includes(character.job.place))) &&
        character.job?.id &&
        !townJobById(town, character.job.id)
      ) {
        let job = openTownJobs(town, life.characters, {
          except: character.id,
        }).find((job2) => job2.place === RETIRED_PLACE_REDIRECTS[character.job.place]);
        character.job = job
          ? {
              id: job.id,
              place: job.place,
              title: job.title,
            }
          : {
              out: true,
            };
        if (job) {
          character.week = applyJobToWeek(character.week, job);
        }
        if (!character.workLook?.own) {
          character.workLook = null;
        }
      }
    }
    for (let item of life.things?.news?.items ?? []) {
      if (RETIRED_PLACE_REDIRECTS[item.store]) {
        item.store = RETIRED_PLACE_REDIRECTS[item.store];
      }
    }
    if (life.at !== "home" && !town.places.some((place) => place.id === life.at)) {
      life.at =
        life.residence && !life.lodging
          ? "home"
          : town.places.some((place) => place.id === "park")
            ? "park"
            : (town.places[0]?.id ?? "home");
    }
  }
  let stores = storesInside(life.town);
  for (let character of life.characters ?? []) {
    if (weekVisitsMall(character.week)) {
      character.week = assignStoresToWeek(character.week, {
        stores: stores,
        seed: life.seed ?? "",
        who: character.id,
      });
    }
  }
  if (!life.sleepMarked) {
    for (let character of life.characters ?? []) {
      if (!weekHasSleep(character.week)) {
        character.week = addDefaultSleep(character.week);
      }
    }
    life.sleepMarked = true;
  }
  if (life.wallet) {
    let wallet = life.wallet;
    if (!(wallet.home in HOME_KINDS)) {
      let wasShared = wallet.home === "shared";
      wallet.home = normalizeHomeKind(wallet.home);
      let residence = life.residence,
        sharedWithCast =
          !!residence &&
          (life.characters ?? []).some(
            (character) =>
              character.residence?.place === residence.place && character.residence?.unit === residence.unit,
          );
      if (((wallet.flatmate = wasShared && !sharedWithCast ? "anon" : null), life.things?.home)) {
        for (let slot of HOME_KINDS[wallet.home].slots) {
          if (!(slot in life.things.home)) {
            life.things.home[slot] =
              {
                kitchen: "hot-plate",
                sofa: "old-sofa",
                bath: "shower",
              }[slot] ?? null;
          }
        }
      }
    }
    if (((wallet.flatmate ??= null), (wallet.bills ??= []), life.things?.home && life.residence && !life.lodging)) {
      for (let slot of HOME_KINDS[wallet.home].slots) {
        if (!(slot in life.things.home)) {
          life.things.home[slot] = slot === "bath" ? "shower" : null;
        }
      }
    }
    wallet.owns ??= null;
    wallet.mortgage ??= null;
    if (life.things && life.things.offHill === undefined) {
      life.things.offHill = !HOME_KINDS[wallet.home]?.luxury || !!life.lodging;
    }
    if (wallet.carKept === undefined) {
      wallet.carKept =
        (life.things?.vehicles ?? []).includes("car") &&
        life.residence &&
        !(!life.lodging && HOME_KINDS[wallet.home]?.slots.includes("garage"))
          ? `${life.residence.place}:${life.residence.unit}`
          : null;
    }
    if (wallet.debt > 0) {
      wallet.bills.push({
        id: `hospital-${life.minutes}-old`,
        kind: "hospital",
        amount: wallet.debt,
        label: "Hospital",
        at: life.minutes,
        due: life.minutes + HOSPITAL_BILL_DUE_DAYS * 24 * 60,
        overdue: false,
        collections: false,
      });
    }
    delete wallet.debt;
  }
  if (
    (life.residence && life.town && !life.lodging && (life.town.homeAt = life.residence.place),
    Array.isArray(life.characters))
  ) {
    for (let character of life.characters) {
      character.birthday = normalizeBirthday(character.birthday) ?? rollBirthday(life.seed ?? "seed", character.id);
    }
    life.birthday =
      normalizeBirthday(life.birthday, life.birthday?.from ?? "you") ?? rollBirthday(life.seed ?? "seed", "you");
  }
  for (let bond of Object.values(life.bonds ?? {})) {
    bond.impressed ??= hasMet(bond);
  }
  if (version < 2) {
    migrateBondsToV2(life);
  }
  for (let bond of Object.values(life.bonds ?? {})) {
    if (bond.asks?.id === "ask-out") {
      bond.asks = null;
    }
  }
  if (
    life.scene &&
    !Array.isArray(life.scene.cast) &&
    ((life.scene.cast = life.scene.characterId ? [life.scene.characterId] : []),
    (life.scene.joined = []),
    life.scene.kind === "tier" && !life.scene.event)
  ) {
    let beat = life.scene.done && life.scene.verdict ? 2 : life.scene.phase === "decide" || life.scene.done ? 1 : 0;
    Object.assign(life.scene, startEventRun(TIER_STEP_EVENT), {
      max: life.scene.max,
      beat: beat,
    });
    life.scene.phase = beat === 0 ? "talk" : "decide";
  }
  if (
    (life.things ||
      ((life.things = createStartingThings(normalizeHomeKind(life.wallet?.home), homeKindOf(life.wallet?.home).slots)),
      life.things.closet.push("suit"),
      life.wearing && !life.things.closet.includes(life.wearing) && (life.wearing = "casual")),
    (life.notes ??= []),
    (life.plans ??= []),
    (life.outing ??= null),
    (life.pictures = cleanPictureModes(life.pictures)),
    life.rules && delete life.rules.adult,
    life.rules && typeof life.rules.npcs != "boolean")
  ) {
    let hasNpcs = lifeHasModuleNpcs(life);
    if (hasNpcs !== null) {
      life.rules.npcs = hasNpcs;
    }
  }
  if (
    (life.job &&
      !life.job.perfPerPosition &&
      ((life.job.performance = 0),
      delete life.job.bonus,
      delete life.job.lastRaiseAsk,
      (life.job.perfPerPosition = true)),
    life.scene?.jobAsk?.ask === "raise" && (life.scene.jobAsk = null),
    !life.templateWorkChecked && Array.isArray(life.characters))
  ) {
    for (let character of life.characters) {
      if (
        (character.week ?? []).some((day) =>
          (day ?? []).some(
            (slot) =>
              ["works", "part-time"].includes(slot?.doing) &&
              slot.place in JOBS_BY_PLACE &&
              !isJobSpan(character, slot),
          ),
        ) &&
        !character.away
      ) {
        character.workChecked = false;
      }
    }
    life.templateWorkChecked = true;
  }
  if (life.wallet && typeof life.wallet.rentPaidThrough == "number") {
    let clock = clockFromMinutes(life.minutes ?? 0);
    life.wallet.rentPaidThrough = clock.day >= (life.wallet.rentDay ?? 27) ? rentSeasonKey(life.minutes ?? 0) : null;
  }
  if (
    (life.things?.news && life.things.news.season === undefined && (life.things.news = null),
    delete life.activityLines,
    (!life.residence && !life.lodging) || (life.characters ?? []).some((character) => !character.residence))
  ) {
    let residences = assignResidences({
      home: life.wallet?.home,
      cast: (life.characters ?? []).map((character) => ({
        id: character.id,
        livesIn: character.residence?.place,
      })),
    });
    if (!life.lodging) {
      life.residence = life.residence ?? residences.player;
    }
    for (let character of life.characters ?? []) {
      character.residence = character.residence ?? residences.byId[character.id];
    }
  }
  let outing = life.outing;
  if (outing && !outing.agenda && outing.phase !== "summary") {
    let phase = outing.phase,
      moment = outing.moment;
    planOuting(life, {
      under: true,
    });
    if (phase === "farewell") {
      outing.phase = "goodbye";
    } else if (phase === "moment" && moment) {
      Object.assign(outing, {
        phase: "moment",
        moment: moment,
      });
    } else if (phase !== "goodbye" && phase !== "interrupt") {
      outing.phase = "talk";
      settleOuting(life);
    }
    delete outing.farewell;
  }
  return version === SAVE_VERSION
    ? life
    : {
        ...life,
        saveVersion: SAVE_VERSION,
      };
}
function lifeView(life) {
  return {
    id: life.id,
    name: life.name,
    persona: {
      id: life.persona?.id ?? "",
      name: life.persona?.name ?? "",
      avatar: personaPicture(life),
      cut: personaCutout(life),
    },
    gender: life.gender ?? null,
    hud: hudView(life),
    firstDay: firstDayView(life),
    at: life.at,
    town: life.town.places.map((place) => ({
      id: place.id,
      name: place.name,
    })),
    activities: activitiesHere(life),
    people: peopleHere(life),
    peopleAt: peopleAtPlaces(life),
    contacts: contactsList2(life),
    homeAt: life.town.homeAt ?? "apartments",
    residence: life.residence ?? null,
    corridors: Object.fromEntries(
      RESIDENCE_PLACES.map((corridor) => [corridor, corridorView(life, corridor)]).filter(([, corridor]) => corridor),
    ),
    mall: mallHallView(life),
    visit: visitView(life),
    together: togetherActivities(life),
    guest: guestView(life),
    party: buildPartyView(life),
    partyPlan: partyPlanView(life),
    partyOver: life.partyOver ?? null,
    partyMemoDue: !!life.partyMemo,
    district: districtOfPlace(life.town, life.at),
    districts: districtsView(life),
    places: life.town.places.map((place) => ({
      id: place.id,
      name: place.name,
      residence: !!place.residence,
      hall: !!place.hall,
      inside: place.inside ?? null,
      events: !!place.events,
      open: place.open,
      close: place.close,
      isOpen: isPlaceOpenNow(life, place),
      minutes: minutesToPlace(life, place.id),
    })),
    rules: {
      ...life.rules,
      npcs: npcsOn(life),
    },
    npcsHeld: npcsOn(life) ? moduleToggleBusyReason(life) : "",
    frame: normalizeSpriteFrame(life.frame),
    pictureSize: backgroundSizeOr(life.pictureSize),
    portraitSize: portraitSizeOr(life.portraitSize),
    scene: sceneView(life),
    settings: life.settings ?? {
      connection: null,
      effort: "low",
    },
    scenario: life.scenario ?? "",
    townName: life.townName ?? "",
    wearing: life.wearing,
    wearingName: wearingItem(life)?.name ?? "",
    clothes: {
      on: !!life.rules?.clothes,
      ready: isClothesRuleOn(life),
      images: !!imageChoice(life).connectionId,
    },
    keyImages: {
      on: keyImagesOn(life),
      rule: !!life.rules?.keyImages,
      connection: !!imageChoice(life).connectionId,
      count: (life.album ?? []).filter((entry) => !keyImageAside(life, entry)).length,
    },
    bag: {
      used: life.things?.bag?.length ?? 0,
      slots: BAG_SLOTS,
    },
    bills: {
      ...billsView(life),
      owedToYou: lentView(life),
      household: householdView(life),
    },
    plea: pleaView(life),
    ride: rideView(life),
    wedding: weddingView(life) && {
      ...weddingView(life),
      ready: weddingReady(life).ready,
      missing: weddingReady(life).missing.length,
    },
    wheels: {
      by: goingBy(life),
      due: life.rideDue
        ? {
            characterId: life.rideDue.characterId,
            place: life.rideDue.place,
          }
        : null,
    },
    counter: counterView(life),
    fitting: fittingView(life),
    plansToday: planStrip(life),
    plans: plansView(life),
    outing: outingView(life),
    maxInTown: MAX_IN_TOWN,
    log: life.log.slice(-20),
  };
}

export {
  SAVE_VERSION,
  addPlaytime,
  createLife,
  duplicateLife,
  lifeSaveExports,
  lifeSummary,
  lifeView,
  migrateLife,
  renameLife,
  touchLife,
};
