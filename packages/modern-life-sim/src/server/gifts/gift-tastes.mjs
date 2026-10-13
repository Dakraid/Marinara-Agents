// Gift tastes, verdicts, history and gift-reaction LLM prompt
import { jobPromptLine } from "../jobs/town-jobs.mjs";
import { residencePromptLine } from "../housing/residences.mjs";
import { RELATIONSHIP_STATUS_LABELS, bondTier, currentBondTierName } from "../relationships/bonds.mjs";
import { truncateAtSentence } from "../scenes/text-helpers.mjs";
import { toPlayerNote } from "../relationships/kin.mjs";
import { nowAndMemoriesBlock } from "../scenes/scene-engine.mjs";
import { CLOTHES_STYLES, CLOTHES_STYLE_GLOSS } from "../items/catalog.mjs";
import { GIFT_TAGS } from "../shop/new-arrivals.mjs";
import { gossipPromptBlock } from "../network/town-facts.mjs";
import { DATE_TASTES_JSON_SHAPE, DATE_TASTES_PROMPT_RULE, parseDateTastes } from "../outings/date-tastes.mjs";

var GIFT_GIVE_MINUTES = 5;
var MAX_GIFT_HISTORY = 20;
var GIFT_RESULT_EFFECTS = {
  loved: {
    friendship: 6,
    romance: 3,
    stamp: "LOVED IT",
    said: "loved it",
    good: true,
  },
  liked: {
    friendship: 3,
    romance: 2,
    stamp: "LIKED IT",
    said: "liked it",
    good: true,
  },
  fine: {
    friendship: 1,
    stamp: "THAT'S NICE",
    said: "fine",
    good: true,
  },
  disliked: {
    friendship: -3,
    stamp: "NOT FOR THEM",
    said: "didn't like it",
    good: false,
  },
};
var GIFT_TASTE_COUNTS = {
  loves: 1,
  likes: 2,
  dislikes: 2,
};
function parseGiftTastes(raw) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let used = new Set(),
    tastes = {};
  for (let [level, count] of Object.entries(GIFT_TASTE_COUNTS)) {
    let values = Array.isArray(raw[level]) ? raw[level] : typeof raw[level] == "string" ? [raw[level]] : [];
    tastes[level] = [];
    for (let value of values) {
      let tag = String(value ?? "")
        .trim()
        .toLowerCase();
      if (!(!GIFT_TAGS.includes(tag) || used.has(tag) || tastes[level].length >= count)) {
        used.add(tag);
        tastes[level].push(tag);
      }
    }
  }
  return used.size ? tastes : null;
}
function giftTasteVerdict(tastes, tags = []) {
  return tastes
    ? tags.some((tag) => tastes.loves?.includes(tag))
      ? "loved"
      : tags.some((tag) => tastes.dislikes?.includes(tag))
        ? "disliked"
        : tags.some((tag) => tastes.likes?.includes(tag))
          ? "liked"
          : "fine"
    : "fine";
}
var DISH_VERDICT_LADDER = ["disliked", "fine", "liked", "loved"];
function adjustDishVerdict(verdict, { quality = "fine", verdict: tasteVerdict = "fine" } = {}) {
  let shift =
    (quality === "great" ? 1 : quality === "burnt" ? -1 : 0) +
    (tasteVerdict === "liked" ? 1 : tasteVerdict === "disliked" ? -1 : 0);
  return DISH_VERDICT_LADDER[
    Math.max(0, Math.min(DISH_VERDICT_LADDER.length - 1, DISH_VERDICT_LADDER.indexOf(verdict) + shift))
  ];
}
function homeCookedDishLine({ quality = "fine", taste = "", verdict = "fine" } = {}, cook = "the player") {
  let qualityText =
      {
        burnt: "it came out a little burnt",
        fine: "it came out fine",
        great: "it came out delicious",
      }[quality] ?? "it came out fine",
    tasteText =
      verdict === "liked"
        ? `${taste} food, which they love`
        : verdict === "disliked"
          ? `${taste} food, which they do not like`
          : `${taste} food`;
  return `home-cooked by ${cook}; ${qualityText}; ${tasteText}`;
}
var giftTastesRevealed = (bond, mode = "found") =>
  mode === "always" || (mode === "found" && bondTier(bond, "trust") >= 2);
