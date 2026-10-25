// Product page: start the looping tile animations when each tile scrolls into view
export default function initOhTiles() {
(function () { var els = document.querySelectorAll(".oh-tile"); if (!els.length) return; if (!("IntersectionObserver" in window)) { [].forEach.call(els, function (e) { e.classList.add("in"); }); return; } var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .35 }); [].forEach.call(els, function (e) { io.observe(e); }); })();
}
