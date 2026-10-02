import type { Root } from "react-dom/client";

/**
 * Client-side mirrors of the shared Pokédex vault schema. The server teammate owns the
 * authoritative copy under packages/shared/src/features/agents/pokedex/schema.ts — keep this
 * structurally identical to it (and to the ARCH vault contract).
 */
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

export interface DexEntry {
  key: string;
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

export type PokedexLocalizationContext = {
  locale?: string;
  direction?: "ltr" | "rtl";
};

export type CapabilityProps = {
  package?: { name?: string; version?: string };
  localization?: PokedexLocalizationContext;
  chatId?: string | null;
  chatMode?: "conversation" | "roleplay" | "game" | null;
  mobileCompact?: boolean;
  toolbarButtonClass?: string;
  onRerunTracker?: () => void;
  trackerRetryBusy?: boolean;
  lockMode?: boolean;
  onToggleLockMode?: () => void;
  detached?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  confirmAction?: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    tone?: "destructive" | "default";
  }) => boolean | Promise<boolean>;
};

export type CapabilityElement = HTMLElement & {
  capabilityProps?: CapabilityProps;
  capabilityRuntimeError?: string | null;
  __root?: Root | null;
};
