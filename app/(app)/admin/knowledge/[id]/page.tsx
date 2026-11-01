import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/server/db";
import { kbDocuments, kbVersions, profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/server/admin";
import { fmtWhen } from "../../format";
import { EditDocumentForm, StatusButtons } from "../forms";

export const maxDuration = 60;   // publishing embeds the document

const STATUS_TEXT: Record<string, string> = {
  draft: "Draft: not used in answers until you publish it.",
  published: "Published: the assistant can use it. Saving changes updates search straight away.",
  archived: "Archived: not used in answers. Restore it to edit and publish again."
};

// One knowledge-base document: edit its text and market tags, publish, archive or restore it, see its versions
export default async function AdminKnowledgeDoc({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const [doc] = await db.select().from(kbDocuments).where(eq(kbDocuments.id, id)).limit(1);
  if (!doc) notFound();
  const versions = await db
    .select({ id: kbVersions.id, createdAt: kbVersions.createdAt, by: profiles.name })
    .from(kbVersions).leftJoin(profiles, eq(profiles.id, kbVersions.createdBy))
    .where(eq(kbVersions.documentId, id)).orderBy(desc(kbVersions.createdAt)).limit(10);
  const [current] = doc.currentVersionId
    ? await db.select({ body: kbVersions.body }).from(kbVersions).where(eq(kbVersions.id, doc.currentVersionId)).limit(1)
    : [];
  const created = (await searchParams).created === "1";

  return (
    <>
      <div>
        <a href="/admin/knowledge" className="text-sm font-semibold text-brand-800">{"← Knowledge base"}</a>
        <h1 className="mt-2 font-serif text-[clamp(1.7rem,1.3rem+1.4vw,2.25rem)] leading-tight font-medium tracking-[-0.03em]">{doc.title}</h1>
        {created && <p role="status" className="mt-2 text-sm text-success">{"Added as a draft. Check the text below, then publish it."}</p>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="card" aria-labelledby="edit-h">
          <p className="eyebrow">{"Content"}</p>
          <h2 id="edit-h" className="text-[17px] font-semibold">{"Edit"}</h2>
          {doc.status === "archived"
            ? <p className="rounded-xl bg-canvas p-4 text-[13px] leading-relaxed whitespace-pre-wrap text-brand-800">{current?.body}</p>
            : <EditDocumentForm id={doc.id} title={doc.title} body={current?.body ?? ""} markets={doc.markets} genres={doc.genres} />}
        </section>

        <aside className="grid gap-6">
          <section className="card" aria-labelledby="status-h">
            <p className="eyebrow">{"Status"}</p>
            <h2 id="status-h" className="text-[17px] font-semibold capitalize">{doc.status}</h2>
            <p className="-mt-1.5 text-sm text-brand-800">{STATUS_TEXT[doc.status]}</p>
            <dl className="grid gap-1.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Searchable sections"}</dt><dd className="tabular-nums">{doc.chunkCount}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Genre"}</dt><dd className="text-right">{doc.genres.length ? doc.genres.join(", ") : "None"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Markets"}</dt><dd className="text-right">{doc.markets.length ? doc.markets.join(", ") : "All"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-brand-800">{"Last published"}</dt><dd>{fmtWhen(doc.publishedAt)}</dd></div>
              {doc.sourceName && <div className="flex justify-between gap-3"><dt className="text-brand-800">{"From file"}</dt><dd className="truncate text-right" title={doc.sourceName}>{doc.sourceName}</dd></div>}
            </dl>
            {doc.embedError && <p className="rounded-lg bg-[#FEF3F2] p-2.5 text-[13px] text-danger">{"The last publish failed. Try again; if it keeps failing, check the AI service key and budget."}</p>}
            <StatusButtons id={doc.id} status={doc.status} />
          </section>

          <section className="card" aria-labelledby="ver-h">
            <p className="eyebrow">{"History"}</p>
            <h2 id="ver-h" className="text-[17px] font-semibold">{"Versions"}</h2>
            <ul className="grid divide-y divide-brand-100 text-sm">
              {versions.map(v => (
                <li key={v.id} className="flex justify-between gap-3 py-2">
                  <span>{fmtWhen(v.createdAt)}{v.id === doc.currentVersionId && <b className="ml-1.5 text-[12px] font-semibold text-success">{"current"}</b>}</span>
                  <span className="text-brand-800">{v.by || "—"}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
