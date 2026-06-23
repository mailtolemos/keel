"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Input, Label, Button } from "@/components/ui";
import { useT } from "@/i18n/I18nProvider";
import { registerUser } from "@/app/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useT();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await registerUser({ name, email, password });
    if (!res.ok) { setError(res.error || "Something went wrong."); setLoading(false); return; }
    const signin = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signin?.error) { setError("Account created, but sign-in failed. Try logging in."); return; }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <AuthShell title={t("auth.createTitle")} subtitle={t("auth.createSubtitle")}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>{t("auth.yourName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" required />
        </div>
        <div>
          <Label>{t("auth.workEmail")}</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
        </div>
        <div>
          <Label>{t("auth.password")}</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordPh")} minLength={8} autoComplete="new-password" required />
        </div>
        {error && <p className="text-[13px] text-bad">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? t("auth.creating") : t("auth.createBtn")}</Button>
      </form>
      <p className="mt-6 text-[13px] text-ink-muted">
        {t("auth.haveAccount")} <Link href="/login" className="font-medium text-ink hover:underline">{t("auth.signIn")}</Link>
      </p>
    </AuthShell>
  );
}
