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
      const r = hero.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1); mob = W < 760;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 7; nodes = []; clusters = []; links = []; pulses = [];
      const n = mob ? 5 : 7;
      for (let c = 0; c < n; c++) {
        const cx = mob ? W * (.12 + .76 * rnd()) : W * (.5 + .46 * rnd());
        const cy = mob ? H * (.12 + .3 * rnd()) : H * (.14 + .66 * rnd());
        const cl = { x: cx, y: cy, ids: [] }; clusters.push(cl);
        const k = 7 + Math.floor(rnd() * 8);
        for (let i = 0; i < k; i++) {
          const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), .7) * (mob ? 46 : 78);
          nodes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .8, c, r: rnd() < .15 ? 2.6 : 1.5, ph: rnd() * 6.28, sp: .4 + rnd() * .6 });
          cl.ids.push(nodes.length - 1);
        }
      }
      // a sprinkle of lone signals
      for (let i = 0; i < (mob ? 24 : 60); i++) nodes.push({ x: mob ? rnd() * W : W * (.36 + .64 * rnd()), y: rnd() * H * (mob ? .5 : .95), c: -1, r: 1, ph: rnd() * 6.28, sp: .3 + rnd() * .5 });
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
      if (mob) return p.y > 80 && p.y < H * .4 && p.x > 20 && p.x < W - 210;
      return p.x > W * .56 && p.x < W - 270 && p.y > 120 && p.y < H - 150;
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
      el.className = "sg" + (st === "gap" ? " sg-gap" : "");
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
        ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 12, p.y - 10); ctx.stroke();
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
    let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { const w = hero.getBoundingClientRect().width; if (Math.abs(w - W) > 4) { build(); if (reduce) draw(performance.now()); } }, 150); });
  })();

  /* ---------- Header: light on the dark hero, a quiet bar once the page scrolls ---------- */
  (() => {
    const hero = $("ln-hero"), darkHero = !!$("ln-field");
    const set = () => {
      const r = hero.getBoundingClientRect();
      document.body.classList.toggle("ln-dark", darkHero && r.bottom > 60);
      document.body.classList.toggle("ln-bar", scrollY > 24);
    };
    addEventListener("scroll", set, { passive: true }); addEventListener("resize", set); set();
  })();

  /* ---------- How it works: five steps, advancing on their own until the visitor takes over ---------- */
  (() => {
    const box = root.querySelector(".hw"); if (!box) return;
    const steps = [...box.querySelectorAll(".hw-step")], views = [...box.querySelectorAll(".hw-v")], texts = [...box.querySelectorAll(".hw-tx")], mark = $("hw-mark");
    const DUR = 8000; let cur = 0, timer = 0, inView = false, held = false;
    box.style.setProperty("--hw-dur", DUR + "ms");
    function pick(i, focus) {
      cur = (i + steps.length) % steps.length;
      steps.forEach((s, k) => { const on = k === cur; s.setAttribute("aria-selected", String(on)); s.tabIndex = on ? 0 : -1; const b = s.querySelector(".hw-bar"); if (b && on) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; } });
      views.forEach((v, k) => { v.hidden = k !== cur; v.classList.toggle("on", k === cur); });
      texts.forEach((x, k) => { x.hidden = k !== cur; });
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
      cases.forEach((c, i) => {
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

  /* ---------- Why Verisavo exists: words light up as it scrolls into view ---------- */
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
      const k = Math.max(0, Math.min(1, (vh * .85 - r.top) / (r.height + vh * .3)));
      const n = Math.round(k * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
    addEventListener("resize", set); set();
  })();

  /* ---------- Why Verisavo exists: the statement plays line by line inside the scene ---------- */
  (() => {
    const sec = $("ln-why"), frame = sec && sec.querySelector(".ms-frame"); if (!frame) return;
    const lines = [...frame.querySelectorAll(".ms-l")], count = frame.querySelector(".ms-count"), bar = frame.querySelector(".ms-bar i");
    let cur = -1, tick = false;
    const set = () => {
      tick = false;
      const r = sec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
      const p = Math.max(0, Math.min(1, -r.top / span));
      const i = Math.min(lines.length - 1, Math.floor(p * lines.length * .999));
      frame.dataset.p = p.toFixed(4);
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      if (i === cur) return;
      cur = i; frame.dataset.stage = i;
      lines.forEach((l, k) => { l.classList.toggle("on", k === i); l.classList.toggle("past", k < i); });
      count.textContent = String(i + 1).padStart(2, "0") + " / " + String(lines.length).padStart(2, "0");
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(set); } }, { passive: true });
    addEventListener("resize", set); set();
  })();

  /* ---------- Why Verisavo exists: the pencil-drawn market, in motion (three.js) ---------- */
  (() => {
    const cvs = $("ms-canvas"), THREE = window.THREE;
    if (!cvs || !THREE) return;
    const frame = cvs.parentElement;
    let seed = 23;
    const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const rr = (a, b) => a + rnd() * (b - a);
    const wrap = (x, a, b) => { const w = b - a; return a + (((x - a) % w) + w) % w; };
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ramp = (t, a, b) => clamp((t - a) / (b - a));
    const sm = x => x * x * (3 - 2 * x);
    const band = (t, a, b, f) => Math.min(ramp(t, a, a + (f || .2)), 1 - ramp(t, b - (f || .2), b));
    function onGLLost() { frame.classList.add("ms-off"); }
    function onGLRestored() { frame.classList.remove("ms-off"); }
  function buildScene() {
    const canvas = cvs;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const PAPER = 0xF5F8FC;
    renderer.setClearColor(PAPER);
    canvas.addEventListener("webglcontextlost", onGLLost, false);
    canvas.addEventListener("webglcontextrestored", onGLRestored, false);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PAPER, 170, 560);
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 2400);

    const UPV = new THREE.Vector3(0, 1, 0);
    const SH = { top: new THREE.Color("#FFFFFF"), s: new THREE.Color("#EBF1FA"), w: new THREE.Color("#E1E9F6"), n: new THREE.Color("#F4F7FC"), e: new THREE.Color("#F0F4FB") };

    function unit(geom, thr) {
      const ni = geom.index ? geom.toNonIndexed() : geom;
      ni.computeVertexNormals();
      return { p: ni.attributes.position.array, n: ni.attributes.normal.array, e: new THREE.EdgesGeometry(geom, thr || 20).attributes.position.array };
    }
    const gBox = new THREE.BoxGeometry(1, 1, 1); gBox.translate(0, .5, 0);
    const gPrism = new THREE.CylinderGeometry(0.57735, 0.57735, 1, 3); gPrism.rotateZ(Math.PI / 2); gPrism.rotateX(-Math.PI / 2); gPrism.translate(0, 0.288675, 0); gPrism.scale(1, 1 / 0.866025, 1);
    const gCone = new THREE.ConeGeometry(.5, 1, 8); gCone.translate(0, .5, 0);
    const gCyl = new THREE.CylinderGeometry(.5, .5, 1, 10); gCyl.translate(0, .5, 0);
    const gTree = new THREE.CylinderGeometry(.34, .5, .75, 16); gTree.translate(0, .5, 0);
    const UB = unit(gBox), UP = unit(gPrism), UC = unit(gCone), UY = unit(gCyl, 30), UT = unit(gTree, 30);

    function Col(opt) { return Object.assign({ p: [], c: [], e: [], s: [], sketch: true }, opt || {}); }
    const tv = new THREE.Vector3(), tn = new THREE.Vector3(), nm = new THREE.Matrix3();
    const M = (x, y, z, sx, sy, sz, ry) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(UPV, ry || 0), new THREE.Vector3(sx, sy, sz));
    function sketch(col, a, b) {
      const d = b.clone().sub(a), L = d.length(); if (L < .05) return; d.divideScalar(L);
      const o1 = Math.min(.5, L * .08) * rnd(), o2 = Math.min(.5, L * .08) * rnd(), j = () => (rnd() - .5) * .16;
      col.s.push(a.x - d.x * o1 + j(), a.y - d.y * o1 + j(), a.z - d.z * o1 + j(), b.x + d.x * o2 + j(), b.y + d.y * o2 + j(), b.z + d.z * o2 + j());
    }
    function add(col, u, m) {
      nm.getNormalMatrix(m);
      for (let i = 0; i < u.p.length; i += 3) {
        tv.set(u.p[i], u.p[i + 1], u.p[i + 2]).applyMatrix4(m); col.p.push(tv.x, tv.y, tv.z);
        tn.set(u.n[i], u.n[i + 1], u.n[i + 2]).applyMatrix3(nm).normalize();
        const c = tn.y > .55 ? SH.top : tn.z > .4 ? SH.s : tn.x < -.4 ? SH.w : tn.x > .4 ? SH.e : SH.n;
        col.c.push(c.r, c.g, c.b);
      }
      for (let i = 0; i < u.e.length; i += 6) {
        const a = new THREE.Vector3(u.e[i], u.e[i + 1], u.e[i + 2]).applyMatrix4(m), b = new THREE.Vector3(u.e[i + 3], u.e[i + 4], u.e[i + 5]).applyMatrix4(m);
        col.e.push(a.x, a.y, a.z, b.x, b.y, b.z);
        if (col.sketch) sketch(col, a, b);
      }
    }
    function seg(col, x1, y1, z1, x2, y2, z2) { col.e.push(x1, y1, z1, x2, y2, z2); if (col.sketch) sketch(col, new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)); }
    function rectLine(col, x0, z0, x1, z1, y) { y = y || .05; seg(col, x0, y, z0, x1, y, z0); seg(col, x1, y, z0, x1, y, z1); seg(col, x1, y, z1, x0, y, z1); seg(col, x0, y, z1, x0, y, z0); }
    const box = (col, x, z, w, d, h, y0, ry) => add(col, UB, M(x, y0 || 0, z, w, h, d, ry));
    const prism = (col, x, z, w, d, h, y0, ry) => add(col, UP, M(x, y0 || 0, z, w, h, d, ry));
    const MR = (x, y, z, sx, sy, sz, rx, ry) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, 0, "YXZ")), new THREE.Vector3(sx, sy, sz));
    /* corrugated tin sheet, tilted toward +z (k = 1) or -z (k = -1), with ridges drawn across it */
    function tin(col, x, z, w, d, y, k, ry) {
      const m = MR(x, y, z, w, .08, d, .2 * (k || 1), ry || 0); add(col, UB, m);
      const n = Math.max(2, Math.round(w / 1.5));
      for (let i = 1; i < n; i++) { const u = -.5 + i / n, A = new THREE.Vector3(u, 1.2, -.5).applyMatrix4(m), B = new THREE.Vector3(u, 1.2, .5).applyMatrix4(m); seg(col, A.x, A.y, A.z, B.x, B.y, B.z); }
    }
    /* market parasol: pole plus an eight-panel canopy */
    function parasol(col, x, z, s) { s = s || 1; seg(col, x, 0, z, x, 2.5 * s, z); add(col, UC, M(x, 2.05 * s, z, 3.4 * s, .75 * s, 3.4 * s, rnd() * 3)); }
    /* goods: produce heaps, basins and sacks */
    function goods(col, x, y, z) { const k = rnd(); if (k < .4) add(col, UC, M(x, y, z, .7, .45, .7)); else if (k < .7) add(col, UY, M(x, y, z, .75, .3, .75)); else box(col, x, z, .6, .5, .55, y, rnd()); }

    function finish(col, lineColor, lineOp) {
      const g = new THREE.Group();
      const fillMat = new THREE.MeshBasicMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, transparent: true });
      const lineMat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: lineOp });
      const skMat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: lineOp * .38 });
      let mesh = null, lines = null, sk = null;
      if (col.p.length) { const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(col.p, 3)); fg.setAttribute("color", new THREE.Float32BufferAttribute(col.c, 3)); mesh = new THREE.Mesh(fg, fillMat); g.add(mesh); }
      if (col.e.length) { const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(col.e, 3)); lines = new THREE.LineSegments(lg, lineMat); g.add(lines); }
      if (col.s.length) { const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(col.s, 3)); sk = new THREE.LineSegments(sg, skMat); g.add(sk); }
      scene.add(g);
      return { g, mesh, lines, sk, fillMat, lineMat, skMat, base: new THREE.Color(lineColor), op: lineOp, nE: col.e.length / 3, nS: col.s.length / 3 };
    }

    // ground, roads, square
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshBasicMaterial({ color: 0xF8FAFD }));
    ground.rotation.x = -Math.PI / 2; scene.add(ground);
    const roadMat = new THREE.MeshBasicMaterial({ color: 0xECF1F9 });
    function road(x, z, w, d) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat); m.rotation.x = -Math.PI / 2; m.position.set(x, .02, z); scene.add(m); }
    road(0, 0, 900, 14); road(-60, 0, 10, 900); road(90, 0, 10, 900);
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(132, 72), new THREE.MeshBasicMaterial({ color: 0xFDFEFF })); sq.rotation.x = -Math.PI / 2; sq.position.set(15, .03, 47); scene.add(sq);

    const C = { base: Col(), far: Col({ sketch: false }), stock: Col(), comp: Col(), gap: Col(), outlet: Col(), wholesale: Col(), ghost: Col({ sketch: false }), groundL: Col() };
    const GL = C.groundL;
    [-7, 7, -10, 10].forEach(z => { seg(GL, -450, .05, z, -66, .05, z); seg(GL, -54, .05, z, 84, .05, z); seg(GL, 96, .05, z, 450, .05, z); });
    [-65, -55, 85, 95].forEach(x => { seg(GL, x, .05, -450, x, .05, -10); seg(GL, x, .05, 10, x, .05, 450); });
    for (let x = -440; x < 440; x += 9) { if (Math.abs(x + 60) < 9 || Math.abs(x - 90) < 9) continue; seg(GL, x, .05, 0, x + 4.5, .05, 0); }
    for (let z = -440; z < 440; z += 9) { if (Math.abs(z) < 12) continue; seg(GL, -60, .05, z, -60, .05, z + 4.5); seg(GL, 90, .05, z, 90, .05, z + 4.5); }
    [-60, 90].forEach(x => { for (let k = -4; k <= 4; k++) { seg(GL, x + k, .05, -11.5, x + k, .05, -14.5); seg(GL, x + k, .05, 11.5, x + k, .05, 14.5); } });
    rectLine(GL, -51, 11.5, 81, 83);

    /* north frontage along the main road */
    const OUTLET_PLOT = [-120, -106];
    function frontage(x0, x1, zFront) {
      let x = x0;
      while (x < x1 - 5) {
        const w = Math.min(rr(8, 14), x1 - x), d = rr(11, 15), h = rr(5, 11.5), cx = x + w / 2, cz = zFront - d / 2;
        if (x + w > OUTLET_PLOT[0] && x < OUTLET_PLOT[1]) { rectLine(C.base, OUTLET_PLOT[0] + .5, zFront, OUTLET_PLOT[1] - .5, zFront - 12); x = OUTLET_PLOT[1] + .6; continue; }
        const col = (cx > 4 && cx < 22) ? C.stock : C.base;
        box(col, cx, cz, w - .6, d, h);
        for (let fy = 3.2; fy < h - .5; fy += 3.2) seg(col, x + .3, fy, zFront, x + w - .9, fy, zFront);
        tin(col, cx, zFront + 1.1, w - 1.4, 2.4, 3.1, 1);
        if (h > 7 && rnd() > .4) { box(col, cx, zFront + .7, w - 2.4, 1.4, .14, 6.4); seg(col, x + 1.2, 7.4, zFront + 1.4, x + w - 1.8, 7.4, zFront + 1.4); }
        if (rnd() > .35) box(col, cx + rr(-1, 1), zFront - .3, w * rr(.45, .7), .3, rr(1.2, 1.8), h);
        if (rnd() > .55) add(col, UY, M(x + w * rr(.25, .75), h, cz + rr(-2, 2), 1.6, 1.5, 1.6));
        if (rnd() > .7) box(col, x + w * .3, cz, 2.2, 2.2, 1.2, h);
        x += w + rr(0, 1.2);
      }
    }
    frontage(-300, -67, -11); frontage(-53, 83, -11); frontage(97, 300, -11);
    function backBlock(x0, x1, z0, z1, hmin, hmax) {
      let x = x0;
      while (x < x1 - 6) {
        const w = Math.min(rr(10, 20), x1 - x), d = rr(10, Math.min(18, z0 - z1)), h = rr(hmin, hmax);
        box(C.base, x + w / 2, z0 - d / 2, w - 1, d, h);
        for (let fy = 3.2; fy < h - .5; fy += 3.2) seg(C.base, x + .5, fy, z0, x + w - 1.5, fy, z0);
        if (rnd() > .6) add(C.base, UY, M(x + w * .5, h, z0 - d / 2, 1.8, 1.6, 1.8));
        x += w + rr(1, 3);
      }
    }
    backBlock(-300, -67, -31, -50, 8, 17); backBlock(-53, 96, -31, -50, 8, 18); backBlock(170, 300, -31, -50, 9, 20);
    backBlock(-300, -67, -58, -80, 10, 22); backBlock(-53, 96, -58, -80, 10, 24); backBlock(170, 300, -58, -80, 10, 22);

    /* gap zone: back-lane kiosks */
    const GAP = { x0: 100, x1: 166, z0: -32, z1: -78 };
    for (let i = 0; i < 13; i++) {
      const x = rr(104, 162), z = rr(-36, -74), ry = rr(-.3, .3), w = rr(2.4, 3.4);
      box(C.gap, x, z, w, w * .9, 2.5, 0, ry); prism(C.gap, x, z, w + .4, w * .9 + .3, .7, 2.5, ry + Math.PI / 2);
    }
    box(C.gap, 140, -56, 7, 4, 3); prism(C.gap, 140, -56, 7.4, 4.4, 1.2, 3);
    seg(GL, 98, .05, -52, 168, .05, -52); seg(GL, 98, .05, -48, 168, .05, -48);

    /* bus park (vehicles are placed once their models exist, below) */
    const PARKED = [];
    rectLine(GL, -148, 13, -73, 74);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
      const x = -143 + i * 8, z = 24 + r * 16; seg(GL, x - 4, .05, z - 4, x - 4, .05, z + 4);
      if (rnd() > .18) PARKED.push(["bus", x, z, rnd() > .5 ? Math.PI / 2 : -Math.PI / 2]);
    }
    box(C.base, -110, 67, 22, 5, 3.2); tin(C.base, -110, 67, 24, 7, 3.2, 1);
    for (let i = 0; i < 9; i++) PARKED.push(["keke", -144 + i * 3.6, 10.2, Math.PI / 2]);

    /* market square: an open-air market. Back-to-back lock-up stalls under lean-to tin roofs,
       tables under parasols, traders selling from mats, and overhead wires across the lanes */
    function stall(col, x, z, k) {
      const w = rr(2.5, 3.3), d = rr(2, 2.5), h = rr(2.1, 2.6), ry = rr(-.06, .06);
      box(col, x, z, w - .3, d - .9, .95, 0, ry);                      // counter
      seg(col, x - w / 2 + .15, 0, z + k * (d / 2 - .1), x - w / 2 + .15, h, z + k * (d / 2 - .1));
      seg(col, x + w / 2 - .15, 0, z + k * (d / 2 - .1), x + w / 2 - .15, h, z + k * (d / 2 - .1));
      tin(col, x, z, w + .3, d + .5, h - .25, -k, ry);                 // roof falls toward the back
      for (let g = 0; g < 2; g++) if (rnd() > .35) goods(col, x + rr(-.8, .8), .95, z + k * rr(0, .3));
      if (rnd() > .75) box(col, x + rr(-.6, .6), z + k * (d / 2 + .5), .9, .7, .6, 0, rnd());   // crates spilling into the lane
    }
    function tableStall(col, x, z) { box(col, x, z, 2.2, 1.2, .85, 0, rr(-.2, .2)); goods(col, x - .4, .85, z); goods(col, x + .45, .85, z); parasol(col, x + rr(-.3, .3), z + rr(-.3, .3), rr(.85, 1)); }
    function floorTrader(col, x, z) { rectLine(col, x - 1, z - .7, x + 1, z + .7, .06); for (let g = 0; g < 3; g++) goods(col, x + rr(-.7, .7), 0, z + rr(-.4, .4)); }
    for (let r = 0; r < 8; r++) {
      const z = 19 + r * 8 + rr(-.3, .3);
      let x = -48;
      while (x < 80) {
        const step = rr(2.7, 3.5);
        x += step;
        if (x > 11 && x < 20) continue;
        if (x > 54 && z > 58) continue;
        const q = rnd();
        if (q < .05) continue;
        if (q < .15) { tableStall(C.base, x, z); continue; }
        stall(C.base, x, z - 1.35 + rr(-.15, .15), -1);   // faces the lane to the north
        if (rnd() > .08) stall(C.base, x + rr(-.3, .3), z + 1.35 + rr(-.15, .15), 1);   // faces the lane to the south
      }
      seg(GL, -49, .05, z + 4, 80, .05, z + 4);
    }
    // traders on mats and parasols along the lanes
    for (let r = 0; r <= 8; r++) for (let i = 0; i < 6; i++) { const x = rr(-46, 78), z = 15 + r * 8 + rr(-.5, .5); if (x > 10 && x < 21) continue; if (x > 54 && z > 56) continue; rnd() > .45 ? floorTrader(C.base, x, z) : parasol(C.base, x, z, rr(.8, 1)); }
    // roadside hawkers at the market edge
    for (let x = -47; x < 80; x += rr(4, 7)) { if (x > 9 && x < 22) continue; tableStall(C.base, x, 13.2); }
    // overhead wires on leaning poles
    for (let r = 0; r <= 8; r += 2) { const z = 15 + r * 8; let px = -49, py = 6.5; for (let x = -49; x <= 81; x += 26) { seg(C.base, x, 0, z, x + .3, 6.5, z); if (x > -49) { const mx = (px + x) / 2; seg(C.base, px, py, z, mx, py - 1.1, z); seg(C.base, mx, py - 1.1, z, x + .3, 6.5, z); } px = x + .3; } }
    for (let i = 0; i < 14; i++) { const x = rr(56, 79), z = rr(60, 80); add(C.comp, UC, M(x, 1.9, z, 3.4, .9, 3.4)); seg(C.comp, x, 0, z, x, 1.9, z); box(C.comp, x, z, 1.6, 1.1, .8); }
    [-44, -37, -30, -23].forEach(x => { box(C.base, x, 14.6, 6, 2.4, 2.6); tin(C.base, x, 15.2, 6.6, 3.6, 2.6, 1); });
    // covered market hall with a corrugated roof
    box(C.base, -12, 100, 70, 24, 6.5); prism(C.base, -12, 100, 70, 24.6, 4, 6.5);
    for (let x = -44; x <= 20; x += 8) seg(C.base, x, 6.5, 112.2, x, 0, 112.2);
    for (let x = -46; x <= 22; x += 2.2) seg(C.base, x, 6.6, 112.2, x, 10.4, 100);
    /* a name board on the side of the hall that faces the market square */
    (() => {
      const NAME = "WEST STREET MARKET", cw = 1024, ch = 140, cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
      const g2 = cv.getContext("2d"), tex = new THREE.CanvasTexture(cv);
      const paint = () => {
        g2.fillStyle = "#FFFFFF"; g2.fillRect(0, 0, cw, ch);
        g2.strokeStyle = "#1F273F"; g2.lineWidth = 6; g2.strokeRect(9, 9, cw - 18, ch - 18);
        g2.fillStyle = "#1F273F"; g2.textAlign = "center"; g2.textBaseline = "middle";
        g2.font = "600 84px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
        if ("letterSpacing" in g2) g2.letterSpacing = "6px";
        g2.fillText(NAME, cw / 2, ch / 2 + 4); tex.needsUpdate = true;
      };
      paint(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
      if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const mat = new THREE.MeshBasicMaterial({ map: tex, fog: true, side: THREE.FrontSide });
      const bw = 28, bh = bw * ch / cw, by = 4.7;
      [[88 - .2, Math.PI]].forEach(([z, ry]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), mat); m.position.set(-12, by, z); m.rotation.y = ry; m.renderOrder = 1; scene.add(m);
        const x0 = -12 - bw / 2, x1 = -12 + bw / 2, y0 = by - bh / 2, y1 = by + bh / 2;
        seg(C.base, x0, y0, z, x1, y0, z); seg(C.base, x1, y0, z, x1, y1, z); seg(C.base, x1, y1, z, x0, y1, z); seg(C.base, x0, y1, z, x0, y0, z);
      });
    })();

    /* wholesale depot */
    box(C.wholesale, 125, 46, 42, 24, 8);
    for (let k = 0; k < 3; k++) prism(C.wholesale, 125, 37.3 + k * 8.6, 42, 8.6, 2.6, 8);
    rectLine(C.wholesale, 100, 12, 150, 60);
    [[108, 22], [118, 22], [134, 24]].forEach(([x, z]) => { box(C.wholesale, x, z, 2.5, 7.2, 3, .3); box(C.wholesale, x, z - 4.8, 2.4, 2.2, 2.4, .3); });
    box(C.base, 150, 3.5, 7.2, 2.5, 3, .3, Math.PI / 2); box(C.base, 154.8, 3.5, 2.2, 2.4, 2.4, .3, Math.PI / 2);

    /* south: low houses (foreground) and side blocks */
    for (let i = 0; i < 70; i++) {
      const x = rr(-260, 260), z = rr(125, 260);
      if ((x > -68 && x < -52) || (x > 82 && x < 98)) continue;
      const w = rr(7, 12), d = rr(6, 10), h = rr(3, 4.5), ry = rnd() > .5 ? Math.PI / 2 : 0;
      box(C.base, x, z, w, d, h, 0, ry);
      if (rnd() > .45) prism(C.base, x, z, d + .6, w + .6, 1.6, h, ry + Math.PI / 2); else tin(C.base, x, z, w + .6, d + .8, h, rnd() > .5 ? 1 : -1, ry);
      if (rnd() > .7) { const c = ry ? [d, w] : [w, d]; rectLine(C.base, x - c[0] / 2 - 3, z - c[1] / 2 - 3, x + c[0] / 2 + 3, z + c[1] / 2 + 3, 1.6); }
    }
    for (let i = 0; i < 20; i++) box(C.base, rr(-300, -160), rr(14, 110), rr(8, 14), rr(8, 12), rr(4, 9));
    for (let i = 0; i < 20; i++) box(C.base, rr(165, 300), rr(14, 110), rr(8, 14), rr(8, 12), rr(4, 9));

    /* trees */
    function tree(col, x, z, s) { seg(col, x, 0, z, x, 2.4 * s, z); add(col, UT, M(x, 2.2 * s, z, 5.4 * s, 3 * s, 5.4 * s)); add(col, UT, M(x, 4.2 * s, z, 3.4 * s, 1.8 * s, 3.4 * s)); }
    for (let x = -250; x < 250; x += rr(18, 30)) { if (Math.abs(x + 60) < 10 || Math.abs(x - 90) < 10) continue; tree(C.base, x, 8.6, rr(.8, 1.1)); }
    for (let z = 20; z < 120; z += 22) { tree(C.base, -66, z, .9); tree(C.base, 98, z + 6, .9); }
    [[-30, 86], [40, 88], [70, 100], [150, 80], [-150, 90], [30, 130], [-90, 140]].forEach(([x, z]) => tree(C.base, x, z, 1.2));

    /* new outlet (Market Memory) and ghosts of July */
    box(C.outlet, -113, -17, 12, 11, 6.5); box(C.outlet, -113, -10.4, 10, 2, .18, 3);
    seg(C.outlet, -118.6, 3.2, -11.6, -107.4, 3.2, -11.6);
    box(C.ghost, -115, -15, 3, 3, 2.6); box(C.ghost, -110, -16, 3, 3, 2.6);
    for (let i = 0; i < 5; i++) { const x = 58 + i * 4.5, z = 64 + (i % 2) * 7; box(C.ghost, x, z, 2.6, 1.3, .95); tin(C.ghost, x, z, 3.3, 2.7, 2.2, 1); }

    /* far city, masts, crane */
    for (let i = 0; i < 330; i++) {
      const x = rr(-700, 700), z = rr(-560, 420);
      if (z > -95 && z < 280 && Math.abs(x) < 320) continue;
      box(C.far, x, z, rr(12, 30), rr(12, 28), rr(8, z < -200 ? 60 : 30));
    }
    function mast(col, x, z, h) { const b = 2.2; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => seg(col, x + a * b, 0, z + c * b, x + a * .5, h, z + c * .5)); for (let y = 6; y < h; y += 6) { const k = b - (b - .5) * y / h; seg(col, x - k, y, z - k, x + k, y + 6, z - k); seg(col, x - k, y, z + k, x + k, y, z - k); } }
    mast(C.base, -20, -70, 46); mast(C.base, 210, -40, 40);
    (function crane(x, z) { const col = C.base; seg(col, x, 0, z, x, 52, z); seg(col, x + 1.4, 0, z, x + 1.4, 52, z); for (let y = 0; y < 52; y += 3) seg(col, x, y, z, x + 1.4, y + 3, z); seg(col, x - 14, 52, z, x + 44, 52, z); seg(col, x - 14, 53.4, z, x + 44, 53.4, z); seg(col, x + .7, 60, z, x - 14, 53, z); seg(col, x + .7, 60, z, x + 44, 53, z); seg(col, x + 36, 52, z, x + 36, 34, z); box(col, x + 36, z, 3, 2, 2, 32); })(30, -120);

    const LINE = 0x7E9AD0;
    const L = {
      groundL: finish(C.groundL, 0xB4C7E6, .9), far: finish(C.far, 0xA9BFE3, .8), base: finish(C.base, LINE, .95), wholesale: finish(C.wholesale, LINE, .95),
      stock: finish(C.stock, LINE, .95), comp: finish(C.comp, LINE, .95), gap: finish(C.gap, LINE, .95), outlet: finish(C.outlet, LINE, .95), ghost: finish(C.ghost, 0x618CD0, 0)
    };
    if (L.ghost.mesh) L.ghost.mesh.visible = false;
    L.outlet.g.visible = false;

    const fogBox = new THREE.Mesh(new THREE.BoxGeometry(GAP.x1 - GAP.x0, 7, GAP.z0 - GAP.z1), new THREE.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0, depthWrite: false }));
    fogBox.position.set((GAP.x0 + GAP.x1) / 2, 3.5, (GAP.z0 + GAP.z1) / 2); scene.add(fogBox);
    const gb = new THREE.BufferGeometry().setFromPoints([[GAP.x0, GAP.z0], [GAP.x1, GAP.z0], [GAP.x1, GAP.z1], [GAP.x0, GAP.z1], [GAP.x0, GAP.z0]].map(([x, z]) => new THREE.Vector3(x, .3, z)));
    const gapLine = new THREE.Line(gb, new THREE.LineDashedMaterial({ color: 0x4D74C3, dashSize: 2.2, gapSize: 1.6, transparent: true, opacity: 0 }));
    gapLine.computeLineDistances(); scene.add(gapLine);

    // SavoScout routes: several scouts converge on different kiosks in the gap from across the district
    const ROUTES = [
      { d: 0, lead: true, pts: [[14, 22], [16, 11], [40, 9], [86, 9], [92, -14], [92, -50], [112, -50], [124, -62], [128, -72]] },
      { d: .08, pts: [[-112, 34], [-112, 9], [-40, 8.5], [40, 8.5], [88, 8.5], [150, 8.5], [196, 8.5], [198, -26]] },
      { d: .14, pts: [[-60, -170], [-60, -12], [40, -9], [86, -9], [91, -40], [91, -100], [124, -104], [132, -150]] }
    ];
    const routes = ROUTES.map(r => {
      const curve = new THREE.CatmullRomCurve3(r.pts.map(p => new THREE.Vector3(p[0], .4, p[1])));
      const pts = curve.getSpacedPoints(160);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: r.lead ? 0x1F273F : 0x4362B2, dashSize: 1.4, gapSize: 1.1, transparent: true, opacity: 0 }));
      line.computeLineDistances(); line.geometry.setDrawRange(0, 0); scene.add(line);
      return { pts, line, d: r.d, lead: !!r.lead };
    });

    /* people (instanced) */
    const PAL = ["#4D74C3", "#618CD0", "#3A5292", "#80AADC", "#4362B2", "#1F273F", "#A8C6E8"].map(c => new THREE.Color(c));
    const people = [];
    function walkPath(pts, v) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); people.push({ pts, cum, L: cum[cum.length - 1], s: rnd() * cum[cum.length - 1] * 2, v: v || rr(1, 1.5), load: rnd() < .3 }); }
    function still(x, z) { people.push({ pts: [[x, z]], cum: [0], L: 0, s: 0, v: 0, load: rnd() < .2, ph: rnd() * 6 }); }
    for (let r = 0; r <= 8; r++) { const z = 15.2 + r * 8; for (let k = 0; k < (r === 0 ? 14 : 9); k++) walkPath([[-48, z + rr(-.6, .6)], [80, z + rr(-.6, .6)]]); }
    for (let k = 0; k < 16; k++) walkPath([[15.5 + rr(-1, 1), 13], [15.5 + rr(-1, 1), 82]]);
    [-9.2, 9.2].forEach(z => { for (let k = 0; k < 30; k++) walkPath([[-260, z + rr(-.8, .8)], [260, z + rr(-.8, .8)]]); });
    [-66.5, -53.5, 83.5, 96.5].forEach(x => { for (let k = 0; k < 8; k++) walkPath([[x + rr(-.6, .6), -120], [x + rr(-.6, .6), 120]]); });
    for (let k = 0; k < 18; k++) walkPath([[rr(-145, -76), rr(16, 70)], [rr(-145, -76), rr(16, 70)], [rr(-145, -76), rr(16, 70)]], rr(.8, 1.2));
    for (let k = 0; k < 4; k++) walkPath([[100, -50], [166, -50]], rr(.7, 1));
    for (let k = 0; k < 8; k++) walkPath([[rr(102, 148), rr(14, 32)], [rr(102, 148), rr(14, 32)]], rr(.8, 1.1));
    for (let r = 0; r < 8; r++) for (let c = 0; c < 38; c += 3) { const x = -47 + c * 3.4; if (x > 12 && x < 19) continue; if (x > 54 && r > 4) continue; if (rnd() > .55) still(x + rr(-.8, .8), 19 + r * 8 + 1.6); }
    for (let i = 0; i < 12; i++) still(rr(56, 79), rr(60, 80));
    const NP = people.length;
    const bodyG = new THREE.CylinderGeometry(.28, .34, 1.5, 6); bodyG.translate(0, .75, 0);
    const headG = new THREE.SphereGeometry(.24, 7, 5); headG.translate(0, 1.74, 0);
    const loadG = new THREE.CylinderGeometry(.42, .3, .26, 8); loadG.translate(0, 2.08, 0);
    const bodies = new THREE.InstancedMesh(bodyG, new THREE.MeshBasicMaterial({ color: 0xffffff }), NP);
    const heads = new THREE.InstancedMesh(headG, new THREE.MeshBasicMaterial({ color: 0x1F273F }), NP);
    const loads = new THREE.InstancedMesh(loadG, new THREE.MeshBasicMaterial({ color: 0x80AADC }), NP);
    for (let i = 0; i < NP; i++) bodies.setColorAt(i, PAL[Math.floor(rnd() * PAL.length)]);
    scene.add(bodies, heads, loads);

    /* vehicles: each type is drawn once from side profiles, wheels, glass and riders, then shared by every copy */
    const vFill = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const vLine = new THREE.LineBasicMaterial({ color: LINE });
    const vDark = new THREE.MeshBasicMaterial({ color: 0x1F273F });
    const vGlass = new THREE.MeshBasicMaterial({ color: 0xA8C6E8, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    function VB() { return { f: [], l: [], d: [], g: [] }; }
    function vGeo(arr, geom, m) { const ni = geom.index ? geom.toNonIndexed() : geom, p = ni.attributes.position.array; for (let i = 0; i < p.length; i += 3) { tv.set(p[i], p[i + 1], p[i + 2]).applyMatrix4(m); arr.push(tv.x, tv.y, tv.z); } }
    function vEdge(b, geom, m, thr) { const p = new THREE.EdgesGeometry(geom, thr || 25).attributes.position.array; for (let i = 0; i < p.length; i += 3) { tv.set(p[i], p[i + 1], p[i + 2]).applyMatrix4(m); b.l.push(tv.x, tv.y, tv.z); } }
    const ID = new THREE.Matrix4();
    // side profile [x, y] pairs extruded across the width, centred on z = 0
    function body(b, pts, w, where, z0) { const sh = new THREE.Shape(pts.map(q => new THREE.Vector2(q[0], q[1]))); const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); g.translate(0, 0, (z0 || 0) - w / 2); vGeo(b[where || "f"], g, ID); if ((where || "f") === "f") vEdge(b, g, ID); }
    function vbox(b, x, y, z, sx, sy, sz, where) { const m = M(x, y, z, sx, sy, sz); vGeo(b[where || "f"], gBox, m); if ((where || "f") === "f") vEdge(b, gBox, m); }
    const gWheel = new THREE.CylinderGeometry(1, 1, 1, 14); gWheel.rotateX(Math.PI / 2);
    const gRing = new THREE.TorusGeometry(1, .09, 4, 18);
    function wheel(b, x, z, r, w) { vGeo(b.d, gWheel, M(x, r, z, r, w || .3, r)); }
    function ring(b, x, z, r) { const m = new THREE.Matrix4().compose(V3(x, r, z), new THREE.Quaternion(), V3(r, r, r * 1.6)); vGeo(b.d, gRing, m); }
    function line(b, ...q) { for (let i = 0; i < q.length - 1; i++) b.l.push(...q[i], ...q[i + 1]); }
    const gRider = new THREE.CylinderGeometry(.26, .3, 1, 6); gRider.translate(0, .5, 0);
    const gHead = new THREE.SphereGeometry(.22, 7, 5);
    function rider(b, x, y, z, h) { vGeo(b.d, gRider, M(x, y, z, 1, h || .95, 1)); vGeo(b.d, gHead, M(x + .05, y + (h || .95) + .2, z, 1, 1, 1)); }
    function finishV(b) {
      const g = new THREE.Group();
      const mk = (arr, mat) => { if (!arr.length) return; const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); g.add(new THREE.Mesh(geo, mat)); };
      mk(b.f, vFill); mk(b.g, vGlass); mk(b.d, vDark);
      if (b.l.length) { const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(b.l, 3)); g.add(new THREE.LineSegments(lg, vLine)); }
      return g;
    }
    const VT = {};
    { // car: bonnet, sloped windscreen, cabin, boot
      const b = VB();
      body(b, [[-2.15, .42], [2.15, .42], [2.2, 1.05], [1.15, 1.18], [.55, 1.82], [-1.05, 1.86], [-1.8, 1.24], [-2.2, 1.12]], 1.8);
      body(b, [[1.05, 1.22], [.55, 1.74], [-1.0, 1.78], [-1.66, 1.26]], 1.86, "g");
      line(b, [-.2, 1.8, .93], [-.2, 1.2, .93]); line(b, [-.2, 1.8, -.93], [-.2, 1.2, -.93]);
      [[1.35, .9], [1.35, -.9], [-1.35, .9], [-1.35, -.9]].forEach(([x, z]) => wheel(b, x, z, .4, .26));
      VT.car = finishV(b);
    }
    { // minibus (danfo / matatu): boxy van, window band, loaded roof rack
      const b = VB();
      body(b, [[-2.8, .45], [2.7, .45], [2.8, 1.25], [2.45, 2.35], [-2.8, 2.4]], 2.1);
      body(b, [[2.5, 1.5], [2.32, 2.18], [-2.55, 2.2], [-2.55, 1.5]], 2.15, "g");
      for (let x = -1.7; x < 2.2; x += 1.05) { line(b, [x, 2.2, 1.08], [x, 1.5, 1.08]); line(b, [x, 2.2, -1.08], [x, 1.5, -1.08]); }
      line(b, [-2.5, 2.7, -.85], [1.9, 2.7, -.85], [1.9, 2.7, .85], [-2.5, 2.7, .85], [-2.5, 2.7, -.85]);
      [[-2.3, -.85], [1.6, -.85], [-2.3, .85], [1.6, .85]].forEach(([x, z]) => line(b, [x, 2.4, z], [x, 2.7, z]));
      vbox(b, -1.2, 2.42, .1, 1.3, .55, 1.1); vbox(b, .5, 2.42, -.2, .9, .4, .9);
      [[1.85, 1.02], [1.85, -1.02], [-1.9, 1.02], [-1.9, -1.02]].forEach(([x, z]) => wheel(b, x, z, .46, .3));
      VT.bus = finishV(b);
    }
    { // lorry: cab and slatted cargo bed
      const b = VB();
      body(b, [[1.6, .55], [3.5, .55], [3.55, 1.45], [3.2, 2.7], [1.6, 2.7]], 2.2);
      body(b, [[3.28, 1.65], [3.05, 2.5], [2.1, 2.5], [2.1, 1.65]], 2.25, "g");
      vbox(b, -1.2, .75, 0, 5.4, .3, 2.4); vbox(b, -1.2, 1.05, 1.15, 5.4, 1.5, .1); vbox(b, -1.2, 1.05, -1.15, 5.4, 1.5, .1); vbox(b, -3.85, 1.05, 0, .1, 1.5, 2.4);
      for (let x = -3.4; x < 1.4; x += .9) { line(b, [x, 1.05, 1.21], [x, 2.55, 1.21]); line(b, [x, 1.05, -1.21], [x, 2.55, -1.21]); }
      vbox(b, -1.6, 1.05, 0, 3, .9, 1.8);
      [[2.6, 1.1], [2.6, -1.1], [-2.2, 1.1], [-2.2, -1.1], [-3.2, 1.1], [-3.2, -1.1]].forEach(([x, z]) => wheel(b, x, z, .5, .34));
      VT.truck = finishV(b);
    }
    { // keke (auto-rickshaw): curved nose, single front wheel, canopy on struts, driver
      const b = VB();
      body(b, [[-1.15, .38], [.9, .38], [1.35, .55], [1.45, 1.05], [1.0, 1.2], [.7, 1.0], [-1.15, 1.05]], 1.3);
      vbox(b, -.15, 2.02, 0, 2.4, .1, 1.45);
      [[-1.1, .6], [-1.1, -.6], [1.0, .6], [1.0, -.6]].forEach(([x, z]) => line(b, [x, 1.05, z], [x, 2.02, z]));
      body(b, [[1.38, 1.1], [1.1, 1.95], [1.02, 1.95], [1.3, 1.1]], 1.1, "g");
      rider(b, .35, .95, 0, .55); vbox(b, -.55, 1.0, 0, .9, .35, 1.1);
      wheel(b, 1.15, 0, .3, .2); wheel(b, -.75, .62, .32, .2); wheel(b, -.75, -.62, .32, .2);
      VT.keke = finishV(b);
    }
    { // motorbike (okada): tank, seat, forks and handlebar, rider and passenger
      const b = VB();
      ring(b, .78, 0, .34); ring(b, -.72, 0, .34);
      body(b, [[-.75, .6], [.35, .55], [.62, .78], [.45, 1.0], [-.2, .95], [-.85, .88]], .32);
      line(b, [.78, .34, 0], [.55, 1.15, 0]); line(b, [.55, 1.15, -.35], [.55, 1.15, .35]); line(b, [-.72, .34, 0], [-.3, .62, 0]);
      rider(b, .05, .92, 0, .7); rider(b, -.5, .92, 0, .65);
      VT.moto = finishV(b); VT.moto.scale.setScalar(1.25);
    }
    { // bicycle: two spoked rings, diamond frame, rider
      const b = VB();
      ring(b, .62, 0, .36); ring(b, -.62, 0, .36);
      const R = [-.62, .36, 0], F = [.62, .36, 0], P = [-.05, .36, 0], S = [-.3, 1.0, 0], H = [.42, 1.05, 0];
      line(b, R, P, S, R); line(b, P, H, S); line(b, F, H); line(b, [.42, 1.05, -.3], [.42, 1.05, .3]);
      for (let k = 0; k < 4; k++) { const an = k * Math.PI / 4; [.62, -.62].forEach(cx => line(b, [cx + Math.cos(an) * .34, .36 + Math.sin(an) * .34, 0], [cx - Math.cos(an) * .34, .36 - Math.sin(an) * .34, 0])); }
      rider(b, -.2, 1.0, 0, .75);
      VT.bike = finishV(b); VT.bike.scale.setScalar(1.15);
    }
    { // push cart: flat bed on two wheels, long handles, sacks, pusher walking behind
      const b = VB();
      vbox(b, .2, .75, 0, 2.4, .12, 1.3); line(b, [-1, .8, .55], [-1.9, 1.05, .55]); line(b, [-1, .8, -.55], [-1.9, 1.05, -.55]);
      vbox(b, .5, .87, .2, .8, .5, .7); vbox(b, -.3, .87, -.2, .7, .45, .6); vbox(b, .4, 1.37, .1, .6, .35, .55);
      wheel(b, .4, .72, .4, .14); wheel(b, .4, -.72, .4, .14);
      rider(b, -2.25, 0, 0, 1.5);
      VT.cart = finishV(b);
    }
    PARKED.forEach(([t, x, z, ry]) => { const g = VT[t].clone(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); });
    const vehicles = [];
    function vehicle(type, axis, lane, dir, start, v, range) {
      const g = VT[type].clone();
      scene.add(g); vehicles.push({ g, axis, lane, dir, start, v, range });
    }
    const types = ["moto", "keke", "bus", "bike", "moto", "keke", "bus", "truck", "moto", "bike", "keke", "car"];
    for (let i = 0; i < 30; i++) { const dir = i % 2 ? 1 : -1; const t = types[i % types.length]; vehicle(t, "x", (dir > 0 ? 1 : -1) * (t === "bike" ? 5.6 : 3.4), dir, rr(-420, 420), t === "bike" ? rr(2.5, 3.5) : rr(5, 9)); }
    for (let i = 0; i < 12; i++) { const dir = i % 2 ? 1 : -1; const t = types[(i + 3) % types.length]; vehicle(t, "z", (i < 6 ? -60 : 90) + (dir > 0 ? -1 : 1) * (t === "bike" ? 3.6 : 2.4), dir, rr(-420, 420), t === "bike" ? rr(2, 3) : rr(4, 7)); }
    for (let i = 0; i < 4; i++) vehicle("cart", "x", 15.2 + i * 16, i % 2 ? 1 : -1, rr(-40, 70), .8, [-46, 78]);
    for (let i = 0; i < 3; i++) vehicle("bike", "x", 23.2 + i * 16, i % 2 ? 1 : -1, rr(-40, 70), 1.4, [-46, 78]);

    function arc(a, b, lift, mat) {
      const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), mid = A.clone().add(B).multiplyScalar(.5); mid.y += lift || A.distanceTo(B) * .42;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(A, mid, B).getPoints(48)), mat || new THREE.LineBasicMaterial({ color: 0x3A5292, transparent: true, opacity: 0, depthTest: false }));
      line.geometry.setDrawRange(0, 0); line.renderOrder = 2; scene.add(line); return line;
    }
    const reveal = [L.groundL, L.far, L.base, L.wholesale, L.stock, L.comp, L.gap];
    // Small still renders of the scene from several places, used by the About page collage
    function snapshots(views) {
      const cv = document.createElement("canvas");
      const r2 = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
      r2.setPixelRatio(Math.min(3, Math.max(2, devicePixelRatio || 1))); r2.setSize(560, 373, false); r2.setClearColor(PAPER);
      const cam = new THREE.PerspectiveCamera(34, 1.5, 1, 1200);
      // draw every line fully, even if the page-load reveal is still running
      const saved = reveal.map(l => [l.lines && l.lines.geometry.drawRange.count, l.sk && l.sk.geometry.drawRange.count, l.fillMat.opacity]);
      reveal.forEach(l => { if (l.lines) l.lines.geometry.setDrawRange(0, Infinity); if (l.sk) l.sk.geometry.setDrawRange(0, Infinity); l.fillMat.opacity = 1; });
      /* sharper ink for the stills: every line darker and more opaque, no fog */
      const inks = [], INK = new THREE.Color(0x2A3558), fog = scene.fog; scene.fog = null;
      scene.traverse(o => { const m = o.material; if (o.isLineSegments || o.isLine) { if (m && !m.depthTest === false || m) { inks.push([m, m.opacity, m.color.getHex()]); const sk = m.opacity < .3; m.opacity = sk ? Math.min(.45, m.opacity * 2.2) : Math.min(1, m.opacity * 1.8 + .2); m.color.lerp(INK, sk ? .3 : .55); } } });
      const out = views.map(([t, p]) => { cam.position.set(p[0], p[1], p[2]); cam.lookAt(t[0], t[1], t[2]); r2.render(scene, cam); return cv.toDataURL("image/png"); });
      inks.forEach(([m, op, c]) => { m.opacity = op; m.color.setHex(c); }); scene.fog = fog;
      reveal.forEach((l, i) => { if (l.lines) l.lines.geometry.setDrawRange(0, saved[i][0]); if (l.sk) l.sk.geometry.setDrawRange(0, saved[i][1]); l.fillMat.opacity = saved[i][2]; });
      r2.dispose(); if (r2.forceContextLoss) r2.forceContextLoss();
      return out;
    }
    return { renderer, scene, camera, L, fogBox, gapLine, routes, people, bodies, heads, loads, vehicles, arc, reveal, GAP, snapshots };
  }


    let gl;
    try { gl = buildScene(); } catch (e) { frame.classList.add("ms-off"); return; }
    const { renderer, scene, camera, L } = gl;
    window.vsScene = gl;
    const WHITE = new THREE.Color(0xffffff), ACC = new THREE.Color("#B3C9EE"), ACCL = new THREE.Color("#3A5292");
    const hi = (layer, k) => { layer.fillMat.color.copy(WHITE).lerp(ACC, k); layer.lineMat.color.copy(layer.base).lerp(ACCL, k); };
    const pm = new THREE.Matrix4(), pq = new THREE.Quaternion(), pp = new THREE.Vector3(), ps1 = new THREE.Vector3(1, 1, 1), ps0 = new THREE.Vector3(0, 0, 0);
    gl.gapLine.material.opacity = .55;

    /* evidence from across the district arcs into the market square */
    const HUB = [15, 2, 47];
    const ANCHORS = [[-113, 3, -20], [133, 3, -55], [-60, 3, 40], [92, 3, -28], [70, 3, 95], [-25, 3, -60], [160, 3, 30], [-140, 3, 70]];
    const arcMat = () => new THREE.LineBasicMaterial({ color: 0x3A5292, transparent: true, opacity: 0, depthTest: false });
    const flights = [];
    function launch(t) { const a = ANCHORS[Math.floor(Math.random() * ANCHORS.length)]; const line = gl.arc(a, HUB, 34 + Math.random() * 20, arcMat()); flights.push({ line, t0: t }); }

    let W = 1, H = 1;
    function size() {
      const r = frame.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.fov = W < 600 ? 40 : 30; camera.updateProjectionMatrix();
    }
    size(); addEventListener("resize", size);

    const sec = $("ln-why");
    let raf = 0, visible = false, last = 0, time = 0, shown = -1, nextArc = 1;
    function draw(now) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; time += dt;
      if (shown < 0) shown = time;
      /* the drawing sketches itself in the first time it is seen */
      const rv = reduce ? 1 : clamp((time - shown) / 3);
      gl.reveal.forEach((l, i) => { const k = clamp(rv * 1.4 - i * .06); if (l.lines) l.lines.geometry.setDrawRange(0, Math.floor(l.nE * k / 2) * 2); if (l.sk) l.sk.geometry.setDrawRange(0, Math.floor(l.nS * k / 2) * 2); if (l.mesh) l.fillMat.opacity = k; });
      /* slow orbit, nudged by scroll */
      const r = sec.getBoundingClientRect(), prog = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
      /* a camera move for each line: wide, close, street level, overhead, across, back over the square, wide again */
      const K = [
        [[20, 0, 20], [-150, 125, 220]],
        [[15, 0, 47], [-38, 42, 112]],
        [[40, 3, 0], [-85, 40, 24]],
        [[20, 0, 0], [-25, 270, 185]],
        [[128, 0, -50], [36, 88, 72]],
        [[15, 0, 47], [118, 66, 138]],
        [[30, 0, 20], [-175, 160, 255]],
        [[60, 0, -10], [-60, 190, 230]]
      ];
      const pv = clamp(+frame.dataset.p || 0), fk = pv * (K.length - 1), ik = Math.min(K.length - 2, Math.floor(fk)), ek = sm(sm(fk - ik));
      const A = K[ik], B = K[ik + 1], mob = W < 600 ? 1.28 : 1;
      /* same distance for every shot: the angle changes, the zoom does not */
      const D = 280, off = k => { const v = [0, 1, 2].map(n => k[1][n] - k[0][n]), l = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / l * D); };
      const oA = off(A), oB = off(B);
      const tg = [0, 1, 2].map(n => A[0][n] + (B[0][n] - A[0][n]) * ek);
      const ov = [0, 1, 2].map(n => oA[n] + (oB[n] - oA[n]) * ek), ol = Math.hypot(ov[0], ov[1], ov[2]) || 1;
      const ps = [0, 1, 2].map(n => tg[n] + ov[n] / ol * D);
      const drift = time * .03 + Math.sin(time * .2) * .02,   /* a slow, continual orbit even when the page is still */ dx = (ps[0] - tg[0]) * mob, dz = (ps[2] - tg[2]) * mob, ca = Math.cos(drift), sa = Math.sin(drift);
      camera.position.set(tg[0] + dx * ca - dz * sa, tg[1] + (ps[1] - tg[1]) * mob + Math.sin(time * .07) * 1.5, tg[2] + dx * sa + dz * ca);
      camera.lookAt(tg[0], tg[1], tg[2]);
      /* people and traffic */
      const { people, bodies, heads, loads } = gl;
      for (let i = 0; i < people.length; i++) {
        const p = people[i]; let x, z, bob;
        if (p.L === 0) { x = p.pts[0][0]; z = p.pts[0][1]; bob = Math.abs(Math.sin(time * 1.6 + p.ph)) * .05; }
        else {
          let u = wrap(p.s + time * p.v, 0, p.L * 2); if (u > p.L) u = 2 * p.L - u;
          let k = 1; while (k < p.cum.length - 1 && p.cum[k] < u) k++;
          const a = p.pts[k - 1], b = p.pts[k], f = (u - p.cum[k - 1]) / ((p.cum[k] - p.cum[k - 1]) || 1);
          x = a[0] + (b[0] - a[0]) * f; z = a[1] + (b[1] - a[1]) * f; bob = Math.abs(Math.sin(u * 3.4)) * .08;
        }
        pp.set(x, bob, z); pm.compose(pp, pq, ps1); bodies.setMatrixAt(i, pm); heads.setMatrixAt(i, pm);
        if (!p.load) pm.compose(pp, pq, ps0); loads.setMatrixAt(i, pm);
      }
      bodies.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true; loads.instanceMatrix.needsUpdate = true;
      for (const v of gl.vehicles) {
        const rg = v.range || [-420, 420], s = wrap(v.start + v.dir * time * v.v, rg[0], rg[1]);
        if (v.axis === "x") { v.g.position.set(s, 0, v.lane); v.g.rotation.y = v.dir > 0 ? 0 : Math.PI; }
        else { v.g.position.set(v.lane, 0, s); v.g.rotation.y = v.dir > 0 ? -Math.PI / 2 : Math.PI / 2; }
      }
      /* parts of the market light up in turn, as signals arrive */
      const stage = +frame.dataset.stage || 0;
      const cyc = (time % 12) / 12, boost = stage <= 1 ? 1 : stage <= 3 ? .45 : .75;
      hi(L.stock, Math.max(0, Math.sin(cyc * Math.PI * 2)) * .8 * boost);
      hi(L.comp, Math.max(0, Math.sin(cyc * Math.PI * 2 - 2.1)) * .8 * boost);
      hi(L.wholesale, Math.max(0, Math.sin(cyc * Math.PI * 2 - 4.2)) * .6 * boost);
      /* SavoScouts walk out to the gap, again and again */
      const sc = (time % 14) / 14;
      gl.routes.forEach(rt => { rt.line.visible = false; }); if (false) gl.routes.forEach(rt => { const q = sm(ramp(sc, .05 + rt.d, .55 + rt.d)); rt.line.material.opacity = (rt.lead ? .9 : .65) * (1 - ramp(sc, .85, 1)); rt.line.geometry.setDrawRange(0, Math.floor(q * 160) + 1); });
      /* evidence arcs into the square */
      if (false && time > nextArc && rv >= 1) { const st = +frame.dataset.stage || 0; if (st >= 4) { launch(time); if (st === 5) launch(time); } else if (st === 3 && Math.random() < .35) launch(time); nextArc = time + (st >= 4 ? .45 + Math.random() * .4 : 1.6 + Math.random()); }
      for (let i = flights.length - 1; i >= 0; i--) {
        const f = flights[i], a = time - f.t0;
        f.line.geometry.setDrawRange(0, Math.floor(sm(clamp(a / 1.6)) * 49));
        f.line.material.opacity = .85 * clamp(a / .3) * (1 - ramp(a, 2.4, 3.4));
        if (a > 3.4) { scene.remove(f.line); f.line.geometry.dispose(); f.line.material.dispose(); flights.splice(i, 1); }
      }
      renderer.render(scene, camera);
    }
    function loop(now) { raf = 0; draw(now); if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); }
    const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(loop); } };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); else last = 0; }, { rootMargin: "100px" }).observe(frame);
    else { visible = true; kick(); }
    document.addEventListener("visibilitychange", kick);
    if (reduce) { ["stock", "comp"].forEach(k => hi(L[k], .5)); draw(performance.now()); addEventListener("resize", () => draw(performance.now())); }
    else addEventListener("scroll", () => { if (visible && !raf) kick(); }, { passive: true });
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
    const sel = [".ln-head > *", ".hm li", ".net-card", ".ms-frame", ".hw-list", ".hw-stage", ".v3-card", ".v3-why .ln-wrap > *", ".v3-rel", ".v3-tr article", ".v3-qa details", ".v3-touch article", ".ln-close .ln-wrap > *"];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    sel.forEach(s => root.querySelectorAll(s).forEach((el, k) => { el.classList.add("ln-rv"); el.style.setProperty("--d", Math.min((k % 4) * 90, 270) + "ms"); io.observe(el); }));
  }

  /* ---------- Sound: each section shifts the score, as the chapters did ---------- */
  if ("IntersectionObserver" in window) {
    const secs = [...root.querySelectorAll(":scope > section")];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && window.vsSound) window.vsSound.chapter(Math.min(9, secs.indexOf(en.target)), true); }), { threshold: .4 });
    secs.forEach(s => io.observe(s));
  }
