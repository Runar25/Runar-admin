// verify_web_appka_jmena.js — web therunekeeper.com načítá ŽIVÉ soubory appky (v2/runar-*.js) do téhož prostoru jmen jako svůj kód.
// Kontrola hlídá smlouvu mezi nimi: (a) žádné jméno deklarované dvakrát (appka × web), (b) každá funkce, kterou web volá, existuje.
//
// Proč (owner 2026-10-21 „5. ano, postav to“; návrh CODE-web, zúžení CODE-read): CODE-tune přidala do runar-config.js `const RUNAR_HOME_URL`,
// web.js měl `var RUNAR_HOME_URL` → SyntaxError, web.js se nenačetl a ~10 min nefungovaly /heim/, /ferdin/, /kort/. Smoke zkoušel jen appku;
// web načítá appku až u návštěvníka. Kontrola jmen chytí tuhle třídu chyby už při commitu a řekne, které jméno a kde (prohlížečová kontrola
// webu by byla pomalejší a řekla by jen „stránka spadla“ — owner zvolil tuhle).
//
// Jak: pro každou stránku web/site/**/index.html vezme skripty v pořadí ze stránky (adresa runar25.github.io/Runar-admin/v2/X → v2/X z pracovního
// stromu, relativní cesty od stránky, vložené <script>) a spustí je v JEDNOM kontextu vm — top-level const/let/class sdílí skripty stejně jako
// v prohlížeči, takže dvojí deklarace hodí táž SyntaxError „has already been declared“. Chyby za běhu (chybějící DOM) se ignorují: deklarace
// vznikají před během skriptu. (b) z kódu webu (web.js + vložené skripty) vezme volání `jmeno(` (ne metody `.jmeno(`), co web sám nedeklaruje,
// a ověří, že v kontextu existují (typeof ≠ undefined; deklarovaná ale nedoběhnutá = existuje). Rozhraní prohlížeče (fetch, URL…) bere z Node.
// Neumí: chybu uvnitř sdílené funkce, která se projeví až s daty webu; jména použitá jinak než voláním (čtení proměnné z appky).
//   node scripts/verify_web_appka_jmena.js        · --test = kontrola sama sebe (dočasný strom)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os');
const APP = 'https://runar25.github.io/Runar-admin/v2/';
const KLICOVA = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'new', 'await', 'async', 'with', 'super', 'import']);
const PROHLIZEC = ['fetch', 'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder', 'crypto', 'atob', 'btoa', 'structuredClone', 'queueMicrotask',
  'AbortController', 'Blob', 'FormData', 'Headers', 'Request', 'Response', 'Event', 'encodeURIComponent', 'decodeURIComponent'];

function stranky(d) {
  let out = [];
  for (const f of fs.readdirSync(d)) {
    const p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) { if (f !== 'vendor' && f !== 'img') out = out.concat(stranky(p)); }
    else if (f === 'index.html') out.push(p);
  }
  return out;
}
function skripty(stranka, root) {
  const html = fs.readFileSync(stranka, 'utf8'), dir = path.dirname(stranka), out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(html))) {
    const src = (m[1].match(/\bsrc="([^"]+)"/) || [])[1];
    if (src) {
      const s = src.split('?')[0];
      const soubor = s.startsWith(APP) ? root + '/v2/' + s.slice(APP.length) : /^https?:/.test(s) ? null : path.resolve(dir, s).replace(/\\/g, '/');
      if (soubor) out.push({ jm: soubor.slice(root.length + 1), kod: fs.existsSync(soubor) ? fs.readFileSync(soubor, 'utf8') : null, web: !s.startsWith(APP) && !/vendor\//.test(s) });
    } else if (/type="application\/(ld\+)?json"/.test(m[1])) continue;
    else out.push({ jm: stranka.slice(root.length + 1) + ' (vložený skript)', kod: m[2], web: true });
  }
  return out;
}
const bezKomentaru = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1').replace(/(['"`])(?:\\.|(?!\1)[^\\\n])*\1/g, '""');

function kontext() {
  const S = { console: { log() {}, warn() {}, error() {} }, setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {}, requestAnimationFrame() {},
    location: { search: '', hash: '', href: '', pathname: '/' }, navigator: { language: 'en' }, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
      createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), documentElement: { lang: 'en', setAttribute() {} }, body: {} } };
  for (const k of PROHLIZEC) if (globalThis[k] !== undefined) S[k] = globalThis[k];
  S.window = S; S.globalThis = S; S.self = S;
  return vm.createContext(S);
}

