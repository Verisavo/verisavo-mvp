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
  page.addEventListener("click", function (e) {
    if (!e.target.closest("[data-join]") || !window.vsOpenAccess) return;
    if (!orig) orig = texts.map(function (t) { return [t[0].textContent, t[1] ? t[1].textContent : ""]; });
    texts.forEach(function (t, i) { var w = WORDS[i]; if (!w) return; if (w[0]) t[0].textContent = w[0]; if (w[1] && t[1]) t[1].textContent = w[1]; });
    window.vsAccessIntro = "Hi Verisavo, I'd like to join SavoScouts.";
    window.vsOpenAccess("");
  });
  if (dlg) dlg.addEventListener("close", function () {
    window.vsAccessIntro = "";
    if (orig) { texts.forEach(function (t, i) { t[0].textContent = orig[i][0]; if (t[1]) t[1].textContent = orig[i][1]; }); orig = null; }
  });
})();
/* <<< community page */
}
