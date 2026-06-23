export const LOCALES = ["en", "fr", "it", "de", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "keel_locale";

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string; native: string }> = {
  en: { label: "English", native: "English", flag: "🇬🇧" },
  fr: { label: "French", native: "Français", flag: "🇫🇷" },
  it: { label: "Italian", native: "Italiano", flag: "🇮🇹" },
  de: { label: "German", native: "Deutsch", flag: "🇩🇪" },
  pt: { label: "Portuguese", native: "Português", flag: "🇵🇹" }
};

export function isLocale(x: string | undefined | null): x is Locale {
  return !!x && (LOCALES as readonly string[]).includes(x);
}
