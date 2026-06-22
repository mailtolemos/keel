import Link from "next/link";
import { Logo, Mark } from "@/components/Brand";

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <div className="flex flex-col justify-center px-6 sm:px-12 py-10">
        <div className="w-full max-w-sm mx-auto">
          <Logo />
          <h1 className="mt-10 text-2xl font-semibold tracking-tight text-navy">{title}</h1>
          <p className="mt-1.5 text-[15px] text-graphite-600">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
      <div className="hidden lg:flex relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 grid-faint opacity-20" />
        <div className="relative flex flex-col justify-center px-14">
          <Mark size={40} />
          <p className="mt-8 text-3xl font-semibold tracking-tight leading-snug max-w-md">
            The backbone of high-performing teams.
          </p>
          <p className="mt-4 text-graphite-300 max-w-md leading-relaxed">
            Stay structured, aligned, and human as you grow — people, performance, feedback, leave, and goals in one calm system.
          </p>
          <div className="mt-10 space-y-3 max-w-sm">
            {["People directory & org chart", "Performance reviews & feedback", "Leave, goals, and 1:1s"].map((x) => (
              <div key={x} className="flex items-center gap-2.5 text-sm text-graphite-200">
                <span className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8466EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>{x}
              </div>
            ))}
          </div>
          <p className="mt-12 text-xs text-graphite-400">
            <Link href="/" className="hover:text-white">← Back to mykeel.org</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
