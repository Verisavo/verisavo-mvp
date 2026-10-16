import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { aiSettings } from "@/db/schema";
import { EMBEDDINGS, isEmbedding, isProvider, keySet, languageModel, PROVIDER_IDS, PROVIDERS, type EmbeddingId, type ProviderId } from "./providers";

export type AiSettings = { answerProvider: ProviderId; answerModel: string; embeddingId: EmbeddingId; saved: boolean };

// The admin's saved choice. Until one is saved, the first service with a key set (publishing a document saves it,
// so adding another key later never switches search on its own).
export async function getAiSettings(): Promise<AiSettings> {
  const [row] = await db.select().from(aiSettings).where(eq(aiSettings.id, 1)).limit(1);
  if (row && isProvider(row.answerProvider) && isEmbedding(row.embeddingModel)) {
    return { answerProvider: row.answerProvider, answerModel: row.answerModel, embeddingId: row.embeddingModel, saved: true };
  }
  const answerProvider = PROVIDER_IDS.find(keySet) ?? "anthropic";
  const embeddingId = (Object.keys(EMBEDDINGS) as EmbeddingId[]).find(id => keySet(EMBEDDINGS[id].provider)) ?? "openai:text-embedding-3-small";
  return { answerProvider, answerModel: PROVIDERS[answerProvider].answerModels[0], embeddingId, saved: false };
}

// Only the changed columns are written to an existing row, so two admins saving different settings at once don't
// undo each other. The first save stores the whole (automatic) choice.
export async function saveAiSettings(change: Partial<Omit<AiSettings, "saved">>, actorId: string): Promise<void> {
  const next = { ...(await getAiSettings()), ...change };
  const meta = { updatedBy: actorId, updatedAt: new Date() };
  const set = {
    ...(change.answerProvider && { answerProvider: change.answerProvider }),
    ...(change.answerModel && { answerModel: change.answerModel }),
    ...(change.embeddingId && { embeddingModel: change.embeddingId }),
    ...meta
  };
  await db.insert(aiSettings).values({ id: 1, answerProvider: next.answerProvider, answerModel: next.answerModel, embeddingModel: next.embeddingId, ...meta })
    .onConflictDoUpdate({ target: aiSettings.id, set });
}

// The model that answers questions (the assistant, from M3), or why it can't
export async function answerSetup() {
  const s = await getAiSettings();
  const { label, envKey } = PROVIDERS[s.answerProvider];
  return keySet(s.answerProvider)
    ? { ok: true as const, label, modelId: s.answerModel, model: languageModel(s.answerProvider, s.answerModel) }
    : { ok: false as const, label, modelId: s.answerModel, problem: `Answers use ${label}, but ${envKey} isn't set.` };
}

// The embedding model knowledge search uses, or why it can't
export async function searchSetup(): Promise<{ id: EmbeddingId; saved: boolean; problem: string | null }> {
  const s = await getAiSettings();
  const { label, envKey } = PROVIDERS[EMBEDDINGS[s.embeddingId].provider];
  return { id: s.embeddingId, saved: s.saved, problem: keySet(EMBEDDINGS[s.embeddingId].provider) ? null : `Knowledge search uses ${label}, but ${envKey} isn't set.` };
}
