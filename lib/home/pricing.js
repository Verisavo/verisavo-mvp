// Pricing: investigation estimator.
export default function init() {
/* >>> pricing estimator */
(function () {
  var root = document.querySelector("#pg-pricing .pi"); if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  var n = root.querySelector("#pi-n"), no = root.querySelector("#pi-n-o"), chips = [].slice.call(root.querySelectorAll(".pi-chip"));
  var SETUP = 200, VERIFY = 0.5;
  var money = function (v) { v = Math.round(v * 100) / 100; return "$" + v.toLocaleString("en-GB", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
  function calc() {
    var c = chips.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })[0] || chips[2];
    var count = +n.value, each = +c.dataset.rate + VERIFY, resp = count * each;
    no.textContent = count;
    root.querySelector("#pi-r-l").textContent = count + " responses × " + money(each);
    root.querySelector("#pi-r").textContent = money(resp);
    root.querySelector("#pi-t").textContent = money(SETUP + resp);
    var pc = ((count - +n.min) / (+n.max - +n.min) * 100).toFixed(1) + "%";
    n.style.setProperty("background", "linear-gradient(to right, #1F273F " + pc + ", #CCDDF1 " + pc + ")", "important");
  }
  n.addEventListener("input", calc);
  chips.forEach(function (b) { b.addEventListener("click", function () { chips.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); calc(); }); });
  calc();
})();
/* <<< pricing estimator */
}
