import Stripe from "stripe";

export const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}
