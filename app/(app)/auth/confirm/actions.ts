"use server";
import { redirect } from "next/navigation";
import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { audit } from "@/lib/server/audit";
import { grantRecovery } from "@/lib/server/recovery";
import { allow, clientIp, LIMITS } from "@/lib/server/rate-limit";
import { isLinkType, type LinkType } from "./links";

const EVENTS: Record<LinkType, string> = { email: "auth.email_confirmed", recovery: "auth.recovery_link", email_change: "auth.email_changed" };
const EXPIRED = "/platform?auth=link-expired#signin";

// The Continue button on /auth/confirm. A valid link signs the user in. An expired or reused link goes back to sign-in
// with a message. A recovery link also grants this one session a single password change (lib/server/recovery.ts).
export async function confirmLink(formData: FormData): Promise<void> {
  if (!released(1)) redirect("/");
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = formData.get("type");
  if (!tokenHash || !isLinkType(type)) redirect(EXPIRED);
  if (!(await allow(LIMITS.link(await clientIp())))) redirect("/platform?auth=too-many#signin");

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) redirect(EXPIRED);
  if (type === "recovery") await grantRecovery(supabase);
  await audit(EVENTS[type], { actorId: data.user.id });
  // Always the dashboard, which says whose account this is: a link can come from someone else's email, and would
  // otherwise quietly sign the reader into that person's account.
  redirect(type === "recovery" ? "/reset-password" : "/dashboard?confirmed=1");
}
