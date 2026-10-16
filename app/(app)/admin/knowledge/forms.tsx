"use client";
import { useActionState, type FormEvent } from "react";
import { MARKETS, COUNTRY_MARKETS } from "@/lib/markets";
import { changeKbStatus, createKbDocument, saveKbDocument, testKbSearch, type ActionState, type SearchState } from "../actions";

const KB_ACCEPT = ".pdf,.docx,.txt,.md";   // same as lib/server/rag/extract.ts

function Note({ state }: { state: ActionState }) {
  if (!state) return null;
  return <p role="status" className={`text-sm leading-snug ${state.error ? "text-danger" : "text-success"}`}>{state.error || state.ok}</p>;
}

// Market tags: none ticked means the document applies to every market
function MarketPicker({ selected = [] }: { selected?: string[] }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="label">{"Markets "}<span className="font-normal text-brand-600">{"(leave all unticked if it applies everywhere)"}</span></legend>
      <div className="flex flex-wrap gap-2">
        {COUNTRY_MARKETS.map(m => (
          <label key={m} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-[13px] has-checked:border-brand-600 has-checked:bg-brand-100">
            <input type="checkbox" name="markets" value={m} defaultChecked={selected.includes(m)} className="accent-ink" />{m}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function NewDocumentForm() {
  const [state, action, pending] = useActionState(createKbDocument, null);
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-1.5">
        <label className="label" htmlFor="kb-title">{"Title "}<span className="font-normal text-brand-600">{"(optional for uploads: the file name is used)"}</span></label>
        <input className="input" id="kb-title" name="title" maxLength={200} placeholder="e.g. Nigeria FMCG distribution, 2026" />
      </div>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="kb-file">{"Upload a file"}</label>
        <input id="kb-file" name="file" type="file" accept={KB_ACCEPT}
          className="text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-brand-200" />
        <p className="hint">{"PDF, Word (.docx), .txt or .md, up to 4 MB. Scanned PDFs have no text: paste it instead."}</p>
      </div>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="kb-body">{"…or paste the text"}</label>
        <textarea id="kb-body" name="body" rows={6} className="input min-h-32 py-3 leading-relaxed" placeholder="Paste the document's text here" />
      </div>
      <MarketPicker />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" type="submit" disabled={pending}>{pending ? "Reading the document…" : "Add as draft"}</button>
        <span className="hint">{"Drafts aren't used in answers until you publish them."}</span>
      </div>
      <Note state={state} />
    </form>
  );
}

export function EditDocumentForm({ id, title, body, markets }: { id: string; title: string; body: string; markets: string[] }) {
  const [state, action, pending] = useActionState(saveKbDocument, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-1.5">
        <label className="label" htmlFor="kb-title">{"Title"}</label>
        <input className="input" id="kb-title" name="title" defaultValue={title} maxLength={200} required />
      </div>
      <MarketPicker selected={markets} />
      <div className="grid gap-1.5">
        <label className="label" htmlFor="kb-body">{"Text"}</label>
        <textarea id="kb-body" name="body" defaultValue={body} rows={22} required className="input min-h-80 py-3 font-mono text-[13px] leading-relaxed" />
        <p className="hint">{"Tidy up anything the file conversion got wrong (page numbers, headers, broken tables). Blank lines separate sections."}</p>
      </div>
      <div><button className="btn" type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button></div>
      <Note state={state} />
    </form>
  );
}

export function StatusButtons({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(changeKbStatus, null);
  const confirmArchive = (e: FormEvent<HTMLFormElement>) => {
    const op = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (op === "archive" && !window.confirm("Archive this document? It will stop appearing in answers straight away.")) e.preventDefault();
  };
  return (
    <form action={action} onSubmit={confirmArchive} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap gap-2">
        {status !== "published" && status !== "archived" && <button className="btn" name="op" value="publish" disabled={pending}>{pending ? "Publishing…" : "Publish"}</button>}
        {status === "published" && <button className="btn btn-ghost" name="op" value="publish" disabled={pending}>{pending ? "Publishing…" : "Re-publish"}</button>}
        {status !== "archived" && <button className="btn btn-ghost" name="op" value="archive" disabled={pending}>{"Archive"}</button>}
        {status === "archived" && <button className="btn btn-ghost" name="op" value="restore" disabled={pending}>{"Restore as draft"}</button>}
      </div>
      <Note state={state} />
    </form>
  );
}

export function SearchTester() {
  const [state, action, pending] = useActionState<SearchState, FormData>(testKbSearch, null);
  return (
    <div className="grid gap-4">
      <form action={action} className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="kb-q">{"Question"}</label>
        <input className="input min-h-10 flex-1 basis-64" id="kb-q" name="q" defaultValue={state?.query ?? ""} placeholder="Ask what a customer might ask" required />
        <label className="sr-only" htmlFor="kb-m">{"Market"}</label>
        <select className="input min-h-10 w-44" id="kb-m" name="market" defaultValue={MARKETS[0]}>
          {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="btn" type="submit" disabled={pending}>{pending ? "Searching…" : "Search"}</button>
      </form>
      {state?.error && <p role="status" className="text-sm text-danger">{state.error}</p>}
      {state && !state.error && (
        state.hits.length ? (
          <ol className="grid gap-3">
            {state.hits.map((h, i) => (
              <li key={i} className="rounded-xl border border-brand-200 p-3.5">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <a className="font-semibold text-ink" href={`/admin/knowledge/${h.documentId}`}>{h.title}</a>
                  <span className="text-[12px] whitespace-nowrap text-brand-800 tabular-nums">{`match ${Math.round(h.similarity * 100)}%`}</span>
                </div>
                <p className="line-clamp-4 text-[13px] leading-relaxed whitespace-pre-wrap text-brand-800">{h.content}</p>
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-brand-800">{"No published section matches that question well. The assistant would say it doesn't know."}</p>
      )}
    </div>
  );
}
