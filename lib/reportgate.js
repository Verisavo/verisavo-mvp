export default function init() {
  /* Research report access and WhatsApp subscription.
     One gate for every Verisavo report, wherever it is opened from: register once with a name and WhatsApp number,
     confirm the number with a one-time code, then open or download. A reader who has confirmed their number on this
     browser is recognised and goes straight through. Updates on WhatsApp are a separate choice from confirming the number.

     To gate a report anywhere on the site:
       window.vsReport.gate({ title: "Report name", slug: "report-name" }, "view" | "download", function () { ...open or download... });
     or add  data-report="Report name"  to its link or button (and  download  for a file). */
  if (typeof window === "undefined" || window.vsReport) return;
  var CONFIG = {
    mode: "demo",            // "live" once the WhatsApp verification service is connected. In "demo" no message is sent and the code is 123456.
    api: { start: "", check: "", contact: "" }   // start: send the code · check: confirm it · contact: save or update the reader
  };
  var KEY = "vs-reader", BOOK = "vs-reader-book", DEV = "vs-device";
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function device() { var d = get(DEV, ""); if (!d) { d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); put(DEV, d); } return d; }
  function reader() { return get(KEY, null); }
  function verified() { var r = reader(); return !!(r && r.verified && r.phone); }
  function slug(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mask(p) { return p.length > 7 ? p.slice(0, p.length - 7) + " ••• " + p.slice(-4) : p; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function post(url, body) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw { status: r.status }; return d; });
    });
  }
  /* one contact record per number: a returning reader on a new device updates their record, never adds a second */
  function saveContact(rec, report, action) {
    var book = get(BOOK, {}), old = book[rec.phone] || {}, log = (old.reports || []).slice(-49);
    if (report) log.push({ title: report.title || "", slug: report.slug || "", action: action || "view", at: Date.now() });
    var row = { name: rec.name || old.name || "", phone: rec.phone, verified: true, verifiedAt: old.verifiedAt || rec.verifiedAt, lastSeenAt: Date.now(), subscribed: !!rec.subscribed, consentAt: rec.subscribed ? (old.subscribed && old.consentAt) || Date.now() : null, unsubscribedAt: rec.subscribed ? null : (old.subscribed ? Date.now() : old.unsubscribedAt || null), devices: (old.devices || []).indexOf(device()) < 0 ? (old.devices || []).concat(device()) : old.devices, reports: log };
    book[rec.phone] = row; put(BOOK, book);
    if (CONFIG.mode === "live" && CONFIG.api.contact) post(CONFIG.api.contact, row).catch(function () {});
    return !!old.phone;
  }

  var css = document.createElement("style"); css.textContent =
    'dialog#rg{position:fixed;inset:0;margin:auto;width:min(460px,calc(100vw - 24px));max-width:none;max-height:calc(100dvh - 24px);padding:0;border:0;border-radius:20px;background:#fff;color:#1F273F;box-shadow:0 30px 80px -30px rgba(31,39,63,.55);overflow:auto;font:400 1rem/1.5 "Red Hat Text",system-ui,sans-serif}' +
    'dialog#rg::backdrop{background:rgba(20,27,45,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}dialog#rg:not([open]){display:none}' +
    '#rg .rg-box{position:relative;padding:28px 26px 24px}#rg .rg-x{position:absolute;top:14px;right:14px;display:grid;place-items:center;width:38px;height:38px;border:1px solid #E1E6EE;border-radius:50%;background:#fff;cursor:pointer}#rg .rg-x:focus-visible,#rg .rg-btn:focus-visible,#rg .rg-lnk:focus-visible{outline:2px solid #4D74C3;outline-offset:2px}' +
    '#rg .rg-for{display:flex;align-items:center;gap:8px;margin:0 46px 12px 0;font-size:.8125rem;color:#5B6478}#rg .rg-for svg{width:16px;height:16px;flex:none;color:#3A5C8C}#rg .rg-for span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#rg h2{margin:0 40px 8px 0;font:500 1.5rem/1.2 "Red Hat Display",system-ui,sans-serif;letter-spacing:-.02em;color:#1F273F}#rg .rg-sub{margin:0 0 14px;color:#4A5367;font-size:.9375rem}' +
    '#rg .rg-ben{list-style:none;margin:0 0 18px;padding:14px 16px;border-radius:14px;background:#F3F6FA;display:grid;gap:8px;font-size:.9375rem}#rg .rg-ben li{display:flex;gap:10px;align-items:flex-start}#rg .rg-ben svg{width:17px;height:17px;flex:none;margin-top:3px;color:#1E7B4C}' +
    '#rg form{display:grid;gap:12px;margin:0}#rg label.rg-f{display:grid;gap:6px;font-size:.875rem;font-weight:500}#rg label.rg-f input{width:100%;box-sizing:border-box;height:50px;padding:0 14px;border:1px solid #D5DBE5;border-radius:12px;background:#fff;color:#1F273F;font:400 1rem/1 "Red Hat Text",system-ui,sans-serif}#rg label.rg-f input:focus{outline:none;border-color:#3A5C8C;box-shadow:0 0 0 3px rgba(58,92,140,.18)}#rg label.rg-f input.bad{border-color:#B3261E;box-shadow:0 0 0 3px rgba(179,38,30,.14)}' +
    '#rg .rg-ck{display:flex;gap:10px;align-items:flex-start;font-size:.875rem;color:#343C50;cursor:pointer}#rg .rg-ck input{width:20px;height:20px;margin:1px 0 0;flex:none;accent-color:#3A5C8C}' +
    '#rg .rg-msg{min-height:1.2em;margin:0;font-size:.875rem;color:#B3261E}#rg .rg-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:52px;border:0;border-radius:999px;background:#1F273F;color:#fff;font:500 1rem/1 "Red Hat Text",system-ui,sans-serif;cursor:pointer}#rg .rg-btn[disabled]{opacity:.6;cursor:default}#rg .rg-btn.ghost{background:#EEF1F6;color:#1F273F}' +
    '#rg .rg-fine{margin:0;font-size:.8125rem;color:#6A7388}#rg .rg-lnk{padding:0;border:0;background:none;color:#3A5C8C;font:inherit;text-decoration:underline;text-underline-offset:2px;cursor:pointer}#rg .rg-lnk[disabled]{color:#8A93A5;text-decoration:none;cursor:default}' +
    '#rg .rg-otp{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}#rg .rg-otp input{width:100%;height:56px;padding:0;border:1px solid #D5DBE5;border-radius:12px;text-align:center;font:500 1.375rem/1 "Red Hat Display",system-ui,sans-serif;color:#1F273F;background:#fff}#rg .rg-otp input:focus{outline:none;border-color:#3A5C8C;box-shadow:0 0 0 3px rgba(58,92,140,.18)}#rg .rg-otp.bad input{border-color:#B3261E}' +
    '#rg .rg-demo{margin:0;padding:10px 12px;border-radius:10px;background:#FFF6E0;color:#6B4A00;font-size:.8125rem}#rg .rg-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.875rem}#rg .rg-kv{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #EEF1F5;font-size:.9375rem}#rg .rg-kv b{font-weight:500}' +
    '#rg [data-s]{display:none}#rg[data-step="0"] [data-s="0"],#rg[data-step="1"] [data-s="1"],#rg[data-step="2"] [data-s="2"]{display:block}#rg .rg-spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rgspin .7s linear infinite}@keyframes rgspin{to{transform:rotate(360deg)}}' +
    '.rg-mrow{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:14px;font-size:.875rem;color:#5B6478}.rg-mrow button{padding:0;border:0;background:none;color:#3A5C8C;font:inherit;text-decoration:underline;text-underline-offset:2px;cursor:pointer}' +
    '@media (max-width:520px){dialog#rg{inset:auto 0 0 0;margin:0;width:100vw;max-height:94dvh;border-radius:20px 20px 0 0}#rg .rg-box{padding:24px 18px calc(20px + env(safe-area-inset-bottom))}#rg h2{font-size:1.3125rem}}@media (prefers-reduced-motion:reduce){#rg .rg-spin{animation:none}}';
  document.head.appendChild(css);

  var TICK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.500l3.200 3.200L13 5"/></svg>';
  var dlg = document.createElement("dialog"); dlg.id = "rg"; dlg.setAttribute("aria-labelledby", "rg-h"); dlg.dataset.step = "0";
  dlg.innerHTML = '<div class="rg-box"><button type="button" class="rg-x" aria-label="Close"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#1F273F" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
    '<div data-s="0"><p class="rg-for"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M4 1.500h5.500L12.500 4.500v10h-8.500z"/><path d="M9.500 1.500v3h3"/></svg><span id="rg-for"></span></p>' +
      '<h2 id="rg-h">Open this report</h2><p class="rg-sub" id="rg-sub">Tell us your name and WhatsApp number. You register once, and every Verisavo report opens for you after that.</p>' +
      '<ul class="rg-ben" aria-label="What you get on WhatsApp"><li>' + TICK + '<span>New research reports as soon as they are published</span></li><li>' + TICK + '<span>Market insights from across Africa</span></li><li>' + TICK + '<span>Company news and updates from Verisavo</span></li></ul>' +
      '<form id="rg-f0" novalidate><label class="rg-f">Name<input id="rg-name" autocomplete="name" maxlength="120" placeholder="Your name"></label>' +
      '<label class="rg-f">WhatsApp number<input id="rg-tel" type="tel" autocomplete="tel" maxlength="24" placeholder="WhatsApp number"></label>' +
      '<label class="rg-ck"><input type="checkbox" id="rg-opt"><span>Send me Verisavo research, market insights and company news on WhatsApp. I can stop at any time.</span></label>' +
      '<p class="rg-msg" id="rg-m0" role="alert"></p><button type="submit" class="rg-btn" id="rg-send">Send my code</button>' +
      '<p class="rg-fine">We send a one-time code on WhatsApp to confirm the number is yours. See our <button type="button" class="rg-lnk" data-legal="privacy">Privacy Policy</button>.</p></form></div>' +
    '<div data-s="1"><h2>Enter your code</h2><p class="rg-sub">We sent a 6-digit code on WhatsApp to <b id="rg-num"></b>.</p>' +
      '<form id="rg-f1" novalidate><div class="rg-otp" id="rg-otp" role="group" aria-label="6-digit code"></div><p class="rg-demo" id="rg-demo" hidden>Preview: WhatsApp sending is not connected yet, so no message was sent. Use the code 123456.</p>' +
      '<p class="rg-msg" id="rg-m1" role="alert"></p><button type="submit" class="rg-btn" id="rg-verify">Confirm and open</button>' +
      '<div class="rg-row"><button type="button" class="rg-lnk" id="rg-resend" disabled>Send a new code</button><button type="button" class="rg-lnk" id="rg-change">Change number</button></div></form></div>' +
    '<div data-s="2"><h2>WhatsApp updates</h2><p class="rg-sub">You can stop or start updates at any time. Your access to reports stays the same.</p>' +
      '<div class="rg-kv"><span>Number</span><b id="rg-mnum"></b></div><div class="rg-kv"><span>Updates on WhatsApp</span><b id="rg-mstate"></b></div>' +
      '<div style="display:grid;gap:10px;margin-top:16px"><button type="button" class="rg-btn" id="rg-toggle"></button><button type="button" class="rg-btn ghost" id="rg-done">Done</button>' +
      '<p class="rg-fine">Not your number? <button type="button" class="rg-lnk" id="rg-forget">Use a different number</button></p></div></div></div>';
  document.body.appendChild(dlg);
  function $(id) { return dlg.querySelector("#" + id); }

  var pending = null, phone = "", opener = null, timer = 0, busyNow = false;
  function step(n) { dlg.dataset.step = String(n); }
  function show() { opener = document.activeElement; if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); } }
  function hide() { if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); } }
  function busy(btn, on, label) { btn.disabled = on; btn.innerHTML = on ? '<span class="rg-spin" aria-hidden="true"></span>' + label : label; }
  dlg.addEventListener("close", function () { clearInterval(timer); pending = null; if (opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) {} });
  dlg.querySelector(".rg-x").addEventListener("click", hide);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) hide(); });

  function fullNumber() {
    var t = $("rg-tel"), v = t.value.trim(), w = t.closest(".tp"), d;
    if (/^\+/.test(v)) d = v.replace(/\D/g, "");
    else d = (w && w._c ? w._c[2] : "") + v.replace(/\D/g, "").replace(/^0+/, "");
    return d.length >= 8 && d.length <= 15 ? "+" + d : "";
  }
  function buildOtp() {
    var o = $("rg-otp"), h = ""; for (var k = 0; k < 6; k++) h += '<input type="text" inputmode="numeric" autocomplete="' + (k ? "off" : "one-time-code") + '" maxlength="1" pattern="[0-9]*" aria-label="Digit ' + (k + 1) + ' of 6">';
    o.innerHTML = h; o.classList.remove("bad"); $("rg-m1").textContent = "";
  }
  $("rg-otp").addEventListener("input", function (e) {
    var ins = [].slice.call($("rg-otp").querySelectorAll("input")), i = ins.indexOf(e.target), v = e.target.value.replace(/\D/g, "");
    $("rg-otp").classList.remove("bad"); $("rg-m1").textContent = "";
    if (v.length > 1) { v.slice(0, 6).split("").forEach(function (c, k) { if (ins[k]) ins[k].value = c; }); (ins[Math.min(5, v.length - 1)] || ins[5]).focus(); }
    else { e.target.value = v; if (v && ins[i + 1]) ins[i + 1].focus(); }
    if (ins.every(function (x) { return x.value; })) $("rg-f1").requestSubmit ? $("rg-f1").requestSubmit() : $("rg-verify").click();
  });
  $("rg-otp").addEventListener("keydown", function (e) { var ins = [].slice.call($("rg-otp").querySelectorAll("input")), i = ins.indexOf(e.target); if (e.key === "Backspace" && !e.target.value && ins[i - 1]) { ins[i - 1].value = ""; ins[i - 1].focus(); e.preventDefault(); } });
  $("rg-otp").addEventListener("paste", function (e) { var t = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6); if (!t) return; e.preventDefault(); var ins = $("rg-otp").querySelectorAll("input"); t.split("").forEach(function (c, k) { ins[k].value = c; }); ins[Math.min(5, t.length - 1)].focus(); if (t.length === 6) $("rg-f1").requestSubmit ? $("rg-f1").requestSubmit() : $("rg-verify").click(); });
  function startResend() { var left = 30, b = $("rg-resend"); clearInterval(timer); b.disabled = true; b.textContent = "Send a new code in " + left + "s"; timer = setInterval(function () { left--; if (left <= 0) { clearInterval(timer); b.disabled = false; b.textContent = "Send a new code"; } else b.textContent = "Send a new code in " + left + "s"; }, 1000); }
  function sendCode() { if (CONFIG.mode !== "live") return wait(600); if (!CONFIG.api.start) return Promise.reject({ config: true }); return post(CONFIG.api.start, { phone: phone, device: device() }); }
  function checkCode(code) { if (CONFIG.mode !== "live") return wait(500).then(function () { return { verified: code === "123456" }; }); if (!CONFIG.api.check) return Promise.reject({ config: true }); return post(CONFIG.api.check, { phone: phone, code: code, device: device() }); }
  ["rg-name", "rg-tel"].forEach(function (id) { $(id).addEventListener("input", function () { $(id).classList.remove("bad"); $("rg-m0").textContent = ""; }); });

  $("rg-f0").addEventListener("submit", function (e) {
    e.preventDefault(); if (busyNow) return;
    var name = $("rg-name").value.trim(); phone = fullNumber();
    if (!name) { $("rg-name").classList.add("bad"); $("rg-m0").textContent = "Add your name."; $("rg-name").focus(); return; }
    if (!phone) { $("rg-tel").classList.add("bad"); $("rg-m0").textContent = "Enter a valid WhatsApp number."; $("rg-tel").focus(); return; }
    busyNow = true; busy($("rg-send"), true, "Sending…");
    sendCode().then(function () {
      $("rg-num").textContent = phone; $("rg-demo").hidden = CONFIG.mode === "live"; buildOtp(); step(1); startResend(); $("rg-otp").querySelector("input").focus();
    }).catch(function (err) {
      $("rg-m0").textContent = err && err.config ? "Verification isn’t connected yet. Please try again later." : err && err.status === 429 ? "Too many attempts. Try again in a few minutes." : "We couldn’t send the code. Check the number and try again.";
    }).then(function () { busyNow = false; busy($("rg-send"), false, "Send my code"); });
  });
  $("rg-resend").addEventListener("click", function () { sendCode().then(function () { $("rg-m1").textContent = ""; startResend(); $("rg-otp").querySelector("input").focus(); }).catch(function () { $("rg-m1").textContent = "We couldn’t send a new code. Try again."; }); });
  $("rg-change").addEventListener("click", function () { clearInterval(timer); step(0); $("rg-tel").focus(); });
  $("rg-f1").addEventListener("submit", function (e) {
    e.preventDefault(); if (busyNow) return;
    var code = [].map.call($("rg-otp").querySelectorAll("input"), function (x) { return x.value; }).join("");
    if (code.length < 6) { $("rg-otp").classList.add("bad"); $("rg-m1").textContent = "Enter all 6 digits."; return; }
    busyNow = true; busy($("rg-verify"), true, "Checking…");
    checkCode(code).then(function (res) {
      if (!res || !res.verified) throw { wrong: true };
      var rec = { id: device(), name: $("rg-name").value.trim(), phone: phone, verified: true, verifiedAt: Date.now(), subscribed: $("rg-opt").checked };
      var p = pending; saveContact(rec, p && p.report, p && p.action); put(KEY, rec);
      clearInterval(timer); pending = null; hide();
      try { window.dispatchEvent(new CustomEvent("vs-reader", { detail: rec })); } catch (x) {}
      if (p && p.go) p.go();
    }).catch(function (err) {
      $("rg-otp").classList.add("bad");
      $("rg-m1").textContent = err && (err.wrong || err.status === 400 || err.status === 401) ? "That code doesn’t match. Try again." : err && err.status === 429 ? "Too many attempts. Ask for a new code." : err && err.config ? "Verification isn’t connected yet. Please try again later." : "We couldn’t check the code. Try again.";
      [].forEach.call($("rg-otp").querySelectorAll("input"), function (x) { x.value = ""; }); $("rg-otp").querySelector("input").focus();
    }).then(function () { busyNow = false; busy($("rg-verify"), false, "Confirm and open"); });
  });

  /* the one entry point: recognised readers go straight through, everyone else registers once */
  function gate(report, action, go) {
    report = report || {}; if (!report.slug) report.slug = slug(report.title);
    if (verified()) { var r = reader(); saveContact(r, report, action); if (go) go(); return true; }
    pending = { report: report, action: action || "view", go: go };
    $("rg-for").textContent = report.title || "Verisavo research"; dlg.querySelector(".rg-for").hidden = !report.title;
    $("rg-h").textContent = action === "download" ? "Download this report" : "Open this report";
    $("rg-verify").textContent = action === "download" ? "Confirm and download" : "Confirm and open";
    $("rg-m0").textContent = ""; step(0); show(); setTimeout(function () { ($("rg-name").value ? $("rg-tel") : $("rg-name")).focus(); }, 40);
    return false;
  }
  function setUpdates(on) { var r = reader(); if (!r) return; r.subscribed = !!on; put(KEY, r); saveContact(r); try { window.dispatchEvent(new CustomEvent("vs-reader", { detail: r })); } catch (x) {} }
  function manageFill() { var r = reader(); if (!r) return; $("rg-mnum").textContent = mask(r.phone); $("rg-mstate").textContent = r.subscribed ? "On" : "Off"; $("rg-toggle").textContent = r.subscribed ? "Stop WhatsApp updates" : "Send me WhatsApp updates"; $("rg-toggle").classList.toggle("ghost", !!r.subscribed); $("rg-done").hidden = !r.subscribed ? false : false; }
  function manage() { if (!verified()) return gate({}, "view", function () { manage(); }); manageFill(); step(2); show(); setTimeout(function () { $("rg-toggle").focus(); }, 40); }
  $("rg-toggle").addEventListener("click", function () { setUpdates(!reader().subscribed); manageFill(); });
  $("rg-done").addEventListener("click", hide);
  $("rg-forget").addEventListener("click", function () { try { localStorage.removeItem(KEY); } catch (e) {} hide(); try { window.dispatchEvent(new CustomEvent("vs-reader", { detail: null })); } catch (x) {} });
  function manageRow() { var r = reader(); if (!r || !r.verified) return ""; return '<p class="rg-mrow"><span>WhatsApp updates are ' + (r.subscribed ? "on" : "off") + ' for ' + esc(mask(r.phone)) + '.</span><button type="button" data-rg-manage>' + (r.subscribed ? "Stop or change" : "Turn on or change") + '</button></p>'; }

  /* any link or button marked data-report is gated without further code */
  document.addEventListener("click", function (e) {
    var m = e.target.closest && e.target.closest("[data-rg-manage]"); if (m) { e.preventDefault(); manage(); return; }
    var el = e.target.closest && e.target.closest("[data-report]"); if (!el || el._rgPass) return;
    if (verified()) { saveContact(reader(), { title: el.getAttribute("data-report"), slug: el.getAttribute("data-report-slug") || slug(el.getAttribute("data-report")) }, el.hasAttribute("download") ? "download" : "view"); return; }
    e.preventDefault(); e.stopPropagation();
    gate({ title: el.getAttribute("data-report"), slug: el.getAttribute("data-report-slug") || "" }, el.hasAttribute("download") || el.getAttribute("data-report-action") === "download" ? "download" : "view", function () { el._rgPass = true; el.click(); el._rgPass = false; });
  }, true);

  window.vsReport = { gate: gate, verified: verified, reader: reader, manage: manage, manageRow: manageRow, setUpdates: setUpdates, slug: slug, config: CONFIG };

  /* shared links: …?report=<slug> opens that report through the same gate; …?updates=manage opens the WhatsApp settings */
  function fromLink() {
    var q; try { q = new URLSearchParams(location.search); } catch (e) { return; }
    var want = q.get("report"), upd = q.get("updates");
    if (want) { var cards = document.querySelectorAll("[data-report-slug], .rs-card[data-title]"), hit = null; [].forEach.call(cards, function (c) { if (!hit && (c.getAttribute("data-report-slug") || slug(c.getAttribute("data-title"))) === slug(want)) hit = c; }); if (hit) hit.click(); }
    else if (upd) manage();
  }
  if (document.readyState === "complete") setTimeout(fromLink, 700); else addEventListener("load", function () { setTimeout(fromLink, 700); });
}
