"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/Brand";
import { Input, Label, Button, Select, cn } from "@/components/ui";
import { createCompany } from "@/app/actions/onboarding";
import { useT } from "@/i18n/I18nProvider";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Germany", "France", "Portugal", "Ireland", "Netherlands", "Spain", "Australia", "India", "Singapore", "Brazil"];
const DAYS = [["Mon", "Mon"], ["Tue", "Tue"], ["Wed", "Wed"], ["Thu", "Thu"], ["Fri", "Fri"], ["Sat", "Sat"], ["Sun", "Sun"]];
const STARTER_HOLIDAYS = [
  { name: "Independence Day", date: "2026-07-03" },
  { name: "Labor Day", date: "2026-09-07" },
  { name: "Thanksgiving", date: "2026-11-26" },
  { name: "Christmas Day", date: "2026-12-25" },
  { name: "New Year's Day", date: "2027-01-01" }
];
const STEP_KEYS = ["ob.step.company", "ob.step.country", "ob.step.workweek", "ob.step.holidays", "ob.step.team", "ob.step.invite"];

export default function Onboarding() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("United States");
  const [workWeek, setWorkWeek] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [holidays, setHolidays] = useState(STARTER_HOLIDAYS.map((h) => ({ ...h, on: true })));
  const [teamName, setTeamName] = useState("Leadership");
  const [invites, setInvites] = useState([
    { name: "", email: "", role: "MANAGER" },
    { name: "", email: "", role: "EMPLOYEE" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (d: string) => setWorkWeek((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]));
  const canNext = [companyName.trim().length > 0, !!country, workWeek.length > 0, true, teamName.trim().length > 0, true][step];
  const STEP_KEYS_LEN = STEP_KEYS.length;

  async function finish() {
    setLoading(true); setError("");
    const res = await createCompany({
      companyName, country, workWeek,
      holidays: holidays.filter((h) => h.on).map(({ name, date }) => ({ name, date })),
      teamName,
      invites: invites.filter((i) => i.email.trim())
    });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Could not create workspace."); return; }
    router.push(res.slug ? `/${res.slug}` : "/go");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="h-16 border-b border-line flex items-center px-6 gap-2">
        <Mark size={22} /><span className="font-semibold text-ink">Keel</span>
        <span className="ml-auto text-[13px] text-ink-soft">{t("ob.setup")}</span>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Stepper */}
          <div className="flex items-center gap-1.5 mb-8">
            {STEP_KEYS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={cn("h-1 rounded-full transition", i <= step ? "bg-accent" : "bg-surface-3")} />
                <p className={cn("mt-1.5 text-[11px]", i === step ? "text-ink font-medium" : "text-ink-faint")}>{t(s)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-surface shadow-card p-6 animate-fadeUp" key={step}>
            {step === 0 && (
              <Field title={t("ob.companyQ")} hint={t("ob.companyHint")}>
                <Label>{t("ob.companyName")}</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme, Inc." autoFocus />
              </Field>
            )}
            {step === 1 && (
              <Field title={t("ob.countryQ")} hint={t("ob.countryHint")}>
                <Label>{t("ob.country")}</Label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            )}
            {step === 2 && (
              <Field title={t("ob.workweekQ")} hint={t("ob.workweekHint")}>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(([d]) => (
                    <button key={d} onClick={() => toggleDay(d)} type="button"
                      className={cn("h-10 px-3.5 rounded-lg border text-sm font-medium transition",
                        workWeek.includes(d) ? "border-accent bg-accent-soft text-accent-700" : "border-line text-ink-muted hover:bg-surface-2")}>
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            {step === 3 && (
              <Field title={t("ob.holidaysQ")} hint={t("ob.holidaysHint")}>
                <div className="space-y-2">
                  {holidays.map((h, i) => (
                    <label key={h.name} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 cursor-pointer hover:bg-surface-2">
                      <input type="checkbox" checked={h.on} onChange={() => setHolidays((hs) => hs.map((x, j) => j === i ? { ...x, on: !x.on } : x))} className="accent-accent h-4 w-4" />
                      <span className="text-sm text-ink flex-1">{h.name}</span>
                      <span className="text-[12px] text-ink-soft">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}
            {step === 4 && (
              <Field title={t("ob.teamQ")} hint={t("ob.teamHint")}>
                <Label>{t("ob.teamName")}</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Leadership" autoFocus />
              </Field>
            )}
            {step === 5 && (
              <Field title={t("ob.inviteQ")} hint={t("ob.inviteHint")}>
                <div className="space-y-3">
                  {invites.map((inv, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <Input className="col-span-4" placeholder="Name" value={inv.name} onChange={(e) => setInvites((v) => v.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                      <Input className="col-span-5" placeholder="email@company.com" value={inv.email} onChange={(e) => setInvites((v) => v.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                      <Select className="col-span-3" value={inv.role} onChange={(e) => setInvites((v) => v.map((x, j) => j === i ? { ...x, role: e.target.value } : x))}>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EMPLOYEE">Employee</option>
                      </Select>
                    </div>
                  ))}
                  <button type="button" onClick={() => setInvites((v) => [...v, { name: "", email: "", role: "EMPLOYEE" }])} className="text-[13px] font-medium text-accent hover:underline">{t("ob.addAnother")}</button>
                </div>
              </Field>
            )}

            {error && <p className="mt-4 text-[13px] text-bad">{error}</p>}

            <div className="mt-7 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>{t("common.back")}</Button>
              {step < STEP_KEYS.length - 1 ? (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>{t("common.continue")}</Button>
              ) : (
                <Button variant="primary" onClick={finish} disabled={loading}>{loading ? t("ob.creating") : t("ob.finish")}</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-ink-soft">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
