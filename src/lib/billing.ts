export type CompanyBilling = { subscriptionStatus: string; trialEndsAt: Date | null };

// A workspace is usable while actively subscribed or within an unexpired trial.
export function workspaceActive(c: CompanyBilling): boolean {
  if (c.subscriptionStatus === "active") return true;
  if (c.subscriptionStatus === "trialing") return !c.trialEndsAt || c.trialEndsAt.getTime() > Date.now();
  return false;
}

export function trialDaysLeft(c: CompanyBilling): number | null {
  if (c.subscriptionStatus !== "trialing" || !c.trialEndsAt) return null;
  return Math.max(0, Math.ceil((c.trialEndsAt.getTime() - Date.now()) / 86400000));
}
