import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { audit } from "@/lib/server/audit";
import { cleanEmail, cleanText, isRateLimited, json, notFound, passwordProblem, readJson } from "@/lib/server/http";

// POST { email, password, name, organisation? } -> 200 { ok, verify: true } once the confirmation email is on its way.
// An email that already has an account gets the same answer, so the form never reveals who is registered.
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  const body = await readJson(request);
  const email = cleanEmail(body?.email);
  const name = cleanText(body?.name, 120);
  const organisation = cleanText(body?.organisation, 160);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) return json({ error: "invalid_name", message: "Enter your name." }, 400);
  if (!email) return json({ error: "invalid_email", message: "Enter a valid email address." }, 400);
  const weak = passwordProblem(password);
  if (weak) return json({ error: "weak_password", message: weak }, 400);

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, organisation } } });
  if (error) {
    if (isRateLimited(error)) return json({ error: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." }, 429);
    if (error.code === "weak_password") return json({ error: "weak_password", message: "Choose a stronger password." }, 400);
    console.error("[auth/signup]", error.code, error.message);
    return json({ error: "signup_failed", message: "We couldn't create your account. Please try again." }, 500);
  }
  if (data.user?.identities?.length) await audit("auth.sign_up", { actorId: data.user.id });
  return json({ ok: true, verify: true });
}
