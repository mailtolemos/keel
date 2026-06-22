import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { FeedbackView } from "@/components/feedback/FeedbackView";

export default async function FeedbackPage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const perms = can(me.role);
  const all = await prisma.feedback.findMany({
    where: { companyId: company.id },
    include: { author: { select: { id: true, name: true, photo: true } }, subject: { select: { id: true, name: true, managerId: true } } },
    orderBy: { createdAt: "desc" }
  });
  // Visibility filtering
  const visible = all.filter((f) => {
    if (perms.isAdmin) return true;
    if (f.authorId === me.id || f.subjectId === me.id) return true;
    if (f.visibility === "PUBLIC") return true;
    if (f.visibility === "MANAGER_ONLY" && f.subject.managerId === me.id) return true;
    return false;
  });
  const people = await prisma.employee.findMany({ where: { companyId: company.id, status: { in: ["ACTIVE", "OFFBOARDING"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const items = visible.map((f) => ({
    id: f.id, body: f.body, tags: f.tags, visibility: f.visibility, isRequest: f.isRequest, createdAt: f.createdAt.toISOString(),
    authorId: f.authorId, authorName: f.author.name, authorImage: f.author.photo, subjectId: f.subjectId, subjectName: f.subject.name
  }));
  return <FeedbackView items={items} people={people} meId={me.id} slug={params.slug} />;
}
