"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Input, Label, Button } from "@/components/ui";
import { registerUser } from "@/app/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <AuthShell title="Create your workspace" subtitle="Give your company a stronger backbone. Takes about two minutes.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" required />
        </div>
        <div>
          <Label>Work email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} autoComplete="new-password" required />
        </div>
        {error && <p className="text-[13px] text-bad">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create workspace"}</Button>
      </form>
      <p className="mt-6 text-[13px] text-graphite-600">
        Already have an account? <Link href="/login" className="font-medium text-navy hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
