import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { audit } from "@/lib/server/audit";
import { allow, clientIp, LIMITS } from "@/lib/server/rate-limit";
import { cleanEmail, cleanText, forbidden, fromOurSite, isRateLimited, json, notFound, passwordProblem, readJson, tooMany } from "@/lib/server/http";

// POST { email, password, name, organisation? } -> 200 { ok, verify: true } once the confirmation email is on its way.
// Every email gets the same answer (registered or not, throttled by Supabase or not), so the form never reveals
// who has an account. Our own limits are per visitor and per email, the same for everyone.
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const body = await readJson(request);
  const email = cleanEmail(body?.email);
  const name = cleanText(body?.name, 120);
  const organisation = cleanText(body?.organisation, 160);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) return json({ error: "invalid_name", message: "Enter your name." }, 400);
  if (!email) return json({ error: "invalid_email", message: "Enter a valid email address." }, 400);
  const weak = passwordProblem(password);
  if (weak) return json({ error: "weak_password", message: weak }, 400);
  if (!(await allow(LIMITS.signup(await clientIp(), email)))) return tooMany();

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, organisation } } });
  if (error) {
    if (error.code === "weak_password") return json({ error: "weak_password", message: "Choose a stronger password." }, 400);
    // e.g. a domain Supabase refuses (example.com, typos); says nothing about whether an account exists
    if (error.code === "email_address_invalid") return json({ error: "invalid_email", message: "Enter a valid email address." }, 400);
    // Supabase only throttles addresses it would email, so passing its 429 on would reveal which emails are new
    if (isRateLimited(error)) { console.warn("[auth/signup] Supabase rate limit:", error.code); return json({ ok: true, verify: true }); }
    console.error("[auth/signup]", error.code, error.message);
    return json({ error: "signup_failed", message: "We couldn't create your account. Please try again." }, 500);
  }
  if (data.user?.identities?.length) await audit("auth.sign_up", { actorId: data.user.id });
  return json({ ok: true, verify: true });
}
