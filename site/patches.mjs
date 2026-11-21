// Patches applied to the client's pages by scripts/build-site.mjs, after links are rewritten (so "assistant.html"
// already reads "/platform"). Each one finds an exact piece of the client's code and replaces it:
//   { page, name, find, replace, count }  find: string or RegExp, must match `count` times (default 1, or "any")
//   { page, name, from, to, replace }     the region from `from` up to the next `to` (exactly one)
// page: "index.html" | "assistant.html" | "docs.html" | "apply.html" | "*". If the client changes one of these places,
// the build stops and names the patch.
import fs from "node:fs";

const inject = name => fs.readFileSync(new URL(`./inject/${name}`, import.meta.url), "utf8");

// Our sign-in dialog: email + password, "Forgot password?", resend, and Google when it's switched on (site/live.js).
// Same ids as lib/authDialog.ts; the client's classes, so their styling applies.
const AUTH_DIALOG = `
  <div class="dlg">
    <div class="a-top">
      <div class="a-tabs" role="tablist" aria-label="Account">
        <button role="tab" data-mode="in" aria-selected="true">Sign in</button>
        <button role="tab" data-mode="up" aria-selected="false" tabindex="-1">Sign up</button>
      </div>
      <button type="button" class="x" id="a-x" aria-label="Close"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#1F273F" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <div class="stp">
      <h2 id="a-title">Welcome back</h2>
      <p id="a-lead">Sign in to your Verisavo account.</p>
      <div id="a-google-wrap" class="a-google-wrap" hidden>
        <button type="button" class="btn a-google wide" id="a-google">
          <svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>
        <div class="a-or"><span>or</span></div>
      </div>
      <form id="a-form" class="a-form" novalidate>
        <div class="a-field a-up" hidden><label class="field-label" for="a-name">Full name</label><input id="a-name" autocomplete="name" maxlength="120"></div>
        <div class="a-field a-up" hidden><label class="field-label" for="a-org">Organisation <span style="font-weight:400;color:#6D6C71">(optional)</span></label><input id="a-org" autocomplete="organization" maxlength="160"></div>
        <div class="a-field"><label class="field-label" for="a-email">Email</label><input id="a-email" type="email" autocomplete="email" maxlength="160" placeholder="you@company.com"></div>
        <div class="a-field a-pw"><label class="field-label" for="a-password">Password</label><input id="a-password" type="password" autocomplete="current-password" maxlength="72"><p class="a-hint a-up" hidden>At least 8 characters, with letters and numbers.</p></div>
        <button type="button" class="linkish a-forgot" id="a-forgot">Forgot password?</button>
        <button type="submit" class="btn btn-dark wide" id="a-submit">Sign in</button>
      </form>
      <div id="a-sent" class="a-sent" hidden>
        <b id="a-sent-title">Check your inbox</b>
        <p id="a-sent-text"></p>
        <button type="button" class="linkish" id="a-resend" hidden>Send the email again</button>
      </div>
      <p class="msg a-msg" id="a-msg" aria-live="polite"></p>
      <p class="a-switch"><span id="a-switch-text">New to Verisavo?</span> <button type="button" class="linkish" id="a-switch">Sign up</button></p>
    </div>
  </div>
`;
const authDialog = page => ({
  page, name: "auth dialog: real sign-in markup",
  find: /(<dialog id="auth"[^>]*>)[\s\S]*?(<\/dialog>)/,
  replace: (_m, open, close) => open + AUTH_DIALOG + close
});

