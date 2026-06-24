import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function updateByCustomer(customerId: string, data: Record<string, unknown>) {
  const company = await prisma.company.findFirst({ where: { stripeCustomerId: customerId } });
  if (company) await prisma.company.update({ where: { id: company.id }, data });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret || !process.env.STRIPE_SECRET_KEY) return new Response("not configured", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
      const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
      const companyId = s.metadata?.companyId;
      const data: Record<string, unknown> = { subscriptionStatus: "active", plan: "pro", stripeSubscriptionId: subId ?? null };
      if (customerId) data.stripeCustomerId = customerId;
      if (companyId) await prisma.company.update({ where: { id: companyId }, data });
      else if (customerId) await updateByCustomer(customerId, data);
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;
      await updateByCustomer(customerId, {
        subscriptionStatus: status, plan: "pro",
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id ?? null,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null
      });
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await updateByCustomer(customerId, { subscriptionStatus: "canceled" });
    }
  } catch (e) {
    console.error("[stripe webhook] handler error", e);
    return new Response("handler error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}
