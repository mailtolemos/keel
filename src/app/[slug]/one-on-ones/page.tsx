import { requireCompanyAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { OneOnOnesView } from "@/components/oneonones/OneOnOnesView";

function parseActions(s: string | null) { try { return s ? JSON.parse(s) : []; } catch { return []; } }

export default async function OneOnOnesPage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const list = await prisma.oneOnOne.findMany({
    where: { OR: [{ managerId: me.id }, { reportId: me.id }] },
    include: {
      manager: { select: { id: true, name: true, photo: true } }, report: { select: { id: true, name: true, photo: true } },
      notes: { orderBy: { meetingDate: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  const items = list.map((o) => {
    const amManager = o.managerId === me.id;
    const other = amManager ? o.report : o.manager;
    return {
      id: o.id, otherId: other.id, otherName: other.name, otherImage: other.photo, role: (amManager ? "manager" : "report") as "manager" | "report",
      cadence: o.cadence, nextAt: o.nextAt ? o.nextAt.toISOString() : null,
      notes: o.notes.map((n) => ({
        id: n.id, meetingDate: n.meetingDate.toISOString(), agenda: n.agenda, sharedNotes: n.sharedNotes,
        privateNotes: n.privateFor === me.id ? n.privateNotes : null, canSeePrivate: n.privateFor === me.id,
        actionItems: parseActions(n.actionItems)
      }))
    };
  });
  const people = await prisma.employee.findMany({ where: { companyId: company.id, status: "ACTIVE", id: { not: me.id } }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <OneOnOnesView items={items} people={people} />;
}
