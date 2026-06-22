"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Input, Label, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Incorrect email or password."); return; }
    router.push("/go");
  }

  function demo() {
    setEmail("alex@lumen.co"); setPassword("password");
  }

  return (
    <AuthShell title="Sign in to Keel" subtitle="Welcome back. Pick up where your team left off.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Work email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
        </div>
        {error && <p className="text-[13px] text-bad">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>

      <button onClick={() => signIn("google", { callbackUrl: "/go" })} className="mt-3 h-9 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-graphite-200 bg-white text-sm font-medium hover:bg-graphite-50 transition">
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.07H2.18a11 11 0 000 9.87l3.66-2.84z"/><path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 002.18 7.07l3.66 2.84C6.71 7.31 9.14 4.75 12 4.75z"/></svg>
        Continue with Google
      </button>
      <p className="mt-2 text-[11px] text-graphite-400">Google sign-in activates once GOOGLE_CLIENT_ID is set in your environment.</p>

      <div className="mt-6 rounded-lg border border-dashed border-graphite-200 bg-graphite-50 p-3">
        <p className="text-[12px] text-graphite-600">Exploring the demo? Use the seeded Lumen workspace.</p>
        <button onClick={demo} className="mt-1.5 text-[13px] font-medium text-accent hover:underline">Fill demo admin (alex@lumen.co)</button>
      </div>

      <p className="mt-6 text-[13px] text-graphite-600">
        New to Keel? <Link href="/signup" className="font-medium text-navy hover:underline">Create a workspace</Link>
      </p>
    </AuthShell>
  );
}
