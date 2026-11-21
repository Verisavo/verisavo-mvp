import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { json, notFound } from "@/lib/server/http";
import { getEntitlements, usageView } from "@/lib/server/entitlements";

// GET -> { usage: { plan, used, limit, remaining, resetsAt, pastDue, cancelAtPeriodEnd } } for the signed-in user.
// The website's Assistant (public/site, a static page) reads the plan here; the React pages get it from the server.
// Read only: counting happens in /api/assistant and the WhatsApp webhook.
export async function GET() {
  if (!released(3)) return notFound();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  return json({ usage: usageView(await getEntitlements(user.id)) });
}
