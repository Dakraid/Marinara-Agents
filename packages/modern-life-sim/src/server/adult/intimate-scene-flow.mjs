// Driving intimate scenes: passages, stopping, closing lines, night end and scene decide/reply
import { seededRandom } from "../schedule/whereabouts.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { endScene, runTierResult } from "../scenes/scene-engine.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import { addMemory } from "../people/people-sheet.mjs";
import { milestoneView } from "../milestones/milestone-settle.mjs";
import {
  advanceTime,
  bondOf,
  characterOf,
  isNpc,
  keyImageFor,
  keyImagesOn,
  logNote,
  rememberScene,
  rememberersOf,
} from "../game.mjs";
import {
  CLUB_DANCE_MILESTONE,
  CLUB_TALK_CHOICES,
  CLUB_TALK_MILESTONE,
  INTIMATE_MINUTES,
  INTIMATE_PASSAGES_BY_DETAIL,
  PRIVATE_DANCE_OFFER,
  pictureBeatsFor,
} from "./tuning.mjs";
import { timeTogetherLabel } from "./consent.mjs";
import { rollClubDarkOnce } from "./after-dark.mjs";
import {
  adultMarkOf,
  consentFor,
  goTogetherTo,
  livesWithPlayer,
  markArrivedTogether,
  othersHomePrompt,
  othersInScene,
  placesToGoTogether,
  spotPromptFor,
  whoOverheard,
} from "./intimate-milestone.mjs";
import {
  applyChosenIntimateSpot,
  canOfferStayTheNight,
  privateSpotsForGroup,
  stayTheNightWith,
} from "./sleep-together.mjs";
import { specialNightOrigin } from "./intimate-scene-guidance.mjs";
import { finishCaughtIntimacy, finishIntimateNight } from "./intimacy-outcomes.mjs";
import {
  applyIntimacyTook,
  declineIntimacyOutcome,
  drainEnergyForIntimacy,
  intimacyWaysPrompt,
} from "./cast-intimacy.mjs";
import { resolveClubTalk } from "./club-jealousy.mjs";
import { recordPrivateDance } from "./club-dance.mjs";
import { adultHttpError, writeIntimatePassage } from "./intimate-passage.mjs";
import { decidePrivateDance, privateDanceReply } from "./private-dance-flow.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";
import { kinBarsRomance } from "../relationships/kin.mjs";

var MOMENT_PASSES_TEXT =
  "It does not happen after all: the moment passes, and they let it go, true to who they are, in their own words: 2 to 4 short segments.";
async function endIntimacyNotHappening(ctx, state, scene, headline = "Not now.", { noLines = false } = {}) {
  let bond = bondOf(state, scene.characterId);
  if (bond?.asks?.id === INTIMATE_MILESTONE) {
    bond.asks = null;
  }
  let closing = await writeAdultClosing(ctx, state, scene, MOMENT_PASSES_TEXT, {
    noLines: noLines,
    accepted: false,
  });
  closeAdultScene(state, scene, {
    accepted: false,
    remember: closing.remember,
    each: closing.each,
    headline: headline,
    stamp: null,
  });
  for (let id of eventCast(scene)) {
    await ctx.foldAfterScene(state, id);
  }
  return {
    decided: "yes",
    accepted: false,
    done: true,
  };
}
var anyoneRefusesIntimacy = (state, scene) => eventCast(scene).some((id) => consentFor(state, id).how === "no");
function intimacyStopReason(state, adult, scene) {
  if (!adult.youAdult) {
    return "you";
  }
  if (!scene.adult?.dance) {
    return anyoneRefusesIntimacy(state, scene) ? "them" : "";
  }
  let character = characterOf(state, scene.characterId);
  return !character || isNpc(state, character.id)
    ? ""
    : adultMarkOf(adult, character.id) !== "yes" || kinBarsRomance(state, bondOf(state, character.id))
      ? "them"
      : "";
}
var STOP_MIDWAY_TEXTS = {
  night:
    "It stops here, gently, whatever part of it they were in: it ends now. They take it true to who they are, in their own words, and a few lines of the after: 2 to 4 short segments.",
  dance:
    "The dance stops here, before the song is over. They take it true to who they are, in their own words: 2 to 4 short segments.",
};
async function stopIntimacyMidway(ctx, state, adult, scene, reason, { noLines = false } = {}) {
  let adultTurn = scene.adult,
    byThem = reason === "them",
    closing = await writeAdultClosing(
      ctx,
      state,
      scene,
      adultTurn.dance ? STOP_MIDWAY_TEXTS.dance : STOP_MIDWAY_TEXTS.night,
      {
        noLines: noLines,
        accepted: byThem,
      },
    );
  if (adultTurn.dance) {
    closeAdultScene(state, scene, {
      accepted: byThem,
      remember: closing.remember,
      headline: "You stopped it there.",
      stamp: byThem ? recordPrivateDance(state, adult, scene) : null,
    });
  } else if (byThem) {
    closeAdultScene(state, scene, {
      accepted: true,
      remember: closing.remember,
      each: closing.each,
      ...finishIntimateNight(state, adult, scene),
    });
  } else {
    for (let id of eventCast(scene)) {
      let bond = bondOf(state, id);
      if (bond?.asks?.id === INTIMATE_MILESTONE) {
        bond.asks = null;
      }
    }
    closeAdultScene(state, scene, {
      accepted: false,
      remember: closing.remember,
      each: closing.each,
      headline: "It stops here.",
      stamp: null,
    });
  }
  for (let id of eventCast(scene)) {
    await ctx.foldAfterScene(state, id);
  }
  return {
    decided: "on",
    done: true,
  };
}
var joinedOrigin = (scene) =>
  scene.about?.joined
    ? "HOW IT CAME ABOUT: the player had been watching the two of them in secret; they saw the player, and want the player with them."
    : "";
