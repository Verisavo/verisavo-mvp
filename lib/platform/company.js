// Company knowledge: private company context for the Verisavo Assistant.
export default function init() {
/* >>> company knowledge */
(function () {
  /* Company knowledge: the private context the Verisavo Assistant needs to make answers relevant.
     MVP: one short, skippable setup after sign-up, editable later from the sidebar. Stored in this browser only. */
  var va = document.getElementById("va"), main = va && va.querySelector(".va-main"), hello = document.getElementById("va-hello");
  if (!va || !main || !hello || document.getElementById("kb-nav")) return;
  var KEY = "vs-company";
  var esc = function (s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  /* Several knowledge bases (one per company, brand or business unit); the active one is what answers draw on */
  var STORE = "vs-kbs";
  var SAMPLE = { id: "kb-sample", sample: true, name: "Cooking oil, Ghana", offer: "Cooking oil in 1-litre and 5-litre packs", markets: "Ghana", mission: "Make good cooking oil affordable for households in Ghana. This year: grow share in Accra.", strategy: "Win small shops first through reliable weekly delivery, then widen the range.", ops: "Sold through regional distributors, with orders taken weekly and deliveries tracked by area.", decision: "Whether to change our one-litre pack price in Accra before the next quarter", docs: ["Company strategy 2026.pdf", "Distribution process.pdf", "Objectives Q4 2026.docx"] };
  var uidk = function () { return "kb-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var load = function () {
    var d = null; try { d = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) {}
    if (!d || !Array.isArray(d.list)) {
      d = { active: "", list: [] };
      var old = null; try { old = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
      if (old && old.name) { old.id = uidk(); d.list.push(old); d.active = old.id; }
    }
    d.list = d.list.filter(function (x) { return !(x.sample && !x.mission); });
    if (!d.list.some(function (x) { return x.sample; })) d.list.push(SAMPLE);
    return d;
  };
  var save = function (d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) {} };
  var byId = function (d, id) { return d.list.filter(function (x) { return x.id === id; })[0] || null; };
  var get = function () { var d = load(); return byId(d, d.active); };
  var put = function (v) { var d = load(), cur = byId(d, v.id || d.active); if (cur) { for (var k in v) cur[k] = v[k]; } else { v.id = v.id || uidk(); d.list.unshift(v); d.active = v.id; } save(d); fire(); };
  var subs = [];
  var fire = function () { subs.forEach(function (f) { try { f(); } catch (e) {} }); try { window.dispatchEvent(new Event("vs-kbs")); } catch (e) {} };
  var label = function (x) { return x ? (x.name || "Untitled knowledge base") : "None"; };
  window.vsKbs = {
    list: function () { return load().list.map(function (x) { return { id: x.id, name: label(x), sample: !!x.sample, offer: x.offer || "" }; }); },
    active: function () { var a = get(); return a ? { id: a.id, name: label(a) } : null; },
    select: function (id) { var d = load(); d.active = id && byId(d, id) ? id : ""; save(d); fire(); render(); },
    manage: function () { open(false); },
    onChange: function (f) { subs.push(f); }
  };
  var user = function () { try { return JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) { return null; } };
  var COUNTRIES = [].map.call(va.querySelectorAll("#va-scope-menu [data-market]"), function (b) { return b.dataset.market; }).filter(function (m) { return m !== "All markets"; });
  var markets = function (txt) { var t = (txt || "").toLowerCase(); return COUNTRIES.filter(function (c) { return t.indexOf(c.toLowerCase()) >= 0; }); };

  var css = document.createElement("style");
  css.textContent = [
    ".va-main.kb-on>.va-body,.va-main.kb-on>.va-dock{display:none!important}",
    ".kb{flex:1 1 auto;min-height:0;overflow-y:auto;display:grid;place-items:start center;padding:clamp(20px,5vh,48px) 16px 72px}",
    ".kb-card{width:min(500px,100%);display:grid;gap:14px;color:#1F273F}",
    ".kb-card h2{margin:0;font:600 clamp(1.35rem,1.1rem + .8vw,1.7rem)/1.2 var(--display,var(--sans))!important;letter-spacing:-.02em!important;color:#1F273F!important}",
    ".kb-lead{margin:-8px 0 0!important;font:400 .95rem/1.5 var(--sans)!important;color:#69696B!important}",
    ".kb-f{display:grid;gap:6px;font:500 .85rem/1.2 var(--sans);color:#3D4559}",
    ".kb-f small{font-weight:400;color:#6A6A6C}",
    ".kb-f input,.kb-f textarea{width:100%;box-sizing:border-box;border:1px solid #DCE4EE;border-radius:12px;padding:11px 13px;font:400 .95rem/1.4 var(--sans);color:#1F273F;background:#fff;resize:vertical}",
    ".kb-f textarea{min-height:88px}.kb-swm[hidden]{display:none!important}",
    ".kb-f input:focus,.kb-f textarea:focus{outline:none;border-color:#4774AE;box-shadow:0 0 0 3px #E6EDF5}",
    ".kb-docs{display:flex;flex-wrap:wrap;align-items:center;gap:6px}",
    ".kb-docs span{font:500 .78rem/1 var(--sans);padding:6px 9px;border-radius:999px;background:#F8F8F8;color:#3B6091}",
    ".kb-add{border:1px dashed #B1C5DF;background:none;border-radius:999px;padding:7px 12px;font:500 .82rem/1 var(--sans);color:#3B6091;cursor:pointer}.kb-add:hover{background:#F8F8F8}",
    ".kb-sw{position:relative;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:-4px}",
    ".kb-swb{display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:8px 10px 8px 12px;border:1px solid #DCE4EE;border-radius:10px;background:#fff;font:500 .9rem/1.2 var(--sans);color:#1F273F;cursor:pointer}.kb-swb:hover{background:#FAFAFA}",
    ".kb-swn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kb-swb svg{width:16px;height:16px;flex:none;fill:none;stroke:#69696B;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}",
    ".kb-tag{font:500 .7rem/1 var(--sans);font-style:normal;padding:4px 7px;border-radius:999px;background:#F8F8F8;color:#69696B;white-space:nowrap}.kb-tag.on{background:#E6EDF5;color:#1F273F}",
    ".kb-swm{position:absolute;top:calc(100% + 6px);left:0;z-index:5;width:min(380px,100%);display:grid;gap:2px;padding:6px;border:1px solid #DCE4EE;border-radius:12px;background:#fff;box-shadow:0 12px 32px -16px rgba(31,39,63,.28)}",
    ".kb-swo{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:9px 10px;border:0;border-radius:8px;background:none;text-align:left;cursor:pointer;font:inherit;color:#1F273F}.kb-swo:hover,.kb-swo.on{background:#F8F8F8}",
    ".kb-swo span{display:grid;gap:2px;min-width:0}.kb-swo b{font:500 .88rem/1.25 var(--sans)}.kb-swo small{font:400 .76rem/1.3 var(--sans);color:#69696B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".kb-mis textarea{min-height:240px}.kb-wc{margin:6px 2px 0;font:400 .75rem/1.4 var(--sans);color:#8E8D92}.kb-wc.full{color:#9A5B13}",
    ".kb-swl{display:grid;gap:2px;overscroll-behavior:contain}",
    ".kb-swnew{color:#3B6091;font:500 .85rem/1.2 var(--sans);border-top:1px solid #EEF1F6;border-radius:0 0 8px 8px;margin-top:4px;padding-top:11px}",
    ".kb-use{border:0;background:none;padding:0;font:500 .85rem/1.2 var(--sans);color:#3B6091;cursor:pointer;text-decoration:underline;text-underline-offset:2px}",
    ".kb-del{margin-left:auto;border:0;background:none;padding:0;font:500 .82rem/1.2 var(--sans);color:#69696B;cursor:pointer}.kb-del:hover{color:#1F273F;text-decoration:underline}",
    ".kb-from{display:grid;gap:4px;padding:12px 14px;border:1px solid #DCE4EE;border-radius:12px;background:#FAFAFA}.kb-from b{font:600 .78rem/1.2 var(--sans);color:#69696B}.kb-from p{margin:0!important;font:400 .9rem/1.45 var(--sans)!important;color:#1F273F!important}",
    ".kb-src{display:grid;gap:8px}.kb-src > span{font:500 .85rem/1.2 var(--sans);color:#3D4559}",
    ".kb-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 12px;padding:11px 13px;border:1px solid #DCE4EE;border-radius:12px;background:#fff;transition:border-color .2s,box-shadow .2s,background-color .2s}",
    ".kb-row b{font:500 .9rem/1.3 var(--sans);color:#1F273F}.kb-row small{grid-column:1;font:400 .8rem/1.4 var(--sans);color:#69696B}.kb-row em{grid-row:1 / span 2;grid-column:2;align-self:center;font:500 .72rem/1 var(--sans);font-style:normal;color:#69696B;background:#F8F8F8;border-radius:999px;padding:5px 8px}",
    ".kb-row.hl{border-color:#4774AE;box-shadow:0 0 0 3px #E6EDF5;background:#FCFCFC}",
    ".kb-priv{display:flex;gap:8px;align-items:flex-start;margin:0!important;font:400 .8rem/1.45 var(--sans)!important;color:#69696B!important}",
    ".kb-priv svg{width:16px;height:16px;flex:none;margin-top:1px;fill:none;stroke:#4774AE;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}",
    ".kb-act{display:flex;gap:10px;align-items:center;flex-wrap:wrap}",
    ".kb-go{height:44px;padding:0 20px;border:0;border-radius:12px;background:#1F273F;color:#fff;font:600 .95rem/1 var(--sans);cursor:pointer}.kb-go:hover{background:#3B6091}.kb-go[disabled]{opacity:.4;cursor:not-allowed}",
    ".kb-back{display:inline-flex;align-items:center;gap:4px;align-self:flex-start;justify-self:start;width:max-content;height:30px;margin:0 0 14px -2px;padding:0 10px 0 6px;border:1px solid #E5E5E5;border-radius:8px;background:#fff;font:500 .8125rem/1 var(--sans);color:#3A3A3C;cursor:pointer}.kb-back:hover{border-color:#C9CFD8;color:#1F273F}.kb-back:focus-visible{outline:2px solid #4D74C3;outline-offset:2px}.kb-back svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    ".kb-skip-top{align-self:flex-end;justify-self:end;width:max-content;height:34px;margin:0 -8px 6px 0;padding:0 10px;border:0;border-radius:10px;background:none!important;color:#3B6091!important;font:500 .875rem/1 var(--sans)!important;min-height:0!important;cursor:pointer}.kb-skip-top:hover{background:#F8F8F8}",
    ".kb-skip{height:44px;padding:0 14px;border:0;background:none;color:#3B6091;font:500 .92rem/1 var(--sans);cursor:pointer;border-radius:12px}.kb-skip:hover{background:#F8F8F8}",
    ".va-dark .kb-card,.va-dark .kb-card h2{color:#fff!important}.va-dark .kb-lead,.va-dark .kb-priv,.va-dark .kb-f{color:#B8B8B8!important}",
    ".va-dark .kb-f input,.va-dark .kb-f textarea{background:#1F273F;border-color:#3A4565;color:#fff}"
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
    return ctx && ctx.text ? '<div class="kb-src" id="kb-src"><div class="kb-from"><b>Used in an answer</b><p>' + esc(ctx.text) + '</p></div></div>' : '';
  };
  var srcFor = function (txt) { for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].rx.test(txt || "")) return SOURCES[i].k; return ""; };
  var panel = null, files = [], onBack = null;
  function close() {
    if (panel) { panel.remove(); panel = null; } main.classList.remove("kb-on");
    var nb = document.getElementById("kb-nav"); if (nb) { nb.classList.remove("on"); nb.removeAttribute("aria-current"); }
  }
  var viewing = "";
  var WMAX = 3000;
  /* goals, operations and the decision now live in the one mission box; older entries are folded in so nothing is lost */
  function mergedMission(c) {
    var m = c.mission || "", add = [c.strategy, c.ops, c.decision ? "The decision ahead: " + c.decision : ""].filter(function (x) { return x && m.indexOf(x.replace(/^The decision ahead: /, "")) < 0; });
    return [m].concat(add).filter(Boolean).join("\n\n");
  }
  var words = function (s) { var t = s.trim(); return t ? t.split(/\s+/).length : 0; };
  function open(first, ctx, which) {
    close(); onBack = ctx && ctx.back || null;
    var D = load(); viewing = first || which === "__new" ? "" : (which && byId(D, which) ? which : D.active || (D.list[0] && D.list[0].id) || "");
    var nb = document.getElementById("kb-nav"); if (nb) { nb.classList.add("on"); nb.setAttribute("aria-current", "page"); }
    var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim");
    if (app && app.classList.contains("va-drawer") && scrim) scrim.click();
    var c = (viewing && byId(D, viewing)) || {}, u = user() || {};
    var isNew = !first && !viewing;
    files = (c.docs || []).slice();
    panel = document.createElement("div"); panel.className = "kb";
    panel.innerHTML = '<form class="kb-card" novalidate>' + (first ? '<button type="button" class="kb-skip-top">Skip for now</button>' : '<button type="button" class="kb-back"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5"/></svg>Back</button>') +
      '<h2>' + (first ? "Tell Verisavo about your company" : isNew ? "New knowledge base" : "Knowledge Base") + '</h2>' +
      (first ? '' : '<div class="kb-sw"><button type="button" class="kb-swb" aria-haspopup="listbox" aria-expanded="false"><span class="kb-swn">' + esc(isNew ? "New knowledge base" : label(c)) + '</span>' + (c.sample ? '<em class="kb-tag">Sample</em>' : '') + (!isNew && D.active === viewing ? '<em class="kb-tag on">In use</em>' : '') + '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8l4 4 4-4"/></svg></button>' +
        '<div class="kb-swm" role="listbox" hidden><div class="kb-swl" data-vsbar-rows="4">' + D.list.map(function (x) { return '<button type="button" role="option" class="kb-swo' + (x.id === viewing ? ' on' : '') + '" data-kb="' + x.id + '"><span><b>' + esc(label(x)) + '</b><small>' + esc([x.offer, x.markets].filter(Boolean).join(" · ") || "No details yet") + '</small></span>' + (x.id === D.active ? '<em class="kb-tag on">In use</em>' : '') + '</button>'; }).join('') + '</div>' +
        '<button type="button" class="kb-swo kb-swnew" data-kb="new">+ New knowledge base</button></div>' +
        (!isNew && D.active !== viewing ? '<button type="button" class="kb-use">Use in the Assistant</button>' : '') + '</div>') +
      '<p class="kb-lead">' + (first ? "Your mission, goals, strategy and how you operate, so answers fit your business. Takes a few minutes." : "What your company is working towards and how it operates: mission, objectives, goals, strategy and processes. Update it when plans change.") + '</p>' +
      (ctx && ctx.src ? srcBlock(ctx) : '') +
      '<label class="kb-f">Name <small>(like a folder name)</small><input name="name" autocomplete="organization" maxlength="120" placeholder="e.g. Cooking oil, Ghana" value="' + esc(c.name || u.organisation) + '"></label>' +
      '<label class="kb-f">What you sell<input name="offer" maxlength="160" placeholder="e.g. Packaged rice and cooking oil" value="' + esc(c.offer) + '"></label>' +
      '<label class="kb-f">Markets you work in or are considering<input name="markets" maxlength="200" placeholder="e.g. Ghana, Nigeria" value="' + esc(c.markets) + '"></label>' +
      '<div class="kb-f kb-mis"><label for="kb-mission">Mission and objectives</label><textarea id="kb-mission" name="mission" aria-describedby="kb-wc" placeholder="e.g. Make cooking oil affordable for households in Ghana and grow share in Accra this year. Win small shops first through reliable weekly delivery. Orders come through 12 distributors. The decision ahead: whether to launch in Kumasi before Accra next year.">' + esc(mergedMission(c)) + '</textarea><p class="kb-wc" id="kb-wc"></p></div>' +
      '<div class="kb-f"><span>Documents <small>(optional, e.g. strategy, plans, process documents)</small></span><div class="kb-docs"></div><input type="file" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt"></div>' +
      '<p class="kb-priv"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3l5.5 2v4.6c0 3.4-2.3 5.9-5.5 7.4-3.2-1.5-5.5-4-5.5-7.4V5z"></path></svg>Your company data remains private, protected and under your control.</p>' +
      (first || (ctx && ctx.src) ? '' : srcBlock(null)) +
      '<div class="kb-act"><button type="submit" class="kb-go">' + (first ? "Save and continue" : isNew ? "Create and use" : "Save") + '</button><button type="button" class="kb-skip">' + (first ? "Skip for now" : (onBack ? "Back to the answer" : "Cancel")) + '</button>' + (!first && !isNew && !c.sample && D.list.length > 1 ? '<button type="button" class="kb-del">Remove this knowledge base</button>' : '') + '</div>' +
      '</form>';
    main.appendChild(panel); main.classList.add("kb-on");
    var f = panel.querySelector("form"), go = panel.querySelector(".kb-go"), fi = panel.querySelector("input[type=file]"), docs = panel.querySelector(".kb-docs");
    var drawDocs = function () { docs.innerHTML = files.map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("") + '<button type="button" class="kb-add">+ Add documents</button>'; };
    var wc = panel.querySelector(".kb-wc");
    var count = function () {
      var n = words(f.mission.value);
      if (n > WMAX) { var m = f.mission.value.match(new RegExp("^\\s*(?:\\S+\\s+){" + (WMAX - 1) + "}\\S+")); if (m) f.mission.value = m[0]; n = WMAX; }
      wc.textContent = "Up to " + WMAX.toLocaleString("en-GB") + " words. " + n.toLocaleString("en-GB") + " written."; wc.classList.toggle("full", n >= WMAX);
    };
    var valid = function () { count(); go.disabled = !(f.name.value.trim() && f.mission.value.trim()); };
    drawDocs(); valid();
    f.addEventListener("input", valid);
    docs.addEventListener("click", function (e) { if (e.target.closest(".kb-add")) fi.click(); });
    fi.addEventListener("change", function () { [].forEach.call(fi.files, function (x) { if (files.indexOf(x.name) < 0) files.push(x.name); }); fi.value = ""; drawDocs(); });
    var kbk = panel.querySelector(".kb-back"); if (kbk) kbk.addEventListener("click", function () { var b = onBack; close(); render(); if (b) b(); else focusIn(); });
    var kst = panel.querySelector(".kb-skip-top"); if (kst) kst.addEventListener("click", function () { panel.querySelector(".kb-skip").click(); });
    panel.querySelector(".kb-skip").addEventListener("click", function () { if (first) try { sessionStorage.setItem("vs-company-skip", "1"); } catch (e) {} var b = onBack; close(); render(); if (b) b(); else focusIn(); });
    var swb = panel.querySelector(".kb-swb"), swm = panel.querySelector(".kb-swm");
    if (swb) {
      var t0 = Date.now(); swb.addEventListener("click", function () { if (Date.now() - t0 < 400) return; var o = swm.hidden; swm.hidden = !o; swb.setAttribute("aria-expanded", String(o)); });
      swm.addEventListener("click", function (e) { var b = e.target.closest("[data-kb]"); if (!b) return; var id = b.dataset.kb; open(false, null, id === "new" ? "__new" : id); });
      document.addEventListener("click", function h(e) { if (!panel || !panel.contains(e.target)) { document.removeEventListener("click", h, true); return; } if (!e.target.closest(".kb-sw")) { swm.hidden = true; swb.setAttribute("aria-expanded", "false"); } }, true);
    }
    var use = panel.querySelector(".kb-use"); if (use) use.addEventListener("click", function () { window.vsKbs.select(viewing); open(false, null, viewing); });
    var del = panel.querySelector(".kb-del"); if (del) del.addEventListener("click", function () {
      if (del.dataset.sure !== "1") { del.dataset.sure = "1"; del.textContent = "Remove it? This cannot be undone"; return; }
      var d = load(); d.list = d.list.filter(function (x) { return x.id !== viewing; }); if (d.active === viewing) d.active = (d.list.filter(function (x) { return !x.sample; })[0] || {}).id || ""; save(d); fire(); render(); open(false);
    });
    if (ctx && ctx.src) { var row = panel.querySelector('.kb-row[data-src="' + srcFor(ctx.src + " " + (ctx.text || "")) + '"]') || panel.querySelector(".kb-row"); if (row) { row.classList.add("hl"); setTimeout(function () { row.scrollIntoView({ block: "center", behavior: "smooth" }); }, 60); } }
    f.addEventListener("submit", function (e) {
      e.preventDefault(); if (go.disabled) return;
      var v = { name: f.name.value.trim(), offer: f.offer.value.trim(), markets: f.markets.value.trim(), mission: f.mission.value.trim(), strategy: "", ops: "", decision: "", docs: files, updated: new Date().toISOString() };
      var b = onBack;
      if (first || isNew) { v.id = uidk(); var d0 = load(); d0.list.unshift(v); d0.active = v.id; save(d0); fire(); }
      else { v.id = viewing; var d1 = load(), cur = byId(d1, viewing); if (cur) { for (var k in v) cur[k] = v[k]; delete cur.sample; } save(d1); fire(); }
      close(); render(); if (b) { b(); return; }
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
      var m = markets(c.markets)[0] || c.markets || "our markets", o = c.offer ? c.offer.charAt(0).toLowerCase() + c.offer.slice(1) : "our product", d = (c.decision || "").replace(/[.?!]+$/, "");
      var Q = ["What does the market for " + o + " look like in " + m + "?", "Which locations in " + m + " should we consider first for " + o + ", and why?",
               "What don’t we know yet that could change this decision: " + d + "?", "What evidence supports or contradicts our plan to " + d.charAt(0).toLowerCase() + d.slice(1) + "?"];
      if (!d) Q = Q.slice(0, 2);
      [].forEach.call(va.querySelectorAll(".va-chip[data-q]"), function (b, i) { b.dataset.q = Q[i] || DEF[i]; });
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
  fire();
})();
/* <<< company knowledge */
}
