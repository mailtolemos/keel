import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { LeaveView } from "@/components/leave/LeaveView";

const iso = (d: Date) => d.toISOString();

export default async function LeavePage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const perms = can(me.role);
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const vacationPolicy = await prisma.leavePolicy.findFirst({ where: { companyId: company.id, type: "VACATION" } });
  const allowance = vacationPolicy?.allowanceDays ?? 25;

  const [myRequests, myApprovedVacation, holidays, upcomingRaw, reports] = await Promise.all([
    prisma.leaveRequest.findMany({ where: { employeeId: me.id }, orderBy: { createdAt: "desc" }, include: { employee: { select: { name: true, photo: true } } } }),
    prisma.leaveRequest.findMany({ where: { employeeId: me.id, type: "VACATION", status: "APPROVED", startDate: { gte: yearStart } } }),
    prisma.holiday.findMany({ where: { companyId: company.id, date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 8 }),
    prisma.leaveRequest.findMany({
      where: { status: "APPROVED", endDate: { gte: new Date() }, employee: { companyId: company.id } },
      include: { employee: { select: { id: true, name: true, photo: true } } }, orderBy: { startDate: "asc" }, take: 10
    }),
    prisma.employee.findMany({ where: { managerId: me.id }, select: { id: true } })
  ]);

  const reportIds = reports.map((r) => r.id);
  const pendingRaw = perms.isAdmin
    ? await prisma.leaveRequest.findMany({ where: { status: "PENDING", employee: { companyId: company.id } }, include: { employee: { select: { name: true, photo: true } } }, orderBy: { createdAt: "asc" } })
    : perms.isManager
      ? await prisma.leaveRequest.findMany({ where: { status: "PENDING", employeeId: { in: reportIds } }, include: { employee: { select: { name: true, photo: true } } }, orderBy: { createdAt: "asc" } })
      : [];

  const usedVacation = myApprovedVacation.reduce((a, r) => a + r.days, 0);
  const map = (r: any, mine: boolean) => ({
    id: r.id, type: r.type, startDate: iso(r.startDate), endDate: iso(r.endDate), days: r.days, reason: r.reason,
    status: r.status, employeeName: r.employee.name, employeeImage: r.employee.photo, mine
  });

  return (
    <LeaveView
      balance={Math.max(0, allowance - usedVacation)} allowance={allowance}
      myRequests={myRequests.map((r) => map(r, true))}
      pending={pendingRaw.map((r) => map(r, false))}
      holidays={holidays.map((h) => ({ id: h.id, name: h.name, date: iso(h.date), calendar: h.calendar }))}
      upcoming={upcomingRaw.map((u) => ({ id: u.id, name: u.employee.name, image: u.employee.photo, type: u.type, startDate: iso(u.startDate), endDate: iso(u.endDate) }))}
      canApprove={perms.isManager}
    />
  );
}
