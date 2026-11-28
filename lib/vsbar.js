/* Verisavo scroll bar: one visible, clickable bar (arrows, track, short thumb) for
   lists that scroll inside a menu or panel. Attaches itself to anything matching SEL,
   including lists drawn later. data-vsbar-rows="4" caps a list at that many rows. */
export default function init() {
  if (typeof window === 'undefined' || window.vsBar) return;
  var SEL = '[data-vsbar],.kb-swl,.tp-pop ul,#va .va-main .nlist,.va-pop,.place-menu,.results,.feed,.gapscroll';
  var css = document.createElement('style');
  css.textContent =
    '.vsb-on{scrollbar-width:none!important;overscroll-behavior:contain}.vsb-on::-webkit-scrollbar{display:none!important}' +
    '.vsb-on.vsb-over{padding-right:20px!important}' +
    '.vsb{position:absolute;width:12px;display:flex;flex-direction:column;align-items:center;gap:3px;user-select:none;-webkit-user-select:none;touch-action:none}' +
    '.vsb[hidden]{display:none!important}' +
    '.vsb button{flex:none;width:12px;height:10px;padding:0;margin:0;border:0;background:none;cursor:pointer;position:relative}' +
    '.vsb button::before{content:"";position:absolute;left:2px;top:2px;border-left:4px solid transparent;border-right:4px solid transparent}' +
    '.vsb .vsb-up::before{border-bottom:5px solid #8E8D92}.vsb .vsb-dn::before{border-top:5px solid #8E8D92}' +
    '.vsb .vsb-up:hover::before{border-bottom-color:#3A3A3C}.vsb .vsb-dn:hover::before{border-top-color:#3A3A3C}' +
    '.vsb-tr{position:relative;flex:1;width:10px;border-radius:5px;background:#EEF1F6;cursor:pointer}' +
    '.vsb-th{position:absolute;left:0;top:0;width:10px;border-radius:5px;background:#8E8D92;cursor:grab;transition:background .15s}' +
    '.vsb-th:hover,.vsb-th:active{background:#6D6C71}';
  document.head.appendChild(css);

  function rows(el) {
    var n = +el.getAttribute('data-vsbar-rows'); if (!n) return;
    var kids = [].filter.call(el.children, function (c) { return !c.classList.contains('vsb') && c.offsetHeight; });
    var set = function (v) { if (el.style.maxHeight !== v) el.style.maxHeight = v; };
    if (kids.length <= n) { set(''); return; }
    var st = getComputedStyle(el), gap = parseFloat(st.rowGap) || 0, h = parseFloat(st.paddingTop) + parseFloat(st.paddingBottom);
    for (var i = 0; i < n; i++) h += kids[i].offsetHeight + (i ? gap : 0);
    set(Math.round(h + kids[n].offsetHeight * 0.4) + 'px'); /* a peek of the next row shows there is more */
    if (el.style.overflowY !== 'auto') el.style.overflowY = 'auto';
  }

  function attach(el) {
    if (el._vsb || el.classList.contains('ttl-list')) return;
    var host = el.parentNode; if (!host || host.nodeType !== 1) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var bar = document.createElement('div'); bar.className = 'vsb'; bar.setAttribute('aria-hidden', 'true'); bar.hidden = true;
    bar.innerHTML = '<button type="button" class="vsb-up" tabindex="-1"></button><span class="vsb-tr"><i class="vsb-th"></i></span><button type="button" class="vsb-dn" tabindex="-1"></button>';
    host.appendChild(bar); el._vsb = bar; bar._el = el; el.classList.add('vsb-on');
    var tr = bar.querySelector('.vsb-tr'), th = bar.querySelector('.vsb-th'), busy = false;
    function sync() {
      busy = false;
      if (!el.isConnected) { bar.remove(); return; }
      rows(el);
      var shown = el.offsetParent !== null && el.clientHeight > 0 && getComputedStyle(el).visibility !== 'hidden';
      var over = shown && el.scrollHeight > el.clientHeight + 1;
      el.classList.toggle('vsb-over', over); if (bar.hidden !== !over) bar.hidden = !over; if (!over) return;
      var z = parseInt(getComputedStyle(el).zIndex, 10); bar.style.zIndex = isNaN(z) ? 2 : z + 1;
      bar.style.top = (el.offsetTop + el.clientTop + 4) + 'px';
      bar.style.left = (el.offsetLeft + el.clientLeft + el.clientWidth - 16) + 'px';
      bar.style.height = (el.clientHeight - 8) + 'px';
      var h = Math.min(56, Math.max(28, tr.clientHeight * el.clientHeight / el.scrollHeight * 0.45));
      th.style.height = h + 'px';
      th.style.transform = 'translateY(' + (tr.clientHeight - h) * el.scrollTop / (el.scrollHeight - el.clientHeight || 1) + 'px)';
    }
    function later() { if (!busy) { busy = true; requestAnimationFrame(sync); } }
    el._vsbSync = later;
    el.addEventListener('scroll', later, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(later).observe(el);
    new MutationObserver(later).observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    var step = function (d) { el.scrollBy({ top: d * 40, behavior: 'smooth' }); };
    var keep = function (e) { e.preventDefault(); e.stopPropagation(); };
    bar.addEventListener('mousedown', keep); bar.addEventListener('click', function (e) { e.stopPropagation(); });
    bar.querySelector('.vsb-up').addEventListener('click', function (e) { keep(e); step(-1); });
    bar.querySelector('.vsb-dn').addEventListener('click', function (e) { keep(e); step(1); });
    tr.addEventListener('click', function (e) { if (e.target === th) return; keep(e); var r = tr.getBoundingClientRect(); el.scrollTop = (e.clientY - r.top) / r.height * (el.scrollHeight - el.clientHeight); });
    th.addEventListener('pointerdown', function (e) {
      keep(e); var y0 = e.clientY, s0 = el.scrollTop, moved = false, k = (el.scrollHeight - el.clientHeight) / Math.max(1, tr.clientHeight - th.offsetHeight);
      th.setPointerCapture(e.pointerId);
      function mv(ev) { if (Math.abs(ev.clientY - y0) > 3) moved = true; if (moved) el.scrollTop = s0 + (ev.clientY - y0) * k; }
      function up(ev) { th.removeEventListener('pointermove', mv); th.removeEventListener('pointerup', up); if (!moved) { var r = th.getBoundingClientRect(); step(ev.clientY < r.top + r.height / 2 ? -3 : 3); } }
      th.addEventListener('pointermove', mv); th.addEventListener('pointerup', up);
    });
    later();
  }

  var queued = false;
  function scan() {
    queued = false;
    [].forEach.call(document.querySelectorAll(SEL), attach);
    [].forEach.call(document.querySelectorAll('.vsb'), function (b) { if (!b._el || !b._el.isConnected) b.remove(); else b._el._vsbSync(); });
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(scan); } }
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });
  window.addEventListener('resize', queue);
  document.addEventListener('toggle', queue, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  window.vsBar = { scan: scan };
}
