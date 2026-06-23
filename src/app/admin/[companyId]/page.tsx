import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, Badge, Stat, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { EntityManageForm } from "@/components/admin/EntityManageForm";
import { APP_DOMAIN } from "@/lib/constants";
import { fmtDate } from "@/lib/format";

export default async function ManageEntity({ params }: { params: { companyId: string } }) {
  await requirePlatformAdmin();
  const company = await prisma.company.findUnique({
    where: { id: params.companyId },
    include: { _count: { select: { employees: true, teams: true } }, teams: { include: { _count: { select: { members: true } } }, orderBy: { name: "asc" } } }
  });
  if (!company) notFound();
  const active = await prisma.employee.count({ where: { companyId: company.id, status: "ACTIVE" } });

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink mb-4"><Icon.chevron size={14} className="rotate-90" /> Entities</Link>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">{company.name}</h1>
          <p className="text-[13px] text-ink-soft mt-0.5">{APP_DOMAIN}/{company.slug} · created {fmtDate(company.createdAt)}</p>
        </div>
        <LinkButton href={`/${company.slug}`} variant="primary">Open workspace</LinkButton>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Stat label="People" value={company._count.employees} />
        <Stat label="Active" value={active} />
        <Stat label="Teams" value={company._count.teams} />
        <Stat label="Status" value={<Badge tone={company.status === "active" ? "good" : company.status === "suspended" ? "bad" : "warn"}>{company.status[0].toUpperCase() + company.status.slice(1)}</Badge>} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <EntityManageForm id={company.id} initial={{ name: company.name, slug: company.slug, status: company.status, country: company.country }} />
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink mb-3">Teams</h2>
          {company.teams.length === 0 ? <p className="text-[13px] text-ink-soft">No teams yet.</p> : (
            <div className="space-y-2">
              {company.teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-muted">{t.name}</span>
                  <span className="text-ink-soft">{t._count.members} {t._count.members === 1 ? "person" : "people"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
