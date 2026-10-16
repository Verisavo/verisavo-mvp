import { desc } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/server/db";
import { kbDocuments } from "@/db/schema";
import { requireAdmin } from "@/lib/server/admin";
import { aiConfigured } from "@/lib/server/rag/embed";
import { fmtDay } from "../format";
import { NewDocumentForm, SearchTester } from "./forms";

export const maxDuration = 60;   // reading and embedding a document can take a while

const BADGE: Record<string, string> = {
  published: "bg-[#ECFDF3] text-success",
  draft: "bg-brand-100 text-brand-800",
  archived: "bg-canvas text-brand-600"
};

// The knowledge base (M2.5): the approved Verisavo content the assistant answers from
export default async function AdminKnowledge() {
  await connection();
  await requireAdmin();
  const docs = await db.select().from(kbDocuments).orderBy(desc(kbDocuments.updatedAt)).limit(200);

  return (
    <>
      <div>
        <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Knowledge base"}</h1>
        <p className="mt-1 text-brand-800">{"The approved Verisavo content the Intelligence Assistant answers from. Only published documents are used."}</p>
        {!aiConfigured() && <p className="mt-3 rounded-xl bg-[#FFFAEB] p-3 text-sm text-[#93370D]">{"The AI service isn't set up yet (OPENAI_API_KEY), so documents can be added and edited but not published or searched."}</p>}
      </div>

      <section className="card overflow-x-auto p-0 sm:p-0" aria-label="Documents">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-brand-200 text-brand-800">
            <tr>
              <th className="px-5 py-3 font-semibold">{"Document"}</th>
              <th className="px-3 py-3 font-semibold">{"Status"}</th>
              <th className="px-3 py-3 font-semibold">{"Markets"}</th>
              <th className="px-3 py-3 text-right font-semibold">{"Sections"}</th>
              <th className="px-5 py-3 font-semibold">{"Updated"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {docs.map(d => (
              <tr key={d.id}>
                <td className="px-5 py-3">
                  <a className="font-semibold text-ink" href={`/admin/knowledge/${d.id}`}>{d.title}</a>
                  {d.sourceName && <span className="block text-[12px] text-brand-800">{d.sourceName}</span>}
                  {d.embedError && <span className="block text-[12px] text-danger">{"Last publish failed"}</span>}
                </td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${BADGE[d.status] ?? ""}`}>{d.status}</span></td>
                <td className="px-3 py-3 text-brand-800">{d.markets.length ? d.markets.join(", ") : "All markets"}</td>
                <td className="px-3 py-3 text-right tabular-nums">{d.status === "published" ? d.chunkCount : "—"}</td>
                <td className="px-5 py-3 whitespace-nowrap">{fmtDay(d.updatedAt)}</td>
              </tr>
            ))}
            {!docs.length && <tr><td colSpan={5} className="px-5 py-8 text-center text-brand-800">{"No documents yet. Add the first one below."}</td></tr>}
          </tbody>
        </table>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="new-h">
          <p className="eyebrow">{"Add"}</p>
          <h2 id="new-h" className="text-[17px] font-semibold">{"New document"}</h2>
          <NewDocumentForm />
        </section>
        <section className="card" aria-labelledby="try-h">
          <p className="eyebrow">{"Check"}</p>
          <h2 id="try-h" className="text-[17px] font-semibold">{"Try a question"}</h2>
          <p className="-mt-1.5 text-sm text-brand-800">{"See which published sections the assistant would use to answer."}</p>
          <SearchTester />
        </section>
      </div>
    </>
  );
}
