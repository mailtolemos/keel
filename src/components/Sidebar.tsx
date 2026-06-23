"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/Brand";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";

const NAV = [
  ["nav.home", "", "home"],
  ["nav.people", "/people", "people"],
  ["nav.teams", "/teams", "teams"],
  ["nav.reviews", "/reviews", "reviews"],
  ["nav.feedback", "/feedback", "feedback"],
  ["nav.goals", "/goals", "goals"],
  ["nav.oneonones", "/one-on-ones", "oneonone"],
  ["nav.leave", "/leave", "leave"],
  ["nav.calendar", "/calendar", "calendar"]
] as const;

export function Sidebar({ company, slug }: { company: string; slug: string }) {
  const path = usePathname();
  const t = useT();
  const base = `/${slug}`;
  return (
    <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-line bg-surface h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-line">
        <Mark size={22} />
        <span className="font-semibold text-ink text-[15px] truncate">{company}</span>
      </div>
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV.map(([label, suffix, icon]) => {
          const href = `${base}${suffix}`;
          const active = suffix === "" ? path === base : path.startsWith(href);
          const I = Icon[icon as keyof typeof Icon];
          return (
            <Link key={label} href={href}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-[13.5px] font-medium transition",
                active ? "bg-accent-soft text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink")}>
              <I className={active ? "text-accent" : "text-ink-faint"} />
              {t(label)}
            </Link>
          );
        })}
      </nav>
      <div className="p-2.5 border-t border-line">
        <Link href={`${base}/settings`}
          className={cn("flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-[13.5px] font-medium transition",
            path.startsWith(`${base}/settings`) ? "bg-accent-soft text-ink" : "text-ink-muted hover:bg-surface-2")}>
          <Icon.settings className={path.startsWith(`${base}/settings`) ? "text-accent" : "text-ink-faint"} /> {t("nav.settings")}
        </Link>
      </div>
    </aside>
  );
}
