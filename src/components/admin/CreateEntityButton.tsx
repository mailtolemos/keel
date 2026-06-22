"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/Dialog";
import { Input, Label, Button, Select } from "@/components/ui";
import { Icon } from "@/components/icons";
import { createEntity } from "@/app/actions/admin";
import { APP_DOMAIN } from "@/lib/constants";

const COUNTRIES = ["United States", "United Kingdom", "Portugal", "Germany", "France", "Spain", "Ireland", "Netherlands", "Canada", "Brazil", "Singapore", "Australia"];
const slugPreview = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function CreateEntityButton() {
  return (
    <Dialog title="Create a new entity" description="Spin up a fresh company workspace at its own address." trigger={<><Icon.plus size={16} /> New entity</>}>
      {(close) => <Form close={close} />}
    </Dialog>
  );
}

function Form({ close }: { close: () => void }) {
  const router = useRouter();
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
      <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Douro Labs" autoFocus required /></div>
      <div>
        <Label>Workspace address</Label>
        <div className="flex items-center gap-1 rounded-lg border border-graphite-200 bg-graphite-50 px-3 h-9 text-sm">
          <span className="text-graphite-500">{APP_DOMAIN}/</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugPreview(name) || "dourolabs"} className="flex-1 bg-transparent focus:outline-none text-navy font-medium" />
        </div>
        <p className="mt-1 text-[12px] text-graphite-500">Will be created at <span className="font-medium text-navy">{APP_DOMAIN}/{effectiveSlug}</span></p>
      </div>
      <div><Label>Country</Label><Select value={country} onChange={(e) => setCountry(e.target.value)}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</Select></div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create entity"}</Button></div>
    </form>
  );
}
