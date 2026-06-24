"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail, emailLayout } from "@/lib/email";
import { APP_URL } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export async function registerUser(input: { name: string; email: string; password: string }) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Please check your details." };
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false as const, error: "An account with that email already exists." };
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({ data: { email, name: parsed.data.name.trim(), passwordHash } });
  return { ok: true as const };
}

// ---------- Password reset ----------

export async function requestPasswordReset(email: string) {
  const e = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: e } });
  // Don't reveal whether the email exists.
  if (user && user.passwordHash) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }
    });
    const url = `${APP_URL}/reset?token=${token}`;
    const sent = await sendEmail({
      to: e, subject: "Reset your Keel password",
      html: emailLayout("Reset your password", "We received a request to reset your Keel password. This link expires in one hour. If you didn't request it, you can ignore this email.", { label: "Reset password", url })
    });
    return { ok: true as const, devLink: sent.ok ? undefined : url };
  }
  return { ok: true as const, devLink: undefined as string | undefined };
}

export async function resetPassword(token: string, password: string) {
  if (!token || password.length < 8) return { ok: false as const, error: "Password must be at least 8 characters." };
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) return { ok: false as const, error: "This reset link is invalid or has expired." };
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: hash } });
  await prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  return { ok: true as const };
}