// The plan as the proposal sets it (lib/plan.ts): 5 free questions, then $5 a month for 100 messages
const PRICING = `<header class="pg-head pc-head"><p class="lab">Pricing</p><h1 id="pricing-h">Start free. Upgrade when you need more.</h1><p class="pc-lead">Create a free account and ask Verisavo 5 questions. Verisavo Monthly gives you 100 messages a month on the web and WhatsApp, for $5 a month.</p></header>
<div class="pa-body">
<div class="vs-plans">
<section class="vs-plan" aria-label="Free"><p class="vs-plan-k">Free</p><p class="vs-plan-p"><b>$0</b></p><ul class="pa-list"><li>5 questions to the Verisavo Assistant</li><li>Answers from Verisavo’s approved research, with their sources</li><li>Your conversations saved in your account</li></ul><button type="button" class="obtn solid pa-cta" data-vs-signup>Create a free account</button></section>
<section class="vs-plan vs-plan-on" aria-label="Verisavo Monthly"><p class="vs-plan-k">Verisavo Monthly</p><p class="vs-plan-p"><b>$5</b><span>a month</span></p><ul class="pa-list"><li>100 messages a month, shared across web and WhatsApp</li><li>Ask on WhatsApp from your linked number</li><li>Attach files and images to your questions</li><li>Download answers and conversations as PDF reports</li><li>Cancel any time from your dashboard</li></ul><button type="button" class="obtn solid pa-cta" data-vs-subscribe>Subscribe</button></section>
</div>
<h2 class="pa-h2">Teams, more markets and SavoScouts</h2><ul class="pa-list"><li>The countries, cities and product categories you want to understand</li><li>How many people on your team use Verisavo</li><li>How often you need SavoScouts to investigate questions the existing evidence can’t answer</li></ul><div class="pa-ctas"><button type="button" class="obtn solid pa-cta" data-page="demo">Request a demo</button><button type="button" class="obtn pa-cta" data-page="contact">Contact us</button></div></div></div>
        `;

const SIGNIN_HOME = `  /* ---------- Sign in / Sign up: real accounts (site/live.js) ---------- */
  const signedUser = () => VSLive.cachedUser();
  const toApp = () => { location.href = "/assistant"; };
  const auth = $("#auth");
  const liveAuth = VSLive.setupAuth({ onSignedIn: toApp, googleNext: "/assistant" });
  const openAuth = (mode, lead) => { if (liveAuth) liveAuth.open(mode || "in", lead); };
  const closeAuth = () => { if (liveAuth) liveAuth.close(); };
  $$("[data-login]").forEach(b => b.addEventListener("click", () => signedUser() ? toApp() : openAuth("in")));
  $$("[data-signup]").forEach(b => b.addEventListener("click", () => signedUser() ? toApp() : openAuth("up")));

`;
const SIGNIN_PLATFORM = `  /* ---------- Sign in / Sign up: real accounts (site/live.js) ---------- */
  const auth = $("#auth");
  const afterSignIn = user => { const q = ($("#ask-input") || {}).value || ""; if (q.trim() && window.vaSetScope && window.vsPlace) window.vaSetScope(window.vsPlace()); if (window.vaOpen) window.vaOpen(user, q); };
  const liveAuth = VSLive.setupAuth({ onSignedIn: afterSignIn, googleNext: "/assistant" });
  const openAuth = (mode, lead) => { if (liveAuth) liveAuth.open(mode || "in", lead); };
  const closeAuth = () => { if (liveAuth) liveAuth.close(); };
  $$("[data-login]").forEach(b => b.addEventListener("click", () => window.vaSignedIn && window.vaSignedIn() ? window.vaOpen() : openAuth("in")));
  $$("[data-signup]").forEach(b => b.addEventListener("click", () => openAuth("up")));

`;

