// Sign in, sign up and password reset dialog (#auth), shared by the homepage and the Platform page.
// Live once M1 is released (<body data-release> >= 1): it talks to /api/auth/*. Before that it runs the old demo,
// and nothing is sent anywhere. The session lives in httpOnly cookies, so this script never sees any tokens.

export type PublicUser = { id: string; email: string; name: string; organisation: string; role: string };
export type DemoUser = { name: string; email: string; organisation: string };
type Mode = "in" | "up" | "forgot";
type ApiResult = { ok: boolean; status: number; data: { error?: string; message?: string; user?: PublicUser; url?: string } };

// The dialog markup always exists on both pages, so a missing element is a bug worth failing loudly on
function $<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`authDialog: ${selector} is missing`);
  return el;
}
const $$ = <T extends Element = HTMLElement>(selector: string) => Array.from(document.querySelectorAll<T>(selector));

export const authLive = (): boolean => Number(document.body.dataset.release || 0) >= 1;
// M5.3: once M5 is released, the "early access" entry points open sign-up instead of the early-access demo
export const startFreeLive = (): boolean => Number(document.body.dataset.release || 0) >= 5;

async function post(url: string, body?: unknown): Promise<ApiResult> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
  let data: ApiResult["data"] = {};
  try { data = await r.json(); } catch {}
  return { ok: r.ok, status: r.status, data };
}

// The signed-in user, or null
export async function fetchUser(): Promise<PublicUser | null> {
  if (!authLive()) return null;
  try {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    return r.ok ? ((await r.json()).user as PublicUser | null) ?? null : null;
  } catch { return null; }
}

export async function signOut(): Promise<void> {
  if (authLive()) { try { await post("/api/auth/logout"); } catch {} }
}

// Signed in: the navigation's "Sign in" / "Log in" buttons become "Dashboard" (their click handlers go to /dashboard),
// and "Start free" buttons become "Ask Verisavo" (their click handlers open the assistant)
export function markSignedIn(): void {
  $$("[data-login], [data-dialog='signin']").forEach(el => { el.textContent = "Dashboard"; });
  $$("[data-start]").forEach(el => {
    const label = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
    if (label) label.textContent = label.textContent?.endsWith(" ") ? "Ask Verisavo " : "Ask Verisavo";
  });
}

// Opens the assistant (/assistant, sign-in only), handing over the visitor's question and market
// (read once by app/(app)/assistant/Assistant.tsx)
export function openAssistant(question = "", scope = "", replace = false): void {
  const q = question.trim();
  if (q) { try { sessionStorage.setItem("verisavo-ask", JSON.stringify({ q, scope })); } catch {} }
  if (replace) location.replace("/assistant"); else location.href = "/assistant";
}

