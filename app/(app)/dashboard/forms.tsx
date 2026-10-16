"use client";
import { useActionState } from "react";
import { changeEmail, changePassword, deleteConversation, updateProfile, type FormState } from "./actions";

function Note({ state }: { state: FormState }) {
  if (!state) return null;
  return <p role="status" className={`text-sm leading-snug ${state.error ? "text-danger" : "text-success"}`}>{state.error || state.ok}</p>;
}

export function ProfileForm({ name, organisation }: { name: string; organisation: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-1.5">
        <label className="label" htmlFor="p-name">{"Full name"}</label>
        <input className="input" id="p-name" name="name" defaultValue={name} maxLength={120} autoComplete="name" required />
      </div>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="p-org">{"Organisation "}<span className="font-normal text-brand-600">{"(optional)"}</span></label>
        <input className="input" id="p-org" name="organisation" defaultValue={organisation ?? ""} maxLength={160} autoComplete="organization" />
      </div>
      <div><button className="btn" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button></div>
      <Note state={state} />
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changeEmail, null);
  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-1.5">
        <label className="label" htmlFor="e-now">{"Email"}</label>
        <input className="input" id="e-now" value={email} readOnly />
      </div>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="e-new">{"New email"}</label>
        <input className="input" id="e-new" name="email" type="email" maxLength={160} autoComplete="email" placeholder="you@company.com" required />
      </div>
      <div><button className="btn btn-ghost" type="submit" disabled={pending}>{pending ? "Sending…" : "Change email"}</button></div>
      <Note state={state} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-1.5">
        <label className="label" htmlFor="pw-now">{"Current password"}</label>
        <input className="input" id="pw-now" name="current" type="password" autoComplete="current-password" maxLength={72} required />
      </div>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="pw-new">{"New password"}</label>
        <input className="input" id="pw-new" name="password" type="password" autoComplete="new-password" maxLength={72} required />
        <p className="hint">{"At least 8 characters, with letters and numbers."}</p>
      </div>
      <div><button className="btn btn-ghost" type="submit" disabled={pending}>{pending ? "Changing…" : "Change password"}</button></div>
      <Note state={state} />
    </form>
  );
}

export function DeleteConversation({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteConversation} onSubmit={e => { if (!window.confirm(`Delete “${title}”? This can't be undone.`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" aria-label={`Delete “${title}”`} className="cursor-pointer rounded-lg px-2 py-1.5 text-[13px] font-semibold text-brand-800 hover:bg-brand-100 hover:text-ink">{"Delete"}</button>
    </form>
  );
}
