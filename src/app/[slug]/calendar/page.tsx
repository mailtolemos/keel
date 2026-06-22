import { requireCompanyAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { CalendarView } from "@/components/calendar/CalendarView";

const eachDay = (start: Date, end: Date) => {
  const out: Date[] = []; const d = new Date(start);
  while (d <= end && out.length < 120) { out.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return out;
};

export default async function CalendarPage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const [holidays, leave, oneonones] = await Promise.all([
    prisma.holiday.findMany({ where: { companyId: company.id } }),
    prisma.leaveRequest.findMany({ where: { status: "APPROVED", employee: { companyId: company.id } }, include: { employee: { select: { name: true } } } }),
    prisma.oneOnOne.findMany({ where: { OR: [{ managerId: me.id }, { reportId: me.id }], nextAt: { not: null } }, include: { manager: { select: { name: true } }, report: { select: { name: true } } } })
  ]);
  const events: { date: string; title: string; type: "holiday" | "leave" | "oneonone" }[] = [];
  holidays.forEach((h) => events.push({ date: h.date.toISOString(), title: h.name, type: "holiday" }));
  leave.forEach((l) => eachDay(l.startDate, l.endDate).forEach((d) => events.push({ date: d.toISOString(), title: `${l.employee.name.split(" ")[0]} off`, type: "leave" })));
  oneonones.forEach((o) => { const other = o.managerId === me.id ? o.report : o.manager; if (o.nextAt) events.push({ date: o.nextAt.toISOString(), title: `1:1 · ${other.name.split(" ")[0]}`, type: "oneonone" }); });
  return <CalendarView events={events} />;
}
