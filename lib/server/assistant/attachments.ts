import "server-only";
import { and, asc, desc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { attachments } from "@/db/schema";
import { ATTACHMENT_ACCEPT, ExtractError, extractText, KB_MAX_BYTES } from "@/lib/server/rag/extract";

// M3.6: files and images a paid user attaches to their questions. Each file is uploaded on its own (the platform caps
// one request at about 4.5 MB), stored for that user only, and used as context in that conversation. They never go
// into the knowledge base. Limits are enforced here, whatever the browser says.

export const ATTACH = {
  MAX_BYTES: KB_MAX_BYTES,     // 4 MB per file
  PER_QUESTION: 5,
  STORED_CHARS: 60_000,        // text kept per document
  PROMPT_CHARS: 40_000,        // text from a conversation's documents in one prompt, newest first
  PROMPT_IMAGES: 4             // newest images in one prompt
};

export type AttachmentSummary = { id: string; kind: "document" | "image"; name: string; size: number; truncated: boolean };
export class AttachmentError extends Error {}

// Images are recognised by their first bytes, never by the name or the type the browser reports
function imageType(b: Uint8Array): string | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image/gif";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}
const IMAGE_EXT = /\.(png|jpe?g|gif|webp)$/i;
const cleanName = (name: string) => (name.replace(/[\u0000-\u001f\u007f<>"]/g, "").trim() || "file").slice(0, 120);

export async function saveAttachment(userId: string, file: File): Promise<AttachmentSummary> {
  if (file.size > ATTACH.MAX_BYTES) throw new AttachmentError("That file is larger than 4 MB.");
  if (file.size === 0) throw new AttachmentError("That file is empty.");
  // unsent uploads older than a day are removed whenever the same user uploads again
  await db.delete(attachments).where(and(eq(attachments.userId, userId), isNull(attachments.conversationId), lt(attachments.createdAt, sql`now() - interval '1 day'`)));

  const name = cleanName(file.name);
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const image = imageType(head);
  if (image || IMAGE_EXT.test(name)) {
    if (!image) throw new AttachmentError("That image couldn't be read. Use a PNG, JPEG, WebP or GIF.");
    const data = Buffer.from(await file.arrayBuffer());
    const [row] = await db.insert(attachments).values({ userId, kind: "image", name, mediaType: image, size: file.size, data }).returning({ id: attachments.id });
    return { id: row.id, kind: "image", name, size: file.size, truncated: false };
  }
  let text: string;
  try {
    text = await extractText(file, ATTACHMENT_ACCEPT);
  } catch (err) {
    if (err instanceof ExtractError) throw new AttachmentError(err.message);
    throw new AttachmentError("That file couldn't be read. Try another format, or paste the text into your question.");
  }
  if (!text) throw new AttachmentError("There's no text in that file (a scanned PDF has none). Paste the text instead.");
  const truncated = text.length > ATTACH.STORED_CHARS;
  const [row] = await db.insert(attachments).values({
    userId, kind: "document", name, mediaType: file.type.slice(0, 100) || "application/octet-stream", size: file.size, text: text.slice(0, ATTACH.STORED_CHARS)
  }).returning({ id: attachments.id });
  return { id: row.id, kind: "document", name, size: file.size, truncated };
}

// The user's own uploads that are unsent, or already in this conversation. Anything else (another user's id, a file
// from another conversation) makes the whole request invalid.
export async function claimAttachments(userId: string, ids: string[], conversationId: string | null): Promise<string[] | null> {
  if (!ids.length) return [];
  const rows = await db.select({ id: attachments.id }).from(attachments).where(and(
    inArray(attachments.id, ids), eq(attachments.userId, userId),
    conversationId ? or(isNull(attachments.conversationId), eq(attachments.conversationId, conversationId)) : isNull(attachments.conversationId)
  ));
  return rows.length === new Set(ids).size ? rows.map(r => r.id) : null;
}

export async function bindAttachments(ids: string[], conversationId: string, messageId: string): Promise<void> {
  if (!ids.length) return;
  await db.update(attachments).set({ conversationId, messageId }).where(and(inArray(attachments.id, ids), isNull(attachments.messageId)));
}

// The question failed: the files go back to unsent, so they can be sent again
export async function releaseAttachments(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await db.update(attachments).set({ conversationId: null, messageId: null }).where(inArray(attachments.id, ids));
}

export async function deleteUnsentAttachment(userId: string, id: string): Promise<boolean> {
  const removed = await db.delete(attachments).where(and(eq(attachments.id, id), eq(attachments.userId, userId), isNull(attachments.conversationId))).returning({ id: attachments.id });
  return removed.length > 0;
}

export type PromptAttachments = { documents: { name: string; text: string }[]; images: { name: string; data: Buffer; mediaType: string }[]; names: string[] };

// What the model sees: the conversation's files plus the ones sent with this question, newest first within the budgets
export async function attachmentsForPrompt(userId: string, conversationId: string | null, newIds: string[]): Promise<PromptAttachments> {
  const scope = conversationId ? or(eq(attachments.conversationId, conversationId), inArray(attachments.id, newIds)) : inArray(attachments.id, newIds);
  const rows = await db.select().from(attachments).where(and(eq(attachments.userId, userId), scope)).orderBy(desc(attachments.createdAt)).limit(40);
  const out: PromptAttachments = { documents: [], images: [], names: [] };
  let budget = ATTACH.PROMPT_CHARS;
  for (const r of rows) {
    if (r.kind === "image" && r.data && out.images.length < ATTACH.PROMPT_IMAGES) { out.images.push({ name: r.name, data: r.data, mediaType: r.mediaType }); out.names.push(r.name); }
    if (r.kind === "document" && r.text && budget > 500) {
      const text = r.text.length > budget ? r.text.slice(0, budget) + "\n[…the rest of this file was left out]" : r.text;
      budget -= text.length;
      out.documents.push({ name: r.name, text });
      out.names.push(r.name);
    }
  }
  out.documents.reverse(); out.images.reverse();   // oldest first reads more naturally
  return out;
}

// For showing which files came with each question when a conversation is reopened
export async function attachmentNamesByMessage(conversationId: string): Promise<Map<string, string[]>> {
  const rows = await db.select({ messageId: attachments.messageId, name: attachments.name }).from(attachments)
    .where(eq(attachments.conversationId, conversationId)).orderBy(asc(attachments.createdAt));
  const map = new Map<string, string[]>();
  for (const r of rows) if (r.messageId) map.set(r.messageId, [...(map.get(r.messageId) ?? []), r.name]);
  return map;
}
