/* Verisavo sign-in routes. Two audiences, two doors:
   - clients sign in with Google or a work email; new clients request a demo (no self sign-up);
   - SavoScouts join and sign in with WhatsApp first, with Google or email as a backup.
   Works on any page that has the #auth dialog (and #access for WhatsApp). */
export default function init() {
  if (typeof window === 'undefined' || window.vsAuthTweak) return;
  var WA_IC = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;flex:none"><path fill="currentColor" d="M12 2.2A9.7 9.7 0 0 0 3.7 16.9L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
  var css = document.createElement('style');
  css.textContent =
    '.hdemo{display:inline-flex;align-items:center;height:36px;padding:0 16px;margin-right:6px;border:0;border-radius:999px;background:#E3EBF8;color:#1F273F!important;-webkit-text-fill-color:#1F273F;font:500 .875rem/1 "Red Hat Text",system-ui,sans-serif;text-decoration:none;white-space:nowrap;cursor:pointer;transition:background .2s}' +
    '.hdemo:hover{background:#CCDDF1}.hdemo:focus-visible{outline:2px solid #4D74C3;outline-offset:3px}' +
    'html body .top .pill > button.hdemo:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){display:inline-flex!important;align-items:center;height:36px!important;width:auto!important;padding:0 16px!important;margin-right:6px!important;border:0!important;border-radius:999px!important;background:#E3EBF8!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important;font:500 .875rem/1 "Red Hat Text",system-ui,sans-serif!important;opacity:1!important;visibility:visible!important}' +
    'html body .top .pill > button.hdemo:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n):hover{background:#CCDDF1!important}' +
    'html body:has(#pg-community.open,#pg-community-tasks.open,#pg-portal.open,#pg-scout.open):not(.menu-open) .top .pill > button.hdemo:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o){background:#fff!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important}' +
    'html body .top .pill > button.hdemo::before,html body .top .pill > button.hdemo::after{display:none!important}' +
    '@media (max-width:720px){html body .hdemo.hdemo,html body .top .pill > button.hdemo:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p){height:32px!important;padding:0 12px!important;margin-right:2px!important;font-size:.8125rem!important}}' +
    'html body.menu-open .top .pill > button.hdemo:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p),html body:has(#pg-demo.open) .top .pill > button.hdemo:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n#o#p),html body:has(#vmenu.open) .hdemo.hdemo{display:none!important}' +
    '#auth .a-wa{display:flex;align-items:center;justify-content:center;gap:10px}#auth .a-wa[hidden],#auth .a-or2[hidden]{display:none!important}' +
    '#auth .a-or2{margin:14px 0 2px;text-align:center;font-size:.8125rem;color:#6D6C71}' +
    /* Terms of Service and Privacy Policy as a full page, like sign-in */
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){width:100vw!important;max-width:none!important;height:100dvh!important;max-height:none!important;margin:0!important;inset:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#F8FAFC!important;box-shadow:none!important;overflow-y:auto!important;animation:vsauth-in .25s ease both}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n)::backdrop{background:#F8FAFC!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .dlg{display:block!important;width:auto!important;max-width:none!important;min-height:100%;margin:0!important;padding:0 0 72px!important;background:none!important;box-shadow:none!important;border:0!important;border-radius:0!important}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .l-top{position:sticky;top:0;z-index:2;display:flex!important;align-items:center;justify-content:space-between;padding:22px clamp(16px,3vw,46px)!important;margin:0!important;background:#F8FAFC}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .l-top .x{position:static!important;width:40px!important;height:40px!important;border:1px solid #E1E6EE!important;border-radius:50%!important;background:#fff!important;display:grid!important;place-items:center!important;cursor:pointer}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .ldoc{width:min(760px,calc(100% - 32px));max-height:none!important;overflow:visible!important;margin:clamp(16px,5vh,48px) auto 0!important;padding:0!important}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .ldoc > h2{font:400 clamp(2rem,1.6rem + 1.4vw,2.75rem)/1.1 "Red Hat Display",sans-serif!important;letter-spacing:-.035em!important;color:#1F273F!important;margin:0 0 4px!important}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .ldoc :is(p,li){font-size:1rem!important;line-height:1.65!important}' +
    'html body dialog#legal:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .ldoc :is(h3,h4){scroll-margin-top:100px!important}' +
    '#auth .a-tabs[hidden]{display:none!important}' +
    /* sign-in as a full page, matching the WhatsApp sign-in page */
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){width:100vw!important;max-width:none!important;height:100dvh!important;max-height:none!important;margin:0!important;inset:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#F8FAFC!important;box-shadow:none!important;overflow-y:auto!important;animation:vsauth-in .25s ease both}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n)::backdrop{background:#F8FAFC!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' +
    '@keyframes vsauth-in{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n){animation:none}}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .dlg{display:block!important;width:auto!important;max-width:none!important;min-height:100%;margin:0!important;padding:0 0 64px!important;background:none!important;box-shadow:none!important;border:0!important;border-radius:0!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .auth-bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:22px clamp(16px,3vw,46px);background:#F8FAFC}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .auth-logo{font:600 1.875rem/1 "Red Hat Display",sans-serif;letter-spacing:-.035em;color:#1F273F}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .auth-bar .x{position:static!important;width:40px!important;height:40px!important;border:1px solid #E1E6EE!important;border-radius:50%!important;background:#fff!important;display:grid!important;place-items:center!important;cursor:pointer}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-top{width:min(512px,calc(100% - 32px));margin:clamp(40px,11vh,110px) auto 0!important;padding:0!important;display:flex!important;justify-content:flex-start!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-top:has(.a-tabs[hidden]){margin-top:clamp(40px,11vh,110px)!important;height:0}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .stp{width:min(512px,calc(100% - 32px));margin:28px auto 0!important;padding:0!important;display:grid!important;gap:0!important;text-align:left}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .stp h2{margin:0!important;font:400 clamp(1.875rem,1.6rem + 1vw,2.375rem)/1.15 "Red Hat Display",sans-serif!important;letter-spacing:-.035em!important;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) #a-lead{margin:10px 0 32px!important;font:400 1.0625rem/1.45 "Red Hat Text",sans-serif!important;color:#5B6478!important;-webkit-text-fill-color:#5B6478!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) :is(#a-google,#a-submit,.a-wa){height:60px!important;border-radius:14px!important;font-size:1.0625rem!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) #a-google{background:#fff!important;border:1px solid #DCE2EA!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-or{margin:24px 0!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-form{gap:16px!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-form input{height:60px!important;padding:0 18px!important;border:1px solid #DCE2EA!important;border-radius:14px!important;background:#fff!important;font:400 1.0625rem/1 "Red Hat Text",sans-serif!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-form input:focus{outline:none!important;border-color:#A8B3C4!important;box-shadow:0 0 0 4px #E3EBF8!important}' +
    'html body dialog#auth:not(#a#b#c#d#e#f#g#h#i#j#k#l#m#n) .a-switch{margin-top:28px!important;text-align:left!important;font-size:1rem!important}';
  document.head.appendChild(css);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function goDemo() {
    if (window.vsGoDemo) return window.vsGoDemo();
    if (window.vsGoPage && document.getElementById('pg-demo')) return window.vsGoPage('demo');
    location.href = /\.html/.test(location.pathname) || location.protocol === 'file:' ? 'index.html#demo' : '/demo';
  }
  function setText(el, t) { if (el && el.textContent !== t) el.textContent = t; }

  window.vsAuthTweak = function (mode) {
    var auth = $('#auth'); if (!auth) return;
    var scout = window.vsAuthRole === 'scout', tabs = $('#auth .a-tabs'), sw = $('#a-switch'), google = $('#a-google');
    var wa = $('#auth .a-wa'), or2 = $('#auth .a-or2');
    if (!wa && google) {
      wa = document.createElement('button'); wa.type = 'button'; wa.className = 'btn btn-dark wide a-wa'; wa.innerHTML = WA_IC + '<span>Continue with WhatsApp</span>';
      or2 = document.createElement('p'); or2.className = 'a-or2'; or2.textContent = 'Or use Google or email instead';
      google.parentNode.insertBefore(wa, google); google.parentNode.insertBefore(or2, google);
      wa.addEventListener('click', function () { scoutWhatsApp(auth.dataset.vsMode || 'up'); });
    }
    if (!auth.querySelector('.auth-bar')) {
      var bar = document.createElement('div'); bar.className = 'auth-bar'; bar.innerHTML = '<span class="auth-logo">Verisavo</span>';
      var x = $('#a-x'); if (x) bar.appendChild(x);
      var dlg = auth.querySelector('.dlg') || auth; dlg.insertBefore(bar, dlg.firstChild);
    }
    auth.dataset.vsMode = mode;
    var emailLab = $('#auth label[for="a-email"]'), submit = $('#a-submit');
    if (window.vsAuthOriginal && !scout) {
      /* the original sign-in from the footer: tabs, Google or email, then the Assistant */
      if (tabs) { tabs.hidden = false; setText($('#auth [role=tab][data-mode="up"]'), 'Sign up'); }
      if (wa) { wa.hidden = true; or2.hidden = true; }
      setText(emailLab, 'Email');
      if (sw) sw.dataset.vsDemo = '';
      return;
    }
    if (!scout) {
      if (mode === 'up') { var tin = $('#auth [role=tab][data-mode="in"]'); if (tin) { tin.click(); return; } }
      if (tabs) tabs.hidden = true;
      if (wa) { wa.hidden = true; or2.hidden = true; }
      setText($('#a-title'), 'Client sign in');
      setText($('#a-lead'), 'For teams already using Verisavo. Sign in with Google or your work email.');
      setText(emailLab, 'Work email');
      setText(submit, 'Sign in');
      setText($('#a-switch-text'), 'New to Verisavo?'); setText(sw, 'Request a demo');
      if (sw) sw.dataset.vsDemo = '1';
    } else {
      if (tabs) { tabs.hidden = false; setText($('#auth [role=tab][data-mode="up"]'), 'Join'); }
      if (wa) { wa.hidden = false; or2.hidden = false; }
      setText($('#a-title'), mode === 'in' ? 'SavoScout sign in' : 'Join SavoScouts');
      setText($('#a-lead'), mode === 'in' ? 'Sign in with your WhatsApp number to see your tasks and VeriPoints.' : 'Join with your WhatsApp number. Tasks are sent and answered on WhatsApp.');
      setText(emailLab, 'Email');
      setText(submit, mode === 'in' ? 'Sign in with email' : 'Join with email');
      setText($('#a-switch-text'), mode === 'in' ? 'New to SavoScouts?' : 'Already a SavoScout?'); setText(sw, mode === 'in' ? 'Join' : 'Sign in');
      if (sw) sw.dataset.vsDemo = '';
    }
  };

  /* footer "Sign in": the original sign-in, straight to the Assistant */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-orig-signin]'); if (!b) return;
    window.vsAuthOriginal = true; window.vsAuthRole = '';
    if (b.hasAttribute('data-login')) return; /* product page: its own sign-in handler opens it */
    e.preventDefault();
    if (window.vsOpenAuth) window.vsOpenAuth('in');
  }, true);
  document.addEventListener('close', function (e) { if (e.target && e.target.id === 'auth') setTimeout(function () { window.vsAuthOriginal = false; }, 0); }, true);
  /* the legal page gets the same bar as the sign-in page: logo left, close right */
  function legalBar() { var l = $('#legal .l-top'); if (!l || l.querySelector('.auth-logo')) return; var s = document.createElement('span'); s.className = 'auth-logo'; s.textContent = 'Verisavo'; s.style.cssText = 'font:600 1.875rem/1 "Red Hat Display",sans-serif;letter-spacing:-.035em;color:#1F273F'; l.insertBefore(s, l.firstChild); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', legalBar); else legalBar();
  var lgWasOpen = false;
  new MutationObserver(function () {
    legalBar();
    var lg = document.getElementById('legal'), on = !!(lg && lg.open);
    if (on && !lgWasOpen) setTimeout(function () { lg.scrollTop = 0; }, 90); /* start at the title, not where focus scrolled to */
    lgWasOpen = on;
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  /* "New to Verisavo? Request a demo" */
  document.addEventListener('click', function (e) {
    var sw = e.target.closest && e.target.closest('#a-switch');
    if (!sw || sw.dataset.vsDemo !== '1') return;
    e.preventDefault(); e.stopImmediatePropagation();
    var auth = $('#auth'); if (auth) { auth.dataset.handoff = '1'; auth.close ? auth.close() : auth.removeAttribute('open'); }
    setTimeout(goDemo, 0);
  }, true);

  /* SavoScouts: WhatsApp number, code, then straight into their dashboard */
  var ORIG = null;
  /* change only the words of the heading, keeping its WhatsApp icon */
  function headText(h) { if (!h) return null; var n = h.lastChild; while (n && n.nodeType !== 3) n = n.previousSibling; if (!n) { n = document.createTextNode(''); h.appendChild(n); } return n; }
  function accessWords(mode) {
    var dlg = $('#access'); if (!dlg) return;
    var h = dlg.querySelector('#step1 h2') || dlg.querySelector('h2'), p = h && h.nextElementSibling, t = headText(h);
    if (!ORIG) ORIG = [t ? t.nodeValue : '', p ? p.textContent : ''];
    if (t) t.nodeValue = (/^\s/.test(t.nodeValue) ? ' ' : '') + (mode === 'in' ? 'SavoScout sign in' : 'Join SavoScouts');
    if (p) setText(p, mode === 'in' ? 'Enter your WhatsApp number. We’ll send a one-time code to sign you in.' : 'Enter your WhatsApp number. We’ll send a one-time code to confirm it’s yours.');
  }
  function restoreWords() {
    var dlg = $('#access'); if (!dlg || !ORIG) return;
    var h = dlg.querySelector('#step1 h2') || dlg.querySelector('h2'), p = h && h.nextElementSibling, t = headText(h);
    if (t) t.nodeValue = ORIG[0]; if (p) setText(p, ORIG[1]); ORIG = null;
  }
  function scoutWhatsApp(mode) {
    var auth = $('#auth'), after = window.vsAfterAuth;
    if (auth && auth.open) { auth.dataset.handoff = '1'; auth.close ? auth.close() : auth.removeAttribute('open'); }
    setTimeout(function () {
      window.vsAfterAuth = after || null;
      window.vsAccessScout = { mode: mode };
      accessWords(mode);
      if (window.vsOpenAccess) window.vsOpenAccess('');
    }, 20);
  }
  window.vsScoutWhatsApp = scoutWhatsApp;
  window.vsAccessDone = function (phone) {
    if (!window.vsAccessScout) return false;
    var user = { name: '', email: '', via: 'whatsapp', wa: phone, role: 'scout' };
    try { sessionStorage.setItem('verisavo-user', JSON.stringify(user)); } catch (e) {}
    if (window.vsScoutSetWa) window.vsScoutSetWa(phone);
    else try { var k = 'verisavo-scout', st = JSON.parse(localStorage.getItem(k) || 'null'); if (st) { st.wa = phone; localStorage.setItem(k, JSON.stringify(st)); } } catch (e) {}
    window.vsAccessScout = null;
    var dlg = $('#access'); if (dlg) dlg.close ? dlg.close() : dlg.removeAttribute('open');
    var after = window.vsAfterAuth; window.vsAfterAuth = null;
    setTimeout(function () { if (after) after(); else if (window.vsGoPage) window.vsGoPage('scout'); }, 0);
    return true;
  };
  document.addEventListener('close', function (e) {
    if (e.target && e.target.id === 'access') { restoreWords(); setTimeout(function () { window.vsAccessScout = null; }, 0); }
  }, true);
  /* every "Sign up with WhatsApp" button joins SavoScouts the same way */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-join-wa]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var host = b.closest('dialog'); if (host && host.open && host.id !== 'auth') host.close ? host.close() : host.removeAttribute('open');
    window.vsAfterAuth = function () { if (window.vsGoPage) window.vsGoPage('scout'); };
    scoutWhatsApp('up');
  }, true);
}
