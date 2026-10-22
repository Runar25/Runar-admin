// Nástroj (od 2026-10-22, owner „7. ano, předej plán tune“): audit „kdo co vidí“ — záložky. Pouštět PŘED a PO změně toho, kdo co
// vidí (tabulka přístupu, CODE-tune): výstup se musí lišit jen tam, kde se to chtělo. Výsledek JSON jde do dočasné složky.
//   node scripts/utils/kdo_co_vidi.js
// Audit „kdo co vidí“ (owner 2026-10-21): appka v prohlížeči bez okna jako návštěvník / Rune Seeker / Walker / Wanderer / admin; na každé záložce
// sesbírá viditelné prvky s textem. Podvržený účet jen v prohlížeči testu (nic se nenačítá ani neukládá). CODE-read.
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = (process.env.RUNAR_ROOT || path.resolve(__dirname, '..', '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); });
const UCTY = {
  visitor: 'currentUser = null; userTier = null;',
  rune_seeker: "currentUser = { id: 'audit-rs', email: 'rs@example.invalid' }; userTier = 'rune_seeker';",
  walker: "currentUser = { id: 'audit-st', email: 'st@example.invalid' }; userTier = 'standard';",
  wanderer: "currentUser = { id: 'audit-pr', email: 'pr@example.invalid' }; userTier = 'premium';",
  admin: "currentUser = { id: 'audit-ad', email: 'kukula@agndofa.is' }; userTier = 'premium';",
};
const ZALOZKY = ['reading', 'journal', 'tree', 'collection'];
const SBER = `(() => { const out = [];
  const vid = (e) => { if (!e.getClientRects().length) return false; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; } return true; };
  document.querySelectorAll('body *').forEach((e) => {
    if (/^(SCRIPT|STYLE|SVG|PATH|G|OPTION)$/i.test(e.tagName) || e.closest('svg') || e.closest('.modal, [role=dialog]') && !e.closest('.open')) return;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\\s+/g, ' ').trim();
    if (own.length < 2 || !vid(e)) return;
    out.push((e.id ? '#' + e.id + ' ' : (e.closest('[id]') ? '[' + e.closest('[id]').id + '] ' : '')) + own.slice(0, 70));
  });
  return [...new Set(out)]; })()`;
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const BASE = 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html';
  const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kdo-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--window-size=420,1800', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok) => { ws.onopen = ok; });
  let id = 0; const wait = {}; ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
  const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); return r.result && r.result.result ? (r.result.result.value !== undefined ? r.result.result.value : r.result.exceptionDetails && 'ERR ' + (r.result.exceptionDetails.exception || {}).description) : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable'); await cmd('Network.setBlockedURLs', { urls: ['*supabase.co*'] });   // 2026-10-22: žádný provoz na produkční Supabase (egress)
  const vysl = {};
  for (const [u, nast] of Object.entries(UCTY)) {
    await cmd('Page.navigate', { url: BASE }); for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof showAppTab === 'function' && document.readyState === 'complete'`)) break; } await sleep(1200);
    vysl[u] = {};
    for (const z of ZALOZKY) {
      const e = await ev(`(function(){ try { ${nast} if (typeof updateAuthUI === 'function') updateAuthUI(); if (typeof updateUIText === 'function') updateUIText(); showAppTab('${z}'); if ('${z}' === 'reading' && typeof resetReader === 'function') resetReader(); return 'ok'; } catch (e) { return 'ERR ' + e.message; } })()`);
      await sleep(700);
      vysl[u][z] = { stav: e, prvky: await ev(SBER) };
    }
  }
  fs.writeFileSync(path.join(require('os').tmpdir(), 'kdo_co_vidi.json'), JSON.stringify(vysl, null, 1));
  const por = ['visitor', 'rune_seeker', 'walker', 'wanderer', 'admin'];
  for (const z of ZALOZKY) {
    console.log('\n=== ' + z + ' === ' + por.map((u) => u + ':' + (vysl[u][z].prvky || []).length + (vysl[u][z].stav !== 'ok' ? '(' + vysl[u][z].stav + ')' : '')).join(' '));
    for (let i = 1; i < por.length; i++) {
      const nizsi = new Set(vysl[por[i - 1]][z].prvky || []), vyssi = new Set(vysl[por[i]][z].prvky || []);
      const jenNizsi = [...nizsi].filter((x) => !vyssi.has(x));
      if (jenNizsi.length) console.log('  ' + por[i - 1] + ' vidí, ' + por[i] + ' NE:\n    ' + jenNizsi.join('\n    '));
    }
  }
  proc.kill(); srv.close(); process.exit(0);
})();
