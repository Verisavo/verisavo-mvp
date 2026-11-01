import { connection } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { fmtDay, fmtWhen, pageParam } from "../format";
import Pagination from "../Pagination";
import { listUsers, PAGE_SIZE } from "../queries";
import UserToggle from "./UserToggle";
import ResetAllowance from "./ResetAllowance";
import UnlinkWhatsApp from "./UnlinkWhatsApp";

const PLAN_STATUS: Record<string, string> = { active: "Monthly", trialing: "Monthly (trial)", past_due: "Monthly · payment retrying" };

type Params = Promise<Record<string, string | string[] | undefined>>;

// Manage users (M2.2): find people, see their status and usage, disable or re-enable an account
export default async function AdminUsers({ searchParams }: { searchParams: Params }) {
  await connection();
  const admin = await requireAdmin();
  const p = await searchParams;
  const q = typeof p.q === "string" ? p.q.trim().slice(0, 120) : "";
  const plan = p.plan === "paid" || p.plan === "free" ? p.plan : "";
  const status = p.status === "active" || p.status === "disabled" || p.status === "unconfirmed" ? p.status : "";
  const { rows, total, page } = await listUsers({ q, plan, status }, pageParam(p.page));
  const filtered = Boolean(q || plan || status);
  const href = (n: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(plan ? { plan } : {}), ...(status ? { status } : {}), page: String(n) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Users"}</h1>
          <p className="mt-1 text-brand-800">{"Everyone with a Verisavo account."}</p>
        </div>
        <form className="flex flex-wrap items-center gap-2 max-sm:w-full" role="search">
          <label className="sr-only" htmlFor="u-q">{"Search users"}</label>
          <input className="input min-h-10 w-64 max-sm:w-full" id="u-q" name="q" defaultValue={q} placeholder="Name, email or organisation" />
          <label className="sr-only" htmlFor="u-plan">{"Plan"}</label>
          <select className="input min-h-10 w-32 max-sm:min-w-0 max-sm:flex-1" id="u-plan" name="plan" defaultValue={plan}>
            <option value="">{"All plans"}</option><option value="paid">{"Monthly"}</option><option value="free">{"Free"}</option>
          </select>
          <label className="sr-only" htmlFor="u-status">{"Status"}</label>
          <select className="input min-h-10 w-40 max-sm:min-w-0 max-sm:flex-1" id="u-status" name="status" defaultValue={status}>
            <option value="">{"All statuses"}</option><option value="active">{"Active"}</option><option value="disabled">{"Disabled"}</option><option value="unconfirmed">{"Email not confirmed"}</option>
          </select>
          <button className="btn" type="submit">{"Apply"}</button>
          {filtered && <a className="btn btn-ghost" href="/admin/users">{"Clear"}</a>}
        </form>
      </div>

      {/* relative: the screen-reader labels inside the rows are positioned, and must scroll with the table rather than widen the page */}
      <section className="card relative overflow-x-auto p-0 sm:p-0" aria-label="Users">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-brand-200 text-brand-800">
            <tr>
              <th className="px-5 py-3 font-semibold">{"Name"}</th>
              <th className="px-3 py-3 font-semibold">{"Email"}</th>
              <th className="px-3 py-3 font-semibold">{"Plan"}</th>
              <th className="px-3 py-3 text-right font-semibold" title="This billing period for subscribers; free questions for everyone else">{"Allowance used"}</th>
              <th className="px-3 py-3 text-right font-semibold">{"Questions"}</th>
              <th className="px-3 py-3 font-semibold">{"Joined"}</th>
              <th className="px-3 py-3 font-semibold">{"Last sign-in"}</th>
              <th className="px-3 py-3 font-semibold">{"Status"}</th>
              <th className="px-5 py-3"><span className="sr-only">{"Actions"}</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {rows.map(u => (
              <tr key={u.id} className={u.disabled_at ? "bg-canvas text-brand-800" : ""}>
                <td className="px-5 py-3">
                  <b className="font-semibold">{u.name || "—"}</b>
                  {u.role === "admin" && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">{"Admin"}</span>}
                  {u.organisation && <span className="block text-[13px] text-brand-800">{u.organisation}</span>}
                  {u.questions > 0 && <a className="block text-[13px] font-semibold text-ink" href={`/admin/conversations?who=${encodeURIComponent(u.email)}`}>{"View conversations"}</a>}
                </td>
                <td className="px-3 py-3">{u.email}{!u.email_confirmed_at && <span className="block text-[12px] text-brand-600">{"Email not confirmed"}</span>}</td>
                <td className="px-3 py-3">
                  {u.sub_status ? PLAN_STATUS[u.sub_status] ?? "Monthly" : "Free"}
                  {u.sub_status && u.renews_at && <span className="block text-[12px] text-brand-800">{`${u.cancel_at_period_end ? "Ends" : "Renews"} ${fmtDay(u.renews_at)}`}</span>}
                  {u.whatsapp && <span className="block text-[12px] text-brand-800">{"WhatsApp linked"}</span>}
                </td>
                <td className={`px-3 py-3 text-right tabular-nums ${u.used >= u.allowance ? "font-semibold text-danger" : ""}`}>{`${u.used} / ${u.allowance}`}</td>
                <td className="px-3 py-3 text-right tabular-nums">{u.questions}</td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtDay(u.created_at)}</td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtWhen(u.last_sign_in_at)}</td>
                <td className="px-3 py-3">{u.disabled_at ? <span className="font-semibold text-danger">{"Disabled"}</span> : "Active"}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    {u.used > 0 && <ResetAllowance id={u.id} name={u.name || u.email} paid={Boolean(u.sub_status)} />}
                    {u.whatsapp && <UnlinkWhatsApp id={u.id} name={u.name || u.email} />}
                    {u.id !== admin.id && <UserToggle id={u.id} name={u.name || u.email} disabled={Boolean(u.disabled_at)} />}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={9}className="px-5 py-8 text-center text-brand-800">{q ? "No users match that search." : "No users yet."}</td></tr>}
          </tbody>
        </table>
      </section>

      <Pagination page={page} total={total} size={PAGE_SIZE} href={href} />
    </>
  );
}
