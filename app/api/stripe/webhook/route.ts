import { stripe, stripeConfigured } from "@/lib/server/stripe";
import { processEvent } from "@/lib/server/billing";

// POST from Stripe (M3.3). Not behind the session proxy (see proxy.ts). The signature is checked over the raw body;
// anything unsigned or wrongly signed is refused before it is read.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) return new Response("Billing is not configured", { status: 503 });
  const body = await request.text();
  let event;
  try {
    event = await stripe().webhooks.constructEventAsync(body, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    await processEvent(event);
    return new Response("ok");
  } catch (err) {
    console.error("[stripe] webhook failed:", event.type, event.id, err instanceof Error ? err.name : "error");
    return new Response("Handler failed", { status: 500 });   // Stripe retries
  }
}
