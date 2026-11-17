// Coming soon dialog
// Runs once in the browser after the page has rendered (see the page's client component).
export default function init() {
  /* "Coming soon" for Deploy a Scout in the menu */
  (() => {
    const d = document.getElementById("soon");
    const open = () => { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); setTimeout(() => d.querySelector(".btn").focus(), 30); };
    const close = () => d.close ? d.close() : d.removeAttribute("open");
    /* the same pop-up serves Deploy a Scout and research studies still in preparation */
    const ic = d.querySelector(".soon-ic"), h = d.querySelector("#soon-h"), tx = d.querySelector("#soon-h + p"), def = [ic.innerHTML, h.textContent, tx.textContent];
    const DOC = '<svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="#1F273F" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><path d="M4 1.8h5.5L12.5 5v9.2H4z"/><path d="M9.5 1.8V5h3M6 8h4.5M6 10.5h4.5"/></svg>';
    const setKind = study => {
      if (study) { ic.innerHTML = DOC; h.textContent = (document.getElementById("rd-title") || {}).textContent || "Research study"; tx.textContent = "This study is in preparation. It will be published here soon."; }
      else { ic.innerHTML = def[0]; h.textContent = def[1]; tx.textContent = def[2]; }
    };
    document.addEventListener("click", e => {
      const s = e.target.closest("[data-soon]");
      if (s) { setKind(s.dataset.soon === "study"); open(); }
      if (e.target.closest("[data-soon-close]")) close();
    });
    d.addEventListener("click", e => { if (e.target === d) close(); });
  })();
}
