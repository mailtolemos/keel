"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button, Input, Label, Textarea, Select } from "@/components/ui";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { createChangelogEntry, updateChangelogEntry, deleteChangelogEntry } from "@/app/actions/admin";
import { fmtDate } from "@/lib/format";

type Entry = { id: string; title: string; category: string; summary: string; changes: string; date: string; published: boolean };
const catTone = (c: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" => (c === "Feature" ? "accent" : c === "Improvement" ? "navy" : "neutral");

export function ChangelogManager({ entries }: { entries: Entry[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-[22px] font-semibold tracking-tight text-navy">Changelog</h1><p className="text-[13px] text-graphite-500 mt-0.5">Updates here appear on the public homepage.</p></div>
        <Dialog wide title="Post an update" trigger={<><Icon.plus size={16} /> New update</>}>{(close) => <EntryForm close={close} />}</Dialog>
      </div>
      <div className="space-y-3">
        {entries.length === 0 && <Card className="p-10 text-center text-[13px] text-graphite-500">No updates yet.</Card>}
        {entries.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={catTone(e.category)}>{e.category}</Badge>
                  <span className="font-semibold text-navy">{e.title}</span>
                  {!e.published && <Badge tone="warn">Draft</Badge>}
                  <span className="text-[12px] text-graphite-400">{fmtDate(e.date)}</span>
                </div>
                <p className="text-[13px] text-graphite-600 mt-1.5">{e.summary}</p>
                {e.changes && <ul className="mt-2 space-y-1">{e.changes.split("\n").filter(Boolean).map((c, i) => <li key={i} className="text-[12.5px] text-graphite-600 flex gap-1.5"><Icon.check size={13} className="text-accent mt-0.5 shrink-0" />{c}</li>)}</ul>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Dialog wide title="Edit update" trigger="Edit" triggerVariant="ghost" triggerSize="sm">{(close) => <EntryForm close={close} entry={e} />}</Dialog>
                <DeleteBtn id={e.id} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DeleteBtn({ id }: { id: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button onClick={async () => { setBusy(true); await deleteChangelogEntry(id); setBusy(false); router.refresh(); }} disabled={busy} className="h-8 px-2 rounded-lg text-[12px] text-bad hover:bg-red-50">Delete</button>;
}

function EntryForm({ close, entry }: { close: () => void; entry?: Entry }) {
  const router = useRouter();
  const [f, setF] = useState({
    title: entry?.title ?? "", category: entry?.category ?? "Feature", summary: entry?.summary ?? "",
    changes: entry?.changes ?? "", date: entry ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    published: entry?.published ?? true
  });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const res = entry ? await updateChangelogEntry(entry.id, f) : await createChangelogEntry(f);
    setBusy(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2"><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Multi-workspace platform" required /></div>
        <div><Label>Category</Label><Select value={f.category} onChange={(e) => set("category", e.target.value)}><option>Feature</option><option>Improvement</option><option>Fix</option></Select></div>
      </div>
      <div><Label>Summary</Label><Textarea value={f.summary} onChange={(e) => set("summary", e.target.value)} placeholder="One or two sentences describing the update…" required /></div>
      <div><Label>What changed (one bullet per line)</Label><Textarea value={f.changes} onChange={(e) => set("changes", e.target.value)} className="min-h-[100px]" placeholder={"Added X\nImproved Y\nFixed Z"} /></div>
      <div className="grid grid-cols-2 gap-3 items-end">
        <div><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
        <label className="flex items-center gap-2 h-9"><input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="accent-accent h-4 w-4" /><span className="text-[13px] text-graphite-700">Published (visible on homepage)</span></label>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : entry ? "Save" : "Post update"}</Button></div>
    </form>
  );
}
