"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";

export function Topbar({ name, email, role, image, slug, isPlatformAdmin }: { name: string; email: string; role: string; image?: string | null; slug: string; isPlatformAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="h-14 sticky top-0 z-20 border-b border-graphite-200 bg-paper/85 backdrop-blur flex items-center gap-3 px-5">
      <div className="relative flex-1 max-w-md">
        <Icon.search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-graphite-400" size={16} />
        <input placeholder="Search people, teams, goals…" className="h-9 w-full rounded-lg border border-graphite-200 bg-white pl-8 pr-12 text-sm placeholder:text-graphite-400 focus:outline-none focus:border-accent focus:shadow-focus transition" />
        <span className="kbd absolute right-2 top-1/2 -translate-y-1/2">⌘K</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {isPlatformAdmin && (
          <Link href="/admin" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-graphite-200 text-[13px] font-medium text-graphite-700 hover:bg-graphite-50">
            <Icon.org size={15} className="text-accent" /> Operator
          </Link>
        )}
        <button className="h-9 w-9 grid place-items-center rounded-lg text-graphite-500 hover:bg-graphite-100"><Icon.bell size={18} /></button>
        <div className="relative">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg pl-1 pr-2 h-9 hover:bg-graphite-100">
            <Avatar name={name} src={image} size={28} />
            <span className="hidden sm:block text-[13px] font-medium text-navy max-w-[120px] truncate">{name}</span>
            <Icon.chevron size={14} className="text-graphite-400" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-graphite-200 bg-white shadow-pop z-20 p-1.5 animate-fadeUp">
                <div className="px-2.5 py-2">
                  <p className="text-sm font-medium text-navy truncate">{name}</p>
                  <p className="text-[12px] text-graphite-500 truncate">{email}</p>
                  <span className="mt-1 inline-block rounded-md bg-navy-50 text-navy-700 text-[11px] px-1.5 py-0.5 font-medium">{roleLabel(role)}</span>
                </div>
                <div className="h-px bg-graphite-100 my-1" />
                <Link href={`/${slug}/settings`} onClick={() => setOpen(false)} className="block rounded-lg px-2.5 py-1.5 text-[13px] text-graphite-700 hover:bg-graphite-50">Settings</Link>
                {isPlatformAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-2.5 py-1.5 text-[13px] text-graphite-700 hover:bg-graphite-50">Operator console</Link>}
                <Link href="/" className="block rounded-lg px-2.5 py-1.5 text-[13px] text-graphite-700 hover:bg-graphite-50">Marketing site</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left rounded-lg px-2.5 py-1.5 text-[13px] text-bad hover:bg-red-50">Sign out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
function roleLabel(r: string) { return r === "ADMIN" ? "Admin" : r === "MANAGER" ? "Manager" : "Employee"; }
