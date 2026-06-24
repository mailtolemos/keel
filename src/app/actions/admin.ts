"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/session";
import { uniqueSlug, slugify } from "@/lib/slug";

export async function createEntity(input: { name: string; country?: string; slug?: string }) {
  const user = await requirePlatformAdmin();
  if (!z.string().min(1).safeParse(input.name).success) return { ok: false as const, error: "Company name is required." };
  const slug = await uniqueSlug(input.slug?.trim() || input.name);
  const company = await prisma.company.create({
    data: { name: input.name.trim(), slug, country: input.country || "United States", workWeek: "Mon,Tue,Wed,Thu,Fri", status: "active", trialEndsAt: new Date(Date.now() + 14 * 86400000) }
  });
  await prisma.leavePolicy.createMany({
    data: [
      { companyId: company.id, name: "Vacation", type: "VACATION", allowanceDays: 25, paid: true },
      { companyId: company.id, name: "Sick leave", type: "SICK", allowanceDays: 10, paid: true },
      { companyId: company.id, name: "Parental leave", type: "PARENTAL", allowanceDays: 90, paid: true },
      { companyId: company.id, name: "Unpaid leave", type: "UNPAID", allowanceDays: 0, paid: false }
    ]
  });
  // Operator becomes an ADMIN employee so they can enter the workspace immediately.
  await prisma.employee.create({
    data: { companyId: company.id, userId: user.id, name: user.name, workEmail: user.email, title: "Operator", role: "ADMIN", status: "ACTIVE", startDate: new Date() }
  });
  revalidatePath("/admin");
  return { ok: true as const, slug };
}

export async function updateEntity(id: string, input: { name?: string; slug?: string; status?: string; country?: string }) {
  await requirePlatformAdmin();
  const data: Record<string, unknown> = {};
  if (input.name?.trim()) data.name = input.name.trim();
  if (input.country?.trim()) data.country = input.country.trim();
  if (input.status) data.status = input.status;
  if (input.slug?.trim()) {
    const desired = slugify(input.slug);
    const current = await prisma.company.findUnique({ where: { id } });
    if (!current) return { ok: false as const, error: "Not found." };
    if (desired !== current.slug) data.slug = await uniqueSlug(desired, id);
  }
  await prisma.company.update({ where: { id }, data });
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true as const };
}

// ---- Changelog ----
export async function createChangelogEntry(input: { title: string; category: string; summary: string; changes: string; date?: string; published?: boolean }) {
  await requirePlatformAdmin();
  if (!input.title.trim() || !input.summary.trim()) return { ok: false as const, error: "Title and summary are required." };
  await prisma.changelog.create({
    data: {
      title: input.title.trim(), category: input.category || "Feature", summary: input.summary.trim(),
      changes: input.changes || "", date: input.date ? new Date(input.date) : new Date(), published: input.published ?? true
    }
  });
  revalidatePath("/admin/changelog");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateChangelogEntry(id: string, input: { title?: string; category?: string; summary?: string; changes?: string; date?: string; published?: boolean }) {
  await requirePlatformAdmin();
  const data: Record<string, unknown> = {};
  for (const k of ["title", "category", "summary", "changes"] as const) if (input[k] !== undefined) data[k] = input[k];
  if (input.date) data.date = new Date(input.date);
  if (input.published !== undefined) data.published = input.published;
  await prisma.changelog.update({ where: { id }, data });
  revalidatePath("/admin/changelog");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteChangelogEntry(id: string) {
  await requirePlatformAdmin();
  await prisma.changelog.delete({ where: { id } });
  revalidatePath("/admin/changelog");
  revalidatePath("/");
  return { ok: true as const };
}
