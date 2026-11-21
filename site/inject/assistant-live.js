
  /* >>> verisavo live (site/inject/assistant-live.js, added by scripts/build-site.mjs)
     The Assistant answers from the real backend through window.VSLive: streamed Markdown answers, saved
     conversations, uploads, PDF reports and the plan's paywall. The client's simulated answers still run for the
     signed-out sample preview (window.vsPreview). Runs inside the client's assistant module, so it replaces that
     module's own functions (ask, openConv, renderAnswer, pickFiles...) by name. */
  (function () {
    var LV = window.VSLive; if (!LV) return;
    var sampleAsk = ask, sampleOpenConv = openConv, sampleRender = renderAnswer, sampleTop = renderTop, samplePick = pickFiles, sampleSheet = ACT.sheetToggle, sampleUnfile = ACT.ctxUnfile;
    var liveOn = function () { return !window.vsPreview || !!LV.cachedUser(); };
    var MAX_BYTES = 4 * 1024 * 1024, MAX_FILES = 5;
    var ACCEPT = '.pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,image/*';   // as ATTACHMENT_ACCEPT in lib/server/rag/extract.ts, plus images

    RECENT = []; CONVS = {}; S.notifs = [];
    kbChip = function () { return ''; };   // company knowledge bases aren't built: no chip or menu in the composer
    kbMenu = function () { return ''; };

    // the market to search: a market chosen in the chat, a place picked from +, or the window's market menu
    function marketFor() {
      var names = (S.chatScope || []).slice();
      (S.places || []).forEach(function (v) { var n = String(v).split('|')[0]; names.push(CITY_IN[n] || n); });
      var lbl = document.getElementById('va-scope-label'); if (lbl) names.push(lbl.textContent.trim());
      for (var i = 0; i < names.length; i++) { var m = LV.market(names[i]); if (m) return m; }
      return 'All markets';
    }
    function nearBottom() { return BODY.scrollHeight - BODY.scrollTop - BODY.clientHeight < 140; }

    /* The client's answer features, filled with real data only (phase 2 adds the rest):
       - follow-up questions: suggestions built from the question's market (questions, not claims)
       - market tag: the market the question searched
       - Sources: the answer's real sources
       - Show chart: only when the answer has a table of numbers, charted from those numbers */
    function marketOf(a) {
      if (a.market && a.market !== 'All markets') return a.market;
      var named = namedMarkets(a.q || '').map(function (n) { return LV.market(CITY_IN[n] || n); }).filter(Boolean);
      return named[0] || null;
    }
    function followUps(a) {
      var m = marketOf(a);
      var list = m
        ? ['What are the biggest risks for this in ' + m + '?', 'How does ' + m + ' compare with its neighbouring markets?', 'What should we check before making a decision in ' + m + '?']
        : ['Which African markets does this matter most in?', 'What are the biggest risks here?', 'What should we check before making a decision?'];
      return list.map(function (q) { return [q, 'ask']; });
    }
    // the first Markdown table with a numeric column → { title, unit, rows: [[label, value, text]] }
    function tableChart(md) {
      var lines = String(md || '').split('\n'), i, head = null, rows = [];
      for (i = 0; i < lines.length - 1; i++) {
        if (/^\s*\|.*\|\s*$/.test(lines[i]) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
          var cells = function (l) { return l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.replace(/\*+/g, '').trim(); }); };
          head = cells(lines[i]); i += 2;
          while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
          break;
        }
      }
      if (!head || rows.length < 2) return null;
      var num = function (s) { var m = String(s).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : null; };
      for (var c = 1; c < head.length; c++) {
        var vals = rows.map(function (r) { return num(r[c]); });
        if (vals.every(function (v) { return v !== null && v >= 0; }))
          return { title: head[c], label: head[0], unit: rows.some(function (r) { return /%/.test(r[c]); }) ? '%' : '', rows: rows.map(function (r, k) { return [r[0], vals[k], r[c]]; }) };
      }
      return null;
    }
    function chartFigure(ch) {
      var max = Math.max.apply(null, ch.rows.map(function (r) { return r[1]; })) || 1;
      return '<figure class="vc vs-chart"><figcaption><b>' + esc(ch.title) + '</b><span>By ' + esc(ch.label.toLowerCase()) + ', from the table in this answer</span></figcaption><div class="vs-bars">' +
        ch.rows.map(function (r) { return '<div class="vs-bar"><span class="vs-bl">' + esc(r[0]) + '</span><span class="vs-bt"><i style="width:' + Math.max(2, Math.round(r[1] / max * 100)) + '%"></i></span><span class="vs-bv">' + esc(r[2]) + '</span></div>'; }).join('') + '</div></figure>';
    }
    var isNew = function (k) { return !k || /^new-/.test(k); };

    ask = function (q, mode) {
      if (!liveOn()) return sampleAsk(q, mode);
      var prev = last(); if (prev && prev.status !== 'done') return;
      if ((S.files || []).some(function (f) { return f.status === 'uploading'; })) { notify('One moment, your file is still uploading'); return; }
      if (!S.answers.length && !CUR) { CUR = 'new-' + Date.now(); S.title = trunc(q, 40); RECENT.unshift({ k: CUR, t: S.title }); }
      var files = (S.files || []).filter(function (f) { return f.id; });
      var a = { id: 'a' + (counter++), q: q, live: true, md: '', status: 'typing', intent: 'general', ev: [], assumptions: [], fu: [], gap: null, chart: null, tiles: null, table: null, at: Date.now(), files: files.map(function (f) { return f.name; }) };
      a.market = marketFor();
      S.answers.push(a); S.active = a.id; S.files = [];
      $('ask').value = ''; autosize(); render(); scrollEnd();
      var key = CUR, mine = S;
      LV.ask({ question: q, market: a.market, conversationId: isNew(key) ? null : key, attachmentIds: files.map(function (f) { return f.id; }) }, {
        start: function (m) {
          if (!m.conversationId || m.conversationId === key) return;
          var r = ttlFind(key); if (r) r.k = m.conversationId;
          if (CUR === key) CUR = m.conversationId;
          if (CONVS[key]) { CONVS[m.conversationId] = CONVS[key]; delete CONVS[key]; }
          key = m.conversationId;
        },
        delta: function (t) { var follow = nearBottom(); a.md += t; a.status = 'stream'; if (S === mine) { renderConvo(); if (follow) BODY.scrollTop = BODY.scrollHeight; } },
        done: function (m) { a.status = 'done'; a.serverId = m.messageId; a.convId = key; a.fu = followUps(a); if (S === mine) { render(); if (nearBottom()) scrollEnd(); } },
        error: function (msg) { a.status = 'done'; a.error = msg; if (!a.md) a.md = ''; if (S === mine) render(); },
        blocked: function (reason, usage) { a.status = 'done'; a.paywall = { reason: reason, usage: usage }; if (S === mine) { render(); scrollEnd(); } }
      });
    };

    renderAnswer = function (a) {
      if (!a.live) return sampleRender(a);
      var h = a.sys ? '' : '<div class="q' + fx('q-' + a.id) + '" id="q-' + a.id + '">' + esc(a.q) +
        (a.files && a.files.length ? '<span class="vs-qf">' + ic('clip', 's') + a.files.map(esc).join(' · ') + '</span>' : '') +
        (a.wa ? '<span class="vs-qf">Asked on WhatsApp</span>' : '') + '</div>';
      h += '<article class="ans' + fx('a-' + a.id) + '" aria-label="Verisavo answer">';
      if (a.status === 'typing') return h + '<div class="typing"><div class="dots"><span></span><span></span><span></span></div>Connecting the evidence…</div></article>';
      if (a.paywall) return h + LV.paywallHtml(a.paywall.reason, a.paywall.usage) + '</article>';
      if (a.status !== 'done') return h + (a.md ? LV.answerHtml(a.md, true) : '') + '</article>';
      var parts = LV.splitSources(a.md);
      if (parts.body.trim()) h += '<div class="vs-md">' + LV.md(parts.body) + '</div>';
      if (a.error) return h + '<div class="vs-err">' + esc(a.error) + '</div></article>';
      var ch = a.chartData === undefined ? (a.chartData = tableChart(parts.body)) : a.chartData;
      if (ch && a.showChart) h += chartFigure(ch); else unsee('chart-' + a.id);
      if (a.showSrc && parts.sources.length) h += '<div class="vs-srclist"><p>What this answer rests on</p><ul>' + parts.sources.map(function (s) { return '<li>' + ic('layers', 's') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul></div>';
      var m = marketOf(a);
      h += '<div class="quiet">' +
        (m ? '<span class="scopewrap"><span class="scopetag" title="This answer searched ' + esc(m) + '">' + ic('pin', 's') + '<span>' + esc(m) + '</span></span></span>' : '') +
        (parts.sources.length ? '<button type="button" class="lnk mute srcbtn" data-act="liveSrc" data-arg="' + a.id + '" aria-expanded="' + !!a.showSrc + '">' + ic('layers', 's') + 'Sources</button>' : '') +
        (ch ? '<button class="lnk mute" data-act="chart" data-arg="' + a.id + '">' + ic('chart', 's') + (a.showChart ? 'Hide chart' : 'Show chart') + '</button>' : '') +
        '<button class="lnk mute" data-act="liveCopy" data-arg="' + a.id + '">' + ic('copy', 's') + 'Copy</button>' +
        (a.serverId && a.convId ? '<button class="lnk mute" data-act="livePdf" data-arg="' + a.id + '">' + ic('save', 's') + 'Download PDF</button>' : '') + '</div>';
      return h + '</article>';
    };

    openConv = function (k) {
      if (!liveOn()) return sampleOpenConv(k);
      if (k === CUR) { set({ menu: false }); return; }
      if (CUR) CONVS[CUR] = S;
      var item = ttlFind(k); if (!item) return;
      CUR = k;
      if (CONVS[k]) { S = CONVS[k]; S.notifs = []; S.menu = false; S.sheet = null; S.modal = null; render(); BODY.scrollTop = 0; return; }
      var target = S = blank(item.t); S.notifs = []; render();
      LV.conversation(k).then(function (c) {
        if (!c) { if (target === S) notify('This conversation couldn’t be loaded'); return; }
        var msgs = c.messages || [], out = [];
        for (var i = 0; i < msgs.length; i++) {
          var m = msgs[i]; if (m.role !== 'user') continue;
          var n = msgs[i + 1] && msgs[i + 1].role === 'assistant' ? msgs[++i] : null;
          out.push({ id: 'a' + (counter++), q: m.content, live: true, md: n ? n.content : '', status: 'done', error: n ? null : 'No answer was saved for this question.',
            serverId: n && n.id, convId: k, ev: [], assumptions: [], fu: [], gap: null, at: Date.parse(m.createdAt) || Date.now(), files: m.files || [], wa: m.channel === 'whatsapp', market: m.market || null });
          out[out.length - 1].fu = followUps(out[out.length - 1]);
        }
        target.answers = out; target.title = c.title || target.title;
        if (target === S) { render(); BODY.scrollTop = BODY.scrollHeight; }
      });
    };

    renderTop = function () {
      sampleTop();
      if (!S.more) return;
      var p = document.querySelector('#topRight .morewrap .pop'); if (!p) return;
      var saved = !isNew(CUR) && S.answers.some(function (a) { return a.live && a.serverId; });
      p.innerHTML = '<button class="mitem" role="menuitem" data-act="reset">' + ic('plus', 's') + 'New question</button>' +
        (saved ? '<button class="mitem" role="menuitem" data-act="livePdfAll">' + ic('save', 's') + 'Download as PDF</button>' +
          '<button class="mitem" role="menuitem" data-act="liveCopyAll">' + ic('copy', 's') + 'Copy conversation</button>' +
          '<button class="mitem" role="menuitem" data-act="liveDelete">' + ic('x', 's') + 'Delete conversation</button>' : '') +
        '<button class="mitem" role="menuitem" data-act="liveAll">' + ic('pin', 's') + 'All conversations</button>';
    };

    // files go up as soon as they're picked (paid plan); the question then sends their ids
    var liveFile = null;
    pickFiles = function () {
      if (!liveOn()) return samplePick();
      if (!liveFile) {
        liveFile = document.createElement('input'); liveFile.type = 'file'; liveFile.multiple = true; liveFile.accept = ACCEPT; liveFile.hidden = true;
        (document.getElementById('va') || document.body).appendChild(liveFile);
        liveFile.addEventListener('change', function () {
          var picked = [].slice.call(liveFile.files || []); liveFile.value = ''; if (!picked.length) return;
          S.files = S.files || [];
          picked.forEach(function (f) {
            if (S.files.length >= MAX_FILES) { notify('Up to ' + MAX_FILES + ' files per question'); return; }
            if (f.size > MAX_BYTES) { notify(f.name + ' is larger than 4 MB'); return; }
            var e = { name: f.name, size: f.size, status: 'uploading' }, mine = S; S.files.push(e);
            LV.upload(f).then(function (r) {
              var list = mine.files || [], i = list.indexOf(e);
              if (r.attachment) { e.id = r.attachment.id; e.status = 'ready'; if (r.attachment.truncated) notify(f.name + ' is long, so only its first part is used'); }
              else {
                if (i >= 0) list.splice(i, 1);
                if (r.blocked) { mine.answers.push({ id: 'a' + (counter++), live: true, sys: true, q: '', status: 'done', paywall: { reason: r.blocked, usage: r.usage }, ev: [], assumptions: [], fu: [] }); }
                else notify(r.error);
              }
              if (S === mine) { render(); if (r.blocked) scrollEnd(); }
            });
          });
          S.plus = false; render();
        });
      }
      liveFile.click();
    };
    ACT.ctxUnfile = function (i) {
      if (!liveOn()) return sampleUnfile(i);
      var f = (S.files || [])[+i]; if (!f) return;
      if (f.id) LV.removeAttachment(f.id);
      S.files.splice(+i, 1); render();
    };
    ACT.sheetToggle = function () {
      if (S.answers.some(function (a) { return a.live; })) { notify('Sources are listed under each answer'); return; }
      return sampleSheet.apply(this, arguments);
    };

    function convText() { return S.answers.filter(function (a) { return a.live && !a.sys; }).map(function (a) { return 'Q: ' + a.q + '\n\n' + LV.plainText(a.md); }).join('\n\n---\n\n'); }
    function pdf(conv, msg) {
      notify('Preparing your PDF…');
      LV.pdf(conv, msg).then(function (r) {
        if (r === 'paywall') { S.answers.push({ id: 'a' + (counter++), live: true, sys: true, q: '', status: 'done', paywall: { reason: 'feature_requires_subscription', usage: null }, ev: [], assumptions: [], fu: [] }); render(); scrollEnd(); }
        else if (r === 'error') notify('The PDF couldn’t be made. Please try again.');
      });
    }
    ACT.liveSrc = function (id) { var a = A(id); if (!a) return; a.showSrc = !a.showSrc; render(); };
    ACT.liveCopy = function (id) { var a = A(id); if (a) LV.copy(LV.plainText(a.md)); };
    ACT.livePdf = function (id) { var a = A(id); if (a && a.convId) pdf(a.convId, a.serverId); };
    ACT.liveCopyAll = function () { set({ more: false }); LV.copy(convText()); };
    ACT.livePdfAll = function () { set({ more: false }); if (!isNew(CUR)) pdf(CUR); };
    ACT.liveAll = function () { location.href = '/dashboard/conversations'; };
    ACT.liveDelete = function () {
      set({ more: false });
      if (isNew(CUR) || !confirm('Delete this conversation? This can’t be undone.')) return;
      var k = CUR; LV.deleteConversation(k);
      RECENT = RECENT.filter(function (x) { return x.k !== k; }); delete CONVS[k];
      CUR = null; newQuestion(); notify('Conversation deleted');
    };

    // the signed-in user's saved conversations fill Recent
    function loadRecent() {
      LV.conversations().then(function (list) {
        var have = {}; RECENT.forEach(function (x) { have[x.k] = 1; });
        RECENT = RECENT.concat(list.filter(function (c) { return !have[c.id]; }).map(function (c) { return { k: c.id, t: c.title }; }));
        render();
      });
    }
    LV.me().then(function (u) { if (u) { loadRecent(); LV.usage(); } });
    document.addEventListener('vs:user', function (e) { if (e.detail && !RECENT.some(function (x) { return !isNew(x.k); })) loadRecent(); });
  })();
  /* <<< verisavo live */
