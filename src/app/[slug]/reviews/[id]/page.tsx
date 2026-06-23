import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyAccess, can } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, Badge, Avatar, Progress } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import { ReviewLauncher } from "@/components/reviews/ReviewLauncher";
import { CycleActions } from "@/components/reviews/CycleActions";

const cycleTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "ACTIVE" ? "good" : s === "RELEASED" ? "accent" : s === "DRAFT" ? "warn" : "neutral");
function parseAnswers(s: string | null) { try { return s ? JSON.parse(s) : []; } catch { return []; } }
const respTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "SUBMITTED" ? "good" : s === "IN_PROGRESS" ? "warn" : "neutral");

export default async function CyclePage({ params }: { params: { slug: string; id: string } }) {
  const { company, me } = await requireCompanyAccess(params.slug);
  const slug = company.slug;
  const perms = can(me.role);
  const cycle = await prisma.reviewCycle.findFirst({
    where: { id: params.id, companyId: company.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      participants: { include: { employee: { select: { id: true, name: true, photo: true, title: true } } } },
      responses: { include: { author: { select: { name: true } }, subject: { select: { id: true, name: true, photo: true } } } }
    }
  });
  if (!cycle) notFound();

  const myTasks = cycle.responses.filter((r) => r.authorId === me.id);
  const qForLauncher = cycle.questions.map((q) => ({ id: q.id, prompt: q.prompt, hasRating: q.hasRating }));

  // Build per-participant progress
  const rows = cycle.participants.map((p) => {
    const self = cycle.responses.find((r) => r.kind === "SELF" && r.subjectId === p.employeeId);
    const mgr = cycle.responses.find((r) => r.kind === "MANAGER" && r.subjectId === p.employeeId);
    return { p, self, mgr };
  });

  // Released reviews about me (visible to subject)
  const myReleased = cycle.status === "RELEASED"
    ? cycle.responses.filter((r) => r.subjectId === me.id && r.kind === "MANAGER" && r.status === "SUBMITTED")
    : [];

  return (
    <div>
      <Link href={`/${slug}/reviews`} className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink mb-4"><Icon.chevron size={14} className="rotate-90" /> Reviews</Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-semibold tracking-tight text-ink">{cycle.name}</h1><Badge tone={cycleTone(cycle.status)}>{cycle.status[0] + cycle.status.slice(1).toLowerCase()}</Badge></div>
          <p className="text-[13px] text-ink-soft mt-0.5">{fmtDate(cycle.periodStart)} – {fmtDate(cycle.periodEnd)}{cycle.dueDate ? ` · due ${fmtDate(cycle.dueDate)}` : ""} · {cycle.participants.length} participants</p>
          <div className="mt-2 flex gap-1.5">
            {cycle.selfReview && <Badge>Self</Badge>}{cycle.managerReview && <Badge>Manager</Badge>}
            {cycle.peerReview && <Badge>Peer</Badge>}{cycle.upwardReview && <Badge>Upward</Badge>}{cycle.ratingScale && <Badge tone="accent">Ratings</Badge>}
          </div>
        </div>
        {perms.isAdmin && <CycleActions id={cycle.id} status={cycle.status} />}
      </div>

      {/* My tasks */}
      {myTasks.length > 0 && (
        <Card className="p-5 mb-5 border-accent-100">
          <h2 className="text-sm font-semibold text-ink mb-3">Your reviews to complete</h2>
          <div className="space-y-2.5">
            {myTasks.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                <Avatar name={r.subject.name} src={r.subject.photo} size={32} />
                <div className="flex-1"><p className="text-[13.5px] font-medium text-ink">{r.kind === "SELF" ? "Self review" : `Review of ${r.subject.name}`}</p><p className="text-[12px] text-ink-soft">{r.kind === "SELF" ? "Reflect on your period" : "Manager review"}</p></div>
                <Badge tone={respTone(r.status)}>{r.status === "NOT_STARTED" ? "Not started" : r.status === "IN_PROGRESS" ? "In progress" : "Submitted"}</Badge>
                <ReviewLauncher responseId={r.id} kind={r.kind} subjectName={r.subject.name} questions={qForLauncher} ratingScale={cycle.ratingScale} status={r.status}
                  initial={{ answers: parseAnswers(r.answers), summary: r.summary ?? "", growth: r.growth ?? "", overallRating: r.overallRating }} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Released results for me */}
      {myReleased.length > 0 && (
        <Card className="p-5 mb-5">
          <h2 className="text-sm font-semibold text-ink mb-3">Your released review</h2>
          {myReleased.map((r) => (
            <div key={r.id} className="space-y-3">
              {r.overallRating && <div className="flex items-center gap-2"><span className="text-[13px] text-ink-soft">Overall rating</span><Badge tone="accent">{r.overallRating} / 5</Badge></div>}
              {r.summary && <div><p className="text-[12px] font-medium text-ink-soft uppercase tracking-wide">Summary</p><p className="text-[13.5px] text-ink-muted mt-1">{r.summary}</p></div>}
              {r.growth && <div><p className="text-[12px] font-medium text-ink-soft uppercase tracking-wide">Growth recommendations</p><p className="text-[13.5px] text-ink-muted mt-1">{r.growth}</p></div>}
              <div className="space-y-2.5">
                {parseAnswers(r.answers).map((a: any, i: number) => {
                  const q = cycle.questions.find((x) => x.id === a.questionId);
                  return <div key={i}><p className="text-[12.5px] font-medium text-ink">{q?.prompt}</p><p className="text-[13px] text-ink-muted mt-0.5">{a.text || "—"}{a.rating ? ` · ${a.rating}/5` : ""}</p></div>;
                })}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Participants progress (managers/admins) */}
      {perms.isManager && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-line"><h2 className="text-sm font-semibold text-ink">Participant progress</h2></div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[12px] text-ink-soft border-b border-line">
              <th className="font-medium py-2.5 px-4">Person</th><th className="font-medium py-2.5 px-3">Self review</th><th className="font-medium py-2.5 px-3">Manager review</th>
            </tr></thead>
            <tbody>
              {rows.map(({ p, self, mgr }) => (
                <tr key={p.id} className="border-b border-line-2 last:border-0">
                  <td className="py-2.5 px-4"><Link href={`/${slug}/people/${p.employee.id}`} className="flex items-center gap-2.5 hover:text-accent"><Avatar name={p.employee.name} src={p.employee.photo} size={28} /><span className="font-medium text-ink">{p.employee.name}</span></Link></td>
                  <td className="py-2.5 px-3">{cycle.selfReview ? <Badge tone={respTone(self?.status ?? "NOT_STARTED")}>{(self?.status ?? "NOT_STARTED") === "SUBMITTED" ? "Submitted" : (self?.status ?? "NOT_STARTED") === "IN_PROGRESS" ? "In progress" : "Not started"}</Badge> : <span className="text-ink-faint text-[12px]">—</span>}</td>
                  <td className="py-2.5 px-3">{cycle.managerReview ? <Badge tone={respTone(mgr?.status ?? "NOT_STARTED")}>{(mgr?.status ?? "NOT_STARTED") === "SUBMITTED" ? "Submitted" : (mgr?.status ?? "NOT_STARTED") === "IN_PROGRESS" ? "In progress" : "Not started"}</Badge> : <span className="text-ink-faint text-[12px]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
