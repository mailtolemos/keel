import Link from "next/link";
import { Logo, Mark } from "@/components/Brand";
import { PreferencesMenu } from "@/components/PreferencesMenu";
import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { getT } from "@/i18n/server";

const nav = [["landing.product", "#solution"], ["landing.why", "#why"], ["landing.whatsnew", "#whatsnew"], ["landing.usecases", "#usecases"]] as const;

const solutions = [
  ["sol.people", "sol.peopleD", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0"],
  ["sol.reviews", "sol.reviewsD", "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"],
  ["sol.feedback", "sol.feedbackD", "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
  ["sol.leave", "sol.leaveD", "M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"],
  ["sol.goals", "sol.goalsD", "M12 2v4m0 12v4M2 12h4m12 0h4M12 8a4 4 0 100 8 4 4 0 000-8z"],
  ["sol.oneonones", "sol.oneononesD", "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v3l-4-3H9a2 2 0 01-2-2M3 4h10a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3z"],
  ["sol.org", "sol.orgD", "M3 7h6v6H3zM15 7h6v6h-6zM9 10h6M12 13v4"]
];

const usecases = [
  ["use.reviews", "use.reviewsD"], ["use.leave", "use.leaveD"], ["use.structure", "use.structureD"],
  ["use.goals", "use.goalsD"], ["use.managers", "use.managersD"], ["use.grow", "use.growD"]
];

export const dynamic = "force-dynamic";

export default async function Landing() {
  const t = getT();
  const updatesRaw = await prisma.changelog.findMany({ where: { published: true }, orderBy: { date: "desc" }, take: 4 }).catch(() => []);
  const updates = updatesRaw.map((u) => ({ id: u.id, title: u.title, category: u.category, summary: u.summary, changes: u.changes, date: u.date.toISOString() }));
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-muted">
            {nav.map(([l, h]) => <a key={l} href={h} className="hover:text-ink transition">{t(l)}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <PreferencesMenu />
            <Link href="/login" className="text-sm text-ink-muted hover:text-ink px-3 h-9 hidden sm:inline-flex items-center">{t("landing.signIn")}</Link>
            <Link href="/signup" className="text-sm font-medium text-white bg-navy hover:bg-navy-700 dark:bg-accent dark:hover:bg-accent-600 transition px-3.5 h-9 inline-flex items-center rounded-lg">{t("landing.startBuilding")}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-faint opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-muted shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("landing.badge")}
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            {t("landing.heroTitle1")}<br />{t("landing.heroTitle2")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-muted">{t("landing.heroSub")}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup" className="h-11 px-5 inline-flex items-center rounded-lg bg-navy text-white font-medium hover:bg-navy-700 dark:bg-accent dark:hover:bg-accent-600 transition shadow-card">
              {t("landing.startBuilding")}
            </Link>
            <Link href="/login" className="h-11 px-5 inline-flex items-center rounded-lg bg-surface border border-line text-ink font-medium hover:bg-surface-2 transition">
              {t("landing.viewDemo")}
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-soft">{t("landing.heroNote")}</p>
          <div className="mt-14"><DashboardPreview /></div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("landing.problemTag")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight max-w-2xl">{t("landing.problemTitle")}</h2>
          <p className="mt-4 max-w-2xl text-ink-muted text-[17px] leading-relaxed">{t("landing.problemCopy")}</p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[["landing.scattered", "landing.scatteredD"], ["landing.rigid", "landing.rigidD"], ["landing.invisible", "landing.invisibleD"]].map(([tk, dk]) => (
              <div key={tk} className="rounded-xl border border-line p-5">
                <p className="font-medium text-ink">{t(tk)}</p>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("landing.solutionTag")}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight max-w-2xl">{t("landing.solutionTitle")}</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map(([tk, dk, path]) => (
            <div key={tk} className="group rounded-xl border border-line bg-surface p-5 hover:shadow-card hover:border-accent-100 transition">
              <div className="h-9 w-9 rounded-lg bg-accent-soft flex items-center justify-center text-accent transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
              </div>
              <p className="mt-3 font-medium text-ink">{t(tk)}</p>
              <p className="mt-1 text-sm text-ink-muted leading-relaxed">{t(dk)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiator */}
      <section id="why" className="border-y border-line bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">{t("landing.whyTag")}</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight max-w-3xl">{t("landing.whyTitle")}</h2>
          <p className="mt-4 max-w-2xl text-graphite-300 text-[17px] leading-relaxed">{t("landing.whyCopy")}</p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[["landing.calm", "landing.calmD"], ["landing.flexible", "landing.flexibleD"], ["landing.human", "landing.humanD"]].map(([tk, dk]) => (
              <div key={tk}>
                <div className="h-px w-10 bg-accent mb-4" />
                <p className="font-medium">{t(tk)}</p>
                <p className="mt-1.5 text-sm text-graphite-300 leading-relaxed">{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="usecases" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("landing.useTag")}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("landing.useTitle")}</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {usecases.map(([tk, dk]) => (
            <div key={tk} className="rounded-xl border border-line p-5 bg-surface">
              <div className="flex items-center gap-2 text-ink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E2BD6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                <p className="font-medium">{t(tk)}</p>
              </div>
              <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{t(dk)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's new */}
      <section id="whatsnew" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("landing.newTag")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("landing.newTitle")}</h2>
          <p className="mt-3 text-ink-muted max-w-xl">{t("landing.newCopy")}</p>
          <div className="mt-10 space-y-4">
            {updates.length === 0 ? (
              <p className="text-ink-soft text-sm">{t("landing.newEmpty")}</p>
            ) : updates.map((u) => (
              <div key={u.id} className="grid sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 rounded-xl border border-line p-5">
                <div className="text-[13px] text-ink-soft">
                  <div className="font-medium text-ink">{fmtDate(u.date)}</div>
                  <span className={`mt-1.5 inline-block rounded-md border px-1.5 py-0.5 text-xs font-medium ${u.category === "Feature" ? "bg-accent-soft text-accent-700 dark:text-accent-400 border-accent-100 dark:border-line" : u.category === "Improvement" ? "bg-surface-2 text-ink border-line" : "bg-surface-2 text-ink-muted border-line"}`}>{u.category}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{u.title}</h3>
                  <p className="mt-1 text-[14px] text-ink-muted leading-relaxed">{u.summary}</p>
                  {u.changes && (
                    <ul className="mt-3 space-y-1.5">
                      {u.changes.split("\n").filter(Boolean).map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13.5px] text-ink-muted">
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
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-10 sm:p-14 text-center shadow-card">
          <div className="absolute inset-0 grid-faint opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative">
            <Mark size={36} />
            <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">{t("landing.closingTitle")}</h2>
            <p className="mt-3 text-ink-muted max-w-xl mx-auto">{t("landing.closingCopy")}</p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Link href="/signup" className="h-11 px-6 inline-flex items-center rounded-lg bg-navy text-white font-medium hover:bg-navy-700 dark:bg-accent dark:hover:bg-accent-600 transition">{t("landing.getStarted")}</Link>
              <Link href="/login" className="h-11 px-6 inline-flex items-center rounded-lg bg-surface border border-line font-medium hover:bg-surface-2 transition">{t("landing.signIn")}</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-soft">
          <Logo />
          <p>{t("landing.footerTagline")}</p>
          <p>© {new Date().getFullYear()} Keel</p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-surface shadow-pop overflow-hidden text-left animate-fadeUp">
      <div className="h-9 border-b border-line bg-surface-2 flex items-center gap-1.5 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-graphite-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-graphite-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-graphite-300" />
        <span className="ml-3 text-[11px] text-ink-faint">mykeel.org/lumen</span>
      </div>
      <div className="grid grid-cols-12">
        <aside className="col-span-3 border-r border-line p-3 hidden sm:block">
          <div className="flex items-center gap-2 px-2 py-1.5"><Mark size={18} /><span className="text-sm font-semibold">Lumen</span></div>
          <div className="mt-3 space-y-0.5">
            {["Home", "People", "Teams", "Reviews", "Feedback", "Goals", "1:1s", "Leave"].map((x, i) => (
              <div key={x} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] ${i === 0 ? "bg-accent-soft text-ink font-medium" : "text-ink-muted"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-accent" : "bg-graphite-300"}`} />{x}
              </div>
            ))}
          </div>
        </aside>
        <main className="col-span-12 sm:col-span-9 p-5 bg-bg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-ink-soft">Good morning</p>
              <p className="text-lg font-semibold tracking-tight">Company dashboard</p>
            </div>
            <div className="h-7 w-7 rounded-full bg-navy dark:bg-accent text-white text-[11px] flex items-center justify-center font-semibold">AR</div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[["People", "14"], ["Pending leave", "3"], ["Review done", "48%"], ["Open goals", "5"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-line bg-surface p-3">
                <p className="text-[10px] text-ink-soft">{l}</p>
                <p className="text-xl font-semibold tracking-tight">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="col-span-2 rounded-lg border border-line bg-surface p-3">
              <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide">Goal progress</p>
              <div className="mt-3 space-y-2.5">
                {[["Reach $5M ARR", 62, "bg-accent"], ["99.95% uptime", 78, "bg-good"], ["Ship reviews module", 40, "bg-warn"]].map(([tt, p, c]) => (
                  <div key={tt as string}>
                    <div className="flex justify-between text-[11px]"><span className="text-ink-muted">{tt}</span><span className="text-ink-soft">{p}%</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-surface-2"><div className={`h-full rounded-full ${c}`} style={{ width: `${p}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-surface p-3">
              <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide">Recent feedback</p>
              <div className="mt-2 space-y-2">
                {[["ML", "Praised Tomás"], ["SA", "Thanked Liam"]].map(([i, tx]) => (
                  <div key={tx} className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-accent text-white text-[9px] flex items-center justify-center">{i}</span>
                    <span className="text-[11px] text-ink-muted">{tx}</span>
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
