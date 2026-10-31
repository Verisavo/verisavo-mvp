// Pricing: response slider and checkout.
export default function init() {
/* >>> pricing estimator */
(function () {
  /* Pricing: choose how many verified responses to buy, see the total change, then pay in a short checkout.
     Responses bought here are stored as response credits and used when an investigation is deployed. */
  var root = document.querySelector("#pg-pricing .pi"); if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  var RATE = 1.5, n = root.querySelector("#pi-n"), no = root.querySelector("#pi-n-o"), tot = root.querySelector("#pi-t");
  var money = function (v) { v = Math.round(v * 100) / 100; return "$" + v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  function calc() {
    var c = +n.value, p = ((c - +n.min) / (+n.max - +n.min) * 100).toFixed(1) + "%";
    no.textContent = c; tot.textContent = money(c * RATE);
    n.setAttribute("aria-valuetext", c + " responses, " + money(c * RATE));
    n.style.setProperty("background", "linear-gradient(to right, #1F273F " + p + ", #CCDDF1 " + p + ")", "important");
  }
  n.addEventListener("input", calc); calc();

  var esc = function (s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var M = [["card", "Card", "Pay on our payment provider's secure page."], ["momo", "Mobile money", "Approve the payment on your phone, for example MTN MoMo or M-Pesa."], ["invoice", "Bank transfer or invoice", "We email an invoice to your billing address."]];
  function user() { try { return JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) { return null; } }
  function open() {
    var count = +n.value, amount = count * RATE, method = "card", u = user(), opener = document.activeElement;
    var bg = document.createElement("div"); bg.className = "pco-bg";
    bg.innerHTML = '<div class="pco" role="dialog" aria-modal="true" aria-labelledby="pco-h"><button type="button" class="pco-x" aria-label="Close">×</button>' +
      '<h2 id="pco-h">Checkout</h2>' +
      '<div class="pco-sum"><span>' + count + ' verified responses × ' + money(RATE) + '</span><b>' + money(amount) + '</b></div>' +
      '<p class="pco-l" id="pco-ml">Payment method</p><div class="pco-m" role="radiogroup" aria-labelledby="pco-ml">' +
      M.map(function (m) { return '<button type="button" role="radio" data-m="' + m[0] + '" aria-checked="' + (m[0] === method) + '"><i aria-hidden="true"></i><span><b>' + m[1] + '</b><small>' + m[2] + '</small></span></button>'; }).join("") + '</div>' +
      '<label class="pco-f">Billing email<input type="email" id="pco-em" autocomplete="email" placeholder="finance@company.com" value="' + esc(u && u.email) + '"></label>' +
      '<button type="button" class="pco-pay">Pay ' + money(amount) + '</button>' +
      '<p class="pco-fine">Preview: no payment is taken yet.</p></div>';
    document.body.appendChild(bg);
    var dlg = bg.querySelector(".pco"), em = bg.querySelector("#pco-em"), pay = bg.querySelector(".pco-pay");
    var valid = function () { pay.disabled = !/.+@.+\..+/.test(em.value.trim()); };
    var key = function (e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "Tab") { var f = [].slice.call(dlg.querySelectorAll("button, input")).filter(function (x) { return !x.disabled; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    var close = function () { bg.remove(); document.removeEventListener("keydown", key, true); if (opener && opener.focus) opener.focus(); };
    document.addEventListener("keydown", key, true);
    em.addEventListener("input", valid); valid();
    bg.addEventListener("click", function (e) {
      if (e.target === bg || e.target.closest(".pco-x") || e.target.closest(".pco-done")) return close();
      var b = e.target.closest("[data-m]");
      if (b) { method = b.dataset.m; bg.querySelectorAll("[data-m]").forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); }); return; }
      if (e.target.closest(".pco-pay") && !e.target.closest("[data-dialog]") && !pay.disabled) {
        var have = 0; try { have = +localStorage.getItem("vs-credits") || 0; localStorage.setItem("vs-credits", String(have + count)); } catch (er) {}
        var label = M.filter(function (m) { return m[0] === method; })[0][1];
        dlg.innerHTML = '<button type="button" class="pco-x" aria-label="Close">×</button><div class="pco-ok" role="status">' +
          '<span class="pco-tick"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
          '<h2>' + count + ' responses added</h2><p>' + money(amount) + ' by ' + esc(label.toLowerCase()) + '. A receipt goes to ' + esc(em.value.trim()) + '. You have ' + (have + count) + ' responses to use when you deploy an investigation.</p>' +
          '<button type="button" class="pco-pay" data-dialog="signin" style="width:100%">Start an investigation</button><button type="button" class="pco-done" style="border:0;background:none;color:#3A5292;font:500 .9rem/1 sans-serif;cursor:pointer;padding:6px">Close</button>' +
          '<p class="pco-fine">Preview: no payment was taken.</p></div>';
        var s = dlg.querySelector("[data-dialog]"); s.addEventListener("click", function () { setTimeout(close, 0); });
        s.focus();
      }
    });
    em.focus();
  }
  root.querySelector("[data-buy]").addEventListener("click", open);
})();
/* <<< pricing estimator */
}
