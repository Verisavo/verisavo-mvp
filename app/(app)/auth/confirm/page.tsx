import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import AccountHeader from "../../AccountHeader";
import { confirmLink } from "./actions";
import { isLinkType, LINK_TEXT } from "./links";

export const metadata: Metadata = {
  title: "Continue · Verisavo",
  robots: { index: false, follow: false }
};

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

// Where the links in Supabase's emails land. Opening the link changes nothing: the user presses the button, which
// posts the token (actions.ts). Email scanners that pre-open links can't use them up, and no other site can sign
// someone in just by loading this address.
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Params> }) {
  await connection();
  if (!released(1)) notFound();
  const params = await searchParams;
  const tokenHash = one(params.token_hash), type = one(params.type);
  const text = tokenHash && isLinkType(type) ? LINK_TEXT[type] : null;

  return (
    <>
      <AccountHeader />
      <main className="mx-auto grid max-w-lg px-5 pt-16 pb-20">
        <section className="card" aria-labelledby="cf-h">
          <p className="eyebrow">{text?.eyebrow ?? "Email link"}</p>
          <h1 id="cf-h" className="text-[17px] font-semibold">{text?.title ?? "This link isn't complete"}</h1>
          {text ? (
            <form action={confirmLink} className="grid gap-3">
              <p className="-mt-1.5 text-[15px] text-brand-800">{text.body}</p>
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="type" value={type} />
              <div><button className="btn" type="submit">{text.button}</button></div>
            </form>
          ) : (
            <p className="rounded-xl bg-canvas p-4 text-[15px] text-brand-800">
              {"Open the link from your email again, or "}
              <a className="font-semibold text-ink" href="/platform#signin">{"go to sign in"}</a>
            </p>
          )}
        </section>
      </main>
    </>
  );
}
