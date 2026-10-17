import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound } from "@/lib/server/http";
import { deleteConversation, getConversation } from "@/lib/server/assistant/conversations";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Params = { params: Promise<{ id: string }> };

// GET -> { id, title, messages: [{ id, role, content, market, sources, createdAt }] } (only the user's own)
export async function GET(_request: Request, { params }: Params) {
  if (!released(3)) return notFound();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  const { id } = await params;
  const conv = UUID.test(id) ? await getConversation(user.id, id) : null;
  return conv ? json(conv) : notFound();
}

// DELETE (JSON) -> { ok }: "Clear this conversation"
export async function DELETE(request: Request, { params }: Params) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  const { id } = await params;
  return UUID.test(id) && (await deleteConversation(user.id, id)) ? json({ ok: true }) : notFound();
}
