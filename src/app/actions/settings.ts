"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireEmployee, can } from "@/lib/session";

async function adminGuard() {
  const { me, company } = await requireEmployee();
  if (!can(me.role).isAdmin) return { ok: false as const, company: null };
  return { ok: true as const, company };
}

export async function updateCompany(input: { name?: string; country?: string; workWeek?: string; accentColor?: string }) {
  const g = await adminGuard(); if (!g.ok || !g.company) return { ok: false as const, error: "No permission." };
  await prisma.company.update({ where: { id: g.company.id }, data: { name: input.name?.trim() || undefined, country: input.country || undefined, workWeek: input.workWeek || undefined, accentColor: input.accentColor || undefined } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateLeavePolicy(id: string, allowanceDays: number) {
  const g = await adminGuard(); if (!g.ok || !g.company) return { ok: false as const, error: "No permission." };
  await prisma.leavePolicy.update({ where: { id }, data: { allowanceDays } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function addHoliday(input: { name: string; date: string; calendar: string }) {
  const g = await adminGuard(); if (!g.ok || !g.company) return { ok: false as const, error: "No permission." };
  if (!input.name.trim() || !input.date) return { ok: false as const, error: "Name and date required." };
  await prisma.holiday.create({ data: { companyId: g.company.id, name: input.name.trim(), date: new Date(input.date), calendar: input.calendar || "Company" } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function removeHoliday(id: string) {
  const g = await adminGuard(); if (!g.ok || !g.company) return { ok: false as const, error: "No permission." };
  await prisma.holiday.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
