import { getInvitation } from "@/app/actions/invitations";
import { JoinForm } from "./JoinForm";
import { JoinInvalid } from "./JoinForm";
export const dynamic = "force-dynamic";

export default async function JoinPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || "";
  const inv = token ? await getInvitation(token) : null;
  if (!inv) return <JoinInvalid />;
  return <JoinForm token={token} email={inv.email} name={inv.name} companyName={inv.companyName} slug={inv.companySlug} />;
}
