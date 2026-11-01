import { connection } from "next/server";
import { released } from "@/lib/release";
import { CHART } from "../chartColors";
import { ColumnChart, SegmentedBar, TrendChart } from "../Charts";
import { requireAdmin } from "@/lib/server/admin";
import { actionLabel, fmtDay, fmtWhen } from "./format";
import { listActivity, overviewStats } from "./queries";

// Admin overview (M2.1–M2.4): people, knowledge base, questions per day and the latest activity
export default async function AdminOverview() {
  await connection();
  await requireAdmin();
  const [{ users, kb, days, plans, signups }, recent] = await Promise.all([overviewStats(), listActivity({}, 1, 8)]);
  const planNote = [plans.past_due ? `${plans.past_due} payment retrying` : "", plans.cancelling ? `${plans.cancelling} cancelling` : "", users.disabled ? `${users.disabled} disabled` : ""].filter(Boolean).join(" · ");
  const totals = days.reduce((t, d) => ({ web: t.web + d.web, whatsapp: t.whatsapp + d.whatsapp }), { web: 0, whatsapp: 0 });
  const channels = [{ key: "web", label: "Web", color: CHART.blue }, ...(released(4) ? [{ key: "whatsapp", label: "WhatsApp", color: CHART.teal }] : [])];
  const free = Math.max(0, users.total - plans.paid);

  const stat = (label: string, value: number | string, note?: string) => (
    <div className="card gap-1.5">
      <p className="eyebrow">{label}</p>
      <p className="font-serif text-3xl leading-none font-medium tracking-tight">{value}</p>
      {note && <p className="text-[13px] text-brand-800">{note}</p>}
    </div>
  );

  return (
    <>
      <div>
        <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Overview"}</h1>
        <p className="mt-1 text-brand-800">{"People, knowledge base and questions at a glance."}</p>
      </div>

      <section aria-label="Numbers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Users", users.total, `${users.new7} new this week · ${users.confirmed} confirmed`)}
        {stat("Paid subscribers", plans.paid, `${Math.max(0, users.total - plans.paid)} on the free plan${planNote ? ` · ${planNote}` : ""}`)}
        {stat("Knowledge base", kb.published, `published · ${kb.drafts} drafts · ${kb.archived} archived`)}
        {stat("Questions, 14 days", totals.web + totals.whatsapp, `${totals.web} web · ${totals.whatsapp} WhatsApp`)}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card min-w-0" aria-labelledby="days-h">
          <p className="eyebrow">{"Usage"}</p>
          <h2 id="days-h" className="text-[17px] font-semibold">{"Questions per day"}</h2>
          <TrendChart data={[...days].reverse()} series={channels} label={`Questions per day over the last 14 days: ${totals.web + totals.whatsapp} in total`} />
          <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-brand-800">{"View as a table"}</summary>
          <table className="mt-2 w-full text-left text-sm">
            <thead className="text-brand-800">
              <tr><th className="py-1.5 font-semibold">{"Day"}</th><th className="py-1.5 text-right font-semibold">{"Web"}</th><th className="py-1.5 text-right font-semibold">{"WhatsApp"}</th><th className="py-1.5 text-right font-semibold">{"Total"}</th></tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {days.map(d => (
                <tr key={d.day}>
                  <td className="py-1.5">{fmtDay(d.day)}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.web}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.whatsapp}</td>
                  <td className="py-1.5 text-right font-semibold tabular-nums">{d.web + d.whatsapp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </details>
        </section>

        <section className="card min-w-0" aria-labelledby="new-users-h">
          <p className="eyebrow">{"Growth"}</p>
          <h2 id="new-users-h" className="text-[17px] font-semibold">{"New accounts per day"}</h2>
          <ColumnChart data={signups} series={{ key: "users", label: "New accounts", color: CHART.blue }} label={`New accounts per day over the last 14 days: ${signups.reduce((n, d) => n + d.users, 0)} in total`} />
        </section>

        <section className="card min-w-0" aria-labelledby="split-h">
          <p className="eyebrow">{"At a glance"}</p>
          <h2 id="split-h" className="text-[17px] font-semibold">{"Plans and knowledge base"}</h2>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <p className="text-sm font-semibold">{"People by plan"}</p>
              <SegmentedBar label="People by plan" empty="No accounts yet"
                parts={[{ label: "Monthly", value: plans.paid, color: CHART.blue }, { label: "Free", value: free, color: CHART.teal }]} />
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-semibold">{"Documents by status"}</p>
              <SegmentedBar label="Documents by status" empty="No documents yet"
                parts={[{ label: "Published", value: kb.published, color: CHART.blue }, { label: "Drafts", value: kb.drafts, color: CHART.teal }, { label: "Archived", value: kb.archived, color: CHART.orange, dark: true }]} />
            </div>
          </div>
        </section>

        <section className="card min-w-0" aria-labelledby="recent-h">
          <p className="eyebrow">{"Activity"}</p>
          <h2 id="recent-h" className="text-[17px] font-semibold">{"Latest"}</h2>
          {recent.rows.length ? (
            <ul className="grid divide-y divide-brand-100 text-sm">
              {recent.rows.map(a => (
                <li key={a.id} className="flex items-baseline justify-between gap-3 py-2">
                  <span className="min-w-0"><b className="font-semibold">{a.name || a.email || "Someone"}</b>{" · "}{actionLabel(a.action)}</span>
                  <time className="text-[13px] whitespace-nowrap text-brand-800" dateTime={new Date(a.created_at).toISOString()}>{fmtWhen(a.created_at)}</time>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-brand-800">{"Nothing yet."}</p>}
          <a href="/admin/activity" className="text-sm font-semibold text-ink">{"See all activity →"}</a>
        </section>
      </div>
    </>
  );
}
