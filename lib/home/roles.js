// Careers: a page for each role (/careers/slug). Shared with the static site as roles.js.
export default function init() {
(function () {
  /* Careers: each role has its own page (#careers/slug, or /careers/slug in the Next app); the Careers page stays the list */
  if (window.__vsRoles) return; window.__vsRoles = true;
  var page = document.getElementById("pg-careers"); if (!page) return;
  var inn = page.querySelector(".pg-in"); if (!inn) return;
  var NEXT = !!window.__vsPortalPaths; /* the app uses real addresses (/careers/slug); the static site uses #careers/slug */
  var jobs = [].slice.call(page.querySelectorAll("details.ca-job"));
  var slug = function (t) { return t.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); };
  var info = jobs.map(function (d) {
    var s = d.querySelector("summary"), t = (s.querySelector(".ca-role b") || s).textContent.trim();
    var lead = (s.querySelector(".ca-role > span") || {}).textContent || "", meta = (d.querySelector(".ca-meta") || {}).textContent || "";
    var apply = d.querySelector(".ca-jd a.obtn"); return { d: d, slug: slug(t), title: t, lead: lead.trim(), meta: meta.split("·").map(function (x) { return x.trim(); }).filter(Boolean), apply: apply ? apply.getAttribute("href") : "" };
  });
  var css = document.createElement("style");
  css.textContent =
    "#pg-careers.cr-on .pg-in > :not(.cr):not(.pg-foot){display:none!important}#pg-careers:not(.cr-on) .cr{display:none!important}" +
    "#pg-careers .cr:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){max-width:760px;margin:0 auto;padding:8px 0 72px;color:#1F273F;text-align:left}" +
    "#pg-careers .cr-back:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){display:inline-flex;align-items:center;gap:8px;margin:0 0 32px;padding:0;border:0;background:none;font:500 .9375rem/1.2 'Red Hat Text',sans-serif;color:#1F273F;-webkit-text-fill-color:#1F273F;cursor:pointer}" +
    "#pg-careers .cr-k:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin:0 0 12px;font:600 .75rem/1 'Red Hat Text',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6A7385;-webkit-text-fill-color:#6A7385}" +
    "#pg-careers .cr h1:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin:0 0 14px;font:600 clamp(1.875rem,1.3rem + 2.2vw,2.625rem)/1.12 'Red Hat Display',sans-serif;letter-spacing:-.03em;color:#1F273F;-webkit-text-fill-color:#1F273F;text-wrap:balance}" +
    "#pg-careers .cr-lead:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin:0 0 20px;max-width:620px;font:400 1.0625rem/1.55 'Red Hat Text',sans-serif;color:#5B6478;-webkit-text-fill-color:#5B6478}" +
    "#pg-careers .cr-meta:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px;padding:0;list-style:none}" +
    "#pg-careers .cr-meta li:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){padding:6px 12px;border-radius:8px;background:#F1F3F6;font:500 .8125rem/1.2 'Red Hat Text',sans-serif;color:#3A3A3C;-webkit-text-fill-color:#3A3A3C}" +
    "#pg-careers .cr-acts:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){display:flex;gap:10px;margin:0 0 32px;padding:0 0 32px;border-bottom:1px solid #E6EAF0}" +
    "#pg-careers .cr-acts > *:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 20px;border-radius:12px;font:500 .9375rem/1 'Red Hat Text',sans-serif;text-decoration:none;cursor:pointer}" +
    "#pg-careers .cr-apply:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){background:#1F273F;color:#fff;-webkit-text-fill-color:#fff;border:0}" +
    "#pg-careers .cr-share:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){background:#fff;color:#1F273F;-webkit-text-fill-color:#1F273F;border:1px solid #DCE2EA}" +
    "#pg-careers .cr-note:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin:-20px 0 28px;font:400 .8125rem/1.4 'Red Hat Text',sans-serif;color:#3D7A5E;-webkit-text-fill-color:#3D7A5E}" +
    "#pg-careers .cr .ca-jd:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){display:block!important;padding:0!important;margin:0!important;background:none!important;border:0!important;box-shadow:none!important}" +
    "#pg-careers .cr .ca-jd > .ca-meta{display:none!important}" +
    "#pg-careers .cr .ca-jd h3:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin:32px 0 10px!important}#pg-careers .cr .ca-jd > h3:first-of-type:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-top:0!important}#pg-careers .cr .ca-jd ul:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin:0!important;display:grid;gap:8px}#pg-careers .cr .ca-jd > a.obtn:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-top:32px!important}" +
    "@media (max-width:560px){#pg-careers .cr:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){padding:4px 0 56px}#pg-careers .cr-back:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-bottom:28px}" +
    "#pg-careers .cr-k:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-bottom:10px}#pg-careers .cr h1:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-bottom:12px;font-size:1.875rem;line-height:1.15}" +
    "#pg-careers .cr-lead:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-bottom:18px;font-size:1rem;line-height:1.55}#pg-careers .cr-meta:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-bottom:24px}" +
    "#pg-careers .cr-acts:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){margin-bottom:28px;padding-bottom:28px}#pg-careers .cr-apply:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){flex:1}}";
  document.head.appendChild(css);
  var box = document.createElement("article"); box.className = "cr"; box.setAttribute("aria-live", "polite");
  inn.insertBefore(box, inn.firstChild);
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function current() {
    var m = NEXT ? location.pathname.match(/^\/careers\/([^/?#]+)/) : location.hash.match(/^#careers\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }
  var link = function (s) { return NEXT ? "/careers/" + s : "#careers/" + s; };
  var shown = null;
  function render() {
    var s = current(), r = null;
    for (var i = 0; i < info.length; i++) if (info[i].slug === s) r = info[i];
    if (!r) { if (page.classList.contains("cr-on")) page.classList.remove("cr-on"); if (shown) { box.innerHTML = ""; shown = null; try { document.title = "Careers at Verisavo"; } catch (e) {} } return; }
    if (shown !== r.slug) {
      var body = r.d.querySelector(".ca-jd").cloneNode(true);
      box.innerHTML = '<button type="button" class="cr-back" data-cr-back><span aria-hidden="true">←</span> All roles</button>' +
        '<p class="cr-k">Careers at Verisavo</p><h1 id="cr-h" tabindex="-1">' + esc(r.title).replace(/-/g, "\u2011") + '</h1><p class="cr-lead">' + esc(r.lead) + '</p>' +
        '<ul class="cr-meta" aria-label="Role details">' + r.meta.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + '</ul>' +
        '<div class="cr-acts">' + (r.apply ? '<a class="cr-apply" href="' + esc(r.apply) + '">Apply for this role</a>' : '') + '<button type="button" class="cr-share" data-cr-share>Share role</button></div><p class="cr-note" data-cr-note hidden></p>';
      box.appendChild(body); shown = r.slug;
      try { document.title = r.title + " | Careers at Verisavo"; } catch (e) {}
    }
    if (!page.classList.contains("cr-on")) { page.classList.add("cr-on"); page.scrollTop = 0; }
  }
  function go(s) {
    if (NEXT) { try { history.pushState({ pg: "careers" }, "", s ? link(s) : "/careers"); } catch (e) {} render(); }
    else location.hash = s ? "careers/" + s : "careers";
  }
  /* opening a role from the list goes to its page */
  page.addEventListener("click", function (e) {
    var sum = e.target.closest && e.target.closest("details.ca-job > summary");
    if (sum) { e.preventDefault(); var d = sum.parentNode; for (var i = 0; i < info.length; i++) if (info[i].d === d) go(info[i].slug); return; }
    if (e.target.closest("[data-cr-back]")) { e.preventDefault(); go(""); setTimeout(function () { page.scrollTop = 0; }, 0); return; }
    if (e.target.closest("[data-cr-share]")) {
      var url = location.origin && location.origin !== "null" ? location.href : location.href, t = (box.querySelector("h1") || {}).textContent || "Careers at Verisavo";
      var note = box.querySelector("[data-cr-note]");
      var said = function (m) { if (note) { note.textContent = m; note.hidden = false; setTimeout(function () { note.hidden = true; }, 3000); } };
      if (navigator.share) { navigator.share({ title: t + " | Verisavo", url: url }).catch(function () {}); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { said("Link copied. Paste it anywhere to share this role."); }, function () { said("Copy this page's address to share the role."); });
      else said("Copy this page's address to share the role.");
    }
  });
  addEventListener("hashchange", render); addEventListener("popstate", function () { setTimeout(render, 0); });
  new MutationObserver(function () { if (page.classList.contains("open")) render(); }).observe(page, { attributes: true, attributeFilter: ["class"] });
  render();
})();
}
