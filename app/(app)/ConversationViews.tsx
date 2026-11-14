import type { ConversationFilters, ConversationRow } from "@/lib/server/assistant/conversations";
import { fmtDay, fmtWhen } from "./admin/format";
import { DeleteConversation } from "./dashboard/forms";
import { AnswerMarkdown } from "./Markdown";

// The conversation list and transcript, shared by the user's pages (their own chats) and the admin's (everyone's)

type Params = Record<string, string | string[] | undefined>;
const text = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime()) ? v : "");

export const readFilters = (p: Params): ConversationFilters => ({ q: text(p.q), who: text(p.who), from: day(p.from), to: day(p.to) });

export function filterHref(base: string, filters: ConversationFilters, page?: number): string {
  const set = Object.entries(filters).filter(([, v]) => v) as [string, string][];
  const qs = new URLSearchParams([...set, ...(page ? [["page", String(page)]] : [])]).toString();
  return qs ? `${base}?${qs}` : base;
}

const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export function ConversationFilterBar({ base, filters, showWho = false }: { base: string; filters: ConversationFilters; showWho?: boolean }) {
  const { q = "", who = "", from = "", to = "" } = filters;
  const today = isoDaysAgo(0);
  const quick = [{ label: "Today", from: today }, { label: "Last 7 days", from: isoDaysAgo(6) }, { label: "Last 30 days", from: isoDaysAgo(29) }];
  const field = "text-xs font-semibold text-brand-800";
  return (
    <div className="grid min-w-0 gap-3">
      <form className="flex min-w-0 flex-wrap items-end gap-2" role="search">
        <div className="grid min-w-0 flex-1 basis-56 gap-1"><label className={field} htmlFor="c-q">{"Title"}</label>
          <input id="c-q" name="q" defaultValue={q} maxLength={120} placeholder="Search by title" className="input min-h-10" /></div>
        {showWho && (
          <div className="grid min-w-0 flex-1 basis-48 gap-1"><label className={field} htmlFor="c-who">{"Person"}</label>
            <input id="c-who" name="who" defaultValue={who} maxLength={120} placeholder="Name or email" className="input min-h-10" /></div>
        )}
        <div className="grid min-w-0 flex-1 basis-32 gap-1 sm:flex-none"><label className={field} htmlFor="c-from">{"From"}</label>
          <input id="c-from" name="from" type="date" defaultValue={from} className="input min-h-10 min-w-0 px-2.5" /></div>
        <div className="grid min-w-0 flex-1 basis-32 gap-1 sm:flex-none"><label className={field} htmlFor="c-to">{"To"}</label>
          <input id="c-to" name="to" type="date" defaultValue={to} className="input min-h-10 min-w-0 px-2.5" /></div>
        <button className="btn" type="submit">{"Apply"}</button>
        {(q || who || from || to) && <a className="btn btn-ghost" href={base}>{"Clear"}</a>}
      </form>
      <nav aria-label="Quick dates" className="flex flex-wrap gap-1.5">
        {quick.map(d => {
          const on = from === d.from && !to;
          return (
            <a key={d.label} href={filterHref(base, { q, who, from: d.from })} aria-current={on ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-[13px] font-medium no-underline ${on ? "border-ink bg-ink text-white" : "border-brand-200 bg-white text-brand-800 hover:bg-brand-100"}`}>{d.label}</a>
          );
        })}
      </nav>
    </div>
  );
}

export function ConversationTable({ rows, base, filtered, showWho = false, canDelete = false }: { rows: ConversationRow[]; base: string; filtered: boolean; showWho?: boolean; canDelete?: boolean }) {
  const columns = 4 + (showWho ? 1 : 0) + (canDelete ? 1 : 0);
  return (
    <section className="card relative overflow-x-auto p-0 sm:p-0" aria-label="Conversations">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-brand-200 text-brand-800">
          <tr>
            <th className="px-5 py-3 font-semibold">{"Title"}</th>
            {showWho && <th className="px-3 py-3 font-semibold">{"Person"}</th>}
            <th className="px-3 py-3 text-right font-semibold">{"Questions"}</th>
            <th className="px-3 py-3 font-semibold">{"Started"}</th>
            <th className="px-3 py-3 font-semibold">{"Last activity"}</th>
            {canDelete && <th className="px-5 py-3"><span className="sr-only">{"Actions"}</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {rows.map(c => (
            <tr key={c.id}>
              <td className="max-w-[340px] px-5 py-3"><a className="block truncate font-semibold text-ink" title={c.title} href={`${base}/${c.id}`}>{c.title}</a></td>
              {showWho && <td className="px-3 py-3">{c.name || "—"}<span className="block text-[13px] text-brand-800">{c.email}</span></td>}
              <td className="px-3 py-3 text-right tabular-nums">{c.questions}</td>
              <td className="px-3 py-3 whitespace-nowrap">{fmtDay(c.created_at)}</td>
              <td className="px-3 py-3 whitespace-nowrap">{fmtWhen(c.updated_at)}</td>
              {canDelete && <td className="px-5 py-3 text-right"><DeleteConversation id={c.id} title={c.title} /></td>}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={columns} className="px-5 py-8 text-center text-brand-800">{filtered ? "No conversations match these filters." : "No conversations yet."}</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

type TranscriptMessage = { id: string; role: "user" | "assistant"; content: string; market: string | null; sources: { title: string }[] | null; createdAt: Date; files: string[]; channel?: string };

// Questions are shown as plain text; answers as Markdown, which never renders HTML (see Markdown.tsx)
export function Transcript({ messages }: { messages: TranscriptMessage[] }) {
  if (!messages.length) return <p className="card text-sm text-brand-800">{"This conversation has no messages."}</p>;
  return (
    <ol className="m-0 grid list-none gap-4 p-0">
      {messages.map(m => {
        const meta = [fmtWhen(m.createdAt), m.channel === "whatsapp" ? "via WhatsApp" : "", m.market && m.market !== "All markets" ? m.market : ""].filter(Boolean).join(" · ");
        return m.role === "user" ? (
          <li key={m.id} className="grid max-w-[85%] justify-self-end gap-1">
            <div className="rounded-[16px_16px_4px_16px] bg-brand-100 px-4 py-3 text-[15px] leading-[1.55] [overflow-wrap:anywhere] whitespace-pre-wrap">{m.content}</div>
            {m.files.length > 0 && <p className="text-right text-[13px] text-brand-800">{`Attached: ${m.files.join(", ")}`}</p>}
            <p className="text-right text-xs text-brand-800">{meta}</p>
          </li>
        ) : (
          <li key={m.id} className="grid gap-1">
            <div className="rounded-2xl border border-brand-200 bg-white px-4 py-3.5"><AnswerMarkdown text={m.content} /></div>
            {Boolean(m.sources?.length) && !/^Sources:/im.test(m.content) && <p className="text-[13px] text-brand-800">{`Sources: ${m.sources!.map(s => s.title).join(", ")}`}</p>}
            <p className="text-xs text-brand-800">{meta}</p>
          </li>
        );
      })}
    </ol>
  );
}
