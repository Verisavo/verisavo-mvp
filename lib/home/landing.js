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

  /* ---------- Why Verisavo exists: a low-poly market in motion (three.js) ---------- */
  (() => {
    const cv = $("ms-canvas"), THREE = window.THREE;
    if (!cv || !THREE) return;
    const frame = cv.parentElement;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: "low-power" }); }
    catch (e) { frame.classList.add("ms-off"); return; }
    const SKY = 0xE3EBF8;
    renderer.setClearColor(SKY);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(SKY, 110, 300);
    const camera = new THREE.PerspectiveCamera(32, 2, 1, 600);
    scene.add(new THREE.HemisphereLight(0xF4F7FD, 0x5E729E, 0.62));
    const sun = new THREE.DirectionalLight(0xFFF9F0, 0.55);
    sun.position.set(50, 80, 40); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 220 });
    scene.add(sun);

    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const mat = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o || {}));
    const M = { white: mat(0xFFFFFF), stone: mat(0xF0F4FB), stone2: mat(0xDCE5F3), ground: mat(0x9DB0D3), hill: mat(0xC2D1EC), hill2: mat(0xAFC2E2), road: mat(0x8497BF), ink: mat(0x1F273F), b7: mat(0x4362B2), b5: mat(0x618CD0), b4: mat(0x80AADC), b3: mat(0xA8C6E8) };
    const CANOPY = [M.b7, M.b5, M.b4, M.b3, M.ink];
    const add = (geo, m, x, y, z, shadow) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (shadow !== false) { o.castShadow = true; o.receiveShadow = true; } scene.add(o); return o; };

    /* ground with a gentle roll */
    const g = new THREE.PlaneGeometry(700, 700, 70, 70);
    const gp = g.attributes.position;
    for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), y = gp.getY(i), d = Math.hypot(x, y); gp.setZ(i, d < 60 ? 0 : (Math.sin(x * .03) + Math.cos(y * .027)) * 1.6 + rnd() * 1.2); }
    g.computeVertexNormals();
    const ground = new THREE.Mesh(g, M.ground); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    /* hills on the horizon */
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + rnd() * .2, r = 170 + rnd() * 70, h = 26 + rnd() * 52;
      const cg = new THREE.ConeGeometry(28 + rnd() * 34, h, 5 + Math.floor(rnd() * 3), 2);
      const p = cg.attributes.position; for (let k = 0; k < p.count; k++) if (p.getY(k) > -h / 2 + .1 && p.getY(k) < h / 2 - .1) { p.setX(k, p.getX(k) + (rnd() - .5) * 6); p.setZ(k, p.getZ(k) + (rnd() - .5) * 6); }
      cg.computeVertexNormals();
      add(cg, i % 3 ? M.hill : M.hill2, Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r, false);
    }

    /* the plinth: a market square raised on three steps */
    [[31, 0.9], [28.5, 2.7], [26, 4.5]].forEach(([r, y]) => add(new THREE.CylinderGeometry(r, r + .4, 1.8, 64), M.stone, 0, y, 0));
    const TOP = 5.4;
    /* ring road */
    const road = new THREE.Mesh(new THREE.RingGeometry(40, 45, 96), M.road); road.rotation.x = -Math.PI / 2; road.position.y = .06; road.receiveShadow = true; scene.add(road);

    /* stalls in two rings, facing the centre */
    const stalls = [];
    function stall(a, r) {
      const x = Math.cos(a) * r, z = Math.sin(a) * r, grp = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 2.2), M.white); base.position.y = .65; base.castShadow = base.receiveShadow = true; grp.add(base);
      [[-1.6, -1], [1.6, -1], [-1.6, 1], [1.6, 1]].forEach(([px, pz]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(.14, 3, .14), M.stone2); p.position.set(px, 1.5, pz); grp.add(p); });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4, .22, 3), CANOPY[Math.floor(rnd() * CANOPY.length)]); roof.position.y = 3.1; roof.rotation.x = .18; roof.castShadow = true; grp.add(roof);
      for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.6, .5, .5), k % 2 ? M.b3 : M.stone2); c.position.set(-1 + k, 1.55, 0); grp.add(c); }
      grp.position.set(x, TOP, z); grp.lookAt(0, TOP, 0); scene.add(grp);
      stalls.push(new THREE.Vector3(x, TOP + 3.4, z));
    }
    for (let i = 0; i < 9; i++) stall((i / 9) * Math.PI * 2 + .2, 11);
    for (let i = 0; i < 14; i++) stall((i / 14) * Math.PI * 2, 19);
    /* shops around the edge of the square */
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + .5, h = 4 + rnd() * 5, x = Math.cos(a) * 23.5, z = Math.sin(a) * 23.5;
      const s = add(new THREE.BoxGeometry(4.6, h, 4.2), M.white, x, TOP + h / 2, z); s.lookAt(0, TOP + h / 2, 0);
      const r = add(new THREE.BoxGeometry(5, .4, 4.6), i % 2 ? M.b7 : M.ink, x, TOP + h + .2, z); r.lookAt(0, TOP + h + .2, 0);
      stalls.push(new THREE.Vector3(x, TOP + h + .6, z));
    }

    /* the connecting point: where scattered evidence comes together */
    const HUB = new THREE.Vector3(0, 21, 0);
    const hub = add(new THREE.IcosahedronGeometry(1.5, 0), M.ink, HUB.x, HUB.y, HUB.z, false);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(3.4, .08, 6, 64), new THREE.MeshBasicMaterial({ color: 0x618CD0, transparent: true, opacity: .7 }));
    halo.position.copy(HUB); halo.rotation.x = Math.PI / 2; scene.add(halo);
    const halo2 = halo.clone(); halo2.material = halo.material.clone(); halo2.material.opacity = .35; halo2.scale.setScalar(1.6); scene.add(halo2);

    /* people walking between stalls */
    const people = [];
    const bodyG = new THREE.CylinderGeometry(.32, .38, 1.3, 6), headG = new THREE.SphereGeometry(.3, 6, 5);
    const pick = () => { const a = rnd() * Math.PI * 2, r = 4 + rnd() * 19; return new THREE.Vector3(Math.cos(a) * r, TOP, Math.sin(a) * r); };
    const NP = innerWidth < 760 ? 22 : 38;
    for (let i = 0; i < NP; i++) {
      const grp = new THREE.Group(), m = [M.ink, M.b7, M.b5, M.b4][i % 4];
      const b = new THREE.Mesh(bodyG, m); b.position.y = .65; b.castShadow = true; grp.add(b);
      const h = new THREE.Mesh(headG, M.stone2); h.position.y = 1.55; h.castShadow = true; grp.add(h);
      const p = pick(); grp.position.copy(p); scene.add(grp);
      people.push({ o: grp, to: pick(), v: .9 + rnd() * .9, ph: rnd() * 6 });
    }
    /* vans on the ring road */
    const vans = [];
    for (let i = 0; i < 5; i++) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 1.8), i % 2 ? M.white : M.b3); body.position.set(-.4, 1.1, 0); body.castShadow = true; grp.add(body);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.7), M.ink); cab.position.set(1.9, .85, 0); cab.castShadow = true; grp.add(cab);
      scene.add(grp); vans.push({ o: grp, a: (i / 5) * Math.PI * 2, r: i % 2 ? 41.5 : 43.5, v: (i % 2 ? 1 : -1) * (.05 + rnd() * .03) });
    }

    /* signals: a pulse at a stall, then a line drawn up to the connecting point */
    const sigs = [];
    const ringG = new THREE.RingGeometry(.8, 1.05, 40);
    function signal(now) {
      const p = stalls[Math.floor(Math.random() * stalls.length)];
      const ring = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0x4362B2, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false }));
      ring.position.copy(p); ring.rotation.x = -Math.PI / 2; scene.add(ring);
      const lg = new THREE.BufferGeometry().setFromPoints([p.clone(), p.clone()]);
      const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x4362B2, transparent: true, opacity: .75 }));
      scene.add(line);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1F273F, transparent: true }));
      dot.position.copy(p); scene.add(dot);
      sigs.push({ ring, line, dot, from: p.clone(), t0: now });
    }

    /* sizing, camera and the loop */
    let W = 0, H = 0;
    function size() {
      const r = frame.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.fov = W < 600 ? 40 : 32; camera.updateProjectionMatrix();
    }
    size(); addEventListener("resize", size);
    const sec = $("ln-why");
    let raf = 0, visible = false, last = performance.now(), next = 0, t = 0;
    const tmp = new THREE.Vector3();
    function frameAt(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      const r = sec.getBoundingClientRect(), prog = Math.max(-1, Math.min(1, (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight));
      const ang = .7 + t * .035 + prog * .5, rad = W < 600 ? 74 : 96;
      camera.position.set(Math.cos(ang) * rad, 30 + Math.sin(t * .2) * 1.5 - prog * 6, Math.sin(ang) * rad);
      camera.lookAt(0, 8, 0);
      hub.rotation.y += dt * .5; hub.rotation.x += dt * .2;
      halo.rotation.z += dt * .3; halo2.rotation.z -= dt * .15;
      const hs = 1 + Math.sin(t * 2) * .04; halo.scale.setScalar(hs);
      people.forEach(p => {
        tmp.subVectors(p.to, p.o.position); const d = tmp.length();
        if (d < .4) p.to = pick(); else { tmp.multiplyScalar(Math.min(d, p.v * dt) / d); p.o.position.add(tmp); p.o.rotation.y = Math.atan2(tmp.x, tmp.z); }
        p.o.position.y = TOP + Math.abs(Math.sin((t + p.ph) * 7)) * .08;
      });
      vans.forEach(v => { v.a += v.v * dt; v.o.position.set(Math.cos(v.a) * v.r, 0, Math.sin(v.a) * v.r); v.o.rotation.y = -v.a + (v.v > 0 ? -Math.PI / 2 : Math.PI / 2); });
      if (t > next) { signal(t); next = t + .7 + Math.random() * .6; }
      for (let i = sigs.length - 1; i >= 0; i--) {
        const s = sigs[i], a = t - s.t0;
        s.ring.scale.setScalar(1 + a * 2.2); s.ring.material.opacity = Math.max(0, .9 - a * .8);
        const k = Math.min(1, a / 1.4), e = 1 - Math.pow(1 - k, 3);
        const tip = s.from.clone().lerp(HUB, e);
        s.line.geometry.setFromPoints([s.from, tip]);
        s.dot.position.copy(tip);
        const fade = a > 2.2 ? Math.max(0, 1 - (a - 2.2) / 1) : 1;
        s.line.material.opacity = .7 * fade; s.dot.material.opacity = fade;
        if (a > 3.3) { scene.remove(s.ring, s.line, s.dot); s.ring.material.dispose(); s.line.geometry.dispose(); s.line.material.dispose(); s.dot.geometry.dispose(); s.dot.material.dispose(); sigs.splice(i, 1); }
      }
      renderer.render(scene, camera);
    }
    function loop(now) { raf = 0; frameAt(now); if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); }
    const kick = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: "120px" }).observe(frame);
    else { visible = true; kick(); }
    document.addEventListener("visibilitychange", kick);
    if (reduce) { for (let i = 0; i < 4; i++) signal(-i * .6); t = 1.2; frameAt(performance.now()); addEventListener("resize", () => frameAt(performance.now())); }
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
    const sel = [".ln-head > *", ".hm li", ".net-card", ".v3-why2 .ln-eb", ".ms-frame", ".hw-list", ".hw-stage", ".v3-card", ".v3-why .ln-wrap > *", ".v3-rel", ".v3-tr article", ".v3-qa details", ".v3-touch article", ".ln-close .ln-wrap > *"];
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
