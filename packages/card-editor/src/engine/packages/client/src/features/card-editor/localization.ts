import englishCatalog from "./locales/en.json";

export type CardEditorLocalizationContext = {
  locale?: string;
  direction?: "ltr" | "rtl";
};

type TranslationValues = Record<string, string | number | boolean | null | undefined>;
type TranslationCatalog = Record<string, string>;

const english = Object.fromEntries(
  Object.entries(englishCatalog).filter(([key, value]) => key !== "_meta" && typeof value === "string"),
) as TranslationCatalog;
const catalogs: Record<string, TranslationCatalog> = { en: english };

function catalogForLocale(locale?: string): TranslationCatalog {
  const normalized = locale?.trim().replaceAll("_", "-").toLowerCase() || "en";
  return catalogs[normalized] ?? catalogs[normalized.split("-")[0]!] ?? english;
}

function interpolate(message: string, values?: TranslationValues): string {
  if (!values) return message;
  return message.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g, (token, name) => {
    const value = values[name];
    return value === null || value === undefined ? token : String(value);
  });
}

export function translateCardEditor(
  localization: CardEditorLocalizationContext | undefined,
  key: string,
  values?: TranslationValues,
): string {
  const catalog = catalogForLocale(localization?.locale);
  return interpolate(catalog[key] ?? english[key] ?? key, values);
}
