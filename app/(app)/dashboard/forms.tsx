"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changeEmail, changePassword, deleteConversation, startWhatsAppLink, unlinkWhatsApp, updateProfile, verifyWhatsAppLink, type FormState } from "./actions";

// Back from Stripe Checkout. The redirect isn't proof of payment, so the plan only shows as paid once the webhook has
// confirmed it; meanwhile the page refreshes itself for up to half a minute.
export function CheckoutNotice({ status, paid }: { status: "success" | "cancel"; paid: boolean }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  const waiting = status === "success" && !paid && tries < 15;
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(() => { setTries(n => n + 1); router.refresh(); }, 2000);
    return () => clearTimeout(t);
  }, [waiting, tries, router]);
  const text = status === "cancel" ? "Checkout was cancelled. You haven’t been charged."
    : paid ? "Thank you! You’re on Verisavo Monthly."
    : waiting ? "Thank you! We’re confirming your payment with Stripe…"
    : "Your payment is still being confirmed. Refresh this page in a minute; contact us if your plan doesn’t change.";
  return <p role="status" className={`rounded-xl p-3 text-sm ${status === "success" && paid ? "bg-[#ECFDF3] text-success" : "bg-brand-100 text-brand-800"}`}>{text}</p>;
}

// Subscribe opens Stripe Checkout; Manage billing opens Stripe's billing portal (invoices, card, cancel)
export function BillingButton({ kind, label }: { kind: "subscribe" | "manage"; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    setBusy(true); setError("");
    try {
      const r = await fetch(kind === "subscribe" ? "/api/billing/checkout" : "/api/billing/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await r.json().catch(() => null) as { url?: string; message?: string } | null;
      if (r.ok && data?.url) { location.href = data.url; return; }
      setError(data?.message ?? "Payments aren’t available just now. Please try again later.");
    } catch {
      setError("We couldn’t reach Verisavo. Check your connection and try again.");
    }
    setBusy(false);
  }
  return (
    <div className="grid gap-2">
      <div><button type="button" className={kind === "subscribe" ? "btn" : "btn btn-ghost"} onClick={go} disabled={busy}>{busy ? "Opening…" : label}</button></div>
      {error && <p role="status" className="text-sm leading-snug text-danger">{error}</p>}
    </div>
  );
}

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

// WhatsApp (M4.2): a subscriber links one number. Either we send a code to it (typed in here), or, until Meta has
// approved the code template, they send a code from it to us; this card then refreshes until the link appears.
export function WhatsAppLink({ waUrl }: { waUrl: string | null }) {
  const router = useRouter();
  const [start, startAction, starting] = useActionState(startWhatsAppLink, null);
  const [check, checkAction, checking] = useActionState(verifyWhatsAppLink, null);
  const step = check?.linked ? null : start?.step;
  useEffect(() => { if (check?.linked) router.refresh(); }, [check, router]);
  useEffect(() => {   // reverse: wait for their WhatsApp message to arrive (up to 10 minutes)
    if (step !== "reverse") return;
    const timer = setInterval(() => router.refresh(), 3000);
    const stop = setTimeout(() => clearInterval(timer), 10 * 60 * 1000);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [step, router]);

  return (
    <div className="grid gap-3">
      <form action={startAction} className="grid gap-2">
        <label className="label" htmlFor="wa-phone">{"Your WhatsApp number"}</label>
        <div className="flex flex-wrap gap-2">
          <input className="input min-w-0 flex-1 basis-48" id="wa-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel"
            defaultValue={start?.phone ? `+${start.phone}` : ""} placeholder="+234 803 123 4567" required />
          <button className="btn" type="submit" disabled={starting}>{starting ? "Sending…" : step ? "Send a new code" : "Send code"}</button>
        </div>
        <p className="hint">{"Include your country code. One number per account."}</p>
        {start?.error && <p role="status" className="text-sm text-danger">{start.error}</p>}
      </form>

      {step === "code" && (
        <form action={checkAction} className="grid gap-2 rounded-xl bg-canvas p-3.5">
          <label className="label" htmlFor="wa-code">{"Enter the 6-digit code we sent to your WhatsApp"}</label>
          <div className="flex flex-wrap gap-2">
            <input className="input w-36 tracking-[.3em]" id="wa-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" required />
            <input type="hidden" name="phone" value={start?.phone ?? ""} />
            <button className="btn" type="submit" disabled={checking}>{checking ? "Checking…" : "Link number"}</button>
          </div>
          {check?.error && <p role="status" className="text-sm text-danger">{check.error}</p>}
        </form>
      )}

      {step === "reverse" && start?.url && (
        <div className="grid gap-2 rounded-xl bg-canvas p-3.5 text-sm">
          <p>{"To prove the number is yours, send this code to Verisavo from that WhatsApp:"}</p>
          <p className="font-mono text-2xl font-semibold tracking-[.3em]">{start.code}</p>
          <div><a className="btn" href={start.url} target="_blank" rel="noopener noreferrer">{"Send it on WhatsApp"}</a></div>
          <p className="hint" role="status">{"Waiting for your message… This page updates as soon as it arrives. The code works for 10 minutes."}</p>
        </div>
      )}
      {check?.linked && <p role="status" className="text-sm text-success">{"Linked. You can ask Verisavo on WhatsApp now."}{waUrl && <> <a href={waUrl} target="_blank" rel="noopener noreferrer">{"Open WhatsApp"}</a></>}</p>}
    </div>
  );
}

export function UnlinkWhatsApp() {
  return (
    <form action={unlinkWhatsApp} onSubmit={e => { if (!window.confirm("Unlink this number? Messages from it will no longer be answered.")) e.preventDefault(); }}>
      <button className="btn btn-ghost" type="submit">{"Unlink"}</button>
    </form>
  );
}
