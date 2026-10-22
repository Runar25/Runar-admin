// Nástroj (od 2026-10-22, owner „7. ano, předej plán tune“): audit „kdo co vidí“ — obrazovka po čtení. Pouštět PŘED a PO změně toho, kdo co
// vidí (tabulka přístupu, CODE-tune): výstup se musí lišit jen tam, kde se to chtělo. Výsledek JSON jde do dočasné složky.
//   node scripts/utils/kdo_co_vidi_po_cteni.js
// Audit „kdo co vidí PO ČTENÍ“ (owner 2026-10-22 „2. ano, projdi to“): hotové čtení Fehu v každém účtu — proxy podvržená v prohlížeči testu
// (žádné volání serveru, nic se neukládá). Sbírá viditelné prvky obrazovky čtení + stav Asku a hlasu. CODE-read.
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = (process.env.RUNAR_ROOT || path.resolve(__dirname, '..', '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); });
const UCTY = {
  rune_seeker: "currentUser = { id: 'audit-rs', email: 'rs@example.invalid' }; userTier = 'rune_seeker';",
  walker: "currentUser = { id: 'audit-st', email: 'st@example.invalid' }; userTier = 'standard';",
  wanderer: "currentUser = { id: 'audit-pr', email: 'pr@example.invalid' }; userTier = 'premium';",
  admin: "currentUser = { id: 'audit-ad', email: 'kukula@agndofa.is' }; userTier = 'premium';",
};
const PODVRH = `
  callProxy = async function () { return { text: 'The cattle stand in the byre, breath rising in the cold. Fehu is the rune of what you keep and tend. What would you count first?', reading_id: 'audit-reading', model: 'audit' }; };
  syncFreeBalance = async function () {}; loadJournal = async function () {}; _loadServerLastImage = async function () {}; fetchUserProfile = async function () {};
  if (typeof stream === 'function') stream = async function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };`;
const SBER = `(() => { const out = [];
  const vid = (e) => { if (!e.getClientRects().length) return false; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; } return true; };
  const root = document.getElementById('tab-reading') || document.body;
  root.querySelectorAll('*').forEach((e) => {
    if (/^(SCRIPT|STYLE|SVG|PATH|G|OPTION)$/i.test(e.tagName) || e.closest('svg')) return;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\\s+/g, ' ').trim();
    const ctrl = /^(BUTTON|INPUT|TEXTAREA)$/.test(e.tagName);
    if ((own.length < 2 && !ctrl) || !vid(e)) return;
    out.push((e.id ? '#' + e.id : '[' + ((e.closest('[id]') || {}).id || '') + ']') + (ctrl && e.disabled ? ' (zamčené)' : '') + ' ' + (own || e.placeholder || '').slice(0, 70));
  });
  return [...new Set(out)]; })()`;
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const BASE = 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html';
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'po-'));
  const proc = cp.spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--window-size=420,2400', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok) => { ws.onopen = ok; });
  let id = 0; const wait = {}; ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
  const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); const x = r.result || {}; return x.exceptionDetails ? 'ERR ' + ((x.exceptionDetails.exception || {}).description || x.exceptionDetails.text) : (x.result || {}).value; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  const vysl = {};
  for (const [u, nast] of Object.entries(UCTY)) {
    await cmd('Page.navigate', { url: BASE }); for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof _generateReading === 'function' && document.readyState === 'complete'`)) break; } await sleep(1200);
    const st = await ev(`(async function(){ ${nast} setLang('en'); ${PODVRH} updateAuthUI(); updateUIText(); showAppTab('reading'); resetReader(); _readingMode = 'mine';
      userCredits = 5; startReading(); readerRune = RUNES.find(function (r) { return r.n === 'Fehu'; }); await readRune(); return 'ok'; })()`);
    await sleep(1500);
    vysl[u] = { stav: st, prvky: await ev(SBER), ask: await ev(`(function(){ var i = document.getElementById('ask-input'), b = document.getElementById('ask-btn'), t = document.getElementById('ask-teaser'), v = document.getElementById('btn-generate-voice');
      return { askLimit: _askLimit(), askVidet: !!(document.getElementById('ask-runar') || {}).offsetParent, inputZamcene: i && i.disabled, teaser: t && t.style.display !== 'none' ? t.textContent : '', hlasVidet: !!(v && v.offsetParent), hlasZamceny: v && v.disabled }; })()`) };
  }
  fs.writeFileSync(path.join(require('os').tmpdir(), 'kdo_co_vidi_po_cteni.json'), JSON.stringify(vysl, null, 1));
  for (const u in vysl) console.log(u.padEnd(12), vysl[u].stav, JSON.stringify(vysl[u].ask));
  const por = Object.keys(UCTY);
  for (let i = 1; i < por.length; i++) {
    const a = new Set(vysl[por[i - 1]].prvky || []), b = new Set(vysl[por[i]].prvky || []);
    const jenNizsi = [...a].filter((x) => !b.has(x) && !x.startsWith('#ui-sub')), jenVyssi = [...b].filter((x) => !a.has(x) && !x.startsWith('#ui-sub'));
    if (jenNizsi.length) console.log('\n' + por[i - 1] + ' vidí, ' + por[i] + ' NE:\n  ' + jenNizsi.join('\n  '));
    if (jenVyssi.length) console.log('\n' + por[i] + ' vidí, ' + por[i - 1] + ' NE:\n  ' + jenVyssi.join('\n  '));
  }
  proc.kill(); srv.close(); process.exit(0);
})();
