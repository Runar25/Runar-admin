// Smoke ㉻ — runy v appce kreslí NAŠE SVG, ne písmo (CLAUDE.md §5). KUKY 2026-10-10, bod 11: „nahradit našimi glyfy“ — Cormorant runy
// nemá, prohlížeč půjčoval cizí písmo a runa v okně Safn rúna, v popiscích („ᚠ DRAW YOUR RUNE“, „ᚲ LET THE RUNES DECIDE“, „ᚢ HEAR
// RÚNAR SPEAK“) i v oknech (ᛏ, ᚾ) vypadala divně. Owner to musel najít sám; tahle kontrola je, aby se to nevrátilo.
//
// Hlídá tři plochy:
//  1. Klíče UI_TEXT, jejichž text začíná runou (kromě značky ᚱ), smí do stránky jen přes setRuneText (runar-utils.js). Řádek v JS
//     readeru i shrine, který takový klíč čte (t('x') / tp('x') / tUI('x')) a nevolá setRuneText, je chyba — setText ani textContent runu
//     nepřekreslí.
//  2. Stránky (reader, nápověda, soukromí, shrine) bez HTML komentářů: žádná runa písmem kromě ᚱ. Runa do okna patří přes data-rune-glyph
//     (vyplní setRuneText při startu — runar-app.js, ve shrine jeho start).
//  3. Runa skládaná do textu z dat runy (`${r.g}`, `+ r.g`, `textContent = r.g`) bez runeSvg / setRuneText — v JS readeru, adminů i shrine.
//     A runa z DB (`esc(r.rune_glyph)`, `${e.rune_glyph}`): smí být jen záloha pro runu, kterou RUNES nezná — runeSvg musí stát na témž
//     nebo do dvou řádků níž (vzor deníku). Tak se schovávala v prohlížeči čtení ve shrine (do 2026-10-11).
//  4. Shrine nenačítá runar-reader.css, a tak nese ZRCADLO tří pravidel .lbl-rune (velikost runy v popisku). Rozejdou-li se, FAIL (§20).
// Shrine a jeho skripty od 2026-10-11 (do té doby „Mimo: shrine — popisky teach_* a hlas tam runu písmem zatím mají“; BACKLOG „Journal
// SPREAD historie … zbývá: shrine obchází runeSvg“, owner „jeď ty tři chyby“). Prompty (runar-character.js) nehlídá — runa v textu pro model
// je správně. Neumí: volání rozdělené na víc řádků (setRuneText( na jednom, t('x') na dalším) — dnes žádné není.
// Spuštění: node scripts/verify_rune_glyphs.js [--test]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const V2 = path.join(__dirname, '..', 'v2');
const RUNA = /[ᚠ-᛿]/;
const ZNACKA = 'ᚱ';   // ᚱ — značka Rúnara, písmem smí (§5)
const JS_READERU = ['runar-utils.js', 'runar-app.js', 'runar-reading.js', 'runar-auth.js', 'runar-tree.js', 'runar-journal.js',
  'runar-helper.js', 'runar-reporter.js', 'runar-rune-popup.js'];
