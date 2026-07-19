// Co uživatel UŽ MÁ, se nesmí schovat za kontrolu tieru.
//
// 2026-07-19, nahlásil owner na vlastním účtu: životní runa se vygenerovala,
// zobrazila — a při dalším překreslení Tree tabu zmizela a vrátil se teaser
// s tlačítkem „REVEAL". Příčina byla čistě POŘADÍ: v `updateTreeTab()` se
// větev podle tieru (`if (!isStdPlus) { … return; }`) vracela DŘÍV, než se kód
// vůbec zeptal `if (_lifeRuneText)`. Rune Seeker tedy svou (tehdy zaplacenou)
// životní runu neuviděl nikdy.
//
// Třída chyby: **vlastnictví se testuje až za bránou oprávnění.** Tier má
// rozhodovat o tom, jak se věc NABÍZÍ, ne jestli hotovou věc uživatel uvidí.
// Nic to nespadne, nic to nezaloguje — obsah prostě zmizí.
//
// Kontrola je ZÁMĚRNĚ ÚZKÁ: hlídá tuhle jednu funkci a tuhle jednu dvojici.
// Obecné „vlastnictví před oprávněním" staticky poznat neumím a předstírat,
// že ano, by bylo horší než nekontrolovat nic.
//
//   node scripts/verify_owned_before_tier.js
const fs = require('fs');
const SRC = 'C:/Users/zkuku/Downloads/Runar-admin/v2/runar-tree.js';

const s = fs.readFileSync(SRC, 'utf8');
const start = s.indexOf('function updateTreeTab()');
if (start < 0) {
  console.log('FAIL  updateTreeTab() v runar-tree.js není — přejmenovalo se?');
  process.exit(1);
}
// tělo funkce = od hlavičky po další deklaraci na začátku řádku
const rest = s.slice(start + 1);
const nextFn = rest.search(/\nfunction \w+/);
const body = nextFn < 0 ? rest : rest.slice(0, nextFn);

const owned = body.indexOf('_lifeRuneText');
const tier  = body.indexOf('isStdPlus');

if (owned < 0 || tier < 0) {
  console.log('FAIL  v updateTreeTab() chybí ' +
    (owned < 0 ? '`_lifeRuneText`' : '`isStdPlus`') + ' — změnil se tvar funkce?');
  process.exit(1);
}

// `isStdPlus` se nahoře DEKLARUJE, to je v pořádku; jde o jeho první POUŽITÍ ve větvení.
const branch = body.search(/if\s*\(\s*!?\s*isStdPlus/);
if (branch < 0) {
  console.log('OK    updateTreeTab(): žádné větvení podle tieru — nemá co předběhnout.');
  process.exit(0);
}

if (owned < branch) {
  console.log('OK    updateTreeTab(): hotové čtení se testuje PŘED větvením podle tieru.');
  process.exit(0);
}

console.log('FAIL  runar-tree.js  updateTreeTab(): větvení podle tieru je PŘED testem `_lifeRuneText`.');
console.log('      Rune Seeker po vygenerování svou životní runu neuvidí — vrátí se mu teaser.');
console.log('      Tier smí rozhodovat, jak se čtení NABÍZÍ, ne jestli hotové čtení uvidí.');
process.exit(1);
