// Smoke ㉻ — runy v appce kreslí NAŠE SVG, ne písmo (CLAUDE.md §5). KUKY 2026-10-10, bod 11: „nahradit našimi glyfy“ — Cormorant runy
// nemá, prohlížeč půjčoval cizí písmo a runa v okně Safn rúna, v popiscích („ᚠ DRAW YOUR RUNE“, „ᚲ LET THE RUNES DECIDE“, „ᚢ HEAR
// RÚNAR SPEAK“) i v oknech (ᛏ, ᚾ) vypadala divně. Owner to musel najít sám; tahle kontrola je, aby se to nevrátilo.
//
// Hlídá dvě plochy:
//  1. Klíče UI_TEXT, jejichž text začíná runou (kromě značky ᚱ), smí do stránky jen přes setRuneText (runar-utils.js). Řádek v JS
//     readeru, který takový klíč čte (t('x') / tp('x')) a nevolá setRuneText, je chyba — setText ani textContent runu nepřekreslí.
//  2. Stránky readeru (runar-reader.html, runar-help.html, runar-privacy.html) bez HTML komentářů: žádná runa písmem kromě ᚱ.
//     Runa do okna patří přes data-rune-glyph (vyplní setRuneText při startu, runar-app.js).
// Mimo: shrine (admin) a jeho JS — popisky teach_* a hlas tam runu písmem zatím mají (RUNAR_BACKLOG.md, „Kontrola návštěvníka“).
// Neumí: volání rozdělené na víc řádků (setRuneText( na jednom, t('x') na dalším) — dnes žádné není; runu poskládanou v JS jinak
// než z UI_TEXT. Spuštění: node scripts/verify_rune_glyphs.js [--test]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const V2 = path.join(__dirname, '..', 'v2');
const RUNA = /[ᚠ-᛿]/;
const ZNACKA = 'ᚱ';   // ᚱ — značka Rúnara, písmem smí (§5)
const JS_READERU = ['runar-utils.js', 'runar-app.js', 'runar-reading.js', 'runar-auth.js', 'runar-tree.js', 'runar-journal.js',
  'runar-helper.js', 'runar-reporter.js', 'runar-rune-popup.js'];
const STRANKY = ['runar-reader.html', 'runar-help.html', 'runar-privacy.html'];

function nactiUiText() {
  const S = { console }; S.window = S; vm.createContext(S);
  vm.runInContext(fs.readFileSync(path.join(V2, 'runar-config.js'), 'utf8') + '\n;\n' +
    fs.readFileSync(path.join(V2, 'runar-translations.js'), 'utf8') + '\n;\n', S);
  return vm.runInContext('UI_TEXT', S);
}
function kliceSRunou(U) {
  const k = new Set();
  for (const l of Object.keys(U)) for (const [key, val] of Object.entries(U[l] || {})) {
    if (typeof val === 'string' && val.length && RUNA.test(val[0]) && val[0] !== ZNACKA) k.add(key);
  }
  return k;
}
function kontrolaJs(src, soubor, K) {
  const chyby = [];
  src.split('\n').forEach((radek, i) => {
    if (radek.trim().startsWith('//')) return;
    const re = /\btp?\(\s*'([^']+)'/g; let m;
    while ((m = re.exec(radek))) {
      if (K.has(m[1]) && !/setRuneText\(/.test(radek)) chyby.push(soubor + ':' + (i + 1) + '  ' + m[1] + ' bez setRuneText → ' + radek.trim().slice(0, 110));
    }
  });
  return chyby;
}
function kontrolaHtml(src, soubor) {
  const chyby = [];
  const bez = src.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' '));   // komentáře pryč, čísla řádků zůstanou
  bez.split('\n').forEach((radek, i) => {
    for (const ch of radek) {
      if (RUNA.test(ch) && ch !== ZNACKA) {
        chyby.push(soubor + ':' + (i + 1) + '  ' + ch + ' U+' + ch.codePointAt(0).toString(16).toUpperCase() + ' písmem → ' + radek.trim().slice(0, 100));
        break;
      }
    }
  });
  return chyby;
}

if (process.argv.includes('--test')) {
  // Životní cyklus kontroly: špatné musí padnout, dobré projít (memory guard-test-the-lifecycle).
  const K = new Set(['k1']);
  const pripady = [
    ['js: setText s klíčem s runou', kontrolaJs("  setText('x', t('k1'));", 'a.js', K).length === 1],
    ['js: textContent s tp()', kontrolaJs("  el.textContent = tp('k1', { a: 1 });", 'a.js', K).length === 1],
    ['js: setRuneText projde', kontrolaJs("  setRuneText('x', t('k1'));", 'a.js', K).length === 0],
    ['js: komentář projde', kontrolaJs("  // setText('x', t('k1'))", 'a.js', K).length === 0],
    ['js: klíč bez runy projde', kontrolaJs("  setText('x', t('k2'));", 'a.js', K).length === 0],
    ['html: runa písmem padne', kontrolaHtml('<div>ᚠ DRAW</div>', 'a.html').length === 1],
    ['html: runa v komentáři projde', kontrolaHtml('<!-- ᚠ -->\n<div>x</div>', 'a.html').length === 0],
    ['html: značka ᚱ projde', kontrolaHtml('<div>ᚱ</div>', 'a.html').length === 0],
    ['klíče: najde runu na začátku, ᚱ ne', (() => { const k = kliceSRunou({ en: { a: 'ᚠ X', b: 'ᚱ Y', c: 'Z ᚠ' } }); return k.has('a') && !k.has('b') && !k.has('c'); })()],
  ];
  const spatne = pripady.filter((p) => !p[1]);
  if (spatne.length) { spatne.forEach((p) => console.log('FAIL test: ' + p[0])); process.exit(1); }
  console.log('OK    test kontroly run písmem: ' + pripady.length + ' případů (zachytí i pustí)');
  process.exit(0);
}

const U = nactiUiText();
const K = kliceSRunou(U);
let chyby = [];
for (const f of JS_READERU) chyby = chyby.concat(kontrolaJs(fs.readFileSync(path.join(V2, f), 'utf8'), f, K));
for (const f of STRANKY) chyby = chyby.concat(kontrolaHtml(fs.readFileSync(path.join(V2, f), 'utf8'), f));
if (chyby.length) {
  chyby.forEach((c) => console.log('  ' + c));
  console.log('FAIL  runy písmem: ' + chyby.length + ' míst — runa patří přes setRuneText / data-rune-glyph (naše SVG, §5)');
  process.exit(1);
}
console.log('OK    runy písmem: ' + K.size + ' klíčů s runou jde jen přes setRuneText · ' + STRANKY.length + ' stránky readeru bez run písmem (mimo ᚱ)');
