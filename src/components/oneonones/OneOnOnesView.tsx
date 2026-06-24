"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, Button, Input, Label, Select, Textarea, cn } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { createOneOnOne, addNote, toggleAction } from "@/app/actions/oneonones";
import { fmtDate } from "@/lib/format";

type Action = { text: string; done: boolean };
type Note = { id: string; meetingDate: string; agenda: string | null; sharedNotes: string | null; privateNotes: string | null; actionItems: Action[]; canSeePrivate: boolean };
type O = { id: string; otherName: string; otherImage: string | null; otherId: string; role: "manager" | "report"; cadence: string; nextAt: string | null; notes: Note[] };

export function OneOnOnesView({ items, people }: { items: O[]; people: { id: string; name: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const t = useT();
  const cur = items.find((o) => o.id === active);
  return (
    <div>
      <PageHeader title={t("o1.title")} subtitle={t("o1.subtitle")}
        action={<Dialog title="New 1:1" trigger={<><Icon.plus size={16} /> {t("o1.new")}</>}>{(close) => <NewOneOnOne people={people} close={close} />}</Dialog>} />
      {items.length === 0 ? <Card className="p-10 text-center text-[13px] text-ink-soft">{t("o2.noOneOnOnes")}</Card> : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            {items.map((o) => (
              <button key={o.id} onClick={() => setActive(o.id)} className={cn("w-full text-left rounded-xl border p-3 transition", active === o.id ? "border-accent-100 bg-accent-soft" : "border-line bg-surface hover:bg-surface-2")}>
                <div className="flex items-center gap-2.5">
                  <Avatar name={o.otherName} src={o.otherImage} size={34} />
                  <div className="flex-1 min-w-0"><p className="text-[13.5px] font-medium text-ink">{o.otherName}</p><p className="text-[12px] text-ink-soft">{o.cadence} · {o.role === "manager" ? t("o2.yourReport") : t("o2.yourManager")}</p></div>
                  {o.nextAt && <span className="text-[11px] text-ink-faint">{fmtDate(o.nextAt, { month: "short", day: "numeric" })}</span>}
                </div>
              </button>
            ))}
          </div>
          {cur && (
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Avatar name={cur.otherName} src={cur.otherImage} size={40} /><div><p className="font-semibold text-ink">{cur.otherName}</p><p className="text-[12px] text-ink-soft">{cur.cadence}{cur.nextAt ? ` · ${t("o2.next")} ${fmtDate(cur.nextAt)}` : ""}</p></div></div>
                  <Dialog wide title={t("o2.addMeetingNotes")} trigger={<><Icon.plus size={15} /> {t("o2.addNotes")}</>} triggerSize="sm">{(close) => <NoteForm oneOnOneId={cur.id} close={close} />}</Dialog>
                </div>
              </Card>
              {cur.notes.length === 0 ? <Card className="p-8 text-center text-[13px] text-ink-soft">{t("o2.noNotes")}</Card> :
                cur.notes.map((n) => <NoteCard key={n.id} n={n} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoteCard({ n }: { n: Note }) {
  const t = useT();
  const router = useRouter();
  return (
    <Card className="p-5">
      <p className="text-[12px] font-medium text-ink-soft uppercase tracking-wide">{fmtDate(n.meetingDate)}</p>
      {n.agenda && <div className="mt-2"><p className="text-[12px] text-ink-faint">{t("o2.agenda")}</p><p className="text-[13.5px] text-ink-muted">{n.agenda}</p></div>}
      {n.sharedNotes && <div className="mt-2.5"><p className="text-[12px] text-ink-faint">{t("o2.sharedNotes")}</p><p className="text-[13.5px] text-ink-muted whitespace-pre-wrap">{n.sharedNotes}</p></div>}
      {n.canSeePrivate && n.privateNotes && <div className="mt-2.5 rounded-lg bg-surface-2 border border-line p-2.5"><p className="text-[12px] text-ink-faint">{t("o2.privateNotes")} · {t("o2.onlyYou")}</p><p className="text-[13px] text-ink-muted whitespace-pre-wrap">{n.privateNotes}</p></div>}
      {n.actionItems.length > 0 && (
        <div className="mt-3"><p className="text-[12px] text-ink-faint mb-1.5">{t("o2.actionItems")}</p>
          <div className="space-y-1.5">
            {n.actionItems.map((a, i) => (
              <button key={i} onClick={async () => { await toggleAction(n.id, i); router.refresh(); }} className="flex items-center gap-2 text-left w-full">
                <span className={cn("h-4 w-4 rounded border grid place-items-center", a.done ? "bg-good border-good" : "border-graphite-300")}>{a.done && <Icon.check size={11} className="text-white" />}</span>
                <span className={cn("text-[13px]", a.done ? "text-ink-faint line-through" : "text-ink-muted")}>{a.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function NewOneOnOne({ people, close }: { people: { id: string; name: string }[]; close: () => void }) {
  const t = useT();
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
      <div><Label>{t("o2.with")}</Label><Select value={otherId} onChange={(e) => setOtherId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>{t("o2.cadence")}</Label><Select value={cadence} onChange={(e) => setCadence(e.target.value)}>{[["Weekly","o2.weekly"],["Every 2 weeks","o2.biweekly"],["Monthly","o2.monthly"]].map(([val, key]) => <option key={val} value={val}>{t(key)}</option>)}</Select></div>
        <div><Label>{t("o2.nextMeeting")}</Label><Input type="date" value={nextAt} onChange={(e) => setNextAt(e.target.value)} /></div>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>{t("common.cancel")}</Button><Button type="submit" disabled={loading}>{loading ? t("common.creating") : t("o2.create")}</Button></div>
    </form>
  );
}

function NoteForm({ oneOnOneId, close }: { oneOnOneId: string; close: () => void }) {
  const t = useT();
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
      <div><Label>{t("o2.agenda")}</Label><Input value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder={t("o2.agendaPh")} /></div>
      <div><Label>{t("o2.sharedNotes")}</Label><Textarea value={sharedNotes} onChange={(e) => setSharedNotes(e.target.value)} placeholder={t("o2.sharedPh")} /></div>
      <div><Label>{t("o2.privateNotes")} <span className="text-ink-faint font-normal">· {t("o2.onlyYou")}</span></Label><Textarea value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} placeholder={t("o2.privatePh")} /></div>
      <div>
        <Label>{t("o2.actionItems")}</Label>
        <div className="space-y-2">
          {actions.map((a, i) => (
            <Input key={i} value={a.text} onChange={(e) => setActions((s) => s.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} placeholder={`Action ${i + 1}`} />
          ))}
          <button type="button" onClick={() => setActions((s) => [...s, { text: "", done: false }])} className="text-[13px] font-medium text-accent hover:underline">{t("o2.addAction")}</button>
        </div>
      </div>
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>{t("common.cancel")}</Button><Button type="submit" disabled={loading}>{loading ? t("common.saving") : t("o2.saveNotes")}</Button></div>
    </form>
  );
}
