import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const [policies, holidays, admins, managers, employees] = await Promise.all([
    prisma.leavePolicy.findMany({ where: { companyId: company.id } }),
    prisma.holiday.findMany({ where: { companyId: company.id }, orderBy: { date: "asc" } }),
    prisma.employee.count({ where: { companyId: company.id, role: "ADMIN" } }),
    prisma.employee.count({ where: { companyId: company.id, role: "MANAGER" } }),
    prisma.employee.count({ where: { companyId: company.id, role: "EMPLOYEE" } })
  ]);
  return (
    <SettingsView
      company={{ name: company.name, country: company.country, workWeek: company.workWeek, accentColor: company.accentColor }}
      policies={policies.map((p) => ({ id: p.id, name: p.name, type: p.type, allowanceDays: p.allowanceDays, paid: p.paid }))}
      holidays={holidays.map((h) => ({ id: h.id, name: h.name, date: h.date.toISOString(), calendar: h.calendar }))}
      counts={{ admins, managers, employees }}
      canManage={can(me.role).isAdmin}
    />
  );
}
