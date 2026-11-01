"use client";
import { useActionState, useState, type FormEvent } from "react";
import { continueReindex, saveAnswerSettings, saveSearchSettings, testAnswers, testSearch } from "../actions";
import { Note } from "../knowledge/forms";

export type ServiceView = { id: string; label: string; envKey: string; keySet: boolean; models: string[] };
export type SearchOption = { id: string; label: string; service: string; keySet: boolean };

const choice = "flex cursor-pointer items-center gap-2.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm has-checked:border-brand-600 has-checked:bg-brand-100 has-disabled:cursor-not-allowed has-disabled:opacity-55";

function TestButton({ action, label }: { action: typeof testAnswers; label: string }) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form action={run} className="grid gap-2 border-t border-brand-100 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-ghost" type="submit" disabled={pending}>{pending ? "Testing…" : label}</button>
        <span className="hint">{"Sends one tiny request with the saved choice."}</span>
      </div>
      <Note state={state} />
    </form>
  );
}

const OTHER = "__other";

export function AnswerForm({ services, notes, current }: { services: ServiceView[]; notes: Record<string, string>; current: { provider: string; model: string } }) {
  const [state, action, pending] = useActionState(saveAnswerSettings, null);
  const [provider, setProvider] = useState(current.provider);
  const [model, setModel] = useState(current.model);
  const models = services.find(s => s.id === provider)?.models ?? [];
  const [other, setOther] = useState(!models.includes(current.model));
  const pick = (s: ServiceView) => { if (s.id !== provider) { setProvider(s.id); setModel(s.models[0] ?? ""); setOther(false); } };
  return (
    <div className="grid gap-4">
      <form action={action} className="grid gap-4">
        <fieldset className="grid gap-2">
          <legend className="label mb-2">{"Service"}</legend>
          {services.map(s => (
            <label key={s.id} className={choice}>
              <input type="radio" name="provider" value={s.id} checked={provider === s.id} disabled={!s.keySet} onChange={() => pick(s)} className="accent-ink" />
              <span className="font-semibold">{s.label}</span>
              {!s.keySet && <span className="ml-auto text-[12px] text-brand-800">{"no key"}</span>}
            </label>
          ))}
        </fieldset>
        <div className="grid gap-1.5">
          <label className="label" htmlFor="ai-model">{"Model"}</label>
          <select className="input" id="ai-model" value={other ? OTHER : model}
            onChange={e => { const v = e.target.value; setOther(v === OTHER); setModel(v === OTHER ? "" : v); }}>
            {models.map(m => <option key={m} value={m}>{notes[m] ? `${m} (${notes[m]})` : m}</option>)}
            <option value={OTHER}>{"Other model…"}</option>
          </select>
          {other
            ? <input className="input" name="model" aria-label="Model ID" value={model} onChange={e => setModel(e.target.value)} maxLength={80} required autoComplete="off" placeholder="Model ID from the service" />
            : <input type="hidden" name="model" value={model} />}
          <p className="hint">{"Saving tries the model first, so a model that doesn't work is never saved."}</p>
        </div>
        <div><button className="btn" type="submit" disabled={pending}>{pending ? "Trying it and saving…" : "Save"}</button></div>
        <Note state={state} />
      </form>
      <TestButton action={testAnswers} label="Test answers" />
    </div>
  );
}

export function SearchForm({ options, current, stale }: { options: SearchOption[]; current: string; stale: number }) {
  const [state, action, pending] = useActionState(saveSearchSettings, null);
  const [more, cont, continuing] = useActionState(continueReindex, null);
  const confirmSwitch = (e: FormEvent<HTMLFormElement>) => {
    const next = new FormData(e.currentTarget).get("embedding");
    if (next !== current && !window.confirm("Switch knowledge search? Every published document is re-indexed with the new model. Until a document is re-indexed it doesn't appear in answers.")) e.preventDefault();
  };
  return (
    <div className="grid gap-4">
      <form action={action} onSubmit={confirmSwitch} className="grid gap-4">
        <fieldset className="grid gap-2">
          <legend className="label mb-2">{"Search model"}</legend>
          {options.map(o => (
            <label key={o.id} className={choice}>
              <input type="radio" name="embedding" value={o.id} defaultChecked={o.id === current} disabled={!o.keySet} className="accent-ink" />
              <span className="font-semibold">{o.label}</span>
              {!o.keySet && <span className="ml-auto text-[12px] text-brand-800">{"no key"}</span>}
            </label>
          ))}
        </fieldset>
        <p className="hint">{"Claude has no search model of its own, so search always runs on the OpenAI or Gemini model chosen here, whichever service answers."}</p>
        <div><button className="btn" type="submit" disabled={pending}>{pending ? "Saving and re-indexing…" : "Save"}</button></div>
        <Note state={state} />
      </form>
      {stale > 0 && (
        <form action={cont} className="grid gap-2 rounded-xl bg-[#FFFAEB] p-3.5 text-sm text-[#93370D]">
          <p>{`${stale} published ${stale === 1 ? "document still uses" : "documents still use"} the previous search model and won't appear in answers until re-indexed.`}</p>
          <div><button className="btn" type="submit" disabled={continuing}>{continuing ? "Re-indexing…" : "Continue re-indexing"}</button></div>
        </form>
      )}
      <Note state={more} />{/* outside the box, which disappears once nothing is left to re-index */}
      <TestButton action={testSearch} label="Test search" />
    </div>
  );
}
