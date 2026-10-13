// LLM lines for NPCs helping with rent/food, picked deterministically
import { ARCHETYPES } from "../relationships/archetypes.mjs";
import { cleanNarrationLine, fnv1aHash } from "./activity-lines.mjs";

var HELP_KIND_DESCRIPTIONS = {
  rent: "they cover part of the player's rent, as a loan, because the player is short of money",
  food: "they turn up at the player's door with something to eat, because the player is starving and has nothing at home",
};
var HELP_LINES_PER_TYPE = 5;
var HELP_LINE_MAX_LENGTH = 160;
function buildHelpLinesMessages(kind, { language = "English" } = {}) {
  let types = Object.values(ARCHETYPES).map(
    (archetype) => `- ${archetype.id}: ${archetype.name} \u2014 ${archetype.tone}`,
  ).join(`
`);
  return [
    {
      role: "system",
      content: [
        "Task: help-lines",
        `In a modern life sim, someone who cares about the player helps them: ${HELP_KIND_DESCRIPTIONS[kind]}. You write what they say as they do it.`,
        `Answer with JSON only, one entry for every type listed, exactly: {"<type id>":["\u2026"]}, ${HELP_LINES_PER_TYPE} different lines each.`,
        `Each line: what they say, first person, one or two short sentences, at most ${HELP_LINE_MAX_LENGTH} characters, true to how that type of person comes across (a prickly one helps and grumbles about it; a caretaker fusses). No names, no quotation marks, no numbers or amounts, nothing about the place, the time or the weather.`,
        `Write every line in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: `THE TYPES OF PEOPLE:
${types}`,
    },
  ];
}
function parseHelpLines(json) {
  let lines = {};
  for (let id of Object.keys(ARCHETYPES)) {
    let list = (Array.isArray(json?.[id]) ? json[id] : [])
      .map((line) => cleanNarrationLine(line))
      .filter((line) => line && line.length <= HELP_LINE_MAX_LENGTH)
      .slice(0, HELP_LINES_PER_TYPE + 2);
    if (list.length) {
      lines[id] = list;
    }
  }
  return lines;
}
async function requestHelpLines(model, kind, options = {}) {
  let { json: json } = await model.askJson(buildHelpLinesMessages(kind, options), {
    maxTokens: 2200,
    task: "help-lines",
    about: kind,
  });
  return parseHelpLines(json);
}
function pickHelpLine(bank, kind, archetype, seed = "") {
  let lines = bank?.help?.[kind]?.[archetype] ?? [];
  return lines.length ? lines[fnv1aHash(`${kind}|${archetype}|${seed}`) % lines.length] : null;
}

export { pickHelpLine, requestHelpLines };
