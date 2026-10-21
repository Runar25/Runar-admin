// CODE-read 2026-10-21 — Vegvísir: rameno = vytažená runa × MÍSTO (DECISIONS 2026-10-21 (5)). Owner: „pusť test teď“ — čtení píše CODE-read
// sám v konverzaci (Opus 5.5, EN), ne přes API (owner: „tady na 5.5 v EN, uvidíme, jak to bude sedět, tak teprve testy jinde na API“).
// Hypotéza: místo bez vlastního významu nechá vést runu. Riziko: téma balíčku (The Ties = Gebo, Thresholds = přechod, Under the Mountain = skryté)
// přetáhne čtení jako 2026-09-27 (Gebo 3/4, cesta se středem 0/4). Obrácená páka: totéž místo S otázkou balíčku (A = bez, B = s otázkou).
// Prompt = lab 2026-09-27 spektrum.js v3 (EN, bez středu), jen místo věty uživatele stojí karta místa. Systém = produkční buildSysPrompt EN.
//   node misto.js            vypíše systém (zkrácený) a 18 promptů ramene
'use strict';
const fs = require('fs'), vm = require('vm');
const V = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = 'en';
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) vm.runInContext(fs.readFileSync(V + f, 'utf8') + '\n;\n', S);
const K = (n) => vm.runInContext('RUNES.filter(function(r){return r.n===' + JSON.stringify(n) + ';})[0].k', S);
// Runy předem, mimo témata balíčků (žádná Gebo / Raidho / Ehwaz / Dagaz / Perth / Kenaz): led, bohatství, slunce.
const RUNY = ['Isa', 'Fehu', 'Sowilo'];
const MISTA = [   // [balíček, karta místa (jen prostředí a okamžik), otázka balíčku z návrhu]
  ['Thresholds', 'A narrow footbridge over a glacial river, halfway across.', 'What am I leaving, and what does not yet have a shape?'],
  ['Under the Mountain', 'A forge inside a cave, the fire banked under ash.', 'What already exists, even though I cannot see it yet?'],
  ['The Ties', 'A rope stretched between two banks of a river.', 'What is forming between us, what are we passing to each other, what binds us?'],
];
function noCold() {
  const t = vm.runInContext('_noColdRead("en")', S);
  if (t.split('Describe the image;').length !== 2) throw new Error('noCold kotva');
  return t.replace('Describe the image;', 'Describe what happens in this place;');
}
function prompt(runa, misto, otazka) {
  return [
    'VEGVÍSIR — the seeker is on their way.',
    'DRAWN RUNE: ' + runa + ' — ' + K(runa) + '.',
    'The place on their way: "' + misto + '"',
    otazka ? 'The question of this place: "' + otazka + '"' : null,
    'Answer as Rúnar in about 90 words, one flowing paragraph of prose. The place is the only picture — stay inside it. Never end on what it means for them or on what they should do; leave it open.',
    noCold(),
  ].filter(Boolean).join('\n');
}
module.exports = { RUNY, MISTA, prompt, K };
if (require.main === module) {
  const sys = vm.runInContext('buildSysPrompt(null, "en")', S);
  console.log('SYSTEM (' + sys.length + ' znaků):\n' + sys + '\n=====');
  for (const r of RUNY) for (const [b, m, q] of MISTA) for (const v of ['A', 'B'])
    console.log('\n### ' + r + ' × ' + b + ' × ' + v + '\n' + prompt(r, m, v === 'B' ? q : null));
}
