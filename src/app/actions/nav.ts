"use server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// Where to send a user right after they sign in.
export async function resolveHome(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) return "/login";
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { employees: { include: { company: true } } }
  });
  if (!user) return "/login";
  if (user.isPlatformAdmin) return "/admin";
  const emp = user.employees[0];
  if (!emp) return "/onboarding";
  return `/${emp.company.slug}`;
}
