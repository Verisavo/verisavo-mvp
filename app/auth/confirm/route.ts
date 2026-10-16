import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { released } from "@/lib/release";
import { createSupabase } from "@/lib/server/supabase";
import { audit } from "@/lib/server/audit";
import { safePath } from "@/lib/server/http";

// Target of the links in Supabase's emails (see "Accounts" in the README for the email templates):
//   /auth/confirm?token_hash=...&type=email&next=/dashboard          confirms a new account
//   /auth/confirm?token_hash=...&type=recovery                       password reset, then /reset-password
//   /auth/confirm?token_hash=...&type=email_change&next=/dashboard   confirms a new email address
// A valid link signs the user in. An expired or reused link goes back to sign in with a message.
const TYPES = ["email", "recovery", "email_change"] as const satisfies readonly EmailOtpType[];
type LinkType = (typeof TYPES)[number];
const isLinkType = (value: string | null): value is LinkType => TYPES.includes(value as LinkType);

const EVENTS: Record<LinkType, string> = { email: "auth.email_confirmed", recovery: "auth.recovery_link", email_change: "auth.email_changed" };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type");

  if (released(1) && tokenHash && isLinkType(type)) {
    const supabase = await createSupabase();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error && data.user) {
      await audit(EVENTS[type], { actorId: data.user.id });
      const next = type === "recovery" ? "/reset-password" : safePath(params.get("next"), "/dashboard");
      return NextResponse.redirect(new URL(next, request.url));
    }
  }
  return NextResponse.redirect(new URL("/platform?auth=link-expired#signin", request.url));
}
