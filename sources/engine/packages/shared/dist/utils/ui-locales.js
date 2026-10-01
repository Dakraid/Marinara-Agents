/** English ships with Engine; these community packs live on docs-i18n/ui. */
export const UI_LANGUAGE_CODES = [
    "en",
    "ar",
    "de",
    "es",
    "fr",
    "hi",
    "ja",
    "ko",
    "pl",
    "pt-BR",
    "ru",
    "zh-Hans",
];
export function normalizeUILanguage(value) {
    if (typeof value !== "string")
        return null;
    try {
        const locale = Intl.getCanonicalLocales(value.trim())[0];
        return UI_LANGUAGE_CODES.find((code) => code === locale) ?? null;
    }
    catch {
        return null;
    }
}
const INTENTIONALLY_EMPTY_TRANSLATION_KEYS = new Set([
    "ui.lorebooks.lorebookeditor.es",
    "ui.noodle.stageprofileview.s",
]);
/** Validate downloaded JSON before installing or exposing it to the translator. */
export function normalizeLocaleResource(locale, input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Error(`${locale}.json must contain a JSON object`);
    }
    const resource = input;
    const rawMetadata = resource._meta;
    if (!rawMetadata || typeof rawMetadata !== "object" || Array.isArray(rawMetadata)) {
        throw new Error(`${locale}.json is missing its _meta object`);
    }
    const metadata = rawMetadata;
    const direction = metadata.direction;
    if (normalizeUILanguage(metadata.locale) !== locale || (direction !== "ltr" && direction !== "rtl")) {
        throw new Error(`${locale}.json has invalid locale metadata`);
    }
    const messages = {};
    for (const [key, value] of Object.entries(resource)) {
        if (key === "_meta")
            continue;
        const intentionallyEmpty = value === "" && locale !== "en" && INTENTIONALLY_EMPTY_TRANSLATION_KEYS.has(key);
        if (typeof value !== "string" || (!value.trim() && !intentionallyEmpty)) {
            throw new Error(`${locale}.json key ${key} must contain non-empty text`);
        }
        messages[key] = value;
    }
    return { metadata: { locale, direction }, messages };
}
//# sourceMappingURL=ui-locales.js.map