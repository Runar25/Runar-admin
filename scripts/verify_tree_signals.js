// §19 seed-and-assert: signály z DB řádku musí DOJET do stromu.
//
// Guard proti 2026-07-18. Osa B celého umístění (§3 RUNAR_TREE.md — dovnitř/ven = strana)
// byla pro KAŽDÝ spread mrtvá, a nic to neohlásilo: klient u spreadu ukládá do `area`
// literální marker 'spread' a skutečnou oblast života stranou do `aol`
// (runar-reading.js:763 — `area: 'spread', aol: u.area || null`), proxy zapisuje OBA
// sloupce (claude-proxy/index.ts:373-374), ale `readingsToTreeLog` četla jen `row.area`,
// marker poznala, vrátila null — a `row.aol` se nikdy nepodívala. Data v DB ležela,
// strom je zahodil. Žádná chyba, žádný pád, jen tiše chybějící signál — proto kontrola
// na VÝSLEDKU (dojela oblast?), ne na tvaru kódu (existuje ten řádek?).
//
// Nejvíc to bralo zrovna ta nejvýznamnější čtení: Norny (zakládací rituál) a Yggdrasil.
//
//   node scripts/verify_tree_signals.js
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';

const sandbox = {
  Math, JSON, Date, console,
  setTimeout: () => 0, clearTimeout: () => {},
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;

// jen to, co readingsToTreeLog potřebuje: RUNES (glyf → element) + sama funkce
let code = 'var lang="en"; var currentUser=null; var readerUser={}; var userTier="premium"; var sb=null;\n';
for (const f of ['runar-runes.js', 'runar-tree.js']) {
  code += '\n/* ' + f + ' */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
}

// SEED: REÁLNÉ hodnoty ze zdroje, ne vymyšlené.
// Klient ukládá to, co uživatel naklikal = LOKALIZOVANÝ POPISEK z AREAS/INTENTIONS
// (runar-app.js:1058 `readerUser.area = label`), ne slug. Fixture se slugem ('career')
// projde zeleně a přitom neotestuje nic — přesně ta past, před kterou varuje hlavička
// verify_contract_wiring.js. Proto se hodnoty TAHAJÍ z RUNES/AREAS, aby nemohly odrejvovat.
// Glyfy taky reálné — vymyšlený glyf by fixture tiše vrátil prázdný.
code += `
var _g = RUNES.filter(function(r){ return r.g && r.g.charCodeAt(0) >= 0x16A0; }).map(function(r){ return r.g; });
var _AREA_EN = AREAS.en[2];          // 'Career & Creativity'
var _AREA_IS = AREAS.is[0];          // 'Ást & Sambönd'  — IS user ukládá IS popisek
var _INT_EN  = INTENTIONS.en[1];     // 'Decision ahead'
var _rows = [
  { rune_name: 'Fehu', rune_glyph: _g[0], short_text: '',
    area: _AREA_IS, aol: _AREA_IS, intention: _INT_EN },
  { rune_name: 'NORNS', rune_glyph: '', short_text: _g[1] + ' ... ' + _g[2] + ' ... ' + _g[3],
    area: 'spread', aol: _AREA_EN, intention: _INT_EN },
  { rune_name: 'YGGDRASIL', rune_glyph: '', short_text: _g[4] + ' ' + _g[5],
    area: 'spread', aol: null,     intention: null },
];
var _out = readingsToTreeLog(_rows);
// Očekáváme DEKÓDOVANÝ tvar: strom mluví slugy, ne popisky, které user naklikal.
var _EXPECT = { single: 'love', spread: 'career', intention: 'skuld' };
`;

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'tree-signals-fixture' });
const out = sandbox._out;
const EX  = sandbox._EXPECT;

const fails = [];
function assert(label, cond, detail) { if (!cond) fails.push(label + (detail ? ' — ' + detail : '')); }

assert('fixture sám nic nevrátil (glyfy se nenačetly?)', out && out.length === 3,
       'dostal jsem ' + (out ? out.length : 0) + ' řádků místo 3');

if (out && out.length === 3) {
  const [single, norns, ygg] = out;

  assert('single: oblast se ztratila', single.area === EX.single, 'area=' + JSON.stringify(single.area));
  assert('single: má být 1 runa',      single.runes.length === 1);
  assert('single: spread=single',      single.spread === 'single');

  // ⭐ jádro guardu — tohle byl ten bug
  assert('SPREAD: oblast života nedojela do stromu (osa B = strana je mrtvá)',
         norns.area === EX.spread,
         'area=' + JSON.stringify(norns.area) + ' — v DB je ' + JSON.stringify(EX.spread) + ', strom to nečte');
  assert('spread: runy se nenačetly', norns.runes.length === 3, 'runes=' + norns.runes.length);
  assert('spread: typ spreadu',       norns.spread === 'norns');

  // marker je interní věc ukládání — do stromu nesmí prosáknout jako "oblast života"
  out.forEach(function (r, i) {
    assert('marker prosákl do stromu jako oblast (řádek ' + i + ')', r.area !== 'spread');
  });

  // řádek bez aol (starší data) nesmí spadnout ani vyrobit undefined
  assert('chybějící aol musí dát null, ne undefined', ygg.area === null,
         'area=' + JSON.stringify(ygg.area));

  assert('intention se ztratila', norns.intention === EX.intention);
}

