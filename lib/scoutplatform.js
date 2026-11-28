// Scout Platform overlay: client side from the Assistant, scout side from Community.
export default function init() {
/* >>> scout platform */
(function () {
  /* The Scout Platform opens full screen over the site.
     Client side: inside the Assistant (signed in), Investigations or Investigate this gap replace the conversation area.
     Admin (footer): the full simulation, including the SavoScout WhatsApp chat. */
  if (window.vsPlatform) return;
  var BASE = "/";
  var css = document.createElement("style");
  css.textContent = ".vsp{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#EEF1F6;overflow:hidden}" +
    ".vsp::backdrop{background:rgba(20,28,40,.5)}.vsp iframe{display:block;width:100%;height:100%;border:0}" +
    ".vsp[open]{animation:vspIn .28s cubic-bezier(.2,.7,.2,1)}@keyframes vspIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion:reduce){.vsp[open]{animation:none}}" +
    ".va-main.inv-on>.va-body,.va-main.inv-on>.va-dock{display:none!important}.va-main.inv-on .va-top>.va-pop-wrap{visibility:hidden}" +
    ".va-inv{position:relative;z-index:2;flex:1 1 auto;min-height:0;display:flex;border-top:1px solid #DFDFDF;background:#EEF1F6;animation:vaInvIn .22s ease-out}" +
    ".va-inv iframe{flex:1;width:100%;height:100%;border:0;display:block}@keyframes vaInvIn{from{opacity:0}to{opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.va-inv{animation:none}}" +
    ".va-inv{animation:none}.va-inv.va-inv-wait{position:absolute;left:0;right:0;bottom:0;visibility:hidden;pointer-events:none}.va-main.inv-re>.va-body,.va-main.inv-re>.va-dock{visibility:hidden}";
  document.head.appendChild(css);
  var dlg = null, frame = null;
  function open(side, hash, gap) {
    if (!dlg) {
      dlg = document.createElement("dialog"); dlg.className = "vsp";
      frame = document.createElement("iframe");
      dlg.appendChild(frame); document.body.appendChild(dlg);
      dlg.addEventListener("close", function () { frame.src = "about:blank"; document.documentElement.style.overflow = ""; });
    }
    var label = side === "admin" ? "Admin: platform simulation" : side === "scout" ? "SavoScouts on WhatsApp" : "Market investigations";
    dlg.setAttribute("aria-label", label); frame.title = label;
    frame.src = BASE + "scout-platform.html?side=" + side + (gap ? "&gap=" + encodeURIComponent(gap) : "") + "#" + hash;
    document.documentElement.style.overflow = "hidden";
    if (!dlg.open) dlg.showModal();
    frame.focus();
  }
  window.vsPlatform = open;
  /* Inside the Assistant: investigations replace the conversation area, the Assistant sidebar stays */
  var panel = null;
  function inline(hash, gap, ctx) {
    var va = document.getElementById("va"), main = va && va.querySelector(".va-main");
    if (!main || !va.open) { open("client", hash, gap); return; }
    if (!panel) {
      panel = document.createElement("div"); panel.className = "va-inv";
      var f = document.createElement("iframe"); f.title = "Market investigations"; panel.appendChild(f);
      main.appendChild(panel);
    }
    /* keep the current screen up until the investigations page has loaded and drawn, so nothing half-built flashes */
    var fr = panel.firstChild, url = BASE + "scout-platform.html?side=client&inline=1" + (gap ? "&gap=" + encodeURIComponent(gap) : "") + (ctx ? "&gapctx=" + encodeURIComponent(JSON.stringify(ctx)) : "") + "#" + hash;
    var abs = function (u) { try { return new URL(u, location.href).href.split("#")[0]; } catch (e) { return u.split("#")[0]; } };
    var fresh = !main.classList.contains("inv-on") || !fr.src || abs(fr.src) !== abs(url);
    if (fresh) {
      var top = main.querySelector(".va-top"); panel.style.top = (top ? top.offsetHeight : 0) + "px"; panel.classList.add("va-inv-wait");
      var done = false, show = function () { if (done) return; done = true; requestAnimationFrame(function () { requestAnimationFrame(function () { if (!panel) return; panel.classList.remove("va-inv-wait"); panel.style.top = ""; main.classList.add("inv-on"); main.classList.remove("inv-re"); }); }); };
      fr.addEventListener("load", show, { once: true }); setTimeout(show, 1500);
      fr.src = url;
    } else { fr.src = url; main.classList.add("inv-on"); }
    var b = document.getElementById("va-scouts"); if (b) { b.classList.add("on"); b.setAttribute("aria-current", "page"); }
    var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim");
    if (app && app.classList.contains("va-drawer") && scrim) scrim.click();
  }
  window.vsInvestigations = function (hash, gap, ctx) { inline(hash || "c-overview", gap, ctx); };
  window.vsCloseInvestigations = function () { closeInline(); };
  function closeInline() {
    if (!panel) return;
    var main = panel.parentNode; if (main) main.classList.remove("inv-on");
    panel.remove(); panel = null; lastAt = "";
    var b = document.getElementById("va-scouts"); if (b) { b.classList.remove("on"); b.removeAttribute("aria-current"); }
  }
  var vaDlg = document.getElementById("va"), KEEP = "vs-inv-last", skipKeep = false;
  /* Closing the window keeps your place: the same investigations screen comes back when Verisavo is opened again. */
  (function patch() { var o = window.vaOpen; if (o && !o._inv) { var n = function (u, q) { skipKeep = !!(q && String(q).trim()); return o.apply(this, arguments); }; n._inv = 1; window.vaOpen = n; } else if (!o) setTimeout(patch, 40); })();
  var lastAt = "";
  window.addEventListener("message", function (e) { if (e.data && e.data.vs === "inv-at" && panel && e.source === panel.firstChild.contentWindow) lastAt = e.data.hash || ""; });
  if (vaDlg) {
    vaDlg.addEventListener("close", function () {
      if (panel && lastAt) { try { sessionStorage.setItem(KEEP, lastAt); } catch (e) {} }
      closeInline();
    });
    new MutationObserver(function () {
      if (!vaDlg.open || panel) return; var h = ""; try { h = sessionStorage.getItem(KEEP) || ""; sessionStorage.removeItem(KEEP); } catch (e) {}
      if (!h || skipKeep) { skipKeep = false; return; }
      var m = vaDlg.querySelector(".va-main"); if (m) m.classList.add("inv-re");
      setTimeout(function () { if (m) m.classList.remove("inv-re"); }, 1800);
      (window.vsInvestigations || inline)(h);
    }).observe(vaDlg, { attributes: true, attributeFilter: ["open"] });
  }
  window.addEventListener("message", function (e) {
    if (e.data && e.data.vs === "close-platform") { if (dlg && dlg.open) dlg.close(); closeInline(); }
    if (e.data && e.data.vs === "gaps-request" && e.source) { try { e.source.postMessage({ vs: "open-gaps", items: window.vsOpenGaps ? window.vsOpenGaps() : [] }, "*"); } catch (x) {} }
  });
  document.addEventListener("click", function (e) {
    var t = e.target, b;
    /* Assistant: Investigations and Investigate this gap open the client side */
    if (t.closest("#va-scouts")) { e.preventDefault(); e.stopImmediatePropagation(); inline("c-overview"); return; }
    /* Anything else in the Assistant sidebar (new question, a recent question, search) returns to the conversation */
    if (panel && t.closest("#va-side button, #va-side a") && !t.closest("#va-side-x, #va-gear, .va-pop")) closeInline();
    if ((b = t.closest(".va-gapbtn"))) {
      e.preventDefault(); e.stopImmediatePropagation();
      var li = b.closest(".va-msg-a"), u = li && li.previousElementSibling, q = "";
      if (u && u.classList.contains("va-msg-u")) q = (u.firstChild && u.firstChild.nodeType === 3 ? u.firstChild.textContent : u.textContent).trim();
      inline("c-builder", q); return;
    }
    /* Footer: Admin opens the full simulation (client and SavoScout sides) */
    if (t.closest("[data-admin]")) { e.preventDefault(); e.stopImmediatePropagation(); open("admin", "s-chat"); }
  }, true);
})();
/* <<< scout platform */
}
