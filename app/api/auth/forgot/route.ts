import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { allow, clientIp, LIMITS } from "@/lib/server/rate-limit";
import { cleanEmail, forbidden, fromOurSite, isRateLimited, json, notFound, readJson, tooMany } from "@/lib/server/http";

// POST { email } -> 200 whether or not the email has an account, so the form never reveals who is registered.
// The email links to /auth/confirm?type=recovery, which signs the user in and opens /reset-password.
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const email = cleanEmail((await readJson(request))?.email);
  if (!email) return json({ error: "invalid_email", message: "Enter a valid email address." }, 400);
  if (!(await allow(LIMITS.email(await clientIp(), email)))) return tooMany();

  const supabase = await createSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  // Supabase only throttles addresses that have an account: never pass that difference on
  if (isRateLimited(error)) console.warn("[auth/forgot] Supabase rate limit:", error?.code);
  else if (error) console.error("[auth/forgot]", error.code, error.message);
  return json({ ok: true });
}
