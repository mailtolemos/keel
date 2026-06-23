"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PreferencesMenu } from "@/components/PreferencesMenu";
import { useT } from "@/i18n/I18nProvider";

export function Topbar({ name, email, role, image, slug, isPlatformAdmin }: { name: string; email: string; role: string; image?: string | null; slug: string; isPlatformAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <header className="h-14 sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur flex items-center gap-3 px-5">
      <div className="relative flex-1 max-w-md">
        <Icon.search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
        <input placeholder={t("topbar.search")} className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-12 text-sm placeholder:text-ink-faint focus:outline-none focus:border-accent focus:shadow-focus transition" />
        <span className="kbd absolute right-2 top-1/2 -translate-y-1/2">⌘K</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <PreferencesMenu />
        {isPlatformAdmin && (
          <Link href="/admin" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line text-[13px] font-medium text-ink-muted hover:bg-surface-2">
            <Icon.org size={15} className="text-accent" /> {t("topbar.operator")}
          </Link>
        )}
        <button className="h-9 w-9 grid place-items-center rounded-lg text-ink-soft hover:bg-surface-2"><Icon.bell size={18} /></button>
        <div className="relative">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg pl-1 pr-2 h-9 hover:bg-surface-2">
            <Avatar name={name} src={image} size={28} />
            <span className="hidden sm:block text-[13px] font-medium text-ink max-w-[120px] truncate">{name}</span>
            <Icon.chevron size={14} className="text-ink-faint" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-line bg-surface shadow-pop z-20 p-1.5 animate-fadeUp">
                <div className="px-2.5 py-2">
                  <p className="text-sm font-medium text-ink truncate">{name}</p>
                  <p className="text-[12px] text-ink-soft truncate">{email}</p>
                  <span className="mt-1 inline-block rounded-md bg-accent-soft text-accent-700 dark:text-accent-400 text-[11px] px-1.5 py-0.5 font-medium">{t(role === "ADMIN" ? "role.admin" : role === "MANAGER" ? "role.manager" : "role.employee")}</span>
                </div>
                <div className="h-px bg-surface-2 my-1" />
                <Link href={`/${slug}/settings`} onClick={() => setOpen(false)} className="block rounded-lg px-2.5 py-1.5 text-[13px] text-ink-muted hover:bg-surface-2">{t("topbar.settings")}</Link>
                {isPlatformAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-2.5 py-1.5 text-[13px] text-ink-muted hover:bg-surface-2">{t("topbar.operatorConsole")}</Link>}
                <Link href="/" className="block rounded-lg px-2.5 py-1.5 text-[13px] text-ink-muted hover:bg-surface-2">{t("topbar.marketingSite")}</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left rounded-lg px-2.5 py-1.5 text-[13px] text-bad hover:bg-red-50">{t("topbar.signOut")}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
function roleLabel(r: string) { return r === "ADMIN" ? "Admin" : r === "MANAGER" ? "Manager" : "Employee"; }
