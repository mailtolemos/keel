"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

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
