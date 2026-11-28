// Product hero background: market evidence text swept by diagonal bands of light
export default function initHeroBg() {
  /* Product hero background: faint columns of market evidence, swept by slow diagonal bands of light */
  const host = document.querySelector(".hero");
  if (!host || host.querySelector(".hero-bg")) return;
  const cv = document.createElement("canvas"); cv.className = "hero-bg"; cv.setAttribute("aria-hidden", "true");
  host.prepend(cv);
  const ctx = cv.getContext("2d"), text = document.createElement("canvas"), band = document.createElement("canvas");
  const tctx = text.getContext("2d"), bctx = band.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = ["Lagos", "Surulere", "Kumasi North", "Nairobi CBD", "Accra", "Abuja", "Lugbe", "Dar es Salaam", "Kinondoni", "Ikorodu",
    "shelf price +8%", "stockout 6/9", "reorder -12%", "new competitor", "delivery late 1d", "footfall +14%", "pack 250ml", "pack 1L", "price ₦1,250", "KSh 120", "GH₵ 9.50",
    "Fact", "Inference", "Hypothesis", "Assumption", "Unknown", "Intelligence Gap", "source: public record", "source: company data", "source: SavoScout",
    "08:40 geo ✓", "14:05 geo ✓", "scope 9 kiosks", "scope 3/30", "verified", "corroborated", "contradiction held", "Market Memory", "v14 → v15",
    "retailer", "distributor", "wholesaler", "kiosk", "bus park", "route A3", "6.5244, 3.3792", "-1.2864, 36.8172", "5.6037, -0.1870"];
  const HI = new Set(["Fact", "Unknown", "Intelligence Gap", "verified", "Market Memory", "stockout 6/9", "new competitor"]);
  let W = 0, H = 0, dpr = 1, raf = 0, t0 = performance.now(), last = 0, vis = true;
  function build() {
    const r = host.getBoundingClientRect();
    dpr = Math.min(1.5, devicePixelRatio || 1); W = Math.round(r.width); H = Math.round(r.height);
    [cv, text, band].forEach(c => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    cv.style.width = W + "px"; cv.style.height = H + "px";
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0); tctx.clearRect(0, 0, W, H);
    tctx.font = '500 10.5px "Geist Mono", ui-monospace, Menlo, monospace'; tctx.textBaseline = "top";
    const lh = 13; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let y = 4; y < H; y += lh) {
      let x = -rnd() * 40;
      while (x < W) {
        const w = T[Math.floor(rnd() * T.length)];
        tctx.fillStyle = HI.has(w) ? (rnd() < .5 ? "#1F273F" : "#4774AE") : "#6D93C4";
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
    const ang = Math.atan2(1, 1.7), ux = Math.cos(ang), uy = Math.sin(ang), L = W * ux + H * uy;
    if (!text.width || !text.height) return; /* the panel is hidden or not laid out yet */
    bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.globalCompositeOperation = "source-over"; bctx.clearRect(0, 0, band.width, band.height);
    bctx.drawImage(text, 0, 0);
    bctx.globalCompositeOperation = "destination-in";
    const g = bctx.createLinearGradient(0, 0, ux * L * dpr, uy * L * dpr);
    const c1 = ((s / 16) % 1.4) - .2, c2 = (((s / 16) + .7) % 1.4) - .2;
    const a = p => { const d1 = Math.abs(p - c1), d2 = Math.abs(p - c2); const f = d => Math.max(0, 1 - d / .085); return Math.min(1, Math.pow(f(d1), 1.6) + .8 * Math.pow(f(d2), 1.6)); };
    for (let i = 0; i <= 48; i++) { const p = i / 48; g.addColorStop(p, "rgba(0,0,0," + a(p).toFixed(3) + ")"); }
    bctx.fillStyle = g; bctx.fillRect(0, 0, band.width, band.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalAlpha = .07; ctx.drawImage(text, 0, 0); ctx.globalAlpha = .55; ctx.drawImage(band, 0, 0); ctx.globalAlpha = 1;
    const fy = ctx.createLinearGradient(0, 0, 0, cv.height); fy.addColorStop(0, "rgba(250,250,250,1)"); fy.addColorStop(.2, "rgba(250,250,250,0)"); fy.addColorStop(.8, "rgba(250,250,250,0)"); fy.addColorStop(1, "rgba(250,250,250,1)");
    ctx.fillStyle = fy; ctx.fillRect(0, 0, cv.width, cv.height);
    if (!reduce && vis && document.visibilityState === "visible") raf = requestAnimationFrame(frame);
  }
  const start = () => { build(); last = 0; if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }).observe(host);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") start(); });
  addEventListener("pageshow", start);
  [cv, text, band].forEach(c => c.addEventListener("contextrestored", start));
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(start, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  start();
  /* >>> product hero 3d: text on the left, four screens in depth on the right (Ask, Connect, Understand, Decide), over a light grid */
  (function () {
    var hero = document.querySelector(".hero"); if (!hero || hero.classList.contains("hero-3d")) return;
    var gridEl = hero.querySelector(".hero-grid"); if (!gridEl) return;
    var css = document.createElement("style");
    css.textContent =
      "html body .hero.hero-3d{position:relative;overflow:hidden;background:#fff!important;text-align:left!important}" +
      "html body .hero.hero-3d > canvas#net,html body .hero.hero-3d > canvas.hero-bg{display:none!important}" +
      ".hero-3d .h3-grid,.hero-3d .h3-grid::before,.hero-3d .h3-grid::after{position:absolute;inset:0;pointer-events:none}" +
      ".hero-3d .h3-grid{z-index:0;background:radial-gradient(60% 55% at 66% 48%,#EEF3FB 0%,#F9FAFE 45%,#fff 80%)}" +
      ".hero-3d .h3-grid::before{content:'';background-image:linear-gradient(#DCE5F3 1px,transparent 1px),linear-gradient(90deg,#DCE5F3 1px,transparent 1px);background-size:64px 64px;background-position:center;-webkit-mask-image:radial-gradient(75% 70% at 64% 48%,#000 0%,rgba(0,0,0,.55) 45%,transparent 82%);mask-image:radial-gradient(75% 70% at 64% 48%,#000 0%,rgba(0,0,0,.55) 45%,transparent 82%)}" +
      ".hero-3d .h3-grid::after{content:'';background-image:linear-gradient(#9DB9E3 1px,transparent 1px),linear-gradient(90deg,#9DB9E3 1px,transparent 1px);background-size:64px 64px;background-position:center;-webkit-mask-image:radial-gradient(34% 32% at 66% 48%,#000 0%,transparent 100%);mask-image:radial-gradient(34% 32% at 66% 48%,#000 0%,transparent 100%)}" +
      ".hero-3d canvas.h3-dots{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0}" +
      "html body .hero.hero-3d .hero-grid{position:relative;z-index:1;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr)!important;grid-template-areas:'t s' 'a s'!important;column-gap:clamp(20px,4vw,64px)!important;row-gap:28px!important;align-items:center!important;justify-items:start!important;text-align:left!important;min-height:min(78vh,680px)}" +
      "html body .hero.hero-3d .hero-title:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){grid-area:t;align-self:end;text-align:left!important;margin:0!important;padding:0!important;width:100%!important;max-width:none!important;min-width:0!important;justify-self:stretch!important;display:block!important}" +
      "html body .hero.hero-3d .hero-title h1:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){text-align:left!important;margin:0!important;width:auto!important;max-width:none!important;white-space:normal!important;font-size:clamp(2.5rem,4.5vw,4.16rem)!important;line-height:1.04!important;text-wrap:balance}" +
      "html body .hero.hero-3d .hero-title h1 span:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){display:inline!important;white-space:normal!important;text-align:left!important;width:auto!important;margin:0!important}" +
      "html body .hero.hero-3d .hero-title h1 span.l1:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p#q){display:block!important}" +
      "html body .hero.hero-3d .hero-title .sub:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){text-align:left!important;margin:20px 0 0!important;width:auto!important;max-width:30em!important;justify-self:start!important}" +
      "html body .hero.hero-3d .hero-title:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p#q){justify-items:start!important}" +
      "html body .hero.hero-3d .hero-actions:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){grid-area:a;align-self:start;justify-content:flex-start!important;justify-self:start!important;margin:0!important;width:auto!important}" +
      ".hero-3d .h3-space{grid-area:s;position:relative;width:100%;height:min(60vh,540px);min-height:380px;perspective:1500px;perspective-origin:40% 45%}" +
      ".hero-3d .h3-stack{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .25s ease-out}" +
      ".hero-3d .h3-layer{all:unset;box-sizing:border-box;display:block;position:absolute;left:38%;top:52%;width:min(200%,920px);cursor:pointer;transform-style:preserve-3d;-webkit-backface-visibility:hidden;backface-visibility:hidden;background:#fff;color:#414A5E;border:2px solid #DFDFDF;border-radius:40px;box-shadow:0 80px 180px -80px rgba(31,39,63,.35),0 4px 12px rgba(31,39,63,.04);overflow:hidden;text-align:left;font-family:'Red Hat Text',Inter,sans-serif;transition:transform .8s cubic-bezier(.2,.7,.2,1),border-color .8s}" +
      ".hero-3d .h3-layer *{box-sizing:border-box}" +
      ".hero-3d .h3-layer::after{content:'';position:absolute;inset:0;background:#fff;opacity:var(--v,0);transition:opacity .8s;pointer-events:none}" +
      ".hero-3d .h3-layer:focus-visible{outline:4px solid #3A5292;outline-offset:6px}" +
      ".hero-3d .h3-hi{display:block;zoom:2;font-size:15.5px;line-height:1.5;text-rendering:geometricPrecision}" +
      ".hero-3d .h3-layer[data-pos='0']{transform:translate(-50%,-50%) translate3d(0,0,0) scale(.5);--v:0;cursor:default;border-color:#C9D8F2}" +
      ".hero-3d .h3-layer[data-pos='1']{transform:translate(-50%,-50%) translate3d(5.5%,-11%,-150px) scale(.5);--v:.42}" +
      ".hero-3d .h3-layer[data-pos='2']{transform:translate(-50%,-50%) translate3d(11%,-22%,-300px) scale(.5);--v:.66}" +
      ".hero-3d .h3-layer[data-pos='3']{transform:translate(-50%,-50%) translate3d(16.5%,-33%,-450px) scale(.5);--v:.82}" +
      ".hero-3d .h3-top{display:flex;align-items:center;gap:10px;padding:13px 18px;border-bottom:1px solid #EEF1F6;font-weight:500;font-size:14px;color:#1F273F}" +
      ".hero-3d .h3-top i{width:24px;height:24px;border-radius:7px;background:#1F273F;color:#fff;display:grid;place-items:center;font:700 13px/1 'Red Hat Display',sans-serif;font-style:normal}" +
      ".hero-3d .h3-top em{margin-left:auto;font-style:normal;font-size:12.5px;font-weight:600;color:#3A5292}" +
      ".hero-3d .h3-pad{padding:18px;display:grid;gap:12px}.hero-3d .h3-pad b{color:#1F273F;font-weight:600}" +
      ".hero-3d .h3-q{justify-self:end;max-width:90%;padding:9px 14px;border-radius:16px;background:#EEF1F6;color:#1F273F}" +
      ".hero-3d .h3-think{display:flex;align-items:center;gap:6px;color:#5B6478;font-size:.93em}.hero-3d .h3-think span{width:7px;height:7px;border-radius:50%;background:#3A5292;animation:h3bl 1.2s infinite}.hero-3d .h3-think span:nth-child(2){animation-delay:.15s}.hero-3d .h3-think span:nth-child(3){animation-delay:.3s;margin-right:6px}@keyframes h3bl{0%,60%,100%{opacity:.25}30%{opacity:1}}" +
      ".hero-3d .h3-chips{display:grid;gap:7px}.hero-3d .h3-chips span{padding:9px 13px;border:1px solid #DFDFDF;border-radius:12px;font-size:.92em;color:#1F273F}" +
      ".hero-3d .h3-rows{display:grid;gap:9px}.hero-3d .h3-rows > span{display:grid;grid-template-columns:12px 1fr;gap:12px;align-items:start;padding:11px 13px;border:1px solid #DFDFDF;border-radius:13px;font-size:.93em}.hero-3d .h3-rows i{width:12px;height:12px;border-radius:50%;margin-top:6px}.hero-3d .h3-rows i.a{background:#1F273F}.hero-3d .h3-rows i.b{background:#3A5292}.hero-3d .h3-rows i.c{background:#80AADC}.hero-3d .h3-rows b{display:block}" +
      ".hero-3d .h3-gap{display:grid;gap:2px;padding:11px 13px;border-radius:12px;background:#E3EBF8;color:#1F273F;font-size:.93em}.hero-3d .h3-gap b{font-size:.86em;color:#3A5292}" +
      ".hero-3d .h3-bt{font:600 17px/1.25 'Red Hat Display',sans-serif;color:#1F273F}.hero-3d .h3-meta{font-size:.84em;color:#5B6478;margin-top:-8px}" +
      ".hero-3d .h3-find{display:grid}.hero-3d .h3-find > span{padding:10px 0;border-top:1px solid #EEF1F6;display:grid;gap:2px}.hero-3d .h3-find em{font-style:normal;font-size:.8em;font-weight:600;color:#3A5292}" +
      ".hero-3d .h3-nav{position:absolute;left:0;right:0;bottom:-6px;display:flex;justify-content:center;gap:8px;z-index:3}.hero-3d .h3-nav button{all:unset;cursor:pointer;width:8px;height:8px;border-radius:8px;background:#C9D8F2;transition:width .25s,background .25s}.hero-3d .h3-nav button[aria-current=true]{width:26px;background:#1F273F}.hero-3d .h3-nav button:focus-visible{outline:2px solid #3A5292;outline-offset:3px}" +
      "@media (max-width:860px){html body .hero.hero-3d .hero-grid{grid-template-columns:1fr!important;grid-template-areas:'t' 'a' 's'!important;min-height:0;row-gap:22px!important}.hero-3d .h3-space{height:min(52vh,430px);min-height:330px;margin:8px 0 34px}.hero-3d .h3-layer{width:min(160%,760px);left:44%;top:55%}.hero-3d .h3-hi{font-size:14.5px}.hero-3d .h3-layer[data-pos='1']{transform:translate(-50%,-50%) translate3d(4%,-9%,-130px) scale(.5)}.hero-3d .h3-layer[data-pos='2']{transform:translate(-50%,-50%) translate3d(8%,-18%,-260px) scale(.5)}.hero-3d .h3-layer[data-pos='3']{transform:translate(-50%,-50%) translate3d(12%,-27%,-390px) scale(.5)}.hero-3d .h3-nav{bottom:-30px}}" +
      "@media (prefers-reduced-motion:reduce){.hero-3d .h3-layer,.hero-3d .h3-stack{transition:none}.hero-3d .h3-think span{animation:none;opacity:.7}}";
    document.head.appendChild(css);
    hero.classList.add("hero-3d");
    var g = document.createElement("div"); g.className = "h3-grid"; g.setAttribute("aria-hidden", "true");
    var cv = document.createElement("canvas"); cv.className = "h3-dots"; cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(cv, hero.firstChild); hero.insertBefore(g, hero.firstChild);
    var top = function (t, k) { return '<span class="h3-top"><i>V</i>' + t + "<em>" + k + "</em></span>"; };
    var L = [
      ["Ask: a sample question", top("Verisavo Assistant", "Ask") + '<span class="h3-pad"><span class="h3-q">Why are our sales falling in Lagos?</span><span class="h3-think"><span></span><span></span><span></span>Reading what is known about Lagos</span><span class="h3-chips"><span>Why are smaller shops running out?</span><span>What if we matched the rival’s price?</span></span></span>'],
      ["Connect: the sources brought together", top("What Verisavo brings together", "Connect") + '<span class="h3-pad"><span class="h3-rows"><span><i class="a"></i><span><b>Company data</b>Sales to small shops fell 18% in six weeks.</span></span><span><i class="b"></i><span><b>Public records</b>No change in duty or tax this quarter.</span></span><span><i class="c"></i><span><b>Evidence from the ground</b>In 15 of 19 shops visited, a cheaper rival was on the shelf.</span></span></span></span>'],
      ["Understand: a sample answer", top("Verisavo Assistant", "Understand") + '<span class="h3-pad"><span>Your product is <b>holding up in larger stores</b> but losing ground in smaller shops and open markets, where a cheaper rival is easier to find.</span><span class="h3-gap"><b>Still unknown</b>What the rival is offering retailers to win the shelf space.</span></span>'],
      ["Decide: a sample briefing", top("Investigation briefing", "Decide") + '<span class="h3-pad"><span class="h3-bt">Detergent sales slowdown in Kano</span><span class="h3-meta">From 19 verified SavoScout responses</span><span class="h3-find"><span>A rival 500g pack sells for about 16% less.<em>High confidence</em></span><span>Next step: restore weekly van delivery to small shops.<em>Recommended</em></span></span></span>']
    ];
    var NAMES = ["Ask", "Connect", "Understand", "Decide"];
    var space = document.createElement("div"); space.className = "h3-space";
    space.innerHTML = '<div class="h3-stack">' + L.map(function (l, i) { return '<button type="button" class="h3-layer" data-pos="' + i + '" aria-label="' + l[0] + '"><span class="h3-hi">' + l[1] + "</span></button>"; }).join("") + '</div><div class="h3-nav" role="group" aria-label="Choose a screen">' + NAMES.map(function (n, i) { return '<button type="button" aria-label="' + n + '" data-go="' + i + '"></button>'; }).join("") + "</div>";
    gridEl.appendChild(space);
    var layers = [].slice.call(space.querySelectorAll(".h3-layer")), dots = [].slice.call(space.querySelectorAll(".h3-nav button")), stack = space.querySelector(".h3-stack");
    var front = 0, timer = null, busy = false, reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    function show(k) {
      front = (k + layers.length) % layers.length;
      layers.forEach(function (l, i) { var pos = (i - front + layers.length) % layers.length; l.setAttribute("data-pos", pos); l.style.zIndex = String(10 - pos); l.tabIndex = pos === 0 ? -1 : 0; });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", String(i === front)); });
    }
    function auto() { clearInterval(timer); if (reduce) return; timer = setInterval(function () { if (!busy && !document.hidden && hero.getClientRects().length) show(front + 1); }, 4600); }
    layers.forEach(function (l, i) { l.addEventListener("click", function () { if (i !== front) { show(i); auto(); } }); });
    dots.forEach(function (d) { d.addEventListener("click", function () { show(+d.getAttribute("data-go")); auto(); }); });
    space.addEventListener("pointerenter", function () { busy = true; }); space.addEventListener("pointerleave", function () { busy = false; });
    space.addEventListener("focusin", function () { busy = true; }); space.addEventListener("focusout", function () { busy = false; });
    show(0); auto();
    var px = 0, py = 0;
    function lean() { stack.style.transform = "rotateY(" + (-18 + px * 8).toFixed(2) + "deg) rotateX(" + (7 - py * 6).toFixed(2) + "deg)"; }
    if (reduce) stack.style.transform = "rotateY(-10deg) rotateX(4deg)";
    else { lean(); hero.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; var r = hero.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 2 - 1; py = (e.clientY - r.top) / r.height * 2 - 1; lean(); }); }
    /* light and dark blue points drifting slowly */
    var ctx = cv.getContext("2d"), W = 0, H = 0, pts = [], n;
    for (n = 0; n < 90; n++) pts.push({ x: (Math.random() * 2 - 1) * 1.6, y: (Math.random() * 2 - 1) * 1.1, z: Math.random(), r: Math.random() < .12 ? 1.9 : 1, c: Math.random() < .4 ? "58,82,146" : "128,170,220" });
    function size() { W = hero.clientWidth; H = hero.clientHeight; var d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0); }
    function draw() {
      if (hero.getClientRects().length && W) {
        ctx.clearRect(0, 0, W, H); var f = Math.min(W, H) * .9;
        for (var k = 0; k < pts.length; k++) {
          var q = pts[k]; if (!reduce) { q.z -= .0008; if (q.z <= .02) q.z += 1; }
          var sx = W / 2 + (q.x - px * .05) / q.z * f * .5, sy = H * .45 + (q.y - py * .05) / q.z * f * .5; if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
          ctx.fillStyle = "rgba(" + q.c + "," + (Math.min(1, (1 - q.z) * 1.4) * .8).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(sx, sy, q.r * (2.4 - q.z * 1.4), 0, 6.2832); ctx.fill();
        }
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); draw(); window.addEventListener("resize", function () { size(); if (reduce) draw(); }); setTimeout(size, 600);
  })();
  /* <<< product hero 3d */
}
