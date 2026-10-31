// Chat context: add Signals and reports from Verisavo to a question.
export default function init() {
/* >>> chat context */
(function () {
  /* The + in the composer: upload files, or add Signals and reports from Verisavo to the question. */
  var va = document.getElementById("va"), add = document.getElementById("va-add"), form = document.getElementById("va-form"), fileIn = document.getElementById("va-file");
  if (!va || !add || !form || document.getElementById("va-ctx")) return;

  var css = document.createElement("style");
  css.textContent = [
    ".vx-ev{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border:1px solid #CCDDF1;border-radius:999px;background:#fff;color:#1F273F;font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap;flex:none;align-self:center;justify-self:start;width:auto}",
    ".vx-ev:hover{border-color:#80AADC;background:#F3F7FC}.vx-ev svg{width:15px;height:15px;stroke:#4362B2;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}",
    "@media (max-width:420px){.vx-ev span{display:none}.vx-ev{width:32px;padding:0;justify-content:center}}",
    ".vx-menu{position:absolute;z-index:30;min-width:240px;background:#fff;border:1px solid #E3EBF8;border-radius:12px;box-shadow:0 12px 32px rgba(31,39,63,.14);padding:6px;display:grid;gap:2px}",
    ".vx-menu button{display:flex;gap:10px;align-items:flex-start;text-align:left;border:0;background:none;border-radius:8px;padding:9px 10px;color:#1F273F;font:inherit;font-size:13.5px;cursor:pointer}",
    ".vx-menu button:hover,.vx-menu button:focus-visible{background:#F3F7FC;outline:none}",
    ".vx-menu svg{width:18px;height:18px;flex:none;margin-top:1px;stroke:#4362B2;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}",
    ".vx-menu small{display:block;color:#6B7590;font-size:12px;margin-top:1px}",
    ".vx-ctx{list-style:none;margin:0 0 8px;padding:0;display:flex;flex-wrap:wrap;gap:6px}",
    ".vx-ctx li{display:inline-flex;align-items:center;gap:6px;max-width:100%;background:#E3EBF8;color:#1F273F;border-radius:8px;padding:4px 4px 4px 9px;font-size:12.5px}",
    ".vx-ctx li i{font-style:normal;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#3A5292;font-weight:600}",
    ".vx-ctx li span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}",
    ".vx-ctx li button{border:0;background:none;width:20px;height:20px;border-radius:5px;color:#3A5292;cursor:pointer;font-size:15px;line-height:1}",
    ".vx-ctx li button:hover{background:#CCDDF1}",
    ".vx-used{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}",
    ".vx-used span{font-size:11.5px;background:#E3EBF8;color:#1F273F;border-radius:6px;padding:2px 7px}",
    ".vx-bg{position:fixed;inset:0;z-index:40;background:rgba(31,39,63,.32);display:grid;place-items:center;padding:16px}",
    ".vx-pick{width:min(560px,100%);max-height:min(640px,calc(100vh - 32px));background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(31,39,63,.22);display:flex;flex-direction:column;overflow:hidden;color:#1F273F}",
    ".vx-head{padding:18px 20px 0;display:grid;gap:4px}.vx-head h2{margin:0;font-size:18px;font-weight:600}.vx-head p{margin:0;color:#6B7590;font-size:13px;line-height:1.5;padding-right:28px}",
    ".vx-x{position:absolute;right:14px;top:14px;border:0;background:none;width:32px;height:32px;border-radius:8px;cursor:pointer;color:#3A5292;font-size:20px}.vx-x:hover{background:#F3F7FC}",
    ".vx-tabs{display:flex;gap:4px;margin:14px 20px 0;padding:3px;background:#F3F7FC;border-radius:10px}",
    ".vx-tabs button{flex:1;border:0;background:none;border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;font-weight:500;color:#55607A;cursor:pointer}",
    ".vx-tabs button[aria-selected=true]{background:#fff;color:#1F273F;box-shadow:0 1px 2px rgba(31,39,63,.08),0 3px 10px rgba(31,39,63,.06)}",
    ".vx-search{margin:12px 20px 0;display:flex;align-items:center;gap:8px;border:1px solid #E3EBF8;border-radius:10px;padding:0 12px;height:38px}",
    ".vx-search input{border:0;outline:none;font:inherit;font-size:13.5px;width:100%;background:none;color:inherit}",
    ".vx-list{list-style:none;margin:10px 0 0;padding:0 12px 8px;overflow-y:auto;flex:1;min-height:120px}",
    ".vx-list label{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px;padding:10px 8px;border-radius:10px;cursor:pointer}",
    ".vx-list label:hover{background:#F7F9FD}.vx-list input{margin-top:3px;accent-color:#1F273F;width:16px;height:16px}",
    ".vx-list b{font-weight:500;font-size:13.5px;display:block}.vx-list small{color:#6B7590;font-size:12px;display:block;margin-top:2px}",
    ".vx-k{display:inline-block;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#3A5292;font-weight:600;margin-right:6px}",
    ".vx-st{display:inline-block;font-size:11px;border-radius:6px;padding:0 6px;margin-left:6px;background:#E3EBF8;color:#3A5292}",
    ".vx-none{color:#6B7590;font-size:13px;padding:20px 8px;text-align:center}",
    ".vx-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 20px;border-top:1px solid #E3EBF8}",
    ".vx-foot small{color:#6B7590;font-size:12px}",
    ".vx-foot button{border:0;border-radius:8px;background:#1F273F;color:#fff;font:inherit;font-size:13.5px;font-weight:500;padding:9px 16px;cursor:pointer}.vx-foot button[disabled]{opacity:.4;cursor:not-allowed}",
    "@media (max-width:600px){.vx-bg{place-items:end stretch;padding:0}.vx-pick{width:100%;max-height:85vh;border-radius:16px 16px 0 0}.vx-ctx li span{max-width:180px}}"
  ].join("");
  document.head.appendChild(css);

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ago = function (d) { return d === 0 ? "today" : d === 1 ? "yesterday" : d + " days ago"; };
  var SIGNALS = [
    { id: "sg1", kind: "Price change", title: "5L cooking oil up 12% in a week", where: "Kumasi, Ghana", src: "SavoScouts · verified", d: 2 },
    { id: "sg2", kind: "Stockout", title: "200ml pack missing in 6 of 9 kiosks", where: "Ikeja, Lagos", src: "SavoScouts · verified", d: 3 },
    { id: "sg3", kind: "New competitor", title: "Rival detergent on shelf in two supermarkets", where: "Lekki, Lagos", src: "SavoScouts · awaiting review", d: 4 },
    { id: "sg4", kind: "Delivery delay", title: "Distributor deliveries one day late", where: "Nairobi CBD, Kenya", src: "Company data", d: 6 },
    { id: "sg5", kind: "Policy", title: "Import duty revised on vegetable oil", where: "Ghana", src: "Public record", d: 9 },
    { id: "sg6", kind: "Footfall", title: "Market footfall up 14% on weekends", where: "Kejetia, Kumasi", src: "SavoScouts · verified", d: 11 }
  ];
  var LIFE = { draft: "Draft", completed: "Completed", paused: "Paused" };
  function reports() {
    var o = {}; try { o = JSON.parse(localStorage.getItem("vs-mvp") || "{}"); } catch (e) {}
    var sv = o.surveys || {}, sb = o.submissions || {}, out = [];
    Object.keys(sv).forEach(function (id) {
      var s = sv[id]; if (!s || s.status === "draft") return;
      var n = 0, ok = 0; Object.keys(sb).forEach(function (k) { if (sb[k].surveyId === id) { n++; if (sb[k].status === "approved") ok++; } });
      out.push({ id: "rp-" + id, kind: "Investigation", title: s.title, where: (s.regions || []).join(", ") + (s.country ? ", " + s.country : ""), src: (LIFE[s.status] || (n ? "Gathering evidence" : "Deployed")) + " · " + ok + " verified of " + n + (n === 1 ? " response" : " responses") + (s.briefing ? " · briefing ready" : ""), t: s.createdAt || 0 });
    });
    out.sort(function (a, b) { return b.t - a.t; });
    if (!out.length) out = [
      { id: "rp-x1", kind: "Investigation", title: "Cooking oil availability in Kumasi", where: "Kumasi, Ghana", src: "Gathering evidence · 10 verified of 14 responses", ex: true },
      { id: "rp-x2", kind: "Investigation", title: "Detergent shelf prices in Lagos", where: "Lagos, Nigeria", src: "Completed · 12 verified of 12 responses · briefing ready", ex: true }
    ];
    out.push({ id: "rp-r1", kind: "Research", title: "Informal retail and distribution in West African cities", where: "Ghana, Nigeria", src: "Verisavo research", ex: true });
    return out;
  }

  var ctx = [], list = document.createElement("ul"); list.className = "vx-ctx"; list.id = "va-ctx"; list.hidden = true;
  form.insertBefore(list, form.firstChild);
  function renderCtx() {
    list.innerHTML = ctx.map(function (c, i) { return '<li><i>' + esc(c.kind) + '</i><span title="' + esc(c.title) + '">' + esc(c.title) + '</span><button type="button" data-rm="' + i + '" aria-label="Remove ' + esc(c.title) + '">×</button></li>'; }).join("");
    list.hidden = !ctx.length;
  }
  list.addEventListener("click", function (e) { var b = e.target.closest("[data-rm]"); if (!b) return; ctx.splice(+b.dataset.rm, 1); renderCtx(); });

  /* "Add evidence" sits beside the upload button; the + keeps uploading files */
  var ev = document.createElement("button"); ev.type = "button"; ev.className = "vx-ev"; ev.id = "va-evidence";
  ev.setAttribute("aria-haspopup", "dialog"); ev.setAttribute("aria-label", "Add evidence: Signals and reports"); ev.title = "Add Signals and reports";
  ev.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h3l2-5 4 10 2-5h3"/></svg><span>Add evidence</span>';
  add.insertAdjacentElement("afterend", ev);
  ev.addEventListener("click", function () { openPicker(); });

  /* picker */
  function openPicker() {
    var tab = "signals", sel = {}, q = "";
    ctx.forEach(function (c) { sel[c.id] = c; });
    var bg = document.createElement("div"); bg.className = "vx-bg";
    bg.innerHTML = '<div class="vx-pick" role="dialog" aria-modal="true" aria-labelledby="vx-h" style="position:relative">' +
      '<button type="button" class="vx-x" aria-label="Close">×</button>' +
      '<div class="vx-head"><h2 id="vx-h">Add Signals and reports</h2><p class="vx-desc" aria-live="polite"></p></div>' +
      '<div class="vx-tabs" role="tablist"><button type="button" role="tab" data-tab="signals" aria-selected="true">Signals</button><button type="button" role="tab" data-tab="reports" aria-selected="false">Reports</button></div>' +
      '<label class="vx-search"><span class="vh">Search</span><input type="search" placeholder="Search by place, product or type" autocomplete="off"></label>' +
      '<ul class="vx-list" role="list"></ul>' +
      '<div class="vx-foot"><small>Examples shown during early access.</small><button type="button" class="vx-ok">Add to chat</button></div></div>';
    va.appendChild(bg);
    var ul = bg.querySelector(".vx-list"), ok = bg.querySelector(".vx-ok"), inp = bg.querySelector("input");
    var DESC = {
      signals: "Signals are single observations of change in a market, such as a price rise, a stockout or a new competitor. Each shows where and when it was seen, its source and whether it has been verified.",
      reports: "Reports bring many pieces of evidence together into one finding: your SavoScout investigations, with their verified responses and briefings, and Verisavo research."
    };
    function items() { return tab === "signals" ? SIGNALS : reports(); }
    function draw() {
      var all = items().filter(function (x) { return !q || (x.title + " " + x.where + " " + x.kind + " " + x.src).toLowerCase().indexOf(q) > -1; });
      ul.innerHTML = all.length ? all.map(function (x) {
        return '<li><label><input type="checkbox" data-id="' + x.id + '"' + (sel[x.id] ? " checked" : "") + '><span><b><span class="vx-k">' + esc(x.kind) + '</span>' + esc(x.title) + (x.ex ? '<span class="vx-st">Example</span>' : '') + '</b><small>' + esc(x.where) + ' · ' + esc(x.src) + (x.d != null ? ' · ' + ago(x.d) : '') + '</small></span></label></li>';
      }).join("") : '<li class="vx-none">Nothing matches your search.</li>';
      var n = Object.keys(sel).length; ok.textContent = n ? "Add to chat (" + n + ")" : "Add to chat"; ok.disabled = !n && !ctx.length;
      bg.querySelector(".vx-desc").textContent = DESC[tab];
      bg.querySelectorAll("[data-tab]").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false"); });
    }
    function close() { bg.remove(); ev.focus(); }
    bg.addEventListener("click", function (e) {
      if (e.target === bg || e.target.closest(".vx-x")) return close();
      var t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; draw(); return; }
      if (e.target.closest(".vx-ok")) {
        ctx = Object.keys(sel).map(function (k) { return sel[k]; }); renderCtx(); close();
        var vin = document.getElementById("va-in"); if (vin) vin.focus();
      }
    });
    ul.addEventListener("change", function (e) {
      var c = e.target.closest("[data-id]"); if (!c) return;
      var x = items().filter(function (i) { return i.id === c.dataset.id; })[0];
      if (c.checked && x) sel[x.id] = x; else delete sel[c.dataset.id];
      draw();
    });
    inp.addEventListener("input", function () { q = inp.value.trim().toLowerCase(); draw(); });
    bg.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } }, true);
    draw(); inp.focus();
  }

  /* when the question is sent, show what was added under it */
  form.addEventListener("submit", function () {
    var vin = document.getElementById("va-in"); if (!ctx.length || !vin || !vin.value.trim()) return;
    var used = ctx.slice(); ctx = []; renderCtx();
    setTimeout(function () {
      var us = document.querySelectorAll("#va-thread .va-msg-u"), last = us[us.length - 1]; if (!last) return;
      var d = document.createElement("div"); d.className = "vx-used";
      d.innerHTML = used.map(function (c) { return "<span>" + esc(c.kind) + ": " + esc(c.title) + "</span>"; }).join("");
      last.appendChild(d);
    }, 0);
  }, true);
})();
/* <<< chat context */
}
