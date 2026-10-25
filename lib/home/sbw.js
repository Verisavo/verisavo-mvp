export default function initSbw() {
  // Keep the top bar off the open page's scrollbar, so the scrollbar runs to the top of the window
  const set = () => {
    const el = [...document.querySelectorAll(".pg.open, #rs-detail.open, .rd.open")].pop();
    const w = el ? Math.max(0, el.offsetWidth - el.clientWidth) : 0;
    document.documentElement.style.setProperty("--sbw", w + "px");
  };
  new MutationObserver(() => requestAnimationFrame(set)).observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
  addEventListener("resize", set);
  set();
}
