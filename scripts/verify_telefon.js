// verify_telefon.js — appka na telefonu (375 × 812, dotyk): nic nepřetéká přes okraj obrazovky a stránka se nedá posouvat do strany.
//
// Proč (owner 2026-10-22 „5. 1 a 2, udělej to“, rozbor CODE-read „co nikdo nehlídá“, bod 5): kontroly v prohlížeči jedou v okně počítače;
// owner appku používá hlavně na telefonu a posunuté nebo přetékající prvky dnes najde jen on (DECISIONS 2026-10-13 — fotka a formulář
// zmizely, stránka zůstala posunutá; owner to poslal snímkem). Kontrola základu (㉼) mobilní rozložení výslovně neumí.
// Jak: Chrome bez okna s emulací telefonu (šířka 375, dotyk), appka z pracovního stromu, Supabase blokovaná (pojistky). Stavy: návštěvník —
// každá záložka, tah runy, okno cesty, menu; přihlášený Rune Seeker (podvržený jen v prohlížeči) — Spá s pruhem zůstatku, hotové čtení
// (proxy podvržená). V každém stavu: (a) šířka dokumentu ≤ šířka okna (žádné posouvání do strany); (b) žádný viditelný prvek s textem nebo
// tlačítko nesahá přes levý / pravý okraj — kromě prvků uvnitř kontejneru, který posouvání do strany dovoluje (overflow-x auto/scroll; oříznutí hidden/clip je vada).
// Prvek celý mimo obrazovku (zavřené boční menu čeká za pravým okrajem) se nepočítá — vada je přečuhování přes okraj.
// Neumí: překryv dvou prvků přes sebe, velikost písma, výšku (posouvání dolů je v pořádku).
//   node scripts/verify_telefon.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const SIRKA = 375, VYSKA = 812;
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

