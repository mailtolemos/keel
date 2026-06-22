"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, cn } from "@/components/ui";
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
      <PageHeader title="People" subtitle={`${people.length} people across ${teams.length} teams`}
        action={canManage && (
          <Dialog title="Add a person" description="They'll be added as invited until they accept." trigger={<><Icon.plus size={16} /> Add person</>}>
            {(close) => <AddPersonForm teams={teams} close={close} />}
          </Dialog>
        )} />

      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex rounded-lg border border-graphite-200 bg-white p-0.5">
          {(["table", "org"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("h-8 px-3 rounded-md text-[13px] font-medium transition", view === v ? "bg-navy text-white" : "text-graphite-600 hover:text-navy")}>
              {v === "table" ? "Directory" : "Org chart"}
            </button>
          ))}
        </div>
        {view === "table" && (
          <>
            <div className="relative">
              <Icon.search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-graphite-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-9 w-48 rounded-lg border border-graphite-200 bg-white pl-8 pr-3 text-sm focus:outline-none focus:border-accent focus:shadow-focus" />
            </div>
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="h-9 rounded-lg border border-graphite-200 bg-white px-2.5 text-[13px] text-graphite-700">
              <option value="all">All teams</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-lg border border-graphite-200 bg-white px-2.5 text-[13px] text-graphite-700">
              <option value="all">All statuses</option>{Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span className="ml-auto text-[12px] text-graphite-500">{filtered.length} shown</span>
          </>
        )}
      </div>

      {view === "table" ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[12px] text-graphite-500 border-b border-graphite-200">
                <th className="font-medium py-2.5 px-4">Name</th>
                <th className="font-medium py-2.5 px-3 hidden sm:table-cell">Team</th>
                <th className="font-medium py-2.5 px-3 hidden md:table-cell">Manager</th>
                <th className="font-medium py-2.5 px-3 hidden lg:table-cell">Location</th>
                <th className="font-medium py-2.5 px-3">Role</th>
                <th className="font-medium py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-graphite-100 last:border-0 hover:bg-graphite-50/60 transition">
                  <td className="py-2.5 px-4">
                    <Link href={`/${slug}/people/${p.id}`} className="flex items-center gap-2.5 group">
                      <Avatar name={p.name} src={p.image} size={32} />
                      <div className="min-w-0">
                        <p className="font-medium text-navy group-hover:text-accent transition truncate">{p.name}</p>
                        <p className="text-[12px] text-graphite-500 truncate">{p.title ?? "—"}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 hidden sm:table-cell text-graphite-600">{p.team ?? "—"}</td>
                  <td className="py-2.5 px-3 hidden md:table-cell text-graphite-600">{p.manager ?? "—"}</td>
                  <td className="py-2.5 px-3 hidden lg:table-cell text-graphite-600">{p.location ?? "—"}</td>
                  <td className="py-2.5 px-3 text-graphite-600">{ROLE_LABEL[p.role]}</td>
                  <td className="py-2.5 px-3"><Badge tone={STATUS_META[p.status].tone}>{STATUS_META[p.status].label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-[13px] text-graphite-500 py-10">No people match your filters.</p>}
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
    <div className={cn(level > 0 && "ml-6 border-l border-graphite-200 pl-6 relative")}>
      <Link href={`/${slug}/people/${p.id}`} className="inline-flex items-center gap-2.5 rounded-lg border border-graphite-200 bg-white px-3 py-2 my-1.5 hover:border-accent-100 hover:shadow-card transition">
        <Avatar name={p.name} src={p.image} size={30} />
        <div><p className="text-[13.5px] font-medium text-navy leading-tight">{p.name}</p><p className="text-[12px] text-graphite-500">{p.title ?? "—"}</p></div>
        {reports.length > 0 && <span className="ml-2 text-[11px] text-graphite-400">{reports.length} report{reports.length > 1 ? "s" : ""}</span>}
      </Link>
      {reports.map((r) => <Node key={r.id} p={r} byManager={byManager} level={level + 1} slug={slug} />)}
    </div>
  );
}
