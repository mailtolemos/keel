"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Button } from "@/components/ui";
import { invitePerson } from "@/app/actions/people";

export function AddPersonForm({ teams, close }: { teams: { id: string; name: string }[]; close: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", title: "", role: "EMPLOYEE", teamId: teams[0]?.id ?? "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await invitePerson(f);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Could not add."); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Full name</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Jamie Fox" required /></div>
        <div><Label>Work email</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="jamie@company.com" required /></div>
      </div>
      <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Product Designer" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Role</Label><Select value={f.role} onChange={(e) => set("role", e.target.value)}><option value="EMPLOYEE">Employee</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option></Select></div>
        <div><Label>Team</Label><Select value={f.teamId} onChange={(e) => set("teamId", e.target.value)}><option value="">No team</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></div>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={close}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? "Adding…" : "Send invite"}</Button>
      </div>
    </form>
  );
}