// W = šířka telefonu, ne window.innerWidth: mobilní prohlížeč při širším obsahu stránku oddálí a innerWidth naroste (2026-10-22, útok).
const MERENI = `(() => {
  const W = ${SIRKA}, out = [];
  const docW = document.documentElement.scrollWidth;
  const vid = (e) => { if (!e.getClientRects().length) return false; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; } return true; };
  const vScroll = (e) => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return true; /* oříznuté (hidden/clip) se nevynechává — useknuté tlačítko je vada */ } return false; };
  document.querySelectorAll('body *').forEach((e) => {
    if (e.closest('svg') || /^(SCRIPT|STYLE|AUDIO)$/.test(e.tagName)) return;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').trim();
    if (!own && !/^(BUTTON|INPUT|SELECT|TEXTAREA|A|IMG)$/.test(e.tagName)) return;
    if (!vid(e) || vScroll(e)) return;
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    // celý mimo obrazovku = schovaný záměrně (zavřené boční menu za pravým okrajem); vada je jen přečuhování přes okraj
    if ((r.left < W - 1 && r.right > W + 1) || (r.right > 1 && r.left < -1)) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')) + ' [' + Math.round(r.left) + '–' + Math.round(r.right) + ' px] „' + own.slice(0, 40) + '“');
  });
  return { W, docW, mimo: out.slice(0, 6), pocet: out.length };
})()`;

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const URL = 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html';
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, 'prohlížeč (Chrome/Edge) nenalezen'); srv.close(); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tel-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {}; const exc = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
    poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'appka na telefonu', limitS: 240 });
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); const x = r.result || {}; return x.exceptionDetails ? null : (x.result || {}).value; };
    await cmd('Page.enable'); await cmd('Runtime.enable');
    await cmd('Emulation.setDeviceMetricsOverride', { width: SIRKA, height: VYSKA, deviceScaleFactor: 2, mobile: true });
    await cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    const nacti = async () => { await cmd('Page.navigate', { url: URL }); for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof showAppTab === 'function' && document.readyState === 'complete'`)) break; } await sleep(900);
      await ev(`(function(){ document.querySelectorAll('.modal-overlay.open').forEach(function (m) { m.classList.remove('open'); }); setLang('en'); return 1; })()`); };
    const RS = "currentUser = { id: 'tel-rs', email: 'rs@example.invalid' }; userTier = 'rune_seeker'; userCredits = 3; userFreeBalance = 0; profileLoaded = true; updateAuthUI(); updateBanners();";
    const PROXY = "callProxy = async function () { return { text: 'The cattle stand in the byre, breath rising in the cold. Fehu is the rune of what you keep and tend. What would you count first?', reading_id: 'tel' }; }; syncFreeBalance = async function () {}; loadJournal = async function () {}; _loadServerLastImage = async function () {}; fetchUserProfile = async function () {}; if (typeof stream === 'function') stream = async function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };";
    const STAVY = [
      ['návštěvník: Spá', null, "showAppTab('reading'); resetReader();"],
      ['návštěvník: tah runy', null, "startReading(); readerRune = RUNES[0]; readRune();"],
      ['návštěvník: Lestrar', null, "showAppTab('journal');"],
      ['návštěvník: Lífsrúnin', null, "showAppTab('tree');"],
      ['návštěvník: Safn rúna', null, "showAppTab('collection');"],
      ['návštěvník: okno cesty', null, "showAppTab('reading'); openJourney();"],
      ['přihlášený: Spá s pruhem zůstatku', 'nove', RS + " showAppTab('reading'); resetReader();"],
      ['přihlášený: hotové čtení', null, PROXY + " startReading(); readerRune = RUNES[0]; await readRune();"],
    ];
    await nacti();
    const vady = [];
    for (const [jm, novaStranka, akce] of STAVY) {
      if (novaStranka) await nacti();
      const r0 = await ev(`(async function(){ try { ${akce} return 'ok'; } catch (e) { return 'ERR ' + e.message; } })()`);
      await sleep(700);
      const m = await ev(MERENI);
      if (r0 !== 'ok' || !m) { vady.push(jm + ': stav se nepodařilo navodit (' + r0 + ')'); continue; }
      if (m.docW > m.W + 1) vady.push(jm + ': stránka je širší než telefon (' + m.docW + ' > ' + m.W + ' px) — posouvá se do strany');
      if (m.pocet) vady.push(jm + ': ' + m.pocet + ' prvků přes okraj — ' + m.mimo.join(' · '));
    }
    // 2026-10-28 (hlášení 8a6f3ff6): statické stránky — zásady a nápověda (EN i IS), týž telefon a táž měření.
    const STRANKY = ['runar-privacy.html', 'runar-help.html'];
    for (const st of STRANKY) for (const jaz of ['en', 'is']) {
      await ev(`localStorage.setItem('runar_lang', '${jaz}'); 1`);   // stránka je v jazyce appky (přepínač na ní od 2026-10-28 není)
      await cmd('Page.navigate', { url: URL.replace('runar-reader.html', st) });
      for (let k = 0; k < 60; k++) { await sleep(150); if (await ev(`document.readyState === 'complete'`)) break; }
      await sleep(500);
      const m = await ev(MERENI);
      const jm = st + ' (' + jaz + ')';
      if (!m) { vady.push(jm + ': nešlo změřit'); continue; }
      if (m.docW > m.W + 1) vady.push(jm + ': stránka je širší než telefon (' + m.docW + ' > ' + m.W + ' px) — posouvá se do strany');
      if (m.pocet) vady.push(jm + ': ' + m.pocet + ' prvků přes okraj — ' + m.mimo.join(' · '));
      if (process.env.RUNAR_TEL_SNIMEK) { const sn = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); fs.writeFileSync(path.join(process.env.RUNAR_TEL_SNIMEK, st.replace('.html', '') + '_' + jaz + '.png'), Buffer.from(sn.result.data, 'base64')); }
    }
    vady.forEach((v) => console.log('        ' + v));
    rekni(!vady.length, 'telefon ' + SIRKA + ' px: v ' + STAVY.length + ' stavech appky a na zásadách i nápovědě (EN, IS) nic nepřetéká přes okraj a stránka se neposouvá do strany', vady.length + ' vad(a)');
    rekni(!exc.length, 'bez chyb JS', exc.map((x) => (x.exception && x.exception.description || x.text || '').split('\n')[0]).join(' | ').slice(0, 300));
  } catch (e) { rekni(false, 'prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  const dialogy = poj ? poj.hotovo() : [];
  if (dialogy.length) rekni(false, 'stránka otevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', dialogy.join(' · '));
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    console.log(fail ? 'FAIL  appka na telefonu: ' + fail + ' selhalo' : 'OK    appka na telefonu: nic nepřetéká, nic se neposouvá do strany');
    process.exit(fail ? 1 : 0);
  }, 300);
})();
