import Link from "next/link";
import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, Stat, Badge, Avatar, Progress, LinkButton, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fmtDay, relativeTime } from "@/lib/format";
import { GOAL_STATUS_LABEL, LEAVE_TYPE_LABEL } from "@/lib/enums";

const goalTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "ON_TRACK" || s === "DONE" ? "good" : s === "AT_RISK" ? "warn" : s === "OFF_TRACK" ? "bad" : "neutral");

export default async function Dashboard({ params }: { params: { slug: string } }) {
  const { me, company } = await requireCompanyAccess(params.slug);
  const slug = company.slug;
  const cid = company.id;
  const perms = can(me.role);

  const [people, pendingLeave, holidays, cycles, feedback, goals, oneOnOnes, teams] = await Promise.all([
    prisma.employee.findMany({ where: { companyId: cid }, select: { id: true, status: true, teamId: true } }),
    prisma.leaveRequest.findMany({
      where: { status: "PENDING", employee: { companyId: cid } },
      include: { employee: { select: { name: true, photo: true } } }, orderBy: { createdAt: "desc" }
    }),
    prisma.holiday.findMany({ where: { companyId: cid, date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 4 }),
    prisma.reviewCycle.findMany({ where: { companyId: cid, status: { in: ["ACTIVE", "DRAFT"] } }, include: { participants: true, responses: true } }),
    prisma.feedback.findMany({
      where: { companyId: cid, visibility: "PUBLIC", isRequest: false },
      include: { author: { select: { name: true, photo: true } }, subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" }, take: 5
    }),
    prisma.goal.findMany({ where: { companyId: cid }, include: { owner: { select: { name: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.oneOnOne.findMany({
      where: { OR: [{ managerId: me.id }, { reportId: me.id }], nextAt: { gte: new Date() } },
      include: { manager: { select: { name: true, photo: true } }, report: { select: { name: true, photo: true } } },
      orderBy: { nextAt: "asc" }, take: 4
    }),
    prisma.team.findMany({ where: { companyId: cid }, include: { _count: { select: { members: true } } } })
  ]);

  const active = people.filter((p) => p.status === "ACTIVE").length;
  const activeCycle = cycles.find((c) => c.status === "ACTIVE");
  const totalResp = activeCycle ? activeCycle.responses.length : 0;
  const submittedResp = activeCycle ? activeCycle.responses.filter((r) => r.status === "SUBMITTED").length : 0;
  const expected = activeCycle ? activeCycle.participants.length * 2 : 0; // self + manager
  const completion = expected ? Math.round((submittedResp / expected) * 100) : 0;
  const companyGoals = goals.filter((g) => g.level === "COMPANY" || g.level === "TEAM").slice(0, 4);
  const avgProgress = goals.length ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-6">
        <p className="text-[13px] text-graphite-500">{greeting}, {me.name.split(" ")[0]}</p>
        <h1 className="text-[22px] font-semibold tracking-tight text-navy">{company.name} dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="People" value={active} sub={`${people.length} total · ${people.filter((p) => p.status === "INVITED").length} invited`} />
        <Stat label="Pending leave" value={pendingLeave.length} sub={pendingLeave.length ? "Awaiting approval" : "All caught up"} />
        <Stat label="Review completion" value={`${completion}%`} sub={activeCycle ? activeCycle.name : "No active cycle"} />
        <Stat label="Avg goal progress" value={`${avgProgress}%`} sub={`${goals.length} goals tracked`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Goal progress */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-navy">Goal progress</h2>
              <Link href={`/${slug}/goals`} className="text-[13px] text-accent font-medium hover:underline">View all</Link>
            </div>
            {companyGoals.length === 0 ? <EmptyState title="No goals yet" hint="Create your first company goal." /> : (
              <div className="space-y-4">
                {companyGoals.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge tone={g.level === "COMPANY" ? "navy" : "neutral"}>{g.level === "COMPANY" ? "Company" : "Team"}</Badge>
                        <span className="text-[13.5px] font-medium text-navy truncate">{g.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone={goalTone(g.status)}>{GOAL_STATUS_LABEL[g.status]}</Badge>
                        <span className="text-[12px] text-graphite-500 w-9 text-right">{g.progress}%</span>
                      </div>
                    </div>
                    <Progress value={g.progress} tone={goalTone(g.status)} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending leave */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-navy">Pending leave requests</h2>
              <Link href={`/${slug}/leave`} className="text-[13px] text-accent font-medium hover:underline">Manage</Link>
            </div>
            {pendingLeave.length === 0 ? <EmptyState title="No pending requests" hint="Time-off requests will show up here." /> : (
              <div className="divide-y divide-graphite-100 -my-1">
                {pendingLeave.slice(0, 5).map((l) => (
                  <div key={l.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={l.employee.name} src={l.employee.photo} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-navy truncate">{l.employee.name}</p>
                      <p className="text-[12px] text-graphite-500">{LEAVE_TYPE_LABEL[l.type]} · {fmtDay(l.startDate)}–{fmtDay(l.endDate)} · {l.days}d</p>
                    </div>
                    {perms.isManager
                      ? <LinkButton href={`/${slug}/leave`} size="sm" variant="secondary">Review</LinkButton>
                      : <Badge tone="warn">Pending</Badge>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming holidays */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-navy mb-3">Upcoming holidays</h2>
            <div className="space-y-2.5">
              {holidays.length === 0 ? <p className="text-[13px] text-graphite-500">No upcoming holidays.</p> :
                holidays.map((h) => (
                  <div key={h.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-navy-50 grid place-items-center text-navy text-[11px] font-semibold leading-none">
                      <div className="text-center">
                        <div>{fmtDay(h.date).split(" ")[0].toUpperCase()}</div>
                        <div className="text-[13px]">{new Date(h.date).getDate()}</div>
                      </div>
                    </div>
                    <div><p className="text-[13.5px] font-medium text-navy">{h.name}</p><p className="text-[12px] text-graphite-500">{h.calendar}</p></div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Upcoming 1:1s */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-navy">Your upcoming 1:1s</h2>
              <Link href={`/${slug}/one-on-ones`} className="text-[13px] text-accent font-medium hover:underline">Open</Link>
            </div>
            {oneOnOnes.length === 0 ? <p className="text-[13px] text-graphite-500">No 1:1s scheduled.</p> : (
              <div className="space-y-3">
                {oneOnOnes.map((o) => {
                  const other = o.managerId === me.id ? o.report : o.manager;
                  return (
                    <div key={o.id} className="flex items-center gap-3">
                      <Avatar name={other.name} src={other.photo} size={30} />
                      <div className="flex-1"><p className="text-[13.5px] font-medium text-navy">{other.name}</p><p className="text-[12px] text-graphite-500">{o.cadence} · next {fmtDay(o.nextAt)}</p></div>
                      <Icon.arrowRight size={15} className="text-graphite-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent feedback */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-navy">Recent feedback</h2>
              <Link href={`/${slug}/feedback`} className="text-[13px] text-accent font-medium hover:underline">All</Link>
            </div>
            {feedback.length === 0 ? <p className="text-[13px] text-graphite-500">No public feedback yet.</p> : (
              <div className="space-y-3.5">
                {feedback.map((f) => (
                  <div key={f.id} className="flex gap-2.5">
                    <Avatar name={f.author.name} src={f.author.photo} size={28} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] text-graphite-700"><span className="font-medium text-navy">{f.author.name.split(" ")[0]}</span> → <span className="font-medium text-navy">{f.subject.name.split(" ")[0]}</span></p>
                      <p className="text-[12.5px] text-graphite-500 line-clamp-2">{f.body}</p>
                      <p className="text-[11px] text-graphite-400 mt-0.5">{relativeTime(f.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Team health */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-navy mb-3">Team snapshot</h2>
            <div className="space-y-2">
              {teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-graphite-700">{t.name}</span>
                  <span className="text-graphite-500">{t._count.members} {t._count.members === 1 ? "person" : "people"}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