function zkontroluj(stranka, root) {
  const vady = [], S = kontext(), sk = skripty(stranka, root), webKod = [];
  for (const x of sk) {
    if (x.kod === null) { vady.push(x.jm + ' — soubor, který stránka načítá, neexistuje'); continue; }
    try { vm.runInContext(x.kod, S, { filename: x.jm }); }
    catch (e) {
      const zprava = String(e && e.message || e);
      if (e && e.name === 'SyntaxError') {
        vady.push(x.jm + ' — ' + zprava + (/already been declared/.test(zprava) ? ' (jméno už deklaruje dřívější skript stránky — appka × web)' : ''));
        const jm = (zprava.match(/Identifier '([\w$]+)' has already been declared/) || [])[1];
        const dek = jm && new RegExp('(^|\\n)\\s*(?:const|let|var|class|function)\\s+' + jm.replace(/\$/g, '\\$') + '\\b');
        // kdo jméno deklaroval dřív — ať commit appky (častější příčina) zastaví i rychlá kontrola, která blokuje jen staged soubor
        if (dek) sk.slice(0, sk.indexOf(x)).filter((y) => y.kod && dek.test(y.kod)).forEach((y) => vady.push(y.jm + ' — deklaruje ' + jm + ', které deklaruje i ' + x.jm));
      }
    }
    if (x.web) webKod.push(x);
  }
  for (const x of webKod) {
    const k = bezKomentaru(x.kod);
    const vlastni = new Set([...k.matchAll(/(?:function\s+|(?:const|let|var|class)\s+)([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
    const param = new Set([...k.matchAll(/function\s*[\w$]*\s*\(([^)]*)\)/g)].flatMap((m) => m[1].split(',').map((p) => p.trim().split('=')[0].trim())));
    for (const jm of new Set([...k.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[2]))) {
      if (KLICOVA.has(jm) || vlastni.has(jm) || param.has(jm)) continue;
      let ex; try { ex = vm.runInContext('typeof ' + jm, S) !== 'undefined'; } catch (e) { ex = true; }   // TDZ = deklarované
      if (!ex) vady.push(x.jm + ' — volá ' + jm + '(), které appka ani web nedeklaruje (přejmenované nebo smazané v appce?)');
    }
  }
  return { vady, n: sk.length };
}

if (process.argv.includes('--test')) {
  // Životní cyklus (memory guard-test-the-lifecycle): dnešní střet const × var padne · function × const padne · různá jména projdou ·
  // volání funkce, kterou appka nemá, padne · vlastní funkce, metoda a rozhraní prohlížeče projdou · stránka bez souboru padne.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'webjm-')).replace(/\\/g, '/');
  fs.mkdirSync(tmp + '/v2'); fs.mkdirSync(tmp + '/web/site/a', { recursive: true });
  const pripad = (app, web, html) => {
    fs.writeFileSync(tmp + '/v2/runar-x.js', app); fs.writeFileSync(tmp + '/web/site/web.js', web);
    fs.writeFileSync(tmp + '/web/site/a/index.html', html || '<script src="' + APP + 'runar-x.js"></script><script src="../web.js?v=1"></script>');
    return zkontroluj(tmp + '/web/site/a/index.html', tmp).vady.length > 0;
  };
  const P = [
    ['const v appce × var ve webu (dnešní chyba) padne', pripad("const RUNAR_HOME_URL = 'x';", "var RUNAR_HOME_URL = 'y';"), true],
    ['function v appce × const ve webu padne', pripad('function tp() {}', 'const tp = 1;'), true],
    ['různá jména projdou', pripad("const A = 1; function t(k) { return k; }", "var B = 2; t('k');"), false],
    ['volání funkce, kterou appka nemá, padne', pripad('function t(k) { return k; }', "smazana('k');"), true],
    ['vlastní funkce, metoda a rozhraní prohlížeče projdou', pripad('var X = 1;', "function mojeF() {} mojeF(); [1].map(String); new URLSearchParams(''); fetch;"), false],
    ['stránka načítá soubor appky, který neexistuje, padne', pripad('var X = 1;', 'var Y = 1;', '<script src="' + APP + 'runar-nic.js"></script>'), true],
  ];
  fs.rmSync(tmp, { recursive: true, force: true });
  const zle = P.filter((p) => p[1] !== p[2]);
  zle.forEach((p) => console.log('FAIL test: ' + p[0]));
  if (!zle.length) console.log('OK    test kontroly jmen web × appka: ' + P.length + ' případů (zachytí i pustí)');
  process.exit(zle.length ? 1 : 0);
}

const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const vsechny = new Set(); let nSkriptu = 0;
const st = stranky(ROOT + '/web/site');
for (const s of st) { const r = zkontroluj(s, ROOT); nSkriptu += r.n; r.vady.forEach((v) => vsechny.add(v)); }
if (vsechny.size) {
  vsechny.forEach((v) => console.log('FAIL  ' + v));
  console.log('FAIL  web × appka: ' + vsechny.size + ' vad(a) — web by u návštěvníka spadl');
  process.exit(1);
}
console.log('OK    web × appka: ' + st.length + ' stránek webu, ' + nSkriptu + ' skriptů — žádné jméno dvakrát, každá volaná funkce existuje');
