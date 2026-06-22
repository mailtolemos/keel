"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Button, Textarea, cn } from "@/components/ui";
import { createCycle } from "@/app/actions/reviews";

const DEFAULT_Q = [
  "What were your most significant accomplishments this period?",
  "Where did you grow the most, and where do you want to grow next?",
  "How well did you collaborate with and support your teammates?",
  "What should you start, stop, or continue doing next period?"
];

export function CreateCycleForm({ people, slug, close }: { people: { id: string; name: string; title: string | null }[]; slug: string; close: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("H2 2026 Performance Review");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [opts, setOpts] = useState({ selfReview: true, managerReview: true, peerReview: false, upwardReview: false, ratingScale: true });
  const [participantIds, setParticipantIds] = useState<string[]>(people.map((p) => p.id));
  const [questions, setQuestions] = useState(DEFAULT_Q.join("\n"));
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  const toggleP = (id: string) => setParticipantIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const optRow = (k: keyof typeof opts, label: string, hint: string) => (
    <label className="flex items-start gap-2.5 rounded-lg border border-graphite-200 px-3 py-2 cursor-pointer hover:bg-graphite-50">
      <input type="checkbox" checked={opts[k]} onChange={() => setOpts((s) => ({ ...s, [k]: !s[k] }))} className="mt-0.5 accent-accent h-4 w-4" />
      <span><span className="text-[13.5px] font-medium text-navy block">{label}</span><span className="text-[12px] text-graphite-500">{hint}</span></span>
    </label>
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await createCycle({ name, periodStart, periodEnd, dueDate, ...opts, participantIds, questions: questions.split("\n") });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.push(`/${slug}/reviews/${res.id}`); router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div><Label>Cycle name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Period start</Label><Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></div>
        <div><Label>Period end</Label><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></div>
        <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
      </div>
      <div>
        <Label>What's included</Label>
        <div className="grid grid-cols-2 gap-2">
          {optRow("selfReview", "Self review", "Everyone reflects on themselves")}
          {optRow("managerReview", "Manager review", "Managers review direct reports")}
          {optRow("peerReview", "Peer review", "Optional teammate feedback")}
          {optRow("upwardReview", "Upward review", "Reports review their manager")}
          {optRow("ratingScale", "Rating scale", "1–5 ratings on questions")}
        </div>
      </div>
      <div>
        <Label>Questions (one per line)</Label>
        <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)} className="min-h-[120px]" />
      </div>
      <div>
        <Label>Participants ({participantIds.length})</Label>
        <div className="max-h-44 overflow-y-auto rounded-lg border border-graphite-200 divide-y divide-graphite-100">
          {people.map((p) => (
            <label key={p.id} className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-graphite-50">
              <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleP(p.id)} className="accent-accent h-4 w-4" />
              <span className="text-[13px] text-navy">{p.name}</span><span className="text-[12px] text-graphite-400">{p.title}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2 pt-1 sticky bottom-0 bg-white"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating…" : "Launch cycle"}</Button></div>
    </form>
  );
}
