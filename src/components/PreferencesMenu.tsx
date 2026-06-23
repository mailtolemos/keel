"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";

export function PreferencesMenu({ align = "right" }: { align?: "right" | "left" }) {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themes: { key: string; label: string; icon: keyof typeof Icon }[] = [
    { key: "light", label: t("theme.light"), icon: "sun" },
    { key: "dark", label: t("theme.dark"), icon: "moon" },
    { key: "system", label: t("theme.system"), icon: "monitor" }
  ];
  const current = LOCALE_LABELS[locale];

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Preferences"
        className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface text-ink-muted hover:bg-surface-2 transition text-[13px] font-medium">
        <Icon.globe size={16} className="text-ink-soft" />
        <span className="hidden sm:inline">{current.flag} {current.native}</span>
        <span className="sm:hidden">{current.flag}</span>
        <Icon.chevron size={13} className="text-ink-faint" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className={cn("absolute mt-1.5 w-60 rounded-xl border border-line bg-surface shadow-pop z-40 p-2 animate-fadeUp", align === "right" ? "right-0" : "left-0")}>
            <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{t("prefs.appearance")}</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {themes.map((th) => {
                const I = Icon[th.icon];
                const active = mounted && theme === th.key;
                return (
                  <button key={th.key} onClick={() => setTheme(th.key)}
                    className={cn("flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium transition",
                      active ? "border-accent bg-accent-soft text-accent-700 dark:text-accent-400" : "border-line text-ink-muted hover:bg-surface-2")}>
                    <I size={16} /> {th.label}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-line-2 my-1" />
            <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{t("prefs.language")}</p>
            <div className="space-y-0.5">
              {LOCALES.map((lc: Locale) => (
                <button key={lc} onClick={() => { setLocale(lc); setOpen(false); }}
                  className={cn("w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition",
                    locale === lc ? "bg-accent-soft text-accent-700 dark:text-accent-400 font-medium" : "text-ink-muted hover:bg-surface-2")}>
                  <span className="text-[15px]">{LOCALE_LABELS[lc].flag}</span>
                  <span className="flex-1 text-left">{LOCALE_LABELS[lc].native}</span>
                  {locale === lc && <Icon.check size={14} className="text-accent" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
