"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, Button, Input, Label, Textarea, Select } from "@/components/ui";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { createTeam, updateTeam, moveMember } from "@/app/actions/teams";

type Member = { id: string; name: string; title: string | null; image: string | null };
type Team = { id: string; name: string; description: string | null; leadId: string | null; lead: string | null; members: Member[] };

export function TeamsView({ teams, allPeople, canManage, slug }: { teams: Team[]; allPeople: { id: string; name: string; teamId: string | null }[]; canManage: boolean; slug: string }) {
  return (
    <div>
      <PageHeader title="Teams" subtitle={`${teams.length} teams · ${allPeople.length} people`}
        action={canManage && (
          <Dialog title="Create a team" trigger={<><Icon.plus size={16} /> New team</>}>
            {(close) => <TeamForm people={allPeople} close={close} />}
          </Dialog>
        )} />
      <div className="grid sm:grid-cols-2 gap-4">
        {teams.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-navy">{t.name}</h3>
                <p className="text-[13px] text-graphite-500 mt-0.5">{t.description ?? "—"}</p>
              </div>
              {canManage && (
                <Dialog title={`Manage ${t.name}`} trigger="Manage" triggerVariant="ghost" triggerSize="sm">
                  {(close) => <ManageTeam team={t} people={allPeople} close={close} />}
                </Dialog>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12px] text-graphite-500">
              <Badge tone="navy">Lead</Badge><span>{t.lead ?? "Unassigned"}</span>
              <span className="ml-auto">{t.members.length} {t.members.length === 1 ? "member" : "members"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.members.slice(0, 10).map((m) => (
                <Link key={m.id} href={`/${slug}/people/${m.id}`} title={m.name}><Avatar name={m.name} src={m.image} size={30} /></Link>
              ))}
              {t.members.length === 0 && <p className="text-[13px] text-graphite-400">No members yet.</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamForm({ people, close }: { people: { id: string; name: string }[]; close: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", description: "", leadId: "" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await createTeam(f); setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Team name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Engineering" required /></div>
      <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What this team owns…" /></div>
      <div><Label>Team lead</Label><Select value={f.leadId} onChange={(e) => setF({ ...f, leadId: e.target.value })}><option value="">Assign later</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create team"}</Button></div>
    </form>
  );
}

function ManageTeam({ team, people, close }: { team: Team; people: { id: string; name: string; teamId: string | null }[]; close: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? "");
  const [leadId, setLeadId] = useState(team.leadId ?? "");
  const [addId, setAddId] = useState("");
  const [busy, setBusy] = useState(false);
  const outside = people.filter((p) => p.teamId !== team.id);
  async function save() { setBusy(true); await updateTeam(team.id, { name, description, leadId }); setBusy(false); close(); router.refresh(); }
  async function add() { if (!addId) return; setBusy(true); await moveMember(addId, team.id); setBusy(false); router.refresh(); }
  async function remove(id: string) { setBusy(true); await moveMember(id, null); setBusy(false); router.refresh(); }
  return (
    <div className="space-y-4">
      <div><Label>Team name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div><Label>Team lead</Label><Select value={leadId} onChange={(e) => setLeadId(e.target.value)}><option value="">Unassigned</option>{[...team.members, ...people.filter(p=>!team.members.find(m=>m.id===p.id))].map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      <div>
        <Label>Members</Label>
        <div className="space-y-1.5 mb-2 max-h-40 overflow-y-auto">
          {team.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-graphite-200 px-2.5 py-1.5">
              <span className="text-[13px] text-navy">{m.name}</span>
              <button onClick={() => remove(m.id)} className="text-[12px] text-bad hover:underline">Remove</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={addId} onChange={(e) => setAddId(e.target.value)}><option value="">Add a person…</option>{outside.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Button variant="secondary" onClick={add} disabled={!addId || busy}>Add</Button>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={close}>Close</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></div>
    </div>
  );
}