document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest(".ax-tb"); if (!b) return; var w = b.closest("[data-ax-tabs]"); var tabs = [].slice.call(w.querySelectorAll(".ax-tb")); var k = tabs.indexOf(b); tabs.forEach(function (t, n) { t.setAttribute("aria-selected", String(n === k)); t.tabIndex = n === k ? 0 : -1; }); [].forEach.call(w.querySelectorAll(".ax-tp"), function (p, n) { p.hidden = n !== k; }); });
document.addEventListener("keydown", function (e) { var b = e.target.closest && e.target.closest(".ax-tb"); if (!b || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return; var tabs = [].slice.call(b.parentNode.querySelectorAll(".ax-tb")); var n = (tabs.indexOf(b) + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; tabs[n].focus(); tabs[n].click(); });
(function () { var els = document.querySelectorAll(".oh-tile"); if (!els.length) return; if (!("IntersectionObserver" in window)) { [].forEach.call(els, function (e) { e.classList.add("in"); }); return; } var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .35 }); [].forEach.call(els, function (e) { io.observe(e); }); })();
(function () { var card = document.querySelector(".net-card"); if (!card) return; var seq = [].slice.call(card.querySelectorAll(".net-src, .net-n, .net-out, .net-gap")); seq.forEach(function (el, i) { el.style.transitionDelay = (0.15 + i * 0.09).toFixed(2) + "s"; }); [].forEach.call(card.querySelectorAll(".net-e, .net-p"), function (el, i) { el.style.transitionDelay = (0.3 + (i % 9) * 0.07).toFixed(2) + "s"; }); [].forEach.call(card.querySelectorAll(".net-mem, .net-memt"), function (el) { el.style.transitionDelay = "1.2s"; }); [].forEach.call(card.querySelectorAll(".net-dot, .net-loop"), function (el) { el.style.transitionDelay = "2.2s"; }); if (!("IntersectionObserver" in window)) { card.classList.add("in"); return; } var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { card.classList.add("in"); io.disconnect(); } }, { threshold: .3 }); io.observe(card); })();
}
