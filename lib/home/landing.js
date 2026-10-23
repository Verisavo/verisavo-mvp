// Homepage behaviour: signal field, How it works, the intelligence layer, case studies and the closing question
export default function init() {
  /* Verisavo homepage behaviour: the signal field, header states, How it works, the layer stack, case studies and the closing question */
  const $ = id => document.getElementById(id);
  const root = $("ln");
  if (!root) return;
  document.body.classList.add("ln-on");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PLATFORM = window.VS_PLATFORM || "/platform";
  const toAssistant = q => {
    try { if (q) sessionStorage.setItem("verisavo-q", q); else sessionStorage.removeItem("verisavo-q"); } catch (e) {}
    location.href = PLATFORM + "#ask";
  };

  /* ---------- Hero: a living field of market signals ---------- */
  (() => {
    const cv = $("ln-field"), hero = $("ln-hero"), lab = $("ln-labels");
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, mob = false, nodes = [], clusters = [], links = [], pulses = [], tags = [], raf = 0, visible = true, last = 0, nextEv = 0, t0 = performance.now();
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const SIG = [
      ["Price change · +6%", "Kejetia Market, Kumasi", "Fact"],
      ["Stockout reported", "Ikeja, Lagos", "Fact"],
      ["New competitor opened", "Westlands, Nairobi", "Fact"],
      ["Deliveries running late", "Apapa corridor, Lagos", "Inference"],
      ["Customers switching brand", "Adjamé, Abidjan", "Hypothesis"],
      ["Footfall rising", "Lugbe, Abuja", "Fact"],
      ["Smaller packs selling faster", "Kano", "Inference"],
      ["Import levy announced", "Accra", "Fact"],
      ["Who supplies these kiosks?", "Intelligence Gap", "gap"],
      ["Shelf space lost to Brand B", "Suame, Kumasi", "Inference"],
      ["Mobile money uptake rising", "Kisumu", "Fact"],
      ["Do shoppers return after stockouts?", "Intelligence Gap", "gap"]
    ];
    let sigI = 0;
    function build() {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1); mob = W < 760;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 7; nodes = []; clusters = []; links = []; pulses = [];
      const n = mob ? 5 : 7;
      for (let c = 0; c < n; c++) {
        const side = c % 2 ? 1 : 0;
        const cx = mob ? W * (.12 + .76 * rnd()) : side ? W * (.74 + .22 * rnd()) : W * (.04 + .22 * rnd());
        const cy = mob ? H * (.12 + .5 * rnd()) : H * (.14 + .72 * rnd());
        const cl = { x: cx, y: cy, ids: [] }; clusters.push(cl);
        const k = 7 + Math.floor(rnd() * 8);
        for (let i = 0; i < k; i++) {
          const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), .7) * (mob ? 46 : 78);
          nodes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .8, c, r: rnd() < .15 ? 2.6 : 1.5, ph: rnd() * 6.28, sp: .4 + rnd() * .6 });
          cl.ids.push(nodes.length - 1);
        }
      }
      // a sprinkle of lone signals
      for (let i = 0; i < (mob ? 24 : 70); i++) nodes.push({ x: rnd() * W, y: rnd() * H * .96, c: -1, r: 1, ph: rnd() * 6.28, sp: .3 + rnd() * .5 });
      // quiet structure inside clusters
      clusters.forEach(cl => cl.ids.forEach(i => {
        const near = cl.ids.filter(j => j !== i).map(j => [j, Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)]).sort((a, b) => a[1] - b[1]).slice(0, 2);
        near.forEach(([j]) => { if (i < j) links.push([i, j]); });
      }));
      // cross-cluster arcs that light up when evidence connects
      clusters.forEach((cl, i) => { const o = clusters[(i + 1 + Math.floor(rnd() * (n - 1))) % n]; links.push([cl.ids[0], o.ids[0], 1]); });
      tags.forEach(t => t.el.remove()); tags = [];
    }
    const pos = (nd, t) => ({ x: nd.x + Math.sin(t * nd.sp + nd.ph) * 3, y: nd.y + Math.cos(t * nd.sp * .8 + nd.ph) * 2.4 });
    function okForLabel(p) {
      if (W < 1180) return false;
      const half = W / 2;
      const hvEl = root.querySelector(".hv"), lim = hvEl ? hvEl.getBoundingClientRect().top - cv.getBoundingClientRect().top - 70 : H - 60;
      if (p.y < 150 || p.y > lim) return false;
      return (p.x > 230 && p.x < half - 390) || (p.x > half + 390 && p.x < W - 240);
    }
    function event(now) {
      const t = (now - t0) / 1000;
      const cands = nodes.map((nd, i) => [i, pos(nd, t)]).filter(([i, p]) => nodes[i].c >= 0 && okForLabel(p) && !tags.some(g => Math.hypot(g.p.x - p.x, g.p.y - p.y) < 150));
      if (!cands.length) return;
      const [i] = cands[Math.floor(Math.random() * cands.length)];
      pulses.push({ i, s: now });
      // connect it to two signals elsewhere
      const others = clusters.filter((_, c) => c !== nodes[i].c);
      for (let k = 0; k < 2 && others.length; k++) { const o = others.splice(Math.floor(Math.random() * others.length), 1)[0]; pulses.push({ i, j: o.ids[Math.floor(Math.random() * o.ids.length)], s: now, link: 1 }); }
      const max = mob ? 1 : 3;
      while (tags.length >= max) { const g = tags.shift(); g.el.classList.remove("in"); setTimeout(() => g.el.remove(), 700); }
      const [txt, where, st] = SIG[sigI++ % SIG.length];
      const el = document.createElement("div");
      el.className = "sg" + (st === "gap" ? " sg-gap" : "") + (pos(nodes[i], t).x < W / 2 ? " sg-l" : "");
      el.innerHTML = st === "gap" ? `<div class="sg-box"><span>? ${txt}</span><em>${where}</em></div>` : `<div class="sg-box"><span>${txt}</span><em>${where}<i>${st}</i></em></div>`;
      lab.appendChild(el);
      const g = { el, i, p: pos(nodes[i], t), born: now }; tags.push(g);
      requestAnimationFrame(() => el.classList.add("in"));
    }
    function draw(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      // faint survey grid
      ctx.fillStyle = "rgba(168,198,232,.10)";
      const step = 28, ox = (t * 2) % step;
      for (let x = -ox; x < W; x += step) for (let y = 0; y < H; y += step) ctx.fillRect(x, y, 1, 1);
      const P = nodes.map(nd => pos(nd, t));
      ctx.lineWidth = 1;
      links.forEach(([a, b, far]) => {
        if (far) return;
        ctx.strokeStyle = "rgba(128,170,220,.16)"; ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke();
      });
      links.forEach(([a, b, far]) => {
        if (!far) return;
        ctx.strokeStyle = "rgba(128,170,220,.07)"; ctx.setLineDash([2, 6]); ctx.beginPath();
        const mx = (P[a].x + P[b].x) / 2, my = Math.min(P[a].y, P[b].y) - 40;
        ctx.moveTo(P[a].x, P[a].y); ctx.quadraticCurveTo(mx, my, P[b].x, P[b].y); ctx.stroke(); ctx.setLineDash([]);
      });
      // live connections
      pulses = pulses.filter(p => now - p.s < 4200);
      pulses.forEach(p => {
        const age = (now - p.s) / 1000;
        if (p.link) {
          const A = P[p.i], B = P[p.j], k = Math.min(1, age / 1.1), fade = 1 - Math.max(0, (age - 2.8) / 1.4);
          const mx = (A.x + B.x) / 2, my = Math.min(A.y, B.y) - 30;
          ctx.strokeStyle = `rgba(168,198,232,${.55 * fade})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(A.x, A.y);
          const steps = 24;
          for (let s = 1; s <= Math.round(steps * k); s++) { const u = s / steps; ctx.lineTo((1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * mx + u * u * B.x, (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * my + u * u * B.y); }
          ctx.stroke(); ctx.lineWidth = 1;
          if (k >= 1) { ctx.fillStyle = `rgba(255,255,255,${.9 * fade})`; ctx.beginPath(); ctx.arc(B.x, B.y, 2.6, 0, 6.28); ctx.fill(); }
        } else {
          const A = P[p.i], k = (age % 1.6) / 1.6;
          ctx.strokeStyle = `rgba(168,198,232,${.6 * (1 - k)})`; ctx.beginPath(); ctx.arc(A.x, A.y, 4 + k * 22, 0, 6.28); ctx.stroke();
        }
      });
      // nodes
      nodes.forEach((nd, i) => {
        const p = P[i], tw = .55 + .45 * Math.sin(t * 1.3 + nd.ph);
        ctx.fillStyle = nd.c < 0 ? `rgba(168,198,232,${.25 + .2 * tw})` : `rgba(204,221,241,${.55 + .35 * tw})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, nd.r, 0, 6.28); ctx.fill();
      });
      tags.forEach(g => {
        const p = P[g.i]; g.p = p;
        g.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.28); ctx.fill();
        const dx = g.el.classList.contains("sg-l") ? -12 : 12;
        ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + dx, p.y - 10); ctx.stroke();
      });
      tags = tags.filter(g => { if (now - g.born > 7000) { g.el.classList.remove("in"); setTimeout(() => g.el.remove(), 700); return false; } return true; });
    }
    function loop(now) {
      raf = 0;
      if (now >= nextEv) { event(now); nextEv = now + (mob ? 2600 : 1700); }
      draw(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };
    build();
    if (reduce) { const n = performance.now(); event(n); event(n + 1); draw(n); }
    else kick();
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
    document.addEventListener("visibilitychange", kick);
    let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { const w = cv.getBoundingClientRect().width; if (Math.abs(w - W) > 4) { build(); if (reduce) draw(performance.now()); } }, 150); });
  })();

  /* ---------- Header: light on the dark hero, a quiet bar once the page scrolls ---------- */
  (() => {
    const hero = $("ln-field") || $("ln-hero");
    const set = () => {
      const r = hero.getBoundingClientRect();
      document.body.classList.toggle("ln-dark", r.bottom > 60);
      document.body.classList.toggle("ln-bar", scrollY > 24);
    };
    addEventListener("scroll", set, { passive: true }); addEventListener("resize", set); set();
  })();

  /* ---------- How it works: five steps, advancing on their own until the visitor takes over ---------- */
  (() => {
    const box = root.querySelector(".hw"); if (!box) return;
    const steps = [...box.querySelectorAll(".hw-step")], views = [...box.querySelectorAll(".hw-v")], mark = $("hw-mark");
    const DUR = 6500; let cur = 0, timer = 0, inView = false, held = false;
    box.style.setProperty("--hw-dur", DUR + "ms");
    function pick(i, focus) {
      cur = (i + steps.length) % steps.length;
      steps.forEach((s, k) => { const on = k === cur; s.setAttribute("aria-selected", String(on)); s.tabIndex = on ? 0 : -1; const b = s.querySelector(".hw-bar"); if (b && on) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; } });
      views.forEach((v, k) => { v.hidden = k !== cur; v.classList.toggle("on", k === cur); });
      if (mark) { const s = steps[cur]; mark.style.top = (s.offsetTop + 30) + "px"; }
      if (focus) steps[cur].focus();
      if (window.vsSound && inView) window.vsSound.chapter(cur + 1, true);
      sched();
    }
    function sched() { clearTimeout(timer); if (!reduce && inView && !held) timer = setTimeout(() => pick(cur + 1), DUR); }
    steps.forEach((s, i) => {
      s.addEventListener("click", () => { held = true; box.classList.add("paused"); pick(i); });
      s.addEventListener("keydown", e => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); held = true; box.classList.add("paused"); pick(cur + k, true); }
      });
    });
    box.addEventListener("mouseenter", () => { box.classList.add("paused"); clearTimeout(timer); });
    box.addEventListener("mouseleave", () => { if (!held) { box.classList.remove("paused"); pick(cur); } });
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; sched(); }, { threshold: .35 }).observe(box);
    addEventListener("resize", () => pick(cur));
    pick(0);
  })();

  /* ---------- The intelligence layer: one layer open at a time ---------- */
  (() => {
    const list = $("sk-list"), iso = $("sk-iso"); if (!list || !iso) return;
    const items = [...list.children], plates = [...iso.children];
    plates.forEach((p, k) => p.style.setProperty("--z", String((7 - +p.dataset.l) * 26)));
    function open(l) {
      items.forEach(li => { const on = li.dataset.l === String(l); li.classList.toggle("on", on); li.querySelector("button").setAttribute("aria-expanded", String(on)); });
      plates.forEach(p => p.classList.toggle("on", p.dataset.l === String(l)));
    }
    items.forEach(li => {
      const b = li.querySelector("button");
      b.addEventListener("click", () => open(li.dataset.l));
      b.addEventListener("mouseenter", () => { if (matchMedia("(hover: hover)").matches) open(li.dataset.l); });
    });
    open(4);
  })();

  /* ---------- Case studies, drawn from the same data as the Case studies page ---------- */
  (() => {
    const box = $("cz"); if (!box) return;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const render = () => {
      const cases = window.vsCases || []; if (!cases.length) return false;
      box.innerHTML = "";
      cases.slice(0, 4).forEach((c, i) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "cz-card" + (i === 0 ? " cz-feat" : "");
        const stats = i === 0 && c.stats ? `<div class="cz-stats">${c.stats.map(([k, d, v]) => `<div><b>${d === "up" ? "↑" : "↓"} ${esc(v)}</b><span>${esc(k)}</span></div>`).join("")}</div>` : "";
        b.innerHTML = `<div class="cz-art">${c.art || ""}</div><div class="cz-body"><p class="cz-meta">${esc((c.tags || []).slice(0, 2).join(" · "))}</p><p class="cz-co">${esc(c.company)}</p><h3>${esc(c.title)}</h3>${i === 0 ? `<p class="cz-sub">${esc(c.sub || "")}</p>` : ""}${stats}<span class="cz-read">Read the case study →</span></div>`;
        b.addEventListener("click", () => window.vsOpenCase && window.vsOpenCase(c.id, b));
        box.appendChild(b);
      });
      return true;
    };
    if (!render()) { let n = 0; const iv = setInterval(() => { if (render() || ++n > 40) clearInterval(iv); }, 100); }
  })();


  /* ---------- Hero: question box and the example answer ---------- */
  (() => {
    const f = $("ln-hq"), i = $("ln-hqi");
    if (f) f.addEventListener("submit", e => { e.preventDefault(); toAssistant(i.value.trim()); });
    const hv = root.querySelector(".hv"); if (!hv) return;
    hv.querySelectorAll(".hv-a li").forEach((li, k) => li.style.setProperty("--k", k));
    if (reduce || !("IntersectionObserver" in window)) { hv.classList.add("go"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { hv.classList.add("go"); io.disconnect(); } }, { threshold: .25 });
    io.observe(hv);
  })();

  /* ---------- Statement: words light up as it scrolls into view ---------- */
  (() => {
    const p = $("ln-big"); if (!p) return;
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { const s = document.createElement("span"); s.className = "w"; s.textContent = w; frag.appendChild(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(p);
    const words = [...p.querySelectorAll(".w")];
    if (reduce) { words.forEach(w => w.classList.add("on")); return; }
    let ticking = false;
    const set = () => {
      ticking = false;
      const r = p.getBoundingClientRect(), vh = innerHeight;
      const k = Math.max(0, Math.min(1, (vh * .82 - r.top) / (r.height + vh * .25)));
      const n = Math.round(k * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
    addEventListener("resize", set); set();
  })();

  /* ---------- Closing question ---------- */
  (() => {
    const f = $("ln-q"), i = $("ln-qi"); if (!f) return;
    f.addEventListener("submit", e => { e.preventDefault(); toAssistant(i.value.trim()); });
    root.querySelectorAll(".ln-chips [data-q]").forEach(b => b.addEventListener("click", () => { i.value = b.dataset.q; i.focus(); }));
  })();

  /* ---------- Resources links that open a given tab of the Case studies page ---------- */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-tab]"); if (!b || !b.dataset.page) return;
    const tab = b.dataset.tab;
    setTimeout(() => { if (window.vsResearchTab) window.vsResearchTab(tab); }, 60);
  });

  /* ---------- Reveal on scroll ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    const sel = [".ln-state .ln-eb", ".ln-facts > div", ".ln-head > *", ".hw-list", ".hw-stage", ".bn-c", ".sk-vis", ".sk-list", ".dc", ".cz", ".ln-close .ln-wrap > *"];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    sel.forEach(s => root.querySelectorAll(s).forEach((el, k) => { el.classList.add("ln-rv"); el.style.setProperty("--d", Math.min((k % 4) * 90, 270) + "ms"); io.observe(el); }));
  }

  /* ---------- Sound: each section shifts the score, as the chapters did ---------- */
  if ("IntersectionObserver" in window) {
    const secs = [...root.querySelectorAll(":scope > section")];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && window.vsSound) window.vsSound.chapter(Math.min(9, secs.indexOf(en.target)), true); }), { threshold: .4 });
    secs.forEach(s => io.observe(s));
  }
}
