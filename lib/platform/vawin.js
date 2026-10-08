/* Assistant window controls: full screen, and collapse to a small tab that reopens the same conversation. */
export default function init() {
  const va = document.getElementById("va"), x = document.getElementById("va-x");
  if (!va || !x) return;
  const svg = d => `<svg class="vi" viewBox="0 0 20 20" aria-hidden="true">${d}</svg>`;
  const mk = (id, label, html) => { const b = document.createElement("button"); b.type = "button"; b.className = "va-ib"; b.id = id; b.setAttribute("aria-label", label); b.title = label; b.innerHTML = html; return b; };

  const minBtn = mk("va-min", "Collapse assistant", svg('<path d="M5 13h10"/>'));
  const fullBtn = mk("va-full", "Full screen", svg('<path class="vi-exp" d="M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4"/><path class="vi-shr" d="M8 4v4H4M12 4v4h4M8 16v-4H4M12 16v-4h4"/>'));
  fullBtn.classList.add("va-fullbtn"); fullBtn.setAttribute("aria-pressed", "false");
  x.before(minBtn, fullBtn);

  /* full screen, remembered for the visit */
  const setFull = on => {
    va.classList.toggle("va-full", on); fullBtn.setAttribute("aria-pressed", String(on));
    const l = on ? "Exit full screen" : "Full screen"; fullBtn.setAttribute("aria-label", l); fullBtn.title = l;
    try { sessionStorage.setItem("verisavo-va-full", on ? "1" : "0"); } catch (e) {}
  };
  fullBtn.addEventListener("click", () => setFull(!va.classList.contains("va-full")));
  try { if (sessionStorage.getItem("verisavo-va-full") === "1") setFull(true); } catch (e) {}

  /* the tab that holds a collapsed conversation */
  const tab = document.createElement("button");
  tab.type = "button"; tab.className = "va-tab"; tab.id = "va-tab"; tab.hidden = true;
  tab.setAttribute("aria-label", "Reopen the Verisavo assistant");
  tab.innerHTML = '<span class="va-tab-mark" aria-hidden="true">V</span><span class="va-tab-txt"><b>Verisavo Assistant</b><span id="va-tab-q">Continue where you left off</span></span>' +
    '<svg class="va-tab-up" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 12l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(tab);
  const tabQ = tab.querySelector("#va-tab-q");

  const lastQuestion = () => {
    const u = [...va.querySelectorAll("#va-thread .va-msg-u")].pop();
    const t = u ? (u.querySelector("p") || u).textContent.trim() : "";
    return t || "Continue where you left off";
  };
  const collapse = () => {
    tabQ.textContent = lastQuestion();
    va.close ? va.close() : va.removeAttribute("open");
    tab.hidden = false; tab.classList.remove("in"); requestAnimationFrame(() => tab.classList.add("in"));
  };
  minBtn.addEventListener("click", collapse);
  tab.addEventListener("click", () => { tab.hidden = true; if (window.vaOpen) window.vaOpen(); else va.showModal(); });
  // closing with the X ends it; opening the assistant any other way removes the tab
  x.addEventListener("click", () => { tab.hidden = true; });
  new MutationObserver(() => { if (va.open) tab.hidden = true; }).observe(va, { attributes: true, attributeFilter: ["open"] });
}
