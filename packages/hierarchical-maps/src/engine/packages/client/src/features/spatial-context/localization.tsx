import { createContext, useContext, useMemo, type ReactNode } from "react";
import englishCatalog from "./locales/en.json";
import koreanCatalog from "./locales/ko.json";

export type SpatialMapLocalizationContext = {
  locale?: string;
  direction?: "ltr" | "rtl";
};

type TranslationCatalog = Record<string, string>;
type SpatialMapLocalizationValue = {
  locale: string;
  direction: "ltr" | "rtl";
  t: (key: string) => string;
};

function translationCatalog(catalog: Record<string, unknown>): TranslationCatalog {
  return Object.fromEntries(
    Object.entries(catalog).filter(([key, value]) => key !== "_meta" && typeof value === "string"),
  ) as TranslationCatalog;
}

const catalogs: Record<string, TranslationCatalog> = {
  en: translationCatalog(englishCatalog),
  ko: translationCatalog(koreanCatalog),
};

function normalizeLocale(locale?: string) {
  return locale?.trim().replaceAll("_", "-") || "en";
}

function catalogForLocale(locale: string) {
  const exact = catalogs[locale] ?? catalogs[locale.toLowerCase()];
  if (exact) return exact;
  return catalogs[locale.split("-")[0]!.toLowerCase()] ?? catalogs.en;
}

const SpatialMapLocalization = createContext<SpatialMapLocalizationValue>({
  locale: "en",
  direction: "ltr" as const,
  t: (key: string) => catalogs.en[key] ?? key,
});

export function SpatialMapLocalizationProvider({
  localization,
  children,
}: {
  localization?: SpatialMapLocalizationContext;
  children: ReactNode;
}) {
  const locale = normalizeLocale(localization?.locale);
  const direction = localization?.direction === "rtl" ? "rtl" : "ltr";
  const value = useMemo<SpatialMapLocalizationValue>(
    () => ({
      locale,
      direction,
      t: (key: string) => catalogForLocale(locale)[key] ?? catalogs.en[key] ?? key,
    }),
    [direction, locale],
  );
  return <SpatialMapLocalization.Provider value={value}>{children}</SpatialMapLocalization.Provider>;
}

export function useSpatialMapTranslation() {
  return useContext(SpatialMapLocalization);
}
