// Insights: featured block that cycles through the current tab's top three items
export default function initInsightsFeat() {
  /* Insights: a large featured block above the list that cycles through the current tab's items */
  const page = document.getElementById("pg-research");
  if (!page) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let box = null, items = [], k = 0, timer = 0, paused = false;
  const pick = () => {
    const panel = page.querySelector("[data-rpanel]:not([hidden])"); if (!panel) return [];
    const cards = [...panel.querySelectorAll(".rs-card:not([hidden]), .ar-feat, .ar-row, .cs-card")].filter(c => c.offsetParent !== null || c.classList.contains("ar-feat"));
    return cards.slice(0, 3).map(c => {
      const art = c.querySelector(".rs-art svg");
      const desc = c.querySelector(".rs-sub, .cs-q, .ar-feat-body > p:not(.rs-meta), .ar-body > p:not(.rs-meta)");
      const meta = c.querySelector(".rs-meta");
      return { card: c, art: art ? art.outerHTML : "", title: (c.querySelector("h3") || {}).textContent || "", desc: desc ? desc.textContent : "", meta: meta ? meta.textContent.replace(/^Featured · /, "") : "" };
    });
  };
  const build = () => {
    if (!box) {
      box = document.createElement("section"); box.className = "ix-feat"; box.setAttribute("aria-label", "Featured");
      box.innerHTML = '<div class="ix-art"></div><div class="ix-body"><p class="ix-meta"></p><h2 class="ix-title"></h2><p class="ix-desc"></p><div class="ix-row"><button type="button" class="ix-read">Read more</button><div class="ix-dots" role="tablist" aria-label="Featured items"></div></div></div>';
      const tabs = page.querySelector(".rx-tabs"); (tabs || page.querySelector(".pg-head")).after(box);
      box.querySelector(".ix-read").addEventListener("click", () => { const it = items[k]; if (it) it.card.click(); });
      box.querySelector(".ix-art").addEventListener("click", () => { const it = items[k]; if (it) it.card.click(); });
      box.addEventListener("mouseenter", () => { paused = true; }); box.addEventListener("mouseleave", () => { paused = false; });
      box.addEventListener("focusin", () => { paused = true; }); box.addEventListener("focusout", () => { paused = false; });
    }
    const first = !box.dataset.ready; box.dataset.ready = "1"; items = pick(); k = 0;
    box.hidden = !items.length;
    box.querySelector(".ix-dots").innerHTML = items.map((_, i) => '<button type="button" role="tab" aria-label="Show item ' + (i + 1) + '"></button>').join("");
    [...box.querySelectorAll(".ix-dots button")].forEach((b, i) => b.addEventListener("click", () => { show(i); restart(); }));
    show(0, first); restart();
  };
  const show = (i, instant) => {
    const it = items[i]; if (!it) return; k = i;
    const set = () => {
      box.querySelector(".ix-art").innerHTML = it.art;
      box.querySelector(".ix-meta").textContent = it.meta;
      box.querySelector(".ix-title").textContent = it.title;
      box.querySelector(".ix-desc").textContent = it.desc;
      [...box.querySelectorAll(".ix-dots button")].forEach((b, n) => b.setAttribute("aria-selected", String(n === i)));
      box.classList.remove("ix-out");
    };
    if (instant || reduce) { set(); return; }
    box.classList.add("ix-out"); setTimeout(set, 320);
  };
  const restart = () => { clearInterval(timer); if (reduce || items.length < 2) return; timer = setInterval(() => { if (!paused && page.classList.contains("open") && document.visibilityState === "visible") show((k + 1) % items.length); }, 6000); };
  new MutationObserver(() => { if (page.classList.contains("open")) setTimeout(build, 80); }).observe(page, { attributes: true, attributeFilter: ["class"] });
  page.addEventListener("click", e => { if (e.target.closest(".rx-tab, .rs-chip")) setTimeout(build, 120); });
  if (page.classList.contains("open")) build();
}