export const patches = [
  /* ---------- sign in ---------- */
  authDialog("index.html"),
  authDialog("assistant.html"),
  { page: "index.html", name: "homepage: real sign-in instead of the demo", from: "  /* ---------- Sign in / Sign up ----------", to: "  window.vsOpenAccess = q =>", replace: SIGNIN_HOME },
  { page: "assistant.html", name: "platform: real sign-in instead of the demo", from: "  /* ---------- Sign in / Sign up ----------", to: "  /* Legal dialog: shows only the document that was clicked */", replace: SIGNIN_PLATFORM },
  // the client's sign-in styling pass: clients get Sign in + Sign up (proposal: free accounts), not "Request a demo" only
  { page: ["index.html", "assistant.html"], name: "sign-in tweak: always the account flow for clients", find: "if (window.vsAuthOriginal && !scout) {", count: "any", replace: "if (!scout) {" },

  /* ---------- the Assistant on /platform and /assistant ---------- */
  // signed in = the server says so (site/live.js keeps sessionStorage in step with /api/auth/me)
  { page: "assistant.html", name: "platform: saved user from the live session",
    find: 'let savedUser = null;\n  try { savedUser = JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) {}',
    replace: "let savedUser = VSLive.cachedUser();" },
  { page: "assistant.html", name: "platform: /assistant opens the app",
    find: "const arrive = location.hash.slice(1);",
    replace: 'const arrive = location.hash.slice(1) || (location.pathname === "/assistant" ? "app" : "");' },
  { page: "assistant.html", name: "platform: #app needs an account",
    find: 'else if (arrive === "app") setTimeout(() => window.vaOpen(savedUser || { name: "", email: "" }, carried), 80);',
    replace: 'else if (arrive === "app") setTimeout(() => VSLive.me().then(u => u ? window.vaOpen(u, carried) : openAuth("in", "Sign in to open the Verisavo Assistant.")), 80);' },
  { page: "assistant.html", name: "platform: follow the server session",
    find: 'if (savedUser && savedUser.role !== "scout" && window.vaRestore) window.vaRestore(savedUser);',
    replace: 'if (savedUser && window.vaRestore) window.vaRestore(savedUser);\n  VSLive.me().then(u => { if (u && window.vaRestore) window.vaRestore(u); else if (!u && window.vaForget) window.vaForget(); });' },
  { page: "assistant.html", name: "platform: forget a signed-out user",
    find: "window.vaSignedIn = () => !!state.user;",
    replace: "window.vaSignedIn = () => !!state.user;\n    window.vaForget = () => { state.user = null; };" },
  { page: "assistant.html", name: "platform: sign out for real",
    find: 'state.user = null; state.convs = []; try { sessionStorage.removeItem("verisavo-user"); } catch (e) {} newConv(); closePops(); closeVa();',
    replace: "state.user = null; closePops(); closeVa(); VSLive.signOut();" },
  // the client's assistant module: real answers, conversations, uploads, PDF (site/inject/assistant-live.js)
  { page: "assistant.html", name: "assistant: live layer",
    find: "  CUR = null; S = blank('New question');\n  window.vapxAsk",
    replace: () => inject("assistant-live.js") + "\n  CUR = null; S = blank('New question');\n  window.vapxAsk" },
  { page: "assistant.html", name: "assistant: renaming a saved conversation",
    find: "if (save && x && v) { x.t = v; if (x.k === CUR) S.title = v; }",
    replace: "if (save && x && v) { x.t = v; if (x.k === CUR) S.title = v; if (window.VSLive && !/^new-/.test(x.k)) VSLive.renameConversation(x.k, v); }" },

  /* ---------- features that aren't built yet: "Coming soon" ---------- */
  { page: ["index.html", "assistant.html"], name: "early access / SavoScouts WhatsApp sign-up", find: "function openAccess() {", count: "any",
    replace: 'function openAccess() { if (window.VSLive) return VSLive.soon("scouts");' },
  { page: "assistant.html", name: "sidebar: coming-soon items",
    find: "var item = function (key, label, icon) {",
    replace: "var vsSoonItem = function (label, icon, kind) { return '<li><button type=\"button\" class=\"va-nav vsn-i vsn-soon\" data-vs-soon=\"' + kind + '\">' + svg(icon) + '<span>' + label + '</span><em>Coming soon</em></button></li>'; };\n  var item = function (key, label, icon) {" },
  { page: "assistant.html", name: "sidebar: Overview", find: 'item("c-overview", "Overview", "grid")', replace: 'vsSoonItem("Overview", "grid", "overview")' },
  { page: "assistant.html", name: "sidebar: Investigations", find: 'item("c-surveys", "Investigations", "clip") + item("c-builder", "Create a task", "task")', replace: 'vsSoonItem("Investigations", "clip", "investigations") + vsSoonItem("Create a task", "task", "investigations")' },
  { page: "assistant.html", name: "sidebar: company Knowledge Base",
    find: `'<p class="vsn-h">Company</p><ul><li><button type="button" class="va-nav vsn-i" id="vsn-kb">' + svg("db") + "<span>Knowledge Base</span></button></li></ul>"`,
    replace: `'<p class="vsn-h">Company</p><ul>' + vsSoonItem("Company knowledge", "db", "knowledge") + "</ul>"` },
  { page: "assistant.html", name: "company knowledge from the menu", find: 'if (t.closest("#kb-nav")) { e.preventDefault(); open(!get()); return; }',
    replace: 'if (t.closest("#kb-nav")) { e.preventDefault(); e.stopPropagation(); VSLive.soon("knowledge"); return; }' },

  /* ---------- profile panel: real account, plan and billing ---------- */
  { page: "assistant.html", name: "profile: plan card",
    find: `'<div class="vp-plan"><span><b>Verisavo plan</b><span>Early access</span></span><a class="vp-pill" href="' + L.pricing + '">Manage plan</a></div>'`,
    replace: `(function () { var pu = VSLive.usageNow(); return '<div class="vp-plan"><span><b>' + esc(VSLive.planName(pu)) + '</b><span>' + esc(pu ? VSLive.planLine(pu) : (u ? "Loading your plan…" : "Not signed in")) + '</span></span>' + (u ? '<button type="button" class="vp-pill" data-vp="plan">' + (pu && pu.plan === "paid" ? "Manage plan" : "Upgrade") + '</button>' : '') + '</div>'; })()` },
  { page: "assistant.html", name: "profile: account links to the dashboard",
    find: `(editing ? "" : '<button type="button" class="vp-i" data-vp="edit">' + svg("user") + "<span>Edit profile</span></button>")`,
    replace: `(u ? link("/dashboard#profile", "user", "Edit profile") + link("/dashboard#whatsapp", "chat", "WhatsApp") + link("/dashboard#plan", "brief", "Plan and billing") + link("/dashboard/conversations", "inv", "All conversations") + (u.admin ? link("/admin", "grid", "Admin dashboard") : "") : "")` },
  { page: "assistant.html", name: "profile: no notification switches (not built)",
    from: `'<div class="vp-row"><label for="vp-n1">Investigation updates`, to: `"</div>" +\n      '<div class="vp-sec"><p class="vp-h">Your platform</p>'`, replace: "" },
  { page: "assistant.html", name: "profile: no SavoScout opportunities link",
    find: `link(L.portal, "brief", "SavoScout opportunities") + `, replace: "" },
  { page: "assistant.html", name: "profile: Upgrade / Manage plan button",
    find: `if (v === "out") { close();`, replace: `if (v === "plan") { close(); VSLive.managePlan(); return; }\n    if (v === "out") { close();` },
  { page: "assistant.html", name: "profile: fresh plan when opened",
    find: "function open() { render(); panel.hidden = false;",
    replace: "function open() { VSLive.usage(true).then(function () { if (panel.classList.contains(\"on\")) render(); }); render(); panel.hidden = false;" },
  { page: "assistant.html", name: "profile: footnote",
    find: "Preview: settings are kept in this browser.", replace: "Appearance and default market are saved in this browser." },

  /* ---------- pricing: the proposal's plan ---------- */
  { page: "index.html", name: "pricing page", from: '<header class="pg-head pc-head"><p class="lab">Pricing</p>', to: '<footer class="pg-foot">', replace: PRICING }
];
