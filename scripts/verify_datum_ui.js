// verify_datum_ui.js — smoke ㊻: datum v deníku a ve stromě islandsky i v prohlížeči bez islandských dat (CODE-tune 2026-10-11).
//
// Proč: deník formátoval datum `toLocaleDateString('is-IS', …)`. Chrome na Windows islandská data nemá
// (Intl.DateTimeFormat.supportedLocalesOf(['is-IS']) → []) a vrátí anglické „May 21, 2026“ — islandský uživatel viděl v deníku anglický
// měsíc. Strom měl zálohu (číselné datum 21.5.2026) ve vlastní kopii, deník ne (našel CODE-tree; owner „jeď ty tři chyby“). Od 2026-10-11
// je JEDEN pomocník `datumUI` v runar-utils.js pro deník i strom (§18). Kontrola tvrdí VÝSLEDEK (§19):
//  (A) produkční deník a strom (vm; ICU Node islandská data má): islandsky „21. maí 2026“, anglicky „21 May 2026“; po odebrání islandských
//      dat (supportedLocalesOf → []) číselně „21.5.2026“, nikdy anglický měsíc; žádné / neplatné datum = prázdno, ne „Invalid Date“ ani
//      rok 1970. Strom dává totéž co deník.
//  (B) zdroj: 'is-IS' ani datum či číslo v jazyce uživatele (toLocale…String / Intl s jiným než anglickým literálem) se mimo datumUI
//      nepíše — jinak by se vada vrátila jinou cestou. Anglické literály ('en-GB') jsou pro adminy a prompt, ty projdou.
//  (C) skutečný prohlížeč bez okna (Chrome/Edge): deník v islandštině nemá anglický měsíc a datum je z datumUI; strom totéž. Jestli
//      ten prohlížeč islandská data má, kontrola jen vypíše — obě větve hlídá (A).
// Neumí: datum složené ručně z getMonth() mimo datumUI (dnes žádné). Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_datum_ui.js [--test]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const V2 = ROOT + '/v2/';
const ISO = '2026-05-21T12:00:00Z';
const ANGL_MESIC = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/;
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

