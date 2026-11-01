import { arrayContains, desc } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/server/db";
import { kbDocuments } from "@/db/schema";
import { requireAdmin } from "@/lib/server/admin";
import { searchSetup } from "@/lib/server/ai/settings";
import { GENRES } from "@/lib/markets";
import { fmtDay } from "../format";
import { NewDocumentForm, SearchTester } from "./forms";

export const maxDuration = 60;   // reading and embedding a document can take a while

const BADGE: Record<string, string> = {
  published: "bg-[#ECFDF3] text-success",
  draft: "bg-brand-100 text-brand-800",
  archived: "bg-canvas text-brand-600"
};

// The knowledge base (M2.5): the approved Verisavo content the assistant answers from
export default async function AdminKnowledge({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  await requireAdmin();
  const asked = (await searchParams).genre;
  const genre = (GENRES as readonly string[]).includes(String(asked)) ? String(asked) : "";
  const docs = await db.select().from(kbDocuments).where(genre ? arrayContains(kbDocuments.genres, [genre]) : undefined).orderBy(desc(kbDocuments.updatedAt)).limit(200);
  const { problem } = await searchSetup();

  return (
    <>
      <div>
        <h1 className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] leading-tight font-medium tracking-[-0.03em]">{"Knowledge base"}</h1>
        <p className="mt-1 text-brand-800">{"The approved Verisavo content the Intelligence Assistant answers from. Only published documents are used."}</p>
        {problem && <p className="mt-3 rounded-xl bg-[#FFFAEB] p-3 text-sm text-[#93370D]">{`${problem} Documents can be added and edited, but not published or searched, until it is. See `}<a href="/admin/ai">{"AI settings"}</a>{"."}</p>}
      </div>

      <nav aria-label="Filter by genre" className="-mb-2 flex flex-wrap gap-1.5">
        {["", ...GENRES].map(g => (
          <a key={g} href={g ? `/admin/knowledge?genre=${encodeURIComponent(g)}` : "/admin/knowledge"} aria-current={g === genre ? "true" : undefined}
            className={`rounded-full border px-3 py-1 text-[13px] font-medium no-underline ${g === genre ? "border-ink bg-ink text-white" : "border-brand-200 bg-white text-brand-800 hover:bg-brand-100"}`}>{g || "All genres"}</a>
        ))}
      </nav>

      <section className="card relative overflow-x-auto p-0 sm:p-0" aria-label="Documents">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-brand-200 text-brand-800">
            <tr>
              <th className="px-5 py-3 font-semibold">{"Document"}</th>
              <th className="px-3 py-3 font-semibold">{"Status"}</th>
              <th className="px-3 py-3 font-semibold">{"Genre"}</th>
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
                <td className="px-3 py-3 text-brand-800">{d.genres.length ? d.genres.join(", ") : "—"}</td>
                <td className="px-3 py-3 text-brand-800">{d.markets.length ? d.markets.join(", ") : "All markets"}</td>
                <td className="px-3 py-3 text-right tabular-nums">{d.status === "published" ? d.chunkCount : "—"}</td>
                <td className="px-5 py-3 whitespace-nowrap">{fmtDay(d.updatedAt)}</td>
              </tr>
            ))}
            {!docs.length && <tr><td colSpan={6} className="px-5 py-8 text-center text-brand-800">{genre ? `No documents in ${genre} yet.` : "No documents yet. Add the first one below."}</td></tr>}
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
