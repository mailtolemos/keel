import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { TeamsView } from "@/components/teams/TeamsView";

export default async function TeamsPage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const teams = await prisma.team.findMany({
    where: { companyId: company.id },
    include: { lead: { select: { name: true } }, members: { select: { id: true, name: true, title: true, photo: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" }
  });
  const allPeople = await prisma.employee.findMany({ where: { companyId: company.id }, select: { id: true, name: true, teamId: true }, orderBy: { name: "asc" } });
  const data = teams.map((t) => ({ id: t.id, name: t.name, description: t.description, leadId: t.leadId, lead: t.lead?.name ?? null, members: t.members.map((m) => ({ id: m.id, name: m.name, title: m.title, image: m.photo })) }));
  return <TeamsView teams={data} allPeople={allPeople} canManage={can(me.role).isManager} slug={params.slug} />;
}
