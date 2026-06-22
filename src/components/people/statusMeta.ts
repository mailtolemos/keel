import type { BadgeTone } from "@/components/ui";
export const STATUS_META: Record<string, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Active", tone: "good" },
  INVITED: { label: "Invited", tone: "accent" },
  OFFBOARDING: { label: "Offboarding", tone: "warn" },
  INACTIVE: { label: "Inactive", tone: "neutral" }
};
export const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", MANAGER: "Manager", EMPLOYEE: "Employee" };
