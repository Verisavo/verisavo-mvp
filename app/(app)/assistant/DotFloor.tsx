"use client";
// The assistant's background: a field of dots laid out like a floor running back to the horizon.
// It rolls gently all the time, swells under the pointer, and ripples out from the message box
// when someone types or sends a question, and from an answer when it arrives.
// Ported from lib/platform/dotbed.js (the original assistant window).
import { useEffect, useRef, type RefObject } from "react";

export type FloorApi = { ripple: (x: number, y: number, amp: number) => void };

const NEAR = 1.6, FAR = 36, CAM = 2.2;   // world units: depth range and camera height

export default function DotFloor({ dark, apiRef }: { dark: boolean; apiRef: RefObject<FloorApi | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(dark);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => { darkRef.current = dark; redrawRef.current(); }, [dark]);

  useEffect(() => {
    const cv = canvasRef.current, host = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !host || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 1, H = 1, dpr = 1, cols = 0, rows = 0, GAP = .42, SPAN = 30;
    const size = () => {
      const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      GAP = W < 520 ? .5 : .42; SPAN = W < 520 ? 22 : 30;
      cols = Math.round(SPAN * 2 / GAP); rows = Math.round((FAR - NEAR) / GAP);
    };

    let mx = -1e4, my = -1e4, px = -1e4, py = -1e4, hover = 0;   // px,py: pointer; mx,my: the swell, which follows it smoothly
    const ripples: { x: number; y: number; t0: number; amp: number }[] = [];

    const draw = (t: number) => {
      const isDark = darkRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const horizon = H * .44, f = Math.max(W, H) * .62, sec = t / 1000;
      const drift = reduced ? 0 : (sec * .16) % 1;   // the floor creeps slowly towards the viewer
      const col = isDark ? "168,198,232" : "67,98,178";
      if (px > -1e3) { if (mx < -1e3) { mx = px; my = py; } else { mx += (px - mx) * .07; my += (py - my) * .07; } }
      hover += ((px > -1e3 ? 1 : 0) - hover) * .035;
      for (let j = rows; j >= 0; j--) {
        const z = NEAR + (j - drift) * GAP; if (z <= NEAR * .9) continue;
        const fog = Math.pow(Math.min(1, Math.max(0, (FAR - z) / (FAR * .75))), 1.6);   // fades out towards the horizon
        const half = (W / 2 + 20) * z / f;   // only the columns that land on screen
        for (let i = 0; i <= cols; i++) {
          const x = -SPAN + i * GAP; if (x < -half || x > half) continue;
          // gentle swell: three slow waves crossing the floor
          let y = reduced ? 0 : .2 * Math.sin(x * .24 + sec * .24) + .18 * Math.sin(z * .28 - sec * .34) + .1 * Math.sin((x + z) * .15 + sec * .14);
          const sx = W / 2 + x * f / z;
          let sy = horizon + (CAM - y) * f / z;
          if (sx < -10 || sx > W + 10 || sy > H + 10) continue;
          let lift = 0;
          if (hover > .01) { const d2 = (sx - mx) ** 2 + (sy - my) ** 2; lift += hover * .9 * Math.exp(-d2 / 12000); }
          for (const r of ripples) {
            const age = (t - r.t0) / 1000, rad = age * 240, w = Math.hypot(sx - r.x, sy - r.y) - rad, fade = Math.max(0, 1 - age / 3);
            if (w > -110 && w < 110) lift += r.amp * .8 * Math.cos(w / 110 * Math.PI / 2) * fade * fade * Math.min(1, age * 4);
          }
          lift *= Math.min(1, (5 / z) * (5 / z));   // ripples settle out before they reach the horizon
          if (lift) { y += lift; sy = horizon + (CAM - y) * f / z; }
          const s = Math.max(.9, 5 / z) * (1 + lift * .35);
          const a = fog * (isDark ? .9 : .6) * Math.min(1, 5 / z + .3) + Math.min(.35, lift * .25);
          ctx.fillStyle = `rgba(${lift > .3 ? (isDark ? "227,235,248" : "31,39,63") : col},${a.toFixed(3)})`;
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }
      for (let k = ripples.length - 1; k >= 0; k--) if (t - ripples[k].t0 > 3000) ripples.splice(k, 1);
    };

    let raf = 0;
    const frame = (t: number) => { raf = 0; draw(t); if (!document.hidden && !reduced) raf = requestAnimationFrame(frame); };
    const run = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
    redrawRef.current = () => { draw(performance.now()); run(); };
    apiRef.current = { ripple: (x, y, amp) => { ripples.push({ x, y, t0: performance.now(), amp }); if (ripples.length > 8) ripples.shift(); run(); } };

    const local = (e: PointerEvent) => { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
    const onMove = (e: PointerEvent) => { [px, py] = local(e); run(); };
    const onLeave = () => { px = py = -1e4; };
    const onDown = (e: PointerEvent) => { if (e.pointerType !== "mouse") { const [x, y] = local(e); apiRef.current?.ripple(x, y, .6); } };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", run);
    const ro = new ResizeObserver(() => { size(); draw(performance.now()); run(); });
    ro.observe(host);
    size(); draw(performance.now()); run();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", run);
      apiRef.current = null;
      redrawRef.current = () => {};
    };
  }, [apiRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 block size-full" />;
}
