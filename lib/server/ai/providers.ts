import "server-only";
import { APICallError, RetryError, type EmbeddingModel, type LanguageModel } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

// The AI services an admin can choose between in Admin → AI (decision D6), all through the Vercel AI SDK.
// Keys live only in the hosting environment, never in the database, so an admin picks among the services whose key is set.
export const PROVIDER_IDS = ["anthropic", "openai", "google"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

// answerModels are suggestions; an admin may type any model ID the service offers, and "Test" checks it works
export const PROVIDERS: Record<ProviderId, { label: string; envKey: string; answerModels: string[] }> = {
  anthropic: { label: "Claude (Anthropic)", envKey: "ANTHROPIC_API_KEY", answerModels: ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"] },
  openai: { label: "OpenAI", envKey: "OPENAI_API_KEY", answerModels: ["gpt-5.5", "gpt-5.4-mini"] },
  google: { label: "Gemini (Google)", envKey: "GOOGLE_GENERATIVE_AI_API_KEY", answerModels: ["gemini-pro-latest", "gemini-flash-latest"] }
};

// Knowledge-search embeddings. Anthropic has no embedding model, so search runs on OpenAI or Gemini. Every option
// returns EMBEDDING_DIMENSIONS (1536) numbers, so switching needs no database change, only re-indexing.
// minSimilarity: weaker matches are dropped so the assistant can say it doesn't know. Each model scores on its own
// scale: Gemini gave unrelated questions 48–55% and related ones 64–74% (dev test, 2026-10-17). OpenAI's 25% is
// a starting point. Tune both with real questions in "Try a question".
export const EMBEDDINGS = {
  "openai:text-embedding-3-small": { provider: "openai", model: "text-embedding-3-small", label: "OpenAI text-embedding-3-small", minSimilarity: 0.25 },
  "openai:text-embedding-3-large": { provider: "openai", model: "text-embedding-3-large", label: "OpenAI text-embedding-3-large", minSimilarity: 0.25 },
  "google:gemini-embedding-001": { provider: "google", model: "gemini-embedding-001", label: "Gemini gemini-embedding-001", minSimilarity: 0.6 }
} as const satisfies Record<string, { provider: ProviderId; model: string; label: string; minSimilarity: number }>;
export type EmbeddingId = keyof typeof EMBEDDINGS;

export const isProvider = (v: unknown): v is ProviderId => PROVIDER_IDS.includes(v as ProviderId);
export const isEmbedding = (v: unknown): v is EmbeddingId => typeof v === "string" && Object.hasOwn(EMBEDDINGS, v);
export const keySet = (p: ProviderId): boolean => Boolean(process.env[PROVIDERS[p].envKey]);
export const MODEL_ID = /^[a-z0-9][a-z0-9.:_-]{1,79}$/i;

export function languageModel(provider: ProviderId, model: string): LanguageModel {
  if (provider === "anthropic") return anthropic(model);
  if (provider === "google") return google(model);
  return openai(model);
}

export function embeddingModel(id: EmbeddingId): EmbeddingModel {
  const { provider, model } = EMBEDDINGS[id];
  return provider === "google" ? google.embeddingModel(model) : openai.embeddingModel(model);
}

// A message an admin can act on. Provider errors don't contain the key, but they're still kept short.
export function describeAiError(err: unknown): string {
  if (RetryError.isInstance(err)) return describeAiError(err.lastError);   // the SDK retries 429s and 5xxs, then wraps the last one
  if (APICallError.isInstance(err)) {
    const s = err.statusCode;
    if (s === 401 || s === 403 || (s === 400 && /api key/i.test(err.message))) return "The service refused the key. Check it in the hosting settings.";   // Gemini answers 400
    if (s === 404) return "The service doesn't offer that model. Check the model ID.";
    if (s === 429) return "The service is limiting this key, or its credit has run out.";
    if (s === 400) return `The service rejected the request: ${err.message.slice(0, 160)}`;
  }
  return "The service didn't answer. Try again in a moment.";
}
