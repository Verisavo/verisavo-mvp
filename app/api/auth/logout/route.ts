import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { getSessionUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { json, notFound } from "@/lib/server/http";

// POST -> 200 and clears the session cookies
export async function POST() {
  if (!released(1)) return notFound();
  const user = await getSessionUser();
  const supabase = await createSupabase();
  await supabase.auth.signOut({ scope: "local" });   // this device only, not every device the user is signed in on
  if (user) await audit("auth.sign_out", { actorId: user.id });
  return json({ ok: true });
}
