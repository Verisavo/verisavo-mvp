import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { getSessionUser } from "@/lib/server/auth";
import { createSupabase } from "@/lib/server/supabase";
import { hasRecoveryGrant } from "@/lib/server/recovery";
import AccountHeader from "../AccountHeader";
import ResetForm from "./ResetForm";

export const metadata: Metadata = {
  title: "Choose a new password · Verisavo",
  robots: { index: false, follow: false }
};

// Reached from the password-reset email via /auth/confirm. The form only shows in the session that link created,
// for 15 minutes (lib/server/recovery.ts); changing the password otherwise needs the current one (dashboard).
export default async function ResetPasswordPage() {
  await connection();   // always render per request, never prerender at build time
  if (!released(1)) notFound();
  const grant = await hasRecoveryGrant(await createSupabase());
  const user = grant ? await getSessionUser() : null;

  return (
    <>
      <AccountHeader />
      <main className="mx-auto grid max-w-lg px-5 pt-16 pb-20">
        <section className="card" aria-labelledby="rp-h">
          <p className="eyebrow">{"Password reset"}</p>
          <h1 id="rp-h" className="text-[17px] font-semibold">{"Choose a new password"}</h1>
          {user ? (
            <ResetForm email={user.email} />
          ) : (
            <p className="rounded-xl bg-canvas p-4 text-[15px] text-brand-800">
              {"This reset link has expired or was already used. "}
              <a className="font-semibold text-ink" href="/platform#signin">{"Request a new one"}</a>
            </p>
          )}
        </section>
      </main>
    </>
  );
}
