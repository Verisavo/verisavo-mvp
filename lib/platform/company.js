// Company knowledge: private company context for the Intelligence Assistant.
export default function init() {
/* >>> company knowledge */
(function () {
  /* Company knowledge: the private context the Intelligence Assistant needs to make answers relevant.
     MVP: one short, skippable setup after sign-up, editable later from the sidebar. Stored in this browser only. */
  var va = document.getElementById("va"), main = va && va.querySelector(".va-main"), hello = document.getElementById("va-hello");
  if (!va || !main || !hello || document.getElementById("kb-nav")) return;
  var KEY = "vs-company";
  var esc = function (s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var get = function () { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  var put = function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  var user = function () { try { return JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) { return null; } };
  var COUNTRIES = [].map.call(va.querySelectorAll("#va-scope-menu [data-market]"), function (b) { return b.dataset.market; }).filter(function (m) { return m !== "All markets"; });
  var markets = function (txt) { var t = (txt || "").toLowerCase(); return COUNTRIES.filter(function (c) { return t.indexOf(c.toLowerCase()) >= 0; }); };

  var css = document.createElement("style");
  css.textContent = [
    ".va-main.kb-on>.va-body,.va-main.kb-on>.va-dock{display:none!important}",
    ".kb{flex:1 1 auto;min-height:0;overflow-y:auto;display:grid;place-items:start center;padding:clamp(20px,5vh,48px) 16px 72px}",
    ".kb-card{width:min(500px,100%);display:grid;gap:14px;color:#1F273F}",
    ".kb-card h2{margin:0;font:600 clamp(1.35rem,1.1rem + .8vw,1.7rem)/1.2 var(--display,var(--sans))!important;letter-spacing:-.02em!important;color:#1F273F!important}",
    ".kb-lead{margin:-8px 0 0!important;font:400 .95rem/1.5 var(--sans)!important;color:#5A6378!important}",
    ".kb-f{display:grid;gap:6px;font:500 .85rem/1.2 var(--sans);color:#3D4559}",
    ".kb-f small{font-weight:400;color:#8A93A6}",
    ".kb-f input,.kb-f textarea{width:100%;box-sizing:border-box;border:1px solid #DCE3EE;border-radius:12px;padding:11px 13px;font:400 .95rem/1.4 var(--sans);color:#1F273F;background:#fff;resize:vertical}",
    ".kb-f textarea{min-height:64px}",
    ".kb-f input:focus,.kb-f textarea:focus{outline:none;border-color:#4362B2;box-shadow:0 0 0 3px #E3EBF8}",
    ".kb-docs{display:flex;flex-wrap:wrap;align-items:center;gap:6px}",
    ".kb-docs span{font:500 .78rem/1 var(--sans);padding:6px 9px;border-radius:999px;background:#F4F7FB;color:#3A5292}",
    ".kb-add{border:1px dashed #A8C6E8;background:none;border-radius:999px;padding:7px 12px;font:500 .82rem/1 var(--sans);color:#3A5292;cursor:pointer}.kb-add:hover{background:#F4F7FB}",
    ".kb-priv{display:flex;gap:8px;align-items:flex-start;margin:0!important;font:400 .8rem/1.45 var(--sans)!important;color:#5A6378!important}",
    ".kb-priv svg{width:16px;height:16px;flex:none;margin-top:1px;fill:none;stroke:#4362B2;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}",
    ".kb-act{display:flex;gap:10px;align-items:center;flex-wrap:wrap}",
    ".kb-go{height:44px;padding:0 20px;border:0;border-radius:12px;background:#1F273F;color:#fff;font:600 .95rem/1 var(--sans);cursor:pointer}.kb-go:hover{background:#3A5292}.kb-go[disabled]{opacity:.4;cursor:not-allowed}",
    ".kb-skip{height:44px;padding:0 14px;border:0;background:none;color:#3A5292;font:500 .92rem/1 var(--sans);cursor:pointer;border-radius:12px}.kb-skip:hover{background:#F4F7FB}",
    /* context line on the Assistant's first screen */
    ".kb-line{display:inline-flex;align-items:center;gap:8px;max-width:100%;margin-top:4px;padding:6px 6px 6px 12px;border-radius:999px;background:#F4F7FB;border:1px solid #E3EBF8;font:400 .82rem/1.3 var(--sans);color:#3D4559}",
    ".kb-line i{width:7px;height:7px;border-radius:50%;background:#4362B2;flex:none}",
    ".kb-line span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}",
    ".kb-line button{flex:none;border:0;background:#fff;border-radius:999px;padding:5px 10px;font:500 .78rem/1 var(--sans);color:#3A5292;cursor:pointer}.kb-line button:hover{background:#E3EBF8}",
    "html body #va .va-hello{grid-template-columns:minmax(0,1fr)!important}.kb-line{box-sizing:border-box;min-width:0}",
    "@media (max-width:520px){.kb-line{border-radius:14px;align-items:flex-start;text-align:left}.kb-line span{white-space:normal}.kb-line i{margin-top:5px}}",
    ".kb-line.kb-none{padding-left:12px}.kb-line.kb-none i{background:#C5CFDE}",
    ".va-dark .kb-card,.va-dark .kb-card h2{color:#fff!important}.va-dark .kb-lead,.va-dark .kb-priv,.va-dark .kb-f{color:#A8B3C7!important}",
    ".va-dark .kb-f input,.va-dark .kb-f textarea{background:#262F49;border-color:#3A4565;color:#fff}",
    ".va-dark .kb-line{background:#262F49;border-color:#3A4565;color:#CCDDF1}.va-dark .kb-line button{background:#1F273F;color:#CCDDF1}"
  ].join("");
  document.body.appendChild(css);

  /* Sidebar entry */
  var list = va.querySelector(".va-side .va-list");
  if (list) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button" class="va-nav" id="kb-nav"><svg class="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16.5V5.5l6-2.5 6 2.5v11"></path><path d="M3 16.5h14M8 16.5v-3h4v3M7.5 8h1M11.5 8h1M7.5 11h1M11.5 11h1"></path></svg><span>Company knowledge</span></button>';
    list.appendChild(li);
  }

  var panel = null, files = [];
  function close() {
    if (panel) { panel.remove(); panel = null; } main.classList.remove("kb-on");
    var nb = document.getElementById("kb-nav"); if (nb) { nb.classList.remove("on"); nb.removeAttribute("aria-current"); }
  }
  function open(first) {
    close();
    var nb = document.getElementById("kb-nav"); if (nb) { nb.classList.add("on"); nb.setAttribute("aria-current", "page"); }
    var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim");
    if (app && app.classList.contains("va-drawer") && scrim) scrim.click();
    var c = get() || {}, u = user() || {};
    files = (c.docs || []).slice();
    panel = document.createElement("div"); panel.className = "kb";
    panel.innerHTML = '<form class="kb-card" novalidate>' +
      '<h2>' + (first ? "Tell Verisavo about your company" : "Company knowledge") + '</h2>' +
      '<p class="kb-lead">' + (first ? "So answers fit your business and the decision ahead. Takes about a minute." : "What the Assistant knows about your business. Update it when plans change.") + '</p>' +
      '<label class="kb-f">Company<input name="name" autocomplete="organization" maxlength="120" placeholder="Company name" value="' + esc(c.name || u.organisation) + '"></label>' +
      '<label class="kb-f">What you sell<input name="offer" maxlength="160" placeholder="e.g. Packaged rice and cooking oil" value="' + esc(c.offer) + '"></label>' +
      '<label class="kb-f">Markets you work in or are considering<input name="markets" maxlength="200" placeholder="e.g. Ghana, Nigeria" value="' + esc(c.markets) + '"></label>' +
      '<label class="kb-f">The decision ahead<textarea name="decision" maxlength="400" placeholder="e.g. Whether to launch in Kumasi before Accra next year">' + esc(c.decision) + '</textarea></label>' +
      '<div class="kb-f"><span>Documents <small>(optional)</small></span><div class="kb-docs"></div><input type="file" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt"></div>' +
      '<p class="kb-priv"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3l5.5 2v4.6c0 3.4-2.3 5.9-5.5 7.4-3.2-1.5-5.5-4-5.5-7.4V5z"></path></svg>Your company data remains private, protected and under your control.</p>' +
      '<div class="kb-act"><button type="submit" class="kb-go">' + (first ? "Save and continue" : "Save") + '</button><button type="button" class="kb-skip">' + (first ? "Skip for now" : "Cancel") + '</button></div>' +
      '</form>';
    main.appendChild(panel); main.classList.add("kb-on");
    var f = panel.querySelector("form"), go = panel.querySelector(".kb-go"), fi = panel.querySelector("input[type=file]"), docs = panel.querySelector(".kb-docs");
    var drawDocs = function () { docs.innerHTML = files.map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("") + '<button type="button" class="kb-add">+ Add documents</button>'; };
    var valid = function () { go.disabled = !(f.name.value.trim() && f.decision.value.trim()); };
    drawDocs(); valid();
    f.addEventListener("input", valid);
    docs.addEventListener("click", function (e) { if (e.target.closest(".kb-add")) fi.click(); });
    fi.addEventListener("change", function () { [].forEach.call(fi.files, function (x) { if (files.indexOf(x.name) < 0) files.push(x.name); }); fi.value = ""; drawDocs(); });
    panel.querySelector(".kb-skip").addEventListener("click", function () { if (first) try { sessionStorage.setItem("vs-company-skip", "1"); } catch (e) {} close(); render(); focusIn(); });
    f.addEventListener("submit", function (e) {
      e.preventDefault(); if (go.disabled) return;
      var v = { name: f.name.value.trim(), offer: f.offer.value.trim(), markets: f.markets.value.trim(), decision: f.decision.value.trim(), docs: files, updated: new Date().toISOString() };
      put(v); close(); render();
      var m = markets(v.markets);
      if (m.length === 1 && window.vaSetScope) window.vaSetScope(m[0]);
      focusIn();
    });
    setTimeout(function () { var x = f.querySelector(first ? "input[name=" + (f.name.value ? "offer" : "name") + "]" : "input"); if (x) x.focus(); }, 40);
  }
  function focusIn() { var t = document.getElementById("va-in"); if (t) setTimeout(function () { t.focus(); }, 40); }

  /* First screen: show what the Assistant knows, and tailor the suggestions */
  var DEF = {};
  [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { DEF[i] = b.dataset.q; });
  function render() {
    var c = get(), line = document.getElementById("kb-line");
    if (!line) { line = document.createElement("p"); line.id = "kb-line"; hello.appendChild(line); }
    if (c) {
      var bits = [c.name, c.markets].filter(Boolean).join(" · ");
      line.className = "kb-line"; line.innerHTML = '<i aria-hidden="true"></i><span>Using company knowledge: ' + esc(bits) + '</span><button type="button">Edit</button>';
      var m = markets(c.markets)[0] || c.markets || "our markets", o = c.offer ? c.offer.charAt(0).toLowerCase() + c.offer.slice(1) : "our product";
      var Q = ["What does the market for " + o + " look like in " + m + "?", "Which locations in " + m + " should we consider first for " + o + ", and why?",
               "What don’t we know yet that could change this decision: " + c.decision.replace(/[.?!]+$/, "") + "?", "What evidence supports or contradicts our plan to " + c.decision.charAt(0).toLowerCase() + c.decision.slice(1).replace(/[.?!]+$/, "") + "?"];
      [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { if (Q[i]) b.dataset.q = Q[i]; });
    } else {
      line.className = "kb-line kb-none"; line.innerHTML = '<i aria-hidden="true"></i><span>Answers are general until Verisavo knows your company</span><button type="button">Add context</button>';
      [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { b.dataset.q = DEF[i]; });
    }
    line.querySelector("button").onclick = function () { open(!c); };
  }

  /* Open the setup the first time a signed-in client arrives without company knowledge.
     A question carried in from the page is answered first: the context line offers setup instead. */
  var orig = window.vaOpen;
  if (typeof orig === "function") {
    window.vaOpen = function (u, q) {
      close(); orig.apply(this, arguments); render();
      var skipped = false; try { skipped = sessionStorage.getItem("vs-company-skip") === "1"; } catch (e) {}
      if (!get() && !skipped && !(q && String(q).trim())) open(true);
    };
  }
  /* Window capture runs before the other Assistant handlers, so any other navigation closes this panel first */
  window.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest("#kb-nav")) { e.preventDefault(); open(!get()); return; }
    if (panel && t.closest("#va-side button:not(#va-side-x):not(#va-gear), #va-new2, .va-gapbtn")) close();
  }, true);
  va.addEventListener("close", close);
  render();
})();
/* <<< company knowledge */
}
