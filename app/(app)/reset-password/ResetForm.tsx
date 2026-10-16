"use client";
import { useState, type FormEvent } from "react";

type State = { pending: boolean; error: string; done: boolean };

export default function ResetForm({ email }: { email: string }) {
  const [state, setState] = useState<State>({ pending: false, error: "", done: false });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? ""), confirm = String(data.get("confirm") ?? "");
    if (password !== confirm) return setState({ pending: false, error: "The two passwords don't match.", done: false });
    setState({ pending: true, error: "", done: false });
    try {
      const r = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body: { message?: string } = await r.json().catch(() => ({}));
      if (!r.ok) return setState({ pending: false, error: body.message || "We couldn't change your password. Please try again.", done: false });
      setState({ pending: false, error: "", done: true });
    } catch {
      setState({ pending: false, error: "Something went wrong. Check your connection and try again.", done: false });
    }
  }

  if (state.done) {
    return (
      <div className="grid gap-3">
        <p role="status" className="text-sm text-success">{"Your password has been changed and you're signed in."}</p>
        <div><a className="btn" href="/dashboard">{"Go to your dashboard"}</a></div>
      </div>
    );
  }
  return (
    <form className="grid gap-3" onSubmit={submit} noValidate>
      <p className="-mt-1.5 text-[15px] text-brand-800">{`For ${email}`}</p>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="rp-new">{"New password"}</label>
        <input className="input" id="rp-new" name="password" type="password" autoComplete="new-password" maxLength={72} required autoFocus />
        <p className="hint">{"At least 8 characters, with letters and numbers."}</p>
      </div>
      <div className="grid gap-1.5">
        <label className="label" htmlFor="rp-again">{"Type it again"}</label>
        <input className="input" id="rp-again" name="confirm" type="password" autoComplete="new-password" maxLength={72} required />
      </div>
      <div><button className="btn" type="submit" disabled={state.pending}>{state.pending ? "Saving…" : "Save new password"}</button></div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
