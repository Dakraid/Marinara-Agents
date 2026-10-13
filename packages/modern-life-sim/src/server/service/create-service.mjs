// Package constants, upload/card validation and the HTTP route service factory
import { randomUUID } from "node:crypto";
import { ARCHETYPES, ARCHETYPE_IDS } from "../relationships/archetypes.mjs";
import { createEngineClient, parseImageDataUrl } from "../engine/engine-client.mjs";
import { clockFromMinutes, formatAgoStamp, formatClockTime, formatDateTime } from "../time/clock.mjs";
import { WORK_FROM_HOME_PLACE } from "../schedule/whereabouts.mjs";
import { spansToGrid } from "../schedule/week-conversion.mjs";
import {
  ROUTINE_TEMPLATES,
  ROUTINE_TEMPLATE_IDS,
  assignStoresToWeek,
  buildRoutineWeek,
} from "../schedule/routines.mjs";
import { weekFromDaySpanLists, weekFromHourGrid } from "../schedule/model-week.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { jobHolders, openTownJobs, placeForJobId, townJobById, townJobs } from "../jobs/town-jobs.mjs";
import {
  applyJobToWeek,
  buildWeekWorkPrompt,
  clipOutfitText,
  resolveJobChoice,
  unlabeledWeekBlocks,
  workCellsFromAnswer,
} from "../jobs/job-week.mjs";
import { validResidencePlace } from "../housing/residence-units.mjs";
import { currentEventBeat, isEventRun } from "../events/event-run.mjs";
import { eventCast } from "../events/event-cast.mjs";
import {
  SKILL_NAMES,
  STARTING_SKILL_MAX,
  STARTING_SKILL_POINTS,
  skillLevelInfo,
  validateStartingSkills,
} from "../skills/skill-levels.mjs";
import { normalizeAttraction, normalizeGender, readCardOrientation } from "../orientation/orientation.mjs";
import { archetypeDefaultTraits, normalizeTraits, notableTraitWords, traitsEditorSchema } from "../traits/traits.mjs";
import { BOND_ACTIONS, bondSummary } from "../relationships/bonds.mjs";
import { DREAM_DATE_PLACES, DREAM_DATE_TIMES } from "../relationships/special-event-catalog.mjs";
import { MILESTONES } from "../relationships/milestones.mjs";
import { milestoneStepCopy } from "../relationships/milestone-steps.mjs";
import { normalizeBirthday } from "../relationships/birthdays.mjs";
import { tierStepMoment } from "../relationships/tier-steps.mjs";
import {
  ASK_JSON_TEMPLATE,
  DID_JSON_TEMPLATE,
  freeActsContextBlock,
  freeActsPromptBlock,
  moneyAskPromptLine,
  normalizeDidActs,
  normalizeMoneyAsk,
  readFromActOutcomes,
} from "../scenes/free-acts.mjs";
import { KIN_LABELS, normalizeKinKind } from "../relationships/kin.mjs";
import { SCENE_KINDS, SCENE_READS, normalizeRemember } from "../scenes/scene-config.mjs";
import { STARTING_RELATIONS, normalizeStartingRelation } from "../relationships/starting-relations.mjs";
import {
  applyEventMoment,
  applySceneTurn,
  checkSceneLines,
  closeSceneEarly,
  endReasonFromLeave,
  enterDecidePhase,
  isLastSceneExchange,
  normalizePicture,
  normalizeSceneRead,
  openScene,
  runEventMoment,
  runSceneFaint,
  runSceneGoodbye,
  runSceneTurn,
  runTierResult,
} from "../scenes/scene-engine.mjs";
import { itemDef } from "../items/inventory.mjs";
import {
  GIFT_TAGS,
  WEARER_BY_GENDER,
  newArrivalsPrompt,
  parseNewArrivals,
  seasonKeyAt,
} from "../shop/new-arrivals.mjs";
import { ensureSocialNetwork, parseNpcPairsFromCards } from "../network/npc-pairs.mjs";
import { describeTownFact } from "../network/town-facts.mjs";
import { networkWeekPrompt, parseNetworkWeek } from "../network/week-news.mjs";
import { OUTING_KINDS } from "../outings/outing-rules.mjs";
import { parseDateTastes } from "../outings/date-tastes.mjs";
import { OUTING_PLACES } from "../outings/outing-places.mjs";
import { outingMoodBand } from "../outings/outing-scoring.mjs";
import {
  OUTING_REMEMBER_MAX_CHARS,
  inviteAnswerPrompt,
  outingArrivePrompt,
  outingFaintPrompt,
  outingFarewellPrompt,
  outingGoodbyeMaxTokens,
  outingGoodbyePrompt,
  outingInterruptPrompt,
  outingMomentPrompt,
  outingTalkPrompt,
  parseInterruptLines,
  parseInviteAnswer,
  parseMealProposal,
  parseOutingLinesOrThrow,
  parseOutingRememberEach,
  parseSuggestionList,
  pickOutingMomentId,
} from "../outings/outing-prompts.mjs";
import { askGiftReaction, parseClothesTaste, parseGiftTastes, readCharacterTastes } from "../gifts/gift-tastes.mjs";
import {
  ARCHETYPE_THEIR_THING,
  THEIR_THING_ACTIVITIES,
  askVisitLine,
  describeVisitMoment,
  theirThingFor,
} from "../visits/home-visits.mjs";
import {
  DEFAULT_LANGUAGE,
  REASONING_EFFORT_LEVELS,
  SUPPORTED_LANGUAGES,
  createModelClient,
  normalizeLanguageName,
  normalizeSampling,
} from "../llm/model-client.mjs";
import { readCharacterCard, readCharacterTraits, settingNoteFor, writeCharacterTone } from "../cast/read-card.mjs";
import { listWorldLorebooks, loadWorldLore } from "../cast/world-lore.mjs";
import { gameModuleApi } from "../game/game-module-api.mjs";
import {
  currentSeasonIndex,
  normalizeSpriteFrame,
  seasonOutfitsEnabled,
  writeSeasonOutfits,
} from "../characters/season-outfits.mjs";
import { OFFICE_POSITIONS } from "../jobs/office-rules.mjs";
import { TOWN_DISTRICTS, TOWN_PLACES, storesInside } from "../town/places.mjs";
import {
  PLACE_ACTIVITIES,
  buildTown,
  districtOfPlace,
  everydayPlaces,
  townDistricts,
  townPlace,
} from "../town/town-layout.mjs";
import {
  addAlbumVersion,
  albumEntryById,
  failAlbumEntry,
  pickAlbumVersion,
  requeueAlbumEntry,
} from "../album/album.mjs";
import { describeFigure, describeFigureWithSeasons } from "../characters/figure.mjs";
import { dayOrNightAt } from "../images/time-of-day.mjs";
import {
  BACKGROUND_SUBJECTS,
  PICTURE_KINDS,
  backgroundKeyFor,
  backgroundSizeOf,
  backgroundSizeOr,
  backgroundSubjectOfPlace,
  cleanPictureModes,
  districtBackgroundSubject,
  neededBackgroundKeys,
  parseBackgroundKey,
  pictureModeOf,
  portraitSizeOf,
  portraitSizeOr,
  residenceBackgroundSubject,
} from "../images/backgrounds.mjs";
import {
  DEFAULT_IMAGE_PROMPTS,
  backgroundImagePrompt,
  cleanImagePromptOverrides,
  imagePromptsPreview,
  imagePromptsWithOverrides,
  keyImageBrief,
  keyImagePrompt,
  outfitImagePrompt,
  sceneIllustrationPrompt,
} from "../images/image-prompts.mjs";
import {
  addGalleryVersion,
  cleanTownLook,
  createBackgroundGallery,
  galleryVersionsFor,
  pickLatestBackgrounds,
  pickedBackgroundFor,
} from "../images/background-gallery.mjs";
import { addMemory, foldOldMemories, memoriesInBudget } from "../people/people-sheet.mjs";
import { SKILL_PERKS2 } from "../player/player-sheet.mjs";
import {
  activeModuleIds,
  activeModules,
  allModules,
  applyCreationModules,
  collectModuleHook,
  firstModuleHook,
  hiddenModulePlaces,
  isModuleOn,
  migrateModules,
  moduleById,
  moduleCardFields,
  moduleCatalog,
  moduleOwningScene,
  moduleState,
  modulesView,
  runModuleHook,
  setModuleFailureReporter,
  setModuleOptions,
} from "../modules/module-registry.mjs";
import {
  answerPlea,
  askBack,
  openPlea,
  passPlea,
  pleaLeftInScene,
  pleaOpenIn,
  stalePlea,
  undoPlea,
} from "../money/pleas-and-loans.mjs";
import { guestWords, seeGuestOut } from "../social/guest-visits.mjs";
import { editPairMemory, pairMemoriesFor, pairsOf } from "../relationships/pair-memories.mjs";
import {
  answerCounter,
  askPlanVerdict,
  cancelPlan,
  inviteInfo,
  invitePlan,
  planPlaceName,
  plansAhead,
  scenePlans,
  scenePlansBlock,
  waitForPlan,
} from "../plans/plans.mjs";
import {
  applyMoment,
  applyTalk,
  beginOuting,
  closeOuting,
  endOutingEarly,
  finishOuting,
  goodbyeOptions,
  goodbyeWhat,
  interruptChoice,
  interruptWords,
  keepFaintOuting,
  mealOpen,
  momentName,
  outingKeyImage,
  outingNext,
  outingRememberers,
  outingView,
  prepareMoment,
  prepareTalk,
  setInterruptLines,
  setOutingLines,
  settleOuting,
} from "../outings/outing.mjs";
import {
  birthdayMessage,
  birthdaySlipWords,
  birthdaySlipped,
  yourDayWords,
} from "../relationships/birthday-events.mjs";
import { partyInfo, planParty, startParty } from "../parties/house-party.mjs";
import {
  PARTY_DOOR_MILESTONES,
  answerNeighbourComplaint,
  answerPartyDoorQuietly,
  bringPartyGuestOver,
  buildPartyMomentScene,
  cancelOwnParty,
  dismissPartyOver,
  doPartyAct,
  duePartyEndEvents,
  endOwnParty,
  introducePartyGuests,
  joinTheirParty,
  keepPartyMemories,
  letPartyGuestsIn,
  moveToPartyRoom,
  partyGuestsAround,
  partySceneLine,
  waitForNextPartyGuest,
  waitForTheirParty,
} from "../parties/party.mjs";
import { askForIntroduction, payBackFriend, useFriendKey } from "../relationships/friend-perks.mjs";
import { MATE_MOMENTS } from "../home/housemates.mjs";
import {
  homesView,
  moveHome,
  payBillOrLoan,
  rentSharersOf,
  startCouchSurfing,
  withHomeAndWork,
} from "../home/residence.mjs";
import {
  buyOutfit,
  clothesRackView,
  cutoutsDue,
  describePersonaAsSeen,
  isClothesRuleOn,
  keepOutfitPicture,
  keepPersonaCutout,
  outfitsToPaint,
  richLookOf,
  setPersonaClothes,
} from "../home/furniture-and-wardrobe.mjs";
import { buyShopItems, shopFor, thingsView, useThing } from "../things/things-actions.mjs";
import { flirtySeen } from "../social/witnesses.mjs";
import { knownForModel, markNewsSeen, namesKnown, newsOf, relationChart } from "../relationships/network-sheet.mjs";
import {
  genderOf,
  pictureSexOf,
  setOrientation,
  setYourGender,
  settleOrientation,
} from "../romance/romanceability.mjs";
import {
  crossedPaths,
  jealousAbout,
  jealousOutcome,
  noteHere,
  settleAgreements,
  settleWeek,
  staleJealous,
  standingWords,
  tellsFor,
} from "../romance/jealousy.mjs";
import {
  PARTNER_MOOD_LABEL,
  groupPlanFits,
  herOrMeLeaves,
  partnerMoodOf,
  partnersWon,
} from "../romance/multiple-partners.mjs";
import { dropRefusedJobs, jobsView, keepWorkPicture, repairWork, setJob, setWorkOutfit } from "../cast/cast-jobs.mjs";
import {
  cutOutsDue,
  dressedNow,
  keepCutOut,
  keepSeasonPicture,
  redoSeasonPicture,
  seasonSpritesOn,
  seasonSpritesToPaint,
  seasonsToWrite,
  setFrame,
  setPictureSize,
  setPortraitSize,
  setSeasonOutfit,
  workSpritesOn,
  workSpritesToPaint,
} from "../cast/outfits.mjs";
import { answerDoor, doorView } from "../visits/door.mjs";
import {
  doTogether,
  enterVisit,
  knockOnDoor,
  leaveVisit,
  sleepChoice,
  stayNight,
  visitView,
  wakeUp,
} from "../visits/staying-over.mjs";
import {
  applyJob,
  askDayOff,
  careerView,
  doneJobTalk,
  finishShift,
  interviewView,
  jobTalkFor,
  jobsApp,
  quitJob,
  sceneJob,
  seenNotice,
  setMomentLine,
  shiftMomentTalk,
  shiftView,
  startLunch,
  stayLate,
} from "../jobs/office.mjs";
import { proposeTonight, toTonight } from "../romance/proposal.mjs";
import {
  leftEarly,
  setWeddingDay,
  staleWedding,
  weddingChoose,
  weddingDays,
  weddingInvite,
  weddingPlanView,
  weddingSend,
} from "../romance/wedding.mjs";
import { morningTags, morningWords, weddingMorning, weddingMorningQuiet } from "../romance/wedding-morning.mjs";
import { honeymoonStarts, outingNight, tripNightOver } from "../romance/honeymoon.mjs";
import { opinionWhat } from "../relationships/friend-opinion.mjs";
import { specialActions, staleAsks } from "../milestones/milestone-availability.mjs";
import { callLabels, milestoneVerdict, milestoneView, settleMilestone } from "../milestones/milestone-settle.mjs";
import {
  favourGo,
  favourPlaces,
  walkInAfter,
  walkInArrived,
  walkInChoice,
  walkInNow,
  walkInRole,
  walkInTags,
  walkInWords,
} from "../scenes/walk-ins.mjs";
import { writeCounterLines, writeFittingLines } from "../llm/shop-lines.mjs";
import {
  askSuits,
  counterDue,
  counterView,
  discountHere,
  fittingTalk,
  fittingView,
  fittingWho,
  payLine,
  setCounterLines,
  setFittingLines,
  suitsSection,
  tryOn,
} from "../shop/store-counter.mjs";
import { answerRide, openRide, rideGo, rideNoTags, sellVehicle, staleRide } from "../travel/vehicles-rides.mjs";
import { applyFree, freeHolds, freePlan, theirPlanJump, theyPayBack, undoDetected } from "../scenes/free-talk.mjs";
import { driftDue, driftPeople, setDriftWords } from "../cast/schedule-drift.mjs";
import {
  activitiesHere,
  addCast,
  advanceTime,
  albumOf,
  beginScene,
  bondOf,
  calendarView,
  canStartScene,
  canTakeStep,
  characterOf,
  characterSheet2,
  cleanRulesIn,
  doActivity,
  editCalendarNote2,
  editMemory2,
  endSceneEarly,
  figuresOf,
  giveGift,
  goToPlace,
  hasMet2,
  hudView,
  imageChoice,
  interactWith,
  keyImageAside,
  keyImageFor,
  keyImagesOn,
  markBondBase,
  markFirstDaySeen,
  markSeenHere,
  nameFor,
  npcNameAside,
  npcsOn,
  picturePeople,
  pictureSubject,
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
  skillLevelsOf,
  stepVerdict,
  traitsOf,
  whereabouts,
  whoIsHere,
  youView,
} from "../game.mjs";
import {
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
} from "../saves/life-save.mjs";
import { splitCharacterLook } from "../characters/split-look.mjs";
import { quickEncounterLine, quickLineTopicForKind } from "../encounters/quick-lines.mjs";
import {
  buildPartyMemoryPrompt,
  buildPartyMomentPrompt,
  parsePartyMemories,
  parsePartyMomentLines,
} from "../parties/party-prompts.mjs";
import {
  MAX_SETUP_PRESETS,
  normalizePresetName,
  reconcilePresetWithAvailable,
  sanitizeSetupPreset,
  setupPresetFromLife,
  summarizeSetupPreset,
  uniquePresetName,
} from "../setup/setup-presets.mjs";
import { requestDriftWords } from "../llm/drift-words.mjs";
import {
  activityIdsToWriteFor,
  activityLinesNeedRefill,
  countUnusedActivityLines,
  drawActivityLine,
  emptyLinesBank,
  mergeActivityLinesIntoBank,
  normalizeLinesLanguageKey,
  placeForActivityId,
  placesMissingActivityLines,
  requestActivityLines,
} from "../narration/activity-lines.mjs";
import { pickHelpLine, requestHelpLines } from "../narration/help-lines.mjs";
import { RELEASE_NOTES, attachModuleReleaseNotes } from "../content/release-notes.mjs";
import { WELCOME_NOTICE, welcomeNoticeUnlessSeen } from "../content/welcome-notice.mjs";
import { buildGuide } from "../content/guide.mjs";
import {
  buildCallWordsMessages,
  callWordsProperNames,
  collectCallWordGroups,
  isEnglishLanguage,
  mergeCallWordsReply,
  missingCallWordKeys,
  normalizeCallWordsLanguageKey,
  translateStateCallWords,
} from "../i18n/call-words.mjs";

