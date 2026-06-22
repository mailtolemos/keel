import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PeopleDirectory } from "@/components/people/PeopleDirectory";

export default async function PeoplePage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const employees = await prisma.employee.findMany({
    where: { companyId: company.id },
    include: { team: { select: { name: true } }, manager: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });
  const teams = await prisma.team.findMany({ where: { companyId: company.id }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const data = employees.map((e) => ({
    id: e.id, name: e.name, title: e.title, teamId: e.teamId, team: e.team?.name ?? null,
    manager: e.manager?.name ?? null, managerId: e.managerId, location: e.location, status: e.status,
    role: e.role, image: e.photo, workEmail: e.workEmail, employmentType: e.employmentType
  }));
  return <PeopleDirectory people={data} teams={teams} canManage={can(me.role).isManager} slug={params.slug} />;
}
