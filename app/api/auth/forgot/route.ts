import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { cleanEmail, isRateLimited, json, notFound, readJson } from "@/lib/server/http";

// POST { email } -> 200 whether or not the email has an account, so the form never reveals who is registered.
// The email links to /auth/confirm?type=recovery, which signs the user in and opens /reset-password.
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  const email = cleanEmail((await readJson(request))?.email);
  if (!email) return json({ error: "invalid_email", message: "Enter a valid email address." }, 400);

  const supabase = await createSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (isRateLimited(error)) return json({ error: "rate_limited", message: "Too many requests. Please wait a few minutes and try again." }, 429);
  if (error) console.error("[auth/forgot]", error.code, error.message);
  return json({ ok: true });
}
