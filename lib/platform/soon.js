// Coming soon dialog
// Runs once in the browser after the page has rendered (see the page's client component).
export default function init() {
  /* "Coming soon" for Deploy a Scout in the menu */
  (() => {
    const d = document.getElementById("soon");
    const open = () => { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); setTimeout(() => d.querySelector(".btn").focus(), 30); };
    const close = () => d.close ? d.close() : d.removeAttribute("open");
    document.addEventListener("click", e => {
      if (e.target.closest("[data-soon]")) open();
      if (e.target.closest("[data-soon-close]")) close();
    });
    d.addEventListener("click", e => { if (e.target === d) close(); });
  })();
}