async function finishIntimacyWithoutLines(ctx, state, adult, scene) {
  let adultTurn = scene.adult;
  scene.batch = [];
  if (adultTurn.dance) {
    closeAdultScene(state, scene, {
      accepted: true,
      remember: "",
      headline: "The song is over.",
      stamp: recordPrivateDance(state, adult, scene),
    });
  } else {
    closeAdultScene(state, scene, {
      accepted: true,
      remember: "",
      ...(adultTurn.caught ? finishCaughtIntimacy(state, adult, scene) : finishIntimateNight(state, adult, scene)),
    });
  }
  for (let id of eventCast(scene)) {
    await ctx.foldAfterScene(state, id);
  }
  return {
    decided: "on",
    done: true,
  };
}
async function playIntimatePassage(ctx, state, adult, direction, { noLines = false, own = false } = {}) {
  let scene = state.scene,
    adultTurn = scene.adult,
    stopReason = intimacyStopReason(state, adult, scene);
  if (stopReason && adultTurn.passage) {
    return stopIntimacyMidway(ctx, state, adult, scene, stopReason, {
      noLines: noLines,
    });
  }
  if (stopReason && !adultTurn.dance) {
    return endIntimacyNotHappening(ctx, state, scene, "Not now.", {
      noLines: noLines,
    });
  }
  if (stopReason) {
    return stopIntimacyMidway(ctx, state, adult, scene, "you", {
      noLines: noLines,
    });
  }
  if (noLines) {
    return finishIntimacyWithoutLines(ctx, state, adult, scene);
  }
  let passageNo = adultTurn.passage + 1,
    peakPassage = Math.max(1, adultTurn.of - 1);
  if (passageNo === 1) {
    adultTurn.here = publicPlaceToClose(state);
  }
  let person = ctx.dressed(state, characterOf(state, scene.characterId)),
    context = ctx.sceneContext(state, person, scene),
    wantPicture =
      keyImagesOn(state) && pictureBeatsFor(adultTurn.of, adult.pictures).includes(passageNo) && !adultTurn.caught,
    reply = await ctx.withModel(state.id, "They could not answer", async (model) => {
      let picture = wantPicture ? await ctx.briefFor(state, scene, model) : false,
        spot = [
          spotPromptFor(scene),
          othersHomePrompt(state, scene),
          specialNightOrigin(scene.about?.special),
          joinedOrigin(scene),
        ]
          .filter(Boolean)
          .join(" ");
      return writeIntimatePassage(ctx.sceneModel(state, model), scene, person, {
        ...context,
        n: passageNo,
        of: adultTurn.of,
        direction: direction,
        detail: adultTurn.detail ?? adult.detail,
        spot: spot,
        picture: picture,
        caught: !!adultTurn.caught,
        ...(adultTurn.dance
          ? {
              dance: true,
              ways: "",
            }
          : {
              ways: intimacyWaysPrompt(state, adult, scene.characterId, othersInScene(scene)),
            }),
      });
    });
  if (!reply.lines.length) {
    throw Object.assign(adultHttpError(502, "They could not answer: nothing came back."), {
      model: true,
    });
  }
  let { events: events } = advanceTime(
    state,
    Math.round((adultTurn.dance ? PRIVATE_DANCE_OFFER.minutes : INTIMATE_MINUTES) / adultTurn.of),
    {
      walking: true,
    },
  );
  if (events.some((ev) => ev.id === "fainted")) {
    if (own && direction && state.faintMemo) {
      state.faintMemo.said = direction;
    }
    scene.batch = [];
    return {
      decided: "on",
      fainted: true,
      events: events,
    };
  }
  let outEvents = events;
  drainEnergyForIntimacy(state, 1 / adultTurn.of);
  scene.exchange += 1;
  scene.batch = reply.lines;
  if (own && direction) {
    scene.log.push({
      who: "you",
      text: direction,
      exchange: scene.exchange,
    });
  }
  scene.log.push(
    ...reply.lines.map((line) => ({
      ...line,
      exchange: scene.exchange,
    })),
  );
  let tags = direction && !adultTurn.dance ? applyIntimacyTook(state, adult, scene, reply.took) : [];
  scene.did = {
    exchange: scene.exchange,
    logAt: scene.log.length,
    tags: tags,
  };
  let keyImage = keyImageFor(state, scene, {
    beat: passageNo === peakPassage ? "moment" : "passage",
    picture: reply.picture,
    label: intimateSceneLabel(state, scene),
  });
  if (
    ((scene.pictureFrom = keyImage
      ? {
          [keyImage]: passagePictureLineIndex(reply.lines.length),
        }
      : {}),
    keyImage && (await ctx.queueKey(state, keyImage)),
    passageNo < adultTurn.of)
  ) {
    Object.assign(adultTurn, {
      passage: passageNo,
      options: reply.options,
    });
    scene.phase = "decide";
    return {
      decided: "on",
      passage: passageNo,
      events: outEvents,
    };
  }
  if (adultTurn.dance) {
    let stamp = recordPrivateDance(state, adult, scene);
    closeAdultScene(state, scene, {
      accepted: true,
      remember: reply.remember,
      headline: "The song is over.",
      stamp: stamp,
    });
    await ctx.foldAfterScene(state, scene.characterId);
    return {
      decided: "on",
      passage: passageNo,
      done: true,
      events: outEvents,
    };
  }
  let finish = adultTurn.caught ? finishCaughtIntimacy(state, adult, scene) : finishIntimateNight(state, adult, scene);
  if (finish.events?.some((ev) => ev.id === "fainted")) {
    return {
      decided: "on",
      passage: passageNo,
      done: true,
      fainted: true,
      events: [...outEvents, ...finish.events],
    };
  }
  if (!adultTurn.caught && canOfferStayTheNight(state, scene)) {
    Object.assign(adultTurn, {
      passage: null,
      options: [],
      night: {
        said: finish,
        remember: reply.remember,
      },
    });
    scene.phase = "decide";
    return {
      decided: "on",
      passage: passageNo,
      night: true,
      events: outEvents,
    };
  }
  closeAdultScene(state, scene, {
    accepted: true,
    remember: reply.remember,
    ...finish,
  });
  for (let id of othersInScene(scene)) {
    let character = characterOf(state, id);
    if (character && reply.remembers[id]) {
      addMemory(character, {
        at: state.minutes,
        text: reply.remembers[id],
        from: scene.kind,
      });
    }
  }
  for (let id of eventCast(scene)) {
    await ctx.foldAfterScene(state, id);
  }
  return {
    decided: "on",
    passage: passageNo,
    done: true,
    events: [...outEvents, ...(finish.events ?? [])],
  };
}
var intimateSceneLabel = (state, scene) => milestoneView(state, scene).title || timeTogetherLabel(scene.startedAt);
var passagePictureLineIndex = (lineCount) =>
  Math.min(Math.max(1, Math.floor(lineCount * 0.6)), Math.max(0, lineCount - 1));
