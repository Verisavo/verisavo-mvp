/* Verisavo live runtime: connects the client-designed website (public/site, built by scripts/build-site.mjs) to the
   real backend. Loaded first on every page; the patched page scripts call window.VSLive.

   - session: /api/auth/me (httpOnly cookies; this script never sees a token). The signed-in user is mirrored into
     sessionStorage "verisavo-user", which the client's scripts read to show the name.
   - sign in / sign up / reset: /api/auth/* (same rules as lib/authDialog.ts: email + password, Google when it's on)
   - Assistant: /api/assistant (streamed NDJSON), conversations, attachments, PDF reports
   - plan: /api/billing/usage, checkout and portal
   - "Coming soon" for features that aren't built yet

   Plain browser JavaScript (no build step): it ships as is. Never put secrets or server code here. */
(function () {
  "use strict";
  if (window.VSLive) return;
  var VS = window.VSLive = {};
  var UKEY = "verisavo-user";
  // the plan rules, for display only (lib/plan.ts is the source; the server enforces them)
  var PLAN = VS.PLAN = { FREE: 5, PAID: 100, PRICE: "$5 a month" };

  // Company knowledge onboarding isn't built: tell the client's script it was skipped
  try { sessionStorage.setItem("vs-company-skip", "1"); } catch (e) {}

  /* ---------- small helpers ---------- */
  var esc = VS.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ready = VS.ready = function (fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); };
  var uuid = VS.uuid = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  };
  function req(method, url, body) {
    var init = { method: method, headers: { "Content-Type": "application/json", Accept: "application/json" }, cache: "no-store" };
    if (method !== "GET") init.body = JSON.stringify(body || {});
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, status: r.status, data: data || {} }; });
    });
  }
  VS.post = function (url, body) { return req("POST", url, body); };
  VS.get = function (url) { return req("GET", url); };
  VS.del = function (url) { return req("DELETE", url, {}); };

  /* ---------- toast ---------- */
  var toastEl, toastT;
  VS.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement("div"); toastEl.className = "vs-toast"; toastEl.setAttribute("role", "status"); toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    var host = document.querySelector("dialog[open]:not(#soon)"); if (host && toastEl.parentNode !== host) host.appendChild(toastEl); else if (!host && toastEl.parentNode !== document.body) document.body.appendChild(toastEl);
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 3200);
  };

  /* ---------- the signed-in user ---------- */
  function store(u) {
    try {
      if (u) sessionStorage.setItem(UKEY, JSON.stringify({ id: u.id, name: u.name || "", email: u.email || "", organisation: u.organisation || "", role: "client", admin: u.role === "admin", live: true }));
      else sessionStorage.removeItem(UKEY);
    } catch (e) {}
  }
  // the user this browser tab last saw from the server (written only by this script), or null
  VS.cachedUser = function () {
    try { var u = JSON.parse(sessionStorage.getItem(UKEY) || "null"); return u && u.live ? u : null; } catch (e) { return null; }
  };
  var mePromise = null, liveFlag = null;
  // resolves to the signed-in user or null; also says whether accounts are switched on (RELEASE_STAGE >= 1)
  VS.me = function (fresh) {
    if (mePromise && !fresh) return mePromise;
    mePromise = fetch("/api/auth/me", { cache: "no-store" }).then(function (r) {
      liveFlag = r.status !== 404;
      return r.ok ? r.json() : { user: null };
    }).then(function (d) {
      var u = (d && d.user) || null; store(u);
      document.dispatchEvent(new CustomEvent("vs:user", { detail: u }));
      return u;
    }).catch(function () { return VS.cachedUser(); });
    return mePromise;
  };
  VS.live = function () { return liveFlag !== false; };
  VS.me();

  /* ---------- smooth page changes ----------
     A plain cover (html::after) hides the page while it changes hands, so nothing flashes:
     - /assistant: covered until the Assistant window is open (or sign-in opens), so the product page never shows first
     - signing out: the cover fades in over everything, then the homepage loads */
  var root = document.documentElement;
  // /assistant always opens the app; /platform#app does when this tab already knows the user
  if (location.pathname === "/assistant" || (location.hash === "#app" && VS.cachedUser())) { root.setAttribute("data-vs-cover", "Opening your Assistant…"); root.classList.add("vs-cover"); }
  VS.uncover = function () { root.classList.remove("vs-cover"); };
  VS.cover = function (text) { root.setAttribute("data-vs-cover", text || ""); root.classList.add("vs-cover"); };
  setTimeout(VS.uncover, 10000);   // never leave a page covered
  ready(function () {
    if (!root.classList.contains("vs-cover")) return;
    var watch = function () { var open = document.querySelector("#va[open], #auth[open]"); if (open) { VS.uncover(); mo.disconnect(); } };
    var mo = new MutationObserver(watch); mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] }); watch();
  });

  VS.signOut = function () {
    VS.cover("Signing out…");
    store(null);
    try { ["verisavo-q", "verisavo-ask", "vs-usage"].forEach(function (k) { sessionStorage.removeItem(k); }); } catch (e) {}
    // the open Assistant window would sit above the cover (it's in the top layer), so it closes once the cover is in
    setTimeout(function () { var va = document.querySelector("#va[open]"); if (va && va.close) va.close(); }, 220);
    return VS.post("/api/auth/logout").catch(function () {}).then(function () { location.replace("/"); });
  };

  /* ---------- plan and billing ---------- */
  var usageCache = null;
  VS.usage = function (fresh) {
    if (usageCache && !fresh) return Promise.resolve(usageCache);
    return VS.get("/api/billing/usage").then(function (r) { if (r.ok && r.data.usage) VS.setUsage(r.data.usage); return usageCache; }).catch(function () { return usageCache; });
  };
  VS.setUsage = function (u) { usageCache = u; document.dispatchEvent(new CustomEvent("vs:usage", { detail: u })); };
  VS.remaining = function (n) { if (usageCache && typeof n === "number") VS.setUsage(Object.assign({}, usageCache, { remaining: n, used: usageCache.limit - n })); };
  VS.planName = function (u) { return !u ? "Verisavo" : u.plan === "paid" ? "Verisavo Monthly" : "Free plan"; };
  VS.planLine = function (u) {
    if (!u) return "";
    if (u.plan === "paid") {
      var d = u.resetsAt ? new Date(u.resetsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
      return u.remaining + " of " + u.limit + " messages left" + (d ? " · resets " + d : "") + (u.pastDue ? " · payment due" : "");
    }
    return u.remaining + " of " + u.limit + " free questions left";
  };
  function goBilling(url) {
    return VS.post(url).then(function (r) {
      if (r.ok && r.data.url) { location.href = r.data.url; return; }
      if (r.status === 401) { VS.openSignIn("in"); return; }
      VS.toast(r.data.message || "We couldn’t open the payment page. Please try again in a moment.");
    }).catch(function () { VS.toast("Something went wrong. Check your connection and try again."); });
  }
  // Stripe Checkout for Verisavo Monthly (or the portal, if a subscription already exists: the server decides)
  VS.subscribe = function () {
    return VS.me().then(function (u) { if (!u) { VS.openSignIn("up", "Create your account first, then subscribe to Verisavo Monthly."); return; } return goBilling("/api/billing/checkout"); });
  };
  VS.portal = function () { return goBilling("/api/billing/portal"); };
  VS.managePlan = function () { return VS.usage().then(function (u) { return u && u.plan === "paid" ? VS.portal() : VS.subscribe(); }); };

  /* ---------- "Coming soon" ---------- */
  var SOON = {
    investigations: ["SavoScouts investigations", "Soon you will be able to send SavoScouts to gather and verify Ground-Level Intelligence where existing information falls short. We are preparing this now."],
    scouts: ["SavoScouts", "The SavoScouts community is opening soon. You will be able to join, take short tasks in your local market and earn VeriPoints."],
    overview: ["Overview dashboard", "Dashboards of your markets and investigations are coming soon. For now, ask the Verisavo Assistant."],
    knowledge: ["Company knowledge", "Soon you will be able to tell Verisavo about your company so answers fit your business. For now, attach files to a question (Verisavo Monthly)."],
    workspace: ["Team workspaces", "Inviting colleagues to a shared workspace is coming soon."],
    evidence: ["Add market evidence", "Choosing signals and reports to inform a question is coming soon."],
    credits: ["Investigation credits", "Buying verified responses from SavoScouts is coming soon. Verisavo Monthly is available now."],
    careers: ["Applications", "Online applications open soon. Meanwhile, email career@verisavo.com with the role in the subject line."]
  };
  VS.soon = function (kind, title, text) {
    var s = SOON[kind] || [title || "Coming soon", text || "We are preparing this now."];
    var d = document.getElementById("soon");
    if (!d) { VS.toast(s[0] + ": coming soon"); return; }
    var h = d.querySelector("#soon-h"), p = d.querySelector("#soon-h + p");
    if (h) h.textContent = title || s[0]; if (p) p.textContent = text || s[1];
    if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
    setTimeout(function () { var b = d.querySelector(".btn"); if (b) b.focus(); }, 30);
  };
  ready(function () {
    var d = document.getElementById("soon"); if (!d || d.dataset.vsLive) return; d.dataset.vsLive = "1";
    d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-soon-close]")) { if (d.close) d.close(); else d.removeAttribute("open"); } });
  });

  /* ---------- sign in, sign up, password reset (#auth) ---------- */
  var TEXT = {
    in: { title: "Welcome back", lead: "Sign in to your Verisavo account.", submit: "Sign in", switchText: "New to Verisavo?", switchBtn: "Sign up" },
    up: { title: "Create your account", lead: "Sign up free and ask Verisavo " + PLAN.FREE + " questions.", submit: "Create account", switchText: "Already have an account?", switchBtn: "Sign in" },
    forgot: { title: "Reset your password", lead: "Enter your email and we'll send you a link to choose a new password.", submit: "Send reset link", switchText: "Remembered it?", switchBtn: "Sign in" }
  };
  var NOTICES = {
    "link-expired": "That link has expired or was already used. Sign in, or ask for a new email.",
    "too-many": "Too many attempts. Please wait a few minutes and try again.",
    "google-failed": "Google sign-in didn't finish. Please try again, or use your email.",
    "disabled": "This account is disabled. Please contact Verisavo."
  };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var authApi = null;
  // onSignedIn(user): what the page does after a password sign-in. googleNext: where Google sign-in returns to.
  VS.setupAuth = function (opts) {
    if (authApi) return authApi;
    var auth = $("#auth"); if (!auth || !$("#a-password")) return null;
    opts = opts || {};
    var tabs = $$("#auth [role=tab]"), msg = $("#a-msg"), form = $("#a-form"), sent = $("#a-sent"), submit = $("#a-submit"), googleWrap = $("#a-google-wrap");
    var field = function (id) { return $("#a-" + id); };
    var mode = "in", opener = null, sentTo = "", googleOn = false;
    var params = new URLSearchParams(location.search), notice = NOTICES[params.get("auth") || ""] || "";
    if (params.has("auth")) { params.delete("auth"); var qs = params.toString(); history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash); }

    function setMode(m, lead) {
      mode = m; var t = TEXT[m];
      tabs.forEach(function (tab) { var on = tab.dataset.mode === m; tab.setAttribute("aria-selected", String(on)); tab.tabIndex = on ? 0 : -1; });
      $("#a-title").textContent = t.title; $("#a-lead").textContent = lead || t.lead; submit.textContent = t.submit;
      $("#a-switch-text").textContent = t.switchText; $("#a-switch").textContent = t.switchBtn;
      $$("#auth .a-up").forEach(function (el) { el.hidden = m !== "up"; });
      $("#auth .a-pw").hidden = m === "forgot"; $("#a-forgot").hidden = m !== "in";
      googleWrap.hidden = !googleOn || m === "forgot";
      field("password").autocomplete = m === "up" ? "new-password" : "current-password";
      msg.textContent = ""; form.hidden = false; sent.hidden = true;
      // the client's styling pass (full-page dialog, logo bar); our wording stays
      window.vsAuthOriginal = true; window.vsAuthRole = "";
      if (window.vsAuthTweak) window.vsAuthTweak(m);
    }
    function open(m, lead) {
      opener = document.activeElement; setMode(m || "in", lead);
      if (notice) { msg.textContent = notice; notice = ""; }
      if (!auth.open) { if (auth.showModal) auth.showModal(); else auth.setAttribute("open", ""); }
      setTimeout(function () { (mode === "up" ? field("name") : field("email")).focus(); }, 30);
    }
    var close = function () { if (auth.close) auth.close(); else auth.removeAttribute("open"); };
    var fail = function (text, focusId) { msg.textContent = text; if (focusId) field(focusId).focus(); };
    var showSent = function (title, text, canResend) {
      $("#a-sent-title").textContent = title; $("#a-sent-text").textContent = text;
      $("#a-resend").hidden = !canResend; form.hidden = true; sent.hidden = false; msg.textContent = ""; googleWrap.hidden = true;
    };

    auth.addEventListener("close", function () { if (!auth.dataset.handoff && opener && opener.focus) opener.focus(); delete auth.dataset.handoff; });
    auth.addEventListener("click", function (e) { if (e.target === auth) close(); });
    $("#a-x").addEventListener("click", close);
    tabs.forEach(function (t) { t.addEventListener("click", function () { setMode(t.dataset.mode); }); });
    $("#a-switch").addEventListener("click", function (e) { e.preventDefault(); e.stopImmediatePropagation(); setMode(mode === "in" ? "up" : "in"); });
    $("#a-forgot").addEventListener("click", function () { setMode("forgot"); field("email").focus(); });

    fetch("/api/auth/options", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (o) {
      googleOn = !!(o && o.google);
      if (!form.hidden) googleWrap.hidden = !googleOn || mode === "forgot";
    }).catch(function () {});
    $("#a-google").addEventListener("click", function (e) {
      e.preventDefault(); var btn = e.currentTarget; btn.disabled = true; msg.textContent = "";
      VS.post("/api/auth/google", { next: typeof opts.googleNext === "function" ? opts.googleNext() : (opts.googleNext || "/assistant") }).then(function (r) {
        if (r.ok && r.data.url) { location.href = r.data.url; return; }
        msg.textContent = r.data.message || "We couldn't open Google sign-in. Please try again."; btn.disabled = false;
      }).catch(function () { msg.textContent = "Something went wrong. Check your connection and try again."; btn.disabled = false; });
    });
    $("#a-resend").addEventListener("click", function (e) {
      var btn = e.currentTarget; btn.disabled = true;
      VS.post("/api/auth/resend", { email: sentTo }).then(function (r) {
        msg.textContent = r.ok ? "We sent the email again. It can take a minute to arrive." : r.data.message || "We couldn't send it. Please try again.";
      }).catch(function () { msg.textContent = "Something went wrong. Check your connection and try again."; }).then(function () { btn.disabled = false; });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); e.stopImmediatePropagation(); msg.textContent = "";
      var email = field("email").value.trim(), password = field("password").value, name = field("name").value.trim(), organisation = field("org").value.trim();
      if (mode === "up" && !name) return fail("Enter your name.", "name");
      if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.", "email");
      if (mode !== "forgot" && !password) return fail("Enter your password.", "password");
      if (mode === "up" && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) return fail("Use at least 8 characters, with letters and numbers.", "password");
      var label = submit.textContent; submit.disabled = true; submit.textContent = "One moment…";
      var leaving = false;
      var done = function () { if (leaving) return; submit.disabled = false; submit.textContent = label; };
      var p;
      if (mode === "in") p = VS.post("/api/auth/login", { email: email, password: password }).then(function (r) {
        if (r.data.error === "email_not_confirmed") { sentTo = email; return showSent("Confirm your email", "Open the link we sent to " + email + " to finish creating your account.", true); }
        if (!r.ok || !r.data.user) return fail(r.data.message || "We couldn't sign you in. Please try again.", "password");
        field("password").value = ""; store(r.data.user); mePromise = Promise.resolve(r.data.user); usageCache = null;
        document.dispatchEvent(new CustomEvent("vs:user", { detail: r.data.user }));
        // going to another page: the dialog stays up (no flash of this page) until the next page loads
        if (opts.navigates || !opts.onSignedIn) { leaving = true; submit.textContent = "Opening your Assistant…"; location.href = "/assistant"; return; }
        auth.dataset.handoff = "1"; close();
        opts.onSignedIn(r.data.user);
      });
      else if (mode === "up") p = VS.post("/api/auth/signup", { email: email, password: password, name: name, organisation: organisation }).then(function (r) {
        if (!r.ok) return fail(r.data.message || "We couldn't create your account. Please try again.");
        field("password").value = ""; sentTo = email;
        showSent("Check your inbox", "We sent a confirmation link to " + email + ". Open it to activate your account, then sign in.", true);
      });
      else p = VS.post("/api/auth/forgot", { email: email }).then(function (r) {
        if (!r.ok) return fail(r.data.message || "We couldn't send that. Please try again.", "email");
        showSent("Check your inbox", "If " + email + " has a Verisavo account, we've sent it a link to choose a new password.", false);
      });
      p.catch(function () { msg.textContent = "Something went wrong. Check your connection and try again."; }).then(done);
    }, true);

    authApi = { open: open, close: close, setMode: setMode };
    if (notice || location.hash === "#signin") setTimeout(function () { open("in"); }, 120);
    return authApi;
  };
  // open the dialog (or go to the Assistant when already signed in)
  VS.openSignIn = function (m, lead) {
    if (authApi) return authApi.open(m || "in", lead);
    location.href = "/platform#signin";
  };

  /* ---------- the Assistant API ---------- */
  // ask({ question, market, conversationId, attachmentIds }, { start, delta, done, error, blocked })
  VS.ask = function (q, on) {
    var body = { question: q.question, market: q.market || "All markets", requestId: uuid(), conversationId: q.conversationId || null, attachmentIds: q.attachmentIds || [] };
    var errored = false, finished = false;
    var fail = function (m) { if (errored || finished) return; errored = true; on.error && on.error(m); };
    return fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(function (res) {
      if (res.status === 401) { store(null); fail("Your session has ended. Please sign in again."); VS.openSignIn("in"); return; }
      if ((res.headers.get("content-type") || "").indexOf("ndjson") < 0) {
        return res.json().catch(function () { return {}; }).then(function (d) {
          if (res.status === 402 && d.reason && d.usage) { VS.setUsage(d.usage); on.blocked && on.blocked(d.reason, d.usage); }
          else if (res.status === 429) fail("You’re asking very quickly. Please wait a minute and try again.");
          else fail(d.message || "The assistant couldn’t answer just now. Please try again.");
        });
      }
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = "";
      var handle = function (m) {
        if (m.type === "start") { if (typeof m.remaining === "number") VS.remaining(m.remaining); on.start && on.start(m); }
        else if (m.type === "delta" && m.text) on.delta && on.delta(m.text);
        else if (m.type === "done") { finished = true; on.done && on.done(m); }
        else if (m.type === "error") { if (typeof m.remaining === "number") VS.remaining(m.remaining); fail(m.message || "The assistant couldn’t answer just now. Please try again."); }
      };
      var pump = function () {
        return reader.read().then(function (r) {
          if (r.done) { if (!finished) fail("No answer arrived. Please try again."); return; }
          buf += dec.decode(r.value, { stream: true });
          var nl; while ((nl = buf.indexOf("\n")) >= 0) { var line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1); if (line) { try { handle(JSON.parse(line)); } catch (e) {} } }
          return pump();
        });
      };
      return pump().catch(function () { fail("The connection dropped while the answer was arriving. It will be in this conversation when you reopen it."); });
    }).catch(function () { fail("We couldn’t reach Verisavo. Check your connection and try again."); });
  };
  VS.conversations = function () { return VS.get("/api/assistant/conversations").then(function (r) { return r.ok ? r.data.conversations || [] : []; }).catch(function () { return []; }); };
  VS.conversation = function (id) { return VS.get("/api/assistant/conversations/" + encodeURIComponent(id)).then(function (r) { return r.ok ? r.data : null; }).catch(function () { return null; }); };
  VS.renameConversation = function (id, title) { return VS.post("/api/assistant/conversations/" + encodeURIComponent(id), { title: title }).catch(function () {}); };
  VS.deleteConversation = function (id) { return VS.del("/api/assistant/conversations/" + encodeURIComponent(id)).catch(function () {}); };
  VS.deleteAll = function () { return VS.del("/api/assistant/conversations").catch(function () {}); };
  // PATCH needs its own method
  VS.renameConversation = function (id, title) {
    return fetch("/api/assistant/conversations/" + encodeURIComponent(id), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title }) }).catch(function () {});
  };
  // one file → { attachment } | { blocked: reason, usage } | { error }
  VS.upload = function (file) {
    var fd = new FormData(); fd.append("file", file);
    return fetch("/api/assistant/attachments", { method: "POST", body: fd }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.ok && d.attachment) return { attachment: d.attachment };
        if (r.status === 402) { if (d.usage) VS.setUsage(d.usage); return { blocked: d.reason || "feature_requires_subscription", usage: d.usage }; }
        if (r.status === 401) return { error: "Please sign in again." };
        return { error: d.message || "That file couldn’t be attached." };
      });
    }).catch(function () { return { error: "That file couldn’t be attached. Check your connection." }; });
  };
  VS.removeAttachment = function (id) { if (id) VS.del("/api/assistant/attachments/" + encodeURIComponent(id)); };
  // a PDF of a whole conversation, or of one answer
  VS.pdf = function (conversationId, messageId) {
    return fetch("/api/assistant/conversations/" + encodeURIComponent(conversationId) + "/pdf" + (messageId ? "?message=" + encodeURIComponent(messageId) : "")).then(function (r) {
      if (r.status === 402) return "paywall";
      if (r.status === 401) { VS.openSignIn("in"); return "error"; }
      if (!r.ok) return "error";
      var name = (/filename="([^"]+)"/.exec(r.headers.get("content-disposition") || "") || [])[1] || "verisavo-report.pdf";
      return r.blob().then(function (b) {
        var url = URL.createObjectURL(b), a = document.createElement("a"); a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
        return "ok";
      });
    }).catch(function () { return "error"; });
  };

  // The hard stop (M3.4 / M3.5): the server refused, nothing was sent to the model
  VS.paywall = function (reason, usage) {
    var resets = usage && usage.resetsAt ? new Date(usage.resetsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : null;
    if (reason === "period_exhausted") return { tag: "Monthly limit reached", head: "You’ve used all " + (usage ? usage.limit : PLAN.PAID) + " messages this month", body: resets ? "Your messages reset on " + resets + "." : "Your messages reset when your next billing period starts.", cta: false };
    if (reason === "feature_requires_subscription") return { tag: "Verisavo Monthly", head: "Files, PDF reports and WhatsApp are part of Verisavo Monthly", body: "Subscribe for " + PLAN.PRICE + " to attach files, get " + PLAN.PAID + " messages a month on web and WhatsApp, and download PDF reports.", cta: true };
    return { tag: "Free questions used", head: "You’ve used your " + PLAN.FREE + " free questions", body: "Subscribe to Verisavo Monthly for " + PLAN.PRICE + ": " + PLAN.PAID + " messages a month on web and WhatsApp, file uploads and PDF reports.", cta: true };
  };
  VS.paywallHtml = function (reason, usage) {
    var c = VS.paywall(reason, usage);
    return '<div class="vs-pay"><span class="vs-pay-tag">' + esc(c.tag) + '</span><b>' + esc(c.head) + '</b><p>' + esc(c.body) + '</p>' +
      (c.cta ? '<div class="vs-pay-row"><button type="button" class="vs-pay-btn" data-vs-subscribe>Subscribe · ' + esc(PLAN.PRICE) + '</button><a href="/dashboard#plan">See your plan</a></div>' : '<div class="vs-pay-row"><a href="/dashboard#plan">See your plan</a></div>') + '</div>';
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-vs-subscribe]"); if (!b) return;
    e.preventDefault(); b.disabled = true; VS.subscribe().then(function () { b.disabled = false; });
  });

  /* ---------- Markdown answers (headings, lists, tables, links, Sources line), safe: everything is escaped first ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>").replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, u) { return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + t + "</a>"; });
    return s;
  }
  var cells = function (line) { return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); }); };
  // splits off the plain "Sources: a; b" line the assistant ends with
  VS.splitSources = function (md) {
    var m = /(?:^|\n)\s*\**Sources:?\**:?\s*(.+)\s*$/i.exec(String(md || "").trimEnd());
    if (!m) return { body: md || "", sources: [] };
    return { body: md.slice(0, m.index), sources: m[1].split(/;\s*/).map(function (x) { return x.replace(/\*+/g, "").trim(); }).filter(Boolean) };
  };
  VS.md = function (md) {
    var lines = String(md || "").replace(/\r/g, "").split("\n"), out = [], i = 0, para = [], list = [];
    var flushPara = function () { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } };
    var flushList = function () {
      if (!list.length) return;
      var html = "", stack = [];
      list.forEach(function (it) {
        while (stack.length && (stack[stack.length - 1].d > it.d || (stack[stack.length - 1].d === it.d && stack[stack.length - 1].t !== it.t))) { html += "</li></" + stack.pop().t + ">"; }
        if (!stack.length || stack[stack.length - 1].d < it.d) { html += "<" + it.t + (it.t === "ol" && it.n > 1 ? ' start="' + it.n + '"' : "") + "><li>"; stack.push({ d: it.d, t: it.t }); }
        else html += "</li><li>";
        html += inline(it.text);
      });
      while (stack.length) html += "</li></" + stack.pop().t + ">";
      out.push(html); list = [];
    };
    for (; i < lines.length; i++) {
      var l = lines[i], m;
      if (/^\s*```/.test(l)) {
        flushPara(); flushList(); var code = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
        out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>"); continue;
      }
      if (!l.trim()) { flushPara(); flushList(); continue; }
      if ((m = /^\s*(#{1,6})\s+(.*)$/.exec(l))) { flushPara(); flushList(); var lv = Math.min(4, Math.max(3, m[1].length)); out.push("<h" + lv + ">" + inline(m[2].replace(/#+\s*$/, "")) + "</h" + lv + ">"); continue; }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) { flushPara(); flushList(); out.push("<hr>"); continue; }
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        flushPara(); flushList(); var head = cells(l), rows = []; i += 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        i--;
        out.push('<div class="vs-tbl"><table><thead><tr>' + head.map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>");
        continue;
      }
      if ((m = /^(\s*)([-*+•]|\d+[.)])\s+(.*)$/.exec(l))) {
        flushPara();
        list.push({ d: Math.floor(m[1].replace(/\t/g, "  ").length / 2), t: /\d/.test(m[2]) ? "ol" : "ul", n: parseInt(m[2], 10) || 1, text: m[3] });
        continue;
      }
      if (list.length && /^\s{2,}\S/.test(l)) { list[list.length - 1].text += " " + l.trim(); continue; }
      if ((m = /^\s*>\s?(.*)$/.exec(l))) { flushPara(); flushList(); out.push("<blockquote>" + inline(m[1]) + "</blockquote>"); continue; }
      flushList(); para.push(l.trim());
    }
    flushPara(); flushList();
    return out.join("");
  };
  VS.answerHtml = function (md, streaming) {
    var s = streaming ? { body: md, sources: [] } : VS.splitSources(md);
    return '<div class="vs-md">' + VS.md(s.body) + (streaming ? '<span class="caret"></span>' : "") + "</div>" +
      (s.sources.length ? '<p class="vs-src"><span>Sources</span>' + s.sources.map(esc).join(" · ") + "</p>" : "");
  };
  VS.plainText = function (md) { return String(md || "").replace(/^#+\s*/gm, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/(^|\s)[*_]([^*_]+)[*_]/g, "$1$2").replace(/^\s*[-*+]\s+/gm, "• "); };
  VS.copy = function (text) {
    var done = function () { VS.toast("Copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(done, function () { VS.toast("Couldn’t copy. Select the text instead."); });
    var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch (e) {} t.remove();
  };

  /* ---------- markets (the same list as lib/markets.ts) ---------- */
  var MARKETS = VS.MARKETS = ["All markets", "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
    "Central African Republic", "Chad", "Comoros", "Côte d’Ivoire", "DR Congo", "Djibouti", "Egypt", "Equatorial Guinea",
    "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia",
    "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria",
    "Republic of the Congo", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone", "Somalia",
    "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"];
  var norm = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim(); };
  var ALIAS = { "democratic republic of the congo": "DR Congo", "drc": "DR Congo", "congo kinshasa": "DR Congo", "congo": "Republic of the Congo", "congo brazzaville": "Republic of the Congo", "ivory coast": "Côte d’Ivoire", "cape verde": "Cabo Verde", "swaziland": "Eswatini", "the gambia": "Gambia", "sao tome and principe": "São Tomé and Príncipe" };
  // a country name as the client's menus write it → one of our market names, or null (cities and "All markets" → null)
  VS.market = function (name) {
    var n = norm(name); if (!n || n === "all markets") return null;
    if (ALIAS[n]) return ALIAS[n];
    for (var i = 1; i < MARKETS.length; i++) if (norm(MARKETS[i]) === n) return MARKETS[i];
    return null;
  };
  VS.usageNow = function () { return usageCache; };

  /* ---------- buttons any page can use ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-vs-soon], [data-vs-signup]"); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (t.hasAttribute("data-vs-soon")) return VS.soon(t.getAttribute("data-vs-soon"));
    VS.me().then(function (u) { if (u) location.href = "/assistant"; else VS.openSignIn("up"); });
  }, true);

  // The client's preview features that aren't built yet open "Coming soon" instead (set after their scripts run)
  function soonHooks() {
    var to = function (kind) { return function () { VS.soon(kind); }; };
    window.vsInvestigations = to("investigations");
    window.vsOpenBrief = to("investigations");
    window.vsPlatform = to("scouts");
    window.vsOpenAccess = to("scouts");
    window.vsOpenScoutAuth = to("scouts");
    window.vsScoutWhatsApp = to("scouts");
    window.vsOpenKb = to("knowledge");
    window.vsWorkspace = to("workspace");
  }
  window.addEventListener("load", function () { soonHooks(); setTimeout(soonHooks, 0); });

  // the plan under the user's name in the Assistant's sidebar
  document.addEventListener("vs:usage", function (e) {
    var s = document.querySelector("#va-side .va-user .va-who small"); if (s && e.detail) s.textContent = VS.planName(e.detail);
  });

  // Admins: the client's footer "Admin" buttons (hidden by their CSS) appear and open the real admin dashboard.
  // Only a shortcut: /admin checks the admin role on the server for every page.
  function markAdmin(u) { ready(function () { document.documentElement.classList.toggle("vs-admin", !!(u && (u.admin || u.role === "admin"))); }); }
  markAdmin(VS.cachedUser());
  document.addEventListener("vs:user", function (e) { markAdmin(e.detail ? VS.cachedUser() : null); });
  window.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-admin]"); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation(); location.href = "/admin";
  }, true);

  /* ---------- styles for what this runtime adds ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".vs-toast{position:fixed;left:50%;bottom:28px;z-index:2147483000;transform:translate(-50%,12px);opacity:0;pointer-events:none;max-width:min(520px,calc(100vw - 32px));padding:12px 18px;border-radius:12px;background:#1F273F;color:#fff;font:500 14px/1.4 'Red Hat Text',system-ui,sans-serif;box-shadow:0 10px 30px rgba(31,39,63,.25);transition:opacity .2s,transform .2s}",
    ".vs-toast.on{opacity:1;transform:translate(-50%,0)}",
    ".vs-md{overflow-wrap:anywhere}.vs-md>*:first-child{margin-top:0}.vs-md p{margin:0 0 .8em}",
    ".vs-md h3,.vs-md h4{margin:1.1em 0 .45em;font-family:'Red Hat Display','Red Hat Text',system-ui,sans-serif;font-weight:600;letter-spacing:-.01em;line-height:1.3}.vs-md h3{font-size:1.06em}.vs-md h4{font-size:1em}",
    ".vs-md ul,.vs-md ol{margin:0 0 .8em;padding-left:1.35em}.vs-md li{margin:.25em 0}.vs-md li>ul,.vs-md li>ol{margin:.25em 0 0}",
    ".vs-md strong{font-weight:600}.vs-md a{color:inherit;text-decoration:underline;text-underline-offset:2px}",
    ".vs-md code{padding:.1em .35em;border-radius:5px;background:rgba(127,140,170,.16);font-size:.9em}.vs-md pre{overflow:auto;padding:12px 14px;border-radius:10px;background:rgba(127,140,170,.12)}.vs-md pre code{padding:0;background:none}",
    ".vs-md blockquote{margin:0 0 .8em;padding-left:12px;border-left:3px solid rgba(127,140,170,.45);opacity:.9}.vs-md hr{border:0;border-top:1px solid rgba(127,140,170,.3);margin:1em 0}",
    ".vs-tbl{overflow-x:auto;margin:0 0 .9em;border:1px solid rgba(127,140,170,.3);border-radius:10px}.vs-tbl table{width:100%;border-collapse:collapse;font-size:.93em}",
    ".vs-tbl th,.vs-tbl td{padding:8px 12px;text-align:left;vertical-align:top;border-bottom:1px solid rgba(127,140,170,.22)}.vs-tbl th{font-weight:600;background:rgba(127,140,170,.09)}.vs-tbl tr:last-child td{border-bottom:0}",
    ".vs-src{margin:.4em 0 0;font-size:.86em;opacity:.8}.vs-src span{font-weight:600;margin-right:8px;text-transform:uppercase;letter-spacing:.06em;font-size:.82em}",
    ".vs-pay{display:grid;gap:6px;padding:16px 18px;border:1px solid #CCDDF1;border-radius:14px;background:#F5F8FD;color:#1F273F}.vs-pay b{font-size:1.02em}.vs-pay p{margin:0;color:#3A5292}",
    ".vs-pay-tag{font-size:.72em;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#4362B2}",
    ".vs-pay-row{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:6px}.vs-pay-row a{color:#3A5292;font-weight:600;font-size:.92em}",
    ".vs-pay-btn{border:0!important;border-radius:999px!important;padding:10px 18px!important;background:#1F273F!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font:600 14px/1 'Red Hat Text',system-ui,sans-serif!important;cursor:pointer;opacity:1!important}.vs-pay-btn:hover{background:#3A5292}.vs-pay-btn:disabled{opacity:.6}",
    "[data-vs-theme=dark] .vs-pay{background:rgba(31,39,63,.75);border-color:rgba(168,198,232,.35);color:#E3EBF8}[data-vs-theme=dark] .vs-pay p,[data-vs-theme=dark] .vs-pay-row a{color:#A8C6E8}[data-vs-theme=dark] .vs-pay-btn{background:#E3EBF8!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important}",
    ".vs-err{padding:12px 14px;border-radius:12px;background:rgba(220,60,60,.07);border:1px solid rgba(220,60,60,.25)}",
    /* profile panel: entries for features that are not built yet */
    ".vp-i[data-vp-nav=\"Knowledge Base\"],.vp-i[data-vp-nav=Investigations],.vp-i[data-vp-nav=Overview],.vp-i[data-vp-nav=\"Create a task\"],.vp-i[data-ws-open]{display:none!important}",
    "html.vs-admin [data-admin]:not(#a#b#c#d#e#f#g#h#i#j#k){display:inline-flex!important}",
    /* the page-change cover (see "smooth page changes") */
    "html::after{content:attr(data-vs-cover);position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:#F2F5FA;color:#5B6478;font:500 15px/1.4 'Red Hat Text',system-ui,sans-serif;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s,visibility 0s .2s}",
    "html.vs-cover::after{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .2s}",
    "html[data-vs-theme=dark]::after{background:#151B2D;color:#A8B3C4}",
    "#auth .a-pw[hidden],#auth .a-forgot[hidden],#auth .a-up[hidden],#a-google-wrap[hidden],#a-resend[hidden]{display:none!important}",
    "#auth .a-forgot{justify-self:start;margin:-6px 0 0;border:0;background:none;padding:0;color:#3A5292;font:500 .9375rem/1.4 'Red Hat Text',system-ui,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}",
    "#auth .a-hint{margin:6px 0 0;font-size:.8125rem;color:#6D6C71}#auth .a-google svg{width:18px;height:18px;flex:none}",
    "#auth #a-google{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;cursor:pointer}",
    "#auth .a-sent{display:grid;gap:8px}#auth .a-sent p{margin:0}#auth #a-sent[hidden],#auth #a-form[hidden],#auth .a-tabs[hidden]{display:none!important}",
    ".vs-qf{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:.8em;opacity:.75}.vs-qf svg{width:13px;height:13px}",
    /* pricing plans (index #pg-pricing) */
    ".vs-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin:0 0 40px}",
    ".vs-plan{display:flex;flex-direction:column;gap:14px;padding:26px;border:1px solid #E1E6EE;border-radius:20px;background:#fff}",
    ".vs-plan.vs-plan-on{border-color:#1F273F;box-shadow:0 14px 40px rgba(31,39,63,.08)}",
    ".vs-plan-k{margin:0;font:600 .8125rem/1 'Red Hat Text',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#4362B2}",
    ".vs-plan-p{margin:0;display:flex;align-items:baseline;gap:8px;color:#1F273F}.vs-plan-p b{font:500 2.75rem/1 'Red Hat Display',sans-serif;letter-spacing:-.03em}.vs-plan-p span{color:#5B6478}",
    ".vs-plan .pa-list{margin:0;flex:1;display:grid!important;gap:10px!important;align-content:start}.vs-plan .pa-list li{margin:0!important;opacity:1!important;transform:none!important}.vs-plan .pa-cta{align-self:flex-start}",
    "#pg-pricing .vs-plan-k{color:#4362B2!important;-webkit-text-fill-color:#4362B2!important}#pg-pricing .vs-plan-p b{color:#1F273F!important;-webkit-text-fill-color:#1F273F!important}#pg-pricing .vs-plan *{opacity:1}",
    "[data-vs-theme=dark] .vs-plan{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.14)}[data-vs-theme=dark] .vs-plan-p{color:#E3EBF8}[data-vs-theme=dark] .vs-plan.vs-plan-on{border-color:#A8C6E8}"
  ].join("\n");
  (document.head || document.documentElement).appendChild(css);
})();
