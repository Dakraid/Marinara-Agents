// Starting relation presets applied to a bond
import { BOND_TIER_THRESHOLDS, STATUS_STEPS, breakUpBond, setRelationshipStatus } from "./bonds.mjs";
import { normalizeKinKind } from "./kin.mjs";

var STARTING_RELATIONS = {
  no: {
    label: "Has not met you",
    tier: null,
  },
  friendly: {
    label: "Has met you",
    tier: 1,
  },
  friend: {
    label: "A friend",
    tier: 2,
  },
  close: {
    label: "A close friend",
    tier: 3,
  },
  family: {
    label: "Family",
    tier: 2,
    trust: 2,
  },
  couple: {
    label: "Your partner",
    tier: 2,
    trust: 2,
  },
  ex: {
    label: "Your ex",
    tier: 1,
  },
  rivals: {
    label: "Your rival",
    tier: 1,
    trust: 0,
  },
};
var EX_STARTING_ROMANCE = 20;
var STARTING_RELATION_IDS = Object.keys(STARTING_RELATIONS);
var normalizeStartingRelation = (relation) => (STARTING_RELATION_IDS.includes(relation) ? relation : "no");
function applyStartingRelation(bond, relation, { at = 0, kin = null } = {}) {
  let spec = STARTING_RELATIONS[normalizeStartingRelation(relation)];
  if (((bond.met = true), spec.tier === null)) {
    return bond;
  }
  bond.friendship = Math.max(bond.friendship, BOND_TIER_THRESHOLDS[spec.tier] + 1);
  let trustTier = spec.trust ?? spec.tier - 1;
  if (trustTier > 0 || spec.trust === undefined) {
    bond.trust = Math.max(bond.trust, BOND_TIER_THRESHOLDS[trustTier] + 1);
  }
  if (relation === "family") {
    bond.kin = normalizeKinKind(kin) ?? "relatives";
    bond.romanceable = false;
  }
  if (relation === "rivals") {
    bond.rival = true;
    bond.trust = 0;
  }
  if (relation === "couple") {
    bond.romance = Math.max(bond.romance, STATUS_STEPS.partners.romance + 1);
    bond.trust = Math.max(bond.trust, STATUS_STEPS.partners.trust + 1);
    setRelationshipStatus(bond, "partners", {
      at: at,
    });
  }
  if (relation === "ex") {
    breakUpBond(bond, {
      at: at,
    });
    bond.romance = Math.max(bond.romance, EX_STARTING_ROMANCE);
    bond.trust = Math.max(bond.trust, BOND_TIER_THRESHOLDS[0] + 1);
  }
  if (relation === "couple" || relation === "ex") {
    bond.milestones = {
      ...(bond.milestones ?? {}),
      firstKiss: bond.milestones?.firstKiss ?? at,
    };
  }
  return bond;
}

export { STARTING_RELATIONS, applyStartingRelation, normalizeStartingRelation };
