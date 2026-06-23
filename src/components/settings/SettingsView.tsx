"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Button, Input, Label, Select, cn } from "@/components/ui";
import { updateCompany, updateLeavePolicy, addHoliday, removeHoliday } from "@/app/actions/settings";
import { fmtDate } from "@/lib/format";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icons";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { LEAVE_TYPE_LABEL } from "@/lib/enums";

const TABS = ["Company", "Roles", "Leave policies", "Holidays", "Reviews", "Feedback", "Goals", "Appearance", "Billing", "Integrations"];
const TAB_KEY: Record<string, string> = {
  "Company": "set.tab.company", "Roles": "set.tab.roles", "Leave policies": "set.tab.leave", "Holidays": "set.tab.holidays",
  "Reviews": "set.tab.reviews", "Feedback": "set.tab.feedback", "Goals": "set.tab.goals", "Appearance": "set.tab.appearance",
  "Billing": "set.tab.billing", "Integrations": "set.tab.integrations"
};

export function SettingsView({ company, policies, holidays, counts, canManage }: {
  company: { name: string; country: string; workWeek: string; accentColor: string };
  policies: { id: string; name: string; type: string; allowanceDays: number; paid: boolean }[];
  holidays: { id: string; name: string; date: string; calendar: string }[];
  counts: { admins: number; managers: number; employees: number };
  canManage: boolean;
}) {
  const [tab, setTab] = useState("Company");
  const t = useT();
  return (
    <div>
      <PageHeader title={t("set.title")} subtitle={t("set.subtitle")} />
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <nav className="space-y-0.5">
          {TABS.map((tk) => (
            <button key={tk} onClick={() => setTab(tk)} className={cn("w-full text-left rounded-lg px-3 h-9 text-[13.5px] font-medium transition", tab === tk ? "bg-accent-soft text-ink" : "text-ink-muted hover:bg-surface-2")}>{t(TAB_KEY[tk])}</button>
          ))}
        </nav>
        <div>
          {tab === "Appearance" && <AppearancePanel />}
          {tab === "Company" && <CompanyPanel company={company} canManage={canManage} />}
          {tab === "Roles" && <RolesPanel counts={counts} />}
          {tab === "Leave policies" && <PoliciesPanel policies={policies} canManage={canManage} />}
          {tab === "Holidays" && <HolidaysPanel holidays={holidays} canManage={canManage} />}
          {tab === "Reviews" && <InfoPanel title="Review templates" body="Question sets and rating scales are configured when you create a review cycle. Saved templates are coming soon." badges={["Self review", "Manager review", "Peer review", "1–5 ratings"]} />}
          {tab === "Feedback" && <InfoPanel title="Feedback settings" body="Feedback is continuous and lightweight. Visibility can be public, manager-only, or private on each note." badges={["Strength", "Improvement", "Collaboration", "Leadership", "Execution", "Culture"]} />}
          {tab === "Goals" && <InfoPanel title="Goal settings" body="Goals can be set at the company, team, or individual level, each with progress tracking and updates." badges={["Company", "Team", "Individual"]} />}
          {tab === "Billing" && <InfoPanel title="Billing" body="You're on the Keel demo plan. Billing and plan management will appear here." badges={["Demo plan"]} />}
          {tab === "Integrations" && <InfoPanel title="Integrations" body="Connect Slack, Google Workspace, and your HRIS. Integrations are placeholders in this preview." badges={["Slack", "Google", "HRIS", "Calendar"]} />}
        </div>
      </div>
    </div>
  );
}

function CompanyPanel({ company, canManage }: { company: { name: string; country: string; workWeek: string; accentColor: string }; canManage: boolean }) {
  const router = useRouter();
  const [f, setF] = useState(company);
  const [saved, setSaved] = useState(false); const [busy, setBusy] = useState(false);
  async function save() { setBusy(true); await updateCompany(f); setBusy(false); setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 2000); }
  return (
    <Card className="p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-ink mb-4">Company profile</h2>
      <div className="space-y-4">
        <div><Label>Company name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} disabled={!canManage} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Country</Label><Input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} disabled={!canManage} /></div>
          <div><Label>Work week</Label><Input value={f.workWeek} onChange={(e) => setF({ ...f, workWeek: e.target.value })} disabled={!canManage} /></div>
        </div>
        <div><Label>Accent color</Label><div className="flex items-center gap-2"><input type="color" value={f.accentColor} onChange={(e) => setF({ ...f, accentColor: e.target.value })} disabled={!canManage} className="h-9 w-12 rounded border border-line" /><Input value={f.accentColor} onChange={(e) => setF({ ...f, accentColor: e.target.value })} disabled={!canManage} className="w-32" /></div></div>
      </div>
      {canManage && <div className="mt-5 flex items-center gap-3"><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>{saved && <span className="text-[13px] text-good">Saved</span>}</div>}
    </Card>
  );
}

