"use client";
import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { createCheckoutSession, createPortalSession } from "@/app/actions/billing";
import { useT } from "@/i18n/I18nProvider";

export function BillingPanel({ slug, status, trialDaysLeft, plan, stripeReady, canManage }: {
  slug: string; status: string; trialDaysLeft: number | null; plan: string; stripeReady: boolean; canManage: boolean;
}) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const active = status === "active";

  async function go(fn: typeof createCheckoutSession) {
    setLoading(true); setError("");
    const r = await fn(slug);
    if (r.ok && r.url) { window.location.href = r.url; return; }
    setLoading(false); setError(r.ok ? "" : (r as { error?: string }).error || "Something went wrong.");
  }

  const statusLabel = active ? t("bill.statusActive")
    : status === "trialing" ? (trialDaysLeft != null ? t("bill.statusTrialDays", { n: trialDaysLeft }) : t("bill.statusTrial"))
    : status === "past_due" ? t("bill.statusPastDue")
    : status === "canceled" ? t("bill.statusCanceled") : status;
  const tone = active ? "good" : status === "trialing" ? "accent" : "bad";

  return (
    <Card className="p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-ink mb-1">{t("bill.title")}</h2>
      <p className="text-[13px] text-ink-soft mb-4">{t("bill.desc")}</p>
      <div className="flex items-center gap-2 rounded-lg border border-line p-3.5">
        <Badge tone={tone as "good" | "accent" | "bad"}>{statusLabel}</Badge>
        <span className="text-[13px] text-ink-muted">{t("bill.plan")}: {active ? "Pro" : plan}</span>
      </div>
      {!stripeReady && <p className="mt-3 text-[13px] text-warn">{t("bill.notConfigured")}</p>}
      {error && <p className="mt-3 text-[13px] text-bad">{error}</p>}
      {canManage ? (
        <div className="mt-5">
          {active
            ? <Button onClick={() => go(createPortalSession)} disabled={loading || !stripeReady}>{loading ? "…" : t("bill.manage")}</Button>
            : <Button onClick={() => go(createCheckoutSession)} disabled={loading || !stripeReady}>{loading ? "…" : t("bill.subscribe")}</Button>}
        </div>
      ) : <p className="mt-4 text-[13px] text-ink-soft">{t("bill.adminOnly")}</p>}
    </Card>
  );
}
