/* Client workspace: invite colleagues as members or admins. Opened from the client profile (Account > Workspace).
   Preview build: the workspace is kept in this browser and invitations are not emailed yet. */
export default function init() {
  if (typeof window === 'undefined' || window.vsWorkspace) return;
  var KEY = 'verisavo-workspace';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var me = function () { try { return JSON.parse(sessionStorage.getItem('verisavo-user') || 'null') || {}; } catch (e) { return {}; } };
  var initials = function (n) { return (n || '?').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join('') || '?'; };
  var today = function () { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };
  function load() {
    var d = null; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!d) {
      var u = me();
      d = { name: (u.organisation || '').trim() || 'Your workspace', people: [
        { id: 'me', name: u.name || 'You', email: u.email || '', role: 'owner', status: 'active' },
        { id: 'p1', name: 'Amaka Obi', email: 'amaka.obi@example.com', role: 'admin', status: 'active', since: '4 Nov' },
        { id: 'p2', name: '', email: 'tunde.ade@example.com', role: 'member', status: 'invited', since: '18 Nov' }
      ] };
    }
    return d;
  }
  var save = function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  var ROLE = { owner: 'Owner', admin: 'Admin', member: 'Member' };

  var css = document.createElement('style');
  css.textContent =
    '#va .va-main.ws-on > .va-top #topbar,#va .va-main.ws-on > .va-top #topRight,#va .va-main.ws-on > .va-body,#va .va-main.ws-on > .va-dock,#va .va-main.ws-on > #sheet,#va .va-main.ws-on > #va-brief,#va .va-main.ws-on > .kb{display:none!important}' +
    '#va .va-main.ws-on > .va-top{justify-content:flex-end!important;border-bottom-color:transparent!important}' +
    '.ws{flex:1 1 auto;min-height:0;overflow-y:auto;display:grid;place-items:start center;padding:clamp(20px,5vh,48px) 16px 72px}' +
    '.ws-card{width:min(640px,100%);display:grid;gap:22px;color:#1F273F;font-family:"Red Hat Text",system-ui,sans-serif}' +
    '.ws-back{display:inline-flex;align-items:center;gap:4px;justify-self:start;height:30px;padding:0 10px 0 6px;border:1px solid #E5E5E5;border-radius:8px;background:#fff;font:500 .8125rem/1 "Red Hat Text",sans-serif;color:#3A3A3C;cursor:pointer}' +
    '.ws-back:hover{border-color:#C9CFD8;color:#1F273F}.ws-back svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '.ws h2{margin:0;font:400 clamp(1.75rem,1.5rem + 1vw,2.25rem)/1.15 "Red Hat Display",sans-serif;letter-spacing:-.03em;color:#1F273F}' +
    '.ws-lead{margin:-10px 0 0;font-size:.95rem;line-height:1.55;color:#5B6478;max-width:56ch}' +
    '.ws-sec{display:grid;gap:12px;padding:20px;border:1px solid #E3E8F0;border-radius:16px;background:#fff}' +
    '.ws-sec h3{margin:0;font:600 .95rem/1.3 "Red Hat Text",sans-serif;color:#1F273F}' +
    '.ws-sec > p{margin:-6px 0 0;font-size:.875rem;line-height:1.5;color:#5B6478}' +
    '.ws-row{display:flex;gap:10px;flex-wrap:wrap}' +
    '.ws input,.ws select{box-sizing:border-box;height:44px;border:1px solid #DCE4EE;border-radius:10px;padding:0 12px;background:#fff;font:400 .95rem/1 "Red Hat Text",sans-serif;color:#1F273F}' +
    '.ws input:focus,.ws select:focus{outline:none;border-color:#4774AE;box-shadow:0 0 0 3px #E6EDF5}' +
    '.ws input.bad{border-color:#C2453D}' +
    '.ws .ws-email{flex:1 1 240px;min-width:0}.ws .ws-name{flex:1 1 220px;min-width:0}' +
    '.ws select{padding-right:34px;-webkit-appearance:none;appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Cpath d=%27M6 8l4 4 4-4%27 fill=%27none%27 stroke=%27%2369696B%27 stroke-width=%271.6%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") no-repeat right 10px center/15px;cursor:pointer}' +
    '.ws-btn{height:44px;padding:0 18px;border:1px solid #1F273F;border-radius:10px;background:#1F273F;color:#fff!important;-webkit-text-fill-color:#fff!important;font:500 .9rem/1 "Red Hat Text",sans-serif;cursor:pointer}' +
    '.ws-btn:hover{background:#2B3554}.ws-btn.ws-ghost{background:#fff;color:#1F273F!important;-webkit-text-fill-color:#1F273F!important;border-color:#DCE4EE}.ws-btn.ws-ghost:hover{border-color:#A8B3C4;background:#F7F9FC}' +
    '.ws-msg{margin:0;font-size:.85rem;color:#B42318}.ws-msg.ok{color:#2F6B3F}.ws-msg:empty{display:none}' +
    '.ws-list{list-style:none;margin:0;padding:0;display:grid}' +
    '.ws-p{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid #EEF1F6}.ws-p:first-child{border-top:0}' +
    '.ws-av{width:36px;height:36px;flex:none;border-radius:50%;display:grid;place-items:center;background:#E3EBF8;color:#3A5292;font:600 .8rem/1 "Red Hat Text",sans-serif}' +
    '.ws-p.inv .ws-av{background:#F3F4F6;color:#8A93A5}' +
    '.ws-who{flex:1;min-width:0;display:grid;gap:2px}.ws-who b{font-weight:500;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ws-who span{font-size:.8rem;color:#6D7588;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ws-end{display:flex;align-items:center;gap:10px;flex:none}' +
    '.ws-end select{height:34px;font-size:.85rem}' +
    '.ws-tag,.ws-lnk{white-space:nowrap}.ws-end{flex-wrap:wrap}.ws-tag{font-size:.78rem;font-weight:500;padding:4px 9px;border-radius:999px;background:#F0F3F7;color:#3D4559}.ws-tag.inv{background:#FFF6E5;color:#8A5A0A}' +
    '.ws-lnk{border:0;background:none;padding:0;font:500 .82rem/1 "Red Hat Text",sans-serif;color:#3A5292;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:#A8C6E8}' +
    '.ws-lnk.warn{color:#B42318;text-decoration-color:#E4A49C}' +
    '.ws-roles{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;margin:0;font-size:.875rem;line-height:1.5}.ws-roles dt{font-weight:600}.ws-roles dd{margin:0;color:#5B6478}' +
    '.ws-note{margin:0;font-size:.78rem;color:#8A93A5}' +
    '.pf-form{display:grid;gap:14px}.pf-f{display:grid;gap:6px;font:500 .85rem/1.2 "Red Hat Text",sans-serif;color:#3D4559}.pf-f input{width:100%}.pf-f small{font-weight:400;font-size:.78rem;color:#6D7588}.pf-opt{font-weight:400;color:#8A93A5}' +
    '.pf-danger{border-color:#F1D3CF}.ws-btn.pf-del{background:#fff;color:#B42318!important;-webkit-text-fill-color:#B42318!important;border-color:#E4A49C}.ws-btn.pf-del:hover{background:#FDF6F5}' +
    '@media (max-width:560px){.ws-p{flex-wrap:wrap}.ws-end{width:100%;justify-content:flex-start;padding-left:48px}.ws-roles{grid-template-columns:1fr}.ws-roles dd{margin-bottom:6px}}' +
    'html[data-vs-theme="dark"] .ws-sec,html[data-vs-theme="dark"] .ws input,html[data-vs-theme="dark"] .ws select{background:#fff}';
  document.head.appendChild(css);

  var panel = null, msg = { invite: '', inviteOk: false, name: '' };
  function main() { return document.querySelector('#va .va-main'); }
  function close() {
    var m = main(); if (m) m.classList.remove('ws-on');
    if (panel) { panel.remove(); panel = null; }
  }
  function open() {
    var m = main(); if (!m) return;
    var vp = document.getElementById('vp-panel'), vu = document.querySelector('#va .va-user'); if (vp && vp.classList.contains('on') && vu) vu.click(); /* close the profile */
    if (m.classList.contains('kb-on')) { var kb = m.querySelector('.kb-back, .kb-skip'); if (kb) kb.click(); }
    close();
    var app = document.querySelector('#va .va-app'), scrim = document.getElementById('va-scrim');
    if (app && app.classList.contains('va-drawer') && scrim) scrim.click();
    panel = document.createElement('div'); panel.className = 'ws'; m.appendChild(panel); m.classList.add('ws-on');
    msg = { invite: '', inviteOk: false, name: '' }; view = 'ws';
    render();
    setTimeout(function () { var e = panel && panel.querySelector('.ws-email'); if (e) e.focus(); }, 40);
  }
  function render() {
    if (!panel) return;
    if (view === 'profile') return renderProfile();
    var d = load(), mine = me();
    var people = d.people.map(function (p) { if (p.id === 'me') { p.name = mine.name || (mine.email ? mine.email.split('@')[0] : '') || ''; p.email = mine.email || p.email; } return p; });
    var active = people.filter(function (p) { return p.status === 'active'; }).length, inv = people.length - active;
    var row = function (p) {
      var inviting = p.status === 'invited', isMe = p.id === 'me';
      var who = '<span class="ws-who"><b>' + esc(isMe ? (p.name ? p.name + ' (you)' : 'You') : (p.name || p.email)) + '</b><span>' + esc(inviting ? 'Invited ' + (p.since || '') + ' · ' + p.email : (p.email || 'Demo account')) + '</span></span>';
      var end;
      if (p.role === 'owner') end = '<span class="ws-tag">Owner</span>';
      else end = '<select data-ws-role="' + p.id + '" aria-label="Role for ' + esc(p.name || p.email) + '"><option value="member"' + (p.role === 'member' ? ' selected' : '') + '>Member</option><option value="admin"' + (p.role === 'admin' ? ' selected' : '') + '>Admin</option></select>' +
        (inviting ? '<span class="ws-tag inv">Invite pending</span><button type="button" class="ws-lnk" data-ws-resend="' + p.id + '">Resend</button><button type="button" class="ws-lnk warn" data-ws-rm="' + p.id + '">Cancel invite</button>'
                  : '<button type="button" class="ws-lnk warn" data-ws-rm="' + p.id + '">Remove</button>');
      return '<li class="ws-p' + (inviting ? ' inv' : '') + '"><span class="ws-av" aria-hidden="true">' + esc(initials(p.name || p.email)) + '</span>' + who + '<span class="ws-end">' + end + '</span></li>';
    };
    panel.innerHTML = '<div class="ws-card">' +
      '<button type="button" class="ws-back" data-ws-back><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5"/></svg>Back</button>' +
      '<h2>Workspace</h2><p class="ws-lead">Invite colleagues to work with you in Verisavo. Everyone in the workspace sees the same knowledge bases, questions and investigations.</p>' +
      '<section class="ws-sec" aria-labelledby="ws-n-h"><h3 id="ws-n-h">Workspace name</h3><form class="ws-row" data-ws-name-form novalidate><input class="ws-name" name="n" maxlength="80" value="' + esc(d.name) + '" aria-label="Workspace name"><button type="submit" class="ws-btn ws-ghost">Save</button></form><p class="ws-msg ok">' + esc(msg.name) + '</p></section>' +
      '<section class="ws-sec" aria-labelledby="ws-i-h"><h3 id="ws-i-h">Invite people</h3><p>Add one or more work emails, separated by commas. They get an email to join this workspace.</p>' +
        '<form class="ws-row" data-ws-invite novalidate><input class="ws-email" name="e" type="text" inputmode="email" autocomplete="off" placeholder="name@company.com" aria-label="Work emails"><select name="r" aria-label="Role"><option value="member">Member</option><option value="admin">Admin</option></select><button type="submit" class="ws-btn">Send invite</button></form>' +
        '<p class="ws-msg' + (msg.inviteOk ? ' ok' : '') + '" role="status">' + esc(msg.invite) + '</p></section>' +
      '<section class="ws-sec" aria-labelledby="ws-m-h"><h3 id="ws-m-h">Members</h3><p>' + active + (active === 1 ? ' member' : ' members') + (inv ? ' · ' + inv + (inv === 1 ? ' invite pending' : ' invites pending') : '') + '</p><ul class="ws-list">' + people.map(row).join('') + '</ul></section>' +
      '<section class="ws-sec" aria-labelledby="ws-r-h"><h3 id="ws-r-h">What each role can do</h3><dl class="ws-roles">' +
        '<dt>Owner</dt><dd>Everything an admin can do. The owner can’t be removed.</dd>' +
        '<dt>Admin</dt><dd>Invite and remove people, change roles, manage knowledge bases and the plan.</dd>' +
        '<dt>Member</dt><dd>Ask the Verisavo Assistant, use shared knowledge bases and start investigations.</dd></dl></section>' +
      '<p class="ws-note">Preview: the workspace is kept in this browser and invitations are not emailed yet.</p>' +
    '</div>';
  }
  document.addEventListener('submit', function (e) {
    if (!panel || !panel.contains(e.target)) return;
    e.preventDefault(); var f = e.target, d = load();
    if (f.hasAttribute('data-ws-name-form')) { var n = f.n.value.trim(); if (!n) { f.n.focus(); return; } d.name = n; save(d); msg.name = 'Saved.'; msg.invite = ''; render(); return; }
    if (f.hasAttribute('data-ws-invite')) {
      var list = f.e.value.split(/[,;\s]+/).map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean), role = f.r.value;
      var bad = list.filter(function (x) { return !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x); });
      msg.name = '';
      if (!list.length || bad.length) { msg.invite = list.length ? 'Check ' + bad.join(', ') + '. Use a full work email, like name@company.com.' : 'Add at least one work email.'; msg.inviteOk = false; render(); var i0 = panel.querySelector('.ws-email'); i0.value = f.e.value; i0.classList.add('bad'); i0.focus(); return; }
      var added = [], had = [];
      list.forEach(function (em) {
        if (d.people.some(function (p) { return (p.email || '').toLowerCase() === em; })) { had.push(em); return; }
        d.people.push({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: '', email: em, role: role, status: 'invited', since: today() }); added.push(em);
      });
      save(d);
      msg.inviteOk = !!added.length;
      msg.invite = (added.length ? 'Invite sent to ' + added.join(', ') + ' as ' + (role === 'admin' ? 'an admin' : 'a member') + '.' : '') + (had.length ? (added.length ? ' ' : '') + had.join(', ') + (had.length === 1 ? ' is' : ' are') + ' already in this workspace.' : '');
      render(); var i1 = panel.querySelector('.ws-email'); if (i1) i1.focus();
    }
  }, true);
  document.addEventListener('change', function (e) {
    var s = e.target.closest && e.target.closest('[data-ws-role]'); if (!s || !panel) return;
    var d = load(); d.people.forEach(function (p) { if (p.id === s.dataset.wsRole) p.role = s.value; }); save(d);
    msg.invite = 'Role updated.'; msg.inviteOk = true; msg.name = ''; render();
  }, true);
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-ws-open')) { e.preventDefault(); e.stopPropagation(); open(); return; }
    if (!panel) return;
    if (panel.contains(t)) {
      if (t.hasAttribute('data-ws-back')) { close(); return; }
      var d = load(), id;
      if ((id = t.getAttribute('data-ws-rm'))) {
        if (t.dataset.sure !== '1') { t.dataset.sure = '1'; t.textContent = t.textContent === 'Remove' ? 'Remove? Press again' : 'Cancel? Press again'; return; }
        var gone = d.people.filter(function (p) { return p.id === id; })[0];
        d.people = d.people.filter(function (p) { return p.id !== id || p.role === 'owner'; }); save(d);
        msg.invite = gone ? (gone.status === 'invited' ? 'Invite to ' + gone.email + ' cancelled.' : (gone.name || gone.email) + ' was removed from the workspace.') : ''; msg.inviteOk = true; msg.name = ''; render(); return;
      }
      if ((id = t.getAttribute('data-ws-resend'))) {
        d.people.forEach(function (p) { if (p.id === id) p.since = today(); }); save(d);
        var p1 = d.people.filter(function (p) { return p.id === id; })[0];
        msg.invite = p1 ? 'Invite sent again to ' + p1.email + '.' : ''; msg.inviteOk = true; msg.name = ''; render(); return;
      }
      return;
    }
    /* anything else in the app's sidebar leaves the workspace page */
    if (t.closest('#va-side, .va-side') && !t.closest('.va-user')) close();
  }, true);
  /* the knowledge base page and the workspace page take turns */
  new MutationObserver(function () { var m = main(); if (m && panel && m.classList.contains('kb-on')) close(); }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'] });

  /* Edit profile: name, work email, organisation, role, and deactivating the account */
  var view = 'ws';
  function openProfile() { open(); view = 'profile'; pmsg = ''; render(); setTimeout(function () { var i = panel && panel.querySelector('#pf-name'); if (i) i.focus(); }, 40); }
  var pmsg = '', pok = false;
  function renderProfile() {
    var u = me();
    panel.innerHTML = '<div class="ws-card">' +
      '<button type="button" class="ws-back" data-ws-back><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5"/></svg>Back</button>' +
      '<h2>Profile and settings</h2><p class="ws-lead">Update your details and how you sign in to Verisavo.</p>' +
      '<section class="ws-sec" aria-labelledby="pf-h"><h3 id="pf-h">Your details</h3>' +
        '<form class="pf-form" data-pf-form novalidate>' +
          '<label class="pf-f">Full name<input id="pf-name" name="n" autocomplete="name" maxlength="80" value="' + esc(u.name || '') + '"></label>' +
          '<label class="pf-f">Work email<input id="pf-email" name="e" type="email" autocomplete="email" maxlength="160" value="' + esc(u.email || '') + '"><small>Used to sign in and for updates about your investigations.</small></label>' +
          '<label class="pf-f">Organisation<input name="o" autocomplete="organization" maxlength="120" value="' + esc(u.organisation || '') + '"></label>' +
          '<label class="pf-f"><span>Job title <span class="pf-opt">(optional)</span></span><input name="t" autocomplete="organization-title" maxlength="80" value="' + esc(u.title || '') + '"></label>' +
          '<div class="ws-row"><button type="submit" class="ws-btn">Save changes</button></div>' +
          '<p class="ws-msg' + (pok ? ' ok' : '') + '" role="status">' + esc(pmsg) + '</p>' +
        '</form></section>' +
      '<section class="ws-sec pf-danger" aria-labelledby="pf-d-h"><h3 id="pf-d-h">Deactivate account</h3>' +
        '<p>Deactivating signs you out and turns off your access. Your workspace, knowledge bases and questions are kept, so an admin can bring you back.</p>' +
        '<div class="ws-row"><button type="button" class="ws-btn pf-del" data-pf-deact>Deactivate my account</button></div>' +
      '</section>' +
      '<p class="ws-note">Preview: your details are kept in this browser until accounts go live.</p>' +
    '</div>';
  }
  document.addEventListener('submit', function (e) {
    if (!panel || !e.target.hasAttribute || !e.target.hasAttribute('data-pf-form')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var f = e.target, n = f.n.value.trim(), em = f.e.value.trim(), u = me(), old = u.email || '';
    pok = false;
    if (!n) { pmsg = 'Enter your name.'; render(); panel.querySelector('#pf-name').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { pmsg = 'Enter a valid work email, like name@company.com.'; render(); var ie = panel.querySelector('#pf-email'); ie.value = em; ie.classList.add('bad'); ie.focus(); return; }
    u.name = n; u.email = em; u.organisation = f.o.value.trim(); u.title = f.t.value.trim();
    try { sessionStorage.setItem('verisavo-user', JSON.stringify(u)); } catch (x) {}
    var nm = document.getElementById('va-name'), av = document.getElementById('va-av');
    if (nm) nm.textContent = n; if (av) av.textContent = initials(n);
    pok = true; pmsg = em.toLowerCase() !== old.toLowerCase() && old ? 'Saved. You now sign in with ' + em + '.' : 'Changes saved.';
    render();
  }, true);
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('button'); if (!t) return;
    if (t.getAttribute('data-vp') === 'edit') { e.preventDefault(); e.stopImmediatePropagation(); openProfile(); return; }
    if (!t.hasAttribute('data-pf-deact')) return;
    if (t.dataset.sure !== '1') { t.dataset.sure = '1'; t.textContent = 'Deactivate? You will be signed out'; return; }
    var u = me(); try { localStorage.setItem('verisavo-deactivated', JSON.stringify({ email: u.email || '', at: new Date().toISOString() })); } catch (x) {}
    close();
    var so = document.getElementById('va-signout');
    if (so) so.click(); else try { sessionStorage.removeItem('verisavo-user'); } catch (x) {}
    var home = /\.html/.test(location.pathname) || location.protocol === 'file:' ? 'index.html' : '/';
    setTimeout(function () { location.href = home; }, 150);
  }, true);

  /* entry point in the client profile: Account > Workspace */
  function addEntry() {
    var vp = document.getElementById('vp-panel'); if (!vp || vp.querySelector('[data-ws-open]')) return;
    var sec = [].filter.call(vp.querySelectorAll('.vp-sec'), function (s) { var h = s.querySelector('.vp-h'); return h && h.textContent.trim() === 'Account'; })[0];
    if (!sec) return;
    var d = load(), n = d.people.length;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'vp-i'; b.setAttribute('data-ws-open', '');
    b.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="13.5" cy="8.5" r="2"/><path d="M3 16c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4M12 12.3c2.2-.2 4 1 4.6 3.7"/></svg><span>Workspace</span><small>' + n + (n === 1 ? ' person' : ' people') + '</small>';
    var edit = sec.querySelector('[data-vp="edit"]');
    if (edit && edit.nextSibling) sec.insertBefore(b, edit.nextSibling); else sec.appendChild(b);
  }
  new MutationObserver(addEntry).observe(document.documentElement, { subtree: true, childList: true });
  addEntry();
  window.vsWorkspace = { open: open, close: close };
}
