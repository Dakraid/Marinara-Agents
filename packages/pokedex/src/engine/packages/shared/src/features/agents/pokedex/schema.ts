export const POKEDEX_DEFAULTS = Object.freeze({
  autoScan: true,
  injectTrackerContext: true,
  renderScanCards: true,
  maxRecentEncounters: 10,
});

export type PokedexGender = "male" | "female" | "futanari";
export type PokedexVerdict = "smash" | "pass";
export type PokedexEncounterOutcome = "met" | "joined" | "left" | "battled" | "fled";

export interface PokedexAffection {
  rating: number;
  state: string;
  cause: string;
}

export interface PokedexHeat {
  rating: number;
  state: string;
  advice: string;
}

export interface PokedexScan {
  species: string;
  dexNumber: number;
  name: string;
  category: string;
  gender: PokedexGender;
  archetype: string;
  speech: string;
  heightM: number;
  weightKg: number;
  sexualKnowledge: string;
  anatomicalDetails: string;
  evolutionRequirement: string;
  affection: PokedexAffection;
  heat: PokedexHeat;
  trainerReview: string;
  starRating: number;
  verdict: PokedexVerdict;
}

export interface DexEntry extends PokedexScan {
  key: string;
  firstMetAt: string;
  sourceMessageId: string;
}

export interface PokedexHaremMember {
  key: string;
  relationshipStatus: string;
  lastInteraction: string;
  currentStatus: string;
  joinedAt: string;
}

export interface PokedexPregnancy {
  key: string;
  eggsExpected: number;
  sire: string;
  bredAt: string;
  sourceMessageId: string;
}

export interface PokedexEncounter {
  key: string;
  outcome: PokedexEncounterOutcome;
  at: string;
  sourceMessageId: string;
}

export interface PokedexSettings {
  autoScan: boolean;
  injectTrackerContext: boolean;
  renderScanCards: boolean;
  maxRecentEncounters: number;
}

export interface PokedexVault {
  version: 1;
  dex: Record<string, DexEntry>;
  harem: PokedexHaremMember[];
  pregnancies: PokedexPregnancy[];
  recentEncounters: PokedexEncounter[];
  latestScan: { keys: string[]; at: string } | null;
  settings: PokedexSettings;
}

export interface PokedexUpdate {
  key: string;
  affection?: PokedexAffection;
  heat?: PokedexHeat;
  relationshipStatus?: string;
  lastInteraction?: string;
  currentStatus?: string;
}

export interface PokedexPregnancyEvent {
  type: "bred" | "laid";
  key: string;
  eggsExpected?: number;
  sire?: string;
}

export interface PokedexEncounterInput {
  key: string;
  outcome: PokedexEncounterOutcome;
}

function sourceRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.trunc(number))) : fallback;
}

function boundedNumber(value: unknown, max: number): number | null {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.min(max, Math.round(number * 100) / 100);
}

export function normalizePokedexString(value: unknown, maxLength: number, maxWords?: number): string {
  if (typeof value !== "string") return "";
  const words = value.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  return (maxWords ? words.slice(0, maxWords) : words).join(" ").slice(0, maxLength).trim();
}

export function normalizePokedexKey(value: unknown): string {
  const key = normalizePokedexString(value, 80).toLocaleLowerCase("en-US");
  return key === "__proto__" || key === "constructor" || key === "prototype" ? "" : key;
}

export function normalizePokedexRating(value: unknown): number {
  return boundedInteger(value, 0, 0, 5);
}

export function normalizePokedexGender(value: unknown): PokedexGender | null {
  return value === "male" || value === "female" || value === "futanari" ? value : null;
}

export function normalizePokedexVerdict(value: unknown): PokedexVerdict | null {
  return value === "smash" || value === "pass" ? value : null;
}

export function normalizePokedexDexNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(1025, Math.trunc(number))) : null;
}

export function normalizePokedexEncounterOutcome(value: unknown): PokedexEncounterOutcome | null {
  return value === "met" || value === "joined" || value === "left" || value === "battled" || value === "fled"
    ? value
    : null;
}

export function normalizePokedexEggsExpected(value: unknown): number {
  return boundedInteger(value, 1, 1, 100);
}

export function normalizePokedexSettings(value: unknown): PokedexSettings {
  const source = sourceRecord(value) ?? {};
  return {
    autoScan: typeof source.autoScan === "boolean" ? source.autoScan : POKEDEX_DEFAULTS.autoScan,
    injectTrackerContext:
      typeof source.injectTrackerContext === "boolean"
        ? source.injectTrackerContext
        : POKEDEX_DEFAULTS.injectTrackerContext,
    renderScanCards:
      typeof source.renderScanCards === "boolean" ? source.renderScanCards : POKEDEX_DEFAULTS.renderScanCards,
    maxRecentEncounters: boundedInteger(source.maxRecentEncounters, POKEDEX_DEFAULTS.maxRecentEncounters, 3, 25),
  };
}

