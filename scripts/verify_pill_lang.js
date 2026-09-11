// §19 seed-and-assert: pilulky (oblast / cesta / záměr) musí po přepnutí jazyka držet TUTÉŽ
// volbu, jen v nové řeči.
//
// 2026-09-11. Pilulky si ukládají LOKALIZOVANÝ POPISEK, ne index (`readerUser.area = label`
// v runar-app.js). Po přepnutí jazyka se proto rozešly dvě věci a ANI JEDNA nespadla:
//   1. pilulka se vykreslila jako NEVYBRANÁ — `label === current` už nesedí,
//   2. ale hodnota žít nepřestala a došla až do promptu, takže islandské čtení dostalo
//      řádku „Svið: Career & Creativity" (porušení §2 doručené modelu).
// Tichá chyba přesně toho druhu, co popisuje §19: tvar kódu byl celou dobu v pořádku.
//
// Kontrola běží na VÝSLEDKU (co zůstane v `readerUser` po `buildPills()`), ne na tom, že
// `_syncPillLang` existuje — jinak by ji obešlo přejmenování nebo vyřazení volání.
//
//   node scripts/verify_pill_lang.js
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';

const retez = new Proxy(function () {}, { get: () => retez, apply: () => retez });
const sandbox = {
  Math, JSON, Date, console,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  document: {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener: () => {}, body: { classList: { add() {}, remove() {}, toggle() {} } },
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  supabase: { createClient: () => retez },
  navigator: {}, location: { href: '', search: '' },
  addEventListener: () => {},
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js',
                 'runar-character.js', 'runar-utils.js', 'runar-app.js']) {
  vm.runInContext(fs.readFileSync(DIR + f, 'utf8'), sandbox, { filename: f });
}

// ⚠️ `readerUser` i `lang` jsou v runar-app.js deklarované přes `let` — jsou tedy v lexikálním
// scope kontextu a NE jeho property. Seedovat se musí kódem uvnitř vm; přiřazení zvenčí
// (`sandbox.readerUser = …`) vytvoří stíněnou property a test by měřil jinou proměnnou.
// (Přesně na tohle první verze téhle kontroly naletěla a hlásila falešný FAIL.)
function stav(pred, jazyk) {
  vm.runInContext('readerUser = ' + JSON.stringify(pred) + '; lang = ' + JSON.stringify(jazyk) + ';', sandbox);
  vm.runInContext('buildPills()', sandbox);
  return JSON.parse(vm.runInContext('JSON.stringify(readerUser)', sandbox));
}

const PRAZDNO = { area: '', seeking: '', intention: '' };
const PRIPADY = [
  ['popisky EN → přepnuto do IS', { area: 'Career & Creativity', seeking: 'Clarity', intention: 'Decision ahead' },
    'is', { area: 'Starf & Sköpun', seeking: 'Skýrleiki', intention: 'Ákvörðun framundan' }],
  ['popisek IS → přepnuto do EN', { area: 'Vegamót & Ákvarðanir', seeking: '', intention: '' },
    'en', { area: 'Crossroads & Decisions' }],
  ['už ve správném jazyce (idempotence)', { area: 'Inner Growth', seeking: '', intention: '' },
    'en', { area: 'Inner Growth' }],
  ['prázdná volba zůstane prázdná', PRAZDNO, 'is', PRAZDNO],
  // 'spread' píše do DB řádku runar-reading.js a v AREAS není; kdyby ho remap přepsal na
  // náhodnou oblast, rozsypal by se filtr journalu (`e.area === 'spread'`).
  ['hodnota mimo seznam se NESAHÁ', { area: 'spread', seeking: '', intention: '' }, 'is', { area: 'spread' }],
];

let chyb = 0;
for (const [popis, pred, jazyk, ceka] of PRIPADY) {
  const po = stav(pred, jazyk);
  const spatne = Object.keys(ceka).filter(k => po[k] !== ceka[k]);
  if (spatne.length) {
    chyb++;
    console.log('  ✗ ' + popis);
    spatne.forEach(k => console.log('      ' + k + ': čekáno ' + JSON.stringify(ceka[k])
      + ', dostal ' + JSON.stringify(po[k])));
  } else {
    console.log('  ✓ ' + popis);
  }
}

if (chyb) {
  console.log('\nFAIL — ' + chyb + ' z ' + PRIPADY.length + ' stavů nedrží volbu přes přepnutí jazyka.');
  process.exit(1);
}
console.log('\nOK — volba přežije přepnutí jazyka ve všech ' + PRIPADY.length + ' stavech.');
