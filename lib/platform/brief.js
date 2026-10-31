// SavoScouts: targeted investigation brief builder inside the Intelligence Assistant.
export default function init() {
/* >>> savoscouts brief */
(function () {
  /* Market investigations inside the Intelligence Assistant.
     Journey: Intelligence Gap (from a conversation) or Investigate market -> prepare the task with Verisavo's help -> review -> deploy.
     Verisavo's agent sends the task to eligible SavoScouts, who accept it on WhatsApp, respond and earn VeriPoints once verified.
     The client tracks the investigation, reviews every response, generates an AI briefing and continues the conversation. */
  var va = document.getElementById("va"), main = va && va.querySelector(".va-main"), btn = document.getElementById("va-scouts");
  if (!va || !main || !btn || document.getElementById("va-brief")) return;
  btn.classList.remove("va-soon"); btn.removeAttribute("aria-disabled"); btn.removeAttribute("aria-describedby");
  var tag = btn.querySelector(".va-soon-tag"); if (tag) tag.remove();
  var lbl = btn.querySelector("span"); if (lbl) lbl.textContent = "Investigations";

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var TYPES = ["Price", "Photo", "Yes or no", "Multiple choice", "Short answer", "Number", "Voice note"];
  var KINDS = {
    "Price check": { pts: 30, qs: [["Price of the product on the shelf", "Price"], ["Photo of the shelf showing the price", "Photo"], ["Is the product on promotion?", "Yes or no"]] },
    "Availability and shelf": { pts: 50, qs: [["Is our product in stock?", "Yes or no"], ["Which competing brands are on the shelf?", "Multiple choice", "Rival pack, Brand B, Brand C, Other"], ["Photo of the shelf", "Photo"], ["How many facings does our product have?", "Number"]] },
    "Outlet mapping": { pts: 30, qs: [["Type of outlet", "Multiple choice", "Shop, Kiosk, Supermarket, Market stall, Pharmacy"], ["Photo of the outlet front", "Photo"], ["Does it sell our category?", "Yes or no"]] },
    "Retailer interviews": { pts: 80, qs: [["Where does the shop buy this category?", "Short answer"], ["Has demand changed in the last month?", "Multiple choice", "Up, About the same, Down"], ["Retailer's view, in their words", "Voice note"]] },
    "Shopper feedback": { pts: 60, qs: [["Which brand did the shopper choose?", "Short answer"], ["Main reason for choosing it", "Multiple choice", "Price, Quality, Availability, Habit, Other"], ["Shopper's view, in their words", "Voice note"]] },
    "Open observation": { pts: 50, qs: [["What did you observe?", "Short answer"], ["Photo of what you observed", "Photo"]] }
  };
  var PLACES = ["Supermarkets", "Neighbourhood shops", "Kiosks", "Open markets", "Pharmacies", "Wholesalers", "Bus parks"];
  var CITIES = { Accra: "Ghana", Kumasi: "Ghana", Tamale: "Ghana", Lagos: "Nigeria", Ikeja: "Nigeria", Abuja: "Nigeria", Kano: "Nigeria", Ibadan: "Nigeria", "Port Harcourt": "Nigeria", Nairobi: "Kenya", Mombasa: "Kenya", Kisumu: "Kenya", Abidjan: "Côte d’Ivoire", Johannesburg: "South Africa", "Cape Town": "South Africa" };
  var STEPS = ["Objective", "Where", "Evidence", "Review"];
  var LIFE = ["Draft", "Deployed", "Gathering evidence", "Under review", "Completed"];

  /* ---------- example investigations (labelled Example in the interface) ---------- */
  var rng = function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  function makeResponses(o) {
    var r = rng(o.seed), out = [];
    for (var i = 0; i < o.n; i++) {
      var st = o.status(i), d = o.day + Math.floor(i * o.days / o.n), h = 8 + Math.floor(r() * 9), m = Math.floor(r() * 60);
      out.push({ id: "#" + "ABCDEFGHJKLMNPQRSTUVWXYZ"[i % 24] + (11 + ((i * 37 + o.seed) % 88)), area: o.areas[i % o.areas.length], place: o.places[Math.floor(r() * o.places.length)], when: d + " " + o.month + " · " + pad(h) + ":" + pad(m),
        status: st, why: o.why ? o.why(i) : "", answers: o.answers(i, r), note: o.note ? o.note(i) : "", gps: (o.lat + (r() - .5) * .04).toFixed(4) + ", " + (o.lng + (r() - .5) * .04).toFixed(4) });
    }
    return out;
  }
  var EXAMPLES = [
    { ref: "SC-2481", kind: "Availability and shelf", city: "Accra", country: "Ghana", areas: ["Madina", "Kaneshie"], need: 40, pts: 50, status: "Completed", deployed: "24 October 2026", due: "28 October 2026", sent: 64, accepted: 46, example: true,
      objective: "Are shops in Madina and Kaneshie running out of our noodles, or are shoppers switching to the cheaper rival pack?",
      from: "Why are our noodle sales slowing in Accra?",
      qs: [["Is our product in stock?", "Yes or no"], ["Which competing brands are on the shelf?", "Multiple choice"], ["Photo of the shelf", "Photo"], ["How many facings does our product have?", "Number"]],
      responses: makeResponses({ seed: 11, n: 40, day: 25, days: 4, month: "Oct", areas: ["Madina", "Kaneshie"], places: ["Kiosk", "Neighbourhood shop", "Supermarket", "Market stall"], lat: 5.62, lng: -.22,
        status: function (i) { return i === 7 || i === 23 ? "Could not confirm" : i === 15 ? "Contradicted" : "Verified"; },
        why: function (i) { return i === 7 ? "Location was outside the brief area" : i === 23 ? "Shelf photo was unclear" : i === 15 ? "Reported out of stock; two other SavoScouts found the product in the same shop that day" : ""; },
        answers: function (i, r) { return [i === 15 || i % 10 === 3 ? "No" : "Yes", i % 40 < 31 ? "Rival pack" + (r() > .6 ? ", Brand B" : "") : "Brand B", "Photo", String(1 + Math.floor(r() * 4))]; },
        note: function (i) { return i % 6 === 0 ? "Rival pack placed at eye level, ours on the lower shelf." : i % 9 === 0 ? "Shop owner said the rival is cheaper by about 2 cedis." : ""; } }),
      follow: { kind: "Shopper feedback", gap: "Would shoppers in Madina and Kaneshie switch back to our noodles at a lower price, and at what price?" } },
    { ref: "SC-2510", kind: "Outlet mapping", city: "Kumasi", country: "Ghana", areas: ["Adum", "Kejetia"], need: 30, pts: 30, status: "Under review", deployed: "27 October 2026", due: "1 November 2026", sent: 41, accepted: 33, example: true,
      objective: "Which outlets around Adum and Kejetia sell bread, and is the reported price rise visible on the shelf?",
      from: "What is happening to bakery prices in Ghana?",
      qs: [["Type of outlet", "Multiple choice"], ["Photo of the outlet front", "Photo"], ["Does it sell our category?", "Yes or no"]],
      responses: makeResponses({ seed: 31, n: 30, day: 28, days: 3, month: "Oct", areas: ["Adum", "Kejetia"], places: ["Kiosk", "Market stall", "Supermarket"], lat: 6.69, lng: -1.62,
        status: function (i) { return i > 20 ? "Awaiting review" : "Verified"; },
        answers: function (i, r) { return [["Shop", "Kiosk", "Market stall", "Supermarket"][Math.floor(r() * 4)], "Photo", i % 4 ? "Yes" : "No"]; } }),
      follow: { kind: "Price check", gap: "How much have bread prices changed in Kumasi outlets over the last month?" } },
    { ref: "SC-2502", kind: "Retailer interviews", city: "Nairobi", country: "Kenya", areas: ["Kasarani"], need: 30, pts: 80, status: "Gathering evidence", deployed: "26 October 2026", due: "6 November 2026", sent: 38, accepted: 26, delayed: "Responses are arriving more slowly than planned. Verisavo's agent has sent the task to 12 more SavoScouts nearby.", example: true,
      objective: "Where do small shops in Kasarani buy the 200ml pack, and has demand changed this month?",
      from: "Where should we launch the 200ml pack in Nairobi?",
      qs: [["Where does the shop buy this category?", "Short answer"], ["Has demand changed in the last month?", "Multiple choice"], ["Retailer's view, in their words", "Voice note"]],
      responses: makeResponses({ seed: 5, n: 14, day: 27, days: 5, month: "Oct", areas: ["Kasarani"], places: ["Kiosk", "Neighbourhood shop", "Wholesaler"], lat: -1.22, lng: 36.9,
        status: function (i) { return i > 10 ? "Awaiting review" : "Verified"; },
        answers: function (i, r) { return [i % 3 ? "Wholesaler on Thika Road" : "Distributor van", i % 4 === 0 ? "Up" : "About the same", "Voice note, 0:" + (20 + Math.floor(r() * 39))]; } }),
      follow: { kind: "Retailer interviews", gap: "How often do Kasarani shops reorder the 200ml pack, and in what quantities?" } },
    { ref: "SC-2394", kind: "Price check", city: "Lagos", country: "Nigeria", areas: ["Ikeja", "Yaba"], need: 60, pts: 30, status: "Completed", deployed: "8 October 2026", due: "14 October 2026", sent: 90, accepted: 71, example: true,
      objective: "What are shops in Ikeja and Yaba charging for the 500ml pack, and how does it compare with the competitor?",
      from: "Are we priced too high in Lagos?",
      qs: [["Price of the product on the shelf", "Price"], ["Photo of the shelf showing the price", "Photo"], ["Is the product on promotion?", "Yes or no"]],
      responses: makeResponses({ seed: 23, n: 60, day: 10, days: 4, month: "Oct", areas: ["Ikeja", "Yaba"], places: ["Kiosk", "Neighbourhood shop", "Supermarket"], lat: 6.56, lng: 3.36,
        status: function (i) { return i === 4 || i === 31 ? "Could not confirm" : i === 52 ? "Contradicted" : "Verified"; },
        why: function (i) { return i === 4 ? "Location was outside the brief area" : i === 31 ? "Price not readable in the photo" : i === 52 ? "Price differs from two other responses for the same shop" : ""; },
        answers: function (i, r) { return ["₦" + (1150 + Math.floor(r() * 11) * 25).toLocaleString("en-GB"), "Photo", (i % 6 === 1 && i % 4 !== 0) ? "Yes" : "No"]; } }),
      follow: { kind: "Retailer interviews", gap: "What margins do our two Lagos sub-distributors add to the 500ml pack?" } }
  ];

  /* ---------- storage ---------- */
  var mine = function () { try { return JSON.parse(sessionStorage.getItem("verisavo-investigations") || "[]"); } catch (e) { return []; } };
  var saveMine = function (list) { try { sessionStorage.setItem("verisavo-investigations", JSON.stringify(list)); } catch (e) {} };
  var all = function () { return mine().slice().reverse().concat(EXAMPLES); };
  var find = function (ref) { return all().filter(function (x) { return x.ref === ref; })[0]; };
  var fresh = function () { return { ref: "", step: 0, from: "", objective: "", kind: "", decision: "", country: "Ghana", city: "", areas: [], places: [], count: 40, qs: [], deadline: "", window: "Any time", verify: "Standard", points: 50, notes: "", tip: "" }; };
  var S = fresh();
  var V = { view: "home", id: "", tab: "overview", filter: "All", open: "", sel: [], sent: "", gen: {} };

  var panel = document.createElement("div"); panel.className = "va-brief"; panel.id = "va-brief"; panel.hidden = true;
  main.appendChild(panel);
  function open(view) {
    var scrim = document.getElementById("va-scrim"); if (scrim && !scrim.hidden) scrim.click();
    main.classList.add("brief-on"); panel.hidden = false; btn.setAttribute("aria-current", "page");
    V.view = view || (V.view === "new" ? "new" : "home"); render(); panel.scrollTop = 0;
  }
  function close() { main.classList.remove("brief-on"); panel.hidden = true; btn.removeAttribute("aria-current"); }
  btn.addEventListener("click", function () { open(); });
  ["va-new", "va-new2"].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener("click", close); });
  var recent = document.getElementById("va-recent"); if (recent) recent.addEventListener("click", function (e) { if (e.target.closest("button")) close(); });
  window.vsOpenBrief = open;
  var go = function (view, extra) { V.view = view; if (extra) for (var k in extra) V[k] = extra[k]; render(); panel.scrollTop = 0; };

  function ask(q) {
    var nb = document.getElementById("va-new"); if (nb) nb.click(); else close();
    var vin = document.getElementById("va-in"), f = document.getElementById("va-form");
    if (vin && f) { vin.value = q; vin.dispatchEvent(new Event("input", { bubbles: true })); setTimeout(function () { f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { cancelable: true })); }, 60); }
  }
  var recentQs = function () { return [].slice.call(document.querySelectorAll("#va-recent button")).map(function (b) { return (b.getAttribute("title") || b.textContent || "").trim(); }).filter(Boolean); };

  /* ---------- Verisavo's task preparation (rule-based in this preview) ---------- */
  function suggest(text) {
    var t = (text || "").toLowerCase(), out = {};
    Object.keys(CITIES).forEach(function (c) { if (!out.city && t.indexOf(c.toLowerCase()) > -1) { out.city = c; out.country = CITIES[c]; } });
    out.kind = /price|cost|charg|expensive|cheap|undercut|discount/.test(t) ? "Price check" : /stock|shelf|availab|running out|out of/.test(t) ? "Availability and shelf" : /where|launch|outlet|kiosk|which shops|map/.test(t) ? "Outlet mapping" : /shopper|customer|consumer|choose|prefer|why do people/.test(t) ? "Shopper feedback" : /why|demand|distribut|supply|reorder|buy from/.test(t) ? "Retailer interviews" : "Open observation";
    out.places = out.kind === "Outlet mapping" ? ["Kiosks", "Neighbourhood shops", "Open markets"] : out.kind === "Retailer interviews" ? ["Neighbourhood shops", "Wholesalers"] : ["Neighbourhood shops", "Kiosks", "Supermarkets"];
    return out;
  }
  function draftFromQuestion(q) {
    var s = suggest(q);
    return { from: q, gap: q.replace(/\?*$/, "?"), city: s.city || "", country: s.country, kind: s.kind, places: s.places, areas: [] };
  }
  function applyKind(k) { S.kind = k; S.points = KINDS[k].pts; S.qs = KINDS[k].qs.map(function (q) { return { text: q[0], type: q[1], opts: q[2] || "", req: true }; }); }
  function instructions() {
    var where = [S.areas.join(", "), S.city].filter(Boolean).join(", ") || "your area";
    return "Visit " + (S.places.length ? S.places.join(", ").toLowerCase() : "places") + " in " + where + ". At each place, answer the questions below and take the photos asked for. Your location and time are recorded automatically." + (S.window !== "Any time" ? " Visit in the " + S.window.toLowerCase() + "." : "") + (S.notes ? " " + S.notes : "");
  }
  function preflight() {
    var w = [];
    if (!S.deadline) w.push("No deadline set. SavoScouts respond faster with a clear date.");
    if (!S.qs.some(function (q) { return q.type === "Photo"; })) w.push("No photo question. Photos make responses easier to verify.");
    if (S.areas.length > 1 && S.count / S.areas.length < 10) w.push("Fewer than 10 responses per area may be too few to compare areas.");
    if (/\b(etc|stuff|things|some)\b/i.test(S.objective)) w.push("The objective is vague in places. Name the product, pack size or competitor if you can.");
    if (S.qs.length > 8) w.push("More than 8 questions makes each visit long, so fewer SavoScouts may accept.");
    return w;
  }

  /* ---------- small builders ---------- */
  var field = function (label, inner, hint) { return '<div class="vb-f"><label class="vb-l">' + label + "</label>" + inner + (hint ? '<p class="vb-hint">' + hint + "</p>" : "") + "</div>"; };
  var chip = function (txt, on, data) { return '<button type="button" class="vb-chip' + (on ? " on" : "") + '" ' + data + ' aria-pressed="' + !!on + '">' + esc(txt) + "</button>"; };
  var head = function (eb, h, p) { return '<header class="vb-head"><p class="vb-eb">' + eb + "</p><h2>" + h + "</h2>" + (p ? "<p>" + p + "</p>" : "") + "</header>"; };
  var counts = function (x) { var c = { v: 0, a: 0, c: 0, n: 0 }; (x.responses || []).forEach(function (r) { if (r.status === "Verified") c.v++; else if (r.status === "Awaiting review") c.a++; else if (r.status === "Contradicted") c.c++; else c.n++; }); return c; };
  var cls = function (st) { return st.toLowerCase().replace(/[^a-z]+/g, "-"); };
  var badge = function (st) { return '<span class="vs-badge vs-' + cls(st) + '">' + st + "</span>"; };
  var back = function (to, label) { return '<button type="button" class="vs-back" data-to="' + to + '"><span aria-hidden="true">←</span> ' + label + "</button>"; };
  var ex = function (x) { return x.example ? ' <i class="vs-ex">Example</i>' : ""; };
  var vp = function (n) { return n.toLocaleString("en-GB") + " VeriPoints"; };

  /* aggregate verified answers per question, so agreement and differences are visible */
  function agg(x) {
    var ver = x.responses.filter(function (r) { return r.status === "Verified"; });
    return x.qs.map(function (q, i) {
      var type = q[1], vals = ver.map(function (r) { return r.answers[i]; });
      if (type === "Photo" || type === "Voice note") return { q: q[0], type: type, n: vals.length };
      if (type === "Number" || type === "Price") {
        var nums = vals.map(function (v) { return +String(v).replace(/[^\d.]/g, ""); }).filter(function (v) { return !isNaN(v); }), pre = type === "Price" ? String(vals[0] || "").replace(/[\d,.\s]/g, "") : "";
        var mn = Math.min.apply(null, nums), mx = Math.max.apply(null, nums), av = nums.reduce(function (a, b) { return a + b; }, 0) / (nums.length || 1);
        return { q: q[0], type: type, n: nums.length, range: pre + mn.toLocaleString("en-GB") + " to " + pre + mx.toLocaleString("en-GB"), avg: pre + Math.round(av).toLocaleString("en-GB") };
      }
      var m = {}; vals.forEach(function (v) { String(v).split(/,\s*/).forEach(function (p) { if (p) m[p] = (m[p] || 0) + 1; }); });
      var top = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 5);
      return { q: q[0], type: type, n: vals.length, dist: top.map(function (k) { return [k, m[k]]; }) };
    });
  }

  /* ---------- views ---------- */
  function lifeline(st) {
    var k = LIFE.indexOf(st); if (k < 0) k = 1;
    return '<ol class="vs-life">' + LIFE.map(function (s, i) { return '<li class="' + (i < k ? "done" : i === k ? "now" : "") + '">' + s + "</li>"; }).join("") + "</ol>";
  }
  function home() {
    var list = all(), rq = recentQs();
    var card = function (x) {
      var c = counts(x), got = (x.responses || []).length, pct = Math.min(100, Math.round(got / x.need * 100)), on = V.sel.indexOf(x.ref) > -1, can = c.v > 0, draft = x.status === "Draft";
      return '<li class="vs-rep' + (on ? " sel" : "") + '"><div class="vs-rep-top">' + (can ? '<label class="vs-pick"><input type="checkbox" data-pick="' + x.ref + '"' + (on ? " checked" : "") + '><span class="vh">Select ' + x.ref + "</span></label>" : '<span class="vs-pick vs-pick-off" aria-hidden="true"></span>') +
        '<button type="button" class="vs-rep-main" ' + (draft ? 'data-edit="' + x.ref + '"' : 'data-inv="' + x.ref + '"') + '><span class="vs-rep-meta"><b>' + x.ref + "</b>" + esc(x.kind) + " · " + esc(x.city || "No location yet") + (x.areas && x.areas.length ? " · " + esc(x.areas.join(", ")) : "") + ex(x) + '</span><span class="vs-rep-h">' + esc(x.objective || "Untitled investigation") + "</span></button>" + badge(x.status) + "</div>" +
        (draft ? '<div class="vs-rep-row"><span>Not deployed yet</span><span class="vs-rep-acts"><button type="button" class="vb-btn vs-an" data-edit="' + x.ref + '">Continue preparing</button></span></div>' :
        '<div class="vs-prog"><span style="width:' + pct + '%"></span></div><div class="vs-rep-row"><span>' + got + " of " + x.need + " responses</span><span>" + c.v + " verified</span><span>" + (x.status === "Completed" ? "Completed " + esc(x.due) : x.due ? "Due " + esc(x.due) : "No deadline") + "</span>" +
        '<span class="vs-rep-acts"><button type="button" class="vs-link" data-inv="' + x.ref + '">Open</button>' + (can ? '<button type="button" class="vb-btn vs-an" data-brief="' + x.ref + '">AI briefing</button>' : "") + "</span></div>") + "</li>";
    };
    var gapsN = EX_GAPS().length + rq.length;
    return head("Market investigations", "Investigate what your questions could not answer", "When existing information is not enough, deploy SavoScouts to gather verified evidence from the ground, then bring it back into the conversation.") +
      '<div class="vs-start"><button type="button" class="vs-route" data-to="gaps"><span class="vs-route-ic" aria-hidden="true"><svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4M7.3 7.4a1.8 1.8 0 1 1 2.5 1.7c-.5.2-.8.6-.8 1.1M9 12h.01"/></svg></span><b>Investigate a gap</b><span>' + gapsN + (gapsN === 1 ? " Intelligence Gap" : " Intelligence Gaps") + " from your conversations</span></button>" +
      '<button type="button" class="vs-route" data-to="new"><span class="vs-route-ic" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M10 17s-5-4.6-5-8.4a5 5 0 0 1 10 0C15 12.4 10 17 10 17z"/><circle cx="10" cy="8.6" r="1.8"/></svg></span><b>Investigate market</b><span>Describe what you need to understand. Verisavo helps turn it into a task.</span></button></div>' +
      '<ol class="vs-how"><li><b>Prepare</b>Objective, place and evidence</li><li><b>Deploy</b>Verisavo\'s agent sends it to eligible SavoScouts</li><li><b>Verify</b>Responses are checked; SavoScouts earn VeriPoints</li><li><b>Brief</b>Verisavo explains what the evidence shows</li></ol>' +
      '<div class="vs-tools"><p class="vb-l">Your investigations</p></div><ul class="vs-list">' + list.map(card).join("") + "</ul>" +
      '<p class="vb-hint">Investigations marked Example are illustrative. Places and figures are invented.</p>' +
      (V.sel.length ? '<div class="vs-bar"><span>' + V.sel.length + (V.sel.length === 1 ? " investigation selected" : " investigations selected") + '</span><button type="button" class="vs-link vs-clear" id="vs-clear">Clear</button><button type="button" class="vb-btn vb-solid" id="vs-compare">' + (V.sel.length > 1 ? "Compare in the assistant" : "Discuss in the assistant") + ' <span aria-hidden="true">→</span></button></div>' : "");
  }
  function EX_GAPS() {
    var done = {}; all().forEach(function (x) { if (x.from) done[x.from] = x.ref; });
    return [
      { gap: "Which kiosks near the main bus parks stock the 200ml pack, and how often do they reorder?", from: "Where should we expand distribution in Mombasa?", why: "No source lists informal outlets or how often they restock.", city: "Mombasa", kind: "Outlet mapping" },
      { gap: "Are competitors in Ikeja cutting prices on the 1L pack, and by how much?", from: "Is a competitor undercutting us in Lagos?", why: "Online prices conflict with your distributor's report, and it could change your pricing.", city: "Ikeja", kind: "Price check" }
    ].filter(function (g) { return !done[g.from]; });
  }
  function gaps() {
    var rq = recentQs(), eg = EX_GAPS();
    var g = function (x, key, own) {
      return '<li class="vs-gap"><p class="vs-gap-from">From ' + (own ? "your conversation" : "an example conversation") + ' <q>' + esc(x.from) + '</q></p><p class="vs-gap-h">' + esc(x.gap) + "</p>" + (x.why ? '<p class="vs-gap-why"><b>Why it matters:</b> ' + esc(x.why) + "</p>" : "") +
        '<div class="vs-gap-row"><button type="button" class="vb-btn vb-solid vs-an" data-gap="' + key + '">Investigate this gap <span aria-hidden="true">→</span></button>' + (x.city ? '<span class="vs-muted">Suggested: ' + esc(x.kind) + " in " + esc(x.city) + "</span>" : "") + "</div></li>";
    };
    var items = rq.map(function (q, i) { return g(draftFromQuestion(q), "q" + i, true); }).concat(eg.map(function (x, i) { return g(x, "g" + i, false); }));
    return back("home", "Investigations") + head("Intelligence Gaps", "What your conversations could not answer", "When the evidence cannot answer something that could change your decision, Verisavo flags it as an Intelligence Gap. Investigating it turns the gap into a task for SavoScouts, with the context of your conversation already filled in.") +
      (items.length ? '<ul class="vs-list">' + items.join("") + "</ul>" : '<div class="vs-empty"><b>No open Intelligence Gaps</b><span>Gaps appear here when a conversation reaches the limits of the available evidence.</span></div>') +
      '<div class="vs-or"><span>Need something else?</span><button type="button" class="vs-link" data-to="new">Investigate market</button></div>';
  }
  function form() {
    var b = "";
    if (S.step === 0) b = '<div class="vb-card">' + (S.from ? '<p class="vb-from"><span>Intelligence Gap from your conversation</span><q>' + esc(S.from) + "</q>Verisavo filled in what it could from the conversation. Review and change anything.</p>" : "") +
      field("What do you need to understand or verify?", '<textarea id="vb-obj" rows="3" maxlength="500" placeholder="e.g. Are shops in Madina running out of our noodles, or are shoppers switching to a cheaper rival?">' + esc(S.objective) + "</textarea>",
        '<button type="button" class="vs-link vb-assist" id="vb-assist">Prepare with Verisavo</button> suggests the type of investigation, location and questions from what you write.') +
      (S.tip ? '<p class="vb-tip"><b>Verisavo suggests</b>' + S.tip + "</p>" : "") +
      field("Type of investigation", '<div class="vb-chips">' + Object.keys(KINDS).map(function (t) { return chip(t, S.kind === t, 'data-kind="' + t + '"'); }).join("") + "</div>") +
      field("Which decision will this inform?", '<div class="vb-chips">' + ["Pricing", "Distribution", "Market entry", "Product", "Competitor response", "Other"].map(function (d) { return chip(d, S.decision === d, 'data-dec="' + d + '"'); }).join("") + "</div>") + "</div>";
    if (S.step === 1) b = '<div class="vb-card">' +
      '<div class="vb-row2">' + field("Country", '<select id="vb-country">' + ["Ghana", "Nigeria", "Kenya", "Côte d’Ivoire", "South Africa", "Other"].map(function (c) { return "<option" + (S.country === c ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select>") +
      field("City", '<input id="vb-city" type="text" maxlength="60" placeholder="e.g. Accra" value="' + esc(S.city) + '">') + "</div>" +
      field("Areas or neighbourhoods", '<div class="vb-tags">' + S.areas.map(function (a, i) { return '<span class="vb-tag">' + esc(a) + '<button type="button" data-rm-area="' + i + '" aria-label="Remove ' + esc(a) + '">×</button></span>'; }).join("") + '<input id="vb-area" type="text" maxlength="40" placeholder="Type an area and press Enter"></div>', "Verisavo's agent sends the task to SavoScouts registered in these areas. Leave empty to cover the whole city.") +
      field("Where should SavoScouts go?", '<div class="vb-chips">' + PLACES.map(function (p) { return chip(p, S.places.indexOf(p) > -1, 'data-place="' + p + '"'); }).join("") + "</div>") +
      field("Coverage", '<div class="vb-range"><input id="vb-count" type="range" min="10" max="200" step="10" value="' + S.count + '"><output id="vb-count-o">' + S.count + " responses</output></div>", "One response is one place visited or one person spoken to. Several SavoScouts can report on the same area, so their evidence can be compared.") +
      '<div class="vb-row2">' + field("Complete by", '<input id="vb-date" type="date" value="' + esc(S.deadline) + '" min="' + minDate() + '">') +
      field("Visit times", '<div class="vb-chips">' + ["Any time", "Mornings", "Afternoons", "Evenings"].map(function (w) { return chip(w, S.window === w, 'data-win="' + w + '"'); }).join("") + "</div>") + "</div></div>";
    if (S.step === 2) b = '<div class="vb-split"><div class="vb-card">' +
      '<p class="vb-l">Recorded with every response</p><div class="vb-chips vb-lock"><span>GPS location</span><span>Time-stamp</span><span>SavoScout ID</span></div>' +
      '<p class="vb-l vb-mt">Intelligence questions and evidence</p><ol class="vb-qs">' + S.qs.map(function (q, i) {
        return '<li class="vb-q"><div class="vb-qh"><span class="vb-qn">' + (i + 1) + '</span><input type="text" data-q-text="' + i + '" maxlength="140" placeholder="Write the question" value="' + esc(q.text) + '">' +
          '<span class="vb-qa"><button type="button" data-q-up="' + i + '" aria-label="Move up"' + (i ? "" : " disabled") + '>↑</button><button type="button" data-q-down="' + i + '" aria-label="Move down"' + (i < S.qs.length - 1 ? "" : " disabled") + '>↓</button><button type="button" data-q-rm="' + i + '" aria-label="Remove question">×</button></span></div>' +
          '<div class="vb-qf"><select data-q-type="' + i + '" aria-label="Evidence type">' + TYPES.map(function (t) { return "<option" + (q.type === t ? " selected" : "") + ">" + t + "</option>"; }).join("") + "</select>" +
          (q.type === "Multiple choice" ? '<input type="text" data-q-opts="' + i + '" placeholder="Options, separated by commas" value="' + esc(q.opts) + '">' : "") +
          '<label class="vb-req"><input type="checkbox" data-q-req="' + i + '"' + (q.req ? " checked" : "") + "> Required</label></div></li>";
      }).join("") + '</ol><div class="vb-addrow"><button type="button" class="vb-add" id="vb-addq">+ Add a question</button><span class="vb-quick">Add evidence: ' + ["Photo", "Price", "Voice note"].map(function (t) { return '<button type="button" class="vs-link" data-addq="' + t + '">' + t + "</button>"; }).join(" ") + "</span></div>" +
      field("Additional instructions (optional)", '<textarea id="vb-notes" rows="2" maxlength="400" placeholder="Business context, product names, pack sizes, what to avoid">' + esc(S.notes) + "</textarea>") + "</div>" +
      '<aside class="vb-prev" aria-label="Preview"><p class="vb-l">What SavoScouts receive on WhatsApp</p><div class="vb-phone" id="vb-phone"></div></aside></div>';
    if (S.step === 3) {
      var warn = preflight();
      b = '<div class="vb-card">' +
        '<dl class="vb-sum">' + row("Objective", esc(S.objective) + (S.decision ? '<span class="vb-sub">Informs: ' + esc(S.decision) + "</span>" : "") + (S.from ? '<span class="vb-sub">From the conversation: ' + esc(S.from) + "</span>" : ""), 0) +
        row("Where", esc([S.areas.join(", "), S.city, S.country].filter(Boolean).join(" · ")) + '<span class="vb-sub">' + esc(S.places.join(", ")) + " · " + S.count + " responses · " + (S.deadline ? "by " + esc(fmt(S.deadline)) : "no deadline") + "</span>", 1) +
        row("Evidence", S.qs.length + (S.qs.length === 1 ? " question" : " questions") + '<span class="vb-sub">' + S.qs.map(function (q) { return esc(q.text) + " (" + q.type.toLowerCase() + ")"; }).join(" · ") + "</span>", 2) + "</dl>" +
        '<div class="vb-instr"><p class="vb-l">Instructions SavoScouts will receive</p><p>' + esc(instructions()) + "</p></div>" +
        (warn.length ? '<div class="vb-warn"><p class="vb-l">Before you deploy</p><ul>' + warn.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>" : '<p class="vb-ok">Verisavo found nothing missing. This task is ready to deploy.</p>') +
        '<div class="vb-row2">' + field("VeriPoints per verified response", '<div class="vb-chips">' + [25, 30, 50, 60, 80, 100].map(function (p) { return chip(String(p), S.points === p, 'data-pts="' + p + '"'); }).join("") + "</div>", "SavoScouts earn VeriPoints only when a response passes verification.") +
        field("Verification", '<div class="vb-chips">' + ["Standard", "Enhanced"].map(function (v) { return chip(v, S.verify === v, 'data-ver="' + v + '"'); }).join("") + "</div>", S.verify === "Enhanced" ? "Location, time and photo checks, plus a second SavoScout confirms a sample." : "Location, time and photo checks on every response.") + "</div>" +
        '<p class="vb-consent"><span aria-hidden="true">✓</span>SavoScouts ask permission before photographing people or interviewing anyone. This is always on.</p>' +
        '<p class="vb-note">When you deploy, Verisavo\'s agent sends this task on WhatsApp to eligible SavoScouts, based on where they are registered and their record. Your investigation and its results stay private to your organisation.</p></div>';
    }
    var sub = '<ol class="vb-steps">' + STEPS.map(function (s, i) { return '<li class="' + (i < S.step ? "done" : i === S.step ? "now" : "") + '"><span>' + (i + 1) + "</span>" + s + "</li>"; }).join("") + "</ol>";
    return back(S.from ? "gaps" : "home", S.from ? "Intelligence Gaps" : "Investigations") + head(S.from ? "Investigate this gap" : "Investigate market", S.step === 3 ? "Review and deploy" : S.from ? "Prepare the investigation" : "What do you need to understand?", "") + sub + b +
      '<p class="vb-err" id="vb-err" role="alert"></p><div class="vb-nav"><button type="button" class="vb-btn" id="vb-prev">Back</button><span class="vb-nav-r"><button type="button" class="vs-link" id="vb-draft">Save as draft</button><button type="button" class="vb-btn vb-solid" id="vb-next">' + (S.step === 3 ? "Deploy to SavoScouts" : "Continue") + ' <span aria-hidden="true">→</span></button></span></div>';
  }
  var row = function (k, v, st) { return '<div class="vb-sum-r"><dt>' + k + "</dt><dd>" + v + '</dd><button type="button" class="vb-edit" data-step="' + st + '">Edit</button></div>'; };
  function sent() {
    var x = find(V.sent) || {};
    var where = (x.areas && x.areas.length ? x.areas.join(", ") + ", " : "") + (x.city || "");
    var steps = [["Investigation deployed", x.ref + " · " + (x.need || 0) + " responses needed"], ["Verisavo's agent is matching SavoScouts", "Registered in " + where + ", with a good record on similar tasks"], ["Task sent on WhatsApp", "With the objective, instructions, evidence needed, deadline and " + vp(x.pts || 0)], ["Gathering evidence", "Responses appear in the investigation as they arrive"]];
    return '<div class="vb-done"><span class="vb-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<h3 id="vb-done-h" tabindex="-1">Deployed to SavoScouts</h3><p>You can follow every response, then generate a briefing once verified evidence arrives.</p>' +
      '<ol class="vb-time">' + steps.map(function (s, i) { return '<li style="--d:' + (i * .7) + 's"><b>' + s[0] + "</b><span>" + esc(s[1]) + "</span></li>"; }).join("") + "</ol>" +
      '<p class="vb-hint">Preview: in this demo, tasks are not yet sent to real SavoScouts.</p>' +
      '<div class="vb-acts"><button type="button" class="vb-btn" data-to="home">All investigations</button><button type="button" class="vb-btn vb-solid" data-inv="' + x.ref + '">Open investigation <span aria-hidden="true">→</span></button></div></div>';
  }
  function detail() {
    var x = find(V.id); if (!x) { V.view = "home"; return home(); }
    var c = counts(x), got = (x.responses || []).length, pct = Math.min(100, Math.round(got / x.need * 100));
    var top = back("home", "Investigations") + '<header class="vb-head vs-dh"><p class="vb-eb">' + x.ref + " · " + esc(x.kind) + ex(x) + "</p><h2>" + esc(x.objective) + "</h2>" +
      '<p class="vs-sub">' + esc(x.city) + (x.areas.length ? " · " + esc(x.areas.join(", ")) : "") + " · Deployed " + esc(x.deployed) + (x.due ? " · " + (x.status === "Completed" ? "Completed " : "Due ") + esc(x.due) : "") + "</p>" +
      (x.from ? '<p class="vs-sub">From the conversation <q>' + esc(x.from) + '</q> · <button type="button" class="vs-link" data-return="' + x.ref + '">Return to the conversation</button></p>' : "") + "</header>" +
      lifeline(x.status) + (x.delayed ? '<p class="vs-alert">' + esc(x.delayed) + "</p>" : "") +
      '<div class="vs-funnel"><div><b>' + x.sent + "</b><span>SavoScouts sent the task</span></div><div><b>" + x.accepted + "</b><span>Accepted</span></div><div><b>" + got + "<small>/" + x.need + "</small></b><span>Responses submitted</span></div><div><b>" + c.v + "</b><span>Verified</span></div><div><b>" + vp(c.v * x.pts).replace(" VeriPoints", "") + "</b><span>VeriPoints earned</span></div></div>" +
      '<div class="vs-prog vs-prog-l"><span style="width:' + pct + '%"></span></div>' +
      '<div class="vs-tabs" role="tablist">' + [["overview", "Evidence overview"], ["responses", "Responses " + got], ["briefing", "AI briefing"]].map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (V.tab === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>";
    if (V.tab === "briefing") return top + briefing(x, c);
    if (!got) return top + '<div class="vs-empty"><b>Waiting for the first responses</b><span>Verisavo\'s agent has sent the task to eligible SavoScouts. Responses appear here as they are submitted and checked.</span></div>';
    if (V.tab === "overview") return top + overview(x, c);
    var F = ["All", "Verified", "Awaiting review", "Contradicted", "Could not confirm"], rs = x.responses.filter(function (r) { return V.filter === "All" || r.status === V.filter; });
    var n = function (f) { return f === "All" ? got : f === "Verified" ? c.v : f === "Awaiting review" ? c.a : f === "Contradicted" ? c.c : c.n; };
    return top + '<div class="vs-rtools"><div class="vb-chips">' + F.filter(function (f) { return f === "All" || n(f); }).map(function (f) { return chip(f + " " + n(f), V.filter === f, 'data-filter="' + f + '"'); }).join("") + '</div><button type="button" class="vs-link" data-csv="' + x.ref + '">Download CSV</button></div>' +
      '<ul class="vs-resp">' + rs.map(function (r) {
        var o = V.open === r.id;
        return '<li id="vs-r-' + esc(r.id.slice(1)) + '" class="' + (o ? "open" : "") + '"><button type="button" class="vs-rrow" data-resp="' + esc(r.id) + '" aria-expanded="' + o + '"><span class="vs-rid">' + r.id + '</span><span class="vs-rplace">' + esc(r.place) + "<small>" + esc(r.area) + '</small></span><span class="vs-rwhen">' + esc(r.when) + "</span>" + badge(r.status) + '<span class="vs-rpts">' + (r.status === "Verified" ? "+" + x.pts : "–") + "</span></button>" +
          (o ? '<div class="vs-rbody"><dl>' + x.qs.map(function (q, i) { return "<div><dt>" + esc(q[0]) + "</dt><dd>" + (q[1] === "Photo" ? '<span class="vs-photo" aria-label="Photo">Photo</span>' : esc(r.answers[i] || "–")) + "</dd></div>"; }).join("") + "</dl>" +
            (r.note ? '<p class="vs-note"><b>Observation:</b> ' + esc(r.note) + "</p>" : "") +
            '<p class="vs-geo">GPS ' + r.gps + " · " + esc(r.when) + (r.why ? ' · <b>' + esc(r.status) + ":</b> " + esc(r.why) : r.status === "Verified" ? " · Location, time and photo checked" : " · Checks in progress") + "</p></div>" : "") + "</li>";
      }).join("") + "</ul>";
  }
  function overview(x, c) {
    var A = agg(x);
    return '<p class="vb-hint">Summary of ' + c.v + " verified responses. Responses awaiting review, contradicted or not confirmed are left out until resolved.</p>" +
      '<div class="vs-agg">' + A.map(function (a) {
        var body = a.dist ? '<ul class="vs-dist">' + a.dist.map(function (d) { var p = Math.round(d[1] / (a.n || 1) * 100); return '<li><span>' + esc(d[0]) + '</span><i><em style="width:' + p + '%"></em></i><b>' + d[1] + "</b></li>"; }).join("") + "</ul>" :
          a.range ? '<p class="vs-range">' + esc(a.range) + "<span>Average " + esc(a.avg) + "</span></p>" : '<p class="vs-range">' + a.n + "<span>" + (a.type === "Photo" ? "photos collected" : "voice notes collected") + "</span></p>";
        return '<section class="vs-aggc"><h4>' + esc(a.q) + "</h4>" + body + "</section>";
      }).join("") + "</div>" +
      (c.c || c.n ? '<div class="vs-conflict"><p class="vb-l">Contradicted or not confirmed</p><ul>' + x.responses.filter(function (r) { return r.status === "Contradicted" || r.status === "Could not confirm"; }).map(function (r) { return '<li><button type="button" class="vs-link" data-jump="' + esc(r.id) + '">' + r.id + "</button> " + badge(r.status) + " " + esc(r.why) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div class="vb-acts vs-bacts"><button type="button" class="vb-btn vb-solid" data-tab="briefing">Generate AI briefing <span aria-hidden="true">→</span></button><button type="button" class="vb-btn" data-tab="responses">Review responses</button></div>';
  }
  function briefing(x, c) {
    if (!c.v) return '<div class="vs-empty"><b>No verified evidence yet</b><span>You can generate a briefing once the first responses are verified.</span></div>';
    var st = V.gen[x.ref];
    if (!st) return '<div class="vs-gen"><span class="vs-vmark" aria-hidden="true">V</span><div><b>Generate an AI briefing</b><span>Verisavo analyses the ' + c.v + " verified responses" + (x.status !== "Completed" ? " received so far" : "") + ", compares them, and explains what they mean for your question.</span></div>" +
      '<button type="button" class="vb-btn vb-solid" id="vs-gen" data-ref="' + x.ref + '">Generate AI briefing</button></div>';
    if (st === "working") return '<div class="vs-gen vs-working"><span class="vs-vmark" aria-hidden="true">V</span><div><b>Analysing ' + c.v + ' verified responses</b><span>Comparing answers, checking agreement and linking each finding to its evidence…</span></div><span class="va-typing" aria-hidden="true"><i></i><i></i><i></i></span></div>';
    var A = agg(x), ver = x.responses.filter(function (r) { return r.status === "Verified"; }), refs = function (n, s) { return ver.slice(s || 0, (s || 0) + n).map(function (r) { return '<button type="button" class="vs-ref" data-jump="' + esc(r.id) + '">' + r.id + "</button>"; }).join(""); };
    var conf = c.v >= x.need * .8 ? "High" : c.v >= x.need * .4 ? "Medium" : "Low";
    var f = findings(x, A, c);
    var sec = function (h, body) { return '<section class="vs-bsec"><h4>' + h + "</h4>" + body + "</section>"; };
    return '<article class="vs-briefing"><header><span class="vs-vmark" aria-hidden="true">V</span><div><b>Investigation briefing</b><span>From ' + c.v + " verified responses · " + (x.status === "Completed" ? "final" : "early briefing, " + (x.need - (x.responses || []).length) + " responses still to come") + ' · Confidence: <em class="vs-conf vs-conf-' + conf.toLowerCase() + '">' + conf + "</em></span></div></header>" +
      sec("Objective", "<p>" + esc(x.objective) + "</p>") +
      sec("Key findings", "<ul>" + f.key.map(function (k, i) { return "<li>" + esc(k) + ' <span class="vs-refs">' + refs(3, i * 3) + "</span></li>"; }).join("") + "</ul>") +
      sec("Patterns across responses", "<p>" + esc(f.pattern) + "</p>") +
      sec("Agreement and contradictions", "<p>" + esc(f.agree) + "</p>") +
      sec("What it means for the business", "<p>" + esc(f.means) + "</p>") +
      sec("Still unknown", "<p>" + esc(x.follow.gap) + "</p>") +
      sec("Recommended next step", "<p>" + esc(f.next) + "</p>") +
      '<p class="vs-mem">Verified findings from this investigation are designed to be added to your Market Memory, so later questions can draw on them.</p>' +
      '<div class="vb-acts vs-bacts"><button type="button" class="vb-btn vb-solid" data-ask-inv="' + x.ref + '">Ask a follow-up <span aria-hidden="true">→</span></button><button type="button" class="vb-btn" data-followup="' + x.ref + '">Investigate what is still unknown</button><button type="button" class="vs-link" id="vs-regen" data-ref="' + x.ref + '">Regenerate</button></div></article>' +
      '<p class="vb-hint">Illustrative briefing built from the example responses. Each finding links to the responses that support it.</p>';
  }
  function findings(x, A, c) {
    var excl = c.c + c.n;
    var agree = (excl ? excl + (excl === 1 ? " response was" : " responses were") + " left out: " + x.responses.filter(function (r) { return r.why; }).map(function (r) { return r.id + " (" + r.why.charAt(0).toLowerCase() + r.why.slice(1) + ")"; }).join("; ") + ". " : "No contradictions between SavoScouts. ") + (c.a ? c.a + " responses are still being checked." : "The remaining responses agree closely.");
    if (x.kind === "Availability and shelf") {
      var inS = A[0].dist.filter(function (d) { return d[0] === "Yes"; })[0] || ["", 0], rival = A[1].dist.filter(function (d) { return d[0] === "Rival pack"; })[0] || ["", 0];
      return { key: [rival[1] + " of " + A[1].n + " verified shops stocked the rival pack next to yours.", inS[1] + " of " + A[0].n + " shops had your product in stock; stockouts were limited to " + (A[0].n - inS[1]) + " shops.", "Your product had " + A[3].avg + " facings on average (" + A[3].range + ")."],
        pattern: "Several SavoScouts noted the rival at eye level with yours lower down, and shop owners mentioned the rival's lower price. The pattern is the same in Madina and Kaneshie.",
        agree: agree, means: "The fall in sales is better explained by shoppers switching to a cheaper rival than by a supply problem. A supply fix alone is unlikely to recover sales.",
        next: "Test price sensitivity with a shopper feedback investigation in the same shops before changing price." };
    }
    if (x.kind === "Price check") {
      var promo = A[2].dist.filter(function (d) { return d[0] === "Yes"; })[0] || ["", 0];
      return { key: ["Shelf prices ranged from " + A[0].range + ", averaging " + A[0].avg + ".", "Promotions were seen in " + promo[1] + " of " + A[2].n + " shops.", A[1].n + " shelf photos support the recorded prices."],
        pattern: "Higher prices clustered in shops supplied by two sub-distributors; Ikeja and Yaba otherwise looked similar.",
        agree: agree, means: "Your price is not uniformly high. The gap is concentrated in part of the distribution chain, which points to a margin issue rather than a list price issue.",
        next: "Speak to the two sub-distributors about their margins before changing your list price." };
    }
    if (x.kind === "Outlet mapping") {
      var top = A[0].dist[0] || ["", 0], sells = A[2].dist.filter(function (d) { return d[0] === "Yes"; })[0] || ["", 0];
      return { key: [A[0].n + " outlets mapped so far; the most common type is " + top[0].toLowerCase() + " (" + top[1] + ").", sells[1] + " of " + A[2].n + " sell bread.", A[1].n + " outlet photos collected."],
        pattern: "Market stalls and kiosks dominate around Kejetia; supermarkets appear mainly in Adum.",
        agree: agree, means: "There is a dense informal network for bread around Kejetia. The reported price rise still needs to be checked on the shelf.",
        next: "Run a price check in the mapped outlets that sell bread." };
    }
    var wh = A[0].dist[0] || ["", 0], up = (A[1].dist.filter(function (d) { return d[0] === "Up"; })[0] || ["", 0]);
    return { key: [wh[1] + " of " + A[0].n + " verified retailers buy from " + wh[0].toLowerCase() + ".", up[1] + " retailers said demand is up this month; most said it is about the same.", A[2].n + " voice notes give retailers' views in their own words."],
      pattern: "Wholesalers on Thika Road are the main route into Kasarani shops; distributor vans serve a minority.",
      agree: agree, means: "Early evidence points to wholesalers as the place to start a 200ml launch in Kasarani.",
      next: "Wait for the remaining responses, then compare reorder frequency across wholesalers." };
  }
  var minDate = function () { return new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10); };
  var fmt = function (v) { try { return new Date(v + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return v; } };

  var busy = false;
  function render() { if (busy) return; busy = true; try { draw(); } finally { busy = false; } }
  function draw() {
    var html = V.view === "gaps" ? gaps() : V.view === "new" ? form() : V.view === "sent" ? sent() : V.view === "detail" ? detail() : home();
    panel.innerHTML = '<div class="vb-in">' + html + "</div>";
    if (V.view === "new" && S.step === 2) phone();
  }
  function phone() {
    var ph = document.getElementById("vb-phone"); if (!ph) return;
    var qs = S.qs.filter(function (q) { return q.text.trim(); });
    ph.innerHTML = '<p class="vb-ph-top"><b>Verisavo</b><span>SavoScouts</span></p><div class="vb-ph-msg"><p class="vb-ph-t">New task near you · ' + vp(S.points) + "</p><p>" + esc(S.objective || "Your objective appears here.") + '</p><p class="vb-ph-meta">' + esc([S.areas.join(", "), S.city].filter(Boolean).join(", ") || "Location") + (S.deadline ? " · by " + esc(fmt(S.deadline)) : "") + "</p></div>" +
      (qs.length ? qs.map(function (q, i) { return '<div class="vb-ph-q"><span>' + (i + 1) + ". " + esc(q.text) + (q.req ? " *" : "") + "</span><em>" + (q.type === "Multiple choice" && q.opts ? esc(q.opts) : q.type) + "</em></div>"; }).join("") : '<div class="vb-ph-q"><span>Your questions appear here.</span></div>') +
      '<div class="vb-ph-q vb-ph-auto"><span>Location and time-stamp</span><em>Recorded automatically</em></div><div class="vb-ph-btns"><span>Accept</span><span>Not now</span></div>';
  }
  function check() {
    if (S.step === 0 && S.objective.trim().length < 10) return "Describe what you need to understand in a sentence or two.";
    if (S.step === 0 && !S.kind) return "Choose a type of investigation, or use Prepare with Verisavo.";
    if (S.step === 1 && !S.city.trim()) return "Add the city where SavoScouts should work.";
    if (S.step === 1 && !S.places.length) return "Choose at least one type of place.";
    if (S.step === 2 && !S.qs.some(function (q) { return q.text.trim(); })) return "Add at least one question for SavoScouts.";
    if (S.step === 2 && S.qs.some(function (q) { return q.type === "Multiple choice" && q.text.trim() && !q.opts.trim(); })) return "Add the options for each multiple-choice question.";
    return "";
  }
  function assist() {
    if (S.objective.trim().length < 10) { document.getElementById("vb-err").textContent = "Write a sentence about what you need to understand first."; return; }
    var s = suggest(S.objective), done = [];
    if (s.kind !== S.kind) { applyKind(s.kind); done.push((/^[aeiou]/i.test(s.kind) ? "an " : "a ") + s.kind.toLowerCase() + " investigation with " + S.qs.length + " starter questions"); }
    if (s.city && !S.city) { S.city = s.city; S.country = s.country; done.push("the location " + s.city); }
    if (!S.places.length) { S.places = s.places.slice(); done.push("places to visit: " + s.places.join(", ").toLowerCase()); }
    S.tip = done.length ? "Set up " + esc(done.join(", ")) + ". You can change all of this in the next steps." : "Your task already looks complete. Continue to check where and what evidence to collect.";
    render();
  }
  function startFrom(g) {
    S = fresh(); S.from = g.from || ""; S.objective = g.gap || ""; S.city = g.city || ""; if (g.country) S.country = g.country; else if (CITIES[S.city]) S.country = CITIES[S.city];
    S.areas = (g.areas || []).slice(); S.places = (g.places || suggest(g.gap || g.from).places).slice();
    applyKind(g.kind || suggest(S.objective).kind);
    S.tip = g.from ? "From your conversation: " + esc(S.kind.toLowerCase()) + (S.city ? " in " + esc(S.city) : "") + ", with " + S.qs.length + " starter questions." : "";
    go("new");
  }
  function save(status) {
    var list = mine(), ref = S.ref || "SC-" + String(2600 + list.length * 7 + Math.floor(Math.random() * 5));
    var rec = { ref: ref, kind: S.kind || "Open observation", city: S.city, country: S.country, areas: S.areas, need: S.count, pts: S.points, status: status, deployed: status === "Draft" ? "" : fmt(new Date().toISOString().slice(0, 10)), due: S.deadline ? fmt(S.deadline) : "", sent: 0, accepted: 0,
      objective: S.objective, from: S.from, qs: S.qs.map(function (q) { return [q.text, q.type]; }), responses: [], follow: { kind: "Open observation", gap: "" }, draft: status === "Draft" ? JSON.parse(JSON.stringify(S)) : null };
    list = list.filter(function (x) { return x.ref !== ref; }); list.push(rec); saveMine(list);
    return ref;
  }
  function csv(x) {
    var rows = [["Response", "Area", "Place", "When", "Status", "Reason", "Observation", "GPS", "VeriPoints"].concat(x.qs.map(function (q) { return q[0]; }))];
    x.responses.forEach(function (r) { rows.push([r.id, r.area, r.place, r.when, r.status, r.why, r.note, r.gps, r.status === "Verified" ? x.pts : 0].concat(r.answers)); });
    var text = rows.map(function (r) { return r.map(function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","); }).join("\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = x.ref + "-responses.csv"; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function generate(ref) { V.gen[ref] = "working"; render(); setTimeout(function () { V.gen[ref] = "done"; if (V.view === "detail" && V.id === ref) render(); }, 1400); }

  /* ---------- Pathway A: Investigate this gap, straight from a conversation ---------- */
  var thread = document.getElementById("va-thread");
  if (thread) {
    var addGap = function (li) {
      if (!li.classList || !li.classList.contains("va-msg-a") || li.querySelector(".va-typing") || li.querySelector(".va-gapact")) return;
      var u = li.previousElementSibling; if (!u || !u.classList.contains("va-msg-u")) return;
      var q = (u.firstChild && u.firstChild.nodeType === 3 ? u.firstChild.textContent : u.textContent).trim();
      if (/^(Brief me on|Compare) SavoScouts/.test(q) || /^About investigation/.test(q)) return;
      var card = li.querySelector(".va-card") || li, act = document.createElement("div"); act.className = "va-gapact";
      act.innerHTML = '<p><b>Intelligence Gap</b>When existing information cannot answer this, SavoScouts can gather evidence from the ground.</p><button type="button" class="va-gapbtn">Investigate this gap <span aria-hidden="true">→</span></button>';
      act.querySelector("button").addEventListener("click", function () { open("new"); startFrom(draftFromQuestion(q)); });
      card.appendChild(act);
    };
    new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, addGap); }); }).observe(thread, { childList: true });
  }

  /* ---------- events ---------- */
  panel.addEventListener("click", function (e) {
    var t = e.target, b;
    if ((b = t.closest("[data-to]"))) { if (b.dataset.to === "new") S = fresh(); go(b.dataset.to, { sel: [] }); return; }
    if ((b = t.closest("[data-inv]"))) { go("detail", { id: b.dataset.inv, tab: "overview", filter: "All", open: "" }); return; }
    if ((b = t.closest("[data-brief]"))) { go("detail", { id: b.dataset.brief, tab: "briefing" }); return; }
    if ((b = t.closest("[data-edit]"))) { var dr = find(b.dataset.edit); S = dr && dr.draft ? dr.draft : fresh(); S.ref = b.dataset.edit; go("new"); return; }
    if ((b = t.closest("[data-tab]"))) { V.tab = b.dataset.tab; render(); return; }
    if ((b = t.closest("[data-filter]"))) { V.filter = b.dataset.filter; render(); return; }
    if ((b = t.closest("[data-resp]"))) { V.open = V.open === b.dataset.resp ? "" : b.dataset.resp; render(); return; }
    if ((b = t.closest("[data-jump]"))) { V.tab = "responses"; V.filter = "All"; V.open = b.dataset.jump; render(); var el = document.getElementById("vs-r-" + b.dataset.jump.slice(1)); if (el) el.scrollIntoView({ block: "center" }); return; }
    if ((b = t.closest("[data-csv]"))) { csv(find(b.dataset.csv)); return; }
    if (t.closest("#vs-gen") || t.closest("#vs-regen")) { generate((t.closest("#vs-gen") || t.closest("#vs-regen")).dataset.ref); return; }
    if ((b = t.closest("[data-gap]"))) { var k = b.dataset.gap; startFrom(k[0] === "q" ? draftFromQuestion(recentQs()[+k.slice(1)]) : EX_GAPS()[+k.slice(1)]); return; }
    if ((b = t.closest("[data-ask-inv]"))) { var x = find(b.dataset.askInv); ask("About investigation " + x.ref + " (" + x.kind + ", " + x.city + "): what did our SavoScouts find, how reliable is it, and does it change our plans?"); return; }
    if ((b = t.closest("[data-return]"))) { var r0 = find(b.dataset.return); ask((r0.from || "") + " — now including the verified SavoScouts evidence from " + r0.ref + "."); return; }
    if ((b = t.closest("[data-followup]"))) { var y = find(b.dataset.followup); startFrom({ gap: y.follow.gap, from: y.from, city: y.city, areas: y.areas, kind: y.follow.kind }); return; }
    if (t.closest("#vs-compare")) { var xs = V.sel.map(find); V.sel = []; ask(xs.length > 1 ? "Compare investigations " + xs.map(function (z) { return z.ref; }).join(" and ") + ": what do the verified SavoScouts responses show together, where do they disagree, and what is still unknown?" : "About investigation " + xs[0].ref + ": what did our SavoScouts find, and what is still unknown?"); return; }
    if (t.closest("#vs-clear")) { V.sel = []; render(); return; }
    if (t.closest("#vb-assist")) { assist(); return; }
    if ((b = t.closest("[data-step]"))) { S.step = +b.dataset.step; render(); panel.scrollTop = 0; return; }
    if ((b = t.closest("[data-kind]"))) { applyKind(b.dataset.kind); render(); return; }
    if ((b = t.closest("[data-dec]"))) { S.decision = S.decision === b.dataset.dec ? "" : b.dataset.dec; render(); return; }
    if ((b = t.closest("[data-place]"))) { var p = b.dataset.place, i = S.places.indexOf(p); if (i > -1) S.places.splice(i, 1); else S.places.push(p); render(); return; }
    if ((b = t.closest("[data-rm-area]"))) { S.areas.splice(+b.dataset.rmArea, 1); render(); var a = document.getElementById("vb-area"); if (a) a.focus(); return; }
    if ((b = t.closest("[data-win]"))) { S.window = b.dataset.win; render(); return; }
    if ((b = t.closest("[data-pts]"))) { S.points = +b.dataset.pts; render(); return; }
    if ((b = t.closest("[data-ver]"))) { S.verify = b.dataset.ver; render(); return; }
    if ((b = t.closest("[data-addq]"))) { var ty = b.dataset.addq; S.qs.push({ text: ty === "Photo" ? "Photo of " : ty === "Price" ? "Price of " : "In their own words: ", type: ty, opts: "", req: true }); render(); var qi = panel.querySelectorAll("[data-q-text]"); if (qi.length) { var last = qi[qi.length - 1]; last.focus(); last.setSelectionRange(last.value.length, last.value.length); } return; }
    if ((b = t.closest("[data-q-rm]"))) { S.qs.splice(+b.dataset.qRm, 1); render(); return; }
    if ((b = t.closest("[data-q-up]"))) { var u = +b.dataset.qUp, w = S.qs[u]; S.qs[u] = S.qs[u - 1]; S.qs[u - 1] = w; render(); return; }
    if ((b = t.closest("[data-q-down]"))) { var d = +b.dataset.qDown, z2 = S.qs[d]; S.qs[d] = S.qs[d + 1]; S.qs[d + 1] = z2; render(); return; }
    if (t.closest("#vb-addq")) { S.qs.push({ text: "", type: "Short answer", opts: "", req: true }); render(); var ins = panel.querySelectorAll("[data-q-text]"); if (ins.length) ins[ins.length - 1].focus(); return; }
    if (t.closest("#vb-draft")) { if (S.objective.trim().length < 3) { document.getElementById("vb-err").textContent = "Add an objective before saving a draft."; return; } save("Draft"); S = fresh(); go("home"); return; }
    if (t.closest("#vb-prev")) { if (S.step) { S.step--; render(); panel.scrollTop = 0; } else go(S.from ? "gaps" : "home"); return; }
    if (t.closest("#vb-next")) {
      var err = check(); if (err) { document.getElementById("vb-err").textContent = err; return; }
      if (S.step === 2) S.qs = S.qs.filter(function (q) { return q.text.trim(); });
      if (S.step < 3) { S.step++; S.tip = ""; render(); panel.scrollTop = 0; return; }
      var ref = save("Deployed"); S = fresh(); go("sent", { sent: ref }); var h = document.getElementById("vb-done-h"); if (h) h.focus();
    }
  });
  panel.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "vb-obj") S.objective = t.value;
    else if (t.id === "vb-city") S.city = t.value;
    else if (t.id === "vb-count") { S.count = +t.value; document.getElementById("vb-count-o").textContent = S.count + " responses"; }
    else if (t.id === "vb-date") S.deadline = t.value;
    else if (t.id === "vb-notes") S.notes = t.value;
    else if (t.dataset.qText != null) { S.qs[+t.dataset.qText].text = t.value; phone(); }
    else if (t.dataset.qOpts != null) { S.qs[+t.dataset.qOpts].opts = t.value; phone(); }
    var er = document.getElementById("vb-err"); if (er) er.textContent = "";
  });
  panel.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset.pick) { var k = V.sel.indexOf(t.dataset.pick); if (t.checked && k < 0) V.sel.push(t.dataset.pick); if (!t.checked && k > -1) V.sel.splice(k, 1); render(); return; }
    if (t.id === "vb-country") S.country = t.value;
    if (t.dataset.qType != null) { S.qs[+t.dataset.qType].type = t.value; render(); }
    if (t.dataset.qReq != null) { S.qs[+t.dataset.qReq].req = t.checked; phone(); }
    if (t.id === "vb-area" && t.value.trim()) { var v = t.value.trim(); t.value = ""; if (S.areas.indexOf(v) < 0) { S.areas.push(v); setTimeout(function () { if (V.view === "new" && S.step === 1) render(); }, 0); } }
  });
  panel.addEventListener("keydown", function (e) {
    if (e.target.id === "vb-area" && e.key === "Enter") { e.preventDefault(); var v = e.target.value.trim(); e.target.value = ""; if (v && S.areas.indexOf(v) < 0) S.areas.push(v); render(); var a = document.getElementById("vb-area"); if (a) a.focus(); }
  });
})();
/* <<< savoscouts brief */
}
