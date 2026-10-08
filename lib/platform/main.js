// Question box, sign in, early access, menu, Intelligence Assistant window and page behaviour
// Runs once in the browser after the page has rendered (see the page's client component).
export default function init() {
  (() => {
    /* ==================================================================
     * DEPLOYMENT SETTINGS
     * mode "demo": walks through the flow without sending anything (code 123456).
     * mode "live": calls your backend. Generate and check codes on the server
     *   (e.g. Twilio Verify, WhatsApp channel, or a WhatsApp Cloud API
     *   authentication template). Never check codes in the browser.
     * api.start  POST { phone, question } -> 2xx when the code was sent
     * api.check  POST { phone, code }     -> { verified: true, whatsappUrl?: "https://wa.me/..." }
     * whatsappNumber: Verisavo's WhatsApp number, international format, digits only.
     * ================================================================== */
    const CONFIG = { mode: "demo", api: { start: "", check: "" }, whatsappNumber: "", resendSeconds: 30 };

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#year").textContent = new Date().getFullYear();

    /* In-page navigation: buttons that scroll, so nothing opens outside the page */
    $$("[data-scroll]").forEach(btn => btn.addEventListener("click", () => {
      const id = btn.dataset.scroll, el = document.getElementById(id);
      if (!el) return;
      const y = id === "main" ? 0 : el.getBoundingClientRect().top + scrollY - $("#top").offsetHeight - 8;
      scrollTo({ top: Math.max(0, y), behavior: reduced ? "auto" : "smooth" });
      if (id !== "main") { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
    }));

    /* Header */
    const top = $("#top");
    const onScroll = () => top.classList.toggle("line", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    const navLinks = $$(".links [data-scroll]");
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("on", a.dataset.scroll === e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    ["product", "how", "faq"].forEach(id => spy.observe(document.getElementById(id)));

    /* Hero evidence network: market signals twinkle in and out like stars */
    const cv = $("#net"), ctx = cv.getContext("2d");
    const C = { line: "#A8C6E8", dot: "#80AADC", hot: "#4D74C3", label: "#618CD0", hotLabel: "#3A5292" };
    const SIGNALS = ["Price change", "Stockout", "New competitor", "Supplier switch", "Delivery delay", "Brand switch", "Policy change", "Distribution gap", "Retail activity", "Shelf space"];
    let W = 0, H = 0, nodes = [], pointer = null, running = true;
    function build() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(60, Math.max(22, W * H / 18000)));
      nodes = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
        r: Math.random() * 1.1 + 0.9,
        sp: 0.0004 + Math.random() * 0.0009,       // twinkle speed
        ph: Math.random() * Math.PI * 2,           // twinkle phase
        label: i < SIGNALS.length ? SIGNALS[i] : null
      }));
    }
    const fade = x => W < 900 ? Math.max(0, Math.min(0.35, (x / W - 0.55) / 0.3)) : Math.max(0, Math.min(1, (x / W - 0.5) / 0.2));
    // 0..1 brightness; labelled signals fully disappear between appearances
    const glow = (n, t) => reduced ? 1 : 0.5 + 0.5 * Math.sin(t * n.sp + n.ph);
    const ease = v => v * v * (3 - 2 * v);
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      const f = pointer || { x: W * (0.74 + 0.1 * Math.sin(t / 5200)), y: H * (0.32 + 0.16 * Math.cos(t / 6100)) };
      const link = Math.min(140, W / 7), reach = Math.min(210, W / 4.5);
      if (!reduced) for (const n of nodes) { n.x += n.vx; n.y += n.vy; if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20; if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20; }
      for (const n of nodes) n.g = glow(n, t);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = C.line;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          const al = (1 - d / link) * fade((a.x + b.x) / 2) * Math.min(a.g, b.g);
          if (al > 0.01) { ctx.globalAlpha = al; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
      for (const n of nodes) {
        const a = fade(n.x); if (!a) continue;
        const d = Math.hypot(n.x - f.x, n.y - f.y), near = d < reach;
        const g = near ? Math.max(n.g, 0.85) : n.g;
        if (near) { ctx.globalAlpha = (1 - d / reach) * 0.6 * a; ctx.strokeStyle = C.hot; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(n.x, n.y); ctx.stroke(); }
        const star = a * (0.12 + 0.88 * g);
        ctx.globalAlpha = star; ctx.fillStyle = near ? C.hot : C.dot;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (0.8 + 0.5 * g), 0, Math.PI * 2); ctx.fill();
        if (g > 0.8) {                                // brief star glint at peak brightness
          const s = (g - 0.8) / 0.2 * 4;
          ctx.globalAlpha = star * 0.6; ctx.strokeStyle = near ? C.hot : C.dot;
          ctx.beginPath(); ctx.moveTo(n.x - s, n.y); ctx.lineTo(n.x + s, n.y); ctx.moveTo(n.x, n.y - s); ctx.lineTo(n.x, n.y + s); ctx.stroke();
        }
        if (n.label && W >= 700) {
          const la = a * ease(Math.max(0, (g - 0.35) / 0.65));
          if (la > 0.01) {
            ctx.globalAlpha = la; ctx.fillStyle = near ? C.hotLabel : C.label;
            ctx.font = "500 12px Geist, 'Helvetica Neue', Arial, sans-serif";
            const tw = ctx.measureText(n.label).width, lx = n.x + 9 + tw > W - 12 ? n.x - 9 - tw : n.x + 9;
            ctx.fillText(n.label, lx, Math.min(Math.max(n.y + 4, 14), H - 8));
          }
        }
      }
      ctx.globalAlpha = fade(f.x) * 0.8; ctx.strokeStyle = C.hot; ctx.beginPath(); ctx.arc(f.x, f.y, 4, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    function loop(t) { frame(t); if (running && !reduced) requestAnimationFrame(loop); }
    build(); frame(0); if (!reduced) requestAnimationFrame(loop);
    new ResizeObserver(() => { build(); frame(0); }).observe(cv);
    const hero = $(".hero");
    hero.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; if (reduced) frame(0); });
    hero.addEventListener("pointerleave", () => { pointer = null; if (reduced) frame(0); });
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was && !reduced) requestAnimationFrame(loop); }).observe(hero);

    /* Question box */
    const ask = $("#ask-input"), note = $("#ask-note"), chips = $$(".chip"), noteText = note.textContent;
    const sync = () => chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.q === ask.value)));
    const grow = () => { ask.style.height = "auto"; ask.style.height = Math.min(ask.scrollHeight, 160) + "px"; };
    const resetNote = () => { note.textContent = noteText; note.classList.remove("warn"); };
    chips.forEach(c => c.addEventListener("click", () => { ask.value = c.dataset.q; sync(); grow(); resetNote(); ask.focus(); }));
    ask.addEventListener("input", () => { sync(); grow(); resetNote(); });
    ask.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#ask-form").requestSubmit(); } });


    /* Market choice lives in the + menu; a chosen market shows as a removable tag */
    let place = "All markets";
    const placeMenu = $("#place-menu"), placeTag = $("#place-tag");
    const setPlaceMenu = open => { placeMenu.hidden = !open; $("#add-btn").setAttribute("aria-expanded", String(open)); if (open) { const f = placeMenu.querySelector('[aria-checked="true"]'); if (f) f.focus(); } };
    const setPlace = m => {
      place = m; $("#place-label").textContent = m; $("#pick-market-val").textContent = m;
      $$("#place-menu [data-place]").forEach(x => x.setAttribute("aria-checked", String(x.dataset.place === m)));
      placeTag.hidden = m === "All markets";
    };
    $$("#place-menu [data-place]").forEach(b => b.addEventListener("click", () => { setPlace(b.dataset.place); setPlaceMenu(false); ask.focus(); }));
    $("#place-tag-b").addEventListener("click", e => { e.stopPropagation(); setPlaceMenu(placeMenu.hidden); });
    $("#place-tag-x").addEventListener("click", () => { setPlace("All markets"); ask.focus(); });
    document.addEventListener("click", e => { if (!placeMenu.hidden && !e.target.closest("#place-menu, #pick-market, #place-tag-b")) setPlaceMenu(false); });
    placeMenu.addEventListener("keydown", e => {
      const its = $$("#place-menu [data-place]"), i = its.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); its[(i + (e.key === "ArrowDown" ? 1 : -1) + its.length) % its.length].focus(); }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setPlaceMenu(false); $("#add-btn").focus(); }
    });
    window.vsOpenPlaceMenu = () => setPlaceMenu(true);
    window.vsPlace = () => place;


    /* Question box theme: light by default, dark on request (remembered in this browser when allowed) */
    const chatForm = $("#ask-form"), chatTheme = $("#chat-theme");
    const setChatTheme = dark => { chatForm.classList.toggle("dark", dark); chatTheme.setAttribute("aria-pressed", String(dark)); const l = dark ? "Switch to light mode" : "Switch to dark mode"; chatTheme.setAttribute("aria-label", l); chatTheme.title = l; };
    let askLight = false; try { askLight = localStorage.getItem("verisavo-ask-theme") === "light"; } catch (e) {}
    setChatTheme(!askLight);
    chatTheme.addEventListener("click", () => { const d = !chatForm.classList.contains("dark"); setChatTheme(d); try { localStorage.setItem("verisavo-ask-theme", d ? "dark" : "light"); } catch (e) {} });

    /* Typing placeholder: example questions type in letter by letter, pause, erase, and cycle */
    const QUESTIONS = [
      "Where should we launch our product first?",
      "Who are our main competitors in this market?",
      "How are prices changing across retail channels?",
      "Where do stockouts happen most often?",
      "What don't we know yet that could change our plan?"
    ];
    if (!reduced) {
      let qi = 0, ci = 0, deleting = false;
      let askSeen = false;   // only sound the typing while the question box is on screen
      if ("IntersectionObserver" in window) new IntersectionObserver(es => { askSeen = es[0].isIntersecting; }, { threshold: .4 }).observe(ask);
      const tick = () => {
        if (ask.value) { ask.placeholder = ""; return setTimeout(tick, 600); }   // visitor is typing: step aside
        const q = QUESTIONS[qi];
        if (!deleting) {
          ci++;
          ask.placeholder = q.slice(0, ci) + (ci < q.length ? "|" : "");
          if (window.vsSound && askSeen && ci % 2) window.vsSound.type();
          if (ci === q.length) { deleting = true; return setTimeout(tick, 2200); }   // hold the full question
          return setTimeout(tick, 45 + Math.random() * 55);                          // natural typing rhythm
        }
        ci--;
        ask.placeholder = q.slice(0, ci);
        if (ci === 0) { deleting = false; qi = (qi + 1) % QUESTIONS.length; return setTimeout(tick, 450); }
        return setTimeout(tick, 22);
      };
      ask.placeholder = "";
      setTimeout(tick, 700);
    }
    $$("#ask-cta, [data-to-ask]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.q) { ask.value = b.dataset.q; ask.dispatchEvent(new Event("input")); }
      $("#ask-form").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      ask.focus({ preventScroll: true });
    }));
    $("#ask-form").addEventListener("submit", e => {
      e.preventDefault();
      if (ask.value.trim().length < 6) { note.textContent = "Type your question first, or choose an example."; note.classList.add("warn"); ask.focus(); return; }
      if (window.vaSignedIn && window.vaSignedIn()) { if (window.vaSetScope) window.vaSetScope(place); window.vaOpen(null, ask.value); return; }
      openAuth("up"); $("#a-lead").textContent = "Create an account or sign in to send your question.";
    });




    /* Generic tab groups: [data-tabs] container with [role=tab] buttons controlling panels */
    $$("[data-tabs]").forEach(group => {
      const ts = $$("[role=tab]", group);
      const pick = i => ts.forEach((t, k) => { const on = k === i; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute("aria-controls")).hidden = !on; });
      ts.forEach((t, i) => {
        t.addEventListener("click", () => pick(i));
        t.addEventListener("keydown", e => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); const n = (i + d + ts.length) % ts.length; pick(n); ts[n].focus(); } });
      });
    });

    /* Comparison chart: select an approach from the list or the chart */
    const apTabs = $$(".ap-list [role=tab]");
    const apLayouts = JSON.parse(($("#apchart") || {}).dataset?.layouts || "[]");
    let apCur = 0, apFollow = null;
    const apPick = i => {
      apCur = i;
      apTabs.forEach((t, k) => { const on = k === i; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      const tl = apTabs[i], lst = tl && tl.parentElement; if (lst && lst.scrollWidth > lst.clientWidth) lst.scrollTo({ left: tl.offsetLeft - lst.offsetLeft - 4, behavior: "smooth" });
      $$(".apt").forEach(g => g.classList.toggle("on", +g.dataset.i === i));
      const L = apLayouts[i]; if (L) { $$(".apt").forEach(g => { const [x, y] = L[+g.dataset.i]; g.style.transform = `translate(${x}px, ${y}px)`; }); const [vx, vy] = L[4]; $(".apv").style.transform = `translate(${vx}px, ${vy}px)`; }
      if (apFollow) apFollow();
    };
    apTabs.forEach((t, i) => {
      t.addEventListener("click", () => apPick(i));
      t.addEventListener("keydown", e => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const n = (i + d + apTabs.length) % apTabs.length; apPick(n); apTabs[n].focus(); } });
    });
    /* Notes on the dots: one short line, only when someone hovers or taps */
    const AP_NOTES = ["Point-in-time snapshot, not updated.", "Single brief, findings not carried forward.", "Indicators only, limited local context.", "Online sources only, unverified."];
    const AP_NAMES = ["Market reports", "Research agencies", "Data providers", "General AI tools"];
    const apTip = $("#ap-tip"), apPanel = apTip && apTip.closest(".ap-panel"), apBox = apTip && apTip.closest(".apbox");
    let tipFor = null, tipPin = null;   // what is showing now, and what was clicked
    const placeTip = () => {
      if (!apTip || tipFor === null || apTip.hidden) return;
      const L = apLayouts[apCur], svg = $("#apchart"); if (!L || !svg) return;
      const [x, y] = L[tipFor === "v" ? 4 : tipFor];
      const sr = svg.getBoundingClientRect(), pr = apPanel.getBoundingClientRect(), k = sr.width / 620;
      const px = sr.left - pr.left + x * k, py = sr.top - pr.top + y * k;
      const w = apTip.offsetWidth, h = apTip.offsetHeight, gap = 14;
      const left = Math.max(8, Math.min(px - w / 2, pr.width - w - 8));
      const above = py - h - gap >= 4;
      apTip.style.left = left + "px";
      apTip.style.top = (above ? py - h - gap : py + gap) + "px";
    };
    const showTip = which => {
      if (!apTip) return;
      if (which === null) { tipFor = null; apTip.classList.remove("in"); apTip.hidden = true; $$(".apt, .apv").forEach(g => g.classList.remove("tip")); return; }
      if (which !== tipFor || apTip.hidden) {
        tipFor = which;
        apTip.classList.toggle("ap-tip-v", which === "v");
        apTip.innerHTML = which === "v" ? "<b>Verisavo</b><span>Continuously updated, locally verified.</span>" : "<b>" + AP_NAMES[which] + "</b><span>" + AP_NOTES[which] + "</span>";
        apTip.classList.remove("in"); apTip.hidden = false;
        requestAnimationFrame(() => apTip.classList.add("in"));
      }
      placeTip();
      $$(".apt, .apv").forEach(g => g.classList.toggle("tip", which === "v" ? g.classList.contains("apv") : g.dataset.i == which));
    };
    // a note that is open travels with its dot when the layout changes
    apFollow = () => { if (tipFor === null) return; const t0 = performance.now(); const step = () => { placeTip(); if (performance.now() - t0 < 950) requestAnimationFrame(step); }; requestAnimationFrame(step); };
    // moving across the approach list switches the chart and names what that approach lacks
    apTabs.forEach((t, i) => {
      t.addEventListener("pointerenter", e => { if (e.pointerType !== "mouse") return; if (i !== apCur) apPick(i); showTip(i); });
      t.addEventListener("click", () => { tipPin = i; showTip(i); });
      t.addEventListener("focus", () => showTip(i));
    });
    if (apBox) apBox.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") showTip(tipPin); });
    $$(".apt, .apv").forEach(g => {
      const which = g.classList.contains("apv") ? "v" : +g.dataset.i;
      g.style.cursor = "pointer";
      g.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") showTip(which); });
      g.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") showTip(tipPin !== null ? tipPin : (tipFor === which ? null : tipFor)); });
      const pick = () => { if (which !== "v") apPick(which); tipPin = which; showTip(which); };
      g.addEventListener("click", pick);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
    const clearTip = () => { tipPin = null; showTip(null); };
    document.addEventListener("click", e => { if (tipFor !== null && !e.target.closest(".ap-tip, .apt, .apv, .ap-list")) clearTip(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && tipFor !== null) clearTip(); });
    // scrolling the chart away closes its note, so nothing repeats on the way back
    if (apTip && "IntersectionObserver" in window) new IntersectionObserver(([e]) => { if (!e.isIntersecting) clearTip(); }, { threshold: 0 }).observe($("#apchart"));
    addEventListener("resize", placeTip);
    const apSvg = $("#apchart");
    if (apSvg) {  // swipe the chart left or right to move between approaches
      let sx = null, sy = null;
      apSvg.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
      apSvg.addEventListener("pointerup", e => {
        if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) apPick((apCur + (dx < 0 ? 1 : -1) + apTabs.length) % apTabs.length);
      });
      apSvg.addEventListener("pointercancel", () => { sx = null; });
    }
    if (apTabs.length) apPick(0);

    /* Copy buttons on record blocks */
    $$("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
      const pre = document.getElementById(btn.dataset.copy), label = btn.querySelector("span");
      try { await navigator.clipboard.writeText(pre.textContent); label.textContent = "Copied"; }
      catch { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = "Selected"; }
      setTimeout(() => label.textContent = "Copy", 1600);
    }));

    /* Early access: WhatsApp number -> code -> WhatsApp */
    const COUNTRIES = [["NG","Nigeria","234"],["GH","Ghana","233"],["KE","Kenya","254"],["ZA","South Africa","27"],["CI","Côte d'Ivoire","225"],["SN","Senegal","221"],["CM","Cameroon","237"],["EG","Egypt","20"],["MA","Morocco","212"],["ET","Ethiopia","251"],["TZ","Tanzania","255"],["UG","Uganda","256"],["RW","Rwanda","250"],["ZM","Zambia","260"],["GB","United Kingdom","44"],["US","United States","1"],["FR","France","33"],["AE","United Arab Emirates","971"]];
    const cc = $("#cc");
    COUNTRIES.forEach(([c, name, dial]) => { const o = document.createElement("option"); o.value = dial; o.textContent = c + " +" + dial; o.setAttribute("aria-label", name + " +" + dial); cc.appendChild(o); });

    const dlg = $("#access"), stepsEl = [$("#step1"), $("#step2"), $("#step3")];
    const tel = $("#tel"), consent = $("#consent"), box = $("#phone-box"), m1 = $("#m1"), m2 = $("#m2"), m3 = $("#m3");
    let phone = "", opener = null, resendTimer = 0, verified = false, checking = false;

    function show(n) {
      stepsEl.forEach((s, i) => s.hidden = i !== n);
    }
    function openAccess() {
      opener = document.activeElement;
      if (!verified) { show(0); m1.textContent = ""; }
      dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "");
      setTimeout(() => (verified ? $("#wa-link") : tel).focus(), 30);
    }
    const close = () => dlg.close ? dlg.close() : dlg.removeAttribute("open");
    dlg.addEventListener("close", () => opener && opener.focus && opener.focus());
    $("#x").addEventListener("click", close);
    dlg.addEventListener("click", e => { if (e.target === dlg) close(); });
    $$("[data-access]").forEach(b => b.addEventListener("click", openAccess));
    tel.addEventListener("input", () => { tel.value = tel.value.replace(/[^\d\s-]/g, ""); box.classList.remove("bad"); m1.textContent = ""; });
    consent.addEventListener("change", () => m1.textContent = "");

    const wait = ms => new Promise(r => setTimeout(r, ms));
    const busy = (btn, on, label) => { btn.disabled = on; btn.innerHTML = on ? '<span class="spin" aria-hidden="true"></span>' + label : label; };
    async function post(url, body) {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
      let data = {}; try { data = await r.json(); } catch {}
      if (!r.ok) throw Object.assign(new Error("failed"), { status: r.status });
      return data;
    }
    async function sendCode() {
      if (CONFIG.mode !== "live") return wait(700);
      if (!CONFIG.api.start) throw { config: true };
      return post(CONFIG.api.start, { phone: "+" + phone, question: ask.value.trim() });
    }
    async function checkCode(code) {
      if (CONFIG.mode !== "live") { await wait(600); return { verified: code === "123456" }; }
      if (!CONFIG.api.check) throw { config: true };
      return post(CONFIG.api.check, { phone: "+" + phone, code });
    }

    $("#step1").addEventListener("submit", async e => {
      e.preventDefault();
      const digits = tel.value.replace(/\D/g, "").replace(/^0+/, "");
      if (digits.length < 7 || (cc.value + digits).length > 15) { box.classList.add("bad"); m1.textContent = "Enter a valid number without the country code."; tel.focus(); return; }
      if (!consent.checked) { m1.textContent = "Tick the box to receive the code."; consent.focus(); return; }
      phone = cc.value + digits;
      const btn = $("#send-code"); busy(btn, true, "Sending…");
      try {
        await sendCode();
        $("#num-show").textContent = "+" + cc.value + " " + tel.value.trim().replace(/^0+/, "");
        buildOtp(); show(1); startResend(); $$("#otp input")[0].focus();
      } catch (err) {
        m1.textContent = err.config ? "Verification isn't connected yet. Please try again later." : err.status === 429 ? "Too many attempts. Try again in a few minutes." : "We couldn't send the code. Check the number and try again.";
      } finally { busy(btn, false, "Send code"); }
    });

    function buildOtp() {
      const otp = $("#otp"); otp.innerHTML = ""; otp.classList.remove("bad"); m2.textContent = "";
      for (let i = 0; i < 6; i++) { const inp = document.createElement("input"); inp.type = "text"; inp.inputMode = "numeric"; inp.maxLength = 1; inp.setAttribute("aria-label", "Digit " + (i + 1) + " of 6"); if (!i) inp.autocomplete = "one-time-code"; otp.appendChild(inp); }
      const ins = $$("#otp input");
      const fill = (str, from) => { str.slice(0, 6 - from).split("").forEach((ch, k) => { ins[from + k].value = ch; ins[from + k].classList.add("filled"); }); (ins.find(x => !x.value) || ins[5]).focus(); if (ins.every(x => x.value)) $("#step2").requestSubmit(); };
      ins.forEach((inp, i) => {
        inp.addEventListener("input", () => {
          const v = inp.value.replace(/\D/g, "");
          if (v.length > 1) return fill(v, i);
          inp.value = v; inp.classList.toggle("filled", !!v); otp.classList.remove("bad"); m2.textContent = "";
          if (v && i < 5) ins[i + 1].focus();
          if (ins.every(x => x.value)) $("#step2").requestSubmit();
        });
        inp.addEventListener("keydown", e => {
          if (e.key === "Backspace" && !inp.value && i > 0) { e.preventDefault(); ins[i - 1].value = ""; ins[i - 1].classList.remove("filled"); ins[i - 1].focus(); }
          if (e.key === "ArrowLeft" && i > 0) ins[i - 1].focus();
          if (e.key === "ArrowRight" && i < 5) ins[i + 1].focus();
        });
        inp.addEventListener("paste", e => { e.preventDefault(); fill((e.clipboardData.getData("text") || "").replace(/\D/g, ""), i); });
        inp.addEventListener("focus", () => inp.select());
      });
    }
    function startResend() {
      const btn = $("#resend"); let s = CONFIG.resendSeconds; clearInterval(resendTimer);
      btn.disabled = true; btn.textContent = "Resend in " + s + "s";
      resendTimer = setInterval(() => { s--; if (s <= 0) { clearInterval(resendTimer); btn.disabled = false; btn.textContent = "Resend code"; } else btn.textContent = "Resend in " + s + "s"; }, 1000);
    }
    $("#resend").addEventListener("click", async () => { try { await sendCode(); m2.textContent = ""; startResend(); $$("#otp input")[0].focus(); } catch { m2.textContent = "We couldn't resend the code. Try again shortly."; } });
    $("#change").addEventListener("click", () => { clearInterval(resendTimer); show(0); tel.focus(); });

    $("#step2").addEventListener("submit", async e => {
      e.preventDefault();
      if (checking) return;
      const otp = $("#otp"), code = $$("#otp input").map(x => x.value).join("");
      if (code.length < 6) { otp.classList.add("bad"); m2.textContent = "Enter all 6 digits."; return; }
      checking = true; const btn = $("#verify"); busy(btn, true, "Checking…");
      try {
        const res = await checkCode(code);
        if (!res || !res.verified) throw { wrong: true };
        verified = true; clearInterval(resendTimer); finish(res.whatsappUrl);
      } catch (err) {
        otp.classList.remove("shake"); void otp.offsetWidth; otp.classList.add("bad", "shake");
        m2.textContent = err.wrong || err.status === 400 || err.status === 401 ? "That code doesn't match. Try again." : err.status === 429 ? "Too many attempts. Request a new code." : "We couldn't check the code. Try again.";
        $$("#otp input").forEach(x => { x.value = ""; x.classList.remove("filled"); }); $$("#otp input")[0].focus();
      } finally { checking = false; busy(btn, false, "Verify"); }
    });

    function finish(url) {
      const q = ask.value.trim();
      const text = "Hi Verisavo, I'd like early access." + (q ? "\n\nMy question: " + q : "");
      $("#wa-text").textContent = text;
      const link = $("#wa-link");
      const href = url || (CONFIG.whatsappNumber ? "https://wa.me/" + CONFIG.whatsappNumber.replace(/\D/g, "") + "?text=" + encodeURIComponent(text) : "");
      if (href) { link.href = href; link.removeAttribute("aria-disabled"); link.removeAttribute("tabindex"); m3.textContent = ""; }
      else { link.href = "#"; link.setAttribute("aria-disabled", "true"); link.tabIndex = -1; m3.textContent = "The Verisavo WhatsApp number hasn't been added to this page yet."; }
      show(2); $("#step3").focus();
    }

    /* ---------- Sign in / Sign up ----------
     * AUTH.googleUrl: your OAuth start URL (e.g. https://app.verisavo.com/auth/google). Leave empty until it exists.
     * AUTH.emailEndpoint: POST { mode, email, name?, organisation? } -> 2xx when a sign-in link or code was sent.
     */
    const AUTH = { googleUrl: "", emailEndpoint: "", demo: true };
    const finishDemo = user => { auth.dataset.handoff = "1"; closeAuth(); try { sessionStorage.setItem("verisavo-user", JSON.stringify(user)); } catch (e) {} const q = ($("#ask-input") || {}).value || ""; if (q.trim() && window.vaSetScope && window.vsPlace) window.vaSetScope(window.vsPlace()); if (window.vaOpen) window.vaOpen(user, q); };
    const auth = $("#auth"), aTabs = $$("#auth [role=tab]"), aMsg = $("#a-msg"), aForm = $("#a-form"), aSent = $("#a-sent");
    let aMode = "in", aOpener = null;
    function setAuth(mode) {
      aMode = mode;
      aTabs.forEach(t => { const on = t.dataset.mode === mode; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      $("#a-title").textContent = mode === "in" ? "Welcome back" : "Create your account";
      $("#a-lead").textContent = mode === "in" ? "Sign in to your Verisavo account." : "Sign up to start with Verisavo.";
      $$(".a-up").forEach(el => el.hidden = mode === "in");
      $("#a-submit").textContent = mode === "in" ? "Continue with email" : "Create account";
      $("#a-switch-text").textContent = mode === "in" ? "New to Verisavo?" : "Already have an account?";
      $("#a-switch").textContent = mode === "in" ? "Sign up" : "Sign in";
      aMsg.textContent = ""; aForm.hidden = false; aSent.hidden = true;
    }
    function openAuth(mode) {
      aOpener = document.activeElement; setAuth(mode || "in");
      auth.showModal ? auth.showModal() : auth.setAttribute("open", "");
      setTimeout(() => $("#a-google").focus(), 30);
    }
    const closeAuth = () => auth.close ? auth.close() : auth.removeAttribute("open");
    auth.addEventListener("close", () => { if (!auth.dataset.handoff && aOpener && aOpener.focus) aOpener.focus(); delete auth.dataset.handoff; });
    auth.addEventListener("click", e => { if (e.target === auth) closeAuth(); });
    $("#a-x").addEventListener("click", closeAuth);
    aTabs.forEach(t => t.addEventListener("click", () => setAuth(t.dataset.mode)));
    $("#a-switch").addEventListener("click", () => setAuth(aMode === "in" ? "up" : "in"));
    $$("[data-login]").forEach(b => b.addEventListener("click", () => window.vaSignedIn && window.vaSignedIn() ? window.vaOpen() : openAuth("in")));
    $$("[data-signup]").forEach(b => b.addEventListener("click", () => openAuth("up")));
    const notReady = () => { aMsg.innerHTML = 'Accounts are not open yet. Verisavo is in private early access. <button type="button" class="linkish" id="a-ea">Get early access</button>'; $("#a-ea").addEventListener("click", () => { closeAuth(); openAccess(); }); };
    $("#a-google").addEventListener("click", e => {
      if (AUTH.googleUrl) { $("#a-google").href = AUTH.googleUrl + (AUTH.googleUrl.includes("?") ? "&" : "?") + "mode=" + aMode; return; }
      e.preventDefault(); if (AUTH.demo) finishDemo({ name: "", email: "", via: "google" }); else notReady();
    });
    aForm.addEventListener("submit", async e => {
      e.preventDefault(); aMsg.textContent = "";
      const email = $("#a-email").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { aMsg.textContent = "Enter a valid email address."; $("#a-email").focus(); return; }
      if (aMode === "up" && !$("#a-name").value.trim()) { aMsg.textContent = "Enter your name."; $("#a-name").focus(); return; }
      if (!AUTH.emailEndpoint) { if (AUTH.demo) finishDemo({ name: $("#a-name").value.trim(), email, organisation: $("#a-org").value.trim() }); else notReady(); return; }
      const btn = $("#a-submit"), label = btn.textContent; btn.disabled = true; btn.textContent = "Sending…";
      try {
        const r = await fetch(AUTH.emailEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: aMode, email, name: $("#a-name").value.trim(), organisation: $("#a-org").value.trim() }) });
        if (!r.ok) throw new Error(r.status);
        $("#a-sent-to").textContent = email; aForm.hidden = true; aSent.hidden = false;
      } catch { aMsg.textContent = "We couldn't send that. Please try again."; }
      finally { btn.disabled = false; btn.textContent = label; }
    });

    /* Market scene: lines draw in on load; the crowd walks in on load and keeps walking as the page scrolls.
       People leave one side and come back in from the other, so new faces keep arriving. */
    const scene = document.querySelector(".scene");
    if (scene && !reduced) {
      const lyrs = [...scene.querySelectorAll(".lyr")].map(g => ({ g, k: +g.dataset.k }));
      const wks = [...scene.querySelectorAll(".wk")].map(g => ({ g, x: +g.dataset.x, d: +g.dataset.d, v: +g.dataset.v }));
      const t0 = performance.now(), INTRO = 3200, WALK_IN = 170, SPAN = 1480, LEFT = -140;
      let cur = scrollY, vis = true, raf = 0;
      const tick = now => {
        raf = 0;
        const t = Math.min(1, (now - t0) / INTRO), e = 1 - Math.pow(1 - t, 3);
        cur += (scrollY - cur) * 0.1;
        lyrs.forEach(({ g, k }) => { g.style.transform = `translateX(${(k * cur).toFixed(2)}px)`; });
        wks.forEach(({ g, x, d, v }) => {
          const pos = x + d * (v * cur - WALK_IN * (1 - e));
          const px = ((pos - LEFT) % SPAN + SPAN) % SPAN + LEFT;
          const bob = -Math.abs(Math.sin(pos * 0.09)) * 2.2;
          g.style.transform = `translate(${px.toFixed(2)}px, ${bob.toFixed(2)}px)`;
        });
        if (vis && (t < 1 || Math.abs(scrollY - cur) > 0.3)) raf = requestAnimationFrame(tick);
      };
      const kick = () => { if (!raf && vis) raf = requestAnimationFrame(tick); };
      addEventListener("scroll", kick, { passive: true });
      new IntersectionObserver(([en]) => { vis = en.isIntersecting; kick(); }).observe(scene.closest(".stage"));
      kick();
    }

    /* Legal dialog: shows only the document that was clicked */
    const legalDlg = $("#legal");
    if (legalDlg) {
      let lOpener = null;
      const openLegal = doc => {
        lOpener = document.activeElement;
        ["privacy", "terms"].forEach(d => { const el = $("#l-" + d); el.hidden = d !== doc; el.scrollTop = 0; });
        legalDlg.setAttribute("aria-labelledby", "lh-" + doc);
        legalDlg.showModal ? legalDlg.showModal() : legalDlg.setAttribute("open", "");
        setTimeout(() => $("#l-" + doc).focus(), 30);
      };
      const closeLegal = () => legalDlg.close ? legalDlg.close() : legalDlg.removeAttribute("open");
      $$("[data-legal]").forEach(b => b.addEventListener("click", () => openLegal(b.dataset.legal)));
      $("#l-x").addEventListener("click", closeLegal);
      legalDlg.addEventListener("click", e => { if (e.target === legalDlg) closeLegal(); });
      legalDlg.addEventListener("close", () => { if (lOpener && lOpener.focus && !legalDlg.dataset.handoff) lOpener.focus(); delete legalDlg.dataset.handoff; });
      $$("[data-legal-contact]").forEach(b => b.addEventListener("click", () => { legalDlg.dataset.handoff = "1"; closeLegal(); document.querySelector("[data-access]").click(); }));
    }

    /* Attachments: the + button adds images or files to the question */
    const addBtn = $("#add-btn"), addMenu = $("#add-menu"), attList = $("#att-list");
    if (addBtn) {
      const MAX_FILES = 10, MAX_MB = 20, files = [];
      const items = $$("#add-menu [role=menuitem]");
      const openMenu = () => { addMenu.hidden = false; addBtn.setAttribute("aria-expanded", "true"); items[0].focus(); };
      const closeMenu = (focusBtn) => { if (addMenu.hidden) return; addMenu.hidden = true; addBtn.setAttribute("aria-expanded", "false"); if (focusBtn) addBtn.focus(); };
      addBtn.addEventListener("click", () => { if (!$("#place-menu").hidden) { $("#place-menu").hidden = true; addBtn.setAttribute("aria-expanded", "false"); return; } addMenu.hidden ? openMenu() : closeMenu(true); });
      addMenu.addEventListener("keydown", e => {
        const i = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus(); }
        if (e.key === "Escape") { e.preventDefault(); closeMenu(true); }
        if (e.key === "Tab") closeMenu(false);
      });
      document.addEventListener("click", e => { if (!e.target.closest(".attach")) closeMenu(false); });
      items.forEach(b => b.addEventListener("click", e => { closeMenu(false); if (b.dataset.pick) $("#" + b.dataset.pick).click(); else { e.stopPropagation(); window.vsOpenPlaceMenu(); } }));
      const fmt = n => n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1048576).toFixed(1) + " MB";
      const docIcon = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M5 2.5h5.5L14 6v9.5H5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M10.5 2.5V6H14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      const render = () => {
        attList.innerHTML = "";
        files.forEach((f, i) => {
          const li = document.createElement("li"); li.className = "att";
          const th = document.createElement("span"); th.className = "att-thumb";
          if (f.url) { const im = document.createElement("img"); im.src = f.url; im.alt = ""; th.appendChild(im); } else th.innerHTML = docIcon;
          const meta = document.createElement("span"); meta.className = "att-meta";
          const nm = document.createElement("span"); nm.className = "att-name"; nm.textContent = f.file.name; nm.title = f.file.name;
          const sz = document.createElement("span"); sz.className = "att-size"; sz.textContent = fmt(f.file.size);
          meta.append(nm, sz);
          const x = document.createElement("button"); x.type = "button"; x.className = "att-x"; x.setAttribute("aria-label", "Remove " + f.file.name);
          x.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
          x.addEventListener("click", () => { if (f.url) URL.revokeObjectURL(f.url); files.splice(i, 1); render(); (attList.querySelector(".att-x") || addBtn).focus(); });
          li.append(th, meta, x); attList.appendChild(li);
        });
        attList.hidden = files.length === 0;
      };
      const take = input => {
        let skipped = 0;
        [...input.files].forEach(file => {
          if (files.length >= MAX_FILES || file.size > MAX_MB * 1048576) { skipped++; return; }
          files.push({ file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" });
        });
        input.value = "";
        render();
        note.classList.toggle("warn", skipped > 0);
        note.textContent = skipped ? `Some files were not added. You can attach up to ${MAX_FILES} files, each under ${MAX_MB} MB.` : "";
      };
      ["pick-image", "pick-file"].forEach(id => $("#" + id).addEventListener("change", e => take(e.target)));
    }

    /* Mobile menu */
    const mBtn = $("#menu-btn"), mMenu = $("#m-menu");
    if (mBtn) {
      const setMenu = open => { mMenu.hidden = !open; mBtn.setAttribute("aria-expanded", open); mBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
      mBtn.addEventListener("click", () => { const open = mMenu.hidden; setMenu(open); if (open) mMenu.querySelector("button").focus(); });
      mMenu.addEventListener("click", () => setMenu(false), true);
      document.addEventListener("keydown", e => { if (e.key === "Escape" && !mMenu.hidden) { setMenu(false); mBtn.focus(); } });
      document.addEventListener("click", e => { if (!mMenu.hidden && !e.target.closest("#top")) setMenu(false); });
      matchMedia("(min-width: 821px)").addEventListener("change", e => { if (e.matches) setMenu(false); });
    }

    /* Full-screen menu, the same as on the homepage */
    const vBtn = $("#vmenu-btn"), vMenu = $("#vmenu"), vLab = $("#vmenu-lab");
    const setV = open => {
      vMenu.classList.toggle("open", open); vMenu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      vBtn.setAttribute("aria-expanded", String(open)); vLab.textContent = open ? "Close" : "Menu";
      if (open) setTimeout(() => { const f = vMenu.querySelector("button, a"); if (f) f.focus({ preventScroll: true }); }, 350);
    };
    vBtn.addEventListener("click", () => setV(!vMenu.classList.contains("open")));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && vMenu.classList.contains("open")) { setV(false); vBtn.focus(); } });
    vMenu.addEventListener("click", e => {
      const it = e.target.closest("button, a"); if (!it) return;
      if (!it.dataset.mn && !it.hasAttribute("data-access") && !it.hasAttribute("data-login") && !it.hasAttribute("data-legal") && !it.href) return;
      setV(false);
      if (it.dataset.mn === "platform") { $("#ask-form").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); ask.focus({ preventScroll: true }); }
      if (it.dataset.mn === "scout") { ask.value = "Check which kiosks near the main bus park stock our 200ml pack, and how often they reorder."; ask.dispatchEvent(new Event("input")); openAccess(); }
    });

    /* Links to the story homepage */
    /* remember that the visitor opened a homepage page from here, so its Back link can return to this page */
    const markFrom = href => { if (/#(about-us|research|contact|pricing|careers)$/.test(href)) { try { sessionStorage.setItem("verisavo-from", "/platform"); } catch (e) {} } };
    $$("[data-href]").forEach(b => b.addEventListener("click", () => { markFrom(b.dataset.href); location.href = b.dataset.href; }));
    $$('a[href^="/#"]').forEach(l => l.addEventListener("click", () => markFrom(l.getAttribute("href"))));

    /* ---------- Verisavo Intelligence Assistant ----------
     * ASSISTANT.endpoint: POST { question, scope, user } -> JSON { answer } (plain text).
     * Leave empty until the assistant service exists; questions are then shown with a "not connected yet" status,
     * never with a made-up answer.
     */
    const ASSISTANT = { endpoint: "" };
    const va = $("#va");
    if (va) {
      const app = $(".va-app", va), vin = $("#va-in"), vsend = $("#va-send"), thread = $("#va-thread"), recentEl = $("#va-recent");
      const state = { user: null, scope: "All markets", convs: [], cur: null, files: [] };
      const esc = t => t.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const isNarrow = () => matchMedia("(max-width: 760px)").matches;

      const grow = () => { vin.style.height = "auto"; vin.style.height = Math.min(vin.scrollHeight, 168) + "px"; vsend.disabled = !vin.value.trim(); };
      vin.addEventListener("input", grow);
      vin.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (vin.value.trim()) send(vin.value); } });
      $("#va-form").addEventListener("submit", e => { e.preventDefault(); if (vin.value.trim()) send(vin.value); });


      /* theme: dark galaxy by default, light on request (remembered in this browser when allowed) */
      const vaMain = $(".va-main", va), themeBtn = $("#va-theme");
      const setTheme = dark => {
        vaMain.classList.toggle("va-dark", dark);
        themeBtn.setAttribute("aria-pressed", dark);
        const lbl = dark ? "Switch to light theme" : "Switch to dark theme";
        themeBtn.setAttribute("aria-label", lbl); themeBtn.title = lbl;
      };
      try { if (localStorage.getItem("verisavo-va-theme") === "light") setTheme(false); } catch (e) {}
      themeBtn.addEventListener("click", () => { const dark = !vaMain.classList.contains("va-dark"); setTheme(dark); try { localStorage.setItem("verisavo-va-theme", dark ? "dark" : "light"); } catch (e) {} });

      /* popovers: scope, more, gear, privacy tip */
      const pops = [["#va-scope", "#va-scope-menu"], ["#va-more", "#va-more-menu"], ["#va-gear", "#va-gear-menu"], ["#va-shield", "#va-shield-tip"]];
      const closePops = except => pops.forEach(([b, m]) => { if (b !== except) { $(m).hidden = true; $(b).setAttribute("aria-expanded", "false"); } });
      pops.forEach(([b, m]) => $(b).addEventListener("click", e => { e.stopPropagation(); const open = $(m).hidden; closePops(b); $(m).hidden = !open; $(b).setAttribute("aria-expanded", open); if (open) { const f = $(m).querySelector("button"); if (f) f.focus(); } }));
      va.addEventListener("click", e => { if (!e.target.closest(".va-pop-wrap")) closePops(); });
      va.addEventListener("keydown", e => { if (e.key === "Escape") { const openPop = pops.find(([, m]) => !$(m).hidden); if (openPop) { e.preventDefault(); closePops(); $(openPop[0]).focus(); } else if (app.classList.contains("va-drawer")) { e.preventDefault(); setDrawer(false); } } });
      $$("#va-scope-menu [data-market]").forEach(b => b.addEventListener("click", () => {
        state.scope = b.dataset.market; $("#va-scope-label").textContent = state.scope;
        $$("#va-scope-menu [data-market]").forEach(x => x.setAttribute("aria-checked", x === b));
        closePops(); vin.focus();
      }));

      /* sidebar: collapse on desktop, drawer on phones */
      const setDrawer = open => { app.classList.toggle("va-drawer", open); $("#va-scrim").hidden = !open; $("#va-open-side").setAttribute("aria-expanded", open); };
      $("#va-side-x").addEventListener("click", () => { if (isNarrow()) setDrawer(false); else { app.classList.add("va-collapsed"); $("#va-open-side").focus(); } });
      $("#va-open-side").addEventListener("click", () => { if (isNarrow()) setDrawer(true); else { app.classList.remove("va-collapsed"); $("#va-side-x").focus(); } });
      $("#va-scrim").addEventListener("click", () => setDrawer(false));
      const afterNav = () => { if (isNarrow()) setDrawer(false); };

      /* search recent questions */
      $("#va-search-btn").addEventListener("click", () => { const box = $("#va-search"), open = box.hidden; box.hidden = !open; $("#va-search-btn").setAttribute("aria-expanded", open); if (open) $("#va-search-in").focus(); else { $("#va-search-in").value = ""; renderRecent(); } });
      $("#va-search-in").addEventListener("input", () => renderRecent());

      /* starters, chips */
      const prefill = q => { vin.value = q; grow(); vin.focus(); vin.setSelectionRange(q.length, q.length); };
      $$(".va-nav[data-starter]").forEach(b => b.addEventListener("click", () => { newConv(); prefill(b.dataset.starter); afterNav(); }));
      $$(".va-chip[data-q]").forEach(b => b.addEventListener("click", () => prefill(b.dataset.q)));
      $("#va-chip-more").addEventListener("click", () => { const show = $(".va-more-chip").hidden; $$(".va-more-chip").forEach(c => c.hidden = !show); $("#va-chip-more").setAttribute("aria-expanded", show); });

      /* attachments */
      const MAX_FILES = 10, MAX_MB = 20;
      const renderFiles = () => {
        const ul = $("#va-files"); ul.innerHTML = "";
        state.files.forEach((f, i) => { const li = document.createElement("li"); const s = document.createElement("span"); s.textContent = f.name; s.title = f.name; const x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Remove " + f.name); x.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'; x.addEventListener("click", () => { state.files.splice(i, 1); renderFiles(); vin.focus(); }); li.append(s, x); ul.appendChild(li); });
        ul.hidden = !state.files.length;
      };
      $("#va-add").addEventListener("click", () => $("#va-file").click());
      $("#va-file").addEventListener("change", e => { [...e.target.files].forEach(f => { if (state.files.length < MAX_FILES && f.size <= MAX_MB * 1048576) state.files.push(f); }); e.target.value = ""; renderFiles(); vin.focus(); });

      /* conversations (kept for this session only) */
      const newConv = () => { state.cur = null; thread.innerHTML = ""; va.classList.remove("va-has-thread"); renderRecent(); vin.value = ""; grow(); };
      const renderRecent = () => {
        const qf = ($("#va-search-in").value || "").toLowerCase();
        recentEl.innerHTML = "";
        state.convs.filter(c => c.title.toLowerCase().includes(qf)).slice().reverse().forEach(c => {
          const li = document.createElement("li"), b = document.createElement("button"); b.type = "button";
          b.innerHTML = '<svg class="vi" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="M10 6.5V10l2.5 1.6"/></svg>';
          const s = document.createElement("span"); s.textContent = c.title; b.title = c.title; b.appendChild(s);
          if (c === state.cur) b.setAttribute("aria-current", "true");
          b.addEventListener("click", () => { openConv(c); afterNav(); });
          li.appendChild(b); recentEl.appendChild(li);
        });
        $("#va-recent-empty").hidden = state.convs.length > 0;
        $("#va-recent-empty").textContent = state.convs.length ? "" : "Questions you ask appear here.";
      };
      const openConv = c => { state.cur = c; thread.innerHTML = ""; c.items.forEach(renderItem); va.classList.toggle("va-has-thread", c.items.length > 0); renderRecent(); scrollEnd(); vin.focus(); };
      const scrollEnd = () => { const b = $("#va-body"); b.scrollTop = b.scrollHeight; };
      const renderItem = it => {
        const li = document.createElement("li");
        if (it.role === "u") {
          li.className = "va-msg-u"; li.textContent = it.text;
          const meta = []; if (it.scope && it.scope !== "All markets") meta.push("Scope: " + it.scope); if (it.files) meta.push(it.files + (it.files === 1 ? " file attached" : " files attached"));
          if (meta.length) { const m = document.createElement("span"); m.className = "va-meta"; m.textContent = meta.join(" · "); li.appendChild(m); }
        } else {
          li.className = "va-msg-a";
          li.innerHTML = '<span class="va-mark" aria-hidden="true">V</span><div class="va-card"></div>';
          const card = $(".va-card", li);
          if (it.pending) card.innerHTML = '<span class="vh">Working on it</span><span class="va-typing" aria-hidden="true"><i></i><i></i><i></i></span>';
          else if (it.answer) { card.innerHTML = '<span class="va-state">Answer</span><p></p>'; $("p", card).textContent = it.answer; }
          else { card.innerHTML = '<span class="va-state">Not connected yet</span><b></b><p></p>'; $("b", card).textContent = it.title; $("p", card).textContent = it.body; }
        }
        thread.appendChild(li);
        return li;
      };
      async function send(text) {
        text = text.trim(); if (!text) return;
        if (!state.cur) { state.cur = { title: text.length > 60 ? text.slice(0, 58) + "…" : text, items: [] }; state.convs.push(state.cur); }
        const c = state.cur;
        const u = { role: "u", text, scope: state.scope, files: state.files.length };
        c.items.push(u); va.classList.add("va-has-thread"); renderItem(u);
        vin.value = ""; grow(); state.files = []; renderFiles(); renderRecent();
        const a = { role: "a", pending: true }; c.items.push(a); const node = renderItem(a); scrollEnd();
        if (ASSISTANT.endpoint) {
          try {
            const r = await fetch(ASSISTANT.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text, scope: state.scope, user: state.user }) });
            if (!r.ok) throw new Error(r.status);
            const data = await r.json(); a.answer = String(data.answer || ""); if (!a.answer) throw new Error("empty");
          } catch { a.title = "We couldn’t reach the assistant"; a.body = "Please try again in a moment."; }
        } else {
          await new Promise(r => setTimeout(r, 700));
          a.title = "Your question is saved";
          a.body = "The Intelligence Assistant isn’t connected in this preview, so there is no answer yet. Your question stays in Recent for this session.";
        }
        a.pending = false;
        if (state.cur === c && node.isConnected) { thread.replaceChild(renderItem(a), node); scrollEnd(); }
      }

      $("#va-new").addEventListener("click", () => { newConv(); vin.focus(); afterNav(); });
      $("#va-new2").addEventListener("click", () => { newConv(); vin.focus(); });
      $("#va-clear").addEventListener("click", () => { if (state.cur) state.convs.splice(state.convs.indexOf(state.cur), 1); closePops(); newConv(); vin.focus(); });
      $("#va-clear-all").addEventListener("click", () => { state.convs = []; closePops(); newConv(); vin.focus(); });
      const closeVa = () => va.close ? va.close() : va.removeAttribute("open");
      $("#va-x").addEventListener("click", closeVa);
      $("#va-signout").addEventListener("click", () => {
        state.user = null; state.convs = []; try { sessionStorage.removeItem("verisavo-user"); } catch (e) {} newConv(); closePops(); closeVa();
      });
      $$("#va-gear-menu [data-legal]").forEach(b => b.addEventListener("click", () => closePops()));

      window.vaOpen = (user, question) => {
        if (user) {
          state.user = user;
          const nm = (user.name || (user.email || "").split("@")[0] || "You").trim();
          $("#va-name").textContent = nm;
          $("#va-av").textContent = nm.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "V";
          $("#va-greet").textContent = (user.name ? "Hello " + user.name.split(" ")[0] + ". " : "") + "What do you need to understand?";
        }
        setDrawer(false); closePops();
        va.showModal ? va.showModal() : va.setAttribute("open", "");
        if (question && question.trim()) { newConv(); send(question); } else { grow(); }
        setTimeout(() => vin.focus(), 40);
      };
      window.vaSignedIn = () => !!state.user;
      window.vaSetScope = m => { const b = $$("#va-scope-menu [data-market]").find(x => x.dataset.market === m); if (!b) return; state.scope = m; $("#va-scope-label").textContent = m; $$("#va-scope-menu [data-market]").forEach(x => x.setAttribute("aria-checked", x === b)); };
      window.vaRestore = user => { state.user = user; const nm = (user.name || (user.email || "").split("@")[0] || "You").trim(); $("#va-name").textContent = nm; $("#va-av").textContent = nm.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "V"; $("#va-greet").textContent = (user.name ? "Hello " + user.name.split(" ")[0] + ". " : "") + "What do you need to understand?"; };
    }

    /* Signed in earlier in this browser session (here or on the homepage) */
    let savedUser = null;
    try { savedUser = JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) {}

    /* Arriving from the homepage: carry the visitor's question in, or open early access / sign in */
    let carried = "";
    try { carried = sessionStorage.getItem("verisavo-q") || ""; sessionStorage.removeItem("verisavo-q"); } catch (e) {}
    const arrive = location.hash.slice(1);
    if (carried) { ask.value = carried; ask.dispatchEvent(new Event("input")); }
    if (savedUser && window.vaRestore) window.vaRestore(savedUser);
    if (arrive === "app") setTimeout(() => window.vaOpen(savedUser || { name: "", email: "" }, carried), 80);
    else if (arrive === "scout") setTimeout(openAccess, 80);
    else if (arrive === "ask" || carried) {
      setTimeout(() => { $("#ask-form").scrollIntoView({ behavior: "auto", block: "center" }); ask.focus({ preventScroll: true }); ask.setSelectionRange(ask.value.length, ask.value.length); }, 80);
    } else if (arrive === "access") setTimeout(openAccess, 80);
    else if (arrive === "signin") setTimeout(() => openAuth("in"), 80);
    else if (arrive === "how") setTimeout(() => { const el = document.getElementById("how"); scrollTo({ top: el.getBoundingClientRect().top + scrollY - $("#top").offsetHeight - 8, behavior: "auto" }); }, 80);
    else if (arrive === "terms" || arrive === "privacy") setTimeout(() => { const b = document.querySelector('[data-legal="' + arrive + '"]'); if (b) b.click(); }, 80);

    /* Scroll reveal: each block fades and rises into place once, the first time it enters view */
    if (!reduced && "IntersectionObserver" in window) {
      const groups = ["#how .eyebrow, #how h2, #how .how-sub", "#how .how-steps > li",
        "#platform .band-head > *", "#platform .apbox",
        "#trust .trust-head > *", "#trust .tc",
        "#faq .faq-intro > *", "#faq .qa > details",
        ".cta > *"];
      const rvIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rvIO.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
      groups.forEach(sel => $$(sel).forEach((el, i) => { el.classList.add("rv"); el.style.setProperty("--rv-d", Math.min(i * 130, 520) + "ms"); rvIO.observe(el); }));
      document.documentElement.classList.add("rv-on");

      /* Chart dots gather at the origin, then travel to their places when the chart first comes into view */
      const chartEl = $("#apchart"), dots = $$(".apt, .apv");
      if (chartEl && dots.length) {
        dots.forEach(g => { g.dataset.to = g.style.transform; g.style.transition = "none"; g.style.transform = "translate(70px, 300px)"; g.style.opacity = "0"; });
        const dotIO = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return; dotIO.disconnect();
          requestAnimationFrame(() => {
            dots.forEach((g, i) => { g.style.transition = `transform 1.4s cubic-bezier(.16,1,.3,1) ${300 + i * 150}ms, opacity .7s ease ${300 + i * 150}ms`; g.style.opacity = "1"; });
            apPick(apCur);
            setTimeout(() => dots.forEach(g => { g.style.transition = ""; }), 2600);
          });
        }, { threshold: 0.35 });
        dotIO.observe(chartEl);
      }
    }
  })();
}
