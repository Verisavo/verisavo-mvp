/* Verisavo chart library.
   One minimal exhibit style for every chart: a short title that states the finding, a subtitle with the measure and scope,
   a quiet legend, the chart, and a source line. Blues carry the data; indigo marks what matters, light blue is context,
   grey is "other", and a hatched bar means Unknown. Nothing decorative.

   VChart.render(spec)        -> HTML for the chart body
   VChart.figure(spec, n)     -> full exhibit (Exhibit n, title, subtitle, body, note, source)
   VChart.pick(question)      -> template ids that suit a question, best first
   VChart.TEMPLATES           -> [{ id, name, group, use, sample }]
   VChart.animate(root)       -> plays the draw-in once the chart is on screen */
(function (root) {
  "use strict";
  var C = { main: "#3B5D8A", deep: "#1F273F", mid: "#618CD0", light: "#A8BFDC", pale: "#DCE6F2", wash: "#F1F5FA", grey: "#D3D3D8", ink: "#3A3A3C", muted: "#6D6C71", faint: "#A2A1A6", line: "#E5E5E5" };
  var SER = [C.main, C.light, C.mid, C.deep, C.pale, C.grey];
  var uid = 0;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v, s) { if (v == null) return "Unknown"; var n = typeof v === "number" ? (Math.abs(v) >= 1000 ? v.toLocaleString("en-GB") : String(+v.toFixed(1))) : v; return (s.pre || "") + n + (s.fmt || ""); }
  function mx(a) { return Math.max.apply(null, a.filter(function (x) { return x != null; })); }
  function mn(a) { return Math.min.apply(null, a.filter(function (x) { return x != null; })); }
  var PARTS = [C.main, C.light, C.mid, C.pale, C.grey];
  function col(s, k) { return (s.colors && s.colors[k]) || SER[k % SER.length]; }
  function pcol(s, p, k) { if (s.colors && s.colors[k]) return s.colors[k]; return /^others?$/i.test(p.label || "") ? C.grey : PARTS[k % PARTS.length]; }
  function legx(items) { return '<p class="vc-leg">' + items.map(function (it) { return '<span><i class="' + (it[2] || "") + '" style="background:' + it[1] + '"></i>' + esc(it[0]) + "</span>"; }).join("") + "</p>"; }
  function leg(s, names, shape) { names = names || s.series; if (!names || names.length < 2) return ""; return '<p class="vc-leg">' + names.map(function (n, k) { return '<span><i class="' + (shape || "") + '" style="background:' + col(s, k) + '"></i>' + esc(n) + "</span>"; }).join("") + "</p>"; }
  function svg(w, h, inner, label, cls) { return '<svg class="vc-svg ' + (cls || "") + '" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label || "") + '">' + inner + "</svg>"; }
  function T(x, y, t, cls, anchor) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" class="' + (cls || "") + '"' + (anchor ? ' text-anchor="' + anchor + '"' : "") + ">" + esc(t) + "</text>"; }
  function R(x, y, w, h, fill, cls, rx) { return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" fill="' + fill + '"' + (rx ? ' rx="' + rx + '"' : "") + (cls ? ' class="' + cls + '"' : "") + "/>"; }
  function L(x1, y1, x2, y2, cls) { return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="' + (cls || "vc-ax") + '"/>'; }
  /* smooth line through points (Catmull-Rom as cubic Bézier) */
  function smooth(p, straight) {
    if (!p.length) return ""; var d = "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
    for (var k = 0; k < p.length - 1; k++) {
      if (straight) { d += "L" + p[k + 1][0].toFixed(1) + " " + p[k + 1][1].toFixed(1); continue; }
      var a = p[Math.max(k - 1, 0)], b = p[k], c = p[k + 1], e = p[Math.min(k + 2, p.length - 1)];
      d += "C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1);
    }
    return d;
  }
  function arc(cx, cy, r, a0, a1) { var p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)]; return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + "A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2); }
  function nice(v) { if (v <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  function ticks(lo, hi, n) { var st = nice((hi - lo) / (n || 4)), a = Math.floor(lo / st) * st, out = []; for (var v = a; v <= hi + st * 0.001; v += st) out.push(+v.toFixed(6)); if (out[out.length - 1] < hi) out.push(+(out[out.length - 1] + st).toFixed(6)); return out; }

  /* ---------- shared frames ---------- */
  /* x/y plot frame for time and value charts */
  function frame(s, W, H, opt) {
    opt = opt || {}; var pl = opt.pl == null ? 40 : opt.pl, pr = opt.pr == null ? 14 : opt.pr, pt = opt.pt == null ? 14 : opt.pt, pb = opt.pb == null ? 26 : opt.pb;
    var all = []; (opt.vals || []).forEach(function (a) { all = all.concat(a); });
    var lo = opt.lo != null ? opt.lo : (s.zero === false ? mn(all) : Math.min(0, mn(all))), hi = opt.hi != null ? opt.hi : mx(all);
    var tk = ticks(lo, hi, opt.n || 4); lo = tk[0]; hi = tk[tk.length - 1];
    var cw = W - pl - pr, ch = H - pt - pb, n = (s.cats || []).length;
    var f = { W: W, H: H, pl: pl, pr: pr, pt: pt, pb: pb, cw: cw, ch: ch, lo: lo, hi: hi,
      y: function (v) { return pt + ch - (v - lo) / (hi - lo || 1) * ch; },
      x: opt.band ? function (k) { return pl + cw / n * (k + 0.5); } : function (k) { return pl + (n < 2 ? cw / 2 : cw * k / (n - 1)); }, step: cw / Math.max(1, n) };
    var g = tk.map(function (v) { var y = f.y(v); return L(pl, y, W - pr, y, v === 0 || v === lo ? "vc-ax" : "vc-grid") + (s.noY ? "" : T(pl - 8, y + 4, fmt(v, { fmt: s.axisFmt || s.fmt, pre: s.pre }), "vc-tk", "end")); }).join("");
    var xs = (s.cats || []).map(function (c, k) { return (opt.everyOther && k % 2 && k !== n - 1) ? "" : T(f.x(k), H - 8, c, "vc-tk", "middle"); }).join("");
    f.grid = g + xs; return f;
  }

  /* ---------- templates ---------- */
  var R_ = {};
  /* Comparison */
  R_.bars = function (s) { /* ranked horizontal bars, highlight what matters */
    var m = s.max || mx(s.rows.map(function (r) { return r.v; }));
    return '<div class="vc-rows">' + s.rows.map(function (r, k) { return '<div class="vc-row' + (r.total ? " tot" : "") + '"><span class="vc-l">' + esc(r.label) + '</span><span class="vc-bar">' + (r.v == null ? '<i class="vc-u"></i><b class="unk">Unknown</b>' : '<i class="vc-g" style="--w:' + (r.v / m * 84).toFixed(1) + "%;--d:" + k * 60 + "ms;background:" + (r.hl ? C.main : C.light) + '"></i><b>' + fmt(r.v, s) + "</b>") + "</span></div>"; }).join("") + "</div>";
  };
  R_.pairs = function (s) { /* two bars per category, as in Exhibit 4 */
    return leg(s) + '<div class="vc-rows">' + s.rows.map(function (r, k) {
      var m = r.max || s.max || 100, one = function (v, j) { return v == null ? '<span class="vc-bar"><i class="vc-u sm"></i><b class="unk">Unknown</b></span>' : '<span class="vc-bar"><i class="vc-g sm" style="--w:' + (v / m * 84).toFixed(1) + "%;--d:" + (k * 2 + j) * 50 + "ms;background:" + col(s, j) + '"></i><b>' + fmt(v, s) + "</b></span>"; };
      return '<div class="vc-row' + (r.total ? " tot" : "") + '"><span class="vc-l">' + esc(r.label) + '</span><span class="vc-pair">' + one(r.a, 0) + one(r.b, 1) + (r.c != null ? one(r.c, 2) : "") + "</span></div>";
    }).join("") + "</div>";
  };
  R_.lollipop = function (s) {
    var W = 600, rh = 34, H = s.rows.length * rh + 8, pl = 150, m = s.max || mx(s.rows.map(function (r) { return r.v; })), sc = function (v) { return pl + v / m * (W - pl - 60); };
    return svg(W, H, s.rows.map(function (r, k) { var y = k * rh + rh / 2 + 4, x = sc(r.v), c = r.hl ? C.main : C.light;
      return T(pl - 14, y + 4, r.label, "vc-cat", "end") + '<line class="vc-draw-x" x1="' + pl + '" x2="' + x.toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + c + '" stroke-width="2"/>' + '<circle class="vc-pop" cx="' + x.toFixed(1) + '" cy="' + y + '" r="6" fill="' + c + '" style="--d:' + k * 70 + 'ms"/>' + T(x + 12, y + 4, fmt(r.v, s), "vc-val"); }).join("") + L(pl, 0, pl, H), s.title);
  };
  R_.dumbbell = function (s) { /* before and after per category */
    var W = 600, rh = 36, H = s.rows.length * rh + 30, pl = 150, all = []; s.rows.forEach(function (r) { all.push(r.a, r.b); });
    var lo = s.lo != null ? s.lo : Math.min(0, mn(all)), hi = s.max || nice(mx(all)), sc = function (v) { return pl + (v - lo) / (hi - lo) * (W - pl - 40); };
    return leg(s, s.series, "dot") + svg(W, H, s.rows.map(function (r, k) { var y = k * rh + rh / 2 + 4, xa = sc(r.a), xb = sc(r.b);
      return T(pl - 14, y + 4, r.label, "vc-cat", "end") + L(pl, y, W - 40, y, "vc-grid") + '<line class="vc-draw-x" x1="' + xa.toFixed(1) + '" x2="' + xb.toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + C.pale + '" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="' + xa.toFixed(1) + '" cy="' + y + '" r="6" fill="' + col(s, 1) + '"/><circle class="vc-pop" cx="' + xb.toFixed(1) + '" cy="' + y + '" r="6" fill="' + col(s, 0) + '" style="--d:' + (300 + k * 80) + 'ms"/>' +
        T(xb + (xb >= xa ? 12 : -12), y + 4, fmt(r.b, s), "vc-val", xb >= xa ? "start" : "end"); }).join("") + T(pl, H - 4, fmt(lo, s), "vc-tk", "start") + T(W - 40, H - 4, fmt(hi, s), "vc-tk", "end"), s.title);
  };
  R_.slope = function (s) { /* two points in time, who moved */
    var W = 600, H = 240, x0 = 170, x1 = 430, all = []; s.rows.forEach(function (r) { all.push(r.a, r.b); });
    var lo = mn(all), hi = mx(all), y = function (v) { return 30 + (hi - v) / (hi - lo || 1) * (H - 60); };
    return svg(W, H, T(x0, 14, s.cats[0], "vc-tk", "middle") + T(x1, 14, s.cats[1], "vc-tk", "middle") + L(x0, 22, x0, H - 10, "vc-grid") + L(x1, 22, x1, H - 10, "vc-grid") +
      s.rows.map(function (r, k) { var c = r.hl ? C.main : C.light, ya = y(r.a), yb = y(r.b);
        return '<path class="vc-draw" pathLength="1" d="M' + x0 + " " + ya.toFixed(1) + "L" + x1 + " " + yb.toFixed(1) + '" stroke="' + c + '" stroke-width="' + (r.hl ? 2.5 : 1.6) + '" fill="none" style="--d:' + k * 90 + 'ms"/><circle cx="' + x0 + '" cy="' + ya.toFixed(1) + '" r="4.5" fill="' + c + '"/><circle cx="' + x1 + '" cy="' + yb.toFixed(1) + '" r="4.5" fill="' + c + '"/>' +
          T(x0 - 12, ya + 4, r.label + "  " + fmt(r.a, s), r.hl ? "vc-val" : "vc-cat", "end") + T(x1 + 12, yb + 4, fmt(r.b, s) + "  " + r.label, r.hl ? "vc-val" : "vc-cat", "start"); }).join(""), s.title);
  };
  R_.bullet = function (s) { /* actual against target */
    return legx([["Actual", C.main], ["Target", C.deep, "tg"]]) + '<div class="vc-rows">' + s.rows.map(function (r, k) { var m = r.max || s.max || 100;
      return '<div class="vc-row"><span class="vc-l">' + esc(r.label) + '</span><span class="vc-bar vc-bul"><span class="vc-track"><i class="vc-g" style="--w:' + (r.v / m * 100).toFixed(1) + "%;--d:" + k * 70 + "ms;background:" + (r.v >= r.target ? C.main : C.mid) + '"></i><em style="left:' + (r.target / m * 100).toFixed(1) + '%"></em></span><b>' + fmt(r.v, s) + '<small> of ' + fmt(r.target, s) + "</small></b></span></div>"; }).join("") + "</div>";
  };
  R_.progress = function (s) { /* how far along each item is */
    return '<div class="vc-prog">' + s.rows.map(function (r, k) { return '<div><p><span>' + esc(r.label) + "</span><b>" + fmt(r.v, s) + '</b></p><span class="vc-track"><i class="vc-g" style="--w:' + Math.min(100, r.v / (r.max || s.max || 100) * 100).toFixed(1) + "%;--d:" + k * 80 + "ms;background:" + (r.hl ? C.main : C.mid) + '"></i></span></div>'; }).join("") + "</div>";
  };
  R_.waffle = function (s) { /* share of 100 */
    var cells = "", acc = [], t = 0; s.parts.forEach(function (p, k) { t += p.v; acc.push(Math.round(t)); });
    for (var i = 0; i < 100; i++) { var k = 0; while (k < acc.length - 1 && i >= acc[k]) k++; var on = i < acc[acc.length - 1]; cells += '<i style="background:' + (on ? pcol(s, s.parts[k], k) : C.wash) + ";--d:" + i * 8 + 'ms"></i>'; }
    return '<div class="vc-waf"><div class="vc-wg">' + cells + '</div><ul class="vc-wl">' + s.parts.map(function (p, k) { return '<li><i style="background:' + pcol(s, p, k) + '"></i><b>' + fmt(p.v, { fmt: "%" }) + "</b><span>" + esc(p.label) + "</span></li>"; }).join("") + "</ul></div>";
  };
  R_.diverge = function (s) { /* change up and down from zero */
    var m = mx(s.rows.map(function (r) { return Math.abs(r.v); }));
    return '<div class="vc-rows">' + s.rows.map(function (r, k) { var w = Math.abs(r.v) / m * 42, pos = r.v >= 0;
      return '<div class="vc-row"><span class="vc-l">' + esc(r.label) + '</span><span class="vc-dv"><span class="n">' + (pos ? "" : "<b>−" + fmt(Math.abs(r.v), s) + '</b><i class="vc-g" style="--w:' + (w * 2).toFixed(1) + "%;--d:" + k * 60 + "ms;background:" + C.light + '"></i>') + '</span><span class="p">' + (pos ? '<i class="vc-g" style="--w:' + (w * 2).toFixed(1) + "%;--d:" + k * 60 + "ms;background:" + C.main + '"></i><b>+' + fmt(r.v, s) + "</b>" : "") + "</span></span></div>"; }).join("") + "</div>";
  };
  R_.rank = function (s) { /* ranked list with movement since last time */
    return '<ol class="vc-rank">' + s.rows.map(function (r, k) { var d = r.prev - (k + 1); return '<li class="' + (r.hl ? "hl" : "") + '"><span class="n">' + (k + 1) + '</span><span class="l">' + esc(r.label) + '</span><span class="v">' + fmt(r.v, s) + '</span><span class="m ' + (d > 0 ? "up" : d < 0 ? "dn" : "") + '">' + (d > 0 ? "▲ " + d : d < 0 ? "▼ " + -d : "–") + "</span></li>"; }).join("") + "</ol>";
  };
  R_.tablebars = function (s) { /* table with a bar in the value column */
    var m = mx(s.rows.map(function (r) { return r.v; }));
    return '<table class="vc-tb"><thead><tr>' + s.cols.map(function (c, k) { return "<th" + (k ? ' class="r"' : "") + ">" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + s.rows.map(function (r, k) {
      return "<tr><td>" + esc(r.label) + "</td>" + (r.extra || []).map(function (e) { return '<td class="r">' + esc(e) + "</td>"; }).join("") + '<td class="r vc-tbv"><span><i class="vc-g" style="--w:' + (r.v / m * 100).toFixed(1) + "%;--d:" + k * 60 + "ms;background:" + (r.hl ? C.main : C.light) + '"></i></span><b>' + fmt(r.v, s) + "</b></td></tr>"; }).join("") + "</tbody></table>";
  };
  /* Columns */
  R_.cols = function (s) {
    var f = frame(s, 600, 220, { band: true, vals: [s.vals], noYTicks: true }), bw = f.step * (s.thin ? 0.4 : 0.56);
    return svg(600, 220, f.grid + s.vals.map(function (v, k) { var x = f.x(k) - bw / 2, y = f.y(v), hl = (s.hl || []).indexOf(k) >= 0 || (!s.hl && k === s.vals.length - 1);
      return R(x, y, bw, f.y(f.lo) - y, hl ? C.main : C.light, "vc-gy", 2).replace("/>", ' style="--d:' + k * 50 + 'ms"/>') + (s.labels === false ? "" : T(f.x(k), y - 6, fmt(v, s), hl ? "vc-val" : "vc-tk", "middle")); }).join(""), s.title);
  };
  R_.groupcols = function (s) {
    var all = []; s.data.forEach(function (a) { all = all.concat(a); });
    var f = frame(s, 600, 230, { band: true, vals: [all] }), n = s.data.length, gw = f.step * 0.7, bw = gw / n;
    return leg(s) + svg(600, 230, f.grid + s.cats.map(function (c, k) { return s.data.map(function (a, j) { var x = f.x(k) - gw / 2 + j * bw, y = f.y(a[k]); return R(x + 1, y, bw - 2, f.y(f.lo) - y, col(s, j), "vc-gy", 2).replace("/>", ' style="--d:' + (k * n + j) * 40 + 'ms"/>'); }).join(""); }).join(""), s.title);
  };
  R_.stackcols = function (s) {
    var tot = s.cats.map(function (c, k) { return s.data.reduce(function (t, a) { return t + a[k]; }, 0); });
    var f = frame(s, 600, 230, { band: true, vals: [tot], hi: s.pct ? 100 : null }), bw = f.step * 0.55;
    return leg(s) + svg(600, 230, f.grid + s.cats.map(function (c, k) { var acc = 0; return s.data.map(function (a, j) { var v = s.pct ? a[k] / tot[k] * 100 : a[k], y0 = f.y(acc), y1 = f.y(acc + v); acc += v; return R(f.x(k) - bw / 2, y1, bw, y0 - y1 - 1, col(s, j), "vc-gy").replace("/>", ' style="--d:' + k * 60 + 'ms"/>'); }).join(""); }).join(""), s.title);
  };
  R_.stackbar = function (s) { /* 100% bars: mix per category */
    return leg(s) + '<div class="vc-rows">' + s.rows.map(function (r, k) { var t = r.v.reduce(function (a, b) { return a + b; }, 0);
      return '<div class="vc-row"><span class="vc-l">' + esc(r.label) + '</span><span class="vc-stk" style="--d:' + k * 80 + 'ms">' + r.v.map(function (v, j) { var p = v / t * 100; return '<i style="flex:' + p.toFixed(2) + " 1 0;background:" + col(s, j) + '">' + (p >= 9 ? "<b" + (j === 0 || j === 3 ? ' class="on"' : "") + ">" + Math.round(p) + "%</b>" : "") + "</i>"; }).join("") + "</span></div>"; }).join("") + "</div>";
  };
  R_.split = function (s) { /* one 100% bar with labels underneath */
    var t = s.parts.reduce(function (a, p) { return a + p.v; }, 0);
    return '<div class="vc-split"><span class="vc-stk big">' + s.parts.map(function (p, k) { return '<i style="flex:' + (p.v / t * 100).toFixed(2) + " 1 0;background:" + pcol(s, p, k) + '"></i>'; }).join("") + '</span><ul>' + s.parts.map(function (p, k) { return '<li><b>' + Math.round(p.v / t * 100) + '%</b><span><i style="background:' + pcol(s, p, k) + '"></i>' + esc(p.label) + "</span></li>"; }).join("") + "</ul></div>";
  };
  R_.waterfall = function (s) { /* what explains the change from A to B */
    var steps = [{ label: s.start.label, v: s.start.v, base: 0, kind: "t" }], acc = s.start.v;
    s.steps.forEach(function (p) { steps.push({ label: p.label, v: p.v, base: p.v >= 0 ? acc : acc + p.v, kind: p.v >= 0 ? "u" : "d" }); acc += p.v; });
    steps.push({ label: s.end || "Now", v: acc, base: 0, kind: "t" });
    var hi = mx(steps.map(function (p) { return p.kind === "t" ? p.v : p.base + Math.abs(p.v); })), f = frame({ cats: steps.map(function (p) { return p.label; }), fmt: s.fmt, noY: true }, 600, 230, { band: true, vals: [[0, hi]], pl: 12 }), bw = f.step * 0.56;
    return svg(600, 230, f.grid + steps.map(function (p, k) { var top = p.kind === "t" ? p.v : p.base + Math.abs(p.v), y = f.y(top), h = f.y(p.kind === "t" ? 0 : p.base) - y, c = p.kind === "t" ? C.main : p.kind === "u" ? C.mid : C.light;
      return R(f.x(k) - bw / 2, y, bw, h, c, "vc-gy", 2).replace("/>", ' style="--d:' + k * 90 + 'ms"/>') + T(f.x(k), y - 6, (p.kind === "t" ? "" : p.v > 0 ? "+" : "−") + fmt(Math.abs(p.v), s), p.kind === "t" ? "vc-val" : "vc-tk", "middle") +
        (k < steps.length - 1 ? L(f.x(k) + bw / 2, f.y(p.kind === "d" ? p.base : top), f.x(k + 1) - bw / 2, f.y(p.kind === "d" ? p.base : top), "vc-con") : ""); }).join(""), s.title);
  };
  R_.histogram = function (s) {
    var f = frame(s, 600, 220, { band: true, vals: [s.vals] }), bw = f.step - 2;
    return svg(600, 220, f.grid + s.vals.map(function (v, k) { var y = f.y(v), hl = s.hl && k >= s.hl[0] && k <= s.hl[1]; return R(f.x(k) - bw / 2, y, bw, f.y(f.lo) - y, hl ? C.main : C.light, "vc-gy").replace("/>", ' style="--d:' + k * 30 + 'ms"/>'); }).join(""), s.title);
  };
  R_.colsline = function (s) { /* volume as columns, rate as a line */
    var f = frame(s, 600, 230, { band: true, vals: [s.vals], pr: 44 }), bw = f.step * 0.5, lo2 = mn(s.line) * 0.9, hi2 = mx(s.line) * 1.05, y2 = function (v) { return f.pt + f.ch - (v - lo2) / (hi2 - lo2) * f.ch; };
    var pts = s.line.map(function (v, k) { return [f.x(k), y2(v)]; });
    return legx([[s.series[0], C.pale], [s.series[1], C.main, "ln"]]) + svg(600, 230, f.grid + s.vals.map(function (v, k) { var y = f.y(v); return R(f.x(k) - bw / 2, y, bw, f.y(f.lo) - y, C.pale, "vc-gy", 2).replace("/>", ' style="--d:' + k * 50 + 'ms"/>'); }).join("") +
      '<path class="vc-draw" pathLength="1" d="' + smooth(pts) + '" stroke="' + C.main + '" stroke-width="2.2" fill="none"/>' + pts.map(function (p, k) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="#fff" stroke="' + C.main + '" stroke-width="2"/>'; }).join("") +
      T(600 - 4, y2(s.line[s.line.length - 1]) + 4, fmt(s.line[s.line.length - 1], { fmt: s.lineFmt, pre: s.linePre }), "vc-val", "end"), s.title);
  };
  /* Trend */
  function lines(s, opt) {
    opt = opt || {}; var data = s.data || [s.vals];
    var tot = opt.stack ? [s.cats.map(function (c, k) { return data.reduce(function (t, a) { return t + (a[k] || 0); }, 0); })] : [];
    var f = frame(s, 600, 230, { vals: data.concat(tot, s.band ? [s.band.lo, s.band.hi] : []), pr: opt.endLabel ? 56 : 14, everyOther: s.cats.length > 8, lo: s.lo, hi: s.hi });
    var g = f.grid, base = f.y(Math.max(f.lo, 0));
    if (s.events) g += s.events.map(function (e) { var x = f.x(e.at); return L(x, f.pt, x, f.y(f.lo), "vc-ev") + T(x + 5, f.pt + 10, e.label, "vc-evt", "start"); }).join("");
    if (s.band) { var up = s.band.hi.map(function (v, k) { return [f.x(k + s.band.from), f.y(v)]; }), dn = s.band.lo.map(function (v, k) { return [f.x(k + s.band.from), f.y(v)]; }).reverse(); g += '<path class="vc-fade" d="' + smooth(up) + "L" + smooth(dn).slice(1) + 'Z" fill="' + C.pale + '" opacity=".7"/>'; }
    if (opt.stack) { var acc = s.cats.map(function () { return 0; }); g += data.map(function (a, j) { var top = a.map(function (v, k) { return [f.x(k), f.y(acc[k] + v)]; }), bot = a.map(function (v, k) { return [f.x(k), f.y(acc[k])]; }).reverse(); a.forEach(function (v, k) { acc[k] += v; }); return '<path class="vc-fade" style="--d:' + j * 150 + 'ms" d="' + smooth(top) + "L" + smooth(bot).slice(1) + 'Z" fill="' + col(s, j) + '" opacity=".9"/>'; }).join(""); return g; }
    data.forEach(function (a, j) {
      var pts = []; a.forEach(function (v, k) { if (v != null) pts.push([f.x(k), f.y(v)]); });
      var c = col(s, j), dash = s.dash && s.dash[j];
      var stepD = pts.map(function (p, k) { return (k ? "H" + p[0].toFixed(1) + "V" : "M" + p[0].toFixed(1) + " ") + p[1].toFixed(1); }).join("");
      if (opt.area && j === 0) { var id = "vcg" + (++uid); g += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".22"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs><path class="vc-fade" d="' + (opt.step ? stepD : smooth(pts)) + "L" + pts[pts.length - 1][0].toFixed(1) + " " + base.toFixed(1) + "L" + pts[0][0].toFixed(1) + " " + base.toFixed(1) + 'Z" fill="url(#' + id + ')"/>'; }
      var d = opt.step ? stepD : smooth(pts, s.straight);
      g += '<path class="vc-draw" pathLength="1" style="--d:' + j * 250 + 'ms" d="' + d + '" stroke="' + c + '" stroke-width="' + (j === 0 ? 2.4 : 1.8) + '" fill="none"' + (dash ? ' stroke-dasharray="4 4"' : "") + "/>";
      if (s.marks) g += s.marks.filter(function (m) { return m.s === j || (m.s == null && j === 0); }).map(function (m) { var p = [f.x(m.at), f.y(a[m.at])]; return '<circle class="vc-pop" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="#fff" stroke="' + c + '" stroke-width="2"/>' + (m.label ? '<g class="vc-pop"><rect x="' + (p[0] - 34).toFixed(1) + '" y="' + (p[1] - 30).toFixed(1) + '" width="68" height="20" rx="10" fill="' + C.deep + '"/>' + T(p[0], p[1] - 16, m.label, "vc-tip", "middle") + "</g>" : ""); }).join("");
      if (opt.endLabel) { var e = pts[pts.length - 1]; g += '<circle cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '" r="3.5" fill="' + c + '"/>' + T(e[0] + 8, e[1] + 4, fmt(a[a.length - 1], s), "vc-val", "start"); }
    });
    return g;
  }
  R_.line = function (s) { return leg(s) + svg(600, 230, lines(s, { endLabel: true }), s.title); };
  R_.lines = function (s) { return leg(s, s.series, "ln") + svg(600, 230, lines(s), s.title); };
  R_.area = function (s) { return leg(s, s.series, "ln") + svg(600, 230, lines(s, { area: true }), s.title); };
  R_.stackarea = function (s) { return leg(s) + svg(600, 230, lines(s, { stack: true }), s.title); };
  R_.step = function (s) { return leg(s, s.series, "ln") + svg(600, 230, lines(s, { step: true, area: !s.data }), s.title); };
  R_.band = function (s) { return leg(s, s.series, "ln") + svg(600, 230, lines(s), s.title); };
  R_.index = function (s) { s.zero = false; return leg(s, s.series, "ln") + svg(600, 230, lines(s, { endLabel: false }), s.title); };
  R_.events = function (s) { return leg(s, s.series, "ln") + svg(600, 230, lines(s), s.title); };
  R_.sparks = function (s) { /* several items, each with its own small trend */
    return '<table class="vc-tb vc-sp"><thead><tr><th>' + esc(s.cols[0]) + '</th><th>' + esc(s.cols[1]) + '</th><th class="r">' + esc(s.cols[2]) + '</th><th class="r">' + esc(s.cols[3] || "Change") + "</th></tr></thead><tbody>" + s.rows.map(function (r) {
      var lo = mn(r.vals), hi = mx(r.vals), p = r.vals.map(function (v, k) { return [4 + k * 112 / (r.vals.length - 1), 26 - (v - lo) / (hi - lo || 1) * 22]; }), ch = r.vals[r.vals.length - 1] - r.vals[0], c = ch < 0 ? C.light : C.main;
      return "<tr><td>" + esc(r.label) + '</td><td><svg viewBox="0 0 120 30" class="vc-spk"><path class="vc-draw" pathLength="1" d="' + smooth(p) + '" stroke="' + c + '" stroke-width="1.8" fill="none"/><circle cx="' + p[p.length - 1][0].toFixed(1) + '" cy="' + p[p.length - 1][1].toFixed(1) + '" r="2.6" fill="' + c + '"/></svg></td><td class="r">' + fmt(r.vals[r.vals.length - 1], s) + '</td><td class="r ' + (ch < 0 ? "dn" : "up") + '">' + (ch > 0 ? "+" : ch < 0 ? "−" : "") + fmt(Math.abs(+(ch).toFixed(1)), s) + "</td></tr>";
    }).join("") + "</tbody></table>";
  };
  /* Part of whole */
  function donut(cx, cy, r, w, parts, s, lab) {
    var t = parts.reduce(function (a, p) { return a + p.v; }, 0), a0 = -Math.PI / 2, out = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C.wash + '" stroke-width="' + w + '"/>';
    parts.forEach(function (p, k) { var a1 = a0 + p.v / t * Math.PI * 2 - 0.02; out += '<path class="vc-draw" pathLength="1" style="--d:' + k * 160 + 'ms" d="' + arc(cx, cy, r, a0, a1) + '" stroke="' + (p.c || pcol(s, p, k)) + '" stroke-width="' + w + '" fill="none"/>'; a0 = a1 + 0.02; });
    return out + (lab ? T(cx, cy + (lab[1] ? 2 : 8), lab[0], "vc-big", "middle") + (lab[1] ? T(cx, cy + 22, lab[1], "vc-tk", "middle") : "") : "");
  }
  R_.donut = function (s) {
    var t = s.parts.reduce(function (a, p) { return a + p.v; }, 0);
    return '<div class="vc-dn">' + svg(220, 220, donut(110, 110, 82, 22, s.parts, s, [s.centre || Math.round(s.parts[0].v / t * 100) + "%", s.centreSub || s.parts[0].label]), s.title, "sq") + '<ul class="vc-wl">' + s.parts.map(function (p, k) { return '<li><i style="background:' + pcol(s, p, k) + '"></i><b>' + Math.round(p.v / t * 100) + "%</b><span>" + esc(p.label) + "</span></li>"; }).join("") + "</ul></div>";
  };
  R_.donuts = function (s) { /* one ring per area or segment */
    return '<div class="vc-dns">' + s.rows.map(function (r) { return "<div>" + svg(120, 120, donut(60, 60, 44, 10, [{ v: r.v, c: r.hl ? C.main : C.mid }, { v: (r.max || 100) - r.v, c: "transparent" }], s, [fmt(r.v, s)]), r.label, "sq") + "<p>" + esc(r.label) + "</p></div>"; }).join("") + "</div>";
  };
  R_.gauge = function (s) { /* one share against its full range */
    var m = s.max || 100, a1 = Math.PI + Math.PI * Math.min(1, s.v / m), tg = s.target != null ? Math.PI + Math.PI * s.target / m : null;
    return '<div class="vc-ga">' + svg(300, 170, '<path d="' + arc(150, 150, 118, Math.PI, Math.PI * 2 - 0.0001) + '" stroke="' + C.wash + '" stroke-width="20" fill="none" stroke-linecap="round"/><path class="vc-draw" pathLength="1" d="' + arc(150, 150, 118, Math.PI, a1) + '" stroke="' + C.main + '" stroke-width="20" fill="none" stroke-linecap="round"/>' +
      (tg ? '<line x1="' + (150 + 100 * Math.cos(tg)).toFixed(1) + '" y1="' + (150 + 100 * Math.sin(tg)).toFixed(1) + '" x2="' + (150 + 138 * Math.cos(tg)).toFixed(1) + '" y2="' + (150 + 138 * Math.sin(tg)).toFixed(1) + '" stroke="' + C.deep + '" stroke-width="2"/>' : "") +
      T(150, 132, fmt(s.v, s), "vc-huge", "middle") + T(150, 156, s.label || "", "vc-tk", "middle") + T(32, 168, fmt(0, s), "vc-tk", "middle") + T(268, 168, fmt(m, s), "vc-tk", "middle"), s.title, "sq") + (s.target != null ? '<p class="vc-cap">Target ' + fmt(s.target, s) + "</p>" : "") + "</div>";
  };
  R_.rings = function (s) { /* two or three measures as concentric rings */
    var out = ""; s.rows.forEach(function (r, k) { var rr = 92 - k * 22, a1 = -Math.PI / 2 + Math.PI * 2 * Math.min(.999, r.v / (r.max || 100)); out += '<circle cx="110" cy="110" r="' + rr + '" fill="none" stroke="' + C.wash + '" stroke-width="14"/><path class="vc-draw" pathLength="1" style="--d:' + k * 200 + 'ms" d="' + arc(110, 110, rr, -Math.PI / 2, a1) + '" stroke="' + col(s, k) + '" stroke-width="14" fill="none" stroke-linecap="round"/>'; });
    return '<div class="vc-dn">' + svg(220, 220, out, s.title, "sq") + '<ul class="vc-wl">' + s.rows.map(function (r, k) { return '<li><i style="background:' + col(s, k) + '"></i><b>' + fmt(r.v, s) + "</b><span>" + esc(r.label) + "</span></li>"; }).join("") + "</ul></div>";
  };
  R_.treemap = function (s) { /* shares of a category, biggest first (slice and dice) */
    var parts = s.parts.slice().sort(function (a, b) { return b.v - a.v; }), t = parts.reduce(function (a, p) { return a + p.v; }, 0), W = 600, H = 240, out = "";
    (function lay(ps, x, y, w, h, vert, k0) { if (!ps.length) return; var p = ps[0], tt = ps.reduce(function (a, q) { return a + q.v; }, 0), f = p.v / tt;
      var rw = vert ? w : w * f, rh = vert ? h * f : h; var k = k0, c = p.hl ? C.main : /^others?$/i.test(p.label) ? C.grey : [C.mid, C.light, C.pale, C.light, C.pale][k % 5];
      out += '<g class="vc-fade" style="--d:' + k * 90 + 'ms">' + R(x + 1, y + 1, rw - 2, rh - 2, c, "", 3) + (rw > 70 && rh > 40 ? T(x + 12, y + 24, p.label, p.hl || c === C.mid ? "vc-tl on" : "vc-tl", "start") + T(x + 12, y + 42, Math.round(p.v / t * 100) + "%", p.hl || c === C.mid ? "vc-tv on" : "vc-tv", "start") : "") + "</g>";
      lay(ps.slice(1), vert ? x : x + rw, vert ? y + rh : y, vert ? w : w - rw, vert ? h - rh : h, !vert, k0 + 1); })(parts, 0, 0, W, H, false, 0);
    return svg(W, H, out, s.title);
  };
  R_.funnel = function (s) { /* how many make it through each step */
    var top = s.rows[0].v;
    return '<div class="vc-fn">' + s.rows.map(function (r, k) { var w = r.v / top * 100; return '<div><span class="vc-l">' + esc(r.label) + '</span><span class="vc-fb"><i class="vc-g" style="--w:' + w.toFixed(1) + "%;--d:" + k * 110 + "ms;background:" + [C.main, C.mid, C.light, C.pale, C.pale][k] + '"><b>' + fmt(r.v, s) + "</b></i></span>" + (k ? '<em>' + Math.round(r.v / s.rows[k - 1].v * 100) + "% of previous</em>" : "<em></em>") + "</div>"; }).join("") + "</div>";
  };
  /* Relationships and spread */
  R_.scatter = function (s) {
    var xs = s.pts.map(function (p) { return p.x; }), ys = s.pts.map(function (p) { return p.y; }), W = 600, H = 250, pl = 46, pb = 40, pt = 12, pr = 16;
    var tx = ticks(mn(xs), mx(xs), 5), ty = ticks(Math.min(0, mn(ys)), mx(ys), 4), X = function (v) { return pl + (v - tx[0]) / (tx[tx.length - 1] - tx[0]) * (W - pl - pr); }, Y = function (v) { return pt + (ty[ty.length - 1] - v) / (ty[ty.length - 1] - ty[0]) * (H - pt - pb); };
    var g = ty.map(function (v) { return L(pl, Y(v), W - pr, Y(v), "vc-grid") + T(pl - 8, Y(v) + 4, fmt(v, { fmt: s.yFmt }), "vc-tk", "end"); }).join("") + tx.map(function (v) { return T(X(v), H - pb + 18, fmt(v, { fmt: s.xFmt, pre: s.xPre }), "vc-tk", "middle"); }).join("") + T(W - pr, H - 4, s.xLabel || "", "vc-tk", "end") + T(pl, pt - 2 + 8, "", "vc-tk");
    if (s.fit) { var n = xs.length, sx = 0, sy = 0, sxy = 0, sxx = 0; s.pts.forEach(function (p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; }); var b = (n * sxy - sx * sy) / (n * sxx - sx * sx), a = (sy - b * sx) / n; g += '<path class="vc-draw" pathLength="1" d="M' + X(tx[0]).toFixed(1) + " " + Y(a + b * tx[0]).toFixed(1) + "L" + X(tx[tx.length - 1]).toFixed(1) + " " + Y(a + b * tx[tx.length - 1]).toFixed(1) + '" stroke="' + C.faint + '" stroke-dasharray="4 4" fill="none"/>'; }
    g += s.pts.map(function (p, k) { return '<circle class="vc-pop" style="--d:' + k * 25 + 'ms" cx="' + X(p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '" r="' + (p.r || 5) + '" fill="' + (p.hl ? C.main : C.light) + '" fill-opacity="' + (p.r ? .7 : .9) + '"/>' + (p.label ? T(X(p.x) + (p.r || 5) + 5, Y(p.y) + 4, p.label, p.hl ? "vc-val" : "vc-tk", "start") : ""); }).join("");
    return leg(s, s.series, "dot") + svg(W, H, g + T(pl - 40, pt + 4, s.yLabel || "", "vc-tk", "start").replace("<text", '<text transform="rotate(0)"'), s.title);
  };
  R_.bubble = function (s) { s.pts.forEach(function (p) { p.r = 6 + Math.sqrt(p.size / mx(s.pts.map(function (q) { return q.size; }))) * 22; }); return R_.scatter(s); };
  R_.range = function (s) { /* low to high, with the typical value */
    var W = 600, rh = 34, H = s.rows.length * rh + 30, pl = 150, all = []; s.rows.forEach(function (r) { all.push(r.lo, r.hi); });
    var tk = ticks(mn(all), mx(all), 4), X = function (v) { return pl + (v - tk[0]) / (tk[tk.length - 1] - tk[0]) * (W - pl - 30); };
    return svg(W, H, tk.map(function (v) { return L(X(v), 0, X(v), H - 24, "vc-grid") + T(X(v), H - 6, fmt(v, s), "vc-tk", "middle"); }).join("") + s.rows.map(function (r, k) { var y = k * rh + rh / 2;
      return T(pl - 14, y + 4, r.label, "vc-cat", "end") + '<line class="vc-draw-x" x1="' + X(r.lo).toFixed(1) + '" x2="' + X(r.hi).toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + C.pale + '" stroke-width="10" stroke-linecap="round"/><circle class="vc-pop" style="--d:' + (200 + k * 70) + 'ms" cx="' + X(r.mid).toFixed(1) + '" cy="' + y + '" r="6" fill="' + (r.hl ? C.main : C.mid) + '" stroke="#fff" stroke-width="2"/>'; }).join(""), s.title);
  };
  R_.strip = function (s) { /* every observation as a dot */
    var W = 600, rh = 40, H = s.rows.length * rh + 30, pl = 150, all = []; s.rows.forEach(function (r) { all = all.concat(r.vals); });
    var tk = ticks(mn(all), mx(all), 4), X = function (v) { return pl + (v - tk[0]) / (tk[tk.length - 1] - tk[0]) * (W - pl - 30); };
    return svg(W, H, tk.map(function (v) { return L(X(v), 0, X(v), H - 24, "vc-grid") + T(X(v), H - 6, fmt(v, s), "vc-tk", "middle"); }).join("") + s.rows.map(function (r, k) { var y = k * rh + rh / 2, m = r.vals.reduce(function (a, b) { return a + b; }, 0) / r.vals.length;
      return T(pl - 14, y + 4, r.label, "vc-cat", "end") + r.vals.map(function (v, j) { return '<circle class="vc-pop" style="--d:' + (k * 120 + j * 12) + 'ms" cx="' + X(v).toFixed(1) + '" cy="' + (y + ((j * 7) % 13) - 6) + '" r="3.6" fill="' + (r.hl ? C.main : C.light) + '" fill-opacity=".75"/>'; }).join("") + L(X(m), y - 12, X(m), y + 12, "vc-mean"); }).join(""), s.title);
  };
  R_.heatmap = function (s) { /* rows × columns, darker is higher */
    var all = []; s.data.forEach(function (r) { all = all.concat(r); }); var lo = mn(all), hi = mx(all), sh = [C.wash, C.pale, C.light, C.mid, C.main];
    return '<table class="vc-hm"><thead><tr><th></th>' + s.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + s.rows.map(function (r, i) { return "<tr><th>" + esc(r) + "</th>" + s.data[i].map(function (v, j) { var q = Math.min(4, Math.floor((v - lo) / (hi - lo || 1) * 4.999)); return '<td style="background:' + sh[q] + ";--d:" + (i * s.cols.length + j) * 15 + 'ms" class="' + (q >= 3 ? "on" : "") + '">' + (s.values === false ? "" : fmt(v, s)) + "</td>"; }).join("") + "</tr>"; }).join("") + '</tbody></table><p class="vc-scale"><span>' + fmt(lo, s) + "</span>" + sh.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "<span>" + fmt(hi, s) + "</span></p>";
  };
  R_.calendar = function (s) { s.values = false; return R_.heatmap(s); };
  R_.matrix = function (s) { /* two measures, four quadrants */
    var W = 600, H = 300, p = 40, X = function (v) { return p + v / 100 * (W - 2 * p); }, Y = function (v) { return H - p - v / 100 * (H - 2 * p); };
    var q = s.quads || ["", "", "", ""];
    return svg(W, H, R(p, p, (W - 2 * p) / 2, (H - 2 * p) / 2, C.wash) + R(W / 2, p, (W - 2 * p) / 2, (H - 2 * p) / 2, C.pale) + R(p, H / 2, (W - 2 * p) / 2, (H - 2 * p) / 2, "#fff") + R(W / 2, H / 2, (W - 2 * p) / 2, (H - 2 * p) / 2, C.wash) +
      L(W / 2, p, W / 2, H - p, "vc-grid") + L(p, H / 2, W - p, H / 2, "vc-grid") + T(p + 10, p + 18, q[0], "vc-q", "start") + T(W - p - 10, p + 18, q[1], "vc-q", "end") + T(p + 10, H - p - 10, q[2], "vc-q", "start") + T(W - p - 10, H - p - 10, q[3], "vc-q", "end") +
      T(W / 2, H - 10, s.xLabel + " →", "vc-tk", "middle") + '<text class="vc-tk" text-anchor="middle" transform="translate(14 ' + H / 2 + ') rotate(-90)">' + esc(s.yLabel) + " →</text>" +
      s.pts.map(function (d, k) { return '<circle class="vc-pop" style="--d:' + k * 70 + 'ms" cx="' + X(d.x).toFixed(1) + '" cy="' + Y(d.y).toFixed(1) + '" r="7" fill="' + (d.hl ? C.main : C.mid) + '"/>' + T(X(d.x) + 11, Y(d.y) + 4, d.label, d.hl ? "vc-val" : "vc-cat", "start"); }).join(""), s.title);
  };
  R_.radar = function (s) { /* how two options compare across several attributes */
    var n = s.axes.length, cx = 300, cy = 140, r = 110, P = function (k, v) { var a = -Math.PI / 2 + k / n * Math.PI * 2; return [cx + r * v / 100 * Math.cos(a), cy + r * v / 100 * Math.sin(a)]; };
    var g = [25, 50, 75, 100].map(function (v) { return '<polygon class="vc-gridp" points="' + s.axes.map(function (a, k) { return P(k, v).map(function (z) { return z.toFixed(1); }).join(","); }).join(" ") + '"/>'; }).join("") + s.axes.map(function (a, k) { var e = P(k, 100), t = P(k, 118); return L(cx, cy, e[0], e[1], "vc-grid") + T(t[0], t[1] + 4, a, "vc-cat", Math.abs(t[0] - cx) < 10 ? "middle" : t[0] > cx ? "start" : "end"); }).join("");
    g += s.data.map(function (d, j) { return '<polygon class="vc-fade" style="--d:' + j * 200 + 'ms" points="' + d.map(function (v, k) { return P(k, v).map(function (z) { return z.toFixed(1); }).join(","); }).join(" ") + '" fill="' + col(s, j) + '" fill-opacity="' + (j ? .18 : .28) + '" stroke="' + col(s, j) + '" stroke-width="2"/>'; }).join("");
    return leg(s) + svg(600, 290, g, s.title);
  };
  R_.flow = function (s) { /* where volume goes: left groups feed right groups */
    var W = 600, H = 240, lw = 14, x0 = 150, x1 = 450, tot = s.links.reduce(function (a, l) { return a + l.v; }, 0), gap = 10;
    var L1 = s.left.map(function (n) { return { n: n, v: s.links.filter(function (l) { return l.from === n; }).reduce(function (a, l) { return a + l.v; }, 0) }; }), R1 = s.right.map(function (n) { return { n: n, v: s.links.filter(function (l) { return l.to === n; }).reduce(function (a, l) { return a + l.v; }, 0) }; });
    var sc = (H - gap * (Math.max(L1.length, R1.length) - 1) - 10) / tot;
    function place(arr) { var y = 5; arr.forEach(function (o) { o.y = y; o.h = o.v * sc; o.o = 0; y += o.h + gap; }); }
    place(L1); place(R1); var byL = {}, byR = {}; L1.forEach(function (o) { byL[o.n] = o; }); R1.forEach(function (o) { byR[o.n] = o; });
    var g = s.links.map(function (l, k) { var a = byL[l.from], b = byR[l.to], h = l.v * sc, ya = a.y + a.o + h / 2, yb = b.y + b.o + h / 2; a.o += h; b.o += h; var mxx = (x0 + x1) / 2;
      return '<path class="vc-fade" style="--d:' + k * 60 + 'ms" d="M' + (x0 + lw) + " " + ya.toFixed(1) + "C" + mxx + " " + ya.toFixed(1) + " " + mxx + " " + yb.toFixed(1) + " " + x1 + " " + yb.toFixed(1) + '" stroke="' + (l.hl ? C.main : C.light) + '" stroke-opacity="' + (l.hl ? .55 : .45) + '" stroke-width="' + Math.max(1, h).toFixed(1) + '" fill="none"/>'; }).join("");
    g += L1.map(function (o) { return R(x0, o.y, lw, o.h, C.deep, "", 2) + T(x0 - 10, o.y + o.h / 2 + 4, o.n + "  " + Math.round(o.v / tot * 100) + "%", "vc-cat", "end"); }).join("") + R1.map(function (o) { return R(x1, o.y, lw, o.h, C.main, "", 2) + T(x1 + lw + 10, o.y + o.h / 2 + 4, Math.round(o.v / tot * 100) + "%  " + o.n, "vc-cat", "start"); }).join("");
    return svg(W, H, g, s.title);
  };
  R_.tiles = function (s) { /* areas laid out roughly as they sit on the map */
    var all = s.areas.map(function (a) { return a.v; }), lo = mn(all), hi = mx(all), sh = [C.wash, C.pale, C.light, C.mid, C.main], cols = mx(s.areas.map(function (a) { return a.c; })) + 1, rows = mx(s.areas.map(function (a) { return a.r; })) + 1, cw = 600 / cols, chh = 64;
    return svg(600, rows * chh, s.areas.map(function (a, k) { var q = Math.min(4, Math.floor((a.v - lo) / (hi - lo || 1) * 4.999)), on = q >= 3; return '<g class="vc-fade" style="--d:' + k * 50 + 'ms">' + R(a.c * cw + 3, a.r * chh + 3, cw - 6, chh - 6, sh[q], "", 8) + T(a.c * cw + 14, a.r * chh + 26, a.label, on ? "vc-tl on" : "vc-tl", "start") + T(a.c * cw + 14, a.r * chh + 46, fmt(a.v, s), on ? "vc-tv on" : "vc-tv", "start") + "</g>"; }).join(""), s.title) +
      '<p class="vc-scale"><span>' + fmt(lo, s) + "</span>" + sh.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "<span>" + fmt(hi, s) + "</span></p>";
  };
  /* Figures and evidence */
  R_.kpis = function (s) { return '<div class="vc-kp">' + s.items.map(function (k, i) { return '<div style="--d:' + i * 80 + 'ms"><p>' + esc(k.label) + "</p><b>" + esc(k.value) + "</b>" + (k.change ? '<span class="' + (k.dir || (String(k.change).charAt(0) === "−" || String(k.change).charAt(0) === "-" ? "dn" : "up")) + '">' + esc(k.change) + "</span>" : "") + (k.spark ? '<svg viewBox="0 0 120 30" class="vc-spk">' + (function () { var lo = mn(k.spark), hi = mx(k.spark); return '<path class="vc-draw" pathLength="1" d="' + smooth(k.spark.map(function (v, j) { return [4 + j * 112 / (k.spark.length - 1), 26 - (v - lo) / (hi - lo || 1) * 22]; })) + '" stroke="' + C.main + '" stroke-width="1.6" fill="none"/>'; })() + "</svg>" : "") + "</div>"; }).join("") + "</div>"; };
  R_.bignum = function (s) { return '<div class="vc-bn"><b>' + esc(s.value) + "</b><p>" + esc(s.line) + "</p>" + (s.compare ? '<p class="vc-cap">' + esc(s.compare) + "</p>" : "") + "</div>"; };
  R_.evidence = function (s) { /* how much of the answer rests on what */
    var t = s.parts.reduce(function (a, p) { return a + p.v; }, 0), cls = { Fact: C.main, Inference: C.mid, Hypothesis: C.light, Assumption: C.pale, Unknown: "hatch" };
    return '<div class="vc-split"><span class="vc-stk big">' + s.parts.map(function (p) { var c = cls[p.label] || C.light; return '<i style="flex:' + (p.v / t * 100).toFixed(2) + " 1 0;" + (c === "hatch" ? "" : "background:" + c) + '"' + (c === "hatch" ? ' class="vc-hatch"' : "") + "></i>"; }).join("") + '</span><ul>' + s.parts.map(function (p) { var c = cls[p.label] || C.light; return '<li><b>' + p.v + '</b><span><i' + (c === "hatch" ? ' class="vc-hatch"' : ' style="background:' + c + '"') + "></i>" + esc(p.label) + "</span></li>"; }).join("") + "</ul></div>";
  };
  R_.timeline = function (s) { /* what changed, when */
    return '<ol class="vc-tl">' + s.items.map(function (it, k) { return '<li class="' + (it.hl ? "hl" : "") + '" style="--d:' + k * 110 + 'ms"><time>' + esc(it.when) + "</time><p><b>" + esc(it.label) + "</b>" + (it.detail ? "<span>" + esc(it.detail) + "</span>" : "") + "</p></li>"; }).join("") + "</ol>";
  };
  R_.compare = function (s) { /* two options side by side on the same measures */
    return '<table class="vc-tb vc-cmp"><thead><tr><th></th>' + s.cols.map(function (c, k) { return '<th class="r' + (k === s.hl ? " hl" : "") + '">' + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + s.rows.map(function (r) { var best = r.better === "low" ? mn(r.v) : mx(r.v); return "<tr><td>" + esc(r.label) + "</td>" + r.v.map(function (v, k) { return '<td class="r' + (v === best ? " best" : "") + (k === s.hl ? " hl" : "") + '">' + (v == null ? '<span class="unk">Unknown</span>' : fmt(v, { fmt: r.fmt, pre: r.pre })) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  };
  R_.scenarios = function (s) { /* outcome range per option, from simulation */
    return R_.range({ rows: s.rows, fmt: s.fmt, title: s.title });
  };
  R_.pyramid = function (s) { /* two groups back to back, e.g. men and women by age */
    var m = mx(s.rows.map(function (r) { return Math.max(r.a, r.b); }));
    return leg(s) + '<div class="vc-rows vc-pyr">' + s.rows.map(function (r, k) { return '<div class="vc-row"><span class="vc-dv"><span class="n"><b>' + fmt(r.a, s) + '</b><i class="vc-g" style="--w:' + (r.a / m * 80).toFixed(1) + "%;--d:" + k * 50 + "ms;background:" + col(s, 0) + '"></i></span><span class="mid">' + esc(r.label) + '</span><span class="p"><i class="vc-g" style="--w:' + (r.b / m * 80).toFixed(1) + "%;--d:" + k * 50 + "ms;background:" + col(s, 1) + '"></i><b>' + fmt(r.b, s) + "</b></span></span></div>"; }).join("") + "</div>";
  };
  R_.icons = function (s) { /* "x in 10" with simple person marks */
    var out = ""; for (var i = 0; i < (s.of || 10); i++) out += '<svg viewBox="0 0 20 28" class="vc-ic' + (i < s.v ? " on" : "") + '" style="--d:' + i * 60 + 'ms"><circle cx="10" cy="6" r="5"/><path d="M2 27v-7a8 8 0 0 1 16 0v7z"/></svg>';
    return '<div class="vc-icn"><div>' + out + "</div><p><b>" + s.v + " in " + (s.of || 10) + "</b> " + esc(s.line) + "</p></div>";
  };
  R_.change = function (s) { /* before and after as two big figures */
    return '<div class="vc-chg"><div><p>' + esc(s.before.label) + "</p><b>" + esc(s.before.value) + '</b></div><svg viewBox="0 0 40 16" aria-hidden="true"><path d="M2 8h34M30 3l6 5-6 5" fill="none" stroke="' + C.faint + '" stroke-width="1.5"/></svg><div class="hl"><p>' + esc(s.after.label) + "</p><b>" + esc(s.after.value) + "</b>" + (s.delta ? "<span>" + esc(s.delta) + "</span>" : "") + "</div></div>";
  };
  R_.share = function (s) { /* share of voice / shelf / market with a highlighted brand, as columns of 100% */
    return R_.stackbar({ rows: s.rows, series: s.series, colors: [C.main, C.light, C.grey, C.pale] });
  };
  R_.pricepoints = function (s) { /* price ladder: products placed on one price line */
    var W = 600, H = 120, vals = s.items.map(function (i) { return i.v; }), tk = ticks(mn(vals), mx(vals), 4), X = function (v) { return 30 + (v - tk[0]) / (tk[tk.length - 1] - tk[0]) * (W - 60); };
    return svg(W, H, L(30, 64, W - 30, 64, "vc-ax") + tk.map(function (v) { return L(X(v), 60, X(v), 68, "vc-ax") + T(X(v), 86, fmt(v, s), "vc-tk", "middle"); }).join("") + s.items.map(function (it, k) { var up = k % 2 === 0; return '<g class="vc-pop" style="--d:' + k * 90 + 'ms"><circle cx="' + X(it.v).toFixed(1) + '" cy="64" r="6" fill="' + (it.hl ? C.main : C.light) + '" stroke="#fff" stroke-width="2"/>' + T(X(it.v), up ? 44 : 108, it.label + " " + fmt(it.v, s), it.hl ? "vc-val" : "vc-cat", "middle") + "</g>"; }).join(""), s.title);
  };
  R_.cohort = function (s) { /* repeat buying by start month */
    return R_.heatmap({ rows: s.rows, cols: s.cols, data: s.data, fmt: "%" });
  };
  R_.target = function (s) { return R_.bullet(s); };
  R_.columnsrank = function (s) { s.hl = [s.vals.indexOf(mx(s.vals))]; return R_.cols(s); };
  R_.areas2 = function (s) { return R_.area(s); };

  /* ---------- catalogue: what each template is for, with sample data ---------- */
  var M = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], M12 = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  var TEMPLATES = [
    /* Compare categories */
    { id: "bars", group: "Compare", name: "Ranked bars", use: "Rank areas, outlets or brands on one measure and highlight the one the answer is about.", cues: /rank|which (area|outlet|shop|brand)|where is|highest|lowest|most|least|top/, sample: { title: "Madina has the widest price gap to the rival", sub: "Shelf price above the rival, % · Accra", rows: [{ label: "Madina", v: 14, hl: true }, { label: "Kaneshie", v: 9 }, { label: "Osu", v: 6 }, { label: "Tema", v: 4 }], fmt: "%" } },
    { id: "pairs", group: "Compare", name: "Paired bars", use: "Compare two things (you and the rival, this year and last) across a few categories.", cues: /\bvs\b|versus|compared|against|rival|competitor|both/, sample: { title: "Small shops now buy mostly through wholesalers", sub: "Where small shops in Accra source each product (% of shops)", series: ["Wholesaler", "Distributor van"], rows: [{ label: "Your rice", a: 55, b: 45 }, { label: "Leading rival", a: 41, b: 63 }], fmt: "%" } },
    { id: "lollipop", group: "Compare", name: "Lollipop", use: "Many categories on one measure where bars would feel heavy.", cues: /each (area|market|city)|across (areas|markets|cities)/, sample: { title: "Kiosks wait longest between orders", sub: "Days between reorders, by outlet type · Kano", rows: [{ label: "Kiosks", v: 21, hl: true }, { label: "Small shops", v: 14 }, { label: "Market stalls", v: 12 }, { label: "Supermarkets", v: 7 }, { label: "Pharmacies", v: 9 }], fmt: " days" } },
    { id: "dumbbell", group: "Compare", name: "Dumbbell", use: "Show the gap or movement between two values for each category.", cues: /gap between|from .* to|before and after|moved|shift/, sample: { title: "Availability fell in every area, most in Dawanau", sub: "% of kiosks with your 1kg pack · Kano, Aug to Nov", series: ["Nov", "Aug"], rows: [{ label: "Dawanau", a: 61, b: 23 }, { label: "Kurmi", a: 70, b: 46 }, { label: "Sabon Gari", a: 74, b: 58 }], fmt: "%", max: 100 } },
    { id: "slope", group: "Compare", name: "Slope chart", use: "Who rose and who fell between two points in time.", cues: /changed rank|overtook|gained|lost ground|this year vs last|then and now/, sample: { title: "The rival overtook you in small shops this year", sub: "Share of small-shop sales, % · Accra", cats: ["2025", "2026"], rows: [{ label: "Your brand", a: 34, b: 27, hl: true }, { label: "Leading rival", a: 29, b: 36 }, { label: "Others", a: 37, b: 37 }], fmt: "%" } },
    { id: "bullet", group: "Compare", name: "Bullet bars", use: "Actual against a target or plan.", cues: /target|goal|plan|on track|behind|ahead of/, sample: { title: "Two of three areas are behind the coverage target", sub: "% of outlets stocking you, against a 70% target · Lagos", rows: [{ label: "Ikeja", v: 74, target: 70 }, { label: "Surulere", v: 58, target: 70 }, { label: "Yaba", v: 49, target: 70 }], fmt: "%" } },
    { id: "progress", group: "Compare", name: "Progress list", use: "How complete each item is: tasks, checks, coverage.", cues: /progress|complete|how far|checked so far|coverage/, sample: { title: "Shopper checks are nearly done in Madina", sub: "Verified responses against the number needed · Accra", rows: [{ label: "Madina", v: 92, hl: true }, { label: "Kaneshie", v: 74 }, { label: "Osu", v: 40 }], fmt: "%" } },
    { id: "waffle", group: "Compare", name: "Waffle", use: "A share out of 100 that people should be able to picture.", cues: /out of (every )?100|in every|how many in/, sample: { title: "Most shoppers who switched could not find your pack", sub: "Reason for switching, % of 120 shoppers · Kano", parts: [{ label: "Not on the shelf", v: 54 }, { label: "Lower price", v: 28 }, { label: "Other", v: 18 }] } },
    { id: "diverge", group: "Compare", name: "Diverging bars", use: "Changes that go up for some categories and down for others.", cues: /grew|fell|increase|decrease|up or down|winners|losers|change by/, sample: { title: "Sales are shifting from large packs to small packs", sub: "Change in volume by pack size, % · Accra, Aug to Oct", rows: [{ label: "Sachet", v: 18 }, { label: "500ml", v: 9 }, { label: "1 litre", v: -6 }, { label: "5 litre", v: -21 }], fmt: "%" } },
    { id: "rank", group: "Compare", name: "Rank with movement", use: "A league table where the change in position matters.", cues: /league|position|ranking|moved up|moved down/, sample: { title: "You dropped two places among cooking oil brands", sub: "Share of shelf facings, % · Accra, change since August", rows: [{ label: "Leading rival", v: 31, prev: 2 }, { label: "Brand B", v: 22, prev: 3 }, { label: "Your brand", v: 19, prev: 1, hl: true }, { label: "Brand C", v: 12, prev: 4 }], fmt: "%" } },
    { id: "tablebars", group: "Compare", name: "Table with bars", use: "Several facts per row with one measure worth scanning.", cues: /list|table|breakdown|detail|by distributor/, sample: { title: "Distributor A delivers on time far less often", sub: "Deliveries checked, Oct · Lagos", cols: ["Distributor", "Deliveries", "On time"], rows: [{ label: "Distributor A", extra: ["48"], v: 52, hl: true }, { label: "Distributor B", extra: ["61"], v: 81 }, { label: "Distributor C", extra: ["37"], v: 88 }], fmt: "%" } },
    { id: "compare", group: "Compare", name: "Side-by-side table", use: "Two or three options on the same measures, best value marked.", cues: /which is better|choose between|option a|option b|compare (two|three)/, sample: { title: "Kumasi needs less spend to reach the same coverage", sub: "Entry options, first six months", cols: ["Kumasi", "Takoradi"], hl: 0, rows: [{ label: "Outlets reachable", v: [420, 260] }, { label: "Cost per outlet", v: [38, 52], pre: "$", better: "low" }, { label: "Rival presence", v: [44, 61], fmt: "%", better: "low" }, { label: "Shopper price sensitivity", v: [null, 62], fmt: "%" }] } },
    { id: "pyramid", group: "Compare", name: "Back-to-back bars", use: "Two groups compared across the same bands (age, income, area).", cues: /men and women|by age|age group|income band|urban and rural/, sample: { title: "Younger shoppers lean to sachets", sub: "% of shoppers by age · Accra", series: ["Sachet", "Bottle"], rows: [{ label: "18–24", a: 62, b: 38 }, { label: "25–34", a: 48, b: 52 }, { label: "35–44", a: 33, b: 67 }, { label: "45+", a: 24, b: 76 }], fmt: "%" } },
    /* Over time */
    { id: "cols", group: "Over time", name: "Columns", use: "A measure over a few periods, latest period highlighted.", cues: /each month|per month|monthly|weekly|by month/, sample: { title: "Order-to-delivery time has roughly doubled since June", sub: "Average days from order to delivery · Lagos", cats: M, vals: [3, 3, 4, 5, 6, 7], fmt: "" } },
    { id: "groupcols", group: "Over time", name: "Grouped columns", use: "Two or three series per period.", cues: /each quarter|by quarter|by period/, sample: { title: "The rival outsold you in every month since August", sub: "Cases sold, thousands · Accra", series: ["Leading rival", "Your brand"], cats: M, data: [[18, 19, 21, 24, 26, 27], [22, 22, 21, 19, 18, 17]] } },
    { id: "stackcols", group: "Over time", name: "Stacked columns", use: "How a total and its parts change over time.", cues: /mix|made up of|composition|split over time/, sample: { title: "Sachets now make up almost half of volume", sub: "Volume by pack, % · Accra", series: ["Sachet", "500ml", "1 litre"], cats: M, pct: true, data: [[28, 30, 33, 38, 43, 47], [32, 32, 31, 30, 29, 28], [40, 38, 36, 32, 28, 25]] } },
    { id: "line", group: "Over time", name: "Single line", use: "One measure over many periods, with the latest value labelled.", cues: /trend|over time|since|history|how has/, sample: { title: "Your shelf price has climbed for five months", sub: "Average shelf price, 1 litre, GH₵ · Accra", cats: M12, vals: [42, 42, 43, 43, 44, 44, 45, 46, 48, 50, 51, 53], zero: false, pre: "₵" } },
    { id: "lines", group: "Over time", name: "Two lines", use: "This year against last year, or you against the rival.", cues: /this year|last year|year on year|compared with last|vs last/, sample: { title: "Sales fell after August; last year they held", sub: "Cooking oil sales, index · Accra", series: ["This year", "Last year"], cats: M, data: [[100, 102, 101, 92, 86, 82], [96, 98, 95, 97, 99, 100]], zero: false } },
    { id: "area", group: "Over time", name: "Area", use: "Volume over time where the size of the total matters.", cues: /volume|how much|demand|sales over/, sample: { title: "Demand in Kano peaks before Ramadan", sub: "Weekly cases sold · Kano", series: ["Cases"], cats: M12, data: [[40, 42, 48, 61, 72, 58, 45, 43, 44, 46, 49, 52]] } },
    { id: "stackarea", group: "Over time", name: "Stacked area", use: "Parts of a total over many periods.", cues: /channels over time|by channel over/, sample: { title: "Kiosks carry more of the growth", sub: "Sales by channel, thousands of cases · Lagos", series: ["Kiosks", "Small shops", "Supermarkets"], cats: M, data: [[10, 11, 12, 14, 16, 18], [14, 14, 15, 15, 15, 16], [8, 8, 8, 9, 9, 9]] } },
    { id: "step", group: "Over time", name: "Step line", use: "Values that change in jumps, such as list prices or levies.", cues: /price change|levy|tariff|list price|increase in price/, sample: { title: "The import levy raised the landed cost twice", sub: "Landed cost per carton, ₦ thousand · Lagos", cats: M, vals: [18, 18, 18, 21, 21, 23], zero: false, pre: "₦", fmt: "k" } },
    { id: "band", group: "Over time", name: "Line with range", use: "A forecast or estimate with its uncertainty.", cues: /forecast|expect|next (month|quarter)|project|predict|outlook|range/, sample: { title: "Sales should recover slowly if the price gap narrows", sub: "Index, actual and simulated range · Accra", series: ["Actual", "Simulated"], cats: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"], data: [[100, 101, 92, 86, 82, null, null, null], [null, null, null, null, 82, 84, 87, 90]], dash: [false, true], band: { from: 4, lo: [82, 80, 81, 82], hi: [82, 88, 93, 98] }, zero: false } },
    { id: "index", group: "Over time", name: "Indexed lines", use: "Compare growth of things on different scales (first period = 100).", cues: /grow(th)? faster|index|relative growth|outpac/, sample: { title: "Kiosk sales grew fastest since June", sub: "Sales index, June = 100 · Lagos", series: ["Kiosks", "Small shops", "Supermarkets"], cats: M, data: [[100, 106, 113, 121, 128, 134], [100, 101, 103, 104, 104, 106], [100, 99, 101, 100, 102, 101]] } },
    { id: "events", group: "Over time", name: "Line with events", use: "A trend with the moments that may explain it marked.", cues: /what happened|after the|when did|launch|levy came|caused/, sample: { title: "The fall began soon after the levy and the rival's promotion", sub: "Cooking oil sales, index · Accra", series: ["Sales"], cats: M, data: [[100, 102, 101, 92, 86, 82]], events: [{ at: 3, label: "Import levy" }, { at: 4, label: "Rival promotion" }], zero: false } },
    { id: "colsline", group: "Over time", name: "Columns and line", use: "Volume and a rate together, such as cases sold and price.", cues: /price and (volume|sales)|sales and price|volume and price/, sample: { title: "Volume fell as the price rose", sub: "Cases sold (columns) and shelf price (line) · Accra", series: ["Cases sold", "Shelf price"], cats: M, vals: [220, 224, 218, 196, 181, 172], line: [44, 45, 46, 48, 50, 51], linePre: "₵" } },
    { id: "sparks", group: "Over time", name: "Sparkline table", use: "Several items, each with its own small trend.", cues: /each product|all products|portfolio|every sku|by product/, sample: { title: "Only sachets are still growing", sub: "Monthly sales, thousands of units · Accra", cols: ["Pack", "Jun to Nov", "Nov", "Change"], rows: [{ label: "Sachet", vals: [40, 43, 46, 52, 57, 61] }, { label: "500ml", vals: [30, 31, 30, 29, 28, 28] }, { label: "1 litre", vals: [26, 25, 24, 21, 19, 18] }, { label: "5 litre", vals: [9, 9, 8, 7, 6, 6] }] } },
    { id: "histogram", group: "Over time", name: "Distribution", use: "How results spread out, such as simulation runs.", cues: /simulat|scenario|distribution|spread|likely outcomes/, sample: { title: "Most simulated outcomes fall between 4% and 9% growth", sub: "Number of runs by change in volume · 500 runs", cats: ["−2", "0", "2", "4", "6", "8", "10", "12"], vals: [8, 22, 54, 96, 121, 104, 61, 34], hl: [3, 5] } },
    /* Part of a whole */
    { id: "donut", group: "Part of a whole", name: "Donut", use: "A single split into a few parts, with the main share in the centre.", cues: /share|split|proportion|what part|how much of/, sample: { title: "Wholesalers supply most small shops", sub: "Main source of supply, % of 64 small shops · Accra", parts: [{ label: "Wholesaler", v: 55 }, { label: "Distributor van", v: 31 }, { label: "Market", v: 14 }] } },
    { id: "donuts", group: "Part of a whole", name: "Small rings", use: "The same share compared across a few areas or segments.", cues: /share in each|by area share|each segment/, sample: { title: "Coverage is lowest in Yaba", sub: "% of outlets stocking you · Lagos", rows: [{ label: "Ikeja", v: 74 }, { label: "Surulere", v: 58 }, { label: "Yaba", v: 49, hl: true }, { label: "Lekki", v: 66 }], fmt: "%" } },
    { id: "gauge", group: "Part of a whole", name: "Gauge", use: "One headline share against its full range, optionally with a target.", cues: /how close|coverage|reach|penetration|availability rate/, sample: { title: "Your pack is on 35% of kiosk shelves", sub: "Kiosks with your 1kg pack · Kano, 26 kiosks", v: 35, target: 60, label: "of kiosks", fmt: "%" } },
    { id: "rings", group: "Part of a whole", name: "Rings", use: "Two or three related percentages, nested.", cues: /aware.*tried|awareness|consideration/, sample: { title: "Many know the brand, fewer buy it regularly", sub: "% of shoppers · Accra", rows: [{ label: "Aware", v: 82 }, { label: "Bought this year", v: 51 }, { label: "Buy regularly", v: 23 }], fmt: "%" } },
    { id: "treemap", group: "Part of a whole", name: "Treemap", use: "Many parts of a category where size matters more than order.", cues: /market share|category share|who sells|players|brands in/, sample: { title: "The rival holds the largest share of the shelf", sub: "Share of category facings · Accra", parts: [{ label: "Leading rival", v: 31 }, { label: "Your brand", v: 19, hl: true }, { label: "Brand B", v: 22 }, { label: "Brand C", v: 12 }, { label: "Others", v: 16 }] } },
    { id: "stackbar", group: "Part of a whole", name: "100% bars", use: "Mix within each category, such as pack sizes by area.", cues: /mix by|in each area.*split|by channel.*share/, sample: { title: "Sachets dominate in Madina", sub: "Volume by pack, % · Accra", series: ["Sachet", "500ml", "1 litre"], rows: [{ label: "Madina", v: [58, 27, 15] }, { label: "Kaneshie", v: [41, 33, 26] }, { label: "Osu", v: [22, 35, 43] }] } },
    { id: "split", group: "Part of a whole", name: "Single split bar", use: "One total split into parts, read left to right.", cues: /where does|break down|split of/, sample: { title: "Price is the most common reason given", sub: "Main reason for the last purchase, % of 36 shoppers · Accra", parts: [{ label: "Price", v: 61 }, { label: "Availability", v: 22 }, { label: "Habit", v: 11 }, { label: "Other", v: 6 }] } },
    { id: "funnel", group: "Part of a whole", name: "Funnel", use: "How many make it through each step, and where they drop off.", cues: /funnel|journey|drop off|convert|from aware|path to purchase/, sample: { title: "Most shoppers are lost at the shelf, not at awareness", sub: "Shoppers at each step · Kano, 400 interviewed", rows: [{ label: "Know the brand", v: 340 }, { label: "Looked for it", v: 210 }, { label: "Found it", v: 96 }, { label: "Bought it", v: 81 }] } },
    { id: "waterfall", group: "Part of a whole", name: "Waterfall", use: "What added to and took away from a change between two figures.", cues: /what explains|why did .* (fall|drop|rise)|contribut|drivers|bridge/, sample: { title: "Lost shelf space explains most of the fall", sub: "Monthly cases, Aug to Nov, by cause · Accra", start: { label: "Aug", v: 220 }, steps: [{ label: "Shelf space", v: -28 }, { label: "Price gap", v: -17 }, { label: "New outlets", v: 9 }, { label: "Season", v: -12 }], end: "Nov" } },
    { id: "share", group: "Part of a whole", name: "Share by segment", use: "Your share against the rival and others in each segment.", cues: /share of shelf|share of voice|share by/, sample: { title: "You lead only in supermarkets", sub: "Share of facings, % · Accra", series: ["Your brand", "Leading rival", "Others"], rows: [{ label: "Supermarkets", v: [41, 33, 26] }, { label: "Small shops", v: [24, 39, 37] }, { label: "Kiosks", v: [17, 44, 39] }] } },
    /* Relationships and spread */
    { id: "scatter", group: "Relationships", name: "Scatter", use: "Whether two measures move together across outlets or areas.", cues: /relationship|related|correlat|does .* affect|depend on|price vs/, sample: { title: "Outlets with a bigger price gap sell less", sub: "Each dot is an outlet · Accra, 40 outlets", xLabel: "Price gap to rival, %", xFmt: "%", fit: true, pts: [[2, 31], [3, 29], [4, 30], [5, 26], [6, 27], [7, 24], [8, 23], [9, 22], [10, 19], [11, 20], [12, 17], [13, 15], [14, 16], [15, 12], [4, 25], [6, 31], [9, 26], [12, 21], [14, 11], [3, 33]].map(function (p) { return { x: p[0], y: p[1] }; }) } },
    { id: "bubble", group: "Relationships", name: "Bubbles", use: "Three measures at once: two positions and a size.", cues: /size of|bigger markets|opportunity|attractive/, sample: { title: "Kumasi combines growth with a large market", sub: "Growth and rival presence; bubble size is outlets", xLabel: "Rival presence, %", xFmt: "%", pts: [{ x: 44, y: 9, size: 420, label: "Kumasi", hl: true }, { x: 61, y: 6, size: 260, label: "Takoradi" }, { x: 52, y: 4, size: 610, label: "Accra" }, { x: 35, y: 3, size: 150, label: "Tamale" }] } },
    { id: "range", group: "Relationships", name: "Range dots", use: "Low, high and typical values, such as prices by area.", cues: /price range|range of|lowest and highest|varies|min|max/, sample: { title: "Prices vary most in Kaneshie", sub: "Shelf price, 1 litre, ₵ · low, typical, high", rows: [{ label: "Madina", lo: 46, mid: 49, hi: 52 }, { label: "Kaneshie", lo: 43, mid: 50, hi: 58, hl: true }, { label: "Osu", lo: 50, mid: 53, hi: 56 }], pre: "₵" } },
    { id: "strip", group: "Relationships", name: "Dot strip", use: "Every observation shown, so the spread and outliers are clear.", cues: /every outlet|all responses|each response|outliers|spread of prices/, sample: { title: "Most kiosks charge above the recommended price", sub: "Shelf price per outlet, ₦ · Kano; line is the average", rows: [{ label: "Kiosks", vals: [520, 540, 560, 550, 580, 600, 530, 545, 570, 590, 610, 555], hl: true }, { label: "Small shops", vals: [500, 510, 520, 505, 530, 515, 525, 540, 498, 512] }], pre: "₦" } },
    { id: "heatmap", group: "Relationships", name: "Heatmap", use: "One measure across two dimensions, such as area by month.", cues: /area by month|by area and|when and where|pattern across/, sample: { title: "Stockouts spread from Dawanau to other markets", sub: "% of kiosks out of stock · Kano", rows: ["Dawanau", "Kurmi", "Sabon Gari", "Tarauni"], cols: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], data: [[8, 12, 26, 41, 55, 62], [6, 7, 10, 18, 31, 38], [5, 6, 8, 9, 15, 22], [4, 5, 5, 7, 9, 12]], fmt: "%" } },
    { id: "calendar", group: "Relationships", name: "Busy times", use: "When things happen: day of week by time of day.", cues: /busiest|what time|which day|footfall|peak hours/, sample: { title: "Shops are busiest on Saturday mornings", sub: "Footfall, relative · Madina market", rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], cols: ["7am", "9am", "11am", "1pm", "3pm", "5pm", "7pm"], data: [[3, 5, 4, 3, 4, 6, 4], [3, 5, 4, 3, 4, 6, 4], [3, 4, 4, 3, 4, 6, 5], [3, 5, 5, 4, 4, 7, 5], [4, 6, 5, 4, 5, 8, 6], [6, 9, 10, 8, 7, 7, 5], [2, 4, 6, 5, 4, 3, 2]] } },
    { id: "matrix", group: "Relationships", name: "Priority matrix", use: "Place options on two measures to see which to act on first.", cues: /prioriti|where to start|focus on first|quick wins|impact and effort/, sample: { title: "Fix kiosk availability first", sub: "Options placed by expected impact and effort", xLabel: "Effort", yLabel: "Impact", quads: ["Worth planning", "Do first", "Leave", "Quick fixes"], pts: [{ x: 30, y: 78, label: "Kiosk restock", hl: true }, { x: 70, y: 70, label: "New distributor" }, { x: 25, y: 35, label: "Shelf strips" }, { x: 78, y: 30, label: "Price cut" }].map(function (p) { return { x: 100 - p.x, y: p.y, label: p.label, hl: p.hl }; }) } },
    { id: "radar", group: "Relationships", name: "Profile", use: "Two options compared across several attributes at once.", cues: /strengths|weaknesses|how do we compare|attributes|on every measure/, sample: { title: "The rival wins on price and availability, you on trust", sub: "Shopper ratings out of 100 · Accra", series: ["Your brand", "Leading rival"], axes: ["Price", "Availability", "Trust", "Pack sizes", "Shelf visibility"], data: [[52, 48, 81, 63, 55], [74, 79, 60, 58, 72]] } },
    { id: "flow", group: "Relationships", name: "Flow", use: "Where volume goes from one set of groups to another.", cues: /flow|route to market|supply chain|goes through|channels to/, sample: { title: "Most of your volume now reaches shops through wholesalers", sub: "Share of volume by route · Accra", left: ["Distributor", "Wholesaler"], right: ["Supermarkets", "Small shops", "Kiosks"], links: [{ from: "Distributor", to: "Supermarkets", v: 22 }, { from: "Distributor", to: "Small shops", v: 14 }, { from: "Wholesaler", to: "Small shops", v: 31, hl: true }, { from: "Wholesaler", to: "Kiosks", v: 25, hl: true }, { from: "Distributor", to: "Kiosks", v: 8 }] } },
    { id: "tiles", group: "Relationships", name: "Area tiles", use: "Areas of a city laid out roughly as on a map, shaded by value.", cues: /map|where in|which parts|neighbourhood|district|geograph/, sample: { title: "Stockouts cluster in the north of Kano", sub: "% of kiosks out of stock · Kano", areas: [{ label: "Dawanau", v: 62, r: 0, c: 0 }, { label: "Fagge", v: 41, r: 0, c: 1 }, { label: "Nassarawa", v: 18, r: 0, c: 2 }, { label: "Kurmi", v: 38, r: 1, c: 0 }, { label: "Sabon Gari", v: 22, r: 1, c: 1 }, { label: "Tarauni", v: 12, r: 1, c: 2 }, { label: "Gwale", v: 27, r: 2, c: 0 }, { label: "Kumbotso", v: 9, r: 2, c: 1 }], fmt: "%" } },
    { id: "pricepoints", group: "Relationships", name: "Price ladder", use: "Where products sit on one price line.", cues: /price point|price ladder|priced against|cheaper than|premium/, sample: { title: "Your 1 litre sits above every rival", sub: "Shelf price, 1 litre, ₵ · Accra", items: [{ label: "Brand C", v: 41 }, { label: "Rival", v: 44 }, { label: "Brand B", v: 46 }, { label: "Yours", v: 51, hl: true }], pre: "₵" } },
    /* Figures and evidence */
    { id: "kpis", group: "Figures", name: "Key figures", use: "Three or four headline numbers with their change.", cues: /overview|summary|key numbers|at a glance|dashboard|how are we doing/, sample: { title: "Accra at a glance", sub: "Cooking oil, November", items: [{ label: "Outlets stocking you", value: "58%", change: "−6 pts", spark: [66, 65, 64, 61, 59, 58] }, { label: "Shelf price, 1 litre", value: "₵51", change: "+11%", dir: "dn", spark: [44, 45, 46, 48, 50, 51] }, { label: "Cases sold", value: "172k", change: "−18%", spark: [220, 224, 218, 196, 181, 172] }] } },
    { id: "bignum", group: "Figures", name: "Big figure", use: "One number that answers the question, with its context.", cues: /how many|what is the|what's the|how much is/, sample: { title: "One figure answers it", sub: "Kiosks checked in Kano, Nov", value: "35%", line: "of kiosks had your 1kg pack on the shelf", compare: "The rival's 500g pack was on 92%." } },
    { id: "change", group: "Figures", name: "Before and after", use: "One measure then and now.", cues: /before and after|then and now|used to|compared with (august|last month)/, sample: { title: "Delivery times have doubled", sub: "Average days from order to delivery · Lagos", before: { label: "June", value: "3 days" }, after: { label: "November", value: "7 days" }, delta: "+4 days" } },
    { id: "icons", group: "Figures", name: "People count", use: "A share that reads best as \"x in 10 people\".", cues: /how many people|in 10|shoppers say|of shoppers/, sample: { title: "Six in ten shoppers named price", sub: "Main reason for choosing a pack · Accra, 36 shoppers", v: 6, line: "shoppers named price as their main reason" } },
    { id: "evidence", group: "Figures", name: "Evidence mix", use: "How much of an answer rests on facts, inferences and unknowns.", cues: /how sure|how confident|what do we know|evidence|unknown/, sample: { title: "Most of this answer rests on checked facts", sub: "Statements in this answer, by type", parts: [{ label: "Fact", v: 6 }, { label: "Inference", v: 3 }, { label: "Assumption", v: 1 }, { label: "Unknown", v: 2 }] } },
    { id: "timeline", group: "Figures", name: "Timeline", use: "What changed, and when.", cues: /timeline|sequence|what changed|history of|over the past/, sample: { title: "Three changes came close together", sub: "Accra, cooking oil", items: [{ when: "1 Sep", label: "Import levy applied", detail: "Landed cost up about 12%" }, { when: "15 Sep", label: "Rival price cut", detail: "1 litre down ₵3 in small shops" }, { when: "Oct", label: "Wholesaler credit tightened", detail: "37% stopped credit on your product", hl: true }, { when: "Nov", label: "Sales 18% below August" }] } }
  ];
  /* make sure every template exists */
  TEMPLATES = TEMPLATES.filter(function (t) { return R_[t.id]; });

  function pick(q) {
    var t = " " + String(q || "").toLowerCase() + " ", out = [];
    TEMPLATES.forEach(function (tp) { if (tp.cues && tp.cues.test(t)) out.push(tp.id); });
    return out;
  }
  function render(s) { var f = R_[s.kind]; return f ? f(s) : ""; }
  function figure(s, n) {
    inject();
    return '<figure class="vc"><p class="vc-ex">Exhibit ' + (n || 1) + '</p><p class="vc-t">' + esc(s.title) + '</p>' + (s.sub ? '<p class="vc-s">' + esc(s.sub) + "</p>" : "") + '<div class="vc-body">' + render(s) + '</div><div class="vc-foot">' + (s.note ? "<p>Note: " + esc(String(s.note).replace(/^Note: /, "")) + "</p>" : "") + "<p>" + esc(s.src || "Source: Verisavo, illustrative data") + "</p></div></figure>";
  }
  function animate(rootEl) {
    var els = (rootEl || document).querySelectorAll(".vc:not(.vc-in)"); if (!els.length) return;
    if (!("IntersectionObserver" in window)) { [].forEach.call(els, function (e) { e.classList.add("vc-in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vc-in"); io.unobserve(e.target); } }); }, { threshold: .25 });
    [].forEach.call(els, function (e) { io.observe(e); });
  }
  var injected = false;
  function inject() {
    if (injected || typeof document === "undefined") return; injected = true;
    var st = document.createElement("style"); st.id = "vc-style"; st.textContent = CSS; document.head.appendChild(st);
  }
  var CSS = [
    ".vc{margin:8px 0 4px;padding:16px 0 4px;border-top:1px solid #3A3A3C;font-family:inherit;color:#3A3A3C}",
    ".vc i b,.vc i em{font-style:normal}#va .va-main figure.vc,#va figure.vc{display:block;margin:8px 0 4px;padding:16px 0 4px;border-top:1px solid #3A3A3C}",
    ".vc-ex{margin:0 0 6px;font-size:12px;font-weight:500;color:#77767A}.vc-t{margin:0 0 4px;font-size:14px;font-weight:600;line-height:1.35;letter-spacing:-.012em;color:#3A3A3C}.vc-s{margin:0 0 16px;font-size:13.5px;color:#77767A}",
    ".vc-foot{margin-top:14px;padding-top:10px;border-top:1px solid #E5E5E5;font-size:12.5px;color:#77767A}.vc-foot p{margin:0 0 2px}",
    ".vc-leg{display:flex;flex-wrap:wrap;gap:16px;margin:0 0 12px;font-size:13px;color:#6D6C71}.vc-leg span{display:inline-flex;align-items:center;gap:6px}.vc-leg i{width:9px;height:9px;border-radius:2px;display:inline-block}.vc-leg i.dot{border-radius:50%}.vc-leg i.ln{width:14px;height:2.5px;border-radius:2px}.vc-leg i.tg{width:2px;height:12px;border-radius:0}",
    ".vc-svg{display:block;width:100%;height:auto;overflow:visible;font-family:inherit}.vc-svg.sq{max-width:220px}.vc-svg text{font-size:12px;fill:#6D6C71}.vc-svg .vc-val{fill:#3A3A3C;font-weight:600;font-size:12.5px}.vc-svg .vc-cat{fill:#3A3A3C;font-size:12.5px}.vc-svg .vc-tk{fill:#8E8D92;font-size:11.5px}.vc-svg .vc-big{fill:#3A3A3C;font-size:26px;font-weight:600}.vc-svg .vc-huge{fill:#3A3A3C;font-size:34px;font-weight:600}.vc-svg .vc-tip{fill:#fff;font-size:11px;font-weight:600}.vc-svg .vc-q{fill:#8E8D92;font-size:12px;font-weight:500}.vc-svg .vc-tl{fill:#3A3A3C;font-size:12.5px;font-weight:500}.vc-svg .vc-tv{fill:#3A3A3C;font-size:12px}.vc-svg .vc-tl.on,.vc-svg .vc-tv.on{fill:#fff}.vc-svg .vc-evt{fill:#3B5D8A;font-size:11px;font-weight:500}",
    ".vc-ax{stroke:#C9C8CD;stroke-width:1}.vc-grid{stroke:#EDEDF0;stroke-width:1}.vc-gridp{fill:none;stroke:#EDEDF0}.vc-ev{stroke:#3B5D8A;stroke-dasharray:3 3;stroke-width:1}.vc-con{stroke:#C9C8CD;stroke-dasharray:2 2}.vc-mean{stroke:#1F273F;stroke-width:2}",
    ".vc-rows{display:flex;flex-direction:column}.vc-row{display:grid;grid-template-columns:minmax(90px,150px) 1fr;column-gap:14px}.vc-row>.vc-bar,.vc-row>.vc-pair,.vc-row>.vc-stk,.vc-row>.vc-dv{border-left:1px solid #A2A1A6;padding:6px 0}.vc-row>.vc-l{align-self:center;font-size:13.5px;color:#3A3A3C}.vc-row.tot{border-top:1px solid #E5E5E5;margin-top:6px}.vc-row.tot>.vc-l{font-weight:500}.vc-row.tot>*{padding-top:10px}",
    ".vc-pair{display:flex;flex-direction:column;gap:4px}.vc-bar{display:flex;align-items:center;gap:8px;min-height:18px}.vc-bar b{font-size:13.5px;font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums}.vc-bar b small{font-weight:400;color:#77767A}.vc-bar b.unk{font-weight:400;color:#77767A}",
    ".vc-g{display:block;height:16px;width:var(--w);border-radius:0 2px 2px 0}.vc-g.sm{height:12px}.vc-u{display:block;width:22%;height:12px;border:1px dashed #A2A1A6;background:repeating-linear-gradient(135deg,transparent 0 4px,rgba(0,0,0,.06) 4px 6px)}",
    ".vc-track{position:relative;display:block;flex:1;height:12px;background:#F1F5FA;border-radius:6px}.vc-track .vc-g{height:12px;border-radius:6px}.vc-track em{position:absolute;top:-4px;bottom:-4px;width:2px;margin-left:-1px;background:#1F273F}.vc-bul{gap:12px}.vc-bul b{min-width:84px}",
    ".vc-prog{display:grid;gap:14px}.vc-prog p{display:flex;justify-content:space-between;margin:0 0 6px;font-size:13.5px}.vc-prog b{font-weight:600}",
    ".vc-dv{display:grid;grid-template-columns:1fr 1fr;align-items:center}.vc-dv .n{display:flex;justify-content:flex-end;align-items:center;gap:6px;border-right:1px solid #A2A1A6;padding-right:0}.vc-dv .n .vc-g{border-radius:2px 0 0 2px}.vc-dv .p{display:flex;align-items:center;gap:6px}.vc-dv b{font-size:13px;font-weight:500;white-space:nowrap}.vc-row>.vc-dv{border-left:0}",
    ".vc-pyr .vc-row{grid-template-columns:1fr}.vc-pyr .vc-dv{grid-template-columns:1fr 70px 1fr}.vc-pyr .mid{text-align:center;font-size:13px}.vc-pyr .vc-dv .n{border-right:0}",
    ".vc-stk{display:flex;gap:2px;height:22px;align-self:center;width:100%;margin-left:0;overflow:hidden;border-radius:0 3px 3px 0}.vc-row>.vc-stk{padding:0;height:24px;margin:5px 0;border-left:0}.vc-stk i{display:flex;align-items:center;justify-content:center;min-width:0}.vc-stk b{font-size:11.5px;font-weight:600;color:#3A3A3C}.vc-stk b.on{color:#fff}.vc-stk.big{height:28px;border-radius:4px}",
    ".vc-split ul{display:flex;flex-wrap:wrap;gap:8px 26px;margin:10px 0 0;padding:0;list-style:none}.vc-split li{min-width:0}.vc-split li b{display:block;font-size:18px;font-weight:600}.vc-split li span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#6D6C71}.vc-split li i{width:9px;height:9px;border-radius:2px;flex:none}",
    ".vc-hatch{background:repeating-linear-gradient(135deg,#fff 0 4px,#D3D3D8 4px 6px)!important;box-shadow:inset 0 0 0 1px #C9C8CD}",
    ".vc-waf{display:flex;flex-wrap:wrap;align-items:center;gap:24px}.vc-wg{display:grid;grid-template-columns:repeat(10,16px);gap:3px}.vc-wg i{width:16px;height:16px;border-radius:3px}",
    ".vc-wl{list-style:none;margin:0;padding:0;display:grid;gap:10px;align-content:center}.vc-wl li{display:grid;grid-template-columns:10px 48px 1fr;align-items:center;gap:8px;font-size:13.5px}.vc-wl i{width:10px;height:10px;border-radius:2px}.vc-wl b{font-weight:600}",
    ".vc-dn{display:flex;flex-wrap:wrap;align-items:center;gap:28px}.vc-dn .vc-svg{width:200px;flex:none}.vc-dns{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px}.vc-dns div{text-align:center}.vc-dns .vc-svg{width:110px;margin:0 auto}.vc-dns p{margin:4px 0 0;font-size:13px}.vc-dns .vc-big{font-size:20px}",
    ".vc-ga{text-align:center}.vc-ga .vc-svg{max-width:300px;margin:0 auto}.vc-cap{margin:6px 0 0;font-size:12.5px;color:#77767A}",
    ".vc-fn{display:grid;gap:6px}.vc-fn>div{display:grid;grid-template-columns:minmax(90px,130px) 1fr 110px;align-items:center;gap:12px}.vc-fn .vc-l{font-size:13.5px}.vc-fb{display:flex;justify-content:center}.vc-fb .vc-g{height:30px;border-radius:4px;display:flex;align-items:center;justify-content:center}.vc-fb b{font-size:12.5px;font-weight:600;color:#fff;mix-blend-mode:normal}.vc-fn>div:nth-child(n+3) .vc-fb b{color:#1F273F}.vc-fn em{font-style:normal;font-size:12px;color:#77767A}",
    ".vc-rank{list-style:none;margin:0;padding:0}.vc-rank li{display:grid;grid-template-columns:28px 1fr auto 56px;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #EDEDF0;font-size:13.5px}.vc-rank li.hl{font-weight:600}.vc-rank .n{color:#8E8D92;font-variant-numeric:tabular-nums}.vc-rank .m{font-size:12px;text-align:right;color:#8E8D92}.vc-rank .m.up{color:#3B5D8A}.vc-rank .m.dn{color:#A2A1A6}",
    ".vc-tb{width:100%;border-collapse:collapse;font-size:13.5px}.vc-tb th{font-weight:500;color:#77767A;text-align:left;padding:0 8px 8px 0;border-bottom:1px solid #3A3A3C;font-size:12.5px}.vc-tb td{padding:9px 8px 9px 0;border-bottom:1px solid #EDEDF0}.vc-tb .r{text-align:right}.vc-tbv{display:flex;align-items:center;justify-content:flex-end;gap:8px}.vc-tbv span{width:110px;height:10px;background:#F1F5FA;border-radius:5px;overflow:hidden}.vc-tbv .vc-g{height:10px;border-radius:5px}.vc-tb .up{color:#3B5D8A;font-weight:500}.vc-tb .dn{color:#8E8D92}.vc-spk{width:120px;height:30px;display:block}",
    ".vc-cmp td.best{font-weight:600;color:#3B5D8A}.vc-cmp th.hl{color:#3A3A3C}.vc-cmp .unk{color:#A2A1A6}",
    ".vc-hm{width:100%;border-collapse:separate;border-spacing:3px;font-size:12px}.vc-hm th{font-weight:500;color:#77767A;text-align:left;padding:2px 6px 2px 0}.vc-hm thead th{text-align:center}.vc-hm td{height:30px;text-align:center;border-radius:4px;color:#3A3A3C;font-variant-numeric:tabular-nums}.vc-hm td.on{color:#fff}",
    ".vc-scale{display:flex;align-items:center;gap:3px;margin:10px 0 0;font-size:11.5px;color:#8E8D92}.vc-scale i{width:22px;height:8px;border-radius:2px}.vc-scale span{margin:0 6px}",
    ".vc-kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.vc-kp>div{padding:14px;border:1px solid #EDEDF0;border-radius:10px;background:#fff}.vc-kp p{margin:0;font-size:12.5px;color:#77767A}.vc-kp b{display:block;margin:6px 0 2px;font-size:24px;font-weight:600;letter-spacing:-.02em}.vc-kp span{font-size:12.5px;font-weight:500}.vc-kp .up{color:#3B5D8A}.vc-kp .dn{color:#8E8D92}.vc-kp .vc-spk{margin-top:8px;width:100%}",
    ".vc-bn b{display:block;font-size:46px;font-weight:600;letter-spacing:-.03em;line-height:1;color:#3B5D8A}.vc-bn p{margin:8px 0 0;font-size:14px}",
    ".vc-chg{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.vc-chg>div{padding:14px 18px;border-radius:10px;background:#F1F5FA;min-width:130px}.vc-chg>div.hl{background:#3B5D8A;color:#fff}.vc-chg p{margin:0;font-size:12.5px;opacity:.8}.vc-chg b{display:block;margin-top:4px;font-size:24px;font-weight:600}.vc-chg span{font-size:12.5px;font-weight:500}.vc-chg svg{width:40px}",
    ".vc-icn>div{display:flex;gap:6px;flex-wrap:wrap}.vc-ic{width:20px;height:28px;fill:#E3E9F2}.vc-ic.on{fill:#3B5D8A}.vc-icn p{margin:10px 0 0;font-size:14px}",
    ".vc-tl{list-style:none;margin:0;padding:0 0 0 2px;position:relative}.vc-tl:before{content:'';position:absolute;left:84px;top:6px;bottom:6px;width:1px;background:#E5E5E5}.vc-tl li{display:grid;grid-template-columns:72px 1fr;gap:26px;padding:0 0 14px;position:relative}.vc-tl li:after{content:'';position:absolute;left:79px;top:5px;width:9px;height:9px;border-radius:50%;background:#A8BFDC;box-shadow:0 0 0 3px #fff}.vc-tl li.hl:after{background:#3B5D8A}.vc-tl time{font-size:12.5px;color:#77767A;text-align:right}.vc-tl p{margin:0;font-size:13.5px}.vc-tl b{font-weight:600;display:block}.vc-tl span{color:#6D6C71}",
    /* draw-in: plays once the chart is on screen */
    ".vc .vc-g{transform-origin:left center}.vc .vc-dv .n .vc-g{transform-origin:right center}",
    ".vc:not(.vc-in) .vc-g{transform:scaleX(0)}.vc.vc-in .vc-g{transform:none;transition:transform .9s cubic-bezier(.2,.7,.2,1) var(--d,0ms)}",
    ".vc .vc-gy{transform-box:fill-box;transform-origin:center bottom}.vc:not(.vc-in) .vc-gy{transform:scaleY(0)}.vc.vc-in .vc-gy{transform:none;transition:transform .8s cubic-bezier(.2,.7,.2,1) var(--d,0ms)}",
    ".vc .vc-draw{stroke-dasharray:1;stroke-dashoffset:0}.vc:not(.vc-in) .vc-draw{stroke-dashoffset:1}.vc.vc-in .vc-draw{transition:stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) var(--d,0ms)}",
    ".vc .vc-draw-x{transform-box:fill-box;transform-origin:left center}.vc:not(.vc-in) .vc-draw-x{transform:scaleX(0)}.vc.vc-in .vc-draw-x{transition:transform .9s cubic-bezier(.2,.7,.2,1) .1s}",
    ".vc .vc-pop{transform-box:fill-box;transform-origin:center}.vc:not(.vc-in) .vc-pop{opacity:0;transform:scale(.4)}.vc.vc-in .vc-pop{transition:opacity .4s ease calc(var(--d,0ms) + .3s),transform .5s cubic-bezier(.2,.7,.2,1) calc(var(--d,0ms) + .3s)}",
    ".vc:not(.vc-in) .vc-fade,.vc:not(.vc-in) .vc-wg i,.vc:not(.vc-in) .vc-hm td,.vc:not(.vc-in) .vc-kp>div,.vc:not(.vc-in) .vc-tl li,.vc:not(.vc-in) .vc-ic,.vc:not(.vc-in) .vc-stk{opacity:0}",
    ".vc.vc-in .vc-fade,.vc.vc-in .vc-wg i,.vc.vc-in .vc-hm td,.vc.vc-in .vc-kp>div,.vc.vc-in .vc-tl li,.vc.vc-in .vc-ic,.vc.vc-in .vc-stk{transition:opacity .6s ease var(--d,0ms)}",
    "@media (max-width:560px){.vc-row{grid-template-columns:minmax(72px,104px) 1fr;column-gap:10px}.vc-row>.vc-l{font-size:12.5px}.vc-fn>div{grid-template-columns:90px 1fr;}.vc-fn em{grid-column:2}.vc-wg{grid-template-columns:repeat(10,13px)}.vc-wg i{width:13px;height:13px}.vc-tl:before{left:64px}.vc-tl li{grid-template-columns:52px 1fr}.vc-tl li:after{left:59px}.vc-body{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin}.vc-body>.vc-svg:not(.sq){min-width:500px}.vc-svg text{font-size:13.5px}.vc-svg .vc-val,.vc-svg .vc-cat{font-size:14px}.vc-tbv span{width:60px}}",
    "@media (prefers-reduced-motion:reduce){.vc *{transition:none!important}.vc:not(.vc-in) *{opacity:1!important;transform:none!important;stroke-dashoffset:0!important}}"
  ].join("\n");

  var api = { render: render, figure: figure, pick: pick, animate: animate, inject: inject, TEMPLATES: TEMPLATES, COLORS: C, find: function (id) { return TEMPLATES.filter(function (t) { return t.id === id; })[0]; } };
  root.VChart = api;
})(typeof window !== "undefined" ? window : this);
