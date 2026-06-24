"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function getInvitation(token: string) {
  const inv = await prisma.invitation.findUnique({ where: { token }, include: { company: true } });
  if (!inv || inv.status !== "PENDING") return null;
  return { email: inv.email, name: inv.name, companyName: inv.company.name, companySlug: inv.company.slug };
}

export async function acceptInvitation(token: string, name: string, password: string) {
  if (!token) return { ok: false as const, error: "Missing invitation token." };
  if (password.length < 8) return { ok: false as const, error: "Password must be at least 8 characters." };
  const inv = await prisma.invitation.findUnique({ where: { token }, include: { company: true } });
  if (!inv || inv.status !== "PENDING") return { ok: false as const, error: "This invitation is invalid or has already been used." };

  const email = inv.email.toLowerCase().trim();
  const fullName = name.trim() || inv.name;
  const hash = await bcrypt.hash(password, 10);

  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    if (!user.passwordHash) user = await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash, name: fullName } });
  } else {
    user = await prisma.user.create({ data: { email, name: fullName, passwordHash: hash } });
  }

  const existing = await prisma.employee.findFirst({ where: { companyId: inv.companyId, workEmail: email } });
  if (existing) {
    await prisma.employee.update({ where: { id: existing.id }, data: { userId: user.id, status: "ACTIVE", name: existing.name || fullName, startDate: existing.startDate ?? new Date() } });
  } else {
    await prisma.employee.create({
      data: { companyId: inv.companyId, userId: user.id, name: fullName, workEmail: email, role: inv.role, status: "ACTIVE", teamId: inv.teamId, title: inv.title, startDate: new Date() }
    });
  }
  await prisma.invitation.update({ where: { id: inv.id }, data: { status: "ACCEPTED" } });
  return { ok: true as const, slug: inv.company.slug, email };
}
