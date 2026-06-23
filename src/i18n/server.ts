import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { getDictionary, translate } from "./dictionaries";

export function getLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(c) ? c : DEFAULT_LOCALE;
}

// Server-side translator: const t = getT();  t("nav.people")
export function getT() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = (key: string, vars?: Record<string, string | number>) => translate(dict, key, vars);
  return Object.assign(t, { locale });
}
