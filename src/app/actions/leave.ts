"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployee, can } from "@/lib/session";
import { daysBetween } from "@/lib/format";

export async function requestLeave(input: { type: string; startDate: string; endDate: string; reason?: string }) {
  const { me } = await requireEmployee();
  const schema = z.object({ type: z.enum(["VACATION", "SICK", "PARENTAL", "UNPAID", "CUSTOM"]), startDate: z.string().min(1), endDate: z.string().min(1) });
  if (!schema.safeParse(input).success) return { ok: false as const, error: "Pick a type and dates." };
  const start = new Date(input.startDate), end = new Date(input.endDate);
  if (end < start) return { ok: false as const, error: "End date is before start date." };
  const days = Math.max(1, daysBetween(start, end));
  await prisma.leaveRequest.create({
    data: { employeeId: me.id, type: input.type, startDate: start, endDate: end, days, reason: input.reason || null, status: "PENDING" }
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function decideLeave(id: string, approve: boolean) {
  const { me, company } = await requireEmployee();
  if (!can(me.role).isManager) return { ok: false as const, error: "No permission." };
  const req = await prisma.leaveRequest.findFirst({ where: { id, employee: { companyId: company.id } } });
  if (!req) return { ok: false as const, error: "Not found." };
  await prisma.leaveRequest.update({ where: { id }, data: { status: approve ? "APPROVED" : "REJECTED", approverId: me.id, decidedAt: new Date() } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function cancelLeave(id: string) {
  const { me } = await requireEmployee();
  const req = await prisma.leaveRequest.findFirst({ where: { id, employeeId: me.id } });
  if (!req) return { ok: false as const, error: "Not found." };
  await prisma.leaveRequest.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
