import type { CSSProperties } from "react";
import { usePokedexTranslation } from "./localization";
import type { DexEntry, PokedexGender } from "./types";

export function pokedexGenderSymbol(gender: PokedexGender): string {
  if (gender === "male") return "♂";
  if (gender === "female") return "♀";
  return "⚥";
}

type Translation = ReturnType<typeof usePokedexTranslation>["t"];

function genderLabel(gender: PokedexGender, t: Translation): string {
  if (gender === "male") return `${t("pokedex.card.gender.male")} ♂`;
  if (gender === "female") return `${t("pokedex.card.gender.female")} ♀`;
  return `${t("pokedex.card.gender.futanari")} ⚥`;
}

export function pokedexGlyphRating(rating: number, filled: string, empty: string): string {
  const bounded = Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.trunc(rating))) : 0;
  return filled.repeat(bounded) + empty.repeat(5 - bounded);
}

function displayNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

/** Inline styles mirror the shared server renderer (card-html.ts) so the React twin matches
 * the in-chat scan card 1:1. React escapes all model strings by construction. */
const CARD_STYLE: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "2px solid #232328",
  borderRadius: "8px",
  padding: "8px",
  textAlign: "center",
  fontFamily: "Consolas,monaco,monospace",
  color: "#fff",
  backgroundColor: "#111114",
  backgroundImage: "url(https://files.catbox.moe/xu0jxk.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const ARTWORK_STYLE: CSSProperties = {
  display: "block",
  width: "50%",
  height: "auto",
  margin: "0 auto",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#fff",
};

const SECTION_STYLE: CSSProperties = {
  margin: "8px 0",
  whiteSpace: "pre-wrap",
  textAlign: "left",
  font: "inherit",
  lineHeight: 1.35,
};

const RUBY_STYLE: CSSProperties = {
  margin: "8px 0",
  textAlign: "left",
  color: "#e0115f",
  lineHeight: 1.4,
};

const DIVIDER_STYLE: CSSProperties = {
  border: 0,
  borderTop: "1px solid #232328",
  margin: "8px 0",
};

const REVIEW_STYLE: CSSProperties = {
  fontStyle: "italic",
};

const VERDICT_STYLE: CSSProperties = {
  marginTop: "6px",
  fontWeight: "bold",
};

export function PokedexCard({ entry }: { entry: DexEntry }) {
  const { t } = usePokedexTranslation();
  const dexNumber = Math.max(1, Math.min(1025, Math.trunc(entry.dexNumber)));
  const artworkNumber = String(dexNumber).padStart(3, "0");
  const affection = pokedexGlyphRating(entry.affection.rating, "❤️", "💔");
  const heat = pokedexGlyphRating(entry.heat.rating, "🔥", "△");
  const stars = pokedexGlyphRating(entry.starRating, "★", "☆");
  const general = [
    t("pokedex.card.general"),
    `${t("pokedex.card.category")}: "${entry.category}"`,
    `${t("pokedex.card.gender")}: "${genderLabel(entry.gender, t)}"`,
    `${t("pokedex.card.archetype")}: "${entry.archetype}"`,
    `${t("pokedex.card.speech")}: "${entry.speech}"`,
    `${t("pokedex.card.height")}: ${displayNumber(entry.heightM)} m`,
    `${t("pokedex.card.weight")}: ${displayNumber(entry.weightKg)} kg`,
  ].join("\n");
  const sexual = [
    t("pokedex.card.sexual"),
    `${t("pokedex.card.knowledge")}: "${entry.sexualKnowledge}"`,
    `${t("pokedex.card.details")}: "${entry.anatomicalDetails}"`,
    `${t("pokedex.card.evolutionRequirement")}: "${entry.evolutionRequirement}"`,
  ].join("\n");
  return (
    <div className="pd-card" style={CARD_STYLE}>
      <img
        src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${artworkNumber}.png`}
        alt={entry.species}
        style={ARTWORK_STYLE}
        loading="lazy"
      />
      <div style={TITLE_STYLE}>
        {entry.name} #{dexNumber}
      </div>
      <pre style={SECTION_STYLE}>{`${general}\n\n${sexual}`}</pre>
      <div style={RUBY_STYLE}>
        <div>
          {t("pokedex.card.affection")}: {affection} ({entry.affection.state})
        </div>
        <div>↳ {entry.affection.cause}</div>
        <div>
          {t("pokedex.card.heat")}: {heat} ({entry.heat.state})
        </div>
        <div>↳ {entry.heat.advice}</div>
      </div>
      <hr style={DIVIDER_STYLE} />
      <div style={REVIEW_STYLE}>“{entry.trainerReview}”</div>
      <div style={VERDICT_STYLE}>
        {stars} ({entry.verdict.toUpperCase()})
      </div>
    </div>
  );
}
