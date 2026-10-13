// Private dance request, talk, decision and ending scenes
import { eventCast } from "../events/event-cast.mjs";
import { openScene, runSceneTurn } from "../scenes/scene-engine.mjs";
import { characterOf } from "../game.mjs";
import { CLUB_DANCE_MILESTONE, CLUB_PASSAGES_BY_DETAIL } from "./tuning.mjs";
import { finishIntimateNight } from "./intimacy-outcomes.mjs";
import { recordPrivateDance, startPrivateDance } from "./club-dance.mjs";
import { adultHttpError } from "./intimate-passage.mjs";
import {
  closeAdultScene,
  endNightTogether,
  leaveIfPlaceClosed,
  playIntimatePassage,
  writeAdultClosing,
} from "./intimate-scene-flow.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";

async function requestPrivateDance(ctx, state, adult, dancerId) {
  let scene = startPrivateDance(state, adult, dancerId),
    person = ctx.dressed(state, characterOf(state, scene.characterId));
  await ctx.withModel(state.id, "They could not answer", (model) =>
    openScene(ctx.sceneModel(state, model), scene, person, ctx.sceneContext(state, person, scene)),
  );
  return {
    danced: scene.characterId,
  };
}
async function privateDanceReply(ctx, state, adult, text) {
  let scene = state.scene;
  if (scene.adult?.passage && scene.phase === "decide") {
    return playIntimatePassage(ctx, state, adult, text, {
      own: true,
    });
  }
  if (scene.phase !== "talk") {
    throw adultHttpError(400, "Make the call first.");
  }
  let said = String(text ?? "")
    .trim()
    .slice(0, 400);
  if (!said) {
    throw adultHttpError(400, "Say something first.");
  }
  let person = ctx.dressed(state, characterOf(state, scene.characterId)),
    context = ctx.sceneContext(state, person, scene),
    turn = await ctx.withModel(state.id, "They could not answer", (model) =>
      runSceneTurn(ctx.sceneModel(state, model), scene, person, said, {
        ...context,
        last: scene.exchange + 1 >= scene.max,
      }),
    ),
    exchange = scene.exchange + 1;
  scene.log.push({
    who: "you",
    text: said,
    exchange: exchange,
  });
  scene.exchange = exchange;
  scene.batch = turn.lines;
  scene.log.push(
    ...turn.lines.map((line) => ({
      ...line,
      exchange: exchange,
    })),
  );
  scene.reads.push(turn.read);
  scene.suggestions = exchange >= scene.max ? [] : turn.suggestions;
  if (exchange >= scene.max) {
    scene.phase = "decide";
  }
  return {
    answered: true,
  };
}
async function decidePrivateDance(ctx, state, adult, choice, { noLines = false } = {}) {
  let scene = state.scene,
    adultTurn = scene.adult;
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
    let closing = await writeAdultClosing(ctx, state, scene, SCENE_END_TEXTS.talk, {
      noLines: noLines,
    });
    closeAdultScene(state, scene, {
      accepted: false,
      remember: closing.remember,
      headline: "You stopped it there.",
      stamp: null,
    });
    await ctx.foldAfterScene(state, scene.characterId);
    return {
      decided: "wait",
      accepted: false,
    };
  }
  if (choice !== "yes") {
    throw adultHttpError(400, "Go on, or stop here.");
  }
  scene.adult = {
    passage: 0,
    of: CLUB_PASSAGES_BY_DETAIL[adult.detail] ?? CLUB_PASSAGES_BY_DETAIL.explicit,
    detail: adult.detail,
    options: [],
    chosen: 0,
    fits: 0,
    dance: true,
    each: {},
  };
  scene.max = scene.exchange + scene.adult.of;
  return playIntimatePassage(ctx, state, adult, "", {
    noLines: noLines,
  });
}
var SCENE_END_TEXTS = {
  night:
    "The player stops it here, gently, whatever part of it they were in: it ends now. They take it true to who they are, in their own words, and a few lines of the after: 2 to 4 short segments.",
  dance:
    "The player stops the dance here, before the song is over. They take it true to who they are, in their own words: 2 to 4 short segments.",
  talk: "The player gets up to go before the dance. They let the player go, true to who they are, in their own words: 2 to 4 short segments.",
};
var endAdultSceneAndLeave = async (ctx, state, adult) =>
  leaveIfPlaceClosed(state, await endAdultScene(ctx, state, adult));
async function endAdultScene(ctx, state, adult) {
  let scene = state.scene;
  if (!scene || scene.done) {
    return;
  }
  let intimateUnderway = scene.milestone === INTIMATE_MILESTONE && (scene.adult?.passage || scene.adult?.night);
  if (!intimateUnderway && scene.milestone !== CLUB_DANCE_MILESTONE) {
    return;
  }
  if (scene.adult?.night) {
    await endNightTogether(ctx, state, adult, scene, "wait", {
      fallback: true,
    });
    return {
      ended: true,
    };
  }
  let endKind = intimateUnderway ? "night" : scene.adult?.passage ? "dance" : "talk",
    closing = await writeAdultClosing(ctx, state, scene, SCENE_END_TEXTS[endKind], {
      fallback: true,
    });
  if (endKind === "night") {
    let finish = finishIntimateNight(state, adult, scene);
    closeAdultScene(state, scene, {
      accepted: true,
      remember: closing.remember,
      each: closing.each,
      ...finish,
    });
    for (let id of eventCast(scene)) {
      await ctx.foldAfterScene(state, id);
    }
  } else {
    let stamp = endKind === "dance" ? recordPrivateDance(state, adult, scene) : null;
    closeAdultScene(state, scene, {
      accepted: endKind === "dance",
      remember: closing.remember,
      headline: "You stopped it there.",
      stamp: stamp,
    });
    await ctx.foldAfterScene(state, scene.characterId);
  }
  return {
    ended: true,
  };
}

export { decidePrivateDance, endAdultSceneAndLeave, privateDanceReply, requestPrivateDance };
