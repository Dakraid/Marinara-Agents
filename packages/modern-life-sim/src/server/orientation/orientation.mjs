// Gender/attraction normalization and LLM orientation reading
import { ATTRACTION_OPTIONS } from "./attraction-options.mjs";

var ATTRACTION_LABELS = {
  women: "Women",
  men: "Men",
  both: "Women and men",
};
var ORIENTATION_REVEAL_FRIENDSHIP_TIER = 2;
function normalizeGender(gender) {
  let value = String(gender ?? "")
    .trim()
    .toLowerCase();
  return value === "female" || value === "woman" ? "female" : value === "male" || value === "man" ? "male" : null;
}
function normalizeAttraction(into) {
  let value = String(into ?? "")
    .trim()
    .toLowerCase();
  return ATTRACTION_OPTIONS.includes(value) ? value : "both";
}
var isAttractedToGender = (into, gender) =>
  !gender || !into || into === "both" || (into === "women" ? gender === "female" : gender === "male");
var notIntoReason = (gender) => `isn't into ${gender === "female" ? "women" : "men"}`;
var attractionBadge = (into) => (into === "women" ? "Only into women" : into === "men" ? "Only into men" : "");
var orientationPromptLines = (character) =>
  [
    normalizeGender(character?.gender)
      ? `Gender: ${normalizeGender(character.gender) === "female" ? "a woman" : "a man"}`
      : "",
    character?.into ? `Attracted to: ${attractionPhrase(character.into)}` : "",
  ].filter(Boolean).join(`
`);
var attractionPhrase = (into) =>
  ({
    women: "women only",
    men: "men only",
    both: "women and men",
  })[normalizeAttraction(into)];
function buildOrientationPrompt(card) {
  let cardText = [
    `Name: ${card.name ?? ""}`,
    card.description ? `Description: ${card.description}` : "",
    card.personality ? `Personality: ${card.personality}` : "",
    card.scenario ? `Scenario: ${card.scenario}` : "",
    card.appearance ? `Appearance: ${card.appearance}` : "",
  ].filter(Boolean).join(`
`);
  return [
    {
      role: "system",
      content: [
        "Task: read-orientation",
        "You read a character card for a modern life sim and answer two closed questions.",
        'Answer with JSON only, exactly: {"gender":"female or male","into":"women, men, both or unsaid"}',
        ORIENTATION_GENDER_RULE,
        ORIENTATION_INTO_RULE,
      ].join(`
`),
    },
    {
      role: "user",
      content: `THE CARD:
${cardText}`,
    },
  ];
}
var ORIENTATION_GENDER_RULE =
  "`gender`: female or male, as the card presents them. When it is not clear, the more likely one.";
var ORIENTATION_INTO_RULE =
  "`into`: who the card says EXPLICITLY they are attracted to (a stated orientation, or a stated preference): `women`, `men`, or `both` (bisexual, pansexual, or attracted to women and men). A partner, an ex or a crush alone is not enough. Otherwise `unsaid`.";
function parseOrientationAnswer(answer) {
  return {
    gender: normalizeGender(answer?.gender),
    into: normalizeAttraction(answer?.into),
  };
}
async function readCardOrientation(client, card) {
  let { json: json } = await client.askJson(buildOrientationPrompt(card), {
      maxTokens: 60,
      task: "read-orientation",
      about: card.name,
    }),
    answer = parseOrientationAnswer(json);
  if (!answer.gender) {
    throw new Error("The model did not say a gender.");
  }
  return answer;
}

export {
  ATTRACTION_LABELS,
  ORIENTATION_GENDER_RULE,
  ORIENTATION_INTO_RULE,
  ORIENTATION_REVEAL_FRIENDSHIP_TIER,
  attractionBadge,
  isAttractedToGender,
  normalizeAttraction,
  normalizeGender,
  notIntoReason,
  orientationPromptLines,
  readCardOrientation,
};
