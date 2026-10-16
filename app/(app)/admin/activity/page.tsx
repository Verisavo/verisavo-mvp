import { connection } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { ACTION_GROUPS, actionLabel, fmtWhen, pageParam } from "../format";
import { listActivity } from "../queries";

type Params = Promise<Record<string, string | string[] | undefined>>;

// System activity (M2.4): sign-ins, account changes, admin actions and knowledge-base changes
export default async function AdminActivity({ searchParams }: { searchParams: Params }) {
  await connection();
  await requireAdmin();
  const p = await searchParams;
  const group = ACTION_GROUPS.some(g => g.value === p.type) ? String(p.type) : "";
  const page = pageParam(p.page);
  const { rows, more } = await listActivity(group, page);
  const href = (n: number) => `/admin/activity?${new URLSearchParams({ ...(group ? { type: group } : {}), page: String(n) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Activity"}</h1>
          <p className="mt-1 text-brand-800">{"What happened, who did it and when."}</p>
        </div>
        <form className="flex gap-2">
          <label className="sr-only" htmlFor="a-type">{"Show"}</label>
          <select id="a-type" name="type" defaultValue={group} className="input min-h-10 w-56">
            {ACTION_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <button className="btn" type="submit">{"Show"}</button>
        </form>
      </div>

      <section className="card overflow-x-auto p-0 sm:p-0" aria-label="Activity">
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
                    : a.target_type === "user" ? "A user" : "—"}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-brand-800">{"Nothing here yet."}</td></tr>}
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
