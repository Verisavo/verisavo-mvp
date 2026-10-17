import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound, tooMany } from "@/lib/server/http";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { stripeConfigured } from "@/lib/server/stripe";
import { createPortal, sessionConfirmed } from "@/lib/server/billing";

// POST (JSON) -> { url } of Stripe's billing portal: invoices, card, cancel ("billing management and invoice
// generation" in the proposal)
export async function POST(request: Request) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user || !(await sessionConfirmed(user.id))) return json({ error: "signed_out" }, 401);
  if (!stripeConfigured()) return json({ error: "billing_off", message: "Payments aren’t switched on yet. Please try again soon." }, 503);
  if (!user.profile.stripeCustomerId) return json({ error: "no_customer", message: "There’s no billing account yet. Subscribe first." }, 404);
  if (!(await allow(LIMITS.billing(user.id)))) return tooMany();
  try {
    return json({ url: await createPortal(user.profile.stripeCustomerId) });
  } catch (err) {
    console.error("[billing/portal] failed:", err instanceof Error ? err.name : "error");
    return json({ error: "billing_failed", message: "We couldn’t open the billing portal. Please try again in a moment." }, 502);
  }
}
