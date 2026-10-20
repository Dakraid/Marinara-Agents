/**
 * The six extensions on top of Basic (docs/CONFIGURATOR.md, How a real switch works): one flat
 * boolean each in Slurp settings, read through `slpExtensionOn` on server and client alike. Off
 * hides an extension and stops its work; its data and its own settings stay as they are.
 */
import type { SlpActionName } from "./slp-actions.js";

export const SLP_EXTENSIONS = ["ads", "storylines", "world", "stir", "supportDesk", "engineLink"] as const;
export type SlpExtensionId = (typeof SLP_EXTENSIONS)[number];

/** The settings key of each switch. */
export const SLP_EXTENSION_KEYS = {
  ads: "extAds",
  storylines: "extStorylines",
  world: "extWorld",
  stir: "extStir",
  supportDesk: "extSupportDesk",
  engineLink: "extEngineLink",
} as const satisfies Record<SlpExtensionId, string>;
export type SlpExtensionKey = (typeof SLP_EXTENSION_KEYS)[SlpExtensionId];
export type SlpExtensionSettings = Partial<Record<SlpExtensionKey, boolean>>;

export function slpExtensionOn(settings: SlpExtensionSettings, id: SlpExtensionId): boolean {
  return settings[SLP_EXTENSION_KEYS[id]] === true;
}

/** Null is Basic: always on. */
export function slpExtensionAllows(settings: SlpExtensionSettings, extension: SlpExtensionId | null): boolean {
  return extension === null || slpExtensionOn(settings, extension);
}

/** The actions each extension owns; every other action is Basic. Off refuses them and hides them. */
const SLP_EXTENSION_ACTIONS: Partial<Record<SlpExtensionId, readonly SlpActionName[]>> = {
  ads: ["list-brands", "draw-brand-picture", "offer-brand-deal"],
  storylines: [
    "set-up-couple",
    "steer-couple",
    "couple-page",
    "add-to-couple",
    "start-drama",
    "end-drama",
    "suggest-collab",
    "push-collab",
    "start-rivalry",
    "cool-rivalry",
    "steer-storyline",
    "start-storyline",
  ],
  world: ["list-world", "start-event", "invent-event", "start-trend", "steer-trend"],
  supportDesk: [
    "grant-perk",
    "set-challenge",
    "offer-contract",
    "cash-favour",
    "throttle-reach",
    "plant-rumour",
    "seed-trend",
    "warn-creator",
  ],
};

export function slpActionExtension(name: SlpActionName): SlpExtensionId | null {
  return SLP_EXTENSIONS.find((id) => SLP_EXTENSION_ACTIONS[id]?.includes(name)) ?? null;
}

export function slpActionAllowed(settings: SlpExtensionSettings, name: SlpActionName): boolean {
  return slpExtensionAllows(settings, slpActionExtension(name));
}

/**
 * The one-time switch-on for settings saved before the switches existed (the stored record then
 * lacks the key; once saved, the key is the mark and this never runs again). Generous side: an
 * extension is on unless today's flags already have all of it off. A new install starts on Basic.
 */
export function slpExtensionFromLegacy(
  id: SlpExtensionId,
  raw: Record<string, unknown>,
  defaults: { inlineAdsEnabled: boolean; brandDealsPace: string },
): boolean {
  if (Object.keys(raw).length === 0) return false;
  if (id === "ads") {
    const ads = raw.inlineAdsEnabled ?? defaults.inlineAdsEnabled;
    const deals = raw.brandDealsPace ?? defaults.brandDealsPace;
    return ads !== false || deals !== "off";
  }
  return true;
}

/** Inline ads show only while Brands & ads is on and the ads themselves are. */
export function slpInlineAdsOn(settings: SlpExtensionSettings & { inlineAdsEnabled: boolean }): boolean {
  return slpExtensionOn(settings, "ads") && settings.inlineAdsEnabled;
}

/** The brand-deal pace in effect: off while Brands & ads is off. */
export function slpBrandDealsPace<T extends string>(settings: SlpExtensionSettings & { brandDealsPace: T }): T | "off" {
  return slpExtensionOn(settings, "ads") ? settings.brandDealsPace : "off";
}

/**
 * The platform events whose effects run: none while Living world is off. Effect readers (prompts,
 * reach, economy, calendar beats) take this; editors keep `settings.platformEvents`, so the saved
 * list is never lost.
 */
export function slpLiveEvents<T>(settings: SlpExtensionSettings & { platformEvents: readonly T[] }): readonly T[] {
  return slpExtensionOn(settings, "world") ? settings.platformEvents : [];
}

/** Trends run only while Living world is on and its own "Viral trends" switch is. */
export function slpTrendsOn(settings: SlpExtensionSettings & { trendsEnabled: boolean }): boolean {
  return slpExtensionOn(settings, "world") && settings.trendsEnabled;
}