var ID = "modern-life-sim";
var VERSION = "0.3.2";
var MAX_PICTURE_DATA_URL_LENGTH = Math.ceil((8 * 1024 * 1024 * 4) / 3) + 64;
var PICTURE_REQUEST_TIMEOUT_MS = 9e4;
var CANCEL_WAIT_TIMEOUT_MS = 5e3;
function imageBytesMatchMime(bytes, mime) {
  return mime === "image/png"
    ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
    : mime === "image/jpeg"
      ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : mime === "image/webp"
        ? bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP"
        : false;
}
function sanitizeCharacterCardSnapshot(card) {
  if (!card || typeof card != "object") {
    return null;
  }
  let clip = (value, max) => String(value ?? "").slice(0, max),
    avatar =
      typeof card.avatar == "string" && card.avatar.startsWith("/") && !/['"()\\\s]/.test(card.avatar)
        ? card.avatar.slice(0, 300)
        : null;
  return {
    ...(card.id
      ? {
          id: clip(card.id, 80),
        }
      : {}),
    name: clip(card.name, 80),
    description: clip(card.description, 4e3),
    appearance: clip(card.appearance, 2e3),
    ...(avatar
      ? {
          avatar: avatar,
        }
      : {}),
  };
}
var SAVES_FROM = "0.1.23";
var olderVersion = (a, b) => {
  let partsA = String(a ?? "0.0.0")
      .split(".")
      .map((part) => Number(part) || 0),
    partsB = String(b ?? "0.0.0")
      .split(".")
      .map((part) => Number(part) || 0);
  for (let i = 0; i < 3; i++) {
    if ((partsA[i] ?? 0) !== (partsB[i] ?? 0)) {
      return (partsA[i] ?? 0) < (partsB[i] ?? 0);
    }
  }
  return false;
};
var LIFE_DOCUMENT_KIND = "life";
var MAX_LIVES = 20;
var MAX_CAST = 30;
var traitsCatalog = () => ({
  ...traitsEditorSchema(),
  things: Object.entries(THEIR_THING_ACTIVITIES).map(([key, thing]) => ({
    key: key,
    name: thing.name,
  })),
  thingOf: ARCHETYPE_THEIR_THING,
  starts: Object.fromEntries(
    ARCHETYPE_IDS.map((archetype) => [
      archetype,
      archetypeDefaultTraits({
        main: archetype,
      }),
    ]),
  ),
});
var CALLS_KEPT = 200;
var httpError = (statusCode, message) =>
  Object.assign(new Error(message), {
    statusCode: statusCode,
  });
function weekScheduleForCharacter(character, id, places, stores = []) {
  let allPlaces = [...places, "mall", JOB_AWAY_PLACE, WORK_FROM_HOME_PLACE],
    week = character?.grid
      ? weekFromHourGrid(character.grid, {
          places: allPlaces,
        })
      : weekFromDaySpanLists(character?.week, {
          places: allPlaces,
        }),
    assigned = week
      ? assignStoresToWeek(week, {
          stores: stores,
          seed: String(character?.cardId ?? ""),
          who: String(id),
        })
      : null;
  return assigned && assigned.flat().length
    ? assigned
    : buildRoutineWeek("default", id, {
        places: places,
        stores: stores,
      });
}
function createService({
  runtime: runtime,
  now = () => Date.now(),
  engine = null,
  pretell = false,
  pictures = false,
  callsKept = CALLS_KEPT,
  testing = false,
}) {
  let engineClient =
      engine ??
      createEngineClient({
        env: process.env,
        logger: runtime.logger ?? null,
      }),
    documents = runtime.persistence.documents,
    serviceLogger = runtime.logger ?? null;
  setModuleFailureReporter((message) => serviceLogger?.warn?.(`[${ID}] ${message}`));
  let lifeDocIds = new Map(),
    lifeQueues = new Map(),
    cancelledLives = new Set();
  function enqueue(key, task) {
    let next = (lifeQueues.get(key) ?? Promise.resolve()).catch(() => {}).then(task);
    lifeQueues.set(key, next);
    return next;
  }
  async function findLifeDoc(lifeId) {
    let docId = lifeDocIds.get(lifeId);
    if (docId) {
      let doc = await documents.getById(ID, docId);
      if (doc) {
        return doc;
      }
      lifeDocIds.delete(lifeId);
    }
    let found = (await documents.list(ID, LIFE_DOCUMENT_KIND)).find((doc) => doc.name === lifeId) ?? null;
    if (found) {
      lifeDocIds.set(lifeId, found.id);
    }
    return found;
  }
  let deletedLives = new Set();
  async function persistLife(life) {
    if (!deletedLives.has(life.id)) {
      delete life.faintMemo;
      settleAgreements(life);
      touchLife(life, {
        now: now(),
      });
      life.playedVersion = VERSION;
      {
        for (let attempt = 0; attempt < 3; attempt++) {
          let doc = await findLifeDoc(life.id),
            stamp = new Date(now()).toISOString();
          if (!doc) {
            let created = await documents.create({
              id: randomUUID(),
              packageId: ID,
              kind: LIFE_DOCUMENT_KIND,
              name: life.id,
              description: life.name,
              data: life,
              createdAt: stamp,
              updatedAt: stamp,
            });
            lifeDocIds.set(life.id, created.id);
            return life;
          }
          if (
            await documents.update({
              id: doc.id,
              packageId: ID,
              expectedRevision: doc.revision,
              name: life.id,
              description: life.name,
              data: life,
              updatedAt: stamp,
            })
          ) {
            return life;
          }
        }
        throw httpError(409, "Could not save: the life changed somewhere else at the same time.");
      }
    }
  }
  let saveLife = (life) => enqueue(life.id, () => persistLife(life)),
    withLife = (lifeId, mutate) =>
      enqueue(lifeId, async () => {
        let life = await loadLife(lifeId),
          result = await mutate(life);
        await persistLife(life);
        return {
          result: result,
          life: life,
        };
      });
  async function loadLife(lifeId) {
    let doc = await findLifeDoc(lifeId);
    if (!doc) {
      throw httpError(404, "That life does not exist.");
    }
    let life = migrateModules(migrateLife(doc.data));
    if (!life) {
      throw httpError(422, "That save could not be read.");
    }
    if ((life.saveVersion ?? 0) > SAVE_VERSION) {
      throw httpError(422, "That life was saved by a newer version of Modern Life Sim. Update it to open this life.");
    }
    settleAgreements(life);
    return life;
  }
  async function listLives() {
    let docs = await documents.list(ID, LIFE_DOCUMENT_KIND);
    await loadGallery();
    return docs
      .map((doc) => {
        if (doc.data?.migratedBy === VERSION) {
          return doc.data;
        }
        let life = migrateModules(migrateLife(doc.data));
        if (life && (life.saveVersion ?? 0) <= SAVE_VERSION) {
          life.migratedBy = VERSION;
          enqueue(life.id, () =>
            deletedLives.has(life.id)
              ? null
              : documents
                  .update({
                    id: doc.id,
                    packageId: ID,
                    expectedRevision: doc.revision,
                    name: doc.name,
                    description: doc.description,
                    data: life,
                    updatedAt: doc.updatedAt,
                  })
                  .catch(() => null),
          );
        }
        return life;
      })
      .filter((life) => life && (life.saveVersion ?? 0) <= SAVE_VERSION)
      .map((life) => ({
        ...lifeSummary(life),
        ...lifeCardPicture(life),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  function lifeCardPicture(life) {
    let gallery = galleryCache ?? createBackgroundGallery(),
      look = life.look ?? cleanTownLook(),
      dayNight = dayOrNightAt(life.minutes),
      pictureFor = (subject) =>
        subject ? (pickedBackgroundFor(gallery, look, backgroundKeyFor(subject, dayNight))?.url ?? null) : null,
      place = life.at === "home" || !life.town ? null : townPlace(life.town, life.at);
    return {
      placeName: life.at === "home" ? "Home" : (place?.name ?? life.at),
      picture: pictureFor(backgroundSubjectOfPlace(life.at, life.wallet?.home)) ?? pictureFor("town"),
    };
  }
  let handleFaintMemory = async () => {},
    lifeRoute = (handler) => async (req) => {
      focusLifeId = req.params.id;
      let { result: result, life: life } = await withLife(req.params.id, async (draft) => {
        let result2 = await handler(draft, req);
        await handleFaintMemory(draft);
        await fillHelpLines(draft, result2);
        stalePlea(draft);
        staleJealous(draft);
        staleAsks(draft);
        staleRide(draft);
        let weddingEvents = staleWedding(draft);
        if (weddingEvents.length && result2 && typeof result2 == "object") {
          result2.events = [...(result2.events ?? []), ...weddingEvents];
        }
        markSeenHere(draft);
        noteHere(draft);
        markBondBase(draft);
        return result2;
      }).finally(() => cancelledLives.delete(req.params.id));
      try {
        await loadGallery();
        await loadPaintJobs();
        if (life.weekDone) {
          runTownWeek(life.id);
        }
        await queueWorkSprites(life);
        await queueSeasonSprites(life);
        await queueCutouts(life);
        if (seasonsToWrite(life).length) {
          writeSeasonOutfitsFor(life.id);
        }
        if (counterDue(life)) {
          refreshCounterLines(life.id);
        }
        if (driftDue(life)) {
          refreshDriftWords(life.id);
        }
        await writeCallWords(life);
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] after an action in ${life.id}: ${err.message || err}`);
      }
      return {
        ...result,
        life: viewOfLife(life),
      };
    },
    callDocKind = "model-call",
    callRecords = null;
  async function loadCallRecords() {
    if (!callRecords) {
      callRecords = (await documents.list(ID, callDocKind))
        .filter((doc) => doc.data?.id)
        .map((doc) => ({
          doc: doc.id,
          revision: doc.revision,
          record: doc.data,
        }))
        .sort((a, b) => a.record.at - b.record.at);
    }
    return callRecords;
  }
  let toTokenCount = (value) => (value == null || !Number.isFinite(Number(value)) ? null : Number(value)),
    promptTokensSent = (provider, usage) => {
      let promptTokens = toTokenCount(usage.promptTokens);
      return promptTokens === null || !/anthropic|claude/i.test(String(provider ?? ""))
        ? promptTokens
        : promptTokens +
            (toTokenCount(usage.cachedPromptTokens) ?? 0) +
            (toTokenCount(usage.cacheWritePromptTokens) ?? 0);
    },
    providerCache = {
      at: -1 / 0,
      byId: new Map(),
    };
  async function providerOfConnection(connectionId) {
    if (!connectionId) {
      return "";
    }
    if (!providerCache.byId.has(connectionId) && Date.now() - providerCache.at > 6e4) {
      providerCache = {
        at: Date.now(),
        byId: providerCache.byId,
      };
      try {
        for (let connection of await engineClient.connections()) {
          providerCache.byId.set(connection.id, connection.provider);
        }
      } catch {
        // Best effort: nothing to do when this fails.
      }
    }
    return providerCache.byId.get(connectionId) ?? "";
  }
  function callRecorder(life, scope = "life") {
    return (call) => {
      enqueue("calls", async () => {
        let usage = call.usage ?? {},
          provider = await providerOfConnection(call.connection),
          record = {
            id: randomUUID(),
            at: now(),
            lifeId: life?.id ?? null,
            lifeName: life?.name ?? "",
            scope: scope,
            task: call.task,
            about: call.about,
            model: call.model,
            connection: call.connection,
            provider: provider,
            effort: call.effort,
            maxTokens: call.maxTokens,
            ms: call.ms,
            outcome: call.outcome,
            error: call.error ?? "",
            finish: call.finish ?? "",
            sent: promptTokensSent(provider, usage),
            received: toTokenCount(usage.completionTokens),
            reasoning: toTokenCount(usage.completionReasoningTokens),
            cached: toTokenCount(usage.cachedPromptTokens),
            cacheWrite: toTokenCount(usage.cacheWritePromptTokens),
            in: (call.messages ?? []).map((message) => ({
              role: String(message.role ?? ""),
              content: typeof message.content == "string" ? message.content : JSON.stringify(message.content),
            })),
            out: String(call.text ?? ""),
          };
        await loadCallRecords();
        let stamp = new Date(record.at).toISOString(),
          doc = await documents.create({
            id: randomUUID(),
            packageId: ID,
            kind: callDocKind,
            name: record.id,
            description: record.task,
            data: record,
            createdAt: stamp,
            updatedAt: stamp,
          });
        for (
          callRecords.push({
            doc: doc.id,
            revision: doc.revision,
            record: record,
          });
          callRecords.length > callsKept;
        ) {
          let oldest = callRecords.shift();
          await documents.remove(ID, oldest.doc, oldest.revision);
        }
      }).catch((err) =>
        serviceLogger?.warn?.(`Modern Life Sim: a model call was not kept for Debug: ${err?.message ?? err}`),
      );
    };
  }
  let modelFor = (life, { signal = null, scope = "life" } = {}) =>
      createModelClient({
        runtime: runtime,
        settings: life.settings ?? {},
        signal: signal,
        onCall: callRecorder(life, scope),
        onGone: (connectionId) => {
          if (life.settings?.connection === connectionId) {
            life.settings.connection = "";
          }
          serviceLogger?.warn?.(`Modern Life Sim: the connection ${connectionId} is gone; using the default one`);
        },
      }),
    galleryDocKind = "backdrop-library",
    paintQueueDocKind = "paint-queue",
    creationDraftDocKind = "creation-draft",
    welcomeDocKind = "welcome",
    creationPresetDocKind = "creation-preset",
    singletonDocIds = new Map();
  async function findSingletonDoc(kind) {
    let docId = singletonDocIds.get(kind);
    if (docId) {
      let doc = await documents.getById(ID, docId);
      if (doc) {
        return doc;
      }
    }
    let found = (await documents.list(ID, kind))[0] ?? null;
    if (found) {
      singletonDocIds.set(kind, found.id);
    }
    return found;
  }
  function updateSingleton(kind, init, mutate) {
    return enqueue(`single:${kind}`, async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        let doc = await findSingletonDoc(kind),
          data = doc?.data ?? init(),
          out = mutate(data),
          stamp = new Date(now()).toISOString();
        if (!doc) {
          let created = await documents.create({
            id: randomUUID(),
            packageId: ID,
            kind: kind,
            name: kind,
            description: kind,
            data: data,
            createdAt: stamp,
            updatedAt: stamp,
          });
          singletonDocIds.set(kind, created.id);
          return {
            data: data,
            out: out,
          };
        }
        if (
          await documents.update({
            id: doc.id,
            packageId: ID,
            expectedRevision: doc.revision,
            name: kind,
            description: kind,
            data: data,
            updatedAt: stamp,
          })
        ) {
          return {
            data: data,
            out: out,
          };
        }
      }
      throw httpError(409, "Could not save that. Try again.");
    });
  }
  let galleryCache = null;
  async function loadGallery() {
    if (!galleryCache) {
      galleryCache = (await findSingletonDoc(galleryDocKind))?.data ?? createBackgroundGallery();
    }
    return galleryCache;
  }
  async function updateGallery(mutate) {
    let { data: data, out: out } = await updateSingleton(galleryDocKind, createBackgroundGallery, mutate);
    galleryCache = data;
    return out;
  }
  let outfitKeyPrefix = "outfit:",
    isOutfitJobKey = (key) => String(key).startsWith(outfitKeyPrefix),
    workKeyPrefix = "work:",
    isWorkJobKey = (key) => String(key).startsWith(workKeyPrefix),
    seasonKeyPrefix = "season:",
    isSeasonJobKey = (key) => String(key).startsWith(seasonKeyPrefix),
    cutKeyPrefix = "cut:",
    isCutJobKey = (key) => String(key).startsWith(cutKeyPrefix),
    isSpriteJobKey = (key) => isWorkJobKey(key) || isSeasonJobKey(key) || isCutJobKey(key),
    keyImagePrefix = "key:",
    isKeyImageJobKey = (key) => String(key).startsWith(keyImagePrefix),
    paintJobs = null,
    paintingNow = null,
    focusLifeId = null;
  async function loadPaintJobs() {
    if (!paintJobs) {
      paintJobs = (await findSingletonDoc(paintQueueDocKind))?.data?.jobs ?? [];
    }
    return paintJobs;
  }
  async function savePaintJobs() {
    let jobs = paintJobs.slice();
    await updateSingleton(
      paintQueueDocKind,
      () => ({
        jobs: [],
      }),
      (state) => {
        state.jobs = jobs;
      },
    );
  }
  async function queueBackgrounds(life, keys, { asked = false } = {}) {
    if (!asked && pictureModeOf(life, "backgrounds") === "manual") {
      return;
    }
    await loadPaintJobs();
    let subject = backgroundSubjectOfPlace(life.at, life.wallet?.home),
      dayNight = dayOrNightAt(life.minutes),
      priority = (key) => {
        let { subject: subject2, time: time } = parseBackgroundKey(key);
        return (time === dayNight ? 0 : 10) + (subject2 === "town" ? 0 : subject2 === subject ? 1 : 2);
      },
      fresh = keys.filter(
        (key) =>
          !paintJobs.some((job) => job.lifeId === life.id && job.key === key) &&
          !(paintingNow?.lifeId === life.id && paintingNow.key === key),
      );
    paintJobs.push(
      ...fresh
        .sort((key, otherKey) => priority(key) - priority(otherKey))
        .map((key) => ({
          lifeId: life.id,
          key: key,
        })),
    );
    focusLifeId = life.id;
    await savePaintJobs();
    runPaintQueue();
  }
  async function queueBackgroundsHere(life) {
    if (((life.look = cleanTownLook(life.look ?? {})), !pictures || !life.look.connectionId || life.look.paused)) {
      return;
    }
    let district = districtOfPlace(life.town, life.at),
      subjects = [
        backgroundSubjectHere(life),
        district ? districtBackgroundSubject(district) : null,
        firstModuleHook(life, "backdropHere"),
      ].filter(Boolean);
    if (!subjects.length) {
      return;
    }
    let gallery = await loadGallery(),
      allowedKeys = backgroundKeysOf(life),
      missingKeys = [
        ...new Set(subjects.map((subject) => backgroundKeyFor(subject, dayOrNightAt(life.minutes)))),
      ].filter(
        (key) => allowedKeys.includes(key) && !pickedBackgroundFor(gallery, life.look, key) && !life.look.failed[key],
      );
    if (!missingKeys.length) {
      return;
    }
    let latest = pickLatestBackgrounds(gallery, life.look, missingKeys);
    if (latest.length) {
      await queueBackgrounds(life, latest);
    }
  }
  async function queueOutfits(life, outfitIds, { asked = false } = {}) {
    if (!asked && pictureModeOf(life, "clothes") === "manual") {
      return;
    }
    await loadPaintJobs();
    let keys = outfitIds
      .map((outfitId) => `${outfitKeyPrefix}${outfitId}`)
      .filter(
        (key) =>
          !paintJobs.some((job) => job.lifeId === life.id && job.key === key) &&
          !(paintingNow?.lifeId === life.id && paintingNow.key === key),
      );
    if (keys.length) {
      paintJobs.push(
        ...keys.map((key) => ({
          lifeId: life.id,
          key: key,
        })),
      );
      focusLifeId = life.id;
      await savePaintJobs();
      runPaintQueue();
    }
  }
  let paintingRunning = false,
    PAINT_WAITS = "waits";
  async function runPaintQueue() {
    if (!(!pictures || paintingRunning || !engineClient.paint)) {
      paintingRunning = true;
      try {
        for (await loadPaintJobs(); ;) {
          let next = null;
          for (let job of [
            ...paintJobs.filter((job2) => isKeyImageJobKey(job2.key)),
            ...paintJobs.filter(
              (job2) => !isOutfitJobKey(job2.key) && !isKeyImageJobKey(job2.key) && !isSpriteJobKey(job2.key),
            ),
            ...paintJobs.filter((job2) => isOutfitJobKey(job2.key) || isSpriteJobKey(job2.key)),
          ]) {
            if (job.lifeId !== focusLifeId) {
              continue;
            }
            let life = await loadLife(job.lifeId).catch(() => null);
            if (!life) {
              job.gone = true;
              continue;
            }
            if (
              !(
                isKeyImageJobKey(job.key) &&
                keyImageAside(life, albumEntryById(life, job.key.slice(keyImagePrefix.length)))
              ) &&
              !life.look?.paused
            ) {
              next = job;
              break;
            }
          }
          if (
            (paintJobs.some((job) => job.gone) &&
              ((paintJobs = paintJobs.filter((job) => !job.gone)), await savePaintJobs()),
            !next)
          ) {
            break;
          }
          paintingNow = next;
          if (
            (await paintJob(next).catch((err) =>
              serviceLogger?.warn?.(`[${ID}] painting ${next.key}: ${err.message}`),
            )) !== PAINT_WAITS
          ) {
            paintJobs = paintJobs.filter((job) => job !== next);
          }
          paintingNow = null;
          await savePaintJobs();
        }
      } finally {
        paintingRunning = false;
        paintingNow = null;
      }
    }
  }
  async function paintOutfit(job) {
    let outfitId = job.key.slice(outfitKeyPrefix.length),
      life = await loadLife(job.lifeId);
    if (isClothesRuleOn(life)) {
      try {
        let choice = imageChoice(life);
        if (!choice.connectionId) {
          throw new Error("No image connection (TOWN LOOK or SETTINGS \xB7 MODEL \xB7 IMAGES).");
        }
        let item = itemDef(life.things, outfitId);
        if (!item) {
          throw new Error("That outfit is not in this life.");
        }
        let styles = await engineClient.styleProfiles(),
          profile =
            styles.profiles.find((style) => style.id === choice.styleProfileId) ??
            styles.profiles.find((style) => style.id === styles.defaultId) ??
            {},
          prompt = outfitImagePrompt({
            appearance: life.clothes.appearance,
            outfit: item.text ?? item.name,
            profile: profile,
            prompts: await loadImagePrompts(),
            name: life.persona?.name ?? "",
            sex: pictureSexOf(life, genderOf(life, "you") ?? life.personaFigure?.sex ?? ""),
          }),
          image = await engineClient.paint({
            connectionId: choice.connectionId,
            name: `life sim ${life.id} outfit ${outfitId}`,
            ...prompt,
            ...portraitSizeOf(life),
            styleProfileId: choice.styleProfileId,
          });
        if (!image.overrideTook) {
          serviceLogger?.warn?.(`[${ID}] the engine did not take our prompt for outfit ${outfitId}`);
        }
        let kept = await engineClient.keep({
            image: image,
            name: `outfit-${outfitId}`,
            prompt: prompt.prompt,
          }),
          cutout = await keepCutout(image, `outfit-${outfitId}-cut`, prompt.prompt);
        await withLife(job.lifeId, (draft) =>
          keepOutfitPicture(draft, outfitId, {
            url: kept.url,
            ref: `global-gallery:${kept.id}`,
            clean: cutout,
          }),
        );
      } catch (err) {
        await withLife(job.lifeId, (draft) =>
          keepOutfitPicture(draft, outfitId, {
            error: String(err.said || err.message || err),
          }),
        ).catch(() => {});
        throw err;
      }
    }
  }
  async function queueWorkSprites(life, characterIds = workSpritesToPaint(life)) {
    if (
      (pictureModeOf(life, "work") === "manual" &&
        (characterIds = characterIds.filter((id) => characterOf(life, id)?.workAsked)),
      !characterIds.length || !workSpritesOn(life))
    ) {
      return;
    }
    await loadPaintJobs();
    let keys = characterIds
      .map((id) => `${workKeyPrefix}${id}`)
      .filter(
        (key) =>
          !paintJobs.some((job) => job.lifeId === life.id && job.key === key) &&
          !(paintingNow?.lifeId === life.id && paintingNow.key === key),
      );
    if (keys.length) {
      paintJobs.push(
        ...keys.map((key) => ({
          lifeId: life.id,
          key: key,
        })),
      );
      focusLifeId = life.id;
      await savePaintJobs();
      runPaintQueue();
    }
  }
  async function paintWorkSprite(job) {
    let characterId = job.key.slice(workKeyPrefix.length),
      life = await loadLife(job.lifeId),
      character = characterOf(life, characterId);
    if (!(!character?.job?.id || !character.workOutfit)) {
      try {
        let choice = imageChoice(life);
        if (!choice.connectionId) {
          throw new Error("No image connection.");
        }
        let styles = await engineClient.styleProfiles(),
          profile =
            styles.profiles.find((style) => style.id === choice.styleProfileId) ??
            styles.profiles.find((style) => style.id === styles.defaultId) ??
            {},
          figure = character.figure ?? (await ensureFigure(job.lifeId, characterId).catch(() => null));
        if (!figure?.body) {
          throw new Error("Could not tell what they look like under their clothes. Try again.");
        }
        let prompt = outfitImagePrompt({
            appearance: figure.body,
            outfit: character.workOutfit,
            profile: profile,
            prompts: await loadImagePrompts(),
            name: character.name,
            sex: pictureSexOf(life, genderOf(life, characterId) ?? figure.sex),
          }),
          image = await engineClient.paint({
            connectionId: choice.connectionId,
            name: `life sim ${life.id} work ${characterId}`,
            ...prompt,
            ...portraitSizeOf(life),
            styleProfileId: choice.styleProfileId,
          }),
          kept = await engineClient.keep({
            image: image,
            name: `work-${characterId}`,
            prompt: prompt.prompt,
          }),
          cutout = await keepCutout(image, `work-${characterId}-cut`, prompt.prompt);
        await withLife(job.lifeId, (draft) =>
          keepWorkPicture(draft, characterId, {
            url: kept.url,
            ref: `global-gallery:${kept.id}`,
            clean: cutout,
          }),
        );
      } catch (err) {
        await withLife(job.lifeId, (draft) =>
          keepWorkPicture(draft, characterId, {
            error: String(err.said || err.message || err),
          }),
        ).catch(() => {});
        throw err;
      }
    }
  }
  async function keepCutout(image, keepName, prompt) {
    if (!engineClient.cleanSprite) {
      return null;
    }
    try {
      let cut = await engineClient.cleanSprite(image),
        kept = await engineClient.keep({
          image: cut,
          name: keepName,
          prompt: prompt,
        });
      return {
        url: kept.url,
        ref: `global-gallery:${kept.id}`,
      };
    } catch (err) {
      serviceLogger?.warn?.(`[${ID}] cutting out ${keepName}: ${err.message}`);
      return null;
    }
  }
  async function queueSeasonSprites(life) {
    let sprites = seasonSpritesToPaint(life, {
      manual: pictureModeOf(life, "seasons") === "manual",
    });
    await queuePaintKeys(
      life,
      sprites.map((sprite) => `${seasonKeyPrefix}${sprite.id}|${sprite.season}`),
    );
  }
  async function queueCutouts(life) {
    await queuePaintKeys(life, [
      ...cutOutsDue(life).map((entry) => `${cutKeyPrefix}${entry.id}|${entry.what}`),
      ...cutoutsDue(life).map((outfitId) => `${cutKeyPrefix}${personaCutId}|${outfitId}`),
    ]);
  }
  let personaCutId = "you";
  async function queuePaintKeys(life, keys) {
    if (!keys.length) {
      return;
    }
    await loadPaintJobs();
    let fresh = keys.filter(
      (key) =>
        !paintJobs.some((job) => job.lifeId === life.id && job.key === key) &&
        !(paintingNow?.lifeId === life.id && paintingNow.key === key),
    );
    if (fresh.length) {
      paintJobs.push(
        ...fresh.map((key) => ({
          lifeId: life.id,
          key: key,
        })),
      );
      focusLifeId = life.id;
      await savePaintJobs();
      runPaintQueue();
    }
  }
  let parseSpriteKey = (key, prefix) => {
    let [id, what] = key.slice(prefix.length).split("|");
    return {
      id: id,
      what: what === "work" ? "work" : Number(what),
    };
  };
  async function paintSeasonSprite(job) {
    let { id: characterId, what: season } = parseSpriteKey(job.key, seasonKeyPrefix),
      life = await loadLife(job.lifeId),
      character = characterOf(life, characterId),
      outfit = character?.seasonOutfits?.[season];
    if (!(!outfit || !seasonSpritesOn(life))) {
      try {
        let choice = imageChoice(life),
          styles = await engineClient.styleProfiles(),
          profile =
            styles.profiles.find((style) => style.id === choice.styleProfileId) ??
            styles.profiles.find((style) => style.id === styles.defaultId) ??
            {},
          figure = character.figure ?? (await ensureFigure(job.lifeId, characterId).catch(() => null));
        if (!figure?.body) {
          throw new Error("Could not tell what they look like under their clothes. Try again.");
        }
        let prompt = outfitImagePrompt({
            appearance: figure.body,
            outfit: outfit,
            profile: profile,
            prompts: await loadImagePrompts(),
            name: character.name,
            sex: pictureSexOf(life, genderOf(life, characterId) ?? figure.sex),
          }),
          image = await engineClient.paint({
            connectionId: choice.connectionId,
            name: `life sim ${life.id} season ${characterId} ${season}`,
            ...prompt,
            ...portraitSizeOf(life),
            styleProfileId: choice.styleProfileId,
          });
        if (!image.overrideTook) {
          serviceLogger?.warn?.(`[${ID}] the engine did not take our prompt for the season sprite of ${characterId}`);
        }
        let kept = await engineClient.keep({
            image: image,
            name: `season-${characterId}-${season}`,
            prompt: prompt.prompt,
          }),
          cutout = await keepCutout(image, `season-${characterId}-${season}-cut`, prompt.prompt);
        await withLife(job.lifeId, (draft) =>
          keepSeasonPicture(draft, characterId, season, {
            url: kept.url,
            ref: `global-gallery:${kept.id}`,
            clean: cutout,
          }),
        );
      } catch (err) {
        await withLife(job.lifeId, (draft) =>
          keepSeasonPicture(draft, characterId, season, {
            error: String(err.said || err.message || err),
          }),
        ).catch(() => {});
        throw err;
      }
    }
  }
  async function paintCutout(job) {
    if (job.key.startsWith(`${cutKeyPrefix}${personaCutId}|`)) {
      return paintPersonaCutout(job);
    }
    let { id: characterId, what: what } = parseSpriteKey(job.key, cutKeyPrefix),
      life = await loadLife(job.lifeId),
      character = characterOf(life, characterId),
      look = what === "work" ? character?.workLook : character?.seasonLooks?.[what];
    if (!look?.url || look.clean) {
      return;
    }
    let imageData = parseImageDataUrl(await engineClient.imageData?.(look.url)),
      cutout = imageData
        ? await keepCutout(
            {
              ...imageData,
              ...portraitSizeOf(life),
            },
            `${what === "work" ? "work" : `season-${what}`}-${characterId}-cut`,
            "cut out",
          )
        : null;
    await withLife(job.lifeId, (draft) => keepCutOut(draft, characterId, what, cutout));
  }
  async function paintPersonaCutout(job) {
    let outfitId = job.key.slice(`${cutKeyPrefix}${personaCutId}|`.length),
      life = await loadLife(job.lifeId),
      pic = life.clothes?.pics?.[outfitId];
    if (!pic?.url || pic.clean) {
      return;
    }
    let imageData = parseImageDataUrl(await engineClient.imageData?.(pic.url)),
      cutout = imageData
        ? await keepCutout(
            {
              ...imageData,
              ...portraitSizeOf(life),
            },
            `outfit-${outfitId}-cut`,
            "cut out",
          )
        : null;
    await withLife(job.lifeId, (draft) => keepPersonaCutout(draft, outfitId, cutout ?? {}));
  }
  let writingSeasons = new Set();
  async function writeSeasonOutfitsFor(lifeId) {
    if (!(!pretell || !runtime.languageModels || writingSeasons.has(lifeId) || focusLifeId !== lifeId)) {
      writingSeasons.add(lifeId);
      try {
        let life = await loadLife(lifeId);
        for (let characterId of seasonsToWrite(life)) {
          if (focusLifeId !== lifeId) {
            break;
          }
          try {
            let character = characterOf(await loadLife(lifeId), characterId);
            if (!character || character.seasonOutfits) {
              continue;
            }
            if (!character.figure) {
              await ensureFigure(lifeId, characterId, {
                seasons: true,
              });
            }
            let character2 = characterOf(await loadLife(lifeId), characterId);
            if (character2 && !character2.seasonOutfits && character2.figure) {
              let outfits = await writeSeasonOutfits(modelFor(life), {
                name: character2.name,
                figure: character2.figure,
                description: character2.description ?? "",
                job: character2.job?.title ?? "",
              });
              await withLife(lifeId, (draft) => {
                let character3 = characterOf(draft, characterId);
                if (character3 && !character3.seasonOutfits) {
                  character3.seasonOutfits = outfits;
                }
              });
            }
          } catch (err) {
            serviceLogger?.warn?.(`[${ID}] seasons for ${characterId}: ${err.message}`);
          }
        }
        life = await loadLife(lifeId);
        await queueSeasonSprites(life);
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] seasons: ${err.message}`);
      } finally {
        writingSeasons.delete(lifeId);
      }
    }
  }
  async function queueKeyImage(life, entryId, { asked = false } = {}) {
    if (!entryId || (!asked && pictureModeOf(life, "keys") === "manual")) {
      return;
    }
    await loadPaintJobs();
    let key = `${keyImagePrefix}${entryId}`;
    if (!paintJobs.some((job) => job.lifeId === life.id && job.key === key)) {
      paintJobs.push({
        lifeId: life.id,
        key: key,
      });
      focusLifeId = life.id;
      await savePaintJobs();
      runPaintQueue();
    }
  }
  async function ensureFigure(lifeId, characterId, { seasons = false } = {}) {
    let life = await loadLife(lifeId);
    if (characterId === "you") {
      if (life.personaFigure) {
        return life.personaFigure;
      }
      let persona = await engineClient.persona(life.persona?.id).catch(() => null),
        figure2 = await describeFigure(modelFor(life), {
          name: persona?.name ?? life.persona?.name ?? "",
          appearance: persona?.appearance ?? "",
          description: persona?.description ?? "",
        });
      await withLife(lifeId, (draft) => {
        draft.personaFigure ??= figure2;
      });
      return figure2;
    }
    let character = characterOf(life, characterId);
    if (!character) {
      return null;
    }
    if (character.figure) {
      return character.figure;
    }
    let about = {
        name: character.name,
        appearance: character.appearance ?? "",
        description: character.description ?? "",
      },
      withSeasons =
        (seasons || seasonOutfitsEnabled(life)) && !character.seasonOutfits
          ? await describeFigureWithSeasons(modelFor(life), about)
          : null,
      figure = withSeasons?.figure ?? (await describeFigure(modelFor(life), about));
    await withLife(lifeId, (draft) => {
      let character2 = characterOf(draft, characterId);
      if (character2 && !character2.figure) {
        character2.figure = figure;
      }
      if (character2 && withSeasons?.seasons && !character2.seasonOutfits) {
        character2.seasonOutfits = withSeasons.seasons;
      }
    });
    return figure;
  }
  async function paintKeyImage(job) {
    let entryId = job.key.slice(keyImagePrefix.length),
      life = await enqueue(job.lifeId, () => loadLife(job.lifeId)),
      entry = albumEntryById(life, entryId);
    if (entry) {
      if (keyImageAside(life, entry)) {
        return PAINT_WAITS;
      }
      try {
        if (!keyImagesOn(life)) {
          throw new Error("Key images are off for this life, or it has no image connection.");
        }
        for (let id of [...(entry.noYou ? [] : ["you"]), ...entry.cast]) {
          await ensureFigure(job.lifeId, id);
        }
        if (((life = await loadLife(job.lifeId)), !albumEntryById(life, entryId))) {
          return;
        }
        let figures = figuresOf(life, entry.cast, {
            you: !entry.noYou,
          }).map(
            (figure) =>
              figure ?? {
                sex: "other",
                body: "",
                outfit: "",
              },
          ),
          choice = imageChoice(life),
          styles = await engineClient.styleProfiles(),
          profile =
            styles.profiles.find((style) => style.id === choice.styleProfileId) ??
            styles.profiles.find((style) => style.id === styles.defaultId) ??
            {},
          prompt = entry.picture?.prompt
            ? keyImagePrompt({
                written: entry.picture.prompt,
                profile: profile,
                people: figures.length,
                prompts: await loadImagePrompts(),
              })
            : sceneIllustrationPrompt({
                people: figures,
                picture: entry.picture,
                subject: entry.subject,
                time: entry.time,
                profile: profile,
              }),
          image = await engineClient.paint({
            connectionId: choice.connectionId,
            name: `life sim ${life.id} ${entryId}`,
            ...prompt,
            ...backgroundSizeOf(life),
            styleProfileId: choice.styleProfileId,
          });
        if (!image.overrideTook) {
          serviceLogger?.warn?.(`[${ID}] the engine did not take our prompt for key image ${entryId}`);
        }
        let kept = await engineClient.keep({
          image: image,
          name: `key-${entryId}`,
          prompt: prompt.prompt,
        });
        await withLife(job.lifeId, (draft) =>
          addAlbumVersion(draft, entryId, {
            url: kept.url,
            ref: `global-gallery:${kept.id}`,
            prompt: prompt.prompt,
          }),
        );
      } catch (err) {
        await withLife(job.lifeId, (draft) => failAlbumEntry(draft, entryId, err.said || err.message || err)).catch(
          () => {},
        );
        throw err;
      }
    }
  }
  async function paintJob(job) {
    if (isKeyImageJobKey(job.key)) {
      return paintKeyImage(job);
    }
    if (isOutfitJobKey(job.key)) {
      return paintOutfit(job);
    }
    if (isWorkJobKey(job.key)) {
      return paintWorkSprite(job);
    }
    if (isSeasonJobKey(job.key)) {
      return paintSeasonSprite(job);
    }
    if (isCutJobKey(job.key)) {
      return paintCutout(job);
    }
    let life = await loadLife(job.lifeId),
      look = life.look ?? cleanTownLook();
    try {
      if (!look.connectionId) {
        throw new Error("No image connection chosen.");
      }
      let styles = await engineClient.styleProfiles(),
        profile =
          styles.profiles.find((style) => style.id === look.styleProfileId) ??
          styles.profiles.find((style) => style.id === styles.defaultId) ??
          {},
        prompt = backgroundImagePrompt(job.key, {
          profile: profile,
          townTags: look.tags,
          prompts: await loadImagePrompts(),
        }),
        paintName = `life sim ${job.key.replace("|", " ")}`,
        image = await engineClient.paint({
          connectionId: look.connectionId,
          name: paintName,
          ...prompt,
          ...backgroundSizeOf(life),
          styleProfileId: look.styleProfileId,
        });
      if (!image.overrideTook) {
        serviceLogger?.warn?.(`[${ID}] the engine did not take our prompt for ${job.key}`);
      }
      let kept = await engineClient.keep({
          image: image,
          name: job.key,
          prompt: prompt.prompt,
        }),
        version = await updateGallery((gallery) =>
          addGalleryVersion(
            gallery,
            job.key,
            {
              url: kept.url,
              galleryId: kept.id,
            },
            {
              at: now(),
              connection: look.connectionId,
              profile: look.styleProfileId ?? "",
              tags: look.tags,
              prompt: prompt.prompt,
            },
          ),
        );
      await withLife(job.lifeId, (draft) => {
        draft.look = cleanTownLook(draft.look ?? {});
        draft.look.picks[job.key] = version;
        delete draft.look.own[job.key];
        delete draft.look.failed[job.key];
      });
    } catch (err) {
      await withLife(job.lifeId, (draft) => {
        draft.look = cleanTownLook(draft.look ?? {});
        draft.look.failed[job.key] = String(err.said || err.message || err).slice(0, 200);
      }).catch(() => {});
      throw err;
    }
  }
  let imagePromptsDocKind = "image-prompts",
    imagePromptsCache = null;
  async function loadImagePrompts() {
    if (!imagePromptsCache) {
      imagePromptsCache = imagePromptsWithOverrides(
        (await findSingletonDoc(imagePromptsDocKind))?.data?.overrides ?? {},
      );
    }
    return imagePromptsCache;
  }
  function paintQueueStatus(life) {
    let keys = (paintJobs ?? []).filter((job) => job.lifeId === life.id).map((job) => job.key),
      backgroundKeys = keys.filter((key) => !isOutfitJobKey(key) && !isKeyImageJobKey(key) && !isSpriteJobKey(key)),
      current = paintingNow?.lifeId === life.id ? paintingNow.key : null;
    return {
      pending: backgroundKeys.length,
      painting:
        current && !isOutfitJobKey(current) && !isKeyImageJobKey(current) && !isSpriteJobKey(current) ? current : null,
      keys: keys.filter(
        (key) => isKeyImageJobKey(key) && !keyImageAside(life, albumEntryById(life, key.slice(keyImagePrefix.length))),
      ).length,
      people: keys.filter(isSpriteJobKey).length + (current && isSpriteJobKey(current) ? 1 : 0),
      queued: backgroundKeys,
      failed: Object.keys(life.look?.failed ?? {}).length,
      paused: !!life.look?.paused,
      outfits: {
        queued: keys.filter(isOutfitJobKey).map((key) => key.slice(outfitKeyPrefix.length)),
        painting: current && isOutfitJobKey(current) ? current.slice(outfitKeyPrefix.length) : null,
        ahead: (paintJobs ?? []).filter((job) => !isOutfitJobKey(job.key)).length,
      },
    };
  }
  function pictureCounts(life) {
    let gallery = galleryCache ?? createBackgroundGallery(),
      backgroundKeys = life.look?.connectionId ? backgroundKeysOf(life) : [],
      closetItems = isClothesRuleOn(life)
        ? (life.things?.closet ?? []).filter(
            (itemId) => itemId !== "own" && itemDef(life.things, itemId)?.kind === "clothes",
          )
        : [],
      workers = workSpritesOn(life)
        ? (life.characters ?? []).filter((character) => !character.away && character.job?.id && character.workOutfit)
        : [],
      seasonIndex = currentSeasonIndex(life),
      dressed = seasonSpritesOn(life) ? (life.characters ?? []).filter((character) => !character.away) : [],
      album = keyImagesOn(life) ? (life.album ?? []).filter((entry) => !keyImageAside(life, entry)) : [],
      tally = (asks, painted) => ({
        asks: asks,
        painted: painted,
        left: Math.max(0, asks - painted),
      });
    return {
      modes: cleanPictureModes(life.pictures),
      counts: {
        backgrounds: tally(
          backgroundKeys.length,
          backgroundKeys.filter((key) => pickedBackgroundFor(gallery, life.look, key)).length,
        ),
        clothes: tally(closetItems.length, closetItems.filter((itemId) => life.clothes?.pics?.[itemId]).length),
        work: tally(workers.length, workers.filter((character) => character.workLook?.url).length),
        seasons: tally(dressed.length, dressed.filter((character) => character.seasonLooks?.[seasonIndex]?.url).length),
        keys: tally(album.length, album.filter((entry) => entry.status === "ready").length),
      },
    };
  }
  function backgroundKeysOf(life) {
    return neededBackgroundKeys(life, collectModuleHook(life, "backdrops").flat());
  }
  let backgroundSubjectHere = (life) =>
      life.visit?.stage === "inside"
        ? residenceBackgroundSubject(characterOf(life, life.visit.characterId)?.residence?.place, life.wallet?.home)
        : backgroundSubjectOfPlace(life.at, life.wallet?.home),
    backdropSubjectHere = (life) => firstModuleHook(life, "backdropHere") ?? backgroundSubjectHere(life);
  function viewOfLife(life) {
    let view = lifeView(life),
      gallery = galleryCache ?? createBackgroundGallery(),
      look = life.look ?? cleanTownLook(),
      dayNight = dayOrNightAt(life.minutes),
      pictureFor = (subject) =>
        subject ? (pickedBackgroundFor(gallery, look, backgroundKeyFor(subject, dayNight))?.url ?? null) : null,
      paintStatus = paintQueueStatus(life),
      wantedFor = (subject) => {
        if (!subject || !pictures || !look.connectionId || pictureFor(subject)) {
          return null;
        }
        let key = backgroundKeyFor(subject, dayNight);
        return {
          key: key,
          state:
            paintStatus.painting === key
              ? "painting"
              : paintStatus.queued.includes(key)
                ? "queued"
                : look.failed?.[key]
                  ? "failed"
                  : "missing",
        };
      };
    return translateView(life, {
      ...view,
      backdrop: {
        time: dayNight,
        here: pictureFor(backdropSubjectHere(life)) ?? pictureFor(backgroundSubjectHere(life)),
        map: pictureFor("town"),
        places: Object.fromEntries(
          life.town.places.map((place) => [
            place.id,
            pictureFor(backgroundSubjectOfPlace(place.id, life.wallet?.home)),
          ]),
        ),
        districts: Object.fromEntries(
          townDistricts(life.town).map((district) => [district.id, pictureFor(districtBackgroundSubject(district.id))]),
        ),
        wanted: {
          here: wantedFor(backdropSubjectHere(life)),
          places: Object.fromEntries(
            life.town.places
              .map((place) => [place.id, wantedFor(backgroundSubjectOfPlace(place.id, life.wallet?.home))])
              .filter(([, wanted]) => wanted),
          ),
          districts: Object.fromEntries(
            townDistricts(life.town)
              .map((district) => [district.id, wantedFor(districtBackgroundSubject(district.id))])
              .filter(([, wanted]) => wanted),
          ),
        },
      },
      pictures: pictureCounts(life),
      paint: paintQueueStatus(life),
      news: {
        unseen: (life.news ?? []).filter((item) => !item.seen).length,
        writing: !!life.weekDone,
      },
      door: doorView(life),
      jobs: jobsView(life),
      career: careerView(life),
      save: {
        played: life.playedVersion ?? null,
        current: VERSION,
        compatible: !olderVersion(life.playedVersion, SAVES_FROM),
      },
      modules: modulesView(life),
    });
  }
  function backgroundTiles(life) {
    let gallery = galleryCache ?? createBackgroundGallery(),
      look = life.look ?? cleanTownLook(),
      paintStatus = paintQueueStatus(life),
      tiles = backgroundKeysOf(life).map((key) => {
        let { subject: subject, time: time } = parseBackgroundKey(key),
          versionCount = galleryVersionsFor(gallery, key).length,
          picked = pickedBackgroundFor(gallery, look, key),
          tileStatus =
            paintStatus.painting === key
              ? "painting"
              : paintStatus.queued.includes(key)
                ? "queued"
                : look.failed?.[key]
                  ? "failed"
                  : picked
                    ? "ready"
                    : "missing";
        return {
          key: key,
          subject: subject,
          time: time,
          name: backgroundSubjectName(life, subject),
          status: tileStatus,
          error: look.failed?.[key] ?? "",
          url: picked?.url ?? null,
          version: picked ? picked.index + 1 : 0,
          versions: versionCount,
          mine: !!picked && picked.at > 0 && picked.at >= (life.createdAt ?? 0),
          yours: !!picked?.own,
        };
      });
    return {
      look: {
        connectionId: look.connectionId,
        styleProfileId: look.styleProfileId,
        tags: look.tags,
        paused: look.paused,
      },
      tiles: tiles,
      queue: {
        ...paintStatus,
        done: tiles.filter((tile) => tile.status === "ready").length,
        total: tiles.length,
      },
    };
  }
  let backgroundSubjectName = (life, subject) => {
    let district = townDistricts(life.town).find((district2) => districtBackgroundSubject(district2.id) === subject);
    if (district) {
      return `${district.name} \xB7 district`;
    }
    let place = life.town.places.find((place2) => place2.id === subject);
    return place
      ? subject === "apartments"
        ? `${place.name} \xB7 hallway`
        : subject === "houses" || subject === "mansions"
          ? `${place.name} \xB7 street`
          : place.name
      : (BACKGROUND_SUBJECTS[subject]?.name ?? subject);
  };
  async function changedAvatars(life) {
    if (!pictures) {
      return [];
    }
    let [cards, personas] = await Promise.all([
        engineClient.cards().catch(() => null),
        engineClient.personas().catch(() => null),
      ]),
      changes = [];
    if (cards) {
      let avatarById = new Map(cards.map((card) => [card.id, card.avatar || null]));
      for (let character of life.characters ?? []) {
        let cardId = character.cardId ?? character.id;
        if (avatarById.has(cardId) && avatarById.get(cardId) !== (character.avatar || null)) {
          changes.push(["card", character.id, avatarById.get(cardId)]);
        }
      }
    }
    let persona = life.persona?.id && personas?.find((persona2) => persona2.id === life.persona.id);
    if (persona && (persona.avatar || null) !== (life.persona.avatarPath ?? life.persona.avatar ?? null)) {
      changes.push(["persona", life.persona.id, persona.avatar || null]);
    }
    return changes;
  }
  function applyAvatarChanges(life, changes) {
    for (let [kind, id, avatar] of changes) {
      if (kind === "persona") {
        life.persona.avatar = avatar;
        delete life.persona.avatarPath;
        continue;
      }
      let character = life.characters.find((character2) => character2.id === id);
      if (character) {
        character.avatar = avatar;
      }
    }
  }
  let toldDocKind = "told-library",
    toldDocIds = new Map();
  async function findToldDoc(languageKey) {
    let docId = toldDocIds.get(languageKey);
    if (docId) {
      let doc = await documents.getById(ID, docId);
      if (doc) {
        return doc;
      }
      toldDocIds.delete(languageKey);
    }
    let found = (await documents.list(ID, toldDocKind)).find((doc) => doc.name === languageKey) ?? null;
    if (found) {
      toldDocIds.set(languageKey, found.id);
    }
    return found;
  }
  let languageOf = (life) => life.settings?.language ?? DEFAULT_LANGUAGE;
  async function loadLinesBank(language) {
    return (await findToldDoc(normalizeLinesLanguageKey(language)))?.data ?? emptyLinesBank(language);
  }
  function updateLinesBank(language, mutate) {
    let languageKey = normalizeLinesLanguageKey(language);
    return enqueue(`told:${languageKey}`, async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        let doc = await findToldDoc(languageKey),
          bank = doc?.data ?? emptyLinesBank(language);
        mutate(bank);
        let stamp = new Date(now()).toISOString();
        if (!doc) {
          let created = await documents.create({
            id: randomUUID(),
            packageId: ID,
            kind: toldDocKind,
            name: languageKey,
            description: `Activity lines \xB7 ${language}`,
            data: bank,
            createdAt: stamp,
            updatedAt: stamp,
          });
          toldDocIds.set(languageKey, created.id);
          return bank;
        }
        if (
          await documents.update({
            id: doc.id,
            packageId: ID,
            expectedRevision: doc.revision,
            name: languageKey,
            description: doc.description,
            data: bank,
            updatedAt: stamp,
          })
        ) {
          return bank;
        }
      }
      throw httpError(409, "Could not save the activity lines.");
    });
  }
  let activityLineRequests = new Map(),
    callWordsBanks = new Map(),
    callWordsAskedAt = new Map(),
    CALL_WORDS_RETRY_MS = 600 * 1e3,
    properNamesOf = (life) => callWordsProperNames(life, TOWN_PLACES);
  function translateView(life, view) {
    let language = languageOf(life);
    return isEnglishLanguage(language)
      ? view
      : translateStateCallWords(view, callWordsBanks.get(normalizeCallWordsLanguageKey(language)), properNamesOf(life));
  }
  async function writeCallWords(life, { write = true } = {}) {
    let language = languageOf(life);
    if (isEnglishLanguage(language)) {
      return;
    }
    let languageKey = normalizeCallWordsLanguageKey(language);
    if (!callWordsBanks.has(languageKey)) {
      callWordsBanks.set(languageKey, (await loadLinesBank(language).catch(() => null))?.calls ?? {});
    }
    let views = {
        scene: sceneView(life),
        outing: outingView(life),
        visit: visitView(life),
        career: {
          shift: shiftView(life),
        },
      },
      missing = missingCallWordKeys(
        callWordsBanks.get(languageKey),
        collectCallWordGroups(views),
        properNamesOf(life),
      ).slice(0, 20);
    if (!(
      !write ||
      focusLifeId !== life.id ||
      !missing.length ||
      Date.now() - (callWordsAskedAt.get(languageKey) ?? -1 / 0) < CALL_WORDS_RETRY_MS ||
      !runtime.languageModels
    )) {
      callWordsAskedAt.set(languageKey, Date.now());
      modelFor(life, {
        scope: "shared",
      })
        .askJson(buildCallWordsMessages(missing, language), {
          maxTokens: 900,
          task: "call-words",
          about: "",
        })
        .then(({ json: json }) =>
          updateLinesBank(language, (bank) => {
            let merged = mergeCallWordsReply(bank.calls ?? {}, missing, json);
            bank.calls = merged.bank;
            callWordsBanks.set(languageKey, merged.bank);
            if (merged.kept === missing.length) {
              callWordsAskedAt.delete(languageKey);
            }
          }),
        )
        .catch((err) => serviceLogger?.warn?.(`[${ID}] call words: ${err.message}`));
    }
  }
  async function fillHelpLines(life, result) {
    let wanted = [];
    if (life.foodDoor && !life.foodDoor.line) {
      wanted.push([
        "food",
        life.foodDoor.characterId,
        (line) => {
          life.foodDoor.line = line;
        },
      ]);
    }
    for (let ev of result?.events ?? []) {
      if (ev.id === "helped" && ev.kind === "rent" && !ev.line) {
        wanted.push([
          "rent",
          ev.characterId,
          (line) => {
            ev.line = line;
            ev.text = `${ev.text} \xAB${line}\xBB`;
          },
        ]);
      }
    }
    if (!wanted.length) {
      return;
    }
    let language = languageOf(life),
      bank = await loadLinesBank(language).catch(() => emptyLinesBank(language));
    for (let [kind, characterId, apply] of wanted) {
      let line = pickHelpLine(bank, kind, life.bonds[characterId]?.archetype?.main, `${characterId}|${life.minutes}`);
      if (line) {
        apply(line);
      } else {
        requestHelpLinesFor(life, kind);
      }
    }
  }
  let helpLineRequests = new Set();
  function requestHelpLinesFor(life, kind) {
    let language = languageOf(life),
      requestKey = `${normalizeLinesLanguageKey(language)}|${kind}`;
    if (!(helpLineRequests.has(requestKey) || !runtime.languageModels)) {
      helpLineRequests.add(requestKey);
      requestHelpLines(
        modelFor(life, {
          scope: "shared",
        }),
        kind,
        {
          language: language,
        },
      )
        .then((lines) =>
          updateLinesBank(language, (bank) => {
            bank.help = {
              ...(bank.help ?? {}),
              [kind]: {
                ...(bank.help?.[kind] ?? {}),
                ...lines,
              },
            };
          }),
        )
        .catch((err) => serviceLogger?.warn?.(`[${ID}] help lines (${kind}): ${err.message}`))
        .finally(() => helpLineRequests.delete(requestKey));
    }
  }
  function writeActivityLines(life, place, activityIds) {
    let language = languageOf(life),
      requestKey = `${normalizeLinesLanguageKey(language)}|${activityIds.join(",")}`;
    if (!activityLineRequests.has(requestKey)) {
      let request = loadLinesBank(language)
        .then((bank) =>
          requestActivityLines(
            modelFor(life, {
              scope: "shared",
            }),
            place,
            activityIds,
            {
              language: language,
              existing: bank.lines,
            },
          ),
        )
        .then((lines) => updateLinesBank(language, (bank) => mergeActivityLinesIntoBank(bank, lines)))
        .finally(() => activityLineRequests.delete(requestKey));
      activityLineRequests.set(requestKey, request);
    }
    return activityLineRequests.get(requestKey);
  }
  let writingActivityLines = new Set();
  async function writeActivityLinesAhead(lifeId) {
    if (!(!pretell || !runtime.languageModels || writingActivityLines.has(lifeId) || focusLifeId !== lifeId)) {
      writingActivityLines.add(lifeId);
      try {
        for (let round = 0; round < 20; round++) {
          let life = await loadLife(lifeId),
            bank = await loadLinesBank(languageOf(life)),
            places = [...new Set([life.at, "home", ...life.town.places.map((place2) => place2.id)])],
            place = placesMissingActivityLines(bank, places)[0];
          if (!place) {
            break;
          }
          await writeActivityLines(
            life,
            place,
            PLACE_ACTIVITIES[place].map((item) => item.id).filter((item) => !bank.lines[item]),
          );
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] writing activity lines ahead: ${err.message}`);
      } finally {
        writingActivityLines.delete(lifeId);
      }
    }
  }
  let writingNewArrivals = new Set();
  async function writeNewArrivals(lifeId) {
    if (!(!pretell || !runtime.languageModels || writingNewArrivals.has(lifeId) || focusLifeId !== lifeId)) {
      writingNewArrivals.add(lifeId);
      try {
        let life = await loadLife(lifeId),
          season = seasonKeyAt(life.minutes),
          wearer = WEARER_BY_GENDER[genderOf(life, "you")] ?? "",
          isCurrent = (news2) =>
            news2?.season === season && (news2.wearer !== undefined ? news2.wearer === wearer : wearer !== "man");
        if (!life.things || isCurrent(life.things.news)) {
          return;
        }
        let model = modelFor(life),
          { json: json } = await model.askJson(
            newArrivalsPrompt({
              season: clockFromMinutes(life.minutes).season,
              setting: settingNoteFor(life),
              wearer: wearer,
            }),
            {
              maxTokens: 900,
              task: "shop-news",
            },
          ),
          news = parseNewArrivals(json, season, wearer);
        await withLife(lifeId, (draft) => {
          if (draft.things && !isCurrent(draft.things.news)) {
            draft.things.news = news;
          }
        });
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] the season's new arrivals: ${err.message}`);
      } finally {
        writingNewArrivals.delete(lifeId);
      }
    }
  }
  let writingTastes = new Set(),
    writingGenders = new Set(),
    checkingWork = new Set();
  async function checkWeekWork(lifeId) {
    if (!(!pretell || !runtime.languageModels || checkingWork.has(lifeId) || focusLifeId !== lifeId)) {
      checkingWork.add(lifeId);
      try {
        let life = await loadLife(lifeId),
          model = modelFor(life),
          repaint = false;
        for (let character of life.characters.filter((character2) => !character2.workChecked && !character2.away)) {
          if (focusLifeId !== lifeId) {
            break;
          }
          try {
            let blocks = unlabeledWeekBlocks(character),
              placeName = (placeId) => life.town.places.find((place) => place.id === placeId)?.name ?? placeId,
              cells = blocks.length
                ? workCellsFromAnswer(
                    (
                      await model.askJson(
                        buildWeekWorkPrompt(character, blocks, {
                          placeName: placeName,
                        }),
                        {
                          maxTokens: 300,
                          task: "week-work",
                          about: character.name,
                        },
                      )
                    ).json,
                    blocks,
                  )
                : [];
            await withLife(lifeId, (draft) => {
              if (repairWork(draft, character.id, cells).repaint) {
                repaint = true;
              }
            });
          } catch (err) {
            serviceLogger?.warn?.(`[${ID}] work in the week of ${character.id}: ${err.message}`);
          }
        }
        if (repaint) {
          await queueWorkSprites(await loadLife(lifeId));
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] work in the weeks: ${err.message}`);
      } finally {
        checkingWork.delete(lifeId);
      }
    }
  }
  let figureJobs = new Set();
  async function ensureCastFigures(lifeId) {
    if (!(!pretell || !runtime.languageModels || figureJobs.has(lifeId) || focusLifeId !== lifeId)) {
      figureJobs.add(lifeId);
      try {
        let life = await loadLife(lifeId);
        if (!keyImagesOn(life)) {
          return;
        }
        for (let who of [
          "you",
          ...life.characters
            .filter((character) => !character.figure && !character.away)
            .map((character) => character.id),
        ]) {
          try {
            await ensureFigure(lifeId, who);
          } catch (err) {
            serviceLogger?.warn?.(`[${ID}] figure for ${who}: ${err.message}`);
          }
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] figures: ${err.message}`);
      } finally {
        figureJobs.delete(lifeId);
      }
    }
  }
  let townWeekJobs = new Set();
  async function runTownWeek(lifeId) {
    if (!(townWeekJobs.has(lifeId) || focusLifeId !== lifeId)) {
      townWeekJobs.add(lifeId);
      try {
        let life = await loadLife(lifeId),
          weekDone = life.weekDone;
        if (!weekDone) {
          return;
        }
        let tells = tellsFor(life),
          pairs = crossedPaths(life),
          outcome = {
            told: [],
            between: [],
          };
        if (pretell && runtime.languageModels && (tells.length || pairs.length)) {
          try {
            let nameOf = (id) => characterOf(life, id)?.name ?? npcNameAside(life, id),
              people = [
                ...new Set([
                  ...pairs.flatMap((pair) => [pair.a, pair.b]),
                  ...tells
                    .flatMap((tell) => [tell.from, tell.to, tell.a, tell.b])
                    .filter((tell) => tell && tell !== "you"),
                ]),
              ].map((id) => ({
                id: id,
                name: nameOf(id),
                type:
                  notableTraitWords(traitsOf(life, id))
                    .map((trait) => trait.word)
                    .join(", ") || "nothing that stands out",
              })),
              nameById = (id) => nameOf(id),
              factsById = Object.fromEntries((life.facts ?? []).map((fact) => [fact.id, fact])),
              tellLines = tells.map((tell) =>
                tell.to === "you"
                  ? {
                      fromName: nameOf(tell.from),
                      toName: "the player",
                      text: `that ${nameOf(tell.a)} and ${nameOf(tell.b)} are seeing each other`,
                    }
                  : {
                      fromName: nameOf(tell.from),
                      toName: nameOf(tell.to),
                      text: factsById[tell.fact] ? describeTownFact(life, factsById[tell.fact], nameById) : "",
                    },
              ),
              model = modelFor(life),
              { json: reply } = await model.askJson(
                networkWeekPrompt({
                  people: people,
                  pairs: pairs,
                  tells: tellLines,
                  language: life.settings?.language ?? DEFAULT_LANGUAGE,
                  setting: settingNoteFor(life),
                  couples: !!life.rules?.castCouples,
                }),
                {
                  maxTokens: 900,
                  task: "network-week",
                  about: life.townName || "the town",
                },
              );
            outcome = parseNetworkWeek(reply, {
              tells: tells,
              pairs: pairs,
            });
          } catch (err) {
            if ((serviceLogger?.warn?.(`[${ID}] the week in town: ${err.message}`), (weekDone.tries ?? 0) < 1)) {
              await withLife(lifeId, (draft) => {
                if (draft.weekDone?.index === weekDone.index) {
                  draft.weekDone.tries = (draft.weekDone.tries ?? 0) + 1;
                }
              });
              return;
            }
          }
        }
        await withLife(lifeId, (draft) => {
          if (draft.weekDone?.index === weekDone.index) {
            settleWeek(draft, outcome, {
              tells: tells,
            });
          }
        });
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] the week in town: ${err.message}`);
      } finally {
        townWeekJobs.delete(lifeId);
      }
    }
  }
  let counterJobs = new Set();
  async function refreshCounterLines(lifeId) {
    if (!(!pretell || !runtime.languageModels || counterJobs.has(lifeId) || focusLifeId !== lifeId)) {
      counterJobs.add(lifeId);
      try {
        let life = await loadLife(lifeId),
          due = counterDue(life),
          character = due ? characterOf(life, due.characterId) : null,
          bond = due ? life.bonds[due.characterId] : null;
        if (!character || !bond) {
          return;
        }
        let lines = await writeCounterLines(modelFor(life), character, bond, {
          player: life.persona?.name || "the player",
          place: life.town.places.find((place) => place.id === life.at)?.name ?? "the store",
          title: character.job?.title ?? "shop assistant",
          met: hasMet2(life, character.id),
          language: life.settings?.language ?? DEFAULT_LANGUAGE,
          tone: bondSummary(bond).archetype.tone,
          setting: settingNoteFor(life),
          memories: memoriesInBudget(character)
            .slice(-5)
            .map((memory) => memory.text),
          suits: suitsSection(life, character),
        });
        await withLife(lifeId, (draft) => {
          setCounterLines(draft, due.characterId, due.key, lines);
        });
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] counter lines: ${err.message}`);
      } finally {
        counterJobs.delete(lifeId);
      }
    }
  }
  let driftJobs = new Set();
  async function refreshDriftWords(lifeId) {
    if (!pretell || !runtime.languageModels || driftJobs.has(lifeId) || focusLifeId !== lifeId) {
      return;
    }
    driftJobs.add(lifeId);
    let due = null;
    try {
      let life = await loadLife(lifeId);
      if (((due = driftDue(life)), !due)) {
        return;
      }
      let words = await requestDriftWords(modelFor(life), driftPeople(life, due.list), {
        language: life.settings?.language ?? DEFAULT_LANGUAGE,
        setting: settingNoteFor(life),
      });
      await withLife(lifeId, (draft) => {
        setDriftWords(draft, due.day, words);
      });
    } catch (err) {
      serviceLogger?.warn?.(`[${ID}] drift words: ${err.message}`);
      if (due) {
        await withLife(lifeId, (draft) => {
          draft.driftTried = due.day;
        }).catch(() => {});
      }
    } finally {
      driftJobs.delete(lifeId);
    }
  }
  async function readOrientations(lifeId) {
    if (!(!pretell || !runtime.languageModels || writingGenders.has(lifeId) || focusLifeId !== lifeId)) {
      writingGenders.add(lifeId);
      try {
        let life = await loadLife(lifeId),
          model = modelFor(life);
        for (let character of life.characters.filter(
          (candidate) => !candidate.gender || candidate.into === undefined,
        )) {
          if (focusLifeId !== lifeId) {
            break;
          }
          try {
            let card = await engineClient.card(character.cardId ?? character.id).catch(() => null),
              orientation = await readCardOrientation(model, {
                name: character.name,
                description: card?.description ?? character.description ?? "",
                personality: card?.personality ?? "",
                scenario: card?.scenario ?? "",
                appearance: card?.appearance ?? character.appearance ?? "",
              });
            await withLife(lifeId, (draft) => {
              let stored = draft.characters.find((entry) => entry.id === character.id);
              if (stored) {
                stored.gender ??= orientation.gender ?? normalizeGender(stored.figure?.sex);
                stored.into ??= orientation.into;
                settleOrientation(draft, [stored.id]);
              }
            });
          } catch (err) {
            serviceLogger?.warn?.(`[${ID}] orientation for ${character.id}: ${err.message}`);
          }
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] orientation: ${err.message}`);
      } finally {
        writingGenders.delete(lifeId);
      }
    }
  }
  async function readTastes(lifeId) {
    if (!(!pretell || !runtime.languageModels || writingTastes.has(lifeId) || focusLifeId !== lifeId)) {
      writingTastes.add(lifeId);
      try {
        let life = await loadLife(lifeId),
          model = modelFor(life);
        for (let character of life.characters.filter(
          (candidate) => !candidate.tastes || !candidate.clothesTaste || !candidate.dateTastes,
        )) {
          try {
            let tastes = await readCharacterTastes(model, character, {
              setting: settingNoteFor(life),
            });
            await withLife(lifeId, (draft) => {
              let stored = draft.characters.find((entry) => entry.id === character.id);
              if (stored && !stored.tastes && tastes.tastes) {
                stored.tastes = tastes.tastes;
              }
              if (stored && !stored.clothesTaste && tastes.clothes) {
                stored.clothesTaste = tastes.clothes;
              }
              if (stored && !stored.dateTastes && tastes.dates) {
                stored.dateTastes = tastes.dates;
              }
            });
          } catch (err) {
            serviceLogger?.warn?.(`[${ID}] gift tastes for ${character.id}: ${err.message}`);
          }
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] gift tastes: ${err.message}`);
      } finally {
        writingTastes.delete(lifeId);
      }
    }
  }
  async function buildCast(
    picks,
    placeIds,
    { from: startIndex = 0, stores = [], town = null, held: heldJobs = [] } = {},
  ) {
    let cast = [],
      takenJobs = [...heldJobs];
    for (let [index, pick] of picks.entries()) {
      let card = await engineClient.card(pick?.cardId).catch(() => null);
      if (!card) {
        throw httpError(400, "One of the character cards could not be read.");
      }
      let mainArchetype = ARCHETYPE_IDS.includes(pick?.main) ? pick.main : "grounded",
        secondArchetype = ARCHETYPE_IDS.includes(pick?.second) && pick.second !== mainArchetype ? pick.second : null;
      cast.push({
        id: card.id,
        cardId: card.id,
        name: card.name,
        description: card.description || card.personality,
        appearance: card.appearance,
        avatar: card.avatar,
        archetype: {
          main: mainArchetype,
          second: secondArchetype,
        },
        ...(pick?.traits && typeof pick.traits == "object"
          ? {
              traits: normalizeTraits({
                ...pick.traits,
                ...(pick.traitsBy === "you"
                  ? {
                      tone: "",
                    }
                  : {}),
              }),
            }
          : {}),
        ...(THEIR_THING_ACTIVITIES[pick?.thing]
          ? {
              theirThing: pick.thing,
            }
          : {}),
        ...(pick?.traitsBy === "you"
          ? {
              traitsBy: "you",
            }
          : {}),
        ...(pick?.thingBy === "you" && THEIR_THING_ACTIVITIES[pick?.thing]
          ? {
              thingBy: "you",
            }
          : {}),
        romanceable: pick?.romanceable !== false,
        castRomance: typeof pick?.castRomance == "boolean" ? pick.castRomance : pick?.romanceable !== false,
        livesIn: validResidencePlace(pick?.livesIn) ?? "apartments",
        ...(Number.isInteger(pick?.settled) && pick.settled >= 0 && pick.settled <= 3
          ? {
              settled: pick.settled,
            }
          : {}),
        ...(pick?.rich === true
          ? {
              rich: true,
            }
          : {}),
        birthday: normalizeBirthday(pick?.birthday),
        gender: normalizeGender(pick?.gender),
        into: normalizeAttraction(pick?.into),
        knows: normalizeStartingRelation(pick?.knows),
        ...(normalizeStartingRelation(pick?.knows) === "family"
          ? {
              kin: normalizeKinKind(pick?.kin) ?? "relatives",
            }
          : {}),
        tastes: parseGiftTastes(pick?.tastes),
        clothesTaste: parseClothesTaste(pick?.clothesTaste),
        dateTastes: parseDateTastes(pick?.dateTastes),
        workChecked: true,
        week: weekScheduleForCharacter(pick, startIndex + index, placeIds, stores),
        memories: [],
      });
      let member = cast.at(-1),
        freeJobs = town
          ? openTownJobs(town, [], {
              taken: takenJobs,
            })
          : [],
        choice = town
          ? (resolveJobChoice(
              {
                id: pick?.job,
                title: pick?.jobTitle,
              },
              town,
              {
                free: freeJobs,
              },
            ) ?? placeForJobId(pick?.job, freeJobs))
          : null,
        job = choice?.id
          ? {
              id: choice.id,
              place: choice.place,
              title: choice.title,
            }
          : choice;
      member.job =
        job ??
        (pick?.job && pick.job !== "none"
          ? {
              out: true,
            }
          : null);
      if (member.job?.id) {
        takenJobs.push(member.job.id);
        member.week = applyJobToWeek(member.week, townJobById(town, member.job.id));
      } else {
        member.week = applyJobToWeek(member.week, member.job);
      }
      member.workOutfit =
        (member.job &&
          !member.job.home &&
          (clipOutfitText(pick?.workOutfit) || townJobById(town, member.job?.id)?.clothes)) ||
        "";
    }
    return cast;
  }
  function refillActivityLines(lifeId, activityId) {
    if (!(!pretell || !runtime.languageModels || focusLifeId !== lifeId)) {
      loadLife(lifeId)
        .then(async (life) =>
          activityLinesNeedRefill(await loadLinesBank(languageOf(life)), life, activityId)
            ? writeActivityLines(life, placeForActivityId(activityId), [activityId])
            : null,
        )
        .catch((err) => serviceLogger?.warn?.(`[${ID}] more lines for ${activityId}: ${err.message}`));
    }
  }
  let moduleContext = {
    host: engineClient,
    runtime: runtime,
    game: gameModuleApi,
    save: lifeSaveExports,
    log: serviceLogger,
    httpError: httpError,
    readLife: loadLife,
    withLife: withLife,
    modelFor: modelFor,
    onScreen: (lifeId) => focusLifeId === lifeId,
  };
  async function runModuleBackgrounds(lifeId) {
    if (!(!pretell || !runtime.languageModels || focusLifeId !== lifeId)) {
      try {
        let life = await loadLife(lifeId);
        for (let mod of activeModules(life)) {
          await mod
            .background?.(moduleContext, life)
            ?.catch?.((err) => serviceLogger?.warn?.(`[${ID}] ${mod.id}: ${err.message}`));
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] modules: ${err.message}`);
      }
    }
  }
  function registerRoutes(router) {
    let route = (handler) => async (req, reply) => {
      let socket = req.raw?.socket ?? req.socket;
      if (engineClient.seeRequest) {
        engineClient.seeRequest({
          port: socket?.localPort,
          address: socket?.localAddress,
          encrypted: !!socket?.encrypted,
          host: req.headers?.host,
        });
      } else {
        engineClient.seePort?.(socket?.localPort);
      }
      try {
        return await handler(req, reply);
      } catch (err) {
        let code = err.statusCode ?? 500;
        if (code >= 500) {
          serviceLogger?.warn?.(`[${ID}] ${req.url ?? ""}: ${err.message}`);
        }
        reply?.code?.(code);
        return {
          error: err.said ?? err.message,
          ...(err.model
            ? {
                model: true,
              }
            : {}),
        };
      }
    };
    router.get(
      "/health",
      route(async () => ({
        id: ID,
        version: VERSION,
        ready: true,
        core: {
          places: TOWN_PLACES.length,
          archetypes: ARCHETYPE_IDS.length,
          skills: SKILL_NAMES,
          positions: OFFICE_POSITIONS.map((position) => position.name),
        },
      })),
    );
    router.get(
      "/resources",
      route(async () => {
        let resources = await engineClient.resources(),
          [imageConnections, styleProfiles, lorebooks] = await Promise.all([
            engineClient.imageConnections?.().catch(() => []) ?? [],
            engineClient.styleProfiles?.().catch(() => ({
              defaultId: "",
              profiles: [],
            })) ?? {
              defaultId: "",
              profiles: [],
            },
            listWorldLorebooks(runtime),
          ]);
        return {
          ...resources,
          lorebooks: lorebooks,
          imageConnections: imageConnections,
          styleProfiles: styleProfiles.profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            promptMode: profile.promptMode,
          })),
          defaultStyleProfile: styleProfiles.defaultId,
          archetypes: ARCHETYPE_IDS.map((archetypeId) => ({
            id: archetypeId,
            name: ARCHETYPES[archetypeId].name,
          })),
          traits: traitsCatalog(),
          efforts: REASONING_EFFORT_LEVELS,
          languages: SUPPORTED_LANGUAGES,
          knows: Object.entries(STARTING_RELATIONS).map(([id, relation]) => ({
            id: id,
            label: relation.label,
          })),
          kin: Object.entries(KIN_LABELS).map(([id, label]) => ({
            id: id,
            label: label,
          })),
          giftTags: GIFT_TAGS,
          jobs: townJobs(
            buildTown({
              modules: allModules().map((mod) => mod.id),
            }),
          ).map((job) => ({
            id: job.id,
            place: job.place,
            placeName: job.placeName,
            title: job.title,
            shift: job.shift,
            clothes: job.clothes,
            ...(TOWN_PLACES.find((place) => place.id === job.place)?.module
              ? {
                  module: TOWN_PLACES.find((place) => place.id === job.place).module,
                }
              : {}),
          })),
          templates: ROUTINE_TEMPLATES.map((template) => ({
            id: template.id,
            name: template.name,
            why: template.why,
          })),
          places: TOWN_PLACES.filter((place) => !place.inside).map((place) => ({
            id: place.id,
            name: place.name,
            locked: !!place.locked,
            residence: !!place.residence,
            ...(place.module
              ? {
                  module: place.module,
                }
              : {}),
          })),
          districts: TOWN_DISTRICTS.map((district) => ({
            id: district.id,
            name: district.name,
            places: [...district.places],
          })),
          modules: moduleCatalog().map(({ id: id, name: moduleName, about: about, options: options }) => ({
            id: id,
            name: moduleName,
            about: about,
            options: options ?? [],
          })),
          weekPlaces: [
            ...everydayPlaces(buildTown()).map((place) => ({
              id: place.id,
              name: place.name,
              inside: place.inside ?? null,
            })),
            {
              id: WORK_FROM_HOME_PLACE,
              name: "Working \xB7 home",
              inside: null,
            },
          ],
          maxCast: MAX_CAST,
          skills: SKILL_NAMES,
        };
      }),
    );
    router.post(
      "/read-card",
      route(async (req) => {
        let {
            cardId: cardId,
            connection = null,
            effort = "low",
            sampling = {},
            language = DEFAULT_LANGUAGE,
            off = [],
            renamed = {},
            townName = "",
            scenario = "",
            loreBookId = "",
            others = [],
            couples = false,
            taken = [],
            modules = null,
          } = req.body ?? {},
          moduleFields = moduleCardFields({
            modules: modules && typeof modules == "object" ? modules : {},
          }),
          otherPeople = (Array.isArray(others) ? others : [])
            .slice(0, 40)
            .map((other) => ({
              id: String(other?.id ?? ""),
              name: String(other?.name ?? "").slice(0, 80),
            }))
            .filter((other) => other.id && other.name),
          card = await engineClient.card(cardId).catch(() => null);
        if (!card) {
          throw httpError(400, "That character card could not be read.");
        }
        let moduleHolder = {
            modules: modules && typeof modules == "object" ? modules : {},
          },
          town = buildTown({
            off: Array.isArray(off) ? off : [],
            renamed: renamed,
            modules: activeModuleIds(moduleHolder),
            hidden: hiddenModulePlaces(moduleHolder, TOWN_PLACES),
          }),
          places = everydayPlaces(town),
          freeJobs = openTownJobs(town, [], {
            taken: Array.isArray(taken) ? taken.map(String) : [],
          }),
          model = createModelClient({
            runtime: runtime,
            settings: {
              connection: connection,
              effort: effort,
              sampling: normalizeSampling(sampling).sampling,
            },
            onCall: callRecorder(null, "creating"),
          });
        try {
          let proposal = await readCharacterCard(model, card, {
            places: places,
            language: normalizeLanguageName(language),
            setting: settingNoteFor({
              townName: townName,
              scenario: scenario,
              worldLore: await loadWorldLore(runtime, loreBookId),
            }),
            others: otherPeople,
            couples: couples === true,
            jobs: freeJobs,
            fields: moduleFields,
          });
          return {
            cardId: card.id,
            name: card.name,
            proposal: {
              ...proposal,
              grid: proposal.week ? spansToGrid(proposal.week) : null,
            },
          };
        } catch (err) {
          serviceLogger?.warn?.(`[${ID}] read-card ${card.id}: ${err.message}`);
          throw httpError(502, `The model could not read ${card.name}: ${err.message}`);
        }
      }),
    );
    router.post(
      "/week/template",
      route(async (req) => {
        let { template = "default", index = 0, off = [] } = req.body ?? {};
        if (!ROUTINE_TEMPLATE_IDS.includes(template)) {
          throw httpError(400, "There is no ready-made week by that name.");
        }
        let town = buildTown({
            off: Array.isArray(off) ? off : [],
          }),
          placeIds = everydayPlaces(town).map((place) => place.id),
          week = buildRoutineWeek(template, Math.max(0, Math.min(23, Number(index) || 0)), {
            places: placeIds,
            stores: storesInside(town),
          });
        return {
          template: template,
          grid: spansToGrid(week),
        };
      }),
    );
    router.get(
      "/lives",
      route(async () => ({
        lives: await listLives(),
      })),
    );
    router.post(
      "/title",
      route(
        async () => (
          (focusLifeId = null),
          {
            title: true,
          }
        ),
      ),
    );
    router.get(
      "/changelog",
      route(async () => ({
        changelog: attachModuleReleaseNotes(
          RELEASE_NOTES,
          allModules().map((mod) => ({
            id: mod.id,
            name: mod.catalog.name,
            notes: mod.changelog,
          })),
        ),
      })),
    );
    router.get(
      "/guide",
      route(async (req) => {
        let lifeParam = req.query?.life,
          life = lifeParam ? await loadLife(String(lifeParam)).catch(() => null) : null;
        return buildGuide(life ? collectModuleHook(life, "guide") : []);
      }),
    );
    router.get(
      "/welcome",
      route(async () => ({
        welcome: welcomeNoticeUnlessSeen((await findSingletonDoc(welcomeDocKind))?.data?.accepted ?? ""),
      })),
    );
    router.post(
      "/welcome",
      route(async (req) => {
        if (req.body?.id !== WELCOME_NOTICE.id) {
          throw httpError(400, "That welcome is not the current one. Reload the page.");
        }
        await updateSingleton(
          welcomeDocKind,
          () => ({
            accepted: "",
          }),
          (notice) => {
            notice.accepted = WELCOME_NOTICE.id;
            notice.at = now();
          },
        );
        return {
          welcome: null,
        };
      }),
    );
    router.post(
      "/lives",
      route(async (req) => {
        if ((await listLives()).length >= MAX_LIVES) {
          throw httpError(409, `You already have ${MAX_LIVES} lives, the most you can keep. Delete one to make room.`);
        }
        let body = req.body ?? {};
        if (!String(body.name ?? "").trim()) {
          throw httpError(400, "A life needs a name.");
        }
        let persona = body.persona ?? null;
        if (body.personaId && ((persona = await engineClient.persona(body.personaId).catch(() => null)), !persona)) {
          throw httpError(400, "That persona could not be read.");
        }
        let samplingProblem = normalizeSampling(body.settings?.sampling ?? {}).reason;
        if (samplingProblem) {
          throw httpError(400, samplingProblem);
        }
        let castPicks = Array.isArray(body.cast) ? body.cast : [];
        if (castPicks.length > MAX_CAST) {
          throw httpError(400, `A life can have at most ${MAX_CAST} people in its cast.`);
        }
        let moduleHolder = {
            modules: body.modules && typeof body.modules == "object" ? body.modules : {},
          },
          town = buildTown({
            off: body.townOptions?.off ?? [],
            modules: activeModuleIds(moduleHolder),
            hidden: hiddenModulePlaces(moduleHolder, TOWN_PLACES),
          }),
          builtCast = await buildCast(
            castPicks,
            everydayPlaces(town).map((place) => place.id),
            {
              stores: storesInside(town),
              town: town,
            },
          ),
          characters = castPicks.length ? builtCast : Array.isArray(body.characters) ? body.characters : [],
          housemates = [
            ...(Array.isArray(body.housemates) ? body.housemates : []),
            ...(body.home === "shared" && body.roommate ? [body.roommate] : []),
          ].filter((id) => typeof id == "string" && characters.some((character) => character.id === id)),
          { id: droppedId, ...lifeFields } = body,
          startingSkills = validateStartingSkills(body.startingSkills);
        if (startingSkills === false) {
          throw httpError(
            400,
            `You have ${STARTING_SKILL_POINTS} points to share among your skills, at most ${STARTING_SKILL_MAX} in one.`,
          );
        }
        let life = createLife(
          {
            ...lifeFields,
            startingSkills: startingSkills,
            name: String(body.name).trim().slice(0, 60),
            seed: String(body.seed ?? "").slice(0, 60) || undefined,
            rules: cleanRulesIn(body.rules),
            persona: (body.personaId ? persona : sanitizeCharacterCardSnapshot(persona)) ?? undefined,
            characters: characters.slice(0, MAX_CAST),
            housemates: housemates,
            roommate: null,
          },
          {
            now: now(),
          },
        );
        life.worldLore = await loadWorldLore(runtime, body.loreBookId);
        life.look = cleanTownLook(body.look ?? {});
        life.frame = normalizeSpriteFrame(body.frame);
        life.pictureSize = backgroundSizeOr(body.size);
        life.portraitSize = portraitSizeOr(body.portraitSize);
        if (life.rules.keyImages && !imageChoice(life).connectionId) {
          life.rules.keyImages = false;
        }
        applyCreationModules(life, body.modules);
        if (life.modules) {
          migrateModules(migrateLife(life));
        }
        runModuleHook(life, "castRead", castPicks);
        let dropped = [];
        dropRefusedJobs(
          life,
          life.characters.map((character) => character.id),
          dropped,
        );
        let backgroundKeys = backgroundKeysOf(life),
          backgrounds = life.look.connectionId
            ? pickLatestBackgrounds(await loadGallery(), life.look, backgroundKeys)
            : [];
        await saveLife(life);
        if ((await findSingletonDoc(creationDraftDocKind))?.data?.draft) {
          await updateSingleton(
            creationDraftDocKind,
            () => ({
              draft: null,
            }),
            (notice) => {
              notice.draft = null;
              notice.at = now();
            },
          );
        }
        focusLifeId = life.id;
        if (backgrounds.length && life.look.connectionId) {
          await queueBackgrounds(life, backgrounds);
        }
        await queueWorkSprites(life);
        writeActivityLinesAhead(life.id);
        runModuleBackgrounds(life.id);
        return {
          created: lifeSummary(life),
          life: viewOfLife(life),
          dropped: dropped,
        };
      }),
    );
    let callsView = (entries) => {
      let newestFirst = entries.slice().reverse(),
        sumOf = (field) => newestFirst.reduce((sum, entry) => sum + (entry[field] ?? 0), 0);
      return {
        calls: newestFirst.map(({ in: sentMessages, out: wrote, ...rest }) => ({
          ...rest,
          messages: sentMessages.length,
          wrote: wrote.length,
        })),
        totals: {
          calls: newestFirst.length,
          sent: sumOf("sent"),
          received: sumOf("received"),
          cached: sumOf("cached"),
          failed: newestFirst.filter((call) => call.outcome !== "ok").length,
          unreported: newestFirst.filter((call) => call.outcome === "ok" && call.sent === null).length,
        },
        kept: callsKept,
      };
    };
    router.get(
      "/calls",
      route(async () => callsView((await loadCallRecords()).map((entry) => entry.record))),
    );
    router.get(
      "/lives/:id/calls",
      route(async (req) =>
        callsView(
          (await loadCallRecords()).map((entry) => entry.record).filter((entry) => entry.lifeId === req.params.id),
        ),
      ),
    );
    router.get(
      "/calls/:call",
      route(async (req) => {
        let entry = (await loadCallRecords()).find((entry2) => entry2.record.id === req.params.call);
        if (!entry) {
          throw httpError(404, "That call is no longer kept.");
        }
        return {
          call: entry.record,
        };
      }),
    );
    async function lifeReply(life, { write = false } = {}) {
      await loadGallery();
      await loadPaintJobs();
      await writeCallWords(life, {
        write: write,
      });
      return {
        life: viewOfLife(life),
        summary: lifeSummary(life),
      };
    }
    router.get(
      "/lives/:id",
      route(async (req) => lifeReply(await loadLife(req.params.id))),
    );
    router.post(
      "/lives/:id/open",
      route(async (req) => {
        let timed = async (label, work) => {
            let started = Date.now();
            try {
              return await work;
            } finally {
              if (Date.now() - started > 3e3) {
                serviceLogger?.warn?.(
                  `[${ID}] opening a life: ${label} took ${Math.round((Date.now() - started) / 1e3)} s`,
                );
              }
            }
          },
          life = await timed("reading it", loadLife(req.params.id));
        focusLifeId = life.id;
        runPaintQueue();
        let pictures2 = await timed("looking for new card pictures", changedAvatars(life));
        if (
          (pictures2.length &&
            (life = (
              await timed(
                "waiting for the life to take them",
                withLife(life.id, (draft) => applyAvatarChanges(draft, pictures2)),
              )
            ).life),
          writeActivityLinesAhead(life.id),
          writeNewArrivals(life.id),
          readTastes(life.id),
          readOrientations(life.id),
          checkWeekWork(life.id),
          ensureCastFigures(life.id),
          writeSeasonOutfitsFor(life.id),
          await timed("queueing the cut-outs", queueCutouts(life)),
          life.weekDone && runTownWeek(life.id),
          counterDue(life) && refreshCounterLines(life.id),
          driftDue(life) && refreshDriftWords(life.id),
          runModuleBackgrounds(life.id),
          life.afterWedding?.now && !life.scene && !life.outing)
        ) {
          try {
            life = (
              await timed(
                "writing the morning after",
                withLife(life.id, (draft) => writeMorningAfter(draft)),
              )
            ).life;
          } catch {
            // Best effort: nothing to do when this fails.
          }
        }
        return timed(
          "answering",
          lifeReply(life, {
            write: true,
          }),
        );
      }),
    );
    router.post(
      "/lives/:id/modules",
      route(
        lifeRoute(async (life, req) => {
          let { module: moduleId, ...options } = req.body ?? {};
          if (options.on === true && !isModuleOn(life, String(moduleId ?? "")) && sceneBusyReason(life)) {
            throw httpError(400, "Finish what you're doing first, then switch it on.");
          }
          if (
            (moduleById(String(moduleId ?? ""))?.catalog.options ?? []).filter(
              (option) =>
                option.locks && options[option.key] === true && !moduleState(life, String(moduleId))?.[option.key],
            ).length &&
            sceneBusyReason(life)
          ) {
            throw httpError(400, "Finish what you're doing first, then tick it.");
          }
          let result = setModuleOptions(life, String(moduleId ?? ""), options);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          migrateModules(migrateLife(life));
          enqueue(life.id, async () => {}).then(() => {
            runModuleBackgrounds(life.id);
            runPaintQueue();
          });
          return {
            modules: modulesView(life),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/modules/:module/character",
      route(
        lifeRoute(async (life, req) => {
          let mod = moduleById(req.params.module);
          if (!mod?.setCharacter || !isModuleOn(life, mod.id)) {
            throw httpError(400, "That module is not on in this life.");
          }
          let { character: characterId, key: key, value: value } = req.body ?? {},
            result = mod.setCharacter(
              life,
              moduleState(life, mod.id),
              String(characterId ?? ""),
              String(key ?? ""),
              value,
            );
          if (!result?.ok) {
            throw httpError(400, result?.reason ?? "Nothing changed.");
          }
          return {
            sheet: characterSheet2(life, String(characterId ?? "")),
          };
        }),
      ),
    );
    for (let mod of allModules()) {
      for (let [routeKey, routeHandler] of Object.entries(mod.routes?.(moduleContext) ?? {})) {
        let [verb, path] = routeKey.split(" ");
        router[verb.toLowerCase()](
          `/lives/:id/mod/${mod.id}/${path}`,
          route(
            lifeRoute(async (life, req) => {
              if (!isModuleOn(life, mod.id)) {
                throw httpError(400, "That module is not on in this life.");
              }
              return routeHandler(life, moduleState(life, mod.id), req);
            }),
          ),
        );
      }
    }
    router.patch(
      "/lives/:id",
      route(async (req) => {
        let { life: life } = await withLife(req.params.id, (draft) => {
          let result = renameLife(draft, req.body?.name, {
            now: now(),
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
        });
        return {
          summary: lifeSummary(life),
        };
      }),
    );
    router.get(
      "/creation/draft",
      route(async () => {
        let saved = (await findSingletonDoc(creationDraftDocKind))?.data ?? {};
        return {
          draft: saved.draft ?? null,
          at: saved.at ?? null,
        };
      }),
    );
    router.post(
      "/creation/draft",
      route(async (req) => {
        let draft = req.body?.draft === null ? null : sanitizeSetupPreset(req.body?.draft);
        if (req.body?.draft !== null && !draft) {
          throw httpError(400, "That setup is too big to keep.");
        }
        await updateSingleton(
          creationDraftDocKind,
          () => ({
            draft: null,
          }),
          (doc) => {
            doc.draft = draft;
            doc.at = now();
          },
        );
        return {
          saved: true,
        };
      }),
    );
    let listPresets = async () =>
        (await documents.list(ID, creationPresetDocKind)).sort(
          (left, right) => (right.data?.at ?? 0) - (left.data?.at ?? 0),
        ),
      presetsView = async () => ({
        presets: (await listPresets()).map((doc) =>
          summarizeSetupPreset({
            id: doc.id,
            ...doc.data,
          }),
        ),
      });
    router.get("/creation/presets", route(presetsView));
    router.post(
      "/creation/presets",
      route(async (req) => {
        let presetName = normalizePresetName(req.body?.name);
        if (!presetName) {
          throw httpError(400, "Give it a name first.");
        }
        let draft = sanitizeSetupPreset(req.body?.draft);
        if (!draft) {
          throw httpError(400, "That setup is too big to keep.");
        }
        let presets = await listPresets(),
          existing = presets.find(
            (preset) => String(preset.data?.name ?? "").toLowerCase() === presetName.toLowerCase(),
          );
        if (existing && !req.body?.replace) {
          return {
            taken: presetName,
          };
        }
        let record = {
          name: presetName,
          at: now(),
          setup: draft,
        };
        if (existing) {
          await documents.update({
            id: existing.id,
            packageId: ID,
            expectedRevision: existing.revision,
            name: presetName,
            description: presetName,
            data: record,
            updatedAt: new Date(now()).toISOString(),
          });
        } else {
          if (presets.length >= MAX_SETUP_PRESETS) {
            throw httpError(
              400,
              `You have ${MAX_SETUP_PRESETS} presets, the most you can keep. Delete one to make room.`,
            );
          }
          let stamp = new Date(now()).toISOString();
          await documents.create({
            id: randomUUID(),
            packageId: ID,
            kind: creationPresetDocKind,
            name: presetName,
            description: presetName,
            data: record,
            createdAt: stamp,
            updatedAt: stamp,
          });
        }
        return {
          saved: presetName,
          ...(await presetsView()),
        };
      }),
    );
    let findPreset = async (presetId) => {
      let preset = (await listPresets()).find((doc) => doc.id === presetId);
      if (!preset) {
        throw httpError(404, "That preset is gone.");
      }
      return preset;
    };
    router.post(
      "/creation/presets/:id/rename",
      route(async (req) => {
        let preset = await findPreset(req.params.id),
          presetName = normalizePresetName(req.body?.name);
        if (!presetName) {
          throw httpError(400, "Give it a name first.");
        }
        if (
          (await listPresets()).some(
            (doc) => doc.id !== preset.id && String(doc.data?.name ?? "").toLowerCase() === presetName.toLowerCase(),
          )
        ) {
          throw httpError(400, `There is already a preset called \xAB${presetName}\xBB.`);
        }
        await documents.update({
          id: preset.id,
          packageId: ID,
          expectedRevision: preset.revision,
          name: presetName,
          description: presetName,
          data: {
            ...preset.data,
            name: presetName,
          },
          updatedAt: new Date(now()).toISOString(),
        });
        return presetsView();
      }),
    );
    router.post(
      "/creation/presets/:id/delete",
      route(async (req) => {
        let preset = await findPreset(req.params.id);
        await documents.remove(ID, preset.id, preset.revision);
        return presetsView();
      }),
    );
    router.get(
      "/creation/presets/:id",
      route(async (req) => {
        let preset = await findPreset(req.params.id),
          [personas, cards, connections, imageConnections] = await Promise.all([
            engineClient.personas().catch(() => null),
            engineClient.cards().catch(() => null),
            engineClient.connections().catch(() => null),
            engineClient.imageConnections?.().catch(() => null) ?? null,
          ]),
          { setup: setup, missing: missing } = reconcilePresetWithAvailable(preset.data?.setup, {
            personas: personas,
            cards: cards,
            connections: connections,
            imageConnections: imageConnections,
          });
        return {
          name: preset.data?.name ?? "",
          draft: setup,
          missing: missing,
        };
      }),
    );
    router.post(
      "/lives/:id/preset",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          setup = setupPresetFromLife(life, {
            gridOf: spansToGrid,
          });
        if (!setup) {
          throw httpError(400, "That life is too big to keep as a preset.");
        }
        let presets = await listPresets();
        if (presets.length >= MAX_SETUP_PRESETS) {
          throw httpError(
            400,
            `You have ${MAX_SETUP_PRESETS} presets, the most you can keep. Delete one to make room.`,
          );
        }
        let presetName = uniquePresetName(
            life.name,
            presets.map((doc) => String(doc.data?.name ?? "")),
          ),
          stamp = new Date(now()).toISOString();
        await documents.create({
          id: randomUUID(),
          packageId: ID,
          kind: creationPresetDocKind,
          name: presetName,
          description: presetName,
          data: {
            name: presetName,
            at: now(),
            setup: setup,
          },
          createdAt: stamp,
          updatedAt: stamp,
        });
        return {
          saved: presetName,
        };
      }),
    );
    router.post(
      "/lives/:id/duplicate",
      route(async (req) => {
        if ((await listLives()).length >= MAX_LIVES) {
          throw httpError(409, `You already have ${MAX_LIVES} lives, the most you can keep. Delete one to make room.`);
        }
        let life = await loadLife(req.params.id),
          newName =
            String(req.body?.name ?? "")
              .trim()
              .slice(0, 60) || null,
          copy = duplicateLife(life, {
            now: now(),
            name: newName,
          });
        await saveLife(copy);
        return {
          created: lifeSummary(copy),
        };
      }),
    );
    router.delete(
      "/lives/:id",
      route((req) =>
        enqueue(req.params.id, async () => {
          let doc = await findLifeDoc(req.params.id);
          if (!doc) {
            throw httpError(404, "That life does not exist.");
          }
          if (req.body?.confirm !== doc.description && req.body?.confirm !== req.params.id) {
            throw httpError(400, "Type the life's name to delete it. There is no going back.");
          }
          await documents.remove(ID, doc.id, doc.revision);
          lifeDocIds.delete(req.params.id);
          deletedLives.add(req.params.id);
          return {
            deleted: req.params.id,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/go",
      route(
        lifeRoute(async (life, req) => {
          let result = goToPlace(life, req.body?.place);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          await queueBackgroundsHere(life);
          if (activeModules(life).some((mod) => mod.background)) {
            setTimeout(() => runModuleBackgrounds(life.id), 0);
          }
          return {
            moved: {
              place: result.place.id,
              minutes: result.minutes,
              open: result.open,
              path: result.path,
              from: result.from ?? null,
              by: result.by ?? "",
              picked: result.picked ?? null,
            },
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/propose/tonight",
      route(
        lifeRoute(async (life, req) => {
          let result = proposeTonight(life, String(req.body?.choice ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          await foldMemories(life, life.scene.characterId);
          return {
            tonight: result.choice,
          };
        }),
      ),
    );
    router.get(
      "/lives/:id/wedding/days",
      route(async (req) => ({
        days: weddingDays(await loadLife(req.params.id)),
      })),
    );
    router.get(
      "/lives/:id/wedding",
      route(async (req) => ({
        wedding: weddingPlanView(await loadLife(req.params.id)),
      })),
    );
    router.post(
      "/lives/:id/wedding/choose",
      route(
        lifeRoute(async (life, req) => {
          let result = weddingChoose(life, String(req.body?.what ?? ""), req.body?.id ? String(req.body.id) : null);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            wedding: weddingPlanView(life),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/wedding/invite",
      route(
        lifeRoute(async (life, req) => {
          let result = weddingInvite(life, String(req.body?.character ?? ""), req.body?.on !== false);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            wedding: weddingPlanView(life),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/wedding/send",
      route(
        lifeRoute(async (life) => {
          let result = weddingSend(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            wedding: weddingPlanView(life),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/wedding/date",
      route(
        lifeRoute(async (life, req) => {
          let result = setWeddingDay(life, req.body?.day);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            date: result.when,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/ride",
      route(
        lifeRoute(async (life, req) => {
          let result = answerRide(life, String(req.body?.answer ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (life.scene?.done) {
            rememberScene(life, life.scene);
            await foldMemories(life, life.scene.characterId);
          }
          let aside = result.answer === "no" && life.scene && !life.scene.done ? "(Says not now to the ride.)" : "";
          return {
            ride: {
              answer: result.answer,
              tags: result.tags,
              say: aside,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/ride/go",
      route(
        lifeRoute(async (life) => {
          let result = rideGo(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          await queueBackgroundsHere(life);
          return {
            moved: {
              place: result.place.id,
              minutes: result.minutes,
              open: result.open,
              path: result.path,
              from: result.from ?? null,
              by: result.by ?? "",
              with: result.with ?? null,
            },
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/vehicles/sell",
      route(
        lifeRoute(async (life, req) => {
          let result = sellVehicle(life, String(req.body?.item ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sold: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/activity",
      route(
        lifeRoute(async (life, req) => {
          let activityId = req.body?.activity,
            startMinutes = life.minutes,
            activity = activitiesHere(life).find((candidate) => candidate.id === activityId) ?? null,
            placeName =
              life.at === "home" ? "Home" : (life.town.places.find((place) => place.id === life.at)?.name ?? ""),
            skillsBefore = Object.fromEntries(
              SKILL_NAMES.map((skill) => [skill, skillLevelInfo(life.skills[skill] ?? 0)]),
            ),
            result = doActivity(life, activityId, req.body?.options ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return result.shift
            ? {
                did: activityId,
                shift: result.shift,
                events: result.events ?? [],
                lunch:
                  result.stage === "lunch" || result.shift.stage === "lunch"
                    ? {
                        from: result.from,
                        minutes: result.minutes,
                      }
                    : null,
              }
            : result.backToWork
              ? {
                  did: activityId,
                  backToWork: result.backToWork,
                  events: result.events ?? [],
                }
              : activityReply(life, activityId, result, {
                  from: startMinutes,
                  skillsBefore: skillsBefore,
                  activity: activity,
                  placeName: placeName,
                });
        }),
      ),
    );
    router.post(
      "/lives/:id/shift/lunch",
      route(
        lifeRoute(async (life, req) => {
          let result = startLunch(life, {
            choices: req.body?.choices ?? {},
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            shift: result.shift,
            lunch: {
              from: result.from,
              minutes: result.minutes,
              ...(result.over
                ? {
                    over: true,
                  }
                : {}),
            },
            events: result.events ?? [],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/shift",
      route(
        lifeRoute(async (life, req) => {
          let startMinutes = life.minutes,
            activity = activitiesHere(life).find((candidate) => candidate.job) ?? {
              id: "shift",
              name: "Work your shift",
            },
            placeName = life.town.places.find((place) => place.id === life.at)?.name ?? "",
            skillsBefore = Object.fromEntries(
              SKILL_NAMES.map((skill) => [skill, skillLevelInfo(life.skills[skill] ?? 0)]),
            );
          if (!life.shiftNow) {
            throw httpError(400, "There is no shift under way.");
          }
          let result = finishShift(life, {
            choices: req.body?.choices ?? {},
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return activityReply(life, activity.id, result, {
            from: result.from ?? startMinutes,
            skillsBefore: skillsBefore,
            activity: {
              ...activity,
              name: "Work your shift",
            },
            placeName: placeName,
          });
        }),
      ),
    );
    async function activityReply(
      life,
      activityId,
      result,
      { from: from, skillsBefore: skillsBefore, activity: activity, placeName: placeName },
    ) {
      let fainted = (result.events ?? []).some((ev) => ev.id === "fainted"),
        needs = hudView(life).needs,
        worn = !result.slept && (needs.energyLow || needs.hungerLow),
        line =
          fainted || result.speaker
            ? null
            : drawActivityLine(await loadLinesBank(languageOf(life)), life, activityId, worn);
      if (line) {
        setTimeout(() => refillActivityLines(life.id, activityId), 0);
      }
      let skills = skillChanges(life, skillsBefore);
      return {
        did: activityId,
        result: {
          minutes: result.minutes,
          from: from,
          gains: result.gains ?? null,
          pay: result.pay ?? null,
          review: result.review ?? null,
          performance: result.performance ?? null,
          performanceDelta: result.delta ?? null,
          levelled: (result.levelled ?? []).map((level) => ({
            ...level,
            opens: SKILL_PERKS2[level.skill]?.at?.[level.to] ?? SKILL_PERKS2[level.skill]?.every ?? "",
          })),
          skills: skills,
          worn: worn,
          slept: !!result.slept,
          activity: {
            id: activityId,
            name: activity?.name ?? activityId,
            sleep: !!activity?.sleep,
            place: placeName,
          },
          line: line,
          writing: !fainted && !line,
          speaker: result.speaker ?? null,
          bond: result.bond ?? null,
          overtime: result.overtime ?? null,
        },
        events: result.events ?? [],
      };
    }
    router.get(
      "/lives/:id/jobs-app",
      route(async (req) => ({
        app: jobsApp(await loadLife(req.params.id)),
      })),
    );
    router.get(
      "/lives/:id/job/interview",
      route(async (req) => ({
        interview: interviewView(await loadLife(req.params.id)),
      })),
    );
    router.post(
      "/lives/:id/job/apply",
      route(
        lifeRoute(async (life, req) => {
          let result = applyJob(life, req.body?.tone);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            applied: result,
            events: result.events ?? [],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/job/overtime",
      route(
        lifeRoute(async (life) => {
          let startMinutes = life.minutes,
            result = stayLate(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            did: "overtime",
            result: {
              minutes: result.minutes,
              from: startMinutes,
              pay: result.pay,
              performance: result.performance,
              performanceDelta: 1,
              activity: {
                id: "overtime",
                name: "Stay late",
                place: life.town.places.find((place) => place.id === life.at)?.name ?? "",
              },
              line: null,
              writing: false,
            },
            events: result.events ?? [],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/job/dayoff",
      route(
        lifeRoute(async (life, req) => {
          let result = askDayOff(life, req.body?.day);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            dayOff: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/job/quit",
      route(
        lifeRoute(async (life) => {
          let result = quitJob(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            quit: true,
          };
        }),
      ),
    );
    router.post("/lives/:id/job/seen", route(lifeRoute(async (life) => seenNotice(life))));
    router.post(
      "/lives/:id/job/line",
      route(async (req) => {
        let kind = String(req.body?.kind ?? "");
        return runTalkLine(
          req.params.id,
          (life) => jobTalkFor(life, kind),
          (draft, line) => (
            jobTalkFor(draft, kind) && doneJobTalk(draft, kind),
            line ?? {
              line: null,
            }
          ),
        );
      }),
    );
    async function runTalkLine(lifeId, pickTalk, applyLine) {
      focusLifeId = lifeId;
      let life = await loadLife(lifeId),
        talk = pickTalk(life),
        said = talk
          ? await askMomentLine(life, talk, {
              keep: false,
            })
          : null,
        { result: result } = await withLife(lifeId, (draft) => {
          if (said?.kept) {
            let character = characterOf(draft, talk.characterId);
            if (character) {
              addMemory(character, said.kept);
            }
          }
          return applyLine(
            draft,
            said && {
              line: said.line,
              lineProblem: said.lineProblem,
            },
          );
        });
      return result;
    }
    router.post(
      "/lives/:id/shift/moment-line",
      route(
        lifeRoute(async (life, req) => {
          let index = Number(req.body?.index) || 0,
            talk = shiftMomentTalk(life, index);
          if (!talk) {
            return {
              shift: shiftView(life),
            };
          }
          let said = await askMomentLine(life, talk);
          setMomentLine(life, index, said.line?.text ?? "");
          return {
            shift: shiftView(life),
            lineProblem: said.lineProblem ?? "",
          };
        }),
      ),
    );
    let moduleContent = (life, characterId, withIds = []) =>
        firstModuleHook(life, "content", characterId, {
          with: [...new Set([characterId, ...(withIds ?? [])])].filter(Boolean),
        }) ?? "",
      othersPresent = (life, exceptId) => {
        let visited = life.visit ? characterOf(life, life.visit.characterId) : null,
          door = visited?.residence ? `${visited.residence.place}:${visited.residence.unit}` : "",
          housemateIds = door
            ? life.characters
                .filter(
                  (person) =>
                    !person.away && person.residence && `${person.residence.place}:${person.residence.unit}` === door,
                )
                .map((person) => person.id)
            : [];
        return [...whoIsHere(life).map((person) => person.id), ...housemateIds].filter((person) => person !== exceptId);
      };
    async function askMomentLine(life, talk, { from = "work", keep = true } = {}) {
      let character = withHomeAndWork(life, characterOf(life, talk.characterId)),
        bond = life.bonds[talk.characterId];
      if (!character || !bond) {
        return {
          line: null,
        };
      }
      let player = life.persona?.name || "the player",
        line = null,
        problem = "",
        memory = null,
        call = startCall(life.id);
      try {
        try {
          let reply = await askVisitLine(
            modelFor(life, {
              signal: call.signal,
            }),
            character,
            bond,
            {
              moment: talk.text,
              player: player,
              language: life.settings?.language ?? DEFAULT_LANGUAGE,
              tone: bondSummary(bond).archetype.tone,
              setting: settingNoteFor(life),
              ...timeAndMemories(life, character, 5),
              knows: knownForModel(life, character.id),
              content: moduleContent(life, character.id, othersPresent(life, character.id)),
            },
          );
          line = reply.line;
          let remember = normalizeRemember(reply.remember);
          if (
            (remember &&
              (memory = {
                at: life.minutes,
                text: remember,
                from: from,
              }),
            memory && keep)
          ) {
            let stored = characterOf(life, character.id);
            if (stored) {
              addMemory(stored, memory);
            }
          }
        } catch (err) {
          if (call.signal.aborted) {
            throw err;
          }
          problem = String(err.message || err);
          serviceLogger?.warn?.(`[${ID}] ${from} line for ${talk.characterId}: ${problem}`);
        }
        call.check();
      } finally {
        call.done();
      }
      return {
        line: line
          ? {
              character: character.id,
              name: character.name,
              text: line,
            }
          : null,
        lineProblem: problem,
        ...(keep
          ? {}
          : {
              kept: memory,
            }),
      };
    }
    router.post(
      "/lives/:id/activity-line",
      route(async (req) => {
        let lifeId = req.params.id,
          { activity: activityId, worn = false } = req.body ?? {},
          place = placeForActivityId(activityId);
        if (!place) {
          throw httpError(400, "That is not an activity.");
        }
        let life = await loadLife(lifeId),
          lines = await loadLinesBank(languageOf(life));
        if (!countUnusedActivityLines(lines, life.toldUsed, activityId, life.seed)) {
          try {
            await writeActivityLines(life, place, activityIdsToWriteFor(lines, activityId));
          } catch (err) {
            serviceLogger?.warn?.(`[${ID}] activity lines for ${activityId}: ${err.message}`);
            return {
              line: null,
              problem: String(err.message || err),
            };
          }
        }
        let freshLines = await loadLinesBank(languageOf(life)),
          { result: line } = await withLife(lifeId, (draft) => drawActivityLine(freshLines, draft, activityId, !!worn));
        return {
          line: line ?? null,
        };
      }),
    );
    router.post(
      "/lives/:id/interact",
      route(
        lifeRoute(async (life, req) => {
          let { character: characterId, kind: kind } = req.body ?? {};
          if (!BOND_ACTIONS[kind]) {
            throw httpError(400, "That is not something you can do with someone.");
          }
          let result = interactWith(life, characterId, kind);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let topic = quickLineTopicForKind(kind),
            quick = {
              outcome: null,
              line: null,
              problem: "",
            },
            call = startCall(life.id);
          try {
            if (topic && !result.fainted) {
              let character = characterOf(life, characterId),
                withPlaces = withHomeAndWork(life, character),
                bond = life.bonds[characterId],
                summary = bondSummary(bond);
              quick = await quickEncounterLine({
                model: modelFor(life, {
                  signal: call.signal,
                }),
                character: withPlaces,
                bond: bond,
                topic: topic,
                applied: result.applied,
                limits: result.limits ?? {},
                context: {
                  language: life.settings?.language ?? DEFAULT_LANGUAGE,
                  tone: summary.archetype.tone,
                  setting: settingNoteFor(life),
                },
              });
              character.bank = withPlaces.bank;
              if (quick.problem) {
                serviceLogger?.warn?.(`[${ID}] quick lines for ${characterId}: ${quick.problem}`);
              }
            }
            call.check();
          } finally {
            call.done();
          }
          return {
            interacted: {
              character: characterId,
              kind: kind,
              topic: topic,
              applied: result.applied,
              limits: result.limits ?? {},
              notes: result.notes,
              outcome: quick.outcome,
              line: quick.line,
              lineProblem: quick.problem,
              seenBy: namesKnown(life, result.seenBy ?? []),
              interruptBy: result.interruptBy ?? null,
              interruptFor: result.interruptFor ?? null,
            },
            bond: result.bond,
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/gift",
      route(
        lifeRoute(async (life, req) => {
          let { character: characterId, index: index } = req.body ?? {},
            result = giveGift(life, characterId, {
              index: index,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (result.fainted) {
            return {
              gave: {
                character: characterId,
                result: null,
                stamp: "",
                good: false,
                tag: null,
                gift: {
                  name: result.gift.name,
                  icon: result.gift.icon,
                },
                applied: result.applied,
                limits: {},
                line: null,
                lineProblem: "",
                seenBy: [],
              },
              bond: result.bond,
              events: result.events,
            };
          }
          let character = characterOf(life, characterId),
            bond = life.bonds[characterId],
            line = null,
            problem = "",
            call = startCall(life.id);
          try {
            try {
              let reply = await askGiftReaction(
                modelFor(life, {
                  signal: call.signal,
                }),
                withHomeAndWork(life, character),
                bond,
                {
                  gift: result.gift,
                  result: result.result,
                  player: life.persona?.name || "the player",
                  language: life.settings?.language ?? DEFAULT_LANGUAGE,
                  tone: bondSummary(bond).archetype.tone,
                  setting: settingNoteFor(life),
                  ...timeAndMemories(life, character, 5),
                  knows: knownForModel(life, character.id),
                },
              );
              line = reply.line;
              let remember = normalizeRemember(reply.remember);
              if (remember) {
                addMemory(character, {
                  at: life.minutes,
                  text: remember,
                  from: "gift",
                });
              }
            } catch (err) {
              if (call.signal.aborted) {
                throw err;
              }
              problem = String(err.message || err);
              serviceLogger?.warn?.(`[${ID}] gift reaction for ${characterId}: ${problem}`);
            }
            call.check();
          } finally {
            call.done();
          }
          return {
            gave: {
              character: characterId,
              result: result.result,
              stamp: result.stamp,
              good: result.good,
              tag: result.tag,
              gift: {
                name: result.gift.name,
                icon: result.gift.icon,
              },
              applied: result.applied,
              limits: result.limits ?? {},
              line: line,
              lineProblem: problem,
              seenBy: namesKnown(life, result.seenBy ?? []),
            },
            bond: result.bond,
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/wake",
      route(
        lifeRoute(async (life, req) => {
          let characterId = req.body?.character,
            result = wakeUp(life, characterId);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let extra = await visitMomentLine(life);
          return {
            woke: {
              character: characterId,
              outcome: result.outcome,
              name: result.name,
              applied: result.applied,
            },
            bond: result.bond,
            events: result.events,
            ...extra,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/knock",
      route(
        lifeRoute(async (life, req) => {
          let characterId = req.body?.character,
            result = knockOnDoor(life, characterId);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let extra = result.answer === "door" ? await visitMomentLine(life) : {};
          return {
            knocked: {
              character: characterId,
              answer: result.answer,
              woke: result.woke ?? null,
              applied: result.applied ?? null,
              invite: result.invite ?? null,
            },
            events: result.events,
            ...extra,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/introduce",
      route(
        lifeRoute(async (life, req) => {
          let result = askForIntroduction(life, String(req.body?.character ?? ""), String(req.body?.with ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            introduced: {
              met: result.met,
              said: result.said ?? "",
            },
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/debt/pay",
      route(
        lifeRoute(async (life, req) => {
          let result = payBackFriend(life, String(req.body?.character ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            paidBack: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/bills/pay",
      route(
        lifeRoute(async (life, req) => {
          let result = payBillOrLoan(life, String(req.body?.id ?? ""), Number(req.body?.amount));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            paid: result,
          };
        }),
      ),
    );
    let idList = (raw) =>
      (Array.isArray(raw) ? raw : String(raw ?? "").split(","))
        .map((id) => String(id).trim())
        .filter(Boolean)
        .slice(0, 8);
    router.get(
      "/lives/:id/homes",
      route(async (req) => ({
        homes: homesView(await loadLife(req.params.id), {
          stay: idList(req.query?.stay),
        }),
      })),
    );
    router.post(
      "/lives/:id/homes/move",
      route(
        lifeRoute(async (life, req) => {
          let result = moveHome(life, String(req.body?.kind ?? ""), {
            buy: req.body?.buy ?? null,
            stay: idList(req.body?.stay),
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            moved: result,
            homes: homesView(life),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/couch",
      route(
        lifeRoute(async (life, req) => {
          let result = startCouchSurfing(life, String(req.body?.character ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            couch: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/plea",
      route(
        lifeRoute(async (life, req) => {
          let plea = life.plea,
            result = answerPlea(life, String(req.body?.answer ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let hostName = plea?.host ? nameFor(life, characterOf(life, plea.characterId)) : "",
            handsOver =
              plea?.kind === "lend"
                ? `Lends ${hostName ? `${hostName} ` : ""}the $${result.paid}`
                : plea?.kind === "pay"
                  ? `Pays the $${result.paid}${hostName ? ` for ${hostName}` : ""}`
                  : hostName
                    ? `Hands ${hostName} the $${result.paid}`
                    : `Hands over the $${result.paid}`,
            aside =
              plea?.where === "scene" || plea?.where === "outing"
                ? result.answer === "pay"
                  ? `(${handsOver}${plea.what ? ` \xB7 ${plea.what}` : ""}.)`
                  : hostName
                    ? `(Says no to ${hostName} about the money.)`
                    : "(Says no to the money.)"
                : "";
          return {
            plea: {
              answer: result.answer,
              paid: result.paid ?? 0,
              tags: result.tags,
              say: aside,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/plea/undo",
      route(
        lifeRoute(async (life) => {
          let result = undoPlea(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (life.scene?.did) {
            life.scene.did.tags = life.scene.did.tags.filter((tag) => !tag.plea);
          }
          return {
            undone: true,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/suits",
      route(
        lifeRoute(async (life, req) => {
          let result = askSuits(life, String(req.body?.character ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            suits: {
              style: result.style,
              section: result.section,
              minutes: result.minutes,
            },
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/lent/ask",
      route(
        lifeRoute(async (life, req) => {
          let result = askBack(life, String(req.body?.character ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            back: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/key",
      route(
        lifeRoute(async (life, req) => {
          let result = useFriendKey(life, String(req.body?.character ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          await queueBackgroundsHere(life);
          return {
            inside: true,
            events: result.events ?? [],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/visit",
      route(
        lifeRoute(async (life, req) => {
          let result = req.body?.action === "in" ? enterVisit(life) : leaveVisit(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (req.body?.action === "in") {
            await queueBackgroundsHere(life);
          }
          return {
            visit: visitView(life),
            goodbye: result.goodbye ?? null,
            events: result.events ?? [],
          };
        }),
      ),
    );
    let skillChanges = (life, before) => {
        let changes = {};
        for (let skill of SKILL_NAMES) {
          let now2 = skillLevelInfo(life.skills[skill] ?? 0);
          if (!(now2.level === before[skill].level && now2.progress === before[skill].progress)) {
            changes[skill] = {
              from: {
                level: before[skill].level,
                progress: before[skill].progress,
              },
              to: {
                level: now2.level,
                progress: now2.progress,
              },
            };
          }
        }
        return changes;
      },
      skillSnapshot = (life) =>
        Object.fromEntries(SKILL_NAMES.map((skill) => [skill, skillLevelInfo(life.skills[skill] ?? 0)]));
    router.post(
      "/lives/:id/together",
      route(
        lifeRoute(async (life, req) => {
          let { character: characterId, key: key, recipe = null } = req.body ?? {},
            skillsBefore = skillSnapshot(life),
            characterName = characterOf(life, characterId)?.name ?? "",
            result = doTogether(life, characterId, key, {
              recipe: recipe,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let fainted = (result.events ?? []).some((ev) => ev.id === "fainted");
          return {
            did: `together-${key}`,
            result: {
              minutes: result.minutes,
              from: result.from,
              gains: result.gains ?? null,
              skills: skillChanges(life, skillsBefore),
              levelled: (result.levelled ?? []).map((level) => ({
                ...level,
                opens: SKILL_PERKS2[level.skill]?.at?.[level.to] ?? SKILL_PERKS2[level.skill]?.every ?? "",
              })),
              activity: {
                id: `together-${key}`,
                name: result.item.name,
                place: `With ${characterName}`,
              },
              bond: result.applied,
              with: {
                character: characterId,
                name: characterName,
              },
              ...(result.dish
                ? {
                    dish: result.dish,
                  }
                : {}),
              line: null,
              writing: !fainted && !result.cut,
            },
            events: result.events ?? [],
          };
        }),
      ),
    );
    let sleepReply = (life, characterId = null) => {
      let result = sleepChoice(life, {
        characterId: characterId,
      });
      if (!result.ok) {
        throw httpError(400, result.reason);
      }
      let { ok: ok, ...choice } = result;
      return {
        sleep: choice,
      };
    };
    router.get(
      "/lives/:id/sleep",
      route(async (req) => sleepReply(await loadLife(req.params.id))),
    );
    router.get(
      "/lives/:id/sleep/:character",
      route(async (req) => sleepReply(await loadLife(req.params.id), req.params.character)),
    );
    router.post(
      "/lives/:id/stay",
      route(
        lifeRoute(async (life, req) => {
          let characterId = req.body?.character,
            characterName = characterOf(life, characterId)?.name ?? "",
            result = stayNight(life, characterId, {
              minutes: req.body?.minutes ?? null,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            did: "stay",
            result: {
              minutes: result.minutes,
              from: result.from,
              skills: {},
              levelled: [],
              slept: true,
              activity: {
                id: "stay",
                name: "Stayed the night",
                sleep: true,
                place: result.place ?? `At ${characterName}'s`,
              },
              bond: result.applied,
              with: {
                character: characterId,
                name: characterName,
              },
              line: null,
              writing: true,
            },
            events: result.events ?? [],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/moment-line",
      route(async (req) => {
        let moment = null;
        return runTalkLine(
          req.params.id,
          (life) => {
            moment = life.moment;
            let character = moment && characterOf(life, moment.characterId);
            return !character || !life.bonds[moment.characterId]
              ? null
              : {
                  characterId: moment.characterId,
                  text: describeVisitMoment(moment, {
                    name: character.name,
                    player: life.persona?.name || "the player",
                    time: formatClockTime(moment.at),
                  }),
                };
          },
          (draft, said) => {
            let current = draft.moment;
            if (
              moment &&
              current &&
              current.characterId === moment.characterId &&
              current.kind === moment.kind &&
              current.at === moment.at
            ) {
              draft.moment = null;
            }
            return {
              line: said?.line
                ? {
                    character: moment.characterId,
                    kind: moment.kind,
                    text: said.line.text,
                  }
                : null,
              lineProblem: said?.lineProblem ?? "",
            };
          },
        );
      }),
    );
    async function visitMomentLine(life) {
      let moment = life.moment;
      if (!moment) {
        return {
          line: null,
        };
      }
      let character = characterOf(life, moment.characterId);
      if (!character || !life.bonds[moment.characterId]) {
        life.moment = null;
        return {
          line: null,
        };
      }
      let player = life.persona?.name || "the player",
        said = await askMomentLine(
          life,
          {
            characterId: moment.characterId,
            text: describeVisitMoment(moment, {
              name: character.name,
              player: player,
              time: formatClockTime(moment.at),
            }),
          },
          {
            from: "visit",
          },
        );
      life.moment = null;
      return {
        line: said.line
          ? {
              character: moment.characterId,
              kind: moment.kind,
              text: said.line.text,
            }
          : null,
        lineProblem: said.lineProblem ?? "",
      };
    }
    router.get(
      "/lives/:id/calendar/:offset",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        return {
          calendar: calendarView(life, Number(req.params.offset) || 0),
        };
      }),
    );
    router.get(
      "/lives/:id/news",
      route(async (req) => ({
        news: newsOf(await loadLife(req.params.id)),
      })),
    );
    router.get(
      "/lives/:id/chart",
      route(async (req) => ({
        chart: relationChart(await loadLife(req.params.id)),
      })),
    );
    router.post(
      "/lives/:id/guest/bye",
      route(
        lifeRoute(async (life) => {
          let result = seeGuestOut(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            goodbye: result.goodbye,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/party/info",
      route(
        lifeRoute(async (life, req) => {
          let birthday = req.body?.birthday;
          return {
            party: partyInfo(life, {
              birthday: birthday === true || birthday === false ? birthday : null,
            }),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/party/plan",
      route(
        lifeRoute(async (life, req) => {
          let result = planParty(life, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            answers: result.answers,
            planned: result.party,
            paid: result.paid ?? 0,
          };
        }),
      ),
    );
    async function writePartyMoment(life, { noLines = false } = {}) {
      let moment = life.party?.moment;
      if (!moment || moment.lines) {
        return null;
      }
      if (noLines) {
        moment.lines = [];
        return moment;
      }
      let character = moment.with ? withHomeAndWork(life, dressed(life, characterOf(life, moment.with))) : null,
        castInfo = {
          characterId: moment.cast?.[0] ?? moment.with ?? "",
          cast: moment.cast ?? (moment.with ? [moment.with] : []),
        },
        pair = (moment.pair ?? [])
          .map((id) => characterOf(life, id))
          .filter(Boolean)
          .map((person) => ({
            id: person.id,
            name: person.name,
            description: person.description ?? "",
          })),
        around = [...(moment.everyone ? castInfo.cast : []), ...partyGuestsAround(life, castInfo)]
          .map((id) => characterOf(life, id))
          .filter(Boolean)
          .map((person) => ({
            id: person.id,
            name: person.name,
          })),
        bond = moment.with && life.bonds[moment.with] ? bondSummary(life.bonds[moment.with]) : null,
        prompt = buildPartyMomentPrompt({
          character: character,
          pair: pair,
          around: around.slice(0, 8),
          everyone: moment.everyone,
          words: moment.words,
          lands: moment.lands ?? "",
          met: moment.met,
          party: partySceneLine(life, castInfo),
          time: formatDateTime(life.minutes),
          player: (moment.with && describePersonaAsSeen(life, moment.with)) || life.persona?.name || "the player",
          language: life.settings?.language ?? DEFAULT_LANGUAGE,
          setting: settingNoteFor(life),
          tone: bond?.archetype.tone ?? "",
          bond: bond
            ? {
                friendship: bond.friendship.name,
                romance: bond.romance.name,
                trust: bond.trust.name,
                what: standingWords(life, moment.with),
              }
            : null,
          memories: character ? memoriesForPrompt(life, character, 4) : [],
          content: moment.with
            ? moduleContent(life, moment.with, [
                ...castInfo.cast,
                ...pair.map((person) => person.id),
                ...around.map((person) => person.id),
              ])
            : "",
        }),
        reply = await askModel(life.id, "They could not write it", (signal) =>
          askSceneJson(life, prompt, "party-moment", character?.name ?? "the party", signal, 700),
        );
      moment.lines = parsePartyMomentLines(reply, [
        ...(moment.with ? [moment.with] : []),
        ...pair.map((person) => person.id),
        ...around.map((person) => person.id),
      ]);
      moment.suggestions = parseSuggestionList(reply?.suggestions);
      return moment;
    }
    async function partyMomentScene(life, result, { noLines = false } = {}) {
      return (result.events ?? []).some((ev) => ev.id === "fainted") || !life.party?.moment
        ? {}
        : (await writePartyMoment(life, {
            noLines: noLines,
          }),
          buildPartyMomentScene(life),
          {
            scene: {
              started: "moment",
            },
          });
    }
    router.post(
      "/lives/:id/party/remember",
      route(async (req) => {
        let lifeId = req.params.id;
        focusLifeId = lifeId;
        let life = await loadLife(lifeId),
          memo = life.partyMemo;
        if (!memo?.pending) {
          return {
            remember: (await withLife(lifeId, (draft) => keepPartyMemories(draft, null))).result,
          };
        }
        let memories = null,
          call = startCall(lifeId);
        try {
          let people = memo.ids.map((id) => characterOf(life, id)).filter(Boolean),
            prompt = buildPartyMemoryPrompt({
              people: people.map((person) => ({
                id: person.id,
                name: person.name,
                description: person.description ?? "",
                host: person.id === memo.host,
                what: standingWords(life, person.id),
                moments: memo.log.filter((entry) => entry.with === person.id).map((entry) => entry.text),
              })),
              whose: memo.whose,
              how: memo.how,
              log: memo.log.map((entry) => entry.text),
              fainted: memo.fainted,
              player: life.persona?.name || "the player",
              language: life.settings?.language ?? DEFAULT_LANGUAGE,
              setting: settingNoteFor(life),
            }),
            reply = await askSceneJson(life, prompt, "party-memory", "the party", call.signal, 1200);
          memories = parsePartyMemories(reply, memo.ids);
        } catch (err) {
          serviceLogger?.warn?.(`[${ID}] the party's memory: ${err.message}`);
        } finally {
          call.done();
        }
        let { result: result } = await withLife(lifeId, (draft) => keepPartyMemories(draft, memories));
        return {
          remember: result,
        };
      }),
    );
    router.post(
      "/lives/:id/party/:step",
      route(
        lifeRoute(async (life, req) => {
          let body = req.body ?? {},
            step = req.params.step;
          if (step === "do") {
            let result2 = doPartyAct(life, body.key, {
              with: body.with ?? null,
              also: Array.isArray(body.also) ? body.also : [],
            });
            if (!result2.ok) {
              throw httpError(400, result2.reason);
            }
            if (result2.scene) {
              let scene = result2.scene,
                started = await startScene(life, scene.characterId, "milestone", {
                  milestone: scene.milestone,
                  how: scene.how ?? "party",
                  with: scene.with?.length ? scene.with : null,
                  about: scene.about ?? null,
                });
              return {
                did: result2.name,
                scene: started,
                events: started.events ?? [],
              };
            }
            let sceneReply = await partyMomentScene(life, result2, {
              noLines: body.noLines === true,
            });
            return {
              did: result2.name,
              minutes: result2.minutes ?? 0,
              ...sceneReply,
              events: result2.events ?? [],
            };
          }
          if (step === "bring" || step === "introduce") {
            let result2 =
              step === "bring" ? bringPartyGuestOver(life, body.character) : introducePartyGuests(life, body.a, body.b);
            if (!result2.ok) {
              throw httpError(400, result2.reason);
            }
            let sceneReply = await partyMomentScene(life, result2, {
              noLines: body.noLines === true,
            });
            return {
              did: result2.name,
              minutes: result2.minutes ?? 0,
              ...sceneReply,
              events: result2.events ?? [],
            };
          }
          let result =
            step === "start"
              ? startParty(life)
              : step === "join"
                ? joinTheirParty(life, body.party)
                : step === "letin"
                  ? letPartyGuestsIn(life)
                  : step === "wait"
                    ? waitForNextPartyGuest(life)
                    : step === "go"
                      ? moveToPartyRoom(life, body.room)
                      : step === "bring"
                        ? bringPartyGuestOver(life, body.character)
                        : step === "introduce"
                          ? introducePartyGuests(life, body.a, body.b)
                          : step === "end"
                            ? endOwnParty(life)
                            : step === "seen"
                              ? dismissPartyOver(life)
                              : step === "neighbour"
                                ? answerNeighbourComplaint(life, body.answer)
                                : step === "cancel"
                                  ? cancelOwnParty(life)
                                  : step === "wait-theirs"
                                    ? waitForTheirParty(life, body.party)
                                    : {
                                        ok: false,
                                        reason: "There is no such thing to do at a party.",
                                      };
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            did: result.name ?? step,
            minutes: result.minutes ?? 0,
            said: result.said ?? "",
            presents: result.presents ?? [],
            arrived: result.arrived ?? null,
            events: [...(result.events ?? []), ...(result.approach ? [result.approach] : [])],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/door",
      route(
        lifeRoute(async (life, req) => {
          let result = answerDoor(life, !!req.body?.open);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            came: result.came ?? null,
            said: result.said ?? "",
          };
        }),
      ),
    );
    router.post("/lives/:id/news/seen", route(lifeRoute(async (life, req) => markNewsSeen(life, req.body?.week))));
    router.post("/lives/:id/first-day", route(lifeRoute(async (life) => markFirstDaySeen(life))));
    router.post(
      "/lives/:id/notes",
      route(
        lifeRoute(async (life, req) => {
          let result = editCalendarNote2(life, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            calendar: calendarView(life, Number(req.body?.offset ?? 0)),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/rules",
      route(
        lifeRoute(async (life, req) => {
          let npcsWereOn = npcsOn(life),
            result = setRules(life, req.body?.rules ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (!npcsWereOn && npcsOn(life)) {
            enqueue(life.id, async () => {}).then(() => {
              runModuleBackgrounds(life.id);
              runPaintQueue();
            });
          }
          return {
            rules: result.rules,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/settings",
      route(
        lifeRoute(async (life, req) => {
          let result = setLifeSettings(life, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            settings: result.settings,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/world-lore",
      route(
        lifeRoute(async (life, req) => {
          let lorebookId = String(req.body?.lorebookId ?? "");
          // A snapshot: the life only changes when the player re-pulls or switches here.
          let lore = await loadWorldLore(runtime, lorebookId);
          if (lorebookId && !lore) {
            throw httpError(400, "That lorebook could not be read, or it has no enabled entries.");
          }
          life.worldLore = lore;
          return {
            worldLore: lore ? { lorebookId: lore.lorebookId, name: lore.name } : null,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast/job",
      route(
        lifeRoute(async (life, req) => {
          let result = setJob(life, req.body?.character, req.body?.job, {
            title: req.body?.title,
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            job: true,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/sheet/:character/work",
      route(
        lifeRoute(async (life, req) => {
          let result = setWorkOutfit(life, req.params.character, req.body?.outfit);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/sheet/:character/work/redo",
      route(
        lifeRoute(async (life, req) => {
          let character = characterOf(life, req.params.character);
          if (!character?.job?.id || !character.workOutfit) {
            throw httpError(400, "They have no job in town, so there are no work clothes to paint.");
          }
          if (!workSpritesOn(life)) {
            throw httpError(400, "Switch on \xABWork outfits\xBB in RULES first (it needs an image connection).");
          }
          character.workLook = null;
          character.workAsked = true;
          return {
            sheet: characterSheet2(life, character.id),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/sheet/:character/season",
      route(
        lifeRoute(async (life, req) => {
          let result = setSeasonOutfit(life, req.params.character, req.body?.season, req.body?.outfit);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/sheet/:character/season/redo",
      route(
        lifeRoute(async (life, req) => {
          let result = redoSeasonPicture(life, req.params.character, req.body?.season);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/frame",
      route(
        lifeRoute(async (life, req) => {
          let result = setFrame(life, req.body?.frame);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            frame: result.frame,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/size",
      route(
        lifeRoute(async (life, req) => {
          let result = setPictureSize(life, req.body?.size);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            size: result.size,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/portrait-size",
      route(
        lifeRoute(async (life, req) => {
          let result = setPortraitSize(life, req.body?.size);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            size: result.size,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/gender",
      route(
        lifeRoute(async (life, req) => {
          let result = setYourGender(life, req.body?.gender);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            gender: result.gender,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast/orientation",
      route(
        lifeRoute(async (life, req) => {
          let result = setOrientation(life, req.body?.character, {
            gender: req.body?.gender,
            into: req.body?.into,
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            orientation: result.name,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast/rename",
      route(
        lifeRoute(async (life, req) => {
          let result = renameCharacter(life, String(req.body?.character ?? ""), req.body?.name);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            renamed: {
              name: result.name,
              was: result.was,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast/refresh",
      route(
        lifeRoute(async (life, req) => {
          let characterId = String(req.body?.character ?? ""),
            character = characterOf(life, characterId);
          if (!character) {
            throw httpError(400, "They are not in this life.");
          }
          let card = await engineClient.card(character.cardId ?? character.id).catch(() => null),
            result = refreshFromCard(life, characterId, card);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let traitsSaid = "";
          if (
            !(character.traitsBy === "you" && character.thingBy === "you") &&
            (result.changed.includes("description") || traitsOf(life, characterId).from !== "own")
          ) {
            try {
              let traits = await askModel(life.id, "Who they are could not be read again", (signal) =>
                readCharacterTraits(
                  modelFor(life, {
                    signal: signal,
                    scope: "cast",
                  }),
                  card,
                ),
              );
              if (!setReadTraits(life, characterId, traits).kept) {
                result.changed.push("who they are");
              }
            } catch (err) {
              traitsSaid = err.message;
            }
          }
          runModuleHook(life, "cardReread", characterId);
          if (activeModules(life).some((mod) => mod.background)) {
            setTimeout(() => runModuleBackgrounds(life.id), 0);
          }
          return {
            refreshed: {
              name: result.name,
              changed: result.changed,
              traitsSaid: traitsSaid,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast/:character/traits",
      route(
        lifeRoute(async (life, req) => {
          let characterId = String(req.params.character ?? ""),
            character = characterOf(life, characterId);
          if (!character || !life.bonds?.[characterId]) {
            throw httpError(400, "They are not in this life.");
          }
          let traits = normalizeTraits(req.body?.traits ?? {}),
            tone = null,
            toneSaid = "";
          try {
            tone = await askModel(life.id, "How they come across could not be written again", (signal) =>
              writeCharacterTone(
                modelFor(life, {
                  signal: signal,
                  scope: "cast",
                }),
                character,
                traits,
              ),
            );
          } catch (err) {
            toneSaid = err.message;
          }
          let result = setTraits(life, characterId, traits, {
            tone: tone,
            byYou: true,
            thing: req.body?.thing,
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            saved: {
              name: result.name,
              toneSaid: toneSaid,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast/away",
      route(
        lifeRoute(async (life, req) => {
          let result = setAway(life, req.body?.character, req.body?.away !== false);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            moved: {
              name: result.name,
              away: req.body?.away !== false,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/cast",
      route(async (req) => {
        let castPicks = Array.isArray(req.body?.cast) ? req.body.cast : [];
        if (!castPicks.length) {
          throw httpError(400, "Pick somebody first.");
        }
        if (castPicks.length > MAX_CAST) {
          throw httpError(400, `A life can have at most ${MAX_CAST} people in its cast.`);
        }
        let life = await loadLife(req.params.id),
          placeIds = everydayPlaces(life.town).map((place) => place.id),
          newCast = await buildCast(castPicks, placeIds, {
            from: life.characters.length,
            stores: storesInside(life.town),
            town: life.town,
            held: Object.keys(jobHolders(life.characters)),
          }),
          { result: result, life: savedLife } = await withLife(req.params.id, (draft) => {
            let result2 = addCast(draft, newCast);
            if (!result2.ok) {
              throw httpError(400, result2.reason);
            }
            let pairs = parseNpcPairsFromCards(req.body?.pairs, {
              ids: draft.characters.map((character) => character.id),
              couples: draft.rules?.castCouples === true,
              at: draft.minutes,
            });
            ensureSocialNetwork(draft);
            for (let [pairKey, pair] of Object.entries(pairs)) {
              draft.pairs[pairKey] ??= pair;
            }
            runModuleHook(draft, "castRead", castPicks);
            let dropped = [];
            dropRefusedJobs(
              draft,
              newCast.map((member) => member.id),
              dropped,
            );
            markSeenHere(draft);
            return {
              added: result2.added,
              dropped: dropped,
            };
          });
        readTastes(savedLife.id);
        runModuleBackgrounds(savedLife.id);
        await queueWorkSprites(savedLife);
        if (seasonsToWrite(savedLife).length) {
          writeSeasonOutfitsFor(savedLife.id);
        }
        await loadGallery();
        await loadPaintJobs();
        return {
          ...result,
          life: viewOfLife(savedLife),
        };
      }),
    );
    let aborters = new Map();
    function startCall(lifeId) {
      let controller = new AbortController();
      if (cancelledLives.has(lifeId)) {
        controller.abort();
      }
      aborters.set(lifeId, controller);
      return {
        signal: controller.signal,
        check() {
          if (controller.signal.aborted) {
            throw httpError(499, "Cancelled.");
          }
        },
        done() {
          if (aborters.get(lifeId) === controller) {
            aborters.delete(lifeId);
          }
        },
      };
    }
    let emptyLines = Object.freeze({
      lines: [],
      remember: "",
      picture: null,
    });
    async function askModel(lifeId, failure, ask) {
      let call = startCall(lifeId);
      try {
        let reply = await ask(call.signal);
        call.check();
        return reply;
      } catch (err) {
        call.check();
        throw Object.assign(httpError(502, `${failure}: ${err.message}`), {
          model: true,
        });
      } finally {
        call.done();
      }
    }
    router.post(
      "/lives/:id/playtime",
      route(async (req) => {
        if (!(Number(req.body?.ms) > 0)) {
          return {
            playedMs: null,
          };
        }
        let { life: savedLife } = await withLife(req.params.id, async (draft) => {
          addPlaytime(draft, req.body.ms);
        });
        return {
          playedMs: savedLife.playedMs,
        };
      }),
    );
    router.post(
      "/lives/:id/cancel",
      route(async (req) => {
        let lifeId = req.params.id,
          controller = aborters.get(lifeId);
        controller?.abort();
        cancelledLives.add(lifeId);
        let pending = lifeQueues.get(lifeId);
        if (
          await Promise.race([
            (pending ?? Promise.resolve()).then(
              () => true,
              () => true,
            ),
            new Promise((resolve) => setTimeout(() => resolve(false), CANCEL_WAIT_TIMEOUT_MS).unref?.()),
          ])
        ) {
          cancelledLives.delete(lifeId);
        }
        return {
          cancelled: !!controller,
        };
      }),
    );
    let memoriesForPrompt = (life, character, count = 0) =>
        memoriesInBudget(character)
          .slice(-count)
          .map((memory) => ({
            text: memory.text,
            when:
              memory.from === "summary"
                ? "earlier on, summed up"
                : Number.isFinite(memory.at)
                  ? formatAgoStamp(memory.at, life.minutes)
                  : "some time ago",
          })),
      timeAndMemories = (life, character, count = 0) => ({
        now: formatDateTime(life.minutes),
        memories: memoriesForPrompt(life, character, count),
        ahead: plansAhead(life, character.id),
      }),
      sceneBrief = (life, character, scene) => {
        let summary = life.bonds[character.id] ? bondSummary(life.bonds[character.id]) : null,
          where = (summary && whereabouts(life, character.id)) || {
            place: null,
            doing: character.doing ?? "",
            twist: null,
            known: false,
          },
          deep = scene.kind !== "intro",
          place = hudView(life).place,
          store = place?.inside ? life.town.places.find((candidate) => candidate.id === place.inside) : null;
        return {
          kind: scene.kind,
          place:
            life.at === "home" && !life.visit
              ? `${
                  life.lodging?.kind === "couch"
                    ? `${characterOf(life, life.lodging.with)?.name ?? "a friend"}'s place, where the player sleeps on the couch for a few nights`
                    : ({
                        house: "the player's house",
                        luxury: "the player's luxury flat in Skyline Tower",
                        mansion: "the player's mansion on the hill",
                      }[life.wallet?.home] ??
                      (rentSharersOf(life) ? "the flat the player shares" : "the player's flat"))
                }${store ? ` in ${store.name}` : ""}`
              : store
                ? `${place.name}, a store in the ${store.name}`
                : (place?.name ?? ""),
          time: formatDateTime(life.minutes),
          language: life.settings?.language ?? DEFAULT_LANGUAGE,
          tone: summary?.archetype.tone ?? character.tone ?? "",
          doing:
            scene.after === "wedding"
              ? morningWords(life)
              : scene.approached === "door"
                ? "they just rang the player's doorbell, and the player let them in"
                : scene.approached
                  ? "they came over to find the player, here"
                  : guestWords(life, character.id) ||
                    (partySceneLine(life, scene) ? "at the party (below)" : (where.doing ?? "")),
          party: partySceneLine(life, scene),
          persona: describePersonaAsSeen(life, character.id),
          setting: settingNoteFor(life),
          bond:
            deep && summary
              ? {
                  friendship: summary.friendship.name,
                  romance: summary.romance.name,
                  trust: summary.trust.name,
                  what: standingWords(life, character.id),
                }
              : null,
          memories: deep ? memoriesForPrompt(life, character) : [],
          pairs: deep && !character.npc ? pairMemoriesFor(life, character.id) : [],
          knows: character.npc ? [] : knownForModel(life, character.id),
          ahead: deep && !character.npc ? plansAhead(life, character.id) : [],
          npc: !!character.npc,
          step:
            scene.kind === "tier"
              ? tierStepMoment(scene.axis, scene.tier, scene.couple)
              : scene.kind === "milestone"
                ? milestoneStepCopy(scene.milestone, scene.by, character.name, jealousAbout(life, scene))
                : null,
          axis: scene.kind === "tier" ? scene.axis : null,
          tier: scene.kind === "tier" ? scene.tier : null,
          couple: scene.couple || false,
          leaves: scene.leavesAt === null || scene.leavesAt === undefined ? "" : formatClockTime(scene.leavesAt),
          leaveReason: scene.leaveReason ?? "leaves",
          last: isLastSceneExchange(scene, life.minutes),
          others: eventCast(scene)
            .slice(1)
            .map((id) => characterOf(life, id))
            .filter(Boolean)
            .map((other) => ({
              id: other.id,
              name: other.name,
              description: other.description ?? "",
              role: walkInRole(life, scene, other.id),
            })),
          modules: collectModuleHook(life, "sceneBlocks", scene, character),
        };
      },
      sceneModel = (life, signal = null) =>
        modelFor(life, {
          signal: signal,
        }),
      sceneRememberers = (life, scene) =>
        moduleOwningScene(life, scene)
          ? []
          : rememberersOf(
              life,
              eventCast(scene).filter((id) => id !== scene.characterId),
            ),
      dressed = (life, character) => dressedNow(life, character);
    Object.assign(moduleContext, {
      openScene: async (life, scene) => {
        let character = dressed(life, characterOf(life, scene.characterId));
        await askModel(life.id, "The scene could not be written", (signal) =>
          openScene(sceneModel(life, signal), scene, character, sceneBrief(life, character, scene)),
        );
      },
      pictureHere: (...args) => queueBackgroundsHere(...args),
      withModel: askModel,
      modelCall: startCall,
      sceneModel: sceneModel,
      sceneContext: sceneBrief,
      dressed: dressed,
      briefFor: (...args) => pictureBrief(...args),
      queueKey: (...args) => queueKeyImage(...args),
      foldAfterScene: (...args) => foldMemories(...args),
      paintSprite: (...args) => paintSprite(...args),
    });
    async function paintSprite(
      life,
      { id: characterId = null, key: key, name: spriteName, body: appearance, outfit = "", sex = "other" },
    ) {
      let current = life?.id ? await loadLife(life.id).catch(() => life) : life;
      if (!npcsOn(current) || (characterId && !characterOf(current, characterId))) {
        throw Object.assign(new Error("Nobody to paint: they are set aside in this life."), {
          aside: true,
        });
      }
      let choice = imageChoice(life);
      if (!choice.connectionId) {
        throw new Error("No image connection.");
      }
      let styles = await engineClient.styleProfiles(),
        profile =
          styles.profiles.find((candidate) => candidate.id === choice.styleProfileId) ??
          styles.profiles.find((candidate) => candidate.id === styles.defaultId) ??
          {},
        prompt = outfitImagePrompt({
          appearance: appearance,
          outfit: outfit,
          profile: profile,
          prompts: await loadImagePrompts(),
          name: spriteName,
          sex: sex,
        }),
        image = await engineClient.paint({
          connectionId: choice.connectionId,
          name: `life sim ${life.id} ${key}`,
          ...prompt,
          ...portraitSizeOf(life),
          styleProfileId: choice.styleProfileId,
        }),
        kept = await engineClient.keep({
          image: image,
          name: key,
          prompt: prompt.prompt,
        }),
        clean = await keepCutout(image, `${key}-cut`, prompt.prompt);
      return {
        url: kept.url,
        ref: `global-gallery:${kept.id}`,
        clean: clean,
      };
    }
    async function foldMemories(life, characterId, extraIds = null) {
      if (life.faintMemo) {
        return;
      }
      let others = extraIds ?? (life.scene?.characterId === characterId ? (life.scene.eachKept ?? []) : []);
      if (!extraIds && life.scene?.characterId === characterId) {
        delete life.scene.eachKept;
      }
      for (let id of [...new Set([characterId, ...others])]) {
        let character = characterOf(life, id);
        if (!character) {
          continue;
        }
        let call = startCall(life.id);
        try {
          await foldOldMemories(sceneModel(life, call.signal), character, {
            language: life.settings?.language ?? DEFAULT_LANGUAGE,
            player: life.persona?.name || "the player",
          });
          for (let pair of id === characterId ? pairsOf(life, id) : []) {
            let pairNames = [pair.a, pair.b].map((id2) => characterOf(life, id2)?.name ?? "someone").join(" and ");
            await foldOldMemories(sceneModel(life, call.signal), pair, {
              language: life.settings?.language ?? DEFAULT_LANGUAGE,
              pair: pairNames,
            });
          }
        } catch (err) {
          serviceLogger?.warn?.(`[${ID}] memory summary for ${id}: ${err.message}`);
        } finally {
          call.done();
        }
      }
    }
    async function pictureBrief(life, scene, signal = null) {
      let pictureSignal = signal
          ? AbortSignal.any([signal, AbortSignal.timeout(PICTURE_REQUEST_TIMEOUT_MS)])
          : AbortSignal.timeout(PICTURE_REQUEST_TIMEOUT_MS),
        choice = imageChoice(life),
        styles = await engineClient.styleProfiles().catch(() => ({
          profiles: [],
          defaultId: "",
        })),
        profile =
          styles.profiles.find((candidate) => candidate.id === choice.styleProfileId) ??
          styles.profiles.find((candidate) => candidate.id === styles.defaultId) ??
          {},
        cast = eventCast(scene);
      if (!life.personaFigure) {
        let persona = await engineClient.persona(life.persona?.id).catch(() => null);
        life.personaFigure =
          (await describeFigure(
            modelFor(life, {
              signal: pictureSignal,
            }),
            {
              name: persona?.name ?? life.persona?.name ?? "",
              appearance: persona?.appearance ?? "",
              description: persona?.description ?? "",
            },
          ).catch(() => null)) ?? undefined;
      }
      for (let id of cast) {
        let character = characterOf(life, id);
        if (character && !character.figure) {
          character.figure =
            (await describeFigure(
              modelFor(life, {
                signal: pictureSignal,
              }),
              {
                name: character.name,
                appearance: character.appearance ?? "",
                description: character.description ?? "",
              },
            ).catch(() => null)) ?? undefined;
        }
      }
      let people = picturePeople(life, cast, {
        you: !scene.watching,
      });
      return keyImageBrief({
        people: people,
        subject: pictureSubject(life),
        time: dayOrNightAt(life.minutes),
        tagged: profile.promptMode === "danbooru" || profile.promptMode === "tagged",
        profile: profile,
        prompts: await loadImagePrompts(),
        guidance: collectModuleHook(life, "pictureGuidance", scene),
      });
    }
    async function runMoment(life, scene, call) {
      if (currentEventBeat(scene)?.type !== "moment") {
        return [];
      }
      let character = dressed(life, characterOf(life, scene.characterId)),
        wantsPicture = !!currentEventBeat(scene).keyImage && keyImagesOn(life);
      try {
        let moment = await runEventMoment(sceneModel(life, call.signal), scene, character, {
          ...sceneBrief(life, character, scene),
          picture: wantsPicture ? await pictureBrief(life, scene, call.signal) : false,
        });
        call.check();
        applyEventMoment(scene, moment);
        let image = keyImageFor(life, scene, {
          beat: "moment",
          picture: moment.picture,
          label:
            scene.kind === "milestone"
              ? milestoneView(life, scene).title
              : (tierStepMoment(scene.axis, scene.tier, scene.couple)?.title ?? "A moment"),
        });
        return image ? [image] : [];
      } catch (err) {
        if (err?.cancelled || err?.statusCode === 499) {
          throw err;
        }
        serviceLogger?.warn?.(`[${ID}] the moment for ${scene.characterId}: ${err.message}`);
        enterDecidePhase(scene);
        return [];
      }
    }
    let outingContext = (life, character) => {
        let outing = life.outing,
          summary = bondSummary(life.bonds[character.id]);
        return {
          player: describePersonaAsSeen(life, character.id) || "the player",
          kind: outing?.kind ?? "hang",
          place: outing ? planPlaceName(life, outing) : "",
          time: formatDateTime(life.minutes),
          language: life.settings?.language ?? DEFAULT_LANGUAGE,
          setting: settingNoteFor(life),
          tone: summary.archetype.tone,
          bond: {
            friendship: summary.friendship.name,
            romance: summary.romance.name,
            trust: summary.trust.name,
            status: summary.status.name,
            what: standingWords(life, character.id),
          },
          memories: memoriesForPrompt(life, character, 8),
          ahead: plansAhead(life, character.id),
          log: (outing?.log ?? []).slice(-16),
          mood: outing ? outingMoodBand(outing.mood)[1].toLowerCase() : "",
          birthday: outing?.birthday
            ? outing.birthday.of === "you"
              ? outing.by === "them"
                ? `It is the player's birthday, and ${character.name} planned this night for them as a treat.${OUTING_PLACES[outing.place]?.price ? ` ${character.name} pays for both here.` : ""}`
                : "It is the player's birthday party: everyone came to celebrate the player."
              : `It is ${characterOf(life, outing.birthday.of)?.name ?? "their"}'s birthday party: the player came to celebrate with them.${OUTING_PLACES[outing.place]?.price ? " Everyone pays their own way here." : ""}`
            : outing?.afterFaint && (outing.tripDay ?? 1) === (outing.faintDay ?? 1)
              ? outing.faintDay
                ? "The player collapsed from exhaustion on the trip and woke up in the hospital; they are out now, and the trip goes on for the days that were left. It is still on both their minds."
                : "The player collapsed from exhaustion on their wedding night and woke up in the hospital; they are out now, and the trip goes ahead as planned. It is still on both their minds."
              : "",
          others: outingCompanions(outing)
            .map((id) => characterOf(life, id))
            .filter(Boolean)
            .map((person) => ({
              id: person.id,
              name: person.name,
              tone: bondSummary(life.bonds[person.id]).archetype.tone,
              with:
                outing?.friendOf || outing?.birthday || !(outing?.group ?? []).includes(person.id)
                  ? ""
                  : PARTNER_MOOD_LABEL[partnerMoodOf(life, character.id, person.id)].toLowerCase(),
            })),
          friendOf: !!outing?.friendOf,
          content: moduleContent(life, character.id, outingCompanions(outing)),
          asks: firstModuleHook(life, "farewellAsk", character.id) ?? "",
        };
      },
      outingCompanions = (outing) =>
        [...(outing?.group ?? []), ...(outing?.guests ?? [])].filter((id) => !leftEarly(outing, id)),
      askSceneJson = async (life, prompt, task, about, signal, maxTokens = 700) => {
        let model = modelFor(life, {
            signal: signal,
          }),
          { json: json } = await model.askJson(prompt, {
            maxTokens: maxTokens,
            task: task,
            about: about,
            check: checkSceneLines,
          });
        return json;
      },
      atMemoTime = (life, memo, run) => {
        let saved = {
            minutes: life.minutes,
            at: life.at,
            visit: life.visit,
            knows: life.knows,
          },
          knowsThen = life.knows
            ? Object.fromEntries(
                Object.entries(life.knows).map(([characterId, facts]) => [
                  characterId,
                  (facts ?? []).filter((fact) => !(fact.at > memo.at)),
                ]),
              )
            : life.knows;
        Object.assign(life, {
          minutes: memo.at,
          at: memo.place,
          visit: memo.visit ?? null,
          knows: knowsThen,
        });
        try {
          return run();
        } finally {
          Object.assign(life, saved);
        }
      };
    handleFaintMemory = async (life) => {
      let memo = life.faintMemo;
      if (!memo) {
        return;
      }
      delete life.faintMemo;
      let call = startCall(life.id),
        foldFor = null;
      try {
        if (memo.kind === "scene") {
          let scene = life.scene,
            character = scene?.endedBy === "fainted" ? characterOf(life, scene.characterId) : null;
          if (!character) {
            return;
          }
          let owner = moduleOwningScene(life, scene),
            custom = owner?.faintMemory ? owner.faintMemory(life, moduleState(life, owner.id), scene) : undefined;
          if (custom === null) {
            return;
          }
          let faintLine = typeof custom == "string" ? custom : typeof custom?.line == "string" ? custom.line : "",
            [dressedCharacter, context, rememberers] = atMemoTime(life, memo, () => {
              let dressedCharacter2 = dressed(life, character);
              return [dressedCharacter2, sceneBrief(life, dressedCharacter2, scene), sceneRememberers(life, scene)];
            }),
            each = custom?.each === true ? true : owner ? false : rememberers,
            faint = await runSceneFaint(sceneModel(life, call.signal), scene, dressedCharacter, {
              ...context,
              faint: faintLine,
              doing: memo.doing ?? "",
              said: memo.said ?? "",
              each: each,
            });
          scene.remember = faint.remember;
          if (each !== true) {
            scene.each = faint.each;
          }
          rememberScene(life, scene, {
            at: memo.at,
          });
          let eachMemories =
            each === true
              ? Object.entries(faint.each).map(([id, text]) => ({
                  id: id,
                  name: characterOf(life, id)?.name ?? "",
                  text: text,
                }))
              : [];
          for (let entry of eachMemories) {
            let character2 = characterOf(life, entry.id);
            if (character2) {
              addMemory(character2, {
                at: memo.at,
                text: entry.text,
                from: scene.kind,
              });
            }
          }
          if (eachMemories.length && faint.remember) {
            scene.remembers = [
              {
                id: scene.characterId,
                name: character.name,
                text: faint.remember,
              },
              ...eachMemories,
            ];
          }
          if (owner?.faintKept && (faint.remember || eachMemories.length)) {
            owner.faintKept(life, moduleState(life, owner.id), scene, {
              remember: faint.remember,
              each: faint.each,
            });
          }
          if (faint.remember || scene.eachKept?.length) {
            foldFor = scene.characterId;
          }
        } else {
          let outing = life.outing,
            character = outing?.summary?.fainted ? characterOf(life, outing.characterId) : null;
          if (!character) {
            return;
          }
          let context = atMemoTime(life, memo, () => outingContext(life, dressedNow(life, character))),
            reply = await askSceneJson(
              life,
              outingFaintPrompt(character, context),
              "outing-faint",
              character.name,
              call.signal,
              900,
            );
          if (keepFaintOuting(life, normalizeRemember(reply?.remember, OUTING_REMEMBER_MAX_CHARS), memo.at)) {
            foldFor = outing.characterId;
          }
        }
      } catch (err) {
        serviceLogger?.warn?.(`[${ID}] memory of the faint: ${err.message}`);
      } finally {
        call.done();
      }
      if (foldFor) {
        await foldMemories(life, foldFor);
      }
    };
    router.get(
      "/lives/:id/invite/:character",
      route(async (req) => ({
        invite: inviteInfo(await loadLife(req.params.id), req.params.character),
      })),
    );
    router.post(
      "/lives/:id/invite",
      route(
        lifeRoute(async (life, req) => {
          let { character: characterId, kind: kind, place: place, day: day, hour: hour } = req.body ?? {},
            result = invitePlan(life, characterId, {
              kind: kind,
              place: place,
              day: day,
              hour: hour,
              with: Array.isArray(req.body?.with) ? req.body.with : [],
              pickUp: req.body?.pickUp === true,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (result.cut) {
            return {
              invited: {
                ...result,
                line: "",
              },
              events: result.events,
            };
          }
          let line = "",
            character = withHomeAndWork(life, characterOf(life, characterId)),
            call = startCall(life.id);
          try {
            let summary = bondSummary(life.bonds[characterId]),
              reply = await askSceneJson(
                life,
                inviteAnswerPrompt(character, {
                  player: life.persona?.name || "the player",
                  kind: kind,
                  place: result.placeName,
                  when: result.when,
                  answer: result.answer,
                  why: result.why,
                  counter: result.counter?.when ?? "",
                  language: life.settings?.language ?? DEFAULT_LANGUAGE,
                  tone: summary.archetype.tone,
                  setting: settingNoteFor(life),
                  bond: {
                    friendship: summary.friendship.name,
                    romance: summary.romance.name,
                    trust: summary.trust.name,
                    status: summary.status.name,
                    what: standingWords(life, characterId),
                  },
                  memories: memoriesForPrompt(life, character, 5),
                  also: (result.group ?? []).map((member) => ({
                    name: member.name,
                    answer: member.answer,
                  })),
                }),
                "invite-answer",
                character.name,
                call.signal,
                300,
              );
            line = parseInviteAnswer(reply);
            call.check();
          } catch (err) {
            call.check();
            serviceLogger?.warn?.(`[${ID}] invite line for ${characterId}: ${err.message}`);
          } finally {
            call.done();
          }
          return {
            invited: {
              ...result,
              line: line,
            },
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/invite/counter",
      route(
        lifeRoute(async (life, req) => {
          let result = answerCounter(life, req.body?.character, req.body?.take === true);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            counter: result,
          };
        }),
      ),
    );
    let freeCancels = new Map();
    router.post(
      "/lives/:id/plans/cancel",
      route(
        lifeRoute(async (life, req) => {
          let planId = String(req.body?.plan ?? ""),
            free = req.body?.free === true;
          if (free && freeCancels.get(life.id) !== planId) {
            throw httpError(400, "That plan can only be cancelled as usual.");
          }
          let result = cancelPlan(life, planId, {
            free: free,
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (freeCancels.get(life.id) === planId) {
            freeCancels.delete(life.id);
          }
          return {
            cancelled: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/plans/wait",
      route(
        lifeRoute(async (life, req) => {
          let result = waitForPlan(life, String(req.body?.plan ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            waited: result.minutes,
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/outing/start",
      route(
        lifeRoute(async (life, req) => {
          let planId = String(req.body?.plan ?? ""),
            result = beginOuting(life, planId);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let character = withHomeAndWork(life, characterOf(life, life.outing.characterId)),
            reply = await askModel(life.id, "They could not be written", (signal) =>
              askSceneJson(
                life,
                outingArrivePrompt(character, {
                  ...outingContext(life, character),
                  words: life.outing.arrive.words,
                  ...outingNext(life),
                }),
                "outing-arrive",
                character.name,
                signal,
              ),
            ).catch((err) => {
              if (err?.model) {
                freeCancels.set(life.id, planId);
              }
              throw err;
            });
          freeCancels.delete(life.id);
          setOutingLines(life, parseOutingLinesOrThrow(reply, outingCompanions(life.outing)), {
            phase: "arrive",
          });
          life.outing.suggestions = parseSuggestionList(reply?.suggestions);
          settleOuting(life);
          return {
            started: true,
          };
        }),
      ),
    );
    let unansweredPlea = (life, where, characterId, { end = false } = {}) => {
        let plea = pleaOpenIn(life, where, characterId);
        return plea && (end || plea.passed)
          ? {
              amount: plea.amount,
              what: plea.what,
            }
          : null;
      },
      freeActsContext = (life, talk, character) => ({
        free: talk.free,
        didShape: DID_JSON_TEMPLATE,
        freeBlock: talk.free
          ? freeActsPromptBlock(talk.free, {
              name: character.name,
            })
          : "",
        freeFacts: talk.free ? freeActsContextBlock(talk.free) : "",
        askShape: ASK_JSON_TEMPLATE,
        askLine: moneyAskPromptLine(
          {
            plea: life.plea,
            asksEasily: traitsOf(life, character.id).dials.caring <= 2,
            rich: !!richLookOf(life),
          },
          character.name,
        ),
      });
    async function writeInterruption(life) {
      let outing = life.outing,
        words = interruptWords(life);
      if (!words || outing?.interrupt?.phase !== "lines") {
        return;
      }
      let call = startCall(life.id);
      try {
        let reply = await askSceneJson(
          life,
          outingInterruptPrompt(words.date, words.other, {
            kind: outing.kind,
            place: planPlaceName(life, outing),
            words: words.words,
            language: life.settings?.language ?? DEFAULT_LANGUAGE,
            setting: settingNoteFor(life),
            dateTone: bondSummary(life.bonds[words.date.id]).archetype.tone,
            otherTone: bondSummary(life.bonds[words.other.id]).archetype.tone,
          }),
          "outing-interrupt",
          words.other.name,
          call.signal,
          700,
        );
        setInterruptLines(life, parseInterruptLines(reply, [words.date.id, words.other.id]));
        call.check();
      } catch (err) {
        call.check();
        serviceLogger?.warn?.(`[${ID}] interruption: ${err.message}`);
        life.outing.interrupt = null;
        settleOuting(life);
      } finally {
        call.done();
      }
    }
    let skipLines = (outing, req, moment = null) =>
      req.body?.noLines === true &&
      (["wedding", "honeymoon"].includes(outing?.kind) || !!moment?.pay || !!outing?.ending);
    router.post(
      "/lives/:id/outing/say",
      route(
        lifeRoute(async (life, req) => {
          let text = String(req.body?.text ?? "")
              .trim()
              .slice(0, 400),
            result = prepareTalk(life, {
              text: text,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let outing = life.outing,
            character = withHomeAndWork(life, characterOf(life, outing.characterId));
          life.pleaDone = null;
          let meal = mealOpen(life),
            silent = skipLines(outing, req),
            byGame = req.body?.byGame === true,
            talk = byGame
              ? {
                  ...result,
                  free: null,
                }
              : result,
            language = life.settings?.language ?? DEFAULT_LANGUAGE,
            reply = silent
              ? {}
              : await askModel(life.id, "They could not answer", (signal) =>
                  askSceneJson(
                    life,
                    outingTalkPrompt(character, {
                      ...outingContext(life, character),
                      text: text,
                      reads: SCENE_READS,
                      lead: result.lead,
                      last: result.last,
                      coming: result.coming,
                      meal: meal,
                      ...freeActsContext(life, talk, character),
                      byGame: byGame,
                      choices: result.choices,
                      usual: result.usual,
                      playable: result.playable,
                    }),
                    "outing-talk",
                    character.name,
                    signal,
                    900,
                  ),
                ),
            answer = {
              lines: silent ? [] : parseOutingLinesOrThrow(reply, outingCompanions(outing)),
              read: silent ? null : normalizeSceneRead(reply?.read),
              silent: silent,
              suggestions: parseSuggestionList(reply?.suggestions),
              meal: meal ? parseMealProposal(reply?.meal) : null,
              moment: pickOutingMomentId(reply?.moment, result.playable),
              next: pickOutingMomentId(reply?.next, result.choices),
              did: result.free && !byGame ? normalizeDidActs(reply?.did, result.free) : null,
              ask: life.plea ? null : normalizeMoneyAsk(reply?.ask),
              you:
                byGame && !/^english$/i.test(String(language).trim()) && typeof reply?.you == "string"
                  ? reply.you.trim().slice(0, 400)
                  : "",
            };
          if (result.free && answer.did) {
            answer.read = readFromActOutcomes(result.free, answer.did) ?? answer.read;
          }
          let plea = pleaOpenIn(life, "outing", outing.characterId),
            applied = applyTalk(life, result, answer);
          if (plea && life.plea === plea && !byGame) {
            passPlea(life, "outing", outing.characterId);
          }
          if (answer.ask && life.outing) {
            openPlea(life, outing.characterId, answer.ask, "outing");
          }
          return {
            said: true,
            events: applied.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/outing/act",
      route(
        lifeRoute(async (life, req) => {
          let text = String(req.body?.text ?? "")
              .trim()
              .slice(0, 400),
            result = prepareMoment(life, {
              option: req.body?.option ?? null,
              text: text,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let outing = life.outing,
            character = withHomeAndWork(life, characterOf(life, outing.characterId));
          life.pleaDone = null;
          let picture = false;
          if (result.moment.keyImage && keyImagesOn(life)) {
            let call = startCall(life.id);
            try {
              picture = await pictureBrief(
                life,
                {
                  characterId: outing.characterId,
                  cast: [outing.characterId],
                },
                call.signal,
              ).catch(() => false);
              call.check();
            } finally {
              call.done();
            }
          }
          let silent = skipLines(outing, req, result.moment),
            reply = silent
              ? {}
              : await askModel(life.id, "They could not answer", (signal) =>
                  askSceneJson(
                    life,
                    outingMomentPrompt(character, {
                      picture: picture,
                      ...outingContext(life, character),
                      moment: momentName(life, result.moment),
                      choice: result.chosen,
                      text: text,
                      words: result.words,
                      reads: SCENE_READS,
                      lead: result.lead,
                      last: result.last,
                      coming: result.coming,
                      choices: result.choices,
                      usual: result.usual,
                      ...freeActsContext(life, result, character),
                    }),
                    "outing-moment",
                    character.name,
                    signal,
                    900,
                  ),
                ),
            answer = {
              lines: silent ? [] : parseOutingLinesOrThrow(reply, outingCompanions(life.outing)),
              read: text && !silent ? normalizeSceneRead(reply?.read) : null,
              silent: silent,
              did: result.free ? normalizeDidActs(reply?.did, result.free) : null,
              suggestions: parseSuggestionList(reply?.suggestions),
              ask: life.plea ? null : normalizeMoneyAsk(reply?.ask),
              next: pickOutingMomentId(reply?.next, result.choices),
            };
          if (result.free && answer.did) {
            answer.read = readFromActOutcomes(result.free, answer.did) ?? answer.read;
          }
          let plea = pleaOpenIn(life, "outing", outing.characterId),
            applied = applyMoment(life, result, answer);
          if (plea && life.plea === plea && text && !answer.did?.pleaTried) {
            passPlea(life, "outing", outing.characterId);
          }
          if (answer.ask && life.outing) {
            openPlea(life, outing.characterId, answer.ask, "outing");
          }
          let keyPicture = picture ? normalizePicture(reply?.picture) : null;
          if (keyPicture && life.outing) {
            await queueKeyImage(
              life,
              outingKeyImage(life, {
                picture: keyPicture,
                label: `${OUTING_KINDS[outing.kind].name} \xB7 ${result.moment.name}`,
              }),
            );
          }
          await writeInterruption(life);
          return {
            acted: true,
            events: applied.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/outing/interrupt",
      route(
        lifeRoute(async (life, req) => {
          let choice = String(req.body?.choice ?? ""),
            outing = life.outing,
            character = outing ? characterOf(life, outing.characterId) : null,
            result = interruptChoice(life, choice);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let noLines = req.body?.noLines === true;
          if (result.ends) {
            let context = {
                ...outingContext(life, character),
                what: goodbyeWhat(life, "ruined"),
                unanswered: unansweredPlea(life, "outing", outing.characterId),
                each: outingRememberers(life),
              },
              reply2 = noLines
                ? {}
                : await askModel(life.id, "It could not be written", (signal) =>
                    askSceneJson(
                      life,
                      outingGoodbyePrompt(character, context),
                      "outing-goodbye",
                      character.name,
                      signal,
                      outingGoodbyeMaxTokens(context),
                    ),
                  ),
              finish = finishOuting(life, "ruined", {
                lines: noLines ? [] : parseOutingLinesOrThrow(reply2, outingCompanions(life.outing)),
                remember: normalizeRemember(reply2?.remember, OUTING_REMEMBER_MAX_CHARS),
                each: parseOutingRememberEach(reply2, context),
              });
            for (let keptId of finish.kept ?? []) {
              await foldMemories(life, keptId, []);
            }
            return {
              ended: true,
              events: finish.events,
            };
          }
          if (noLines) {
            setOutingLines(life, []);
            return {
              chose: choice,
            };
          }
          let reply = await askModel(life.id, "They could not answer", (signal) =>
            askSceneJson(
              life,
              outingMomentPrompt(character, {
                ...outingContext(life, character),
                moment: "right after that",
                choice: "",
                text: "",
                words: result.words,
                reads: SCENE_READS,
                ...outingNext(life),
              }),
              "outing-moment",
              character.name,
              signal,
            ),
          );
          setOutingLines(life, parseOutingLinesOrThrow(reply, outingCompanions(life.outing)));
          if (life.outing) {
            life.outing.suggestions = parseSuggestionList(reply?.suggestions);
          }
          return {
            chose: choice,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/outing/night",
      route(
        lifeRoute(async (life, req) => {
          let result = outingNight(life, String(req.body?.choice ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return result.milestone
            ? {
                milestone: result.milestone,
                how: result.how,
                character: result.characterId,
              }
            : {
                slept: true,
                events: result.events,
              };
        }),
      ),
    );
    router.post(
      "/lives/:id/outing/end",
      route(
        lifeRoute(async (life, req) => {
          let result = endOutingEarly(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (result.farewell && req.body?.noLines === true) {
            setOutingLines(life, []);
            life.outing.result = null;
          } else if (result.farewell) {
            let character = withHomeAndWork(life, characterOf(life, life.outing.characterId)),
              reply = await askModel(life.id, "They could not answer", (signal) =>
                askSceneJson(
                  life,
                  outingFarewellPrompt(character, outingContext(life, character)),
                  "outing-farewell",
                  character.name,
                  signal,
                  700,
                ),
              );
            setOutingLines(life, parseOutingLinesOrThrow(reply, outingCompanions(life.outing)));
            life.outing.result = null;
          }
          return {
            ended: true,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/outing/goodbye",
      route(
        lifeRoute(async (life, req) => {
          let outing = life.outing;
          if (!outing) {
            throw httpError(400, "You are not out with anyone right now.");
          }
          let choice = String(req.body?.choice ?? ""),
            leaving = outing.leaving && !["wedding", "honeymoon"].includes(outing.kind),
            option = goodbyeOptions(life).find((candidate) => candidate.id === choice);
          if (!leaving && (outing.phase !== "goodbye" || !option?.ok)) {
            throw httpError(400, option?.why ? `${option.why}.` : "Pick how it ends.");
          }
          let how = leaving && !option ? "left" : choice;
          if (option?.milestone) {
            outing.milestone = option.milestone;
          }
          let character = withHomeAndWork(life, characterOf(life, outing.characterId)),
            noLines = req.body?.noLines === true,
            context = {
              ...outingContext(life, character),
              what: goodbyeWhat(life, how),
              unanswered: unansweredPlea(life, "outing", outing.characterId),
              each: outingRememberers(life),
            },
            reply = noLines
              ? {}
              : await askModel(life.id, "It could not be written", (signal) =>
                  askSceneJson(
                    life,
                    outingGoodbyePrompt(character, context),
                    "outing-goodbye",
                    character.name,
                    signal,
                    outingGoodbyeMaxTokens(context),
                  ),
                ),
            finish = finishOuting(life, how, {
              lines: noLines ? [] : parseOutingLinesOrThrow(reply, outingCompanions(life.outing)),
              remember: normalizeRemember(reply?.remember, OUTING_REMEMBER_MAX_CHARS),
              each: parseOutingRememberEach(reply, context),
            });
          await foldMemories(life, outing.characterId, finish.kept ?? []);
          return {
            ended: true,
            milestone: finish.milestone,
            events: finish.events,
          };
        }),
      ),
    );
    let writeMorningAfter = async (life) => {
      let result = weddingMorning(life);
      if (!result.ok && result.quiet) {
        return {
          ok: true,
          quiet: true,
          events: weddingMorningQuiet(life),
        };
      }
      if (!result.ok) {
        return null;
      }
      let scene = life.scene,
        character = dressed(life, characterOf(life, scene.characterId));
      await askModel(life.id, "The morning could not be written", (signal) =>
        openScene(sceneModel(life, signal), scene, character, sceneBrief(life, character, scene)),
      );
      scene.did = {
        exchange: scene.exchange,
        logAt: scene.log.length,
        tags: morningTags(life),
      };
      return result;
    };
    router.post(
      "/lives/:id/outing/close",
      route(
        lifeRoute(async (life, req) => {
          let result = closeOuting(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (result.after === "wedding") {
            let hookNight = firstModuleHook(life, "weddingNight", result.characterId);
            if (hookNight) {
              if (life.afterWedding) {
                life.afterWedding.now = true;
              }
              return {
                closed: true,
                milestone: hookNight.milestone,
                how: hookNight.how ?? null,
                character: result.characterId,
              };
            }
            if (req.body?.noLines === true) {
              return {
                closed: true,
                milestone: null,
                character: result.characterId,
                events: weddingMorningQuiet(life),
              };
            }
            let morning = await writeMorningAfter(life);
            if (morning) {
              return {
                closed: true,
                milestone: null,
                character: result.characterId,
                morning: !morning.quiet,
                events: morning.events,
              };
            }
          }
          return {
            closed: true,
            milestone: result.milestone,
            how: result.how,
            character: result.characterId,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/scene/start",
      route(
        lifeRoute(async (life, req) => {
          let {
              character: characterId,
              kind = "intro",
              milestone = null,
              with: withId = null,
              how = null,
            } = req.body ?? {},
            result = canStartScene(life, characterId, kind, {
              milestone: milestone,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (
            (milestone === "open-ask" &&
              !specialActions(life, characterId).openAsk?.who.some((person) => person.id === withId)) ||
            (milestone === "marry-ask" &&
              !specialActions(life, characterId).marryAsk?.who.some((person) => person.id === withId))
          ) {
            throw httpError(400, "Pick who you want to ask about.");
          }
          if (req.body?.noLines === true && PARTY_DOOR_MILESTONES.includes(milestone)) {
            let result2 = answerPartyDoorQuietly(life, characterId, milestone);
            if (!result2.ok) {
              throw httpError(400, result2.reason);
            }
            return {
              started: null,
              quiet: true,
              events: result2.events,
            };
          }
          return startScene(life, characterId, kind, {
            milestone: milestone,
            with: withId,
            how: how,
          });
        }),
      ),
    );
    async function startScene(
      life,
      characterId,
      kind,
      { milestone = null, with: withId = null, how = null, about = null } = {},
    ) {
      let character = dressed(life, characterOf(life, characterId)),
        scene = beginScene(life, characterId, kind, {
          milestone: milestone,
          with: withId,
          how: how,
        });
      if (scene.done) {
        let events = scene.begunEvents ?? [];
        life.scene = null;
        return {
          started: kind,
          fainted: true,
          events: events,
        };
      }
      await queueBackgroundsHere(life);
      let yourDay = kind === "intro" ? "" : yourDayWords(life, characterId);
      if (about && !scene.about) {
        scene.about = about;
      }
      let labels = callLabels(life, scene),
        callNow = scene.kind === "milestone" && !!MILESTONES[scene.milestone]?.callNow;
      await askModel(life.id, "The scene could not be written", (signal) =>
        openScene(sceneModel(life, signal), scene, character, {
          ...sceneBrief(life, character, scene),
          yourDay: yourDay,
          ...(labels
            ? {
                labels: labels,
              }
            : {}),
          ...(callNow
            ? {
                callNow: callNow,
              }
            : {}),
        }),
      );
      if (callNow) {
        enterDecidePhase(scene);
      }
      return {
        started: kind,
      };
    }
    router.post(
      "/lives/:id/scene/reply",
      route(
        lifeRoute(async (life, req) => {
          let scene = life.scene;
          if (!scene || scene.done) {
            throw httpError(400, "There is no scene going on right now.");
          }
          let text = String(req.body?.text ?? "")
            .trim()
            .slice(0, 400);
          if (!text) {
            throw httpError(400, "Say something first.");
          }
          let owner = moduleOwningScene(life, scene);
          if (owner?.sceneReply) {
            let reply = await owner.sceneReply(moduleContext, life, moduleState(life, owner.id), text);
            if (reply) {
              return reply;
            }
          }
          if (scene.phase === "decide" || scene.walkIn?.phase === "call") {
            throw httpError(400, "Make your call first.");
          }
          life.pleaDone = null;
          let character = dressed(life, characterOf(life, scene.characterId)),
            context = sceneBrief(life, character, scene),
            free = freePlan(life);
          context.free = free;
          let plea = pleaOpenIn(life, "scene", scene.characterId);
          context.byGame = req.body?.byGame === true;
          if (plea && !context.byGame) {
            context.unanswered = {
              amount: plea.amount,
              what: plea.what,
            };
          }
          let plans = scene.kind === "talk" ? scenePlans(life, scene.characterId) : null;
          if (plans) {
            context.plans = plans;
            context.plansBlock = scenePlansBlock(plans);
          }
          let slip = birthdaySlipWords(life, scene);
          if (slip) {
            context.slip = slip;
          }
          let walkedIn = walkInAfter(scene);
          if (walkedIn) {
            context.walkedIn = walkedIn.what;
            if (walkedIn.ends) {
              context.last = true;
            }
          } else if (walkInNow(life, scene)) {
            context.walkIn = walkInWords(life, scene);
          }
          if (free && (context.last || context.walkIn)) {
            free.noAsks = true;
          }
          if (scene.kind === "tier" && scene.favour) {
            context.favourPlaces = favourPlaces(life, scene, {
              after: (SCENE_KINDS[scene.kind] ?? SCENE_KINDS.intro).minutesPerExchange,
            });
          }
          context.each = sceneRememberers(life, scene);
          let turn = await askModel(
            life.id,
            "They could not answer",
            async (signal) => (
              free?.pictureSteps && (context.picture = await pictureBrief(life, scene, signal).catch(() => false)),
              runSceneTurn(sceneModel(life, signal), scene, character, text, context)
            ),
          );
          if (context.byGame) {
            turn.did = normalizeDidActs(null, free);
          }
          let minutes = (SCENE_KINDS[scene.kind] ?? SCENE_KINDS.intro).minutesPerExchange,
            { events: events } = advanceTime(life, minutes);
          if (events.some((ev) => ev.id === "fainted")) {
            if (life.faintMemo) {
              life.faintMemo.said = text;
            }
            return {
              read: null,
              applied: {},
              minutes: minutes,
              events: events,
            };
          }
          turn.read = readFromActOutcomes(free, turn.did) ?? turn.read;
          let hold = freeHolds(life, free, turn.did),
            applied = applySceneTurn(scene, life.bonds[scene.characterId], text, turn, {
              at: life.minutes,
              charm: skillLevelsOf(life).charm,
              last: context.last,
              hold: hold,
            }),
            over = scene.exchange >= scene.max || context.last,
            freeResult = applyFree(life, free, turn.did, {
              picture: turn.picture,
              over: over,
              remember: turn.remember,
              each: turn.each,
              endedBy: scene.exchange >= scene.max ? "done" : endReasonFromLeave(scene),
            });
          events.push(...freeResult.events);
          if (plea && life.plea === plea && !context.byGame && !turn.did?.pleaTried) {
            passPlea(life, "scene", scene.characterId);
          }
          let payBack = turn.payBack ? theyPayBack(life, free, scene) : null;
          if (
            (turn.ask &&
              !scene.done &&
              !freeResult.jumped &&
              !life.ride &&
              openPlea(life, scene.characterId, turn.ask, "scene"),
            turn.ride &&
              !scene.done &&
              !freeResult.jumped &&
              !life.plea &&
              openRide(life, scene.characterId, turn.ride),
            !freeResult.jumped && turn.plan && !scene.done && plans && theirPlanJump(life, turn.plan, plans),
            context.walkIn && walkInArrived(life, scene),
            rideNoTags(life, scene),
            walkedIn && walkInTags(life, scene),
            slip && !freeResult.jumped)
          ) {
            let slipTag = birthdaySlipped(life, scene);
            if (slipTag) {
              scene.did =
                scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length
                  ? {
                      ...scene.did,
                      tags: [...scene.did.tags, slipTag],
                    }
                  : {
                      exchange: scene.exchange,
                      logAt: scene.log.length,
                      tags: [slipTag],
                    };
            }
          }
          let flirtTag = freeResult.jumped ? null : flirtySeen(life, scene, turn.read);
          if (flirtTag) {
            scene.did =
              scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length
                ? {
                    ...scene.did,
                    tags: [...scene.did.tags, flirtTag],
                  }
                : {
                    exchange: scene.exchange,
                    logAt: scene.log.length,
                    tags: [flirtTag],
                  };
          }
          if (events.some((ev) => ev.id === "closed")) {
            closeSceneEarly(scene, life.bonds[scene.characterId]);
          }
          let pictureIds = freeResult.pictureId ? [freeResult.pictureId] : [];
          if (currentEventBeat(scene)?.type === "moment") {
            let earlierBatch = scene.batch,
              call = startCall(life.id);
            try {
              pictureIds.push(...(await runMoment(life, scene, call)));
            } finally {
              call.done();
            }
            if (scene.batch !== earlierBatch) {
              scene.batch = [
                ...earlierBatch.map((line) => ({
                  ...line,
                  lead: true,
                })),
                ...scene.batch,
              ];
            }
          }
          for (let pictureId of pictureIds) {
            await queueKeyImage(life, pictureId);
          }
          toTonight(scene);
          if (scene.done) {
            pleaLeftInScene(life);
            rememberScene(life, scene);
            await foldMemories(life, scene.characterId);
          }
          return {
            read: turn.read,
            applied: applied.applied,
            minutes: minutes,
            events: events,
            did: payBack ? [...freeResult.tags, payBack] : freeResult.tags,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/birthday/message",
      route(
        lifeRoute(async (life, req) => {
          let result = birthdayMessage(life, String(req.body?.character ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            birthday: {
              text: result.text,
              tags: result.tags,
            },
            sheet: characterSheet2(life, String(req.body?.character ?? "")),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/scene/walk-in",
      route(
        lifeRoute(async (life, req) => {
          let result = walkInChoice(life, String(req.body?.choice ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            walkIn: {
              say: result.say,
              ends: result.ends,
              tags: result.tags,
            },
            events: result.events ?? [],
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/scene/job",
      route(
        lifeRoute(async (life, req) => {
          let result = sceneJob(life, {
            choice: String(req.body?.choice ?? ""),
            day: req.body?.day ?? null,
            tone: req.body?.tone ?? null,
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sceneJob: result,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/scene/undo-detect",
      route(
        lifeRoute(async (life) => {
          let result = undoDetected(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (life.scene.done) {
            await foldMemories(life, life.scene.characterId);
          }
          return {
            undone: true,
          };
        }),
      ),
    );
    function decisionWhat(scene, choice, accepted, characterName, life) {
      let milestone = scene.milestone;
      if (scene.ownOut) {
        return scene.ownOut.what;
      }
      if (milestone === "break-up") {
        return accepted
          ? "The player ends the relationship. They react, true to who they are: 2 to 4 short segments. It is over."
          : "The player takes it back and does not end it. They react to how close it came: 2 to 4 short segments.";
      }
      if (milestone === "talk") {
        return accepted
          ? "They decide to give it another chance, and say what has to change: 2 to 4 short segments."
          : "It is over: they end the relationship, in their own words: 2 to 4 short segments.";
      }
      if (milestone === "stay-away") {
        return choice === "back-off"
          ? "The player says they will back off. How they take it: 2 to 4 short segments."
          : choice === "refuse"
            ? "The player refuses to back off. They react, true to who they are: 2 to 4 short segments."
            : accepted
              ? "The player denies it, and they believe it, for now: 2 to 4 short segments."
              : "The player denies it, and they know it is a lie: 2 to 4 short segments.";
      }
      if (milestone === "confront") {
        return choice === "allow"
          ? "The player lets it go on: from now on it is agreed. How they take it: 2 to 4 short segments."
          : choice === "stop"
            ? "The player asks them to stop seeing that person. They answer, true to who they are: 2 to 4 short segments."
            : "The player ends the relationship. They react: 2 to 4 short segments. It is over.";
      }
      if (milestone === "tells-you") {
        return choice === "keep"
          ? "The player keeps it to themselves for now. They take it as they would, and the talk winds down: 2 to 4 short segments."
          : `The player knows what they will do next (${choice === "confront" ? "confront their partner" : choice === "other" ? "talk to the other one" : "end it with their partner"}). They react to that, true to who they are: 2 to 4 short segments.`;
      }
      if (milestone === "talk-other") {
        return choice === "let-be"
          ? "The player lets it be. They take it as they would: 2 to 4 short segments."
          : accepted
            ? "The player asks them to stay away, and they agree to keep away, in their own words: 2 to 4 short segments."
            : "The player asks them to stay away, and they refuse, in their own words: 2 to 4 short segments.";
      }
      if (milestone === "hit-on") {
        return "The talk goes on, easier now that it is said: 2 to 4 short segments.";
      }
      if (milestone === "who-was-that") {
        return choice === "brush"
          ? "The player brushes it off. It does not sit well with them: 2 to 4 short segments."
          : accepted
            ? "The player tells them who it was, and they believe it; it settles, a little embarrassed: 2 to 4 short segments."
            : "The player tells them who it was, and it does not quite convince them: 2 to 4 short segments.";
      }
      if (milestone === "open-offer") {
        return choice === "yes"
          ? "The player says yes: from now on both of them can see other people. How they take it: 2 to 4 short segments."
          : "The player says no. They take it easily, true to who they are: 2 to 4 short segments.";
      }
      if (milestone === "ice-over") {
        return accepted
          ? "It is talked over, and it eases between them: 2 to 4 short segments."
          : "They talk, but it is not quite over for them yet: 2 to 4 short segments.";
      }
      if (milestone === "surprise") {
        return "The player takes the surprise, and the talk goes on, warmer: 2 to 4 short segments.";
      }
      if (milestone === "party-first") {
        return "The doorbell goes again in a moment: the others are arriving, and they react to that, true to who they are: 2 to 4 short segments.";
      }
      if (milestone === "party-invite" && scene.about?.plan && scene.about.plan.at < life.minutes) {
        return "The party already happened; they only mention it in passing: 2 to 4 short segments.";
      }
      if (milestone === "party-invite") {
        return accepted
          ? "The player says they will be there. They are glad, true to who they are: 2 to 4 short segments."
          : "The player says they cannot make it. They take it as they would: 2 to 4 short segments.";
      }
      if (milestone === "party-crush") {
        return choice === "cheer"
          ? "The player cheers them on. They light up, true to who they are: 2 to 4 short segments."
          : "The player teases them about it. They take it their way, a little flustered: 2 to 4 short segments.";
      }
      if (milestone === "party-fight") {
        return choice === "calm"
          ? "The player calms things down. They cool off, in their own way: 2 to 4 short segments."
          : choice === "side"
            ? "The player takes their side. They take it gratefully, still a little heated: 2 to 4 short segments."
            : "The player asks the other one to leave. They react to that, true to who they are: 2 to 4 short segments.";
      }
      if (milestone === "party-stay") {
        return choice === "yes"
          ? "The player says yes, they can stay the night. They are glad, true to who they are: 2 to 4 short segments."
          : "The player says not tonight. They take it easily and get ready to go home later: 2 to 4 short segments.";
      }
      if (milestone === "party-crasher") {
        return choice === "welcome"
          ? "The player welcomes the friend they brought. They are relieved and grateful: 2 to 4 short segments."
          : "The player asks the friend they brought to leave. They take it as they would, a little embarrassed: 2 to 4 short segments.";
      }
      if (milestone === "party-arrive") {
        return "They let the player in: the music, the others, the party takes them in. 2 to 4 short segments.";
      }
      if (milestone === "party-goodbye") {
        return "They say goodbye at the door, true to who they are, and the player heads home into the night. Nobody else leaves with the player. 2 to 4 short segments.";
      }
      if (milestone === "party-hit-off") {
        return choice === "cheer"
          ? "The player cheers them on. They light up, true to who they are: 2 to 4 short segments."
          : choice === "tease"
            ? "The player teases them about it. They take it their way, a little flustered: 2 to 4 short segments."
            : "The player leaves them to it. They go back to the party, still smiling: 2 to 4 short segments.";
      }
      if (milestone === "party-row") {
        return choice === "calm"
          ? "The player calms things down. They cool off, in their own way: 2 to 4 short segments."
          : choice === "side"
            ? "The player takes their side. They take it gratefully, still a little heated: 2 to 4 short segments."
            : "The player stays out of it. They take that as they would, and the party goes on around them: 2 to 4 short segments.";
      }
      if (milestone === "party-drunk") {
        return choice === "care"
          ? "The player looks after them: some water, somewhere to sit for a bit. They are grateful, in their own way: 2 to 4 short segments. Nothing more happens."
          : "The player lets it be. They wander back into the party: 2 to 4 short segments.";
      }
      if (milestone === "party-toast") {
        return choice === "words"
          ? "They raise the toast, and the player says a few words too; everyone raises their glass: 2 to 4 short segments."
          : "They raise the toast and the player raises their glass with everyone: 2 to 4 short segments.";
      }
      if (milestone === "mate-in") {
        return accepted
          ? "It is settled: they are moving in with the player, as housemates. They react, true to who they are, and the talk goes on about how it will be: 2 to 4 short segments."
          : scene.by === "them"
            ? "The player says not now. They take it as they would: 2 to 4 short segments."
            : "They would rather not move in, and say so in their own words, kindly: 2 to 4 short segments.";
      }
      if (milestone === "mate-out") {
        return choice === "go"
          ? "They are moving out. How they take it, true to who they are: 2 to 4 short segments."
          : "The player takes it back: they stay. How they take that: 2 to 4 short segments.";
      }
      if (milestone === "mate-moment") {
        return `The player's call: ${(Object.values(MATE_MOMENTS[scene.about?.kind]?.calls ?? {})[choice === "a" ? 0 : 1]?.label ?? "").toLowerCase()}. They react, true to who they are, and it goes on from there, easy: 2 to 4 short segments.`;
      }
      if (milestone === "drop-by") {
        return choice === "stay"
          ? "The player has them stay a while: they settle in, glad, true to who they are: 2 to 4 short segments."
          : "The player keeps it short. They take it easily and say they will see the player soon: 2 to 4 short segments.";
      }
      if (milestone === "money-help") {
        return choice === "take"
          ? "The player takes the loan. How they take the thanks, true to who they are: 2 to 4 short segments."
          : "The player thanks them, but says no. They take it as they would: 2 to 4 short segments.";
      }
      if (milestone === "missed-you") {
        return choice === "stay"
          ? "The player stays with them a while, and it makes their day: 2 to 4 short segments."
          : "The player says they are busy. They take it as they would, a little hurt: 2 to 4 short segments.";
      }
      if (milestone === "open-them") {
        return accepted
          ? "The player says yes: they can see that person. How they take it: 2 to 4 short segments."
          : "The player says no. They take it as they would: 2 to 4 short segments.";
      }
      if (milestone === "open-ask") {
        return accepted
          ? "They agree: the player can see that person too. How they say it, true to who they are: 2 to 4 short segments."
          : "They say no, in their own words: 2 to 4 short segments.";
      }
      if (milestone === "friend-opinion") {
        return opinionWhat(life, scene, choice);
      }
      if (milestone === "see-ring") {
        return choice === "show"
          ? "The player shows it off and tells them everything, how it happened. They react, happy for them, true to who they are: 2 to 4 short segments."
          : "The player keeps it simple. They are happy for them all the same, in their own way: 2 to 4 short segments.";
      }
      if (milestone === "their-confess") {
        return accepted
          ? "The player says yes: from now on they are dating. They react, true to who they are, and the talk goes on: 2 to 4 short segments."
          : "The player says not yet. It hurts, and they take it in their own way; the talk goes on, a little awkward: 2 to 4 short segments.";
      }
      if (milestone === "marry-ask") {
        return accepted
          ? "They agree: the player can marry that person too, one day. How they say it, true to who they are: 2 to 4 short segments."
          : "They say no: not that, not now. In their own words: 2 to 4 short segments.";
      }
      if (milestone === "jealous") {
        let outcome = jealousOutcome(life, scene, choice, accepted);
        return outcome.ends
          ? "It is over: they end the relationship, in their own words: 2 to 4 short segments."
          : choice === "deny"
            ? outcome.believed
              ? "The player denies it, and they believe it, for now: 2 to 4 short segments."
              : "The player denies it, and they know it is a lie: 2 to 4 short segments of how that lands."
            : choice === "apologize"
              ? accepted
                ? "The player apologizes; they take it, still hurt, and it stays between them: 2 to 4 short segments."
                : "The player apologizes, but it does not reach them yet: 2 to 4 short segments."
              : accepted
                ? "The player explains, and they listen: 2 to 4 short segments."
                : "The player explains, and it does not convince them: 2 to 4 short segments.";
      }
      if (milestone === "partners-meet") {
        return choice === "short"
          ? "The player keeps it short: they all say hello and go on with their day; the real meeting is another day. 1 to 3 short segments."
          : choice === "flow"
            ? "The player lets them find their own way: each of them is who they are with the others, warm or guarded. 2 to 4 short segments. Nobody breaks up."
            : partnersWon(life, scene, choice)
              ? "The player brings them together, and it works: the ice breaks between them. 2 to 4 short segments, each true to who they are."
              : "The player tries to bring them together, and it doesn't come off: awkward, a little tense. 2 to 4 short segments. Nobody breaks up.";
      }
      if (milestone === "meet-ask") {
        return choice === "yes"
          ? "The player says yes: they will meet. They are glad, in their own way, and will set when and where themselves. 2 to 4 short segments."
          : "The player says not yet. They take it as they would: 2 to 4 short segments.";
      }
      if (["partners-tease", "partners-compete", "partners-argue", "partners-plan"].includes(milestone)) {
        let otherName = characterOf(life, scene.about?.with)?.name ?? "the other one",
          reactLine = `${characterName} and ${otherName} react to it, each true to who they are: 2 to 4 short segments. The scene does not end here: the talk goes on after it.`,
          won =
            choice === "turn" || choice === "share"
              ? partnersWon(life, scene, "bring")
              : choice === "calm"
                ? partnersWon(life, scene, "calm")
                : null;
        if (milestone === "partners-tease") {
          return choice === "turn"
            ? `The player turns the teasing back on the two of them${won ? ", and it lands: now they are the ones laughing at themselves" : ", and it falls flat: they laugh even harder at the player"}. ${reactLine}`
            : `The player laughs along with them. ${reactLine}`;
        }
        if (milestone === "partners-compete") {
          return choice === "share"
            ? `The player tries to make room for both of them${won ? ", and it works: nobody feels left out" : ", and it doesn't: both feel it was not enough"}. ${reactLine}`
            : `The player goes to ${choice === "a" ? characterName : otherName}; ${choice === "a" ? otherName : characterName} notices. ${reactLine}`;
        }
        if (milestone === "partners-argue") {
          return choice === "calm"
            ? `The player tries to calm them down${won ? ", and it works: the argument cools off" : ", and it makes it worse: both end up a little upset with the player too"}. ${reactLine}`
            : `The player takes ${choice === "a" ? characterName : otherName}'s side; ${choice === "a" ? otherName : characterName} takes it badly. ${reactLine}`;
        }
        let planFits = groupPlanFits(life, scene.about?.plan, [scene.characterId, scene.about?.with]);
        return choice === "yes"
          ? planFits
            ? `The player says yes to the plan of the three of them. ${reactLine}`
            : `The player says yes, but the plan cannot happen any more: that day or hour no longer works. ${reactLine}`
          : `The player says not this time to the plan. ${reactLine}`;
      }
      if (milestone === "her-or-me") {
        let otherName = characterOf(life, scene.about?.with)?.name ?? "the other one";
        return choice === "her"
          ? `The player chooses them: the player will end things with ${otherName}. How they take it: 2 to 4 short segments.`
          : choice === "other"
            ? `The player chooses ${otherName}. It is over between them: they end it, in their own words. 2 to 4 short segments.`
            : choice === "calm"
              ? partnersWon(life, scene, "calm")
                ? "The player calms them down, and it holds, for now: they let it go, with something left unsaid. 2 to 4 short segments."
                : "The player tries to calm them down, and it doesn't work: it is over, they end it in their own words. 2 to 4 short segments."
              : herOrMeLeaves(life, scene.characterId)
                ? "The player refuses to choose. It is over: they leave, in their own words. 2 to 4 short segments."
                : "The player refuses to choose. They stay, but it costs them a lot, and it shows. 2 to 4 short segments.";
      }
      if (milestone === "propose") {
        let goesOn = " The scene does not end here: the talk goes on after it.";
        return scene.by === "them"
          ? choice === "wait"
            ? `The player tells them not yet. It hurts, and they show it true to who they are: 2 to 4 short segments.${goesOn}`
            : `The player says yes. How it happens, the ring on the player's finger: 2 to 4 short segments.${goesOn}`
          : choice === "wait"
            ? "The player lets the moment pass: the ring stays hidden. 2 to 4 short segments, and they never know."
            : accepted
              ? `They say yes, in their own way: how it happens, the ring on their finger: 2 to 4 short segments.${goesOn}`
              : `They say not yet: they love the player, they are not there yet, and they say it in their own words, kindly. 2 to 4 short segments.${goesOn}`;
      }
      if (milestone === "birthday-surprise") {
        return choice === "yes"
          ? "The player says yes to their plan for tonight, their birthday: it is on. How they take it: 2 to 4 short segments."
          : "The player would rather another night. They take it as they would, true to who they are: 2 to 4 short segments.";
      }
      if (milestone === "birthday-invite") {
        return choice === "yes"
          ? "The player says yes: they will be at the party. How they take it: 2 to 4 short segments."
          : "The player says they can't make it. They take it as they would, true to who they are: 2 to 4 short segments.";
      }
      if (milestone === "ask-you-out" || milestone === "their-plan") {
        return choice === "yes"
          ? accepted
            ? "The player says yes to the plan: it is on. How they take it: 2 to 4 short segments."
            : "The player says yes, but the plan cannot happen any more: that day or hour no longer works. They see it too, and it is left for another time: 2 to 4 short segments."
          : choice === "other"
            ? "The player would like to, but another day or hour: they will set it together. 2 to 4 short segments."
            : "The player says not this time. They take it as they would: 2 to 4 short segments.";
      }
      if (milestone === "ask-plan" && choice === "step") {
        let verdict = askPlanVerdict(life, scene);
        return accepted
          ? "They say yes to the plan, in their own way: 2 to 4 short segments; it is on."
          : verdict.answer === "counter"
            ? `They would like to, but they cannot then (${verdict.why}); they say so: 2 to 4 short segments.`
            : `They say no, in their own way (${verdict.why}): 2 to 4 short segments.`;
      }
      return choice === "wait"
        ? scene.by === "them"
          ? "The player says not yet. They take it as they would: 2 to 4 short segments, and it stays possible."
          : "The player lets it be for now. 2 to 4 short segments; it stays possible."
        : accepted
          ? milestone === "move-in"
            ? `They say yes: ${choice === "theirs" ? `the player moves in with ${characterName}` : `${characterName} moves in with the player`}. 2 to 4 short segments.`
            : scene.by === "them"
              ? "The player says yes. 2 to 4 short segments of how it happens."
              : "They say yes, in their own way: 2 to 4 short segments of how it happens."
          : "They say not yet, because this scene went badly. They give that reason in their own words and leave the door open: 2 to 4 short segments.";
    }
    router.post(
      "/lives/:id/scene/decide",
      route(
        lifeRoute(async (life, req) => {
          let choice = req.body?.choice,
            noLines = req.body?.noLines === true,
            owner = moduleOwningScene(life, life.scene);
          if (owner?.sceneDecide && !life.scene?.done) {
            let moduleReply = await owner.sceneDecide(moduleContext, life, moduleState(life, owner.id), choice, {
              noLines: noLines,
            });
            if (moduleReply) {
              return moduleReply;
            }
          }
          if (life.scene?.kind === "milestone") {
            let scene2 = life.scene,
              result2 = milestoneVerdict(life, choice);
            if (!result2.ok) {
              throw httpError(400, result2.reason);
            }
            let character2 = dressed(life, characterOf(life, scene2.characterId)),
              context2 = sceneBrief(life, character2, scene2),
              resultBeat = scene2.beats?.find((beat) => beat.type === "result") ?? null,
              wantsPicture2 =
                keyImagesOn(life) &&
                !!resultBeat?.keyImage &&
                (resultBeat.keyImage !== "accepted" || result2.accepted) &&
                choice !== "wait",
              what = decisionWhat(scene2, choice, result2.accepted, character2.name, life),
              written2 = noLines
                ? emptyLines
                : await askModel(life.id, "The moment could not be written", async (signal) => {
                    let picture = wantsPicture2 ? await pictureBrief(life, scene2, signal) : false,
                      extra =
                        scene2.milestone === "the-dream-date"
                          ? {
                              key: "dream",
                              shape: '{"text":"\u2026","place":"\u2026","time":"\u2026","gift":"\u2026"}',
                              ask: [
                                `\`dream\`: their dream date as they described it in this scene. \`text\`: one or two sentences from their side, at most 240 characters, in ${context2.language}.`,
                                `\`place\`: exactly one of ${DREAM_DATE_PLACES.map((placeId) => `${placeId} (${life.town.places.find((place) => place.id === placeId)?.name ?? placeId})`).join(", ")}: the closest to what they described.`,
                                `\`time\`: exactly one of ${DREAM_DATE_TIMES.join(", ")}. \`gift\`: exactly one of ${GIFT_TAGS.join(", ")}: the kind of little gift that would make it perfect for them.`,
                              ].join(" "),
                            }
                          : MILESTONES[scene2.milestone]?.after === true ||
                              (scene2.milestone === "propose" && choice !== "wait")
                            ? {
                                key: "suggestions",
                                shape: '["\u2026","\u2026","\u2026"]',
                                ask: "`suggestions`: three different things the player could say or do next, now that the talk goes on, written as the player, short, each with a different attitude.",
                              }
                            : null;
                    return runTierResult(sceneModel(life, signal), scene2, character2, {
                      ...context2,
                      accepted: result2.accepted,
                      reads: scene2.reads,
                      picture: picture,
                      extra: extra,
                      what: what,
                      unanswered: unansweredPlea(life, "scene", scene2.characterId),
                      each: sceneRememberers(life, scene2),
                    });
                  }),
              settled2 = settleMilestone(life, {
                choice: choice,
                accepted: result2.accepted,
                afterWhat: what,
                ...written2,
              });
            await queueKeyImage(
              life,
              keyImageFor(life, scene2, {
                beat: "result",
                picture: written2.picture,
                label: `${milestoneView(life, scene2).title} \xB7 it happened`,
              }),
            );
            await foldMemories(life, scene2.characterId);
            return {
              decided: choice,
              accepted: result2.accepted,
              events: settled2.events,
            };
          }
          if (choice === "wait") {
            let scene2 = life.scene;
            if (!sceneCallOpen(scene2, "wait")) {
              throw httpError(400, "There is no call to make.");
            }
            let character2 = dressed(life, characterOf(life, scene2.characterId)),
              written2 = noLines
                ? emptyLines
                : await askModel(life.id, "The moment could not be written", (signal) =>
                    runTierResult(sceneModel(life, signal), scene2, character2, {
                      ...sceneBrief(life, character2, scene2),
                      accepted: false,
                      reads: scene2.reads,
                      what: "The player lets the moment pass, for now: nothing is settled, and it stays possible another day. They take it as they would, true to who they are: 2 to 4 short segments.",
                      unanswered: unansweredPlea(life, "scene", scene2.characterId),
                      each: sceneRememberers(life, scene2),
                    }),
                  ),
              result2 = putOffTierEvent(life, written2);
            if (!result2.ok) {
              throw httpError(400, result2.reason);
            }
            await foldMemories(life, scene2.characterId);
            return {
              decided: "wait",
            };
          }
          if (choice !== "step") {
            throw httpError(400, "Take the step, or leave it for now.");
          }
          let result = canTakeStep(life);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let scene = life.scene,
            character = dressed(life, characterOf(life, scene.characterId)),
            { accepted: accepted, taken = "" } = stepVerdict(life),
            favour = accepted
              ? favourGo(life)
              : {
                  moved: null,
                  events: [],
                };
          if (favour.fainted) {
            return {
              decided: "step",
              accepted: false,
              events: favour.events,
            };
          }
          if (favour.moved) {
            await queueBackgroundsHere(life);
          }
          let context = {
              ...sceneBrief(life, character, scene),
              favourAt: favour.moved?.name ?? "",
            },
            nextBeat = scene.beats?.[(scene.beat ?? 0) + 1] ?? null,
            wantsPicture = keyImagesOn(life) && !!nextBeat?.keyImage && (nextBeat.keyImage !== "accepted" || accepted),
            written = noLines
              ? emptyLines
              : await askModel(life.id, "The moment could not be written", async (signal) =>
                  runTierResult(sceneModel(life, signal), scene, character, {
                    ...context,
                    accepted: accepted,
                    taken: taken,
                    reads: scene.reads,
                    unanswered: unansweredPlea(life, "scene", scene.characterId),
                    picture: wantsPicture ? await pictureBrief(life, scene, signal) : false,
                    each: sceneRememberers(life, scene),
                  }),
                ),
            settled = settleTierEvent2(life, {
              accepted: accepted,
              taken: taken,
              ...written,
            });
          await queueKeyImage(
            life,
            keyImageFor(life, scene, {
              beat: "result",
              picture: written.picture,
              label: `${tierStepMoment(scene.axis, scene.tier, scene.couple)?.title ?? "A step"} \xB7 it happened`,
            }),
          );
          await foldMemories(life, scene.characterId);
          return {
            decided: "step",
            accepted: accepted && !settled.fainted,
            events: [...favour.events, ...settled.events],
            ...(favour.moved && !settled.fainted
              ? {
                  moved: favour.moved,
                }
              : {}),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/scene/end",
      route(
        lifeRoute(async (life, req) => {
          let scene = life.scene,
            pleaSeen = req.body?.pleaSeen !== false,
            owner = moduleOwningScene(life, scene);
          if (owner?.sceneEnd && scene && !scene.done) {
            let moduleReply = await owner.sceneEnd(moduleContext, life, moduleState(life, owner.id));
            if (moduleReply) {
              return moduleReply;
            }
          }
          let goodbye = null;
          if (
            scene &&
            !scene.done &&
            (!isEventRun(scene) || scene.after) &&
            scene.phase !== "tonight" &&
            req.body?.noLines !== true
          ) {
            let character = dressed(life, characterOf(life, scene.characterId));
            goodbye = await askModel(life.id, "They could not say goodbye", (signal) =>
              runSceneGoodbye(sceneModel(life, signal), scene, character, {
                ...sceneBrief(life, character, scene),
                unanswered: unansweredPlea(life, "scene", scene.characterId, {
                  end: pleaSeen,
                }),
                each: sceneRememberers(life, scene),
              }),
            );
          }
          let result = endSceneEarly(life, goodbye, {
            pleaSeen: pleaSeen,
          });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          if (scene && currentEventBeat(scene)?.type === "moment") {
            let call = startCall(life.id),
              pictureIds;
            try {
              pictureIds = await runMoment(life, scene, call);
            } finally {
              call.done();
            }
            for (let pictureId of pictureIds) {
              await queueKeyImage(life, pictureId);
            }
          }
          if (scene?.done) {
            await foldMemories(life, scene.characterId);
          }
          return {
            ended: true,
            remembered: !!goodbye?.remember,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/scene/close",
      route(
        lifeRoute(async (life, req) => {
          if (life.scene?.done) {
            let after = life.scene.after,
              characterId = life.scene.characterId,
              fainted = life.scene.endedBy === "fainted";
            life.scene = null;
            life.stats = {
              ...(life.stats ?? {}),
              scenes: (life.stats?.scenes ?? 0) + 1,
            };
            let partyEvents = duePartyEndEvents(life, {
              closedWith: characterId,
            });
            if (partyEvents.length) {
              return {
                closed: true,
                events: partyEvents,
              };
            }
            if (after === "wedding") {
              let events = [];
              honeymoonStarts(life, events);
              return {
                closed: true,
                events: events,
              };
            }
            if (life.afterWedding && !life.outing && characterId === life.afterWedding.characterId) {
              if (fainted) {
                let events = [];
                honeymoonStarts(life, events, {
                  fainted: true,
                });
                return {
                  closed: true,
                  events: events,
                };
              }
              if (req.body?.noLines === true) {
                return {
                  closed: true,
                  events: weddingMorningQuiet(life),
                };
              }
              let morning = await writeMorningAfter(life);
              if (morning) {
                return {
                  closed: true,
                  morning: !morning.quiet,
                  events: morning.events,
                };
              }
            }
            if (life.outing?.night) {
              return {
                closed: true,
                events: tripNightOver(life),
              };
            }
          }
          return {
            closed: true,
          };
        }),
      ),
    );
    if (testing) {
      router.post(
        "/lives/:id/advance",
        route(
          lifeRoute(async (life, req) => {
            let minutes = Math.max(0, Math.min(1440, Number(req.body?.minutes) || 0)),
              advanced = advanceTime(life, minutes);
            return {
              waited: minutes,
              events: advanced.events,
            };
          }),
        ),
      );
    }
    router.get(
      "/lives/:id/scene/:character",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          context = sceneContext(life, req.params.character);
        if (!context) {
          throw httpError(404, "You do not know them.");
        }
        return {
          scene: context,
        };
      }),
    );
    router.get(
      "/image-prompts",
      route(async () => {
        let overrides = (await findSingletonDoc(imagePromptsDocKind))?.data?.overrides ?? {};
        return {
          defaults: DEFAULT_IMAGE_PROMPTS,
          overrides: cleanImagePromptOverrides(overrides),
        };
      }),
    );
    router.post(
      "/image-prompts",
      route(async (req) => {
        let overrides = cleanImagePromptOverrides(req.body?.overrides ?? {});
        await updateSingleton(
          imagePromptsDocKind,
          () => ({
            overrides: {},
          }),
          (doc) => {
            doc.overrides = overrides;
          },
        );
        imagePromptsCache = null;
        return {
          defaults: DEFAULT_IMAGE_PROMPTS,
          overrides: overrides,
        };
      }),
    );
    router.post(
      "/lives/:id/image-prompts/preview",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          styles = await engineClient.styleProfiles().catch(() => ({
            profiles: [],
            defaultId: "",
          })),
          profileFor = (profileId) =>
            styles.profiles.find((profile) => profile.id === profileId) ??
            styles.profiles.find((profile) => profile.id === styles.defaultId) ??
            {},
          entries = (life.album ?? []).filter((entry2) => entry2.picture?.prompt && !keyImageAside(life, entry2)),
          entry = entries.find((candidate) => candidate.id === req.body?.entry) ?? entries.at(-1) ?? null;
        return {
          ...imagePromptsPreview({
            prompts: imagePromptsWithOverrides(req.body?.overrides ?? {}),
            town: profileFor(life.look?.styleProfileId),
            images: profileFor(imageChoice(life).styleProfileId),
            townTags: life.look?.tags ?? "",
            key: String(req.body?.key ?? "park|day"),
            you: {
              ...figuresOf(life, [])[0],
              name: life.persona?.name ?? "",
              sex: pictureSexOf(life, genderOf(life, "you") ?? figuresOf(life, [])[0]?.sex ?? ""),
            },
            entry: entry,
            people: entry
              ? picturePeople(life, entry.cast ?? [], {
                  you: !entry.noYou,
                })
              : [],
          }),
          entries: entries.map((entry2) => entry2.id),
        };
      }),
    );
    router.get(
      "/lives/:id/album",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        await loadPaintJobs();
        return {
          album: albumOf(life),
          keyImages: keyImagesOn(life),
          paint: paintQueueStatus(life),
        };
      }),
    );
    router.post(
      "/lives/:id/album/:entry/redo",
      route(async (req) => {
        let { result: result, life: savedLife } = await withLife(req.params.id, (draft) =>
          keyImageAside(draft, albumEntryById(draft, req.params.entry))
            ? {
                ok: false,
                reason: "That picture is not in this life.",
              }
            : requeueAlbumEntry(draft, req.params.entry),
        );
        if (!result.ok) {
          throw httpError(400, result.reason);
        }
        await queueKeyImage(savedLife, req.params.entry, {
          asked: true,
        });
        return {
          album: albumOf(savedLife),
          paint: paintQueueStatus(savedLife),
        };
      }),
    );
    router.post(
      "/lives/:id/album/:entry/pick",
      route(async (req) => {
        let { result: result, life: savedLife } = await withLife(req.params.id, (draft) =>
          keyImageAside(draft, albumEntryById(draft, req.params.entry))
            ? {
                ok: false,
                reason: "That picture is not in this life.",
              }
            : pickAlbumVersion(draft, req.params.entry, req.body?.version),
        );
        if (!result.ok) {
          throw httpError(400, result.reason);
        }
        return {
          album: albumOf(savedLife),
        };
      }),
    );
    router.post(
      "/lives/:id/sheet/:character/figure",
      route(
        lifeRoute(async (life, req) => {
          let result = setFigure(life, req.params.character, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            figure: result.figure,
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    let shopMode = (mode) => (mode === "online" ? "online" : "store");
    function shopReply(life, mode) {
      let result = shopFor(life, shopMode(mode));
      if (!result.ok) {
        throw httpError(400, result.reason);
      }
      return {
        shop: {
          ...result,
          counter: result.mode === "store" ? counterView(life) : null,
        },
      };
    }
    router.get(
      "/lives/:id/shop/:mode",
      route(async (req) => shopReply(await loadLife(req.params.id), req.params.mode)),
    );
    router.post(
      "/lives/:id/shop/:mode/open",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        writeNewArrivals(life.id);
        return shopReply(life, req.params.mode);
      }),
    );
    router.post(
      "/lives/:id/buy",
      route(
        lifeRoute(async (life, req) => {
          let mode = shopMode(req.body?.mode),
            till = mode === "store" ? payLine(life) : null,
            discount =
              mode === "store"
                ? discountHere(life)
                : {
                    off: 0,
                  },
            result = buyShopItems(life, req.body?.lines, {
              mode: mode,
              sendHome: !!req.body?.sendHome,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          let shop = shopFor(life, mode);
          return {
            bought: {
              total: result.total,
              online: result.online,
              tonight: result.tonight,
              when: result.when,
              at: result.at,
              sentHome: result.sentHome,
              minutes: result.minutes,
              off: discount.off,
              till: till,
            },
            events: result.events,
            shop: shop.ok
              ? {
                  ...shop,
                  counter: mode === "store" ? counterView(life) : null,
                }
              : null,
            things: thingsView(life),
          };
        }),
      ),
    );
    router.get(
      "/lives/:id/things",
      route(async (req) => ({
        things: thingsView(await loadLife(req.params.id)),
      })),
    );
    router.post(
      "/lives/:id/things/open",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        if (pictures && isClothesRuleOn(life) && imageChoice(life).connectionId) {
          let missing = life.things.closet.filter(
            (itemId) =>
              itemId !== "own" &&
              itemDef(life.things, itemId)?.kind === "clothes" &&
              !life.clothes.pics?.[itemId] &&
              !life.clothes.failed?.[itemId],
          );
          if (missing.length) {
            queueOutfits(life, missing).catch((err) =>
              serviceLogger?.warn?.(`[${ID}] outfits for the closet: ${err.message}`),
            );
          }
        }
        return {
          things: thingsView(life),
        };
      }),
    );
    function rackReply(life) {
      let result = clothesRackView(life);
      if (!result.ok) {
        throw httpError(400, result.reason);
      }
      let paint = paintQueueStatus(life).outfits;
      return {
        ...result,
        paint: {
          ...paint,
          ready: result.outfits.filter((outfit) => outfit.pic).length,
        },
        counter: counterView(life),
        fitting: fittingView(life),
        fittingWho: fittingWho(life),
      };
    }
    let rackIfOpen = (life) => (clothesRackView(life).ok ? rackReply(life) : null);
    router.get(
      "/lives/:id/rack",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        await loadPaintJobs();
        return {
          rack: rackReply(life),
        };
      }),
    );
    router.post(
      "/lives/:id/rack/open",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        if ((await loadPaintJobs(), pictures && isClothesRuleOn(life) && imageChoice(life).connectionId)) {
          let missing = outfitsToPaint(life, life.at).filter((itemId) => !life.clothes.failed?.[itemId]);
          if (missing.length) {
            await queueOutfits(life, missing);
          }
        }
        return {
          rack: rackReply(life),
        };
      }),
    );
    router.post(
      "/lives/:id/rack/buy",
      route(
        lifeRoute(async (life, req) => {
          await loadPaintJobs();
          let till = payLine(life),
            discount = discountHere(life).off,
            result = buyOutfit(life, req.body?.item, {
              wear: !!req.body?.wear,
            });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            bought: {
              name: result.name,
              total: result.total,
              minutes: result.minutes,
              wore: result.wore,
              off: discount,
              till: till,
              item: req.body?.item,
            },
            rack: rackIfOpen(life),
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/rack/try",
      route(
        lifeRoute(async (life, req) => {
          await loadPaintJobs();
          let result = tryOn(life, String(req.body?.item ?? ""));
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            tried: {
              minutes: result.minutes,
            },
            rack: rackIfOpen(life),
            events: result.events,
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/rack/try/lines",
      route(
        lifeRoute(async (life) => {
          await loadPaintJobs();
          let talk = fittingTalk(life);
          if (!talk) {
            return {
              rack: rackIfOpen(life),
            };
          }
          let lines = {},
            problem = "";
          try {
            lines = await askModel(life.id, "They could not say what they think", (signal) =>
              writeFittingLines(
                modelFor(life, {
                  signal: signal,
                }),
                {
                  ...talk,
                  people: talk.people.map((person) => ({
                    ...person,
                    character: dressed(life, person.character),
                    tone: bondSummary(person.bond).archetype.tone,
                  })),
                  player: life.persona?.name || "the player",
                  language: life.settings?.language ?? DEFAULT_LANGUAGE,
                  setting: settingNoteFor(life),
                },
              ),
            );
          } catch (err) {
            if (err.statusCode !== 502) {
              throw err;
            }
            problem = err.message;
          }
          setFittingLines(life, lines);
          return {
            rack: rackReply(life),
            lineProblem: problem,
          };
        }),
      ),
    );
    router.get(
      "/lives/:id/counter",
      route(async (req) => ({
        counter: counterView(await loadLife(req.params.id)),
      })),
    );
    router.post(
      "/lives/:id/rack/paint",
      route(async (req) => {
        let itemId = String(req.body?.item ?? ""),
          { life: savedLife } = await withLife(req.params.id, (draft) => {
            if (!isClothesRuleOn(draft) || !itemDef(draft.things, itemId)) {
              throw httpError(400, "There is no picture like that to paint.");
            }
            if (draft.clothes?.failed) {
              delete draft.clothes.failed[itemId];
            }
            if (draft.clothes?.pics?.[itemId]?.own) {
              delete draft.clothes.pics[itemId];
            }
          });
        await queueOutfits(savedLife, [itemId], {
          asked: true,
        });
        return {
          rack: clothesRackView(savedLife).ok ? rackReply(savedLife) : null,
          things: thingsView(savedLife),
        };
      }),
    );
    router.post(
      "/lives/:id/clothes/split",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          persona =
            (life.persona?.id ? await engineClient.persona(life.persona.id).catch(() => null) : null) ??
            life.persona ??
            {},
          look = String(persona.appearance || persona.description || "");
        return {
          split: await askModel(life.id, "The model could not split your look", (signal) =>
            splitCharacterLook(
              modelFor(life, {
                signal: signal,
              }),
              look,
              {
                name: persona.name ?? "",
              },
            ),
          ),
          empty: !look.trim(),
        };
      }),
    );
    router.post(
      "/lives/:id/clothes",
      route(
        lifeRoute(async (life, req) => {
          let result = setPersonaClothes(life, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            clothes: {
              on: result.on,
            },
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/things",
      route(
        lifeRoute(async (life, req) => {
          let startMinutes = life.minutes,
            skillsBefore = skillSnapshot(life),
            result = useThing(life, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            done: {
              did: result.did ?? req.body?.action,
              name: result.name ?? "",
              gains: result.gains ?? null,
              minutes: result.minutes ?? 0,
              from: startMinutes,
              n: result.n ?? 1,
              to: result.to ?? null,
              ...(result.did === "read"
                ? {
                    skills: skillChanges(life, skillsBefore),
                  }
                : {}),
              ...(result.did === "cook"
                ? {
                    recipe: result.recipe,
                    quality: result.quality,
                    dish: result.dish,
                    portions: result.portions,
                    eat: result.eat,
                    levelled: result.levelled ?? [],
                  }
                : {}),
              ...(result.wellFed
                ? {
                    wellFed: result.wellFed,
                  }
                : {}),
            },
            events: result.events ?? [],
            things: thingsView(life),
          };
        }),
      ),
    );
    router.get(
      "/lives/:id/you",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        return {
          you: youView(life),
        };
      }),
    );
    router.get(
      "/lives/:id/cast/:character/traits",
      route(async (req) => {
        let life = await loadLife(req.params.id);
        if (!life.bonds?.[req.params.character]) {
          throw httpError(404, "Nobody by that name in this life.");
        }
        let character = characterOf(life, req.params.character);
        return {
          traits: traitsOf(life, req.params.character),
          thing: theirThingFor(character, life.bonds[req.params.character]),
          catalog: traitsCatalog(),
        };
      }),
    );
    router.get(
      "/lives/:id/sheet/:character",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          sheet = characterSheet2(life, req.params.character);
        if (!sheet) {
          throw httpError(404, "Nobody by that name in this life.");
        }
        return {
          sheet: sheet,
        };
      }),
    );
    router.post(
      "/lives/:id/sheet/:character/memory",
      route(
        lifeRoute(async (life, req) => {
          let { action: action, memory: memoryId, text: text } = req.body ?? {},
            withId = req.body?.with ? String(req.body.with) : "",
            result = withId
              ? editPairMemory(life, req.params.character, withId, {
                  action: action,
                  memory: memoryId,
                  text: text,
                })
              : editMemory2(life, req.params.character, {
                  action: action,
                  memory: memoryId,
                  text: text,
                });
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/sheet/:character/memory-budget",
      route(
        lifeRoute(async (life, req) => {
          let withId = req.body?.with ? String(req.body.with) : "",
            result = withId
              ? editPairMemory(life, req.params.character, withId, {
                  action: "budget",
                  tokens: req.body?.tokens,
                })
              : setMemoryBudget2(life, req.params.character, req.body?.tokens);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/sheet/:character/face",
      route(
        lifeRoute(async (life, req) => {
          let result = setFace(life, req.params.character, req.body ?? {});
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.get(
      "/image-options",
      route(async () => {
        let [connections, styles] = await Promise.all([
          engineClient.imageConnections?.().catch(() => []) ?? [],
          engineClient.styleProfiles?.().catch(() => ({
            defaultId: "",
            profiles: [],
          })) ?? {
            defaultId: "",
            profiles: [],
          },
        ]);
        return {
          connections: connections,
          profiles: styles.profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            promptMode: profile.promptMode,
          })),
          defaultProfile: styles.defaultId,
        };
      }),
    );
    router.get(
      "/lives/:id/backdrop",
      route(async (req) => {
        await loadGallery();
        await loadPaintJobs();
        let life = await loadLife(req.params.id),
          view = viewOfLife(life);
        return {
          backdrop: view.backdrop,
          paint: view.paint,
          scenePictures: life.scene ? (sceneView(life)?.pictures ?? []) : null,
          outingPictures: life.outing ? (outingView(life)?.pictures ?? []) : null,
        };
      }),
    );
    router.get(
      "/lives/:id/look",
      route(
        async (req) => (await loadGallery(), await loadPaintJobs(), backgroundTiles(await loadLife(req.params.id))),
      ),
    );
    router.post(
      "/backdrops/available",
      route(async (req) => {
        let { home = "studio", off = [] } = req.body ?? {},
          keys = neededBackgroundKeys({
            town: buildTown({
              off: Array.isArray(off) ? off : [],
            }),
            wallet: {
              home: home,
            },
          }),
          gallery = await loadGallery();
        return {
          have: keys.filter((key) => galleryVersionsFor(gallery, key).length).length,
          total: keys.length,
        };
      }),
    );
    router.post(
      "/lives/:id/look",
      route(async (req) => {
        let { life: savedLife } = await withLife(req.params.id, (draft) => {
          let look = cleanTownLook(draft.look ?? {}),
            body = req.body ?? {};
          draft.look = cleanTownLook({
            ...look,
            connectionId: body.connectionId !== undefined ? body.connectionId : look.connectionId,
            styleProfileId: body.styleProfileId !== undefined ? body.styleProfileId : look.styleProfileId,
            tags: body.tags !== undefined ? body.tags : look.tags,
          });
        });
        await loadGallery();
        await loadPaintJobs();
        return backgroundTiles(savedLife);
      }),
    );
    router.post(
      "/lives/:id/look/redo",
      route(async (req) => {
        let { key = null, all = false, missing = false } = req.body ?? {},
          keys = [],
          gallery = missing ? await loadGallery() : null,
          { life: savedLife } = await withLife(req.params.id, (draft) => {
            if (((draft.look = cleanTownLook(draft.look ?? {})), !draft.look.connectionId)) {
              throw httpError(400, "Choose an image connection first.");
            }
            let allKeys = backgroundKeysOf(draft);
            if (missing) {
              let paint = paintQueueStatus(draft),
                missingKeys = allKeys.filter(
                  (key2) =>
                    !pickedBackgroundFor(gallery, draft.look, key2) &&
                    paint.painting !== key2 &&
                    !paint.queued.includes(key2),
                );
              for (let key2 of missingKeys) {
                delete draft.look.failed[key2];
              }
              keys = pickLatestBackgrounds(gallery, draft.look, missingKeys);
              return;
            }
            if (((keys = all ? allKeys : allKeys.includes(key) ? [key] : []), !keys.length)) {
              throw httpError(400, "There is no background like that in this town.");
            }
            for (let key2 of keys) {
              delete draft.look.failed[key2];
            }
          });
        await queueBackgrounds(savedLife, keys, {
          asked: true,
        });
        return backgroundTiles(await loadLife(savedLife.id));
      }),
    );
    router.post(
      "/lives/:id/pictures",
      route(
        lifeRoute(async (life, req) => {
          let { system: system, mode: mode } = req.body ?? {};
          if (!PICTURE_KINDS.includes(system) || !["manual", "auto"].includes(mode)) {
            throw httpError(400, "There is no such setting.");
          }
          life.pictures = cleanPictureModes({
            ...life.pictures,
            [system]: mode,
          });
          return {
            pictures: pictureCounts(life),
          };
        }),
      ),
    );
    router.post(
      "/lives/:id/look/pick",
      route(async (req) => {
        let { key: key, version: version } = req.body ?? {};
        await loadGallery();
        let { life: savedLife } = await withLife(req.params.id, (draft) => {
          draft.look = cleanTownLook(draft.look ?? {});
          let versions = galleryVersionsFor(galleryCache, key),
            index = Number(version) - 1;
          if (!versions[index]) {
            throw httpError(400, "That version is not in the library.");
          }
          draft.look.picks[key] = index;
          delete draft.look.own[key];
        });
        await loadPaintJobs();
        return backgroundTiles(savedLife);
      }),
    );
    function checkUpload(dataUrl) {
      if (typeof dataUrl != "string" || dataUrl.length > MAX_PICTURE_DATA_URL_LENGTH) {
        throw httpError(400, "That picture is too big (8 MB at most).");
      }
      let image = parseImageDataUrl(dataUrl);
      if (!image || !["image/png", "image/jpeg", "image/webp"].includes(image.mime)) {
        throw httpError(400, "Only PNG, JPEG or WebP pictures.");
      }
      if (!imageBytesMatchMime(Buffer.from(image.base64.slice(0, 32), "base64"), image.mime)) {
        throw httpError(400, "That file is not a real PNG, JPEG or WebP picture.");
      }
      return image;
    }
    router.post(
      "/lives/:id/look/upload",
      route(async (req) => {
        let { key: key, dataUrl: dataUrl } = req.body ?? {},
          life = await loadLife(req.params.id);
        if (!backgroundKeysOf(life).includes(key)) {
          throw httpError(400, "There is no background like that in this town.");
        }
        let image = checkUpload(dataUrl),
          kept = await engineClient.keep({
            image: {
              ...image,
              ...backgroundSizeOf(life),
            },
            name: key,
            prompt: "the player's own picture",
          }),
          { life: savedLife } = await withLife(req.params.id, (draft) => {
            draft.look = cleanTownLook(draft.look ?? {});
            draft.look.own[key] = {
              url: kept.url,
              ref: `global-gallery:${kept.id}`,
              at: now(),
            };
            delete draft.look.failed[key];
          });
        await loadGallery();
        await loadPaintJobs();
        return backgroundTiles(savedLife);
      }),
    );
    async function keepOwnPicture(life, dataUrl, clean, pictureName) {
      let image = checkUpload(dataUrl),
        kept = await engineClient.keep({
          image: {
            ...image,
            ...portraitSizeOf(life),
          },
          name: pictureName,
          prompt: "the player's own picture",
        }),
        picture = {
          url: kept.url,
          ref: `global-gallery:${kept.id}`,
          own: true,
        };
      return clean && image.mime === "image/png"
        ? {
            ...picture,
            clean: {
              url: kept.url,
              ref: picture.ref,
            },
          }
        : picture;
    }
    async function dropQueued(lifeId, key) {
      await loadPaintJobs();
      let before = paintJobs.length;
      paintJobs = paintJobs.filter((job) => !(job.lifeId === lifeId && job.key === key));
      if (paintJobs.length !== before) {
        await savePaintJobs();
      }
    }
    router.post(
      "/lives/:id/sheet/:character/season/upload",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          characterId = req.params.character,
          season = Number(req.body?.season);
        if (!characterOf(life, characterId)) {
          throw httpError(400, "They are not in this life.");
        }
        if (!Number.isInteger(season) || season < 0 || season > 3) {
          throw httpError(400, "There is no such season.");
        }
        if (!seasonOutfitsEnabled(life)) {
          throw httpError(400, "Switch on \xABSeason outfits\xBB in RULES first.");
        }
        let picture = await keepOwnPicture(
          life,
          req.body?.dataUrl,
          !!req.body?.clear,
          `season-${characterId}-${season}-own`,
        );
        await dropQueued(life.id, `${seasonKeyPrefix}${characterId}|${season}`);
        let { life: savedLife } = await withLife(life.id, (draft) =>
          keepSeasonPicture(draft, characterId, season, picture),
        );
        return {
          sheet: characterSheet2(savedLife, characterId),
        };
      }),
    );
    router.post(
      "/lives/:id/sheet/:character/work/upload",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          characterId = req.params.character;
        if (!characterOf(life, characterId)?.job?.id) {
          throw httpError(400, "They have no job in town.");
        }
        if (!life.rules?.workOutfits) {
          throw httpError(400, "Switch on \xABWork outfits\xBB in RULES first.");
        }
        let picture = await keepOwnPicture(life, req.body?.dataUrl, !!req.body?.clear, `work-${characterId}-own`);
        await dropQueued(life.id, `${workKeyPrefix}${characterId}`);
        let { life: savedLife } = await withLife(life.id, (draft) => keepWorkPicture(draft, characterId, picture));
        return {
          sheet: characterSheet2(savedLife, characterId),
        };
      }),
    );
    router.post(
      "/lives/:id/rack/upload",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          itemId = String(req.body?.item ?? "");
        if (!isClothesRuleOn(life) || !itemDef(life.things, itemId)) {
          throw httpError(400, "There is no outfit like that here.");
        }
        let picture = await keepOwnPicture(life, req.body?.dataUrl, !!req.body?.clear, `outfit-${itemId}-own`);
        await dropQueued(life.id, `${outfitKeyPrefix}${itemId}`);
        let { life: savedLife } = await withLife(life.id, (draft) => keepOutfitPicture(draft, itemId, picture));
        return {
          rack: clothesRackView(savedLife).ok ? rackReply(savedLife) : null,
          things: thingsView(savedLife),
        };
      }),
    );
    router.post(
      "/lives/:id/look/pause",
      route(async (req) => {
        let { life: savedLife } = await withLife(req.params.id, (draft) => {
          draft.look = cleanTownLook(draft.look ?? {});
          draft.look.paused = !!req.body?.on;
        });
        if (!savedLife.look.paused) {
          runPaintQueue();
        }
        await loadGallery();
        await loadPaintJobs();
        return backgroundTiles(savedLife);
      }),
    );
    router.post(
      "/lives/:id/sheet/:character/just-friends",
      route(
        lifeRoute(async (life, req) => {
          let result = setJustFriends(life, req.params.character, req.body?.on);
          if (!result.ok) {
            throw httpError(400, result.reason);
          }
          return {
            sheet: characterSheet2(life, req.params.character),
          };
        }),
      ),
    );
    router.get(
      "/lives/:id/character/:character",
      route(async (req) => {
        let life = await loadLife(req.params.id),
          bond = bondOf(life, req.params.character),
          character = characterOf(life, req.params.character);
        if (!bond || !character) {
          throw httpError(404, "You do not know them.");
        }
        return {
          character: {
            id: character.id,
            name: character.name,
            description: character.description ?? "",
          },
          bond: bondSummary(bond),
          where: whereabouts(life, character.id),
          seen: life.seenSchedule[character.id] ?? {},
        };
      }),
    );
  }
  return {
    routes: registerRoutes,
    readLife: loadLife,
    writeLife: saveLife,
    listLives: listLives,
  };
}

export { CALLS_KEPT, ID, MAX_CAST, SAVES_FROM, VERSION, createService, olderVersion, traitsCatalog };
