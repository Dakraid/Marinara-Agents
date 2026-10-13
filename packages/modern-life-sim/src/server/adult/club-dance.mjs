// Club NPC dancers/regulars lookup, private dance activities and starting/recording a dance
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { BOND_AXES, adjustBondAxis, isRomanceFrozen } from "../relationships/bonds.mjs";
import { createScene } from "../scenes/scene-engine.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { spendMoney } from "../money/wallet.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import {
  bondOf,
  characterOf,
  hasMet2,
  imageChoice,
  isNpc,
  logNote,
  npcsOn,
  sceneBusyReason,
  whoIsHere,
} from "../game.mjs";
import {
  CLUB_DANCE_MILESTONE,
  CLUB_JOB_TITLES,
  CLUB_NPC_ID_PREFIX,
  CLUB_PLACE,
  PRIVATE_DANCE_GAINS,
  PRIVATE_DANCE_OFFER,
  PRIVATE_DANCE_TURNS,
} from "./tuning.mjs";
import { CLUB_REGULAR_ID_PREFIX, clubDarkActive } from "./after-dark.mjs";
import { adultMarkOf, adultNameFor, intimateBondOf } from "./intimate-milestone.mjs";
import { clubStaffList } from "./party-slip-away.mjs";

var clubRegularsList = (adult) => adult?.regulars ?? [];
var clubDancersEnabled = (state, adult) => npcsOn(state) && !!adult?.on && !!adult.youAdult && !!adult.clubDancers;
var clubRegularsEnabled = (state, adult) =>
  npcsOn(state) && !!adult?.on && !!adult.youAdult && !!adult.clubRegulars && !!adult.afterDark;
var findClubNpc = (adult, npcId) =>
  String(npcId).startsWith(CLUB_NPC_ID_PREFIX)
    ? (clubStaffList(adult).find((npc) => npc.id === npcId) ?? null)
    : String(npcId).startsWith(CLUB_REGULAR_ID_PREFIX)
      ? (clubRegularsList(adult).find((npc) => npc.id === npcId) ?? null)
      : null;
var clubNpcEnabled = (state, adult, npcId) =>
  String(npcId).startsWith(CLUB_NPC_ID_PREFIX)
    ? clubDancersEnabled(state, adult)
    : String(npcId).startsWith(CLUB_REGULAR_ID_PREFIX)
      ? clubRegularsEnabled(state, adult)
      : false;
var isHiddenClubNpc = (state, adult, npcId) => !!findClubNpc(adult, npcId) && !clubNpcEnabled(state, adult, npcId);
var activeClubNpc = (state, adult, npcId) => (clubNpcEnabled(state, adult, npcId) ? findClubNpc(adult, npcId) : null);
var isClubNpc = (state, adult, npcId) => !!findClubNpc(adult, npcId);
var clubNpcExtraName = (state, adult, npcId) => (findClubNpc(adult, npcId) ? "someone at the club" : null);
var adultHasNpcs = (state, adult) =>
  clubStaffList(adult).length + clubRegularsList(adult).length > 0 || (!!adult?.on && !!adult.youAdult);
