"use client";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { CreateCycleForm } from "./CreateCycleForm";

export function NewCycleButton({ people, slug }: { people: { id: string; name: string; title: string | null }[]; slug: string }) {
  return (
    <Dialog wide title="New review cycle" description="Set up participants, questions, and what's included." trigger={<><Icon.plus size={16} /> New cycle</>}>
      {(close) => <CreateCycleForm people={people} slug={slug} close={close} />}
    </Dialog>
  );
}
