// Content rules, fact weight, scene blocks and picture guidance for intimate and dance scenes
import { HONEYMOONS } from "../romance/wedding.mjs";
import { bondOf, characterOf, isNpc } from "../game.mjs";
import {
  CLUB_DANCE_MILESTONE,
  CLUB_TALK_MILESTONE,
  INTIMATE_ACT_WEIGHT,
  STAY_IN_PLACE_RULE,
  beatPhaseOf,
} from "./tuning.mjs";
import { LITERAL_IMAGE_RULE, PEEK_LEADUP_PASSAGES, PEEK_MAX_EXTRA_PASSAGES } from "./after-dark.mjs";
import {
  adultMarkOf,
  adultNameFor,
  consentFor,
  othersHomePrompt,
  othersInScene,
  placesToGoTogether,
  spotDescription,
  spotPromptFor,
} from "./intimate-milestone.mjs";
import { INTIMATE_PICTURE_PART_NOTES } from "./intimacy-outcomes.mjs";
import { clubTalkSceneBlocks } from "./club-jealousy.mjs";
import { privateDanceSceneBlocks } from "./club-dance.mjs";
import { AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE, INTIMATE_MILESTONE } from "./milestone-ids.mjs";

function adultContentGuidance(state, adult, characterId, { with: withIds = [] } = {}) {
  if (consentFor(state, characterId).how === "no") {
    return null;
  }
  let others = (Array.isArray(withIds) ? withIds : []).filter(
    (id) => id && id !== characterId && characterOf(state, id) && !isNpc(state, id),
  );
  return others.some((id) => adultMarkOf(adult, id) !== "yes" || bondOf(state, id)?.kin)
    ? null
    : `Flirting, closeness and sensuality are fine between ${others.length ? `the player and ${adultNameFor(state, characterId)} (nobody else)` : "them"} if it comes naturally; anything explicit only happens in a scene of its own, never here.`;
}
var adultFactWeight = (state, adult, fact) => (fact?.act === INTIMATE_MILESTONE ? INTIMATE_ACT_WEIGHT : 0);
function adultSceneBlocks(state, adult, scene) {
  if (scene?.milestone === CLUB_TALK_MILESTONE) {
    return clubTalkSceneBlocks(state, scene);
  }
  if (scene?.milestone === CLUB_DANCE_MILESTONE) {
    return privateDanceSceneBlocks(state, scene);
  }
  if (scene?.milestone !== INTIMATE_MILESTONE) {
    return null;
  }
  let others = othersInScene(scene),
    spotPrompt = spotPromptFor(scene),
    goOption = scene.about?.go
      ? placesToGoTogether(state, scene.characterId).find((option) => option.id === scene.about.go)
      : null,
    fainted = scene.endedBy === "fainted",
    closing = !!scene.closing,
    stayRule = closing ? "" : ` ${STAY_IN_PLACE_RULE}`,
    partRule =
      fainted || closing
        ? ""
        : "IN THIS PART: they start getting intimate, right where they are \u2014 closer, a kiss, their hands; no further than kisses and touches yet.",
    arrivedLine = scene.about?.arrived && !closing ? "They just arrived there together." : "";
  return scene.about?.go && (fainted || closing)
    ? {
        system: `${others.length ? "All of them are adults" : "Both of them are adults"}.`,
        user: "",
      }
    : scene.about?.go
      ? {
          system: `${others.length ? "All of them are adults" : "Both of them are adults"}, and nothing happens that anyone does not want.`,
          user: `THIS PART, THE ASK: they are still out, where they are now, with people around. The player asks ${(others.length, "them")} to come to ${spotDescription(goOption)} together, now; they say yes, in their own way (it is decided). Nothing more than a look or a touch happens here, and nobody leaves yet: the player makes the call next.`,
        }
      : others.length
        ? {
            system: `All of them are adults, each of them wants this, they get along with each other, and nothing happens that any of them does not want.${stayRule}`,
            user: [
              spotPrompt ? `WHERE THEY ARE NOW: ${spotPrompt}.` : "",
              arrivedLine,
              othersHomePrompt(state, scene),
              partRule,
              `ALL OF THEM TOGETHER WITH THE PLAYER: ${[scene.characterId, ...others].map((id) => adultNameFor(state, id)).join(", ")}.`,
            ].filter(Boolean).join(`
`),
          }
        : {
            system: `Both of them are adults, and nothing happens that either of them does not want.${stayRule}`,
            user: [
              spotPrompt ? `WHERE THEY ARE NOW: ${spotPrompt}.` : "",
              arrivedLine,
              othersHomePrompt(state, scene),
              scene.about?.theirIdea
                ? "HOW IT CAME ABOUT: at the end of a date that went really well, they asked the player to come over, and the player said yes."
                : "",
              specialNightOrigin(scene.about?.special),
              partRule,
            ].filter(Boolean).join(`
`),
          };
}
function specialNightOrigin(special) {
  return special?.kind === "engaged"
    ? "HOW IT CAME ABOUT: they just got engaged, and the rest of the day is theirs."
    : special?.kind === "wedding"
      ? "HOW IT CAME ABOUT: it is their wedding night: they got married today and have just come home from the party."
      : special?.kind === "honeymoon"
        ? `HOW IT CAME ABOUT: it is night ${special.day} of their honeymoon (${(HONEYMOONS[special.trip]?.name ?? "the trip").toLowerCase()}), back in their room after the day.`
        : "";
}
function adultPictureGuidance(state, adult, scene) {
  let detail = scene?.adult?.detail ?? adult.detail;
  if (scene?.milestone === CLUB_DANCE_MILESTONE) {
    return detail === "fade"
      ? "A private dance at a strip club, between two adults: suggestive, nothing explicit; the dancer and the player in a private room, as the passage being written has them."
      : [
          "A private dance at a strip club, between two adults; how much is shown follows the style profile's own rules.",
          "It shows the passage being written, as it happens: how the dancer moves, where they are and what they are wearing \u2014 or no longer wearing \u2014 follow that passage exactly.",
          scene.adult
            ? (INTIMATE_PICTURE_PART_NOTES[beatPhaseOf((scene.adult.passage ?? 0) + 1, scene.adult.of)] ?? "")
            : "",
          LITERAL_IMAGE_RULE,
        ]
          .filter(Boolean)
          .join(" ");
  }
  if (scene?.milestone === AFTER_DARK_MILESTONE || scene?.milestone === AFTER_DARK_PEEK_MILESTONE) {
    let fade = typeof scene.about?.fade == "boolean" ? scene.about.fade : adult.detail === "fade";
    if (scene.about?.dance) {
      return fade
        ? "A private dance at a strip club, between two adults: suggestive, nothing explicit; the dancer and the customer in its private room, only the two of them."
        : [
            "A private dance at a strip club, between two adults, only the dancer and the customer in its private room; it stays a dance. How much is shown follows the style profile's own rules.",
            "How the dancer moves, where they are and what they are wearing \u2014 or no longer wearing \u2014 follow the stretch being painted exactly.",
            LITERAL_IMAGE_RULE,
          ].join(" ");
    }
    if (fade) {
      return "An intimate moment between two adults, only the two of them, shown just before it: close, fully clothed, nothing explicit. Where they are follows the scene being written.";
    }
    if (scene.about?.whole) {
      return [
        "An intimate moment between two adults, only the two of them; how much is shown follows the style profile's own rules.",
        "Each picture shows its stretch of the scene, as it happens: where they are, how they are placed and what they are wearing \u2014 or no longer wearing \u2014 follow that stretch exactly.",
        LITERAL_IMAGE_RULE,
      ].join(" ");
    }
    let phase =
      scene.milestone === AFTER_DARK_PEEK_MILESTONE && scene.peek
        ? beatPhaseOf(
            Math.max(1, (scene.peek.passage ?? 0) + 1 - PEEK_LEADUP_PASSAGES),
            (scene.max ?? PEEK_LEADUP_PASSAGES + PEEK_MAX_EXTRA_PASSAGES) - PEEK_LEADUP_PASSAGES,
          )
        : "peak";
    return [
      "An intimate moment between two adults, only the two of them; how much is shown follows the style profile's own rules.",
      "It shows the scene being written, as it happens: where they are, how they are placed and what they are wearing \u2014 or no longer wearing \u2014 follow it exactly.",
      INTIMATE_PICTURE_PART_NOTES[phase] ?? "",
      LITERAL_IMAGE_RULE,
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (scene?.milestone !== INTIMATE_MILESTONE) {
    return null;
  }
  let whoPhrase = othersInScene(scene).length ? "adults, all of them in it" : "two adults";
  if (detail === "fade") {
    return `An intimate moment between ${whoPhrase}, shown just before it: close and tender, fully clothed, nothing explicit. Where they are and how they are placed follow the passage being written.`;
  }
  let adultTurn = scene.adult,
    partNote = adultTurn
      ? (INTIMATE_PICTURE_PART_NOTES[beatPhaseOf((adultTurn.passage ?? 0) + 1, adultTurn.of)] ?? "")
      : "";
  return [
    `An intimate moment between ${whoPhrase}; how much is shown follows the style profile's own rules.`,
    "It shows the passage being written, at its peak, as it happens: where they are, how they are placed and what they are wearing \u2014 or no longer wearing \u2014 follow that passage exactly, never the start of the scene. The outfits listed above are only what they arrived in.",
    partNote,
    LITERAL_IMAGE_RULE,
  ]
    .filter(Boolean)
    .join(" ");
}

export { adultContentGuidance, adultFactWeight, adultPictureGuidance, adultSceneBlocks, specialNightOrigin };
