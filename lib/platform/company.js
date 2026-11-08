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
    ".kb-from{display:grid;gap:4px;padding:12px 14px;border:1px solid #DCE3EE;border-radius:12px;background:#F7F9FC}.kb-from b{font:600 .78rem/1.2 var(--sans);color:#5A6378}.kb-from p{margin:0!important;font:400 .9rem/1.45 var(--sans)!important;color:#1F273F!important}",
    ".kb-src{display:grid;gap:8px}.kb-src > span{font:500 .85rem/1.2 var(--sans);color:#3D4559}",
    ".kb-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 12px;padding:11px 13px;border:1px solid #DCE3EE;border-radius:12px;background:#fff;transition:border-color .2s,box-shadow .2s,background-color .2s}",
    ".kb-row b{font:500 .9rem/1.3 var(--sans);color:#1F273F}.kb-row small{grid-column:1;font:400 .8rem/1.4 var(--sans);color:#5A6378}.kb-row em{grid-row:1 / span 2;grid-column:2;align-self:center;font:500 .72rem/1 var(--sans);font-style:normal;color:#5A6378;background:#F4F7FB;border-radius:999px;padding:5px 8px}",
    ".kb-row.hl{border-color:#4362B2;box-shadow:0 0 0 3px #E3EBF8;background:#FBFCFE}",
    ".kb-priv{display:flex;gap:8px;align-items:flex-start;margin:0!important;font:400 .8rem/1.45 var(--sans)!important;color:#5A6378!important}",
    ".kb-priv svg{width:16px;height:16px;flex:none;margin-top:1px;fill:none;stroke:#4362B2;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}",
    ".kb-act{display:flex;gap:10px;align-items:center;flex-wrap:wrap}",
    ".kb-go{height:44px;padding:0 20px;border:0;border-radius:12px;background:#1F273F;color:#fff;font:600 .95rem/1 var(--sans);cursor:pointer}.kb-go:hover{background:#3A5292}.kb-go[disabled]{opacity:.4;cursor:not-allowed}",
    ".kb-skip{height:44px;padding:0 14px;border:0;background:none;color:#3A5292;font:500 .92rem/1 var(--sans);cursor:pointer;border-radius:12px}.kb-skip:hover{background:#F4F7FB}",
    ".va-dark .kb-card,.va-dark .kb-card h2{color:#fff!important}.va-dark .kb-lead,.va-dark .kb-priv,.va-dark .kb-f{color:#A8B3C7!important}",
    ".va-dark .kb-f input,.va-dark .kb-f textarea{background:#262F49;border-color:#3A4565;color:#fff}"
  ].join("");
  document.body.appendChild(css);

  /* Sidebar entry */
  var list = va.querySelector(".va-side .va-list");
  if (list) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button" class="va-nav" id="kb-nav"><svg class="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16.5V5.5l6-2.5 6 2.5v11"></path><path d="M3 16.5h14M8 16.5v-3h4v3M7.5 8h1M11.5 8h1M7.5 11h1M11.5 11h1"></path></svg><span>Knowledge Base</span></button>';
    list.appendChild(li);
  }

  /* Company data already connected to the Assistant. Evidence marked "Your data" points back to one of these. */
  var SOURCES = [
    { k: "delivery", name: "Delivery records", what: "Order and delivery dates by distributor and outlet", rx: /deliver/i },
    { k: "sales", name: "Sales data", what: "Weekly sell-out by outlet, pack size and area", rx: /sales|sell-out/i },
    { k: "orders", name: "Order records", what: "Order sizes and reorder dates by outlet", rx: /order record|order size/i },
    { k: "distribution", name: "Distributor coverage", what: "Which distributor serves which area and outlet", rx: /distributor coverage|coverage/i },
    { k: "loyalty", name: "Loyalty data", what: "Repeat purchase among regular shoppers", rx: /loyalty/i }
  ];
  var srcBlock = function (ctx) {
    return '<div class="kb-src" id="kb-src"><span>Your data in Verisavo</span>' +
      (ctx && ctx.text ? '<div class="kb-from"><b>Used in an answer</b><p>' + esc(ctx.text) + '</p></div>' : '') +
      SOURCES.map(function (x) { return '<div class="kb-row" data-src="' + x.k + '"><b>' + esc(x.name) + '</b><small>' + esc(x.what) + '</small><em>Private</em></div>'; }).join("") + '</div>';
  };
  var srcFor = function (txt) { for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].rx.test(txt || "")) return SOURCES[i].k; return ""; };
  var panel = null, files = [], onBack = null;
  function close() {
    if (panel) { panel.remove(); panel = null; } main.classList.remove("kb-on");
    var nb = document.getElementById("kb-nav"); if (nb) { nb.classList.remove("on"); nb.removeAttribute("aria-current"); }
  }
  function open(first, ctx) {
    close(); onBack = ctx && ctx.back || null;
    var nb = document.getElementById("kb-nav"); if (nb) { nb.classList.add("on"); nb.setAttribute("aria-current", "page"); }
    var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim");
    if (app && app.classList.contains("va-drawer") && scrim) scrim.click();
    var c = get() || {}, u = user() || {};
    files = (c.docs || []).slice();
    panel = document.createElement("div"); panel.className = "kb";
    panel.innerHTML = '<form class="kb-card" novalidate>' +
      '<h2>' + (first ? "Tell Verisavo about your company" : "Knowledge Base") + '</h2>' +
      '<p class="kb-lead">' + (first ? "So answers fit your business and the decision ahead. Takes about a minute." : "What the Assistant knows about your business. Update it when plans change.") + '</p>' +
      (ctx && ctx.src ? srcBlock(ctx) : '') +
      '<label class="kb-f">Company<input name="name" autocomplete="organization" maxlength="120" placeholder="Company name" value="' + esc(c.name || u.organisation) + '"></label>' +
      '<label class="kb-f">What you sell<input name="offer" maxlength="160" placeholder="e.g. Packaged rice and cooking oil" value="' + esc(c.offer) + '"></label>' +
      '<label class="kb-f">Markets you work in or are considering<input name="markets" maxlength="200" placeholder="e.g. Ghana, Nigeria" value="' + esc(c.markets) + '"></label>' +
      '<label class="kb-f">The decision ahead<textarea name="decision" maxlength="400" placeholder="e.g. Whether to launch in Kumasi before Accra next year">' + esc(c.decision) + '</textarea></label>' +
      '<div class="kb-f"><span>Documents <small>(optional)</small></span><div class="kb-docs"></div><input type="file" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt"></div>' +
      '<p class="kb-priv"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3l5.5 2v4.6c0 3.4-2.3 5.9-5.5 7.4-3.2-1.5-5.5-4-5.5-7.4V5z"></path></svg>Your company data remains private, protected and under your control.</p>' +
      (first || (ctx && ctx.src) ? '' : srcBlock(null)) +
      '<div class="kb-act"><button type="submit" class="kb-go">' + (first ? "Save and continue" : "Save") + '</button><button type="button" class="kb-skip">' + (first ? "Skip for now" : (onBack ? "Back to the answer" : "Cancel")) + '</button></div>' +
      '</form>';
    main.appendChild(panel); main.classList.add("kb-on");
    var f = panel.querySelector("form"), go = panel.querySelector(".kb-go"), fi = panel.querySelector("input[type=file]"), docs = panel.querySelector(".kb-docs");
    var drawDocs = function () { docs.innerHTML = files.map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("") + '<button type="button" class="kb-add">+ Add documents</button>'; };
    var valid = function () { go.disabled = !(f.name.value.trim() && f.decision.value.trim()); };
    drawDocs(); valid();
    f.addEventListener("input", valid);
    docs.addEventListener("click", function (e) { if (e.target.closest(".kb-add")) fi.click(); });
    fi.addEventListener("change", function () { [].forEach.call(fi.files, function (x) { if (files.indexOf(x.name) < 0) files.push(x.name); }); fi.value = ""; drawDocs(); });
    panel.querySelector(".kb-skip").addEventListener("click", function () { if (first) try { sessionStorage.setItem("vs-company-skip", "1"); } catch (e) {} var b = onBack; close(); render(); if (b) b(); else focusIn(); });
    if (ctx && ctx.src) { var row = panel.querySelector('.kb-row[data-src="' + srcFor(ctx.src + " " + (ctx.text || "")) + '"]') || panel.querySelector(".kb-row"); if (row) { row.classList.add("hl"); setTimeout(function () { row.scrollIntoView({ block: "center", behavior: "smooth" }); }, 60); } }
    f.addEventListener("submit", function (e) {
      e.preventDefault(); if (go.disabled) return;
      var v = { name: f.name.value.trim(), offer: f.offer.value.trim(), markets: f.markets.value.trim(), decision: f.decision.value.trim(), docs: files, updated: new Date().toISOString() };
      var b = onBack; put(v); close(); render(); if (b) { b(); return; }
      var m = markets(v.markets);
      if (m.length === 1 && window.vaSetScope) window.vaSetScope(m[0]);
      focusIn();
    });
    if (!(ctx && ctx.src)) setTimeout(function () { var x = f.querySelector(first ? "input[name=" + (f.name.value ? "offer" : "name") + "]" : "input"); if (x) x.focus(); }, 40);
  }
  function focusIn() { var t = document.getElementById("va-in"); if (t) setTimeout(function () { t.focus(); }, 40); }

  /* First screen: show what the Assistant knows, and tailor the suggestions */
  var DEF = {};
  [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { DEF[i] = b.dataset.q; });
  function render() {
    var c = get();
    if (c) {
      var m = markets(c.markets)[0] || c.markets || "our markets", o = c.offer ? c.offer.charAt(0).toLowerCase() + c.offer.slice(1) : "our product", d = c.decision.replace(/[.?!]+$/, "");
      var Q = ["What does the market for " + o + " look like in " + m + "?", "Which locations in " + m + " should we consider first for " + o + ", and why?",
               "What don’t we know yet that could change this decision: " + d + "?", "What evidence supports or contradicts our plan to " + d.charAt(0).toLowerCase() + d.slice(1) + "?"];
      [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { if (Q[i]) b.dataset.q = Q[i]; });
    } else {
      [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { b.dataset.q = DEF[i]; });
    }
  }

  /* Open the setup the first time a signed-in client arrives without company knowledge.
     A question carried in from the page is answered first; setup stays available from the sidebar. */
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
  window.vsOpenKb = function (ctx) { open(false, ctx || null); };
  va.addEventListener("close", close);
  render();
})();
/* <<< company knowledge */
}
