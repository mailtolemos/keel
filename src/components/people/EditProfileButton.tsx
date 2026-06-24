"use client";
import { Dialog } from "@/components/Dialog";
import { ProfileEditor } from "./ProfileEditor";
import { useT } from "@/i18n/I18nProvider";

export function EditProfileButton({ id, name, initial, teams, managers }: {
  id: string; name: string;
  initial: { title: string; location: string; employmentType: string; teamId: string; managerId: string; status: string; role: string; adminNotes: string };
  teams: { id: string; name: string }[]; managers: { id: string; name: string }[];
}) {
  const t = useT();
  return (
    <Dialog wide title={`Edit ${name.split(" ")[0]}'s profile`} trigger={t("pf.editProfile")} triggerVariant="secondary" triggerSize="sm">
      {(close) => <ProfileEditor id={id} teams={teams} managers={managers} close={close} initial={initial} />}
    </Dialog>
  );
}
