// Assistant sidebar: grouped navigation (Core dashboards, Market research, Intelligence assistance), Recent and Credits
export default function init() {
/* >>> assistant sidenav v1 */
(function () {
  /* Assistant sidebar: Core dashboards, Market research, Intelligence assistance and Recent.
     Overview, Investigations and Set up a task open the existing client views inside the Assistant.
     AI Assistant returns to the conversation. */
  var va = document.getElementById("va"), side = document.getElementById("va-side"), main = va && va.querySelector(".va-main");
  if (!va || !side || !main || document.getElementById("vsn")) return;
  var I = {
    grid: '<rect x="3.5" y="3.5" width="5.5" height="13" rx="1.6"></rect><rect x="11" y="3.5" width="5.5" height="5.5" rx="1.6"></rect><rect x="11" y="11" width="5.5" height="5.5" rx="1.6"></rect>',
    clip: '<rect x="4.5" y="4" width="11" height="13" rx="2"></rect><path d="M7.5 4V3h5v1M7.5 8.5h5M7.5 11.5h5M7.5 14.5h3"></path>',
    task: '<rect x="3.5" y="3.5" width="13" height="13" rx="2.4"></rect><path d="M10 7v6M7 10h6"></path>',
    bot: '<rect x="4" y="7" width="12" height="9" rx="2.6"></rect><path d="M10 7V4.5M8 11h.01M12 11h.01M2.5 10.5v2.5M17.5 10.5v2.5"></path><circle cx="10" cy="4" r=".9"></circle>',
    gap: '<circle cx="10" cy="10" r="6.5" stroke-dasharray="2.6 2.2"></circle><path d="M8.3 8.4a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.7.6-.7 1.1v.3M10 13.6h.01"></path>',
    sim: '<path d="M3.5 15.5 7.5 10l3 3 6-8"></path><path d="M13 5h3.5v3.5"></path><path d="M3.5 17.5h13"></path>',
    card: '<rect x="2.5" y="5" width="15" height="10.5" rx="2"></rect><path d="M2.5 8.5h15M5.5 12.5h3"></path>'
  };
  var svg = function (k) { return '<svg class="vi" viewBox="0 0 20 20" aria-hidden="true">' + I[k] + "</svg>"; };
  var item = function (key, label, icon) { return '<li><button type="button" class="va-nav vsn-i" data-vsn="' + key + '">' + svg(icon) + "<span>" + label + "</span></button></li>"; };

  var css = document.createElement("style");
  css.textContent = [
    "#va .vsn{display:grid;gap:2px;margin:6px 0 0}",
    "#va .vsn ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}",
    "#va .vsn-h,#va .va-h.va-h-recent{margin:16px 0 6px!important;padding-left:12px!important;font:600 .7rem/1 var(--sans)!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:#8A93A6!important}",
    "#va .vsn-h:first-child{margin-top:10px!important}",
    "#va .va-empty{padding-left:12px!important;margin-left:0!important}",
    "#va .vsn-i[aria-current=page]{background:#E3EBF8!important;color:#1F273F!important;font-weight:600!important}",
    "#va .va-recent button{font-size:.875rem!important;color:#5B6478!important}",
    "#va .va-recent button[aria-current=true]{color:#1F273F!important;font-weight:600!important}",
    "#va .va-brand .vsn-mark{width:30px;height:30px;flex:none;border-radius:8px;display:block}",
    "#va .va-brand .vsn-bl{display:flex;align-items:center;gap:10px;min-width:0}",
    "#va .vsn-soon{cursor:default!important;color:#8A93A6!important}#va .vsn-soon:hover{background:none!important}",
    "#va .vsn-soon em{margin-left:auto;flex:none;padding:3px 8px;border-radius:999px;background:#F0F3F8;font:500 .6875rem/1 var(--sans);font-style:normal;color:#6A7285;white-space:nowrap}",
    "#va #vsn, #va #vsn ul, #va #vsn li{max-width:100%;min-width:0;width:auto}#va #vsn li{display:block}",
    "#va .vsn-soon{display:flex!important;align-items:center;width:100%;max-width:100%;box-sizing:border-box;overflow:hidden}#va .vsn-soon > span{flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}#va .vsn-soon > svg{flex:none}",
    "@media (max-height:760px){#va .va-side{scrollbar-width:thin}#va .vsn-h,#va .va-h.va-h-recent{margin:10px 0 4px!important}#va .vsn-h:first-child{margin-top:6px!important}#va .vsn .va-nav{padding-top:7px!important;padding-bottom:7px!important}}",
    "#va #va-brief .vs-back[data-to=home]{display:none!important}",
    "#va #kb-nav.vsn-menu{display:block;width:100%;text-align:left}"
  ].join("");
  document.head.appendChild(css);

  /* brand mark beside the wordmark */
  var word = side.querySelector(".va-word");
  if (word && !side.querySelector(".vsn-mark")) {
    var bl = document.createElement("span"); bl.className = "vsn-bl";
    bl.innerHTML = '<svg class="vsn-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#1F273F"></rect><path d="M17 19h7.2l7.8 21.5L39.8 19H47L35.6 47h-7.2z" fill="#FFFFFF"></path><circle cx="47" cy="45" r="3.2" fill="#80AADC"></circle></svg>';
    word.parentNode.insertBefore(bl, word); bl.appendChild(word);
  }

  /* the grouped navigation replaces Search, Investigations and Company knowledge */
  var nav = document.createElement("nav"); nav.className = "vsn"; nav.id = "vsn"; nav.setAttribute("aria-label", "Workspace");
  nav.innerHTML =
    '<p class="vsn-h">Core dashboards</p><ul>' + item("c-overview", "Overview", "grid") + "</ul>" +
    '<p class="vsn-h">Market research</p><ul>' + item("c-surveys", "Investigations", "clip") + item("c-builder", "Set up a task", "task") + "</ul>" +
    '<p class="vsn-h">Intelligence assistance</p><ul>' + item("chat", "AI Assistant", "bot") + "</ul>" +
    '<p class="vsn-h">Simulation</p><ul><li><span class="va-nav vsn-i vsn-soon" aria-disabled="true">' + svg("sim") + '<span>Simulator</span><em>Coming soon</em></span></li></ul>';
  var oldList = side.querySelector(".va-list:not(.va-recent)"), newBtn = document.getElementById("va-new");
  var kb = document.getElementById("kb-nav");
  if (newBtn) newBtn.insertAdjacentElement("afterend", nav); else side.insertBefore(nav, side.firstChild);
  if (oldList) oldList.style.display = "none";
  var search = document.getElementById("va-search"); if (search) search.hidden = true;

  /* Company knowledge moves into the account menu so it stays reachable */
  var gm = document.getElementById("va-gear-menu");
  if (kb && gm) {
    kb.className = "vsn-menu"; kb.setAttribute("role", "menuitem"); kb.textContent = "Knowledge Base";
    gm.insertBefore(kb, gm.firstChild);
    kb.addEventListener("click", function () { gm.hidden = true; var g = document.getElementById("va-gear"); if (g) g.setAttribute("aria-expanded", "false"); });
  }

  /* plan line under the name */
  var user = side.querySelector(".va-user");
  if (user) { var sub = user.querySelector(".va-who small"); if (sub) sub.textContent = "Verisavo plan"; }
  if (user) user.style.marginTop = "auto";

  /* which item is current */
  var curHash = "";
  window.addEventListener("message", function (e) {
    if (!e.data) return;
    if (e.data.vs === "inv-hash") { curHash = String(e.data.h || ""); mark(); }
    if (e.data.vs === "back-chat") { closeInv(); closeDrawer(); setTimeout(function () { mark(); var t = document.getElementById("ask") || document.getElementById("va-in"); if (t) t.focus(); }, 30); }
  });
  var frameHash = function () { var f = main.querySelector(".va-inv iframe"); try { var h = f && f.contentWindow ? f.contentWindow.location.hash.slice(1) : ""; return h || curHash; } catch (e) { return curHash; } };
  function mark() {
    var cur = "chat";
    if (main.classList.contains("inv-on")) {
      var h = frameHash();
      cur = /^c-surveys?/.test(h) ? "c-surveys" : h === "c-builder" ? "c-builder" : h === "c-overview" || !h ? "c-overview" : "";
    } else if (main.classList.contains("brief-on")) cur = "gaps";
    else if (main.classList.contains("kb-on")) cur = "";
    [].forEach.call(nav.querySelectorAll("[data-vsn]"), function (b) {
      if (b.dataset.vsn === cur) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  function watchFrame() {
    var f = main.querySelector(".va-inv iframe"); if (!f || f.dataset.vsnWatch) return;
    f.dataset.vsnWatch = "1";
    f.addEventListener("load", function () { mark(); try { f.contentWindow.addEventListener("hashchange", mark); } catch (e) {} });
  }
  new MutationObserver(function () { watchFrame(); mark(); }).observe(main, { attributes: true, attributeFilter: ["class"], childList: true });

  function closeDrawer() { var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim"); if (app && app.classList.contains("va-drawer") && scrim) scrim.click(); }
  function closeKb() { [].forEach.call(main.querySelectorAll(":scope > .kb"), function (p) { p.remove(); }); main.classList.remove("kb-on"); }
  function closeBrief() { var bp = document.getElementById("va-brief"); main.classList.remove("brief-on"); if (bp) bp.hidden = true; }
  function closeInv() { window.postMessage({ vs: "close-platform" }, "*"); }

  /* window capture phase: runs before the Assistant's own (document, capture) sidebar handler, so switching views never tears the panel down */
  window.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#vsn [data-vsn]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.dataset.vsn; closeKb();
    if (k === "gaps") { closeInv(); closeDrawer(); if (window.vsOpenBrief) window.vsOpenBrief("gaps"); setTimeout(mark, 30); return; }
    closeBrief();
    if (k === "chat") { closeInv(); closeDrawer(); setTimeout(function () { mark(); var t = document.getElementById("ask") || document.getElementById("va-in"); if (t) t.focus(); }, 30); return; }
    var f = main.classList.contains("inv-on") && main.querySelector(".va-inv iframe");
    curHash = k;
    if (f && f.src && f.src.indexOf("about:blank") !== 0) {
      /* same page, new fragment: the view changes without reloading (works even when the frame cannot be read) */
      var base = f.src.split("#")[0]; if (f.src !== base + "#" + k) f.src = base + "#" + k; closeDrawer();
    } else if (window.vsInvestigations) window.vsInvestigations(k);
    setTimeout(mark, 30);
  }, true);
  /* Intelligence Gaps page wording matches the sidebar */
  var bp0 = document.getElementById("va-brief");
  window.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("#va-brief [data-gaps-close]")) { e.stopPropagation(); closeBrief(); setTimeout(mark, 30); var i = document.getElementById("ask") || document.getElementById("va-in"); if (i) i.focus(); } }, true);
  /* On the Intelligence Gaps page: Investigate this gap opens Set up a task with the gap filled in; the other links go to the current views */
  window.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest || !t.closest("#va-brief")) return;
    var an = t.closest(".vs-an[data-gap]"), to = t.closest("[data-to]");
    var bp = document.getElementById("va-brief"); if (!bp || bp.hidden) return;
    var gapView = !!bp.querySelector(".vs-gap, .vs-empty") && !bp.querySelector(".vb-card");
    if (!gapView || (!an && !to)) return;
    var dest = an ? "c-builder" : to.dataset.to === "new" ? "c-builder" : to.dataset.to === "home" ? "c-surveys" : "";
    if (!dest) return;
    e.preventDefault(); e.stopPropagation();
    var gap = "", ctx = null;
    if (an) { var li = an.closest(".vs-gap"), h = li && li.querySelector(".vs-gap-h"); gap = h ? h.textContent.trim() : ""; try { ctx = an.dataset.gapCtx ? JSON.parse(an.dataset.gapCtx) : null; } catch (er) { ctx = null; } }
    closeBrief(); curHash = dest;
    if (window.vsInvestigations) window.vsInvestigations(dest, gap, ctx);
    setTimeout(mark, 30);
  }, true);
  mark();
})();
/* <<< assistant sidenav v1 */
}
