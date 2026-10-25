// Site shell: menu, inner pages (About us, Case studies, Pricing, Careers, Contact), legal dialogs and the reading view
// Runs once in the browser after the page has rendered (see the page's client component).
export default function init() {
  (() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = id => document.getElementById(id);
  const PLATFORM = window.VS_PLATFORM || "/platform";
  /* The Intelligence Assistant lives on the product page; questions travel with the visitor */
  function toAssistant(hash, q) {
    try { if (q) sessionStorage.setItem("verisavo-q", q); else sessionStorage.removeItem("verisavo-q"); } catch (e) {}
    location.href = PLATFORM + "#" + hash;
  }
  const qIn = { value: "" }, userOwns = false, qNote = { hidden: true };
  const SCOUT_Q = "";
  function go(k) {
    const el = k && k !== "0" ? document.getElementById(k) : null;
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    else scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
  /* Terms of Service and Privacy Policy, opened in place */
  const legalDlg = $("legal");
  let lOpener = null;
  function openLegal(doc) {
    lOpener = document.activeElement;
    ["privacy", "terms"].forEach(d => { const el = $("l-" + d); el.hidden = d !== doc; el.scrollTop = 0; });
    legalDlg.setAttribute("aria-labelledby", "lh-" + doc);
    if (legalDlg.showModal) legalDlg.showModal(); else legalDlg.setAttribute("open", "");
    setTimeout(() => $("l-" + doc).focus(), 30);
  }
  const closeLegal = () => legalDlg.close ? legalDlg.close() : legalDlg.removeAttribute("open");
  $("l-x").addEventListener("click", closeLegal);
  legalDlg.addEventListener("click", e => { if (e.target === legalDlg) closeLegal(); });
  legalDlg.addEventListener("close", () => { if (lOpener && lOpener.focus && !legalDlg.dataset.handoff) lOpener.focus(); delete legalDlg.dataset.handoff; });
  document.querySelectorAll("[data-legal-contact]").forEach(b => b.addEventListener("click", () => { legalDlg.dataset.handoff = "1"; closeLegal(); window.vsOpenAccess(""); }));
  const menuBtn = $("menu-btn"), menu = $("menu"), menuLab = $("menu-lab");
  function setMenu(open) {
    menu.classList.toggle("open", open); menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open)); menuLab.textContent = open ? "Close" : "Menu";
    if (open) setTimeout(() => { const f = menu.querySelector("button"); if (f) f.focus({ preventScroll: true }); }, 350);
  }
  function closeMenu() { if (menu.classList.contains("open")) setMenu(false); }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("click", e => {
    if (e.target.closest("[data-soon]")) closeMenu();
    const pgb = e.target.closest("[data-page]"); if (pgb) goPage(pgb.dataset.page);
    const g = e.target.closest("[data-go]"); if (g) { if (curPage) goPage("home"); go(g.dataset.go); closeMenu(); }
    const d = e.target.closest("[data-dialog]"); if (d) { closeMenu(); if (d.dataset.dialog === "signin") window.vsOpenAuth("in"); else window.vsOpenAccess(""); }
    if (e.target.closest("[data-ask]")) toAssistant("ask", userOwns ? qIn.value.trim() : "");
    if (e.target.closest("[data-scout]")) { closeMenu(); window.vsOpenAccess(SCOUT_Q); }
    const lg = e.target.closest("[data-legal]"); if (lg) { closeMenu(); openLegal(lg.dataset.legal); }
    if (!e.target.closest("#qbar")) qNote.hidden = true;
    if (!e.target.closest(".pill") && !e.target.closest(".mnav") && !e.target.closest(".pg")) closeMenu();
  });
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));

  /* ===================== ABOUT AND CONTACT PAGES ===================== */
  const PAGES = { "about-us": $("pg-about-us"), contact: $("pg-contact"), research: $("pg-research"), pricing: $("pg-pricing"), careers: $("pg-careers") };
  $("ca-copy").addEventListener("click", async () => {
    const n = $("ca-note");
    try { await navigator.clipboard.writeText("career@verisavo.com"); n.textContent = "Email address copied."; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($("ca-addr")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); n.textContent = "Address selected. Press Ctrl+C or Cmd+C to copy."; }
  });

  /* Careers: filter roles by team */
  (function () {
    const page = document.getElementById("pg-careers"); if (!page) return;
    const head = page.querySelector(".ca-roles-head"), jobs = [...page.querySelectorAll(".ca-job")];
    if (!head || head.querySelector(".ca2-filter") || !jobs.length) return;
    const teams = [];
    jobs.forEach(j => { const t = (j.querySelector(".ca-team") || {}).textContent || ""; j.dataset.team = t; if (t && !teams.includes(t)) teams.push(t); });
    const bar = document.createElement("div"); bar.className = "ca2-filter"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Filter roles by team");
    const mk = (label, team, n) => { const b = document.createElement("button"); b.type = "button"; b.dataset.team = team; b.setAttribute("aria-pressed", team ? "false" : "true"); b.append(label + " "); const i = document.createElement("i"); i.textContent = n; b.append(i); return b; };
    bar.append(mk("All", "", jobs.length));
    teams.forEach(t => bar.append(mk(t, t, jobs.filter(j => j.dataset.team === t).length)));
    bar.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      bar.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      jobs.forEach(j => { const show = !b.dataset.team || j.dataset.team === b.dataset.team; j.hidden = !show; if (!show) j.open = false; });
    });
    head.append(bar);
  })();

  /* Research study details */
  const RS_SUMMARY = {"Africa's Macro-Economic Outlook": ["Africa's 54 economies are moving at very different speeds. This study looks at the forces shaping growth across the continent, including inflation and currency pressure, debt and public finances, commodity exposure, trade integration and demographic change, and how they combine differently from one market to the next.", "It is written for teams deciding where to invest, expand or hold back, with a focus on separating continent-wide narratives from what is actually happening in specific countries and cities."], "Navigating Africa's Business Landscape": ["Doing business across Africa means working across many markets at once, each with its own regulation, languages, distribution systems, payment habits and ways of building trust.", "This study examines how context and culture shape commercial reality on the ground: how products reach shelves, how informal and formal trade meet, and what organisations often misread when they treat the continent as a single market."], "AI and Productivity in Africa": ["Much of the conversation about AI focuses on automation and job replacement. This study looks at a different role: AI as a layer that augments people and coordinates fragmented systems, information and supply chains.", "It explores where AI could raise productivity in African markets, what conditions it depends on, such as data, connectivity and trust, and where the gains are still uncertain."], "Private Capital in Africa": ["Private capital is playing a growing role in African markets, but outcomes vary widely. This study looks at how risk and return are assessed, and why deals that look strong on paper can succeed or struggle once they meet operating conditions on the ground.", "It covers due diligence gaps, currency and exit risk, local partnerships and the role of better market evidence in investment decisions."], "Africa's Urban Shift": ["Africa has one of the youngest and fastest-urbanising populations in the world. This study looks at how rising cities and younger consumers are changing how people discover, choose and stay loyal to brands.", "It examines new retail channels, mobile money and social commerce, price sensitivity and pack sizes, and what these shifts could mean for companies competing for urban consumers."], "Africa's Critical Minerals Opportunity": ["Demand for minerals used in batteries, electrification and clean energy is reshaping global supply chains, and many of these resources are found in African countries.", "This study looks at the global race for critical minerals and the path from extraction to local value creation, including processing, infrastructure, policy, partnerships and the risks that could hold that path back."], "Harnessing Africa's $2 Trillion Informal Economy": ["A large share of trade, employment and everyday commerce across Africa happens in informal markets that are poorly captured by official data.", "This study explores how the informal economy works, why it matters to companies and policymakers, and how better Ground-Level Intelligence can reveal demand, distribution and opportunity that formal statistics miss."]};
  const rsDetail = $("rs-detail");
  let rsOpener = null;
  const RD_DEFAULT = { note: $("rd-note").textContent, acts: $("rd-acts").innerHTML };
  let rdPushed = false;
  function showDetail() {
    if (!rdPushed) { try { history.pushState({ rd: 1 }, "", location.href); rdPushed = true; } catch (e) {} }
    rsDetail.classList.remove("open"); void rsDetail.offsetWidth;
    rsDetail.classList.add("open"); rsDetail.setAttribute("aria-hidden", "false"); rsDetail.scrollTop = 0;
    setTimeout(() => $("rd-title").focus({ preventScroll: true }), 80);
  }
  /* Highlights open in the same full-screen view: large artwork, title and what we can say about each item so far */
  function openHighlight(card) {
    rsDetail.classList.remove("rd-long"); rsDetail.classList.toggle("rd-light", !!card.closest("#pg-research"));
    rsOpener = card;
    const tag = card.querySelector(".rs-soon"), meta = card.querySelector(".rs-meta").textContent, isArticle = tag && tag.textContent.trim() === "Article";
    $("rd-back-l").textContent = card.closest("#pg-research") ? "All articles" : "All press";
    $("rd-art").innerHTML = card.querySelector(".rs-art").innerHTML;
    $("rd-meta").textContent = meta;
    $("rd-tag").textContent = /webinar/i.test(meta) ? "Webinar" : isArticle ? "Article · Coming soon" : (tag ? tag.textContent : "");
    $("rd-tag").hidden = !$("rd-tag").textContent;
    $("rd-title").textContent = card.querySelector("h3").textContent;
    $("rd-sub").textContent = card.querySelector(".hl-body > p:not(.rs-meta)").textContent;
    $("rd-text").innerHTML = "";
    const acts = $("rd-acts");
    if (/webinar/i.test(meta)) { $("rd-note").textContent = "Registration details will be shared with everyone who registers interest."; acts.innerHTML = '<button type="button" class="obtn solid" data-dialog="access">Register interest</button><button type="button" class="obtn" data-ask>Ask Verisavo</button>'; }
    else if (/coming soon/i.test(meta)) { $("rd-note").textContent = "The first episodes are in preparation."; acts.innerHTML = ""; }
    else if (isArticle) { $("rd-note").textContent = "The full article is coming soon."; acts.innerHTML = ""; }
    else { $("rd-note").textContent = ""; acts.innerHTML = ""; }
    showDetail();
  }
  function openStudy(card) {
    rsDetail.classList.remove("rd-long"); rsDetail.classList.toggle("rd-light", !!card.closest("#pg-research"));
    rsOpener = card;
    $("rd-back-l").textContent = "All research"; $("rd-tag").textContent = "Coming soon"; $("rd-tag").hidden = false;
    $("rd-note").textContent = RD_DEFAULT.note; $("rd-acts").innerHTML = RD_DEFAULT.acts;
    $("rd-art").innerHTML = card.querySelector(".rs-art").innerHTML;
    $("rd-meta").textContent = card.querySelector(".rs-meta").textContent;
    $("rd-title").textContent = card.querySelector("h3").textContent;
    $("rd-sub").textContent = card.querySelector(".rs-sub").textContent;
    const t = $("rd-text"); t.innerHTML = "";
    (RS_SUMMARY[card.dataset.title] || []).forEach(x => { const p = document.createElement("p"); p.textContent = x; t.appendChild(p); });
    showDetail();
  }
  addEventListener("popstate", e => {
    if (rdPushed) { rdPushed = false; closeStudy(true); }
    else if (e.state && e.state.rd && !rsDetail.classList.contains("open")) history.back();   // skip a leftover detail entry
  });
  /* Long-form pages (the featured article and case studies) open in the same full-screen view */
  window.vsOpenDetail = o => {
    rsOpener = o.opener || null;
    $("rd-back-l").textContent = o.back || "Back";
    $("rd-art").innerHTML = o.art || "";
    $("rd-meta").textContent = o.meta || "";
    $("rd-tag").textContent = o.tag || ""; $("rd-tag").hidden = !o.tag;
    $("rd-title").textContent = o.title || ""; $("rd-sub").textContent = o.sub || "";
    $("rd-text").innerHTML = o.html || "";
    $("rd-note").textContent = o.note || ""; $("rd-acts").innerHTML = o.acts || "";
    rsDetail.classList.add("rd-long"); rsDetail.classList.toggle("rd-light", !o.opener || !!o.opener.closest("#pg-research, #ln"));
    showDetail();
  };
  function closeStudy(fromHistory) { if (!rsDetail.classList.contains("open")) return; if (rdPushed && fromHistory !== true) { rdPushed = false; history.back(); } rsDetail.classList.remove("open"); rsDetail.setAttribute("aria-hidden", "true"); if (rsOpener) rsOpener.focus({ preventScroll: true }); }
  document.querySelectorAll(".rs-card").forEach(card => {
    card.addEventListener("click", e => { if (e.target.closest("a")) return; openStudy(card); });
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStudy(card); } });
  });
  document.querySelectorAll(".hl-card").forEach(card => {
    card.tabIndex = 0; card.setAttribute("role", "button"); card.setAttribute("aria-label", card.querySelector("h3").textContent + ", open highlight");
    card.addEventListener("click", e => { if (e.target.closest("a, button")) return; openHighlight(card); });
    card.addEventListener("keydown", e => { if (e.target === card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openHighlight(card); } });
  });
  $("rd-back").addEventListener("click", closeStudy);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && rsDetail.classList.contains("open") && !document.querySelector("dialog[open]")) { e.stopImmediatePropagation(); closeStudy(); } }, true);

  /* Research page articles: open in the full-screen view; show four, then "See more articles" */
  (() => {
    const rows = [...document.querySelectorAll(".ar-row")], more = $("ar-more"), FIRST = 4;
    rows.forEach(r => {
      r.addEventListener("click", () => openHighlight(r));
      r.addEventListener("keydown", e => { if (e.target === r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openHighlight(r); } });
    });
    rows.forEach((r, i) => r.hidden = i >= FIRST);
    more.hidden = rows.length <= FIRST;
    more.addEventListener("click", () => { rows.forEach(r => r.hidden = false); more.hidden = true; (rows[FIRST] || rows[0]).focus({ preventScroll: true }); });
  })();
  /* Highlights pagination: three rows (nine cards) per page */
  (() => {
    const grid = $("hl-grid"), pager = $("hl-pager"), cards = [...grid.querySelectorAll(".hl-card")], PER = 9, pages = Math.ceil(cards.length / PER);
    let cur = 0;
    function show(n, scroll) {
      cur = n;
      cards.forEach((c, i) => { c.hidden = Math.floor(i / PER) !== n; c.style.setProperty("--i", i % PER); });
      pager.innerHTML = "";
      const mk = (label, page, extra) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; Object.assign(b, extra || {}); if (page === cur && !extra) b.setAttribute("aria-current", "page"); b.addEventListener("click", () => show(page, true)); pager.appendChild(b); return b; };
      mk("← Prev", Math.max(0, cur - 1), { disabled: cur === 0, ariaLabel: "Previous page" });
      for (let i = 0; i < pages; i++) mk(String(i + 1), i);
      mk("Next →", Math.min(pages - 1, cur + 1), { disabled: cur === pages - 1, ariaLabel: "Next page" });
      if (scroll) $("hl-h").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    pager.hidden = pages < 2;
    show(0, false);
  })();
  /* Careers: only one role open at a time (fallback for browsers without exclusive <details name>) */
  document.addEventListener("toggle", e => {
    const d = e.target;
    if (!(d instanceof HTMLElement) || !d.classList.contains("ca-job") || !d.open) return;
    document.querySelectorAll("details.ca-job[open]").forEach(o => { if (o !== d) o.open = false; });
  }, true);
  /* Research filters */
  document.querySelectorAll(".rs-chip").forEach(c => c.addEventListener("click", () => {
    document.querySelectorAll(".rs-chip").forEach(x => x.setAttribute("aria-pressed", String(x === c)));
    const f = c.dataset.f;
    document.querySelectorAll(".rs-card").forEach(card => { card.hidden = f !== "All" && card.dataset.cat !== f; });
  }));
  let curPage = null, collageDone = false;
  function showPage(name) {
    if (typeof closeStudy === "function" && rsDetail.classList.contains("open")) { rdPushed = false; closeStudy(true); }
    const el = PAGES[name] || null;
    Object.values(PAGES).forEach(p => { const on = p === el; p.classList.toggle("open", on); p.setAttribute("aria-hidden", String(!on)); });
    document.body.classList.toggle("page-open", !!el);
    curPage = el ? name : null;
    if (el) {
      el.scrollTop = 0;
      if (name === "about-us" && !collageDone) {
        collageDone = true;
        setTimeout(() => {
          const gl = window.vsScene;
          if (!gl || !gl.snapshots) { collageDone = false; return; }
          try {
            const shots = gl.snapshots([[[10, 0, 45], [-30, 45, 95]], [[125, 0, 40], [80, 42, 95]], [[133, 0, -55], [98, 38, -8]], [[-110, 0, 42], [-152, 42, 95]], [[12, 0, -14], [-28, 26, 24]]]);
            document.querySelectorAll("#collage img[data-view]").forEach(img => { img.src = shots[+img.dataset.view]; });
          } catch (e) { /* the collage keeps its plain placeholders */ }
        }, 60);
      }
      setTimeout(() => { const h = el.querySelector("h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }, 120);
    }
  }
  function goPage(name) {
    closeMenu();
    const target = name === "home" ? "" : name;
    if (location.hash.slice(1) === target) { showPage(target); return; }
    location.hash = target || "home";
  }
  /* in-site trail of pages, so Back returns to where the visitor came from (or home if they arrived directly) */
  const trail = [location.hash.slice(1)];
  addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (trail.length > 1 && trail[trail.length - 2] === h) trail.pop(); else trail.push(h);
    showPage(h);
  });
  /* arrived from the Platform page: the first Back returns there */
  let cameFrom = ""; try { cameFrom = sessionStorage.getItem("verisavo-from") || ""; sessionStorage.removeItem("verisavo-from"); } catch (e) {}
  document.addEventListener("click", e => {
    if (!e.target.closest("[data-back]")) return;
    if (trail.length > 1) history.back();
    else if (cameFrom) { if (history.length > 1) history.back(); else location.href = cameFrom; }
    else goPage("home");
  });
  if (PAGES[location.hash.slice(1)]) showPage(location.hash.slice(1));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && curPage && !menu.classList.contains("open") && !document.querySelector("dialog[open]")) goPage("home"); });

  /* Contact form. CONTACT_ENDPOINT: your form backend (POST JSON). Until it is set, nothing is sent. */
  const CONTACT_ENDPOINT = "";
  const cform = $("cform"), cStatus = $("cf-status");
  cform.addEventListener("input", e => e.target.classList.remove("bad"));
  cform.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("cf-name"), email = $("cf-email"), msg = $("cf-msg");
    const bad = [];
    if (!name.value.trim()) bad.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) bad.push(email);
    if (msg.value.trim().length < 10) bad.push(msg);
    bad.forEach(el => el.classList.add("bad"));
    cStatus.hidden = false;
    if (bad.length) { cStatus.textContent = "Add your name, a valid work email and a short message, then send again."; bad[0].focus(); return; }
    const topic = cform.querySelector("input[name=cf-topic]:checked"), org = $("cf-org");
    const body = { name: name.value.trim(), email: email.value.trim(), organisation: org ? org.value.trim() : "", topic: topic ? topic.value : "", message: msg.value.trim() };
    if (!CONTACT_ENDPOINT) {
      cStatus.innerHTML = "";
      const p1 = document.createElement("p");
      p1.textContent = "Thanks, " + body.name.split(" ")[0] + ". This form is not connected to our inbox yet, so your message has not been sent. The quickest way to reach us today is early access on WhatsApp.";
      const b = document.createElement("button"); b.type = "button"; b.className = "pg-link"; b.dataset.dialog = "access"; b.innerHTML = 'Get early access <span aria-hidden="true">→</span>';
      cStatus.append(p1, b); return;
    }
    const btn = $("cf-send"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(r.status);
      cform.reset(); cStatus.textContent = "Thanks. Your message has been sent and our team will reply by email.";
    } catch (err) { cStatus.textContent = "We could not send your message. Please try again shortly."; }
    finally { btn.disabled = false; btn.textContent = "Send message"; }
  });
  /* Arriving with a section in the address (from the product page or Docs): #how, #layer, #product, #cases, #start */
  const sec = location.hash.slice(1);
  if (sec && !PAGES[sec] && document.getElementById(sec) && document.getElementById(sec).closest("#ln")) setTimeout(() => document.getElementById(sec).scrollIntoView({ behavior: "auto" }), 60);
  })();
}