function publicPlaceToClose(state) {
  let place = townPlace(state.town, state.at);
  return place && state.at !== "home" && !place.residence && isPlaceOpen(place, state.minutes) ? state.at : null;
}
function leaveIfPlaceClosed(state, result) {
  let scene = state.scene,
    placeId = scene?.done ? scene.adult?.here : null;
  if (!result || !placeId) {
    return result;
  }
  scene.adult.here = null;
  let place = townPlace(state.town, placeId);
  if (state.at !== placeId || !place || isPlaceOpen(place, state.minutes)) {
    return result;
  }
  let closeTime = `${String(place.close % 24).padStart(2, "0")}:00`;
  logNote(state, `${place.name} closed at ${closeTime}; you had to leave.`, "move");
  return {
    ...result,
    events: [
      ...(result.events ?? []),
      {
        id: "closed",
        place: place.id,
        text: `${place.name} closed at ${closeTime}.`,
      },
    ],
  };
}
function closeAdultScene(
  state,
  scene,
  { accepted: accepted, remember = "", each = null, headline: headline, stamp: stamp },
) {
  let bond = bondOf(state, scene.characterId);
  scene.choice = accepted ? "yes" : "wait";
  scene.verdict = {
    accepted: accepted,
    headline: headline,
    stamp: stamp,
    reads: scene.reads,
  };
  scene.adult = scene.adult
    ? {
        ...scene.adult,
        passage: null,
      }
    : null;
  endScene(scene, bond, {
    endedBy: accepted ? "accepted" : "wait",
    remember: remember,
    each: each,
  });
  rememberScene(state, scene);
  if (scene.milestone === CLUB_DANCE_MILESTONE && state.modules?.adult) {
    rollClubDarkOnce(state, state.modules.adult);
  }
}
var EMPTY_CLOSING_LINES = {
  lines: [],
  remember: "",
  each: {},
};
var CLOSING_STEP = {
  title: "",
  text: "How this moment between them ends, as told below.",
  not: "",
};
async function writeAdultClosing(ctx, state, scene, what, { noLines = false, fallback = false, accepted = true } = {}) {
  let person = ctx.dressed(state, characterOf(state, scene.characterId));
  scene.closing = true;
  let context;
  try {
    context = ctx.sceneContext(state, person, scene);
  } finally {
    delete scene.closing;
  }
  let isIntimate = scene.milestone === INTIMATE_MILESTONE,
    rememberers = isIntimate && othersInScene(scene).length ? rememberersOf(state, othersInScene(scene)) : null;
  scene.pictureFrom = {};
  let closing = EMPTY_CLOSING_LINES;
  if (!noLines) {
    try {
      closing = await ctx.withModel(state.id, "They could not answer", (model) =>
        runTierResult(ctx.sceneModel(state, model), scene, person, {
          ...context,
          ...(isIntimate
            ? {
                step: CLOSING_STEP,
              }
            : {}),
          each: rememberers,
          accepted: accepted,
          reads: scene.reads,
          picture: false,
          what: what,
        }),
      );
    } catch (err) {
      if (!fallback || err.statusCode === 499) {
        throw err;
      }
    }
  }
  scene.batch = closing.lines;
  scene.log.push(
    ...closing.lines.map((line) => ({
      ...line,
      exchange: scene.exchange + 1,
    })),
  );
  scene.goodbye = true;
  return closing;
}
function faintedDecision(scene, events = []) {
  scene.batch = [];
  return {
    decided: "go",
    fainted: true,
    events: events,
  };
}
var NIGHT_END_TEXTS = {
  stay: "The player stays the night. They settle in together to sleep, true to who they are, in their own words: 2 to 4 short segments.",
  yours:
    "The player says goodnight: the night ends here, and they get ready to head home. They take it true to who they are, in their own words, and a few lines of the goodbye: 2 to 4 short segments.",
  theirs:
    "The player says goodnight: the night ends here, and the player gets ready to head home. They take it true to who they are, in their own words, and a few lines of the goodbye: 2 to 4 short segments.",
  hotel:
    "The player says goodnight: the night ends here, and they both get ready to leave the hotel and head home. They take it true to who they are, in their own words, and a few lines of the goodbye: 2 to 4 short segments.",
  housemate:
    "The player says goodnight: the night ends here, and each of them goes to their own bed. They take it true to who they are, in their own words: 2 to 4 short segments.",
};
var nightEndText = (state, scene, choice) =>
  choice === "stay"
    ? NIGHT_END_TEXTS.stay
    : scene.about?.spot === "yours" && livesWithPlayer(state, scene.characterId)
      ? NIGHT_END_TEXTS.housemate
      : (NIGHT_END_TEXTS[scene.about?.spot] ?? NIGHT_END_TEXTS.yours);
