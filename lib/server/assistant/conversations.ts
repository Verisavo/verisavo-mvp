import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { conversations, messages } from "@/db/schema";
import { audit } from "@/lib/server/audit";
import type { Source } from "./answer";
import { attachmentNamesByMessage } from "./attachments";

// Conversations and their messages (M3.1). Every read and write is scoped to the signed-in user's id.

export type ConversationSummary = { id: string; title: string; updatedAt: Date };
export type StoredMessage = { id: string; role: "user" | "assistant"; content: string; market: string | null; sources: Source[] | null; createdAt: Date };

const titleFrom = (question: string) => (question.length > 60 ? question.slice(0, 58).trimEnd() + "…" : question);

export async function listConversations(userId: string, limit = 50): Promise<ConversationSummary[]> {
  return db.select({ id: conversations.id, title: conversations.title, updatedAt: conversations.updatedAt })
    .from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt)).limit(limit);
}

export const CONVERSATIONS_PER_PAGE = 20;
export type ConversationFilters = { q?: string; who?: string; from?: string; to?: string };
export type ConversationRow = { id: string; title: string; created_at: string; updated_at: string; questions: number; name: string | null; email: string | null };
const like = (s: string) => `%${s.replace(/[\\%_]/g, c => "\\" + c)}%`;

// The conversation tables. ownerId limits it to one user: their own list always passes it. Only the admin list leaves it
// out (requireAdmin runs on those pages). Dates arrive already checked as YYYY-MM-DD (ConversationViews.tsx).
export async function searchConversations({ q = "", who = "", from = "", to = "" }: ConversationFilters, page: number, ownerId?: string) {
  const conditions = [sql`true`];
  if (ownerId) conditions.push(sql`c.user_id = ${ownerId}`);
  if (q) conditions.push(sql`c.title ilike ${like(q)}`);
  if (who && !ownerId) conditions.push(sql`(u.email ilike ${like(who)} or p.name ilike ${like(who)})`);
  if (from) conditions.push(sql`c.updated_at >= ${from}::date`);
  if (to) conditions.push(sql`c.updated_at < ${to}::date + 1`);
  const where = sql.join(conditions, sql` and `);
  const joins = sql`from conversations c join auth.users u on u.id = c.user_id left join profiles p on p.id = c.user_id`;
  const [{ total }] = await db.execute<{ total: number }>(sql`select count(*)::int as total ${joins} where ${where}`);
  const current = Math.min(page, Math.max(1, Math.ceil(total / CONVERSATIONS_PER_PAGE)));
  const rows = await db.execute<ConversationRow>(sql`
    select c.id, c.title, c.created_at, c.updated_at, p.name, u.email,
           (select count(*) from messages m where m.conversation_id = c.id and m.role = 'user')::int as questions
    ${joins} where ${where}
    order by c.updated_at desc
    limit ${CONVERSATIONS_PER_PAGE} offset ${(current - 1) * CONVERSATIONS_PER_PAGE}`);
  return { rows: [...rows], total, page: current };
}

// An admin reading someone's chat. Each opening goes in the activity log, naming the person whose chat it was.
export async function readConversationAsAdmin(id: string, adminId: string) {
  const [owner] = await db.execute<{ id: string; name: string | null; email: string | null }>(sql`
    select c.user_id as id, p.name, u.email from conversations c join auth.users u on u.id = c.user_id left join profiles p on p.id = c.user_id where c.id = ${id}`);
  if (!owner) return null;
  const conv = await getConversation(owner.id, id);
  if (!conv) return null;
  await audit("admin.conversation_view", { actorId: adminId, targetType: "user", targetId: owner.id, metadata: { conversationId: id } });
  return { ...conv, owner };
}

export async function ownsConversation(userId: string, id: string): Promise<boolean> {
  const [row] = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, userId))).limit(1);
  return Boolean(row);
}

export async function getConversation(userId: string, id: string) {
  const [conv] = await db.select({ id: conversations.id, title: conversations.title }).from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId))).limit(1);
  if (!conv) return null;
  const [rows, files] = await Promise.all([
    db.select({ id: messages.id, role: messages.role, content: messages.content, market: messages.market, sources: messages.sources, createdAt: messages.createdAt })
      .from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt)).limit(400),
    attachmentNamesByMessage(id)
  ]);
  return { ...conv, messages: (rows as StoredMessage[]).map(m => ({ ...m, files: files.get(m.id) ?? [] })) };
}

// Saves the question before the model runs (a new conversation is created for the first question)
export async function saveQuestion({ userId, conversationId, question, market, channel = "web" }:
  { userId: string; conversationId: string | null; question: string; market: string; channel?: "web" | "whatsapp" }) {
  return db.transaction(async tx => {
    let id = conversationId;
    if (!id) [{ id }] = await tx.insert(conversations).values({ userId, title: titleFrom(question) }).returning({ id: conversations.id });
    const [msg] = await tx.insert(messages).values({ conversationId: id, userId, role: "user", channel, content: question, market }).returning({ id: messages.id });
    return { conversationId: id, messageId: msg.id, created: !conversationId };
  });
}

export async function saveAnswer({ userId, conversationId, text, sources, model, usage, channel = "web" }:
  { userId: string; conversationId: string; text: string; sources: Source[]; model: string; usage: { inputTokens?: number; outputTokens?: number } | null; channel?: "web" | "whatsapp" }): Promise<string> {
  return db.transaction(async tx => {
    const [msg] = await tx.insert(messages).values({ conversationId, userId, role: "assistant", channel, content: text, sources, model, usage }).returning({ id: messages.id });
    await tx.update(conversations).set({ updatedAt: sql`now()` }).where(eq(conversations.id, conversationId));
    return msg.id;
  });
}

// The model failed: take the question back out, so the conversation doesn't show a question with no answer
export async function undoQuestion({ conversationId, messageId, created }: { conversationId: string; messageId: string; created: boolean }) {
  if (created) await db.delete(conversations).where(eq(conversations.id, conversationId));
  else await db.delete(messages).where(eq(messages.id, messageId));
}

export async function renameConversation(userId: string, id: string, title: string): Promise<boolean> {
  const renamed = await db.update(conversations).set({ title }).where(and(eq(conversations.id, id), eq(conversations.userId, userId))).returning({ id: conversations.id });
  if (renamed.length) await audit("conversation.rename", { actorId: userId, targetType: "conversation", targetId: id });
  return renamed.length > 0;
}

export async function deleteConversation(userId: string, id: string): Promise<boolean> {
  const removed = await db.delete(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, userId))).returning({ id: conversations.id });
  if (removed.length) await audit("conversation.delete", { actorId: userId, targetType: "conversation", targetId: id });
  return removed.length > 0;
}

export async function deleteAllConversations(userId: string): Promise<number> {
  const removed = await db.delete(conversations).where(eq(conversations.userId, userId)).returning({ id: conversations.id });
  if (removed.length) await audit("conversation.delete_all", { actorId: userId, targetType: "conversation", metadata: { count: removed.length } });
  return removed.length;
}
