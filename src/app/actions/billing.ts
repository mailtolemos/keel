"use server";
import { prisma } from "@/lib/db";
import { requireCompanyAccess, can } from "@/lib/session";
import { getStripe, stripeEnabled, STRIPE_PRICE_ID } from "@/lib/stripe";
import { APP_URL } from "@/lib/constants";

export async function createCheckoutSession(slug: string) {
  const { me, company } = await requireCompanyAccess(slug);
  if (!can(me.role).isAdmin) return { ok: false as const, error: "Only admins can manage billing." };
  if (!stripeEnabled || !STRIPE_PRICE_ID) return { ok: false as const, error: "Billing isn't configured yet." };
  const stripe = getStripe();

  let customerId = company.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: me.workEmail, name: company.name, metadata: { companyId: company.id } });
    customerId = customer.id;
    await prisma.company.update({ where: { id: company.id }, data: { stripeCustomerId: customerId } });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/${company.slug}/settings?billing=success`,
    cancel_url: `${APP_URL}/${company.slug}/settings?billing=cancel`,
    allow_promotion_codes: true,
    metadata: { companyId: company.id },
    subscription_data: { metadata: { companyId: company.id } }
  });
  return { ok: true as const, url: session.url };
}

export async function createPortalSession(slug: string) {
  const { me, company } = await requireCompanyAccess(slug);
  if (!can(me.role).isAdmin) return { ok: false as const, error: "Only admins can manage billing." };
  if (!stripeEnabled) return { ok: false as const, error: "Billing isn't configured yet." };
  if (!company.stripeCustomerId) return { ok: false as const, error: "No billing account yet." };
  const session = await getStripe().billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${APP_URL}/${company.slug}/settings`
  });
  return { ok: true as const, url: session.url };
}
