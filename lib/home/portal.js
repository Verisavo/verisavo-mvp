import { OPPS } from "./portalData";

export default function init() {
  window.__vsPortalPaths = true;
  /* SavoScout Opportunities portal: one list of opportunities drives the directory, each opportunity page and the apply form.
     Front end only for now: applications and WhatsApp are simulated until the back end exists. */
  var page = document.getElementById("pg-portal"); if (!page) return;
  var mount = page.querySelector(".pt-mount");
  var NEXT = !!window.__vsPortalPaths;                        /* the app uses real addresses (/portal/slug); the static site uses #portal/slug */
  var SIM_WA = "+234 800 000 0000";                           /* sample number: replace with the real WhatsApp destination */
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var bySlug = function (s) { return OPPS.filter(function (o) { return o.slug === s; })[0]; };
  var KIND = { role: "Ongoing role", task: "Other role" };
  var href = function (slug) { return NEXT ? "/portal" + (slug ? "/" + slug : "") : "#portal" + (slug ? "/" + slug : ""); };
  function slugNow() {
    var m = NEXT ? location.pathname.match(/^\/portal\/([^/?#]+)/) : location.hash.match(/^#portal\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }
  function isPortal() { return NEXT ? /^\/portal(\/|$)/.test(location.pathname) : /^#portal(\/|$)/.test(location.hash); }
  function go(slug) {
    if (NEXT) { try { history.pushState({ pg: "portal" }, "", href(slug)); } catch (e) {} render(); }
    else location.hash = href(slug).slice(1);
  }
  var ic = {
    pin: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17.500s5-4.300 5-8.500a5 5 0 0 0-10 0c0 4.200 5 8.500 5 8.500z"/><circle cx="10" cy="9" r="1.800"/></svg>',
    clock: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 6.200V10l2.500 1.600"/></svg>',
    coin: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M7.600 8l2.400 4 2.400-4"/></svg>',
    tick: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.500 10.500l3.500 3.500 7.500-8"/></svg>',
    wa: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.200 16.800l1-3.400A7 7 0 1 1 7 16l-3.800.800z"/><path d="M7.800 7.600c0 2.400 2.200 4.600 4.600 4.600"/></svg>'
  };
  Object.keys(ic).forEach(function (k) { ic[k] = ic[k].replace(/(\d)\.(\d)00/g, "$1.$2"); });

  var CARDKIND = { role: "Ongoing research", task: "Project research" };
  function card(o) {
    return '<li><a class="pt-card pt-card2" href="' + href(o.slug) + '" data-pt-go="' + o.slug + '">' +
      '<span class="pt-k">' + CARDKIND[o.kind] + '</span>' +
      '<h3>' + esc(o.title) + '</h3><p>' + esc(o.card) + '</p>' +
      '<dl><div><dt>Posted</dt><dd>' + esc(o.posted) + '</dd></div><div><dt>Where</dt><dd>' + esc(o.location) + '</dd></div><div><dt>Contract</dt><dd>' + esc(o.contract) + '</dd></div></dl>' +
      '<span class="pt-more2">View details<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"/></svg></span></a></li>';
  }
  function waSection() {
    return '<section class="pt-wa" aria-labelledby="pt-wa-h"><div><h2 id="pt-wa-h">Never miss a new opportunity</h2>' +
      '<p>New research tasks and opportunities are added regularly. Connect with Verisavo on WhatsApp to receive updates, discover available tasks and stay informed about new ways to earn through the SavoScout network.</p>' +
      '</div>' +
      '<form class="pt-wa-form" novalidate><label for="pt-wa-num">Leave your WhatsApp number and we’ll message you</label>' +
      '<div class="pt-row"><input id="pt-wa-num" type="tel" inputmode="tel" autocomplete="tel" placeholder="+234 801 234 5678"><button type="submit" class="pt-btn">Get updates</button></div>' +
      '<p class="pt-msg" role="status" aria-live="polite"></p></form></section>';
  }
  function commSection() {
    return '<section class="pt-band" aria-labelledby="pt-cm-h"><h2 id="pt-cm-h">More than just job opportunities</h2>' +
      '<p>Become part of a growing network of people helping businesses understand real markets. Connect with other SavoScouts, discover new opportunities and grow with the Verisavo community.</p>' +
      '<button type="button" class="pt-btn pt-btn-light" data-page="community">Explore community</button></section>';
  }
  function listView() {
    var f = listView.f || "all";
    var shown = OPPS.filter(function (o) { return f === "all" || o.kind === f; });
    var n = function (k) { return OPPS.filter(function (o) { return k === "all" || o.kind === k; }).length; };
    return '<div class="pt"><header class="pt-head"><p class="pt-eb">SavoScout opportunities</p><h1 id="pt-h">Find research work you can do from anywhere</h1>' +
      '<p class="pt-lead">SavoScouts help businesses understand real markets. Browse the open opportunities, pick one that suits you and apply in about a minute.</p></header>' +
      '<div class="pt-tabs" role="group" aria-label="Filter opportunities">' +
      [["all", "All"], ["role", "Ongoing research"], ["task", "Project research"]].map(function (t) { return '<button type="button" data-pt-f="' + t[0] + '" aria-pressed="' + (f === t[0]) + '">' + t[1] + ' <span>' + n(t[0]) + '</span></button>'; }).join("") + '</div>' +
      '<ul class="pt-list">' + shown.map(card).join("") + '</ul>' +
      '<p class="pt-near">Prefer tasks in your own city, in shops and on the street? <button type="button" class="pt-link" data-page="community-tasks">See open tasks near you</button></p>' +
      waSection() + commSection() + '</div>';
  }
  function detailView(o) {
    var others = OPPS.filter(function (x) { return x.slug !== o.slug; }).slice(0, 3);
    var li = function (a) { return a.map(function (t) { return '<li>' + ic.tick + '<span>' + esc(t) + '</span></li>'; }).join(""); };
    return '<div class="pt pt-job"><nav class="pt-crumb" aria-label="Breadcrumb"><a href="' + href("") + '" data-pt-go="">All opportunities</a><span aria-hidden="true">/</span><span>' + KIND[o.kind] + '</span></nav>' +
      '<header class="pt-head pt-head-job"><p class="pt-eb">SavoScout opportunity</p><h1 id="pt-h">' + esc(o.title) + '</h1>' +
      '<ul class="pt-meta"><li><span>Type</span><b>' + KIND[o.kind] + ' · Task-based</b></li><li><span>Location</span><b>' + esc(o.location) + '</b></li><li><span>Time</span><b>' + esc(o.time) + '</b></li><li><span>Reward</span><b>' + esc(o.reward) + '</b></li></ul>' +
      '<div class="pt-cta"><button type="button" class="pt-btn pt-btn-main" data-pt-apply="' + o.slug + '">Apply now</button><button type="button" class="pt-btn" data-pt-share="' + o.slug + '">Copy link</button><span class="pt-msg" role="status" aria-live="polite"></span></div></header>' +
      '<section class="pt-sec"><h2>About this opportunity</h2>' + o.intro.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join("") + '</section>' +
      '<section class="pt-sec"><h2>What you’ll do</h2><ul class="pt-ticks">' + li(o.does) + '</ul></section>' +
      '<section class="pt-sec"><h2>What you need</h2><ul class="pt-ticks">' + li(o.needs) + '</ul></section>' +
      '<section class="pt-sec"><h2>How it works</h2><ol class="pt-steps"><li><b>Apply</b><span>Tell us who you are. It takes about a minute.</span></li><li><b>Hear from us</b><span>We review your application and message you with next steps.</span></li><li><b>Take a task</b><span>Tasks arrive with instructions. Accept the ones that suit you.</span></li><li><b>Submit your findings</b><span>Send what you found, with links and evidence.</span></li><li><b>Earn VeriPoints</b><span>We check every response. VeriPoints are added once it passes, and they convert to cash.</span></li></ol></section>' +
      '<div class="pt-applybox"><div><h2>Ready to start?</h2><p>Applying is free. You can decline any task.</p></div><button type="button" class="pt-btn pt-btn-main" data-pt-apply="' + o.slug + '">Apply now</button></div>' +
      waSection() +
      '<section class="pt-sec pt-others"><div class="pt-others-h"><h2>Other opportunities</h2><a class="pt-link" href="' + href("") + '" data-pt-go="">View all</a></div><ul class="pt-list">' + others.map(card).join("") + '</ul></section>' +
      commSection() +
      '<div class="pt-stick"><span>' + esc(o.title) + '</span><button type="button" class="pt-btn pt-btn-main" data-pt-apply="' + o.slug + '">Apply now</button></div></div>';
  }
  var last = null;
  function render() {
    if (!isPortal()) return;
    var s = slugNow(), o = s ? bySlug(s) : null, key = s || ("list:" + (listView.f || "all"));
    if (key === last) return; last = key;
    mount.innerHTML = s && !o ? '<div class="pt"><header class="pt-head"><p class="pt-eb">SavoScout opportunities</p><h1 id="pt-h">This opportunity is no longer open</h1><p class="pt-lead">It may have been filled or closed. There are others you can apply for.</p><p><a class="pt-btn pt-btn-main" href="' + href("") + '" data-pt-go="">View open opportunities</a></p></header></div>' : o ? detailView(o) : listView();
    page.scrollTop = 0;
    try { document.title = (o ? o.title + " | SavoScout opportunities" : "SavoScout opportunities") + " | Verisavo"; } catch (e) {}
  }

  /* ---------- apply form and confirmation ---------- */
  var COUNTRIES = ["Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Côte d’Ivoire", "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "Outside Africa"];
  var CODES = ["+234", "+233", "+254", "+255", "+256", "+250", "+27", "+251", "+221", "+225", "+237", "+260", "+263", "+20", "+212", "+44", "+1"];
  var dlg = document.createElement("dialog"); dlg.className = "pt-dlg"; dlg.id = "pt-apply"; dlg.setAttribute("aria-labelledby", "pt-dlg-h"); document.body.appendChild(dlg);
  var wdlg = document.createElement("dialog"); wdlg.className = "pt-dlg pt-wdlg"; wdlg.id = "pt-wa"; wdlg.setAttribute("aria-labelledby", "pt-wd-h"); document.body.appendChild(wdlg);
  function openApply(slug) {
    var o = bySlug(slug); if (!o) return;
    dlg.innerHTML = '<form class="pt-form" novalidate><button type="button" class="pt-x" data-pt-close aria-label="Close">' + '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>' +
      '<p class="pt-eb">Apply</p><h2 id="pt-dlg-h">' + esc(o.title) + '</h2><p class="pt-sub">' + KIND[o.kind] + ' · ' + esc(o.location) + '</p>' +
      '<label>Full name<input name="name" autocomplete="name" required></label>' +
      '<label>Email address<input name="email" type="email" autocomplete="email" inputmode="email" required></label>' +
      '<label>WhatsApp phone number<input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="WhatsApp number" required></label>' +
      '<label>Country of residence<select name="country" required><option value="">Choose a country</option>' + COUNTRIES.map(function (c) { return '<option>' + c + '</option>'; }).join("") + '</select></label>' +
      '<label><span>Relevant experience or skills <small>(optional)</small></span><textarea name="exp" rows="3" placeholder="For example: online research, data entry, sales, customer service"></textarea></label>' +
      '<label class="pt-check"><input type="checkbox" name="ok" required><span>I agree that Verisavo can use these details to manage my application and to contact me about relevant research opportunities, as described in the <button type="button" class="pt-link" data-legal="privacy">Privacy Policy</button>.</span></label>' +
      '<p class="pt-err" role="alert"></p><button type="submit" class="pt-btn pt-btn-main pt-wide">Submit application</button></form>';
    if (!dlg.open) dlg.showModal();
  }
  function showDone(o) {
    dlg.innerHTML = '<div class="pt-done"><button type="button" class="pt-x" data-pt-close aria-label="Close"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>' +
      '<span class="pt-okmark">' + ic.tick + '</span><h2 id="pt-dlg-h" tabindex="-1">Thank you for applying!</h2>' +
      '<p>Your application has been received. You’re one step closer to joining the Verisavo SavoScout network. We’ll keep you informed about relevant opportunities and next steps.</p>' +
      '<p class="pt-applied">Applied for: <b>' + esc(o.title) + '</b></p>' +
      '<p>To take tasks, join SavoScouts with the same WhatsApp number. Tasks are sent and answered there.</p>' +
      '<div class="pt-done-acts"><button type="button" class="pt-btn pt-btn-main" data-join-wa>' + ic.wa + 'Join SavoScouts with WhatsApp</button><button type="button" class="pt-btn" data-pt-other>View other opportunities</button></div>' +
      '<p class="pt-preview">Preview build: applications are not stored or sent yet.</p></div>';
    var h = dlg.querySelector("h2"); if (h) h.focus();
  }
  dlg.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, err = f.querySelector(".pt-err"), bad = null, msg = "";
    var v = function (n) { return (f.elements[n].value || "").trim(); };
    [].forEach.call(f.querySelectorAll("[aria-invalid]"), function (x) { x.removeAttribute("aria-invalid"); });
    if (v("name").length < 2) { bad = "name"; msg = "Enter your full name."; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) { bad = "email"; msg = "Enter a valid email address, like name@example.com."; }
    else if (v("phone").replace(/\D/g, "").length < 7) { bad = "phone"; msg = "Enter your WhatsApp number, digits only."; }
    else if (!v("country")) { bad = "country"; msg = "Choose the country you live in."; }
    else if (!f.elements.ok.checked) { bad = "ok"; msg = "Tick the box to agree before you submit."; }
    if (bad) { err.textContent = msg; f.elements[bad].setAttribute("aria-invalid", "true"); f.elements[bad].focus(); return; }
    var o = bySlug(slugNow()) || bySlug(f.dataset.slug) || OPPS[0];
    showDone(bySlug(dlg.dataset.slug) || o);
  });

  /* ---------- simulated WhatsApp ---------- */
  function openWa() {
    wdlg.innerHTML = '<div class="pt-chat"><header><span class="pt-av" aria-hidden="true">V</span><span class="pt-who"><b id="pt-wd-h">Verisavo</b><small>' + SIM_WA + '</small></span><button type="button" class="pt-x" data-pt-close aria-label="Close"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button></header>' +
      '<p class="pt-sim">Simulated preview. This shows how the WhatsApp channel will work.</p>' +
      '<div class="pt-thread" aria-live="polite"><p class="pt-b pt-in">Welcome to Verisavo opportunities. Send <b>Verisavo Jobs</b> to see what’s open.</p></div>' +
      '<div class="pt-send"><button type="button" class="pt-btn pt-btn-main pt-wide" data-pt-say>Send “Verisavo Jobs”</button></div></div>';
    if (dlg.open) dlg.close();
    if (!wdlg.open) wdlg.showModal();
  }
  function say() {
    var th = wdlg.querySelector(".pt-thread"), bar = wdlg.querySelector(".pt-send");
    var add = function (html, me) { var p = document.createElement("div"); p.className = "pt-b " + (me ? "pt-me" : "pt-in"); p.innerHTML = html; th.appendChild(p); th.scrollTop = th.scrollHeight; };
    add("Verisavo Jobs", true); bar.innerHTML = '<p class="pt-typing">Verisavo is typing…</p>';
    setTimeout(function () {
      add("Thanks. You’re on the list for SavoScout opportunities. Here’s what’s open now:");
      add(OPPS.slice(0, 3).map(function (o) { return '<button type="button" class="pt-pick" data-pt-go="' + o.slug + '"><b>' + esc(o.title) + '</b><span>' + KIND[o.kind] + ' · ' + esc(o.location) + '</span></button>'; }).join(""));
      add("We’ll message you here when new tasks are added. Reply STOP at any time to stop updates.");
      bar.innerHTML = '<button type="button" class="pt-btn pt-wide" data-pt-go="">View all opportunities</button>';
    }, 900);
  }

  document.addEventListener("click", function (e) {
    var nb = e.target.closest && e.target.closest("[data-pt-num]");
    if (nb) { var out = nb.parentNode.querySelector(".pt-wa-num");
      if (!nb.hasAttribute("data-shown")) { nb.setAttribute("data-shown", ""); out.textContent = SIM_WA; nb.parentNode.insertBefore(out, nb); nb.textContent = "Copy"; nb.setAttribute("aria-label", "Copy number"); return; }
      var ok = function () { nb.textContent = "Copied"; setTimeout(function () { nb.textContent = "Copy"; }, 2000); };
      try { navigator.clipboard.writeText(SIM_WA).then(ok, function () {}); } catch (x) {} return; }
    var pl = e.target.closest && e.target.closest('[data-page="portal"]'); if (pl && isPortal() && slugNow()) { setTimeout(function () { go(""); scrollTo(0, 0); var P = document.getElementById("pg-portal"); if (P) P.scrollTop = 0; }, 0); }
    var t = e.target.closest && e.target.closest("[data-pt-go],[data-pt-apply],[data-pt-f],[data-pt-wa],[data-pt-close],[data-pt-other],[data-pt-say],[data-pt-share]"); if (!t) return;
    if (t.hasAttribute("data-pt-go")) { e.preventDefault(); if (dlg.open) dlg.close(); if (wdlg.open) wdlg.close(); if (!isPortal() && window.vsGoPage && !t.getAttribute("data-pt-go")) { window.vsGoPage("portal"); return; } go(t.getAttribute("data-pt-go")); }
    else if (t.hasAttribute("data-pt-apply")) { dlg.dataset.slug = t.getAttribute("data-pt-apply"); openApply(dlg.dataset.slug); }
    else if (t.hasAttribute("data-pt-f")) { listView.f = t.getAttribute("data-pt-f"); render(); var b = mount.querySelector('[data-pt-f="' + listView.f + '"]'); if (b) b.focus(); }
    else if (t.hasAttribute("data-pt-wa")) openWa();
    else if (t.hasAttribute("data-pt-say")) say();
    else if (t.hasAttribute("data-pt-other")) { dlg.close(); go(""); }
    else if (t.hasAttribute("data-pt-share")) {
      var url = NEXT ? location.origin + href(t.getAttribute("data-pt-share")) : location.href.split("#")[0] + href(t.getAttribute("data-pt-share"));
      var m = t.parentNode.querySelector(".pt-msg"), done = function (ok) { if (m) m.textContent = ok ? "Link copied." : url; };
      try { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); } catch (x) { done(false); }
    }
    else if (t.hasAttribute("data-pt-close")) { var d = t.closest("dialog"); if (d) d.close(); }
  });
  [dlg, wdlg].forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });
  var WALOGO = '<svg class="pt-otp-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#25D366"/><path fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" d="M8.6 23.4l1.1-3.9a7.6 7.6 0 1 1 2.9 2.8z"/><path fill="#fff" d="M13.2 12.4c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.4.8-.6.4-1.4.6-2.2.3-2.2-.8-3.9-2.5-4.7-4.7-.3-.8-.1-1.6.3-2.2z"/></svg>';
  function otpView(num) {
    var boxes = ""; for (var k = 0; k < 6; k++) boxes += '<input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]*" aria-label="Digit ' + (k + 1) + ' of 6"' + (k === 0 ? ' autocomplete="one-time-code"' : ' autocomplete="off"') + '>';
    return '<div class="pt-otp"><h3>' + WALOGO + '<span>Check WhatsApp</span></h3>' +
      '<p class="pt-otp-sub">Enter the code we sent to <b>' + esc(num) + '</b></p>' +
      '<div class="pt-otp-boxes" role="group" aria-label="Six-digit code">' + boxes + '</div>' +
      '<p class="pt-msg" role="status" aria-live="polite"></p>' +
      '<button type="button" class="pt-otp-help" data-otp-help aria-expanded="false">Didn’t get a code?<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5"/></svg></button>' +
      '<div class="pt-otp-more" hidden><button type="button" data-otp-resend>Send the code again</button><button type="button" data-otp-change>Change number</button></div></div>';
  }
  function doneView(num) {
    return '<div class="pt-otp pt-otp-ok"><h3>' + WALOGO + '<span>You’re on the list</span></h3>' +
      '<p class="pt-otp-sub">We’ll message <b>' + esc(num) + '</b> on WhatsApp when new tasks are added. In this preview no message is sent yet.</p></div>';
  }
  function formBack(box) {
    box.classList.remove("pt-wa-step");
    box.innerHTML = '<label for="pt-wa-num">Leave your WhatsApp number and we’ll message you</label>' +
      '<div class="pt-row"><input id="pt-wa-num" type="tel" inputmode="tel" autocomplete="tel" placeholder="+234 801 234 5678" value="' + esc(box.getAttribute("data-num") || "") + '"><button type="submit" class="pt-btn">Get updates</button></div>' +
      '<p class="pt-msg" role="status" aria-live="polite"></p>';
    box.querySelector("input").focus();
  }
  function otpCheck(box) {
    var ins = box.querySelectorAll(".pt-otp-boxes input"), code = "";
    for (var k = 0; k < ins.length; k++) code += ins[k].value;
    if (code.length === 6) { box.innerHTML = doneView(box.getAttribute("data-num")); box.classList.add("pt-wa-step"); }
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest(".pt-wa-form"); if (!f) return; e.preventDefault();
    var i = f.querySelector("input[type=tel]"); if (!i) return;
    var m = f.querySelector(".pt-msg"), ok = i.value.replace(/\D/g, "").length >= 9;
    i.setAttribute("aria-invalid", String(!ok));
    if (!ok) { m.textContent = "Enter your WhatsApp number with its country code, like +234 801 234 5678."; return; }
    var num = i.value.trim(); if (num.charAt(0) !== "+") num = "+" + num.replace(/^0+/, "");
    f.setAttribute("data-num", num); f.classList.add("pt-wa-step"); f.innerHTML = otpView(num);
    f.querySelector(".pt-otp-boxes input").focus();
  });
  document.addEventListener("input", function (e) {
    var t = e.target; if (!t.closest || !t.closest(".pt-otp-boxes")) return;
    var box = t.closest(".pt-wa-form"), ins = [].slice.call(t.parentNode.querySelectorAll("input")), d = t.value.replace(/\D/g, "");
    if (d.length > 1) { var at = ins.indexOf(t); for (var k = 0; k < d.length && at + k < 6; k++) ins[at + k].value = d.charAt(k); (ins[Math.min(at + d.length, 5)]).focus(); }
    else { t.value = d; if (d && t.nextElementSibling) t.nextElementSibling.focus(); }
    otpCheck(box);
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (!t.closest || !t.closest(".pt-otp-boxes")) return;
    if (e.key === "Backspace" && !t.value && t.previousElementSibling) { e.preventDefault(); t.previousElementSibling.value = ""; t.previousElementSibling.focus(); }
    else if (e.key === "ArrowLeft" && t.previousElementSibling) { e.preventDefault(); t.previousElementSibling.focus(); }
    else if (e.key === "ArrowRight" && t.nextElementSibling) { e.preventDefault(); t.nextElementSibling.focus(); }
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-otp-help],[data-otp-resend],[data-otp-change]"); if (!t) return;
    var box = t.closest(".pt-wa-form");
    if (t.hasAttribute("data-otp-help")) { var more = box.querySelector(".pt-otp-more"), open = more.hidden; more.hidden = !open; t.setAttribute("aria-expanded", String(open)); }
    else if (t.hasAttribute("data-otp-resend")) { box.querySelector(".pt-msg").textContent = "We’ve sent a new code. In this preview no message is sent yet."; box.querySelector(".pt-otp-more").hidden = true; box.querySelector("[data-otp-help]").setAttribute("aria-expanded", "false"); box.querySelector(".pt-otp-boxes input").focus(); }
    else formBack(box);
  });
  addEventListener("hashchange", render); addEventListener("popstate", function () { setTimeout(render, 0); });
  new MutationObserver(function () { if (page.classList.contains("open")) render(); else last = null; }).observe(page, { attributes: true, attributeFilter: ["class"] });
  render();
}
