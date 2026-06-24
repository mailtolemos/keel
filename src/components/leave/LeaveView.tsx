"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, Stat, Avatar, Badge, Button, Input, Label, Select, Textarea, Progress } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { requestLeave, decideLeave, cancelLeave } from "@/app/actions/leave";
import { LEAVE_TYPE_LABEL } from "@/lib/enums";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const statusTone = (s: string): "good" | "warn" | "bad" | "neutral" | "accent" | "navy" | "neutral" => (s === "APPROVED" ? "good" : s === "PENDING" ? "warn" : s === "REJECTED" ? "bad" : "neutral");

type Req = { id: string; type: string; startDate: string; endDate: string; days: number; reason: string | null; status: string; employeeName: string; employeeImage: string | null; mine: boolean };

export function LeaveView({ balance, allowance, myRequests, pending, holidays, upcoming, canApprove }: {
  balance: number; allowance: number;
  myRequests: Req[]; pending: Req[];
  holidays: { id: string; name: string; date: string; calendar: string }[];
  upcoming: { id: string; name: string; image: string | null; type: string; startDate: string; endDate: string }[];
  canApprove: boolean;
}) {
  const used = allowance - balance;
  const t = useT();
  return (
    <div>
      <PageHeader title={t("leave.title")} subtitle={t("leave.subtitle")}
        action={<Dialog title="Request time off" trigger={<><Icon.plus size={16} /> {t("leave.request")}</>}>{(close) => <RequestForm close={close} />}</Dialog>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label={t("lv.balance")} value={`${balance}d`} sub={t("lv.ofYear", { n: allowance })} />
        <Stat label={t("lv.used")} value={`${used}d`} />
        <Stat label={t("lv.pending")} value={myRequests.filter((r) => r.status === "PENDING").length} sub={t("lv.yourReqs")} />
        <Stat label={t("lv.outMonth")} value={upcoming.length} sub={t("lv.acrossCompany")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {canApprove && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink mb-3">{t("lv.pendingApprovals")}</h2>
              {pending.length === 0 ? <p className="text-[13px] text-ink-soft">{t("lv.nothingAwaiting")}</p> : (
                <div className="divide-y divide-line-2 -my-1">
                  {pending.map((r) => <ApprovalRow key={r.id} r={r} />)}
                </div>
              )}
            </Card>
          )}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("lv.yourRequests")}</h2>
            {myRequests.length === 0 ? <p className="text-[13px] text-ink-soft">{t("lv.noRequests")}</p> : (
              <div className="divide-y divide-line-2 -my-1">
                {myRequests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-accent-soft grid place-items-center"><Icon.leave size={16} className="text-ink" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-ink">{t("lt." + r.type)} · {r.days}d</p>
                      <p className="text-[12px] text-ink-soft">{fmt(r.startDate)}–{fmt(r.endDate)}{r.reason ? ` · ${r.reason}` : ""}</p>
                    </div>
                    <Badge tone={statusTone(r.status)}>{t("ls." + r.status)}</Badge>
                    {r.status === "PENDING" && <CancelBtn id={r.id} />}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("lv.companyHolidays")}</h2>
            <div className="space-y-2.5">
              {holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-muted">{h.name}</span>
                  <span className="text-ink-soft">{fmt(h.date)}</span>
                </div>
              ))}
              {holidays.length === 0 && <p className="text-[13px] text-ink-soft">{t("lv.noHolidays")}</p>}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">{t("lv.whosAway")}</h2>
            <div className="space-y-3">
              {upcoming.length === 0 ? <p className="text-[13px] text-ink-soft">{t("lv.nobodyOut")}</p> :
                upcoming.map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <Avatar name={u.name} src={u.image} size={28} />
                    <div className="flex-1"><p className="text-[13px] font-medium text-ink">{u.name}</p><p className="text-[12px] text-ink-soft">{t("lt." + u.type)} · {fmt(u.startDate)}–{fmt(u.endDate)}</p></div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RequestForm({ close }: { close: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ type: "VACATION", startDate: "", endDate: "", reason: "" });
  const t = useT();
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await requestLeave(f); setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    close(); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>{t("lv.type")}</Label><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{Object.keys(LEAVE_TYPE_LABEL).map((k) => <option key={k} value={k}>{t("lt." + k)}</option>)}</Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>{t("lv.startDate")}</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} required /></div>
        <div><Label>{t("lv.endDate")}</Label><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} required /></div>
      </div>
      <div><Label>{t("lv.reasonOpt")}</Label><Textarea value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder={t("lv.reasonPh")} /></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>{t("common.cancel")}</Button><Button type="submit" disabled={loading}>{loading ? t("lv.submitting") : t("lv.submit")}</Button></div>
    </form>
  );
}

function ApprovalRow({ r }: { r: Req }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function decide(approve: boolean) { setBusy(true); await decideLeave(r.id, approve); setBusy(false); router.refresh(); }
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar name={r.employeeName} src={r.employeeImage} size={32} />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-ink">{r.employeeName}</p>
        <p className="text-[12px] text-ink-soft">{t("lt." + r.type)} · {fmt(r.startDate)}–{fmt(r.endDate)} · {r.days}d{r.reason ? ` · ${r.reason}` : ""}</p>
      </div>
      <Button size="sm" variant="secondary" onClick={() => decide(false)} disabled={busy}>{t("lv.decline")}</Button>
      <Button size="sm" variant="primary" onClick={() => decide(true)} disabled={busy}>{t("lv.approve")}</Button>
    </div>
  );
}

function CancelBtn({ id }: { id: string }) {
  const t = useT();
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <button onClick={async () => { setBusy(true); await cancelLeave(id); setBusy(false); router.refresh(); }} disabled={busy} className="text-[12px] text-ink-faint hover:text-bad">{t("common.cancel")}</button>;
}
