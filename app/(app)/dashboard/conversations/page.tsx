import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireUser } from "@/lib/server/auth";
import { CONVERSATIONS_PER_PAGE, searchConversations } from "@/lib/server/assistant/conversations";
import AccountHeader from "../../AccountHeader";
import { ConversationFilterBar, ConversationTable, filterHref, readFilters } from "../../ConversationViews";
import Pagination from "../../admin/Pagination";
import { pageParam } from "../../admin/format";

export const metadata: Metadata = { title: "Your conversations · Verisavo", robots: { index: false, follow: false } };

const BASE = "/dashboard/conversations";

// All of the user's own chats: search by title, filter by date, page through them
export default async function MyConversations({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  if (!released(3)) notFound();
  const user = await requireUser();
  const p = await searchParams;
  const filters = { ...readFilters(p), who: "" };
  const { rows, total, page } = await searchConversations(filters, pageParam(p.page), user.id);
  return (
    <>
      <AccountHeader><a className="btn btn-ghost" href="/dashboard">{"Your dashboard"}</a></AccountHeader>
      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-5 pt-7 pb-20 sm:pt-10">
        <div>
          <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Your conversations"}</h1>
          <p className="mt-1 text-brand-800">{"Every question you've asked the Intelligence Assistant."}</p>
        </div>
        <ConversationFilterBar base={BASE} filters={filters} />
        <ConversationTable rows={rows} base={BASE} filtered={Boolean(filters.q || filters.from || filters.to)} canDelete />
        <Pagination page={page} total={total} size={CONVERSATIONS_PER_PAGE} href={n => filterHref(BASE, filters, n)} />
      </main>
    </>
  );
}
