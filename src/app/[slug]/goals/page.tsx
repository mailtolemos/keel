import { requireCompanyAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GoalsView } from "@/components/goals/GoalsView";

export default async function GoalsPage({ params }: { params: { slug: string } }) {
  const { company } = await requireCompanyAccess(params.slug);
  const goals = await prisma.goal.findMany({
    where: { companyId: company.id },
    include: { owner: { select: { name: true, photo: true } }, team: { select: { name: true } }, updates: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
    orderBy: [{ level: "asc" }, { createdAt: "desc" }]
  });
  const people = await prisma.employee.findMany({ where: { companyId: company.id, status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const teams = await prisma.team.findMany({ where: { companyId: company.id }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const data = goals.map((g) => ({
    id: g.id, title: g.title, description: g.description, level: g.level, status: g.status, progress: g.progress,
    dueDate: g.dueDate ? g.dueDate.toISOString() : null, owner: g.owner?.name ?? null, ownerImage: g.owner?.photo ?? null, team: g.team?.name ?? null,
    updates: g.updates.map((u) => ({ id: u.id, body: u.body, createdAt: u.createdAt.toISOString(), author: u.author.name, progress: u.progress }))
  }));
  return <GoalsView goals={data} people={people} teams={teams} />;
}
