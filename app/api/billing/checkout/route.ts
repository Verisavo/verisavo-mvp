import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound, tooMany } from "@/lib/server/http";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { getEntitlements } from "@/lib/server/entitlements";
import { stripeConfigured } from "@/lib/server/stripe";
import { createCheckout, createPortal } from "@/lib/server/billing";

// POST (JSON) -> { url } of a Stripe Checkout page for Verisavo Monthly (M3.2). A user who already pays gets the
// billing portal instead, so nobody can end up with two subscriptions. The success page is not proof of payment:
// the plan only changes when the webhook confirms it.
export async function POST(request: Request) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  if (!stripeConfigured()) return json({ error: "billing_off", message: "Payments aren’t switched on yet. Please try again soon." }, 503);
  if (!(await allow(LIMITS.billing(user.id)))) return tooMany();
  try {
    const ent = await getEntitlements(user.id);
    if (ent.plan === "paid" && user.profile.stripeCustomerId) return json({ url: await createPortal(user.profile.stripeCustomerId) });
    return json({ url: await createCheckout({ id: user.id, email: user.email, name: user.profile.name }) });
  } catch (err) {
    console.error("[billing/checkout] failed:", err instanceof Error ? err.name : "error");
    return json({ error: "billing_failed", message: "We couldn’t open the payment page. Please try again in a moment." }, 502);
  }
}
