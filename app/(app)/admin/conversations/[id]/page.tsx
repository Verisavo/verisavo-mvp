import { notFound } from "next/navigation";
import { connection } from "next/server";
import { released } from "@/lib/release";
import { requireAdmin } from "@/lib/server/admin";
import { readConversationAsAdmin } from "@/lib/server/assistant/conversations";
import { Transcript } from "../../../ConversationViews";

// One user's chat, for admins: read-only, and each opening goes in the activity log
export default async function AdminConversation({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const admin = await requireAdmin();
  if (!released(3)) notFound();
  const { id } = await params;
  const conv = /^[0-9a-f-]{36}$/i.test(id) ? await readConversationAsAdmin(id, admin.id) : null;
  if (!conv) notFound();
  return (
    <div className="mx-auto grid w-full max-w-3xl min-w-0 gap-5">
      <a className="text-sm font-semibold text-ink" href="/admin/conversations">{"← All conversations"}</a>
      <div className="grid gap-1">
        <h1 className="text-[clamp(1.4rem,1.2rem+1vw,1.9rem)] leading-tight font-medium tracking-[-0.02em] [overflow-wrap:anywhere]">{conv.title}</h1>
        <p className="text-sm text-brand-800">{`${conv.owner.name || "Someone"}${conv.owner.email ? ` · ${conv.owner.email}` : ""}`}</p>
      </div>
      <p className="rounded-xl bg-brand-100 p-3 text-sm">{"Read-only. Your opening this conversation is recorded in the activity log."}</p>
      <Transcript messages={conv.messages} />
    </div>
  );
}
