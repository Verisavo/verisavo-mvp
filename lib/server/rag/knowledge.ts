import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { kbChunks, kbDocuments, kbVersions } from "@/db/schema";
import { audit } from "@/lib/server/audit";
import { saveAiSettings, searchSetup } from "@/lib/server/ai/settings";
import { describeAiError, type EmbeddingId } from "@/lib/server/ai/providers";
import { chunkText } from "./chunk";
import { embedTexts } from "./embed";

// The knowledge base's lifecycle (M2.5–M2.6): draft → published → archived.
// Only published documents have chunks, so search can never return a draft or an archived document.
export type KbResult = { ok: true; message: string } | { ok: false; error: string };

type Fields = { title: string; body: string; markets: string[]; genres: string[] };

async function getDocument(id: string) {
  const [doc] = await db.select().from(kbDocuments).where(eq(kbDocuments.id, id)).limit(1);
  return doc ?? null;
}

export async function createDocument(fields: Fields & { sourceName?: string | null }, actorId: string): Promise<string> {
  const id = await db.transaction(async tx => {
    const [doc] = await tx.insert(kbDocuments).values({ title: fields.title, markets: fields.markets, genres: fields.genres, sourceName: fields.sourceName ?? null, createdBy: actorId }).returning({ id: kbDocuments.id });
    const [ver] = await tx.insert(kbVersions).values({ documentId: doc.id, body: fields.body, createdBy: actorId }).returning({ id: kbVersions.id });
    await tx.update(kbDocuments).set({ currentVersionId: ver.id }).where(eq(kbDocuments.id, doc.id));
    return doc.id;
  });
  await audit("kb.create", { actorId, targetType: "kb_document", targetId: id, metadata: { title: fields.title, source: fields.sourceName ?? "pasted" } });
  return id;
}

// An edit becomes a new version. A published document is published again, so search uses the new text straight away.
export async function saveDocument(id: string, fields: Fields, actorId: string): Promise<KbResult> {
  const doc = await getDocument(id);
  if (!doc) return { ok: false, error: "This document no longer exists." };
  const [current] = doc.currentVersionId ? await db.select().from(kbVersions).where(eq(kbVersions.id, doc.currentVersionId)).limit(1) : [];
  await db.transaction(async tx => {
    let versionId = doc.currentVersionId;
    if (!current || current.body !== fields.body) {
      const [ver] = await tx.insert(kbVersions).values({ documentId: id, body: fields.body, createdBy: actorId }).returning({ id: kbVersions.id });
      versionId = ver.id;
    }
    await tx.update(kbDocuments).set({ title: fields.title, markets: fields.markets, genres: fields.genres, currentVersionId: versionId, updatedAt: new Date() }).where(eq(kbDocuments.id, id));
  });
  await audit("kb.update", { actorId, targetType: "kb_document", targetId: id });
  if (doc.status !== "published") return { ok: true, message: "Saved." };
  const published = await publishDocument(id, actorId);
  return published.ok ? { ok: true, message: "Saved, and search now uses the new version." } : { ok: false, error: `Saved, but search still uses the previous version: ${published.error}` };
}

