import "server-only";
import { eq, lt, sql } from "drizzle-orm";
import { generateText } from "ai";
import { db } from "@/lib/server/db";
import { profiles, whatsappSeen } from "@/db/schema";
import { ALL_MARKETS } from "@/lib/markets";
import { PLAN } from "@/lib/plan";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { consumeMessage, getEntitlements, refundMessage } from "@/lib/server/entitlements";
import { AssistantUnavailable, prepareAnswer } from "@/lib/server/assistant/answer";
import { activeConversation, saveAnswer, saveQuestion, undoQuestion } from "@/lib/server/assistant/conversations";
import { AttachmentError, bindAttachments, recentUnsentIds, releaseAttachments, saveAttachment } from "@/lib/server/assistant/attachments";
import { describeAiError } from "@/lib/server/ai/providers";
import { downloadMedia, markRead, sendText } from "./api";
import { unlink, unlinkPhone, userForPhone, verifyFromPhone } from "./links";

// Incoming WhatsApp messages (M4.1–M4.5). Channel work only: dedupe, find the user, check the plan, read media, format
// the reply. Counting, the knowledge base and the model are the same shared modules the web assistant uses.

type Media = { id: string; mime_type?: string; caption?: string; filename?: string };
type Inbound = { id?: string; from?: string; timestamp?: string; type?: string; text?: { body?: string }; image?: Media; document?: Media; system?: { type?: string } };
const MAX_AGE_SECONDS = 6 * 24 * 3600;   // older messages are replays (Meta retries for up to a week; seen ids are kept a week)
const ANSWER_TIMEOUT_MS = 75_000;          // fail (and refund) well inside the webhook's time limit

const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const errorName = (err: unknown) => (err instanceof AssistantUnavailable ? err.message : err instanceof Error ? err.name : "error");

