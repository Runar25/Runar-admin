// ═══════════════════════════════════════════════════════
// RÚNAR · test_lever_maps.js — mapy pák jsou indexované POŘADÍM. Hlídat.
//
// `_domainContext` (AREAS) i `_registerContext` (SEEKS) hledají hodnotu přes `indexOf`
// a tím indexem sáhnou do vlastního pole vět. Funguje to — dokud někdo pole nepřeskládá
// nebo nepřidá položku doprostřed. Pak dostane KAŽDÉ čtení cizí instrukci a **nic nespadne**:
// prompt se postaví, model odpoví, čtení vypadá v pořádku. Jen je celý den o něčem jiném.
//
// ⭐ Věty to hlídají samy: každá svou hodnotu JMENUJE („The reading is for Career & Creativity…",
// „Leitandinn biður um skýrleika…"). Stačí tedy ověřit, že věta pro hodnotu i o hodnotě i
// skutečně mluví. Přeskládání seznamu tím okamžitě propadne.
//
// Vzniklo 2026-08-16 spolu s přepisem `_domainContext` na osm vlastních vět. Do té doby měl
// tutéž expozici `_registerContext` a nehlídal ji nikdo.
//
//   node scripts/utils/test_lever_maps.js
// ═══════════════════════════════════════════════════════
const fs = require('fs'), vm = require('vm'), path = require('path');

const D = path.resolve(__dirname, '../../v2') + '/';
const S = { console };
S.window = S; S.globalThis = S;
S.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
S.document = { getElementById: () => null };
vm.createContext(S);
// Jeden spojeny skript — `const AREAS/SEEKS` se mezi volanimi vm.runInContext NESDILI.
vm.runInContext(
  ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js']
    .map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n') +
  '\n;globalThis.__AREAS = AREAS; globalThis.__SEEKS = SEEKS;' +
  '\n;globalThis.__dom = _domainContext; globalThis.__reg = _registerContext;', S);

let bad = 0;
const fail = (m) => { console.log('  ✘ ' + m); bad++; };

// Islandske nazvy se ve vete SKLONUJI ("Tilgangur" -> "fyrir Tilgang"), takze se porovnava
// zacatek prvniho slova, ne cely retezec. EN se porovnava cele, bez ohledu na velikost pismen.
function stem(label) { return label.split(/[ &]/)[0].slice(0, 5).toLowerCase(); }

function checkMap(name, values, fn, lang, whole) {
  const seen = new Map();
  values.forEach((v, i) => {
    const txt = String(fn(v, lang) || '');
    if (!txt) { fail(name + ' [' + i + '] "' + v + '" -> prázdná věta'); return; }
    const needle = whole ? v.toLowerCase() : stem(v);
    if (txt.toLowerCase().indexOf(needle) === -1)
      fail(name + ' [' + i + '] "' + v + '" -> věta o té hodnotě NEMLUVÍ (přeskládaný seznam?)');
    if (seen.has(txt)) fail(name + ' [' + i + '] "' + v + '" má TOTOŽNOU větu jako "' + seen.get(txt) + '"');
    seen.set(txt, v);
  });
}

console.log('\n─── mapy pák (věta musí mluvit o SVÉ hodnotě) ───');
checkMap('AREAS.en', S.__AREAS.en, S.__dom, 'en', true);
checkMap('AREAS.is', S.__AREAS.is, S.__dom, 'is', false);
checkMap('SEEKS.en', S.__SEEKS.en, S.__reg, 'en', true);
checkMap('SEEKS.is', S.__SEEKS.is, S.__reg, 'is', false);
if (!bad) console.log('  ✔ ' + (S.__AREAS.en.length + S.__SEEKS.en.length) * 2 + ' párů hodnota→věta sedí, žádná věta se neopakuje');

// ⚠️ Kontrola, ktera nikdy neselze, projde stejne tise jako spravna. Tady se schvalne
// PRESKLADA seznam a overi se, ze to tataz logika ZACHYTI.
console.log('\n─── kontrola testu: přeskládaný seznam MUSÍ propadnout ───');
const shifted = S.__AREAS.en.slice(1).concat(S.__AREAS.en[0]);   // posun o jedna
let caught = 0;
shifted.forEach((v, i) => {
  const txt = String(S.__dom(S.__AREAS.en[i], 'en') || '');
  if (txt.toLowerCase().indexOf(v.toLowerCase()) === -1) caught++;
});
if (caught === shifted.length) console.log('  ✔ posun o jednu pozici test rozpozná u všech ' + caught + ' hodnot');
else { console.log('  ✘ SELHALO: posun rozpoznán jen u ' + caught + '/' + shifted.length + ' — test by chybu propustil'); bad++; }

// Zachytna sit: neznama oblast NESMI zustat bez instrukce.
console.log('\n─── záchytná síť pro neznámou oblast ───');
for (const probe of ['spread', 'Nějaká nová oblast']) {
  for (const l of ['en', 'is']) {
    if (!String(S.__dom(probe, l) || '').trim()) fail('neznámá oblast "' + probe + '" (' + l + ') -> PRÁZDNO');
  }
}
if (!bad) console.log('  ✔ neznámá oblast dostane obecnou větu, ne prázdno');

console.log(bad ? '\n✘ ' + bad + ' problém(ů)\n' : '\nOK — mapy pák sedí a test svoji chybu chytit umí\n');
process.exit(bad ? 1 : 0);
