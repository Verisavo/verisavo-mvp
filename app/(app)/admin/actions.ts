"use server";
// Admin actions. Each one checks for an admin itself; never trust that the page was only shown to admins.
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/server/admin";
import { audit } from "@/lib/server/audit";
import { cleanText } from "@/lib/server/http";
import { COUNTRY_MARKETS, ALL_MARKETS } from "@/lib/markets";
import { ExtractError, extractText, tidyText } from "@/lib/server/rag/extract";
import { archiveDocument, createDocument, publishDocument, restoreDocument, saveDocument, type KbResult } from "@/lib/server/rag/knowledge";
import { searchKnowledge, type KbHit } from "@/lib/server/rag/search";
import { aiConfigured } from "@/lib/server/rag/embed";

export type ActionState = { ok?: string; error?: string } | null;
const UUID = /^[0-9a-f-]{36}$/i;
const toState = (r: KbResult): ActionState => (r.ok ? { ok: r.message } : { error: r.error });
const marketsFrom = (formData: FormData) => formData.getAll("markets").map(String).filter(m => COUNTRY_MARKETS.includes(m));
const MAX_BODY = 500_000;   // characters, about 250 pages of text

// ---------- Users (M2.2) ----------

export async function setUserDisabled(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const disable = formData.get("disable") === "1";
  if (!UUID.test(id) || id === admin.id) return;   // an admin can't lock themselves out
  await db.update(profiles).set({ disabledAt: disable ? new Date() : null, updatedAt: new Date() }).where(eq(profiles.id, id));
  await audit(disable ? "admin.user_disable" : "admin.user_enable", { actorId: admin.id, targetType: "user", targetId: id });
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
  if (!body) return { error: "Upload a file or paste the document's text." };
  if (body.length > MAX_BODY) return { error: "That document is too long. Split it into smaller documents." };
  const title = cleanText(formData.get("title"), 200) || cleanText(sourceName?.replace(/\.[a-z0-9]+$/i, ""), 200) || "Untitled document";
  const id = await createDocument({ title, body, markets: marketsFrom(formData), sourceName }, admin.id);
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
  const result = await saveDocument(id, { title, body, markets: marketsFrom(formData) }, admin.id);
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
  if (!aiConfigured()) return { query, hits: [], error: "The AI service isn't set up yet (OPENAI_API_KEY)." };
  try {
    return { query, hits: await searchKnowledge(query, { market, limit: 5 }) };
  } catch (err) {
    console.error("[admin/kb] search failed:", err instanceof Error ? err.message : err);
    return { query, hits: [], error: "Search failed. Please try again." };
  }
}
