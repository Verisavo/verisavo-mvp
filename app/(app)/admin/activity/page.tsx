import { connection } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { ACTION_GROUPS, actionLabel, fmtWhen, pageParam } from "../format";
import Pagination from "../Pagination";
import { listActivity, PAGE_SIZE } from "../queries";

type Params = Promise<Record<string, string | string[] | undefined>>;

// System activity (M2.4): sign-ins, account changes, admin actions and knowledge-base changes
export default async function AdminActivity({ searchParams }: { searchParams: Params }) {
  await connection();
  await requireAdmin();
  const p = await searchParams;
  const group = ACTION_GROUPS.some(g => g.value === p.type) ? String(p.type) : "";
  const who = typeof p.who === "string" ? p.who.trim().slice(0, 120) : "";
  const dateOf = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
  const from = dateOf(p.from), to = dateOf(p.to);
  const { rows, total, page } = await listActivity({ group, who, from, to }, pageParam(p.page));
  const filtered = Boolean(group || who || from || to);
  const href = (n: number) => `/admin/activity?${new URLSearchParams({ ...(group ? { type: group } : {}), ...(who ? { who } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), page: String(n) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Activity"}</h1>
          <p className="mt-1 text-brand-800">{"What happened, who did it and when."}</p>
        </div>
        <form className="flex flex-wrap items-end gap-2 max-sm:w-full">
          <div className="grid gap-1 max-sm:w-full"><label className="text-xs font-semibold text-brand-800" htmlFor="a-type">{"Type"}</label>
            <select id="a-type" name="type" defaultValue={group} className="input min-h-10 w-52 max-sm:w-full">
              {ACTION_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select></div>
          <div className="grid gap-1 max-sm:w-full"><label className="text-xs font-semibold text-brand-800" htmlFor="a-who">{"Who"}</label>
            <input id="a-who" name="who" defaultValue={who} placeholder="Name or email" className="input min-h-10 w-48 max-sm:w-full" /></div>
          <div className="grid gap-1 max-sm:min-w-0 max-sm:flex-1"><label className="text-xs font-semibold text-brand-800" htmlFor="a-from">{"From"}</label>
            <input id="a-from" name="from" type="date" defaultValue={from} className="input min-h-10 w-40 max-sm:w-full" /></div>
          <div className="grid gap-1 max-sm:min-w-0 max-sm:flex-1"><label className="text-xs font-semibold text-brand-800" htmlFor="a-to">{"To"}</label>
            <input id="a-to" name="to" type="date" defaultValue={to} className="input min-h-10 w-40 max-sm:w-full" /></div>
          <button className="btn" type="submit">{"Apply"}</button>
          {filtered && <a className="btn btn-ghost" href="/admin/activity">{"Clear"}</a>}
        </form>
      </div>

      <section className="card relative overflow-x-auto p-0 sm:p-0" aria-label="Activity">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-brand-200 text-brand-800">
            <tr>
              <th className="px-5 py-3 font-semibold">{"When"}</th>
              <th className="px-3 py-3 font-semibold">{"Who"}</th>
              <th className="px-3 py-3 font-semibold">{"What"}</th>
              <th className="px-5 py-3 font-semibold">{"On"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {rows.map(a => (
              <tr key={a.id}>
                <td className="px-5 py-2.5 whitespace-nowrap">{fmtWhen(a.created_at)}</td>
                <td className="px-3 py-2.5">{a.name || "—"}{a.email && <span className="block text-[13px] text-brand-800">{a.email}</span>}</td>
                <td className="px-3 py-2.5">{actionLabel(a.action)}</td>
                <td className="px-5 py-2.5 text-brand-800">
                  {a.target_type === "kb_document" && a.target_id ? <a className="font-semibold text-ink" href={`/admin/knowledge/${a.target_id}`}>{"Document"}</a>
                    : a.target_type === "user" ? (a.target_email ?? "A user") : "—"}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-brand-800">{filtered ? "Nothing matches these filters." : "Nothing here yet."}</td></tr>}
          </tbody>
        </table>
      </section>

      <Pagination page={page} total={total} size={PAGE_SIZE} href={href} />
    </>
  );
}
