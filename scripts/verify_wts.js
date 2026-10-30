// verify_wts.js — smoke ㊺: okno „Where to start“ (CODE-tune 2026-10-11, DECISIONS 2026-10-11 (65)) skutečnou appkou v prohlížeči.
//
// Proč: owner chce okno, které se ukáže jednou každému (i návštěvníkovi), ukáže Kolekci a při zavření se VIDITELNĚ zasune do „How a reading
// works“ — „viditelně se tam musí nějakým hezkým efektem zasunout, zajet, aby ukázalo, kde se má uživatel koukat“. První verze zasunutí
// v prohlížeči nebylo vidět: appka posunula popisek doprostřed obrazovky, kde stojí i okno, a popisek je tlačítko přes celou šířku karty —
// okno jen zprůhlednělo na místě. Kontrola proto MĚŘÍ let: střed karty se během zavírání přiblíží ke středu textu popisku a karta se zmenší.
// Prochází na telefonu i počítači: (A) první otevření — okno je, texty z UI_TEXT (EN i IS), runa Ansuz naší kresbou · (B) „Later“ — karta
// letí k popisku a zmenšuje se, okno zmizí, popisek se rozzáří, pamatuje si to · (C) další načtení — okno už není · (D) „Open the Runes
// Collection“ — okno se zasune a otevře se Kolekce · (E) vypnuté animace — žádný let, jen rozzáření · bez chyb JS. Netvrdí nic o vzhledu.
//   node scripts/verify_wts.js
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
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
  if (!EXE) { console.log('FAIL  prohlížeč (Chrome/Edge) nenalezen'); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wts-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  const konec = (kod) => { try { proc.kill(); } catch (e) {} srv.close(); setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} process.exit(kod); }, 300); };
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find(x => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
  let id = 0; const wait = {}; const exc = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
  // pojistky (2026-10-11): limit, spadlý Chrome, dialog — bez nich ㊺ visel v pre-pushi 48 minut (scripts/utils/prohlizec_pojistky.js)
  const poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'okno Where to start (㊺)', limitS: 180 });
  const cmd = (method, params) => new Promise(ok => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async e => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) return 'EXC: ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text); return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  const URL_APP = 'http://127.0.0.1:' + port + '/v2/runar-reader.html';
  const nacti = async (lang) => {
    await cmd('Page.navigate', { url: URL_APP });
    for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof maybeShowWhereToStart === 'function' && document.readyState === 'complete'`)) break; }
    if (lang) await ev(`(() => { try { localStorage.setItem('runar_lang', ${JSON.stringify(lang)}); } catch (e) {} })()`);
  };
  const res = []; const ok = (n, c, i) => res.push((c ? 'OK   ' : 'FAIL ') + n + (i ? ' — ' + i : ''));

  // Let karty: vzorky středu a šířky (setTimeout, ne rAF — ten v pozadí stojí) a text popisku na konci.
  const zavri = (doKolekce) => ev(`(async () => {
    const card = document.getElementById('wts-card'), lbl = document.getElementById('read-guide-lbl'), m = document.getElementById('wts-modal');
    const b0 = card.getBoundingClientRect(), vz = [];
    closeWhereToStart(${doKolekce ? 'true' : 'false'});
    for (let i = 0; i < 30; i++) { await new Promise(r => setTimeout(r, 50)); const b = card.getBoundingClientRect();
      vz.push({ x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, open: m.classList.contains('open') }); }
    const rg = document.createRange(); rg.selectNodeContents(lbl); const tr = rg.getBoundingClientRect();
    const cil = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2, w: tr.width };
    const d = (p) => Math.hypot(p.x - cil.x, p.y - cil.y);
    const zive = vz.filter(p => p.open);
    const nejbliz = zive.length ? zive.reduce((a, p) => d(p) < d(a) ? p : a, zive[0]) : null;
    // dy0 (2026-10-30): od řádku návodu vlevo (hlas za nadpisem) leží popisek i stranou od okna — celková vzdálenost tak zůstala nad prahem
    // i s popiskem uprostřed výšky obrazovky, za oknem (útok „chci = vyska * 0.5“ prošel). Let musí vést i svisle.
    return { d0: Math.round(d({ x: b0.left + b0.width / 2, y: b0.top + b0.height / 2 })), dy0: Math.round(Math.abs(b0.top + b0.height / 2 - cil.y)),
             dMin: nejbliz ? Math.round(d(nejbliz)) : null,
             w0: Math.round(b0.width), wMin: zive.length ? Math.round(Math.min.apply(null, zive.map(p => p.w))) : null,
             zavreno: !m.classList.contains('open'), glow: lbl.classList.contains('svice'), seen: localStorage.getItem('runar_wts_seen'),
             cilVidet: tr.top > 0 && tr.bottom < innerHeight, tab: activeAppTab };
  })()`);

  for (const [jm, sirka, vyska, mobil] of [['telefon', 390, 844, true], ['počítač', 1280, 800, false]]) {
    await cmd('Emulation.setDeviceMetricsOverride', { width: sirka, height: vyska, deviceScaleFactor: mobil ? 3 : 1, mobile: mobil });
    await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    // (A) první otevření (čisté úložiště)
    await nacti(); await ev(`(() => { try { localStorage.clear(); } catch (e) {} })()`); await nacti();
    await sleep(2600);
    const a = await ev(`(() => { const m = document.getElementById('wts-modal');
      return { open: m.classList.contains('open'), title: document.getElementById('wts-title').textContent, ok: document.getElementById('wts-title').textContent === t('wts_title')
               && document.getElementById('wts-l2').textContent === t('wts_l2') && document.getElementById('wts-note').textContent === tp('wts_note', { guide: t('guide_title') }),
               svg: !!document.querySelector('#wts-modal .wts-rune svg') }; })()`);
    ok(jm + ' (A) první otevření: okno je, texty z UI_TEXT, runa naší kresbou', a && a.open && a.ok && a.svg, JSON.stringify(a));
    const isT = await ev(`(() => { setLang('is'); const r = { t: document.getElementById('wts-title').textContent, ok: document.getElementById('wts-title').textContent === UI_TEXT.is.wts_title
      && document.getElementById('wts-open').textContent === UI_TEXT.is.wts_open }; setLang('en'); return r; })()`);
    ok(jm + ' (A) islandsky: přepnutí jazyka přepíše i otevřené okno', isT && isT.ok, JSON.stringify(isT));
    // (B) „Later“ → let k popisku
    const b = await zavri(false);
    ok(jm + ' (B) karta letí k textu „How a reading works“ a zmenšuje se', b && b.dMin !== null && b.dMin < b.d0 * 0.5 && b.wMin < b.w0 * 0.7 && b.d0 > 80 && b.dy0 > 50,
       JSON.stringify({ d0: b && b.d0, dy0: b && b.dy0, dMin: b && b.dMin, w0: b && b.w0, wMin: b && b.wMin }));
    ok(jm + ' (B) okno zmizí, popisek se rozzáří a je vidět, appka si to pamatuje', b && b.zavreno && b.glow && b.cilVidet && b.seen === '1', JSON.stringify(b));
    // (C) další načtení — okno už není
    await nacti(); await sleep(2600);
    const c = await ev(`document.getElementById('wts-modal').classList.contains('open')`);
    ok(jm + ' (C) další načtení: okno se už neukáže', c === false, String(c));
  }

  // (D) „Open the Runes Collection“ (počítač)
  await ev(`(() => { try { localStorage.removeItem('runar_wts_seen'); } catch (e) {} })()`); await nacti(); await sleep(2600);
  const d = await zavri(true); await sleep(900);
  const tab = await ev(`activeAppTab`);
  ok('(D) „Open the Runes Collection“: okno se zasune a otevře se Kolekce', d && d.zavreno && tab === 'collection', JSON.stringify({ zavreno: d && d.zavreno, tab }));
  // (E) vypnuté animace — žádný let, jen rozzáření
  await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await ev(`(() => { try { localStorage.removeItem('runar_wts_seen'); } catch (e) {} })()`); await nacti(); await sleep(2600);
  const e = await zavri(false);
  ok('(E) vypnuté animace: okno zmizí hned, bez letu, popisek se rozzáří a je vidět', e && e.zavreno && e.glow && e.cilVidet && (e.dMin === null || e.dMin >= e.d0 * 0.9), JSON.stringify(e));
  ok('bez výjimek v appce', !exc.length, exc.map(x => (x.exception && x.exception.description || x.text || '').split('\n')[0]).join(' | ').slice(0, 300));

  const dialogy = poj.hotovo();
  ok('stránka neotevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', !dialogy.length, dialogy.join(' · '));
  for (const r of res) console.log(r);
  const zle = res.filter(r => r.startsWith('FAIL')).length;
  console.log(zle ? '\n' + zle + ' selhalo' : '\nOK  „Where to start“: jednou, EN i IS, let do „How a reading works“ na telefonu i počítači, Kolekce, bez animací');
  konec(zle ? 1 : 0);
})().catch(e => { console.log('FAIL  běh kontroly: ' + (e && e.message)); process.exit(1); });
