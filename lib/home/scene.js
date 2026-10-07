// 3D market scene, story chapters, inner pages, research and highlights
// Runs once in the browser after the page has rendered (see the page's client component).
export default function init() {
  (() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = id => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const sm = x => x * x * (3 - 2 * x);
  const band = (t, a, b, f) => Math.min(ramp(t, a, a + (f || .2)), 1 - ramp(t, b - (f || .2), b));
  let seed = 23;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rr = (a, b) => a + rnd() * (b - a);
  const wrap = (x, a, b) => { const w = b - a; return a + (((x - a) % w) + w) % w; };

  const stage = $("stage"), story = $("story"), ovl = $("ovl");
  const LAST = 9, UNIT = 1.15;
  let vw = 1, vh = 1, U = 1, T = 0, mobile = false;

  /* ===================== 3D SCENE ===================== */
  let gl = null;
  try { if (window.THREE) gl = buildScene(); } catch (e) { console.warn(e); gl = null; }
  if (!gl) document.body.classList.add("nogl");

  /* Recovering the 3D scene. Browsers can take a page's graphics away (a tab left in the background for a long time,
     low memory, Safari's limits). The canvas then turns black. Show the light fallback straight away, and if the
     browser does not hand the graphics back, rebuild the scene on a fresh canvas once the tab is visible again. */
  let glTimer = 0, glTries = 0;
  function onGLLost() { document.body.classList.add("nogl"); clearTimeout(glTimer); glTimer = setTimeout(rebuildGL, 1500); }
  function onGLRestored() { clearTimeout(glTimer); if (gl) gl.renderer.setClearColor(0xF5F8FC); document.body.classList.remove("nogl"); kick(); }
  function rebuildGL() {
    if (!gl || !gl.renderer.getContext().isContextLost()) return;
    if (document.hidden) { addEventListener("visibilitychange", function once() { if (!document.hidden) { removeEventListener("visibilitychange", once); rebuildGL(); } }); return; }
    if (++glTries > 3) return;   // keep the light fallback if the graphics keep failing
    const old = $("gl"), fresh = old.cloneNode(false); old.replaceWith(fresh);
    try { gl.renderer.dispose(); } catch (e) {}
    const saved = seed; seed = 23;   // same seed, so the rebuilt market looks the same
    try { gl = buildScene(); document.body.classList.remove("nogl"); measure(); kick(); }
    catch (e) { console.warn(e); }
    seed = saved;
  }

  function buildScene() {
    const canvas = $("gl");
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
      { d: .08, pts: [[-112, 34], [-112, 9], [-40, 8.5], [40, 8.5], [88, 8.5], [89, -30], [96, -50], [104, -62]] },
      { d: .14, pts: [[230, -8.5], [160, -8.5], [96, -8.5], [94, -30], [100, -50], [150, -50], [158, -40]] },
      { d: .05, pts: [[92, -190], [92, -110], [92, -58], [118, -52], [150, -52], [164, -72]] },
      { d: .11, pts: [[124, 22], [110, 11], [93, 2], [93, -46], [134, -48], [138, -38]] },
      { d: .17, pts: [[-60, -170], [-60, -12], [40, -9], [86, -9], [91, -40], [98, -52], [114, -70]] }
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
      r2.setPixelRatio(1.5); r2.setSize(420, 280, false); r2.setClearColor(PAPER);
      const cam = new THREE.PerspectiveCamera(34, 1.5, 1, 1200);
      // draw every line fully, even if the page-load reveal is still running
      const saved = reveal.map(l => [l.lines && l.lines.geometry.drawRange.count, l.sk && l.sk.geometry.drawRange.count, l.fillMat.opacity]);
      reveal.forEach(l => { if (l.lines) l.lines.geometry.setDrawRange(0, Infinity); if (l.sk) l.sk.geometry.setDrawRange(0, Infinity); l.fillMat.opacity = 1; });
      const out = views.map(([t, p]) => { cam.position.set(p[0], p[1], p[2]); cam.lookAt(t[0], t[1], t[2]); r2.render(scene, cam); return cv.toDataURL("image/jpeg", .86); });
      reveal.forEach((l, i) => { if (l.lines) l.lines.geometry.setDrawRange(0, saved[i][0]); if (l.sk) l.sk.geometry.setDrawRange(0, saved[i][1]); l.fillMat.opacity = saved[i][2]; });
      r2.dispose(); if (r2.forceContextLoss) r2.forceContextLoss();
      return out;
    }
    return { renderer, scene, camera, L, fogBox, gapLine, routes, people, bodies, heads, loads, vehicles, arc, reveal, GAP, snapshots };
  }

  /* ===================== LABELS ===================== */
  const H$ = html => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const ST = { fact: ["st-fact", "Fact"], inf: ["st-inf", "Inference"], hyp: ["st-hyp", "Hypothesis"], unk: ["st-unk", "Unknown"] };
  const V3 = p => ({ x: p[0], y: p[1], z: p[2] });
  function sparkPath(v) { const mx = Math.max(...v), mn = Math.min(...v); const pts = v.map((y, i) => [2 + i * (40 / (v.length - 1)), 12 - (y - mn) / ((mx - mn) || 1) * 10]); return `<path d="M${pts.map(p => p.map(n => n.toFixed(1)).join(" ")).join("L")}"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2"/>`; }
  const labels = [];
  function label(o) {
    const st = ST[o.st], cls = o.cls || "";
    const meta = (o.meta || st) ? `<div class="mw"><div class="meta">${st ? `<span class="chip ${st[0]}">${st[1]}</span>` : ""}${o.meta ? `<span>${o.meta}</span>` : ""}</div></div>` : "";
    const mark = cls.includes("unk") ? "?" : (cls.includes("ver") || cls.includes("sum")) ? "✓" : "+";
    const el = H$(`<div class="lb ${cls}${o.off ? " off" : ""}"><span class="stem"></span>${o.off ? '<span class="lead"></span>' : ""}<span class="pin"></span><div class="box"><div class="row">${o.k ? `<span class="k">${o.k}</span>` : ""}<span>${o.t}</span>${o.spark ? `<svg class="spark" viewBox="0 0 44 14">${sparkPath(o.spark)}</svg>` : ""}<span class="plus">${mark}</span></div>${meta}</div></div>`);
    ovl.appendChild(el);
    const l = Object.assign({ el, box: el.querySelector(".box"), leadEl: el.querySelector(".lead"), v: V3(o.p), op: 0, w: null, shift: 0, ox: (rnd() * 2 - 1) * 26, oy: (rnd() * 2 - 1) * 14 }, o);
    labels.push(l); return l;
  }
  const P = {
    visib: [-111, 4.8, 40], price: [-24, 3.2, 35], promo: [34, 3.2, 51], switch: [125, 12.5, 46], route: [152, 3.6, 3.5], demand: [0, 3.2, 67],
    foot: [15.5, 2.2, 30], stock: [13, 11.5, -17], packs: [36, 9.5, -17], outlet: [-33, 3, 14.6], comp: [68, 3.2, 70], compl: [-12, 11, 100],
    q1: [116, 3.4, -46], q2: [151, 3.4, -64], v3: [140, 5, -56], newo: [-113, 7.5, -17]
  };
  const SIG = [
    ["visib", "Brand visibility improving", "inf", "Signage counts · 2 visits", 0],
    ["price", "Price increased 8%", "fact", "3 retailer reports · 2 days ago", 1],
    ["promo", "Promotion driving demand", "inf", "Sales uplift + shelf checks", 0],
    ["switch", "Retailer switching brands", "hyp", "1 distributor interview", 1],
    ["route", "Route delay reported", "fact", "Driver logs · yesterday", 0],
    ["demand", "Demand rising", "inf", "From sales and visitor counts", 0],
    ["foot", "Foot traffic", "fact", "Counts at 3 times of day", 1],
    ["stock", "Stockout reported", "fact", "Shelf check · 08:40 today", 1],
    ["packs", "Customers prefer smaller packs", "hyp", "Needs testing across outlets", 0],
    ["outlet", "New outlet opened", "fact", "Verified on site · Tuesday", 0],
    ["comp", "New competitor detected", "fact", "Seen at 2 stalls this week", 1],
    ["compl", "Repeated customer complaint", "fact", "12 mentions in 3 weeks", 0]
  ];
  SIG.forEach(([id, t, st, meta, m], i) => label({ id, kind: "sig", p: P[id], t, st, meta, m, a: .55 + (i % 6) * .05, b: 5.0 }));
  label({ kind: "q", p: P.q1, t: "Who supplies these kiosks?", st: "unk", cls: "unk always", a: 4.7, b: 5.6, m: 1 });
  label({ kind: "q", p: P.q2, t: "How often do they reorder?", st: "unk", cls: "unk always", a: 4.78, b: 5.6, m: 0 });
  label({ kind: "v", p: P.q1, t: "Restocked weekly by a motorbike distributor", st: "fact", meta: "SavoScouts · 9 kiosks", cls: "ver always", a: 5.66, b: 6.7, m: 1, off: [-190, 110], offt: [-190, 110], offm: [-30, 120] });
  label({ kind: "v", p: P.q2, t: "Retailers report low reorder frequency", st: "fact", meta: "6 of 9 kiosks", cls: "ver always", a: 5.7, b: 6.7, m: 0, off: [260, -110], offt: [10, -140], offm: [0, 0] });
  label({ kind: "mem", p: P.price, k: "Price", t: "+8% in July, stable since August", spark: [2, 2, 3, 6, 6, 6, 6], a: 6.62, b: 7.5, m: 0 });
  label({ kind: "mem", p: P.foot, k: "Visitors", t: "Rising for three months", spark: [2, 3, 3, 4, 5, 5, 6], a: 6.66, b: 7.5, m: 1 });
  label({ kind: "mem", p: P.newo, k: "August", t: "New outlet opened", a: 6.85, b: 7.5, m: 1 });
  label({ kind: "mem", p: P.comp, k: "Competitor stalls", t: "1 to 3 since July", spark: [1, 1, 1, 2, 2, 3, 3], a: 6.72, b: 7.5, m: 0 });
  label({ kind: "sum", p: P.foot, t: "Visitor numbers climbing", st: "fact", meta: "What we know", cls: "sum always", a: 7.58, b: 8.62, m: 0 });
  label({ kind: "sum", p: P.packs, t: "Is demand shifting to smaller packs?", st: "hyp", meta: "Still uncertain", cls: "sum always", a: 7.64, b: 8.62, m: 1 });
  label({ kind: "sum", p: P.v3, t: "Kiosks restock weekly", st: "fact", meta: "Investigated on the ground", cls: "sum always", a: 7.7, b: 8.62, m: 1 });

  const FR = [["Sales report · Q3", [-30, 26, 10]], ["Distributor messages", [60, 30, 20]], ["Public records", [10, 34, -30]], ["Field notes", [-70, 22, 30]], ["Retail audit", [95, 24, 50]], ["Company CRM", [-20, 30, 60]], ["Customer reviews", [40, 22, 80]], ["News", [130, 30, -10]], ["Supplier invoices", [-110, 28, -10]]];
  const docI = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M3 1.5h4l2 2v7H3z"/><path d="M7 1.5v2h2"/></svg>';
  const frags = FR.map(([t, p], i) => { const el = H$(`<div class="frg"><span style="--r:${(rnd() * 8 - 4).toFixed(1)}deg">${docI}${t}</span></div>`); ovl.appendChild(el); return { el, v: V3(p), a: 1.55 + i * .03, ph: rnd() * 6 }; });
  const scoutIcon = '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="4.6" r="2.2"/><path d="M4 14c.4-3 1.9-4.6 4-4.6s3.6 1.6 4 4.6"/></svg>';
  const mkScout = (cls, lab) => { const el = H$(`<div class="scout ${cls}"><span class="ring"></span><span class="sp">${scoutIcon}</span>${lab ? `<span class="sl">${lab}</span>` : ""}</div>`); ovl.appendChild(el); return el; };
  // moving scouts (one per route) and scouts stationed across the district
  const scoutEls = (gl ? gl.routes : []).map(r => mkScout(r.lead ? "" : "alt", "SavoScout"));
  const STATIONS = [
    [[-30, 0, 47], "Market rows"], [[-118, 0, 50], "Bus park"], [[112, 0, 28], "Wholesale depot"], [[40, 0, -10], "High street"],
    [[-20, 0, 140], "Residential"], [[200, 0, 10], "East road"], [[-180, 0, -10], "West road"], [[60, 0, 72], "Umbrella stalls"], [[-60, 0, -60], "North junction"]
  ].map(([p], i) => ({ v: V3(p), el: mkScout("alt", "SavoScout"), d: i * .025 }));
  const gapEl = H$('<div class="gapl"><span>? Intelligence Gap</span></div>'); ovl.appendChild(gapEl);

  const PAIRS = [["visib", "price"], ["price", "promo"], ["promo", "demand"], ["demand", "foot"], ["foot", "stock"], ["stock", "packs"], ["switch", "route"], ["route", "packs"], ["switch", "demand"], ["outlet", "price"], ["comp", "demand"], ["compl", "price"], ["stock", "outlet"]];
  let arcs = [], sumArcs = [];
  if (gl) {
    arcs = PAIRS.map(([a, b], i) => ({ line: gl.arc(P[a], P[b]), i }));
    const sm2 = new THREE.LineBasicMaterial({ color: 0x1F273F, transparent: true, opacity: 0, depthTest: false });
    sumArcs = [gl.arc(P.foot, P.packs, 30, sm2), gl.arc(P.packs, P.v3, 34, sm2)];
  }

  /* ===================== CAMERA ===================== */
  // [target, position] for t = 0..9
  const KD = [
    [[20, 0, 20], [-150, 125, 220]],
    [[0, 0, 30], [-110, 72, 150]],
    [[20, 0, 20], [-80, 120, 230]],
    [[25, 0, 20], [-60, 175, 255]],
    [[5, 0, 20], [-75, 62, 120]],
    [[128, 0, -50], [40, 140, 70]],
    [[70, 0, -15], [-70, 210, 175]],
    [[-30, 0, 10], [-175, 105, 170]],
    [[45, 0, 15], [-55, 210, 250]],
    [[30, 0, 20], [-170, 150, 250]]
  ];
  const KM = [
    [[20, 0, 30], [-120, 170, 300]],
    [[15, 0, 30], [-60, 110, 200]],
    [[20, 0, 20], [-70, 160, 300]],
    [[25, 0, 20], [-60, 230, 330]],
    [[15, 0, 10], [-50, 105, 175]],
    [[132, 0, -55], [60, 170, 100]],
    [[90, 0, -25], [-20, 250, 200]],
    [[-40, 0, 10], [-170, 150, 230]],
    [[60, 0, -5], [-30, 280, 300]],
    [[30, 0, 30], [-150, 200, 320]]
  ];
  const camT = { x: 0, y: 0, z: 0 }, camP = { x: 0, y: 0, z: 0 };
  function camAt(t, time) {
    const K = mobile ? KM : KD, i = Math.min(K.length - 2, Math.floor(t)), e = sm(ramp(t - i, .2, .8));
    const tg = K[i][0].map((v, j) => v + (K[i + 1][0][j] - v) * e), ps = K[i][1].map((v, j) => v + (K[i + 1][1][j] - v) * e);
    const ang = Math.sin(time * .045) * .05 + (t - 4.5) * .012, dx = ps[0] - tg[0], dz = ps[2] - tg[2], ca = Math.cos(ang), sa = Math.sin(ang);
    camT.x = tg[0]; camT.y = tg[1]; camT.z = tg[2];
    camP.x = tg[0] + dx * ca - dz * sa; camP.y = ps[1] + Math.sin(time * .07) * 1.5; camP.z = tg[2] + dx * sa + dz * ca;
  }
  function measure() {
    vw = stage.clientWidth; vh = stage.clientHeight; mobile = vw < 700;
    U = vh * UNIT; story.style.height = (U * LAST + vh) + "px";
    if (gl) {
      gl.renderer.setSize(vw, vh, false);
      gl.camera.aspect = vw / vh; gl.camera.fov = mobile ? 38 : 30;
      if (mobile) gl.camera.setViewOffset(vw, vh, 0, -vh * .2, vw, vh); else gl.camera.setViewOffset(vw, vh, -vw * .1, -vh * .04, vw, vh);
      gl.camera.updateProjectionMatrix();
    }
    labels.forEach(l => l.w = null);
    readScroll();
  }
  function readScroll() { T = clamp((scrollY - story.offsetTop) / U, 0, LAST); }
  const projV = gl ? new THREE.Vector3() : null;
  function proj(v) {
    projV.set(v.x, v.y, v.z).project(gl.camera);
    return [(projV.x * .5 + .5) * vw, (-projV.y * .5 + .5) * vh, projV.z < 1 && projV.z > -1];
  }

  /* ===================== RENDER ===================== */
  const heroEl = $("hero"), srcEl = $("sources"), finalEl = $("final"), veil = $("veil");
  const chs = [...document.querySelectorAll(".ch")];
  const prog = $("prog"), scrollLab = $("scroll-lab"), tlNow = $("tl-now");
  const NAMES = ["Scroll", "Signals", "Fragmentation", "Connection", "Evidence", "Gaps", "Investigation", "Memory", "Decision"];
  const t0 = performance.now();
  const WHITE = gl ? new THREE.Color(0xffffff) : null, ACC = gl ? new THREE.Color("#B3C9EE") : null, ACCL = gl ? new THREE.Color("#3A5292") : null;
  const pm = gl ? new THREE.Matrix4() : null, pq = gl ? new THREE.Quaternion() : null, pp = gl ? new THREE.Vector3() : null, ps1 = gl ? new THREE.Vector3(1, 1, 1) : null, ps0 = gl ? new THREE.Vector3(0, 0, 0) : null;
  function hi(layer, k) { layer.fillMat.color.copy(WHITE).lerp(ACC, k); layer.lineMat.color.copy(layer.base).lerp(ACCL, k); }

  function render3D(now, time, t) {
    const { camera, L } = gl;
    camAt(t, time);
    camera.position.set(camP.x, camP.y, camP.z); camera.lookAt(camT.x, camT.y, camT.z);
    const rv = reduce ? 1 : clamp((now - t0) / 2600);
    gl.reveal.forEach((l, i) => { const k = clamp(rv * 1.4 - i * .06); if (l.lines) l.lines.geometry.setDrawRange(0, Math.floor(l.nE * k / 2) * 2); if (l.sk) l.sk.geometry.setDrawRange(0, Math.floor(l.nS * k / 2) * 2); if (l.mesh) l.fillMat.opacity = k; });
    const calm = 1 - .6 * ramp(t, 7.4, 8.2);
    const { people, bodies, heads, loads } = gl;
    for (let i = 0; i < people.length; i++) {
      const p = people[i]; let x, z, bob;
      if (p.L === 0) { x = p.pts[0][0]; z = p.pts[0][1]; bob = Math.abs(Math.sin(time * 1.6 + p.ph)) * .05; }
      else {
        let u = wrap(p.s + time * p.v * calm + t * 8, 0, p.L * 2); if (u > p.L) u = 2 * p.L - u;
        let k = 1; while (k < p.cum.length - 1 && p.cum[k] < u) k++;
        const a = p.pts[k - 1], b = p.pts[k], f = (u - p.cum[k - 1]) / ((p.cum[k] - p.cum[k - 1]) || 1);
        x = a[0] + (b[0] - a[0]) * f; z = a[1] + (b[1] - a[1]) * f; bob = Math.abs(Math.sin(u * 3.4)) * .08;
      }
      pp.set(x, bob, z); pm.compose(pp, pq, ps1); bodies.setMatrixAt(i, pm); heads.setMatrixAt(i, pm);
      if (!p.load) pm.compose(pp, pq, ps0); loads.setMatrixAt(i, pm);
    }
    bodies.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true; loads.instanceMatrix.needsUpdate = true;
    for (const v of gl.vehicles) {
      const r = v.range || [-420, 420], s = wrap(v.start + v.dir * (time * v.v * calm + t * 14), r[0], r[1]);
      if (v.axis === "x") { v.g.position.set(s, 0, v.lane); v.g.rotation.y = v.dir > 0 ? 0 : Math.PI; }
      else { v.g.position.set(v.lane, 0, s); v.g.rotation.y = v.dir > 0 ? -Math.PI / 2 : Math.PI / 2; }
    }
    const k1 = band(t, .6, 1.5, .25), k4 = band(t, 3.6, 4.5, .25), k8 = band(t, 7.6, 8.7, .25);
    hi(L.stock, Math.max(k1, k4, k8 * .6));
    hi(L.comp, Math.max(k1 * .8, band(t, 6.6, 7.5, .25)));
    hi(L.wholesale, band(t, 2.6, 3.5, .25) * .6);
    const gapIn = ramp(t, 4.55, 4.95), solved = ramp(t, 5.6, 6.0), gapAmt = gapIn * (1 - solved);
    gl.fogBox.material.opacity = gapAmt * .78;
    gl.gapLine.material.opacity = band(t, 4.55, 6.75, .2);
    hi(L.gap, solved * band(t, 5.6, 6.75, .2) + k8 * .7);
    L.gap.lineMat.opacity = .95 - gapAmt * .55;
    const scoutVis = band(t, 5.05, 6.72, .15);
    const qs = gl.routes.map(r => sm(ramp(t, 5.1 + r.d * .6, 5.62 + r.d * .5)));
    gl.routes.forEach((r, i) => { r.line.material.opacity = scoutVis * (r.lead ? 1 : .75); r.line.geometry.setDrawRange(0, Math.floor(qs[i] * 160) + 1); });
    const mem = band(t, 6.55, 7.55, .22), grow = ramp(t, 6.65, 7.05);
    L.ghost.lineMat.opacity = mem * .9;
    L.outlet.g.visible = grow > 0; L.outlet.g.scale.y = Math.max(.001, sm(grow)); hi(L.outlet, band(t, 6.65, 7.6, .2));
    const lineOp = ramp(t, 2.5, 2.7) * (1 - .55 * ramp(t, 3.6, 4.2)) * (1 - ramp(t, 4.5, 4.9));
    arcs.forEach(a => { const p = sm(ramp(t, 2.5 + a.i * .03, 3.0 + a.i * .03)); a.line.material.opacity = lineOp; a.line.geometry.setDrawRange(0, Math.floor(p * 49)); });
    const sop = band(t, 7.7, 8.62, .2);
    sumArcs.forEach((l, i) => { l.material.opacity = sop; l.geometry.setDrawRange(0, Math.floor(sm(ramp(t, 7.75 + i * .08, 8.05 + i * .08)) * 49)); });
    gl.renderer.render(gl.scene, camera);

    // overlays pinned to the scene
    const place = (el, v, op) => {
      if (op < .01) { el.style.visibility = "hidden"; return; }
      const [x, y, ok] = proj(v); op *= ok ? clamp((x + 10) / 40) * clamp((vw + 10 - x) / 40) * clamp((y - 80) / 50) * clamp((vh - 110 - y) / 40) : 0;
      el.style.visibility = op > .01 ? "visible" : "hidden"; el.style.opacity = op.toFixed(2); el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    gl.routes.forEach((r, i) => place(scoutEls[i], r.pts[Math.min(159, Math.floor(qs[i] * 159))], scoutVis * ramp(t, 5.1 + r.d * .5, 5.2 + r.d * .5)));
    STATIONS.forEach(s => place(s.el, s.v, band(t, 5.1 + s.d, 6.72, .15) * 1));
    const gv = band(t, 4.55, 6.75, .2), [gx, gy, gok] = proj({ x: gl.GAP.x0 + 18, y: .3, z: gl.GAP.z0 });
    gapEl.style.opacity = gok ? gv : 0; gapEl.style.visibility = gv > .01 && gok ? "visible" : "hidden"; gapEl.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`;
    const done = t > 5.85; if (gapEl.classList.contains("done") !== done) { gapEl.classList.toggle("done", done); gapEl.firstChild.textContent = done ? "✓ Gap investigated" : "? Intelligence Gap"; }

    // area covered by the visible headline text: labels behind it are faded so the text reads first
    const ck = Math.round(t), tEl = ck === 0 ? heroEl : (ck >= 1 && ck <= 8 ? chs[ck - 1] : null);
    const tr = tEl ? tEl.getBoundingClientRect() : null;
    const behind = (x, y) => tr && x > tr.left - 24 && x < tr.right + 24 && y > tr.top - 10 && y < tr.bottom + 70;
    const evOn = t > 3.55 && t < 4.7, fragAmt = band(t, 1.55, 2.6, .25), dim = 1 - ramp(t, 4.45, 4.85);
    for (const l of labels) {
      let op = band(t, l.a, l.b, .2);
      if (l.kind === "sig") op *= dim;
      if (mobile && !l.m) op = 0;
      let x = 0, y = 0;
      if (op > .01) { const r = proj(l.v); x = r[0]; y = r[1]; if (!r[2]) op = 0; op *= clamp((x + 6) / 40) * clamp((vw + 6 - x) / 40) * clamp((y - 90) / 60) * clamp((vh - 120 - y) / 40); if (behind(x, y)) op *= .14; }
      if (op < .01) { if (l.op !== 0) { l.el.style.opacity = 0; l.el.style.visibility = "hidden"; l.op = 0; } continue; }
      l.el.style.visibility = "visible"; l.el.style.opacity = op.toFixed(2); l.op = op;
      l.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      if (l.kind === "sig") {
        const fr = fragAmt > .02;
        if (l.el.classList.contains("frag") !== fr) l.el.classList.toggle("frag", fr);
        l.box.style.translate = fr ? `${(l.ox * fragAmt).toFixed(1)}px ${(l.oy * fragAmt).toFixed(1)}px` : "0 0";
        if (l.el.classList.contains("ev") !== evOn) { l.el.classList.toggle("ev", evOn); l.w = null; }
        const pulse = t > .55 && t < 1.5; if (l.el.classList.contains("pulse") !== pulse) l.el.classList.toggle("pulse", pulse);
      }
      if (l.off) {
        // findings sit away from the scouts, linked back to their point by a dotted leader
        let [dx, dy] = mobile ? l.offm : vw < 1100 ? l.offt : l.off;
        if (l.w == null) { l.w = l.box.offsetWidth; l.h = l.box.offsetHeight; }
        dx = clamp(x + dx, l.w / 2 + 12, vw - l.w / 2 - 12) - x; dy = clamp(y + dy, 90 + l.h / 2, vh - 130 - l.h / 2) - y;
        l.box.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;
        const len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
        l.leadEl.style.width = len.toFixed(1) + "px"; l.leadEl.style.transform = `rotate(${ang.toFixed(1)}deg)`;
        continue;
      }
      if (l.w == null) l.w = l.box.offsetWidth;
      const half = l.w / 2, pad = 12; let shift = 0;
      if (x - half < pad) shift = pad - (x - half); else if (x + half > vw - pad) shift = vw - pad - (x + half);
      if (Math.abs(shift - l.shift) > .4) { l.box.style.marginLeft = shift.toFixed(1) + "px"; l.shift = shift; }
    }
    for (const f of frags) {
      let op = band(t, f.a, 2.75, .25);
      const [x, y, ok] = proj({ x: f.v.x + Math.sin(time * .5 + f.ph) * 2, y: f.v.y + Math.cos(time * .4 + f.ph) * 1.2 - ramp(t, 2.4, 2.75) * 8, z: f.v.z });
      op *= ok ? clamp((x - 40) / 80) * clamp((vw - 40 - x) / 80) * clamp((y - 80) / 60) : 0;
      if (mobile && y < vh * .42) op = 0;
      f.el.style.opacity = op.toFixed(2); f.el.style.visibility = op > .01 ? "visible" : "hidden";
      if (op > .01) f.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
  }

  let soundCk = -1;
  function render(now) {
    const time = reduce ? 0 : (now - t0) / 1000, t = T;
    if (gl) render3D(now, time, t);
    const heroOp = 1 - ramp(t, .12, .42);
    heroEl.style.opacity = heroOp.toFixed(2); heroEl.style.transform = `translateY(${(-30 * ramp(t, .12, .42)).toFixed(1)}px)`;
    heroEl.style.visibility = heroOp < .01 ? "hidden" : "visible";
    srcEl.style.opacity = heroOp.toFixed(2); srcEl.style.visibility = heroOp < .01 ? "hidden" : "visible";
    let side = heroOp;
    chs.forEach(c => {
      const k = +c.dataset.k, d = t - k, op = clamp((.5 - Math.abs(d)) / .2);
      c.style.opacity = op.toFixed(2); c.style.transform = `translateY(${(d * -30).toFixed(1)}px)`;
      c.style.visibility = op < .01 ? "hidden" : "visible"; side = Math.max(side, op);
    });
    const fin = ramp(t, 8.55, 8.85);
    finalEl.style.opacity = fin.toFixed(2); finalEl.style.visibility = fin < .01 ? "hidden" : "visible";
    veil.style.opacity = Math.max(side, fin).toFixed(2);
    veil.style.background = fin > .5 ? "radial-gradient(ellipse 62% 58% at 50% 44%, rgba(245,248,252,.97) 0%, rgba(245,248,252,.86) 50%, rgba(245,248,252,0) 100%)" : "";
    tlNow.style.left = (ramp(t, 6.6, 7.3) * 100).toFixed(1) + "%";
    prog.style.width = (t / LAST * 100).toFixed(1) + "%";
    const ck = Math.round(t), lab = ck === 0 ? "Scroll" : ck >= 9 ? "Back to top" : String(ck).padStart(2, "0") + " / 08 · " + NAMES[ck];
    if (scrollLab.textContent !== lab) scrollLab.textContent = lab;
    if (ck !== soundCk && window.vsSound) { soundCk = ck; window.vsSound.chapter(Math.min(ck, 9)); }
    typeFor(ck);
  }

  /* ===================== TYPING QUESTION BAR ===================== */
  const Q = [
    "What does the market for our product look like?",
    "What is changing in this market?",
    "Where is the information about this market?",
    "How do these signals relate to each other?",
    "What does the evidence actually support?",
    "What don't we know yet?",
    "Which kiosks stock our 200ml pack?",
    "What has changed since July?",
    "Where should we launch first?",
    ""
  ];
  const qIn = $("q"), qBar = $("qbar"), qNote = $("qnote");
  let typedFor = -1, typeTimer = 0, userOwns = false;
  function typeFor(k) {
    if (userOwns || k === typedFor) return;
    typedFor = k; clearInterval(typeTimer);
    const s = Q[k] || "";
    qIn.placeholder = k >= 9 ? "Ask a question about an African market, customer or competitor" : "";
    if (reduce) { qIn.value = s; return; }
    let i = 0; qIn.value = "";
    typeTimer = setInterval(() => { i++; qIn.value = s.slice(0, i); if (window.vsSound && i % 2) window.vsSound.type(); if (i >= s.length) clearInterval(typeTimer); }, 30);
  }
  qIn.addEventListener("focus", () => { qBar.classList.add("focus"); if (!userOwns) { clearInterval(typeTimer); qIn.select(); } });
  qIn.addEventListener("blur", () => qBar.classList.remove("focus"));
  qIn.addEventListener("input", () => { userOwns = true; qNote.hidden = true; });
  /* The Intelligence Assistant lives on /platform; questions travel with the visitor */
  function toAssistant(hash, q) {
    try { if (q) sessionStorage.setItem("verisavo-q", q); else sessionStorage.removeItem("verisavo-q"); } catch (e) {}
    location.href = "/platform#" + hash;
  }
  const SCOUT_Q = "Check which kiosks near the main bus park stock our 200ml pack, and how often they reorder.";
  qBar.addEventListener("submit", e => {
    e.preventDefault();
    toAssistant("ask", qIn.value.trim());
  });

  /* ===================== LOOP & EVENTS ===================== */
  let raf = 0, running = false;
  function loop(now) { render(now); raf = running ? requestAnimationFrame(loop) : 0; }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  function setRunning() { const r = story.getBoundingClientRect(); running = !reduce && !document.hidden && r.bottom > 0 && r.top < innerHeight; kick(); }
  addEventListener("scroll", () => { readScroll(); setRunning(); kick(); }, { passive: true });
  addEventListener("resize", () => { measure(); kick(); });
  document.addEventListener("visibilitychange", setRunning);
  measure(); setRunning(); kick();
  if (reduce) setTimeout(kick, 60);

  function go(k) {
    if (k === "about") { $("about").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); return; }
    scrollTo({ top: story.offsetTop + U * (+k), behavior: reduce ? "auto" : "smooth" });
  }

  /* Terms of Service and Privacy Policy, opened in place */
  const legalDlg = $("legal");
  let lOpener = null;
  function openLegal(doc) {
    lOpener = document.activeElement;
    ["privacy", "terms"].forEach(d => { const el = $("l-" + d); el.hidden = d !== doc; el.scrollTop = 0; });
    legalDlg.setAttribute("aria-labelledby", "lh-" + doc);
    if (legalDlg.showModal) legalDlg.showModal(); else legalDlg.setAttribute("open", "");
    setTimeout(() => $("l-" + doc).focus(), 30);
  }
  const closeLegal = () => legalDlg.close ? legalDlg.close() : legalDlg.removeAttribute("open");
  $("l-x").addEventListener("click", closeLegal);
  legalDlg.addEventListener("click", e => { if (e.target === legalDlg) closeLegal(); });
  legalDlg.addEventListener("close", () => { if (lOpener && lOpener.focus && !legalDlg.dataset.handoff) lOpener.focus(); delete legalDlg.dataset.handoff; });
  document.querySelectorAll("[data-legal-contact]").forEach(b => b.addEventListener("click", () => { legalDlg.dataset.handoff = "1"; closeLegal(); window.vsOpenAccess(""); }));
  const menuBtn = $("menu-btn"), menu = $("menu"), menuLab = $("menu-lab");
  function setMenu(open) {
    menu.classList.toggle("open", open); menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open)); menuLab.textContent = open ? "Close" : "Menu";
    if (open) setTimeout(() => { const f = menu.querySelector("button"); if (f) f.focus({ preventScroll: true }); }, 350);
  }
  function closeMenu() { if (menu.classList.contains("open")) setMenu(false); }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("click", e => {
    if (e.target.closest("[data-soon]")) closeMenu();
    const pgb = e.target.closest("[data-page]"); if (pgb) goPage(pgb.dataset.page);
    const g = e.target.closest("[data-go]"); if (g) { if (curPage) goPage("home"); go(g.dataset.go); closeMenu(); }
    const d = e.target.closest("[data-dialog]"); if (d) { closeMenu(); if (d.dataset.dialog === "signin") window.vsOpenAuth("in"); else window.vsOpenAccess(""); }
    if (e.target.closest("[data-ask]")) toAssistant("ask", userOwns ? qIn.value.trim() : "");
    if (e.target.closest("[data-scout]")) { closeMenu(); window.vsOpenAccess(SCOUT_Q); }
    const lg = e.target.closest("[data-legal]"); if (lg) { closeMenu(); openLegal(lg.dataset.legal); }
    if (!e.target.closest("#qbar")) qNote.hidden = true;
    if (!e.target.closest(".pill") && !e.target.closest(".mnav") && !e.target.closest(".pg")) closeMenu();
  });
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));

  /* ===================== ABOUT AND CONTACT PAGES ===================== */
  const PAGES = { "about-us": $("pg-about-us"), contact: $("pg-contact"), research: $("pg-research"), pricing: $("pg-pricing"), careers: $("pg-careers") };
  $("ca-copy").addEventListener("click", async () => {
    const n = $("ca-note");
    try { await navigator.clipboard.writeText("career@verisavo.com"); n.textContent = "Email address copied."; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($("ca-addr")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); n.textContent = "Address selected. Press Ctrl+C or Cmd+C to copy."; }
  });

  /* Research study details */
  const RS_SUMMARY = {"Africa's Macro-Economic Outlook": ["Africa's 54 economies are moving at very different speeds. This study looks at the forces shaping growth across the continent, including inflation and currency pressure, debt and public finances, commodity exposure, trade integration and demographic change, and how they combine differently from one market to the next.", "It is written for teams deciding where to invest, expand or hold back, with a focus on separating continent-wide narratives from what is actually happening in specific countries and cities."], "Navigating Africa's Business Landscape": ["Doing business across Africa means working across many markets at once, each with its own regulation, languages, distribution systems, payment habits and ways of building trust.", "This study examines how context and culture shape commercial reality on the ground: how products reach shelves, how informal and formal trade meet, and what organisations often misread when they treat the continent as a single market."], "AI and Productivity in Africa": ["Much of the conversation about AI focuses on automation and job replacement. This study looks at a different role: AI as a layer that augments people and coordinates fragmented systems, information and supply chains.", "It explores where AI could raise productivity in African markets, what conditions it depends on, such as data, connectivity and trust, and where the gains are still uncertain."], "Private Capital in Africa": ["Private capital is playing a growing role in African markets, but outcomes vary widely. This study looks at how risk and return are assessed, and why deals that look strong on paper can succeed or struggle once they meet operating conditions on the ground.", "It covers due diligence gaps, currency and exit risk, local partnerships and the role of better market evidence in investment decisions."], "Africa's Urban Shift": ["Africa has one of the youngest and fastest-urbanising populations in the world. This study looks at how rising cities and younger consumers are changing how people discover, choose and stay loyal to brands.", "It examines new retail channels, mobile money and social commerce, price sensitivity and pack sizes, and what these shifts could mean for companies competing for urban consumers."], "Africa's Critical Minerals Opportunity": ["Demand for minerals used in batteries, electrification and clean energy is reshaping global supply chains, and many of these resources are found in African countries.", "This study looks at the global race for critical minerals and the path from extraction to local value creation, including processing, infrastructure, policy, partnerships and the risks that could hold that path back."], "Harnessing Africa's $2 Trillion Informal Economy": ["A large share of trade, employment and everyday commerce across Africa happens in informal markets that are poorly captured by official data.", "This study explores how the informal economy works, why it matters to companies and policymakers, and how better Ground-Level Intelligence can reveal demand, distribution and opportunity that formal statistics miss."]};
  const rsDetail = $("rs-detail");
  let rsOpener = null;
  const RD_DEFAULT = { note: $("rd-note").textContent, acts: $("rd-acts").innerHTML };
  let rdPushed = false;
  function showDetail() {
    if (!rdPushed) { try { history.pushState({ rd: 1 }, "", location.href); rdPushed = true; } catch (e) {} }
    rsDetail.classList.remove("open"); void rsDetail.offsetWidth;
    rsDetail.classList.add("open"); rsDetail.setAttribute("aria-hidden", "false"); rsDetail.scrollTop = 0;
    setTimeout(() => $("rd-title").focus({ preventScroll: true }), 80);
  }
  /* Highlights open in the same full-screen view: large artwork, title and what we can say about each item so far */
  function openHighlight(card) {
    rsOpener = card;
    const tag = card.querySelector(".rs-soon"), meta = card.querySelector(".rs-meta").textContent, isArticle = tag && tag.textContent.trim() === "Article";
    $("rd-back-l").textContent = card.closest("#pg-research") ? "All articles" : "All highlights";
    $("rd-art").innerHTML = card.querySelector(".rs-art").innerHTML;
    $("rd-meta").textContent = meta;
    $("rd-tag").textContent = /webinar/i.test(meta) ? "Webinar" : isArticle ? "Article · Coming soon" : (tag ? tag.textContent : "");
    $("rd-tag").hidden = !$("rd-tag").textContent;
    $("rd-title").textContent = card.querySelector("h3").textContent;
    $("rd-sub").textContent = card.querySelector(".hl-body > p:not(.rs-meta)").textContent;
    $("rd-text").innerHTML = "";
    const acts = $("rd-acts");
    if (/webinar/i.test(meta)) { $("rd-note").textContent = "Registration details will be shared with everyone who registers interest."; acts.innerHTML = '<button type="button" class="obtn solid" data-dialog="access">Register interest</button><button type="button" class="obtn" data-ask>Ask Verisavo</button>'; }
    else if (/coming soon/i.test(meta)) { $("rd-note").textContent = "The first episodes are in preparation."; acts.innerHTML = ""; }
    else if (isArticle) { $("rd-note").textContent = "The full article is coming soon."; acts.innerHTML = ""; }
    else { $("rd-note").textContent = ""; acts.innerHTML = ""; }
    showDetail();
  }
  function openStudy(card) {
    rsOpener = card;
    $("rd-back-l").textContent = "All research"; $("rd-tag").textContent = "Coming soon"; $("rd-tag").hidden = false;
    $("rd-note").textContent = RD_DEFAULT.note; $("rd-acts").innerHTML = RD_DEFAULT.acts;
    $("rd-art").innerHTML = card.querySelector(".rs-art").innerHTML;
    $("rd-meta").textContent = card.querySelector(".rs-meta").textContent;
    $("rd-title").textContent = card.querySelector("h3").textContent;
    $("rd-sub").textContent = card.querySelector(".rs-sub").textContent;
    const t = $("rd-text"); t.innerHTML = "";
    (RS_SUMMARY[card.dataset.title] || []).forEach(x => { const p = document.createElement("p"); p.textContent = x; t.appendChild(p); });
    showDetail();
  }
  addEventListener("popstate", e => {
    if (rdPushed) { rdPushed = false; closeStudy(true); }
    else if (e.state && e.state.rd && !rsDetail.classList.contains("open")) history.back();   // skip a leftover detail entry
  });
  function closeStudy(fromHistory) { if (!rsDetail.classList.contains("open")) return; if (rdPushed && fromHistory !== true) { rdPushed = false; history.back(); } rsDetail.classList.remove("open"); rsDetail.setAttribute("aria-hidden", "true"); if (rsOpener) rsOpener.focus({ preventScroll: true }); }
  document.querySelectorAll(".rs-card").forEach(card => {
    card.addEventListener("click", e => { if (e.target.closest("a")) return; openStudy(card); });
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStudy(card); } });
  });
  document.querySelectorAll(".hl-card").forEach(card => {
    card.tabIndex = 0; card.setAttribute("role", "button"); card.setAttribute("aria-label", card.querySelector("h3").textContent + ", open highlight");
    card.addEventListener("click", e => { if (e.target.closest("a, button")) return; openHighlight(card); });
    card.addEventListener("keydown", e => { if (e.target === card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openHighlight(card); } });
  });
  $("rd-back").addEventListener("click", closeStudy);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && rsDetail.classList.contains("open") && !document.querySelector("dialog[open]")) { e.stopImmediatePropagation(); closeStudy(); } }, true);

  /* Research page articles: open in the full-screen view; show four, then "See more articles" */
  (() => {
    const rows = [...document.querySelectorAll(".ar-row")], more = $("ar-more"), FIRST = 4;
    rows.forEach(r => {
      r.addEventListener("click", () => openHighlight(r));
      r.addEventListener("keydown", e => { if (e.target === r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openHighlight(r); } });
    });
    rows.forEach((r, i) => r.hidden = i >= FIRST);
    more.hidden = rows.length <= FIRST;
    more.addEventListener("click", () => { rows.forEach(r => r.hidden = false); more.hidden = true; (rows[FIRST] || rows[0]).focus({ preventScroll: true }); });
  })();
  /* Highlights pagination: three rows (nine cards) per page */
  (() => {
    const grid = $("hl-grid"), pager = $("hl-pager"), cards = [...grid.querySelectorAll(".hl-card")], PER = 9, pages = Math.ceil(cards.length / PER);
    let cur = 0;
    function show(n, scroll) {
      cur = n;
      cards.forEach((c, i) => { c.hidden = Math.floor(i / PER) !== n; c.style.setProperty("--i", i % PER); });
      pager.innerHTML = "";
      const mk = (label, page, extra) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; Object.assign(b, extra || {}); if (page === cur && !extra) b.setAttribute("aria-current", "page"); b.addEventListener("click", () => show(page, true)); pager.appendChild(b); return b; };
      mk("← Prev", Math.max(0, cur - 1), { disabled: cur === 0, ariaLabel: "Previous page" });
      for (let i = 0; i < pages; i++) mk(String(i + 1), i);
      mk("Next →", Math.min(pages - 1, cur + 1), { disabled: cur === pages - 1, ariaLabel: "Next page" });
      if (scroll) $("hl-h").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    pager.hidden = pages < 2;
    show(0, false);
  })();
  /* Research filters */
  document.querySelectorAll(".rs-chip").forEach(c => c.addEventListener("click", () => {
    document.querySelectorAll(".rs-chip").forEach(x => x.setAttribute("aria-pressed", String(x === c)));
    const f = c.dataset.f;
    document.querySelectorAll(".rs-card").forEach(card => { card.hidden = f !== "All" && card.dataset.cat !== f; });
  }));
  let curPage = null, collageDone = false;
  function showPage(name) {
    if (typeof closeStudy === "function" && rsDetail.classList.contains("open")) { rdPushed = false; closeStudy(true); }
    const el = PAGES[name] || null;
    Object.values(PAGES).forEach(p => { const on = p === el; p.classList.toggle("open", on); p.setAttribute("aria-hidden", String(!on)); });
    document.body.classList.toggle("page-open", !!el);
    curPage = el ? name : null;
    if (el) {
      el.scrollTop = 0;
      if (name === "about-us" && !collageDone) {
        collageDone = true;
        setTimeout(() => {
          if (!gl || !gl.snapshots) return;
          try {
            const shots = gl.snapshots([[[10, 0, 45], [-30, 45, 95]], [[125, 0, 40], [80, 42, 95]], [[133, 0, -55], [98, 38, -8]], [[-110, 0, 42], [-152, 42, 95]], [[12, 0, -14], [-28, 26, 24]]]);
            document.querySelectorAll("#collage img[data-view]").forEach(img => { img.src = shots[+img.dataset.view]; });
          } catch (e) { /* the collage keeps its plain placeholders */ }
        }, 60);
      }
      setTimeout(() => { const h = el.querySelector("h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }, 120);
    }
  }
  function goPage(name) {
    closeMenu();
    const target = name === "home" ? "" : name;
    if (location.hash.slice(1) === target) { showPage(target); return; }
    location.hash = target || "home";
  }
  /* in-site trail of pages, so Back returns to where the visitor came from (or home if they arrived directly) */
  const trail = [location.hash.slice(1)];
  addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (trail.length > 1 && trail[trail.length - 2] === h) trail.pop(); else trail.push(h);
    showPage(h);
  });
  /* arrived from the Platform page: the first Back returns there */
  let cameFrom = ""; try { cameFrom = sessionStorage.getItem("verisavo-from") || ""; sessionStorage.removeItem("verisavo-from"); } catch (e) {}
  document.addEventListener("click", e => {
    if (!e.target.closest("[data-back]")) return;
    if (trail.length > 1) history.back();
    else if (cameFrom) { if (history.length > 1) history.back(); else location.href = cameFrom; }
    else goPage("home");
  });
  if (PAGES[location.hash.slice(1)]) showPage(location.hash.slice(1));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && curPage && !menu.classList.contains("open") && !document.querySelector("dialog[open]")) goPage("home"); });

  /* Contact form. CONTACT_ENDPOINT: your form backend (POST JSON). Until it is set, nothing is sent. */
  const CONTACT_ENDPOINT = "";
  const cform = $("cform"), cStatus = $("cf-status");
  cform.addEventListener("input", e => e.target.classList.remove("bad"));
  cform.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("cf-name"), email = $("cf-email"), msg = $("cf-msg");
    const bad = [];
    if (!name.value.trim()) bad.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) bad.push(email);
    if (msg.value.trim().length < 10) bad.push(msg);
    bad.forEach(el => el.classList.add("bad"));
    cStatus.hidden = false;
    if (bad.length) { cStatus.textContent = "Add your name, a valid work email and a short message, then send again."; bad[0].focus(); return; }
    const body = { name: name.value.trim(), email: email.value.trim(), message: msg.value.trim() };
    if (!CONTACT_ENDPOINT) {
      cStatus.innerHTML = "";
      const p1 = document.createElement("p"); p1.style.color = "#fff";
      p1.textContent = "Thanks, " + body.name.split(" ")[0] + ". This form is not connected to our inbox yet, so your message has not been sent. The quickest way to reach us today is early access on WhatsApp.";
      const b = document.createElement("button"); b.type = "button"; b.className = "pg-link"; b.dataset.dialog = "access"; b.innerHTML = 'Get early access <span aria-hidden="true">→</span>';
      cStatus.append(p1, b); return;
    }
    const btn = $("cf-send"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(r.status);
      cform.reset(); cStatus.textContent = "Thanks. Your message has been sent and our team will reply by email.";
    } catch (err) { cStatus.textContent = "We could not send your message. Please try again shortly."; }
    finally { btn.disabled = false; btn.textContent = "Send message"; }
  });
  $("scroll-btn").addEventListener("click", () => { const k = Math.round(T); go(k >= 9 ? 0 : k + 1); });

  /* Arriving from the Assistant page: #how, #product, #savoscouts or #decision jump to that chapter */
  const HASH = { how: 1, signals: 1, product: 3, evidence: 4, gaps: 5, savoscouts: 6, memory: 7, decision: 8, start: 9 };
  const hk = HASH[location.hash.slice(1)];
  if (hk) setTimeout(() => scrollTo({ top: story.offsetTop + U * hk, behavior: "auto" }), 60);
  })();
}
