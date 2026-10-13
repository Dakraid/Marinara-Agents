// Gender/attraction normalization and LLM orientation reading
import { ATTRACTION_OPTIONS } from "./attraction-options.mjs";

var ATTRACTION_LABELS = {
  women: "Women",
  men: "Men",
  futanari: "Futanari",
};
var ORIENTATION_REVEAL_FRIENDSHIP_TIER = 2;
// Which attraction group each sex belongs to
var SEX_GROUPS = {
  female: "women",
  male: "men",
  futanari: "futanari",
};
var SEX_NOUN = {
  female: "a woman",
  male: "a man",
  futanari: "a futanari woman",
};
function normalizeGender(gender) {
  let value = String(gender ?? "")
    .trim()
    .toLowerCase();
  return value === "female" || value === "woman"
    ? "female"
    : value === "male" || value === "man"
      ? "male"
      : value === "futanari" || value === "futa"
        ? "futanari"
        : null;
}
// Picks the recognised groups out of an array, a list string or a legacy value ("both" = women and men)
function attractionGroups(into) {
  let values = (Array.isArray(into) ? into : String(into ?? "").split(/[\s,/&+]+|\band\b/))
    .map((value) =>
      String(value ?? "")
        .trim()
        .toLowerCase(),
    )
    .flatMap((value) => (value === "both" ? ["women", "men"] : value === "futa" ? ["futanari"] : [value]));
  return ATTRACTION_OPTIONS.filter((option) => values.includes(option));
}
var attractionSaid = (into) => attractionGroups(into).length > 0;
// Unsaid or unreadable: open to everyone
function normalizeAttraction(into) {
  let groups = attractionGroups(into);
  return groups.length ? groups : [...ATTRACTION_OPTIONS];
}
var isAttractedToGender = (into, gender) =>
  !gender || !into || !SEX_GROUPS[gender] || normalizeAttraction(into).includes(SEX_GROUPS[gender]);
var listPhrase = (words) =>
  words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}` : (words[0] ?? "");
var attractionLabel = (into) => {
  let groups = normalizeAttraction(into);
  return listPhrase(groups.map((group, index) => (index ? group : ATTRACTION_LABELS[group])));
};
var notIntoReason = (gender) => `isn't into ${SEX_GROUPS[gender] ?? "men"}`;
var attractionBadge = (into) => {
  let groups = normalizeAttraction(into);
  return groups.length < ATTRACTION_OPTIONS.length ? `Only into ${listPhrase(groups)}` : "";
};
// Only one group: the narrow orientations friends gossip about
var narrowAttraction = (into) => !!into && normalizeAttraction(into).length === 1;
var orientationPromptLines = (character) =>
  [
    normalizeGender(character?.gender) ? `Gender: ${SEX_NOUN[normalizeGender(character.gender)]}` : "",
    character?.into ? `Attracted to: ${attractionPhrase(character.into)}` : "",
  ].filter(Boolean).join(`
`);
var attractionPhrase = (into) => {
  let groups = normalizeAttraction(into);
  return groups.length === 1 ? `${groups[0]} only` : listPhrase(groups);
};
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
        'Answer with JSON only, exactly: {"gender":"female, male or futanari","into":[one or more of "women", "men", "futanari"] or "unsaid"}',
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
  "`gender`: female, male or futanari, as the card presents them (futanari only when the card says so: a woman with a penis). When it is not clear, the more likely of female and male.";
var ORIENTATION_INTO_RULE =
  "`into`: who the card says EXPLICITLY they are attracted to (a stated orientation, or a stated preference): a list of `women`, `men` and/or `futanari` (bisexual or pansexual: `women` and `men`; add `futanari` only when the card says so). A partner, an ex or a crush alone is not enough. Otherwise `unsaid`.";
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
  SEX_GROUPS,
  attractionBadge,
  attractionLabel,
  attractionSaid,
  isAttractedToGender,
  narrowAttraction,
  normalizeAttraction,
  normalizeGender,
  notIntoReason,
  orientationPromptLines,
  readCardOrientation,
};
