"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Mark } from "@/components/Brand";
import { cn } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";

export function AdminNav() {
  const path = usePathname();
  const t = useT();
  const tabs = [["admin.entities", "/admin"], ["admin.changelog", "/admin/changelog"]] as const;
  return (
    <header className="border-b border-line bg-surface sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2"><Mark size={22} /><span className="font-semibold text-ink">Keel</span><span className="text-[12px] text-ink-faint font-medium border-l border-line pl-2 ml-1">{t("admin.operator")}</span></Link>
        <nav className="flex items-center gap-1 ml-4">
          {tabs.map(([label, href]) => {
            const active = href === "/admin" ? path === "/admin" || path.startsWith("/admin/") && !path.startsWith("/admin/changelog") : path.startsWith(href);
            return <Link key={href} href={href} className={cn("h-8 px-3 rounded-lg text-[13px] font-medium inline-flex items-center transition", active ? "bg-accent-soft text-ink" : "text-ink-muted hover:bg-surface-2")}>{t(label)}</Link>;
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/" className="text-[13px] text-ink-muted hover:text-ink">{t("admin.site")}</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[13px] text-bad hover:underline">{t("topbar.signOut")}</button>
        </div>
      </div>
    </header>
  );
}
