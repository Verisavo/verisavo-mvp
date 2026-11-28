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
  /* a shared link can only carry a plain #name, so these names do the same job as ?demo=1, ?demo=0 and ?tour=1 */
  if (location.hash === '#demo-on') p = '1'; if (location.hash === '#demo-off') p = '0';
  if (location.hash === '#tour' && !document.getElementById('va')) { try { location.replace((window.__next_f || window.next) ? '/platform?tour=1' : 'assistant.html?tour=1'); } catch (e) {} return; }
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

  /* >>> guided tour: a spotlight that walks a visitor through the real workspace, one step at a time. Starts with ?tour=1 or "Take the tour". */
  (function () {
    if (window.vsStartTour) return;
    var vaT = document.getElementById("va"); if (!vaT) return;
    function qsT(w) { try { return new URLSearchParams(w.location.search).get("tour"); } catch (e) { return null; } }
    var want = qsT(window); if (want == null) { try { want = qsT(window.parent); } catch (e) {} }
    var $1 = function (s) { var l = document.querySelectorAll(s), i; for (i = l.length - 1; i >= 0; i--) if (l[i].getClientRects().length) return l[i]; return null; };
    var frame = function () { return document.querySelector("#va .va-inv iframe"); };
    var fhash = function () { var f = frame(); try { return f && f.getClientRects().length ? f.contentWindow.location.hash.slice(1) : ""; } catch (e) { return document.querySelector("#va .va-main.inv-on") ? "?" : ""; } };
    var answers = function () { return document.querySelectorAll("#va .ans .quiet").length; };
    var ask = function (q) { var b = document.getElementById("ask"), f = document.getElementById("composer"); if (!b || !f) return; b.value = q; b.dispatchEvent(new Event("input", { bubbles: true })); if (f.requestSubmit) f.requestSubmit(); };
    var inv = function (h) { if (window.vsInvestigations) window.vsInvestigations(h); };
    var toChat = function () { if (document.querySelector("#va .va-main.inv-on") && window.vsCloseInvestigations) window.vsCloseInvestigations(); };
    var sheetOpen = function () { var s = document.querySelector("#sheet .sbody"); return !!(s && s.getClientRects().length); };
    var base = 0;
    var STEPS = [
      { card: true, t: "See how Verisavo works", x: "You are exploring as Sample Foods Ltd, a sample company selling rice, cooking oil and detergent in Nigeria and Ghana. The data is sample data. The screens are the real product. It takes about 3 minutes.", go: "Start the tour", enter: function () { toChat(); } },
      { sel: function () { return $1('#va .sugg-chip[data-arg^="Why are our sales falling in Lagos"]') || $1("#composer"); }, t: "Ask about your market", x: "Start with a real business question. Tap this one.", go: "Ask it for me", enter: function () { toChat(); base = answers(); }, act: function () { var c = $1('#va .sugg-chip[data-arg^="Why are our sales falling in Lagos"]'); if (c) c.click(); else ask("Why are our sales falling in Lagos?"); }, until: function () { return answers() > base; }, wait: "Verisavo is working on it" },
      { sel: function () { return $1("#va .ans"); }, t: "An answer you can check", x: "It says what seems to be happening, and it says where the understanding stops. Verisavo does not guess past its evidence." },
      { sel: function () { return $1("#va .ans .srcbtn"); }, t: "See what it rests on", x: "Tap Sources to see where each part of the answer comes from.", go: "Open it for me", act: function () { var b = $1("#va .ans .srcbtn"); if (b) b.click(); }, until: sheetOpen },
      { sel: function () { var b = $1("#sheet .sbody"); return b ? (b.closest("#sheet > *") || b) : null; }, t: "Every source is labelled", x: "Company data, public records and evidence from people on the ground are kept apart, so you can judge how far to trust each one.", leave: function () { if (sheetOpen()) { var b = $1('#va [data-act="sheetToggle"]'); if (b) b.click(); } } },
      { sel: function () { return $1('#va .furow[data-arg$="|scenario"]') || $1("#composer"); }, t: "Test an idea before you commit", x: "Ask a what-if. Tap this follow-up.", go: "Ask it for me", enter: function () { base = answers(); }, act: function () { var c = $1('#va .furow[data-arg$="|scenario"]'); if (c) c.click(); else ask("What if we matched the rival’s price?"); }, until: function () { return answers() > base; }, wait: "Verisavo is working on it" },
      { sel: function () { return $1("#va .ans"); }, t: "A range, not a promise", x: "You get a likely outcome, a range, and the assumptions behind it. If an assumption is weak, the answer says so." },
      { sel: function () { return $1("#vmic"); }, t: "Or just talk", x: "Tap the microphone to ask out loud and hear the answer. The download icon at the top saves the whole conversation as a PDF." },
      { sel: function () { return $1('#vsn [data-vsn="c-surveys"]'); }, t: "Close the gap with evidence", x: "When an answer can’t confirm something, SavoScouts check it on the ground. Open Investigations.", go: "Open it for me", act: function () { inv("c-surveys"); }, until: function () { return /^c-surveys|^\?$/.test(fhash()); } },
      { fsel: 'tr[data-go="c-survey-case-kano"]', t: "Open a finished example", x: "Sample Foods saw detergent sales slow in Kano. Open that investigation.", go: "Open it for me", act: function () { inv("c-survey-case-kano~brief"); }, until: function () { return /^c-survey-case-kano/.test(fhash()); }, skipIfBlind: true },
      { fsel: ".tabs", t: "One investigation, three views", x: "Responses shows what each SavoScout sent, with photos and location. Evidence overview adds it up. AI briefing explains what it means.", enter: function () { if (!/^c-survey-case-kano/.test(fhash())) inv("c-survey-case-kano~brief"); } },
      { fsel: ".card.brief .head", t: "The briefing", x: "Key findings, where SavoScouts agree, what is still unknown and what to do next. Each finding links to the responses behind it. Download PDF keeps a copy." },
      { sel: function () { return $1('#vsn [data-vsn="c-builder"]'); }, t: "Start your own", x: "Describe what you need to understand in plain words. Verisavo prepares the questions, the places and the cost before you launch. You pay for verified responses only." },
      { sel: function () { return $1('#vsn [data-vsn="c-overview"]'); }, t: "Keep track of everything", x: "Overview shows your investigations and responses. Each number opens what it counts.", go: "Open it for me", act: function () { inv("c-overview"); }, until: function () { return /^c-overview$|^\?$/.test(fhash()); } },
      { card: true, t: "That is Verisavo", x: "Ask, see what an answer rests on, close the gaps with evidence from the ground, and decide with more confidence. Keep exploring, or see it on your own market.", go: "Request a demo", end: true }
    ];
    var i = -1, tm = null, ring, tip, dim, found = false, since = 0, running = false;
    function host() { var d = document.querySelectorAll("dialog[open]"); return d.length ? d[d.length - 1] : document.body; }
    function build() {
      if (ring) return;
      var css = document.createElement("style");
      css.textContent = "#vst-ring{position:fixed;z-index:2147483500;pointer-events:none;border-radius:12px;box-shadow:0 0 0 3px #3A5292,0 0 0 9999px rgba(15,20,40,.42);transition:left .25s,top .25s,width .25s,height .25s}#vst-dim{position:fixed;inset:0;z-index:2147483500;background:rgba(15,20,40,.42)}#vst-ring[hidden],#vst-dim[hidden],#vst-tip[hidden]{display:none!important}" +
        "#vst-tip{position:fixed;z-index:2147483501;width:min(320px,calc(100vw - 24px));box-sizing:border-box;background:#fff;color:#1F273F;border:1px solid #DFDFDF;border-radius:14px;box-shadow:0 18px 50px rgba(31,39,63,.28);padding:16px;font:400 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:left}#vst-tip.vst-card{width:min(420px,calc(100vw - 24px));padding:22px}#vst-tip .vst-n{margin:0 0 4px;font-size:12px;color:#5B6478}#vst-tip h2{margin:0 0 6px;font:600 17px/1.3 inherit;color:#1F273F}#vst-tip.vst-card h2{font-size:21px}#vst-tip p.vst-x{margin:0!important;position:static!important;width:auto!important;max-width:none!important;color:#3D4559;font-size:14px}#vst-tip p.vst-w{margin:8px 0 0;font-size:12.5px;color:#3A5292}" +
        "#vst-tip .vst-a{display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap}#vst-tip .vst-a .vst-sp{flex:1}#vst-tip button{font:500 13.5px/1 inherit;font-family:inherit;border-radius:9px;padding:10px 14px;cursor:pointer;border:1px solid #DFDFDF;background:#fff;color:#1F273F}#vst-tip button.vst-p{background:#1F273F;border-color:#1F273F;color:#fff}#vst-tip button.vst-p:hover{background:#2C3656}#vst-tip button.vst-q{border:0;background:none;padding:10px 4px;color:#5B6478;text-decoration:underline;text-underline-offset:2px}#vst-tip button:focus-visible{outline:2px solid #3A5292;outline-offset:2px}" +
        "#vst-bar{height:3px;border-radius:3px;background:#EEF1F6;margin:0 0 12px;overflow:hidden}#vst-bar i{display:block;height:100%;background:#3A5292;transition:width .25s}@media (prefers-reduced-motion:reduce){#vst-ring,#vst-bar i{transition:none}}";
      document.head.appendChild(css);
      dim = document.createElement("div"); dim.id = "vst-dim"; ring = document.createElement("div"); ring.id = "vst-ring";
      tip = document.createElement("div"); tip.id = "vst-tip"; tip.setAttribute("role", "dialog"); tip.setAttribute("aria-live", "polite"); tip.setAttribute("aria-label", "Guided tour");
      tip.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return; e.stopPropagation();
        var k = b.getAttribute("data-k"), s = STEPS[i];
        if (k === "skip") return stop();
        if (k === "back") return show(Math.max(0, i - 1));
        if (k === "go") { if (s.end) { stop(); if (window.vsGoDemo) window.vsGoDemo(); return; } if (s.act && s.until) { try { s.act(); } catch (x) {} since = Date.now(); s._acted = since; paint(); return; } return show(i + 1); }
        if (k === "done") return stop();
      });
      document.addEventListener("keydown", function (e) { if (running && e.key === "Escape") stop(); });
    }
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function target(s) {
      if (s.card) return null;
      if (s.fsel) {
        var f = frame(); if (!f || !f.getClientRects().length) return null;
        var fr = f.getBoundingClientRect();
        try { var e = f.contentDocument && f.contentDocument.querySelector(s.fsel); if (!e || !e.getClientRects().length) return { blind: !f.contentDocument, r: fr }; var r = e.getBoundingClientRect(); return { el: e, r: { left: fr.left + r.left, top: fr.top + r.top, width: r.width, height: r.height } }; }
        catch (x) { return { blind: true, r: fr }; }
      }
      var el = s.sel(); if (!el) return null; if (!found) { found = true; try { el.scrollIntoView({ block: "center", inline: "nearest" }); } catch (x) {} } var rr = el.getBoundingClientRect(), c = document.elementFromPoint(rr.left + rr.width / 2, rr.top + Math.min(rr.height / 2, 40));
      if (!c || !(el.contains(c) || (tip && tip.contains(c)))) return null; /* covered or off-screen, such as the sidebar on a phone */
      return { el: el, r: rr };
    }
    function paint() {
      var s = STEPS[i]; if (!s) return;
      var h = host(); if (tip.parentNode !== h) { h.appendChild(dim); h.appendChild(ring); h.appendChild(tip); }
      var waiting = !!(s.until && since && Date.now() - since < 20000);
      var html = '<div id="vst-bar"><i style="width:' + Math.round((i + 1) / STEPS.length * 100) + '%"></i></div>' + (s.card ? "" : '<p class="vst-n">Step ' + i + " of " + (STEPS.length - 2) + "</p>") + "<h2>" + esc(s.t) + '</h2><p class="vst-x">' + esc(s.x) + "</p>" + (waiting && s.wait ? '<p class="vst-w">' + esc(s.wait) + "…</p>" : "") +
        '<div class="vst-a">' + (i > 0 && !s.end ? '<button type="button" class="vst-q" data-k="skip">End tour</button>' : "") + (s.end ? '<button type="button" data-k="done">Keep exploring</button>' : "") + '<span class="vst-sp"></span>' + (i > 1 && !s.end ? '<button type="button" data-k="back">Back</button>' : "") + (waiting ? "" : '<button type="button" class="vst-p" data-k="go">' + esc(s.go || "Next") + "</button>") + "</div>";
      if (tip._h !== html) { tip.innerHTML = html; tip._h = html; }
      tip.className = s.card ? "vst-card" : ""; tip.hidden = false;
      var t = target(s), vw = window.innerWidth, vh = window.innerHeight, tw = tip.offsetWidth, th = tip.offsetHeight;
      if (!t) { ring.hidden = true; dim.hidden = !s.card; tip.style.left = Math.max(12, (vw - tw) / 2) + "px"; tip.style.top = Math.max(12, s.card ? (vh - th) / 2 : vh - th - 24) + "px"; return; }
      dim.hidden = true;
      if (!found && t.el) { found = true; try { t.el.scrollIntoView({ block: "center", inline: "nearest" }); } catch (x) {} }
      var r = t.r, pad = 6, L = Math.max(4, r.left - pad), T = Math.max(4, r.top - pad), W = Math.min(vw - L - 4, r.width + pad * 2), H = Math.min(vh - T - 4, r.height + pad * 2);
      ring.hidden = false; ring.style.left = L + "px"; ring.style.top = T + "px"; ring.style.width = W + "px"; ring.style.height = H + "px";
      var x = Math.min(vw - tw - 12, Math.max(12, L + W / 2 - tw / 2)), y;
      if (T + H + 12 + th < vh) y = T + H + 12; else if (T - 12 - th > 0) y = T - 12 - th; else { y = vh - th - 16; if (L + W + 12 + tw < vw) { x = L + W + 12; y = Math.max(12, Math.min(vh - th - 12, T)); } else if (L - 12 - tw > 0) { x = L - 12 - tw; y = Math.max(12, Math.min(vh - th - 12, T)); } }
      tip.style.left = x + "px"; tip.style.top = y + "px";
    }
    function tick() {
      var s = STEPS[i]; if (!s) return;
      if (s.until) { var ok = false; try { ok = s.until(); } catch (x) {} if (!ok && s._acted && Date.now() - s._acted > 1500 && fhash() === "?") ok = true; /* the frame cannot be read here, so trust the action */ if (ok) return show(i + 1); }
      paint();
    }
    function show(n) {
      var prev = STEPS[i]; if (prev && prev.leave) { try { prev.leave(); } catch (x) {} }
      if (n >= STEPS.length) return stop();
      i = n; found = false; since = 0; tip._h = ""; STEPS[i]._acted = 0;
      var s = STEPS[i]; if (s.enter) { try { s.enter(); } catch (x) {} }
      paint(); var b = tip.querySelector("button.vst-p"); if (b && s.card) b.focus();
    }
    function stop() { running = false; clearInterval(tm); i = -1; if (ring) { ring.hidden = true; tip.hidden = true; dim.hidden = true; } }
    window.vsStartTour = function () {
      var u = null; try { u = JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) {}
      try { sessionStorage.setItem("vs-company-skip", "1"); if (!u || u.role === "scout") sessionStorage.setItem("verisavo-user", JSON.stringify({ name: "Ngozi Adeyemi", email: "ngozi.adeyemi@example.com", organisation: "Sample Foods Ltd", tour: true })); } catch (e) {}
      var begin = function () { build(); running = true; clearInterval(tm); tm = setInterval(tick, 250); show(0); };
      if (vaT.getClientRects().length) begin(); else { try { if (window.vaOpen) window.vaOpen(); } catch (e) {} setTimeout(begin, 900); }
    };
    if (want === "1") { var tries = 0; (function go() { if (window.vaOpen || tries++ > 40) window.vsStartTour(); else setTimeout(go, 100); })(); }
  })();
  /* <<< guided tour */

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
