"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Input, Label, Button } from "@/components/ui";
import { resetPassword } from "@/app/actions/auth";
import { useT } from "@/i18n/I18nProvider";

export function ResetForm({ token }: { token: string }) {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await resetPassword(token, password);
    setLoading(false);
    if (!res.ok) { setError(res.error || t("auth.resetInvalid")); return; }
    setDone(true);
  }

  return (
    <AuthShell title={t("auth.resetTitle")} subtitle={t("auth.resetSub")}>
      {done ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-surface-2 p-4">
            <p className="text-sm font-medium text-ink">{t("auth.passwordUpdated")}</p>
            <p className="text-[13px] text-ink-soft mt-1">{t("auth.passwordUpdatedMsg")}</p>
          </div>
          <Button className="w-full" onClick={() => router.push("/login")}>{t("auth.goToSignIn")}</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><Label>{t("auth.newPassword")}</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordPh")} minLength={8} required /></div>
          {error && <p className="text-[13px] text-bad">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !token}>{loading ? t("auth.updating") : t("auth.updatePassword")}</Button>
          <Link href="/login" className="block text-[13px] text-ink-muted hover:text-ink">{t("auth.backToSignIn")}</Link>
        </form>
      )}
    </AuthShell>
  );
}
