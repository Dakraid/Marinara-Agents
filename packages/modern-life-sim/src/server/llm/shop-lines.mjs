// LLM prompts/parsers for shop counter lines and fitting-room opinions
import { RELATIONSHIP_STATUS_LABELS, currentBondTierName } from "../relationships/bonds.mjs";
import { truncateAtSentence } from "../scenes/text-helpers.mjs";

var COUNTER_GREETINGS = 3;
var COUNTER_PAY_LINES = 10;
function standingWithPlayer(game, charId) {
  return charId
    ? [
        `Friendship: ${currentBondTierName(game, "friendship") ?? "Acquaintance"}`,
        `Romance: ${currentBondTierName(game, "romance") ?? "\u2014"}${game.romanceable === false || game.justFriends ? " (romance with the player is off the table for them)" : ""}`,
        `Relationship: ${RELATIONSHIP_STATUS_LABELS[game.status] ?? "Single"}`,
      ].join(`
`)
    : "They have never met the player: to them, just someone shopping.";
}
var characterBrief = (character, impression) => `Name: ${character.name}
${String(character.description ?? "").slice(0, 1200)}${
  impression
    ? `
How they come across: ${impression}`
    : ""
}`;
function counterLinesPrompt(
  character,
  impression,
  {
    player = "the player",
    place = "the store",
    title = "shop assistant",
    met = true,
    language = "English",
    tone = "",
    setting = "",
    memories = [],
    suits = "",
  } = {},
) {
  return [
    {
      role: "system",
      content: [
        "Task: counter-lines",
        `${character.name} works at ${place} as a ${title.toLowerCase()} in a modern life sim, and ${player} comes in to shop. Write what they say at the counter; the game keeps these lines and uses them again on many visits.`,
        `Answer with JSON only, exactly: {"greetings":[${COUNTER_GREETINGS} lines],"pay":[${COUNTER_PAY_LINES} lines]${suits ? ',"suits":"\u2026"' : ""}}`,
        `\`greetings\`: ${COUNTER_GREETINGS} different things they say when ${player} walks in.`,
        `\`pay\`: ${COUNTER_PAY_LINES} different things they say while ringing ${player} up.`,
        suits
          ? `\`suits\`: what they say when ${player} asks what would suit them: they send ${player} to the ${suits} section, because it is their own taste in clothes. One line, in their way.`
          : "",
        "Each line: one or two short sentences, what THEY say, first person. No narration, no stage directions, no quotation marks.",
        "Nothing that belongs to one visit: no day, no time, no weather, no item, no price, no amount, and never a plan to meet.",
        met
          ? "Match how well they know the player: an acquaintance does not talk like a partner."
          : "They have never met the player: they serve a stranger, politely, in their own way, and never use the player's name.",
        "Never write what the player says, does or thinks. Keep it non-explicit.",
        `Write them in ${language}.`,
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
${characterBrief(character, tone)}`,
        `
WHERE THEY STAND WITH ${player.toUpperCase()}:
${standingWithPlayer(impression, met)}`,
        met && memories.length
          ? `
WHAT THEY REMEMBER OF ${player.toUpperCase()}:
${memories.map((memory) => `- ${memory}`).join(`
`)}`
          : "",
      ].filter(Boolean).join(`
`),
    },
  ];
}
var cleanLines = (list, max) =>
  [...new Set((Array.isArray(list) ? list : []).map((line) => truncateAtSentence(line, 200)).filter(Boolean))].slice(
    0,
    max,
  );
function parseCounterLines(json, { suits = false } = {}) {
  let greetings = cleanLines(json?.greetings, COUNTER_GREETINGS),
    pay = cleanLines(json?.pay, COUNTER_PAY_LINES);
  if (!greetings.length || pay.length < 3) {
    throw new Error("The model did not write the counter's lines.");
  }
  return {
    greetings: greetings,
    pay: pay,
    ...(suits
      ? {
          suits: truncateAtSentence(json?.suits, 200),
        }
      : {}),
  };
}
async function writeCounterLines(ctx, character, impression, opts) {
  let { json: json } = await ctx.askJson(counterLinesPrompt(character, impression, opts), {
    maxTokens: 1e3,
    task: "counter-lines",
    about: character.name,
  });
  return parseCounterLines(json, {
    suits: !!opts.suits,
  });
}
var FITTING_VERDICTS = {
  likes: "likes it on the player: it is their kind of style",
  dislikes: "does not like it: it is not their style at all (they say so in their own way, kind or blunt as they are)",
  fine: "finds it alright, nothing special",
};
function fittingRoomPrompt({
  player = "the player",
  outfit: outfit,
  place = "the store",
  people = [],
  language = "English",
  setting = "",
}) {
  return [
    {
      role: "system",
      content: [
        "Task: fitting-room",
        `${player} tries on ${outfit.name} at ${place}, in a modern life sim, and comes out of the fitting room. Each person listed says what they think of it, to ${player}. Whether each one likes it is already decided: keep to it.`,
        'Answer with JSON only, exactly: {"lines":[{"id":"<their id>","line":"\u2026"}]}, one entry for each person, in the order given.',
        "Each line: one or two short sentences, what THEY say, first person. No narration, no stage directions, no quotation marks.",
        "Someone marked AGAIN already told the player what they think of this one: they say it again, shorter.",
        "Never set a day or a time to meet, and never ask the player to promise to show up somewhere: the game cannot keep appointments.",
        "Match how well each one knows the player. Never write what the player says, does or thinks. Keep it non-explicit.",
        `Write them in ${language}.`,
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
        `WHAT ${player.toUpperCase()} TRIES ON: ${outfit.name} \u2014 ${outfit.text}`,
        ...people.map(
          (person) => `
id: ${person.character.id}${person.again ? " \xB7 AGAIN" : ""}${person.working ? " \xB7 working here" : " \xB7 shopping here too"}
${characterBrief(person.character, person.tone)}
${standingWithPlayer(person.bond, person.met)}
What they think: ${FITTING_VERDICTS[person.verdict] ?? FITTING_VERDICTS.fine}`,
        ),
      ].filter(Boolean).join(`
`),
    },
  ];
}
function parseFittingLines(json, ids) {
  let lines = {};
  for (let entry of Array.isArray(json?.lines) ? json.lines : []) {
    let id = String(entry?.id ?? ""),
      line = truncateAtSentence(entry?.line, 240);
    if (ids.includes(id) && line && !lines[id]) {
      lines[id] = line;
    }
  }
  if (!Object.keys(lines).length) {
    throw new Error("The model did not write what they think.");
  }
  return lines;
}
async function writeFittingLines(ctx, opts) {
  let { json: json } = await ctx.askJson(fittingRoomPrompt(opts), {
    maxTokens: 150 + 120 * opts.people.length,
    task: "fitting-room",
    about: opts.outfit.name,
  });
  return parseFittingLines(
    json,
    opts.people.map((person) => person.character.id),
  );
}

export { COUNTER_GREETINGS, writeCounterLines, writeFittingLines };
