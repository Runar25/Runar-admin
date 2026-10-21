// verify_prompt_stin.js — stín skládání promptu: co appka v prohlížeči zapíše (`stin`), z toho server složí TENTÝŽ prompt.
//
// Proč (2026-10-21, krok 1 plánu infrastruktury „prompt na server“, F2; owner „ok začni“): claude-proxy porovnává prompt z appky
// s promptem složeným ze záznamu (`_shared/prompt_stin.mjs`). Kdyby záznamník v appce něco vynechal (stav, náhodu, sáček obrazů,
// místní měsíc), stín by hlásil neshodu u každého čtení — a F3 (server na vlastní prompt) by pak čtení tiše změnilo. Tady se to ověří
// skutečnou appkou v prohlížeči bez okna, ne kopií: obalené buildery, sáček obrazů v localStorage, EN i IS, single, výklady, Ask,
// životní runa, rozbor jména, Opus i sol. Každý vzorek musí dát shodu systému i promptu a spotřebovat přesně tolik náhody, kolik appka.
//   node scripts/verify_prompt_stin.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const { pathToFileURL } = require('url');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

// Vzorky skládá STRÁNKA (stejné volání jako appka). Každý vrátí { jm, sys, prompt, stin }.
const VZORKY = `(async () => {
  for (let i = 0; i < 60 && (typeof _stinVezmi !== 'function' || typeof RUNES === 'undefined'); i++) await new Promise((r) => setTimeout(r, 100));
  if (typeof _stinVezmi !== 'function') return 'EXC: _stinVezmi chybí (záznamník v runar-app.js?)';
  const R = (n) => RUNES.find((r) => r.n === n);
  const out = [];
  // sáček obrazů s rozjetým stavem (jako u člověka po pár čteních) — musí přejít na server
  try { localStorage.setItem('seasonlast_Raidho', '0'); } catch (e) {}
  const u = { name: 'Anna', area: AREAS ? (AREAS.en && AREAS.en[1]) || 'work' : 'work', seeking: 'clarity', question: 'What should I focus on?',
              d: 15, m: 6, y: 1990, intention: INTENTIONS.en[0], lifeRune: R('Isa') };
  const pool = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz'].map(R);
  const vzorek = (jm, fn) => { _stinVezmi(); let sys = '', prompt = ''; try { sys = buildSysPrompt(null, lang); prompt = fn(); }
    catch (e) { out.push({ jm, chyba: e.message }); return; } out.push({ jm, sys, prompt, stin: _stinVezmi() }); };
  for (const L of ['en', 'is']) {
    lang = L;
    for (let k = 0; k < 3; k++) vzorek('single_' + L + k, () => buildReadingPrompt(u, R(['Raidho', 'Fehu', 'Isa'][k]), L, corrections));
    vzorek('single_noq_' + L, () => buildReadingPrompt(Object.assign({}, u, { question: '', intention: '', lifeRune: null }), R('Kenaz'), L, []));
    const e0 = READ_ENGINE; READ_ENGINE = 'opus';
    vzorek('single_opus_' + L, () => buildReadingPrompt(u, R('Gebo'), L, []));
    READ_ENGINE = e0;
    vzorek('norns_' + L, () => buildNornsPrompt(u, pool.slice(0, 3), L, []));
    vzorek('kriz_' + L, () => buildKrizPrompt(u, pool.slice(0, 5), L, []));
    vzorek('horseshoe_' + L, () => buildHorseshoePrompt(u, pool.slice(0, 7), L, []));
    vzorek('yggdrasil_' + L, () => buildYggdrasilPrompt(u, pool, L, []));
    vzorek('ask_' + L, () => buildAskPrompt('SAMPLE READING', 'what does it mean for me', 'Raidho', L, [], u.lifeRune, null, null));
    vzorek('liferune_' + L, () => buildLifeRunePrompt('Anna', R('Fehu'), 15, 6, 1990, L, []));
  }
  lang = 'en';
  return JSON.stringify(out);
})()`;

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { console.log('FAIL  prohlížeč (Chrome/Edge) nenalezen'); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stin-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;
  const konec = (kod) => { if (poj) poj.hotovo(); try { proc.kill(); } catch (e) {} srv.close(); setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} process.exit(kod); }, 300); };
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
  let id = 0; const wait = {};
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
  poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'stín skládání promptu', limitS: 120 });
  const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return 'EXC: ' + ((r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description) || r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Page.navigate', { url: 'http://127.0.0.1:' + port + '/v2/runar-reader.html' });
  await sleep(2500);
  const raw = await ev(VZORKY);
  if (typeof raw !== 'string' || raw.startsWith('EXC')) { console.log('FAIL  appka vzorky nesložila: ' + String(raw).slice(0, 300)); konec(1); return; }
  const vz = JSON.parse(raw);
  const { porovnejStin } = await import(pathToFileURL(path.join(ROOT, 'supabase', 'functions', '_shared', 'prompt_stin.mjs')).href);
  const vady = [];
  for (const v of vz) {
    if (v.chyba) { vady.push(v.jm + ': appka spadla — ' + v.chyba); continue; }
    if (!v.stin || !v.stin.prompt || !v.stin.sys) { vady.push(v.jm + ': záznamník nezapsal ' + (!v.stin ? 'nic' : (!v.stin.prompt ? 'prompt' : 'systém'))); continue; }
    const d = porovnejStin(v.stin, v.sys, v.prompt);
    if (d.chyba) { vady.push(v.jm + ': server — ' + d.chyba); continue; }
    for (const druh of ['sys', 'prompt']) {
      const x = d[druh];
      if (!x || !x.shoda) vady.push(v.jm + ' ' + druh + ': neshoda od znaku ' + (x && x.rozdil) + ' (appka ' + (x && x.delka_klient) + ' zn., server ' + (x && x.delka_server) + ')');
      else if (x.los_zbyl !== 0 || x.los_dosel) vady.push(v.jm + ' ' + druh + ': náhoda nesedí (zbylo ' + x.los_zbyl + ', došla ' + x.los_dosel + ')');
    }
  }
  if (vady.length) { vady.slice(0, 12).forEach((v) => console.log('  ' + v)); console.log('FAIL  stín skládání promptu: ' + vady.length + ' vad v ' + vz.length + ' vzorcích z appky'); konec(1); return; }
  console.log('OK    stín skládání promptu: ' + vz.length + ' vzorků z appky (EN+IS, single, výklady, Ask, životní runa, Opus) — server složil systém i prompt bajt po bajtu');
  konec(0);
})().catch((e) => { console.log('FAIL  ' + e.message); process.exit(1); });
