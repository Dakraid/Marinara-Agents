// Party moment and party memory LLM prompts and parsers
import { PLAYER_PERSONA_HEADER, splitTextIntoChunks, truncateAtSentence } from "../scenes/text-helpers.mjs";
import { NO_RUMORS_RULE, SECOND_PERSON_RULE } from "../scenes/scene-config.mjs";
import { describeScenePerson } from "../scenes/scene-engine.mjs";

var PARTY_MOMENT_LINE_RANGE = [2, 4];
var partyMomentContentRule = (rule) =>
  rule ? `Keep it grounded and in character. ${rule}` : "Keep it grounded, in character and non-explicit.";
function buildPartyMomentPrompt({
  character = null,
  pair = [],
  around = [],
  everyone = false,
  words = "",
  lands = "",
  party = "",
  time = "",
  player = "the player",
  language = "English",
  setting = "",
  tone = "",
  bond = null,
  memories = [],
  met = false,
  content = "",
}) {
  let people = [
      ...(character ? [character] : []),
      ...pair,
      ...around.filter((person) => !pair.some((other) => other.id === person.id)),
    ],
    who = everyone
      ? "the player and everyone in the room"
      : character
        ? `the player and ${character.name}`
        : pair.length === 2
          ? `the player, ${pair[0].name} and ${pair[1].name}`
          : "the player, on their own",
    answerable = !!(character || pair.length === 2 || (everyone && around.length));
  return [
    {
      role: "system",
      content: [
        "Task: party-moment",
        `You write one short moment at a party in a modern life sim: ${who}. THE MOMENT: they ${words}. It already happens: write it, with the rest of the party going on in the background.`,
        `Answer with JSON only, exactly: {"lines":[{"who":"narration","text":"\u2026"},{"who":"${people[0]?.id ?? "narration"}","text":"\u2026"}]${answerable ? ',"suggestions":["\u2026","\u2026","\u2026"]' : ""}}`,
        `\`lines\`: ${PARTY_MOMENT_LINE_RANGE[0]} to ${PARTY_MOMENT_LINE_RANGE[1]} short segments. \`who\` is "narration" for a short line of what happens${people.length ? `, or the id of who speaks: ${people.map((person) => `"${person.id}" (${person.name})`).join(", ")}` : ""}.${answerable ? " End with someone in it saying something the player can answer: the player speaks next." : ""}`,
        answerable
          ? "`suggestions`: three different things the player could say or do next, written as the player, short (at most 60 characters), each with a different attitude."
          : "",
        lands && character ? `How it lands for ${character.name}, already decided: ${lands}.` : "",
        character
          ? `Mostly ${character.name}: the moment is theirs and the player's. ${met ? "They just met the player: it is the first time they talk." : ""}`
          : pair.length === 2
            ? `Mostly ${pair[0].name} and ${pair[1].name}: they meet for the first time and both speak, true to who they are.`
            : everyone
              ? "Everyone in the room is part of it; a few of them may say something."
              : "Nobody shares it with the player; someone around may say a word in passing, or nobody.",
        `Never write what the player says, does or thinks beyond THE MOMENT itself: nothing the player chooses. ${SECOND_PERSON_RULE}`,
        "Nobody leaves the party, makes a plan or settles anything big in these lines: it is a moment, and then the party goes on.",
        NO_RUMORS_RULE,
        partyMomentContentRule(content),
        `Write every line in ${language}.`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: [
        `NOW: ${time}`,
        party ? `THE PARTY: ${party}` : "",
        setting
          ? `THE SETTING:
${setting}`
          : "",
        `${PLAYER_PERSONA_HEADER}: ${player}`,
        character
          ? `
THE PERSON:
${describeScenePerson(character, {
  tone: tone,
  known: true,
})}`
          : "",
        character && bond
          ? `
BETWEEN THEM AND THE PLAYER: Friendship: ${bond.friendship} \xB7 Romance: ${bond.romance} \xB7 Trust: ${bond.trust}${
              bond.what
                ? `
${bond.what}`
                : ""
            }`
          : "",
        character && memories.length
          ? `WHAT THEY REMEMBER OF THE PLAYER, oldest first:
${memories.map((memory) => `- (${memory.when}) ${memory.text}`).join(`
`)}`
          : "",
        pair.length
          ? `
THE TWO WHO MEET:
${pair.map(
  (person) =>
    `- ${person.id}: ${person.name}${person.description ? ` \u2014 ${String(person.description).slice(0, 300)}` : ""}`,
).join(`
`)}`
          : "",
        around.length
          ? `
ALSO IN THE ROOM (id: name): ${around.map((person) => `${person.id}: ${person.name}`).join(" \xB7 ")}`
          : "",
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
function parsePartyMomentLines(json, ids = []) {
  let lines = (Array.isArray(json?.lines) ? json.lines : [])
    .slice(0, PARTY_MOMENT_LINE_RANGE[1] + 1)
    .flatMap((line) => {
      let who = ids.includes(String(line?.who ?? "")) ? String(line.who) : "narration";
      return splitTextIntoChunks(truncateAtSentence(line?.text, 4e3), 420).map((chunk) => ({
        who: who,
        text: chunk,
      }));
    });
  if (!lines.length) {
    throw new Error("The model did not write the moment.");
  }
  return lines;
}
var PARTY_MEMORY_MAX_CHARS = 500;
function buildPartyMemoryPrompt({
  people = [],
  whose = "",
  how = "",
  log = [],
  fainted = false,
  player = "the player",
  language = "English",
  setting = "",
}) {
  return [
    {
      role: "system",
      content: [
        "Task: party-memory",
        `A night at a party in a modern life sim is over: ${whose}. Write what each of the people below will remember of the player from tonight.`,
        `Answer with JSON only, exactly: {"remember":{${people.map((person) => `"${person.id}":"\u2026"`).join(",")}}}`,
        `Each one: two to four complete sentences from their own side, at most ${PARTY_MEMORY_MAX_CHARS} characters, calling the player ${player}, with what the two of them shared tonight and how the night went. An impression \u2014 never a new plan or a promise.`,
        fainted
          ? `The night ended with ${player} collapsing from exhaustion in front of everyone and being carried away: their memory ends with that.`
          : "",
        NO_RUMORS_RULE,
        "Keep it grounded, in character and non-explicit.",
        `Write every memory in ${language}.`,
      ].filter(Boolean).join(`
`),
    },
    {
      role: "user",
      content: [
        setting
          ? `THE SETTING:
${setting}`
          : "",
        `THE NIGHT: ${how}`,
        log.length
          ? `WHAT THE PLAYER DID TONIGHT:
${log.map((entry) => `- ${entry}`).join(`
`)}`
          : "",
        "",
        "WHO REMEMBERS IT:",
        ...people.map(
          (person) =>
            `- ${person.id}: ${person.name}${person.host ? " (whose party it was)" : ""}${person.description ? ` \u2014 ${String(person.description).slice(0, 300)}` : ""}${
              person.what
                ? `
  ${person.what}`
                : ""
            }${
              person.moments?.length
                ? `
  with the player: ${person.moments.join("; ")}`
                : ""
            }`,
        ),
      ].filter((line) => line !== "").join(`
`),
    },
  ];
}
function parsePartyMemories(json, ids = []) {
  let memories = {};
  for (let id of ids) {
    let text = truncateAtSentence(json?.remember?.[id], PARTY_MEMORY_MAX_CHARS);
    if (text) {
      memories[id] = text;
    }
  }
  return Object.keys(memories).length ? memories : null;
}

export { buildPartyMemoryPrompt, buildPartyMomentPrompt, parsePartyMemories, parsePartyMomentLines };
