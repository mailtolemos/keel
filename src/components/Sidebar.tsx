"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/Brand";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";

const NAV = [
  ["Home", "", "home"],
  ["People", "/people", "people"],
  ["Teams", "/teams", "teams"],
  ["Reviews", "/reviews", "reviews"],
  ["Feedback", "/feedback", "feedback"],
  ["Goals", "/goals", "goals"],
  ["1:1s", "/one-on-ones", "oneonone"],
  ["Leave", "/leave", "leave"],
  ["Calendar", "/calendar", "calendar"]
] as const;

export function Sidebar({ company, slug }: { company: string; slug: string }) {
  const path = usePathname();
  const base = `/${slug}`;
  return (
    <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-graphite-200 bg-white h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-graphite-200">
        <Mark size={22} />
        <span className="font-semibold text-navy text-[15px] truncate">{company}</span>
      </div>
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV.map(([label, suffix, icon]) => {
          const href = `${base}${suffix}`;
          const active = suffix === "" ? path === base : path.startsWith(href);
          const I = Icon[icon as keyof typeof Icon];
          return (
            <Link key={label} href={href}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-[13.5px] font-medium transition",
                active ? "bg-navy-50 text-navy" : "text-graphite-600 hover:bg-graphite-50 hover:text-navy")}>
              <I className={active ? "text-accent" : "text-graphite-400"} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2.5 border-t border-graphite-200">
        <Link href={`${base}/settings`}
          className={cn("flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-[13.5px] font-medium transition",
            path.startsWith(`${base}/settings`) ? "bg-navy-50 text-navy" : "text-graphite-600 hover:bg-graphite-50")}>
          <Icon.settings className={path.startsWith(`${base}/settings`) ? "text-accent" : "text-graphite-400"} /> Settings
        </Link>
      </div>
    </aside>
  );
}
