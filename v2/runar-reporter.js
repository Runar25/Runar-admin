// runar-reporter.js — in-app tester reporter (bug_reports). Spec: runar_reporter_spec_CODE.md
// Samostatný modul: injektuje plovoucí tlačítko + panel + styl, zachytí text/kontext,
// offline fronta (localStorage) + dedupe přes UNIQUE client_uuid (plain insert; 23505 = už odesláno).
// Závisí na globálech: sb (supabase client), t() (translations), lang. Načítat po runar-app.js.
(function () {
  var TESTER_KEY = 'bug_tester', QUEUE_KEY = 'bug_queue';
  var TYPES = ['replace', 'rephrase', 'pattern', 'visual', 'crash', 'other'];
  var APP_VERSION = 'unknown';
  var cap = { text: '', source: 'screen', key: '', ctx: '' };
  var curType = '';
  var btn, panel;

  function L(k) { try { return (typeof t === 'function') ? t(k) : k; } catch (e) { return k; } }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  function readQueue() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { return []; } }
  function writeQueue(q) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {} }

  function activeTab() {
    var ids = ['reading', 'tree', 'collection', 'journal'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById('apane-' + ids[i]);
      if (el && el.style.display !== 'none') return ids[i];
    }
    return 'reading';
  }
  function captureContext() {
    var sel = window.getSelection ? window.getSelection() : null;
    var txt = sel ? String(sel).trim() : '';
    var tab = activeTab();
    if (txt) {
      cap.text = txt.slice(0, 5000); cap.source = 'selection';
      var node = sel.anchorNode, el = node && (node.nodeType === 1 ? node : node.parentElement);
      var keyed = el && el.closest ? el.closest('[data-i18n]') : null;
      cap.key = keyed ? keyed.getAttribute('data-i18n') : '';
      var idEl = el && el.closest ? el.closest('[id]') : null;
      cap.ctx = tab + (idEl ? ' · #' + idEl.id : '');
    } else {
      var pane = document.getElementById('apane-' + tab);
      cap.text = (pane ? (pane.innerText || '') : '').trim().slice(0, 5000);
      cap.source = 'screen'; cap.key = ''; cap.ctx = tab + ' · #apane-' + tab;
    }
  }

  function injectStyle() {
    var s = document.createElement('style');
    s.textContent =
      '#br-btn{position:fixed;right:14px;bottom:14px;width:44px;height:44px;border-radius:50%;' +
      'background:rgba(14,22,34,.82);color:var(--gold,#FFBF00);border:1px solid var(--gold,#FFBF00);' +
      'font-size:20px;line-height:44px;text-align:center;cursor:pointer;z-index:99998;opacity:.55;' +
      '-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:opacity .2s}' +
      '#br-btn:hover,#br-btn:focus{opacity:1}' +
      '#br-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:none;' +
      'align-items:flex-end;justify-content:center}' +
      '#br-ov.on{display:flex}' +
      '#br-panel{width:100%;max-width:460px;background:#0f1827;border:1px solid var(--gold,#FFBF00);' +
      'border-bottom:none;border-radius:14px 14px 0 0;padding:18px 18px 26px;color:#e8ecf3;' +
      'font-family:inherit;max-height:88vh;overflow:auto}' +
      '#br-panel h3{margin:0 0 10px;color:var(--gold,#FFBF00);font-size:16px;letter-spacing:.04em}' +
      '.br-flag{font-size:12px;color:#9fb0c8;background:rgba(255,255,255,.05);border-radius:8px;' +
      'padding:8px 10px;margin:0 0 12px;max-height:64px;overflow:auto;white-space:pre-wrap}' +
      '.br-lbl{font-size:12px;color:#9fb0c8;margin:10px 0 6px;letter-spacing:.05em}' +
      '.br-types{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}' +
      '.br-type{padding:8px 4px;border:1px solid #2a3a52;border-radius:8px;background:transparent;' +
      'color:#cdd7e6;font-size:12px;cursor:pointer;text-align:center}' +
      '.br-type.on{border-color:var(--gold,#FFBF00);color:var(--gold,#FFBF00)}' +
      '#br-msg,#br-repl,#br-name{width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);' +
      'border:1px solid #2a3a52;border-radius:8px;color:#e8ecf3;padding:9px 11px;font-family:inherit;' +
      'font-size:14px;margin-top:4px}' +
      '#br-msg{min-height:64px;resize:vertical}' +
      '.br-row{display:flex;gap:8px;margin-top:16px}' +
      '.br-send{flex:1;background:var(--gold,#FFBF00);color:#0e1622;border:none;border-radius:8px;' +
      'padding:11px;font-weight:600;cursor:pointer;font-size:14px}' +
      '.br-cancel{background:transparent;color:#9fb0c8;border:1px solid #2a3a52;border-radius:8px;' +
      'padding:11px 16px;cursor:pointer;font-size:14px}' +
      '.br-status{font-size:13px;color:var(--gold,#FFBF00);margin-top:10px;min-height:18px;text-align:center}' +
      '.br-hide{display:none!important}';
    document.head.appendChild(s);
  }

  function buildUI() {
    btn = document.createElement('button');
    btn.id = 'br-btn'; btn.type = 'button'; btn.innerHTML = '⚑';
    btn.title = L('report_btn'); btn.setAttribute('aria-label', L('report_btn'));
    // capture selection on pointerdown (before focus clears it), open on click
    btn.addEventListener('pointerdown', captureContext);
    btn.addEventListener('click', openPanel);
    document.body.appendChild(btn);

    var ov = document.createElement('div');
    ov.id = 'br-ov';
    ov.addEventListener('click', function (e) { if (e.target === ov) closePanel(); });
    ov.innerHTML =
      '<div id="br-panel" role="dialog" aria-modal="true">' +
        '<h3 id="br-h3"></h3>' +
        '<div id="br-name-step" class="br-hide">' +
          '<div class="br-lbl" id="br-who-lbl"></div>' +
          '<input id="br-name" type="text" maxlength="40">' +
          '<div class="br-row"><button class="br-send" id="br-name-save"></button></div>' +
        '</div>' +
        '<div id="br-form">' +
          '<div class="br-flag" id="br-flag"></div>' +
          '<div class="br-lbl" id="br-type-lbl"></div>' +
          '<div class="br-types" id="br-types"></div>' +
          '<div class="br-lbl" id="br-msg-lbl"></div>' +
          '<textarea id="br-msg" maxlength="1000"></textarea>' +
          '<div id="br-repl-wrap" class="br-hide">' +
            '<div class="br-lbl" id="br-repl-lbl"></div>' +
            '<input id="br-repl" type="text" maxlength="1000">' +
          '</div>' +
          '<div class="br-row">' +
            '<button class="br-send" id="br-send"></button>' +
            '<button class="br-cancel" id="br-cancel"></button>' +
          '</div>' +
          '<div class="br-status" id="br-status"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    panel = ov;

    document.getElementById('br-cancel').addEventListener('click', closePanel);
    document.getElementById('br-send').addEventListener('click', submit);
    document.getElementById('br-name-save').addEventListener('click', saveName);
    var types = document.getElementById('br-types');
    TYPES.forEach(function (tp) {
      var b = document.createElement('button');
      b.className = 'br-type'; b.type = 'button'; b.dataset.type = tp;
      b.addEventListener('click', function () { pickType(tp); });
      types.appendChild(b);
    });
  }

  function applyText() {
    document.getElementById('br-h3').textContent = L('report_title');
    document.getElementById('br-who-lbl').textContent = L('report_who');
    document.getElementById('br-name').placeholder = L('report_who_ph');
    document.getElementById('br-name-save').textContent = L('report_who_save');
    document.getElementById('br-type-lbl').textContent = L('report_type');
    document.getElementById('br-msg-lbl').textContent = L('report_msg');
    document.getElementById('br-msg').placeholder = L('report_msg_ph');
    document.getElementById('br-repl-lbl').textContent = L('report_repl_lbl');
    document.getElementById('br-repl').placeholder = L('report_repl_ph');
    document.getElementById('br-send').textContent = L('report_send');
    document.getElementById('br-cancel').textContent = L('report_cancel');
    btn.title = L('report_btn'); btn.setAttribute('aria-label', L('report_btn'));
    Array.prototype.forEach.call(document.querySelectorAll('.br-type'), function (b) {
      b.textContent = L('report_t_' + b.dataset.type);
    });
  }

  function pickType(tp) {
    curType = tp;
    Array.prototype.forEach.call(document.querySelectorAll('.br-type'), function (b) {
      b.classList.toggle('on', b.dataset.type === tp);
    });
    document.getElementById('br-repl-wrap').classList.toggle('br-hide', tp !== 'replace');
  }
  function setStatus(msg) { document.getElementById('br-status').textContent = msg || ''; }

  function openPanel() {
    applyText();
    var hasName = !!(localStorage.getItem(TESTER_KEY) || '').trim();
    document.getElementById('br-name-step').classList.toggle('br-hide', hasName);
    document.getElementById('br-form').classList.toggle('br-hide', !hasName);
    var flag = document.getElementById('br-flag');
    flag.textContent = cap.text ? (L('report_flagging') + ' “' + cap.text.slice(0, 280) + (cap.text.length > 280 ? '…' : '') + '”') : '';
    flag.style.display = cap.text ? 'block' : 'none';
    curType = ''; setStatus('');
    document.getElementById('br-msg').value = '';
    if (document.getElementById('br-repl')) document.getElementById('br-repl').value = '';
    Array.prototype.forEach.call(document.querySelectorAll('.br-type'), function (b) { b.classList.remove('on'); });
    document.getElementById('br-repl-wrap').classList.add('br-hide');
    panel.classList.add('on');
    if (hasName) { var m = document.getElementById('br-msg'); }
    else { document.getElementById('br-name').value = ''; document.getElementById('br-name').focus(); }
  }
  function closePanel() { panel.classList.remove('on'); }

  function saveName() {
    var v = (document.getElementById('br-name').value || '').trim().slice(0, 40);
    if (!v) { document.getElementById('br-name').focus(); return; }
    localStorage.setItem(TESTER_KEY, v);
    document.getElementById('br-name-step').classList.add('br-hide');
    document.getElementById('br-form').classList.remove('br-hide');
  }

  function submit() {
    if (!curType) { setStatus(L('report_need_type')); return; }
    var rep = {
      client_uuid: uuid(),
      tester: (localStorage.getItem(TESTER_KEY) || '').slice(0, 40),
      type: curType,
      message: (document.getElementById('br-msg').value || '').slice(0, 1000),
      suggested_replacement: curType === 'replace' ? (document.getElementById('br-repl').value || '').slice(0, 1000) : null,
      flagged_text: cap.text || null,
      flagged_source: cap.source,
      i18n_key: cap.key || null,
      screen_context: cap.ctx || null,
      locale: (typeof lang !== 'undefined' ? lang : ''),
      app_version: APP_VERSION,
      user_agent: navigator.userAgent,
      reported_at: new Date().toISOString(),
      status: 'new'
    };
    var q = readQueue(); q.push(rep); writeQueue(q);
    setStatus(navigator.onLine ? L('report_sent') : L('report_saved'));
    flush();
    setTimeout(closePanel, 1200);
  }

  function flush() {
    if (!navigator.onLine || typeof sb === 'undefined' || !sb) return;
    var q = readQueue(); if (!q.length) return;
    q.forEach(function (rep) {
      sb.from('bug_reports').insert(rep)
        .then(function (res) {
          if (res && (!res.error || res.error.code === '23505')) {  // 23505 = duplicitni client_uuid (uz odeslano)
            writeQueue(readQueue().filter(function (x) { return x.client_uuid !== rep.client_uuid; }));
          }
        });
    });
  }

  function init() {
    injectStyle(); buildUI();
    fetch('sw.js', { cache: 'no-store' }).then(function (r) { return r.text(); })
      .then(function (txt) { var m = txt.match(/v(\d+)/); if (m) APP_VERSION = 'v' + m[1]; }).catch(function () {});
    window.addEventListener('online', flush);
    flush();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
