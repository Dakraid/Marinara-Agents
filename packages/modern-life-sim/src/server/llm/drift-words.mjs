// LLM captions for NPCs off their usual schedule
function buildDriftWordsMessages(people, { language = "English", setting = "" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: drift-words",
        "In a modern life sim, each person below is not where their usual week puts them today: they went to the place given, at those hours. Why and where are already decided.",
        "For each one, write what they are doing there: 2 to 6 words, as a caption under their name (for example \xABout for a run\xBB, \xABcoffee with a friend\xBB). True to who they are and to that place and hour. With friends: they are out with friends there.",
        "No names, no quotation marks, no full sentence, no reason why they are not at their usual place. Keep it non-explicit.",
        'Answer with JSON only, exactly: {"doing":{"<key>":"\u2026"}}, one entry per key given.',
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
        "THE PEOPLE:",
        ...people.map(
          (person) =>
            `- ${person.key}: ${person.name}${person.description ? ` (${person.description})` : ""}${person.tone ? ` \xB7 comes across as ${person.tone}` : ""} \xB7 at ${person.place}, ${person.from}:00\u2013${person.to}:00${person.friends ? " \xB7 out with friends" : ""}`,
        ),
      ].filter(Boolean).join(`
`),
    },
  ];
}
function parseDriftWords(json, keys = []) {
  let doing = json?.doing && typeof json.doing == "object" ? json.doing : {},
    words = {};
  for (let key of keys) {
    let text =
      typeof doing[key] == "string"
        ? doing[key]
            .trim()
            .replace(/^["“”«»]+|["“”«»]+$/g, "")
            .trim()
        : "";
    if (text) {
      words[key] = text.slice(0, 60);
    }
  }
  return words;
}
async function requestDriftWords(model, people, options) {
  let { json: json } = await model.askJson(buildDriftWordsMessages(people, options), {
    maxTokens: 600,
    task: "drift-words",
    about: `${people.length} drifting`,
  });
  return parseDriftWords(
    json,
    people.map((person) => person.key),
  );
}

export { requestDriftWords };
