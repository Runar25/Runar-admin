// verify_citelnost.js — smoke ㊽: co člověk na obrazovce opravdu přečte (CODE-tune 2026-10-11).
//
// Proč: CODE-read při procházce appky jako návštěvník (2026-10-11) našel upozornění „not professional advice“ s kontrastem 2,41 : 1 —
// --muted přes průhlednost 0,45 dalo barvu ≈ --dim, kterou §5 na text zakazuje (KUKY 2026-09-24). Pravidlo stálo jen v CLAUDE.md
// a nic ho nehlídalo, porušení se našlo až okem (§30).
// Co dělá (skutečný prohlížeč bez okna; reader jako návštěvník — s oknem „Where to start“ i bez, EN i IS —, nápověda a zásady EN i IS):
//  (A) kontrast: každý viditelný text — jeho barva × průhlednost předků proti prvnímu barevnému pozadí předků — má aspoň 3 : 1, tedy
//      viditelně nad --dim (2,2 : 1). Neaktivní ovládání (zamčené pilulky a runy, „coming“, disabled) je výjimka: vybledlé je záměrně
//      a WCAG ho nepočítá. Texty mezi 3 a 4,5 : 1 (doporučení WCAG pro malé písmo) jen vypíše — to je rozhodnutí o vzhledu, ne §5.
// Neumí: text přes obrázek (bere barvu pozadí předků), stavy přihlášeného (čtení, menu), stín a obrys písma.
// Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_citelnost.js            · --slabe vypíše i texty mezi 3 a 4,5 : 1 (podklad pro rozhodnutí o vzhledu)
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const PRAH = 3, WCAG = 4.5;
const NEAKTIVNI = ':disabled, [aria-disabled="true"], [aria-hidden="true"], .pill-locked, .pills-locked, .locked, .coming';
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

// Běží ve stránce: viditelné texty a jejich kontrast (WCAG 2: relativní jas, (L1 + 0,05) / (L2 + 0,05)).
const MER = `((NEAKTIVNI) => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const jas = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const rgba = (s) => { const m = String(s).match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const pozadi = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c.a > 0.5) return c; }
    return rgba(getComputedStyle(document.body).backgroundColor) || { r: 10, g: 12, b: 18, a: 1 }; };
  const vysl = [], videno = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const txt = n.nodeValue.trim(); if (txt.length < 2) continue;
    const el = n.parentElement; if (!el || videno.has(el) || el.closest('script, style, noscript')) continue; videno.add(el);
    const box = el.getBoundingClientRect(); if (!box.width || !box.height) continue;
    let op = 1, skryte = false;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') { skryte = true; break; } op *= parseFloat(cs.opacity); }
    if (skryte || op < 0.05 || el.closest(NEAKTIVNI)) continue;
    const cs = getComputedStyle(el), c = rgba(cs.color); if (!c) continue;
    const bg = pozadi(el), a = c.a * op;
    const k = (() => { const l1 = jas(c.r * a + bg.r * (1 - a), c.g * a + bg.g * (1 - a), c.b * a + bg.b * (1 - a)), l2 = jas(bg.r, bg.g, bg.b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); })();
    const px = parseFloat(cs.fontSize), velky = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    vysl.push({ k: Math.round(k * 100) / 100, velky, kde: el.tagName + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''),
                txt: txt.slice(0, 40), px: Math.round(px * 10) / 10, op: Math.round(op * 100) / 100 });
  }
  return vysl;
})(${JSON.stringify(NEAKTIVNI)})`;

const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function konec() {
  console.log(fail ? '\nFAIL  čitelnost: ' + fail + ' selhalo' : '\nOK    čitelnost: každý viditelný text má kontrast aspoň 3 : 1 (nad --dim, §5)' + (konec.info || ''));
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
  if (!EXE) { rekni(false, 'prohlížeč (Chrome/Edge) nenalezen'); srv.close(); return konec(); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'citel-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  const hlidac = setTimeout(() => { rekni(false, 'kontrola visí déle než 120 s'); try { proc.kill(); } catch (e) {} konec(); }, 120000);
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {};
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
      return r.result && r.result.result && !r.result.exceptionDetails ? r.result.result.value : null; };
    const cekej = async (podm, ms) => { for (let k = 0; k < (ms || 10000) / 150; k++) { if (await ev(podm)) return true; await sleep(150); } return false; };
    await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable');
    await cmd('Network.setBlockedURLs', { urls: ['*supabase.co*'] });   // databáze: nic se neodesílá ani nečte
    const BASE = 'http://127.0.0.1:' + srv.address().port + '/v2/';
    const stavy = [];
    const zmer = async (jm) => { const v = await ev(MER); stavy.push({ jm, v: Array.isArray(v) ? v : null }); };
    const nacti = async (str, pripraven) => { await cmd('Page.navigate', { url: BASE + str }); await cekej(`document.readyState === 'complete' && (${pripraven})`); await sleep(600); };

    // reader: první návštěva (okno „Where to start“ naskočí samo, výchozí jazyk IS), pak bez okna EN a IS
    await nacti('runar-reader.html', `typeof setLang === 'function'`);
    await cekej(`(document.getElementById('wts-modal') || {}).classList && document.getElementById('wts-modal').classList.contains('open')`, 6000);
    await zmer('reader · první návštěva (okno Where to start)');
    await ev(`localStorage.setItem('runar_wts_seen', '1')`);
    await nacti('runar-reader.html', `typeof setLang === 'function'`);
    await ev(`setLang('en')`); await sleep(400); await zmer('reader · návštěvník EN');
    await ev(`setLang('is')`); await sleep(400); await zmer('reader · návštěvník IS');
    for (const str of ['runar-help.html', 'runar-privacy.html']) {
      await nacti(str, `typeof setLang === 'function'`);
      await ev(`setLang('en')`); await sleep(300); await zmer(str + ' EN');
      await ev(`setLang('is')`); await sleep(300); await zmer(str + ' IS');
    }

    // (A) kontrast
    let textu = 0; const pod = [], slabe = new Map();
    for (const s of stavy) {
      if (!s.v) { rekni(false, '(A) ' + s.jm + ': měření ve stránce selhalo'); continue; }
      textu += s.v.length;
      for (const x of s.v) {
        if (x.k < PRAH) pod.push(s.jm + ': ' + x.k + ' : 1  ' + x.kde + ' „' + x.txt + '“ (' + x.px + ' px, průhlednost ' + x.op + ')');
        else if (x.k < (x.velky ? 3 : WCAG)) {
          slabe.set(x.kde + ' ' + x.k, s.jm.split(' ')[0]);
          if (process.argv.includes('--slabe')) console.log('  slabé  ' + s.jm + ': ' + x.k + ' : 1  ' + x.kde + ' „' + x.txt + '“ (' + x.px + ' px, průhlednost ' + x.op + ')');
        }
      }
    }
    pod.forEach((p) => console.log('  ' + p));
    rekni(!pod.length && textu > 50, '(A) kontrast aspoň 3 : 1 — ' + textu + ' textů v ' + stavy.length + ' stavech', pod.length + ' textů pod 3 : 1 (§5: --dim nikdy pro text)');
    if (slabe.size) konec.info = ' · slabší než 4,5 : 1 (doporučení WCAG, rozhodnutí o vzhledu): ' + slabe.size + ' — ' +
      [...new Set(slabe.values())].join(', ');
  } catch (e) { rekni(false, 'prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  clearTimeout(hlidac);
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} konec(); }, 300);
})();
