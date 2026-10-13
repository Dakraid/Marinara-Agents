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
  return words ? words[gender === "female" ? 0 : gender === "male" ? 1 : 2] : "";
}
function kinOrRivalRelationNote({ kin = null, rival = false, gender = null } = {}) {
  return kin
    ? `the player's ${kinWordFor(kin, gender)}: family. Nothing romantic between them, ever; they treat the player as family would, true to who they are`
    : rival
      ? "the player's rival: they compete with each other, and neither likes to lose to the other"
      : "";
}
var toPlayerNote = (note) => (note ? `To the player: ${note}.` : "");
function kinOrRivalBadge({ kin = null, rival = false, rivalWas = false, gender = null } = {}) {
  return kin ? `Your ${kinWordFor(kin, gender)}` : rival ? "Your rival" : rivalWas ? "Used to be your rival" : "";
}

export { KIN_LABELS, kinOrRivalBadge, kinOrRivalRelationNote, kinWordFor, normalizeKinKind, toPlayerNote };
