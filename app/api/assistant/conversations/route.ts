import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound } from "@/lib/server/http";
import { deleteAllConversations, listConversations } from "@/lib/server/assistant/conversations";

// GET -> { conversations: [{ id, title, updatedAt }] }, newest first
export async function GET() {
  if (!released(3)) return notFound();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  return json({ conversations: await listConversations(user.id) });
}

// DELETE (JSON) -> { deleted }: "Clear all recent questions"
export async function DELETE(request: Request) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  return json({ deleted: await deleteAllConversations(user.id) });
}
