"use client";
import { Dialog } from "@/components/Dialog";
import { Button, btnClass } from "@/components/ui";
import { ReviewForm } from "./ReviewForm";

type Q = { id: string; prompt: string; hasRating: boolean };
type Answer = { questionId: string; text: string; rating: number | null };

export function ReviewLauncher({ responseId, kind, subjectName, questions, ratingScale, initial, status, label }: {
  responseId: string; kind: string; subjectName: string; questions: Q[]; ratingScale: boolean;
  initial: { answers: Answer[]; summary: string; growth: string; overallRating: number | null }; status: string; label?: string;
}) {
  const triggerLabel = label ?? (status === "SUBMITTED" ? "View" : status === "IN_PROGRESS" ? "Continue" : "Start review");
  return (
    <Dialog wide title={kind === "MANAGER" ? `Review · ${subjectName}` : "Self review"} trigger={triggerLabel}
      triggerVariant={status === "SUBMITTED" ? "secondary" : "primary"} triggerSize="sm">
      {(close) => <ReviewForm responseId={responseId} kind={kind} subjectName={subjectName} questions={questions} ratingScale={ratingScale} initial={initial} close={close} />}
    </Dialog>
  );
}
