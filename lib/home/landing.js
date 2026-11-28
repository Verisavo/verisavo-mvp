// Homepage behaviour: signal field, How it works, the intelligence layer, case studies and the closing question
export default function init() {
  /* Verisavo homepage behaviour: the signal field, header states, How it works, the layer stack, case studies and the closing question */
  const $ = id => document.getElementById(id);
  const root = $("ln");
  if (!root) return;
  document.body.classList.add("ln-on");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* a topic or message carried in from another page presets the contact form */
  try { const ct = sessionStorage.getItem("verisavo-topic"), cm = sessionStorage.getItem("verisavo-msg"); if (ct || cm) { sessionStorage.removeItem("verisavo-topic"); sessionStorage.removeItem("verisavo-msg"); setTimeout(() => { const r = ct && document.querySelector('input[name=cf-topic][value="' + ct + '"]'); if (r) r.checked = true; const mm = document.getElementById("cf-msg"); if (mm && cm) mm.value = cm; }, 0); } } catch (e) {}
  /* every footer gives the contact address */
  /* the closing question leads to a demo request, carrying what was typed */
  const toAssistant = q => {
    try { if (q) sessionStorage.setItem("verisavo-demo-q", q); } catch (e) {}
    if (window.vsGoPage) window.vsGoPage("demo"); else location.href = "/demo";
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
      ctx.fillStyle = "rgba(177,197,223,.10)";
      const step = 28, ox = (t * 2) % step;
      for (let x = -ox; x < W; x += step) for (let y = 0; y < H; y += step) ctx.fillRect(x, y, 1, 1);
      const P = nodes.map(nd => pos(nd, t));
      ctx.lineWidth = 1;
      links.forEach(([a, b, far]) => {
        if (far) return;
        ctx.strokeStyle = "rgba(140,169,208,.16)"; ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke();
      });
      links.forEach(([a, b, far]) => {
        if (!far) return;
        ctx.strokeStyle = "rgba(140,169,208,.07)"; ctx.setLineDash([2, 6]); ctx.beginPath();
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
          ctx.strokeStyle = `rgba(177,197,223,${.55 * fade})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(A.x, A.y);
          const steps = 24;
          for (let s = 1; s <= Math.round(steps * k); s++) { const u = s / steps; ctx.lineTo((1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * mx + u * u * B.x, (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * my + u * u * B.y); }
          ctx.stroke(); ctx.lineWidth = 1;
          if (k >= 1) { ctx.fillStyle = `rgba(255,255,255,${.9 * fade})`; ctx.beginPath(); ctx.arc(B.x, B.y, 2.6, 0, 6.28); ctx.fill(); }
        } else {
          const A = P[p.i], k = (age % 1.6) / 1.6;
          ctx.strokeStyle = `rgba(177,197,223,${.6 * (1 - k)})`; ctx.beginPath(); ctx.arc(A.x, A.y, 4 + k * 22, 0, 6.28); ctx.stroke();
        }
      });
      // nodes
      nodes.forEach((nd, i) => {
        const p = P[i], tw = .55 + .45 * Math.sin(t * 1.3 + nd.ph);
        ctx.fillStyle = nd.c < 0 ? `rgba(177,197,223,${.25 + .2 * tw})` : `rgba(209,221,236,${.55 + .35 * tw})`;
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
    renderer.setPixelRatio(Math.min(3, Math.max(2, devicePixelRatio || 1)));
    const PAPER = 0xF5F8FC;
    renderer.setClearColor(PAPER);
    canvas.addEventListener("webglcontextlost", onGLLost, false);
    canvas.addEventListener("webglcontextrestored", onGLRestored, false);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PAPER, 170, 560);
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 2400);

    const UPV = new THREE.Vector3(0, 1, 0);
    const SH = { top: new THREE.Color("#FFFFFF"), s: new THREE.Color("#EDF2F8"), w: new THREE.Color("#E3EAF4"), n: new THREE.Color("#FAFAFA"), e: new THREE.Color("#EEF1F6") };

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

    /* details from the drawn market: roof water tanks on stands, windows and doors on shop fronts */
    function tank(col, x, y, z, s) { s = s || 1; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => seg(col, x + a * .7 * s, y, z + c * .7 * s, x + a * .7 * s, y + 1.5 * s, z + c * .7 * s)); box(col, x, z, 1.9 * s, 1.9 * s, .12, y + 1.5 * s); add(col, UY, M(x, y + 1.62 * s, z, 1.7 * s, 1.8 * s, 1.7 * s)); for (let k = 1; k < 4; k++) rectLine(col, x - .86 * s, z - .86 * s, x + .86 * s, z + .86 * s, y + 1.62 * s + k * .45 * s); }
    function win(col, x, y, z, w, h) { seg(col, x, y, z, x + w, y, z); seg(col, x + w, y, z, x + w, y + h, z); seg(col, x + w, y + h, z, x, y + h, z); seg(col, x, y + h, z, x, y, z); seg(col, x + w / 2, y, z, x + w / 2, y + h, z); }
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
        if (rnd() > .45) tank(col, x + w * rr(.25, .75), h, cz + rr(-2, 2), rr(.85, 1.1));
        for (let fy = 4.1; fy < h - 1.6; fy += 3.2) for (let wx = x + 1.1; wx < x + w - 2.6; wx += 2.6) win(col, wx, fy, zFront + .04, 1.3, 1.5);
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
        if (rnd() > .5) tank(C.base, x + w * rr(.3, .7), h, z0 - d / 2 + rr(-2, 2), rr(.9, 1.15));
        for (let fy = 4.1; fy < h - 1.6; fy += 3.2) for (let wx = x + 1.2; wx < x + w - 3; wx += 3) win(C.base, wx, fy, z0 + .04, 1.4, 1.5);
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
    /* umbrellas, goods and floor traders along both kerbs */
    for (let x = -130; x < 170; x += rr(3.4, 5.6)) { if (Math.abs(x + 60) < 8 || Math.abs(x - 90) < 8) continue; parasol(C.base, x, -8.9 + rr(-.3, .3), rr(.8, 1.05)); if (rnd() > .4) goods(C.base, x + rr(-.8, .8), 0, -8.2); }
    for (let x = -47; x < 80; x += rr(3, 5)) { if (x > 9 && x < 22) continue; parasol(C.base, x, 10.6 + rr(-.3, .3), rr(.8, 1)); if (rnd() > .5) floorTrader(C.base, x + 1.2, 11.4); }
    // overhead wires on leaning poles
    for (let r = 0; r <= 8; r += 2) { const z = 15 + r * 8; let px = -49, py = 6.5; for (let x = -49; x <= 81; x += 26) { seg(C.base, x, 0, z, x + .3, 6.5, z); if (x > -49) { const mx = (px + x) / 2; seg(C.base, px, py, z, mx, py - 1.1, z); seg(C.base, mx, py - 1.1, z, x + .3, 6.5, z); } px = x + .3; } }
    for (let i = 0; i < 14; i++) { const x = rr(56, 79), z = rr(60, 80); add(C.comp, UC, M(x, 1.9, z, 3.4, .9, 3.4)); seg(C.comp, x, 0, z, x, 1.9, z); box(C.comp, x, z, 1.6, 1.1, .8); }
    [-44, -37, -30, -23].forEach(x => { box(C.base, x, 14.6, 6, 2.4, 2.6); tin(C.base, x, 15.2, 6.6, 3.6, 2.6, 1); });
    // covered market hall with a corrugated roof
    box(C.base, -12, 100, 70, 24, 6.5); prism(C.base, -12, 100, 70, 24.6, 4, 6.5);
    for (let x = -44; x <= 20; x += 8) seg(C.base, x, 6.5, 112.2, x, 0, 112.2);
    for (let x = -46; x <= 22; x += 2.2) seg(C.base, x, 6.6, 112.2, x, 10.4, 100);
    /* name board on the hall: switched off, the market stays unnamed */
    false && (() => {
      const NAME = "MAKOLA MARKET", cw = 1024, ch = 140, cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
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
    const PAL = ["#5681BA", "#6D93C4", "#3B6091", "#8CA9D0", "#4774AE", "#1F273F", "#B1C5DF"].map(c => new THREE.Color(c));
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
    const WHITE = new THREE.Color(0xffffff), ACC = new THREE.Color("#BDCEE4"), ACCL = new THREE.Color("#3B6091");
    const hi = (layer, k) => { layer.fillMat.color.copy(WHITE).lerp(ACC, k); layer.lineMat.color.copy(layer.base).lerp(ACCL, k); };
    const pm = new THREE.Matrix4(), pq = new THREE.Quaternion(), pp = new THREE.Vector3(), ps1 = new THREE.Vector3(1, 1, 1), ps0 = new THREE.Vector3(0, 0, 0);
    gl.gapLine.material.opacity = .55;

    /* evidence from across the district arcs into the market square */
    const HUB = [15, 2, 47];
    const ANCHORS = [[-113, 3, -20], [133, 3, -55], [-60, 3, 40], [92, 3, -28], [70, 3, 95], [-25, 3, -60], [160, 3, 30], [-140, 3, 70]];
    const arcMat = () => new THREE.LineBasicMaterial({ color: 0x3A5292, transparent: true, opacity: 0, depthTest: false });
    const flights = [];
    function launch(t) { const a = ANCHORS[Math.floor(Math.random() * ANCHORS.length)]; const line = gl.arc(a, HUB, 34 + Math.random() * 20, arcMat()); flights.push({ line, t0: t }); }

    let W = 1, H = 1, PR = 0, ready = false;
    function size() {
      /* resizing a canvas wipes it, and phones fire resize while scrolling (the address bar moves).
         Only resize when the size really changed, then redraw at once so no blank frame shows. */
      const r = frame.getBoundingClientRect(), nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      const npr = Math.min(3, Math.max(2, devicePixelRatio || 1), Math.sqrt(3840 * 2160 / (nw * nh)));
      if (nw === W && nh === H && npr === PR) return;
      W = nw; H = nh; PR = npr;
      /* sharp render: at least 2x, up to 3x on high-density screens, capped near 4K so phones stay smooth */
      renderer.setPixelRatio(PR); renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.fov = W < 600 ? 40 : 30; camera.updateProjectionMatrix();
      if (ready) draw(performance.now());
    }
    size(); addEventListener("resize", size);

    const sec = $("ln-why") || frame;
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
      const A = K[ik], B = K[ik + 1], mob = W < 600 ? 1.28 : 1; if (scene.fog) { scene.fog.near = 170 * mob * mob; scene.fog.far = 560 * mob * mob; }
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
    ready = true;
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
(function () { var card = document.querySelector(".net-card"); if (!card) return; [].forEach.call(card.querySelectorAll("svg"), function (sv) { [].forEach.call(sv.querySelectorAll(".net-src, .net-n, .net-out, .net-gap"), function (el, i) { el.style.transitionDelay = Math.min(0.03 + i * 0.03, 0.45).toFixed(2) + "s"; }); [].forEach.call(sv.querySelectorAll(".net-e, .net-p"), function (el, i) { el.style.transitionDelay = (0.08 + (i % 9) * 0.03).toFixed(2) + "s"; }); }); [].forEach.call(card.querySelectorAll(".net-mem, .net-memt"), function (el) { el.style.transitionDelay = "0.35s"; }); [].forEach.call(card.querySelectorAll(".net-dot, .net-loop"), function (el) { el.style.transitionDelay = "0.6s"; }); if (!("IntersectionObserver" in window)) { card.classList.add("in"); return; } var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { card.classList.add("in"); io.disconnect(); } }, { threshold: .02, rootMargin: "0px 0px 12% 0px" }); io.observe(card); })();







/* >>> fx flow */
(function () {
  var fx = document.querySelector("[data-fx]"); if (!fx || fx.__fx) return; fx.__fx = 1;
  var steps = [].slice.call(fx.querySelectorAll(".fx-s"));
  function show(n) {
    steps.forEach(function (s) {
      var on = +s.getAttribute("data-step") === n;
      s.classList.toggle("on", on);
      var v = s.querySelector(".fx-vis"); if (v) v.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }
  show(1);
  fx.classList.add("js");
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) show(+e.target.parentNode.getAttribute("data-step")); });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  steps.forEach(function (s) { var t = s.querySelector(".fx-txt"); if (t) io.observe(t); });
})();
/* <<< fx flow */
/* >>> homepage sim */
(function () {
  var root = document.querySelector("[data-sim]"); if (!root || root.__sim) return; root.__sim = 1;
  var win = root.querySelector(".sim-win"), feed = root.querySelector(".sim-feed"), now = root.querySelector(".sim-now");
  var inp = root.querySelector(".sim-in"), typed = root.querySelector(".sim-typed"), send = root.querySelector(".sim-send");
  var Q = "Why are our noodle sales slowing in Accra?";
  var SRC = ["Sales by distributor, Q3", "Import levy notice", "Online shelf prices", "Packaged food channel study"];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var steps = [].slice.call(root.querySelectorAll(".sim-steps li"));
  var run = 0, visible = false, playing = false, cur = -1;
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var sleep = function (ms, id) { return new Promise(function (res, rej) { setTimeout(function () { id === run ? res() : rej(); }, ms); }); };
  var PINS = [[10, 20], [55, 60], [30, 85], [80, 35], [95, 70], [45, 10], [70, 95], [20, 50], [60, 40], [85, 5], [5, 75]];
  var EV = [["Sales down 18% since August", "Company data · private"], ["Levy raised landed cost from 1 September", "Public records"], ["Rival pack about 15% cheaper", "Digital information"]];
  var evRow = function (e) { return el("div", "", "<span>" + e[0] + "</span><em>" + e[1] + "</em>"); };
  var qline = function () { return el("p", "sim-qline", "<span>You asked</span>" + Q); };
  function cards() {
    return {
      ev: el("div", "sim-card", '<p class="sim-h">Reading the evidence</p><div class="sim-src">' + SRC.map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</div>"),
      ans: el("div", "sim-card", '<p class="sim-h">Answer</p><p>Sales in Accra are down 18% since August, mostly in Madina and Kaneshie. The drop lines up with an import levy that raised your shelf price and a cheaper rival pack that appeared in the same weeks.</p><div class="sim-ev"></div>'),
      gap: el("div", "sim-card sim-gap", '<p class="sim-h">Intelligence Gap</p><p>Still unknown: are shops running out of your stock, or are shoppers switching to the rival? The answer could change your decision.</p><span class="sim-btn">Send SavoScouts</span>'),
      scout: el("div", "sim-card sim-scout", '<p class="sim-h">SavoScouts investigation</p><p>Brief sent to 6 SavoScouts in Madina and Kaneshie: check 40 shops for stock, shelf position and price.</p><div class="sim-map"><svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 78 C120 70 210 96 330 74 S520 40 600 52" /><path d="M150 0 C170 40 140 80 175 120" /><path d="M430 0 C415 45 455 82 440 120" /><path d="M0 28 C90 36 230 20 300 30" /></svg><span class="sim-area" style="left:14%;top:12%">Kaneshie</span><span class="sim-area" style="left:66%;top:12%">Madina</span></div><p class="sim-meta"><span class="sim-n">0 of 40 shops visited</span><span>Geo-tagged · time-stamped</span></p><ul class="sim-ver"><li>Location matches the brief</li><li>Photos and prices consistent</li><li>Cross-checked across SavoScouts</li></ul>'),
      res: el("div", "sim-card sim-res", '<p class="sim-h">Ground-Level Intelligence returned</p><p><b>31 of 40 shops stocked the rival pack next to yours. Only 4 had run out of your stock.</b> The drop is mainly shoppers switching on price, not a supply problem.</p><span class="sim-mem">Answer updated · saved to Market Memory</span>')
    };
  }
  /* the step write-ups: highlighted on desktop, mirrored under the window on phones */
  var bar6 = "";
  function mark(i) {
    steps.forEach(function (li, k) { li.classList.toggle("now", k === i); li.classList.toggle("done", k < i); });
    if (now && steps[i]) {
      bar6 = steps.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("");
      now.innerHTML = '<span class="sim-bar6">' + bar6 + "</span>" + '<span class="sim-sn">' + steps[i].querySelector(".sim-sn").textContent + "</span><b>" + steps[i].querySelector("h3").textContent + '</b><span class="sim-sd">' + steps[i].querySelector(".sim-sd").textContent + "</span>";
    }
  }
  async function swap(nodes, id) {
    var old = feed.querySelector(".sim-scr");
    if (old) { old.classList.add("out"); await sleep(240, id); }
    feed.innerHTML = ""; var s = el("div", "sim-scr"); nodes.forEach(function (n) { s.append(n); }); feed.append(s); return s;
  }
  function clearComposer() { typed.textContent = ""; inp.classList.remove("has", "typing"); send.classList.remove("ready", "tap"); }
  /* one screen per step, each with its own short animation */
  async function screen(i, id) {
    mark(i); clearComposer(); win.classList.remove("fade"); var c = cards();
    if (i === 0) {
      await swap([], id); inp.classList.add("typing", "has");
      for (var t = 1; t <= Q.length; t++) { typed.textContent = Q.slice(0, t); if (t === 1) send.classList.add("ready"); await sleep(26, id); }
      await sleep(300, id); send.classList.add("tap"); await sleep(150, id); clearComposer();
      await swap([el("div", "sim-q", Q), el("div", "sim-think", "<i></i><i></i><i></i>")], id);
    } else if (i === 1) {
      await swap([qline(), c.ev], id); var chips = c.ev.querySelectorAll(".sim-src span");
      for (var j = 0; j < chips.length; j++) { await sleep(300, id); chips[j].classList.add("on"); }
    } else if (i === 2) {
      await swap([qline(), c.ans], id); var ev = c.ans.querySelector(".sim-ev");
      for (var k = 0; k < EV.length; k++) { await sleep(350, id); ev.append(evRow(EV[k])); }
    } else if (i === 3) {
      await swap([qline(), c.gap], id); var btn = c.gap.querySelector(".sim-btn");
      await sleep(1400, id); btn.classList.add("tap"); await sleep(200, id); btn.classList.remove("tap"); btn.classList.add("sent"); btn.firstChild.textContent = "SavoScouts briefed ";
    } else if (i === 4) {
      await swap([c.scout], id); var map = c.scout.querySelector(".sim-map"), n = c.scout.querySelector(".sim-n");
      for (var s = 1; s <= 40; s++) {
        if (s % 3 === 0 || s === 40) { var pin = el("i", "sim-pin"), P = PINS[s % PINS.length]; pin.style.left = ((s % 2 ? 6 : 54) + P[0] * .4) + "%"; pin.style.top = (34 + P[1] * .55) + "%"; map.append(pin); }
        n.textContent = s + " of 40 shops visited"; await sleep(45, id);
      }
      var checks = c.scout.querySelectorAll(".sim-ver li");
      for (var v = 0; v < checks.length; v++) { await sleep(280, id); checks[v].classList.add("ok"); }
    } else {
      await swap([qline(), c.res], id);
    }
  }
  var HOLD = [900, 900, 1300, 700, 900, 4200];
  async function loop() {   /* phones and tablets: play the six screens in turn */
    var id = ++run; playing = true;
    try { while (true) { for (var i = 0; i < 6; i++) { await screen(i, id); await sleep(HOLD[i], id); } win.classList.add("fade"); await sleep(600, id); } } catch (e) { /* stopped */ }
  }
  function show(i) {   /* desktop: the screen follows the write-up being read */
    if (i === cur) return; cur = i; var id = ++run; playing = false;
    screen(i, id).catch(function () {});
  }
  function finalState(i) {
    run++; mark(i); clearComposer(); var c = cards(); var s = el("div", "sim-scr");
    if (i === 5) s.append(qline(), c.res); else if (i === 3) s.append(qline(), c.gap); else if (i === 2) { EV.forEach(function (e) { c.ans.querySelector(".sim-ev").append(evRow(e)); }); s.append(qline(), c.ans); } else s.append(qline(), c.ans);
    feed.innerHTML = ""; feed.append(s);
  }
  var desk = matchMedia("(min-width: 961px)");
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && desk.matches) { var i = steps.indexOf(e.target); if (reduced) finalState(i); else show(i); } }); }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach(function (li) { io.observe(li); });
  var check = function () {
    if (desk.matches) { if (playing) { run++; playing = false; } return; }
    if (reduced) { finalState(5); return; }
    if (visible && !playing) loop(); else if (!visible && playing) { run++; playing = false; }
  };
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; check(); }, { threshold: 0.3 }).observe(win);
  (desk.addEventListener ? desk.addEventListener("change", function () { cur = -1; check(); }) : desk.addListener(function () { cur = -1; check(); }));
  finalState(desk.matches ? 0 : 5); if (desk.matches) { cur = -1; mark(0); }
})();
/* <<< homepage sim */
/* >>> network slider */
(function () {
  var card = document.querySelector(".pb .net-card"); if (!card) return;
  var sc = card.querySelector(".net-scroll"); if (!sc || card.querySelector(".net-hint")) return;
  var fl = document.createElement("span"); fl.className = "net-fade net-fade-l"; fl.setAttribute("aria-hidden", "true");
  var fr = document.createElement("span"); fr.className = "net-fade net-fade-r"; fr.setAttribute("aria-hidden", "true");
  var hint = document.createElement("div"); hint.className = "net-hint"; 
  hint.innerHTML = '<span>Swipe or pinch to zoom</span><span class="net-track"><span class="net-thumb"></span></span><span class="net-zoom"><button type="button" data-z="-1" aria-label="Zoom out">\u2212</button><button type="button" data-z="1" aria-label="Zoom in">+</button></span>';
  card.appendChild(fl); card.appendChild(fr); card.appendChild(hint);
  var done = false;
  var thumb = hint.querySelector(".net-thumb");
  function upd() {
    var max = sc.scrollWidth - sc.clientWidth; if (max <= 0) { card.removeAttribute("data-at"); return; }
    var p = sc.scrollLeft / max, w = Math.max(.2, sc.clientWidth / sc.scrollWidth);
    thumb.style.width = (w * 100) + "%"; thumb.style.left = (p * (1 - w) * 100) + "%";
    card.setAttribute("data-at", sc.scrollLeft < 4 ? "start" : (sc.scrollLeft > max - 4 ? "end" : "mid"));
  }
  sc.addEventListener("scroll", upd, { passive: true });
  /* zoom: pinch with two fingers or use the buttons; the point under your fingers stays put */
  var svg = sc.querySelector(".net-svg:not(.net-svg-m)"), BASE = 760, MAXW = 1500, w = BASE;
  var zo = hint.querySelector('[data-z="-1"]'), zi = hint.querySelector('[data-z="1"]');
  function minW() { return Math.max(240, sc.clientWidth - 36); }
  function phone() { return window.matchMedia("(max-width: 760px)").matches; }
  function setW(nw, cx) {
    if (!svg || !phone()) return;
    nw = Math.max(minW(), Math.min(MAXW, nw)); if (cx == null) cx = sc.clientWidth / 2;
    var ratio = nw / w, focus = sc.scrollLeft + cx - 18;
    w = nw; svg.style.setProperty("width", nw + "px", "important");
    sc.scrollLeft = Math.max(0, focus * ratio - cx + 18);
    zo.disabled = nw <= minW() + 2; zi.disabled = nw >= MAXW - 2; upd();
  }
  function zoomTo(target, cx) {
    var from = w, t0 = null; target = Math.max(minW(), Math.min(MAXW, target));
    function st(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 260), e = 1 - Math.pow(1 - k, 3); setW(from + (target - from) * e, cx); if (k < 1) requestAnimationFrame(st); }
    requestAnimationFrame(st);
  }
  [zo, zi].forEach(function (b) { b.addEventListener("click", function () { done = true; zoomTo(w * (b === zi ? 1.35 : 1 / 1.35)); }); });
  var pd = 0, pw = 0;
  function dist(t) { var a = t[0], b = t[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  sc.addEventListener("touchstart", function (e) { if (e.touches.length === 2) { done = true; pd = dist(e.touches); pw = w; } }, { passive: true });
  sc.addEventListener("touchmove", function (e) {
    if (e.touches.length !== 2 || !pd) return; e.preventDefault();
    var r = sc.getBoundingClientRect(), cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
    setW(pw * dist(e.touches) / pd, cx);
  }, { passive: false });
  sc.addEventListener("touchend", function (e) { if (e.touches.length < 2 && pd) { pd = 0; } }, { passive: true });
  sc.addEventListener("dblclick", function (e) { var r = sc.getBoundingClientRect(); done = true; zoomTo(w < BASE * 1.3 ? w * 1.6 : BASE, e.clientX - r.left); });
  window.addEventListener("resize", function () { if (!phone() && svg) { svg.style.removeProperty("width"); w = BASE; } });
  window.addEventListener("resize", upd);
  /* when it first comes into view on a phone, glide from the sources towards the centre so the slide is obvious */
    function glide() {
    if (done) return; done = true;
    var max = sc.scrollWidth - sc.clientWidth; if (max <= 0) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { sc.scrollLeft = 0; upd(); return; }
    var to = max * .5, t0 = null, touched = false;
    sc.addEventListener("touchstart", function () { touched = true; }, { passive: true, once: true });
    function step(t) { if (touched) return; if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1600), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; sc.scrollLeft = to * e; if (k < 1) requestAnimationFrame(step); }
    setTimeout(function () { requestAnimationFrame(step); }, 900);
  }
  upd();
  if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { glide(); io.disconnect(); } }, { threshold: .4 }); io.observe(card); } else glide();
})();
/* <<< network slider */
/* jigsaw pieces: a touch, click or hover gives a piece a springy bounce, then it floats on */
(function () {
  var ul = document.querySelector("#ln .why-src"); if (!ul) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  function bounce(li) {
    if (!li || li._b) return; li._b = 1;
    var svg = li.querySelector(".why-pz"), lab = li.querySelector("span");
    var kf = [{ transform: "translateY(0) scale(1,1)" }, { transform: "translateY(4px) scale(1.07,.9)", offset: .14 }, { transform: "translateY(-22px) scale(.96,1.06)", offset: .38 }, { transform: "translateY(0) scale(1.04,.95)", offset: .6 }, { transform: "translateY(-8px) scale(.99,1.02)", offset: .76 }, { transform: "translateY(0) scale(1.01,.99)", offset: .9 }, { transform: "translateY(0) scale(1,1)" }];
    var o = { duration: 760, easing: "cubic-bezier(.3,.7,.4,1)" };
    if (svg && svg.animate) { var a = svg.animate(kf, o); if (lab) lab.animate(kf, o); a.onfinish = function () { li._b = 0; }; } else li._b = 0;
  }
  [].forEach.call(ul.querySelectorAll("li"), function (li) {
    li.style.cursor = "pointer"; li.style.touchAction = "manipulation";
    li.addEventListener("pointerdown", function () { bounce(li); });
    li.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") bounce(li); });
  });
})();
/* jigsaw pieces: drop in from above when the section scrolls into view, then keep floating */
(function () {
  var ul = document.querySelector("#ln .why-src"); if (!ul) return;
  if (!("IntersectionObserver" in window) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  ul.classList.add("pz-wait");
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ul.classList.remove("pz-wait"); ul.classList.add("pz-go"); io.disconnect(); } }, { threshold: .35 });
  io.observe(ul);
})();
/* >>> phone diagram: pinch to zoom, drag to move, double-tap to reset */
(function () {
  var card = document.querySelector(".pb .net-card"), svg = card && card.querySelector(".net-svg.net-mob"); if (!svg || card.dataset.pz) return; card.dataset.pz = "1";
  var s = 1, tx = 0, ty = 0, MAX = 3, g = null, lastTap = 0, base = null;
  var tip = document.createElement("p"); tip.className = "net-pinch"; tip.textContent = "Pinch to zoom. Double-tap to reset."; card.appendChild(tip);
  function phone() { return window.matchMedia("(max-width: 40rem)").matches; }
  function setBase() { var r = card.getBoundingClientRect(); base = { x: r.left + window.pageXOffset, y: r.top + window.pageYOffset, w: card.offsetWidth, h: card.offsetHeight }; }
  function clamp() { tx = Math.min(0, Math.max(base.w - base.w * s, tx)); ty = Math.min(0, Math.max(base.h - base.h * s, ty)); }
  function paint(anim) {
    if (!base) setBase(); clamp(); var on = s > 1.001;
    card.style.transition = anim ? "transform .22s ease, box-shadow .22s ease" : "none";
    card.style.transformOrigin = "0 0"; card.style.transform = on ? "translate(" + tx + "px," + ty + "px) scale(" + s + ")" : "";
    card.classList.toggle("net-zoomed", on); if (!on) base = null;
  }
  function reset() { s = 1; tx = 0; ty = 0; if (!base) setBase(); paint(true); }
  function pt(t) { return { x: t.pageX - base.x, y: t.pageY - base.y }; }
  card.addEventListener("touchstart", function (e) {
    if (!phone()) return;
    if (e.touches.length === 2) {
      if (!base) setBase(); var a = pt(e.touches[0]), b = pt(e.touches[1]);
      g = { k: "pinch", d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, s: s, tx: tx, ty: ty };
    } else if (e.touches.length === 1) {
      var now = Date.now(); if (now - lastTap < 300 && s > 1.001) { e.preventDefault(); reset(); lastTap = 0; g = null; return; } lastTap = now;
      g = s > 1.001 ? { k: "pan", x: e.touches[0].clientX, y: e.touches[0].clientY, tx: tx, ty: ty } : null;
    }
  }, { passive: false });
  card.addEventListener("touchmove", function (e) {
    if (!g) return;
    if (g.k === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      var a = pt(e.touches[0]), b = pt(e.touches[1]), d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var ns = Math.max(1, Math.min(MAX, g.s * d / g.d));
      tx = mx - (g.mx - g.tx) * (ns / g.s); ty = my - (g.my - g.ty) * (ns / g.s); s = ns; paint(false);
    } else if (g.k === "pan" && e.touches.length === 1) {
      var dx = e.touches[0].clientX - g.x, dy = e.touches[0].clientY - g.y, want = g.ty + dy;
      tx = g.tx + dx; ty = want; clamp();
      var left = want - ty; /* drag beyond the top or bottom edge moves the page instead */
      e.preventDefault(); paint(false);
      if (Math.abs(left) > 0.5) { window.scrollBy(0, -left); g.y += left; }
    }
  }, { passive: false });
  card.addEventListener("touchend", function (e) {
    if (e.touches.length === 0) { g = null; if (s > 1 && s < 1.05) reset(); }
    else if (e.touches.length === 1 && s > 1.001) { g = { k: "pan", x: e.touches[0].clientX, y: e.touches[0].clientY, tx: tx, ty: ty }; }
  }, { passive: true });
  document.addEventListener("touchstart", function (e) { if (s > 1.001 && !card.contains(e.target)) reset(); }, { passive: true });
  window.addEventListener("resize", function () { if (s > 1.001) reset(); });
})();
/* <<< phone diagram pinch */
/* >>> 3d tour: a scroll journey from the homepage. Real Verisavo screens move through depth, over a slow field of signals. */
(function () {
  if (window.vs3dTour) return;
  var N, root, scroller, world, screens = [], caps = [], dots = [], cv, ctx, raf = 0, p = 0, lastP = 0, px = 0, py = 0, opener = null, pts = [], reduce = false, W = 0, H = 0, stepH = 0, isOpen = false;
  var SC = [
    { k: "The question", h: "Sales in Lagos are falling.", x: "Ngozi runs sales at Sample Foods, a sample company. She needs to know why before she decides what to do. She asks Verisavo in plain words.",
      s: '<div class="v3-top"><i>V</i>Verisavo Assistant</div><div class="v3-pad"><p class="v3-q">Why are our sales falling in Lagos?</p><p class="v3-think"><span></span><span></span><span></span>Reading company data, public records and evidence from the ground</p></div>' },
    { k: "The answer", h: "It says what it knows. And what it doesn’t.", x: "Verisavo tells her what seems to be happening, and names the gap it cannot confirm. It does not guess past its evidence.",
      s: '<div class="v3-top"><i>V</i>Verisavo Assistant</div><div class="v3-pad"><p class="v3-q">Why are our sales falling in Lagos?</p><p>Your product is <b>holding up in larger stores</b> but losing ground in smaller shops and open markets, where it is stocked less consistently.</p><p>Two things seem to drive this: gaps in restocking for smaller outlets, and a cheaper rival that is easier to find.</p><p class="v3-gap"><b>Still unknown:</b> what the rival is offering retailers to win the shelf space.</p></div>' },
    { k: "The sources", h: "She can see what it rests on.", x: "Company data, public records and evidence from people on the ground are kept apart, so she can judge how far to trust each one.",
      s: '<div class="v3-top"><i>V</i>What this answer rests on</div><div class="v3-pad"><p class="v3-src"><mark class="c">Sales to small shops fell 18% in six weeks</mark>, while larger stores held steady. <mark class="g">In 15 of 19 shops visited, a cheaper rival pack was on the shelf.</mark> <mark class="p">No change in duty or tax this quarter.</mark></p><ul class="v3-leg"><li><i class="c"></i>Company data</li><li><i class="p"></i>Public records</li><li><i class="g"></i>Evidence from the ground</li></ul></div>' },
    { k: "The what-if", h: "A range, not a promise.", x: "Should Sample Foods match the rival’s price? She tests the idea first, and sees the likely outcome, the range and what it depends on.",
      s: '<div class="v3-top"><i>V</i>What if we matched the rival’s price?</div><div class="v3-pad"><p class="v3-big">+8%<small>sales volume over 12 weeks</small></p><div class="v3-range"><span class="t"></span><span class="b"></span><span class="m"></span></div><div class="v3-scale"><span>0%</span><span>+5%</span><span>+10%</span><span>+15%</span><span>+20%</span></div><p class="v3-note">Likely between +2% and +13%. Rests on shoppers noticing the change, and shops having stock to sell.</p></div>' },
    { k: "On the ground", h: "Then someone goes and looks.", x: "A SavoScout near the market gets the task on WhatsApp, checks the shelf and sends a photo. The response is verified before it counts.",
      s: '<div class="v3-wa"><div class="m"><b>New task near you</b><br>Detergent check in Sabon Gari, Kano<br>About 8 minutes · photo and location · 12 VeriPoints</div><div class="m me">Accept</div><div class="m">Is the rival 500g pack on the shelf today?</div><div class="m me"><span class="ph">Shelf photo · Sabon Gari</span>Yes. ₦1,050, against ₦1,250 for ours.</div><div class="m ok"><b>Verified.</b> Location and photo checked.</div></div>' },
    { k: "The briefing", h: "Now she can decide.", x: "What the evidence means, where SavoScouts agree, what is still unknown and what to do next. She downloads it and takes it to the board.",
      s: '<div class="v3-top"><i>V</i>Investigation briefing</div><div class="v3-pad"><p class="v3-bt">Detergent sales slowdown in Kano</p><p class="v3-meta">From 19 verified SavoScout responses</p><ul class="v3-find"><li>A rival 500g pack sells for about 16% less.<em>High confidence</em></li><li>Shops supplied by van waited 10 days for a delivery, against 3 from wholesalers.<em>High confidence</em></li><li class="un">Is the rival’s price a launch offer, or permanent?<em>Still unknown</em></li></ul></div>' },
    { end: 1, k: "Your demo", h: "See Verisavo on your market.", x: "Tell us the market and the decision in front of you. We’ll set up the walk-through around it.",
      s: '<div class="v3-top"><i>V</i>Request a demo</div><form class="v3-form" novalidate><div class="v3-row"><label><span>Name</span><input name="name" autocomplete="name" maxlength="120" placeholder="Your name"></label><label><span>Work email</span><input name="email" type="email" autocomplete="email" maxlength="160" placeholder="you@company.com"></label></div><div class="v3-row"><label><span>Company</span><input name="org" autocomplete="organization" maxlength="160" placeholder="Company name"></label><label><span>Country or market</span><select name="country"><option value="">Choose a country</option></select></label></div><label><span>WhatsApp number <small>(optional)</small></span><input name="tel" type="tel" autocomplete="tel" maxlength="24" placeholder="WhatsApp number"></label><label><span>What decision do you want help with?</span><textarea name="msg" rows="3" maxlength="2000" placeholder="e.g. Whether to launch our 5-litre cooking oil pack in Kumasi before Accra next year"></textarea></label><button type="submit" class="v3-b solid v3-send">Request a demo</button><div class="v3-st" role="status" hidden></div><p class="v3-fine"><span class="v3-ft">We use these details only to arrange your demo.</span> <button type="button" class="v3-lk" data-v3="tour">Or try the guided tour</button></p></form>' }
  ];
  N = SC.length;
  var CSS = '#v3d{position:fixed;inset:0;z-index:2147483000;background:radial-gradient(120% 90% at 50% 10%,#2A3558 0%,#1F273F 45%,#141B2E 100%);color:#DCE6F5;font-family:inherit;overflow:hidden}#v3d[hidden]{display:none}' +
    '#v3d *{box-sizing:border-box}#v3d canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '#v3d .v3-scroll{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none}#v3d .v3-scroll::-webkit-scrollbar{display:none}#v3d .v3-scroll>div{scroll-snap-align:start}' +
    '#v3d .v3-stage{position:absolute;inset:0;pointer-events:none;display:grid;grid-template-rows:auto 1fr auto}' +
    '#v3d .v3-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(14px + env(safe-area-inset-top,0px)) 20px 10px;pointer-events:auto}#v3d .v3-logo{font:600 20px/1 "Red Hat Display",inherit;font-family:inherit;color:#fff;letter-spacing:-.02em}#v3d .v3-n{font-size:13px;color:#A9B8D6;margin-left:auto}' +
    '#v3d .v3-x{all:unset;box-sizing:border-box;cursor:pointer;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.1);color:#fff}#v3d .v3-x:hover{background:rgba(255,255,255,.18)}#v3d .v3-x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}#v3d button:focus-visible{outline:2px solid #80AADC;outline-offset:3px}' +
    '#v3d .v3-world{position:relative;perspective:1400px;perspective-origin:50% 42%;min-height:0}#v3d .v3-s{position:absolute;left:50%;top:50%;width:min(84vw,700px);margin:0;transform-style:preserve-3d;will-change:transform,opacity;background:#fff;color:#3D4559;border-radius:20px;box-shadow:0 50px 120px -30px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08);overflow:hidden;font-size:clamp(14px,1.55vw,17px);line-height:1.5;text-align:left}' +
    '#v3d .v3-s::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.5),rgba(255,255,255,0) 32%);opacity:var(--sh,0);pointer-events:none}' +
    '#v3d .v3-top{display:flex;align-items:center;gap:10px;padding:13px 18px;border-bottom:1px solid #EEF1F6;font-weight:500;font-size:14px;color:#1F273F}#v3d .v3-top i{width:24px;height:24px;border-radius:7px;background:#1F273F;color:#fff;display:grid;place-items:center;font:700 13px/1 inherit;font-style:normal}' +
    '#v3d .v3-pad{padding:clamp(16px,2.6vw,28px);display:grid;gap:12px}#v3d .v3-pad p{margin:0}#v3d .v3-pad b{color:#1F273F;font-weight:600}#v3d .v3-q{justify-self:end;max-width:88%;padding:10px 15px;border-radius:17px;background:#EEF1F6;color:#1F273F}#v3d .v3-gap{padding:11px 13px;border-radius:12px;background:#FFF6E6;color:#6F4307;font-size:.93em}' +
    '#v3d .v3-think{display:flex;align-items:center;gap:6px;color:#5B6478;font-size:.92em}#v3d .v3-think span{width:7px;height:7px;border-radius:50%;background:#3A5292;animation:v3b 1.2s infinite}#v3d .v3-think span:nth-child(2){animation-delay:.15s}#v3d .v3-think span:nth-child(3){animation-delay:.3s;margin-right:6px}@keyframes v3b{0%,60%,100%{opacity:.25}30%{opacity:1}}' +
    '#v3d .v3-src{line-height:1.8}#v3d mark{color:inherit;padding:2px 3px;border-radius:5px}#v3d mark.c,#v3d .v3-leg i.c{background:#DDE6F6}#v3d mark.p,#v3d .v3-leg i.p{background:#CFE0F3;box-shadow:inset 0 -2px 0 #80AADC}#v3d mark.g,#v3d .v3-leg i.g{background:#D8EEDF}#v3d .v3-leg{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px 18px;font-size:.88em;color:#1F273F}#v3d .v3-leg li{display:flex;align-items:center;gap:8px}#v3d .v3-leg i{width:13px;height:13px;border-radius:4px}' +
    '#v3d .v3-big{font:600 clamp(40px,6.4vw,64px)/1 inherit;color:#1F273F;letter-spacing:-.03em}#v3d .v3-big small{font:400 15px/1.3 inherit;color:#5B6478;letter-spacing:0;margin-left:10px}#v3d .v3-range{position:relative;height:44px}#v3d .v3-range .t{position:absolute;left:0;right:0;top:19px;height:6px;border-radius:6px;background:#EEF1F6}#v3d .v3-range .b{position:absolute;top:15px;height:14px;border-radius:14px;left:10%;width:55%;background:linear-gradient(90deg,#C9D8F2,#3A5292,#C9D8F2)}#v3d .v3-range .m{position:absolute;top:7px;left:40%;width:30px;height:30px;margin-left:-15px;border-radius:50%;background:#fff;border:3px solid #1F273F}#v3d .v3-scale{display:flex;justify-content:space-between;font-size:12.5px;color:#5B6478}#v3d .v3-note{font-size:.9em;color:#5B6478}' +
    '#v3d .v3-wa{background:#EFEAE2;padding:clamp(14px,2.4vw,24px);display:grid;gap:9px}#v3d .v3-wa .m{background:#fff;border-radius:15px 15px 15px 4px;padding:11px 14px;max-width:84%;justify-self:start;color:#3D4559}#v3d .v3-wa .m b{color:#1F273F}#v3d .v3-wa .m.me{justify-self:end;background:#D9FDD3;border-radius:15px 15px 4px 15px;color:#1F3B2B}#v3d .v3-wa .m.ok{background:#E4F3EA;color:#14553A}#v3d .v3-wa .ph{display:grid;place-items:end start;height:74px;border-radius:9px;margin-bottom:7px;padding:7px;font-size:12px;color:#1F273F;background:linear-gradient(135deg,#C9D8F2 0 25%,#E3EBF8 25% 50%,#C9D8F2 50% 75%,#E3EBF8 75%)}' +
    '#v3d .v3-bt{font:600 1.15em/1.25 inherit;color:#1F273F}#v3d .v3-meta{font-size:.85em;color:#5B6478;margin-top:-8px!important}#v3d .v3-find{list-style:none;margin:0;padding:0}#v3d .v3-find li{padding:11px 0;border-top:1px solid #EEF1F6;display:grid;gap:2px}#v3d .v3-find em{font-style:normal;font-size:.8em;font-weight:600;color:#17704A}#v3d .v3-find .un em{color:#8A5A0B}' +
    '#v3d .v3-end{padding:clamp(28px,5vw,56px) clamp(18px,4vw,48px);display:grid;gap:14px;justify-items:center;text-align:center}#v3d .v3-mark{margin:0;width:56px;height:56px;border-radius:16px;background:#1F273F;color:#fff;display:grid;place-items:center;font:700 28px/1 inherit}#v3d .v3-et{margin:0;font:600 clamp(22px,3.4vw,32px)/1.15 inherit;color:#1F273F;letter-spacing:-.02em}#v3d .v3-s .v3-mark{color:#fff!important;-webkit-text-fill-color:#fff!important;font:700 28px/1 inherit!important}#v3d .v3-s .v3-et{color:#1F273F!important;-webkit-text-fill-color:#1F273F!important;font:600 clamp(22px,3.4vw,32px)/1.15 inherit!important;letter-spacing:-.02em!important}#v3d .v3-s p.v3-big{font:600 clamp(40px,6.4vw,64px)/1 inherit!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important}#v3d .v3-s p.v3-bt{font:600 1.15em/1.25 inherit!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important}#v3d .v3-acts{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:6px}' +
    '#v3d .v3-b{all:unset;box-sizing:border-box;cursor:pointer;min-height:48px;padding:0 24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font:500 16px/1 inherit;border:1.5px solid #1F273F;color:#1F273F;background:#fff}#v3d .v3-b.solid{background:#1F273F;color:#fff}#v3d .v3-b.solid:hover{background:#2C3656}#v3d .v3-b:hover{background:#EEF1F6}' +
    '#v3d .v3-foot{padding:10px 20px calc(18px + env(safe-area-inset-bottom,0px));display:grid;gap:12px;justify-items:center;text-align:center;pointer-events:none}#v3d .v3-caps{position:relative;width:min(92vw,640px);height:clamp(132px,22vh,170px)}#v3d .v3-cap{position:absolute;inset:0;display:grid;align-content:start;gap:6px;opacity:0;transform:translateY(10px);transition:opacity .35s,transform .35s}#v3d .v3-cap.on{opacity:1;transform:none}' +
    '#v3d .v3-cap .k{margin:0!important;font-size:13.5px!important;font-weight:600!important;color:#80AADC!important;-webkit-text-fill-color:#80AADC!important}#v3d .v3-cap h2{margin:0!important;font:600 clamp(22px,3.6vw,34px)/1.1 inherit!important;color:#fff!important;-webkit-text-fill-color:#fff!important;letter-spacing:-.025em!important;max-width:none!important}#v3d .v3-cap p.x{margin:0!important;font-size:clamp(14.5px,1.6vw,17px)!important;line-height:1.45!important;color:#C3D0E8!important;-webkit-text-fill-color:#C3D0E8!important;max-width:none!important}#v3d .v3-n::after,#v3d .v3-n::before,#v3d .v3-logo::after,#v3d .v3-logo::before{content:none!important}#v3d .v3-logo{color:#fff!important;-webkit-text-fill-color:#fff!important}#v3d .v3-s p,#v3d .v3-s li{color:inherit;-webkit-text-fill-color:currentColor;max-width:none}' +
    '#v3d .v3-ctl{display:flex;align-items:center;gap:14px;pointer-events:auto}#v3d .v3-dots{display:flex;gap:7px}#v3d .v3-dots button{all:unset;cursor:pointer;width:8px;height:8px;border-radius:8px;background:rgba(255,255,255,.28);transition:width .25s,background .25s}#v3d .v3-dots button[aria-current=step]{width:26px;background:#fff}' +
    '#v3d .v3-nx{all:unset;box-sizing:border-box;cursor:pointer;min-height:42px;padding:0 20px;border-radius:999px;background:#fff;color:#1F273F;font:500 15px/1 inherit;display:inline-flex;align-items:center;gap:8px}#v3d .v3-nx:hover{background:#E3EBF8}#v3d .v3-nx svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#v3d .v3-pv{all:unset;box-sizing:border-box;cursor:pointer;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.1);color:#fff}#v3d .v3-pv[disabled]{opacity:.35;cursor:default}#v3d .v3-pv svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '@media (max-width:600px){#v3d .v3-s{width:88vw;border-radius:16px}#v3d .v3-world{perspective:900px}#v3d .v3-caps{height:clamp(150px,26vh,190px)}}' +
    '@media (prefers-reduced-motion:reduce){#v3d .v3-cap{transition:none}#v3d .v3-think span{animation:none;opacity:.7}}' +
    '#v3d .v3-form{padding:clamp(16px,2.4vw,26px);display:grid;gap:12px}#v3d .v3-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}#v3d .v3-form label{display:grid;gap:6px;min-width:0}#v3d .v3-form label>span{font:600 13px/1.2 inherit;color:#1F273F}#v3d .v3-form label small{font-weight:400;color:#5B6478}' +
    '#v3d .v3-form input,#v3d .v3-form select,#v3d .v3-form textarea{all:unset;box-sizing:border-box;width:100%;min-height:44px;padding:10px 14px;border-radius:12px;background:#fff;border:1px solid #DFDFDF;color:#1F273F;font:400 16px/1.35 inherit;-webkit-text-fill-color:#1F273F;transition:border-color .15s,box-shadow .15s}#v3d .v3-form textarea{min-height:76px;white-space:pre-wrap;overflow:auto}#v3d .v3-form select{background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 12 12%27%3E%3Cpath d=%27M3 4.5l3 3 3-3%27 fill=%27none%27 stroke=%27%235B6478%27 stroke-width=%271.5%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") right 12px center/12px no-repeat;padding-right:34px;cursor:pointer}#v3d .v3-form ::placeholder{color:#8A93A5;-webkit-text-fill-color:#8A93A5}' +
    '#v3d .v3-form input:focus,#v3d .v3-form select:focus,#v3d .v3-form textarea:focus{border-color:#3A5292;box-shadow:0 0 0 3px #E3EBF8}#v3d .v3-form .bad{border-color:#B3261E;box-shadow:0 0 0 3px #FBE9E7}' +
    '#v3d .v3-send{width:100%;margin-top:2px;box-shadow:0 10px 20px -10px rgba(31,39,63,.6)}#v3d .v3-send[disabled]{opacity:.7;cursor:default}#v3d .v3-st{padding:11px 13px;border-radius:12px;background:#E3EBF8;color:#1F273F;font-size:14px;line-height:1.45}#v3d .v3-st[hidden]{display:none}#v3d .v3-st p{margin:0 0 4px}#v3d .v3-st a{color:#3A5292;font-weight:600}' +
    '#v3d .v3-fine{margin:0!important;font-size:12.5px!important;line-height:1.45!important;color:#5B6478!important;-webkit-text-fill-color:#5B6478!important}#v3d .v3-lk{all:unset;cursor:pointer;color:#3A5292;font-weight:600;text-decoration:underline;text-underline-offset:2px}' +
    '#v3d .v3-skip{all:unset;box-sizing:border-box;cursor:pointer;min-height:36px;padding:0 16px;border-radius:999px;background:rgba(255,255,255,.1);color:#fff;font:500 14px/1 inherit;display:inline-flex;align-items:center}#v3d .v3-skip:hover{background:rgba(255,255,255,.18)}#v3d .v3-skip[hidden]{display:none}#v3d .v3-n{margin-left:0}#v3d .v3-bar .v3-sp{margin-left:auto}' +
    '@media (max-width:600px){#v3d .v3-row{grid-template-columns:1fr;gap:10px}#v3d .v3-form{gap:10px}#v3d.v3-last .v3-caps{display:none}#v3d .v3-n{display:none}}' +
    'html.v3d-lock,html.v3d-lock body{overflow:hidden!important}';
  function build() {
    if (root) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement("div"); root.id = "v3d"; root.hidden = true; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Verisavo 3D tour");
    root.innerHTML = '<canvas aria-hidden="true"></canvas><div class="v3-scroll" tabindex="-1">' + SC.map(function () { return "<div></div>"; }).join("") + '</div>' +
      '<div class="v3-stage"><div class="v3-bar"><span class="v3-logo">Verisavo</span><span class="v3-sp"></span><button type="button" class="v3-skip">Skip to the form</button><span class="v3-n" aria-live="polite"></span><button type="button" class="v3-x" aria-label="Close the tour"><svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>' +
      '<div class="v3-world">' + SC.map(function (s, i) { return '<div class="v3-s" data-i="' + i + '"' + (s.end ? "" : ' aria-hidden="true"') + ">" + s.s + "</div>"; }).join("") + "</div>" +
      '<div class="v3-foot"><div class="v3-caps">' + SC.map(function (s) { return '<div class="v3-cap"><p class="k">' + s.k + "</p><h2>" + s.h + '</h2><p class="x">' + s.x + "</p></div>"; }).join("") + "</div>" +
      '<div class="v3-ctl"><button type="button" class="v3-pv" aria-label="Previous"><svg viewBox="0 0 16 16"><path d="M10 3L5 8l5 5"/></svg></button><div class="v3-dots">' + SC.map(function (s, i) { return '<button type="button" aria-label="Go to: ' + s.k + '" data-d="' + i + '"></button>'; }).join("") + '</div><button type="button" class="v3-nx"><span>Next</span><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg></button></div></div></div>';
    document.body.appendChild(root);
    scroller = root.querySelector(".v3-scroll"); world = root.querySelector(".v3-world"); cv = root.querySelector("canvas"); ctx = cv.getContext("2d");
    screens = [].slice.call(root.querySelectorAll(".v3-s")); caps = [].slice.call(root.querySelectorAll(".v3-cap")); dots = [].slice.call(root.querySelectorAll(".v3-dots button"));
    reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    for (var i = 0; i < 150; i++) pts.push({ x: (Math.random() * 2 - 1) * 1.6, y: (Math.random() * 2 - 1) * 1.1, z: Math.random(), r: Math.random() < .12 ? 1.9 : 1, c: Math.random() < .3 ? "128,170,220" : "255,255,255" });
    root.querySelector(".v3-x").addEventListener("click", close);
    root.querySelector(".v3-skip").addEventListener("click", function () { go(N - 1); setTimeout(function () { var n = root.querySelector('.v3-form [name="name"]'); if (n) n.focus({ preventScroll: true }); }, reduce ? 50 : 700); });
    wireForm();
    root.querySelector(".v3-nx").addEventListener("click", function () { var k = Math.round(p); if (k >= N - 1) go(0); else go(k + 1); });
    root.querySelector(".v3-pv").addEventListener("click", function () { go(Math.round(p) - 1); });
    dots.forEach(function (d) { d.addEventListener("click", function () { go(+d.getAttribute("data-d")); }); });
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-v3]"); if (!b) return;
      if (b.getAttribute("data-v3") === "tour") { var url = (window.__next_f || window.next) ? "/platform?tour=1" : "assistant.html?tour=1"; close(); location.href = url; }
    });
    scroller.addEventListener("scroll", function () { p = stepH ? Math.max(0, Math.min(N - 1, scroller.scrollTop / stepH)) : 0; }, { passive: true });
    root.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; px = e.clientX / W * 2 - 1; py = e.clientY / H * 2 - 1; });
    window.addEventListener("resize", function () { if (isOpen) size(); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key !== "Escape" && e.key !== "Tab" && e.target.closest && e.target.closest("input,select,textarea")) return;
      if (e.key === "Escape") { e.preventDefault(); return close(); }
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.target.closest("button"))) { e.preventDefault(); go(Math.round(p) + 1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(Math.round(p) - 1); }
      if (e.key === "Tab") { var f = [].slice.call(root.querySelectorAll("button,input,select,textarea")).filter(function (b) { return b.getClientRects().length && !b.disabled && getComputedStyle(b).pointerEvents !== "none" && !(b.closest(".v3-s") && b.closest(".v3-s").style.pointerEvents === "none"); }); if (!f.length) return; var a = document.activeElement, first = f[0], last = f[f.length - 1]; if (e.shiftKey && (a === first || !root.contains(a))) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && (a === last || !root.contains(a))) { e.preventDefault(); first.focus(); } }
    });
  }
  function size() {
    W = root.clientWidth; H = root.clientHeight; stepH = Math.round(H * .9);
    [].forEach.call(scroller.children, function (d, i) { d.style.height = (i === N - 1 ? H : stepH) + "px"; });
    var dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scroller.scrollTop = Math.round(p) * stepH;
  }
  function go(k) { k = Math.max(0, Math.min(N - 1, k)); try { scroller.scrollTo({ top: k * stepH, behavior: reduce ? "auto" : "smooth" }); } catch (e) { scroller.scrollTop = k * stepH; } }
  var shown = -1;
  function frame() {
    if (!isOpen) return;
    var small = W < 600, v = p - lastP; lastP = p;
    /* the field of signals: drifts slowly, and rushes past as you move between scenes */
    ctx.clearRect(0, 0, W, H);
    var sp = reduce ? 0 : .0009 + Math.min(.05, Math.abs(v) * .5), f = Math.min(W, H) * .9;
    for (var i = 0; i < pts.length; i++) {
      var q = pts[i]; q.z -= sp * (v < 0 ? -1 : 1); if (q.z <= .02) q.z += 1; if (q.z > 1.02) q.z -= 1;
      var sx = W / 2 + (q.x - px * .04) / q.z * f * .5, sy = H * .42 + (q.y - py * .04) / q.z * f * .5; if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      var a = Math.min(1, (1 - q.z) * 1.4) * .75, rad = q.r * (1.6 - q.z) * (small ? .9 : 1.15), tail = Math.min(26, Math.abs(v) * 900 * (1 - q.z));
      ctx.fillStyle = "rgba(" + q.c + "," + a.toFixed(3) + ")";
      if (tail > 2) { ctx.fillRect(sx - rad / 2, sy - tail / 2, rad, tail); } else { ctx.beginPath(); ctx.arc(sx, sy, rad, 0, 6.2832); ctx.fill(); }
    }
    var wh = world.clientHeight;
    for (var k = 0; k < N; k++) {
      var s = screens[k], d = k - p, ad = Math.abs(d), near = ad < .5;
      if (ad > 2.2) { if (s.style.visibility !== "hidden") s.style.visibility = "hidden"; continue; }
      var x = d * (small ? 70 : 58), z = -ad * (small ? 420 : 560), ry = Math.max(-1.4, Math.min(1.4, d)) * -34, rx = 0, sc = Math.min(1, (wh - 8) / Math.max(1, s.offsetHeight));
      if (reduce) { x = d * 110; z = 0; ry = 0; }
      else if (near) { ry += px * 5 * (1 - ad * 2); rx = -py * 4 * (1 - ad * 2); }
      s.style.visibility = "visible";
      s.style.transform = "translate(-50%,-50%) translate3d(" + x.toFixed(2) + "%,0," + z.toFixed(1) + "px) rotateY(" + ry.toFixed(2) + "deg) rotateX(" + rx.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
      s.style.opacity = Math.max(0, 1 - Math.max(0, ad - .55) / 1.3).toFixed(3);
      s.style.zIndex = String(100 - Math.round(ad * 10));
      s.style.pointerEvents = near && SC[k].end ? "auto" : "none";
      s.style.setProperty("--sh", near ? (.5 - px * .25).toFixed(2) : "0");
    }
    var cur = Math.round(p);
    if (cur !== shown) {
      shown = cur;
      caps.forEach(function (c, i) { c.classList.toggle("on", i === cur); });
      dots.forEach(function (d, i) { if (i === cur) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
      root.querySelector(".v3-n").textContent = (cur + 1) + " of " + N;
      root.querySelector(".v3-nx span").textContent = cur >= N - 1 ? "Start again" : "Next";
      root.querySelector(".v3-pv").disabled = cur === 0;
      screens.forEach(function (s, i) { [].forEach.call(s.querySelectorAll("button,input,select,textarea"), function (b) { b.tabIndex = i === cur ? 0 : -1; }); });
      root.classList.toggle("v3-last", cur >= N - 1); root.querySelector(".v3-skip").hidden = cur >= N - 1;
    }
    raf = requestAnimationFrame(frame);
  }
  function open(msg) {
    build(); if (isOpen) return; opener = document.activeElement; isOpen = true; root.hidden = false; document.documentElement.classList.add("v3d-lock");
    var tm = root.querySelector('.v3-form [name="msg"]'); if (tm && typeof msg === "string" && msg && !tm.value) tm.value = msg;
    p = 0; lastP = 0; shown = -1; size(); scroller.scrollTop = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    setTimeout(function () { var n = root.querySelector(".v3-nx"); if (n) n.focus({ preventScroll: true }); }, 60);
  }
  function close() { if (!isOpen) return; isOpen = false; cancelAnimationFrame(raf); root.hidden = true; document.documentElement.classList.remove("v3d-lock"); if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (e) {} } }
  window.vs3dTour = open;
  /* the demo form at the end of the tour: it hands the details to the site's own demo form, so sending works exactly as on the demo page */
  function wireForm() {
    var fm = root.querySelector(".v3-form"), st = fm.querySelector(".v3-st"), F = function (n) { return fm.querySelector('[name="' + n + '"]'); };
    var dc = document.getElementById("df-country"); if (dc) F("country").innerHTML = dc.innerHTML;
    var df = document.getElementById("df-fine"); if (df) { var t = df.textContent.replace(/\s*See our Privacy Policy\.?\s*$/, "").trim(); if (t) fm.querySelector(".v3-ft").textContent = t; }
    fm.addEventListener("input", function (e) { e.target.classList.remove("bad"); }); fm.addEventListener("change", function (e) { e.target.classList.remove("bad"); });
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      var real = document.getElementById("dform"), ds = document.getElementById("df-status"), keys = ["name", "email", "org", "country", "tel", "msg"];
      if (!real || !ds) { close(); var g = document.querySelector('[data-page="demo"]'); if (g) { g.__v3skip = 1; g.click(); } return; }
      keys.forEach(function (k) { var r = document.getElementById("df-" + k); if (r) { r.value = F(k).value; r.classList.remove("bad"); } });
      var rc = document.getElementById("df-country"); if (rc) rc.dispatchEvent(new Event("change", { bubbles: true }));
      if (!fm.__mo) { fm.__mo = new MutationObserver(function () { st.hidden = ds.hidden; st.innerHTML = ds.innerHTML; if (/^Thanks/.test(ds.textContent)) fm.reset(); var b = document.getElementById("df-send"), sb = fm.querySelector(".v3-send"); if (b) { sb.disabled = b.disabled; sb.textContent = b.textContent; } }); fm.__mo.observe(ds, { childList: true, characterData: true, subtree: true, attributes: true }); var sb0 = document.getElementById("df-send"); if (sb0) fm.__mo.observe(sb0, { childList: true, characterData: true, subtree: true, attributes: true }); }
      real.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      var bad = keys.filter(function (k) { var r = document.getElementById("df-" + k); return r && r.classList.contains("bad"); });
      bad.forEach(function (k) { F(k).classList.add("bad"); });
      st.hidden = ds.hidden; st.innerHTML = ds.innerHTML;
      if (bad.length) F(bad[0]).focus({ preventScroll: true });
    });
  }
  /* every Request a demo button opens the tour first; the form is its last screen */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest('[data-page="demo"], [data-sample]'); if (!b || b.__v3skip) { if (b) b.__v3skip = 0; return; }
    if (b.closest("#v3d") || b.closest("#pg-demo")) return;
    if (b.hasAttribute("data-sample") && !/request a demo/i.test(b.textContent)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var menu = document.getElementById("menu"), mb = document.getElementById("menu-btn"); if (menu && mb && menu.classList.contains("open")) mb.click();
    var msg = b.getAttribute("data-demo-msg") || ""; try { if (!msg) { msg = sessionStorage.getItem("verisavo-demo-q") || ""; sessionStorage.removeItem("verisavo-demo-q"); } } catch (er) {}
    open(msg);
  }, true);
  if (location.hash === "#tour-3d") setTimeout(open, 400);
})();
/* <<< 3d tour */
/* >>> scattered pieces 3d: the six puzzle pieces drawn sharp, set at different depths over a light grid, and leaning with the pointer */
(function () {
  var sec = document.getElementById("why"), ul = sec && sec.querySelector(".why-src"); if (!sec || !ul || sec.classList.contains("why-3d")) return;
  var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p)";
  var css = document.createElement("style");
  css.textContent =
    "html body #ln #why.why-3d" + N + "{position:relative!important;overflow:hidden!important;background:radial-gradient(70% 60% at 50% 68%,#EEF3FB 0%,#F9FAFE 46%,#fff 86%)!important;border:1px solid #E6ECF5!important}" +
    "#why.why-3d .pz3-grid,#why.why-3d .pz3-grid::before,#why.why-3d .pz3-grid::after{position:absolute;inset:0;pointer-events:none}#why.why-3d .pz3-grid{z-index:0}" +
    "#why.why-3d .pz3-grid::before{content:'';background-image:linear-gradient(#DCE5F3 1px,transparent 1px),linear-gradient(90deg,#DCE5F3 1px,transparent 1px);background-size:64px 64px;background-position:center;-webkit-mask-image:radial-gradient(70% 62% at 50% 68%,#000 0%,rgba(0,0,0,.5) 48%,transparent 84%);mask-image:radial-gradient(70% 62% at 50% 68%,#000 0%,rgba(0,0,0,.5) 48%,transparent 84%)}" +
    "#why.why-3d .pz3-grid::after{content:'';background-image:linear-gradient(#9DB9E3 1px,transparent 1px),linear-gradient(90deg,#9DB9E3 1px,transparent 1px);background-size:64px 64px;background-position:center;-webkit-mask-image:radial-gradient(30% 26% at 50% 70%,#000 0%,transparent 100%);mask-image:radial-gradient(30% 26% at 50% 70%,#000 0%,transparent 100%)}" +
    "#why.why-3d canvas.pz3-dots{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0}" +
    "html body #ln #why.why-3d .why-in" + N + "{position:relative!important;z-index:1!important}" +
    "html body #ln #why.why-3d .why-src" + N + "{perspective:1400px;perspective-origin:50% 40%;transform-style:preserve-3d;transition:transform .3s ease-out}" +
    "html body #ln #why.why-3d .why-src li" + N + "{position:relative!important;aspect-ratio:202/140;animation:none!important;transform:translate3d(var(--ix,0px),calc(var(--y,0px) + var(--iy,0px)),var(--z,0px)) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) rotateZ(calc(var(--r,0deg) + var(--ir,0deg)))!important;transform-style:preserve-3d;transition:transform 1.25s cubic-bezier(.2,.8,.2,1),opacity .5s ease;transition-delay:var(--d,0s);cursor:default}" +
    /* the pieces fly in from every side and settle, as they did before */
    "html body #ln #why.why-3d .why-src li:nth-child(1)" + N + "{--fx:-300px;--fy:-220px;--fr:-24deg;--d:0s}html body #ln #why.why-3d .why-src li:nth-child(2)" + N + "{--fx:0px;--fy:-300px;--fr:14deg;--d:.12s}html body #ln #why.why-3d .why-src li:nth-child(3)" + N + "{--fx:300px;--fy:-220px;--fr:22deg;--d:.24s}html body #ln #why.why-3d .why-src li:nth-child(4)" + N + "{--fx:-340px;--fy:0px;--fr:-20deg;--d:.36s}html body #ln #why.why-3d .why-src li:nth-child(5)" + N + "{--fx:0px;--fy:-320px;--fr:-16deg;--d:.48s}html body #ln #why.why-3d .why-src li:nth-child(6)" + N + "{--fx:340px;--fy:0px;--fr:18deg;--d:.6s}" +
    "html body #ln #why.why-3d .why-src.pz-wait li" + N + "{--ix:var(--fx);--iy:var(--fy);--ir:var(--fr);opacity:0!important;transition:none}" +
    "html body #ln #why.why-3d .why-src.pz-go li" + N + "{opacity:1!important}" +
    "html body #ln #why.why-3d .why-src.pz3-done li" + N + "{transition:transform .6s cubic-bezier(.2,.7,.2,1);transition-delay:0s}" +
    "html body #ln #why.why-3d .why-src li:nth-child(1)" + N + "{--y:-8px;--z:60px;--r:-5deg;--rx:10deg;--ry:14deg}" +
    "html body #ln #why.why-3d .why-src li:nth-child(2)" + N + "{--y:18px;--z:-70px;--r:4deg;--rx:12deg;--ry:-4deg}" +
    "html body #ln #why.why-3d .why-src li:nth-child(3)" + N + "{--y:-12px;--z:30px;--r:-2deg;--rx:8deg;--ry:-16deg}" +
    "html body #ln #why.why-3d .why-src li:nth-child(4)" + N + "{--y:10px;--z:-30px;--r:6deg;--rx:-6deg;--ry:12deg}" +
    "html body #ln #why.why-3d .why-src li:nth-child(5)" + N + "{--y:-14px;--z:90px;--r:-4deg;--rx:-8deg;--ry:3deg}" +
    "html body #ln #why.why-3d .why-src li:nth-child(6)" + N + "{--y:8px;--z:-50px;--r:3deg;--rx:-6deg;--ry:-14deg}" +
    "html body #ln #why.why-3d .why-src li:hover" + N + "{transform:translate3d(0,calc(var(--y,0px) - 8px),calc(var(--z,0px) + 70px)) rotateX(0deg) rotateY(0deg) rotateZ(0deg)!important}" +
    /* each piece is drawn at twice its size and scaled down, so the edges and the lettering stay sharp when it tilts */
    "#why.why-3d .pz3{position:absolute;left:0;top:0;width:200%;height:200%;transform:scale(.5);transform-origin:0 0;animation:pz3-bob 7s ease-in-out infinite;animation-delay:var(--bd,0s)}" +
    "#why.why-3d .why-src li:nth-child(2) .pz3{--bd:-2s;animation-duration:8.5s}#why.why-3d .why-src li:nth-child(3) .pz3{--bd:-4s;animation-duration:6.5s}#why.why-3d .why-src li:nth-child(4) .pz3{--bd:-1s;animation-duration:9s}#why.why-3d .why-src li:nth-child(5) .pz3{--bd:-3s;animation-duration:7.6s}#why.why-3d .why-src li:nth-child(6) .pz3{--bd:-5s;animation-duration:8s}" +
    "@keyframes pz3-bob{0%,100%{transform:scale(.5) translateY(0)}50%{transform:scale(.5) translateY(-12px)}}" +
    "html body #ln #why.why-3d .why-pz" + N + "{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;overflow:visible!important;filter:drop-shadow(0 3px 3px rgba(31,39,63,.10)) drop-shadow(0 34px 40px rgba(31,39,63,.20))!important}" +
    "html body #ln #why.why-3d .why-pz path.pz2-edge" + N + "{fill:#C9D8F2!important;stroke:none!important}" +
    "html body #ln #why.why-3d .why-pz path.pz2-face" + N + "{stroke:#B9CBEA!important;stroke-width:1!important;stroke-opacity:1!important}" +
    "html body #ln #why.why-3d .why-pz path.pz2-seam" + N + "{stroke:#D5DFF0!important;stroke-width:.7!important;opacity:.7!important}" +
    "html body #ln #why.why-3d .why-src li span" + N + "{position:absolute!important;inset:0 11.2% 0 0!important;padding:0 0 0 9%!important;display:grid!important;place-items:center!important;text-align:center!important;font:600 24px/1.2 'Red Hat Text',Inter,sans-serif!important;letter-spacing:-.005em!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important;text-shadow:none!important;white-space:nowrap!important;text-rendering:geometricPrecision}" +
    "@media (max-width:40rem){html body #ln #why.why-3d .why-src" + N + "{perspective:900px}html body #ln #why.why-3d .why-src li" + N + "{width:clamp(96px,28.2vw,120px)!important}html body #ln #why.why-3d .why-src li span" + N + "{font-size:18px!important}html body #ln #why.why-3d .why-src li:nth-child(odd)" + N + "{--fx:-220px}html body #ln #why.why-3d .why-src li:nth-child(even)" + N + "{--fx:220px}}" +
    "@media (prefers-reduced-motion:reduce){#why.why-3d .pz3{animation:none}html body #ln #why.why-3d .why-src li" + N + "{transition:none}}";
  document.head.appendChild(css);
  sec.classList.add("why-3d");
  /* a second gradient for the faces, a touch brighter with a blue foot */
  [].forEach.call(ul.children, function (li) {
    var w = document.createElement("div"); w.className = "pz3";
    while (li.firstChild) w.appendChild(li.firstChild);
    li.appendChild(w);
  });
  /* once the pieces have landed, hovering responds straight away */
  (function settle() { if (ul.classList.contains("pz-go") || !ul.classList.contains("pz-wait")) setTimeout(function () { ul.classList.add("pz3-done"); }, 2200); else setTimeout(settle, 300); })();
  var stops = sec.querySelectorAll("#pzg stop"); if (stops.length === 2) { stops[0].setAttribute("stop-color", "#FFFFFF"); stops[1].setAttribute("stop-color", "#EDF2FA"); }
  var g = document.createElement("div"); g.className = "pz3-grid"; g.setAttribute("aria-hidden", "true");
  var cv = document.createElement("canvas"); cv.className = "pz3-dots"; cv.setAttribute("aria-hidden", "true");
  sec.insertBefore(cv, sec.firstChild); sec.insertBefore(g, sec.firstChild);
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches), px = 0, py = 0;
  if (!reduce) {
    sec.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; var r = sec.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 2 - 1; py = (e.clientY - r.top) / r.height * 2 - 1; ul.style.transform = "rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 5).toFixed(2) + "deg)"; });
    sec.addEventListener("pointerleave", function () { px = 0; py = 0; ul.style.transform = "rotateY(0deg) rotateX(0deg)"; });
  }
  var ctx = cv.getContext("2d"), W = 0, H = 0, pts = [], n, seen = false;
  for (n = 0; n < 70; n++) pts.push({ x: (Math.random() * 2 - 1) * 1.6, y: (Math.random() * 2 - 1) * 1.1, z: Math.random(), r: Math.random() < .12 ? 1.9 : 1, c: Math.random() < .4 ? "58,82,146" : "128,170,220" });
  function size() { W = sec.clientWidth; H = sec.clientHeight; var d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0); }
  function draw() {
    if (seen && W) {
      ctx.clearRect(0, 0, W, H); var f = Math.min(W, H) * .9;
      for (var k = 0; k < pts.length; k++) {
        var q = pts[k]; if (!reduce) { q.z -= .0007; if (q.z <= .02) q.z += 1; }
        var sx = W / 2 + (q.x - px * .05) / q.z * f * .5, sy = H * .6 + (q.y - py * .05) / q.z * f * .5; if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
        ctx.fillStyle = "rgba(" + q.c + "," + (Math.min(1, (1 - q.z) * 1.4) * .7).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(sx, sy, q.r * (2.2 - q.z * 1.4), 0, 6.2832); ctx.fill();
      }
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; if (seen) { size(); if (reduce) draw(); } }, { rootMargin: "120px" }).observe(sec); else seen = true;
  size(); draw(); window.addEventListener("resize", function () { size(); if (reduce) draw(); }); setTimeout(size, 800);
})();
/* <<< scattered pieces 3d */
/* >>> ask a question hd: the first workflow step drawn sharper, with a white input and chart card, gridlines, a soft fill under this year's line, the levy marked, and the fall labelled */
(function () {
  var sc = document.querySelector('#workflow .wf-sc[data-s="0"]'), ch = sc && sc.querySelector(".wfc-chart"), svg = ch && ch.querySelector(".wfc-plot svg");
  if (!svg || sc.classList.contains("wq")) return; sc.classList.add("wq");
  var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p)", P = "html body #ln .wf-sc.wq ";
  var css = document.createElement("style");
  css.textContent =
    P + ".wfc" + N + "{-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}" +
    P + ".wfc-in" + N + "{min-height:54px!important;padding:7px 7px 7px 20px!important;background:#fff!important;border:1px solid #DFDFDF!important;box-shadow:0 1px 2px rgba(31,39,63,.04),0 10px 28px -14px rgba(58,82,146,.28)!important}" +
    P + ".wfc-send" + N + "{width:40px!important;height:40px!important;background:linear-gradient(180deg,#2A3558,#1F273F)!important;box-shadow:0 1px 0 rgba(255,255,255,.18) inset,0 6px 14px -6px rgba(31,39,63,.55)!important}" +
    P + ".wfc-send svg" + N + "{width:17px!important;height:17px!important;stroke-width:1.9!important}" +
    P + ".wfc-chart" + N + "{background:#fff!important;border:0 solid #DFDFDF!important;border-radius:16px!important}" +
    P + ".wfc.s3 .wfc-chart" + N + "{max-height:340px!important;padding:16px 18px 12px!important;border-width:1px!important;box-shadow:0 1px 2px rgba(31,39,63,.04),0 18px 40px -22px rgba(58,82,146,.3)!important}" +
    P + ".wfc-leg" + N + "{flex-wrap:wrap!important;align-items:center!important;row-gap:4px!important;margin-bottom:10px!important;font-size:.75rem!important}" +
    P + ".wq-t" + N + "{margin-right:auto;font-weight:600;font-size:.8125rem;color:#1F273F}" +
    P + ".wfc-leg i" + N + "{width:16px!important;height:3px!important}" +
    P + ".wfc-leg span + span i" + N + "{background:#80AADC!important}" +
    P + ".wq-pl" + N + "{position:relative;min-width:0}" +
    P + ".wfc-plot svg" + N + "{height:132px!important;shape-rendering:geometricPrecision}" +
    P + ".wq-g" + N + "{fill:none;stroke:#EEF1F6;stroke-width:1;vector-effect:non-scaling-stroke}" +
    P + ".wfc-base" + N + "{stroke:#DFDFDF!important;stroke-dasharray:none!important}" +
    P + ".wfc-l1" + N + "{stroke-width:2.6!important;stroke-linejoin:round}" + P + ".wfc-l2" + N + "{stroke:#80AADC!important;stroke-width:2.2!important}" +
    P + ".wq-ar" + N + "{stroke:none;clip-path:inset(0 100% 0 0)}" +
    P + ".wfc.s3 .wq-ar" + N + "{clip-path:inset(0 0 0 0);transition:clip-path 1.5s cubic-bezier(.4,0,.2,1) .5s}" +
    P + ".wq-o" + N + "{position:absolute;opacity:0;transition:opacity .45s ease,transform .45s cubic-bezier(.2,.8,.2,1);pointer-events:none}" +
    P + ".wq-mk" + N + "{left:59.46%;top:0;bottom:2.3%;width:0;border-left:1px dashed #9DB9E3}" +
    P + ".wq-mk b" + N + "{position:absolute;left:0;top:0;transform:translateX(-50%);padding:2px 8px;border-radius:999px;background:#E3EBF8;color:#3A5292;font:600 .6875rem/1.4 'Red Hat Text',sans-serif;white-space:nowrap}" +
    P + ".wq-d" + N + "{left:97.3%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff;border:2.5px solid #3A5292;box-sizing:border-box;transform:scale(.4)}" +
    P + ".wq-d1" + N + "{top:86.05%}" + P + ".wq-d2" + N + "{top:36.05%;border-color:#80AADC}" +
    P + ".wq-tag" + N + "{left:97.3%;top:86.05%;margin:-34px 0 0 0;transform:translate(-100%,4px);padding:3px 9px;border-radius:8px;background:#1F273F;color:#fff;font:600 .75rem/1.35 'Red Hat Text',sans-serif;white-space:nowrap;box-shadow:0 8px 16px -8px rgba(31,39,63,.5)}" +
    P + ".wfc.s3 .wq-o" + N + "{opacity:1;transition-delay:1.1s}" +
    P + ".wfc.s3 .wq-d" + N + "{transform:none;transition-delay:1.9s}" + P + ".wfc.s3 .wq-tag" + N + "{transform:translate(-100%,0);transition-delay:2.1s}" +
    P + ".wfc-x" + N + "{margin-top:8px!important;font-size:.75rem!important}" + P + ".wfc-y" + N + "{font-size:.6875rem!important}" +
    "@media (max-width:40rem){" + P + ".wfc-in" + N + "{min-height:46px!important;padding-left:16px!important}" + P + ".wfc-send" + N + "{width:34px!important;height:34px!important}" + P + ".wfc-plot svg" + N + "{height:100px!important}" + P + ".wfc.s3 .wfc-chart" + N + "{padding:14px 14px 10px!important}" + P + ".wq-tag" + N + "{margin-top:-41px;padding:2px 8px;font-size:.6875rem}" + P + ".wq-t" + N + "{flex-basis:100%}" + P + ".wfc-leg" + N + "{justify-content:flex-start!important}" + P + ".wq-mk b" + N + "{font-size:.625rem}}" +
    "@media (prefers-reduced-motion:reduce){" + P + ".wq-o" + N + "," + P + ".wq-ar" + N + "{transition:none!important;opacity:1!important;transform:none!important;clip-path:none!important}" + P + ".wq-tag" + N + "{transform:translate(-100%,0)!important}}";
  document.head.appendChild(css);
  var NS = "http://www.w3.org/2000/svg", l1 = svg.querySelector(".wfc-l1"), base = svg.querySelector(".wfc-base");
  var mk = function (tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; };
  var defs = mk("defs", {}), lg = mk("linearGradient", { id: "wq-fill", x1: "0", y1: "0", x2: "0", y2: "1" });
  lg.appendChild(mk("stop", { offset: "0", "stop-color": "#3A5292", "stop-opacity": ".2" })); lg.appendChild(mk("stop", { offset: "1", "stop-color": "#3A5292", "stop-opacity": "0" }));
  defs.appendChild(lg); svg.insertBefore(defs, svg.firstChild);
  [12, 36, 60].forEach(function (y) { svg.insertBefore(mk("path", { "class": "wq-g", d: "M0 " + y + "H296" }), base); });
  if (l1) svg.insertBefore(mk("path", { "class": "wq-ar", fill: "url(#wq-fill)", d: l1.getAttribute("d") + "L288 84L8 84Z" }), l1);
  var pl = document.createElement("div"); pl.className = "wq-pl"; svg.parentNode.insertBefore(pl, svg); pl.appendChild(svg);
  pl.insertAdjacentHTML("beforeend", '<span class="wq-o wq-mk"><b>Import levy</b></span><span class="wq-o wq-d wq-d2"></span><span class="wq-o wq-d wq-d1"></span><span class="wq-o wq-tag">Down 18%</span>');
  var leg = ch.querySelector(".wfc-leg"); if (leg) leg.insertAdjacentHTML("afterbegin", '<b class="wq-t">Cooking oil sales, Accra</b>');
})();
/* <<< ask a question hd */
/* >>> workflow steps hd: steps two to five drawn in the same sharp style as the first (white cards, fine borders, soft blue shadows, navy buttons), with source icons, ticks, fuller bars and a ring for the shopper check */
(function () {
  var wf = document.getElementById("workflow"), main = wf && wf.querySelector(".wf-main"); if (!main || main.classList.contains("wq2")) return; main.classList.add("wq2");
  var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p)", P = "html body #ln .wf-main.wq2 ";
  var SH = "0 1px 2px rgba(31,39,63,.04),0 14px 32px -20px rgba(58,82,146,.32)";
  var TICK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.4 6.3l2.4 2.4 4.8-5.2' fill='none' stroke='%233A5292' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
  var css = document.createElement("style");
  css.textContent =
    P + ".wf-sc" + N + "{-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}" +
    P + ".wf-pill" + N + "{background:#E3EBF8!important;color:#3A5292!important;font-weight:600!important;border:0!important}" +
    P + ".wf-btn" + N + "{background:linear-gradient(180deg,#2A3558,#1F273F)!important;color:#fff!important;border:0!important;box-shadow:0 1px 0 rgba(255,255,255,.16) inset,0 10px 20px -10px rgba(31,39,63,.6)!important}" +
    P + ".wf-card" + N + "," + P + ".wf-bars > div" + N + "," + P + ".wf-res" + N + "{background:#fff!important;border:1px solid #DFDFDF!important;border-radius:14px!important;box-shadow:" + SH + "!important}" +
    /* evidence rows */
    P + ".wf-table .wf-tr" + N + "{border:1px solid #DFDFDF!important;border-radius:14px!important;box-shadow:" + SH + "!important}" +
    P + ".wf-tr > span:first-child" + N + "{display:flex;align-items:center;gap:12px;font-weight:500}" +
    P + ".wq-ic" + N + "{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#E3EBF8}" +
    P + ".wq-ic svg" + N + "{width:17px;height:17px;fill:none;stroke:#3A5292;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}" +
    P + ".wf-st" + N + "{display:inline-flex!important;align-items:center;gap:5px;background:#E3EBF8!important;color:#3A5292!important;font-weight:600!important;border:0!important}" +
    P + ".wf-st" + N + "::before{content:'';width:11px;height:11px;background:" + TICK + " center/contain no-repeat}" +
    /* what we know */
    P + ".wf-fl li" + N + "{padding:12px 0!important;margin:0!important;align-items:center!important}" + P + ".wf-fl li + li" + N + "{border-top:1px solid #EEF1F6!important}" +
    P + ".wf-tag" + N + "{background:#E3EBF8!important;color:#3A5292!important;font-weight:600!important;border:0!important}" + P + ".wf-tag-i" + N + "{background:#EEF1F6!important;color:#5B6478!important}" +
    P + ".wf-mu" + N + "{border:1px dashed #9DB9E3!important}" +
    P + ".wf-seg" + N + "{background:#EEF1F6!important}" + P + ".wf-seg .on" + N + "{background:#fff!important;box-shadow:0 1px 2px rgba(31,39,63,.08),0 4px 10px -6px rgba(58,82,146,.4)!important}" +
    P + ".wf-gopt" + N + "{background:#F9FAFE!important;border:1px solid #9DB9E3!important;border-radius:12px!important}" +
    P + ".wf-unk" + N + "{background:#fff!important;border:1px solid #DFDFDF!important;color:#1F273F!important}" +
    P + '.wf-sc[data-s="2"] .wf-cols' + N + "{align-items:start!important}" +
    /* shopper check */
    P + ".wf-bars > div > span" + N + "{font-weight:500}" + P + ".wf-n" + N + "{font-weight:700!important;color:#1F273F!important}" +
    P + ".wf-bar-f" + N + "{height:8px!important;border-radius:999px!important;background:#EEF1F6!important;overflow:hidden}" +
    P + ".wf-bar-f" + N + "::after{height:100%!important;border-radius:999px!important;background:linear-gradient(90deg,#3A5292,#80AADC)!important}" +
    P + ".wf-res" + N + "{display:grid!important;grid-template-columns:auto 1fr;column-gap:16px;align-items:center}" +
    P + ".wf-res > p" + N + "{grid-column:2;margin-top:0!important;margin-bottom:0!important}" + P + ".wf-res > p + p" + N + "{margin-top:4px!important}" +
    P + ".wq-ring" + N + "{grid-column:1;grid-row:1 / span 2;position:relative;width:68px;height:68px}" +
    P + ".wq-ring svg" + N + "{display:block;width:100%;height:100%;transform:rotate(-90deg)}" +
    P + ".wq-ring circle" + N + "{fill:none;stroke:#EEF1F6;stroke-width:7}" +
    P + ".wq-ring .wq-rv" + N + "{stroke:#3A5292;stroke-linecap:round;stroke-dasharray:163.4;stroke-dashoffset:163.4}" +
    P + ".wf-sc.go .wq-ring .wq-rv" + N + "{stroke-dashoffset:63.5;transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1) 2.4s}" +
    P + ".wq-ring b" + N + "{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;font:700 1rem/1 'Red Hat Text',sans-serif;color:#1F273F}" +
    P + ".wq-ring b i" + N + "{font:500 .625rem/1.3 'Red Hat Text',sans-serif;color:#5B6478}" +
    /* what changed */
    P + ".wf-chg .wf-card:not(.wf-now)" + N + "{background:#F9FAFE!important;box-shadow:none!important}" +
    P + ".wf-now" + N + "{border:1.5px solid #3A5292!important;box-shadow:0 1px 2px rgba(31,39,63,.04),0 18px 36px -20px rgba(58,82,146,.5)!important}" +
    P + ".wf-now .wf-k" + N + "{display:flex!important;align-items:center;gap:8px}" +
    P + ".wf-now .wf-k" + N + "::before{content:'';width:7px;height:7px;border-radius:50%;background:#3A5292;box-shadow:0 0 0 4px #E3EBF8}" +
    P + ".wf-dec" + N + "{padding:12px 16px!important;border-radius:12px!important;background:#E3EBF8!important;color:#1F273F!important}" +
    "@media (max-width:40rem){" + P + ".wq-ic" + N + "{width:28px;height:28px;border-radius:8px}" + P + ".wq-ic svg" + N + "{width:15px;height:15px}" + P + ".wq-ring" + N + "{width:56px;height:56px}" + P + ".wq-ring b" + N + "{font-size:.875rem}" + P + ".wf-res" + N + "{column-gap:12px}" + P + ".wf-fl li" + N + "{padding:9px 0!important}" + P + ".wf-dec" + N + "{padding:10px 12px!important}}" +
    "@media (prefers-reduced-motion:reduce){" + P + ".wq-ring .wq-rv" + N + "{stroke-dashoffset:63.5!important;transition:none!important}}";
  document.head.appendChild(css);
  var IC = ['<path d="M4 16V9M10 16V4M16 16v-5"/>', '<path d="M6 3h6l3 3v11H6z"/><path d="M12 3v3h3M8.5 10h4M8.5 13h4"/>', '<circle cx="10" cy="10" r="6.5"/><path d="M3.5 10h13M10 3.5c2.2 2 2.2 11 0 13M10 3.5c-2.2 2-2.2 11 0 13"/>'];
  [].forEach.call(main.querySelectorAll('.wf-sc[data-s="1"] .wf-tr'), function (r, i) { var s = r.firstElementChild; if (s && IC[i]) s.insertAdjacentHTML("afterbegin", '<i class="wq-ic" aria-hidden="true"><svg viewBox="0 0 20 20">' + IC[i] + "</svg></i>"); });
  var res = main.querySelector('.wf-sc[data-s="3"] .wf-res');
  if (res) res.insertAdjacentHTML("afterbegin", '<span class="wq-ring" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26"/><circle class="wq-rv" cx="32" cy="32" r="26"/></svg><b>22<i>of 36</i></b></span>');
})();
/* <<< workflow steps hd */
/* >>> homepage hd: the rest of the homepage brought in line with the workflow screens (same blues, white cards with fine borders and soft blue shadows, light blue icon tiles, the same type weights) */
(function () {
  var ln = document.getElementById("ln"), can = document.getElementById("can"); if (!ln || !can || ln.classList.contains("hd3")) return; ln.classList.add("hd3");
  var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p)", P = "html body #ln.hd3 ";
  var SH = "0 1px 2px rgba(31,39,63,.04),0 14px 32px -20px rgba(58,82,146,.32)";
  var css = document.createElement("style");
  css.textContent =
    /* one set of blues for every section */
    P + ":is(#why,#workflow,#problem,#can,#trust)" + N + "{--color-accent:#3A5292;--color-b100:#E3EBF8;--color-b200:#C9D8EE;--color-b300:#9DB9E3;--color-b400:#80AADC;--color-b500:#5F86C4;--color-b600:#4A69AB;--color-b700:#3A5292;--color-b800:#1F273F;-webkit-font-smoothing:antialiased}" +
    P + ":is(.wf-lead,.pb-lead,.hp2-l p,.hp2-list p,#trust .ln-sub,#trust article p,.wf-tt p)" + N + "{color:#5B6478!important}" +
    /* the network diagram */
    P + ".net-card" + N + "{border:1px solid #DFDFDF!important;box-shadow:" + SH + "!important}" +
    P + ".net-src rect" + N + "," + P + ".net-out rect" + N + "," + P + ".net-gap rect" + N + "{stroke:#DFDFDF!important}" +
    P + ".net-blk rect" + N + "{fill:#E3EBF8!important;stroke:#C9D8EE!important}" +
    P + ".net-blk text" + N + "{font-weight:600!important;fill:#3A5292!important}" +
    P + ".net-lab" + N + "{font-weight:600!important}" +
    P + ".net-e" + N + "{stroke:#C9D8EE!important}" + P + ".net-mem" + N + "{stroke:#9DB9E3!important}" +
    P + ".net-loop" + N + "," + P + ".net-p" + N + "{stroke:#9DB9E3!important}" + P + ".net-dot" + N + "{fill:#3A5292!important}" + P + ".net-dot-m" + N + "," + P + ".net-dot-g" + N + "{fill:#80AADC!important}" +
    /* connect, understand, decide */
    P + ".hp2-list li" + N + "{display:flex!important;align-items:flex-start;gap:18px}" +
    P + ".hp2-list h3" + N + "{font-weight:600!important}" +
    P + ".hd3-ic" + N + "{flex:none;display:grid;place-items:center;width:44px;height:44px;margin-top:2px;border-radius:12px;background:#E3EBF8}" +
    P + ".hd3-ic svg" + N + "{width:22px;height:22px;fill:none;stroke:#3A5292;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}" +
    /* built on trust */
    P + "#trust" + N + "{background:radial-gradient(120% 90% at 50% 0%,#F3F6FA 0%,#ECEFF3 100%)!important}" +
    P + "#trust article" + N + "{border:1px solid #DFDFDF!important;border-radius:14px!important;box-shadow:" + SH + "!important}" +
    P + ".v3-tr2-ic" + N + "{width:40px!important;height:40px!important;border-radius:11px!important;background:#E3EBF8!important;box-shadow:none!important}" +
    P + ".v3-tr2-ic svg" + N + "{stroke:#3A5292!important;stroke-width:1.5!important}" +
    "@media (max-width:40rem){" + P + "#start .hp2-ctas" + N + "{width:100%!important;max-width:100%!important;flex-wrap:wrap!important;justify-content:center!important;box-sizing:border-box}" + P + "#start .hp2-ctas > *" + N + "{flex:1 1 auto!important;min-width:0!important;padding:0 18px!important}" + P + ".hp2-list li" + N + "{gap:14px}" + P + ".hd3-ic" + N + "{width:38px;height:38px;border-radius:10px}" + P + ".hd3-ic svg" + N + "{width:19px;height:19px}}";
  document.head.appendChild(css);
  var IC = ['<circle cx="5" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="10" cy="15" r="2"/><path d="M7 6h6M6 7.6l3 5.6M14 7.6l-3 5.6"/>', '<path d="M6 3h6l3 3v11H6z"/><path d="M12 3v3h3M8.5 10h4M8.5 13h4"/>', '<circle cx="10" cy="10" r="6.5" stroke-dasharray="2.4 2.2"/><path d="M8.2 8.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.2M10 13.6v.1"/>', '<path d="M4 7l6-3 6 3-6 3z"/><path d="M4 10.5l6 3 6-3M4 14l6 3 6-3"/>'];
  [].forEach.call(can.querySelectorAll(".hp2-list > li"), function (li, i) { if (IC[i]) li.insertAdjacentHTML("afterbegin", '<span class="hd3-ic" aria-hidden="true"><svg viewBox="0 0 20 20">' + IC[i] + "</svg></span>"); });
})();
/* <<< homepage hd */


}