function visibleGiftTastes(character, bond, mode = "found") {
  let tastes = character?.tastes ?? null,
    revealed = giftTastesRevealed(bond, mode),
    givenTags = new Set((bond?.gifts ?? []).map((gift) => gift.tag).filter(Boolean)),
    slots = (level) => {
      let known = (tastes?.[level] ?? []).map((tag) => (revealed || givenTags.has(tag) ? tag : null));
      return [
        ...known.filter(Boolean),
        ...Array(Math.max(0, GIFT_TASTE_COUNTS[level] - known.filter(Boolean).length)).fill(null),
      ];
    };
  return {
    loves: slots("loves"),
    likes: slots("likes"),
    dislikes: slots("dislikes"),
    open: revealed,
    read: !!tastes,
  };
}
function knownGiftVerdict(character, bond, tag, mode = "found") {
  if (!tag) {
    return null;
  }
  let lastGift = (bond?.gifts ?? []).filter((gift) => gift.tag === tag).at(-1);
  if (lastGift) {
    return lastGift.result;
  }
  if (!character?.tastes || !giftTastesRevealed(bond, mode)) {
    return null;
  }
  let verdict = giftTasteVerdict(character.tastes, [tag]);
  return verdict === "fine" ? null : verdict;
}
function recordGiftGiven(bond, gift) {
  bond.gifts = [...(bond.gifts ?? []), gift].slice(-MAX_GIFT_HISTORY);
  return bond.gifts;
}
var TASTES_JSON_SHAPE = ` "gifts":{"loves":["<tag>"],"likes":["<tag>","<tag>"],"dislikes":["<tag>","<tag>"]}, "clothes":{"likes":"<style>","dislikes":"<style>"},
${DATE_TASTES_JSON_SHAPE}`;
var TASTES_PROMPT_RULES = [
  `\`gifts\` is what this person would think of a present, as tags from this closed list only: ${GIFT_TAGS.join(", ")}. Exactly one they love, two they like and two they dislike, five different tags, taken from what the card says or implies about them.`,
  `\`clothes\` is the style of clothes they like to see on someone and the one they don't, from this closed list only: ${CLOTHES_STYLES.join(", ")} (${CLOTHES_STYLE_GLOSS}). Two different styles.`,
  DATE_TASTES_PROMPT_RULE,
].join(`
`);
function parseClothesTaste(raw) {
  let pick = (value) => {
      let style = String(value ?? "")
        .trim()
        .toLowerCase();
      return CLOTHES_STYLES.includes(style) ? style : null;
    },
    likes = pick(raw?.likes),
    dislikes = pick(raw?.dislikes);
  return likes && dislikes && likes !== dislikes
    ? {
        likes: likes,
        dislikes: dislikes,
      }
    : null;
}
function giftTastesPrompt(character, { setting = "" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: gift-tastes",
        "You read a character from a modern life sim and say what they would think of a present, and what they like when they go out.",
        "Answer with JSON only, exactly this shape:",
        `{${TASTES_JSON_SHAPE.trim().replace(/,$/, "")}}`,
        TASTES_PROMPT_RULES,
      ].join(`
`),
    },
    {
      role: "user",
      content: `${
        setting
          ? `THE SETTING:
${setting}

`
          : ""
      }THE CHARACTER:
Name: ${character.name}
${character.description ?? ""}`,
    },
  ];
}
async function readCharacterTastes(llm, character, options = {}) {
  let { json: json } = await llm.askJson(giftTastesPrompt(character, options), {
      maxTokens: 420,
      task: "gift-tastes",
      about: character.name,
    }),
    tastes = parseGiftTastes(json?.gifts),
    clothes = parseClothesTaste(json?.clothes),
    dates = parseDateTastes(json?.dates);
  if (!tastes && !clothes && !dates) {
    throw new Error("The model did not pick tags from the list.");
  }
  return {
    tastes: tastes,
    clothes: clothes,
    dates: dates,
  };
}
var GIFT_REACTION_GUIDE = {
  loved: "They LOVE it: it is exactly their kind of thing. Delighted, as openly as they ever are.",
  liked: "They like it: a pleasant surprise, sincerely thankful.",
  fine: "It is fine: nothing special to them, but they appreciate the gesture.",
  disliked:
    "It is not their kind of thing at all. They take it in character: polite, awkward, blunt or teasing, whatever fits them and this relationship.",
};
function giftReactionPrompt(
  character,
  bond,
  {
    gift: gift,
    result: result,
    player = "the player",
    language = "English",
    tone = "",
    setting = "",
    memories = [],
    knows = [],
    now = "",
    ahead = [],
  } = {},
) {
  let standing = [
    `Friendship: ${currentBondTierName(bond, "friendship") ?? "Acquaintance"}`,
    `Romance: ${currentBondTierName(bond, "romance") ?? "\u2014"}${bond.romanceable === false || bond.justFriends ? " (romance with the player is off the table for them)" : ""}`,
    `Trust: ${currentBondTierName(bond, "trust") ?? "Wary"}`,
    `Relationship: ${RELATIONSHIP_STATUS_LABELS[bond.status] ?? "Single"}`,
  ].join(`
`);
  return [
    {
      role: "system",
      content: [
        "Task: gift-reaction",
        `${player} has just given ${character.name} a present in a modern life sim. How it went is already decided:`,
        GIFT_REACTION_GUIDE[result] ?? GIFT_REACTION_GUIDE.fine,
        "",
        'Answer with JSON only, exactly: {"line":"\u2026","remember":"\u2026"}',
        "`line`: what THEY say on receiving it, first person, one or two sentences, naming the present in their own words. No narration, no stage directions, no quotation marks.",
        `\`remember\`: what they will keep of this moment, one complete sentence in the third person that names ${player} and the present.`,
        "Never write what the player says, does or thinks.",
        "Never set a day or a time to meet, and never ask the player to promise to show up somewhere: the game cannot keep appointments.",
        "Match how well they know the player: an acquaintance does not talk like a best friend.",
        `Write both in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        setting
          ? `THE SETTING:
${setting}
`
          : "",
        `THE CHARACTER:
Name: ${character.name}
${character.description ?? ""}${[
          residencePromptLine(character.home),
          jobPromptLine(character.work),
          toPlayerNote(character.toYou),
        ]
          .filter(Boolean)
          .map(
            (line) => `
${line}`,
          )
          .join("")}${
          tone
            ? `
How they come across: ${tone}`
            : ""
        }`,
        `
WHERE THEY STAND WITH ${player.toUpperCase()}:
${standing}`,
        nowAndMemoriesBlock({
          now: now,
          memories: memories,
          ahead: ahead,
          player: player,
        }),
        gossipPromptBlock(knows, player),
        `
THE PRESENT: ${gift.name}${gift.line ? ` (${gift.line})` : ""}`,
      ].filter(Boolean).join(`
`),
    },
  ];
}
var clipGiftReactionText = truncateAtSentence;
function parseGiftReaction(raw) {
  let line = clipGiftReactionText(raw?.line, 240);
  if (!line) {
    throw new Error("The model did not write what they say.");
  }
  return {
    line: line,
    remember: clipGiftReactionText(raw?.remember, 240),
  };
}
async function askGiftReaction(llm, character, bond, options) {
  let { json: json } = await llm.askJson(giftReactionPrompt(character, bond, options), {
    maxTokens: 300,
    task: "gift-reaction",
    about: character.name,
  });
  return parseGiftReaction(json);
}

export {
  GIFT_GIVE_MINUTES,
  GIFT_RESULT_EFFECTS,
  TASTES_JSON_SHAPE,
  TASTES_PROMPT_RULES,
  adjustDishVerdict,
  askGiftReaction,
  giftTasteVerdict,
  giftTastesRevealed,
  homeCookedDishLine,
  knownGiftVerdict,
  parseClothesTaste,
  parseGiftTastes,
  readCharacterTastes,
  recordGiftGiven,
  visibleGiftTastes,
};
