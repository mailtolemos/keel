import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./db";

export async function getSession() {
  return getServerSession(authOptions);
}

const empInclude = { company: true, team: true, manager: true } as const;

// Resolve the signed-in user's employee within a specific company workspace.
// Platform admins (operators) are lazily provisioned as ADMIN in any company they open.
export async function requireCompanyAccess(slug?: string) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const sl = (slug ?? cookies().get("keel_slug")?.value ?? "").toLowerCase();
  if (!sl) redirect("/login");

  const company = await prisma.company.findUnique({ where: { slug: sl } });
  if (!company) notFound();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  let me = await prisma.employee.findFirst({
    where: { companyId: company.id, userId: user.id },
    include: empInclude
  });

  if (!me) {
    if (user.isPlatformAdmin) {
      const created = await prisma.employee.create({
        data: {
          companyId: company.id, userId: user.id, name: user.name, workEmail: user.email,
          title: "Operator", role: "ADMIN", status: "ACTIVE", startDate: new Date()
        }
      });
      me = await prisma.employee.findUnique({ where: { id: created.id }, include: empInclude });
    } else {
      redirect("/login");
    }
  }
  return { user, me: me!, company };
}

// Cookie-based variant used by server actions (no explicit slug available).
export async function requireEmployee() {
  return requireCompanyAccess();
}

export async function requirePlatformAdmin() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (!user.isPlatformAdmin) redirect("/login");
  return user;
}

export function can(role: string | null | undefined) {
  return {
    isAdmin: role === "ADMIN",
    isManager: role === "ADMIN" || role === "MANAGER",
    isEmployee: true
  };
}
