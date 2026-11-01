"use server";
// Admin actions. Each one checks for an admin itself; never trust that the page was only shown to admins.
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/server/admin";
import { audit } from "@/lib/server/audit";
import { pauseRenewal } from "@/lib/server/billing";
import { cleanText } from "@/lib/server/http";
import { COUNTRY_MARKETS, ALL_MARKETS, GENRES } from "@/lib/markets";
import { ExtractError, extractText, tidyText } from "@/lib/server/rag/extract";
import { archiveDocument, createDocument, publishDocument, reindexStale, restoreDocument, saveDocument, type KbResult } from "@/lib/server/rag/knowledge";
import { searchKnowledge, type KbHit } from "@/lib/server/rag/search";
import { embedQuery } from "@/lib/server/rag/embed";
import { answerSetup, getAiSettings, saveAiSettings, searchSetup } from "@/lib/server/ai/settings";
import { describeAiError, EMBEDDINGS, isEmbedding, isProvider, keySet, languageModel, MODEL_ID, PROVIDERS } from "@/lib/server/ai/providers";
import { generateText } from "ai";
import { resetAllowance } from "@/lib/server/entitlements";

export type ActionState = { ok?: string; error?: string } | null;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toState = (r: KbResult): ActionState => (r.ok ? { ok: r.message } : { error: r.error });
const marketsFrom = (formData: FormData) => formData.getAll("markets").map(String).filter(m => COUNTRY_MARKETS.includes(m));
const genresFrom = (formData: FormData) => formData.getAll("genres").map(String).filter(g => (GENRES as readonly string[]).includes(g));
const MAX_BODY = 500_000;   // characters, about 250 pages of text

// ---------- Users (M2.2) ----------

export async function setUserDisabled(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const disable = formData.get("disable") === "1";
  if (!UUID.test(id) || id === admin.id) return;   // an admin can't lock themselves out
  await db.update(profiles).set({ disabledAt: disable ? new Date() : null, updatedAt: new Date() }).where(eq(profiles.id, id));
  await audit(disable ? "admin.user_disable" : "admin.user_enable", { actorId: admin.id, targetType: "user", targetId: id });
  // a paying user's plan stops renewing while they're disabled (and renews again when re-enabled)
  try {
    await pauseRenewal(id, disable);
  } catch (err) {
    console.error("[admin] couldn't change the user's renewal in Stripe:", err instanceof Error ? err.name : "error");
    await audit("admin.renewal_change_failed", { actorId: admin.id, targetType: "user", targetId: id, metadata: { disable } });
  }
  revalidatePath("/admin/users");
}

// Decision D10: set a user's count for the current period (or their free questions) back to 0
export async function resetUserAllowance(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;
  await resetAllowance(id, admin.id);
  revalidatePath("/admin/users");
}

// ---------- Knowledge base (M2.5–M2.6) ----------

export async function createKbDocument(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const file = formData.get("file");
  const pasted = tidyText(String(formData.get("body") ?? ""));
  let body = pasted, sourceName: string | null = null;
  if (file instanceof File && file.size > 0) {
    try { body = await extractText(file); sourceName = file.name.slice(0, 200); }
    catch (err) {
      if (err instanceof ExtractError) return { error: err.message };
      console.error("[admin/kb] extract failed:", err instanceof Error ? err.message : err);
      return { error: "We couldn't read that file. Try another format, or paste the text instead." };
    }
  }
  if (!body) return { error: sourceName ? "We couldn't find any text in that file. Scanned PDFs have no text: paste it instead." : "Upload a file or paste the document's text." };
  if (body.length > MAX_BODY) return { error: "That document is too long. Split it into smaller documents." };
  const title = cleanText(formData.get("title"), 200) || cleanText(sourceName?.replace(/\.[a-z0-9]+$/i, ""), 200) || "Untitled document";
  const id = await createDocument({ title, body, markets: marketsFrom(formData), genres: genresFrom(formData), sourceName }, admin.id);
  revalidatePath("/admin/knowledge");
  redirect(`/admin/knowledge/${id}?created=1`);
}

export async function saveKbDocument(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "This document no longer exists." };
  const title = cleanText(formData.get("title"), 200);
  const body = tidyText(String(formData.get("body") ?? ""));
  if (!title) return { error: "Give the document a title." };
  if (!body) return { error: "The document needs some text." };
  if (body.length > MAX_BODY) return { error: "That document is too long. Split it into smaller documents." };
  const result = await saveDocument(id, { title, body, markets: marketsFrom(formData), genres: genresFrom(formData) }, admin.id);
  revalidatePath(`/admin/knowledge/${id}`); revalidatePath("/admin/knowledge");
  return toState(result);
}

export async function changeKbStatus(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "This document no longer exists." };
  const op = formData.get("op");
  const result = op === "publish" ? await publishDocument(id, admin.id)
    : op === "archive" ? await archiveDocument(id, admin.id)
    : op === "restore" ? await restoreDocument(id, admin.id)
    : ({ ok: false, error: "Unknown action." } as KbResult);
  revalidatePath(`/admin/knowledge/${id}`); revalidatePath("/admin/knowledge");
  return toState(result);
}