var clubNpcAwaitingSprite = (state, npc) => !npc.avatar && !npc.paintFailed && !!imageChoice(state).connectionId;
var clubNightDayIndex = (minutes) => clockFromMinutes(minutes - CLUB_PLACE.close * 60 - 60).dayIndex;
function clubDancersOnTonight(state, adult) {
  if (!clubDancersEnabled(state, adult)) {
    return [];
  }
  let dayKey = String(clubNightDayIndex(state.minutes)),
    pickDancer = (gender) => {
      let staff = clubStaffList(adult).filter((dancer) => dancer.gender === gender);
      return staff.length
        ? staff[Math.floor(seededRandom(state.seed, "club-staff", gender, dayKey) * staff.length)]
        : null;
    };
  return [pickDancer("female"), pickDancer("male")].filter(Boolean);
}
function privateDanceActivities(state, adult) {
  if (!adult.youAdult) {
    return [];
  }
  if (state.at !== CLUB_PLACE.id || state.visit || !isPlaceOpen(townPlace(state.town, CLUB_PLACE.id), state.minutes)) {
    return [];
  }
  let busyIds = new Set(
    (adult.dark?.list ?? []).filter((entry) => clubDarkActive(state, entry)).map((entry) => entry.a),
  );
  return availableClubDancers(state, adult).map((dancer) => {
    let why = busyIds.has(dancer.id)
      ? "Dancing for someone else right now"
      : state.wallet.cash < PRIVATE_DANCE_OFFER.price
        ? `Not enough money: it's $${PRIVATE_DANCE_OFFER.price}`
        : sceneBusyReason?.(state)
          ? "You are in the middle of a scene"
          : "";
    return {
      id: `${CLUB_DANCE_MILESTONE}:${dancer.id}`,
      name: `A private dance \xB7 ${adultNameFor(state, dancer.id)}`,
      minutes: PRIVATE_DANCE_OFFER.minutes,
      costs: PRIVATE_DANCE_OFFER.price,
      place: CLUB_PLACE.id,
      available: !why,
      why: why,
      ...(isNpc(state, dancer.id)
        ? {
            npc: true,
          }
        : {}),
      route: "adult/dance",
      body: {
        staff: dancer.id,
      },
    };
  });
}
function availableClubDancers(state, adult) {
  return [
    ...whoIsHere(state)
      .map((person) => characterOf(state, person.id))
      .filter(
        (character) =>
          character &&
          !isNpc(state, character.id) &&
          character.job?.place === CLUB_PLACE.id &&
          character.job.title === CLUB_JOB_TITLES.dancer &&
          hasMet2(state, character.id) &&
          adultMarkOf(adult, character.id) === "yes",
      )
      .filter((character) => !bondOf(state, character.id)?.kin),
    ...clubDancersOnTonight(state, adult).filter((dancer) => !clubNpcAwaitingSprite(state, dancer)),
  ];
}
function startPrivateDance(state, adult, dancerId) {
  let dancer = availableClubDancers(state, adult).find((dancer2) => dancer2.id === dancerId);
  if (!dancer) {
    throw Object.assign(new Error("They're not working tonight."), {
      statusCode: 400,
    });
  }
  let activity = privateDanceActivities(state, adult).find((activity2) => activity2.body?.staff === dancerId);
  if (activity && !activity.available && activity.why) {
    throw Object.assign(new Error(`${activity.why}.`), {
      statusCode: 400,
    });
  }
  if (state.at !== CLUB_PLACE.id || !privateDanceActivities(state, adult).length) {
    throw Object.assign(new Error("Only at the Scarlet Club, while it's open."), {
      statusCode: 400,
    });
  }
  if (state.scene) {
    throw Object.assign(
      new Error(state.scene.done ? "Finish what's on screen first." : "You are in the middle of a scene."),
      {
        statusCode: 400,
      },
    );
  }
  if (state.wallet.cash < PRIVATE_DANCE_OFFER.price) {
    throw Object.assign(new Error(`Not enough money: it's $${PRIVATE_DANCE_OFFER.price}.`), {
      statusCode: 400,
    });
  }
  spendMoney(state.wallet, PRIVATE_DANCE_OFFER.price, `${CLUB_PLACE.name} \xB7 a private dance`, state.minutes);
  let scene = createScene({
    kind: "milestone",
    characterId: dancer.id,
    place: state.at,
    at: state.minutes,
    event: CLUB_DANCE_MILESTONE,
  });
  Object.assign(scene, {
    milestone: CLUB_DANCE_MILESTONE,
    by: "you",
    nameKnown: true,
    leavesAt: null,
    max: PRIVATE_DANCE_TURNS,
    about: {
      dance: true,
    },
  });
  state.scene = scene;
  logNote(state, `A private dance with ${dancer.name} at the ${CLUB_PLACE.name}`, "social");
  return scene;
}
var PRIVATE_DANCE_HANDLERS = {
  whyNot: () => `Only at the ${CLUB_PLACE.name}.`,
  options(state, scene) {
    let adultTurn = scene.adult;
    return adultTurn?.passage
      ? adultTurn.options.map((option) => ({
          id: option.key,
          label: option.text,
          ok: true,
          why: "",
          note: "",
          written: true,
        }))
      : [
          {
            id: "yes",
            label: "Go on",
            ok: true,
            why: "",
            note: "",
          },
          {
            id: "wait",
            label: "Stop here",
            ok: true,
            why: "",
            note: "Nothing lost",
          },
        ];
  },
  free: (state, scene) => !!scene.adult?.passage,
  endable: (state, scene) => !!scene.adult?.passage || !!scene.adult?.night,
};
function privateDanceSceneBlocks(state, scene) {
  let dancer = characterOf(state, scene.characterId),
    isNpcDancer = isNpc(state, scene.characterId);
  return {
    system: `Both of them are adults. This is a private dance at the ${CLUB_PLACE.name}, a strip club: ${dancer ? adultNameFor(state, dancer.id) : "the dancer"} dances for the player in a private room, and leads it. It stays a dance, as the club's rules go: it never turns into sex.`,
    user: [
      `WHERE THEY ARE NOW: a private room at the ${CLUB_PLACE.name}, the music low, the two of them alone.`,
      isNpcDancer
        ? `WHO THEY ARE: one of the club's dancers. ${dancer?.trait ?? ""}`.trim()
        : "WHO THEY ARE: they work here as a dancer; tonight the player asked them for a private dance.",
      isNpcDancer
        ? (dancer?.memories ?? []).length
          ? "They know the player only from the club: what they remember of them."
          : "They have never met the player: tonight is the first time."
        : "",
    ].filter(Boolean).join(`
`),
  };
}
var PRIVATE_DANCE_FACT = "dance";
function recordPrivateDance(state, adult, scene) {
  let characterId = scene.characterId,
    bond = bondOf(state, characterId);
  if (!bond) {
    return null;
  }
  let intimateBond = intimateBondOf(adult, characterId),
    first = !intimateBond.danced;
  intimateBond.danced = (intimateBond.danced ?? 0) + 1;
  let before = {
    friendship: bond.friendship,
    romance: bond.romance,
    trust: bond.trust,
  };
  for (let [axis, amount] of Object.entries(first ? PRIVATE_DANCE_GAINS.first : PRIVATE_DANCE_GAINS.again)) {
    if (!(axis === "romance" && isRomanceFrozen(bond))) {
      adjustBondAxis(bond, axis, amount, {
        at: state.minutes,
      });
    }
  }
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round(((scene.totals[axis] ?? 0) + bond[axis] - before[axis]) * 10) / 10;
  }
  recordTownFact(state, PRIVATE_DANCE_FACT, {
    with: characterId,
    place: CLUB_PLACE.id,
    witnesses: [],
  });
  return first ? "FIRST DANCE" : null;
}

export {
  PRIVATE_DANCE_FACT,
  PRIVATE_DANCE_HANDLERS,
  activeClubNpc,
  adultHasNpcs,
  availableClubDancers,
  clubDancersEnabled,
  clubNpcExtraName,
  clubRegularsEnabled,
  clubRegularsList,
  findClubNpc,
  isClubNpc,
  isHiddenClubNpc,
  privateDanceActivities,
  privateDanceSceneBlocks,
  recordPrivateDance,
  startPrivateDance,
};
