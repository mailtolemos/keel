"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/AuthShell";
import { Input, Label, Button } from "@/components/ui";
import { acceptInvitation } from "@/app/actions/invitations";
import { useT } from "@/i18n/I18nProvider";

export function JoinInvalid() {
  const t = useT();
  return (
    <AuthShell title={t("join.invalidTitle")} subtitle={t("join.invalidMsg")}>
      <Link href="/login" className="text-[13px] text-ink-muted hover:text-ink">{t("auth.backToSignIn")}</Link>
    </AuthShell>
  );
}

export function JoinForm({ token, email, name: initialName, companyName, slug }: { token: string; email: string; name: string; companyName: string; slug: string }) {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await acceptInvitation(token, name, password);
    if (!res.ok) { setError(res.error || ""); setLoading(false); return; }
    const signin = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signin?.error) { router.push("/login"); return; }
    router.push(`/${res.slug}`);
    router.refresh();
  }

  return (
    <AuthShell title={t("join.title", { company: companyName })} subtitle={t("join.sub")}>
      <form onSubmit={submit} className="space-y-4">
        <div><Label>{t("auth.workEmail")}</Label><Input value={email} disabled /></div>
        <div><Label>{t("join.yourName")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><Label>{t("auth.password")}</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordPh")} minLength={8} required /></div>
        {error && <p className="text-[13px] text-bad">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? t("join.accepting") : t("join.accept")}</Button>
      </form>
    </AuthShell>
  );
}