// "Try a question": shows which published sections the assistant would use, so admins can check the knowledge base
export type SearchState = { query: string; hits: KbHit[]; error?: string } | null;
export async function testKbSearch(_state: SearchState, formData: FormData): Promise<SearchState> {
  await requireAdmin();
  const query = cleanText(formData.get("q"), 500);
  const market = String(formData.get("market") ?? ALL_MARKETS);
  if (!query) return { query, hits: [], error: "Type a question first." };
  const { problem } = await searchSetup();
  if (problem) return { query, hits: [], error: problem };
  try {
    return { query, hits: await searchKnowledge(query, { market, limit: 5 }) };
  } catch (err) {
    // not err.message: a database error's message includes the query's parameters (the question and its vector)
    console.error("[admin/kb] search failed:", err instanceof Error ? err.name : "error", (err as { cause?: { code?: string } })?.cause?.code ?? "", describeAiError(err));
    return { query, hits: [], error: `Search failed. ${describeAiError(err)}` };
  }
}

// ---------- AI settings (decision D6): which service answers, which one powers search ----------

export async function saveAnswerSettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const provider = formData.get("provider");
  const model = cleanText(formData.get("model"), 80);
  if (!isProvider(provider)) return { error: "Choose a service." };
  if (!keySet(provider)) return { error: `Add ${PROVIDERS[provider].envKey} in the hosting settings first.` };
  if (!MODEL_ID.test(model)) return { error: "Choose a model, or enter its ID." };
  try {
    await generateText({ model: languageModel(provider, model), prompt: "Reply with the single word OK.", maxOutputTokens: 1000 });
  } catch (err) {
    console.error("[admin/ai] model check failed:", err instanceof Error ? err.name : "error");
    return { error: `Not saved: ${describeAiError(err)}` };
  }
  const before = await getAiSettings();
  await saveAiSettings({ answerProvider: provider, answerModel: model }, admin.id);
  await audit("ai.answers_change", { actorId: admin.id, targetType: "ai_settings", metadata: { from: `${before.answerProvider}/${before.answerModel}`, to: `${provider}/${model}` } });
  revalidatePath("/admin/ai");
  return { ok: `Saved and working. Answers now come from ${PROVIDERS[provider].label}, ${model}.` };
}

const reindexMessage = (r: { done: number; failed: number; left: number }) =>
  r.left ? `${r.done} re-indexed, ${r.left} still to go${r.failed ? ` (${r.failed} failed: see the knowledge base)` : ""}. Press "Continue re-indexing".`
    : `${r.done ? `All ${r.done} published ${r.done === 1 ? "document is" : "documents are"} re-indexed.` : "Nothing needed re-indexing."}`;

export async function saveSearchSettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = formData.get("embedding");
  if (!isEmbedding(id)) return { error: "Choose a search model." };
  const provider = EMBEDDINGS[id].provider;
  if (!keySet(provider)) return { error: `Add ${PROVIDERS[provider].envKey} in the hosting settings first.` };
  const before = await getAiSettings();
  if (before.saved && before.embeddingId === id) return { ok: "That's already the search model." };
  try {
    await embedQuery(id, "Test question about Lagos retail prices");
  } catch (err) {
    console.error("[admin/ai] search model check failed:", err instanceof Error ? err.name : "error");
    return { error: `Not saved: ${describeAiError(err)}` };
  }
  await saveAiSettings({ embeddingId: id }, admin.id);
  await audit("ai.search_change", { actorId: admin.id, targetType: "ai_settings", metadata: { from: before.embeddingId, to: id } });
  const result = await reindexStale(admin.id);
  revalidatePath("/admin/ai"); revalidatePath("/admin/knowledge");
  return { ok: `Saved. Search now uses ${EMBEDDINGS[id].label}. ${reindexMessage(result)}` };
}

export async function continueReindex(_state: ActionState): Promise<ActionState> {
  const admin = await requireAdmin();
  const { problem } = await searchSetup();
  if (problem) return { error: problem };
  const result = await reindexStale(admin.id);
  revalidatePath("/admin/ai"); revalidatePath("/admin/knowledge");
  return { ok: reindexMessage(result) };
}

// "Test": one tiny request with the saved choice, so an admin sees straight away whether the key and model work
export async function testAnswers(_state: ActionState): Promise<ActionState> {
  await requireAdmin();
  const setup = await answerSetup();
  if (!setup.ok) return { error: setup.problem };
  const started = Date.now();
  try {
    const { text } = await generateText({ model: setup.model, prompt: "Reply with the single word OK.", maxOutputTokens: 1000 });
    return { ok: `Working: ${setup.label} ${setup.modelId} replied${text.trim() ? ` "${text.trim().slice(0, 40)}"` : ""} in ${Date.now() - started} ms.` };
  } catch (err) {
    console.error("[admin/ai] answer test failed:", err instanceof Error ? err.message : err);
    return { error: describeAiError(err) };
  }
}

export async function testSearch(_state: ActionState): Promise<ActionState> {
  await requireAdmin();
  const { id, problem } = await searchSetup();
  if (problem) return { error: problem };
  const started = Date.now();
  try {
    const vector = await embedQuery(id, "Test question about Lagos retail prices");
    if (vector.length !== 1536) return { error: `${EMBEDDINGS[id].label} returned ${vector.length} numbers instead of 1536.` };
    return { ok: `Working: ${EMBEDDINGS[id].label} answered in ${Date.now() - started} ms.` };
  } catch (err) {
    console.error("[admin/ai] search test failed:", err instanceof Error ? err.message : err);
    return { error: describeAiError(err) };
  }
}
