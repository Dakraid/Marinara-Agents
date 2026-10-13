// Unlocking and choosing backdrops for intimate spots
import { PUBLIC_SPOTS, tripBackdropId } from "./spots.mjs";
import { AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE, INTIMATE_MILESTONE } from "./milestone-ids.mjs";

function unlockCornerBackdrop(adult, corner) {
  unlockAdultBackdrop(adult, PUBLIC_SPOTS[corner?.place]?.look);
}
function unlockAdultBackdrop(adult, lookId) {
  if (lookId && !(adult.looks ?? []).includes(lookId)) {
    adult.looks = [...(adult.looks ?? []), lookId];
  }
}
var adultBackdrops = (state, adult) => adult.looks ?? [];
function adultBackdropHere(state, adult) {
  let scene = state.scene;
  return (scene?.milestone === AFTER_DARK_MILESTONE || scene?.milestone === AFTER_DARK_PEEK_MILESTONE) &&
    scene.about?.look
    ? scene.about.look
    : !scene || scene.done || scene.milestone !== INTIMATE_MILESTONE
      ? null
      : scene.about?.spot === "trip"
        ? tripBackdropId(scene.about.special?.trip)
        : scene.about?.spot !== "spot"
          ? null
          : (PUBLIC_SPOTS[scene.about.corner?.place]?.look ?? null);
}

export { adultBackdropHere, adultBackdrops, unlockAdultBackdrop, unlockCornerBackdrop };
