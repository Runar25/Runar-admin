// verify_play_bez_nakupu.js — appka z Google Play (?src=play) nesmí mít odkaz ani tlačítko na stránku, odkud se dá (i nepřímo) zaplatit.
//
// Proč (owner 2026-10-21 „2. ano, postav to“, návrh CODE-web; BACKLOG „Google Play bez provize — co hlídat dál“ bod 3): appka jde do Play
// jako consumption-only (DECISIONS 2026-10-19 (4)) — o nákupu jinde smí jen INFORMOVAT textem (Play Console Help 10281818). Pravidlo se
// už 2× porušilo tím, že přibyl odkaz a nikdo ho neviděl (odkaz na obchod u pole kódu, značka AGNDOFA, odkazy a ceník v nápovědě —
// opravila CODE-tune 2026-10-21). Odkazy přibývají i dynamicky (okno cesty, nápověda z UI_TEXT), proto kontrola běží ve SKUTEČNÉM
// prohlížeči na ploše, kde vada žije (§19.3), ne nad zdrojem.
//
// Jak: appka z pracovního stromu na 127.0.0.1, Chrome/Edge bez okna. JOURNEY_URL se v odpovědi serveru podvrhne na adresu webu —
// kontroluje se i budoucí stav, kdy nákup na webu poběží (dnes null = „Coming soon“). Stavy v režimu Play: appka po načtení · okno cesty
// (měsíčně, ročně, karta Rúnakort) · islandsky · nápověda · zásady soukromí. V každém stavu se projde CELÉ DOM: prvek s odkazem
// (href, action, onclick, data-href) na obchodní adresu (OBCHOD) je vada, pokud není skrytý (display:none na něm nebo předkovi).
// mailto: projde (kontakt k platbě nevede). Kontrolní běh BEZ ?src=play musí obchodní odkaz najít — jinak je kontrola slepá (§25 B).
// Neumí: popis appky v Google Play (mimo repo, BACKLOG bod 2), odkaz složený až po kliknutí uživatele (window.open s adresou z proměnné).
//   node scripts/verify_play_bez_nakupu.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const WEB = 'https://therunekeeper.com/journey/';   // podvržené JOURNEY_URL (tvar adresy webu; skutečná stránka nemusí existovat)
const OBCHOD = 'agndofa\\.is|therunekeeper\\.com|shopify|rapyd';
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (/runar-config\.js$/.test(f)) { res.end(fs.readFileSync(f, 'utf8').replace(/const JOURNEY_URL = [^;]*;/, 'const JOURNEY_URL = ' + JSON.stringify(WEB) + ';')); return; }
  fs.createReadStream(f).pipe(res);
});

// Sběr v prohlížeči: obchodní odkazy, které nejsou skryté. Vrací [{kde, tag, id, cil}].
const SBER = `(() => {
  const re = new RegExp(${JSON.stringify(OBCHOD)}, 'i'), out = [];
  const skryty = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (getComputedStyle(e).display === 'none') return true; return false; };
  document.querySelectorAll('[href],[action],[onclick],[data-href]').forEach((el) => {
    const cil = ['href', 'action', 'onclick', 'data-href'].map((a) => el.getAttribute(a) || '').join(' ');
    if (!re.test(cil) || /^\\s*mailto:/i.test(el.getAttribute('href') || '') && !re.test(cil.replace(/mailto:\\S+/gi, ''))) return;
    if (skryty(el)) return;
    out.push({ tag: el.tagName.toLowerCase(), id: el.id || '', text: (el.textContent || '').trim().slice(0, 40), cil: cil.trim().slice(0, 90) });
  });
  return out;
})()`;

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const BASE = 'http://127.0.0.1:' + srv.address().port + '/v2/';
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, 'prohlížeč (Chrome/Edge) nenalezen'); srv.close(); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'play-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {}; const exc = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
    poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'Google Play bez nákupu', limitS: 180 });
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : null; };
    const jdi = async (url, hotovo) => { await cmd('Page.navigate', { url }); for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(hotovo)) break; } await sleep(400); };
    await cmd('Page.enable'); await cmd('Runtime.enable');
    const APP = `typeof openJourney === 'function' && document.readyState === 'complete'`;
    const STRANKA = `document.readyState === 'complete'`;
    const STAVY = [
      ['appka po načtení', null],
      ['okno cesty — měsíčně', `(_journeyP = 'm', openJourney(), true)`],
      ['okno cesty — ročně', `(_journeyObdobi('y'), true)`],
      ['okno cesty — karta Rúnakort', `(_journeyObdobi('c'), true)`],
      ['islandsky, okno cesty', `(setLang('is'), _journeyObdobi('m'), true)`],
    ];
    const vada = (kde, nal) => nal.map((x) => kde + ': <' + x.tag + (x.id ? '#' + x.id : '') + '> „' + x.text + '“ → ' + x.cil);

    // ── kontrolní běh BEZ Play: obchodní odkaz musí najít (jinak je sběr slepý) ──
    await jdi(BASE + 'runar-reader.html', APP);
    await ev(`(sessionStorage.removeItem('runar_src'), true)`);
    await ev(`(_journeyP = 'm', openJourney(), true)`); await sleep(300);
    const kontrola = await ev(SBER) || [];
    rekni(kontrola.length > 0, 'kontrolní běh bez ?src=play: sběr obchodní odkaz najde (' + kontrola.length + '×, např. ' + (kontrola[0] ? (kontrola[0].id || kontrola[0].tag) : '—') + ')',
      'nenašel nic — buď appka mimo Play nemá žádný odkaz na nákup, nebo je sběr slepý');

    // ── režim Play ──
    await jdi(BASE + 'runar-reader.html?src=play', APP);
    const vady = [];
    for (const [kde, akce] of STAVY) {
      if (akce) { await ev(akce); await sleep(350); }
      vady.push(...vada(kde, await ev(SBER) || []));
    }
    rekni(await ev(`sessionStorage.getItem('runar_src') === 'play' && _journeyProstredi() === 'play'`), 'režim Play se zapnul a drží v relaci (runar_src)');
    for (const [kde, str] of [['nápověda', 'runar-help.html'], ['zásady soukromí', 'runar-privacy.html']]) {
      await jdi(BASE + str, STRANKA); await sleep(500);
      vady.push(...vada(kde, await ev(SBER) || []));
    }
    vady.forEach((v) => console.log('        ' + v));
    rekni(!vady.length, 'Google Play: žádný viditelný odkaz ani tlačítko na nákup (appka, okno cesty ve třech kartách, IS, nápověda, zásady; JOURNEY_URL podvržené)',
      vady.length + '× — skryj ho ve větvi Play (_journeyProstredi() === \'play\' v runar-app.js, _play v runar-help.html), nebo z něj udělej prostý text');
    rekni(!exc.length, 'bez chyb JS', exc.map((x) => (x.exception && x.exception.description || x.text || '').split('\n')[0]).join(' | ').slice(0, 300));
  } catch (e) { rekni(false, 'prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  const dialogy = poj ? poj.hotovo() : [];
  if (dialogy.length) rekni(false, 'stránka otevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', dialogy.join(' · '));
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    console.log(fail ? 'FAIL  Google Play bez nákupu: ' + fail + ' selhalo' : 'OK    Google Play bez nákupu: v režimu Play žádná cesta k platbě');
    process.exit(fail ? 1 : 0);
  }, 300);
})();
