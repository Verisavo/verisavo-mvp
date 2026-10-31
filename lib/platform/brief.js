// SavoScouts: targeted investigation brief builder inside the Intelligence Assistant.
export default function init() {
/* >>> savoscouts brief */
(function () {
  var va = document.getElementById("va"), main = va && va.querySelector(".va-main"), btn = document.getElementById("va-scouts");
  if (!va || !main || !btn || document.getElementById("va-brief")) return;
  /* the sidebar item is live: no "Coming soon" */
  btn.classList.remove("va-soon"); btn.removeAttribute("aria-disabled"); btn.removeAttribute("aria-describedby");
  var tag = btn.querySelector(".va-soon-tag"); if (tag) tag.remove();

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var TYPES = ["Price", "Photo", "Yes or no", "Multiple choice", "Short answer", "Number", "Voice note"];
  var TEMPLATES = {
    "Price check": [["Price of the product on the shelf", "Price"], ["Photo of the shelf showing the price", "Photo"], ["Is the product on promotion?", "Yes or no"]],
    "Shelf and stock": [["Is our product in stock?", "Yes or no"], ["Which competing brands are on the shelf?", "Multiple choice", "Brand A, Brand B, Brand C, Other"], ["Photo of the shelf", "Photo"], ["How many facings does our product have?", "Number"]],
    "Outlet mapping": [["Type of outlet", "Multiple choice", "Shop, Kiosk, Supermarket, Market stall, Pharmacy"], ["Photo of the outlet front", "Photo"], ["Does it sell our category?", "Yes or no"]],
    "Retailer interviews": [["Where does the shop buy this category?", "Short answer"], ["Has demand changed in the last month?", "Multiple choice", "Up, About the same, Down"], ["Retailer's view, in their words", "Voice note"]],
    "Shopper feedback": [["Which brand did the shopper choose?", "Short answer"], ["Main reason for choosing it", "Multiple choice", "Price, Quality, Availability, Habit, Other"], ["Shopper's view, in their words", "Voice note"]],
    "Custom": [["", "Short answer"]]
  };
  var PLACES = ["Supermarkets", "Neighbourhood shops", "Kiosks", "Open markets", "Pharmacies", "Wholesalers", "Bus parks"];
  var S;
  var fresh = function () { return { step: 0, objective: "", template: "", decision: "", country: "Ghana", city: "", areas: [], places: [], count: 40, qs: [], deadline: "", window: "Any time", verify: "Standard", notes: "", ref: "" }; };
  S = fresh();
  var STEPS = ["Objective", "Locations", "Form", "Standards", "Review"];
  /* SavoScouts home: your briefs and finished reports, which can be analysed with the assistant */
  var V = { view: "home", sel: [], open: "" };
  var REPORTS = [
    { ref: "SC-2481", kind: "Shelf and stock", place: "Accra · Madina, Kaneshie", status: "Completed", date: "28 October 2026", visits: "40 of 40", passed: "38", photos: "112",
      head: "31 of 40 shops stocked the rival pack next to yours. Only 4 had run out of your stock.",
      finds: ["The rival pack sat at eye level in 27 shops; yours was lower or behind it in 19.", "Your shelf price was 12 to 18% higher than the rival's in most shops.", "Stockouts were limited to 4 kiosks near the Kaneshie market."] },
    { ref: "SC-2394", kind: "Price check", place: "Lagos · Mushin, Yaba", status: "Completed", date: "14 October 2026", visits: "60 of 60", passed: "57", photos: "171",
      head: "Shelf prices for the 500ml pack ranged from ₦1,150 to ₦1,400 across 60 shops.",
      finds: ["Prices were highest in shops supplied through two sub-distributors.", "Promotions were seen in 9 shops, all in Yaba.", "3 visits failed the location check and were left out."] },
    { ref: "SC-2502", kind: "Retailer interviews", place: "Nairobi · Kasarani", status: "In progress", date: "Due 6 November 2026", visits: "22 of 30" }
  ];
  var mine = function () { try { return JSON.parse(sessionStorage.getItem("verisavo-briefs") || "[]"); } catch (e) { return []; } };

  var panel = document.createElement("div"); panel.className = "va-brief"; panel.id = "va-brief"; panel.hidden = true;
  main.appendChild(panel);

  function open() {
    var scrim = document.getElementById("va-scrim"); if (scrim && !scrim.hidden) scrim.click();
    main.classList.add("brief-on"); panel.hidden = false; btn.setAttribute("aria-current", "page"); if (!S.ref && !S.step && !S.objective) V.view = "home"; render(); panel.scrollTop = 0;
  }
  function close() { main.classList.remove("brief-on"); panel.hidden = true; btn.removeAttribute("aria-current"); }
  btn.addEventListener("click", open);
  ["va-new", "va-new2"].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener("click", close); });
  var recent = document.getElementById("va-recent"); if (recent) recent.addEventListener("click", function (e) { if (e.target.closest("button")) close(); });
  window.vsOpenBrief = open;

  var field = function (label, inner, hint) { return '<div class="vb-f"><label class="vb-l">' + label + "</label>" + inner + (hint ? '<p class="vb-hint">' + hint + "</p>" : "") + "</div>"; };
  var chip = function (txt, on, data) { return '<button type="button" class="vb-chip' + (on ? " on" : "") + '" ' + data + ' aria-pressed="' + !!on + '">' + esc(txt) + "</button>"; };

  function body() {
    if (S.step === 0) return '<div class="vb-card">' +
      field("What do you need to find out?", '<textarea id="vb-obj" rows="3" maxlength="500" placeholder="e.g. Are shops in Madina running out of our noodles, or are shoppers switching to a cheaper rival?">' + esc(S.objective) + "</textarea>", "Describe the gap in plain words. This becomes the brief SavoScouts read.") +
      field("Start from a template", '<div class="vb-chips">' + Object.keys(TEMPLATES).map(function (t) { return chip(t, S.template === t, 'data-tpl="' + t + '"'); }).join("") + "</div>", "Templates fill in the form for you. You can change every question in step 3.") +
      field("Which decision does this support?", '<div class="vb-chips">' + ["Pricing", "Distribution", "Market entry", "Product", "Competitor response", "Other"].map(function (d) { return chip(d, S.decision === d, 'data-dec="' + d + '"'); }).join("") + "</div>") + "</div>";
    if (S.step === 1) return '<div class="vb-card">' +
      '<div class="vb-row2">' + field("Country", '<select id="vb-country">' + ["Ghana", "Nigeria", "Kenya", "Côte d’Ivoire", "South Africa", "Other"].map(function (c) { return "<option" + (S.country === c ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select>") +
      field("City", '<input id="vb-city" type="text" maxlength="60" placeholder="e.g. Accra" value="' + esc(S.city) + '">') + "</div>" +
      field("Areas or neighbourhoods", '<div class="vb-tags">' + S.areas.map(function (a, i) { return '<span class="vb-tag">' + esc(a) + '<button type="button" data-rm-area="' + i + '" aria-label="Remove ' + esc(a) + '">×</button></span>'; }).join("") + '<input id="vb-area" type="text" maxlength="40" placeholder="Type an area and press Enter"></div>', "Leave empty to cover the whole city.") +
      field("Types of place to visit", '<div class="vb-chips">' + PLACES.map(function (p) { return chip(p, S.places.indexOf(p) > -1, 'data-place="' + p + '"'); }).join("") + "</div>") +
      field("How many places?", '<div class="vb-range"><input id="vb-count" type="range" min="10" max="200" step="10" value="' + S.count + '"><output id="vb-count-o">' + S.count + " places</output></div>", "More places give a firmer answer and take longer.") + "</div>";
    if (S.step === 2) return '<div class="vb-split"><div class="vb-card">' +
      '<p class="vb-l">Always captured</p><div class="vb-chips vb-lock"><span>GPS location</span><span>Time-stamp</span><span>Photo of the place</span></div>' +
      '<p class="vb-l vb-mt">Questions for SavoScouts</p><ol class="vb-qs">' + S.qs.map(function (q, i) {
        return '<li class="vb-q"><div class="vb-qh"><span class="vb-qn">' + (i + 1) + '</span><input type="text" data-q-text="' + i + '" maxlength="140" placeholder="Write the question" value="' + esc(q.text) + '">' +
          '<span class="vb-qa"><button type="button" data-q-up="' + i + '" aria-label="Move up"' + (i ? "" : " disabled") + '>↑</button><button type="button" data-q-down="' + i + '" aria-label="Move down"' + (i < S.qs.length - 1 ? "" : " disabled") + '>↓</button><button type="button" data-q-rm="' + i + '" aria-label="Remove question">×</button></span></div>' +
          '<div class="vb-qf"><select data-q-type="' + i + '">' + TYPES.map(function (t) { return "<option" + (q.type === t ? " selected" : "") + ">" + t + "</option>"; }).join("") + "</select>" +
          (q.type === "Multiple choice" ? '<input type="text" data-q-opts="' + i + '" placeholder="Options, separated by commas" value="' + esc(q.opts) + '">' : "") +
          '<label class="vb-req"><input type="checkbox" data-q-req="' + i + '"' + (q.req ? " checked" : "") + "> Required</label></div></li>";
      }).join("") + '</ol><button type="button" class="vb-add" id="vb-addq">+ Add a question</button></div>' +
      '<aside class="vb-prev" aria-label="Preview"><p class="vb-l">How SavoScouts see it</p><div class="vb-phone" id="vb-phone"></div></aside></div>';
    if (S.step === 3) return '<div class="vb-card">' +
      '<div class="vb-row2">' + field("Results needed by", '<input id="vb-date" type="date" value="' + esc(S.deadline) + '" min="' + minDate() + '">') +
      field("When should visits happen?", '<div class="vb-chips">' + ["Any time", "Mornings", "Afternoons", "Evenings"].map(function (w) { return chip(w, S.window === w, 'data-win="' + w + '"'); }).join("") + "</div>") + "</div>" +
      field("Verification", '<div class="vb-radios">' + [["Standard", "Location, time-stamp and photo checks on every visit."], ["Enhanced", "Standard checks, plus a second SavoScout confirms a sample of visits."]].map(function (v) { return '<button type="button" class="vb-radio' + (S.verify === v[0] ? " on" : "") + '" data-ver="' + v[0] + '" aria-pressed="' + (S.verify === v[0]) + '"><b>' + v[0] + "</b><span>" + v[1] + "</span></button>"; }).join("") + "</div>") +
      '<p class="vb-consent"><span aria-hidden="true">✓</span>SavoScouts ask permission before photographing people or interviewing anyone. This is always on.</p>' +
      field("Notes for SavoScouts (optional)", '<textarea id="vb-notes" rows="2" maxlength="400" placeholder="Anything that helps, such as product names, pack sizes or what to avoid">' + esc(S.notes) + "</textarea>") + "</div>";
    if (S.step === 4) {
      var row = function (k, v, st) { return '<div class="vb-sum-r"><dt>' + k + "</dt><dd>" + v + '</dd><button type="button" class="vb-edit" data-go="' + st + '">Edit</button></div>'; };
      return '<div class="vb-card"><dl class="vb-sum">' +
        row("Objective", esc(S.objective) + (S.decision ? '<span class="vb-sub">Supports: ' + esc(S.decision) + "</span>" : ""), 0) +
        row("Where", esc([S.city, S.country].filter(Boolean).join(", ")) + (S.areas.length ? '<span class="vb-sub">' + esc(S.areas.join(", ")) + "</span>" : "") + '<span class="vb-sub">' + S.count + " places · " + esc(S.places.join(", ")) + "</span>", 1) +
        row("Form", S.qs.length + (S.qs.length === 1 ? " question" : " questions") + '<span class="vb-sub">' + S.qs.map(function (q) { return esc(q.text); }).join(" · ") + "</span>", 2) +
        row("Standards", esc(S.verify) + " verification · " + esc(S.window.toLowerCase()) + (S.deadline ? '<span class="vb-sub">Results needed by ' + esc(fmt(S.deadline)) + "</span>" : ""), 3) +
        '</dl><p class="vb-note">Our team reviews every brief and confirms scope, timing and cost with you before any SavoScouts are briefed. Your brief and its results stay private to your organisation.</p></div>';
    }
    return "";
  }
  function done() {
    var steps = [["Brief submitted", "Just now", true], ["Reviewed by our team", "Scope, timing and cost confirmed with you", false], ["SavoScouts briefed", "Visits begin in the areas you chose", false], ["Findings arrive in Verisavo", "As checked Ground-Level Intelligence, linked to your question", false]];
    return '<div class="vb-done"><span class="vb-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<h3 id="vb-done-h" tabindex="-1">Brief submitted</h3><p>Reference <b>' + S.ref + '</b>. We will be in touch to confirm the details before any work starts.</p>' +
      '<ol class="vb-time">' + steps.map(function (s) { return '<li class="' + (s[2] ? "on" : "") + '"><b>' + s[0] + "</b><span>" + s[1] + "</span></li>"; }).join("") + "</ol>" +
      '<div class="vb-acts"><button type="button" class="vb-btn" id="vb-again">Start another brief</button><button type="button" class="vb-btn vb-solid" id="vb-home">See your investigations</button></div></div>';
  }
  var busy = false;
  function render() {
    if (busy) return; busy = true;
    try { draw(); } finally { busy = false; }
  }
  function home() {
    var mineList = mine().slice().reverse();
    var card = function (r) {
      var done = r.status === "Completed", on = V.sel.indexOf(r.ref) > -1, open = V.open === r.ref;
      return '<li class="vs-rep' + (on ? " sel" : "") + '">' +
        '<div class="vs-rep-top">' + (done ? '<label class="vs-pick"><input type="checkbox" data-pick="' + r.ref + '"' + (on ? " checked" : "") + '><span class="vh">Select ' + r.ref + "</span></label>" : '<span class="vs-pick vs-pick-off" aria-hidden="true"></span>') +
        '<div class="vs-rep-main"><p class="vs-rep-meta"><span>' + r.ref + "</span>" + esc(r.kind) + " · " + esc(r.place) + '</p><p class="vs-rep-h">' + (r.head ? esc(r.head) : "Visits are under way. Results appear here when the investigation is complete.") + "</p></div>" +
        '<span class="vs-badge' + (done ? "" : " vs-wip") + '">' + r.status + "</span></div>" +
        '<div class="vs-rep-row"><span>' + r.visits + " visits</span><span>" + esc(r.date) + "</span>" +
        (done ? '<span class="vs-rep-acts"><button type="button" class="vs-link" data-view-rep="' + r.ref + '" aria-expanded="' + open + '">' + (open ? "Hide report" : "View report") + '</button><button type="button" class="vb-btn vs-an" data-analyse="' + r.ref + '">Analyse with Verisavo</button></span>' : '<span class="vs-rep-acts vs-muted">Analysis available when complete</span>') + "</div>" +
        (open ? '<div class="vs-detail"><div class="vs-kpis"><div><b>' + r.visits.split(" ")[0] + "</b><span>Places visited</span></div><div><b>" + r.passed + "</b><span>Passed verification</span></div><div><b>" + r.photos + '</b><span>Photos</span></div><div><b>' + esc(r.date.replace(" 2026", "")) + '</b><span>Completed</span></div></div><p class="vb-l">Key findings</p><ul>' + r.finds.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" : "") + "</li>";
    };
    return '<div class="vs-tools"><p class="vb-l">Your investigations</p><button type="button" class="vb-btn vb-solid" id="vs-new">New brief <span aria-hidden="true">+</span></button></div>' +
      (mineList.length ? '<ul class="vs-list">' + mineList.map(function (m) { return '<li class="vs-rep"><div class="vs-rep-top"><span class="vs-pick vs-pick-off" aria-hidden="true"></span><div class="vs-rep-main"><p class="vs-rep-meta"><span>' + esc(m.ref) + "</span>Your brief · " + esc(m.city || "") + '</p><p class="vs-rep-h">' + esc(m.objective) + '</p></div><span class="vs-badge vs-rev">Under review</span></div></div></li>'; }).join("") + "</ul>" : "") +
      '<ul class="vs-list">' + REPORTS.map(card).join("") + "</ul>" +
      '<p class="vb-hint">Example reports shown during early access. Places and figures are illustrative.</p>' +
      (V.sel.length ? '<div class="vs-bar"><span>' + V.sel.length + (V.sel.length === 1 ? " report selected" : " reports selected") + '</span><button type="button" class="vs-link vs-clear" id="vs-clear">Clear</button><button type="button" class="vb-btn vb-solid" id="vs-analyse">Analyse ' + (V.sel.length > 1 ? "together" : "with Verisavo") + ' <span aria-hidden="true">→</span></button></div>' : "");
  }
  function analyse(refs) {
    var rs = REPORTS.filter(function (r) { return refs.indexOf(r.ref) > -1; }); if (!rs.length) return;
    var q = rs.length === 1
      ? "Analyse SavoScouts report " + rs[0].ref + " (" + rs[0].kind + ", " + rs[0].place.replace(" · ", ": ") + "). What does it tell us, how reliable is it, and what should we check next?"
      : "Compare SavoScouts reports " + rs.map(function (r) { return r.ref; }).join(" and ") + ". What do they show together, where do they disagree, and what is still unknown?";
    V.sel = []; var nb = document.getElementById("va-new"); if (nb) nb.click(); else close();
    var vin = document.getElementById("va-in"), f = document.getElementById("va-form");
    if (vin && f) { vin.value = q; vin.dispatchEvent(new Event("input", { bubbles: true })); setTimeout(function () { f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { cancelable: true })); }, 60); }
  }
  function draw() {
    if (V.view === "home") {
      panel.innerHTML = '<div class="vb-in"><header class="vb-head"><p class="vb-eb">SavoScouts</p><h2>Ground-Level Intelligence</h2><p>Brief SavoScouts where existing evidence runs out, then analyse what they find with the Intelligence Assistant.</p></header>' + home() + "</div>";
      return;
    }
    var sub = S.ref ? "" : '<ol class="vb-steps">' + STEPS.map(function (s, i) { return '<li class="' + (i < S.step ? "done" : i === S.step ? "now" : "") + '"><span>' + (i + 1) + "</span>" + s + "</li>"; }).join("") + "</ol>";
    panel.innerHTML = '<div class="vb-in"><header class="vb-head"><p class="vb-eb">SavoScouts</p><h2>' + (S.ref ? "Your investigation is on its way" : "Request a targeted investigation") + "</h2>" +
      (S.ref ? "" : "<p>Brief SavoScouts to gather Ground-Level Intelligence where existing evidence runs out. Build the form they will fill in, then submit it for review.</p>") + "</header>" + sub +
      (S.ref ? done() : body() + '<p class="vb-err" id="vb-err" role="alert"></p><div class="vb-nav">' + '<button type="button" class="vb-btn" id="vb-prev">Back</button>' +
        '<button type="button" class="vb-btn vb-solid" id="vb-next">' + (S.step === 4 ? "Submit brief" : "Continue") + " <span aria-hidden=\"true\">→</span></button></div>") + "</div>";
    if (S.step === 2 && !S.ref) phone();
  }
  function phone() {
    var ph = document.getElementById("vb-phone"); if (!ph) return;
    var qs = S.qs.filter(function (q) { return q.text.trim(); });
    ph.innerHTML = '<p class="vb-ph-top"><b>Verisavo</b><span>SavoScouts</span></p><div class="vb-ph-msg"><p class="vb-ph-t">New task near you</p><p>' + esc(S.objective || "Your objective appears here.") + "</p></div>" +
      (qs.length ? qs.map(function (q, i) { return '<div class="vb-ph-q"><span>' + (i + 1) + ". " + esc(q.text) + (q.req ? " *" : "") + "</span><em>" + (q.type === "Multiple choice" && q.opts ? esc(q.opts) : q.type) + "</em></div>"; }).join("") : '<div class="vb-ph-q"><span>Your questions appear here.</span></div>') +
      '<div class="vb-ph-q vb-ph-auto"><span>Location and time-stamp</span><em>Captured automatically</em></div>';
  }
  var minDate = function () { var d = new Date(Date.now() + 3 * 864e5); return d.toISOString().slice(0, 10); };
  var fmt = function (v) { try { return new Date(v + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return v; } };
  function check() {
    if (S.step === 0 && S.objective.trim().length < 10) return "Describe what you need to find out in a sentence or two.";
    if (S.step === 1 && !S.city.trim()) return "Add the city where the visits should happen.";
    if (S.step === 1 && !S.places.length) return "Choose at least one type of place to visit.";
    if (S.step === 2 && !S.qs.some(function (q) { return q.text.trim(); })) return "Add at least one question for SavoScouts.";
    if (S.step === 2 && S.qs.some(function (q) { return q.type === "Multiple choice" && q.text.trim() && !q.opts.trim(); })) return "Add the options for each multiple-choice question.";
    return "";
  }
  var applyTpl = function (t) { S.template = t; S.qs = TEMPLATES[t].map(function (q) { return { text: q[0], type: q[1], opts: q[2] || "", req: true }; }); };

  panel.addEventListener("click", function (e) {
    var t = e.target, b;
    if (t.closest("#vs-new")) { S = fresh(); V.view = "new"; render(); panel.scrollTop = 0; return; }
    if ((b = t.closest("[data-view-rep]"))) { V.open = V.open === b.dataset.viewRep ? "" : b.dataset.viewRep; render(); return; }
    if ((b = t.closest("[data-analyse]"))) { analyse([b.dataset.analyse]); return; }
    if (t.closest("#vs-analyse")) { analyse(V.sel.slice()); return; }
    if (t.closest("#vs-clear")) { V.sel = []; render(); return; }
    if ((b = t.closest("[data-tpl]"))) { applyTpl(b.dataset.tpl); render(); return; }
    if ((b = t.closest("[data-dec]"))) { S.decision = S.decision === b.dataset.dec ? "" : b.dataset.dec; render(); return; }
    if ((b = t.closest("[data-place]"))) { var p = b.dataset.place, k = S.places.indexOf(p); if (k > -1) S.places.splice(k, 1); else S.places.push(p); render(); return; }
    if ((b = t.closest("[data-rm-area]"))) { S.areas.splice(+b.dataset.rmArea, 1); render(); var a = document.getElementById("vb-area"); if (a) a.focus(); return; }
    if ((b = t.closest("[data-win]"))) { S.window = b.dataset.win; render(); return; }
    if ((b = t.closest("[data-ver]"))) { S.verify = b.dataset.ver; render(); return; }
    if ((b = t.closest("[data-q-rm]"))) { S.qs.splice(+b.dataset.qRm, 1); render(); return; }
    if ((b = t.closest("[data-q-up]"))) { var i = +b.dataset.qUp, x = S.qs[i]; S.qs[i] = S.qs[i - 1]; S.qs[i - 1] = x; render(); return; }
    if ((b = t.closest("[data-q-down]"))) { var j = +b.dataset.qDown, y = S.qs[j]; S.qs[j] = S.qs[j + 1]; S.qs[j + 1] = y; render(); return; }
    if (t.closest("#vb-addq")) { S.qs.push({ text: "", type: "Short answer", opts: "", req: true }); render(); var ins = panel.querySelectorAll("[data-q-text]"); if (ins.length) ins[ins.length - 1].focus(); return; }
    if ((b = t.closest("[data-go]"))) { S.step = +b.dataset.go; render(); panel.scrollTop = 0; return; }
    if (t.closest("#vb-prev")) { if (S.step) S.step--; else V.view = "home"; render(); panel.scrollTop = 0; return; }
    if (t.closest("#vb-next")) {
      var err = check(); if (err) { document.getElementById("vb-err").textContent = err; return; }
      if (S.step === 2) S.qs = S.qs.filter(function (q) { return q.text.trim(); });
      if (S.step < 4) { if (S.step === 0 && !S.qs.length) applyTpl(S.template || "Custom"); S.step++; render(); panel.scrollTop = 0; return; }
      S.ref = "SC-" + String(Math.floor(1000 + Math.random() * 9000));
      try { var all = JSON.parse(sessionStorage.getItem("verisavo-briefs") || "[]"); all.push({ ref: S.ref, objective: S.objective, city: S.city, at: Date.now() }); sessionStorage.setItem("verisavo-briefs", JSON.stringify(all)); } catch (x) {}
      render(); panel.scrollTop = 0; var h = document.getElementById("vb-done-h"); if (h) h.focus(); return;
    }
    if (t.closest("#vb-again")) { S = fresh(); render(); panel.scrollTop = 0; return; }
    if (t.closest("#vb-home")) { S = fresh(); V.view = "home"; render(); panel.scrollTop = 0; return; }
    if (t.closest("#vb-back")) { S = fresh(); close(); var vin = document.getElementById("va-in"); if (vin) vin.focus(); }
  });
  panel.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "vb-obj") S.objective = t.value;
    else if (t.id === "vb-city") S.city = t.value;
    else if (t.id === "vb-country") S.country = t.value;
    else if (t.id === "vb-count") { S.count = +t.value; document.getElementById("vb-count-o").textContent = S.count + " places"; }
    else if (t.id === "vb-date") S.deadline = t.value;
    else if (t.id === "vb-notes") S.notes = t.value;
    else if (t.dataset.qText != null) { S.qs[+t.dataset.qText].text = t.value; phone(); }
    else if (t.dataset.qOpts != null) { S.qs[+t.dataset.qOpts].opts = t.value; phone(); }
    var er = document.getElementById("vb-err"); if (er) er.textContent = "";
  });
  panel.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset.pick) { var k2 = V.sel.indexOf(t.dataset.pick); if (t.checked && k2 < 0) V.sel.push(t.dataset.pick); if (!t.checked && k2 > -1) V.sel.splice(k2, 1); render(); return; }
    if (t.id === "vb-country") S.country = t.value;
    if (t.dataset.qType != null) { S.qs[+t.dataset.qType].type = t.value; render(); }
    if (t.dataset.qReq != null) { S.qs[+t.dataset.qReq].req = t.checked; phone(); }
    if (t.id === "vb-area" && t.value.trim()) { var v = t.value.trim(); t.value = ""; if (S.areas.indexOf(v) < 0) { S.areas.push(v); setTimeout(function () { if (S.step === 1 && !S.ref) render(); }, 0); } }
  });
  panel.addEventListener("keydown", function (e) {
    if (e.target.id === "vb-area" && e.key === "Enter") { e.preventDefault(); var v = e.target.value.trim(); e.target.value = ""; if (v && S.areas.indexOf(v) < 0) S.areas.push(v); render(); var a = document.getElementById("vb-area"); if (a) a.focus(); }
  });
})();
/* <<< savoscouts brief */
}
