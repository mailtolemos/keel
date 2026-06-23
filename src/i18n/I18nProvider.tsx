"use client";
import { createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";
import { translate, type Dict } from "./dictionaries";

type Ctx = { locale: Locale; dict: Dict };
const I18nContext = createContext<Ctx>({ locale: DEFAULT_LOCALE, dict: {} });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dict; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useT() {
  const { dict } = useContext(I18nContext);
  return useCallback((key: string, vars?: Record<string, string | number>) => translate(dict, key, vars), [dict]);
}

export function useLocale() {
  const { locale } = useContext(I18nContext);
  const router = useRouter();
  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return { locale, setLocale };
}
