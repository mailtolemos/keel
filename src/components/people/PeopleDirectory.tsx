"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, cn } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { AddPersonForm } from "./AddPersonForm";
import { STATUS_META, ROLE_LABEL } from "./statusMeta";

type Person = {
  id: string; name: string; title: string | null; teamId: string | null; team: string | null;
  manager: string | null; managerId: string | null; location: string | null; status: string;
  role: string; image: string | null; workEmail: string; employmentType: string;
};

export function PeopleDirectory({ people, teams, canManage, slug }: { people: Person[]; teams: { id: string; name: string }[]; canManage: boolean; slug: string }) {
  const [view, setView] = useState<"table" | "org">("table");
  const t = useT();
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => people.filter((p) =>
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || (p.title ?? "").toLowerCase().includes(q.toLowerCase())) &&
    (team === "all" || p.teamId === team) &&
    (status === "all" || p.status === status)
  ), [people, q, team, status]);

  return (
    <div>
      <PageHeader title={t("people.title")} subtitle={t("people.subtitle", { n: people.length, teams: teams.length })}
        action={canManage && (
          <Dialog title="Add a person" description="They'll be added as invited until they accept." trigger={<><Icon.plus size={16} /> {t("people.add")}</>}>
            {(close) => <AddPersonForm teams={teams} close={close} />}
          </Dialog>
        )} />

      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
          {(["table", "org"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("h-8 px-3 rounded-md text-[13px] font-medium transition", view === v ? "bg-navy text-white" : "text-ink-muted hover:text-ink")}>
              {v === "table" ? t("people.directory") : t("people.orgchart")}
            </button>
          ))}
        </div>
        {view === "table" && (
          <>
            <div className="relative">
              <Icon.search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-9 w-48 rounded-lg border border-line bg-surface pl-8 pr-3 text-sm focus:outline-none focus:border-accent focus:shadow-focus" />
            </div>
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink-muted">
              <option value="all">{t("people.allTeams")}</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink-muted">
              <option value="all">{t("people.allStatuses")}</option>{Object.entries(STATUS_META).map(([k]) => <option key={k} value={k}>{t("st." + k)}</option>)}
            </select>
            <span className="ml-auto text-[12px] text-ink-soft">{t("common.shown", { n: filtered.length })}</span>
          </>
        )}
      </div>

      {view === "table" ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[12px] text-ink-soft border-b border-line">
                <th className="font-medium py-2.5 px-4">{t("people.colName")}</th>
                <th className="font-medium py-2.5 px-3 hidden sm:table-cell">{t("people.colTeam")}</th>
                <th className="font-medium py-2.5 px-3 hidden md:table-cell">{t("people.colManager")}</th>
                <th className="font-medium py-2.5 px-3 hidden lg:table-cell">{t("people.colLocation")}</th>
                <th className="font-medium py-2.5 px-3">{t("people.colRole")}</th>
                <th className="font-medium py-2.5 px-3">{t("people.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-line-2 last:border-0 hover:bg-surface-2/60 transition">
                  <td className="py-2.5 px-4">
                    <Link href={`/${slug}/people/${p.id}`} className="flex items-center gap-2.5 group">
                      <Avatar name={p.name} src={p.image} size={32} />
                      <div className="min-w-0">
                        <p className="font-medium text-ink group-hover:text-accent transition truncate">{p.name}</p>
                        <p className="text-[12px] text-ink-soft truncate">{p.title ?? "—"}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 hidden sm:table-cell text-ink-muted">{p.team ?? "—"}</td>
                  <td className="py-2.5 px-3 hidden md:table-cell text-ink-muted">{p.manager ?? "—"}</td>
                  <td className="py-2.5 px-3 hidden lg:table-cell text-ink-muted">{p.location ?? "—"}</td>
                  <td className="py-2.5 px-3 text-ink-muted">{t("role." + p.role.toLowerCase())}</td>
                  <td className="py-2.5 px-3"><Badge tone={STATUS_META[p.status].tone}>{t("st." + p.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-[13px] text-ink-soft py-10">{t("people.noMatch")}</p>}
        </Card>
      ) : (
        <OrgChart people={people} slug={slug} />
      )}
    </div>
  );
}

function OrgChart({ people, slug }: { people: Person[]; slug: string }) {
  const byManager = useMemo(() => {
    const m: Record<string, Person[]> = {};
    people.forEach((p) => { const k = p.managerId ?? "root"; (m[k] ||= []).push(p); });
    return m;
  }, [people]);
  const roots = people.filter((p) => !p.managerId);
  return (
    <Card className="p-6 overflow-x-auto">
      <div className="min-w-fit">
        {roots.map((r) => <Node key={r.id} p={r} byManager={byManager} level={0} slug={slug} />)}
      </div>
    </Card>
  );
}

function Node({ p, byManager, level, slug }: { p: Person; byManager: Record<string, Person[]>; level: number; slug: string }) {
  const reports = byManager[p.id] ?? [];
  return (
    <div className={cn(level > 0 && "ml-6 border-l border-line pl-6 relative")}>
      <Link href={`/${slug}/people/${p.id}`} className="inline-flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 my-1.5 hover:border-accent-100 hover:shadow-card transition">
        <Avatar name={p.name} src={p.image} size={30} />
        <div><p className="text-[13.5px] font-medium text-ink leading-tight">{p.name}</p><p className="text-[12px] text-ink-soft">{p.title ?? "—"}</p></div>
        {reports.length > 0 && <span className="ml-2 text-[11px] text-ink-faint">{reports.length} report{reports.length > 1 ? "s" : ""}</span>}
      </Link>
      {reports.map((r) => <Node key={r.id} p={r} byManager={byManager} level={level + 1} slug={slug} />)}
    </div>
  );
}
