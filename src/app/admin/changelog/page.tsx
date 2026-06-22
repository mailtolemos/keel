import { requirePlatformAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ChangelogManager } from "@/components/admin/ChangelogManager";

export default async function AdminChangelog() {
  await requirePlatformAdmin();
  const entries = await prisma.changelog.findMany({ orderBy: { date: "desc" } });
  return <ChangelogManager entries={entries.map((e) => ({ id: e.id, title: e.title, category: e.category, summary: e.summary, changes: e.changes, date: e.date.toISOString(), published: e.published }))} />;
}
