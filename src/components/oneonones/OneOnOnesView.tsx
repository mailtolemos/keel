"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, Button, Input, Label, Select, Textarea, cn } from "@/components/ui";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { createOneOnOne, addNote, toggleAction } from "@/app/actions/oneonones";
import { fmtDate } from "@/lib/format";

type Action = { text: string; done: boolean };
type Note = { id: string; meetingDate: string; agenda: string | null; sharedNotes: string | null; privateNotes: string | null; actionItems: Action[]; canSeePrivate: boolean };
type O = { id: string; otherName: string; otherImage: string | null; otherId: string; role: "manager" | "report"; cadence: string; nextAt: string | null; notes: Note[] };

export function OneOnOnesView({ items, people }: { items: O[]; people: { id: string; name: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const cur = items.find((o) => o.id === active);
  return (
    <div>
      <PageHeader title="1:1s" subtitle="Recurring conversations, shared notes, and action items that carry over."
        action={<Dialog title="New 1:1" trigger={<><Icon.plus size={16} /> New 1:1</>}>{(close) => <NewOneOnOne people={people} close={close} />}</Dialog>} />
      {items.length === 0 ? <Card className="p-10 text-center text-[13px] text-graphite-500">No 1:1s yet. Start one with a teammate.</Card> : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            {items.map((o) => (
              <button key={o.id} onClick={() => setActive(o.id)} className={cn("w-full text-left rounded-xl border p-3 transition", active === o.id ? "border-accent-100 bg-accent-50/40" : "border-graphite-200 bg-white hover:bg-graphite-50")}>
                <div className="flex items-center gap-2.5">
                  <Avatar name={o.otherName} src={o.otherImage} size={34} />
                  <div className="flex-1 min-w-0"><p className="text-[13.5px] font-medium text-navy">{o.otherName}</p><p className="text-[12px] text-graphite-500">{o.cadence} · {o.role === "manager" ? "your report" : "your manager"}</p></div>
                  {o.nextAt && <span className="text-[11px] text-graphite-400">{fmtDate(o.nextAt, { month: "short", day: "numeric" })}</span>}
                </div>
              </button>
            ))}
          </div>
          {cur && (
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Avatar name={cur.otherName} src={cur.otherImage} size={40} /><div><p className="font-semibold text-navy">{cur.otherName}</p><p className="text-[12px] text-graphite-500">{cur.cadence}{cur.nextAt ? ` · next ${fmtDate(cur.nextAt)}` : ""}</p></div></div>
                  <Dialog wide title="Add meeting notes" trigger={<><Icon.plus size={15} /> Add notes</>} triggerSize="sm">{(close) => <NoteForm oneOnOneId={cur.id} close={close} />}</Dialog>
                </div>
              </Card>
              {cur.notes.length === 0 ? <Card className="p-8 text-center text-[13px] text-graphite-500">No notes yet. Add your first meeting.</Card> :
                cur.notes.map((n) => <NoteCard key={n.id} n={n} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoteCard({ n }: { n: Note }) {
  const router = useRouter();
  return (
    <Card className="p-5">
      <p className="text-[12px] font-medium text-graphite-500 uppercase tracking-wide">{fmtDate(n.meetingDate)}</p>
      {n.agenda && <div className="mt-2"><p className="text-[12px] text-graphite-400">Agenda</p><p className="text-[13.5px] text-graphite-700">{n.agenda}</p></div>}
      {n.sharedNotes && <div className="mt-2.5"><p className="text-[12px] text-graphite-400">Shared notes</p><p className="text-[13.5px] text-graphite-700 whitespace-pre-wrap">{n.sharedNotes}</p></div>}
      {n.canSeePrivate && n.privateNotes && <div className="mt-2.5 rounded-lg bg-graphite-50 border border-graphite-200 p-2.5"><p className="text-[12px] text-graphite-400">Private notes · only you</p><p className="text-[13px] text-graphite-700 whitespace-pre-wrap">{n.privateNotes}</p></div>}
      {n.actionItems.length > 0 && (
        <div className="mt-3"><p className="text-[12px] text-graphite-400 mb-1.5">Action items</p>
          <div className="space-y-1.5">
            {n.actionItems.map((a, i) => (
              <button key={i} onClick={async () => { await toggleAction(n.id, i); router.refresh(); }} className="flex items-center gap-2 text-left w-full">
                <span className={cn("h-4 w-4 rounded border grid place-items-center", a.done ? "bg-good border-good" : "border-graphite-300")}>{a.done && <Icon.check size={11} className="text-white" />}</span>
                <span className={cn("text-[13px]", a.done ? "text-graphite-400 line-through" : "text-graphite-700")}>{a.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function NewOneOnOne({ people, close }: { people: { id: string; name: string }[]; close: () => void }) {
  const router = useRouter();
  const [otherId, setOtherId] = useState(people[0]?.id ?? "");
  const [cadence, setCadence] = useState("Weekly");
  const [nextAt, setNextAt] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await createOneOnOne({ otherId, cadence, nextAt }); setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>With</Label><Select value={otherId} onChange={(e) => setOtherId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Cadence</Label><Select value={cadence} onChange={(e) => setCadence(e.target.value)}>{["Weekly", "Every 2 weeks", "Monthly"].map((c) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label>Next meeting</Label><Input type="date" value={nextAt} onChange={(e) => setNextAt(e.target.value)} /></div>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create 1:1"}</Button></div>
    </form>
  );
}

function NoteForm({ oneOnOneId, close }: { oneOnOneId: string; close: () => void }) {
  const router = useRouter();
  const [agenda, setAgenda] = useState(""); const [sharedNotes, setSharedNotes] = useState(""); const [privateNotes, setPrivateNotes] = useState("");
  const [actions, setActions] = useState<Action[]>([{ text: "", done: false }]);
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    await addNote({ oneOnOneId, agenda, sharedNotes, privateNotes, actionItems: actions }); setLoading(false); close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Agenda</Label><Input value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Topics for today…" /></div>
      <div><Label>Shared notes</Label><Textarea value={sharedNotes} onChange={(e) => setSharedNotes(e.target.value)} placeholder="Visible to both of you" /></div>
      <div><Label>Private notes <span className="text-graphite-400 font-normal">· only you</span></Label><Textarea value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} placeholder="Just for you" /></div>
      <div>
        <Label>Action items</Label>
        <div className="space-y-2">
          {actions.map((a, i) => (
            <Input key={i} value={a.text} onChange={(e) => setActions((s) => s.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} placeholder={`Action ${i + 1}`} />
          ))}
          <button type="button" onClick={() => setActions((s) => [...s, { text: "", done: false }])} className="text-[13px] font-medium text-accent hover:underline">+ Add action</button>
        </div>
      </div>
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save notes"}</Button></div>
    </form>
  );
}
