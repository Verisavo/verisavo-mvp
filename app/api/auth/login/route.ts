import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { getProfile, publicUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { cleanEmail, isRateLimited, json, notFound, readJson } from "@/lib/server/http";

// POST { email, password } -> 200 { ok, user } and sets the session cookies
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  const body = await readJson(request);
  const email = cleanEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return json({ error: "invalid_credentials", message: "Enter your email and password." }, 400);

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") return json({ error: "email_not_confirmed", message: "Please confirm your email first. Check your inbox for the link we sent." }, 403);
    if (isRateLimited(error)) return json({ error: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." }, 429);
    return json({ error: "invalid_credentials", message: "Wrong email or password." }, 401);
  }

  const profile = await getProfile(data.user.id);
  if (!profile || profile.disabledAt) {
    await supabase.auth.signOut({ scope: "local" });   // this device only, not every device the user is signed in on
    return json({ error: "account_disabled", message: "This account is disabled. Please contact Verisavo." }, 403);
  }
  await audit("auth.sign_in", { actorId: data.user.id });
  return json({ ok: true, user: publicUser({ id: data.user.id, email: data.user.email ?? email }, profile) });
}
