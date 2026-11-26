// The Verisavo Assistant prototype, mounted inside the Assistant window
export default function init() {
/* >>> assistant prototype v1 */

(function () {
  'use strict';
  var VA = document.getElementById('va'), MAIN = VA && VA.querySelector('.va-main'), BODY = MAIN && MAIN.querySelector('.va-body'), DOCK = MAIN && MAIN.querySelector('.va-dock'), TOP = MAIN && MAIN.querySelector('.va-top');
  if (!MAIN || !BODY || !DOCK || !TOP || document.getElementById('convo')) return;
  (function mount() {
    var body = document.createElement('div'); body.className = 'vapx'; body.innerHTML = '<div class="col"><section class="thread" id="convo" aria-label="Conversation" aria-live="polite"></section></div>'; BODY.appendChild(body);
    var dock = document.createElement('div'); dock.className = 'vapx vapx-dock'; dock.innerHTML = '<div class="col"><div class="dock"><form class="compose" id="composer" autocomplete="off"><label for="ask" class="sr">Message Verisavo</label><textarea id="ask" rows="1" placeholder="Ask about a market, product or competitor…"></textarea><div class="cbar"><div class="wrapr" id="plus"></div><span id="modeChip"></span><span class="spacer"></span><button type="submit" class="send" aria-label="Send"><svg class="ic s" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div></form><p class="hint">Answers show what they rest on and what is still unknown. The decision stays with you.</p></div></div>'; DOCK.appendChild(dock);
    var top = document.createElement('div'); top.className = 'vapx-top'; top.id = 'topbar'; top.innerHTML = '<div class="title"><button type="button" class="ttl" data-act="recentMenu" aria-haspopup="menu" aria-expanded="false" title="Recent questions"><b></b><svg class="ttl-c" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5L6 7.5 9 4.5"/></svg></button><div class="pop ttl-pop" role="menu" aria-label="Recent questions" hidden></div></div>';
    if (!document.getElementById('ttl-css')) { var tcs = document.createElement('style'); tcs.id = 'ttl-css'; tcs.textContent = '#va .va-main .scopewrap{position:relative;display:inline-flex}#va .va-main button.scopetag{border:0;cursor:pointer;border-radius:6px;padding:2px 4px;margin-left:-4px}#va .va-main button.scopetag:hover,#va .va-main button.scopetag[aria-expanded=true]{color:#3A3A3C;background:rgba(0,0,0,.04)}#va .va-main .scopepop{position:absolute;left:-4px;bottom:calc(100% + 8px);top:auto;right:auto;width:300px;z-index:50}#va .va-main .scopepop{width:240px!important;padding:6px!important}#va .va-main .scopepop .psub-h{padding:2px 4px 6px!important}#va .va-main .scopepop .psub-q{height:32px!important;margin-bottom:4px!important}#va .va-main .scopepop .kbbox .mitem,#va .va-main .scopepop .kbopt{min-height:28px!important;height:28px!important;padding-top:0!important;padding-bottom:0!important;font-size:13.5px!important;line-height:28px!important}#va .va-main .psub.scopepop .psub-box .ttl-list{gap:0!important;max-height:calc(5 * 28px)!important}#va .va-main .scopepop .psub-f{margin-top:4px!important;padding:6px 4px 0!important}#va .va-main .scopepop .shint{margin:6px 4px 2px!important}#va .va-main .psub-done.sel{height:28px;padding:0 14px;border:1px solid #DCE2EA;background:#fff;color:#1F273F;font-weight:500}#va .va-main .psub-done.sel:hover:not([disabled]){border-color:#A8B3C4;background:#F7F9FC}#va .va-main .scopepop.below{bottom:auto;top:calc(100% + 8px)}#va .va-main .scopepop .srow{display:flex;align-items:center;gap:4px}#va .va-main .scopepop .srow[hidden]{display:none}#va .va-main .scopepop .srow .kbopt{flex:1;min-width:0}#va .va-main .scopepop .kbopt[disabled]{opacity:1;cursor:default}#va .va-main .scopepop .scur{margin-left:auto;font-style:normal;font-size:11.5px;color:#8E8D92}#va .va-main .scopepop .scmp{flex:none;height:28px;padding:0 10px;border:1px solid #DCE2EA;border-radius:14px;background:#fff;font:500 12px/1 inherit;color:#3A3A3C;cursor:pointer;opacity:0;transition:opacity .15s}#va .va-main .scopepop .srow:hover .scmp,#va .va-main .scopepop .scmp:focus-visible{opacity:1}@media (hover:none){#va .va-main .scopepop .scmp{opacity:1}}#va .va-main .scopepop .scmp:hover{border-color:#A8B3C4}#va .va-main .scopepop .shint{margin:8px 6px 2px;font-size:12px;line-height:1.45;color:#8E8D92}#va .va-main .scopetag{display:inline-flex;align-items:center;gap:5px;padding:0;margin-right:6px;background:none;color:#6D6C71;font-size:13.5px;line-height:1.3;cursor:default;white-space:nowrap}#va .va-main .scopetag svg{width:16px;height:16px}#va .va-main .scopetag em{font-style:normal;color:#77767A}#va .va-main .pmenu .pcount{margin-left:auto;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E3EBF8;color:#3B5D8A;font:600 11px/18px inherit;font-style:normal;text-align:center}#va .va-main .psub{width:300px;padding:6px}#va .va-main .psub-h{display:flex;align-items:center;gap:6px;padding:4px 4px 8px}#va .va-main .psub-h b{font-size:13.5px;font-weight:600}#va .va-main .psub-back{width:28px;height:28px;display:grid;place-items:center;border:0;border-radius:7px;background:none;cursor:pointer;color:#6D6C71}#va .va-main .psub-back:hover{background:rgba(0,0,0,.05)}#va .va-main .psub-back svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#va .va-main .psub-q{display:block;width:100%;box-sizing:border-box;height:36px;margin:0 0 6px;padding:0 12px;border:1px solid #DCE2EA;border-radius:9px;background:#fff;font:inherit;font-size:13.5px;outline:none}#va .va-main .psub-q:focus{border-color:#A8B3C4;box-shadow:0 0 0 3px #E3EBF8}#va .va-main .psub .psub-box .ttl-list{max-height:calc(5 * 40px + 4 * 2px)!important}#va .va-main .psub .kbopt[hidden]{display:none!important}#va .va-main .psub .kbopt.pa{padding-left:24px}#va .va-main .psub .kbopt em{font-style:normal;color:#8E8D92;font-size:12px;margin-left:4px}#va .va-main .psub-none{margin:10px;font-size:13px;color:#8E8D92}#va .va-main .psub-f{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px;padding:8px 6px 2px;border-top:1px solid rgba(0,0,0,.06);font-size:12.5px;color:#6D6C71}#va .va-main .psub-done[disabled]{opacity:.35;cursor:default}#va .va-main .psub-done{height:30px;padding:0 14px;border:0;border-radius:8px;background:#1F273F;color:#fff;font:500 13px/1 inherit;cursor:pointer}#va .va-main .kbbox .ttl-list{max-height:calc(3 * 40px + 2 * 2px)!important}#va .va-main .kbbox .mitem{min-height:40px}#va .va-main .kbbox{margin:0 0 2px}#va .va-main .furow,#va .va-main .vapx .furow{height:40px!important;min-height:40px!important;font-size:14px}#va .va-main .fulist.scroll{max-height:120px!important}#va .va-main .vapx p.fu-h{padding-bottom:6px!important}#va .va-h-recent,#va #va-recent,#va #va-recent-empty{display:none!important}#va .va-main .vapx-top .title{position:relative;flex:none}#va .va-main .vapx-top .ttl b{max-width:none!important;overflow:visible!important;text-overflow:clip!important}@media (max-width:40rem){#va .va-main .va-top .title .ttl b{visibility:visible!important;font-size:13px!important}#va .va-main .vapx-top .ttl{margin-left:0;padding:6px 4px;gap:4px}#va .va-main .vapx-top .title{margin-right:8px}}#va .va-main .vapx-top .ttl{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%;padding:6px 8px;margin-left:-8px;border:0;border-radius:8px;background:none;cursor:pointer;color:inherit;font:inherit}#va .va-main .vapx-top .ttl:hover,#va .va-main .vapx-top .ttl[aria-expanded=true]{background:rgba(0,0,0,.05)}#va .va-main .vapx-top .ttl-c{flex:none;width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:.6;transition:transform .2s}#va .va-main .vapx-top .ttl[aria-expanded=true] .ttl-c{transform:rotate(180deg)}#va .va-main .ttl-pop{left:-8px;right:auto;top:40px;width:min(340px,calc(100vw - 32px));padding:6px}#va .va-main .ttl-box{position:relative}#va .va-main .ttl-box.has-sb{padding-right:18px}#va .va-main .ttl-list{max-height:calc(6 * 38px + 5 * 2px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;display:grid;gap:2px}#va .va-main .ttl-list::-webkit-scrollbar{display:none}#va .va-main .ttl-sb{position:absolute;top:2px;bottom:2px;right:2px;width:12px;display:flex;flex-direction:column;align-items:center;gap:3px}#va .va-main .ttl-sb[hidden]{display:none}#va .va-main .ttl-sb button{flex:none;width:12px;height:10px;padding:0;border:0;background:none;cursor:pointer;position:relative}#va .va-main .ttl-sb button::before{content:"";position:absolute;left:2px;top:2px;border-left:4px solid transparent;border-right:4px solid transparent}#va .va-main .ttl-up::before{border-bottom:5px solid #8E8D92}#va .va-main .ttl-dn::before{border-top:5px solid #8E8D92}#va .va-main .ttl-up:hover::before{border-bottom-color:#3A3A3C}#va .va-main .ttl-dn:hover::before{border-top-color:#3A3A3C}#va .va-main .ttl-tr{position:relative;flex:1;width:10px;border-radius:5px;cursor:pointer;background:#F1F1F3}#va .va-main .ttl-sb,#va .va-main .ttl-drag .ttl-list{user-select:none;-webkit-user-select:none}#va .va-main .ttl-sb{touch-action:none}#va .va-main .ttl-th{position:absolute;left:0;top:0;width:10px;border-radius:5px;background:#8E8D92;cursor:grab;transition:background .15s}#va .va-main .ttl-th:hover,#va .va-main .ttl-th:active{background:#6D6C71}#va .va-main .ttl-list .mitem{min-height:38px}#va .va-main .ttl-pop[hidden]{display:none}#va .va-main .ttl-pop .ttl-h{margin:4px 10px 6px;font-size:12px;font-weight:500;color:var(--px-soft,#77767A)}#va .va-main .ttl-pop .mitem span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#va .va-main .ttl-pop .mitem[aria-current=true]{background:rgba(0,0,0,.05);font-weight:500}#va .va-main .ttl-row{position:relative;display:flex;align-items:center}#va .va-main .ttl-row .mitem{flex:1;min-width:0;padding-right:62px}#va .va-main .ttl-row .mitem .vi{flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}#va .va-main .ttl-row.pinned .mitem>.vi{color:#3B5D8A;fill:#DCE6F2}#va .va-main .ttl-acts{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;gap:2px;opacity:0;transition:opacity .15s}#va .va-main .ttl-row:hover .ttl-acts,#va .va-main .ttl-row:focus-within .ttl-acts{opacity:1}@media (hover:none){#va .va-main .ttl-acts{opacity:1}}#va .va-main .ttl-a{width:26px;height:26px;padding:0;border:0;border-radius:6px;background:none;display:grid;place-items:center;color:#8E8D92;cursor:pointer}#va .va-main .ttl-a:hover,#va .va-main .ttl-a:focus-visible{background:rgba(0,0,0,.06);color:#3A3A3C}#va .va-main .ttl-a .vi{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}#va .va-main .ttl-a.on{color:#3B5D8A}#va .va-main .ttl-a.on .vi{fill:#DCE6F2}#va .va-main .ttl-g{margin:8px 10px 4px;font-size:11.5px;font-weight:500;color:#8E8D92}#va .va-main .ttl-g:first-child{margin-top:2px}#va .va-main .ttl-row.ed{gap:8px;padding:3px 6px 3px 10px;min-height:38px}#va .va-main .ttl-row.ed .vi,#va .va-main .ttl-row.ed svg{flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5}#va .va-main .ttl-in{flex:1;min-width:0;height:32px;padding:0 10px;border:1px solid #A8B3C4;border-radius:7px;background:#fff;font:inherit;font-size:13.5px;color:#3A3A3C;outline:none;box-shadow:0 0 0 3px #E3EBF8}#va .va-main .popx{flex:none;width:28px;height:28px;padding:0;margin:0 0 0 auto;border:0;border-radius:7px;background:none;display:grid;place-items:center;color:#8E8D92;cursor:pointer}#va .va-main .popx:hover,#va .va-main .popx:focus-visible{background:rgba(0,0,0,.05);color:#3A3A3C}#va .va-main .popx svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}#va .va-main .pmenu:not(.psub)>.popx{position:absolute;top:8px;right:8px;z-index:1}#va .va-main .pmenu:not(.psub)>.popx+.mitem{margin-right:34px;width:auto}#va .va-main .popx-h{display:flex;align-items:center;gap:8px;padding:0 0 0 0}#va .va-main .popx-h .ttl-g{margin:2px 10px 2px!important}#va .va-main .scopepop .psub-h{padding-right:0!important}#va .va-main .nhead-r{display:flex;align-items:center;gap:6px}#va .va-main .nhead .popx{margin-right:-6px}#va .va-main .ttl-pop .ttl-e{margin:8px 10px;font-size:13px;color:var(--px-soft,#77767A)}'; document.head.appendChild(tcs); }
    var right = document.createElement('div'); right.id = 'topRight';
    var r = TOP.querySelector('.va-top-r'); var scope = TOP.querySelector('.va-pop-wrap'); if (scope) TOP.insertBefore(top, scope.nextSibling); else TOP.appendChild(top);
    if (r) TOP.insertBefore(right, r); else TOP.appendChild(right);
    ['sheet', 'modal', 'toast'].forEach(function (id) { var d = document.createElement('div'); d.id = id; if (id === 'toast') { d.setAttribute('role', 'status'); d.setAttribute('aria-live', 'polite'); } MAIN.appendChild(d); });
    var side = document.createElement('nav'); side.id = 'side'; side.hidden = true; MAIN.appendChild(side);
    MAIN.classList.add('vapx-on');
  })();
  var USER = function () { try { return JSON.parse(sessionStorage.getItem('verisavo-user') || 'null'); } catch (e) { return null; } };

  /* =========================================================
     Icons and small helpers
     ========================================================= */
  var P = {
    logo: 'M6 3.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM18 3.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM12 15.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM8 7.5l3 8M16 7.5l-3 8M8.5 6h7',
    overview: 'M5 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM16 3h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM16 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z',
    clipboard: 'M9 2.5h6a1 1 0 0 1 1 1V5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1zM8 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1M9 11h6M9 15h4',
    plusSq: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 8v8M8 12h8',
    bot: 'M12 3v3M7 7h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9.5 12.5v1M14.5 12.5v1M2.5 11.5v3M21.5 11.5v3',
    wallet: 'M2 6h20v14H2zM2 10h20M16 14h2',
    pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 7a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
    clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 2',
    clip: 'M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10.2 17a1.7 1.7 0 0 1-2.4-2.4L15 7.5',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5',
    search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3',
    flask: 'M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4A1.5 1.5 0 0 0 20 19l-6-10V3M7 15h10',
    branch: 'M6 3a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM6 17a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM18 7a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM6 7v10M18 11c0 4-6 3-11 6.5',
    scale: 'M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM8 21h8',
    save: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
    share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13',
    copy: 'M9 9h12v12H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    plus: 'M12 5v14M5 12h14',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    x: 'M6 6l12 12M18 6L6 18',
    check: 'M5 12l5 5L20 7',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    chev: 'M6 9l6 6 6-6',
    bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5'
  };
  function ic(n, cls, style) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"' + (style ? ' style="' + style + '"' : '') + '><path d="' + P[n] + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(v) { return '$' + v.toFixed(2); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  var $ = function (id) { return document.getElementById(id); };
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function between(r, lo, hi) { return Math.round(lo + r() * (hi - lo)); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  /* =========================================================
     Reference data for the simulation
     ========================================================= */
  var RATE = 1.15, START = 50.00;
  var PLACES = [
    { k: ['kano'], name: 'Kano', areas: ['Dawanau', 'Kurmi Market', 'Sabon Gari'] },
    { k: ['lagos'], name: 'Lagos', areas: ['Ikeja', 'Surulere', 'Oshodi'] },
    { k: ['abuja', 'fct'], name: 'Abuja', areas: ['Wuse', 'Garki', 'Kubwa'] },
    { k: ['kaduna'], name: 'Kaduna', areas: ['Kawo', 'Central Market', 'Barnawa'] },
    { k: ['ibadan'], name: 'Ibadan', areas: ['Bodija', 'Dugbe', 'Mokola'] },
    { k: ['port harcourt', 'portharcourt', 'ph '], name: 'Port Harcourt', areas: ['Mile 1', 'Rumuokoro', 'Trans-Amadi'] },
    { k: ['onitsha'], name: 'Onitsha', areas: ['Main Market', 'Fegge', 'Odoakpu'] },
    { k: ['aba'], name: 'Aba', areas: ['Ariaria', 'Ekeoha', 'Osisioma'] },
    { k: ['enugu'], name: 'Enugu', areas: ['Ogbete', 'New Haven', 'Abakpa'] },
    { k: ['jos'], name: 'Jos', areas: ['Terminus', 'Bukuru', 'Rayfield'] },
    { k: ['benin'], name: 'Benin City', areas: ['Oba Market', 'Uselu', 'Ugbowo'] },
    { k: ['accra'], name: 'Accra', areas: ['Makola', 'Madina', 'Kaneshie'] },
    { k: ['kumasi'], name: 'Kumasi', areas: ['Kejetia', 'Adum', 'Asafo'] },
    { k: ['nairobi'], name: 'Nairobi', areas: ['Gikomba', 'Eastleigh', 'Westlands'] },
    { k: ['mombasa'], name: 'Mombasa', areas: ['Kongowea', 'Old Town', 'Nyali'] },
    { k: ['kampala'], name: 'Kampala', areas: ['Owino', 'Kikuubo', 'Ntinda'] },
    { k: ['dar es salaam', 'dar'], name: 'Dar es Salaam', areas: ['Kariakoo', 'Mwenge', 'Temeke'] },
    { k: ['kigali'], name: 'Kigali', areas: ['Nyabugogo', 'Kimironko', 'Remera'] },
    { k: ['johannesburg', 'joburg'], name: 'Johannesburg', areas: ['Soweto', 'Alexandra', 'Braamfontein'] },
    { k: ['dakar'], name: 'Dakar', areas: ['Sandaga', 'Médina', 'Pikine'] },
    { k: ['abidjan'], name: 'Abidjan', areas: ['Adjamé', 'Treichville', 'Yopougon'] }
  ];
  var PRODUCTS = [
    ['detergent', 'your detergent'], ['washing powder', 'your washing powder'], ['cooking oil', 'your cooking oil'], ['vegetable oil', 'your vegetable oil'], ['palm oil', 'your palm oil'],
    ['noodle', 'your noodles'], ['rice', 'your rice'], ['soap', 'your soap'], ['juice', 'your juice'], ['milk', 'your milk'], ['sugar', 'your sugar'],
    ['flour', 'your flour'], ['biscuit', 'your biscuits'], ['toothpaste', 'your toothpaste'], ['soft drink', 'your soft drink'], ['beverage', 'your beverage'],
    ['drink', 'your drink'], ['water', 'your bottled water'], ['cement', 'your cement'], ['diaper', 'your nappies'], ['nappies', 'your nappies'],
    ['tomato paste', 'your tomato paste'], ['seasoning', 'your seasoning'], ['bread', 'your bread'], ['beer', 'your beer'], ['spaghetti', 'your spaghetti'],
    ['pasta', 'your pasta'], ['phone', 'your phones'], ['airtime', 'your airtime'], ['sanitary', 'your sanitary pads'], ['malt', 'your malt drink'], ['yoghurt', 'your yoghurt']
  ];
  var MONTHS = ['July', 'August', 'September', 'October'];

  function findPlaces(t) {
    var found = [];
    PLACES.forEach(function (p) { p.k.forEach(function (k) { var i = t.indexOf(k); if (i >= 0 && found.every(function (f) { return f.p !== p; })) found.push({ p: p, i: i }); }); });
    return found.sort(function (a, b) { return a.i - b.i; }).map(function (f) { return f.p; });
  }
  function findProduct(t) { for (var i = 0; i < PRODUCTS.length; i++) if (t.indexOf(PRODUCTS[i][0]) >= 0) return PRODUCTS[i][1]; return null; }
  function has(t, words) { return words.some(function (w) { return t.indexOf(w) >= 0; }); }

  /* =========================================================
     Case library: distinct answers for follow-up angles, so a
     thread never repeats itself. Each case is picked by what the
     question asks (cue) or, when a topic comes up again, by the
     next angle not yet covered in this conversation.
     ========================================================= */
  var DISTRIBUTORS = ['Alheri Distribution', 'Bello & Sons', 'Crescent Trading', 'Lakeside Wholesale', 'Unity Merchants'];
  var CASES = [
    /* The public sample: a fixed Accra cooking oil answer. Every figure here comes from the same sample set. */
    { id: 'sample-accra-oil', intents: ['general', 'price'], cue: /(cooking|vegetable) oil.*accra|accra.*(cooking|vegetable) oil/,
      build: function (X) {
        X.a.kb = 'Cooking oil, Ghana';
        X.a.paras = [
          'Here’s what the evidence shows for cooking oil in Accra. Sales in the sample records are down 18% since August, and a new import levy on cooking oil has applied since September.',
          'Inference: a lower rival price may be contributing. Online reviews and discussions in Accra increasingly mention the rival’s lower price.',
          'Unknown: shopper switching remains unverified. The evidence does not yet show whether shoppers are choosing the rival because of price, and that could change what you do next.'
        ];
        X.a.ev = [
          { chip: 'Sample sales records', you: true, text: 'Cooking oil sales in Accra are down 18% since August.', src: 'Sample sales records · Aug – Nov 2026' },
          { chip: 'Public records', text: 'A new import levy on cooking oil applied from September 2026.', src: 'Public records · Sep 2026', org: 'National revenue authority', doc: 'Import levy notice' },
          { chip: 'Online discussions', text: 'Online reviews and discussions in Accra increasingly mention the rival’s lower price.', src: 'Online reviews and trends · Oct – Nov 2026', org: 'Social media, forums and online reviews', doc: 'Accra' },
          { chip: 'Market Memory', layer: 'memory', text: 'An earlier Verisavo investigation in Accra found shoppers move to smaller packs when cooking oil prices rise.', src: 'Market Memory · May 2026', org: 'Market Memory', doc: 'Earlier investigation' },
          { chip: 'Central bank', layer: 'inst', text: 'Food prices remain the main driver of consumer inflation.', src: 'Central bank · Oct 2026', org: 'Central bank', doc: 'Monetary policy report' },
          { chip: 'Trade association', layer: 'inst', text: 'Traders report weaker demand for larger bottles of cooking oil.', src: 'Edible oil traders’ association · Oct 2026', org: 'Edible oil traders’ association', doc: 'Member update' },
          { chip: 'Research paper', layer: 'research', text: 'In staple foods, shoppers tend to switch brands when the price gap passes about 10%.', src: 'University research paper · Jun 2026', org: 'University business school', doc: 'Research paper' },
          { chip: 'Retail prices', layer: 'market', text: 'The rival’s 3L bottle is about 9% cheaper on Accra shelves.', src: 'Retail price observations · Oct – Nov 2026' },
          { chip: 'Mobile payments', layer: 'alt', text: 'Mobile money spending at Accra grocery outlets has been flat since September while prices rose.', src: 'Mobile payments data · Sep – Nov 2026', org: 'Mobile payments data', doc: 'Aggregated, anonymised transactions' },
          { chip: 'Local press', layer: 'news', text: 'Local business press reports importers passing the levy on to shelf prices.', src: 'Local business press · Oct 2026', org: 'Local business press', doc: 'News report' }
        ];
        X.a.assumptions = [{ text: 'Shoppers find both packs in the same outlets.', why: 'If the rival is simply easier to find, price may not be why shoppers switch.', how: 'Check whether both packs are on the shelf in the outlets where shoppers buy.', check: 'shelf check' }];
        X.gap('Are shoppers choosing the rival because of price?', 'If price is the reason, a pack-price test could win shoppers back. If not, a price cut would cost margin for little return.', 36,
          function (n) { var y = Math.round(n * 22 / 36); return 'In ' + y + ' of ' + n + ' verified checks, shoppers named price as their reason. This supports the price explanation but does not prove it.'; }, ['Price was the main reason.', 'Another reason, such as pack size or availability.'], 22 / 36);
        X.a.fu = [['What if we tested a lower pack price in selected outlets?', 'scenario'], ['Which areas of Accra are worst affected?', 'ask'], ['Are shops in Accra running out of our cooking oil?', 'ask']];
      } },
    { id: 'dist-distributors', intents: ['distribution', 'general'], cue: /which distributor|distributors? (are|is) (most|worst|least)|by distributor|distributor/,
      build: function (X) {
        var D = [X.pick(X.r, DISTRIBUTORS)], d2; do { d2 = X.pick(X.r, DISTRIBUTORS); } while (d2 === D[0]); D.push(d2);
        var ot1 = X.between(X.r, 48, 62), ot2 = X.between(X.r, 70, 82), ot3 = X.between(X.r, 88, 96), miss = X.between(X.r, 5, 9);
        X.a.paras = [
          'Three distributors serve ' + X.place.name + ' for ' + X.product + ', and the problem sits mainly with one of them. ' + D[0] + ' covers ' + X.A[0] + ' and ' + X.A[1] + ' and delivered on time to only about ' + ot1 + '% of its outlets in ' + X.month + '. ' + D[1] + ' managed ' + ot2 + '%, and the third distributor over ' + ot3 + '%.',
          'Outlets served by ' + D[0] + ' reported ' + miss + ' missed deliveries each over the last six weeks, roughly twice the rate elsewhere. Your delivery records show the same thing: its orders have been leaving the depot late since the ' + X.month + ' route changes.',
          'What the evidence cannot show is why ' + D[0] + ' is slipping: a vehicle or staffing problem, stock allocation, or shops it has put on hold over credit.'
        ];
        X.a.ev = [
          { chip: 'Your delivery records', you: true, text: D[0] + ' delivered on time to ' + ot1 + '% of its ' + X.place.name + ' outlets in ' + X.month + ', down from ' + X.between(X.r, 80, 90) + '% in ' + X.MONTHS[Math.max(0, X.MONTHS.indexOf(X.month) - 1)] + '.', src: 'Your delivery records · ' + X.month + ' – Nov 2026' },
          { chip: 'SavoScouts · ' + X.n1 + ' outlets', sig: true, text: 'Outlets served by ' + D[0] + ' reported about ' + miss + ' missed deliveries each in six weeks; outlets served by others reported ' + Math.max(1, Math.round(miss / 2)) + '.', src: 'Ground-Level · ' + X.n1 + ' verified responses · Oct 2026' }
        ];
        X.a.chart = { kind: 'bars', title: D[0] + ' delivers on time far less often than the other two', sub: '% of deliveries on time, by distributor · ' + X.place.name + ', ' + X.month, rows: [{ label: D[0], v: ot1, hl: true }, { label: D[1], v: ot2 }, { label: 'Third distributor', v: ot3 }], fmt: '%', src: 'Source: your delivery records (simulated)' };
        X.a.assumptions = [{ text: 'Missed deliveries, not low orders, explain the empty shelves in ' + D[0] + '’s areas.', why: 'If shops there simply order less, replacing the distributor will not refill the shelf.', how: 'Compare order volumes with deliveries for the same outlets.', check: 'your order and delivery records', result: 'Orders held steady while deliveries fell, so the gap is in delivery.' }];
        X.gap('Why is ' + D[0] + ' missing deliveries in ' + X.A[0] + ' and ' + X.A[1] + ': vehicles, stock allocation, or shops on credit hold?', 'Each reason points to a different conversation with the distributor.', 15,
          function (n) { var y = Math.round(n * 0.57); return y + ' of ' + n + ' shopkeepers served by ' + D[0] + ' said deliveries were skipped because of outstanding credit, not because the van did not come.'; }, ['Skipped over outstanding credit.', 'Van did not arrive or came without stock.'], 0.57);
        X.a.fu = [['What if we moved ' + X.A[0] + ' to ' + D[1] + '?', 'scenario'], ['How often do shops served by ' + D[0] + ' reorder?', 'ask'], ['Are wholesalers in ' + X.place.name + ' filling the gap?', 'ask']];
        X.a.caseName = D[0];
      } },
    { id: 'dist-wholesale', intents: ['distribution'], cue: /wholesal/,
      build: function (X) {
        var sh = X.between(X.r, 55, 70), mg = X.between(X.r, 6, 11), cr = X.between(X.r, 35, 50);
        X.a.paras = [
          'Wholesalers are carrying more of the load than your route plan assumes. About ' + sh + '% of the small shops checked in ' + X.place.name + ' now buy ' + X.product + ' from a wholesaler in the main market rather than from a distributor van, up from roughly half a year ago.',
          'That matters for two reasons. Wholesalers add around ' + mg + '% to the shop’s buying price, which narrows the shop’s margin against the rival, and about ' + cr + '% of them have stopped giving small shops credit on your product because it moves more slowly than it did.',
          'What I cannot tell from the evidence is whether wholesalers are short of stock themselves or simply choosing to push the rival, which pays them a little more.'
        ];
        X.a.ev = [
          { chip: 'SavoScouts · ' + X.n1 + ' outlets', sig: true, text: sh + '% of small shops in ' + X.place.name + ' buy ' + X.product + ' through a wholesaler; ' + (100 - sh) + '% from a distributor van.', src: 'Ground-Level · ' + X.n1 + ' verified responses · Oct 2026' },
          { chip: 'Retail prices', text: 'Shops buying through wholesalers pay about ' + mg + '% more for ' + X.product + ' than shops on direct delivery.', src: 'Retail price observations · ' + X.month + ' – Nov 2026' }
        ];
        X.a.chart = { kind: 'pairs', title: 'Small shops now buy mostly through wholesalers', sub: 'Where small shops in ' + X.place.name + ' source each product (% of shops)', series: ['Wholesaler', 'Distributor van'], rows: [{ label: X.product, a: sh, b: 100 - sh }, { label: 'Leading rival', a: X.between(X.r, 30, 42), b: X.between(X.r, 58, 70) }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'Wholesalers would stock more of ' + X.product + ' if the margin matched the rival’s.', why: 'If they are short of stock from you, margin changes will not help.', how: 'Ask wholesalers whether they can get stock when they want it.', check: 'wholesaler interviews', result: 'Most wholesalers said stock is available; margin is the issue.' }];
        X.gap('Are ' + X.place.name + ' wholesalers short of ' + X.product + ', or choosing to push the rival?', 'One is fixed by supply, the other by trade terms.', 15,
          function (n) { var y = Math.round(n * 0.6); return y + ' of ' + n + ' wholesalers said they could get stock but earn more on the rival.'; }, ['Earns more on the rival.', 'Cannot get enough stock.'], 0.6);
        X.a.fu = [['What if we matched the wholesaler margin on the rival?', 'scenario'], ['Which distributors are most affected?', 'ask'], ['Which areas of ' + X.place.name + ' are worst affected?', 'ask']];
      } },
    { id: 'dist-delivery', intents: ['distribution'], cue: /deliver|late|lead time|how long .*(restock|arrive)|days/,
      build: function (X) {
        var d0 = X.between(X.r, 2, 3), d1 = d0 + X.between(X.r, 3, 5);
        X.a.paras = [
          'Deliveries to ' + X.place.name + ' have slowed in a measurable way. In ' + X.MONTHS[0] + ' a small shop waited about ' + d0 + ' days between placing an order and receiving ' + X.product + '. By ' + X.month + ' that had stretched to about ' + d1 + ' days, with the worst waits in ' + X.A[0] + '.',
          'The rival has not suffered the same slip. Shops report that its van still comes on a fixed weekday, which is why its pack is on the shelf even where yours is not.',
          'The evidence does not yet show whether the delay is at your depot, on the road, or in how distributors batch small orders.'
        ];
        X.a.ev = [
          { chip: 'Your delivery records', you: true, text: 'Average order-to-delivery time in ' + X.place.name + ' rose from ' + d0 + ' to ' + d1 + ' days between ' + X.MONTHS[0] + ' and ' + X.month + '.', src: 'Your delivery records · ' + X.MONTHS[0] + ' – ' + X.month + ' 2026' },
          { chip: 'SavoScouts · ' + X.n1 + ' outlets', sig: true, text: X.between(X.r, 60, 75) + '% of shopkeepers said the rival’s van arrives on a fixed day; ' + X.between(X.r, 20, 35) + '% said the same of yours.', src: 'Ground-Level · ' + X.n1 + ' verified responses · Oct 2026' }
        ];
        X.a.chart = { kind: 'cols', title: 'Order-to-delivery time has roughly doubled since ' + X.MONTHS[0], sub: 'Average days from order to delivery, small shops · ' + X.place.name, vals: [d0, d0, d0 + 1, d0 + 2, d1 - 1, d1], cats: [X.MONTHS[0].slice(0, 3), 'mid ' + X.MONTHS[1].slice(0, 3), X.MONTHS[1].slice(0, 3), X.MONTHS[2].slice(0, 3), 'mid ' + X.MONTHS[3].slice(0, 3), X.MONTHS[3].slice(0, 3)], hl: [5], fmt: 'd', src: 'Source: your delivery records (simulated)' };
        X.a.assumptions = [{ text: 'Shops would hold more stock if deliveries were predictable.', why: 'If they are short of cash or space, a faster van changes little.', how: 'Ask shops how much they would order on a fixed weekly delivery.', check: 'retailer interviews', result: 'Most shops said they would take a weekly standing order.' }];
        X.gap('Where is the delay in getting ' + X.product + ' to ' + X.place.name + ' shops: depot, road, or distributor batching?', 'Each sits with a different team.', 15,
          function (n) { var y = Math.round(n * 0.52); return y + ' of ' + n + ' distributor staff said orders wait at the depot until a full load is ready.'; }, ['Waits at the depot for a full load.', 'Delayed on the road or at the shop.'], 0.52);
        X.a.fu = [['What if we restock smaller shops weekly in ' + X.place.name + '?', 'scenario'], ['Which distributors are most affected?', 'ask'], ['When did the drop start?', 'ask']];
      } },
    { id: 'dist-reorder', intents: ['distribution'], cue: /reorder|re-order|how often|frequency|order size|order quantit/,
      build: function (X) {
        var kw = X.between(X.r, 2, 3), sw = X.between(X.r, 1, 2), lw = X.between(X.r, 3, 5);
        X.a.paras = [
          'Reordering follows outlet type more than anything else. Kiosks in ' + X.place.name + ' reorder ' + X.product + ' about every ' + (7 * kw) + ' days and take two or three packs at a time. Small shops reorder weekly or fortnightly in larger lots. Larger stores reorder on a fixed schedule and rarely run short.',
          'The gap opens because a kiosk that sells out on day four waits another ' + (7 * kw - 4) + ' days for stock, and in that window the rival is the only option. Shopkeepers say they would order more often if the van came more often, not the other way round.',
          'What is still unknown is whether small orders are a cash constraint or a delivery constraint; the two need different responses.'
        ];
        X.a.ev = [
          { chip: 'SavoScouts · ' + X.n1 + ' outlets', sig: true, text: 'Kiosks reorder every ' + (7 * kw) + ' days on average; small shops every ' + (7 * sw) + '–' + (7 * lw) + ' days.', src: 'Ground-Level · ' + X.n1 + ' verified responses · Oct 2026' },
          { chip: 'Your order records', you: true, text: 'Average order size from ' + X.place.name + ' kiosks is ' + X.between(X.r, 2, 4) + ' packs; from small shops ' + X.between(X.r, 8, 14) + '.', src: 'Your order records · ' + X.month + ' 2026' }
        ];
        X.a.chart = { kind: 'bars', title: 'Kiosks wait longest between orders', sub: 'Average days between reorders of ' + X.product + ', by outlet type · ' + X.place.name, rows: [{ label: 'Kiosks', v: 7 * kw, hl: true }, { label: 'Small shops', v: 7 * sw + 3 }, { label: 'Larger stores', v: 7 }], fmt: 'd', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'Kiosks would sell more if they could reorder weekly.', why: 'If demand is the limit, more frequent delivery only adds cost.', how: 'Check sell-out speed against reorder gaps.', check: 'your sales data', result: 'Kiosks sell out within four days on average, so there is unmet demand.' }];
        X.gap('Do ' + X.place.name + ' kiosks order small because of cash, or because the van comes rarely?', 'Cash points to credit terms; delivery points to route frequency.', 15,
          function (n) { var y = Math.round(n * 0.63); return y + ' of ' + n + ' kiosk owners said they would order more if the van came weekly; the rest cited cash.'; }, ['Would order more with a weekly van.', 'Cash is the limit.'], 0.63);
        X.a.fu = [['What if we restock kiosks weekly in ' + X.place.name + '?', 'scenario'], ['Which distributors are most affected?', 'ask'], ['Are wholesalers in ' + X.place.name + ' filling the gap?', 'ask']];
      } },
    { id: 'price-area', intents: ['price'], cue: /biggest price gap|price .*(area|where|which outlet|by outlet)|which outlets .*(price|gap)|where .*(expensive|cheap)/,
      build: function (X) {
        var g1 = X.pct1 + X.between(X.r, 4, 8), g2 = X.pct1, g3 = Math.max(2, X.pct1 - X.between(X.r, 4, 7));
        X.a.paras = [
          'The price gap is not uniform. In ' + X.A[0] + ' ' + X.product + ' sells for about ' + g1 + '% more than the rival, in ' + X.A[1] + ' about ' + g2 + '%, and in ' + X.A[2] + ' only ' + g3 + '%. The gap is widest where shops buy through wholesalers, who add their own margin.',
          'Open-market stalls show the largest spread of all: the same pack can differ by ' + X.between(X.r, 10, 18) + '% between two stalls a few metres apart, which suggests price is set by what the seller paid rather than by any list price.',
          'What the evidence cannot tell you is whether shops in ' + X.A[0] + ' would pass on a lower price or keep the margin.'
        ];
        X.a.ev = [
          { chip: 'Retail prices · ' + X.n1 + ' outlets', text: 'Gap to the rival: ' + g1 + '% in ' + X.A[0] + ', ' + g2 + '% in ' + X.A[1] + ', ' + g3 + '% in ' + X.A[2] + '.', src: 'Retail price observations · ' + X.month + ' – Nov 2026' },
          { chip: 'SavoScouts', sig: true, text: 'Price photos from ' + X.n1 + ' outlets show a ' + X.between(X.r, 10, 18) + '% spread between market stalls in ' + X.A[0] + '.', src: 'Ground-Level · ' + X.n1 + ' verified responses with photos · Oct 2026' }
        ];
        X.a.chart = { kind: 'bars', title: 'The price gap to the rival is widest in ' + X.A[0], sub: X.Product + ' shelf price above the rival, by area · ' + X.place.name, rows: [{ label: X.A[0], v: g1, hl: true }, { label: X.A[1], v: g2 }, { label: X.A[2], v: g3 }], fmt: '%', src: 'Source: Verisavo retail price observations (simulated)' };
        X.a.assumptions = [{ text: 'Shops pass on wholesale price changes to shoppers.', why: 'If they keep the difference, a trade price cut will not reach the shelf.', how: 'Track shelf prices after a trade price change.', check: 'retail price observations', result: 'About two thirds of the trade price change reached the shelf within three weeks.' }];
        X.gap('Would ' + X.A[0] + ' shops pass a lower trade price on to shoppers?', 'If not, the price cut is given away to the trade.', 15,
          function (n) { var y = Math.round(n * 0.66); return y + ' of ' + n + ' shopkeepers said they would lower the shelf price within a week of a trade price cut.'; }, ['Would pass it on within a week.', 'Would keep the margin.'], 0.66);
        X.a.fu = [['What if we cut our price by 10% in ' + X.A[0] + ' only?', 'scenario'], ['Who are the most price-sensitive shoppers?', 'ask'], ['Are wholesalers in ' + X.place.name + ' adding to the price?', 'ask']];
      } },
    { id: 'price-sensitive', intents: ['price', 'consumer'], cue: /price-sensitive|price sensitive|sensitive|who .*(price|switch)|which shoppers/,
      build: function (X) {
        var s1 = X.between(X.r, 55, 68), s2 = X.between(X.r, 25, 38);
        X.a.paras = [
          'Price sensitivity splits along pack size and channel. Shoppers buying single small packs at kiosks in ' + X.place.name + ' are the most sensitive: about ' + s1 + '% said they would switch for a difference of ' + X.between(X.r, 20, 50) + ' naira or less. Shoppers buying larger packs in supermarkets were far less moved, at ' + s2 + '%.',
          'Habit protects you more than you might expect. Among shoppers who had bought ' + X.product + ' three or more times, most said they would keep buying it at a small premium so long as it was on the shelf when they came in.',
          'What is not known is how large that premium can be before loyal shoppers also start to move.'
        ];
        X.a.ev = [
          { chip: 'Shopper feedback', sig: true, text: s1 + '% of kiosk shoppers and ' + s2 + '% of supermarket shoppers in ' + X.place.name + ' said they would switch for a small price difference.', src: 'Ground-Level · ' + X.between(X.r, 60, 110) + ' shopper responses · Oct 2026' },
          { chip: 'Your sales data', you: true, text: 'Small-pack volume fell ' + X.between(X.r, 14, 24) + '% after the rival’s price move; large-pack volume fell ' + X.between(X.r, 2, 6) + '%.', src: 'Your sales data · ' + X.month + ' – Nov 2026' }
        ];
        X.a.chart = { kind: 'bars', title: 'Kiosk shoppers are twice as likely to switch on price', sub: '% of shoppers who would switch for a small price difference, by channel · ' + X.place.name, rows: [{ label: 'Kiosks', v: s1, hl: true }, { label: 'Small shops', v: Math.round((s1 + s2) / 2) }, { label: 'Supermarkets', v: s2 }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'What shoppers say about switching matches what they do.', why: 'Stated intent usually overstates actual switching.', how: 'Compare stated intent with sales after the rival’s price move.', check: 'your sales data', result: 'Actual switching was about two thirds of stated intent.' }];
        X.gap('How large a premium will loyal ' + X.place.name + ' shoppers accept for ' + X.product + ' before they switch?', 'It sets the floor for any price response.', 25,
          function (n) { var y = Math.round(n * 0.6); return y + ' of ' + n + ' repeat buyers said they would stay up to a 10% premium; few beyond that.'; }, ['Would stay up to a 10% premium.', 'Would switch at any premium.'], 0.6);
        X.a.fu = [['What if we cut the small-pack price only?', 'scenario'], ['Which outlets have the biggest price gap?', 'ask'], ['Are shoppers moving to smaller packs?', 'ask']];
      } },
    { id: 'price-promo', intents: ['price', 'competitor'], cue: /promotion|promo|discount|special offer|bundle/,
      build: function (X) {
        var pr = X.between(X.r, 35, 55), lift = X.between(X.r, 18, 30);
        X.a.paras = [
          'The rival is running an in-store promotion in ' + X.place.name + ', and it is doing more work than its everyday price. SavoScouts found promotional pricing or bundle offers on the rival pack in about ' + pr + '% of the shops checked, concentrated in ' + X.A[1] + ' and ' + X.A[2] + '.',
          'Where the promotion was present, your pack sold about ' + lift + '% slower than in shops without it, even at the same everyday price gap. Shopkeepers describe it as a two-month push that began in ' + X.month + '.',
          'What I cannot tell you is whether it is funded by the manufacturer or by wholesalers clearing stock, which decides how long it will last.'
        ];
        X.a.ev = [
          { chip: 'SavoScouts · ' + X.n1 + ' outlets', sig: true, text: 'Rival promotion seen in ' + pr + '% of outlets checked, with shelf photos; most common in ' + X.A[1] + '.', src: 'Ground-Level · ' + X.n1 + ' verified responses with photos · Oct 2026' },
          { chip: 'Your sales data', you: true, text: 'Sell-out of ' + X.product + ' is ' + lift + '% slower in outlets where the rival promotion is present.', src: 'Your sales data matched to outlet observations · ' + X.month + ' – Nov 2026' }
        ];
        X.a.chart = { kind: 'bars', title: 'The rival’s promotion is concentrated in two areas', sub: '% of outlets with a rival promotion on the shelf, by area · ' + X.place.name, rows: [{ label: X.A[0], v: Math.max(5, pr - 25) }, { label: X.A[1], v: pr + 10, hl: true }, { label: X.A[2], v: pr }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'The promotion is temporary.', why: 'If it is a permanent price reset, waiting it out will not work.', how: 'Ask shopkeepers what they were told about its end date.', check: 'retailer interviews', result: 'Most shopkeepers were told it runs to the end of the quarter.' }];
        X.gap('Who is funding the rival’s promotion in ' + X.place.name + ', and until when?', 'A manufacturer push and a stock clearance call for different responses.', 15,
          function (n) { var y = Math.round(n * 0.7); return y + ' of ' + n + ' shopkeepers said the rival’s rep set the offer and it ends next month.'; }, ['Manufacturer-funded, ends next month.', 'Wholesaler clearing stock or unsure.'], 0.7);
        X.a.fu = [['What if we ran a matching offer in ' + X.A[1] + ' only?', 'scenario'], ['What incentives is the rival offering retailers?', 'ask'], ['Which shoppers are most price-sensitive?', 'ask']];
      } },
    { id: 'comp-incentives', intents: ['competitor', 'distribution'], cue: /incentive|credit terms|trade terms|offering retailers|offering shops|margin for|retailer margin/,
      build: function (X) {
        var cr = X.between(X.r, 40, 60), mg = X.between(X.r, 3, 6);
        X.a.paras = [
          'The rival is winning the shelf with terms, not only price. In ' + X.place.name + ' about ' + cr + '% of shopkeepers interviewed said the rival’s distributor gives them ' + X.between(X.r, 14, 30) + ' days’ credit, against cash on delivery for ' + X.product + '. Roughly a third also mentioned a free pack with every case.',
          'That adds up to about ' + mg + ' percentage points more margin for the shop on the rival pack, which is why it gets the eye-level facing even in shops that still stock yours.',
          'What the evidence does not show is whether these terms are standard for the rival or a targeted push in ' + X.place.name + '.'
        ];
        X.a.ev = [
          { chip: 'Retailer interviews', sig: true, text: cr + '% of ' + X.n1 + ' shopkeepers in ' + X.place.name + ' receive credit on the rival; ' + X.between(X.r, 8, 15) + '% receive it on ' + X.product + '.', src: 'Ground-Level · ' + X.n1 + ' verified responses · Oct 2026' },
          { chip: 'Shelf photos', text: 'The rival holds the eye-level facing in ' + X.between(X.r, 60, 75) + '% of shops that stock both.', src: 'Ground-Level · shelf photos · Oct 2026' }
        ];
        X.a.chart = { kind: 'pairs', title: 'Shops get credit and extras on the rival, cash terms on yours', sub: '% of shopkeepers reporting each term · ' + X.place.name, series: ['Leading rival', X.Product], rows: [{ label: 'Credit period', a: cr, b: X.between(X.r, 8, 15) }, { label: 'Free pack per case', a: X.between(X.r, 28, 40), b: X.between(X.r, 0, 5) }, { label: 'Rep visits monthly', a: X.between(X.r, 55, 70), b: X.between(X.r, 20, 35) }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'Shops would give back the facing if the terms were matched.', why: 'If the rival also sells faster, terms alone may not move it.', how: 'Compare sell-out speed in shops with equal terms.', check: 'your sales data', result: 'Where terms were equal, sell-out speed was similar.' }];
        X.gap('Are the rival’s credit terms in ' + X.place.name + ' standard, or a targeted push?', 'A standard term needs a structural answer; a push can be waited out or matched locally.', 15,
          function (n) { var y = Math.round(n * 0.58); return y + ' of ' + n + ' shopkeepers said the credit offer started this quarter and was presented as limited.'; }, ['Started this quarter, presented as limited.', 'Long-standing arrangement.'], 0.58);
        X.a.fu = [['What if we offered 14 days’ credit in ' + X.place.name + '?', 'scenario'], ['Which distributors are most affected?', 'ask'], ['Is the rival running a promotion?', 'ask']];
      } },
    { id: 'comp-shelf', intents: ['competitor'], cue: /shelf share|facing|eye.?level|shelf space|visib/,
      build: function (X) {
        var f1 = X.between(X.r, 18, 28), f2 = X.between(X.r, 40, 52);
        X.a.paras = [
          'On the shelf itself the rival is ahead. Across the shops photographed in ' + X.place.name + ', ' + X.product + ' holds about ' + f1 + '% of the category facings and the rival ' + f2 + '%, with the rest split among local brands. In kiosks your pack is often behind the counter rather than on display.',
          'Facings follow stock reliability: shopkeepers give the front of the shelf to the brand they are confident of restocking. Where your deliveries have been regular, your share of facings is close to the rival’s.',
          'What the evidence does not settle is whether a point-of-sale push would hold without fixing delivery first.'
        ];
        X.a.ev = [
          { chip: 'Shelf photos · ' + X.n1 + ' outlets', sig: true, text: X.Product + ' holds ' + f1 + '% of category facings; the rival ' + f2 + '%.', src: 'Ground-Level · ' + X.n1 + ' shelf photos · Oct 2026' },
          { chip: 'Your delivery records', you: true, text: 'In outlets with four or more on-time deliveries in ' + X.month + ', your facing share was ' + (f1 + X.between(X.r, 12, 18)) + '%.', src: 'Your delivery records matched to shelf photos' }
        ];
        X.a.chart = { kind: 'bars', title: 'The rival holds about twice the shelf space', sub: 'Share of category facings, shops that stock both · ' + X.place.name, rows: [{ label: 'Leading rival', v: f2 }, { label: X.Product, v: f1, hl: true }, { label: 'Local brands', v: 100 - f1 - f2 }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence shelf photos (simulated)' };
        X.a.assumptions = [{ text: 'More facings would lift sales rather than only move stock to the front.', why: 'If shoppers ask for a brand by name, facings matter less.', how: 'Ask shoppers whether they chose at the shelf or asked by name.', check: 'shopper feedback', result: 'About half chose at the shelf, so facings do matter.' }];
        X.gap('Would ' + X.place.name + ' shopkeepers give ' + X.product + ' more facings if deliveries were reliable?', 'It decides whether to spend on display or on delivery.', 15,
          function (n) { var y = Math.round(n * 0.68); return y + ' of ' + n + ' shopkeepers said facings follow whichever brand restocks reliably.'; }, ['Facings follow reliable restocking.', 'Facings follow margin or shopper demand.'], 0.68);
        X.a.fu = [['What incentives is the rival offering retailers?', 'ask'], ['Why are smaller shops running out of ' + X.product.replace('your ', '') + '?', 'ask'], ['How does ' + X.place.name + ' compare with ' + X.other.name + '?', 'compare']];
      } },
    { id: 'cons-switch', intents: ['consumer', 'competitor'], cue: /switch|why .*(choose|chose|buy|bought|prefer)|what decided|why do shoppers/,
      build: function (X) {
        var ab = X.between(X.r, 45, 58), pr = X.between(X.r, 22, 32), pk = 100 - ab - pr;
        X.a.paras = [
          'Shoppers who moved to the rival in ' + X.place.name + ' mostly did not do it for price. Asked what decided their last purchase, about ' + ab + '% said ' + X.product + ' was not on the shelf, ' + pr + '% said the rival was cheaper, and ' + pk + '% preferred the rival’s pack size or a promotion.',
          'Most who switched because of absence said they would switch back, but about a third have now bought the rival three or more times and describe it as “what I buy now”. The window for winning them back is closing.',
          'What is not known is how many of the absence-driven switchers have already become habit-driven, and that number decides the urgency.'
        ];
        X.a.ev = [
          { chip: 'Shopper feedback', sig: true, text: ab + '% switched because ' + X.product + ' was unavailable; ' + pr + '% for price; ' + pk + '% for pack or promotion.', src: 'Ground-Level · ' + X.between(X.r, 70, 120) + ' shopper responses · Oct 2026' },
          { chip: 'Your sales data', you: true, text: 'Repeat purchase of ' + X.product + ' among previously regular shoppers fell ' + X.between(X.r, 15, 25) + '% since ' + X.month + '.', src: 'Your loyalty and sales data · ' + X.month + ' – Nov 2026' }
        ];
        X.a.chart = { kind: 'bars', title: 'Most switching followed an empty shelf, not a lower price', sub: 'What decided the last purchase among shoppers who switched · ' + X.place.name, rows: [{ label: 'Not on the shelf', v: ab, hl: true }, { label: 'Rival was cheaper', v: pr }, { label: 'Pack size or promotion', v: pk }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'Shoppers who switched because of absence will return when stock is back.', why: 'After several purchases the rival becomes the habit.', how: 'Track repeat purchase after restocking.', check: 'your sales data', result: 'About two thirds returned within a month of reliable stock.' }];
        X.gap('How many ' + X.place.name + ' shoppers who switched for availability have now become rival regulars?', 'It sets how urgent the restocking fix is.', 25,
          function (n) { var y = Math.round(n * 0.35); return y + ' of ' + n + ' switchers now describe the rival as their usual brand.'; }, ['Rival is now the usual brand.', 'Would return when stocked.'], 0.35);
        X.a.fu = [['Who are the most price-sensitive shoppers?', 'ask'], ['Why are smaller shops running out of ' + X.product.replace('your ', '') + '?', 'ask'], ['What if we restock kiosks weekly in ' + X.place.name + '?', 'scenario']];
      } },
    { id: 'cons-loyal', intents: ['consumer'], cue: /loyal|come back|return|win back|retain/,
      build: function (X) {
        var l1 = X.between(X.r, 58, 72);
        X.a.paras = [
          'Loyalty is holding better than the sales line suggests. Among ' + X.place.name + ' shoppers who bought ' + X.product + ' regularly before ' + X.month + ', about ' + l1 + '% still name it as their preferred brand, even where they bought the rival last time.',
          'Preference and purchase have come apart because of the shelf. Preference is strongest among larger-pack buyers and weakest among kiosk shoppers, who buy whatever is in front of them.',
          'The evidence does not show how long preference survives repeated absence; in other categories it fades after two to three months.'
        ];
        X.a.ev = [
          { chip: 'Shopper feedback', sig: true, text: l1 + '% of former regular buyers in ' + X.place.name + ' still prefer ' + X.product + '.', src: 'Ground-Level · ' + X.between(X.r, 70, 120) + ' shopper responses · Oct 2026' },
          { chip: 'Market research', text: 'In comparable categories, stated preference fades after 8–12 weeks of repeated unavailability.', src: 'Verisavo Market Memory · category studies' }
        ];
        X.a.chart = { kind: 'bars', title: 'Preference is intact; purchase is not', sub: '% of former regular buyers · ' + X.place.name, rows: [{ label: 'Still prefer ' + X.product, v: l1, hl: true }, { label: 'Bought it last time', v: l1 - X.between(X.r, 20, 30) }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
        X.a.assumptions = [{ text: 'Preference converts back to purchase once stock is reliable.', why: 'Habit may have moved even where preference has not.', how: 'Track purchases after restocking.', check: 'your sales data', result: 'Purchase recovered to about 85% of preference within six weeks.' }];
        X.gap('How long does preference for ' + X.product + ' survive empty shelves in ' + X.place.name + '?', 'It sets the deadline for a restocking fix.', 25,
          function (n) { var y = Math.round(n * 0.6); return y + ' of ' + n + ' shoppers said they would give it one more month before changing for good.'; }, ['One more month at most.', 'Would wait longer.'], 0.6);
        X.a.fu = [['Why did shoppers switch to the rival?', 'ask'], ['What if we restock kiosks weekly in ' + X.place.name + '?', 'scenario'], ['Which areas of ' + X.place.name + ' are worst affected?', 'ask']];
      } }
  ];
  function applyCase(a, t, intent, X) {
    var used = {}; S.answers.forEach(function (x) { if (x.caseId) used[x.caseId] = 1; });
    var sameIntentBefore = S.answers.some(function (x) { return x.intent === intent && x.status !== 'typing'; });
    var c = null, i;
    for (i = 0; i < CASES.length && !c; i++) if (CASES[i].cue.test(t) && !used[CASES[i].id]) c = CASES[i];
    if (!c && sameIntentBefore && !TOPIC_RX.test(t)) for (i = 0; i < CASES.length && !c; i++) if (CASES[i].intents.indexOf(intent) >= 0 && !used[CASES[i].id]) c = CASES[i];
    if (!c) return false;
    X.a = a; c.build(X); a.caseId = c.id; return true;
  }
  function recapCase(a, X) {
    var covered = S.answers.filter(function (x) { return x.place && x.place.name === X.place.name && x.status === 'done'; }).length;
    a.paras = [
      'We have already looked at this from ' + covered + ' angles for ' + X.place.name + ', and the evidence does not add anything new on this question.',
      'What it does say consistently is that availability in smaller outlets, not price, is where the volume is being lost, and that the cause sits somewhere between the distributor and the shop.',
      'The open questions are listed under Unknown. Ticking one and setting up a task is the fastest way to move this forward.'
    ];
    a.ev = []; a.chart = null; a.gap = null; a.assumptions = [];
    a.fu = [['Which distributors are most affected?', 'ask'], ['What if we restock smaller shops weekly in ' + X.place.name + '?', 'scenario'], ['How does ' + X.place.name + ' compare with ' + X.other.name + '?', 'compare']];
  }

  var TOPIC_RX = /which area|what area|which part|where .*worst|worst affected|which neighbourhood|which district|hotspot|when did|since when|how long|start(ed)? (falling|dropping|slowing)|timeline|when .*(start|begin)|how many|what share|how much of|penetration|coverage|how widely|which outlets stock|quality|complain|fake|counterfeit|trust|expired|damaged/;
  function intentOf(t, mode) {
    if (mode && mode !== 'ask') return mode;
    if (has(t, ['what if', 'if we ', 'if i ', 'would it', 'should we cut', 'should we raise', 'simulate', 'scenario'])) return 'scenario';
    if (has(t, [' compare', 'compare ', ' vs', 'versus', 'difference between', 'better than'])) return 'compare';
    if (has(t, ['assum'])) return 'assumptions';
    if (has(t, ['enter', 'launch', 'expand', 'open in', 'move into', 'new market', 'opportunit'])) return 'entry';
    if (has(t, ['price', 'cheap', 'expensive', 'discount', 'cost', 'margin', 'naira', '₦'])) return 'price';
    if (has(t, ['distribut', 'deliver', 'restock', 'stock', 'availab', 'supply', 'shelf', 'shelves', 'wholesal', 'kiosk', 'logistic', 'running out', 'run out', 'sold out', 'out of '])) return 'distribution';
    if (has(t, ['competitor', 'rival', 'brand', 'market share', 'competition', 'losing to'])) return 'competitor';
    if (has(t, ['customer', 'consumer', 'shopper', 'buyer', 'demand', 'prefer', 'behaviour', 'behavior', 'buy ', 'pack size', 'sachet'])) return 'consumer';
    return 'general';
  }

  /* =========================================================
     The answer simulator: turns any question into an answer
     ========================================================= */
  function simulate(q, mode, ctx) {
    var t = ' ' + q.toLowerCase() + ' ';
    var places = findPlaces(t);
    var place = places[0] || ctx.place;
    var other = places[1] || [PLACES[3], PLACES[2], PLACES[1], PLACES[0], PLACES[4]].filter(function (p) { return p !== place; })[place.name === 'Kano' ? 0 : 1];
    var product = findProduct(t) || ctx.product;
    var Product = cap(product);
    var r = rng(hash(q.toLowerCase() + mode));
    var intent = intentOf(t, mode);
    if (TOPIC_RX.test(t) && intent !== 'scenario' && intent !== 'compare' && intent !== 'investigate') intent = 'general';
    var A = place.areas, month = pick(r, MONTHS);
    var a = { q: q, intent: intent, place: place, other: other, product: product, paras: [], ev: [], assumptions: [], fu: [], chart: null, tiles: null, table: null, gap: null };
    var n1 = between(r, 18, 42), k1 = between(r, Math.round(n1 * 0.35), Math.round(n1 * 0.7)), pct1 = between(r, 8, 22), pct2 = between(r, 6, 19);
    var outlets = function (x) { return x + ' outlets'; };

    function gap(gq, why, n, foundTpl, resp, share, gplace) { a.gap = { q: gq, why: why, n: n || 15, state: 'open', found: foundTpl, resp: resp, share: share || 0.6, place: gplace || null }; }
    var X = { place: place, other: other, product: product, Product: Product, r: r, A: A, month: month, n1: n1, k1: k1, pct1: pct1, pct2: pct2, between: between, pick: pick, MONTHS: MONTHS, gap: gap, list: list };
    if (mode === 'ask' && applyCase(a, t, intent, X)) return a;
    if (mode === 'ask' && ['price', 'distribution', 'competitor', 'consumer', 'general'].indexOf(intent) >= 0 && !TOPIC_RX.test(t) && S.answers.some(function (x) { return x.intent === intent && x.status !== 'typing' && !x.caseId; })) { recapCase(a, X); return a; }

    if (intent === 'price') {
      var yours = between(r, 1150, 2400), rival = Math.round(yours * (1 - pct1 / 100) / 10) * 10;
      a.paras = [
        'Price is part of it, but probably not the whole story. Across ' + n1 + ' outlets checked in ' + place.name + ', ' + product + ' sells for about ' + pct1 + '% more than the closest rival, and that gap has widened since ' + month + '.',
        'The shoppers most likely to switch are the ones who buy on price, mostly in open markets and kiosks around ' + A[0] + ' and ' + A[2] + '. In supermarkets the gap matters less, because people there tend to stick with brands they know.',
        'What I can’t tell you yet is how many shoppers would come back if the gap closed. That’s worth knowing before you cut your price.'
      ];
      a.ev = [
        { chip: 'Retail prices · ' + outlets(n1), text: Product + ' is about ' + pct1 + '% more expensive than the closest rival across ' + n1 + ' outlets in ' + place.name + '.', src: 'Retail price observations · ' + month + ' – Nov 2026' },
        { chip: 'Your sales records', you: true, text: 'Your sales in ' + place.name + ' are down about ' + pct2 + '% over the same period.', src: 'Your sales records · ' + month + ' – Oct 2026' }
      ];
      var gaps6 = [0.35, 0.45, 0.55, 0.7, 0.85, 1].map(function (f) { return Math.max(1, Math.round(pct1 * f)); });
      a.chart = { kind: 'cols', title: 'Your price premium over the closest rival has widened to about ' + pct1 + '%', sub: 'Price gap to closest rival, % · same pack size, ' + n1 + ' outlets in ' + place.name, cats: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], vals: gaps6, fmt: '%', hl: [5], src: 'Source: Verisavo retail price observations, Jun–Nov 2026 (simulated)' };
      a.assumptions = [{ text: 'Shoppers compare prices across the same pack size.', why: 'If shoppers compare different pack sizes, the price gap may be smaller than it looks, and a price cut could be the wrong fix.', how: 'Compare your sales by pack size with the rival’s main pack sizes.', check: 'your pack-size sales mix', result: 'Most of your volume in ' + place.name + ' is in the same pack size as the rival, so the comparison holds.' }];
      gap('Would shoppers in ' + place.name + ' switch back if ' + product + ' matched the rival’s price?', 'This decides whether a price cut wins back volume or just gives away margin.', 15,
        function (n) { var y = Math.round(n * 0.6); return y + ' of ' + n + ' shoppers asked in ' + place.name + ' said they would switch back at the same price; the rest said they now prefer the rival.'; },
        ['Would switch back at the same price.', 'Prefers the rival now, even at the same price.'], 0.6);
      a.fu = [['What if we cut our price by 10% in ' + place.name + '?', 'scenario'], ['Which outlets have the biggest price gap?', 'ask'], ['How does ' + place.name + ' compare with ' + other.name + ' on price?', 'compare'], ['Who are the most price-sensitive shoppers?', 'ask']];
    } else if (intent === 'distribution') {
      a.paras = [
        'It looks like availability is the bigger issue. In ' + n1 + ' outlets checked across ' + list(A) + ', ' + product + ' was out of stock in ' + k1 + ' of them, while the leading rival was missing in only ' + between(r, 2, 6) + '.',
        'The pattern is strongest in smaller shops and kiosks, which restock less often and usually buy through wholesalers. Larger stores mostly had stock.',
        'The open question is where the supply chain is slowing down: at the distributor, the wholesaler or the shop itself.'
      ];
      a.ev = [
        { chip: 'SavoScouts · ' + outlets(n1), sig: true, text: Product + ' was out of stock in ' + k1 + ' of ' + n1 + ' outlets checked in ' + place.name + '.', src: 'Ground-Level · ' + n1 + ' verified responses with photos · Oct 2026' },
        { chip: 'Your delivery records', you: true, text: 'Average delivery time to ' + place.name + ' distributors has risen by about ' + between(r, 2, 5) + ' days since ' + month + '.', src: 'Your delivery records · ' + month + ' – Oct 2026' }
      ];
      var base = Math.round((n1 - k1) / n1 * 100), cl = function (v) { return Math.max(5, Math.min(95, v)); };
      a.chart = { kind: 'pairs', title: Product + ' is missing far more often than the leading rival in every area', sub: '% of outlets with each product on the shelf · ' + place.name + ', ' + n1 + ' outlets checked', series: [Product, 'Leading rival'],
        rows: [{ label: A[0], a: cl(base - 8), b: cl(between(r, 84, 94)) }, { label: A[1], a: cl(base + 5), b: cl(between(r, 84, 94)) }, { label: A[2], a: cl(base + 3), b: cl(between(r, 84, 94)) }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence; ' + n1 + ' verified SavoScout responses, Oct 2026 (simulated)' };
      a.assumptions = [{ text: 'The outlets checked are typical of ' + place.name + ' as a whole.', why: 'If the outlets checked lean towards one type of shop, the stock problem could be smaller or larger across the city.', how: 'Compare the mix of outlets checked with all outlets that sell your product in ' + place.name + '.', check: 'platform outlet coverage', result: 'The outlets checked match the mix of shop types across ' + place.name + ', so the pattern is likely to hold.' }];
      gap('Where is restocking slowing down in ' + place.name + ': distributors, wholesalers or shops?', 'Each needs a different fix, from delivery schedules to credit terms for shops.', 15,
        function (n) { var d = Math.round(n * 0.55); return d + ' of ' + n + ' traders in ' + place.name + ' said delays start at the distributor; most of the rest pointed to wholesaler credit limits.'; },
        ['Says delays start at the distributor.', 'Says wholesaler credit limits slow restocking.'], 0.55);
      a.fu = [['What if we restock smaller shops weekly in ' + place.name + '?', 'scenario'], ['Which distributors are most affected?', 'ask'], ['How does ' + place.name + ' compare with ' + other.name + '?', 'compare'], ['Which areas of ' + place.name + ' are worst affected?', 'ask']];
    } else if (intent === 'competitor') {
      a.paras = [
        'One rival brand is gaining the most ground in ' + place.name + '. It has appeared in about ' + k1 + ' more outlets since ' + month + ', mostly around ' + A[0] + ' and ' + A[1] + '.',
        'Its advantage looks like reach and visibility rather than price. Shelf position and retailer incentives seem to matter more here than a small price difference.',
        'What I can’t confirm yet is what that rival is offering retailers to win the shelf space.'
      ];
      a.ev = [
        { chip: 'SavoScouts · ' + outlets(n1), sig: true, text: 'The leading rival was stocked in ' + (n1 - between(r, 2, 6)) + ' of ' + n1 + ' outlets checked, often at eye level.', src: 'Ground-Level · ' + n1 + ' verified responses · Oct 2026' },
        { chip: 'Retail prices', text: 'Prices for the rival and ' + product + ' are within about ' + between(r, 2, 6) + '% of each other.', src: 'Retail price observations · ' + month + ' – Nov 2026' }
      ];
      var rs = between(r, 38, 60), steps = [0, 0.15, 0.35, 0.55, 0.8, 1];
      a.chart = { kind: 'cols', title: 'The leading rival has added about ' + k1 + ' outlets in ' + place.name + ' in six months', sub: 'Outlets stocking the leading rival, number · ' + place.name, cats: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], vals: steps.map(function (f) { return rs + Math.round(k1 * f); }), hl: [5], src: 'Source: Verisavo Ground-Level Intelligence and platform retail listings (simulated)' };
      a.assumptions = [{ text: 'Shelf position drives a meaningful share of sales in these outlets.', why: 'If shelf position matters little, the rival’s gains come from something else, such as credit or price.', how: 'Review evidence on how shelf placement affects sales in similar outlets.', check: 'platform retail studies', result: 'Retail evidence for comparable outlets shows eye-level placement lifts sales, so the assumption is reasonable.' }];
      gap('What incentives is the rival offering retailers in ' + place.name + '?', 'If it’s credit or extra margin, matching price alone won’t win the shelf back.', 15,
        function (n) { var c = Math.round(n * 0.6); return c + ' of ' + n + ' retailers said the rival offers longer credit; others mentioned free display stands or bonus stock.'; },
        ['Says the rival offers longer credit.', 'Mentions free display stands or bonus stock.'], 0.6);
      a.fu = [['What if we offered retailers 14 days’ credit?', 'scenario'], ['Which outlets switched to the rival?', 'ask'], ['How does ' + place.name + ' compare with ' + other.name + '?', 'compare'], ['Is the rival also cheaper on smaller packs?', 'ask']];
    } else if (intent === 'consumer') {
      a.paras = [
        'Demand looks steady, but how people buy is shifting. In ' + place.name + ', more shoppers are buying smaller packs more often, especially around ' + A[0] + '.',
        'That favours products sold in sachets and small sizes, and it puts pressure on larger packs even when shoppers still like the brand.',
        'What I don’t know yet is whether this is a short-term response to prices or a lasting habit.'
      ];
      a.ev = [
        { chip: 'Shopper survey', text: 'About ' + between(r, 35, 60) + '% of shoppers asked in ' + place.name + ' now buy smaller packs more often than a year ago.', src: 'Platform shopper evidence · ' + month + ' 2026' },
        { chip: 'Your sales records', you: true, text: 'Your small-pack sales are up about ' + pct1 + '% while large packs are down ' + pct2 + '%.', src: 'Your sales records · ' + month + ' – Oct 2026' }
      ];
      a.chart = { kind: 'diverge', title: 'Sales are shifting from large packs to small packs', sub: 'Change in your sales volume by pack size, % · ' + place.name + ', ' + (month === 'October' ? 'last four weeks' : month + ' to October 2026'), rows: [{ label: 'Small packs', v: pct1 }, { label: 'Medium packs', v: -between(r, 1, 4) }, { label: 'Large packs', v: -pct2 }], src: 'Source: your sales records; Verisavo shopper evidence (simulated)' };
      a.assumptions = [{ text: 'Shoppers who moved to smaller packs still buy the same brand.', why: 'If shoppers are switching brand as well as pack size, the problem is loyalty, not pack size.', how: 'Look at repeat purchases among shoppers who changed pack size.', check: 'your loyalty data', result: 'Most shoppers who switched pack size stayed with your brand.' }];
      gap('Are shoppers in ' + place.name + ' moving to smaller packs for good, or only while prices are high?', 'It decides whether to invest in small packs long term or treat this as temporary.', 25,
        function (n) { var l = Math.round(n * 0.64); return l + ' of ' + n + ' shoppers said they would keep buying smaller packs even if prices fell.'; },
        ['Would keep buying smaller packs even if prices fell.', 'Would go back to larger packs if prices fell.'], 0.64);
      a.fu = [['What if we launched a smaller pack in ' + place.name + '?', 'scenario'], ['Where are small packs selling fastest?', 'ask'], ['How does ' + place.name + ' compare with ' + other.name + '?', 'compare'], ['Which shoppers are switching pack size?', 'ask']];
    } else if (intent === 'entry') {
      a.paras = [
        place.name + ' looks promising, but the evidence is thinner than for markets you already sell in. Platform evidence shows ' + between(r, 4, 9) + ' comparable products already on shelves, with demand concentrated around ' + A[0] + ' and ' + A[1] + '.',
        'The main risks are distribution coverage and winning shelf space from established brands. Price looks less of a barrier than reach.',
        'Before deciding, it would help to know which distributors could carry you and on what terms.'
      ];
      a.ev = [
        { chip: 'Market scan · ' + place.name, text: 'Comparable products are stocked in most larger outlets, but coverage of small shops is patchy.', src: 'Platform market scan · ' + month + ' 2026' },
        { chip: 'Public records', text: 'Several registered distributors operate in ' + place.name + ' for this category.', src: 'Business registry records · 2026' }
      ];
      a.chart = { kind: 'bars', title: 'Established brands reach large stores, but small shops in ' + place.name + ' are patchily covered', sub: '% of outlets stocking comparable products, by outlet type · ' + place.name, rows: [{ label: 'Supermarkets', v: between(r, 80, 92) }, { label: 'Mid-size shops', v: between(r, 55, 68) }, { label: 'Open markets', v: between(r, 30, 42), hl: true }, { label: 'Kiosks', v: between(r, 20, 32), hl: true }], fmt: '%', note: 'Highlighted: where a new entrant has most room.', src: 'Source: Verisavo platform market scan, ' + month + ' 2026 (simulated)' };
      a.assumptions = [{ text: 'Demand in ' + place.name + ' looks like your existing markets.', why: 'If demand is weaker or different, sales forecasts based on your current markets would be too high.', how: 'Compare demand indicators for ' + place.name + ' with your existing markets.', check: 'platform demand indicators', result: 'Demand indicators for ' + place.name + ' sit within the range of your existing markets.' }];
      gap('Which distributors in ' + place.name + ' could carry ' + product + ', and on what terms?', 'Without a distributor, a launch can’t reach the small shops where most volume is.', 15,
        function (n) { var w = Math.round(n * 0.4); return w + ' of ' + n + ' distributors contacted in ' + place.name + ' said they would consider carrying a new brand, mostly on 30-day credit.'; },
        ['Would consider carrying a new brand on 30-day credit.', 'Not taking on new brands at the moment.'], 0.4);
      a.fu = [['What if we launched in ' + place.name + ' with two distributors?', 'scenario'], ['Which areas of ' + place.name + ' should we start in?', 'ask'], ['How does ' + place.name + ' compare with ' + other.name + '?', 'compare'], ['Who are the main brands there?', 'ask']];
    } else if (intent === 'scenario') {
      var action = (q.match(/what if (?:we |i )?(.+?)\??$/i) || [null, 'make that change'])[1].replace(/\bour\b/gi, 'your').replace(/\bwe\b/gi, 'you').replace(/\bus\b/gi, 'you');
      var lo = between(r, 2, 6), hi = lo + between(r, 5, 11), mid = Math.round((lo + hi) / 2);
      a.paras = [
        'If you ' + action.replace(/\?$/, '') + ', sales volume in ' + place.name + ' could rise by around ' + mid + '% over 12 weeks compared with doing nothing, though the range is wide, from about ' + lo + '% to ' + hi + '%.',
        'That rests on two assumptions: that shoppers notice the change, and that shops have stock to sell. If either turns out to be weak, most of the gain disappears.'
      ];
      a.tiles = [['Avg of runs', '+' + mid + '%', 'sales volume vs no change'], ['Range', lo + '–' + hi + '%', 'across simulation runs'], ['Evidence base', 'Limited', 'two assumptions untested']];
      var bins = [], cats = [];
      for (var b = 0; b <= 20; b += 2) { cats.push(b + '%'); var d = (b + 1 - mid) / ((hi - lo) / 2 + 1.5); bins.push(Math.max(2, Math.round(110 * Math.exp(-d * d / 2)))); }
      var tot = bins.reduce(function (x, y) { return x + y; }, 0); bins = bins.map(function (x) { return Math.round(x / tot * 500); });
      a.chart = { kind: 'cols', title: 'Most simulated outcomes fall between ' + lo + '% and ' + hi + '% growth', sub: 'Number of simulation runs, by change in sales volume over 12 weeks vs no change · ' + place.name + ', 500 runs', cats: cats, vals: bins, hl: cats.map(function (c, k) { return k * 2 + 1 >= lo && k * 2 + 1 <= hi ? k : -1; }).filter(function (k) { return k >= 0; }), small: true, note: 'Assumes shoppers notice the change and shops have stock to sell.', src: 'Source: Verisavo Market Simulator (simulated)' };
      a.ev = [{ chip: 'Simulation · 500 runs', text: 'Simulated outcomes for ' + place.name + ' under current evidence and the stated assumptions.', src: 'Market Simulator · assumptions visible' }];
      a.assumptions = [{ text: 'Shops in ' + place.name + ' will have stock to sell when demand rises.', why: 'If shops run out, extra demand turns into lost sales and most of the simulated gain disappears.', how: 'Check recent stock levels in the shops this scenario depends on.', check: 'recent availability evidence', result: 'Recent evidence shows patchy stock in smaller shops, so this assumption only partly holds.' }];
      gap('Would shops in ' + place.name + ' actually stock more if this changed?', 'This is the assumption the scenario depends on most.', 15,
        function (n) { var y = Math.round(n * 0.53); return y + ' of ' + n + ' shopkeepers in ' + place.name + ' said they would stock more; the rest said cash flow limits them.'; },
        ['Would stock more if this changed.', 'Says cash flow limits how much they stock.'], 0.53);
      a.fu = [['What if we did this in ' + other.name + ' too?', 'scenario'], ['What would it cost us?', 'ask'], ['What is this scenario assuming?', 'assumptions']];
    } else if (intent === 'compare') {
      var av1 = between(r, 30, 70), pg1 = between(r, 5, 15), pg2 = between(r, 3, 12);
      a.paras = [
        other.name + ' has much less evidence than ' + place.name + ', so this comparison is uneven. Where ' + other.name + ' has nothing yet, I’ve marked it unknown rather than guessing.',
        'On what we can compare, prices look similar, but ' + place.name + ' has the clearer availability problem.'
      ];
      a.table = [['Measure', place.name, other.name], [cap(product) + ' on shelves', av1 + '% of outlets', 'Unknown'], ['Price gap to closest rival', 'About ' + pg1 + '% higher', 'About ' + pg2 + '% higher'], ['Delivery delays', between(r, 2, 5) + ' days late on average', 'Unknown']];
      a.chart = { kind: 'pairs', title: place.name + ' has the clearer availability problem; ' + other.name + ' still has gaps in the evidence', sub: 'Selected measures, % · ' + place.name + ' vs ' + other.name, series: [place.name, other.name],
        rows: [{ label: 'On shelves, % of outlets', a: av1, b: null }, { label: 'Price gap to rival, %', a: pg1, b: pg2, max: 30 }], fmt: '%', note: 'Unknown: not yet measured. Shown rather than estimated.', src: 'Source: Verisavo retail price observations and Ground-Level Intelligence, Oct 2026 (simulated)' };
      a.ev = [{ chip: 'Retail prices · both cities', text: 'Price gaps measured in both ' + place.name + ' and ' + other.name + '.', src: 'Retail price observations · Oct 2026' }];
      a.assumptions = [{ text: 'The two cities sell the same pack sizes.', why: 'If pack sizes differ, the price and availability comparison is not like for like.', how: 'Compare product listings in both cities.', check: 'platform product listings', result: 'Both cities list the same main pack sizes.' }];
      gap('Is ' + product + ' on shelves in ' + other.name + '?', 'Without it, you can’t tell whether ' + other.name + ' has the same availability problem.', 25,
        function (n) { var s = Math.round(n * 0.7); return product + ' was on the shelf in ' + s + ' of ' + n + ' outlets checked in ' + other.name + '.'; },
        ['On the shelf.', 'Out of stock.'], 0.7, other);
      a.fu = [['Why is ' + other.name + ' different?', 'ask'], ['What if we moved stock from ' + other.name + ' to ' + place.name + '?', 'scenario'], ['Which city should we prioritise?', 'ask']];
    } else if (intent === 'assumptions') {
      a.paras = ['The latest answer rests on two assumptions. If either is wrong, the conclusion could change, so these are the first things worth testing.'];
      a.assumptions = [
        { text: 'The outlets checked are typical of ' + place.name + ' as a whole.', why: 'If they are not typical, the pattern may not hold across the city.', how: 'Compare the outlets checked with the wider outlet mix.', check: 'platform outlet coverage', result: 'The outlets checked match the mix of shop types, so this holds.' },
        { text: 'Your own prices stayed the same over the period.', why: 'If your prices rose, that could help explain the change instead of availability.', how: 'Compare recorded prices before and during the period.', check: 'your pricing records', result: 'Your pricing records show no change over the period.' }
      ];
      a.ev = [];
      gap('Are the outlets checked typical of ' + place.name + '?', 'If they aren’t, the pattern might not hold across the city.', 25,
        function (n) { return 'A wider check of ' + n + ' outlets across ' + place.name + ' showed the same pattern.'; }, ['Matches the earlier pattern.', 'Differs from the earlier pattern.'], 0.85);
      a.fu = [['Which assumption matters most?', 'ask'], ['How would the answer change if prices rose?', 'scenario']];
    } else if (intent === 'investigate') {
      a.paras = ['Here’s how I’d set that up. Nothing is sent until you confirm.'];
      a.investigateNow = true;
      gap(q.replace(/\?$/, '') + '?', 'You asked for this to be checked on the ground.', 15,
        function (n) { var y = Math.round(n * 0.6); return y + ' of ' + n + ' responses in ' + place.name + ' confirmed the issue; the rest did not.'; }, ['Confirmed the issue.', 'Did not see the issue.'], 0.6);
      a.fu = [['What will this cost?', 'ask'], ['How long will it take?', 'ask']];
    } else if (/which area|what area|which part|where .*worst|worst affected|which neighbourhood|which district|hotspot/.test(t)) {
      var w1 = between(r, 55, 70), w2 = between(r, 30, 45), w3 = between(r, 10, 22);
      a.paras = [
        'The weakness is not spread evenly across ' + place.name + '. ' + A[0] + ' is where ' + product + ' is missing most often: it was off the shelf in about ' + w1 + '% of the smaller outlets checked there, against ' + w2 + '% in ' + A[1] + ' and ' + w3 + '% in ' + A[2] + '.',
        A[0] + ' and ' + A[1] + ' are served by the same two distributors, so the pattern points at a route or delivery problem rather than at shoppers in one area losing interest.',
        'What I can’t confirm from the evidence is whether the worst-hit outlets share a distributor, or whether they simply reorder in smaller quantities.'
      ];
      a.ev = [
        { chip: 'SavoScouts · ' + outlets(n1), sig: true, text: Product + ' was missing from ' + Math.round(Math.round(n1 * 0.45) * w1 / 100) + ' of ' + Math.round(n1 * 0.45) + ' smaller outlets checked in ' + A[0] + ', the highest of the three areas.', src: 'Ground-Level · ' + n1 + ' verified responses · Oct 2026' },
        { chip: 'Distribution records', text: A[0] + ' and ' + A[1] + ' are covered by the same two distributors; ' + A[2] + ' is served separately.', src: 'Your company data · distributor coverage' }
      ];
      a.chart = { kind: 'bars', title: A[0] + ' is where ' + product + ' is missing most often', sub: '% of smaller outlets without ' + product + ' on the shelf, by area · ' + place.name, rows: [{ label: A[0], v: w1 }, { label: A[1], v: w2 }, { label: A[2], v: w3 }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence (simulated)' };
      a.assumptions = [{ text: 'The outlets checked in each area are typical of that area.', why: 'If scouts visited the busiest streets only, quieter outlets may look different.', how: 'Compare outlet types across the three areas.', check: 'outlet mix in the responses', result: 'The outlet mix is similar across the three areas.' }];
      gap('Which areas of ' + place.name + ' are worst affected, and do they share the same distributor or route?', 'If the weak areas sit on one route, the problem is logistics rather than demand.', 15,
        function (n) { var y = Math.round(n * 0.7); return y + ' of ' + n + ' outlets in ' + A[0] + ' named the same distributor and reported late or missed deliveries.'; }, ['Same distributor, late deliveries.', 'Different suppliers or no delay.'], 0.7);
      a.fu = [['Why is ' + A[0] + ' running out more than ' + A[2] + '?', 'ask'], ['When did the drop start?', 'ask'], ['How does ' + place.name + ' compare with ' + other.name + '?', 'compare']];
    } else if (/when did|since when|how long|start(ed)? (falling|dropping|slowing)|timeline|when .*(start|begin)/.test(t)) {
      var wk = between(r, 6, 10), m0 = MONTHS.indexOf(month), mPrev = MONTHS[(m0 + 11) % 12];
      a.paras = [
        'The slide in ' + place.name + ' is about ' + wk + ' weeks old. Sell-out in smaller outlets was steady through ' + mPrev + ', then fell in the second half of ' + month + ' and has not recovered.',
        'Two things happened in the same fortnight: distributor deliveries to ' + A[0] + ' began arriving late, and the rival moved to a lower shelf price in ' + A[1] + '. Either could have started it.',
        'What I can’t tell you yet is which came first in the shops themselves, and that decides whether this is a supply problem or a price problem.'
      ];
      a.ev = [
        { chip: 'Sales data', text: 'Weekly sell-out of ' + product + ' in smaller ' + place.name + ' outlets fell ' + between(r, 18, 31) + '% between the first and last week of ' + month + '.', src: 'Your company data · weekly sell-out' },
        { chip: 'Retail prices', text: 'The rival’s shelf price in ' + A[1] + ' dropped by about ' + pct2 + '% in the same fortnight.', src: 'Retail price observations · ' + month + ' – Nov 2026' }
      ];
      a.chart = { kind: 'cols', title: 'Sell-out held through ' + mPrev + ', then fell in ' + month, sub: 'Weekly sell-out of ' + product + ', smaller outlets · ' + place.name + ' (index, first week = 100)', vals: [100, between(r, 97, 103), between(r, 96, 102), between(r, 88, 95), between(r, 78, 86), between(r, 70, 80), between(r, 68, 78), between(r, 66, 76)], cats: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], hl: [3], fmt: '', src: 'Source: your company sales data (simulated)' };
      a.assumptions = [{ text: 'Late deliveries began before the price gap widened.', why: 'If the price move came first, restocking faster will not bring volume back on its own.', how: 'Ask shopkeepers which they noticed first.', check: 'retailer interviews', result: 'Most shopkeepers noticed empty shelves before they noticed the rival’s price.' }];
      gap('When did the change in ' + place.name + ' start, and did it follow a delivery, price or competitor move?', 'Timing separates a supply problem from a shift in what shoppers want.', 15,
        function (n) { var y = Math.round(n * 0.64); return y + ' of ' + n + ' shopkeepers dated the change to the late deliveries, not to the rival’s price.'; }, ['Started with late deliveries.', 'Started with the rival’s price.'], 0.64);
      a.fu = [['Which areas of ' + place.name + ' are worst affected?', 'ask'], ['What if we matched the rival’s price?', 'scenario'], ['Why are smaller shops running out of ' + product.replace('your ', '') + '?', 'ask']];
    } else if (/how many|what share|how much of|penetration|coverage|how widely|which outlets stock/.test(t)) {
      var c1 = between(r, 80, 92), c2 = between(r, 42, 58), c3 = between(r, 30, 46);
      a.paras = [
        'Coverage is the clearest part of the picture. In ' + place.name + ', ' + product + ' is stocked by about ' + c1 + '% of larger stores, ' + c2 + '% of smaller shops and ' + c3 + '% of open-market stalls checked.',
        'The rival is on the shelf in roughly nine out of ten outlets of every type, so the gap is almost entirely in the small-format channel where most everyday volume is bought.',
        'What I can’t tell you from this is whether the outlets that don’t stock it dropped it recently or never carried it.'
      ];
      a.ev = [
        { chip: 'SavoScouts · ' + outlets(n1), sig: true, text: Product + ' was on the shelf in ' + c2 + '% of smaller shops and ' + c3 + '% of market stalls checked in ' + place.name + '.', src: 'Ground-Level · ' + n1 + ' verified responses · Oct 2026' },
        { chip: 'Retail listings', text: 'The closest rival is listed by about ' + between(r, 88, 95) + '% of outlets across all types.', src: 'Platform retail listings · Nov 2026' }
      ];
      a.chart = { kind: 'pairs', title: Product + ' reaches most large stores but under half of small outlets', sub: '% of outlets stocking each product, by outlet type · ' + place.name, series: [Product, 'Closest rival'], rows: [{ label: 'Larger stores', a: c1, b: between(r, 88, 95) }, { label: 'Smaller shops', a: c2, b: between(r, 86, 94) }, { label: 'Open markets', a: c3, b: between(r, 84, 93) }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence and platform retail listings (simulated)' };
      a.assumptions = [{ text: 'Outlets that do not stock it today would sell it if supplied.', why: 'If they dropped it for a reason, coverage will not recover by supply alone.', how: 'Ask non-stocking outlets why.', check: 'retailer interviews', result: 'Most non-stocking outlets said supply, not demand, was the reason.' }];
      gap('What share of outlets in ' + place.name + ' stock ' + product + ' today, by outlet type?', 'A coverage count shows whether the issue is reach or sell-through.', 25,
        function (n) { var y = Math.round(n * 0.58); return y + ' of ' + n + ' outlets mapped did not stock ' + product + '; most said it was never offered to them.'; }, ['Not stocked; never offered.', 'Stocked or dropped by choice.'], 0.58);
      a.fu = [['Which distributors could carry ' + product.replace('your ', '') + ' into small shops?', 'ask'], ['Which areas of ' + place.name + ' are worst affected?', 'ask']];
    } else if (/quality|complain|fake|counterfeit|trust|expired|damaged/.test(t)) {
      var qc = between(r, 4, 12);
      a.paras = [
        'There is little sign of a quality problem in ' + place.name + '. Of the shopkeepers interviewed, only ' + qc + '% mentioned complaints about ' + product + ', and none reported counterfeit packs.',
        'Where complaints did come up they were about packaging damage on delivery, which sits with the distributor rather than the product.',
        'What I can’t rule out is a quieter trust issue among shoppers, because the evidence here is from retailers, not from shoppers themselves.'
      ];
      a.ev = [
        { chip: 'Retailer interviews', text: qc + '% of ' + n1 + ' shopkeepers in ' + place.name + ' mentioned complaints about ' + product + '; none mentioned counterfeits.', src: 'Ground-Level · ' + n1 + ' verified responses · Oct 2026' },
        { chip: 'Public records', text: 'No regulator notice or recall involving ' + product + ' in the last twelve months.', src: 'Public records · NAFDAC notices' }
      ];
      a.assumptions = [{ text: 'Retailer reports reflect what shoppers experience.', why: 'Shoppers may stop buying without ever complaining to the shop.', how: 'Ask shoppers directly at the shelf.', check: 'shopper feedback', result: 'Shoppers raised price and availability, not quality.' }];
      gap('Are shoppers or retailers in ' + place.name + ' reporting quality, expiry or counterfeit problems with ' + product + '?', 'A trust problem will not respond to pricing or distribution fixes.', 25,
        function (n) { var y = Math.round(n * 0.9); return y + ' of ' + n + ' shoppers reported no quality concern; the rest mentioned damaged packs.'; }, ['No quality concern.', 'Mentioned a quality concern.'], 0.9);
      a.fu = [['Why are smaller shops running out of ' + product.replace('your ', '') + '?', 'ask'], ['What if we matched the rival’s price?', 'scenario']];
    } else {
      a.paras = [
        'Here’s what the evidence suggests for ' + place.name + '. ' + Product + ' is holding up in larger stores but losing ground in smaller shops and open markets, where it is stocked less consistently.',
        'Two things seem to drive this: gaps in restocking for smaller outlets, and a cheaper rival that is easier to find. Neither explains everything on its own.',
        'What I can’t tell you yet is which of the two matters more.'
      ];
      a.ev = [
        { chip: 'SavoScouts · ' + outlets(n1), sig: true, text: Product + ' was missing from ' + k1 + ' of ' + n1 + ' smaller outlets checked in ' + place.name + '.', src: 'Ground-Level · ' + n1 + ' verified responses · Oct 2026' },
        { chip: 'Retail prices', text: 'The closest rival is about ' + pct1 + '% cheaper on average.', src: 'Retail price observations · ' + month + ' – Nov 2026' }
      ];
      a.chart = { kind: 'pairs', title: Product + ' holds up in larger stores but loses ground in smaller shops and open markets', sub: '% of outlets with each product on the shelf, by outlet type · ' + place.name, series: [Product, 'Closest rival'],
        rows: [{ label: 'Larger stores', a: between(r, 82, 92), b: between(r, 84, 94) }, { label: 'Smaller shops', a: between(r, 40, 55), b: between(r, 78, 90) }, { label: 'Open markets', a: between(r, 35, 50), b: between(r, 75, 88) }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence and platform retail listings (simulated)' };
      a.assumptions = [{ text: 'Larger stores and smaller shops serve different shoppers.', why: 'If the same shoppers use both, losing small shops may simply move sales to larger stores rather than lose them.', how: 'Check whether shoppers in each channel overlap.', check: 'platform shopper evidence', result: 'Shopper evidence confirms the two channels reach mostly different shoppers.' }];
      gap('Is availability or price driving the change in ' + place.name + '?', 'The fix is different: restocking for one, pricing for the other.', 15,
        function (n) { var av = Math.round(n * 0.62); return av + ' of ' + n + ' shopkeepers said shoppers leave because the product isn’t there, not because of price.'; },
        ['Shoppers leave because it isn’t on the shelf.', 'Shoppers leave because of price.'], 0.62);
      a.fu = [['Why are smaller shops running out of ' + product.replace('your ', '') + '?', 'ask'], ['What if we matched the rival’s price?', 'scenario'], ['How does ' + place.name + ' compare with ' + other.name + '?', 'compare'], ['Which areas of ' + place.name + ' are worst affected?', 'ask']];
    }
    return a;
  }

  /* =========================================================
     The opening conversation (scripted)
     ========================================================= */
  var KANO = PLACES[0];
  var IN_STOCK = [2, 5, 9, 12, 15, 18, 21, 23, 25], RIVAL_OUT = [7, 19], KIOSKS = [];
  for (var i = 0; i < 26; i++) {
    var yIn = IN_STOCK.indexOf(i) >= 0, rIn = RIVAL_OUT.indexOf(i) < 0, mins = 540 + (i % 9) * 55 + (i * 7) % 20;
    KIOSKS.push({ name: 'Kiosk ' + String(i + 1).padStart(2, '0'), area: i % 2 === 0 ? 'Dawanau, Kano' : 'Kurmi Market, Kano', verified: true, problem: !yIn,
      time: (Math.floor(i / 9) + 1) + ' Nov, ' + Math.floor(mins / 60) + ':' + String(mins % 60).padStart(2, '0'),
      sentence: 'Your 1kg pack was ' + (yIn ? 'on the shelf' : 'not on the shelf') + '. The rival 500g pack was ' + (rIn ? 'on the shelf.' : 'not on the shelf.') });
  }
  KIOSKS.reverse();


  function mainAnswer() {
    return {
      id: 'a0', at: Date.now() - 42 * 60000, q: 'Why have our detergent sales slowed in Kano over the last eight weeks?', intent: 'main', place: KANO, product: 'your 1kg detergent pack', scripted: true,
      status: 'done', shown: 9999,
      paras: [
        'It looks like the main problem is availability rather than price. When SavoScouts checked 26 kiosks in Dawanau and Kurmi Market, your 1kg pack was missing from 17 of them, while the rival 500g pack was on the shelf in almost every one.',
        'That lines up with your delivery records. Deliveries to Dawanau distributors have been running about four days late since the October route closures, so kiosks are probably selling out before new stock arrives. The rival pack is around 12% cheaper, which likely wins some shoppers where both packs are on the shelf, but on its own it doesn’t explain a drop this size.',
        'What I can’t tell you yet is why the kiosks are running out. It could be the late deliveries, or distributors giving other brands priority, and that’s worth knowing before you change your price.'
      ],
      ev: [
        { chip: 'SavoScouts · 26 kiosks', sig: true, text: 'Your 1kg pack was out of stock in 17 of 26 kiosks checked. The rival 500g pack was in stock in 24.', src: 'Ground-Level · 26 verified responses with photos · 1–3 Nov 2026', resp: 'kiosk' },
        { chip: 'Your delivery records', you: true, text: 'Deliveries to Dawanau distributors have averaged four days late since the October route closures.', src: 'Distributor delivery records · Oct 2026' },
        { chip: 'Wholesale prices', text: 'A rival 500g pack has been listed about 12% cheaper at three Kano wholesalers since September.', src: 'Wholesale price observations · 3 outlets · Sep 2026' }
      ],
      chart: { kind: 'pairs', title: 'Your 1kg pack is missing from most kiosks, while the rival is almost always stocked', sub: '% of kiosks with each pack on the shelf · Kano, 26 kiosks checked', series: ['Your 1kg pack', 'Rival 500g pack'], rows: [{ label: 'Dawanau', a: 23, b: 100 }, { label: 'Kurmi Market', a: 46, b: 85 }, { label: 'All kiosks', a: 35, b: 92, total: true }], fmt: '%', src: 'Source: Verisavo Ground-Level Intelligence; 26 verified SavoScout responses, 1–3 Nov 2026' },
      assumptions: [{ text: 'Your own shelf prices have stayed the same over the period.', why: 'If your prices rose, that could help explain the drop in sales.', how: 'Compare recorded shelf prices before and during the slowdown.', check: 'your pricing records', result: 'Your shelf price for the 1kg pack has not changed since August.' }],
      gap: { q: 'Why are kiosks running out: late deliveries, or distributors favouring other brands?', why: 'If distributors are prioritising other brands, fixing delivery timing alone won’t bring your pack back to the shelf.', n: 15, state: 'open',
        found: function (n) { return Math.round(n * 0.73) + ' of ' + n + ' Dawanau distributors say restocks are late because supplier deliveries arrive late. ' + Math.max(1, Math.round(n * 0.2)) + ' say they give shelf priority to other brands.'; },
        update: 'Since then, distributors have filled in the missing piece. Most say restocks are late because their own supplier deliveries arrive late, not because they favour other brands. So restock timing is the clearest place to start.',
        resp: ['Restocks are late because supplier deliveries arrive late.', 'Shelf space goes to other brands first.'], share: 0.73 },
      history: [{ q: 'Are your packs on kiosk shelves in Dawanau and Kurmi Market?', note: 'Answered by 26 verified SavoScout responses · 3 Nov' }],
      fu: [['What if we restock kiosks weekly in Dawanau?', 'scenario'], ['How does Kano compare with Kaduna?', 'compare'], ['Which distributors are most affected by the delays?', 'distribution'], ['What would it take to restock kiosks faster?', 'distribution'], ['Are other pack sizes affected in Kano?', 'consumer']]
    };
  }

  var ACTIONS_MENU = [
    { id: 'investigate', label: 'Set up an investigation', icon: 'search', ph: 'Describe what you need checked on the ground…' },
    { id: 'scenario', label: 'Run a scenario', icon: 'branch', ph: 'What if…? For example, we restock kiosks weekly' },
    { id: 'compare', label: 'Compare markets', icon: 'scale', ph: 'Which markets should we compare?' },
    { id: 'assumptions', label: 'Check assumptions', icon: 'flask', ph: 'Which conclusion should we test?' }
  ];
  var TAGS = { price: 'Pricing', distribution: 'Availability', competitor: 'Competition', consumer: 'Shoppers', entry: 'Market entry', scenario: 'Scenario', compare: 'Comparison', assumptions: 'Assumptions', investigate: 'Investigation', general: 'Answer' };
  var THINK = { price: 'Checking prices across outlets…', distribution: 'Checking stock and deliveries…', competitor: 'Looking at the competition…', consumer: 'Looking at how people buy…', entry: 'Scanning the market…', scenario: 'Running the scenario…', compare: 'Comparing the markets…', assumptions: 'Checking what the answer depends on…', investigate: 'Drafting the investigation…', general: 'Connecting the evidence…' };

  /* =========================================================
     State
     ========================================================= */
  var timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function clearAll() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }

  function blank(title) { var b = initial(); b.answers = []; b.active = null; b.log = []; b.title = title || 'New question'; b.notifs = S ? S.notifs : b.notifs; return b; }
  function initial() {
    return {
      title: 'Detergent sales in Kano', answers: [mainAnswer()], active: 'a0', mode: 'ask',
      sheet: null, hl: null, plan: null, modal: null, filter: 'find', sf: 'all',
      toast: '', menu: false, bell: false, plus: false, more: false, yourData: true,
      log: [
        { t: 'Question asked', s: 'Detergent sales in Kano · 1 Nov', k: '' },
        { t: '3 sources connected', s: 'Evidence base: Moderate', k: '' },
        { t: 'Gap identified', s: 'Kiosk availability unknown', k: 'k' },
        { t: 'Investigated by SavoScouts', s: '26 of 30 responses verified · 3 Nov', k: 'k' },
        { t: 'Understanding updated', s: 'Availability now the main cause · Strong', k: 'k' }
      ],
      notifs: [{ id: 'n0', title: 'Investigation complete', text: 'Kiosk stock in Dawanau and Kurmi Market · 26 of 30 responses verified', when: '3 Nov', act: 'openResp', arg: 'kiosk', actLabel: 'View responses', unread: true }]
    };
  }
  var S = initial();
  var CONVS = {}, CUR = 'kano', RECENT = [
    { k: 'kano', t: 'Detergent sales in Kano' },
    { k: 'oil', t: 'Cooking oil prices in Accra', q: 'Is our cooking oil too expensive in Accra?' },
    { k: 'abuja', t: 'Detergent stockouts in Kano', q: 'Are kiosks in Kano running out of our detergent?' }
  ];
  function openConv(k) {
    if (k === CUR) { set({ menu: false }); return; }
    if (CUR) CONVS[CUR] = S;
    var item = RECENT.filter(function (x) { return x.k === k; })[0]; if (!item) return;
    var notifs = S.notifs;
    CUR = k;
    if (CONVS[k]) S = CONVS[k];
    else if (k === 'kano') S = initial();
    else { S = blank(item.t); }
    S.notifs = notifs; S.menu = false; S.sheet = null; S.modal = null; S.plan = S.plan || null;
    render(); BODY.scrollTop = 0;
    var cv = $('convo'); if (cv) { cv.classList.remove('conv-swap'); void cv.offsetWidth; cv.classList.add('conv-swap'); }
    if (!document.getElementById('conv-swap-css')) { var cs2 = document.createElement('style'); cs2.id = 'conv-swap-css'; cs2.textContent = '#va #convo.conv-swap{animation:convSwap .35s ease both}@keyframes convSwap{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){#va #convo.conv-swap{animation:none}}'; document.head.appendChild(cs2); }
    if (!CONVS[k] && item.q && !S.answers.length) ask(item.q);
  }
  (function () { var nb = document.getElementById('va-new'); if (nb) nb.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); newQuestion(); }, true); })();
  function newQuestion() {
    S.bub = null; S.bubLbl = false;
    if (CUR) CONVS[CUR] = S;
    CUR = null; S = blank('New question');
    $('ask').value = ''; autosize(); render(); BODY.scrollTop = 0; $('ask').focus();
  }
  var seen = {};
  function fx(key, cls) { if (seen[key]) return ''; seen[key] = 1; return ' ' + (cls || 'fade'); }
  function unsee(prefix) { Object.keys(seen).forEach(function (k) { if (k.indexOf(prefix) === 0) delete seen[k]; }); }
  function set(p) { Object.assign(S, p); render(); }
  function A(id) { return S.answers.filter(function (a) { return a.id === String(id); })[0]; }
  function last() { return S.answers[S.answers.length - 1] || null; }
  function pushNotif(n) { n.id = 'n' + Date.now() + Math.random(); n.unread = true; n.when = n.when || 'Just now'; S.notifs.unshift(n); }
  function log(t, s, k) { S.log.push({ t: t, s: s, k: k || 'k' }); }
  var toastT;
  function notify(m) { S.toast = m; renderToast(); clearTimeout(toastT); toastT = setTimeout(function () { S.toast = ''; renderToast(); }, 2600); }

  function spent() {
    var all = [S]; Object.keys(CONVS).forEach(function (k) { if (CONVS[k] !== S) all.push(CONVS[k]); });
    return all.reduce(function (t, c) { return t + c.answers.reduce(function (s, a) { return s + (a.gap && (a.gap.state === 'closed' || a.gap.state === 'running' || a.gap.state === 'ready') && a.gap.total ? a.gap.total * RATE : 0); }, 0); }, 0);
  }
  function anyRunning() { return S.answers.some(function (a) { return a.gap && a.gap.state === 'running'; }); }
  function openGaps() { return S.answers.filter(function (a) { return a.status === 'done' && a.gap && a.gap.state === 'open' && !a.investigateNow; }).length; }
  function asVerdict(x) { var v = x.verdict || (/doesn[’']t hold|does not hold|not hold/i.test(x.result || '') ? 'no' : /partly|partial|mixed/i.test(x.result || '') ? 'partly' : 'holds'); return v === 'no' ? ['Doesn’t hold', 'bad'] : v === 'partly' ? ['Partly holds', 'part'] : ['Holds', 'ok']; }
  function strength(a) { var n = a.ev.length + (a.gap && a.gap.state === 'closed' ? 1 : 0); return n >= 4 ? ['Strong', 4] : n >= 3 ? ['Strong', 4] : n === 2 ? ['Moderate', 3] : ['Limited', 2]; }

  /* =========================================================
     Rendering
     ========================================================= */
  /* drag the half-height panel: up brings it back in full, down closes it */
  (function () {
    var y0 = null;
    document.addEventListener('touchstart', function (e) { var t = e.target.closest && e.target.closest('#va aside.sheet.half .grab, #va aside.sheet.half .shead'); y0 = t ? e.touches[0].clientY : null; }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (y0 === null) return; var dy = e.changedTouches[0].clientY - y0; y0 = null;
      if (dy < -24) set({ half: false }); else if (dy > 40) { S.srcView = null; set({ sheet: null, hl: null, half: false }); }
    }, { passive: true });
  })();
  /* a gap shows the question it came from and the headline answer, so there is no need to leave the panel; the full chat is one tap away */
  function gPrev(it) {
    var qa = A(it.aid), p = qa && qa.paras && qa.paras[0] ? trunc(qa.paras[0], 170) : '';
    return '<div class="gprev"><p class="gpq">' + esc(it.from) + '</p>' + (p ? '<p class="gpa">' + esc(p) + '</p>' : '') + '<button type="button" class="gjump" data-act="jumpQ" data-arg="' + it.aid + '">See full answer in chat</button></div>';
  }
  /* on phones, leaving Market Understanding for the chat shrinks it into a floating bubble; one tap brings it back where you were */
  var bubT = null;
  function leavePanel() { if (innerWidth < 760 && S.sheet) { var sb0 = MAIN.querySelector('#sheet .sbody'); S.bub = { sheet: S.sheet, top: sb0 ? sb0.scrollTop : 0, src: S.srcView }; S.bubLbl = true; clearTimeout(bubT); bubT = setTimeout(function () { S.bubLbl = false; renderBubble(); }, 2400); } }
  function renderBubble() {
    if (!MAIN) return;
    var host = document.getElementById('vbub');
    if (!host) { host = document.createElement('div'); host.id = 'vbub'; MAIN.appendChild(host); }
    if (S.sheet) S.bub = null;
    var on = S.bub && !S.sheet && !S.modal && innerWidth < 760;
    if (!on) { host.innerHTML = ''; host.hidden = true; return; }
    var n = S.answers.filter(function (x) { return x.status === 'done' && x.gap && x.gap.state === 'open'; }).reduce(function (k, x) { return k + gapList(x).length; }, 0);
    var key = (S.bubLbl ? 'l' : '') + n;
    if (host.getAttribute('data-k') === key && !host.hidden) return;
    host.setAttribute('data-k', key); host.hidden = false;
    host.innerHTML = '<button type="button" class="vbub-b" data-act="bubOpen" aria-label="Back to Market Understanding">' + ic('layers', 's') + (n ? '<span class="vbub-n">' + n + '</span>' : '') + '</button>';
    var dock = document.getElementById('composer');
    var place = function () { var d = document.getElementById('composer'); host.style.bottom = d && d.offsetParent ? Math.max(16, MAIN.getBoundingClientRect().bottom - d.getBoundingClientRect().top + 14) + 'px' : '24px'; };
    place(); [120, 500, 1000, 1800].forEach(function (ms) { setTimeout(place, ms); });
  }
  function render() {
    if (!S.plan) unsee('plan-');
    renderSide(); renderTop(); renderConvo(); renderComposer(); renderSheet(); renderModal(); renderToast(); renderBubble();
  }

  function renderSide() {
    /* the Assistant window has its own sidebar: keep Recent and the Investigations badge in step with this conversation */
    var ul = document.getElementById('va-recent'), empty = document.getElementById('va-recent-empty');
    if (ul) {
      ul.innerHTML = RECENT.slice(0, 8).map(function (x) { return '<li><button type="button" class="vapx-conv" data-act="conv" data-arg="' + x.k + '"' + (x.k === CUR ? ' aria-current="true"' : '') + ' title="' + esc(x.t) + '"><svg class="vi" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="M10 6.5V10l2.5 1.6"/></svg><span>' + esc(x.t) + '</span></button></li>'; }).join('');
      ul.dataset.vapx = '1';
    }
    if (empty) empty.hidden = RECENT.length > 0;
    var inv = document.querySelector('#vsn [data-vsn="c-surveys"]');
    if (inv) { var live = inv.querySelector('.vsn-live'); if (anyRunning() && !live) { live = document.createElement('span'); live.className = 'vsn-live'; live.textContent = 'live'; inv.appendChild(live); } else if (!anyRunning() && live) live.remove(); }
  }

  /* Recent questions menu: pinned questions first, then recent ones with the current conversation on top; each can be renamed or pinned */
  var TTL_PIN = '<svg class="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 3h5l-.8 4.6 3 3.2H5.3l3-3.2z"/><path d="M10 10.8V17"/></svg>';
  var TTL_EDIT = '<svg class="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.8 4.2l3 3L7.5 15.5H4.5v-3z"/><path d="M11 6l3 3"/></svg>';
  function ttlFind(k) { for (var i = 0; i < RECENT.length; i++) if (RECENT[i].k === k) return RECENT[i]; return null; }
  function ttlHtml() {
    var seen = {}, items = RECENT.filter(function (x) { if (seen[x.t]) return false; seen[x.t] = 1; return true; }).slice(0, 30);
    var head = function (t) { return '<div class="popx-h"><p class="ttl-g">' + t + '</p>' + '<button type="button" class="popx" data-act="popClose" data-arg="recent" aria-label="Close" title="Close"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>' + '</div>'; };
    if (!items.length) return head('Recent') + '<p class="ttl-e">Questions you ask appear here.</p>';
    var curFirst = function (x, y) { return (y.k === CUR) - (x.k === CUR); };
    var pins = items.filter(function (x) { return x.pin; }).sort(function (x, y) { return (y.pinAt || 0) - (x.pinAt || 0); }), rest = items.filter(function (x) { return !x.pin; }).sort(curFirst);
    function row(x) {
      if (S.renaming === x.k) return '<div class="ttl-row ed">' + (x.pin ? TTL_PIN : ic('clock', 's')) + '<input class="ttl-in" data-k="' + x.k + '" value="' + esc(x.t) + '" aria-label="Rename question" maxlength="80"></div>';
      return '<div class="ttl-row' + (x.pin ? ' pinned' : '') + '"><button class="mitem" role="menuitem" data-act="conv" data-arg="' + x.k + '"' + (x.k === CUR ? ' aria-current="true"' : '') + ' title="' + esc(x.t) + '">' + (x.pin ? TTL_PIN : ic('clock', 's')) + '<span>' + esc(x.t) + '</span></button>' +
        '<span class="ttl-acts"><button type="button" class="ttl-a" data-act="recentRename" data-arg="' + x.k + '" aria-label="Rename ' + esc(x.t) + '" title="Rename">' + TTL_EDIT + '</button><button type="button" class="ttl-a' + (x.pin ? ' on' : '') + '" data-act="recentPin" data-arg="' + x.k + '" aria-pressed="' + !!x.pin + '" aria-label="' + (x.pin ? 'Unpin ' : 'Pin ') + esc(x.t) + '" title="' + (x.pin ? 'Unpin' : 'Pin') + '">' + TTL_PIN + '</button></span></div>';
    }
    var html = (pins.length ? pins.map(row).join('') + (rest.length ? '<p class="ttl-g">Recent</p>' : '') : '') + rest.map(row).join('');
    return head(pins.length ? 'Pinned' : 'Recent') + '<div class="ttl-box"><div class="ttl-list">' + html + '</div><div class="ttl-sb" aria-hidden="true"><button type="button" class="ttl-up" tabindex="-1"></button><span class="ttl-tr"><i class="ttl-th"></i></span><button type="button" class="ttl-dn" tabindex="-1"></button></div></div>';
  }
  function ttlEdit(pop) {
    var inp = pop.querySelector('.ttl-in'); if (!inp) return;
    inp.focus(); inp.select();
    var done = false;
    function finish(save) { if (done) return; done = true; var x = ttlFind(inp.getAttribute('data-k')), v = inp.value.replace(/\s+/g, ' ').trim();
      if (save && x && v) { x.t = v; if (x.k === CUR) S.title = v; }
      S.renaming = null; render(); if (save && v) notify('Question renamed'); }
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); } });
    inp.addEventListener('blur', function () { finish(true); });
    inp.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  /* visible scroll bar for the Recent questions list: arrows and a draggable thumb, shown when there are more than six */
  function ttlBar(pop, keep) {
    var list = pop.querySelector('.ttl-list'), sb = pop.querySelector('.ttl-sb'); if (!list || !sb) return; if (keep) list.scrollTop = keep;
    var tr = sb.querySelector('.ttl-tr'), th = sb.querySelector('.ttl-th');
    function sync() { var over = list.scrollHeight > list.clientHeight + 1; sb.hidden = !over; pop.querySelector('.ttl-box').classList.toggle('has-sb', over); if (!over) return;
      var h = Math.min(56, Math.max(28, tr.clientHeight * list.clientHeight / list.scrollHeight * 0.45)), top = (tr.clientHeight - h) * list.scrollTop / (list.scrollHeight - list.clientHeight || 1); th.style.height = h + 'px'; th.style.transform = 'translateY(' + top + 'px)'; }
    list.addEventListener('scroll', sync, { passive: true });
    var step = function (d) { list.scrollBy({ top: d * 40, behavior: 'smooth' }); };
    sb.querySelector('.ttl-up').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    sb.querySelector('.ttl-dn').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    tr.addEventListener('click', function (e) { if (e.target === th) return; e.stopPropagation(); var r = tr.getBoundingClientRect(); list.scrollTop = (e.clientY - r.top) / r.height * (list.scrollHeight - list.clientHeight); });
    /* the bar itself: drag it, or click it to move the list towards where you clicked */
    th.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); var y0 = e.clientY, s0 = list.scrollTop, moved = false, k = (list.scrollHeight - list.clientHeight) / Math.max(1, tr.clientHeight - th.offsetHeight); th.setPointerCapture(e.pointerId); pop.classList.add('ttl-drag');
      function mv(ev) { if (Math.abs(ev.clientY - y0) > 3) moved = true; if (moved) list.scrollTop = s0 + (ev.clientY - y0) * k; }
      function up(ev) { th.removeEventListener('pointermove', mv); th.removeEventListener('pointerup', up); pop.classList.remove('ttl-drag');
        if (!moved) { var r = th.getBoundingClientRect(); step(ev.clientY < r.top + r.height / 2 ? -3 : 3); } }
      th.addEventListener('pointermove', mv); th.addEventListener('pointerup', up); });
    th.addEventListener('click', function (e) { e.stopPropagation(); });
    requestAnimationFrame(sync);
  }
  function renderTop() {
    var tb = document.querySelector('#topbar .title b'); if (tb) tb.textContent = 'Recent questions';
    var tbtn = document.querySelector('#topbar .ttl'), tpop = document.querySelector('#topbar .ttl-pop');
    if (tbtn && tpop) { tbtn.setAttribute('aria-expanded', String(!!S.recent)); tpop.hidden = !S.recent; if (S.recent) { var ost = (tpop.querySelector('.ttl-list') || {}).scrollTop || 0; if (!(S.renaming && tpop.querySelector('.ttl-in'))) { tpop.innerHTML = ttlHtml(); ttlBar(tpop, ost); ttlEdit(tpop); } } }
    if (!S.bell) unsee('p-bell'); if (!S.more) unsee('p-more');
    var og = openGaps(), unread = S.notifs.filter(function (n) { return n.unread; }).length;
    var h = '' +
      '<button class="icb" data-act="sheetToggle" aria-label="What this answer rests on" aria-pressed="' + !!S.sheet + '" title="Sources">' + ic('layers') + '</button>';
    h += '<div class="wrapr bellwrap"><button class="icb" data-act="bell" aria-label="Notifications' + (unread ? ', ' + unread + ' unread' : '') + '" aria-expanded="' + S.bell + '">' + ic('bell') + (unread ? '<span class="dot-n">' + unread + '</span>' : '') + '</button>';
    if (S.bell) {
      h += '<div class="pop npop' + fx('p-bell', 'popin') + '" role="dialog" aria-label="Notifications"><div class="nhead"><b>Notifications</b>' + '<span class="nhead-r">' + (unread ? '<button class="lnk" data-act="readAll">Mark all as read</button>' : '<span class="small">All caught up</span>') + '<button type="button" class="popx" data-act="popClose" data-arg="bell" aria-label="Close" title="Close"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>' + '</span></div><div class="nlist">' +
        S.notifs.map(function (n) {
          return '<div class="nitem' + (n.unread ? ' unread' : '') + '"><div class="nic">' + ic('users', 's') + '</div><div style="flex:1;min-width:0"><p><span class="nt">' + esc(n.title) + '</span> · ' + esc(n.text) + '</p><p class="nw">' + esc(n.when) + '</p>' +
            (n.act ? '<button class="lnk" data-act="' + n.act + '" data-arg="' + (n.arg || '') + '">' + n.actLabel + '</button>' : '') + '</div>' + (n.unread ? '<span class="udot"></span>' : '') + '</div>';
        }).join('') + '</div></div>';
    }
    h += '</div><div class="wrapr morewrap"><button class="icb" data-act="more" aria-label="More options" aria-expanded="' + S.more + '">' + ic('more') + '</button>';
    if (S.more) {
      h += '<div class="pop' + fx('p-more', 'popin') + '" role="menu" style="width:220px;padding:6px">' +
        '<button class="mitem" role="menuitem" data-act="toast" data-arg="Market scope applies once the Assistant is connected to your data">' + ic('pin', 's') + 'All markets</button>' +
        '<button class="mitem" role="menuitem" data-act="reset">' + ic('plus', 's') + 'New question</button>' +
        '<button class="mitem" role="menuitem" data-act="toast" data-arg="Share link copied">' + ic('share', 's') + 'Share</button>' +
        '<button class="mitem" role="menuitem" data-act="toast" data-arg="Saved to Decision: ' + esc(S.title) + '">' + ic('save', 's') + 'Save to Decision</button>' +
        '<button class="mitem" role="menuitem" data-act="toast" data-arg="Conversation copied with its sources">' + ic('copy', 's') + 'Copy conversation</button></div>';
    }
    $('topRight').innerHTML = h + '</div>';
  }

  /* Chart library: choose the template that suits the question. Existing chart data is re-shaped (so the
     numbers match the answer); a few question types get their own illustrative chart when the answer has none. */
  var VCSEEN = {};
  function fitChart(a, q) {
    var V = window.VChart; if (!V || a.preview) return;
    var t = ' ' + String(q).toLowerCase() + ' ', c = a.chart, P = a.place ? a.place.name : 'the market', Ar = (a.place && a.place.areas) || ['North', 'Central', 'South', 'East'], prod = String(a.product || 'product').replace(/^your /i, '');
    var r = rng(hash(t + 'vc')), bt = function (lo, hi) { return between(r, lo, hi); }, M6 = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    var has = function (rx) { return rx.test(t); }, src = 'Source: Verisavo, illustrative data for this preview';
    var before = c;
    if (c) {
      var pct = (c.fmt || '') === '%';
      if (c.kind === 'cols' && c.vals && !c.small) {
        if (has(/this year|last year|year on year|vs last/)) { var base = c.vals[0]; a.chart = Object.assign({}, c, { kind: 'lines', series: ['This year', 'Last year'], data: [c.vals, c.vals.map(function (v, k) { return Math.round(base * (0.97 + 0.012 * k) + (k % 2)); })], zero: false }); }
        else if (has(/what happened|after the|when did|levy|launch|caused|start(ed)? (falling|dropping|slowing)/)) a.chart = Object.assign({}, c, { kind: 'events', data: [c.vals], series: [], events: [{ at: Math.max(1, c.vals.length - 3), label: 'Change began' }], zero: false });
        else if (has(/trend|over time|since|history|how has|month|weekly|week/)) a.chart = Object.assign({}, c, { kind: has(/volume|demand|cases|sell-out|sales/) ? 'area' : 'line', data: [c.vals], series: [], zero: false });
      } else if (c.kind === 'bars' && c.rows) {
        var rows = c.rows.filter(function (x) { return x.v != null; });
        if (pct && has(/coverage|reach|penetration|availability|stock(ed|ing)?|on the shelf|how many outlets/) && rows.length <= 5) a.chart = Object.assign({}, c, { kind: 'donuts', rows: rows.map(function (x) { return { label: x.label, v: x.v, hl: x.hl, max: 100 }; }) });
        else if (has(/map|where in|which part|neighbourhood|district|which area|areas/) && rows.length >= 3 && rows.length <= 9) a.chart = Object.assign({}, c, { kind: 'tiles', areas: rows.map(function (x, k) { return { label: x.label, v: x.v, r: Math.floor(k / 3), c: k % 3 }; }) });
        else if (has(/rank|most|least|longest|shortest|highest|lowest|top|worst|best/) && rows.length >= 4) a.chart = Object.assign({}, c, { kind: 'lollipop' });
      } else if (c.kind === 'pairs' && c.rows && c.series) {
        var sums = c.rows.map(function (x) { return (x.a || 0) + (x.b || 0); }), whole = pct && sums.every(function (v) { return v >= 95 && v <= 105; });
        if (whole && has(/share|split|mix|where do|source|buy from|through/)) a.chart = Object.assign({}, c, { kind: 'stackbar', rows: c.rows.filter(function (x) { return !x.total; }).map(function (x) { return { label: x.label, v: [x.a, x.b] }; }) });
        else if (has(/gap|before|after|changed|from .* to|moved|fallen|risen/) && c.rows.every(function (x) { return x.a != null && x.b != null; })) a.chart = Object.assign({}, c, { kind: 'dumbbell', series: [c.series[0], c.series[1]], rows: c.rows.filter(function (x) { return !x.total; }).map(function (x) { return { label: x.label, a: x.b, b: x.a }; }), max: pct ? 100 : null });
      }
      if (a.chart !== before) return;
    }
    /* question types with a natural chart of their own (used when the answer has no chart, or one that does not fit the question) */
    var G = [
      [/which (areas?|parts?|neighbourhoods?|districts?)|where (in|are|is) .*(worst|most|least|highest|lowest)|areas of .* (worst|most)/, function () { var vs = Ar.slice(0, 6).map(function () { return bt(8, 62); }); return { kind: 'tiles', title: Ar[vs.indexOf(Math.max.apply(null, vs))] + ' is the most affected area in ' + P, sub: '% of outlets affected, by area · ' + P, fmt: '%', areas: Ar.slice(0, 6).map(function (n, k) { return { label: n, v: vs[k], r: Math.floor(k / 3), c: k % 3 }; }) }; }],
      [/where do .* (buy|get|source)|buy (it )?from|supplied by|who supplies|which channel/, function () { var w = bt(45, 60), v = bt(22, 34); return { kind: 'donut', title: 'Most outlets in ' + P + ' buy your ' + prod + ' through wholesalers', sub: 'Main source of supply, % of outlets · ' + P, parts: [{ label: 'Wholesaler', v: w }, { label: 'Distributor van', v: v }, { label: 'Open market', v: 100 - w - v }] }; }],
      [/funnel|journey|drop(ping)?[ -]?off|losing shoppers|convert|path to purchase|why (are|aren.t) (people|shoppers) (not )?buying/, function () { var n = bt(320, 420), b = Math.round(n * bt(55, 70) / 100), c2 = Math.round(b * bt(40, 55) / 100), d = Math.round(c2 * bt(75, 90) / 100); return { kind: 'funnel', title: 'Most shoppers are lost between looking for your ' + prod + ' and finding it', sub: 'Shoppers at each step · ' + P + ', ' + n + ' interviewed', rows: [{ label: 'Know the brand', v: n }, { label: 'Looked for it', v: b }, { label: 'Found it', v: c2 }, { label: 'Bought it', v: d }] }; }],
      [/busiest|what time|which day|footfall|peak hours?|best time/, function () { var D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], H = ['7am', '9am', '11am', '1pm', '3pm', '5pm', '7pm']; return { kind: 'calendar', title: 'Outlets in ' + P + ' are busiest on Saturday mornings and weekday evenings', sub: 'Footfall, relative · ' + P, rows: D, cols: H, data: D.map(function (d, i) { return H.map(function (h, j) { return Math.max(1, Math.round((i === 5 ? 6 : 3) + (j === 1 || j === 2 ? (i === 5 ? 3 : 1) : 0) + (j === 5 ? 3 : 0) - (i === 6 && j > 3 ? 2 : 0) + r() * 2)); }); }) }; }],
      [/price .*(vs|and|against) .*(sales|volume)|does price|price sensitiv|price gap .*sales|relationship/, function () { var pts = []; for (var i = 0; i < 24; i++) { var x = bt(1, 16); pts.push({ x: x, y: Math.max(6, Math.round(34 - x * 1.3 + (r() - .5) * 8)) }); } return { kind: 'scatter', title: 'Outlets with a bigger price gap tend to sell less of your ' + prod, sub: 'Each dot is an outlet · ' + P + ', 24 outlets; units sold per week', xLabel: 'Price gap to the rival, %', xFmt: '%', fit: true, pts: pts }; }],
      [/price (ladder|point|position)|priced against|cheaper|more expensive|premium|how do our prices compare/, function () { var y = bt(48, 54); return { kind: 'pricepoints', title: 'Your ' + prod + ' sits at the top of the price range', sub: 'Typical shelf price, same pack size · ' + P, items: [{ label: 'Brand C', v: y - bt(8, 11) }, { label: 'Rival', v: y - bt(5, 7) }, { label: 'Brand B', v: y - bt(2, 4) }, { label: 'Yours', v: y, hl: true }] }; }],
      [/strength|weakness|how do we compare|where do we win|where do we lose|attribute/, function () { return { kind: 'radar', title: 'The rival leads on price and availability; you lead on trust', sub: 'Shopper ratings out of 100 · ' + P, series: ['Your brand', 'Leading rival'], axes: ['Price', 'Availability', 'Trust', 'Pack sizes', 'Visibility'], data: [[bt(45, 55), bt(42, 52), bt(76, 84), bt(58, 66), bt(50, 58)], [bt(70, 78), bt(74, 82), bt(56, 64), bt(55, 62), bt(68, 76)]] }; }],
      [/prioriti|where (should we|to) start|focus on first|quick win|what should we do first/, function () { return { kind: 'matrix', title: 'Restocking kiosks offers the most impact for the effort', sub: 'Options placed by expected impact and effort · ' + P, xLabel: 'Ease', yLabel: 'Impact', quads: ['Worth planning', 'Do first', 'Leave', 'Quick fixes'], pts: [{ x: 70, y: 78, label: 'Kiosk restock', hl: true }, { x: 30, y: 70, label: 'New distributor' }, { x: 75, y: 35, label: 'Shelf strips' }, { x: 22, y: 30, label: 'Price cut' }] }; }],
      [/what explains|drivers|contribut|bridge|break down the (fall|drop|change)/, function () { var st = bt(200, 240), s1 = -bt(20, 30), s2 = -bt(12, 20), s3 = bt(5, 12), s4 = -bt(6, 14); return { kind: 'waterfall', title: 'Lost shelf space explains most of the change', sub: 'Monthly cases, Aug to Nov, by cause · ' + P, start: { label: 'Aug', v: st }, steps: [{ label: 'Shelf space', v: s1 }, { label: 'Price gap', v: s2 }, { label: 'New outlets', v: s3 }, { label: 'Season', v: s4 }], end: 'Nov' }; }],
      [/forecast|next (month|quarter|few months)|expect|outlook|project(ion|ed)?|predict/, function () { var v = [100, bt(98, 103), bt(90, 95), bt(84, 89), bt(80, 85)]; var e = v[4]; return { kind: 'band', title: 'If nothing changes, sales are likely to stay below August', sub: 'Sales index, actual and a range of simulated outcomes · ' + P, series: ['Actual', 'Simulated'], cats: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], data: [v.concat([null, null, null]), [null, null, null, null, e, e + 1, e + 2, e + 3]], dash: [false, true], band: { from: 4, lo: [e, e - 4, e - 6, e - 8], hi: [e, e + 5, e + 9, e + 13] }, zero: false, note: 'A simulation explores possible outcomes under stated assumptions; it is not a prediction.' }; }],
      [/overview|at a glance|summary|how (are )?we (are )?doing|key (numbers|figures)|dashboard|snapshot/, function () { var c1 = bt(52, 66), pr = bt(46, 53), cs = bt(160, 190); return { kind: 'kpis', title: P + ' at a glance', sub: 'Your ' + prod + ', November', items: [{ label: 'Outlets stocking you', value: c1 + '%', change: '−' + bt(3, 8) + ' pts', spark: [c1 + 8, c1 + 7, c1 + 5, c1 + 3, c1 + 1, c1] }, { label: 'Price gap to rival', value: '+' + bt(8, 14) + '%', change: 'widening', dir: 'dn', spark: [5, 6, 8, 9, 11, 12] }, { label: 'Cases sold', value: cs + 'k', change: '−' + bt(10, 20) + '%', spark: [cs + 40, cs + 42, cs + 38, cs + 20, cs + 9, cs] }] }; }],
      [/timeline|sequence of events|what changed when|history of/, function () { return { kind: 'timeline', title: 'Several changes came close together', sub: P + ', your ' + prod, items: [{ when: 'Sep', label: 'Import levy applied', detail: 'Landed cost rose' }, { when: 'Sep', label: 'Rival price cut', detail: 'Mainly in small shops' }, { when: 'Oct', label: 'Wholesaler credit tightened', hl: true }, { when: 'Nov', label: 'Sales below August' }] }; }]
    ];
    for (var i = 0; i < G.length; i++) if (G[i][0].test(t)) { a.chart = Object.assign({ src: src }, G[i][1]()); a.showChart = true; return; }
  }
  function chartHtml(a) {
    if (window.VChart && a.chart) {
      var cn = S.answers.filter(function (x) { return x.chart; }).indexOf(a) + 1, ck = a.id + ':' + a.chart.kind + ':' + a.chart.title, fresh = !VCSEEN[ck]; VCSEEN[ck] = 1;
      var fig = window.VChart.figure(Object.assign({ kind: a.chart.kind }, a.chart), cn).replace('<figure class="vc"', '<figure class="vc' + (fresh ? '' : ' vc-in') + '" data-vck="' + esc(ck) + '"');
      if (fresh) setTimeout(function () { window.VChart.animate(document); }, 30);
      return fig;
    }
    var c = a.chart, f = function (v) { return v + (c.fmt || ''); }, body = '';
    var num = S.answers.filter(function (x) { return x.chart; }).indexOf(a) + 1;
    if (c.kind === 'bars') {
      var mx = c.max || Math.max.apply(null, c.rows.map(function (r) { return r.v; }));
      body = '<div class="mk-rows">' + c.rows.map(function (r) { return '<div class="mk-row"><span class="mk-l">' + esc(r.label) + '</span><span class="mk-bar"><i class="' + (r.hl ? 'h' : 'b') + '" style="width:' + (r.v / mx * 82) + '%"></i><b>' + f(r.v) + '</b></span></div>'; }).join('') + '</div>';
    } else if (c.kind === 'pairs') {
      body = '<p class="mk-leg"><span><i class="h"></i>' + esc(c.series[0]) + '</span><span><i class="b"></i>' + esc(c.series[1]) + '</span></p><div class="mk-rows">' + c.rows.map(function (r) {
        var mx = r.max || 100, one = function (v, cls) { return v == null ? '<span class="mk-bar"><i class="u"></i><b class="unk">Unknown</b></span>' : '<span class="mk-bar"><i class="' + cls + '" style="width:' + (v / mx * 82) + '%"></i><b>' + f(v) + '</b></span>'; };
        return '<div class="mk-row' + (r.total ? ' tot' : '') + '"><span class="mk-l">' + esc(r.label) + '</span><span class="mk-pair">' + one(r.a, 'h') + one(r.b, 'b') + '</span></div>';
      }).join('') + '</div>';
    } else if (c.kind === 'diverge') {
      var dm = Math.max.apply(null, c.rows.map(function (r) { return Math.abs(r.v); }));
      body = '<div class="mk-rows">' + c.rows.map(function (r) { var w = Math.abs(r.v) / dm * 70, pos = r.v >= 0;
        return '<div class="mk-row"><span class="mk-l">' + esc(r.label) + '</span><span class="mk-div"><span class="neg">' + (pos ? '' : '<b>−' + Math.abs(r.v) + '%</b><i class="b" style="width:' + w + '%"></i>') + '</span><span class="pos">' + (pos ? '<i class="h" style="width:' + w + '%"></i><b>+' + r.v + '%</b>' : '') + '</span></span></div>'; }).join('') + '</div>';
    } else if (c.kind === 'cols') {
      var n = c.vals.length, W = 600, H = 200, top = 22, bot = 26, ch = H - top - bot, cm = Math.max.apply(null, c.vals), slot = W / n, bw = slot * (c.small ? 0.72 : 0.56);
      body = '<svg class="mk-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(c.title) + '">' + c.vals.map(function (v, k) {
        var h = v / cm * ch, x = k * slot + (slot - bw) / 2, y = top + ch - h, hl = (c.hl || []).indexOf(k) >= 0;
        return '<rect class="' + (hl ? 'h' : 'b') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '"/>' +
          (c.small && !hl ? '' : '<text class="v" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '">' + v + (c.fmt || '') + '</text>') +
          '<text class="c" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '">' + esc(c.cats[k]) + '</text>';
      }).join('') + '<line x1="0" x2="' + W + '" y1="' + (top + ch) + '" y2="' + (top + ch) + '"/></svg>';
    }
    return '<figure class="ex' + fx('chart-' + a.id) + '"><p class="mk-ex">Exhibit ' + num + '</p><p class="mk-t">' + esc(c.title) + '</p><p class="mk-s">' + esc(c.sub) + '</p>' + body +
      '<div class="mk-foot">' + (c.note ? '<p>Note: ' + esc(c.note.replace(/^Note: /, '')) + '</p>' : '') + '<p>' + esc(c.src) + '</p></div></figure>';
  }
  function ago(t) { if (!t) return ''; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' hr ago'; }
  var GAP_RULES = [
    [/running out|run out|sold out|out of stock|stockout|empty shel/, function (P, p) { return ['Why are small shops in ' + P + ' running out of ' + p + ': late deliveries, small reorders, or distributors pushing other brands?', 'Each cause needs a different fix, from delivery schedules to trade terms.']; }],
    [/which area|what area|which part|where .*worst|worst affected|which neighbourhood|which district|hotspot/, function (P, p) { return ['Which areas of ' + P + ' are worst affected, and do they share the same distributor or route?', 'If the weak areas sit on one route, the problem is logistics rather than demand.']; }],
    [/when did|since when|how long|start(ed)? (falling|dropping|slowing)|timeline/, function (P, p) { return ['When did the change in ' + P + ' start, and did it follow a delivery, price or competitor move?', 'Timing separates a supply problem from a shift in what shoppers want.']; }],
    [/how many|what share|how much of|penetration|coverage|how widely/, function (P, p) { return ['What share of outlets in ' + P + ' stock ' + p + ' today, by outlet type?', 'A coverage count shows whether the issue is reach or sell-through.']; }],
    [/quality|complain|fake|counterfeit|trust|expired|damaged/, function (P, p) { return ['Are shoppers or retailers in ' + P + ' reporting quality, expiry or counterfeit problems with ' + p + '?', 'A trust problem will not respond to pricing or distribution fixes.']; }],
    [/pack size|sachet|smaller pack|bigger pack|format/, function (P, p) { return ['Which pack sizes of ' + p + ' sell through fastest in ' + P + ', and which sit on the shelf?', 'It decides whether to change the pack mix before changing price.']; }],
    [/wholesal|distributor|supplier|route|deliver/, function (P, p) { return ['Where in the ' + P + ' supply chain is ' + p + ' being delayed: distributor, wholesaler or shop?', 'Each link needs a different fix.']; }],
    [/promotion|promo|advert|marketing|visib|signage|display/, function (P, p) { return ['How visible is ' + p + ' at the point of sale in ' + P + ' compared with the rival?', 'Shelf position and signage often explain more than price.']; }],
    [/credit|terms|margin for (shops|retailers)|incentive|trade/, function (P, p) { return ['What trade terms or incentives are retailers in ' + P + ' getting from the rival?', 'If it is credit or extra margin, matching price alone will not win the shelf.']; }]
  ];
  var GAP_DEEPER = [
    function (P, p) { return ['Which outlet types in ' + P + ' lost the most ' + p + ' volume: kiosks, small shops or open markets?', 'Knowing where the loss sits tells you where SavoScouts should look first.']; },
    function (P, p) { return ['What do shopkeepers in ' + P + ' say, in their own words, about why they stock less ' + p + '?', 'Retailer reasons often differ from what sales data suggests.']; },
    function (P, p) { return ['Are shoppers in ' + P + ' choosing the rival on price, or because ' + p + ' simply was not there?', 'The remedy is pricing in one case and restocking in the other.']; },
    function (P, p) { return ['How often do ' + P + ' outlets reorder ' + p + ', and how long do they wait for delivery?', 'Reorder gaps show whether supply or demand is the constraint.']; }
  ];
  var DEPTH_CUES = /\bwhy\b|how come|what if|\bwhich\b|\bwhere\b|\bwhen\b|compare|\bvs\b|versus|should we|what (is )?driv|worst|running out|run out|sold out|\bdrop|\bfall|\bslow|declin|\blos(e|ing)\b|explain|cause|reason/;
  var DEPTH_NOUNS = ['distributor', 'wholesal', 'kiosk', 'shop', 'outlet', 'shelf', 'price', 'rival', 'competitor', 'pack', 'area', 'route', 'deliver', 'stock', 'shopper', 'consumer', 'retailer', 'market stall', 'supplier', 'margin', 'promotion'];
  function depthOf(a, q) {
    var t = ' ' + q.toLowerCase() + ' ', d = 0;
    if (DEPTH_CUES.test(t)) d += 2;
    d += Math.min(2, DEPTH_NOUNS.filter(function (n) { return t.indexOf(n) >= 0; }).length);
    if (findPlaces(t).length) d += 1;
    if (findProduct(t)) d += 1;
    d += Math.min(2, S.answers.length);
    if (q.split(/\s+/).length > 9) d += 1;
    return d;
  }
  function refineGap(a, q) {
    if (!a || a.investigateNow || a.intent === 'investigate') return;
    var depth = depthOf(a, q); a.depth = depth;
    if (a.caseId) { if (a.gap) dedupeGap(a, q, true); return; }
    if (depth < 3) { a.chart = null; a.table = null; }
    if (depth < 4 || !DEPTH_CUES.test(' ' + q.toLowerCase() + ' ')) {
      a.gap = null;
      a.paras = a.paras.filter(function (p) { return !/^What I can’t|^What I can't|^What I cannot/.test(p); });
      if (!a.paras.length) a.paras = ['Here is what the evidence shows so far. Ask about a specific place, channel or cause and I will show what it can and cannot yet answer.'];
    }
    if (!a.gap) return;
    dedupeGap(a, q);
  }
  function dedupeGap(a, q, keep) {
    q = q || a.q;
    var t = ' ' + q.toLowerCase() + ' ', P = a.place ? a.place.name : 'the market', p = a.product || 'your product';
    var taken = {}; S.answers.forEach(function (x) { if (x.gap) { taken[x.gap.q] = 1; (x.gap.chain || []).forEach(function (c) { taken[c.q] = 1; }); } });
    var pick = null;
    if (!keep) for (var i = 0; i < GAP_RULES.length && !pick; i++) if (GAP_RULES[i][0].test(t)) { var r = GAP_RULES[i][1](P, p); if (!taken[r[0]]) pick = r; }
    if (!pick && !taken[a.gap.q]) return;
    for (var j = 0; j < GAP_DEEPER.length && !pick; j++) { var d = GAP_DEEPER[j](P, p); if (!taken[d[0]]) pick = d; }
    if (!pick) return;
    a.gap.q = pick[0]; a.gap.why = pick[1];
  }
  function explain(it) {
    var q = String(it.q || ''), parts = [], m;
    if (q.indexOf(':') > 0) parts = q.split(':').slice(1).join(':').replace(/\?$/, '').split(/,\s*(?:or\s+)?|\s+or\s+/);
    else if ((m = q.match(/^(?:Is|Are|Was|Were)\s+(?:it\s+)?(.+?)\s+or\s+(.+?)\s+(?:driving|behind|causing|slowing|pushing|holding|winning|that|which|the|more|to)\b/i))) parts = [m[1], m[2]];
    else if ((m = q.match(/\b(?:because of|choosing|buying|switching)\s+(.+?)\s+or\s+(.+?)[?,]/i))) parts = [m[1], m[2]];
    parts = parts.map(function (t) { return t.replace(/^(a|an|the|because|simply|just)\s+/i, '').trim(); }).filter(function (t) { return t && t.length < 60; }).map(function (t) { return t.charAt(0).toUpperCase() + t.slice(1); });
    if (parts.length < 2) return '';
    return '<span class="gexp"><span class="gexk">Possible explanations</span>' + parts.slice(0, 4).map(function (t) { return '<span class="gchip">' + esc(t) + '</span>'; }).join('') + '</span>';
  }
  function splitSent(p) { return String(p).split(/(?<=[.!?])\s+(?=[A-Z0-9“"])/); }
  function citeGroup(a, e) { var t = srcType(e); return t === 'Your data' ? 'kb' : t === 'Ground-Level' ? 'gl' : srcInfo(a, e).kind === 'Digital information' ? 'dig' : 'pub'; }
  function citeLabel(a, e) { return { kb: 'Knowledge Base', gl: 'SavoScouts', dig: 'Digital information', pub: srcInfo(a, e).kind }[citeGroup(a, e)]; }
  function citeMap(a) {
    var key = a.ev.length + '|' + a.paras.join('|').length;
    if (a._cm && a._cm.k === key) return a._cm.m;
    var stop = /^(the|and|for|are|our|your|than|from|with|since|has|have|about|across|this|that|its|was|were|been|into|over|more|less|may|not|yet)$/;
    var words = function (t) { return (String(t).toLowerCase().match(/[a-z0-9%]+/g) || []).filter(function (x) { return x.length > 2 && !stop.test(x); }); };
    var m = {};
    a.ev.forEach(function (e, i) {
      var ew = words(e.text), best = null, bs = 0;
      a.paras.forEach(function (p, pi) {
        splitSent(p).forEach(function (s, si) {
          var sw = words(s), sc = 0;
          ew.forEach(function (x) { if (sw.indexOf(x) >= 0) sc += /\d/.test(x) ? 3 : 1; });
          if (sc > bs) { bs = sc; best = pi + ':' + si; }
        });
      });
      if (best && bs >= 3) (m[best] = m[best] || []).push(i);
    });
    a._cm = { k: key, m: m };
    return m;
  }
  function citeChip(a, idx) {
    // one chip per source behind the sentence; a second finding from the same source shows as +1
    var by = {}, order = [];
    idx.forEach(function (i) { var l = citeLabel(a, a.ev[i]); if (!by[l]) { by[l] = []; order.push(l); } by[l].push(i); });
    return order.map(function (l) {
      var first = by[l][0], e = a.ev[first];
      return '<button type="button" class="cite" data-act="srcOpen" data-arg="' + a.id + ':' + first + '" title="' + esc(e.src) + '">' + esc(l) + (by[l].length > 1 ? ' +' + (by[l].length - 1) : '') + '</button>';
    }).join(' ');
  }
  function sourcesBtn(a) {
    if (!a.ev || !a.ev.length) return '';
    return '<button type="button" class="lnk mute srcbtn" data-act="evid" data-arg="' + a.id + '">' + ic('layers', 's') + 'Sources</button>';
  }
  function gapList(x) {
    var g = x.gap, l = [{ id: 'cur', q: g.q, why: g.why, from: x.q, at: x.at, aid: x.id, resp: g.resp }];
    (g.chain || []).slice().reverse().forEach(function (c, i) { l.push({ id: 'c' + i, q: c.q, why: c.why, from: c.from, at: c.at, aid: c.aid, resp: c.resp }); });
    return l;
  }
  window.vsOpenGaps = function () {
    var out = [], seen = {};
    S.answers.forEach(function (a) {
      if (a.status !== 'done' || !a.gap || a.gap.state !== 'open' || a.gap.pendingTask) return;
      var pl = a.gap.place || a.place || {};
      var kind = a.intent === 'price' ? 'Price check' : a.intent === 'distribution' ? 'Availability and shelf' : a.intent === 'consumer' ? 'Shopper feedback' : a.intent === 'competitor' ? 'Availability and shelf' : 'Retailer interviews';
      gapList(a).forEach(function (it) { if (!it.q || seen[it.q]) return; seen[it.q] = 1; out.push({ q: it.q, why: it.why || '', from: it.from || a.q, kind: kind, city: pl.name || '', country: pl.country || '', product: a.product && a.product !== 'your product' ? a.product : '' }); });
    });
    return out;
  };
  function gsel() { if (!S.gsel) { S.gsel = { cur: true }; } return S.gsel; }
  function selected(x) { var sel = gsel(); return gapList(x).filter(function (it) { return sel[it.id]; }); }
  function gapLine(a) {
    var g = a.gap; if (!g || a.investigateNow) return '';
    if (g.state === 'open') return '<button class="gline" data-act="gaps" data-arg="' + a.id + '" aria-label="' + (g.chain && g.chain.length ? (1 + g.chain.length) + ' intelligence gaps' : 'Intelligence gap') + '"><span class="dash"></span>' + (g.chain && g.chain.length ? (1 + g.chain.length) + ' Gaps' : '1 Gap') + '</button>';
    if (g.state === 'running') return '<button class="gline" data-act="gaps" data-arg="' + a.id + '"><span class="spin"></span>Investigating · ' + g.received + ' of ' + g.total + '</button>';
    if (g.state === 'ready') return '<button class="gline ready" data-act="gaps" data-arg="' + a.id + '">' + ic('check', 's') + 'Results ready</button>';
    return '';
  }
  function planCard(a) {
    var p = S.plan, areas = (a.gap.place || a.place).areas;
    var qs = a.investigateNow || a.gap.state !== 'open' ? [{ q: a.gap.q, from: a.q, at: a.at }] : selected(a);
    return '<div class="plan' + fx('plan-' + a.id) + '" role="group" aria-label="Investigation plan"><p class="ph">Here’s the investigation I’d send</p>' +
      (qs.length === 1 ? '<p class="pq">' + esc(qs[0].q) + '</p>' : '<ol class="trail">' + qs.map(function (it) { return '<li><span class="pq">' + esc(it.q) + '</span><span class="small">From “' + esc(trunc(it.from, 50)) + '” · ' + ago(it.at) + '</span></li>'; }).join('') + '</ol>') +
      '<div class="prow"><span>Who answers</span><span>SavoScouts in ' + esc((a.gap.place || a.place).name) + '</span></div>' +
      '<div class="prow"><span>Where</span><div class="opts">' + areas.map(function (x) { var on = !!p.areas[x]; return '<button class="opt' + (on ? ' on' : '') + '" data-act="area" data-arg="' + esc(x) + '" aria-pressed="' + on + '">' + esc(x) + '</button>'; }).join('') + '</div></div>' +
      '<div class="prow"><span>Responses</span><div class="opts">' + [10, 15, 25].map(function (n) { var on = p.n === n; return '<button class="opt' + (on ? ' on' : '') + '" data-act="size" data-arg="' + n + '" aria-pressed="' + on + '">' + n + '</button>'; }).join('') + '</div></div>' +
      '<div class="pfoot"><span class="cost">Estimated <b>' + money(p.n * RATE) + '</b></span><span class="small" style="flex:1 1 160px">' + p.n + ' verified responses at ' + money(RATE) + ' each. Charged only for responses that pass verification.</span>' +
      '<button type="button" class="lnk" data-act="fullTask" data-arg="' + a.id + '">Open as a full task</button><button class="btn ghost" data-act="cancelPlan">Cancel</button><button class="btn dark" data-act="deploy"' + (anyArea() ? '' : ' disabled') + '>' + ic('users', 's') + 'Deploy</button></div></div>';
  }
  function anyArea() { return !!S.plan && Object.keys(S.plan.areas).some(function (k) { return S.plan.areas[k]; }); }

  function renderAnswer(a) {
    var h = '<div class="q' + fx('q-' + a.id) + '" id="q-' + a.id + '">' + esc(a.q) + '</div>';
    h += '<article class="ans' + fx('a-' + a.id) + '" aria-label="Verisavo answer">';
    if (a.status === 'typing') return h + '<div class="typing"><div class="dots"><span></span><span></span><span></span></div>' + (THINK[a.intent] || THINK.general) + '</div></article>';

    // stream paragraphs word by word
    var left = a.shown;
    var paras = a.paras.slice();
    var cmap = null; /* inline source chips removed: sources are reached from the Sources button */
    paras.forEach(function (p, i) {
      if (left <= 0) return;
      var w = p.split(' '), part = w.slice(0, left).join(' ');
      left -= w.length;
      var isUpd = a.gap && a.gap.update && i === a.paras.length;
      // once the answer has finished, each sentence carries a chip naming the source behind it
      var body = cmap ? splitSent(part).map(function (s, si) { var c = cmap[i + ':' + si]; return esc(s) + (c ? ' ' + citeChip(a, c) : ''); }).join(' ') : esc(part);
      h += '<p' + (isUpd ? ' class="' + fx('upd-' + a.id).trim() + '"' : '') + '>' + body + (a.status === 'stream' && left <= 0 ? '<span class="caret"></span>' : '') + '</p>';
    });
    if (a.status !== 'done') return h + '</article>';

    if (a.tiles) h += '<div class="tiles' + fx('x-' + a.id) + '">' + a.tiles.map(function (t, i) { return '<div class="tile"><p class="small">' + esc(t[0]) + '</p><p class="v"' + (i === 2 ? ' style="color:var(--px-blue-800)"' : '') + '>' + esc(t[1]) + '</p><p class="small">' + esc(t[2]) + '</p></div>'; }).join('') + '</div>';
    if (a.table) h += '<div class="tablebox' + fx('x-' + a.id) + '"><table>' + a.table.map(function (row, i) { return '<tr>' + row.map(function (c) { return i === 0 ? '<th>' + esc(c) + '</th>' : '<td' + (c === 'Unknown' ? ' class="unknown"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
    if (a.intent === 'assumptions') {
      h += '<div>' + a.assumptions.map(function (x, i) { return '<div class="item' + (i === 0 ? ' first' : '') + '"><span class="itag t-as">Assumption</span><p>' + esc(x.text) + '</p><div class="meta">' + (x.state === 'done' ? asVerdict(x)[0] + ': ' + esc(x.result) : 'Not yet confirmed') + '</div>' + (x.state === 'done' ? '' : '<button class="lnk" data-act="testAs" data-arg="' + a.id + ':' + i + '">Check ' + esc(x.check) + '</button>') + '</div>'; }).join('') + '</div>';
    }
    if (a.showChart && a.chart) h += chartHtml(a); else unsee('chart-' + a.id);
    if (a.gap && a.gap.state === 'closed' && a.gap.update) h += '<div class="upd"><span class="updk">' + ic('check', 's') + 'Gap closed · ' + a.gap.total + ' verified SavoScout responses</span><p>' + esc(a.gap.update.replace(/^Update: /, '')) + '</p><button class="lnk" data-act="openResp" data-arg="' + a.id + '">View responses</button></div>';
    h += '<div class="quiet">' + scopeTag(a) + sourcesBtn(a) + gapLine(a) + (a.chart ? '<button class="lnk mute" data-act="chart" data-arg="' + a.id + '">' + ic('chart', 's') + (a.showChart ? 'Hide chart' : 'Show chart') + '</button>' : '') +
      '<button class="lnk mute" data-act="toast" data-arg="Answer copied with its sources">' + ic('copy', 's') + 'Copy</button></div>';
    if (a.investigateNow) {
      if (a.gap.state === 'open' && S.plan && S.plan.aid === a.id) h += planCard(a);
      else if (a.gap.state === 'open') h += '<div class="quiet"><span class="small">Not sent.</span><button class="lnk" data-act="fullTask" data-arg="' + a.id + '">Investigate this gap</button></div>';
      else h += '<div class="quiet">' + (a.gap.state === 'running' ? '<span class="gline"><span class="spin"></span>Investigating · ' + a.gap.received + ' of ' + a.gap.total + '</span>' : a.gap.state === 'ready' ? '<button class="gline ready" data-act="gaps" data-arg="' + a.id + '">' + ic('check', 's') + 'Results ready</button>' : '<span class="gline sent">' + ic('check', 's') + 'Investigation complete</span>') + '</div>';
    }
    return h + '</article>';
  }

  var STARTERS = [['Why are our sales falling in Lagos?', 'ask'], ['Is our cooking oil too expensive in Accra?', 'ask'], ['Which competitor is winning in Nairobi?', 'ask'], ['Should we expand into Kampala?', 'ask']];
  function renderConvo() {
    var h = S.answers.map(renderAnswer).join('');
    var l = last();
    if (!l) {
      MAIN.classList.add('vapx-empty');
      $('convo').innerHTML = '<section class="welcome' + fx('welcome') + '"><h1>' + (function () { var u = USER(); var n = u && u.name ? u.name.split(' ')[0] : ''; return n ? 'Hello ' + esc(n) + ', what do you need to understand?' : 'What do you need to understand?'; })() + '</h1><p>Ask about a market, product or competitor. Answers show what they rest on and what is still unknown.</p>' +
        '<div class="sugg">' + STARTERS.map(function (f) { return '<button type="button" class="sugg-chip" data-act="sugg" data-arg="' + esc(f[0]) + '|' + f[1] + '">' + esc(f[0]) + '</button>'; }).join('') + '</div></section>';
      return;
    }
    MAIN.classList.remove('vapx-empty');
    unsee('welcome');
    if (l.status === 'done') {
      var asked = S.answers.map(function (a) { return a.q.toLowerCase(); });
      var left = (l.fu || []).filter(function (f) { return asked.indexOf(f[0].toLowerCase()) < 0; });
      if (left.length) {
        h += '<section class="fu' + fx('fu-' + l.id) + '" aria-label="Follow-up questions"><p class="fu-h">Follow-up questions</p><div class="fuwrap"><div class="fulist' + (left.length > 3 ? ' scroll' : '') + '" tabindex="0">' +
          left.map(function (f) { return '<button class="furow" data-act="sugg" data-arg="' + esc(f[0]) + '|' + f[1] + '"><span>' + esc(f[0]) + '</span>' + ic('arrow', 's') + '</button>'; }).join('') + '</div>' +
          (left.length > 3 ? '<div class="fufade"></div><div class="futrack" aria-hidden="true"><i class="futhumb"></i></div>' : '') + '</div></section>';
      }
    }
    $('convo').innerHTML = h;
    var spop = document.querySelector('#convo .scopepop'); if (spop) { ttlBar(spop); var sc0 = spop.closest('.scroll, .vapx') || document.getElementById('convo'), top0 = (MAIN.querySelector('.va-top') || {}).getBoundingClientRect ? MAIN.querySelector('.va-top').getBoundingClientRect().bottom : 0; if (spop.getBoundingClientRect().top < top0 + 8) spop.classList.add('below'); }
    syncThumbs();
  }

  /* + menu context: markets or areas, and attached files. Both stay open while you choose and show as tags under the question box */
  var SBH = '<div class="ttl-sb" aria-hidden="true"><button type="button" class="ttl-up" tabindex="-1"></button><span class="ttl-tr"><i class="ttl-th"></i></span><button type="button" class="ttl-dn" tabindex="-1"></button></div>';
  var XSVG = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg>';
  function chipCss() {
    if (document.getElementById('kbx-css')) return; var kc = document.createElement('style'); kc.id = 'kbx-css';
    kc.textContent = '#va .va-main .kbchip.kbon{display:inline-flex;align-items:center;gap:0;padding:0;height:30px;font-size:13px!important;line-height:1!important}#va .va-main .kbchip.kbon span,#va .va-main .kbchip.kbon>button{font-size:13px!important;line-height:1!important;font-weight:400!important}#va .va-main .kbchip.kbon svg{width:13px;height:13px}#va .va-main .kbchip.kbon>button{display:inline-flex;align-items:center;gap:6px;height:100%;padding:0 4px 0 12px;border:0;background:none;font:inherit;color:inherit;cursor:pointer;border-radius:inherit}#va .va-main .kbchip.kbon>button.kbx{width:28px;padding:0;justify-content:center;color:#8E8D92}#va .va-main .kbchip.kbon>button.kbx:hover{color:#3A3A3C}#va .va-main .kbchip.kbon>button.kbx svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}#va .va-main .kbchip.kbon>button span{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
    document.head.appendChild(kc);
  }
  function ctxChips() {
    chipCss(); var h = '';
    if (S.chatScope && S.chatScope.length) { var cs = S.chatScope, cl = cs.length > 2 ? cs.slice(0, 2).join(', ') + ' +' + (cs.length - 2) : cs.join(', ');
      h += '<span class="kbchip kbon ctxchip" title="Questions that do not name a market focus on ' + esc(listNames(cs)) + '"><button type="button" tabindex="-1" aria-label="Market focus: ' + esc(listNames(cs)) + '">' + ic('pin', 's') + '<span>' + esc(cl) + '</span></button><button type="button" class="kbx" data-act="scopeClear" aria-label="Clear market focus">' + XSVG + '</button></span>'; }
    (S.places || []).forEach(function (v) { var lab = v.replace('|', ' · '); h += '<span class="kbchip kbon ctxchip"><button type="button" data-act="ctxPlace" aria-label="Market: ' + esc(lab) + '. Change">' + ic('pin', 's') + '<span>' + esc(lab) + '</span></button><button type="button" class="kbx" data-act="ctxUnplace" data-arg="' + esc(v) + '" aria-label="Remove ' + esc(lab) + '">' + XSVG + '</button></span>'; });
    (S.files || []).forEach(function (f, i) { h += '<span class="kbchip kbon ctxchip"><button type="button" data-act="ctxFile" aria-label="File: ' + esc(f.name) + '" title="' + esc(f.name) + '">' + ic('clip', 's') + '<span>' + esc(f.name) + '</span></button><button type="button" class="kbx" data-act="ctxUnfile" data-arg="' + i + '" aria-label="Remove ' + esc(f.name) + '">' + XSVG + '</button></span>'; });
    return h;
  }
  function placeMenu() {
    var sel = S.places || [], q = (S.placeQ || '').toLowerCase().trim(), rows = '';
    var match = function (s) { return !q || s.toLowerCase().indexOf(q) >= 0; };
    var row = function (val, label, sub, cls) { var on = sel.indexOf(val) >= 0, hay = (label + ' ' + (sub || '')).toLowerCase();
      return '<button type="button" class="mitem kbopt ' + cls + (on ? ' on' : '') + '" role="menuitemcheckbox" aria-checked="' + on + '" data-act="ctxPick" data-arg="' + esc(val) + '" data-s="' + esc(hay) + '"' + (match(hay) ? '' : ' hidden') + '><span class="kbn">' + esc(label) + (sub ? ' <em>' + esc(sub) + '</em>' : '') + '</span>' + (on ? ic('check', 's') : '') + '</button>'; };
    PLACES.forEach(function (p) { rows += row(p.name, p.name, '', 'pc'); p.areas.forEach(function (a) { rows += row(p.name + '|' + a, a, p.name, 'pa'); }); });
    return '<div class="psub-h"><button type="button" class="psub-back" data-act="ctxBack" aria-label="Back to the menu"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5"/></svg></button><b>Add a market or area</b></div>' +
      '<input class="psub-q" type="search" placeholder="Search cities or areas" aria-label="Search cities or areas" value="' + esc(S.placeQ || '') + '" autocomplete="off">' +
      '<div class="ttl-box kbbox psub-box"><div class="ttl-list">' + rows + '</div>' + SBH + '</div><p class="psub-none"' + (PLACES.some(function (p) { return match(p.name) || p.areas.some(function (a) { return match(a + ' ' + p.name); }); }) ? ' hidden' : '') + '>No city or area matches.</p>' +
      '<div class="psub-f"><span>' + (sel.length ? sel.length + ' selected' : 'Choose one or more') + '</span><button type="button" class="psub-done" data-act="ctxDone">Done</button></div>';
  }
  var fileIn = null;
  function pickFiles() {
    if (!fileIn) { fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.multiple = true; fileIn.hidden = true; fileIn.setAttribute('aria-hidden', 'true'); (document.getElementById('va') || document.body).appendChild(fileIn);
      fileIn.addEventListener('change', function () { var fs = [].slice.call(fileIn.files || []); if (!fs.length) return; S.files = (S.files || []).concat(fs.map(function (f) { return { name: f.name, size: f.size }; })); fileIn.value = ''; S.plus = true; render(); notify(fs.length === 1 ? fs[0].name + ' attached' : fs.length + ' files attached'); }); }
    fileIn.click();
  }
  function chosenPlace() { var v = (S.places || [])[0]; if (!v) return null; var n = v.split('|')[0]; return PLACES.filter(function (p) { return p.name === n; })[0] || null; }
  document.addEventListener('input', function (e) {
    if (!e.target.classList || !e.target.classList.contains('psub-q')) return;
    S.placeQ = e.target.value; var q = S.placeQ.toLowerCase().trim(), any = false, box = e.target.parentNode;
    [].forEach.call(box.querySelectorAll('.psub-box .kbopt[data-s]'), function (b) { var m = (b.getAttribute('data-s') || '').indexOf(q) >= 0, ok = b.getAttribute('aria-checked') === 'true' || (b.hasAttribute('data-city') ? (!!q && m) : (!q || m)); (b.closest('.srow') || b).hidden = !ok; if (ok) any = true; });
    if (box.classList.contains('scopepop')) S.scopeQ = S.placeQ;
    var none = box.querySelector('.psub-none'); if (none) none.hidden = any;
    var l = box.querySelector('.psub-box .ttl-list'); if (l) { l.scrollTop = 0; l.dispatchEvent(new Event('scroll')); }
  });
  /* which markets an answer is about: the countries and cities named in the question (and, for a comparison, the place it was
     compared with), what the user chose in the market picker, or the place carried over from the previous question. */
  var AFRICA = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'DR Congo', 'Côte d’Ivoire', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'];
  var CITY_IN = { Kano: 'Nigeria', Lagos: 'Nigeria', Abuja: 'Nigeria', Kaduna: 'Nigeria', Ibadan: 'Nigeria', 'Port Harcourt': 'Nigeria', Onitsha: 'Nigeria', Aba: 'Nigeria', Enugu: 'Nigeria', Jos: 'Nigeria', 'Benin City': 'Nigeria', Accra: 'Ghana', Kumasi: 'Ghana', Nairobi: 'Kenya', Mombasa: 'Kenya', Kampala: 'Uganda', 'Dar es Salaam': 'Tanzania', Kigali: 'Rwanda', Johannesburg: 'South Africa', Dakar: 'Senegal', Abidjan: 'Côte d’Ivoire' };
  function namedMarkets(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/[’']/g, '’') + ' ', hits = [];
    findPlaces(t).forEach(function (p) { var i = t.indexOf(p.name.toLowerCase()); hits.push({ n: p.name, i: i < 0 ? 0 : i }); p.k.concat([p.name.toLowerCase()]).forEach(function (k) { t = t.split(k.trim()).join(' # '); }); });
    AFRICA.slice().sort(function (x, y) { return y.length - x.length; }).forEach(function (c) { var re = new RegExp('(^|[^a-zà-ÿ])' + c.toLowerCase().replace(/[-]/g, '\\-') + '(?![a-zà-ÿ])'); var m = re.exec(t); if (m) { hits.push({ n: c, i: m.index }); t = t.replace(re, '$1#'); } });
    return hits.sort(function (x, y) { return x.i - y.i; }).map(function (h) { return h.n; });
  }
  function scopeNames(a) {
    if (a.scopeSel && a.scopeSel.length) return a.scopeSel.slice();
    var named = namedMarkets(a.q);
    if (!named.length) named = [a.place.name];
    if (a.intent === 'compare' && named.length < 2 && a.other && a.other.name && named.indexOf(a.other.name) < 0) named.push(a.other.name);
    return named;
  }
  function listNames(ns) { return ns.length > 1 ? ns.slice(0, -1).join(', ') + ' and ' + ns[ns.length - 1] : ns[0]; }
  function scopeTag(a) {
    return ''; /* the market tag under answers was removed: the answer text names the market, and market focus is set from the + menu */
    if (!a || a.preview || !a.place || !a.place.name || a.status !== 'done') return '';
    var ns = scopeNames(a);
    /* when the question itself names every market covered, the tag only repeats it: leave it out. It stays when Verisavo chose the market. */
    var said = (a.q || '').toLowerCase();
    if (S.scopeFor !== a.id && ns.every(function (x) { return said.indexOf(String(x).toLowerCase()) >= 0; })) return '';
    var lab = ns.length > 2 ? ns.slice(0, 2).join(', ') + ' +' + (ns.length - 2) : ns.join(', ');
    var from = a.scopeSel ? 'q' : (a.placeFrom || 'q');
    var tip = (ns.length > 1 ? 'This answer covers ' + listNames(ns) + '.' : from === 'q' ? 'This answer is about ' + ns[0] + '.' : 'You did not name a market, so this answer uses ' + ns[0] + (from === 'earlier' ? ' from your earlier question.' : ' as an example.')) + ' Click to choose other markets and ask again.';
    var open = S.scopeFor === a.id;
    return '<span class="scopewrap"><button type="button" class="scopetag" data-act="scopeMenu" data-arg="' + a.id + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '" aria-haspopup="dialog" aria-expanded="' + open + '">' + ic('pin', 's') + '<span>' + esc(lab) + '</span></button>' + (open ? scopePop(a, ns) : '') + '</span>';
  }
  function scopePop(a, ns) {
    var q = (S.scopeQ || '').toLowerCase().trim(), sel = S.scopeSel || [];
    var row = function (name, sub, isCity) { var on = sel.indexOf(name) >= 0, hay = (name + ' ' + (sub || '')).toLowerCase(), show = on || (isCity ? (q && hay.indexOf(q) >= 0) : (!q || hay.indexOf(q) >= 0));
      return '<button type="button" class="mitem kbopt' + (on ? ' on' : '') + '" role="menuitemcheckbox" aria-checked="' + on + '" data-act="scopeTog" data-arg="' + esc(name) + '" data-s="' + esc(hay) + '"' + (isCity ? ' data-city="1"' : '') + (show ? '' : ' hidden') + '><span class="kbn">' + esc(name) + (sub ? ' <em>' + esc(sub) + '</em>' : '') + '</span>' + (on ? ic('check', 's') : '') + '</button>'; };
    var isSel = function (n) { return sel.indexOf(n) >= 0; }, cities = PLACES.map(function (p) { return p.name; });
    var top = S.scopeTop || [], inTop = function (n) { return top.indexOf(n) >= 0; };
    var rows = top.map(function (n) { return row(n, '', false); }).join('') + AFRICA.filter(function (c) { return !inTop(c); }).map(function (c) { return row(c, '', false); }).join('');
    var same = sel.length === ns.length && sel.every(function (x) { return ns.indexOf(x) >= 0; });
    return '<div class="pop pmenu psub scopepop" role="dialog" aria-label="Choose markets"><div class="psub-h"><b>Choose markets</b>' + '<button type="button" class="popx" data-act="popClose" data-arg="scope" aria-label="Close" title="Close"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>' + '</div>' +
      '<input class="psub-q sq" type="search" placeholder="Search countries" aria-label="Search countries" value="' + esc(S.scopeQ || '') + '" autocomplete="off">' +
      '<div class="ttl-box kbbox psub-box"><div class="ttl-list">' + rows + '</div>' + SBH + '</div><p class="psub-none" hidden>No country matches.</p>' +
      '<div class="psub-f"><span>' + (sel.length ? sel.length + ' selected' : 'Choose one or more') + '</span><button type="button" class="psub-done sel" data-act="scopeGo" data-arg="' + a.id + '"' + (!sel.length ? ' disabled' : '') + '>Select</button></div>' +
      '</div>';
  }
  function kbChip() {
    var K = window.vsKbs; if (!K) return '';
    var a = K.active();
    /* shown only while a knowledge base is switched on; choosing one happens in the + menu */
    if (!a) return '';
    if (!document.getElementById('kbx-css')) { var kc = document.createElement('style'); kc.id = 'kbx-css'; kc.textContent = '#va .va-main .kbchip.kbon{display:inline-flex;align-items:center;gap:0;padding:0;height:30px;font-size:13px!important;line-height:1!important}#va .va-main .kbchip.kbon span,#va .va-main .kbchip.kbon>button{font-size:13px!important;line-height:1!important;font-weight:400!important}#va .va-main .kbchip.kbon svg{width:13px;height:13px}#va .va-main .kbchip.kbon>button{display:inline-flex;align-items:center;gap:6px;height:100%;padding:0 4px 0 12px;border:0;background:none;font:inherit;color:inherit;cursor:pointer;border-radius:inherit}#va .va-main .kbchip.kbon>button.kbx{width:28px;padding:0;justify-content:center;color:#8E8D92}#va .va-main .kbchip.kbon>button.kbx:hover{color:#3A3A3C}#va .va-main .kbchip.kbon>button.kbx svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}'; document.head.appendChild(kc); }
    return '<span class="kbchip kbon"><button type="button" data-act="plus" aria-label="Knowledge Base: ' + esc(a.name) + '. Change">' + ic('shield', 's') + '<span>' + esc(a.name) + '</span></button><button type="button" class="kbx" data-act="kbSel" data-arg="" aria-label="Stop using ' + esc(a.name) + '" title="Stop using this knowledge base"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button></span>';
  }
  function kbMenu() {
    var K = window.vsKbs; if (!K) return '';
    var a = K.active(), list = K.list();
    return '<p class="mhead">Knowledge Base</p><div class="ttl-box kbbox"><div class="ttl-list">' + list.map(function (x) {
      var on = a && a.id === x.id;
      return '<button type="button" class="mitem kbopt' + (on ? ' on' : '') + '" role="menuitemradio" aria-checked="' + on + '" data-act="kbSel" data-arg="' + x.id + '"><span class="kbn">' + esc(x.name) + (x.sample ? ' <em>Sample</em>' : '') + '</span>' + (on ? ic('check', 's') : '') + '</button>';
    }).join('') + '</div><div class="ttl-sb" aria-hidden="true"><button type="button" class="ttl-up" tabindex="-1"></button><span class="ttl-tr"><i class="ttl-th"></i></span><button type="button" class="ttl-dn" tabindex="-1"></button></div></div>' +
      '<button type="button" class="mitem kbopt' + (a ? '' : ' on') + '" role="menuitemradio" aria-checked="' + !a + '" data-act="kbSel" data-arg=""><span class="kbn">None: platform evidence only</span>' + (a ? '' : ic('check', 's')) + '</button>' +
      '<button type="button" class="mitem kbman" role="menuitem" data-act="kbManage">Manage knowledge bases</button>';
  }
  window.addEventListener('vs-kbs', function () { renderComposer(); });
  function renderComposer() {
    if (!S.plus) unsee('p-plus');
    var cur = ACTIONS_MENU.filter(function (a) { return a.id === S.mode; })[0];
    var h = '<button type="button" class="plusbtn" data-act="plus" aria-label="Add context" aria-expanded="' + S.plus + '">' + ic('plus', 's') + '</button>';
    if (S.plus) {
      if (S.sub === 'place') h += '<div class="pop pmenu psub' + fx('p-plus', 'popin') + '" role="dialog" aria-label="Add a market or area">' + placeMenu() + '</div>';
      else h += '<div class="pop pmenu' + fx('p-plus', 'popin') + '" role="menu">' + '<button type="button" class="popx" data-act="popClose" data-arg="plus" aria-label="Close" title="Close"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>' +
        '<button type="button" class="mitem" role="menuitem" data-act="ctxFile">' + ic('clip', 's') + 'Attach a file' + ((S.files || []).length ? '<em class="pcount">' + S.files.length + '</em>' : '') + '</button>' +
        kbMenu() + '</div>';
    }
    var kst = ($('plus').querySelector('.kbbox .ttl-list') || {}).scrollTop || 0;
    $('plus').innerHTML = h;
    if (S.plus) ttlBar($('plus'), kst);
    S.places = []; $('modeChip').innerHTML = kbChip() + ctxChips() + (cur ? '<span class="modechip">' + ic(cur.icon, 's') + cur.label + '<button type="button" class="x" data-act="clearMode" aria-label="Remove ' + cur.label + '">' + ic('x', 's', 'width:12px;height:12px') + '</button></span>' : '');
    $('ask').placeholder = cur ? cur.ph : 'Ask about a market, product or competitor…';
  }

  function srcType(e) { return e.sig || /^Ground-Level/.test(e.src) ? 'Ground-Level' : (e.you || /^(Your|Sample) /.test(e.src)) ? 'Your data' : /Simulat/.test(e.src + ' ' + (e.chip || '')) ? 'Simulation' : 'Market data'; }
  /* =========================================================
     Source details: what a piece of evidence is, where it comes
     from, how it was checked, and the records behind it.
     ========================================================= */
  P.doc = 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6';
  P.cal = 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4';
  P.db = 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3';
  P.folder = 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z';
  P.ext = 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5';
  P.back = 'M15 18l-6-6 6-6';
  P.photo = 'M4 6h3l2-2h6l2 2h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM12 9a4 4 0 1 0 0 8a4 4 0 1 0 0-8z';
  var COMPANY_SRC = [
    { rx: /deliver/i, name: 'Delivery records', type: 'Delivery records', file: 'Delivery_Log', ext: 'xlsx' },
    { rx: /sell-out|sales data|sales/i, name: 'Sales data', type: 'Sell-out records', file: 'Weekly_Sellout', ext: 'xlsx' },
    { rx: /order/i, name: 'Order records', type: 'Order records', file: 'Outlet_Orders', ext: 'csv' },
    { rx: /coverage|distribut/i, name: 'Distributor coverage', type: 'Distributor records', file: 'Distributor_Coverage', ext: 'xlsx' },
    { rx: /loyalty/i, name: 'Loyalty data', type: 'Repeat purchase records', file: 'Loyalty_Export', ext: 'csv' }
  ];
  var MON = { jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec' };
  var FULLMON = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
  function longDate(d) { return String(d).replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, function (m) { return FULLMON[m]; }); }
  function yearOf(d) { var m = String(d).match(/(\d{4})/); return m ? m[1] : '2026'; }
  function kbTitle(a) { var K = window.vsKbs, k = K && K.active(); return (k && k.name) || (a && a.kb) || 'Company knowledge base'; }
  function companyName() { var K = window.vsKbs, a = K && K.active(), l = K && K.list(); var x = a && l && l.filter(function (y) { return y.id === a.id; })[0]; return x && !x.sample ? x.name : 'Your company'; }
  function srcInfo(a, e) {
    var t = srcType(e), txt = e.src + ' ' + e.text, pl = a.place || { name: '', areas: [] };
    var date = /today/.test(e.src) ? 'Today' : (function () { var r = e.src.match(/([A-Z][a-z]+)\s+–\s+([A-Z][a-z]+)\s+(\d{4})/); if (r) return (MON[r[1].slice(0, 3).toLowerCase()] || r[1]) + ' – ' + (MON[r[2].slice(0, 3).toLowerCase()] || r[2]) + ' ' + r[3]; var m = e.src.match(/([A-Z][a-z]+)\s+(\d{4})\s*$/); if (m) return (MON[m[1].slice(0, 3).toLowerCase()] || m[1]) + ' ' + m[2]; return 'Nov 2026'; })();
    var areas = (pl.areas || []).filter(function (x) { return e.text.indexOf(x) >= 0; });
    var cov = areas.length ? areas.join(', ') : pl.name || 'This market';
    var nResp = (e.src.match(/(\d+)\s+(?:verified|shopper|responses|shelf)/) || e.chip.match(/(\d+)/) || [])[1];
    var info = { type: t, date: date, coverage: cov, place: pl.name };
    if (t === 'Your data') {
      var c = COMPANY_SRC.filter(function (x) { return x.rx.test(txt); })[0] || { name: 'Company records', type: 'Company records', file: 'Company_Records', ext: 'xlsx' };
      var ym = (date.match(/(\w{3})\s+(\d{4})$/) || [0, 'Oct', '2026']);
      info.name = c.name; info.kind = 'Company data'; info.dataType = c.type; info.from = 'Your Knowledge Base'; info.badge = ['Verified', 'ok'];
      info.how = 'From your own records, connected to your Knowledge Base. Private to your company and never shared with other customers.';
      var co = companyName(), y = ym[2];
      info.refs = [
        { by: co, yr: y, title: c.file + '_' + ym[1] + y + '.' + c.ext, desc: c.type + ', ' + (pl.name || 'all markets') + ' [Internal company dataset, private]', note: 'Updated 12 ' + FULLMON[ym[1]] + ' ' + y + '.' },
        { by: co, yr: y, title: (c.name === 'Distributor coverage' ? 'Sales channels overview' : 'Data notes: ' + (pl.name || 'company records')), desc: '[Internal document, PDF, private]', note: 'Updated 10 ' + FULLMON[ym[1]] + ' ' + y + '.' }
      ];
      info.cta = { act: 'srcKb', label: 'Open Knowledge Base' };
      var kn = kbTitle(a);
      info.name = kn; info.kind = 'Knowledge Base'; info.dataType = 'Company knowledge'; info.from = kn; info.icon = 'folder';
      info.how = 'From your Knowledge Base: what your company has set out about its mission, objectives, goals, strategy, processes and operations, with the documents added to it. Private to your company and never shared with other customers.';
      info.refs = [{ by: co, yr: y, title: kn, desc: '[Knowledge Base, private]', note: 'Private to your company.' }];
    } else if (t === 'Ground-Level') {
      var n = +nResp || 20;
      info.coverage = (pl.areas || []).length ? pl.areas.join(', ') : cov; info.icon = 'users';
      info.name = 'SavoScout field checks'; info.kind = 'Ground-Level Intelligence'; info.dataType = 'Field observations with photos'; info.from = 'SavoScouts'; info.badge = ['Verified', 'ok'];
      info.how = n + ' responses passed verification: submitted within 100 metres of the outlet, time-stamped, with a shelf photo, and checked against other responses from the same area.';
      info.refs = [
        { by: 'Verisavo SavoScouts', yr: yearOf(date), title: (a.product && !/^your /i.test(a.product) ? a.product.charAt(0).toUpperCase() + a.product.slice(1) : 'Product') + ' availability in ' + (pl.name || 'the market') + ': outlet field checks', desc: '[Ground-Level Intelligence, ' + n + ' verified responses with geo-tagged photos, ' + info.coverage + ']', note: 'Collected ' + longDate(date) + '.' }
      ];
      info.cta = e.resp ? { act: 'srcResp', label: 'View investigation' } : { act: 'openInv', label: 'View investigation' };
    } else {
      var pub = e.src.split(' · ')[0];
      info.icon = 'chart';
      info.name = pub; info.kind = /public record/i.test(pub) ? 'Public records' : /review|discussion|sentiment|trend|social|forum|communit|online|digital/i.test(pub) ? 'Digital information' : 'Market data'; info.dataType = /review|discussion/i.test(pub) ? 'Reviews and trends' : /sentiment/i.test(pub) ? 'Sentiment' : /trend/i.test(pub) ? 'Trends' : /price/i.test(pub) ? 'Price observations' : /listing/i.test(pub) ? 'Retail listings' : /record|notice/i.test(pub) ? 'Official notices' : 'Market observations';
      info.from = /Memory/.test(pub) ? 'Verisavo Market Memory' : info.kind === 'Digital information' ? '' : 'Verisavo market data'; info.badge = ['Cross-checked', 'pub'];
      info.how = info.kind === 'Digital information' ? 'Reviews, trends and discussions related to this topic, compared with other evidence for the same place and period. Not yet confirmed on the ground.' : 'Collected from public and market sources and compared with other observations for the same place and period. Not yet confirmed on the ground.';
      info.refs = [
        { by: /Memory/.test(pub) ? 'Verisavo Market Memory' : /NAFDAC|Public records/i.test(e.src) ? (e.src.split(' · ')[1] || 'Public records') : 'Verisavo', yr: yearOf(date), title: pub + (pl.name ? ', ' + pl.name : ''), desc: '[' + info.kind + ', ' + info.dataType.toLowerCase() + ']', note: (date === 'Today' ? 'Accessed today.' : 'Covering ' + longDate(date) + '.') }
      ];
      info.cta = { act: 'srcPub', label: 'View source' };
      var lay = layerOf(srcLayer(e));
      if (e.org || lay.k !== 'market') { info.kind = lay.name; info.name = srcOrg(e); if (e.doc) info.dataType = e.doc; info.from = srcOrg(e); info.refs[0].by = srcOrg(e); info.refs[0].desc = '[' + lay.name + (e.doc ? ', ' + e.doc.toLowerCase() : '') + ']'; }
    }
    return info;
  }
  function fileIcon(k) {
    if (k === 'xls') return '<span class="fi fi-x">X</span>';
    if (k === 'pdf') return '<span class="fi fi-p">PDF</span>';
    if (k === 'photo') return '<span class="fi fi-n">' + ic('photo', 's') + '</span>';
    if (k === 'resp') return '<span class="fi fi-n">' + ic('users', 's') + '</span>';
    return '<span class="fi fi-n">' + ic('doc', 's') + '</span>';
  }
  function renderSource(a, i) {
    var e = a.ev[i]; if (!e) return '';
    var rid = a.id + ':' + i;
    var grp = function (x) { return srcLayer(x); };
    /* an assumption's check result is shown in its assumption card, not among the sources */
    var by = {}; a.ev.forEach(function (x, j) { if (x.asRef && j !== i) return; var g = grp(x); (by[g] = by[g] || []).push(j); });
    var TABS = [['kb', 'Knowledge Base'], ['pub', 'Public records'], ['dig', 'Digital'], ['gl', 'Ground']].filter(function (t) { return by[t[0]]; });
    var cur = grp(e), curName = cur === 'gl' ? 'Ground-Level Intelligence' : cur === 'kb' ? 'Knowledge Base' : layerOf(cur).name;
    var h = '<aside class="sheet srcview' + fx('srcv-' + a.id, 'slide') + '" aria-label="Sources"><div class="grab"></div>' +
      '<div class="shead"><button class="icb srcback" data-act="srcBack" data-arg="' + rid + '" aria-label="Back to Market Understanding">' + ic('back', 's') + '</button><div><h2>' + curName + '</h2></div><button class="icb" data-act="closeSheet" aria-label="Close">' + ic('x', 's') + '</button></div><div class="sbody">';
    if (false) h += '<div class="seg srctabs" role="tablist">' + TABS.map(function (t) { var on = t[0] === cur, n = (by[t[0]] || []).length; if (t[0] === 'kb' && n) n = 1; return '<button type="button" role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" data-act="srcTab" data-arg="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
    var list = by[cur] || [];
    if (cur === 'kb' && list.length) {
      h += '<ul class="kx-list srclist"><li><button type="button" class="kx-row" data-act="srcKb" data-arg="' + a.id + ':' + list[0] + '"><span class="kx-ico" aria-hidden="true">' + ic('folder', 's') + '</span><span class="kx-txt"><span class="kx-t">' + esc(kbTitle(a)) + '</span></span><span class="kx-chev" aria-hidden="true">' + ic('chev', 's') + '</span></button></li></ul>';
    } else if (!list.length) {
      h += '<p class="srcnone">No ground signals or evidence for this question yet.</p>';
    } else {
      h += '<ol class="srcitems">' + list.map(function (j) {
        var x = a.ev[j], s = srcInfo(a, x), more = '';
        if (cur !== 'gl') more = '<span class="srck">' + esc(cur === 'sim' ? 'Model result' : srcOrg(x) + (x.doc ? ' · ' + x.doc : '')) + '</span>';
        var act = cur === 'gl' ? '<button type="button" class="kx-link" data-act="' + s.cta.act + '" data-arg="' + a.id + ':' + j + '">' + esc(s.cta.label) + '</button>' : '';
        return '<li' + (j === i ? ' class="on"' : '') + '>' + more + '<p class="srcfind">' + esc(x.text) + '</p><p class="srchow">' + (cur === 'sim' ? 'Based on the evidence and assumptions in this answer, ' + esc(s.date) : esc(s.coverage) + ', ' + esc(s.date)) + '</p>' + act + '</li>';
      }).join('') + '</ol>';
      if (cur === 'sim') h += '<p class="srchow srcfoot">A simulation shows what could happen, not what has been observed. It is only as strong as the evidence and assumptions behind it.</p>';
      if (cur === 'digital') h += '<p class="srchow srcfoot">From social media, forums, online reviews and commentators on this topic. Not yet confirmed on the ground.</p>';
    }
    return h + '</div></aside>';
  }

  P.cart = 'M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2M9.5 20.5a1 1 0 1 0 0 .01M17.5 20.5a1 1 0 1 0 0 .01';
  P.truck = 'M2 6h11v9H2zM13 9h4l4 4v2h-8zM6 18a2 2 0 1 0 0 .01M17 18a2 2 0 1 0 0 .01';
  P.tag = 'M3 12V4h8l9.3 9.3a1.6 1.6 0 0 1 0 2.3l-5.7 5.7a1.6 1.6 0 0 1-2.3 0zM7.5 8a.5.5 0 1 0 0 .01';
  P.net = 'M12 3a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM5 16a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM19 16a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM11 7.8l-4.8 8.4M13 7.8l4.8 8.4M7.5 18.5h9';
  P.trend = 'M3 17l6-6 4 4 8-8M15 7h6v6';
  function topicIcon(t) {
    if (/deliver|van|route|depot/i.test(t)) return 'truck';
    if (/distributor|covered|served by|wholesal/i.test(t)) return 'net';
    if (/price|cheaper|expensive|₦|discount|promotion|margin|credit/i.test(t)) return 'tag';
    if (/shopper|switch|loyal|prefer|buyer/i.test(t)) return 'users';
    if (/missing|shelf|stock|outlet|kiosk|facing/i.test(t)) return 'cart';
    if (/sell-out|sales|fell|rose|week/i.test(t)) return 'trend';
    return 'doc';
  }
  function knownCard(a, e, i) {
    var s = srcInfo(a, e), t = s.type, rid = a.id + ':' + i;
    var cnt = t === 'Ground-Level' ? ((e.src.match(/(\d+)\s+(?:verified|shopper|responses|shelf)/) || e.chip.match(/(\d+)/) || [])[1] || '') + ' responses'
      : t === 'Your data' ? s.name : ((e.chip.match(/(\d+)\s+outlets?/) || e.text.match(/(\d+)\s+outlets?/) || [])[1] ? (e.chip.match(/(\d+)\s+outlets?/) || e.text.match(/(\d+)\s+outlets?/))[1] + ' records' : s.dataType);
    var pill = t === 'Your data' ? ['Knowledge Base', 'db', 'y'] : t === 'Ground-Level' ? ['Ground-Level', 'users', 'g'] : [s.kind, s.kind === 'Digital information' ? 'trend' : 'chart', s.kind === 'Digital information' ? 'd' : 'm'];
    var cta = t === 'Your data' ? '<button class="kcta" data-act="srcKb" data-arg="' + rid + '">Open Knowledge Base' + ic('arrow', 's') + '</button>'
      : t === 'Ground-Level' ? (e.resp ? '<button class="kcta" data-act="openResp" data-arg="' + e.resp + '">View responses' + ic('arrow', 's') + '</button>' : '<button class="kcta" data-act="openInv">View Investigations' + ic('arrow', 's') + '</button>')
      : '<button class="kcta" data-act="srcOpen" data-arg="' + rid + '">View source' + ic('ext', 's') + '</button>';
    return '<div class="kcard k-' + pill[2] + (S.hl === rid ? ' hl' : '') + (e.isNew ? ' new' : '') + '" id="item-' + a.id + '-' + i + '"><span class="kico">' + ic(topicIcon(e.text), 's') + '</span>' +
      '<div class="kbody"><button type="button" class="ktext" data-act="srcOpen" data-arg="' + rid + '" title="Source details">' + esc(e.text) + '</button>' +
      '<div class="kmeta">' + (cnt ? '<span>' + esc(cnt) + '</span>' : '') + '<span>' + ic('pin', 's') + esc(s.coverage) + '</span></div></div>' +
      '<div class="kact">' + cta + '</div></div>';
  }
  /* =========================================================
     Source layers: every finding is filed under the kind of
     source it came from, most reliable first. A finding can name
     its layer, organisation and document (layer, org, doc);
     otherwise the layer is read from its source line.
     ========================================================= */
  P.bank = 'M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18';
  P.scale = 'M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z';
  P.book = 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 19v2H6M8 7h7M8 11h5';
  P.news = 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7M7 16h4';
  P.chat = 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5';
  var LAYERS = [
    { k: 'kb', name: 'Your company data', key: 'Your data', trust: ['Private', 'ok'], icon: 'folder', bg: '#E8EEF7', fg: '#2E4A7D' },
    { k: 'memory', name: 'Market Memory', key: 'Market Memory', trust: ['Earlier findings', 'no'], icon: 'db', bg: '#ECEBFA', fg: '#3D4BA8' },
    { k: 'inst', name: 'Institutions', key: 'Institutions', trust: ['Official', 'ok'], icon: 'bank', bg: '#E6F2EB', fg: '#3F7D5C' },
    { k: 'policy', name: 'Policies and regulations', key: 'Policy', trust: ['Official', 'ok'], icon: 'scale', bg: '#EFEAF7', fg: '#6B4FA0' },
    { k: 'research', name: 'Research', key: 'Research', trust: ['Published', 'no'], icon: 'book', bg: '#F6F0E2', fg: '#8A6A1E' },
    { k: 'market', name: 'Market data & statistics', key: 'Market data & statistics', trust: ['Published', 'no'], icon: 'chart', bg: '#E8F1F6', fg: '#2F6E8C' },
    { k: 'alt', name: 'Alternative data', key: 'Alternative data', trust: ['Indicative', 'no'], icon: 'net', bg: '#E3F3F1', fg: '#1F7A72' },
    { k: 'news', name: 'News and media', key: 'News', trust: ['Reported', 'no'], icon: 'news', bg: '#EEF1F5', fg: '#55596A' },
    { k: 'digital', name: 'Digital & social reviews', key: 'Digital & social reviews', trust: ['Not yet confirmed', 'part'], icon: 'chat', bg: '#FBEDE6', fg: '#B4532A' },
    { k: 'sim', name: 'Simulation', key: 'Simulation', trust: ['Model result', 'no'], icon: 'chart', bg: '#EEF1F5', fg: '#55596A' }
  ];
  function layerOf(k) { for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i].k === k) return LAYERS[i]; return LAYERS[4]; }
  function srcLayer(e) {
    if (e.layer) return e.layer;
    var t = srcType(e); if (t === 'Your data') return 'kb'; if (t === 'Ground-Level') return 'gl'; if (t === 'Simulation') return 'sim';
    var s = e.src + ' ' + (e.chip || '') + ' ' + (e.org || '');
    if (/Market Memory|earlier investigation|previous investigation/i.test(s)) return 'memory';
    if (/alternative data|weather|rainfall|flood|drought|harvest|festival|ramadan|eid\b|christmas|holiday|fuel (shortage|scarcity)|strike|security incident|local conditions|satellite|footfall|foot traffic|mobile money|payments? data|transaction data|card data|web traffic|search (data|trend)|app (download|usage)|shipping data|port data|geolocation|location data/i.test(s)) return 'alt';
    if (/review|discussion|sentiment|social|forum|communit|online|digital|twitter|instagram|tiktok|commentator/i.test(s)) return 'digital';
    if (/levy|tariff|regulat|polic|\blaw\b|gazette|customs|revenue authority|NAFDAC|ministry|public record/i.test(s)) return 'policy';
    if (/central bank|statistic|association|chamber|union|federation|bureau|world bank|\bIMF\b|development bank|institute/i.test(s)) return 'inst';
    if (/research|study|studies|paper|journal|university|academic|Market Memory/i.test(s)) return 'research';
    if (/news|press|media/i.test(s)) return 'news';
    return 'market';
  }
  function srcOrg(e) { var L = srcLayer(e); return (e.org || (L === 'sim' ? 'Market Simulator' : e.src.split(' · ')[0])).replace(/^Verisavo Market Memory/, 'Market Memory'); }
  function layerRow(a, e, i) {
    var L = srcLayer(e); if (L === 'kb') return knownRow(a, e, i);
    var s = srcInfo(a, e), rid = a.id + ':' + i;
    var meta = L === 'sim' ? '<b>Market Simulator</b> · based on the evidence and assumptions below'
      : '<b>' + esc(srcOrg(e)) + '</b> · ' + esc(e.doc || s.coverage) + (s.date ? ' · ' + esc(s.date) : '');
    return '<li><button type="button" class="kx-row kx-noico' + (S.hl === rid ? ' hl' : '') + (e.isNew ? ' new' : '') + '" id="item-' + a.id + '-' + i + '" data-act="srcOpen" data-arg="' + rid + '">' +
      '<span class="kx-txt"><span class="kx-t">' + esc(e.text) + '</span><span class="kx-s kx-meta">' + meta + '</span></span>' +
      '<span class="kx-chev" aria-hidden="true">' + ic('chev', 's') + '</span></button></li>';
  }
  function layerCards(a, idx) {
    var by = {}; idx.forEach(function (i) { var k = srcLayer(a.ev[i]); (by[k] = by[k] || []).push(i); });
    var present = LAYERS.filter(function (L) { return by[L.k]; });
    var key = present.length > 1 ? '<div class="kx-mix" aria-hidden="true">' + present.map(function (L) { return '<span><i style="background:' + L.fg + '"></i>' + L.key + ' ' + (L.k === 'kb' ? 1 : by[L.k].length) + '</span>'; }).join('') + '</div>' : '';
    return { n: present.length, html: key + present.map(function (L) {
      var rows = L.k === 'kb' ? by.kb.slice(0, 1) : by[L.k];
      return '<div class="kx-layer" aria-label="' + L.name + '"><div class="kx-lh"><span class="kx-lico" style="background:' + L.bg + ';color:' + L.fg + '" aria-hidden="true">' + ic(L.icon, 's') + '</span><b>' + L.name + '</b><span class="apill ' + L.trust[1] + '">' + L.trust[0] + '</span><span class="kx-n">' + rows.length + '</span></div>' +
        '<ul class="kx-list">' + rows.map(function (i) { return layerRow(a, a.ev[i], i); }).join('') + '</ul>' +
        (L.k === 'digital' ? '<p class="kx-lnote">Online views can be loud but unrepresentative. Check them on the ground before acting.</p>' : '') + '</div>';
    }).join('') };
  }
  function knownRow(a, e, i) {
    var s = srcInfo(a, e), t = s.type, rid = a.id + ':' + i;
    var cnt = t === 'Ground-Level' ? ((e.src.match(/(\d+)\s+(?:verified|shopper|responses|shelf)/) || e.chip.match(/(\d+)/) || [])[1] || '') + ' verified responses'
      : t === 'Your data' ? s.name : t === 'Simulation' ? 'Simulation' : s.dataType;
    if (t === 'Simulation') s = { type: t, coverage: 'based on the evidence and assumptions below' };
    if (t === 'Your data') return '<li><button type="button" class="kx-row" id="item-' + a.id + '-' + i + '" data-act="srcKb" data-arg="' + rid + '"><span class="kx-ico" aria-hidden="true">' + ic('folder', 's') + '</span><span class="kx-txt"><span class="kx-t">' + esc(s.name) + '</span></span><span class="kx-chev" aria-hidden="true">' + ic('chev', 's') + '</span></button></li>';
    var act = t === 'Ground-Level' && e.resp ? 'data-act="openResp" data-arg="' + e.resp + '"' : 'data-act="srcOpen" data-arg="' + rid + '"';
    return '<li><button type="button" class="kx-row' + (S.hl === rid ? ' hl' : '') + (e.isNew ? ' new' : '') + '" id="item-' + a.id + '-' + i + '" ' + act + '>' +
      '<span class="kx-ico" aria-hidden="true">' + ic(topicIcon(e.text), 's') + '</span>' +
      '<span class="kx-txt"><span class="kx-t">' + esc(e.text) + '</span><span class="kx-s">' + esc(cnt) + ', ' + esc(s.coverage) + '</span></span>' +
      '<span class="kx-chev" aria-hidden="true">' + ic('chev', 's') + '</span></button></li>';
  }
  function renderSheet() {
    var host = $('sheet');
    MAIN.classList.toggle('sheet-open', !!S.sheet);
    if (!S.sheet) { host.innerHTML = ''; unsee('sheet'); S.srcView = null; S.half = false; return; }
    /* keep the panel still when it re-renders in place (e.g. ticking a gap): same tab, same scroll position */
    var osb = host.querySelector('.sbody'), keepTop = osb && !S.srcView && host.getAttribute('data-tab') === S.sheet ? osb.scrollTop : null;
    host.setAttribute('data-tab', S.srcView ? 'src' : S.sheet);
    if (S.srcView) { var sp = S.srcView.split(':'), sa = A(sp[0]); if (sa && sa.ev[+sp[1]]) { host.innerHTML = renderSource(sa, +sp[1]); return; } S.srcView = null; }
    var a = A(S.active) || S.answers[0], og = openGaps();
    if (!a) { host.innerHTML = ''; MAIN.classList.remove('sheet-open'); S.sheet = null; return; }
    /* on phones, See in chat lowers the panel to half height so the chat shows above it; tap or drag the handle up to bring it back */
    var hf = S.half ? ' data-act="sheetFull" role="button" tabindex="0" aria-label="Show Market Understanding in full"' : '';
    var h = '<aside class="sheet' + (S.half ? ' half' : '') + fx('sheet', 'slide') + '" aria-label="Sources, gaps and assumptions"><div class="grab"' + hf + '></div>' + (S.half ? '<button type="button" class="smore" data-act="sheetFull">' + ic('chev', 's', 'transform:rotate(180deg)') + 'Show more</button>' : '') + '<div class="shead"' + (S.half ? ' data-act="sheetFull"' : '') + '><div><h2>Market Understanding</h2>' +
      (S.sheet === 'gaps' ? '' : '<p class="small" style="margin-top:3px">For: ' + esc(trunc(a.q, 60)) + '</p>') + '</div><button class="icb" data-act="closeSheet" aria-label="Close">' + ic('x', 's') + '</button></div>';
    var nUnknown = S.answers.filter(function (x) { return x.status === 'done' && x.gap && x.gap.state !== 'refined'; }).reduce(function (n, x) { return n + (x.gap.state === 'open' ? gapList(x).length : 1); }, 0);
    h += '<div class="seg" role="tablist">' + [['ev', 'Known (' + a.ev.length + ')'], ['gaps', 'Unknown (' + nUnknown + ')']].map(function (t) {
      var on = S.sheet === t[0]; return '<button role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" data-act="tab" data-arg="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div><div class="sbody">';

    if (S.sheet === 'ev') {
      // Known: three plain sections (Evidence, From the ground, Assumptions); an assumption's check result lives only in its card
      var st = strength(a), evI = [], glI = [], kbSeen = false;
      a.ev.forEach(function (e, i) {
        if (e.asRef) return;
        var t = srcType(e);
        if (t === 'Ground-Level') { glI.push(i); return; }
        if (t === 'Your data') { if (kbSeen) return; kbSeen = true; }
        evI.push(i);
      });
      var ksec = function (title, meta, desc, body) { return '<section class="kx-sec" aria-label="' + title + '"><div class="kx-sh"><h4>' + title + '</h4>' + (meta ? '<span>' + meta + '</span>' : '') + '</div><p class="kx-sd">' + desc + '</p>' + body + '</section>'; };
      var kempty = function (icon, text, extra) { return '<ul class="kx-list"><li><div class="kx-row kx-empty"><span class="kx-ico" aria-hidden="true">' + ic(icon, 's') + '</span><span class="kx-txt"><span class="kx-t">' + text + '</span>' + (extra || '') + '</span></div></li></ul>'; };
      h += '<p class="kx-intro">What this answer is built on, and how solid it is. Tap any item to see where it came from.</p>';
      var lc = layerCards(a, evI);
      h += ksec('Evidence', evI.length + ' finding' + (evI.length === 1 ? '' : 's') + (lc.n > 1 ? ' from ' + lc.n + ' types of source' : '') + ' · ' + st[0], 'Facts Verisavo found for this question, grouped by where they came from.',
        evI.length ? lc.html : kempty('file', 'No evidence for this question yet.'));
      h += ksec('From the ground', glI.length + ' signal' + (glI.length === 1 ? '' : 's'), 'Signals and investigations from your Market Memory.',
        glI.length ? '<ul class="kx-list">' + glI.map(function (i) { return knownRow(a, a.ev[i], i); }).join('') + '</ul>'
          : kempty('users', 'Nothing checked on the ground for this question yet.', nUnknown ? '<button type="button" class="kx-lnk" data-act="tab" data-arg="gaps">Investigate on the ground</button>' : '<span class="kx-s">Ask why, where or what changed to find gaps SavoScouts can check.</span>'));
    }

    if (S.sheet === 'gaps') {
      var items = S.answers.filter(function (x) { return x.status === 'done' && x.gap && x.gap.state !== 'refined'; }).slice().reverse();
      h += items.map(function (x) {
        var g = x.gap, lab = { open: 'Open', running: 'Investigating', ready: 'Results ready', closed: 'Closed' }[g.state];
        var o = '<div class="gitem' + (g.state === 'closed' ? ' closed' : '') + (S.hl === x.id ? ' hl' : '') + '" id="gap-' + x.id + '"><span class="k' + (g.state === 'closed' ? ' ok' : '') + '">' + lab + '</span><span class="t">' + esc(g.q) + '</span>';
        if (g.state === 'closed') return o + '<span class="from">Answered by ' + g.total + ' verified SavoScout responses · today</span><button class="lnk" data-act="openResp" data-arg="' + x.id + '">View responses</button></div>';
        o += '<span class="from">' + (g.qs && g.qs.length > 1 ? g.qs.length + ' questions · ' : '') + 'From: ' + esc(trunc(x.q, 70)) + '</span>';
        if (g.state === 'open') {
          var list = gapList(x), sel = gsel(), ns = list.filter(function (it) { return sel[it.id]; }).length;
          var open = (g.pendingTask ? '<div class="pend"><span class="spin"></span>Task being set up in Create a task. It will run here once you deploy it.</div>' : '') + '<div class="gchk"><p class="small" style="margin-bottom:6px">What the evidence can’t answer yet. Tick what you want SavoScouts to look into.</p><ul class="glist">' + list.map(function (it) {
            var on = !!sel[it.id];
            return '<li><label class="gopt' + (on ? ' on' : '') + '"><input type="checkbox" data-ch="gsel" value="' + it.id + '"' + (on ? ' checked' : '') + '><span class="box">' + ic('check', 's', 'width:12px;height:12px') + '</span><span class="gbody"><span class="gq">' + esc(it.q) + '</span>' + (it.why ? '<span class="gwhy">Why it matters: ' + esc(it.why) + '</span>' : '') + explain(it) + '<span class="gfrom">From your question · ' + ago(it.at) + '</span></span></label>' + gPrev(it) + '</li>';
          }).join('') + '</ul>';
          if (S.plan && S.plan.aid === x.id && !x.investigateNow) open += planCard(x);
          else open += '<div class="gact"><button class="btn dark" data-act="fullTask" data-arg="' + x.id + '"' + (ns ? '' : ' disabled') + '>' + ic('plus', 's') + 'Investigate this gap' + (ns > 1 ? ' · ' + ns + ' gaps' : '') + '</button><span class="small">Verisavo prepares the task questions from the gaps you tick.</span></div>';
          return '<div class="gitem' + (S.hl === x.id ? ' hl' : '') + '" id="gap-' + x.id + '">' + open + '</div>';
        }
        if (g.state === 'running') o += '<div class="status"><div class="spin"></div><div class="bar"><i style="width:' + Math.round(g.received / g.total * 100) + '%"></i></div><span>' + g.received + ' of ' + g.total + ' verified</span></div><span class="small">You can keep asking. I’ll let you know when it’s done.</span>';
        if (g.state === 'ready') o += '<div class="gact"><button class="btn" data-act="openResp" data-arg="' + x.id + '">Review</button><button class="btn dark" data-act="addEvidence" data-arg="' + x.id + '">' + ic('check', 's') + 'Add to this answer</button></div>' + (g.taskId ? '<p class="small" style="margin:8px 0 0"><button class="lnk" data-act="openTask" data-arg="' + esc(g.taskId) + '">Open the investigation and its briefing</button></p>' : '');
        return o + '</div>';
      }).join('');
      if (!items.length && !((S.answers[0] && S.answers[0].history) || []).length) h += '<div class="gempty"><p>No intelligence gaps yet.</p><p class="small">Gaps appear when a question goes deeper into a cause, a place or a channel than the evidence can answer. Try asking why something is happening, where it is worst, or what changed.</p></div>';
      h += ((S.answers[0] && S.answers[0].history) || []).map(function (hh) { return '<div class="gitem closed"><span class="k ok">Closed</span><span class="t">' + esc(hh.q) + '</span><span class="from">' + esc(hh.note) + '</span><button class="lnk" data-act="openResp" data-arg="kiosk">View responses</button></div>'; }).join('');
    }

    if (S.sheet === 'ev' && a.assumptions.length) {
      var nck = a.assumptions.filter(function (x) { return x.state === 'done'; }).length;
      h += '<section class="kx-sec" aria-label="Assumptions"><div class="kx-sh"><h4>Assumptions</h4><span>' + nck + ' of ' + a.assumptions.length + ' checked</span></div><p class="kx-sd">Things this answer takes as true. Check them to make it stronger.</p><div class="kx-as">' +
        a.assumptions.map(function (x, i) {
          var v = x.state === 'done' ? asVerdict(x) : x.state === 'testing' ? ['Checking', 'chk'] : ['Not checked', 'no'];
          var o = '<div class="kx-ai"><span class="apill ' + v[1] + '">' + v[0] + '</span><p class="kx-at">' + esc(x.text) + '</p>';
          if (x.state === 'done') o += '<p class="kx-ad">We checked: ' + esc(x.result.charAt(0).toLowerCase() + x.result.slice(1)) + (x.why ? ' ' + esc(x.why) : '') + '</p>';
          else if (x.why) o += '<p class="kx-ad">' + esc(x.why) + '</p>';
          if (x.state === 'testing') o += '<div class="status" style="margin-top:10px"><div class="spin"></div>Checking ' + esc(x.check) + '…</div>';
          else if (x.state !== 'done') o += '<button class="btn dark kx-ab" data-act="testAs" data-arg="' + a.id + ':' + i + '" title="Check ' + esc(x.check) + '">Check this</button>';
          return o + '</div>';
        }).join('') + '</div></section>';
    }

    host.innerHTML = h + '</div></aside>';
    /* coming back from a source: return to exactly where the list was, with no scroll jump */
    if (S.backTop != null) { keepTop = S.backTop; S.backTop = null; }
    if (keepTop !== null) { var nsb = host.querySelector('.sbody'); if (nsb) nsb.scrollTop = keepTop; }
    if (S.hl) {
      var el = document.getElementById('item-' + S.hl.replace(':', '-')) || document.getElementById('gap-' + S.hl);
      /* bring the item into view inside the panel only, never by moving the page or the panel itself */
      var sbx = host.querySelector('.sbody');
      if (el && sbx) { var er = el.getBoundingClientRect(), br = sbx.getBoundingClientRect(); if (er.top < br.top || er.bottom > br.bottom) sbx.scrollTop += er.top - br.top - 12; }
    }
  }

  // responses for the viewer: the original kiosk check, or a simulated set for any gap
  function responsesFor(key) {
    if (key === 'kiosk') {
      var dw = KIOSKS.filter(function (k) { return /Dawanau/.test(k.area); }), km = KIOSKS.filter(function (k) { return /Kurmi/.test(k.area); });
      var miss = function (l) { return l.filter(function (k) { return k.problem; }).length; };
      var m = miss(KIOSKS), md = miss(dw), mk = miss(km), hi = md >= mk;
      return { title: 'Are your packs on kiosk shelves in Dawanau and Kurmi Market?', ver: KIOSKS, yes: 'Pack missing', no: 'Pack on shelf',
        summary: {
          paras: ['Across ' + KIOSKS.length + ' verified kiosk checks, your 1kg pack was missing at ' + m + ' (' + Math.round(m / KIOSKS.length * 100) + '%), while the rival 500g pack was on the shelf at 24. The pattern was ' + (md === mk ? 'similar in both markets' : 'stronger in ' + (hi ? 'Dawanau' : 'Kurmi Market')) + ', with ' + md + ' of ' + dw.length + ' missing in Dawanau and ' + mk + ' of ' + km.length + ' in Kurmi Market.',
                  'Because the rival pack was available in the same kiosks on the same days, low demand for detergent is an unlikely explanation. The shelves point to a supply problem specific to your pack, which fits the four-day delivery delays in your own records.'],
          means: 'Availability, not price, is the most likely main cause of the slowdown in these two markets.',
          unknown: 'Why your stock runs out. These responses show the shelf, not the supply chain, so late deliveries and distributors favouring other brands are both still possible.',
          conf: 'Strong within Dawanau and Kurmi Market. Not yet checked elsewhere in Kano.' },
        details: { why: 'Separates a pricing problem from an availability problem before you change your price.', who: 'Kiosks', areas: 'Dawanau and Kurmi Market, Kano', survey: [
          { q: 'Is our 1kg pack on the shelf?', t: 'Yes / No', req: true },
          { q: 'Take a photo of the detergent shelf.', t: 'Photo', req: true },
          { q: 'Is the rival 500g pack on the shelf?', t: 'Yes / No', req: true },
          { q: 'How many of our 1kg packs are on the shelf?', t: 'Number' },
          { q: 'If our pack is missing, when did it last run out?', t: 'Single choice', o: ['Today', 'This week', 'Over a week ago', 'Not sure'] },
          { q: 'What is the shelf price of our 1kg pack?', t: 'Number · ₦' },
          { q: 'Do shoppers ask for our pack when it isn’t there?', t: 'Single choice', o: ['Often', 'Sometimes', 'Rarely'] },
          { q: 'Anything else we should know about this shelf?', t: 'Short text' }
        ], sent: '1 Nov 2026 · responses 1–3 Nov', n: KIOSKS.length } };
    }
    var a = A(key); if (!a || !a.gap || !a.gap.total) return null;
    var g = a.gap, pl = (g.place || a.place), r = rng(hash(g.q)), ver = [], n = g.total, yes = Math.round(n * (g.share || 0.6));
    var who = a.intent === 'consumer' ? 'Shoppers' : a.intent === 'entry' ? 'Distributors' : 'Retail outlets';
    var unit = a.intent === 'consumer' ? 'Shopper' : a.intent === 'entry' ? 'Distributor' : 'Outlet';
    var sel = g.areasSel && g.areasSel.length ? g.areasSel : [pl.areas[0]];
    var order = []; for (var i = 0; i < n; i++) order.push([r(), i]); order.sort(function (x, y) { return x[0] - y[0]; });
    var isYes = {}; order.slice(0, yes).forEach(function (o) { isYes[o[1]] = true; });
    var byArea = {}; sel.forEach(function (x) { byArea[x] = [0, 0]; });
    for (i = 0; i < n; i++) {
      var area = sel[i % sel.length]; byArea[area][1]++; if (isYes[i]) byArea[area][0]++;
      ver.push({ name: unit + ' ' + String(i + 1).padStart(2, '0'), area: area + ', ' + pl.name, verified: true, problem: !!isYes[i], time: 'Today, ' + (9 + Math.floor(i / 3)) + ':' + String(between(r, 0, 59)).padStart(2, '0'), sentence: isYes[i] ? g.resp[0] : g.resp[1] });
    }
    var list = function (l) { return l.length > 1 ? l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1] : l[0]; };
    var low = function (t) { return t.replace(/\.$/, '').replace(/^./, function (c) { return c.toLowerCase(); }); };
    var p1 = 'Across ' + n + ' verified responses from ' + who.toLowerCase() + ' in ' + list(sel) + ', ' + yes + ' (' + Math.round(yes / n * 100) + '%) said ' + low(g.resp[0]) + '. The other ' + (n - yes) + ' said ' + low(g.resp[1]) + '.';
    if (sel.length > 1) {
      var rates = sel.map(function (x) { return [x, byArea[x][0], byArea[x][1]]; }).sort(function (x, y) { return y[1] / y[2] - x[1] / x[2]; });
      var top = rates[0], bot = rates[rates.length - 1];
      p1 += top[1] / top[2] - bot[1] / bot[2] > 0.15 ? ' The pattern was strongest in ' + top[0] + ' (' + top[1] + ' of ' + top[2] + ') and weakest in ' + bot[0] + ' (' + bot[1] + ' of ' + bot[2] + ').' : ' The pattern was similar across ' + list(sel) + '.';
    }
    var lead = yes / n >= 0.65 ? 'clear' : yes / n > 0.4 ? 'mixed' : 'minority';
    var p2 = lead === 'clear' ? 'Most responses point the same way, and the photos and locations were consistent with what was reported. This is a firm signal for the areas checked rather than for the whole of ' + pl.name + '.'
      : lead === 'mixed' ? 'Responses lean one way but are far from one-sided, which suggests more than one cause is at work, possibly varying by outlet. Treat the second view as a real factor, not noise.'
      : 'Most responses did not confirm the issue, which weakens the explanation behind this question for the areas checked.';
    var SHORT = { main: ['Supplier delays', 'Other brands first'], price: ['Would switch back', 'Prefers the rival'], distribution: ['Distributor delays', 'Wholesaler credit'], competitor: ['Longer credit', 'Displays or bonus stock'], consumer: ['Staying with small packs', 'Going back to large'], entry: ['Open to new brands', 'Not taking new brands'], scenario: ['Would stock more', 'Limited by cash flow'], compare: ['On the shelf', 'Out of stock'], assumptions: ['Matches', 'Differs'], investigate: ['Confirmed', 'Not seen'] };
    var sh = g.short || SHORT[a.intent] || ['Not on the shelf', 'Price'];
    return { title: g.q, ver: ver.reverse(), sim: true, yes: sh[0], no: sh[1],
      summary: { paras: [p1, p2],
        means: lead === 'clear' ? 'In ' + list(sel) + ', the evidence now clearly favours one view: ' + low(g.resp[0]) + '.' : lead === 'mixed' ? 'In ' + list(sel) + ', the leading view is that ' + low(g.resp[0]) + ', but the other view is not ruled out. Both may need a response.' : 'In ' + list(sel) + ', most responses did not support this. The more common view was that ' + low(g.resp[1]) + '.',
        unknown: 'Whether the same holds in ' + (pl.areas.filter(function (x) { return sel.indexOf(x) < 0; }).length ? list(pl.areas.filter(function (x) { return sel.indexOf(x) < 0; })) + ' and other parts of ' + pl.name : 'other parts of ' + pl.name) + ', and whether it changes over the coming weeks.',
        conf: (n >= 20 ? 'Strong' : n >= 12 ? 'Moderate' : 'Limited') + ' within the areas checked, based on ' + n + ' verified responses.' },
      details: { why: g.why, who: who, areas: list(sel) + ', ' + pl.name, qs: g.qs, survey: [
        { q: g.q, t: 'Single choice', o: [cap(low(g.resp[0])), cap(low(g.resp[1])), 'Not sure'], req: true }].concat((g.qs || []).slice(1).map(function (it) { return { q: it.q, t: 'Yes / No', req: true }; })).concat([
        { q: a.intent === 'consumer' ? 'Take a photo of the shelf where shoppers choose.' : 'Take a photo of the shelf.', t: 'Photo', req: true },
        a.intent === 'price' || a.intent === 'scenario' ? { q: 'What is the shelf price of our product here?', t: 'Number · local currency' } : { q: 'Is our product on the shelf today?', t: 'Yes / No', req: true },
        { q: 'How confident are you in this answer?', t: 'Single choice', o: ['Very', 'Somewhat', 'Not very'] },
        { q: 'Anything else we should know?', t: 'Short text' }
      ]), sent: g.sentAt || 'Today', n: n } };
  }

  function surveyHtml(list) {
    var open = !!S.qall, req = list.filter(function (x) { return x.req; }).length;
    return '<div class="svy"><button class="svyh" data-act="qall" aria-expanded="' + open + '"><span class="dk" style="margin:0">Survey · ' + list.length + ' questions</span><span class="svyr"><span class="small">' + req + ' required</span>' + ic('chev', 's', 'transition:transform .2s;' + (open ? 'transform:rotate(180deg)' : '')) + '</span></button>' +
      (open ? '<div class="' + fx('svy-body', 'fade') + '"><ol class="svyl">' + list.map(function (x, i) {
        return '<li><span class="qn">' + (i + 1) + '</span><div class="qb"><p class="qt">' + esc(x.q) + (x.req ? '<span class="qr" aria-label="required">*</span>' : '') + '</p><p class="qm"><span class="qtype">' + esc(x.t) + '</span>' + (x.o ? x.o.map(function (o) { return '<span class="qo">' + esc(o) + '</span>'; }).join('') : '') + '</p></div></li>';
      }).join('') + '</ol><p class="small" style="margin-top:8px">Location and time are captured with every response.</p></div>' : (unsee('svy-body'), '')) + '</div>';
  }
  function sigDetail(r, R) {
    var x = rng(hash(r.name + R.title)), sv = (R.details && R.details.survey) || [], notes = ['Shopkeeper expects the next delivery on Friday.', 'Rival stock arrived earlier this week.', 'Shelf was being restocked during the visit.', 'No further comments.'];
    var rival = !/rival[^.]*not on the shelf/i.test(r.sentence);
    var ans = sv.filter(function (q) { return q.t !== 'Photo'; }).map(function (q, i) {
      var a;
      if (q.t === 'Yes / No') a = /rival/i.test(q.q) ? (rival ? 'Yes' : 'No') : (r.problem === /on the shelf|in stock/i.test(q.q) ? 'No' : 'Yes');
      else if (q.t === 'Single choice') a = i === 0 && R.sim ? (r.problem ? q.o[0] : q.o[1]) : /missing|run out/i.test(q.q) && !r.problem ? 'Not applicable' : q.o[Math.floor(x() * (q.o.length - (q.o[q.o.length - 1] === 'Not sure' ? 1 : 0)))];
      else if (/price/i.test(q.q) && r.problem && /our/i.test(q.q)) a = 'Not on shelf';
      else if (/₦/.test(q.t)) a = '₦' + (1450 + Math.round(x() * 10) * 10).toLocaleString();
      else if (/price/i.test(q.q)) a = (1200 + Math.round(x() * 30) * 10).toLocaleString();
      else if (q.t.indexOf('Number') === 0) a = r.problem && /our/i.test(q.q) ? '0' : String(2 + Math.floor(x() * 7));
      else a = notes[Math.floor(x() * notes.length)];
      return [q.q, a];
    });
    var lat = (12 + x() * 0.06).toFixed(4), lng = (8.50 + x() * 0.06).toFixed(4), id = 'SC-' + (100 + Math.floor(x() * 800)), rel = 88 + Math.floor(x() * 11), past = 12 + Math.floor(x() * 60);
    return '<div class="sdet fade">' +
      '<div class="sphoto" role="img" aria-label="Shelf photo">' + ic('pin', 's', 'width:15px;height:15px') + '<span>Photo · ' + esc(r.time) + '</span></div>' +
      '<div class="sbody2"><p class="sk">Answers</p><dl class="sans">' + ans.map(function (q) { return '<div><dt>' + esc(q[0]) + '</dt><dd>' + esc(q[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="sk">Verification</p><ul class="schk">' + ['Location matched the outlet (within 40 m)', 'Photo matches the answers', 'Submitted inside the requested window', 'Consistent with nearby responses'].map(function (c) { return '<li>' + ic('check', 's', 'width:13px;height:13px') + c + '</li>'; }).join('') + '</ul>' +
      '<p class="smeta">' + esc(r.area) + ' · GPS location and time recorded<br>Captured by SavoScout ' + id + ' · reliability ' + rel + '% · ' + past + ' past signals</p></div></div>';
  }
  function renderModal() {
    var host = $('modal'), h = '';
    if (S.modal) {
      var R = responsesFor(S.modal);
      if (R) {
        var nv = R.ver.length, np = R.ver.filter(function (r) { return r.problem; }).length, tab = S.filter === 'sig' ? 'sig' : 'find', sf = S.sf || 'all';
        h = '<div class="scrim' + fx('m-scrim', 'fadein') + '" data-act="scrim"><div class="dlg' + fx('m-dlg', 'popin') + '" role="dialog" aria-modal="true" aria-labelledby="rT"><div class="grab"></div><div class="dhead"><div class="dtop"><div><p class="k">Investigation</p><h3 id="rT">' + esc(R.title) + '</h3></div><button class="icb" data-act="closeModal" aria-label="Close">' + ic('x', 's') + '</button></div>' +
          '<div class="seg" role="tablist" style="margin-top:14px">' + [['find', 'Findings'], ['sig', 'Signals · ' + nv]].map(function (t) { var on = tab === t[0]; return '<button role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" data-act="filter" data-arg="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
        if (tab === 'sig') {
          var area = function (r) { return r.area.split(',')[0]; }, day = function (r) { return r.time.split(',')[0]; };
          var locs = [], days = []; R.ver.forEach(function (r) { if (locs.indexOf(area(r)) < 0) locs.push(area(r)); if (days.indexOf(day(r)) < 0) days.push(day(r)); });
          var sl = S.sloc || 'all', sd = S.sdate || 'all';
          var lst = R.ver.filter(function (r) { return (sf === 'all' || (sf === 'yes' ? r.problem : !r.problem)) && (sl === 'all' || area(r) === sl) && (sd === 'all' || day(r) === sd); });
          var sel = function (name, cur, opts, lab) { return '<label class="sel"><span class="vh">' + lab + '</span><select data-ch="' + name + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === cur ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' + ic('chev', 's') + '</label>'; };
          h += '<div class="sbar">' +
            sel('sf', sf, [['all', 'All answers'], ['yes', R.yes + ' (' + np + ')'], ['no', R.no + ' (' + (nv - np) + ')']], 'Answer') +
            sel('sloc', sl, [['all', 'All locations']].concat(locs.map(function (l) { return [l, l + ' (' + R.ver.filter(function (r) { return area(r) === l; }).length + ')']; })), 'Location') +
            sel('sdate', sd, [['all', 'Any date']].concat(days.map(function (d) { return [d, d]; })), 'Date') + '</div>' +
            '<p class="sver">' + ic('check', 's', 'width:14px;height:14px') + (lst.length === nv ? 'All ' + nv + ' signals verified' : 'Showing ' + lst.length + ' of ' + nv + ' · all verified') + '</p>' +
            '<ul class="rlist">' + (lst.length ? '' : '<li class="rnone">No signals match these filters.</li>') + lst.map(function (r) {
              var op = S.sopen === r.name;
              return '<li class="' + (op ? 'open' : '') + '"><button class="rrow" data-act="sig" data-arg="' + esc(r.name) + '" aria-expanded="' + op + '"><span class="rdot ' + (r.problem ? 'c-out' : 'c-ok') + '" title="' + esc(r.problem ? R.yes : R.no) + '"></span><div class="rmain"><p class="rn"><b>' + esc(r.name) + '</b> · ' + esc(area(r)) + '</p><p class="rd">' + esc(r.time) + '</p><p class="rs">' + esc(r.sentence) + '</p></div>' + ic('chev', 's', 'flex:none;margin-top:3px;color:var(--px-soft);transition:transform .2s;' + (op ? 'transform:rotate(180deg)' : '')) + '</button>' + (op ? sigDetail(r, R) : '') + '</li>';
            }).join('') + '</ul>';
        } else {
          var M = R.summary, D = R.details;
          h += '<div class="brief"><div class="aisum"><p class="aik">' + ic('logo', 's', 'width:14px;height:14px') + 'Findings</p><p class="aisub">Ground-Level Intelligence from ' + nv + ' verified signals</p>' +
            '<div class="split" aria-hidden="true"><i class="c-out" style="width:' + (np / nv * 100) + '%"></i><i class="c-ok" style="width:' + ((nv - np) / nv * 100) + '%"></i></div><div class="legend" style="margin:8px 0 14px"><span><i class="c-out"></i>' + esc(R.yes) + ' · ' + np + '</span><span><i class="c-ok"></i>' + esc(R.no) + ' · ' + (nv - np) + '</span></div>' +
            M.paras.map(function (x) { return '<p class="aip">' + esc(x) + '</p>'; }).join('') +
            '<dl class="aikv">' + [['What it means', M.means], ['Still unknown', M.unknown], ['Confidence', M.conf]].map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl></div>' +
            '<p class="dk">Investigation details</p><dl class="dkv">' + (D.qs && D.qs.length > 1 ? [['Questions covered', D.qs.map(function (it) { return it.q; }).join(' · ')]] : []).concat([['Why we asked', D.why], ['Who', D.who], ['Where', D.areas], ['Responses', D.n + ' verified · ' + money(D.n * RATE)], ['Sent', D.sent]]).map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' + surveyHtml(D.survey) + '</div>';
        }
        h += '<div class="dfoot"><p class="small">' + (R.sim ? 'Simulated responses' : 'Sample data') + ' for this prototype.</p></div></div></div>';
      }
    }
    if (!h) unsee('m-');
    var had = host.innerHTML !== '';
    /* keep the responses view still when it redraws in place (opening a signal, expanding the questions) */
    var mk = S.modal + '|' + S.filter, same = host.getAttribute('data-k') === mk, keepB = {};
    if (same) ['.brief', '.rlist'].forEach(function (q) { var e0 = host.querySelector(q); if (e0) keepB[q] = e0.scrollTop; });
    host.setAttribute('data-k', h ? mk : '');
    host.innerHTML = h;
    Object.keys(keepB).forEach(function (q) { var e1 = host.querySelector(q); if (e1) e1.scrollTop = keepB[q]; });
    document.body.style.overflow = h ? 'hidden' : '';
    if (h && !had) { var f = host.querySelector('.dlg button'); if (f) f.focus(); }
  }
  function renderToast() {
    var host = $('toast'); if (host.getAttribute('data-t') === S.toast) return;
    host.setAttribute('data-t', S.toast);
    host.innerHTML = S.toast ? '<div class="toast">' + ic('check', 's') + esc(S.toast) + '</div>' : '';
  }

  /* follow-up list scrollbar */
  function syncThumbs() {
    document.querySelectorAll('.fuwrap').forEach(function (w) {
      var l = w.querySelector('.fulist'), th = w.querySelector('.futhumb');
      if (!l || !th) return;
      var track = th.parentElement.clientHeight, hgt = Math.max(24, track * l.clientHeight / l.scrollHeight);
      th.style.height = hgt + 'px';
      th.style.top = ((track - hgt) * (l.scrollTop / Math.max(1, l.scrollHeight - l.clientHeight))) + 'px';
      w.classList.toggle('end', l.scrollTop + l.clientHeight >= l.scrollHeight - 2);
    });
  }
  document.addEventListener('scroll', function (e) { if (e.target.classList && e.target.classList.contains('fulist')) syncThumbs(); }, true);
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    var tr = e.target.closest && e.target.closest('.futrack'); if (!tr) return;
    e.preventDefault();
    var l = tr.parentElement.querySelector('.fulist'), th = tr.querySelector('.futhumb'), rect = tr.getBoundingClientRect(), max = l.scrollHeight - l.clientHeight, room = rect.height - th.offsetHeight;
    if (e.target !== th) l.scrollTop = ((e.clientY - rect.top - th.offsetHeight / 2) / room) * max;
    drag = { l: l, y: e.clientY, top: l.scrollTop, ratio: max / Math.max(1, room) };
  });
  document.addEventListener('pointermove', function (e) { if (drag) drag.l.scrollTop = drag.top + (e.clientY - drag.y) * drag.ratio; });
  document.addEventListener('pointerup', function () { drag = null; });

  /* =========================================================
     Behaviour
     ========================================================= */
  function scrollEnd() { later(function () { BODY.scrollTo({ top: BODY.scrollHeight, behavior: 'smooth' }); }, 40); }
  var counter = 1;

  /* Interactive preview: sample data only. Questions outside the sample get an honest answer and a supported example. */
  var SAMPLE_QS = ['Why are our cooking oil sales slowing in Accra?', 'Why are smaller shops running out of detergent in Kano?'];
  function previewOK(q) {
    var t = ' ' + String(q).toLowerCase() + ' ', pl = findPlaces(t);
    if (pl.some(function (p) { return p.name !== 'Accra' && p.name !== 'Kano'; })) return false;
    if (/accra|kano|cooking oil|vegetable oil|detergent|washing powder/.test(t)) return true;
    return S.answers.length > 0;
  }
  function previewOnly(q, prev) {
    return { q: q, intent: 'general', place: prev.place, product: prev.product, ev: [], assumptions: [], chart: null, tiles: null, table: null, gap: null, preview: true,
      paras: ['This preview runs on sample data for two examples: cooking oil in Accra and detergent in Kano. It cannot answer other questions yet.', 'Try one of the sample questions below, or request early access to ask about your own market.'],
      fu: SAMPLE_QS.map(function (s) { return [s, 'ask']; }) };
  }
  function previewize(a) {
    var fix = function (s) { return String(s).replace(/\bYour (sales|delivery|order|loyalty|company)\b/g, 'Sample $1').replace(/\byour (sales|delivery|order|loyalty) (records|data)\b/g, 'sample $1 $2'); };
    a.paras = (a.paras || []).map(fix);
    (a.ev || []).forEach(function (e) { e.chip = fix(e.chip); e.src = fix(e.src); e.text = fix(e.text); });
  }
  function ask(q, mode) {
    var prev = last() || { place: KANO, product: 'your product' };
    if (!S.answers.length && !CUR) {
      CUR = 'c' + counter; var t = cap(q.replace(/\?$/, '').replace(/^(why|what|how|is|are|should|which|who|does|do|can)\s+/i, ''));
      t = trunc(t, 40); S.title = t; RECENT.unshift({ k: CUR, t: t });
    }
    var sim = (window.vsPreview && !previewOK(q)) ? previewOnly(q, prev) : simulate(q, mode || 'ask', { place: prev.place, product: prev.product });
    if (sim) sim.placeFrom = findPlaces(' ' + q.toLowerCase() + ' ').length ? 'q' : (last() ? 'earlier' : 'default');
    if (sim && S.pendingScope) { sim.scopeSel = S.pendingScope; S.pendingScope = null; }
    else if (sim && S.chatScope && S.chatScope.length && !namedMarkets(q).length) sim.scopeSel = S.chatScope.slice();
    if (window.vsPreview) previewize(sim);
    refineGap(sim, q);
    fitChart(sim, q);
    (function () {
      var norm = function (x) { return String(x).toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim(); }, asked = {};
      S.answers.forEach(function (x) { asked[norm(x.q)] = 1; }); asked[norm(q)] = 1;
      var P = sim.place ? sim.place.name : 'the market', O = sim.place && sim.place.name === 'Kano' ? 'Kaduna' : 'Kano';
      var pool = [['Which distributors are most affected?', 'ask'], ['How often do shops reorder?', 'ask'], ['Are wholesalers in ' + P + ' filling the gap?', 'ask'], ['Why did shoppers switch to the rival?', 'ask'], ['What incentives is the rival offering retailers?', 'ask'], ['When did the drop start?', 'ask'], ['Which areas of ' + P + ' are worst affected?', 'ask'], ['Is the rival running a promotion?', 'ask'], ['How does ' + P + ' compare with ' + O + '?', 'compare']];
      var fu = (sim.fu || []).filter(function (f) { return !asked[norm(f[0])]; }), seen = {};
      fu = fu.filter(function (f) { var k = norm(f[0]); if (seen[k]) return false; seen[k] = 1; return true; });
      pool.forEach(function (f) { var k = norm(f[0]); if (fu.length < 3 && !asked[k] && !seen[k]) { fu.push(f); seen[k] = 1; } });
      sim.fu = fu.slice(0, 4);
    })();
    var a = Object.assign(sim, { id: 'a' + (counter++), status: 'typing', shown: 0, showChart: false });
    a.assumptions.forEach(function (x) { x.state = 'open'; });
    // one living gap: a new open gap absorbs the previous open one and goes deeper
    if (a.gap && !a.investigateNow) {
      var prevOpen = S.answers.filter(function (x) { return x.gap && x.gap.state === 'open' && !x.investigateNow; }).pop();
      if (prevOpen) {
        a.gap.chain = (prevOpen.gap.chain || []).concat([{ q: prevOpen.gap.q, why: prevOpen.gap.why, from: prevOpen.q, at: prevOpen.at, aid: prevOpen.id, resp: prevOpen.gap.resp }]);
        prevOpen.gap.state = 'refined';
        if (S.plan && S.plan.aid === prevOpen.id) S.plan = null;
      }
    }
    a.at = Date.now(); S.answers.push(a); S.mode = 'ask'; S.active = a.id; S.gsel = null;
    if (S.plan && !A(S.plan.aid)) S.plan = null;
    $('ask').value = ''; autosize(); render(); scrollEnd();
    log('Asked', trunc(q, 60), '');
    var total = a.paras.join(' ').split(' ').length;
    later(function () {
      a.status = 'stream'; a.shown = 2; renderConvo();
      var iv = every(function () {
        a.shown = Math.min(a.shown + 2, total);
        if (a.shown >= total) {
          a.status = 'done'; a.shown = 9999; clearInterval(iv);
          if (a.investigateNow) S.plan = newPlan(a);
          render(); scrollEnd(); return;
        }
        renderConvo();
      }, 40);
    }, 900 + Math.round(Math.random() * 500));
  }

  function newPlan(a) { var areas = {}; areas[(a.gap.place || a.place).areas[0]] = true; return { aid: a.id, n: a.gap.n > 15 ? 25 : 15, areas: areas }; }

  function deploy() {
    var p = S.plan; if (!p || !anyArea()) return;
    var a = A(p.aid); if (!a) return;
    var g = a.gap;
    g.qs = (a.investigateNow ? [{ q: g.q }] : selected(a)).map(function (it) { return { q: it.q, from: it.from }; }); if (g.qs.length && g.qs[0].q !== g.q) { g.q = g.qs[0].q; }
    g.state = 'running'; g.received = 0; g.total = p.n; g.areasSel = Object.keys(p.areas).filter(function (k) { return p.areas[k]; }); g.sentAt = 'Today, ' + new Date().toTimeString().slice(0, 5); S.plan = null;
    pushNotif({ title: 'Investigation sent', text: trunc(g.q, 70) + ' · ' + p.n + ' responses requested' });
    log('Investigation sent', trunc(g.q, 60), 'open');
    render(); notify('Sent to SavoScouts. You can keep asking.');
    var iv = every(function () {
      if (g.state !== 'running') { clearInterval(iv); return; }
      g.received += 1;
      if (g.received >= g.total) {
        g.state = 'ready'; clearInterval(iv);
        pushNotif({ title: 'Results ready', text: g.total + ' verified responses · ' + trunc(g.q, 60), act: 'addEvidence', arg: a.id, actLabel: 'Add to this answer' });
        notify('Results are ready to review');
      }
      render();
    }, 500);
  }

  function startFromTask(msg) {
    var a = S.pending ? A(S.pending.aid) : null;
    if (!a || !a.gap) { var want = (msg.gaps && msg.gaps[0]) || msg.gap || ''; a = S.answers.filter(function (x) { return x.gap && x.gap.state === 'open' && (x.gap.q === want || (x.gap.chain || []).some(function (c) { return c.q === want; })); }).pop(); }
    if (!a || !a.gap || a.gap.state !== 'open') return;
    var g = a.gap; g.pendingTask = false; g.taskId = msg.id; g.taskTitle = msg.title || '';
    g.state = 'running'; g.received = 0; g.total = Math.max(5, Math.min(60, Number(msg.target) || 15)); g.areasSel = (msg.regions || []).slice(0, 3); g.sentAt = 'Today, ' + new Date().toTimeString().slice(0, 5); S.pending = null;
    pushNotif({ title: 'Investigation sent', text: trunc(g.q, 70) + ' · ' + (msg.target || g.total) + ' responses requested' });
    log('Investigation sent', trunc(g.q, 60), 'open');
    render();
    var step = Math.max(140, Math.round(24000 / g.total));
    var iv = every(function () {
      if (g.state !== 'running') { clearInterval(iv); return; }
      g.received += 1;
      if (g.received >= g.total) {
        g.state = 'ready'; clearInterval(iv);
        pushNotif({ title: 'Investigation ready', text: (g.taskTitle ? trunc(g.taskTitle, 50) + ' · ' : '') + g.total + ' verified responses · ' + trunc(g.q, 50), act: 'gaps', arg: a.id, actLabel: 'Review results' });
        notify('Your investigation is ready. The results are back in this conversation.');
      }
      render();
    }, step);
  }
  window.addEventListener('message', function (e) { if (e.data && e.data.vs === 'task-deployed') startFromTask(e.data); });
  function addEvidence(id) {
    var a = A(id); if (!a || !a.gap || a.gap.state !== 'ready') return;
    var g = a.gap, pl = g.place || a.place;
    a.ev.push({ chip: 'SavoScouts · ' + g.total + ' responses', sig: true, isNew: true, text: g.found(g.total), src: 'Ground-Level · ' + g.total + ' verified responses · today', resp: a.id });
    if (!g.update) g.update = 'Update: ' + g.found(g.total) + ' That fills the gap, so the answer above now rests on stronger evidence.';
    g.state = 'closed';
    log('Gap closed', trunc(g.q, 60), 'k');
    log('Understanding updated', 'Evidence added from ' + g.total + ' verified responses', 'k');
    set({ sheet: 'ev', active: a.id, hl: a.id + ':' + (a.ev.length - 1), bell: false });
    notify('Added to this answer · the answer is updated');
  }

  var ACT = {
    srcTab: function (x) { S.srcTab = x; set({ sheet: 'ev' }); },
    srcOpen: function (x) { var sb1 = MAIN.querySelector('#sheet .sbody'); if (sb1 && !S.srcView) S.evTop = sb1.scrollTop; S.srcTab = null; S.srcView = x; set({ sheet: 'ev' }); var b = BODY && MAIN.querySelector('#sheet .sbody'); if (b) b.scrollTop = 0; },
    srcBack: function (x) { S.srcView = null; S.backTop = S.evTop || 0; set({ sheet: 'ev', hl: null }); },
    srcKb: function (x) {
      var p = String(x).split(':'), a = A(p[0]), e = a && a.ev[+p[1]]; if (!e || !window.vsOpenKb) return;
      var back = function () { S.srcView = x; set({ sheet: 'ev', active: a.id }); };
      leavePanel(); S.srcView = null; set({ sheet: null }); window.vsOpenKb({ src: e.src, text: e.text, back: back });
    },
    srcResp: function (x) { var p = String(x).split(':'), a = A(p[0]), e = a && a.ev[+p[1]]; if (e && e.resp) ACT.openResp(e.resp); else ACT.openInv(); },
    srcPub: function (x) { var p = String(x).split(':'), a = A(p[0]), e = a && a.ev[+p[1]]; if (e) notify('Opens the original publication: ' + e.src.split(' · ')[0]); },
    srcRec: function (x) { var p = String(x).split(':'), id = p[0] + ':' + p[1], k = p[2]; if (k === 'kb') ACT.srcKb(id); else if (k === 'resp') ACT.srcResp(id); else if (k === 'inv') ACT.openInv(); else ACT.srcPub(id); },
    kbSel: function (id) { var was = window.vsKbs && window.vsKbs.active(); if (id && was && was.id === id) id = ''; if (window.vsKbs) window.vsKbs.select(id || ''); S.yourData = !!id; render(); var a = window.vsKbs && window.vsKbs.active(); notify(a ? 'Answers now draw on ' + a.name : 'Answers use platform evidence only'); },
    kbManage: function () { set({ plus: false, sheet: null }); if (window.vsKbs) window.vsKbs.manage(); },
    openKb: function (x) {
      var p = String(x).split(':'), a = A(p[0]), e = a && a.ev[+p[1]]; if (!e) return;
      var back = function () { set({ sheet: 'ev', active: a.id, hl: a.id + ':' + p[1] }); };
      if (window.vsOpenKb) { set({ sheet: null }); window.vsOpenKb({ src: e.src, text: e.text, back: back }); }
    },
    openInv: function () { leavePanel(); set({ sheet: null }); if (window.vsInvestigations) window.vsInvestigations('c-surveys'); },
    openTask: function (id) { leavePanel(); set({ sheet: null, bell: false }); if (window.vsInvestigations) window.vsInvestigations('c-survey-' + id); },
    viewSrc: function (x) {
      var p = String(x).split(':'), a = A(p[0]), e = a && a.ev[+p[1]]; if (!e) return;
      notify('Opens the original publication: ' + e.src.split(' · ')[0]);
    },
    sheetFull: function () { set({ half: false }); },
    bubOpen: function () {
      var b = S.bub; S.bub = null; S.bubLbl = false;
      /* close whatever was opened from the panel: the Knowledge Base page or the investigations view */
      if (MAIN.classList.contains('kb-on')) { [].forEach.call(MAIN.querySelectorAll(':scope > .kb'), function (p) { p.remove(); }); MAIN.classList.remove('kb-on'); }
      if (MAIN.classList.contains('inv-on') && window.vsCloseInvestigations) window.vsCloseInvestigations();
      S.srcView = (b && b.src) || null; S.backTop = b && !S.srcView ? b.top : null; set({ sheet: (b && b.sheet) || 'gaps', hl: null, modal: null }); },
    jumpQ: function (id) {
      if (!document.getElementById('q-' + id)) return;
      /* keep the Intelligence gaps panel open beside the chat; on phones, where it covers the chat, close it */ S.srcView = null; if (innerWidth < 760 && S.sheet) { var sb0 = MAIN.querySelector('#sheet .sbody'); S.bub = { sheet: S.sheet, top: sb0 ? sb0.scrollTop : 0 }; S.bubLbl = true; clearTimeout(bubT); bubT = setTimeout(function () { S.bubLbl = false; renderBubble(); }, 2400); set({ sheet: null, hl: null, bell: false, more: false }); } else if (innerWidth < 760) set({ sheet: null, hl: null, bell: false, more: false }); else set({ hl: null, bell: false, more: false });
      var go = function (smooth) {
        var el = document.getElementById('q-' + id); if (!el) return;
        var sc = el.parentElement; while (sc && sc !== MAIN && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
        if (!sc) sc = BODY;
        var top = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16);
        if (smooth && sc.scrollTo) sc.scrollTo({ top: top, behavior: 'smooth' }); else sc.scrollTop = top;
        return el;
      };
      setTimeout(function () { var el = go(true); if (el) { el.classList.add('q-flash'); setTimeout(function () { var e2 = document.getElementById('q-' + id); if (e2) e2.classList.remove('q-flash'); }, 1800); } }, 60);
      setTimeout(function () { go(false); }, 700);
    },
    fullTask: function (id) {
      var a = A(id); if (!a || !a.gap) return;
      var qs = (a.investigateNow || a.gap.state !== 'open' ? [{ q: a.gap.q, from: a.q }] : selected(a)), pl = a.gap.place || a.place;
      var ctx = { gaps: qs.map(function (x) { return x.q; }), gap: qs.map(function (x) { return x.q; }).join(' '), from: a.q, kind: a.intent === 'price' ? 'Price check' : a.intent === 'distribution' ? 'Availability and shelf' : a.intent === 'consumer' ? 'Shopper feedback' : a.intent === 'competitor' ? 'Availability and shelf' : 'Retailer interviews', kinds: [], city: pl.name, country: pl.country || '', product: a.product && a.product !== 'your product' ? a.product : '' };
      S.plan = null; a.gap.pendingTask = true; a.gap.qs = qs.map(function (x) { return { q: x.q, from: x.from }; }); S.pending = { aid: a.id, gaps: ctx.gaps }; set({ sheet: null, modal: null });
      if (window.vsInvestigations) window.vsInvestigations('c-builder', ctx.gap, ctx);
    },
    menu: function () { set({ menu: !S.menu }); },
    reset: function () { newQuestion(); },
    acct: function () { set({ acct: !S.acct }); },
    conv: function (x) { S.recent = false; openConv(x); },
    recentMenu: function () { set({ recent: !S.recent, bell: false, more: false }); },
    popClose: function (w) { if (w === 'scope') { S.scopeFor = null; S.scopeSel = []; S.scopeQ = ''; render(); return; } var o = {}; o[w] = false; if (w === 'plus') { S.sub = null; } set(o); var t = document.querySelector(w === 'plus' ? '#plus .plusbtn' : w === 'recent' ? '#topbar .ttl' : '#va [data-act=bell]'); if (t) t.focus(); },
    recentPin: function (k) { var x = ttlFind(k); if (!x) return; x.pin = !x.pin; x.pinAt = Date.now(); S.recent = true; render(); notify(x.pin ? 'Pinned to the top' : 'Unpinned'); },
    recentRename: function (k) { S.renaming = k; S.recent = true; render(); },
    bell: function () { if (S.bell) S.notifs.forEach(function (n) { n.unread = false; }); set({ bell: !S.bell, more: false }); },
    readAll: function () { S.notifs.forEach(function (n) { n.unread = false; }); render(); },
    more: function () { set({ more: !S.more, bell: false }); },
    sheetToggle: function () { if (!S.answers.length) { notify('Ask a question first'); return; } set({ sheet: S.sheet ? null : 'ev', hl: null }); },
    closeSheet: function () { S.srcView = null; set({ sheet: null, hl: null }); },
    tab: function (x) { S.srcView = null; set({ sheet: x, hl: null, half: false }); },
    kf: function (x) { set({ kf: x, hl: null }); },
    evid: function (x) { set({ sheet: 'ev', active: x, hl: null }); },
    src: function (x) { var id = x.split(':')[0]; set({ sheet: 'ev', active: id, hl: x }); },
    gaps: function (x) { set({ sheet: 'gaps', hl: x || null, active: x || S.active }); },
    chart: function (x) {
      var a = A(x), sel = '[data-act="chart"][data-arg="' + a.id + '"]';
      var q0 = MAIN.querySelector(sel), sc = q0; while (sc && sc !== MAIN && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
      var wrap0 = q0 && q0.closest('.quiet') && q0.closest('.quiet').parentElement, top0 = wrap0 ? wrap0.getBoundingClientRect().top : 0, row0 = q0 ? q0.getBoundingClientRect().top : 0;
      a.showChart = !a.showChart; render();
      var fix = function () {
        var q = MAIN.querySelector(sel), wrap = q && q.closest('.quiet') && q.closest('.quiet').parentElement; if (!q || !sc || !wrap) return;
        if (!a.showChart) { sc.scrollTop += q.getBoundingClientRect().top - row0; return; }
        sc.scrollTop += wrap.getBoundingClientRect().top - top0;
        if (a.showChart) { var f = wrap.querySelector('figure.ex, figure.vc'), r = f && f.getBoundingClientRect(), b = sc.getBoundingClientRect(), end = q.closest('.quiet').getBoundingClientRect().bottom; if (r && end > b.bottom - 16) sc.scrollTop += Math.max(0, Math.min(end - b.bottom + 16, r.top - b.top - 8)); }
      };
      fix(); setTimeout(fix, 40);
    },
    plan: function (x) { var a = A(x); if (!a) return; if (!a.investigateNow && !selected(a).length) { notify('Tick at least one gap first'); return; } S.plan = newPlan(a); if (!a.investigateNow) S.sheet = 'gaps', S.hl = a.id; render(); },
    cancelPlan: function () { set({ plan: null }); },
    area: function (x) { S.plan.areas[x] = !S.plan.areas[x]; render(); },
    size: function (x) { S.plan.n = Number(x); render(); },
    deploy: deploy,
    addEvidence: function (x) { addEvidence(x || 'a0'); },
    openResp: function (x) { leavePanel(); if (S.bub) S.sheet = null; set({ modal: x || 'kiosk', bell: false, filter: 'find', sf: 'all', sloc: 'all', sdate: 'all', qall: false, sopen: null }); },
    sfilter: function (x) { set({ sf: x, sopen: null }); },
    chainT: function (x, e) { if (e) e.preventDefault(); set({ chainOpen: S.chainOpen === x ? null : x }); },
    sig: function (x) { set({ sopen: S.sopen === x ? null : x }); },
    qall: function () { set({ qall: !S.qall }); },
    closeModal: function () { set({ modal: null }); },
    scrim: function (x, e) { if (e.target.classList.contains('scrim')) set({ modal: null }); },
    filter: function (x) { set({ filter: x }); },
    testAs: function (x) {
      var parts = x.split(':'), a = A(parts[0]), as = a.assumptions[Number(parts[1])];
      as.state = 'testing'; set({ sheet: 'ev', active: a.id });
      later(function () {
        as.state = 'done';
        a.ev.push({ asRef: true, chip: cap(as.check.replace('your ', 'Your ').replace(/^platform /, 'Platform ')), you: /^your /.test(as.check), isNew: true, text: as.result, src: cap(as.check) + ' · checked today' });
        pushNotif({ title: 'Assumption checked', text: trunc(as.text, 70) });
        log('Assumption checked', trunc(as.text, 60), 'k');
        render(); notify('Assumption checked. The result is under Assumptions.');
      }, 1500);
    },
    plus: function () { set({ plus: !S.plus }); },
    pick: function (x) { set({ mode: x, plus: false, menu: false }); $('ask').focus(); },
    clearMode: function () { set({ mode: 'ask' }); },
    ctx: function (x) { set({ plus: false }); notify(x + ': coming in the full product'); },
    ctxPlace: function () { S.sub = 'place'; S.plus = true; render(); setTimeout(function () { var q = document.querySelector('#plus .psub-q'); if (q) q.focus(); }, 30); },
    ctxBack: function () { S.sub = null; S.plus = true; render(); },
    ctxDone: function () { S.sub = null; S.plus = false; S.placeQ = ''; render(); },
    ctxPick: function (v) { var a = S.places = S.places || [], i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); S.plus = true; render(); },
    ctxUnplace: function (v) { S.places = (S.places || []).filter(function (x) { return x !== v; }); render(); },
    ctxFile: function () { S.plus = true; pickFiles(); },
    ctxUnfile: function (i) { (S.files || []).splice(+i, 1); render(); },
    scopeMenu: function (id) { var a = A(id); S.scopeFor = S.scopeFor === id ? null : id; S.scopeQ = ''; S.scopeSel = a && S.scopeFor ? scopeNames(a).map(function (n) { return CITY_IN[n] || n; }).filter(function (n, i, arr) { return AFRICA.indexOf(n) >= 0 && arr.indexOf(n) === i; }) : []; S.scopeTop = S.scopeSel.slice(); render(); if (S.scopeFor) setTimeout(function () { var q = document.querySelector('.scopepop .psub-q'); if (q) q.focus(); }, 30); },
    scopeClear: function () { S.chatScope = []; render(); notify('Market focus cleared'); },
    scopeTog: function (v) { var s = S.scopeSel = S.scopeSel || [], i = s.indexOf(v); if (i >= 0) s.splice(i, 1); else s.push(v); render(); },
    scopeGo: function (id) {
      var a = A(id), sel = (S.scopeSel || []).slice(); if (!a || !sel.length) return;
      S.chatScope = sel; S.scopeFor = null; S.scopeSel = []; S.scopeQ = ''; render(); notify('Next questions focus on ' + listNames(sel)); var bx = document.getElementById('ask'); if (bx) bx.focus(); return;
      var q = String(a.q || '').trim(), names = namedMarkets(q), list = listNames(sel), q2 = q;
      if (names.length) { var done = false; names.forEach(function (n) { var re = new RegExp('(,\\s*|\\s+and\\s+|\\s+vs\\.?\\s+|\\s+or\\s+)?' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); q2 = q2.replace(re, function (m, pre) { if (done) return ''; done = true; return (pre && !/^,/.test(pre) ? pre : '') + list; }); }); }
      else q2 = q.replace(/[?.!\s]+$/, '') + ' in ' + list + '?';
      S.scopeFor = null; S.scopeSel = []; S.pendingScope = sel; render(); ask(q2.replace(/\s{2,}/g, ' '), 'ask');
    },
    yourData: function () { set({ yourData: !S.yourData }); notify(S.yourData ? 'Using your company data' : 'Using platform evidence only'); },
    sugg: function (x) { var p = x.split('|'); ask(p[0], p[1] === 'ask' ? 'ask' : p[1]); },
    toast: function (x) { set({ more: false }); notify(x); }
  };

  document.addEventListener('click', function (e) {
    var inAcct = !!e.target.closest('.acctwrap'), inPlus = !!e.target.closest('#plus, .kbchip'), inBell = !!e.target.closest('.bellwrap'), inMore = !!e.target.closest('.morewrap'), inSide = !!e.target.closest('#side');
    var t = e.target.closest('[data-act]');
    if (t && t.tagName === 'A') e.preventDefault();
    if (t && !t.disabled) { var fn = ACT[t.getAttribute('data-act')]; if (fn) fn(t.getAttribute('data-arg'), e); }
    var ch = false;
    if (S.plus && !inPlus && document.contains(e.target)) { S.plus = false; S.sub = null; ch = true; }
    if (S.scopeFor && document.contains(e.target) && !e.target.closest('.scopewrap')) { S.scopeFor = null; ch = true; }
    if (S.bell && !inBell) { S.notifs.forEach(function (n) { n.unread = false; }); S.bell = false; ch = true; }
    if (S.more && !inMore) { S.more = false; ch = true; }
    if (S.recent && document.contains(e.target) && !e.target.closest('#topbar .title')) { S.recent = false; S.renaming = null; ch = true; }
    if (S.acct && !inAcct) { S.acct = false; ch = true; }
    if (S.menu && !inSide && !(t && t.getAttribute('data-act') === 'menu')) { S.menu = false; ch = true; }
    if (ch) render();
  });
  var vaDlg = document.getElementById('va');
  if (vaDlg) vaDlg.addEventListener('cancel', function (e) { if (S.plus || S.bell || S.more || S.acct || S.modal || S.sheet || S.menu) e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (S.plus || S.bell || S.more || S.acct || S.modal || S.sheet || S.menu) { e.preventDefault(); e.stopPropagation(); }
    if (S.plus || S.bell || S.more || S.acct) set({ plus: false, bell: false, more: false, acct: false });
    else if (S.modal) set({ modal: null });
    else if (S.sheet) set({ sheet: null, hl: null });
    else if (S.menu) set({ menu: false });
  });

  var box = $('ask');
  function autosize() { box.style.height = 'auto'; var h = Math.min(box.scrollHeight, 180); box.style.height = h + 'px'; box.style.overflowY = box.scrollHeight > 180 ? 'auto' : 'hidden'; }
  box.addEventListener('input', autosize);
  if (window.ResizeObserver) new ResizeObserver(function () { autosize(); }).observe(box.closest('.dock') || box);
  if (vaDlg) new MutationObserver(function () { if (vaDlg.open) requestAnimationFrame(autosize); }).observe(vaDlg, { attributes: true, attributeFilter: ['open', 'class'] });
  document.addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-ch'); if (!k) return;
    if (k === 'gsel') {
      /* update the tick in place so the panel does not redraw or move */
      var g0 = gsel(); g0[e.target.value] = e.target.checked;
      var lab = e.target.closest('.gopt'); if (lab) lab.classList.toggle('on', e.target.checked);
      var gi = e.target.closest('.gitem'), bt = gi && gi.querySelector('[data-act="fullTask"]');
      if (bt) { var nck = gi.querySelectorAll('.glist input:checked').length; bt.disabled = !nck; bt.innerHTML = ic('plus', 's') + 'Investigate this gap' + (nck > 1 ? ' · ' + nck + ' gaps' : ''); } else render();
      return;
    }
    var p = { sopen: null }; p[k] = e.target.value; set(p);
    var el = document.querySelector('select[data-ch="' + k + '"]'); if (el) el.focus();
  });
  box.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('composer').requestSubmit(); } });
  $('composer').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = box.value.trim();
    if (!q) { box.focus(); notify('Type a question first'); return; }
    if (last() && last().status !== 'done') { notify('One moment, still answering the last question'); return; }
    ask(q, S.mode);
  });

  CUR = null; S = blank('New question');
  window.vapxAsk = function (q) { if (!q || !String(q).trim()) return; if (last() && last().status !== 'done') return; if (CUR || S.answers.length) newQuestion(); ask(String(q).trim(), S.mode); };
  window.vapxNew = function () { newQuestion(); };
  window.vapxOpenConv = openConv;
  render();
  /* the Assistant's own code may redraw Recent; keep it ours */
  var ul0 = document.getElementById('va-recent');
  if (ul0 && 'MutationObserver' in window) { var mt; new MutationObserver(function () { if (ul0.dataset.vapx === '1' && !ul0.querySelector('.vapx-conv') && RECENT.length) { clearTimeout(mt); mt = setTimeout(renderSide, 30); } }).observe(ul0, { childList: true }); }
})();

/* <<< assistant prototype v1 */
}
