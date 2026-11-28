// Assistant sidebar: grouped navigation (Core dashboards, Market research, Assistant), Recent and Credits
export default function init() {
/* >>> assistant sidenav v1 */
(function () {
  /* Assistant sidebar: Core dashboards, Market research, Assistant and Recent.
     Overview, Investigations and Set up a task open the existing client views inside the Assistant.
     AI Assistant returns to the conversation. */
  var va = document.getElementById("va"), side = document.getElementById("va-side"), main = va && va.querySelector(".va-main");
  if (!va || !side || !main || document.getElementById("vsn")) return;
  /* Market Simulator is not open yet: tapping it makes the "Coming soon" tag glow */
  side.addEventListener("click", function (e) {
    var s = e.target.closest(".vsn-soon"); if (!s) return;
    var m = s.querySelector("em"); if (!m) return;
    m.classList.remove("glow"); void m.offsetWidth; m.classList.add("glow");
    clearTimeout(m._g); m._g = setTimeout(function () { m.classList.remove("glow"); }, 1500);
  });
  var I = {
    grid: '<rect x="3.5" y="3.5" width="5.5" height="13" rx="1.6"></rect><rect x="11" y="3.5" width="5.5" height="5.5" rx="1.6"></rect><rect x="11" y="11" width="5.5" height="5.5" rx="1.6"></rect>',
    clip: '<rect x="4.5" y="4" width="11" height="13" rx="2"></rect><path d="M7.5 4V3h5v1M7.5 8.5h5M7.5 11.5h5M7.5 14.5h3"></path>',
    task: '<rect x="3.5" y="3.5" width="13" height="13" rx="2.4"></rect><path d="M10 7v6M7 10h6"></path>',
    bot: '<rect x="4" y="7" width="12" height="9" rx="2.6"></rect><path d="M10 7V4.5M8 11h.01M12 11h.01M2.5 10.5v2.5M17.5 10.5v2.5"></path><circle cx="10" cy="4" r=".9"></circle>',
    gap: '<circle cx="10" cy="10" r="6.5" stroke-dasharray="2.6 2.2"></circle><path d="M8.3 8.4a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.7.6-.7 1.1v.3M10 13.6h.01"></path>',
    sim: '<path d="M3.5 15.5 7.5 10l3 3 6-8"></path><path d="M13 5h3.5v3.5"></path><path d="M3.5 17.5h13"></path>',
    agents: '<circle cx="10" cy="4.8" r="2"></circle><circle cx="4.8" cy="14.6" r="2"></circle><circle cx="15.2" cy="14.6" r="2"></circle><path d="M9 6.6 5.8 12.8M11 6.6l3.2 6.2M6.8 14.6h6.4"></path>',
    card: '<rect x="2.5" y="5" width="15" height="10.5" rx="2"></rect><path d="M2.5 8.5h15M5.5 12.5h3"></path>',
    db: '<ellipse cx="10" cy="5.5" rx="6" ry="2.5"></ellipse><path d="M4 5.5v9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-9M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5"></path>'
  };
  var svg = function (k) { return '<svg class="vi" viewBox="0 0 20 20" aria-hidden="true">' + I[k] + "</svg>"; };
  var item = function (key, label, icon) { return '<li><button type="button" class="va-nav vsn-i" data-vsn="' + key + '">' + svg(icon) + "<span>" + label + "</span></button></li>"; };

  var css = document.createElement("style");
  css.textContent = [
    "#va .va-side{overflow:hidden!important}#va .va-side > *:not(.vsn-scroll){flex-shrink:0!important}",
    "#va .vsn-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;margin:0 -10px;padding:0 6px 8px 10px;scrollbar-width:thin;scrollbar-color:#CECECE transparent;scrollbar-gutter:stable}",
    "#va .vsn-scroll::-webkit-scrollbar{width:8px}#va .vsn-scroll::-webkit-scrollbar-track{background:transparent}",
    "#va .vsn-scroll::-webkit-scrollbar-thumb{background:#CECECE;border-radius:8px;border:2px solid transparent;background-clip:content-box}#va .vsn-scroll::-webkit-scrollbar-thumb:hover{background:#B6B6B6;background-clip:content-box}",
    "#va .vsn-scroll.vsn-shadow-t{box-shadow:inset 0 8px 8px -8px rgba(31,39,63,.12)}#va .vsn-scroll.vsn-shadow-b{box-shadow:inset 0 -8px 8px -8px rgba(31,39,63,.12)}#va .vsn-scroll.vsn-shadow-t.vsn-shadow-b{box-shadow:inset 0 8px 8px -8px rgba(31,39,63,.12),inset 0 -8px 8px -8px rgba(31,39,63,.12)}",
    "#va .vsn{display:grid;gap:2px;margin:6px 0 0}",
    "#va .vsn ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}",
    "#va .vsn-h,#va .va-h.va-h-recent{margin:16px 0 6px!important;padding-left:12px!important;font:600 .7rem/1 var(--sans)!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:#6A6A6C!important}",
    "#va .vsn-h:first-child{margin-top:10px!important}",
    "#va .va-empty{padding-left:12px!important;margin-left:0!important}",
    "#va .vsn-i[aria-current=page]{background:#E6EDF5!important;color:#1F273F!important;font-weight:600!important}",
    "#va .va-recent button{font-size:.875rem!important;color:#6A6A6C!important}",
    "#va .va-recent button[aria-current=true]{color:#1F273F!important;font-weight:600!important}",
    "#va .va-brand .vsn-mark{width:30px;height:30px;flex:none;border-radius:8px;display:block}",
    "#va .va-brand .vsn-bl{display:flex;align-items:center;gap:10px;min-width:0}",
    "#va .vsn-soon{cursor:default!important;color:#6A6A6C!important}#va .vsn-soon:hover{background:none!important}",
    "#va .vsn-soon em{margin-left:auto;flex:none;padding:3px 8px;border-radius:999px;background:#EEF1F6;font:500 .6875rem/1 var(--sans);font-style:normal;color:#78787A;white-space:nowrap}",
    "#va #vsn, #va #vsn ul, #va #vsn li{max-width:100%;min-width:0;width:auto}#va #vsn li{display:block}",
    "#va .vsn-soon{display:flex!important;align-items:center;width:100%;max-width:100%;box-sizing:border-box;overflow:hidden}#va .vsn-soon > span{flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}#va .vsn-soon > svg{flex:none}",
    "@media (max-height:760px){#va .va-side{scrollbar-width:thin}#va .vsn-h,#va .va-h.va-h-recent{margin:10px 0 4px!important}#va .vsn-h:first-child{margin-top:6px!important}#va .vsn .va-nav{padding-top:7px!important;padding-bottom:7px!important}}",
    "#va #va-brief .vs-back[data-to=home]{display:none!important}",
    "#va #kb-nav.vsn-menu{display:block;width:100%;text-align:left}"
  ].join("");
  document.head.appendChild(css);

/* >>> demo guide: a presenter's panel, only when the page is opened with ?demo=1. It moves a walkthrough past the steps that normally wait for a person or for time. */
(function () {
  if (window.vsDemoGuide) return;
  var KEY = 'vs-demo', p = null;
  function qs(w) { try { return new URLSearchParams(w.location.search).get('demo'); } catch (e) { return null; } }
  p = qs(window); if (p == null) { try { p = qs(window.parent); } catch (e) {} } if (p == null) { try { p = qs(window.top); } catch (e) {} }
  try { if (p === '1') localStorage.setItem(KEY, '1'); if (p === '0') localStorage.removeItem(KEY); } catch (e) {}
  var on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (e) {} if (p === '1') on = true; if (p === '0') on = false;
  window.vsDemoOn = on;
  window.vsDemoGuide = function (getSteps, title) {
    if (!on) return;
    function mount() {
      var css = document.createElement('style');
      css.textContent = '#vsdg-b{position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:2147483600;width:46px;padding:8px 0 7px;border-radius:12px;border:0;background:#1F273F;color:#fff;font:600 10.5px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;display:grid;justify-items:center;gap:3px;box-shadow:0 6px 20px rgba(31,39,63,.28)}#vsdg-b svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#vsdg-b:focus-visible{outline:2px solid #80AADC;outline-offset:2px}#vsdg-b[hidden],#vsdg-p[hidden]{display:none!important}' +
        '#vsdg-p{position:fixed;right:64px;top:50%;transform:translateY(-50%);z-index:2147483600;width:min(320px,calc(100vw - 84px));max-height:min(78vh,560px);overflow:auto;background:#fff;color:#1F273F;border:1px solid #DFDFDF;border-radius:14px;box-shadow:0 18px 50px rgba(31,39,63,.22);padding:14px;font:400 13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:left}#vsdg-p h2{margin:0 0 2px;font:600 15px/1.3 inherit;color:#1F273F}#vsdg-p .vsdg-s{margin:0 0 10px;color:#5B6478;font-size:12px}#vsdg-p ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}#vsdg-p li button{all:unset;box-sizing:border-box;display:block;width:100%;padding:10px 12px;border:1px solid #DFDFDF;border-radius:10px;background:#F9FAFE;cursor:pointer}#vsdg-p li button:hover{border-color:#3A5292;background:#EEF1F6}#vsdg-p li button:focus-visible{outline:2px solid #3A5292;outline-offset:1px}#vsdg-p li b{display:block;font-weight:600;font-size:13px;color:#1F273F}#vsdg-p li span{display:block;margin-top:2px;font-size:12px;color:#5B6478}#vsdg-p .vsdg-m{margin:10px 0 0;padding:8px 10px;border-radius:8px;background:#E7F5EC;color:#17704A;font-size:12px}#vsdg-p .vsdg-e{margin:0;color:#5B6478;font-size:12.5px}#vsdg-p .vsdg-f{margin:12px 0 0;padding-top:10px;border-top:1px solid #EEF1F6;display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:11.5px;color:#8A93A5}#vsdg-p .vsdg-f button{all:unset;cursor:pointer;color:#3A5292;font-weight:500;text-decoration:underline;text-underline-offset:2px}';
      document.head.appendChild(css);
      var b = document.createElement('button'); b.id = 'vsdg-b'; b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Demo guide');
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>Demo';
      var pn = document.createElement('div'); pn.id = 'vsdg-p'; pn.hidden = true; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-label', 'Demo guide');
      var msg = '';
      function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
      function steps() { try { return getSteps(); } catch (e) { return []; } }
      function draw() {
        var st = steps() || [];
        pn.innerHTML = '<h2>' + esc(title || 'Demo guide') + '</h2><p class="vsdg-s">Sample people and data. Use these to move past steps that normally wait for a person or for time.</p>' +
          (st.length ? '<ul>' + st.map(function (s, i) { return '<li><button type="button" data-i="' + i + '"><b>' + esc(s.t) + '</b>' + (s.n ? '<span>' + esc(s.n) + '</span>' : '') + '</button></li>'; }).join('') + '</ul>' : '<p class="vsdg-e">Nothing is waiting on this screen. Carry on as a normal user would, and open this guide again when a step asks you to wait.</p>') +
          (msg ? '<p class="vsdg-m" role="status">' + esc(msg) + '</p>' : '') +
          '<p class="vsdg-f"><span>Demo mode is on</span><button type="button" data-leave>Leave demo mode</button></p>';
        pn._st = st;
      }
      function open(v) { pn.hidden = !v; b.setAttribute('aria-expanded', String(v)); if (v) { draw(); } else msg = ''; }
      b.addEventListener('click', function (e) { e.stopPropagation(); open(pn.hidden); });
      pn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (e.target.closest('[data-leave]')) { try { localStorage.removeItem(KEY); } catch (x) {} var u = location.href.replace(/([?&])demo=1(&|$)/, function (m, a, c) { return c ? a : ''; }); if (u !== location.href) location.href = u; else location.reload(); return; }
        var t = e.target.closest('button[data-i]'); if (!t) return;
        var s = (pn._st || [])[+t.dataset.i]; if (!s) return;
        var done = function (r) { msg = typeof r === 'string' ? r : 'Done.'; setTimeout(draw, 350); };
        try { var r = s.go(); if (r && r.then) r.then(done, function () { done('That step could not run here.'); }); else done(r); } catch (x) { done('That step could not run here.'); }
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pn.hidden) open(false); });
      function place() {
        var d = document.querySelectorAll('dialog[open]'), host = d.length ? d[d.length - 1] : document.body;
        if (b.parentNode !== host) { host.appendChild(b); host.appendChild(pn); }
        var st = steps(); b.hidden = st === null; if (b.hidden) pn.hidden = true;
        else if (!pn.hidden) { var sig = (st || []).map(function (s) { return s.t; }).join('|'), was = (pn._st || []).map(function (s) { return s.t; }).join('|'); if (sig !== was) draw(); }
      }
      place(); setInterval(place, 700);
    }
    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  };
})();
/* <<< demo guide */
  /* demo guide steps for the client workspace (only shown in demo mode) */
  (function () {
    if (!window.vsDemoGuide) return;
    var CO = { name: "Sample Foods Ltd", offer: "Packaged rice, cooking oil and detergent", markets: "Nigeria, Ghana", mission: "Make everyday staples affordable for households in West Africa. This year: win back small shops in Lagos and Kano through reliable weekly delivery, and decide whether to launch the 5-litre cooking oil pack in Kumasi before Accra. Orders come through 12 distributors." };
    var setv = function (el, v) { if (!el) return; el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); };
    window.vsDemoGuide(function () {
      var va = document.getElementById("va"); if (!va || !va.getClientRects().length) return null;
      if (document.querySelector("#va .va-main.inv-on")) return null; /* the investigations screen has its own guide */
      var st = [], f = document.querySelector('#va input[name="offer"]');
      if (f && f.offsetParent !== null) st.push({ t: "Fill in the company profile", n: "Sample Foods Ltd, the sample client. Then save it as a normal user would.", go: function () { var fm = f.closest("form") || va; setv(fm.querySelector('input[name="name"]'), CO.name); setv(f, CO.offer); setv(fm.querySelector('input[name="markets"]'), CO.markets); setv(fm.querySelector('textarea[name="mission"]'), CO.mission); return "Filled in. Save it to continue."; } });
      var box = document.getElementById("ask");
      if (box && box.offsetParent !== null) {
        [["Why are our sales falling in Lagos?", "A diagnosis from company data, public records and SavoScout evidence."], ["What if we offered retailers 14 days’ credit?", "A what-if with a range and the assumptions it rests on."], ["Is our cooking oil too expensive in Accra?", "A price question that ends in an open gap you can send to SavoScouts."]].forEach(function (x) {
          st.push({ t: "Ask: " + x[0], n: x[1], go: function () { setv(box, x[0]); var fm = document.getElementById("composer"); if (fm && fm.requestSubmit) fm.requestSubmit(); return "Asked."; } });
        });
      }
      return st;
    }, "Demo guide: client workspace");
  })();

  /* brand mark beside the wordmark */
  var word = side.querySelector(".va-word");
  if (word && !side.querySelector(".vsn-mark")) {
    var bl = document.createElement("span"); bl.className = "vsn-bl";
    bl.innerHTML = '<svg class="vsn-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#1F273F"></rect><path d="M17 19h7.2l7.8 21.5L39.8 19H47L35.6 47h-7.2z" fill="#FFFFFF"></path><circle cx="47" cy="45" r="3.2" fill="#8CA9D0"></circle></svg>';
    word.parentNode.insertBefore(bl, word); bl.appendChild(word);
  }

  /* the grouped navigation replaces Search, Investigations and Company knowledge */
  var nav = document.createElement("nav"); nav.className = "vsn"; nav.id = "vsn"; nav.setAttribute("aria-label", "Workspace");
  nav.innerHTML =
    '<p class="vsn-h">Dashboard</p><ul>' + item("c-overview", "Overview", "grid") + "</ul>" +
    '<p class="vsn-h">Market research</p><ul>' + item("c-surveys", "Investigations", "clip") + item("c-builder", "Create a task", "task") + item("c-billing", "Billing", "card") + "</ul>" +
    '<p class="vsn-h">Intelligence assistance</p><ul>' + item("chat", "Verisavo Assistant", "bot") + '<li><span class="va-nav vsn-i vsn-soon" aria-disabled="true">' + svg("agents") + '<span>Agents</span><em>Coming soon</em></span></li></ul>' +
    '<p class="vsn-h">Simulation</p><ul><li><span class="va-nav vsn-i vsn-soon" aria-disabled="true">' + svg("sim") + '<span>Market Simulator</span><em>Coming soon</em></span></li></ul>' +
    '<p class="vsn-h">Company</p><ul><li><button type="button" class="va-nav vsn-i" id="vsn-kb">' + svg("db") + "<span>Knowledge Base</span></button></li></ul>";
  /* Billing lives with the account: it opens from the profile panel, so its sidebar row stays in the page but out of sight */
  (function () { var bb = nav.querySelector('[data-vsn="c-billing"]'), li = bb && bb.closest("li"); if (li) { li.hidden = true; li.style.display = "none"; } })();
  var oldList = side.querySelector(".va-list:not(.va-recent)"), newBtn = document.getElementById("va-new");
  var kb = document.getElementById("kb-nav");
  if (newBtn) newBtn.insertAdjacentElement("afterend", nav); else side.insertBefore(nav, side.firstChild);
  var kbItem = nav.querySelector("#vsn-kb");
  if (kbItem) kbItem.addEventListener("click", function () { if (window.vsKbs && window.vsKbs.manage) window.vsKbs.manage(); else if (window.vsOpenKb) window.vsOpenKb(); });
  if (oldList) oldList.style.display = "none";
  var search = document.getElementById("va-search"); if (search) search.hidden = true;

  /* Company knowledge moves into the account menu so it stays reachable */
  var gm = document.getElementById("va-gear-menu");
  if (kb && gm) {
    kb.className = "vsn-menu"; kb.setAttribute("role", "menuitem"); kb.textContent = "Knowledge Base";
    gm.insertBefore(kb, gm.firstChild);
    kb.addEventListener("click", function () { gm.hidden = true; var g = document.getElementById("va-gear"); if (g) g.setAttribute("aria-expanded", "false"); });
  }

  /* plan line under the name */
  var user = side.querySelector(".va-user");
  if (user) { var sub = user.querySelector(".va-who small"); if (sub) sub.textContent = "Verisavo plan"; }
  if (user) user.style.marginTop = "auto";

  /* which item is current */
  var curHash = "";
  window.addEventListener("message", function (e) {
    if (!e.data) return;
    if (e.data.vs === "inv-hash") { curHash = String(e.data.h || ""); mark(); }
    if (e.data.vs === "back-chat") { closeInv(); closeDrawer(); setTimeout(function () { mark(); var t = document.getElementById("ask") || document.getElementById("va-in"); if (t) t.focus(); }, 30); }
  });
  var frameHash = function () { var f = main.querySelector(".va-inv iframe"); try { var h = f && f.contentWindow ? f.contentWindow.location.hash.slice(1) : ""; return h || curHash; } catch (e) { return curHash; } };
  function mark() {
    var cur = "chat";
    if (main.classList.contains("inv-on")) {
      var h = frameHash();
      cur = /^c-(surveys?|responses)/.test(h) ? "c-surveys" : /^c-builder/.test(h) ? "c-builder" : h === "c-billing" ? "c-billing" : h === "c-overview" || !h ? "c-overview" : "";
    } else if (main.classList.contains("brief-on")) cur = "gaps";
    else if (main.classList.contains("kb-on")) cur = "";
    [].forEach.call(nav.querySelectorAll("[data-vsn]"), function (b) {
      if (b.dataset.vsn === cur) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  function watchFrame() {
    var f = main.querySelector(".va-inv iframe"); if (!f || f.dataset.vsnWatch) return;
    f.dataset.vsnWatch = "1";
    f.addEventListener("load", function () { mark(); try { f.contentWindow.addEventListener("hashchange", mark); } catch (e) {} });
  }
  new MutationObserver(function () { watchFrame(); mark(); }).observe(main, { attributes: true, attributeFilter: ["class"], childList: true });

  function closeDrawer() { var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim"); if (app && app.classList.contains("va-drawer") && scrim) scrim.click(); }
  function closeKb() { [].forEach.call(main.querySelectorAll(":scope > .kb"), function (p) { p.remove(); }); main.classList.remove("kb-on"); }
  function closeBrief() { var bp = document.getElementById("va-brief"); main.classList.remove("brief-on"); if (bp) bp.hidden = true; }
  function closeInv() { window.postMessage({ vs: "close-platform" }, "*"); }

  /* window capture phase: runs before the Assistant's own (document, capture) sidebar handler, so switching views never tears the panel down */
  window.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#vsn [data-vsn]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.dataset.vsn; closeKb();
    if (k === "gaps") { closeInv(); closeDrawer(); if (window.vsOpenBrief) window.vsOpenBrief("gaps"); setTimeout(mark, 30); return; }
    closeBrief();
    if (k === "chat") { closeInv(); closeDrawer(); setTimeout(function () { mark(); var t = document.getElementById("ask") || document.getElementById("va-in"); if (t) t.focus(); }, 30); return; }
    var f = main.classList.contains("inv-on") && main.querySelector(".va-inv iframe");
    curHash = k;
    if (f && f.src && f.src.indexOf("about:blank") !== 0) {
      /* same page, new fragment: the view changes without reloading (works even when the frame cannot be read) */
      var base = f.src.split("#")[0]; if (f.src !== base + "#" + k) f.src = base + "#" + k; closeDrawer();
    } else if (window.vsInvestigations) window.vsInvestigations(k);
    setTimeout(mark, 30);
  }, true);
  /* Intelligence Gaps page wording matches the sidebar */
  var bp0 = document.getElementById("va-brief");
  window.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("#va-brief [data-gaps-close]")) { e.stopPropagation(); closeBrief(); setTimeout(mark, 30); var i = document.getElementById("ask") || document.getElementById("va-in"); if (i) i.focus(); } }, true);
  /* On the Intelligence Gaps page: Investigate this gap opens Set up a task with the gap filled in; the other links go to the current views */
  window.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest || !t.closest("#va-brief")) return;
    var an = t.closest(".vs-an[data-gap]"), to = t.closest("[data-to]");
    var bp = document.getElementById("va-brief"); if (!bp || bp.hidden) return;
    var gapView = !!bp.querySelector(".vs-gap, .vs-empty") && !bp.querySelector(".vb-card");
    if (!gapView || (!an && !to)) return;
    var dest = an ? "c-builder" : to.dataset.to === "new" ? "c-builder" : to.dataset.to === "home" ? "c-surveys" : "";
    if (!dest) return;
    e.preventDefault(); e.stopPropagation();
    var gap = "", ctx = null;
    if (an) { var li = an.closest(".vs-gap"), h = li && li.querySelector(".vs-gap-h"); gap = h ? h.textContent.trim() : ""; try { ctx = an.dataset.gapCtx ? JSON.parse(an.dataset.gapCtx) : null; } catch (er) { ctx = null; } }
    closeBrief(); curHash = dest;
    if (window.vsInvestigations) window.vsInvestigations(dest, gap, ctx);
    setTimeout(mark, 30);
  }, true);
  mark();
  /* the navigation and Recent scroll on their own; the logo, New question and the account stay put */
  (function () {
    var side = va.querySelector(".va-side"), first = side && side.querySelector("#vsn"); if (!side || !first || side.querySelector(".vsn-scroll")) return;
    var w = document.createElement("div"); w.className = "vsn-scroll"; side.insertBefore(w, first);
    var n = w.nextSibling; while (n && !(n.classList && n.classList.contains("va-user"))) { var nx = n.nextSibling; w.appendChild(n); n = nx; }
    var edge = function () { w.classList.toggle("vsn-shadow-t", w.scrollTop > 2); w.classList.toggle("vsn-shadow-b", w.scrollTop + w.clientHeight < w.scrollHeight - 2); };
    w.addEventListener("scroll", edge, { passive: true }); window.addEventListener("resize", edge);
    if (window.MutationObserver) new MutationObserver(edge).observe(w, { childList: true, subtree: true });
    edge();
  })();
})();
/* <<< assistant sidenav v1 */
}
