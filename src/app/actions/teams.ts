"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployee, can } from "@/lib/session";

async function guard() {
  const { company, me } = await requireEmployee();
  if (!can(me.role).isManager) return { ok: false as const, error: "No permission.", company: null };
  return { ok: true as const, company };
}

export async function createTeam(input: { name: string; description?: string; leadId?: string }) {
  const g = await guard(); if (!g.ok || !g.company) return { ok: false as const, error: g.error };
  if (!z.string().min(1).safeParse(input.name).success) return { ok: false as const, error: "Name required." };
  const team = await prisma.team.create({ data: { companyId: g.company.id, name: input.name.trim(), description: input.description || null, leadId: input.leadId || null } });
  if (input.leadId) await prisma.employee.update({ where: { id: input.leadId }, data: { teamId: team.id } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateTeam(id: string, input: { name?: string; description?: string; leadId?: string }) {
  const g = await guard(); if (!g.ok || !g.company) return { ok: false as const, error: g.error };
  await prisma.team.update({ where: { id }, data: { name: input.name?.trim(), description: input.description ?? undefined, leadId: input.leadId ?? null } });
  if (input.leadId) await prisma.employee.update({ where: { id: input.leadId }, data: { teamId: id } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function moveMember(employeeId: string, teamId: string | null) {
  const g = await guard(); if (!g.ok || !g.company) return { ok: false as const, error: g.error };
  await prisma.employee.update({ where: { id: employeeId }, data: { teamId } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
