// Example answer in the Assistant: citations, what the answer rests on, and the next Intelligence Gap (sample data)
export default function init() {
/* >>> example answer v1 */
(function () {
  /* An example of how a Verisavo answer is designed to work: the answer, its citations, what it rests on
     (evidence, inferences, assumptions), what changed, and the next Intelligence Gap. Sample data, labelled as such.
     Investigate this gap opens Set up a task with the gap filled in. */
  var va = document.getElementById("va"), main = va && va.querySelector(".va-main");
  if (!va || !main || document.getElementById("vx")) return;

  var P = {
    logo: '<path d="M6 3.5h3.2l2.8 9.6 2.8-9.6H18L13.6 17h-3.2z"></path>',
    ev: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"></path>',
    inf: '<path d="M6 3a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM6 17a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM18 7a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM6 7v10M18 11c0 4-6 3-11 6.5"></path>',
    as: '<path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM8 21h8"></path>',
    chg: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"></path>',
    blt: '<path d="M5 4h14M5 12h14M5 20h14M5 4v16"></path>',
    users: '<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 4a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7zM20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.1a3.5 3.5 0 0 1 0 6.8"></path>',
    scen: '<path d="M3 17l5-6 4 3 7-9M14 5h5v5"></path>',
    cmp: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"></path>',
    x: '<path d="M6 6l12 12M18 6L6 18"></path>',
    back: '<path d="M15 6l-6 6 6 6"></path>'
  };
  var ic = function (k, c) { return '<svg class="xa-ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + P[k] + "</svg>"; };

  var GAP = "Why are kiosks running out: late deliveries, or distributors favouring other brands?";
  var EV = [
    { n: 1, text: "Your 1kg pack was out of stock in 17 of 26 kiosks checked. The rival 500g pack was in stock in 24.", src: "Ground-Level Intelligence · SavoScouts · 26 verified responses with photos · 1–3 Nov", badge: "Investigated" },
    { n: 2, text: "Deliveries to Dawanau distributors have averaged four days late since the October route closures.", src: "Distributor delivery records · Oct", badge: "Your data" },
    { n: 3, text: "A rival 500g pack has been listed about 12% cheaper at three Kano wholesalers since September.", src: "Wholesale price observations · 3 outlets · Sep" }
  ];
  var INF = [
    { text: "Late deliveries are the likely reason kiosks run out before they are restocked.", meta: "Links your delivery records [2] to kiosk stock [1] · not directly observed" },
    { text: "Price-sensitive shoppers are likely buying the rival pack where both are on the shelf.", meta: "Derived from price observations [3] and kiosk stock [1] · not directly observed" }
  ];
  var AS = [
    { text: "Your own shelf prices have stayed the same over the period.", meta: "Not yet confirmed. If prices rose, price could matter more than the evidence suggests." }
  ];
  var CHG = [
    { when: "3 Nov", title: "Main cause changed.", text: "Kiosk availability replaced the rival pack's price as the best-supported cause." },
    { when: "3 Nov", title: "Evidence base rose to Strong.", text: "26 verified SavoScout responses with shelf photos closed the kiosk availability gap." },
    { when: "1 Nov", title: "First answer.", text: "Two likely causes; kiosk availability flagged as an Intelligence Gap." }
  ];
  var BLT = [
    ["Question asked", "1 Nov"], ["4 sources connected", "Evidence base: Moderate"], ["Gap identified", "Kiosk availability unknown"],
    ["Investigated by SavoScouts", "26 of 30 responses verified · 3 Nov"], ["Understanding updated", "Availability now the main cause · Strong"], ["Next gap open", "Why kiosks are running out", true]
  ];
  var TABS = [["ev", "Evidence", EV.length], ["inf", "Inferences", INF.length], ["as", "Assumptions", AS.length], ["chg", "What changed"], ["blt", "How it was built"]];

  var css = document.createElement("style");
  css.textContent = [
    ".va-main.xa-on>.va-body,.va-main.xa-on>.va-dock{display:none!important}",
    "#vx{container-type:inline-size;position:relative;z-index:2;flex:1 1 auto;min-height:0;display:flex;background:#F7F9FC;border-top:1px solid #EEF1F6;font-family:var(--sans);color:#1F273F;animation:vxIn .22s ease-out}",
    "@keyframes vxIn{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){#vx,#vx *{animation:none!important;transition:none!important}}",
    "#vx .xa-ic{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#vx .xa-ic.s{width:15px;height:15px}",
    "#vx button{font-family:inherit;cursor:pointer}#vx button:focus-visible{outline:2px solid #4362B2;outline-offset:2px}",
    "#vx p,#vx h2,#vx h3{margin:0}",
    "#vx .xa-col{flex:1 1 auto;min-width:0;overflow-y:auto;padding:22px clamp(16px,3vw,40px) 40px}",
    "#vx .xa-in{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:14px}",
    "#vx .xa-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
    "#vx .xa-back{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:6px 8px 6px 2px;font:500 .875rem/1 var(--sans);color:#4A5368;border-radius:8px}#vx .xa-back:hover{color:#1F273F}",
    "#vx .xa-eg{margin-left:auto;font:600 .6875rem/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:#6A7285;background:#EEF1F6;padding:5px 9px;border-radius:999px}",
    "#vx .xa-q{align-self:flex-end;max-width:min(560px,92%);background:#E3EBF8;color:#1F273F;border-radius:18px 18px 4px 18px;padding:12px 16px;font:500 .97rem/1.5 var(--sans)}",
    "#vx .xa-qm{align-self:flex-end;font-size:.75rem;color:#8A93A6;margin-top:-8px}",
    "#vx .xa-first{background:#fff;border:1px solid #E6EBF2;border-radius:14px;padding:12px 14px;font-size:.84rem;color:#5B6478}",
    "#vx .xa-first-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}#vx .xa-first-h b{color:#1F273F;font-weight:600}",
    "#vx .xa-first p{margin-top:8px!important;font-size:.9rem;line-height:1.6;color:#3D4559}",
    "#vx .xa-lnk{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:4px 0;font:600 .8125rem/1.2 var(--sans);color:#3A5292}#vx .xa-lnk:hover{text-decoration:underline}",
    "#vx .xa-sp{flex:1}",
    "#vx .xa-done{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;border-radius:12px;background:#fff;border:1px solid #E6EBF2;font-size:.84rem;color:#4A5368}",
    "#vx .xa-done .xa-ok{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;background:#E7F4EE;color:#2E6B4F}#vx .xa-done b{color:#1F273F;font-weight:600}",
    "#vx .xa-card{background:#fff;border:1px solid #E3E7EF;border-radius:18px;padding:clamp(18px,2.4vw,26px);box-shadow:0 1px 2px rgba(31,39,63,.04)}",
    "#vx .xa-who{display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;margin-bottom:14px;font-size:.84rem;color:#6A7285}#vx .xa-who b{color:#1F273F;font-size:.94rem}",
    "#vx .xa-av{width:28px;height:28px;border-radius:8px;background:#1F273F;color:#fff;display:grid;place-items:center}#vx .xa-av svg{width:16px;height:16px;fill:#fff;stroke:none}",
    "#vx .xa-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}",
    "#vx .xa-tag{font-size:.78rem;padding:4px 10px;border-radius:999px;background:#F3F5F9;border:1px solid #E3E7EF;color:#2A3350;white-space:nowrap}",
    "#vx .xa-tag.good{background:#E3EBF8;border-color:#CCDDF1;color:#3A5292;font-weight:600}",
    "#vx .xa-lead{font-size:1rem;line-height:1.7;color:#2A3350}",
    "#vx .xa-cite{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;margin:0 2px;border-radius:6px;border:0;background:#E3EBF8;color:#3A5292;font:700 .72rem/1 var(--sans);vertical-align:2px}#vx .xa-cite:hover{background:#CCDDF1}",
    "#vx .xa-pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}",
    "#vx .xa-pill{display:inline-flex;align-items:center;gap:8px;font:500 .84rem/1 var(--sans);padding:8px 12px;border-radius:999px;border:1px solid #E3E7EF;background:#F7F9FC;color:#2A3350;min-height:38px}",
    "#vx .xa-pill:hover{border-color:#A8C6E8;background:#fff}",
    "#vx .xa-pill b{font-size:.75rem;min-width:21px;height:21px;border-radius:999px;display:inline-grid;place-items:center;padding:0 6px;background:#fff;border:1px solid #E3E7EF;color:#3A5292}",
    "#vx .xa-pill[aria-pressed=true]{background:#1F273F;border-color:#1F273F;color:#fff}#vx .xa-pill[aria-pressed=true] b{background:#3A4664;border-color:#3A4664;color:#fff}",
    "#vx .xa-gap{margin-top:16px;border-radius:14px;padding:16px 16px 16px 18px;background:#F3F7FD;border:1px solid #DCE6F5;display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}",
    "#vx .xa-gap-k{font:600 .6875rem/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#4362B2}",
    "#vx .xa-gap-t{flex:1 1 260px;font:600 .94rem/1.45 var(--sans);color:#1F273F}",
    "#vx .xa-go{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:0;border-radius:11px;background:#1F273F;color:#fff;font:600 .875rem/1 var(--sans);white-space:nowrap}#vx .xa-go:hover{background:#2C3656}",
    "#vx .xa-acts{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #EEF1F6}",
    "#vx .xa-ab{display:inline-flex;align-items:center;gap:7px;font:500 .84rem/1 var(--sans);padding:0 12px;height:40px;border-radius:10px;border:1px solid #E3E7EF;background:#fff;color:#2A3350;white-space:nowrap}",
    "#vx .xa-ab:hover{background:#F7F9FC;border-color:#CCD3E0}",
    "#vx .xa-ab[aria-disabled=true]{cursor:default;color:#8A93A6;background:#fff}#vx .xa-ab[aria-disabled=true]:hover{border-color:#E3E7EF}",
    "#vx .xa-ab em{font-style:normal;font-size:.6875rem;padding:3px 7px;border-radius:999px;background:#F0F3F8;color:#6A7285}",
    "#vx .xa-foot{font-size:.78rem;color:#8A93A6;text-align:center;margin-top:4px}",
    /* drawer */
    "#vx .xa-dr{flex:0 0 380px;min-width:0;display:flex;flex-direction:column;background:#fff;border-left:1px solid #E6EBF2}",
    "#vx .xa-dr[hidden]{display:none}",
    "#vx .xa-dr-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:16px 16px 0 20px}#vx .xa-dr-h h2{font:600 1rem/1.3 var(--sans)}",
    "#vx .xa-x{width:38px;height:38px;border:0;border-radius:9px;background:none;color:#6A7285;display:grid;place-items:center}#vx .xa-x:hover{background:#F3F5F9;color:#1F273F}",
    "#vx .xa-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 20px 4px}",
    "#vx .xa-sum div{background:#F7F9FC;border-radius:10px;padding:10px}#vx .xa-sum b{display:block;font:700 1rem/1.2 var(--sans);color:#1F273F}#vx .xa-sum span{font-size:.72rem;color:#6A7285}",
    "#vx .xa-meter{display:flex;gap:3px;margin:5px 0 3px}#vx .xa-meter i{flex:1;height:4px;border-radius:2px;background:#A8C6E8}",
    "#vx .xa-tabs{display:flex;gap:14px;padding:0 20px;border-bottom:1px solid #EEF1F6;overflow-x:auto;scrollbar-width:none}#vx .xa-tabs::-webkit-scrollbar{display:none}",
    "#vx .xa-tab{border:0;background:none;padding:12px 2px;font:500 .8125rem/1 var(--sans);color:#5B6478;border-bottom:2px solid transparent;white-space:nowrap}#vx .xa-tab:hover{color:#1F273F}",
    "#vx .xa-tab[aria-selected=true]{color:#1F273F;font-weight:600;border-bottom-color:#1F273F}",
    "#vx .xa-list{flex:1;overflow-y:auto;padding:6px 20px 24px}",
    "#vx .xa-it{display:flex;flex-direction:column;gap:8px;padding:14px;margin:0 -14px;border-radius:12px;transition:background .3s,box-shadow .3s}",
    "#vx .xa-it+.xa-it{border-top:1px solid #EEF1F6}#vx .xa-it.hl{background:#F1F6FD;box-shadow:0 0 0 1.5px #A8C6E8}",
    "#vx .xa-it p{font-size:.875rem;line-height:1.55;color:#2A3350}",
    "#vx .xa-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    "#vx .xa-num{font:700 .6875rem/1 var(--sans);color:#3A5292;background:#E3EBF8;border-radius:5px;padding:3px 6px}",
    "#vx .xa-lab{display:inline-block;font:600 .72rem/1 var(--sans);padding:4px 9px;border-radius:6px}",
    "#vx .l-ev{background:#E3EBF8;color:#3A5292}#vx .l-inf{background:#EEF0F4;color:#4A5268}#vx .l-as{background:#FDF1E2;color:#8A4F0E}",
    "#vx .xa-badge{font:700 .66rem/1 var(--sans);letter-spacing:.03em;color:#2E6B4F;background:#E7F4EE;padding:4px 7px;border-radius:5px}#vx .xa-badge.you{color:#3A5292;background:#E3EBF8}",
    "#vx .xa-meta{font-size:.75rem;line-height:1.4;color:#6F778B}",
    "#vx .xa-st{position:relative;padding:0 0 18px 26px}#vx .xa-st:before{content:\"\";position:absolute;left:5px;top:14px;bottom:-2px;width:1.5px;background:#E3E9F2}#vx .xa-st:last-child:before{display:none}",
    "#vx .xa-st i{position:absolute;left:0;top:4px;width:12px;height:12px;border-radius:50%;background:#A8C6E8}#vx .xa-st.open i{background:#fff;box-shadow:inset 0 0 0 2px #4362B2}",
    "#vx .xa-st b{display:block;font:600 .84rem/1.3 var(--sans)}#vx .xa-st span{font-size:.75rem;color:#6F778B}",
    "#vx .xa-scrim{display:none}",
    "@container (max-width:1000px){#vx .xa-dr{position:absolute;z-index:3;top:0;right:0;bottom:0;width:min(400px,100%);box-shadow:-24px 0 48px -30px rgba(31,39,63,.5)}",
    "#vx .xa-scrim{display:block;position:absolute;inset:0;z-index:2;background:rgba(20,28,40,.18);border:0}#vx .xa-scrim[hidden]{display:none}}",
    "@container (max-width:600px){#vx .xa-dr{width:100%}#vx .xa-acts .xa-sp{display:none}#vx .xa-go{width:100%;justify-content:center}}",
    /* entry points */
    "#va .xa-entry{display:inline-flex;align-items:center;gap:6px;margin-top:14px;border:0;background:none;padding:6px 4px;font:600 .875rem/1 var(--sans);color:#3A5292;cursor:pointer;border-radius:8px}#va .xa-entry:hover{text-decoration:underline}"
  ].join("");
  document.head.appendChild(css);

  var st = { tab: "ev", drawer: false, hl: 0, first: false };
  var root = null;

  function itemsHtml() {
    if (st.tab === "ev") return EV.map(function (e) {
      return '<div class="xa-it' + (st.hl === e.n ? " hl" : "") + '" data-ev="' + e.n + '"><div class="xa-row"><span class="xa-num">' + e.n + '</span><span class="xa-lab l-ev">Evidence</span></div><p>' + e.text + '</p><div class="xa-row xa-meta">' + (e.badge ? '<span class="xa-badge' + (e.badge === "Your data" ? " you" : "") + '">' + e.badge + "</span>" : "") + e.src + "</div></div>";
    }).join("");
    if (st.tab === "inf") return INF.map(function (x) { return '<div class="xa-it"><span class="xa-lab l-inf">Inference</span><p>' + x.text + '</p><div class="xa-meta">' + x.meta + "</div></div>"; }).join("");
    if (st.tab === "as") return AS.map(function (x) { return '<div class="xa-it"><span class="xa-lab l-as">Assumption</span><p>' + x.text + '</p><div class="xa-meta">' + x.meta + "</div></div>"; }).join("");
    if (st.tab === "chg") return CHG.map(function (x) { return '<div class="xa-it"><span class="xa-meta">' + x.when + "</span><p><b>" + x.title + "</b> " + x.text + "</p></div>"; }).join("");
    return '<div style="padding-top:14px">' + BLT.map(function (s) { return '<div class="xa-st' + (s[2] ? " open" : "") + '"><i></i><b>' + s[0] + "</b><span>" + s[1] + "</span></div>"; }).join("") + "</div>";
  }
  function drawerHtml() {
    return '<div class="xa-dr-h"><h2 id="xa-dr-t">What this answer rests on</h2><button type="button" class="xa-x" data-vx="close-dr" aria-label="Close panel">' + ic("x") + "</button></div>" +
      '<div class="xa-sum"><div><b>Strong</b><div class="xa-meter" aria-hidden="true"><i></i><i></i><i></i><i></i><i style="background:#E3EBF8"></i></div><span>Evidence base</span></div><div><b>' + EV.length + '</b><span>Evidence</span></div><div><b>1 closed</b><span>1 gap open</span></div></div>' +
      '<div class="xa-tabs" role="tablist" aria-label="What this answer rests on">' + TABS.map(function (t) { return '<button type="button" class="xa-tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (st.tab === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>" +
      '<div class="xa-list" role="tabpanel" aria-labelledby="xa-dr-t">' + itemsHtml() + "</div>";
  }
  function pill(k, label, icon, n) {
    return '<button type="button" class="xa-pill" data-tab="' + k + '" aria-pressed="' + (st.drawer && st.tab === k) + '">' + ic(icon, "s") + label + (n ? "<b>" + n + "</b>" : "") + "</button>";
  }
  function render() {
    if (!root) return;
    var col = root.querySelector(".xa-col"), keep = col ? col.scrollTop : 0;
    root.innerHTML =
      '<div class="xa-col"><div class="xa-in">' +
      '<div class="xa-bar"><button type="button" class="xa-back" data-vx="close">' + ic("back", "s") + 'Back to your conversation</button><span class="xa-eg">Example · sample data</span></div>' +
      '<p class="xa-q">Why have our detergent sales slowed in Kano over the last eight weeks?</p><p class="xa-qm">Asked 1 Nov</p>' +
      '<div class="xa-first"><div class="xa-first-h"><span><b>First answer</b> · 1 Nov · Evidence base: Moderate · 1 open gap on kiosk availability</span><span class="xa-sp"></span><button type="button" class="xa-lnk" data-vx="first" aria-expanded="' + st.first + '">' + (st.first ? "Hide" : "Show") + "</button></div>" +
      (st.first ? "<p>Two causes are most likely: a cheaper rival pack arriving at Kano wholesalers, and late deliveries to distributors around Dawanau. Whether your packs are reaching kiosk shelves is still unknown, and that could change the answer.</p>" : "") + "</div>" +
      '<div class="xa-done"><span class="xa-ok">' + ic("check", "s") + "</span><span><b>Investigation complete</b> · Kiosk stock in Dawanau and Kurmi Market · 26 of 30 responses verified · 3 Nov</span><span class=\"xa-sp\"></span><button type=\"button\" class=\"xa-lnk\" data-cite=\"1\">View evidence</button></div>" +
      '<article class="xa-card" aria-label="Verisavo answer">' +
      '<div class="xa-who"><span class="xa-av"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.3l3.7 11 3.7-11H19l-5.3 15h-3.4z"></path></svg></span><b>Verisavo</b><span>· Understanding updated with Ground-Level Intelligence</span></div>' +
      '<div class="xa-tags"><span class="xa-tag">Kano State, Nigeria</span><span class="xa-tag">Consumer goods</span><span class="xa-tag">Sep – Nov</span><span class="xa-tag good">Evidence base: Strong</span></div>' +
      '<p class="xa-lead">Availability now looks like the main cause. Your 1kg pack was missing from most kiosks checked in Dawanau and Kurmi Market<button type="button" class="xa-cite" data-cite="1" aria-label="Source 1">1</button>, while the rival pack was on nearly every shelf. Late deliveries to distributors are the likely reason<button type="button" class="xa-cite" data-cite="2" aria-label="Source 2">2</button>. The price gap still matters where both packs are stocked<button type="button" class="xa-cite" data-cite="3" aria-label="Source 3">3</button>, but it explains less of the slowdown than it first appeared.</p>' +
      '<div class="xa-pills">' + pill("ev", "Evidence", "ev", EV.length) + pill("inf", "Inferences", "inf", INF.length) + pill("as", "Assumptions", "as", AS.length) + pill("chg", "What changed", "chg") + pill("blt", "How it was built", "blt") + "</div>" +
      '<div class="xa-gap"><span class="xa-gap-k">Intelligence Gap</span><p class="xa-gap-t">' + GAP + '</p><button type="button" class="xa-go" data-vx="investigate">' + ic("users", "s") + "Investigate this gap</button></div>" +
      '<div class="xa-acts"><button type="button" class="xa-ab" data-tab="as">' + ic("as", "s") + "Assumptions</button>" +
      '<span class="xa-ab" aria-disabled="true">' + ic("scen", "s") + "Run scenario <em>Coming soon</em></span>" +
      '<span class="xa-ab" aria-disabled="true">' + ic("cmp", "s") + "Compare markets <em>Coming soon</em></span></div>" +
      "</article>" +
      '<p class="xa-foot">An illustrative example of how answers are designed to work. Places, figures and responses are invented.</p>' +
      "</div></div>" +
      '<button type="button" class="xa-scrim" data-vx="close-dr" aria-label="Close panel"' + (st.drawer ? "" : " hidden") + "></button>" +
      '<aside class="xa-dr" aria-label="What this answer rests on"' + (st.drawer ? "" : " hidden") + ">" + (st.drawer ? drawerHtml() : "") + "</aside>";
    var c2 = root.querySelector(".xa-col"); if (c2) c2.scrollTop = keep;
  }

  function closeOthers() {
    window.postMessage({ vs: "close-platform" }, "*");
    var bp = document.getElementById("va-brief"); main.classList.remove("brief-on"); if (bp) bp.hidden = true;
    [].forEach.call(main.querySelectorAll(":scope > .kb"), function (p) { p.remove(); }); main.classList.remove("kb-on");
    var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim"); if (app && app.classList.contains("va-drawer") && scrim) scrim.click();
  }
  function open() {
    closeOthers();
    if (!root) { root = document.createElement("div"); root.id = "vx"; root.setAttribute("role", "region"); root.setAttribute("aria-label", "Example answer"); main.appendChild(root); }
    st = { tab: "ev", drawer: main.clientWidth > 1000, hl: 0, first: false };
    main.classList.add("xa-on"); render();
    var b = root.querySelector(".xa-back"); if (b) b.focus();
  }
  function close() { if (root) { root.remove(); root = null; } main.classList.remove("xa-on"); }
  window.vsExampleAnswer = open;

  main.addEventListener("click", function (e) {
    if (!root || !root.contains(e.target)) return;
    var t = e.target, b;
    if ((b = t.closest("[data-cite]"))) { st.drawer = true; st.tab = "ev"; st.hl = +b.dataset.cite; render(); var it = root.querySelector('[data-ev="' + st.hl + '"]'); if (it) it.scrollIntoView({ block: "nearest" }); return; }
    if ((b = t.closest("[data-tab]"))) { var k = b.dataset.tab; if (b.classList.contains("xa-pill") && st.drawer && st.tab === k) st.drawer = false; else { st.drawer = true; st.tab = k; } st.hl = 0; render(); return; }
    if ((b = t.closest("[data-vx]"))) {
      var a = b.dataset.vx;
      if (a === "close") { close(); var i = document.getElementById("va-in"); if (i) i.focus(); }
      else if (a === "close-dr") { st.drawer = false; render(); }
      else if (a === "first") { st.first = !st.first; render(); }
      else if (a === "investigate") { close(); if (window.vsInvestigations) window.vsInvestigations("c-builder", GAP); }
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root && st.drawer) { st.drawer = false; render(); e.stopPropagation(); } }, true);
  /* any sidebar destination, a new question or closing the Assistant leaves the example */
  window.addEventListener("click", function (e) {
    if (!root || !e.target.closest) return;
    if (e.target.closest("#va-side button, #va-side a, #va-new2") && !e.target.closest("#va-side-x, #va-gear, .va-pop, .vsn-soon")) close();
  }, true);
  va.addEventListener("close", close);

  /* entry point: on answers that are not connected yet */
  var mk = function () { var b = document.createElement("button"); b.type = "button"; b.className = "xa-entry"; b.innerHTML = "See an example answer"; b.addEventListener("click", open); return b; };
  var thread = document.getElementById("va-thread");
  function tagCards() { if (!thread) return; [].forEach.call(thread.querySelectorAll(".va-msg-a .va-card"), function (c) { var s = c.querySelector(".va-state"); if (s && /not connected/i.test(s.textContent) && !c.querySelector(".xa-entry")) c.appendChild(mk()); }); }
  if (thread) { new MutationObserver(tagCards).observe(thread, { childList: true, subtree: true }); tagCards(); }
})();
/* <<< example answer v1 */
}
