"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployee, can } from "@/lib/session";

export async function createCycle(input: {
  name: string; periodStart?: string; periodEnd?: string; dueDate?: string;
  selfReview: boolean; managerReview: boolean; peerReview: boolean; upwardReview: boolean; ratingScale: boolean;
  participantIds: string[]; questions: string[];
}) {
  const { me, company } = await requireEmployee();
  if (!can(me.role).isAdmin) return { ok: false as const, error: "Only admins can create cycles." };
  if (!z.string().min(1).safeParse(input.name).success) return { ok: false as const, error: "Add a cycle name." };
  if (!input.participantIds.length) return { ok: false as const, error: "Pick at least one participant." };

  const cycle = await prisma.reviewCycle.create({
    data: {
      companyId: company.id, name: input.name.trim(),
      periodStart: input.periodStart ? new Date(input.periodStart) : null,
      periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      selfReview: input.selfReview, managerReview: input.managerReview, peerReview: input.peerReview,
      upwardReview: input.upwardReview, ratingScale: input.ratingScale, status: "ACTIVE"
    }
  });
  const qs = input.questions.filter((q) => q.trim());
  for (let i = 0; i < qs.length; i++) {
    await prisma.reviewQuestion.create({ data: { cycleId: cycle.id, prompt: qs[i].trim(), order: i, hasRating: input.ratingScale } });
  }
  const participants = await prisma.employee.findMany({ where: { id: { in: input.participantIds }, companyId: company.id }, select: { id: true, managerId: true } });
  for (const p of participants) {
    await prisma.cycleParticipant.create({ data: { cycleId: cycle.id, employeeId: p.id } });
    if (input.selfReview) {
      await prisma.reviewResponse.create({ data: { cycleId: cycle.id, kind: "SELF", authorId: p.id, subjectId: p.id, status: "NOT_STARTED" } });
    }
    if (input.managerReview && p.managerId) {
      await prisma.reviewResponse.create({ data: { cycleId: cycle.id, kind: "MANAGER", authorId: p.managerId, subjectId: p.id, status: "NOT_STARTED" } });
    }
  }
  revalidatePath("/", "layout");
  return { ok: true as const, id: cycle.id };
}

export async function saveResponse(responseId: string, input: {
  answers: { questionId: string; text: string; rating: number | null }[];
  summary?: string; growth?: string; overallRating?: number | null; submit: boolean;
}) {
  const { me } = await requireEmployee();
  const resp = await prisma.reviewResponse.findUnique({ where: { id: responseId } });
  if (!resp) return { ok: false as const, error: "Not found." };
  if (resp.authorId !== me.id) return { ok: false as const, error: "This isn't your review to write." };
  await prisma.reviewResponse.update({
    where: { id: responseId },
    data: {
      answers: JSON.stringify(input.answers), summary: input.summary || null, growth: input.growth || null,
      overallRating: input.overallRating ?? null,
      status: input.submit ? "SUBMITTED" : "IN_PROGRESS",
      submittedAt: input.submit ? new Date() : null
    }
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function setCycleStatus(id: string, status: "ACTIVE" | "CLOSED" | "RELEASED") {
  const { me, company } = await requireEmployee();
  if (!can(me.role).isAdmin) return { ok: false as const, error: "No permission." };
  await prisma.reviewCycle.updateMany({ where: { id, companyId: company.id }, data: { status } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
