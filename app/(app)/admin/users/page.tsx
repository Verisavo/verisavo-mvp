import { connection } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { fmtDay, fmtWhen, pageParam } from "../format";
import { listUsers } from "../queries";
import UserToggle from "./UserToggle";

type Params = Promise<Record<string, string | string[] | undefined>>;

// Manage users (M2.2): find people, see their status and usage, disable or re-enable an account
export default async function AdminUsers({ searchParams }: { searchParams: Params }) {
  await connection();
  const admin = await requireAdmin();
  const p = await searchParams;
  const q = typeof p.q === "string" ? p.q.trim().slice(0, 120) : "";
  const page = pageParam(p.page);
  const { rows, more } = await listUsers(q, page);
  const href = (n: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Users"}</h1>
          <p className="mt-1 text-brand-800">{"Everyone with a Verisavo account."}</p>
        </div>
        <form className="flex gap-2" role="search">
          <label className="sr-only" htmlFor="u-q">{"Search users"}</label>
          <input className="input min-h-10 w-64" id="u-q" name="q" defaultValue={q} placeholder="Name, email or organisation" />
          <button className="btn" type="submit">{"Search"}</button>
        </form>
      </div>

      <section className="card overflow-x-auto p-0 sm:p-0" aria-label="Users">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-brand-200 text-brand-800">
            <tr>
              <th className="px-5 py-3 font-semibold">{"Name"}</th>
              <th className="px-3 py-3 font-semibold">{"Email"}</th>
              <th className="px-3 py-3 font-semibold">{"Plan"}</th>
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
                </td>
                <td className="px-3 py-3">{u.email}{!u.email_confirmed_at && <span className="block text-[12px] text-brand-600">{"Email not confirmed"}</span>}</td>
                <td className="px-3 py-3">{"Free"}</td>
                <td className="px-3 py-3 text-right tabular-nums">{u.questions}</td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtDay(u.created_at)}</td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtWhen(u.last_sign_in_at)}</td>
                <td className="px-3 py-3">{u.disabled_at ? <span className="font-semibold text-danger">{"Disabled"}</span> : "Active"}</td>
                <td className="px-5 py-3 text-right">{u.id !== admin.id && <UserToggle id={u.id} name={u.name || u.email} disabled={Boolean(u.disabled_at)} />}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="px-5 py-8 text-center text-brand-800">{q ? "No users match that search." : "No users yet."}</td></tr>}
          </tbody>
        </table>
      </section>

      {(page > 1 || more) && (
        <nav className="flex justify-between text-sm font-semibold" aria-label="Pages">
          {page > 1 ? <a href={href(page - 1)}>{"← Newer"}</a> : <span />}
          {more && <a href={href(page + 1)}>{"Older →"}</a>}
        </nav>
      )}
    </>
  );
}
