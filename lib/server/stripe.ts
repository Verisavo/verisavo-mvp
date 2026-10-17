import "server-only";
import Stripe from "stripe";

// The only place the Stripe client is created (see the verisavo-stripe-billing skill). It uses the API version pinned
// by the installed stripe package (23.x: 2026-09-30.endive); set the webhook endpoint in the Stripe dashboard to match.
let client: Stripe | null = null;

export const stripeConfigured = (): boolean => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_MONTHLY);

export function stripe(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return client;
}

export type { Stripe };
