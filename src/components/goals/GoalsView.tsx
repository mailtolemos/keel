"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, Button, Input, Label, Select, Textarea, Progress, cn } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { createGoal, updateGoal } from "@/app/actions/goals";
import { GOAL_STATUS_LABEL } from "@/lib/enums";
import { fmtDate, relativeTime } from "@/lib/format";

type Update = { id: string; body: string; createdAt: string; author: string; progress: number | null };
type Goal = { id: string; title: string; description: string | null; level: string; status: string; progress: number; dueDate: string | null; owner: string | null; ownerImage: string | null; team: string | null; updates: Update[] };

const goalTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "ON_TRACK" || s === "DONE" ? "good" : s === "AT_RISK" ? "warn" : s === "OFF_TRACK" ? "bad" : "neutral");
const levelLabel: Record<string, string> = { COMPANY: "Company", TEAM: "Team", INDIVIDUAL: "Individual" };

export function GoalsView({ goals, people, teams }: { goals: Goal[]; people: { id: string; name: string }[]; teams: { id: string; name: string }[] }) {
  const [level, setLevel] = useState("all");
  const t = useT();
  const shown = level === "all" ? goals : goals.filter((g) => g.level === level);
  return (
    <div>
      <PageHeader title={t("goals.title")} subtitle={t("goals.subtitle")}
        action={<Dialog wide title="Create a goal" trigger={<><Icon.plus size={16} /> {t("goals.new")}</>}>{(close) => <GoalForm people={people} teams={teams} close={close} />}</Dialog>} />

      <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 mb-4">
        {["all", "COMPANY", "TEAM", "INDIVIDUAL"].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={cn("h-8 px-3.5 rounded-md text-[13px] font-medium transition", level === l ? "bg-navy text-white" : "text-ink-muted hover:text-ink")}>{l === "all" ? "All" : levelLabel[l]}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((g) => <GoalCard key={g.id} g={g} />)}
        {shown.length === 0 && <Card className="p-10 text-center text-[13px] text-ink-soft md:col-span-2">No goals at this level yet.</Card>}
      </div>
    </div>
  );
}

function GoalCard({ g }: { g: Goal }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={g.level === "COMPANY" ? "navy" : g.level === "TEAM" ? "accent" : "neutral"}>{levelLabel[g.level]}{g.team ? ` · ${g.team}` : ""}</Badge>
          <Badge tone={goalTone(g.status)}>{GOAL_STATUS_LABEL[g.status]}</Badge>
        </div>
        <Dialog wide title="Update goal" trigger="Update" triggerVariant="ghost" triggerSize="sm">{(close) => <UpdateForm g={g} close={close} />}</Dialog>
      </div>
      <h3 className="font-semibold text-ink mt-2.5">{g.title}</h3>
      {g.description && <p className="text-[13px] text-ink-soft mt-1 line-clamp-2">{g.description}</p>}
      <div className="mt-3.5">
        <div className="flex justify-between text-[12px] mb-1"><span className="text-ink-soft">Progress</span><span className="font-medium text-ink">{g.progress}%</span></div>
        <Progress value={g.progress} tone={goalTone(g.status)} />
      </div>
      <div className="mt-3.5 flex items-center justify-between text-[12px] text-ink-soft">
        <div className="flex items-center gap-1.5">{g.owner && <Avatar name={g.owner} src={g.ownerImage} size={22} />}<span>{g.owner ?? "Unassigned"}</span></div>
        <span>Due {fmtDate(g.dueDate)}</span>
      </div>
      {g.updates.length > 0 && (
        <div className="mt-3.5 border-t border-line-2 pt-3 space-y-2">
          {g.updates.slice(0, 2).map((u) => (
            <div key={u.id} className="text-[12.5px]"><span className="text-ink-muted">{u.body}</span> <span className="text-ink-faint">· {u.author.split(" ")[0]}, {relativeTime(u.createdAt)}</span></div>
          ))}
        </div>
      )}
    </Card>
  );
}

function GoalForm({ people, teams, close }: { people: { id: string; name: string }[]; teams: { id: string; name: string }[]; close: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ title: "", description: "", level: "INDIVIDUAL", ownerId: people[0]?.id ?? "", teamId: teams[0]?.id ?? "", dueDate: "", progress: 0, status: "ON_TRACK" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await createGoal({ ...f, progress: Number(f.progress) }); setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Reach $5M ARR" required /></div>
      <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Level</Label><Select value={f.level} onChange={(e) => set("level", e.target.value)}><option value="COMPANY">Company</option><option value="TEAM">Team</option><option value="INDIVIDUAL">Individual</option></Select></div>
        {f.level === "TEAM"
          ? <div><Label>Team</Label><Select value={f.teamId} onChange={(e) => set("teamId", e.target.value)}>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></div>
          : <div><Label>Owner</Label><Select value={f.ownerId} onChange={(e) => set("ownerId", e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Due date</Label><Input type="date" value={f.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></div>
        <div><Label>Starting progress</Label><Input type="number" min={0} max={100} value={f.progress} onChange={(e) => set("progress", e.target.value)} /></div>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create goal"}</Button></div>
    </form>
  );
}

function UpdateForm({ g, close }: { g: Goal; close: () => void }) {
  const router = useRouter();
  const [progress, setProgress] = useState(g.progress);
  const [status, setStatus] = useState(g.status);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    await updateGoal(g.id, { progress: Number(progress), status, note }); setLoading(false); close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[13px] text-ink-muted">{g.title}</p>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Progress ({progress}%)</Label><input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-accent" /></div>
        <div><Label>Status</Label><Select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(GOAL_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></div>
      </div>
      <div><Label>Add an update (optional)</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed since last time…" /></div>
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save update"}</Button></div>
    </form>
  );
}
