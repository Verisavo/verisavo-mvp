import "server-only";
import { embed, embedMany } from "ai";
import { EMBEDDING_DIMENSIONS } from "@/db/schema";
import { EMBEDDINGS, embeddingModel, type EmbeddingId } from "@/lib/server/ai/providers";

// Knowledge-base embeddings from the service chosen in Admin → AI (decision D6). Vectors from different models can't be
// compared, so each chunk records its model, search only uses chunks from the current one, and switching re-indexes.
const options = (id: EmbeddingId, task: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") =>
  EMBEDDINGS[id].provider === "google" ? { google: { taskType: task } } : undefined;

export async function embedTexts(id: EmbeddingId, values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: embeddingModel(id), values, dimensions: EMBEDDING_DIMENSIONS, providerOptions: options(id, "RETRIEVAL_DOCUMENT"), maxParallelCalls: 2 });
  return embeddings;
}

export async function embedQuery(id: EmbeddingId, value: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(id), value, dimensions: EMBEDDING_DIMENSIONS, providerOptions: options(id, "RETRIEVAL_QUERY") });
  return embedding;
}
