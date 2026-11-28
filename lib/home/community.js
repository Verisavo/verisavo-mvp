// Community page (SavoScouts): activity filter and the WhatsApp sign-up.
export default function init() {
/* >>> community page */
(function () {
  var page = document.getElementById("pg-community"); if (!page || page.dataset.cmReady) return;
  page.dataset.cmReady = "1";
  /* Activities: filter by where the task happens */
  var bar = page.querySelector(".cm-filter"), cards = [].slice.call(page.querySelectorAll(".cm-acts li"));
  if (bar && cards.length) {
    var cats = [];
    cards.forEach(function (c) { if (cats.indexOf(c.dataset.cat) < 0) cats.push(c.dataset.cat); });
    var mk = function (label, cat, n) { var b = document.createElement("button"); b.type = "button"; b.dataset.cat = cat; b.setAttribute("aria-pressed", cat ? "false" : "true"); b.append(label + " "); var i = document.createElement("i"); i.textContent = n; b.append(i); return b; };
    bar.append(mk("All", "", cards.length));
    cats.forEach(function (c) { bar.append(mk(c, c, cards.filter(function (x) { return x.dataset.cat === c; }).length)); });
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      bar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cards.forEach(function (c) { c.hidden = !!b.dataset.cat && c.dataset.cat !== b.dataset.cat; });
    });
  }
  /* In-page links scroll inside the page panel */
  page.addEventListener("click", function (e) {
    var a = e.target.closest("[data-cm-go]"); if (!a) return;
    e.preventDefault();
    var t = document.getElementById(a.dataset.cmGo); if (t) t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  /* Sign up with WhatsApp: the early-access dialog (number, code, WhatsApp), worded for SavoScouts */
  var dlg = document.getElementById("access");
  var texts = dlg ? [].slice.call(dlg.querySelectorAll("h2")).map(function (h) { return [h, h.nextElementSibling]; }) : [];
  var WORDS = [["Join SavoScouts", "Enter your WhatsApp number. We'll send a one-time code to confirm it's yours."], null, [null, "Continue to WhatsApp to finish joining SavoScouts. We'll message you when tasks open near you."]];
  var orig = null;
  var tasks = document.getElementById("pg-community-tasks");
  (tasks ? [page, tasks] : [page]).forEach(function (el) { el.addEventListener("click", function (e) {
    if (!e.target.closest("[data-join-wa]") || !window.vsOpenAccess) return; /* WhatsApp sign-up (Join section) */
    if (!orig) orig = texts.map(function (t) { return [t[0].textContent, t[1] ? t[1].textContent : ""]; });
    texts.forEach(function (t, i) { var w = WORDS[i]; if (!w) return; if (w[0]) t[0].textContent = w[0]; if (w[1] && t[1]) t[1].textContent = w[1]; });
    var task = e.target.closest("[data-task]");
    var own = e.target.closest("[data-intro]");
    window.vsAccessIntro = own ? own.dataset.intro : task ? "Hi Verisavo, I'd like to join SavoScouts and take this task: " + task.dataset.task + "." : "Hi Verisavo, I'd like to join SavoScouts.";
    window.vsOpenAccess("");
  }); });
  if (dlg) dlg.addEventListener("close", function () {
    window.vsAccessIntro = "";
    if (orig) { texts.forEach(function (t, i) { t[0].textContent = orig[i][0]; if (t[1]) t[1].textContent = orig[i][1]; }); orig = null; }
  });
  /* Task board: signed-in members only. Signing in from here returns to the board, not the Assistant. */
  if (!tasks) return;
  var signed = function () { try { var u = JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); return !!(u && u.role === "scout"); } catch (e) { return false; } };
  var sync = function () { tasks.classList.toggle("cmt-in", signed()); };
  var link = document.createElement("button"); link.type = "button"; link.hidden = true; link.dataset.page = "community-tasks"; document.body.append(link);
  var signIn = function () {
    window.vsAfterAuth = function () { sync(); if (!tasks.classList.contains("open")) link.click(); };
    (window.vsOpenScoutAuth || window.vsOpenAuth)("in");
  };
  document.addEventListener("click", function (e) {
    /* the task list is open to everyone; taking a task asks you to sign in */
    var b = e.target.closest("#pg-community-tasks [data-task], #pg-community-tasks .cmt-notify [data-join]");
    if (b && !signed() && window.vsOpenAuth) { e.preventDefault(); e.stopImmediatePropagation(); signIn(); }
    if (e.target.closest("[data-cmt-signin]") && window.vsOpenAuth) signIn();
  }, true);
  var auth = document.getElementById("auth");
  if (auth) auth.addEventListener("close", function () { setTimeout(function () { if (!signed()) window.vsAfterAuth = null; }, 0); });
  new MutationObserver(sync).observe(tasks, { attributes: true, attributeFilter: ["class"] });
  sync();
  /* filters: type and city */
  var rows = [].slice.call(tasks.querySelectorAll(".cmt-list li")), tbar = tasks.querySelector(".cmt-filter"), city = tasks.querySelector("#cmt-city"), count = tasks.querySelector(".cmt-count");
  var cur = "";
  var apply = function () { var n = 0; rows.forEach(function (r) { var on = (!cur || r.dataset.cat === cur) && (!city.value || r.dataset.city === city.value); r.hidden = !on; if (on) n++; }); count.textContent = n + (n === 1 ? " open task" : " open tasks"); };
  var tcats = [], cities = [];
  rows.forEach(function (r) { if (tcats.indexOf(r.dataset.cat) < 0) tcats.push(r.dataset.cat); if (cities.indexOf(r.dataset.city) < 0) cities.push(r.dataset.city); });
  cities.sort().forEach(function (c) { var o = document.createElement("option"); o.value = c; o.textContent = c; city.append(o); });
  var mk2 = function (label, cat) { var b = document.createElement("button"); b.type = "button"; b.dataset.cat = cat; b.setAttribute("aria-pressed", cat ? "false" : "true"); b.textContent = label; return b; };
  tbar.append(mk2("All", "")); tcats.forEach(function (c) { tbar.append(mk2(c, c)); });
  tbar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; cur = b.dataset.cat; tbar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); apply(); });
  city.addEventListener("change", apply);
  apply();
})();
/* <<< community page */
/* >>> community chat */
(function () {
  var dev = document.querySelector("#pg-community .c2-dev"); if (!dev || dev.dataset.live) return;
  dev.dataset.live = "1";
  var chat = dev.querySelector(".c2-chat"); if (!chat) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* each task plays itself out: the SavoScout accepts or skips, sends evidence, and Verisavo checks it */
  var TASKS = [
    { t: "Price check: cooking oil and rice", d: "Record shelf prices for 6 listed products at one shop in your area. Add a photo of each shelf.", time: "About 10 min", where: "Within 2 km", pts: 10, act: "accept", acc: "Accepted. Sending prices and photos now.", sent: "6 prices, 6 photos, geo-tagged" },
    { t: "Stock check: 1kg detergent", d: "Visit two shops on your street and note whether the 1kg pack is on the shelf. A photo of each shelf is enough.", time: "About 5 min", where: "Within 1 km", pts: 10, act: "skip" },
    { t: "Outlet spotting: new kiosks", d: "Walk one route and note any kiosk that opened in the last month, with its location.", time: "About 20 min", where: "One route near you", pts: 20, act: "accept", acc: "Accepted. Starting the route now.", sent: "3 kiosks, locations pinned" }
  ];
  var CLIP = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 4.5 5.8 9.2a1.4 1.4 0 0 0 2 2l5-5a2.8 2.8 0 0 0-4-4l-5 5a4.2 4.2 0 0 0 6 6l4.2-4.2"/></svg>';
  var i = 0, timers = [], running = false;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var later = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
  var stop = function () { timers.forEach(clearTimeout); timers = []; running = false; };
  function node(cls, html) { var n = document.createElement("div"); n.className = cls + " c2-new"; n.innerHTML = html; return n; }
  function add(n) {
    chat.appendChild(n);
    requestAnimationFrame(function () { requestAnimationFrame(function () { n.classList.add("in"); }); });
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    return n;
  }
  function typing(ms, html, cls, then) {
    var t = add(node("c2-msg c2-typing", "<span></span><span></span><span></span>"));
    later(ms, function () { t.remove(); add(node("c2-msg" + (cls ? " " + cls : ""), "<p>" + html + "</p>")); if (then) then(); });
  }
  function me(html, cls) { add(node("c2-msg c2-me" + (cls ? " " + cls : ""), "<p>" + html + "</p>")); }
  function card(T) {
    return '<p class="c2-k">New task near you</p><p class="c2-t">' + esc(T.t) + "</p><p>" + esc(T.d) + "</p><dl><div><dt>Time</dt><dd>" + esc(T.time) + "</dd></div><div><dt>Where</dt><dd>" + esc(T.where) + "</dd></div><div><dt>VeriPoints</dt><dd>" + T.pts + " when verified</dd></div></dl>";
  }
  function showTask(T) {
    chat.innerHTML = "";
    add(node("c2-msg c2-task", card(T)));
    return add(node("c2-reply", '<span data-c2="accept">Accept</span><span data-c2="skip">Skip</span>'));
  }
  function play() {
    if (!running) return;
    var T = TASKS[i % TASKS.length], row = showTask(T);
    later(1600, function () {
      var b = row.querySelector('[data-c2="' + T.act + '"]'); if (b) b.classList.add("press");
      later(450, function () {
        row.classList.add("used");
        if (T.act === "accept") {
          me(esc(T.acc));
          later(1000, function () { me(CLIP + "<span>" + esc(T.sent) + "</span>", "c2-att"); });
          later(1700, function () {
            typing(1100, "Thank you. Your response is being checked. You will hear back here.", "", function () {
              later(900, function () {
                typing(1400, "Verified. <b>+" + T.pts + " VeriPoints</b> added to your account.", "c2-ok", function () {
                  later(3000, function () { i++; play(); });
                });
              });
            });
          });
        } else {
          me("Skip this one.");
          later(600, function () { typing(1000, "No problem. Here is another task near you.", "", function () { later(1600, function () { i++; play(); }); }); });
        }
      });
    });
  }
  function start() { if (running) return; running = true; play(); }
  /* people who prefer less motion see the first task, finished, without the animation */
  if (reduce) {
    var T0 = TASKS[0], row = showTask(T0); row.classList.add("used");
    me(esc(T0.acc)); me(CLIP + "<span>" + esc(T0.sent) + "</span>", "c2-att");
    add(node("c2-msg c2-ok", "<p>Verified. <b>+" + T0.pts + " VeriPoints</b> added to your account.</p>"));
    return;
  }
  showTask(TASKS[0]);
  /* plays only while the phone is on screen */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else { stop(); } }); }, { threshold: 0.35 }).observe(dev);
  } else start();
})();
/* <<< community chat */
/* >>> scout dashboard */
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
(function () {
  var page = document.getElementById("pg-scout"); if (!page || page.dataset.sxReady) return;
  page.dataset.sxReady = "1";
  var q = function (s) { return page.querySelector(s); };
  var RATE = 10; /* 10 VeriPoints = $1, the same on WhatsApp and for clients */
  var MIN = { cash: 20, airtime: 10, voucher: 100 }; /* the same as on WhatsApp */
  var LABEL = { cash: "Cash to mobile money", airtime: "Airtime or data voucher", voucher: "Shopping voucher" };
  /* example responses, so the dashboard reads like a real account during early access */
  var RESP = [
    { t: "Price check: cooking oil and rice", p: "Surulere, Lagos", d: "28 Oct", s: "ok", pts: 12 },
    { t: "Outlet spotting: new kiosks on a route", p: "Yaba, Lagos", d: "27 Oct", s: "wait", pts: 20, by: "3 Nov" },
    { t: "Shelf check: 1kg detergent", p: "Ikeja, Lagos", d: "25 Oct", s: "ok", pts: 10 },
    { t: "Retailer quick chat: baby formula supply", p: "Surulere, Lagos", d: "22 Oct", s: "ok", pts: 15 },
    { t: "Price check: mobile data bundles", p: "Ikeja, Lagos", d: "19 Oct", s: "no", pts: 10, why: "Photo too unclear to read", fix: true },
    { t: "Delivery watch: morning deliveries", p: "Mushin, Lagos", d: "16 Oct", s: "ok", pts: 10 }
  ];
  var STATUS = { ok: "Verified", wait: "Being checked", no: "Not verified" };
  /* SavoScout levels come from verified responses, never from VeriPoints: 3 verified for Verified Scout, 10 verified with 9 in 10 passing for Trusted Scout */
  var TRUST_MIN = 10, TRUST_RATE = 0.9;
  function level() {
    var ok = RESP.filter(function (r) { return r.s === "ok"; }).length, no = RESP.filter(function (r) { return r.s === "no" && !(state.fix || {})[RESP.indexOf(r)]; }).length;
    var rate = ok + no ? ok / (ok + no) : 1, trusted = ok >= TRUST_MIN && rate >= TRUST_RATE, i = trusted ? 2 : ok >= 3 ? 1 : 0;
    return { i: i, name: ["New Scout", "Verified Scout", "Trusted Scout"][i], ok: ok, rate: rate,
      next: trusted ? "You can take every kind of task, including interview tasks." : i === 0 ? ok + " of 3 verified responses towards Verified Scout." : Math.min(ok, TRUST_MIN) + " of " + TRUST_MIN + " verified responses towards Trusted Scout. " + Math.round(rate * 100) + "% of your checked responses passed; 90% is needed.",
      pct: trusted ? 100 : i === 0 ? ok / 3 * 50 : 50 + Math.min(ok, TRUST_MIN) / TRUST_MIN * 50 };
  }
  /* profile sets: what the SavoScout does, their business and their market. Used to match tasks, so fewer questions are asked before each one */
  var SETS = [
    { k: "you", t: "About you", d: "What you do and the languages you work in", f: [
      { k: "cats", l: "Which of these describe you?", type: "checks", o: ["Consumer", "Merchant", "Wholesaler", "Distributor", "Manufacturer", "Researcher", "Expert", "Community member", "Other"] },
      { k: "langs", l: "Languages you can work in", type: "checks", o: ["English", "French", "Pidgin", "Hausa", "Yoruba", "Igbo", "Twi", "Swahili", "Other"] }] },
    { k: "biz", t: "Your business", d: "If you sell, supply or make goods", f: [
      { k: "outlet", l: "What kind of business do you run?", type: "select", o: ["I do not run a business", "Market stall", "Kiosk", "Small shop", "Supermarket", "Wholesale", "Distribution", "Manufacturing", "Other"] },
      { k: "sell", l: "What do you mainly sell?", type: "select", o: ["Not applicable", "Food and groceries", "Drinks", "Household goods", "Personal care", "Phones and airtime", "Clothing", "Medicines", "Building materials", "Other"] },
      { k: "years", l: "How long have you traded?", type: "select", o: ["Not applicable", "Less than 1 year", "1 to 3 years", "More than 3 years"] }] },
    { k: "market", t: "Your market", d: "Where you can go and what you can send", f: [
      { k: "areas", l: "Markets or areas you know well", type: "text", ph: "For example Balogun Market, Surulere" },
      { k: "travel", l: "How far can you travel for a task?", type: "select", o: ["My own area only", "Across my city", "Nearby towns too"] },
      { k: "phone", l: "Your phone", type: "select", o: ["Smartphone with a camera", "Basic phone"] }] }
  ];
  var PF_PTS = 5, QC_PTS = 1, pfOpen = "";
  var filled = function (set, f) { var v = ((state.sets || {})[set.k] || {})[f.k]; return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim()); };
  var setDone = function (set) { return set.f.every(function (f) { return filled(set, f); }); };
  function renderProfile() {
    var all = 0, got = 0; SETS.forEach(function (s) { s.f.forEach(function (f) { all++; if (filled(s, f)) got++; }); });
    var pct = Math.round(got / all * 100);
    q("[data-sx-pf-pct]").textContent = pct + "%"; q("[data-sx-pf-bar]").style.width = pct + "%";
    q("#sx-pf-h").textContent = pct === 100 ? "Your profile is complete" : "Complete your profile";
    q("[data-sx-pf-list]").innerHTML = SETS.map(function (s) {
      var done = setDone(s), some = s.f.some(function (f) { return filled(s, f); });
      return "<li><div><b>" + esc(s.t) + "</b><span>" + esc(s.d) + "</span></div>" + (done ? "<em>Done</em>" : "") + '<button type="button" class="sx-btn" data-sx-pf="' + s.k + '">' + (done ? "Edit" : some ? "Continue" : "Start") + "</button></li>";
    }).join("");
    var form = q("[data-sx-pf-form]"), set = SETS.filter(function (s) { return s.k === pfOpen; })[0];
    form.hidden = !set; if (!set) { form.innerHTML = ""; return; }
    var cur = (state.sets || {})[set.k] || {};
    form.innerHTML = "<h3>" + esc(set.t) + "</h3>" + set.f.map(function (f) {
      var id = "sx-pf-" + set.k + "-" + f.k, v = cur[f.k];
      if (f.type === "checks") return '<fieldset><legend>' + esc(f.l) + '</legend><div class="sx-cks">' + f.o.map(function (o) { return '<label><input type="checkbox" name="' + f.k + '" value="' + esc(o) + '"' + ((v || []).indexOf(o) >= 0 ? " checked" : "") + "><span>" + esc(o) + "</span></label>"; }).join("") + "</div></fieldset>";
      if (f.type === "select") return '<div><label class="sx-lab" for="' + id + '">' + esc(f.l) + '</label><select id="' + id + '" name="' + f.k + '"><option value="">Choose one</option>' + f.o.map(function (o) { return "<option" + (v === o ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select></div>";
      return '<div><label class="sx-lab" for="' + id + '">' + esc(f.l) + '</label><input type="text" id="' + id + '" name="' + f.k + '" maxlength="120" placeholder="' + esc(f.ph || "") + '" value="' + esc(v || "") + '"></div>';
    }).join("") + '<div class="sx-pf-acts"><button type="submit" class="sx-btn sx-solid">Save</button><button type="button" class="sx-btn" data-sx-pf-x>Cancel</button></div>';
  }
  /* quick checks: one question at a time, a few each day */
  var QC = [
    { q: "What does 1 litre of cooking oil cost near you today?", num: true, unit: "in your local currency" },
    { q: "Is bread easy to find in shops near you this week?", o: ["Yes", "Some shops have run out", "Hard to find"] },
    { q: "Has the price of a 50kg bag of rice changed this month?", o: ["Gone up", "Stayed the same", "Gone down", "Don’t know"] }
  ];
  function renderQuick() {
    var f = q("[data-sx-qc]"), today = new Date().toDateString();
    if (!state.qc || state.qc.day !== today) state.qc = { day: today, n: 0, hold: (state.qc && state.qc.hold) || 0 };
    var c = QC[state.qc.n];
    if (!c) { f.innerHTML = '<p class="sx-empty" style="padding:0">That is all for today. Thank you. ' + state.qc.hold * QC_PTS + (state.qc.hold === 1 ? " VeriPoint is" : " VeriPoints are") + " on hold until your answers have been checked.</p>"; return; }
    f.innerHTML = '<p class="sx-qc-n">Question ' + (state.qc.n + 1) + " of " + QC.length + ' today</p><p class="sx-qc-q" id="sx-qc-q">' + esc(c.q) + "</p>" +
      (c.num ? '<div class="sx-row"><input type="number" inputmode="decimal" min="0" step="any" id="sx-qc-a" aria-labelledby="sx-qc-q" placeholder="Price ' + esc(c.unit) + '"></div>' : '<div class="sx-rds" role="radiogroup" aria-labelledby="sx-qc-q">' + c.o.map(function (o) { return '<label><input type="radio" name="sx-qc-a" value="' + esc(o) + '"><span>' + esc(o) + "</span></label>"; }).join("") + "</div>") +
      '<div class="sx-pf-acts"><button type="submit" class="sx-btn sx-solid">Send answer</button><button type="button" class="sx-btn" data-sx-qc-skip>I don’t know</button></div><p class="sx-msg" data-sx-qc-msg role="status"></p>';
  }
  /* what closed investigations found, for the tasks this SavoScout contributed to: examples during early access */
  var USED = [
    { t: "Price check: cooking oil and rice", d: "Closed 30 Oct", x: "Your response was one of 40 that passed checks. Together they showed which shops in Surulere had raised cooking oil prices, and by how much." },
    { t: "Shelf check: 1kg detergent", d: "Closed 27 Oct", x: "One of 30 verified responses. They showed which brands were missing from shelves in Ikeja, and where." }
  ];
  var KEY = "verisavo-scout";
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (n) { return Number(n).toLocaleString("en-GB"); };
  var usd = function (pts) { return "$" + (pts / RATE).toFixed(2); };
  /* the dashboard belongs to SavoScout accounts: other sessions are asked to sign in as a SavoScout first */
  var user = function () { var u = null; try { u = JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) {} return u && u.role === "scout" ? u : null; };
  var load = function () { var d = null; try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {} if (d && !d.v10) { var dv = function (n) { return Math.round((+n || 0) / 10); }; d.balance = dv(d.balance); d.earned = dv(d.earned); (d.req || []).forEach(function (r) { r.p = dv(r.p); }); (d.active || []).forEach(function (r) { r.pts = Math.max(10, dv(r.pts)); }); if (d.pfPaid) { d.balance += 4; d.earned += 4; } d.v10 = 1; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
    return d || { balance: 124, earned: 166, wa: "", req: [], v10: 1 }; };
  var state = load();
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  window.vsScoutSetWa = function (w) { state.wa = w; save(); }; /* a WhatsApp sign-in connects WhatsApp too */

  /* referrals: a stable code per account, a share link, and 15 VeriPoints for each sign-up through it */
  var REF_PTS = 15;
  var isStatic = /\.html$/.test(location.pathname);
  try { var inRef = new URLSearchParams(location.search).get("ref"); if (inRef) sessionStorage.setItem("verisavo-ref", inRef.toUpperCase().slice(0, 12)); } catch (e) {}
  function refCode() { if (!state.refCode) { state.refCode = "VS" + Math.random().toString(36).slice(2, 7).toUpperCase(); save(); } return state.refCode; }
  function refLink() { var u = new URL(location.href); u.search = "?ref=" + refCode(); if (isStatic) { u.hash = "#community"; } else { u.pathname = "/community"; u.hash = ""; } return u.toString(); }
  if (!state.refs) { state.refs = [{ n: "Kemi A.", d: "30 Oct" }, { n: "Tunde O.", d: "24 Oct" }]; }
  function render() {
    var u = user();
    var needId = !!u && !state.kyc;
    q("[data-sx-gate]").hidden = !!u; q("[data-sx-main]").hidden = !u || needId; q("[data-sx-onb]").hidden = !needId;
    if (needId) { onbShow(); return; }
    if (!u) return;
    var P = prof(u);
    var first = (P.name || "").trim().split(/\s+/)[0];
    q("[data-sx-name]").textContent = first || "SavoScout";
    q("[data-sx-city]").textContent = P.city;
    q("[data-sx-av]").textContent = (P.name || P.username || "S").trim().charAt(0).toUpperCase();
    q("[data-sx-pname]").textContent = P.name || "SavoScout";
    q("[data-sx-phandle]").textContent = "@" + P.username;
    q("[data-sx-pemail]").textContent = P.email || "Not added";
    q("[data-sx-pcity]").textContent = P.city;
    q("[data-sx-pwa]").textContent = state.wa || "Not connected";
    q("[data-sx-psince]").textContent = P.since;
    var checking = !!(state.kyc && state.kyc.status === "checking");
    q("[data-sx-vbar]").hidden = !checking; q("[data-sx-demo-ok]").hidden = !checking;
    page.querySelectorAll(".sx-lockable").forEach(function (el) {
      el.classList.toggle("sx-locked", checking);
      el.querySelectorAll("input, button, select").forEach(function (c) { c.disabled = checking; });
      var tag = el.querySelector(".sx-lock-tag");
      if (checking && !tag) { tag = document.createElement("p"); tag.className = "sx-lock-tag"; tag.textContent = "Available after verification"; el.prepend(tag); }
      if (!checking && tag) tag.remove();
    });
    q("[data-sx-pid]").textContent = state.kyc ? state.kyc.type + " · " + state.kyc.masked + (state.kyc.status === "checking" ? " · Being checked" : " · Verified") : "Not verified";
    if (!setDirty) fillSet(P);
    q("[data-sx-points]").textContent = fmt(state.balance);
    q("[data-sx-value]").textContent = "Worth " + usd(state.balance) + " · 10 VeriPoints = $1";
    var ok = RESP.filter(function (r) { return r.s === "ok"; }).length, wait = RESP.filter(function (r) { return r.s === "wait"; });
    q("[data-sx-verified]").textContent = ok;
    q("[data-sx-pending]").textContent = wait.length;
    q("[data-sx-pending-pts]").textContent = (wait.reduce(function (a, r) { return a + r.pts; }, 0) + ((state.qc && state.qc.hold) || 0) * QC_PTS) + " VeriPoints on hold";
    q("[data-sx-earned]").textContent = fmt(state.earned);
    q("#sx-ref-link").value = refLink(); q("[data-sx-ref-code]").textContent = refCode();
    q("[data-sx-ref-n]").textContent = state.refs.length; q("[data-sx-ref-pts]").textContent = state.refs.length * REF_PTS;
    q("[data-sx-ref-list]").innerHTML = state.refs.slice(0, 3).map(function (r) { return "<li><span>" + esc(r.n) + " joined · " + esc(r.d) + "</span><em>+" + REF_PTS + "</em></li>"; }).join("");
    q("[data-sx-ref-wa]").href = "https://wa.me/?text=" + encodeURIComponent("Join me on SavoScouts. Take short tasks in your local market and earn VeriPoints for verified responses: " + refLink());
    q("[data-sx-list]").innerHTML = RESP.map(function (r, k) {
      var fixed = (state.fix || {})[k], disp = (state.disp || {})[k], st = fixed ? "wait" : r.s;
      var pts = st === "ok" ? "+" + r.pts : st === "wait" ? r.pts + " on hold" : "0";
      var more = fixed ? '<span class="sx-r-more">Sent again after a fix. Being checked again.</span>'
        : r.s === "wait" ? '<span class="sx-r-more">Decision by ' + esc(r.by || "7 days after you sent it") + ". After that it is verified automatically.</span>"
        : r.s === "no" ? '<span class="sx-r-more">Reason: ' + esc(r.why || "Could not confirm from the evidence") + ".</span>" + (disp ? '<span class="sx-r-more">Dispute sent. A different reviewer will look at it within 3 days.</span>' : '<span class="sx-r-acts">' + (r.fix ? '<button type="button" class="sx-link" data-sx-fix="' + k + '">Fix and resend</button>' : "") + '<button type="button" class="sx-link" data-sx-disp="' + k + '">Dispute</button></span>') : "";
      return '<li class="sx-r sx-' + st + '"><div><b>' + esc(r.t) + "</b><span>" + esc(r.p) + " · " + esc(r.d) + "</span>" + more + '</div><div class="sx-r-end"><i>' + (fixed ? "Being checked" : STATUS[r.s]) + "</i><em>" + pts + "</em></div></li>";
    }).join("");
    var lv = level();
    q("[data-sx-level]").textContent = lv.name; q("[data-sx-plevel]").textContent = lv.name; q("[data-sx-lv-name]").textContent = lv.name;
    q("[data-sx-lv-next]").textContent = lv.next; q("[data-sx-lv-bar]").style.width = lv.pct + "%";
    page.querySelectorAll("[data-sx-lv-steps] li").forEach(function (li, i) { li.classList.toggle("on", i === lv.i); if (i === lv.i) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
    renderProfile(); renderQuick();
    q("[data-sx-used]").innerHTML = USED.map(function (u) { return "<li><b>" + esc(u.t) + "</b><span>" + esc(u.x) + "</span><em>" + esc(u.d) + "</em></li>"; }).join("");
    /* WhatsApp */
    var on = !!state.wa;
    q("[data-sx-wa-form]").hidden = on; q("[data-sx-wa-done]").hidden = !on;
    q("[data-sx-wa-title]").textContent = on ? "WhatsApp connected" : "Connect WhatsApp";
    q("#sx-wa").classList.toggle("on", on);
    if (on) q("[data-sx-wa-num]").textContent = state.wa;
    /* requests */
    var h = q("[data-sx-hist]"); h.hidden = !state.req.length;
    q("[data-sx-hist-list]").innerHTML = state.req.slice().reverse().map(function (r) { return "<li><span><b>" + esc(LABEL[r.o]) + "</b>" + esc(r.d) + "</span><span>" + fmt(r.p) + " VeriPoints · " + usd(r.p) + "<i>" + (r.done ? "Paid" : "Processing") + "</i></span></li>"; }).join("");
    sum();
    renderTasks();
  }
  /* profile and settings */
  var setDirty = false;
  function prof(u) {
    if (!state.profile) {
      var nm = (u && u.name) || "", em = (u && u.email) || "";
      var un = (nm || em.split("@")[0] || "savoscout").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24) || "savoscout";
      var d = new Date();
      try { var by = sessionStorage.getItem("verisavo-ref"); if (by && by !== state.refCode) state.referredBy = by; } catch (e) {}
      state.profile = { name: nm, username: un.length < 3 ? un + "_scout" : un, email: em, city: "Lagos", pay: "cash", n1: true, n2: true, since: d.toLocaleString("en-GB", { month: "long" }) + " " + d.getFullYear() };
      save();
    }
    var P0 = state.profile, d0 = new Date();
    if (!P0.username) P0.username = "savoscout"; if (P0.email == null) P0.email = ""; if (P0.name == null) P0.name = "";
    if (!P0.city) P0.city = "Lagos"; if (!P0.pay) P0.pay = "cash"; if (P0.n1 == null) P0.n1 = true; if (P0.n2 == null) P0.n2 = true;
    if (!P0.since) P0.since = d0.toLocaleString("en-GB", { month: "long" }) + " " + d0.getFullYear();
    return state.profile;
  }
  function fillSet(P) {
    q("#sx-s-name").value = P.name; q("#sx-s-user").value = P.username; q("#sx-s-email").value = P.email;
    q("#sx-s-city").value = P.city; q("#sx-s-pay").value = P.pay; q("#sx-s-n1").checked = P.n1; q("#sx-s-n2").checked = P.n2;
  }
  q("[data-sx-set]").addEventListener("input", function () { setDirty = true; });
  q("[data-sx-set]").addEventListener("submit", function (e) {
    e.preventDefault();
    var m = q("[data-sx-set-msg]"); m.classList.remove("ok");
    var nm = q("#sx-s-name").value.trim(), un = q("#sx-s-user").value.trim().replace(/^@/, ""), em = q("#sx-s-email").value.trim();
    if (!nm) { m.textContent = "Enter your name."; q("#sx-s-name").focus(); return; }
    if (!/^[A-Za-z0-9_]{3,24}$/.test(un)) { m.textContent = "Usernames use 3 to 24 letters, numbers or underscores."; q("#sx-s-user").focus(); return; }
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { m.textContent = "Enter a valid email address."; q("#sx-s-email").focus(); return; }
    state.profile = Object.assign(prof(user()), { name: nm, username: un.toLowerCase(), email: em, city: q("#sx-s-city").value, pay: q("#sx-s-pay").value, n1: q("#sx-s-n1").checked, n2: q("#sx-s-n2").checked });
    save();
    try { var u = JSON.parse(sessionStorage.getItem("verisavo-user") || "{}"); u.name = nm; u.email = em; sessionStorage.setItem("verisavo-user", JSON.stringify(u)); } catch (e2) {}
    var r = page.querySelector('input[name="sx-opt"][value="' + state.profile.pay + '"]'); if (r) r.checked = true;
    setDirty = false; render(); m.classList.add("ok"); m.textContent = "Changes saved.";
  });
  /* tabs: dashboard, profile and settings */
  /* My tasks: what is in progress and what is completed */
  if (!state.active) { state.active = [{ t: "Outlet spotting: pharmacies on a road", p: "Ikeja, Lagos", due: "Due today, 6pm", pts: 15, prog: "2 of 5 outlets sent" }, { t: "Customer voice note: choosing a detergent", p: "Surulere, Lagos", due: "Due 24 Nov", pts: 10, prog: "Not started" }]; save(); }
  /* every task shows the same facts in the same order: time, questions, evidence, deadline, VeriPoints */
  var CARD = { "Outlet spotting: pharmacies on a road": ["About 20 min", "5 questions", "Photos and location"], "Customer voice note: choosing a detergent": ["About 10 min", "4 questions", "A short voice note"] };
  function renderTasks() {
    var waLink = state.wa ? "https://wa.me/?text=" + encodeURIComponent("Verisavo task") : "";
    q("[data-sx-active]").innerHTML = state.active.length ? state.active.map(function (a, i) {
      var cd = CARD[a.t] || ["About 10 min", "5 questions", "Photos and location"];
      return '<li class="sx-r sx-act"><div><b>' + esc(a.t) + "</b><span>" + esc(a.p) + " · " + esc(a.due) + '</span><span class="sx-meta">' + esc(cd[0]) + " · " + esc(cd[1]) + " · Evidence: " + esc(cd[2].toLowerCase()) + '</span><span class="sx-meta">' + esc(a.prog) + '. If you cannot complete it, reply CANT on WhatsApp. It does not count against you.</span></div><div class="sx-r-end"><i>In progress</i><em>' + a.pts + ' VeriPoints</em><button type="button" class="sx-link sx-link-warn" data-sx-drop="' + i + '">Drop task</button></div></li>';
    }).join("") : '<li class="sx-empty">No tasks in progress. Find one near you on the task board.</li>';
    var ok = RESP.filter(function (r) { return r.s === "ok"; });
    q("[data-sx-done-sum]").textContent = RESP.length + " responses sent · " + ok.length + " verified · " + ok.reduce(function (a, r) { return a + r.pts; }, 0) + " VeriPoints earned";
    q("[data-sx-done]").innerHTML = q("[data-sx-list]").innerHTML;
    var on = !!state.wa;
    q("[data-sx-wa2-lead]").textContent = on ? state.wa + " is connected. Tasks, reminders and verification results arrive there." : "Not connected. Connect WhatsApp to receive tasks and send your answers.";
    q("[data-sx-wa2-on]").hidden = on;
    page.querySelectorAll(".sx-acts2 [data-sx-wa-change], .sx-acts2 [data-sx-wa-off]").forEach(function (b) { b.hidden = !on; });
  }
  page.addEventListener("click", function (e) {
    var pf = e.target.closest("[data-sx-pf]");
    if (pf) { pfOpen = pfOpen === pf.dataset.sxPf ? "" : pf.dataset.sxPf; q("[data-sx-pf-msg]").textContent = ""; renderProfile(); if (pfOpen) { var ff = q("[data-sx-pf-form]"); ff.scrollIntoView({ behavior: "smooth", block: "nearest" }); var fi = ff.querySelector("input, select"); if (fi) fi.focus({ preventScroll: true }); } return; }
    if (e.target.closest("[data-sx-pf-x]")) { pfOpen = ""; renderProfile(); return; }
    if (e.target.closest("[data-sx-qc-skip]")) { state.qc.n++; save(); renderQuick(); return; }
    var fx = e.target.closest("[data-sx-fix]");
    if (fx) { fixFor = +fx.dataset.sxFix; q("#sx-fix-file").click(); return; }
    var dp = e.target.closest("[data-sx-disp]");
    if (dp) { state.disp = state.disp || {}; state.disp[+dp.dataset.sxDisp] = 1; save(); render(); return; }
    var d = e.target.closest("[data-sx-drop]");
    if (d) { state.active.splice(+d.dataset.sxDrop, 1); save(); renderTasks(); return; }
    if (e.target.closest(".sx-acts2 [data-sx-wa-change]")) { state.wa = ""; save(); render(); tab("dash"); var w0 = q("#sx-wa"); if (w0) w0.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { var p0 = q("#sx-phone"); if (p0) p0.focus({ preventScroll: true }); }, 400); return; }
    if (e.target.closest("[data-sx-wa2-on]")) { tab("dash"); var w = q("#sx-wa"); if (w) w.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { var ph = q("#sx-phone"); if (ph) ph.focus({ preventScroll: true }); }, 400); return; }
    var off = e.target.closest("[data-sx-wa-off]");
    if (off) {
      if (off.dataset.sure !== "1") { page.querySelectorAll("[data-sx-wa-off]").forEach(function (b) { b.dataset.sure = "1"; b.textContent = "Disconnect? You will stop receiving tasks"; }); return; }
      state.wa = ""; save(); page.querySelectorAll("[data-sx-wa-off]").forEach(function (b) { b.dataset.sure = ""; b.textContent = "Disconnect"; }); render();
      var m = q("[data-sx-wa2-msg]"); if (m) { m.classList.add("ok"); m.textContent = "WhatsApp disconnected. Connect it again whenever you want tasks."; }
      return;
    }
    var del = e.target.closest("[data-sx-del]");
    if (del) {
      if (del.dataset.sure !== "1") { del.dataset.sure = "1"; del.textContent = "Delete permanently? This cannot be undone"; q("[data-sx-del-msg]").textContent = "Press again to delete your account."; return; }
      try { localStorage.removeItem(KEY); sessionStorage.removeItem("verisavo-user"); sessionStorage.removeItem("verisavo-ref"); } catch (x) {}
      state = load(); state.active = []; state.refs = []; save(); try { localStorage.removeItem(KEY); } catch (x) {}
      del.dataset.sure = ""; del.textContent = "Delete my account"; q("[data-sx-del-msg]").textContent = "";
      tab("dash"); render(); if (window.vsGoPage) window.vsGoPage("community");
      return;
    }
  });
  var fixFor = -1;
  q("#sx-fix-file").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f || fixFor < 0) return; state.fix = state.fix || {}; state.fix[fixFor] = f.name; fixFor = -1; save(); render(); });
  q("[data-sx-pf-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var set = SETS.filter(function (s) { return s.k === pfOpen; })[0], f = e.currentTarget, m = q("[data-sx-pf-msg]"); if (!set) return;
    var out = {}; set.f.forEach(function (x) { out[x.k] = x.type === "checks" ? [].map.call(f.querySelectorAll('input[name="' + x.k + '"]:checked'), function (c) { return c.value; }) : (f.elements[x.k] || {}).value || ""; });
    state.sets = state.sets || {}; state.sets[set.k] = out; pfOpen = ""; m.classList.add("ok");
    var all = SETS.every(setDone);
    if (all && !state.pfPaid) { state.pfPaid = true; state.balance += PF_PTS; state.earned += PF_PTS; m.textContent = "Profile complete. " + PF_PTS + " VeriPoints have been added to your balance."; }
    else m.textContent = setDone(set) ? set.t + " saved." : set.t + " saved. Finish the remaining answers when you can.";
    save(); render();
  });
  q("[data-sx-qc]").addEventListener("submit", function (e) {
    e.preventDefault();
    var c = QC[state.qc.n], m = q("[data-sx-qc-msg]"); if (!c) return;
    if (c.num) { var v = parseFloat(q("#sx-qc-a").value); if (!(v > 0)) { m.textContent = "Enter the price as a number above 0."; q("#sx-qc-a").focus(); return; } }
    else if (!page.querySelector('input[name="sx-qc-a"]:checked')) { m.textContent = "Choose an answer, or tap I don’t know."; return; }
    state.qc.n++; state.qc.hold = (state.qc.hold || 0) + 1; save(); render();
  });
  function tab(k) {
    page.querySelectorAll("[data-sx-tab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.sxTab === k)); });
    page.querySelectorAll("[data-sx-panel]").forEach(function (p) { p.hidden = p.dataset.sxPanel !== k; });
  }
  page.addEventListener("click", function (e) { var b = e.target.closest("[data-sx-tab]"); if (b) tab(b.dataset.sxTab); });

  /* identity onboarding: one question at a time, before the dashboard */
  var CITIES = { Nigeria: ["Lagos", "Abuja", "Kano"], Ghana: ["Accra", "Kumasi", "Tamale"], Kenya: ["Nairobi", "Mombasa"], Tanzania: ["Dar es Salaam"] };
  var step = 0, STEPS = 7, idFile = "", selfie = "", camStream = null;
  var oq = function (s) { return page.querySelector(s); };
  function cities() { var c = oq("#sx-o-country").value; oq("#sx-o-city").innerHTML = (CITIES[c] || []).map(function (x) { return "<option>" + x + "</option>"; }).join(""); }
  oq("#sx-o-country").addEventListener("change", cities); cities();
  var idType = function () { var r = page.querySelector('input[name="sx-o-id"]:checked'); return r ? r.value : "National ID card"; };
  function onbShow() {
    var u = JSON.parse(sessionStorage.getItem("verisavo-user") || "{}");
    if (!oq("#sx-o-name").value) oq("#sx-o-name").value = u.name || "";
    page.querySelectorAll(".sx-q").forEach(function (el) { el.hidden = +el.dataset.q !== step; });
    page.querySelectorAll(".sx-prog i").forEach(function (el, i) { el.classList.toggle("on", i <= step); });
    oq("[data-sx-onb-step]").textContent = "Step " + (step + 1) + " of " + STEPS + " · Verify your identity";
    oq("[data-sx-onb-back]").style.visibility = step ? "visible" : "hidden";
    oq("[data-sx-onb-next]").textContent = step === STEPS - 1 ? "Submit for verification" : "Continue";
    oq("[data-sx-o-idname]").textContent = idType() === "Passport" ? "passport" : idType().replace(/^./, function (c) { return c.toLowerCase(); });
  }
  function check() {
    var m = oq("[data-sx-onb-msg]");
    if (step === 0 && oq("#sx-o-name").value.trim().length < 3) return "Enter your full name as it appears on your ID.";
    if (step === 1) { var d = oq("#sx-o-dob").value; if (!d) return "Enter your date of birth."; if ((Date.now() - new Date(d)) / 31557600000 < 18) return "SavoScouts must be 18 or older."; }
    if (step === 4 && oq("#sx-o-idno").value.replace(/\s/g, "").length < 5) return "Enter your ID number as it appears on your ID.";
    if (step === 5 && !idFile) return "Upload a photo or PDF of your ID.";
    if (step === 6 && !selfie) return "Take a selfie so we can match it with your ID.";
    return "";
  }
  oq("#sx-o-file").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 10485760) { oq("[data-sx-onb-msg]").textContent = "That file is over 10 MB."; return; } idFile = f.name; oq("[data-sx-o-fname]").textContent = f.name; oq("[data-sx-onb-msg]").textContent = ""; });
  page.addEventListener("change", function (e) { if (e.target.name === "sx-o-id") onbShow(); });
  /* selfie: a live camera where the browser allows it, the phone's front camera otherwise; the photo stays on this device in this demo */
  function camStop() { if (camStream) { camStream.getTracks().forEach(function (t) { t.stop(); }); camStream = null; } var v = oq("[data-sx-cam-v]"); if (v) { v.srcObject = null; v.hidden = true; } oq("[data-sx-cam-ring]").hidden = true; oq("[data-sx-cam-snap]").hidden = true; }
  function camShow(url) { camStop(); selfie = url; var im = oq("[data-sx-cam-img]"); im.src = url; im.hidden = false; oq("[data-sx-cam-ph]").hidden = true; oq("[data-sx-cam-start]").hidden = true; oq("[data-sx-cam-retake]").hidden = false; oq("[data-sx-cam-alt]").hidden = true; oq("[data-sx-onb-msg]").textContent = ""; }
  function camReset() { camStop(); selfie = ""; var im = oq("[data-sx-cam-img]"); im.hidden = true; im.removeAttribute("src"); oq("[data-sx-cam-ph]").hidden = false; oq("[data-sx-cam-start]").hidden = false; oq("[data-sx-cam-retake]").hidden = true; oq("[data-sx-cam-alt]").hidden = false; }
  oq("[data-sx-cam-start]").addEventListener("click", function () {
    var m = oq("[data-sx-onb-msg]");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { oq("#sx-o-selfie").click(); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }).then(function (s) {
      camStream = s; var v = oq("[data-sx-cam-v]"); v.srcObject = s; v.hidden = false; oq("[data-sx-cam-ring]").hidden = false; oq("[data-sx-cam-ph]").hidden = true;
      oq("[data-sx-cam-start]").hidden = true; oq("[data-sx-cam-snap]").hidden = false; m.textContent = "";
    }).catch(function () { m.textContent = "The camera could not be opened. Allow camera access, or use your phone camera."; });
  });
  oq("[data-sx-cam-snap]").addEventListener("click", function () {
    var v = oq("[data-sx-cam-v]"); if (!v.videoWidth) return;
    var c = document.createElement("canvas"), w = Math.min(640, v.videoWidth); c.width = w; c.height = Math.round(w * v.videoHeight / v.videoWidth);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); /* saved the right way round for matching, though the preview is mirrored */
    camShow(c.toDataURL("image/jpeg", 0.85));
  });
  oq("[data-sx-cam-retake]").addEventListener("click", function () { camReset(); oq("[data-sx-cam-start]").click(); });
  oq("#sx-o-selfie").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; if (!/^image\//.test(f.type)) { oq("[data-sx-onb-msg]").textContent = "Choose a photo."; return; } var r = new FileReader(); r.onload = function () { camShow(r.result); }; r.readAsDataURL(f); e.target.value = ""; });
  oq("[data-sx-onb-back]").addEventListener("click", function () { if (step) { if (step === 6) camStop(); step--; oq("[data-sx-onb-msg]").textContent = ""; onbShow(); } });
  oq("[data-sx-onb-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = check(); oq("[data-sx-onb-msg]").textContent = err; if (err) return;
    if (step < STEPS - 1) { step++; onbShow(); var f = page.querySelector('.sx-q[data-q="' + step + '"] input, .sx-q[data-q="' + step + '"] select'); if (f && f.type !== "file" && f.type !== "radio") f.focus(); return; }
    /* only a masked ID number is kept in the browser; the full number goes to verification */
    var no = oq("#sx-o-idno").value.replace(/\s/g, "");
    var nm = oq("#sx-o-name").value.trim(), city = oq("#sx-o-city").value;
    state.kyc = { type: idType(), masked: "•••• " + no.slice(-3), file: idFile, selfie: !!selfie, country: oq("#sx-o-country").value, status: "checking" };
    camReset();
    var P = prof(user()); P.name = nm; P.city = city;
    if (!P.username || P.username === "savoscout") { P.username = (nm.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24)) || "savoscout"; }
    try { var u = JSON.parse(sessionStorage.getItem("verisavo-user") || "{}"); u.name = nm; sessionStorage.setItem("verisavo-user", JSON.stringify(u)); } catch (e2) {}
    oq("#sx-o-idno").value = ""; step = 0; save(); setDirty = false; render();
    q("[data-sx-pick]").hidden = true;
    if (state.referredBy) { q("[data-sx-pick]").innerHTML = "<p>You joined with code <b>" + esc(state.referredBy) + "</b>. The friend who invited you has earned 15 VeriPoints.</p>"; q("[data-sx-pick]").hidden = false; }
    var em = (prof(user()) || {}).email; q("[data-sx-pop-email]").textContent = em || "the address on your account";
    var pop = q("[data-sx-pop]"); pop.hidden = false; document.body.classList.add("sx-pop-open");
    setTimeout(function () { var x = pop.querySelector(".sx-btn"); if (x) x.focus(); }, 60);
  });

  /* review popup: closes with the cross, the button, Escape or a click outside */
  function closePop() { var pop = q("[data-sx-pop]"); if (pop.hidden) return; pop.hidden = true; document.body.classList.remove("sx-pop-open"); var t = q("[data-sx-vbar]"); if (t) t.setAttribute("tabindex", "-1"); }
  page.addEventListener("click", function (e) { if (e.target.closest("[data-sx-pop-x]") || e.target.matches("[data-sx-pop]")) closePop(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
  q("[data-sx-demo-ok]").addEventListener("click", function () { if (state.kyc) { state.kyc.status = "verified"; save(); render(); } });

  /* referral actions */
  q("[data-sx-ref-copy]").addEventListener("click", function () {
    var m = q("[data-sx-ref-msg]"), v = refLink();
    var done = function () { m.textContent = "Link copied. Share it with friends who know their local market."; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () { q("#sx-ref-link").select(); m.textContent = "Press Ctrl+C or Cmd+C to copy."; });
    else { q("#sx-ref-link").select(); m.textContent = "Press Ctrl+C or Cmd+C to copy."; }
  });
  if (navigator.share) { var ns = q("[data-sx-ref-native]"); ns.hidden = false; ns.addEventListener("click", function () { navigator.share({ title: "Join SavoScouts", text: "Earn VeriPoints for what you see in your local market.", url: refLink() }).catch(function () {}); }); }

  /* redemption */
  var amt = q("#sx-amt");
  var opt = function () { var c = page.querySelector('input[name="sx-opt"]:checked'); return c ? c.value : "cash"; };
  function sum() { var n = Math.max(0, Math.floor(+amt.value || 0)); q("[data-sx-get]").textContent = usd(n); }
  amt.addEventListener("input", sum);
  q("[data-sx-max]").addEventListener("click", function () { amt.value = Math.floor(state.balance / 5) * 5; sum(); });
  page.addEventListener("change", function (e) { if (e.target.name === "sx-opt") { var m = MIN[opt()]; if ((+amt.value || 0) < m) { amt.value = m; sum(); } } });
  q("[data-sx-red]").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = Math.floor(+amt.value || 0), o = opt(), msg = q("[data-sx-red-msg]");
    msg.classList.remove("ok");
    if (n < MIN[o]) { msg.textContent = LABEL[o] + " starts at " + fmt(MIN[o]) + " VeriPoints."; return; }
    if (n % 5) { msg.textContent = "Convert in steps of 5 VeriPoints."; return; }
    if (n > state.balance) { msg.textContent = "You have " + fmt(state.balance) + " VeriPoints to convert."; return; }
    state.balance -= n;
    var d = new Date(); state.req.push({ o: o, p: n, d: d.getDate() + " " + d.toLocaleString("en-GB", { month: "short" }) });
    save(); render();
    msg.classList.add("ok");
    msg.textContent = "Request sent. " + usd(n) + " as " + LABEL[o].toLowerCase() + (state.wa ? ". We will confirm on WhatsApp." : ". Connect WhatsApp to get the confirmation.");
  });
  /* WhatsApp connection: number, one-time code, connected */
  var waMsg = q("[data-sx-wa-msg]"), phone = q("#sx-phone");
  q("[data-sx-wa-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = phone.value.replace(/[^\d+]/g, "");
    if (v.replace(/\D/g, "").length < 9) { waMsg.textContent = "Enter your WhatsApp number with the country code."; phone.focus(); return; }
    q("[data-sx-code]").hidden = false; waMsg.textContent = "Code sent. Check WhatsApp on " + phone.value.trim() + ".";
    q("#sx-otp").focus();
  });
  q("[data-sx-verify]").addEventListener("click", function () {
    var c = q("#sx-otp").value.trim();
    if (!/^\d{6}$/.test(c)) { waMsg.textContent = "Enter the 6-digit code."; return; }
    var d = phone.value.replace(/\D/g, "");
    state.wa = "+" + d.slice(0, 3) + " ••• " + d.slice(-4); save();
    waMsg.textContent = ""; q("[data-sx-code]").hidden = true; q("#sx-otp").value = "";
    q("[data-sx-pick]").hidden = true; render();
  });
  q("[data-sx-wa-change]").addEventListener("click", function () { state.wa = ""; save(); render(); phone.focus(); });
  /* sign in, sign up and sign out */
  var goScout = function () { if (window.vsGoPage) window.vsGoPage("scout"); };
  var openScoutAuth = function (mode) { window.vsAfterAuth = function () { try { var by = sessionStorage.getItem("verisavo-ref"); if (by && by !== state.refCode && !state.referredBy) { state.referredBy = by; save(); } } catch (e) {} tab("dash"); render(); labels(); goScout(); }; if (window.vsOpenScoutAuth) window.vsOpenScoutAuth(mode); };
  q("[data-sx-signin]").addEventListener("click", function () { openScoutAuth("in"); });
  q("[data-sx-signup]").addEventListener("click", function () { openScoutAuth("up"); });
  page.querySelectorAll("[data-sx-out]").forEach(function (b) { b.addEventListener("click", function () { try { sessionStorage.removeItem("verisavo-user"); } catch (e) {} tab("dash"); labels(); render(); }); });
  /* every SavoScouts sign-up button on the Community pages opens an account, then this dashboard */
  function labels() {
    var u = user();
    document.querySelectorAll("#pg-community [data-join]:not([data-task]), #pg-community-tasks [data-join]:not([data-task])").forEach(function (b) {
      if (!b.dataset.sxLabel) b.dataset.sxLabel = b.textContent.trim();
      b.textContent = u ? "Open my dashboard" : b.dataset.sxLabel;
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-join]"); if (!b || !b.closest("#pg-community, #pg-community-tasks")) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var task = b.dataset.task || "";
    var pick = q("[data-sx-pick]");
    if (task && user() && !state.active.some(function (a) { return a.t === task; })) { state.active.unshift({ t: task, p: (b.closest("li") && b.closest("li").dataset.city) || "Near you", due: "Due in 48 hours", pts: 10, prog: "Not started" }); save(); }
    if (task) { pick.innerHTML = "<p><b>" + esc(task) + "</b> is sent and answered on WhatsApp. " + (state.wa ? "We have sent it to " + esc(state.wa) + "." : "Connect WhatsApp below to take it.") + "</p>"; pick.hidden = false; }
    else pick.hidden = true;
    if (user()) { render(); goScout(); } else openScoutAuth("up");
  }, true);
  document.addEventListener("click", function (e) { if (e.target.closest('[data-page="scout"]')) render(); });
  new MutationObserver(function () { if (page.classList.contains("open")) { render(); labels(); } }).observe(page, { attributes: true, attributeFilter: ["class"] });
  labels(); render();
  /* demo guide steps for the SavoScout journey (only shown in demo mode) */
  (function () {
    if (!window.vsDemoGuide) return;
    var AM = { name: "Amara Okafor", email: "amara.okafor@example.com", dob: "1998-04-12", country: "Nigeria", city: "Lagos", idno: "4821 7730 615", file: "amara-okafor-national-id.jpg" };
    var FACE = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E3EBF8"/><circle cx="200" cy="120" r="56" fill="#3A5292"/><path d="M92 300c8-70 52-104 108-104s100 34 108 104z" fill="#3A5292"/><text x="200" y="136" text-anchor="middle" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#fff">AO</text><text x="200" y="286" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#fff">Sample selfie</text></svg>');
    (function () { var m = state.demoRes || {}, any = false; Object.keys(m).forEach(function (k) { if (RESP[k]) { RESP[k].s = m[k]; any = true; } }); if (any) render(); })();
    var setv = function (el, v) { if (!el) return; el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); };
    window.vsDemoGuide(function () {
      if (!page.getClientRects().length && !(document.getElementById("auth") && document.getElementById("auth").open && window.vsAuthRole === "scout")) return null;
      var st = [], u = user(), au = document.getElementById("auth");
      if (au && au.open) {
        st.push({ t: "Fill in the sign-up form", n: "Amara Okafor, the sample SavoScout. Then tap the button on the form.", go: function () { setv(document.getElementById("a-name"), AM.name); setv(document.getElementById("a-email"), AM.email); return "Filled in. Tap the button on the form to continue."; } });
        return st;
      }
      if (!u) {
        st.push({ t: "Sign up as Amara Okafor", n: "Skips the sign-up form and lands on identity verification.", go: function () { try { sessionStorage.setItem("verisavo-user", JSON.stringify({ name: AM.name, email: AM.email, role: "scout" })); } catch (e) {} tab("dash"); render(); labels(); goScout(); return "Signed up as Amara Okafor."; } });
        return st;
      }
      var onb = q("[data-sx-onb]");
      if (onb && !onb.hidden) {
        st.push({ t: "Fill in Amara's identity details", n: "Fills all 7 steps, with a sample ID and selfie. Tap Continue on each step to walk through them.", go: function () {
          oq("#sx-o-name").value = AM.name; oq("#sx-o-dob").value = AM.dob; oq("#sx-o-country").value = AM.country; cities(); oq("#sx-o-city").value = AM.city; oq("#sx-o-idno").value = AM.idno;
          idFile = AM.file; oq("[data-sx-o-fname]").textContent = AM.file; camShow(FACE); onbShow();
          return "Filled in. Tap Continue on each step, then Submit for verification.";
        } });
        return st;
      }
      if (state.kyc && state.kyc.status === "checking") st.push({ t: "Approve the identity check", n: "In real use the Verisavo team checks the ID and selfie, usually within a day.", go: function () { var pop = q("[data-sx-pop]"); if (pop && !pop.hidden) { pop.hidden = true; document.body.classList.remove("sx-pop-open"); } state.kyc.status = "verified"; save(); render(); return "Identity confirmed. Tasks and conversions are now unlocked."; } });
      var waitK = [], k; for (k = 0; k < RESP.length; k++) if (RESP[k].s === "wait" || (state.fix || {})[k]) waitK.push(k);
      if (waitK.length || (state.qc && state.qc.hold)) st.push({ t: "Verify what is being checked", n: "Responses normally take up to 7 days. This verifies them now and releases the VeriPoints.", go: function () {
        var add = 0; state.demoRes = state.demoRes || {};
        waitK.forEach(function (i) { RESP[i].s = "ok"; state.demoRes[i] = "ok"; if (state.fix) delete state.fix[i]; add += RESP[i].pts; });
        if (state.qc && state.qc.hold) { add += state.qc.hold * QC_PTS; state.qc.hold = 0; }
        state.balance += add; state.earned += add; save(); render(); return "Verified. " + add + " VeriPoints added to the balance.";
      } });
      var dispK = []; Object.keys(state.disp || {}).forEach(function (i) { if (RESP[i] && RESP[i].s === "no") dispK.push(+i); });
      if (dispK.length) st.push({ t: "Decide the dispute in the scout's favour", n: "A second reviewer normally decides within 3 days.", go: function () { var add = 0; state.demoRes = state.demoRes || {}; dispK.forEach(function (i) { RESP[i].s = "ok"; state.demoRes[i] = "ok"; delete state.disp[i]; add += RESP[i].pts; }); state.balance += add; state.earned += add; save(); render(); return "Dispute upheld. " + add + " VeriPoints added."; } });
      if ((state.req || []).some(function (r) { return !r.done; })) st.push({ t: "Complete the conversion", n: "Payouts normally take a short while to process.", go: function () { state.req.forEach(function (r) { r.done = true; }); save(); render(); return "Marked as paid."; } });
      if (!state.wa && !(state.kyc && state.kyc.status === "checking")) st.push({ t: "Connect Amara's WhatsApp", n: "Skips the number and 6-digit code.", go: function () { state.wa = "+234 ••• 0142"; save(); render(); return "WhatsApp connected."; } });
      st.push({ t: "Start the scout demo again", n: "Signs out and clears this sample account, so you can run it from the first step.", go: function () { try { localStorage.removeItem(KEY); sessionStorage.removeItem("verisavo-user"); } catch (e) {} setTimeout(function () { location.reload(); }, 200); return "Starting again."; } });
      return st;
    }, "Demo guide: SavoScout journey");
  })();
})();
/* <<< scout dashboard */
}
