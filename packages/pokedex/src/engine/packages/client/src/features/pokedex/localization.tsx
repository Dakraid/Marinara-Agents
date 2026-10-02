import { createContext, useContext, useMemo, type ReactNode } from "react";
import englishCatalog from "./locales/en.json";
import type { PokedexLocalizationContext } from "./types";

type TranslationValues = Record<string, string | number | boolean | null | undefined>;
type TranslationCatalog = Record<string, string>;
type TranslationFunction = (key: string, values?: TranslationValues) => string;

function translationCatalog(catalog: Record<string, unknown>): TranslationCatalog {
  return Object.fromEntries(
    Object.entries(catalog).filter(([key, value]) => key !== "_meta" && typeof value === "string"),
  ) as TranslationCatalog;
}

const catalogs: Record<string, TranslationCatalog> = {
  en: translationCatalog(englishCatalog),
};

function normalizeLocale(locale?: string) {
  return locale?.trim().replaceAll("_", "-") || "en";
}

function catalogForLocale(locale: string) {
  const exact = catalogs[locale] ?? catalogs[locale.toLowerCase()];
  if (exact) return exact;
  return catalogs[locale.split("-")[0]!.toLowerCase()] ?? catalogs.en;
}

function interpolate(message: string, values?: TranslationValues): string {
  if (!values) return message;
  return message.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g, (token, name) => {
    const value = values[name];
    return value === null || value === undefined ? token : String(value);
  });
}

export function translatePokedex(
  localization: PokedexLocalizationContext | undefined,
  key: string,
  values?: TranslationValues,
): string {
  const catalog = catalogForLocale(normalizeLocale(localization?.locale));
  return interpolate(catalog[key] ?? catalogs.en[key] ?? key, values);
}

const LocalizationContext = createContext<{
  direction: "ltr" | "rtl";
  t: TranslationFunction;
}>({ direction: "ltr", t: (key, values) => translatePokedex(undefined, key, values) });

export function PokedexLocalizationProvider({
  localization,
  children,
}: {
  localization?: PokedexLocalizationContext;
  children: ReactNode;
}) {
  const locale = normalizeLocale(localization?.locale);
  const direction = localization?.direction === "rtl" ? "rtl" : "ltr";
  const value = useMemo(
    () => ({ direction, t: (key: string, values?: TranslationValues) => translatePokedex({ locale }, key, values) }),
    [direction, locale],
  );
  return (
    <LocalizationContext.Provider value={value}>
      <div dir={direction} style={{ display: "contents" }}>
        {children}
      </div>
    </LocalizationContext.Provider>
  );
}

export function usePokedexTranslation() {
  return useContext(LocalizationContext);
}
