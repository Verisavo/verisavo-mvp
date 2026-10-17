import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { conversations, messages } from "@/db/schema";
import { audit } from "@/lib/server/audit";
import type { Source } from "./answer";
import { attachmentNamesByMessage } from "./attachments";

// Conversations and their messages (M3.1). Every read and write is scoped to the signed-in user's id.

export type ConversationSummary = { id: string; title: string; updatedAt: Date };
export type StoredMessage = { id: string; role: "user" | "assistant"; channel: "web" | "whatsapp"; content: string; market: string | null; sources: Source[] | null; createdAt: Date };

const titleFrom = (question: string) => (question.length > 60 ? question.slice(0, 58).trimEnd() + "…" : question);

export async function listConversations(userId: string, limit = 50): Promise<ConversationSummary[]> {
  return db.select({ id: conversations.id, title: conversations.title, updatedAt: conversations.updatedAt })
    .from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt)).limit(limit);
}

export async function ownsConversation(userId: string, id: string): Promise<boolean> {
  const [row] = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, userId))).limit(1);
  return Boolean(row);
}

// Decision D5: a WhatsApp message continues the conversation the user was active in during the last 30 minutes
// (on either channel); otherwise it starts a new one
export async function activeConversation(userId: string, minutes = 30): Promise<string | null> {
  const [conv] = await db.select({ id: conversations.id }).from(conversations)
    .where(and(eq(conversations.userId, userId), sql`${conversations.updatedAt} > now() - make_interval(mins => ${minutes})`))
    .orderBy(desc(conversations.updatedAt)).limit(1);
  return conv?.id ?? null;
}

export async function getConversation(userId: string, id: string) {
  const [conv] = await db.select({ id: conversations.id, title: conversations.title }).from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId))).limit(1);
  if (!conv) return null;
  const [rows, files] = await Promise.all([
    db.select({ id: messages.id, role: messages.role, channel: messages.channel, content: messages.content, market: messages.market, sources: messages.sources, createdAt: messages.createdAt })
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
