// Homepage: The problem simulation (scattered sources connected, one gap named)
export default function initProblem() {
/* >>> problem sim */
(function () {
  /* The problem: five scattered sources are connected, and one Intelligence Gap is named. Plays while in view. */
  var root = document.getElementById("problem"); if (!root || root.__pb) return; root.__pb = 1;
  var win = root.querySelector(".pb-win"), st = root.querySelector(".pb-st"), pr = [].slice.call(root.querySelectorAll(".pb-pr i")), ph = [].slice.call(root.querySelectorAll(".pb-ph li"));
  var TXT = ["5 sources · none connected", "Checking source, place and date · 4 connected", "4 connected · 1 Intelligence Gap"], HOLD = [2600, 3000, 4600];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, cur = 0, timer = null, vis = false;
  function set(p) {
    cur = p; win.classList.remove("p0", "p1", "p2"); win.classList.add("p" + p);
    st.textContent = TXT[p];
    pr.forEach(function (x, i) { x.className = i < p ? "done" : i === p ? "on" : ""; });
    ph.forEach(function (li, i) { li.classList.toggle("on", i === p); if (i === p) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
  }
  function next() { clearTimeout(timer); if (!vis || reduced) return; timer = setTimeout(function () { set((cur + 1) % 3); next(); }, HOLD[cur]); }
  ph.forEach(function (li, i) {
    li.tabIndex = 0;
    var pick = function () { set(i); next(); };
    li.addEventListener("click", pick);
    li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  set(reduced ? 2 : 0);
  if (!("IntersectionObserver" in window)) { set(2); return; }
  new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) { if (!reduced) { set(0); next(); } } else clearTimeout(timer); }, { threshold: .35 }).observe(win);
})();
/* <<< problem sim */
}
