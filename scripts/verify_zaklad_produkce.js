// Smoke ㉼ — ZÁKLAD PRODUKCE se nesmí ztratit. KUKY 2026-10-10: „nikdy do produkce nebudeš sahat tak, že z ní odstraníš to, co je
// její základ!!! nikdy! tohle si budeš kurva kontrolovat!“ Důvod: commit 2a3f03b (návštěvník rovnou k tahu) návštěvníkovi skryl Norny
// a po návratu do záložky Spá i Rúnarovu fotku — v kódu to vidět nebylo, jen za běhu. Owner to našel sám v produkci.
//
// Proto kontrola běží v SKUTEČNÉM prohlížeči (Chrome / Edge bez okna, DevTools protokol přes vestavěný WebSocket — žádné balíčky):
// appka z pracovního stromu na 127.0.0.1, čistý profil = návštěvník. Základ (rozšiřovat jen sem, jedno místo):
//   · Rúnarova fotka (#reader-hero s Runar_portrait, ne .hidden) · čtyři záložky (Lífsrúnin, Spá, Lestrar, Safn rúna)
//   · všech pět výkladů (Ein rún, Nornir, Áttaviti, Skeifa, Yggdrasil) · 25 run v mřížce tahu · 25 run v Safn rúna
// Stavy: po načtení · po návratu do Spá z každé záložky · Start over (resetReader) · další tah (drawAnother) · přepnutí jazyka ·
// simulovaný přihlášený (currentUser podvržený jen v prohlížeči testu; nic se nenačítá ani neukládá): Spá s fotkou, po startu tahu
// všech pět výkladů. Samotest na konci: kontrola sama rozbije Norny a fotku a musí to poznat.
// Chyby JS za běhu (od 2026-10-10): každá nezachycená výjimka během celého běhu — i při načítání stránky, v setTimeout a v promise
// (Runtime.exceptionThrown) — je vada. Důvod: při úklidu mrtvého kódu (g) prošla ㉼ OK i na stromě, kde start appky padal na
// ReferenceError (vrácené volání smazaného _initPrivacyBanner v DOMContentLoaded) — fotka, záložky i runy stály, jen zbytek startu
// se nespustil. Samotest: volání neexistující funkce v setTimeout musí kontrola zachytit.
// Neumí: skutečné přihlášení, mobilní rozložení, hlas, čtení přes proxy (návštěvník proxy nevolá a test tah neodesílá).
// Spuštění: node scripts/verify_zaklad_produkce.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = process.env.RUNAR_ZAKLAD_ROOT ? path.resolve(process.env.RUNAR_ZAKLAD_ROOT) : path.resolve(__dirname, '..');   // jiný strom = test kontroly na staré verzi
const PROHLIZECE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'];
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const cekej = (ms) => new Promise((r) => setTimeout(r, ms));

function server() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
}