function RolesPanel({ counts }: { counts: { admins: number; managers: number; employees: number } }) {
  const rows = [
    ["Admin", counts.admins, "Full access to settings, people, billing, and all data."],
    ["Manager", counts.managers, "Manage their team, approve leave, write reviews, see manager-only feedback."],
    ["Employee", counts.employees, "Manage their own profile, requests, goals, feedback, and reviews."]
  ] as const;
  return (
    <Card className="p-5 max-w-2xl">
      <h2 className="text-sm font-semibold text-ink mb-4">Roles & permissions</h2>
      <div className="space-y-3">
        {rows.map(([role, n, desc]) => (
          <div key={role} className="flex items-start gap-3 rounded-lg border border-line p-3.5">
            <Badge tone="navy">{role}</Badge>
            <div className="flex-1"><p className="text-[13px] text-ink-muted">{desc}</p></div>
            <span className="text-[13px] text-ink-soft">{n} {n === 1 ? "person" : "people"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PoliciesPanel({ policies, canManage }: { policies: { id: string; name: string; type: string; allowanceDays: number; paid: boolean }[]; canManage: boolean }) {
  return (
    <Card className="p-5 max-w-2xl">
      <h2 className="text-sm font-semibold text-ink mb-4">Leave policies</h2>
      <div className="space-y-2.5">
        {policies.map((p) => <PolicyRow key={p.id} p={p} canManage={canManage} />)}
      </div>
    </Card>
  );
}
function PolicyRow({ p, canManage }: { p: { id: string; name: string; type: string; allowanceDays: number; paid: boolean }; canManage: boolean }) {
  const router = useRouter();
  const [days, setDays] = useState(p.allowanceDays); const [busy, setBusy] = useState(false);
  async function save() { setBusy(true); await updateLeavePolicy(p.id, Number(days)); setBusy(false); router.refresh(); }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line p-3">
      <div className="flex-1"><p className="text-[13.5px] font-medium text-ink">{LEAVE_TYPE_LABEL[p.type] ?? p.name}</p><p className="text-[12px] text-ink-soft">{p.paid ? "Paid" : "Unpaid"}</p></div>
      <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} disabled={!canManage} className="w-20" />
      <span className="text-[13px] text-ink-soft">days / yr</span>
      {canManage && <Button size="sm" variant="secondary" onClick={save} disabled={busy}>Save</Button>}
    </div>
  );
}

function HolidaysPanel({ holidays, canManage }: { holidays: { id: string; name: string; date: string; calendar: string }[]; canManage: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(""); const [date, setDate] = useState(""); const [busy, setBusy] = useState(false);
  async function add() { if (!name || !date) return; setBusy(true); await addHoliday({ name, date, calendar: "Company" }); setBusy(false); setName(""); setDate(""); router.refresh(); }
  async function del(id: string) { setBusy(true); await removeHoliday(id); setBusy(false); router.refresh(); }
  return (
    <Card className="p-5 max-w-2xl">
      <h2 className="text-sm font-semibold text-ink mb-4">Holiday calendar</h2>
      {canManage && (
        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1"><Label>Holiday name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company offsite" /></div>
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <Button onClick={add} disabled={busy}>Add</Button>
        </div>
      )}
      <div className="space-y-1.5">
        {holidays.length === 0 && <p className="text-[13px] text-ink-soft">No holidays yet.</p>}
        {holidays.map((h) => (
          <div key={h.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
            <span className="text-[13.5px] font-medium text-ink flex-1">{h.name}</span>
            <Badge tone="neutral">{h.calendar}</Badge>
            <span className="text-[13px] text-ink-soft">{fmtDate(h.date)}</span>
            {canManage && <button onClick={() => del(h.id)} className="text-[12px] text-bad hover:underline">Remove</button>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AppearancePanel() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const themes: { key: string; label: string; icon: keyof typeof Icon }[] = [
    { key: "light", label: t("theme.light"), icon: "sun" },
    { key: "dark", label: t("theme.dark"), icon: "moon" },
    { key: "system", label: t("theme.system"), icon: "monitor" }
  ];
  return (
    <Card className="p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-ink mb-1">{t("set.appearanceTitle")}</h2>
      <p className="text-[13px] text-ink-soft mb-4">{t("set.appearanceHint")}</p>
      <div className="mb-5">
        <Label>{t("set.theme")}</Label>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {themes.map((th) => {
            const I = Icon[th.icon]; const active = mounted && theme === th.key;
            return (
              <button key={th.key} onClick={() => setTheme(th.key)}
                className={cn("flex flex-col items-center gap-1.5 rounded-lg border py-3 text-[12px] font-medium transition",
                  active ? "border-accent bg-accent-soft text-accent-700 dark:text-accent-400" : "border-line text-ink-muted hover:bg-surface-2")}>
                <I size={18} /> {th.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label>{t("set.language")}</Label>
        <p className="text-[12px] text-ink-soft mb-2">{t("set.languageHint")}</p>
        <div className="grid sm:grid-cols-2 gap-2 max-w-md">
          {LOCALES.map((lc: Locale) => (
            <button key={lc} onClick={() => setLocale(lc)}
              className={cn("flex items-center gap-2.5 rounded-lg border px-3 h-10 text-[13.5px] transition",
                locale === lc ? "border-accent bg-accent-soft text-accent-700 dark:text-accent-400 font-medium" : "border-line text-ink-muted hover:bg-surface-2")}>
              <span className="text-[16px]">{LOCALE_LABELS[lc].flag}</span>
              <span className="flex-1 text-left">{LOCALE_LABELS[lc].native}</span>
              {locale === lc && <Icon.check size={15} className="text-accent" />}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function InfoPanel({ title, body, badges }: { title: string; body: string; badges: string[] }) {
  return (
    <Card className="p-5 max-w-2xl">
      <h2 className="text-sm font-semibold text-ink mb-2">{title}</h2>
      <p className="text-[13.5px] text-ink-muted leading-relaxed">{body}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{badges.map((b) => <Badge key={b} tone="neutral">{b}</Badge>)}</div>
    </Card>
  );
}
