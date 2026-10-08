/* Assistant background: a field of dots laid out like a floor running back to the horizon.
   It rolls gently all the time, swells under the pointer, and ripples out from the message box
   when someone types, sends a question or receives an answer. */
export default function init() {
  const main = document.querySelector(".va-main"), dlg = document.getElementById("va");
  if (!main || !dlg) return;
  const cv = document.createElement("canvas");
  cv.className = "va-bed"; cv.setAttribute("aria-hidden", "true");
  main.prepend(cv); main.classList.add("has-bed");
  const ctx = cv.getContext("2d"); if (!ctx) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vin = document.getElementById("va-in"), form = document.getElementById("va-form"), thread = document.getElementById("va-thread");

  let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, GAP = .42, SPAN = 30;
  const NEAR = 1.6, FAR = 36, CAM = 2.2;   // world units: depth range and camera height
  function size() {
    const r = main.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    GAP = W < 520 ? .5 : .42; SPAN = W < 520 ? 22 : 30;
    cols = Math.round(SPAN * 2 / GAP); rows = Math.round((FAR - NEAR) / GAP);
  }

  let mx = -1e4, my = -1e4, hover = 0;
  const ripples = [];   // {x, y, t0, amp}
  const ripple = (x, y, amp) => { ripples.push({ x, y, t0: performance.now(), amp }); if (ripples.length > 8) ripples.shift(); run(); };
  const composerPoint = () => { const m = main.getBoundingClientRect(), c = (form || main).getBoundingClientRect(); return [c.left - m.left + c.width / 2, c.top - m.top + 8]; };

  function draw(t) {
    const dark = main.classList.contains("va-dark");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const horizon = H * .44, f = Math.max(W, H) * .62, sec = t / 1000;
    const drift = reduced ? 0 : (sec * .4) % 1;   // the floor creeps slowly towards the viewer
    const dz = GAP;
    const col = dark ? [168, 198, 232] : [67, 98, 178];
    hover += ((mx > -1e3 ? 1 : 0) - hover) * .08;
    for (let j = rows; j >= 0; j--) {
      const z = NEAR + (j - drift) * dz; if (z <= NEAR * .9) continue;
      const fog = Math.pow(Math.min(1, Math.max(0, (FAR - z) / (FAR * .75))), 1.6);   // fades out towards the horizon
      const half = (W / 2 + 20) * z / f;   // only the columns that land on screen
      for (let i = 0; i <= cols; i++) {
        const x = -SPAN + i * GAP; if (x < -half || x > half) continue;
        // gentle swell: three slow waves crossing the floor
        let y = reduced ? 0 : .22 * Math.sin(x * .28 + sec * .5) + .2 * Math.sin(z * .32 - sec * .75) + .12 * Math.sin((x + z) * .17 + sec * .3);
        let sx = W / 2 + x * f / z, sy = horizon + (CAM - y) * f / z;
        if (sx < -10 || sx > W + 10 || sy > H + 10) continue;
        let lift = 0;
        if (hover > .01) { const d2 = (sx - mx) ** 2 + (sy - my) ** 2; lift += hover * 1.1 * Math.exp(-d2 / 9000); }
        for (const r of ripples) {
          const age = (t - r.t0) / 1000, rad = age * 420, d = Math.hypot(sx - r.x, sy - r.y), w = d - rad;
          if (w > -70 && w < 70) lift += r.amp * Math.cos(w / 70 * Math.PI / 2) * Math.max(0, 1 - age / 1.8);
        }
        lift *= Math.min(1, (5 / z) * (5 / z));   // ripples settle out before they reach the horizon
        if (lift) { y += lift; sy = horizon + (CAM - y) * f / z; }
        const s = Math.max(.9, 5 / z) * (1 + lift * .35);
        const a = fog * (dark ? .9 : .6) * Math.min(1, 5 / z + .3) + Math.min(.35, lift * .25);
        ctx.fillStyle = `rgba(${lift > .3 ? (dark ? "227,235,248" : "31,39,63") : col.join(",")},${a.toFixed(3)})`;
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      }
    }
    for (let k = ripples.length - 1; k >= 0; k--) if (t - ripples[k].t0 > 1800) ripples.splice(k, 1);
  }

  let raf = 0;
  const live = () => dlg.open && !document.hidden;
  const frame = t => { raf = 0; draw(t); if (live() && !reduced) raf = requestAnimationFrame(frame); };
  const run = () => { if (!raf && live()) raf = requestAnimationFrame(frame); };

  main.addEventListener("pointermove", e => { const r = main.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; run(); });
  main.addEventListener("pointerleave", () => { mx = my = -1e4; });
  main.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") { const r = main.getBoundingClientRect(); ripple(e.clientX - r.left, e.clientY - r.top, .6); } });
  if (vin) { let last = 0; vin.addEventListener("input", () => { const t = performance.now(); if (t - last < 90) return; last = t; const [x, y] = composerPoint(); ripple(x, y, .45); }); }
  if (form) form.addEventListener("submit", () => { const [x, y] = composerPoint(); ripple(x, y, 1.4); }, true);
  // an answer arriving sends a softer wave from where it appears
  if (thread) new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => {
    if (n instanceof Element && n.matches(".va-msg-a") && !n.querySelector(".va-typing")) { const r = main.getBoundingClientRect(), b = n.getBoundingClientRect(); ripple(b.left - r.left + 40, b.top - r.top + b.height / 2, .8); }
  }))).observe(thread, { childList: true });

  // run while the assistant is open; redraw on theme changes and resizes
  new MutationObserver(() => { if (dlg.open) { size(); draw(performance.now()); run(); } }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
  new MutationObserver(() => { draw(performance.now()); run(); }).observe(main, { attributes: true, attributeFilter: ["class"] });
  if ("ResizeObserver" in window) new ResizeObserver(() => { size(); draw(performance.now()); run(); }).observe(main);
  document.addEventListener("visibilitychange", run);
  size(); if (dlg.open) { draw(performance.now()); run(); }
}
