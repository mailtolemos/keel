"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { setCycleStatus } from "@/app/actions/reviews";

export function CycleActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go(s: "ACTIVE" | "CLOSED" | "RELEASED") { setBusy(true); await setCycleStatus(id, s); setBusy(false); router.refresh(); }
  return (
    <div className="flex gap-2">
      {status === "ACTIVE" && <Button size="sm" variant="secondary" onClick={() => go("CLOSED")} disabled={busy}>Close cycle</Button>}
      {status !== "RELEASED" && <Button size="sm" variant="primary" onClick={() => go("RELEASED")} disabled={busy}>Release results</Button>}
      {status === "RELEASED" && <Button size="sm" variant="secondary" onClick={() => go("ACTIVE")} disabled={busy}>Reopen</Button>}
    </div>
  );
}
