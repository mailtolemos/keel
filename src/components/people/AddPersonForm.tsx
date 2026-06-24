"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Button } from "@/components/ui";
import { invitePerson } from "@/app/actions/people";
import { useT } from "@/i18n/I18nProvider";

export function AddPersonForm({ teams, close }: { teams: { id: string; name: string }[]; close: () => void }) {
  const t = useT();
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", title: "", role: "EMPLOYEE", teamId: teams[0]?.id ?? "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await invitePerson(f);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Could not add."); return; }
    if (res.inviteLink) { setInviteLink(res.inviteLink); router.refresh(); return; }
    close(); router.refresh();
  }

  if (inviteLink) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <p className="text-sm font-medium text-ink">{t("people.inviteSent")}</p>
          <p className="text-[13px] text-ink-soft mt-1">{t("people.inviteLinkNote")}</p>
          <div className="mt-2 flex items-center gap-2">
            <input readOnly value={inviteLink} className="flex-1 h-9 rounded-lg border border-line bg-surface px-3 text-[12px] text-ink" onFocus={(e) => e.target.select()} />
            <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(inviteLink)}>{t("people.copyLink")}</Button>
          </div>
        </div>
        <div className="flex justify-end"><Button onClick={() => { close(); router.refresh(); }}>{t("common.done")}</Button></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>{t("people.fullName")}</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Jamie Fox" required /></div>
        <div><Label>{t("auth.workEmail")}</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="jamie@company.com" required /></div>
      </div>
      <div><Label>{t("people.title")}</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Product Designer" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>{t("people.role")}</Label><Select value={f.role} onChange={(e) => set("role", e.target.value)}><option value="EMPLOYEE">{t("role.employee")}</option><option value="MANAGER">{t("role.manager")}</option><option value="ADMIN">{t("role.admin")}</option></Select></div>
        <div><Label>{t("people.team")}</Label><Select value={f.teamId} onChange={(e) => set("teamId", e.target.value)}><option value="">{t("people.noTeam")}</option>{teams.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}</option>)}</Select></div>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={close}>{t("common.cancel")}</Button>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? t("people.adding") : t("people.sendInvite")}</Button>
      </div>
    </form>
  );
}
