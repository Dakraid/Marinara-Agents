// LLM split of a character look into appearance and wearing
var cleanLookText = (text) =>
  String(text ?? "")
    // eslint-disable-next-line no-control-regex -- strips control characters
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);
function buildSplitLookPrompt(look, { name: charName = "" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: split-look",
        "You are given how a character looks. Sort it into two parts:",
        "- appearance: the body and everything that does not change with clothes (age, build, face, eyes, skin, hair, height; the art style if it is described).",
        "- wearing: the clothes, shoes and accessories they have on. Leave out gear that only appears in special situations (armour, a combat suit, a weapon).",
        "Do not add anything that is not there. If there is nothing about clothes, `wearing` is empty.",
        "Write both parts in English, whatever language the look is in: translate faithfully, keeping every detail and nothing more. Plain prose: no emoji, no marks, no quotes around them.",
        'Answer with JSON only: {"appearance":"...","wearing":"..."}',
      ].join(`
`),
    },
    {
      role: "user",
      content: `${
        charName
          ? `Name: ${charName}
`
          : ""
      }How they look:
${look}`,
    },
  ];
}
function parseSplitLook(json) {
  return {
    appearance: cleanLookText(json?.appearance),
    wearing: cleanLookText(json?.wearing),
  };
}
async function splitCharacterLook(model, look, { name: charName = "" } = {}) {
  let cleaned = cleanLookText(look);
  if (!cleaned) {
    return {
      appearance: "",
      wearing: "",
    };
  }
  let { json: json } = await model.askJson(
    buildSplitLookPrompt(cleaned, {
      name: charName,
    }),
    {
      maxTokens: 900,
      task: "split-look",
      about: charName,
    },
  );
  return parseSplitLook(json);
}

export { splitCharacterLook };