export function normalizePokedexAffection(value: unknown): PokedexAffection | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const state = normalizePokedexString(source.state, 120);
  const cause = normalizePokedexString(source.cause, 240);
  if (!state || !cause) return null;
  return { rating: normalizePokedexRating(source.rating), state, cause };
}

export function normalizePokedexHeat(value: unknown): PokedexHeat | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const state = normalizePokedexString(source.state, 120);
  const advice = normalizePokedexString(source.advice, 240);
  if (!state || !advice) return null;
  return { rating: normalizePokedexRating(source.rating), state, advice };
}

export function normalizePokedexScan(value: unknown): PokedexScan | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const species = normalizePokedexString(source.species, 80);
  const dexNumber = normalizePokedexDexNumber(source.dexNumber);
  const gender = normalizePokedexGender(source.gender);
  const verdict = normalizePokedexVerdict(source.verdict);
  const affection = normalizePokedexAffection(source.affection);
  const heat = normalizePokedexHeat(source.heat);
  const heightM = boundedNumber(source.heightM, 1_000);
  const weightKg = boundedNumber(source.weightKg, 100_000);
  const category = normalizePokedexString(source.category, 120);
  const archetype = normalizePokedexString(source.archetype, 160);
  const speech = normalizePokedexString(source.speech, 240);
  const sexualKnowledge = normalizePokedexString(source.sexualKnowledge, 160, 10);
  const anatomicalDetails = normalizePokedexString(source.anatomicalDetails, 320, 20);
  const evolutionRequirement = normalizePokedexString(source.evolutionRequirement, 120, 7);
  const trainerReview = normalizePokedexString(source.trainerReview, 240, 20);
  if (
    !species ||
    dexNumber === null ||
    !gender ||
    !verdict ||
    !affection ||
    !heat ||
    heightM === null ||
    weightKg === null ||
    !category ||
    !archetype ||
    !speech ||
    !sexualKnowledge ||
    !anatomicalDetails ||
    !evolutionRequirement ||
    !trainerReview
  ) {
    return null;
  }
  return {
    species,
    dexNumber,
    name: normalizePokedexString(source.name, 80) || species,
    category,
    gender,
    archetype,
    speech,
    heightM,
    weightKg,
    sexualKnowledge,
    anatomicalDetails,
    evolutionRequirement,
    affection,
    heat,
    trainerReview,
    starRating: normalizePokedexRating(source.starRating),
    verdict,
  };
}

export function normalizePokedexUpdate(value: unknown): PokedexUpdate | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const key = normalizePokedexKey(source.key);
  if (!key) return null;
  const update: PokedexUpdate = { key };
  const affection = normalizePokedexAffection(source.affection);
  const heat = normalizePokedexHeat(source.heat);
  const relationshipStatus = normalizePokedexString(source.relationshipStatus, 160);
  const lastInteraction = normalizePokedexString(source.lastInteraction, 300);
  const currentStatus = normalizePokedexString(source.currentStatus, 200);
  if (affection) update.affection = affection;
  if (heat) update.heat = heat;
  if (relationshipStatus) update.relationshipStatus = relationshipStatus;
  if (lastInteraction) update.lastInteraction = lastInteraction;
  if (currentStatus) update.currentStatus = currentStatus;
  return Object.keys(update).length > 1 ? update : null;
}

export function normalizePokedexPregnancyEvent(value: unknown): PokedexPregnancyEvent | null {
  const source = sourceRecord(value);
  if (!source || (source.type !== "bred" && source.type !== "laid")) return null;
  const key = normalizePokedexKey(source.key);
  if (!key) return null;
  if (source.type === "laid") return { type: "laid", key };
  const sire = normalizePokedexString(source.sire, 120);
  return {
    type: "bred",
    key,
    ...(source.eggsExpected === undefined ? {} : { eggsExpected: normalizePokedexEggsExpected(source.eggsExpected) }),
    ...(sire ? { sire } : {}),
  };
}

export function normalizePokedexEncounter(value: unknown): PokedexEncounterInput | null {
  const source = sourceRecord(value);
  if (!source) return null;
  const key = normalizePokedexKey(source.key);
  const outcome = normalizePokedexEncounterOutcome(source.outcome);
  return key && outcome ? { key, outcome } : null;
}

export function emptyPokedexVault(): PokedexVault {
  return {
    version: 1,
    dex: {},
    harem: [],
    pregnancies: [],
    recentEncounters: [],
    latestScan: null,
    settings: { ...POKEDEX_DEFAULTS },
  };
}
