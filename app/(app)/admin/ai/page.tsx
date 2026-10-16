import { connection } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { getAiSettings } from "@/lib/server/ai/settings";
import { EMBEDDINGS, keySet, PROVIDER_IDS, PROVIDERS, type EmbeddingId } from "@/lib/server/ai/providers";
import { staleDocumentIds } from "@/lib/server/rag/knowledge";
import { AnswerForm, SearchForm } from "./forms";

export const maxDuration = 60;   // switching the search model re-indexes documents

// AI settings (decision D6): which service answers questions and which one powers knowledge search
export default async function AdminAi() {
  await connection();
  await requireAdmin();
  const settings = await getAiSettings();
  const services = PROVIDER_IDS.map(id => ({ id, ...PROVIDERS[id], keySet: keySet(id), models: PROVIDERS[id].answerModels }));
  const options = (Object.keys(EMBEDDINGS) as EmbeddingId[]).map(id => ({ id, label: EMBEDDINGS[id].label, service: EMBEDDINGS[id].provider, keySet: keySet(EMBEDDINGS[id].provider) }));
  const stale = (await staleDocumentIds(settings.embeddingId)).length;

  return (
    <>
      <div>
        <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"AI settings"}</h1>
        <p className="mt-1 text-brand-800">{"Choose which AI service answers questions and which one powers knowledge search. You can switch at any time."}</p>
        {!settings.saved && <p className="mt-3 rounded-xl bg-brand-100 p-3 text-sm text-brand-800">{"Nothing saved yet: the first service with a key is used. Save a choice to keep it fixed."}</p>}
      </div>

      <section className="card overflow-x-auto p-0 sm:p-0" aria-labelledby="keys-h">
        <div className="px-5 pt-5"><p className="eyebrow">{"Keys"}</p><h2 id="keys-h" className="text-[17px] font-semibold">{"Connected services"}</h2></div>
        <table className="mt-3 w-full min-w-[520px] text-left text-sm">
          <tbody className="divide-y divide-brand-100 border-t border-brand-100">
            {services.map(s => (
              <tr key={s.id}>
                <td className="px-5 py-3 font-semibold">{s.label}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-brand-800">{s.envKey}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.keySet ? "bg-[#ECFDF3] text-success" : "bg-canvas text-brand-600"}`}>{s.keySet ? "Key set" : "No key"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint px-5 py-4">{"Keys are added in the hosting settings (Vercel → Settings → Environment Variables), followed by a redeploy. They are never stored in the database or shown here."}</p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="answers-h">
          <p className="eyebrow">{"Answers"}</p>
          <h2 id="answers-h" className="text-[17px] font-semibold">{"Who answers questions"}</h2>
          <p className="-mt-1.5 text-sm text-brand-800">{"Used for every Intelligence Assistant answer, on the web and on WhatsApp."}</p>
          <AnswerForm services={services} current={{ provider: settings.answerProvider, model: settings.answerModel }} />
        </section>
        <section className="card" aria-labelledby="search-h">
          <p className="eyebrow">{"Knowledge search"}</p>
          <h2 id="search-h" className="text-[17px] font-semibold">{"How documents are searched"}</h2>
          <p className="-mt-1.5 text-sm text-brand-800">{"Finds the knowledge-base sections an answer is based on. Changing it re-indexes every published document."}</p>
          <SearchForm options={options} current={settings.embeddingId} stale={stale} />
        </section>
      </div>
    </>
  );
}
