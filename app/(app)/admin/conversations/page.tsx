import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireAdmin } from "@/lib/server/admin";
import { CONVERSATIONS_PER_PAGE, searchConversations } from "@/lib/server/assistant/conversations";
import { ConversationFilterBar, ConversationTable, filterHref, readFilters } from "../../ConversationViews";
import Pagination from "../Pagination";
import { pageParam } from "../format";

const BASE = "/admin/conversations";

// Every user's chats, for admins. Opening one is recorded in the activity log.
export default async function AdminConversations({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  await requireAdmin();
  if (!released(3)) notFound();
  const p = await searchParams;
  const filters = readFilters(p);
  const { rows, total, page } = await searchConversations(filters, pageParam(p.page));
  return (
    <>
      <div>
        <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Conversations"}</h1>
        <p className="mt-1 text-brand-800">{"What people have asked. Opening a conversation is recorded in the activity log."}</p>
      </div>
      <ConversationFilterBar base={BASE} filters={filters} showWho />
      <ConversationTable rows={rows} base={BASE} filtered={Boolean(filters.q || filters.who || filters.from || filters.to)} showWho />
      <Pagination page={page} total={total} size={CONVERSATIONS_PER_PAGE} href={n => filterHref(BASE, filters, n)} />
    </>
  );
}
