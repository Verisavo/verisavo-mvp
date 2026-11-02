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
    if (!e.target.closest("[data-join]") || !window.vsOpenAccess) return;
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
    var b = e.target.closest('[data-page="community-tasks"]');
    if (b && b !== link && !signed() && window.vsOpenAuth) { e.preventDefault(); e.stopImmediatePropagation(); signIn(); }
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
    { t: "Price check: cooking oil and rice", d: "Record shelf prices for 6 listed products at one shop in your area. Add a photo of each shelf.", time: "About 10 min", where: "Within 2 km", pts: 50, act: "accept", acc: "Accepted. Sending prices and photos now.", sent: "6 prices, 6 photos, geo-tagged" },
    { t: "Stock check: 1kg detergent", d: "Visit two shops on your street and note whether the 1kg pack is on the shelf. A photo of each shelf is enough.", time: "About 5 min", where: "Within 1 km", pts: 25, act: "skip" },
    { t: "Outlet spotting: new kiosks", d: "Walk one route and note any kiosk that opened in the last month, with its location.", time: "About 20 min", where: "One route near you", pts: 80, act: "accept", acc: "Accepted. Starting the route now.", sent: "3 kiosks, locations pinned" }
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
(function () {
  var page = document.getElementById("pg-scout"); if (!page || page.dataset.sxReady) return;
  page.dataset.sxReady = "1";
  var q = function (s) { return page.querySelector(s); };
  var RATE = 100; /* VeriPoints per US dollar, example rate */
  var MIN = { cash: 500, airtime: 200, voucher: 1000 };
  var LABEL = { cash: "Cash to mobile money", airtime: "Airtime or data voucher", voucher: "Shopping voucher" };
  /* example responses, so the dashboard reads like a real account during early access */
  var RESP = [
    { t: "Price check: cooking oil and rice", p: "Surulere, Lagos", d: "28 Oct", s: "ok", pts: 50 },
    { t: "Outlet spotting: new kiosks on a route", p: "Yaba, Lagos", d: "27 Oct", s: "wait", pts: 80 },
    { t: "Shelf check: 1kg detergent", p: "Ikeja, Lagos", d: "25 Oct", s: "ok", pts: 25 },
    { t: "Retailer quick chat: baby formula supply", p: "Surulere, Lagos", d: "22 Oct", s: "ok", pts: 60 },
    { t: "Price check: mobile data bundles", p: "Ikeja, Lagos", d: "19 Oct", s: "no", pts: 40, why: "Photo too unclear to read the price" },
    { t: "Delivery watch: morning deliveries", p: "Mushin, Lagos", d: "16 Oct", s: "ok", pts: 40 }
  ];
  var STATUS = { ok: "Verified", wait: "Being checked", no: "Not accepted" };
  var KEY = "verisavo-scout";
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (n) { return Number(n).toLocaleString("en-GB"); };
  var usd = function (pts) { return "$" + (pts / RATE).toFixed(2); };
  /* the dashboard belongs to SavoScout accounts: other sessions are asked to sign in as a SavoScout first */
  var user = function () { var u = null; try { u = JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) {} return u && u.role === "scout" ? u : null; };
  var load = function () { var d = null; try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {} return d || { balance: 1240, earned: 1655, wa: "", req: [] }; };
  var state = load();
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

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
    q("[data-sx-value]").textContent = "Worth " + usd(state.balance) + " at the example rate";
    var ok = RESP.filter(function (r) { return r.s === "ok"; }).length, wait = RESP.filter(function (r) { return r.s === "wait"; });
    q("[data-sx-verified]").textContent = ok;
    q("[data-sx-pending]").textContent = wait.length;
    q("[data-sx-pending-pts]").textContent = wait.reduce(function (a, r) { return a + r.pts; }, 0) + " VeriPoints on hold";
    q("[data-sx-earned]").textContent = fmt(state.earned);
    q("#sx-ref-link").value = refLink(); q("[data-sx-ref-code]").textContent = refCode();
    q("[data-sx-ref-n]").textContent = state.refs.length; q("[data-sx-ref-pts]").textContent = state.refs.length * REF_PTS;
    q("[data-sx-ref-list]").innerHTML = state.refs.slice(0, 3).map(function (r) { return "<li><span>" + esc(r.n) + " joined · " + esc(r.d) + "</span><em>+" + REF_PTS + "</em></li>"; }).join("");
    q("[data-sx-ref-wa]").href = "https://wa.me/?text=" + encodeURIComponent("Join me on SavoScouts. Take short tasks in your local market and earn VeriPoints for verified responses: " + refLink());
    q("[data-sx-list]").innerHTML = RESP.map(function (r) {
      var pts = r.s === "ok" ? "+" + r.pts : r.s === "wait" ? r.pts + " on hold" : "0";
      return '<li class="sx-r sx-' + r.s + '"><div><b>' + esc(r.t) + "</b><span>" + esc(r.p) + " · " + esc(r.d) + (r.why ? " · " + esc(r.why) : "") + '</span></div><div class="sx-r-end"><i>' + STATUS[r.s] + "</i><em>" + pts + "</em></div></li>";
    }).join("");
    /* WhatsApp */
    var on = !!state.wa;
    q("[data-sx-wa-form]").hidden = on; q("[data-sx-wa-done]").hidden = !on;
    q("[data-sx-wa-title]").textContent = on ? "WhatsApp connected" : "Connect WhatsApp";
    q("#sx-wa").classList.toggle("on", on);
    if (on) q("[data-sx-wa-num]").textContent = state.wa;
    /* requests */
    var h = q("[data-sx-hist]"); h.hidden = !state.req.length;
    q("[data-sx-hist-list]").innerHTML = state.req.slice().reverse().map(function (r) { return "<li><span><b>" + esc(LABEL[r.o]) + "</b>" + esc(r.d) + "</span><span>" + fmt(r.p) + " VeriPoints · " + usd(r.p) + "<i>Processing</i></span></li>"; }).join("");
    sum();
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
  function tab(k) {
    page.querySelectorAll("[data-sx-tab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.sxTab === k)); });
    page.querySelectorAll("[data-sx-panel]").forEach(function (p) { p.hidden = p.dataset.sxPanel !== k; });
  }
  page.addEventListener("click", function (e) { var b = e.target.closest("[data-sx-tab]"); if (b) tab(b.dataset.sxTab); });

  /* identity onboarding: one question at a time, before the dashboard */
  var CITIES = { Nigeria: ["Lagos", "Abuja", "Kano"], Ghana: ["Accra", "Kumasi", "Tamale"], Kenya: ["Nairobi", "Mombasa"], Tanzania: ["Dar es Salaam"] };
  var step = 0, STEPS = 6, idFile = "";
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
    return "";
  }
  oq("#sx-o-file").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 10485760) { oq("[data-sx-onb-msg]").textContent = "That file is over 10 MB."; return; } idFile = f.name; oq("[data-sx-o-fname]").textContent = f.name; oq("[data-sx-onb-msg]").textContent = ""; });
  page.addEventListener("change", function (e) { if (e.target.name === "sx-o-id") onbShow(); });
  oq("[data-sx-onb-back]").addEventListener("click", function () { if (step) { step--; oq("[data-sx-onb-msg]").textContent = ""; onbShow(); } });
  oq("[data-sx-onb-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = check(); oq("[data-sx-onb-msg]").textContent = err; if (err) return;
    if (step < STEPS - 1) { step++; onbShow(); var f = page.querySelector('.sx-q[data-q="' + step + '"] input, .sx-q[data-q="' + step + '"] select'); if (f && f.type !== "file" && f.type !== "radio") f.focus(); return; }
    /* only a masked ID number is kept in the browser; the full number goes to verification */
    var no = oq("#sx-o-idno").value.replace(/\s/g, "");
    var nm = oq("#sx-o-name").value.trim(), city = oq("#sx-o-city").value;
    state.kyc = { type: idType(), masked: "•••• " + no.slice(-3), file: idFile, country: oq("#sx-o-country").value, status: "checking" };
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
  q("[data-sx-max]").addEventListener("click", function () { amt.value = Math.floor(state.balance / 50) * 50; sum(); });
  page.addEventListener("change", function (e) { if (e.target.name === "sx-opt") { var m = MIN[opt()]; if ((+amt.value || 0) < m) { amt.value = m; sum(); } } });
  q("[data-sx-red]").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = Math.floor(+amt.value || 0), o = opt(), msg = q("[data-sx-red-msg]");
    msg.classList.remove("ok");
    if (n < MIN[o]) { msg.textContent = LABEL[o] + " starts at " + fmt(MIN[o]) + " VeriPoints."; return; }
    if (n % 50) { msg.textContent = "Convert in steps of 50 VeriPoints."; return; }
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
    if (task) { pick.innerHTML = "<p><b>" + esc(task) + "</b> is sent and answered on WhatsApp. " + (state.wa ? "We have sent it to " + esc(state.wa) + "." : "Connect WhatsApp below to take it.") + "</p>"; pick.hidden = false; }
    else pick.hidden = true;
    if (user()) { render(); goScout(); } else openScoutAuth("up");
  }, true);
  document.addEventListener("click", function (e) { if (e.target.closest('[data-page="scout"]')) render(); });
  new MutationObserver(function () { if (page.classList.contains("open")) { render(); labels(); } }).observe(page, { attributes: true, attributeFilter: ["class"] });
  labels(); render();
})();
/* <<< scout dashboard */
}
