import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound } from "@/lib/server/http";
import { deleteUnsentAttachment } from "@/lib/server/assistant/attachments";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// DELETE (JSON) -> { ok }: remove a file attached to a question that hasn't been sent yet
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  const { id } = await params;
  return UUID.test(id) && (await deleteUnsentAttachment(user.id, id)) ? json({ ok: true }) : notFound();
}
