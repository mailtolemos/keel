"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, Avatar, Badge, Button, Label, Select, Textarea, cn } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";
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
  const t = useT();
  const filtered = useMemo(() => items.filter((f) => {
    if (tab === "received") return f.subjectId === meId && !f.isRequest;
    if (tab === "given") return f.authorId === meId && !f.isRequest;
    if (tab === "requests") return f.isRequest;
    return !f.isRequest;
  }), [items, tab, meId]);

  return (
    <div>
      <PageHeader title={t("feedback.title")} subtitle={t("feedback.subtitle")}
        action={
          <div className="flex gap-2">
            <Dialog title={t("fb.requestTitle")} description={t("fb.requestDesc")} trigger={t("feedback.request")} triggerVariant="secondary">
              {(close) => <FeedbackForm people={people.filter((p) => p.id !== meId)} close={close} request />}
            </Dialog>
            <Dialog title={t("fb.giveTitle")} trigger={<><Icon.plus size={16} /> {t("feedback.give")}</>}>
              {(close) => <FeedbackForm people={people.filter((p) => p.id !== meId)} close={close} />}
            </Dialog>
          </div>
        } />

      <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 mb-4">
        {(["all", "received", "given", "requests"] as const).map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} className={cn("h-8 px-3.5 rounded-md text-[13px] font-medium transition", tab === tb ? "bg-navy text-white" : "text-ink-muted hover:text-ink")}>{t({ all: "fb.tabAll", received: "fb.tabReceived", given: "fb.tabGiven", requests: "fb.tabRequests" }[tb])}</button>
        ))}
      </div>

      <div className="space-y-3 max-w-3xl">
        {filtered.length === 0 ? <Card className="p-10 text-center text-[13px] text-ink-soft">{t("fb.nothing")}</Card> :
          filtered.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex gap-3">
                <Avatar name={f.authorName} src={f.authorImage} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap text-[13px]">
                    <Link href={`/${slug}/people/${f.authorId}`} className="font-medium text-ink hover:text-accent">{f.authorName}</Link>
                    <span className="text-ink-faint">{f.isRequest ? t("fb.requestedFrom") : "→"}</span>
                    <Link href={`/${slug}/people/${f.subjectId}`} className="font-medium text-ink hover:text-accent">{f.subjectName}</Link>
                    <Badge tone={visMeta[f.visibility].tone}>{t("vis." + f.visibility)}</Badge>
                    <span className="text-[12px] text-ink-faint ml-auto">{relativeTime(f.createdAt)}</span>
                  </div>
                  <p className="text-[13.5px] text-ink-muted mt-1.5 whitespace-pre-wrap">{f.body}</p>
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
  const t = useT();
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(people[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState(request ? "PRIVATE" : "PUBLIC");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const toggle = (tag: string) => setTags((s) => s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await giveFeedback({ subjectId, body, tags, visibility, isRequest: request });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>{request ? t("fb.ask") : t("fb.to")}</Label><Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      <div><Label>{request ? t("fb.whatFor") : t("fb.feedbackLabel")}</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={request ? t("fb.askPh") : t("fb.bodyPh")} required /></div>
      {!request && (
        <div>
          <Label>{t("fb.tags")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {FEEDBACK_TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggle(tag)} className={cn("h-8 px-3 rounded-lg border text-[13px] font-medium transition", tags.includes(tag) ? "border-accent bg-accent-soft text-accent-700 dark:text-accent-400" : "border-line text-ink-muted hover:bg-surface-2")}>{t("tag." + tag)}</button>
            ))}
          </div>
        </div>
      )}
      <div><Label>{t("fb.visibility")}</Label><Select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="PUBLIC">{t("fb.visPublic")}</option>
        <option value="MANAGER_ONLY">{t("fb.visManager")}</option>
        <option value="PRIVATE">{t("fb.visPrivate")}</option>
      </Select></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>{t("common.cancel")}</Button><Button type="submit" disabled={loading}>{loading ? t("fb.sending") : request ? t("feedback.request") : t("feedback.give")}</Button></div>
    </form>
  );
}
