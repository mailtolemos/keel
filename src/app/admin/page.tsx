import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/session";
import { getT } from "@/i18n/server";
import { prisma } from "@/lib/db";
import { Card, Badge, Stat, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CreateEntityButton } from "@/components/admin/CreateEntityButton";
import { APP_DOMAIN } from "@/lib/constants";
import { fmtDate } from "@/lib/format";

const statusTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" => (s === "active" ? "good" : s === "suspended" ? "bad" : "warn");

export default async function AdminHome() {
  await requirePlatformAdmin();
  const t = getT();
  const companies = await prisma.company.findMany({
    include: { _count: { select: { employees: true, teams: true } } },
    orderBy: { createdAt: "desc" }
  });
  const totalPeople = companies.reduce((a, c) => a + c._count.employees, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">{t("admin.entities")}</h1>
          <p className="text-[13px] text-ink-soft mt-0.5">{t("admin.entitiesSub")}</p>
        </div>
        <CreateEntityButton />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Stat label={t("ad.companies")} value={companies.length} />
        <Stat label={t("ad.activeStat")} value={companies.filter((c) => c.status === "active").length} />
        <Stat label={t("ad.peopleAll")} value={totalPeople} />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[12px] text-ink-soft border-b border-line">
              <th className="font-medium py-2.5 px-4">{t("ad.company")}</th>
              <th className="font-medium py-2.5 px-3 hidden sm:table-cell">{t("ad.address")}</th>
              <th className="font-medium py-2.5 px-3">{t("ad.peopleCol")}</th>
              <th className="font-medium py-2.5 px-3">{t("ad.statusCol")}</th>
              <th className="font-medium py-2.5 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-line-2 last:border-0 hover:bg-surface-2/60">
                <td className="py-2.5 px-4">
                  <Link href={`/admin/${c.id}`} className="font-medium text-ink hover:text-accent">{c.name}</Link>
                  <p className="text-[12px] text-ink-soft">{c.country} · created {fmtDate(c.createdAt)}</p>
                </td>
                <td className="py-2.5 px-3 hidden sm:table-cell text-ink-muted">{APP_DOMAIN}/<span className="font-medium text-ink">{c.slug}</span></td>
                <td className="py-2.5 px-3 text-ink-muted">{c._count.employees}</td>
                <td className="py-2.5 px-3"><Badge tone={statusTone(c.status)}>{c.status[0].toUpperCase() + c.status.slice(1)}</Badge></td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/${c.id}`} className="text-[13px] text-ink-muted hover:text-ink">{t("ad.manageBtn")}</Link>
                    <Link href={`/${c.slug}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">{t("common.open")} <Icon.arrowRight size={13} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies.length === 0 && <p className="text-center text-[13px] text-ink-soft py-10">{t("ad.noEntities")}</p>}
      </Card>
    </div>
  );
}
