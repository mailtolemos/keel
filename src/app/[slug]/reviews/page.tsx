import Link from "next/link";
import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, Progress, LinkButton } from "@/components/ui";
import { NewCycleButton } from "@/components/reviews/NewCycleButton";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";

const cycleTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "ACTIVE" ? "good" : s === "RELEASED" ? "accent" : s === "DRAFT" ? "warn" : "neutral");

export default async function ReviewsPage({ params }: { params: { slug: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const slug = company.slug;
  const perms = can(me.role);
  const cycles = await prisma.reviewCycle.findMany({
    where: { companyId: company.id },
    include: { participants: true, responses: true },
    orderBy: { createdAt: "desc" }
  });
  const myOpen = await prisma.reviewResponse.findMany({
    where: { authorId: me.id, status: { not: "SUBMITTED" }, cycle: { status: "ACTIVE" } },
    include: { cycle: { select: { id: true, name: true, dueDate: true } }, subject: { select: { name: true } } }
  });
  const people = await prisma.employee.findMany({ where: { companyId: company.id, status: "ACTIVE" }, select: { id: true, name: true, title: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Run performance cycles across your company."
        action={perms.isAdmin && <NewCycleButton people={people} slug={slug} />} />

      {myOpen.length > 0 && (
        <Card className="p-5 mb-5 border-accent-100 bg-accent-50/40">
          <h2 className="text-sm font-semibold text-navy mb-3">Your open reviews</h2>
          <div className="space-y-2.5">
            {myOpen.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg bg-white border border-graphite-200 px-3 py-2.5">
                <div className="h-8 w-8 rounded-lg bg-navy-50 grid place-items-center"><Icon.reviews size={16} className="text-navy" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-navy">{r.kind === "SELF" ? "Self review" : `Review of ${r.subject.name}`}</p>
                  <p className="text-[12px] text-graphite-500">{r.cycle.name}{r.cycle.dueDate ? ` · due ${fmtDate(r.cycle.dueDate)}` : ""}</p>
                </div>
                <LinkButton href={`/${slug}/reviews/${r.cycle.id}`} size="sm" variant="primary">{r.status === "IN_PROGRESS" ? "Continue" : "Start"}</LinkButton>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {cycles.length === 0 && <Card className="p-10 text-center text-[13px] text-graphite-500 md:col-span-2">No review cycles yet.{perms.isAdmin ? " Create your first one." : ""}</Card>}
        {cycles.map((c) => {
          const expected = c.participants.length * ((c.selfReview ? 1 : 0) + (c.managerReview ? 1 : 0)) || 1;
          const submitted = c.responses.filter((r) => r.status === "SUBMITTED").length;
          const pct = Math.round((submitted / expected) * 100);
          return (
            <Link key={c.id} href={`/${slug}/reviews/${c.id}`}>
              <Card className="p-5 hover:border-accent-100 hover:shadow-card transition h-full">
                <div className="flex items-center justify-between">
                  <Badge tone={cycleTone(c.status)}>{c.status[0] + c.status.slice(1).toLowerCase()}</Badge>
                  <span className="text-[12px] text-graphite-400">{c.participants.length} participants</span>
                </div>
                <h3 className="font-semibold text-navy mt-2.5">{c.name}</h3>
                <p className="text-[12px] text-graphite-500 mt-0.5">{fmtDate(c.periodStart)} – {fmtDate(c.periodEnd)}{c.dueDate ? ` · due ${fmtDate(c.dueDate)}` : ""}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-[12px] mb-1"><span className="text-graphite-500">Completion</span><span className="font-medium text-navy">{pct}%</span></div>
                  <Progress value={pct} tone="accent" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
