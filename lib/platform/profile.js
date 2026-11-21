/* Profile panel (generated from scratchpad/profile/body.js) */
export default function init() {
  /* Profile panel: opens from the "You" area at the foot of the sidebar.
     Account details, settings, links across the platform, plan, help and sign in or out.
     Front end only: changes are kept in this browser. */
  var side = document.getElementById("va-side"); if (!side || document.getElementById("vp-panel")) return;
  var user = side.querySelector(".va-user"); if (!user) return;
  var STATIC = /\.html$/.test(location.pathname) || location.protocol === "file:" || location.protocol === "about:";
  var L = STATIC ? { home: "index.html", community: "index.html#community", portal: "index.html#portal", pricing: "index.html#pricing", docs: "docs.html", contact: "index.html#contact" }
                 : { home: "/", community: "/community", portal: "/portal", pricing: "/pricing", docs: "/docs.html", contact: "/contact" };
  var KEY = "verisavo-profile";
  var load = function (k, d) { try { var v = JSON.parse(sessionStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  var prefs = function () { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } };
  var savePrefs = function (p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var initials = function (n) { return (n || "You").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join("") || "Y"; };
  var I = {
    user: '<circle cx="10" cy="7" r="3.2"/><path d="M3.8 16.5c.9-3 3.3-4.5 6.2-4.5s5.3 1.5 6.2 4.5"/>',
    chat: '<path d="M4 4.5h12v8.5H8.5L5 16v-3H4z"/>',
    inv: '<rect x="4" y="3" width="12" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/>',
    task: '<rect x="3.5" y="3.5" width="13" height="13" rx="2"/><path d="M10 7v6M7 10h6"/>',
    db: '<ellipse cx="10" cy="5.5" rx="6" ry="2.5"/><path d="M4 5.5v9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-9M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5"/>',
    grid: '<rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="11" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="3.5" y="11" width="5.5" height="5.5" rx="1"/><rect x="11" y="11" width="5.5" height="5.5" rx="1"/>',
    people: '<circle cx="7.5" cy="7.5" r="2.5"/><circle cx="13.5" cy="8.5" r="2"/><path d="M3 16c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4M12 12.3c2.2-.2 4 1 4.6 3.7"/>',
    brief: '<rect x="3" y="6" width="14" height="10" rx="2"/><path d="M7.5 6V4.5h5V6M3 10.5h14"/>',
    book: '<path d="M4 4.5h5a2 2 0 0 1 2 2v9a1.5 1.5 0 0 0-1.5-1.5H4zM16 4.5h-5a2 2 0 0 0-2 2v9a1.5 1.5 0 0 1 1.5-1.5H16z"/>',
    globe: '<circle cx="10" cy="10" r="6.5"/><path d="M3.5 10h13M10 3.5c2 2 2.8 4.2 2.8 6.5S12 14.5 10 16.5C8 14.5 7.2 12.3 7.2 10S8 5.5 10 3.5z"/>',
    card: '<rect x="2.5" y="5" width="15" height="10.5" rx="2"/><path d="M2.5 8.5h15M5.5 12.5h3"/>',
    help: '<circle cx="10" cy="10" r="6.5"/><path d="M8.2 8a1.9 1.9 0 0 1 3.6.6c0 1.3-1.8 1.6-1.8 2.9M10 13.6v.1"/>',
    out: '<path d="M8 4H5a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 5 16h3M12 13.5l3.5-3.5L12 6.5M15.5 10H8"/>',
    x: '<path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/>',
    go: '<path d="M8 5.5l4.5 4.5L8 14.5"/>'
  };
  var svg = function (k) { return '<svg viewBox="0 0 20 20" aria-hidden="true">' + I[k] + "</svg>"; };

  var css = document.createElement("style"); css.id = "vp-css";
  css.textContent = [
    "#va .va-user{cursor:pointer;border-radius:12px;transition:background .15s}",
    "#va .va-user:hover{background:#F0F3F7}",
    "#va .va-user:focus-visible{outline:2px solid #4D74C3;outline-offset:2px}",
    "#vp-panel{position:fixed;z-index:2147483000;left:12px;bottom:76px;width:328px;max-height:min(680px,calc(100vh - 96px));overflow:auto;background:#fff;color:#1F273F;border:1px solid #E1E6EE;border-radius:20px;box-shadow:0 24px 60px -20px rgba(15,20,40,.35),0 4px 12px rgba(15,20,40,.08);font:400 14px/1.4 'Red Hat Text',system-ui,sans-serif;opacity:0;transform:translateY(8px) scale(.98);transform-origin:20% 100%;transition:opacity .16s ease,transform .22s cubic-bezier(.2,1,.3,1);pointer-events:none}",
    "#vp-panel.on{opacity:1;transform:none;pointer-events:auto}",
    "#vp-panel *{box-sizing:border-box}",
    "#vp-panel svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}",
    "#vp-panel .vp-head{display:flex;gap:12px;align-items:center;padding:18px 18px 14px}",
    "#vp-panel .vp-av{width:44px;height:44px;border-radius:50%;flex:none;display:grid;place-items:center;background:#1F273F;color:#fff;font:600 15px/1 'Red Hat Display',sans-serif}",
    "#vp-panel .vp-id{min-width:0;flex:1}",
    "#vp-panel .vp-id b{display:block;font:600 15px/1.25 'Red Hat Display',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#vp-panel .vp-id span{display:block;font-size:12.5px;color:#6D7588;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#vp-panel .vp-x{border:0;background:none;color:#6D7588;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;cursor:pointer}#vp-panel .vp-x:hover{background:#F0F3F7}",
    "#vp-panel .vp-plan{margin:0 18px 6px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px 10px 14px;border-radius:14px;background:#F0F3F7}",
    "#vp-panel .vp-plan b{font-weight:600;font-size:13px}#vp-panel .vp-plan span{display:block;font-size:12px;color:#6D7588}",
    "#vp-panel .vp-pill{border:1px solid #1F273F;background:#fff;color:#1F273F;border-radius:999px;padding:6px 12px;font:600 12.5px/1 'Red Hat Text',sans-serif;cursor:pointer;white-space:nowrap;text-decoration:none}",
    "#vp-panel .vp-pill.dark{background:#1F273F;color:#fff}",
    "#vp-panel .vp-sec{padding:10px 10px 4px;border-top:1px solid #EEF1F5;margin-top:8px}",
    "#vp-panel .vp-h{margin:4px 8px 6px;font:600 12px/1 'Red Hat Text',sans-serif;color:#6D7588}",
    "#vp-panel .vp-i{display:flex;align-items:center;gap:12px;width:100%;padding:9px 8px;border:0;background:none;border-radius:10px;color:#1F273F;font:500 14px/1.2 'Red Hat Text',sans-serif;text-align:left;cursor:pointer;text-decoration:none}",
    "#vp-panel .vp-i:hover,#vp-panel .vp-i:focus-visible{background:#F0F3F7;outline:none}",
    "#vp-panel .vp-i small{margin-left:auto;font-size:12px;color:#6D7588;font-weight:400}",
    "#vp-panel .vp-i .vp-go{margin-left:auto;width:14px;height:14px;color:#9AA3B5}",
    "#vp-panel .vp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px}",
    "#vp-panel .vp-row label{font:500 14px/1.2 'Red Hat Text',sans-serif}#vp-panel .vp-row label small{display:block;font-weight:400;font-size:12px;color:#6D7588;margin-top:2px}",
    "#vp-panel .vp-seg{display:flex;padding:3px;border-radius:999px;background:#F0F3F7;gap:2px}",
    "#vp-panel .vp-seg button{border:0;background:none;border-radius:999px;padding:5px 12px;font:500 12.5px/1 'Red Hat Text',sans-serif;color:#4A5468;cursor:pointer}",
    "#vp-panel .vp-seg button[aria-pressed=true]{background:#fff;color:#1F273F;box-shadow:0 1px 3px rgba(31,39,63,.14)}",
    "#vp-panel .vp-sw{position:relative;width:38px;height:22px;flex:none;border-radius:999px;background:#C9D2DE;border:0;cursor:pointer;transition:background .15s}",
    "#vp-panel .vp-sw::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .18s}",
    "#vp-panel .vp-sw[aria-checked=true]{background:#1F273F}#vp-panel .vp-sw[aria-checked=true]::after{transform:translateX(16px)}",
    "#vp-panel .vp-edit{padding:0 18px 12px;display:grid;gap:8px}",
    "#vp-panel .vp-edit input{width:100%;border:1px solid #C5CEDB;border-radius:10px;padding:9px 11px;font:400 14px 'Red Hat Text',sans-serif;color:#1F273F}",
    "#vp-panel .vp-edit div{display:flex;gap:8px;justify-content:flex-end}",
    "#vp-panel .vp-foot{display:flex;flex-wrap:wrap;gap:4px 14px;padding:10px 18px 16px;border-top:1px solid #EEF1F5;margin-top:8px}",
    "#vp-panel .vp-foot button,#vp-panel .vp-foot a{border:0;background:none;padding:0;font:400 12px 'Red Hat Text',sans-serif;color:#6D7588;cursor:pointer;text-decoration:none}",
    "#vp-panel .vp-foot button:hover,#vp-panel .vp-foot a:hover{color:#1F273F;text-decoration:underline}",
    "#vp-panel .vp-note{margin:0 18px;font-size:11.5px;color:#8A93A5}",
    "#vp-scrim{position:fixed;inset:0;z-index:2147482999;background:rgba(15,20,40,.28);opacity:0;transition:opacity .18s;pointer-events:none}",
    "@media (max-width:760px){#vp-panel{left:0;right:0;bottom:0;width:auto;max-height:86vh;border-radius:22px 22px 0 0;transform:translateY(24px);transform-origin:50% 100%}#vp-scrim.on{opacity:1;pointer-events:auto}}",
    "@media (prefers-reduced-motion:reduce){#vp-panel{transition:none}}"
  ].join("\n");
  document.head.appendChild(css);

  var panel = document.createElement("div"); panel.id = "vp-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Your profile"); panel.hidden = true;
  var scrim = document.createElement("div"); scrim.id = "vp-scrim";
  var host = user.closest("dialog") || document.body; /* inside the assistant dialog when it is one, so it shows above it */
  host.appendChild(scrim); host.appendChild(panel);
  user.setAttribute("role", "button"); user.setAttribute("tabindex", "0"); user.setAttribute("aria-haspopup", "dialog"); user.setAttribute("aria-expanded", "false"); user.setAttribute("aria-label", "Open your profile and settings");

  var editing = false;
  var navBtn = function (label) { return [].slice.call(side.querySelectorAll("button, a")).filter(function (b) { return b.textContent.trim() === label; })[0]; };
  var theme = function () { return document.documentElement.getAttribute("data-vs-theme") === "dark" ? "dark" : "light"; };
  var setTheme = function (t) {
    if (t === theme()) return;
    /* set the theme directly (clicking the header toggle would count as a click outside and close this panel) */
    if (t === "dark") document.documentElement.setAttribute("data-vs-theme", "dark"); else document.documentElement.removeAttribute("data-vs-theme");
    try { localStorage.setItem("verisavo-theme", t); } catch (e) {}
    [].forEach.call(document.querySelectorAll("[data-theme-toggle]"), function (x) { var on = t === "dark", l = on ? "Switch to light mode" : "Switch to dark mode"; x.setAttribute("aria-pressed", String(on)); x.setAttribute("aria-label", l); x.title = l; });
  };
  var scope = function () { var s = document.getElementById("va-scope-label"); return s ? s.textContent.trim() : "All markets"; };

  function render() {
    var u = load("verisavo-user", null), p = prefs(), name = (u && (u.name || (u.email || "").split("@")[0])) || "You", mail = u && u.email ? u.email : (u ? "Demo account" : "Not signed in");
    var link = function (href, ic, label, sub) { return '<a class="vp-i" href="' + href + '">' + svg(ic) + "<span>" + label + "</span>" + (sub ? "<small>" + sub + "</small>" : svg("go").replace("<svg", '<svg class="vp-go"')) + "</a>"; };
    var nav = function (lab, ic, label) { return navBtn(lab) ? '<button type="button" class="vp-i" data-vp-nav="' + esc(lab) + '">' + svg(ic) + "<span>" + label + "</span></button>" : ""; };
    panel.innerHTML =
      '<div class="vp-head"><span class="vp-av">' + esc(initials(name)) + '</span><span class="vp-id"><b>' + esc(name) + "</b><span>" + esc(mail) + '</span></span><button type="button" class="vp-x" data-vp="close" aria-label="Close profile">' + svg("x") + "</button></div>" +
      (editing ? '<form class="vp-edit" data-vp-form><input name="n" value="' + esc(u && u.name ? u.name : "") + '" placeholder="Your name" aria-label="Your name" maxlength="60"><input name="e" type="email" value="' + esc(u && u.email ? u.email : "") + '" placeholder="Work email" aria-label="Work email" maxlength="120"><div><button type="button" class="vp-pill" data-vp="cancel">Cancel</button><button type="submit" class="vp-pill dark">Save</button></div></form>' : "") +
      '<div class="vp-plan"><span><b>Verisavo plan</b><span>Early access</span></span><a class="vp-pill" href="' + L.pricing + '">Manage plan</a></div>' +
      '<div class="vp-sec"><p class="vp-h">Account</p>' +
        (editing ? "" : '<button type="button" class="vp-i" data-vp="edit">' + svg("user") + "<span>Edit profile</span></button>") +
        nav("Knowledge Base", "db", "Company knowledge") +
      "</div>" +
      '<div class="vp-sec"><p class="vp-h">Help</p>' + link(L.contact, "help", "Contact us") + "</div>" +
      '<div class="vp-sec">' + (u ? '<button type="button" class="vp-i" data-vp="out">' + svg("out") + "<span>Sign out</span></button>" : '<a class="vp-i" href="' + (STATIC ? "assistant.html" : "/platform") + '">' + svg("out") + "<span>Sign in</span></a>") + "</div>" +
      '<div class="vp-foot">' + (document.querySelector('[data-legal="privacy"]') ? '<button type="button" data-vp-legal="privacy">Privacy Policy</button><button type="button" data-vp-legal="terms">Terms of Service</button>' : "") + '<span class="vp-note">Preview: settings are kept in this browser.</span></div>';
  }
  /* sit just above the "You" area, wherever the sidebar is (full page or the assistant window) */
  function place() {
    if (innerWidth <= 760) { panel.style.left = panel.style.bottom = panel.style.top = ""; return; }
    var r = user.getBoundingClientRect(), w = Math.min(328, innerWidth - 24);
    var host = panel.offsetParent && panel.offsetParent !== document.body ? panel.offsetParent.getBoundingClientRect() : { left: 0, top: 0, bottom: innerHeight };
    var cs = getComputedStyle(panel), fixedInHost = panel.offsetParent && panel.offsetParent !== document.body && cs.position === "fixed" && host.left !== 0;
    var ox = fixedInHost ? host.left : 0, oy = fixedInHost ? host.top : 0, hb = fixedInHost ? host.bottom - host.top : innerHeight;
    panel.style.left = Math.max(12, Math.min(r.left - 4, innerWidth - w - 12)) - ox + "px";
    panel.style.bottom = Math.max(12, hb - (r.top - oy) + 8) + "px";
    panel.style.maxHeight = Math.max(240, r.top - 20) + "px";
  }
  addEventListener("resize", function () { if (isOpen()) place(); });
  function open() { render(); panel.hidden = false; place(); requestAnimationFrame(function () { panel.classList.add("on"); scrim.classList.add("on"); }); user.setAttribute("aria-expanded", "true"); setTimeout(function () { var f = panel.querySelector(".vp-x"); if (f) f.focus(); }, 40); }
  function close(back) { panel.classList.remove("on"); scrim.classList.remove("on"); user.setAttribute("aria-expanded", "false"); setTimeout(function () { if (!panel.classList.contains("on")) panel.hidden = true; }, 230); editing = false; if (back) user.focus(); }
  var isOpen = function () { return panel.classList.contains("on"); };

  /* the whole "You" area, including the gear, opens the profile */
  user.addEventListener("click", function (e) { if (e.target.closest(".va-pop")) return; e.preventDefault(); e.stopPropagation(); var gm = document.getElementById("va-gear-menu"); if (gm) gm.hidden = true; isOpen() ? close() : open(); }, true);
  user.addEventListener("keydown", function (e) { if (e.target === user && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); isOpen() ? close() : open(); } });
  scrim.addEventListener("click", function () { close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) { e.stopPropagation(); close(true); } }, true);
  document.addEventListener("click", function (e) { if (isOpen() && !panel.contains(e.target) && !user.contains(e.target)) close(); }, true);

  panel.addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, u = load("verisavo-user", {}) || {};
    u.name = f.n.value.trim() || "You"; if (f.e.value.trim()) u.email = f.e.value.trim();
    try { sessionStorage.setItem("verisavo-user", JSON.stringify(u)); } catch (x) {}
    var nm = document.getElementById("va-name"), av = document.getElementById("va-av");
    if (nm) nm.textContent = u.name; if (av) av.textContent = initials(u.name);
    editing = false; render();
  });
  panel.addEventListener("click", function (e) {
    var t = e.target.closest("button, a"); if (!t) return;
    var v = t.getAttribute("data-vp");
    if (v === "close") return close(true);
    if (v === "edit") { editing = true; render(); var i = panel.querySelector(".vp-edit input"); if (i) i.focus(); return; }
    if (v === "cancel") { editing = false; return render(); }
    if (v === "scope") { close(); var sb = document.getElementById("va-scope"); if (sb) setTimeout(function () { sb.click(); }, 60); return; }
    if (v === "out") { close(); var so = document.getElementById("va-signout"); if (so) so.click(); return; }
    if (t.hasAttribute("data-vp-theme")) { setTheme(t.getAttribute("data-vp-theme")); return render(); }
    if (t.hasAttribute("data-vp-sw")) { var p = prefs(), k = t.getAttribute("data-vp-sw"); p[k] = t.getAttribute("aria-checked") !== "true"; savePrefs(p); t.setAttribute("aria-checked", String(p[k])); return; }
    if (t.hasAttribute("data-vp-legal")) { close(); var lb = document.querySelector('[data-legal="' + t.getAttribute("data-vp-legal") + '"]'); if (lb) lb.click(); return; }
    if (t.hasAttribute("data-vp-nav")) { close(); var nb = navBtn(t.getAttribute("data-vp-nav")); if (nb) nb.click(); return; }
    if (t.tagName === "A") close();
  });

}
