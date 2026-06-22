"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, Button, Label, Select, Textarea, cn } from "@/components/ui";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { giveFeedback } from "@/app/actions/feedback";
import { FEEDBACK_TAGS } from "@/lib/enums";
import { relativeTime } from "@/lib/format";

type Item = {
  id: string; body: string; tags: string; visibility: string; isRequest: boolean; createdAt: string;
  authorId: string; authorName: string; authorImage: string | null; subjectId: string; subjectName: string;
};
const visMeta: Record<string, { label: string; tone: "neutral" | "accent" | "warn" }> = {
  PUBLIC: { label: "Public", tone: "accent" }, MANAGER_ONLY: { label: "Manager-only", tone: "warn" }, PRIVATE: { label: "Private", tone: "neutral" }
};

export function FeedbackView({ items, people, meId, slug }: { items: Item[]; people: { id: string; name: string }[]; meId: string; slug: string }) {
  const [tab, setTab] = useState<"all" | "received" | "given" | "requests">("all");
  const filtered = useMemo(() => items.filter((f) => {
    if (tab === "received") return f.subjectId === meId && !f.isRequest;
    if (tab === "given") return f.authorId === meId && !f.isRequest;
    if (tab === "requests") return f.isRequest;
    return !f.isRequest;
  }), [items, tab, meId]);

  return (
    <div>
      <PageHeader title="Feedback" subtitle="Continuous, lightweight feedback — praise, growth, and requests."
        action={
          <div className="flex gap-2">
            <Dialog title="Request feedback" description="Ask a teammate for input." trigger="Request" triggerVariant="secondary">
              {(close) => <FeedbackForm people={people.filter((p) => p.id !== meId)} close={close} request />}
            </Dialog>
            <Dialog title="Give feedback" trigger={<><Icon.plus size={16} /> Give feedback</>}>
              {(close) => <FeedbackForm people={people.filter((p) => p.id !== meId)} close={close} />}
            </Dialog>
          </div>
        } />

      <div className="inline-flex rounded-lg border border-graphite-200 bg-white p-0.5 mb-4">
        {(["all", "received", "given", "requests"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("h-8 px-3.5 rounded-md text-[13px] font-medium capitalize transition", tab === t ? "bg-navy text-white" : "text-graphite-600 hover:text-navy")}>{t}</button>
        ))}
      </div>

      <div className="space-y-3 max-w-3xl">
        {filtered.length === 0 ? <Card className="p-10 text-center text-[13px] text-graphite-500">Nothing here yet.</Card> :
          filtered.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex gap-3">
                <Avatar name={f.authorName} src={f.authorImage} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap text-[13px]">
                    <Link href={`/${slug}/people/${f.authorId}`} className="font-medium text-navy hover:text-accent">{f.authorName}</Link>
                    <span className="text-graphite-400">{f.isRequest ? "requested feedback from" : "→"}</span>
                    <Link href={`/${slug}/people/${f.subjectId}`} className="font-medium text-navy hover:text-accent">{f.subjectName}</Link>
                    <Badge tone={visMeta[f.visibility].tone}>{visMeta[f.visibility].label}</Badge>
                    <span className="text-[12px] text-graphite-400 ml-auto">{relativeTime(f.createdAt)}</span>
                  </div>
                  <p className="text-[13.5px] text-graphite-700 mt-1.5 whitespace-pre-wrap">{f.body}</p>
                  {f.tags && <div className="mt-2 flex gap-1.5 flex-wrap">{f.tags.split(",").filter(Boolean).map((t) => <Badge key={t} tone="accent">{t}</Badge>)}</div>}
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

function FeedbackForm({ people, close, request = false }: { people: { id: string; name: string }[]; close: () => void; request?: boolean }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(people[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState(request ? "PRIVATE" : "PUBLIC");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const toggle = (t: string) => setTags((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await giveFeedback({ subjectId, body, tags, visibility, isRequest: request });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>{request ? "Ask" : "To"}</Label><Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      <div><Label>{request ? "What would you like feedback on?" : "Feedback"}</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={request ? "I'd love your thoughts on…" : "Be specific and kind…"} required /></div>
      {!request && (
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-1.5">
            {FEEDBACK_TAGS.map((t) => (
              <button key={t} type="button" onClick={() => toggle(t)} className={cn("h-8 px-3 rounded-lg border text-[13px] font-medium transition", tags.includes(t) ? "border-accent bg-accent-50 text-accent-700" : "border-graphite-200 text-graphite-600 hover:bg-graphite-50")}>{t}</button>
            ))}
          </div>
        </div>
      )}
      <div><Label>Visibility</Label><Select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="PUBLIC">Public praise — visible to everyone</option>
        <option value="MANAGER_ONLY">Manager-only — for their manager & admins</option>
        <option value="PRIVATE">Private — just the two of you</option>
      </Select></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Sending…" : request ? "Send request" : "Give feedback"}</Button></div>
    </form>
  );
}
