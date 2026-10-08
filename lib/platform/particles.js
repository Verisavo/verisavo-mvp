/* Ask section background: a field of market signals that gathers into connected intelligence.
   Scroll assembles the scattered signals into a network, the pointer pushes them aside, typing sends
   pulses along the network into the question box, and each chip reshapes the field to match its question. */
export default function init() {
  const stage = document.querySelector(".stage"), bg = stage && stage.querySelector(".stage-bg"), cv = document.getElementById("pfield");
  if (!stage || !bg || !cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const cap = document.getElementById("pf-cap");
  const form = document.getElementById("ask-form"), ask = document.getElementById("ask-input");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 640px)").matches;
  const N = small ? 760 : 1500, DUST = small ? 110 : 230;

  /* seeded random, so the shapes look the same on every visit */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  /* glow sprites in the blue scale */
  const TINTS = ["#FFFFFF", "#E3EBF8", "#CCDDF1", "#A8C6E8", "#80AADC"];
  const sprite = c => { const s = document.createElement("canvas"); s.width = s.height = 32; const g = s.getContext("2d"), r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, c); r.addColorStop(.22, c); r.addColorStop(.45, c + "55"); r.addColorStop(1, c + "00"); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return s; };
  const SPR = TINTS.map(sprite);

  /* particles */
  const P = [];
  for (let i = 0; i < N; i++) {
    const r = rnd();
    P.push({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, s: .7 + rnd() * 1.1, a: .45 + rnd() * .5, t: r < .14 ? 0 : r < .38 ? 1 : r < .7 ? 2 : r < .92 ? 3 : 4, ph: rnd() * 6.28, u: rnd(), glow: 0 });
  }
  const D = []; for (let i = 0; i < DUST; i++) D.push({ x: rnd(), y: rnd(), s: .4 + rnd() * .9, a: .15 + rnd() * .35, k: .05 + rnd() * .25, ph: rnd() * 6.28 });

  let W = 0, H = 0, dpr = 1, CX = 0, CY = 0, S = 0;
  const shapes = {};   // name -> Float32Array of x,y in canvas pixels
  let netNodes = {};   // k -> [[x,y], ...] node centres of each network, for pulses

  /* ---------- shapes ---------- */
  function scatterShape() {
    seed = 11; const a = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { a[i * 2] = rnd() * W; a[i * 2 + 1] = rnd() * H; }
    return a;
  }
  // hub and spokes: the hub is the question, the outer nodes are sources, the spokes are the connections
  function networkShape(k) {
    seed = 23 + k; const a = new Float32Array(N * 2), nodes = [];
    for (let j = 0; j < k; j++) { const ang = -Math.PI / 2 + (j / k) * Math.PI * 2 + (rnd() - .5) * .35, rr = .78 + rnd() * .3; nodes.push([Math.cos(ang) * rr * 1.35, Math.sin(ang) * rr]); }
    for (let i = 0; i < N; i++) {
      const u = P[i].u; let x, y;
      if (u < .16) { const r = Math.abs(gauss()) * .085; const t = rnd() * 6.28; x = Math.cos(t) * r; y = Math.sin(t) * r; }
      else if (u < .58) { const n = nodes[Math.floor(rnd() * k)], r = Math.abs(gauss()) * .055, t = rnd() * 6.28; x = n[0] + Math.cos(t) * r; y = n[1] + Math.sin(t) * r; }
      else { const n = nodes[Math.floor(rnd() * k)], f = .1 + rnd() * .82, j = gauss() * .009; x = n[0] * f - n[1] * j; y = n[1] * f + n[0] * j; }
      a[i * 2] = CX + x * S; a[i * 2 + 1] = CY + y * S;
    }
    netNodes[k] = nodes.map(([x, y]) => [CX + x * S, CY + y * S]);
    return a;
  }
  // Explore a market: a globe of latitude and longitude lines
  function globeShape() {
    seed = 31; const a = new Float32Array(N * 2), R = 1;
    for (let i = 0; i < N; i++) {
      const u = P[i].u; let x, y;
      if (u < .3) { const t = rnd() * 6.28; x = Math.cos(t) * R; y = Math.sin(t) * R; }
      else if (u < .62) { const lat = [-.55, 0, .55][Math.floor(rnd() * 3)], t = rnd() * 6.28, rw = Math.sqrt(1 - lat * lat); x = Math.cos(t) * rw; y = lat + Math.sin(t) * rw * .16; }
      else if (u < .92) { const lon = [.35, .75][Math.floor(rnd() * 2)], t = rnd() * 6.28; x = Math.cos(t) * lon; y = Math.sin(t) * R; }
      else { const r = Math.sqrt(rnd()) * .95, t = rnd() * 6.28; x = Math.cos(t) * r; y = Math.sin(t) * r; }
      x += gauss() * .012; y += gauss() * .012;
      a[i * 2] = CX + x * S * .95; a[i * 2 + 1] = CY + y * S * .95;
    }
    return a;
  }
  // Compare locations: two clusters of evidence, linked
  function compareShape() {
    seed = 41; const a = new Float32Array(N * 2), side = [[-.95, 0], [.95, 0]];
    const ring = c => { const pts = []; for (let j = 0; j < 5; j++) { const t = j / 5 * 6.28 - 1.57; pts.push([c[0] + Math.cos(t) * .5, c[1] + Math.sin(t) * .5]); } return pts; };
    const R = [ring(side[0]), ring(side[1])];
    for (let i = 0; i < N; i++) {
      const u = P[i].u, s = rnd() < .5 ? 0 : 1, c = side[s]; let x, y;
      if (u < .2) { const r = Math.abs(gauss()) * .07, t = rnd() * 6.28; x = c[0] + Math.cos(t) * r; y = c[1] + Math.sin(t) * r; }
      else if (u < .5) { const n = R[s][Math.floor(rnd() * 5)], r = Math.abs(gauss()) * .045, t = rnd() * 6.28; x = n[0] + Math.cos(t) * r; y = n[1] + Math.sin(t) * r; }
      else if (u < .84) { const n = R[s][Math.floor(rnd() * 5)], f = rnd(); x = c[0] + (n[0] - c[0]) * f; y = c[1] + (n[1] - c[1]) * f + gauss() * .006; }
      else { const f = rnd(); x = -.95 + 1.9 * f; y = Math.sin(f * Math.PI) * -.12 + gauss() * .008; }
      a[i * 2] = CX + x * S; a[i * 2 + 1] = CY + y * S;
    }
    return a;
  }
  // Investigate a gap: a ring of evidence with a piece missing, and a few loose signals in the gap
  function gapShape() {
    seed = 53; const a = new Float32Array(N * 2), g0 = -.55, g1 = .55;   // the gap, in radians around the right side
    for (let i = 0; i < N; i++) {
      const u = P[i].u; let x, y;
      if (u < .82) { let t; do { t = rnd() * 6.28 - Math.PI; } while (t > g0 && t < g1); const r = 1 + gauss() * .025; x = Math.cos(t) * r; y = Math.sin(t) * r; }
      else if (u < .92) { const n = [[-1, 0], [0, -1], [0, 1], [-.71, .71], [-.71, -.71]][Math.floor(rnd() * 5)], r = Math.abs(gauss()) * .06, t = rnd() * 6.28; x = n[0] + Math.cos(t) * r; y = n[1] + Math.sin(t) * r; }
      else { x = .95 + rnd() * .45; y = (rnd() - .5) * .9; }
      a[i * 2] = CX + x * S * .9; a[i * 2 + 1] = CY + y * S * .9;
    }
    return a;
  }

  function layout() {
    const r = bg.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
    CX = W / 2; CY = H * (small ? .44 : .42); S = Math.min(W * (small ? .28 : .2), H * (small ? .25 : .3));
    netNodes = {};
    shapes.scatter = scatterShape(); shapes.globe = globeShape(); shapes.compare = compareShape(); shapes.gap = gapShape();
    for (let k = 5; k <= 12; k++) shapes["net" + k] = networkShape(k);
  }

  /* ---------- state ---------- */
  let mode = null, netK = 7, assemble = 0, scrollV = 0, lastY = scrollY, mx = -1e4, my = -1e4, pointerOn = false;
  let converge = 0, convX = 0, convY = 0, burstAt = 0;
  const pulses = [], sparks = [];
  const CAPS = { scatter: "Fragmented signals", net: "Connected intelligence", typing: "Connecting evidence to your question", globe: "Explore a market", compare: "Compare locations", gap: "Intelligence gap: what is still unknown", send: "Gathering evidence" };
  let capNow = "";
  const setCap = t => { if (!cap || t === capNow) return; capNow = t; cap.classList.remove("in"); clearTimeout(setCap.tm); setCap.tm = setTimeout(() => { cap.textContent = t; cap.classList.add("in"); }, 180); };

  const progress = () => { const r = stage.getBoundingClientRect(), vh = innerHeight; return (vh - r.top) / (vh + r.height); };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function targets() {
    const p = progress();
    assemble = smooth(.12, .42, p) * (1 - smooth(.86, 1, p));
    const typing = document.activeElement === ask && ask.value.trim().length > 0;
    netK = typing ? Math.min(12, 5 + Math.floor(ask.value.trim().length / 8)) : 7;
    const shape = mode ? shapes[mode] : shapes["net" + netK];
    const a = mode ? 1 : assemble, sc = shapes.scatter, now = performance.now() / 1000;
    const spin = mode ? 0 : (p - .5) * .5;   // the network turns a little as the page scrolls
    const cs = Math.cos(spin), sn = Math.sin(spin);
    for (let i = 0; i < N; i++) {
      const q = P[i];
      let sx = shape[i * 2] - CX, sy = shape[i * 2 + 1] - CY;
      const rx = sx * cs - sy * sn, ry = sx * sn + sy * cs;
      const wob = 3 + (1 - a) * 9;
      q.tx = sc[i * 2] + (CX + rx - sc[i * 2]) * a + Math.sin(now * .6 + q.ph) * wob;
      q.ty = sc[i * 2 + 1] + (CY + ry - sc[i * 2 + 1]) * a + Math.cos(now * .5 + q.ph * 1.3) * wob;
      if (converge > 0) { q.tx += (convX + Math.cos(q.ph) * 60 * q.u - q.tx) * converge; q.ty += (convY + Math.sin(q.ph) * 14 * q.u - q.ty) * converge; }
    }
    setCap(converge > .2 ? CAPS.send : mode ? CAPS[mode] : typing ? CAPS.typing : assemble > .55 ? CAPS.net : CAPS.scatter);
  }

  function step() {
    const dy = scrollY - lastY; lastY = scrollY; scrollV = scrollV * .85 + dy * .15;
    const R = small ? 70 : 100;
    for (let i = 0; i < N; i++) {
      const q = P[i];
      q.vx += (q.tx - q.x) * .03; q.vy += (q.ty - q.y) * .03;
      q.vy -= scrollV * .04 * (.5 + q.u);   // scrolling drags the field, which springs back
      if (pointerOn) {
        const ddx = q.x - mx, ddy = q.y - my, d2 = ddx * ddx + ddy * ddy;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 1.6; q.vx += ddx / d * f; q.vy += ddy / d * f; q.glow = Math.min(1, q.glow + .08); }
      }
      q.vx *= .86; q.vy *= .86; q.x += q.vx; q.y += q.vy; q.glow *= .94;
    }
  }

  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    // background specks drift at their own depth as the page scrolls
    for (const d of D) {
      const y = ((d.y * H - scrollY * d.k) % H + H) % H, tw = .6 + .4 * Math.sin(t * .0012 + d.ph);
      ctx.globalAlpha = d.a * tw; const s = d.s * 3; ctx.drawImage(SPR[3], d.x * W - s / 2, y - s / 2, s, s);
    }
    for (const q of P) {
      const s = (q.s + q.glow * .5) * 4.2;
      ctx.globalAlpha = Math.min(.95, q.a * (.55 + .45 * (mode ? 1 : Math.max(assemble, .35))) + q.glow * .2);
      ctx.drawImage(SPR[q.glow > .5 ? 1 : q.t], q.x - s / 2, q.y - s / 2, s, s);
    }
    // pulses run along the network; sparks fall into the question box
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i], k = (t - p.t0) / p.dur; if (k >= 1) { pulses.splice(i, 1); continue; }
      const e = k * k * (3 - 2 * k);
      for (let j = 0; j < 6; j++) { const kk = Math.max(0, e - j * .03), x = p.x0 + (p.x1 - p.x0) * kk, y = p.y0 + (p.y1 - p.y0) * kk; ctx.globalAlpha = (1 - j / 6) * (1 - k * .4); const s = 11 - j; ctx.drawImage(SPR[0], x - s / 2, y - s / 2, s, s); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i], k = (t - p.t0) / p.dur; if (k >= 1) { sparks.splice(i, 1); continue; }
      for (let j = 0; j < 7; j++) {
        const kk = Math.max(0, k - j * .025), m = 1 - kk;
        const x = m * m * p.x0 + 2 * m * kk * p.cx + kk * kk * p.x1, y = m * m * p.y0 + 2 * m * kk * p.cy + kk * kk * p.y1;
        ctx.globalAlpha = (1 - j / 7) * (1 - k * .5); const s = 9 - j; ctx.drawImage(SPR[1], x - s / 2, y - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  /* ---------- loop: runs only while the section is on screen ---------- */
  let raf = 0, visible = false;
  const frame = t => {
    raf = 0;
    if (converge > 0 && t - burstAt > 700) {   // release the converged field with a burst
      converge = 0; for (const q of P) { const a = q.ph, f = 6 + q.u * 10; q.vx += Math.cos(a) * f; q.vy += Math.sin(a) * f * .6; }
    }
    targets(); step(); draw(t);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function start() {
    layout();
    targets();
    // begin scattered, so the first scroll gathers them
    const sc = shapes.scatter;
    for (let i = 0; i < N; i++) { P[i].x = reduced ? P[i].tx : sc[i * 2]; P[i].y = reduced ? P[i].ty : sc[i * 2 + 1]; }
    if (reduced) { assemble = 1; targets(); P.forEach(q => { q.x = q.tx; q.y = q.ty; }); draw(0); return; }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
  }

  /* ---------- input ---------- */
  const local = e => { const r = bg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  stage.addEventListener("pointermove", e => {
    if (e.pointerType === "touch" && !e.isPrimary) return;
    const overCard = e.target.closest && e.target.closest(".chat");
    if (overCard) { pointerOn = false; return; }
    [mx, my] = local(e); pointerOn = my >= 0 && my <= H; run();
  });
  stage.addEventListener("pointerleave", () => { pointerOn = false; });
  stage.addEventListener("pointerdown", e => { if (e.target.closest && e.target.closest(".chat")) return; [mx, my] = local(e); pointerOn = true; run(); });
  addEventListener("pointerup", e => { if (e.pointerType === "touch") pointerOn = false; });
  addEventListener("scroll", run, { passive: true });

  // each chip reshapes the field while it is hovered or focused
  const chipShape = el => { const t = (el.textContent || "").toLowerCase(); return /compare/.test(t) ? "compare" : /gap/.test(t) ? "gap" : /explore/.test(t) ? "globe" : null; };
  if (form) form.querySelectorAll(".chip").forEach(c => {
    const s = chipShape(c); if (!s) return;
    c.addEventListener("pointerenter", () => { mode = s; run(); });
    c.addEventListener("pointerleave", () => { if (mode === s) mode = null; });
    c.addEventListener("focus", () => { mode = s; run(); });
    c.addEventListener("blur", () => { if (mode === s) mode = null; });
    c.addEventListener("click", () => { mode = s; setTimeout(() => { if (mode === s) mode = null; }, 1600); run(); });
  });

  // typing: a pulse runs out along a spoke and a spark falls into the question box
  if (ask) {
    let lastKey = 0;
    ask.addEventListener("input", () => {
      const t = performance.now(); if (t - lastKey < 45) return; lastKey = t; run();
      const nodes = netNodes[netK] || netNodes[7]; if (!nodes) return;
      const n = nodes[Math.floor(Math.random() * nodes.length)];
      pulses.push({ x0: CX, y0: CY, x1: n[0], y1: n[1], t0: t, dur: 520 });
      const ar = ask.getBoundingClientRect(), br = bg.getBoundingClientRect();
      const x1 = ar.left - br.left + Math.min(ar.width - 20, 20 + ask.value.length * 7.5 % Math.max(40, ar.width - 40)), y1 = Math.min(H - 4, ar.top - br.top + 10);
      sparks.push({ x0: n[0], y0: n[1], cx: (n[0] + x1) / 2 + (Math.random() - .5) * 120, cy: Math.min(n[1], y1) - 40, x1, y1, t0: t, dur: 900 });
      if (pulses.length > 14) pulses.shift(); if (sparks.length > 14) sparks.shift();
      for (const q of P) if (Math.random() < .02) { q.vx += (Math.random() - .5) * 2; q.vy += (Math.random() - .5) * 2; }
    });
    ask.addEventListener("focus", run); ask.addEventListener("blur", run);
  }
  // sending: the field rushes into the question, then spreads back out
  if (form) form.addEventListener("submit", () => {
    if (!ask || !ask.value.trim() || reduced) return;
    const fr = form.getBoundingClientRect(), br = bg.getBoundingClientRect();
    convX = fr.left - br.left + fr.width / 2; convY = Math.min(H - 10, fr.top - br.top + 24); converge = 1; burstAt = performance.now(); run();
  }, true);   // capture, so this runs before the form handler clears the question

  let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (reduced) { targets(); P.forEach(q => { q.x = q.tx; q.y = q.ty; }); draw(0); } run(); }, 150); });
  start();
}
