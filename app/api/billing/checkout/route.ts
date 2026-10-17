import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound, tooMany } from "@/lib/server/http";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { stripeConfigured } from "@/lib/server/stripe";
import { createCheckout, sessionConfirmed } from "@/lib/server/billing";

// POST (JSON) -> { url } of a Stripe Checkout page for Verisavo Monthly (M3.2), or of the billing portal for someone
// who already has a subscription in Stripe (createCheckout asks Stripe, so nobody can end up paying twice).
// 409 while a first payment is still being confirmed. The success page is not proof of payment: the plan only
// changes when the webhook confirms it.
export async function POST(request: Request) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user || !(await sessionConfirmed(user.id))) return json({ error: "signed_out" }, 401);
  if (!stripeConfigured()) return json({ error: "billing_off", message: "Payments aren’t switched on yet. Please try again soon." }, 503);
  if (!(await allow(LIMITS.billing(user.id)))) return tooMany();
  try {
    const result = await createCheckout({ id: user.id, email: user.email, name: user.profile.name });
    if ("pending" in result) return json({ error: "payment_pending", message: "Your payment is still being confirmed. Please wait a minute and refresh the page." }, 409);
    return json({ url: result.url });
  } catch (err) {
    console.error("[billing/checkout] failed:", err instanceof Error ? err.name : "error");
    return json({ error: "billing_failed", message: "We couldn’t open the payment page. Please try again in a moment." }, 502);
  }
}
