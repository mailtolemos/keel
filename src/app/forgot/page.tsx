"use client";
import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Input, Label, Button } from "@/components/ui";
import { requestPasswordReset } from "@/app/actions/auth";
import { useT } from "@/i18n/I18nProvider";

export default function ForgotPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const res = await requestPasswordReset(email);
    setDevLink(res.devLink); setSent(true); setLoading(false);
  }

  return (
    <AuthShell title={t("auth.forgotTitle")} subtitle={t("auth.forgotSub")}>
      {sent ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-surface-2 p-4">
            <p className="text-sm font-medium text-ink">{t("auth.resetSent")}</p>
            <p className="text-[13px] text-ink-soft mt-1">{t("auth.resetSentMsg")}</p>
            {devLink && (
              <div className="mt-3 text-[12px]">
                <p className="text-warn">{t("auth.devLinkNote")}</p>
                <Link href={devLink} className="text-accent break-all hover:underline">{devLink}</Link>
              </div>
            )}
          </div>
          <Link href="/login" className="text-[13px] text-ink-muted hover:text-ink">{t("auth.backToSignIn")}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><Label>{t("auth.workEmail")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t("auth.sending") : t("auth.sendReset")}</Button>
          <Link href="/login" className="block text-[13px] text-ink-muted hover:text-ink">{t("auth.backToSignIn")}</Link>
        </form>
      )}
    </AuthShell>
  );
}
