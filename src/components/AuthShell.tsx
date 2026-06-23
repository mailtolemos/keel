"use client";
import Link from "next/link";
import { Logo, Mark } from "@/components/Brand";
import { useT } from "@/i18n/I18nProvider";

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const t = useT();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      <div className="flex flex-col justify-center px-6 sm:px-12 py-10">
        <div className="w-full max-w-sm mx-auto">
          <Logo />
          <h1 className="mt-10 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
      <div className="hidden lg:flex relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 grid-faint opacity-20" />
        <div className="relative flex flex-col justify-center px-14">
          <Mark size={40} />
          <p className="mt-8 text-3xl font-semibold tracking-tight leading-snug max-w-md">
            {t("auth.brandTagline")}
          </p>
          <p className="mt-4 text-graphite-300 max-w-md leading-relaxed">
            {t("auth.brandSub")}
          </p>
          <div className="mt-10 space-y-3 max-w-sm">
            {[t("auth.f1"), t("auth.f2"), t("auth.f3")].map((x) => (
              <div key={x} className="flex items-center gap-2.5 text-sm text-graphite-200">
                <span className="h-5 w-5 rounded-full bg-surface/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8466EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>{x}
              </div>
            ))}
          </div>
          <p className="mt-12 text-xs text-ink-faint">
            <Link href="/" className="hover:text-white">{t("auth.backTo")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
