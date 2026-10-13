// LLM description of a character figure (sex, body, outfit, seasons) for illustration
import { parseFourSeasonOutfits } from "./season-outfits.mjs";

var FIGURE_SEXES = ["female", "male", "other"];
var FIGURE_BODY_MAX = 420;
var FIGURE_OUTFIT_MAX = 260;
var cleanFigureText = (text, max) =>
  String(text ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["“”«»]+|["“”«»]+$/g, "")
    .slice(0, max)
    .trim();
function cleanFigure(raw, { from = "model" } = {}) {
  return {
    sex: FIGURE_SEXES.includes(
      String(raw?.sex ?? "")
        .trim()
        .toLowerCase(),
    )
      ? String(raw.sex).trim().toLowerCase()
      : "other",
    body: cleanFigureText(raw?.body, FIGURE_BODY_MAX),
    outfit: cleanFigureText(raw?.outfit, FIGURE_OUTFIT_MAX),
    from: from === "hand" ? "hand" : "model",
  };
}
function figureMessages({ name: personName = "", appearance = "", description = "" } = {}, { seasons = false } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: figure",
        `You prepare a person to be drawn in an illustration. From what is written about them, give ${seasons ? "four" : "three"} things, in English:`,
        "- `sex`: exactly one of female, male, other.",
        "- `body`: the body and face ONLY, as the text gives them: the traits it states (age, build, height, hair, eyes, skin, distinctive marks), in its own words and colours; if it is written as tags, keep them as tags. Never add a trait it does not state. When it has the tag of the work they come from (like \xABxxx (series)\xBB), keep that tag first. Not their name: the code adds it. No clothes, no accessories, no personality.",
        "- `outfit`: the clothes they would wear on an ordinary day around town. If several outfits are described (a uniform, a combat suit, a costume), pick the everyday one; if none fits, invent plain casual clothes that suit them.",
        ...(seasons
          ? [
              "- `seasons`: what they wear out and about in each season, NOT at work: their own version of that everyday outfit (its colours, cut, the accessories they are never without) for the weather, fitting who they are (personality, story). Clothes and accessories only.",
            ]
          : []),
        `At most 60 words for the body and 40 for the outfit${seasons ? ", 35 for each season" : ""}.`,
        "Never the art style, medium or rendering (anime, linework, shading, realistic\u2026): the picture's style is set elsewhere.",
        seasons
          ? 'Answer with JSON only, exactly: {"sex":"\u2026","body":"\u2026","outfit":"\u2026","seasons":{"spring":"\u2026","summer":"\u2026","autumn":"\u2026","winter":"\u2026"}}'
          : 'Answer with JSON only, exactly: {"sex":"\u2026","body":"\u2026","outfit":"\u2026"}',
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        personName ? `NAME: ${personName}` : "",
        appearance ? `APPEARANCE: ${appearance}` : "",
        !appearance && description ? `DESCRIPTION: ${description}` : "",
        seasons && appearance && description ? `WHO THEY ARE: ${String(description).slice(0, 1500)}` : "",
      ].filter(Boolean).join(`
`),
    },
  ];
}
async function describeFigureWithSeasons(host, person) {
  let { json: json } = await host.askJson(
      figureMessages(person, {
        seasons: true,
      }),
      {
        maxTokens: 700,
        task: "figure",
        about: person.name ?? "",
      },
    ),
    figure = cleanFigure(json);
  if (!figure.body) {
    throw new Error("The model described no body.");
  }
  return {
    figure: figure,
    seasons: parseFourSeasonOutfits(json?.seasons),
  };
}
async function describeFigure(host, person) {
  let { json: json } = await host.askJson(figureMessages(person), {
      maxTokens: 400,
      task: "figure",
      about: person.name ?? "",
    }),
    figure = cleanFigure(json);
  if (!figure.body) {
    throw new Error("The model described no body.");
  }
  return figure;
}

export { cleanFigure, describeFigure, describeFigureWithSeasons };
