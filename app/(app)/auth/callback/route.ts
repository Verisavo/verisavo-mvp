import { NextResponse } from "next/server";
import { released } from "@/lib/release";
import { audit } from "@/lib/server/audit";
import { afterGoogle, getProfile } from "@/lib/server/auth";
import { appUrl } from "@/lib/server/http";
import { allow, clientIp, LIMITS } from "@/lib/server/rate-limit";
import { createSupabase } from "@/lib/server/supabase";

const FAILED = "/platform?auth=google-failed#signin";

// Where Google sign-in comes back to. Changes the code for a session; a new Google user gets their profile from the
// sign-up trigger (migration 0002), and a disabled account is signed straight out again.
export async function GET(request: Request) {
  const to = (path: string) => NextResponse.redirect(`${appUrl()}${path}`, 303);
  if (!released(1)) return to("/");
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  if (!code) return to(FAILED);   // they cancelled at Google, or Google refused
  if (!(await allow(LIMITS.link(await clientIp())))) return to("/platform?auth=too-many#signin");

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return to(FAILED);

  const profile = await getProfile(data.user.id);
  if (!profile || profile.disabledAt) {
    await supabase.auth.signOut({ scope: "local" });
    return to("/platform?auth=disabled#signin");
  }
  const isNew = Date.now() - new Date(data.user.created_at).getTime() < 60_000;
  await audit(isNew ? "auth.sign_up" : "auth.sign_in", { actorId: data.user.id, metadata: { provider: "google" } });
  return to(afterGoogle(params.get("next")));
}
