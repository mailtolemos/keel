import { requireCompanyAccess } from "@/lib/session";
import { workspaceActive } from "@/lib/billing";
import { Paywall } from "@/components/Paywall";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default async function AppLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  const { me, company, user } = await requireCompanyAccess(params.slug);
  if (!workspaceActive(company) && !user.isPlatformAdmin) {
    return <Paywall slug={company.slug} companyName={company.name} canManage={me.role === "ADMIN"} />;
  }
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar company={company.name} slug={params.slug} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar name={me.name} email={me.workEmail} role={me.role} image={user.image} slug={params.slug} isPlatformAdmin={Boolean(user.isPlatformAdmin)} />
        <main className="flex-1 p-5 sm:p-7 max-w-[1240px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
