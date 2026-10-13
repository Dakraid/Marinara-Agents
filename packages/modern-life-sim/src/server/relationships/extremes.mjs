// Personality-dial extremes driving NPC asks: who-was-that, ice-over, missed-you, surprise, open-offer, rent help
import { clockFromMinutes, daysBetween } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { isAttractedToGender } from "../orientation/orientation.mjs";
import { relationshipProfile } from "../traits/traits.mjs";
import { bondTier, driftLimitDays, hasMet, markTraitsSeen } from "./bonds.mjs";
import { INITIATIVE_ASK_CHANCES, MILESTONE_COUPLE_STATUSES } from "./milestones.mjs";
import { housingShareDue, rentSeasonKey } from "../money/wallet.mjs";
import { LOAN_MAX } from "./friend-perks.mjs";
import { rentSharersOf } from "../home/residence.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { genderOf } from "../romance/romanceability.mjs";
import { isPartner } from "../romance/jealousy.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { youMaySee } from "./friend-opinion.mjs";
import { bondOf, characterOf, isCharacterHere, traitsOf } from "../game.mjs";

var EXTREME_LOW = 2;
var EXTREME_HIGH = 8;
var WHO_AGAIN_DAYS = 7;
var ICE_DROP = 6;
var ICE_DAYS = 3;
var MISSED_AT = 0.5;
var MISSED_AGAIN_DAYS = 7;
var OPEN_AFTER_DAYS = 7;
var SURPRISE_EVERY_DAYS = 10;
var SURPRISE_CHANCE = 0.25;
var SURPRISE_ROMANCE = 3;
var SEASONAL_SURPRISE_FLOWERS = {
  Spring: "tulips",
  Summer: "sunflowers",
  Autumn: "chrysanthemums",
  Winter: "poinsettia",
};
var EXTREMES_DAY_MINUTES = 1440;
var dialOf = (game, charId, dial) => traitsOf(game, charId).dials[dial];
function extremesTick(game) {
  let now = game.minutes,
    scene = game.scene;
  if (scene && !scene.done && scene.kind === "talk" && !scene.whoWatched) {
    let character = characterOf(game, scene.characterId),
      attracted =
        character &&
        isAttractedToGender(character.into, genderOf(game, "you")) &&
        !bondOf(game, scene.characterId)?.kin;
    for (let bond of Object.values(game.bonds ?? {})) {
      let charId = bond.characterId;
      if (
        !(charId === scene.characterId || !isPartner(game, charId) || bond.asks || !attracted) &&
        !youMaySee(game, charId, scene.characterId) &&
        !(
          dialOf(game, charId, "jealousy") < EXTREME_HIGH ||
          !isCharacterHere(game, charId) ||
          isAsleep(game, charId)
        ) &&
        !((bond.whoAsked?.[scene.characterId] ?? -1 / 0) > now - WHO_AGAIN_DAYS * EXTREMES_DAY_MINUTES)
      ) {
        bond.whoAsked = {
          ...(bond.whoAsked ?? {}),
          [scene.characterId]: now,
        };
        bond.asks = {
          id: "who-was-that",
          at: now,
          due: now + 90,
          about: {
            with: scene.characterId,
            place: game.at,
            at: now,
          },
        };
        scene.whoWatched = charId;
        break;
      }
    }
  }
  for (let bond of Object.values(game.bonds ?? {})) {
    let charId = bond.characterId;
    if (!hasMet(bond) || characterOf(game, charId)?.away) {
      continue;
    }
    let trust = bond.iceTrust ?? bond.trust;
    bond.iceTrust = bond.trust;
    if (!bond.ice && trust - bond.trust >= ICE_DROP && dialOf(game, charId, "forgiveness") <= EXTREME_LOW) {
      bond.ice = {
        from: now,
        until: now + ICE_DAYS * EXTREMES_DAY_MINUTES,
      };
      markTraitsSeen(bond, "forgiveness");
    }
    if (bond.ice && now >= bond.ice.until && !bond.ice.asked && !bond.asks) {
      bond.ice.asked = true;
      bond.asks = {
        id: "ice-over",
        at: now,
        due: approachDue(bond, now),
      };
    }
  }
}
var iceWhy = (game, charId) => {
  let ice = bondOf(game, charId)?.ice;
  return ice && !ice.over && game.minutes < ice.until ? "They are not talking to you right now." : "";
};
function extremesDaily(game, day) {
  for (let bond of Object.values(game.bonds ?? {})) {
    let charId = bond.characterId;
    if (bond.asks || !hasMet(bond) || characterOf(game, charId)?.away) {
      continue;
    }
    let askChance = INITIATIVE_ASK_CHANCES[Math.round(relationshipProfile(bond).knobs.initiative ?? 1)] ?? 0.2;
    if (
      dialOf(game, charId, "attention") >= EXTREME_HIGH &&
      !bond.driftOwed &&
      bond.lastSeen !== undefined &&
      bond.missedFor !== bond.lastSeen &&
      game.minutes - (bond.missedAt ?? -1 / 0) >= MISSED_AGAIN_DAYS * EXTREMES_DAY_MINUTES
    ) {
      let driftDays = driftLimitDays(bond);
      if (
        driftDays !== null &&
        daysBetween(bond.lastSeen, game.minutes) >= Math.ceil(driftDays * MISSED_AT) &&
        seededRandom(game.seed, charId, String(day), "missed") < Math.max(askChance, 0.5)
      ) {
        bond.missedFor = bond.lastSeen;
        bond.missedAt = game.minutes;
        bond.asks = {
          id: "missed-you",
          at: game.minutes,
          due: approachDue(bond, game.minutes),
        };
        continue;
      }
    }
    if (
      dialOf(game, charId, "romantic") >= EXTREME_HIGH &&
      MILESTONE_COUPLE_STATUSES.includes(bond.status) &&
      (bond.surprisedAt ?? -1 / 0) <= game.minutes - SURPRISE_EVERY_DAYS * EXTREMES_DAY_MINUTES &&
      seededRandom(game.seed, charId, String(day), "surprise") < SURPRISE_CHANCE
    ) {
      bond.surprisedAt = game.minutes;
      let gift =
        seededRandom(game.seed, charId, String(day), "what") < 0.7
          ? (SEASONAL_SURPRISE_FLOWERS[clockFromMinutes(game.minutes).season] ?? "flowers")
          : "novel";
      bond.asks = {
        id: "surprise",
        at: game.minutes,
        due: approachDue(bond, game.minutes),
        about: {
          item: gift,
        },
      };
      continue;
    }
    if (
      game.rules?.multipleRelationships &&
      isPartner(game, charId) &&
      dialOf(game, charId, "jealousy") <= EXTREME_LOW &&
      !bond.openOffered &&
      !(bond.open?.them?.["*"] && bond.open?.you?.["*"]) &&
      daysBetween(bond.statusSince ?? 0, game.minutes) >= OPEN_AFTER_DAYS &&
      seededRandom(game.seed, charId, String(day), "open-offer") < askChance
    ) {
      bond.openOffered = game.minutes;
      bond.asks = {
        id: "open-offer",
        at: game.minutes,
        due: approachDue(bond, game.minutes),
      };
    }
  }
}
var confessesSooner = (game, charId) => dialOf(game, charId, "smitten") >= EXTREME_HIGH;
function moneyHelpDaily(game) {
  let wallet = game.wallet,
    day = clockFromMinutes(game.minutes).dayIndex;
  for (let bond of Object.values(game.bonds ?? {})) {
    if (bond.asks?.id === "money-help" && (bond.asks.about?.day ?? 1 / 0) < day) {
      bond.asks = null;
    }
  }
  if (
    !wallet?.rentDay ||
    wallet.rentPaidThrough === rentSeasonKey(game.minutes) ||
    wallet.helpOffered === rentSeasonKey(game.minutes) ||
    clockFromMinutes(game.minutes + EXTREMES_DAY_MINUTES).day !== wallet.rentDay
  ) {
    return;
  }
  let shortfall =
    housingShareDue(wallet, {
      sharedWith: rentSharersOf(game),
    }) - wallet.cash;
  if (shortfall <= 0) {
    return;
  }
  let helper = Object.values(game.bonds ?? {})
    .filter(
      (bond) =>
        !bond.asks &&
        hasMet(bond) &&
        !characterOf(game, bond.characterId)?.away &&
        bond.status !== "ex" &&
        bondTier(bond, "friendship") >= 2 &&
        dialOf(game, bond.characterId, "caring") >= EXTREME_HIGH,
    )
    .sort((a, b) => b.friendship - a.friendship)[0];
  if (helper) {
    wallet.helpOffered = rentSeasonKey(game.minutes);
    helper.asks = {
      id: "money-help",
      at: game.minutes,
      due: game.minutes + 60,
      about: {
        amount: Math.min(shortfall, LOAN_MAX),
        for: "rent",
        day: day + 1,
      },
    };
  }
}

export {
  EXTREME_HIGH,
  EXTREME_LOW,
  ICE_DAYS,
  ICE_DROP,
  MISSED_AGAIN_DAYS,
  MISSED_AT,
  OPEN_AFTER_DAYS,
  SURPRISE_CHANCE,
  SURPRISE_EVERY_DAYS,
  SURPRISE_ROMANCE,
  WHO_AGAIN_DAYS,
  confessesSooner,
  extremesDaily,
  extremesTick,
  iceWhy,
  moneyHelpDaily,
};
