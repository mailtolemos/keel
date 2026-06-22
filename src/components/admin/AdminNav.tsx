"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Mark } from "@/components/Brand";
import { cn } from "@/components/ui";

export function AdminNav() {
  const path = usePathname();
  const tabs = [["Entities", "/admin"], ["Changelog", "/admin/changelog"]] as const;
  return (
    <header className="border-b border-graphite-200 bg-white sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2"><Mark size={22} /><span className="font-semibold text-navy">Keel</span><span className="text-[12px] text-graphite-400 font-medium border-l border-graphite-200 pl-2 ml-1">Operator</span></Link>
        <nav className="flex items-center gap-1 ml-4">
          {tabs.map(([label, href]) => {
            const active = href === "/admin" ? path === "/admin" || path.startsWith("/admin/") && !path.startsWith("/admin/changelog") : path.startsWith(href);
            return <Link key={href} href={href} className={cn("h-8 px-3 rounded-lg text-[13px] font-medium inline-flex items-center transition", active ? "bg-navy-50 text-navy" : "text-graphite-600 hover:bg-graphite-50")}>{label}</Link>;
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/" className="text-[13px] text-graphite-600 hover:text-navy">Site</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[13px] text-bad hover:underline">Sign out</button>
        </div>
      </div>
    </header>
  );
}
