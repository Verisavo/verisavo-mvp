import { released } from "@/lib/release";
import { getCurrentUser } from "@/lib/server/auth";
import { json, notFound, tooMany } from "@/lib/server/http";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { getEntitlements, usageView } from "@/lib/server/entitlements";
import { getConversation } from "@/lib/server/assistant/conversations";
import { buildReport, reportFileName, type ReportItem } from "@/lib/server/pdf/report";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET -> a branded PDF of the whole conversation, or ?message=<answer id> for one answer with its question (M3.7).
// Paid only (402 otherwise); doesn't count as a message (decision D4). Only the owner's conversations.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!released(3)) return notFound();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);
  const { id } = await params;
  const messageId = new URL(request.url).searchParams.get("message");
  if (!UUID.test(id) || (messageId && !UUID.test(messageId))) return notFound();
  const ent = await getEntitlements(user.id);
  if (!ent.features.pdf) return json({ error: "limit_reached", reason: "feature_requires_subscription", feature: "pdf", usage: usageView(ent) }, 402);
  if (!(await allow(LIMITS.pdf(user.id)))) return tooMany();

  const conv = await getConversation(user.id, id);
  if (!conv) return notFound();
  // pair each answer with the question before it
  const items: (ReportItem & { answerId: string })[] = [];
  let question: (typeof conv.messages)[number] | null = null;
  for (const m of conv.messages) {
    if (m.role === "user") question = m;
    else if (question) items.push({ answerId: m.id, question: question.content, market: question.market, files: question.files, answer: m.content });
  }
  const chosen = messageId ? items.filter(i => i.answerId === messageId) : items;
  if (!chosen.length) return notFound();

  const title = messageId ? (chosen[0].question.length > 90 ? chosen[0].question.slice(0, 88) + "…" : chosen[0].question) : conv.title;
  const bytes = await buildReport({ title, preparedFor: user.profile.name || user.email, items: chosen, date: new Date() });
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportFileName(title)}"`,
      "Cache-Control": "no-store"
    }
  });
}
