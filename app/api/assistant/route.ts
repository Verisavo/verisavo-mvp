import { after } from "next/server";
import { streamText } from "ai";
import { released } from "@/lib/release";
import { ALL_MARKETS, MARKETS } from "@/lib/markets";
import { getCurrentUser } from "@/lib/server/auth";
import { forbidden, fromOurSite, json, notFound, readJson, tooMany } from "@/lib/server/http";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { consumeMessage, getEntitlements, refundMessage, usageView, type BlockReason, type Entitlements } from "@/lib/server/entitlements";
import { AssistantUnavailable, prepareAnswer, type PreparedAnswer } from "@/lib/server/assistant/answer";
import { ownsConversation, saveAnswer, saveQuestion, undoQuestion } from "@/lib/server/assistant/conversations";
import { ATTACH, bindAttachments, claimAttachments, releaseAttachments } from "@/lib/server/assistant/attachments";
import { describeAiError } from "@/lib/server/ai/providers";

export const maxDuration = 60;   // a long answer from a large model can take a while

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_QUESTION = 1000;   // same as the message box

const blocked = (reason: BlockReason, ent: Entitlements) => json({ error: "limit_reached", reason, usage: usageView(ent) }, 402);
// never err.message: a database error's message would include the user's question
const errorName = (err: unknown) => (err instanceof AssistantUnavailable ? err.message : err instanceof Error ? err.name : "error");

// POST { question, market, requestId, conversationId?, attachmentIds? } (M3.1, M3.4, M3.5, M3.6)
//  -> 402 { error: "limit_reached", reason, usage } when the plan's limit is reached (the model is not called)
//  -> 200 application/x-ndjson, one JSON object per line:
//       { type: "start", conversationId, sources, remaining }, { type: "delta", text }..., then { type: "done", messageId }
//       or { type: "error", message, remaining } (the question is refunded and not saved)
export async function POST(request: Request) {
  if (!released(3)) return notFound();
  if (!fromOurSite(request)) return forbidden();
  const user = await getCurrentUser();
  if (!user) return json({ error: "signed_out" }, 401);

  const body = await readJson(request);
  const question = typeof body?.question === "string" ? body.question.replace(/\u0000/g, "").trim().slice(0, MAX_QUESTION) : "";
  const requestId = typeof body?.requestId === "string" && UUID.test(body.requestId) ? body.requestId : null;
  const rawConv = body?.conversationId ?? null;
  const conversationId = rawConv === null ? null : typeof rawConv === "string" && UUID.test(rawConv) ? rawConv : undefined;
  const market = MARKETS.find(m => m === body?.market) ?? ALL_MARKETS;
  const rawIds = Array.isArray(body?.attachmentIds) ? body.attachmentIds : [];
  const attachmentIds = [...new Set(rawIds.filter((v): v is string => typeof v === "string" && UUID.test(v)))];
  if (!question || !requestId || conversationId === undefined || attachmentIds.length !== rawIds.length || attachmentIds.length > ATTACH.PER_QUESTION) {
    return json({ error: "invalid_request" }, 400);
  }
  if (!(await allow(LIMITS.ask(user.id)))) return tooMany();
  if (conversationId && !(await ownsConversation(user.id, conversationId))) return notFound();

  // paid-only features are refused before anything is counted; files must be the user's own
  if (attachmentIds.length) {
    const ent = await getEntitlements(user.id);
    if (!ent.features.uploads) return blocked("feature_requires_subscription", ent);
    if (!(await claimAttachments(user.id, attachmentIds, conversationId))) return json({ error: "invalid_attachments", message: "One of the files is no longer available. Remove it and attach it again." }, 400);
  }
  const consumed = await consumeMessage(user.id, { channel: "web", externalId: requestId });
  if (!consumed.ok) {
    if (consumed.reason === "duplicate") return json({ error: "duplicate" }, 409);
    return blocked(consumed.reason, await getEntitlements(user.id));
  }

  let prepared: PreparedAnswer;
  try {
    prepared = await prepareAnswer({ userId: user.id, conversationId, question, market, attachmentIds });
  } catch (err) {
    await refundMessage(consumed.usageEventId);
    console.error("[assistant] not ready:", errorName(err));
    return json({ error: "unavailable", message: "The assistant isn't available right now. Your question wasn't counted. Please try again later." }, 503);
  }
  const saved = await saveQuestion({ userId: user.id, conversationId, question, market });
  await bindAttachments(attachmentIds, saved.conversationId, saved.messageId);

  // Stream the answer as it's written. The work runs to the end even if the browser goes away (after() keeps the
  // function alive), so a finished answer is always saved and a failed one always refunded.
  const encoder = new TextEncoder();
  let out!: ReadableStreamDefaultController<Uint8Array>;
  let open = true;
  const stream = new ReadableStream<Uint8Array>({ start(c) { out = c; }, cancel() { open = false; } });
  const send = (line: object) => {
    if (!open) return;
    try { out.enqueue(encoder.encode(JSON.stringify(line) + "\n")); } catch { open = false; }
  };

  const work = (async () => {
    send({ type: "start", conversationId: saved.conversationId, sources: prepared.sources, remaining: consumed.remaining });
    let text = "", failure: unknown = null, usage: { inputTokens?: number; outputTokens?: number } | null = null;
    try {
      const result = streamText({
        model: prepared.model, instructions: prepared.instructions, messages: prepared.messages,
        providerOptions: prepared.providerOptions, maxOutputTokens: prepared.maxOutputTokens
      });
      for await (const part of result.fullStream) {
        if (part.type === "text-delta") { text += part.text; send({ type: "delta", text: part.text }); }
        else if (part.type === "error") { failure = part.error; break; }
      }
      if (!failure) {
        const u = await result.totalUsage;
        usage = { inputTokens: u.inputTokens, outputTokens: u.outputTokens };
      }
    } catch (err) {
      failure = err;
    }
    try {
      if (failure || !text.trim()) {
        console.error("[assistant] answer failed:", errorName(failure), describeAiError(failure));
        await refundMessage(consumed.usageEventId);
        await releaseAttachments(attachmentIds);   // before undoQuestion, which may delete a new conversation and its files
        await undoQuestion(saved);
        send({ type: "error", message: "The assistant couldn't answer just now. Your question wasn't counted. Please try again.", remaining: consumed.remaining + 1 });
      } else {
        const messageId = await saveAnswer({ userId: user.id, conversationId: saved.conversationId, text: text.trim(), sources: prepared.sources, model: prepared.modelName, usage });
        send({ type: "done", messageId });
      }
    } catch (err) {
      console.error("[assistant] saving failed:", errorName(err));
      send({ type: "error", message: "Something went wrong saving this answer. Please try again.", remaining: consumed.remaining });
    } finally {
      if (open) { open = false; try { out.close(); } catch {} }
    }
  })();
  after(() => work);

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
