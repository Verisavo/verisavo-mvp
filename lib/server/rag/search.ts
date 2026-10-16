import "server-only";
import { and, cosineDistance, eq, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { kbChunks, kbDocuments } from "@/db/schema";
import { ALL_MARKETS } from "@/lib/markets";
import { searchSetup } from "@/lib/server/ai/settings";
import { EMBEDDINGS } from "@/lib/server/ai/providers";
import { embedQuery } from "./embed";

export type KbHit = { documentId: string; title: string; content: string; similarity: number };

// The knowledge-base sections closest to a question, optionally for one market (documents with no market apply
// everywhere). Matches below the model's minSimilarity (lib/server/ai/providers.ts) are dropped, so the assistant can
// say it doesn't know instead of using them.
// Only chunks embedded with the current model are compared (see embed.ts). Callers check searchSetup().problem first.
export async function searchKnowledge(question: string, { market = ALL_MARKETS as string, limit = 6 } = {}): Promise<KbHit[]> {
  const { id } = await searchSetup();
  const minSimilarity = EMBEDDINGS[id].minSimilarity;
  const vector = await embedQuery(id, question);
  const distance = cosineDistance(kbChunks.embedding, vector);
  const forMarket = market && market !== ALL_MARKETS
    ? sql`(${kbChunks.markets} = '{}'::text[] or ${market} = any(${kbChunks.markets}))`
    : undefined;
  const rows = await db.transaction(async tx => {
    // with a filter, let the vector index keep scanning until it has enough rows (pgvector 0.8+)
    await tx.execute(sql`set local hnsw.iterative_scan = relaxed_order`);
    return tx
      .select({ documentId: kbChunks.documentId, title: kbDocuments.title, content: kbChunks.content, similarity: sql<number>`1 - (${distance})` })
      .from(kbChunks)
      .innerJoin(kbDocuments, eq(kbDocuments.id, kbChunks.documentId))
      .where(and(eq(kbDocuments.status, "published"), eq(kbChunks.embeddingModel, id), forMarket))
      .orderBy(distance)
      .limit(limit);
  });
  return rows.map(r => ({ ...r, similarity: Number(r.similarity) })).filter(r => r.similarity >= minSimilarity);
}
