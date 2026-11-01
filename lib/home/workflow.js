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
  var DUR = [7000, 5600, 5200, 5600, 5600, 5200];
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
      var step = function (ts) { if (id !== run) return; if (!t0) t0 = ts; var k = Math.min(1, (ts - t0 - 600) / 2600); n.textContent = Math.max(0, Math.round(to * k)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  function show(i, auto) {
    timers.forEach(clearTimeout); timers = []; var id = ++run; cur_i = i;
    btns.forEach(function (b, k) { b.classList.toggle("on", k === i); if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    scs.forEach(function (s, k) { s.classList.toggle("on", k === i); s.classList.remove("go"); });
    var sc = scs[i]; cur.classList.remove("on");
    [].forEach.call(sc.querySelectorAll(".wf-n"), function (n) { n.textContent = "0"; });
    var inv = sc.querySelector(".wf-inv"); if (inv) inv.classList.remove("done");
    var typed = sc.querySelector(".wf-typed");
    if (typed) typed.textContent = reduced ? Q : "";
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (id === run) sc.classList.add("go"); }); });
    if (reduced) { if (inv) inv.classList.add("done"); count(sc, id); return; }
    if (i === 0) { point(".wf-type", sc, id); for (var t = 1; t <= Q.length; t++) (function (t) { later(500 + t * 42, function () { typed.textContent = Q.slice(0, t); }, id); })(t); later(4900, function () { point(".wf-send", sc, id, true); }, id); }
    if (i === 1) later(2600, function () { point(".wf-pill", sc, id); }, id);
    if (i === 2) later(1900, function () { point(".wf-inv", sc, id, true, function (t) { t.classList.add("done"); }); }, id);
    if (i === 3) { count(sc, id); later(1200, function () { point(".wf-bars", sc, id); }, id); }
    if (i === 4) later(2800, function () { point(".wf-res", sc, id); }, id);
    if (i === 5) later(3000, function () { point(".wf-new", sc, id, true); }, id);
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
