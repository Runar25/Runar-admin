// Rozpoznání zakládání musí číst vlastnost, kterou volající SKUTEČNĚ posílá.
//
// 2026-07-19: `_isFounding` četlo `o.mode`, jenže `_generateNornsReading()` posílá objekt
// `{ runes, min, buildPrompt, tokens, credits, outputId, outId, lblId, kind:'NORNS' }` —
// žádný `mode` tam není. Výraz byl proto **vždy false** a zakládání stromu se nespustilo
// ani jednou. Nic nespadlo, nic se nezalogovalo: uživatel klikl na „ROOT YOUR TREE",
// dostal běžné placené Norny a zaplatil je. Odhalilo to až `tree_founded_at = NULL` v DB.
//
// Vznik chyby stojí za pojmenování: `mode: 'norns'` v tom souboru EXISTUJE — v úplně jiném
// objektu (`_SPREAD_SLOT_CFG`) o pár set řádků výš. Sáhl jsem po tvaru, který jsem v souboru
// viděl, místo po tom, který se na tomhle místě předává. JS na to neupozorní: čtení
// neexistující vlastnosti je `undefined`, ne chyba.
//
// Kontrola je ZÁMĚRNĚ ÚZKÁ: hlídá tuhle jednu dvojici. Obecné „čteš vlastnost, kterou nikdo
// nenastavuje" by chtělo typový systém, ne grep — a předstírat, že to umím, by bylo horší.
//
//   node scripts/verify_founding_flag.js
const fs = require('fs');
const SRC = 'C:/Users/zkuku/Downloads/Runar-admin/v2/runar-reading.js';
const s = fs.readFileSync(SRC, 'utf8');

// 1) jakou vlastnost rozpoznání zakládání čte?
const read = s.match(/_isFounding\s*=\s*\(\s*o\.(\w+)\s*===\s*'([^']+)'/);
if (!read) {
  console.log('FAIL  nenašel jsem výraz `_isFounding = (o.<vlastnost> === ...)` — změnil se tvar?');
  process.exit(1);
}
const [, prop, expected] = read;

// 2) co posílá _generateNornsReading()?
const fn = s.match(/function _generateNornsReading\s*\(\)\s*\{[\s\S]*?\n\}/);
if (!fn) {
  console.log('FAIL  _generateNornsReading() v runar-reading.js není — přejmenovalo se?');
  process.exit(1);
}
const body = fn[0];

// 3) je ta vlastnost v předávaném objektu, a se správnou hodnotou?
const setRe = new RegExp('\\b' + prop + '\\s*:\\s*\'([^\']*)\'');
const set = body.match(setRe);

if (!set) {
  console.log('FAIL  runar-reading.js  _isFounding čte `o.' + prop + '`, ale _generateNornsReading()');
  console.log('      tuhle vlastnost NEPOSÍLÁ → výraz je vždy false a zakládání se nikdy nespustí.');
  console.log('      Posílá: ' + (body.match(/\b(\w+)\s*:/g) || []).map(x => x.replace(/\s*:$/, '')).join(', '));
  process.exit(1);
}

if (set[1] !== expected) {
  console.log('FAIL  runar-reading.js  _isFounding čeká `o.' + prop + " === '" + expected +
              "'`, ale posílá se '" + set[1] + "'.");
  process.exit(1);
}

console.log('OK    zakládání: _isFounding čte `o.' + prop + "` a _generateNornsReading() ho posílá ('" + set[1] + "').");
process.exit(0);
