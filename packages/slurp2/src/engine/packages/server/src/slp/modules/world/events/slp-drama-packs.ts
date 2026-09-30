/**
 * The situations and dramas Slurp ships (`docs/DRAMA.md`, starter set). Every one is off until the
 * player switches it on in Backstage › Drama. Written as data and validated by the same schema as an
 * imported pack, so a built-in can never do what a pack could not.
 */
import type { SlpDrama, SlpSituation } from "../../../../../../shared/src/slp/slp-drama.js";

export const SLURP_BUILTIN_SITUATIONS: readonly SlpSituation[] = [];
export const SLURP_BUILTIN_DRAMAS: readonly SlpDrama[] = [];
