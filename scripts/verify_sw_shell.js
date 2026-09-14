// ㉧ SW PRECACHE = VŠECHNO, CO READER NAČÍTÁ, A ČERSTVÉ (obchvat HTTP cache).
//
// PROČ: 2026-09-14, nalezeno ŽIVĚ při ověřování meaning-tapu. Dvě vady najednou:
//  1. JS_SHELL v sw.js nenesl 7 souborů, které runar-reader.html načítá (names, registry,
//     reporter, rune-popup, tree-prod, branch, trunk) — fetch handler je ukládal až za běhu.
//  2. Instalace (`c.addAll(JS_SHELL)`) i ten běhový fetch jdou PŘES HTTP CACHE prohlížeče
//     (GitHub Pages max-age=600) — nový worker si tak uložil STARÉ byty pod novou verzi:
//     cache `runar-v398` prokazatelně nesla runar-rune-popup.js bez `_kwExpand`.
// Výsledek: bump verze negarantoval čerstvý kód. Kontrola drží obojí.
//
// CO SE TU TVRDÍ: (a) každý lokální <script src> a runar-reader.css z runar-reader.html je
// v JS_SHELL; (b) instalace staví Requesty s {cache:'reload'}. Bod (b) je kontrola TVARU
// (chování cache nejde v nodu protlačit) — důvod, proč tu smí být: chybění té značky je
// přesně vada, která se 2026-09-14 projevila na produkci, a jiná plocha na ni není (§19.3).
//
//   node scripts/verify_sw_shell.js
const fs = require('fs');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';

let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('  ✓ ' + popis); else { fail++; console.log('  ✗ ' + popis); } };

const html = fs.readFileSync(D + 'runar-reader.html', 'utf8');
const sw = fs.readFileSync(D + 'sw.js', 'utf8');

// Lokální soubory, které HTML načítá (skripty + hlavní CSS; ne CDN).
const nacita = [];
for (const m of html.matchAll(/src="([^"]+\.js)"/g)) if (!/^https?:/.test(m[1])) nacita.push(m[1]);
for (const m of html.matchAll(/href="([^"]+\.css)"/g)) if (!/^https?:/.test(m[1])) nacita.push(m[1]);

// JS_SHELL ze sw.js.
const mShell = sw.match(/const JS_SHELL = \[([\s\S]*?)\];/);
rekni(!!mShell, 'sw.js má JS_SHELL');
const shell = mShell ? [...mShell[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];

const chybi = nacita.filter((f) => !shell.some((s) => s.endsWith('/' + f)));
rekni(!chybi.length, 'každý soubor z runar-reader.html je v precache (' + nacita.length + ' souborů)'
      + (chybi.length ? ' — CHYBÍ: ' + chybi.join(', ') : ''));

// Duplikáty a mrtvé položky (soubor v seznamu, který neexistuje) — obojí tichá past.
const dvakrat = shell.filter((x, i) => shell.indexOf(x) !== i);
rekni(!dvakrat.length, 'v precache nic dvakrát' + (dvakrat.length ? ' — ' + dvakrat.join(', ') : ''));
const mrtve = shell.filter((s) => {
  const rel = s.replace('/Runar-admin/v2/', '');
  try { fs.accessSync(D + rel); return false; } catch (e) { return true; }
});
rekni(!mrtve.length, 'každá položka precache existuje na disku — addAll je vše-nebo-nic, mrtvý soubor by instalaci celou shodil'
      + (mrtve.length ? ' — MRTVÉ: ' + mrtve.join(', ') : ''));

rekni(/addAll\(JS_SHELL\.map\(u => new Request\(u, \{ cache: 'reload' \}\)\)\)/.test(sw),
      "instalace jde s {cache:'reload'} — jinak si nový worker uloží staré byty z HTTP cache");

console.log('');
if (fail) { console.log('FAIL — ' + fail + ' kontrol precache neprošlo.'); process.exit(1); }
console.log('OK    SW precache: úplný proti readeru (' + shell.length + ' položek) a instalace obchází HTTP cache.');
