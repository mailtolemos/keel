"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployee } from "@/lib/session";

export async function createGoal(input: { title: string; description?: string; level: string; ownerId?: string; teamId?: string; dueDate?: string; progress?: number; status?: string }) {
  const { me, company } = await requireEmployee();
  const schema = z.object({ title: z.string().min(1).max(160), level: z.enum(["COMPANY", "TEAM", "INDIVIDUAL"]) });
  if (!schema.safeParse(input).success) return { ok: false as const, error: "Add a title and level." };
  await prisma.goal.create({
    data: {
      companyId: company.id, title: input.title.trim(), description: input.description || null, level: input.level,
      ownerId: input.ownerId || me.id, teamId: input.level === "TEAM" ? (input.teamId || null) : null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null, progress: input.progress ?? 0, status: input.status || "ON_TRACK"
    }
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateGoal(id: string, input: { progress?: number; status?: string; note?: string }) {
  const { me, company } = await requireEmployee();
  const goal = await prisma.goal.findFirst({ where: { id, companyId: company.id } });
  if (!goal) return { ok: false as const, error: "Not found." };
  const data: any = {};
  if (typeof input.progress === "number") data.progress = Math.min(100, Math.max(0, input.progress));
  if (input.status) data.status = input.status;
  if (input.progress === 100) data.status = "DONE";
  await prisma.goal.update({ where: { id }, data });
  if (input.note && input.note.trim()) {
    await prisma.goalUpdate.create({ data: { goalId: id, authorId: me.id, body: input.note.trim(), progress: input.progress ?? null } });
  }
  revalidatePath("/", "layout");
  return { ok: true as const };
}