// Everything the WhatsApp side says, in one place
export const WA = {
  unlinked: () => `Hi, this is Verisavo, market intelligence for African markets. This number isn't linked to a Verisavo account yet. To ask questions here, subscribe and link your number in your dashboard: ${appUrl()}/dashboard#whatsapp`,
  notPaid: () => `WhatsApp is part of Verisavo Monthly (${PLAN.PRICE_TEXT}): ${PLAN.PAID_MESSAGES_PER_PERIOD} messages a month across web and WhatsApp. Subscribe in your dashboard: ${appUrl()}/dashboard#plan`,
  disabled: "This Verisavo account is disabled. Please contact Verisavo.",
  unsupported: "I can read text messages, images and documents. Please send your question as text.",
  limit: (resets: Date | null) => `You've used all ${PLAN.PAID_MESSAGES_PER_PERIOD} messages for this month.${resets ? ` They reset on ${resets.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.` : ""} Your past answers are at ${appUrl()}/assistant`,
  sorry: "Sorry, I couldn't answer just now. Your question wasn't counted. Please try again in a moment.",
  unlinkedOk: "This number is no longer linked to Verisavo. To link it again, use your dashboard.",
  notLinked: "This number isn't linked to a Verisavo account.",
  fileKept: (name: string) => `Got ${name}. What would you like to know about it?`,
  fileFailed: () => `I couldn't open that file. Please try again, or upload it on the web: ${appUrl()}/assistant`,
  empty: "I couldn't put an answer together for that. Please rephrase your question or ask about something more specific."
};

// The assistant writes plain text with "- " lists and a "Sources:" line; WhatsApp shows • bullets and _italics_
export const toWhatsApp = (text: string) => text.split("\n").map(line => {
  if (/^\s*[-*]\s+/.test(line)) return line.replace(/^\s*[-*]\s+/, "• ");
  if (/^Sources:/i.test(line)) return `_${line.replace(/_/g, "")}_`;
  return line;
}).join("\n");

export async function handleWebhook(payload: unknown): Promise<void> {
  const ours = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const entries = (payload as { entry?: { changes?: { field?: string; value?: { metadata?: { phone_number_id?: string }; messages?: Inbound[] } }[] }[] })?.entry ?? [];
  for (const entry of entries.slice(0, 20)) {
    for (const change of (entry.changes ?? []).slice(0, 20)) {
      if (change.field !== "messages") continue;
      // only messages to Verisavo's own number (another number on the same Meta app is not ours to answer)
      if (ours && change.value?.metadata?.phone_number_id !== ours) continue;
      // status updates (delivered, read) for messages we sent have no "messages" array and are ignored
      for (const message of (change.value?.messages ?? []).slice(0, 20)) {
        try { await handleMessage(message); }
        catch (err) { console.error("[whatsapp] message failed:", errorName(err)); }
      }
    }
  }
}

async function handleMessage(m: Inbound): Promise<void> {
  if (!m.id || !m.from || !/^\d{8,15}$/.test(m.from)) return;
  if (Number(m.timestamp) && Date.now() / 1000 - Number(m.timestamp) > MAX_AGE_SECONDS) return;
  // Meta redelivers webhooks: each message id is handled once, whatever it is
  const [fresh] = await db.insert(whatsappSeen).values({ id: m.id.slice(0, 200) }).onConflictDoNothing().returning({ id: whatsappSeen.id });
  if (!fresh) return;
  if (Math.random() < 0.02) void db.delete(whatsappSeen).where(lt(whatsappSeen.receivedAt, sql`now() - interval '7 days'`)).catch(() => {});
  const phone = m.from;
  // a burst from one number (spam, a loop) is dropped quietly after 30 messages an hour
  if (!(await allow(LIMITS.whatsappIn(phone)))) return;

  const media = m.type === "image" ? m.image : m.type === "document" ? m.document : undefined;
  const text = (m.type === "text" ? m.text?.body ?? "" : media?.caption ?? "").replace(/\u0000/g, "").trim();

  // WhatsApp says this number moved to a new one: the old number may go to someone else, so the link is removed
  if (m.type === "system" && m.system?.type === "user_changed_number") { await unlinkPhone(phone, "number_changed"); return; }

  // "LINK 123456" from the dashboard's fallback linking (decision D13); "UNLINK" lets the phone's owner undo a link
  const linkCode = m.type === "text" ? /^link\s+(\d{6})$/i.exec(text)?.[1] : undefined;
  if (linkCode) {
    const r = await verifyFromPhone(phone, linkCode);
    await sendText(phone, r.ok ? r.reply : r.error);
    return;
  }
  if (m.type === "text" && /^unlink$/i.test(text)) {
    const owner = await userForPhone(phone);
    await sendText(phone, owner && (await unlink(owner, { actorId: owner, reason: "whatsapp" })) ? WA.unlinkedOk : WA.notLinked);
    return;
  }

  // M4.3: unlinked and unpaid numbers get a helpful reply with a link, not an answer
  const userId = await userForPhone(phone);
  if (!userId) { await sendText(phone, WA.unlinked()); return; }
  const [profile] = await db.select({ disabledAt: profiles.disabledAt }).from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (!profile || profile.disabledAt) { await sendText(phone, WA.disabled); return; }
  const ent = await getEntitlements(userId);
  if (!ent.features.whatsapp) { await sendText(phone, WA.notPaid()); return; }
  if (m.type !== "text" && !media) { await sendText(phone, WA.unsupported); return; }   // audio, stickers, locations…

  void markRead(m.id);
  let fileIds: string[] = [];
  if (media) {   // paid only, same types and limits as web uploads (M3.6)
    const file = await downloadMedia(media.id);
    if ("error" in file) { console.error("[whatsapp] media download failed:", file.error); await sendText(phone, WA.fileFailed()); return; }
    const ext = (file.mimeType.split("/")[1] ?? "bin").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "").slice(0, 5);
    const name = media.filename || `whatsapp-${m.type}.${ext}`;
    try { fileIds = [(await saveAttachment(userId, new File([file.bytes], name, { type: file.mimeType }))).id]; }
    catch (err) { await sendText(phone, err instanceof AttachmentError ? err.message : WA.fileFailed()); return; }
    if (!text) { await sendText(phone, WA.fileKept(name)); return; }   // kept for the next question; not counted
  }
  if (!text) return;

  // M4.5: the same counter as the web; the message id makes Meta's retries count once
  const consumed = await consumeMessage(userId, { channel: "whatsapp", externalId: m.id });
  if (!consumed.ok) {
    if (consumed.reason !== "duplicate") await sendText(phone, WA.limit(ent.resetsAt));
    return;
  }

  const question = text.slice(0, 1000);
  let prepared, saved, bound: string[] = [];
  try {
    // M4.4 / decision D5: continue the conversation active in the last 30 minutes, on either channel
    const conversationId = await activeConversation(userId);
    const attachmentIds = [...new Set([...fileIds, ...(await recentUnsentIds(userId))])];
    prepared = await prepareAnswer({ userId, conversationId, question, market: ALL_MARKETS, attachmentIds, withFiles: true, channel: "whatsapp" });
    saved = await saveQuestion({ userId, conversationId, question, market: ALL_MARKETS, channel: "whatsapp" });
    bound = await bindAttachments(attachmentIds, saved.conversationId, saved.messageId);
  } catch (err) {
    await refundMessage(consumed.usageEventId);
    console.error("[whatsapp] not ready:", errorName(err));
    await sendText(phone, WA.sorry);
    return;
  }

  let answer: string;
  let usage: { inputTokens?: number; outputTokens?: number } | null = null;
  try {
    const result = await generateText({
      model: prepared.model, instructions: prepared.instructions, messages: prepared.messages,
      providerOptions: prepared.providerOptions, maxOutputTokens: prepared.maxOutputTokens,
      abortSignal: AbortSignal.timeout(ANSWER_TIMEOUT_MS)
    });
    answer = result.text.trim() || WA.empty;
    usage = { inputTokens: result.totalUsage.inputTokens, outputTokens: result.totalUsage.outputTokens };
  } catch (err) {   // only a provider error is refunded (decision D4)
    console.error("[whatsapp] answer failed:", errorName(err), describeAiError(err));
    await refundMessage(consumed.usageEventId);
    await releaseAttachments(bound);
    await undoQuestion(saved);
    await sendText(phone, WA.sorry);
    return;
  }
  await saveAnswer({ userId, conversationId: saved.conversationId, text: answer, sources: prepared.sources, model: prepared.modelName, usage, channel: "whatsapp" });
  await sendText(phone, toWhatsApp(answer));
}
