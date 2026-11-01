"use client";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { GENRES, MARKETS, COUNTRY_MARKETS } from "@/lib/markets";
import { useConfirm } from "../../Confirm";
import { changeKbStatus, createKbDocument, saveKbDocument, testKbSearch, type ActionState, type SearchState } from "../actions";

const KB_ACCEPT = ".pdf,.docx,.txt,.md";   // same as lib/server/rag/extract.ts
const KB_MAX_BYTES = 4 * 1024 * 1024;     // same as lib/server/rag/extract.ts

export function Note({ state }: { state: ActionState }) {
  if (!state) return null;
  return <p role="status" className={`text-sm leading-snug ${state.error ? "text-danger" : "text-success"}`}>{state.error || state.ok}</p>;
}

// A dropdown of tick boxes. The boxes stay in the page while it's closed, so the form always sends what's ticked.
function CheckDropdown({ name, label, hint, options, selected, none }: { name: string; label: string; hint: string; options: readonly string[]; selected: string[]; none: string }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(selected);
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const summary = !picked.length ? none : picked.length <= 2 ? picked.join(", ") : `${picked.slice(0, 2).join(", ")} +${picked.length - 2}`;
  const matches = (o: string) => o.toLowerCase().includes(query.trim().toLowerCase());
  return (
    <div ref={box} className="relative grid gap-1.5">
      <span className="label" id={`${name}-l`}>{label}</span>
      <button type="button" aria-haspopup="true" aria-expanded={open} aria-labelledby={`${name}-l ${name}-v`} onClick={() => setOpen(o => !o)}
        className="input flex cursor-pointer items-center justify-between gap-2 text-left">
        <span id={`${name}-v`} className={`min-w-0 truncate ${picked.length ? "" : "text-brand-600"}`}>{summary}</span>
        <svg className={`size-4 flex-none transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
      </button>
      <p className="hint">{hint}</p>
      <div hidden={!open} className="absolute top-[4.6rem] right-0 left-0 z-30 rounded-xl border border-brand-200 bg-white p-1.5 shadow-[0_18px_40px_-18px_#3A5292]">
        <div className="flex items-center gap-2 p-1">
          {options.length > 12 && <input type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} placeholder="Search" aria-label={`Search ${label}`}
            className="min-w-0 flex-1 rounded-lg border border-brand-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none" />}
          <button type="button" onClick={() => setPicked([])} className="ml-auto cursor-pointer rounded-lg px-2 py-1.5 text-[13px] font-semibold text-brand-800 hover:bg-brand-100">{"Clear"}</button>
        </div>
        <div className="grid max-h-56 gap-0.5 overflow-y-auto">
          {options.map(o => (
            <label key={o} hidden={!matches(o)} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-brand-100 has-checked:font-semibold">
              <input type="checkbox" name={name} value={o} checked={picked.includes(o)} className="size-4 flex-none accent-ink"
                onChange={e => setPicked(p => (e.target.checked ? [...p, o] : p.filter(x => x !== o)))} />{o}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Countries and sectors: no country ticked means the document applies to every market
function DocumentTags({ markets = [], genres = [] }: { markets?: string[]; genres?: string[] }) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <CheckDropdown name="markets" label="Countries" hint="Leave empty if it applies everywhere." options={COUNTRY_MARKETS} selected={markets} none="All markets" />
      <CheckDropdown name="genres" label="Genre" hint="The industry sectors it covers." options={GENRES} selected={genres} none="No genre yet" />
    </div>
  );
}

export function NewDocumentForm() {
  const [state, action, pending] = useActionState(createKbDocument, null);
  const [tooBig, setTooBig] = useState(false);
  // a file over the limit would be cut off before it reaches the server, so stop it here with a clear message
  const checkSize = (e: FormEvent<HTMLFormElement>) => {
    const file = new FormData(e.currentTarget).get("file");
    const over = file instanceof File && file.size > KB_MAX_BYTES;
    setTooBig(over);
    if (over) e.preventDefault();
  };
  return (
    <form action={action} onSubmit={checkSize} className="grid gap-4">
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
      <DocumentTags />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" type="submit" disabled={pending}>{pending ? "Reading the document…" : "Add as draft"}</button>
        <span className="hint">{"Drafts aren't used in answers until you publish them."}</span>
      </div>
      <Note state={tooBig ? { error: "That file is larger than 4 MB. Split it, or paste its text instead." } : state} />
    </form>
  );
}

export function EditDocumentForm({ id, title, body, markets, genres }: { id: string; title: string; body: string; markets: string[]; genres: string[] }) {
  const [state, action, pending] = useActionState(saveKbDocument, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-1.5">
        <label className="label" htmlFor="kb-title">{"Title"}</label>
        <input className="input" id="kb-title" name="title" defaultValue={title} maxLength={200} required />
      </div>
      <DocumentTags markets={markets} genres={genres} />
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
  const { guard, dialog } = useConfirm();
  const confirmArchive = guard(e => (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "archive"
    ? { title: "Archive this document?", body: "It will stop appearing in answers straight away. You can restore it later.", action: "Archive", danger: true } : null);
  return (
    <>
    {dialog}
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
    </>
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
