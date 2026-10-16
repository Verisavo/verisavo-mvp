import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { cleanEmail, isRateLimited, json, notFound, readJson } from "@/lib/server/http";

// POST { email } -> 200. Sends the sign-up confirmation email again. Same answer for every email.
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  const email = cleanEmail((await readJson(request))?.email);
  if (!email) return json({ error: "invalid_email", message: "Enter a valid email address." }, 400);

  const supabase = await createSupabase();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (isRateLimited(error)) return json({ error: "rate_limited", message: "Please wait a minute before asking for another email." }, 429);
  if (error) console.error("[auth/resend]", error.code, error.message);
  return json({ ok: true });
}