// Chunk and embed the current version, then swap its chunks in, in one transaction (search never sees half a document)
export async function publishDocument(id: string, actorId: string, action = "kb.publish"): Promise<KbResult> {
  const doc = await getDocument(id);
  if (!doc || !doc.currentVersionId) return { ok: false, error: "This document no longer exists." };
  if (doc.status === "archived") return { ok: false, error: "This document is archived. Restore it before publishing." };
  const search = await searchSetup();
  if (search.problem) return { ok: false, error: `${search.problem} Documents can't be published until it is (see AI settings).` };
  if (!search.saved) await saveAiSettings({}, actorId);   // pin the automatic choice once something is indexed with it
  const [version] = await db.select().from(kbVersions).where(eq(kbVersions.id, doc.currentVersionId)).limit(1);
  const pieces = chunkText(doc.title, version?.body ?? "");
  if (!pieces.length) return { ok: false, error: "The document has no text to publish." };

  let vectors: number[][];
  try {
    vectors = await embedTexts(search.id, pieces);
  } catch (err) {
    console.error("[kb/publish] embedding failed:", err instanceof Error ? err.message : err);
    await db.update(kbDocuments).set({ embedError: describeAiError(err), updatedAt: new Date() }).where(eq(kbDocuments.id, id));
    return { ok: false, error: "The AI service couldn't process the document. Please try again in a moment." };
  }

  const swapped = await db.transaction(async tx => {
    // Lock the document so publishes and archives of it run one at a time, then check nothing changed while the
    // embeddings were being made (archived, or edited to a newer version that another publish is handling).
    const [now] = await tx.select({ status: kbDocuments.status, versionId: kbDocuments.currentVersionId, markets: kbDocuments.markets })
      .from(kbDocuments).where(eq(kbDocuments.id, id)).for("update");
    if (!now || now.status === "archived" || now.versionId !== version.id) return false;
    await tx.delete(kbChunks).where(eq(kbChunks.documentId, id));
    for (let i = 0; i < pieces.length; i += 100) {
      await tx.insert(kbChunks).values(pieces.slice(i, i + 100).map((content, k) => ({
        documentId: id, versionId: version.id, chunkIndex: i + k, content, markets: now.markets, embedding: vectors[i + k], embeddingModel: search.id
      })));
    }
    await tx.update(kbDocuments).set({ status: "published", publishedAt: new Date(), archivedAt: null, chunkCount: pieces.length, embedError: null, updatedAt: new Date() }).where(eq(kbDocuments.id, id));
    return true;
  });
  if (!swapped) return { ok: false, error: "The document changed while it was being published (edited or archived). Reload the page and try again." };
  await audit(action,{ actorId, targetType: "kb_document", targetId: id, metadata: { chunks: pieces.length, version: version.id, embeddings: search.id } });
  return { ok: true, message: `Published: ${pieces.length} ${pieces.length === 1 ? "section is" : "sections are"} now searchable.` };
}

// Published documents still indexed with another embedding model. Search skips them until they're re-indexed.
export async function staleDocumentIds(current: EmbeddingId): Promise<string[]> {
  const rows = await db.selectDistinct({ id: kbChunks.documentId }).from(kbChunks).where(ne(kbChunks.embeddingModel, current));
  return rows.map(r => r.id);
}

// After the search service changes: re-index stale documents until the time budget runs out (one request stays well
// inside the page's 60-second limit); the admin presses "Continue" for the rest.
export async function reindexStale(actorId: string, budgetMs = 40_000): Promise<{ done: number; failed: number; left: number }> {
  const { id, problem } = await searchSetup();
  if (problem) return { done: 0, failed: 0, left: (await staleDocumentIds(id)).length };
  const started = Date.now();
  let done = 0, failed = 0;
  for (const docId of await staleDocumentIds(id)) {
    if (Date.now() - started > budgetMs) break;
    if ((await publishDocument(docId, actorId, "kb.reindex")).ok) done++; else failed++;
  }
  return { done, failed, left: (await staleDocumentIds(id)).length };
}

// Archiving takes the document out of search immediately; its text and versions are kept
export async function archiveDocument(id: string, actorId: string): Promise<KbResult> {
  const archived = await db.transaction(async tx => {
    // the same lock as publishing, so a publish that is finishing can't leave chunks behind
    const [now] = await tx.select({ id: kbDocuments.id }).from(kbDocuments).where(eq(kbDocuments.id, id)).for("update");
    if (!now) return false;
    await tx.delete(kbChunks).where(eq(kbChunks.documentId, id));
    await tx.update(kbDocuments).set({ status: "archived", archivedAt: new Date(), chunkCount: 0, updatedAt: new Date() }).where(eq(kbDocuments.id, id));
    return true;
  });
  if (!archived) return { ok: false, error: "This document no longer exists." };
  await audit("kb.archive", { actorId, targetType: "kb_document", targetId: id });
  return { ok: true, message: "Archived. It no longer appears in answers." };
}

// Only from archived (which has no chunks), so a stale "Restore" button can't turn a published document into a
// "draft" that is still searchable
export async function restoreDocument(id: string, actorId: string): Promise<KbResult> {
  const [restored] = await db.update(kbDocuments).set({ status: "draft", archivedAt: null, updatedAt: new Date() })
    .where(and(eq(kbDocuments.id, id), eq(kbDocuments.status, "archived"))).returning({ id: kbDocuments.id });
  if (!restored) return { ok: false, error: "Only archived documents can be restored. Reload the page to see its current state." };
  await audit("kb.restore", { actorId, targetType: "kb_document", targetId: id });
  return { ok: true, message: "Restored as a draft. Publish it to make it searchable again." };
}