const JS_ADMIN = ['runar-readings-admin.js', 'runar-reports-admin.js', 'runar-voice-admin.js', 'runar-testers-admin.js'];
const STRANKY = ['runar-reader.html', 'runar-help.html', 'runar-privacy.html', 'runar-shrine.html'];

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
    const re = /\b(?:tp?|tUI)\(\s*'([^']+)'/g; let m;
    while ((m = re.exec(radek))) {
      if (K.has(m[1]) && !/setRuneText\(/.test(radek)) chyby.push(soubor + ':' + (i + 1) + '  ' + m[1] + ' bez setRuneText → ' + radek.trim().slice(0, 110));
    }
  });
  return chyby;
}
// Runa poskládaná z dat runy (r.g) do textu nebo HTML — písmem, pokud ji nepřevede runeSvg / setRuneText. `rune_glyph:` je zápis do DB.
function kontrolaDyn(src, soubor) {
  const chyby = [];
  const radky = src.split('\n');
  radky.forEach((radek, i) => {
    const t = radek.trim();
    if (t.startsWith('//')) return;
    if (/(\$\{\s*\w+\.g\s*\}|\+\s*\w+\.g\b|\b\w+\.g\s*\+|textContent\s*=\s*\w+\.g\b)/.test(radek) && !/runeSvg|setRuneText|rune_glyph:/.test(radek))
      chyby.push(soubor + ':' + (i + 1) + '  runa z dat písmem → ' + t.slice(0, 110));
    // Runa z DB do HTML: jen jako záloha vedle runeSvg (týž řádek nebo dva pod ním).
    if (/\b(?:esc|escapeHtml)\([^)]*\brune_glyph\b|\$\{[^}]*\brune_glyph\b[^}]*\}/.test(radek) && !radky.slice(i, i + 3).some(r => /runeSvg/.test(r)))
      chyby.push(soubor + ':' + (i + 1) + '  runa z DB (rune_glyph) písmem bez runeSvg → ' + t.slice(0, 110));
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

// Zrcadlo .lbl-rune: tatáž tři pravidla v runar-reader.css a ve shrine, bajt po bajtu (konce řádků sjednocené).
const ZRCADLO = ['.lbl-rune{', '.lbl-rune .rune-svg{', '.lbl-rune .rune-svg path{'];
function kontrolaZrcadla(css, shrine) {
  const pravidla = (src) => { const t = '\n' + src.replace(/\r\n/g, '\n');
    return ZRCADLO.map((sel) => { const i = t.indexOf('\n' + sel); return i < 0 ? null : t.slice(i + 1, t.indexOf('}', i) + 1); }); };
  const a = pravidla(css), b = pravidla(shrine);
  const zle = ZRCADLO.filter((sel, k) => a[k] === null || a[k] !== b[k]);
  return zle.length ? ['runar-shrine.html: zrcadlo ' + zle.join(' · ') + ' se rozešlo s runar-reader.css (nebo chybí) — zkopíruj pravidlo z CSS'] : [];
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
    ['js: tUI ve shrine bez setRuneText padne', kontrolaJs("  btn.textContent = tUI('k1');", 's.html', K).length === 1],
    ['js: tUI přes setRuneText projde', kontrolaJs("  setRuneText(btn, tUI('k1'));", 's.html', K).length === 0],
    ['dyn: ${r.g} do textContent padne', kontrolaDyn("  el.textContent = `${r.g} ${r.n}`;", 'a.js').length === 1],
    ['dyn: + r.g padne', kontrolaDyn("  el.textContent = x + r.g;", 'a.js').length === 1],
    ['dyn: přes setRuneText projde', kontrolaDyn("  setRuneText(el, `${r.g} ${r.n}`);", 'a.js').length === 0],
    ['dyn: zápis rune_glyph: do DB projde', kontrolaDyn("  rune_glyph: r.g,", 'a.js').length === 0],
    ['dyn: porovnání x.g === g projde', kontrolaDyn("  if (x.g === g) return x;", 'a.js').length === 0],
    ['dyn: esc(r.rune_glyph) bez runeSvg padne', kontrolaDyn("  var glyph = esc(r.rune_glyph || 'x');", 'a.js').length === 1],
    ['dyn: ${e.rune_glyph} bez runeSvg padne', kontrolaDyn("  el.innerHTML = `${e.rune_glyph} ${e.rune_name}`;", 'a.js').length === 1],
    ['zrcadlo: shodné projde', kontrolaZrcadla('.lbl-rune{a}\n.lbl-rune .rune-svg{b}\n.lbl-rune .rune-svg path{c}', '<style>\r\n.lbl-rune{a}\r\n.lbl-rune .rune-svg{b}\r\n.lbl-rune .rune-svg path{c}').length === 0],
    ['zrcadlo: jiná výška ve shrine padne', kontrolaZrcadla('.lbl-rune{a}\n.lbl-rune .rune-svg{b}\n.lbl-rune .rune-svg path{c}', '.lbl-rune{a}\n.lbl-rune .rune-svg{X}\n.lbl-rune .rune-svg path{c}').length === 1],
    ['zrcadlo: chybí ve shrine padne', kontrolaZrcadla('.lbl-rune{a}\n.lbl-rune .rune-svg{b}\n.lbl-rune .rune-svg path{c}', '<style></style>').length === 1],
    ['dyn: rune_glyph jako záloha, runeSvg o dva řádky níž, projde', kontrolaDyn("  const glyph = escapeHtml(e.rune_glyph || 'x');\n  const _jr = null;\n  const h = _jr ? runeSvg(_jr) : glyph;", 'a.js').length === 0],
  ];
  const spatne = pripady.filter((p) => !p[1]);
  if (spatne.length) { spatne.forEach((p) => console.log('FAIL test: ' + p[0])); process.exit(1); }
  console.log('OK    test kontroly run písmem: ' + pripady.length + ' případů (zachytí i pustí)');
  process.exit(0);
}

const U = nactiUiText();
const K = kliceSRunou(U);
let chyby = [];
for (const f of JS_READERU.concat(JS_ADMIN, ['runar-shrine.html'])) {
  const src = fs.readFileSync(path.join(V2, f), 'utf8');
  chyby = chyby.concat(kontrolaJs(src, f, K), kontrolaDyn(src, f));
}
for (const f of STRANKY) chyby = chyby.concat(kontrolaHtml(fs.readFileSync(path.join(V2, f), 'utf8'), f));
chyby = chyby.concat(kontrolaZrcadla(fs.readFileSync(path.join(V2, 'runar-reader.css'), 'utf8'), fs.readFileSync(path.join(V2, 'runar-shrine.html'), 'utf8')));
if (chyby.length) {
  chyby.forEach((c) => console.log('  ' + c));
  console.log('FAIL  runy písmem: ' + chyby.length + ' míst — runa patří přes setRuneText / data-rune-glyph (naše SVG, §5)');
  process.exit(1);
}
console.log('OK    runy písmem: ' + K.size + ' klíčů s runou jde jen přes setRuneText · ' + STRANKY.length + ' stránky (vč. shrine) bez run písmem (mimo ᚱ) · runa z dat jen přes runeSvg / setRuneText · zrcadlo .lbl-rune ve shrine sedí');
