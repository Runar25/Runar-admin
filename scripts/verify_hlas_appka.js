// verify_hlas_appka.js — smoke ㊹: hlas v appce klik po kliku — co appka POŠLE serveru hlasu (CODE-tune 2026-10-11, DECISIONS (61)).
//
// Proč: 2026-08-03 se vazba hlasu na čtení (#2b) vracela do hodiny — postavená na jedné cestě a nasazená bez proklikání: čtení bez
// `_lastReadingId` dostalo „Rúnar odpočívá“ (DECISIONS 2026-08-03 „#2b VRÁCENO“, poučení: napřed zmapovat VŠECHNY cesty a proklikat).
// Kontrola pouští skutečnou appku z pracovního stromu v prohlížeči bez okna; proxy čtení i hlasu a databáze jsou podvržené jen v něm
// (nic se neodesílá ani neúčtuje). Prochází: (A) uložené čtení → hlas posílá jeho reading_id, žádný podpis · (B) přepnutí jazyka =
// nové čtení; po návratu hlas patří ke čtení NA OBRAZOVCE, ne k poslednímu · (C) čtení pro někoho jiného (neukládá se) → podpis
// z claude-proxy, žádné reading_id · (D) „už zaznělo“ (409) → tlačítko „Rúnar promluvil“, žádná chyba · (E) deník: hlas u single
// i výkladu, zakládací Norny bez hlasu, ťuknutí pošle id své karty a pustí uložený hlas · (F) menu: počet hlasů jen testerovi.
// Netvrdí nic o serveru (to drží verify_hlas_ke_cteni.js) ani o vzhledu. Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_hlas_appka.js
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
  if (!EXE) { console.log('FAIL  prohlížeč (Chrome/Edge) nenalezen'); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hlas-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  const konec = (kod) => { try { proc.kill(); } catch (e) {} srv.close(); setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} process.exit(kod); }, 300); };
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find(x => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
  let id = 0; const wait = {}; const exc = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
  // pojistky (2026-10-11): limit, spadlý Chrome, dialog — bez nich ㊺ visel v pre-pushi 48 minut (scripts/utils/prohlizec_pojistky.js)
  const poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'hlas v appce (㊹)', limitS: 180 });
  const cmd = (method, params) => new Promise(ok => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async e => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) return 'EXC: ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text); return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cmd('Page.navigate', { url: 'http://127.0.0.1:' + port + '/v2/runar-reader.html' });
  for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof generateVoice === 'function' && typeof renderJournal === 'function' && document.readyState === 'complete'`)) break; }
  await sleep(800);
  const res = []; const ok = (n, c, i) => res.push((c ? 'OK   ' : 'FAIL ') + n + (i ? ' — ' + i : ''));

  // příprava: přihlášený premium, ne tester; proxy čtení a hlasu podvržené (hlas: zapíše tělo požadavku a vrátí ticho)
  const prep = await ev(`(async () => {
    currentUser = { email: 'tester-hlasu@example.invalid', id: 'u1' }; userName = 'Test'; userTier = 'premium'; profileLoaded = true; isTester = false;
    readerUser = Object.assign(readerUser || {}, { d: 14, m: 6, y: null });
    window.__hlas = []; window.__odpoved = null;
    const TICHO = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA';
    const fOrig = window.fetch.bind(window);
    window.fetch = async (u, o) => {
      if (String(u) === EL_PROXY) {
        window.__hlas.push(JSON.parse(o.body));
        const r = window.__odpoved || { status: 200, body: { audio_url: TICHO } };
        return new Response(JSON.stringify(r.body), { status: r.status, headers: { 'Content-Type': 'application/json' } });
      }
      return fOrig(u, o);
    };
    window.__cteni = [];
    callProxy = async function (sys, prompt, tokens, useCredit, credits, journal, mode) {
      const n = window.__cteni.length + 1; window.__cteni.push({ journal: !!journal, mode });
      const r = { text: 'Čtení číslo ' + n + ' pro hlas.\\n\\u2726 Myšlenka bez hlasu.', model: 'test' };
      if (journal) r.reading_id = 'ctení-' + n; else r.voice = { text: 'Čtení číslo ' + n + ' pro hlas.', ticket: 'podpis-' + n };
      return r;
    };
    if (typeof syncFreeBalance === 'function') syncFreeBalance = async () => {};
    if (typeof loadJournal === 'function') loadJournal = async () => {};
    showAppTab('reading');
    return 'ok';
  })()`);
  ok('příprava appky (přihlášený premium, podvržené proxy)', prep === 'ok', prep);

  const cteni = async (L, mode) => ev(`(async () => {
    lang = ${JSON.stringify(L)}; _readingMode = ${JSON.stringify(mode)};
    readerRune = RUNES.find(r => r.n === 'Fehu'); await _generateReading();
    const b = document.getElementById('btn-generate-voice');
    return { vis: b && b.style.display !== 'none', dis: b && b.disabled, short: (document.getElementById('out-short') || {}).innerText };
  })()`);
  const hlas = async () => ev(`(async () => { const n0 = window.__hlas.length; await generateVoice(); const b = document.getElementById('btn-generate-voice');
    return { body: window.__hlas.slice(n0)[0] || null, btn: b.textContent, dis: b.disabled, st: (document.getElementById('st-voice') || {}).textContent }; })()`);

  // (A) uložené čtení EN
  const a = await cteni('en', 'mine');
  ok('(A) čtení uložené: tlačítko hlasu je k dispozici', a && a.vis && !a.dis, JSON.stringify(a));
  // (B) přepnutí do IS = nové čtení; návrat do EN → hlas patří čtení 1, ne 2
  const b2 = await cteni('is', 'mine');
  const bz = await ev(`(() => { lang = 'en'; showCachedReading('en'); return (document.getElementById('out-short') || {}).innerText; })()`);
  const hB = await hlas();
  ok('(B) po návratu do EN hlas patří čtení na obrazovce (ctení-1), ne poslednímu (ctení-2)', hB && hB.body && hB.body.reading_id === 'ctení-1' && !hB.body.ticket,
     JSON.stringify(hB && hB.body) + ' · obrazovka: ' + String(bz).slice(0, 30));
  ok('(A) uložené čtení: bez podpisu, s textem pro starou verzi serveru', hB && hB.body && !hB.body.voice_text && /Čtení číslo 1/.test(hB.body.text || ''), JSON.stringify(hB && hB.body));
  ok('(A) myšlenka ✦ se do textu hlasu nedostane', hB && hB.body && !/\u2726|Myšlenka/.test(hB.body.text || ''), hB && hB.body && hB.body.text);
  // (C) čtení pro někoho jiného (ne tester → neukládá se) → podpis
  const c = await cteni('en', 'someone');
  const hC = await hlas();
  ok('(C) neuložené čtení: podpis z claude-proxy, žádné reading_id', hC && hC.body && hC.body.ticket === 'podpis-' + (await ev('window.__cteni.length')) && !hC.body.reading_id &&
     hC.body.voice_text === 'Čtení číslo ' + (await ev('window.__cteni.length')) + ' pro hlas.', JSON.stringify(hC && hC.body));
  // (D) server: už zaznělo → tlačítko „promluvil“, žádná chyba
  await cteni('en', 'mine');
  await ev(`window.__odpoved = { status: 409, body: { error: 'voice_used' } }`);
  const hD = await hlas();
  await ev(`window.__odpoved = null`);
  const done = await ev(`t('voice_btn_done')`);
  ok('(D) „už zaznělo“ → tlačítko „Rúnar promluvil“, vypnuté, bez chybové hlášky', hD && hD.btn.trim() === String(done).trim() && hD.dis && !hD.st, JSON.stringify(hD));

  // (E) deník: hlas u single i výkladu, zakládací Norny bez hlasu
  const e = await ev(`(async () => {
    _foundingReadingId = 'fnd1'; showAppTab('journal');
    renderJournal([
      { id: 'j-single', rune_name: 'Fehu', rune_glyph: 'ᚠ', lang: 'en', short_text: 'Single v deníku.\\n\\u2726 Myšlenka.', deep_text: '', area: null, drawn_at: new Date().toISOString() },
      { id: 'j-spread', rune_name: 'NORNS', rune_glyph: '', lang: 'is', short_text: 'ᚠ FEHU · ᚢ URUZ · ᚦ THURISAZ', deep_text: 'Výklad v deníku.', area: 'spread', drawn_at: new Date().toISOString() },
      { id: 'fnd1', rune_name: 'NORNS', rune_glyph: '', lang: 'en', short_text: 'ᚠ FEHU · ᚢ URUZ · ᚦ THURISAZ', deep_text: 'Zakládací Norny.', area: 'spread', drawn_at: new Date().toISOString() },
    ]);
    const tl = [0, 1, 2].map(i => !!document.getElementById('jvoice-btn-' + i));
    const kolekce = document.querySelectorAll('[id^="jaudio-btn-"]').length, popisek = (document.getElementById('jvoice-btn-0') || {}).textContent || '';
    window.__odpoved = { status: 200, body: { audio_url: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA', stored: true } };
    const n0 = window.__hlas.length; await playReadingVoice(1); window.__odpoved = null;
    const body = window.__hlas.slice(n0)[0] || null, btn = document.getElementById('jvoice-btn-1');
    return { tl, body, btn: btn && btn.textContent, prehravac: !!(document.getElementById('jvoice-1') || {}).innerHTML, kolekce, popisek };
  })()`);
  ok('(E) deník: tlačítko hlasu u single i výkladu, u zakládacích Noren ne', e && e.tl && e.tl[0] && e.tl[1] && !e.tl[2], JSON.stringify(e && e.tl));
  ok('(E) deník: ťuknutí pošle id své karty a jazyk čtení', e && e.body && e.body.reading_id === 'j-spread' && e.body.lang === 'is', JSON.stringify(e && e.body));
  ok('(E) deník: uložený hlas se pustí (přehrávač, tlačítko „promluvil“)', e && e.prehravac && String(e.btn).trim() === String(done).trim(), JSON.stringify(e));
  // owner 2026-10-11: „z kolekce? to je určitě špatně. ty mají být jen v kolekci“ · „něco ‚hear the reading‘ by znělo asi lépe“
  ok('(E) deník: Rúnarova slova o runě z Kolekce v deníku nejsou, tlačítko hlasu čtení zní „hear the reading“', e && e.kolekce === 0 && /HEAR THE READING/.test(e.popisek),
     JSON.stringify({ kolekce: e && e.kolekce, popisek: e && e.popisek }));

  // (F) menu: počet hlasů jen tester
  const f = await ev(`(() => {
    const mesic = new Date().toISOString().slice(0, 7);
    userMonthKey = mesic; userMonthUnits = 3; userVoiceKey = mesic; userVoiceCount = 2;
    isTester = false; updateDropdown(); const ne = (document.getElementById('sp-balance') || document.querySelector('[id*="balance"]') || {}).innerHTML || '';
    isTester = true; updateDropdown(); const ano = (document.getElementById('sp-balance') || document.querySelector('[id*="balance"]') || {}).innerHTML || '';
    isTester = false; return { ne, ano };
  })()`);
  ok('(F) menu: netester nevidí počet hlasů, tester ano', f && f.ne && !/<br>/i.test(f.ne) && /<br>/i.test(f.ano), JSON.stringify(f));
  ok('bez výjimek v appce', !exc.length, exc.map(x => (x.exception && x.exception.description || x.text || '').split('\n')[0]).join(' | ').slice(0, 300));

  const dialogy = poj.hotovo();
  ok('stránka neotevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', !dialogy.length, dialogy.join(' · '));
  for (const r of res) console.log(r);
  const zle = res.filter(r => r.startsWith('FAIL')).length;
  console.log(zle ? '\n' + zle + ' selhalo' : '\nOK  hlas v appce: uložené čtení id, neuložené podpis, jazyk na obrazovce, deník, menu');
  konec(zle ? 1 : 0);
})().catch(e => { console.log('FAIL  běh kontroly: ' + (e && e.message)); process.exit(1); });