const TEXT: Record<Mode, { title: string; lead: string; submit: string; switchText: string; switchBtn: string }> = {
  in: { title: "Welcome back", lead: "Sign in to your Verisavo account.", submit: "Sign in", switchText: "New to Verisavo?", switchBtn: "Sign up" },
  up: { title: "Create your account", lead: "Sign up to start with Verisavo.", submit: "Create account", switchText: "Already have an account?", switchBtn: "Sign in" },
  forgot: { title: "Reset your password", lead: "Enter your email and we'll send you a link to choose a new password.", submit: "Send reset link", switchText: "Remembered it?", switchBtn: "Sign in" }
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Options = {
  onSignedIn: (user: PublicUser) => void;   // after a real sign in
  onDemo: (user: DemoUser) => void;         // the stand-in before release (user = what was typed)
  beforeGoogle?: () => string;              // where to land after Google sign-in; runs just before leaving the page
};

export default function setupAuthDialog({ onSignedIn, onDemo, beforeGoogle }: Options) {
  if (!document.querySelector("#auth")) return null;
  const auth = $<HTMLDialogElement>("#auth");
  const tabs = $$<HTMLButtonElement>("#auth [role=tab]");
  const msg = $("#a-msg"), form = $<HTMLFormElement>("#a-form"), sent = $("#a-sent"), submit = $<HTMLButtonElement>("#a-submit");
  const field = (id: string) => $<HTMLInputElement>("#a-" + id);
  const googleWrap = $("#a-google-wrap");
  let mode: Mode = "in", opener: Element | null = null, sentTo = "", googleOn = false;

  // Arriving from an expired or reused email link (/auth/confirm sends people to ?auth=link-expired#signin)
  const params = new URLSearchParams(location.search);
  const NOTICES: Record<string, string> = {
    "link-expired": "That link has expired or was already used. Sign in, or ask for a new email.",
    "too-many": "Too many attempts. Please wait a few minutes and try again.",
    "google-failed": "Google sign-in didn't finish. Please try again, or use your email.",
    "disabled": "This account is disabled. Please contact Verisavo."
  };
  let notice = NOTICES[params.get("auth") ?? ""] ?? "";
  if (params.has("auth")) {
    params.delete("auth");
    const qs = params.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }

  function setMode(m: Mode) {
    mode = m;
    const t = TEXT[m];
    tabs.forEach(tab => { const on = tab.dataset.mode === m; tab.setAttribute("aria-selected", String(on)); tab.tabIndex = on ? 0 : -1; });
    $("#a-title").textContent = t.title;
    $("#a-lead").textContent = t.lead;
    submit.textContent = t.submit;
    $("#a-switch-text").textContent = t.switchText;
    $("#a-switch").textContent = t.switchBtn;
    $$("#auth .a-up").forEach(el => { el.hidden = m !== "up"; });
    $("#auth .a-pw").hidden = m === "forgot";
    $("#a-forgot").hidden = m !== "in";
    googleWrap.hidden = !googleOn || m === "forgot";
    field("password").autocomplete = m === "up" ? "new-password" : "current-password";
    msg.textContent = ""; form.hidden = false; sent.hidden = true;
  }
  function open(m: Mode = "in") {
    opener = document.activeElement;
    setMode(m);
    if (notice) { msg.textContent = notice; notice = ""; }
    if (auth.showModal) auth.showModal(); else auth.setAttribute("open", "");
    setTimeout(() => (mode === "up" ? field("name") : field("email")).focus(), 30);
  }
  const close = () => { if (auth.close) auth.close(); else auth.removeAttribute("open"); };
  const fail = (text: string, focusId?: string) => { msg.textContent = text; if (focusId) field(focusId).focus(); };
  const showSent = (title: string, text: string, canResend: boolean) => {
    $("#a-sent-title").textContent = title; $("#a-sent-text").textContent = text;
    $("#a-resend").hidden = !canResend; form.hidden = true; sent.hidden = false; msg.textContent = ""; googleWrap.hidden = true;
  };

  auth.addEventListener("close", () => {
    if (!auth.dataset.handoff && opener instanceof HTMLElement) opener.focus();
    delete auth.dataset.handoff;
  });
  auth.addEventListener("click", e => { if (e.target === auth) close(); });
  $("#a-x").addEventListener("click", close);
  tabs.forEach(t => t.addEventListener("click", () => setMode(t.dataset.mode as Mode)));
  $("#a-switch").addEventListener("click", () => setMode(mode === "in" ? "up" : "in"));
  $("#a-forgot").addEventListener("click", () => { setMode("forgot"); field("email").focus(); });

  // The Google button only appears once Google is switched on in Supabase
  if (authLive()) {
    fetch("/api/auth/options", { cache: "no-store" }).then(r => (r.ok ? r.json() : null)).then(o => {
      googleOn = Boolean(o?.google);
      if (form.hidden === false) googleWrap.hidden = !googleOn || mode === "forgot";
    }).catch(() => {});
  }
  $<HTMLButtonElement>("#a-google").addEventListener("click", async e => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.disabled = true; msg.textContent = "";
    try {
      const r = await post("/api/auth/google", { next: beforeGoogle ? beforeGoogle() : "/dashboard" });
      if (r.ok && r.data.url) { location.href = r.data.url; return; }
      msg.textContent = r.data.message || "We couldn't open Google sign-in. Please try again.";
    } catch { msg.textContent = "Something went wrong. Check your connection and try again."; }
    btn.disabled = false;
  });

  $<HTMLButtonElement>("#a-resend").addEventListener("click", async e => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.disabled = true;
    try {
      const r = await post("/api/auth/resend", { email: sentTo });
      msg.textContent = r.ok ? "We sent the email again. It can take a minute to arrive." : r.data.message || "We couldn't send it. Please try again.";
    } catch { msg.textContent = "Something went wrong. Check your connection and try again."; }
    finally { btn.disabled = false; }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault(); msg.textContent = "";
    const email = field("email").value.trim(), password = field("password").value;
    const name = field("name").value.trim(), organisation = field("org").value.trim();
    if (mode === "up" && !name) return fail("Enter your name.", "name");
    if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.", "email");
    if (mode !== "forgot" && !password) return fail("Enter your password.", "password");
    if (mode === "up" && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) return fail("Use at least 8 characters, with letters and numbers.", "password");

    if (!authLive()) { auth.dataset.handoff = "1"; close(); onDemo({ name, email, organisation }); return; }

    const label = submit.textContent; submit.disabled = true; submit.textContent = "One moment…";
    try {
      if (mode === "in") {
        const r = await post("/api/auth/login", { email, password });
        if (r.data.error === "email_not_confirmed") { sentTo = email; return showSent("Confirm your email", "Open the link we sent to " + email + " to finish creating your account.", true); }
        if (!r.ok || !r.data.user) return fail(r.data.message || "We couldn't sign you in. Please try again.", "password");
        field("password").value = ""; auth.dataset.handoff = "1"; close(); onSignedIn(r.data.user);
      } else if (mode === "up") {
        const r = await post("/api/auth/signup", { email, password, name, organisation });
        if (!r.ok) return fail(r.data.message || "We couldn't create your account. Please try again.");
        field("password").value = ""; sentTo = email;
        showSent("Check your inbox", "We sent a confirmation link to " + email + ". Open it to activate your account.", true);
      } else {
        const r = await post("/api/auth/forgot", { email });
        if (!r.ok) return fail(r.data.message || "We couldn't send that. Please try again.", "email");
        showSent("Check your inbox", "If " + email + " has a Verisavo account, we've sent it a link to choose a new password.", false);
      }
    } catch { msg.textContent = "Something went wrong. Check your connection and try again."; }
    finally { submit.disabled = false; submit.textContent = label; }
  });

  return { open, close, setMode };
}
