"use server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";

const schema = z.object({
  companyName: z.string().min(1).max(100),
  country: z.string().min(1),
  workWeek: z.array(z.string()).min(1),
  holidays: z.array(z.object({ name: z.string(), date: z.string() })),
  teamName: z.string().min(1),
  invites: z.array(z.object({ name: z.string(), email: z.string().email(), role: z.string() }))
});

export async function createCompany(input: unknown) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false as const, error: "Not signed in." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Please complete the required steps." };
  const data = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { employees: true } });
  if (!user) return { ok: false as const, error: "User not found." };
  if (user.employees.length) return { ok: true as const, slug: undefined as string | undefined }; // already onboarded

  const slug = await uniqueSlug(data.companyName);
  const company = await prisma.company.create({
    data: { name: data.companyName.trim(), slug, country: data.country, workWeek: data.workWeek.join(","), trialEndsAt: new Date(Date.now() + 14 * 86400000) }
  });

  // Default leave policies
  await prisma.leavePolicy.createMany({
    data: [
      { companyId: company.id, name: "Vacation", type: "VACATION", allowanceDays: 25, paid: true },
      { companyId: company.id, name: "Sick leave", type: "SICK", allowanceDays: 10, paid: true },
      { companyId: company.id, name: "Parental leave", type: "PARENTAL", allowanceDays: 90, paid: true },
      { companyId: company.id, name: "Unpaid leave", type: "UNPAID", allowanceDays: 0, paid: false }
    ]
  });

  // Holidays
  if (data.holidays.length) {
    await prisma.holiday.createMany({
      data: data.holidays.map((h) => ({ companyId: company.id, name: h.name, date: new Date(h.date), calendar: "Company" }))
    });
  }

  // Admin employee (the founder)
  const team = await prisma.team.create({ data: { companyId: company.id, name: data.teamName.trim() } });
  const me = await prisma.employee.create({
    data: {
      companyId: company.id, userId: user.id, name: user.name, workEmail: user.email,
      title: "Founder", role: "ADMIN", status: "ACTIVE", teamId: team.id, startDate: new Date()
    }
  });
  await prisma.team.update({ where: { id: team.id }, data: { leadId: me.id } });
  await prisma.membership.create({ data: { employeeId: me.id, teamId: team.id, title: "Founder", isLead: true } });

  // Invitations
  for (const inv of data.invites) {
    if (!inv.email) continue;
    await prisma.invitation.create({
      data: { companyId: company.id, email: inv.email.toLowerCase().trim(), name: inv.name || inv.email, role: inv.role, teamId: team.id }
    });
  }

  return { ok: true as const, slug };
}
