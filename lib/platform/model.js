// Model picker: choose the AI model the Assistant uses to write answers.
export default function init() {
/* >>> model picker */
(function () {
  /* Model: choose which AI model the Assistant uses to write answers. Verisavo's evidence stays the same. */
  var va = document.getElementById("va"), send = document.getElementById("va-send");
  if (!va || !send || document.getElementById("vm-btn")) return;
  var KEY = "vs-model";
  var M = [["gemini", "Google Gemini", "Google"], ["claude", "Claude", "Anthropic"], ["chatgpt", "ChatGPT", "OpenAI"]];
  var cur = "gemini"; try { var s = localStorage.getItem(KEY); if (M.some(function (m) { return m[0] === s; })) cur = s; } catch (e) {}
  var name = function (id) { return M.filter(function (m) { return m[0] === id; })[0][1]; };

  var css = document.createElement("style");
  css.textContent = [
    "html body #va .va-row{grid-template-columns:auto 1fr auto auto!important;grid-template-areas:\"in in in in\" \"add . model send\"!important}",
    ".vm{grid-area:model;position:relative;justify-self:end}",
    ".vm-btn{width:38px;height:38px;display:grid;place-items:center;border:1px solid transparent;border-radius:10px;background:none;color:#1F273F;cursor:pointer}",
    ".vm-btn:hover,.vm-btn[aria-expanded=true]{background:#EEF3FB;border-color:#DCE6F4}",
    ".vm-btn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}",
    ".vm-pop{position:absolute;right:0;bottom:calc(100% + 8px);z-index:30;width:230px;padding:6px;background:#fff;border:1px solid #E3E8F0;border-radius:14px;box-shadow:0 16px 40px -12px rgba(31,39,63,.25);display:grid;gap:2px}",
    ".vm-pop[hidden]{display:none}",
    ".vm-pop p{margin:0;padding:8px 10px 6px;font:600 .75rem/1 var(--sans);color:#8A93A6}",
    ".vm-pop button{display:grid;grid-template-columns:1fr 16px;align-items:center;gap:8px;width:100%;text-align:left;border:0;background:none;border-radius:9px;padding:9px 10px;font:500 .9rem/1.2 var(--sans);color:#1F273F;cursor:pointer}",
    ".vm-pop button small{display:block;margin-top:2px;font-weight:400;font-size:.75rem;color:#8A93A6}",
    ".vm-pop button:hover,.vm-pop button:focus-visible{background:#F4F7FB;outline:none}",
    ".vm-pop button svg{width:16px;height:16px;fill:none;stroke:#4362B2;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;visibility:hidden}",
    ".vm-pop button[aria-checked=true] svg{visibility:visible}",
    ".va-dark .vm-btn{color:#CCDDF1}.va-dark .vm-pop{background:#1F273F;border-color:#3A4565}.va-dark .vm-pop button{color:#fff}.va-dark .vm-pop button:hover{background:#262F49}"
  ].join("");
  document.body.appendChild(css);

  var wrap = document.createElement("div"); wrap.className = "vm";
  wrap.innerHTML = '<button type="button" class="vm-btn" id="vm-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="vm-pop"></button>' +
    '<div class="vm-pop" id="vm-pop" role="menu" aria-label="Model" hidden><p>Model</p>' +
    M.map(function (m) { return '<button type="button" role="menuitemradio" data-m="' + m[0] + '" aria-checked="false"><span>' + m[1] + '<small>' + m[2] + '</small></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg></button>'; }).join("") + '</div>';
  send.parentNode.insertBefore(wrap, send);
  var btn = wrap.querySelector(".vm-btn"), pop = wrap.querySelector(".vm-pop"), items = [].slice.call(pop.querySelectorAll("[data-m]"));
  btn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.8l6.2 3.5v7.4L10 17.2l-6.2-3.5V6.3z"/><path d="M3.8 6.3L10 9.8l6.2-3.5M10 9.8v7.4"/></svg>';
  function sync() {
    items.forEach(function (b) { b.setAttribute("aria-checked", b.dataset.m === cur ? "true" : "false"); });
    btn.setAttribute("aria-label", "Model: " + name(cur)); btn.title = "Model: " + name(cur);
  }
  function show(on) { if (on) { pop.style.right = Math.min(0, btn.getBoundingClientRect().right - 238) + "px"; } pop.hidden = !on; btn.setAttribute("aria-expanded", on ? "true" : "false"); if (on) { var c = pop.querySelector("[aria-checked=true]"); if (c) c.focus(); } }
  btn.addEventListener("click", function (e) { e.stopPropagation(); show(pop.hidden); });
  pop.addEventListener("click", function (e) {
    var b = e.target.closest("[data-m]"); if (!b) return;
    cur = b.dataset.m; try { localStorage.setItem(KEY, cur); } catch (er) {}
    sync(); show(false); btn.focus();
  });
  pop.addEventListener("keydown", function (e) {
    var i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus(); }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); show(false); btn.focus(); }
  });
  document.addEventListener("click", function (e) { if (!pop.hidden && !wrap.contains(e.target)) show(false); });
  window.vsModel = function () { return { id: cur, name: name(cur) }; };
  sync();
})();
/* <<< model picker */
}
