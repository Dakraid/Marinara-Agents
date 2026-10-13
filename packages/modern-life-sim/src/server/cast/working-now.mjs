// Whether a character is at work now
import { formatClockTime } from "../time/clock.mjs";
import { whereaboutsOf } from "../schedule/whereabouts.mjs";
import { isJobSpan } from "../jobs/job-week.mjs";
import { seasonLookUrl } from "../characters/season-outfits.mjs";
import { workSpritesOn } from "./outfits.mjs";
import { characterOf, leavingAt, whereOpts } from "../game.mjs";

var workingNow = (state, character) =>
  !!character && isJobSpan(character, whereaboutsOf(character, state.minutes, whereOpts(state)));
function workingHome(state, characterOrId, minutes = state.minutes, opts = null) {
  let character = typeof characterOrId == "string" ? characterOf(state, characterOrId) : characterOrId;
  return !!character && !character.away && whereaboutsOf(character, minutes, opts ?? whereOpts(state)).working === true;
}
function workHomeUntil(state, characterId, minutes = state.minutes) {
  let opts = whereOpts(state),
    hourMark = (Math.floor(minutes / 60) + 1) * 60;
  for (; hourMark < minutes + 1440 && workingHome(state, characterId, hourMark, opts);) {
    hourMark += 60;
  }
  return hourMark;
}
function workingLook(state, characterId) {
  let character = characterOf(state, characterId);
  if (!workingNow(state, character)) {
    return {};
  }
  let leavesAt = leavingAt(state, characterId).at,
    useSprite =
      character.workLook?.url && (workSpritesOn(state) || (character.workLook.own && state.rules?.workOutfits));
  return {
    work: {
      title: character.job.title,
      until: leavesAt === null ? "" : formatClockTime(leavesAt),
    },
    ...(useSprite
      ? {
          avatar: seasonLookUrl(state, character.workLook),
        }
      : {}),
  };
}

export { workHomeUntil, workingHome, workingLook, workingNow };
