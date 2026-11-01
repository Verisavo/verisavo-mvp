import { released } from "@/lib/release";
import { afterGoogle, googleEnabled } from "@/lib/server/auth";
import { appUrl, forbidden, fromOurSite, json, notFound, readJson, tooMany } from "@/lib/server/http";
import { allow, clientIp, LIMITS } from "@/lib/server/rate-limit";
import { createSupabase } from "@/lib/server/supabase";

// POST { next } -> { url } of Google's sign-in page, through Supabase. The PKCE cookie set here ties the sign-in to this
// browser, so /auth/callback can't be used to sign someone else into an attacker's account.
export async function POST(request: Request) {
  if (!released(1)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  if (!(await allow(LIMITS.link(await clientIp())))) return tooMany();
  if (!(await googleEnabled())) return json({ error: "google_off", message: "Google sign-in isn’t available yet. Please use your email." }, 503);
  const body = await readJson(request);
  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(afterGoogle(body?.next))}`, skipBrowserRedirect: true }
  });
  if (error || !data.url) {
    console.error("[auth/google] failed:", error?.code ?? "no url");
    return json({ error: "google_failed", message: "We couldn’t open Google sign-in. Please try again." }, 502);
  }
  return json({ url: data.url });
}
