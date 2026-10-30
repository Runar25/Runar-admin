// verify_verze_hlaseni.js — smoke ㊼: hlášení z appky nese verzi kódu, který v okně BĚŽÍ, a k ní nasazenou, když se liší
// (CODE-tune 2026-10-11, DECISIONS 2026-10-11 (68)).
//
// Proč: hlášení 24c6c548 (8. 10.) neslo v564 a popisovalo chybu opravenou ve v564 — reportér bral verzi z čerstvě staženého sw.js, tedy
// NASAZENOU, kdežto okno jelo na JS ze staré cache service workeru (cache-first). S testery by to mátlo diagnózu (BACKLOG 2026-10-09).
// Od 2026-10-11: běžící = RUNAR_VERZE z v2/runar-verze.js (v precache spolu s ostatním JS; píše ho hooks/pre-commit.py při bumpu sw.js),
// nasazená = sw.js ze sítě (worker ho nechytá). Kontrola tvrdí VÝSLEDEK (§19):
//  (A) zdroj: runar-verze.js nese tutéž verzi jako sw.js, je v precache a reader ho načte před reportérem. Rozbitý hook (sw.js bumpne,
//      runar-verze.js ne) se tu ukáže hned na dalším commitu s JS.
//  (B) skutečný prohlížeč se service workerem — appka pod /Runar-admin/v2/ jako na GitHub Pages, databáze zablokovaná (nic se
//      neodesílá); hlášení odeslané skutečným panelem (zůstane ve frontě prohlížeče): 1. první návštěva bez workeru → „vN“ ·
//      2. pod workerem → „vN“ · 3. nasazená vN+1, okno pořád běží na vN (worker nový ještě nemá) → „vN (now vN+1)“ ·
//      4. worker se aktualizuje → okno ukáže výzvu „nová verze“ a do klepnutí běží dál na vN; po klepnutí → „vN+1“ (od 2026-10-22,
//      DECISIONS 2026-10-22 (8): dřív se okno načetlo samo, i uprostřed psaní).
// Neumí: telefon (iOS a Android aktualizují worker po svém); stav, kdy CDN vrátí část JS novou a část starou.
// Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_verze_hlaseni.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const V2 = ROOT + '/v2/';
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };
function konec() {
  console.log(fail ? '\nFAIL  verze v hlášení: ' + fail + ' selhalo'
    : '\nOK    verze v hlášení: běžící z runar-verze.js (= sw.js), nasazená ze sítě, obě když se liší — skutečný worker, 4 stavy');
  process.exit(fail ? 1 : 0);
}

// ── (A) zdroj ────────────────────────────────────────────────────────────────────
const sw = fs.readFileSync(V2 + 'sw.js', 'utf8');
const html = fs.readFileSync(V2 + 'runar-reader.html', 'utf8');
let vz = ''; try { vz = fs.readFileSync(V2 + 'runar-verze.js', 'utf8'); } catch (e) {}
const N = +((sw.match(/CACHE\s*=\s*'runar-v(\d+)'/) || [])[1] || NaN);
const NV = +((vz.match(/RUNAR_VERZE\s*=\s*'v(\d+)'/) || [])[1] || NaN);
rekni(N > 0 && N === NV, '(A) runar-verze.js nese verzi sw.js (v' + N + ')',
  'sw.js v' + N + ' × runar-verze.js v' + NV + ' — soubor píše hooks/pre-commit.py při bumpu sw.js; ruční změna verze, nebo rozbitý hook?');
rekni(/'\/Runar-admin\/v2\/runar-verze\.js'/.test(sw), '(A) runar-verze.js je v precache sw.js — jde ze stejné cache jako ostatní JS');
const iV = html.indexOf('src="runar-verze.js"'), iR = html.indexOf('src="runar-reporter.js"');
rekni(iV !== -1 && iR !== -1 && iV < iR, '(A) reader načítá runar-verze.js před reportérem');
if (!(N > 0)) konec();

