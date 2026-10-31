// Scout Platform overlay: client side from the Assistant, scout side from Community.
export default function init() {
/* >>> scout platform */
(function () {
  /* The Scout Platform opens full screen over the site.
     Client side: from the Assistant (signed in), Investigations or Investigate this gap.
     Admin (footer): the full simulation, including the SavoScout WhatsApp chat. */
  if (window.vsPlatform) return;
  var BASE = "/";
  var css = document.createElement("style");
  css.textContent = ".vsp{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#F3F7F8;overflow:hidden}" +
    ".vsp::backdrop{background:rgba(20,28,40,.5)}.vsp iframe{display:block;width:100%;height:100%;border:0}" +
    ".vsp[open]{animation:vspIn .28s cubic-bezier(.2,.7,.2,1)}@keyframes vspIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion:reduce){.vsp[open]{animation:none}}";
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
  window.addEventListener("message", function (e) {
    if (e.data && e.data.vs === "close-platform" && dlg && dlg.open) dlg.close();
  });
  document.addEventListener("click", function (e) {
    var t = e.target, b;
    /* Assistant: Investigations and Investigate this gap open the client side */
    if (t.closest("#va-scouts")) { e.preventDefault(); e.stopImmediatePropagation(); open("client", "c-overview"); return; }
    if ((b = t.closest(".va-gapbtn"))) {
      e.preventDefault(); e.stopImmediatePropagation();
      var li = b.closest(".va-msg-a"), u = li && li.previousElementSibling, q = "";
      if (u && u.classList.contains("va-msg-u")) q = (u.firstChild && u.firstChild.nodeType === 3 ? u.firstChild.textContent : u.textContent).trim();
      open("client", "c-builder", q); return;
    }
    /* Footer: Admin opens the full simulation (client and SavoScout sides) */
    if (t.closest("[data-admin]")) { e.preventDefault(); e.stopImmediatePropagation(); open("admin", "s-chat"); }
  }, true);
})();
/* <<< scout platform */
}
