// Market menus: search across all 54 countries
export default function marketSearch() {
/* market menus: search across 54 countries, hide empty regions, focus the search box when a menu opens */
(function () {
  if (window.__vsMk) return; window.__vsMk = 1;
  var norm = function (t) { return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, ""); };
  var filter = function (inp) {
    var ul = inp.closest("ul"), q = norm(inp.value).trim(), any = false, head = null, headAny = false;
    [].forEach.call(ul.children, function (li) {
      if (li.classList.contains("mk-s") || li.classList.contains("mk-none")) return;
      if (li.classList.contains("mk-h")) { if (head) head.hidden = !headAny; head = li; headAny = false; return; }
      var b = li.querySelector("button"); if (!b) return;
      var hit = !q || norm(b.getAttribute("data-k") || b.textContent).indexOf(q) > -1;
      if (!b.getAttribute("data-k")) hit = !q; /* "All markets" only when not searching */
      li.hidden = !hit; if (hit) { any = true; headAny = true; }
    });
    if (head) head.hidden = !headAny;
    var none = ul.querySelector(".mk-none"); if (none) none.hidden = any;
  };
  document.addEventListener("input", function (e) { if (e.target.classList && e.target.classList.contains("mk-q")) filter(e.target); });
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (!t.classList || !t.classList.contains("mk-q")) return;
    if (e.key === "ArrowDown" || e.key === "Enter") { var b = [].find.call(t.closest("ul").querySelectorAll("li:not([hidden]) > button"), function () { return true; }); if (b) { e.preventDefault(); e.stopPropagation(); e.key === "Enter" ? b.click() : b.focus(); } }
  }, true);
  var fine = window.matchMedia && matchMedia("(pointer: fine)").matches;
  var watch = function () {
    document.querySelectorAll("#va-scope-menu, #place-menu").forEach(function (ul) {
      if (ul.__mk) return; ul.__mk = 1;
      new MutationObserver(function () {
        var inp = ul.querySelector(".mk-q"); if (!inp) return;
        if (ul.hidden) { if (inp.value) { inp.value = ""; filter(inp); } }
        else { if (fine) setTimeout(function () { inp.focus(); }, 0); var c = ul.querySelector('[aria-checked="true"]'); if (c && c.scrollIntoView && c.textContent !== "All markets") c.scrollIntoView({ block: "nearest" }); }
      }).observe(ul, { attributes: true, attributeFilter: ["hidden"] });
    });
  };
  watch(); new MutationObserver(watch).observe(document.documentElement, { childList: true, subtree: true });
})();
}