// ⭐ JÁDRO: rozumí PŘIJÍMAJÍCÍ STRANA tomu, co producent posílá?
// Tohle je ta otázka, kterou nikdo nepoložil a která stála dva měsíce tichého
// stromu: lab si vymyslel vlastní slovník ('healing', 'decision'), produkce
// posílala lokalizované popisky, lookup dal undefined a obě nosné osy §3 mlčely.
// Lab byl přitom zelený — protože si testoval vlastní vokabulář sám se sebou.
// Proto se klíče čtou ZE SKUTEČNÉHO rendereru, ne z kopie v tomhle souboru.
var prod = fs.readFileSync(DIR + 'runar-tree-prod.js', 'utf8');
// Klíče se čtou BEZ REGEXU — schválně. Escapování zpětných lomítek se cestou přes
// nástroje ztrácí (2026-07-19 mě to dnes chytlo třikrát: jednou v smoke.py, dvakrát
// tady) a rozbitý regex tiše nenajde NIC, což je u kontroly nejhorší možný výsledek:
// vypadá to, že mapa neexistuje, místo aby se porovnal obsah. Prosté hledání závorek
// je hloupé, ale nemá co pokazit.
function keysOf(name) {
  var i = prod.indexOf('var ' + name);
  if (i < 0) { fails.push('v runar-tree-prod.js nenalezena mapa ' + name + ' — změnil se tvar?'); return []; }
  var a = prod.indexOf('{', i), b = prod.indexOf('}', a);
  if (a < 0 || b < 0) { fails.push('mapa ' + name + ' nemá závorky — změnil se tvar?'); return []; }
  return prod.slice(a + 1, b).split(',').map(function (part) {
    return part.split(':')[0].trim();
  }).filter(Boolean);
}
var AREA_KEYS = keysOf('AREA_LAT'), INT_KEYS = keysOf('INT_AXIS');

(out || []).forEach(function (r, i) {
  if (r.area != null && AREA_KEYS.indexOf(r.area) === -1) {
    fails.push('renderer neumí přečíst area ' + JSON.stringify(r.area) + ' (řádek ' + i + ') — '
      + 'AREA_LAT zná jen [' + AREA_KEYS.join(', ') + '] → osa B (strana) mlčí');
  }
  if (r.intention != null && INT_KEYS.indexOf(r.intention) === -1) {
    fails.push('renderer neumí přečíst intention ' + JSON.stringify(r.intention) + ' (řádek ' + i + ') — '
      + 'INT_AXIS zná jen [' + INT_KEYS.join(', ') + '] → osa A (výška) mlčí');
  }
});

// Anti-drift: slugová tabulka stromu musí mít tolik položek co sdílené AREAS.
// Kdyby přibyla 9. oblast života, dekódování by na ni tiše vracelo null.
// `const` deklarace se v vm kontextu NEobjeví jako property sandboxu (jen `var`),
// takže sandbox.AREAS je undefined a porovnání null===null by prošlo NAPRÁZDNO.
// Čte se proto výrazem uvnitř kontextu. (Nalezeno na sobě 2026-07-19 — tichá zelená.)
function inCtx(expr) { try { return vm.runInContext(expr, sandbox); } catch (e) { return null; } }
var nAreas = inCtx('typeof AREAS !== "undefined" ? AREAS.en.length : null');
var nSlugs = inCtx('typeof TREE_AREA_SLUG !== "undefined" ? TREE_AREA_SLUG.length : null');
assert('TREE_AREA_SLUG nenalezen nebo se rozešel s AREAS (přibyla oblast života?)',
       nAreas !== null && nAreas === nSlugs,
       'AREAS.en=' + nAreas + ' vs TREE_AREA_SLUG=' + nSlugs);

// ⚠️ CO TENHLE GUARD ZÁMĚRNĚ NEHLÍDÁ (2026-07-18, čeká na rozhodnutí ownera — §19.2:
// filtrovaný signál musí být VIDĚT, ne zahozený). Hlídá jen, že hodnota dojede z DB do
// logu. NEhlídá, že ji renderer umí PŘEČÍST — a dnes neumí:
//   · runar-tree-prod.js:41 `AREA_LAT` je klíčované slugy (love/career/…), ale klient
//     ukládá lokalizovaný popisek („Career & Creativity" / „Ást & Sambönd") → undefined
//     → osa B nepřispívá nic. Totéž `INT_AXIS` (:40) vs INTENTIONS.en/is → osa A.
//     Dekódovací tabulky UŽ EXISTUJÍ (AREAS.norns, SEEKS.norns, INTENTIONS.norns
//     v runar-runes.js, index-paralelní) a character.js:488 je správně používá.
//   · Blank/Óðinn má glyf '○' (mimo 0x16A0–0x16FF) → runar-tree.js:35 zahodí CELÉ čtení.
// Až se tohle zapojí, přibude sem assert na DEKÓDOVANOU hodnotu (slug/osa), ne na popisek.

if (fails.length) {
  console.log('FAIL  signál z DB nedojel do stromu:');
  fails.forEach(f => console.log('      · ' + f));
  process.exit(1);
}
console.log('OK    tree signals: area (i přes `spread` marker) · intention · runy · typ spreadu dojely');
