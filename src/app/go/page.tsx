import { redirect } from "next/navigation";
import { resolveHome } from "@/app/actions/nav";

export const dynamic = "force-dynamic";

export default async function Go() {
  const dest = await resolveHome();
  redirect(dest);
}
