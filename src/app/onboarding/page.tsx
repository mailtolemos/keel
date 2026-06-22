"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/Brand";
import { Input, Label, Button, Select, cn } from "@/components/ui";
import { createCompany } from "@/app/actions/onboarding";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Germany", "France", "Portugal", "Ireland", "Netherlands", "Spain", "Australia", "India", "Singapore", "Brazil"];
const DAYS = [["Mon", "Mon"], ["Tue", "Tue"], ["Wed", "Wed"], ["Thu", "Thu"], ["Fri", "Fri"], ["Sat", "Sat"], ["Sun", "Sun"]];
const STARTER_HOLIDAYS = [
  { name: "Independence Day", date: "2026-07-03" },
  { name: "Labor Day", date: "2026-09-07" },
  { name: "Thanksgiving", date: "2026-11-26" },
  { name: "Christmas Day", date: "2026-12-25" },
  { name: "New Year's Day", date: "2027-01-01" }
];
const STEPS = ["Company", "Country", "Work week", "Holidays", "First team", "Invite"];

export default function Onboarding() {
  const router = useRouter();
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
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 border-b border-graphite-200 flex items-center px-6 gap-2">
        <Mark size={22} /><span className="font-semibold text-navy">Keel</span>
        <span className="ml-auto text-[13px] text-graphite-500">Set up your workspace</span>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Stepper */}
          <div className="flex items-center gap-1.5 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={cn("h-1 rounded-full transition", i <= step ? "bg-accent" : "bg-graphite-200")} />
                <p className={cn("mt-1.5 text-[11px]", i === step ? "text-navy font-medium" : "text-graphite-400")}>{s}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-graphite-200 bg-white shadow-card p-6 animate-fadeUp" key={step}>
            {step === 0 && (
              <Field title="What's your company called?" hint="You can change this anytime in settings.">
                <Label>Company name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme, Inc." autoFocus />
              </Field>
            )}
            {step === 1 && (
              <Field title="Where are you based?" hint="Sets your default holiday calendar and locale.">
                <Label>Country</Label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            )}
            {step === 2 && (
              <Field title="What's your work week?" hint="Used for leave calculations and the team calendar.">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(([d]) => (
                    <button key={d} onClick={() => toggleDay(d)} type="button"
                      className={cn("h-10 px-3.5 rounded-lg border text-sm font-medium transition",
                        workWeek.includes(d) ? "border-accent bg-accent-50 text-accent-700" : "border-graphite-200 text-graphite-600 hover:bg-graphite-50")}>
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            {step === 3 && (
              <Field title="Default holidays" hint="Pick a starter set — add your own later.">
                <div className="space-y-2">
                  {holidays.map((h, i) => (
                    <label key={h.name} className="flex items-center gap-3 rounded-lg border border-graphite-200 px-3 py-2 cursor-pointer hover:bg-graphite-50">
                      <input type="checkbox" checked={h.on} onChange={() => setHolidays((hs) => hs.map((x, j) => j === i ? { ...x, on: !x.on } : x))} className="accent-accent h-4 w-4" />
                      <span className="text-sm text-navy flex-1">{h.name}</span>
                      <span className="text-[12px] text-graphite-500">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}
            {step === 4 && (
              <Field title="Create your first team" hint="Most companies start with Leadership or Engineering.">
                <Label>Team name</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Leadership" autoFocus />
              </Field>
            )}
            {step === 5 && (
              <Field title="Invite a few teammates" hint="Optional — they'll appear as invited in your directory. Add more later.">
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
                  <button type="button" onClick={() => setInvites((v) => [...v, { name: "", email: "", role: "EMPLOYEE" }])} className="text-[13px] font-medium text-accent hover:underline">+ Add another</button>
                </div>
              </Field>
            )}

            {error && <p className="mt-4 text-[13px] text-bad">{error}</p>}

            <div className="mt-7 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
              {step < STEPS.length - 1 ? (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continue</Button>
              ) : (
                <Button variant="primary" onClick={finish} disabled={loading}>{loading ? "Creating workspace…" : "Finish setup"}</Button>
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
      <h2 className="text-lg font-semibold tracking-tight text-navy">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-graphite-500">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
