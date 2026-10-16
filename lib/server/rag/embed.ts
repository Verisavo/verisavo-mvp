import "server-only";
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

// OpenAI embeddings through the Vercel AI SDK (decision D6). The model's size must equal EMBEDDING_DIMENSIONS in
// db/schema.ts (1536); changing the model means re-publishing every document.
export const EMBEDDING_MODEL = "text-embedding-3-small";

export const aiConfigured = (): boolean => Boolean(process.env.OPENAI_API_KEY);

export async function embedTexts(values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: openai.embeddingModel(EMBEDDING_MODEL), values, maxParallelCalls: 2 });
  return embeddings;
}

export async function embedQuery(value: string): Promise<number[]> {
  const { embedding } = await embed({ model: openai.embeddingModel(EMBEDDING_MODEL), value });
  return embedding;
}
