// verify_zalozeni_stromu.js — smoke ㊷: RITUÁL ZALOŽENÍ STROMU v aplikaci, klik po kliku (CODE-tree 2026-10-11).
//
// Proč: owner 2026-10-11 v produkci: „neukážou se runy. je potřeba, abys to celé prošel, že to funguje“ — tlačítko založení přepnulo
// do čtení Noren, ale mřížku run staví startReading(), který se při založení přeskočí; tah zůstal bez run a nic to nehlásilo (rituál
// z 2026-07-19 se rozbil potichu, nejspíš s pozdější úpravou čtení). Kontrola protlačí celou cestu skutečnou appkou z pracovního stromu:
// admin s datem a životní runou, strom nezaložen → záložka stromu → FESTA RÆTUR TRÉSINS → příběh, Norny, mřížka 25 run, cena „zdarma“,
// ostatní výklady zamčené → 3 runy (klik na runu + PŘIDAT) → TÁHNI → proxy (podvržená v prohlížeči testu: zaznamená režim a cenu, vrátí
// text a id; „DB“ zapíše zakládací čtení) → příběh zůstává nad čtením, pod ním tlačítko do stromu, appka sama neskáče (KUKY 2026-10-11)
// → tlačítko → strom: založeno, zakládací Norny první, větve, text založení, žádná nabídka; plátno oříznuté na strom (posuvník hned pod
// kořeny), přehrávání drží rám celku, „celý strom“ nad + (a + se nehne), tester bar pod stromem (KUKY 2026-10-11); START OVER a další
// čtení nesmažou datum narození. Nic se neodesílá ani neúčtuje (proxy i databáze jsou podvržené jen v prohlížeči testu).
// Netvrdí nic o serveru (claude-proxy mode founding) ani o vzhledu. Útok: scripts/protipriklady.py → PRIPADY.
// Nesmí viset (2026-10-11, CODE-tune: pre-push stál 15 min pod útokem): hlídač LIMIT_S → FAIL s krokem; dialogy se samy potvrdí a zapíšou.
//   node scripts/verify_zalozeni_stromu.js
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LIMIT_S = 150;   // běžně ~30 s; dialog nebo Chrome, který neodpoví, by jinak držel kontrolu (a pre-push) navždy
let proc = null, krok = 'start Chrome';
const konec = (kod) => { try { proc && proc.kill(); } catch (e) {} try { srv.close(); } catch (e) {} process.exit(kod); };
const hlidac = setTimeout(() => { console.log('FAIL  kontrola založení visí déle než ' + LIMIT_S + ' s (krok: ' + krok + ') — Chrome bez okna nebo stránka neodpověděla'); konec(1); }, LIMIT_S * 1000);
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
  proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find(x => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
  let id = 0; const wait = {}; const exc = [], dialogy = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails);
    else if (d.method === 'Page.javascriptDialogOpening') { dialogy.push(krok + ': ' + d.params.type + ' „' + String(d.params.message).slice(0, 80) + '“');   // jinak by blokoval stránku navždy
      ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true } })); } };
  const cmd = (method, params) => new Promise(ok => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async e => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) return 'EXC: ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text); return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  krok = 'načtení appky';
  await cmd('Page.navigate', { url: 'http://127.0.0.1:' + port + '/v2/runar-reader.html' });
  for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof startTreeFounding === 'function' && !!window.RunarTreeProd && document.readyState === 'complete'`)) break; }
  await sleep(800);
  const res = []; const ok = (n, c, i) => res.push((c ? 'OK   ' : 'FAIL ') + n + (i ? ' — ' + i : ''));
  krok = 'příprava';
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
  krok = 'klik na založení';
  // klik na založení
  await ev(`document.getElementById('tree-founding-btn').click()`); await sleep(400);
  const st = await ev(`(() => { const g = document.querySelectorAll('#reader-grid .rb'), card = document.getElementById('reader-rune-card'), story = document.getElementById('founding-story');
    const dis = ['single','kriz','horseshoe','yggdrasil'].map(m => document.getElementById('mode-btn-' + m).disabled);
    return { tab: activeAppTab, mode: _spreadMode, runes: g.length, card: card.style.display, story: story.style.display, cost: document.getElementById('spread-cost').textContent,
             costVis: document.getElementById('spread-cost').style.display, dis, d: readerUser.d, life: readerUser.lifeRune && readerUser.lifeRune.n, name: readerUser.name }; })()`);
  ok('čtení: Norny, mřížka 25 run, příběh, karta tahu', st && st.tab === 'reading' && st.mode === 'norns' && st.runes === 25 && st.card === 'block' && st.story === 'block', JSON.stringify(st));
  ok('cena: zdarma (ne „stojí 2 čtení“)', st && st.costVis !== 'none' && /Free|Frítt/.test(st.cost) && !/2/.test(st.cost), st && st.cost);
  ok('ostatní výklady zamčené, čtenář = já se životní runou, datum zachované', st && st.dis.every(Boolean) && st.d === 14 && st.life && st.name === 'Kuky', JSON.stringify(st));
  krok = 'tah 3 run';
  // tah 3 run: klik na runu → PŘIDAT
  for (let i = 0; i < 3; i++) {
    await ev(`(() => { const b = [...document.querySelectorAll('#reader-grid .rb')].filter(x => !x.disabled)[${i} * 5]; window.__drawnG = (window.__drawnG || []).concat([RUNES.filter(r => r.n === b.dataset.rune)[0].g]); b.click(); document.getElementById('btn-speak').click(); })()`);
    await sleep(150);
  }
  const s3 = await ev(`({ n: _spreadCount(_spread3Runes), btn: document.getElementById('btn-speak').textContent, dis: document.getElementById('btn-speak').disabled })`);
  ok('tři runy v pozicích, tlačítko TÁHNI povolené', s3 && s3.n === 3 && !s3.dis, JSON.stringify(s3));
  krok = 'odeslání čtení';
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
  krok = 'tlačítko do stromu';
  await ev(`document.getElementById('founding-to-tree').click()`);
  const tr = await ev(`(async () => { await new Promise(r => setTimeout(r, 300)); const mains = (_treePick && _treePick.pick || []).filter(p => typeof p.k === 'number');
    const vis = i => { const e = document.getElementById(i); return !!e && e.style.display !== 'none'; };
    return { tab: activeAppTab, first: _treeLog[0] && _treeLog[0].id, n: _treeLog.length, mains: mains.length, living: vis('tree-living'), fread: vis('tree-founding-reading'),
             fcta: vis('tree-founding-cta'), need: vis('tree-need-rune'), nodob: vis('tree-no-dob'), d: readerUser.d, sh: _treePick && _treePick.frameSh }; })()`);
  ok('tlačítko → strom: založeno, zakládací Norny první, větve, text založení', tr && tr.tab === 'tree' && tr.first === 'fnd1' && tr.n === 41 && tr.mains >= 3 && tr.living && tr.fread, JSON.stringify(tr));
  ok('ve stromě žádná nabídka ani formulář na datum', tr && !tr.fcta && !tr.need && !tr.nodob && tr.d === 14, JSON.stringify(tr));
  // Rám = plátno oříznuté na strom (KUKY 2026-10-11 „pořád může jít výš … posuvník mnohem blíže kořenům … dynamicky s tím, jak roste
  // strom“). Měří se nakreslené pixely, ne čísla rendereru: první a poslední řádek s kresbou proti okrajům plátna (px modelu).
  krok = 'rám (pixely plátna)';
  const ram = await ev(`(() => { const cv = document.getElementById('tree-living-canvas'), c = cv.getContext('2d'), w = cv.width, h = cv.height;
    const d = c.getImageData(0, 0, w, h).data; let top = -1, bot = -1;
    for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { top = y; break; }
    for (let y = h - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { bot = y; break; }
    const k = w / _treePick.W, st = document.getElementById('tree-stage').getBoundingClientRect(), sk = document.getElementById('tree-seek-bar').getBoundingClientRect();
    return { H: _treePick.H, top: Math.round(top / k), mez: Math.round((h - 1 - bot) / k), stageH: Math.round(st.height),
             cssH: Math.round(cv.getBoundingClientRect().height), seekGap: Math.round(sk.top - st.bottom) }; })()`);
  ok('plátno oříznuté na strom: koruna těsně pod horním okrajem, kořeny těsně nad dolním', ram && ram.H < 900 && ram.top >= 2 && ram.top <= 16 && ram.mez >= 2 && ram.mez <= 16, JSON.stringify(ram));
  ok('posuvník hned pod scénou (scéna = výška plátna)', ram && ram.seekGap >= 0 && ram.seekGap <= 24 && Math.abs(ram.stageH - ram.cssH) <= 1, JSON.stringify(ram));
  krok = 'přehrávání historie';
  const hist = await ev(`(() => { const H0 = _treePick.H, s0 = document.getElementById('tree-stage').getBoundingClientRect().height;
    _drawTreeAt(1); const H1 = _treePick.H, s1 = document.getElementById('tree-stage').getBoundingClientRect().height;
    _drawTreeAt(null); return { H0, H1, H2: _treePick.H, s0: Math.round(s0), s1: Math.round(s1) }; })()`);
  ok('přehrávání historie drží rám celého stromu (posuvník neposkakuje)', hist && hist.H1 >= hist.H0 && hist.H2 === hist.H0 && hist.s1 >= hist.s0, JSON.stringify(hist));
  krok = 'přiblížení a rozvržení';
  const lay = await ev(`(() => { const all = document.getElementById('tree-zoom-all'), tb = document.getElementById('tree-tester-bar'), tl = document.getElementById('tree-living');
    const p0 = document.getElementById('tree-zoom-in').getBoundingClientRect().top; treeZoom(1);
    const p1 = document.getElementById('tree-zoom-in').getBoundingClientRect().top, a = all.getBoundingClientRect(), allVis = all.style.display !== 'none'; treeZoomAll();
    return { allNadPlus: !!all.nextElementSibling && all.nextElementSibling.id === 'tree-zoom-in', p0: Math.round(p0), p1: Math.round(p1), allTop: Math.round(a.top), allVis,
             testerDole: !!tb && !!(tl.compareDocumentPosition(tb) & Node.DOCUMENT_POSITION_FOLLOWING), okraj: getComputedStyle(tl).marginTop }; })()`);
  ok('přiblížení: „celý strom“ se objeví nad + a + se nehne', lay && lay.allNadPlus && lay.allVis && lay.p0 === lay.p1 && lay.allTop < lay.p1, JSON.stringify(lay));
  ok('tester bar pod stromem, scéna bez horního okraje', lay && lay.testerDole && lay.okraj === '0px', JSON.stringify(lay));
  // datum narození po START OVER a po začátku dalšího čtení (do 2026-10-11 se nulovalo → Životní runa ukázala formulář na datum)
  krok = 'datum narození';
  const dob = await ev(`(async () => { showAppTab('reading'); resetReader(); const d1 = readerUser.d; startReading(); const d2 = readerUser.d;
    showAppTab('liferune'); updateTreeTab(); const vis = i => { const e = document.getElementById(i); return !!e && e.style.display !== 'none'; };
    return { d1, d2, nodob: vis('tree-no-dob'), runa: vis('tree-reading-exists'), story: document.getElementById('founding-story').style.display }; })()`);
  ok('START OVER a další čtení: datum narození zůstává, Životní runa ukáže runu', dob && dob.d1 === 14 && dob.d2 === 14 && !dob.nodob && dob.runa && dob.story === 'none', JSON.stringify(dob));
  ok('žádný dialog (alert / confirm) během rituálu', dialogy.length === 0, dialogy.join(' | '));
  ok('žádná chyba JS za běhu', exc.length === 0, exc.slice(0, 3).map(e => (e.exception && e.exception.description || e.text || '').slice(0, 200)).join(' | '));
  const okAll = res.every(x => x.startsWith('OK'));
  if (!okAll) { res.filter(x => !x.startsWith('OK')).forEach(x => console.log('      ' + x));
    console.log('FAIL  rituál založení stromu nefunguje (' + res.filter(x => !x.startsWith('OK')).length + ' z ' + res.length + ' kroků)'); }
  else console.log('OK    rituál založení stromu: ' + res.length + ' kroků od tlačítka ve stromě po strom se zakládacími Nornami první');
  clearTimeout(hlidac); ws.close(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  konec(okAll ? 0 : 1);
})().catch(e => { clearTimeout(hlidac); console.log('FAIL  kontrola založení spadla (krok: ' + krok + '): ' + e.message); konec(1); });