// ── (B) zdroj: islandské datum jen přes datumUI ────────────────────────────────────
// Komentáře pryč (čísla řádků zůstanou); `//` za dvojtečkou nebo uvozovkou je adresa, ne komentář.
function bezKomentaru(src, html) {
  let s = src;
  if (html) s = s.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' '));
  return s.replace(/\/\*[\s\S]*?\*\//g, (x) => x.replace(/[^\n]/g, ' ')).split('\n').map((r) => r.replace(/(^|[^:'"\\])\/\/.*$/, '$1'));
}
function kontrolaZdroje(src, soubor) {
  const chyby = [];
  if (soubor === 'runar-utils.js') {   // datumUI je jediné místo s 'is-IS' — jeho tělo se vynechá, zbytek utils se hlídá jako jinde
    const i = src.indexOf('function datumUI('), j = i < 0 ? -1 : src.indexOf('\n}', i);
    if (i < 0 || j < 0) return ['runar-utils.js: chybí function datumUI'];
    src = src.slice(0, i) + src.slice(i, j).replace(/[^\n]/g, ' ') + src.slice(j);
  }
  bezKomentaru(src, /\.html$/.test(soubor)).forEach((r, k) => {
    if (/is-IS/i.test(r)) chyby.push(soubor + ':' + (k + 1) + "  'is-IS' mimo datumUI → " + r.trim().slice(0, 100));
    const re = /\.toLocale(?:Date|Time)?String\(\s*([^,)]*)|\bIntl\.(?:DateTimeFormat|NumberFormat)\(\s*([^,)]*)/g; let m;
    while ((m = re.exec(r))) {
      const a = (m[1] !== undefined ? m[1] : (m[2] || '')).trim();
      if (!/^['"]en(-[A-Z]{2})?['"]$/.test(a)) chyby.push(soubor + ':' + (k + 1) + '  datum/číslo v jazyce uživatele mimo datumUI → ' + r.trim().slice(0, 100));
    }
  });
  return chyby;
}

if (process.argv.includes('--test')) {
  // Životní cyklus kontroly: špatné musí padnout, dobré projít (memory guard-test-the-lifecycle).
  const P = [
    ['deník jako do 2026-10-11 padne (is-IS i proměnný jazyk)', kontrolaZdroje("    const locale  = isIs ? 'is-IS' : 'en-GB';\n    const s = d.toLocaleDateString(locale, { day:'numeric' });", 'a.js').length === 2],
    ['přímé is-IS padne', kontrolaZdroje("  x = d.toLocaleDateString('is-IS');", 'a.js').length >= 1],
    ['toLocaleString() bez jazyka padne', kontrolaZdroje('  x = n.toLocaleString();', 'a.js').length === 1],
    ['Intl.DateTimeFormat(lang) padne', kontrolaZdroje('  f = new Intl.DateTimeFormat(lang, {});', 'a.js').length === 1],
    ["anglický literál projde ('en-GB')", kontrolaZdroje("  x = n.toLocaleString('en-GB');", 'a.js').length === 0],
    ['supportedLocalesOf mimo utils neprojde (nese is-IS)', kontrolaZdroje("  if (Intl.DateTimeFormat.supportedLocalesOf(['is-IS']).length) x = 1;", 'a.js').length === 1],
    ['v komentáři projde', kontrolaZdroje("  // toLocaleDateString('is-IS')\n  /* is-IS */", 'a.js').length === 0],
    ['HTML komentář projde', kontrolaZdroje("<!-- toLocaleDateString('is-IS') -->", 'a.html').length === 0],
    ['tělo datumUI v utils projde, is-IS jinde v utils padne', kontrolaZdroje("function datumUI(iso, lng) {\n  return d.toLocaleDateString(lng === 'is' ? 'is-IS' : 'en-GB');\n}\nvar x = 'is-IS';", 'runar-utils.js').length === 1],
    ['utils bez datumUI padne', kontrolaZdroje('var y = 1;', 'runar-utils.js').length === 1],
  ];
  const zle = P.filter((p) => !p[1]);
  zle.forEach((p) => console.log('FAIL test: ' + p[0]));
  if (!zle.length) console.log('OK    test kontroly data: ' + P.length + ' případů (zachytí i pustí)');
  process.exit(zle.length ? 1 : 0);
}

// ── (A) produkční deník a strom ve vm ─────────────────────────────────────────────
const prvky = {};
const mk = (id) => (prvky[id] = prvky[id] || { id, style: {}, innerHTML: '', textContent: '', classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } });
const S = { console: { log() {}, warn() {}, error() {} },
  document: { getElementById: (id) => mk(id), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, addEventListener() {} };
S.window = S; S.globalThis = S;
vm.createContext(S);
let code = 'var currentUser={id:"u1",email:"nekdo@example.com"}; var userTier="premium"; var sb=null; var lang="is"; var isTester=false;\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-svgs.js', 'runar-journal.js', 'runar-tree.js'])
  code += fs.readFileSync(V2 + f, 'utf8') + '\n;\n';
vm.runInContext(code, S);
const v = (e) => vm.runInContext(e, S);
const denik = (L, iso) => { v('lang = ' + JSON.stringify(L)); prvky['journal-list'] = null;
  v('renderJournal')([{ id: 'd1', rune_name: 'Fehu', rune_glyph: 'ᚠ', lang: L, short_text: 'x', deep_text: '', area: null, drawn_at: iso }]);
  return mk('journal-list').innerHTML.replace(/<[^>]+>/g, ' '); };
const strom = (L, iso) => { v('lang = ' + JSON.stringify(L)); return v('_treeDatum')(iso); };
const datum = (iso, L) => v('datumUI')(iso, L);

const sIs = new Date(ISO).toLocaleDateString('is-IS', { day: 'numeric', month: 'short', year: 'numeric' });
rekni(v("Intl.DateTimeFormat.supportedLocalesOf(['is-IS']).length") > 0 && /maí/.test(sIs), '(A) Node má islandská data (jinak by větev „s daty“ nešla ověřit)', sIs);
rekni(datum(ISO, 'is') === sIs, '(A) s islandskými daty: „' + sIs + '“', datum(ISO, 'is'));
const hIs = denik('is', ISO);
rekni(hIs.indexOf(sIs) !== -1 && !ANGL_MESIC.test(hIs), '(A) deník islandsky má islandské datum, žádný anglický měsíc', hIs.trim().slice(0, 120));
rekni(strom('is', ISO) === sIs, '(A) strom islandsky = deník', strom('is', ISO));
rekni(datum(ISO, 'en') === '21 May 2026' && denik('en', ISO).indexOf('21 May 2026') !== -1 && strom('en', ISO) === '21 May 2026', '(A) anglicky „21 May 2026“ v deníku i ve stromě');

