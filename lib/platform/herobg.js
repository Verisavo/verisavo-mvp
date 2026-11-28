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
      ".hero-3d .h3-think{display:flex;align-items:center;gap:6px;color:#5B6478;font-size:.93em}.hero-3d .h3-think span{width:7px;height:7px;border-radius:50%;background:#3A5292}.hero-3d .h3-think span:nth-child(3){margin-right:6px}@keyframes h3bl{0%,60%,100%{opacity:.25}30%{opacity:1}}" +
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
  /* >>> answer tiles 3d: the Inside a Verisavo answer screens lean back and sit small as they arrive, then turn to face you and zoom in as they reach the middle of the screen */
  (function () {
    var vis = [].slice.call(document.querySelectorAll(".ax-gal .oh-vis")); if (!vis.length || vis[0].classList.contains("oh3")) return;
    var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p)";
    var css = document.createElement("style");
    css.textContent =
      "html body .ax-gal .oh-vis.oh3" + N + "{transform-origin:50% 60%;backface-visibility:hidden;box-shadow:0 calc(var(--o3d,0) * 34px + 6px) calc(var(--o3d,0) * 60px + 14px) calc(var(--o3d,0) * -26px - 8px) rgba(31,39,63,.32);transition:box-shadow .2s linear}" +
      "html body .ax-gal .oh-tile.in .oh-vis.oh3 .oh-panel" + N + "{animation:none!important;transform:translate3d(0,var(--opy,0px),0) scale(var(--ops,1))}" +
      "html body .ax-gal .oh-vis.oh3 .oh-panel" + N + "{transform:translate3d(0,var(--opy,0px),0) scale(var(--ops,1))}" +
      /* screens drawn crisp, in the site's white card style */
      "html body .ax-gal .oh-vis.oh3" + N + "{background:radial-gradient(ellipse 70% 60% at 50% 45%,#FCFCFC 0%,#EDF2F8 55%,#E3EAF3 100%)!important;-webkit-font-smoothing:antialiased}" +
      "html body .ax-gal .oh-vis.oh3" + N + "::before,html body .ax-gal .oh-vis.oh3" + N + "::after{display:none!important}" +
      "html body .ax-gal .oh-vis.oh3 .oh-panel" + N + "{background:#fff!important;box-shadow:0 0 0 1px #DFDFDF,0 -1px 0 #fff inset,0 28px 56px -26px rgba(58,82,146,.45)!important}" +
      "html body .ax-gal .oh-ch" + N + "{shape-rendering:geometricPrecision;text-rendering:geometricPrecision}" +
      "html body .ax-gal .oh-pt" + N + "{color:#5B6478!important}" + "html body .ax-gal .oh-find" + N + "{color:#1F273F!important}" +
      "html body .ax-gal .oh-steps li" + N + "{background:#fff!important;box-shadow:0 0 0 1px #DFDFDF,0 8px 18px -14px rgba(58,82,146,.45)!important}" +
      "html body .ax-gal .oh-sl :is(svg,path,circle)" + N + "{stroke:#3A5292!important}" +
      "html body .ax-gal .oh-ln" + N + "{stroke:#3A5292!important;stroke-width:2.4!important}" +
      "html body .ax-gal .oh-band" + N + "{fill:#E3EBF8!important}" + "html body .ax-gal .oh-bandt" + N + "{fill:#3A5292!important;font-weight:600}" +
      "html body .ax-gal .oh-ax" + N + "{stroke:#C9D8EE!important}" +
      "html body .ax-gal .oh-mk" + N + "{fill:#fff!important;stroke:#3A5292!important;stroke-width:2.4!important}" +
      "html body .ax-gal .oh-pill rect" + N + "{fill:#fff!important;stroke:#C9D8EE;stroke-width:1;filter:drop-shadow(0 6px 10px rgba(58,82,146,.18))!important}" + "html body .ax-gal .oh-pill text" + N + "{fill:#1F273F!important;font-weight:600!important}" +
      "html body .ax-gal .oh-hub rect" + N + "{fill:#1F273F!important}" + "html body .ax-gal .oh-hl" + N + "{stroke:#9DB9E3!important;stroke-width:1.8!important}" +
      "html body .ax-gal .oh-zone" + N + "{fill:rgba(227,235,248,.45)!important;stroke:#9DB9E3!important}" + "html body .ax-gal .oh-zonet" + N + "{fill:#3A5292!important}" +
      "html body .ax-gal .oh-wo" + N + "{fill:#1F273F!important}" + "html body .ax-gal .oh-wi" + N + "{fill:#80AADC!important}" + "html body .ax-gal .oh-e" + N + "{stroke:#80AADC!important}" +
      /* the extra motion inside each screen */
      "html body .ax-gal .oh-tl:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:12px!important;font-weight:500!important;fill:#5B6478!important}html body .ax-gal .oh-bandt:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p),html body .ax-gal .oh-zonet:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){fill:#3A5292!important;font-weight:600!important}html body .ax-gal .oh-pill text:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:12px!important}html body .ax-gal .oh-hub text:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:13px!important}" +
      "html body .ax-gal .oh-pt:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:.9rem!important}html body .ax-gal .oh-find:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:.95rem!important}html body .ax-gal .oh-tile.p1 .oh-panel:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){max-width:370px!important}html body .ax-gal .oh-vis.oh3 .oh-panel-c:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){padding:16px 16px 18px!important;border-radius:18px 18px 0 0!important;align-items:center!important;align-content:center!important}html body .ax-gal .oh-steps li:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:.86rem!important}html body .ax-gal .oh-sn:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){color:#1F273F!important}html body .ax-gal .oh-sl:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){color:#3D4559!important}html body .ax-gal .oh-i:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){width:14px!important;height:14px!important}" +
      "@keyframes oh3Area{0%,6%{clip-path:inset(0 100% 0 0);opacity:1}38%,86%{clip-path:inset(0 0 0 0);opacity:1}96%,100%{clip-path:inset(0 0 0 0);opacity:0}}@keyframes oh3Ring{0%{r:5;opacity:.55}100%{r:18;opacity:0}}@keyframes oh3Ants{to{stroke-dashoffset:-20}}@keyframes oh3Hub{0%{stroke-width:0;stroke-opacity:.5}100%{stroke-width:18;stroke-opacity:0}}" +
      "html body .ax-gal .oh3-area" + N + "{fill:url(#oh3g);clip-path:inset(0 100% 0 0)}" + "html body .ax-gal .oh-tile.in .oh3-area" + N + "{animation:oh3Area 7s cubic-bezier(.45,0,.2,1) infinite}" +
      "html body .ax-gal .oh3-ring" + N + "{fill:none;stroke:#3A5292;stroke-width:1.5;opacity:0}" + "html body .ax-gal .oh-tile.in .oh3-ring" + N + "{animation:oh3Ring 1.8s ease-out infinite}" +
      "html body .ax-gal .oh-tile.in .oh-zone" + N + "{animation:oh3Ants 1.6s linear infinite}" +
      "html body .ax-gal .oh3-hubr" + N + "{fill:none;stroke:#3A5292;stroke-width:0}" + "html body .ax-gal .oh-tile.in .oh3-hubr" + N + "{animation:oh3Hub 2.2s ease-out infinite}" +
      "html body .ax-gal .oh3-dot" + N + "{fill:#3A5292}" +
      "@media (prefers-reduced-motion:reduce){html body .ax-gal :is(.oh3-area,.oh3-ring,.oh3-hubr,.oh-zone)" + N + "{animation:none!important;clip-path:none!important}html body .ax-gal .oh3-dot" + N + "{display:none}html body .ax-gal .oh-vis.oh3" + N + "{transform:none!important}html body .ax-gal .oh-vis.oh3 .oh-panel" + N + "{transform:none!important}}";
    document.head.appendChild(css);
    var NS = "http://www.w3.org/2000/svg", mk = function (tag, at) { var el = document.createElementNS(NS, tag); for (var k in at) el.setAttribute(k, at[k]); return el; };
    var ln = document.querySelector(".ax-gal .oh-tile.p2 .oh-ln");
    if (ln) { var sv = ln.ownerSVGElement, df = mk("defs", {}), lg = mk("linearGradient", { id: "oh3g", x1: "0", y1: "0", x2: "0", y2: "1" }); lg.appendChild(mk("stop", { offset: "0", "stop-color": "#3A5292", "stop-opacity": ".22" })); lg.appendChild(mk("stop", { offset: "1", "stop-color": "#3A5292", "stop-opacity": "0" })); df.appendChild(lg); sv.insertBefore(df, sv.firstChild);
      sv.insertBefore(mk("path", { "class": "oh3-area", d: ln.getAttribute("d") + " L380 190 L34 190 Z" }), ln);
      var m = sv.querySelector(".oh-mk"); if (m) sv.insertBefore(mk("circle", { "class": "oh3-ring", cx: m.getAttribute("cx"), cy: m.getAttribute("cy"), r: "5" }), m); }
    var hub = document.querySelector(".ax-gal .oh-tile.p3 .oh-hub rect");
    if (hub) { var s3 = hub.ownerSVGElement, hr = hub.cloneNode(); hr.setAttribute("class", "oh3-hubr"); hub.parentNode.insertBefore(hr, hub);
      [].forEach.call(s3.querySelectorAll(".oh-hl"), function (h, i) { var d = h.getAttribute("d").match(/M(\S+) (\S+) L(\S+) (\S+)/); if (!d) return; var c = mk("circle", { "class": "oh3-dot", r: "3.2" }), am = mk("animateMotion", { dur: "2.4s", begin: (i * .8) + "s", repeatCount: "indefinite", path: "M" + d[3] + " " + d[4] + " L" + d[1] + " " + d[2] }); c.appendChild(am); s3.insertBefore(c, s3.querySelector(".oh-hub")); }); }
    var mt = document.querySelector(".ax-gal .oh-tile.p4 .oh-mkt");
    if (mt) mt.parentNode.insertBefore(mk("circle", { "class": "oh3-ring", cx: mt.getAttribute("cx"), cy: mt.getAttribute("cy"), r: "7" }), mt);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduce) return;
    var px = 0, py = 0, hov = null, raf = 0;
    vis.forEach(function (v, i) {
      v.classList.add("oh3");
      v.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; var r = v.getBoundingClientRect(); hov = v; px = (e.clientX - r.left) / r.width * 2 - 1; py = (e.clientY - r.top) / r.height * 2 - 1; tick(); });
      v.addEventListener("pointerleave", function () { hov = null; px = py = 0; tick(); });
    });
    function tick() { if (!raf) raf = requestAnimationFrame(draw); }
    function draw() {
      raf = 0; var vh = innerHeight, small = innerWidth < 700;
      vis.forEach(function (v, i) {
        var r = v.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
        var side = small ? (i % 2 ? -1 : 1) : ((r.left + r.width / 2) < innerWidth / 2 ? 1 : -1);
        var t = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
        var a = Math.max(0, Math.min(1, (Math.abs(t) - .3) / .7)), e = a * a * (3 - 2 * a);           /* 0 at the middle of the screen, 1 at the edges */
        var rx = Math.sign(t) * (small ? 12 : 16) * e, ry = side * (small ? 8 : 14) * e, sc = 1 - (small ? .06 : .1) * e;
        if (hov === v) { rx += -py * 6; ry += px * 8; }
        v.style.transform = (e < .01 && hov !== v) ? "none" : "perspective(1300px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
        v.style.setProperty("--o3d", (1 - e).toFixed(3));
        var p = v.querySelector(".oh-panel"); if (p) { p.style.setProperty("--opy", (t * 26).toFixed(1) + "px"); p.style.setProperty("--ops", (1 + .05 * (1 - e)).toFixed(4)); }
      });
    }
    addEventListener("scroll", tick, { passive: true }); addEventListener("resize", tick); draw(); setTimeout(draw, 300);
  })();
  /* <<< answer tiles 3d */
  /* >>> comparison labels: smaller row titles in the General AI and Verisavo table */
  (function () {
    if (document.getElementById("vsx-q-sm")) return; var st = document.createElement("style"); st.id = "vsx-q-sm";
    st.textContent = "html body #platform .vsx .vsx-q:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:clamp(.95rem,.9rem + .15vw,1.0625rem)!important;font-weight:600!important;line-height:1.35!important}@media (max-width:820px){html body #platform .vsx .vsx-q:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){font-size:.75rem!important}}";
    document.head.appendChild(st);
  })();
  /* <<< comparison labels */
  /* >>> product closing like home: the Ready to understand your market panel set out like the homepage's closing panel, with the white Request a demo button */
  (function () {
    if (document.getElementById("wa-home")) return; var st = document.createElement("style"); st.id = "wa-home";
    var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p)", P = "html body #whatsapp";
    st.textContent =
      P + " .wrap" + N + "{padding:0 40px!important;max-width:none!important}" +
      P + " .wa-card" + N + "{position:relative;overflow:hidden;max-width:1360px;margin:0 auto;border-radius:36px!important;padding:48px 64px!important;background:#1F273F!important;text-align:center}" +
      P + " .wa-card" + N + "::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(177,197,223,.22) 1px,transparent 1.2px);background-size:22px 22px;-webkit-mask-image:radial-gradient(70% 70% at 50% 50%,#000 0%,transparent 75%);mask-image:radial-gradient(70% 70% at 50% 50%,#000 0%,transparent 75%)}" +
      P + " .wa-copy" + N + "{position:relative;display:grid;justify-items:center}" +
      P + " .wa-eb" + N + "{display:none!important}" +
      P + " h2" + N + "{margin:0!important;font-size:clamp(2rem,1.4rem + 2vw,2.8rem)!important;font-weight:500!important;line-height:1.04!important;letter-spacing:-.035em!important;color:#A8C6E8!important;-webkit-text-fill-color:#A8C6E8!important}" +
      P + " .wa-p" + N + "{margin:16px 0 0!important;max-width:580px;font-size:clamp(1rem,.9rem + .35vw,1.25rem)!important;line-height:1.55!important;color:#CCDDF1!important;-webkit-text-fill-color:#CCDDF1!important}" +
      P + " .wa-ctas" + N + "{display:flex!important;flex-wrap:wrap;justify-content:center;gap:10px!important;margin-top:40px!important}" +
      P + " .wa-btn" + N + "{min-height:52px!important;height:52px!important;padding:0 26px!important;border-radius:999px!important;font-size:15px!important;font-weight:600!important;display:inline-flex!important;align-items:center;justify-content:center;background:#fff!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important;border:1px solid #fff!important;box-shadow:none!important}" +
      P + " .wa-btn.wa-btn2" + N + "{background:transparent!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid rgba(255,255,255,.6)!important}" +
      P + " .wa-btn" + N + ":hover{background:#E3EBF8!important}" + P + " .wa-btn.wa-btn2" + N + ":hover{background:rgba(255,255,255,.08)!important}" +
      "@media (max-width:40rem){" + P + " .wrap" + N + "{padding:0 12px!important}" + P + " .wa-card" + N + "{border-radius:24px!important;padding:40px 20px!important}" + P + " .wa-ctas" + N + "{width:100%}" + P + " .wa-btn" + N + "{flex:1 1 auto;padding:0 18px!important}}";
    document.head.appendChild(st);
  })();
  /* <<< product closing like home */
  /* >>> investigation steps 3d: the four SavoScout steps in 3D, played in order. The current step comes forward; the others wait in depth. Tap a step, use the arrows, swipe or the arrow keys */
  (function () {
    var ol = document.querySelector("#investigate .ps-steps"); if (!ol || ol.classList.contains("ps3")) return;
    var items = [].slice.call(ol.children); if (items.length < 2) return;
    var MODE = "map"; ol.classList.add("ps3", "ps3-" + MODE);
    var N = ":not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p#q#r#s#t#u#v)", P = "html body #investigate .ps-steps.ps3";
    var I = "!important";
    var css = document.createElement("style");
    css.textContent =
      P + N + "{display:block" + I + ";position:relative" + I + ";max-width:1120px" + I + ";margin:0 auto" + I + ";perspective:1500px;-webkit-font-smoothing:antialiased}" + P + N + "::before{display:none" + I + "}" +
      P + " > li" + N + "{position:absolute" + I + ";box-sizing:border-box" + I + ";margin:0" + I + ";background:#fff" + I + ";border:1px solid #DFDFDF" + I + ";box-shadow:0 1px 2px rgba(31,39,63,.04),0 26px 50px -30px rgba(58,82,146,.45)" + I + ";cursor:pointer;user-select:none;-webkit-user-select:none;transform:var(--t3)" + I + ";opacity:var(--o3,1)" + I + ";transition:transform .75s cubic-bezier(.2,.8,.2,1),opacity .5s ease,box-shadow .5s ease,background-color .4s" + I + ";animation:none" + I + "}" +
      P + " > li.ps3-on" + N + "{cursor:default;box-shadow:0 1px 2px rgba(31,39,63,.04),0 40px 80px -36px rgba(58,82,146,.55)" + I + "}" +
      P + " .ps-n" + N + "{background:#fff" + I + ";color:#1F273F" + I + ";box-shadow:0 0 0 1px #C9D8EE,0 0 0 5px #F3F6FB" + I + ";transition:background .4s,color .4s" + I + "}" +
      P + " li.ps3-on .ps-n," + P + " li.ps3-done .ps-n" + N + "{background:#1F273F" + I + ";color:#fff" + I + ";box-shadow:0 0 0 5px #E3EBF8" + I + "}" +
      P + " h3" + N + "{color:#1F273F" + I + "}" + P + " p" + N + "{color:#5B6478" + I + "}" +
      /* A: a staircase. Steps rise from left to right on a tilted floor; the current one stands up to face you */
      P + ".ps3-stair" + N + "{height:clamp(340px,30vw,380px)" + I + ";perspective-origin:50% 0%}" +
      P + ".ps3-stair > li" + N + "{left:50%" + I + ";top:0" + I + ";width:min(300px,25%)" + I + ";min-height:230px;padding:24px" + I + ";border-radius:20px" + I + ";transform-origin:50% 100%}" +
      /* B: a flip board. One large card turns over on its top edge to show the next step; tabs above */
      P + ".ps3-flip" + N + "{height:clamp(300px,26vw,330px)" + I + ";perspective:1800px}" +
      P + ".ps3-flip > li" + N + "{left:50%" + I + ";top:64px" + I + ";width:min(720px,92%)" + I + ";min-height:220px;padding:clamp(28px,4vw,44px)" + I + ";border-radius:24px" + I + ";transform-origin:50% 0%;backface-visibility:hidden;display:grid" + I + ";grid-template-columns:auto 1fr;column-gap:28px;align-items:center" + I + "}" +
      P + ".ps3-flip .ps-n" + N + "{grid-row:1 / span 2;width:72px" + I + ";height:72px" + I + ";font-size:1.15rem" + I + "}" +
      P + ".ps3-flip h3" + N + "{font-size:clamp(1.35rem,1.1rem + .9vw,1.8rem)" + I + ";margin:0 0 8px" + I + "}" + P + ".ps3-flip p" + N + "{font-size:clamp(1rem,.95rem + .3vw,1.15rem)" + I + "}" +
      "html body #investigate .ps3-tabs" + N + "{position:absolute;left:0;right:0;top:0;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;z-index:20}" +
      "html body #investigate .ps3-tabs button" + N + "{all:unset;cursor:pointer;box-sizing:border-box;padding:9px 16px;border-radius:999px;background:#fff;border:1px solid #DFDFDF;color:#5B6478;font-size:.875rem;font-weight:600;transition:background .3s,color .3s,border-color .3s}" +
      "html body #investigate .ps3-tabs button[aria-current=true]" + N + "{background:#1F273F;color:#fff;border-color:#1F273F}" +
      /* C: a fan. The steps are held like a hand of cards; the current one rises straight up */
      P + ".ps3-fan" + N + "{height:clamp(360px,32vw,400px)" + I + "}" +
      P + ".ps3-fan > li" + N + "{left:50%" + I + ";top:20px" + I + ";width:min(300px,30%)" + I + ";min-height:250px;padding:26px" + I + ";border-radius:20px" + I + ";transform-origin:50% 160%}" +
      /* D: a turning cube. Each step is a face; moving on turns the block a quarter turn */
      P + ".ps3-cube" + N + "{height:clamp(280px,24vw,300px)" + I + ";perspective:1600px}" +
      P + ".ps3-cube > li" + N + "{left:50%" + I + ";top:20px" + I + ";width:var(--cw,560px)" + I + ";min-height:230px;padding:clamp(26px,3.4vw,40px)" + I + ";border-radius:22px" + I + ";backface-visibility:hidden;display:grid" + I + ";grid-template-columns:auto 1fr;column-gap:26px;align-items:center" + I + ";transition:transform .9s cubic-bezier(.65,0,.25,1),opacity .6s ease" + I + "}" +
      P + ".ps3-cube .ps-n" + N + "{grid-row:1 / span 2;width:64px" + I + ";height:64px" + I + ";font-size:1.05rem" + I + "}" +
      P + ".ps3-cube h3" + N + "{font-size:clamp(1.3rem,1.1rem + .8vw,1.7rem)" + I + ";margin:0 0 8px" + I + "}" + P + ".ps3-cube p" + N + "{font-size:clamp(1rem,.95rem + .3vw,1.12rem)" + I + "}" +
      /* E: a route on a map. The steps stand on a tilted map like pins along a route; the route draws to the current step */
      P + ".ps3-map" + N + "{height:clamp(400px,34vw,440px)" + I + ";perspective:1300px;perspective-origin:50% 10%}" +
      "html body #investigate .ps3-plane" + N + "{position:absolute;left:50%;top:150px;width:min(1000px,96%);height:300px;transform:translateX(-50%) rotateX(62deg);transform-origin:50% 0%;border-radius:28px;background:linear-gradient(#DCE5F3 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,#DCE5F3 1px,transparent 1px) 0 0/40px 40px,radial-gradient(ellipse at 50% 40%,#fff,#EEF3FB 70%);box-shadow:0 0 0 1px #DFDFDF,0 40px 60px -30px rgba(58,82,146,.35);pointer-events:none}" +
      "html body #investigate .ps3-plane svg" + N + "{position:absolute;inset:0;width:100%;height:100%;overflow:visible}" +
      "html body #investigate .ps3-route" + N + "{fill:none;stroke:#9DB9E3;stroke-width:1.6;stroke-dasharray:7 8;stroke-linecap:round}html body #investigate .ps3-seg" + N + "{fill:none;stroke:#3A5292;stroke-width:2;stroke-linecap:round;stroke-dasharray:1 1;stroke-dashoffset:1;transition:stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)}html body #investigate .ps3-seg.on" + N + "{stroke-dashoffset:0}" +
      "html body #investigate .ps3-pin" + N + "{fill:#fff;stroke:#9DB9E3;stroke-width:2;transition:fill .4s,stroke .4s .2s}html body #investigate .ps3-pin.on" + N + "{fill:#3A5292;stroke:#C9D8EE}" +
      P + ".ps3-map > li" + N + "{left:var(--px)" + I + ";top:var(--py)" + I + ";width:min(250px,23%)" + I + ";padding:18px 20px" + I + ";border-radius:16px" + I + ";transform-origin:50% 100%;gap:6px" + I + "}" +
      P + ".ps3-map > li" + N + "::after{content:'';position:absolute;left:50%;bottom:-11px;width:16px;height:16px;margin-left:-8px;background:#fff;border-right:1px solid #DFDFDF;border-bottom:1px solid #DFDFDF;transform:rotate(45deg);border-radius:0 0 4px 0}" +
      P + ".ps3-map > li:not(.ps3-on) p" + N + "{display:none" + I + "}" +
      /* F: a book. The current step is the right-hand page; moving on turns it over to the left like a page, so the step just done stays readable on the left */
      P + ".ps3-book" + N + "{height:clamp(320px,26vw,340px)" + I + ";perspective:2200px;perspective-origin:50% 30%}" +
      P + ".ps3-book" + N + "::after{content:''" + I + ";display:block" + I + ";position:absolute;left:50%;top:22px;width:min(900px,92%);height:280px;transform:translateX(-50%);border-radius:10px;background:linear-gradient(90deg,#F3F6FB 0,#fff 48%,#DCE5F3 50%,#fff 52%,#F3F6FB 100%);box-shadow:0 0 0 1px #DFDFDF,0 40px 60px -34px rgba(58,82,146,.5);z-index:0}" +
      P + ".ps3-book > li" + N + "{left:50%" + I + ";top:30px" + I + ";width:min(442px,45.5%)" + I + ";height:264px" + I + ";padding:0" + I + ";background:transparent" + I + ";border:0" + I + ";box-shadow:none" + I + ";transform-origin:0% 50%;transform-style:preserve-3d;transition:transform 1.05s cubic-bezier(.45,.05,.2,1)" + I + "}" +
      P + ".ps3-book .pg" + N + "{position:absolute;inset:0;box-sizing:border-box;padding:clamp(26px,3vw,40px);display:grid;gap:10px;align-content:start;background:#fff;border:1px solid #DFDFDF;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}" +
      P + ".ps3-book .pg-f" + N + "{border-radius:0 12px 12px 0;background:linear-gradient(90deg,#EEF1F6 0,#fff 9%)}" +
      P + ".ps3-book .pg-b" + N + "{border-radius:12px 0 0 12px;transform:rotateY(180deg);background:linear-gradient(270deg,#EEF1F6 0,#fff 9%)}" +
      P + ".ps3-book .pg-b .ps-n" + N + "{background:#1F273F" + I + ";color:#fff" + I + ";box-shadow:0 0 0 5px #E3EBF8" + I + "}" +
      P + ".ps3-book .pg::after" + N + "{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(31,39,63,var(--sh,0)),transparent 60%);transition:background .5s}" +
      P + ".ps3-book .ps-n" + N + "{width:44px" + I + ";height:44px" + I + ";margin-bottom:12px}" + P + ".ps3-book h3" + N + "{font-size:clamp(1.2rem,1rem + .6vw,1.5rem)" + I + ";margin:0" + I + "}" + P + ".ps3-book p" + N + "{font-size:clamp(.98rem,.95rem + .2vw,1.08rem)" + I + "}" +
      /* controls */
      "html body #investigate .ps3-ctl" + N + "{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:22px}" +
      "html body #investigate .ps3-ctl button" + N + "{all:unset;box-sizing:border-box;cursor:pointer}" +
      "html body #investigate .ps3-ar" + N + "{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;border:1px solid #DFDFDF;color:#1F273F;box-shadow:0 6px 16px -10px rgba(58,82,146,.5)}html body #investigate .ps3-ar:hover" + N + "{background:#E3EBF8}" +
      "html body #investigate .ps3-ar svg" + N + "{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
      "html body #investigate .ps3-bar" + N + "{position:relative;width:min(220px,40vw);height:4px;border-radius:4px;background:#DCE5F3;overflow:hidden}html body #investigate .ps3-bar i" + N + "{position:absolute;inset:0 auto 0 0;width:var(--pw,25%);background:#1F273F;border-radius:4px;transition:width .6s cubic-bezier(.2,.8,.2,1)}" +
      "html body #investigate .ps3-ctl button:focus-visible,html body #investigate .ps3-tabs button:focus-visible" + N + "{outline:2px solid #3A5292;outline-offset:3px}" +
      "html body #investigate" + N + "{overflow-x:clip" + I + "}" +
      "@media (max-width:40rem){html body #investigate .ps3-tabs" + N + "{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;scrollbar-width:none;padding:0 4px 6px;gap:6px}html body #investigate .ps3-tabs::-webkit-scrollbar{display:none}html body #investigate .ps3-tabs button" + N + "{flex:none;padding:8px 13px;font-size:.8125rem}" + P + ".ps3-stair" + N + "," + P + ".ps3-fan" + N + "{height:400px" + I + "}" + P + ".ps3-stair > li" + N + "," + P + ".ps3-fan > li" + N + "{width:74%" + I + ";min-height:250px}" + P + ".ps3-flip" + N + "{height:330px" + I + "}" + P + ".ps3-flip > li" + N + "{top:60px" + I + ";grid-template-columns:1fr;row-gap:14px}" + P + ".ps3-flip .ps-n" + N + "{grid-row:auto;width:56px" + I + ";height:56px" + I + "}}" +
      "@media (max-width:40rem){" + P + ".ps3-book" + N + "::after{width:84%;left:52%}" + P + ".ps3-book > li" + N + "{left:10%" + I + ";width:84%" + I + "}" + P + ".ps3-book" + N + "{perspective:1400px}}" +
      "@media (max-width:40rem){" + P + ".ps3-cube" + N + "{height:330px" + I + "}" + P + ".ps3-cube > li" + N + "{grid-template-columns:1fr;row-gap:14px;min-height:260px}" + P + ".ps3-cube .ps-n" + N + "{grid-row:auto;width:52px" + I + ";height:52px" + I + "}" + P + ".ps3-map" + N + "{height:480px" + I + "}" + P + ".ps3-map > li" + N + "::after{display:none}" + P + ".ps3-map > li" + N + "{width:58%" + I + "}html body #investigate .ps3-plane" + N + "{top:250px;height:220px}}" +
      "@media (prefers-reduced-motion:reduce){" + P + " > li" + N + "{transition:opacity .2s" + I + "}}";
    document.head.appendChild(css);
    var n = items.length, cur = 0, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, timer = 0, seen = false, held = false;
    if (MODE === "book") items.forEach(function (li) { var f = document.createElement("div"); f.className = "pg pg-f"; while (li.firstChild) f.appendChild(li.firstChild); var b = f.cloneNode(true); b.className = "pg pg-b"; b.setAttribute("aria-hidden", "true"); li.appendChild(f); li.appendChild(b); });
    items.forEach(function (li, i) { li.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch" && i !== cur) { hold(); show(i); } }); });
    items.forEach(function (li, i) { li.addEventListener("click", function () { if (i !== cur) { hold(); show(i); } }); });
    var tabs = null;
    if (MODE === "flip") { tabs = document.createElement("div"); tabs.className = "ps3-tabs"; tabs.innerHTML = items.map(function (li, i) { return '<button type="button">' + (li.querySelector("h3") ? li.querySelector("h3").textContent : i + 1) + "</button>"; }).join(""); ol.appendChild(tabs); [].forEach.call(tabs.children, function (b, i) { b.addEventListener("click", function () { hold(); show(i); }); }); }
    var PTS = [[.1,.78],[.37,.38],[.63,.7],[.9,.3]], rd = null, pins = [];
    if (MODE === "map") {
      var pl = document.createElement("div"); pl.className = "ps3-plane"; pl.setAttribute("aria-hidden", "true");
      pl.innerHTML = '<svg><path class="ps3-route"/>' + PTS.slice(1).map(function () { return '<path class="ps3-seg" pathLength="1"/>'; }).join("") + PTS.map(function () { return '<circle class="ps3-pin" r="6"/>'; }).join("") + "</svg>";
      ol.insertBefore(pl, ol.firstChild); pins = [].slice.call(pl.querySelectorAll(".ps3-pin")); rd = [].slice.call(pl.querySelectorAll(".ps3-seg"));
      var drawMap = function () { var W = pl.clientWidth, H = pl.clientHeight, sv = pl.querySelector("svg"); sv.setAttribute("viewBox", "0 0 " + W + " " + H); var xy = PTS.map(function (q) { return [q[0] * W, q[1] * H]; });
        pl.querySelector(".ps3-route").setAttribute("d", "M" + xy.map(function (p) { return p.join(" "); }).join(" L"));
        rd.forEach(function (sg, k) { sg.setAttribute("d", "M" + xy[k].join(" ") + " L" + xy[k + 1].join(" ")); });
        pins.forEach(function (c, k) { c.setAttribute("cx", xy[k][0]); c.setAttribute("cy", xy[k][1]); }); };
      drawMap(); addEventListener("resize", drawMap);
    }
    var ctl = document.createElement("div"); ctl.className = "ps3-ctl";
    ctl.innerHTML = '<button type="button" class="ps3-ar" aria-label="Previous step"><svg viewBox="0 0 16 16"><path d="M10 3L5 8l5 5"/></svg></button><span class="ps3-bar" aria-hidden="true"><i></i></span><button type="button" class="ps3-ar" aria-label="Next step"><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg></button>';
    ol.parentNode.insertBefore(ctl, ol.nextSibling);
    var ars = ctl.querySelectorAll(".ps3-ar"); ars[0].addEventListener("click", function () { hold(); show(cur - 1); }); ars[1].addEventListener("click", function () { hold(); show(cur + 1); });
    function place() {
      var small = innerWidth < 640;
      items.forEach(function (li, i) {
        var d = i - cur, t, o = 1, z = 10 - Math.abs(d);
        if (MODE === "flip" && tabs && small) { var tb = tabs.children[cur]; if (tb) tabs.scrollTo({ left: tb.offsetLeft - 20, behavior: "smooth" }); }
        if (MODE === "book") {
          t = d < 0 ? "rotateY(-180deg)" + (small ? "" : " translateZ(" + (-(i) * .5) + "px)") : "rotateY(0deg) translateZ(" + (-d * .5) + "px)";
          o = small && d < 0 ? 0 : 1; z = d < 0 ? 400 + i : d === 0 ? (back ? 600 : 300) : 100 - d;
          li.style.setProperty("--sh", d < 0 ? ".05" : "0");
          if (small) li.style.transition = d < 0 ? "transform 1.05s cubic-bezier(.45,.05,.2,1), opacity .3s ease .7s" : "";
        } else if (MODE === "cube") {
          var cw = Math.min(small ? innerWidth * .8 : 560, ol.clientWidth * .92); ol.style.setProperty("--cw", cw + "px");
          var ang = d * 90; if (ang > 180) ang -= 360; if (ang < -180) ang += 360;
          t = "translateX(-50%) translateZ(" + (-cw / 2) + "px) rotateY(" + ang + "deg) translateZ(" + (cw / 2) + "px)";
          o = Math.abs(d) > 1 ? 0 : d === 0 ? 1 : .55; z = 10 - Math.abs(d);
        } else if (MODE === "map") {
          var orr = ol.getBoundingClientRect(), pr = pins[i].getBoundingClientRect();
          li.style.setProperty("--px", (small ? orr.width / 2 : pr.left + pr.width / 2 - orr.left) + "px"); li.style.setProperty("--py", (pr.top + pr.height / 2 - orr.top) + "px");
          t = "translateX(-50%) translateY(-100%) translateY(-14px) scale(" + (d === 0 ? 1 : small ? .7 : .82) + ")" + (d === 0 ? " translateY(-10px)" : "");
          o = d === 0 ? 1 : small ? 0 : .9; z = d === 0 ? 20 : 10 - Math.abs(d);
        } else if (MODE === "stair") {
          if (small) t = d === 0 ? "translateX(-50%)" : "translateX(-50%) translateX(" + (d * 30) + "%) translateY(" + (Math.abs(d) * 14) + "px) translateZ(" + (-Math.abs(d) * 180) + "px) rotateY(" + (-d * 18) + "deg)";
          else { var x = (i - (n - 1) / 2) * 112; t = "translateX(-50%) translateX(" + x + "%) " + (d === 0 ? "translateY(-6px) translateZ(70px)" : "translateY(" + (40 - i * 12) + "px) rotateX(" + (d < 0 ? 40 : 32) + "deg) scale(.95)"); }
          o = small && Math.abs(d) > 1 ? 0 : d === 0 ? 1 : .82;
        } else if (MODE === "flip") {
          t = "translateX(-50%) " + (d === 0 ? "rotateX(0deg)" : d < 0 ? "rotateX(-100deg)" : "rotateX(0deg) translateZ(" + (-d * 40) + "px) translateY(" + (d * 10) + "px)");
          o = d < 0 ? 0 : d === 0 ? 1 : d === 1 ? .6 : 0; z = d < 0 ? 12 : 10 - d;
        } else {
          var ang = d * (small ? 14 : 16);
          t = "translateX(-50%) rotate(" + ang + "deg) " + (d === 0 ? "translateY(-18px) translateZ(60px)" : "translateZ(" + (-Math.abs(d) * 60) + "px) rotateY(" + (-d * 8) + "deg)");
          o = d === 0 ? 1 : small && Math.abs(d) > 1 ? 0 : .88;
        }
        if (reduce) t = MODE === "flip" ? "translateX(-50%)" : t;
        li.style.setProperty("--t3", t); li.style.setProperty("--o3", String(reduce && MODE === "flip" ? (d === 0 ? 1 : 0) : o)); li.style.zIndex = String(z);
        li.style.pointerEvents = (MODE === "flip" && d !== 0) || (+o === 0) ? "none" : "auto";
        li.classList.toggle("ps3-on", d === 0); li.classList.toggle("ps3-done", d < 0);
      });
      if (rd) { rd.forEach(function (sg, k) { sg.classList.toggle("on", k < cur); }); pins.forEach(function (p, i) { p.classList.toggle("on", i <= cur); }); }
      ctl.querySelector(".ps3-bar").style.setProperty("--pw", ((cur + 1) / n * 100) + "%");
      if (tabs) [].forEach.call(tabs.children, function (b, i) { b.setAttribute("aria-current", String(i === cur)); });
    }
    var back = false;
    function show(i) { var nx = (i % n + n) % n; back = nx < cur; cur = nx; place(); }
    /* plays through the steps on its own until someone takes over */
    function tick() { clearTimeout(timer); if (held || reduce || !seen) return; timer = setTimeout(function () { show(cur + 1); tick(); }, 3400); }
    function hold() { held = true; clearTimeout(timer); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; tick(); }, { threshold: .35 }).observe(ol);
    var sx = null; ol.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    ol.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) { hold(); show(cur + (dx < 0 ? 1 : -1)); } });
    document.getElementById("investigate").addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { e.preventDefault(); hold(); show(cur - 1); } if (e.key === "ArrowRight") { e.preventDefault(); hold(); show(cur + 1); } });
    addEventListener("resize", place); place();
  })();
  /* <<< investigation steps 3d */
}
