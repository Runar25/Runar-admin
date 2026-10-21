// build_prompt_skladani.js — vyrobí supabase/functions/_shared/prompt_skladani.mjs: skládání promptu pro server (claude-proxy).
//
// Proč (owner 2026-10-15 „9. beru“, DECISIONS 2026-10-15 (2); 2026-10-21 „ok začni“): prompt se dnes skládá v prohlížeči, takže
// celý Rúnarův hlas (buildery, RUNE_IMAGES, RP_*) je veřejný a přihlášený člověk může proxy poslat libovolný prompt. Krok 1 plánu
// infrastruktury = prompt na server. Balíček je TÝŽ kód jako v appce (§18 — žádná druhá kopie builderů): pět souborů z v2/ se vloží
// do jedné funkce, která dostane náhodu, úložiště a jazyk zvenku. Pro stejné vstupy a stejný los dá server bajtově stejný prompt
// jako prohlížeč (ověřuje verify_prompt_skladani.js proti golden otisku).
//
// GENEROVANÝ soubor — needitovat; po změně kteréhokoli zdrojového souboru pusť znovu. Že je aktuální, hlídá verify_prompt_skladani.js.
//   node scripts/build_prompt_skladani.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SOUBORY = ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'];
const CIL = path.join(ROOT, 'supabase', 'functions', '_shared', 'prompt_skladani.mjs');

// Co z balíčku smí ven: buildery promptu a data, která k nim server potřebuje (výčet jmen = jediné místo).
const VEN = ['buildSysPrompt', 'buildReadingPrompt', 'buildNornsPrompt', 'buildKrizPrompt', 'buildHorseshoePrompt', 'buildYggdrasilPrompt',
  'buildLifeRunePrompt', 'buildAskPrompt', 'buildNameLorePrompt', 'getCorrPrompt', 'normalizeCorrections', 'RUNES', 'SPREAD_CONFIG',
  'INTENTIONS', 'READING_ANGLES', 'READING_ANGLES_IS'];

// cti(f) = obsah v2/<f>; výchozí z pracovního stromu, pre-commit předá čtení z indexu (git show :v2/<f>).
function vyrob(cti) {
  cti = cti || ((f) => fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8'));
  // konce řádků na LF: pracovní strom má někde CRLF (autocrlf), git LF — balíček musí vyjít stejně z obojího
  const zdroj = SOUBORY.map((f) => '/* ===== v2/' + f + ' ===== */\n' + cti(f).replace(/\r\n/g, '\n')).join('\n;\n');
  return '// GENEROVANÝ soubor (scripts/build_prompt_skladani.js) — needitovat. Zdroj: v2/' + SOUBORY.join(', v2/') + '.\n'
    + '// Skládání promptu na serveru: vytvorSkladani(prostredi) vrátí buildery nad čerstvým stavem (jazyk, náhoda, úložiště).\n'
    + 'export function vytvorSkladani(P) {\n'
    + '  P = P || {};\n'
    + '  var Math = Object.create(globalThis.Math); Math.random = P.random || globalThis.Math.random;\n'
    + '  var Date = P.Date || globalThis.Date;\n'
    + '  var _uloz = {};\n'
    + '  var localStorage = P.uloziste || { getItem: function (k) { return k in _uloz ? _uloz[k] : null; },\n'
    + '    setItem: function (k, v) { _uloz[k] = String(v); }, removeItem: function (k) { delete _uloz[k]; } };\n'
    + '  var sessionStorage = localStorage;\n'
    + '  var document = { getElementById: function () { return null; }, querySelector: function () { return null; },\n'
    + '    querySelectorAll: function () { return []; }, createElement: function () { return { style: {}, classList: { add: function () {},\n'
    + '    remove: function () {}, toggle: function () {} }, appendChild: function () {} }; } };\n'
    + '  var window = {}; var self = window; var navigator = { language: \'en\' };\n'
    + '  var setTimeout = function () { return 0; }; var clearTimeout = function () {};\n'
    + '  var lang = P.lang || \'en\', userGender = P.userGender || \'hk\', corrections = P.corrections || [], currentUser = P.currentUser || null,\n'
    + '    userName = P.userName || \'\';\n'
    + zdroj + '\n;\n'
    + '  if (P.engine) READ_ENGINE = P.engine;\n'
    + '  return { ' + VEN.map((n) => n + ': ' + n).join(', ') + ',\n'
    + '    nastav: function (k, v) { if (k === \'lang\') lang = v; else if (k === \'userGender\') userGender = v; else if (k === \'engine\') READ_ENGINE = v;\n'
    + '      else if (k === \'userName\') userName = v; else if (k === \'currentUser\') currentUser = v; else if (k === \'corrections\') corrections = v;\n'
    + '      else if (k === \'pin\') IMG_PIN = v || null; else if (k === \'posledni\') _imgServerLast = v || {}; } };\n'
    + '}\n';
}

if (require.main === module && process.argv.includes('--z-indexu')) {
  // pre-commit: zdroje z indexu, výsledek na stdout (hook ho uloží do indexu i do pracovního stromu)
  const { execFileSync } = require('child_process');
  process.stdout.write(vyrob((f) => execFileSync('git', ['show', ':v2/' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })));
} else if (require.main === module) {
  fs.writeFileSync(CIL, vyrob(), 'utf8');
  console.log('OK  ' + path.relative(ROOT, CIL) + ' (' + Math.round(fs.statSync(CIL).size / 1024) + ' KB)');
}
module.exports = { vyrob, CIL, SOUBORY };