// prohlížeč bez islandských dat (Chrome na Windows): supportedLocalesOf → []
v('var __sl = Intl.DateTimeFormat.supportedLocalesOf; Intl.DateTimeFormat.supportedLocalesOf = function () { return []; };');
const hBez = denik('is', ISO);
rekni(datum(ISO, 'is') === '21.5.2026', '(A) bez islandských dat číselně „21.5.2026“', datum(ISO, 'is'));
rekni(hBez.indexOf('21.5.2026') !== -1 && !ANGL_MESIC.test(hBez), '(A) deník bez islandských dat: „21.5.2026“, žádný anglický měsíc', hBez.trim().slice(0, 120));
rekni(strom('is', ISO) === '21.5.2026', '(A) strom bez islandských dat = deník', strom('is', ISO));
rekni(datum(ISO, 'en') === '21 May 2026', '(A) angličtinu chybějící islandská data nemění');
v('Intl.DateTimeFormat.supportedLocalesOf = __sl;');

rekni(datum(null, 'is') === '' && datum('nesmysl', 'is') === '' && strom('is', null) === '', '(A) žádné / neplatné datum = prázdno');
rekni(!/Invalid Date|1970/.test(denik('is', null)), '(A) deník bez data: žádné „Invalid Date“ ani rok 1970');

const soubory = fs.readdirSync(V2).filter((f) => /^runar-.*\.(js|html)$/.test(f))
  .concat(fs.readdirSync(V2).filter((d) => /^tree-lab-/.test(d) && fs.statSync(V2 + d).isDirectory())
    .flatMap((d) => fs.readdirSync(V2 + d).filter((f) => /^runar-.*\.js$/.test(f)).map((f) => d + '/' + f)));
let zdroj = [];
for (const f of soubory) zdroj = zdroj.concat(kontrolaZdroje(fs.readFileSync(V2 + f, 'utf8'), f));
zdroj.forEach((c) => console.log('  ' + c));
rekni(!zdroj.length, '(B) zdroj: islandské datum jen přes datumUI (' + soubory.length + ' souborů appky)', zdroj.length + ' míst');

// ── (C) skutečný prohlížeč ─────────────────────────────────────────────────────────
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function konecVse() {
  console.log(fail ? '\nFAIL  datum v jazyce uživatele: ' + fail + ' selhalo'
    : '\nOK    datum v jazyce uživatele: deník i strom islandsky i v prohlížeči bez islandských dat, jen přes datumUI');
  process.exit(fail ? 1 : 0);
}
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, '(C) prohlížeč (Chrome/Edge) nenalezen'); srv.close(); return konecVse(); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'datum-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {}; const exc = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : null; };
    await cmd('Page.enable'); await cmd('Runtime.enable');
    await cmd('Page.navigate', { url: 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html' });
    for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof renderJournal === 'function' && typeof _treeDatum === 'function' && document.readyState === 'complete'`)) break; }
    const r = await ev(`(() => {
      lang = 'is'; currentUser = { id: 'u1', email: 'nekdo@example.com' };
      renderJournal([{ id: 'd1', rune_name: 'Fehu', rune_glyph: 'ᚠ', lang: 'is', short_text: 'x', deep_text: '', area: null, drawn_at: ${JSON.stringify(ISO)} }]);
      const el = document.querySelector('#journal-list .jcard-date');
      return { data: Intl.DateTimeFormat.supportedLocalesOf(['is-IS']), text: el ? el.textContent : null,
               datum: datumUI(${JSON.stringify(ISO)}, 'is'), strom: _treeDatum(${JSON.stringify(ISO)}) };
    })()`);
    const ma = r && r.data && r.data.length ? 'má islandská data' : 'NEMÁ islandská data';
    rekni(!!r && r.text != null && r.datum !== '' && !ANGL_MESIC.test(r.text) && r.text.indexOf(r.datum) === 0,
      '(C) prohlížeč (' + ma + '): deník islandsky „' + (r && r.datum) + '“, žádný anglický měsíc', JSON.stringify(r));
    rekni(!!r && r.strom === r.datum, '(C) prohlížeč: strom = deník', JSON.stringify(r && r.strom));
    rekni(!exc.length, '(C) bez chyb JS', exc.map((x) => (x.exception && x.exception.description || x.text || '').split('\n')[0]).join(' | ').slice(0, 300));
  } catch (e) { rekni(false, '(C) prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} konecVse(); }, 300);
})();
