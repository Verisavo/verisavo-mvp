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
  var signed = function () { try { return !!JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) { return false; } };
  var sync = function () { tasks.classList.toggle("cmt-in", signed()); };
  var link = document.createElement("button"); link.type = "button"; link.hidden = true; link.dataset.page = "community-tasks"; document.body.append(link);
  var signIn = function () {
    window.vsAfterAuth = function () { sync(); if (!tasks.classList.contains("open")) link.click(); };
    window.vsOpenAuth("in");
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
}
