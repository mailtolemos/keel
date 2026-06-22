"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployee, can } from "@/lib/session";

export async function invitePerson(input: { name: string; email: string; title?: string; role: string; teamId?: string; managerId?: string }) {
  const { company, me } = await requireEmployee();
  if (!can(me.role).isManager) return { ok: false as const, error: "You don't have permission to add people." };
  const schema = z.object({ name: z.string().min(1), email: z.string().email(), role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]) });
  const p = schema.safeParse(input);
  if (!p.success) return { ok: false as const, error: "Check the name and email." };
  const email = input.email.toLowerCase().trim();
  const dupe = await prisma.employee.findFirst({ where: { companyId: company.id, workEmail: email } });
  if (dupe) return { ok: false as const, error: "Someone with that email is already here." };
  await prisma.employee.create({
    data: {
      companyId: company.id, name: input.name.trim(), workEmail: email, title: input.title || null,
      role: input.role, status: "INVITED", teamId: input.teamId || null, managerId: input.managerId || null
    }
  });
  await prisma.invitation.create({
    data: { companyId: company.id, email, name: input.name.trim(), role: input.role, title: input.title || null, teamId: input.teamId || null }
  });
  revalidatePath("/", "layout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateEmployee(id: string, input: Record<string, string | null>) {
  const { company, me } = await requireEmployee();
  const target = await prisma.employee.findFirst({ where: { id, companyId: company.id } });
  if (!target) return { ok: false as const, error: "Not found." };
  const perms = can(me.role);
  const isSelf = target.id === me.id;
  if (!perms.isManager && !isSelf) return { ok: false as const, error: "No permission." };
  const data: Record<string, unknown> = {};
  for (const k of ["title", "location", "employmentType", "teamId", "managerId", "status", "role"]) {
    if (k in input) {
      if ((k === "status" || k === "role") && !perms.isManager) continue;
      data[k] = input[k] || null;
    }
  }
  if ("adminNotes" in input && perms.isManager) data.adminNotes = input.adminNotes;
  await prisma.employee.update({ where: { id }, data });
  revalidatePath("/", "layout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}
