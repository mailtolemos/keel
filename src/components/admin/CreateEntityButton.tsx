"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/Dialog";
import { Input, Label, Button, Select } from "@/components/ui";
import { Icon } from "@/components/icons";
import { createEntity } from "@/app/actions/admin";
import { APP_DOMAIN } from "@/lib/constants";
import { useT } from "@/i18n/I18nProvider";

const COUNTRIES = ["United States", "United Kingdom", "Portugal", "Germany", "France", "Spain", "Ireland", "Netherlands", "Canada", "Brazil", "Singapore", "Australia"];
const slugPreview = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function CreateEntityButton() {
  const t = useT();
  return (
    <Dialog title={t("admin.newEntity")} description={t("ad.createDesc")} trigger={<><Icon.plus size={16} /> {t("admin.newEntity")}</>}>
      {(close) => <Form close={close} />}
    </Dialog>
  );
}

function Form({ close }: { close: () => void }) {
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const effectiveSlug = slugPreview(slug || name) || "workspace";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await createEntity({ name, country, slug });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Could not create entity."); return; }
    close(); router.push(`/admin`); router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>{t("ad.company")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Douro Labs" autoFocus required /></div>
      <div>
        <Label>{t("ad.wsAddress")}</Label>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-2 px-3 h-9 text-sm">
          <span className="text-ink-soft">{APP_DOMAIN}/</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugPreview(name) || "dourolabs"} className="flex-1 bg-transparent focus:outline-none text-ink font-medium" />
        </div>
        <p className="mt-1 text-[12px] text-ink-soft">{t("ad.willBeAt")} <span className="font-medium text-ink">{APP_DOMAIN}/{effectiveSlug}</span></p>
      </div>
      <div><Label>{t("set.country")}</Label><Select value={country} onChange={(e) => setCountry(e.target.value)}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</Select></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>{t("common.cancel")}</Button><Button type="submit" disabled={loading}>{loading ? t("common.creating") : t("common.create")}</Button></div>
    </form>
  );
}
