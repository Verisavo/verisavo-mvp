/* Ask section background: a cloud of market signals that gathers into a turning globe.
   Scroll assembles the loose signals into the globe, the pointer pushes them aside, typing spins the
   globe and sends sparks into the question box, and the chips draw the globe together. */
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
  let cloud = null;                       // loose signals: x,y in canvas pixels
  const G = new Float32Array(N * 3);      // the globe: a point on the unit sphere for each particle

  /* ---------- shapes ---------- */
  // a soft oval cloud of loose signals around the centre
  function cloudShape() {
    seed = 11; const a = new Float32Array(N * 2), rx = Math.min(W * .3, 420), ry = H * .36;
    for (let i = 0; i < N; i++) {
      const r = Math.pow(rnd(), .62), t = rnd() * 6.28;
      a[i * 2] = CX + Math.cos(t) * r * rx + gauss() * 6; a[i * 2 + 1] = CY + Math.sin(t) * r * ry + gauss() * 6;
    }
    return a;
  }
  // a globe of latitude and longitude lines, with a light scatter over its surface
  (function globe() {
    seed = 31;
    for (let i = 0; i < N; i++) {
      const u = P[i].u; let lat, lon;
      if (u < .34) { lat = [-1.0, -.5, 0, .5, 1.0][Math.floor(rnd() * 5)]; lon = rnd() * 6.28; }
      else if (u < .66) { lon = Math.floor(rnd() * 6) / 6 * Math.PI; lat = (rnd() * 2 - 1) * 1.5; if (rnd() < .5) lon += Math.PI; }
      else { lat = Math.asin(rnd() * 2 - 1); lon = rnd() * 6.28; }
      const j = .012;
      G[i * 3] = Math.cos(lat) * Math.cos(lon) + gauss() * j; G[i * 3 + 1] = Math.sin(lat) + gauss() * j; G[i * 3 + 2] = Math.cos(lat) * Math.sin(lon) + gauss() * j;
    }
  })();

  function layout() {
    const r = bg.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
    CX = W / 2; CY = H * (small ? .44 : .42); S = Math.min(W * (small ? .3 : .2), H * (small ? .27 : .31));
    cloud = cloudShape();
  }

  /* ---------- state ---------- */
  let mode = null, assemble = 0, scrollV = 0, lastY = scrollY, mx = -1e4, my = -1e4, pointerOn = false;
  let converge = 0, convX = 0, convY = 0, burstAt = 0, rot = 0, spinV = 0, lastT = 0;
  const sparks = [];
  const CAPS = { cloud: "Fragmented signals", globe: "Connected intelligence", typing: "Connecting evidence to your question", send: "Gathering evidence" };
  let capNow = "";
  const setCap = t => { if (!cap || t === capNow) return; capNow = t; cap.classList.remove("in"); clearTimeout(setCap.tm); setCap.tm = setTimeout(() => { cap.textContent = t; cap.classList.add("in"); }, 180); };

  const progress = () => { const r = stage.getBoundingClientRect(), vh = innerHeight; return (vh - r.top) / (vh + r.height); };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function targets(t) {
    const p = progress();
    assemble = smooth(.12, .42, p) * (1 - smooth(.86, 1, p));
    const typing = document.activeElement === ask && ask.value.trim().length > 0;
    const a = mode ? 1 : assemble, now = t / 1000, dt = Math.min(.05, Math.max(0, (t - lastT) / 1000)); lastT = t;
    spinV *= .96; rot += (.16 + spinV) * dt;   // the globe turns slowly; typing spins it faster
    const tilt = .38 + (p - .5) * .3, ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < N; i++) {
      const q = P[i], gx = G[i * 3], gy = G[i * 3 + 1], gz = G[i * 3 + 2];
      const x1 = gx * cr + gz * sr, z1 = -gx * sr + gz * cr;   // turn around the vertical axis
      const y2 = gy * ct - z1 * st, z2 = gy * st + z1 * ct;    // then tilt towards the viewer
      q.z = z2;
      const wob = 2.5 + (1 - a) * 9;
      q.tx = cloud[i * 2] + (CX + x1 * S - cloud[i * 2]) * a + Math.sin(now * .6 + q.ph) * wob;
      q.ty = cloud[i * 2 + 1] + (CY + y2 * S - cloud[i * 2 + 1]) * a + Math.cos(now * .5 + q.ph * 1.3) * wob;
      if (converge > 0) { q.tx += (convX + Math.cos(q.ph) * 60 * q.u - q.tx) * converge; q.ty += (convY + Math.sin(q.ph) * 14 * q.u - q.ty) * converge; }
    }
    setCap(converge > .2 ? CAPS.send : mode ? mode : typing ? CAPS.typing : assemble > .55 ? CAPS.globe : CAPS.cloud);
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
    const a = mode ? 1 : assemble;
    for (const q of P) {
      const depth = 1 - a * (1 - (.3 + .7 * (q.z + 1) / 2));   // the far side of the globe is dimmer
      const s = (q.s + q.glow * .5) * 4.2 * (.75 + .25 * depth);
      ctx.globalAlpha = Math.min(.95, q.a * depth * (.55 + .45 * Math.max(a, .35)) + q.glow * .2);
      ctx.drawImage(SPR[q.glow > .5 ? 1 : q.t], q.x - s / 2, q.y - s / 2, s, s);
    }
    // sparks fall from the globe into the question box
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
    targets(t); step(); draw(t);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function start() {
    layout();
    targets(performance.now());
    // begin as a loose cloud, so the first scroll gathers it
    const sc = cloud;
    for (let i = 0; i < N; i++) { P[i].x = reduced ? P[i].tx : sc[i * 2]; P[i].y = reduced ? P[i].ty : sc[i * 2 + 1]; }
    if (reduced) { mode = CAPS.globe; targets(0); P.forEach(q => { q.x = q.tx; q.y = q.ty; }); draw(0); return; }
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

  // each chip draws the globe together while it is hovered or focused, and names what it explores
  if (form) form.querySelectorAll(".chip").forEach(c => {
    const label = (c.textContent || "").trim(); if (!label) return;
    const on = () => { mode = label; spinV = Math.max(spinV, .5); run(); }, off = () => { if (mode === label) mode = null; };
    c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off);
    c.addEventListener("focus", on); c.addEventListener("blur", off);
    c.addEventListener("click", () => { on(); setTimeout(off, 1600); });
  });

  // typing: each key spins the globe a little and a spark falls from it into the question box
  if (ask) {
    let lastKey = 0;
    ask.addEventListener("input", () => {
      const t = performance.now(); if (t - lastKey < 45) return; lastKey = t; run();
      spinV = Math.min(2.2, spinV + .22);
      let q = P[Math.floor(Math.random() * N)];
      for (let k = 0; k < 8 && q.z < .2; k++) q = P[Math.floor(Math.random() * N)];   // from the near side
      const ar = ask.getBoundingClientRect(), br = bg.getBoundingClientRect();
      const x1 = ar.left - br.left + Math.min(ar.width - 20, 20 + ask.value.length * 7.5 % Math.max(40, ar.width - 40)), y1 = Math.min(H - 4, ar.top - br.top + 10);
      sparks.push({ x0: q.x, y0: q.y, cx: (q.x + x1) / 2 + (Math.random() - .5) * 120, cy: Math.min(q.y, y1) - 30, x1, y1, t0: t, dur: 900 });
      if (sparks.length > 14) sparks.shift();
    });
    ask.addEventListener("focus", run); ask.addEventListener("blur", run);
  }
  // sending: the field rushes into the question, then spreads back out
  if (form) form.addEventListener("submit", () => {
    if (!ask || !ask.value.trim() || reduced) return;
    const fr = form.getBoundingClientRect(), br = bg.getBoundingClientRect();
    convX = fr.left - br.left + fr.width / 2; convY = Math.min(H - 10, fr.top - br.top + 24); converge = 1; burstAt = performance.now(); run();
  }, true);   // capture, so this runs before the form handler clears the question

  let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (reduced) { targets(0); P.forEach(q => { q.x = q.tx; q.y = q.ty; }); draw(0); } run(); }, 150); });
  start();
}
