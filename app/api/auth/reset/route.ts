import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { audit } from "@/lib/server/audit";
import { consumeRecoveryGrant, hasRecoveryGrant } from "@/lib/server/recovery";
import { allow, clientIp, LIMITS } from "@/lib/server/rate-limit";
import { forbidden, fromOurSite, json, notFound, passwordProblem, readJson, tooMany } from "@/lib/server/http";

// POST { password } -> 200. Only in the session created by a password-reset link, once, within 15 minutes
// (lib/server/recovery.ts). Changing the password from a normal session needs the current password (dashboard).
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  if (!(await allow(LIMITS.reset(await clientIp())))) return tooMany();

  const supabase = await createSupabase();
  const grant = await hasRecoveryGrant(supabase);
  if (!grant) return json({ error: "link_expired", message: "This reset link has expired. Please request a new one." }, 401);

  const body = await readJson(request);
  const password = typeof body?.password === "string" ? body.password : "";
  const weak = passwordProblem(password);
  if (weak) return json({ error: "weak_password", message: weak }, 400);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return json({ error: "same_password", message: "Choose a password you haven't used before." }, 400);
    if (error.code === "weak_password") return json({ error: "weak_password", message: "Choose a stronger password." }, 400);
    console.error("[auth/reset]", error.code, error.message);
    return json({ error: "reset_failed", message: "We couldn't change your password. Please try again." }, 500);
  }
  await consumeRecoveryGrant(grant.sessionId);
  await audit("auth.password_reset", { actorId: grant.userId });
  return json({ ok: true });
}
