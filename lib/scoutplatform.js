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
  css.textContent = ".vsp{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#F3F7F8;overflow:hidden}" +
    ".vsp::backdrop{background:rgba(20,28,40,.5)}.vsp iframe{display:block;width:100%;height:100%;border:0}" +
    ".vsp[open]{animation:vspIn .28s cubic-bezier(.2,.7,.2,1)}@keyframes vspIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion:reduce){.vsp[open]{animation:none}}" +
    ".va-main.inv-on>.va-body,.va-main.inv-on>.va-dock{display:none!important}.va-main.inv-on .va-top>.va-pop-wrap{visibility:hidden}" +
    ".va-inv{position:relative;z-index:2;flex:1 1 auto;min-height:0;display:flex;border-top:1px solid #E3E9EC;background:#F3F7F8;animation:vaInvIn .22s ease-out}" +
    ".va-inv iframe{flex:1;width:100%;height:100%;border:0;display:block}@keyframes vaInvIn{from{opacity:0}to{opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.va-inv{animation:none}}";
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
  function inline(hash, gap) {
    var va = document.getElementById("va"), main = va && va.querySelector(".va-main");
    if (!main || !va.open) { open("client", hash, gap); return; }
    if (!panel) {
      panel = document.createElement("div"); panel.className = "va-inv";
      var f = document.createElement("iframe"); f.title = "Market investigations"; panel.appendChild(f);
      main.appendChild(panel);
    }
    panel.firstChild.src = BASE + "scout-platform.html?side=client&inline=1" + (gap ? "&gap=" + encodeURIComponent(gap) : "") + "#" + hash;
    main.classList.add("inv-on");
    var b = document.getElementById("va-scouts"); if (b) { b.classList.add("on"); b.setAttribute("aria-current", "page"); }
    var app = va.querySelector(".va-app"), scrim = document.getElementById("va-scrim");
    if (app && app.classList.contains("va-drawer") && scrim) scrim.click();
  }
  function closeInline() {
    if (!panel) return;
    var main = panel.parentNode; if (main) main.classList.remove("inv-on");
    panel.remove(); panel = null;
    var b = document.getElementById("va-scouts"); if (b) { b.classList.remove("on"); b.removeAttribute("aria-current"); }
  }
  var vaDlg = document.getElementById("va"); if (vaDlg) vaDlg.addEventListener("close", closeInline);
  window.addEventListener("message", function (e) {
    if (e.data && e.data.vs === "close-platform") { if (dlg && dlg.open) dlg.close(); closeInline(); }
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
