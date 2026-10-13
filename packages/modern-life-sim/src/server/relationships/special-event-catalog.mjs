// Personality-driven special events catalog and dream-date parsing
import { hasTraitFlag } from "../traits/traits.mjs";

var SPECIAL_EVENT_REPEAT_DAYS = 7;
var CONTEST_VENUES = {
  gym: {
    skill: "fitness",
    what: "a workout challenge at the gym",
  },
  arcade: {
    skill: "knowledge",
    what: "a head-to-head round at the arcade",
  },
  karaoke: {
    skill: "charm",
    what: "a karaoke duel",
  },
};
var DREAM_DATE_PLACES = ["cafe", "park", "bar", "restaurant", "cinema", "arcade", "karaoke"];
var DREAM_DATE_TIMES = ["morning", "afternoon", "evening", "night"];
function parseDreamDate(raw, { tags = [] } = {}) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let text = String(raw.text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240),
    pick = (value, allowed) =>
      allowed.includes(
        String(value ?? "")
          .trim()
          .toLowerCase(),
      )
        ? String(value).trim().toLowerCase()
        : null,
    place = pick(raw.place, DREAM_DATE_PLACES),
    time = pick(raw.time, DREAM_DATE_TIMES),
    gift = pick(raw.gift, tags);
  return text && place && time
    ? {
        text: text,
        place: place,
        time: time,
        gift: gift,
      }
    : null;
}
var contestWinChance = (skillLevel = 0) => Math.max(0.15, Math.min(0.85, 0.3 + 0.07 * skillLevel));
var SPECIAL_EVENTS = {
  "late-realization": {
    name: "Late realization",
    trait: "smitten",
    needs: (traits) => traits.dials.smitten <= 2,
    options: ["open", "time", "friends"],
    image: true,
    theirs:
      "After a long friendship they have realized, late and all at once, that what they feel for the player is more than that, and they say it, awkwardly. They do not settle it: the player answers at the end.",
  },
  "is-this-real": {
    name: "Is this for real?",
    trait: "attention",
    needs: (traits) => traits.dials.attention >= 10,
    options: ["commit", "light"],
    image: true,
    theirs:
      "Half joking, they ask the player whether this is a game to them or something real. They do not settle it: the player answers at the end.",
  },
  "opening-up": {
    name: "Opening up",
    trait: "reserved",
    needs: (traits) => hasTraitFlag(traits, "reserved"),
    options: ["support", "advise", "listen"],
    image: true,
    theirs:
      "They tell the player something they never tell anyone: taken from who they are (their story, a problem they carry). The player answers at the end.",
  },
  pledge: {
    name: "A pledge of loyalty",
    trait: "faithful",
    needs: (traits) => traits.dials.faithful >= 9,
    options: ["pact", "downplay"],
    image: true,
    theirs:
      "They tell the player, earnestly, that the player can count on them, always, and that they would like to be able to count on the player the same way. The player answers at the end.",
  },
  "dont-cage-me": {
    name: "Do not cage me",
    trait: "freeSpirit",
    needs: (traits) => hasTraitFlag(traits, "freeSpirit"),
    options: ["their-way", "exclusive"],
    image: false,
    theirs:
      "Things between them and the player are heading toward something exclusive, and they ask the player not to cage them: they need to stay free. The player answers at the end.",
  },
  "looking-after-you": {
    name: "Looking after you",
    trait: "caring",
    needs: (traits) => traits.dials.caring >= 7,
    options: ["let", "fine"],
    image: false,
    again: true,
    theirs:
      "They noticed the player is not all right, and they turn up to look after them: food, or making them rest. The player answers at the end.",
  },
  "the-contest": {
    name: "The contest",
    trait: "temper",
    needs: (traits) => traits.dials.temper >= 7,
    options: ["real", "let-win"],
    image: false,
    again: true,
    theirs:
      "They challenge the player, right here, to a contest. The scene builds up to it; nobody has won yet. The player decides at the end how to play it.",
  },
  "working-up-to-it": {
    name: "Working up to it",
    trait: "shy",
    needs: (traits) => hasTraitFlag(traits, "shy"),
    options: ["help", "first", "pretend"],
    image: true,
    theirs:
      "They are trying to tell the player they like them, and the words almost do not come out. They do not manage it yet: the player decides at the end.",
  },
  "not-that-i-like-you": {
    name: "Not that I like you",
    trait: "proud",
    needs: (traits) => hasTraitFlag(traits, "proud"),
    options: ["call", "along"],
    image: true,
    theirs:
      "They do something clearly affectionate for the player and deny it in the same breath. The player decides at the end what to do about it.",
  },
  "the-dream-date": {
    name: "The dream date",
    trait: "romantic",
    needs: (traits) => traits.dials.romantic >= 7,
    options: ["promise", "listen"],
    image: false,
    theirs:
      "They tell the player, dreamily, what their perfect date would be: where, when, what would happen, and what little gift would make it perfect. It is a date that could really happen in this town, at one of its places. The player answers at the end.",
  },
  "about-the-future": {
    name: "About the future",
    trait: "practical",
    needs: (traits) => hasTraitFlag(traits, "practical"),
    options: ["serious", "slow", "see"],
    image: false,
    theirs:
      "They ask the player, plainly, what they want from life and from this between them. The player answers at the end.",
  },
  "a-jealous-scene": {
    name: "A jealous scene",
    trait: "jealousy",
    needs: (traits) => traits.dials.jealousy >= 8,
    options: ["reassure", "limit", "ignore"],
    image: false,
    again: true,
    theirs:
      "The player has not been around for days, and they are hurt and jealous about it: they say so, intensely but never threatening. The player answers at the end.",
  },
};
var SPECIAL_EVENT_IDS = Object.keys(SPECIAL_EVENTS);

export {
  CONTEST_VENUES,
  DREAM_DATE_PLACES,
  DREAM_DATE_TIMES,
  SPECIAL_EVENTS,
  SPECIAL_EVENT_IDS,
  SPECIAL_EVENT_REPEAT_DAYS,
  contestWinChance,
  parseDreamDate,
};
