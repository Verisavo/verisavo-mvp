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
}
