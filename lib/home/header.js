// Header backdrop once the page scrolls
// Runs once in the browser after the page has rendered (see the page's client component).
export default function init() {
  /* header backdrop: on once the page (or an open page or detail view) has scrolled */
  (() => {
    const set = () => {
      const scrollers = [document.querySelector(".rs-detail.open"), document.querySelector(".pg.open")].filter(Boolean);
      const y = scrollers.length ? scrollers[0].scrollTop : scrollY;
      document.body.classList.toggle("hdr-solid", y > 24);
    };
    addEventListener("scroll", set, { passive: true });
    document.addEventListener("scroll", set, { capture: true, passive: true });
    new MutationObserver(set).observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: false });
    addEventListener("hashchange", () => setTimeout(set, 50));
    set();
  })();
}
