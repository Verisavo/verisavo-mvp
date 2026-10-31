// Chat context: add Signals and reports from Verisavo to a question.
export default function init() {
/* >>> chat context */
(function () {
  /* Add Market Evidence: select existing Signals and reports to inform a question in the Intelligence Assistant.
     Uploading new material stays on the + (Upload document). */
  var va = document.getElementById("va"), add = document.getElementById("va-add"), form = document.getElementById("va-form");
  if (!va || !add || !form || document.getElementById("va-ctx")) return;
  add.setAttribute("aria-label", "Upload document or image"); add.title = "Upload document or image";

  var css = document.createElement("style");
  css.textContent = [
    ".vx-ev{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border:1px solid #CCDDF1;border-radius:999px;background:#fff;color:#1F273F;font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap;flex:none;align-self:center;justify-self:start;width:auto}",
    ".vx-ev:hover{border-color:#80AADC;background:#F3F7FC}.vx-ev svg{width:15px;height:15px;stroke:#4362B2;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}",
    "@media (max-width:420px){.vx-ev span{display:none}.vx-ev{width:32px;padding:0;justify-content:center}}",
    /* chips in the composer */
    ".vx-ctx{list-style:none;margin:0 0 8px;padding:0;display:flex;flex-wrap:wrap;gap:6px;align-items:center}",
    ".vx-ctx li{display:inline-flex;align-items:center;gap:4px;max-width:100%;background:#fff;color:#1F273F;border:1px solid #E3EBF8;border-radius:999px;padding:2px 3px 2px 10px;font-size:12.5px}",
    ".vx-ctx li i{width:6px;height:6px;border-radius:50%;background:#4362B2;flex:none;margin-right:2px}",
    ".vx-ctx li i.w{background:#D98E1B}",
    ".vx-ctx li span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}",
    ".vx-ctx li button{border:0;background:none;width:20px;height:20px;border-radius:50%;color:#80AADC;cursor:pointer;font-size:14px;line-height:1}",
    ".vx-ctx li button:hover{background:#F3F7FC;color:#1F273F}",
    "html body #va .vx-sugs{display:none!important}html body #va.vx-has-ev .vx-sugs{display:flex!important}html body #va.vx-has-ev #va-chips{display:none!important}",
    ".vx-used{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.vx-used span{font-size:11.5px;background:#E3EBF8;color:#1F273F;border-radius:6px;padding:2px 7px}",
    /* modal */
    ".vx-bg{position:fixed;inset:0;z-index:40;background:rgba(31,39,63,.32);display:grid;place-items:center;padding:16px}",
    ".vx-pick{position:relative;width:min(620px,100%);max-height:min(720px,calc(100vh - 32px));background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(31,39,63,.22);display:flex;flex-direction:column;overflow:hidden;color:#1F273F}",
    ".vx-head{padding:20px 22px 0;display:grid;gap:4px}.vx-head h2{margin:0;font-size:19px;font-weight:600;letter-spacing:-.01em}.vx-head p{margin:0;color:#6B7590;font-size:13px;line-height:1.5;padding-right:30px}",
    ".vx-x{position:absolute;right:14px;top:14px;border:0;background:none;width:32px;height:32px;border-radius:8px;cursor:pointer;color:#3A5292;font-size:20px}.vx-x:hover{background:#F3F7FC}",
    ".vx-tabs{display:flex;gap:4px;margin:16px 22px 0;padding:3px;background:#F3F7FC;border-radius:11px}",
    ".vx-tabs button{flex:1;border:0;background:none;border-radius:9px;padding:8px 10px;font:inherit;font-size:13px;font-weight:500;color:#55607A;cursor:pointer}",
    ".vx-tabs button[aria-selected=true]{background:#fff;color:#1F273F;box-shadow:0 1px 2px rgba(31,39,63,.08),0 3px 10px rgba(31,39,63,.06)}",
    ".vx-hint{margin:8px 22px 0;color:#6B7590;font-size:12.5px}",
    ".vx-search{margin:12px 22px 0;display:flex;align-items:center;gap:8px;border:1px solid #CCDDF1;border-radius:11px;padding:0 12px;height:40px}",
    ".vx-search:focus-within{border-color:#80AADC;box-shadow:0 0 0 3px #E3EBF8}",
    ".vx-search svg{width:16px;height:16px;stroke:#80AADC;fill:none;stroke-width:1.8;flex:none}",
    ".vx-search input{border:0;outline:none;font:inherit;font-size:13.5px;width:100%;background:none;color:inherit}",
    ".vx-filters{margin:10px 22px 0;display:flex;flex-wrap:wrap;gap:6px;align-items:center}",
    ".vx-filters .vx-all{border:1px solid #CCDDF1;background:#fff;border-radius:999px;height:30px;padding:0 12px;font:inherit;font-size:12.5px;color:#1F273F;cursor:pointer}",
    ".vx-filters .vx-all[aria-pressed=true]{background:#1F273F;border-color:#1F273F;color:#fff}",
    ".vx-filters select{appearance:none;-webkit-appearance:none;border:1px solid #CCDDF1;background:#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M6 8l4 4 4-4' fill='none' stroke='%233A5292' stroke-width='1.8'/%3E%3C/svg%3E\") no-repeat right 8px center/14px;border-radius:999px;height:30px;padding:0 28px 0 12px;font:inherit;font-size:12.5px;color:#1F273F;cursor:pointer;max-width:170px}",
    ".vx-filters select.on{border-color:#4362B2;background-color:#E3EBF8}",
    ".vx-count{margin-left:auto;color:#6B7590;font-size:12px;white-space:nowrap}",
    ".vx-list{list-style:none;margin:12px 0 0;padding:0 14px 10px;overflow-y:auto;flex:1;min-height:140px;border-top:1px solid #EEF2F9;display:grid;gap:8px;align-content:start;padding-top:12px}",
    ".vx-sec{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B7590;font-weight:600;padding:4px 8px 0}",
    ".vx-card{border:1px solid #E3EBF8;border-radius:13px;background:#fff;transition:border-color .15s,box-shadow .15s}",
    ".vx-card:hover{border-color:#A8C6E8}",
    ".vx-card.on{border-color:#4362B2;box-shadow:0 0 0 3px #E3EBF8}",
    ".vx-row{display:grid;grid-template-columns:22px minmax(0,1fr);gap:12px;padding:13px 14px;cursor:pointer;align-items:start}",
    ".vx-sel{width:20px;height:20px;border-radius:50%;border:1.5px solid #A8C6E8;background:#fff;display:grid;place-items:center;margin-top:1px;padding:0;cursor:pointer}",
    ".vx-card.on .vx-sel{background:#1F273F;border-color:#1F273F}.vx-card.on .vx-sel::after{content:'';width:8px;height:4px;border:solid #fff;border-width:0 0 2px 2px;transform:translateY(-1px) rotate(-45deg)}",
    ".vx-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:11px}",
    ".vx-k{letter-spacing:.07em;text-transform:uppercase;color:#3A5292;font-weight:600}",
    ".vx-v{display:inline-flex;align-items:center;gap:4px;font-weight:500;border-radius:999px;padding:1px 8px;font-size:11px}",
    ".vx-pick .vx-v svg{width:12px!important;height:12px!important;min-width:0!important;flex:none;fill:none;stroke:currentColor;stroke-width:2}",
    ".vx-pick .vx-m svg,.vx-pick .vx-search svg,.vx-pick .vx-more svg{max-width:16px;max-height:16px}",
    ".vx-v.vok{background:#E3F4EC;color:#0E7A5C}.vx-v.vwait{background:#FFF2D6;color:#9A5B05}.vx-v.vno{background:#F1F3F7;color:#6B7590}",
    ".vx-ex{font-size:11px;color:#6B7590;border:1px solid #E3EBF8;border-radius:6px;padding:0 6px}",
    ".vx-rel{font-size:11px;color:#3A5292;background:#E3EBF8;border-radius:6px;padding:1px 7px;font-weight:500}",
    ".vx-t{display:block;font-size:14.5px;font-weight:600;margin-top:5px;line-height:1.35}",
    ".vx-m{display:flex;align-items:center;gap:5px;color:#6B7590;font-size:12.5px;margin-top:4px;flex-wrap:wrap}",
    ".vx-m svg{width:13px;height:13px;fill:none;stroke:#80AADC;stroke-width:1.8;flex:none}",
    ".vx-more{border:0;background:none;color:#3A5292;font:inherit;font-size:12.5px;font-weight:500;padding:0;margin-top:8px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}",
    ".vx-more svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;transition:transform .15s}.vx-more[aria-expanded=true] svg{transform:rotate(180deg)}",
    ".vx-det{margin:0 14px 13px 48px;padding:10px 12px;background:#F7F9FD;border-radius:10px;font-size:12.5px;display:grid;gap:5px}",
    ".vx-det div{display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px}.vx-det dt{color:#6B7590}.vx-det dd{margin:0}",
    ".vx-det p{margin:4px 0 0;color:#55607A;line-height:1.5}",
    ".vx-det .vx-open{justify-self:start;border:0;background:none;padding:0;margin-top:2px;color:#3A5292;font:inherit;font-weight:500;cursor:pointer;text-decoration:underline;text-underline-offset:2px}",
    ".vx-none{color:#6B7590;font-size:13px;padding:28px 8px;text-align:center}",
    ".vx-foot{display:flex;align-items:center;gap:10px;padding:12px 22px;border-top:1px solid #E3EBF8;flex-wrap:wrap}",
    ".vx-foot .vx-n{color:#55607A;font-size:13px;margin-right:auto}",
    ".vx-foot .vx-clear{border:1px solid #CCDDF1;background:#fff;border-radius:9px;padding:9px 14px;font:inherit;font-size:13px;color:#1F273F;cursor:pointer}",
    ".vx-foot .vx-clear[disabled]{opacity:.45;cursor:default}",
    ".vx-foot .vx-ok{border:0;border-radius:9px;background:#1F273F;color:#fff;font:inherit;font-size:13.5px;font-weight:500;padding:10px 16px;cursor:pointer}.vx-foot .vx-ok[disabled]{opacity:.4;cursor:not-allowed}",
    ".vx-note{padding:0 22px 14px;margin:-4px 0 0;color:#8A93A6;font-size:11.5px}",
    "@media (max-width:600px){.vx-bg{place-items:end stretch;padding:0}.vx-pick{width:100%;max-height:92vh;border-radius:18px 18px 0 0}.vx-head,.vx-tabs,.vx-hint,.vx-search,.vx-filters{margin-left:16px;margin-right:16px}.vx-head{padding:18px 16px 0;margin:0}.vx-list{padding-left:10px;padding-right:10px}.vx-foot{padding:12px 16px}.vx-note{padding:0 16px 12px}.vx-det{margin-left:14px}.vx-ctx li span{max-width:180px}.vx-filters select{max-width:none}.vx-count{flex-basis:100%;margin-left:0}}"
  ].join("");
  document.head.appendChild(css);

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ago = function (d) { return d === 0 ? "today" : d === 1 ? "yesterday" : d + " days ago"; };
  var VER = { ok: "Verified", wait: "Awaiting review", no: "Unreviewed" };
  var ICON = { ok: '<svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><path d="M5.5 8.2l1.7 1.7 3.3-3.4"/></svg>', wait: '<svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.2l2 1.2"/></svg>', no: "" };
  var PIN = '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14s-4.5-3.8-4.5-7.2a4.5 4.5 0 0 1 9 0C12.5 10.2 8 14 8 14z"/><circle cx="8" cy="6.8" r="1.5"/></svg>';
  var SIGNALS = [
    { id: "sg1", kind: "Price change", title: "5L cooking oil up 12% in a week", where: "Kumasi", country: "Ghana", src: "SavoScouts", v: "ok", d: 2, inv: "svx1", note: "Shelf prices recorded in 9 shops around Kejetia Market, compared with the previous week." },
    { id: "sg2", kind: "Stockout", title: "200ml pack missing in 6 of 9 kiosks", where: "Ikeja, Lagos", country: "Nigeria", src: "SavoScouts", v: "ok", d: 3, note: "Kiosks visited along one route; two shopkeepers said a delivery was missed." },
    { id: "sg3", kind: "New competitor", title: "Rival detergent on shelf in two supermarkets", where: "Lekki, Lagos", country: "Nigeria", src: "SavoScouts", v: "wait", d: 4, inv: "svx2", note: "One SavoScout reported this. A second response is needed before it can be verified." },
    { id: "sg4", kind: "Delivery delay", title: "Kiosk owners report deliveries a day late", where: "Nairobi CBD", country: "Kenya", src: "SavoScouts", v: "wait", d: 6, note: "Five kiosk owners on one route said the distributor arrived a day late. Awaiting a second SavoScout." },
    { id: "sg5", kind: "Price change", title: "Imported rice price steady at wholesalers", where: "Makola, Accra", country: "Ghana", src: "SavoScouts", v: "ok", d: 9, note: "Prices recorded at six wholesalers, unchanged from the previous visit." },
    { id: "sg6", kind: "Footfall", title: "Market footfall up 14% on weekends", where: "Kejetia, Kumasi", country: "Ghana", src: "SavoScouts", v: "ok", d: 11, inv: "svx1", note: "Counts taken at two market entrances over three weekends." }
  ];
  function store() { try { return JSON.parse(localStorage.getItem("vs-mvp") || "{}"); } catch (e) { return {}; } }
  function reports() {
    var o = store(), sv = o.surveys || {}, sb = o.submissions || {}, out = [];
    Object.keys(sv).forEach(function (id) {
      var s = sv[id]; if (!s || s.status === "draft") return;
      var n = 0, ok = 0; Object.keys(sb).forEach(function (k) { if (sb[k].surveyId === id) { n++; if (sb[k].status === "approved") ok++; } });
      var st = s.status === "completed" ? "Completed" : s.status === "paused" ? "Paused" : n ? "Gathering evidence" : "Deployed";
      out.push({ id: "rp-" + id, inv: id, kind: "Investigation", title: s.title, where: (s.regions || []).join(", "), country: s.country || "", src: "SavoScouts", v: ok && s.status === "completed" ? "ok" : ok ? "wait" : "no",
        vtext: ok + " of " + n + (n === 1 ? " response" : " responses") + " verified", stat: st, brief: !!s.briefing, t: s.createdAt || 0, ex: !!s.sample,
        note: (s.request || s.title) + (s.briefing ? " A briefing is ready." : "") });
    });
    out.sort(function (a, b) { return b.t - a.t; });
    if (!out.length) out = [
      { id: "rp-x1", kind: "Investigation", title: "Cooking oil availability in Kumasi", where: "Kumasi", country: "Ghana", src: "SavoScouts", v: "wait", vtext: "10 of 14 responses verified", stat: "Gathering evidence", ex: true, note: "Cooking oil availability, shelf prices and stockouts by brand in Kumasi retail shops." },
      { id: "rp-x2", kind: "Investigation", title: "Detergent shelf prices in Lagos", where: "Lagos", country: "Nigeria", src: "SavoScouts", v: "ok", vtext: "12 of 12 responses verified", stat: "Completed", ex: true, note: "Detergent shelf prices, promotions and availability by brand in Lagos shops. A briefing is ready." }
    ];
    return out;
  }
  function place(x) { return !x.country || x.where === x.country ? x.where || x.country : x.where ? x.where + ", " + x.country : x.country; }
  function getInv(id) { var s = (store().surveys || {})[id]; return s ? s.title : ""; }

  /* relevance to the question being typed and the market scope */
  var STOP = { the: 1, and: 1, for: 1, our: 1, what: 1, how: 1, are: 1, is: 1, in: 1, of: 1, to: 1, a: 1, on: 1, does: 1, this: 1, with: 1, why: 1, where: 1, which: 1, should: 1, we: 1, do: 1, it: 1, happening: 1, price: 1, prices: 1, market: 1, markets: 1, change: 1, changes: 1, now: 1, there: 1, about: 1, from: 1 };
  function terms() {
    var q = ((document.getElementById("va-in") || {}).value || "") + " " + ((document.getElementById("va-scope-label") || {}).textContent || "").replace("All markets", "");
    return q.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2 && !STOP[w]; });
  }
  /* a place match counts double; an item is relevant from a score of 2 */
  function score(x, ts) {
    var pl = (x.where + " " + x.country).toLowerCase(), hay = (x.title + " " + x.kind + " " + (x.note || "")).toLowerCase(), n = 0;
    ts.forEach(function (t) { var u = t.replace(/s$/, ""); if (pl.indexOf(t) > -1 || pl.indexOf(u) > -1) n += 2; else if (hay.indexOf(t) > -1 || hay.indexOf(u) > -1) n++; });
    return n >= 2 ? n : 0;
  }

  /* chips in the composer, with optional next steps once two or more are added */
  var ctx = [], list = document.createElement("ul"); list.className = "vx-ctx"; list.id = "va-ctx"; list.hidden = true;
  form.insertBefore(list, form.firstChild);
  var SUG = [["Compare findings", "Compare the evidence I have added. Where does it agree, and where does it differ?"], ["Explain changes", "Explain what has changed according to the evidence I have added, and why it might be happening."], ["Identify Intelligence Gaps", "What can this evidence not tell us yet? Identify the Intelligence Gaps that matter for our decision."]];
  function renderCtx() {
    list.innerHTML = ctx.map(function (c, i) { return '<li><i class="' + (c.v === "wait" ? "w" : "") + '" title="' + esc(c.kind + " · " + (VER[c.v] || "")) + '"></i><span title="' + esc(c.kind + ": " + c.title) + '">' + esc(c.title) + '</span><button type="button" data-rm="' + i + '" aria-label="Remove ' + esc(c.title) + '">×</button></li>'; }).join("") +
"";
    list.hidden = !ctx.length;
    va.classList.toggle("vx-has-ev", ctx.length > 1);
  }
  var sugs = document.createElement("div"); sugs.className = "va-chips vx-sugs"; sugs.setAttribute("aria-label", "Ask about the evidence");
  sugs.innerHTML = SUG.map(function (x, i) { return '<button type="button" class="va-chip" data-sug="' + i + '">' + x[0] + "</button>"; }).join("");
  var chips = document.getElementById("va-chips"); if (chips) chips.insertAdjacentElement("afterend", sugs); else form.insertAdjacentElement("afterend", sugs);
  sugs.addEventListener("click", function (e) { var s = e.target.closest("[data-sug]"); if (s) { var vin = document.getElementById("va-in"); vin.value = SUG[+s.dataset.sug][1]; vin.dispatchEvent(new Event("input", { bubbles: true })); vin.focus(); } });
  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-rm]"); if (b) { ctx.splice(+b.dataset.rm, 1); renderCtx(); return; }
    var s = e.target.closest("[data-sug]"); if (s) { var vin = document.getElementById("va-in"); vin.value = SUG[+s.dataset.sug][1]; vin.dispatchEvent(new Event("input", { bubbles: true })); vin.focus(); }
  });

  /* "Add evidence" sits beside the upload button */
  var ev = document.createElement("button"); ev.type = "button"; ev.className = "vx-ev"; ev.id = "va-evidence";
  ev.setAttribute("aria-haspopup", "dialog"); ev.setAttribute("aria-label", "Add market evidence"); ev.title = "Add market evidence";
  ev.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h3l2-5 4 10 2-5h3"/></svg><span>Add evidence</span>';
  add.insertAdjacentElement("afterend", ev);
  ev.addEventListener("click", function () { openPicker(); });

  /* picker */
  function openPicker() {
    var tab = "signals", sel = {}, q = "", f = { loc: "", ver: "" }, open = {};
    ctx.forEach(function (c) { sel[c.id] = c; });
    var HINT = { signals: "Single observations from SavoScouts, such as a price rise or a stockout.", reports: "Findings from SavoScout investigations, built from many responses." };
    var bg = document.createElement("div"); bg.className = "vx-bg";
    bg.innerHTML = '<div class="vx-pick" role="dialog" aria-modal="true" aria-labelledby="vx-h">' +
      '<button type="button" class="vx-x" aria-label="Close">×</button>' +
      '<div class="vx-head"><h2 id="vx-h">Add Market Evidence</h2><p>Select relevant signals and reports to explore, compare and connect with the Verisavo Intelligence Assistant.</p></div>' +
      '<div class="vx-tabs" role="tablist"><button type="button" role="tab" data-tab="signals">Signals</button><button type="button" role="tab" data-tab="reports">Reports</button></div>' +
      '<p class="vx-hint" aria-live="polite"></p>' +
      '<label class="vx-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg><span class="vh">Search evidence</span><input type="search" placeholder="Search by market, product or location…" autocomplete="off"></label>' +
      '<ul class="vx-list" role="list"></ul>' +
      '<div class="vx-foot"><span class="vx-n"></span><button type="button" class="vx-clear">Clear</button><button type="button" class="vx-ok">Add selected evidence</button></div>' +
      '<p class="vx-note">Examples shown during early access.</p></div>';
    va.appendChild(bg);
    var ul = bg.querySelector(".vx-list"), inp = bg.querySelector("input"), ts = terms();
    function items() { return tab === "signals" ? SIGNALS : reports(); }
    function opts(sel_, label, vals, cur) { sel_.innerHTML = '<option value="">' + label + "</option>" + vals.map(function (v) { return '<option' + (v === cur ? " selected" : "") + ">" + esc(v) + "</option>"; }).join(""); sel_.classList.toggle("on", !!cur); }
    function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }).sort(); }
    function card(x, rel) {
      var on = !!sel[x.id], det = !!open[x.id], inv = x.inv && getInv(x.inv);
      var vt = x.vtext || VER[x.v];
      return '<li class="vx-card' + (on ? " on" : "") + '" data-id="' + x.id + '">' +
        '<div class="vx-row" data-pick="' + x.id + '"><button type="button" class="vx-sel" role="checkbox" aria-checked="' + on + '" aria-label="Select ' + esc(x.title) + '"></button><div>' +
        '<span class="vx-top"><span class="vx-k">' + esc(x.kind) + '</span><span class="vx-v v' + x.v + '">' + ICON[x.v] + esc(x.stat ? x.stat : VER[x.v]) + "</span>" + (rel ? '<span class="vx-rel">Relevant to your question</span>' : "") + (x.ex ? '<span class="vx-ex">Example</span>' : "") + "</span>" +
        '<span class="vx-t">' + esc(x.title) + "</span>" +
        '<span class="vx-m">' + PIN + esc(place(x)) + " · " + esc(x.src) + (x.d != null ? " · " + ago(x.d) : x.vtext ? " · " + esc(x.vtext) : "") + "</span>" +
        '<button type="button" class="vx-more" data-more="' + x.id + '" aria-expanded="' + det + '">' + (det ? "Hide details" : "View details") + ' <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg></button></div></div>' +
        (det ? '<dl class="vx-det"><div><dt>Source</dt><dd>' + esc(x.src) + '</dd></div><div><dt>Location</dt><dd>' + esc(place(x)) + "</dd></div>" +
          (x.d != null ? '<div><dt>Collected</dt><dd>' + ago(x.d).replace(/^./, function (c) { return c.toUpperCase(); }) + "</dd></div>" : "") +
          '<div><dt>Review status</dt><dd>' + esc(vt) + "</dd></div>" + (x.note ? "<p>" + esc(x.note) + "</p>" : "") +
          (inv ? '<button type="button" class="vx-open" data-inv="' + x.inv + '">' + (x.kind === "Investigation" ? "Open this investigation" : "From the investigation “" + esc(inv) + "”: open it") + "</button>" : "") + "</dl>" : "") + "</li>";
    }
    function draw() {
      var base = items();
      var shown = base.filter(function (x) {
        return (!q || (x.title + " " + x.where + " " + x.country + " " + x.kind + " " + x.src).toLowerCase().indexOf(q) > -1) &&
          (!f.loc || (x.country || "").indexOf(f.loc) > -1) && (!f.ver || VER[x.v] === f.ver);
      });
      var scored = shown.map(function (x, i) { return { x: x, s: score(x, ts), i: i }; }).sort(function (a, b) { return b.s - a.s || a.i - b.i; });
      var rel = scored.filter(function (r) { return r.s > 0; }), rest = scored.filter(function (r) { return r.s === 0; });
      ul.innerHTML = !shown.length ? '<li class="vx-none">No matching evidence found. Try a different search.</li>' :
        (rel.length && rest.length ? '<li class="vx-sec">Relevant to your question</li>' : "") + rel.map(function (r) { return card(r.x, true); }).join("") +
        (rel.length && rest.length ? '<li class="vx-sec">More evidence</li>' : "") + rest.map(function (r) { return card(r.x, false); }).join("");
      bg.querySelector(".vx-hint").textContent = HINT[tab];
      bg.querySelectorAll("[data-tab]").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false"); });
      var n = Object.keys(sel).length;
      bg.querySelector(".vx-n").textContent = n + (n === 1 ? " evidence item selected" : " evidence items selected");
      bg.querySelector(".vx-clear").disabled = !n;
      var ok = bg.querySelector(".vx-ok"); ok.textContent = n ? "Add selected evidence (" + n + ")" : "Add selected evidence"; ok.disabled = !n && !ctx.length;
    }
    function close() { bg.remove(); ev.focus(); }
    function toggle(id) { var x = items().filter(function (i) { return i.id === id; })[0]; if (sel[id]) delete sel[id]; else if (x) sel[id] = x; draw(); var c = ul.querySelector('[data-id="' + id + '"] .vx-sel'); if (c) c.focus(); }
    bg.addEventListener("click", function (e) {
      var t = e.target;
      if (t === bg || t.closest(".vx-x")) return close();
      var b;
      if ((b = t.closest("[data-tab]"))) { tab = b.dataset.tab; f = { loc: "", ver: "" }; draw(); return; }
      if ((b = t.closest("[data-more]"))) { open[b.dataset.more] = !open[b.dataset.more]; draw(); var m = ul.querySelector('[data-more="' + b.dataset.more + '"]'); if (m) m.focus(); return; }
      if ((b = t.closest("[data-inv]"))) { var h = "c-survey-" + b.dataset.inv; close(); if (window.vsInvestigations) window.vsInvestigations(h); return; }
      if ((b = t.closest("[data-pick]"))) { toggle(b.dataset.pick); return; }
      if (t.closest(".vx-clear")) { sel = {}; draw(); return; }
      if (t.closest(".vx-ok")) { ctx = Object.keys(sel).map(function (k) { return sel[k]; }); renderCtx(); close(); var vin = document.getElementById("va-in"); if (vin) vin.focus(); }
    });
    inp.addEventListener("input", function () { q = inp.value.trim().toLowerCase(); draw(); });
    bg.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
      if ((e.key === " " || e.key === "Enter") && e.target.classList.contains("vx-sel")) { e.preventDefault(); e.stopPropagation(); toggle(e.target.closest("[data-pick]").dataset.pick); }
    }, true);
    draw(); inp.focus();
  }

  /* when the question is sent, show the evidence it used */
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
