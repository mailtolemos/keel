import Link from "next/link";
import { Logo, Mark } from "@/components/Brand";
import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/format";

const nav = [["Product", "#solution"], ["Why Keel", "#why"], ["What\u2019s new", "#whatsnew"], ["Use cases", "#usecases"]] as const;

const solutions = [
  ["People directory", "Every person, role, and reporting line in one living source of truth.", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0"],
  ["Reviews", "Run self, manager, and peer reviews on cycles that fit your company.", "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"],
  ["Feedback", "Lightweight, continuous feedback and public praise — not annual dread.", "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
  ["Leave", "Requests, approvals, balances, and a calendar everyone can see.", "M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"],
  ["Goals", "Company, team, and individual goals — visible and connected.", "M12 2v4m0 12v4M2 12h4m12 0h4M12 8a4 4 0 100 8 4 4 0 000-8z"],
  ["1:1s", "Recurring agendas, shared notes, and action items that carry over.", "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v3l-4-3H9a2 2 0 01-2-2M3 4h10a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3z"],
  ["Org structure", "See teams, leads, and direct reports without untangling a spreadsheet.", "M3 7h6v6H3zM15 7h6v6h-6zM9 10h6M12 13v4"]
];

const usecases = [
  ["Run performance reviews", "Spin up a cycle, choose participants, and track completion end-to-end."],
  ["Manage time off", "Approvals, balances, and team availability in one calm calendar."],
  ["Understand team structure", "An org chart that stays current as people move and teams grow."],
  ["Keep goals visible", "Tie individual work to team and company outcomes."],
  ["Support managers", "1:1s, feedback, and reviews that make managing people easier."],
  ["Grow people intentionally", "Turn feedback and reviews into real development."]
];

export const dynamic = "force-dynamic";

const catTone = (c: string) => (c === "Feature" ? "accent" : c === "Improvement" ? "navy" : "neutral");

export default async function Landing() {
  const updatesRaw = await prisma.changelog.findMany({ where: { published: true }, orderBy: { date: "desc" }, take: 4 }).catch(() => []);
  const updates = updatesRaw.map((u) => ({ id: u.id, title: u.title, category: u.category, summary: u.summary, changes: u.changes, date: u.date.toISOString() }));
  return (
    <div className="min-h-screen bg-paper text-navy">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-graphite-200/70 bg-paper/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-graphite-600">
            {nav.map(([l, h]) => <a key={l} href={h} className="hover:text-navy transition">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-graphite-700 hover:text-navy px-3 h-9 inline-flex items-center">Sign in</Link>
            <Link href="/signup" className="text-sm font-medium text-white bg-navy hover:bg-navy-700 transition px-3.5 h-9 inline-flex items-center rounded-lg">Start building your team</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-faint opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-graphite-200 bg-white px-3 py-1 text-xs text-graphite-600 shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> The organizational backbone for modern companies
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            The backbone of<br />high-performing teams.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-graphite-600">
            Keel helps growing companies manage people, performance, feedback, leave, and goals
            without the weight of traditional HR software.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup" className="h-11 px-5 inline-flex items-center rounded-lg bg-navy text-white font-medium hover:bg-navy-700 transition shadow-card">
              Start building your team
            </Link>
            <Link href="/login" className="h-11 px-5 inline-flex items-center rounded-lg bg-white border border-graphite-200 text-navy font-medium hover:bg-graphite-50 transition">
              View demo →
            </Link>
          </div>
          <p className="mt-4 text-xs text-graphite-500">No credit card. Demo workspace included.</p>

          {/* Product preview */}
          <div className="mt-14">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-graphite-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">The problem</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight max-w-2xl">People systems break as companies grow.</h2>
          <p className="mt-4 max-w-2xl text-graphite-600 text-[17px] leading-relaxed">
            Spreadsheets, scattered docs, Slack messages, and rigid HR tools make it hard to keep teams aligned.
            The structure that worked at ten people quietly falls apart at fifty.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["Scattered", "People data lives in five different tools and nobody trusts any of them."],
              ["Rigid", "Legacy HR software forces your company into someone else's process."],
              ["Invisible", "Goals, feedback, and reviews disappear into docs no one reopens."]
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-graphite-200 p-5">
                <p className="font-medium text-navy">{t}</p>
                <p className="mt-1.5 text-sm text-graphite-600 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">The solution</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight max-w-2xl">One adaptable system for your organization.</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map(([t, d, path]) => (
            <div key={t} className="group rounded-xl border border-graphite-200 bg-white p-5 hover:shadow-card hover:border-accent-100 transition">
              <div className="h-9 w-9 rounded-lg bg-navy-50 flex items-center justify-center text-navy group-hover:bg-accent-50 group-hover:text-accent transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path as string} /></svg>
              </div>
              <p className="mt-3 font-medium text-navy">{t}</p>
              <p className="mt-1 text-sm text-graphite-600 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiator */}
      <section id="why" className="border-y border-graphite-200 bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">Why Keel</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight max-w-3xl">Built around how your company works.</h2>
          <p className="mt-4 max-w-2xl text-graphite-300 text-[17px] leading-relaxed">
            Keel gives startups and growing companies the structure they need — without forcing them into
            someone else's process. Flexible, lightweight, and quietly powerful.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              ["Calm by default", "An operational surface that's quiet until you need it — no noise, no clutter."],
              ["Flexible structure", "Teams, roles, policies, and cycles you can shape to your company."],
              ["Human at the core", "Stay structured and aligned as you grow, without losing the people."]
            ].map(([t, d]) => (
              <div key={t}>
                <div className="h-px w-10 bg-accent mb-4" />
                <p className="font-medium">{t}</p>
                <p className="mt-1.5 text-sm text-graphite-300 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="usecases" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Use cases</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">From first hire to fiftieth and beyond.</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {usecases.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-graphite-200 p-5 bg-white">
              <div className="flex items-center gap-2 text-navy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E2BD6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                <p className="font-medium">{t}</p>
              </div>
              <p className="mt-1.5 text-sm text-graphite-600 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's new */}
      <section id="whatsnew" className="border-y border-graphite-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">What's new</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">The latest in Keel.</h2>
              <p className="mt-3 text-graphite-600 max-w-xl">A running log of what we're shipping — features, improvements, and fixes, as they land.</p>
            </div>
          </div>
          <div className="mt-10 space-y-4">
            {updates.length === 0 ? (
              <p className="text-graphite-500 text-sm">No updates published yet.</p>
            ) : updates.map((u) => (
              <div key={u.id} className="grid sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 rounded-xl border border-graphite-200 p-5">
                <div className="text-[13px] text-graphite-500">
                  <div className="font-medium text-navy">{fmtDate(u.date)}</div>
                  <span className={`mt-1.5 inline-block rounded-md border px-1.5 py-0.5 text-xs font-medium ${u.category === "Feature" ? "bg-accent-50 text-accent-700 border-accent-100" : u.category === "Improvement" ? "bg-navy-50 text-navy-700 border-navy-100" : "bg-graphite-100 text-graphite-700 border-graphite-200"}`}>{u.category}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-navy">{u.title}</h3>
                  <p className="mt-1 text-[14px] text-graphite-600 leading-relaxed">{u.summary}</p>
                  {u.changes && (
                    <ul className="mt-3 space-y-1.5">
                      {u.changes.split("\n").filter(Boolean).map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13.5px] text-graphite-600">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4E2BD6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-graphite-200 bg-white p-10 sm:p-14 text-center shadow-card">
          <div className="absolute inset-0 grid-faint opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative">
            <Mark size={36} />
            <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">Give your company a stronger backbone.</h2>
            <p className="mt-3 text-graphite-600 max-w-xl mx-auto">Set up your workspace in minutes. Bring your team along when you're ready.</p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Link href="/signup" className="h-11 px-6 inline-flex items-center rounded-lg bg-navy text-white font-medium hover:bg-navy-700 transition">Get started</Link>
              <Link href="/login" className="h-11 px-6 inline-flex items-center rounded-lg bg-white border border-graphite-200 font-medium hover:bg-graphite-50 transition">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-graphite-200">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-graphite-500">
          <Logo />
          <p>The backbone of high-performing teams.</p>
          <p>© {new Date().getFullYear()} Keel</p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-graphite-200 bg-white shadow-pop overflow-hidden text-left animate-fadeUp">
      <div className="h-9 border-b border-graphite-200 bg-graphite-50 flex items-center gap-1.5 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-graphite-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-graphite-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-graphite-300" />
        <span className="ml-3 text-[11px] text-graphite-400">mykeel.org/lumen</span>
      </div>
      <div className="grid grid-cols-12">
        <aside className="col-span-3 border-r border-graphite-200 p-3 hidden sm:block">
          <div className="flex items-center gap-2 px-2 py-1.5"><Mark size={18} /><span className="text-sm font-semibold">Lumen</span></div>
          <div className="mt-3 space-y-0.5">
            {["Home", "People", "Teams", "Reviews", "Feedback", "Goals", "1:1s", "Leave"].map((x, i) => (
              <div key={x} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] ${i === 0 ? "bg-navy-50 text-navy font-medium" : "text-graphite-600"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-accent" : "bg-graphite-300"}`} />{x}
              </div>
            ))}
          </div>
        </aside>
        <main className="col-span-12 sm:col-span-9 p-5 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-graphite-500">Good morning</p>
              <p className="text-lg font-semibold tracking-tight">Company dashboard</p>
            </div>
            <div className="h-7 w-7 rounded-full bg-navy text-white text-[11px] flex items-center justify-center font-semibold">AR</div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[["People", "14"], ["Pending leave", "3"], ["Review done", "48%"], ["Open goals", "5"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-graphite-200 bg-white p-3">
                <p className="text-[10px] text-graphite-500">{l}</p>
                <p className="text-xl font-semibold tracking-tight">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="col-span-2 rounded-lg border border-graphite-200 bg-white p-3">
              <p className="text-[11px] font-semibold text-graphite-500 uppercase tracking-wide">Goal progress</p>
              <div className="mt-3 space-y-2.5">
                {[["Reach $5M ARR", 62, "bg-accent"], ["99.95% uptime", 78, "bg-good"], ["Ship reviews module", 40, "bg-warn"]].map(([t, p, c]) => (
                  <div key={t as string}>
                    <div className="flex justify-between text-[11px]"><span className="text-graphite-700">{t}</span><span className="text-graphite-500">{p}%</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-graphite-100"><div className={`h-full rounded-full ${c}`} style={{ width: `${p}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-graphite-200 bg-white p-3">
              <p className="text-[11px] font-semibold text-graphite-500 uppercase tracking-wide">Recent feedback</p>
              <div className="mt-2 space-y-2">
                {[["ML", "Praised Tomás"], ["SA", "Thanked Liam"]].map(([i, t]) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-accent text-white text-[9px] flex items-center justify-center">{i}</span>
                    <span className="text-[11px] text-graphite-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