// ── (B) skutečný prohlížeč se service workerem ───────────────────────────────────────
// Režim serveru: 1–2 vše vN · 3 nasazená vN+1 (stránce), ale worker při kontrole aktualizace dostane pořád vN (hlavička
// Service-Worker: script) — okno tak zůstane na starém kódu · 4 vše vN+1.
let rezim = 1, proWorker = 0;
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith('/Runar-admin/')) { res.writeHead(404); res.end(); return; }
  u = u.slice('/Runar-admin'.length);
  const f = path.join(ROOT, u);
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const typ = TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream';
  const worker = req.headers['service-worker'] === 'script';
  if (worker) proWorker++;
  if (u === '/v2/sw.js' || u === '/v2/runar-verze.js') {
    let txt = fs.readFileSync(f, 'utf8');
    if (rezim === 4 || (rezim === 3 && !worker))
      txt = u === '/v2/sw.js' ? txt.replace(/(CACHE\s*=\s*'runar-v)\d+/, '$1' + (N + 1)).replace(/(Service Worker[^\n]*?v)\d+/, '$1' + (N + 1))
                              : txt.replace(/(RUNAR_VERZE\s*=\s*'v)\d+/, '$1' + (N + 1));
    res.writeHead(200, { 'Content-Type': typ, 'Cache-Control': 'no-store' }); res.end(txt); return;
  }
  res.writeHead(200, { 'Content-Type': typ, 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, '(B) prohlížeč (Chrome/Edge) nenalezen'); srv.close(); return konec(); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'verze-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;   // pojistky prohlížeče (scripts/utils/prohlizec_pojistky.js, 2026-10-11)
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {};
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
    poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'verze v hlášení (㊼)', limitS: 180 });
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
      return r.result && r.result.result && !r.result.exceptionDetails ? r.result.result.value : null; };
    const cekej = async (podminka, ms) => { for (let k = 0; k < (ms || 20000) / 150; k++) { try { if (await ev(podminka)) return true; } catch (e) {} await sleep(150); } return false; };
    await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable');
    await cmd('Network.setBlockedURLs', { urls: ['*supabase.co*'] });   // databáze: nic se neodesílá ani nečte
    const URL_APP = 'http://127.0.0.1:' + srv.address().port + '/Runar-admin/v2/runar-reader.html';
    const pripraven = `document.readyState === 'complete' && !!document.getElementById('br-btn') && typeof window._reportVersion === 'function'`;
    // Hlášení skutečným panelem: tlačítko → typ → zpráva → odeslat; zápis do DB je podvržený, hlášení zůstane ve frontě prohlížeče.
    const odesli = () => ev(`(() => {
      currentUser = { id: 'u1', email: 'tester@example.com' };
      try { sb.from = function () { return { insert: function () { return Promise.resolve({ error: { code: 'kontrola' } }); } }; }; } catch (e) {}
      localStorage.setItem('bug_tester', 'Kontrola'); localStorage.removeItem('bug_queue');
      document.getElementById('br-btn').click();
      const typ = document.querySelector('.br-type[data-type="other"]');
      if (!typ) return { chyba: 'typ other v panelu chybí' };
      typ.click(); document.getElementById('br-msg').value = 'kontrola 47'; document.getElementById('br-send').click();
      const q = JSON.parse(localStorage.getItem('bug_queue') || '[]'); localStorage.removeItem('bug_queue');
      return { app_version: q.length ? q[q.length - 1].app_version : null, bezi: typeof RUNAR_VERZE === 'string' ? RUNAR_VERZE : null,
               worker: !!(navigator.serviceWorker && navigator.serviceWorker.controller) };
    })()`);
    const vN = 'v' + N, vN1 = 'v' + (N + 1);

    // 1. první návštěva bez workeru (registrace zastavená jen pro tenhle krok)
    const stop = await cmd('Page.addScriptToEvaluateOnNewDocument', { source:
      "try { Object.defineProperty(navigator.serviceWorker, 'register', { value: function () { return new Promise(function () {}); } }); } catch (e) {}" });
    await cmd('Page.navigate', { url: URL_APP });
    await cekej(pripraven);
    await cekej(`window._reportVersion() !== 'unknown'`, 5000);
    const r1 = await odesli();
    rekni(r1 && !r1.worker && r1.app_version === vN, '(B) 1. první návštěva bez workeru: „' + vN + '“', JSON.stringify(r1));
    await cmd('Page.removeScriptToEvaluateOnNewDocument', { identifier: stop.result && stop.result.identifier });

    // 2. worker se zaregistruje a převezme okno (první převzetí: bez výzvy a bez nového načtení, runar-auth.js)
    await cmd('Page.navigate', { url: URL_APP });
    const ma = await cekej(`!!(navigator.serviceWorker && navigator.serviceWorker.controller) && ${pripraven}`, 30000);
    await sleep(1500); await cekej(pripraven);
    // druhá návštěva: stránka načtená POD workerem (jako další otevření appky). Do 2026-10-22 ji obstaral samo-reload po převzetí okna;
    // bez ní by se sw.js přes worker nikdy nestáhl a vada „sw.js z cache“ (útok v protipriklady.py) by prošla.
    await cmd('Page.navigate', { url: URL_APP });
    await cekej(pripraven);
    await cekej(`window._reportVersion() !== 'unknown'`, 5000);
    const r2 = await odesli();
    rekni(ma && r2 && r2.worker && r2.app_version === vN, '(B) 2. pod workerem: „' + vN + '“', JSON.stringify(r2));
    // Útok „worker zase chytá sw.js“ propustil 2026-10-29, 30. ráno a 30. večer (BACKLOG ㊼): cache-first worker zapisuje stažený soubor
    // do cache až PO odpovědi (caches.open().put v pozadí). Přešla-li kontrola do kroku 3 dřív, než zápis doběhl, šel sw.js v kroku 3
    // na síť a vadu nebylo vidět. Teď se čeká, až je sw.js v cache (jen při vadě), nejvýš 3 s — správný worker ho tam nikdy nedá.
    await cekej(`caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.open(k).then(function (c) { return c.keys(); }); })); })
      .then(function (vs) { return [].concat.apply([], vs).some(function (r) { return r.url.indexOf('/sw.js') !== -1; }); })`, 3000);

    // 3. nasazená vN+1, worker ji ještě nemá → okno běží na vN
    rezim = 3;
    await cmd('Page.navigate', { url: URL_APP });
    await cekej(pripraven);
    const nas = await cekej(`window._reportVersion().indexOf('(now ${vN1})') !== -1`, 8000);
    const r3 = await odesli();
    rekni(nas && r3 && r3.worker && r3.bezi === vN && r3.app_version === vN + ' (now ' + vN1 + ')',
      '(B) 3. nasazená ' + vN1 + ', okno běží na ' + vN + ': „' + vN + ' (now ' + vN1 + ')“', JSON.stringify(r3) + ' · dotazů workeru na skript: ' + proWorker);

    // 4. worker se aktualizuje → výzva, okno do klepnutí běží na vN; klepnutí → nové načtení na vN+1
    rezim = 4;
    await ev(`navigator.serviceWorker.getRegistration().then(function (r) { return r && r.update(); }).then(function () { return true; }, function () { return false; })`);
    const vyzva = await cekej(`!!document.getElementById('sw-update')`, 30000);
    const drzi = await ev(`typeof RUNAR_VERZE === 'string' && RUNAR_VERZE === '${vN}'`);
    rekni(vyzva && drzi === true, '(B) 4a. nová verze: výzva k obnovení, okno se samo neobnovilo (běží „' + vN + '“)', 'výzva ' + vyzva + ' · běží vN ' + drzi);
    await ev(`document.getElementById('sw-update').click(), true`);
    const nove = await cekej(`typeof RUNAR_VERZE === 'string' && RUNAR_VERZE === '${vN1}' && ${pripraven}`, 30000);
    await cekej(`window._reportVersion() === '${vN1}'`, 8000);
    const r4 = await odesli();
    rekni(nove && r4 && r4.worker && r4.app_version === vN1, '(B) 4b. po klepnutí na výzvu okno znovu načtené: „' + vN1 + '“', JSON.stringify(r4));
  } catch (e) { rekni(false, '(B) prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  const dialogy = poj ? poj.hotovo() : [];
  if (dialogy.length) rekni(false, 'stránka otevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', dialogy.join(' · '));
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} konec(); }, 300);
})();
