// Menu background (data streams swept by diagonal bands), shared by the Product page and the homepage.
export default function initMenuBg() {
  /* Menu background: faint columns of market evidence, swept by slow diagonal bands of light */
  const menu = document.getElementById("vmenu") || document.getElementById("menu");
  if (!menu || menu.querySelector(".mnav-bg")) return;
  const cv = document.createElement("canvas"); cv.className = "mnav-bg"; cv.setAttribute("aria-hidden", "true");
  menu.prepend(cv);
  const ctx = cv.getContext("2d"), text = document.createElement("canvas"), band = document.createElement("canvas");
  const tctx = text.getContext("2d"), bctx = band.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = ["Lagos", "Surulere", "Kumasi North", "Nairobi CBD", "Accra", "Abuja", "Lugbe", "Dar es Salaam", "Kinondoni", "Ikorodu",
    "shelf price +8%", "stockout 6/9", "reorder -12%", "new competitor", "delivery late 1d", "footfall +14%", "pack 250ml", "pack 1L", "price ₦1,250", "KSh 120", "GH₵ 9.50",
    "Fact", "Inference", "Hypothesis", "Assumption", "Unknown", "Intelligence Gap", "source: public record", "source: company data", "source: SavoScout",
    "08:40 geo ✓", "14:05 geo ✓", "scope 9 kiosks", "scope 3/30", "verified", "corroborated", "contradiction held", "Market Memory", "v14 → v15",
    "retailer", "distributor", "wholesaler", "kiosk", "bus park", "route A3", "6.5244, 3.3792", "-1.2864, 36.8172", "5.6037, -0.1870", "2026-10-24"];
  const HI = new Set(["Fact", "Unknown", "Intelligence Gap", "verified", "Market Memory", "stockout 6/9", "new competitor"]);
  let W = 0, H = 0, dpr = 1, raf = 0, t0 = performance.now(), last = 0;
  function build() {
    dpr = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    [cv, text, band].forEach(c => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    cv.style.width = W + "px"; cv.style.height = H + "px";
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0); tctx.clearRect(0, 0, W, H);
    tctx.font = '500 10.5px "Geist Mono", ui-monospace, Menlo, monospace'; tctx.textBaseline = "top";
    const lh = 13; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let y = 4; y < H; y += lh) {
      let x = -rnd() * 40;
      while (x < W) {
        const w = T[Math.floor(rnd() * T.length)];
        tctx.fillStyle = HI.has(w) ? (rnd() < .5 ? "#1F273F" : "#4362B2") : "#618CD0";
        tctx.globalAlpha = HI.has(w) ? 1 : .55 + rnd() * .4;
        tctx.fillText(w, x, y); x += tctx.measureText(w).width + 10 + rnd() * 14;
      }
    }
    tctx.globalAlpha = 1;
  }
  function frame(now) {
    raf = 0;
    if (!reduce && now - last < 33) { raf = requestAnimationFrame(frame); return; }
    last = now;
    const s = ((now - t0) / 1000) * (reduce ? 0 : 1);
    // gradient across the band direction (bands run lower-left to upper-right)
    const ang = Math.atan2(1, 1.7), ux = Math.cos(ang), uy = Math.sin(ang), L = W * ux + H * uy;
    bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.globalCompositeOperation = "source-over"; bctx.clearRect(0, 0, band.width, band.height);
    bctx.drawImage(text, 0, 0);
    bctx.globalCompositeOperation = "destination-in";
    const g = bctx.createLinearGradient(0, 0, ux * L * dpr, uy * L * dpr);
    const c1 = ((s / 16) % 1.4) - .2, c2 = (((s / 16) + .7) % 1.4) - .2;
    const a = p => { const d1 = Math.abs(p - c1), d2 = Math.abs(p - c2); const f = d => Math.max(0, 1 - d / .085); return Math.min(1, Math.pow(f(d1), 1.6) + .8 * Math.pow(f(d2), 1.6)); };
    for (let i = 0; i <= 48; i++) { const p = i / 48; g.addColorStop(p, "rgba(0,0,0," + a(p).toFixed(3) + ")"); }
    bctx.fillStyle = g; bctx.fillRect(0, 0, band.width, band.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalAlpha = .07; ctx.drawImage(text, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(band, 0, 0);
    if (!reduce && menu.classList.contains("open")) raf = requestAnimationFrame(frame);
  }
  // rebuild the text layer on every open: browsers may clear canvases while a tab or frame is in the background
  const start = () => { build(); last = 0; if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  const wake = () => { if (document.visibilityState === "visible" && menu.classList.contains("open")) start(); };
  document.addEventListener("visibilitychange", wake); addEventListener("pageshow", wake); addEventListener("focus", wake);
  [cv, text, band].forEach(c => c.addEventListener("contextrestored", wake));
  new MutationObserver(() => { if (menu.classList.contains("open")) start(); }).observe(menu, { attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", () => { if (!W) return; build(); if (menu.classList.contains("open")) start(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (W) build(); });
}
