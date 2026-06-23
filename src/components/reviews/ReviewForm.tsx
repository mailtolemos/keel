"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Label, Textarea, Button, cn } from "@/components/ui";
import { saveResponse } from "@/app/actions/reviews";

type Q = { id: string; prompt: string; hasRating: boolean };
type Answer = { questionId: string; text: string; rating: number | null };

export function ReviewForm({ responseId, kind, subjectName, questions, ratingScale, initial, close }: {
  responseId: string; kind: string; subjectName: string; questions: Q[]; ratingScale: boolean;
  initial: { answers: Answer[]; summary: string; growth: string; overallRating: number | null }; close: () => void;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>(questions.map((q) => initial.answers.find((a) => a.questionId === q.id) ?? { questionId: q.id, text: "", rating: null }));
  const [summary, setSummary] = useState(initial.summary);
  const [growth, setGrowth] = useState(initial.growth);
  const [overallRating, setOverallRating] = useState<number | null>(initial.overallRating);
  const [loading, setLoading] = useState<"" | "draft" | "submit">("");
  const isManager = kind === "MANAGER";

  const setAns = (qid: string, patch: Partial<Answer>) => setAnswers((s) => s.map((a) => a.questionId === qid ? { ...a, ...patch } : a));

  async function save(submit: boolean) {
    setLoading(submit ? "submit" : "draft");
    await saveResponse(responseId, { answers, summary, growth, overallRating, submit });
    setLoading(""); close(); router.refresh();
  }

  return (
    <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
      <p className="text-[13px] text-ink-muted">{isManager ? `Manager review for ${subjectName}` : "Your self review"}</p>
      {questions.map((q, i) => {
        const a = answers.find((x) => x.questionId === q.id)!;
        return (
          <div key={q.id}>
            <Label>{i + 1}. {q.prompt}</Label>
            <Textarea value={a.text} onChange={(e) => setAns(q.id, { text: e.target.value })} placeholder="Be specific…" />
            {ratingScale && q.hasRating && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[12px] text-ink-soft mr-1">Rating</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setAns(q.id, { rating: n })} className={cn("h-7 w-7 rounded-md border text-[12px] font-medium", a.rating === n ? "border-accent bg-accent text-white" : "border-line text-ink-soft hover:bg-surface-2")}>{n}</button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {isManager && (
        <>
          <div><Label>Performance summary</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Overall summary of performance…" /></div>
          <div><Label>Growth recommendations</Label><Textarea value={growth} onChange={(e) => setGrowth(e.target.value)} placeholder="Where should they grow next?" /></div>
        </>
      )}
      {ratingScale && (
        <div>
          <Label>Overall rating</Label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setOverallRating(n)} className={cn("h-9 w-9 rounded-lg border text-sm font-medium", overallRating === n ? "border-accent bg-accent text-white" : "border-line text-ink-soft hover:bg-surface-2")}>{n}</button>
            ))}
            <span className="ml-2 text-[12px] text-ink-faint">1 = needs focus · 5 = exceptional</span>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1 sticky bottom-0 bg-surface">
        <Button variant="secondary" onClick={() => save(false)} disabled={!!loading}>{loading === "draft" ? "Saving…" : "Save draft"}</Button>
        <Button onClick={() => save(true)} disabled={!!loading}>{loading === "submit" ? "Submitting…" : "Submit review"}</Button>
      </div>
    </div>
  );
}