async function endNightTogether(ctx, state, adult, scene, choice, { noLines = false, fallback = false } = {}) {
  let { said: said, remember: remember } = scene.adult.night,
    closing = await writeAdultClosing(ctx, state, scene, nightEndText(state, scene, choice), {
      noLines: noLines,
      fallback: fallback,
    });
  if (choice === "stay") {
    stayTheNightWith(state, adult, scene);
  }
  scene.adult.night = null;
  closeAdultScene(state, scene, {
    accepted: true,
    remember: remember || closing.remember,
    ...said,
  });
  await ctx.foldAfterScene(state, scene.characterId);
}
var adultSceneDecideAndLeave = async (ctx, state, adult, choice, opts) =>
  leaveIfPlaceClosed(state, await adultSceneDecide(ctx, state, adult, choice, opts));
async function adultSceneDecide(ctx, state, adult, choice, { noLines = false } = {}) {
  let scene = state.scene;
  if (scene?.milestone === CLUB_TALK_MILESTONE && scene.phase === "decide" && !scene.done) {
    return decideClubTalk(ctx, state, adult, choice, {
      noLines: noLines,
    });
  }
  if (scene?.milestone === CLUB_DANCE_MILESTONE && scene.phase === "decide" && !scene.done) {
    return decidePrivateDance(ctx, state, adult, choice, {
      noLines: noLines,
    });
  }
  if (scene?.milestone !== INTIMATE_MILESTONE || scene.phase !== "decide" || scene.done) {
    return;
  }
  scene.walk = null;
  let adultTurn = scene.adult;
  if (adultTurn?.night) {
    if (choice !== "stay" && choice !== "wait") {
      throw adultHttpError(400, "Stay the night, or say goodnight.");
    }
    await endNightTogether(ctx, state, adult, scene, choice, {
      noLines: noLines,
    });
    return {
      decided: choice,
      done: true,
    };
  }
  if (adultTurn?.passage) {
    let option = adultTurn.options.find((option2) => option2.key === choice);
    if (!option) {
      throw adultHttpError(400, "Pick one of the ways on, or say it in your own words.");
    }
    return playIntimatePassage(ctx, state, adult, option.text, {
      noLines: noLines,
    });
  }
  if (choice === "wait") {
    let what = scene.about?.special
        ? "The player would rather just sleep tonight, close together. They take it gently, true to who they are: 2 to 4 short segments."
        : scene.by === "them"
          ? "The player tells them not now. They take it true to who they are, and say so in their own words: 2 to 4 short segments."
          : "The player stops it there, gently. They take it well, true to who they are: 2 to 4 short segments.",
      closing = await writeAdultClosing(ctx, state, scene, what, {
        noLines: noLines,
        accepted: false,
      }),
      outcome = declineIntimacyOutcome(state, adult, scene);
    closeAdultScene(state, scene, {
      accepted: false,
      remember: closing.remember,
      each: closing.each,
      ...outcome,
    });
    for (let id of eventCast(scene)) {
      await ctx.foldAfterScene(state, id);
    }
    return {
      decided: "wait",
      accepted: false,
    };
  }
  if (anyoneRefusesIntimacy(state, scene)) {
    return endIntimacyNotHappening(ctx, state, scene, "Not now.", {
      noLines: noLines,
    });
  }
  if (scene.about?.pick) {
    let option = String(choice ?? "").startsWith("where:")
      ? privateSpotsForGroup(state, eventCast(scene)).find((option2) => option2.id === String(choice).slice(6))
      : null;
    if (!option) {
      throw adultHttpError(400, "Pick where, or stop here.");
    }
    let travel = applyChosenIntimateSpot(state, scene, option);
    if (scene.done) {
      return faintedDecision(scene, travel?.events ?? []);
    }
    if ((await ctx.pictureHere?.(state), scene.about.arrived)) {
      await openOrSkipScene(ctx, state, scene, noLines);
      return {
        decided: "go",
        events: travel?.events ?? [],
      };
    }
  } else if (choice !== "yes") {
    throw adultHttpError(400, "Say yes, or not now.");
  }
  if (scene.about?.go) {
    let option = placesToGoTogether(state, scene.characterId).find((option2) => option2.id === scene.about.go);
    if (!option) {
      throw adultHttpError(400, "You can't go there now.");
    }
    let travel = goTogetherTo(state, scene, scene.characterId, option);
    return travel.fainted
      ? faintedDecision(scene, travel.events)
      : ((scene.about = {
          ...scene.about,
          spot: option.id,
        }),
        markArrivedTogether(scene),
        await ctx.pictureHere?.(state),
        await openOrSkipScene(ctx, state, scene, noLines),
        {
          decided: "go",
          events: travel.events,
        });
  }
  scene.detected = null;
  scene.about ??= {
    spot: null,
    first: true,
  };
  let corner = scene.about.spot === "spot" ? scene.about.corner : null,
    caught = !!corner && seededRandom(state.seed, scene.characterId, String(state.minutes), "caught") < corner.chance;
  if (!corner) {
    scene.about.heard = whoOverheard(state, scene);
  }
  scene.adult = {
    passage: 0,
    of: caught ? 1 : (INTIMATE_PASSAGES_BY_DETAIL[adult.detail] ?? INTIMATE_PASSAGES_BY_DETAIL.explicit),
    detail: adult.detail,
    options: [],
    chosen: 0,
    fits: 0,
    caught: caught,
    each: Object.fromEntries(
      eventCast(scene).map((id) => [
        id,
        {
          liked: false,
          leans: [],
        },
      ]),
    ),
  };
  scene.max = scene.exchange + scene.adult.of;
  return playIntimatePassage(ctx, state, adult, "", {
    noLines: noLines,
  });
}
async function openOrSkipScene(ctx, state, scene, noLines) {
  if (noLines) {
    scene.batch = [];
    return;
  }
  await ctx.openScene(state, scene);
}
async function decideClubTalk(ctx, state, adult, choice, { noLines = false } = {}) {
  let scene = state.scene;
  if (!CLUB_TALK_CHOICES.includes(choice)) {
    throw adultHttpError(400, "Pick one of the three.");
  }
  let result = resolveClubTalk(state, adult, scene, choice),
    closing = await writeAdultClosing(ctx, state, scene, result.what, {
      noLines: noLines,
    });
  closeAdultScene(state, scene, {
    accepted: true,
    remember: closing.remember,
    headline: result.headline,
    stamp: null,
  });
  await ctx.foldAfterScene(state, scene.characterId);
  return {
    decided: choice,
    done: true,
  };
}
async function adultSceneReply(ctx, state, adult, text) {
  let scene = state.scene;
  if (scene?.milestone === CLUB_DANCE_MILESTONE && !scene.done) {
    return leaveIfPlaceClosed(state, await privateDanceReply(ctx, state, adult, text));
  }
  if (scene?.milestone === INTIMATE_MILESTONE && scene.adult?.night && !scene.done) {
    throw adultHttpError(400, "Stay the night, or say goodnight.");
  }
  if (!(scene?.milestone !== INTIMATE_MILESTONE || !scene.adult?.passage || scene.phase !== "decide" || scene.done)) {
    return leaveIfPlaceClosed(
      state,
      await playIntimatePassage(ctx, state, adult, text, {
        own: true,
      }),
    );
  }
}

export {
  adultSceneDecideAndLeave,
  adultSceneReply,
  closeAdultScene,
  endNightTogether,
  leaveIfPlaceClosed,
  playIntimatePassage,
  writeAdultClosing,
};
