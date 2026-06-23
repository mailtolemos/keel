"use client";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/icons";
import { CreateCycleForm } from "./CreateCycleForm";
import { useT } from "@/i18n/I18nProvider";

export function NewCycleButton({ people, slug }: { people: { id: string; name: string; title: string | null }[]; slug: string }) {
  const t = useT();
  return (
    <Dialog wide title="New review cycle" description="Set up participants, questions, and what's included." trigger={<><Icon.plus size={16} /> {t("reviews.newCycle")}</>}>
      {(close) => <CreateCycleForm people={people} slug={slug} close={close} />}
    </Dialog>
  );
}
