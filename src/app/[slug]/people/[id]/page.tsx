import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, Avatar, Badge, Progress, LinkButton } from "@/components/ui";
import { EditProfileButton } from "@/components/people/EditProfileButton";
import { STATUS_META, ROLE_LABEL } from "@/components/people/statusMeta";
import { Icon } from "@/components/icons";
import { fmtDate, relativeTime } from "@/lib/format";
import { getT } from "@/i18n/server";
import { GOAL_STATUS_LABEL, LEAVE_TYPE_LABEL } from "@/lib/enums";

const goalTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "ON_TRACK" || s === "DONE" ? "good" : s === "AT_RISK" ? "warn" : s === "OFF_TRACK" ? "bad" : "neutral");

export default async function ProfilePage({ params }: { params: { slug: string; id: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const t = getT();
  const slug = company.slug;
  const perms = can(me.role);
  const e = await prisma.employee.findFirst({
    where: { id: params.id, companyId: company.id },
    include: {
      team: true, manager: true, reports: { select: { id: true, name: true, title: true, photo: true } },
      goalsOwned: { orderBy: { createdAt: "desc" } },
      leaveRequests: { orderBy: { startDate: "desc" }, take: 5 },
      feedbackGotten: { where: perms.isManager ? {} : { visibility: "PUBLIC" }, include: { author: { select: { name: true, photo: true } } }, orderBy: { createdAt: "desc" }, take: 5 }
    }
  });
  if (!e) notFound();
  const teams = await prisma.team.findMany({ where: { companyId: company.id }, select: { id: true, name: true } });
  const managers = await prisma.employee.findMany({ where: { companyId: company.id, role: { in: ["ADMIN", "MANAGER"] } }, select: { id: true, name: true } });
  const isSelf = e.id === me.id;
  const canEdit = perms.isManager || isSelf;

  return (
    <div>
      <Link href={`/${slug}/people`} className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink mb-4"><Icon.chevron size={14} className="rotate-90" /> People</Link>

      <Card className="p-6 mb-5">
        <div className="flex items-start gap-4">
          <Avatar name={e.name} src={e.photo} size={64} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight text-ink">{e.name}</h1>
              <Badge tone={STATUS_META[e.status].tone}>{t("st." + e.status)}</Badge>
              <Badge tone="navy">{t("role." + e.role.toLowerCase())}</Badge>
            </div>
            <p className="text-[14px] text-ink-muted mt-0.5">{e.title ?? "—"}{e.team ? ` · ${e.team.name}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] text-ink-muted">
              <span><span className="text-ink-faint">{t("pf.email")}</span> {e.workEmail}</span>
              <span><span className="text-ink-faint">{t("pf.location")}</span> {e.location ?? "—"}</span>
              <span><span className="text-ink-faint">{t("pf.type")}</span> {e.employmentType}</span>
              <span><span className="text-ink-faint">{t("pf.started")}</span> {fmtDate(e.startDate)}</span>
              <span><span className="text-ink-faint">{t("pf.manager")}</span> {e.manager?.name ?? "—"}</span>
              {e.birthday && <span><span className="text-ink-faint">{t("pf.birthday")}</span> {fmtDate(e.birthday, { month: "long", day: "numeric" })}</span>}
            </div>
          </div>
          {canEdit && (
            <EditProfileButton id={e.id} name={e.name} teams={teams} managers={managers}
              initial={{ title: e.title ?? "", location: e.location ?? "", employmentType: e.employmentType, teamId: e.teamId ?? "", managerId: e.managerId ?? "", status: e.status, role: e.role, adminNotes: e.adminNotes ?? "" }} />
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("pf.goals")}</h2>
            {e.goalsOwned.length === 0 ? <p className="text-[13px] text-ink-soft">{t("pf.noGoals")}</p> : (
              <div className="space-y-3.5">
                {e.goalsOwned.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1"><span className="text-[13.5px] font-medium text-ink">{g.title}</span><Badge tone={goalTone(g.status)}>{t("gs." + g.status)}</Badge></div>
                    <Progress value={g.progress} tone={goalTone(g.status)} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("pf.recentFeedback")}</h2>
            {e.feedbackGotten.length === 0 ? <p className="text-[13px] text-ink-soft">{t("pf.noFeedback")}</p> : (
              <div className="space-y-3.5">
                {e.feedbackGotten.map((f) => (
                  <div key={f.id} className="flex gap-2.5">
                    <Avatar name={f.author.name} src={f.author.photo} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px]"><span className="font-medium text-ink">{f.author.name}</span> <span className="text-ink-faint">· {relativeTime(f.createdAt)}</span>{f.visibility !== "PUBLIC" && <Badge className="ml-1" tone="neutral">{t("vis." + f.visibility)}</Badge>}</p>
                      <p className="text-[13px] text-ink-muted mt-0.5">{f.body}</p>
                      {f.tags && <div className="mt-1 flex gap-1 flex-wrap">{f.tags.split(",").map((t) => <Badge key={t} tone="accent">{t}</Badge>)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {perms.isManager && e.adminNotes && (
            <Card className="p-5 border-amber-200 bg-amber-50/40">
              <h2 className="text-sm font-semibold text-ink mb-1.5 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warn" /> {t("pf.adminNotes")} <span className="text-[11px] font-normal text-ink-soft">· {t("pf.adminNotesVis")}</span></h2>
              <p className="text-[13px] text-ink-muted whitespace-pre-wrap">{e.adminNotes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("pf.directReports")}</h2>
            {e.reports.length === 0 ? <p className="text-[13px] text-ink-soft">{t("pf.noReports")}</p> : (
              <div className="space-y-2.5">
                {e.reports.map((r) => (
                  <Link key={r.id} href={`/${slug}/people/${r.id}`} className="flex items-center gap-2.5 hover:bg-surface-2 -mx-1.5 px-1.5 py-1 rounded-lg">
                    <Avatar name={r.name} src={r.photo} size={28} /><div><p className="text-[13px] font-medium text-ink">{r.name}</p><p className="text-[12px] text-ink-soft">{r.title ?? "—"}</p></div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("pf.recentLeave")}</h2>
            {e.leaveRequests.length === 0 ? <p className="text-[13px] text-ink-soft">{t("pf.noLeave")}</p> : (
              <div className="space-y-2.5">
                {e.leaveRequests.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-muted">{t("lt." + l.type)}</span>
                    <Badge tone={l.status === "APPROVED" ? "good" : l.status === "PENDING" ? "warn" : l.status === "REJECTED" ? "bad" : "neutral"}>{t("ls." + l.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
