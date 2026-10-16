import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { getSessionUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { json, notFound, passwordProblem, readJson } from "@/lib/server/http";

// POST { password } -> 200. Needs the session created by the password-reset link (/auth/confirm?type=recovery).
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  const user = await getSessionUser();
  if (!user) return json({ error: "link_expired", message: "This reset link has expired. Please request a new one." }, 401);

  const body = await readJson(request);
  const password = typeof body?.password === "string" ? body.password : "";
  const weak = passwordProblem(password);
  if (weak) return json({ error: "weak_password", message: weak }, 400);

  const supabase = await createSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return json({ error: "same_password", message: "Choose a password you haven't used before." }, 400);
    if (error.code === "weak_password") return json({ error: "weak_password", message: "Choose a stronger password." }, 400);
    console.error("[auth/reset]", error.code, error.message);
    return json({ error: "reset_failed", message: "We couldn't change your password. Please try again." }, 500);
  }
  await audit("auth.password_reset", { actorId: user.id });
  return json({ ok: true });
}