async function prohlizec() {
  const exe = PROHLIZECE.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('není Chrome ani Edge (' + PROHLIZECE.join(' | ') + ')');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'runar-zaklad-'));
  const proc = cp.spawn(exe, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--window-size=1280,900', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  const soubor = path.join(dir, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(soubor); i++) await cekej(100);
  if (!fs.existsSync(soubor)) { proc.kill(); throw new Error('prohlížeč nenaběhl (' + exe + ')'); }
  const [port, cesta] = fs.readFileSync(soubor, 'utf8').trim().split('\n');
  const ws = new WebSocket('ws://127.0.0.1:' + port + cesta.trim());
  await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = () => err(new Error('DevTools WebSocket se nepřipojil')); });
  let id = 0; const cekaji = new Map(); const vyjimky = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && cekaji.has(m.id)) { cekaji.get(m.id)(m); cekaji.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') vyjimky.push(m.params.exceptionDetails);   // nezachycená chyba JS (i v setTimeout a v promise)
  };
  const posli = (method, params, sessionId) => new Promise((resolve, reject) => {
    const i = ++id; cekaji.set(i, (m) => (m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId }));
  });
  const zavri = () => { try { ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} };
  return { posli, zavri, vyjimky };
}
const popisVyjimky = (d) => {
  const t = (d.exception && d.exception.description) || d.text || '?';
  return t.split('\n')[0] + (d.url ? ' (' + d.url.replace(/^.*\/v2\//, '') + ':' + (d.lineNumber + 1) + ')' : '');
};

// Měření základu — běží V PROHLÍŽEČI. Vrací seznam chyb (prázdný = v pořádku). Jediné místo, kde je základ vyjmenovaný.
const ZAKLAD = String.raw`(function (stav) {
  var ch = [];
  var vid = function (el) { if (!el) return false; var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var hero = document.getElementById('reader-hero');
  var foto = hero && hero.querySelector('img[src*="Runar_portrait"]');
  if (!hero || !foto) ch.push(stav + ': Rúnarova fotka v HTML chybí');
  else if (hero.classList.contains('hidden')) ch.push(stav + ': Rúnarova fotka skrytá (.hidden)');
  ['atab-liferune', 'atab-reading', 'atab-journal', 'atab-collection'].forEach(function (id) { if (!vid(document.getElementById(id))) ch.push(stav + ': záložka ' + id + ' není vidět'); });
  var karta = document.getElementById('reader-rune-card');
  if (karta && getComputedStyle(karta).display !== 'none') {
    ['single', 'norns', 'kriz', 'horseshoe', 'yggdrasil'].forEach(function (m) { if (!vid(document.getElementById('mode-btn-' + m))) ch.push(stav + ': výklad mode-btn-' + m + ' není vidět'); });
    var n = document.querySelectorAll('#reader-grid .rb').length; if (n !== 25) ch.push(stav + ': mřížka tahu má ' + n + ' run, ne 25');
  }
  return ch;
})`;

async function main() {
  const srv = await server();
  const url = 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html';
  const b = await prohlizec();
  const chyby = [];
  try {
    const { targetId } = await b.posli('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await b.posli('Target.attachToTarget', { targetId, flatten: true });
    const ev = async (expr) => {
      const r = await b.posli('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, sessionId);
      if (r.exceptionDetails) throw new Error('chyba v appce: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
      return r.result.value;
    };
    await b.posli('Runtime.enable', {}, sessionId);   // od teď chodí Runtime.exceptionThrown — i z načítání stránky
    await b.posli('Page.navigate', { url }, sessionId);
    let pripraveno = false;
    for (let i = 0; i < 120 && !pripraveno; i++) {
      await cekej(250);
      try { pripraveno = await ev("document.readyState === 'complete' && typeof showAppTab === 'function' && document.querySelectorAll('#reader-grid .rb').length > 0"); } catch (e) {}
    }
    if (!pripraveno) throw new Error('appka v prohlížeči nenaběhla do 30 s (síť? chyba skriptu?) — ' + url);
    await cekej(800);
    const krok = async (popis, js) => {
      if (js) await ev('(async function(){ ' + js + ' })()');
      await cekej(700);   // přechody (hero max-height) a asynchronní překreslení
      (await ev(ZAKLAD + '(' + JSON.stringify(popis) + ')')).forEach((c) => chyby.push(c));
    };
    await krok('po načtení', '');
    for (const tab of ['liferune', 'journal', 'collection']) {
      await krok('Spá po návratu z ' + tab, "showAppTab('" + tab + "'); await new Promise(function(r){setTimeout(r,500)}); showAppTab('reading');");
    }
    await krok('Start over', 'resetReader();');
    await krok('další tah', 'drawAnother();');
    await krok('po přepnutí jazyka', "setLang(lang === 'is' ? 'en' : 'is');");
    // Safn rúna: všech 25 run (zamčené návštěvníkovi taky — jsou vidět, jen se nedají otevřít)
    const kol = await ev("(async function(){ showAppTab('collection'); for (var i=0;i<40;i++){ if (document.querySelectorAll('.coll-cell').length) break; await new Promise(function(r){setTimeout(r,250)}); } var n=document.querySelectorAll('.coll-cell').length; showAppTab('reading'); return n; })()");
    if (kol !== 25) chyby.push('Safn rúna má ' + kol + ' run, ne 25');
    // Simulovaný přihlášený: Spá s fotkou a po startu tahu všech pět výkladů (nic se nenačítá ani neukládá)
    await krok('přihlášený: Spá', "currentUser = { id: 'smoke-zaklad', email: 'smoke@example.invalid' }; userTier = 'rune_seeker'; showAppTab('reading'); resetReader();");
    await ev("startReading(); 0");
    await cekej(500);
    (await ev(ZAKLAD + '("přihlášený: tah")')).filter((c) => !/Rúnarova fotka skrytá/.test(c)).forEach((c) => chyby.push(c));   // tah přihlášeného fotku schovává záměrně (startReading)
    // Samotest: kontrola musí poznat skryté Norny i skrytou fotku (jinak by mlčela, i kdyby byly pryč)
    const sabot = await ev("(function(){ resetReader(); currentUser = null; _syncVisitorDraw(); document.getElementById('mode-btn-norns').style.display = 'none'; document.getElementById('reader-hero').classList.add('hidden'); return 1; })()");
    await cekej(300);
    const st = await ev(ZAKLAD + '("samotest")');
    if (!sabot || !st.some((c) => /mode-btn-norns/.test(c)) || !st.some((c) => /fotka skrytá/.test(c))) chyby.push('SAMOTEST: kontrola nepoznala skryté Norny nebo fotku — ' + JSON.stringify(st));
    // Samotest chyb za běhu: volání funkce, která neexistuje, mimo ev() (v setTimeout) — musí ho zachytit Runtime.exceptionThrown
    await ev("setTimeout(function () { __zakladSamotestNeexistuje(); }, 0); 1");
    await cekej(400);
    const sam = b.vyjimky.filter((d) => /__zakladSamotestNeexistuje/.test(popisVyjimky(d)));
    if (!sam.length) chyby.push('SAMOTEST: kontrola nepoznala chybu JS za běhu (volání neexistující funkce v setTimeout)');
    b.vyjimky.filter((d) => !sam.includes(d)).forEach((d) => chyby.push('chyba JS za běhu: ' + popisVyjimky(d)));
  } finally {
    b.zavri(); srv.close();
  }
  if (chyby.length) {
    chyby.forEach((c) => console.log('  ' + c));
    console.log('FAIL  základ produkce: ' + chyby.length + ' vad — fotka, záložky, výklady a runy nesmí z appky zmizet a appka nesmí padat (KUKY 2026-10-10)');
    process.exit(1);
  }
  console.log('OK    základ produkce v prohlížeči: fotka, 4 záložky, 5 výkladů, 25 run (tah i Safn rúna), žádná chyba JS za běhu — 9 stavů návštěvníka i přihlášeného, samotest chytá skryté Norny, fotku i chybu JS');
}
main().catch((e) => { console.log('FAIL  základ produkce: ' + e.message); process.exit(1); });
