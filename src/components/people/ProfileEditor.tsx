"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Textarea, Button } from "@/components/ui";
import { updateEmployee } from "@/app/actions/people";

export function ProfileEditor({ id, initial, teams, managers, close }: {
  id: string;
  initial: { title: string; location: string; employmentType: string; teamId: string; managerId: string; status: string; role: string; adminNotes: string };
  teams: { id: string; name: string }[]; managers: { id: string; name: string }[]; close: () => void;
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await updateEmployee(id, f);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Could not save."); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div><Label>Location</Label><Input value={f.location} onChange={(e) => set("location", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Employment type</Label><Select value={f.employmentType} onChange={(e) => set("employmentType", e.target.value)}>{["Full-time", "Part-time", "Contractor", "Intern"].map((t) => <option key={t}>{t}</option>)}</Select></div>
        <div><Label>Team</Label><Select value={f.teamId} onChange={(e) => set("teamId", e.target.value)}><option value="">No team</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Manager</Label><Select value={f.managerId} onChange={(e) => set("managerId", e.target.value)}><option value="">None</option>{managers.filter((m) => m.id !== id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></div>
        <div><Label>Role</Label><Select value={f.role} onChange={(e) => set("role", e.target.value)}><option value="EMPLOYEE">Employee</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option></Select></div>
      </div>
      <div><Label>Status</Label><Select value={f.status} onChange={(e) => set("status", e.target.value)}>{["ACTIVE", "INVITED", "OFFBOARDING", "INACTIVE"].map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}</Select></div>
      <div><Label>Admin notes (private to admins & managers)</Label><Textarea value={f.adminNotes} onChange={(e) => set("adminNotes", e.target.value)} placeholder="Context only managers should see…" /></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving…" : "Save changes"}</Button></div>
    </form>
  );
}
