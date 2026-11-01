import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireUser } from "@/lib/server/auth";
import { getConversation } from "@/lib/server/assistant/conversations";
import { getEntitlements } from "@/lib/server/entitlements";
import AccountHeader from "../../../AccountHeader";
import { Transcript } from "../../../ConversationViews";

export const metadata: Metadata = { title: "Conversation · Verisavo", robots: { index: false, follow: false } };

// One of the user's own chats. getConversation matches id and owner, so anyone else's id is a 404.
export default async function MyConversation({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!released(3)) notFound();
  const user = await requireUser();
  const { id } = await params;
  const conv = /^[0-9a-f-]{36}$/i.test(id) ? await getConversation(user.id, id) : null;
  if (!conv) notFound();
  const paid = (await getEntitlements(user.id)).plan === "paid";
  return (
    <>
      <AccountHeader><a className="btn btn-ghost" href="/dashboard">{"Your dashboard"}</a></AccountHeader>
      <main className="mx-auto grid max-w-3xl gap-5 px-5 pt-7 pb-20 sm:pt-10">
        <a className="text-sm font-semibold text-ink" href="/dashboard/conversations">{"← All conversations"}</a>
        <h1 className="text-[clamp(1.4rem,1.2rem+1vw,1.9rem)] leading-tight font-medium tracking-[-0.02em] [overflow-wrap:anywhere]">{conv.title}</h1>
        <div className="flex flex-wrap gap-2">
          <a className="btn" href={`/assistant?c=${conv.id}`}>{"Continue in the assistant"}</a>
          {paid && <a className="btn btn-ghost" href={`/api/assistant/conversations/${conv.id}/pdf`} download>{"Download PDF"}</a>}
        </div>
        <Transcript messages={conv.messages} />
      </main>
    </>
  );
}
