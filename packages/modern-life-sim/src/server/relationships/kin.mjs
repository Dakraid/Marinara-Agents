// Kin kinds, gendered kin words and kin/rival notes
var KIN_KINDS = ["siblings", "parent", "cousins", "relatives"];
var normalizeKinKind = (kind) => (KIN_KINDS.includes(kind) ? kind : null);
var KIN_LABELS = {
  siblings: "Sibling",
  parent: "Parent",
  cousins: "Cousin",
  relatives: "Relative",
};
function kinWordFor(kind, gender = null) {
  let words = {
    siblings: ["sister", "brother", "sibling"],
    parent: ["mother", "father", "parent"],
    cousins: ["cousin", "cousin", "cousin"],
    relatives: ["relative", "relative", "relative"],
  }[kind];
  return words ? words[gender === "female" || gender === "futanari" ? 0 : gender === "male" ? 1 : 2] : "";
}
// Family rules out romance, unless the life's familyRomance rule lifts it.
var kinBarsRomance = (state, bond) => !!bond?.kin && !state?.rules?.familyRomance;
var familyPairBarsRomance = (state, pair) => pair?.kind === "family" && !state?.rules?.familyRomance;
function kinOrRivalRelationNote({ kin = null, rival = false, gender = null, romance = false } = {}) {
  return kin
    ? `the player's ${kinWordFor(kin, gender)}: family. ${romance ? "Romance between them is not ruled out" : "Nothing romantic between them, ever"}; they treat the player as family would, true to who they are`
    : rival
      ? "the player's rival: they compete with each other, and neither likes to lose to the other"
      : "";
}
var toPlayerNote = (note) => (note ? `To the player: ${note}.` : "");
function kinOrRivalBadge({ kin = null, rival = false, rivalWas = false, gender = null } = {}) {
  return kin ? `Your ${kinWordFor(kin, gender)}` : rival ? "Your rival" : rivalWas ? "Used to be your rival" : "";
}

export {
  KIN_LABELS,
  familyPairBarsRomance,
  kinBarsRomance,
  kinOrRivalBadge,
  kinOrRivalRelationNote,
  kinWordFor,
  normalizeKinKind,
  toPlayerNote,
};
