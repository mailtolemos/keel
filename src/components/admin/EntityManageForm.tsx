"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Label, Button, Select } from "@/components/ui";
import { updateEntity } from "@/app/actions/admin";
import { APP_DOMAIN } from "@/lib/constants";

export function EntityManageForm({ id, initial }: { id: string; initial: { name: string; slug: string; status: string; country: string } }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState("");
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  async function save() {
    setBusy(true); setError("");
    const res = await updateEntity(id, f);
    setBusy(false);
    if (!res.ok) { setError(res.error || "Could not save."); return; }
    setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 2000);
  }
  return (
    <Card className="p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-navy mb-4">Entity settings</h2>
      <div className="space-y-4">
        <div><Label>Company name</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div>
          <Label>Workspace address</Label>
          <div className="flex items-center gap-1 rounded-lg border border-graphite-200 bg-graphite-50 px-3 h-9 text-sm">
            <span className="text-graphite-500">{APP_DOMAIN}/</span>
            <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="flex-1 bg-transparent focus:outline-none text-navy font-medium" />
          </div>
          <p className="mt-1 text-[12px] text-graphite-500">Changing this changes the company's URL.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Country</Label><Input value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
          <div><Label>Status</Label><Select value={f.status} onChange={(e) => set("status", e.target.value)}><option value="active">Active</option><option value="suspended">Suspended</option><option value="trial">Trial</option></Select></div>
        </div>
      </div>
      {error && <p className="mt-3 text-[13px] text-bad">{error}</p>}
      <div className="mt-5 flex items-center gap-3"><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>{saved && <span className="text-[13px] text-good">Saved</span>}</div>
    </Card>
  );
}
