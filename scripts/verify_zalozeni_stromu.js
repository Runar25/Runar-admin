// verify_zalozeni_stromu.js — smoke ㊷: RITUÁL ZALOŽENÍ STROMU v aplikaci, klik po kliku (CODE-tree 2026-10-11).
//
// Proč: owner 2026-10-11 v produkci: „neukážou se runy. je potřeba, abys to celé prošel, že to funguje“ — tlačítko založení přepnulo
// do čtení Noren, ale mřížku run staví startReading(), který se při založení přeskočí; tah zůstal bez run a nic to nehlásilo (rituál
// z 2026-07-19 se rozbil potichu, nejspíš s pozdější úpravou čtení). Kontrola protlačí celou cestu skutečnou appkou z pracovního stromu:
// admin s datem a životní runou, strom nezaložen → záložka stromu → FESTA RÆTUR TRÉSINS → příběh, Norny, mřížka 25 run, cena „zdarma“,
// ostatní výklady zamčené → 3 runy (klik na runu + PŘIDAT) → TÁHNI → proxy (podvržená v prohlížeči testu: zaznamená režim a cenu, vrátí
// text a id; „DB“ zapíše zakládací čtení) → příběh zůstává nad čtením, pod ním tlačítko do stromu, appka sama neskáče (KUKY 2026-10-11)
// → tlačítko → strom: založeno, zakládací Norny první, větve, text založení, rám (ne přilepený dolů), žádná nabídka; START OVER a další
// čtení nesmažou datum narození. Nic se neodesílá ani neúčtuje (proxy i databáze jsou podvržené jen v prohlížeči testu).
// Netvrdí nic o serveru (claude-proxy mode founding) ani o vzhledu. Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_zalozeni_stromu.js
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rit-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find(x => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
  let id = 0; const wait = {}; const exc = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
  const cmd = (method, params) => new Promise(ok => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async e => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) return 'EXC: ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text); return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cmd('Page.navigate', { url: 'http://127.0.0.1:' + port + '/v2/runar-reader.html' });
  for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof startTreeFounding === 'function' && !!window.RunarTreeProd && document.readyState === 'complete'`)) break; }
  await sleep(800);
  const res = []; const ok = (n, c, i) => res.push((c ? 'OK   ' : 'FAIL ') + n + (i ? ' — ' + i : ''));
  // příprava: admin, datum, životní runa, strom nezaložen; DB podvržená (čtení + zakládací čtení po „zápisu“ proxy)
  const prep = await ev(`(async () => {
    currentUser = { email: ADMIN_EMAILS[0], id: 'u1' }; userName = 'Kuky'; userTier = 'premium'; profileLoaded = true;
    readerUser = Object.assign(readerUser || {}, { d: 14, m: 6, y: null });
    _lifeRuneText = 'Text životní runy.'; _lifeRuneNum = 1; _lifeRuneLang = lang; userTreeFounded = false; _foundingText = null; _foundingReadingId = null;
    const R = RUNES.filter(r => r.g && r.g.length === 1), rows = []; let t0 = Date.parse('2026-03-02T10:00:00Z');
    for (let i = 0; i < 40; i++) rows.push({ id: 'r' + i, rune_name: R[(i * 7) % R.length].n, rune_glyph: R[(i * 7) % R.length].g, short_text: '',
      area: AREAS.en[i % AREAS.en.length], aol: AREAS.en[i % AREAS.en.length], intention: INTENTIONS.en[i % 3], seeking: SEEKS.en[i % SEEKS.en.length], drawn_at: new Date(t0 + i * 86400000).toISOString() });
    window.__rows = rows; window.__founded = false;
    const orig = sb.from.bind(sb);
    sb.from = (t) => t !== 'readings' ? orig(t) : { select: () => ({ eq: (c1, v1) => ({
      order: () => Promise.resolve({ data: window.__rows }),
      eq: () => ({ maybeSingle: () => Promise.resolve({ data: (v1 === 'fnd1' && window.__founded) ? { deep_text: 'Text zakládacích Noren.', short_text: '' } : null, error: null }) }) }) }) };
    window.__proxy = null;
    callProxy = async function (sys, prompt, tokens, useCredit, credits, journal, mode) {
      window.__proxy = { useCredit, credits, mode, hasPrompt: !!prompt };
      if (mode === 'founding') { window.__founded = true; const n = journal && journal.rune_display;
        window.__rows = window.__rows.concat([{ id: 'fnd1', rune_name: 'NORNS', rune_glyph: '', short_text: (window.__drawnG || []).join(' '), area: 'spread', aol: null,
          intention: null, seeking: null, drawn_at: new Date().toISOString() }]); }
      return { text: 'Zakládací čtení: Urður, Verðandi, Skuld.', reading_id: mode === 'founding' ? 'fnd1' : 'x1', model: 'test' };
    };
    showAppTab('tree'); updateTreeTab(); await new Promise(r => setTimeout(r, 100));
    const fc = document.getElementById('tree-founding-cta');
    return { fcta: fc && fc.style.display !== 'none', btn: (document.getElementById('tree-founding-btn') || {}).textContent };
  })()`);
  ok('strom nezaložen: ve stromě tlačítko založení', prep && prep.fcta && prep.btn, JSON.stringify(prep));
  // klik na založení
  await ev(`document.getElementById('tree-founding-btn').click()`); await sleep(400);
  const st = await ev(`(() => { const g = document.querySelectorAll('#reader-grid .rb'), card = document.getElementById('reader-rune-card'), story = document.getElementById('founding-story');
    const dis = ['single','kriz','horseshoe','yggdrasil'].map(m => document.getElementById('mode-btn-' + m).disabled);
    return { tab: activeAppTab, mode: _spreadMode, runes: g.length, card: card.style.display, story: story.style.display, cost: document.getElementById('spread-cost').textContent,
             costVis: document.getElementById('spread-cost').style.display, dis, d: readerUser.d, life: readerUser.lifeRune && readerUser.lifeRune.n, name: readerUser.name }; })()`);
  ok('čtení: Norny, mřížka 25 run, příběh, karta tahu', st && st.tab === 'reading' && st.mode === 'norns' && st.runes === 25 && st.card === 'block' && st.story === 'block', JSON.stringify(st));
  ok('cena: zdarma (ne „stojí 2 čtení“)', st && st.costVis !== 'none' && /Free|Frítt/.test(st.cost) && !/2/.test(st.cost), st && st.cost);
  ok('ostatní výklady zamčené, čtenář = já se životní runou, datum zachované', st && st.dis.every(Boolean) && st.d === 14 && st.life && st.name === 'Kuky', JSON.stringify(st));
  // tah 3 run: klik na runu → PŘIDAT
  for (let i = 0; i < 3; i++) {
    await ev(`(() => { const b = [...document.querySelectorAll('#reader-grid .rb')].filter(x => !x.disabled)[${i} * 5]; window.__drawnG = (window.__drawnG || []).concat([RUNES.filter(r => r.n === b.dataset.rune)[0].g]); b.click(); document.getElementById('btn-speak').click(); })()`);
    await sleep(150);
  }
  const s3 = await ev(`({ n: _spreadCount(_spread3Runes), btn: document.getElementById('btn-speak').textContent, dis: document.getElementById('btn-speak').disabled })`);
  ok('tři runy v pozicích, tlačítko TÁHNI povolené', s3 && s3.n === 3 && !s3.dis, JSON.stringify(s3));
  await ev(`document.getElementById('btn-speak').click()`); await sleep(1200);
  const after = await ev(`({ proxy: window.__proxy, founded: userTreeFounded, pending: _foundingPending, out: document.getElementById('reader-output').style.display,
    unlocked: ['single','kriz','horseshoe','yggdrasil'].every(m => !document.getElementById('mode-btn-' + m).disabled), err: (document.getElementById('st-reader') || {}).textContent })`);
  ok('odesláno jako založení (režim founding, cena 0, bez kreditu)', after && after.proxy && after.proxy.mode === 'founding' && after.proxy.credits === 0 && after.proxy.useCredit === false, JSON.stringify(after));
  ok('po čtení: založeno, výklady odemčené, výklad vidět', after && after.founded && !after.pending && after.out === 'block' && after.unlocked, JSON.stringify(after));
  const fin = await ev(`({ story: document.getElementById('founding-story').style.display, btn: document.getElementById('founding-to-tree').style.display,
    btnTxt: document.getElementById('founding-to-tree').textContent })`);
  ok('po čtení: příběh zůstává nad čtením a pod ním tlačítko do stromu', fin && fin.story === 'block' && fin.btn !== 'none' && /TREE|TRÉ/.test(fin.btnTxt), JSON.stringify(fin));
  await sleep(4500);
  ok('žádný samovolný skok do stromu (čtení jde dočíst)', (await ev(`activeAppTab`)) === 'reading');
  await ev(`document.getElementById('founding-to-tree').click()`);
  const tr = await ev(`(async () => { await new Promise(r => setTimeout(r, 300)); const mains = (_treePick && _treePick.pick || []).filter(p => typeof p.k === 'number');
    const vis = i => { const e = document.getElementById(i); return !!e && e.style.display !== 'none'; };
    return { tab: activeAppTab, first: _treeLog[0] && _treeLog[0].id, n: _treeLog.length, mains: mains.length, living: vis('tree-living'), fread: vis('tree-founding-reading'),
             fcta: vis('tree-founding-cta'), need: vis('tree-need-rune'), nodob: vis('tree-no-dob'), d: readerUser.d, sh: _treePick && _treePick.frameSh }; })()`);
  ok('tlačítko → strom: založeno, zakládací Norny první, větve, text založení', tr && tr.tab === 'tree' && tr.first === 'fnd1' && tr.n === 41 && tr.mains >= 3 && tr.living && tr.fread, JSON.stringify(tr));
  ok('ve stromě žádná nabídka ani formulář na datum', tr && !tr.fcta && !tr.need && !tr.nodob && tr.d === 14, JSON.stringify(tr));
  ok('strom svisle v rámu (ne přilepený dolů)', tr && typeof tr.sh === 'number' && tr.sh < 0, 'posun ' + (tr && tr.sh));
  // datum narození po START OVER a po začátku dalšího čtení (do 2026-10-11 se nulovalo → Životní runa ukázala formulář na datum)
  const dob = await ev(`(async () => { showAppTab('reading'); resetReader(); const d1 = readerUser.d; startReading(); const d2 = readerUser.d;
    showAppTab('liferune'); updateTreeTab(); const vis = i => { const e = document.getElementById(i); return !!e && e.style.display !== 'none'; };
    return { d1, d2, nodob: vis('tree-no-dob'), runa: vis('tree-reading-exists'), story: document.getElementById('founding-story').style.display }; })()`);
  ok('START OVER a další čtení: datum narození zůstává, Životní runa ukáže runu', dob && dob.d1 === 14 && dob.d2 === 14 && !dob.nodob && dob.runa && dob.story === 'none', JSON.stringify(dob));
  ok('žádná chyba JS za běhu', exc.length === 0, exc.slice(0, 3).map(e => (e.exception && e.exception.description || e.text || '').slice(0, 200)).join(' | '));
  const okAll = res.every(x => x.startsWith('OK'));
  if (!okAll) { res.filter(x => !x.startsWith('OK')).forEach(x => console.log('      ' + x));
    console.log('FAIL  rituál založení stromu nefunguje (' + res.filter(x => !x.startsWith('OK')).length + ' z ' + res.length + ' kroků)'); }
  else console.log('OK    rituál založení stromu: ' + res.length + ' kroků od tlačítka ve stromě po strom se zakládacími Nornami první');
  ws.close(); proc.kill(); srv.close(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  process.exit(okAll ? 0 : 1);
})().catch(e => { console.log('FAIL  kontrola založení spadla: ' + e.message); process.exit(1); });
