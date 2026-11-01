// Homepage: workflow explainer (six steps, autoplay while in view)
export default function initWorkflow() {
/* >>> workflow explainer */
(function () {
  /* Workflow explainer: six steps play in turn while the window is in view. A cursor shows where a person would act.
     Clicking a step in the sidebar jumps to it. */
  var root = document.getElementById("workflow"); if (!root || root.__wf) return; root.__wf = 1;
  var main = root.querySelector(".wf-main"), cur = root.querySelector(".wf-cur");
  var btns = [].slice.call(root.querySelectorAll(".wf-side button")), scs = [].slice.call(root.querySelectorAll(".wf-sc"));
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var Q = "Why are our noodle sales slowing in Accra?";
  var DUR = [4600, 3400, 3600, 3600, 3600, 3600];
  var FOCUS = [".wf-ask", ".wf-table", ".wf-gap", ".wf-bars", ".wf-res", ".wf-now"];
  var run = 0, cur_i = 0, vis = false, timers = [];
  var later = function (ms, fn, id) { timers.push(setTimeout(function () { if (id === run) fn(); }, ms)); };
  function point(sel, scene, id, click, then) {
    var t = scene.querySelector(sel); if (!t || !cur) return;
    var m = main.getBoundingClientRect(), r = t.getBoundingClientRect();
    cur.style.setProperty("--cx", (r.left - m.left + Math.min(r.width * .55, 90)) + "px");
    cur.style.setProperty("--cy", (r.top - m.top + r.height * .55) + "px");
    cur.classList.add("on");
    if (click) later(950, function () { cur.classList.add("tap"); t.classList.add("tap"); later(160, function () { cur.classList.remove("tap"); t.classList.remove("tap"); if (then) then(t); }, id); }, id);
  }
  function count(scene, id) {
    [].forEach.call(scene.querySelectorAll(".wf-n"), function (n) {
      var to = +n.dataset.to, t0 = null;
      if (reduced) { n.textContent = to; return; }
      var step = function (ts) { if (id !== run) return; if (!t0) t0 = ts; var k = Math.min(1, (ts - t0 - 300) / 1600); n.textContent = Math.max(0, Math.round(to * k)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  function show(i, auto) {
    timers.forEach(clearTimeout); timers = []; var id = ++run; cur_i = i;
    btns.forEach(function (b, k) { b.classList.toggle("on", k === i); if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    scs.forEach(function (s, k) { s.classList.toggle("on", k === i); s.classList.remove("go"); s.style.transform = ""; });
    var sc = scs[i]; cur.classList.remove("on");
    [].forEach.call(sc.querySelectorAll(".wf-n"), function (n) { n.textContent = "0"; });
    var inv = sc.querySelector(".wf-inv"); if (inv) inv.classList.remove("done");
    var typed = sc.querySelector(".wf-typed");
    if (typed) typed.textContent = reduced ? Q : "";
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (id === run) sc.classList.add("go"); }); });
    if (reduced) { if (inv) inv.classList.add("done"); count(sc, id); return; }
    /* zoom in on the part that matters, then back out before the next step */
    later(250, function () {
      var f = sc.querySelector(FOCUS[i]); if (!f) return;
      var a = sc.getBoundingClientRect(), r = f.getBoundingClientRect(), m = main.getBoundingClientRect();
      var s = Math.min(1.3, (m.width - 36) / r.width, (m.height - 36) / r.height); if (s < 1.06) s = 1.06;
      var cx = r.left - a.left + r.width / 2, cy = r.top - a.top + r.height / 2, tx = m.left - a.left + m.width / 2, ty = m.top - a.top + m.height / 2;
      sc.style.transform = "translate(" + (tx - s * cx).toFixed(1) + "px," + (ty - s * cy).toFixed(1) + "px) scale(" + s.toFixed(3) + ")";
    }, id);
    later(DUR[i] - 900, function () { sc.style.transform = ""; cur.classList.remove("on"); }, id);
    if (i === 0) { for (var t = 1; t <= Q.length; t++) (function (t) { later(300 + t * 24, function () { typed.textContent = Q.slice(0, t); }, id); })(t); later(2200, function () { point(".wf-send", sc, id, true); }, id); }
    if (i === 2) later(1300, function () { point(".wf-inv", sc, id, true, function (t) { t.classList.add("done"); }); }, id);
    if (i === 3) count(sc, id);
    if (i === 5) later(1600, function () { point(".wf-new", sc, id, true); }, id);
    var side = btns[i]; if (side && side.parentNode.scrollWidth > side.parentNode.clientWidth) side.parentNode.scrollTo({ left: side.offsetLeft - 10, behavior: "smooth" });
    if (auto !== false && vis) later(DUR[i], function () { show((i + 1) % scs.length); }, id);
  }
  btns.forEach(function (b, k) { b.addEventListener("click", function () { show(k); }); });
  show(0, false);
  if (!("IntersectionObserver" in window)) { vis = true; show(0); return; }
  new IntersectionObserver(function (es) {
    var v = es[0].isIntersecting;
    if (v && !vis) { vis = true; show(cur_i); }
    else if (!v && vis) { vis = false; timers.forEach(clearTimeout); timers = []; run++; }
  }, { threshold: .3 }).observe(root.querySelector(".wf-win"));
})();
/* <<< workflow explainer */
}
