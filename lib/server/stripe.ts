import "server-only";
import Stripe from "stripe";

// The only place the Stripe client is created (see the verisavo-stripe-billing skill). It uses the API version pinned
// by the installed stripe package (23.x: 2026-09-30.endive); set the webhook endpoint in the Stripe dashboard to match.
let client: Stripe | null = null;

export const stripeConfigured = (): boolean => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_MONTHLY);

// Some calls run while a database lock is held (lib/server/billing.ts), so a slow Stripe gives up after 10 s with one
// retry, rather than the SDK's default of 80 s with two
export function stripe(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { timeout: 10_000, maxNetworkRetries: 1 });
  return client;
}

export type { Stripe };
