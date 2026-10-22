// verify_onclick_funkce.js — každá funkce, kterou volá inline handler appky (onclick="…", onchange, oninput …), v běžící appce opravdu existuje.
//
// Proč (CODE-read 2026-10-22, ověření (11) bod 1 — chyby appky u uživatelů): reader má přes sto inline handlerů v HTML a další v šablonách
// v JS. Přejmenovaná nebo smazaná funkce = mrtvé tlačítko a ReferenceError, který lapač chyb (runar-client-errors.js) neviděl, protože
// chyba z HTML handleru nemá jako zdroj náš .js. Kontrola, která to hlídala, neexistovala; najde to až člověk, který na tlačítko ťukne.
// Jak: posbírá handlery z v2/runar-reader.html a ze skriptů, které reader načítá (z <script src> + engine stromu načítaný až pro strom),
// vytáhne jména volaná jako funkce (ne po tečce: event.stopPropagation se nepočítá; ${…} ze šablon pryč) a v Chrome bez okna
// po načtení appky ověří `typeof jméno === 'function'` (i pro let/const, ne jen window.*). Engine stromu napřed dotáhne _nactiTreeEngine().
// Neumí: handler přidaný přes addEventListener (ten je v JS a padá jinak), jméno složené za běhu, funkci vzniklou až po akci uživatele.
//   node scripts/verify_onclick_funkce.js            node scripts/verify_onclick_funkce.js --test   (vytahování jmen na vzorcích)
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const V2 = path.join(ROOT, 'v2');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const KLICOVA = new Set(['if', 'for', 'while', 'switch', 'return', 'typeof', 'function', 'new', 'catch', 'void', 'delete', 'await', 'in', 'of', 'do', 'else']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

// text handleru → volaná jména (bez metod po tečce, bez klíčových slov, bez obsahu ${…} a řetězců)
function jmena(kod) {
  const k = String(kod).replace(/\$\{[^}]*\}/g, '0').replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "''");
  const out = new Set();
  const re = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g;
  let m; while ((m = re.exec(k))) if (!KLICOVA.has(m[2])) out.add(m[2]);
  return [...out];
}
// soubor → [{jmeno, kde}]; v HTML atribut on…="…", v JS i on…=\"…\" a on…='…' (šablony)
function handlery(text, soubor) {
  const out = [];
  const re = /\bon[a-z]+\s*=\s*(\\?["'])([\s\S]*?)\1/g;
  let m; while ((m = re.exec(text))) {
    const radek = text.slice(0, m.index).split('\n').length;
    for (const j of jmena(m[2])) out.push({ jmeno: j, kde: soubor + ':' + radek });
  }
  return out;
}

if (process.argv.includes('--test')) {
  const P = [
    ['onclick="showAppTab(\'reading\')"', ['showAppTab']],
    ['onclick="event.stopPropagation(); closeModal()"', ['closeModal']],
    ['onclick=\\"openRune(${i}); this.blur()\\"', ['openRune']],
    ["onclick='if (x) doIt(); else other()'", ['doIt', 'other']],
    ['onchange="setLang(this.value)"', ['setLang']],
    ['onclick="window.location.href=\'a(b)\'"', []],
  ];
  let zle = 0;
  for (const [vzor, ocek] of P) {
    const dost = handlery(vzor, 't').map((x) => x.jmeno).sort();
    const ok = JSON.stringify(dost) === JSON.stringify(ocek.slice().sort());
    if (!ok) zle++;
    console.log((ok ? 'OK    ' : 'FAIL  ') + vzor + ' → ' + JSON.stringify(dost));
  }
  console.log(zle ? 'FAIL  vytahování jmen: ' + zle + ' vzorků špatně' : 'OK    vytahování jmen: ' + P.length + ' vzorků');
  process.exit(zle ? 1 : 0);
}

const html = fs.readFileSync(path.join(V2, 'runar-reader.html'), 'utf8');
const skripty = [...html.matchAll(/<script[^>]+src="([^"?#]+)/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s));
['tree-lab-trunk-composer/runar-trunk.js', 'tree-lab-branch-composer/runar-branch.js', 'runar-tree-prod.js'].forEach((s) => { if (!skripty.includes(s)) skripty.push(s); });
const vsechny = handlery(html, 'runar-reader.html');
// komentáře v JS pryč (popis „onclick=\"fn('…')\"“ v komentáři není handler — runar-utils.js jsAttr); řádky zůstanou, ať sedí čísla
const bezKomentaru = (t) => t.replace(/\/\*[\s\S]*?\*\//g, (b) => b.replace(/[^\n]/g, '')).replace(/^\s*\/\/.*$/gm, '');
for (const s of skripty) { const f = path.join(V2, s); if (fs.existsSync(f)) vsechny.push(...handlery(bezKomentaru(fs.readFileSync(f, 'utf8')), s)); }
const unik = [...new Set(vsechny.map((x) => x.jmeno))];

const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const URL = 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html';
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, 'prohlížeč (Chrome/Edge) nenalezen'); srv.close(); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'onc-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {};
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
    poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'funkce z inline handlerů', limitS: 120 });
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); const x = r.result || {}; return x.exceptionDetails ? null : (x.result || {}).value; };
    await cmd('Page.enable'); await cmd('Runtime.enable');
    poj.krok('načtení appky');
    await cmd('Page.navigate', { url: URL });
    for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof showAppTab === 'function' && document.readyState === 'complete'`)) break; }
    await sleep(800);
    poj.krok('engine stromu');
    const strom = await ev(`(async function(){ try { if (typeof _nactiTreeEngine === 'function') await _nactiTreeEngine(); return 'ok'; } catch (e) { return 'ERR ' + e.message; } })()`);
    if (strom !== 'ok') rekni(false, 'engine stromu se nedotáhl', String(strom));
    poj.krok('typeof jmen');
    const chybi = await ev(`(function(){ var j = ${JSON.stringify(unik)}, out = []; j.forEach(function (n) { var t; try { t = (0, eval)('typeof ' + n); } catch (e) { t = 'chyba'; } if (t !== 'function') out.push(n + ' (' + t + ')'); }); return out; })()`);
    if (!Array.isArray(chybi)) rekni(false, 'ověření jmen v prohlížeči selhalo');
    else {
      const det = chybi.map((c) => { const n = c.split(' ')[0]; const kde = vsechny.filter((x) => x.jmeno === n).map((x) => x.kde); return c + ' ← ' + kde.slice(0, 3).join(', ') + (kde.length > 3 ? ' …' : ''); });
      det.forEach((d) => console.log('        ' + d));
      rekni(!chybi.length, 'inline handlery: ' + vsechny.length + ' volání, ' + unik.length + ' různých funkcí (HTML + ' + skripty.length + ' skriptů) — všechny v appce existují', chybi.length + ' chybí');
    }
  } catch (e) { rekni(false, 'prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  const dialogy = poj ? poj.hotovo() : [];
  if (dialogy.length) rekni(false, 'stránka otevřela dialog', dialogy.join(' · '));
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    console.log(fail ? 'FAIL  funkce z inline handlerů: ' + fail + ' selhalo' : 'OK    funkce z inline handlerů: každé tlačítko volá existující funkci');
    process.exit(fail ? 1 : 0);
  }, 300);
})();
