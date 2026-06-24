"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Mark } from "@/components/Brand";
import { Button } from "@/components/ui";
import { createCheckoutSession } from "@/app/actions/billing";
import { useT } from "@/i18n/I18nProvider";

export function Paywall({ slug, companyName, canManage }: { slug: string; companyName: string; canManage: boolean }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function subscribe() {
    setLoading(true); setError("");
    const r = await createCheckoutSession(slug);
    if (r.ok && r.url) { window.location.href = r.url; return; }
    setLoading(false); setError((r as { error?: string }).error || "Billing isn't available yet.");
  }
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface shadow-card p-8 text-center">
        <Mark size={34} />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">{t("pay.title")}</h1>
        <p className="mt-2 text-[14px] text-ink-muted">{t("pay.trialEnded", { company: companyName })}</p>
        {canManage ? (
          <>
            <p className="mt-3 text-[13px] text-ink-soft">{t("pay.subscribeMsg")}</p>
            {error && <p className="mt-3 text-[13px] text-bad">{error}</p>}
            <Button className="mt-5 w-full" onClick={subscribe} disabled={loading}>{loading ? "…" : t("pay.subscribe")}</Button>
          </>
        ) : (
          <p className="mt-3 text-[13px] text-ink-soft">{t("pay.adminMsg")}</p>
        )}
        <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-5 text-[13px] text-ink-soft hover:text-ink">{t("topbar.signOut")}</button>
      </div>
    </div>
  );
}
