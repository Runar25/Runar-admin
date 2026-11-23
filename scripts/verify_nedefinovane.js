// verify_nedefinovane.js — název, který appka používá, musí být někde definovaný (proměnná, funkce, parametr) nebo být globál prohlížeče.
//
// Proč (2026-11-23, CODE-tune, údržba; owner „zjistit, proč se jaký problém stal, a napravit ho“): za měsíc tři chyby u uživatelů
// téhož druhu — „tlacitkoNavstevnika is not defined“ (2026-11-01, runar-auth.js), „_loadingMotto is not defined“ (2026-11-16,
// runar-runa-dne.js) a „loadEl is not defined“ (2026-11-17 a 19, runar-tree.js: c61cc37 zrušil proměnné, dva řádky zůstaly → životní
// runa se po odpovědi serveru nezobrazila). Všechny tři našel až uživatel (ops_events client_error); žádná kontrola je neviděla, protože
// prohlížečové kontroly tu cestu (odpověď serveru, runa dne) neprojdou. Podle §30 to dělá stroj.
//
// Jak: parser acorn, který Node nese v sobě (--expose-internals; nic se nestahuje). Ze VŠECH v2/*.js a z inline skriptů a on*=""
// atributů v v2/*.html se sebere každé deklarované jméno (var/let/const, funkce, třída, parametry, catch, přiřazení do holého jména,
// window.X = …) — rozsahy se záměrně slévají, takže kontrola nehlídá stínování, jen jméno, které NEEXISTUJE NIKDE. Pak se projde
// každý odkaz na jméno (ne vlastnost a.b, ne klíč objektu, ne operand typeof); co není deklarované ani v GLOBALY, je nález.
// Neumí: jméno deklarované jen v jiném rozsahu (např. lokální proměnná jiné funkce stejného jména) — to by chtělo plnou analýzu rozsahů.
//
//   node scripts/verify_nedefinovane.js          kontrola
//   node scripts/verify_nedefinovane.js --test   samotest (podstrčené vady musí spadnout, správný kód projít)
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// acorn je v Node interně; bez --expose-internals se spustíme znovu s ním
let acorn, walk;
try {
  acorn = require('internal/deps/acorn/acorn/dist/acorn');
  walk = require('internal/deps/acorn/acorn-walk/dist/walk');
} catch (e) {
  if (process.execArgv.includes('--expose-internals')) { console.log('FAIL  acorn v Node není (' + e.message + ')'); process.exit(1); }
  const r = cp.spawnSync(process.execPath, ['--expose-internals', __filename, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(r.status == null ? 1 : r.status);
}

const ROOT = path.join(__dirname, '..');
const V2 = path.join(ROOT, 'v2');

// Globály prohlížeče a knihoven, které appka opravdu používá. Nové jméno sem jen s jistotou, že ho dává prohlížeč nebo načtená knihovna.
const GLOBALY = new Set((
  // jazyk a Node/prohlížeč společné
  Object.getOwnPropertyNames(globalThis).join(' ') + ' arguments undefined NaN Infinity ' +
  // prohlížeč
  'window self top parent document navigator location history screen localStorage sessionStorage indexedDB caches ' +
  'alert confirm prompt open close print getComputedStyle matchMedia requestAnimationFrame cancelAnimationFrame requestIdleCallback ' +
  'cancelIdleCallback innerWidth innerHeight outerWidth outerHeight scrollX scrollY pageXOffset pageYOffset devicePixelRatio ' +
  'visualViewport scrollTo scrollBy getSelection speechSynthesis SpeechSynthesisUtterance Audio Image Option ' +
  'HTMLElement HTMLCanvasElement HTMLInputElement HTMLAnchorElement Element Node NodeFilter NodeList Text DocumentFragment ' +
  'KeyboardEvent MouseEvent PointerEvent TouchEvent FocusEvent UIEvent InputEvent ErrorEvent PromiseRejectionEvent StorageEvent ' +
  'IntersectionObserver ResizeObserver MutationObserver DOMParser XMLSerializer FileReader FormData Notification PushManager ' +
  'ServiceWorkerRegistration CanvasRenderingContext2D OffscreenCanvas Path2D ImageData createImageBitmap DOMRect DOMMatrix ' +
  'XMLHttpRequest Response Request Headers CSS Option registration clients skipWaiting importScripts onerror onunhandledrejection ' +
  'ClipboardItem HTMLMediaElement MediaSource SourceBuffer webkitAudioContext AudioContext Worker SharedWorker MediaMetadata ' +
  // CommonJS export pro testy, vždy za `typeof module !== 'undefined'` (runar-payback-admin.js)
  'module ' +
  // knihovny načtené jako soubor (v2/vendor)
  'supabase'
).split(/\s+/).filter(Boolean));

function parse(code, soubor) {
  const o = { ecmaVersion: 'latest', allowReturnOutsideFunction: true, allowHashBang: true, locations: true };
  try { return acorn.parse(code, Object.assign({ sourceType: 'script' }, o)); }
  catch (e) { try { return acorn.parse(code, Object.assign({ sourceType: 'module' }, o)); } catch (e2) { throw new Error(soubor + ': ' + e.message); } }
}

function jmenaVzoru(p, out) {   // identifikátory ve vzoru deklarace (a, {a, b: c}, [a, ...b], a = 1)
  if (!p) return;
  if (p.type === 'Identifier') out.add(p.name);
  else if (p.type === 'ObjectPattern') p.properties.forEach((x) => jmenaVzoru(x.type === 'RestElement' ? x.argument : x.value, out));
  else if (p.type === 'ArrayPattern') p.elements.forEach((x) => jmenaVzoru(x, out));
  else if (p.type === 'RestElement') jmenaVzoru(p.argument, out);
  else if (p.type === 'AssignmentPattern') jmenaVzoru(p.left, out);
}

// Kousky kódu: celé .js soubory + inline <script> a on*="…" z HTML (onclick="toggleTierDesc()" — volá funkci, která musí existovat).
function kousky(soubory) {
  const out = [];
  for (const f of soubory) {
    const txt = fs.readFileSync(f, 'utf8'), jm = path.relative(ROOT, f).replace(/\\/g, '/');
    if (f.endsWith('.js')) { out.push({ jm, code: txt, radek0: 0 }); continue; }
    const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(txt))) if (!/type=["'](?:application\/ld\+json|text\/template|importmap)/i.test(m[0])) out.push({ jm, code: m[1], radek0: txt.slice(0, m.index).split('\n').length - 1 });
    // atributy jen mimo <script> (uvnitř bývají v šablonách JS: onclick="toggleFaq(${i})" v runar-help.html) — skript se zaslepí mezerami,
    // ať čísla řádků sedí
    const bezSkriptu = txt.replace(/<script[\s\S]*?<\/script>/gi, (s) => s.replace(/[^\n]/g, ' '));
    const ra = /\son[a-z]+\s*=\s*"([^"]*)"/g;
    while ((m = ra.exec(bezSkriptu))) out.push({ jm, code: m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'"), radek0: txt.slice(0, m.index).split('\n').length - 1, handler: true });
  }
  return out;
}

function zkontroluj(soubory) {
  const ks = kousky(soubory), deklar = new Set(), stromy = [];
  for (const k of ks) {
    const ast = parse(k.handler ? '(function(event){' + k.code + '\n})' : k.code, k.jm);
    stromy.push([k, ast]);
    walk.full(ast, (n) => {
      if (n.type === 'VariableDeclarator') jmenaVzoru(n.id, deklar);
      else if ((n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ClassDeclaration' || n.type === 'ClassExpression') && n.id) deklar.add(n.id.name);
      if (n.params) n.params.forEach((p) => jmenaVzoru(p, deklar));
      if (n.type === 'CatchClause' && n.param) jmenaVzoru(n.param, deklar);
      if (n.type === 'ImportSpecifier' || n.type === 'ImportDefaultSpecifier' || n.type === 'ImportNamespaceSpecifier') deklar.add(n.local.name);
      if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier') deklar.add(n.left.name);   // implicitní globál (ne-strict)
      if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && !n.left.computed && n.left.object.type === 'Identifier'
          && (n.left.object.name === 'window' || n.left.object.name === 'self' || n.left.object.name === 'globalThis')) deklar.add(n.left.property.name);
    });
  }
  const nalezy = [];
  for (const [k, ast] of stromy) {
    walk.fullAncestor(ast, (n, _st, anc) => {
      if (n.type !== 'Identifier') return;
      const p = anc[anc.length - 2];
      if (!p) return;
      if (p.type === 'MemberExpression' && p.property === n && !p.computed) return;
      if ((p.type === 'Property' || p.type === 'MethodDefinition' || p.type === 'PropertyDefinition') && p.key === n && !p.computed && !(p.shorthand && p.value === n)) return;
      if ((p.type === 'LabeledStatement' || p.type === 'BreakStatement' || p.type === 'ContinueStatement') && p.label === n) return;
      if (p.type === 'UnaryExpression' && p.operator === 'typeof') return;
      if (p.type === 'MetaProperty' || p.type === 'ExportSpecifier' || p.type === 'ImportSpecifier') return;
      if (deklar.has(n.name) || GLOBALY.has(n.name)) return;
      const radek = k.radek0 + (n.loc ? n.loc.start.line - (k.handler ? 0 : 0) : 0);
      nalezy.push(k.jm + ':' + radek + '  ' + n.name);
    });
  }
  return nalezy;
}

function soubory() {
  return fs.readdirSync(V2).filter((f) => /\.(js|html)$/.test(f) && f !== 'sw.js').map((f) => path.join(V2, f));
}

if (process.argv.includes('--test')) {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'nedef-'));
  const zapis = (jm, t) => { const f = path.join(tmp, jm); fs.writeFileSync(f, t); return f; };
  const a = zapis('a.js', "var x = 1; function f(y) { if (typeof zz === 'undefined') return y + x; return window.innerWidth; }\nwindow.g = 1; h = 2;\n");
  const pripady = [
    ['správný kód', [a, zapis('b.js', 'f(x); g; h; var o = { k: 1 }; o.k; try {} catch (e) { e; }\n')], 0],
    ['zrušená proměnná (loadEl, 2026-11-17)', [a, zapis('c.js', 'function q() { if (loadEl) loadEl.style.display = "none"; }\n')], 2],
    ['funkce, která nikde není (tlacitkoNavstevnika, 2026-11-01)', [a, zapis('d.js', 'setTimeout(function () { tlacitkoNavstevnika(); });\n')], 1],
    ['onclick volá neexistující funkci', [a, zapis('e.html', '<button onclick="zmizela();f(1)">x</button>\n')], 1],
    ['vlastnost, klíč objektu a typeof nejsou odkazy', [a, zapis('g.js', 'var o = { nic: 1 }; o.nic2; typeof nic3;\n')], 0],
  ];
  let spatne = 0;
  for (const [popis, fs_, cek] of pripady) {
    const n = zkontroluj(fs_).length;
    if (n !== cek) { spatne++; console.log('FAIL  samotest: ' + popis + ' — nálezů ' + n + ', čekáno ' + cek); }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  if (spatne) process.exit(1);
  console.log('OK    samotest nedefinovaných jmen: ' + pripady.length + ' případů');
  process.exit(0);
}

let nalezy;
try { nalezy = zkontroluj(soubory()); }
catch (e) { console.log('FAIL  nedefinovaná jména: soubor nejde rozebrat — ' + e.message); process.exit(1); }
if (nalezy.length) {
  console.log('FAIL  nedefinovaná jména v appce: ' + nalezy.length + ' — u uživatele by spadlo „X is not defined“');
  nalezy.slice(0, 40).forEach((x) => console.log('       ' + x));
  process.exit(1);
}
console.log('OK    nedefinovaná jména: každý odkaz v v2/*.js a v inline skriptech a on*="" v2/*.html má deklaraci nebo je globál prohlížeče');
