// ═══════════════════════════════════════════════════════
// RÚNAR · test_lever_maps.js — mapy pák jsou indexované POŘADÍM. Hlídat.
//
// `_domainContext` (AREAS) i `_registerContext` (SEEKS) hledají hodnotu přes `indexOf`
// a tím indexem sáhnou do vlastního pole vět. Funguje to — dokud někdo pole nepřeskládá
// nebo nepřidá položku doprostřed. Pak dostane KAŽDÉ čtení cizí instrukci a **nic nespadne**:
// prompt se postaví, model odpoví, čtení vypadá v pořádku. Jen je celý den o něčem jiném.
//
// ⭐ AREAS: věta svou oblast JMENUJE („The reading is for Career & Creativity…") — stačí ověřit, že věta pro hodnotu i
// o hodnotě i mluví. Přeskládání seznamu tím okamžitě propadne.
// ⭐ SEEKS (od 2026-09-26): věta rejstříku své jméno NENESE — „The seeker asks for clarity —" bylo 2026-09-08 záměrně
// odebráno (model hlídané slovo vracel; memory prompt-nepojmenuj-co-hned-zakazes). Test na to 18 dní tiše padal 9/10 a nebyl
// ve smoke. Kotva je proto VÝZNAM věty — to, co rejstřík žádá (RUNAR_DESIGN, tabulka mostu). Přeskládá-li se seznam vět
// proti SEEKS, kotva nesedí.
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
// kotva = význam věty rejstříku; klíč = hodnota SEEKS.en (IS se páruje přes TENTÝŽ index, pole jdou paralelně)
const SEEK_KOTVA = {
  'General Guidance':       { en: 'let the rune lead',          is: 'leiða hvert sem hún vill' },
  'Clarity':                { en: 'into focus',                 is: 'skýrt fram' },
  'Confirmation':           { en: 'neither confirm nor refute', is: 'hvorki staðfestir né hrekur' },
  'Insight into Challenge': { en: 'friction',                   is: 'núninginn' },
  'Reflection':             { en: 'mirror',                     is: 'spegil' },
};
for (const l of ['en', 'is']) {
  const seen = new Map();
  S.__SEEKS[l].forEach((v, i) => {
    const txt = String(S.__reg(v, l) || '');
    const k = SEEK_KOTVA[S.__SEEKS.en[i]];
    if (!k) { fail('SEEKS.' + l + ' [' + i + '] "' + v + '" -> pro rejstřík chybí kotva v testu (přibyl nový?)'); return; }
    if (!txt) { fail('SEEKS.' + l + ' [' + i + '] "' + v + '" -> prázdná věta'); return; }
    if (txt.toLowerCase().indexOf(k[l].toLowerCase()) === -1) fail('SEEKS.' + l + ' [' + i + '] "' + v + '" -> věta nenese význam svého rejstříku (přeskládaný seznam?)');
    if (seen.has(txt)) fail('SEEKS.' + l + ' [' + i + '] "' + v + '" má TOTOŽNOU větu jako "' + seen.get(txt) + '"');
    seen.set(txt, v);
  });
}
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
// totéž pro SEEKS: posunutý seznam rejstříků musí kotvu minout u každé hodnoty
const sh = S.__SEEKS.en.slice(1).concat(S.__SEEKS.en[0]);
let cs = 0;
sh.forEach((v, i) => { const txt = String(S.__reg(S.__SEEKS.en[i], 'en') || '').toLowerCase(); if (txt.indexOf(SEEK_KOTVA[v].en) === -1) cs++; });
if (cs === sh.length) console.log('  ✔ posun rejstříků o jednu pozici test rozpozná u všech ' + cs + ' hodnot');
else { console.log('  ✘ SELHALO: posun rejstříků rozpoznán jen u ' + cs + '/' + sh.length); bad++; }

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
