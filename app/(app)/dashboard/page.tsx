import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { PLAN } from "@/lib/plan";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { conversations } from "@/db/schema";
import AccountHeader from "../AccountHeader";
import { CHART } from "../chartColors";
import { ColumnChart } from "../Charts";
import { signOutAction } from "./actions";
import { BillingButton, CheckoutNotice, DeleteConversation, EmailForm, PasswordForm, ProfileForm } from "./forms";
import { getEntitlements, type Entitlements } from "@/lib/server/entitlements";

export const metadata: Metadata = {
  title: "Your dashboard · Verisavo",
  robots: { index: false, follow: false }
};

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

// The user's workspace (M1.4): plan and billing, conversations, profile, email and password
export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();   // always render per request, never prerender at build time
  if (!released(1)) notFound();
  const user = await requireUser();
  const convs = await db
    .select({ id: conversations.id, title: conversations.title, updatedAt: conversations.updatedAt })
    .from(conversations)
    .where(eq(conversations.userId, user.id))
    .orderBy(desc(conversations.updatedAt))
    .limit(50);
  const firstName = user.profile.name.split(" ")[0];
  // someone who only signs in with Google has no password to change
  const [login] = await db.execute<{ has_password: boolean }>(sql`select coalesce(encrypted_password, '') <> '' as has_password from auth.users where id = ${user.id}`);
  // questions per day, last 14 days
  const asked = released(3) ? await db.execute<{ day: string; questions: number }>(sql`
    select to_char(d, 'YYYY-MM-DD') as day, count(m.id)::int as questions
    from generate_series(current_date - 13, current_date, interval '1 day') d
    left join messages m on m.user_id = ${user.id} and m.role = 'user' and m.created_at >= d and m.created_at < d + interval '1 day'
    group by d order by d`) : [];
  const askedTotal = asked.reduce((n, d) => n + d.questions, 0);
  const ent = released(3) ? await getEntitlements(user.id) : null;   // plans and limits arrive with M3
  const { checkout, confirmed } = await searchParams;
  const checkoutStatus = checkout === "success" || checkout === "cancel" ? checkout : null;

  return (
    <>
      <AccountHeader>
        <nav className="flex items-center gap-2" aria-label="Account">
          {user.profile.role === "admin" && released(2) && <a className="btn btn-ghost max-sm:hidden" href="/admin">{"Admin"}</a>}
          <a className="btn max-sm:hidden" href="/assistant">{"Ask Verisavo"}</a>
          <form action={signOutAction}><button className="btn btn-ghost" type="submit">{"Sign out"}</button></form>
        </nav>
      </AccountHeader>

      <main className="mx-auto grid max-w-5xl gap-6 px-5 pt-7 pb-20 sm:pt-10">
        {confirmed === "1" && <p role="status" className="rounded-xl bg-brand-100 p-3.5 text-sm">{`You're signed in as ${user.email}. If that isn't your email, press Sign out.`}</p>}
        <div>
          <h1 className="font-serif text-[clamp(2rem,1.4rem+2vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.03em]">
            {firstName ? `Hello ${firstName}.` : "Your dashboard"}
          </h1>
          <p className="mt-2 text-brand-800">{"Your Verisavo workspace: conversations, plan and account settings."}</p>
        </div>

        {asked.length > 0 && (
          <section className="card min-w-0" aria-labelledby="activity-h">
            <p className="eyebrow">{"Your activity"}</p>
            <h2 id="activity-h" className="text-[17px] font-semibold">{askedTotal ? `${askedTotal} question${askedTotal === 1 ? "" : "s"} in the last 14 days` : "No questions in the last 14 days"}</h2>
            <ColumnChart data={[...asked]} height={200} series={{ key: "questions", label: "Questions", color: CHART.blue }} label={`Your questions per day over the last 14 days: ${askedTotal} in total`} />
          </section>
        )}

        <div className="grid items-start gap-6 md:grid-cols-2">
          {ent ? <PlanCard ent={ent} checkout={checkoutStatus} /> : (
            <section className="card" aria-labelledby="plan-h" id="plan">
              <p className="eyebrow">{"Plan & billing"}</p>
              <h2 id="plan-h" className="flex flex-wrap items-center gap-2.5">
                <span className="font-serif text-3xl leading-none font-medium tracking-tight">{"Free"}</span>
                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">{"Current plan"}</span>
              </h2>
              <dl className="grid gap-2 text-[15px]">
                <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Included"}</dt><dd>{`${PLAN.FREE_QUESTIONS} free questions`}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Channels"}</dt><dd>{"Web"}</dd></div>
              </dl>
              <hr className="border-brand-100" />
              <p className="text-sm leading-snug">{`Verisavo Monthly adds ${PLAN.PAID_MESSAGES_PER_PERIOD} messages a month across web and WhatsApp, file and image uploads, and PDF reports.`}</p>
              <p className="hint">{"Upgrading opens soon. Your invoices and billing settings will appear here."}</p>
            </section>
          )}

          <section className="card" aria-labelledby="profile-h">
            <p className="eyebrow">{"Profile"}</p>
            <h2 id="profile-h" className="text-[17px] font-semibold">{"Your details"}</h2>
            <ProfileForm name={user.profile.name} organisation={user.profile.organisation} />
          </section>

          <section className="card md:col-span-2" aria-labelledby="conv-h">
            <p className="eyebrow">{"Conversations"}</p>
            <h2 id="conv-h" className="text-[17px] font-semibold">{"Your questions to the Intelligence Assistant"}</h2>
            {convs.length ? (
              <ul className="grid grid-cols-1 divide-y divide-brand-100">
                {convs.map(c => (
                  <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <span className="min-w-0 flex-1 truncate font-medium" title={c.title}>{c.title}</span>
                    <time className="text-[13px] whitespace-nowrap text-brand-800" dateTime={c.updatedAt.toISOString()}>{day.format(c.updatedAt)}</time>
                    <DeleteConversation id={c.id} title={c.title} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-canvas p-4 text-[15px] text-brand-800">
                {"No conversations yet. Your questions and answers will be saved here. "}
                <a className="font-semibold text-ink" href="/assistant">{"Ask your first question"}</a>
              </p>
            )}
          </section>

          <section className="card" aria-labelledby="email-h">
            <p className="eyebrow">{"Sign-in email"}</p>
            <h2 id="email-h" className="text-[17px] font-semibold">{"Email address"}</h2>
            <EmailForm email={user.email} />
          </section>

          <section className="card" aria-labelledby="pw-h">
            <p className="eyebrow">{"Security"}</p>
            <h2 id="pw-h" className="text-[17px] font-semibold">{"Password"}</h2>
            {login?.has_password ? <PasswordForm /> : <p className="text-sm text-brand-800">{"You sign in with Google, so there's no password to change. To add one, use “Forgot password?” on the sign-in page."}</p>}
          </section>
        </div>
      </main>
    </>
  );
}

// Plan & billing (M1.4 with M3): plan, usage x / limit, renewal date, and Stripe checkout or billing portal
function PlanCard({ ent, checkout }: { ent: Entitlements; checkout: "success" | "cancel" | null }) {
  const paid = ent.plan === "paid";
  const resets = ent.resetsAt ? day.format(ent.resetsAt) : null;
  const badge = !paid ? "Current plan" : ent.pastDue ? "Payment retrying" : ent.cancelAtPeriodEnd ? `Ends ${resets}` : "Active";
  return (
    <section className="card" aria-labelledby="plan-h" id="plan">
      <p className="eyebrow">{"Plan & billing"}</p>
      {checkout && <CheckoutNotice status={checkout} paid={paid} />}
      <h2 id="plan-h" className="flex flex-wrap items-center gap-2.5">
        <span className="font-serif text-3xl leading-none font-medium tracking-tight">{paid ? "Monthly" : "Free"}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ent.pastDue ? "bg-[#FEF3F2] text-danger" : "bg-brand-100 text-brand-800"}`}>{badge}</span>
      </h2>
      <div className="grid gap-1.5">
        <div className="flex justify-between gap-3 text-[15px]">
          <span className="text-brand-800">{paid ? "Messages this period" : "Free questions used"}</span>
          <b className="font-semibold tabular-nums">{`${ent.used} of ${ent.limit}`}</b>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-label="Allowance used" aria-valuemin={0} aria-valuemax={ent.limit} aria-valuenow={ent.used}>
          <div className={`h-full rounded-full ${ent.remaining ? "bg-ink" : "bg-danger"}`} style={{ width: `${Math.min(100, (ent.used / Math.max(1, ent.limit)) * 100)}%` }} />
        </div>
      </div>
      <dl className="grid gap-2 text-[15px]">
        {paid && resets && <div className="flex justify-between gap-3"><dt className="text-brand-800">{ent.cancelAtPeriodEnd ? "Plan ends" : "Renews and resets"}</dt><dd>{resets}</dd></div>}
        <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Channels"}</dt><dd>{paid ? "Web and WhatsApp" : "Web"}</dd></div>
      </dl>
      {ent.pastDue && <p className="rounded-xl bg-[#FEF3F2] p-3 text-sm text-danger">{"Your last payment didn’t go through. Stripe will try again; update your card to keep your plan."}</p>}
      <hr className="border-brand-100" />
      {paid ? (
        <>
          <p className="text-sm leading-snug">{"Invoices, your card and cancelling are in the billing portal."}</p>
          <BillingButton kind="manage" label="Manage billing" />
        </>
      ) : (
        <>
          <p className="text-sm leading-snug">{`Verisavo Monthly (${PLAN.PRICE_TEXT}) gives you ${PLAN.PAID_MESSAGES_PER_PERIOD} messages a month across web and WhatsApp, file and image uploads, and PDF reports.`}</p>
          {checkout !== "success" && <BillingButton kind="subscribe" label={`Subscribe · ${PLAN.PRICE_TEXT}`} />}
        </>
      )}
    </section>
  );
}
